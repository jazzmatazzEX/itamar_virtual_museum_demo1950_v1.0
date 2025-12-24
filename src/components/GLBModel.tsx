import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useEffect, useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface MaterialProperties {
  metalness?: number;
  roughness?: number;
  transmission?: number;
  ior?: number;
  thickness?: number;
  transparent?: boolean;
}

interface GLBModelProps {
  url: string;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  fallbackScale?: number;
  materialProperties?: MaterialProperties;
  autoRotate?: boolean;
}

export function GLBModel({
  url,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  fallbackScale = 1,
  materialProperties,
  autoRotate = true
}: GLBModelProps) {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [center, setCenter] = useState<THREE.Vector3>(new THREE.Vector3());

  const loadModel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(url);
      
      // Calculate the bounding box
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const modelCenter = box.getCenter(new THREE.Vector3());
      setCenter(modelCenter);

      // Create a new group to hold the centered model
      const group = new THREE.Group();
      
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false;
          child.receiveShadow = false;

          if (child.material) {
            const applyMaterialProperties = (material: THREE.Material) => {
              if (materialProperties) {
                if (materialProperties.transmission !== undefined && materialProperties.transmission > 0) {
                  const oldMaterial = material as THREE.MeshStandardMaterial;
                  const physicalMaterial = new THREE.MeshPhysicalMaterial({
                    color: oldMaterial.color,
                    map: oldMaterial.map,
                    metalness: materialProperties.metalness ?? 0,
                    roughness: materialProperties.roughness ?? 0.1,
                    transmission: materialProperties.transmission,
                    ior: materialProperties.ior ?? 1.5,
                    thickness: materialProperties.thickness ?? 0.5,
                    transparent: materialProperties.transparent ?? true,
                    side: THREE.DoubleSide
                  });

                  if (child instanceof THREE.Mesh) {
                    child.material = physicalMaterial;
                  }
                  oldMaterial.dispose();
                } else {
                  material.needsUpdate = true;
                  if ('metalness' in material) {
                    (material as THREE.MeshStandardMaterial).metalness = materialProperties.metalness ?? 0;
                  }
                  if ('roughness' in material) {
                    (material as THREE.MeshStandardMaterial).roughness = materialProperties.roughness ?? 1;
                  }
                  if ('transparent' in material) {
                    material.transparent = materialProperties.transparent ?? false;
                  }
                  material.emissive = new THREE.Color(0x000000);
                  (material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
                }
              } else {
                material.needsUpdate = true;
                if ('metalness' in material) {
                  (material as THREE.MeshStandardMaterial).metalness = 0;
                }
                if ('roughness' in material) {
                  (material as THREE.MeshStandardMaterial).roughness = 1;
                }
                material.emissive = new THREE.Color(0x000000);
                (material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
              }
            };

            if (Array.isArray(child.material)) {
              child.material.forEach(material => applyMaterialProperties(material));
            } else {
              applyMaterialProperties(child.material);
            }
          }
        }
      });

      // Center the model by offsetting its position
      gltf.scene.position.sub(modelCenter);
      
      // Add the centered model to the group
      group.add(gltf.scene);
      
      setModel(group);
      setLoading(false);
    } catch (err) {
      console.error('Error loading model:', err);
      setError(err instanceof Error ? err : new Error('Failed to load model'));
      setLoading(false);
    }
  }, [url, materialProperties]);

  useEffect(() => {
    loadModel();

    return () => {
      if (model) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [loadModel, url]);

  useFrame((_, delta) => {
    if (groupRef.current && url.includes('umbigada') && autoRotate) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  if (error) {
    return (
      <group position={position}>
        <mesh scale={fallbackScale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <Html position={[0, 2, 0]} center>
          <div className="bg-black/80 text-white p-2 rounded text-sm whitespace-nowrap">
            Failed to load model: {error.message}
          </div>
        </Html>
      </group>
    );
  }

  if (loading || !model) {
    return (
      <group position={position}>
        <mesh scale={fallbackScale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="yellow" wireframe />
        </mesh>
        <Html position={[0, 2, 0]} center>
          <div className="bg-black/80 text-white p-2 rounded text-sm">
            Loading model...
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive
        object={model}
        scale={scale}
      />
    </group>
  );
}