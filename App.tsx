
import React, { useState, useCallback } from 'react';
import GardenScene from './components/GardenScene';
import UIOverlay from './components/UIOverlay';
import { generateGardenConfig } from './services/geminiService';
import { GardenConfig, DEFAULT_CONFIG } from './types';
import { FlowerVariant } from './components/Flower';
import { X, Info } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<GardenConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plantedCount, setPlantedCount] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<FlowerVariant | null>(null);

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    try {
      const newConfig = await generateGardenConfig(prompt);
      setConfig(prev => ({ 
        ...prev,
        ...newConfig,
        isExploded: false,
        customTextures: prev.customTextures,
        isPlantingMode: prev.isPlantingMode,
        isRotating: prev.isRotating
      }));
    } catch (error) {
      console.error("Error generating garden:", error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleConfigUpdate = useCallback((updates: Partial<GardenConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleExplosion = useCallback(() => {
    setConfig(prev => ({ ...prev, isExploded: !prev.isExploded }));
  }, []);

  const handleSelectFlower = (variant: FlowerVariant) => {
    setSelectedVariant(variant);
  };

  return (
    <div className={`flex w-full h-full bg-deepbg overflow-hidden ${config.fontType === 'serif' ? 'font-serif' : 'font-sans'}`}>
      
      {/* 3D Stage */}
      <div className="flex-1 h-full relative z-0">
        <GardenScene 
          config={config} 
          onPlanted={setPlantedCount} 
          onSelectFlower={handleSelectFlower}
        />

        {/* Selected Flower Detail Modal */}
        {selectedVariant && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0a0a0a]/90 border border-white/10 rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl shadow-black relative">
              <button 
                onClick={() => setSelectedVariant(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="px-3 py-1 rounded-full bg-gold/20 border border-gold/40">
                    <span className="text-[10px] text-gold font-bold tracking-widest uppercase">{selectedVariant} Profile</span>
                  </div>
                  <Info className="w-4 h-4 text-white/20" />
                </div>

                <div className="aspect-square w-full rounded-3xl bg-white/5 mb-8 overflow-hidden border border-white/5 group relative">
                  {config.customTextures[selectedVariant === 'lily' || selectedVariant === 'peony' ? selectedVariant : 'lily'] ? (
                    <img 
                      src={config.customTextures[selectedVariant === 'lily' || selectedVariant === 'peony' ? selectedVariant : 'lily']!} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                      <p className="text-xs uppercase tracking-widest">No Custom Texture Uploaded</p>
                      <p className="text-[9px] mt-2 italic">Showing default procedural silk pattern</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight text-white capitalize">
                    {selectedVariant === 'peony' ? '丹砂牡丹 · 金绿' : '寒露百合 · 克莱因蓝'}
                  </h2>
                  <p className="text-sm text-white/40 leading-relaxed">
                    {selectedVariant === 'peony' 
                      ? '这朵牡丹融合了中国传统的缠花工艺，采用金线勾勒边缘，以多层叠加的点云模拟丝绸的致密纹理，呈现出一种流光溢彩的贵气。' 
                      : '克莱因蓝色的百合象征着极致的宁静与深邃。细长的花蕊由金丝捻制而成，每一处粒子波动都遵循高斯分布，呈现出云雾般的质感。'}
                  </p>
                  <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-white/20">
                    <span>Authentic Chan Hua Digital Engine v2.5</span>
                    <span className="text-gold">ID: #TX-{selectedVariant.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 h-full relative z-10 border-l border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl">
        <UIOverlay 
          currentConfig={config} 
          onGenerate={handleGenerate} 
          onConfigUpdate={handleConfigUpdate}
          isGenerating={isGenerating}
          onToggleExplosion={toggleExplosion}
          plantedCount={plantedCount}
        />
      </div>
    </div>
  );
};

export default App;
