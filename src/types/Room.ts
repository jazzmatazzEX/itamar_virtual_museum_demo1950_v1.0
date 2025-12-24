import { GameplayEngineConfig } from './GameplayEngine';

export interface ArtCanvasConfig {
  id: number;
  position: [number, number, number];
  size: [number, number];
  name: string;
  rotation?: [number, number, number];
}

export interface InteractiveObjectConfig {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  name: string;
}

export interface MaterialProperties {
  metalness?: number;
  roughness?: number;
  transmission?: number;
  ior?: number;
  thickness?: number;
  transparent?: boolean;
}

export interface GLBModelConfig {
  id: number;
  url: string;
  position: [number, number, number];
  scale: number;
  rotation?: [number, number, number];
  title: string;
  description: string;
  materialProperties?: MaterialProperties;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  gameplayEngine: GameplayEngineConfig;
  artCanvases: ArtCanvasConfig[];
  interactiveObjects: InteractiveObjectConfig[];
  glbModels: GLBModelConfig[];
  cameraStartPosition: [number, number, number];
  lightSettings: {
    ambientIntensity: number;
    directionalIntensity: number;
    directionalPosition: [number, number, number];
  };
}