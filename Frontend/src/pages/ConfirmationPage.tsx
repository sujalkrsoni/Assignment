import { useLocation, useNavigate } from "react-router-dom";
import { PartyPopper, Inbox } from "lucide-react";

export const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const senderName =
    (location.state as { senderName?: string } | null)?.senderName ?? "your match";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm border border-gray-100 rounded-4xl shadow-2xl shadow-violet-900/10 p-10 text-center animate-confetti">
        {/* Confetti */}
        <div className="w-24 h-24 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-violet-600 animate-bounce">
          <PartyPopper size={48} />
        </div>

        {/* Badge */}
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 mb-4">
          Invite Confirmed
        </p>

        {/* Main Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
          You&apos;re going with
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500">
            {senderName}
          </span>
        </h2>

        {/* Info */}
        <p className="text-gray-500 mb-8 text-sm">
          🍹 Drink is now charged because the invite was accepted.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate("/feed")}
            className="w-full px-6 py-4 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 active:scale-95 text-sm uppercase tracking-wider"
          >
            ← Back to Feed
          </button>
          <button
            type="button"
            onClick={() => navigate("/inbox")}
            className="w-full px-6 py-4 border-2 border-violet-100 hover:border-violet-200 text-violet-700 font-bold rounded-2xl transition-all duration-200 hover:bg-violet-50 text-sm flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Inbox size={18} /> View Inbox
          </button>
        </div>
      </div>
    </div>
  );
};
