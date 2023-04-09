import React, { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls} from '@react-three/drei'
import { useNavigate } from 'react-router-dom';
import { useSpring } from '@react-spring/core'
import { a as three } from '@react-spring/three'
import { a as web } from '@react-spring/web'
import TopModel from '../components/Home/TopModel'
import BottomModel from '../components/Home/BottomModel'

export default function App() {
  const [open, setOpen] = useState(false)
  const [clicked, setClicked] = useState(false)
  const props = useSpring({ open: Number(open) })
  const navigate = useNavigate();

  return (
    <web.main style={{ background: props.open.to([0, 1], ['#f0f0f0', '#326750']) }}>
      <web.h1 style={{ opacity: props.open.to([0, 1], [1, 0]), transform: props.open.to((o) => `translate3d(-50%,${o * 50 - 100}px,0)`) }}>
        steven tohme
      </web.h1>
      {/* <web.h2 style={{ opacity: props.open.to([0, 1], [0, 1]), transform: props.open.to((o) => `translate3d(-50%,${o * 50 - 100}px,0)`) }}>
        To navigate, click on the screen.
      </web.h2>
      <web.h3 style={{ opacity: props.open.to([0, 1], [0, 1]), transform: props.open.to((o) => `translate3d(-50%,${o * 50 - 100}px,0)`) }}>
        To close the screen, click on the keyboard.
      </web.h3> */}
      <Canvas camera={{ position: [0, -0.2, -30], fov: 40}}>
        <three.pointLight position={[10, 10, 10]} intensity={1.5} color={props.open.to([0, 1], ['#f0f0f0', '#d25578'])} />
        <Suspense fallback={null}> 
          <group rotation={[0, Math.PI, 0]} onClick={(e) => (e.stopPropagation(), setOpen(!open))}>
              <TopModel clicked={clicked} open={open} hinge={props.open.to([0, 1], [1.575, -0.4])}  />
          </group>
          <group rotation={[0, Math.PI, 0]} onClick={(e) => (e.stopPropagation(), setClicked(!clicked))}>
              <BottomModel clicked={clicked} open={open} navigate={navigate}/>
          </group>
          <Environment preset="city" />
        </Suspense>
        <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={1.75} far={4.5} />
        <OrbitControls/>
      </Canvas>
    </web.main>
  )
}
