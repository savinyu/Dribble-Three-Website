// https://cydstumpel.nl/

import * as THREE from 'three'
import React, { useRef, useState, createContext, useContext, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Environment, useTexture, RoundedBox } from '@react-three/drei'
import { easing } from 'maath'
import gsap from 'gsap'
import './util'
import Topbar from './Topbar'

export const ClickedContext = createContext(false)

export const App = () => {
  const [clicked, setClicked] = useState(false)
  return (
    <ClickedContext.Provider value={{ clicked, setClicked }}>
      <Topbar/>
      <Canvas camera={{ position: [0, 0, 17], fov: 15 }}>
        <fog attach="fog" args={['#a79', 8.5, 12]} />
        <primitive attach="background" object={new THREE.Color('black')}/>
        <Rig>
          <mesh scale={1}>
            <Carousel />
          </mesh>
        </Rig>
        <mesh scale={1}>
          <Later/>
        </mesh>
      </Canvas>
    </ClickedContext.Provider>
  )
}

function Rig(props) {
  const { clicked } = useContext(ClickedContext);
  const parentRef = useRef()
  const childRef = useRef()

  useFrame((state, delta) => {
    if (!clicked) {
      parentRef.current.rotation.z = THREE.MathUtils.degToRad(-20)
      parentRef.current.rotation.x = THREE.MathUtils.degToRad(10)
      childRef.current.rotation.y += delta * 0.5
      childRef.current.position.set(-.5,-0.5,0)
    } else {
      childRef.current.position.set(0,0,0)
      parentRef.current.rotation.set(0, 0, 0)
      childRef.current.rotation.y = 0
    }
  })

  return (
    <group position={[2.8, .8, 0]} ref={parentRef}>
      <group ref={childRef}>{props.children}</group>
    </group>
  )
}

function Carousel({ radius = 1.4, count = 8 }) {
  const { clicked } = useContext(ClickedContext);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (clicked) {
      itemsRef.current.forEach((ref, i) => {
        if (ref) {
          gsap.to(ref.position, {
            x: i * 1.1 - (count / 2) * 1.8 + 0.1,
            y: -.8,
            z: 0,
            duration: 1,
            ease: 'power2.inOut'
          });
          gsap.to(ref.rotation, {
            y: 0,
            duration: 1,
            ease: 'circ.out'
          });
        }
      });
    } else {
      // Reset animation when clicked is false
      itemsRef.current.forEach((ref, i) => {
        if (ref) {
          gsap.to(ref.position, {
            x: Math.sin((i / count) * Math.PI * 2) * radius,
            y: 0,
            z: Math.cos((i / count) * Math.PI * 2) * radius,
            duration: 1.2,
            ease: 'power2.inOut'
          });
          gsap.to(ref.rotation, {
            y: Math.PI + (i / count) * Math.PI * 2,
            duration: 1.2,
            ease: 'circ.out'
          });
        }
      });
    }
  }, [clicked]);

  return Array.from({ length: count }, (_, i) => (
    <Card
      key={i}
      url={`/img${Math.floor(i % 10) + 1}_.jpg`}
      position={[Math.sin((i / count) * Math.PI * 2) * radius, 0, Math.cos((i / count) * Math.PI * 2) * radius]}
      rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
      ref={(ele) => {
        itemsRef.current[i] = ele;
      }}
    />
  ));
}

const Later = ({ count = 8 }) => {
  const { clicked } = useContext(ClickedContext);
  const elementsRef = useRef([]);

  useEffect(() => {
    if (clicked) {
      elementsRef.current.forEach((el, i) => {
        if (el) {
          // Animate each element from above to its intended position
          gsap.fromTo(el.position, 
            {
              
              y:el.position.y +(10-i*.4)
             }, // Start from above the viewport
            {y:el.position.y, z:0, duration: 1, delay: 0, ease: "power1.out" }
          );
        }
      });
    }
  }, [clicked]);

  if (!clicked) return null;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <group key={i}>
          <FlatCard
            url={`/img${Math.floor(i % 10) + 1}_.jpg`}
            position={[i * 1.1 - (count / 2) * 1.8 + 3.5, 1.6, 0]}
            ref={(el) => elementsRef.current[i * 2] = el} // Reference for GSAP
          />
          <FlatCard
            url={`/img${Math.floor(i % 10) + 1}_.jpg`}
            position={[i * 1.1 - (count / 2) * 1.8 + 3.5, -1.6, 0]}
            ref={(el) => elementsRef.current[i * 2 +1] = el} // Reference for GSAP
          />
        </group>
      ))}
    </>
  );
};


const Card = React.forwardRef(({ url, ...props }, forwardedRef) => {
  const { clicked, setClicked } = useContext(ClickedContext);
  const [hovered, hover] = useState(false);
  
  // Create a local reference for transformations
  const localRef = useRef();

  const pointerOver = (e) => {
    e.stopPropagation();
    hover(true);
  };

  const pointerOut = () => hover(false);

  useFrame((state, delta) => {
    if (localRef.current) {
      // Apply scaling and other transformations using the local ref
      easing.damp3(localRef.current.scale, hovered ? 1.15 : 1, 0.1, delta);
      easing.damp(localRef.current.material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta);
      easing.damp(localRef.current.material, 'zoom', hovered ? 1 : 1.5, 0.2, delta);
    }
  });

  return (
    <Image
      ref={(el) => {
        // Assign the local ref for transformations
        localRef.current = el;
        // Assign the forwarded ref for parent access
        if (typeof forwardedRef === 'function') {
          forwardedRef(el);
        } else if (forwardedRef) {
          forwardedRef.current = el;
        }
      }}
      url={url}
      transparent
      side={THREE.DoubleSide}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      {...props}
      onClick={() => setClicked(true)}
    >
      <bentPlaneGeometry args={clicked ? [0.1, 1, 1.5, 1, 1] : [0.1, 1, 1.5, 20, 20]} />
    </Image>
  );
});


const FlatCard = React.forwardRef(({ url, ...props }, forwardedRef) => {
  const { setClicked } = useContext(ClickedContext);
  const [hovered, hover] = useState(false);
  
  // Create a local reference for transformations
  const localRef = useRef();

  const pointerOver = (e) => {
    e.stopPropagation();
    hover(true);
  };

  const pointerOut = () => hover(false);

  useFrame((state, delta) => {
    if (localRef.current) {
      // Apply scaling and other transformations using the local ref
      easing.damp3(localRef.current.scale, hovered ? 1.15 : 1, 0.1, delta);
      easing.damp(localRef.current.material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta);
      easing.damp(localRef.current.material, 'zoom', hovered ? 1 : 1.5, 0.2, delta);
      easing.damp(localRef.current.position, 'z', hovered ? 0 : -1.5, 0.2, delta*3);
    }
  });

  return (
    <Image
      ref={(el) => {
        // Assign the local ref for transformations
        localRef.current = el;
        // Assign the forwarded ref for parent access
        if (typeof forwardedRef === 'function') {
          forwardedRef(el);
        } else if (forwardedRef) {
          forwardedRef.current = el;
        }
      }}
      url={url}
      transparent
      side={THREE.DoubleSide}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      {...props}
      onClick={() => setClicked(true)}
    >
      <bentPlaneGeometry args={[0.1, 1, 1.5, 1, 1]} />
    </Image>
  );
});



