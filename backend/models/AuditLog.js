const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    target_type: {
      type: String, // 'Student', 'Recruiter', 'Job', 'Application', etc.
      required: true,
    },
    target_id: {
      type: String, // ID of the affected resource
    },
    details: {
      type: String,
    },
    ip_address: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
