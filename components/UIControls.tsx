
import React, { useState, useEffect } from 'react';
import { WorldConfig } from '../types';
import { MousePointer2, Cpu } from 'lucide-react';

interface UIControlsProps {
  config: WorldConfig;
  isLoading: boolean;
  heldBox: string | null;
}

const UIControls: React.FC<UIControlsProps> = ({ config, isLoading, heldBox }) => {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement !== null);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white">
      {isLocked ? (
        <>
          {/* Minimal Crosshair */}
          <div className="w-1 h-1 bg-white rounded-full opacity-50" />
        </>
      ) : (
        <div className="bg-slate-950/95 p-12 rounded-[40px] border border-orange-500/30 text-center max-w-xl shadow-2xl pointer-events-auto backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <img src="/tailoy.jpeg" alt="Tai Loy" className="h-20 w-auto object-contain rounded-xl" />
          </div>

          <h1 className="text-5xl font-black mb-4 tracking-tighter text-white uppercase italic">
            SMART <span className="text-orange-500 underline decoration-4">RETAIL</span>
          </h1>

          <p className="text-slate-400 mb-10 text-sm leading-relaxed font-medium">
            Entra al almacén para gestionar la flota. <br />
            Selecciona robots en la estación trasera para activarlos.
          </p>

          <div className="flex flex-col gap-6 items-center">
            <button
              onClick={() => document.body.requestPointerLock()}
              className="group flex items-center gap-4 bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-orange-400 transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(249,115,22,0.3)]"
            >
              <MousePointer2 className="w-6 h-6" />
              <span>INICIAR OPERACIÓN</span>
            </button>

            <div className="grid grid-cols-2 gap-8 w-full border-t border-white/10 mt-10 pt-10">
              <div className="text-left">
                <span className="text-[10px] text-orange-500 font-bold block mb-1">MOVIMIENTO</span>
                <span className="text-xs text-white/70">WASD + MOUSE</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-orange-500 font-bold block mb-1">INTERACCIÓN</span>
                <span className="text-xs text-white/70">CLICK IZQUIERDO</span>
              </div>
              
              <div className="col-span-2 mt-4 pt-4 border-t border-white/5 flex gap-4 justify-center">
                    <button 
                        onClick={() => window.open('/#monitor', '_blank')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg border border-slate-600 transition-colors uppercase tracking-widest font-bold"
                    >
                        Abrir Dashboard Monitor
                    </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UIControls;
