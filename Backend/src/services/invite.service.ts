import { Types } from "mongoose";

import { emitToUserRoom } from "../config/socket";
import { ApiError } from "../middlewares/apiError.middleware";
import Event from "../models/event.model";
import Invite, { IInvite } from "../models/invite.model";
import Swipe from "../models/swipe.model";
import User from "../models/user.model";

const INVITE_TTL_HOURS = 24;
const DEFAULT_DRINK_PRICE = 12;

const shouldEnforceVerificationGate = (): boolean => {
  return process.env.ENFORCE_VERIFICATION_GATE === "true";
};

export type InviteAction = "ACCEPT" | "REJECT";

export interface CreateInviteInput {
  senderId: string;
  receiverId: string;
  eventId: string;
  drinkOffered: boolean;
  drinkPrice?: number;
}

export interface RespondInviteInput {
  inviteId: string;
  action: InviteAction;
  userId: string;
}

interface InviteRealtimePayload {
  inviteId: string;
  senderId: string;
  receiverId: string;
  eventId: string;
  status: string;
  drinkOffered: boolean;
  drinkCharged: boolean;
  eventPaid: boolean;
  updatedAt: string;
}

const assertValidObjectId = (id: string, label: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`, "INVALID_ID");
  }
};

const expireInviteIfNeeded = async (invite: IInvite): Promise<IInvite> => {
  if (invite.status !== "PENDING") {
    return invite;
  }

  if (invite.expiresAt.getTime() > Date.now()) {
    return invite;
  }

  invite.status = "EXPIRED";
  invite.drinkReserved = false;
  await invite.save();
  return invite;
};

const buildInviteRealtimePayload = (invite: IInvite): InviteRealtimePayload => {
  return {
    inviteId: String(invite._id),
    senderId: String(invite.senderId),
    receiverId: String(invite.receiverId),
    eventId: String(invite.eventId),
    status: invite.status,
    drinkOffered: invite.drinkOffered,
    drinkCharged: invite.drinkCharged,
    eventPaid: invite.eventPaid,
    updatedAt: invite.updatedAt.toISOString(),
  };
};

export const createInvite = async (payload: CreateInviteInput): Promise<IInvite> => {
  assertValidObjectId(payload.senderId, "senderId");
  assertValidObjectId(payload.receiverId, "receiverId");
  assertValidObjectId(payload.eventId, "eventId");

  if (payload.senderId === payload.receiverId) {
    throw new ApiError(400, "Sender and receiver cannot be the same", "INVALID_INVITE");
  }

  const [sender, receiver, event] = await Promise.all([
    User.findById(payload.senderId).select("isVerified"),
    User.findById(payload.receiverId).select("name"),
    Event.findById(payload.eventId),
  ]);

  if (!sender) {
    throw new ApiError(404, "Sender not found", "NOT_FOUND");
  }

  if (!receiver) {
    throw new ApiError(404, "Receiver not found", "NOT_FOUND");
  }

  if (!event || !event.isActive) {
    throw new ApiError(404, "Event not found or inactive", "NOT_FOUND");
  }

  if (shouldEnforceVerificationGate() && !sender.isVerified) {
    throw new ApiError(
      403,
      "You must be verified before sending invites",
      "VERIFICATION_REQUIRED"
    );
  }

  // Optional extension: ensure sender has already shown interest.
  const senderInterest = await Swipe.exists({
    fromUserId: payload.senderId,
    toUserId: payload.receiverId,
    intent: { $in: ["INTERESTED", "GO_TONIGHT"] },
  });

  if (!senderInterest) {
    throw new ApiError(
      400,
      "Show interest first (right swipe or Go Tonight) before inviting",
      "INTEREST_REQUIRED"
    );
  }

  const existingPendingInvite = await Invite.findOne({
    senderId: payload.senderId,
    receiverId: payload.receiverId,
    eventId: payload.eventId,
    status: "PENDING",
  });

  if (existingPendingInvite) {
    throw new ApiError(409, "A pending invite already exists", "DUPLICATE_INVITE");
  }

  const drinkOffered = Boolean(payload.drinkOffered);
  const drinkPrice = drinkOffered
    ? Math.max(0, payload.drinkPrice ?? DEFAULT_DRINK_PRICE)
    : 0;

  const invite = await Invite.create({
    senderId: payload.senderId,
    receiverId: payload.receiverId,
    eventId: payload.eventId,
    status: "PENDING",
    drinkOffered,
    drinkPrice,
    ticketPrice: event.price,
    platformFee: event.platformFee,
    totalAmount: event.price + event.platformFee,
    eventPaid: true,
    drinkReserved: drinkOffered,
    drinkCharged: false,
    expiresAt: new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000),
  });

  const realtimePayload = buildInviteRealtimePayload(invite);
  emitToUserRoom(payload.receiverId, "invite:created", realtimePayload);
  emitToUserRoom(payload.senderId, "invite:sent", realtimePayload);

  return invite;
};

export const respondToInvite = async (
  payload: RespondInviteInput
): Promise<IInvite> => {
  assertValidObjectId(payload.inviteId, "inviteId");
  assertValidObjectId(payload.userId, "userId");

  if (!["ACCEPT", "REJECT"].includes(payload.action)) {
    throw new ApiError(400, "Action must be ACCEPT or REJECT", "INVALID_ACTION");
  }

  const invite = await Invite.findById(payload.inviteId);

  if (!invite) {
    throw new ApiError(404, "Invite not found", "NOT_FOUND");
  }

  if (String(invite.receiverId) !== payload.userId) {
    throw new ApiError(403, "Only receiver can respond to this invite", "FORBIDDEN");
  }

  const latestInviteState = await expireInviteIfNeeded(invite);

  if (latestInviteState.status !== "PENDING") {
    throw new ApiError(409, "This invite is no longer pending", "INVITE_LOCKED");
  }

  if (payload.action === "ACCEPT") {
    latestInviteState.status = "CONFIRMED";
    latestInviteState.drinkCharged = latestInviteState.drinkOffered;
  } else {
    latestInviteState.status = "REJECTED";
    latestInviteState.drinkCharged = false;
    latestInviteState.drinkReserved = false;
  }

  latestInviteState.respondedAt = new Date();
  await latestInviteState.save();

  const realtimePayload = buildInviteRealtimePayload(latestInviteState);
  emitToUserRoom(payload.userId, "invite:updated", realtimePayload);
  emitToUserRoom(String(latestInviteState.senderId), "invite:updated", realtimePayload);

  return latestInviteState;
};

export interface GetInvitesQuery {
  userId: string;
  box?: "received" | "sent" | "all";
}

export const getInvites = async (query: GetInvitesQuery): Promise<IInvite[]> => {
  assertValidObjectId(query.userId, "userId");

  // Keep expiry consistent at read-time without cron.
  await Invite.updateMany(
    {
      status: "PENDING",
      expiresAt: { $lt: new Date() },
    },
    {
      $set: {
        status: "EXPIRED",
        drinkReserved: false,
      },
    }
  );

  const box = query.box ?? "received";
  const filter: Record<string, unknown> = {};

  if (box === "received") {
    filter.receiverId = query.userId;
  } else if (box === "sent") {
    filter.senderId = query.userId;
  } else {
    filter.$or = [{ receiverId: query.userId }, { senderId: query.userId }];
  }

  return Invite.find(filter)
    .populate("senderId", "name age isVerified imageUrl")
    .populate("receiverId", "name age isVerified imageUrl")
    .populate("eventId", "name location startsAt price platformFee imageUrl")
    .sort({ createdAt: -1 });
};
