import React from "react";
import { Shield, Radio } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#1F1F1F] bg-[#050505] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="text-[#00F5FF]" size={16} />
          <span className="text-xs font-mono font-bold tracking-wider text-white">
            MONTY GENIUS // SECURE LINK HUB
          </span>
        </div>

        <p className="text-xs text-[#888888] font-mono">
          Designed with ❤️ by <span className="text-white font-medium">Monty Genius</span>
        </p>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0D0D] border border-[#1F1F1F] text-[11px] font-mono text-[#00FF66]">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
          <span>SYSTEM ONLINE // PROTECTED</span>
        </div>
      </div>
    </footer>
  );
};
