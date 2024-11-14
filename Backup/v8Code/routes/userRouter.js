const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { getUser, getById, getAllTasksUser, updateUser } = require('../controllers/userController');
const router = express.Router();


router.get('/', verifyToken, getUser);
router.put('/update', verifyToken, updateUser);

module.exports = router;

