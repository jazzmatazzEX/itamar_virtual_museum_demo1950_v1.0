import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';
import { Room } from '../types/Room';
import { GLBModel } from './GLBModel';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';

interface InventoryGameplayProps {
  room: Room;
  onBackToRoomSelector: () => void;
  onBackToExhibition?: () => void;
  focusedObjectId?: number | null;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  model: string;
  unlocked: boolean;
}

// Mapping from exhibition model IDs to inventory item IDs
const exhibitionToInventoryMap: Record<number, string> = {
  1: 'afrobrasil1',    // Afro Brazilian
  2: 'umbigada6',      // Umbigada drums
  3: 'glasses5'        // Itamar's Glasses
};

// Test inventory items
const inventoryItems: InventoryItem[] = [
  {
    id: 'afrobrasil1',
    name: 'Afro-Brazilian',
    description: 'Itamar Assumpção Museum icon. A combination of a map of Brazil and the African continent, with a star marking São Paulo, where Itamar was born.',
    model: 'afrobrasil',
    unlocked: true
  },
  {
    id: 'tambu2',
    name: 'Tambu',
    description: 'Tambu is the main drum of the batuque de umbigada tradition. It is a large, low-pitched drum made from a hollowed wooden log and covered with a stretched animal hide. Usually placed horizontally and played with the hands, the tambu establishes the rhythmic foundation of the circle, supporting the singing and guiding the movements of the dance.',
    model: 'tambu',
    unlocked: true
  },
  {
    id: 'quinjengue3',
    name: 'Quinjengue',
    description: 'Quinjengue is a smaller drum that forms part of the instrumental ensemble of batuque de umbigada, interacting directly with the tambu. Made from hollowed wood and covered with a stretched animal hide, it has reduced dimensions and a higher-pitched sound, responsible for rhythmic variations and accents that enrich the main rhythm. Played with the hands, its performance complements the deep pulse of the tambu, contributing to the dynamics of the circle, the accompaniment of the singing, and the guidance of the dance.',
    model: 'quinjengue',
    unlocked: true
  },
  {
    id: 'matraca4',
    name: 'Matraca',
    description: 'Matraca is a percussion instrument made up of two wooden pieces struck against each other, used as a complementary rhythmic element in batuque de umbigada and other Afro-Brazilian traditions. With a dry, penetrating sound, the matraca marks the beat and reinforces the rhythmic pulse, helping to maintain the cohesion of the circle. Its simple, hand-played execution supports the singing and the dance, integrating continuously and repetitively into the percussive ensemble.',
    model: 'matraca',
    unlocked: true
  },
  {
    id: 'glasses5',
    name: "Itamar Assumpção's Glasses",
    description: 'Iconic black-framed glasses shaped like hands with blue lenses. Used by Itamar Assumpção, 2000.',
    model: 'glasses',
    unlocked: true
  },
  {
    id: 'umbigada6',
    name: 'Batuque de Umbigada',
    description: 'The batuque de umbigada, also known as tambu or caiumba, is an Afro-Brazilian cultural tradition of Bantu origin that has developed in Brazil since the period of the slavery. The Middle Tietê region, in the western part of the state of São Paulo, is where the batuque de umbigada took shape, with sugarcane and coffee plantations serving as its primary sources of development. This region encompasses several municipalities that, over decades, have managed to keep this tradition alive and that, even after the abolition of slavery, continued to face persecution and the resulting marginalization of its practice. Caiumba is an ancestral gathering and a celebration of life in which the drums act as communicators between the material and spiritual worlds, always interconnected, and as representations of ancestry. When the mulemba/quinjengue, the tambu, the matraca, and the guaiás begin to play, they enact narratives that evoke the sacredness of time.',
    model: 'umbigada',
    unlocked: true
  }
];

// 3D Model Component with rotation control
function RotatableModel({ rotation, position = [0, 0, 0], modelType, scale = 1 }: { rotation: [number, number, number], position?: [number, number, number], modelType: 'afrobrasil' | 'tambu' | 'quinjengue' | 'matraca' | 'glasses' | 'umbigada' | 'cube', scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotation[0];
      groupRef.current.rotation.y = rotation[1];
      groupRef.current.rotation.z = rotation[2];
      groupRef.current.scale.setScalar(scale);
    }
  });

  if (modelType === 'cube') {
    return (
      <group ref={groupRef} position={position}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </group>
    );
  }

  // Get the appropriate model URL based on type
  const getModelUrl = (type: string) => {
    switch (type) {
      case 'afrobrasil':
        return "https://raw.githubusercontent.com/jazzmatazzEX/ita-museum_v0.1/refs/heads/main/afrobrasil.gltf";
      case 'tambu':
        return "https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/tambu.glb";
      case 'quinjengue':
        return "https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/quinjengue.glb";
      case 'matraca':
        return "https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/matraca.glb";
      case 'glasses':
        return "https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/glasses_v2.glb";
      case 'umbigada':
        return "https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/umbigada_v2.glb";
      default:
        return "https://raw.githubusercontent.com/jazzmatazzEX/ita-museum_v0.1/refs/heads/main/afrobrasil.gltf";
    }
  };

  return (
    <group ref={groupRef} position={position}>
      <GLBModel
        url={getModelUrl(modelType)}
        position={[0, 0, 0]}
        scale={0.8}
        autoRotate={false}
      />
    </group>
  );
}

// Hand tracking hook
function useHandTracking() {
  const [hands, setHands] = useState<Results | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchPosition, setPinchPosition] = useState<{ x: number, y: number } | null>(null);
  const [isTwoHandPinching, setIsTwoHandPinching] = useState(false);
  const [twoHandPinchDistance, setTwoHandPinchDistance] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<HandsInstance | null>(null);
  const cameraRef = useRef<CameraInstance | null>(null);

  const initializeHandTracking = useCallback(async () => {
    try {
      if (!videoRef.current) {
        console.error('Video element not available');
        setCameraError('Video element not ready');
        return;
      }

      // First, request camera access directly
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });

        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraError(null);
      } catch (error) {
        console.error('Camera access error:', error);
        setCameraError('Unable to access camera. Please check permissions.');
        return;
      }

      // Wait for video to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if MediaPipe is loaded from CDN
      if (typeof window.Hands === 'undefined') {
        console.error('MediaPipe Hands not loaded from CDN');
        setCameraError('Hand tracking library not loaded. Please refresh the page.');
        return;
      }

      // Initialize MediaPipe Hands using CDN global
      const handsInstance = new window.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      handsInstance.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      handsInstance.onResults((results: Results) => {
        setHands(results);

        // Define canvas elements at the beginning of callback
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement?.getContext('2d');

        // Draw hand tracking on canvas
        if (canvasElement && canvasCtx && results.multiHandLandmarks) {
          if (canvasCtx) {
            // Clear canvas
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            // Draw hand landmarks and connections using CDN globals
            for (const landmarks of results.multiHandLandmarks) {
              window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
                color: '#0000FF',
                lineWidth: 1
              });
              window.drawLandmarks(canvasCtx, landmarks, {
                color: '#FF00FF',
                lineWidth: 2,
                radius: 2
              });
            }

            canvasCtx.restore();
          }
        }

        // Check for pinch gesture
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          const indexTip = landmarks[8];

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const handCount = results.multiHandLandmarks.length;

            if (handCount === 2) {
              // Two-hand pinch detection
              const hand1 = results.multiHandLandmarks[0];
              const hand2 = results.multiHandLandmarks[1];

              const hand1ThumbTip = hand1[4];
              const hand1IndexTip = hand1[8];
              const hand2ThumbTip = hand2[4];
              const hand2IndexTip = hand2[8];

              // Calculate pinch distances for both hands
              const hand1Distance = Math.sqrt(
                Math.pow(hand1ThumbTip.x - hand1IndexTip.x, 2) +
                Math.pow(hand1ThumbTip.y - hand1IndexTip.y, 2)
              );

              const hand2Distance = Math.sqrt(
                Math.pow(hand2ThumbTip.x - hand2IndexTip.x, 2) +
                Math.pow(hand2ThumbTip.y - hand2IndexTip.y, 2)
              );

              const bothHandsPinching = hand1Distance < 0.05 && hand2Distance < 0.05;

              if (bothHandsPinching) {
                // Calculate distance between the two pinch points
                const hand1Center = {
                  x: (hand1ThumbTip.x + hand1IndexTip.x) / 2,
                  y: (hand1ThumbTip.y + hand1IndexTip.y) / 2
                };
                const hand2Center = {
                  x: (hand2ThumbTip.x + hand2IndexTip.x) / 2,
                  y: (hand2ThumbTip.y + hand2IndexTip.y) / 2
                };

                const distanceBetweenHands = Math.sqrt(
                  Math.pow(hand1Center.x - hand2Center.x, 2) +
                  Math.pow(hand1Center.y - hand2Center.y, 2)
                );

                setIsTwoHandPinching(true);
                setTwoHandPinchDistance(distanceBetweenHands);
                setIsPinching(false); // Disable single-hand rotation
                setPinchPosition(null);

                // Draw white circles for both hands
                if (canvasCtx && canvasElement) {
                  // Hand 1 circle
                  const centerX1 = hand1Center.x * canvasElement.width;
                  const centerY1 = hand1Center.y * canvasElement.height;

                  canvasCtx.beginPath();
                  canvasCtx.arc(centerX1, centerY1, 15, 0, 2 * Math.PI);
                  canvasCtx.strokeStyle = '#FFFFFF';
                  canvasCtx.lineWidth = 3;
                  canvasCtx.stroke();

                  // Hand 2 circle
                  const centerX2 = hand2Center.x * canvasElement.width;
                  const centerY2 = hand2Center.y * canvasElement.height;

                  canvasCtx.beginPath();
                  canvasCtx.arc(centerX2, centerY2, 15, 0, 2 * Math.PI);
                  canvasCtx.strokeStyle = '#FFFFFF';
                  canvasCtx.lineWidth = 3;
                  canvasCtx.stroke();

                  // Draw line between hands
                  canvasCtx.beginPath();
                  canvasCtx.moveTo(centerX1, centerY1);
                  canvasCtx.lineTo(centerX2, centerY2);
                  canvasCtx.strokeStyle = '#FFFFFF';
                  canvasCtx.lineWidth = 2;
                  canvasCtx.stroke();
                }
              } else {
                setIsTwoHandPinching(false);
                setTwoHandPinchDistance(0);
              }
            } else if (handCount === 1) {
              // Single-hand pinch detection (for rotation)
              setIsTwoHandPinching(false);
              setTwoHandPinchDistance(0);

              const landmarks = results.multiHandLandmarks[0];
              const thumbTip = landmarks[4];
              const indexTip = landmarks[8];

              // Calculate distance between thumb and index finger
              const distance = Math.sqrt(
                Math.pow(thumbTip.x - indexTip.x, 2) +
                Math.pow(thumbTip.y - indexTip.y, 2)
              );

              const isPinchGesture = distance < 0.05;
              setIsPinching(isPinchGesture);

              if (isPinchGesture) {
                setPinchPosition({
                  x: (thumbTip.x + indexTip.x) / 2,
                  y: (thumbTip.y + indexTip.y) / 2
                });

                // Draw white circle between thumb and index finger when pinching
                if (canvasCtx && canvasElement) {
                  const centerX = ((thumbTip.x + indexTip.x) / 2) * canvasElement.width;
                  const centerY = ((thumbTip.y + indexTip.y) / 2) * canvasElement.height;

                  canvasCtx.beginPath();
                  canvasCtx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
                  canvasCtx.strokeStyle = '#FFFFFF';
                  canvasCtx.lineWidth = 3;
                  canvasCtx.stroke();
                }
              } else {
                setPinchPosition(null);
              }
            } else {
              setIsPinching(false);
              setPinchPosition(null);
              setIsTwoHandPinching(false);
              setTwoHandPinchDistance(0);
            }
          } else {
            setIsPinching(false);
            setPinchPosition(null);
            setIsTwoHandPinching(false);
            setTwoHandPinchDistance(0);
          }
        }
      });

      handsRef.current = handsInstance;

      // Check if Camera utility is loaded from CDN
      if (typeof window.Camera === 'undefined') {
        console.error('MediaPipe Camera utility not loaded from CDN');
        setCameraError('Camera utility not loaded. Please refresh the page.');
        return;
      }

      // Initialize camera with the MediaPipe Camera utility from CDN
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current && videoRef.current.readyState >= 2) {
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch (error) {
              console.error('Error sending frame to MediaPipe:', error);
            }
          }
        },
        width: 1280,
        height: 720
      });

      cameraRef.current = camera;

      // Start the camera loop
      try {
        await camera.start();
        console.log('Hand tracking initialized successfully');
      } catch (error) {
        console.error('Failed to start MediaPipe camera:', error);
        setCameraError('Failed to start hand tracking camera');
      }
    } catch (error) {
      console.error('Failed to initialize hand tracking:', error);
      setCameraError(`Failed to initialize hand tracking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  useEffect(() => {
    initializeHandTracking();

    return () => {
      // Clean up MediaPipe Hands
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }

      // Clean up camera
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (error) {
          console.error('Error stopping camera:', error);
        }
        cameraRef.current = null;
      }

      // Stop all video tracks
      if (videoRef.current) {
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
          });
          videoRef.current.srcObject = null;
        }
        // Pause and reset video
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, [initializeHandTracking]);

  return { hands, isPinching, pinchPosition, isTwoHandPinching, twoHandPinchDistance, videoRef, canvasRef, cameraError };
}

export function InventoryGameplay({ room, onBackToRoomSelector, onBackToExhibition, focusedObjectId }: InventoryGameplayProps) {
  // Determine initial selected item based on focusedObjectId
  const getInitialSelectedItem = () => {
    if (focusedObjectId && exhibitionToInventoryMap[focusedObjectId]) {
      const itemId = exhibitionToInventoryMap[focusedObjectId];
      const foundItem = inventoryItems.find(item => item.id === itemId);
      return foundItem || inventoryItems[0];
    }
    return inventoryItems[0];
  };

  const [selectedItem, setSelectedItem] = useState<InventoryItem>(getInitialSelectedItem());

  // Set initial rotation based on the initial item
  const getInitialRotation = () => {
    const initialItem = getInitialSelectedItem();
    if (initialItem.model === 'tambu') return [0, Math.PI / 2, 0];
    if (initialItem.model === 'umbigada') return [0, Math.PI, 0];
    if (initialItem.model === 'glasses') return [0, Math.PI / 2, 0];
    return [0, 0, 0];
  };
  const [objectRotation, setObjectRotation] = useState<[number, number, number]>(getInitialRotation());
  const [objectScale, setObjectScale] = useState<number>(1);
  const [lastPinchPosition, setLastPinchPosition] = useState<{ x: number, y: number } | null>(null);
  const [initialTwoHandPinchDistance, setInitialTwoHandPinchDistance] = useState<number | null>(null);
  const [lastValidScale, setLastValidScale] = useState<number>(1);
  const [scalingActive, setScalingActive] = useState<boolean>(false);
  const [showHUD, setShowHUD] = useState(true);
  const [activeTab, setActiveTab] = useState<'information' | 'howto'>('information');
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { hands, isPinching, pinchPosition, isTwoHandPinching, twoHandPinchDistance, videoRef, canvasRef, cameraError } = useHandTracking();

  // Check if content is scrollable and update scroll indicator
  const checkScrollIndicator = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const isScrollable = container.scrollHeight > container.clientHeight;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 5;
      setShowScrollIndicator(isScrollable && !isAtBottom);
    }
  }, []);

  // Check scroll indicator when content or tab changes
  useEffect(() => {
    checkScrollIndicator();
    window.addEventListener('resize', checkScrollIndicator);
    return () => window.removeEventListener('resize', checkScrollIndicator);
  }, [selectedItem, activeTab, checkScrollIndicator]);

  // Get default rotation for an item
  const getDefaultRotation = (item: InventoryItem): [number, number, number] => {
    if (item.model === 'tambu') {
      return [0, Math.PI / 2, 0]; // Y+90 degrees for Tambu
    }
    if (item.model === 'umbigada') {
      return [0, Math.PI, 0]; // Y+180 degrees for Umbigada
    }
    if (item.model === 'glasses') {
      return [0, Math.PI / 2, 0]; // Y+90 degrees for Glasses
    }
    return [0, 0, 0];
  };

  // Reset rotation when switching items
  const handleItemSelect = (item: InventoryItem) => {
    if (item.unlocked) {
      setSelectedItem(item);
      setObjectRotation(getDefaultRotation(item)); // Reset rotation for new item
      setObjectScale(1); // Reset scale for new item
      setLastValidScale(1); // Reset last valid scale
      setScalingActive(false); // Reset scaling state
      setInitialTwoHandPinchDistance(null);
    }
  };

  // Handle rotation based on pinch gesture
  useEffect(() => {
    if (isPinching && pinchPosition && lastPinchPosition && !isTwoHandPinching) {
      const deltaX = (pinchPosition.x - lastPinchPosition.x) * 5;
      const deltaY = (pinchPosition.y - lastPinchPosition.y) * 5;
      
      setObjectRotation(prev => [
        prev[0] - deltaY,
        prev[1] - deltaX,
        prev[2]
      ]);
    }
    
    if (isPinching && pinchPosition && !isTwoHandPinching) {
      setLastPinchPosition(pinchPosition);
    } else {
      setLastPinchPosition(null);
    }
  }, [isPinching, pinchPosition, lastPinchPosition, isTwoHandPinching]);

  // Handle scaling based on two-hand pinch gesture
  useEffect(() => {
    if (isTwoHandPinching && twoHandPinchDistance > 0) {
      setScalingActive(true);
      
      if (initialTwoHandPinchDistance === null) {
        // Start of scaling gesture
        setInitialTwoHandPinchDistance(twoHandPinchDistance);
      } else {
        // Calculate scale factor based on distance change
        const scaleFactor = twoHandPinchDistance / initialTwoHandPinchDistance;
        const newScale = Math.max(0.2, Math.min(3.0, scaleFactor)); // Clamp between 0.2x and 3x
        
        // Only update scale if the change is reasonable (prevents random jumps)
        const scaleChange = Math.abs(newScale - lastValidScale);
        const maxAllowedChange = 0.5; // Maximum allowed scale change per frame
        
        if (scaleChange <= maxAllowedChange) {
          setObjectScale(newScale);
          setLastValidScale(newScale);
        } else {
          // If change is too dramatic, keep the last valid scale
          setObjectScale(lastValidScale);
        }
      }
    } else {
      // Only reset if we were actively scaling
      if (scalingActive) {
        setInitialTwoHandPinchDistance(null);
        setScalingActive(false);
        // Keep the current scale as the new baseline
        setLastValidScale(objectScale);
      }
    }
  }, [isTwoHandPinching, twoHandPinchDistance, initialTwoHandPinchDistance, lastValidScale, scalingActive, objectScale]);


  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Camera Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        autoPlay
        playsInline
        muted
        style={{ filter: 'grayscale(100%)' }}
      />
      
      {/* Camera Error Overlay */}
      {cameraError && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-white text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Camera Access Required</h2>
            <p className="mb-4">{cameraError}</p>
            <p className="text-sm text-gray-300">Please allow camera access to use hand tracking</p>
          </div>
        </div>
      )}

      {/* 3D Object in Center */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
          style={{ background: 'transparent' }}
          performance={{ min: 0.5 }}
          dpr={[1, 2]}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <ambientLight intensity={room.lightSettings.ambientIntensity} />
          <directionalLight
            position={room.lightSettings.directionalPosition}
            intensity={room.lightSettings.directionalIntensity}
          />
          <Suspense fallback={null}>
            <RotatableModel
              rotation={objectRotation}
              scale={objectScale}
              modelType={selectedItem.model as 'afrobrasil' | 'tambu' | 'quinjengue' | 'matraca' | 'glasses' | 'cube'}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Hand Tracking Debug Canvas - Always visible */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80 object-cover"
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Navigation Buttons */}
      <div className="fixed top-4 left-4 z-40 flex gap-3">
        <button
          onClick={onBackToRoomSelector}
          className="hover:opacity-70 transition-opacity"
        >
          <img
            src="https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/Settings-icon.png"
            alt="Settings"
            className="w-16 h-16 object-contain"
            style={{ filter: 'invert(1)' }}
          />
        </button>
        {onBackToExhibition && (
          <button
            onClick={onBackToExhibition}
            className="bg-blue-500/80 hover:bg-blue-600/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium backdrop-blur-sm"
          >
            Back to Exhibition
          </button>
        )}
      </div>

      {/* Combined Panel with Tabs */}
      {/* Objects Panel - Left Side */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white w-14 z-20">
        <div className="p-0">
          <div className="text-center mb-3">
            <p className="text-white text-[9px] font-bold leading-tight">INVENTORY</p>
          </div>

          {/* Objects Column - 4 objects vertically */}
          <div className="space-y-3">
            {inventoryItems.map((item) => {
              const getIconUrl = (model: string) => {
                switch (model) {
                  case 'afrobrasil':
                    return 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/icon_1.png';
                  case 'tambu':
                    return 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/icon_2.png';
                  case 'quinjengue':
                    return 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/icon_3.png';
                  case 'matraca':
                    return 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/icon_4.png';
                  case 'glasses':
                    return 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/icon_5.png';
                  case 'umbigada':
                    return 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/icon_7.png';
                  default:
                    return '';
                }
              };

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  disabled={!item.unlocked}
                  className={`
                    relative w-14 h-14 transition-all duration-200
                    ${selectedItem.id === item.id
                      ? 'border-2 border-blue-500'
                      : item.unlocked
                        ? 'border-2 border-transparent hover:border-gray-400'
                        : 'border-2 border-transparent cursor-not-allowed'
                    }
                  `}
                >
                  <img
                    src={getIconUrl(item.model)}
                    alt={item.name}
                    className={`w-full h-full object-contain ${item.unlocked ? 'opacity-100' : 'opacity-30'}`}
                  />
                  {!item.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* Information Panel - Right Side with Tabs */}
      {showHUD && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm text-white border border-blue-500 max-w-xs w-80 z-20">
          {/* Tab Headers */}
          <div className="flex border-b border-blue-500">
            <button
              onClick={() => setActiveTab('information')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === 'information'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              INFORMATION
            </button>
            <button
              onClick={() => setActiveTab('howto')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === 'howto'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              TUTORIAL
            </button>
          </div>
          {/* Tab Content */}
          <div className="p-4 relative">
            {activeTab === 'information' ? (
              /* Information Tab Content */
              <div
                ref={scrollContainerRef}
                onScroll={checkScrollIndicator}
                className="space-y-4 overflow-y-auto max-h-80 pr-2"
              >
                <h2 className="text-xl font-bold">{selectedItem.name}</h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>
            ) : (
              /* How to Use Tab Content */
              <div
                ref={scrollContainerRef}
                onScroll={checkScrollIndicator}
                className="space-y-4 overflow-y-auto max-h-80 pr-2"
              >
                <h3 className="font-bold mb-2">How to Use</h3>
                <ul className="text-xs space-y-1 text-gray-300">
                  <li>• Allow camera access</li>
                  <li>• One-hand pinch: rotate object</li>
                  <li>• Two-hand pinch: scale object</li>
                  <li>• Move hands apart/together to scale</li>
                  <li>• Select objects from left panel</li>
                </ul>
                <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                  <p className="mb-1">
                    <span className="inline-block w-3 h-3 rounded-full mr-2 bg-green-500"></span>
                    {isTwoHandPinching ? 'Two-hand pinch - Scaling object' : 
                     isPinching ? 'One-hand pinch - Rotating object' : 
                     'Ready for gestures'}
                  </p>
                 <p className="text-xs text-gray-500">
                   Scale: {objectScale.toFixed(2)}x
                 </p>
                </div>
              </div>
            )}

            {/* Scroll Indicator */}
            {showScrollIndicator && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none flex items-end justify-center pb-2">
                <div className="animate-bounce">
                  <ChevronDown size={24} className="text-blue-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle HUD Button - Bottom Left Corner */}
      <button
        onClick={() => setShowHUD(!showHUD)}
        className="fixed bottom-4 left-4 z-40 bg-black/80 hover:bg-black/90 backdrop-blur-sm text-white w-14 h-14 flex items-center justify-center rounded-lg transition-colors border border-blue-500/50 hover:border-blue-500"
        title={showHUD ? 'Hide information panel' : 'Show information panel'}
      >
        {showHUD ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}