const express = require('express');

const { verifyToken } = require('../middleware/authMiddleware');
const { creatStatus } = require('../controllers/CommonController');
const router = express.Router();

const { io } = require('../server'); // Import the io instance from your server


router.put('/create', verifyToken, creatStatus);

module.exports = router;

