import { Types } from "mongoose";

import { ApiError } from "../middlewares/apiError.middleware";
import Drink, { IDrink } from "../models/drink.model";
import Event from "../models/event.model";
import { createBaseService } from "./base.service";

export interface CreateDrinkInput {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  isActive?: boolean;
}

const baseDrinkService = createBaseService(Drink);

export const getDrinksByEvent = async (eventId: string): Promise<IDrink[]> => {
  if (!Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event id", "INVALID_ID");
  }

  const event = await Event.findById(eventId).select("_id isActive");
  if (!event || !event.isActive) {
    throw new ApiError(404, "Event not found or inactive", "NOT_FOUND");
  }

  return baseDrinkService.findAll(
    { eventId, isActive: true },
    { sort: { price: 1, createdAt: 1 } }
  );
};

export const createDrink = async (payload: CreateDrinkInput): Promise<IDrink> => {
  if (!Types.ObjectId.isValid(payload.eventId)) {
    throw new ApiError(400, "Invalid event id", "INVALID_ID");
  }

  const event = await Event.findById(payload.eventId).select("_id");
  if (!event) {
    throw new ApiError(404, "Event not found", "NOT_FOUND");
  }

  if (!payload.name?.trim()) {
    throw new ApiError(400, "Drink name is required", "NAME_REQUIRED");
  }

  if (!payload.imageUrl?.trim()) {
    throw new ApiError(400, "Drink imageUrl is required", "IMAGE_REQUIRED");
  }

  return baseDrinkService.create({
    eventId: new Types.ObjectId(payload.eventId),
    name: payload.name.trim(),
    description: payload.description?.trim() ?? "",
    price: payload.price,
    imageUrl: payload.imageUrl.trim(),
    isActive: payload.isActive ?? true,
  } as Partial<IDrink>);
};
