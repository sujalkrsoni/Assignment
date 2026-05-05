import { NextFunction, Request, Response } from "express";

import { UserRole } from "../models/user.model";
import { ApiError } from "./apiError.middleware";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required", "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, "You are not allowed to access this resource", "FORBIDDEN"));
      return;
    }

    next();
  };
};

export const authorizeSelfOrAdmin = (paramKey = "id") => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required", "UNAUTHORIZED"));
      return;
    }

    const resourceId = req.params[paramKey];

    if (req.user.role === "ADMIN" || req.user.userId === resourceId) {
      next();
      return;
    }

    next(new ApiError(403, "You can only access your own account", "FORBIDDEN"));
  };
};
