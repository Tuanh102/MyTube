const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    authController.googleCallback
);
// Thêm vào authRoutes.js
router.post('/auth/login-local', authController.loginLocal);
router.post('/auth/register-local', authController.registerLocal);
router.get('/logout', authController.logout);

module.exports = router;