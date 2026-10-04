import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, Terminal } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-mono scanlines">
      <div className="w-16 h-16 rounded-2xl bg-[#FF003C]/10 border border-[#FF003C]/30 flex items-center justify-center mb-6 glow-red">
        <AlertTriangle className="text-[#FF003C]" size={32} />
      </div>

      <div className="inline-block px-3 py-1 rounded bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] text-xs font-bold tracking-widest uppercase mb-2">
        ERROR 404 // NODE NOT FOUND
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-3">
        ACCESS FAULT
      </h1>

      <p className="max-w-md text-xs sm:text-sm text-[#888] mb-8 font-sans leading-relaxed">
        The requested pathway does not exist within the Monty Genius Link Hub network or has been restricted by access control list.
      </p>

      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0D0D0D] border border-[#222] hover:border-[#00F5FF] text-xs tracking-wider text-white transition-all glow-cyan"
      >
        <Home size={14} className="text-[#00F5FF]" />
        <span>RETURN TO DIGITAL HUB</span>
      </Link>
    </div>
  );
};
