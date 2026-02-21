
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Package, Truck, Activity, AlertTriangle, Smartphone, ShoppingBag } from 'lucide-react';

const data = [
  { name: '08:00', val: 40 },
  { name: '10:00', val: 72 },
  { name: '12:00', val: 95 },
  { name: '14:00', val: 88 },
  { name: '16:00', val: 65 },
  { name: '18:00', val: 42 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Inventario RFID" value="24,502" sub="99.8% Precisión" icon={<Package className="text-[#009639]" />} />
        <StatCard label="Picking Activo" value="156" sub="42 en cola" icon={<ShoppingBag className="text-[#FFD200]" />} />
        <StatCard label="Saturación" value="84%" sub="Turno Mañana" icon={<Activity className="text-blue-500" />} />
        <StatCard label="Alertas de Stock" value="12" sub="SKUs críticos" icon={<AlertTriangle className="text-red-500" />} warning />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 branded-shadow">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Productividad de Almacén</h3>
              <p className="text-xs text-gray-400 mt-1">Monitoreo de carga operativa hoy</p>
            </div>
            <div className="flex items-center gap-4">
               <LegendItem color="bg-[#009639]" label="Picking Real" />
               <LegendItem color="bg-gray-100" label="Capacidad" />
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="tailoyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009639" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#009639" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" stroke="#999" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#999" fontSize={10} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#009639', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="val" stroke="#009639" strokeWidth={3} fillOpacity={1} fill="url(#tailoyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col branded-shadow">
          <h3 className="text-sm font-bold text-gray-800 mb-8">Salud Omnicanal</h3>
          <div className="space-y-6 flex-1">
            <MetricItem label="Confiabilidad Stock" value="99.9%" icon={<div className="w-1.5 h-1.5 rounded-full bg-[#009639]" />} />
            <MetricItem label="Cumplimiento Despacho" value="98.5%" icon={<div className="w-1.5 h-1.5 rounded-full bg-[#FFD200]" />} />
            <MetricItem label="NPS Logístico" value="4.8/5" icon={<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />} />
          </div>
          <div className="mt-8 pt-6 border-t border-gray-50">
            <button className="w-full py-3 bg-[#FFD200] text-gray-800 text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-[#ffe042] transition-colors">
              Ver Reporte Detallado
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 branded-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-800">Trazabilidad RFID</h3>
            <span className="text-[10px] font-bold text-[#009639] animate-pulse uppercase tracking-widest bg-[#009639]/5 px-2 py-1 rounded">Live Stream</span>
          </div>
          <div className="space-y-4">
            <RFIDLog time="15:20" id="SKU-8821" action="Recepción" zone="Muelle 1" status="OK" />
            <RFIDLog time="15:18" id="SKU-1022" action="Picking" zone="Pasillo B" status="ACTIVE" active />
            <RFIDLog time="15:15" id="SKU-4402" action="Despacho" zone="Muelle 3" status="OK" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 p-8 branded-shadow">
          <h3 className="text-sm font-bold text-gray-800 mb-6">Flotas AMR</h3>
          <div className="grid grid-cols-2 gap-4">
            <AMRCard id="AMR-01" bat={92} state="Activo" />
            <AMRCard id="AMR-02" bat={15} state="Cargando" warn />
            <AMRCard id="AMR-03" bat={75} state="Idle" />
            <AMRCard id="AMR-04" bat={44} state="Activo" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, sub: string, icon: React.ReactNode, warning?: boolean }> = ({ label, value, sub, icon, warning }) => (
  <div className="bg-white border border-gray-100 p-6 rounded-2xl branded-shadow group hover:border-[#009639]/30 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">{icon}</div>
      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Tailoy 2025</span>
    </div>
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{label}</p>
    <h4 className={`text-2xl font-black ${warning ? 'text-red-600' : 'text-gray-800'}`}>{value}</h4>
    <p className="text-[10px] text-gray-500 mt-2 font-medium">{sub}</p>
  </div>
);

const LegendItem: React.FC<{ color: string, label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{label}</span>
  </div>
);

const MetricItem: React.FC<{ label: string, value: string, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-3">
      {icon}
      <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">{label}</p>
    </div>
    <p className="text-lg font-black text-gray-800">{value}</p>
  </div>
);

const RFIDLog: React.FC<{ time: string, id: string, action: string, zone: string, status: string, active?: boolean }> = ({ time, id, action, zone, status, active }) => (
  <div className={`flex items-center justify-between text-[11px] p-4 rounded-xl border ${active ? 'bg-[#009639]/5 border-[#009639]/20' : 'bg-gray-50 border-gray-100'}`}>
    <div className="flex gap-4 items-center">
      <span className="font-mono text-gray-400">{time}</span>
      <span className="font-bold text-gray-800">{id}</span>
    </div>
    <span className={`font-bold uppercase tracking-tighter ${active ? 'text-[#009639]' : 'text-gray-500'}`}>{action}</span>
    <span className="text-gray-400 font-medium">{zone}</span>
    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-[#009639] text-white' : 'bg-gray-200 text-gray-500'}`}>{status}</span>
  </div>
);

const AMRCard: React.FC<{ id: string, bat: number, state: string, warn?: boolean }> = ({ id, bat, state, warn }) => (
  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
    <div className="flex justify-between items-center mb-3">
      <span className="text-[11px] font-bold text-gray-800">{id}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${warn ? 'bg-red-500 animate-pulse' : 'bg-[#009639]'}`}></div>
    </div>
    <div className="flex items-center gap-2 mb-2">
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${warn ? 'bg-red-500' : 'bg-[#009639]'}`} style={{ width: `${bat}%` }}></div>
      </div>
      <span className="text-[9px] font-bold text-gray-400">{bat}%</span>
    </div>
    <p className="text-[9px] font-black text-gray-400 uppercase text-right tracking-widest">{state}</p>
  </div>
);
