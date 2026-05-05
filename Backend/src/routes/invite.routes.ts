import { Router } from "express";

import {
  createInvite,
  getInvites,
  respondToInvite,
} from "../controllers/invite.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = Router();

router.use(authenticate);

// Required assessment APIs
router.post("/invite", createInvite);
router.post("/invite/respond", respondToInvite);
router.get("/invites", getInvites);

export default router;
