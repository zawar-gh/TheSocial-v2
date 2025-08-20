const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('../utils/db');
const { getRedis } = require('../utils/redis');

// ---- Token Generators ----
function signAccessToken(user) {
  const payload = { sub: user.id, email: user.email, username: user.username };
  const secret = process.env.JWT_ACCESS_SECRET || 'access_secret';
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return jwt.sign(payload, secret, { expiresIn });
}

function signRefreshToken(user) {
  const payload = { sub: user.id };
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

// ---- Register ----
async function register(req, res) {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const db = getDb();
  const existing = await db.query(
    'SELECT id FROM users WHERE email=$1 OR username=$2',
    [email, username]
  );

  if (existing.rows.length) {
    return res.status(409).json({ error: 'Email or username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO users (email, username, password) 
     VALUES ($1,$2,$3) 
     RETURNING id, email, username`,
    [email, username, hashedPassword]
  );

  const user = result.rows[0];
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(201).json({ user, accessToken, refreshToken });
}

// ---- Login ----
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const db = getDb();
  const result = await db.query(
    'SELECT id, email, username, password FROM users WHERE email=$1',
    [email]
  );

  if (!result.rows.length) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.json({
    user: { id: user.id, email: user.email, username: user.username },
    accessToken,
    refreshToken,
  });
}

// ---- Refresh Token ----
async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });

  try {
    const redis = getRedis();
    const isBlacklisted = await redis.get(`blacklist:refresh:${refreshToken}`);
    if (isBlacklisted) return res.status(401).json({ error: 'Refresh token revoked' });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    const db = getDb();
    const result = await db.query('SELECT id, email, username FROM users WHERE id=$1', [payload.sub]);

    if (!result.rows.length) return res.status(401).json({ error: 'Invalid refresh token' });

    const user = result.rows[0];
    const accessToken = signAccessToken(user);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

// ---- Verify Tokens ----
function verifyAccessToken(req, res) {
  const token = req.body.token || req.query.token || (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(400).json({ valid: false, reason: 'Missing token' });

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret');
    return res.json({ valid: true });
  } catch (e) {
    return res.status(401).json({ valid: false, reason: 'Invalid or expired' });
  }
}

async function verifyRefreshToken(req, res) {
  const token = req.body.token;
  if (!token) return res.status(400).json({ valid: false, reason: 'Missing token' });

  try {
    const redis = getRedis();
    const isBlacklisted = await redis.get(`blacklist:refresh:${token}`);
    if (isBlacklisted) return res.status(401).json({ valid: false, reason: 'Revoked' });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    return res.json({ valid: true });
  } catch (e) {
    return res.status(401).json({ valid: false, reason: 'Invalid or expired' });
  }
}

// ---- Logout ----
async function logout(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    const expSeconds = decoded.exp;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const ttl = Math.max(expSeconds - nowSeconds, 0);

    const redis = getRedis();
    await redis.set(`blacklist:refresh:${refreshToken}`, '1', 'EX', ttl || 60 * 60 * 24);

    return res.json({ loggedOut: true });
  } catch (e) {
    return res.status(200).json({ loggedOut: true });
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  logout,
};
