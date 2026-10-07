import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Pin,
  ExternalLink,
  Check,
  X,
  Eye,
  Filter,
  RefreshCw,
} from "lucide-react";
import { LinkItem, Category } from "../../types";
import { api } from "../../services/api";
import { DynamicIcon } from "../../components/DynamicIcon";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../context/ToastContext";

const AVAILABLE_ICONS = [
  "Globe",
  "Code2",
  "Cpu",
  "Server",
  "Shield",
  "ShieldAlert",
  "Terminal",
  "Database",
  "Zap",
  "Flame",
  "GitBranch",
  "Layers",
  "Share2",
  "Briefcase",
  "Palette",
  "TrendingUp",
  "User",
  "AlertTriangle",
  "Folder",
  "Lock",
  "Key",
  "Radio",
  "Wrench",
];

const PRESET_COLORS = [
  "#00F5FF",
  "#FF003C",
  "#00FF66",
  "#9D00FF",
  "#0066FF",
  "#EAB308",
  "#EC4899",
  "#F97316",
  "#A855F7",
  "#64748B",
];

export const LinksPage: React.FC = () => {
  const { showToast } = useToast();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & filter
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal states
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
    icon: "Globe",
    tags: "",
    color: "#00F5FF",
    status: "ACTIVE" as "ACTIVE" | "DISABLED" | "MAINTENANCE",
    openInNewTab: true,
    isFavorite: false,
    isPinned: false,
    isHidden: false,
    notes: "",
    sortOrder: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedLinks, fetchedCats] = await Promise.all([
        api.getLinks({ status: "ALL" }),
        api.getCategories(),
      ]);
      setLinks(fetchedLinks);
      setCategories(fetchedCats);
    } catch (err) {
      showToast("error", "FAILED TO LOAD LINKS", "Network or server error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingLink(null);
    setFormData({
      title: "",
      url: "",
      description: "",
      categoryId: categories[0]?.id || "",
      icon: "Globe",
      tags: "",
      color: "#00F5FF",
      status: "ACTIVE",
      openInNewTab: true,
      isFavorite: false,
      isPinned: false,
      isHidden: false,
      notes: "",
      sortOrder: 0,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || "",
      categoryId: link.categoryId,
      icon: link.icon || "Globe",
      tags: Array.isArray(link.tags) ? link.tags.join(", ") : "",
      color: link.color || "#00F5FF",
      status: link.status,
      openInNewTab: link.openInNewTab,
      isFavorite: link.isFavorite,
      isPinned: link.isPinned,
      isHidden: !!link.isHidden,
      notes: link.notes || "",
      sortOrder: link.sortOrder,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.url.trim()) {
      errors.url = "URL is required";
    } else {
      try {
        const u = new URL(formData.url);
        if (!["http:", "https:"].includes(u.protocol)) {
          errors.url = "URL must begin with http:// or https://";
        }
      } catch {
        errors.url = "Invalid URL format";
      }
    }
    if (!formData.categoryId) errors.categoryId = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const parsedTags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim() || null,
        categoryId: formData.categoryId,
        icon: formData.icon,
        tags: parsedTags,
        color: formData.color,
        status: formData.status,
        openInNewTab: formData.openInNewTab,
        isFavorite: formData.isFavorite,
        isPinned: formData.isPinned,
        isHidden: formData.isHidden,
        notes: formData.notes.trim() || null,
        sortOrder: Number(formData.sortOrder) || 0,
      };

      if (editingLink) {
        await api.updateLink(editingLink.id, payload);
        showToast("success", "✓ LINK UPDATED", `Saved "${payload.title}"`);
      } else {
        await api.createLink(payload);
        showToast("success", "✓ LINK ADDED", `Created "${payload.title}"`);
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast("error", "✕ ACTION FAILED", err.message || "Could not save link");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;
    setIsSaving(true);
    try {
      await api.deleteLink(linkToDelete.id);
      showToast("success", "✓ LINK DELETED", `Removed "${linkToDelete.title}"`);
      setDeleteModalOpen(false);
      setLinkToDelete(null);
      loadData();
    } catch (err: any) {
      showToast("error", "✕ DELETE FAILED", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickToggleFavorite = async (link: LinkItem) => {
    try {
      await api.updateLink(link.id, { isFavorite: !link.isFavorite });
      showToast("success", link.isFavorite ? "REMOVED FAVORITE" : "ADDED FAVORITE", link.title, 1500);
      loadData();
    } catch {
      showToast("error", "FAILED TO TOGGLE FAVORITE");
    }
  };

  const handleQuickTogglePinned = async (link: LinkItem) => {
    try {
      await api.updateLink(link.id, { isPinned: !link.isPinned });
      showToast("success", link.isPinned ? "UNPINNED LINK" : "PINNED LINK", link.title, 1500);
      loadData();
    } catch {
      showToast("error", "FAILED TO TOGGLE PIN");
    }
  };

  const handleQuickStatusChange = async (link: LinkItem, status: "ACTIVE" | "DISABLED" | "MAINTENANCE") => {
    try {
      await api.updateLink(link.id, { status });
      showToast("success", "STATUS UPDATED", `${link.title} set to ${status}`, 1500);
      loadData();
    } catch {
      showToast("error", "FAILED TO UPDATE STATUS");
    }
  };

  const filteredLinks = links.filter((l) => {
    if (selectedCat !== "ALL" && l.categoryId !== selectedCat) return false;
    if (selectedStatus !== "ALL" && l.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-5">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-tight text-white uppercase">
            LINK ASSET MANAGEMENT
          </h1>
          <p className="text-xs text-[#888] font-mono mt-1">
            Complete CRUD operations for your digital nodes and web resources.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F5FF] hover:bg-[#00D0DA] text-black font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>CREATE NEW LINK</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F]">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter links by title, url, description..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#080808] border border-[#222] text-xs font-sans text-white placeholder-[#666] outline-none focus:border-[#00F5FF]/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category Filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-[#080808] border border-[#222] text-[#AAA] text-xs font-mono rounded-lg px-3 py-2 outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#080808] border border-[#222] text-[#AAA] text-xs font-mono rounded-lg px-3 py-2 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
            <option value="MAINTENANCE">Maintenance Only</option>
          </select>

          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-[#080808] border border-[#222] text-[#777] hover:text-white"
            title="Refresh"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table of Links */}
      <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0D0D0D] border-b border-[#1F1F1F] text-[#888] uppercase">
              <tr>
                <th className="p-3.5">Asset</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Pin</th>
                <th className="p-3.5 text-center">Fav</th>
                <th className="p-3.5 text-center">Clicks</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#666]">
                    SCANNING STORED ASSETS...
                  </td>
                </tr>
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#666]">
                    NO LINKS MATCH CRITERIA
                  </td>
                </tr>
              ) : (
                filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-[#0F0F0F] transition-colors">
                    {/* Asset Info */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: `${link.color}15`,
                            borderColor: `${link.color}35`,
                            color: link.color,
                          }}
                        >
                          <DynamicIcon name={link.icon} size={16} color={link.color} />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-bold text-white truncate font-sans text-xs flex items-center gap-1.5">
                            <span>{link.title}</span>
                            {link.isHidden && (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#FF003C]/20 border border-[#FF003C]/50 text-[#FF003C] rounded">
                                VAULT
                              </span>
                            )}
                          </h4>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#00F5FF] hover:underline flex items-center gap-1 truncate"
                          >
                            <span>{link.url}</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      {link.category ? (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded border uppercase"
                          style={{
                            backgroundColor: `${link.category.color}10`,
                            borderColor: `${link.category.color}30`,
                            color: link.category.color,
                          }}
                        >
                          {link.category.name}
                        </span>
                      ) : (
                        <span className="text-[#555]">-</span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-3.5">
                      <select
                        value={link.status}
                        onChange={(e) =>
                          handleQuickStatusChange(
                            link,
                            e.target.value as "ACTIVE" | "DISABLED" | "MAINTENANCE"
                          )
                        }
                        className={`text-[10px] rounded px-2 py-1 border outline-none font-bold uppercase ${
                          link.status === "ACTIVE"
                            ? "bg-[#00FF66]/10 border-[#00FF66]/30 text-[#00FF66]"
                            : link.status === "DISABLED"
                            ? "bg-[#FF003C]/10 border-[#FF003C]/30 text-[#FF003C]"
                            : "bg-[#EAB308]/10 border-[#EAB308]/30 text-[#EAB308]"
                        }`}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DISABLED">DISABLED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </td>

                    {/* Pinned Toggle */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleQuickTogglePinned(link)}
                        className={`p-1.5 rounded transition-colors ${
                          link.isPinned
                            ? "text-[#FF003C] bg-[#FF003C]/10 border border-[#FF003C]/30"
                            : "text-[#555] hover:text-white"
                        }`}
                      >
                        <Pin size={14} />
                      </button>
                    </td>

                    {/* Favorite Toggle */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleQuickToggleFavorite(link)}
                        className={`p-1.5 rounded transition-colors ${
                          link.isFavorite
                            ? "text-[#EAB308] bg-[#EAB308]/10 border border-[#EAB308]/30"
                            : "text-[#555] hover:text-white"
                        }`}
                      >
                        <Star size={14} fill={link.isFavorite ? "#EAB308" : "none"} />
                      </button>
                    </td>

                    {/* Clicks */}
                    <td className="p-3.5 text-center text-[#777]">
                      {link.clickCount}
                    </td>

                    {/* Action buttons */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(link)}
                          className="p-1.5 rounded bg-[#161616] hover:bg-[#222] border border-[#2A2A2A] text-[#AAA] hover:text-[#00F5FF] transition-colors"
                          title="Edit link"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setLinkToDelete(link);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded bg-[#FF003C]/10 hover:bg-[#FF003C]/20 border border-[#FF003C]/30 text-[#FF003C] transition-colors"
                          title="Delete link"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Link Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade overflow-y-auto">
          <div className="relative max-w-xl w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl my-8 font-sans">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#777] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black font-mono text-white tracking-wider uppercase mb-1">
              {editingLink ? "MODIFY LINK ASSET" : "REGISTER DIGITAL LINK"}
            </h3>
            <p className="text-xs text-[#888] font-mono mb-5">
              Specify node attributes, routing, taxonomy, and aesthetics.
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              {/* Title */}
              <div>
                <label className="block text-[#AAA] mb-1 uppercase">Website Name *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. GitHub Command Center"
                  className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] focus:border-[#00F5FF] text-white outline-none"
                />
                {formErrors.title && <span className="text-[#FF003C] text-[11px] mt-1 block">{formErrors.title}</span>}
              </div>

              {/* URL */}
              <div>
                <label className="block text-[#AAA] mb-1 uppercase">Website URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] focus:border-[#00F5FF] text-white outline-none"
                />
                {formErrors.url && <span className="text-[#FF003C] text-[11px] mt-1 block">{formErrors.url}</span>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-[#AAA] mb-1 uppercase">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] focus:border-[#00F5FF] text-white outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && <span className="text-[#FF003C] text-[11px] mt-1 block">{formErrors.categoryId}</span>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#AAA] mb-1 uppercase">Short Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this resource..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] focus:border-[#00F5FF] text-white outline-none font-sans text-xs"
                />
              </div>

              {/* Icon selector & Color Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#AAA] mb-1 uppercase">Icon</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#161616] border border-[#333] flex items-center justify-center shrink-0">
                      <DynamicIcon name={formData.icon} size={16} color={formData.color} />
                    </div>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-2 py-2 rounded bg-[#080808] border border-[#222] text-white text-xs outline-none"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#AAA] mb-1 uppercase">Accent Color</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: col })}
                        className={`w-6 h-6 rounded border transition-all ${
                          formData.color === col ? "border-white scale-110 shadow-md" : "border-transparent"
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[#AAA] mb-1 uppercase">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="ai, tools, hosting, private"
                  className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] focus:border-[#00F5FF] text-white outline-none"
                />
              </div>

              {/* Status and Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="accent-[#FF003C]"
                  />
                  <span>PIN TO TOP</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFavorite}
                    onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                    className="accent-[#EAB308]"
                  />
                  <span>FAVORITE</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.openInNewTab}
                    onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                    className="accent-[#00F5FF]"
                  />
                  <span>NEW TAB</span>
                </label>

                <div>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "ACTIVE" | "DISABLED" | "MAINTENANCE",
                      })
                    }
                    className="w-full p-1.5 rounded bg-[#080808] border border-[#222] text-[11px] text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              {/* Classified / Hidden Vault Link */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FF003C]/10 border border-[#FF003C]/30 hover:border-[#FF003C]/50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHidden}
                    onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
                    className="accent-[#FF003C] w-4 h-4 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF003C] font-black font-mono tracking-wider text-xs">
                        🔒 CLASSIFIED VAULT LINK (TOP SECRET)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888] font-sans mt-0.5">
                      Hidden from public visitors. Only visible to you after logging into the Admin Secret Vault.
                    </p>
                  </div>
                </label>
              </div>

              {/* Private Classified Notes / Secret Credentials */}
              {formData.isHidden && (
                <div className="animate-fade">
                  <label className="block text-[#FF003C] mb-1 uppercase font-mono text-[11px]">
                    Classified Notes / Secret Token / Credentials (Admin Only)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Classified instructions, credentials, backup URLs or private keys..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#FF003C]/40 focus:border-[#FF003C] text-white outline-none font-mono text-xs"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F1F]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#161616] text-[#AAA] hover:text-white border border-[#2A2A2A]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-[#00F5FF] text-black font-bold uppercase transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] disabled:opacity-50"
                >
                  {isSaving ? "SAVING..." : "SAVE LINK"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="DELETE LINK ASSET"
        message={`Are you sure you want to permanently erase "${linkToDelete?.title}"? All historical click telemetry for this asset will be removed.`}
        confirmText="ERASE LINK"
        isDangerous={true}
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setLinkToDelete(null);
        }}
      />
    </div>
  );
};
