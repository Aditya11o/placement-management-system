const mongoose = require('mongoose');

const GlobalSettingsSchema = new mongoose.Schema({
    // Only one document should exist. We use a static ID to enforce this.
    singletonId: {
        type: String,
        default: 'nexus_settings',
        unique: true
    },
    allowStudentRegistration: {
        type: Boolean,
        default: true
    },
    allowRecruiterRegistration: {
        type: Boolean,
        default: true
    },
    requireApprovalForStudents: {
        type: Boolean,
        default: false
    },
    requireApprovalForRecruiters: {
        type: Boolean,
        default: true
    },
    emailNotifications: {
        type: Boolean,
        default: true
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    logoUrl: {
        type: String,
        default: ''
    },
    primaryColor: {
        type: String,
        default: '#4f46e5' // Tailwind indigo-600
    },
    institutionName: {
        type: String,
        default: 'Nexus'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);
