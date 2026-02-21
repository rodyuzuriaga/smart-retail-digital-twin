
import React, { useEffect, useState, useRef } from 'react';
import { Navigation2, Truck, Activity, Zap, AlertTriangle, Package, Map as MapIcon, RotateCcw } from 'lucide-react';

// --- Types needed for telemetry ---
interface TelemetryData {
  amrs: {
    id: number;
    x: number;
    z: number;
    status: 'IDLE' | 'MOVING' | 'LOADING' | 'UNLOADING';
    cargo: string | null;
  }[];
  player: {
    x: number;
    z: number;
  };
  timestamp: number;
}

// Helper to map 3D world coordinates (X, Z) to 2D SVG coordinates
// Based on the previous SVG: 1000x450 size.
// Let's assume the warehouse floor in 3D is roughly -50 to 50 in X and -20 to 20 in Z (based on typical 3D scenes).
// We need to calibrate this. If the user moves in the 3D scene, we'll see dots move here.
const map3DTo2D = (x: number, z: number) => {
    // Calibration constants (adjust these to match your actual 3D scene scale)
    // Assuming a scene width of ~100 units mapped to 900 SVG units width
    // Assuming a scene depth of ~120 units mapped to 450 SVG units height
    const scaleX = 10;
    const scaleY = 3.5;
    const offsetX = 500; // Center X
    const offsetY = 225; // Center Y
    
    return {
        cx: offsetX + (x * scaleX),
        cy: offsetY + (z * scaleY)
    };
};


export const WarehouseMap: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('Esperando señal...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel('tailoy-warehouse-monitor');

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TELEMETRY_UPDATE') {
        const data = event.data.payload as TelemetryData;
        setTelemetry(data);
        setLastUpdate(new Date().toLocaleTimeString());
        setIsConnected(true);
      }
    };

    channel.addEventListener('message', handleMessage);

    // Timeout to detect disconnection
    const interval = setInterval(() => {
        if (telemetry && Date.now() - telemetry.timestamp > 2000) {
            setIsConnected(false);
        }
    }, 1000);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      clearInterval(interval);
    };
  }, [telemetry]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 branded-shadow relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
            <Navigation2 size={20} className="text-[#009639] animate-pulse" /> Plano Operativo Digital Twin
            {isConnected ? (
                 <span className="w-2 h-2 rounded-full bg-[#009639] animate-pulse ml-2" title="Conectado a Simulación 3D"></span>
            ) : (
                <span className="w-2 h-2 rounded-full bg-gray-300" title="Desconectado"></span>
            )}
          </h3>
          <div className="flex gap-4">
            <MapLegend color="bg-[#009639]" label="AMR Activo" />
            <MapLegend color="bg-[#FFD200]" label="Picking" />
            <MapLegend color="bg-blue-500" label="Jugador / Humano" />
             <div className="text-xs text-gray-400 self-center">
                Última act: {lastUpdate}
             </div>
          </div>
        </div>

        {/* Warehouse Floor Plan - SVG Blueprint */}
        <div className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-inner flex-grow w-full" style={{ minHeight: '400px' }}>
          <svg viewBox="0 0 1000 450" className="w-full h-full object-contain" xmlns="http://www.w3.org/2000/svg">
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
              {/* AMR glow filter */}
              <filter id="amrGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width="1000" height="450" fill="url(#grid)" />

            {/* Warehouse Walls (Static Reference) */}
            <rect x="20" y="20" width="960" height="410" fill="none" stroke="#9ca3af" strokeWidth="2.5" rx="6" />

             {/* Static Zones for Reference (Simplified) */}
             <rect x="50" y="50" width="200" height="350" fill="#f0fdf4" fillOpacity="0.3" stroke="#009639" strokeDasharray="4,4" />
             <text x="150" y="225" textAnchor="middle" fill="#009639" opacity="0.5" fontSize="20" fontWeight="bold">ZONA A</text>

             <rect x="300" y="50" width="200" height="350" fill="#fffbeb" fillOpacity="0.3" stroke="#f59e0b" strokeDasharray="4,4" />
             <text x="400" y="225" textAnchor="middle" fill="#f59e0b" opacity="0.5" fontSize="20" fontWeight="bold">ZONA B</text>

             <rect x="550" y="50" width="200" height="350" fill="#eff6ff" fillOpacity="0.3" stroke="#3b82f6" strokeDasharray="4,4" />
             <text x="650" y="225" textAnchor="middle" fill="#3b82f6" opacity="0.5" fontSize="20" fontWeight="bold">ZONA C</text>


            {/* DYNAMIC ELEMENTS FROM TELEMETRY */}
            <g filter="url(#amrGlow)">
                {telemetry?.amrs.map((amr) => {
                    const pos = map3DTo2D(amr.x, amr.z);
                    return (
                        <g key={amr.id} style={{ transition: 'all 0.1s linear' }}>
                             <circle 
                                cx={pos.cx} 
                                cy={pos.cy} 
                                r="12" 
                                fill={amr.status === 'IDLE' ? '#9ca3af' : '#009639'} 
                                stroke="white" 
                                strokeWidth="2" 
                            />
                            <text x={pos.cx} y={pos.cy + 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{amr.id}</text>
                            {/* Status Label */}
                            <text x={pos.cx} y={pos.cy - 16} textAnchor="middle" fill="#374151" fontSize="8" fontWeight="bold" className="uppercase">{amr.status}</text>
                        </g>
                    );
                })}

                {telemetry?.player && (() => {
                    const pPos = map3DTo2D(telemetry.player.x, telemetry.player.z);
                    return (
                        <g style={{ transition: 'all 0.1s linear' }}>
                            <circle cx={pPos.cx} cy={pPos.cy} r="10" fill="#3b82f6" stroke="white" strokeWidth="2" />
                            <text x={pPos.cx} y={pPos.cy - 14} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">TÚ</text>
                        </g>
                    );
                })()}
            </g>
            
            {!isConnected && (
                <text x="500" y="225" textAnchor="middle" fill="#ef4444" fontSize="24" fontWeight="bold" opacity="0.5">SISTEMA DESCONECTADO (Sin Telemetría)</text>
            )}

          </svg>

          {/* Interactive tooltip info */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Estado · <span className={isConnected ? "text-[#009639]" : "text-red-500"}>{isConnected ? 'LIVE LINK' : 'OFFLINE'}</span></p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:border-red-500/30">
            <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Flota Activa</p>
            <p className="text-lg font-bold text-[#009639]">{telemetry?.amrs.length || 0} Unidades</p>
            <p className="text-[10px] text-gray-400 mt-1 italic">Conectados a la red Mesh</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:border-[#009639]/30">
            <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Carga de Red</p>
            <p className="text-lg font-bold text-blue-600">Baja</p>
            <p className="text-[10px] text-gray-400 mt-1 italic">Latencia &lt; 20ms</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:border-blue-500/30">
             <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Ubicación Jugador</p>
            <p className="text-lg font-bold text-gray-700">
                {telemetry?.player ? `${telemetry.player.x.toFixed(0)}, ${telemetry.player.z.toFixed(0)}` : '--, --'}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 italic">Coordenadas Globales</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
           {/* Sidebar Info Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 branded-shadow relative group">
          <h4 className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2 uppercase">
            <Truck size={14} className="text-[#009639]" /> Detalle de Flota
          </h4>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
             {telemetry?.amrs.map(amr => (
                 <div key={amr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                     <div>
                         <p className="text-[11px] font-bold text-gray-800">AMR-{amr.id}</p>
                         <p className="text-[9px] text-gray-400 font-mono">Pos: {amr.x.toFixed(1)}, {amr.z.toFixed(1)}</p>
                     </div>
                     <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                         amr.status === 'MOVING' ? 'bg-[#009639]/10 text-[#009639]' : 'bg-gray-200 text-gray-500'
                     }`}>
                         {amr.status}
                     </div>
                 </div>
             ))}
             {(!telemetry || telemetry.amrs.length === 0) && (
                 <p className="text-xs text-gray-400 italic text-center py-4">Sin robots activos</p>
             )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 branded-shadow">
          <h4 className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2 uppercase">
            <Activity size={14} className="text-[#009639]" /> Estado del Enlace
          </h4>
          <div className="space-y-4">
            <SystemMetric label="Canal Broadcast" value="Abierto" status="good" />
            <SystemMetric label="Frames/Sec" value="60" status="good" />
            <SystemMetric label="Sincroniz." value={isConnected ? "100%" : "0%"} status={isConnected ? "good" : "error"} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MapLegend: React.FC<{ color: string, label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
    <span className="text-[10px] font-medium text-gray-500">{label}</span>
  </div>
);

const ShipmentItem: React.FC<{ time: string, status: 'ready' | 'pending' | 'loading', label: string }> = ({ time, status, label }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:bg-gray-100">
    <div>
      <p className="text-[11px] font-bold text-gray-800">{label}</p>
      <p className="text-[9px] text-gray-400 font-mono tracking-tighter">{time}</p>
    </div>
    <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${status === 'ready' ? 'bg-[#009639]/10 text-[#009639] border border-[#009639]/20' :
        status === 'loading' ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20' :
          'bg-gray-200 text-gray-500 border border-gray-300'
      }`}>
      {status}
    </div>
  </div>
);

const SystemMetric: React.FC<{ label: string, value: string, status: 'good' | 'warning' | 'error' }> = ({ label, value, status }) => (
  <div className="flex items-center justify-between group">
    <span className="text-[11px] text-gray-500 group-hover:text-gray-800 transition-colors">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-mono font-bold text-gray-700">{value}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'good' ? 'bg-[#009639]' : status === 'warning' ? 'bg-[#FFD200]' : 'bg-red-500'} animate-pulse`}></div>
    </div>
  </div>
);
