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
    },
    sessionExpirationHours: {
        type: Number,
        default: 168 // 7 days
    },
    maxFailedLoginAttempts: {
        type: Number,
        default: 5
    },
    enforcePasswordComplexity: {
        type: Boolean,
        default: true
    },
    systemWebhookUrl: {
        type: String,
        default: '' // Slack or Discord Webhook URL
    },
    tier1SalaryThreshold: {
        type: Number,
        default: 1000000 // 10 LPA default
    },
    adminIpWhitelist: {
        type: [String],
        default: []
    },
    // --- Calendar & Scheduling ---
    googleCalendarApiKey: {
        type: String,
        trim: true
    },
    googleCalendarClientId: {
        type: String,
        trim: true
    },
    microsoftCalendarApiKey: {
        type: String,
        trim: true
    },
    calendarSyncEnabled: {
        type: Boolean,
        default: false
    },
    autoScheduleInterviews: {
        type: Boolean,
        default: false
    },
    faviconUrl: {
        type: String,
        default: ''
    },
    meshGradientColors: {
        type: [String],
        default: ['#6366f1', '#8b5cf6', '#d946ef', '#3b82f6'] // Indigo, Violet, Fuchsia, Blue
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);
