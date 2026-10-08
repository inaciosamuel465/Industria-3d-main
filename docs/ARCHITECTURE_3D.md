# 🏛️ Arquitetura 3D — SWT Industrial Digital Twin

Este documento descreve detalhadamente a arquitetura de renderização 3D WebGL em Three.js, a hierarquia de cena (Scene Graph), o gerenciamento de memória GPU e as técnicas de otimização aplicadas no projeto.

---

## 📐 Hierarquia da Cena 3D (Scene Graph)

A cena Three.js é estruturada de forma modular em grupos dedicados gerenciados pelo [`FactorySceneBuilder.ts`](file:///c:/Users/inaci/OneDrive/Desktop/SWT/Industria-3d-main/src/components/factory3d/FactorySceneBuilder.ts):

```
THREE.Scene
├── AmbientLight / DirectionalLight (Sol Industrial / Sombras Suaves)
├── Floor Mesh (Piso Base de 110m × 84m em Epóxi Branco)
├── Walkways Group (Corredores de Tráfego, Linhas Amarelas e Faixas de Pedestres)
├── Walls Group (Paredes Perimetrais Modulares 3D de 12m)
├── Sector Group
│   ├── Sector Floor Slabs (Textura PBR 4K com AO Map compartilhados)
│   ├── Perimeter Lines & Corner L-Brackets
│   ├── Sector Ground 3D Identification Badges
│   └── Overhead Suspended Signboards (placa-setor.glb suspensa a 8.2m com cabos de aço)
├── Machine Meshes Group
│   ├── Bihler Workstations (PB01M - PB10M)
│   │   ├── Bihler Machine Mesh (Escala 1.55x)
│   │   ├── Electrical Panel (painel.glb - Lado Esquerdo)
│   │   ├── Strip Decoiler (desbobinador.glb - Escala 2.4x - Lado Direito)
│   │   ├── Collection Table (mesa.glb - Escala 1.15x - Frente da Máquina)
│   │   └── Dual Code Nameplates (Frontal e Traseira)
│   ├── CNC Machining Centers (M17 - M20)
│   │   ├── CNC Enclosure (Escala 1.55x)
│   │   ├── Animated High-Speed Spindle (20 rad/s)
│   │   ├── Parts Pallet (palet.glb com caixas)
│   │   └── Front Machine Code Nameplate
│   └── Industrial Drill Presses (M21, M22)
│       ├── Heavy-Duty Workbench Table
│       ├── Drill Press (Animated Chuck Spindle)
│       └── Mobile Tool Cart
├── Forklifts Group (Empilhadeiras autônomas com cinemática de rodas e cargas)
└── Robot Avatar (Inspetor com cinemática inversa de pernas, HUD e lanterna)
```

---

## ⚡ Pipeline de Otimização e Cache de GPU

### 1. `FactoryModelLoader.ts` (Cache Singleton)
Para evitar travamentos de frames (jank) e múltiplos downloads repetitivos de arquivos `.glb` pesados:
- Cada modelo é baixado uma única vez através de `GLTFLoader`.
- As instâncias subsequentes utilizam clonagem profunda de geometrias e materiais (`cloneGroup`), preservando materiais únicos para realce (highlight de seleção) sem reprocessar malhas.
- O método `preloadCommonModels()` é disparado na inicialização da aplicação para carregar todos os 12 ativos 3D essenciais em paralelo na memória GPU.

### 2. Compartilhamento de Texturas PBR 4K
- As texturas de difusão e oclusão de ambiente (`plastered_wall_05_diff_4k.jpg` e `ao_4k.jpg`) são instanciadas uma única vez na VRAM.
- Os 10 setores clonam o objeto de textura ajustando apenas os vetores de repetição UV (`repeat.set(rx, ry)`), economizando mais de 200MB de memória de vídeo.

### 3. Geração Procedural de Canvas Textures
- Texturas de sinalização aérea, crachás de piso e placas de máquinas são sintetizadas via `HTMLCanvasElement` em 2D de alta resolução e convertidas em `THREE.CanvasTexture` com filtro anisotrópico para máxima nitidez visual.

---

## 🔄 Loop de Renderização e Cinemática (Animation Loop)

O loop principal roda a 60 FPS dentro de [`FactoryCanvas.tsx`](file:///c:/Users/inaci/OneDrive/Desktop/SWT/Industria-3d-main/src/components/factory3d/FactoryCanvas.tsx) com delta de tempo estável:
1. **Atualização de Spindles**: Rotação contínua dos fusos de usinagem CNC e mandris de furação.
2. **Cinemática de Empilhadeiras**: Interpolação de caminho (waypoints) com rotação suave de rodas proporcionais à velocidade linear e ajuste de orientação em curvas.
3. **Cinemática de Caminhada do Avatar**: Função senoidal de passo articulando coxas, panturrilhas, braços e translação do tronco durante a movimentação com teclas `WASD`.
4. **Atualização dos Controles de Câmera**: `OrbitControls` com amortecimento suave (damping factor 0.05).
