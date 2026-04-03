const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const apiKeyAuth = require('../auth/apiKeyAuth');

// All task endpoints require authentication.
router.use(apiKeyAuth);

// GET all tasks
router.get('/', taskController.getAllTasks);

// POST a new task
router.post('/', taskController.createTask);

// PUT to update a whole task
router.put('/:id', taskController.updateTask);

// PATCH to update status only (PENDING <-> DONE)
router.patch('/:id/status', taskController.toggleTaskStatus);

// DELETE a task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
