import mongoose from "mongoose";
import { Server } from "http";

let isConnected = false;
let isShuttingDown = false;

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to your .env file.");
  }

  if (isConnected) {
    return;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  isConnected = true;

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("MongoDB disconnected.");
  });

  console.log(" 🌐 MongoDB connected  ✅✅✅   .");
};

const closeHttpServer = (server: Server): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

export const registerShutdownHandlers = (server: Server): void => {
  const gracefulShutdown = async (signal: "SIGINT" | "SIGTERM") => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`${signal} received. Starting graceful shutdown...`);

    try {
      await closeHttpServer(server);
      await mongoose.connection.close();
      console.log("Graceful shutdown completed.");
      process.exit(0);
    } catch (error) {
      console.error("Graceful shutdown failed:", error);
      process.exit(1);
    }
  };

  process.once("SIGINT", () => {
    void gracefulShutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void gracefulShutdown("SIGTERM");
  });
};
