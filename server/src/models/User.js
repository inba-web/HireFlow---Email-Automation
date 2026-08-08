import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['Admin', 'HR Manager', 'HR Executive'],
    default: 'HR Executive',
    index: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active',
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
