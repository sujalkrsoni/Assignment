import { NextFunction, Request, Response } from "express";

import User from "../models/user.model";
import { ApiError } from "./apiError.middleware";
import { verifyAuthToken } from "../utils/token.util";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing or invalid authorization header", "UNAUTHORIZED");
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const payload = verifyAuthToken(token);

    const user = await User.findById(payload.userId).select("role isVerified");

    if (!user) {
      throw new ApiError(401, "User not found for token", "UNAUTHORIZED");
    }

    req.user = {
      userId: user.id,
      role: user.role,
      isVerified: user.isVerified,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError(401, "Invalid or expired token", "UNAUTHORIZED"));
  }
};
