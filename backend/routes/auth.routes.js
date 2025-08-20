const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh-token', ctrl.refreshToken);
router.post('/verify-access-token', ctrl.verifyAccessToken);
router.post('/verify-refresh-token', ctrl.verifyRefreshToken);
router.post('/logout', ctrl.logout);

module.exports = router;


