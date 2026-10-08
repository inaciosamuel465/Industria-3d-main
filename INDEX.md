# 📚 Índice Geral de Documentação — SWT Industrial 3D

Este documento centraliza todos os manuais técnicos, guias de arquitetura, referências de modelos 3D, dicionário de dados e procedimentos operacionais da plataforma.

---

## 🗂️ Estrutura de Documentos

```
├── README.md                      # Visão geral, instalação, recursos e controles
├── CHANGELOG.md                   # Histórico detalhado de versões e modificações
├── INDEX.md                       # Este arquivo (Índice mestre de navegação)
└── docs/
    ├── ARCHITECTURE_3D.md         # Arquitetura do motor 3D, Three.js e pipeline de renderização
    ├── SECTORS_MACHINERY.md       # Especificação técnica dos 10 setores e catálogo de máquinas
    └── TELEMETRY_IOT.md           # Protocolo de telemetria ESP32, métricas de OEE e KPIs
```

---

## 📖 Guias Rápidos por Tópico

### 1. ⚙️ Engenharia e Modelagem 3D
- **[Arquitetura 3D e Three.js](file:///c:/Users/inaci/OneDrive/Desktop/SWT/Industria-3d-main/docs/ARCHITECTURE_3D.md)**:
  - Carregador assíncrono com cache de memória GPU em [`FactoryModelLoader.ts`](file:///c:/Users/inaci/OneDrive/Desktop/SWT/Industria-3d-main/src/utils/FactoryModelLoader.ts).
  - Construção procedural do chão de fábrica, faixas de pedestres e placas em [`FactorySceneBuilder.ts`](file:///c:/Users/inaci/OneDrive/Desktop/SWT/Industria-3d-main/src/components/factory3d/FactorySceneBuilder.ts).
  - Iluminação industrial PBR e projeção de sombras em [`FactoryLighting.ts`](file:///c:/Users/inaci/OneDrive/Desktop/SWT/Industria-3d-main/src/components/factory3d/FactoryLighting.ts).

### 2. 🏭 Setores e Máquinas
- **[Catálogo de Setores e Maquinários](file:///c:/Users/inaci/OneDrive/Desktop/SWT/Industria-3d-main/docs/SECTORS_MACHINERY.md)**:
  - Célula Bihler com 10 máquinas (`PB01M` a `PB10M`), painéis de comando, desbobinadores pesados e mesas de inspeção frontal.
  - Célula CNC 5-Eixos (`M17` a `M20`) com spindle animado e estocagem em paletes.
  - Furadeiras de coluna industriais com bancada de madeira e carrinhos de ferramentas.
  - Coordenadas espaciais `(X, Y, Z)` de cada zona e layout de circulação.

### 3. 📡 Telemetria e IoT
- **[Protocolo de Telemetria e OEE](file:///c:/Users/inaci/OneDrive/Desktop/SWT/Industria-3d-main/docs/TELEMETRY_IOT.md)**:
  - Estrutura de dados dos microcontroladores ESP32 com optoacopladores.
  - Fórmulas de cálculo de OEE: *Disponibilidade*, *Performance* e *Qualidade*.
  - Gestão de ordens de produção (OP), lotes e contadores de peças.

---

## 🔍 Modelos 3D Integrados na Plataforma

| Nome do Arquivo | Descrição | Escala Aplicada | Localização de Uso |
| :--- | :--- | :--- | :--- |
| **`Maquina-bihler.glb`** | Máquina Conformadora e Estampadora Bihler GRM 80E | `1.55x` | Setor BIHLER (`PB01M` a `PB10M`) |
| **`cnc-completo.glb`** | Centro de Usinagem CNC 5-Eixos | `1.55x` | Setor Usinagem CNC (`M17` a `M20`) |
| **`painel.glb`** | Painel de Controle e Automação Industrial | `1.50x` | Lado esquerdo de cada máquina Bihler |
| **`desbobinador.glb`** | Desbobinador Industrial de Fita de Aço Mola | `2.40x` | Lado direito de cada máquina Bihler |
| **`mesa.glb`** | Mesa de Coleta e Inspeção de Peças Estampadas | `1.15x` | Frente de cada máquina Bihler |
| **`placa-setor.glb`** | Placa Aérea Suspensa com Cabo de Aço | `3.60x` | Centro superior dos 10 setores (8.2m) |
| **`palet.glb`** | Palete de Madeira com Caixas de Peças | `1.50x` | Setor CNC e Empilhadeiras |
| **`empilhadeira.glb`** | Empilhadeira Contrabalançada 3 Toneladas | `1.00x` | Corredores de tráfego logístico |
| **`old_drill_press.gltf`** | Furadeira de Coluna Industrial de Bancada | `0.016x` | Setor de Furação (`M21`, `M22`) |
| **`small_wooden_table_01.gltf`** | Bancada de Madeira Reforçada | `1.80x` | Apoio das Furadeiras de Coluna |
| **`tool_cart.gltf`** | Carrinho Móvel de Ferramentas Industriais | `0.015x` | Bancada das Furadeiras de Coluna |
| **`parede.glb`** | Módulo de Parede Perimetral de 12m | `1.00x` (Y: 15x) | Perímetro do Galpão (110m × 84m) |

---

## 🛠️ Comandos de Manutenção

- **Compilar TypeScript**: `npx tsc --noEmit`
- **Iniciar Servidor Dev**: `npm run dev`
- **Gerar Pacote de Produção**: `npm run build`
- **Visualizar Prévia de Produção**: `npm run preview`
