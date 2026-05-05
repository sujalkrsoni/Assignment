import { Router } from "express";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getMyProfile,
  getUserById,
  updateUser,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate.middleware";
import {
  authorizeRoles,
  authorizeSelfOrAdmin,
} from "../middlewares/authorization.middleware";

const router = Router();

// Public route to create accounts quickly for assessment demos.
router.post("/", createUser);

router.use(authenticate);
router.get("/current", getMyProfile);
router.get("/", authorizeRoles("ADMIN"), getAllUsers);
router.get("/:id", authorizeSelfOrAdmin("id"), getUserById);
router.patch("/:id", authorizeSelfOrAdmin("id"), updateUser);
router.delete("/:id", authorizeRoles("ADMIN"), deleteUser);

export default router;
