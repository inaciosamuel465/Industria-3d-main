# Changelog — SWT Industrial 3D Digital Twin

Todas as modificações notáveis, implementações de engenharia 3D, integração de maquinários e otimizações arquiteturais deste projeto são documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [2.4.0] - 2026-10-08

### 🏭 Setor BIHLER (Célula Automatizada de Conformação e Estampagem)
- **10 Máquinas Bihler Reais (`Maquina-bihler.glb`)**: Substituição de modelos genéricos por modelos industriais 3D pesados de alta fidelidade com escala ampliada em +55% (1.55x).
- **Padronização de Nomenclatura e IDs**:
  - `PB01M` até `PB10M` com telemetria dedicada (temperatura, vibração, pressão hidráulica, corrente do motor, ciclo de tempo, OEE e módulo ESP32 IoT).
- **Posto de Trabalho Completo por Máquina**:
  - **Mesa de Coleta Frontal (`mesa.glb`)**: Posicionada na face de ejeção frontal da máquina para recepção de peças estampadas, dimensionada em proporção precisa (escala 1.15x) com caixas organizadoras de peças.
  - **Desbobinador Lateral Direito (`desbobinador.glb`)**: Dimensionado em porte industrial pesado (escala 2.4x) com alinhamento na entrada de fita de aço mola da máquina.
  - **Painel Elétrico Lateral Esquerdo (`painel.glb`)**: Console de controle e automação com folga ergonômica de ~40cm do chassi da máquina.
  - **Remoção de Paletes no Setor Bihler**: Eliminação de paletes do setor para desobstrução das linhas de passagem e fluxo direto mesa-peça.

### ⚙️ Setor CNC (Usinagem 5-Eixos)
- **Centros de Usinagem CNC (`cnc-completo.glb`)**: Redimensionamento proporcional em +55% (escala 1.55x) para equiparação de escala fabril pesada.
- **Paletes de Tarugos e Peças Usinadas (`palet.glb`)**: Inclusão de paletes de apoio e caixas de tarugos industriais ao lado de cada centro CNC.
- **Spindle Rotativo de Alta Velocidade**: Animação de rotação contínua (20 rad/s) no eixo árvore usinado.

### 🏷️ Sinalização Industrial e Placas de Identificação (Escala 2x)
- **Placas Suspensas dos Setores (`placa-setor.glb`)**:
  - Suspensão aérea centralizada a 8.2m de altura em cada um dos 10 setores da planta.
  - Cabo duplo de aço estrutural estendido até o teto industrial (12m).
  - Canvas de alta resolução (2048×640 px) com sinalização dupla face (frente/verso), código do setor em amarelo segurança OSHA (ex: `[ BIH-02 ]`, `[ CNC-10 ]`) e nome em branco negrito 900.
- **Placas Físicas de Código nas Máquinas**:
  - Estrutura metálica anodizada de 1.45m × 0.62m com parafusos de fixação nos 4 cantos e borda amarela chanfrada de 14px.
  - Tipografia de alto contraste de 150px para leitura clara mesmo a distâncias longas da câmera.
  - Fixação duplicada nas máquinas Bihler (topo frontal e topo traseiro) para evitar qualquer obstrução visual por painéis laterais.

### 🚀 Otimizações de Performance & GPU Pipeline
- **Compartilhamento de Texturas em Memória GPU**:
  - Texturas de piso epóxi branco e piso de concreto rebocado 4K PBR carregadas uma única vez e clonadas por referência.
  - Geração de textura procedural única para faixas de perigo OSHA (`hazardStripe`).
- **Pré-carregamento Assíncrono (`FactoryModelLoader.ts`)**:
  - Pipeline de cache com `Map<string, THREE.Group>` para evitar re-downloads e congelamento de frames durante a navegação do operador.

---

## [2.3.0] - 2026-10-07

### 🚜 Empilhadeiras Contrabalançadas 3D & Logística
- **Empilhadeiras Reais de 3 Toneladas (`empilhadeira.glb`)**:
  - Importação de modelo industrial amarelo com contrapeso cinza escuro, mastro duplo e garfos.
  - Animação cinemática realista de deslocamento nas pistas principais com giro sincronizado de rodas sem deslizamento vertical no piso.
  - Cargas de palete e caixas de peças acopladas nos garfos frontais.

### 🚶 Avatar Inspetor Industrial Humanóide
- Cinemática de caminhada com oscilação pendular de pernas e braços.
- Tablet de telemetria com tela HUD emissiva acoplado ao antebraço.
- Sensor LiDAR de topo com rotação contínua e feixe de iluminação dinâmica frontal.

### 🏢 Infraestrutura e Arquitetura Fabril
- Piso principal de 110m × 84m em epóxi claro monolítico.
- Faixas de segurança, zebras para pedestres em todas as interseções e setas direcionais de tráfego.
- Paredes perimetrais modulares 3D de 12m de altura.

---

## [1.0.0] - 2026-10-05
- Estruturação inicial do projeto React + TypeScript + Vite + Three.js.
- Visualizador 3D com controle OrbitControls, minimapa, seleção de máquinas e painel de telemetria OEE/GPM.
