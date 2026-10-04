import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Terminal, Lock, KeyRound, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { GlitchScreen } from "../components/GlitchScreen";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState("Genius");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Security screen state
  const [glitchActive, setGlitchActive] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(1);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setIsLoading(true);

    try {
      await login(username.trim(), password);
      showToast("success", "ACCESS GRANTED", "Welcome to Monty Genius Control Center", 3000);
      navigate("/admin");
    } catch (err: any) {
      console.error("Login failure:", err);

      // Extract alert details from API response
      const alertDetails = err.details || {};
      const attempts = alertDetails.failedAttempts || failedAttempts + 1;
      const cooldown = alertDetails.cooldownSeconds || 0;

      setFailedAttempts(attempts);
      setCooldownSeconds(cooldown);
      setGlitchActive(true);

      showToast("security", "SECURITY ALERT", "UNAUTHORIZED ACCESS ATTEMPT DETECTED", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden scanlines">
      {/* Background Cyber Grid with Red Tint */}
      <div className="absolute inset-0 cyber-grid-red pointer-events-none opacity-40" />

      {/* Ambient Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF003C]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-md w-full bg-[#080808] border-2 border-[#FF003C]/60 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,0,60,0.25)]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-[#222] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF003C] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF003C]">
              TERMINAL // MG-AUTH-NODE-01
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#666] tracking-wider">
            PORT 443 SECURED
          </span>
        </div>

        {/* Warning Badge */}
        <div className="p-3 rounded-lg bg-[#FF003C]/10 border border-[#FF003C]/30 flex items-start gap-3 mb-6">
          <ShieldAlert className="text-[#FF003C] shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-mono font-bold text-[#FF003C] uppercase tracking-wider">
              RESTRICTED AREA
            </h4>
            <p className="text-[11px] text-[#A0A0A0] font-mono mt-0.5">
              AUTHORIZED PERSONNEL ONLY. All connections and telemetry are cryptographically audited.
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black font-mono text-white tracking-tight">
            MONTY GENIUS // ACCESS GATE
          </h1>
          <p className="text-xs font-mono text-[#777] mt-1">
            Provide cryptographic credentials to gain control room privilege.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[#AAA] mb-1.5 uppercase tracking-wider">
              OPERATOR IDENTIFIER (USERNAME)
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-3 pr-3 py-2.5 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] focus:border-[#FF003C] text-white outline-none transition-colors"
                placeholder="Genius"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#AAA] mb-1.5 uppercase tracking-wider">
              ENCRYPTION KEY (PASSWORD)
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-3 pr-3 py-2.5 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] focus:border-[#FF003C] text-white outline-none transition-colors font-sans"
                placeholder="••••••••••••"
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#555]">
              <span>Initial Setup Pass: Genius</span>
              <span className="text-[#00FF66] font-mono">Argon2/Bcrypt Guarded</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 rounded-lg bg-[#FF003C] hover:bg-[#DC143C] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,0,60,0.4)] flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <Lock size={14} />
            <span>{isLoading ? "AUTHENTICATING NODE..." : "AUTHENTICATE ACCESS"}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#1A1A1A] text-center text-[10px] font-mono text-[#555]">
          MONTY GENIUS DEFENSE LAYER v2.6 // ZERO TRUST ENVIRONMENT
        </div>
      </div>

      {/* Dramatic Deterrent Glitch Screen */}
      <GlitchScreen
        isOpen={glitchActive}
        onDismiss={() => setGlitchActive(false)}
        failedAttempts={failedAttempts}
        cooldownSeconds={cooldownSeconds}
      />
    </div>
  );
};
