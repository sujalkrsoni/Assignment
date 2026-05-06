import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Send, Inbox } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { api, extractErrorMessage } from "../lib/api";
import { connectSocket, getSocket } from "../lib/socket";
import type { InviteItem } from "../types";

type InboxTab = "received" | "sent";

const getPartyName = (party: InviteItem["senderId"]): string => {
  if (typeof party === "string") return party;
  return party.name;
};

const getEventName = (event: InviteItem["eventId"]): string => {
  if (typeof event === "string") return event;
  return event.name;
};

export const InboxPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [tab, setTab] = useState<InboxTab>("received");
  const [receivedInvites, setReceivedInvites] = useState<InviteItem[]>([]);
  const [sentInvites, setSentInvites] = useState<InviteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);

  const loadInvites = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [r, s] = await Promise.all([
        api.get<{ success: boolean; data: InviteItem[] }>(`/invites?userId=${user.id}&box=received`),
        api.get<{ success: boolean; data: InviteItem[] }>(`/invites?userId=${user.id}&box=sent`),
      ]);
      setReceivedInvites(r.data.data);
      setSentInvites(s.data.data);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadInvites(); }, [user?.id]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    const onC = () => setLive(true);
    const onD = () => setLive(false);
    const onR = () => { void loadInvites(); };
    setLive(socket.connected);
    socket.on("connect", onC);
    socket.on("disconnect", onD);
    socket.on("invite:created", onR);
    socket.on("invite:sent", onR);
    socket.on("invite:updated", onR);
    return () => {
      const s = getSocket();
      s?.off("connect", onC);
      s?.off("disconnect", onD);
      s?.off("invite:created", onR);
      s?.off("invite:sent", onR);
      s?.off("invite:updated", onR);
    };
  }, [token, user?.id]);

  const invites = useMemo(() => (tab === "received" ? receivedInvites : sentInvites), [tab, receivedInvites, sentInvites]);

  const respond = async (inviteId: string, action: "ACCEPT" | "REJECT") => {
    try {
      await api.post("/invite/respond", { inviteId, action });
      if (action === "ACCEPT") {
        const a = receivedInvites.find((i) => i._id === inviteId);
        navigate("/confirmation", { state: { senderName: a ? getPartyName(a.senderId) : "your match" } });
      } else {
        await loadInvites();
      }
    } catch (e) {
      setError(extractErrorMessage(e));
    }
  };

  const cfg: Record<string, { bg: string; badge: string; border: string }> = {
    pending: { bg: "bg-amber-50/80", badge: "bg-amber-100 text-amber-800", border: "border-amber-200" },
    accepted: { bg: "bg-green-50/80", badge: "bg-green-100 text-green-800", border: "border-green-200" },
    confirmed: { bg: "bg-green-50/80", badge: "bg-green-100 text-green-800", border: "border-green-200" },
    rejected: { bg: "bg-red-50/80", badge: "bg-red-100 text-red-800", border: "border-red-200" },
    expired: { bg: "bg-gray-50/80", badge: "bg-gray-100 text-gray-600", border: "border-gray-200" },
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Invite Inbox</h1>
          <p className="text-gray-500 text-xs lg:text-sm">Manage your movement in real-time.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] lg:text-xs font-bold w-fit ${live ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
          <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
          {live ? "Live Connection" : "Offline"}
        </div>
      </div>

      <div className="flex gap-1 bg-gray-200/50 backdrop-blur-sm p-1 rounded-2xl mb-8 w-full sm:w-fit">
        <button type="button" onClick={() => setTab("received")} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs lg:text-sm transition-all flex items-center justify-center gap-2 ${tab === "received" ? "bg-white text-violet-700 shadow-md" : "text-gray-500 hover:text-gray-700"}`}>
          <Mail size={16} /> Received ({receivedInvites.length})
        </button>
        <button type="button" onClick={() => setTab("sent")} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs lg:text-sm transition-all flex items-center justify-center gap-2 ${tab === "sent" ? "bg-white text-violet-700 shadow-md" : "text-gray-500 hover:text-gray-700"}`}>
          <Send size={16} /> Sent ({sentInvites.length})
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 mx-auto border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-gray-500 text-xs lg:text-sm font-medium">Loading invites...</p>
          </div>
        </div>
      )}

      {!loading && invites.length === 0 && (
        <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-100 animate-fadeIn">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No invites</h3>
          <p className="text-gray-500 text-sm">You&apos;re all caught up.</p>
        </div>
      )}

      {!loading && invites.length > 0 && (
        <div className="space-y-3 animate-fadeInUp">
          {invites.map((inv) => {
            const st = inv.status.toLowerCase();
            const c = cfg[st] || cfg.expired;
            return (
              <div key={inv._id} className={`${c.bg} backdrop-blur-sm border ${c.border} rounded-2xl p-5 hover:shadow-md transition-all`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-lienar-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {getPartyName(inv.senderId).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{getEventName(inv.eventId)}</h3>
                      <p className="text-gray-500 text-xs">From <strong>{getPartyName(inv.senderId)}</strong> → <strong>{getPartyName(inv.receiverId)}</strong></p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.badge}`}>{inv.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span>🍸 Drink: <strong className={inv.drinkOffered ? "text-green-600" : "text-gray-400"}>{inv.drinkOffered ? "Yes" : "No"}</strong></span>
                  <span>💳 Charged: <strong className={inv.drinkCharged ? "text-green-600" : "text-gray-400"}>{inv.drinkCharged ? "Yes" : "No"}</strong></span>
                </div>
                {tab === "received" && inv.status === "PENDING" && (
                  <div className="flex gap-2 pt-3 border-t border-gray-200/50">
                    <button type="button" onClick={() => void respond(inv._id, "ACCEPT")} className="flex-1 px-4 py-2.5 bg-blue-400 text-white font-bold rounded-xl text-sm hover:shadow-md transition-all"> Accept</button>
                    <button type="button" onClick={() => void respond(inv._id, "REJECT")} className="flex-1 px-4 py-2.5 border-2 border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50 font-bold rounded-xl text-sm transition-all"> Reject</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
};
