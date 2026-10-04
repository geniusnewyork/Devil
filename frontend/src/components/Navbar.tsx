import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Search, Lock, Menu, X, Terminal, Cpu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1F1F1F] bg-[#050505]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-[#0D0D0D] border border-[#1F1F1F] group-hover:border-[#00F5FF]/50 flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(0,245,255,0.1)]">
            <Shield className="text-[#00F5FF] group-hover:text-[#FF003C] transition-colors" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm sm:text-base font-extrabold tracking-wider text-white flex items-center gap-2">
              MONTY GENIUS <span className="text-[#FF003C] text-xs font-semibold px-1.5 py-0.5 rounded bg-[#FF003C]/10 border border-[#FF003C]/30 hidden sm:inline-block">HUB</span>
            </span>
            <span className="text-[10px] font-mono text-[#888888] tracking-widest hidden sm:block">
              // SECURE LINK HUB
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-xs font-mono tracking-wider transition-colors ${
              isActive("/") ? "text-[#00F5FF] font-semibold" : "text-[#A0A0A0] hover:text-white"
            }`}
          >
            HOME
          </Link>

          {/* Instant Search Bar Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0D0D0D] border border-[#1F1F1F] hover:border-[#00F5FF]/40 text-[#A0A0A0] hover:text-white transition-all text-xs font-mono shadow-inner group"
          >
            <Search size={14} className="text-[#888888] group-hover:text-[#00F5FF] transition-colors" />
            <span>SEARCH...</span>
            <kbd className="ml-2 text-[10px] bg-[#1A1A1A] text-[#777] px-1.5 py-0.5 rounded border border-[#2A2A2A]">
              Ctrl+K
            </kbd>
          </button>

          {isAuthenticated ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FF003C]/10 border border-[#FF003C]/40 text-[#FF003C] hover:bg-[#FF003C]/20 transition-all text-xs font-mono tracking-wider font-semibold glow-red"
            >
              <Terminal size={14} />
              <span>CONTROL CENTER</span>
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0D0D0D] border border-[#1F1F1F] hover:border-[#FF003C]/50 text-[#A0A0A0] hover:text-[#FF003C] transition-all text-xs font-mono tracking-wider"
            >
              <Lock size={14} />
              <span>ADMIN LOGIN</span>
            </Link>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-lg bg-[#0D0D0D] border border-[#1F1F1F] text-[#A0A0A0]"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#0D0D0D] border border-[#1F1F1F] text-[#A0A0A0]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1F1F1F] bg-[#080808] px-4 py-4 space-y-3 font-mono text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#A0A0A0] hover:text-white"
          >
            &gt; HOME
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch();
            }}
            className="w-full text-left py-2 text-[#A0A0A0] hover:text-[#00F5FF] flex items-center justify-between"
          >
            <span>&gt; SEARCH WEBSITES</span>
            <span className="text-xs text-[#555]">Ctrl+K</span>
          </button>
          {isAuthenticated ? (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#FF003C] font-semibold"
            >
              &gt; CONTROL CENTER
            </Link>
          ) : (
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#A0A0A0] hover:text-[#FF003C]"
            >
              &gt; RESTRICTED ADMIN LOGIN
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
