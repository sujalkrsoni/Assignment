import { Request, Response } from "express";

import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, password } = req.body as {
    email?: string;
    phone?: string;
    password: string;
  };

  const result = await userService.login({ email, phone, password });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});
