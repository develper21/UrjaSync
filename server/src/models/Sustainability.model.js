import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['co2_reduction', 'solar_usage', 'zero_waste'],
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { _id: true });

const sustainabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  goals: [goalSchema],
  carbonStats: {
    savedThisYear: { type: Number, default: 0 },
    treesEquivalent: { type: Number, default: 0 },
    waterSaved: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const Sustainability = mongoose.model('Sustainability', sustainabilitySchema);
export default Sustainability;
