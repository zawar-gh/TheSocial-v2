const { getDb } = require('../utils/db');

async function createCommunity(req, res) {
  const { name, description, lat, lng } = req.body;
  const creatorId = req.user.id;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const db = getDb();
  const result = await db.query(
    `INSERT INTO communities (name, description, location, creator_id) VALUES ($1,$2, geography(ST_SetSRID(ST_MakePoint($3, $4), 4326)), $5) RETURNING id`,
    [name, description || '', lng || 0, lat || 0, creatorId]
  );
  const communityId = result.rows[0].id;
  await db.query(
    `INSERT INTO community_members (community_id, user_id, role) VALUES ($1,$2,'owner')`,
    [communityId, creatorId]
  );
  res.status(201).json({ id: communityId });
}

async function getYourCommunities(req, res) {
  const userId = req.user.id;
  const db = getDb();
  const result = await db.query(
    `SELECT c.id, c.name, c.description
     FROM communities c
     JOIN community_members m ON m.community_id = c.id
     WHERE m.user_id = $1
     ORDER BY c.id DESC`,
    [userId]
  );
  res.json({ communities: result.rows });
}

async function getNearbyCommunities(req, res) {
  const { lat, lng, limit = 10, page = 1 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });
  const lim = Math.min(Number(limit), 100);
  const offset = (Number(page) - 1) * lim;
  const db = getDb();
  const result = await db.query(
    `SELECT id, name, description,
            ST_Distance(location, geography(ST_SetSRID(ST_MakePoint($1,$2),4326))) AS distance
     FROM communities
     ORDER BY ST_Distance(location, geography(ST_SetSRID(ST_MakePoint($1,$2),4326))) ASC
     LIMIT $3 OFFSET $4`,
    [lng, lat, lim, offset]
  );
  res.json({ communities: result.rows });
}

async function getOne(req, res) {
  const { id } = req.params;
  const db = getDb();
  const result = await db.query(
    `SELECT id, name, description FROM communities WHERE id=$1`,
    [id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
}

async function joinCommunity(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const db = getDb();
  await db.query(
    `INSERT INTO community_members (community_id, user_id, role)
     VALUES ($1,$2,'member')
     ON CONFLICT (community_id, user_id) DO NOTHING`,
    [id, userId]
  );
  res.json({ joined: true });
}

async function leaveCommunity(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const db = getDb();
  await db.query(
    `DELETE FROM community_members WHERE community_id=$1 AND user_id=$2`,
    [id, userId]
  );
  res.json({ left: true });
}

module.exports = { createCommunity, getYourCommunities, getNearbyCommunities, getOne, joinCommunity, leaveCommunity };


