import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Star, PartyPopper, Loader2, Check, Info } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { api, extractErrorMessage } from "../lib/api";
import type { DrinkItem, EventItem, InviteItem } from "../types";

export const SummaryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const receiverId = searchParams.get("receiverId");
  const receiverName = searchParams.get("receiverName") ?? "your match";
  const eventId = searchParams.get("eventId");
  const drinkOffered = searchParams.get("drinkOffered") === "true";
  const drinkPrice = Number(searchParams.get("drinkPrice") ?? "0");
  const drinkIds = searchParams.get("drinkIds") ?? "";
  const selectedDrinkIds = drinkIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState<InviteItem | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const [eventsResponse, drinksResponse] = await Promise.all([
          api.get<{
            success: boolean;
            data: EventItem[];
          }>("/events?limit=20"),
          api.get<{ success: boolean; data: DrinkItem[] }>(`/events/${eventId}/drinks`),
        ]);

        const match = eventsResponse.data.data.find((entry) => entry._id === eventId);
        if (!match) {
          setError("Selected event was not found.");
        }
        setEvent(match ?? null);
        setDrinks(drinksResponse.data.data);
      } catch (requestError) {
        setError(extractErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadEvent();
  }, [eventId]);

  const ticketPrice = event?.price ?? 0;
  const platformFee = event?.platformFee ?? 0;
  const conditionalDrink = drinkOffered ? drinkPrice : 0;
  const payableNow = ticketPrice + platformFee;
  const payableIfAccepted = payableNow + conditionalDrink;
  const selectedDrinks = drinks.filter((drink) =>
    selectedDrinkIds.includes(drink._id)
  );

  const canSend = useMemo(
    () => Boolean(user && receiverId && event && !submitting),
    [user, receiverId, event, submitting]
  );

  const submitInvite = async () => {
    if (!user || !receiverId || !event) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await api.post<{
        success: boolean;
        data: InviteItem;
      }>("/invite", {
        senderId: user.id,
        receiverId,
        eventId: event._id,
        drinkOffered,
        drinkPrice: conditionalDrink,
      });

      setInvite(response.data.data);
    } catch (requestError) {
      setError(extractErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-xs lg:text-sm transition-colors"
        >
          <span className="text-lg">←</span> Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-[10px]">
            M
          </div>
          <span className="text-xs lg:text-sm font-bold text-violet-600">partywitty</span>
        </div>
      </div>

      <div className="animate-fadeInUp">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-3xl shadow-lg overflow-hidden">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 mx-auto border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-gray-500 text-xs lg:text-sm font-medium">Loading summary...</p>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && event && !invite && (
            <div className="p-5 lg:p-8">
              {/* Event Info */}
              <div className="flex items-start justify-between mb-6 pb-5 border-b border-gray-100">
                <div className="flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-base lg:text-lg font-bold text-gray-900 leading-tight">{event.name}</h2>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-yellow-500 text-[10px] font-bold">4.1</span>
                      <span className="text-gray-400 text-[10px]">Review (03)</span>
                    </div>
                  </div>

                  {/* Receiver */}
                  <div className="flex items-center gap-2.5 mt-4">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                      {receiverName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs lg:text-sm flex items-center gap-1">
                        {receiverName} <span className="text-blue-500 text-[10px]">✔</span>
                      </p>
                      <p className="text-gray-500 text-[10px] lg:text-xs flex items-center gap-1">
                        <MapPin size={10} className="text-gray-400" /> {event.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right bg-violet-50 px-3 py-2 rounded-xl shrink-0">
                  <p className="text-violet-600 text-[9px] lg:text-[10px] font-bold uppercase tracking-tighter">
                    {new Date(event.startsAt).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </p>
                  <p className="text-violet-700 text-base lg:text-xl font-bold leading-none mt-0.5">
                    {new Date(event.startsAt).getDate()}
                  </p>
                </div>
              </div>

              {/* Ticket Price */}
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-700 font-semibold text-sm">Tickets Price</span>
                <span className="font-bold text-gray-900">${ticketPrice.toFixed(2)}</span>
              </div>

              {/* Drink Details */}
              {selectedDrinks.length > 0 && (
                <div className="py-3 border-t border-gray-50">
                  {selectedDrinks.map((drink) => (
                    <div key={drink._id} className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img src={drink.imageUrl} alt={drink.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{drink.name}</p>
                        <p className="text-gray-500 text-xs">{drink.description}</p>
                      </div>
                      <span className="font-bold text-gray-900">${drink.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mt-2">
                    <span className="inline-block bg-green-100 text-green-700 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                      You only pay for the drink if they accept your invite
                    </span>
                  </div>
                </div>
              )}

              {/* Bill Details */}
              <div className="border-t-2 border-gray-100 mt-4 pt-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Bill Details</h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Tickets Amount</span>
                    <span className="font-semibold text-gray-900 text-sm">${ticketPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-violet-600 text-sm underline underline-offset-2 cursor-help">Platform & Other Charges</span>
                    <span className="font-semibold text-gray-900 text-sm">${platformFee.toFixed(2)}</span>
                  </div>
                  {conditionalDrink > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Drink (if accepted)</span>
                      <span className="font-semibold text-gray-900 text-sm">${conditionalDrink.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="font-bold text-gray-900">Grand Total</span>
                    <span className="font-bold text-gray-900 text-lg">${payableIfAccepted.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="mt-5 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  defaultChecked
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="terms" className="text-gray-500 text-xs">
                  I agree to the <span className="text-violet-600 underline cursor-pointer">Terms of Service</span> and{" "}
                  <span className="text-violet-600 underline cursor-pointer">Privacy Policy</span>.
                </label>
              </div>

              {/* CTA */}
              <div className="mt-6 flex items-center gap-3">
                <button className="w-10 h-10 rounded-full border-2 border-green-400 text-green-500 flex items-center justify-center hover:bg-green-50 transition-colors">
                  <Check size={20} />
                </button>
                <button className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Info size={20} />
                </button>
                <button
                  type="button"
                  onClick={submitInvite}
                  disabled={!canSend}
                  className="flex-1 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    "Make The Move Now"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {invite && (
            <div className="p-8 text-center animate-confetti">
              <div className="w-20 h-20 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-violet-600">
                <PartyPopper size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Invite Sent!</h3>
              <p className="text-gray-500 mb-1">
                Status: <span className="font-bold text-violet-600">{invite.status}</span>
              </p>
              <div className="flex items-center justify-center gap-3 mt-2 mb-6">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  eventPaid: {String(invite.eventPaid)}
                </span>
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-semibold">
                  drinkReserved: {String(invite.drinkReserved)}
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold">
                  drinkCharged: {String(invite.drinkCharged)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/inbox")}
                className="px-8 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/25 text-sm"
              >
                Open Inbox →
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
      </div>
    </div>
  );
};
