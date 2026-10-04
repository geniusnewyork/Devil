import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Activity,
  ShieldCheck,
  ShieldAlert,
  FolderTree,
  Eye,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { AnalyticsData } from "../../types";
import { api } from "../../services/api";

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const result = await api.getAnalytics();
      setData(result);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center font-mono text-[#00F5FF]">
        <RefreshCw className="animate-spin mx-auto mb-3" size={28} />
        <p className="text-xs tracking-widest">CALCULATING CYBER METRICS...</p>
      </div>
    );
  }

  const { summary, topLinks, categoryDistribution, loginHistoryChart } = data;

  const maxClicks = Math.max(...topLinks.map((l) => l.clicks), 1);
  const maxLoginDay = Math.max(
    ...loginHistoryChart.map((d) => Math.max(d.success, d.failed)),
    1
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-5">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-2">
            <span>TELEMETRY &amp; USAGE ANALYTICS</span>
          </h1>
          <p className="text-xs text-[#888] font-mono mt-1">
            Usage frequencies, click counters, authentication history, and category density.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0D0D0D] border border-[#222] hover:border-[#00F5FF]/50 text-xs font-mono text-[#AAA] hover:text-white transition-all self-start sm:self-auto"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          <span>REFRESH METRICS</span>
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F]">
          <span className="text-[11px] text-[#777] block uppercase">ALL ASSETS</span>
          <div className="text-2xl font-bold text-[#00F5FF] mt-1">{summary.totalLinks}</div>
          <div className="text-[10px] text-[#555] mt-1">{summary.activeLinks} ACTIVE / {summary.disabledLinks} OFF</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F]">
          <span className="text-[11px] text-[#777] block uppercase">TOTAL CLICKS</span>
          <div className="text-2xl font-bold text-[#00FF66] mt-1">{summary.totalClicks}</div>
          <div className="text-[10px] text-[#555] mt-1">Recorded Link Hits</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F]">
          <span className="text-[11px] text-[#777] block uppercase">LOGIN SUCCESS</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.totalLogins}</div>
          <div className="text-[10px] text-[#00FF66] mt-1">Authorized Accesses</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F]">
          <span className="text-[11px] text-[#777] block uppercase">FAILED ATTEMPTS</span>
          <div className="text-2xl font-bold text-[#FF003C] mt-1">{summary.failedLogins}</div>
          <div className="text-[10px] text-[#FF003C] mt-1">Interception Counter</div>
        </div>
      </div>

      {/* 7-Day Login History Bar Chart */}
      <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F]">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 mb-6">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Activity size={14} className="text-[#00F5FF]" />
            <span>7-DAY AUTHENTICATION ACTIVITY</span>
          </h3>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1 text-[#00FF66]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF66]" /> SUCCESS
            </span>
            <span className="flex items-center gap-1 text-[#FF003C]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FF003C]" /> FAILED / BLOCKED
            </span>
          </div>
        </div>

        <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
          {loginHistoryChart.map((d, i) => {
            const successHeight = (d.success / maxLoginDay) * 100;
            const failedHeight = (d.failed / maxLoginDay) * 100;
            const dateStr = d.date.slice(5); // MM-DD

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Success Bar */}
                  <div
                    className="w-full max-w-[18px] bg-[#00FF66]/80 hover:bg-[#00FF66] transition-all rounded-t relative group"
                    style={{ height: `${Math.max(successHeight, 4)}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-1.5 py-0.5 rounded text-[10px] font-mono text-[#00FF66] border border-[#222] pointer-events-none z-10">
                      {d.success}
                    </div>
                  </div>

                  {/* Failed Bar */}
                  <div
                    className="w-full max-w-[18px] bg-[#FF003C]/80 hover:bg-[#FF003C] transition-all rounded-t relative group"
                    style={{ height: `${Math.max(failedHeight, 4)}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-1.5 py-0.5 rounded text-[10px] font-mono text-[#FF003C] border border-[#222] pointer-events-none z-10">
                      {d.failed}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#666] tracking-wider">{dateStr}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Top Links Click Volume & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Links */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F]">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-5 flex items-center gap-2">
            <Eye size={14} className="text-[#00FF66]" />
            <span>TOP ACCESSED DIGITAL TOOLS (USAGE VOLUME)</span>
          </h3>

          <div className="space-y-4">
            {topLinks.length === 0 ? (
              <p className="text-xs font-mono text-[#666] py-8 text-center">NO USAGE REGISTERED</p>
            ) : (
              topLinks.map((link) => {
                const percent = Math.round((link.clicks / maxClicks) * 100);
                return (
                  <div key={link.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold truncate max-w-xs">{link.title}</span>
                      <span className="text-[#00FF66] font-bold">{link.clicks} hits</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#161616] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: link.categoryColor || "#00F5FF",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F]">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-5 flex items-center gap-2">
            <FolderTree size={14} className="text-[#9D00FF]" />
            <span>CATEGORY ASSET DISTRIBUTION</span>
          </h3>

          <div className="space-y-4">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs font-mono text-[#666] py-8 text-center">NO CATEGORIES</p>
            ) : (
              categoryDistribution.map((cat) => {
                const totalLinks = summary.totalLinks || 1;
                const percent = Math.round((cat.linkCount / totalLinks) * 100);

                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                      <span className="text-[#888]">
                        {cat.linkCount} links ({cat.totalClicks} clicks)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#161616] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
