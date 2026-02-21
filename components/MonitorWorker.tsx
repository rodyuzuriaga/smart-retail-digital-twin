
import React from 'react';
import { User, Heart, ClipboardCheck, Dumbbell, ShieldAlert, Thermometer } from 'lucide-react';

export const WorkerPanel: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Worker Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 branded-shadow flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#009639] to-[#007b2e] flex items-center justify-center text-white shadow-lg shadow-[#009639]/30">
            <User size={48} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#FFD200] p-1.5 rounded-full border-4 border-white shadow-lg">
            <ClipboardCheck size={16} className="text-gray-800" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">Bienvenido, Juan Pérez</h2>
          <p className="text-gray-400 font-medium">Operario Senior de Almacén - Turno Mañana</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <HealthBadge icon={<Heart size={14} />} label="Salud: Estable" color="text-[#009639] bg-[#009639]/10 border-[#009639]/20" />
            <HealthBadge icon={<ShieldAlert size={14} />} label="EPP: Verificado" color="text-blue-600 bg-blue-600/10 border-blue-600/20" />
            <HealthBadge icon={<Thermometer size={14} />} label="Temp: 36.5°C" color="text-gray-500 bg-gray-100 border-gray-200" />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center w-full md:w-auto">
          <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Rendimiento Hoy</p>
          <p className="text-3xl font-black text-[#009639]">94%</p>
          <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-2 mx-auto overflow-hidden">
            <div className="h-full bg-[#009639]" style={{ width: '94%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Assistance / Industry 5.0 Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 branded-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-gray-800">
              <Dumbbell className="text-[#009639]" size={20} /> Asistente de Bienestar
            </h3>
            <span className="text-[10px] bg-green-50 text-[#009639] px-2 py-1 rounded font-bold">RUTINA DIARIA</span>
          </div>

          <div className="space-y-4">
            <RoutineTask
              title="Calentamiento Pre-Turno"
              time="5 min"
              desc="Movilidad articular y estiramiento de lumbar"
              completed={true}
            />
            <RoutineTask
              title="Pausa Activa"
              time="10 min"
              desc="Ejercicios de relajación cervical recomendados"
              completed={false}
              active={true}
            />
            <RoutineTask
              title="Revisión de Postura"
              time="Continuo"
              desc="Carga de bultos mayores a 15kg"
              completed={false}
            />
          </div>

          <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-800">Tip de Ergonomía</p>
              <p className="text-[11px] text-blue-600/80 mt-1">Usa siempre las rodillas para levantar cajas pesadas. El sistema AR te marcará el centro de gravedad óptimo.</p>
            </div>
          </div>
        </div>

        {/* Current Tasks Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 branded-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-gray-800">
              <ClipboardCheck className="text-[#FFD200]" size={20} /> Tareas Asignadas
            </h3>
            <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-1 rounded font-bold">HOY</span>
          </div>

          <div className="space-y-4">
            <AssignmentItem
              id="JOB-102"
              task="Picking Campaña Escolar"
              priority="Alta"
              progress={75}
            />
            <AssignmentItem
              id="JOB-105"
              task="Recepción Lote Juguetería"
              priority="Media"
              progress={0}
            />
            <AssignmentItem
              id="JOB-108"
              task="Conteo Ciclo RFID Pasillo 2"
              priority="Baja"
              progress={0}
            />
          </div>

          <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-xl transition-colors border border-gray-200">
            SOLICITAR APOYO AMR
          </button>
        </div>
      </div>
    </div>
  );
};

const HealthBadge: React.FC<{ icon: React.ReactNode, label: string, color: string }> = ({ icon, label, color }) => (
  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium ${color}`}>
    {icon} {label}
  </div>
);

const RoutineTask: React.FC<{ title: string, time: string, desc: string, completed: boolean, active?: boolean }> = ({ title, time, desc, completed, active }) => (
  <div className={`p-4 rounded-xl border transition-all ${active ? 'border-[#009639] bg-green-50 ring-1 ring-[#009639]/20' :
      completed ? 'border-gray-100 bg-gray-50' : 'border-gray-100'
    }`}>
    <div className="flex items-center justify-between mb-1">
      <p className={`text-xs font-bold ${active ? 'text-[#009639]' : completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {title}
      </p>
      <span className="text-[10px] text-gray-400 font-mono">{time}</span>
    </div>
    <p className="text-[10px] text-gray-500">{desc}</p>
    {active && (
      <button className="mt-3 w-full py-1.5 bg-[#009639] text-white text-[10px] font-bold rounded-lg shadow-lg shadow-[#009639]/20">
        INICIAR AHORA
      </button>
    )}
  </div>
);

const AssignmentItem: React.FC<{ id: string, task: string, priority: string, progress: number }> = ({ id, task, priority, progress }) => (
  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-[#009639]/30 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[9px] font-mono text-gray-400">{id}</span>
      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${priority === 'Alta' ? 'bg-red-50 text-red-500' : 'bg-gray-200 text-gray-500'
        }`}>
        {priority}
      </span>
    </div>
    <p className="text-xs font-bold text-gray-700 mb-3">{task}</p>
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#009639]" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="text-[10px] font-mono text-gray-400">{progress}%</span>
    </div>
  </div>
);
