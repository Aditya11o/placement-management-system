const mongoose = require('mongoose');

/**
 * NotificationPrefs — per-user notification preference store.
 *
 * One document per user (upserted on first access).
 * Each preference has two independent toggles:
 *   - `email`  : whether an email is queued for this event
 *   - `push`   : whether a real-time WebSocket push fires for this event
 *
 * Event types map to the event names used in `notifyDispatcher.js`:
 *   - application_status_update  → student's application status changed
 *   - interview_scheduled        → student has been scheduled for an interview
 *   - interview_canceled         → student's interview was canceled
 *   - new_job_posted             → a new job is available (role broadcast)
 *   - new_announcement           → admin posted an announcement (global broadcast)
 *   - new_application_received   → recruiter received a new application
 *   - weekly_digest              → weekly placement summary email (cron-driven)
 */
const prefSchema = new mongoose.Schema({
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
}, { _id: false });

// Helper to embed prefSchema as a nested sub-document with defaults
const prefField = () => ({ type: prefSchema, default: () => ({}) });

const notificationPrefsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel',
        unique: true,
        index: true
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Student', 'Recruiter', 'Admin']
    },

    // ── Student-specific events ───────────────────────────────────────────────
    application_status_update: prefField(),
    interview_scheduled: prefField(),
    interview_canceled: prefField(),
    new_job_posted: { type: Boolean, default: true },       // push-only
    new_announcement: { type: Boolean, default: true },       // push-only

    // ── Recruiter-specific events ─────────────────────────────────────────────
    new_application_received: { type: Boolean, default: true },       // push-only

    // ── Shared ────────────────────────────────────────────────────────────────
    weekly_digest: { type: Boolean, default: true },        // email-only
    emailFrequency: {
        type: String,
        enum: ['IMMEDIATE', 'DAILY'],
        default: 'IMMEDIATE',
        index: true
    },
    quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' }, // 24h format
        end: { type: String, default: '08:00' }
    }
}, {
    timestamps: true
});

// Default sub-document values (if field is undefined, these kick in)
notificationPrefsSchema.set('toJSON', { getters: true });

/**
 * Static helper — fetch or auto-create a user's prefs document.
 * Returns the prefs with all defaults applied.
 */
notificationPrefsSchema.statics.getOrCreate = async function (userId, userModel) {
    let prefs = await this.findOne({ userId });
    if (!prefs) {
        prefs = await this.create({ userId, userModel });
    }
    return prefs;
};

/**
 * Helper — check a simple boolean toggle (push-only events).
 */
notificationPrefsSchema.methods.allows = function (eventName) {
    // Nested email/push objects
    const pref = this[eventName];
    if (pref === undefined || pref === null) return true; // default ON
    if (typeof pref === 'boolean') return pref;
    return true;
};

notificationPrefsSchema.methods.allowsEmail = function (eventName) {
    const pref = this[eventName];
    if (pref === undefined || pref === null) return true;
    if (typeof pref === 'object') return pref.email !== false;
    if (typeof pref === 'boolean') return pref;
    return true;
};

notificationPrefsSchema.methods.allowsPush = function (eventName) {
    const pref = this[eventName];
    if (pref === undefined || pref === null) return true;
    if (typeof pref === 'object') return pref.push !== false;
    if (typeof pref === 'boolean') return pref;
    return true;
};

module.exports = mongoose.model('NotificationPrefs', notificationPrefsSchema);
