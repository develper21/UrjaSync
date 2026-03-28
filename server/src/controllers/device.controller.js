import Device from '../models/Device.model.js';
import EnergyReading from '../models/EnergyReading.model.js';

export const getDevices = async (req, res, next) => {
  try {
    const { room, status } = req.query;
    const filter = { userId: req.user._id };
    
    if (room) filter.room = room;
    if (status !== undefined) filter.status = status === 'true';

    const devices = await Device.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: devices.length,
      data: { devices }
    });
  } catch (error) {
    next(error);
  }
};

export const getDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: { device }
    });
  } catch (error) {
    next(error);
  }
};

export const createDevice = async (req, res, next) => {
  try {
    const { name, room, type, powerRating, icon, isSmart } = req.body;

    const device = await Device.create({
      userId: req.user._id,
      name,
      room,
      type,
      powerRating,
      icon: icon || 'Power',
      isSmart: isSmart !== undefined ? isSmart : true
    });

    res.status(201).json({
      success: true,
      message: 'Device added successfully',
      data: { device }
    });
  } catch (error) {
    next(error);
  }
};

export const updateDevice = async (req, res, next) => {
  try {
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Device updated successfully',
      data: { device }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDevice = async (req, res, next) => {
  try {
    const device = await Device.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleDevice = async (req, res, next) => {
  try {
    const { status } = req.body;

    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        status,
        lastUsed: status ? new Date() : null
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('device:status', {
      deviceId: device._id,
      status: device.status,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Device turned ${status ? 'on' : 'off'}`,
      data: { device }
    });
  } catch (error) {
    next(error);
  }
};

export const setIntensity = async (req, res, next) => {
  try {
    const { intensity } = req.body;

    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { intensity },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Intensity updated',
      data: { device }
    });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Device.distinct('room', { userId: req.user._id });

    res.json({
      success: true,
      data: { rooms: ['All', ...rooms] }
    });
  } catch (error) {
    next(error);
  }
};

export const getDeviceStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days = 7 } = req.query;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));

    const stats = await EnergyReading.aggregate([
      {
        $match: {
          userId: req.user._id,
          deviceId: new mongoose.Types.ObjectId(id),
          timestamp: { $gte: fromDate }
        }
      },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: '$usage' },
          totalCost: { $sum: '$cost' },
          avgDaily: { $avg: '$usage' },
          readings: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: { stats: stats[0] || { totalUsage: 0, totalCost: 0, avgDaily: 0, readings: 0 } }
    });
  } catch (error) {
    next(error);
  }
};
