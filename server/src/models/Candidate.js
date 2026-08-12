import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  jobRole: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  department: {
    type: String,
    default: 'Engineering',
    trim: true,
  },
  company: {
    type: String,
    default: 'Thodar Technologies',
    trim: true,
  },
  location: {
    type: String,
    default: 'Remote',
    trim: true,
  },
  salary: {
    type: String,
    default: '$85,000 / annum',
    trim: true,
  },
  joiningDate: {
    type: String,
    default: '',
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: [
      'Applied',
      'Shortlisted',
      'Interview',
      'Selected',
      'Rejected',
      'Offer Sent',
      'Offer Accepted',
      'Joined',
    ],
    default: 'Applied',
    index: true,
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
  createdBy: {
    type: String,
    default: 'System',
  },
}, {
  timestamps: true,
});

candidateSchema.index({ fullName: 'text', email: 'text', jobRole: 'text' });

export const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);
