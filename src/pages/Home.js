import React, { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls} from '@react-three/drei'
import { useNavigate } from 'react-router-dom';
import { useSpring } from '@react-spring/core'
import { a as three } from '@react-spring/three'
import { a as web } from '@react-spring/web'
import TopModel from '../components/Home/TopModel'
import BottomModel from '../components/Home/BottomModel'
import {Steven} from '../components/Home/steven'

export default function App() {
  const [open, setOpen] = useState(false)
  const [clicked, setClicked] = useState(false)
  const props = useSpring({ open: Number(open) })
  const navigate = useNavigate();

  return (
    <web.main>
      <web.h1 style={{ opacity: props.open.to([0, 1], [1, 0]), transform: props.open.to((o) => `translate3d(-50%,${o * 50 - 100}px,0)`) }}>
        steven tohme
      </web.h1>
      <Canvas camera={{ position: [0, 0, 4], fov: 30}}>
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        <three.pointLight position={[0, 0, 4]} intensity={0.8} />
        <Steven/>
        {/* <Suspense fallback={null}> 
          <group rotation={[0, Math.PI, 0]} onClick={(e) => (e.stopPropagation(), setOpen(!open))}>
              <TopModel clicked={clicked} open={open} hinge={props.open.to([0, 1], [1.575, -0.4])}  />
          </group>
          <group rotation={[0, Math.PI, 0]} onClick={(e) => (e.stopPropagation(), setClicked(!clicked))}>
              <BottomModel clicked={clicked} open={open} navigate={navigate}/>
          </group>
          <Environment preset="city" />
        </Suspense> */}
        <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={1.75} far={4.5} />
      </Canvas>
    </web.main>
  )
}
