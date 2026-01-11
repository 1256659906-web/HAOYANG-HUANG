import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';

interface FortuneStickProps {
  visible: boolean;
  text: string;
}

const FortuneStick: React.FC<FortuneStickProps> = ({ visible, text }) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Generate the fortune texture dynamically
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background (Silk Paper texture simulation)
      const grad = ctx.createLinearGradient(0, 0, 512, 1024);
      grad.addColorStop(0, '#fdfbf7');
      grad.addColorStop(1, '#e6dace');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 1024);

      // Gold Border
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 20;
      ctx.strokeRect(20, 20, 472, 984);

      // Decorative patterns (simple lines)
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(412, 100);
      ctx.lineWidth = 4;
      ctx.stroke();

      // Text Vertical Layout
      ctx.fillStyle = '#1a1a1a'; // Ink Black
      ctx.font = 'bold 80px "Ma Shan Zheng", serif';
      ctx.textAlign = 'center';
      
      const chars = text.split('');
      const startY = 250;
      const lineHeight = 100;
      
      chars.forEach((char, i) => {
        ctx.fillText(char, 256, startY + (i * lineHeight));
      });
      
      // Stamp
      ctx.fillStyle = '#8a1c1c';
      ctx.fillRect(206, 850, 100, 100);
      ctx.fillStyle = 'white';
      ctx.font = '40px serif';
      ctx.fillText('吉', 256, 915);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
  }, [text]);

  useFrame((state) => {
    if (groupRef.current) {
      // Float animation
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        visible ? 0 + Math.sin(t) * 0.1 : -10,
        0.05
      );
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      
      // Scale animation for appearance
      const targetScale = visible ? 1 : 0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[0, -10, 2]}>
      {/* The Stick/Card */}
      <mesh>
        <boxGeometry args={[3, 6, 0.1]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.4} 
          metalness={0.1} 
        />
      </mesh>
      
      {/* Silk wrapping effect at the top */}
      <mesh position={[0, 3.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 3.2, 16]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
      </mesh>
      
      {/* Hanging Tassel */}
      {visible && (
        <group position={[0, -3.5, 0]}>
             <mesh>
                 <cylinderGeometry args={[0.05, 0.2, 1.5, 8]} />
                 <meshStandardMaterial color="#8a1c1c" />
             </mesh>
        </group>
      )}
    </group>
  );
};

export default FortuneStick;