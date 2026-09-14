const { User, NotificationLog } = require('../models');
const emailService = require('./emailService');
const pushService = require('./pushService');

async function log({ userId, channel, event, title, message, status, errorMessage }) {
  try {
    await NotificationLog.create({ userId, channel, event, title, message, status, errorMessage });
  } catch (err) {
    console.error('Failed to write notification log:', err.message);
  }
}

async function emailUser(user, { event, subject, template, data }) {
  if (!user.notifyByEmail) return;
  try {
    await emailService.sendMail({ to: user.email, subject, template, data });
    await log({ userId: user.id, channel: 'email', event, title: subject, message: `Sent to ${user.email}`, status: 'sent' });
  } catch (err) {
    await log({ userId: user.id, channel: 'email', event, title: subject, status: 'failed', errorMessage: err.message });
  }
}

async function pushUser(user, { event, title, body, url }) {
  if (!user.notifyByPush) return;
  try {
    const result = await pushService.sendToUser(user.id, { title, body, url });
    let status = 'sent';
    let errorMessage;
    if (result.sent === 0) {
      status = 'failed';
      errorMessage = result.skipped
        ? 'Push not configured on the server (missing VAPID keys).'
        : 'No active push subscriptions for this user.';
    }
    await log({ userId: user.id, channel: 'push', event, title, message: body, status, errorMessage });
  } catch (err) {
    await log({ userId: user.id, channel: 'push', event, title, status: 'failed', errorMessage: err.message });
  }
}

/**
 * Fired right after a new account is created. Two independent notification
 * flows, neither of which should ever fail the signup itself:
 *   1. Welcome email to the new user.
 *   2. Email + push alert to every admin, so staff notice new registrations.
 */
async function onUserRegistered(user) {
  await emailUser(user, {
    event: 'user_registered',
    subject: 'Welcome to MarketPlace!',
    template: 'welcome',
    data: { name: user.name }
  });

  const admins = await User.findAll({ where: { role: 'admin' } });
  const subject = 'New user signed up';
  const body = `${user.name} (${user.email}) just registered as a ${user.role}.`;

  await Promise.all(
    admins.map((admin) =>
      Promise.all([
        emailUser(admin, {
          event: 'admin_new_signup_alert',
          subject,
          template: 'adminNewSignup',
          data: { admin, newUser: user }
        }),
        pushUser(admin, {
          event: 'admin_new_signup_alert',
          title: subject,
          body,
          url: '/admin/users'
        })
      ])
    )
  );
}

module.exports = { onUserRegistered };
