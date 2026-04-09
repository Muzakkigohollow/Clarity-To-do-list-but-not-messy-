const db = require('../db');

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
    if (deadline === undefined || deadline === null || deadline === '') return null;
    if (!isValidDateOnly(deadline)) return undefined;
    return deadline;
}

exports.getAllTasks = async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT id, title, priority, deadline, status, COALESCE(completed_at, updated_at) AS completed_at FROM tasks WHERE user_id=? ORDER BY FIELD(priority, "HIGH", "MEDIUM", "LOW")',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.createTask = async (req, res, next) => {
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

    const user_id = req.user.id;
    try {
        const [result] = await db.query(
            'INSERT INTO tasks (title, priority, deadline, user_id) VALUES (?, ?, ?, ?)',
            [title.trim(), normalizedPriority, normalizedDeadline, user_id]
        );
        res.status(201).json({
            id: result.insertId,
            title: title.trim(),
            priority: normalizedPriority,
            deadline: normalizedDeadline,
            status: 'PENDING',
            user_id,
            completed_at: null
        });
    } catch (err) {
        next(err);
    }
};

exports.updateTask = async (req, res, next) => {
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

    const user_id = req.user.id;
    try {
        const [result] = await db.query(
            'UPDATE tasks SET title=?, priority=?, deadline=?, status=?, completed_at=IF(?="DONE", COALESCE(completed_at, NOW()), NULL) WHERE id=? AND user_id=?',
            [title.trim(), priority, normalizedDeadline, status, status, parsedId, user_id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });

        const [rows] = await db.query(
            'SELECT id, title, priority, deadline, status, completed_at FROM tasks WHERE id=? AND user_id=?',
            [parsedId, user_id]
        );

        res.json({
            message: 'Task updated successfully',
            ...rows[0]
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteTask = async (req, res, next) => {
    const { id } = req.params;
    const parsedId = parsePositiveInt(id);
    if (!parsedId) {
        return res.status(400).json({ error: 'Invalid id' });
    }
    const user_id = req.user.id;
    try {
        const [result] = await db.query('DELETE FROM tasks WHERE id=? AND user_id=?', [parsedId, user_id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        next(err);
    }
};

exports.patchTask = async (req, res, next) => {
    const { id } = req.params;
    const parsedId = parsePositiveInt(id);
    if (!parsedId) return res.status(400).json({ error: 'Invalid id' });

    const user_id = req.user.id;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    try {
        // Build dynamic query
        const fields = [];
        const values = [];

        if (updates.title !== undefined) {
            if (!validateTitle(updates.title)) return res.status(400).json({ error: 'Invalid title' });
            fields.push('title = ?');
            values.push(updates.title.trim());
        }
        if (updates.priority !== undefined) {
            if (!validatePriority(updates.priority)) return res.status(400).json({ error: 'Invalid priority' });
            fields.push('priority = ?');
            values.push(updates.priority);
        }
        if (updates.status !== undefined) {
            if (!validateStatus(updates.status)) return res.status(400).json({ error: 'Invalid status' });
            fields.push('status = ?');
            values.push(updates.status);

            fields.push('completed_at = IF(?="DONE", COALESCE(completed_at, NOW()), NULL)');
            values.push(updates.status);
        }
        if (updates.deadline !== undefined) {
            const normalizedDeadline = normalizeDeadline(updates.deadline);
            if (normalizedDeadline === undefined) return res.status(400).json({ error: 'Invalid deadline' });
            fields.push('deadline = ?');
            values.push(normalizedDeadline);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        values.push(parsedId, user_id);
        const [result] = await db.query(
            `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });

        // Retrieve updated task
        const [rows] = await db.query(
            'SELECT id, title, priority, deadline, status, completed_at FROM tasks WHERE id = ? AND user_id = ?',
            [parsedId, user_id]
        );
        res.json({ message: 'Task partially updated', ...rows[0] });

    } catch (err) {
        next(err);
    }
};

exports.getTaskStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate required' });

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end)) return res.status(400).json({ error: 'Invalid dates' });
        
        // Use internally formatted dates to prevent any SQL injection vectors
        const startStr = start.toISOString().split('T')[0];
        const endStrParsed = end.toISOString().split('T')[0];
        
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        let groupFormat = '%Y-%m-%d'; // Default daily
        if (diffDays > 60) groupFormat = '%Y-%m'; // Monthly
        else if (diffDays > 14) groupFormat = '%x-W%v'; // Weekly

        const [rows] = await db.query(
            `SELECT DATE_FORMAT(completed_at, ?) as date, COUNT(*) as count 
             FROM tasks 
             WHERE user_id = ? AND status = 'DONE' AND completed_at BETWEEN ? AND ? 
             GROUP BY date 
             ORDER BY date ASC`,
            [groupFormat, req.user.id, `${startStr} 00:00:00`, `${endStrParsed} 23:59:59`]
        );

        res.json(rows);
    } catch (err) {
        next(err);
    }
};
