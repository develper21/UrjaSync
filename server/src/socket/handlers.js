import jwt from 'jsonwebtoken';
import Device from '../models/Device.model.js';
import EnergyReading from '../models/EnergyReading.model.js';
import User from '../models/User.model.js';

export const setupSocketHandlers = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id, 'User:', socket.userId);
    
    // Join user-specific room for targeted updates
    socket.join(socket.userId);

    // Handle device control from client
    socket.on('device:control', async (data) => {
      try {
        const { deviceId, action, value } = data;
        
        const device = await Device.findOne({
          _id: deviceId,
          userId: socket.userId
        });

        if (!device) {
          socket.emit('error', { message: 'Device not found' });
          return;
        }

        if (action === 'toggle') {
          device.status = value;
          device.lastUsed = value ? new Date() : null;
        } else if (action === 'intensity') {
          device.intensity = value;
        }

        await device.save();

        // Broadcast to all user's connected devices
        io.to(socket.userId).emit('device:status', {
          deviceId: device._id,
          status: device.status,
          intensity: device.intensity,
          timestamp: new Date()
        });

        // Acknowledge to sender
        socket.emit('device:control:ack', {
          success: true,
          deviceId,
          action
        });
      } catch (error) {
        console.error('Socket device control error:', error);
        socket.emit('error', { message: 'Failed to control device' });
      }
    });

    // Subscribe to real-time energy updates
    socket.on('energy:subscribe', () => {
      socket.join(`energy:${socket.userId}`);
      socket.emit('energy:subscribed', { success: true });
    });

    // Unsubscribe from energy updates
    socket.on('energy:unsubscribe', () => {
      socket.leave(`energy:${socket.userId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });

  return io;
};

// Helper function to broadcast energy updates
export const broadcastEnergyUpdate = (io, userId, data) => {
  io.to(`energy:${userId}`).to(userId).emit('energy:update', {
    ...data,
    timestamp: new Date()
  });
};

// Helper function to broadcast alerts
export const broadcastAlert = (io, userId, type, message) => {
  io.to(userId).emit('alert', {
    type,
    message,
    timestamp: new Date()
  });
};
