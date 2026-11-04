# AUDITORÍA MAESTRA — CRT RADAR PRO Chart universal (V34.12S)

**Corte:** 04-Nov-2026 · repositorio `mezas3238-hue/qore-deepseek-reviewer` · PR #74 DRAFT.
**Revisión:** estática del Pine fuente (3.443 líneas, ~216 KB), flujo M5/UDT, solicitudes, dibujado Daily/FVG/CRT, QA GitHub y contratos TradingView publicados.
**Gobernanza:** NO MERGE, NO PUSH, NO LIVE, no trading. La auditoría NO certifica visualmente TradingView ni atribuye una versión instalada al Owner solo por una captura.

## Decisión técnica — diagnóstico central

**Chart NO es universal.** El scanner de 34 mercados y el dibujo del activo abierto comparten identificación, disponibilidad y límite de historial. Para PDH/PDL la V34.12S mejoró la independencia, pero para FVG la dependencia de 34 sigue explícita, y CRT/MSS solo usa el `Signal` de uno de los 34. El requisito es DOBLE: radar fijo 34 para el monitor, Chart universal para `syminfo.tickerid` de cualquier activo/proveedor con OHLC disponible; sin atribuirle un modelo CRT cuando no haya evidencia suficiente.

## Hallazgos — prioridad y evidencia

| ID | Severidad | Hallazgo comprobado o riesgo | Fuente Pine V34.12S / evidencia | Impacto |
|---|---|---|---|---|
| A1 | P0 | **CRT/MSS bloqueados a 34 fuentes y mismo proveedor**. `integratedSlot` solo se asigna si `ticker.standard(symbol)==ticker.standard(syminfo.tickerid)` Y el `Signal` es válido. `chartAvailable = integratedSlot>=0`. | L2296-2329, L2457-2468, L3155-3175 | Activo externo o feed alterno: sin CRT/CRH/CRL/MSS aunque existan OHLC. No equivale a fallo de mercado. |
| A2 | P0 | **FVG bloqueado por allowlist del radar**, pese a solicitar H4 del ticker del chart. `fvgChartOK = chartStaticSlot >= 0`. | L2457-2460, L3105, L3179 | FVG no se dibuja en otro broker o activo fuera de 34, aun con H4 correcta. |
| A3 | P1 | **Ranking FVG y filtro incoherentes**: el selector ordena zonas según el último cierre H4 `close[1]`; luego las filtra con `close` actual y `1.5*ATR`, con `maxZones=1` por defecto. Una zona cercana al precio HOY puede quedar detrás de una lejana y no mostrarse nunca. | L3013-3101, L3183-3198, L112-113 | Desaparece FVG o selecciona el equivocado según el movimiento del precio. Reproducción sintética en test A3. |
| A4 | P1 | **No hay historial gráfico persistente completo de CRT:** `f_engine_snapshot()` solo emite `Signal` si `barstate.islast`, el scanner utiliza una única `request.security(symbol,"5", ..., calc_bars_count=600)`, `keepLastCRT` expira a 48 h; la tabla representa estado actual/snapshot. | L62-63, L2024-2025, L2270-2276, L2464, L3166-3175 | Al recargar/cambiar timeframe no se reconstruye un conjunto inmutable de eventos. Puede perderse el CRT o mostrarse solo el último. |
| A5 | P1 | **M5 inferior a H4 se muestrea**, no se exporta toda la secuencia a Chart: `request.security("5", f_engine_snapshot())` devuelve un resultado LTF agregado en el marco H4/M15 y tiene diferencia histórico/tiempo real. | L2464 y documentación oficial `request.security_lower_tf` | Reproducibilidad/anti-repaint de señales y dibujos NO está demostrada; requerir replay de eventos cerrados o ledger de M5, no solo un snapshot. |
| A6 | P1 | **Visualización por timeframe inconsistente:** CRT `visualChartAligned` solo M5, M15, H4; FVG acepta intradía <=H4; Daily PDH/PDL hasta H4 o 1D. | L3162, L3179, L3225 | Cambiar a 30m, 1h, 1D o W puede ocultar componentes distintos sin aviso uniforme. |
| A7 | P1 | **Regla de adyacencia FVG H4 por reloj absoluto `H4MS`**, no por barras adyacentes de mercado. | L3024-3027 | Falsos negativos entre sesiones reales no continuas (acciones, índices, fines de semana y horarios reducidos). Definir política de gaps por activo sin introducir falsas zonas. |
| A8 | P1 | **Sobrescritura de fuente radar BTC**: con cualquier gráfico denominado BTCUSD, el slot 8 cambia de `IC:BTCUSD` a `syminfo.tickerid`, aunque el alias de la tabla deriva del input original. | L2303, L2331-2343 | La identidad/proveedor del BTC vigilado depende de qué gráfico mira el usuario; dificulta comparar 34 feeds fijos y Chart universal. |
| A9 | P2 | **PDH/PDL en S están mejor separados**, con source `syminfo.tickerid` Daily `high[1]/low[1]`, estados de mecha independientes y panel inferior. Pero se restringe TF y se usa `dailyLiveHigh/Low` sin offset solo en la última barra; la primera hora TOMADO puede representar la barra, no el tick exacto. | L3219-3284, L3406-3440 | La captura anterior no prueba si el usuario ejecutaba la S; se requiere mostrar versión/source/Daily diagnostic. Un panel ausente no se explica con una cotización faltante por sí solo. |
| A10 | P2 | **Filtro FVG adicional por ATR**: ATR H4 confirmada puede ser `na` con poco historial; en ese caso la zona no se muestra sin diagnóstico. | L3022, L3183-3187 | Activos con pocos datos parecen no tener FVG aunque sí tengan 3 H4 confirmadas. |
| A11 | P2 | **Límite Free cerca del máximo**: 34 requests M5 + 2 Daily + 1 H4 = 37 contextos esperados de 40. Script ejecuta un motor M5 complejo por símbolo y colecciones históricas. | L2464, L3105, L3219, L3223 | Estar por debajo de 40 NO evita límites de memoria, CPU ni compiled tokens en Android/TradingView. Nunca añadir requests a ciegas. |
| A12 | P0 QA | **Los CI no compilan V34.12S con el Pine Editor.** Workflow Radar V34.10b invoca Node offline; Foundation ejecuta `node --test` (afirmaciones textuales) + Python offline. | `.github/workflows/crt-radar-v34-10b-qa.yml`, `.github/workflows/qore-crt-alerts-foundation.yml` | Todos verdes no garantizan que Chart compile, dibuje bien ni persista con feeds reales. |

## Contraejemplos observables de cobertura

| Gráfico que abre el usuario | ¿Pertenencia exacta a radar 34? | CRT actual | FVG actual | PDH/PDL S |
|---|---|---|---|---|
| `IC:EURCAD` | Sí | Elegible si `Signal` válido | Elegible si H4/ATR/relevancia | Daily nativo, si datos |
| `OANDA:EURCAD` | No | Bloqueado | Bloqueado | Daily nativo, si datos |
| `OANDA:EURGBP` | Sí | Elegible si `Signal` válido | Elegible si H4/ATR/relevancia | Daily nativo, si datos |
| `IC:EURGBP` | No | Bloqueado | Bloqueado | Daily nativo, si datos |
| `BINANCE:ETHUSDT`, `NASDAQ:AAPL` | No | Bloqueado | Bloqueado | Daily nativo, si datos |
| `COINBASE:BTCUSD` | Excepción: sustituye el slot BTC original | Candidato variable por proveedor | Dependiente de slot BTC forzado | Daily nativo, si datos |

Nota: esta matriz son **rutas lógicas del código**, NO verificación de que cada proveedor entregue feeds ni de que el modelo CRT de esos mercados esté certificado.

## Requisitos de diseño correctos (sin inventar señales)

### Separación absoluta de fuentes

1. `Radar34`: permanece con sus **34 mappings explícitos**, sin que cambiar de chart altere un símbolo vigilado (eliminar mutación BTC). Reportar 34/34 solicitudes, 0..34 fuentes válidas y contadores CRT por separado.
2. `ChartNative`: lee el activo ABIERTO exactamente mediante `syminfo.tickerid` y sus propios OHLC. **Ningún `chartStaticSlot` ni `integratedSlot` puede decidir si PDH, PDL o FVG se dibujan.** Soporta activos y proveedores no presentes en 34 cuando existen las series D y H4 necesarias.
3. `ChartCRT`: necesita un motor M5 de la fuente exacta del gráfico. Reutilizar la UDT del radar cuando sí coincide; para feed externo, una petición M5 propia SOLO si los límites/performance lo permiten. El modelo no se promueve a confirmado si no hay H4 completas o datos válidos. Esto debe probarse antes de sumar una potencial 38ª llamada al plan Free.
4. `ChartHistory`: ledger de eventos CRT/MSS **cerrados** por `symbol+feed+time+C1+family`, no simplemente `barstate.islast`/último snapshot con caducidad 48h. Al reiniciar TradingView se reconstruye desde historia disponible y se marca cada estado como `HISTÓRICO`, `VIGENTE` o `SIN DATOS`.

### Semántica de niveles y zonas

- `PDH = high` de 1D anterior CONFIRMADO, `PDL = low` de ese mismo Daily, siempre del ticker/proveedor abierto. Cada uno: INTACTO si la sesión actual no lo tocó, TOMADO cuando la mecha actual lo alcanzó, con validación de 1D sin adelantar high/low futuros. Mantener estado y diagnóstico visible incluso si los precios quedan fuera del zoom.
- `FVG H4`: zona de 3 H4 confirmadas y contiguas bajo política explícita por tipo de mercado. Estado INTACTO/PARCIAL/RELLENADO mediante toques posteriores. Recalcular TODAS las candidatas relevantes contra el precio actual y **después** seleccionar la más cercana sin relleno; no seleccionar la primera y luego descartarla por ATR dejando fuera la segunda.
- No usar `CRT válido` como llave para PDH/PDL/FVG. No usar el estado RTH de la UDT como nivel Daily visual.
- Marcar ausencia con motivos observables: `NO_H4_HISTORY`, `NO_DAILY`, `NO_NATIVE_FEED`, `INCOMPLETE_H4`, `FVG_FILLED`, `FVG_OUT_OF_RANGE`, `CRT_NOT_CERTIFIED`. No sustituir silencio por supuestos de señal.

### Indicador visible / cambios de versión

- Añadir marca compacta e inequívoca `CHART 12T | feed exacto | D:OK/H4:OK/M5:OK` mientras se certifica. En fotos actuales no consta de forma inequívoca qué código había instalado; no atribuir a S la ausencia de un panel si no se ve confirmación de versión.
- El dueño debe borrar instancias **viejas** y líneas manuales si quiere dejar un solo conjunto. Un script Pine no puede borrar objetos propios de otro script; hacer `line.delete` sobre sus referencias solo limpia los del mismo script.

## Matriz mínima de certificación Chart (a ejecutar en TradingView Android con imágenes/valores)

| Grupo | Muestras | Obligatorio |
|---|---|---|
| Misma pareja, dos proveedores | `IC:EURCAD`/`OANDA:EURCAD`, `OANDA:EURGBP`/`IC:EURGBP` | PDH/PDL/FVG del feed correcto en ambos; CRT solo con fuente válida identificada |
| Activos fuera de 34 | `BINANCE:ETHUSDT`, `NASDAQ:AAPL` si disponibles en cuenta | PDH/PDL/FVG basados en su propio gráfico; sin 'SIN SLOT' que apague zonas |
| Tipos de mercado | `IC:US30`, `IC:XAUUSD`, `IC:BTCUSD`, un Forex | Daily exacto, calendario de H4 según proveedor, no cambiar BTC al mirar otro gráfico |
| TF | M5, M15, M30, H1, H4, 1D | Política visible: si una característica no se soporta, informar por qué; ninguna desaparición silenciosa |
| PDH/PDL | 1D anterior y día actual que toma solo high o solo low | `PDH TOMADO / PDL INTACTO` y caso inverso; comparar OHLC D real |
| FVG | sin contacto, toque parcial, rellenado; dos zonas con ranking cruzado | cercanía a precio actual, eliminación solo si rellenada, sin lookahead |
| Persistencia | mismo gráfico → cambiar TF → otro símbolo → volver | reconstruir estados/labels/zonas desde velas cerradas; evitar falsos estados actuales |
| Alertas | sin feed, feed con gaps, C1 pendiente, C2 confirmada | NO PUSH, no false CRT; MSS M5/M15 causal e independiente |

## Evidencia automatizada de la auditoría

`qore-crt-alerts/test/chart-universal-root-cause-audit.test.mjs` implementa nueve pruebas **DE DEFECTO CONOCIDO**: reproducen los problemas del código actual, dos proveedores del mismo par, filtro FVG ranking/precio, horario de H4, memoria 48h/600 M5, timeframes incoherentes, BTC y requests Free. **Si CI dice PASS, significa que las causas se hallaron en el código, NO que estén corregidas.**

## Orden recomendado de corrección (sin tocar el motor certificado antes de separar los módulos)

**G1:** implementar Chart PDH/PDL/FVG universal sin allowlist, diagnóstico explícito; cotejar 1D/H4 en 6 activos y dos proveedores por par.
**G2:** corregir ranking FVG al precio ACTUAL, mitigación y sesiones H4, con pruebas de fronteras/no repaint.
**G3:** implementar fuente Chart M5 universal separada de `Radar34`, preservar límites Free, no copiar MSS entre feeds.
**G4:** ledger de eventos CRT/MSS cerrados y visualización histórica estable; prueba de reinstalación/reload, cerrar TradingView y volver.
**G5:** solo tras Pine Editor compile y paridad real, declarar Chart certificado; dejar radar, 7 familias y Android alertas en QA independiente hasta sus propias pruebas.

## Referencias oficiales

- TradingView `request.security` LTF y antirrepintado: https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/
- TradingView límites de requests y memoria: https://www.tradingview.com/pine-script-docs/writing/limitations/
- TradingView errores compilación: https://www.tradingview.com/pine-script-docs/errors/CE10117/
- TradingView barstate: https://www.tradingview.com/pine-script-docs/concepts/bar-states/
