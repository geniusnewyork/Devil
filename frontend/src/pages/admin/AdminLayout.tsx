import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Link as LinkIcon,
  FolderTree,
  BarChart3,
  ScrollText,
  ShieldCheck,
  Database,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Radio,
  Terminal,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export const AdminLayout: React.FC = () => {
  const { admin, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If loading, show cyber spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] font-mono text-[#00F5FF]">
        <div className="flex flex-col items-center gap-3">
          <Terminal size={32} className="animate-spin" />
          <p className="text-xs tracking-widest">VERIFYING OPERATOR CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect
  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    showToast("success", "LOGOUT COMPLETE", "Session safely closed", 2000);
    navigate("/");
  };

  const navItems = [
    { label: "DASHBOARD", path: "/admin", icon: LayoutDashboard },
    { label: "SECRET VAULT", path: "/admin/vault", icon: Lock, isVault: true },
    { label: "ALL LINKS", path: "/admin/links", icon: LinkIcon },
    { label: "CATEGORIES", path: "/admin/categories", icon: FolderTree },
    { label: "ANALYTICS", path: "/admin/analytics", icon: BarChart3 },
    { label: "SECURITY LOGS", path: "/admin/logs", icon: ScrollText },
    { label: "SECURITY CENTER", path: "/admin/security", icon: ShieldCheck },
    { label: "BACKUPS", path: "/admin/backups", icon: Database },
    { label: "SETTINGS", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex flex-col font-sans">
      {/* Admin Top Header Banner */}
      <header className="border-b border-[#1F1F1F] bg-[#0A0A0A]/95 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-[#141414] border border-[#222] text-[#AAA] lg:hidden"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-bold text-white tracking-widest uppercase">
              <span className="text-[#00F5FF]">MONTY GENIUS</span> // CONTROL CENTER
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-[10px] text-[#00FF66] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                SYSTEM ONLINE
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#666]">
              OPERATOR: {admin?.username || "Genius"} (LEVEL 1 ROOT)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#222] hover:border-[#00F5FF]/50 text-xs font-mono text-[#AAA] hover:text-white transition-colors"
          >
            <span>VIEW PUBLIC HUB</span>
            <ExternalLink size={12} />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF003C]/10 border border-[#FF003C]/30 hover:bg-[#FF003C]/20 text-xs font-mono text-[#FF003C] transition-all"
            title="Terminate session"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#080808] border-r border-[#1F1F1F] transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-1/0 lg:translate-x-0"
          } ${sidebarOpen ? "top-0" : ""}`}
        >
          <div className="h-full flex flex-col p-4">
            <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#222] mb-4">
              <span className="font-mono text-xs text-[#00F5FF] font-bold">NAVIGATION MATRIX</span>
              <button onClick={() => setSidebarOpen(false)} className="text-[#888]">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 font-mono text-xs">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      item.isVault
                        ? active
                          ? "bg-[#FF003C]/20 text-[#FF003C] border border-[#FF003C] font-black shadow-[0_0_20px_rgba(255,0,60,0.3)]"
                          : "text-[#FF4D6D] hover:bg-[#FF003C]/10 hover:text-[#FF003C] border border-[#FF003C]/20"
                        : active
                        ? "bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/40 font-bold shadow-[0_0_15px_rgba(0,245,255,0.15)]"
                        : "text-[#888] hover:text-white hover:bg-[#121212]"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        item.isVault
                          ? "text-[#FF003C] animate-pulse"
                          : active
                          ? "text-[#00F5FF]"
                          : "text-[#666]"
                      }
                    />
                    <span>{item.label}</span>
                    {item.isVault && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-[#FF003C]/20 text-[#FF003C] font-mono border border-[#FF003C]/40">
                        TOP SECRET
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer status */}
            <div className="pt-4 border-t border-[#1A1A1A] text-[10px] font-mono text-[#555] space-y-1">
              <div className="flex justify-between">
                <span>SECURITY LEVEL:</span>
                <span className="text-[#00FF66]">MAXIMUM</span>
              </div>
              <div className="flex justify-between">
                <span>ENCRYPTION:</span>
                <span className="text-white">AES-256 / SHA-256</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#050505]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
