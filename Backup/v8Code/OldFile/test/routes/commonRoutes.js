const express = require('express');

const { verifyToken } = require('../middleware/authMiddleware');
const { statusList, getAssigneeList } = require('../controllers/CommonController');
const router = express.Router();

router.get('/', verifyToken, statusList);
router.get('/list', verifyToken, getAssigneeList);

module.exports = router;

