
import React, { Suspense, useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import World from './Planet';
import { PRODUCT_CATALOG, ProductInfo } from '../productCatalog';
import Inventory from './Inventory';
import { WorldConfig } from '../types';
import * as THREE from 'three';

interface SceneProps {
    config: WorldConfig;
    heldBox: string | null;
    setHeldBox: (c: string | null) => void;
}

const WORLD_LIMIT_X = 65;
const WORLD_LIMIT_Z = 130;

// AR VISOR OVERLAY (HUD)
const ARVisor = ({ isActive, targetProduct }: { isActive: boolean, targetProduct: ProductInfo | null }) => {
    if (!isActive) return null;
    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 animate-in fade-in duration-300">
            {/* Top Center */}
            <div className="flex justify-center w-full">
                <div className="flex flex-col items-center mt-2">
                    <span className="bg-orange-900/90 backdrop-blur-lg px-6 py-2 rounded-full text-sm tracking-widest border border-orange-500/50 text-white font-mono shadow-[0_0_20px_#f97316]">Sistema AR Tai Loy</span>
                    <span className="text-[11px] mt-2 text-orange-300/80 font-mono animate-pulse bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                        {targetProduct ? `NAVIGANDO A: ${targetProduct.name.toUpperCase()}` : 'ESCANEO RFID ACTIVO'}
                    </span>
                </div>
            </div>

            {/* Center Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70">
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="2" fill="#f97316" />
                    <path d="M50 20V30 M50 70V80 M20 50H30 M70 50H80" stroke="#f97316" strokeWidth="1.5" />
                </svg>
            </div>

            {/* Bottom Center */}
            <div className="flex justify-center items-end w-full">
                <div className="text-sm text-center text-orange-300/80 font-mono bg-black/50 backdrop-blur-lg p-4 rounded-2xl border border-orange-500/30 shadow-[0_0_15px_#f97316]">
                    <p>AR MODE: ACTIVE</p>
                    <p>PRECISION: ±5.2cm</p>
                    <p>BATTERY: 94%</p>
                </div>
            </div>
        </div>
    );
};

const PlayerController = ({ onEquip, onUnequip, isARActive, setSelectedIndex, setSelectedProduct, selectedIndex }: { onEquip: () => void, onUnequip: () => void, isARActive: boolean, setSelectedIndex: (i: number) => void, setSelectedProduct: (p: ProductInfo | null) => void, selectedIndex: number }) => {
    const { camera } = useThree();
    const moveState = useRef({
        forward: false, backward: false, left: false, right: false, shift: false, space: false
    });
    const velocityY = useRef(0);
    const isFlying = useRef(false);
    const lastSpacePress = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isARActive) {
                switch (e.code) {
                    case 'ArrowUp':
                        e.preventDefault();
                        setSelectedIndex(prev => Math.max(0, prev - 1));
                        return;
                    case 'ArrowDown':
                        e.preventDefault();
                        setSelectedIndex(prev => Math.min(PRODUCT_CATALOG.length - 1, prev + 1));
                        return;
                    case 'ArrowLeft':
                        e.preventDefault();
                        setSelectedProduct(null);
                        setSelectedIndex(0);
                        return;
                    case 'ArrowRight':
                        e.preventDefault();
                        if (PRODUCT_CATALOG[selectedIndex]) {
                            setSelectedProduct(PRODUCT_CATALOG[selectedIndex]);
                        }
                        return;
                }
                // Si no es una flecha, continúa con el manejo normal
            }
            switch (e.code) {
                case 'KeyW': moveState.current.forward = true; break;
                case 'KeyS': moveState.current.backward = true; break;
                case 'KeyA': moveState.current.left = true; break;
                case 'KeyD': moveState.current.right = true; break;
                case 'ShiftLeft': moveState.current.shift = true; break;
                case 'Space':
                    if (!moveState.current.space) {
                        const now = Date.now();
                        if (now - lastSpacePress.current < 300) {
                            isFlying.current = !isFlying.current;
                            velocityY.current = 0;
                        }
                        lastSpacePress.current = now;
                    }
                    moveState.current.space = true;
                    break;
                case 'Escape':
                    onUnequip();
                    break;
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW': moveState.current.forward = false; break;
                case 'KeyS': moveState.current.backward = false; break;
                case 'KeyA': moveState.current.left = false; break;
                case 'KeyD': moveState.current.right = false; break;
                case 'ShiftLeft': moveState.current.shift = false; break;
                case 'Space': moveState.current.space = false; break;
            }
        };

        // Left-click to equip goggles, Right-click to remove
        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            if (e.button === 0) { // Left Click - equip
                onEquip();
            } else if (e.button === 2) { // Right Click - unequip
                e.preventDefault(); // Prevent context menu
                onUnequip();
            }
        };

        // Prevent context menu on right click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        window.addEventListener('keydown', handleKeyDown, { passive: false });
        window.addEventListener('keyup', handleKeyUp, { passive: false });
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [camera, onEquip, onUnequip, isARActive, setSelectedIndex, setSelectedProduct, selectedIndex]);

    useFrame((_, rawDelta) => {
        const delta = Math.min(rawDelta, 0.1);
        const baseSpeed = 12;
        const speed = (moveState.current.shift ? baseSpeed * 2.5 : baseSpeed) * delta;

        const direction = new THREE.Vector3();
        const frontVector = new THREE.Vector3(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward));
        const sideVector = new THREE.Vector3(Number(moveState.current.left) - Number(moveState.current.right), 0, 0);

        direction
            .subVectors(frontVector, sideVector);

        // Only normalize and apply movement if there's actual movement
        if (direction.lengthSq() > 0.001) {
            direction
                .normalize()
                .multiplyScalar(speed)
                .applyEuler(camera.rotation);

            const nextX = camera.position.x + direction.x;
            if (nextX < WORLD_LIMIT_X && nextX > -WORLD_LIMIT_X) camera.position.x = nextX;
            const nextZ = camera.position.z + direction.z;
            if (nextZ < WORLD_LIMIT_Z && nextZ > -WORLD_LIMIT_Z) camera.position.z = nextZ;
        }

        const GROUND_Y = 3.5;

        if (isFlying.current) {
            if (moveState.current.space) {
                camera.position.y += 15 * delta;
            } else if (moveState.current.shift) {
                camera.position.y -= 15 * delta;
            }
            if (camera.position.y < GROUND_Y) camera.position.y = GROUND_Y;
            velocityY.current = 0;
        } else {
            if (moveState.current.space && camera.position.y <= GROUND_Y + 0.1) {
                velocityY.current = 15;
            }
            velocityY.current -= 45 * delta;
            camera.position.y += velocityY.current * delta;

            if (camera.position.y < GROUND_Y) {
                camera.position.y = GROUND_Y;
                velocityY.current = 0;
            }
        }
    });

    return null;
};

const Scene: React.FC<SceneProps> = ({ config, heldBox, setHeldBox }) => {
    const [isARActive, setIsARActive] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const cameraConfig = useMemo(() => ({ fov: 75, position: [0, 3.5, 50] as [number, number, number] }), []);

    // Left-click equips goggles ONLY if slot 3 is selected and not already active
    const handleEquip = useCallback(() => {
        if (selectedSlot === 3 && !isARActive) {
            setIsARActive(true); // Only activate, don't toggle
        }
    }, [selectedSlot, isARActive]);

    const handleUnequip = useCallback(() => {
        setIsARActive(false);
        setSelectedProduct(null);
    }, []);

    const handleSelectProduct = useCallback((p: ProductInfo) => {
        setSelectedProduct(prev => prev?.name === p.name ? null : p);
    }, []);

    return (
        <div className="relative w-full h-full">
            <Canvas
                className="w-full h-full bg-black outline-none focus:outline-none"
                camera={cameraConfig}
                dpr={[1, 1.5]}
                gl={{ antialias: true, powerPreference: "high-performance" }}
                shadows={false}
            >
                <color attach="background" args={[config.skyColor]} />
                <fog attach="fog" args={[config.skyColor, 10, 150]} />

                <PlayerController onEquip={handleEquip} onUnequip={handleUnequip} isARActive={isARActive} setSelectedIndex={setSelectedIndex} setSelectedProduct={setSelectedProduct} selectedIndex={selectedIndex} />
                <PointerLockControls />

                <ambientLight intensity={0.6} />
                {/* @ts-ignore */}
                <hemisphereLight args={["#ffffff", config.groundColor, 0.6]} />
                <directionalLight position={[50, 80, 50]} intensity={0.8} color="#ffffff" />

                <Suspense fallback={null}>
                    <World
                        config={config}
                        heldBox={heldBox}
                        setHeldBox={setHeldBox}
                        isARActive={isARActive}
                        selectedProduct={selectedProduct}
                    />
                </Suspense>
            </Canvas>

            {/* AR HUD */}
            <ARVisor isActive={isARActive} targetProduct={selectedProduct} />

            {/* AR Product Table (only when AR is ON) */}
            {isARActive && (
                <div className="absolute top-20 left-4 w-80 max-h-[75vh] bg-black/90 rounded-2xl border border-orange-500/20 z-40 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-orange-500/10 bg-orange-900/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]"></div>
                            <span className="text-white text-sm font-mono font-bold tracking-wider">Productos Disponibles Tai Loy</span>
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-3 space-y-1">
                        {PRODUCT_CATALOG.map((p, i) => (
                            <div
                                key={p.name}
                                className={`px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-sm font-mono flex justify-between items-center backdrop-blur-sm border
                  ${selectedIndex === i
                    ? 'bg-orange-500/20 text-white border-orange-500/40 shadow-[0_0_10px_#f97316] scale-[1.02]'
                    : 'text-white/80 hover:bg-orange-500/10 hover:text-white border-transparent hover:border-orange-500/20'
                  }
                `}
                            >
                                <span className="font-medium">{p.name}</span>
                                <span className="text-xs text-orange-300/70 bg-black/20 px-2 py-1 rounded-lg">S/.{p.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    {selectedProduct && (
                        <div className="border-t border-orange-500/10 p-4 bg-orange-900/10 backdrop-blur-sm">
                            <div className="text-white text-sm font-bold mb-2">{selectedProduct.name}</div>
                            <div className="text-orange-300/70 text-xs font-mono mb-2 bg-black/20 px-3 py-2 rounded-lg">
                                SKU: {selectedProduct.sku} | Stock: {selectedProduct.stock}
                            </div>
                            <div className="text-cyan-300 text-xs font-mono animate-pulse bg-cyan-500/10 px-3 py-2 rounded-lg border border-cyan-500/20">
                                ▶ NAVIGANDO A UBICACIÓN...
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Inventory UI */}
            <Inventory
                hasGoggles={true}
                isARActive={isARActive}
                toggleAR={() => setIsARActive(true)}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
            />

            {/* Notification (Top Right) */}
            {heldBox && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-green-400 px-6 py-3 rounded-lg border border-green-500/30 flex items-center gap-3 pointer-events-none z-50 shadow-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                    <span className="font-mono font-bold tracking-wide">ITEM CARGADO</span>
                    <div className="w-6 h-6 rounded border border-white/20" style={{ background: heldBox }}></div>
                </div>
            )}
        </div>
    );
};

export default Scene;
