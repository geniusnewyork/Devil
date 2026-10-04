import React from "react";
import * as Icons from "lucide-react";

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = "", size = 20, color }) => {
  // Normalize icon name
  const LucideIcon = (Icons as Record<string, any>)[name] || Icons.Globe;
  return <LucideIcon className={className} size={size} color={color} />;
};
