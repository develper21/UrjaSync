import mongoose from 'mongoose';

const tariffSlabSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Off-Peak', 'Mid-Peak', 'Peak']
  },
  timeRange: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  days: [{
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }]
}, { _id: false });

const tariffScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slabs: [tariffSlabSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const TariffSchedule = mongoose.model('TariffSchedule', tariffScheduleSchema);
export default TariffSchedule;
