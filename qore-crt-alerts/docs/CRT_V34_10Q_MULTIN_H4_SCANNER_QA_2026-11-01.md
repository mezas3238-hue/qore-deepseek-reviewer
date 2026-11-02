# V34.10q — detector Multi-N H4 QA integrado en escáner Pine de 34 símbolos
Fecha: 2026-11-01 | Pine NO INTEGRADO | PR DRAFT | NO LIVE

## Evidencia que origina el trabajo
El propietario adjuntó captura de V34.10p en COINBASE:BTCUSD H4:
- `ESPERA CRT`, `SIN CRT VIGENTE`, `CRT:0 QA:0`, `RESP:34 SD:0`.
- `BTC HIST QA C1:13 C2 OK:2 ULT C2 OK (HIST)` (corrección visual validada).
- `INSIDE HIST`, `MULTI4 ESP`, `M5:26` a las 17 NY: H4 reconstruida todavía incompleta.
- `H4 BROKER != NY` significa que H4 de Coinbase no comparte apertura con el motor Nueva York, no prueba de invalidación.
- 34 respuestas no equivalen a 34 instrumentos homologados ni garantía de que haya un CRT en ese instante.

## Cambio funcional nuevo
En V34.10o existía MULTI4 de manipulación distribuida en exactamente cuatro H4 completas; la respuesta DeepSeek describe **otro** Multi-Candle, constituido por C1 H4, un número N de H4 interiores sucesivas, y una vela final de barrida y retorno.

El nuevo **V34.10q** añade ese segundo detector a `f_engine()` de Pine, no al dashboard solamente:
- Memoria fija `qaMultiNHistory` de siete H4 completas, reconstruidas exclusivamente de M5 cerradas del mismo proveedor.
- N configurable en algoritmo entre **2 y 5 H4 interiores** (actualmente rango QA fijado, futuro input cuando la definición visual esté certificada).
- Cada H4 interior tiene `high < C1.high` y `low > C1.low` (interior estricto, sin igualdad); los H4 son consecutivos `prev.endAt == next.startAt`.
- C1 debe ser válida en la política horaria NY seleccionada (3 inicios canónicos o todas las H4, según configuración previa).
- La vela terminal debe barrer **estrictamente un solo extremo de C1**, no ambos, y cerrar `C1.low <= close <= C1.high`. Se clasifica BUY o SELL según dirección de barrida.
- No ratificar en M5 intra-H4; la decisión se toma en el evento `nextH4` cuando acaba de cerrar la H4 terminal completa.
- Caduca si pasa una H4; ante huecos o barras M5 faltantes, se limpia el buffer.
- Un evento se etiqueta como `MULTI-N QA` y queda separado del `MULTI4 QA` distribuido. No se permite heredarlo como `MSS M5/M15` del CRT principal.
- No se añaden llamadas request.security ni arrays sin límite. La memoria del nuevo módulo tiene siete elementos por contexto.
- La vista normal `Solo CRT` sigue mostrando **únicamente CRT principales ratificados y vigentes**; las nuevas observaciones QA pueden inspeccionarse con `Solo CRT + QA` y la fila `OTROS CRT QA`.
- Mantener alerts OFF, sin FCM, órdenes, LIVE ni merge.

## Validación automática y limitaciones
Suite `qore-crt-alerts/test/pine-v34-10q-multin-model.test.mjs`:
- Fixtures Multi-N alcistas N=2,3,4,5, bajista N=3 y negativos por doble sweep, cierre fuera, igualdad inside, hueco, proveedor ajeno.
- Inspección estática de la implementación Pine y ausencia de cambios en el motor principal C2/C3, MSS, requests y alertas.
- Los fixtures ejecutan el motor espejo JS con OHLC **sintéticos**, no el compilador Pine ni un feed real.
- **La taxonomía de 7 categorías heredadas sigue sin equivaler a 7 familias estructurales distintas**. El modelo Multi-N queda QA porque la versión Rowdy FX exacta, especialmente rango de N, requiere ratificación.
- Pendiente integrar confirmaciones MSS M15 causales propias por candidato Multi-N e Inside, y casos de múltiples candidatos simultáneos; no afirmar "7/7 listo".

## Prueba TradingView Android
1. Mantener respaldo V34.10p que ya compiló y dibuja correctamente BTCUSD H4.
2. En un INDICADOR NUEVO, pegar `CRT_RADAR_PRO_V34_10Q_MULTIN_H4_QA_ANDROID_COPIAR.txt` completo.
3. Utilizar gráfico `COINBASE:BTCUSD` M5 y M15 para observar el mismo proveedor. `34 instrumentos (experimental)`, `Solo CRT` como vista normal, alertas desactivadas.
4. En los ajustes, elegir temporalmente `Solo CRT + QA` únicamente para inspeccionar una formación Multi-N en vela completa. No esperar que aparezca cuando no hay patrón.
5. Comprobar que con un Multi-N de C1 + N interiores + cierre de barrida terminal aparezca `MN QA BULL/BEAR`, y que MSS M5/M15 permanezcan en guion si no existe un CRT principal con confirmaciones propias.
6. Comprobar no-regresión del CRT clásico, Inside, Multi4, PDH/PDL, FVG H1/H4, retina H4-USD y dashboard 34.
7. Volver a `Solo CRT` después de la prueba.

## Cierre pendiente
No se considera terminado hasta compilación Pine v6 real, fixtures instrumentados con OHLC real del mismo proveedor, certificación de N y estados de vida, equivalencia causal JS↔Pine para los 34 símbolos, MSS por familia y pruebas push Android E2E.
