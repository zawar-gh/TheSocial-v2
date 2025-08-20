const { getDb } = require('../utils/db');

async function listMessages(req, res) {
  const { communityId, sortByDayBefore, beforeMessageId, lastMessage } = req.query;
  if (!communityId) return res.status(400).json({ error: 'communityId required' });
  const db = getDb();
  const params = [communityId];
  let query = `SELECT id, community_id, user_id, content, created_at
               FROM messages WHERE community_id=$1`;
  if (beforeMessageId) {
    params.push(beforeMessageId);
    query += ` AND id < $${params.length}`;
  }
  if (sortByDayBefore) {
    params.push(sortByDayBefore);
    query += ` AND created_at::date <= $${params.length}::date`;
  }
  query += ` ORDER BY created_at DESC`;
  if (lastMessage === 'true') {
    query += ` LIMIT 1`;
  } else {
    query += ` LIMIT 50`;
  }
  const result = await db.query(query, params);
  res.json({ messages: result.rows });
}

async function createMessage(req, res) {
  const { communityId, content } = req.body;
  if (!communityId || !content) return res.status(400).json({ error: 'Missing fields' });
  const userId = req.user.id;
  const db = getDb();
  const result = await db.query(
    `INSERT INTO messages (community_id, user_id, content) VALUES ($1,$2,$3)
     RETURNING id, community_id, user_id, content, created_at`,
    [communityId, userId, content]
  );
  const message = result.rows[0];
  const io = req.app.get('io');
  io.to(`community:${communityId}`).emit('new_message', message);
  res.status(201).json(message);
}

module.exports = { listMessages, createMessage };


