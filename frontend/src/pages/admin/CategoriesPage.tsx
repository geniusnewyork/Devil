import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FolderTree, RefreshCw, X } from "lucide-react";
import { Category } from "../../types";
import { api } from "../../services/api";
import { DynamicIcon } from "../../components/DynamicIcon";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../context/ToastContext";

const AVAILABLE_ICONS = [
  "Folder",
  "Code2",
  "Cpu",
  "Server",
  "ShieldAlert",
  "Layers",
  "Share2",
  "Briefcase",
  "Palette",
  "TrendingUp",
  "User",
  "AlertTriangle",
  "Terminal",
  "Database",
  "Globe",
  "Zap",
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
  "#64748B",
];

export const CategoriesPage: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Folder");
  const [color, setColor] = useState("#00F5FF");
  const [sortOrder, setSortOrder] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch {
      showToast("error", "FAILED TO LOAD CATEGORIES");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("Folder");
    setColor("#00F5FF");
    setSortOrder(categories.length + 1);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setIcon(cat.icon || "Folder");
    setColor(cat.color || "#00F5FF");
    setSortOrder(cat.sortOrder);
    setFormError("");
    setModalOpen(true);
  };

  const autoGenerateSlug = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Category name is required");
      return;
    }
    if (!slug.trim()) {
      setFormError("Slug is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        icon,
        color,
        sortOrder: Number(sortOrder) || 0,
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
        showToast("success", "CATEGORY UPDATED", `Updated "${payload.name}"`);
      } else {
        await api.createCategory(payload);
        showToast("success", "CATEGORY CREATED", `Created "${payload.name}"`);
      }

      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      setFormError(err.message || "Failed to save category");
      showToast("error", "ACTION FAILED", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsSaving(true);
    try {
      await api.deleteCategory(categoryToDelete.id);
      showToast("success", "CATEGORY DELETED", `Removed "${categoryToDelete.name}"`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (err: any) {
      showToast("error", "DELETE FAILED", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-5">
        <div>
          <h1 className="text-2xl font-black font-mono tracking-tight text-white uppercase">
            CATEGORY ARCHITECTURE
          </h1>
          <p className="text-xs text-[#888] font-mono mt-1">
            Taxonomy classification, icons and visual themes for organizing links.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F5FF] hover:bg-[#00D0DA] text-black font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>NEW CATEGORY</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-[#666] font-mono">
            <RefreshCw className="animate-spin mx-auto mb-2 text-[#00F5FF]" size={24} />
            LOADING CATEGORIES...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#666] font-mono">
            NO CATEGORIES FOUND
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] hover:border-[#333] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center border"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      borderColor: `${cat.color}40`,
                      color: cat.color,
                    }}
                  >
                    <DynamicIcon name={cat.icon} size={20} color={cat.color} />
                  </div>

                  <span className="text-xs font-mono text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/20">
                    {cat.linkCount || 0} links
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3 font-sans">{cat.name}</h3>
                <span className="text-[11px] font-mono text-[#555] block mt-0.5">slug: {cat.slug}</span>
                {cat.description && (
                  <p className="text-xs text-[#888] font-sans mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#1A1A1A] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#555]">ORDER: #{cat.sortOrder}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded bg-[#161616] hover:bg-[#222] border border-[#2A2A2A] text-[#AAA] hover:text-[#00F5FF]"
                    title="Edit category"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setCategoryToDelete(cat);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded bg-[#FF003C]/10 hover:bg-[#FF003C]/20 border border-[#FF003C]/30 text-[#FF003C]"
                    title="Delete category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
          <div className="relative max-w-md w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#777] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black font-mono text-white tracking-wider uppercase mb-1">
              {editingCategory ? "EDIT CATEGORY" : "CREATE CATEGORY"}
            </h3>
            <p className="text-xs text-[#888] font-mono mb-4">
              Configure classification attributes and visual color coding.
            </p>

            {formError && (
              <div className="p-2.5 mb-4 rounded bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C] text-xs font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#AAA] mb-1 uppercase">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => autoGenerateSlug(e.target.value)}
                  placeholder="e.g. CYBERSECURITY"
                  className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] focus:border-[#00F5FF] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#AAA] mb-1 uppercase">Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. cybersecurity"
                  className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] focus:border-[#00F5FF] text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#AAA] mb-1 uppercase">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary..."
                  className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222] focus:border-[#00F5FF] text-white outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#AAA] mb-1 uppercase">Icon</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-2 py-2 rounded bg-[#080808] border border-[#222] text-white outline-none"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#AAA] mb-1 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded bg-[#080808] border border-[#222] text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#AAA] mb-1 uppercase">Color Theme</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className={`w-6 h-6 rounded border transition-all ${
                        color === col ? "border-white scale-110 shadow-md" : "border-transparent"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

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
                  {isSaving ? "SAVING..." : "SAVE CATEGORY"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="DELETE CATEGORY"
        message={`Delete "${categoryToDelete?.name}"? All associated links will lose this category classification.`}
        confirmText="DELETE CATEGORY"
        isDangerous={true}
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
};
