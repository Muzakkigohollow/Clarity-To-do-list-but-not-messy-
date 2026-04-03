const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');

const app = express();

// Basic hardening (no-ops in the app logic, but prevents common production mistakes)
app.disable('x-powered-by');

// Restrict CORS to known frontend origins.
// Set `CORS_ORIGIN=http://localhost:5173` (or a comma-separated list) to configure.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser calls (no Origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'authorization'],
    maxAge: 86400
}));

// Limit JSON body sizes to reduce abuse and accidental large payloads.
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// Minimal security headers (subset of helmet)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=()');
    next();
});

// Very basic in-memory rate limiting for /api (single-instance friendly).
const rateStore = new Map();
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000); // 15 minutes
const maxRequests = Number(process.env.RATE_LIMIT_MAX || 100);

app.use('/api', (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = rateStore.get(key);

    if (!entry || now > entry.resetTime) {
        rateStore.set(key, { count: 1, resetTime: now + windowMs });
        return next();
    }

    if (entry.count >= maxRequests) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    entry.count += 1;
    return next();
});

app.use('/api/tasks', taskRoutes);

// Export for tests and for server
module.exports = app;
