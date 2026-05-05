import mongoose, { Document, Schema } from "mongoose";

export const SWIPE_INTENTS = ["REJECT", "INTERESTED", "GO_TONIGHT"] as const;
export type SwipeIntent = (typeof SWIPE_INTENTS)[number];

export interface ISwipe extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  intent: SwipeIntent;
  createdAt: Date;
  updatedAt: Date;
}

const swipeSchema = new Schema<ISwipe>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    intent: {
      type: String,
      enum: SWIPE_INTENTS,
      required: true,
    },
  },
  { timestamps: true }
);

swipeSchema.pre("validate", function () {
  if (this.fromUserId?.toString() === this.toUserId?.toString()) {
    throw new Error("A user cannot swipe on themselves.");
  }
});

swipeSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
swipeSchema.index({ toUserId: 1, intent: 1, createdAt: -1 });

export default mongoose.model<ISwipe>("Swipe", swipeSchema);
