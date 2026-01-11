
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { GardenConfig } from '../types';

export type FlowerVariant = 'lily' | 'peony' | 'grass' | 'fern';

interface FlowerProps {
  position: [number, number, number];
  config: GardenConfig;
  index: number;
  variant: FlowerVariant;
  onClick?: (variant: FlowerVariant) => void;
}

const silkVertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float alpha;
  attribute float phase;
  
  varying vec3 vColor;
  varying float vAlpha;
  varying float vGlow;
  
  uniform float uTime;
  uniform float uScale;
  uniform float uExplode;
  uniform float uSway;
  uniform float uSpeed;

  void main() {
    vColor = color;
    vAlpha = alpha;

    vec3 pos = position;
    
    // 底部锚点摆动 (Chan Hua 丝线柔韧性)
    float windStrength = 0.12 * uSway;
    float swayFactor = smoothstep(0.0, 5.0, pos.y);
    float sway = sin(uTime * uSpeed + phase) * swayFactor;
    pos.x += sway * windStrength;
    pos.z += cos(uTime * uSpeed * 0.8 + phase) * windStrength * swayFactor;
    
    // 爆炸效果
    vec3 explosionDir = normalize(pos + vec3(0.0, 1.0, 0.0));
    float boom = pow(uExplode, 0.5) * 15.0; 
    pos += explosionDir * boom;

    // 高处发光 (自发光质感)
    vGlow = smoothstep(2.0, 6.0, pos.y);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    // 高斯泼溅点大小计算
    gl_PointSize = size * uScale * (1.0 - uExplode * 0.4) * (220.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const silkFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vGlow;
  uniform float uExplode;
  uniform sampler2D uCustomTex;
  uniform bool uHasCustomTex;

  void main() {
    // 高斯衰减掩膜 (模拟 Gaussian Splatting)
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float r2 = dot(xy, xy);
    if (r2 > 0.25) discard;

    // 软边缘衰减
    float mask = exp(-18.0 * r2);
    vec3 finalColor = vColor;

    if(uHasCustomTex) {
        vec4 texCol = texture2D(uCustomTex, gl_PointCoord);
        finalColor = mix(finalColor, texCol.rgb, 0.4);
    }

    // 顶部光泽
    finalColor += vec3(1.0, 0.9, 0.7) * vGlow * 0.4;
    
    // 边缘光
    float rim = 1.0 - smoothstep(0.1, 0.25, r2);
    finalColor += vColor * rim * 0.3;

    float alpha = vAlpha * mask * (1.1 - uExplode);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const Flower: React.FC<FlowerProps> = ({ position, config, index, variant, onClick }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const customTexUrl = config.customTextures[variant === 'lily' || variant === 'peony' ? variant : 'lily'];
  const fallback = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  const customTexture = useTexture(customTexUrl || fallback);

  const geometry = useMemo(() => {
    const points: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const alphas: number[] = [];
    const phases: number[] = [];

    const addPoint = (x: number, y: number, z: number, c: THREE.Color, s: number, a: number, ph: number) => {
       points.push(x, y, z);
       colors.push(c.r, c.g, c.b);
       sizes.push(s);
       alphas.push(a);
       phases.push(ph);
    };

    const hScale = config.heightScale;
    const topY = 3.5 * hScale;

    // 主色调：克莱因蓝、金、珠光白
    const kleinBlue = new THREE.Color('#002FA7').convertSRGBToLinear();
    const goldColor = new THREE.Color('#D4AF37').convertSRGBToLinear();
    const pearlWhite = new THREE.Color('#FDFDFD').convertSRGBToLinear();
    const stamenTipGreen = new THREE.Color('#78ab46').convertSRGBToLinear();
    const leafGreen = new THREE.Color('#1a3d1d').convertSRGBToLinear();

    // 茎部 (缠花铜丝芯)
    const stemColor = new THREE.Color(config.theme.stemColor).convertSRGBToLinear();
    for(let i=0; i<40; i++) {
        const u = i/40;
        const x = Math.sin(u * 2 + index) * 0.1 * u;
        const z = Math.cos(u * 2 + index) * 0.1 * u;
        addPoint(x, u * topY, z, stemColor, 0.9, 1.0, index);
    }

    if (variant === 'lily') {
        // 百合：放射状长花瓣 + 极长花蕊 (克莱因蓝)
        for(let p=0; p<6; p++) {
            const pAngle = (p/6) * Math.PI * 2;
            const length = 3.2;
            const density = 60;
            for(let i=0; i<density; i++) {
                const u = i/density;
                const wave = Math.sin(u * 7.0) * 0.25;
                const arch = Math.sin(u * Math.PI) * 1.5;
                const bx = Math.cos(pAngle) * u * length + Math.sin(pAngle) * wave;
                const bz = Math.sin(pAngle) * u * length - Math.cos(pAngle) * wave;
                const by = topY + arch;

                const width = Math.sin(u * Math.PI) * 0.6;
                const rSteps = 16;
                for(let r=0; r<rSteps; r++) {
                    const v = (r/rSteps) - 0.5;
                    const px = bx - Math.sin(pAngle) * v * width;
                    const pz = bz + Math.cos(pAngle) * v * width;
                    
                    let col = kleinBlue.clone();
                    // 渐变效果
                    if(u > 0.5) col.lerp(pearlWhite, (u - 0.5) * 1.5);
                    addPoint(px, by, pz, col, 0.4 + Math.random()*0.4, 0.85, index + p);
                }
            }
        }
        // 花蕊
        for(let s=0; s<5; s++) {
            const sAngle = (s/5) * Math.PI * 2 + 0.4;
            const sLen = 2.6;
            for(let i=0; i<30; i++) {
                const u = i/30;
                const px = Math.cos(sAngle) * u * sLen;
                const pz = Math.sin(sAngle) * u * sLen;
                const py = topY + u * 2.5;
                const isTip = i > 26;
                addPoint(px, py, pz, isTip ? new THREE.Color('#000000') : goldColor, isTip ? 1.8 : 0.5, 1.0, index);
            }
        }
    } else if (variant === 'peony') {
        // 牡丹：金绿色调 + 层叠杯状花瓣
        const layers = 5;
        for(let l=0; l<layers; l++) {
            const petals = 6 + l * 2;
            const radius = 0.5 + l * 0.6;
            for(let p=0; p<petals; p++) {
                const pAngle = (p/petals) * Math.PI * 2 + l;
                const steps = 45;
                for(let i=0; i<steps; i++) {
                    const u = i/steps;
                    const dist = u * radius;
                    const arch = (1.0 - Math.cos(u * Math.PI)) * 1.1;
                    const bx = Math.cos(pAngle) * dist;
                    const bz = Math.sin(pAngle) * dist;
                    const by = topY + l * 0.25 + arch;

                    const width = Math.sin(u * Math.PI) * (0.8 + l * 0.2);
                    const rSteps = 18;
                    for(let r=0; r<rSteps; r++) {
                        const v = (r/rSteps) - 0.5;
                        const px = bx - Math.sin(pAngle) * v * width;
                        const pz = bz + Math.cos(pAngle) * v * width;
                        
                        // 混合金绿色调
                        const col = goldColor.clone().lerp(stamenTipGreen, l/layers * 0.4);
                        if(u > 0.7) col.lerp(pearlWhite, (u-0.7)*2.0);
                        
                        addPoint(px, by, pz, col, 0.5, 0.9, index + l);
                    }
                }
            }
        }
    } else {
        // 其他叶片
        for(let l=0; l<8; l++) {
            const angle = (l/8) * Math.PI * 2;
            for(let i=0; i<30; i++) {
                const u = i/30;
                const px = Math.cos(angle) * u * 2.0;
                const pz = Math.sin(angle) * u * 2.0;
                const py = Math.sin(u * Math.PI) * 0.6;
                addPoint(px, py, pz, leafGreen, 0.4, 0.8, index);
            }
        }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('alpha', new THREE.Float32BufferAttribute(alphas, 1));
    geo.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
    return geo;
  }, [config.theme, config.heightScale, variant, index]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uSpeed.value = config.flowerSpeed;
      materialRef.current.uniforms.uSway.value = config.flowerSpeed;
      materialRef.current.uniforms.uExplode.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uExplode.value,
        config.isExploded ? 1.0 : 0.0,
        0.04
      );
    }
  });

  return (
    <group 
      position={position} 
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(variant);
      }}
    >
      <points geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={silkVertexShader}
          fragmentShader={silkFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uScale: { value: 1.0 },
            uExplode: { value: 0.0 },
            uSway: { value: 1.0 },
            uSpeed: { value: 1.0 },
            uCustomTex: { value: customTexture },
            uHasCustomTex: { value: !!customTexUrl }
          }}
        />
      </points>
      {/* 隐藏的碰撞体，增加点击精确度 */}
      <mesh visible={false}>
        <sphereGeometry args={[2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Flower;
