import { useRef, useState, useEffect } from 'react';
import { TransformControls, Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InteractiveObjectProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  name: string;
}

export function InteractiveObject({ position, size, color, isSelected, onSelect, name }: InteractiveObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentPosition, setCurrentPosition] = useState(position);
  const { scene, camera } = useThree();
  const [outlineColor, setOutlineColor] = useState('#fde047');

  // Colors for transition
  const yellowColor = new THREE.Color('#fde047');
  const blueColor = new THREE.Color('#3b82f6');

  // Distance thresholds
  const maxDistance = 6;
  const minDistance = 2;
  
  const handleClick = (e: THREE.Event) => {
    (e as MouseEvent).stopPropagation();
    onSelect();
  };

  // Check proximity and update color
  useFrame(() => {
    if (!meshRef.current) return;

    const distance = camera.position.distanceTo(meshRef.current.position);

    // Calculate interpolation factor (0 = far/yellow, 1 = near/blue)
    const t = THREE.MathUtils.clamp(
      1 - (distance - minDistance) / (maxDistance - minDistance),
      0,
      1
    );

    // Interpolate between yellow and blue
    const color = new THREE.Color().lerpColors(yellowColor, blueColor, t);
    setOutlineColor(`#${color.getHexString()}`);
  });

  useEffect(() => {
    if (meshRef.current) {
      setCurrentPosition([
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      ]);

      const collisionBox = scene.children.find(child => 
        child instanceof THREE.Mesh && 
        child.geometry instanceof THREE.BoxGeometry &&
        child.material.visible === false &&
        Math.abs(child.position.x - position[0]) < 0.1 &&
        Math.abs(child.position.y - position[1]) < 0.1 &&
        Math.abs(child.position.z - position[2]) < 0.1
      );

      if (collisionBox) {
        collisionBox.position.copy(meshRef.current.position);
      }
    }
  }, [meshRef.current?.position.x, meshRef.current?.position.y, meshRef.current?.position.z, scene, position]);

  return (
    <>
      <group>
        {/* Main black mesh */}
        <mesh
          ref={meshRef}
          position={position}
          castShadow
          onClick={handleClick}
        >
          <boxGeometry args={size} />
          <meshStandardMaterial 
            color="#000000"
            emissive={isSelected ? "#ffffff" : "#000000"}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>

        {/* Outline with proximity color transition */}
        <lineSegments position={position}>
          <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
          <lineBasicMaterial color={outlineColor} linewidth={5} />
        </lineSegments>

        {/* Additional outline for thickness */}
        <lineSegments position={position}>
          <edgesGeometry args={[new THREE.BoxGeometry(
            size[0] + 0.04,
            size[1] + 0.04,
            size[2] + 0.04
          )]} />
          <lineBasicMaterial color={outlineColor} linewidth={5} />
        </lineSegments>
      </group>

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
              currentPosition[1] + size[1] + 0.5,
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
            </div>
          </Html>
        </>
      )}
    </>
  );
}