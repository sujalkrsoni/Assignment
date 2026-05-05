import { Request, Response } from "express";

import * as drinkService from "../services/drink.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getEventDrinks = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params as { eventId: string };
  const drinks = await drinkService.getDrinksByEvent(eventId);

  res.status(200).json({
    success: true,
    message: "Drinks fetched successfully",
    data: drinks,
  });
});

export const createEventDrink = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params as { eventId: string };
  const drink = await drinkService.createDrink({
    eventId,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: "Drink created successfully",
    data: drink,
  });
});
