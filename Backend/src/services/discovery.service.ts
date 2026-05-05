import { Types } from "mongoose";

import { ApiError } from "../middlewares/apiError.middleware";
import Swipe, { ISwipe, SWIPE_INTENTS, SwipeIntent } from "../models/swipe.model";
import User from "../models/user.model";

export interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  tags: string[];
  mutualsCount: number;
  isVerified: boolean;
  imageUrl?: string;
}

export interface RecordSwipeInput {
  fromUserId: string;
  toUserId: string;
  intent: SwipeIntent;
}

export interface SwipeResult {
  swipe: ISwipe;
  mutualInterest: boolean;
}

export const getDiscoveryProfiles = async (
  userId: string,
  limit = 25
): Promise<DiscoveryProfile[]> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id", "INVALID_ID");
  }

  const swipedProfiles = await Swipe.find({ fromUserId: userId }).select("toUserId");
  const excludedIds = swipedProfiles.map((swipe) => swipe.toUserId);
  excludedIds.push(new Types.ObjectId(userId));

  const users = await User.find(
    { _id: { $nin: excludedIds } },
    "name age tags mutualsCount isVerified imageUrl",
    {
      limit,
      sort: { createdAt: -1 },
    }
  );

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    age: user.age,
    tags: user.tags,
    mutualsCount: user.mutualsCount,
    isVerified: user.isVerified,
    imageUrl: user.imageUrl,
  }));
};

export const recordSwipe = async (payload: RecordSwipeInput): Promise<SwipeResult> => {
  const { fromUserId, toUserId, intent } = payload;

  if (!Types.ObjectId.isValid(fromUserId) || !Types.ObjectId.isValid(toUserId)) {
    throw new ApiError(400, "Invalid user id", "INVALID_ID");
  }

  if (!SWIPE_INTENTS.includes(intent)) {
    throw new ApiError(400, "Invalid swipe intent", "INVALID_INTENT");
  }

  if (fromUserId === toUserId) {
    throw new ApiError(400, "You cannot swipe on yourself", "INVALID_SWIPE");
  }

  const swipe = await Swipe.findOneAndUpdate(
    { fromUserId, toUserId },
    { intent },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const mutualInterest = await Swipe.exists({
    fromUserId: toUserId,
    toUserId: fromUserId,
    intent: { $in: ["INTERESTED", "GO_TONIGHT"] },
  });

  return {
    swipe: swipe as ISwipe,
    mutualInterest: Boolean(mutualInterest),
  };
};
