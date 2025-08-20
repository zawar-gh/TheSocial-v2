const express = require('express');
const { authenticateAccessToken } = require('../middleware/auth');
const ctrl = require('../controllers/games.controller');
const router = express.Router();

router.get('/', authenticateAccessToken, ctrl.listGames);
router.get('/:id', authenticateAccessToken, ctrl.getGame);
router.get('/:id/leaderboard', authenticateAccessToken, ctrl.leaderboard);
router.get('/:id/player-stats', authenticateAccessToken, ctrl.playerStats);
router.post('/:id/update-score', authenticateAccessToken, ctrl.updateScore);

module.exports = router;


