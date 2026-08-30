function notFound(req, res) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found.' });
  }
  res.status(404).render('errors/404', { title: 'Page not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;

  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ error: err.message || 'Internal server error.' });
  }

  if (req.flash) req.flash('error', err.message || 'Something went wrong.');
  res.status(status).render('errors/500', { title: 'Something went wrong' });
}

module.exports = { notFound, errorHandler };
