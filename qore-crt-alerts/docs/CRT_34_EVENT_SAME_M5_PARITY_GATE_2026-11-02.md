# CRT RADAR PRO — puerta de paridad por eventos 34/34 (QA, sin señales LIVE)

**02 Nov 2026 · Candidato Pine V34.10w inalterado · PR #72 DRAFT.**

## Qué se agregó
- `src/crt-34-pine-event-parity-gate.mjs`: compara eventos H4 del laboratorio con una **captura de ejecución Pine independiente** por cada uno de los 34 símbolos.
- Exige 34 slots únicos, identidad exacta de **proveedor + instrumento**, OHLC de las últimas **hasta 1500 M5 cerradas**, SHA-256 de velas, primer/último timestamp, `asOf`, versión Pine fija y prueba de procedencia de la captura.
- Compara eventos individuales por **modelo, dirección, apertura C1 y ratificación**, no suma recuentos históricos que pueden pertenecer a ventanas diferentes.
- Rechaza explícitamente capturas ausentes, fuente distinta, sello incompleto, familia no admitida, eventos duplicados, falsos positivos y eventos perdidos.
- El modo de prueba que fabrica `TRADINGVIEW_PINE_V6_CAPTURE` es una **fixture sintética de contrato**, no un registro verdadero del editor y **jamás certifica 34 mercados**.

## Qué NO se debe inferir
- El estudio original de calibración de 47 días no equivale a las últimas 1500 M5. En EURCHF se observaron 16 eventos 2C históricos sobre 9539 M5, frente a 3 sobre las últimas 1500 M5 del mismo archivo. Son eventos de prescreen, **NO ejecución de `f_engine()`**.
- Los modelos `CRT_2C_RETURN`, `CRT_3C_REVERSAL`, `CRT_INSIDE_BAR` y `CRT_MULTICANDLE` son una taxonomía estructural de QA. No se certifican siete detectores operativos. Variantes no aprobadas siguen fuera de LIVE.
- Un resultado `H4_34_MATCH_BUT_UNCERTIFIED` significa solamente que coinciden los identificadores estructurales **de las dos entradas entregadas**, no que Pine realmente haya compilado, publicado esos eventos, ni demostrado MSS M15 causal.
- Los 34 feeds provenientes de fuentes cTrader/Coinbase deben homologarse con TradingView por **símbolo, proveedor y OHLC**. Una coincidencia de ticker no basta. BTCUSD Coinbase spot no es automáticamente comparable con CFD.
- Esto NO modifica Pine, ni las alertas, ni los filtros CRT. No habilita FCM, rutas de emisión, operaciones ni merge.

## Próximo protocolo de certificación
1. Congelar el commit exacto y SHA blob de `CRT_RADAR_PRO_V34_10W_C1_RAZONES_34_QA_NO_INTEGRADO.pine`; obtener confirmación de compilación real Pine v6 en editor.
2. Para cada uno de 34 símbolos: capturar **mismas velas M5 cerradas** y marcar proveedor, symbol-ID, hash OHLC, inicio y fin, `asOf`. No equiparar `NAS100` a `OANDA:NAS100USD` por nombre.
3. Extraer de Pine un registro verificable por evento `modelo/dirección/C1/ratificación`; acompañar evidencia runtime verificable. Alimentar el gate; clasificar `MATCH`, `MISMATCH`, `BLOCKED` sin ajustar reglas para coincidir.
4. Implementar y ejecutar **una segunda comparación MSS M15 causal**: pivote L2/R2 confirmado ANTES del sweep, primer cierre de ruptura después, separación M5/M15, mismo símbolo/proveedor/ciclo. Eventos H4 coincidentes con MSS15 pendiente deben permanecer **no accionables**.
5. Auditar historia y lookback 1500, gaps, DST NY, FVG H1/H4, PDH/PDL, retest e invalidación C3; reproducir sobre histórico no visto y comprobar no-repaint en TradingView.
6. Solo luego validar Android en STAGING: registro de dispositivo autenticado, opt-in, consentimiento, deduplicación de evento, reintentos controlados, recepción FCM y prueba E2E. Ningún push real en esta rama.

## Ejecución local (offline)

```bash
cd qore-crt-alerts
npm test
node --test test/crt-34-pine-event-parity-gate.test.mjs
```

**Criterio de entrega:** evidencias reales, no fixtures, 34/34 por proveedor+OHLC, cero diferencias sin explicación, MSS15 confirmado independientemente, compilación TV y Android E2E. Hasta entonces: **NO LIVE / NO MERGE / ALERTS OFF / SIN ÓRDENES**.
