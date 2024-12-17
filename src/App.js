import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import * as THREE from 'three';

let pathPanel = '/models/collada/Panel.dae';
let pathTank = '/models/collada/untitled.dae';

function MyModel({ position, scale, pathModel }) { 
  const modelRef = useRef(); 
  const [model, setModel] = useState(null);
  const mixerRef = useRef();

  // Загрузка модели
  useEffect(() => {
    const loader = new ColladaLoader();
    loader.load(
      pathModel,
      (collada) => {
        const scene = collada.scene;
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true; // Отбрасывает тени
            child.receiveShadow = true; // Принимает тени
          }
        });
        setModel(scene);

        // Создание AnimationMixer
        mixerRef.current = new THREE.AnimationMixer(scene);
        collada.animations.forEach((clip) => {
          mixerRef.current.clipAction(clip).play(); // Запуск анимации
        });
      },
      (progress) => {
        console.log(`Loading file: ${(progress.loaded / progress.total * 100)}%`);
      },
      (error) => {
        console.error('An error occurred while loading the GLB file:', error);
      }
    );
  }, [pathModel]); // Добавляем pathModel в зависимости

  // Обновление анимации
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta); // Обновляем анимацию
    }
  });

  return model ? (
    <primitive object={model} position={position} scale={scale} ref={modelRef} />
  ) : null;
}

const Scene = () => {
  const { gl } = useThree();

  // Включение теней
  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);

  return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      <directionalLight position={[30,30,30]} castShadow intensity={4} position={[30, 30, 30]} 
        castShadow 
        intensity={4} 
        shadow-mapSize-width={2048} // Увеличиваем ширину shadow map
        shadow-mapSize-height={2048} // Увеличиваем высоту shadow map
        shadow-camera-near={0.5} // Минимальное расстояние для теней
        shadow-camera-far={500} // Максимальное расстояние для теней
        shadow-camera-left={-10} // Левый край камеры
        shadow-camera-right={10} // Правый край камеры
        shadow-camera-top={10} // Верхний край камеры
        shadow-camera-bottom={-10} // Нижний край камеры
        />
      <MyModel pathModel = {pathTank} position={[0, 0, 0]} scale={[1,1,1]} />
      <MyModel pathModel = {pathPanel} position={[0, 0, 0]} scale={[100,100,100]} />
      <OrbitControls />
    </>
  );
}

const App = () => {
  return (     
    <Canvas shadows>
      <Scene/>
    </Canvas> 
  );
}

export default App;
