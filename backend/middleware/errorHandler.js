/**
 * Centralized Error Handling Middleware
 * 
 * Intercepts all errors, logs them to the server console,
 * and returns a sanitized JSON response to the client.
 */
const errorHandler = (err, req, res, next) => {
    let status = err.status || 500;
    let message = 'Internal server error';

    // Log the full error to the console for developers
    console.error(`[Error Log] ${new Date().toISOString()} | ${status} | ${req.method} ${req.url}:`, err);

    // Database connection issues
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_CON_COUNT_ERROR') {
        status = 503;
        message = 'Service unavailable. Please try again later.';
    } 
    // Validation errors (e.g. from our custom validation or future joi)
    else if (err.name === 'ValidationError') {
        status = 400;
        message = err.message;
    }
    // Auth errors
    else if (status === 401 || status === 403) {
        message = err.message || (status === 401 ? 'Unauthorized' : 'Forbidden');
    }

    // Do NOT leak raw error messages to the client in production
    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { details: err.message, stack: err.stack })
    });
};

module.exports = errorHandler;
