import { Sector, Machine } from '../types/industrial';

export const INITIAL_SECTORS: Sector[] = [
  {
    id: 'estampagem-mola',
    name: 'Estampagem de Mola',
    code: 'EST-01',
    description: 'Prensas excêntricas, conformadoras de molas de tração, compressão e lâminas de precisão.',
    color: '#0284C7', // Sky Blue
    floorArea: { minX: -46.0, maxX: -2.0, minZ: -32.0, maxZ: -8.8 },
    supervisor: 'Carlos Eduardo Ramos',
    targetOee: 85.0
  },
  {
    id: 'combinada',
    name: 'BIHLER',
    code: 'BIH-02',
    description: 'Célula de alta produtividade com 10 máquinas conformadoras e estampadoras automáticas Bihler com paletes dedicados.',
    color: '#2563EB', // Blue
    floorArea: { minX: 2.0, maxX: 46.0, minZ: -32.0, maxZ: -8.8 },
    supervisor: 'Renato Silveira',
    targetOee: 91.5
  },
  {
    id: 'rosca-sem-fim',
    name: 'Rosca sem fim',
    code: 'RSC-03',
    description: 'Laminadoras hidráulicas de roscas e conformação a frio de parafusos e eixos helicoidais.',
    color: '#0D9488', // Teal
    floorArea: { minX: -46.0, maxX: -24.0, minZ: -5.2, maxZ: 7.2 },
    supervisor: 'Marcos Vinícius Prado',
    targetOee: 84.0
  },
  {
    id: 'zincagem',
    name: 'Zincagem',
    code: 'ZNC-04',
    description: 'Linha automatizada de tratamento superficial químico, decapagem ácida, banhos galvânicos e zincagem de abraçadeiras.',
    color: '#D97706', // Amber/Bronze
    floorArea: { minX: -22.0, maxX: -2.0, minZ: -5.2, maxZ: 7.2 },
    supervisor: 'Dra. Helena Martins (Química Resp.)',
    targetOee: 90.0
  },
  {
    id: 'usinagem',
    name: 'Torneamento & Fresamento',
    code: 'USI-05',
    description: 'Tornos CNC de cabeçote móvel Mazak e fresadoras CNC para torneamento e usinagem seriada de componentes.',
    color: '#4F46E5', // Indigo
    floorArea: { minX: 2.0, maxX: 20.0, minZ: -5.2, maxZ: 7.2 },
    supervisor: 'Alexandre Mendes',
    targetOee: 86.5
  },
  {
    id: 'cnc-usinagem-avancada',
    name: 'Usinagem CNC 5-Eixos',
    code: 'CNC-10',
    description: 'Célula automatizada com 4 centros de usinagem CNC 5-eixos de alta precisão para fabricação de matrizes, blocos de válvulas e componentes aeronáuticos.',
    color: '#8B5CF6', // Electric Indigo / Purple
    floorArea: { minX: 22.0, maxX: 46.0, minZ: -5.2, maxZ: 7.2 },
    supervisor: 'Eng. Marcelo V. Fontes (Especialista CAM/CNC)',
    targetOee: 92.5
  },
  {
    id: 'ferramentaria',
    name: 'Ferramentaria',
    code: 'FER-06',
    description: 'Eletroerosão a fio, retíficas planas de barramento e bancadas de ajuste para matrizes e moldes.',
    color: '#0891B2', // Cyan
    floorArea: { minX: -46.0, maxX: -24.0, minZ: 10.8, maxZ: 32.0 },
    supervisor: 'Mestre Waldir Fonseca',
    targetOee: 82.0
  },
  {
    id: 'furacao-industrial',
    name: 'Furação Industrial & Bancada',
    code: 'FUR-09',
    description: 'Célula de furação vertical de precisão com furadeiras de coluna industriais de bancada para mandrilhamento e furação de peças.',
    color: '#10B981', // Emerald Green
    floorArea: { minX: -22.0, maxX: -2.0, minZ: 10.8, maxZ: 32.0 },
    supervisor: 'Mestre Roberto C. Farias',
    targetOee: 89.5
  },
  {
    id: 'bihler-producao',
    name: 'Linha Bihler · Estampagem Contínua',
    code: 'BIH-07',
    description: 'Linha automatizada de conformação e estampagem radial Bihler com desbobinador de fita de aço, esteira de ejeção e acondicionamento contínuo em caixas.',
    color: '#059669', // Reseda Industrial Green
    floorArea: { minX: 2.0, maxX: 20.0, minZ: 10.8, maxZ: 32.0 },
    supervisor: 'Eng. Guilherme K. Bihler (Especialista de Processo)',
    targetOee: 92.0
  },
  {
    id: 'embalagem-expedicao',
    name: 'Embalagem & Paletização',
    code: 'EMB-08',
    description: 'Linha automatizada de selagem de caixas, pesagem dinâmica, montagem de paletes e enfitamento automático com filme stretch.',
    color: '#EA580C', // Packaging Orange
    floorArea: { minX: 22.0, maxX: 46.0, minZ: 10.8, maxZ: 32.0 },
    supervisor: 'Clarice Monteiro (Gestão de Expedição)',
    targetOee: 94.0
  }
];

export const INITIAL_MACHINES: Machine[] = [
  // --- SETOR: BIHLER · CONFORMAÇÃO & ESTAMPAGEM (BIH-02) ---
  {
    id: 'PB01M',
    code: 'PB01M',
    name: 'Máquina Bihler PB01M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 7.0, y: 0, z: -25.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Renato Silveira', badge: 'BIH-101', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-201',
      productCode: 'ABR-INOX-32',
      productName: 'Abraçadeira de Pressão Inox 304 com Trava',
      plannedQty: 12000,
      producedQty: 9450,
      scrapQty: 18,
      batchNumber: 'L26-BIH01',
      standardCycleTimeSec: 0.75
    },
    telemetry: {
      temperature: 38.5,
      vibration: 0.8,
      pressure: 6.2,
      motorCurrent: 14.2,
      cycleTimeSec: 0.72,
      piecesPerMinute: 83.3,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.101',
        mac: 'C8:2E:18:4A:11:01',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -48,
        uptimeHours: 420.0,
        pulseCounterRaw: 9450,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 12
      }
    },
    kpi: {
      oee: 92.4,
      availability: 96.0,
      performance: 97.2,
      quality: 99.0,
      gpm: 83.3,
      uptimeSeconds: 27000,
      downtimeSeconds: 600,
      scrapRate: 0.19
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '12/09/2026',
      nextPreventiveDate: '12/11/2026',
      lubricationLevel: 94,
      toolWearPercent: 15
    }
  },
  {
    id: 'PB02M',
    code: 'PB02M',
    name: 'Máquina Bihler PB02M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 15.0, y: 0, z: -25.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Gustavo Paiva', badge: 'BIH-102', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-202',
      productCode: 'TRV-MOL-40',
      productName: 'Trava Elástica Conformada em Fita de Aço Mola 1070',
      plannedQty: 10000,
      producedQty: 8120,
      scrapQty: 22,
      batchNumber: 'L26-BIH02',
      standardCycleTimeSec: 0.80
    },
    telemetry: {
      temperature: 39.1,
      vibration: 0.9,
      pressure: 6.0,
      motorCurrent: 14.6,
      cycleTimeSec: 0.78,
      piecesPerMinute: 76.9,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.102',
        mac: 'C8:2E:18:4A:11:02',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -50,
        uptimeHours: 420.0,
        pulseCounterRaw: 8120,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 14
      }
    },
    kpi: {
      oee: 91.8,
      availability: 95.5,
      performance: 96.8,
      quality: 99.3,
      gpm: 76.9,
      uptimeSeconds: 26800,
      downtimeSeconds: 800,
      scrapRate: 0.27
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '12/09/2026',
      nextPreventiveDate: '12/11/2026',
      lubricationLevel: 92,
      toolWearPercent: 18
    }
  },
  {
    id: 'PB03M',
    code: 'PB03M',
    name: 'Máquina Bihler PB03M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 23.0, y: 0, z: -25.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Danilo Alencar', badge: 'BIH-103', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-203',
      productCode: 'CLP-ELT-12',
      productName: 'Clip de Fixação Elétrica em Cobre Berílio',
      plannedQty: 15000,
      producedQty: 11800,
      scrapQty: 15,
      batchNumber: 'L26-BIH03',
      standardCycleTimeSec: 0.60
    },
    telemetry: {
      temperature: 41.0,
      vibration: 0.7,
      pressure: 6.3,
      motorCurrent: 13.8,
      cycleTimeSec: 0.58,
      piecesPerMinute: 103.4,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.103',
        mac: 'C8:2E:18:4A:11:03',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -49,
        uptimeHours: 420.0,
        pulseCounterRaw: 11800,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 10
      }
    },
    kpi: {
      oee: 93.5,
      availability: 96.8,
      performance: 97.4,
      quality: 99.4,
      gpm: 103.4,
      uptimeSeconds: 27200,
      downtimeSeconds: 400,
      scrapRate: 0.12
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '14/09/2026',
      nextPreventiveDate: '14/11/2026',
      lubricationLevel: 96,
      toolWearPercent: 12
    }
  },
  {
    id: 'PB04M',
    code: 'PB04M',
    name: 'Máquina Bihler PB04M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 31.0, y: 0, z: -25.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Fabio Salles', badge: 'BIH-104', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-204',
      productCode: 'TRM-CON-08',
      productName: 'Terminal Conector Rápido Automotivo Banhado a Prata',
      plannedQty: 18000,
      producedQty: 14300,
      scrapQty: 25,
      batchNumber: 'L26-BIH04',
      standardCycleTimeSec: 0.50
    },
    telemetry: {
      temperature: 42.2,
      vibration: 0.8,
      pressure: 6.4,
      motorCurrent: 14.0,
      cycleTimeSec: 0.49,
      piecesPerMinute: 122.4,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.104',
        mac: 'C8:2E:18:4A:11:04',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -51,
        uptimeHours: 410.0,
        pulseCounterRaw: 14300,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 15
      }
    },
    kpi: {
      oee: 94.0,
      availability: 97.0,
      performance: 97.8,
      quality: 99.2,
      gpm: 122.4,
      uptimeSeconds: 27400,
      downtimeSeconds: 300,
      scrapRate: 0.17
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '15/09/2026',
      nextPreventiveDate: '15/11/2026',
      lubricationLevel: 90,
      toolWearPercent: 20
    }
  },
  {
    id: 'PB05M',
    code: 'PB05M',
    name: 'Máquina Bihler PB05M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 39.0, y: 0, z: -25.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Thiago Nery', badge: 'BIH-105', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-205',
      productCode: 'CNT-MOL-18',
      productName: 'Cantoneira Estampada com Furo Oblongo Aço Carbono',
      plannedQty: 8000,
      producedQty: 6200,
      scrapQty: 14,
      batchNumber: 'L26-BIH05',
      standardCycleTimeSec: 0.90
    },
    telemetry: {
      temperature: 40.5,
      vibration: 0.9,
      pressure: 6.1,
      motorCurrent: 15.0,
      cycleTimeSec: 0.88,
      piecesPerMinute: 68.2,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.105',
        mac: 'C8:2E:18:4A:11:05',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -52,
        uptimeHours: 410.0,
        pulseCounterRaw: 6200,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 16
      }
    },
    kpi: {
      oee: 91.0,
      availability: 95.0,
      performance: 96.5,
      quality: 99.1,
      gpm: 68.2,
      uptimeSeconds: 26600,
      downtimeSeconds: 900,
      scrapRate: 0.22
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '15/09/2026',
      nextPreventiveDate: '15/11/2026',
      lubricationLevel: 88,
      toolWearPercent: 24
    }
  },
  {
    id: 'PB06M',
    code: 'PB06M',
    name: 'Máquina Bihler PB06M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 7.0, y: 0, z: -15.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Claudio Miranda', badge: 'BIH-106', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-206',
      productCode: 'ANL-RET-25',
      productName: 'Anel de Retenção Elástico para Eixo Ø25mm',
      plannedQty: 14000,
      producedQty: 10900,
      scrapQty: 20,
      batchNumber: 'L26-BIH06',
      standardCycleTimeSec: 0.65
    },
    telemetry: {
      temperature: 39.8,
      vibration: 0.8,
      pressure: 6.2,
      motorCurrent: 14.1,
      cycleTimeSec: 0.63,
      piecesPerMinute: 95.2,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.106',
        mac: 'C8:2E:18:4A:11:06',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -47,
        uptimeHours: 400.0,
        pulseCounterRaw: 10900,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 11
      }
    },
    kpi: {
      oee: 92.8,
      availability: 96.2,
      performance: 97.0,
      quality: 99.3,
      gpm: 95.2,
      uptimeSeconds: 27100,
      downtimeSeconds: 500,
      scrapRate: 0.18
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '16/09/2026',
      nextPreventiveDate: '16/11/2026',
      lubricationLevel: 92,
      toolWearPercent: 16
    }
  },
  {
    id: 'PB07M',
    code: 'PB07M',
    name: 'Máquina Bihler PB07M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 15.0, y: 0, z: -15.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Elias Fagundes', badge: 'BIH-107', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-207',
      productCode: 'LMN-CON-04',
      productName: 'Lâmina de Contato Bimetálica para Relé Térmico',
      plannedQty: 20000,
      producedQty: 16200,
      scrapQty: 28,
      batchNumber: 'L26-BIH07',
      standardCycleTimeSec: 0.45
    },
    telemetry: {
      temperature: 41.5,
      vibration: 0.7,
      pressure: 6.5,
      motorCurrent: 13.9,
      cycleTimeSec: 0.44,
      piecesPerMinute: 136.3,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.107',
        mac: 'C8:2E:18:4A:11:07',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -48,
        uptimeHours: 400.0,
        pulseCounterRaw: 16200,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 13
      }
    },
    kpi: {
      oee: 94.5,
      availability: 97.2,
      performance: 98.0,
      quality: 99.3,
      gpm: 136.3,
      uptimeSeconds: 27500,
      downtimeSeconds: 300,
      scrapRate: 0.17
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '16/09/2026',
      nextPreventiveDate: '16/11/2026',
      lubricationLevel: 95,
      toolWearPercent: 14
    }
  },
  {
    id: 'PB08M',
    code: 'PB08M',
    name: 'Máquina Bihler PB08M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 23.0, y: 0, z: -15.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Helio Gouveia', badge: 'BIH-108', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-208',
      productCode: 'GRF-PRE-15',
      productName: 'Grampo de Fixação de Tubulação Automotiva',
      plannedQty: 11000,
      producedQty: 8750,
      scrapQty: 16,
      batchNumber: 'L26-BIH08',
      standardCycleTimeSec: 0.70
    },
    telemetry: {
      temperature: 38.9,
      vibration: 0.8,
      pressure: 6.2,
      motorCurrent: 14.4,
      cycleTimeSec: 0.68,
      piecesPerMinute: 88.2,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.108',
        mac: 'C8:2E:18:4A:11:08',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -50,
        uptimeHours: 390.0,
        pulseCounterRaw: 8750,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 14
      }
    },
    kpi: {
      oee: 93.0,
      availability: 96.5,
      performance: 97.2,
      quality: 99.2,
      gpm: 88.2,
      uptimeSeconds: 27200,
      downtimeSeconds: 450,
      scrapRate: 0.18
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '18/09/2026',
      nextPreventiveDate: '18/11/2026',
      lubricationLevel: 91,
      toolWearPercent: 19
    }
  },
  {
    id: 'PB09M',
    code: 'PB09M',
    name: 'Máquina Bihler PB09M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 31.0, y: 0, z: -15.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Julio Cesar Vaz', badge: 'BIH-109', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-209',
      productCode: 'MOL-PLN-06',
      productName: 'Mola Plana de Ação Contínua para Fechadura',
      plannedQty: 13000,
      producedQty: 10400,
      scrapQty: 21,
      batchNumber: 'L26-BIH09',
      standardCycleTimeSec: 0.75
    },
    telemetry: {
      temperature: 40.8,
      vibration: 0.9,
      pressure: 6.3,
      motorCurrent: 14.8,
      cycleTimeSec: 0.73,
      piecesPerMinute: 82.1,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.109',
        mac: 'C8:2E:18:4A:11:09',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -52,
        uptimeHours: 390.0,
        pulseCounterRaw: 10400,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 17
      }
    },
    kpi: {
      oee: 92.0,
      availability: 95.8,
      performance: 96.9,
      quality: 99.1,
      gpm: 82.1,
      uptimeSeconds: 26900,
      downtimeSeconds: 700,
      scrapRate: 0.20
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '18/09/2026',
      nextPreventiveDate: '18/11/2026',
      lubricationLevel: 89,
      toolWearPercent: 22
    }
  },
  {
    id: 'PB10M',
    code: 'PB10M',
    name: 'Máquina Bihler PB10M',
    model: 'Bihler GRM 80E Multi-Slide',
    manufacturer: 'Otto Bihler Maschinenfabrik',
    year: 2024,
    category: 'bihler-combinada',
    sectorId: 'combinada',
    sectorName: 'BIHLER',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 39.0, y: 0, z: -15.0 },
    rotationY: 0,
    dimensions: { width: 3.2, height: 2.4, depth: 2.2 },
    operator: { name: 'Wellington Reis', badge: 'BIH-110', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-BIH-210',
      productCode: 'ANL-TRA-10',
      productName: 'Anel Trava Cônico Especial com Tratamento Térmico',
      plannedQty: 16000,
      producedQty: 12900,
      scrapQty: 24,
      batchNumber: 'L26-BIH10',
      standardCycleTimeSec: 0.55
    },
    telemetry: {
      temperature: 42.0,
      vibration: 0.8,
      pressure: 6.4,
      motorCurrent: 14.3,
      cycleTimeSec: 0.54,
      piecesPerMinute: 111.1,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.110',
        mac: 'C8:2E:18:4A:11:10',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -53,
        uptimeHours: 390.0,
        pulseCounterRaw: 12900,
        optocouplerProtected: true,
        debounceThresholdMs: 15,
        lastPingMs: 18
      }
    },
    kpi: {
      oee: 93.2,
      availability: 96.6,
      performance: 97.4,
      quality: 99.2,
      gpm: 111.1,
      uptimeSeconds: 27300,
      downtimeSeconds: 400,
      scrapRate: 0.18
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '20/09/2026',
      nextPreventiveDate: '20/11/2026',
      lubricationLevel: 93,
      toolWearPercent: 17
    }
  },
  // --- SETOR: FURAÇÃO INDUSTRIAL & BANCADA (FUR-09) ---
  {
    id: 'M17',
    code: 'M17',
    name: 'Máquina 17 - Furadeira de Coluna Radial Industrial 01',
    model: 'Drill-Press Pro 4K Heavy Duty',
    manufacturer: 'Industrial Drill Works',
    year: 2023,
    category: 'furadeira-coluna',
    sectorId: 'furacao-industrial',
    sectorName: 'Furação Industrial & Bancada',
    status: 'running',
    connectionStatus: 'online',
    position: { x: -17.0, y: 0, z: 21.4 },
    rotationY: 0,
    dimensions: { width: 2.5, height: 2.6, depth: 2.0 },
    operator: { name: 'Lucas Pinheiro', badge: 'FUR-301', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-FUR-101',
      productCode: 'BLC-FUR-08',
      productName: 'Flange de Fixação Perfurada Ø12mm Aço 1045',
      plannedQty: 600,
      producedQty: 480,
      scrapQty: 4,
      batchNumber: 'L26-FUR01',
      standardCycleTimeSec: 28.0
    },
    telemetry: {
      temperature: 42.5,
      vibration: 1.3,
      pressure: 5.5,
      motorCurrent: 8.4,
      cycleTimeSec: 27.2,
      piecesPerMinute: 2.2,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.117',
        mac: 'C8:2E:18:4A:11:17',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -52,
        uptimeHours: 320.0,
        pulseCounterRaw: 480,
        optocouplerProtected: true,
        debounceThresholdMs: 25,
        lastPingMs: 18
      }
    },
    kpi: {
      oee: 91.2,
      availability: 95.0,
      performance: 96.8,
      quality: 99.2,
      gpm: 2.2,
      uptimeSeconds: 26800,
      downtimeSeconds: 1200,
      scrapRate: 0.8
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '10/09/2026',
      nextPreventiveDate: '10/11/2026',
      lubricationLevel: 88,
      toolWearPercent: 22
    }
  },
  {
    id: 'M18',
    code: 'M18',
    name: 'Máquina 18 - Furadeira de Coluna Radial Industrial 02',
    model: 'Drill-Press Pro 4K Heavy Duty',
    manufacturer: 'Industrial Drill Works',
    year: 2023,
    category: 'furadeira-coluna',
    sectorId: 'furacao-industrial',
    sectorName: 'Furação Industrial & Bancada',
    status: 'running',
    connectionStatus: 'online',
    position: { x: -12.0, y: 0, z: 21.4 },
    rotationY: 0,
    dimensions: { width: 2.5, height: 2.6, depth: 2.0 },
    operator: { name: 'Marcos Aurelio', badge: 'FUR-302', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-FUR-102',
      productCode: 'BLC-FUR-10',
      productName: 'Suporte Articulado com Rosca e Furos Escareados',
      plannedQty: 500,
      producedQty: 395,
      scrapQty: 2,
      batchNumber: 'L26-FUR02',
      standardCycleTimeSec: 32.0
    },
    telemetry: {
      temperature: 45.1,
      vibration: 1.4,
      pressure: 5.6,
      motorCurrent: 8.8,
      cycleTimeSec: 31.0,
      piecesPerMinute: 1.9,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.118',
        mac: 'C8:2E:18:4A:11:18',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -55,
        uptimeHours: 320.0,
        pulseCounterRaw: 395,
        optocouplerProtected: true,
        debounceThresholdMs: 25,
        lastPingMs: 20
      }
    },
    kpi: {
      oee: 89.6,
      availability: 94.2,
      performance: 95.5,
      quality: 99.5,
      gpm: 1.9,
      uptimeSeconds: 26200,
      downtimeSeconds: 1500,
      scrapRate: 0.5
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '10/09/2026',
      nextPreventiveDate: '10/11/2026',
      lubricationLevel: 85,
      toolWearPercent: 28
    }
  },
  {
    id: 'M19',
    code: 'M19',
    name: 'Máquina 19 - Furadeira de Coluna Radial Industrial 03',
    model: 'Drill-Press Pro 4K Heavy Duty',
    manufacturer: 'Industrial Drill Works',
    year: 2023,
    category: 'furadeira-coluna',
    sectorId: 'furacao-industrial',
    sectorName: 'Furação Industrial & Bancada',
    status: 'running',
    connectionStatus: 'online',
    position: { x: -7.0, y: 0, z: 21.4 },
    rotationY: 0,
    dimensions: { width: 2.5, height: 2.6, depth: 2.0 },
    operator: { name: 'Valter Nogueira', badge: 'FUR-303', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-FUR-103',
      productCode: 'BLC-FUR-14',
      productName: 'Base de Manifold Hidráulico 6 Canais',
      plannedQty: 400,
      producedQty: 310,
      scrapQty: 5,
      batchNumber: 'L26-FUR03',
      standardCycleTimeSec: 40.0
    },
    telemetry: {
      temperature: 46.8,
      vibration: 1.6,
      pressure: 5.8,
      motorCurrent: 9.1,
      cycleTimeSec: 39.0,
      piecesPerMinute: 1.5,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.119',
        mac: 'C8:2E:18:4A:11:19',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -50,
        uptimeHours: 320.0,
        pulseCounterRaw: 310,
        optocouplerProtected: true,
        debounceThresholdMs: 25,
        lastPingMs: 15
      }
    },
    kpi: {
      oee: 88.0,
      availability: 93.5,
      performance: 94.8,
      quality: 98.4,
      gpm: 1.5,
      uptimeSeconds: 25400,
      downtimeSeconds: 1800,
      scrapRate: 1.6
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '10/09/2026',
      nextPreventiveDate: '10/11/2026',
      lubricationLevel: 80,
      toolWearPercent: 35
    }
  },

  // --- SETOR: USINAGEM CNC 5-EIXOS (CNC-10) ---
  {
    id: 'M22',
    code: 'M22',
    name: 'Máquina 22 - Centro de Usinagem CNC 5-Eixos DMG MORI DMU 65',
    model: 'DMU 65 monoBLOCK 5-Axis',
    manufacturer: 'DMG MORI AG',
    year: 2024,
    category: 'cnc-centro-usinagem',
    sectorId: 'cnc-usinagem-avancada',
    sectorName: 'Usinagem CNC 5-Eixos',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 28.0, y: 0, z: -1.8 },
    rotationY: 0,
    dimensions: { width: 4.2, height: 2.8, depth: 3.6 },
    operator: { name: 'Lucas Bertoli', badge: 'CNC-501', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-CNC-901',
      productCode: 'BLC-VLV5X-AERO',
      productName: 'Bloco de Distribuição Hidráulico Aeroespacial 5-Eixos (Alumínio 7075-T6)',
      plannedQty: 350,
      producedQty: 290,
      scrapQty: 2,
      batchNumber: 'L26-CNC01',
      standardCycleTimeSec: 95.0
    },
    telemetry: {
      temperature: 42.5,
      vibration: 0.9,
      pressure: 35.0, // Alta pressão coolant interno spindle 15.000 RPM
      motorCurrent: 24.8,
      cycleTimeSec: 93.4,
      piecesPerMinute: 0.64,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.122',
        mac: 'C8:2E:18:4A:11:22',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -52,
        uptimeHours: 360.0,
        pulseCounterRaw: 292,
        optocouplerProtected: true,
        debounceThresholdMs: 30,
        lastPingMs: 18
      }
    },
    kpi: {
      oee: 93.8,
      availability: 96.5,
      performance: 97.8,
      quality: 99.4,
      gpm: 0.64,
      uptimeSeconds: 26800,
      downtimeSeconds: 850,
      scrapRate: 0.68
    },
    downtimeHistory: [
      { id: 'dt-cnc-01', reason: 'Troca de inserto de acabamento toroidal Ø12', category: 'operacional', startedAt: '09:10', durationMinutes: 12, resolved: true }
    ],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '15/09/2026',
      nextPreventiveDate: '15/11/2026',
      lubricationLevel: 96,
      toolWearPercent: 18
    }
  },
  {
    id: 'M23',
    code: 'M23',
    name: 'Máquina 23 - Centro de Usinagem CNC 5-Eixos Hermle C42U',
    model: 'Hermle C42U MT Dynamic',
    manufacturer: 'Maschinenfabrik Berthold Hermle AG',
    year: 2024,
    category: 'cnc-centro-usinagem',
    sectorId: 'cnc-usinagem-avancada',
    sectorName: 'Usinagem CNC 5-Eixos',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 40.0, y: 0, z: -1.8 },
    rotationY: 0,
    dimensions: { width: 4.2, height: 2.8, depth: 3.6 },
    operator: { name: 'Fabiano Resende', badge: 'CNC-502', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-CNC-902',
      productCode: 'MTZ-STP-D2',
      productName: 'Matriz de Estamparia de Precisão Aço Ferramenta D2 Tratado 60 HRC',
      plannedQty: 180,
      producedQty: 145,
      scrapQty: 1,
      batchNumber: 'L26-CNC02',
      standardCycleTimeSec: 140.0
    },
    telemetry: {
      temperature: 44.1,
      vibration: 1.1,
      pressure: 40.0,
      motorCurrent: 28.2,
      cycleTimeSec: 138.0,
      piecesPerMinute: 0.43,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.123',
        mac: 'C8:2E:18:4A:11:23',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -54,
        uptimeHours: 340.0,
        pulseCounterRaw: 146,
        optocouplerProtected: true,
        debounceThresholdMs: 30,
        lastPingMs: 20
      }
    },
    kpi: {
      oee: 92.4,
      availability: 95.8,
      performance: 97.0,
      quality: 99.3,
      gpm: 0.43,
      uptimeSeconds: 26400,
      downtimeSeconds: 1100,
      scrapRate: 0.69
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '18/09/2026',
      nextPreventiveDate: '18/11/2026',
      lubricationLevel: 94,
      toolWearPercent: 22
    }
  },
  {
    id: 'M24',
    code: 'M24',
    name: 'Máquina 24 - Centro de Usinagem CNC 5-Eixos Mazak Variaxis C-600',
    model: 'Variaxis C-600 SmoothX',
    manufacturer: 'Yamazaki Mazak Corp',
    year: 2023,
    category: 'cnc-centro-usinagem',
    sectorId: 'cnc-usinagem-avancada',
    sectorName: 'Usinagem CNC 5-Eixos',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 28.0, y: 0, z: 4.2 },
    rotationY: 0,
    dimensions: { width: 4.2, height: 2.8, depth: 3.6 },
    operator: { name: 'Thiago Castilho', badge: 'CNC-503', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-CNC-903',
      productCode: 'IMP-TURB-INX',
      productName: 'Impelidor Helicoidal Turbinado Aço Inox 316L',
      plannedQty: 420,
      producedQty: 360,
      scrapQty: 3,
      batchNumber: 'L26-CNC03',
      standardCycleTimeSec: 80.0
    },
    telemetry: {
      temperature: 43.8,
      vibration: 1.0,
      pressure: 32.0,
      motorCurrent: 23.5,
      cycleTimeSec: 78.5,
      piecesPerMinute: 0.76,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.124',
        mac: 'C8:2E:18:4A:11:24',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -56,
        uptimeHours: 380.0,
        pulseCounterRaw: 363,
        optocouplerProtected: true,
        debounceThresholdMs: 30,
        lastPingMs: 22
      }
    },
    kpi: {
      oee: 94.2,
      availability: 97.0,
      performance: 97.6,
      quality: 99.5,
      gpm: 0.76,
      uptimeSeconds: 27000,
      downtimeSeconds: 700,
      scrapRate: 0.83
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '20/09/2026',
      nextPreventiveDate: '20/11/2026',
      lubricationLevel: 98,
      toolWearPercent: 15
    }
  },
  {
    id: 'M25',
    code: 'M25',
    name: 'Máquina 25 - Centro de Usinagem CNC 5-Eixos Haas UMC-750 Pro',
    model: 'UMC-750 Pro NextGen',
    manufacturer: 'Haas Automation Inc',
    year: 2024,
    category: 'cnc-centro-usinagem',
    sectorId: 'cnc-usinagem-avancada',
    sectorName: 'Usinagem CNC 5-Eixos',
    status: 'running',
    connectionStatus: 'online',
    position: { x: 40.0, y: 0, z: 4.2 },
    rotationY: 0,
    dimensions: { width: 4.2, height: 2.8, depth: 3.6 },
    operator: { name: 'Diego Medeiros', badge: 'CNC-504', shift: '1º Turno (06h - 14h)' },
    currentOrder: {
      orderNumber: 'OP-CNC-904',
      productCode: 'SUP-SUSP-AERO',
      productName: 'Suporte Articulado de Suspensão de Alta Resistência Titânio Gr5',
      plannedQty: 250,
      producedQty: 215,
      scrapQty: 2,
      batchNumber: 'L26-CNC04',
      standardCycleTimeSec: 110.0
    },
    telemetry: {
      temperature: 45.2,
      vibration: 1.2,
      pressure: 38.0,
      motorCurrent: 26.0,
      cycleTimeSec: 108.5,
      piecesPerMinute: 0.55,
      voltage24VActive: true,
      esp32: {
        ip: '192.168.10.125',
        mac: 'C8:2E:18:4A:11:25',
        firmwareVersion: 'SFioT-v2.4.1-OPTO',
        rssi: -53,
        uptimeHours: 310.0,
        pulseCounterRaw: 217,
        optocouplerProtected: true,
        debounceThresholdMs: 30,
        lastPingMs: 19
      }
    },
    kpi: {
      oee: 93.0,
      availability: 96.0,
      performance: 97.4,
      quality: 99.4,
      gpm: 0.55,
      uptimeSeconds: 26500,
      downtimeSeconds: 950,
      scrapRate: 0.92
    },
    downtimeHistory: [],
    alerts: [],
    maintenance: {
      lastPreventiveDate: '22/09/2026',
      nextPreventiveDate: '22/11/2026',
      lubricationLevel: 92,
      toolWearPercent: 20
    }
  }
];
