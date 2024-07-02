import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
//import { OrbitControls } from '@react-three/drei';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
let path = 'monkey.gltf';

function MyModel(props) { 
  const { camera, gl } = useThree();
  const modelRef = useRef(); 
  const [model, setModel] = useState(null);
  const [dragControl, setDragControl] = useState(null);
  const orbitControl = useRef(null);

  // Загрузка модели
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        const scene = gltf.scene;
        setModel(scene);
      },
      (progress) => {
        console.log(`Loading file: ${(progress.loaded / progress.total * 100)}%`);
      },
      (error) => {
        console.error('An error occurred while loading the GLB file:', error);
      }
    );
  }, []);

  // Состояние масштаба
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState([0, 0, 0]);

  // Обработка события нажатия
  /*const handleClick = () => {
    setScale(scale === 0.1 ? 0.2 : 0.1);
  };*/

  // Применение масштаба
  useFrame(() => {
    if (model) {
      model.scale.set(0.1, 0.1, 0.1);
      model.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
  });

  //перетаскивание
  useEffect(() => {
    if (model) {
      orbitControl.current = new OrbitControls(camera, gl.domElement);
      orbitControl.current.target.set(0, 0, 0);
      orbitControl.current.update();

      const control = new DragControls([model], camera, gl.domElement);
      control.addEventListener('dragstart', () => {
        if(orbitControl.current){orbitControl.current.enabled = false;};
      });
      control.addEventListener('dragend', () => {
        if(orbitControl.current){orbitControl.current.enabled = true;};
      });
      control.addEventListener('change', () => {
        setRotation([model.rotation.x, model.rotation.y, model.rotation.z]);
      });
      setDragControl(control);

      return () => {
        orbitControl.current.dispose();
        dragControl.dispose();
      };
    }
  }, [model, camera, gl]);
 
  return (
    <group {...props} ref={modelRef} >
      {model && <primitive object={model} />}
    </group>
  );
}

function App() {
  return (     
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <MyModel position={[0, 0, 0]}/>
      
    </Canvas> 
  );
}
//onClick={handleClick}
export default App;