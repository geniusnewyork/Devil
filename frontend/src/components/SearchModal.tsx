import React, { useState, useEffect, useRef } from "react";
import { Search, X, ExternalLink, ArrowRight } from "lucide-react";
import { LinkItem } from "../types";
import { DynamicIcon } from "./DynamicIcon";
import { api } from "../services/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: LinkItem[];
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, links: propLinks }) => {
  const [internalLinks, setInternalLinks] = useState<LinkItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      if (!propLinks || propLinks.length === 0) {
        api.getLinks().then((data) => setInternalLinks(data)).catch(() => {});
      } else {
        setInternalLinks(propLinks);
      }
    }
  }, [isOpen, propLinks]);

  const activeLinks = propLinks && propLinks.length > 0 ? propLinks : internalLinks;


  // Global CTRL+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent
          const event = new CustomEvent("open-search");
          window.dispatchEvent(event);
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter links
  const filtered = activeLinks.filter((link) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchTitle = link.title.toLowerCase().includes(q);
    const matchDesc = link.description?.toLowerCase().includes(q);
    const matchUrl = link.url.toLowerCase().includes(q);
    const matchCat = link.category?.name.toLowerCase().includes(q);
    const matchTags = link.tags?.some((t) => t.toLowerCase().includes(q));
    return matchTitle || matchDesc || matchUrl || matchCat || matchTags;
  }).slice(0, 10); // top 10

  const handleSelect = (link: LinkItem) => {
    api.recordClick(link.id).catch(() => {});
    window.open(link.url, link.openInNewTab ? "_blank" : "_self", "noopener,noreferrer");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1F1F1F] gap-3 bg-[#080808]">
          <Search className="text-[#00F5FF] shrink-0" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search websites, tools, URLs, tags (Press ESC to close)..."
            className="w-full bg-transparent text-white placeholder-[#666] outline-none text-sm font-sans"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#666] hover:text-white">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#1A1A1A] text-[#777] px-2 py-0.5 rounded border border-[#333]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[#161616]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#666] font-mono text-sm">
              NO MATCHING DIGITAL TOOLS FOUND FOR &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((link, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={link.id}
                  onClick={() => handleSelect(link)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#181818] border border-[#00F5FF]/30 text-white"
                      : "hover:bg-[#121212] text-[#AAA]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${link.color}15`,
                        borderColor: `${link.color}30`,
                        color: link.color,
                      }}
                    >
                      <DynamicIcon name={link.icon} size={18} color={link.color} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate font-sans">
                          {link.title}
                        </span>
                        {link.category && (
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded border"
                            style={{
                              backgroundColor: `${link.category.color}10`,
                              borderColor: `${link.category.color}30`,
                              color: link.category.color,
                            }}
                          >
                            {link.category.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#777] truncate max-w-md font-mono mt-0.5">
                        {link.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isSelected && (
                      <span className="text-[11px] font-mono text-[#00F5FF] flex items-center gap-1">
                        PRESS ENTER <ArrowRight size={12} />
                      </span>
                    )}
                    <ExternalLink size={14} className="text-[#555]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-2 bg-[#080808] border-t border-[#1F1F1F] flex items-center justify-between text-[11px] font-mono text-[#666]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div>{filtered.length} RESULTS</div>
        </div>
      </div>
    </div>
  );
};
