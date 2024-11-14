const express = require('express');
const { login, register, verifyotp, RigisterEmail, Setprofile } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);

router.post('/verify-otp', verifyotp);
router.post('/rigister-email', RigisterEmail);
router.post('/set-profile', Setprofile);


module.exports = router;
