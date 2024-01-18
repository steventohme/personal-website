import React, { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls} from '@react-three/drei'
import { useNavigate } from 'react-router-dom';
import { useSpring } from '@react-spring/core'
import { a as three } from '@react-spring/three'
import { a as web } from '@react-spring/web'
import {Steven} from '../components/steven'

export default function App() {

  return (
    <web.main>
      <web.h1>
        steven tohme
      </web.h1>
      <Canvas camera={{ position: [0, 0, 4], fov: 30}}>
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        <three.pointLight position={[0, 0, 4]} intensity={0.8} />
        <Steven/>
        <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={1.75} far={4.5} />
      </Canvas>
    </web.main>
  )
}
