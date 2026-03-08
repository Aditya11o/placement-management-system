const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

/**
 * Send a web push notification to all subscribed devices of a user
 * @param {string} userId - ID of the recipient user
 * @param {object} payload - Notification data (title, body, icon, url, actions, etc.)
 */
const sendPushNotification = async (userId, payload) => {
    try {
        const subscriptions = await PushSubscription.find({ userId });

        if (!subscriptions || subscriptions.length === 0) {
            return;
        }

        const notificationPayload = JSON.stringify(payload);

        const sendPromises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, notificationPayload);
            } catch (err) {
                // If subscription is expired or invalid, remove it
                if (err.statusCode === 404 || err.statusCode === 410) {
                    console.log(`Push subscription expired for endpoint: ${sub.endpoint}`);
                    await PushSubscription.findByIdAndDelete(sub._id);
                } else {
                    console.error(`Error sending push notification to ${sub.endpoint}:`, err);
                }
            }
        });

        await Promise.all(sendPromises);
    } catch (err) {
        console.error('Error in sendPushNotification utility:', err);
    }
};

module.exports = { sendPushNotification };
