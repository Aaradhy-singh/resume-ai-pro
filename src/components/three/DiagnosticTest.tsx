import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  accent: '#00e5ff',
  success: '#00e676',
  rejected: '#ff1744',
  base: '#2a2a2a',
};

const TECH_PROPS = { metalness: 0.8, roughness: 0.2 };

function ScannerScene() {
  const laserRef = useRef<THREE.Mesh>(null);
  const pipsRef = useRef<THREE.Group>(null);
  const pips = useMemo(() => Array.from({ length: 15 }, () => ({
    position: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 6, 0.05] as [number, number, number],
    phase: Math.random() * Math.PI * 2,
  })), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (laserRef.current) laserRef.current.position.y = Math.sin(time * 2) * 3;
    if (pipsRef.current) {
      pipsRef.current.children.forEach((child, i) => {
        const scale = 0.5 + Math.sin(time * 4 + pips[i].phase) * 0.5;
        child.scale.setScalar(Math.max(0, scale));
      });
    }
  });

  return (
    <group>
      <mesh>
        <planeGeometry args={[5, 7]} />
        <meshStandardMaterial color={COLORS.base} transparent opacity={0.6} {...TECH_PROPS} />
      </mesh>
      <mesh ref={laserRef} position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 5.2, 12]} />
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

function SieveScene() {
  const instancesRef = useRef<THREE.InstancedMesh>(null);
  const count = 50;
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const spheres = useMemo(() => Array.from({ length: count }, () => {
    const type = Math.random();
    const targetLayer = type < 0.7 ? 0 : type < 0.9 ? 1 : 2;
    return {
      pos: [(Math.random() - 0.5) * 4, 8 + Math.random() * 10, (Math.random() - 0.5) * 2],
      vel: 0.02 + Math.random() * 0.05,
      targetY: [2, 0, -2.5][targetLayer],
      stopped: false, stopTime: 0, layer: targetLayer, color: COLORS.accent,
    };
  }), []);

  useFrame((state) => {
    if (!instancesRef.current) return;
    const time = state.clock.elapsedTime;
    spheres.forEach((s, i) => {
      if (!s.stopped) {
        s.pos[1] -= s.vel;
        if (s.pos[1] <= s.targetY) {
          s.pos[1] = s.targetY;
          s.stopped = true;
          s.stopTime = time;
          s.color = s.layer < 2 ? COLORS.rejected : COLORS.success;
        }
      } else if (time - s.stopTime > 2) {
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
      <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6, 10, 10]} />
        <meshStandardMaterial color={COLORS.accent} wireframe emissive={COLORS.accent} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6, 10, 10]} />
        <meshStandardMaterial color={COLORS.accent} wireframe emissive={COLORS.accent} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6, 10, 10]} />
        <meshStandardMaterial color={COLORS.accent} wireframe emissive={COLORS.accent} emissiveIntensity={0.5} />
      </mesh>
      <instancedMesh ref={instancesRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial {...TECH_PROPS} />
      </instancedMesh>
    </group>
  );
}

function BlueprintScene() {
  const cubesRef = useRef<THREE.Group>(null);
  const targets = useMemo(() => [[1.1, 1.1, 1.1], [-1.1, 1.1, 1.1], [1.1, -1.1, 1.1], [-1.1, -1.1, 1.1], [0, 0, 1.2]], []);
  const cubes = useMemo(() => targets.map((target, i) => ({
    start: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12],
    target, delay: i * 0.8,
  })), [targets]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (cubesRef.current) {
      cubesRef.current.children.forEach((child, i) => {
        const c = cubes[i];
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
        <meshStandardMaterial color={COLORS.accent} wireframe transparent opacity={0.3} emissive={COLORS.accent} emissiveIntensity={0.5} />
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

export default function ResumeAI3DVisualizer() {
  const [activeView, setActiveView] = useState<'scanner' | 'sieve' | 'blueprint'>('scanner');

  return (
    <div className="relative w-full min-h-[500px] bg-transparent overflow-hidden flex flex-col items-center justify-center">
      <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={3.0} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={2.0} color="#00e5ff" />
        {activeView === 'scanner' && <ScannerScene />}
        {activeView === 'sieve' && <SieveScene />}
        {activeView === 'blueprint' && <BlueprintScene />}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.0} />
      </Canvas>
      <div className="absolute bottom-4 flex gap-4 z-10">
        {(['scanner', 'sieve', 'blueprint'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeView === view 
                ? 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]' 
                : 'bg-transparent text-gray-500 border border-gray-800 hover:text-white'
            }`}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  );
}
