# CRT V34.12I — TRUE 3C MSS M5/M15 propios (QA, NO LIVE)

Fecha: 2026-11-02. PR #74 DRAFT; no merge, no push, no entradas. Continuacion de V34.12I: no se editan H/B.

## Causa y cambio delimitado
La deteccion TRUE 3C de tres H4 cerradas (C1 interior C2, barrida C1 en C3, cierre dentro de C1) existia, pero no podia publicar sus propios MSS5/15: el monitor mostraba N/V por prevencion de contaminacion de Inside/2C.

Se anade `True3CMssCandidate` independiente. Al cerrar C2 completo se preregistra el C1 candidato y el intervalo de su proxima C3. Durante la C3 se congela en la primera M5 barrida unica un pivote M5 L2/R2 confirmado y, por separado, un pivote M15 L2/R2 confirmado. Se rechaza doble barrida y discontinuidad M5; no se sustituye un pivote faltante. MSS5 usa cierre M5 consecutivo que cruza el pivote DESPUES de la barrida; MSS15 usa cierre M15 de tres M5 cerradas y `prev15Continuous`, en la fase nativa correcta. Tras cierre de C3 se vincula evidencia a `c1Start`, `c3Start` y direccion de TRUE 3C. La geometria H4 es puerta independiente obligatoria; no basta un MSS.

Se usan los campos existentes `extraFamily...` (132 campos en `Signal`, mismos A/B, sin nuevos plots) para mostrar solo evidencia QA de TRUE 3C cuyo C1 coincide con `familyVisual`. Ante ausencia de pivote/cierre, mostrar N/V. El monitor conserva prioridad TRUE 3C sobre Inside/Multi-N cuando se solapan, sin prestarles su MSS.

## Limitaciones / gates
- **No hay compilacion real Pine Editor de este cambio.** No usarlo operativamente hasta captura de compilacion A/B y pruebas con datos M5 reales.
- Tests Node validan equivalencia estatica y secuencia determinista, no una traza TradingView.
- Confirmar en TradingView original y Trader Lab: C1/C2/C3, primera barrida, L2/R2, cierre M5, cierre M15, huecos, DST, doble barrida, mismo broker y ciclo; casos positivos/negativos.
- Multi4 MSS M5 independiente sigue pendiente; 33 OHLC originales sin atestar, BTC faltante, licencia y holdout bloqueados, FCM Android no certificado.
- **NO MERGE / NO LIVE / NO PUSH.**
