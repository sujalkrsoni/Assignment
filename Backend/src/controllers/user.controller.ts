import { Request, Response } from "express";

import { ApiError } from "../middlewares/apiError.middleware";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.listUsers();

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: users,
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = await userService.getUserById(id);

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  const user = await userService.getUserById(req.user.userId);

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
  }

  const { id } = req.params as { id: string };
  const user = await userService.updateUser(id, req.body, req.user.role);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await userService.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});
