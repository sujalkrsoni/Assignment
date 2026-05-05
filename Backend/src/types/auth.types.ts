import { UserRole } from "../models/user.model";

export interface AuthUser {
  userId: string;
  role: UserRole;
  isVerified: boolean;
}
