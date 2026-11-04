# V34.11d — NZDCAD, diferencia entre CRT histórico y CRT vigente

**Fecha 2026-11-02 · QA DRAFT · sin integración ni avisos.**

## Evidencia suministrada

Captura Android de TradingView NZDCAD, intervalo M15. El panel de V34.11c confirma simultáneamente:

- `GRAFICO IC:NZDCAD`, `FEED 34 IC:NZDCAD`, `MISMO ORIGEN`: **identidad del ticker/proveedor verificada en la captura**. Esto por sí solo **no** certifica paridad de series OHLC, porque no se exportaron las mismas M5 a Trader Lab.
- `R:34/34` significa **34 peticiones respondidas**, no 34 CRT ni histórico completo.
- `SIN CRT ACT` y `MASK 0` describen sólo estado del **último cálculo**. El chart visible muestra velas del pasado, mientras `barstate.islast` mira el último cálculo. No concluir que el engine omitió un patrón sin replay por la C1/C2 precisa.
- Líneas rosas `CRH` y `CRL`: V34.11c, por su código, sólo puede generar `CRT H4 NY HIGH` y `CRT H4 NY LOW` con C2 ratificada, fase 2 y H4 alineada. El origen visual de `CRH`/`CRL` **no queda probado** por la imagen. Puede ser otro indicador o dibujo preexistente.

## Corrección concreta

Candidato Pine `crt-radar-pro/CRT_RADAR_PRO_V34_11D_HISTORIAL_POR_FEED_QA.pine`, SHA blob `d1c26edc67fb6554bc32f71c96c7cbdfdefa6a84`:

- Conserva toda la auditoría por proveedor/slot de V34.11c, el dashboard compacto y listado de 34.
- Dentro de la vista QA añade **HIST 1500 M5**, contadores del mismo feed: H4 cerradas, C1 NY válidas, 2C, 3C, Inside, Multi4 y Multi-N detectados en la ventana. Estos contadores **no son señales actualmente accionables**, no equivalen a 7 familias certificadas y no son el histórico completo del mercado.
- Muestra H4 con huecos, DST y C2 rechazadas para distinguir falta de datos/condición temporal frente a ausencia de patrón.
- `LINEAS NY SI/NO` explica si **este script** cumple ahora las condiciones para dibujar sus propias líneas CRT H4 NY; no puede leer la identidad de objetos dibujados por otros indicadores.
- No cambia una línea del motor `f_engine()`; **34 solicitudes, 60 plots**, algoritmo MSS M5/M15, alertas OFF, sin FCM.
- Nuevo test `qore-crt-alerts/test/pine-v34-11d-history-vs-current-nzdcad.test.mjs`. Puerta de paridad acepta sólo hash exacto V34.11b, V34.11c o V34.11d, no copias anónimas.

## Comprobación recomendada en Android

1. En la lista de indicadores de TradingView, **ocultar todos salvo** `CRT MSS QA 4C 11D` y, si las líneas persisten, ocultar también los dibujos de usuario. Solo así se identifica el overlay que produce rótulos `CRH/CRL`.
2. Cargar V34.11d como nuevo indicador QA con `00 / Memoria → 34 instrumentos`, `03 / Dashboard → QA: ver tiempos CRT/MSS de 1 instrumento` activado y seguimiento de proveedor activado.
3. Abrir NZDCAD `IC:NZDCAD` en M15. Confirmar `MISMO ORIGEN`. Leer `HIST 1500 M5` vs `SIN CRT ACT`: una cantidad positiva de 2C/3C histórica junto con 0 vigente no es contradicción.
4. Verificar `LINEAS NY NO` si no hay modelo ratificado vigente. Si aún se ven `CRH/CRL`, esas etiquetas no son de V34.11d y deben aislarse con el paso 1.
5. En una vela histórica concreta usar **Bar Replay o Data Window** para reconstruir el instante, identificar C1/C2/MSS M15 y comparar con Trader Lab usando el mismo OHLC/proveedor. El panel del último bar no es por sí mismo un backtest.

**Aún faltan**: compilación Pine real y runtime de V34.11d, exportación de 34 feeds con paridad OHLC, 7 categorías por evento, no-repaint/holdout y Android E2E. NO MERGE, NO LIVE, NO PUSH.
