import React, { useState, useEffect, useMemo } from "react";
import { Search, Star, Flame, Clock, Filter, ArrowUpDown, RefreshCw, Terminal, Layers } from "lucide-react";
import { LinkItem, Category } from "../types";
import { api } from "../services/api";
import { LinkCard } from "../components/LinkCard";
import { MaintenanceBanner } from "../components/MaintenanceBanner";
import { useSettings } from "../context/SettingsContext";

export const HomePage: React.FC = () => {
  const { settings, isLoading: settingsLoading } = useSettings();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [selectedSort, setSelectedSort] = useState<string>("Newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);

  // Load data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedLinks, fetchedCats] = await Promise.all([
        api.getLinks(),
        api.getCategories(),
      ]);
      setLinks(fetchedLinks);
      setCategories(fetchedCats);
    } catch (err) {
      console.error("Failed to load hub data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen to custom search hotkey event
  useEffect(() => {
    const handleOpenSearch = () => setSearchModalOpen(true);
    window.addEventListener("open-search", handleOpenSearch);
    return () => window.removeEventListener("open-search", handleOpenSearch);
  }, []);

  // Filter & Sort Logic
  const filteredLinks = useMemo(() => {
    return links
      .filter((l) => {
        // Category filter
        if (selectedCategory !== "ALL" && l.categoryId !== selectedCategory) {
          return false;
        }

        // Quick filter
        if (selectedFilter === "FAVORITES" && !l.isFavorite) {
          return false;
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = l.title.toLowerCase().includes(q);
          const matchDesc = l.description?.toLowerCase().includes(q);
          const matchUrl = l.url.toLowerCase().includes(q);
          const matchCat = l.category?.name.toLowerCase().includes(q);
          const matchTags = l.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchUrl && !matchCat && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Always pinned first unless sorting explicitly by click or alphabet
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        switch (selectedSort) {
          case "A-Z":
            return a.title.localeCompare(b.title);
          case "Z-A":
            return b.title.localeCompare(a.title);
          case "Most Used":
            return b.clickCount - a.clickCount;
          case "Oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "Newest":
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [links, selectedCategory, selectedFilter, selectedSort, searchQuery]);

  // Favorites subset for spotlight
  const favoriteLinks = useMemo(() => {
    return links.filter((l) => l.isFavorite);
  }, [links]);

  if (settings.maintenanceMode) {
    return <MaintenanceBanner message={settings.maintenanceMessage} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0D0D] border border-[#222] text-[#00F5FF] text-xs font-mono mb-4 tracking-wider">
          <Terminal size={12} />
          <span>CYBER COMMAND INTERFACE // ONLINE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-white uppercase">
          ALL MY DIGITAL TOOLS — <span className="text-gradient-rgb">ONE SECURE PLACE</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto font-sans leading-relaxed">
          Manage, organize and access all your important websites, tools and resources from a single unified cyber dashboard.
        </p>

        {/* Global Instant Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#666] group-focus-within:text-[#00F5FF]">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search websites, tools, categories, tags... (Press Ctrl+K for command palette)"
            className="w-full pl-11 pr-24 py-3.5 rounded-xl bg-[#0A0A0A] border border-[#222] focus:border-[#00F5FF]/60 focus:bg-[#0D0D0D] text-white text-sm outline-none transition-all shadow-lg font-sans placeholder-[#666]"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-mono text-[#888] hover:text-white px-2 py-1"
              >
                CLEAR
              </button>
            )}
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#1A1A1A] text-[#777] px-2 py-1 rounded border border-[#2F2F2F]">
              Ctrl+K
            </kbd>
          </div>
        </div>
      </section>

      {/* Filter Chips & Controls */}
      <section className="mb-8 space-y-4">
        {/* Category horizontal scrolling bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all shrink-0 border ${
              selectedCategory === "ALL"
                ? "bg-[#00F5FF]/15 border-[#00F5FF] text-[#00F5FF] font-bold shadow-[0_0_15px_rgba(0,245,255,0.2)]"
                : "bg-[#0D0D0D] border-[#1F1F1F] text-[#888] hover:text-white hover:border-[#333]"
            }`}
          >
            ALL CATEGORIES ({links.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all shrink-0 border ${
                selectedCategory === cat.id
                  ? "font-bold shadow-md"
                  : "bg-[#0D0D0D] border-[#1F1F1F] text-[#888] hover:text-white hover:border-[#333]"
              }`}
              style={{
                borderColor: selectedCategory === cat.id ? cat.color : undefined,
                color: selectedCategory === cat.id ? cat.color : undefined,
                backgroundColor: selectedCategory === cat.id ? `${cat.color}15` : undefined,
              }}
            >
              {cat.name} ({links.filter((l) => l.categoryId === cat.id).length})
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar: Favorites, Most Used, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#161616]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter(selectedFilter === "FAVORITES" ? "ALL" : "FAVORITES")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                selectedFilter === "FAVORITES"
                  ? "bg-[#EAB308]/15 border-[#EAB308] text-[#EAB308] font-bold"
                  : "bg-[#0A0A0A] border-[#1F1F1F] text-[#777] hover:text-white"
              }`}
            >
              <Star size={13} fill={selectedFilter === "FAVORITES" ? "#EAB308" : "none"} />
              <span>FAVORITES ({favoriteLinks.length})</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#666] flex items-center gap-1">
              <ArrowUpDown size={12} /> SORT:
            </span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-[#0D0D0D] border border-[#222] text-[#AAA] text-xs font-mono rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00F5FF]/50"
            >
              <option value="Newest">Newest First</option>
              <option value="Most Used">Most Used</option>
              <option value="A-Z">A to Z</option>
              <option value="Z-A">Z to A</option>
              <option value="Oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Links Grid */}
      <section>
        {isLoading ? (
          <div className="py-20 text-center space-y-3 font-mono">
            <RefreshCw className="animate-spin text-[#00F5FF] mx-auto" size={28} />
            <p className="text-sm text-[#777]">SCANNING ENCRYPTED NODES...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A]/50 p-8 font-mono">
            <Layers className="text-[#444] mx-auto mb-3" size={36} />
            <h3 className="text-base font-bold text-white uppercase">NO LINKS MATCH CURRENT FILTER</h3>
            <p className="text-xs text-[#777] mt-1 max-w-sm mx-auto font-sans">
              Try adjusting your category selection, search terms or reset the filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-[#161616] text-[#00F5FF] text-xs font-mono border border-[#333] hover:bg-[#222]"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredLinks.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </section>

      {/* End of content */}
    </div>
  );
};
