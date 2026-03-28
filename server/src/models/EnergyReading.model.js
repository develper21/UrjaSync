import mongoose from 'mongoose';

const energyReadingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    default: null,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  usage: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  solarGeneration: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
energyReadingSchema.index({ userId: 1, timestamp: -1 });
energyReadingSchema.index({ userId: 1, deviceId: 1, timestamp: -1 });

// TTL index to auto-delete old data after 2 years
energyReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

const EnergyReading = mongoose.model('EnergyReading', energyReadingSchema);
export default EnergyReading;
