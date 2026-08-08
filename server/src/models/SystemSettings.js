import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'HireFlow Technologies Inc.',
  },
  companyEmail: {
    type: String,
    default: 'recruitment@hireflow.dev',
  },
  companyAddress: {
    type: String,
    default: '100 Silicon Valley Way, Suite 400, San Francisco, CA 94107',
  },
  companyWebsite: {
    type: String,
    default: 'https://hireflow.dev',
  },
  hrName: {
    type: String,
    default: 'Alex Rivers (Head of People)',
  },
  hrContact: {
    type: String,
    default: '+1 (555) 234-5678',
  },
  defaultSmtpFrom: {
    type: String,
    default: '"HireFlow Recruiting" <recruitment@hireflow.dev>',
  },
  rateLimitPerMinute: {
    type: Number,
    default: 60,
  },
  enableMockEmail: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);
