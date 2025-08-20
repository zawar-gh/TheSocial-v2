const path = require('path');
const { getDb } = require('../utils/db');

async function getCurrentProfile(req, res) {
  const db = getDb();
  const result = await db.query(
    `SELECT id, username, email, profile_image, banner_image, joined_date FROM users WHERE id=$1`,
    [req.user.id]
  );
  res.json(result.rows[0]);
}

async function updateProfile(req, res) {
  const { username } = req.body;
  const profileImage = req.files?.profileImage?.[0];
  const bannerImage = req.files?.bannerImage?.[0];

  const updates = [];
  const params = [];

  if (username) {
    params.push(username);
    updates.push(`username = $${params.length}`);
  }
  if (profileImage) {
    params.push(`/uploads/${path.basename(profileImage.path)}`);
    updates.push(`profile_image = $${params.length}`);
  }
  if (bannerImage) {
    params.push(`/uploads/${path.basename(bannerImage.path)}`);
    updates.push(`banner_image = $${params.length}`);
  }
  if (!updates.length) return res.status(400).json({ error: 'No updates provided' });

  params.push(req.user.id);
  const db = getDb();
  const result = await db.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING id, username, email, profile_image, banner_image`,
    params
  );
  res.json(result.rows[0]);
}

async function getByUsername(req, res) {
  const { username } = req.params;
  const db = getDb();
  const result = await db.query(
    `SELECT id, username, profile_image, banner_image, joined_date FROM users WHERE username = $1`,
    [username]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
}

module.exports = { getCurrentProfile, updateProfile, getByUsername };


