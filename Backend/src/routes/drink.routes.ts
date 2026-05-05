import { Router } from "express";

import { createEventDrink, getEventDrinks } from "../controllers/drink.controller";
import { authenticate } from "../middlewares/authenticate.middleware";
import { authorizeRoles } from "../middlewares/authorization.middleware";

const router = Router();

router.get("/events/:eventId/drinks", authenticate, getEventDrinks);
router.post(
  "/events/:eventId/drinks",
  authenticate,
  authorizeRoles("ADMIN"),
  createEventDrink
);

export default router;
