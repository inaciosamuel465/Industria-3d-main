# 🏭 SWT Industrial 3D Digital Twin

Plataforma industrial de gêmeo digital 3D em tempo real para monitoramento, telemetria IoT (ESP32), análise de OEE, rastreamento de ordens de produção e inspeção virtual em primeira e terceira pessoa.

---

## 🌟 Principais Recursos

- **Visualização 3D de Alta Fidelidade (Three.js WebGL)**:
  - Piso monolítico de 110m × 84m com faixas de pedestres, demarcações de segurança OSHA e corredores de tráfego.
  - 10 Setores industriais com piso em textura PBR 4K, sinalizações no solo e placas suspensas a 8.2m de altura.
  - Modelos 3D industriais de alta precisão (Bihler GRM 80E, Centros CNC 5-Eixos, Furadeiras de Coluna, Empilhadeiras, Painéis e Desbobinadores).
- **Postos de Trabalho Bihler Completos (`PB01M` a `PB10M`)**:
  - Máquina conformadora e estampadora Bihler redimensionada para porte fabril pesado (escala 1.55x).
  - Painel de controle elétrico/automação posicionado à esquerda com folga ergonômica.
  - Desbobinador industrial de fita de aço (escala 2.4x) posicionado à direita.
  - Mesa de inspeção frontal dedicada à coleta de peças estampadas.
  - Placas de código físicas duplicadas (frente e verso) para visualização em 360°.
- **Setor CNC Usinagem 5-Eixos (`M17` a `M20`)**:
  - Centros de usinagem ampliados em +55% com rotação de spindle e palete com caixas de tarugos usinados.
- **Empilhadeiras Autônomas e Tráfego Logístico**:
  - Cinemática de rolamento suave das rodas e rotação de curvas nos corredores principais.
- **Avatar Inspetor Industrial**:
  - Modo operador com cinemática de caminhada realista, iluminação lanterna e HUD de telemetria no tablet.
- **Telemetria e IoT em Tempo Real**:
  - Monitoramento contínuo de temperatura, vibração (RMS), pressão de linha, corrente de motores, tempo de ciclo, OEE, disponibilidade, performance e qualidade.
  - Status dos módulos microcontroladores ESP32 com optoacopladores e monitoramento de pings/RSSI.

---

## 🏗️ Arquitetura do Sistema

```
Industria-3d-main/
├── public/
│   ├── models/                  # Modelos 3D industriais (.glb/.gltf)
│   │   ├── Maquina-bihler.glb   # Conformadora Bihler GRM 80E
│   │   ├── cnc-completo.glb     # Centro de usinagem CNC 5-eixos
│   │   ├── desbobinador.glb     # Desbobinador de bobina de aço
│   │   ├── painel.glb           # Painel de comando elétrico
│   │   ├── mesa.glb             # Mesa de coleta de peças
│   │   ├── palet.glb            # Palete industrial de madeira
│   │   ├── placa-setor.glb      # Placa aérea suspensa do setor
│   │   └── empilhadeira.glb     # Empilhadeira contrabalançada 3t
│   └── textures/                # Texturas PBR 4K de piso e superfícies
├── src/
│   ├── components/
│   │   ├── factory3d/           # Núcleo de renderização 3D Three.js
│   │   │   ├── FactoryCanvas.tsx       # Canvas WebGL e loop de animação
│   │   │   ├── FactorySceneBuilder.ts  # Construção de setores, máquinas e infraestrutura
│   │   │   └── FactoryLighting.ts      # Iluminação industrial e sombras suaves
│   │   ├── dashboard/           # Painéis de controle, OEE e KPIs
│   │   └── navigation/          # Minimapa 2D interativo e câmeras
│   ├── data/
│   │   └── initialFactoryData.ts # Definição dos 10 setores e máquinas
│   ├── types/
│   │   └── industrial.ts        # Interfaces de telemetria, ordens e máquinas
│   └── utils/
│       └── FactoryModelLoader.ts # Pipeline de pré-carregamento e cache GPU
├── docs/                        # Documentação técnica detalhada
├── CHANGELOG.md                 # Histórico completo de versões
├── INDEX.md                     # Índice geral de documentação
└── vite.config.ts               # Configuração Vite + React
```

---

## ⚙️ Instalação e Execução Local

### Pré-requisitos
- **Node.js**: Versão 18.0 ou superior
- **NPM** ou **Bun**

### Passos para Inicialização

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   O projeto estará acessível em: `http://localhost:3000` (ou na porta configurada pelo Vite).

3. **Verificar tipagem TypeScript**:
   ```bash
   npx tsc --noEmit
   ```

4. **Gerar build de produção**:
   ```bash
   npm run build
   ```

---

## 🎮 Controles de Navegação 3D

| Ação | Controle |
| :--- | :--- |
| **Rotacionar Câmera (Orbit)** | Clique com botão esquerdo + arrastar |
| **Transladar Câmera (Pan)** | Clique com botão direito + arrastar |
| **Zoom In / Out** | Roda do mouse (Scroll) |
| **Mover Inspetor Avatar** | Teclas `W`, `A`, `S`, `D` ou Setas do teclado |
| **Alternar Modos de Câmera** | Botões da barra superior: *Orbital*, *Primeira Pessoa*, *Top-Down Planta* |
| **Inspecionar Máquina** | Clique direto sobre a máquina 3D no chão de fábrica |

---

## 📊 Setores Industriais Mapeados

| Código | Nome do Setor | Equipamentos Principais | Coordenadas Fábrica |
| :--- | :--- | :--- | :--- |
| **`EST-01`** | Estampagem de Mola | Prensas excêntricas e conformadoras | X: -46 a -2, Z: -32 a -8.8 |
| **`BIH-02`** | BIHLER | 10 Conformadoras Bihler `PB01M`-`PB10M` | X: 2 a 46, Z: -32 a -8.8 |
| **`RSC-03`** | Rosca sem Fim | Laminadoras hidráulicas de roscas | X: -46 a -24, Z: -5.2 a 7.2 |
| **`ZNC-04`** | Zincagem | Linha galvânica de tratamento químico | X: -22 a -2, Z: -5.2 a 7.2 |
| **`USI-05`** | Torneamento & Fresamento | Tornos CNC de cabeçote móvel | X: 2 a 20, Z: -5.2 a 7.2 |
| **`CNC-10`** | Usinagem CNC 5-Eixos | 4 Centros CNC 5-eixos de alta precisão | X: 22 a 46, Z: -5.2 a 7.2 |
| **`FER-06`** | Ferramentaria | Eletroerosão a fio e retíficas | X: -46 a -24, Z: 10.8 a 32.0 |
| **`FUR-09`** | Furação Industrial | Furadeiras de coluna e bancadas | X: -22 a -2, Z: 10.8 a 32.0 |
| **`BIH-07`** | Linha Bihler Estampagem Contínua | Estampagem radial automatizada | X: 2 a 20, Z: 10.8 a 32.0 |
| **`EMB-08`** | Embalagem & Expedição | Paletização e filme stretch | X: 22 a 46, Z: 10.8 a 32.0 |

---

## 📄 Licença e Propriedade
Desenvolvido para **SWT Industrial**. Todos os direitos reservados.
