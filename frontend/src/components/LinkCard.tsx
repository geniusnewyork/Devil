import React, { useState } from "react";
import { ExternalLink, Star, Pin, Eye, Copy, Check } from "lucide-react";
import { LinkItem } from "../types";
import { DynamicIcon } from "./DynamicIcon";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";

interface LinkCardProps {
  link: LinkItem;
  isAdmin?: boolean;
  onEdit?: (link: LinkItem) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link, isAdmin, onEdit }) => {
  const { showToast } = useToast();
  const [clickCount, setClickCount] = useState(link.clickCount);
  const [copied, setCopied] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpening(true);

    try {
      // Record click asynchronously
      api.recordClick(link.id).then((res) => {
        if (res && typeof res.clicks === "number") {
          setClickCount(res.clicks);
        }
      }).catch(() => {});

      if (link.openInNewTab) {
        window.open(link.url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = link.url;
      }
    } finally {
      setTimeout(() => setIsOpening(false), 500);
    }
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    showToast("success", "URL COPIED", link.url, 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRgb = link.isPinned || link.isFavorite;

  return (
    <div
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpen(e as any);
        }
      }}
      className={`group relative flex flex-col justify-between p-5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden border ${
        isRgb
          ? "border-transparent bg-[#0D0D0D] shadow-lg hover:shadow-[0_0_25px_rgba(0,245,255,0.2)] hover:-translate-y-1"
          : "border-[#1F1F1F] bg-[#0A0A0A] hover:border-[#00F5FF]/40 hover:bg-[#0D0D0D] hover:shadow-[0_0_20px_rgba(0,245,255,0.12)] hover:-translate-y-1"
      }`}
      style={{
        boxShadow: isRgb ? `0 0 15px ${link.color}25` : undefined,
      }}
    >
      {/* RGB Border effect if pinned/favorite */}
      {isRgb && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none p-[1px] -z-10"
          style={{
            background: `linear-gradient(135deg, ${link.color}, #9D00FF, #00F5FF, #00FF66)`,
          }}
        />
      )}

      {/* Top Header inside Card */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundColor: `${link.color}15`,
                borderColor: `${link.color}40`,
                color: link.color,
              }}
            >
              <DynamicIcon name={link.icon} size={24} color={link.color} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-[#00F5FF] transition-colors leading-tight font-sans">
                  {link.title}
                </h3>
              </div>
              {link.category && (
                <span
                  className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${link.category.color}15`,
                    borderColor: `${link.category.color}35`,
                    color: link.category.color,
                  }}
                >
                  {link.category.name}
                </span>
              )}
            </div>
          </div>

          {/* Badges: Pin, Favorite */}
          <div className="flex items-center gap-1.5 shrink-0">
            {link.isPinned && (
              <span className="p-1 rounded bg-[#FF003C]/10 border border-[#FF003C]/30 text-[#FF003C]" title="Pinned Link">
                <Pin size={12} />
              </span>
            )}
            {link.isFavorite && (
              <span className="p-1 rounded bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308]" title="Favorite">
                <Star size={12} fill="#EAB308" />
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {link.description && (
          <p className="mt-3 text-xs text-[#999999] line-clamp-2 leading-relaxed font-sans">
            {link.description}
          </p>
        )}

        {/* Tags */}
        {link.tags && link.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {link.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-mono text-[#777] bg-[#141414] px-2 py-0.5 rounded border border-[#222]"
              >
                #{tag}
              </span>
            ))}
            {link.tags.length > 3 && (
              <span className="text-[10px] font-mono text-[#555]">+{link.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#1A1A1A] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#666]">
          <span className="flex items-center gap-1" title="Usage count">
            <Eye size={12} />
            {clickCount}
          </span>
          <span className="text-[#333]">|</span>
          <span className="truncate max-w-[120px] text-[#555]" title={link.url}>
            {link.url.replace(/^https?:\/\//, "")}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyUrl}
            className="p-1.5 rounded-md hover:bg-[#1F1F1F] text-[#777] hover:text-white transition-colors"
            title="Copy URL"
            aria-label="Copy URL"
          >
            {copied ? <Check size={14} className="text-[#00FF66]" /> : <Copy size={14} />}
          </button>

          <button
            onClick={handleOpen}
            disabled={isOpening}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00F5FF]/10 hover:bg-[#00F5FF]/20 border border-[#00F5FF]/30 text-[#00F5FF] text-xs font-mono font-semibold transition-all group-hover:border-[#00F5FF]"
          >
            <span>{isOpening ? "OPENING..." : "OPEN"}</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
