# 📡 Telemetria e IoT — SWT Industrial Digital Twin

Este documento define o modelo de dados de telemetria industrial, o protocolo de comunicação com nós microcontroladores ESP32 e a metodologia de cálculo de KPIs (OEE, GPM e Disponibilidade).

---

## 📊 Modelo de Dados de Telemetria (`MachineTelemetry`)

Cada máquina conectada transmite telemetria em tempo real estruturada na seguinte interface TypeScript:

```typescript
interface MachineTelemetry {
  temperature: number;          // Temperatura do cabeçote/óleo em °C (Normal: 35-45°C)
  vibration: number;            // Vibração global RMS em mm/s (Alerta: > 1.8 mm/s)
  pressure: number;             // Pressão de linha hidráulica/pneumática em bar (Normal: 6.0-6.5 bar)
  motorCurrent: number;         // Corrente elétrica do motor principal em Amperes (A)
  cycleTimeSec: number;         // Tempo real do último ciclo em segundos
  piecesPerMinute: number;      // Golpes ou peças produzidas por minuto (GPM)
  voltage24VActive: boolean;    // Barramento de segurança 24V DC ativo
  esp32: ESP32NodeStatus;       // Diagnóstico do nó microcontrolador IoT
}

interface ESP32NodeStatus {
  ip: string;                   // Endereço IP na VLAN industrial (ex: 192.168.10.101)
  mac: string;                  // MAC Address de hardware
  firmwareVersion: string;      // Versão do firmware (ex: SFioT-v2.4.1-OPTO)
  rssi: number;                 // Potência do sinal Wi-Fi em dBm (Ideal: > -65 dBm)
  uptimeHours: number;          // Horas contínuas de operação sem reinicialização
  pulseCounterRaw: number;      // Contador acumulado bruto de pulsos ópticos
  optocouplerProtected: boolean;// Barreira de isolamento galvânico ativa
  debounceThresholdMs: number;  // Filtro de debounce contra ruído elétrico (ms)
  lastPingMs: number;           // Latência de comunicação em milissegundos
}
```

---

## 📈 Fórmulas de Cálculo de OEE (Overall Equipment Effectiveness)

O OEE é calculado segundo a norma internacional industrial com três fatores fundamentais:

$$\text{OEE} = \text{Disponibilidade} \times \text{Performance} \times \text{Qualidade}$$

1. **Disponibilidade ($A$)**:
   $$A = \frac{\text{Tempo Operacional}}{\text{Tempo Planejado}} = \frac{T_{\text{planejado}} - T_{\text{paradas}}}{T_{\text{planejado}}}$$

2. **Performance ($P$)**:
   $$P = \frac{\text{Tempo de Ciclo Padrão} \times \text{Total de Peças Produzidas}}{\text{Tempo Operacional}}$$

3. **Qualidade ($Q$)**:
   $$Q = \frac{\text{Peças Boas}}{\text{Total de Peças Produzidas}} = \frac{\text{Produção Total} - \text{Refugo}}{\text{Produção Total}}$$

---

## 🛡️ Camada de Segurança e Isolamento Galvânico

- **Módulos ESP32 com Optoacopladores**: Todas as entradas digitais de contagem de peças e fins de curso de prensas/conformadoras são desacopladas opticamente para suportar transientes de até 2500V RMS.
- **Filtro Debounce Hardware/Firmware**: 15ms de debounce programável para eliminar falsos disparos causados por arcos elétricos e vibração mecânica das matrizes.
