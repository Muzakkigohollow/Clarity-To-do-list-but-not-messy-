const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');


// GET task statistics
router.get('/stats', taskController.getTaskStats);

// GET all tasks
router.get('/', taskController.getAllTasks);

// POST a new task
router.post('/', taskController.createTask);

// PUT to update a whole task
router.put('/:id', taskController.updateTask);

// PATCH to partially update a task without replacing the whole object
router.patch('/:id', taskController.patchTask);

// DELETE a task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
