import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
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
  documentTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentTemplate',
    default: null,
  },
  templateName: {
    type: String,
    required: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    default: 'application/pdf',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  storagePath: {
    type: String,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
