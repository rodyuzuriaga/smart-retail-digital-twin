
import React from 'react';
import { Glasses, Zap, Shield } from 'lucide-react';
import arImage from '../AR.jpg';

export const ARView: React.FC = () => {
  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-4 animate-in zoom-in-95 duration-700">
      {/* AR Viewport */}
      <div className="relative flex-1 bg-gray-900 rounded-3xl overflow-hidden border border-gray-200 branded-shadow">
        <img
          src={arImage}
          alt="Vista de Realidad Aumentada - Asistencia de Picking"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between branded-shadow">
        <div className="flex items-center gap-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
          <div className="flex items-center gap-2">
            <Glasses size={16} className="text-[#009639]" />
            <span>AR Picking Asistido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#009639] rounded-full shadow-[0_0_8px_rgba(0,150,57,0.5)] animate-pulse"></div> RFID: STABLE
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#FFD200] rounded-full shadow-[0_0_8px_rgba(255,210,0,0.5)]"></div> PATH: OPTIMIZING
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield size={14} className="text-[#009639]" />
          <span className="text-gray-300 font-mono text-[10px] tracking-wider">ENGINE_ULTRA_LOW_LATENCY · 5G</span>
        </div>
      </div>
    </div>
  );
};
