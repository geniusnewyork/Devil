import React, { useState } from "react";
import { Download, Upload, Database, FileSpreadsheet, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "../../services/api";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../context/ToastContext";

export const BackupPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedPayload, setParsedPayload] = useState<any>(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleExportJson = () => {
    api.exportJson();
    showToast("success", "BACKUP INITIATED", "Downloading complete JSON archive", 3000);
  };

  const handleExportLinksCsv = () => {
    api.exportLinksCsv();
    showToast("success", "CSV EXPORT INITIATED", "Downloading links spreadsheet", 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      showToast("error", "INVALID FILE FORMAT", "Only JSON backup snapshots can be restored");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.version || !json.data) {
          throw new Error("Backup file is missing required system structure");
        }
        setSelectedFile(file);
        setParsedPayload(json);
      } catch (err: any) {
        showToast("error", "CORRUPTED BACKUP", err.message || "Failed to parse JSON snapshot");
        setSelectedFile(null);
        setParsedPayload(null);
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreSubmit = async () => {
    if (!parsedPayload) return;
    setIsRestoring(true);
    try {
      const res = await api.importBackup(parsedPayload);
      showToast(
        "success",
        "BACKUP RESTORED",
        `Restored ${res.importedLinks} links, ${res.importedCategories} categories, ${res.importedSettings} settings`
      );
      setRestoreModalOpen(false);
      setSelectedFile(null);
      setParsedPayload(null);
    } catch (err: any) {
      showToast("error", "RESTORE FAILED", err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#1F1F1F] pb-5">
        <h1 className="text-2xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-2">
          <span>BACKUP &amp; DISASTER RECOVERY</span>
        </h1>
        <p className="text-xs text-[#888] font-mono mt-1">
          Export full system snapshots, raw tabular spreadsheets, and perform safe atomic restorations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Data Card */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#1A1A1A] pb-3 mb-4">
              <Download size={16} className="text-[#00F5FF]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                EXPORT ARCHIVES &amp; SNAPSHOTS
              </h3>
            </div>

            <p className="text-xs text-[#888] font-sans leading-relaxed mb-6">
              Create an immutable snapshot of your entire database including all links, categories, system settings, and audit logs. Suitable for migration or offline recovery.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-lg bg-[#080808] border border-[#1A1A1A] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Database size={14} className="text-[#00F5FF]" />
                    <span>FULL SYSTEM SNAPSHOT (JSON)</span>
                  </h4>
                  <p className="text-[11px] text-[#777] font-sans mt-0.5">
                    Complete state: links, taxonomy, settings, and security trail.
                  </p>
                </div>
                <button
                  onClick={handleExportJson}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00F5FF] hover:bg-[#00D0DA] text-black font-bold text-xs uppercase transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] shrink-0"
                >
                  DOWNLOAD JSON
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[#080808] border border-[#1A1A1A] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet size={14} className="text-[#00FF66]" />
                    <span>LINKS SPREADSHEET (CSV)</span>
                  </h4>
                  <p className="text-[11px] text-[#777] font-sans mt-0.5">
                    Tabular export compatible with Excel, Google Sheets, or scripts.
                  </p>
                </div>
                <button
                  onClick={handleExportLinksCsv}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00FF66] hover:bg-[#00D957] text-black font-bold text-xs uppercase transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] shrink-0"
                >
                  DOWNLOAD CSV
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#1A1A1A] text-[10px] font-mono text-[#555]">
            Snapshots contain zero raw passwords • All keys cryptographically isolated
          </div>
        </div>

        {/* Restore Data Card */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#1A1A1A] pb-3 mb-4">
              <Upload size={16} className="text-[#EAB308]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                RESTORE FROM JSON BACKUP
              </h3>
            </div>

            <p className="text-xs text-[#888] font-sans leading-relaxed mb-4">
              Select a valid Monty Genius JSON snapshot file to restore nodes. The payload will be rigorously validated against schema constraints prior to execution.
            </p>

            <div className="p-6 rounded-xl border-2 border-dashed border-[#2A2A2A] hover:border-[#00F5FF]/50 bg-[#080808] text-center transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload size={28} className="mx-auto text-[#666] mb-2" />
              <span className="font-mono text-xs font-bold text-white block">
                {selectedFile ? selectedFile.name : "SELECT OR DROP JSON BACKUP FILE"}
              </span>
              <span className="text-[11px] font-mono text-[#555] block mt-1">
                {selectedFile
                  ? `${Math.round(selectedFile.size / 1024)} KB • Schema validated`
                  : "Requires valid Monty Genius export structure"}
              </span>
            </div>

            {parsedPayload && (
              <div className="mt-4 p-3 rounded-lg bg-[#080808] border border-[#222] font-mono text-xs space-y-1">
                <div className="flex justify-between text-[#888]">
                  <span>CATEGORIES FOUND:</span>
                  <span className="text-white">{parsedPayload.data?.categories?.length || 0}</span>
                </div>
                <div className="flex justify-between text-[#888]">
                  <span>LINKS FOUND:</span>
                  <span className="text-white">{parsedPayload.data?.links?.length || 0}</span>
                </div>
                <div className="flex justify-between text-[#888]">
                  <span>EXPORTED AT:</span>
                  <span className="text-[#00F5FF]">
                    {parsedPayload.exportedAt ? new Date(parsedPayload.exportedAt).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setRestoreModalOpen(true)}
              disabled={!parsedPayload}
              className="w-full mt-4 py-2.5 rounded bg-[#EAB308] hover:bg-[#D9A100] text-black font-mono font-bold text-xs uppercase transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] disabled:opacity-40"
            >
              VALIDATE &amp; RESTORE SNAPSHOT
            </button>
          </div>

          <div className="mt-6 pt-3 border-t border-[#1A1A1A] text-[10px] font-mono text-[#555]">
            Transactional safety enabled • Automatic rollback on syntax anomaly
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={restoreModalOpen}
        title="CONFIRM DATA RESTORE"
        message="Restoring from this snapshot will merge and update existing links and categories with the imported snapshot data. Are you sure you wish to proceed?"
        confirmText="PROCEED WITH RESTORE"
        isDangerous={true}
        isLoading={isRestoring}
        onConfirm={handleRestoreSubmit}
        onCancel={() => setRestoreModalOpen(false)}
      />
    </div>
  );
};
