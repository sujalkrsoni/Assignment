import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Clock, Sparkles } from "lucide-react";

import { DrinkCard } from "../components/DrinkCard";
import { useAuth } from "../context/AuthContext";
import { api, extractErrorMessage } from "../lib/api";
import type { DrinkItem } from "../types";

export const DrinkPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [offerDrink, setOfferDrink] = useState(true);
  const [selectedDrinkIds, setSelectedDrinkIds] = useState<string[]>([]);
  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const receiverId = searchParams.get("receiverId");
  const receiverName = searchParams.get("receiverName") ?? "";
  const receiverImage = searchParams.get("receiverImage");
  const eventId = searchParams.get("eventId");

  const missingData = useMemo(
    () => !receiverId || !eventId,
    [receiverId, eventId]
  );

  useEffect(() => {
    const loadDrinks = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await api.get<{ success: boolean; data: DrinkItem[] }>(
          `/events/${eventId}/drinks`
        );
        setDrinks(response.data.data);
      } catch (requestError) {
        setError(extractErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadDrinks();
  }, [eventId]);

  const continueToSummary = () => {
    if (!receiverId || !eventId) {
      return;
    }

    const selectedDrinks = drinks.filter((drink) =>
      selectedDrinkIds.includes(drink._id)
    );
    const drinkTotal = selectedDrinks.reduce((sum, drink) => sum + drink.price, 0);
    const drinkOffered = offerDrink && selectedDrinks.length > 0;

    const nextParams = new URLSearchParams({
      receiverId,
      receiverName,
      eventId,
      drinkOffered: String(drinkOffered),
      drinkPrice: String(drinkTotal),
      drinkIds: selectedDrinkIds.join(","),
    });

    navigate(`/summary?${nextParams.toString()}`);
  };

  const toggleDrink = (drinkId: string) => {
    setSelectedDrinkIds((current) =>
      current.includes(drinkId)
        ? current.filter((id) => id !== drinkId)
        : [...current, drinkId]
    );
  };

  const handleOfferToggle = (value: boolean) => {
    setOfferDrink(value);
    if (!value) {
      setSelectedDrinkIds([]);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <p className="text-gray-400 text-[10px] lg:text-xs font-medium mb-4 lg:mb-6 uppercase tracking-wider">
        Home / Party Package / <span className="text-violet-600">Selected Item</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
        {/* ── Left Panel: User & Venue Info ── */}
        <div className="space-y-4">
          {/* User Badge - Mobile only */}
          <div className="lg:hidden bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-linear-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-xs lg:text-sm font-bold shadow-xl shadow-pink-500/20">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() ?? "U"
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xs">{user?.name}</p>
                <span className="inline-block bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                  Get Verified
                </span>
              </div>
            </div>
          </div>

          {/* User Badge - Desktop only */}
          <div className="hidden lg:block bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() ?? "U"
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
                <span className="inline-block bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Get Verified
                </span>
              </div>
            </div>
          </div>

          {/* Receiver Info */}
          {receiverName && (
            <div className="bg-[#1E1B2E] rounded-2xl overflow-hidden shadow-lg">
              <div className="h-24 lg:h-32 relative">
                {receiverImage ? (
                  <img src={receiverImage} alt={receiverName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-violet-700 to-indigo-900" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-[#1E1B2E] via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="px-4 pb-4 -mt-6 lg:-mt-6 relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-linear-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-[#1E1B2E] overflow-hidden">
                  {receiverImage ? (
                    <img src={receiverImage} alt={receiverName} className="w-full h-full object-cover" />
                  ) : (
                    receiverName.charAt(0).toUpperCase()
                  )}
                </div>
                <h3 className="text-white font-bold text-sm lg:text-base mt-2">{receiverName}</h3>
                <p className="text-gray-400 text-[10px] lg:text-[11px] flex items-center gap-1 mt-1">
                  <MapPin size={10} /> Venue selected
                </p>
                <p className="text-gray-400 text-[10px] lg:text-[11px] flex items-center gap-1 mt-1">
                  <Clock size={10} /> Tonight
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel: Drink Selection ── */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 lg:p-8 shadow-sm animate-fadeInUp">
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
              One Step Before Your First Move
            </h1>
            <p className="text-gray-500 text-xs lg:text-sm">
              Verify your profile to send invites and offer drinks.
            </p>
          </div>

          {missingData ? (
            <div className="border-2 border-dashed border-violet-200 rounded-2xl p-8 text-center bg-violet-50/50">
              <p className="text-violet-700 font-semibold text-sm mb-3">
                Missing invite context. Start from Feed → Events.
              </p>
              <button
                type="button"
                onClick={() => navigate("/feed")}
                className="px-5 py-2.5 bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl text-sm hover:shadow-lg transition-all"
              >
                Go to Feed
              </button>
            </div>
          ) : (
            <>
              {/* Toggle */}
              <label className="flex items-center gap-3 mb-6 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={offerDrink}
                    onChange={(e) => handleOfferToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-linear-to-r peer-checked:from-pink-500 peer-checked:to-rose-500 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                </div>
                <span className="font-semibold text-gray-700 text-sm">
                  Offer drinks with your invite
                </span>
              </label>

              {/* Drink Grid */}
              {offerDrink && (
                <>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    </div>
                  ) : drinks.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">No drinks available for this event yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 animate-fadeInUp">
                      {drinks.map((drink) => {
                        const active = selectedDrinkIds.includes(drink._id);
                        return (
                          <DrinkCard
                            key={drink._id}
                            drink={drink}
                            selected={active}
                            onToggle={toggleDrink}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Conditional Note */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-medium flex items-center gap-2 mb-6">
                <Sparkles size={14} className="text-green-600" />
                Charged only if accepted. No drink charge if invite is rejected or expires.
              </div>

              {/* A Little About Me */}
              <div className="border-t border-gray-100 pt-5 mt-2">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">A Little About Me</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
                  Hey, I'm {user?.name ?? "there"}, into good music and chill nights 🎵
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-5 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-bold rounded-xl transition-all text-sm"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={continueToSummary}
              disabled={
                missingData ||
                loading ||
                (offerDrink && (selectedDrinkIds.length === 0 || drinks.length === 0))
              }
              className="flex-1 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98] uppercase tracking-wider text-xs lg:text-sm"
            >
              Continue to Summary →
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
