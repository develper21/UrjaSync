import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Device name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Device type is required'],
    enum: ['AC', 'Light', 'Fan', 'Refrigerator', 'TV', 'Heater', 'WashingMachine', 'Router', 'Other']
  },
  powerRating: {
    type: Number,
    required: [true, 'Power rating is required'],
    min: 0
  },
  icon: {
    type: String,
    default: 'Power'
  },
  status: {
    type: Boolean,
    default: false
  },
  intensity: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  isSmart: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
deviceSchema.index({ userId: 1, room: 1 });
deviceSchema.index({ userId: 1, status: 1 });

const Device = mongoose.model('Device', deviceSchema);
export default Device;
