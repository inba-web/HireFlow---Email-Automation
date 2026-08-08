import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  recipientCandidateIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  }],
  emailTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate',
    required: true,
  },
  documentTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentTemplate',
    default: null,
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Queued',
      'Processing',
      'Scheduled',
      'Completed',
      'Partially Completed',
      'Failed',
      'Cancelled',
    ],
    default: 'Draft',
    index: true,
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  stats: {
    totalRecipients: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    retrying: { type: Number, default: 0 },
  },
  createdBy: {
    type: String,
    default: 'System',
  },
  completedAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true,
});

export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
