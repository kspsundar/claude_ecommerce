const path = require('path');
const ejs = require('ejs');
const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
    });
  } else {
    // No SMTP configured (e.g. local dev) — log the message instead of sending it.
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
}

async function renderTemplate(template, data) {
  const file = path.join(__dirname, '..', 'views', 'emails', `${template}.ejs`);
  return ejs.renderFile(file, data);
}

/**
 * Send an email. Uses views/emails/<template>.ejs for the HTML body.
 * Falls back to a console-logged "sent" message when SMTP isn't configured,
 * so registration/dev flows never break for lack of mail credentials.
 */
async function sendMail({ to, subject, template, data = {} }) {
  const html = await renderTemplate(template, data);
  const mailer = getTransporter();

  const info = await mailer.sendMail({
    from: process.env.MAIL_FROM || 'MarketPlace <no-reply@marketplace.local>',
    to,
    subject,
    html
  });

  if (info.message) {
    // jsonTransport fallback — surface it in the logs during local dev.
    console.log(`[email:dev] To: ${to} | Subject: ${subject}`);
  }

  return info;
}

module.exports = { sendMail };
