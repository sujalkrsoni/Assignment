import { Request, Response } from "express";

import * as eventService from "../services/event.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const requestedLimit = Number(req.query.limit ?? 3);
  const events = await eventService.listEvents(requestedLimit);

  res.status(200).json({
    success: true,
    message: "Events fetched successfully",
    data: events,
  });
});

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.createEvent(req.body);

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: event,
  });
});
