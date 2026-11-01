# CRT RADAR PRO V34.10o — Escaneo 34 con modelos Inside/MULTI4 QA
Fecha: 2026-11-01 | CANDIDATO NO INTEGRADO | PR #61 DRAFT / SIN MERGE / SIN LIVE

## Objetivo
Mantener `Vista: Solo CRT` y monitorear 34 instrumentos sin mostrar 34 filas vacías. Frente a la versión V34.10n, agregar en el escaneo visual las morfologías que ya disponían de detector en `f_engine` pero no llegaban al filtro del panel. **Esto NO son siete modelos independientes certificados.**

## Qué cambia
1. `Signal` extiende cinco campos QA (`extraFamilyKind`, `extraFamilyValid`, `extraFamilyC1`, `extraFamilyDirection`, `extraFamilyRatifiedAt`), devueltos como una sola UDT por símbolo; se conservan las mismas solicitudes `request.security`.
2. INSIDE QA: recorrer `insideCandidates` y usar el RATIFIED más reciente cuyo sweep fue único, su estructura se validó con H4 cerrada, y el evento tiene menos de una H4 de antigüedad. Un candidato SEEKING posterior no borra un RATIFIED vigente.
3. MULTI4 QA: conservar el detector heredado de manipulación distribuida entre cuatro H4 completas del mismo proveedor, almacenar C1 y caducar al cabo de una H4. **NO** sustituye la hipótesis distinta de consolidación durante N H4 y barrida terminal, que sigue en pruebas offline.
4. Si el CRT principal no está vigente pero hay Inside/MULTI4 QA, el dashboard marca `INS QA BULL/BEAR QA` o `M4 QA BULL/BEAR QA`, siempre señalando QA.
5. En el escaneo de otros símbolos la fila identifica `IN QA` o `M4 QA` con dirección; **nunca muestra ✓ MSS M5/M15 para la familia QA**, porque esos MSS pertenecen al CRT principal hasta demostrar enlace propio por C1, sweep y pivote.
6. Contador `CRT/QA:n` suma CRT principal y candidatos H4 QA diferenciados. No implica `n` entradas confirmadas.
7. Las alertas existentes permanecen condicionadas EXCLUSIVAMENTE al `scanCrtValid` principal y `useAlerts=false` por defecto. FCM desactivado.
8. Modelo principal 2C/3C, MSS independientes, PDH/PDL y FVG H1/H4 se dejan intactos.

## Límites e incertidumbres
- DeepSeek no pudo leer V34.10n. La auditoría real detectó que el código ya tenía 3C, Inside y Multi4.
- Hay cuatro morfologías documentadas y siete categorías de catálogo, **no siete modelos estructurales certificados**.
- Inside estricto del Pine exige cierre dentro de la C2 Inside; DeepSeek sugería dentro de C1. Queda como ambigüedad, no relajar criterio sin comparar imágenes/OHLC.
- Multi4 actual = barrida distribuida (dos H4), Multi-candle propuesto por DeepSeek = consolidación + barrida final; ambos quedan bajo hipótesis distintas.
- El detector QA Multi4 requiere cuatro H4 de 48 velas M5 consecutivas; esto puede excluir mercados con sesiones parciales. No interpretar `RESP:34` como certificación de 34 feeds.
- V34.10o todavía requiere compilación real Pine v6 y pruebas M5/M15/H4 en TradingView Android.
- Los QA Inside/Multi carecen de un MSS M15 vinculable de forma segura. No convertirlos en señal de entrada ni notificación.
- El propio esquema Pine del gráfico solicita además M5 y D; estimado de 35–36 datasets únicos según ticker del gráfico, bajo máximo general de 40 (64 Ultimate) pero NO implica que memoria/tiempo de cómputo sean aceptables.
- No auditar tasas de éxito ni generar órdenes.

## Procedimiento QA Android
1. Conservar V34.10i/k/l/m/n; crear indicador nuevo pegando el **TXT COMPLETO V34.10o**, no reemplazar el que funciona.
2. `COINBASE:BTCUSD` M5, `34 instrumentos (experimental)`, `Vista: Solo CRT`, alertas sin marcar.
3. Buscar filas `BULLISH/BEARISH` (CRT principal), `IN QA BULL/BEAR` o `M4 QA BULL/BEAR`. Si no se detecta un patrón, no debe aparecer ninguna fila extra; `RESP:34` significa solo respuesta.
4. Asegurar que nunca haya ✓ M15 para Inside/Multi sin evidencia causal independiente. Comparar CRT y MSS principal con V34.10n en M5, M15 y H4.
5. Para validar un modelo QA, obtener OHLC H4 cerradas del mismo proveedor, timestamps y dirección; para INSIDE, C2 estrictamente interior y cierre de vela de manipulación dentro de C2; para Multi4, secuencia de cuatro H4 completa; rechazar dobles barridas y gaps.
6. Comprobar temperatura/rendimiento del teléfono, límites Pine y presencia de errores de tiempo/compilación; reportar capturas.
7. NO activar alertas, LIVE ni subir versión de producción hasta certificar paridad con backend y E2E Android.

## Fuentes de pruebas
- `qore-crt-alerts/src/crt-structural-morphologies.mjs` tiene prototipos offline para cuatro morfologías, incluyendo hipótesis DeepSeek de consolidación Multi-N.
- `qore-crt-alerts/test/crt-structural-morphologies.test.mjs` valida reglas OHLC y datos.
- `qore-crt-alerts/test/pine-v34-10o-multifamily-34-scan.test.mjs` verifica estáticamente el escáner, no el compilador Pine.
- `qore-crt-alerts/docs/DEEPSEEK_REVIEW_V34_10N_EVIDENCE_RECONCILIATION_2026-11-01.md` detalla contradicciones resueltas y abiertas.

## Gate de salida
Sin cierre certificado hasta: compilar Pine v6; validar cada familia contra OHLC reales de un mismo proveedor; contrastar con backend con eventId inmutable; validar 34 a la vez (sin timeouts ni omisiones); y notificación Android E2E con consentimiento y autenticación.
