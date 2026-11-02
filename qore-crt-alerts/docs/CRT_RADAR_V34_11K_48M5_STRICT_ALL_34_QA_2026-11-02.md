# CRT RADAR PRO V34.11k — H4 realmente completa para C1/C2/C3 e Inside en 34 feeds

**2026-11-02 · QA DRAFT / NO MERGE / NO LIVE / NO PUSH**

## Evidencia de la última captura TradingView V34.11j

En NZDCAD M15 con panel `QA FASE` por 33 fuentes **no BTC**:
`R:33/33`, `0C1:0`, `C1+:33`, `BLOQ:0`, `HIST:33`, `FX:28`, `MET:2`, `IND:3`, `H4:1028`, `PARC:189`, `INT:15`. Última H4 de `IC:NZDCAD` = `48 M5 / inicio Δm 0 / fin Δm 0`. La primera página muestra `AUDJPY FX+1`, `GBPUSD FX+1`, `GBPJPY FX+1`, `XAUUSD MET+2`, todos con `3C HIST`; XAUUSD todavía tiene `MAL INI 6, MAL FIN 5, NO 48 7` (se rechazan esas H4).

**Interpretación exacta:** 33/33 tuvieron al menos una **C1 aceptada por el código V34.11j** y alguna categoría histórica dentro de las últimas 1.500 M5 de cada fuente; NO significa que 33 eventos coincidan con H4 NY 00, que tengan MSS15 causal independiente, que estén operables ni que las 7 categorías estén certificadas.

## Hallazgo arquitectónico adicional confirmado en GitHub

V34.11j ya computaba un criterio exigente:
`fullH4 = h4Continuous && h4Count == 48 && h4FirstT == h4Bucket && h4LastEnd == h4Bucket+4h`.

PERO las puertas soberanas del motor **no utilizaban fullH4 consistentemente**:
- C1 aceptaba Forex/metales/índices con `h4Count >= minBarsC1` (ajuste predeterminado **25**, no 48).
- C2 ratificada aceptaba `h4Count >= minBarsC2` (predeterminado **25**).
- C3 de cierre, Inside ratificado y envejecimiento Inside también usaban el mínimo parcial.
- BTCUSD ya usaba 48/48 para C1/C2/C3, así que este cambio conserva esa condición. Las familias Multi4/Multi-N/FVG H4 ya usaban `fullH4`.

Por tanto el aparente éxito `C1+:33, HIST:33` **podía incluir eventos calculados sobre H4 parciales**. No se debe certificar ni extrapolar esas cifras. Identificar este defecto no significa que todos los 33 sean falsos: los que proceden de 48 M5 estrictas podrían permanecer.

## Corrección aplicada sin debilitar reconocimiento BTC

`crt-radar-pro/CRT_RADAR_PRO_V34_11K_CRT_48M5_H4_CERRADA_QA_NO_LIVE.pine`, **blob exacto SHA `93c337d0ee64617bf20211d35d175536d98524bf`**.

- C1 `c1CompleteData = fullH4`.
- C2 `validC2Data = fullH4`.
- C3 `validC3Close = fullH4`; C3 con datos incompletos no queda provisionalmente ratificada como si fuera cierre correcto. El contador anterior de C3 inválidas puede incluir ahora fallos de datos además de precio (identificar por prueba).
- Inside retorno `closedH4Complete = fullH4`, caducidad `insideH4Closed = fullH4`.
- Eliminados los inputs `minBarsC1/minBarsC2` que permitían 5–48 y venían en 25. No permitir que configuraciones previas reintroduzcan C1/C2 parciales.
- Se preservan H4 NY por feed de fase 0..4, **BTCUSD aislado**, M15 confirmado con pivote propio L2/R2, condición barrida C2 previa, la estricta barrida/retorno, 34 solicitudes M5, 60 plots, dashboard compacto y 33 paginados. Modo fase proveedor es **solo QA**, sin señales operativas ni alertas FCM.
- La regresión `qore-crt-alerts/test/pine-v34-11k-48-closed-m5-h4-34-markets.test.mjs` verifica estáticamente las cinco puertas y simula bloques 0..4 con 47/48/49 M5, huecos y anclas desajustadas. `src/crt-seven-category-event-parity.mjs` exige archivo SHA exacto y siempre `UNCERTIFIED`.

## Cómo comprobarlo desde Android

1. Conservar V34.11j de respaldo. Crear V34.11k desde el archivo completo de GitHub, confirmando primero **que compile sin errores** en Pine v6.
2. Abrir `IC:NZDCAD` en M15 y ajustar `00/Memoria:34`, `03/Dashboard → QA: auditar los 33 instrumentos sin BTC`, `QA 33: mostrar causas H4`, `QA: fase M5 por feed 0..4m (SIN ALERTAS)`.
3. Comparar contra V34.11j: `R:33/33`, `0C1:0`, `C1+:33`, `BLOQ:0`, `HIST:33`, `H4:1028`, `PARC:189`, `INT:15`. **Si C1+ o HIST bajan al exigir 48, no relajar el filtro para hacer subir el número.** Revisar únicamente el bloqueo por feed.
4. Confirmar NZDCAD `48/0/0`; para XAUUSD `MET+2` verificar que `NO48 7` y todos los bloques incompletos sean descartados al clasificar C1/C2/3C.
5. Revisar las 9 páginas del escáner para los otros 32 no BTC; mantener BTCUSD en línea separada sin contaminar sus cifras.
6. Aislar un caso concreto de CRT 3C/2C y MSS15 y registrar **fuente IC/OANDA, M5 cerradas, fase observada, C1 NY, C2 barrida estricta, cierre C2 dentro del rango, pivote M15 L2/R2 anterior, cierre MSS15 posterior, C3**. Cotejar con Trader Lab misma OHLC y mismas ventanas temporales y posteriormente un holdout reservado. El tiempo H4 desplazado +1/+2 aún no está ratificado como la hora del modelo CRT de referencia.

**Importante:** nueva versión QA no ha sido todavía compilada/ejecutada en TradingView real ni ha certificado 33/33 detecciones. CI offline no demuestra feed parity, no-repaint, 7 familias validadas ni FCM E2E. NO MERGE, NO LIVE, NO PUSH.
