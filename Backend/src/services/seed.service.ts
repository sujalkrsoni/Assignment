import Drink from "../models/drink.model";
import Event from "../models/event.model";
import User from "../models/user.model";
import { hashPassword } from "../utils/password.util";

const buildFutureDate = (daysAhead: number, hour = 20): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const DEMO_USERS = [
  {
    name: "Zoe Carter",
    age: 26,
    tags: ["Art", "Coffee", "City Walks"],
    mutualsCount: 7,
    isVerified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80",
    email: "zoe@example.com",
  },
  {
    name: "Maya Singh",
    age: 24,
    tags: ["Live Music", "Foodie", "Dogs"],
    mutualsCount: 4,
    isVerified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
    email: "maya@example.com",
  },
  {
    name: "Liam Brooks",
    age: 27,
    tags: ["Movies", "Fitness", "Travel"],
    mutualsCount: 5,
    isVerified: false,
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    email: "liam@example.com",
  },
  {
    name: "Nina Roy",
    age: 25,
    tags: ["Books", "Yoga", "Brunch"],
    mutualsCount: 6,
    isVerified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    email: "nina@example.com",
  },
];

const DEMO_EVENTS = [
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
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
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

const DEMO_DRINKS_BY_INDEX = [
  [
    {
      name: "Spark Citrus",
      description: "Citrus tonic with fresh mint",
      price: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Berry Fizz",
      description: "Mixed berry soda and lime",
      price: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
    },
  ],
  [
    {
      name: "Cold Brew Twist",
      description: "Coffee tonic with orange peel",
      price: 10,
      imageUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Vanilla Iced Latte",
      description: "Smooth cold latte with vanilla notes",
      price: 11,
      imageUrl:
        "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
    },
  ],
  [
    {
      name: "Classic Mojito",
      description: "Mint, lime, soda and cane",
      price: 11,
      imageUrl:
        "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Peach Spritz",
      description: "Peach sparkling blend with basil",
      price: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1582106245687-cbb466a9f07f?auto=format&fit=crop&w=900&q=80",
    },
  ],
];

const shouldSeed = (): boolean => process.env.SEED_DEMO_DATA !== "false";

export const ensureDemoData = async (): Promise<void> => {
  if (!shouldSeed()) {
    return;
  }

  const demoPassword = process.env.DEMO_USER_PASSWORD ?? "Password@123";
  const passwordHash = await hashPassword(demoPassword);

  // Upsert demo users so existing data also gets image/backfill updates.
  for (const demoUser of DEMO_USERS) {
    await User.updateOne(
      { email: demoUser.email },
      {
        $set: {
          name: demoUser.name,
          age: demoUser.age,
          tags: demoUser.tags,
          mutualsCount: demoUser.mutualsCount,
          isVerified: demoUser.isVerified,
          imageUrl: demoUser.imageUrl,
          role: "USER",
        },
        $setOnInsert: {
          email: demoUser.email,
          passwordHash,
        },
      },
      { upsert: true }
    );
  }

  // Upsert demo events by name.
  for (const demoEvent of DEMO_EVENTS) {
    await Event.updateOne(
      { name: demoEvent.name },
      {
        $set: {
          price: demoEvent.price,
          platformFee: demoEvent.platformFee,
          location: demoEvent.location,
          startsAt: demoEvent.startsAt,
          isActive: demoEvent.isActive,
          imageUrl: demoEvent.imageUrl,
        },
      },
      { upsert: true }
    );
  }

  const events = await Event.find({ name: { $in: DEMO_EVENTS.map((e) => e.name) } });
  const eventByName = new Map(events.map((event) => [event.name, event]));

  // Upsert drinks for each seeded event.
  for (const [index, demoEvent] of DEMO_EVENTS.entries()) {
    const event = eventByName.get(demoEvent.name);
    if (!event) {
      continue;
    }
    const catalog = DEMO_DRINKS_BY_INDEX[index] ?? DEMO_DRINKS_BY_INDEX[0];
    for (const drink of catalog) {
      await Drink.updateOne(
        { eventId: event._id, name: drink.name },
        {
          $set: {
            description: drink.description,
            price: drink.price,
            imageUrl: drink.imageUrl,
            isActive: true,
          },
          $setOnInsert: {
            eventId: event._id,
            name: drink.name,
          },
        },
        { upsert: true }
      );
    }
  }
};
