import * as THREE from 'three';
import { Machine, Sector, MachineStatus, FactoryRoute } from '../../types/industrial';

export interface LogisticsState {
  bihlerBoxFull: boolean;
  cncBoxFull: boolean;
  intakeBoxReady: boolean;
  tableBoxStage: 'empty' | 'arriving' | 'sealing' | 'sealed' | 'transferring';
  tableBoxProgress: number;
  worker1CycleTimer: number;
  worker2State: 'approaching_table' | 'grabbing_box' | 'carrying_to_pallet' | 'placing_box' | 'returning';
  worker2Timer: number;
  stackedBoxesCount: number;
  maxBoxesOnPallet: number;
  palletDispatchPhase: 'idle' | 'wrapping' | 'dispatching' | 'resetting';
  palletDispatchTimer: number;
}

export interface ZincHoistState {
  machineId: string;
  trolley: THREE.Group;
  hoistArm: THREE.Group;
  rackWithClamps: THREE.Group;
  bubbles: THREE.Mesh[];
  cycleTimer: number;
}

export interface SceneObjectsMap {
  machineMeshes: Map<string, THREE.Group>;
  machineAndons: Map<string, { green: THREE.Mesh; amber: THREE.Mesh; red: THREE.Mesh; pointLight: THREE.PointLight }>;
  animatedParts: Map<string, { type: string; object: THREE.Object3D; basePos: THREE.Vector3; speed: number }>;
  flowingPieces: Array<{
    mesh: THREE.Mesh;
    phase: number;
    machineId: string;
    chuteStart: THREE.Vector3;
    chuteLip: THREE.Vector3;
    boxDrop: THREE.Vector3;
  }>;
  zincHoists: ZincHoistState[];
  tabletScreens: Map<string, {
    canvas: HTMLCanvasElement;
    texture: THREE.CanvasTexture;
    ctx: CanvasRenderingContext2D;
    machine: Machine;
  }>;
  routeLineGroup: THREE.Group;
  sectorGroup: THREE.Group;
  labelsGroup: THREE.Group;
  robotGroup: THREE.Group | null;
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
  agvRobots: Array<{
    group: THREE.Group;
    lidar: THREE.Mesh;
    cargoBoxes: THREE.Group;
    statusLed: THREE.Mesh;
    waypoints: THREE.Vector3[];
    currentSegmentIndex: number;
    segmentProgress: number;
    speed: number;
    pauseRemaining: number;
    hasCargo: boolean;
    name: string;
    sourceId: string;
  }>;
  packagingWorkers: Array<{
    group: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    torso: THREE.Group;
    task: 'taping' | 'stacking';
    baseY: number;
  }>;
  palletWrapperTurntable: THREE.Group | null;
  bihlerSourceBox: THREE.Group | null;
  cncSourceBox: THREE.Group | null;
  packagingIntakeBox: THREE.Group | null;
  tableWorkBox: THREE.Group | null;
  tableTapeMesh: THREE.Mesh | null;
  workerHeldBox: THREE.Group | null;
  stagingPalletGroup: THREE.Group | null;
  stagingPalletBoxes: THREE.Mesh[];
  stagingPalletWrap: THREE.Mesh | null;
  palletJackGroup: THREE.Group | null;
  logisticsState: LogisticsState;
}

export class FactorySceneBuilder {
  private scene: THREE.Scene;
  private objectsMap: SceneObjectsMap = {
    machineMeshes: new Map(),
    machineAndons: new Map(),
    animatedParts: new Map(),
    flowingPieces: [],
    zincHoists: [],
    tabletScreens: new Map(),
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
    agvRobots: [],
    packagingWorkers: [],
    palletWrapperTurntable: null,
    bihlerSourceBox: null,
    cncSourceBox: null,
    packagingIntakeBox: null,
    tableWorkBox: null,
    tableTapeMesh: null,
    workerHeldBox: null,
    stagingPalletGroup: null,
    stagingPalletBoxes: [],
    stagingPalletWrap: null,
    palletJackGroup: null,
    logisticsState: {
      bihlerBoxFull: true,
      cncBoxFull: true,
      intakeBoxReady: false,
      tableBoxStage: 'sealing',
      tableBoxProgress: 0,
      worker1CycleTimer: 0,
      worker2State: 'approaching_table',
      worker2Timer: 0,
      stackedBoxesCount: 2,
      maxBoxesOnPallet: 6,
      palletDispatchPhase: 'idle',
      palletDispatchTimer: 0
    }
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.objectsMap.routeLineGroup);
    this.scene.add(this.objectsMap.sectorGroup);
    this.scene.add(this.objectsMap.labelsGroup);
  }

  // Build the floor, walkways, pillars, and factory ambient geometry
  // Generate high-resolution procedural texture for light burnished concrete (Cimento Queimado) circulation floor & corridors
  private createWhiteIndustrialFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base genuine light burnished concrete (cinza cimento queimado claro)
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, 1024, 1024);

      // Organic smooth burnished trowel swirl marks and concrete tonal clouds
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

      // Modular polished concrete expansion joint grid (256px squares = approx 2.5m x 2.5m slabs)
      const tileSize = 256;
      for (let x = 0; x < 1024; x += tileSize) {
        for (let y = 0; y < 1024; y += tileSize) {
          // Slab surface burnished cement sheen
          const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
          grad.addColorStop(0, 'rgba(241, 245, 249, 0.35)');
          grad.addColorStop(0.5, 'rgba(203, 213, 225, 0.10)');
          grad.addColorStop(1, 'rgba(186, 201, 218, 0.25)');
          ctx.fillStyle = grad;
          ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

          // Slab expansion joint seam (junta de dilatação fina do piso)
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, tileSize, tileSize);

          // Specular trowel bevel highlight line
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

      // Fine cement aggregate grain and micro-pores
      ctx.fillStyle = 'rgba(100, 116, 139, 0.10)';
      for (let i = 0; i < 5000; i++) {
        const rx = Math.random() * 1024;
        const ry = Math.random() * 1024;
        const rsize = Math.random() * 2 + 0.5;
        ctx.fillRect(rx, ry, rsize, rsize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 14); // Repeats nicely over the 80m x 70m hall
    return texture;
  }

  // Generate high-resolution procedural texture for uniform light industrial gray sector floors (Sem retângulos/cortes)
  private createLightGraySectorFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Modern solid uniform light industrial gray epoxy (Cinza claro limpo e contínuo)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 512, 512);

      // Subtle fine micro-gradient for surface depth (sem linhas ou retângulos)
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, 'rgba(148, 163, 184, 0.12)');
      grad.addColorStop(0.5, 'rgba(100, 116, 139, 0.04)');
      grad.addColorStop(1, 'rgba(71, 85, 105, 0.10)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Fine anti-static metallic speckle micro-grain
      ctx.fillStyle = 'rgba(241, 245, 249, 0.10)';
      for (let i = 0; i < 3500; i++) {
        const rx = Math.random() * 512;
        const ry = Math.random() * 512;
        const rsize = Math.random() * 1.5 + 0.5;
        ctx.fillRect(rx, ry, rsize, rsize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  // Generate 45-degree yellow & black hazard stripe canvas texture
  private createHazardStripeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#facc15'; // OSHA Safety Yellow
      ctx.fillRect(0, 0, 128, 128);

      ctx.fillStyle = '#0f172a'; // Deep Industrial Black
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
    return texture;
  }

  // Build the floor, walkways, pillars, and factory ambient geometry
  public buildEnvironment(sectors: Sector[]): void {
    // 1. Factory Main Floor Base (Crisp white industrial epoxy slab - Expanded 110m x 84m)
    const whiteFloorTexture = this.createWhiteIndustrialFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(110, 84);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean white industrial epoxy base
      map: whiteFloorTexture,
      roughness: 0.38,
      metalness: 0.08
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Structural expansion joints grid (Fine industrial lines)
    const gridHelper = new THREE.GridHelper(110, 55, 0x94a3b8, 0xcbd5e1);
    gridHelper.position.y = 0.005;
    this.scene.add(gridHelper);

    // 3. Dedicated Circulation Walkways & Corridors (White painted aisles with yellow safety borders)
    this.buildSafetyWalkways();

    // 4. Sector zones painted in dark gray with solid yellow perimeter demarcation lines
    this.buildSectorFloors(sectors);

    // 5. Factory structural pillars with hazard safety bases
    this.buildPillars();

    // 6. Perimeter low guard walls & architectural bounds
    this.buildPerimeterBounds();

    // 7. Dedicated Packaging & Palletizing Stations (Bancadas, Operadores, Paletes)
    this.buildPackagingStations();

    // 8. Autonomous AGV / AMR Logistics Transport Fleet
    this.buildAutonomousAgvFleet();

    // 9. Machine Output Buffer Stations (Bihler & CNC Parts Outfeed)
    this.buildMachineSourceBuffers();
  }

  // Build dedicated burnished concrete circulation walkways, yellow border lines, zebra crossings, and logistics markings
  private buildSafetyWalkways(): void {
    // Walkway Burnished Concrete Material (Cimento Queimado Claro Polido)
    const walkwayMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.28,
      metalness: 0.08
    });

    // OSHA Safety Yellow Line Material
    const yellowLineMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.35,
      metalness: 0.1
    });

    // Hazard Stripe Texture Material
    const _hazardMat = new THREE.MeshStandardMaterial({
      map: this.createHazardStripeTexture(),
      roughness: 0.4
    });

    // --- A. MAIN CENTRAL AISLE (North-South: X = -2.0 to +2.0, standard width 4.0m) ---
    const centralAisle = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 76), walkwayMat);
    centralAisle.rotation.x = -Math.PI / 2;
    centralAisle.position.set(0, 0.015, 0);
    centralAisle.receiveShadow = true;
    this.scene.add(centralAisle);

    // Yellow boundary lines for central aisle (0.16m wide lines on left & right)
    const centralLeftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 76), yellowLineMat);
    centralLeftLine.rotation.x = -Math.PI / 2;
    centralLeftLine.position.set(-2.0, 0.02, 0);
    this.scene.add(centralLeftLine);

    const centralRightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 76), yellowLineMat);
    centralRightLine.rotation.x = -Math.PI / 2;
    centralRightLine.position.set(2.0, 0.02, 0);
    this.scene.add(centralRightLine);

    // Central dashed centerline (Forklift / AGV path guidance)
    for (let z = -34; z <= 34; z += 3.0) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.6), yellowLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, z);
      this.scene.add(dash);
    }

    // --- B. CROSS AISLES (East-West Corridors with standardized 3.6m width) ---
    // North Cross Aisle (Z = -8.8 to -5.2, width 3.6m, center Z = -7.0)
    const northCrossAisle = new THREE.Mesh(new THREE.PlaneGeometry(104, 3.6), walkwayMat);
    northCrossAisle.rotation.x = -Math.PI / 2;
    northCrossAisle.position.set(0, 0.015, -7.0);
    northCrossAisle.receiveShadow = true;
    this.scene.add(northCrossAisle);

    const northCrossTopLine = new THREE.Mesh(new THREE.PlaneGeometry(104, 0.16), yellowLineMat);
    northCrossTopLine.rotation.x = -Math.PI / 2;
    northCrossTopLine.position.set(0, 0.02, -8.8);
    this.scene.add(northCrossTopLine);

    const northCrossBottomLine = new THREE.Mesh(new THREE.PlaneGeometry(104, 0.16), yellowLineMat);
    northCrossBottomLine.rotation.x = -Math.PI / 2;
    northCrossBottomLine.position.set(0, 0.02, -5.2);
    this.scene.add(northCrossBottomLine);

    // South Cross Aisle (Z = 7.2 to 10.8, width 3.6m, center Z = 9.0)
    const southCrossAisle = new THREE.Mesh(new THREE.PlaneGeometry(104, 3.6), walkwayMat);
    southCrossAisle.rotation.x = -Math.PI / 2;
    southCrossAisle.position.set(0, 0.015, 9.0);
    southCrossAisle.receiveShadow = true;
    this.scene.add(southCrossAisle);

    const southCrossTopLine = new THREE.Mesh(new THREE.PlaneGeometry(104, 0.16), yellowLineMat);
    southCrossTopLine.rotation.x = -Math.PI / 2;
    southCrossTopLine.position.set(0, 0.02, 7.2);
    this.scene.add(southCrossTopLine);

    const southCrossBottomLine = new THREE.Mesh(new THREE.PlaneGeometry(104, 0.16), yellowLineMat);
    southCrossBottomLine.rotation.x = -Math.PI / 2;
    southCrossBottomLine.position.set(0, 0.02, 10.8);
    this.scene.add(southCrossBottomLine);

    // Inter-Sector Aisle between Rosca sem fim and Zincagem (X = -24.0 to -22.0, width 2.0m)
    const interAisle = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 12.4), walkwayMat);
    interAisle.rotation.x = -Math.PI / 2;
    interAisle.position.set(-23.0, 0.015, 1.0);
    interAisle.receiveShadow = true;
    this.scene.add(interAisle);

    const interLeftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 12.4), yellowLineMat);
    interLeftLine.rotation.x = -Math.PI / 2;
    interLeftLine.position.set(-24.0, 0.02, 1.0);
    this.scene.add(interLeftLine);

    const interRightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 12.4), yellowLineMat);
    interRightLine.rotation.x = -Math.PI / 2;
    interRightLine.position.set(-22.0, 0.02, 1.0);
    this.scene.add(interRightLine);

    // Inter-Sector Aisle between Bihler and Embalagem (X = 20.0 to 22.0, width 2.0m)
    const bihEmbAisle = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 21.2), walkwayMat);
    bihEmbAisle.rotation.x = -Math.PI / 2;
    bihEmbAisle.position.set(21.0, 0.015, 21.4);
    bihEmbAisle.receiveShadow = true;
    this.scene.add(bihEmbAisle);

    const bihEmbLeftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 21.2), yellowLineMat);
    bihEmbLeftLine.rotation.x = -Math.PI / 2;
    bihEmbLeftLine.position.set(20.0, 0.02, 21.4);
    this.scene.add(bihEmbLeftLine);

    const bihEmbRightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 21.2), yellowLineMat);
    bihEmbRightLine.rotation.x = -Math.PI / 2;
    bihEmbRightLine.position.set(22.0, 0.02, 21.4);
    this.scene.add(bihEmbRightLine);

    // Far South Perimeter Aisle (Z = 32.0 to 35.6, width 3.6m)
    const southPerimeterAisle = new THREE.Mesh(new THREE.PlaneGeometry(104, 3.6), walkwayMat);
    southPerimeterAisle.rotation.x = -Math.PI / 2;
    southPerimeterAisle.position.set(0, 0.015, 33.8);
    southPerimeterAisle.receiveShadow = true;
    this.scene.add(southPerimeterAisle);

    const southPerimeterLine = new THREE.Mesh(new THREE.PlaneGeometry(104, 0.16), yellowLineMat);
    southPerimeterLine.rotation.x = -Math.PI / 2;
    southPerimeterLine.position.set(0, 0.02, 32.0);
    this.scene.add(southPerimeterLine);

    // Far North Perimeter Aisle (Z = -35.6 to -32.0, width 3.6m)
    const northPerimeterAisle = new THREE.Mesh(new THREE.PlaneGeometry(104, 3.6), walkwayMat);
    northPerimeterAisle.rotation.x = -Math.PI / 2;
    northPerimeterAisle.position.set(0, 0.015, -33.8);
    northPerimeterAisle.receiveShadow = true;
    this.scene.add(northPerimeterAisle);

    const northPerimeterLine = new THREE.Mesh(new THREE.PlaneGeometry(104, 0.16), yellowLineMat);
    northPerimeterLine.rotation.x = -Math.PI / 2;
    northPerimeterLine.position.set(0, 0.02, -32.0);
    this.scene.add(northPerimeterLine);

    // --- C. INDUSTRIAL PEDESTRIAN ZEBRA CROSSINGS (Faixas de Pedestre) ---
    const crossingZPositions = [-33.8, -7.0, 9.0, 33.8];
    crossingZPositions.forEach((cz) => {
      // 7 alternating white & dark stripe bars spanning the 4.0m central aisle
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

    // --- D. LOGISTICS DIRECTIONAL ARROWS & PEDESTRIAN STENCILS ON CORRIDORS ---
    this.buildWalkwayStencils();
  }

  // Stencils on white floor corridors (Pedestrian icon, directional flow arrows)
  private buildWalkwayStencils(): void {
    // Canvas texture for pedestrian walking stencil
    const pedCanvas = document.createElement('canvas');
    pedCanvas.width = 256;
    pedCanvas.height = 256;
    const pctx = pedCanvas.getContext('2d');
    if (pctx) {
      pctx.clearRect(0, 0, 256, 256);
      pctx.fillStyle = '#0284c7'; // Vivid cyan-blue pedestrian stencil
      // Head
      pctx.beginPath();
      pctx.arc(128, 50, 24, 0, Math.PI * 2);
      pctx.fill();
      // Body
      pctx.beginPath();
      pctx.moveTo(112, 85);
      pctx.lineTo(144, 85);
      pctx.lineTo(152, 160);
      pctx.lineTo(104, 160);
      pctx.closePath();
      pctx.fill();
      // Left leg
      pctx.lineWidth = 14;
      pctx.strokeStyle = '#0284c7';
      pctx.beginPath();
      pctx.moveTo(116, 160);
      pctx.lineTo(96, 230);
      pctx.stroke();
      // Right leg
      pctx.beginPath();
      pctx.moveTo(140, 160);
      pctx.lineTo(164, 230);
      pctx.stroke();
    }
    const pedTex = new THREE.CanvasTexture(pedCanvas);
    const pedMat = new THREE.MeshBasicMaterial({ map: pedTex, transparent: true, opacity: 0.85 });

    // Place pedestrian stencils on central aisle
    const pedPositions = [
      { x: -1.2, z: -16 },
      { x: -1.2, z: 0 },
      { x: -1.2, z: 18 }
    ];
    pedPositions.forEach((pos) => {
      const pedMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), pedMat);
      pedMesh.rotation.x = -Math.PI / 2;
      pedMesh.position.set(pos.x, 0.022, pos.z);
      this.scene.add(pedMesh);
    });

    // Canvas texture for directional logistics arrow
    const arrowCanvas = document.createElement('canvas');
    arrowCanvas.width = 256;
    arrowCanvas.height = 256;
    const actx = arrowCanvas.getContext('2d');
    if (actx) {
      actx.clearRect(0, 0, 256, 256);
      actx.fillStyle = '#facc15'; // Yellow logistics arrow
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
      { x: 1.1, z: -16, rot: 0 },
      { x: 1.1, z: 0, rot: 0 },
      { x: 1.1, z: 18, rot: 0 }
    ];
    arrowPositions.forEach((pos) => {
      const arrowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), arrowMat);
      arrowMesh.rotation.x = -Math.PI / 2;
      arrowMesh.rotation.z = pos.rot;
      arrowMesh.position.set(pos.x, 0.022, pos.z);
      this.scene.add(arrowMesh);
    });
  }

  // Build light industrial gray sector floors, solid yellow perimeter demarcation lines, and entrance hazard gates
  private buildSectorFloors(sectors: Sector[]): void {
    const lightFloorTex = this.createLightGraySectorFloorTexture();
    const hazardTex = this.createHazardStripeTexture();

    // Shared Materials for Sectors
    const sectorMat = new THREE.MeshStandardMaterial({
      color: 0x556477, // Solid Light-Mid Industrial Gray Floor
      map: lightFloorTex,
      roughness: 0.46,
      metalness: 0.14
    });

    // OSHA Safety Yellow Line Material (0.18m wide solid border meshes)
    const yellowBorderMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Bright OSHA safety yellow
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

      // 1. Solid Light Industrial Gray Sector Floor Slab (Sits cleanly at y = 0.012)
      const sectorFloorGeo = new THREE.PlaneGeometry(width, depth);
      const sectorMesh = new THREE.Mesh(sectorFloorGeo, sectorMat);
      sectorMesh.rotation.x = -Math.PI / 2;
      sectorMesh.position.set(centerX, 0.012, centerZ);
      sectorMesh.receiveShadow = true;
      this.objectsMap.sectorGroup.add(sectorMesh);

      // Subtle sector color identity wash overlay (Very slight accent tint)
      const tintMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(sec.color),
        transparent: true,
        opacity: 0.04
      });
      const tintMesh = new THREE.Mesh(sectorFloorGeo, tintMat);
      tintMesh.rotation.x = -Math.PI / 2;
      tintMesh.position.set(centerX, 0.014, centerZ);
      this.objectsMap.sectorGroup.add(tintMesh);

      // 2. High-Precision Solid Yellow Perimeter Demarcation Lines (Linhas Amarelas Contornando os Setores)
      const lw = 0.18; // Line width in meters (18cm real industrial safety line)

      // Top Border (along minZ)
      const topBorder = new THREE.Mesh(new THREE.PlaneGeometry(width + lw, lw), yellowBorderMat);
      topBorder.rotation.x = -Math.PI / 2;
      topBorder.position.set(centerX, 0.024, minZ);
      this.objectsMap.sectorGroup.add(topBorder);

      // Bottom Border (along maxZ)
      const bottomBorder = new THREE.Mesh(new THREE.PlaneGeometry(width + lw, lw), yellowBorderMat);
      bottomBorder.rotation.x = -Math.PI / 2;
      bottomBorder.position.set(centerX, 0.024, maxZ);
      this.objectsMap.sectorGroup.add(bottomBorder);

      // Left Border (along minX)
      const leftBorder = new THREE.Mesh(new THREE.PlaneGeometry(lw, depth + lw), yellowBorderMat);
      leftBorder.rotation.x = -Math.PI / 2;
      leftBorder.position.set(minX, 0.024, centerZ);
      this.objectsMap.sectorGroup.add(leftBorder);

      // Right Border (along maxX)
      const rightBorder = new THREE.Mesh(new THREE.PlaneGeometry(lw, depth + lw), yellowBorderMat);
      rightBorder.rotation.x = -Math.PI / 2;
      rightBorder.position.set(maxX, 0.024, centerZ);
      this.objectsMap.sectorGroup.add(rightBorder);

      // 3. Corner L-Brackets (Cantoneiras de Demarcação Industrial Reforçadas nos 4 cantos)
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

      // 4. Sector Entrance Gateway (Faixa zebrada de segurança na entrada do setor)
      // Determine which side is adjacent to the central aisle
      let gateX = centerX;
      let gateZ = minZ + 0.4;
      if (maxX <= 2) {
        // Sector is on the West side: entrance is on right edge (maxX)
        gateX = maxX;
        gateZ = centerZ;
        const gateHatch = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.4), hazardMat);
        gateHatch.rotation.x = -Math.PI / 2;
        gateHatch.position.set(gateX, 0.025, gateZ);
        this.objectsMap.sectorGroup.add(gateHatch);
      } else if (minX >= 2) {
        // Sector is on the East side: entrance is on left edge (minX)
        gateX = minX;
        gateZ = centerZ;
        const gateHatch = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.4), hazardMat);
        gateHatch.rotation.x = -Math.PI / 2;
        gateHatch.position.set(gateX, 0.025, gateZ);
        this.objectsMap.sectorGroup.add(gateHatch);
      }

      // 5. 3D Sector Ground Identification Badge (Placa de Chão com Identificação do Setor)
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 512;
      textCanvas.height = 128;
      const ctx = textCanvas.getContext('2d');
      if (ctx) {
        // Badge dark slate container with rounded corners
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(8, 8, 496, 112, 14);
        ctx.fill();

        // Safety yellow outer border
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Sector accent color side pill
        ctx.fillStyle = sec.color;
        ctx.beginPath();
        ctx.roundRect(16, 16, 16, 96, 8);
        ctx.fill();

        // Sector code & name
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 30px "Plus Jakarta Sans", monospace';
        ctx.fillText(sec.code, 44, 52);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
        const displayName = sec.name.length > 24 ? sec.name.slice(0, 22) + '...' : sec.name;
        ctx.fillText(displayName.toUpperCase(), 44, 94);
      }

      const labelTex = new THREE.CanvasTexture(textCanvas);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
      const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), labelMat);
      labelMesh.rotation.x = -Math.PI / 2;

      // Position badge just inside the entrance area of the sector
      const labelZ = minZ + 1.2;
      labelMesh.position.set(centerX, 0.028, labelZ);
      this.objectsMap.labelsGroup.add(labelMesh);
    });
  }

  // Structural pillars placed along exterior wall lines, 100% clear of all corridors and walkways
  private buildPillars(): void {
    const pillarGeo = new THREE.BoxGeometry(0.8, 12, 0.8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7
    });

    // Positions strictly along perimeter walls (X = -50.5 and X = +50.5)
    const positions = [
      { x: -50.5, z: -30 },
      { x: -50.5, z: -15 },
      { x: -50.5, z: 0 },
      { x: -50.5, z: 15 },
      { x: -50.5, z: 30 },
      { x: 50.5, z: -30 },
      { x: 50.5, z: -15 },
      { x: 50.5, z: 0 },
      { x: 50.5, z: 15 },
      { x: 50.5, z: 30 }
    ];

    positions.forEach((p) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(p.x, 6, p.z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);

      // Yellow hazard stripes base
      const baseGeo = new THREE.BoxGeometry(1.0, 1.2, 1.0);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.6 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(p.x, 0.6, p.z);
      this.scene.add(baseMesh);
    });
  }

  private buildPerimeterBounds(): void {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8
    });

    // Low architectural boundaries (height 1.8m)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(106, 2.4, 0.6), wallMat);
    backWall.position.set(0, 1.2, -36);
    this.scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(106, 2.4, 0.6), wallMat);
    frontWall.position.set(0, 1.2, 36);
    this.scene.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 72), wallMat);
    leftWall.position.set(-52, 1.2, 0);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 72), wallMat);
    rightWall.position.set(52, 1.2, 0);
    this.scene.add(rightWall);
  }

  // Build high-fidelity procedural 3D model for each machine
  public buildMachines(machines: Machine[]): SceneObjectsMap {
    machines.forEach((machine) => {
      const machineGroup = new THREE.Group();
      machineGroup.position.set(machine.position.x, machine.position.y, machine.position.z);
      machineGroup.userData = { machineId: machine.id, isMachine: true };

      // Base machine chassis (dark charcoal industrial casting)
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.4,
        roughness: 0.5
      });

      // Accent panels (industrial blue or light gray)
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb, // SFioT industrial blue
        metalness: 0.2,
        roughness: 0.4
      });

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.8,
        roughness: 0.25
      });

      // Build model based on category
      switch (machine.category) {
        case 'bihler-linha-pecas':
          this.buildBihlerProductionLineModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'bihler-combinada':
          this.buildBihlerModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'cnc-usinagem':
          this.buildCncModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'prensa-mola':
          this.buildStampingPressModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'linha-zincagem':
          this.buildZincLineModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'laminadora-rosca':
          this.buildThreadRollerModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'ferramentaria-retifica':
          this.buildToolroomModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'embalagem-seladora':
          this.buildSealingMachineModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        case 'embalagem-paletizadora':
          this.buildPalletStretchWrapperModel(machineGroup, chassisMat, panelMat, metalMat, machine);
          break;
        default:
          this.buildGenericIndustrialMachine(machineGroup, chassisMat, panelMat, metalMat, machine);
      }

      // Add Andon Beacon Tower on top
      const andonData = this.buildAndonTower(machineGroup, machine);
      this.objectsMap.machineAndons.set(machine.id, andonData);

      // Add Nameplate & Status Badge
      this.buildMachineNameplate(machineGroup, machine);

      this.scene.add(machineGroup);
      this.objectsMap.machineMeshes.set(machine.id, machineGroup);
    });

    return this.objectsMap;
  }

  // --- MODEL: LINHA BIHLER · ESTAMPAGEM CONTÍNUA, DESBOBINADOR, FLUXO DE PEÇAS & TABLET HMI ---
  private buildBihlerProductionLineModel(
    group: THREE.Group,
    _chassisMat: THREE.Material,
    _panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    // 0. High-Quality Dedicated Materials for Bihler Stamping Line
    const bihlerGreenMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a2f, // Reseda Industrial Green (RAL 6011 Classic Bihler)
      metalness: 0.35,
      roughness: 0.45
    });

    const bihlerSlateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep industrial slate
      metalness: 0.5,
      roughness: 0.5
    });

    const steelStripMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc, // Shiny cold-rolled stainless steel
      metalness: 0.92,
      roughness: 0.2
    });

    const shinyChromeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.95,
      roughness: 0.12
    });

    const safetyYellowMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Safety Yellow
      metalness: 0.2,
      roughness: 0.4
    });

    const transparentGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.8,
      transparent: true,
      opacity: 0.35
    });

    // 1. SAFETY FLOOR PERIMETER (Faixas zebradas e guarda-corpos do setor)
    // 1a. Hazard floor striping under uncoiler
    const uncoilerHatch = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.7 })
    );
    uncoilerHatch.rotation.x = -Math.PI / 2;
    uncoilerHatch.position.set(-3.6, 0.015, 0);
    group.add(uncoilerHatch);

    // 1b. Hazard floor striping under collection pallet
    const palletHatch = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.7 })
    );
    palletHatch.rotation.x = -Math.PI / 2;
    palletHatch.position.set(3.4, 0.015, 0.3);
    group.add(palletHatch);

    // 1c. Yellow tubular safety guardrail around uncoiler perimeter
    const railMat = safetyYellowMat;
    const postGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 16);
    const railPosts = [
      new THREE.Vector3(-5.3, 0.55, -1.3),
      new THREE.Vector3(-5.3, 0.55, 1.3),
      new THREE.Vector3(-2.2, 0.55, -1.3),
      new THREE.Vector3(-2.2, 0.55, 1.3)
    ];
    railPosts.forEach((pos) => {
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.copy(pos);
      group.add(post);
    });

    // Horizontal rails
    const rearRail = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.04, 0.04), railMat);
    rearRail.position.set(-3.75, 1.05, -1.3);
    group.add(rearRail);

    const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 2.6), railMat);
    sideRail.position.set(-5.3, 1.05, 0);
    group.add(sideRail);

    // =========================================================================
    // 2. DESBOBINADOR DE FITA DE AÇO (HEAVY INDUSTRIAL DECOILER / UNCOILER REEL)
    // =========================================================================
    const uncoilerGroup = new THREE.Group();
    uncoilerGroup.position.set(-3.6, 0, 0);

    // Base pedestal casting
    const uncoilerBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.4), bihlerSlateMat);
    uncoilerBase.position.y = 0.45;
    uncoilerBase.castShadow = true;
    uncoilerGroup.add(uncoilerBase);

    // Drive motor & reduction gearbox on rear
    const motorBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.6), bihlerGreenMat);
    motorBox.position.set(0, 0.75, -0.85);
    uncoilerGroup.add(motorBox);

    // Spindle support upright column
    const spindleUpright = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.25, 0.48), metalMat);
    spindleUpright.position.set(0, 1.4, 0);
    spindleUpright.castShadow = true;
    uncoilerGroup.add(spindleUpright);

    // Horizontal spindle shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 24), metalMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(0, 1.65, 0.05);
    uncoilerGroup.add(shaft);

    // ROTATING REEL ASSEMBLY (Bobina de aço + Pratos de guia laterais)
    const reelRotatingGroup = new THREE.Group();
    reelRotatingGroup.position.set(0, 1.65, 0.05);

    // Main steel coil (Bobina pesada de fita de aço inox)
    const coilMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.34, 36),
      steelStripMat
    );
    coilMesh.rotation.x = Math.PI / 2;
    coilMesh.castShadow = true;
    reelRotatingGroup.add(coilMesh);

    // Inner bronze mandrel wedges
    const innerMandrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.36, 24),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 })
    );
    innerMandrel.rotation.x = Math.PI / 2;
    reelRotatingGroup.add(innerMandrel);

    // Lateral containment disks with spokes (Pratos de guia lateral com raios)
    for (const zOffset of [-0.2, 0.2]) {
      const diskGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.02, 32);
      const disk = new THREE.Mesh(diskGeo, metalMat);
      disk.rotation.x = Math.PI / 2;
      disk.position.z = zOffset;
      reelRotatingGroup.add(disk);

      // Contrast radial spokes
      for (let s = 0; s < 4; s++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.025), bihlerSlateMat);
        spoke.rotation.z = (s * Math.PI) / 4;
        spoke.position.z = zOffset;
        reelRotatingGroup.add(spoke);
      }
    }

    uncoilerGroup.add(reelRotatingGroup);
    group.add(uncoilerGroup);

    // Animate coil reel continuous wheel rotation around its Z axis when machine is running
    this.objectsMap.animatedParts.set(`${machine.id}-decoiler-reel`, {
      type: 'rotate-z-inv',
      object: reelRotatingGroup,
      basePos: reelRotatingGroup.position.clone(),
      speed: 0.9
    });

    // Strip straightener unit (Endireitador de 7 roletes de precisão)
    const straightenerGroup = new THREE.Group();
    straightenerGroup.position.set(-1.95, 1.4, 0.05);

    const straightenerFrame = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.45), bihlerSlateMat);
    straightenerFrame.position.y = 0.25;
    straightenerGroup.add(straightenerFrame);

    // 7 horizontal rollers
    for (let r = 0; r < 5; r++) {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.38, 16), shinyChromeMat);
      roller.rotation.x = Math.PI / 2;
      roller.position.set(-0.25 + r * 0.12, 0.22 + (r % 2 === 0 ? 0.05 : -0.05), 0);
      straightenerGroup.add(roller);
    }

    // Top knurled adjustment handwheels
    for (let h = 0; h < 2; h++) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16), metalMat);
      wheel.position.set(-0.15 + h * 0.3, 0.55, 0);
      straightenerGroup.add(wheel);
    }

    group.add(straightenerGroup);

    // Dancer loop tension arm (Braço sensor bailarim com rolete)
    const dancerArm = new THREE.Group();
    dancerArm.position.set(-2.8, 1.5, 0.05);

    const dancerBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, 0.04), safetyYellowMat);
    dancerBar.position.y = -0.25;
    dancerArm.add(dancerBar);

    const dancerRoller = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.36, 16), shinyChromeMat);
    dancerRoller.rotation.x = Math.PI / 2;
    dancerRoller.position.y = -0.52;
    dancerArm.add(dancerRoller);
    group.add(dancerArm);

    // Subtle tension loop oscillation on dancer arm
    this.objectsMap.animatedParts.set(`${machine.id}-dancer`, {
      type: 'vibrate-y',
      object: dancerArm,
      basePos: dancerArm.position.clone(),
      speed: 1.0
    });

    // Continuous steel strip (Fita de aço estirada alimentando a estamparia)
    // Curva descendo do topo da bobina, passando pelo laço e entrando na máquina
    const stripCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.6, 2.5, 0.05),
      new THREE.Vector3(-3.1, 1.8, 0.05),
      new THREE.Vector3(-2.8, 1.05, 0.05), // Laço / folga
      new THREE.Vector3(-2.2, 1.45, 0.05),
      new THREE.Vector3(-1.6, 1.48, 0.05), // Entrada do ferramental
      new THREE.Vector3(-0.9, 1.48, 0.05)
    ]);
    const stripGeo = new THREE.TubeGeometry(stripCurve, 32, 0.025, 8, false);
    const stripMesh = new THREE.Mesh(stripGeo, steelStripMat);
    group.add(stripMesh);

    // =========================================================================
    // 3. MÁQUINA BIHLER GRM-80 (PRENSA MULTI-SLIDE RADIAL & CABINE DE PROTEÇÃO)
    // =========================================================================
    // Base casting in classic Reseda Green
    const machineBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.95, 2.8), bihlerGreenMat);
    machineBase.position.y = 0.475;
    machineBase.castShadow = true;
    machineBase.receiveShadow = true;
    group.add(machineBase);

    // Upper steel bed plate
    const bedPlate = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 3.0), bihlerSlateMat);
    bedPlate.position.y = 1.01;
    group.add(bedPlate);

    // Soundproofing & Safety Enclosure Cabin (Cabine acústica com janelas de policarbonato)
    const cabinFrameGroup = new THREE.Group();
    cabinFrameGroup.position.set(0, 1.07, 0);

    // 4 Corner structural extruded aluminum pillars
    const cornerPillars = [
      new THREE.Vector3(-1.75, 1.0, -1.35),
      new THREE.Vector3(-1.75, 1.0, 1.35),
      new THREE.Vector3(1.75, 1.0, -1.35),
      new THREE.Vector3(1.75, 1.0, 1.35)
    ];
    cornerPillars.forEach((p) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 0.12), metalMat);
      col.position.copy(p);
      cabinFrameGroup.add(col);
    });

    // Roof enclosure with exhaust ventilation hood
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.2, 2.9), bihlerGreenMat);
    roof.position.y = 2.05;
    cabinFrameGroup.add(roof);

    const ventHood = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.4, 24), bihlerSlateMat);
    ventHood.position.set(0, 2.3, 0);
    cabinFrameGroup.add(ventHood);

    // Front panoramic acrylic viewing window
    const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.6), transparentGlassMat);
    frontWindow.position.set(0, 1.05, 1.36);
    cabinFrameGroup.add(frontWindow);

    // Sliding door handles in safety yellow
    for (const hx of [-0.3, 0.3]) {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 12), safetyYellowMat);
      handle.position.set(hx, 1.05, 1.39);
      cabinFrameGroup.add(handle);
    }

    // Side windows
    const leftWindow = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.6), transparentGlassMat);
    leftWindow.rotation.y = Math.PI / 2;
    leftWindow.position.set(-1.76, 1.05, 0);
    cabinFrameGroup.add(leftWindow);

    const rightWindow = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.6), transparentGlassMat);
    rightWindow.rotation.y = -Math.PI / 2;
    rightWindow.position.set(1.76, 1.05, 0);
    cabinFrameGroup.add(rightWindow);

    group.add(cabinFrameGroup);

    // --- INTERIOR TOOLING ZONE (DISCO RADIAL & UNIDADES DE CONFORMAÇÃO) ---
    // Central radial tooling faceplate (Disco montado verticalmente)
    const faceplate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 0.2, 32),
      metalMat
    );
    faceplate.rotation.x = Math.PI / 2;
    faceplate.position.set(0, 2.05, 0.1);
    faceplate.castShadow = true;
    group.add(faceplate);

    // 4 Radial multi-slide units arranged around the center
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.75, 0.3), bihlerSlateMat);
      slide.position.set(Math.cos(angle) * 0.95, 2.05 + Math.sin(angle) * 0.95, 0.25);
      slide.rotation.z = angle;
      group.add(slide);

      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 16), shinyChromeMat);
      piston.position.set(Math.cos(angle) * 0.7, 2.05 + Math.sin(angle) * 0.7, 0.25);
      piston.rotation.z = angle + Math.PI / 2;
      group.add(piston);
    }

    // Reciprocating central punch tool block (Punção superior móvel)
    const punchTool = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.38), shinyChromeMat);
    punchTool.position.set(0, 1.95, 0.3);
    punchTool.castShadow = true;
    group.add(punchTool);

    // High-speed stamping stroke animation
    this.objectsMap.animatedParts.set(`${machine.id}-punch`, {
      type: 'stroke-y',
      object: punchTool,
      basePos: punchTool.position.clone(),
      speed: 2.8
    });

    // Interior cool white work spotlight (Iluminação interna da cabine)
    const interiorLight = new THREE.PointLight(0xffffff, 2.8, 5.5);
    interiorLight.position.set(0, 2.8, 0.6);
    group.add(interiorLight);

    // Emergency stop mushroom pushbuttons with yellow collars
    for (const ex of [-1.75, 1.75]) {
      const eCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), safetyYellowMat);
      eCollar.position.set(ex, 1.45, 1.42);
      eCollar.rotation.x = Math.PI / 2;
      group.add(eCollar);

      const eBtn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
      );
      eBtn.position.set(ex, 1.45, 1.44);
      eBtn.rotation.x = Math.PI / 2;
      group.add(eBtn);
    }

    // =========================================================================
    // 4. CALHA DE SAÍDA & CAIXA COLETORA DE PEÇAS (EJECTION CHUTE & TOTE BOX)
    // =========================================================================
    // Incline stainless steel ejection chute extending out the right side of the machine
    const chuteGroup = new THREE.Group();
    chuteGroup.position.set(1.7, 1.15, 0.25);

    // Incline angle: descending ~30 degrees towards +X
    const chuteIncline = -0.32;
    const chuteBed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.03, 0.42), shinyChromeMat);
    chuteBed.rotation.z = chuteIncline;
    chuteBed.position.set(0.65, -0.22, 0);
    chuteGroup.add(chuteBed);

    // Chute side retention walls
    for (const zw of [-0.22, 0.22]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.02), shinyChromeMat);
      wall.rotation.z = chuteIncline;
      wall.position.set(0.65, -0.18, zw);
      chuteGroup.add(wall);
    }

    // Support strut under chute lip
    const chuteLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12), metalMat);
    chuteLeg.position.set(1.45, -0.52, 0);
    chuteGroup.add(chuteLeg);

    group.add(chuteGroup);

    // Industrial Wooden EUR-Pallet under the collection box
    const palletGroup = new THREE.Group();
    palletGroup.position.set(3.4, 0.07, 0.25);

    const palletWoodMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Pine wood color
      roughness: 0.85
    });

    // Top slats
    for (let s = 0; s < 5; s++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.025, 0.15), palletWoodMat);
      slat.position.set(0, 0.05, -0.36 + s * 0.18);
      palletGroup.add(slat);
    }
    // Cross blocks
    for (let b = 0; b < 3; b++) {
      const block = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.1), palletWoodMat);
      block.position.set(0, -0.01, -0.32 + b * 0.32);
      palletGroup.add(block);
    }
    group.add(palletGroup);

    // Industrial Blue Euro-KLT Collection Box (Caixa plástica de contenção de peças)
    const boxGroup = new THREE.Group();
    boxGroup.position.set(3.4, 0.38, 0.25);

    const kltBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Heavy-duty industrial polypropylene blue
      roughness: 0.45,
      metalness: 0.1
    });

    // Box outer base & walls
    const boxBottom = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.65), kltBlueMat);
    boxBottom.position.y = -0.18;
    boxGroup.add(boxBottom);

    // 4 Walls
    const wallFront = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.04), kltBlueMat);
    wallFront.position.set(0, 0.03, 0.31);
    boxGroup.add(wallFront);

    const wallBack = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.04), kltBlueMat);
    wallBack.position.set(0, 0.03, -0.31);
    boxGroup.add(wallBack);

    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.58), kltBlueMat);
    wallLeft.position.set(-0.46, 0.03, 0);
    boxGroup.add(wallLeft);

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.58), kltBlueMat);
    wallRight.position.set(0.46, 0.03, 0);
    boxGroup.add(wallRight);

    // External reinforcement ribs
    for (let r = -0.35; r <= 0.35; r += 0.22) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.03), kltBlueMat);
      rib.position.set(r, 0.03, 0.33);
      boxGroup.add(rib);
    }

    // Identification tag on front of box: "OP-77290 · LOTE BIH-08"
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 256;
    tagCanvas.height = 96;
    const tCtx = tagCanvas.getContext('2d');
    if (tCtx) {
      tCtx.fillStyle = '#ffffff';
      tCtx.fillRect(0, 0, 256, 96);
      tCtx.fillStyle = '#0f172a';
      tCtx.font = 'bold 22px monospace';
      tCtx.fillText('OP-77290 · BIHLER', 12, 32);
      tCtx.font = 'bold 18px monospace';
      tCtx.fillText('LOTE L26-BIH08', 12, 58);
      tCtx.font = '14px monospace';
      tCtx.fillText('QTD: 24.850 PCS', 12, 80);
    }
    const tagTex = new THREE.CanvasTexture(tagCanvas);
    const tagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.12),
      new THREE.MeshBasicMaterial({ map: tagTex })
    );
    tagMesh.position.set(0, 0.05, 0.34);
    boxGroup.add(tagMesh);

    // Bed of accumulated stamped parts inside the box
    const accumulatedBed = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.18, 0.52),
      shinyChromeMat
    );
    accumulatedBed.position.set(0, -0.06, 0);
    boxGroup.add(accumulatedBed);

    // Several static decorative clip pieces in the pile
    for (let c = 0; c < 8; c++) {
      const pileClip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.14), shinyChromeMat);
      pileClip.position.set(
        (Math.random() - 0.5) * 0.6,
        0.04 + Math.random() * 0.03,
        (Math.random() - 0.5) * 0.35
      );
      pileClip.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.3);
      boxGroup.add(pileClip);
    }

    group.add(boxGroup);

    // --- 5. SIMULAÇÃO DINÂMICA DE PEÇAS SAINDO DA MÁQUINA E CAINDO NA CAIXA ---
    // 12 stamped metal pieces (Presilhas de fixação inox em trânsito)
    const clipGeo = new THREE.BoxGeometry(0.13, 0.035, 0.15);
    const totalPieces = 12;

    const chuteStart = new THREE.Vector3(0.8, 1.42, 0.25);
    const chuteLip = new THREE.Vector3(2.65, 0.88, 0.25);
    const boxDrop = new THREE.Vector3(3.4, 0.36, 0.25);

    for (let i = 0; i < totalPieces; i++) {
      const pieceMesh = new THREE.Mesh(clipGeo, shinyChromeMat);
      pieceMesh.castShadow = true;
      group.add(pieceMesh);

      this.objectsMap.flowingPieces.push({
        mesh: pieceMesh,
        phase: i / totalPieces,
        machineId: machine.id,
        chuteStart: chuteStart.clone(),
        chuteLip: chuteLip.clone(),
        boxDrop: boxDrop.clone()
      });
    }

    // =========================================================================
    // 6. TABLET MOSTRANDO INFORMAÇÕES AO VIVO (OPERATOR HMI TABLET STAND)
    // =========================================================================
    // Positioned at local (1.6, 0, 1.8) facing the operator walkway
    const tabletStandGroup = new THREE.Group();
    tabletStandGroup.position.set(1.6, 0, 1.8);
    tabletStandGroup.rotation.y = -Math.PI / 4.5; // Tilted towards the operator corridor

    // Cast iron floor base plate
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.05, 24), bihlerSlateMat);
    standBase.position.y = 0.025;
    tabletStandGroup.add(standBase);

    // Vertical steel column
    const standPost = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.35, 16), metalMat);
    standPost.position.y = 0.70;
    tabletStandGroup.add(standPost);

    // Articulated mounting arm tilted 25° upwards
    const tabletHead = new THREE.Group();
    tabletHead.position.set(0, 1.42, 0.08);
    tabletHead.rotation.x = -0.38; // Ergonomic tilt towards viewer

    // Ruggedized tablet casing (Chassi emborrachado preto com cantos amarelos de absorção)
    const tabletCase = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.40, 0.045), bihlerSlateMat);
    tabletHead.add(tabletCase);

    // 4 Protective yellow elastomer bumper corners
    const cornerOffsets = [
      [-0.27, -0.19],
      [-0.27, 0.19],
      [0.27, -0.19],
      [0.27, 0.19]
    ];
    cornerOffsets.forEach(([cx, cy]) => {
      const corner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.05), safetyYellowMat);
      corner.position.set(cx, cy, 0);
      tabletHead.add(corner);
    });

    // High-Resolution Live Telemetry Screen Canvas (1024 x 640)
    const tabletCanvas = document.createElement('canvas');
    tabletCanvas.width = 1024;
    tabletCanvas.height = 640;
    const tabCtx = tabletCanvas.getContext('2d');

    if (tabCtx) {
      this.drawTabletHMI(tabCtx, machine, 0);
    }

    const tabletTexture = new THREE.CanvasTexture(tabletCanvas);
    const tabletScreenMat = new THREE.MeshBasicMaterial({
      map: tabletTexture
    });

    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.50, 0.34), tabletScreenMat);
    screenMesh.position.set(0, 0, 0.026);
    screenMesh.userData = { machineId: machine.id, isMachine: true, isTablet: true };
    tabletHead.add(screenMesh);

    tabletStandGroup.add(tabletHead);
    group.add(tabletStandGroup);

    // Register tablet screen for dynamic animated oscilloscope updates
    if (tabCtx) {
      this.objectsMap.tabletScreens.set(machine.id, {
        canvas: tabletCanvas,
        texture: tabletTexture,
        ctx: tabCtx,
        machine: machine
      });
    }
  }

  // Draw procedural high-contrast industrial HMI screen on the tablet canvas
  private drawTabletHMI(ctx: CanvasRenderingContext2D, machine: Machine, timeOffset: number): void {
    const w = 1024;
    const h = 640;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Top status header bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 64);

    // Header title
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SFioT HMI · BIHLER GRM-80 CNC', 24, 42);

    // WiFi / IP beacon
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px monospace';
    ctx.fillText(`IP: ${machine.telemetry.esp32.ip} · 24V OPTO-OK`, w - 340, 42);

    // Status Banner: "EM CICLO AUTOMÁTICO"
    ctx.fillStyle = '#065f46';
    ctx.roundRect(24, 80, w - 48, 68, 12);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('● EM CICLO / PRODUZINDO [AUTO] · 85.7 PPM', 44, 126);

    // Current OP Order Card
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(24, 164, w - 48, 86, 12);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ORDEM DE PRODUÇÃO ATIVA', 44, 196);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${machine.currentOrder.orderNumber} · ${machine.currentOrder.productName}`,
      44,
      232
    );

    // KPI Metrics 4-Column Grid
    const kpis = [
      {
        label: 'PEÇAS PRODUZIDAS',
        val: `${machine.currentOrder.producedQty.toLocaleString('pt-BR')} un`,
        sub: `Meta: ${machine.currentOrder.plannedQty.toLocaleString('pt-BR')} (82.8%)`,
        col: '#38bdf8'
      },
      {
        label: 'OEE GERAL',
        val: `${machine.kpi.oee}%`,
        sub: `Disp: ${machine.kpi.availability}% | Perf: ${machine.kpi.performance}%`,
        col: '#10b981'
      },
      {
        label: 'CADÊNCIA / CICLO',
        val: `${machine.telemetry.piecesPerMinute} PPM`,
        sub: `Tempo de Ciclo: ${machine.telemetry.cycleTimeSec}s`,
        col: '#fbbf24'
      },
      {
        label: 'BOBINA DE FITA',
        val: '84% RESTANTE',
        sub: 'Aço Inox 301 · Esp: 0.8mm',
        col: '#a855f7'
      }
    ];

    const colW = (w - 48 - 36) / 4;
    kpis.forEach((kpi, idx) => {
      const kx = 24 + idx * (colW + 12);
      ctx.fillStyle = '#1e293b';
      ctx.roundRect(kx, 266, colW, 140, 12);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(kpi.label, kx + 16, 296);

      ctx.fillStyle = kpi.col;
      ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(kpi.val, kx + 16, 340);

      ctx.fillStyle = '#64748b';
      ctx.font = '13px monospace';
      ctx.fillText(kpi.sub, kx + 16, 380);
    });

    // Bottom Telemetry Live Pulse Oscilloscope (Sensor óptico do ciclo de estampagem)
    ctx.fillStyle = '#090d16';
    ctx.roundRect(24, 424, w - 48, 192, 12);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('ESP32 GPIO-24V · PULSOS DO SENSOR ÓPTICO DE PEÇA & FITA DE AÇO', 44, 456);

    // Draw live waveform trace
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    const waveStartX = 44;
    const waveEndX = w - 44;
    const waveY = 540;

    for (let x = waveStartX; x < waveEndX; x += 4) {
      const relX = (x - waveStartX) / 40;
      // Stamping cycle pulse spike waveform
      const sine = Math.sin(relX * 1.8 + timeOffset * 4);
      const spike = Math.pow(Math.max(0, Math.sin(relX * 1.8 + timeOffset * 4)), 8) * 45;
      const y = waveY - sine * 14 - spike;
      if (x === waveStartX) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Secondary line: Pressure & Temperature
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(
      `TEMP: ${machine.telemetry.temperature}°C · VIB: ${machine.telemetry.vibration} mm/s · PRESSÃO: ${machine.telemetry.pressure} bar · PEÇAS NA CAIXA: +12/min`,
      44,
      596
    );
  }

  // --- MODEL: PRENSA COMBINADA DE ESTAMPAGEM & CONFORMAÇÃO COM DESBOBINADOR (CONFORME FOTO DE REFERÊNCIA) ---
  private buildBihlerModel(
    group: THREE.Group,
    _chassisMat: THREE.Material,
    _panelMat: THREE.Material,
    _metalMat: THREE.Material,
    machine: Machine
  ): void {
    // Specific Materials matching the reference photo
    const pressBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Modern industrial royal blue
      metalness: 0.4,
      roughness: 0.35
    });

    const pressWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean industrial off-white
      metalness: 0.2,
      roughness: 0.35
    });

    const safetyYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Bright OSHA safety yellow die
      metalness: 0.25,
      roughness: 0.3
    });

    const shinyChromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.12
    });

    const steelStripMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.6,
      roughness: 0.4
    });

    // =========================================================================
    // 1. ESTRUTURA PRINCIPAL DA PRENSA (CENTRO / ESQUERDA)
    // =========================================================================
    const pressGroup = new THREE.Group();
    pressGroup.position.set(-0.6, 0, 0);

    // Base Frame (Chassi Inferior Azul)
    const baseBed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.85, 2.2), pressBlueMat);
    baseBed.position.y = 0.425;
    baseBed.castShadow = true;
    baseBed.receiveShadow = true;
    pressGroup.add(baseBed);

    // Left Column Upright (Coluna Esquerda Azul com Painel Frontal Branco)
    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.4, 1.8), pressBlueMat);
    leftCol.position.set(-1.05, 2.05, 0);
    leftCol.castShadow = true;
    pressGroup.add(leftCol);

    const leftColTrim = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.2, 0.06), pressWhiteMat);
    leftColTrim.position.set(-1.05, 2.05, 0.92);
    pressGroup.add(leftColTrim);

    // Right Column Upright (Coluna Direita Azul)
    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.4, 1.8), pressBlueMat);
    rightCol.position.set(1.05, 2.05, 0);
    rightCol.castShadow = true;
    pressGroup.add(rightCol);

    // Upper Crown / Top Headstock Housing (Cabeçote Superior Branco)
    const crown = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.1, 2.0), pressWhiteMat);
    crown.position.y = 3.05;
    crown.castShadow = true;
    pressGroup.add(crown);

    // Top Blue Cap Header Accent
    const crownCap = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.15, 1.9), pressBlueMat);
    crownCap.position.y = 3.65;
    pressGroup.add(crownCap);

    // Embedded Touchscreen HMI Display on Upper Crown
    const crownScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.65, 0.42),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    crownScreen.position.set(0.4, 3.1, 1.02);
    pressGroup.add(crownScreen);

    // 2 Precision Vertical Guide Columns (Colunas de Guia Retificadas Cromadas)
    for (const gx of [-0.65, 0.65]) {
      const guideRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 1.5, 24),
        shinyChromeMat
      );
      guideRod.position.set(gx, 2.0, 0);
      pressGroup.add(guideRod);
    }

    // Lower Die Bolster Bed (Mesa Inferior da Matriz)
    const lowerDie = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.3), shinyChromeMat);
    lowerDie.position.set(0, 1.02, 0);
    lowerDie.castShadow = true;
    pressGroup.add(lowerDie);

    // Yellow Stamping Ram / Punch Head (Martelo / Matriz Superior Amarela com Movimento 3D)
    const punchRam = new THREE.Group();
    punchRam.position.set(0, 2.15, 0);

    const ramMain = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.65, 1.15), safetyYellowMat);
    ramMain.castShadow = true;
    punchRam.add(ramMain);

    // Ram front tool cutouts / embossing
    const ramDetail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.08), darkTrimMat);
    ramDetail.position.set(0, 0, 0.58);
    punchRam.add(ramDetail);

    // Lower punch cutting teeth
    const punchTeeth = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.9), shinyChromeMat);
    punchTeeth.position.set(0, -0.36, 0);
    punchRam.add(punchTeeth);

    pressGroup.add(punchRam);

    // Animated Stamping Stroke
    this.objectsMap.animatedParts.set(`${machine.id}-punch`, {
      type: 'stroke-y',
      object: punchRam,
      basePos: punchRam.position.clone(),
      speed: 3.2
    });

    // Front-Right Operator Push-Button Station (Botoeira de Comando Inclinada)
    const consoleGroup = new THREE.Group();
    consoleGroup.position.set(1.4, 0.95, 0.9);
    consoleGroup.rotation.x = -0.35; // Ergonomic slant

    const consoleBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.35), pressBlueMat);
    consoleGroup.add(consoleBody);

    const btnPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 }) // Amber panel face
    );
    btnPanel.position.set(0, 0, 0.18);
    consoleGroup.add(btnPanel);

    // Green start & Red E-Stop buttons
    const greenBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.2 })
    );
    greenBtn.rotation.x = Math.PI / 2;
    greenBtn.position.set(-0.15, 0.05, 0.20);
    consoleGroup.add(greenBtn);

    const redBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.5 })
    );
    redBtn.rotation.x = Math.PI / 2;
    redBtn.position.set(0.15, 0.05, 0.20);
    consoleGroup.add(redBtn);

    pressGroup.add(consoleGroup);

    // Left Output Chute (Calha de Ejeção de Peças Estampadas)
    const chute = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.48), shinyChromeMat);
    chute.position.set(-1.65, 0.95, 0.15);
    chute.rotation.z = 0.32; // Sloping down to the left
    pressGroup.add(chute);

    // Blue KLT Tote Box on Floor receiving stamped pieces
    const toteBox = this.createFinishedPartsBox(0.65, 0.38, 0.50, `${machine.code} · PRODUÇÃO`, false);
    toteBox.position.set(-2.4, 0.19, 0.15);
    pressGroup.add(toteBox);

    // =========================================================================
    // 2. CAVALETE DESBOBINADOR COM BOBINA DE AÇO (DIREITA - CONFORME FOTO)
    // =========================================================================
    const uncoilerGroup = new THREE.Group();
    uncoilerGroup.position.set(2.4, 0, 0);

    // Tubular A-Frame Support Stand (Cavalete Azul)
    const legGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.1, 16);
    const legOffsets = [
      [-0.45, 0.55, -0.45],
      [-0.45, 0.55, 0.45],
      [0.45, 0.55, -0.45],
      [0.45, 0.55, 0.45]
    ];
    legOffsets.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, pressBlueMat);
      leg.position.set(lx, ly, lz);
      leg.rotation.z = lx < 0 ? -0.18 : 0.18;
      leg.rotation.x = lz < 0 ? 0.18 : -0.18;
      leg.castShadow = true;
      uncoilerGroup.add(leg);
    });

    // Top horizontal crossbars
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.10, 1.0), pressBlueMat);
    topBar.position.set(0, 1.05, 0);
    uncoilerGroup.add(topBar);

    // Horizontal Spindle Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.95, 24), shinyChromeMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(0, 1.35, 0);
    uncoilerGroup.add(shaft);

    // Rotating Steel Coil Reel Assembly (Bobina de Fita de Aço em Rotação)
    const coilRotatingGroup = new THREE.Group();
    coilRotatingGroup.position.set(0, 1.35, 0);

    // Heavy Industrial Steel Coil (Bobina de Chapa Laminada Inox)
    const mainCoil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.72, 0.48, 36),
      steelStripMat
    );
    mainCoil.rotation.x = Math.PI / 2;
    mainCoil.castShadow = true;
    coilRotatingGroup.add(mainCoil);

    // Inner bronze mandrel core
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.26, 0.50, 24),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 })
    );
    core.rotation.x = Math.PI / 2;
    coilRotatingGroup.add(core);

    // Side Flange Discs with Safety Handles
    for (const cz of [-0.26, 0.26]) {
      const flange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.88, 0.88, 0.03, 32),
        shinyChromeMat
      );
      flange.rotation.x = Math.PI / 2;
      flange.position.z = cz;
      coilRotatingGroup.add(flange);

      // Handle grips
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35), darkTrimMat);
      handle.position.set(0, 0.85, cz);
      coilRotatingGroup.add(handle);
    }

    uncoilerGroup.add(coilRotatingGroup);

    // Animate Continuous Coil Rotation
    this.objectsMap.animatedParts.set(`${machine.id}-coil`, {
      type: 'rotation-x',
      object: coilRotatingGroup,
      basePos: coilRotatingGroup.position.clone(),
      speed: 1.2
    });

    // Continuous Steel Strip (Fita de Aço sendo alimentada na prensa)
    const stripCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.4, 2.05, 0),
      new THREE.Vector3(1.6, 1.45, 0),
      new THREE.Vector3(0.8, 1.20, 0),
      new THREE.Vector3(-0.6, 1.20, 0)
    ]);
    const stripGeo = new THREE.TubeGeometry(stripCurve, 24, 0.03, 8, false);
    const stripMesh = new THREE.Mesh(stripGeo, steelStripMat);
    group.add(stripMesh);

    group.add(pressGroup);
    group.add(uncoilerGroup);

    // =========================================================================
    // 3. FLUXO DINÂMICO 3D DE PEÇAS SENDO PRODUZIDAS & CAINDO NA CAIXA
    // =========================================================================
    const clipGeo = new THREE.BoxGeometry(0.12, 0.035, 0.14);
    const totalPieces = 8;
    const chuteStart = new THREE.Vector3(-0.6 - 0.7, 1.20, 0.15);
    const chuteLip = new THREE.Vector3(-0.6 - 1.85, 0.72, 0.15);
    const boxDrop = new THREE.Vector3(-0.6 - 2.4, 0.35, 0.15);

    for (let i = 0; i < totalPieces; i++) {
      const pieceMesh = new THREE.Mesh(clipGeo, shinyChromeMat);
      pieceMesh.castShadow = true;
      group.add(pieceMesh);

      this.objectsMap.flowingPieces.push({
        mesh: pieceMesh,
        phase: i / totalPieces,
        machineId: machine.id,
        chuteStart: chuteStart.clone(),
        chuteLip: chuteLip.clone(),
        boxDrop: boxDrop.clone()
      });
    }
  }

  // --- MODEL: CNC MACHINING CENTER (DMG MORI / MAZAK / HAAS) ---
  private buildCncModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    // 1. Lower chassis
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 3.2), chassisMat);
    base.position.y = 0.4;
    group.add(base);

    // 2. Main Enclosure Cabin (Modern white/slate industrial styling)
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Light industrial off-white
      metalness: 0.3,
      roughness: 0.4
    });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 3.0), cabinMat);
    cabin.position.y = 1.9;
    cabin.castShadow = true;
    group.add(cabin);

    // 3. Safety Glass Front Window
    const windowMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1
    });
    const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), windowMat);
    frontWindow.position.set(0, 2.0, 1.52);
    group.add(frontWindow);

    // 4. Internal CNC Spindle Head (Animates when running)
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.15, 0.8, 16), metalMat);
    spindle.position.set(0, 2.1, 0.5);
    group.add(spindle);

    this.objectsMap.animatedParts.set(`${machine.id}-spindle`, {
      type: 'vibrate-y',
      object: spindle,
      basePos: spindle.position.clone(),
      speed: 3.0
    });

    // 5. Operator Swivel Control Arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8), metalMat);
    arm.position.set(1.9, 1.8, 1.2);
    arm.rotation.z = Math.PI / 12;
    group.add(arm);

    const screenBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.55, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    screenBox.position.set(2.1, 2.0, 1.2);
    screenBox.rotation.y = -Math.PI / 4;
    group.add(screenBox);

    // Chip Conveyor Chute at the rear/side
    const chute = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.6), metalMat);
    chute.position.set(-1.8, 0.6, -0.6);
    chute.rotation.z = -Math.PI / 8;
    group.add(chute);
  }

  // --- MODEL: PRENSA ESTAMPADORA DE MOLAS & CONFORMAÇÃO ---
  private buildStampingPressModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    // 1. Robust Cast Iron C-Frame Body
    const lowerBed = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 2.8), chassisMat);
    lowerBed.position.y = 0.45;
    group.add(lowerBed);

    // Vertical Columns
    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 1.6), panelMat);
    leftCol.position.set(-1.2, 2.1, 0);
    group.add(leftCol);

    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 1.6), panelMat);
    rightCol.position.set(1.2, 2.1, 0);
    group.add(rightCol);

    // Crown / Top Head
    const crown = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 2.2), chassisMat);
    crown.position.y = 3.6;
    group.add(crown);

    // Overhead Flywheel
    const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.35, 24), metalMat);
    flywheel.rotation.z = Math.PI / 2;
    flywheel.position.set(-1.7, 3.6, 0);
    group.add(flywheel);

    // Animated Press Ram (Stamping Stroke)
    const ram = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.2), metalMat);
    ram.position.set(0, 2.4, 0);
    group.add(ram);

    this.objectsMap.animatedParts.set(`${machine.id}-ram`, {
      type: 'stroke-y',
      object: ram,
      basePos: ram.position.clone(),
      speed: 2.5
    });

    // Wire decoiler drum
    const wireDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 24), metalMat);
    wireDrum.position.set(1.9, 1.4, -1.0);
    group.add(wireDrum);
  }

  // --- MODEL: LINHA AUTOMÁTICA DE TRATAMENTO SUPERFICIAL & ZINCAGEM ELETROLÍTICA ---
  private buildZincLineModel(
    group: THREE.Group,
    _chassisMat: THREE.Material,
    _panelMat: THREE.Material,
    _metalMat: THREE.Material,
    machine: Machine
  ): void {
    // 0. High-Quality Dedicated Materials based on Industrial Reference Photo
    const zincBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Industrial Blue RAL 5005 (Cor idêntica à imagem de referência)
      metalness: 0.35,
      roughness: 0.40
    });
    const darkBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Deep structure blue
      metalness: 0.45,
      roughness: 0.45
    });
    const rimWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Clean off-white / stainless steel top rim
      metalness: 0.65,
      roughness: 0.25
    });
    const craneYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // OSHA Safety Yellow overhead gantry crane
      metalness: 0.35,
      roughness: 0.35
    });
    const shinyChromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.12
    });
    const brassScrewMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25
    });
    const panelCabinetMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Light industrial gray cabinet
      metalness: 0.40,
      roughness: 0.35
    });
    const darkSlateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.70,
      roughness: 0.30
    });

    // =========================================================================
    // 1. BATERIA DE 4 TANQUES INDUSTRIAIS DE IMERSÃO QUÍMICA (ACID & ZINC TANKS)
    // =========================================================================
    // Tank specifications:
    // Tank 0: Decapagem Ácida / Desengraxe (Acid Pickling Bath) -> Ciano/Esmeralda Translúcido
    // Tank 1: Banho Eletrolítico de Zinco Trivalente -> Azul Cobalto Químico com Ânodos de Zinco
    // Tank 2: Passivação & Cromatização -> Amarelo Âmbar Translúcido
    // Tank 3: Enxágue & Lavagem Desmineralizada -> Água Cristalina Translúcida
    const tankConfigs = [
      { x: -3.75, name: 'Tanque 1 · Decapagem Ácida HCl', liquidColor: 0x06b6d4, opacity: 0.88, hasAnodes: false },
      { x: -1.25, name: 'Tanque 2 · Zinco Trivalente', liquidColor: 0x2563eb, opacity: 0.90, hasAnodes: true },
      { x: 1.25, name: 'Tanque 3 · Passivação Amarela/Azul', liquidColor: 0xf59e0b, opacity: 0.88, hasAnodes: false },
      { x: 3.75, name: 'Tanque 4 · Enxágue Desmineralizado', liquidColor: 0x38bdf8, opacity: 0.80, hasAnodes: false }
    ];

    const chemicalBubbles: THREE.Mesh[] = [];

    tankConfigs.forEach((tCfg, idx) => {
      const tankGroup = new THREE.Group();
      tankGroup.position.set(tCfg.x, 0, 0);

      // 1a. Main Blue Tank Body (2.1m wide x 1.45m high x 2.2m deep)
      const tankBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.45, 2.2), zincBlueMat);
      tankBody.position.y = 0.825;
      tankBody.castShadow = true;
      tankBody.receiveShadow = true;
      tankGroup.add(tankBody);

      // Front recessed structural panels (giving authentic sheet metal look as in photo)
      for (const px of [-0.52, 0.52]) {
        const panelInset = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.25, 0.04), darkBlueMat);
        panelInset.position.set(px, 0.825, 1.11);
        tankGroup.add(panelInset);
      }

      // 1b. Stainless Steel / Off-White Upper Rim Collar (Borda superior reforçada)
      const topRim = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.16, 2.32), rimWhiteMat);
      topRim.position.y = 1.60;
      topRim.castShadow = true;
      tankGroup.add(topRim);

      // Inner hollow cutout appearance on top rim
      const innerCutout = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.02, 1.92), darkSlateMat);
      innerCutout.position.y = 1.67;
      tankGroup.add(innerCutout);

      // 1c. Heavy Tank Support Feet (4 leveling pedestals with floor plates)
      const footGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const footOffsets = [
        [-0.95, -1.0],
        [0.95, -1.0],
        [-0.95, 1.0],
        [0.95, 1.0]
      ];
      footOffsets.forEach(([fx, fz]) => {
        const foot = new THREE.Mesh(footGeo, darkSlateMat);
        foot.position.set(fx, 0.09, fz);
        foot.castShadow = true;
        tankGroup.add(foot);
      });

      // 1d. Chemical Liquid Bath Surface with Transparency & Color
      const liquidGeo = new THREE.PlaneGeometry(1.80, 1.90);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: tCfg.liquidColor,
        roughness: 0.10,
        metalness: 0.20,
        transparent: true,
        opacity: tCfg.opacity
      });
      const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
      liquidMesh.rotation.x = -Math.PI / 2;
      liquidMesh.position.set(0, 1.48, 0);
      tankGroup.add(liquidMesh);

      // Active bath aeration bubbles
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 })
      );
      bubble.position.set(0.2, 1.49, 0.1);
      tankGroup.add(bubble);
      chemicalBubbles.push(bubble);

      // 1e. Zinc Anode Bars (Barramentos de Zinco / Cobre nos tanques galvânicos)
      if (tCfg.hasAnodes) {
        for (const az of [-0.85, 0.85]) {
          const anodeBar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 1.85, 16),
            new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
          );
          anodeBar.rotation.z = Math.PI / 2;
          anodeBar.position.set(0, 1.55, az);
          tankGroup.add(anodeBar);
        }
      }

      // 1f. Rear chemical recirculation piping and drain valves
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
      );
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(0, 0.6, -1.18);
      tankGroup.add(pipe);

      // Identification Tag on front of tank
      const tagCanvas = document.createElement('canvas');
      tagCanvas.width = 256;
      tagCanvas.height = 64;
      const tCtx = tagCanvas.getContext('2d');
      if (tCtx) {
        tCtx.fillStyle = '#0f172a';
        tCtx.fillRect(0, 0, 256, 64);
        tCtx.fillStyle = '#f8fafc';
        tCtx.font = 'bold 20px monospace';
        tCtx.fillText(`TQ-${idx + 1} · ${tCfg.name.split('·')[1] || tCfg.name}`, 10, 40);
      }
      const tagTex = new THREE.CanvasTexture(tagCanvas);
      const tagMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), new THREE.MeshBasicMaterial({ map: tagTex }));
      tagMesh.position.set(0, 1.48, 1.12);
      tankGroup.add(tagMesh);

      group.add(tankGroup);
    });

    // =========================================================================
    // 2. PÓRTICO ESTRUTURAL SUPERIOR COM VIGA AMARELA (OVERHEAD GANTRY SYSTEM)
    // =========================================================================
    const gantryGroup = new THREE.Group();

    // 2a. 5 Vertical Tubular Support Columns in Blue
    const colGeo = new THREE.CylinderGeometry(0.10, 0.12, 4.3, 24);
    const colXs = [-4.95, -2.48, 0, 2.48, 4.95];
    colXs.forEach((cx) => {
      const col = new THREE.Mesh(colGeo, darkBlueMat);
      col.position.set(cx, 2.15, -1.35);
      col.castShadow = true;
      gantryGroup.add(col);

      // Flanged base plate
      const colBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 16), darkSlateMat);
      colBase.position.set(cx, 0.06, -1.35);
      gantryGroup.add(colBase);

      // Top support bracket connecting column to overhead beam
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.55), darkBlueMat);
      bracket.position.set(cx, 4.15, -1.1);
      gantryGroup.add(bracket);
    });

    // 2b. Main Overhead Yellow Gantry Beam (Viga mestre I-Beam amarela de 11.2m de vão)
    const mainBeam = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.38, 0.28), craneYellowMat);
    mainBeam.position.set(0, 4.25, -0.85);
    mainBeam.castShadow = true;
    gantryGroup.add(mainBeam);

    // Front Hoist Guide Rail (Trilho de translação do guincho no eixo X)
    const hoistRail = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.12, 0.12), shinyChromeMat);
    hoistRail.position.set(0, 4.10, 0);
    gantryGroup.add(hoistRail);

    // Cable Carrier Drag Chain Track (Esteira porta-cabos amarela/preta)
    const cableTrack = new THREE.Mesh(
      new THREE.BoxGeometry(10.6, 0.08, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.5 })
    );
    cableTrack.position.set(0, 4.52, -0.85);
    gantryGroup.add(cableTrack);

    // 2c. Safety guardrails on left and right flanks
    for (const sx of [-5.2, 5.2]) {
      const sidePost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 16), craneYellowMat);
      sidePost1.position.set(sx, 0.6, -1.2);
      gantryGroup.add(sidePost1);

      const sidePost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 16), craneYellowMat);
      sidePost2.position.set(sx, 0.6, 1.2);
      gantryGroup.add(sidePost2);

      const sideRailTop = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2.4), craneYellowMat);
      sideRailTop.position.set(sx, 1.15, 0);
      gantryGroup.add(sideRailTop);

      const sideRailMid = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2.4), craneYellowMat);
      sideRailMid.position.set(sx, 0.65, 0);
      gantryGroup.add(sideRailMid);
    }

    group.add(gantryGroup);

    // =========================================================================
    // 3. CARRO TRANSPORTADOR, GUINCHO TELESCÓPICO & GANCHEIRA COM ABRAÇADEIRAS
    // =========================================================================
    // 3a. Motorized Trolley Carriage (Moves along X axis from tank to tank)
    const trolleyGroup = new THREE.Group();
    trolleyGroup.position.set(-3.75, 4.10, 0); // Starts above Tank 1

    const trolleyChassis = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 0.65), craneYellowMat);
    trolleyChassis.castShadow = true;
    trolleyGroup.add(trolleyChassis);

    // Hoist drive motor & reduction gearbox
    const hoistMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 16), darkBlueMat);
    hoistMotor.rotation.z = Math.PI / 2;
    hoistMotor.position.set(0, 0.26, 0);
    trolleyGroup.add(hoistMotor);

    // 3b. Telescopic Hoist Arm (Vertically extends Y to submerge abraçadeiras in bath)
    const hoistArmGroup = new THREE.Group();
    hoistArmGroup.position.set(0, 3.0, 0); // Default raised position

    // Stainless steel vertical suspension column
    const hoistPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 16), shinyChromeMat);
    hoistPiston.position.set(0, 0.8, 0);
    hoistArmGroup.add(hoistPiston);

    // Heavy duty lifting yoke & hooks
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.22), darkBlueMat);
    yoke.position.set(0, 0.05, 0);
    hoistArmGroup.add(yoke);

    // 3c. IMMERSION RACK / GANCHEIRA METÁLICA (Loaded with Hose Clamps / Abraçadeiras)
    const rackGroup = new THREE.Group();
    rackGroup.position.set(0, -0.45, 0);

    // Central Titanium / Inox Spine
    const rackSpine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 16), shinyChromeMat);
    rackSpine.position.set(0, 0.35, 0);
    rackGroup.add(rackSpine);

    // 3 Horizontal Tier Arms holding abraçadeiras
    const tierHeights = [0.10, 0.40, 0.70];
    const clampOffsets = [-0.65, -0.38, -0.12, 0.12, 0.38, 0.65];

    tierHeights.forEach((th) => {
      // Horizontal rack crossbar
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.03, 0.03), shinyChromeMat);
      crossbar.position.set(0, th, 0);
      rackGroup.add(crossbar);

      // Hang 3D Abraçadeiras on each tier!
      clampOffsets.forEach((cx) => {
        const clampGroup = new THREE.Group();
        clampGroup.position.set(cx, th - 0.12, 0);

        // Circular stainless steel band ring (Abraçadeira de mangueira circular)
        const clampRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.09, 0.016, 12, 24),
          shinyChromeMat
        );
        clampRing.rotation.y = Math.PI / 2;
        clampGroup.add(clampRing);

        // Worm drive screw housing block (Castanha / parafuso sem fim de aperto)
        const screwHousing = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.04, 0.05),
          brassScrewMat
        );
        screwHousing.position.set(0, 0.09, 0);
        clampGroup.add(screwHousing);

        // Slotted screw head
        const screwHead = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12),
          shinyChromeMat
        );
        screwHead.rotation.x = Math.PI / 2;
        screwHead.position.set(0, 0.09, 0.03);
        clampGroup.add(screwHead);

        rackGroup.add(clampGroup);
      });
    });

    hoistArmGroup.add(rackGroup);
    trolleyGroup.add(hoistArmGroup);
    group.add(trolleyGroup);

    // Register into objectsMap for real-time 3D immersion animation!
    this.objectsMap.zincHoists.push({
      machineId: machine.id,
      trolley: trolleyGroup,
      hoistArm: hoistArmGroup,
      rackWithClamps: rackGroup,
      bubbles: chemicalBubbles,
      cycleTimer: 0
    });

    // =========================================================================
    // 4. PAINEL DE CONTROLE ELÉTRICO / CLP & IHM (OPERATOR CONTROL CABINET)
    // =========================================================================
    // Positioned on front right side of line (X = 5.6m, Z = 0.5m)
    const cabinetGroup = new THREE.Group();
    cabinetGroup.position.set(5.6, 0, 0.5);

    // Cabinet Main Enclosure (1.1m wide x 2.05m high x 0.85m deep)
    const cabinetBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.05, 0.85), panelCabinetMat);
    cabinetBody.position.y = 1.15;
    cabinetBody.castShadow = true;
    cabinetGroup.add(cabinetBody);

    // Dark pedestal base
    const cabBase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.15, 0.90), darkSlateMat);
    cabBase.position.y = 0.075;
    cabinetGroup.add(cabBase);

    // High-Resolution Touchscreen HMI Display
    const hmiCanvas = document.createElement('canvas');
    hmiCanvas.width = 512;
    hmiCanvas.height = 384;
    const hctx = hmiCanvas.getContext('2d');
    if (hctx) {
      hctx.fillStyle = '#0f172a';
      hctx.fillRect(0, 0, 512, 384);

      // Header
      hctx.fillStyle = '#1e3a8a';
      hctx.fillRect(0, 0, 512, 60);
      hctx.fillStyle = '#38bdf8';
      hctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      hctx.fillText('⚡ SFioT GALVANO-CONTROL PRO', 20, 38);

      // Status Badge
      hctx.fillStyle = '#10b981';
      hctx.fillRect(360, 14, 130, 32);
      hctx.fillStyle = '#ffffff';
      hctx.font = 'bold 16px sans-serif';
      hctx.fillText('IMERSÃO OK', 375, 36);

      // Telemetry Cards
      const telemetryRows = [
        { label: 'TQ-1 (DECAP. ÁCIDA):', val: 'pH 1.2 · 42°C', color: '#06b6d4' },
        { label: 'TQ-2 (ZINCO TRIV.):', val: '850 A · 64.5°C', color: '#3b82f6' },
        { label: 'TQ-3 (PASSIVAÇÃO):', val: 'pH 3.8 · 31°C', color: '#f59e0b' },
        { label: 'TQ-4 (ENXÁGUE):', val: 'Cond: 12 µS/cm', color: '#38bdf8' },
        { label: 'PRODUÇÃO ABRAÇADEIRAS:', val: '65.2 PPM · LOTE OK', color: '#10b981' }
      ];

      telemetryRows.forEach((row, rIdx) => {
        hctx.fillStyle = '#1e293b';
        hctx.fillRect(16, 75 + rIdx * 56, 480, 48);

        hctx.fillStyle = '#94a3b8';
        hctx.font = 'bold 18px monospace';
        hctx.fillText(row.label, 28, 105 + rIdx * 56);

        hctx.fillStyle = row.color;
        hctx.font = 'bold 20px monospace';
        hctx.textAlign = 'right';
        hctx.fillText(row.val, 480, 105 + rIdx * 56);
        hctx.textAlign = 'left';
      });
    }

    const hmiTex = new THREE.CanvasTexture(hmiCanvas);
    const hmiScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.65),
      new THREE.MeshStandardMaterial({ map: hmiTex, roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.35 })
    );
    hmiScreen.position.set(0, 1.55, 0.43);
    cabinetGroup.add(hmiScreen);

    // Operator pushbuttons and rotary disconnect switch
    const eStop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    );
    eStop.rotation.x = Math.PI / 2;
    eStop.position.set(0.35, 1.05, 0.44);
    cabinetGroup.add(eStop);

    const rotarySwitch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
    );
    rotarySwitch.rotation.x = Math.PI / 2;
    rotarySwitch.position.set(-0.35, 1.05, 0.44);
    cabinetGroup.add(rotarySwitch);

    // Yellow safety barrier post beside cabinet
    const guardPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 16), craneYellowMat);
    guardPost.position.set(0.65, 0.6, 0.45);
    cabinetGroup.add(guardPost);

    group.add(cabinetGroup);
  }

  // --- MODEL: LAMINADORA DE ROSCA HIDRÁULICA ---
  private buildThreadRollerModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 2.6), chassisMat);
    base.position.y = 0.4;
    group.add(base);

    // Work head
    const head = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2.2), panelMat);
    head.position.set(0, 1.5, 0);
    group.add(head);

    // Dual thread rolling dies
    const die1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.35, 24), metalMat);
    die1.rotation.x = Math.PI / 2;
    die1.position.set(-0.45, 1.6, 1.0);
    group.add(die1);

    const die2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.35, 24), metalMat);
    die2.rotation.x = Math.PI / 2;
    die2.position.set(0.45, 1.6, 1.0);
    group.add(die2);

    this.objectsMap.animatedParts.set(`${machine.id}-roller1`, {
      type: 'rotate-z',
      object: die1,
      basePos: die1.position.clone(),
      speed: 4.0
    });
    this.objectsMap.animatedParts.set(`${machine.id}-roller2`, {
      type: 'rotate-z-inv',
      object: die2,
      basePos: die2.position.clone(),
      speed: 4.0
    });
  }

  // --- MODEL: FERRAMENTARIA E ELETROEROSÃO / RETÍFICA ---
  private buildToolroomModel(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    machine: Machine
  ): void {
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.85, 2.8), chassisMat);
    base.position.y = 0.42;
    group.add(base);

    // Dielectric fluid basin / Magnetic chuck bed
    const chuck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.8), metalMat);
    chuck.position.set(0, 1.05, 0.2);
    group.add(chuck);

    // Rear precision column
    const column = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.4), panelMat);
    column.position.set(0, 1.95, -0.8);
    group.add(column);

    // Grinding spindle arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.0), metalMat);
    arm.position.set(0, 2.3, 0.1);
    group.add(arm);
  }

  private buildGenericIndustrialMachine(
    group: THREE.Group,
    chassisMat: THREE.Material,
    panelMat: THREE.Material,
    metalMat: THREE.Material,
    _machine: Machine
  ): void {
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.8, 2.6), panelMat);
    base.position.y = 0.9;
    group.add(base);
  }

  // Build Andon Light Tower (Green, Amber, Red stack with prominent high-power lenses)
  private buildAndonTower(
    group: THREE.Group,
    machine: Machine
  ): { green: THREE.Mesh; amber: THREE.Mesh; red: THREE.Mesh; pointLight: THREE.PointLight } {
    // 1. Tall industrial steel mast (elevated above machine roof for maximum visibility)
    const andonStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.85 })
    );
    andonStem.position.set(1.4, machine.dimensions.height + 0.8, 0.8);
    group.add(andonStem);

    // Large, high-visibility cylindrical lenses for all 3 colors (radius 0.20, height 0.34)
    const segGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.34, 24);

    // Red segment (top) - prominent industrial red lens
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: machine.status === 'stopped' ? 6.0 : 0.4,
      roughness: 0.15,
      metalness: 0.1
    });
    const redMesh = new THREE.Mesh(segGeo, redMat);
    redMesh.position.set(1.4, machine.dimensions.height + 2.05, 0.8);
    group.add(redMesh);

    // Amber / Yellow segment (middle) - prominent industrial amber lens
    const amberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: machine.status === 'attention' ? 6.0 : 0.4,
      roughness: 0.15,
      metalness: 0.1
    });
    const amberMesh = new THREE.Mesh(segGeo, amberMat);
    amberMesh.position.set(1.4, machine.dimensions.height + 1.68, 0.8);
    group.add(amberMesh);

    // Green segment (bottom) - prominent industrial emerald green lens
    const greenMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: machine.status === 'running' ? 6.0 : 0.4,
      roughness: 0.15,
      metalness: 0.1
    });
    const greenMesh = new THREE.Mesh(segGeo, greenMat);
    greenMesh.position.set(1.4, machine.dimensions.height + 1.31, 0.8);
    group.add(greenMesh);

    // Heavy duty separator rings between lenses
    const ringGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.2 });

    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.set(1.4, machine.dimensions.height + 1.49, 0.8);
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.position.set(1.4, machine.dimensions.height + 1.86, 0.8);
    group.add(ring2);

    // Top cap beacon
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.16, 24), ringMat);
    cap.position.set(1.4, machine.dimensions.height + 2.30, 0.8);
    group.add(cap);

    // High-power omnidirectional PointLight with wide reach (illuminating machine roof and surroundings)
    let lightColor = 0x10b981;
    let lightIntensity = 4.0;
    if (machine.status === 'attention') {
      lightColor = 0xf59e0b;
      lightIntensity = 4.5;
    } else if (machine.status === 'stopped') {
      lightColor = 0xef4444;
      lightIntensity = 6.0;
    } else if (machine.status === 'offline') {
      lightIntensity = 0;
    }

    const pointLight = new THREE.PointLight(lightColor, lightIntensity, 18, 1.1);
    pointLight.position.set(1.4, machine.dimensions.height + 1.7, 0.8);
    group.add(pointLight);

    return { green: greenMesh, amber: amberMesh, red: redMesh, pointLight };
  }

  // Floating identification badge plate atop machine
  private buildMachineNameplate(group: THREE.Group, machine: Machine): void {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background card
      ctx.fillStyle = '#0f172a';
      ctx.roundRect(8, 8, 240, 112, 16);
      ctx.fill();

      // Border colored by status
      let statusColor = '#10b981';
      if (machine.status === 'attention') statusColor = '#f59e0b';
      if (machine.status === 'stopped') statusColor = '#ef4444';
      if (machine.status === 'offline') statusColor = '#64748b';

      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Machine Code
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(machine.code, 128, 62);

      // Subtitle
      ctx.fillStyle = statusColor;
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        machine.status === 'running'
          ? 'OPERANDO'
          : machine.status === 'attention'
          ? 'ATENÇÃO'
          : machine.status === 'stopped'
          ? 'PARADA'
          : 'OFFLINE',
        128,
        96
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 1.2, 1);
    sprite.position.set(0, machine.dimensions.height + 1.2, 0);
    group.add(sprite);
  }

  // Update Andon and dynamic lights when machine state changes in real-time
  public updateMachineVisualState(machineId: string, status: MachineStatus): void {
    const andon = this.objectsMap.machineAndons.get(machineId);
    if (!andon) return;

    const redMat = andon.red.material as THREE.MeshStandardMaterial;
    const amberMat = andon.amber.material as THREE.MeshStandardMaterial;
    const greenMat = andon.green.material as THREE.MeshStandardMaterial;

    redMat.emissive.setHex(status === 'stopped' ? 0xef4444 : 0x000000);
    redMat.emissiveIntensity = status === 'stopped' ? 2.8 : 0;

    amberMat.emissive.setHex(status === 'attention' ? 0xf59e0b : 0x000000);
    amberMat.emissiveIntensity = status === 'attention' ? 2.8 : 0;

    greenMat.emissive.setHex(status === 'running' ? 0x10b981 : 0x000000);
    greenMat.emissiveIntensity = status === 'running' ? 2.8 : 0;

    if (status === 'running') {
      andon.pointLight.color.setHex(0x10b981);
      andon.pointLight.intensity = 1.2;
    } else if (status === 'attention') {
      andon.pointLight.color.setHex(0xf59e0b);
      andon.pointLight.intensity = 1.5;
    } else if (status === 'stopped') {
      andon.pointLight.color.setHex(0xef4444);
      andon.pointLight.intensity = 1.8;
    } else {
      andon.pointLight.intensity = 0;
    }
  }

  // Draw the animated navigation route on the floor (GPS Interno)
  public renderNavigationRoute(route: FactoryRoute | null): void {
    // Clear existing route line
    while (this.objectsMap.routeLineGroup.children.length > 0) {
      const obj = this.objectsMap.routeLineGroup.children[0];
      this.objectsMap.routeLineGroup.remove(obj);
    }

    if (!route || route.waypoints.length < 2) return;

    const points: THREE.Vector3[] = [];
    route.waypoints.forEach((wp) => {
      points.push(new THREE.Vector3(wp.x, 0.06, wp.z));
    });

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.14, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8 // Glowing cyan path
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.objectsMap.routeLineGroup.add(tubeMesh);

    // Waypoint pulsating markers
    route.waypoints.forEach((wp, idx) => {
      const markerGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: idx === route.waypoints.length - 1 ? 0xef4444 : 0x0284c7
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(wp.x, 0.07, wp.z);
      this.objectsMap.routeLineGroup.add(marker);
    });
  }

  // Animate moving parts per frame
  public updateAnimations(time: number, machineStatuses: Map<string, MachineStatus>): void {
    // High-Intensity Dynamic Pulsing of all Andons (Verde, Amarelo, Vermelho pulsando bem forte)
    const pulseNorm = Math.sin(time * 5.5) * 0.5 + 0.5; // Smooth 0 to 1 wave (cadência forte)
    const pulseFast = Math.sin(time * 11.0) * 0.5 + 0.5; // Alarme rápido para máquina parada

    this.objectsMap.machineAndons.forEach((andon, machineId) => {
      const status = machineStatuses.get(machineId) || 'running';
      const redMat = andon.red.material as THREE.MeshStandardMaterial;
      const amberMat = andon.amber.material as THREE.MeshStandardMaterial;
      const greenMat = andon.green.material as THREE.MeshStandardMaterial;

      if (status === 'running') {
        // Verde pulsando muito forte (4.5 a 11.0 emissive)
        greenMat.emissive.setHex(0x10b981);
        greenMat.emissiveIntensity = 4.5 + pulseNorm * 6.5;
        amberMat.emissive.setHex(0xf59e0b);
        amberMat.emissiveIntensity = 0.4; // Lente amarela visível acesa
        redMat.emissive.setHex(0xef4444);
        redMat.emissiveIntensity = 0.4; // Lente vermelha visível acesa

        andon.pointLight.color.setHex(0x10b981);
        andon.pointLight.intensity = 3.5 + pulseNorm * 5.5;
      } else if (status === 'attention') {
        // Amarelo pulsando forte (5.0 a 12.0 emissive)
        amberMat.emissive.setHex(0xf59e0b);
        amberMat.emissiveIntensity = 5.0 + pulseNorm * 7.0;
        greenMat.emissive.setHex(0x10b981);
        greenMat.emissiveIntensity = 0.4;
        redMat.emissive.setHex(0xef4444);
        redMat.emissiveIntensity = 0.4;

        andon.pointLight.color.setHex(0xf59e0b);
        andon.pointLight.intensity = 3.8 + pulseNorm * 6.0;
      } else if (status === 'stopped') {
        // Vermelho pulsando alarme bem forte (6.0 a 15.0 emissive strobe)
        redMat.emissive.setHex(0xef4444);
        redMat.emissiveIntensity = 6.0 + pulseFast * 9.0;
        amberMat.emissive.setHex(0xf59e0b);
        amberMat.emissiveIntensity = 0.4;
        greenMat.emissive.setHex(0x10b981);
        greenMat.emissiveIntensity = 0.4;

        andon.pointLight.color.setHex(0xef4444);
        andon.pointLight.intensity = 4.5 + pulseFast * 7.5;
      } else {
        // Offline: lentes translúcidas visíveis, halo apagado
        greenMat.emissive.setHex(0x10b981);
        greenMat.emissiveIntensity = 0.15;
        amberMat.emissive.setHex(0xf59e0b);
        amberMat.emissiveIntensity = 0.15;
        redMat.emissive.setHex(0xef4444);
        redMat.emissiveIntensity = 0.15;
        andon.pointLight.intensity = 0;
      }
    });

    this.objectsMap.animatedParts.forEach((part, key) => {
      const machineId = key.split('-')[0];
      const status = machineStatuses.get(machineId);

      // Only animate if machine is operating
      if (status !== 'running') return;

      if (part.type === 'stroke-y') {
        const offset = Math.sin(time * part.speed * 4) * 0.22;
        part.object.position.y = part.basePos.y + offset;
      } else if (part.type === 'vibrate-y') {
        const offset = Math.sin(time * 25) * 0.015;
        part.object.position.y = part.basePos.y + offset;
      } else if (part.type === 'rotation-x') {
        part.object.rotation.x += 0.05 * part.speed;
      } else if (part.type === 'rotate-z') {
        part.object.rotation.z += 0.08 * part.speed;
      } else if (part.type === 'rotate-z-inv') {
        part.object.rotation.z -= 0.08 * part.speed;
      } else if (part.type === 'hoist-z') {
        const offset = Math.sin(time * 0.8) * 1.8;
        part.object.position.z = part.basePos.z + offset;
      }
    });

    // Continuous Flowing Parts Animation (Peças saindo da estamparia pela calha e caindo na caixa)
    this.objectsMap.flowingPieces.forEach((piece) => {
      const status = machineStatuses.get(piece.machineId);
      if (status !== 'running') return;

      // Speed cadence corresponding to 85.7 PPM
      piece.phase = (piece.phase + 0.016) % 1.0;

      const p = piece.phase;
      if (p < 0.62) {
        // Sliding down the stainless steel chute
        const t = p / 0.62;
        piece.mesh.position.x = piece.chuteStart.x + (piece.chuteLip.x - piece.chuteStart.x) * t;
        piece.mesh.position.y = piece.chuteStart.y + (piece.chuteLip.y - piece.chuteStart.y) * t;
        piece.mesh.position.z = piece.chuteStart.z + (piece.chuteLip.z - piece.chuteStart.z) * t;
        piece.mesh.rotation.z = -0.32;
        piece.mesh.rotation.x = 0;
        piece.mesh.rotation.y = 0;
      } else if (p < 0.94) {
        // Free fall parabolic trajectory into the collection box
        const t = (p - 0.62) / 0.32;
        piece.mesh.position.x = piece.chuteLip.x + (piece.boxDrop.x - piece.chuteLip.x) * t;
        // Gravity parabolic drop: starts at lip and accelerates downward into box
        piece.mesh.position.y = piece.chuteLip.y + (piece.boxDrop.y - piece.chuteLip.y) * (t * t);
        piece.mesh.position.z = piece.chuteLip.z + (piece.boxDrop.z - piece.chuteLip.z) * t + Math.sin(t * Math.PI) * 0.04;
        piece.mesh.rotation.x += 0.22;
        piece.mesh.rotation.z += 0.26;
      } else {
        // Settling into the collection pile before resetting to chute top
        piece.mesh.position.x = piece.boxDrop.x + Math.sin(p * 50) * 0.08;
        piece.mesh.position.y = piece.boxDrop.y;
        piece.mesh.position.z = piece.boxDrop.z + Math.cos(p * 50) * 0.08;
      }
    });

    // Update live HMI tablet screen waveform animation (every few frames)
    if (Math.floor(time * 30) % 2 === 0) {
      this.objectsMap.tabletScreens.forEach((screen) => {
        this.drawTabletHMI(screen.ctx, screen.machine, time);
        screen.texture.needsUpdate = true;
      });
    }

    // Update Automated Zinc Plating Chemical Immersion Hoists & Bubbles (M08)
    this.updateZincLineAnimation(time, machineStatuses);

    // Update Autonomous AGV Fleet, Packaging Workers, and Stretch Wrapper turntable
    this.updatePackagingAndAgvs(time, machineStatuses);
  }

  // --- REAL-TIME 3D CHEMICAL BATH IMMERSION & HOIST GANTRY SIMULATION ---
  private updateZincLineAnimation(time: number, machineStatuses: Map<string, MachineStatus>): void {
    this.objectsMap.zincHoists.forEach((zinc) => {
      const status = machineStatuses.get(zinc.machineId) || 'running';
      if (status !== 'running') return;

      zinc.cycleTimer += 0.016;
      const cycle = zinc.cycleTimer % 16.0; // 16-second 4-tank automated immersion cycle

      // 4 Tank X positions relative to M08 origin:
      // Tank 0 (Acid Pickling): X = -3.75
      // Tank 1 (Zinc Electroplating): X = -1.25
      // Tank 2 (Passivation): X = 1.25
      // Tank 3 (Rinse): X = 3.75
      const tankXs = [-3.75, -1.25, 1.25, 3.75];

      let targetX = -3.75;
      let targetY = 3.0; // Elevated transit height

      if (cycle < 3.5) {
        // Tank 0 (Acid): Arrive, descend into acid bath, remain, ascend
        targetX = tankXs[0];
        const t = cycle / 3.5;
        if (t < 0.25) {
          targetY = THREE.MathUtils.lerp(3.0, 1.15, t / 0.25);
        } else if (t < 0.75) {
          targetY = 1.15 + Math.sin(time * 6) * 0.03;
        } else {
          targetY = THREE.MathUtils.lerp(1.15, 3.0, (t - 0.75) / 0.25);
        }
      } else if (cycle < 7.0) {
        // Translate to Tank 1 (Zinc Electroplating) & Immerse
        const c1 = cycle - 3.5;
        const t = c1 / 3.5;
        if (t < 0.20) {
          targetX = THREE.MathUtils.lerp(tankXs[0], tankXs[1], t / 0.20);
          targetY = 3.0;
        } else if (t < 0.45) {
          targetX = tankXs[1];
          targetY = THREE.MathUtils.lerp(3.0, 1.15, (t - 0.20) / 0.25);
        } else if (t < 0.75) {
          targetX = tankXs[1];
          targetY = 1.15 + Math.sin(time * 6) * 0.03;
        } else {
          targetX = tankXs[1];
          targetY = THREE.MathUtils.lerp(1.15, 3.0, (t - 0.75) / 0.25);
        }
      } else if (cycle < 10.5) {
        // Translate to Tank 2 (Passivation) & Immerse
        const c2 = cycle - 7.0;
        const t = c2 / 3.5;
        if (t < 0.20) {
          targetX = THREE.MathUtils.lerp(tankXs[1], tankXs[2], t / 0.20);
          targetY = 3.0;
        } else if (t < 0.45) {
          targetX = tankXs[2];
          targetY = THREE.MathUtils.lerp(3.0, 1.15, (t - 0.20) / 0.25);
        } else if (t < 0.75) {
          targetX = tankXs[2];
          targetY = 1.15 + Math.sin(time * 6) * 0.03;
        } else {
          targetX = tankXs[2];
          targetY = THREE.MathUtils.lerp(1.15, 3.0, (t - 0.75) / 0.25);
        }
      } else if (cycle < 14.0) {
        // Translate to Tank 3 (Rinse) & Immerse
        const c3 = cycle - 10.5;
        const t = c3 / 3.5;
        if (t < 0.20) {
          targetX = THREE.MathUtils.lerp(tankXs[2], tankXs[3], t / 0.20);
          targetY = 3.0;
        } else if (t < 0.45) {
          targetX = tankXs[3];
          targetY = THREE.MathUtils.lerp(3.0, 1.15, (t - 0.20) / 0.25);
        } else if (t < 0.75) {
          targetX = tankXs[3];
          targetY = 1.15 + Math.sin(time * 6) * 0.03;
        } else {
          targetX = tankXs[3];
          targetY = THREE.MathUtils.lerp(1.15, 3.0, (t - 0.75) / 0.25);
        }
      } else {
        // Fast return transit across gantry rail to Tank 0
        const retT = (cycle - 14.0) / 2.0;
        targetX = THREE.MathUtils.lerp(tankXs[3], tankXs[0], retT);
        targetY = 3.0;
      }

      zinc.trolley.position.x = targetX;
      zinc.hoistArm.position.y = targetY;

      // Animate chemical bath bubbles
      zinc.bubbles.forEach((b, bi) => {
        b.position.y = 1.48 + Math.sin(time * 8 + bi * 1.5) * 0.04;
        b.scale.setScalar(0.8 + Math.sin(time * 12 + bi * 2) * 0.4);
      });
    });
  }

  // Helper to build realistic corrugated cardboard boxes with barcode labels and metal parts inside
  private createFinishedPartsBox(
    w: number,
    h: number,
    d: number,
    label: string,
    isSealed: boolean
  ): THREE.Group {
    const boxGroup = new THREE.Group();

    const cardboardMat = new THREE.MeshStandardMaterial({
      color: 0xb4824d,
      roughness: 0.82,
      metalness: 0.05
    });

    const tapeMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      roughness: 0.25,
      metalness: 0.15
    });

    const shinyChromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.15
    });

    // Box outer body
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cardboardMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    boxGroup.add(body);

    // Realistic Barcode & Shipping Identification Label
    const lblCanvas = document.createElement('canvas');
    lblCanvas.width = 256;
    lblCanvas.height = 128;
    const lCtx = lblCanvas.getContext('2d');
    if (lCtx) {
      lCtx.fillStyle = '#ffffff';
      lCtx.fillRect(0, 0, 256, 128);

      lCtx.fillStyle = '#0f172a';
      lCtx.font = 'bold 20px monospace';
      lCtx.fillText(label, 12, 30);

      // Barcode bars
      for (let bx = 16; bx < 240; bx += 6) {
        if (Math.sin(bx * 13.7) > -0.2) {
          lCtx.fillRect(bx, 44, Math.random() > 0.5 ? 4 : 2, 48);
        }
      }

      lCtx.fillStyle = '#059669';
      lCtx.font = 'bold 16px sans-serif';
      lCtx.fillText('✔ CONTROLE DE QUALIDADE OK', 12, 114);
    }
    const lblTex = new THREE.CanvasTexture(lblCanvas);
    const lblMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.7, h * 0.55),
      new THREE.MeshBasicMaterial({ map: lblTex })
    );
    lblMesh.position.set(0, h * 0.52, d / 2 + 0.005);
    boxGroup.add(lblMesh);

    if (isSealed) {
      // Applied BOPP Packaging Sealing Tape along center seam
      const tape = new THREE.Mesh(new THREE.BoxGeometry(w + 0.01, 0.015, d * 0.35), tapeMat);
      tape.position.set(0, h + 0.008, 0);
      boxGroup.add(tape);
    } else {
      // Open box with shiny metallic stamped/machined parts visible on top
      const partsBed = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.85, 0.08, d * 0.85),
        shinyChromeMat
      );
      partsBed.position.set(0, h * 0.85, 0);
      boxGroup.add(partsBed);

      for (let p = 0; p < 6; p++) {
        const partPiece = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.22, 0.035, d * 0.25),
          shinyChromeMat
        );
        partPiece.position.set(
          (Math.random() - 0.5) * w * 0.65,
          h * 0.92,
          (Math.random() - 0.5) * d * 0.65
        );
        partPiece.rotation.set(0.1, Math.random() * Math.PI, 0.1);
        boxGroup.add(partPiece);
      }
    }

    return boxGroup;
  }

  // Build Machine Output Buffer Stands (Onde as caixas são produzidas e aguardam os robôs AGV)
  private buildMachineSourceBuffers(): void {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });

    // 1. Bihler M14 Source Buffer Stand (x: 11.0, z: 21.4)
    const bStandGroup = new THREE.Group();
    bStandGroup.position.set(11.0, 0, 21.4);

    const bLegs = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.9), metalMat);
    bLegs.position.y = 0.225;
    bLegs.castShadow = true;
    bStandGroup.add(bLegs);

    // Steel Rollers Bed
    for (let r = -0.45; r <= 0.45; r += 0.18) {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.82, 16), rollerMat);
      roller.rotation.x = Math.PI / 2;
      roller.position.set(r, 0.48, 0);
      bStandGroup.add(roller);
    }

    // Source Box at Bihler (Tote de peças estampadas)
    const bihBox = this.createFinishedPartsBox(0.65, 0.42, 0.50, 'OP-77290 · BIHLER', false);
    bihBox.position.set(0, 0.52, 0);
    bStandGroup.add(bihBox);
    this.objectsMap.bihlerSourceBox = bihBox;

    this.scene.add(bStandGroup);

    // 2. CNC Usinagem Source Buffer Stand (x: 23.0, z: 1.0)
    const cStandGroup = new THREE.Group();
    cStandGroup.position.set(23.0, 0, 1.0);

    const cLegs = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.9), metalMat);
    cLegs.position.y = 0.225;
    cLegs.castShadow = true;
    cStandGroup.add(cLegs);

    for (let r = -0.45; r <= 0.45; r += 0.18) {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.82, 16), rollerMat);
      roller.rotation.x = Math.PI / 2;
      roller.position.set(r, 0.48, 0);
      cStandGroup.add(roller);
    }

    const cncBox = this.createFinishedPartsBox(0.65, 0.42, 0.50, 'OP-91024 · USINAGEM', false);
    cncBox.position.set(0, 0.52, 0);
    cStandGroup.add(cncBox);
    this.objectsMap.cncSourceBox = cncBox;

    this.scene.add(cStandGroup);
  }

  // --- SETOR DE EMBALAGEM & EXPEDIÇÃO (Bancadas, Operadores, Paletes & Esteiras) ---
  private buildPackagingStations(): void {
    const packagingGroup = new THREE.Group();
    packagingGroup.name = 'PackagingSectorStations';

    // Materials
    const benchAluMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 });
    const benchTopMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const woodPalletMat = new THREE.MeshStandardMaterial({ color: 0xc4a47c, roughness: 0.9 });
    const stretchFilmMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      roughness: 0.15,
      metalness: 0.1
    });
    const vestOrangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
    const workerSkinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 });
    const workerClothMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
    const hardHatMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.2 });

    // 1. Intake / Receiving Gravity Conveyor from AGVs (x: 25.0, z: 17.0)
    const intakeConveyor = new THREE.Group();
    intakeConveyor.position.set(25.0, 0, 17.0);

    const intLegs = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.8), benchAluMat);
    intLegs.position.y = 0.375;
    intakeConveyor.add(intLegs);

    const intBed = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.9), benchTopMat);
    intBed.position.y = 0.80;
    intakeConveyor.add(intBed);

    // Box on Intake Conveyor (Arrived from AGV)
    const intakeBox = this.createFinishedPartsBox(0.60, 0.40, 0.45, 'EMB-08 · RECEBIDO', false);
    intakeBox.position.set(0, 0.86, 0);
    intakeBox.visible = true;
    intakeConveyor.add(intakeBox);
    this.objectsMap.packagingIntakeBox = intakeBox;

    packagingGroup.add(intakeConveyor);

    // 2. Packaging Workbench Table 1 (x: 28.0, z: 15.0)
    const tableGroup = new THREE.Group();
    tableGroup.position.set(28.0, 0, 15.0);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.9, 0.08);
    const legOffsets = [
      [-1.1, -0.6],
      [1.1, -0.6],
      [-1.1, 0.6],
      [1.1, 0.6]
    ];
    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, benchAluMat);
      leg.position.set(lx, 0.45, lz);
      leg.castShadow = true;
      tableGroup.add(leg);
    });

    // Table Top (2.4m x 1.4m)
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.4), benchTopMat);
    top.position.y = 0.94;
    top.castShadow = true;
    top.receiveShadow = true;
    tableGroup.add(top);

    // Overhead gantry & LED Light
    const mastL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.06), benchAluMat);
    mastL.position.set(-1.1, 1.6, -0.6);
    tableGroup.add(mastL);

    const mastR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.06), benchAluMat);
    mastR.position.set(1.1, 1.6, -0.6);
    tableGroup.add(mastR);

    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 0.06), benchAluMat);
    crossBar.position.set(0, 2.25, -0.6);
    tableGroup.add(crossBar);

    const lightBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.05, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 })
    );
    lightBar.position.set(0, 2.22, -0.2);
    tableGroup.add(lightBar);

    // Central Active Box on Table being sealed by Worker 1
    const tableWorkBox = this.createFinishedPartsBox(0.60, 0.40, 0.45, 'OP-77290 · EMB-08', true);
    tableWorkBox.position.set(-0.1, 0.98, 0);
    tableWorkBox.castShadow = true;
    tableGroup.add(tableWorkBox);
    this.objectsMap.tableWorkBox = tableWorkBox;

    // Dynamic Sealing Tape Strip
    const tapeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.015, 0.10),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.25, metalness: 0.2 })
    );
    tapeMesh.position.set(-0.1, 1.39, 0);
    tableGroup.add(tapeMesh);
    this.objectsMap.tableTapeMesh = tapeMesh;

    // Scale & Barcode Scanner Stand
    const scale = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.4), benchAluMat);
    scale.position.set(0.7, 0.98, 0.1);
    tableGroup.add(scale);

    packagingGroup.add(tableGroup);

    // 3. Worker 1 (Sealing & Taping Operator)
    const worker1Group = new THREE.Group();
    worker1Group.position.set(28.0, 0, 16.3);
    worker1Group.rotation.y = Math.PI;

    const w1Legs = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.85, 0.22), workerClothMat);
    w1Legs.position.y = 0.425;
    w1Legs.castShadow = true;
    worker1Group.add(w1Legs);

    const w1Torso = new THREE.Group();
    w1Torso.position.y = 1.15;
    const w1Vest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.28), vestOrangeMat);
    w1Vest.castShadow = true;
    w1Torso.add(w1Vest);

    const w1Head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), workerSkinMat);
    w1Head.position.y = 0.42;
    w1Torso.add(w1Head);
    const w1Helmet = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hardHatMat);
    w1Helmet.position.y = 0.44;
    w1Torso.add(w1Helmet);

    const w1LeftArm = new THREE.Group();
    w1LeftArm.position.set(-0.25, 0.20, 0);
    const w1LArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.38), workerClothMat);
    w1LArmMesh.position.set(0, -0.18, 0.12);
    w1LArmMesh.rotation.x = -0.6;
    w1LeftArm.add(w1LArmMesh);
    w1Torso.add(w1LeftArm);

    const w1RightArm = new THREE.Group();
    w1RightArm.position.set(0.25, 0.20, 0);
    const w1RArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.38), workerClothMat);
    w1RArmMesh.position.set(0, -0.18, 0.12);
    w1RArmMesh.rotation.x = -0.7;
    w1RightArm.add(w1RArmMesh);

    // Red Tape Gun Dispenser
    const tapeGun = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.15, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    );
    tapeGun.position.set(0, -0.32, 0.24);
    w1RightArm.add(tapeGun);
    w1Torso.add(w1RightArm);

    worker1Group.add(w1Torso);
    packagingGroup.add(worker1Group);
    this.objectsMap.packagingWorkers.push({
      group: worker1Group,
      leftArm: w1LeftArm,
      rightArm: w1RightArm,
      torso: w1Torso,
      task: 'taping',
      baseY: 1.15
    });

    // 4. Worker 2 (Palletizing Operator holding box between table & pallet)
    const worker2Group = new THREE.Group();
    worker2Group.position.set(30.5, 0, 19.5);
    worker2Group.rotation.y = -Math.PI / 4;

    const w2Legs = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.85, 0.22), workerClothMat);
    w2Legs.position.y = 0.425;
    w2Legs.castShadow = true;
    worker2Group.add(w2Legs);

    const w2Torso = new THREE.Group();
    w2Torso.position.y = 1.15;
    const w2Vest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.28), vestOrangeMat);
    w2Vest.castShadow = true;
    w2Torso.add(w2Vest);

    const w2Head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), workerSkinMat);
    w2Head.position.y = 0.42;
    w2Torso.add(w2Head);
    const w2Helmet = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hardHatMat);
    w2Helmet.position.y = 0.44;
    w2Torso.add(w2Helmet);

    const w2LeftArm = new THREE.Group();
    w2LeftArm.position.set(-0.25, 0.15, 0);
    const w2LArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.40), workerClothMat);
    w2LArmMesh.position.set(0, -0.15, 0.15);
    w2LArmMesh.rotation.x = -0.6;
    w2LeftArm.add(w2LArmMesh);
    w2Torso.add(w2LeftArm);

    const w2RightArm = new THREE.Group();
    w2RightArm.position.set(0.25, 0.15, 0);
    const w2RArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.40), workerClothMat);
    w2RArmMesh.position.set(0, -0.15, 0.15);
    w2RArmMesh.rotation.x = -0.6;
    w2RightArm.add(w2RArmMesh);
    w2Torso.add(w2RightArm);

    // Box Held by Worker 2 while moving to pallet
    const heldBox = this.createFinishedPartsBox(0.55, 0.38, 0.42, 'OP-77290 · EMB-08', true);
    heldBox.position.set(0, -0.18, 0.38);
    heldBox.visible = true;
    w2Torso.add(heldBox);
    this.objectsMap.workerHeldBox = heldBox;

    worker2Group.add(w2Torso);
    packagingGroup.add(worker2Group);
    this.objectsMap.packagingWorkers.push({
      group: worker2Group,
      leftArm: w2LeftArm,
      rightArm: w2RightArm,
      torso: w2Torso,
      task: 'stacking',
      baseY: 1.15
    });

    // 5. Active Staging EUR-Pallet (Recebe as caixas uma a uma, envolve em filme e despacha)
    const stagingPalletGroup = new THREE.Group();
    stagingPalletGroup.position.set(31.5, 0, 22.5);

    // Wooden EUR-Pallet base (1.2m x 0.8m x 0.15m)
    const woodBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.0), woodPalletMat);
    woodBase.position.y = 0.07;
    woodBase.castShadow = true;
    woodBase.receiveShadow = true;
    stagingPalletGroup.add(woodBase);

    // 6 Box Slots on Pallet
    const boxSlots = [
      { x: -0.28, y: 0.14 + 0.19, z: -0.24 },
      { x: 0.28, y: 0.14 + 0.19, z: -0.24 },
      { x: -0.28, y: 0.14 + 0.19, z: 0.24 },
      { x: 0.28, y: 0.14 + 0.19, z: 0.24 },
      { x: -0.28, y: 0.14 + 0.38 + 0.19, z: 0 },
      { x: 0.28, y: 0.14 + 0.38 + 0.19, z: 0 }
    ];

    this.objectsMap.stagingPalletBoxes = [];
    boxSlots.forEach((slot, idx) => {
      const palletBox = this.createFinishedPartsBox(0.54, 0.38, 0.44, `PALETE · CX-${idx + 1}`, true);
      palletBox.position.set(slot.x, slot.y - 0.19, slot.z);
      palletBox.visible = idx < 2;
      stagingPalletGroup.add(palletBox);
      this.objectsMap.stagingPalletBoxes.push(palletBox as any);
    });

    // Stretch Film Wrapping around pallet (becomes visible when full)
    const stretchWrap = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 1.0, 1.04),
      stretchFilmMat
    );
    stretchWrap.position.set(0, 0.65, 0);
    stretchWrap.visible = false;
    stagingPalletGroup.add(stretchWrap);
    this.objectsMap.stagingPalletWrap = stretchWrap;

    packagingGroup.add(stagingPalletGroup);
    this.objectsMap.stagingPalletGroup = stagingPalletGroup;

    // 6. Yellow Manual Hydraulic Pallet Jack (Transpaleteira)
    const jackGroup = new THREE.Group();
    jackGroup.position.set(28.5, 0, 23.0);
    jackGroup.rotation.y = 0.2;

    const jackYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
    const jackForks = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.55), jackYellowMat);
    jackForks.position.set(0.6, 0.06, 0);
    jackForks.castShadow = true;
    jackGroup.add(jackForks);

    const jackPump = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5), benchAluMat);
    jackPump.position.set(0, 0.3, 0);
    jackGroup.add(jackPump);

    const jackHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1), benchAluMat);
    jackHandle.position.set(-0.25, 0.75, 0);
    jackHandle.rotation.z = -0.35;
    jackGroup.add(jackHandle);

    packagingGroup.add(jackGroup);
    this.objectsMap.palletJackGroup = jackGroup;

    this.scene.add(packagingGroup);
  }

  // --- FROTA DE ROBÔS AGV / AMR AUTÔNOMOS DE TRANSPORTE DE CAIXAS ---
  private buildAutonomousAgvFleet(): void {
    const agvMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.4, roughness: 0.35 }); // Safety Orange
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.4 });
    const lidarMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.8 });

    // AGV 1: Bihler Ejection Pickup -> Corredores -> Embalagem Intake
    const agv1Waypoints = [
      new THREE.Vector3(11.0, 0, 21.4),  // 0. Bihler ejection pickup station
      new THREE.Vector3(21.0, 0, 21.4),  // 1. Enter East Inter-Corridor
      new THREE.Vector3(21.0, 0, 17.0),  // 2. Travel North along corridor
      new THREE.Vector3(25.0, 0, 17.0),  // 3. Dropoff at Packaging Intake
      new THREE.Vector3(21.0, 0, 17.0),  // 4. Return to corridor
      new THREE.Vector3(21.0, 0, 21.4)   // 5. Turn back into Bihler
    ];

    // AGV 2: Usinagem / CNC Pickup -> Corredores -> Packaging Table 2
    const agv2Waypoints = [
      new THREE.Vector3(23.0, 0, 1.0),   // 0. Usinagem pickup
      new THREE.Vector3(23.0, 0, 9.0),   // 1. South Cross Aisle
      new THREE.Vector3(21.0, 0, 9.0),   // 2. Inter-Aisle Junction
      new THREE.Vector3(21.0, 0, 17.0),  // 3. Travel South on aisle
      new THREE.Vector3(26.0, 0, 17.0),  // 4. Dropoff at Table 2
      new THREE.Vector3(21.0, 0, 17.0),  // 5. Return to aisle
      new THREE.Vector3(21.0, 0, 9.0)    // 6. Return loop
    ];

    const agvConfigs = [
      { name: 'AGV-01 (Bihler ➔ Embalagem)', waypoints: agv1Waypoints, speed: 0.038, sourceId: 'M14' },
      { name: 'AGV-02 (Usinagem ➔ Embalagem)', waypoints: agv2Waypoints, speed: 0.034, sourceId: 'M10' }
    ];

    agvConfigs.forEach((cfg) => {
      const agvGroup = new THREE.Group();
      agvGroup.position.copy(cfg.waypoints[0]);

      // 1. Low profile AMR Chassis (1.2m x 0.8m x 0.22m)
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.8), agvMat);
      base.position.y = 0.15;
      base.castShadow = true;
      agvGroup.add(base);

      // Black protective bumper rim
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.12, 0.86), chassisMat);
      bumper.position.y = 0.10;
      agvGroup.add(bumper);

      // 4 Heavy duty wheels
      const wheelGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16);
      const wheelOffsets = [
        [-0.45, -0.38],
        [0.45, -0.38],
        [-0.45, 0.38],
        [0.45, 0.38]
      ];
      wheelOffsets.forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, chassisMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.09, wz);
        agvGroup.add(wheel);
      });

      // 2. 360° LiDAR Scanner Turret
      const lidarTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16), chassisMat);
      lidarTurret.position.set(-0.4, 0.32, 0);
      agvGroup.add(lidarTurret);

      const lidarDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 16), lidarMat);
      lidarDisk.position.set(-0.4, 0.40, 0);
      agvGroup.add(lidarDisk);

      // LiDAR safety laser scan ring
      const scanRing = new THREE.Mesh(
        new THREE.RingGeometry(0.12, 0.28, 16),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      scanRing.rotation.x = -Math.PI / 2;
      scanRing.position.set(-0.4, 0.42, 0);
      agvGroup.add(scanRing);

      // 3. Status LED beacon
      const statusLed = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 2.0 })
      );
      statusLed.position.set(0.48, 0.28, 0);
      agvGroup.add(statusLed);

      // 4. Physical Cargo Box Carried on AGV Bed (Realistic Finished Goods Box)
      const cargoBoxes = new THREE.Group();
      cargoBoxes.position.set(0.05, 0.26, 0);

      const carriedBox = this.createFinishedPartsBox(0.60, 0.40, 0.48, 'LOTE CARGA · EM TRÂNSITO', false);
      carriedBox.position.set(0, 0, 0);
      cargoBoxes.add(carriedBox);
      agvGroup.add(cargoBoxes);

      // 5. Identification Nameplate
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 256;
      textCanvas.height = 64;
      const ctx = textCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 64);
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 256, 64);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(cfg.name.split(' ')[0], 20, 40);
      }
      const labelTex = new THREE.CanvasTexture(textCanvas);
      const nameplate = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.15), new THREE.MeshBasicMaterial({ map: labelTex }));
      nameplate.position.set(0, 0.20, 0.42);
      agvGroup.add(nameplate);

      this.scene.add(agvGroup);

      this.objectsMap.agvRobots.push({
        group: agvGroup,
        lidar: lidarDisk,
        cargoBoxes,
        statusLed,
        waypoints: cfg.waypoints,
        currentSegmentIndex: 0,
        segmentProgress: 0,
        speed: cfg.speed,
        pauseRemaining: 0,
        hasCargo: true,
        name: cfg.name,
        sourceId: cfg.sourceId
      });
    });
  }

  // --- MODEL: MÁQUINA 15 · SELADORA AUTOMÁTICA DE CAIXAS & BALANÇA DINÂMICA ---
  private buildSealingMachineModel(
    group: THREE.Group,
    _chassisMat: THREE.Material,
    _panelMat: THREE.Material,
    metalMat: THREE.Material,
    _machine: Machine
  ): void {
    const sealBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.3, roughness: 0.4 });
    const safetyYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
    const beltBlackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const cardboardMat = new THREE.MeshStandardMaterial({ color: 0xb4824d, roughness: 0.85 });
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.4 });

    // 1. Base Machine Chassis (4 Legs with vibration pads)
    const legGeo = new THREE.BoxGeometry(0.12, 0.8, 0.12);
    const legCoords = [
      [-1.6, -0.6],
      [1.6, -0.6],
      [-1.6, 0.6],
      [1.6, 0.6]
    ];
    legCoords.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.position.set(lx, 0.4, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    // 2. Infeed / Outfeed Belt Conveyor Bed (3.6m long x 1.1m wide x 0.25m thick)
    const bed = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 1.1), sealBlueMat);
    bed.position.y = 0.88;
    bed.castShadow = true;
    group.add(bed);

    // Conveyor Belt Surface with steel drive rollers
    const belt = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.04, 0.85), beltBlackMat);
    belt.position.y = 1.02;
    group.add(belt);

    // 3. Central Taping Bridge / Arch Gantry
    const gantryL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.3, 0.18), sealBlueMat);
    gantryL.position.set(0, 1.65, -0.55);
    group.add(gantryL);

    const gantryR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.3, 0.18), sealBlueMat);
    gantryR.position.set(0, 1.65, 0.55);
    group.add(gantryR);

    const gantryTop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 1.3), sealBlueMat);
    gantryTop.position.set(0, 2.25, 0);
    group.add(gantryTop);

    // Taping Head Cartridge Mechanism (Orange top applicator)
    const tapingHead = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.28), safetyYellowMat);
    tapingHead.position.set(0, 1.75, 0);
    group.add(tapingHead);

    // Large BOPP tape rolls (top and bottom dispensers)
    const tapeRollGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24);
    const tapeRoll = new THREE.Mesh(
      tapeRollGeo,
      new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.3 })
    );
    tapeRoll.rotation.z = Math.PI / 2;
    tapeRoll.position.set(0, 2.05, 0);
    group.add(tapeRoll);

    // 4. Box moving through sealing station
    const boxInProcess = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.5, 0.55), cardboardMat);
    boxInProcess.position.set(0, 1.3, 0);
    boxInProcess.castShadow = true;
    group.add(boxInProcess);

    // Golden tape strip being applied
    const appliedTape = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.02, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.3 })
    );
    appliedTape.position.set(0, 1.56, 0);
    group.add(appliedTape);

    // 5. Digital Touchscreen HMI & Weighing Display Console
    const consolePost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2), metalMat);
    consolePost.position.set(1.4, 1.4, 0.7);
    group.add(consolePost);

    const hmiBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.12), chassisMat);
    hmiBox.position.set(1.4, 1.95, 0.7);
    hmiBox.rotation.y = -0.3;
    group.add(hmiBox);

    const hmiScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.8 })
    );
    hmiScreen.position.set(1.4, 1.95, 0.77);
    hmiScreen.rotation.y = -0.3;
    group.add(hmiScreen);
  }

  // --- MODEL: MÁQUINA 16 · ENVOLVEDORA AUTOMÁTICA DE PALETES STRETCH ---
  private buildPalletStretchWrapperModel(
    group: THREE.Group,
    _chassisMat: THREE.Material,
    _panelMat: THREE.Material,
    metalMat: THREE.Material,
    _machine: Machine
  ): void {
    const wrapperBlueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.4, roughness: 0.4 });
    const turntableMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7, roughness: 0.3 });
    const woodPalletMat = new THREE.MeshStandardMaterial({ color: 0xc4a47c, roughness: 0.9 });
    const cardboardMat = new THREE.MeshStandardMaterial({ color: 0xb4824d, roughness: 0.85 });
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.4 });
    const stretchFilmMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.40,
      roughness: 0.15,
      metalness: 0.1
    });

    // 1. Heavy Base Frame with ramp
    const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 2.6), chassisMat);
    baseFrame.position.set(-0.2, 0.04, 0);
    baseFrame.receiveShadow = true;
    group.add(baseFrame);

    // 2. Motorized Rotating Turntable Disk (Ø 1.8m)
    const turntableGroup = new THREE.Group();
    turntableGroup.position.set(-0.4, 0.08, 0);

    const disk = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 32), turntableMat);
    disk.position.y = 0.04;
    disk.receiveShadow = true;
    turntableGroup.add(disk);

    // Yellow safety outer ring on turntable
    const diskRim = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.0, 32),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
    );
    diskRim.rotation.x = -Math.PI / 2;
    diskRim.position.y = 0.082;
    turntableGroup.add(diskRim);

    // Full Wooden EUR-Pallet on Turntable
    const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.0), woodPalletMat);
    pallet.position.y = 0.15;
    pallet.castShadow = true;
    turntableGroup.add(pallet);

    // 3 Layers of stacked cardboard boxes on pallet
    for (let layer = 0; layer < 3; layer++) {
      for (let bx = -0.3; bx <= 0.3; bx += 0.58) {
        for (let bz = -0.24; bz <= 0.24; bz += 0.48) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.36, 0.42), cardboardMat);
          box.position.set(bx, 0.22 + 0.18 + layer * 0.36, bz);
          box.castShadow = true;
          turntableGroup.add(box);
        }
      }
    }

    // Stretch Film Wrapping around the pallet
    const wrapFilm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 1.2, 24, 1, true),
      stretchFilmMat
    );
    wrapFilm.position.y = 0.85;
    turntableGroup.add(wrapFilm);

    group.add(turntableGroup);
    this.objectsMap.palletWrapperTurntable = turntableGroup;

    // 3. Vertical Mast Column (2.8m high)
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 0.35), wrapperBlueMat);
    mast.position.set(1.4, 1.4, 0);
    mast.castShadow = true;
    group.add(mast);

    // Motorized Stretch Film Roll Carriage (moving vertically)
    const filmCarriage = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 0.4), chassisMat);
    filmCarriage.position.set(1.15, 1.2, 0);
    group.add(filmCarriage);

    const filmRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 20), stretchFilmMat);
    filmRoll.position.set(0.95, 1.2, 0);
    group.add(filmRoll);

    // 4. Free-Standing Touchscreen Control Console
    const consolePedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1), metalMat);
    consolePedestal.position.set(1.6, 0.55, 1.2);
    group.add(consolePedestal);

    const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.15), chassisMat);
    consoleBox.position.set(1.6, 1.25, 1.2);
    group.add(consoleBox);

    const consoleScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.45, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x059669, emissive: 0x059669, emissiveIntensity: 0.9 })
    );
    consoleScreen.position.set(1.6, 1.25, 1.28);
    group.add(consoleScreen);
  }

  // --- REAL-TIME 60 FPS DYNAMIC LOGISTICS & PACKAGING SIMULATION ENGINE ---
  private updatePackagingAndAgvs(time: number, machineStatuses: Map<string, any>): void {
    const logState = this.objectsMap.logisticsState;

    // =========================================================================
    // 1. AUTONOMOUS AGVs: PICKUP AT MACHINES -> TRANSIT -> DROPOFF AT PACKAGING
    // =========================================================================
    this.objectsMap.agvRobots.forEach((agv) => {
      // Spin LiDAR scanner continuously
      if (agv.lidar) {
        agv.lidar.rotation.y += 0.25;
      }

      if (agv.pauseRemaining > 0) {
        agv.pauseRemaining -= 0.016;

        // Amber flashing status LED while loading / docking
        (agv.statusLed.material as THREE.MeshStandardMaterial).emissive.setHex(
          Math.sin(time * 12) > 0 ? 0xf59e0b : 0x000000
        );

        // ACTION: Pickup at machine source (waypoint index 0)
        if (agv.currentSegmentIndex === 0) {
          agv.hasCargo = true;
          agv.cargoBoxes.visible = true;

          if ((agv.sourceId === 'M14' || agv.sourceId === 'M13') && this.objectsMap.bihlerSourceBox) {
            // Source box transfers to AGV, stands resets with new box
            this.objectsMap.bihlerSourceBox.visible = agv.pauseRemaining < 1.0;
          }
        }

        // ACTION: Dropoff at packaging intake station (waypoint index 3 or 4)
        if (agv.currentSegmentIndex === 3 || agv.currentSegmentIndex === 4) {
          agv.hasCargo = false;
          agv.cargoBoxes.visible = false;

          if (this.objectsMap.packagingIntakeBox) {
            this.objectsMap.packagingIntakeBox.visible = true;
          }
        }
        return;
      }

      // Green status LED while autonomously traveling
      (agv.statusLed.material as THREE.MeshStandardMaterial).emissive.setHex(0x10b981);

      const wps = agv.waypoints;
      const currWp = wps[agv.currentSegmentIndex];
      const nextIndex = (agv.currentSegmentIndex + 1) % wps.length;
      const nextWp = wps[nextIndex];

      const segDistance = currWp.distanceTo(nextWp);
      if (segDistance < 0.01) {
        agv.currentSegmentIndex = nextIndex;
        return;
      }

      agv.segmentProgress += agv.speed / segDistance;

      if (agv.segmentProgress >= 1.0) {
        agv.segmentProgress = 0;
        agv.currentSegmentIndex = nextIndex;

        // DOCKING PAUSES:
        // Waypoint 0: Loading at Machine Source (2.5s)
        // Waypoint 3/4: Unloading at Packaging Intake (2.5s)
        if (agv.currentSegmentIndex === 0 || agv.currentSegmentIndex === 3 || agv.currentSegmentIndex === 4) {
          agv.pauseRemaining = 2.5;
        }
      } else {
        // Interpolate smooth movement along corridor
        agv.group.position.lerpVectors(currWp, nextWp, agv.segmentProgress);

        // Align chassis smoothly with velocity vector using shortest angle difference
        const dirX = nextWp.x - currWp.x;
        const dirZ = nextWp.z - currWp.z;
        if (Math.hypot(dirX, dirZ) > 0.05) {
          const targetAngle = Math.atan2(dirX, dirZ) + Math.PI / 2;
          const currentAngle = agv.group.rotation.y;
          const diff = THREE.MathUtils.euclideanModulo(targetAngle - currentAngle + Math.PI, Math.PI * 2) - Math.PI;
          agv.group.rotation.y = currentAngle + diff * 0.12;
        }
      }
    });

    // =========================================================================
    // 2. WORKER 1: RECEIVING BOX FROM INTAKE -> TAPING ON BENCH -> DISPATCH
    // =========================================================================
    logState.worker1CycleTimer += 0.016;
    const w1Cycle = logState.worker1CycleTimer % 8.0; // 8-second realistic cycle

    const worker1 = this.objectsMap.packagingWorkers.find((w) => w.task === 'taping');
    if (worker1) {
      if (w1Cycle < 2.0) {
        // Phase 1: Reaching to intake and pulling box to table center
        const t = w1Cycle / 2.0;
        worker1.torso.rotation.y = THREE.MathUtils.lerp(0, -0.4, Math.sin(t * Math.PI));
        worker1.leftArm.rotation.x = -0.4 - Math.sin(t * Math.PI) * 0.4;
        worker1.rightArm.rotation.x = -0.4 - Math.sin(t * Math.PI) * 0.3;

        if (this.objectsMap.tableWorkBox) {
          this.objectsMap.tableWorkBox.position.x = THREE.MathUtils.lerp(-0.7, -0.1, t);
        }
        if (this.objectsMap.tableTapeMesh) {
          this.objectsMap.tableTapeMesh.scale.x = 0.01;
        }
      } else if (w1Cycle < 5.5) {
        // Phase 2: Applying adhesive tape gun across box seam
        const tapeProgress = (w1Cycle - 2.0) / 3.5;
        const tapeWave = Math.sin(tapeProgress * Math.PI * 4);

        worker1.torso.rotation.y = 0;
        worker1.rightArm.rotation.x = -0.7 + tapeWave * 0.35;
        worker1.leftArm.rotation.x = -0.6 + Math.sin(time * 2) * 0.08;
        worker1.torso.position.y = worker1.baseY + Math.abs(tapeWave) * 0.015;

        // Dynamic tape strip stretching across the box
        if (this.objectsMap.tableTapeMesh) {
          this.objectsMap.tableTapeMesh.scale.x = Math.max(0.01, tapeProgress);
        }
      } else {
        // Phase 3: Pushing taped box towards pallet buffer area
        const pushT = (w1Cycle - 5.5) / 2.5;
        worker1.rightArm.rotation.x = THREE.MathUtils.lerp(-0.7, -0.3, Math.sin(pushT * Math.PI));
        worker1.leftArm.rotation.x = THREE.MathUtils.lerp(-0.6, -0.3, Math.sin(pushT * Math.PI));

        if (this.objectsMap.tableWorkBox) {
          this.objectsMap.tableWorkBox.position.x = THREE.MathUtils.lerp(-0.1, 0.6, pushT);
        }
      }
    }

    // =========================================================================
    // 3. WORKER 2: GRABBING BOX FROM TABLE -> WALKING -> STACKING ON PALLET
    // =========================================================================
    logState.worker2Timer += 0.016;
    const w2Cycle = logState.worker2Timer % 9.0; // 9-second palletizing cycle

    const worker2 = this.objectsMap.packagingWorkers.find((w) => w.task === 'stacking');
    if (worker2) {
      if (w2Cycle < 2.5) {
        // Phase A: Turn to table, reach down, grab sealed box
        const t = w2Cycle / 2.5;
        worker2.group.position.set(29.5, 0, 16.5);
        worker2.group.rotation.y = -Math.PI / 2; // Facing table

        worker2.torso.rotation.x = 0.15 + Math.sin(t * Math.PI) * 0.35;
        worker2.leftArm.rotation.x = -0.5 - Math.sin(t * Math.PI) * 0.3;
        worker2.rightArm.rotation.x = -0.5 - Math.sin(t * Math.PI) * 0.3;

        if (this.objectsMap.workerHeldBox) {
          this.objectsMap.workerHeldBox.visible = t > 0.4;
        }
      } else if (w2Cycle < 5.5) {
        // Phase B: Carry box and turn towards wooden pallet
        const t = (w2Cycle - 2.5) / 3.0;
        worker2.group.position.set(
          THREE.MathUtils.lerp(29.5, 31.0, t),
          0,
          THREE.MathUtils.lerp(16.5, 21.2, t)
        );
        worker2.group.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2, -Math.PI / 6, t);

        // Natural walking torso bob
        worker2.torso.position.y = worker2.baseY + Math.sin(t * Math.PI * 6) * 0.03;
        worker2.torso.rotation.x = 0.10;
        worker2.leftArm.rotation.x = -0.6;
        worker2.rightArm.rotation.x = -0.6;

        if (this.objectsMap.workerHeldBox) {
          this.objectsMap.workerHeldBox.visible = true;
        }
      } else if (w2Cycle < 7.8) {
        // Phase C: Bend down and place box on pallet
        const t = (w2Cycle - 5.5) / 2.3;
        worker2.group.position.set(31.0, 0, 21.2);
        worker2.group.rotation.y = -Math.PI / 6;

        // Bending down smoothly
        worker2.torso.rotation.x = 0.10 + Math.sin(t * Math.PI) * 0.45;
        worker2.leftArm.rotation.x = -0.6 + Math.sin(t * Math.PI) * 0.4;
        worker2.rightArm.rotation.x = -0.6 + Math.sin(t * Math.PI) * 0.4;

        if (t > 0.5) {
          if (this.objectsMap.workerHeldBox) {
            this.objectsMap.workerHeldBox.visible = false;
          }
          // Reveal next box on the pallet
          const currentSlot = Math.min(logState.stackedBoxesCount, 5);
          if (this.objectsMap.stagingPalletBoxes[currentSlot]) {
            this.objectsMap.stagingPalletBoxes[currentSlot].visible = true;
          }
        }
      } else {
        // Phase D: Straighten up and return to table
        const t = (w2Cycle - 7.8) / 1.2;
        worker2.torso.rotation.x = THREE.MathUtils.lerp(0.55, 0.10, t);
        worker2.leftArm.rotation.x = -0.4;
        worker2.rightArm.rotation.x = -0.4;

        if (t > 0.9 && logState.stackedBoxesCount < logState.maxBoxesOnPallet) {
          logState.stackedBoxesCount = (logState.stackedBoxesCount + 1) % (logState.maxBoxesOnPallet + 1);
        }
      }
    }

    // =========================================================================
    // 4. FULL PALLET STRETCH FILM WRAPPING & SHIPPING DISPATCH CYCLE
    // =========================================================================
    const palletGroup = this.objectsMap.stagingPalletGroup;
    const palletWrap = this.objectsMap.stagingPalletWrap;
    const palletJack = this.objectsMap.palletJackGroup;

    if (palletGroup && palletWrap && palletJack) {
      if (logState.stackedBoxesCount >= 6) {
        logState.palletDispatchTimer += 0.016;

        if (logState.palletDispatchTimer < 4.0) {
          // Stretch film wrapping animation
          palletWrap.visible = true;
          (palletWrap.material as THREE.MeshStandardMaterial).opacity = Math.min(
            0.55,
            logState.palletDispatchTimer * 0.2
          );
        } else if (logState.palletDispatchTimer < 9.0) {
          // Pallet Jack transports full wrapped pallet to shipping outfeed
          const t = (logState.palletDispatchTimer - 4.0) / 5.0;
          palletGroup.position.z = THREE.MathUtils.lerp(22.5, 34.0, t);
          palletJack.position.z = THREE.MathUtils.lerp(23.0, 34.5, t);
        } else {
          // Pallet successfully dispatched to expedition -> Reset clean pallet
          palletGroup.position.set(31.5, 0, 22.5);
          palletJack.position.set(28.5, 0, 23.0);
          palletWrap.visible = false;

          // Hide stacked boxes and reset count to 1 to begin fresh cycle
          this.objectsMap.stagingPalletBoxes.forEach((bx, idx) => {
            bx.visible = idx < 1;
          });
          logState.stackedBoxesCount = 1;
          logState.palletDispatchTimer = 0;
        }
      }
    }

    // =========================================================================
    // 5. STRETCH WRAPPER MACHINE M16 ROTATING TURNTABLE
    // =========================================================================
    if (this.objectsMap.palletWrapperTurntable) {
      const isRunning = machineStatuses.get('M16') === 'running';
      if (isRunning) {
        this.objectsMap.palletWrapperTurntable.rotation.y += 0.035;
      }
    }
  }

  // --- ROBÔ INSPETOR HUMANOIDE (AVATAR DO OPERADOR) ---
  public buildRobotAvatar(initialPos = new THREE.Vector3(0, 0, 20)): THREE.Group {
    const robotGroup = new THREE.Group();
    robotGroup.position.copy(initialPos);
    robotGroup.userData = { isRobot: true };

    const slateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.5
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.2
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7
    });

    const safetyVestMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // High-vis Safety Orange
      roughness: 0.6
    });

    const reflectiveStripeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 2.5
    });

    // 1. Pelvis & Hips Base (Y = 0.85m)
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.20, 0.28), slateMat);
    pelvis.position.y = 0.85;
    pelvis.castShadow = true;
    robotGroup.add(pelvis);

    // 2. Left Leg Group (articulated pivot at hip)
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.16, 0.82, 0);

    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.40, 16), whiteMat);
    leftThigh.position.y = -0.20;
    leftThigh.castShadow = true;
    leftLegGroup.add(leftThigh);

    const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), slateMat);
    leftKnee.position.y = -0.40;
    leftLegGroup.add(leftKnee);

    const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.38, 16), slateMat);
    leftCalf.position.y = -0.59;
    leftCalf.castShadow = true;
    leftLegGroup.add(leftCalf);

    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.30), bootMat);
    leftBoot.position.set(0, -0.78, -0.05);
    leftBoot.castShadow = true;
    leftLegGroup.add(leftBoot);

    // Safety yellow toe cap on boot
    const leftToeCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.162, 0.08, 0.10),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 })
    );
    leftToeCap.position.set(0, -0.78, -0.16);
    leftLegGroup.add(leftToeCap);

    robotGroup.add(leftLegGroup);
    this.objectsMap.robotLeftLeg = leftLegGroup;

    // 3. Right Leg Group (articulated pivot at hip)
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.16, 0.82, 0);

    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.40, 16), whiteMat);
    rightThigh.position.y = -0.20;
    rightThigh.castShadow = true;
    rightLegGroup.add(rightThigh);

    const rightKnee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), slateMat);
    rightKnee.position.y = -0.40;
    rightLegGroup.add(rightKnee);

    const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.38, 16), slateMat);
    rightCalf.position.y = -0.59;
    rightCalf.castShadow = true;
    rightLegGroup.add(rightCalf);

    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.30), bootMat);
    rightBoot.position.set(0, -0.78, -0.05);
    rightBoot.castShadow = true;
    rightLegGroup.add(rightBoot);

    const rightToeCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.162, 0.08, 0.10),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 })
    );
    rightToeCap.position.set(0, -0.78, -0.16);
    rightLegGroup.add(rightToeCap);

    robotGroup.add(rightLegGroup);
    this.objectsMap.robotRightLeg = rightLegGroup;

    // 4. Torso Group (articulated upper body with safety vest)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.95, 0);

    // Main chest & abdomen
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.58, 0.32), safetyVestMat);
    chest.position.y = 0.29;
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Safety high-vis reflective bands (horizontal stripes)
    const vestStripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.07, 0.33), reflectiveStripeMat);
    vestStripe1.position.y = 0.22;
    torsoGroup.add(vestStripe1);

    const vestStripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.07, 0.33), reflectiveStripeMat);
    vestStripe2.position.y = 0.38;
    torsoGroup.add(vestStripe2);

    // SFioT Industrial ID Badge on Chest
    const idBadge = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.10, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    idBadge.position.set(-0.16, 0.45, -0.17);
    torsoGroup.add(idBadge);

    // 5. Left Arm (Holds Rugged Industrial Telemetry Tablet)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.35, 0.52, 0);

    const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.32, 16), whiteMat);
    leftBicep.position.y = -0.16;
    leftBicep.castShadow = true;
    leftArmGroup.add(leftBicep);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.30, 16), slateMat);
    leftForearm.position.set(0, -0.32, -0.12);
    leftForearm.rotation.x = -Math.PI / 4;
    leftArmGroup.add(leftForearm);

    // Tablet PC enclosure held in left hand
    const tabletGeo = new THREE.BoxGeometry(0.36, 0.26, 0.04);
    const tabletMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.3 });
    const tabletMesh = new THREE.Mesh(tabletGeo, tabletMat);
    tabletMesh.position.set(0.12, -0.42, -0.28);
    tabletMesh.rotation.x = -Math.PI / 3;
    leftArmGroup.add(tabletMesh);

    // Glowing cyan telemetry screen on tablet
    const screenGeo = new THREE.PlaneGeometry(0.32, 0.22);
    const screenMesh = new THREE.Mesh(screenGeo, cyanGlowMat);
    screenMesh.position.set(0.12, -0.41, -0.26);
    screenMesh.rotation.x = -Math.PI / 3;
    leftArmGroup.add(screenMesh);
    this.objectsMap.robotTablet = screenMesh;

    torsoGroup.add(leftArmGroup);
    this.objectsMap.robotLeftArm = leftArmGroup;

    // 6. Right Arm (Swings freely during walk)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.35, 0.52, 0);

    const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.32, 16), whiteMat);
    rightBicep.position.y = -0.16;
    rightBicep.castShadow = true;
    rightArmGroup.add(rightBicep);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 16), slateMat);
    rightForearm.position.y = -0.40;
    rightForearm.castShadow = true;
    rightArmGroup.add(rightForearm);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), bootMat);
    rightHand.position.y = -0.58;
    rightArmGroup.add(rightHand);

    torsoGroup.add(rightArmGroup);
    this.objectsMap.robotRightArm = rightArmGroup;

    // 7. Head Group (Inspector helmet with curved visor, glowing eyes, LiDAR)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.65, 0);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16), slateMat);
    neck.position.y = 0.05;
    headGroup.add(neck);

    // Helmet Chassis
    const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.38), whiteMat);
    helmet.position.set(0, 0.24, 0);
    helmet.castShadow = true;
    headGroup.add(helmet);

    // Curved Dark Visor Faceplate
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      roughness: 0.1,
      metalness: 0.9
    });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.10), visorMat);
    visor.position.set(0, 0.24, -0.16);
    headGroup.add(visor);

    // Glowing Cyan Digital Eyes / HUD Bar (faces -Z forward)
    const eyes = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.06),
      cyanGlowMat
    );
    eyes.position.set(0, 0.25, -0.215);
    eyes.rotation.y = Math.PI;
    headGroup.add(eyes);

    // Top Spinning 360° LiDAR Puck
    const lidarPuck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.10, 20),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 })
    );
    lidarPuck.position.set(0, 0.46, 0);
    headGroup.add(lidarPuck);
    this.objectsMap.robotLidar = lidarPuck;

    // Laser cyan optical ring on LiDAR
    const laserRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.122, 0.012, 8, 20),
      cyanGlowMat
    );
    laserRing.rotation.x = Math.PI / 2;
    laserRing.position.set(0, 0.46, 0);
    headGroup.add(laserRing);

    // Safety beacon atop helmet
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.09, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 2.2 })
    );
    beacon.position.set(0, 0.54, 0);
    headGroup.add(beacon);

    // Comms Antenna on side
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8),
      slateMat
    );
    antenna.position.set(0.18, 0.40, 0.08);
    antenna.rotation.z = -Math.PI / 16;
    headGroup.add(antenna);

    torsoGroup.add(headGroup);
    this.objectsMap.robotHead = headGroup;

    // 8. Forward-Facing High Power Inspection Headlight (illuminates machines in front)
    const headlight = new THREE.SpotLight(0xffffff, 4.0, 32, Math.PI / 4, 0.35, 1.2);
    headlight.position.set(0, 0.45, -0.25);
    const targetObj = new THREE.Object3D();
    targetObj.position.set(0, 0, -12);
    torsoGroup.add(targetObj);
    headlight.target = targetObj;
    headlight.castShadow = true;
    torsoGroup.add(headlight);
    this.objectsMap.headlight = headlight;

    robotGroup.add(torsoGroup);
    this.objectsMap.robotTorso = torsoGroup;

    // 9. Floating Identification Sprite Above Avatar
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.roundRect(6, 6, 244, 68, 16);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🤖 INSPETOR (VOCÊ)', 128, 48);
    }
    const spriteTex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: spriteTex, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.2, 0.70, 1);
    sprite.position.set(0, 2.35, 0);
    robotGroup.add(sprite);

    // 10. Pulse Ring for Spacebar Scan / Horn
    const pulseGeo = new THREE.RingGeometry(0.4, 0.60, 32);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.rotation.x = -Math.PI / 2;
    pulseMesh.position.y = 0.04;
    robotGroup.add(pulseMesh);
    this.objectsMap.scanPulseMesh = pulseMesh;

    this.scene.add(robotGroup);
    this.objectsMap.robotGroup = robotGroup;
    return robotGroup;
  }

  // Update humanoid avatar kinematics, articulated walking stride, and parts per frame
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

    // Spin LiDAR continuously
    if (this.objectsMap.robotLidar) {
      this.objectsMap.robotLidar.rotation.y += 0.14;
    }

    // Articulated Biped Walking Animation
    if (isMoving) {
      // Natural leg swinging motion
      if (this.objectsMap.robotLeftLeg) {
        this.objectsMap.robotLeftLeg.rotation.x = Math.sin(walkCycle) * 0.65;
      }
      if (this.objectsMap.robotRightLeg) {
        this.objectsMap.robotRightLeg.rotation.x = -Math.sin(walkCycle) * 0.65;
      }

      // Arms swing in counter-phase to legs (like a real person walking)
      if (this.objectsMap.robotRightArm) {
        this.objectsMap.robotRightArm.rotation.x = Math.sin(walkCycle) * 0.50;
      }
      if (this.objectsMap.robotLeftArm) {
        // Holding tablet: subtle rhythm
        this.objectsMap.robotLeftArm.rotation.x = -0.25 + Math.sin(walkCycle) * 0.15;
      }

      // Natural vertical torso bobbing while walking
      if (this.objectsMap.robotTorso) {
        this.objectsMap.robotTorso.position.y = 0.95 + Math.abs(Math.sin(walkCycle)) * 0.04;
      }
    } else {
      // Return smoothly to idle stance
      if (this.objectsMap.robotLeftLeg) {
        this.objectsMap.robotLeftLeg.rotation.x = THREE.MathUtils.lerp(
          this.objectsMap.robotLeftLeg.rotation.x,
          0,
          0.15
        );
      }
      if (this.objectsMap.robotRightLeg) {
        this.objectsMap.robotRightLeg.rotation.x = THREE.MathUtils.lerp(
          this.objectsMap.robotRightLeg.rotation.x,
          0,
          0.15
        );
      }
      if (this.objectsMap.robotRightArm) {
        this.objectsMap.robotRightArm.rotation.x = THREE.MathUtils.lerp(
          this.objectsMap.robotRightArm.rotation.x,
          0,
          0.15
        );
      }
      if (this.objectsMap.robotLeftArm) {
        this.objectsMap.robotLeftArm.rotation.x = THREE.MathUtils.lerp(
          this.objectsMap.robotLeftArm.rotation.x,
          -0.25,
          0.15
        );
      }

      // Gentle idle breathing
      if (this.objectsMap.robotTorso) {
        this.objectsMap.robotTorso.position.y = 0.95 + Math.sin(time * 2.5) * 0.01;
      }
    }
  }

  // Trigger pulse radar ring on the floor (Spacebar or Scan button)
  public triggerRobotScanPulse(progress: number): void {
    if (!this.objectsMap.scanPulseMesh) return;
    const scale = 1 + progress * 16;
    this.objectsMap.scanPulseMesh.scale.set(scale, scale, 1);
    const mat = this.objectsMap.scanPulseMesh.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 1 - progress);
  }
}
