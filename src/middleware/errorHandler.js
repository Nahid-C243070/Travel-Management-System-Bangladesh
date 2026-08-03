export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || (error.code === 'ER_DUP_ENTRY' ? 409 : 500);
  const code = error.code === 'ER_DUP_ENTRY' ? 'DUPLICATE_VALUE' : error.code || 'INTERNAL_ERROR';

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error.' : error.message,
    error: {
      code,
      details: error.details || undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  });
}
