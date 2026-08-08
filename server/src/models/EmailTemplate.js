import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  bodyHtml: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Offer', 'Rejection', 'Interview', 'Selection', 'Internship', 'General'],
    default: 'General',
    index: true,
  },
  variables: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    default: 'System',
  },
}, {
  timestamps: true,
});

export const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema);
