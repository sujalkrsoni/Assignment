export type SwipeIntent = "REJECT" | "INTERESTED" | "GO_TONIGHT";

export type InviteStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CONFIRMED"
  | "EXPIRED";

export interface AuthUser {
  id: string;
  name: string;
  age: number;
  tags: string[];
  mutualsCount: number;
  isVerified: boolean;
  imageUrl?: string;
  role: "USER" | "ADMIN";
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  age: number;
  email: string;
  password: string;
  tags: string[];
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  tags: string[];
  mutualsCount: number;
  isVerified: boolean;
  imageUrl?: string;
}

export interface EventItem {
  _id: string;
  name: string;
  price: number;
  platformFee: number;
  location: string;
  startsAt: string;
  isActive: boolean;
  imageUrl?: string;
}

export interface DrinkItem {
  _id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
}

export interface InviteParty {
  _id: string;
  name: string;
  age: number;
  isVerified: boolean;
  imageUrl?: string;
}

export interface InviteEvent {
  _id: string;
  name: string;
  location: string;
  startsAt: string;
  price: number;
  platformFee: number;
  imageUrl?: string;
}

export interface InviteItem {
  _id: string;
  senderId: string | InviteParty;
  receiverId: string | InviteParty;
  eventId: string | InviteEvent;
  status: InviteStatus;
  drinkOffered: boolean;
  drinkPrice: number;
  ticketPrice: number;
  platformFee: number;
  totalAmount: number;
  eventPaid: boolean;
  drinkReserved: boolean;
  drinkCharged: boolean;
  expiresAt: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}
