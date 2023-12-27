import React, { useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Steven = ({position, scale}) => {
  const gltf = useLoader(GLTFLoader, 'steven.glb');
  const ref = useRef();

  // Optional: handle animations here if your model has them
  const radians = Math.PI
  return <primitive object={gltf.scene} position={position} scale={scale} rotation={[0,radians,0]} ref={ref} />;
};

export default Steven;