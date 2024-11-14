const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { tasklistCount, rolleDemo } = require('../controllers/TestCaseController');
const router = express.Router();

router.get('/demo', tasklistCount);
router.post('/statusCount', verifyToken, tasklistCount);
router.get('/rolle', rolleDemo);

module.exports = router;

