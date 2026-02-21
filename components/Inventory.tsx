
import React, { useEffect } from 'react';

interface InventoryProps {
    hasGoggles: boolean;
    isARActive: boolean;
    toggleAR: () => void;
    selectedSlot: number;
    onSelectSlot: (slot: number) => void;
}

const Inventory: React.FC<InventoryProps> = ({ hasGoggles, isARActive, toggleAR, selectedSlot, onSelectSlot }) => {

    // Handle Scroll for Slot Selection (Listen on window to capture anywhere)
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                // Scroll Down -> Next Slot
                onSelectSlot((selectedSlot + 1) % 4);
            } else {
                // Scroll Up -> Previous Slot
                onSelectSlot((selectedSlot - 1 + 4) % 4);
            }
        };

        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, [selectedSlot, onSelectSlot]);

    return (
        <div className="fixed bottom-6 right-6 flex gap-4 p-4 bg-black/85 backdrop-blur-md rounded-xl select-none pointer-events-auto z-50 border border-gray-600 shadow-2xl">
            {/* Empty Slots 0, 1, 2 */}
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={`relative w-24 h-24 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer
                        ${selectedSlot === i ? 'bg-gray-700 border-2 border-white scale-110 shadow-lg z-10' : 'bg-gray-800/40 border border-gray-700 opacity-60'}
                    `}
                    onClick={() => onSelectSlot(i)}
                >
                    <span className="absolute top-2 left-2 text-gray-500 text-xs font-bold font-mono">{i + 1}</span>
                </div>
            ))}

            {/* AR Goggles Slot (Index 3) */}
            <div
                className={`relative w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300
                    ${selectedSlot === 3 ? 'bg-gray-800 border-2 border-white scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)] z-10' : 'bg-gray-900/90 border border-gray-700 opacity-90'}
                    ${isARActive ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : ''}
                `}
                onClick={() => {
                    onSelectSlot(3);
                    toggleAR();
                }}
                title="Gafas RFID Vision (Click Izquierdo para equipar/desequipar)"
            >
                <span className="absolute top-2 left-2 text-gray-500 text-xs font-bold font-mono">4</span>

                <div className="flex flex-col items-center justify-center w-full h-full p-2">
                    <img
                        src="gafas.png"
                        alt="Gafas AR"
                        className={`w-full h-full object-contain transition-all duration-500 ${isARActive ? 'drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] scale-105' : 'scale-95'}`}
                    />
                </div>

                {/* Equipped Status */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${isARActive ? 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse' : 'bg-gray-600'}`}></div>
            </div>
        </div>
    );
};

export default Inventory;
