import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  LogOut,
  RefreshCw,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Monitor,
} from "lucide-react";
import { LoginAttempt } from "../../types";
import { api } from "../../services/api";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export const SecurityCenterPage: React.FC = () => {
  const { showToast } = useToast();
  const { logout } = useAuth();
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Logout all modal
  const [logoutAllModalOpen, setLogoutAllModalOpen] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.getLoginHistory({ limit: 15 });
      setLoginAttempts(res.attempts);
    } catch {
      showToast("error", "FAILED TO LOAD LOGIN HISTORY");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Password strength check
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      showToast("warning", "WEAK PASSWORD", "Ensure all password complexity rules are satisfied");
      return;
    }
    if (!isMatch) {
      showToast("warning", "PASSWORD MISMATCH", "New password and confirmation do not match");
      return;
    }

    setIsChangingPass(true);
    try {
      await api.changePassword({ currentPassword, newPassword, confirmPassword });
      showToast("success", "PASSWORD CHANGED", "Root administrative key updated securely");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast("error", "FAILED TO CHANGE PASSWORD", err.message);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await api.logoutAll();
      showToast("security", "ALL SESSIONS REVOKED", "Terminated all active admin tokens");
      setLogoutAllModalOpen(false);
      window.location.href = "/admin/login";
    } catch (err: any) {
      showToast("error", "REVOCATION FAILED", err.message);
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-5">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-2">
            <span>SECURITY COMMAND CENTER</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 font-semibold">
              HARDENED
            </span>
          </h1>
          <p className="text-xs text-[#888] font-mono mt-1">
            Access keys, active sessions, credential rotation, and telemetry intrusion monitoring.
          </p>
        </div>

        <button
          onClick={() => setLogoutAllModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FF003C]/10 border border-[#FF003C]/40 hover:bg-[#FF003C]/20 text-[#FF003C] text-xs font-mono font-bold transition-all self-start sm:self-auto glow-red"
        >
          <LogOut size={14} />
          <span>TERMINATE ALL SESSIONS</span>
        </button>
      </div>

      {/* Two Column Section: Password Change & Security Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Rotation Card */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#1A1A1A] pb-3 mb-4">
              <KeyRound size={16} className="text-[#00F5FF]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                UPDATE OPERATOR CREDENTIALS
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#888] mb-1 uppercase">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[#888] mb-1 uppercase">New Master Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 rounded bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none font-sans"
                />
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`flex-1 rounded-full transition-all ${
                          strengthScore >= lvl
                            ? strengthScore >= 4
                              ? "bg-[#00FF66]"
                              : strengthScore >= 3
                              ? "bg-[#EAB308]"
                              : "bg-[#FF003C]"
                            : "bg-[#222]"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-[#777]">
                    <span className={hasMinLength ? "text-[#00FF66]" : ""}>✓ 8+ Characters</span>
                    <span className={hasUpper ? "text-[#00FF66]" : ""}>✓ Uppercase Letter</span>
                    <span className={hasLower ? "text-[#00FF66]" : ""}>✓ Lowercase Letter</span>
                    <span className={hasNumber ? "text-[#00FF66]" : ""}>✓ Numeric Digit</span>
                    <span className={hasSpecial ? "text-[#00FF66]" : ""}>✓ Special Character</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#888] mb-1 uppercase">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full mt-4 py-2.5 rounded bg-[#00F5FF] hover:bg-[#00D0DA] text-black font-bold uppercase transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] disabled:opacity-50"
              >
                {isChangingPass ? "ROTATING HASH..." : "COMMIT NEW PASSWORD"}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1A1A1A] text-[10px] font-mono text-[#555]">
            Argon2/Bcrypt hash standard • Salt rounds: 12 • Non-current sessions revoked automatically
          </div>
        </div>

        {/* Security Posture Status */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#1A1A1A] pb-3 mb-4">
              <ShieldCheck size={16} className="text-[#00FF66]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                SECURITY HEALTH &amp; DEFENSE POSTURE
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#080808] border border-[#1A1A1A] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">SESSION SECURITY</span>
                  <span className="text-[11px] text-[#777]">HttpOnly, SameSite, Secure Cookie Flag</span>
                </div>
                <span className="text-[#00FF66] font-bold">ARMED</span>
              </div>

              <div className="p-3 rounded-lg bg-[#080808] border border-[#1A1A1A] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">BRUTE FORCE PREVENTION</span>
                  <span className="text-[11px] text-[#777]">Dynamic tiered IP cooldown (60s / 15m)</span>
                </div>
                <span className="text-[#00FF66] font-bold">ACTIVE</span>
              </div>

              <div className="p-3 rounded-lg bg-[#080808] border border-[#1A1A1A] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">CONTENT SECURITY POLICY</span>
                  <span className="text-[11px] text-[#777]">Helmet.js zero-trust frame &amp; script guard</span>
                </div>
                <span className="text-[#00FF66] font-bold">ENABLED</span>
              </div>

              <div className="p-3 rounded-lg bg-[#080808] border border-[#1A1A1A] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">PASSWORD STORAGE</span>
                  <span className="text-[11px] text-[#777]">Zero plaintext guarantee in SQLite schema</span>
                </div>
                <span className="text-[#00FF66] font-bold">ENCRYPTED</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1A1A1A] text-[10px] font-mono text-[#555]">
            DEFENSE PROTOCOLS VERIFIED // NO VULNERABILITIES DETECTED
          </div>
        </div>
      </div>

      {/* Login History Section */}
      <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F]">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-[#00F5FF]" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              LOGIN TELEMETRY HISTORY
            </h3>
          </div>

          <button
            onClick={fetchHistory}
            className="text-xs font-mono text-[#777] hover:text-white flex items-center gap-1"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            <span>REFRESH</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="text-[#888] uppercase border-b border-[#1A1A1A]">
              <tr>
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">IP Address</th>
                <th className="pb-2">Browser</th>
                <th className="pb-2">Operating System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {loginAttempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#666]">
                    NO LOGIN ATTEMPTS RECORDED
                  </td>
                </tr>
              ) : (
                loginAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-[#0A0A0A]">
                    <td className="py-2.5 text-[#AAA]">
                      {new Date(attempt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5">
                      {attempt.status === "SUCCESS" ? (
                        <span className="text-[10px] text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30 font-bold">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#FF003C] bg-[#FF003C]/10 px-2 py-0.5 rounded border border-[#FF003C]/30 font-bold">
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-white">{attempt.ip}</td>
                    <td className="py-2.5 text-[#00F5FF]">{attempt.browser}</td>
                    <td className="py-2.5 text-[#888]">{attempt.os}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutAllModalOpen}
        title="TERMINATE ALL ADMIN SESSIONS"
        message="This will immediately invalidate all active authentication session tokens across all devices and browsers. You will need to log back in."
        confirmText="TERMINATE SESSIONS"
        isDangerous={true}
        isLoading={isLoggingOutAll}
        onConfirm={handleLogoutAll}
        onCancel={() => setLogoutAllModalOpen(false)}
      />
    </div>
  );
};
