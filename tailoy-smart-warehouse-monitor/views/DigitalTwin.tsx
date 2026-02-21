
import React, { useState } from 'react';
import { Binary, Play, RefreshCw, BarChart2, Users, Layers } from 'lucide-react';
import gemeloImg from '../gemelo.png';

export const DigitalTwin: React.FC = () => {
  const [scenario, setScenario] = useState<'normal' | 'campaign'>('normal');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 branded-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Binary size={24} className="text-[#009639]" /> Modelado de Escenarios
          </h3>
          <p className="text-xs text-gray-400 mt-1">Simulación predictiva del flujo logístico Tailoy</p>
        </div>

        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setScenario('normal')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${scenario === 'normal' ? 'bg-[#009639] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Día Normal
          </button>
          <button
            onClick={() => setScenario('campaign')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${scenario === 'campaign' ? 'bg-[#FFD200] text-gray-800 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Campaña Navideña
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 h-[400px] relative overflow-hidden group shadow-lg">
            {/* Gemelo Digital 3D Visualizer */}
            <img
              src={gemeloImg}
              alt="Gemelo Digital - Vista 3D del Almacén"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

            {/* Heatmap Overlay Simulation */}
            <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${scenario === 'campaign' ? 'opacity-60' : 'opacity-20'}`}>
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500 blur-[80px] rounded-full"></div>
              <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-amber-500 blur-[100px] rounded-full"></div>
            </div>

            <div className="absolute top-6 left-6 space-y-2">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-mono text-[#009639] shadow-sm">
                REF_MODE: SIM_ACTIVE_V4
              </div>
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-mono text-[#009639] shadow-sm">
                NODES_TRACKED: 1,452
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-lg">
                <div className="flex gap-4">
                  <div className="text-center px-4 border-r border-gray-200">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Eficiencia</p>
                    <p className={`text-xl font-black ${scenario === 'normal' ? 'text-[#009639]' : 'text-orange-500'}`}>
                      {scenario === 'normal' ? '96%' : '82%'}
                    </p>
                  </div>
                  <div className="text-center px-4 border-r border-gray-200">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Cuellos Botella</p>
                    <p className="text-xl font-black text-gray-800">
                      {scenario === 'normal' ? '0' : '4'}
                    </p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Tiempo Ciclo</p>
                    <p className="text-xl font-black text-gray-800">
                      {scenario === 'normal' ? '42m' : '1h 15m'}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-[#009639] hover:bg-[#007b2e] px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg text-white">
                  <RefreshCw size={14} /> RECALCULAR
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <TwinStatCard
              icon={<Users size={18} className="text-[#009639]" />}
              label="Densidad de Operarios"
              value={scenario === 'normal' ? 'Mediana' : 'Crítica'}
              trend={scenario === 'normal' ? 'stable' : 'up'}
            />
            <TwinStatCard
              icon={<Layers size={18} className="text-[#FFD200]" />}
              label="Saturación de Estanterías"
              value={scenario === 'normal' ? '65%' : '94%'}
              trend={scenario === 'normal' ? 'stable' : 'up'}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 branded-shadow">
            <h4 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-[#009639]" /> Predicción IA (24h)
            </h4>
            <div className="space-y-6">
              <PredictionMetric
                label="Demanda Omnicanal"
                value={scenario === 'normal' ? '+12%' : '+245%'}
                type={scenario === 'normal' ? 'info' : 'warning'}
              />
              <PredictionMetric
                label="Capacidad de Picking"
                value={scenario === 'normal' ? '98%' : '72%'}
                type={scenario === 'normal' ? 'success' : 'danger'}
              />
              <PredictionMetric
                label="Riesgo de Errores"
                value={scenario === 'normal' ? '0.2%' : '4.5%'}
                type={scenario === 'normal' ? 'success' : 'warning'}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 branded-shadow">
            <h4 className="text-sm font-bold text-gray-500 mb-4">Acciones Sugeridas</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-[#009639] mt-1.5 shrink-0"></div>
                Activar 3 AMRs adicionales del bloque B.
              </li>
              <li className="flex gap-3 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-[#009639] mt-1.5 shrink-0"></div>
                Redirigir flujos de picking al ala sur.
              </li>
              {scenario === 'campaign' && (
                <li className="flex gap-3 text-xs text-red-500 font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                  ALERTA: Aumentar personal en zona de despacho.
                </li>
              )}
            </ul>
          </div>

          <button className="w-full py-4 bg-gradient-to-r from-[#009639] to-[#007b2e] hover:from-[#007b2e] hover:to-[#006020] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#009639]/20 transition-all hover:scale-[1.02] active:scale-95">
            <Play size={18} /> INICIAR SIMULACIÓN COMPLETA
          </button>
        </div>
      </div>
    </div>
  );
};

const TwinStatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, trend: 'up' | 'stable' | 'down' }> = ({ icon, label, value, trend }) => (
  <div className="bg-white border border-gray-100 p-5 rounded-2xl branded-shadow">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <span className={`text-[10px] font-bold ${trend === 'up' ? 'text-red-500' : 'text-[#009639]'}`}>
        {trend === 'up' ? '↑ ALZA' : '• ESTABLE'}
      </span>
    </div>
    <p className="text-[10px] text-gray-400 font-bold uppercase">{label}</p>
    <p className="text-xl font-black text-gray-800 mt-1">{value}</p>
  </div>
);

const PredictionMetric: React.FC<{ label: string, value: string, type: 'info' | 'warning' | 'success' | 'danger' }> = ({ label, value, type }) => {
  const colors = {
    info: 'bg-blue-500',
    warning: 'bg-orange-500',
    success: 'bg-[#009639]',
    danger: 'bg-red-500',
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <span className={`text-xs font-bold ${type === 'danger' ? 'text-red-500' : type === 'warning' ? 'text-orange-500' : 'text-gray-800'}`}>
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${colors[type]}`} style={{ width: value.replace(/[^\d.]/g, '') + '%' }}></div>
      </div>
    </div>
  );
};
