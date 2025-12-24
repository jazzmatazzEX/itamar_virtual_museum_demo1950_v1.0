import { useRef, useState, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { PointerLockControls, OrbitControls, Grid, Html, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { InteractiveObject } from './InteractiveObject';
import { InteractiveObject3D } from './InteractiveObject3D';
import { ArtCanvas } from './ArtCanvas';
import { GLBModel } from './GLBModel';
import { Room } from '../types/Room';

interface MuseumProps {
  room: Room;
  isInteracting: boolean;
  onInteractionChange: (isInteracting: boolean) => void;
  selectedObjectId: number | null;
  onObjectSelect: (id: number | null) => void;
  debugSettings: {
    orbitControls: boolean;
    wireframe: boolean;
    selectionMode: boolean;
    showGrid: boolean;
    lightIntensity: number;
    fogDensity: number;
    moveSpeed: number;
  };
  onCameraPositionChange: (position: [number, number, number]) => void;
  onTransitionToInventory?: (objectId: number, cameraPosition: [number, number, number]) => void;
  cameraPosition: [number, number, number];
  savedCameraPosition?: [number, number, number] | null;
}

const sharedMaterials = {
  invisible: new THREE.MeshBasicMaterial({ 
    visible: false,
    transparent: true,
    opacity: 0
  }),
  floor: new THREE.MeshStandardMaterial({ 
    color: "#000000",
    transparent: true,
    opacity: 0.8
  }),
  outline: new THREE.LineBasicMaterial({ 
    color: "#3b82f6", 
    linewidth: 5 
  })
};

export function Museum({
  room,
  isInteracting,
  onInteractionChange,
  selectedObjectId,
  onObjectSelect,
  debugSettings,
  onCameraPositionChange,
  onTransitionToInventory,
  cameraPosition: currentCameraPosition,
  savedCameraPosition
}: MuseumProps) {
  const { camera, scene, gl } = useThree();
  const lastPosition = useRef(new THREE.Vector3());
  const lastRotation = useRef(new THREE.Euler());
  const orbitRef = useRef<any>();
  const [pointerLockAvailable, setPointerLockAvailable] = useState(true);
  const [pointerLockActive, setPointerLockActive] = useState(false);
  const [pointerLockError, setPointerLockError] = useState<string | null>(null);
  const pointerLockAttempts = useRef(0);
  
  // Add settings reference
  const settings = debugSettings;

  // Update camera position tracking
  useEffect(() => {
    const updateCameraPosition = () => {
      onCameraPositionChange([camera.position.x, camera.position.y, camera.position.z]);
    };
    
    const interval = setInterval(updateCameraPosition, 100);
    return () => clearInterval(interval);
  }, [camera, onCameraPositionChange]);

  const collisionMeshes = useMemo(() => {
    const createCollider = (position: THREE.Vector3, size: THREE.Vector3) => {
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const mesh = new THREE.Mesh(geometry, sharedMaterials.invisible);
      mesh.position.copy(position);
      mesh.userData.isCollider = true;
      return mesh;
    };

    return [
      createCollider(new THREE.Vector3(0, 2.5, -10), new THREE.Vector3(10, 5, 0.2)),
      createCollider(new THREE.Vector3(-10, 2.5, -5), new THREE.Vector3(0.2, 5, 10)),
      createCollider(new THREE.Vector3(-10, 2.5, 5), new THREE.Vector3(0.2, 5, 10)),
      createCollider(new THREE.Vector3(10, 2.5, -5), new THREE.Vector3(0.2, 5, 10)),
      createCollider(new THREE.Vector3(10, 2.5, 5), new THREE.Vector3(0.2, 5, 10)),
      createCollider(new THREE.Vector3(-4, 2.5, 0), new THREE.Vector3(4, 5, 0.2)),
      createCollider(new THREE.Vector3(4, 2.5, 0), new THREE.Vector3(4, 5, 0.2)),
      createCollider(new THREE.Vector3(4.9, 2.5, -5), new THREE.Vector3(0.2, 5, 4.5)),
      createCollider(new THREE.Vector3(-3, 1, 5), new THREE.Vector3(2.5, 2, 2.5)),
      createCollider(new THREE.Vector3(3, 1, 5), new THREE.Vector3(2.5, 2, 2.5)),
      createCollider(new THREE.Vector3(-3, 1, -5), new THREE.Vector3(2.5, 2, 2.5))
    ];
  }, []);

  useEffect(() => {
    collisionMeshes.forEach(mesh => scene.add(mesh));
    return () => {
      collisionMeshes.forEach(mesh => scene.remove(mesh));
    };
  }, [scene, collisionMeshes]);

  useEffect(() => {
    if (!('pointerLockElement' in document)) {
      setPointerLockAvailable(false);
      setPointerLockError('Your browser does not support Pointer Lock API. Using orbit controls instead.');
      return;
    }

    const canvas = gl.domElement;

    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvas;
      setPointerLockActive(isLocked);
      
      if (isLocked) {
        setPointerLockError(null);
        pointerLockAttempts.current = 0;
      }
    };


    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [gl, debugSettings.orbitControls, pointerLockAvailable, pointerLockActive, isInteracting]);

  useEffect(() => {
    if (lastPosition.current.lengthSq() === 0) {
      const startPosition = savedCameraPosition || room.cameraStartPosition;
      camera.position.set(...startPosition);
      lastPosition.current.copy(camera.position);
      lastRotation.current.copy(camera.rotation);
    }
  }, [camera, room.cameraStartPosition, savedCameraPosition]);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.material.wireframe = debugSettings.wireframe;
      }
    });
  }, [scene, debugSettings.wireframe]);

  useEffect(() => {
    if (debugSettings.orbitControls) {
      if (!lastPosition.current.equals(new THREE.Vector3())) {
        lastPosition.current.copy(camera.position);
        lastRotation.current.copy(camera.rotation);
      }
      camera.position.set(0, 10, 20);
    } else {
      if (lastPosition.current.lengthSq() > 0) {
        camera.position.copy(lastPosition.current);
        camera.rotation.copy(lastRotation.current);
      }
    }
  }, [debugSettings.orbitControls, camera]);

  useEffect(() => {
    if (!debugSettings.selectionMode) {
      onObjectSelect(null);
    }
  }, [debugSettings.selectionMode, onObjectSelect]);

  const handleObjectSelect = (id: number) => {
    if (!debugSettings.selectionMode) return;
    onObjectSelect(id === selectedObjectId ? null : id);
  };

  const handleBackgroundClick = (e: THREE.Event) => {
    if ((e as MouseEvent).stopPropagation) {
      (e as MouseEvent).stopPropagation();
      onObjectSelect(null);
    }
  };


  return (
    <>
      {(!pointerLockAvailable || debugSettings.orbitControls) ? (
        <OrbitControls
          ref={orbitRef}
          minDistance={5}
          maxDistance={30}
          enableDamping={true}
          dampingFactor={0.8}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
          target={new THREE.Vector3(0, 0, 0)}
          enabled={!selectedObjectId && !isInteracting}
        />
      ) : (
        <PointerLockControls makeDefault enabled={!isInteracting && pointerLockAvailable} />
      )}

      <ambientLight intensity={room.lightSettings.ambientIntensity} />
      <directionalLight
        position={room.lightSettings.directionalPosition}
        intensity={debugSettings.lightIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>

      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[30, 30]} />
        <primitive object={sharedMaterials.floor} />
      </mesh>

      {debugSettings.showGrid && (
        <Grid
          position={[0, 0.02, 0]}
          args={[30, 30]}
          cellSize={1}
          cellThickness={1.5}
          cellColor="#ec4899"
          sectionSize={5}
          sectionThickness={2}
          sectionColor="#ec4899"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}

      <Preload all />

      {room.glbModels.map((model) => (
        <InteractiveObject3D
          key={model.id}
          position={model.position}
          title={model.title}
          description={model.description}
          onInteractionChange={onInteractionChange}
          disableInspection={model.title === "Batuque de Umbigada" || model.title === "Afro Brazilian" || model.title === "Itamar Assumpção's Glasses"}
          onObjectClick={onTransitionToInventory ? () => onTransitionToInventory(model.id, currentCameraPosition) : undefined}
        >
          <GLBModel
            url={model.url}
            position={[0, 0, 0]}
            scale={model.scale}
            rotation={model.rotation}
            materialProperties={model.materialProperties}
          />
          {model.title === "Itamar Assumpção's Glasses" && (
            <>
              <pointLight
                position={[0, -0.5, 0]}
                intensity={2.5}
                distance={2}
                color="#ffffff"
                castShadow={false}
              />
              <pointLight
                position={[0, 0.5, 0]}
                intensity={1.5}
                distance={1.5}
                color="#ffffff"
                castShadow={false}
              />
            </>
          )}
        </InteractiveObject3D>
      ))}

      {room.artCanvases.map((canvas) => (
        <ArtCanvas
          key={canvas.id}
          position={canvas.position}
          size={canvas.size}
          isSelected={selectedObjectId === canvas.id}
          onSelect={() => handleObjectSelect(canvas.id)}
          name={canvas.name}
          rotation={canvas.rotation}
        />
      ))}

      {room.interactiveObjects.map((obj) => (
        <InteractiveObject
          key={obj.id}
          position={obj.position}
          size={obj.size}
          color={obj.color}
          isSelected={selectedObjectId === obj.id}
          onSelect={() => handleObjectSelect(obj.id)}
          name={obj.name}
        />
      ))}

      {pointerLockError && (
        <Html
          center
          position={[0, 2, -5]}
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'system-ui',
            pointerEvents: 'none'
          }}
        >
          {pointerLockError}
        </Html>
      )}
    </>
  );
}

export default Museum;