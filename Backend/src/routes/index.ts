import { Router } from "express";

import { login } from "../controllers/auth.controller";
import authRoutes from "./auth.routes";
import discoveryRoutes from "./discovery.routes";
import drinkRoutes from "./drink.routes";
import eventRoutes from "./event.routes";
import inviteRoutes from "./invite.routes";
import userRoutes from "./user.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

// Alias for assignment requirement: POST /login
router.post("/login", login);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/", discoveryRoutes);
router.use("/events", eventRoutes);
router.use("/", drinkRoutes);
router.use("/", inviteRoutes);

export default router;
