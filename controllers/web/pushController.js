const pushService = require('../../services/pushService');

exports.vapidPublicKey = (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
};

exports.subscribe = async (req, res) => {
  try {
    await pushService.subscribe(req.session.user.id, req.body, req.headers['user-agent']);
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, error: err.message });
  }
};

exports.unsubscribe = async (req, res) => {
  await pushService.unsubscribe(req.body.endpoint);
  res.json({ ok: true });
};
