import * as THREE from 'three';
import { Machine, Sector, MachineStatus, FactoryRoute } from '../../types/industrial';
import { FactoryModelLoader } from '../../utils/FactoryModelLoader';

/**
 * Interface representing the state of internal factory scene objects.
 */
export interface SceneObjectsMap {
  /** Map of machine groups indexed by machine ID */
  machineMeshes: Map<string, THREE.Group>;
  /** Map of andon towers (reserved for andon system) */
  machineAndons: Map<string, { green: THREE.Mesh; amber: THREE.Mesh; red: THREE.Mesh; pointLight: THREE.PointLight }>;
  /** Generic animated parts */
  animatedParts: Map<string, { type: string; object: THREE.Object3D; basePos: THREE.Vector3; speed: number }>;
  /** Group containing safety route lines */
  routeLineGroup: THREE.Group;
  /** Group containing sector floor zones, demarcation lines and badges */
  sectorGroup: THREE.Group;
  /** Group containing 3D floating labels */
  labelsGroup: THREE.Group;
  /** Humanoid avatar root group */
  robotGroup: THREE.Group | null;
  /** Articulated limbs for biped walking kinematics */
  robotLeftLeg: THREE.Group | null;
  robotRightLeg: THREE.Group | null;
  robotLeftArm: THREE.Group | null;
  robotRightArm: THREE.Group | null;
  robotTorso: THREE.Group | null;
  robotHead: THREE.Group | null;
  robotLidar: THREE.Mesh | null;
  robotTablet: THREE.Mesh | null;
  headlight: THREE.SpotLight | null;
  scanPulseMesh: THREE.Mesh | null;
  /** Fleet of 3-ton counterbalance forklifts */
  forklifts: Array<{
    group: THREE.Group;
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    progress: number;
    speed: number;
    direction: number;
  }>;
}

/**
 * FactorySceneBuilder
 * 
 * High-performance 3D Scene Builder for the Industrial Plant SFioT 4.0.
 * Constructs factory flooring, sector boundaries, real 3D equipment models,
 * autonomous logistics forklifts, and inspector avatar.
 * 
 * Optimized for locked 60+ FPS:
 * - Shared GPU texture buffers (single-load 4K PBR textures cloned via WebGLTexture sharing).
 * - Zero dead procedural geometry allocations.
 * - Clean open layout without intrusive structural pillars.
 * - Stable, clean realistic 3D models with ground-level sector floor badges.
 */
export class FactorySceneBuilder {
  private scene: THREE.Scene;
  
  public objectsMap: SceneObjectsMap = {
    machineMeshes: new Map(),
    machineAndons: new Map(),
    animatedParts: new Map(),
    routeLineGroup: new THREE.Group(),
    sectorGroup: new THREE.Group(),
    labelsGroup: new THREE.Group(),
    robotGroup: null,
    robotLeftLeg: null,
    robotRightLeg: null,
    robotLeftArm: null,
    robotRightArm: null,
    robotTorso: null,
    robotHead: null,
    robotLidar: null,
    robotTablet: null,
    headlight: null,
    scanPulseMesh: null,
    forklifts: []
  };

  // Cached texture references to avoid redundant VRAM allocations
  private cachedMainFloorTexture: THREE.CanvasTexture | null = null;
  private cachedHazardStripeTexture: THREE.CanvasTexture | null = null;
  private cachedSectorDiffTexture: THREE.Texture | null = null;
  private cachedSectorAoTexture: THREE.Texture | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.objectsMap.routeLineGroup);
    this.scene.add(this.objectsMap.sectorGroup);
    this.scene.add(this.objectsMap.labelsGroup);
  }

  // =========================================================================
  // 1. TEXTURE GENERATION & GPU CACHING UTILITIES
  // =========================================================================

  /**
   * Generates a procedural high-resolution canvas texture for the factory circulation floor.
   * Cached to create only 1 GPU texture allocation.
   */
  private getWhiteIndustrialFloorTexture(): THREE.CanvasTexture {
    if (this.cachedMainFloorTexture) {
      return this.cachedMainFloorTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base burnished light concrete tone
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, 1024, 1024);

      // Organic smooth burnished trowel swirl marks and concrete clouds
      const swirls = [
        { x: 200, y: 200, r: 280, color: 'rgba(216, 226, 236, 0.45)' },
        { x: 750, y: 300, r: 320, color: 'rgba(186, 201, 218, 0.35)' },
        { x: 400, y: 700, r: 350, color: 'rgba(226, 232, 240, 0.40)' },
        { x: 850, y: 800, r: 260, color: 'rgba(168, 184, 202, 0.30)' }
      ];
      swirls.forEach((s) => {
        const grad = ctx.createRadialGradient(s.x, s.y, 20, s.x, s.y, s.r);
        grad.addColorStop(0, s.color);
        grad.addColorStop(0.6, 'rgba(203, 213, 225, 0.15)');
        grad.addColorStop(1, 'rgba(203, 213, 225, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Polished concrete slab expansion joint grid (256px squares = 2.5m x 2.5m slabs)
      const tileSize = 256;
      for (let x = 0; x < 1024; x += tileSize) {
        for (let y = 0; y < 1024; y += tileSize) {
          const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
          grad.addColorStop(0, 'rgba(241, 245, 249, 0.35)');
          grad.addColorStop(0.5, 'rgba(203, 213, 225, 0.10)');
          grad.addColorStop(1, 'rgba(186, 201, 218, 0.25)');
          ctx.fillStyle = grad;
          ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

          // Expansion joint seam
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, tileSize, tileSize);

          // Specular trowel highlight
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 1, y + 1);
          ctx.lineTo(x + tileSize - 1, y + 1);
          ctx.moveTo(x + 1, y + 1);
          ctx.lineTo(x + 1, y + tileSize - 1);
          ctx.stroke();
        }
      }

      // Micro-pores and aggregate grain
      ctx.fillStyle = 'rgba(100, 116, 139, 0.10)';
      for (let i = 0; i < 4000; i++) {
        const rx = Math.random() * 1024;
        const ry = Math.random() * 1024;
        const rsize = Math.random() * 2 + 0.5;
        ctx.fillRect(rx, ry, rsize, rsize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 14);
    this.cachedMainFloorTexture = texture;
    return texture;
  }

  /**
   * Generates OSHA safety hazard stripe texture (yellow and black 45° stripes).
   * Cached to create only 1 GPU texture allocation.
   */
  private getHazardStripeTexture(): THREE.CanvasTexture {
    if (this.cachedHazardStripeTexture) {
      return this.cachedHazardStripeTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#facc15'; // OSHA Safety Yellow
      ctx.fillRect(0, 0, 128, 128);

      ctx.fillStyle = '#0f172a'; // Deep Slate Black
      const stripeWidth = 32;
      for (let d = -128; d < 256; d += stripeWidth * 2) {
        ctx.beginPath();
        ctx.moveTo(d, 0);
        ctx.lineTo(d + stripeWidth, 0);
        ctx.lineTo(d + stripeWidth + 128, 128);
        ctx.lineTo(d + 128, 128);
        ctx.closePath();
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 2);
    this.cachedHazardStripeTexture = texture;
    return texture;
  }

  /**
   * Loads 4K PBR plastered sector floor textures ONCE and shares underlying GPU memory
   * across all 10 factory sectors via lightweight cloning.
   */
  private getSectorFloorTextures(repeatX: number, repeatY: number): { map: THREE.Texture; aoMap: THREE.Texture } {
    const loader = new THREE.TextureLoader();
    if (!this.cachedSectorDiffTexture) {
      this.cachedSectorDiffTexture = loader.load('/textures/sector-floor/textures/plastered_wall_05_diff_4k.jpg');
      this.cachedSectorDiffTexture.wrapS = THREE.RepeatWrapping;
      this.cachedSectorDiffTexture.wrapT = THREE.RepeatWrapping;
    }
    if (!this.cachedSectorAoTexture) {
      this.cachedSectorAoTexture = loader.load('/textures/sector-floor/textures/plastered_wall_05_ao_4k.jpg');
      this.cachedSectorAoTexture.wrapS = THREE.RepeatWrapping;
      this.cachedSectorAoTexture.wrapT = THREE.RepeatWrapping;
    }

    const map = this.cachedSectorDiffTexture.clone();
    map.repeat.set(repeatX, repeatY);
    map.needsUpdate = true;

    const aoMap = this.cachedSectorAoTexture.clone();
    aoMap.repeat.set(repeatX, repeatY);
    aoMap.needsUpdate = true;

    return { map, aoMap };
  }

  // =========================================================================
  // 2. FACTORY ENVIRONMENT & ARCHITECTURE
  // =========================================================================

  /**
   * Constructs the full industrial plant environment:
   * 1. Main circulation floor slab (110m x 84m).
   * 2. Safety transit aisles and zebra pedestrian crossings.
   * 3. 10 Sector floor zones with perimeter safety lines & 3D ground badges.
   * 4. Perimeter boundary walls.
   * 5. Real 3D counterbalance forklifts with pallets and boxes.
   */
  public buildEnvironment(sectors: Sector[]): void {
    // 1. Factory Main Floor Base (Crisp white industrial epoxy slab - 110m x 84m)
    const whiteFloorTexture = this.getWhiteIndustrialFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(110, 84);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      map: whiteFloorTexture,
      roughness: 0.38,
      metalness: 0.08
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Safety Walkways, Inter-Aisles & Pedestrian Crossings
    this.buildSafetyWalkways();

    // 3. Sector Floors, Yellow Safety Borders & 3D Ground Badges
    this.buildSectorFloors(sectors);

    // 4. Perimeter Low Guard Walls
    this.buildPerimeterBounds();

    // 5. Real 3D Counterbalance Forklifts
    this.buildForklifts();
  }

  /**
   * Constructs circulation walkways, central transit aisle, cross aisles, and pedestrian zebra crossings.
   */
  private buildSafetyWalkways(): void {
    const walkwayMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.28,
      metalness: 0.08
    });

    const yellowLineMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.35,
      metalness: 0.1
    });

    // --- A. MAIN CENTRAL AISLE (North-South: X = -2.0 to +2.0, standard width 4.0m) ---
    const centralAisle = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 76), walkwayMat);
    centralAisle.rotation.x = -Math.PI / 2;
    centralAisle.position.set(0, 0.015, 0);
    centralAisle.receiveShadow = true;
    this.scene.add(centralAisle);

    // Yellow boundary lines for central aisle
    const centralLeftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 76), yellowLineMat);
    centralLeftLine.rotation.x = -Math.PI / 2;
    centralLeftLine.position.set(-2.0, 0.02, 0);
    this.scene.add(centralLeftLine);

    const centralRightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 76), yellowLineMat);
    centralRightLine.rotation.x = -Math.PI / 2;
    centralRightLine.position.set(2.0, 0.02, 0);
    this.scene.add(centralRightLine);

    // Central dashed centerline for vehicle transit
    for (let z = -34; z <= 34; z += 3.0) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.6), yellowLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, z);
      this.scene.add(dash);
    }

    // --- B. CROSS AISLES (East-West Corridors with width 3.6m) ---
    // North Cross Aisle (center Z = -7.0)
    const northCrossAisle = new THREE.Mesh(new THREE.PlaneGeometry(104, 3.6), walkwayMat);
    northCrossAisle.rotation.x = -Math.PI / 2;
    northCrossAisle.position.set(0, 0.015, -7.0);
    northCrossAisle.receiveShadow = true;
    this.scene.add(northCrossAisle);

    // South Cross Aisle (center Z = 9.0)
    const southCrossAisle = new THREE.Mesh(new THREE.PlaneGeometry(104, 3.6), walkwayMat);
    southCrossAisle.rotation.x = -Math.PI / 2;
    southCrossAisle.position.set(0, 0.015, 9.0);
    southCrossAisle.receiveShadow = true;
    this.scene.add(southCrossAisle);

    // Far South Perimeter Aisle (center Z = 33.8)
    const southPerimeterAisle = new THREE.Mesh(new THREE.PlaneGeometry(104, 3.6), walkwayMat);
    southPerimeterAisle.rotation.x = -Math.PI / 2;
    southPerimeterAisle.position.set(0, 0.015, 33.8);
    southPerimeterAisle.receiveShadow = true;
    this.scene.add(southPerimeterAisle);

    // Far North Perimeter Aisle (center Z = -33.8)
    const northPerimeterAisle = new THREE.Mesh(new THREE.PlaneGeometry(104, 3.6), walkwayMat);
    northPerimeterAisle.rotation.x = -Math.PI / 2;
    northPerimeterAisle.position.set(0, 0.015, -33.8);
    northPerimeterAisle.receiveShadow = true;
    this.scene.add(northPerimeterAisle);

    // --- C. INDUSTRIAL PEDESTRIAN ZEBRA CROSSINGS ---
    const crossingZPositions = [-33.8, -7.0, 9.0, 33.8];
    crossingZPositions.forEach((cz) => {
      const numStripes = 7;
      const stripeWidth = 0.42;
      const stripeSpacing = 0.58;
      const startX = -((numStripes - 1) * stripeSpacing) / 2;

      for (let i = 0; i < numStripes; i++) {
        const stripeMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(stripeWidth, 2.0),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
        );
        stripeMesh.rotation.x = -Math.PI / 2;
        stripeMesh.position.set(startX + i * stripeSpacing, 0.018, cz);
        this.scene.add(stripeMesh);
      }
    });

    // Directional logistics arrows on floor
    this.buildWalkwayStencils();
  }

  /**
   * Stencils on circulation floor (Directional arrows & pedestrian markings).
   */
  private buildWalkwayStencils(): void {
    const arrowCanvas = document.createElement('canvas');
    arrowCanvas.width = 256;
    arrowCanvas.height = 256;
    const actx = arrowCanvas.getContext('2d');
    if (actx) {
      actx.fillStyle = '#facc15';
      actx.beginPath();
      actx.moveTo(128, 30);
      actx.lineTo(210, 120);
      actx.lineTo(160, 120);
      actx.lineTo(160, 226);
      actx.lineTo(96, 226);
      actx.lineTo(96, 120);
      actx.lineTo(46, 120);
      actx.closePath();
      actx.fill();
    }
    const arrowTex = new THREE.CanvasTexture(arrowCanvas);
    const arrowMat = new THREE.MeshBasicMaterial({ map: arrowTex, transparent: true, opacity: 0.9 });

    const arrowPositions = [
      { x: 1.1, z: -16 },
      { x: 1.1, z: 0 },
      { x: 1.1, z: 18 }
    ];
    arrowPositions.forEach((pos) => {
      const arrowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), arrowMat);
      arrowMesh.rotation.x = -Math.PI / 2;
      arrowMesh.position.set(pos.x, 0.022, pos.z);
      this.scene.add(arrowMesh);
    });
  }

  /**
   * Constructs all 10 sector floors with PBR plaster texture, safety yellow perimeter lines,
   * corner brackets, entrance hazard gates, and high-resolution 3D identification badges on the floor.
   */
  private buildSectorFloors(sectors: Sector[]): void {
    const hazardTex = this.getHazardStripeTexture();

    const yellowBorderMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.35,
      metalness: 0.1
    });

    const hazardMat = new THREE.MeshStandardMaterial({
      map: hazardTex,
      roughness: 0.45
    });

    sectors.forEach((sec) => {
      const minX = sec.floorArea.minX;
      const maxX = sec.floorArea.maxX;
      const minZ = sec.floorArea.minZ;
      const maxZ = sec.floorArea.maxZ;

      const width = maxX - minX;
      const depth = maxZ - minZ;
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;

      // 1. Photorealistic 4K PBR Plastered Sector Floor Slab (Shared GPU Memory)
      const repeatX = Math.max(1, Math.round(width / 3.0));
      const repeatY = Math.max(1, Math.round(depth / 3.0));
      const { map, aoMap } = this.getSectorFloorTextures(repeatX, repeatY);

      const sectorFloorMat = new THREE.MeshStandardMaterial({
        map,
        aoMap,
        aoMapIntensity: 0.85,
        roughness: 0.70,
        metalness: 0.05
      });

      const sectorFloorGeo = new THREE.PlaneGeometry(width, depth);
      const sectorMesh = new THREE.Mesh(sectorFloorGeo, sectorFloorMat);
      sectorMesh.rotation.x = -Math.PI / 2;
      sectorMesh.position.set(centerX, 0.012, centerZ);
      sectorMesh.receiveShadow = true;
      this.objectsMap.sectorGroup.add(sectorMesh);

      // 2. High-Precision Solid Yellow Perimeter Demarcation Lines (18cm wide)
      const lw = 0.18;

      // Top Border
      const topBorder = new THREE.Mesh(new THREE.PlaneGeometry(width + lw, lw), yellowBorderMat);
      topBorder.rotation.x = -Math.PI / 2;
      topBorder.position.set(centerX, 0.024, minZ);
      this.objectsMap.sectorGroup.add(topBorder);

      // Bottom Border
      const bottomBorder = new THREE.Mesh(new THREE.PlaneGeometry(width + lw, lw), yellowBorderMat);
      bottomBorder.rotation.x = -Math.PI / 2;
      bottomBorder.position.set(centerX, 0.024, maxZ);
      this.objectsMap.sectorGroup.add(bottomBorder);

      // Left Border
      const leftBorder = new THREE.Mesh(new THREE.PlaneGeometry(lw, depth + lw), yellowBorderMat);
      leftBorder.rotation.x = -Math.PI / 2;
      leftBorder.position.set(minX, 0.024, centerZ);
      this.objectsMap.sectorGroup.add(leftBorder);

      // Right Border
      const rightBorder = new THREE.Mesh(new THREE.PlaneGeometry(lw, depth + lw), yellowBorderMat);
      rightBorder.rotation.x = -Math.PI / 2;
      rightBorder.position.set(maxX, 0.024, centerZ);
      this.objectsMap.sectorGroup.add(rightBorder);

      // 3. Corner L-Brackets
      const cornerBracketSize = 0.8;
      const cornerPositions = [
        { x: minX, z: minZ },
        { x: maxX, z: minZ },
        { x: minX, z: maxZ },
        { x: maxX, z: maxZ }
      ];
      cornerPositions.forEach((cp) => {
        const cornerPlate = new THREE.Mesh(
          new THREE.PlaneGeometry(cornerBracketSize, cornerBracketSize),
          new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.35 })
        );
        cornerPlate.rotation.x = -Math.PI / 2;
        cornerPlate.position.set(cp.x, 0.023, cp.z);
        this.objectsMap.sectorGroup.add(cornerPlate);
      });

      // 4. Sector Entrance Gateway
      let gateX = centerX;
      let gateZ = centerZ;
      if (maxX <= 2) {
        gateX = maxX;
        const gateHatch = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.4), hazardMat);
        gateHatch.rotation.x = -Math.PI / 2;
        gateHatch.position.set(gateX, 0.025, gateZ);
        this.objectsMap.sectorGroup.add(gateHatch);
      } else if (minX >= 2) {
        gateX = minX;
        const gateHatch = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.4), hazardMat);
        gateHatch.rotation.x = -Math.PI / 2;
        gateHatch.position.set(gateX, 0.025, gateZ);
        this.objectsMap.sectorGroup.add(gateHatch);
      }

      // 5. 3D Sector Ground Identification Badge
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 512;
      textCanvas.height = 128;
      const ctx = textCanvas.getContext('2d');
      if (ctx) {
        // Container
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(8, 8, 496, 112, 14);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Accent pill
        ctx.fillStyle = sec.color;
        ctx.beginPath();
        ctx.roundRect(16, 16, 16, 96, 8);
        ctx.fill();

        // Sector Code & Name
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 30px "Plus Jakarta Sans", monospace';
        ctx.fillText(sec.code, 44, 52);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
        const displayName = sec.name.length > 24 ? sec.name.slice(0, 22) + '...' : sec.name;
        ctx.fillText(displayName.toUpperCase(), 44, 94);
      }
      const badgeTex = new THREE.CanvasTexture(textCanvas);
      const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, opacity: 0.95 });
      const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), badgeMat);
      badgeMesh.rotation.x = -Math.PI / 2;

      let badgePosX = centerX;
      let badgePosZ = minZ + 1.8;
      if (maxX <= 2) {
        badgePosX = maxX - 2.8;
      } else if (minX >= 2) {
        badgePosX = minX + 2.8;
      }
      badgeMesh.position.set(badgePosX, 0.025, badgePosZ);
      this.objectsMap.sectorGroup.add(badgeMesh);

      // 6. Overhead Suspended Sector Signboard (placa-setor.glb - 2x larger with steel suspension cables & double-sided signage)
      const overheadGroup = new THREE.Group();
      overheadGroup.position.set(centerX, 8.2, centerZ);

      FactoryModelLoader.loadModel('placa-setor').then((signMesh) => {
        const signBbox = new THREE.Box3().setFromObject(signMesh);
        const signCenter = new THREE.Vector3();
        signBbox.getCenter(signCenter);

        // Center the 3d sign model (Scaled 3.6x = 2x larger than previous 1.8x)
        signMesh.position.set(-signCenter.x, -signCenter.y, -signCenter.z);
        signMesh.scale.set(3.6, 3.6, 3.6);
        overheadGroup.add(signMesh);

        // High-strength steel vertical suspension cables reaching the ceiling (Y = 12m)
        const cableMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
        const cableGeo = new THREE.CylinderGeometry(0.025, 0.025, 4.0, 8);
        [-3.0, 3.0].forEach((cx) => {
          const cable = new THREE.Mesh(cableGeo, cableMat);
          cable.position.set(cx, 2.0, 0);
          overheadGroup.add(cable);
        });

        // Double-sided ultra-legible high-contrast Sector Nameplate Canvas (2048x640)
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 2048;
        signCanvas.height = 640;
        const sctx = signCanvas.getContext('2d');
        if (sctx) {
          // Plate background
          sctx.fillStyle = '#0b1329';
          sctx.beginPath();
          sctx.roundRect(16, 16, 2016, 608, 32);
          sctx.fill();

          // Safety Yellow Heavy Border Frame
          sctx.strokeStyle = '#facc15';
          sctx.lineWidth = 18;
          sctx.stroke();

          // Sector accent color header bar
          sctx.fillStyle = sec.color;
          sctx.beginPath();
          sctx.roundRect(40, 40, 1968, 36, 14);
          sctx.fill();

          // Sector Code Tag
          sctx.fillStyle = '#facc15';
          sctx.font = '900 84px "Plus Jakarta Sans", monospace';
          sctx.fillText(`[ ${sec.code} ]`, 64, 175);

          // Sector Name in ultra bold uppercase
          sctx.fillStyle = '#ffffff';
          sctx.font = '900 120px "Plus Jakarta Sans", sans-serif';
          const nameStr = sec.name.length > 20 ? sec.name.slice(0, 19) + '...' : sec.name;
          sctx.fillText(nameStr.toUpperCase(), 64, 335);

          // Subtitle / Plant Badge
          sctx.fillStyle = '#94a3b8';
          sctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
          sctx.fillText('SWT INDUSTRIAL • LINHA DE PRODUÇÃO ATIVA', 64, 455);
        }

        const signTex = new THREE.CanvasTexture(signCanvas);
        const signBoardMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true });

        // Front Face (7.2m x 2.3m)
        const frontBoard = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.3), signBoardMat);
        frontBoard.position.set(0, 0, 0.22);
        overheadGroup.add(frontBoard);

        // Back Face (7.2m x 2.3m)
        const backBoard = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.3), signBoardMat);
        backBoard.rotation.y = Math.PI;
        backBoard.position.set(0, 0, -0.22);
        overheadGroup.add(backBoard);
      });

      this.objectsMap.sectorGroup.add(overheadGroup);
    });
  }

  /**
   * Perimeter boundary walls built with modular 3D wall assets.
   */
  private buildPerimeterBounds(): void {
    FactoryModelLoader.loadModel('parede').then((wallSample) => {
      const initialBbox = new THREE.Box3().setFromObject(wallSample);
      const initialCenter = new THREE.Vector3();
      initialBbox.getCenter(initialCenter);
      wallSample.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.position.x -= initialCenter.x;
          child.position.z -= initialCenter.z;
          child.position.y -= initialBbox.min.y;
        }
      });

      const bbox = new THREE.Box3().setFromObject(wallSample);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const unitLen = size.z > 0.1 ? size.z : (size.x > 0.1 ? size.x : 1.0);
      const baseHeight = size.y > 0.05 ? size.y : 0.8;
      const targetPillarHeight = 12.0;
      const scaleY = targetPillarHeight / baseHeight;

      const wallGroup = new THREE.Group();

      // Back Wall (Z = -36)
      for (let x = -52 + unitLen / 2; x <= 52 - unitLen / 2; x += unitLen) {
        const wall = wallSample.clone(true);
        wall.scale.set(1, scaleY, 1);
        wall.rotation.y = Math.PI / 2;
        wall.position.set(x, 0, -36);
        wallGroup.add(wall);
      }

      // Front Wall (Z = +36)
      for (let x = -52 + unitLen / 2; x <= 52 - unitLen / 2; x += unitLen) {
        const wall = wallSample.clone(true);
        wall.scale.set(1, scaleY, 1);
        wall.rotation.y = -Math.PI / 2;
        wall.position.set(x, 0, 36);
        wallGroup.add(wall);
      }

      // Left Wall (X = -52)
      for (let z = -36 + unitLen / 2; z <= 36 - unitLen / 2; z += unitLen) {
        const wall = wallSample.clone(true);
        wall.scale.set(1, scaleY, 1);
        wall.rotation.y = 0;
        wall.position.set(-52, 0, z);
        wallGroup.add(wall);
      }

      // Right Wall (X = +52)
      for (let z = -36 + unitLen / 2; z <= 36 - unitLen / 2; z += unitLen) {
        const wall = wallSample.clone(true);
        wall.scale.set(1, scaleY, 1);
        wall.rotation.y = Math.PI;
        wall.position.set(52, 0, z);
        wallGroup.add(wall);
      }

      this.scene.add(wallGroup);
    });
  }

  /**
   * Real 3D 3-ton counterbalance forklifts navigating the factory corridors.
   * Uses container-level centering without modifying internal sub-mesh pivots.
   */
  private buildForklifts(): void {
    // 1. Forklift 1 - Active on central aisle
    const fl1Group = new THREE.Group();
    fl1Group.position.set(0, 0, 4.0);
    this.scene.add(fl1Group);

    FactoryModelLoader.loadModel('empilhadeira').then((flModel) => {
      const bbox = new THREE.Box3().setFromObject(flModel);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      // Center the whole model at its origin and ground to Y=0 cleanly
      flModel.position.set(-center.x, -bbox.min.y, -center.z);
      flModel.scale.set(1.0, 1.0, 1.0);

      const flWrapper = new THREE.Group();
      flWrapper.add(flModel);

      // Wooden Euro Pallet on the forks (+Z is forward)
      const palletGroup = new THREE.Group();
      palletGroup.position.set(0, 0.04, 1.45);

      const palletWoodMat = new THREE.MeshStandardMaterial({
        color: 0xc49a6c,
        roughness: 0.85,
        metalness: 0.05
      });
      const palletDeck = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.0), palletWoodMat);
      palletDeck.position.y = 0.08;
      palletDeck.castShadow = true;
      palletDeck.receiveShadow = true;
      palletGroup.add(palletDeck);

      // Pallet bottom runners
      for (const rx of [-0.5, 0, 0.5]) {
        const runner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 1.0), palletWoodMat);
        runner.position.set(rx, 0.04, 0);
        palletGroup.add(runner);
      }

      // Boxes on pallet
      FactoryModelLoader.loadModel('box-large').then((box1) => {
        box1.scale.set(0.65, 0.65, 0.65);
        box1.position.set(-0.25, 0.12, 0);
        palletGroup.add(box1);
      });
      FactoryModelLoader.loadModel('box-small').then((box2) => {
        box2.scale.set(0.65, 0.65, 0.65);
        box2.position.set(0.25, 0.12, 0);
        palletGroup.add(box2);
      });

      flWrapper.add(palletGroup);
      fl1Group.add(flWrapper);

      this.objectsMap.forklifts.push({
        group: fl1Group,
        startPos: new THREE.Vector3(0, 0, -10.0),
        targetPos: new THREE.Vector3(0, 0, 20.0),
        progress: 0.35,
        speed: 0.025,
        direction: 1
      });
    });

    // 2. Forklift 2 - Logistics loading dock staging (South corridor)
    const fl2Group = new THREE.Group();
    fl2Group.position.set(20.0, 0, 33.8);
    fl2Group.rotation.y = -Math.PI / 2;
    this.scene.add(fl2Group);

    FactoryModelLoader.loadModel('empilhadeira').then((flModel2) => {
      const bbox = new THREE.Box3().setFromObject(flModel2);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      flModel2.position.set(-center.x, -bbox.min.y, -center.z);
      flModel2.scale.set(1.0, 1.0, 1.0);

      const fl2Wrapper = new THREE.Group();
      fl2Wrapper.add(flModel2);
      fl2Group.add(fl2Wrapper);

      // Safety Cones
      [-1.4, 1.4].forEach((cx) => {
        FactoryModelLoader.loadModel('cone').then((cone) => {
          cone.scale.set(1.3, 1.3, 1.3);
          cone.position.set(cx, 0.02, 1.8);
          fl2Group.add(cone);
        });
      });
    });
  }

  // =========================================================================
  // 3. READY-MADE HIGH-FIDELITY 3D MACHINES
  // =========================================================================

  /**
   * Instantiates all factory machines using authentic GLTF/GLB 3D assets.
   */
  public buildMachines(machines: Machine[]): SceneObjectsMap {
    machines.forEach((machine) => {
      const machineGroup = new THREE.Group();
      machineGroup.position.set(machine.position.x, machine.position.y, machine.position.z);
      machineGroup.userData = { machineId: machine.id, isMachine: true };

      if (machine.category === 'furadeira-coluna') {
        this.buildDrillPressModel(machineGroup, machine);
      } else if (machine.category === 'cnc-centro-usinagem') {
        this.buildCncCompletoModel(machineGroup, machine);
      } else if (machine.category === 'bihler-combinada' || machine.category === 'bihler-linha-pecas') {
        this.buildBihlerModel(machineGroup, machine);
      }

      // Safety Cones around machines needing attention or stopped
      if (machine.status === 'attention' || machine.status === 'stopped') {
        [-2.0, 2.0].forEach((cx) => {
          FactoryModelLoader.loadModel('cone').then((coneMesh) => {
            coneMesh.scale.set(1.4, 1.4, 1.4);
            coneMesh.position.set(cx, 0.02, 2.0);
            machineGroup.add(coneMesh);
          });
        });
      }

      this.scene.add(machineGroup);
      this.objectsMap.machineMeshes.set(machine.id, machineGroup);
    });

    return this.objectsMap;
  }

  /**
   * Attaches an authentic industrial machine identification code plaque (e.g. PB01M, PB02M, M17)
   * directly to the machine's physical frame. Sized 2x for maximum visibility and crystal clarity.
   */
  private attachMachineCodePlate(
    group: THREE.Group,
    machine: Machine,
    mountPos: THREE.Vector3,
    rotY: number = 0,
    scale: number = 1.0
  ): void {
    const plateGroup = new THREE.Group();
    plateGroup.position.copy(mountPos);
    plateGroup.rotation.y = rotY;

    // Dark brushed anodized aluminum mounting plate (2x enlarged)
    const plateGeo = new THREE.BoxGeometry(1.45 * scale, 0.62 * scale, 0.04 * scale);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.3
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateGroup.add(plateMesh);

    // High-resolution machine code canvas (1024x440)
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 440;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Plate background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 1024, 440);

      // Chamfered safety yellow heavy border
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 14;
      ctx.strokeRect(10, 10, 1004, 420);

      // Top label
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 42px "Plus Jakarta Sans", monospace';
      ctx.fillText('EQUIPAMENTO / CÓDIGO', 40, 80);

      // Machine Code in punchy bold monospace (huge & crisp)
      ctx.fillStyle = '#facc15';
      ctx.font = '900 150px "Plus Jakarta Sans", monospace';
      ctx.fillText(machine.code, 40, 260);

      // Sub-brand badge
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SWT PLANT • ' + machine.id, 40, 370);

      // Rivets in corners
      ctx.fillStyle = '#64748b';
      [[32, 32], [992, 32], [32, 408], [992, 408]].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(rx, ry, 10, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    const tex = new THREE.CanvasTexture(canvas);
    const labelMat = new THREE.MeshBasicMaterial({ map: tex });
    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.38 * scale, 0.55 * scale), labelMat);
    labelMesh.position.set(0, 0, 0.025 * scale);
    plateGroup.add(labelMesh);

    group.add(plateGroup);
  }

  /**
   * Model: Industrial Column Drill Press (`old_drill_press.gltf`) with Wooden Workbench & Tool Cart.
   */
  private buildDrillPressModel(group: THREE.Group, machine: Machine): void {
    // 1. Heavy-duty Wooden Workbench Table
    FactoryModelLoader.loadModel('mesamadeira').then((tableMesh) => {
      tableMesh.scale.set(1.8, 1.8, 1.8);
      tableMesh.position.set(0, 0, 0);
      group.add(tableMesh);
    });

    // 2. Ready 3D Industrial Column Drill Press
    FactoryModelLoader.loadModel('furadeira').then((drillMesh) => {
      drillMesh.scale.set(0.016, 0.016, 0.016);
      drillMesh.position.set(0, 1.28, 0); // Positioned directly atop the workbench table
      drillMesh.rotation.y = Math.PI;
      group.add(drillMesh);

      // Animated rotating spindle drill chuck
      const drillChuck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.03, 0.14, 16),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
      );
      drillChuck.position.set(0, 1.62, 0.32);
      group.add(drillChuck);

      this.objectsMap.animatedParts.set(`${machine.id}-drill-chuck`, {
        type: 'rotation-y',
        object: drillChuck,
        basePos: drillChuck.position.clone(),
        speed: 14.0
      });
    });

    // 3. Heavy-Duty Mobile Tool Cart next to workbench
    FactoryModelLoader.loadModel('carroferramenta').then((cartMesh) => {
      cartMesh.scale.set(0.015, 0.015, 0.015);
      cartMesh.position.set(1.7, 0, 0.3);
      cartMesh.rotation.y = -Math.PI / 4;
      group.add(cartMesh);
    });

    // 4. Physical Machine Code Plate (2x size)
    this.attachMachineCodePlate(group, machine, new THREE.Vector3(0, 0.88, 0.95), 0, 0.85);
  }

  /**
   * Model: 5-Axis CNC Machining Center (`cnc-completo.glb`) - Scaled 1.55x (+55% height & width)
   * with authentic Industrial Pallet (`palet.glb`) alongside for billets and machined parts.
   */
  private buildCncCompletoModel(group: THREE.Group, machine: Machine): void {
    // 1. Ready 3D CNC Machining Center (Scaled 1.55x for imposing, realistic heavy presence)
    FactoryModelLoader.loadModel('cnc-completo').then((cncMesh) => {
      const bbox = new THREE.Box3().setFromObject(cncMesh);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      // Center model at origin and ground to Y=0
      cncMesh.position.set(-center.x, -bbox.min.y, -center.z);
      cncMesh.scale.set(1.55, 1.55, 1.55);
      cncMesh.rotation.y = Math.PI / 2; // Facing the aisle

      const wrapper = new THREE.Group();
      wrapper.add(cncMesh);
      group.add(wrapper);

      // Spinning high-speed spindle inside enclosure
      const spindleObj = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.05, 0.32, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95, roughness: 0.15 })
      );
      spindleObj.position.set(0, 2.2, 0);
      group.add(spindleObj);

      this.objectsMap.animatedParts.set(`${machine.id}-spindle`, {
        type: 'rotation-y',
        object: spindleObj,
        basePos: spindleObj.position.clone(),
        speed: 20.0
      });
    });

    // 2. Real 3D Pallet alongside each CNC machine (Scaled 1.5x)
    FactoryModelLoader.loadModel('palet').then((palletMesh) => {
      const pBbox = new THREE.Box3().setFromObject(palletMesh);
      const pCenter = new THREE.Vector3();
      pBbox.getCenter(pCenter);

      palletMesh.position.set(-pCenter.x, -pBbox.min.y, -pCenter.z);
      palletMesh.scale.set(1.5, 1.5, 1.5);

      const palletWrapper = new THREE.Group();
      palletWrapper.position.set(2.8, 0, 0.4); // Positioned beside CNC
      palletWrapper.add(palletMesh);

      // Raw billet / machined parts boxes on pallet
      FactoryModelLoader.loadModel('box-large').then((box1) => {
        box1.scale.set(0.95, 0.95, 0.95);
        box1.position.set(-0.35, 0.22, 0);
        palletWrapper.add(box1);
      });
      FactoryModelLoader.loadModel('box-small').then((box2) => {
        box2.scale.set(0.95, 0.95, 0.95);
        box2.position.set(0.35, 0.22, 0);
        palletWrapper.add(box2);
      });

      group.add(palletWrapper);
    });

    // 3. Physical Machine Code Plate (2x size) mounted on top-front face
    this.attachMachineCodePlate(group, machine, new THREE.Vector3(0, 2.55, 1.65), 0, 1.0);
  }

  /**
   * Model: Authentic Bihler Multi-Slide Stamping & Forming Machine (`Maquina-bihler.glb`)
   * with authentic Industrial Pallet (`palet.glb`) placed alongside for finished parts.
   */
  private buildBihlerModel(group: THREE.Group, machine: Machine): void {
    // 1. Ready 3D Bihler Machine (Scaled 1.55x for imposing, realistic heavy industrial presence)
    FactoryModelLoader.loadModel('maquina-bihler').then((bihlerMesh) => {
      const bbox = new THREE.Box3().setFromObject(bihlerMesh);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      // Center model at origin and ground to Y=0
      bihlerMesh.position.set(-center.x, -bbox.min.y, -center.z);
      bihlerMesh.scale.set(1.55, 1.55, 1.55);
      bihlerMesh.rotation.y = Math.PI / 2; // Face the aisle

      const wrapper = new THREE.Group();
      wrapper.add(bihlerMesh);
      group.add(wrapper);
    });

    // 2. Heavy-Duty Parts Collection Table (mesa.glb) in FRONT of the Bihler machine (25% smaller scale)
    FactoryModelLoader.loadModel('mesa').then((tableMesh) => {
      const tBbox = new THREE.Box3().setFromObject(tableMesh);
      const tCenter = new THREE.Vector3();
      tBbox.getCenter(tCenter);

      // Center table model and ground to floor (scale 1.15 = 25% smaller than 1.5)
      tableMesh.position.set(-tCenter.x, -tBbox.min.y, -tCenter.z);
      tableMesh.scale.set(1.15, 1.15, 1.15);
      tableMesh.rotation.y = Math.PI / 2; // Aligned with machine front

      const tableWrapper = new THREE.Group();
      tableWrapper.position.set(1.85, 0, 0.0); // Directly in FRONT of the machine front face
      tableWrapper.add(tableMesh);

      // Formed parts collection box on top of the table
      FactoryModelLoader.loadModel('box-small').then((box) => {
        const topY = (tBbox.max.y - tBbox.min.y) * 1.15;
        box.scale.set(0.70, 0.70, 0.70);
        box.position.set(0, topY, 0);
        tableWrapper.add(box);
      });

      group.add(tableWrapper);
    });

    // 3. Electrical / Automation Control Panel on the LEFT side of the Bihler machine (with spacing)
    FactoryModelLoader.loadModel('painel').then((panelMesh) => {
      const pBbox = new THREE.Box3().setFromObject(panelMesh);
      const pCenter = new THREE.Vector3();
      pBbox.getCenter(pCenter);

      // Center model at origin and ground to floor
      panelMesh.position.set(-pCenter.x, -pBbox.min.y, -pCenter.z);
      panelMesh.scale.set(1.5, 1.5, 1.5);
      panelMesh.rotation.y = Math.PI / 2; // Facing the same front direction as the Bihler machine

      const panelWrapper = new THREE.Group();
      panelWrapper.position.set(-0.2, 0, 2.35); // Positioned on the LEFT side with comfortable clearance
      panelWrapper.add(panelMesh);

      group.add(panelWrapper);
    });

    // 4. Strip Coil Decoiler (Desbobinador) on the RIGHT side of the Bihler machine (Enlarged 2.4x)
    FactoryModelLoader.loadModel('desbobinador').then((decoilerMesh) => {
      const dBbox = new THREE.Box3().setFromObject(decoilerMesh);
      const dCenter = new THREE.Vector3();
      dBbox.getCenter(dCenter);

      // Center model and ground to floor (Scaled 2.4x for realistic heavy industrial coil reel presence)
      decoilerMesh.position.set(-dCenter.x, -dBbox.min.y, -dCenter.z);
      decoilerMesh.scale.set(2.4, 2.4, 2.4);
      decoilerMesh.rotation.y = Math.PI / 2; // Aligned with the strip feeding line

      const decoilerWrapper = new THREE.Group();
      decoilerWrapper.position.set(-0.2, 0, -2.8); // Positioned on the RIGHT side with proper spacing
      decoilerWrapper.add(decoilerMesh);

      group.add(decoilerWrapper);
    });

    // 5. Physical Machine Code Plate (PB01M - PB10M) mounted on FRONT and BACK upper frames (unobstructed by panel)
    this.attachMachineCodePlate(group, machine, new THREE.Vector3(1.35, 2.35, 0), Math.PI / 2, 0.95);
    this.attachMachineCodePlate(group, machine, new THREE.Vector3(-1.35, 2.35, 0), -Math.PI / 2, 0.95);
  }

  // =========================================================================
  // 4. HUMANOID INSPECTOR AVATAR (OPERATOR WALKING KINEMATICS)
  // =========================================================================

  /**
   * Builds the humanoid inspector avatar with articulated limbs, high-vis safety gear,
   * telemetry tablet HUD, LiDAR puck, and spotlight.
   */
  public buildRobotAvatar(initialPos = new THREE.Vector3(0, 0, 18)): THREE.Group {
    const robotGroup = new THREE.Group();
    robotGroup.position.copy(initialPos);
    robotGroup.userData = { isRobot: true };

    const slateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.5 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.2 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const safetyVestMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });
    const cyanGlowMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 2.5 });

    // 1. Pelvis
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.20, 0.28), slateMat);
    pelvis.position.y = 0.85;
    pelvis.castShadow = true;
    robotGroup.add(pelvis);

    // 2. Left Leg
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.16, 0.82, 0);
    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.40, 16), whiteMat);
    leftThigh.position.y = -0.20;
    leftLegGroup.add(leftThigh);
    const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.38, 16), slateMat);
    leftCalf.position.y = -0.59;
    leftLegGroup.add(leftCalf);
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.30), bootMat);
    leftBoot.position.set(0, -0.78, -0.05);
    leftLegGroup.add(leftBoot);
    robotGroup.add(leftLegGroup);
    this.objectsMap.robotLeftLeg = leftLegGroup;

    // 3. Right Leg
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.16, 0.82, 0);
    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.40, 16), whiteMat);
    rightThigh.position.y = -0.20;
    rightLegGroup.add(rightThigh);
    const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.38, 16), slateMat);
    rightCalf.position.y = -0.59;
    rightLegGroup.add(rightCalf);
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.30), bootMat);
    rightBoot.position.set(0, -0.78, -0.05);
    rightLegGroup.add(rightBoot);
    robotGroup.add(rightLegGroup);
    this.objectsMap.robotRightLeg = rightLegGroup;

    // 4. Torso with Safety Vest
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.95, 0);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.58, 0.32), safetyVestMat);
    chest.position.y = 0.29;
    chest.castShadow = true;
    torsoGroup.add(chest);

    // 5. Left Arm with Telemetry Tablet
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 0.52, 0);
    const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.32, 16), whiteMat);
    leftBicep.position.y = -0.16;
    leftArmGroup.add(leftBicep);
    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.30, 16), slateMat);
    leftForearm.position.set(0, -0.32, -0.12);
    leftForearm.rotation.x = -Math.PI / 4;
    leftArmGroup.add(leftForearm);

    // Tablet
    const tabletMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.04), slateMat);
    tabletMesh.position.set(0.12, -0.42, -0.28);
    tabletMesh.rotation.x = -Math.PI / 3;
    leftArmGroup.add(tabletMesh);

    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.22), cyanGlowMat);
    screenMesh.position.set(0.12, -0.41, -0.26);
    screenMesh.rotation.x = -Math.PI / 3;
    leftArmGroup.add(screenMesh);
    this.objectsMap.robotTablet = screenMesh;

    torsoGroup.add(leftArmGroup);
    this.objectsMap.robotLeftArm = leftArmGroup;

    // 6. Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 0.52, 0);
    const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.32, 16), whiteMat);
    rightBicep.position.y = -0.16;
    rightArmGroup.add(rightBicep);
    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 16), slateMat);
    rightForearm.position.y = -0.40;
    rightArmGroup.add(rightForearm);
    torsoGroup.add(rightArmGroup);
    this.objectsMap.robotRightArm = rightArmGroup;

    // 7. Head & Helmet
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.65, 0);
    const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.38), whiteMat);
    helmet.position.set(0, 0.24, 0);
    headGroup.add(helmet);

    // LiDAR Puck
    const lidarPuck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.10, 20),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 })
    );
    lidarPuck.position.set(0, 0.46, 0);
    headGroup.add(lidarPuck);
    this.objectsMap.robotLidar = lidarPuck;

    torsoGroup.add(headGroup);
    this.objectsMap.robotHead = headGroup;

    // 8. Forward Headlight
    const headlight = new THREE.SpotLight(0xffffff, 4.0, 32, Math.PI / 4, 0.35, 1.2);
    headlight.position.set(0, 0.45, -0.25);
    const targetObj = new THREE.Object3D();
    targetObj.position.set(0, 0, -12);
    torsoGroup.add(targetObj);
    headlight.target = targetObj;
    torsoGroup.add(headlight);
    this.objectsMap.headlight = headlight;

    robotGroup.add(torsoGroup);
    this.objectsMap.robotTorso = torsoGroup;

    // 9. Radar Scan Pulse Ring
    const pulseGeo = new THREE.RingGeometry(0.4, 0.60, 32);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.rotation.x = -Math.PI / 2;
    pulseMesh.position.y = 0.04;
    robotGroup.add(pulseMesh);
    this.objectsMap.scanPulseMesh = pulseMesh;

    this.scene.add(robotGroup);
    this.objectsMap.robotGroup = robotGroup;
    return robotGroup;
  }

  // =========================================================================
  // 5. ANIMATIONS & 60 FPS RUNTIME UPDATE LOOP
  // =========================================================================

  /**
   * Main 60 FPS animation loop update.
   */
  public updateAnimations(_time: number, machineStatuses: Map<string, MachineStatus>): void {
    // 1. Update Machine Animated Parts (Drill Chuck, CNC Spindle)
    this.objectsMap.animatedParts.forEach((part, key) => {
      const machineId = key.split('-')[0];
      const status = machineStatuses.get(machineId);
      if (status !== 'running') return;

      if (part.type === 'rotation-y') {
        part.object.rotation.y += 0.02 * part.speed;
      }
    });

    // 2. Update Autonomous Forklift Movement (Smooth corridor transit)
    this.objectsMap.forklifts.forEach((fl) => {
      fl.progress += fl.speed * 0.008 * fl.direction;
      if (fl.progress >= 1.0) {
        fl.progress = 1.0;
        fl.direction = -1;
      } else if (fl.progress <= 0.0) {
        fl.progress = 0.0;
        fl.direction = 1;
      }

      fl.group.position.lerpVectors(fl.startPos, fl.targetPos, fl.progress);
      fl.group.rotation.y = fl.direction > 0 ? 0 : Math.PI;
    });
  }

  /**
   * Updates humanoid avatar kinematics and biped stride animation per frame.
   */
  public updateRobotTransform(
    position: THREE.Vector3,
    rotationY: number,
    isMoving: boolean,
    walkCycle: number,
    time: number
  ): void {
    if (!this.objectsMap.robotGroup) return;

    this.objectsMap.robotGroup.position.copy(position);
    this.objectsMap.robotGroup.rotation.y = rotationY;

    if (this.objectsMap.robotLidar) {
      this.objectsMap.robotLidar.rotation.y += 0.14;
    }

    if (isMoving) {
      if (this.objectsMap.robotLeftLeg) {
        this.objectsMap.robotLeftLeg.rotation.x = Math.sin(walkCycle) * 0.65;
      }
      if (this.objectsMap.robotRightLeg) {
        this.objectsMap.robotRightLeg.rotation.x = -Math.sin(walkCycle) * 0.65;
      }
      if (this.objectsMap.robotRightArm) {
        this.objectsMap.robotRightArm.rotation.x = Math.sin(walkCycle) * 0.50;
      }
      if (this.objectsMap.robotLeftArm) {
        this.objectsMap.robotLeftArm.rotation.x = -0.25 + Math.sin(walkCycle) * 0.15;
      }
      if (this.objectsMap.robotTorso) {
        this.objectsMap.robotTorso.position.y = 0.95 + Math.abs(Math.sin(walkCycle)) * 0.04;
      }
    } else {
      if (this.objectsMap.robotLeftLeg) {
        this.objectsMap.robotLeftLeg.rotation.x = THREE.MathUtils.lerp(this.objectsMap.robotLeftLeg.rotation.x, 0, 0.15);
      }
      if (this.objectsMap.robotRightLeg) {
        this.objectsMap.robotRightLeg.rotation.x = THREE.MathUtils.lerp(this.objectsMap.robotRightLeg.rotation.x, 0, 0.15);
      }
      if (this.objectsMap.robotRightArm) {
        this.objectsMap.robotRightArm.rotation.x = THREE.MathUtils.lerp(this.objectsMap.robotRightArm.rotation.x, 0, 0.15);
      }
      if (this.objectsMap.robotLeftArm) {
        this.objectsMap.robotLeftArm.rotation.x = THREE.MathUtils.lerp(this.objectsMap.robotLeftArm.rotation.x, -0.25, 0.15);
      }
      if (this.objectsMap.robotTorso) {
        this.objectsMap.robotTorso.position.y = 0.95 + Math.sin(time * 2.5) * 0.01;
      }
    }
  }

  /**
   * Triggers radar scan pulse ring animation on floor.
   */
  public triggerRobotScanPulse(progress: number): void {
    if (!this.objectsMap.scanPulseMesh) return;
    const scale = 1 + progress * 16;
    this.objectsMap.scanPulseMesh.scale.set(scale, scale, 1);
    const mat = this.objectsMap.scanPulseMesh.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 1 - progress);
  }

  /**
   * Renders or clears an emergency / automated navigation route line in the 3D scene.
   */
  public renderNavigationRoute(route: FactoryRoute | null): void {
    // Clear previous route meshes
    while (this.objectsMap.routeLineGroup.children.length > 0) {
      const child = this.objectsMap.routeLineGroup.children[0];
      this.objectsMap.routeLineGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    if (!route || route.waypoints.length < 2) return;

    const points = route.waypoints.map((wp) => new THREE.Vector3(wp.x, 0.08, wp.z));
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 8, false);

    const routeColor = 0x06b6d4; // High-visibility glowing cyan route

    const routeMat = new THREE.MeshStandardMaterial({
      color: routeColor,
      emissive: routeColor,
      emissiveIntensity: 2.5,
      roughness: 0.2
    });

    const routeMesh = new THREE.Mesh(tubeGeo, routeMat);
    this.objectsMap.routeLineGroup.add(routeMesh);

    // Waypoint pulsating beacon disks
    points.forEach((pt, idx) => {
      const isEnd = idx === points.length - 1;
      const beaconGeo = new THREE.CylinderGeometry(isEnd ? 0.6 : 0.35, isEnd ? 0.6 : 0.35, 0.06, 24);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: isEnd ? 0x10b981 : routeColor,
        emissive: isEnd ? 0x10b981 : routeColor,
        emissiveIntensity: 3.0
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pt);
      beaconMesh.position.y = 0.05;
      this.objectsMap.routeLineGroup.add(beaconMesh);
    });
  }
}
