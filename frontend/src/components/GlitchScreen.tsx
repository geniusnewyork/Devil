import React, { useState, useEffect } from "react";
import { AlertOctagon, ShieldAlert, Terminal, Lock, Skull } from "lucide-react";

interface GlitchScreenProps {
  isOpen: boolean;
  onDismiss: () => void;
  failedAttempts: number;
  cooldownSeconds?: number;
}

export const GlitchScreen: React.FC<GlitchScreenProps> = ({
  isOpen,
  onDismiss,
  failedAttempts,
  cooldownSeconds = 0,
}) => {
  const [timeLeft, setTimeLeft] = useState(cooldownSeconds);

  useEffect(() => {
    setTimeLeft(cooldownSeconds);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-hidden scanlines">
      {/* Glitch Animated Red Border Ring */}
      <div className="absolute inset-0 border-8 border-[#FF003C] animate-pulse pointer-events-none opacity-80" />

      {/* Cyber Grid Red Accent Background */}
      <div className="absolute inset-0 cyber-grid-red pointer-events-none opacity-60" />

      <div className="relative max-w-xl w-full bg-[#080808] border-2 border-[#FF003C] rounded-xl p-6 sm:p-8 shadow-[0_0_60px_rgba(255,0,60,0.5)] text-center animate-glitch">
        {/* Warning Icon Banner */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-[#FF003C]/20 border-2 border-[#FF003C] flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(255,0,60,0.6)]">
            <AlertOctagon className="text-[#FF003C]" size={48} />
          </div>
        </div>

        {/* Security Alert Header */}
        <div className="inline-block px-3 py-1 rounded bg-[#FF003C] text-black font-mono font-black text-xs tracking-widest uppercase mb-2">
          CRITICAL BREACH ATTEMPT // PROTOCOL 401
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#FF003C] mt-2 mb-1 drop-shadow-[0_0_15px_rgba(255,0,60,0.8)]">
          ACCESS DENIED
        </h1>

        <h2 className="text-base sm:text-lg font-bold font-mono text-white tracking-widest uppercase">
          SECURITY ALERT: UNAUTHORIZED ACCESS ATTEMPT DETECTED
        </h2>

        {/* Terminal readout box */}
        <div className="mt-6 p-4 rounded-lg bg-black border border-[#FF003C]/40 text-left font-mono text-xs space-y-1.5 text-[#FF003C]/90 shadow-inner">
          <div className="flex items-center gap-2 text-white border-b border-[#FF003C]/30 pb-1.5">
            <Terminal size={14} className="text-[#FF003C]" />
            <span className="font-bold">SYSTEM AUDIT LOG REPORT</span>
          </div>
          <p className="text-[#FF6680]">&gt; STATUS: AUTHENTICATION FAILED</p>
          <p className="text-[#FF6680]">&gt; FAILED ATTEMPTS LOGGED: {failedAttempts}</p>
          <p className="text-[#FF6680]">&gt; CLIENT IP &amp; HARDWARE FINGERPRINT ENCRYPTED &amp; RECORDED</p>
          <p className="text-white font-bold">&gt; DO NOT CONTINUE.</p>
        </div>

        {/* Cooldown Timer if active */}
        {timeLeft > 0 ? (
          <div className="mt-6 p-3 bg-[#FF003C]/10 border border-[#FF003C]/40 rounded-lg">
            <span className="text-xs font-mono text-[#AAA] uppercase block">
              SECURITY LOCKOUT ACTIVE
            </span>
            <div className="text-2xl font-mono font-black text-[#FF003C] mt-1">
              {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
            </div>
            <p className="text-[11px] font-mono text-[#777] mt-1">
              Input terminal locked to prevent credential brute-forcing.
            </p>
          </div>
        ) : (
          <p className="mt-6 text-xs font-mono text-[#888888]">
            Further unauthorized attempts will escalate IP blacklisting duration.
          </p>
        )}

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#FF003C] hover:bg-[#DC143C] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,0,60,0.4)]"
          >
            ACKNOWLEDGE &amp; RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
