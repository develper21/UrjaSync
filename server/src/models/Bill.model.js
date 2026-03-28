import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  unitsConsumed: {
    type: Number,
    required: true,
    min: 0
  },
  solarCredits: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date,
    default: null
  },
  savings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique bills per user per month
billSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });
billSchema.index({ userId: 1, status: 1 });

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
