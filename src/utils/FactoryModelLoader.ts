import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class FactoryModelLoaderService {
  private loader: GLTFLoader;
  private cache: Map<string, THREE.Group> = new Map();
  private loadingPromises: Map<string, Promise<THREE.Group>> = new Map();

  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * Loads a GLB model by name from /models/factory/{name}.glb
   */
  public async loadModel(modelName: string): Promise<THREE.Group> {
    const cleanName = modelName.endsWith('.glb') ? modelName.slice(0, -4) : modelName;
    
    if (this.cache.has(cleanName)) {
      return this.cloneModel(cleanName)!;
    }

    if (this.loadingPromises.has(cleanName)) {
      const original = await this.loadingPromises.get(cleanName)!;
      return this.cloneGroup(original);
    }

    let url = `/models/factory/${cleanName}.glb`;
    if (cleanName.toLowerCase() === 'maquina-bihler' || cleanName.toLowerCase() === 'bihler') {
      url = '/models/Maquina-bihler.glb';
    } else if (cleanName.toLowerCase() === 'palet' || cleanName.toLowerCase() === 'pallet') {
      url = '/models/palet.glb';
    } else if (cleanName.toLowerCase() === 'placa-setor' || cleanName.toLowerCase().includes('placa')) {
      url = '/models/placa-setor.glb';
    } else if (cleanName.toLowerCase() === 'painel' || cleanName.toLowerCase() === 'paineleletrico') {
      url = '/models/painel.glb';
    } else if (cleanName.toLowerCase() === 'desbobinador' || cleanName.toLowerCase().includes('desbobinador')) {
      url = '/models/desbobinador.glb';
    } else if (cleanName.toLowerCase() === 'mesa' || cleanName.toLowerCase() === 'mesa-trabalho') {
      url = '/models/mesa.glb';
    } else if (cleanName === 'furadeira' || cleanName === 'old_drill_press') {
      url = '/models/factory/furadeira/old_drill_press.gltf';
    } else if (cleanName === 'mesamadeira' || cleanName === 'small_wooden_table_01') {
      url = '/models/factory/mesamadeira/small_wooden_table_01.gltf';
    } else if (cleanName === 'carroferramenta' || cleanName === 'tool_cart') {
      url = '/models/factory/carroferramenta/tool_cart.gltf';
    }
    const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const group = gltf.scene;
          group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material) {
                const applyMat = (m: THREE.Material) => {
                  if ('roughness' in m) (m as THREE.MeshStandardMaterial).roughness = 0.45;
                  if ('metalness' in m) (m as THREE.MeshStandardMaterial).metalness = 0.25;
                };
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach(applyMat);
                } else {
                  applyMat(mesh.material);
                }
              }
            }
          });
          this.cache.set(cleanName, group);
          resolve(group);
        },
        undefined,
        (error) => {
          console.warn(`[FactoryModelLoader] Could not load model "${cleanName}":`, error);
          // Return a fallback placeholder group so the scene does not break
          const fallback = new THREE.Group();
          this.cache.set(cleanName, fallback);
          resolve(fallback);
        }
      );
    });

    this.loadingPromises.set(cleanName, loadPromise);
    const loaded = await loadPromise;
    return this.cloneGroup(loaded);
  }

  /**
   * Synchronously gets a cloned model if already cached, or null
   */
  public getModel(modelName: string): THREE.Group | null {
    const cleanName = modelName.endsWith('.glb') ? modelName.slice(0, -4) : modelName;
    return this.cloneModel(cleanName);
  }

  /**
   * Preload a list of models
   */
  public async preloadCommonModels(): Promise<void> {
    const commonList = [
      'parede',
      'cnc-completo',
      'furadeira',
      'empilhadeira',
      'carroferramenta',
      'maquina-bihler',
      'painel',
      'desbobinador',
      'mesa',
      'palet',
      'placa-setor',
      'box-large',
      'box-small',
      'cone'
    ];

    await Promise.all(commonList.map((m) => this.loadModel(m)));
    console.log(`[FactoryModelLoader] Preloaded ${commonList.length} active 3D models into memory.`);
  }

  private cloneModel(name: string): THREE.Group | null {
    const original = this.cache.get(name);
    if (!original) return null;
    return this.cloneGroup(original);
  }

  private cloneGroup(source: THREE.Group): THREE.Group {
    const clone = source.clone(true) as THREE.Group;
    // Deep clone materials so highlights/animations don't conflict across instances
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
        }
      }
    });
    return clone;
  }
}

export const FactoryModelLoader = new FactoryModelLoaderService();
