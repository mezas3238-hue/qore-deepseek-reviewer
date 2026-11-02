# CRT RADAR PRO V34.11j — 33 instrumentos y fases M5 independientes 0…4 minutos

**2026-11-02 | DRAFT · QA experimental · NO LIVE · NO PUSH**

## Evidencia real del editor TradingView Android

Captura V34.11i `IC:NZDCAD` M15: `R:33/33`, `0C1:2`, `C1+:31`, `BLOQ:2`, `HIST:31`, `FX:28`, `MET:2`, `IND:3`. Después del ensayo +1m, NZDCAD muestra `48 M5` con desplazamientos de inicio y cierre `0/0`. Primera página, AUDJPY/GBPUSD/GBPJPY muestran `FX+1` y diagnósticos `3C HIST`; XAUUSD muestra **`MET+2`** con `MAL INI=32`, `MAL FIN=32`, `NO48=7`, `H4 BLOQ`. Esto justifica revisar **el tiempo M5 de cada feed**, no modificar el caso NZDCAD y copiarlo a todos.

No se puede concluir desde la primera página cuál es el segundo mercado con bloqueos (puede ser metal u otro, se deben inspeccionar las páginas 2…9). Tampoco se puede atribuir `H4 BLOQ` de XAUUSD exclusivamente a +2: puede haber pausas de sesión y 7 H4 con conteo distinto a 48.

## Implementación en GitHub

Nuevo archivo `crt-radar-pro/CRT_RADAR_PRO_V34_11J_FASE_NATIVA_33_QA_NO_LIVE.pine`, Git blob **`49504fdbde2ffc9424afbf107a80a5b8272a9b38`**.

1. Mantiene la elección del usuario `00/Memoria 34` con escaneo **34**, pero audita por separado 28 Forex, 2 metales, 3 índices y **BTCUSD slot 8 independiente**.
2. Opción QA `QA: fase M5 por feed 0..4m (SIN ALERTAS)` ON por defecto en este candidato: calcula **para cada símbolo** `minute(time[1],America/New_York)%5` solo con M5 CERRADA. Si tiene segundos distintos de cero, no aplica desplazamiento. No usa el mismo offset para todos los instrumentos.
3. Solo el flujo **no BTC** reconstruye el H4 desde el anclaje NY nominal más `phase*60000`; al mismo tiempo H1 parte de `hh:phase` y M15 de `:phase/:15+phase/:30+phase/:45+phase` del proveedor. Para fuente `+2`: `H4 01:02–05:02`, `M15 :02/:17/:32/:47`. Para fuente `+1`: `01:01–05:01`, `M15 :01/:16/:31/:46`. **Ninguna de ellas se declara automáticamente equivalente a la H4 NY normativa `01:00–05:00`.**
4. El MSS15 necesita **3 M5 cerradas consecutivas**, pivote confirmado, precedencia temporal de C2, cierre de ruptura M15 posterior a la barrida, y verificación del residuo `mssAt % 900000 == phase * 60000` en la misma fuente y ciclo. Un M5 no sustituye a un MSS15.
5. Se mantienen **48 M5 estrictas** por H4 (sin interpolar/prellenar), límites originales, control de huecos, H4 NY, invalidación y estados de siete categorías. Forex/metal/índice que no alcanza 48 NO pasa aunque su fase corresponda. BTCUSD continúa con anclaje, fase y lógica anteriores.
6. La tabla QA de los **33 no BTC** muestra por feed `FX+1`, `MET+2`, `IND+0`, `MAL INI`, `MAL FIN`, `NO48`, `C1+`, `BLOQ`. El panel compacto queda como antes. **Alertas y niveles operativos NO BTC bloqueados** mientras el modo QA esté activo, incluso si `useAlerts` se activase manualmente.
7. No se añaden `request.security`, `plot` ni tareas Android. Los **34 símbolos** y los **60 plot()** se conservan. La auditoría por evento compara únicamente el SHA exacto V34.11j, sin declarar una captura sintética como prueba real.

Pruebas automatizadas nuevas: `qore-crt-alerts/test/pine-v34-11j-33-native-phase-per-provider.test.mjs` (todos los residuos 0..4, +1 vs +2, 48 M5, 47/49 rechazadas, cierre M15 del proveedor, aislamiento BTC y veto de push). `src/crt-seven-category-event-parity.mjs` y su test con SHA exacto.

## Prueba decisiva en TradingView Android

1. Crear script QA V34.11j desde **todo el archivo** de GitHub; ocultar V34.11i para evitar mezclar paneles, preservarlo como respaldo.
2. En `00/Memoria` activar 34, en `03/Dashboard` activar `QA: auditar los 33 instrumentos sin BTC`, con `QA 33: mostrar causas H4` y `QA: fase M5 por feed 0..4m (SIN ALERTAS)`.
3. Fotografiar la primera página y última H4 para `IC:NZDCAD`; comparar con V34.11i y verificar que siga `# M5=48, Δ=0/0`.
4. Abrir `IC:XAUUSD` para analizar fase `MET+2`, número de M5 e inicio/final. Si las 32 H4 inicialmente bloqueadas pasan a coherentes, el problema era en parte la fase; **cualquier NO48 restante sigue bloqueado**, no inventar C1.
5. Recorrer páginas 2 a 9; identificar el segundo mercado que seguía `H4 BLOQ` sin asumir que es XAGUSD. Registrar 33 valores individuales.
6. Cotejar H4/M15 construidas por Pine con M5 reales de IC Markets y OANDA en Trader Lab, pivote MSS15 L2/R2 y CRT 2C/3C por evento y horario NY. Luego holdout/no-repaint y límites Pine reales antes de lanzar.

**Estado actual:** demostración estática/QA de reparación de fase nativa; sin compilación confirmada V34.11j, sin capturas 33/33 de esta versión, sin paridad de OHLC real ni certificación de siete categorías. PR DRAFT / NO MERGE / NO LIVE / NO PUSH.
