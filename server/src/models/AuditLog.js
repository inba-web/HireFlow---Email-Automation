import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    default: 'system',
    index: true,
  },
  userName: {
    type: String,
    default: 'System User',
  },
  userEmail: {
    type: String,
    default: 'system@hireflow.dev',
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  resourceType: {
    type: String,
    required: true,
    index: true,
  },
  resourceId: {
    type: String,
    default: '',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
