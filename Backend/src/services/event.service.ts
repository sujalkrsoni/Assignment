import { Types } from "mongoose";

import { ApiError } from "../middlewares/apiError.middleware";
import Event, { IEvent } from "../models/event.model";
import { createBaseService } from "./base.service";

export interface CreateEventInput {
  name: string;
  price: number;
  platformFee?: number;
  location: string;
  startsAt: Date | string;
  isActive?: boolean;
  imageUrl?: string;
}

const baseEventService = createBaseService(Event);

const buildFutureDate = (daysAhead: number, hour = 20): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const DEFAULT_EVENT_SEEDS: Array<Partial<IEvent>> = [
  {
    name: "Rooftop Beats Night",
    price: 22,
    platformFee: 3,
    location: "Skyline Lounge",
    startsAt: buildFutureDate(0, 21),
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Sunset Coffee Walk",
    price: 14,
    platformFee: 2,
    location: "Riverfront Cafe Strip",
    startsAt: buildFutureDate(1, 18),
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Live Acoustic Social",
    price: 19,
    platformFee: 2,
    location: "The Vinyl Room",
    startsAt: buildFutureDate(2, 20),
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
  },
];

export const ensureActiveEvents = async (): Promise<void> => {
  const activeEventsCount = await Event.countDocuments({ isActive: true });

  if (activeEventsCount > 0) {
    return;
  }

  await Event.insertMany(DEFAULT_EVENT_SEEDS);
};

export const listEvents = async (limit = 3): Promise<IEvent[]> => {
  await ensureActiveEvents();

  const safeLimit = Math.max(1, Math.min(limit, 20));

  return baseEventService.findAll(
    { isActive: true },
    { sort: { startsAt: 1 }, limit: safeLimit }
  );
};

export const getEarliestActiveEvent = async (): Promise<IEvent | null> => {
  await ensureActiveEvents();
  return Event.findOne({ isActive: true }).sort({ startsAt: 1 });
};

export const getEventById = async (eventId: string): Promise<IEvent> => {
  if (!Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event id", "INVALID_ID");
  }

  const event = await baseEventService.findById(eventId);

  if (!event) {
    throw new ApiError(404, "Event not found", "NOT_FOUND");
  }

  return event;
};

export const createEvent = async (payload: CreateEventInput): Promise<IEvent> => {
  const startsAt = new Date(payload.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    throw new ApiError(400, "Invalid startsAt date", "INVALID_DATE");
  }

  return baseEventService.create({
    name: payload.name?.trim(),
    price: payload.price,
    platformFee: payload.platformFee ?? 0,
    location: payload.location?.trim(),
    startsAt,
    isActive: payload.isActive ?? true,
    imageUrl: payload.imageUrl?.trim(),
  } as Partial<IEvent>);
};
