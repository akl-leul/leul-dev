import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating geometric shapes
function FloatingBox({ position, color, scale = 1, speed = 1 }: { 
  position: [number, number, number]; 
  color: string; 
  scale?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.3;
      meshRef.current.rotation.y += 0.005 * speed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.8}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
    </Float>
  );
}

// Glowing sphere with gradient effect
function GlowingSphere({ position, color, scale = 1 }: { 
  position: [number, number, number]; 
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
          transparent 
          opacity={0.9}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
    </Float>
  );
}

// Connected nodes with lines
function ConnectedNodes() {
  const groupRef = useRef<THREE.Group>(null);
  
  const nodes = useMemo(() => [
    { pos: [2, 1.5, 0] as [number, number, number], color: '#FF6B6B' },
    { pos: [3, 2.5, -1] as [number, number, number], color: '#FFD460' },
    { pos: [2.5, 0.5, -0.5] as [number, number, number], color: '#6BCB77' },
    { pos: [4, 1, -2] as [number, number, number], color: '#4D96FF' },
  ], []);

  const lines = useMemo(() => {
    const points: THREE.Vector3[][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        points.push([
          new THREE.Vector3(...nodes[i].pos),
          new THREE.Vector3(...nodes[j].pos),
        ]);
      }
    }
    return points;
  }, [nodes]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Float key={i} speed={1} rotationIntensity={0} floatIntensity={0.5}>
          <mesh position={node.pos}>
            <octahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial 
              color={node.color} 
              emissive={node.color}
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line[0].toArray(), ...line[1].toArray()])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </line>
      ))}
    </group>
  );
}

// Isometric platform
function IsometricPlatform({ position, size = [2, 0.2, 2], color = '#ffffff' }: { 
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}) {
  return (
    <Float speed={0.5} rotationIntensity={0} floatIntensity={0.3}>
      <mesh position={position} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6}
          roughness={0.5}
        />
      </mesh>
    </Float>
  );
}

// Torus/Ring decoration
function DecorativeRing({ position, color }: { 
  position: [number, number, number];
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[0.5, 0.1, 16, 32]} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.7}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  );
}

// Main scene content
function SceneContent() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4D96FF" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#FF6B6B" />

      {/* Floating boxes */}
      <FloatingBox position={[-3, 2, -2]} color="#FF6B6B" scale={0.8} speed={1.2} />
      <FloatingBox position={[4, -1, -3]} color="#FFD460" scale={0.6} speed={0.8} />
      <FloatingBox position={[-2, -2, -1]} color="#6BCB77" scale={0.5} speed={1} />
      <FloatingBox position={[3, 3, -4]} color="#4D96FF" scale={0.7} speed={0.9} />

      {/* Glowing spheres */}
      <GlowingSphere position={[-4, 0, -2]} color="#E14D2A" scale={0.6} />
      <GlowingSphere position={[2, -2, -2]} color="#FF6B6B" scale={0.4} />
      <GlowingSphere position={[0, 3, -3]} color="#FFD460" scale={0.5} />

      {/* Connected nodes network */}
      <ConnectedNodes />

      {/* Isometric platforms */}
      <IsometricPlatform position={[-1, -3, -2]} size={[1.5, 0.15, 1.5]} color="#e0e0e0" />
      <IsometricPlatform position={[1, -2.5, -3]} size={[1, 0.1, 1]} color="#f0f0f0" />
      <IsometricPlatform position={[3, -2, -4]} size={[1.2, 0.12, 1.2]} color="#d0d0d0" />

      {/* Decorative rings */}
      <DecorativeRing position={[-3, 1, -4]} color="#4D96FF" />
      <DecorativeRing position={[4, 2, -2]} color="#FF6B6B" />

      {/* Small floating cubes */}
      {[...Array(8)].map((_, i) => (
        <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh 
            position={[
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 6,
              -2 - Math.random() * 4
            ]}
            scale={0.1 + Math.random() * 0.15}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={['#FF6B6B', '#FFD460', '#6BCB77', '#4D96FF'][i % 4]} 
              transparent 
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Main ThreeScene component
export default function ThreeScene() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
