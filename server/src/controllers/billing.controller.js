import mongoose from 'mongoose';
import Bill from '../models/Bill.model.js';
import EnergyReading from '../models/EnergyReading.model.js';
import User from '../models/User.model.js';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getCurrentBill = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    let bill = await Bill.findOne({
      userId,
      month: currentMonth,
      year: currentYear
    });

    // If no bill exists, calculate from readings
    if (!bill) {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats = await EnergyReading.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            deviceId: null,
            timestamp: { $gte: monthStart }
          }
        },
        {
          $group: {
            _id: null,
            units: { $sum: '$usage' },
            cost: { $sum: '$cost' },
            solar: { $sum: '$solarGeneration' }
          }
        }
      ]);

      const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
      
      bill = {
        month: currentMonth,
        year: currentYear,
        amount: stats[0]?.cost || 0,
        unitsConsumed: stats[0]?.units || 0,
        solarCredits: stats[0]?.solar || 0,
        status: 'pending',
        dueDate,
        savings: 0
      };
    }

    // Get user's monthly budget
    const user = await User.findById(userId);
    const budget = user?.settings?.monthlyBudget || 5000;
    const percentage = budget > 0 ? Math.min((bill.amount / budget) * 100, 100) : 0;

    res.json({
      success: true,
      data: {
        bill,
        budget: {
          limit: budget,
          used: bill.amount,
          percentage: percentage.toFixed(1),
          remaining: Math.max(0, budget - bill.amount)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBillHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 12 } = req.query;

    const bills = await Bill.find({ userId })
      .sort({ year: -1, month: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: bills.length,
      data: { bills }
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const budget = user?.settings?.monthlyBudget || 5000;
    const threshold = user?.settings?.alertThreshold || 80;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          spent: { $sum: '$cost' }
        }
      }
    ]);

    const spent = stats[0]?.spent || 0;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const remaining = Math.max(0, budget - spent);
    const projectedMonthly = (spent / now.getDate()) * 30;

    res.json({
      success: true,
      data: {
        budget,
        spent: spent.toFixed(2),
        remaining: remaining.toFixed(2),
        percentage: percentage.toFixed(1),
        threshold,
        alertTriggered: percentage >= threshold,
        projectedMonthly: projectedMonthly.toFixed(2),
        daysElapsed: now.getDate(),
        daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSavings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    
    // Get current and previous month data
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentStats, prevStats] = await Promise.all([
      EnergyReading.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), deviceId: null, timestamp: { $gte: currentMonthStart } } },
        { $group: { _id: null, cost: { $sum: '$cost' }, usage: { $sum: '$usage' } } }
      ]),
      EnergyReading.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), deviceId: null, timestamp: { $gte: prevMonthStart, $lt: prevMonthEnd } } },
        { $group: { _id: null, cost: { $sum: '$cost' }, usage: { $sum: '$usage' } } }
      ])
    ]);

    const currentCost = currentStats[0]?.cost || 0;
    const prevCost = prevStats[0]?.cost || 0;
    
    const savings = prevCost - currentCost;
    const savingsPercentage = prevCost > 0 ? ((savings / prevCost) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        currentMonth: {
          cost: currentCost.toFixed(2),
          usage: (currentStats[0]?.usage || 0).toFixed(2)
        },
        previousMonth: {
          cost: prevCost.toFixed(2),
          usage: (prevStats[0]?.usage || 0).toFixed(2)
        },
        savings: savings.toFixed(2),
        savingsPercentage: parseFloat(savingsPercentage),
        isSaving: savings > 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateBill = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const userId = req.user._id;

    // Check if bill already exists
    const existing = await Bill.findOne({ userId, month, year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Bill already exists for this month'
      });
    }

    const monthIndex = monthNames.indexOf(month);
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);

    const stats = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: null,
          units: { $sum: '$usage' },
          cost: { $sum: '$cost' },
          solar: { $sum: '$solarGeneration' }
        }
      }
    ]);

    // Calculate previous month for savings comparison
    const prevMonthStart = new Date(year, monthIndex - 1, 1);
    const prevMonthEnd = new Date(year, monthIndex, 0);
    
    const prevStats = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: prevMonthStart, $lt: prevMonthEnd }
        }
      },
      { $group: { _id: null, cost: { $sum: '$cost' } } }
    ]);

    const amount = stats[0]?.cost || 0;
    const prevAmount = prevStats[0]?.cost || 0;
    const savings = prevAmount - amount;

    const bill = await Bill.create({
      userId,
      month,
      year,
      amount,
      unitsConsumed: stats[0]?.units || 0,
      solarCredits: stats[0]?.solar || 0,
      status: 'pending',
      dueDate: new Date(year, monthIndex + 1, 15),
      savings: savings > 0 ? savings : 0
    });

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: { bill }
    });
  } catch (error) {
    next(error);
  }
};
