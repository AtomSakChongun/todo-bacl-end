const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller')

router.get('/', userController.getUsers);
router.get('/:id', userController.getUsersById);
router.post('/login',userController.login)
router.post('/register',userController.register)

module.exports = router;
