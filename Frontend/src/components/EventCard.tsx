import type { EventItem } from "../types";

interface EventCardProps {
  event: EventItem;
  onSelect: (eventId: string) => void;
}

const formatDate = (isoDate: string): string => {
  const d = new Date(isoDate);
  const day = d.toLocaleDateString("en-US", { weekday: "long" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time} onwards`;
};

export const EventCard = ({ event, onSelect }: EventCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(event._id)}
      aria-label={`Select ${event.name}`}
      className="group text-left w-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center">
            <span className="text-white/90 text-4xl">🎉</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badges */}
        {event.isActive && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
            Happening Now
          </span>
        )}
        <span className="absolute top-3 right-3 bg-violet-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          Vibe Matches
        </span>

        {/* Bottom overlay info */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white/70 text-[10px] uppercase tracking-wider font-semibold">
            {event.location}
          </p>
          <h3 className="text-white text-lg font-bold leading-tight">{event.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-yellow-400 text-xs">★ 4.1</span>
            <span className="text-white/60 text-[11px]">{formatDate(event.startsAt)}</span>
          </div>
        </div>
      </div>

      {/* Content below image */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900 font-bold text-sm">{event.name}</p>
            <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
              📍 {event.location}
            </p>
          </div>
          <div className="text-right">
            <span className="text-green-600 font-bold text-sm">${event.price}</span>
            <p className="text-gray-400 text-[10px]">+ ${event.platformFee} fee</p>
          </div>
        </div>
      </div>
    </button>
  );
};
