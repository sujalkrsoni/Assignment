import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDB, registerShutdownHandlers } from "./src/config/db";
import { initializeSocket } from "./src/config/socket";
import {
  errorHandler,
  notFoundHandler,
} from "./src/middlewares/errorHandler.middleware";
import { requestLogger } from "./src/middlewares/logger.middleware";
import apiRoutes from "./src/routes";
import { ensureDemoData } from "./src/services/seed.service";

// Load env variables before reading process.env values.
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

// Core security and request middlewares.
app.use(helmet());
app.use(cors());
app.use(requestLogger);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Basic global rate limiting for API routes.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use("/api", apiLimiter);

// Health endpoint for quick monitoring checks.
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api/v1", apiRoutes);

// Keep not-found and error handlers at the end.
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await ensureDemoData();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Enable real-time invite updates via Socket.IO.
    initializeSocket(server);

    // Graceful shutdown support for SIGINT/SIGTERM.
    registerShutdownHandlers(server);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();

export default app;
