# QORE CRT V34.12I — Pruebas diagnósticas REALES para los 34 mercados

Fecha: 2026-11-03. Base exacta: `da38d20bb83d62bb2309ede99117f967f1e4ecb8`, Radar A blob `c37841f9ea422208e64c02a572b7a8d76d1db2a0`.
Esta carpeta NO representa indicadores nuevos para publicar: son **dos copias de Radar A con una sola diferencia funcional**, el `calc_bars_count` en la única llamada M5 dinámica dentro del `for i = 0 to 33`.

| Versión | Barras M5 por feed | Máximo teórico de H4 de 48 M5 contiguas | Ventana teórica continua |
|---|---:|---:|---:|
| `PROBE_300` | 300 | 6 | 25 horas |
| `PROBE_600` | 600 | 12 | 50 horas |
| **Original** | 1500 | 31 | 125 horas |

Estas son **ventanas máximas de cálculo**, no cobertura realmente disponible; huecos de proveedor, horarios de índices, fin de semana, DST, pivotes y bootstrap pueden reducir la cobertura funcional. Multi-N con C1 + cinco consolidaciones + terminal requiere **7 H4** = 336 M5 completos como mínimo: la sonda 300 sirve para diagnosticar límites, **no para certificar las siete categorías del catálogo**.

**Cómo probar en TradingView (Pine Editor, teléfono Android con navegador en modo escritorio si el editor no está disponible en app):**
1. Abrir el archivo `PROBE_600` en la rama y pulsar `Copy raw file`. Pegar íntegro en Pine Editor de TradingView y guardar con nombre `QORE 34 PROBE 600 NO LIVE` como indicador separado, sin borrar los originales.
2. Intentar compilación y añadirlo a gráfico, con `34 instrumentos (experimental)`, sin alertas. Registrar **error literal si aparece** (compilador o `Memory limits exceeded`) y si muestra `R:0/34`, `R:n/34` etc. Debe revisarse en varios símbolos, no solo BTC.
3. En el dashboard activar `QA: auditar los 33 instrumentos sin BTC` y recorrer sus 4 páginas (10+10+10+3). Anotar por slot `FEED`, `C1`, `H4`, `FASE`, `INI ERR`, `FIN ERR`, `48 ERR`, `GAPS`. No atribuir `0 CRT` automáticamente a memoria.
4. Repetir con `PROBE_300`. Si 300 compila y 600 no, apunta a restricción de recursos, no demuestra causalidad única. Si ambos fallan con idéntico mensaje de sintaxis, buscar error de Pine, no culpar a memoria.
5. Comparar con Radar A original de 1500 si TradingView lo permite. Anotar fecha, TF anfitrión, símbolo y proveedor exactos, modo, dispositivo y **capturas del error/tabla**, nunca inventar una ejecución.

**Criterio de lectura de señales:** el historial escaso puede eliminar temporalmente CRT, porque hay H4 precedentes insuficientes. Todas las categorías deben conservar sus condiciones de causalidad sin crear nuevas señales, pero no se asume que todas tengan MSS M15: Multi4 M15 sigue pendiente. El código QA no activa `alert()`, no ejecuta push ni es estrategia de trading.

**No aplicar aún `SignalThin`:** un wrapper que llama a `f_engine()` completo pero devuelve 19 campos **no reduce los arrays, pivotes ni trabajo interno del motor**. Ahorro de copia del UDT debe medirse por Pine Profiler y pruebas comparativas, no estimarse multiplicando 19/132. El panel de auditoría y los diagnósticos de 33 mercados necesitan más de 19 campos, por lo que un UDT thin requeriría rediseñar su contrato, no solo cambiar el tipo de retorno.

**Evidencia del laboratorio:** el inventario de fuentes de Trader Lab tiene metadatos de 33 ZIP, pero los OHLC originales y su equivalencia broker–TradingView no están certificados; el slot BTCUSD carece de fuente archivada. Los tests de GitHub con `FIXTURE_` son **sintéticos** y no prueban detección real en los 34 mercados.

**Protecciones:** PR #74 DRAFT, NO MERGE, NO LIVE, NO PUSH, NO CERTIFICACIÓN hasta compilación Pine Editor y replay con OHLC auténticos.
