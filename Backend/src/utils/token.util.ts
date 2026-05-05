import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

import { UserRole } from "../models/user.model";

export interface TokenPayload {
  userId: string;
  role: UserRole;
  exp: number;
  iat: number;
}

interface SignTokenInput {
  userId: string;
  role: UserRole;
}

const getTokenSecret = (): string => {
  const tokenSecret = process.env.JWT_SECRET;

  if (!tokenSecret) {
    throw new Error("JWT_SECRET is missing. Add it to your .env file.");
  }

  return tokenSecret;
};

const getExpiresIn = (): SignOptions["expiresIn"] => {
  const rawSeconds = process.env.JWT_TTL_SECONDS ?? "604800";
  const parsed = Number(rawSeconds);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return 604800; // 7 days
  }

  return parsed;
};

export const signAuthToken = ({ userId, role }: SignTokenInput): string => {
  return jwt.sign({ userId, role }, getTokenSecret(), {
    algorithm: "HS256",
    expiresIn: getExpiresIn(),
  });
};

export const verifyAuthToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, getTokenSecret()) as JwtPayload | string;

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload.");
  }

  const userId = decoded.userId;
  const role = decoded.role;
  const exp = decoded.exp;
  const iat = decoded.iat;

  if (
    typeof userId !== "string" ||
    typeof role !== "string" ||
    typeof exp !== "number" ||
    typeof iat !== "number"
  ) {
    throw new Error("Invalid token payload.");
  }

  return {
    userId,
    role: role as UserRole,
    exp,
    iat,
  };
};
