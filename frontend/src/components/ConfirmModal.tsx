import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
      <div className="relative max-w-md w-full bg-[#0D0D0D] border border-[#222] rounded-xl p-6 shadow-2xl">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-[#777] hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              isDangerous
                ? "bg-[#FF003C]/10 border-[#FF003C]/40 text-[#FF003C]"
                : "bg-[#EAB308]/10 border-[#EAB308]/40 text-[#EAB308]"
            }`}
          >
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-base font-bold font-mono text-white tracking-wide uppercase">
            {title}
          </h3>
        </div>

        <p className="text-sm text-[#999] leading-relaxed mb-6 font-sans">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 font-mono text-xs">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-[#161616] hover:bg-[#222] text-[#AAA] hover:text-white transition-colors border border-[#2A2A2A]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              isDangerous
                ? "bg-[#FF003C] hover:bg-[#DC143C] text-black shadow-[0_0_15px_rgba(255,0,60,0.3)]"
                : "bg-[#00F5FF] hover:bg-[#00D0DA] text-black shadow-[0_0_15px_rgba(0,245,255,0.3)]"
            }`}
          >
            {isLoading ? "PROCESSING..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
