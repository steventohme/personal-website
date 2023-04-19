import * as THREE from 'three'
import React, { useEffect, useRef, useState } from 'react'
import {useFrame } from '@react-three/fiber'
import {useGLTF} from '@react-three/drei'
import { a as three } from '@react-spring/three'

export default function TopModel({ open, clicked, hinge,  ...props }) {
    const group = useRef()
  
    const { nodes, materials } = useGLTF('model.glb')
  
    const [hovered, setHovered] = useState(false)
    useEffect(() => void (document.body.style.cursor = hovered ? 'pointer' : 'auto'), [hovered])
  
    useFrame((state) => {
      const t = state.clock.getElapsedTime()
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, !clicked && open ? 0.4 : 0, !clicked && open ? 0.15: 1)
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, !clicked && open ? Math.cos(t / 10) / 10 + 0.25 : 0, !clicked && open ? 0.15: 1)
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, !clicked && open ? (-2 + Math.sin(t)) / 3 : -4.3, !clicked && open ? 0.15: 1)

      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, clicked && open ? 1.09 : 0, 0.15)
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, clicked && open ? -1.3: -4.3, 0.15)
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, clicked && open ? 0.1 : 0, 0.15)
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, clicked && open ? 23.2 : 0,0.15)
      
    })

    return (
      <group
        ref={group}
        {...props}
        onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
        onPointerOut={() => setHovered(false)}
        dispose={null}>
        <three.group rotation-x={hinge} position={[0.1, -0.04, 0.41]}>
          <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={materials.aluminium} geometry={nodes['Cube008'].geometry} />
            <mesh material={materials['matte.001']} geometry={nodes['Cube008_1'].geometry} />
            <mesh material={materials['screen.001']} geometry={nodes['Cube008_2'].geometry} />
          </group>
        </three.group>
      </group>
    )
  }