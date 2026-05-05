import { Types } from "mongoose";

import User, { IUser, UserRole } from "../models/user.model";
import { ApiError } from "../middlewares/apiError.middleware";
import { hashPassword, verifyPassword } from "../utils/password.util";
import { signAuthToken } from "../utils/token.util";
import { createBaseService } from "./base.service";

export interface CreateUserInput {
  name: string;
  age: number;
  password: string;
  tags?: string[];
  mutualsCount?: number;
  isVerified?: boolean;
  imageUrl?: string;
  role?: UserRole;
  email?: string;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  age?: number;
  password?: string;
  tags?: string[];
  mutualsCount?: number;
  isVerified?: boolean;
  imageUrl?: string;
  role?: UserRole;
  email?: string;
  phone?: string;
}

export interface LoginInput {
  email?: string;
  phone?: string;
  password: string;
}

export interface PublicUser {
  id: string;
  name: string;
  age: number;
  tags: string[];
  mutualsCount: number;
  isVerified: boolean;
  imageUrl?: string;
  role: UserRole;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// using the base service for common db operations like find, findById, create, updateById, deleteById etc.
const baseUserService = createBaseService(User);

const normalizeEmail = (email?: string): string | undefined => {
  return email?.trim().toLowerCase();
};

const normalizePhone = (phone?: string): string | undefined => {
  return phone?.trim();
};

const toPublicUser = (user: IUser): PublicUser => {
  const userId = user._id ? String(user._id) : "";

  return {
    id: userId,
    name: user.name,
    age: user.age,
    tags: user.tags,
    mutualsCount: user.mutualsCount,
    isVerified: user.isVerified,
    imageUrl: user.imageUrl,
    role: user.role,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const ensureCreatePayload = (payload: CreateUserInput): void => {
  if (!payload.name?.trim()) {
    throw new ApiError(400, "Name is required", "NAME_REQUIRED");
  }

  if (!Number.isFinite(payload.age)) {
    throw new ApiError(400, "Age is required", "AGE_REQUIRED");
  }

  if (!payload.email && !payload.phone) {
    throw new ApiError(
      400,
      "Either email or phone is required",
      "IDENTIFIER_REQUIRED"
    );
  }

  if (typeof payload.password !== "string" || payload.password.length < 6) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters",
      "WEAK_PASSWORD"
    );
  }
};


// Service functions
// create user, list users, get user by id, update user, delete user, login
export const createUser = async (payload: CreateUserInput): Promise<PublicUser> => {
  ensureCreatePayload(payload);

  const passwordHash = await hashPassword(payload.password);
  const { password, role, isVerified, ...safePayload } = payload;

  const user = await baseUserService.create({
    ...safePayload,
    email: normalizeEmail(payload.email),
    phone: normalizePhone(payload.phone),
    role: "USER",
    isVerified: false,
    passwordHash,
  } as unknown as Partial<IUser>);

  return toPublicUser(user);
};

export const listUsers = async (): Promise<PublicUser[]> => {
  const users = await baseUserService.findAll({}, { sort: { createdAt: -1 } });
  return users.map((user) => toPublicUser(user));
};

export const getUserById = async (userId: string): Promise<PublicUser> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id", "INVALID_ID");
  }

  const user = await baseUserService.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }

  return toPublicUser(user);
};

export const updateUser = async (
  userId: string,
  payload: UpdateUserInput,
  actorRole: UserRole
): Promise<PublicUser> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id", "INVALID_ID");
  }

  const updatePayload: Record<string, unknown> = {
    ...payload,
    email: normalizeEmail(payload.email),
    phone: normalizePhone(payload.phone),
  };

  if (typeof payload.password !== "undefined") {
    if (typeof payload.password !== "string" || payload.password.length < 6) {
      throw new ApiError(
        400,
        "Password must be at least 6 characters",
        "WEAK_PASSWORD"
      );
    }

    updatePayload.passwordHash = await hashPassword(payload.password);
    delete updatePayload.password;
  }

  if (actorRole !== "ADMIN") {
    delete updatePayload.role;
    delete updatePayload.isVerified;
  }

  const user = await baseUserService.updateById(userId, updatePayload as never);

  if (!user) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }

  return toPublicUser(user);
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id", "INVALID_ID");
  }

  const deletedUser = await baseUserService.deleteById(userId);

  if (!deletedUser) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }
};

export const login = async (
  payload: LoginInput
): Promise<{ token: string; user: PublicUser }> => {
  const email = normalizeEmail(payload.email);
  const phone = normalizePhone(payload.phone);

  if (typeof payload.password !== "string" || payload.password.length === 0) {
    throw new ApiError(400, "Password is required", "PASSWORD_REQUIRED");
  }

  if (!email && !phone) {
    throw new ApiError(
      400,
      "Email or phone is required for login",
      "IDENTIFIER_REQUIRED"
    );
  }

  const user = await User.findOne(email ? { email } : { phone }).select(
    "+passwordHash"
  );

  if (!user) {
    throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  const storedPasswordHash = user.get("passwordHash") as string;
  const isPasswordValid = await verifyPassword(payload.password, storedPasswordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  const token = signAuthToken({ userId: user.id, role: user.role });
  return { token, user: toPublicUser(user) };
};

export const userService = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
};
