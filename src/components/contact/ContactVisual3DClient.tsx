"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent
} from "react";
import { Bounds, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils, Mesh, MeshPhysicalMaterial, type Group } from "three";

const modelPath = "/models/puzzle-optimized.glb";
type DragRotationRef = MutableRefObject<{ x: number; y: number }>;

export default function ContactVisual3DClient() {
  const dragRotation = useRef({ x: 0, y: 0 });
  const dragState = useRef({ active: false, lastX: 0, lastY: 0 });

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = {
      active: true,
      lastX: event.clientX,
      lastY: event.clientY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const drag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;

    const dx = event.clientX - dragState.current.lastX;
    const dy = event.clientY - dragState.current.lastY;
    dragRotation.current.y += dx * 0.012;
    dragRotation.current.x = MathUtils.clamp(
      dragRotation.current.x + dy * 0.01,
      -1.1,
      1.1
    );
    dragState.current.lastX = event.clientX;
    dragState.current.lastY = event.clientY;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      onPointerDown={startDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={() => {
        dragState.current.active = false;
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 34 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor("#000000", 0)}
      >
        <ambientLight intensity={0.85} />
        <hemisphereLight intensity={1} groundColor="#f3f7fb" />
        <directionalLight position={[3.5, 4, 5]} intensity={2.4} />
        <directionalLight position={[-3, 1.8, 2.5]} intensity={0.65} />
        <pointLight position={[0.8, 2.2, 3.4]} intensity={1.8} />
        <pointLight position={[-1.6, -0.8, 2.8]} intensity={0.7} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.08}>
            <PuzzleModel dragRotation={dragRotation} />
          </Bounds>
        </Suspense>
      </Canvas>
    </div>
  );
}

function PuzzleModel({ dragRotation }: { dragRotation: DragRotationRef }) {
  const groupRef = useRef<Group | null>(null);
  const autoRotation = useRef(0);
  const { scene } = useGLTF(modelPath);
  const silverMaterial = useMemo(() => {
    const material = new MeshPhysicalMaterial({
      color: "#dfe8e7",
      metalness: 0.08,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.025,
      reflectivity: 1,
      ior: 1.48
    });
    material.envMapIntensity = 2.4;
    return material;
  }, []);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.material = silverMaterial;
      }
    });
  }, [scene, silverMaterial]);

  useEffect(() => {
    return () => silverMaterial.dispose();
  }, [silverMaterial]);

  useFrame(({ pointer }, delta) => {
    if (!groupRef.current) return;

    autoRotation.current += delta * 0.16;
    const baseX = -0.58;
    const baseY = -1.18;
    const baseZ = -0.26;

    groupRef.current.rotation.x = MathUtils.lerp(
      groupRef.current.rotation.x,
      baseX + dragRotation.current.x + pointer.y * 0.16,
      0.08
    );
    groupRef.current.rotation.y = MathUtils.lerp(
      groupRef.current.rotation.y,
      baseY + dragRotation.current.y + autoRotation.current + pointer.x * 0.22,
      0.06
    );
    groupRef.current.rotation.z = MathUtils.lerp(
      groupRef.current.rotation.z,
      baseZ - pointer.x * 0.08,
      0.08
    );
    groupRef.current.position.y = Math.sin(autoRotation.current * 1.2) * 0.04;
  });

  return (
    <group ref={groupRef} rotation={[-0.58, -1.18, -0.26]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(modelPath);
