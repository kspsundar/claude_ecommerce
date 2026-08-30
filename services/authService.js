const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function registerUser({ name, email, password, role }) {
  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: role === 'seller' ? 'seller' : 'buyer'
  });

  return user;
}

async function verifyCredentials(email, password) {
  const user = await User.findOne({ where: { email: (email || '').toLowerCase() } });
  if (!user) return null;
  if (!user.isActive) {
    const err = new Error('This account has been suspended.');
    err.status = 403;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.password);
  return ok ? user : null;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
}

module.exports = { registerUser, verifyCredentials, signToken, toPublicUser };
