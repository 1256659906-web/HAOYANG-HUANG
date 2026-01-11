
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Flower, { FlowerVariant } from './Flower';
import FortuneStick from './FortuneStick';
import { GardenConfig } from '../types';

interface GardenSceneProps {
  config: GardenConfig;
  onPlanted: (count: number) => void;
  onSelectFlower: (variant: FlowerVariant) => void;
}

const SceneContent: React.FC<GardenSceneProps> = ({ config, onPlanted, onSelectFlower }) => {
  const { raycaster, mouse, camera } = useThree();
  const [plantedFlowers, setPlantedFlowers] = useState<{pos: [number, number, number], variant: FlowerVariant}[]>([]);
  const gardenGroupRef = useRef<THREE.Group>(null);
  const groundRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const initial: any[] = [];
    for(let i=0; i<config.flowerCount; i++) {
        const r = 8 * Math.sqrt(Math.random());
        const t = Math.random() * Math.PI * 2;
        initial.push({
            pos: [Math.cos(t)*r, -2, Math.sin(t)*r],
            variant: i % 2 === 0 ? 'lily' : 'peony'
        });
    }
    setPlantedFlowers(initial);
  }, [config.flowerCount]);

  useEffect(() => {
    onPlanted(plantedFlowers.length);
  }, [plantedFlowers.length]);

  useFrame((state) => {
    if (gardenGroupRef.current && config.isRotating && !config.isExploded) {
      gardenGroupRef.current.rotation.y += 0.0015;
    }

    if (config.isPlantingMode && groundRef.current && ringRef.current) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(groundRef.current);
      if (intersects.length > 0) {
        ringRef.current.position.copy(intersects[0].point);
        ringRef.current.visible = true;
      } else {
        ringRef.current.visible = false;
      }
    } else if (ringRef.current) {
        ringRef.current.visible = false;
    }
  });

  const handlePointerDown = (e: any) => {
    if (!config.isPlantingMode || !groundRef.current) return;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(groundRef.current);
    
    if (intersects.length > 0) {
      const center = intersects[0].point;
      const newBatch: any[] = [];
      const densityMultiplier = e.shiftKey ? 2 : 1;
      const count = config.plantingBouquetCount * densityMultiplier;
      
      for(let i=0; i<count; i++) {
          const r = config.plantingRadius * Math.sqrt(Math.random());
          const t = Math.random() * Math.PI * 2;
          newBatch.push({
              pos: [center.x + Math.cos(t)*r, center.y, center.z + Math.sin(t)*r],
              variant: config.activePlantVariant
          });
      }
      setPlantedFlowers(prev => [...prev, ...newBatch]);
    }
  };

  return (
    <>
      {/* 种植参考格子 - 弱对比灰色线条，不反光不参与辉光 */}
      <Grid
        position={[0, -1.995, 0]}
        args={[120, 120]}
        cellSize={2}
        cellThickness={0.6}
        cellColor="#0d1424"
        sectionSize={10}
        sectionThickness={1.2}
        sectionColor="#1a2235"
        fadeDistance={40}
        fadeStrength={1.5}
        infiniteGrid
      />

      <group ref={gardenGroupRef}>
        {plantedFlowers.map((f, i) => (
          <Flower 
            key={i} 
            index={i} 
            position={f.pos} 
            variant={f.variant} 
            config={config} 
            onClick={onSelectFlower}
          />
        ))}
      </group>

      <mesh 
        ref={groundRef} 
        rotation={[-Math.PI/2, 0, 0]} 
        position={[0, -2, 0]} 
        onPointerDown={handlePointerDown}
        visible={false}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh ref={ringRef} rotation={[-Math.PI/2, 0, 0]} position={[0, -1.99, 0]}>
        <ringGeometry args={[config.plantingRadius - 0.05, config.plantingRadius, 64]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
      </mesh>

      <FortuneStick visible={config.isExploded} text={config.blessingText} />
      <ContactShadows opacity={0.5} scale={50} blur={2.5} far={4.5} />
    </>
  );
};

const GardenScene: React.FC<{config: GardenConfig, onPlanted: (n: number)=>void, onSelectFlower: (v: FlowerVariant) => void}> = ({ config, onPlanted, onSelectFlower }) => {
  return (
    <div className="w-full h-full relative">
        <Canvas 
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          camera={{ position: [15, 12, 20], fov: 35 }}
        >
          <color attach="background" args={[config.theme.backgroundColor]} />
          <OrbitControls maxPolarAngle={Math.PI / 2.1} makeDefault />
          <Environment preset="night" />
          <ambientLight intensity={0.5} />
          <spotLight position={[20, 30, 20]} intensity={2.0} color="#D4AF37" />
          
          <SceneContent config={config} onPlanted={onPlanted} onSelectFlower={onSelectFlower} />

          <EffectComposer>
            <Bloom intensity={config.theme.bloomIntensity} luminanceThreshold={0.4} mipmapBlur />
            <Vignette darkness={0.6} />
          </EffectComposer>
        </Canvas>
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center space-x-6 pointer-events-none shadow-2xl">
           <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] text-white/90 font-bold tracking-[0.3em] uppercase">Matrix Garden Active</span>
           </div>
           <div className="h-4 w-[1px] bg-white/10" />
           <span className="text-[10px] text-white/40 uppercase tracking-widest italic">点击花朵查看缠花档案</span>
        </div>
    </div>
  );
};

export default GardenScene;
