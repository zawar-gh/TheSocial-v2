const express = require('express');
const { authenticateAccessToken } = require('../middleware/auth');
const ctrl = require('../controllers/messages.controller');
const router = express.Router();

router.get('/', authenticateAccessToken, ctrl.listMessages);
router.post('/', authenticateAccessToken, ctrl.createMessage);

module.exports = router;


