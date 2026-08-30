const authService = require('../../services/authService');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required.' });
  }
  try {
    const user = await authService.registerUser({ name, email, password, role });
    const token = authService.signToken(user);
    res.status(201).json({ token, user: authService.toPublicUser(user) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.verifyCredentials(email, password);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = authService.signToken(user);
    res.json({ token, user: authService.toPublicUser(user) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  const { User } = require('../../models');
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: authService.toPublicUser(user) });
};
