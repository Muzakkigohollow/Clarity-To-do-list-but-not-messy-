const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const jwtAuth = require('./auth/jwtAuth');
const db = require('./db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Basic hardening (no-ops in the app logic, but prevents common production mistakes)
app.disable('x-powered-by');

// Restrict CORS to known frontend origins.
// Set `CORS_ORIGIN` as a comma-separated list to configure (e.g. http://localhost:5173,http://localhost:8080).
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8080')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser calls (no Origin header)
        if (!origin) return callback(null, true);
        if (localhostPattern.test(origin)) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'authorization'],
    maxAge: 86400
}));

// Limit JSON body sizes to reduce abuse and accidental large payloads.
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// Trust proxy to ensure rate limiting uses the correct client IPs behind a load balancer
app.set('trust proxy', 1);

// Structured Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const userId = req.user ? req.user.id : 'unauth';
        console.log(`[REQ] ${new Date().toISOString()} | ${res.statusCode} | ${req.method} ${req.originalUrl} | IP: ${req.ip} | User: ${userId} | ${duration}ms`);
    });
    next();
});

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=()');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none';");
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
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

// Circuit breaker middleware
app.use('/api', (req, res, next) => {
    if (!db.isHealthy) {
        return res.status(503).json({ error: 'Service Unavailable (Database degraded)' });
    }
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', jwtAuth, taskRoutes);

// Centralized error handling (Must be last)
app.use(errorHandler);

// Export for tests and for server
module.exports = app;
