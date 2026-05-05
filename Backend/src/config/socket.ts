import { Server as HttpServer } from "http";

import { Server } from "socket.io";

import { verifyAuthToken } from "../utils/token.util";

let io: Server | null = null;

const getAllowedOrigins = (): string[] | string => {
  const rawOrigins = process.env.SOCKET_CORS_ORIGIN;

  if (!rawOrigins) {
    return "*";
  }

  const origins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : "*";
};

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const authToken = socket.handshake.auth?.token as string | undefined;
    const authHeader = socket.handshake.headers.authorization;

    const tokenFromHeader =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length).trim()
        : undefined;

    const token = authToken ?? tokenFromHeader;

    if (!token) {
      next(new Error("Unauthorized: token missing"));
      return;
    }

    try {
      const payload = verifyAuthToken(token);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      next();
    } catch (_error) {
      next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const roomName = `user:${socket.data.userId as string}`;
    socket.join(roomName);

    socket.emit("socket:ready", {
      userId: socket.data.userId,
      connectedAt: new Date().toISOString(),
    });
  });

  return io;
};

export const emitToUserRoom = (
  userId: string,
  eventName: string,
  payload: unknown
): void => {
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit(eventName, payload);
};
