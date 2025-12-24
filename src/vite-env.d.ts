/// <reference types="vite/client" />

// MediaPipe global types from CDN scripts
interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface Results {
  image: HTMLCanvasElement | HTMLVideoElement;
  multiHandLandmarks?: Landmark[][];
  multiHandedness?: Array<{ score: number; index: number; label: string }>;
}

interface HandsConfig {
  locateFile: (file: string) => string;
}

interface HandsOptions {
  maxNumHands?: number;
  modelComplexity?: number;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

interface HandsInstance {
  setOptions(options: HandsOptions): void;
  onResults(callback: (results: Results) => void): void;
  send(input: { image: HTMLVideoElement | HTMLCanvasElement }): Promise<void>;
  close(): void;
}

interface CameraConfig {
  video: HTMLVideoElement;
  onFrame: () => Promise<void>;
  width?: number;
  height?: number;
}

interface CameraInstance {
  start(): Promise<void>;
  stop(): void;
}

interface DrawingOptions {
  color?: string;
  lineWidth?: number;
  radius?: number;
}

declare global {
  interface Window {
    Hands: new (config: HandsConfig) => HandsInstance;
    Camera: new (video: HTMLVideoElement, config: CameraConfig) => CameraInstance;
    drawConnectors: (
      ctx: CanvasRenderingContext2D,
      landmarks: Landmark[],
      connections: Array<[number, number]>,
      options?: DrawingOptions
    ) => void;
    drawLandmarks: (
      ctx: CanvasRenderingContext2D,
      landmarks: Landmark[],
      options?: DrawingOptions
    ) => void;
    HAND_CONNECTIONS: Array<[number, number]>;
  }
}

export {};
