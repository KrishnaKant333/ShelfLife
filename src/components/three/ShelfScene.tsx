"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Shelf() {
  return (
    <group>
      {/* Back panel */}
      <mesh position={[0, 0.8, -0.35]}>
        <boxGeometry args={[5.5, 4.5, 0.2]} />
        <meshStandardMaterial color="#30472c" />
      </mesh>

      {/* Top shelf */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[5.5, 0.2, 1]} />
        <meshStandardMaterial color="#526b4c" />
      </mesh>

      {/* Middle shelf */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[5.5, 0.2, 1]} />
        <meshStandardMaterial color="#526b4c" />
      </mesh>

      {/* Bottom shelf */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[5.5, 0.2, 1]} />
        <meshStandardMaterial color="#526b4c" />
      </mesh>

      {/* Left support */}
      <mesh position={[-2.65, 0.5, 0]}>
        <boxGeometry args={[0.2, 5, 1]} />
        <meshStandardMaterial color="#30472c" />
      </mesh>

      {/* Right support */}
      <mesh position={[2.65, 0.5, 0]}>
        <boxGeometry args={[0.2, 5, 1]} />
        <meshStandardMaterial color="#30472c" />
      </mesh>
    </group>
  );
}

function Products() {
  return (
    <group>
      {/* Milk */}
      <mesh position={[-1.5, 1.05, 0]}>
        <boxGeometry args={[0.7, 1, 0.7]} />
        <meshStandardMaterial color="#e8eee3" />
      </mesh>

      {/* Jar */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.9, 32]} />
        <meshStandardMaterial color="#879d78" />
      </mesh>

      {/* Bottle */}
      <mesh position={[1.5, 1.15, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 1.2, 32]} />
        <meshStandardMaterial color="#d8e1d2" />
      </mesh>

      {/* Lower shelf products */}
      <mesh position={[-1.5, -0.35, 0]}>
        <boxGeometry args={[0.9, 0.8, 0.8]} />
        <meshStandardMaterial color="#718866" />
      </mesh>

      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 32]} />
        <meshStandardMaterial color="#b7c7ad" />
      </mesh>

      <mesh position={[1.4, -0.3, 0]}>
        <boxGeometry args={[0.8, 0.9, 0.8]} />
        <meshStandardMaterial color="#607b59" />
      </mesh>
    </group>
  );
}

export default function ShelfScene() {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 1, 7], fov: 45 }}>
        <ambientLight intensity={1.5} />

        <directionalLight
          position={[3, 5, 4]}
          intensity={2}
        />

        <Shelf />
        <Products />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}