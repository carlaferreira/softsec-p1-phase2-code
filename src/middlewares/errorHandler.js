export function errorHandler(err, req, res, next) {
  console.error('[error]', err);
  // Return detailed error info to help developers debug failing requests.
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: err.stack,
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}
