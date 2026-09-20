const webpush = require('web-push');
const { PushSubscription, User } = require('../models');

const vapidConfigured = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

function isEnabled() {
  return vapidConfigured;
}

async function subscribe(userId, subscription, userAgent) {
  const { endpoint, keys } = subscription || {};
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    const err = new Error('Invalid push subscription payload.');
    err.status = 400;
    throw err;
  }

  const [row] = await PushSubscription.findOrCreate({
    where: { endpoint },
    defaults: { userId, p256dh: keys.p256dh, auth: keys.auth, userAgent }
  });

  row.userId = userId;
  row.p256dh = keys.p256dh;
  row.auth = keys.auth;
  row.userAgent = userAgent;
  await row.save();

  return row;
}

async function unsubscribe(endpoint) {
  await PushSubscription.destroy({ where: { endpoint } });
}

/**
 * Push `payload` (JSON-serializable) to every device a user has subscribed on.
 * Returns { sent, failed } counts. Dead subscriptions (410/404) are pruned.
 */
async function sendToUser(userId, payload) {
  if (!isEnabled()) return { sent: 0, failed: 0, skipped: 'vapid-not-configured' };

  const subscriptions = await PushSubscription.findAll({ where: { userId } });
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (err) {
        failed += 1;
        if (err.statusCode === 404 || err.statusCode === 410) {
          await sub.destroy(); // subscription is gone on the browser side
        }
      }
    })
  );

  return { sent, failed };
}

async function sendToAdmins(payload) {
  const admins = await User.findAll({ where: { role: 'admin', notifyByPush: true } });
  const results = await Promise.all(admins.map((admin) => sendToUser(admin.id, payload)));
  return {
    sent: results.reduce((sum, r) => sum + r.sent, 0),
    failed: results.reduce((sum, r) => sum + r.failed, 0),
    admins: admins.length
  };
}

module.exports = { isEnabled, subscribe, unsubscribe, sendToUser, sendToAdmins };
