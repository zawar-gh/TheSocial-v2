const { Server } = require('socket.io');
const { getRedis } = require('./redis');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', async (socket) => {
    const redis = getRedis();
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;

    if (userId) {
      await redis.sadd(`user:sockets:${userId}`, socket.id);
    }

    socket.on('join_community', async (communityId) => {
      socket.join(`community:${communityId}`);
    });

    socket.on('leave_community', async (communityId) => {
      socket.leave(`community:${communityId}`);
    });

    socket.on('disconnect', async () => {
      if (userId) {
        await redis.srem(`user:sockets:${userId}`, socket.id);
      }
    });
  });

  return io;
}

module.exports = { initSocket };


