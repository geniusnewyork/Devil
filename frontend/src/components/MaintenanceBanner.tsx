import React from "react";
import { Link } from "react-router-dom";
import { Wrench, Shield, Lock } from "lucide-react";

interface MaintenanceBannerProps {
  message: string;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ message }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050505] scanlines">
      <div className="w-20 h-20 rounded-2xl bg-[#FF003C]/10 border border-[#FF003C]/30 flex items-center justify-center mb-6 glow-red">
        <Wrench className="text-[#FF003C]" size={36} />
      </div>

      <div className="inline-block px-3 py-1 rounded bg-[#FF003C]/15 border border-[#FF003C]/40 text-[#FF003C] font-mono text-xs font-bold tracking-widest uppercase mb-3">
        SYSTEM RESTRICTED // UNDER MAINTENANCE
      </div>

      <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white mb-4">
        MONTY GENIUS // LINK HUB
      </h1>

      <p className="max-w-md text-sm sm:text-base text-[#888] font-mono mb-8 leading-relaxed">
        {message || "The digital control room is currently undergoing scheduled security maintenance. All public nodes are temporarily protected."}
      </p>

      <div className="flex items-center gap-4">
        <Link
          to="/admin/login"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0D0D0D] border border-[#222] hover:border-[#FF003C] text-xs font-mono tracking-wider text-white transition-all"
        >
          <Lock size={14} className="text-[#FF003C]" />
          <span>AUTHENTICATE AS ADMIN</span>
        </Link>
      </div>

      <div className="mt-16 text-xs text-[#555] font-mono">
        Designed with ❤️ by Monty Genius
      </div>
    </div>
  );
};
