const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/middleware');
const taskController = require('../controllers/task.controller')

router.get('/user', verifyToken, taskController.getAllTaskByUserId);
router.get('/:id', verifyToken, taskController.getTaskByTaskId);
router.post('/create',verifyToken,taskController.createTaskByUser);
router.patch('/update/:id',verifyToken,taskController.updateTaskByUser);
router.delete('/delete/:id',verifyToken,taskController.deleteTaskByUser);

module.exports = router;
