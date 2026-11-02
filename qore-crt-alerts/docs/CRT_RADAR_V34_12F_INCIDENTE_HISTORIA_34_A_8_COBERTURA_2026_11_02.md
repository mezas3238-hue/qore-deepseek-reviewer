# Incidente de consistencia de histórico V34.12D → V34.12E

**Fecha 2026-11-02, capturas TradingView Android 19:11 y 19:39 PYT. PR #74 DRAFT, NO LIVE/NO PUSH.**

## Evidencia visual de la captura de usuario

- Radar A V34.12D, aproximadamente 19:11: **2C H 34**, **3C H 9**, **INS H 15**, **M4 H 4**, **MN H 2** mercados con al menos un último evento registrado.
- Radar A V34.12E, aproximadamente 19:39, gráfico GBPAUD M15: **2C H 8**, **3C H 3**, **INS H 3**, **M4 H 1**, **MN H 0**. El sumario `3C=INS:2` solo compara el mismo fin H4 de los *últimos* eventos de ambos tipos dentro de cada fuente; no da nombres ni comprueba C1, barrida y dirección.
- V34.12E ya seleccionó **S30 GBPAUD** (feed del radar `IC:GBPAUD` si no fue cambiado manualmente), por lo que **la corrección de selección por broker/slot sí funcionó**. En cambio, cinco campos de histórico de ese slot resultaron `N/D`, aunque en V34.12D aparecían fechas para GBPAUD. Esto no es demostración de que nunca haya habido CRT.
- V34.12E imprimía en el pie **`34 FEEDS` literal**. **No era un contador**. Por eso las capturas anteriores no permiten asegurar que respondieran 34/34; también faltaba saber si en S30 el motor procesó C1 y H4 completas.

## Auditoría del código

`f_engine()`, `Signal` y el bucle `request.security(symbol,"5",f_engine_snapshot(), lookahead=barmerge.lookahead_off, calc_bars_count=1500)` se mantuvieron **sin cambios entre D, E y F**, así como 34 input.symbol, hora NY, reconstrucción de H4, MSS M5/M15, orden del monitor y desactivación de alertas. El nuevo selector de E solo modifica la identidad de la vista inferior.

**No está demostrada la causa de la pérdida de históricos.** Hipótesis por comprobar (NO hechos): ventana de solo 1500 M5 por símbolo y recalculación al cargar una nueva versión, histórico disponible de proveedor/horarios, ajustes distintos del usuario, estado del último snapshot. Una diferencia tan grande en menos de media hora no se debe explicar automáticamente por que las velas viejas «caducaron»; es una alerta de reproducibilidad.

## Nuevo candidato V34.12F

`crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_F_COBERTURA_34_FEEDS_QA_NO_LIVE.pine`

Se añade **solo diagnóstico** a la tabla histórica. El último renglón muestra:
- **`R:x/34`**: fuentes que efectivamente devolvieron un `Signal.phase` válido en este contexto, calculado por `checked`, no una frase fija.
- **`S:FEED OK`**, `S:SIN FEED` o `S:NO BROKER`: estado del proveedor y slot exacto elegido.
- **`C1:n`**: cantidad de C1 elegibles observadas por el motor en la ventana cargada del feed seleccionado. **No** significa n CRT ratificados.
- **`H4:a/b`**: `auditC1H4Closed` (H4 que pasaron el control de cierre para evaluación C1) y `qaH4LastBars` (número de M5 reconstruidas en la última H4 auditada). **No** contar `a` como eventos ni asumir `b=48` en horarios con pausas.
- Pie `HIST NO PUSH` continúa bloqueando interpretación de alertas.

Estos campos reutilizan exclusivamente `Signal` y arrays ya existentes; ninguna petición `request.security` adicional. Se conservan 3C/Inside por cierre exacto, no se promueve ninguna categoría a señal ni se modifica el script B de niveles.

## Verificación práctica

1. Instalar V34.12F solo en el slot del radar y compilar dentro de **Pine Editor real**. GitHub Node no equivale a compilación Pine.
2. Con `QA: historial 2C/3C/Inside/Multi por mercado` ON y seguimiento por broker ON, abrir el **mismo proveedor** de GBPAUD del radar: comprobar `S30 GBPAUD`, anotar `R`, `S`, `C1`, `H4` y si continúan N/D los históricos.
3. Repetir en **IC:GBPNZD (S33)** y **IC:XAUUSD (S4)**, que anteriormente mostraron fechas coincidentes en 3C/Inside; registrar sus `UTCmin` exactos y `3C=INS`. Los dos mercados deben examinarse individualmente, no se puede inferir su identidad a partir del agregado `3C=INS:2`.
4. Si `R < 34` es problema de fuentes/contexto; si `R=34` pero `H4` y `C1` son cero o N/D en varios, inspeccionar el feed M5, el rango de datos efectivos y condiciones H4 antes de tocar la detección. Si `C1>0` y el histórico sigue vacío, contrastar rechazo/barrida/MSS y resultado de escenarios de control, no forzar señales.
5. Repetir tras recargar el mismo script y la misma configuración, evitando mezclar archivos D/E/F o brokers diferentes. Se necesita un **replay offline con OHLC M5 del mismo proveedor** y holdout antes de hablar de certificación.

**Estado: 0 eventos 3C/Inside/Multi certificados externamente con estas capturas; Android/FCM sigue bloqueado.**
