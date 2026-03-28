import User from '../models/User.model.js';

export const getSettings = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { settings: req.user.settings }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { monthlyBudget, alertThreshold, notifications } = req.body;
    const user = req.user;

    if (monthlyBudget !== undefined) user.settings.monthlyBudget = monthlyBudget;
    if (alertThreshold !== undefined) user.settings.alertThreshold = alertThreshold;
    if (notifications) {
      Object.assign(user.settings.notifications, notifications);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: user.settings }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;
    const user = req.user;

    if (fullName) user.fullName = fullName;
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotifications = async (req, res, next) => {
  try {
    const { energyAlerts, costWarnings, deviceOffline, weeklyReports } = req.body;
    const user = req.user;

    if (energyAlerts !== undefined) user.settings.notifications.energyAlerts = energyAlerts;
    if (costWarnings !== undefined) user.settings.notifications.costWarnings = costWarnings;
    if (deviceOffline !== undefined) user.settings.notifications.deviceOffline = deviceOffline;
    if (weeklyReports !== undefined) user.settings.notifications.weeklyReports = weeklyReports;

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: { notifications: user.settings.notifications }
    });
  } catch (error) {
    next(error);
  }
};
