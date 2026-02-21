
import React from 'react';
import {
  LayoutDashboard,
  Glasses,
  Map as MapIcon,
  UserCircle,
  Binary,
  LogOut,
  Sparkles
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

import logo from '../logo.jpeg';

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: ViewType.DASHBOARD, label: 'Dashboard General', icon: LayoutDashboard },
    { id: ViewType.AR_VIEW, label: 'Asistencia AR', icon: Glasses },
    { id: ViewType.WAREHOUSE_MAP, label: 'Mapa Operativo', icon: MapIcon },
    { id: ViewType.WORKER_PANEL, label: 'Panel Operario', icon: UserCircle },
    { id: ViewType.DIGITAL_TWIN, label: 'Gemelo Digital', icon: Binary },
    { id: ViewType.AI_STUDIO, label: 'Asistente de Almacén', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col z-20">
      <div className="p-10 pb-4">
        <div className="flex flex-col select-none group cursor-default">
          <img src={logo} alt="Tailoy Logo" className="w-24 object-contain" />
          <div className="mt-3 flex items-center gap-2">
            <div className="h-[2px] w-3 bg-[#FFD200]"></div>
            <span className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">Smart Core</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                ? 'bg-[#009639] text-white shadow-xl shadow-[#009639]/20 translate-x-1'
                : 'text-gray-400 hover:text-[#009639] hover:bg-gray-50'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-bold text-[13px]">{item.label}</span>
              {isActive && (
                <div className="ml-auto">
                  <div className="w-1.5 h-1.5 bg-[#FFD200] rounded-full shadow-[0_0_8px_#FFD200]"></div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-50 bg-gray-50/30">
        <button className="flex items-center space-x-3 px-4 py-2 w-full text-gray-400 hover:text-red-500 transition-colors text-[12px] font-bold uppercase tracking-wider">
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
