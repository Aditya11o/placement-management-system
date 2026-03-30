const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    notification_id: {
      type: String,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['job', 'interview', 'message', 'system', 'general', 'placement', 'alert'],
      default: 'system',
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    broadcastId: {
      type: String,
      index: true,
    },
    link: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

// Auto-generate notification_id (e.g., NOTIF-0001)
notificationSchema.pre('save', async function () {
  if (!this.notification_id) {
    const lastNotification = await this.constructor.findOne(
      { notification_id: { $regex: /^NOTIF-/ } },
      {},
      { sort: { notification_id: -1 } }
    );

    let nextNumber = 1;
    if (lastNotification && lastNotification.notification_id) {
      const lastIdParts = lastNotification.notification_id.split('-');
      if (lastIdParts.length === 2) {
        nextNumber = parseInt(lastIdParts[1], 10) + 1;
      }
    }

    this.notification_id = `NOTIF-${nextNumber.toString().padStart(4, '0')}`;
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
