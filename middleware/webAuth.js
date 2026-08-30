function attachUser(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  next();
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
  }
  next();
}

function requireGuest(req, res, next) {
  if (req.session.user) return res.redirect('/');
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      req.flash('error', "You don't have permission to view that page.");
      return res.redirect('/');
    }
    next();
  };
}

module.exports = { attachUser, requireAuth, requireGuest, requireRole };
