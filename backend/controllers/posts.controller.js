const path = require('path');
const { getDb } = require('../utils/db');

async function createPost(req, res) {
  const { communityId, content } = req.body;
  const userId = req.user.id;
  const attachments = (req.files || []).map((f) => `/uploads/${path.basename(f.path)}`);
  if (!communityId || !content) return res.status(400).json({ error: 'Missing fields' });
  const db = getDb();
  const result = await db.query(
    `INSERT INTO posts (community_id, user_id, content, attachments) VALUES ($1,$2,$3,$4)
     RETURNING id, community_id, user_id, content, attachments, created_at, likes`,
    [communityId, userId, content, attachments]
  );
  res.status(201).json(result.rows[0]);
}

async function listByCommunity(req, res) {
  const { id } = req.params;
  const { beforePostId } = req.query;
  const db = getDb();
  const params = [id];
  let query = `SELECT id, community_id, user_id, content, attachments, created_at, likes
               FROM posts WHERE community_id=$1`;
  if (beforePostId) {
    params.push(beforePostId);
    query += ` AND id < $${params.length}`;
  }
  query += ` ORDER BY created_at DESC LIMIT 20`;
  const result = await db.query(query, params);
  res.json({ posts: result.rows });
}

module.exports = { createPost, listByCommunity };


