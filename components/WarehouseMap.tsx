
import React, { useEffect, useState, useRef } from 'react';
import { Navigation2, Activity, Zap, power, Home } from 'lucide-react';
import { AIChatDrawer } from './AIChatDrawer'; 

// --- Types needed for telemetry ---
interface TelemetryData {
  amrs: {
    id: number;
    x: number;
    z: number;
    status: 'IDLE' | 'FOLLOWING' | 'WAITING_DEST' | 'DELIVERING' | 'RETURNING';
    cargo: string | null;
    deliveryCount: number;
    battery: number;
  }[];
  player: {
    x: number;
    z: number;
  };
  timestamp: number;
}

// -------------------------------------------------------------
// HELPER: Map 3D coords to Screen Layout (Responsive)
// -------------------------------------------------------------
const map3DToScreen = (x: number, z: number, isVertical: boolean) => {
    if (isVertical) {
        // VERTICAL MODE (Mobile/Narrow)
        // World X (-50 to 50) -> Screen X (width 400)
        // World Z (-80 to 80) -> Screen Y (height 800)
        const scale = 4; 
        const offsetX = 200; // Center of width 400
        const offsetY = 400; // Center of height 800

        // No rotation: World X -> Screen X, World Z -> Screen Y
        return {
            cx: offsetX + (x * scale),
            cy: offsetY + (z * scale)
        };
    } else {
        // HORIZONTAL MODE (Desktop/Wide)
        // World Z (-80 to 80) -> Screen X (width 800)
        // World X (-50 to 50) -> Screen Y (height 500)
        const scale = 4.5; 
        const offsetX = 380; // Center of width 800
        const offsetY = 250; // Center of height 500

        // Rotation: World Z -> Screen X, World X -> Screen Y
        return {
            cx: offsetX + (z * scale), 
            cy: offsetY + (x * scale) 
        };
    }
};

// --- STATIC MAP DATA ---
// Updated to match Planet.tsx simulation constants exactly
const HIGHWAYS_X = [-30, -22, -14, -6, 6, 14, 22, 30];
const CROSSINGS_Z = [-55, -15, 25, 65];

const DOCK_DATA = [
    { id: 1, x: -40, z: -55 },
    { id: 2, x: -40, z: -15 },
    { id: 3, x: -40, z: 25 },
    { id: 4, x: -40, z: 65 },
    { id: 5, x: 40, z: -55 },
    { id: 6, x: 40, z: -15 },
    { id: 7, x: 40, z: 25 },
    { id: 8, x: 40, z: 65 },
];

const RACKS = [
    // Racks generated based on Planet.tsx logic
    ...[-26, -18, -10, 10, 18, 26].flatMap(x => 
        [-50, -10, 30].map((zStart, i) => ({ 
            id: `R-${x}-${i}`, 
            x, 
            zStart, 
            length: 30 
        }))
    )
];

const MapLegend: React.FC<{ color: string, label: string }> = ({ color, label }) => (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
      <span className="text-[10px] font-medium text-gray-400">{label}</span>
    </div>
);

// -------------------------------------------------------------
// COMPONENT: ROBOT CONTROL CARD
// -------------------------------------------------------------
const RobotControlCard = ({ amr, sendCommand }: { amr: TelemetryData['amrs'][0], sendCommand: (id: number, cmd: string) => void }) => {
    return (
        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 min-w-[140px]">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${amr.status === 'IDLE' ? 'bg-gray-300' : 'bg-green-500 animate-pulse'}`}></div>
                    <span className="font-bold text-gray-700 text-sm">R-{amr.id}</span>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                        <Zap size={10} className={amr.battery < 20 ? 'text-red-500' : 'text-yellow-500'} fill="currentColor" />
                        <span className="text-[10px] font-mono text-gray-500">{Math.round(amr.battery)}%</span>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>Estado: <span className="text-gray-600 font-medium">{amr.status === 'IDLE' ? 'Inactivo' : amr.status}</span></span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
                <button 
                    onClick={() => sendCommand(amr.id, 'TOGGLE_ACTIVE')}
                    className={`flex items-center justify-center p-1.5 rounded text-xs font-semibold transition-colors ${
                        amr.status !== 'IDLE' 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                    }`}
                >
                    {amr.status !== 'IDLE' ? 'PAUSE' : 'START'}
                </button>
                <button 
                    onClick={() => sendCommand(amr.id, 'RETURN_HOME')}
                    className="flex items-center justify-center p-1.5 rounded text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    title="Volver a Base"
                >
                    <Home size={12} />
                </button>
            </div>
        </div>
    );
};


// -------------------------------------------------------------
// MAIN COMPONENT: WAREHOUSE MAP DASHBOARD
// -------------------------------------------------------------
export const WarehouseMap: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('Esperando señal...');
  const [isConnected, setIsConnected] = useState(false);
  const [isVertical, setIsVertical] = useState(false); // Track layout mode
  const channelRef = useRef<BroadcastChannel | null>(null);
  const containerRef = useRef<HTMLDivElement>(null); // For resize observation

  // Detect Resize / Orientation
  useEffect(() => {
    const handleResize = () => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            // If height > width or width is small, go vertical
            setIsVertical(width < 768 || height > width);
        }
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('tailoy-warehouse-monitor');

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TELEMETRY_UPDATE') {
        const data = event.data.payload as TelemetryData;
        setTelemetry(prev => {
            if (prev && data.timestamp < prev.timestamp) return prev;
            return data;
        });
        setLastUpdate(new Date().toLocaleTimeString());
        setIsConnected(true);
      }
    };

    channelRef.current.addEventListener('message', handleMessage);

    const interval = setInterval(() => {
        if (telemetry && Date.now() - telemetry.timestamp > 5000) { 
            setIsConnected(false);
        }
    }, 1000);

    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
      clearInterval(interval);
    };
  }, [telemetry]);

  const sendCommand = (robotId: number, command: string) => {
      if (channelRef.current) {
          channelRef.current.postMessage({
              type: 'ROBOT_COMMAND',
              payload: { id: robotId, command }
          });
      }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50 p-4 relative font-sans">
      
      {/* DASHBOARD HEADER */}
      <div className="flex justify-between items-start mb-4 shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Navigation2 className="text-[#009639]" /> 
                Centro de Control Operativo
            </h1>
            <p className="text-sm text-gray-500 mt-1">
                Monitoreo en tiempo real de flota AMR y personal
                <span className="mx-2">•</span>
                <span className={`inline-flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {isConnected ? 'Sistemas Online' : 'Desconectado'}
                </span>
            </p>
        </div>
        
        {/* GLOBAL METRICS */}
        {telemetry && (
             <div className="flex gap-4">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm min-w-[120px]">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Flota Activa</div>
                    <div className="text-2xl font-bold text-gray-800">
                        {telemetry.amrs.filter(a => a.status !== 'IDLE').length} <span className="text-sm text-gray-400 font-normal">/ {telemetry.amrs.length}</span>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm min-w-[120px]">
                     <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Productividad</div>
                     <div className="text-2xl font-bold text-[#009639]">
                        {telemetry.amrs.reduce((acc, curr) => acc + (curr.deliveryCount || 0), 0)} <span className="text-sm text-gray-400 font-normal">entregas</span>
                     </div>
                </div>
             </div>
        )}
      </div>

      <div className={`flex gap-4 flex-grow h-0 min-h-0 overflow-hidden ${isVertical ? 'flex-col' : 'flex-row'}`} ref={containerRef}>
          
          {/* LEFT PANEL: ROBOT CONTROLS */}
          <div className={`${isVertical ? 'w-full h-40 border-b pb-2' : 'w-64 h-full border-r pr-1'} flex flex-col gap-3 overflow-y-auto shrink-0 transition-all`}>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Control de Flota</div>
              {telemetry ? (
                  <div className={`${isVertical ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'flex flex-col gap-3'}`}>
                    {telemetry.amrs.map(amr => (
                        <RobotControlCard key={amr.id} amr={amr} sendCommand={sendCommand} />
                    ))}
                  </div>
              ) : (
                  <div className="text-gray-400 text-sm italic text-center py-10">Esperando telemetría...</div>
              )}
          </div>

          {/* RIGHT PANEL: HORIZONTAL MAP */}
          <div className={`flex-grow bg-white rounded-2xl border border-gray-200 shadow-sm relative flex flex-col transition-all ${isVertical ? 'overflow-y-auto min-h-[500px]' : 'overflow-hidden'}`}>
                <div className={`absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-gray-100 shadow-sm text-xs font-mono text-gray-500 flex items-center gap-2 ${isVertical ? 'sticky top-4' : ''}`}>
                    <span>LIVE VIEW</span>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
                </div>
                
                <div className={`absolute bottom-4 right-4 z-10 flex gap-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg border border-gray-100 shadow-sm ${isVertical ? 'sticky bottom-4 mx-auto mb-4' : ''}`}>
                    <MapLegend color="bg-[#009639]" label="AMR Activo" />
                    <MapLegend color="bg-[#FFD200]" label="Cargando" />
                    <MapLegend color="bg-blue-500" label="Operario" />
                </div>

                {/* SVG MAP CONTAINER */}
                <div className={`flex-grow flex items-center justify-center bg-dots-pattern ${isVertical ? 'min-h-[800px] p-2' : 'p-4 sm:p-8 h-full'}`}>
                    <svg 
                        viewBox={isVertical ? "0 0 400 800" : "0 0 800 500"} 
                        className={`max-w-full drop-shadow-xl transition-all duration-500 ${isVertical ? 'h-[800px] w-auto' : 'w-full h-full object-contain'}`} 
                        preserveAspectRatio={isVertical ? "xMidYMid slice" : "xMidYMid meet"}
                    >
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                            </pattern>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        
                        {/* Floor Background */}
                        <path d={isVertical ? "M 0,0 h 400 v 800 h -400 z" : "M 50,50 h 700 v 400 h -700 z"} fill="url(#grid)" stroke="#e5e7eb" strokeWidth="2" rx="20" />

                        {/* Reference lines (Highways) */}
                        {HIGHWAYS_X.map((x) => {
                             // Draw lanes without crossing boundaries
                             // Adjust start/end to be strictly within the floor/walls
                             const start = map3DToScreen(x, -70, isVertical);
                             const end = map3DToScreen(x, 70, isVertical);
                             return (
                                <line 
                                    key={`v-${x}`} 
                                    x1={start.cx} y1={start.cy} 
                                    x2={end.cx} y2={end.cy} 
                                    stroke="#fb923c"
                                    strokeWidth="1" 
                                    opacity="0.2"
                                />
                             );
                        })}
                        {CROSSINGS_Z.map((z) => {
                             // Lanes should not hit the side walls (docks are at +/- 40)
                             const start = map3DToScreen(-45, z, isVertical);
                             const end = map3DToScreen(45, z, isVertical);
                             return (
                                <line 
                                    key={`h-${z}`} 
                                    x1={start.cx} y1={start.cy} 
                                    x2={end.cx} y2={end.cy} 
                                    stroke="#fb923c"
                                    strokeWidth="1" 
                                    opacity="0.2" 
                                />
                             );
                        })}

                        {/* --- INFRASTRUCTURE (TRANSFORMED COORDINATES) --- */}
                        
                        {/* Racks */}
                        {RACKS.map((rack) => {
                            const p1 = map3DToScreen(rack.x - 2, rack.zStart, isVertical);
                            const p2 = map3DToScreen(rack.x + 2, rack.zStart + 30, isVertical);
                            
                            const width = Math.abs(p2.cx - p1.cx);
                            const height = Math.abs(p2.cy - p1.cy);
                            
                            return (
                                <g key={rack.id}>
                                    <rect 
                                        x={Math.min(p1.cx, p2.cx)} 
                                        y={Math.min(p1.cy, p2.cy)} 
                                        width={width} 
                                        height={height} 
                                        fill="#fff7ed" 
                                        stroke="#fed7aa" 
                                        strokeWidth="1" 
                                        rx="2" 
                                    />
                                    {/* Rack detail lines */}
                                    { !isVertical ? (
                                        <line 
                                            x1={Math.min(p1.cx, p2.cx)} 
                                            y1={p1.cy + height/2} 
                                            x2={Math.max(p1.cx, p2.cx)} 
                                            y2={p1.cy + height/2} 
                                            stroke="#fed7aa" strokeWidth="1" opacity="0.5" 
                                        />
                                    ) : (
                                        <line 
                                            x1={p1.cx + width/2} 
                                            y1={Math.min(p1.cy, p2.cy)} 
                                            x2={p1.cx + width/2} 
                                            y2={Math.max(p1.cy, p2.cy)} 
                                            stroke="#fed7aa" strokeWidth="1" opacity="0.5" 
                                        />
                                    )}
                                </g>
                            );
                        })}

                        {/* Docks & Despacho Areas */}
                        {DOCK_DATA.map(dock => {
                            const pos = map3DToScreen(dock.x + (dock.x < 0 ? -4 : 4), dock.z, isVertical); 
                            return (
                                <g key={`dock-${dock.id}`}>
                                     {/* Dock Area Marker - Rectangulo orientado segun la pared */}
                                     {/* En vertical: estamos en las paredes laterales (izquierda/derecha), el dock debe ser ancho hacia adentro o fuera? */}
                                     {/* Vamos a usar la misma orientacion que en horizontal pero rotada visualmente si es necesario, 
                                         pero el usuario pide "normal". Si la pared es vertical, el rectangulo suele ser ancho (perpendicular) o alto (paralelo)?
                                         En el 3D los docks son planos en el suelo.
                                         Probemos haciéndolos "cuadrados" o invirtiendo la logica actual que parecia estar rotada.
                                     */}
                                     <rect 
                                        x={pos.cx - 8}
                                        y={pos.cy - 12}
                                        width="16"
                                        height="24"
                                        fill="#eff6ff" 
                                        stroke="#bfdbfe" 
                                        strokeWidth="1" 
                                        rx="4" 
                                    />
                                     <circle cx={pos.cx} cy={pos.cy} r="3" fill="#3b82f6" />
                                     <text 
                                        x={pos.cx} 
                                        y={pos.cy + 20} 
                                        textAnchor="middle" 
                                        fill="#64748b" 
                                        className="uppercase" 
                                        fontSize="6" 
                                        fontWeight="bold"
                                     >
                                         {dock.id <= 4 ? `IN ${dock.id}` : `OUT ${dock.id}`}
                                     </text>
                                </g>
                            );
                        })}

                         {/* DYNAMIC TELEMETRY ELEMENTS */}
                         {telemetry?.amrs.map((amr) => {
                             const pos = map3DToScreen(amr.x, amr.z, isVertical);
                             const isMoving = amr.status !== 'IDLE';
                             const hasCargo = !!amr.cargo;
                             const color = !isMoving ? '#9ca3af' : (hasCargo ? '#f59e0b' : '#009639');

                             return (
                                 <g key={amr.id} style={{ transition: 'transform 0.1s linear', willChange: 'transform' }} transform={`translate(${pos.cx}, ${pos.cy})`}>
                                     {/* Selection/Status Ring */}
                                     <circle r="7" fill={color} opacity="0.2" className="animate-ping" />
                                     <circle r="5" fill={color} stroke="white" strokeWidth="1.5" />
                                     
                                     {/* Direction/Heading Indicator */}
                                     {isMoving && <path d="M 0,-5 L 2,-2 L -2,-2 Z" fill="white" transform="translate(0,-1)" />}

                                     <text y="-8" textAnchor="middle" fill="#4b5563" fontSize="8" fontWeight="bold">R{amr.id}</text>
                                 </g>
                             );
                         })}

                         {telemetry?.player && (() => {
                             const pPos = map3DToScreen(telemetry.player.x, telemetry.player.z, isVertical);
                             return (
                                 <g style={{ transition: 'transform 0.1s linear' }} transform={`translate(${pPos.cx}, ${pPos.cy})`}>
                                     <circle r="6" fill="#3b82f6" stroke="white" strokeWidth="2" filter="url(#glow)" />
                                     <text y="-10" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">TÚ</text>
                                 </g>
                             );
                         })()}

                    </svg>
                </div>
          </div>
      </div>

       {/* Floating Action Button for Chat - REMOVED per user request */}
    </div>
  );
};
