import { Canvas } from '@react-three/fiber';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Loader2 } from 'lucide-react';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import Museum from './Museum';
import { Controls } from './Controls';
import { DebugPanel } from './DebugPanel';
import { Room } from '../types/Room';

interface ExhibitionGameplayProps {
  room: Room;
  onBackToRoomSelector: () => void;
  onTransitionToInventory?: (objectId: number, cameraPosition: [number, number, number]) => void;
  isFirstEntry?: boolean;
  savedCameraPosition?: [number, number, number] | null;
}

export function ExhibitionGameplay({ room, onBackToRoomSelector, onTransitionToInventory, isFirstEntry = true, savedCameraPosition }: ExhibitionGameplayProps) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [activeKeys] = useState(new Set<string>());
  const [isInteracting, setIsInteracting] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>(savedCameraPosition || room.cameraStartPosition);
  const [videoError, setVideoError] = useState(false);
  const [showDebugButton, setShowDebugButton] = useState(false);
  const [secretCodeSequence, setSecretCodeSequence] = useState<string[]>([]);

  // Debug settings
  const [debugSettings, setDebugSettings] = useState({
    orbitControls: false,
    wireframe: false,
    selectionMode: false,
    showGrid: true,
    lightIntensity: 1.5,
    fogDensity: 0,
    moveSpeed: room.gameplayEngine.settings?.moveSpeed || 3.5
  });

  const handleDebugSettingChange = useCallback((key: string, value: any) => {
    setDebugSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();

      setSecretCodeSequence(prev => {
        const newSequence = [...prev, key].slice(-3);

        if (newSequence.join('') === 'BUG') {
          setShowDebugButton(true);
          return [];
        }

        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (room.gameplayEngine.settings?.showInstructions && isFirstEntry) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setShowInstructions(false);
    }
  }, [room, isFirstEntry]);

  // Check if this is Room 1 (Itamar Assumpção Main Gallery)
  const isRoom1 = room.id === 'itamar-main';

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Video Background for Room 1 */}
      {isRoom1 && !videoError && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
        >
          <source src="https://www.itamarassumpcao.com/assets/videos/estrelas-loop.m4v" type="video/mp4" />
        </video>
      )}
      
      <div className="relative z-10 w-full h-full bg-transparent">
        <Canvas
          shadows
          camera={{ fov: 75, near: 0.1, far: 1000 }}
          style={{ background: isRoom1 && !videoError ? 'transparent' : 'transparent' }}
          performance={{ min: 0.5 }}
          dpr={[1, 2]}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <fog attach="fog" args={['#000000', 0, debugSettings.fogDensity > 0 ? 1 / debugSettings.fogDensity : 1000]} />
          <Suspense fallback={null}>
            <Museum
              room={room}
              isInteracting={isInteracting}
              onInteractionChange={setIsInteracting}
              selectedObjectId={selectedObjectId}
              onObjectSelect={setSelectedObjectId}
              debugSettings={debugSettings}
              onCameraPositionChange={setCameraPosition}
              onTransitionToInventory={onTransitionToInventory}
              cameraPosition={cameraPosition}
              savedCameraPosition={savedCameraPosition}
            />
            <Controls 
              isInteracting={isInteracting} 
              moveSpeed={debugSettings.moveSpeed}
            />
          </Suspense>
        </Canvas>
      </div>
      
      <DebugPanel
        settings={debugSettings}
        onSettingChange={handleDebugSettingChange}
        cameraPosition={cameraPosition}
        selectedObjectId={selectedObjectId}
        showButton={showDebugButton}
      />
      
      <button
        onClick={onBackToRoomSelector}
        className="fixed top-4 left-4 z-40 hover:opacity-70 transition-opacity"
      >
        <img 
          src="https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/Settings-icon.png"
          alt="Settings"
          className="w-16 h-16 object-contain"
          style={{ filter: 'invert(1)' }}
        />
      </button>
      
      {!isInteracting && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <div className="w-2 h-2 bg-white bg-opacity-70 border-2 border-black border-opacity-70 rounded-full"></div>
        </div>
      )}
      
      {!isInteracting && (
        <div className="fixed bottom-4 left-4 grid grid-cols-3 gap-0.5 scale-75 select-none pointer-events-none opacity-90 z-20">
          <div className="col-start-2">
            <div className={`p-1.5 rounded-lg ${activeKeys.has('KeyW') ? 'bg-white text-black' : 'bg-black/50 text-white'} transition-colors duration-100 flex items-center justify-center`}>
              <span className="text-sm font-bold">W</span>
            </div>
          </div>
          <div className="col-start-1 col-end-4 grid grid-cols-3 gap-0.5">
            <div className={`p-1.5 rounded-lg ${activeKeys.has('KeyA') ? 'bg-white text-black' : 'bg-black/50 text-white'} transition-colors duration-100 flex items-center justify-center`}>
              <span className="text-sm font-bold">A</span>
            </div>
            <div className={`p-1.5 rounded-lg ${activeKeys.has('KeyS') ? 'bg-white text-black' : 'bg-black/50 text-white'} transition-colors duration-100 flex items-center justify-center`}>
              <span className="text-sm font-bold">S</span>
            </div>
            <div className={`p-1.5 rounded-lg ${activeKeys.has('KeyD') ? 'bg-white text-black' : 'bg-black/50 text-white'} transition-colors duration-100 flex items-center justify-center`}>
              <span className="text-sm font-bold">D</span>
            </div>
          </div>
        </div>
      )}

      {!isInteracting && (
        <div className="fixed bottom-4 right-4 text-sm text-white pointer-events-none z-20">
          Press <kbd className="px-2 py-0.5 bg-black/50 rounded text-white">ESC</kbd> for mouse cursor
        </div>
      )}
      
      {showInstructions && !isInteracting && room.gameplayEngine.settings?.showInstructions && isFirstEntry && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-black/80 p-4 rounded-lg text-white text-center transition-opacity duration-1000 animate-fade-in max-w-[240px]">
            <div className="space-y-2">
              <p className="flex items-center justify-between gap-4 text-sm">
                <span className="font-bold">Move:</span>
                <span className="font-mono bg-black/60 px-2 py-0.5 rounded">WASD</span>
              </p>
              <p className="flex items-center justify-between gap-4 text-sm">
                <span className="font-bold">Look:</span>
                <span className="font-mono bg-black/60 px-2 py-0.5 rounded">Mouse</span>
              </p>
              <p className="flex items-center justify-between gap-4 text-sm">
                <span className="font-bold">Exit control:</span>
                <span className="font-mono bg-black/60 px-2 py-0.5 rounded">ESC</span>
              </p>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Instructions will hide automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}