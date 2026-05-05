import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  name: string;
  price: number;
  platformFee: number;
  location: string;
  startsAt: Date;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ isActive: 1, startsAt: 1 });

export default mongoose.model<IEvent>("Event", eventSchema);
