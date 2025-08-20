const jwt = require('jsonwebtoken');

function authenticateAccessToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing access token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret');
    req.user = { id: payload.sub, email: payload.email, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
}

module.exports = { authenticateAccessToken };


