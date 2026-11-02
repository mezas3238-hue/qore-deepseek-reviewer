# V34.11P — discrepancia USDCAD: dibujo de niveles frente a MSS del dashboard

Fecha: 2026-11-02. PR #74 DRAFT. NO LIVE / NO PUSH.

## Captura
TradingView Android, gráfico `USDCAD` M15. El usuario señala niveles `5m` y `15M`; el panel V34.11O dice `USDCAD | 2C QA | BAJ | N/V | N/V | QA H4`. BTCUSD por separado dice `2C RAT | ALC | SI | NO | C3 ACT`. `R:34/34` informa fuentes respondidas, no 34 CRT certificados. La captura NO demuestra que esas líneas sean rupturas por **cierre** de velas M5/M15 después de la barrida del mismo ciclo; podrían representar pivotes o trazos manuales.

## Defecto del monitor anterior
`scanCrtValid = available and (not qaPhase1NonBtc or i == 7) and ...`. El interruptor `qaPhase1NonBtc=true` deja todos los 33 no BTC fuera de `validCoreFlags`, aunque el propio motor ya calcule un C2 H4 ratificado, `s.m5At`, `s.m15At`, pivote M5/M15 y fase nativa. El panel decía `N/V` **sin intentar cotejar la evidencia causal QA**, por eso no se podía discriminar entre un MSS confirmado QA y uno sin prueba.

## Solución aislada V34.11P
Archivo adicional: `crt-radar-pro/CRT_RADAR_PRO_V34_11P_MSS_M5_M15_QA_33_MERCADOS_NO_LIVE.pine`.

- Reconoce `structuralCoreObserved` con mismo C1, C2 H4 completo, `isPatternValid`, dirección y barrida presentes. El antiguo `scanCrtValid` mantiene el bloqueo de no BTC sin certificación; **no se convierte QA en ruta operativa**.
- Guarda `qaCoreObservedFlags` por los 34 símbolos. Si el evento existe y no es ruta core, el monitor muestra `2C QA / C3 QA`.
- Calcula **por separado** la confirmación QA M5 desde `m5PivotAt` y `m5At`; requiere pivote anterior a sweep y ruptura posterior, con la fase M5 real del proveedor.
- Calcula la confirmación QA M15 desde `m15PivotAt`, `m15At`, `qaLastClosedM15At`; requiere pivote antes, ruptura después, cierre M15 real anterior o igual al último M15 cerrado y fase nativa M15.
- Cuando todo coincide en el mismo `Signal` de `request.security(symbol,"5",f_engine_snapshot())`, muestra `QA SI`; de lo contrario `QA --` (pendiente). **Una línea dibujada o un pivote no son automáticamente MSS**.
- No permite heredar M15 del BTC, de otro ciclo, de un Inside/Multi o de otro feed. Los modelos estructurales extra siguen siendo `N/V` o `QA` hasta tener evidencia equivalente.
- Las etiquetas `QA SI` son **solo prueba local de causalidad en Pine, no certificado de paridad Pine ↔ Trader Lab**.
- La función `f_engine()`, la UDT `Signal`, las 34 fuentes, los 60 plots, el reconstruido 48 M5/H4, las siete categorías y reglas de alertas no se alteraron.

## Prueba siguiente
En TradingView Android, añadir V34.11P desde esta rama conservando V34.11O. Abrir el mismo `USDCAD` (broker exacto; el inventario de slot usa `IC:USDCAD`), M15 y dejar el monitor principal encendido con `Ver los 34 instrumentos (expandir)` OFF. Esperado: USDCAD `2C QA` con MSS M5 y M15 de forma independiente, con `QA SI` **solo si la fuente confirma**; si `QA --`, abrir `QA: ver tiempos CRT/MSS de 1 instrumento` con `QA: seguir grafico solo si proveedor coincide` y compartir C1/C2/sweep/pivot/ruptura y source. Si el gráfico no usa `IC:USDCAD`, usar el mismo proveedor para comparación; no confundir la marca manual con señal de Pine.

## Resultado de CI
GitHub Actions Foundation [#41492543860](https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41492543860), commit `206ae50439bdf181d7c8143313cb706fe16a2ad4`, 638/638 PASS, 0 FAIL. Test `pine-v34-11p-mss5-mss15-nonbtc-qa-parity.test.mjs`.

Quedan las pruebas en Pine Editor REAL, identidad exacta de OHLC, MSS por cierre en M5/M15 de mismo ciclo para los 34, certificación de siete roles en Trader Lab, holdout y motor Android/FCM. **0/7 certificación externa; NO PUSH**.
