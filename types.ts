
export interface GardenTheme {
  primaryColor: string;
  secondaryColor: string;
  stemColor: string;
  backgroundColor: string;
  bloomIntensity: number;
}

export interface GardenConfig {
  theme: GardenTheme;
  flowerCount: number;
  wildness: number;
  heightScale: number;
  name: string;
  description: string;
  
  // Interactive & Environmental
  snowSpeed: number;
  flowerSpeed: number;
  grassDensity: number;
  grassHeightScale: number;
  fontType: 'serif' | 'sans';
  blessingText: string;
  isExploded: boolean;
  isRotating: boolean;

  // Planting Mode
  isPlantingMode: boolean;
  plantingBouquetCount: number;
  plantingRadius: number;
  activePlantVariant: 'lily' | 'peony';

  // Custom Textures (Base64 or URL)
  customTextures: {
    lily: string | null;
    peony: string | null;
  };
}

export const DEFAULT_CONFIG: GardenConfig = {
  theme: {
    primaryColor: '#002FA7', 
    secondaryColor: '#D4AF37', 
    stemColor: '#D4AF37', 
    backgroundColor: '#000814',
    bloomIntensity: 1.2,
  },
  flowerCount: 16,
  wildness: 0.3,
  heightScale: 1.2,
  name: "Woven Moments",
  description: "A digital interpretation of Chan Hua craftsmanship.",
  
  snowSpeed: 1.0,
  flowerSpeed: 1.0,
  grassDensity: 1.0,
  grassHeightScale: 1.0,
  fontType: 'serif',
  blessingText: "岁岁常欢愉，年年皆胜意",
  isExploded: false,
  isRotating: true,

  isPlantingMode: false,
  plantingBouquetCount: 5,
  plantingRadius: 1.5,
  activePlantVariant: 'lily',

  customTextures: {
    lily: null,
    peony: null,
  }
};
