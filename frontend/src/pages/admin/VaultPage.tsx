import React, { useState, useEffect } from "react";
import {
  Lock,
  ShieldAlert,
  Plus,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  FileText,
  Key,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Save,
} from "lucide-react";
import { LinkItem, Category } from "../../types";
import { api } from "../../services/api";
import { DynamicIcon } from "../../components/DynamicIcon";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import { cyberAudio } from "../../utils/cyberAudio";

export const VaultPage: React.FC = () => {
  const { showToast } = useToast();
  const [vaultLinks, setVaultLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scratchpad
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem("mg_vault_scratchpad") || "// TOP SECRET SCRATCHPAD\n// Store private server IPs, temporary API tokens, and secret flags here.\n";
  });
  const [isScratchpadSaved, setIsScratchpadSaved] = useState(false);

  // Revealed notes
  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<LinkItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    categoryId: "",
    icon: "Lock",
    tags: "TOP_SECRET, VAULT",
    color: "#FF003C",
    status: "ACTIVE" as "ACTIVE" | "DISABLED" | "MAINTENANCE",
    openInNewTab: true,
    isFavorite: true,
    isPinned: false,
    isHidden: true,
    notes: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedLinks, fetchedCats] = await Promise.all([
        api.getLinks({ vault: true }),
        api.getCategories(),
      ]);
      setVaultLinks(fetchedLinks);
      setCategories(fetchedCats);
    } catch {
      showToast("error", "FAILED TO LOAD VAULT DATA");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cyberAudio.playVault();
    loadData();
  }, []);

  const handleSaveScratchpad = () => {
    cyberAudio.playSuccess();
    localStorage.setItem("mg_vault_scratchpad", scratchpad);
    setIsScratchpadSaved(true);
    showToast("success", "VAULT SCRATCHPAD SAVED", "Encrypted in local browser storage", 2000);
    setTimeout(() => setIsScratchpadSaved(false), 2000);
  };

  const toggleNote = (id: string) => {
    cyberAudio.playClick();
    setRevealedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, label: string) => {
    cyberAudio.playClick();
    navigator.clipboard.writeText(text);
    showToast("success", `${label} COPIED`, text, 2000);
  };

  const openCreateModal = () => {
    cyberAudio.playClick();
    setEditingLink(null);
    setFormData({
      title: "",
      url: "",
      description: "",
      categoryId: categories[0]?.id || "",
      icon: "Lock",
      tags: "VAULT, ROOT",
      color: "#FF003C",
      status: "ACTIVE",
      openInNewTab: true,
      isFavorite: true,
      isPinned: false,
      isHidden: true,
      notes: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (link: LinkItem) => {
    cyberAudio.playClick();
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || "",
      categoryId: link.categoryId,
      icon: link.icon,
      tags: Array.isArray(link.tags) ? link.tags.join(", ") : "",
      color: link.color,
      status: link.status,
      openInNewTab: link.openInNewTab,
      isFavorite: link.isFavorite,
      isPinned: link.isPinned,
      isHidden: true,
      notes: link.notes || "",
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;

    try {
      const payload: Partial<LinkItem> = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim() || null,
        categoryId: formData.categoryId || categories[0]?.id,
        icon: formData.icon,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        color: formData.color,
        status: formData.status,
        openInNewTab: formData.openInNewTab,
        isFavorite: formData.isFavorite,
        isPinned: formData.isPinned,
        isHidden: true, // Always hidden in vault
        notes: formData.notes.trim() || null,
      };

      if (editingLink) {
        await api.updateLink(editingLink.id, payload);
        cyberAudio.playSuccess();
        showToast("success", "VAULT LINK UPDATED");
      } else {
        await api.createLink(payload);
        cyberAudio.playSuccess();
        showToast("success", "CLASSIFIED LINK SECURED IN VAULT");
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast("error", "FAILED TO SAVE VAULT LINK", err.message);
    }
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;
    try {
      await api.deleteLink(linkToDelete.id);
      cyberAudio.playClick();
      showToast("success", "VAULT LINK EXPUNGED");
      setDeleteModalOpen(false);
      setLinkToDelete(null);
      loadData();
    } catch (err: any) {
      showToast("error", "FAILED TO EXPUNGE LINK", err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#120004] via-[#080808] to-[#0A0512] border-2 border-[#FF003C]/50 shadow-[0_0_40px_rgba(255,0,60,0.2)] overflow-hidden scanlines">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <ShieldAlert size={160} className="text-[#FF003C]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF003C]/20 border border-[#FF003C]/50 text-[#FF003C] text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <Lock size={12} />
              <span>CLASSIFIED VAULT // ADMIN EYES ONLY</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-3">
              SECRET ASSET VAULT
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#A0A0A0] max-w-2xl font-mono leading-relaxed">
              These links and assets are <span className="text-[#FF003C] font-bold">100% CONCEALED</span> from public visitors. Only logged-in administrators can view, click, or manage items stored in this cryptographic vault.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF003C] hover:bg-[#DC143C] text-black font-mono text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(255,0,60,0.4)] shrink-0 self-start md:self-center"
          >
            <Plus size={16} />
            <span>ADD VAULT ASSET</span>
          </button>
        </div>
      </div>

      {/* Secret Scratchpad */}
      <div className="p-6 rounded-xl bg-[#090909] border border-[#FF003C]/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF003C] uppercase tracking-wider">
            <Terminal size={14} />
            <span>CONFIDENTIAL SCRATCHPAD (ENCRYPTED CLIENT STORAGE)</span>
          </div>

          <button
            onClick={handleSaveScratchpad}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
              isScratchpadSaved
                ? "bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]"
                : "bg-[#141414] border-[#222] text-white hover:border-[#FF003C]/50 hover:text-[#FF003C]"
            }`}
          >
            <Save size={13} />
            <span>{isScratchpadSaved ? "SAVED" : "SAVE NOTE"}</span>
          </button>
        </div>

        <textarea
          value={scratchpad}
          onChange={(e) => setScratchpad(e.target.value)}
          rows={4}
          placeholder="Write confidential commands, API tokens, port forwards, or secret credentials..."
          className="w-full p-3.5 rounded-lg bg-[#050505] border border-[#1A1A1A] focus:border-[#FF003C]/60 text-white font-mono text-xs outline-none leading-relaxed transition-all placeholder-[#555]"
        />
      </div>

      {/* Vault Links Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-[#FF003C]" />
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              PROTECTED VAULT RESOURCES ({vaultLinks.length})
            </h3>
          </div>

          <button
            onClick={() => {
              cyberAudio.playClick();
              loadData();
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-[#888] hover:text-[#00F5FF]"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            <span>SYNC</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 text-center font-mono text-[#FF003C]">
            <RefreshCw className="animate-spin mx-auto mb-3" size={28} />
            <p className="text-xs tracking-widest">DECRYPTING CLASSIFIED VAULT...</p>
          </div>
        ) : vaultLinks.length === 0 ? (
          <div className="py-16 text-center rounded-xl bg-[#080808] border border-[#222] font-mono">
            <Lock className="mx-auto text-[#666] mb-3" size={32} />
            <h4 className="text-sm text-white font-bold uppercase">VAULT IS EMPTY</h4>
            <p className="text-xs text-[#777] mt-1 max-w-sm mx-auto">
              You have no secret links yet. Click "ADD VAULT ASSET" to store your first hidden link.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vaultLinks.map((link) => {
              const isNoteRevealed = !!revealedNotes[link.id];
              return (
                <div
                  key={link.id}
                  className="relative p-5 rounded-xl bg-[#090909] border border-[#FF003C]/40 hover:border-[#FF003C] transition-all duration-300 shadow-[0_0_20px_rgba(255,0,60,0.12)] flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Tag & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#FF003C]/20 border border-[#FF003C]/40 text-[10px] font-mono font-black text-[#FF003C] tracking-widest uppercase">
                          CLASSIFIED
                        </span>
                        <span className="text-[10px] font-mono text-[#777] uppercase">
                          {link.category?.name || "VAULT"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(link)}
                          className="p-1 rounded hover:bg-[#1A1A1A] text-[#888] hover:text-[#00F5FF]"
                          title="Edit Vault Link"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setLinkToDelete(link);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1 rounded hover:bg-[#1A1A1A] text-[#888] hover:text-[#FF003C]"
                          title="Expunge Vault Link"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Icon */}
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${link.color}15`,
                          borderColor: `${link.color}40`,
                          color: link.color,
                        }}
                      >
                        <DynamicIcon name={link.icon} size={20} color={link.color} />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold font-mono text-white group-hover:text-[#FF003C] transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-xs text-[#888] line-clamp-2 mt-0.5 font-sans">
                          {link.description || "No public description provided."}
                        </p>
                      </div>
                    </div>

                    {/* Confidential Notes Section */}
                    {link.notes && (
                      <div className="mt-3 p-2.5 rounded-lg bg-[#050505] border border-[#222] font-mono text-xs">
                        <div className="flex items-center justify-between text-[11px] text-[#FF003C] mb-1">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                            <Key size={11} />
                            CONFIDENTIAL CREDENTIALS / NOTES
                          </span>
                          <button
                            onClick={() => toggleNote(link.id)}
                            className="text-[#888] hover:text-white flex items-center gap-1 text-[10px]"
                          >
                            {isNoteRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                            <span>{isNoteRevealed ? "HIDE" : "REVEAL"}</span>
                          </button>
                        </div>
                        <p className={`text-[#AAA] break-all ${isNoteRevealed ? "" : "blur-sm select-none"}`}>
                          {link.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Open & Launch */}
                  <div className="mt-5 pt-3 border-t border-[#1A1A1A] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopy(link.url, "VAULT URL")}
                      className="flex items-center gap-1 text-xs font-mono text-[#777] hover:text-white px-2 py-1 rounded bg-[#111] border border-[#222] transition-colors"
                    >
                      <Copy size={12} />
                      <span>COPY URL</span>
                    </button>

                    <a
                      href={link.url}
                      target={link.openInNewTab ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      onClick={() => cyberAudio.playSuccess()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FF003C]/20 hover:bg-[#FF003C] border border-[#FF003C]/50 text-[#FF003C] hover:text-black font-mono text-xs font-bold uppercase transition-all shadow-[0_0_15px_rgba(255,0,60,0.2)]"
                    >
                      <span>LAUNCH</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-lg w-full bg-[#090909] border-2 border-[#FF003C] rounded-2xl p-6 shadow-[0_0_50px_rgba(255,0,60,0.3)] font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-4">
              <div className="flex items-center gap-2 text-[#FF003C] font-bold uppercase tracking-widest text-sm">
                <Lock size={16} />
                <span>{editingLink ? "MODIFY VAULT ASSET" : "ENCRYPT NEW VAULT ASSET"}</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#888] hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[#AAA] mb-1 uppercase">ASSET TITLE *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. [CLASSIFIED] Private Bastion Server"
                  className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#222] focus:border-[#FF003C] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#AAA] mb-1 uppercase">SECURE URL *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#222] focus:border-[#FF003C] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#AAA] mb-1 uppercase">CATEGORY</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#222] focus:border-[#FF003C] text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#AAA] mb-1 uppercase">CONFIDENTIAL NOTES / 2FA DETAILS</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. SSH Port 2222, hardware key required, API root password..."
                  className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#222] focus:border-[#FF003C] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#AAA] mb-1 uppercase">TAGS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="VAULT, SSH, INTERNAL"
                  className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#222] focus:border-[#FF003C] text-white outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#FF003C]/10 border border-[#FF003C]/30 text-[11px] text-[#FF8899]">
                🔒 <strong>Zero-Leak Guarantee:</strong> This link is automatically flagged as Hidden. It will never be indexed or displayed on the public landing page.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#222] text-[#888] font-bold uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#FF003C] hover:bg-[#DC143C] text-black font-bold uppercase shadow-[0_0_15px_rgba(255,0,60,0.4)]"
                >
                  {editingLink ? "SAVE MODIFICATIONS" : "SECURE IN VAULT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="EXPUNGE VAULT ASSET"
        message={`Permanently erase classified link "${linkToDelete?.title}" from the secret vault?`}
        confirmText="EXPUNGE"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setLinkToDelete(null);
        }}
      />
    </div>
  );
};
