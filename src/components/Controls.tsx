import { useRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ControlsProps {
  isInteracting?: boolean;
  moveSpeed?: number;
}

export function Controls({ isInteracting = false, moveSpeed = 3.5 }: ControlsProps) {
  const { camera, scene } = useThree();
  
  // Settings with configurable move speed
  const settings = {
    moveSpeed: moveSpeed,
    acceleration: 15.0,
    deceleration: 8.0,
    collisionDistance: 0.5,
    wallSlideForce: 0.98
  };
  
  const velocity = useRef(new THREE.Vector3());
  const targetVelocity = useRef(new THREE.Vector3());
  const lastTime = useRef(performance.now());
  const activeKeys = useRef(new Set<string>());
  const collisionNormal = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  
  // Memoize direction vectors
  const directions = useMemo(() => ({
    forward: new THREE.Vector3(),
    right: new THREE.Vector3(),
    temp: new THREE.Vector3()
  }), []);

  // Memoize ray directions
  const rays = useMemo(() => [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(1, 0, 1).normalize(),
    new THREE.Vector3(-1, 0, 1).normalize(),
    new THREE.Vector3(1, 0, -1).normalize(),
    new THREE.Vector3(-1, 0, -1).normalize(),
  ], []);

  const checkCollision = (newPosition: THREE.Vector3) => {
    const colliders = scene.children.filter(child => 
      child instanceof THREE.Mesh && 
      child.material instanceof THREE.MeshBasicMaterial &&
      !child.material.visible
    );

    let hasCollision = false;
    collisionNormal.current.set(0, 0, 0);
    
    for (const direction of rays) {
      raycaster.current.set(newPosition, direction);
      const intersects = raycaster.current.intersectObjects(colliders);
      
      if (intersects.length > 0 && intersects[0].distance < settings.collisionDistance) {
        hasCollision = true;
        if (intersects[0].face) {
          const point = intersects[0].point;
          const pushDirection = new THREE.Vector3().subVectors(newPosition, point).normalize();
          collisionNormal.current.add(pushDirection);
        }
      }
    }
    
    if (hasCollision) {
      collisionNormal.current.normalize();
      
      const dot = velocity.current.dot(collisionNormal.current);
      
      if (dot < 0) {
        const pushBack = collisionNormal.current.clone().multiplyScalar(dot);
        velocity.current.sub(pushBack);
        
        const parallelVelocity = velocity.current.clone().projectOnPlane(collisionNormal.current);
        velocity.current.copy(parallelVelocity);
        
        velocity.current.multiplyScalar(settings.wallSlideForce);
      }
      
      const pushDistance = settings.collisionDistance - 0.05;
      newPosition.add(collisionNormal.current.multiplyScalar(pushDistance));
      
      return true;
    }
    return false;
  };

  const updateTargetVelocity = () => {
    if (isInteracting) {
      targetVelocity.current.set(0, 0, 0);
      return;
    }

    targetVelocity.current.set(0, 0, 0);
    
    directions.forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    directions.forward.y = 0;
    directions.forward.normalize();
    
    directions.right.set(-1, 0, 0).applyQuaternion(camera.quaternion);
    directions.right.y = 0;
    directions.right.normalize();

    if (activeKeys.current.has('KeyW')) targetVelocity.current.add(directions.forward.multiplyScalar(settings.moveSpeed));
    if (activeKeys.current.has('KeyS')) targetVelocity.current.sub(directions.forward.multiplyScalar(settings.moveSpeed));
    if (activeKeys.current.has('KeyA')) targetVelocity.current.add(directions.right.multiplyScalar(settings.moveSpeed));
    if (activeKeys.current.has('KeyD')) targetVelocity.current.sub(directions.right.multiplyScalar(settings.moveSpeed));

    if (targetVelocity.current.lengthSq() > settings.moveSpeed * settings.moveSpeed) {
      targetVelocity.current.normalize().multiplyScalar(settings.moveSpeed);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isInteracting) {
      activeKeys.current.add(event.code);
      updateTargetVelocity();
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    activeKeys.current.delete(event.code);
    updateTargetVelocity();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, isInteracting]);

  // Throttled animation frame
  useEffect(() => {
    let frameId: number;
    let lastFrameTime = performance.now();
    const targetFrameTime = 1000 / 60; // Target 60 FPS

    const animate = () => {
      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - lastTime.current) / 1000, 0.1);
      const timeSinceLastFrame = currentTime - lastFrameTime;

      if (timeSinceLastFrame >= targetFrameTime) {
        lastFrameTime = currentTime;
        lastTime.current = currentTime;

        if (targetVelocity.current.lengthSq() > 0) {
          const lerpFactor = 1 - Math.exp(-settings.acceleration * deltaTime);
          velocity.current.lerp(targetVelocity.current, lerpFactor);
        } else {
          const decelerationFactor = Math.exp(-settings.deceleration * deltaTime);
          velocity.current.multiplyScalar(decelerationFactor);
        }

        if (velocity.current.lengthSq() > 0.0001 && !isInteracting) {
          const newPosition = camera.position.clone().add(
            velocity.current.clone().multiplyScalar(deltaTime)
          );
          
          if (!checkCollision(newPosition)) {
            camera.position.copy(newPosition);
          }
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [camera, isInteracting]);

  return null;
}