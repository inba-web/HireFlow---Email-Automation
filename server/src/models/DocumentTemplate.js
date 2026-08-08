import mongoose from 'mongoose';

const documentTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  type: {
    type: String,
    enum: [
      'offer_letter',
      'selection_letter',
      'internship_certificate',
      'experience_certificate',
      'joining_letter',
      'rejection_letter',
      'custom',
    ],
    default: 'offer_letter',
    index: true,
  },
  description: {
    type: String,
    default: '',
  },
  htmlTemplate: {
    type: String,
    required: true,
  },
  cssStyles: {
    type: String,
    default: '',
  },
  orientation: {
    type: String,
    enum: ['portrait', 'landscape'],
    default: 'portrait',
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

export const DocumentTemplate = mongoose.models.DocumentTemplate || mongoose.model('DocumentTemplate', documentTemplateSchema);
