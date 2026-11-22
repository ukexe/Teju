import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function HeartMesh() {
  const mesh = useRef<THREE.Mesh>(null)
  const shape = useMemo(() => {
    const heart = new THREE.Shape()
    heart.moveTo(0, 0.25)
    heart.bezierCurveTo(0, 0.25, -1.15, -0.45, -1.15, 0.55)
    heart.bezierCurveTo(-1.15, 1.25, -0.35, 1.55, 0, 0.9)
    heart.bezierCurveTo(0.35, 1.55, 1.15, 1.25, 1.15, 0.55)
    heart.bezierCurveTo(1.15, -0.45, 0, 0.25, 0, 0.25)
    return heart
  }, [])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const time = clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(time * 0.5) * 0.38
    mesh.current.rotation.z = Math.sin(time * 0.4) * 0.08 + Math.PI
    mesh.current.position.y = Math.sin(time * 0.8) * 0.12 - 0.15
  })

  return (
    <mesh ref={mesh} scale={0.88} position={[0.15, -0.1, 0.2]}>
      <extrudeGeometry
        args={[
          shape,
          {
            depth: 0.36,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: 0.1,
            bevelThickness: 0.1,
          },
        ]}
      />
      <meshStandardMaterial
        color="#ff6f7d"
        roughness={0.2}
        metalness={0.08}
      />
    </mesh>
  )
}

function FloatingDetails() {
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock, pointer }) => {
    if (!group.current) return
    const time = clock.getElapsedTime()
    group.current.rotation.y = pointer.x * 0.12 + Math.sin(time * 0.2) * 0.08
    group.current.rotation.x = pointer.y * -0.08
  })

  return (
    <group ref={group}>
      <mesh position={[-1.7, 1.15, -0.15]} rotation={[0.4, 0.2, 0.35]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#ffe28a" roughness={0.35} />
      </mesh>
      <mesh position={[1.7, 1.15, -0.2]} rotation={[0.2, 0.4, -0.2]}>
        <torusGeometry args={[0.38, 0.12, 16, 40]} />
        <meshStandardMaterial
          color="#d6b36a"
          roughness={0.25}
          metalness={0.35}
        />
      </mesh>
      <mesh position={[-1.75, -1.15, 0.05]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial color="#bba8f2" roughness={0.3} />
      </mesh>
      <mesh position={[1.72, -1.05, -0.05]} rotation={[0.2, 0.4, 0.65]}>
        <boxGeometry args={[0.62, 0.62, 0.16]} />
        <meshStandardMaterial color="#b7e4d0" roughness={0.4} />
      </mesh>
      <mesh position={[-0.9, 1.82, -0.55]} rotation={[0, 0, -0.22]}>
        <planeGeometry args={[1.08, 0.68]} />
        <meshStandardMaterial color="#fff7ee" roughness={0.9} />
      </mesh>
      <mesh position={[1.05, -1.75, -0.6]} rotation={[0, 0, 0.18]}>
        <planeGeometry args={[1.2, 0.72]} />
        <meshStandardMaterial color="#f6b8c8" roughness={0.85} />
      </mesh>
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 5.8], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 4, 5]} intensity={3.2} color="#fff4e6" />
      <pointLight position={[-3, -2, 2]} intensity={2.2} color="#f6b8c8" />
      <HeartMesh />
      <FloatingDetails />
    </Canvas>
  )
}
