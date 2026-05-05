import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";

import { EventCard } from "../components/EventCard";
import { useAuth } from "../context/AuthContext";
import { api, extractErrorMessage } from "../lib/api";
import type { EventItem } from "../types";

export const EventsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("receiverId");
  const receiverName = searchParams.get("receiverName");
  const receiverImage = searchParams.get("receiverImage");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get<{
          success: boolean;
          data: EventItem[];
        }>("/events?limit=3");
        setEvents(response.data.data);
      } catch (requestError) {
        setError(extractErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void fetchEvents();
  }, []);

  const goNext = (selectedEventId: string) => {
    if (!receiverId) {
      return;
    }

    const nextParams = new URLSearchParams({
      receiverId,
      receiverName: receiverName ?? "",
      receiverImage: receiverImage ?? "",
      eventId: selectedEventId,
    });

    navigate(`/drinks?${nextParams.toString()}`);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <p className="text-gray-400 text-[10px] lg:text-xs font-medium mb-4 lg:mb-6 uppercase tracking-wider">
        Home / Party Package / <span className="text-violet-600">Selected Item</span>
      </p>

      {/* Header Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-start justify-between mb-6 lg:mb-8 gap-4">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl px-4 lg:px-6 py-4 shadow-sm flex-1">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
            Pick a plan you&apos;d both enjoy
          </h1>
          {receiverName && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20 shrink-0">
                {receiverName.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-semibold text-xs lg:text-sm">
                {receiverName}
              </span>
              <span className="text-blue-500 text-xs">✔</span>
            </div>
          )}
        </div>

        {/* Current User Badge (Hidden on very small mobile if space is tight, or just stacked) */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-violet-200">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() ?? "U"
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-xs lg:text-sm">{user?.name}</p>
            <span className="inline-block bg-green-500 text-white text-[8px] lg:text-[9px] font-bold px-2 py-0.5 rounded-full">
              Get Verified
            </span>
          </div>
        </div>
      </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Tonight near you</h2>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-full sm:w-64 shadow-sm">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-400"
            />
          </div>
        </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 mx-auto border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Loading events...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 animate-fadeInUp">
          {events.map((event) => (
            <EventCard key={event._id} event={event} onSelect={goNext} />
          ))}
        </div>
      )}

      {/* Missing Context */}
          {!receiverId && (
            <div className="p-5 bg-violet-50 border-2 border-violet-200 rounded-2xl flex items-center gap-3">
              <Sparkles className="text-violet-600" size={20} />
              <p className="text-violet-700 font-semibold text-sm">
                Open this page from discovery "Go Tonight" action to continue invite flow.
              </p>
            </div>
          )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
};
