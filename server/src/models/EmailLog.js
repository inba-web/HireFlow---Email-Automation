import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    index: true,
  },
  candidateName: {
    type: String,
    required: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null,
    index: true,
  },
  campaignName: {
    type: String,
    default: 'Direct Send',
  },
  recipient: {
    type: String,
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Queued', 'Processing', 'Sent', 'Delivered', 'Failed', 'Retrying', 'Cancelled'],
    default: 'Queued',
    index: true,
  },
  providerMessageId: {
    type: String,
    default: '',
  },
  attemptCount: {
    type: Number,
    default: 1,
  },
  sentAt: {
    type: Date,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  failedAt: {
    type: Date,
    default: null,
  },
  errorCode: {
    type: String,
    default: '',
  },
  errorMessage: {
    type: String,
    default: '',
  },
  attachments: [{
    fileName: String,
    fileType: String,
  }],
}, {
  timestamps: true,
});

emailLogSchema.index({ createdAt: -1 });

export const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);
