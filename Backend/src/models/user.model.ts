import mongoose, { Document, Schema } from "mongoose";

export const USER_ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends Document {
  name: string;
  age: number;
  tags: string[];
  mutualsCount: number;
  isVerified: boolean;
  imageUrl?: string;
  role: UserRole;
  passwordHash: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    tags: {
      type: [String],
      default: [],
    },
    mutualsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "USER",
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

export default mongoose.model<IUser>("User", userSchema);
