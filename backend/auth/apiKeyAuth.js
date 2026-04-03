const crypto = require('crypto');

function timingSafeEqual(a, b) {
    const bufA = Buffer.from(a || '', 'utf8');
    const bufB = Buffer.from(b || '', 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Minimal auth middleware:
 * - client sends `x-api-key: <token>` or `Authorization: Bearer <token>`
 * - server compares against `process.env.API_KEY`
 *
 * NOTE: This is intentionally "minimum viable" auth for the MVP scope.
 */
module.exports = function apiKeyAuth(req, res, next) {
    const configuredKey = process.env.API_KEY;
    if (!configuredKey) {
        return res.status(500).json({ error: 'Server misconfigured (missing API_KEY)' });
    }

    const headerKey = req.header('x-api-key');
    const authHeader = req.header('authorization');
    const bearerToken = authHeader && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice('bearer '.length).trim()
        : null;

    const providedKey = (headerKey || bearerToken || '').trim();
    if (!providedKey || !timingSafeEqual(providedKey, configuredKey)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Use the token itself as the tenant/owner id to enforce query scoping.
    req.user = { id: providedKey };
    return next();
};

