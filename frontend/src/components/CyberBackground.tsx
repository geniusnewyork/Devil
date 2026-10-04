import React from "react";

export const CyberBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Background Dark Solid */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-70" />

      {/* Ambient Radial Cyber Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF003C]/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#00F5FF]/10 rounded-full blur-[140px]" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-[#9D00FF]/10 rounded-full blur-[160px]" />

      {/* Scanline pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-40" />
    </div>
  );
};
