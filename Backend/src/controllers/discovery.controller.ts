import { Request, Response } from "express";

import { ApiError } from "../middlewares/apiError.middleware";
import * as discoveryService from "../services/discovery.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getProfiles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  const limit = Number(req.query.limit ?? 25);
  const profiles = await discoveryService.getDiscoveryProfiles(req.user.userId, limit);

  res.status(200).json({
    success: true,
    message: "Profiles fetched successfully",
    data: profiles,
  });
});

export const swipeProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  const { profileId } = req.params as { profileId: string };
  const { intent } = req.body as { intent: "REJECT" | "INTERESTED" | "GO_TONIGHT" };

  const result = await discoveryService.recordSwipe({
    fromUserId: req.user.userId,
    toUserId: profileId,
    intent,
  });

  res.status(200).json({
    success: true,
    message: "Swipe saved successfully",
    data: result,
  });
});
