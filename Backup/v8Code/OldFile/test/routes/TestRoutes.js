const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { tasklistCount } = require('../controllers/TestCaseController');
const router = express.Router();

router.get('/demo', tasklistCount);
router.post('/statusCount', verifyToken, tasklistCount);

module.exports = router;

