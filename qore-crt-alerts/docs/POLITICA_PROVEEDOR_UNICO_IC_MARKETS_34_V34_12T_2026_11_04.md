# Política soberana: IC Markets como única fuente — 34 feeds fijos

**Corte:** 04-Nov-2026 · PR #74 DRAFT · NO LIVE, NO PUSH, NO MERGE.

## Orden del Owner

> Todos los activos tienen que estar por defecto a IC Markets, no quiero más que se cambien.

**Interpretación técnica aplicada:** no solo preferencias configurables: el inventario de **34 feeds** del radar queda fijado en código a símbolos TradingView con prefijo `IC:`. No se aceptan auto-sustituciones por OANDA, COINBASE ni por el símbolo abierto del gráfico. Cambiar el origen requiere una versión explícita autorizada del código, no un efecto secundario de navegar en TradingView.

## Cambios efectivos

**Nueva versión independiente, sin modificar S:** `crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12T_IC_MARKETS_34_FIJOS_QA_NO_LIVE.pine`.

- Los 34 `s01..s34` ya son cadenas constantes, **no** `input.symbol`; por tanto los usuarios no pueden reemplazar su proveedor desde Ajustes. `scanSymbols` usa esos 34 valores constantes.
- Se sustituyen los cinco feeds OANDA anteriores: `OANDA:NAS100USD` → `IC:USTEC` (alias dashboard NDX100), `OANDA:EURCHF` → `IC:EURCHF`, `OANDA:EURGBP` → `IC:EURGBP`, `OANDA:EURNZD` → `IC:EURNZD`, `OANDA:GBPCHF` → `IC:GBPCHF`.
- Se conserva **`IC:US500`** para el alias SPX500; no inventar `IC:SPX500` a partir del nombre del alias.
- Se elimina por completo el código que reemplazaba el slot BTCUSD por `syminfo.tickerid` al abrir COINBASE:BTCUSD u otro proveedor; radar BTC siempre será `IC:BTCUSD`.
- Se agregó `USTEC` a la detección de familia de índices, de forma que las H4 de Nasdaq usen el ancla de índices y no el reloj Forex. El cálculo `f_engine()` del CRT/MSS se conserva **idéntico**.
- El registro compartido `qore-crt-alerts/src/instruments.mjs` también queda con los mismos 34 símbolos IC, valores y slots congelados.

## Comportamiento Chart y limitaciones reales

- TradingView identifica la fuente IC Markets en esos gráficos con `IC:` (p.ej. `IC:US30` y `IC:USTEC`). La aplicación Pine **no puede cambiar automáticamente el símbolo ni el broker del gráfico abierto**. Si el Owner entra en un chart OANDA/COINBASE, aparece `FUENTE NO IC · CAMBIA GRAFICO`; no se dibujan niveles/CRT de otro proveedor sobre sus velas.
- Para un chart IC Markets, Daily PDH/PDL procede del `syminfo.tickerid` de IC; FVG del `240` nativo de IC. El FVG H4 deja de depender de estar listado entre los 34: funciona para otros símbolos IC donde existan series H4 compatibles.
- **CRT/MSS para un activo IC ajeno a los 34 no está implementado todavía.** Sigue usando los snapshots M5 del radar de 34 y exige coincidencia exacta con un slot. No simular CRT ni MSS si no existe M5 causal.
- Un símbolo con prefijo IC aún puede carecer de OHLC/permiso/mercado activo; en esos casos el radar debe indicar fuente no disponible y no reemplazar silenciosamente el broker por otro.
- Esta versión no corrige todavía los problemas anteriores de memoria de eventos, ranking FVG en el precio actual ni la validación de PDH/PDL visual en todos los feeds. Evitar presentar esto como Chart universal certificado.

## Inventario soberano de 34

| Slots | Fuentes exactas IC Markets |
|---|---|
| 01–08 | `IC:AUDJPY`, `IC:GBPUSD`, `IC:GBPJPY`, `IC:XAUUSD`, `IC:USTEC` (NDX100), `IC:US500` (SPX500), `IC:US30`, `IC:BTCUSD` |
| 09–16 | `IC:AUDUSD`, `IC:USDCAD`, `IC:USDJPY`, `IC:EURUSD`, `IC:USDCHF`, `IC:NZDUSD`, `IC:NZDJPY`, `IC:NZDCHF` |
| 17–24 | `IC:XAGUSD`, `IC:AUDCAD`, `IC:AUDCHF`, `IC:AUDNZD`, `IC:CADCHF`, `IC:CADJPY`, `IC:CHFJPY`, `IC:EURAUD` |
| 25–34 | `IC:EURCAD`, `IC:EURCHF`, `IC:EURGBP`, `IC:EURJPY`, `IC:EURNZD`, `IC:GBPAUD`, `IC:GBPCAD`, `IC:GBPCHF`, `IC:GBPNZD`, `IC:NZDCAD` |

## Pruebas

`qore-crt-alerts/test/pine-v34-12t-ic-markets-34-fixed.test.mjs` verifica 34/34 prefijo IC, correspondencia byte a byte con el registro JS, ausencia de `input.symbol` y `array.set(scanSymbols,7,syminfo.tickerid)`, clasificación USTEC como índice, ausencia de OANDA, aviso en charts no IC y motor CRT/MSS intacto. Estas son **pruebas offline**, no paridad de cada OHLC ni compilación Pine Editor.

## Comprobación obligatoria en TradingView Android

1. Guardar el Pine usado actualmente. Dejar una sola instancia V34.12T y confirmar el título en la pantalla.
2. Abrir `IC:EURGBP`, `IC:EURCHF`, `IC:EURNZD`, `IC:GBPCHF` y `IC:USTEC`: la tabla debe usar el feed IC y no OANDA. Si un activo no tiene datos, marcar fuente indisponible; no recurrir a otro broker.
3. Abrir `IC:BTCUSD`, pasar a `COINBASE:BTCUSD` y volver: el **slot Radar BTC debe permanecer IC:BTCUSD**. En el gráfico de Coinbase se debe avisar que la fuente no es IC, no mezclar su OHLC con IC.
4. Verificar PDH/PDL contra la 1D anterior y FVG H4 con la misma fuente IC; contrastar igualmente EURCAD/US30.
5. Ejecutar las pruebas visuales de todos los slots disponibles, incluidas las seis H4 diarias, antes de certificar el indicador. No afirmar que `R:34/34` significa feeds M5 reales verificados.

## Referencias verificables

- Gráfico oficial `IC:USTEC`: https://www.tradingview.com/symbols/IC-USTEC/
- Gráfico oficial `IC:US30`: https://www.tradingview.com/symbols/IC-US30/
- Página de EURGBP de IC Markets en TradingView: https://www.tradingview.com/symbols/EURGBP/?exchange=ICMARKETS
- Integración IC Markets y TradingView: https://www.tradingview.com/blog/en/welcoming-ic-markets-to-tradingview-43451/
