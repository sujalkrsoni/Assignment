import type { DrinkItem } from "../types";

interface DrinkCardProps {
  drink: DrinkItem;
  selected: boolean;
  onToggle: (drinkId: string) => void;
}

export const DrinkCard = ({ drink, selected, onToggle }: DrinkCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(drink._id)}
      aria-pressed={selected}
      className={`group flex items-center gap-4 p-3 rounded-2xl border-2 transition-all duration-200 text-left w-full ${
        selected
          ? "border-pink-400 bg-pink-50/80 shadow-md shadow-pink-100"
          : "border-gray-100 bg-white hover:border-purple-200 hover:shadow-md"
      }`}
    >
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
        <img
          src={drink.imageUrl}
          alt={drink.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 text-sm leading-tight">{drink.name}</h4>
        <p className="text-gray-500 text-xs mt-0.5 truncate">{drink.description}</p>
        <span className="inline-block text-[10px] font-bold text-pink-600 uppercase tracking-wider mt-1">
          {selected ? "✓ Selected" : "Tap to add"}
        </span>
      </div>

      {/* Price */}
      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 shadow-sm">
        ${drink.price}
      </span>
    </button>
  );
};
