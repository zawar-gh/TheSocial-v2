const express = require('express');
const { authenticateAccessToken } = require('../middleware/auth');
const ctrl = require('../controllers/communities.controller');

const router = express.Router();

router.post('/create', authenticateAccessToken, ctrl.createCommunity);
router.get('/yours', authenticateAccessToken, ctrl.getYourCommunities);
router.get('/nearby', authenticateAccessToken, ctrl.getNearbyCommunities);
router.get('/:id', authenticateAccessToken, ctrl.getOne);
router.post('/join/:id', authenticateAccessToken, ctrl.joinCommunity);
router.post('/leave/:id', authenticateAccessToken, ctrl.leaveCommunity);

module.exports = router;


