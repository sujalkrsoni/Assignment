import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Flame, Compass, Mail, LogOut, Edit2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/feed", label: "Feed", icon: <Flame size={20} /> },
  { to: "/events", label: "Events", icon: <Compass size={20} /> },
  { to: "/inbox", label: "Inbox", icon: <Mail size={20} /> },
];

export const AppShell = () => {
  const { user, updateProfileImage, logout } = useAuth();
  const [editingImage, setEditingImage] = useState(false);
  const [imageInput, setImageInput] = useState("");
  const [savingImage, setSavingImage] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    setImageInput(user?.imageUrl ?? "");
  }, [user?.imageUrl]);

  const saveProfileImage = async () => {
    setSavingImage(true);
    setProfileError("");
    try {
      await updateProfileImage(imageInput.trim());
      setEditingImage(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to update profile image");
    } finally {
      setSavingImage(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F5F0]">
      {/* ── Sidebar (Desktop Only) ── */}
      <aside className="w-55 bg-[#F3EFE9] border-r border-gray-200 hidden lg:flex flex-col fixed h-full z-50">
        {/* Brand */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/30">
              M
            </div>
            <div>
              <h1 className="text-[#1A1135] font-bold text-[15px] leading-tight tracking-tight">
                partywitty
              </h1>
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">
                Tonight Planner
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-violet-100 text-violet-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="px-4 py-6 border-t border-gray-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-violet-100 shrink-0">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() ?? "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-bold text-sm truncate">{user?.name}</p>
              {user?.isVerified ? (
                <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                  Verified
                </span>
              ) : (
                <span className="text-[11px] text-amber-600 font-medium">Not verified</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setEditingImage((prev) => !prev)}
              className="w-full text-left text-xs text-gray-500 hover:text-violet-600 transition-colors px-2 py-2 rounded-lg hover:bg-violet-50 font-medium flex items-center gap-2"
            >
              <Edit2 size={12} /> Edit Profile Image
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full text-left text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-2 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Bottom Navigation (Mobile Only) ── */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex lg:hidden items-center justify-around px-2 z-60 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? "text-violet-600" : "text-gray-400"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Main Content ── */}
      <div className="flex-1 lg:ml-55 pb-16 lg:pb-0 min-w-0">
        {/* Profile Image Editor */}
        {editingImage && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-70 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scaleIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Profile Image</h2>
                <button
                  onClick={() => setEditingImage(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="Paste image URL here"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 text-sm"
                />
                <button
                  onClick={() => void saveProfileImage()}
                  disabled={savingImage || !imageInput}
                  className="w-full bg-linear-to-r from-violet-600 to-purple-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
                >
                  {savingImage ? "Saving..." : "Update Image"}
                </button>
              </div>
              {profileError && <p className="text-red-500 text-xs mt-2 font-medium">{profileError}</p>}
            </div>
          </div>
        )}

        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
