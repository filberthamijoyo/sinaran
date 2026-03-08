import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

let io: SocketServer | null = null;

// Map userId → socketId for targeted notifications
const userSockets = new Map<string, string>();

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3002'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    // Client sends their userId after connecting
    socket.on('register', (userId: string) => {
      userSockets.set(userId, socket.id);
    });

    socket.on('disconnect', () => {
      for (const [uid, sid] of userSockets.entries()) {
        if (sid === socket.id) {
          userSockets.delete(uid);
          break;
        }
      }
    });
  });

  return io;
};

export const notifyUser = (
  userId: string,
  event: string,
  data: object
): void => {
  if (!io) return;
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

export const getIo = (): SocketServer | null => io;
