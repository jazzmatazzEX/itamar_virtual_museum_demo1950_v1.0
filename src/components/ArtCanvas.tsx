import { useRef, useState, useEffect, useMemo } from 'react';
import { TransformControls, Html, useTexture, useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';

interface ArtCanvasProps {
  position: [number, number, number];
  size: [number, number];
  isSelected: boolean;
  onSelect: () => void;
  name: string;
  rotation?: [number, number, number];
}

const textureSettings = {
  'Canvas 1': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/canvas1-min.png',
    maxSize: 512
  },
  'Canvas 3': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/canvas3.png',
    maxSize: 512,
    roughness: 1
  },
  'Canvas 5': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/canvas5_updt.png',
    maxSize: 512,
    roughness: 1
  },
  'Canvas 6': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/Canvas-6_updt.png',
    maxSize: 512,
    roughness: 1
  },
  'Canvas 7': {
    type: 'video',
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/video_umbigada.mp4',
    maxSize: 2048,
    roughness: 1
  },
  'Canvas 8': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/canvas8-min.png',
    maxSize: 512,
    roughness: 1
  },
  'Canvas 9': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/canvas9-min.png',
    maxSize: 512,
    roughness: 1
  },
  'Canvas 10': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/canvas10-min.png',
    maxSize: 512
  },
  'Canvas 11': {
    type: 'video',
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/video_umbigada_2.mp4',
    maxSize: 2048,
    roughness: 1
  },
  'Canvas 12': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/canvas12-min.png',
    maxSize: 2048,
    roughness: 1
  },
  'Canvas 13': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/canvas13-min.png',
    maxSize: 2048,
    roughness: 1
  },
  'Canvas 14': {
    url: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/canvas14-min.png',
    maxSize: 512,
    roughness: 1
  }
};

const sharedMaterials = {
  error: new THREE.MeshStandardMaterial({ 
    color: "#ff0000",
    roughness: 0.8,
    metalness: 0
  }),
  outline: new THREE.LineBasicMaterial({ 
    color: "#fde047", 
    linewidth: 5 
  })
};

export function ArtCanvas({ position, size, isSelected, onSelect, name, rotation = [0, Math.PI / 2, 0] }: ArtCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [textureError, setTextureError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const settings = textureSettings[name as keyof typeof textureSettings];
  
  const videoTexture = settings?.type === 'video' ? useVideoTexture(settings.url) : null;

  const [imageTexture] = useTexture(
    settings && !settings.type ? [settings.url] : ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='],
    (texture) => {
      if (texture) {
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
      }
    },
    (error) => {
      console.error(`Failed to load texture for ${name}:`, error);
      setTextureError(true);
    }
  );

  useEffect(() => {
    if (!settings) {
      setTextureError(true);
    }
  }, [settings]);

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    onSelect();
  };

  const finalRotation = useMemo(() => {
    if (name === 'Canvas 11') {
      return [0, 3 * Math.PI / 2, 0];
    }
    if (name === 'Canvas 10' || name === 'Canvas 14') {
      return [0, Math.PI, 0];
    }
    if (name === 'Canvas 5' || name === 'Canvas 6' || name === 'Canvas 7') {
      return [0, 0, 0];
    }
    return rotation;
  }, [name, rotation]);

  const texture = videoTexture || imageTexture;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        rotation={finalRotation}
        castShadow
        onClick={handleClick}
      >
        <planeGeometry args={size} />
        <meshStandardMaterial 
          color={textureError ? "#ff0000" : "#ffffff"}
          emissive={isSelected ? "#ffffff" : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
          metalness={0}
          roughness={settings?.roughness ?? 0.8}
          map={textureError ? null : texture}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {!texture && !textureError && (
        <lineSegments 
          position={position}
          rotation={finalRotation}
        >
          <edgesGeometry args={[new THREE.PlaneGeometry(...size)]} />
          <primitive object={sharedMaterials.outline} />
        </lineSegments>
      )}

      {isSelected && meshRef.current && (
        <>
          <TransformControls
            object={meshRef.current}
            mode="translate"
            onObjectChange={() => {
              if (meshRef.current) {
                setCurrentPosition([
                  meshRef.current.position.x,
                  meshRef.current.position.y,
                  meshRef.current.position.z
                ]);
              }
            }}
          />
          <Html
            position={[
              currentPosition[0],
              currentPosition[1] + size[1] / 2 + 0.5,
              currentPosition[2]
            ]}
            center
            style={{
              background: 'rgba(0,0,0,0.8)',
              padding: '8px',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          >
            <div>
              <strong>{name}</strong><br />
              x: {currentPosition[0].toFixed(2)}<br />
              y: {currentPosition[1].toFixed(2)}<br />
              z: {currentPosition[2].toFixed(2)}
              {textureError && (
                <div style={{ color: 'red', marginTop: '4px' }}>
                  Texture failed to load
                </div>
              )}
            </div>
          </Html>
        </>
      )}
    </group>
  );
}