import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Shared Constants ---
const COLORS = {
  accent: '#00e5ff',   // Neon Blue
  success: '#00e676',  // Neon Green
  rejected: '#ff1744', // Warning Red
  base: '#2a2a2a',     // Dark grey
};

const TECH_PROPS = {
  metalness: 0.8,
  roughness: 0.2,
};

// --- Component 1: Scanner (Loops Automatically) ---
function ScannerScene() {
  const laserRef = useRef<THREE.Mesh>(null);
  const pipsRef = useRef<THREE.Group>(null);
  
  const pips = useMemo(() => Array.from({ length: 15 }, () => ({
    position: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 6, 0.05] as [number, number, number],
    phase: Math.random() * Math.PI * 2,
  })), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (laserRef.current) {
      laserRef.current.position.y = Math.sin(time * 2) * 3;
    }
    if (pipsRef.current) {
      pipsRef.current.children.forEach((child, i) => {
        const scale = 0.5 + Math.sin(time * 4 + pips[i].phase) * 0.5;
        child.scale.setScalar(Math.max(0, scale)); // Prevent negative scale errors
      });
    }
  });

  return (
    <group>
      <mesh>
        <planeGeometry args={[5, 7]} />
        <meshStandardMaterial color={COLORS.base} transparent opacity={0.6} {...TECH_PROPS} />
      </mesh>
      <mesh ref={laserRef} position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.02, 0.02, 5.2, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={2} />
      </mesh>
      <group ref={pipsRef}>
        {pips.map((pip, i) => (
          <mesh key={i} position={pip.position}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={COLORS.success} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// --- Component 2: Sieve (Fixed Materials & Looping) ---
function SieveScene() {
  const instancesRef = useRef<THREE.InstancedMesh>(null);
  const count = 50;
  
  // Use useMemo to avoid recreating these objects every frame
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const spheres = useMemo(() => Array.from({ length: count }, () => {
    const type = Math.random();
    const targetLayer = type < 0.7 ? 0 : type < 0.9 ? 1 : 2;
    return {
      pos: [(Math.random() - 0.5) * 4, 8 + Math.random() * 10, (Math.random() - 0.5) * 2],
      vel: 0.02 + Math.random() * 0.05,
      targetY: [2, 0, -2.5][targetLayer],
      stopped: false,
      stopTime: 0,
      layer: targetLayer,
      color: COLORS.accent,
    };
  }), []);

  useFrame((state) => {
    if (!instancesRef.current) return;
    const time = state.clock.elapsedTime;

    spheres.forEach((s, i) => {
      if (!s.stopped) {
        s.pos[1] -= s.vel; // Fall down
        if (s.pos[1] <= s.targetY) {
          s.pos[1] = s.targetY;
          s.stopped = true;
          s.stopTime = time;
          s.color = s.layer < 2 ? COLORS.rejected : COLORS.success;
        }
      } else if (time - s.stopTime > 2) {
        // Reset after 2 seconds to create continuous loop
        s.pos[1] = 8 + Math.random() * 5;
        s.stopped = false;
        s.color = COLORS.accent;
      }

      tempObject.position.set(s.pos[0], s.pos[1], s.pos[2]);
      tempObject.updateMatrix();
      instancesRef.current!.setMatrixAt(i, tempObject.matrix);
      tempColor.set(s.color);
      instancesRef.current!.setColorAt(i, tempColor);
    });

    instancesRef.current.instanceMatrix.needsUpdate = true;
    if (instancesRef.current.instanceColor) instancesRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {/* Explicitly declaring materials avoids R3F shared instance bugs */}
      <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6, 10, 10]} />
        <meshStandardMaterial color={COLORS.accent} wireframe />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6, 10, 10]} />
        <meshStandardMaterial color={COLORS.accent} wireframe />
      </mesh>
      <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6, 10, 10]} />
        <meshStandardMaterial color={COLORS.accent} wireframe />
      </mesh>

      <instancedMesh ref={instancesRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial {...TECH_PROPS} />
      </instancedMesh>
    </group>
  );
}

// --- Component 3: Blueprint (Fixed Looping) ---
function BlueprintScene() {
  const cubesRef = useRef<THREE.Group>(null);
  
  const targets = useMemo(() => [
    [1.1, 1.1, 1.1], [-1.1, 1.1, 1.1], [1.1, -1.1, 1.1], [-1.1, -1.1, 1.1], [0, 0, 1.2]
  ], []);

  const cubes = useMemo(() => targets.map((target, i) => ({
    start: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12],
    target,
    delay: i * 0.8,
  })), [targets]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (cubesRef.current) {
      cubesRef.current.children.forEach((child, i) => {
        const c = cubes[i];
        // Sine wave math creates a smooth ping-pong effect for continuous looping
        const rawWave = Math.sin(time * 0.8 - c.delay); 
        const progress = Math.max(0, Math.min(1, rawWave * 1.5)); 
        
        child.position.x = c.start[0] + (c.target[0] - c.start[0]) * progress;
        child.position.y = c.start[1] + (c.target[1] - c.start[1]) * progress;
        child.position.z = c.start[2] + (c.target[2] - c.start[2]) * progress;
        
        if (progress === 1) {
            child.rotation.y += 0.02;
            child.rotation.x += 0.01;
        }
      });
    }
  });

  return (
    <group>
      <mesh>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color={COLORS.accent} wireframe transparent opacity={0.3} />
      </mesh>
      <group ref={cubesRef}>
        {cubes.map((_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={COLORS.success} {...TECH_PROPS} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// --- Main Interactive Wrapper ---
export default function ResumeAI3DVisualizer() {
  const [activeView, setActiveView] = useState<'scanner' | 'sieve' | 'blueprint'>('scanner');

  return (
    // Note: min-h-[500px] ensures the canvas doesn't collapse to 0 height
    <div className="relative w-full min-h-[600px] bg-[#0a0a0a] overflow-hidden rounded-xl border border-gray-800">
      
      {/* UI Overlay */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-10">
        {(['scanner', 'sieve', 'blueprint'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeView === view 
                ? 'bg-transparent text-[#00e5ff] border border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]' 
                : 'bg-gray-800 text-gray-400 border border-transparent hover:text-white'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {activeView === 'scanner' && <ScannerScene />}
        {activeView === 'sieve' && <SieveScene />}
        {activeView === 'blueprint' && <BlueprintScene />}

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.0} />
      </Canvas>
    </div>
  );
}
