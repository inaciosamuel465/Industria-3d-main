# 🏭 Setores Industriais e Catálogo de Máquinas — SWT

Este documento detalha o layout do chão de fábrica, as zonas de cada setor industrial, os equipamentos instalados e suas características operacionais.

---

## 📍 Layout dos 10 Setores

A fábrica possui uma área de circulação e produção de **110 metros de largura por 84 metros de profundidade**, dividida em duas alas principais (Norte/Sul) e um corredor central de tráfego de 4 metros de largura.

```
       [ ALA NORTE - Z: -36m a -8.8m ]
+----------------------------+  |  +----------------------------+
| EST-01 Estampagem de Mola  |  |  | BIH-02 BIHLER (10 Máquinas)|
| (X: -46 a -2)              |  |  | (X: +2 a +46)              |
+----------------------------+  |  +----------------------------+
       [ CORREDOR TRANSVERSAL NORTE - Z: -7m ]
+-------------+--------------+  |  +-------------+--------------+
| RSC-03      | ZNC-04       |  |  | USI-05      | CNC-10       |
| Rosca s/Fim | Zincagem     |  |  | Torneamento | Usinagem 5-E |
+-------------+--------------+  |  +-------------+--------------+
       [ CORREDOR TRANSVERSAL SUL - Z: +9m ]
+-------------+--------------+  |  +-------------+--------------+
| FER-06      | FUR-09       |  |  | BIH-07      | EMB-08       |
| Ferrament.  | Furação Ind. |  |  | Estamp.Cont.| Expedição    |
+-------------+--------------+  |  +-------------+--------------+
       [ ALA SUL - Z: +10.8m a +32m ]
```

---

## 🦾 Setor BIHLER (`BIH-02`)

- **Supervisor Responsável**: Renato Silveira
- **Meta de OEE**: 91.5%
- **Área**: `X: 2.0 a 46.0`, `Z: -32.0 a -8.8`
- **Composição de cada Máquina**:
  1. **Máquina Bihler GRM 80E Multi-Slide** (Escala 1.55x): Máquina de conformação e estampagem radial de alta velocidade.
  2. **Mesa Frontal (`mesa.glb`)**: Mesa metálica de apoio (escala 1.15x) localizada na frente da máquina para recepção e inspeção de peças.
  3. **Painel Elétrico (`painel.glb`)**: Armário de controle CNC/automação à esquerda com folga ergonômica.
  4. **Desbobinador Industrial (`desbobinador.glb`)**: Desbobinador reforçado (escala 2.4x) à direita para desenrolamento da bobina de aço mola.
  5. **Placas de Identificação**: Placas duplas ampliadas no topo frontal e traseiro.

### Lista de Máquinas Bihler
| ID / Código | Nome da Máquina | Posição (X, Y, Z) | Produto em Fabricação |
| :--- | :--- | :--- | :--- |
| **`PB01M`** | Máquina Bihler PB01M | (7.0, 0, -25.0) | Abraçadeira de Pressão Inox 304 |
| **`PB02M`** | Máquina Bihler PB02M | (15.0, 0, -25.0) | Trava Elástica em Aço Mola 1070 |
| **`PB03M`** | Máquina Bihler PB03M | (23.0, 0, -25.0) | Clip de Fixação Cobre Berílio |
| **`PB04M`** | Máquina Bihler PB04M | (31.0, 0, -25.0) | Terminal Conector Automotivo |
| **`PB05M`** | Máquina Bihler PB05M | (39.0, 0, -25.0) | Cantoneira com Furo Oblongo |
| **`PB06M`** | Máquina Bihler PB06M | (7.0, 0, -15.0) | Anel de Retenção Elástico Ø25mm |
| **`PB07M`** | Máquina Bihler PB07M | (15.0, 0, -15.0) | Lâmina de Contato Bimetálica |
| **`PB08M`** | Máquina Bihler PB08M | (23.0, 0, -15.0) | Grampo de Fixação de Tubulação |
| **`PB09M`** | Máquina Bihler PB09M | (31.0, 0, -15.0) | Mola Plana de Ação Contínua |
| **`PB10M`** | Máquina Bihler PB10M | (39.0, 0, -15.0) | Anel Trava Cônico Especial |

---

## ⚙️ Setor Usinagem CNC 5-Eixos (`CNC-10`)

- **Supervisor Responsável**: Eng. Marcelo V. Fontes (Especialista CAM/CNC)
- **Meta de OEE**: 92.5%
- **Área**: `X: 22.0 a 46.0`, `Z: -5.2 a 7.2`
- **Equipamentos**:
  - `M17`, `M18`, `M19`, `M20`: Centros de Usinagem CNC 5-Eixos de Alta Precisão (Escala 1.55x).
  - Spindles de alta rotação sincronizados (20.0 rad/s).
  - Paletes dedicados com caixas de tarugos brutos e peças usinadas.
  - Placas de identificação frontais de 1.45m × 0.62m.

---

## 🔨 Setor Furação Industrial (`FUR-09`)

- **Supervisor Responsável**: Mestre Roberto C. Farias
- **Meta de OEE**: 89.5%
- **Área**: `X: -22.0 a -2.0`, `Z: 10.8 a 32.0`
- **Equipamentos**:
  - `M21`, `M22`: Furadeiras de Coluna Industriais montadas sobre bancadas pesadas de madeira maciça.
  - Mandris de furação com rotação contínua (14.0 rad/s).
  - Carrinhos móveis de ferramentas de usinagem e brocas ao lado da bancada.
