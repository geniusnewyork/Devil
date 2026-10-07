import React from "react";
import { QrCode, ExternalLink, X, Shield, Smartphone } from "lucide-react";
import { cyberAudio } from "../utils/cyberAudio";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, title, url }) => {
  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&color=00F5FF&bgcolor=050505&data=${encodeURIComponent(
    url
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md scanlines">
      <div className="relative max-w-sm w-full bg-[#080808] border-2 border-[#00F5FF]/60 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,245,255,0.25)] text-center font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00F5FF] uppercase tracking-wider">
            <QrCode size={16} />
            <span>MOBILE HUD BRIDGE</span>
          </div>
          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="text-[#888] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{title}</h3>
        <p className="text-[11px] text-[#777] break-all mb-4 px-2">{url}</p>

        {/* QR Code Container with Cyber Border */}
        <div className="p-3 bg-[#030303] rounded-xl border border-[#00F5FF]/40 inline-block shadow-inner mb-4 relative group">
          <img
            src={qrImageUrl}
            alt={`QR Code for ${title}`}
            className="w-48 h-48 rounded-lg mx-auto"
            loading="lazy"
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/30 py-2 rounded-lg mb-4">
          <Smartphone size={14} />
          <span>SCAN WITH MOBILE CAMERA TO OPEN</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => cyberAudio.playSuccess()}
            className="flex-1 py-2.5 rounded-lg bg-[#00F5FF] hover:bg-[#00D0DA] text-black text-xs font-bold uppercase transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] flex items-center justify-center gap-1.5"
          >
            <span>OPEN LINK</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};
