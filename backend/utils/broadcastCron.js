const prisma = require('./prisma');
const crypto = require('crypto');

/**
 * Processes scheduled broadcasts that are due but haven't been sent yet.
 * @param {object} io - Socket.io server instance
 */
const processScheduledBroadcasts = async (io) => {
  try {
    const now = new Date();

    // Find all broadcasts where isSent is false and scheduledAt is in the past or now
    const dueBroadcasts = await prisma.broadcast.findMany({
      where: {
        isSent: false,
        scheduledAt: { lte: now }
      }
    });

    if (dueBroadcasts.length === 0) return;

    console.log(`Processing ${dueBroadcasts.length} scheduled broadcasts...`);

    for (const broadcast of dueBroadcasts) {
      const { id: broadcastId, title, message, type, targetRole } = broadcast;

      // Identify recipients
      let where = {};
      if (targetRole === 'student') where.role = 'student';
      else if (targetRole === 'recruiter') where.role = 'recruiter';
      // if targetRole is 'all', leave where empty

      const recipients = await prisma.user.findMany({
        where,
        select: { id: true }
      });

      if (recipients.length > 0) {
        // Create individual notifications
        await prisma.notification.createMany({
          data: recipients.map(user => ({
            userId: user.id,
            title: title || 'Broadcast',
            message: message,
            type: (type || 'system').toLowerCase(),
            isBroadcast: true,
            broadcastId: broadcastId
          }))
        });

        // Emit Socket.io events
        if (io) {
          recipients.forEach(u => {
            io.to(u.id.toString()).emit('notification', { 
              title, 
              message, 
              type, 
              broadcastId 
            });
          });
        }
      }

      // Mark broadcast as sent
      await prisma.broadcast.update({
        where: { id: broadcastId },
        data: { isSent: true }
      });

      console.log(`Broadcast ${broadcastId} sent to ${recipients.length} users.`);
    }
  } catch (error) {
    console.error('Error in processScheduledBroadcasts cron:', error);
  }
};

module.exports = { processScheduledBroadcasts };
