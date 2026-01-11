
import React, { useRef } from 'react';
import { Sparkles, Snowflake, Palette, MousePointer2, Upload, RefreshCw, Layers } from 'lucide-react';
import { GardenConfig } from '../types';

interface UIOverlayProps {
  currentConfig: GardenConfig;
  onGenerate: (prompt: string) => Promise<void>;
  onConfigUpdate: (updates: Partial<GardenConfig>) => void;
  onToggleExplosion: () => void;
  isGenerating: boolean;
  plantedCount: number;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ currentConfig, onGenerate, onConfigUpdate, onToggleExplosion, isGenerating, plantedCount }) => {
  const [activeTab, setActiveTab] = React.useState<'craft' | 'plant' | 'dream'>('craft');
  const lilyInputRef = useRef<HTMLInputElement>(null);
  const peonyInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (variant: 'lily' | 'peony', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onConfigUpdate({
          customTextures: {
            ...currentConfig.customTextures,
            [variant]: event.target?.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 text-white overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-4xl font-serif text-gold mb-1">Twining</h1>
        <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">Traditional Chan Hua x Digital Interactive</p>
      </header>

      {/* Main Tabs */}
      <div className="flex mb-6 bg-white/5 rounded-xl p-1 border border-white/5">
        {[
          { id: 'craft', label: 'CRAFT', icon: Palette },
          { id: 'plant', label: 'PLANT', icon: MousePointer2 },
          { id: 'dream', label: 'DREAM', icon: Sparkles }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 flex flex-col items-center justify-center rounded-lg transition-all ${activeTab === tab.id ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <tab.icon className="w-3 h-3 mb-1" />
            <span className="text-[9px] font-bold tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-6">
        {activeTab === 'craft' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <section>
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4 block">Visual Atmosphere</label>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-xs text-white/70">Auto-Rotation</span>
                   <button 
                    onClick={() => onConfigUpdate({ isRotating: !currentConfig.isRotating })}
                    className={`p-1 rounded ${currentConfig.isRotating ? 'bg-gold text-black' : 'bg-white/10 text-white/40'}`}
                   >
                     <RefreshCw className={`w-3 h-3 ${currentConfig.isRotating ? 'animate-spin-slow' : ''}`} />
                   </button>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/40 uppercase"><span>Sway Intensity</span><span>{currentConfig.flowerSpeed.toFixed(1)}x</span></div>
                    <input type="range" min="0" max="3" step="0.1" value={currentConfig.flowerSpeed} onChange={e => onConfigUpdate({flowerSpeed: parseFloat(e.target.value)})} className="w-full accent-gold h-1 bg-white/10 rounded-full appearance-none" />
                </div>
              </div>
            </section>

            <section>
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4 block">Custom Materials</label>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
                    <span className="text-[10px] text-white/60 mb-2">Lily Silk</span>
                    <button 
                      onClick={() => lilyInputRef.current?.click()}
                      className={`w-full py-2 rounded-lg border border-dashed transition-all flex items-center justify-center ${currentConfig.customTextures.lily ? 'border-gold text-gold bg-gold/5' : 'border-white/20 text-white/40 hover:border-gold hover:text-gold'}`}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      <span className="text-[10px]">{currentConfig.customTextures.lily ? 'REPLACE' : 'UPLOAD'}</span>
                    </button>
                    <input ref={lilyInputRef} type="file" hidden accept="image/*" onChange={e => handleFileUpload('lily', e)} />
                 </div>
                 <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
                    <span className="text-[10px] text-white/60 mb-2">Peony Silk</span>
                    <button 
                      onClick={() => peonyInputRef.current?.click()}
                      className={`w-full py-2 rounded-lg border border-dashed transition-all flex items-center justify-center ${currentConfig.customTextures.peony ? 'border-gold text-gold bg-gold/5' : 'border-white/20 text-white/40 hover:border-gold hover:text-gold'}`}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      <span className="text-[10px]">{currentConfig.customTextures.peony ? 'REPLACE' : 'UPLOAD'}</span>
                    </button>
                    <input ref={peonyInputRef} type="file" hidden accept="image/*" onChange={e => handleFileUpload('peony', e)} />
                 </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'plant' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className={`p-4 rounded-xl border transition-all cursor-pointer ${currentConfig.isPlantingMode ? 'bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'bg-white/5 border-white/10'}`} onClick={() => onConfigUpdate({isPlantingMode: !currentConfig.isPlantingMode})}>
               <div className="flex justify-between items-center mb-1">
                 <span className={`text-xs font-bold ${currentConfig.isPlantingMode ? 'text-gold' : 'text-white'}`}>ENABLE PLANTING MODE</span>
                 <div className={`w-2 h-2 rounded-full ${currentConfig.isPlantingMode ? 'bg-gold animate-pulse' : 'bg-white/20'}`} />
               </div>
               <p className="text-[10px] text-white/40 leading-tight">Click the ground to weave clusters of flowers into the garden.</p>
            </div>

            <section className={!currentConfig.isPlantingMode ? 'opacity-30 pointer-events-none' : ''}>
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4 block">Planting Params</label>
              <div className="space-y-6">
                <div className="flex space-x-2">
                   {['lily', 'peony'].map(v => (
                     <button 
                      key={v} 
                      onClick={() => onConfigUpdate({activePlantVariant: v as any})}
                      className={`flex-1 py-2 rounded-lg border text-[10px] font-bold tracking-widest uppercase transition-all ${currentConfig.activePlantVariant === v ? 'border-gold text-gold bg-gold/5' : 'border-white/10 text-white/40 hover:text-white'}`}
                     >
                       {v}
                     </button>
                   ))}
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/40 uppercase"><span>Bouquet Count</span><span>{currentConfig.plantingBouquetCount}</span></div>
                    <input type="range" min="1" max="20" step="1" value={currentConfig.plantingBouquetCount} onChange={e => onConfigUpdate({plantingBouquetCount: parseInt(e.target.value)})} className="w-full accent-gold h-1 bg-white/10 rounded-full appearance-none" />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/40 uppercase"><span>Spread Radius</span><span>{currentConfig.plantingRadius.toFixed(1)}m</span></div>
                    <input type="range" min="0.5" max="5.0" step="0.1" value={currentConfig.plantingRadius} onChange={e => onConfigUpdate({plantingRadius: parseFloat(e.target.value)})} className="w-full accent-gold h-1 bg-white/10 rounded-full appearance-none" />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'dream' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-3">AI Garden Oracle</p>
                <textarea 
                  className="w-full bg-transparent border-none text-sm focus:ring-0 p-0 placeholder:text-white/20 min-h-[100px] resize-none" 
                  placeholder="Describe a mood... 'A royal blue garden with golden sparks in a summer night'"
                  onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onGenerate(e.currentTarget.value); } }}
                />
             </div>
             {isGenerating && <div className="text-gold text-[10px] font-bold tracking-widest animate-pulse flex items-center justify-center"><Layers className="w-3 h-3 mr-2" /> WEAVING THE GARDEN...</div>}
           </div>
        )}
      </div>

      <button 
        onClick={onToggleExplosion}
        className={`w-full py-4 mt-6 rounded-2xl font-serif text-lg tracking-[0.2em] transition-all duration-500 relative overflow-hidden group ${currentConfig.isExploded ? 'bg-white/10 text-white' : 'bg-gold text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'}`}
      >
        <span className="relative z-10">{currentConfig.isExploded ? 'REASSEMBLE' : 'REVEAL SOUL'}</span>
        {!currentConfig.isExploded && <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
      </button>

      <div className="mt-4 text-center">
        <span className="text-[9px] text-white/20 font-mono tracking-tighter uppercase">Garden Statistics: {plantedCount} Elements Active</span>
      </div>
    </div>
  );
};

export default UIOverlay;
