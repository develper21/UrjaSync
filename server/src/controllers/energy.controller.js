import mongoose from 'mongoose';
import EnergyReading from '../models/EnergyReading.model.js';
import Device from '../models/Device.model.js';

export const getRealtimeUsage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Get latest reading (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const latestReading = await EnergyReading.findOne({
      userId,
      deviceId: null,
      timestamp: { $gte: fiveMinutesAgo }
    }).sort({ timestamp: -1 });

    // Get active devices count and total power
    const activeDevices = await Device.find({
      userId,
      status: true
    });
    
    const totalPower = activeDevices.reduce((sum, d) => sum + d.powerRating, 0);

    res.json({
      success: true,
      data: {
        currentUsage: latestReading?.usage || 0,
        currentCost: latestReading?.cost || 0,
        rate: latestReading?.rate || 6,
        activeDevices: activeDevices.length,
        totalPower,
        timestamp: latestReading?.timestamp || new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayUsage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const readings = await EnergyReading.aggregate([
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
          usage: { $sum: '$usage' },
          cost: { $sum: '$cost' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for chart (fill missing hours)
    const hourlyData = [];
    for (let i = 0; i <= new Date().getHours(); i++) {
      const reading = readings.find(r => r._id === i);
      hourlyData.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        usage: reading?.usage || 0,
        cost: reading?.cost || 0
      });
    }

    res.json({
      success: true,
      data: { hourlyData }
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyUsage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const readings = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          usage: { $sum: '$usage' },
          cost: { $sum: '$cost' },
          solar: { $sum: '$solarGeneration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = readings.map(r => ({
      day: days[new Date(r._id).getDay()],
      date: r._id,
      usage: r.usage,
      cost: r.cost,
      solar: r.solar || 0
    }));

    res.json({
      success: true,
      data: { weeklyData }
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyUsage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const readings = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: yearAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
          usage: { $sum: '$usage' },
          cost: { $sum: '$cost' },
          solar: { $sum: '$solarGeneration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyData = readings.map(r => ({
      month: r._id,
      usage: r.usage,
      cost: r.cost,
      solar: r.solar || 0
    }));

    res.json({
      success: true,
      data: { monthlyData }
    });
  } catch (error) {
    next(error);
  }
};

export const getRangeData = async (req, res, next) => {
  try {
    const { from, to, deviceId } = req.query;
    const userId = req.user._id;

    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      timestamp: {}
    };

    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
    if (deviceId) filter.deviceId = new mongoose.Types.ObjectId(deviceId);
    else filter.deviceId = null;

    const readings = await EnergyReading.find(filter)
      .sort({ timestamp: -1 })
      .limit(1000);

    res.json({
      success: true,
      count: readings.length,
      data: { readings }
    });
  } catch (error) {
    next(error);
  }
};

export const addReading = async (req, res, next) => {
  try {
    const { deviceId, usage, cost, rate, solarGeneration } = req.body;
    const userId = req.user._id;

    const reading = await EnergyReading.create({
      userId,
      deviceId: deviceId || null,
      usage,
      cost,
      rate,
      solarGeneration: solarGeneration || 0
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(userId.toString()).emit('energy:update', {
      usage,
      cost,
      timestamp: reading.timestamp,
      deviceId
    });

    res.status(201).json({
      success: true,
      data: { reading }
    });
  } catch (error) {
    next(error);
  }
};
