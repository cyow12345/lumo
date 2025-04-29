import React from 'react';
import { LucideIcon } from 'lucide-react';

type SidebarItemProps = {
  icon?: string; // Emoji-Icon (optional)
  lucideIcon?: React.ElementType; // Lucide-Icon Komponente (optional)
  label: string;
  active?: boolean;
};

export default function SidebarItem({ icon, lucideIcon: LucideIcon, label, active = false }: SidebarItemProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer text-white transition-all duration-200 ${
        active 
          ? 'bg-white/15 text-white font-medium border-l-2 border-lavender pl-[14px]' 
          : 'hover:bg-white/10 text-white/80 hover:text-white'
      }`}
    >
      {LucideIcon ? (
        <LucideIcon className="w-5 h-5" />
      ) : (
        <span className="text-lg">{icon}</span>
      )}
      <span>{label}</span>
    </div>
  );
} 