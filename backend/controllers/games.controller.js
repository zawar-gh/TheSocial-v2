const { getDb } = require('../utils/db');

async function listGames(req, res) {
  const db = getDb();
  const result = await db.query('SELECT id, name, description, image, banner, avg_play_time FROM games ORDER BY id');
  res.json({ games: result.rows });
}

async function getGame(req, res) {
  const { id } = req.params;
  const db = getDb();
  const result = await db.query('SELECT id, name, description, image, banner, avg_play_time FROM games WHERE id=$1', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
}

async function leaderboard(req, res) {
  const { id } = req.params;
  const { limit = 10 } = req.query;
  const db = getDb();
  const result = await db.query(
    `SELECT l.user_id, u.username, l.score, l.rank, l.total_play_time, l.last_updated
     FROM leaderboard l JOIN users u ON u.id = l.user_id
     WHERE l.game_id = $1
     ORDER BY l.rank ASC
     LIMIT $2`,
    [id, Math.min(Number(limit), 100)]
  );
  res.json({ leaderboard: result.rows });
}

async function playerStats(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const db = getDb();
  const result = await db.query(
    `SELECT user_id, score, rank, total_play_time, last_updated 
     FROM leaderboard WHERE game_id=$1 AND user_id=$2`,
    [id, userId]
  );
  res.json(result.rows[0] || { user_id: userId, score: 0, rank: null, total_play_time: 0 });
}

async function updateScore(req, res) {
  const { id } = req.params;
  const { scoreDelta = 0, playTimeDelta = 0 } = req.body;
  const userId = req.user.id;
  const db = getDb();
  const upsert = await db.query(
    `INSERT INTO leaderboard (game_id, user_id, score, rank, total_play_time, last_updated)
     VALUES ($1,$2,$3,NULL,$4,NOW())
     ON CONFLICT (game_id, user_id)
     DO UPDATE SET score = leaderboard.score + EXCLUDED.score,
                   total_play_time = leaderboard.total_play_time + EXCLUDED.total_play_time,
                   last_updated = NOW()
     RETURNING game_id, user_id, score, rank, total_play_time, last_updated`,
    [id, userId, Number(scoreDelta) || 0, Number(playTimeDelta) || 0]
  );

  const row = upsert.rows[0];
  const io = req.app.get('io');
  io.emit('leaderboard_update', { gameId: id, ...row });
  res.json(row);
}

module.exports = { listGames, getGame, leaderboard, playerStats, updateScore };


