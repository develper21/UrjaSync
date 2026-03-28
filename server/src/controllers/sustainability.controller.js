import mongoose from 'mongoose';
import Sustainability from '../models/Sustainability.model.js';
import EnergyReading from '../models/EnergyReading.model.js';

const defaultGoals = [
  { type: 'co2_reduction', target: 30, current: 0, unit: '%', progress: 0 },
  { type: 'solar_usage', target: 50, current: 0, unit: '%', progress: 0 },
  { type: 'zero_waste', target: 20, current: 0, unit: 'days', progress: 0 }
];

export const getSustainabilityStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Calculate carbon saved this year
    const stats = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: yearStart }
        }
      },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: '$usage' },
          solarGeneration: { $sum: '$solarGeneration' }
        }
      }
    ]);

    const totalUsage = stats[0]?.totalUsage || 0;
    const solarGeneration = stats[0]?.solarGeneration || 0;
    
    // CO2 emission factor: 0.7 kg per kWh
    // Solar saves 0.95 kg CO2 per kWh (avoided grid emissions)
    const carbonSaved = (solarGeneration * 0.95) / 1000; // tons
    const treesEquivalent = Math.round(carbonSaved * 45); // ~45 trees per ton CO2
    const waterSaved = Math.round(solarGeneration * 180); // ~180L water per kWh solar

    // Update or create sustainability record
    let sustainability = await Sustainability.findOne({ userId });
    if (!sustainability) {
      sustainability = await Sustainability.create({
        userId,
        goals: defaultGoals,
        carbonStats: { savedThisYear: carbonSaved, treesEquivalent, waterSaved }
      });
    } else {
      sustainability.carbonStats = { savedThisYear: carbonSaved, treesEquivalent, waterSaved };
      await sustainability.save();
    }

    res.json({
      success: true,
      data: {
        carbonSaved: carbonSaved.toFixed(2),
        treesEquivalent,
        waterSaved,
        solarPercentage: totalUsage > 0 ? ((solarGeneration / totalUsage) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getGoals = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let sustainability = await Sustainability.findOne({ userId });
    if (!sustainability) {
      sustainability = await Sustainability.create({
        userId,
        goals: defaultGoals
      });
    }

    res.json({
      success: true,
      data: { goals: sustainability.goals }
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { current } = req.body;
    const userId = req.user._id;

    const sustainability = await Sustainability.findOne({ userId });
    if (!sustainability) {
      return res.status(404).json({
        success: false,
        message: 'Sustainability goals not found'
      });
    }

    const goal = sustainability.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    goal.current = current;
    goal.progress = Math.min(100, Math.round((current / goal.target) * 100));
    await sustainability.save();

    res.json({
      success: true,
      message: 'Goal updated',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

export const getEmissions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { months = 6 } = req.query;

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - parseInt(months));

    const emissions = await EnergyReading.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          deviceId: null,
          timestamp: { $gte: fromDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
          usage: { $sum: '$usage' },
          solar: { $sum: '$solarGeneration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const data = emissions.map(e => {
      const [year, month] = e._id.split('-');
      const totalEmissions = e.usage * 0.7; // kg CO2
      const avoidedEmissions = e.solar * 0.95; // kg CO2 avoided
      
      return {
        month: monthNames[parseInt(month) - 1],
        year: parseInt(year),
        emissions: Math.round(totalEmissions - avoidedEmissions),
        totalUsage: e.usage,
        solarGeneration: e.solar
      };
    });

    res.json({
      success: true,
      data: { emissions: data }
    });
  } catch (error) {
    next(error);
  }
};

export const initSustainability = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let sustainability = await Sustainability.findOne({ userId });
    if (!sustainability) {
      sustainability = await Sustainability.create({
        userId,
        goals: defaultGoals,
        carbonStats: { savedThisYear: 0, treesEquivalent: 0, waterSaved: 0 }
      });
    }

    res.json({
      success: true,
      data: { sustainability }
    });
  } catch (error) {
    next(error);
  }
};
