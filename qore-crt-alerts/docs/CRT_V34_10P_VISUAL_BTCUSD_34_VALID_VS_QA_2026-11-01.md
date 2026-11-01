# V34.10p — evidencia visual BTCUSD y separación estricta de CRT vigente y QA

Fecha: 2026-11-01. PR DRAFT. BASE: V34.10o del PR #61, sin reemplazar 10i/k/l/m/n/o.

## Captura del propietario
COINBASE:BTCUSD, 1H, indicador V34.10o, cuadro:
- `ESPERA CRT`, `SIN OTROS CRT`, `34 SCAN QA CRT/QA:0`, `RESP:34 SD:0`.
- `BTC CRT QA C1:13 C2 OK:2 CRT C2 RATIFICADO NY:17 M15 REQUERIDO`.
- `OTROS CRT QA INSIDE RETURN / SOLO DIAGNOSTICO / MULTI4 ESP / SIN MSS15`.
- `BTC H4 NY 01/11 17:00 M5:19`.
Conclusión: respuesta de escáner no certifica 34 feeds reales ni la detección de todas las familias; se observa H4 actual incompleta (19/48 M5 en BTC), ningún evento actual ratificado. `C2 OK:2` es acumulado histórico, `qaLastC2Gate` último resultado guardado, por tanto `CRT C2 RATIFICADO` junto a `ESPERA CRT` NO contradice al motor: es una etiqueta temporal engañosa.

## Contrato del propietario
"Yo no quiero que me muestre los 34 instrumentos, sólo quiero que me muestre cuando haya un CRT válido." No promocionar Inside/Multi4 QA a lista por defecto, ni transformar datos provisionales o históricos en CRT activo. El escáner analiza 34, pero lista únicamente CRT ratificados actuales. Las otras familias deberán obtener ratificación propia antes de entrar en `Solo CRT` como válidas.

## Cambio aislado
- VISTA por defecto `Solo CRT`: solo `scanCrtValid` (CRT principal H4 ratificado/vigente), sin QA.
- `Solo CRT + QA`: prueba manual de tres detecciones, con Inside/Multi4 explícitamente QA.
- `Todos los instrumentos`: solo auditoría manual de fuentes.
- La primera fila del ticker del gráfico sigue estando disponible, pero `ESPERA CRT` cuando no existe CRT principal vigente y el modo por defecto excluye QA.
- `CRT:n` (solo core), `QA:n` (auxiliares sin duplicar core), `RESP:n SD:n` (respuestas; no homologación).
- La fila `BTC HIST QA` muestra `ULT C2 OK (HIST)` cuando se conserva la evaluación ratificada de un ciclo anterior pero el CRT principal actual no está vigente. El histórico C1/C2 es acumulado de M5 analizadas, no señales actuales.
- La fila de Inside marca `INSIDE HIST` si se detectó en memoria pero no está activo el auxiliar seleccionado; `INSIDE QA ACT` solo si `extraFamilyValid` y `extraFamilyKind == INSIDE QA`.
- No se modifica `f_engine()`, ninguna `request.security` adicional, ningún MSS, FVG, PDH/PDL o timestamp.
- Todas las alertas actuales `useAlerts=false` por defecto. Sin envío Android ni LIVE.

## Pruebas
- Node estático `test/pine-v34-10p-valid-vs-qa-view.test.mjs`.
- Compilación Pine v6 real de V34.10p **pendiente**: probar en TradingView Android, preferible sobre M5/M15/H1 BTCUSD y un símbolo Forex del mismo proveedor.
- Esperado en la captura similar: `ESPERA CRT` + `BTC HIST QA` + `ULT C2 OK (HIST)` + `CRT:0 QA:0` (si ningún candidato QA actual), y no declarar falla en ausencia de CRT.
- Si un patrón QA activo, será contabilizado en `QA:n` pero no aparecerá en la lista `Solo CRT`. Sólo visible en `Solo CRT + QA`, sin MSS heredados.

## Trabajo funcional todavía pendiente
- Completar las cuatro morfologías documentadas y todas las variantes aprobadas en Pine con sus respectivos ciclos, MSS M15 independientes, consolidación Multi-N y expiración.
- Interpretación exacta de "siete familias" según dossier visual: el catálogo legado mezclaba cuatro morfologías, fases, invalidaciones y confirmación de entrada. No llamar 7/7 estructurales hasta contar con fuentes y reglas para cada una.
- Paridad M5 Pine/backend y continuidad de los 34 feeds, ausencia de repintado, compilación real de Pine, pruebas FCM Android E2E.
