import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Target, GlassWater, CheckCircle, RefreshCw, Compass } from "lucide-react";

import { ProfileCard } from "../components/ProfileCard";
import { useAuth } from "../context/AuthContext";
import { api, extractErrorMessage } from "../lib/api";
import type { DiscoveryProfile, SwipeIntent } from "../types";

interface SwipeState {
  x: number;
  y: number;
  active: boolean;
}

const SWIPE_THRESHOLD_X = 90;
const SWIPE_THRESHOLD_Y = -90;

export const FeedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [swipe, setSwipe] = useState<SwipeState>({ x: 0, y: 0, active: false });

  const activeProfile = profiles[0];

  const fetchProfiles = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<{
        success: boolean;
        data: DiscoveryProfile[];
      }>("/profiles");
      setProfiles(response.data.data);
    } catch (requestError) {
      setError(extractErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfiles();
  }, []);

  const swipeHint = useMemo(() => {
    if (!swipe.active) {
      return "Swipe left, right, or up";
    }
    if (swipe.y <= SWIPE_THRESHOLD_Y) {
      return "Go Tonight";
    }
    if (swipe.x > SWIPE_THRESHOLD_X) {
      return "Interested";
    }
    if (swipe.x < -SWIPE_THRESHOLD_X) {
      return "Reject";
    }
    return "Keep swiping";
  }, [swipe]);


  const removeTopProfile = () => {
    setProfiles((current) => current.slice(1));
  };

  const performSwipe = async (intent: SwipeIntent) => {
    if (!activeProfile || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/profiles/${activeProfile.id}/swipe`, { intent });

      if (intent === "GO_TONIGHT") {
        navigate(
          `/events?receiverId=${activeProfile.id}&receiverName=${encodeURIComponent(activeProfile.name)}&receiverImage=${encodeURIComponent(activeProfile.imageUrl ?? "")}`
        );
      }

      removeTopProfile();
      setSwipe({ x: 0, y: 0, active: false });
    } catch (requestError) {
      setError(extractErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!activeProfile) {
      return;
    }
    startPoint.current = { x: event.clientX, y: event.clientY };
    setSwipe((prev) => ({ ...prev, active: true }));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!startPoint.current) {
      return;
    }
    setSwipe({
      x: event.clientX - startPoint.current.x,
      y: event.clientY - startPoint.current.y,
      active: true,
    });
  };

  const onPointerUp = async () => {
    if (!startPoint.current) {
      return;
    }
    startPoint.current = null;

    if (swipe.y <= SWIPE_THRESHOLD_Y) {
      await performSwipe("GO_TONIGHT");
      return;
    }
    if (swipe.x >= SWIPE_THRESHOLD_X) {
      await performSwipe("INTERESTED");
      return;
    }
    if (swipe.x <= -SWIPE_THRESHOLD_X) {
      await performSwipe("REJECT");
      return;
    }

    setSwipe({ x: 0, y: 0, active: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4 animate-fadeInUp">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-linear-to-br from-violet-400 to-pink-400 flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-3xl">🔥</span>
          </div>
          <p className="text-gray-500 font-semibold text-sm">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh lg:h-screen flex flex-col p-4 lg:p-6 overflow-hidden lg:overflow-hidden overflow-y-auto custom-scrollbar">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          {/* Logo for mobile only since sidebar is hidden */}
          <div className="lg:hidden w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">M</div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Discovery</p>
        </div>
        <button className="bg-linear-to-r from-violet-600 to-purple-600 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-md shadow-violet-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all uppercase tracking-wider">
          Explore Feed
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 min-h-0">
        {/* ── Main Feed ── */}
        <div className="flex flex-col items-center justify-center min-h-0 relative pb-4 lg:pb-0">
          {/* Profile Card Container */}
          <div className="relative shrink-0">
            {activeProfile ? (
              <div style={{ perspective: "1000px" }}>
                <ProfileCard
                  profile={activeProfile}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={() => void onPointerUp()}
                  onPointerCancel={() => setSwipe({ x: 0, y: 0, active: false })}
                  onReject={() => void performSwipe("REJECT")}
                  onLike={() => void performSwipe("INTERESTED")}
                  onGoTonight={() => void performSwipe("GO_TONIGHT")}
                  style={{
                    transform: `translate(${swipe.x}px, ${swipe.y}px) rotate(${swipe.x / 24}deg)`,
                    transition: swipe.active ? "none" : "transform 0.3s ease-out",
                  }}
                />
              </div>
            ) : (
              <div className="w-full max-w-85 aspect-3/5 lg:h-145 border-2 border-dashed border-gray-300 rounded-4xl p-8 text-center bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Compass size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">All caught up!</h3>
                  <p className="text-gray-500 text-xs">There are no more profiles to discover right now.</p>
                  <button
                    type="button"
                    onClick={() => void fetchProfiles()}
                    className="mt-4 px-8 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-xs flex items-center gap-2 mx-auto uppercase tracking-wider"
                  >
                    <RefreshCw size={16} /> Refresh Discovery
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Swipe Hint - Only shown when actively swiping UP */}
          <div className="absolute bottom-4 left-0 right-0 h-14 flex items-center justify-center pointer-events-none">
            {swipe.active && swipe.y < -40 && (
              <div className="text-center px-6 py-2.5 bg-violet-600/90 backdrop-blur-md rounded-full border border-violet-400/30 shadow-xl min-w-45 animate-fadeInUp">
                <span className="text-white text-[12px] font-bold tracking-wide">
                  {swipeHint}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="max-w-sm w-full mt-4 p-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[11px] font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
        </div>

        {/* ── Right Sidebar: Compact Design ── */}
        <aside className="hidden xl:flex flex-col min-h-0">
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-[28px] shadow-sm overflow-hidden flex flex-col max-h-full">
            {/* Header / User */}
            <div className="p-5 border-b border-gray-50 bg-gray-50/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden ring-2 ring-violet-200 shrink-0">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() ?? "U"
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[13px] leading-tight">Make Your First Move</h3>
                  <p className="text-gray-500 text-[11px] leading-tight mt-1">Verify to unlock all features.</p>
                </div>
              </div>
            </div>

            {/* Steps & Checklist */}
            <div className="p-5 space-y-5 flex-1 overflow-hidden min-h-0">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Spot Your Person</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-0.5">Find someone you'd genuinely enjoy going out with.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                    <GlassWater size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Send a Drink</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-0.5">Offer their first drink to say let's go.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">They Accept</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-0.5">Once accepted, it's a confirmed plan.</p>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100">
                <ul className="space-y-2.5">
                  {["Get noticed faster", "Unlock drink invites", "Build trust faster"].map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 text-gray-600 text-xs font-semibold">
                      <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px] shrink-0">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action */}
            <div className="p-5 bg-white border-t border-gray-50 shrink-0">
              <button className="w-full bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3.5 rounded-2xl text-[13px] shadow-lg shadow-pink-500/20 transition-all active:scale-[0.95] uppercase tracking-wider">
                Get Verified
              </button>
              <button className="w-full text-center text-gray-400 text-xs mt-3 font-bold hover:text-gray-600 transition-colors">
                MAYBE LATER
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
