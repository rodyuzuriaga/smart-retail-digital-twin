
import React from 'react';
import { Bell, Search, User, Settings, Sparkles } from 'lucide-react'; // Added Sparkles
import { ViewType } from './monitorTypes';

interface HeaderProps {
  activeView: ViewType;
  onOpenChat: () => void; // Added prop
}

export const Header: React.FC<HeaderProps> = ({ activeView, onOpenChat }) => {
  const getTitle = () => {
    switch (activeView) {
      case ViewType.DASHBOARD: return 'Dashboard Operativo';
      case ViewType.AR_VIEW: return 'Visualización AR';
      case ViewType.WAREHOUSE_MAP: return 'Mapa de Almacén';
      case ViewType.WORKER_PANEL: return 'Panel del Trabajador';
      case ViewType.DIGITAL_TWIN: return 'Gemelo Digital';
      default: return 'Monitor';
    }
  };

  return (
    <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-1 h-6 bg-[#FFD200] rounded-full"></div>
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">{getTitle()}</h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative group hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          <input
            type="text"
            placeholder="Buscar SKU, Robot..."
            className="bg-gray-50 border border-gray-100 rounded-full px-10 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#009639]/10 focus:border-[#009639] transition-all w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* AI Chat Button */}
          <button 
            onClick={onOpenChat}
            className="p-2 text-gray-500 hover:text-[#009639] hover:bg-green-50 rounded-full transition-all relative group"
            title="Asistente IA"
          >
            <Sparkles size={18} />
             <span className="absolute top-2 right-2 w-2 h-2 bg-[#FFD200] rounded-full border-2 border-white animate-pulse"></span>
          </button>

          <div className="h-4 w-[1px] bg-gray-100 mx-1"></div>

          <button className="p-2 text-gray-400 hover:text-[#009639] transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-4 w-[1px] bg-gray-100 mx-2"></div>
          <div className="flex items-center gap-3 group cursor-pointer bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 hover:bg-gray-100 transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-gray-800 leading-none">Supervisor CD</p>
              <p className="text-[9px] text-[#009639] font-bold uppercase tracking-tighter">Online</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#FFD200] flex items-center justify-center text-white shadow-inner">
              <User size={14} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
