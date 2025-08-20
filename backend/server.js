
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDb } = require('./utils/db');
const { initRedis } = require('./utils/redis');
const { initSocket } = require('./utils/socket');

const authRoutes = require('./routes/auth.routes');
const communityRoutes = require('./routes/communities.routes');
const gameRoutes = require('./routes/games.routes');
const messageRoutes = require('./routes/messages.routes');
const postRoutes = require('./routes/posts.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.set('io', io);

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ status: 'ok', name: 'TheSocial API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 3000;

Promise.all([initDb(), initRedis()])
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize services', err);
    process.exit(1);
  });
