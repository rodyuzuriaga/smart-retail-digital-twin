
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Plane, Grid, Box, Cylinder, Html, Text, Sphere, Line, useTexture } from '@react-three/drei';
import { WorldConfig } from '../types';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { PRODUCT_CATALOG, ProductInfo } from '../productCatalog';

// =====================================================
// === PRODUCT CATALOG MOVED TO ../productCatalog.ts ===
// =====================================================

interface WorldProps {
    config: WorldConfig;
    heldBox: string | null;
    setHeldBox: (color: string | null) => void;
    isARActive: boolean;
    selectedProduct: ProductInfo | null;
}

// =====================================================
// === CONFIGURACIÓN ===================================
// =====================================================

const TRACK_VERTICAL_LINES = [-30, -22, -14, -6, 6, 14, 22, 30];
const TRACK_HORIZONTAL_LINES = [-55, -15, 25, 65];
const RACK_SECTION_LENGTH = 30;
const RACK_X_POSITIONS = [-26, -18, -10, 10, 18, 26];

const RACK_SECTIONS = [
    { zStart: -50 },
    { zStart: -10 },
    { zStart: 30 },
];

const HIGHWAYS_X = TRACK_VERTICAL_LINES;
const CROSSINGS_Z = TRACK_HORIZONTAL_LINES;
const DOCK_Z = [-55, -35, -15, 25, 45];

const COLOR_TRACK = '#facc15';
const COLOR_RACK = '#F97316';
const COLOR_RACK_POLE = '#000000';
const COLOR_ROBOT_CHASSIS = '#facc15';
const BOX_COLORS = ['#e6ccb2', '#ede0d4', '#ddb892', '#d6c0b0'];

const DOCK_DATA = [
    { id: 1, x: -40, z: -55, side: 'left' },
    { id: 2, x: -40, z: -15, side: 'left' },
    { id: 3, x: -40, z: 25, side: 'left' },
    { id: 4, x: -40, z: 65, side: 'left' },
    { id: 5, x: 40, z: -55, side: 'right' },
    { id: 6, x: 40, z: -15, side: 'right' },
    { id: 7, x: 40, z: 25, side: 'right' },
    { id: 8, x: 40, z: 65, side: 'right' },
];

const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// --- SUB-COMPONENT: TAI LOY LOGO ---
const TaiLoyLogo = React.memo(() => {
    const [texture, setTexture] = React.useState<THREE.Texture | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(
            '/tailoy.jpeg',
            (loadedTexture) => {
                // Configure texture to show the full image without repetition
                loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
                loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                loadedTexture.repeat.set(1, 1);
                loadedTexture.colorSpace = THREE.SRGBColorSpace;
                loadedTexture.needsUpdate = true;
                setTexture(loadedTexture);
            },
            undefined, // Progress callback removed
            (err: any) => {
                console.error('Error loading texture:', err);
                setError(err.message || 'Unknown error');
            }
        );
    }, []);

    if (error) {
        return (
            <mesh position={[0, 25, -78.5]} rotation={[0, 0, 0]}>
                <planeGeometry args={[25.7, 25]} />
                <meshBasicMaterial color="red" />
            </mesh>
        );
    }

    if (!texture) {
        return (
            <mesh position={[0, 25, -78.5]} rotation={[0, 0, 0]}>
                <planeGeometry args={[25.7, 25]} />
                <meshBasicMaterial color="yellow" />
            </mesh>
        );
    }

    // Aspect ratio: 1740/1604 ≈ 1.084, so width should be 1.084 * height
    const height = 25;
    const width = height * (1740 / 1604);
    return (
        <mesh position={[0, 25, -78.5]} rotation={[0, 0, 0]}>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
});

// --- SUB-COMPONENT: TRUCK ---
const Truck = React.memo(({ position, rotation, cargoList }: { position: [number, number, number], rotation: [number, number, number], cargoList: string[] }) => {
    const truckColor = "#cbd5e1";
    const containerColor = "#94a3b8";
    return (
        <group position={position} rotation={rotation}>
            <group position={[0, 3, 9]}>
                <Box args={[5.8, 5, 4]} position={[0, 0, 0]}><meshStandardMaterial color={truckColor} /></Box>
                <Box args={[5.6, 2, 2]} position={[0, -2, 2]}><meshStandardMaterial color="#334155" /></Box>
                <Box args={[5.4, 2.5, 0.1]} position={[0, 1, 2.05]}><meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} /></Box>
                <Box args={[0.5, 2, 0.1]} position={[2.5, 0, 2.1]}><meshBasicMaterial color="#fbbf24" /></Box>
                <Box args={[0.5, 2, 0.1]} position={[-2.5, 0, 2.1]}><meshBasicMaterial color="#fbbf24" /></Box>
            </group>
            <group position={[0, 0, -1]}>
                <Box args={[6.2, 0.5, 14]} position={[0, 0.5, 0]}><meshStandardMaterial color="#475569" /></Box>
                <Box args={[6.2, 0.2, 14]} position={[0, 7.5, 0]}><meshStandardMaterial color={containerColor} /></Box>
                <Box args={[0.2, 7, 14]} position={[-3.1, 4, 0]}><meshStandardMaterial color={containerColor} /></Box>
                <Box args={[0.2, 7, 14]} position={[3.1, 4, 0]}><meshStandardMaterial color={containerColor} /></Box>
                <Box args={[6.4, 7.2, 0.2]} position={[0, 4, 7]}><meshStandardMaterial color={containerColor} /></Box>
            </group>
            {[[-2.8, 1, 7], [2.8, 1, 7], [-2.8, 1, 1], [2.8, 1, 1], [-2.8, 1, -5], [2.8, 1, -5]].map((pos, i) => (
                <group key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
                    <Cylinder args={[1, 1, 1, 8]}><meshStandardMaterial color="#0f172a" /></Cylinder>
                    <Cylinder args={[0.5, 0.5, 1.05, 6]}><meshStandardMaterial color="#94a3b8" /></Cylinder>
                </group>
            ))}
            <group position={[0, 2.2, -7]}>
                {cargoList.map((color, i) => {
                    const row = Math.floor(i / 2) % 6; const col = i % 2; const stack = Math.floor(i / 12);
                    return <Box key={i} position={[col * 2.5 - 1.25, stack * 1.5, row * 2]} args={[2, 1.4, 1.8]}><meshLambertMaterial color={color} /></Box>;
                })}
            </group>
        </group>
    );
});


// Definir nodos fuera de la función para evitar recrearlos en cada frame
const NODES: [number, number][] = [];
TRACK_VERTICAL_LINES.forEach(x => {
    TRACK_HORIZONTAL_LINES.forEach(z => {
        NODES.push([x, z]);
    });
});

// Cache simple para evitar busquedas repetitivas
const getPathWaypoints = (startX: number, startZ: number, targetX: number, targetZ: number) => {
    
    // Función para encontrar el nodo más cercano
    const findClosestNode = (px: number, pz: number) => {
        let closest = NODES[0];
        let minDist = Infinity;
        
        for (let i = 0; i < NODES.length; i++) {
            const node = NODES[i];
            const dx = Math.abs(node[0] - px);
            const dz = Math.abs(node[1] - pz);
            const dist = dx*dx + dz*dz; // squared dist is enough for comparison
            if (dist < minDist) {
                minDist = dist;
                closest = node;
            }
        }
        return closest;
    };

    const startNode = findClosestNode(startX, startZ);
    const goalNode = findClosestNode(targetX, targetZ);
    
    if (startNode === goalNode) {
        return [startNode];
    }
    
    // Si los nodos son los mismos que la última vez (y se implementara caché de path), retornamos caché.
    // Por ahora, solo optimizamos la creación de arrays.

    // A* implementation
    const openSet: [number, number][] = [startNode];
    const cameFrom: Map<string, [number, number]> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();

    const key = (n: [number, number]) => `${n[0]},${n[1]}`;

    NODES.forEach(n => {
        const k = key(n);
        gScore.set(k, Infinity);
        fScore.set(k, Infinity);
    });
    
    const kStart = key(startNode);
    gScore.set(kStart, 0);
    // Heuristics
    fScore.set(kStart, Math.abs(startNode[0] - goalNode[0]) + Math.abs(startNode[1] - goalNode[1]));

    while (openSet.length > 0) {
        // Find node with lowest fScore
        let removeIdx = 0;
        let current = openSet[0];
        let minF = fScore.get(key(current)) ?? Infinity;
        
        for(let i=1; i<openSet.length; i++){
            const f = fScore.get(key(openSet[i])) ?? Infinity;
            if(f < minF){
                minF = f;
                current = openSet[i];
                removeIdx = i;
            }
        }

        if (current === goalNode) {
            const path: [number, number][] = [current];
            let currKey = key(current);
            while (cameFrom.has(currKey)) {
                current = cameFrom.get(currKey)!;
                path.unshift(current);
                currKey = key(current);
            }
            return path;
        }

        openSet.splice(removeIdx, 1);
        const currentG = gScore.get(key(current)) ?? Infinity;

        // Neighbors
        const [cx, cz] = current;
        // Check 4 directions
        // Left
        const leftX = TRACK_VERTICAL_LINES.find(vx => vx < cx && Math.abs(vx - cx) < 10); // Find immediate neighbor
        // Actually the `find` logic was flawed if tracks are not sorted or if we jump tracks. 
        // TRACK_VERTICAL_LINES is sorted: [-30, -22, -14, -6, 6, 14, 22, 30]
        
        // Let's use index based check since we know the grid structure?
        // Or keep the find logic but optimized.
        
        // Re-implement getNeighbors efficiently inline
        const neighbors: [number, number][] = [];
        
        // Find existing nodes that are connected (same X or same Z)
        // Since we pre-calc NODES, we can just look up.
        // But the connections are only along grid lines.
        
        // Horizontal neighbors (same Z)
        const vIdx = TRACK_VERTICAL_LINES.indexOf(cx);
        if (vIdx > 0) neighbors.push([TRACK_VERTICAL_LINES[vIdx-1], cz]);
        if (vIdx < TRACK_VERTICAL_LINES.length - 1) neighbors.push([TRACK_VERTICAL_LINES[vIdx+1], cz]);
        
        // Vertical neighbors (same X)
        const hIdx = TRACK_HORIZONTAL_LINES.indexOf(cz);
        if (hIdx > 0) neighbors.push([cx, TRACK_HORIZONTAL_LINES[hIdx-1]]);
        if (hIdx < TRACK_HORIZONTAL_LINES.length - 1) neighbors.push([cx, TRACK_HORIZONTAL_LINES[hIdx+1]]);

        for (const neighbor of neighbors) {
            const dist = Math.abs(neighbor[0] - cx) + Math.abs(neighbor[1] - cz);
            const tentativeG = currentG + dist;
            const neighborKey = key(neighbor);
            
            if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + (Math.abs(neighbor[0] - goalNode[0]) + Math.abs(neighbor[1] - goalNode[1])));
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }


    // Si no se encuentra camino, NO devolver linea rectaStart->Goal.
    // Devolver un camino parcial o vacío es mejor que atravesar paredes.
    // Pero como es un grid conectado, debería encontrarlo.
    // Si falla, es porque start/goal están aislados? 
    // Fallback: Devolver [Start, Goal] puede causar el problema de travesar paredes.
    // Mejor intentar devolver el camino hasta el nodo más cercano al goal visitado?
    // Por simplicidad, mantengamos el fallback pero con advertencia.
    // O mejor: Insert corner point para hacer L-shape si falla (Manhattan fallback).
    const fallbackPath: [number, number][] = [startNode];
    if (Math.abs(startNode[0] - goalNode[0]) > 0.1 && Math.abs(startNode[1] - goalNode[1]) > 0.1) {
         // Corner insertion
         fallbackPath.push([goalNode[0], startNode[1]]); // Try one corner
    }
    fallbackPath.push(goalNode);
    return fallbackPath;
};

// --- NAVIGATION ARROWS (Waze Style) - OPTIMIZED with refs ---
const arrowShape = new THREE.Shape();
// Increased size: scale up by 2x
arrowShape.moveTo(0, 1.0);
arrowShape.lineTo(-0.5, 0);
arrowShape.lineTo(-0.15, 0);
arrowShape.lineTo(-0.15, -0.8);
arrowShape.lineTo(0.15, -0.8);
arrowShape.lineTo(0.15, 0);
arrowShape.lineTo(0.5, 0);
arrowShape.closePath();

const NavigationArrows = ({ targetPos, isActive }: { targetPos: [number, number, number], isActive: boolean }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    const arrowMeshes = useRef<THREE.Mesh[]>([]);
    const MAX_ARROWS = 12;

    const arrowNodes = useMemo(() => {
        return Array.from({ length: MAX_ARROWS }).map((_, i) => (
            <mesh 
                key={i} 
                ref={(el) => { if (el) arrowMeshes.current[i] = el; }} 
                visible={false} 
                rotation={[-Math.PI / 2, 0, 0]} 
            >
                <shapeGeometry args={[arrowShape]} />
                <meshBasicMaterial color="#f97316" transparent opacity={0.8} />
            </mesh>
        ));
    }, []);

    useFrame(() => {
        if (!isActive || !groupRef.current) {
            arrowMeshes.current.forEach(m => { if (m) m.visible = false; });
            return;
        }

        const px = camera.position.x;
        const pz = camera.position.z;
        const tx = targetPos[0];
        const tz = targetPos[2];

        // NEW: If very close to target (within 3 meters), hide arrows completely to avoid confusion.
        const dTarget = Math.sqrt((px - tx) * (px - tx) + (pz - tz) * (pz - tz));
        if (dTarget < 3.0) {
            arrowMeshes.current.forEach(m => { if (m) m.visible = false; });
            return;
        }

        const rawPath = getPathWaypoints(px, pz, tx, tz);
        if (!rawPath || rawPath.length === 0) {
             arrowMeshes.current.forEach(m => { if (m) m.visible = false; });
             return;
        }

        // --- PATH RECONSTRUCTION LOGIC ---
        // 1. Identify where we are relative to the path start.
        
        let pathForArrows = [...rawPath];

        // 2. Add current position to start.
        // We project the user onto the grid logic.
        // Instead of [User -> Node0 -> Node1], we want [User -> (projected point on Node0-Node1) -> Node1].
        // This makes the arrows appear "inside" the lane rather than cutting a corner to get to the start of the lane.

        if (pathForArrows.length >= 2) {
             const n0 = pathForArrows[0];
             const n1 = pathForArrows[1];
             
             // Project user (px, pz) onto line defined by n0->n1
             const dx = n1[0] - n0[0];
             const dz = n1[1] - n0[1];
             const lenSq = dx*dx + dz*dz;
             
             let startFromProjection = false;
             let projectionPoint: [number, number] | null = null;
             
             if (lenSq > 0.0001) {
                 // t is the projection factor
                 let t = ((px - n0[0]) * dx + (pz - n0[1]) * dz) / lenSq;
                 
                 // If we are somewhat aligned with the segment (even if slighty before/after), use projection.
                 // We clamp t to [0, 1] to ensure we stay on the segment.
                 // But if t < 0 (user behind start node), we should probably just start from n0.
                 // If t > 1 (user passed next node), we should drop n0 and start from n1-n2 segment.
                 
                 if (t > 1) {
                     // User passed the segment. Shift.
                     pathForArrows.shift();
                     // Re-check the new first segment immediately
                     if (pathForArrows.length >= 2) {
                         const nn0 = pathForArrows[0];
                         const nn1 = pathForArrows[1];
                         const ndx = nn1[0] - nn0[0];
                         const ndz = nn1[1] - nn0[1];
                         const nlenSq = ndx*ndx + ndz*ndz;
                         if (nlenSq > 0.0001) {
                             const nt = ((px - nn0[0]) * ndx + (pz - nn0[1]) * ndz) / nlenSq;
                             if (nt >= 0) {
                                 const nprojX = nn0[0] + nt * ndx;
                                 const nprojZ = nn0[1] + nt * ndz;
                                 projectionPoint = [nprojX, nprojZ];
                                 startFromProjection = true;
                             }
                         }
                     }
                 } else if (t >= 0) {
                     // User is "along" the segment. Project onto it.
                     const projX = n0[0] + t * dx;
                     const projZ = n0[1] + t * dz;
                     projectionPoint = [projX, projZ];
                     startFromProjection = true;
                 }
                 // If t < 0, user is before the start node. This is fine, we just start from n0.
                 // However, calculate projection anyway to see if we should snap to the line "extended backwards" visually?
                 // No, better to just let the path start at n0.
                 
                 // However, if t is very close to 0 (e.g. -0.1), we might want to project to avoid "jumping"
                 // when crossing the node threshold.
                 if (t < 0 && t > -0.2) {
                     const projX = n0[0] + t * dx;
                     const projZ = n0[1] + t * dz;
                     projectionPoint = [projX, projZ];
                     startFromProjection = true;
                 }
                 
             }
             
             if (startFromProjection && projectionPoint) {
                 // Replace n0 with projection point.
                 // This makes the arrow path physically start exactly at the projection on the lane.
                 pathForArrows[0] = projectionPoint;
                 
                 // CRITICAL: If user is "off" the lane (distance from projection is large),
                 // we should add a segment [User -> Projection] so arrows start AT FEET.
                 const distToProjSq = Math.pow(px - projectionPoint[0], 2) + Math.pow(pz - projectionPoint[1], 2);
                 if (distToProjSq > 0.5) { // If > 0.7m away from the lane center line
                      pathForArrows.unshift([px, pz]);
                 }
                 
                 // If projection point is extremely close to n1 (the end of the segment)
                 // skip this segment entirely.
                 // WARNING: If we unshifted UserPos, pathForArrows[0] is UserPos, [1] is Proj, [2] is n1
                 // We need to check Proj vs n1.
                 // Actually complex to re-index. Let's simplify:
                 // We just added User->Proj. The "Proj->n1" check should happen on the projection node.
                 
                 // Let's re-find the projection node in the array
                 const projIndex = pathForArrows.findIndex(p => p === projectionPoint);
                 if (projIndex !== -1 && projIndex + 1 < pathForArrows.length) {
                     const pProj = pathForArrows[projIndex];
                     const pNext = pathForArrows[projIndex+1];
                     const dNextSq = Math.pow(pNext[0]-pProj[0], 2) + Math.pow(pNext[1]-pProj[1], 2);
                     if(dNextSq < 0.01) {
                         // Remove pProj? Or remove pNext?
                         // If we remove pProj, we break the link User->Proj->n1. It becomes User->n1.
                         // That is acceptable.
                         pathForArrows.splice(projIndex, 1);
                     }
                 }
             }
        }
        
        // 3. Handle the Target End.
        const lastNode = pathForArrows[pathForArrows.length - 1];
        
        if (pathForArrows.length >= 2) {
             const prevNode = pathForArrows[pathForArrows.length - 2];
             
             // Check if target is "between" prevNode and lastNode in either X or Z.
             // Assume largely orthogonal movement.
             
             // Vector from prev to last
             const v_path_x = lastNode[0] - prevNode[0];
             const v_path_z = lastNode[1] - prevNode[1];
             const len_path_sq = v_path_x*v_path_x + v_path_z*v_path_z;
             
             // Vector from prev to target
             const v_targ_x = tx - prevNode[0];
             const v_targ_z = tz - prevNode[1];
             
             if (len_path_sq > 0.1) {
                 // Projection of target onto segment
                 const t = (v_targ_x * v_path_x + v_targ_z * v_path_z) / len_path_sq;
                 
                 // If 0 < t < 1, the target is "along the way" to the last node.
                 if (t > 0 && t < 1.0) {
                     // Check if target is close to the line?
                     // If it is, we should probably STOP at T, turn 90 deg, and reach Target.
                     
                     // Calculate projected point
                     const projX = prevNode[0] + t * v_path_x;
                     const projZ = prevNode[1] + t * v_path_z;
                     
                     // Now, from proj point to target, let's see distance
                     const distOrtho = Math.sqrt(Math.pow(tx - projX, 2) + Math.pow(tz - projZ, 2));
                     
                     // If we are just moving past the target's "abeam" point...
                     // We should insert the projection point and then the target.
                     // Effectively creating a smart 90 deg turn at the right spot.
                     
                     // Replace lastNode with Projection -> Target.
                     // BUT only if lastNode wasn't super critical for valid pathfinding obstacles?
                     // Assuming 'lastNode' is just a waypoint on the grid.
                     
                     // CHECK if user is already PAST the projection point?
                     // If so, we're in the final segment, just go direct to target.
                     // Calculate user projection on prev->last
                     const v_user_x = px - prevNode[0];
                     const v_user_z = pz - prevNode[1];
                     const t_user = (v_user_x * v_path_x + v_user_z * v_path_z) / len_path_sq;

                     // If user hasn't reached the turn point yet (t_user < t), we show the turn.
                     if (t_user < t) {
                         pathForArrows.pop(); // Remove the overshoot node
                         pathForArrows.push([projX, projZ]);
                         pathForArrows.push([tx, tz]);
                     } else {
                        // User is past the turn point. Just go direct to target from wherever we are.
                        // The 'shift()' logic in Step 2 likely already removed prevNode.
                        // So we probably won't even reach here with the same nodes.
                     }
                 }
             }
        } else {
             // Path is too short to check overshoot (only 1 node). Just add target.
             if (Math.abs(lastNode[0] - tx) > 0.05 || Math.abs(lastNode[1] - tz) > 0.05) {
                pathForArrows.push([tx, tz]);
             }
        }
        
        // Ensure no duplicates at end
        const finalP = pathForArrows[pathForArrows.length - 1];
        if (Math.abs(finalP[0] - tx) > 0.01 && Math.abs(finalP[1] - tz) > 0.01) {
             // This runs if the logic above failed to add the target for some reason
             pathForArrows.push([tx, tz]);
        }
        
        // 4. Construct Full Path - Do NOT prepend user position.
        // We rely on the modified pathForArrows which now starts near the user (projected or node).
        // This ensures all segments are strictly part of the grid/orthogonal plan.
        
        const fullPath = pathForArrows;
        
        const spacing = 4.0;
        let arrowsShown = 0;
        
        arrowMeshes.current.forEach(m => { if (m) m.visible = false; });

        // If path is too short, allow rendering if it goes to target
        if (fullPath.length < 2) {
             // If we just have [Target], maybe we should add [User -> Target]?
             if (fullPath.length === 1) {
                // Add user pos to allow drawing
                const d = Math.sqrt(Math.pow(fullPath[0][0]-px, 2) + Math.pow(fullPath[0][1]-pz, 2));
                if (d > 0.5) {
                    fullPath.unshift([px, pz]);
                } else {
                    arrowMeshes.current.forEach(m => { if (m) m.visible = false; });
                    return;
                }
             } else {
                 arrowMeshes.current.forEach(m => { if (m) m.visible = false; });
                 return;
             }
        }

        let totalLen = 0;
        const segments: {p1:[number, number], p2:[number,number], len: number, accumStart: number}[] = [];
        
        for(let i=0; i<fullPath.length-1; i++){
            const p1 = fullPath[i] as [number, number];
            const p2 = fullPath[i+1] as [number, number];
            const dx = p2[0] - p1[0];
            const dz = p2[1] - p1[1];
            const len = Math.sqrt(dx*dx+dz*dz);
            if(len < 0.001) continue;
            
            segments.push({p1: [p1[0], p1[1]], p2: [p2[0], p2[1]], len, accumStart: totalLen});
            totalLen += len;
        }

        // Change Strategy: Place arrows starting from Camera (dist=0) towards Target.
        // Start AT FEET (dist=0) so user sees direction immediately.
        const startDist = 0.0;
        
        // Dynamic Spacing: Near camera, denser arrows (2m). Farther away, sparser (4m).
        // For simplicity, stick to fixed spacing but ensure first arrow is visible.
        
        let accumulateD = startDist;

        while(accumulateD < totalLen) {
            if(arrowsShown >= MAX_ARROWS) break;
            
            const distFromCamera = accumulateD;
            
            // Find segment containing this distance
            let segIdx = segments.findIndex(s => distFromCamera >= s.accumStart && distFromCamera <= s.accumStart + s.len + 0.001);
            
            // Fallback
            if (segIdx === -1 && distFromCamera <= totalLen + 0.1 && segments.length > 0) {
                 segIdx = segments.length - 1;
            }
            if (segIdx === -1) {
                accumulateD += spacing;
                continue;
            }
            
            const seg = segments[segIdx];
            
            if(seg) {
                const localDist = Math.max(0, Math.min(seg.len, distFromCamera - seg.accumStart));
                const t = localDist / seg.len;
                const ax = seg.p1[0] + (seg.p2[0] - seg.p1[0]) * t;
                const az = seg.p1[1] + (seg.p2[1] - seg.p1[1]) * t;
                
                const m = arrowMeshes.current[arrowsShown];
                if(m) {
                    m.position.set(ax, 0.2, az);
                    
                    // Determine rotation
                    let dx, dz;

                    // Standard direction
                    dx = seg.p2[0] - seg.p1[0];
                    dz = seg.p2[1] - seg.p1[1];
                     
                    let angle = Math.atan2(dx, dz);
                     
                    // Snap to grid ONLY IF segment is long enough and seemingly orthogonal.
                    // If this is the LAST segment (approaching target), DO NOT SNAP so it points exactly at the box.
                    const isLastSegment = (segIdx === segments.length - 1);
                    
                    if (!isLastSegment) {
                        const snapStep = Math.PI / 2;
                        angle = Math.round(angle / snapStep) * snapStep;
                    }
                     
                    m.rotation.set(-Math.PI/2, 0, angle + Math.PI);

                    m.visible = true;
                    arrowsShown++;
                }
            }
            accumulateD += spacing;
        }
    });
    
    // ... rest of component 

    return (
        <group ref={groupRef}>
            {arrowNodes}
            {/* Destination Marker */}
            <group position={[targetPos[0], 0.1, targetPos[2]]}>
                <Cylinder args={[1.5, 1.5, 0.05, 12]}>
                    <meshBasicMaterial color="#f97316" transparent opacity={0.4} />
                </Cylinder>
            </group>
        </group>
    );
};

// --- Pathfinding helper: build path along yellow lanes ONLY ---
const buildLanePath = (fromX: number, fromZ: number, toX: number, toZ: number): THREE.Vector3[] => {
    const waypoints: THREE.Vector3[] = [];
    const Y = 0.4;

    // Snap current position to nearest highway (vertical lane)
    const curHwy = HIGHWAYS_X.reduce((p, c) => Math.abs(c - fromX) < Math.abs(p - fromX) ? c : p);
    // Snap current Z to nearest crossing (horizontal lane)
    const curCross = CROSSINGS_Z.reduce((p, c) => Math.abs(c - fromZ) < Math.abs(p - fromZ) ? c : p);

    // Snap target to nearest highway
    const tgtHwy = HIGHWAYS_X.reduce((p, c) => Math.abs(c - toX) < Math.abs(p - toX) ? c : p);
    // Snap target Z to nearest crossing
    const tgtCross = CROSSINGS_Z.reduce((p, c) => Math.abs(c - toZ) < Math.abs(p - toZ) ? c : p);

    // Step A: Snap to highway, go to nearest crossing
    waypoints.push(new THREE.Vector3(curHwy, Y, fromZ));
    waypoints.push(new THREE.Vector3(curHwy, Y, curCross));

    // Step B: Travel along crossing to target highway (if different)
    if (curHwy !== tgtHwy) {
        waypoints.push(new THREE.Vector3(tgtHwy, Y, curCross));
    }

    // Step C: Travel along highway to target crossing (if different)
    if (curCross !== tgtCross) {
        waypoints.push(new THREE.Vector3(tgtHwy, Y, tgtCross));
    }

    // Step D: If target X is off-highway (e.g. dock), travel along crossing
    if (Math.abs(tgtHwy - toX) > 1) {
        waypoints.push(new THREE.Vector3(toX, Y, tgtCross));
    }

    // Step E: Final approach to destination Z
    waypoints.push(new THREE.Vector3(toX, Y, toZ));

    return waypoints;
};

// --- TELEMETRY SYSTEM ---
const telemetryChannel = new BroadcastChannel('tailoy-warehouse-monitor');

// --- SUB-COMPONENT: AMR ROBOT (STRICT Lane Following) ---
const AMRRobot = ({ id, startX, startZ, heldBox, setHeldBox, onDeliver, onUpdateTelemetry }: {
    id: number, startX: number, startZ: number,
    heldBox: string | null, setHeldBox: (c: string | null) => void,
    onDeliver: (dockId: number, color: string) => void,
    onUpdateTelemetry: (id: number, data: any) => void
}) => {
    const robotRef = useRef<THREE.Group>(null);
    const [cargo, setCargo] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'FOLLOWING' | 'WAITING_DEST' | 'DELIVERING' | 'RETURNING'>('IDLE');
    const [targetDockIndex, setTargetDockIndex] = useState<number | null>(null);
    const [deliveryCount, setDeliveryCount] = useState(0);
    const [battery, setBattery] = useState(100);
    const { camera } = useThree();

    const waypointsRef = useRef<THREE.Vector3[]>([]);
    const currentWpIdx = useRef(0);
    const followCooldown = useRef(0);
    const lastUpdateRef = useRef(Date.now());
    const lastReportRef = useRef(0);
    const workerRef = useRef<Worker | null>(null);

    // --- TELEMETRY LISTENER FOR COMMANDS ---
    useEffect(() => {
        const handleCommand = (event: MessageEvent) => {
             if (event.data.type === 'ROBOT_COMMAND' && event.data.payload.id === id) {
                 const cmd = event.data.payload.command;
                 if (cmd === 'TOGGLE_ACTIVE') {
                     setIsActive(prev => !prev);
                     // If activating, start following
                     if (!isActive) setStatus('FOLLOWING');
                     else setStatus('IDLE');
                 } else if (cmd === 'RETURN_HOME') {
                    if (status !== 'RETURNING' && status !== 'IDLE') {
                        setIsActive(false);
                        waypointsRef.current = buildLanePath(robotRef.current!.position.x, robotRef.current!.position.z, startX, startZ);
                        currentWpIdx.current = 0;
                        setCargo(null);
                        setStatus('RETURNING');
                    }
                 }
             }
        };
        telemetryChannel.addEventListener('message', handleCommand);
        return () => telemetryChannel.removeEventListener('message', handleCommand);
    }, [id, startX, startZ, status, isActive]);

    // --- BACKGROUND EXECUTION: WEB WORKER SOLUTION ---
    useEffect(() => {
        // Create worker blob URL to avoid file loading issues in dev
        const blob = new Blob([`
            let timerId = null;
            self.onmessage = (e) => {
                if (e.data === 'start') {
                    if (timerId) clearInterval(timerId);
                    timerId = setInterval(() => self.postMessage('tick'), 100);
                } else if (e.data === 'stop') {
                    if (timerId) clearInterval(timerId);
                    timerId = null;
                }
            };
        `], { type: 'application/javascript' });
        
        workerRef.current = new Worker(URL.createObjectURL(blob));
        
        workerRef.current.onmessage = (e) => {
            if (e.data === 'tick' && document.hidden) {
                const now = Date.now();
                const delta = (now - lastUpdateRef.current) / 1000;
                lastUpdateRef.current = now;
                updateRobotLogic(Math.min(delta, 0.1));
            }
        };

        workerRef.current.postMessage('start');
        return () => workerRef.current?.terminate();
    }, [status, cargo, isActive, targetDockIndex]); 

    // --- KEYBOARD CONTROL ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status === 'WAITING_DEST' && cargo && isActive) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 8) {
                    const dock = DOCK_DATA[num - 1];
                    const robotPos = robotRef.current?.position;
                    if (robotPos) {
                        const dockX = dock.x + (dock.side === 'left' ? 5 : -5);
                        waypointsRef.current = buildLanePath(robotPos.x, robotPos.z, dockX, dock.z);
                        currentWpIdx.current = 0;
                    }
                    setTargetDockIndex(num - 1);
                    setStatus('DELIVERING');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, cargo, isActive]);

    // Shared waypoint movement function
    const moveAlongWaypoints = (pos: THREE.Vector3, moveSpeed: number): boolean => {
        if (currentWpIdx.current >= waypointsRef.current.length) return true;
        const wp = waypointsRef.current[currentWpIdx.current];

        const dx = wp.x - pos.x;
        const dz = wp.z - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 0.4) {
            pos.x = wp.x;
            pos.z = wp.z;
            currentWpIdx.current++;
            return currentWpIdx.current >= waypointsRef.current.length;
        }

        // Move one axis at a time (strict grid/lane movement)
        if (Math.abs(dx) > 0.2) {
            const step = Math.min(moveSpeed, Math.abs(dx));
            pos.x += (dx > 0 ? 1 : -1) * step;
            robotRef.current!.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            pos.x = wp.x;
            if (Math.abs(dz) > 0.2) {
                const step = Math.min(moveSpeed, Math.abs(dz));
                pos.z += (dz > 0 ? 1 : -1) * step;
                robotRef.current!.rotation.y = dz > 0 ? 0 : Math.PI;
            }
        }
        return false;
    };

    // --- CORE LOGIC ---
    const updateRobotLogic = (delta: number) => {
        if (!robotRef.current) return;
        const pos = robotRef.current.position;

        // Simulate battery usage
        if (status !== 'IDLE') {
            setBattery(prev => Math.max(0, prev - (delta * 0.1)));
        } else {
            setBattery(prev => Math.min(100, prev + (delta * 0.5)));
        }

        // Update telemetry (Throttled to 50ms - 20fps for smoother realtime tracking)
        // Also include a precise timestamp so the receiver can discard old latency packets
        const now = Date.now();
        if (now - lastReportRef.current > 50) {
            onUpdateTelemetry(id, { 
                id, 
                x: pos.x, 
                z: pos.z, 
                status, 
                cargo, 
                deliveryCount, 
                battery, 
                timestamp: now 
            });
            lastReportRef.current = now;
        }

        const moveSpeed = delta * 10;

        if (status === 'DELIVERING') {
            const done = moveAlongWaypoints(pos, moveSpeed);
            if (done) {
                if (cargo && targetDockIndex !== null) {
                    onDeliver(DOCK_DATA[targetDockIndex].id, cargo);
                    setDeliveryCount(prev => prev + 1);
                }
                setCargo(null);
                setTargetDockIndex(null);
                waypointsRef.current = buildLanePath(pos.x, pos.z, startX, startZ);
                currentWpIdx.current = 0;
                setStatus('RETURNING');
            }
        } else if (status === 'RETURNING') {
            const done = moveAlongWaypoints(pos, moveSpeed);
            if (done) {
                pos.x = startX;
                pos.z = startZ;
                setStatus('IDLE');
                setIsActive(false);
                waypointsRef.current = [];
            }
        } else if (status === 'FOLLOWING' && isActive) {
            if (waypointsRef.current.length > 0 && currentWpIdx.current < waypointsRef.current.length) {
                moveAlongWaypoints(pos, moveSpeed);
            }
            followCooldown.current -= delta;
            
            // SMART FOLLOW LOGIC (Recalculate if far)
            if (followCooldown.current <= 0) {
                 followCooldown.current = 2.0; 
                 // Simple logic for background follow update
                 const playerPos = camera.position;
                 const dist2d = Math.sqrt((pos.x - playerPos.x) ** 2 + (pos.z - playerPos.z) ** 2);
                 
                 if (dist2d > 8 || waypointsRef.current.length === 0 || (currentWpIdx.current >= waypointsRef.current.length - 1)) {
                    // Find nearest intersection to player
                    const targetHwy = HIGHWAYS_X.reduce((p, c) => Math.abs(c - playerPos.x) < Math.abs(p - playerPos.x) ? c : p);
                    const targetCross = CROSSINGS_Z.reduce((p, c) => Math.abs(c - playerPos.z) < Math.abs(p - playerPos.z) ? c : p);

                    const newTarget = new THREE.Vector3(targetHwy, 0.4, targetCross);
                    const currentPathEnd = waypointsRef.current.length > 0 ? waypointsRef.current[waypointsRef.current.length - 1] : null;

                    const needsNewPath = !currentPathEnd || currentPathEnd.distanceTo(newTarget) > 3;

                    if (needsNewPath) {
                        waypointsRef.current = buildLanePath(pos.x, pos.z, targetHwy, targetCross);
                        currentWpIdx.current = 0;
                    }
                 }
            }
        }
    };

    useFrame((state, delta) => {
        if (document.hidden) return; // Skip if handled by interval
        lastUpdateRef.current = Date.now();
        updateRobotLogic(delta);
    });

    return (
        <group
            ref={robotRef}
            position={[startX, 0.4, startZ]}
            onClick={(e) => {
                e.stopPropagation();
                if (!isActive) { setIsActive(true); setStatus('FOLLOWING'); return; }
                if (heldBox && !cargo && isActive) {
                    setCargo(heldBox);
                    setHeldBox(null);
                    setStatus('WAITING_DEST');
                }
            }}
        >
            <Box args={[2.5, 0.6, 2.8]} position={[0, -0.1, 0]}>
                <meshLambertMaterial color={isActive ? COLOR_ROBOT_CHASSIS : "#4b5563"} />
            </Box>
            <Box args={[2.7, 0.2, 3]} position={[0, -0.3, 0]}>
                <meshLambertMaterial color="#1f2937" />
            </Box>
            <Box args={[2.4, 0.1, 2.6]} position={[0, 0.25, 0]}>
                <meshLambertMaterial color="#374151" />
            </Box>
            <Cylinder args={[0.3, 0.3, 0.4, 12]} position={[0, 0.6, 1.1]}>
                <meshLambertMaterial color="#111" />
            </Cylinder>
            <Cylinder args={[0.2, 0.2, 0.2, 12]} position={[0, 0.8, 1.1]}>
                <meshBasicMaterial color={status === 'WAITING_DEST' ? "#facc15" : (isActive ? "#22c55e" : "#ef4444")} />
            </Cylinder>
            {status === 'WAITING_DEST' && (
                <Html position={[0, 3, 0]} center>
                    <div className="bg-black/90 text-yellow-400 px-3 py-1 rounded border border-yellow-500 font-bold text-sm whitespace-nowrap animate-bounce">
                        TECLA 1-8 PARA ENVIAR
                    </div>
                </Html>
            )}
            {[[-1.45, -0.1, 0.8], [1.45, -0.1, 0.8], [-1.45, -0.1, -0.8], [1.45, -0.1, -0.8]].map((p, i) => (
                <group key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
                    <Cylinder args={[0.45, 0.45, 0.4, 12]}><meshLambertMaterial color="#111" /></Cylinder>
                    <Cylinder args={[0.47, 0.47, 0.1, 12]} position={[0, 0.15, 0]}><meshLambertMaterial color="#333" /></Cylinder>
                </group>
            ))}
            {cargo && <Box position={[0, 1.1, 0]} args={[1.8, 1.8, 1.8]}><meshLambertMaterial color={cargo} /></Box>}
        </group>
    );
};

// --- MAIN WORLD COMPONENT ---
const World: React.FC<WorldProps> = ({ config, heldBox, setHeldBox, isARActive, selectedProduct }) => {
    const WallMat = useMemo(() => <meshLambertMaterial color={config.gridColor} />, [config.gridColor]);
    const RackMat = useMemo(() => <meshLambertMaterial color={COLOR_RACK} />, []);
    const [truckCargos, setTruckCargos] = useState<Record<number, string[]>>({});
    const { camera } = useThree();
    
    // Telemetry ref (local to World instance)
    const telemetryRef = useRef({
        amrs: {} as Record<number, { id: number, x: number, z: number, status: string, cargo: string | null }>,
        player: { x: 0, z: 0 }
    });

    // Start telemetry broadcast loop
    useEffect(() => {
        const interval = setInterval(() => {
            const payload = {
                amrs: Object.values(telemetryRef.current.amrs),
                player: telemetryRef.current.player,
                timestamp: Date.now()
            };
            telemetryChannel.postMessage({
                type: 'TELEMETRY_UPDATE',
                payload: payload
            });
        }, 50); // Increased rate for smoothness (20fps)

        return () => clearInterval(interval);
    }, []);

    useFrame(() => {
        if (camera) {
            telemetryRef.current.player = { x: camera.position.x, z: camera.position.z };
        }
    });

    // Share telemetry update function with children
    const updateAMRTelemetry = (id: number, data: any) => {
        telemetryRef.current.amrs[id] = data;
    };


    const handleDeliver = (dockId: number, color: string) => {
        setTruckCargos(prev => ({
            ...prev,
            [dockId]: [...(prev[dockId] || []), color]
        }));
    };

    const staticStructure = useMemo(() => {
        const el: React.ReactNode[] = [];
        const tracks: React.ReactNode[] = [];
        let kid = 0;

        const createW = (s: 'l' | 'r', docks: typeof DOCK_DATA) => {
            const x = s === 'l' ? -40 : 40;
            el.push(<Box key={`w-${s}-top`} position={[x, 23.5, 0]} args={[1, 33, 160]}>{WallMat}</Box>);
            const sideDocks = docks.filter(d => d.side === (s === 'l' ? 'left' : 'right'));
            sideDocks.forEach(d => {
                el.push(<group key={`df-${d.id}`} position={[x, 3.5, d.z]}>
                    <Box args={[1.2, 7, 0.5]} position={[0, 0, -4.2]}><meshLambertMaterial color="#111" /></Box>
                    <Box args={[1.2, 7, 0.5]} position={[0, 0, 4.2]}><meshLambertMaterial color="#111" /></Box>
                    <Html position={[0, 5, 0]} center>
                        <div style={{ background: '#000', color: '#fff', padding: '2px 10px', borderRadius: '4px', border: '2px solid #facc15', fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            Puerta {d.id}
                        </div>
                    </Html>
                </group>);
            });
            const sortedZs = sideDocks.map(d => d.z).sort((a, b) => a - b);
            const doorRadius = 5;
            let currentZ = -80;
            sortedZs.forEach(doorZ => {
                const wallEndZ = doorZ - doorRadius;
                if (wallEndZ - currentZ > 0.1) el.push(<Box key={`w-${s}-low-${kid++}`} position={[x, 3.5, (currentZ + wallEndZ) / 2]} args={[1, 7, wallEndZ - currentZ]}>{WallMat}</Box>);
                currentZ = doorZ + doorRadius;
            });
            if (80 - currentZ > 0.1) el.push(<Box key={`w-${s}-low-end`} position={[x, 3.5, (currentZ + 80) / 2]} args={[1, 7, 80 - currentZ]}>{WallMat}</Box>);
        };
        createW('l', DOCK_DATA); createW('r', DOCK_DATA);

        const shelfUnit = 4.0;
        RACK_X_POSITIONS.forEach(rx => {
            RACK_SECTIONS.forEach((sec, si) => {
                const numShelves = Math.floor(RACK_SECTION_LENGTH / shelfUnit);
                const actualShelfW = RACK_SECTION_LENGTH / numShelves;
                for (let i = 0; i < numShelves; i++) {
                    const z = sec.zStart + i * actualShelfW + actualShelfW / 2;
                    el.push(<group key={`rk-sh-${rx}-${si}-${i}`} position={[rx, 5, z]}>
                        {[0.5, 4.5, 8.5].map(y => <Box key={y} position={[0, y - 5, 0]} args={[2.5, 0.1, actualShelfW - 0.1]}><meshLambertMaterial color={COLOR_RACK} /></Box>)}
                    </group>);
                }
                const numPoles = Math.max(2, Math.ceil(RACK_SECTION_LENGTH / 10) + 1);
                for (let pi = 0; pi < numPoles; pi++) {
                    const pz = sec.zStart + (pi / (numPoles - 1)) * RACK_SECTION_LENGTH;
                    const isEndPole = pi === 0 || pi === numPoles - 1;
                    el.push(<group key={`rk-pl-${rx}-${si}-${pi}`} position={[rx, 5, pz]}>
                        {[[-1.2, 0], [1.2, 0]].map((p, i) => (
                            <Box key={i} args={[0.15, 10, 0.15]} position={[p[0], 0, p[1]]}><meshLambertMaterial color={COLOR_RACK_POLE} /></Box>
                        ))}
                        {isEndPole && (
                            <group position={[1.4, 2, 0]}>
                                <Box args={[0.4, 0.6, 0.3]} rotation={[0, Math.PI / 2, 0]}><meshBasicMaterial color="#3b82f6" /></Box>
                                <Cylinder args={[0.02, 0.02, 0.8]} position={[0, 0.7, 0]}><meshBasicMaterial color="#93c5fd" /></Cylinder>
                            </group>
                        )}
                    </group>);
                }
            });
        });
        HIGHWAYS_X.forEach(x => tracks.push(<Box key={`hx-${x}`} position={[x, 0.02, 0]} args={[0.5, 0.02, 160]}><meshBasicMaterial color={COLOR_TRACK} /></Box>));
        CROSSINGS_Z.forEach(z => tracks.push(<Box key={`cz-${z}`} position={[0, 0.02, z]} args={[70, 0.02, 0.5]}><meshBasicMaterial color={COLOR_TRACK} /></Box>));
        DOCK_DATA.forEach(d => {
            const hX = d.side === 'left' ? -34 : 34;
            const wallX = d.side === 'left' ? -38 : 38;
            tracks.push(<Box key={`dt-${d.id}`} position={[(wallX + hX) / 2, 0.02, d.z]} args={[Math.abs(wallX - hX), 0.02, 0.5]}><meshBasicMaterial color={COLOR_TRACK} /></Box>);
        });
        return { el, tracks };
    }, [WallMat, RackMat]);

    const boxes = useMemo(() => {
        const b = [];
        const shelfUnit = 4.0;
        let id = 0;
        let seed = 123456;
        RACK_X_POSITIONS.forEach(rx => {
            RACK_SECTIONS.forEach(sec => {
                const numShelves = Math.floor(RACK_SECTION_LENGTH / shelfUnit);
                const actualShelfW = RACK_SECTION_LENGTH / numShelves;
                for (let i = 0; i < numShelves; i++) {
                    const z = sec.zStart + i * actualShelfW + actualShelfW / 2;
                    [0.5, 4.5, 8.5].forEach(y => {
                        const chance = seededRandom(seed++);
                        const colorIdx = Math.floor(seededRandom(seed++) * 4);
                        if (chance > 0.45) {
                            // Assign a product from the catalog
                            const productIdx = id % PRODUCT_CATALOG.length;
                            b.push({
                                id: id++,
                                pos: [rx, y + 0.8, z] as [number, number, number],
                                color: BOX_COLORS[colorIdx],
                                product: PRODUCT_CATALOG[productIdx]
                            });
                        }
                    });
                }
            });
        });
        return b;
    }, []);

    // Find target position for selected product
    const targetBoxPos = useMemo(() => {
        if (!selectedProduct) return null;
        const box = boxes.find(b => b.product.name === selectedProduct.name);
        return box ? box.pos : null;
    }, [selectedProduct, boxes]);

    return (
        <group>
            <Plane args={[80, 160]} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><meshLambertMaterial color={config.groundColor} /></Plane>
            <Grid position={[0, 0.05, 0]} args={[80, 160]} cellSize={2} sectionSize={10} fadeDistance={140} sectionColor={config.gridColor} cellColor={config.gridColor} />

            {staticStructure.el}
            {staticStructure.tracks}

            {boxes.map(b => (
                <InteractiveBox
                    key={b.id}
                    position={b.pos}
                    color={b.color}
                    onPick={() => setHeldBox(b.color)}
                    isTarget={isARActive && selectedProduct !== null && b.product.name === selectedProduct.name}
                />
            ))}

            {/* AR RFID Tags - centralized, only for nearby + target boxes */}
            {isARActive && (
                <ARTagManager boxes={boxes} selectedProduct={selectedProduct} />
            )}

            {/* WAZE-LIKE NAVIGATION ARROWS */}
            {targetBoxPos && (
                <NavigationArrows
                    targetPos={targetBoxPos}
                    isActive={isARActive && selectedProduct !== null}
                />
            )}

            {DOCK_DATA.map((d, i) => (
                <Truck
                    key={i}
                    position={[d.x + (d.side === 'left' ? -15 : 15), 0, d.z]}
                    rotation={[0, d.side === 'left' ? -Math.PI / 2 : Math.PI / 2, 0]}
                    cargoList={truckCargos[d.id] || []}
                />
            ))}

            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <AMRRobot
                    key={i}
                    id={i}
                    // Centering 7 robots: -18 to +18 spacing. (i-1)*6 - 18
                    startX={(i - 1) * 6 - 18}
                    startZ={68}
                    heldBox={heldBox}
                    setHeldBox={setHeldBox}
                    onDeliver={handleDeliver}
                    onUpdateTelemetry={updateAMRTelemetry}
                />
            ))}

            <Box position={[0, 20, -80]} args={[80, 40, 1]}>{WallMat}</Box>
            <Box position={[0, 20, 80]} args={[80, 40, 1]}>{WallMat}</Box>

            {/* Tai Loy logo on the back wall */}
            <TaiLoyLogo />
        </group>
    );
};

// Simple box - NO useFrame, NO useThree, NO Html per box
const InteractiveBox = React.memo(({ position, color, onPick, isTarget }: {
    position: [number, number, number], color: string, onPick: () => void, isTarget: boolean
}) => {
    const [picked, setPicked] = useState(false);

    if (picked) return null;
    return (
        <group position={position}>
            <Box args={[1.4, 1.4, 1.4]} onClick={(e) => { e.stopPropagation(); setPicked(true); onPick(); }}>
                <meshLambertMaterial color={isTarget ? '#22c55e' : color} />
            </Box>
            <Box args={[0.05, 0.4, 0.4]} position={[0.72, 0, 0]}><meshBasicMaterial color="#ffffff" /></Box>
            <Plane args={[0.3, 0.3]} position={[0.76, 0, 0]} rotation={[0, Math.PI / 2, 0]}><meshBasicMaterial color="#000000" /></Plane>
            {isTarget && (
                <Sphere args={[1.5, 6, 6]}>
                    <meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.3} depthTest={false} />
                </Sphere>
            )}
        </group>
    );
});

// Centralized AR tag manager - ONE useFrame for ALL boxes, shows max 5 nearby tags
const ARTagManager = ({ boxes, selectedProduct }: { boxes: { id: number, pos: [number, number, number], product: ProductInfo }[], selectedProduct: ProductInfo | null }) => {
    const { camera } = useThree();
    const [visibleTags, setVisibleTags] = useState<{ pos: [number, number, number], product: ProductInfo, isTarget: boolean }[]>([]);
    const cooldown = useRef(0);

    useFrame((_, delta) => {
        cooldown.current -= delta;
        if (cooldown.current > 0) return;
        cooldown.current = 0.5; // Update every 0.5 seconds, not every frame

        const camPos = camera.position;
        const nearby: { pos: [number, number, number], product: ProductInfo, isTarget: boolean, dist: number }[] = [];

        for (const b of boxes) {
            const dx = camPos.x - b.pos[0], dz = camPos.z - b.pos[2];
            const dist = Math.sqrt(dx * dx + dz * dz);
            const isTarget = selectedProduct !== null && b.product.name === selectedProduct.name;
            if (dist < 10 || isTarget) {
                nearby.push({ pos: b.pos, product: b.product, isTarget, dist });
            }
        }

        // Sort by distance, show max 6
        nearby.sort((a, b) => {
            if (a.isTarget && !b.isTarget) return -1;
            if (!a.isTarget && b.isTarget) return 1;
            return a.dist - b.dist;
        });

        setVisibleTags(nearby.slice(0, 6));
    });

    return (
        <>
            {visibleTags.map((tag, i) => (
                <Html key={i} position={[tag.pos[0], tag.pos[1] + 1.5, tag.pos[2]]} center zIndexRange={[100, 0]}>
                    <div className={`px-3 py-2 rounded-lg border font-mono text-[10px] whitespace-nowrap shadow-lg backdrop-blur-sm ${
                        tag.isTarget
                            ? 'bg-black/95 border-yellow-500 text-white shadow-orange-500/20'
                            : 'bg-black/90 border-blue-500/50 text-black/90'
                    }`}>
                        <div className={`font-bold text-xs ${tag.isTarget ? 'text-orange-300' : 'text-blue-300'}`}>{tag.product.name}</div>
                        <div className={`mt-0.5 ${tag.isTarget ? 'text-orange-200/80' : 'text-gray-300/70'}`}>SKU: {tag.product.sku} | {tag.product.category}</div>
                        <div className="flex justify-between mt-0.5 gap-3">
                            <span className={tag.isTarget ? 'text-orange-300' : 'text-blue-300'}>S/.{tag.product.price.toFixed(2)}</span>
                            <span className={tag.isTarget ? 'text-orange-200' : 'text-gray-400'}>Stock: {tag.product.stock}</span>
                        </div>
                    </div>
                </Html>
            ))}
        </>
    );
};

export default World;
