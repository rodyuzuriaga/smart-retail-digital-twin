
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { ARView } from './views/ARView';
import { WarehouseMap } from './views/WarehouseMap';
import { WorkerPanel } from './views/WorkerPanel';
import { DigitalTwin } from './views/DigitalTwin';
import { AIStudio } from './views/AIStudio';
import { ViewType } from './types';
import { Header } from './components/Header';
import { AIChatDrawer } from './components/AIChatDrawer';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <Dashboard />;
      case ViewType.AI_STUDIO:
        return <AIStudio />;
      case ViewType.AR_VIEW:
        return <ARView />;
      case ViewType.WAREHOUSE_MAP:
        return <WarehouseMap />;
      case ViewType.WORKER_PANEL:
        return <WorkerPanel />;
      case ViewType.DIGITAL_TWIN:
        return <DigitalTwin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden text-gray-800">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header activeView={activeView} />
        <main className="flex-1 overflow-y-auto p-10 relative">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>

        {/* Floating AI Button - Branded Tailoy */}
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="fixed bottom-10 right-10 w-16 h-16 bg-[#009639] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#007b2e] hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white"
        >
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFD200] rounded-full border-2 border-white shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#009639] rounded-full animate-pulse"></div>
          </div>
        </button>

        <AIChatDrawer isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      </div>
    </div>
  );
};

export default App;
