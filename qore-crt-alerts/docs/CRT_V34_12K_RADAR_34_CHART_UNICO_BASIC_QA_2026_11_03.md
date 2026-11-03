# QORE CRT RADAR + CHART UNICO V34.12K — QA / NO LIVE

Fecha: 2026-11-03. PR #74 DRAFT. Base `42057fc631e76df47b3c92adfe931f06371e8573`.

## Objetivo

La cuenta TradingView Basic del usuario permite guardar solo un script. Se construye un **nuevo archivo único de prueba** que integra el Radar A de 34 mercados (ventana 600 M5) con la capa de dibujos del Chart B (CRH, CRL, MSS M5/M15). **NO se sobrescriben los Radar A/Chart B existentes**. Así el usuario podrá validar la integración antes de sustituir el único script guardado.

## Arquitectura y seguridad

- Un único `indicator(... overlay=true, max_lines_count=8, max_labels_count=8, dynamic_requests=true)`, sin `alert()`.
- Un único `f_engine()` *idéntico* a Radar A/Chart B existente, incluyendo Multi4 MSS M15 independiente.
- Radar A conserva **for 0..33** con 34 símbolos configurables y `request.security(symbol,"5",f_engine_snapshot(), calc_bars_count=600)`. **No se agrega ni una solicitud security propia del gráfico**.
- Durante ese mismo scan, se captura `Signal integratedOwn` **solo** cuando `ticker.standard(symbol)==ticker.standard(syminfo.tickerid)`. Al no haber coincidencia exacta broker+instrumento, no se dibuja ningún nivel (nunca se mezcla IC:US30 con otro proveedor).
- CRH/CRL solo para core 2C ratificado o `familyVisual.structuralQA` con C1 y extremos propios. Provisional 2C*, expansión rechazada y máscara por sí sola nunca dibujan.
- La capa M5/M15 está copiada de Chart B; prioriza pivotes y cierres causalmente propios de la familia, sin atribuir señales ajenas. Los niveles quedan dibujados solo en M5/M15 o H4 verdaderamente alineada al NY H4 de la fuente.
- Fase M5 no-BTC `qaPhase1NonBtc=false` por defecto; QA opt-in con fase +1/+2 no se convierte en RAT/LIVE. No cambia `scanCrtValid`.

## Pruebas

`qore-crt-alerts/test/pine-v34-12k-integrated-34-chart-visual-qa.test.mjs` comprueba motor byte-idéntico, 34 símbolos, una sola llamada `request.security` en el archivo, paridad de la capa visual salvo toggle opt-in y las condiciones de causalidad, limpieza de líneas y NO ALERTAS. **No certifica Pine Editor real ni memoria en Android**.

## Reproducción manual controlada

1. Abrir la rama QA y copiar el archivo `crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_INTEGRADO_600M5_QA_NO_LIVE.pine` en un *borrador Pine Editor*. Conservar Radar A guardado; no borrar su biblioteca.
2. En gráfico **IC:US30 M5** (mismo proveedor que el slot s07), seleccionar `Alcance escaneo=34`, `Mostrar dashboard=ON`, `Dibujar CRT y MSS en el grafico abierto=ON`, `CRH/CRL=ON`, `MSS=ON`. Para la comparación QA habilitar temporalmente `qaPhase1NonBtc` si no hay C1 de fuente a NY :00; esto NO autoriza trading.
3. Compilar y añadir al gráfico, comprobar `R:34/34`, indicadores `QA Chart integrado slot 1-34` en Data Window y niveles sin necesidad de Chart B independiente. Luego probar proveedor del gráfico que NO coincide con slots para confirmar que no dibuja.
4. Si hay error Pine, registrar el mensaje/linea real sin afirmar compilación. Si compila y conserva calidad, editar **el script Radar A personal ya guardado** y sustituir su contenido por el archivo integrado; guardar ese mismo script (único slot Basic). El anterior sigue respaldado en GitHub.

Pendientes: OHLC por proveedor, 26 feeds fase M5 desplazada, paridad real Trader Lab, evidencias de siete roles, compilación en Pine Editor, alertas Android sin LIVE.
