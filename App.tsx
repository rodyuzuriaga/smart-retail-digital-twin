import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';
import UIControls from './components/UIControls';
import { MonitorDashboard } from './components/MonitorDashboard';
import { WorldConfig } from './types';
import { INITIAL_WORLD } from './constants';
import { generateWorldData } from './services/geminiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<WorldConfig>(INITIAL_WORLD);
  const [isLoading, setIsLoading] = useState(false);
  const [heldBox, setHeldBox] = useState<string | null>(null);
  
  // Simple Router to show Dashboard in the same app if path is /monitor
  const [showMonitor, setShowMonitor] = useState(window.location.hash === '#monitor');

  useEffect(() => {
    const handlePopState = () => {
        setShowMonitor(window.location.hash === '#monitor');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleGenerate = async (prompt?: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const ideas = ["Lava Obby", "Ice Kingdom", "Desert Temple", "Candy Land", "Neon City", "Toxic Wasteland", "Mystic Forest"];
      const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
      
      const data = await generateWorldData(prompt || randomIdea);
      
      setConfig({
        name: data.name,
        description: data.description,
        groundColor: data.visuals.groundColor,
        skyColor: data.visuals.skyColor,
        gridColor: data.visuals.gridColor,
        fogDensity: data.visuals.fogDensity,
        partColor: data.visuals.partColor
      });
    } catch (error) {
      console.error("Failed to generate world:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading]);


  if (showMonitor) {
    return (
        <div className="w-full h-full bg-gray-100 overflow-auto">
             <MonitorDashboard />
        </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black text-white font-sans overflow-hidden select-none">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene config={config} heldBox={heldBox} setHeldBox={setHeldBox} />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">

        <UIControls 
          config={config} 
          isLoading={isLoading} 
          heldBox={heldBox}
        />
        
      </div>
    </div>
  );
};

export default App;