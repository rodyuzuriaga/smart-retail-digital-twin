
import React, { useState } from 'react';
import { Sidebar } from './MonitorSidebar';
import { Dashboard } from './MonitorOverview';
import { WarehouseMap } from './WarehouseMap';
import { WorkerPanel } from './MonitorWorker';
import { ViewType } from './monitorTypes';
import { Header } from './MonitorHeader';
import { AIChatDrawer } from './AIChatDrawer';

export const MonitorDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <Dashboard />;
      case ViewType.WAREHOUSE_MAP:
        return (
            <div className="h-full w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <WarehouseMap />
            </div>
        );
      case ViewType.WORKER_PANEL:
        return <WorkerPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden text-gray-800">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header activeView={activeView} onOpenChat={() => setIsAIChatOpen(true)} />
        <main className={`flex-1 relative ${activeView === ViewType.WAREHOUSE_MAP ? 'p-0 overflow-hidden' : 'p-10 overflow-y-auto'}`}>
          <div className={`${activeView === ViewType.WAREHOUSE_MAP ? 'h-full w-full' : 'max-w-7xl mx-auto'}`}>
            {renderView()}
          </div>
        </main>

        <AIChatDrawer isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      </div>
    </div>
  );
};


