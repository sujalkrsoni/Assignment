import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { ApiError } from "./apiError.middleware";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details ?? null,
    });
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.errors,
    });
    return;
  }

  if (err instanceof MongooseError.CastError) {
    res.status(400).json({
      success: false,
      message: "Invalid id format",
      code: "INVALID_ID",
    });
    return;
  }

  if (typeof err === "object" && err !== null && "code" in err) {
    const duplicateKeyError = err as { code?: number; keyValue?: unknown };

    if (duplicateKeyError.code === 11000) {
      res.status(409).json({
        success: false,
        message: "Duplicate value found",
        code: "DUPLICATE_KEY",
        details: duplicateKeyError.keyValue ?? null,
      });
      return;
    }
  }

  const message = err instanceof Error ? err.message : "Internal server error";

  res.status(500).json({
    success: false,
    message,
    code: "INTERNAL_SERVER_ERROR",
  });
};
