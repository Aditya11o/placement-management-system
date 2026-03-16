const { google } = require('googleapis');
const config = require('../config/config');
const logger = require('./logger');

const oauth2Client = new google.auth.OAuth2(
    config.get('google_oauth.client_id'),
    config.get('google_oauth.client_secret'),
    config.get('google_oauth.redirect_uri')
);

/**
 * Get Google Auth URL for recruiters
 */
exports.getAuthUrl = () => {
    const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent' // Force refresh token
    });
};

/**
 * Get tokens from code
 */
exports.getTokens = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

/**
 * Create a calendar event
 */
exports.createEvent = async (tokens, eventDetails) => {
    try {
        oauth2Client.setCredentials(tokens);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: eventDetails.summary,
            location: eventDetails.location,
            description: eventDetails.description,
            start: {
                dateTime: eventDetails.start,
                timeZone: 'UTC',
            },
            end: {
                dateTime: eventDetails.end,
                timeZone: 'UTC',
            },
            attendees: eventDetails.attendees,
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 },
                ],
            },
            conferenceData: {
                createRequest: {
                    requestId: `pms-int-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all'
        });

        return response.data;
    } catch (error) {
        logger.error(`Google Calendar Create Event Error: ${error.message}`);
        throw error;
    }
};

/**
 * Update a calendar event
 */
exports.updateEvent = async (tokens, eventId, eventDetails) => {
    try {
        oauth2Client.setCredentials(tokens);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: eventDetails.summary,
            location: eventDetails.location,
            description: eventDetails.description,
            start: {
                dateTime: eventDetails.start,
                timeZone: 'UTC',
            },
            end: {
                dateTime: eventDetails.end,
                timeZone: 'UTC',
            },
            attendees: eventDetails.attendees,
        };

        const response = await calendar.events.patch({
            calendarId: 'primary',
            eventId: eventId,
            resource: event,
            sendUpdates: 'all'
        });

        return response.data;
    } catch (error) {
        logger.error(`Google Calendar Update Event Error: ${error.message}`);
        throw error;
    }
};

/**
 * Delete a calendar event
 */
exports.deleteEvent = async (tokens, eventId) => {
    try {
        oauth2Client.setCredentials(tokens);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
            sendUpdates: 'all'
        });
    } catch (error) {
        logger.error(`Google Calendar Delete Event Error: ${error.message}`);
        throw error;
    }
};
