import { Request, Response } from "express";

import { ApiError } from "../middlewares/apiError.middleware";
import * as inviteService from "../services/invite.service";
import { asyncHandler } from "../utils/asyncHandler";

export const createInvite = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  const { senderId, receiverId, eventId, drinkOffered, drinkPrice } = req.body as {
    senderId: string;
    receiverId: string;
    eventId: string;
    drinkOffered: boolean;
    drinkPrice?: number;
  };

  if (req.user.userId !== senderId) {
    throw new ApiError(403, "Sender must match authenticated user", "FORBIDDEN");
  }

  const invite = await inviteService.createInvite({
    senderId,
    receiverId,
    eventId,
    drinkOffered,
    drinkPrice,
  });

  res.status(201).json({
    success: true,
    message: "Invite sent successfully",
    data: invite,
  });
});

export const respondToInvite = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  const { inviteId, action } = req.body as {
    inviteId: string;
    action: "ACCEPT" | "REJECT";
  };

  const invite = await inviteService.respondToInvite({
    inviteId,
    action,
    userId: req.user.userId,
  });

  res.status(200).json({
    success: true,
    message: "Invite response saved successfully",
    data: invite,
  });
});

export const getInvites = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  const { userId, box } = req.query as {
    userId?: string;
    box?: "received" | "sent" | "all";
  };

  const targetUserId = userId ?? req.user.userId;

  if (targetUserId !== req.user.userId && req.user.role !== "ADMIN") {
    throw new ApiError(403, "You can only view your own invites", "FORBIDDEN");
  }

  const invites = await inviteService.getInvites({
    userId: targetUserId,
    box,
  });

  res.status(200).json({
    success: true,
    message: "Invites fetched successfully",
    data: invites,
  });
});
