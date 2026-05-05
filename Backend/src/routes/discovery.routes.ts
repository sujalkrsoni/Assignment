import { Router } from "express";

import { getProfiles, swipeProfile } from "../controllers/discovery.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = Router();

router.use(authenticate);
router.get("/profiles", getProfiles);
router.post("/profiles/:profileId/swipe", swipeProfile);

export default router;
