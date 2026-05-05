import mongoose, { Document, Schema } from "mongoose";

export const INVITE_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CONFIRMED",
  "EXPIRED",
] as const;

export type InviteStatus = (typeof INVITE_STATUSES)[number];

export interface IInvite extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  status: InviteStatus;
  drinkOffered: boolean;
  drinkPrice: number;
  ticketPrice: number;
  platformFee: number;
  totalAmount: number;
  eventPaid: boolean;
  drinkReserved: boolean;
  drinkCharged: boolean;
  expiresAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inviteSchema = new Schema<IInvite>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: INVITE_STATUSES,
      default: "PENDING",
      required: true,
    },
    drinkOffered: {
      type: Boolean,
      default: false,
    },
    drinkPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    eventPaid: {
      type: Boolean,
      default: true,
    },
    drinkReserved: {
      type: Boolean,
      default: false,
    },
    drinkCharged: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

inviteSchema.pre("validate", function () {
  if (this.senderId?.toString() === this.receiverId?.toString()) {
    throw new Error("A user cannot invite themselves.");
  }
});

inviteSchema.index(
  { senderId: 1, receiverId: 1, eventId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } }
);
inviteSchema.index({ receiverId: 1, status: 1, createdAt: -1 });
inviteSchema.index({ senderId: 1, status: 1, createdAt: -1 });
inviteSchema.index({ expiresAt: 1 });

export default mongoose.model<IInvite>("Invite", inviteSchema);
