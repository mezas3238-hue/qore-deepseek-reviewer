# cTrader DEMO EURUSD — CSV privado de 600 velas M5, QA 2026-11-07

**NO MERGE / NO LIVE / NO ORDENES / NO ALERTAS DE MERCADO / NO FCM / NO producción.**

Este trabajo prepara evidencia de OHLC real para compararla con TradingView; no certifica CRT, MSS, paridad de feeds, TradingView, ni el widget.

## Permisos y captura

La ejecución habilitada por el Owner está limitada a la cuenta DEMO ya autenticada con `accounts / SCOPE_VIEW`, `Raw Trading Ltd`, `EURUSD` `ctraderSymbolId=1`, `QORE_CT_QA_HISTORY_PAGES=2`, y `QORE_TRADING_ENABLED=false` / `QORE_PUSH_ENABLED=false`.

Variable **explícita** de esta modalidad privada de exportación:

```
QORE_CT_QA_M5_CSV_EXPORT=OWNER_APPROVED_PRIVATE_QA_CSV_ONLY
```

El código rechaza la exportación si se usa otro símbolo, otro broker, una cuenta LIVE, cualquier permiso incompatible, menos de 600 velas cerradas, huecos, duplicados, intervalos inválidos o una configuración distinta. No hay retries automáticos. Un reinicio o nuevo despliegue de Railway STAGING debe estar basado en un commit CI aprobado. El código del worker corre **una sola vez**.

## Formato y custodia

Solo los logs **privados** del worker `crt-demo-readonly-worker` en Railway STAGING reciben el CSV por segmentos numerados con SHA-256 general. Un segmento incluye a lo sumo 25 líneas. La ruta de exportación nunca envía precios a QORE Mobile, Firebase o una URL pública. No escribe archivos en el repositorio ni usa Supabase para datos temporales.

El CSV sigue el contrato de `mezas3238-hue/qore-core/tools/crt_feed_parity/compare_ic_m5.py`:

```csv
origin,tv_symbol,broker,server,open_time_utc,open,high,low,close,closed
```

Las filas de cTrader usan `origin=CTRADER_IC_DEMO`, `tv_symbol=IC:EURUSD`, `broker=IC MARKETS`, `closed=true` y precios decimales a 5 dígitos.

El identificador técnico `server=Raw_Trading_Ltd_DEMO_OpenAPI_EURUSD_symbol1` **no afirma que se haya descubierto el servidor de precios subyacente del broker**. Identifica la conexión DEMO/entidad/API/símbolo que produjo la muestra, sin exponer número de cuenta.

## Integridad

Un recolector debe ordenar los segmentos por `chunkIndex`, comprobar que los índices son únicos y completos, que todas las posiciones `rowStart` sean contiguas, reconstruir el texto con `\n` final y verificar que su SHA-256 coincide con `privateCsvSummary.sha256`. Rechazar cualquier línea sobrante o ausente. Las 600 velas deben estar cerradas y ser coherentes; el resumen de 12 H4 completas es validación separada y nunca reemplaza el archivo OHLC.

## Comparación TradingView

TradingView documenta `Descargar datos del gráfico…` desde Supercharts; la disponibilidad del menú y cantidad cargada pueden depender de permisos del plan. Para una comparación real, el Owner debe aportar una exportación original de `IC:EURUSD`, M5, con al menos 600 velas y la misma ventana UTC. El archivo bruto requiere normalización con origen y feed verdaderos, sin mover timestamps ni inventar cotizaciones.

Hasta obtener **ambas** series independientes, cualquier `SAMPLE_MATCH_ONLY` o certificación de las siete familias CRT/MSS queda bloqueada. El análisis de la diferencia de proveedores debe ser independiente de la app de alertas.

Este modo QA puede producir un archivo local para revisión del Owner; no entrega accesos de red, contraseñas ni OAuth.
