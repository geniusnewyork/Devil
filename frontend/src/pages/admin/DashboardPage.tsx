import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Link as LinkIcon,
  FolderTree,
  Star,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Clock,
  Plus,
  Terminal,
  ExternalLink,
  Activity,
  ArrowRight,
} from "lucide-react";
import { AnalyticsData, AuditLog } from "../../types";
import { api } from "../../services/api";

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [analytics, logsRes] = await Promise.all([
          api.getAnalytics(),
          api.getLogs({ limit: 5 }),
        ]);
        setData(analytics);
        setRecentLogs(logsRes.logs);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center font-mono text-[#00F5FF]">
        <Terminal className="animate-spin mx-auto mb-3" size={28} />
        <p className="text-xs tracking-widest">AGGREGATING CYBER TELEMETRY...</p>
      </div>
    );
  }

  const { summary, topLinks } = data;

  const statCards = [
    { label: "TOTAL LINKS", value: summary.totalLinks, icon: LinkIcon, color: "#00F5FF", sub: `${summary.activeLinks} Active / ${summary.disabledLinks} Inactive` },
    { label: "CATEGORIES", value: summary.totalCategories, icon: FolderTree, color: "#9D00FF", sub: "Organized Nodes" },
    { label: "FAVORITES", value: summary.favoriteLinks, icon: Star, color: "#EAB308", sub: `${summary.pinnedLinks} Pinned to Top` },
    { label: "TOTAL CLICKS", value: summary.totalClicks, icon: Eye, color: "#00FF66", sub: "Usage telemetry recorded" },
    { label: "SUCCESSFUL LOGINS", value: summary.totalLogins, icon: ShieldCheck, color: "#00F5FF", sub: "Authorized Sessions" },
    { label: "FAILED ATTEMPTS", value: summary.failedLogins, icon: ShieldAlert, color: "#FF003C", sub: "Repelled Breaches" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-5">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-2">
            <span>DASHBOARD OVERVIEW</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 font-semibold">
              LIVE
            </span>
          </h1>
          <p className="text-xs text-[#888] font-mono mt-1">
            Real-time status of all digital assets, traffic metrics, and defensive countermeasures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/links"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#00F5FF] hover:bg-[#00D0DA] text-black font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)]"
          >
            <Plus size={14} />
            <span>ADD NEW LINK</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] hover:border-[#333] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono tracking-wider text-[#888] uppercase">
                  {card.label}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: `${card.color}15`,
                    borderColor: `${card.color}35`,
                    color: card.color,
                  }}
                >
                  <Icon size={16} />
                </div>
              </div>

              <div className="mt-4">
                <div
                  className="text-3xl font-black font-mono"
                  style={{ color: card.color }}
                >
                  {card.value}
                </div>
                <div className="text-[11px] font-mono text-[#666] mt-1">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid: Top Clicked Links & Recent Security Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Clicked Links */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 mb-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Activity size={14} className="text-[#00FF66]" />
                <span>MOST ACCESSED DIGITAL TOOLS</span>
              </h3>
              <Link to="/admin/analytics" className="text-xs font-mono text-[#00F5FF] hover:underline flex items-center gap-1">
                <span>VIEW ALL</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2.5">
              {topLinks.length === 0 ? (
                <p className="text-xs font-mono text-[#666] py-6 text-center">NO CLICK TELEMETRY YET</p>
              ) : (
                topLinks.slice(0, 5).map((l, idx) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#080808] border border-[#181818] hover:border-[#2A2A2A] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#555]">0{idx + 1}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate font-sans">{l.title}</h4>
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: l.categoryColor }}
                        >
                          {l.categoryName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/20">
                        {l.clicks} clicks
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1A1A1A] flex justify-between text-[11px] font-mono text-[#666]">
            <span>LAST LOGIN:</span>
            <span className="text-white">
              {summary.lastLoginTime ? new Date(summary.lastLoginTime).toLocaleString() : "Never"}
            </span>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 mb-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Terminal size={14} className="text-[#00F5FF]" />
                <span>RECENT AUDIT TRAIL</span>
              </h3>
              <Link to="/admin/logs" className="text-xs font-mono text-[#00F5FF] hover:underline flex items-center gap-1">
                <span>VIEW ALL LOGS</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentLogs.length === 0 ? (
                <p className="text-xs font-mono text-[#666] py-6 text-center">NO AUDIT LOGS RECORDED</p>
              ) : (
                recentLogs.map((log) => {
                  let badge = "text-[#00FF66] border-[#00FF66]/30 bg-[#00FF66]/10";
                  if (log.status === "WARNING") badge = "text-[#EAB308] border-[#EAB308]/30 bg-[#EAB308]/10";
                  if (log.status === "FAILED") badge = "text-[#FF003C] border-[#FF003C]/30 bg-[#FF003C]/10";

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-[#080808] border border-[#181818] flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge}`}>
                            {log.event}
                          </span>
                          <span className="text-white truncate font-sans text-xs">
                            {log.details || log.resource || "-"}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#666] mt-1 block">
                          IP: {log.ipAddress || "127.0.0.1"}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#555] shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1A1A1A] flex justify-between text-[11px] font-mono text-[#666]">
            <span>LAST ACTIVITY:</span>
            <span className="text-white">
              {summary.lastActivityTime ? new Date(summary.lastActivityTime).toLocaleString() : "None"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
