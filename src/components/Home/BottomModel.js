import * as THREE from 'three'
import React, { useEffect, useRef, useState } from 'react'
import {useFrame } from '@react-three/fiber'
import {useGLTF} from '@react-three/drei'

export default function BottomModel({ open, clicked, navigate, ...props }) {
    const group = useRef()

    const { nodes, materials } = useGLTF('model.glb')
  
    const [hovered, setHovered] = useState(false)
    useEffect(() => void (document.body.style.cursor = hovered ? 'pointer' : 'auto'), [hovered])

    let changed = false
  
    useFrame((state) => {
      const t = state.clock.getElapsedTime()
      // bounce laptop
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x,  !clicked && open ? 0.4 : 0, !clicked && open ? 0.15: 1)
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x,  !clicked && open ? Math.cos(t / 10) / 10 + 0.25 : 0, !clicked && open ? 0.15:1)
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y,  !clicked && open ? (-4 + Math.sin(t)) / 3 : -4.3, !clicked && open ? 0.15: 1)

      if (clicked && open) {
        if (!changed) {
          group.current.rotation.x = 0
          group.current.position.y = -4.3
          changed = true
        }

        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 2.7, 0.15)
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, 6.6, 0.15)
        group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, -0.1, 0.15)
        group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 23.15,0.15)
      }


      if (group.current.position.z > 23.05) {
        navigate('/intro')
      }
    })

    return (
      <group
        ref={group}
        {...props}
        onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
        onPointerOut={() => setHovered(false)}
        dispose={null}>
        <mesh material={materials.keys} geometry={nodes.keyboard.geometry} position={[1.9, 0, 3.45]} />
        <group position={[0.1, -0.1, 3.39]}>
          <mesh material={materials.aluminium} geometry={nodes['Cube002'].geometry} />
          <mesh material={materials.trackpad} geometry={nodes['Cube002_1'].geometry} />
        </group>
        <mesh material={materials.touchbar} geometry={nodes.touchbar.geometry} position={[0.1, -0.03, 1.2]} />
      </group>
    )
  }