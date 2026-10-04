import React, { useState, useEffect } from "react";
import {
  ScrollText,
  Search,
  Filter,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { AuditLog } from "../../types";
import { api } from "../../services/api";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../context/ToastContext";

const LOG_EVENTS = [
  "ALL",
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "LOGOUT",
  "LOGOUT_ALL",
  "PASSWORD_CHANGED",
  "LINK_CREATED",
  "LINK_UPDATED",
  "LINK_DELETED",
  "LINK_ENABLED",
  "LINK_DISABLED",
  "CATEGORY_CREATED",
  "CATEGORY_UPDATED",
  "CATEGORY_DELETED",
  "SETTINGS_CHANGED",
  "BACKUP_CREATED",
  "BACKUP_RESTORED",
  "LOGS_CLEARED",
];

export const SecurityLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedEvent, setSelectedEvent] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // Purge modal
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearDays, setClearDays] = useState(30);
  const [isClearing, setIsClearing] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getLogs({
        page,
        limit: 20,
        event: selectedEvent,
        status: selectedStatus,
        search,
      });
      setLogs(res.logs);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch {
      showToast("error", "FAILED TO LOAD AUDIT LOGS");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, selectedEvent, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const res = await api.clearLogs(clearDays);
      showToast("success", "LOGS PURGED", `Removed ${res.deletedCount} old entries`);
      setClearModalOpen(false);
      setPage(1);
      fetchLogs();
    } catch (err: any) {
      showToast("error", "PURGE FAILED", err.message);
    } finally {
      setIsClearing(false);
    }
  };

  const handleExport = (format: "json" | "csv") => {
    window.open(`/api/logs/export/${format}`, "_blank");
    showToast("success", `EXPORTING ${format.toUpperCase()}`, "Download started", 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-5">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-2">
            <span>SECURITY AUDIT TRAIL</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/30 font-semibold">
              IMMUTABLE RECORD
            </span>
          </h1>
          <p className="text-xs text-[#888] font-mono mt-1">
            Cryptographic telemetry logs for authentication, modifications, and administrative operations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport("json")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D0D0D] border border-[#222] hover:border-[#00F5FF]/50 text-xs font-mono text-[#AAA] hover:text-white transition-colors"
          >
            <Download size={13} />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D0D0D] border border-[#222] hover:border-[#00F5FF]/50 text-xs font-mono text-[#AAA] hover:text-white transition-colors"
          >
            <Download size={13} />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={() => setClearModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF003C]/10 border border-[#FF003C]/30 hover:bg-[#FF003C]/20 text-xs font-mono text-[#FF003C] transition-colors"
          >
            <Trash2 size={13} />
            <span>PURGE OLD</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search details, IP address, resource ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-xs font-mono text-white placeholder-[#666] outline-none focus:border-[#00F5FF]"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Event filter */}
          <select
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setPage(1);
            }}
            className="bg-[#080808] border border-[#222] text-[#AAA] text-xs font-mono rounded-lg px-3 py-2 outline-none"
          >
            {LOG_EVENTS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="bg-[#080808] border border-[#222] text-[#AAA] text-xs font-mono rounded-lg px-3 py-2 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="WARNING">Warning</option>
            <option value="FAILED">Failed</option>
          </select>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg bg-[#080808] border border-[#222] text-[#777] hover:text-white"
            title="Refresh logs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0D0D0D] border-b border-[#1F1F1F] text-[#888] uppercase">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Event</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Resource</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#666]">
                    QUERYING LOG RECORDS...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#666]">
                    NO AUDIT RECORDS FOUND
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let badge = "text-[#00FF66] border-[#00FF66]/30 bg-[#00FF66]/10";
                  if (log.status === "WARNING") badge = "text-[#EAB308] border-[#EAB308]/30 bg-[#EAB308]/10";
                  if (log.status === "FAILED") badge = "text-[#FF003C] border-[#FF003C]/30 bg-[#FF003C]/10";

                  return (
                    <tr key={log.id} className="hover:bg-[#0F0F0F] transition-colors">
                      <td className="p-3.5 text-[#AAA] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        {log.event}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#00F5FF] whitespace-nowrap">
                        {log.resource || "-"}
                      </td>
                      <td className="p-3.5 text-[#888] whitespace-nowrap">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                      <td className="p-3.5 text-[#AAA] max-w-xs truncate font-sans">
                        {log.details || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#0D0D0D] border-t border-[#1F1F1F] flex items-center justify-between font-mono text-xs text-[#888]">
          <div>
            SHOWING PAGE {page} OF {totalPages || 1} ({totalCount} TOTAL LOGS)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded bg-[#161616] border border-[#2A2A2A] text-white disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded bg-[#161616] border border-[#2A2A2A] text-white disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Clear Logs Modal */}
      <ConfirmModal
        isOpen={clearModalOpen}
        title="PURGE AUDIT LOGS"
        message={`Select retention threshold. Logs older than ${clearDays} days will be permanently erased.`}
        confirmText="PURGE LOGS"
        isDangerous={true}
        isLoading={isClearing}
        onConfirm={handleClearLogs}
        onCancel={() => setClearModalOpen(false)}
      />
    </div>
  );
};
