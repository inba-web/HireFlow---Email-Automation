import mongoose from 'mongoose';

const emailJobSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    index: true,
  },
  idempotencyKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['Queued', 'Processing', 'Sent', 'Delivered', 'Failed', 'Retrying', 'Cancelled'],
    default: 'Queued',
    index: true,
  },
  attemptCount: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },
  scheduledFor: {
    type: Date,
    default: Date.now,
    index: true,
  },
  processedAt: {
    type: Date,
    default: null,
  },
  lastError: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export const EmailJob = mongoose.models.EmailJob || mongoose.model('EmailJob', emailJobSchema);
