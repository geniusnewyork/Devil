import React, { useState, useEffect } from "react";
import { Settings, Shield, Sliders, Palette, Link as LinkIcon, Power, Check, RefreshCw } from "lucide-react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { refreshSettings: refreshPublicSettings } = useSettings();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"GENERAL" | "THEME" | "SECURITY" | "LINKS" | "SYSTEM">("GENERAL");

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminSettings();
      setSettings(data);
    } catch {
      showToast("error", "FAILED TO LOAD SETTINGS");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      showToast("success", "SETTINGS COMMITTED", "System configurations successfully updated");
      await refreshPublicSettings();
    } catch (err: any) {
      showToast("error", "FAILED TO SAVE SETTINGS", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center font-mono text-[#00F5FF]">
        <RefreshCw className="animate-spin mx-auto mb-3" size={28} />
        <p className="text-xs tracking-widest">LOADING CONTROL PARAMETERS...</p>
      </div>
    );
  }

  const tabs = [
    { id: "GENERAL", label: "GENERAL", icon: Settings },
    { id: "THEME", label: "THEME & UI", icon: Palette },
    { id: "SECURITY", label: "SECURITY & COOLDOWN", icon: Shield },
    { id: "LINKS", label: "LINK PREFERENCES", icon: LinkIcon },
    { id: "SYSTEM", label: "SYSTEM & MAINTENANCE", icon: Power },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-5">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-tight text-white uppercase">
            CONTROL ROOM SETTINGS
          </h1>
          <p className="text-xs text-[#888] font-mono mt-1">
            Global system parameters, visual aesthetics, rate limit policies, and maintenance states.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00F5FF] hover:bg-[#00D0DA] text-black font-mono text-xs font-bold uppercase transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] self-start sm:self-auto disabled:opacity-50"
        >
          <Check size={16} />
          <span>{isSaving ? "SAVING..." : "SAVE CHANGES"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1F1F1F] pb-2 overflow-x-auto scrollbar-none font-mono text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
                isActive
                  ? "bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/40 font-bold"
                  : "text-[#888] hover:text-white hover:bg-[#121212]"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] space-y-6 font-mono text-xs">
        {/* TAB: GENERAL */}
        {activeTab === "GENERAL" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Site Title</label>
              <input
                type="text"
                value={settings.siteTitle || ""}
                onChange={(e) => handleChange("siteTitle", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              />
              <span className="text-[11px] text-[#555] mt-1 block">Branding headline displayed in title and navigation</span>
            </div>

            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Hero Subtitle</label>
              <input
                type="text"
                value={settings.siteSubtitle || ""}
                onChange={(e) => handleChange("siteSubtitle", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Footer Text</label>
              <input
                type="text"
                value={settings.footerText || ""}
                onChange={(e) => handleChange("footerText", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              />
              <span className="text-[11px] text-[#555] mt-1 block">Always credits &quot;Designed with ❤️ by Monty Genius&quot;</span>
            </div>
          </div>
        )}

        {/* TAB: THEME */}
        {activeTab === "THEME" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Primary Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={settings.accentColor || "#00F5FF"}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="w-32 px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
                />
                <input
                  type="color"
                  value={settings.accentColor || "#00F5FF"}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#AAA] mb-1 uppercase">RGB Flow Border Effects</label>
              <select
                value={settings.rgbEffects || "true"}
                onChange={(e) => handleChange("rgbEffects", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              >
                <option value="true">ENABLED (Full Cyber Glow &amp; Spectral Borders)</option>
                <option value="false">DISABLED (Subdued Minimal Dark)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Card Aesthetic Style</label>
              <select
                value={settings.cardStyle || "cyber-glass"}
                onChange={(e) => handleChange("cardStyle", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              >
                <option value="cyber-glass">Cyber Glassmorphic (Translucent Blur)</option>
                <option value="solid-dark">Solid Tactical Charcoal</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB: SECURITY */}
        {activeTab === "SECURITY" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Session Timeout (Days)</label>
              <input
                type="number"
                value={settings.sessionTimeoutDays || "7"}
                onChange={(e) => handleChange("sessionTimeoutDays", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              />
              <span className="text-[11px] text-[#555] mt-1 block">Maximum age for cryptographic HttpOnly session tokens</span>
            </div>

            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Failed Login Threshold Before Lockout</label>
              <input
                type="number"
                value={settings.maxLoginAttempts || "5"}
                onChange={(e) => handleChange("maxLoginAttempts", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Security Lockout Duration (Minutes)</label>
              <input
                type="number"
                value={settings.cooldownMinutes || "15"}
                onChange={(e) => handleChange("cooldownMinutes", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Audit Log Retention Policy</label>
              <select
                value={settings.logRetentionDays || "90"}
                onChange={(e) => handleChange("logRetentionDays", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              >
                <option value="7">Keep logs for 7 Days</option>
                <option value="30">Keep logs for 30 Days</option>
                <option value="90">Keep logs for 90 Days</option>
                <option value="180">Keep logs for 180 Days</option>
                <option value="365">Keep logs for 1 Year</option>
                <option value="forever">Forever (No auto-purge)</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB: LINKS */}
        {activeTab === "LINKS" && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-[#AAA] mb-1 uppercase">Default Public Sorting</label>
              <select
                value={settings.defaultSorting || "Newest"}
                onChange={(e) => handleChange("defaultSorting", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#00F5FF] outline-none"
              >
                <option value="Newest">Newest First</option>
                <option value="Most Used">Most Used First</option>
                <option value="A-Z">Alphabetical (A to Z)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.openExternalNewTab === "true"}
                  onChange={(e) => handleChange("openExternalNewTab", e.target.checked ? "true" : "false")}
                  className="accent-[#00F5FF]"
                />
                <span>Open external websites in a new tab by default</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showDescriptions === "true"}
                  onChange={(e) => handleChange("showDescriptions", e.target.checked ? "true" : "false")}
                  className="accent-[#00F5FF]"
                />
                <span>Show text descriptions on cards</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCategories === "true"}
                  onChange={(e) => handleChange("showCategories", e.target.checked ? "true" : "false")}
                  className="accent-[#00F5FF]"
                />
                <span>Show category badges on cards</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB: SYSTEM & MAINTENANCE */}
        {activeTab === "SYSTEM" && (
          <div className="space-y-6 max-w-2xl">
            <div className="p-4 rounded-xl border border-[#FF003C]/40 bg-[#FF003C]/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white uppercase text-sm">MAINTENANCE MODE</h4>
                  <p className="text-[11px] text-[#AAA] font-sans mt-0.5">
                    When active, public visitors will see a cyber maintenance shield. Admin terminal remains fully operational.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode === "true"}
                    onChange={(e) => handleChange("maintenanceMode", e.target.checked ? "true" : "false")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF003C]"></div>
                </label>
              </div>

              {settings.maintenanceMode === "true" && (
                <div className="mt-4 pt-4 border-t border-[#FF003C]/20">
                  <label className="block text-[#AAA] mb-1 uppercase">Maintenance Notice Message</label>
                  <input
                    type="text"
                    value={settings.maintenanceMessage || ""}
                    onChange={(e) => handleChange("maintenanceMessage", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-white focus:border-[#FF003C] outline-none"
                  />
                </div>
              )}
            </div>

            {/* System Specs */}
            <div className="p-4 rounded-xl bg-[#080808] border border-[#1F1F1F] space-y-2">
              <h4 className="font-bold text-[#00F5FF] uppercase">SYSTEM ARCHITECTURE SPEC</h4>
              <div className="flex justify-between text-[#888]">
                <span>CORE ENGINE:</span>
                <span className="text-white">Node.js Express / TypeScript</span>
              </div>
              <div className="flex justify-between text-[#888]">
                <span>DATABASE ORM:</span>
                <span className="text-white">Prisma / SQLite Embedded</span>
              </div>
              <div className="flex justify-between text-[#888]">
                <span>CLIENT STACK:</span>
                <span className="text-white">React 18 / Vite / Tailwind CSS</span>
              </div>
              <div className="flex justify-between text-[#888]">
                <span>TARGET ENVIRONMENT:</span>
                <span className="text-[#00FF66]">Localhost / Render Web Service</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#1A1A1A] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg bg-[#00F5FF] hover:bg-[#00D0DA] text-black font-bold uppercase transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] disabled:opacity-50"
          >
            {isSaving ? "SAVING..." : "COMMIT CONFIGURATION"}
          </button>
        </div>
      </form>
    </div>
  );
};
