const db = require('../db');

function handleError(res, err) {
    const status = err && err.status ? err.status : 500;
    const message = status === 503 ? 'Service unavailable' : 'Internal server error';
    // Server-side log only; never return raw DB error messages to clients.
    console.error(err);
    return res.status(status).json({ error: message });
}

const PRIORITIES = new Set(['HIGH', 'MEDIUM', 'LOW']);
const STATUSES = new Set(['PENDING', 'DONE']);

function parsePositiveInt(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return null;
    return n;
}

function isValidDateOnly(dateStr) {
    if (typeof dateStr !== 'string') return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    // Guard against invalid dates like 2026-02-31
    return dt.getUTCFullYear() === y && (dt.getUTCMonth() === m - 1) && dt.getUTCDate() === d;
}

function validateTitle(title) {
    if (typeof title !== 'string') return false;
    const trimmed = title.trim();
    return trimmed.length > 0 && trimmed.length <= 255;
}

function validatePriority(priority) {
    return PRIORITIES.has(priority);
}

function validateStatus(status) {
    return STATUSES.has(status);
}

function normalizeDeadline(deadline) {
    // Accept undefined/null/empty as "no deadline"
    if (deadline === undefined || deadline === null || deadline === '') return null;
    if (!isValidDateOnly(deadline)) return undefined;
    return deadline;
}

exports.getAllTasks = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE owner=? ORDER BY FIELD(priority, "HIGH", "MEDIUM", "LOW")',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createTask = async (req, res) => {
    const { title, priority, deadline } = req.body;
    if (!validateTitle(title)) {
        return res.status(400).json({ error: 'Invalid title' });
    }

    const normalizedPriority = priority === undefined || priority === null || priority === '' ? 'MEDIUM' : priority;
    if (!validatePriority(normalizedPriority)) {
        return res.status(400).json({ error: 'Invalid priority' });
    }

    const normalizedDeadline = normalizeDeadline(deadline);
    if (normalizedDeadline === undefined) {
        return res.status(400).json({ error: 'Invalid deadline' });
    }

    const owner = req.user.id;
    try {
        const [result] = await db.query(
            'INSERT INTO tasks (title, priority, deadline, owner) VALUES (?, ?, ?, ?)',
            [title.trim(), normalizedPriority, normalizedDeadline, owner]
        );
        res.status(201).json({
            id: result.insertId,
            title: title.trim(),
            priority: normalizedPriority,
            deadline: normalizedDeadline,
            status: 'PENDING',
            owner
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const parsedId = parsePositiveInt(id);
    if (!parsedId) {
        return res.status(400).json({ error: 'Invalid id' });
    }

    const { title, priority, deadline, status } = req.body;
    if (!validateTitle(title)) return res.status(400).json({ error: 'Invalid title' });
    if (!validatePriority(priority)) return res.status(400).json({ error: 'Invalid priority' });
    if (!validateStatus(status)) return res.status(400).json({ error: 'Invalid status' });

    const normalizedDeadline = normalizeDeadline(deadline);
    if (normalizedDeadline === undefined) return res.status(400).json({ error: 'Invalid deadline' });

    const owner = req.user.id;
    try {
        const [result] = await db.query(
            'UPDATE tasks SET title=?, priority=?, deadline=?, status=? WHERE id=? AND owner=?',
            [title.trim(), priority, normalizedDeadline, status, parsedId, owner]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({
            message: 'Task updated successfully',
            id: parsedId,
            title: title.trim(),
            priority,
            deadline: normalizedDeadline,
            status,
            owner
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.toggleTaskStatus = async (req, res) => {
    const { id } = req.params;
    const parsedId = parsePositiveInt(id);
    if (!parsedId) {
        return res.status(400).json({ error: 'Invalid id' });
    }

    const { status } = req.body;
    const owner = req.user.id;
    // ensure status is either PENDING or DONE
    if (!validateStatus(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        const [result] = await db.query(
            'UPDATE tasks SET status=? WHERE id=? AND owner=?',
            [status, parsedId, owner]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Status updated', id: parsedId, status });
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    const parsedId = parsePositiveInt(id);
    if (!parsedId) {
        return res.status(400).json({ error: 'Invalid id' });
    }
    const owner = req.user.id;
    try {
        const [result] = await db.query('DELETE FROM tasks WHERE id=? AND owner=?', [parsedId, owner]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        handleError(res, err);
    }
};
