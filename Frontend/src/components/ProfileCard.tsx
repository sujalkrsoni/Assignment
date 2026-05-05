import type { CSSProperties, PointerEventHandler } from "react";
import { useState } from "react";
import { X, Heart, Link, UserPlus, CheckCircle2 } from "lucide-react";

import type { DiscoveryProfile } from "../types";

interface ProfileCardProps {
  profile: DiscoveryProfile;
  style?: CSSProperties;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
  onLike?: () => void;
  onReject?: () => void;
  onMate?: () => void;
  onGoTonight?: () => void;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const ProfileCard = ({
  profile,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLike,
  onReject,
  onMate,
  onGoTonight,
}: ProfileCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.();
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReject?.();
  };

  const handleMate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMate?.();
  };

  const handleGoTonight = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGoTonight?.();
  };

  return (
    <div
      className="relative w-full max-w-85 aspect-3/5 lg:h-145 bg-[#1E1B2E] rounded-4xl overflow-hidden shadow-2xl shadow-purple-900/30 cursor-grab active:cursor-grabbing select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={style}
    >
      {/* Image Section */}
      <div className="relative w-full h-[65%] overflow-hidden">
        {profile.imageUrl ? (
          <img
            src={profile.imageUrl}
            alt={profile.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-violet-600 to-pink-500 flex items-center justify-center text-7xl font-bold text-white/80">
            {getInitials(profile.name)}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-[#1E1B2E] pointer-events-none" />

        {/* Top-left badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 z-10">
          <CheckCircle2 size={12} className="text-green-500" />
          <span className="text-white text-[10px] font-bold tracking-wide uppercase">
            Match Your Vibe
          </span>
        </div>

        {/* Top-right: + Mate */}
        <button
          onClick={handleMate}
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-3 py-1.5 rounded-full font-bold text-[10px] flex items-center gap-1 z-10 transition-all border border-white/10"
        >
          <UserPlus size={12} /> Mate
        </button>
      </div>

      {/* Content Section */}
      <div className="px-5 pt-3 pb-2 space-y-2">
        {/* Name & Age */}
        <div className="flex items-center gap-2">
          <h2 className="text-white text-xl lg:text-2xl font-bold leading-tight">
            {profile.name}, <span className="font-semibold">{profile.age}</span>
          </h2>
          {profile.isVerified && (
            <span className="bg-blue-500 text-white text-[8px] p-0.5 rounded-full">
              <CheckCircle2 size={8} />
            </span>
          )}
        </div>

        {/* Mutuals */}
        <p className="text-gray-400 text-xs font-medium">
          <span className="text-white font-bold">{profile.mutualsCount}</span> Mutual Mates
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {profile.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-white/5 text-gray-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/5 whitespace-nowrap uppercase tracking-tighter"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-3 px-5">
        {/* Reject */}
        <button
          onClick={handleReject}
          title="Reject"
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-white/80 hover:text-red-400 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <X size={24} />
        </button>

        {/* Go Tonight */}
        <button
          onClick={handleGoTonight}
          className="flex-1 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/30 active:scale-95 uppercase tracking-wider"
        >
          <Link size={16} /> Go Tonight
        </button>

        {/* Like */}
        <button
          onClick={handleLike}
          title="Like"
          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
            isLiked
              ? "bg-green-500/20 border-green-500 text-green-400"
              : "bg-white/5 hover:bg-green-500/20 border-white/10 hover:border-green-500/40 text-white/80 hover:text-green-400"
          }`}
        >
          <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
};
