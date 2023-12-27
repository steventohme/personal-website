import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Steven = ({ position, scale }) => {
  const gltf = useLoader(GLTFLoader, 'steven.glb');
  const meshRef = useRef();
  const [blink, setBlink] = useState(false);

  const blinkIndex = 12;

  useEffect(() => {
    console.log("Model loaded:", gltf);
    const interval = setInterval(() => {
      console.log("Triggering blink");
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [gltf]);

  useFrame(() => {
    if (meshRef.current) {
      const mesh = meshRef.current.getObjectByName('Eyebrow');
      console.log("Mesh:", mesh);
      if (mesh.morphTargetInfluences && mesh.morphTargetInfluences.length > blinkIndex) {
        mesh.morphTargetInfluences[blinkIndex] = blink ? 1 : 0;
      }
    }
  });

  return <primitive object={gltf.scene} position={position} scale={scale} rotation={[0, Math.PI, 0]} ref={meshRef} />;
};

export default Steven;
