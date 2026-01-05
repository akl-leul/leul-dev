import { useRef, useMemo, useState, useEffect, useContext, createContext } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/contexts/ThemeProvider';

// Performance context for use within Three.js scene
interface PerformanceSettings {
  particleCount: number;
  animationSpeed: number;
  enableBloom: boolean;
  enableShadows: boolean;
  maxObjects: number;
}

const defaultSettings: PerformanceSettings = {
  particleCount: 100,
  animationSpeed: 1,
  enableBloom: true,
  enableShadows: true,
  maxObjects: 20,
};

const PerformanceSettingsContext = createContext<PerformanceSettings>(defaultSettings);

// Theme-aware color palettes
const lightThemeColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  highlight: '#f59e0b',
  success: '#10b981',
  background: '#f8fafc',
  particles: '#6366f1',
  lines: '#94a3b8',
};

const darkThemeColors = {
  primary: '#818cf8',
  secondary: '#a78bfa',
  accent: '#f472b6',
  highlight: '#fbbf24',
  success: '#34d399',
  background: '#0f172a',
  particles: '#a78bfa',
  lines: '#475569',
};

// Interactive floating box with hover effect
function InteractiveBox({ 
  position, 
  color, 
  scale = 1, 
  speed = 1,
  hoverColor 
}: { 
  position: [number, number, number]; 
  color: string; 
  scale?: number;
  speed?: number;
  hoverColor: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const settings = useContext(PerformanceSettingsContext);
  
  useFrame((state) => {
    if (meshRef.current) {
      const animSpeed = speed * settings.animationSpeed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * animSpeed * 0.5) * 0.3;
      meshRef.current.rotation.y += 0.005 * animSpeed;
      
      const targetScale = clicked ? scale * 1.3 : hovered ? scale * 1.15 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <Float speed={2 * settings.animationSpeed} rotationIntensity={0.5} floatIntensity={1}>
      <mesh 
        ref={meshRef} 
        position={position} 
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => { setHovered(false); setClicked(false); }}
        onClick={() => setClicked(!clicked)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={hovered ? hoverColor : color} 
          transparent 
          opacity={hovered ? 0.95 : 0.8}
          roughness={0.2}
          metalness={0.3}
          emissive={hovered ? hoverColor : color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>
    </Float>
  );
}

// Interactive glowing sphere
function InteractiveSphere({ 
  position, 
  color, 
  scale = 1,
  hoverColor 
}: { 
  position: [number, number, number]; 
  color: string;
  scale?: number;
  hoverColor: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = position[1];
  const settings = useContext(PerformanceSettingsContext);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 0.8 * settings.animationSpeed) * 0.3;
      
      const targetScale = hovered ? scale * 1.2 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <Float speed={1.5 * settings.animationSpeed} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh 
        ref={meshRef} 
        position={position} 
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, settings.maxObjects > 10 ? 32 : 16, settings.maxObjects > 10 ? 32 : 16]} />
        <meshStandardMaterial 
          color={hovered ? hoverColor : color} 
          emissive={hovered ? hoverColor : color}
          emissiveIntensity={hovered ? 0.8 : 0.5}
          transparent 
          opacity={0.9}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
    </Float>
  );
}

// Connected nodes with proper line rendering
function ConnectedNodes({ colors }: { colors: typeof lightThemeColors }) {
  const groupRef = useRef<THREE.Group>(null);
  const settings = useContext(PerformanceSettingsContext);
  
  const nodes = useMemo(() => [
    { pos: [2, 1.5, 0] as [number, number, number], color: colors.primary },
    { pos: [3, 2.5, -1] as [number, number, number], color: colors.highlight },
    { pos: [2.5, 0.5, -0.5] as [number, number, number], color: colors.success },
    { pos: [4, 1, -2] as [number, number, number], color: colors.accent },
  ], [colors]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 * settings.animationSpeed) * 0.1;
    }
  });

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        positions.push(...nodes[i].pos, ...nodes[j].pos);
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Float key={i} speed={settings.animationSpeed} rotationIntensity={0} floatIntensity={0.5}>
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
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={colors.lines} transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}

// Isometric platform
function IsometricPlatform({ 
  position, 
  size = [2, 0.2, 2], 
  color = '#ffffff' 
}: { 
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const settings = useContext(PerformanceSettingsContext);
  
  return (
    <Float speed={0.5 * settings.animationSpeed} rotationIntensity={0} floatIntensity={0.3}>
      <mesh 
        position={position} 
        rotation={[0, Math.PI / 4, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.8 : 0.6}
          roughness={0.5}
          emissive={color}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
    </Float>
  );
}

// Interactive decorative ring
function DecorativeRing({ 
  position, 
  color,
  hoverColor 
}: { 
  position: [number, number, number];
  color: string;
  hoverColor: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const settings = useContext(PerformanceSettingsContext);
  
  useFrame((state) => {
    if (meshRef.current) {
      const speedMult = (hovered ? 2 : 1) * settings.animationSpeed;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speedMult;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speedMult;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <torusGeometry args={[0.5, 0.1, settings.maxObjects > 10 ? 16 : 8, settings.maxObjects > 10 ? 32 : 16]} />
      <meshStandardMaterial 
        color={hovered ? hoverColor : color} 
        transparent 
        opacity={hovered ? 0.9 : 0.7}
        roughness={0.3}
        metalness={0.5}
        emissive={hovered ? hoverColor : color}
        emissiveIntensity={hovered ? 0.4 : 0.1}
      />
    </mesh>
  );
}

// Particle system that follows mouse
function ParticleSystem({ 
  colors, 
  mousePosition 
}: { 
  colors: typeof lightThemeColors;
  mousePosition: { x: number; y: number };
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const settings = useContext(PerformanceSettingsContext);
  const particleCount = settings.particleCount;
  
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return { positions: pos, velocities: vel };
  }, [particleCount]);

  useFrame(() => {
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position;
      const posArray = posAttr.array as Float32Array;
      const animSpeed = settings.animationSpeed;
      
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i * 3] * animSpeed;
        posArray[i * 3 + 1] += velocities[i * 3 + 1] * animSpeed;
        posArray[i * 3 + 2] += velocities[i * 3 + 2] * animSpeed;
        
        const dx = mousePosition.x * 5 - posArray[i * 3];
        const dy = mousePosition.y * 3 - posArray[i * 3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 4) {
          posArray[i * 3] += dx * 0.005 * animSpeed;
          posArray[i * 3 + 1] += dy * 0.005 * animSpeed;
        }
        
        if (posArray[i * 3] > 8) posArray[i * 3] = -8;
        if (posArray[i * 3] < -8) posArray[i * 3] = 8;
        if (posArray[i * 3 + 1] > 5) posArray[i * 3 + 1] = -5;
        if (posArray[i * 3 + 1] < -5) posArray[i * 3 + 1] = 5;
      }
      
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color={colors.particles}
        size={0.08}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Mouse tracker component
function MouseTracker({ onMouseMove }: { onMouseMove: (pos: { x: number; y: number }) => void }) {
  const { viewport } = useThree();
  
  useFrame(({ mouse }) => {
    onMouseMove({ 
      x: (mouse.x * viewport.width) / 2, 
      y: (mouse.y * viewport.height) / 2 
    });
  });
  
  return null;
}

// Main scene content with theme and performance support
function SceneContent({ isDarkMode }: { isDarkMode: boolean }) {
  const colors = isDarkMode ? darkThemeColors : lightThemeColors;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const settings = useContext(PerformanceSettingsContext);

  const cubePositions = useMemo(() => {
    const count = Math.min(8, settings.maxObjects);
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.sin(i * 1.5) * 4) + (i % 2 === 0 ? 1 : -1),
        (Math.cos(i * 1.2) * 3),
        -2 - (i * 0.5)
      ] as [number, number, number],
      scale: 0.15 + (i * 0.02),
      color: [colors.primary, colors.highlight, colors.success, colors.accent][i % 4]
    }));
  }, [colors, settings.maxObjects]);

  const showExtras = settings.maxObjects > 10;

  return (
    <>
      <MouseTracker onMouseMove={setMousePos} />
      
      {/* Lighting */}
      <ambientLight intensity={isDarkMode ? 0.3 : 0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isDarkMode ? 0.8 : 1} 
        color="#ffffff" 
      />
      <pointLight 
        position={[-5, 5, -5]} 
        intensity={0.5} 
        color={colors.primary} 
      />
      {showExtras && (
        <pointLight 
          position={[5, -5, 5]} 
          intensity={0.3} 
          color={colors.accent} 
        />
      )}

      {/* Particle system */}
      <ParticleSystem colors={colors} mousePosition={mousePos} />

      {/* Interactive floating boxes */}
      <InteractiveBox 
        position={[-3, 2, -2]} 
        color={colors.primary} 
        hoverColor={colors.accent}
        scale={0.8} 
        speed={1.2} 
      />
      <InteractiveBox 
        position={[4, -1, -3]} 
        color={colors.highlight} 
        hoverColor={colors.success}
        scale={0.6} 
        speed={0.8} 
      />
      {showExtras && (
        <>
          <InteractiveBox 
            position={[-2, -2, -1]} 
            color={colors.success} 
            hoverColor={colors.primary}
            scale={0.5} 
            speed={1} 
          />
          <InteractiveBox 
            position={[3, 3, -4]} 
            color={colors.accent} 
            hoverColor={colors.highlight}
            scale={0.7} 
            speed={0.9} 
          />
        </>
      )}

      {/* Interactive glowing spheres */}
      <InteractiveSphere 
        position={[-4, 0, -2]} 
        color={colors.accent} 
        hoverColor={colors.primary}
        scale={0.6} 
      />
      {showExtras && (
        <>
          <InteractiveSphere 
            position={[2, -2, -2]} 
            color={colors.primary} 
            hoverColor={colors.highlight}
            scale={0.4} 
          />
          <InteractiveSphere 
            position={[0, 3, -3]} 
            color={colors.highlight} 
            hoverColor={colors.success}
            scale={0.5} 
          />
        </>
      )}

      {/* Connected nodes network */}
      <ConnectedNodes colors={colors} />

      {/* Isometric platforms */}
      <IsometricPlatform 
        position={[-1, -3, -2]} 
        size={[1.5, 0.15, 1.5]} 
        color={isDarkMode ? '#334155' : '#e2e8f0'} 
      />
      {showExtras && (
        <>
          <IsometricPlatform 
            position={[1, -2.5, -3]} 
            size={[1, 0.1, 1]} 
            color={isDarkMode ? '#475569' : '#f1f5f9'} 
          />
          <IsometricPlatform 
            position={[3, -2, -4]} 
            size={[1.2, 0.12, 1.2]} 
            color={isDarkMode ? '#1e293b' : '#cbd5e1'} 
          />
        </>
      )}

      {/* Interactive decorative rings */}
      <DecorativeRing 
        position={[-3, 1, -4]} 
        color={colors.primary} 
        hoverColor={colors.accent}
      />
      {showExtras && (
        <DecorativeRing 
          position={[4, 2, -2]} 
          color={colors.accent} 
          hoverColor={colors.primary}
        />
      )}

      {/* Small floating cubes with stable positions */}
      {cubePositions.map((cube, i) => (
        <Float key={i} speed={(1 + i * 0.2) * settings.animationSpeed} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={cube.position} scale={cube.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={cube.color} 
              transparent 
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Props for ThreeScene
interface ThreeSceneProps {
  performanceSettings?: PerformanceSettings;
  enabled?: boolean;
}

// Main ThreeScene component
export default function ThreeScene({ 
  performanceSettings = defaultSettings,
  enabled = true 
}: ThreeSceneProps) {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
      <PerformanceSettingsContext.Provider value={performanceSettings}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: performanceSettings.maxObjects > 10, alpha: true }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          eventSource={document.documentElement}
          eventPrefix="client"
        >
          <SceneContent isDarkMode={isDarkMode} />
        </Canvas>
      </PerformanceSettingsContext.Provider>
    </div>
  );
}
