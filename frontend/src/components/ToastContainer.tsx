import React from "react";
import { useToast } from "../context/ToastContext";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = "border-[#1F1F1F]";
        let bgClass = "bg-[#0D0D0D]/95";
        let icon = <CheckCircle2 className="text-[#00FF66] shrink-0" size={20} />;

        switch (toast.type) {
          case "success":
            borderClass = "border-[#00FF66]/50 shadow-[0_0_15px_rgba(0,255,102,0.15)]";
            icon = <CheckCircle2 className="text-[#00FF66] shrink-0" size={20} />;
            break;
          case "warning":
            borderClass = "border-[#EAB308]/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]";
            icon = <AlertTriangle className="text-[#EAB308] shrink-0" size={20} />;
            break;
          case "error":
            borderClass = "border-[#FF003C]/50 shadow-[0_0_15px_rgba(255,0,60,0.2)]";
            icon = <XCircle className="text-[#FF003C] shrink-0" size={20} />;
            break;
          case "security":
            borderClass = "border-[#FF003C] shadow-[0_0_20px_rgba(255,0,60,0.3)] animate-pulse";
            icon = <ShieldAlert className="text-[#FF003C] shrink-0" size={20} />;
            break;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md transition-all duration-300 ${borderClass} ${bgClass}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold font-mono tracking-wider text-white uppercase">{toast.title}</h4>
              {toast.message && <p className="text-xs text-[#A0A0A0] mt-1 break-words leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#666] hover:text-white transition-colors p-1"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
