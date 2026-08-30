const authService = require('../../services/authService');
const { Address } = require('../../models');

function sessionUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

exports.showRegister = (req, res) => {
  res.render('auth/register', { title: 'Create account' });
};

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name || !email || !password) {
    req.flash('error', 'Name, email and password are required.');
    return res.redirect('/register');
  }
  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match.');
    return res.redirect('/register');
  }

  try {
    const user = await authService.registerUser({ name, email, password, role });
    req.session.user = sessionUser(user);
    req.flash('success', 'Welcome! Your account has been created.');
    res.redirect('/');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/register');
  }
};

exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'Log in', next: req.query.next || '/' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.verifyCredentials(email, password);
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }
    req.session.user = sessionUser(user);
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect(req.body.next || '/');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};

exports.showProfile = async (req, res) => {
  const addresses = await Address.findAll({ where: { userId: req.session.user.id }, order: [['isDefault', 'DESC']] });
  res.render('auth/profile', { title: 'My profile', addresses });
};

exports.updateProfile = async (req, res) => {
  const { User } = require('../../models');
  const user = await User.findByPk(req.session.user.id);
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  await user.save();
  req.session.user.name = user.name;
  req.flash('success', 'Profile updated.');
  res.redirect('/profile');
};

exports.addAddress = async (req, res) => {
  const { label, line1, line2, city, state, postalCode, country, isDefault } = req.body;
  const userId = req.session.user.id;

  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId } });
  }

  await Address.create({ userId, label, line1, line2, city, state, postalCode, country, isDefault: !!isDefault });
  req.flash('success', 'Address added.');
  res.redirect('/profile');
};

exports.deleteAddress = async (req, res) => {
  await Address.destroy({ where: { id: req.params.id, userId: req.session.user.id } });
  req.flash('success', 'Address removed.');
  res.redirect('/profile');
};
