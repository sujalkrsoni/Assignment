import { Router } from "express";

import { createEvent, getEvents } from "../controllers/event.controller";
import { authenticate } from "../middlewares/authenticate.middleware";
import { authorizeRoles } from "../middlewares/authorization.middleware";

const router = Router();

router.get("/", authenticate, getEvents);
router.post("/", authenticate, authorizeRoles("ADMIN"), createEvent);

export default router;
