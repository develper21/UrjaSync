import mongoose from 'mongoose';
import EnergyReading from '../models/EnergyReading.model.js';
import Device from '../models/Device.model.js';

export const getUsageTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { days = 7 } = req.query;
    
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));

    const trends = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: fromDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          usage: { $sum: '$usage' },
          cost: { $sum: '$cost' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    next(error);
  }
};

export const getCostAnalysis = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hourlyCosts = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: today }
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          cost: { $sum: '$cost' },
          usage: { $sum: '$usage' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data = hourlyCosts.map(h => ({
      time: `${h._id.toString().padStart(2, '0')}:00`,
      cost: h.cost,
      usage: h.usage
    }));

    res.json({
      success: true,
      data: { hourlyCosts: data }
    });
  } catch (error) {
    next(error);
  }
};

export const getDeviceBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const breakdown = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: { $ne: null },
          timestamp: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: '$deviceId',
          usage: { $sum: '$usage' }
        }
      }
    ]);

    // Get device details
    const deviceIds = breakdown.map(b => b._id.toString());
    const devices = await Device.find({
      _id: { $in: deviceIds },
      userId
    });

    const totalUsage = breakdown.reduce((sum, b) => sum + b.usage, 0);
    
    const deviceData = breakdown.map(b => {
      const device = devices.find(d => d._id.toString() === b._id.toString());
      return {
        name: device?.name || 'Unknown',
        type: device?.type || 'Other',
        usage: b.usage,
        percentage: totalUsage > 0 ? ((b.usage / totalUsage) * 100).toFixed(1) : 0
      };
    }).sort((a, b) => b.usage - a.usage);

    res.json({
      success: true,
      data: { 
        breakdown: deviceData,
        totalUsage
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCarbonTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const emissions = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
          usage: { $sum: '$usage' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // CO2 emission factor: ~0.7 kg CO2 per kWh (India average)
    const carbonData = emissions.map(e => ({
      month: e._id,
      emissions: Math.round(e.usage * 0.7),
      usage: e.usage
    }));

    res.json({
      success: true,
      data: { carbonData }
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    
    // Today stats
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todayStats, yesterdayStats, monthStats, activeDevices] = await Promise.all([
      EnergyReading.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), deviceId: null, timestamp: { $gte: today } } },
        { $group: { _id: null, usage: { $sum: '$usage' }, cost: { $sum: '$cost' } } }
      ]),
      EnergyReading.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), deviceId: null, timestamp: { $gte: yesterday, $lt: today } } },
        { $group: { _id: null, usage: { $sum: '$usage' }, cost: { $sum: '$cost' } } }
      ]),
      EnergyReading.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId), 
            deviceId: null, 
            timestamp: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } 
          } 
        },
        { $group: { _id: null, cost: { $sum: '$cost' } } }
      ]),
      Device.countDocuments({ userId, status: true })
    ]);

    const todayCost = todayStats[0]?.cost || 0;
    const yesterdayCost = yesterdayStats[0]?.cost || 0;
    const monthlyCost = monthStats[0]?.cost || 0;
    
    // Calculate changes
    const costChange = yesterdayCost > 0 
      ? (((todayCost - yesterdayCost) / yesterdayCost) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        currentUsage: todayStats[0]?.usage?.toFixed(2) || 0,
        todayCost: todayCost.toFixed(2),
        monthlyBill: monthlyCost.toFixed(2),
        activeDevices,
        carbonSaved: ((todayStats[0]?.usage || 0) * 0.7).toFixed(1),
        costChange: parseFloat(costChange)
      }
    });
  } catch (error) {
    next(error);
  }
};
