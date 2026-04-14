const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/middleware');
const taskController = require('../controllers/task.controller')

router.get('/user', verifyToken, taskController.getAllTaskByUserId);
router.post('/create',verifyToken,taskController.createTaskByUser)

module.exports = router;
