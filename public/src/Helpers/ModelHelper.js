import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const scenePath = './public/models/scene_final.glb'

export const LoadGLTFByPath = (scene, onProgress) => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/');
      loader.setDRACOLoader(dracoLoader);
  
      loader.load(
        scenePath,
        (gltf) => {
          scene.add(gltf.scene);
          resolve();
        },
        (xhr) => {
          if (onProgress) {
            onProgress(xhr.loaded, xhr.total);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
};