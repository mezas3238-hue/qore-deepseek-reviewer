# QORE CRT ALERTS — segundo examen obligatorio: 34 × 600 M5 DEMO
**2026-11-07 · QORE CRT Alerts · IC Markets cTrader DEMO · GitHub fuente soberana**

## Alcance y pruebas existentes
La primera campaña de 34 símbolos produjo **34/34 respuestas con 300 M5 cerradas por símbolo**, 10.200 M5 en total. El deployment Railway `6c05624f-da46-463c-be8e-c1c98350eee5` reportó SUCCESS y el manifiesto verificó 34 IDs nativos contra SHA-256 `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`.

Ocho símbolos tuvieron interrupciones temporales todavía **sin clasificar**: GBPUSD, USDJPY, XAUUSD, XAGUSD, NDX100, SPX500, US30 y BTCUSD. La existencia de una discontinuidad no significa fallo si el calendario de mercado la explica; no se interpolan velas ni se presume continuidad 24/7.

## Segunda campaña: 600 M5 cerradas por cada uno de los 34

El nuevo modo conserva `QORE_CT_QA_COHORT34=OWNER_APPROVED_FULL_34_DEMO_M5_QA`, `QORE_CT_QA_HISTORY_PAGES=1` global y exige adicionalmente:

```text
QORE_CT_QA_COHORT34_PAGES=2
```

Después de una única verificación DEMO+SCOPE_VIEW de inventario y manifiesto real, cada símbolo usa **dos páginas seriales de hasta 300 barras históricas M5**, con controles de tiempo de cierre, duplicados, orden, fase, respuestas de cuenta y de símbolo. Máximo dos conexiones read-only concurrentes, cada una con timeout de 35 segundos y **sin retry automático**. La ventana de segunda página termina estrictamente antes de la apertura de la primera; los huecos entre páginas se conservan.

Para cada símbolo se reporta:
- `closedM5`, `historyPages`, `nativePhaseMin`, `missingIntervals` (número de saltos).
- `missingM5Bars` (intervalos M5 ausentes entre barras visibles, sin presuponer motivo).
- `gapsSample`: máximo 16 intervalos de interrupción con marcas UTC de cierre de vela anterior y apertura de la siguiente; `gapsTruncated` si hay más.
- Estado individual, grupo FOREX/INDICES/METALS/BTC_INDEPENDENT, sin exponer OAuth ni OHLC en los logs.

`all34RequestedSamplesComplete` sólo puede ser `true` si **34/34** entregan **600** M5. Si un símbolo entrega menos, se marca parcial o bloqueado; el resultado no puede disfrazarse como éxito 34/34. **20.400** es la cantidad de velas esperada, no un resultado observado hasta leer Railway.

## Pruebas posteriores y gates

1. Clasificar los huecos mediante horarios IC Markets por instrumento, fines de semana, pausas de índices/metales, y calendario especial BTC, sin hacer supuestos no verificados.
2. Obtener M15 y H4 nativas por cada símbolo y comparar con agregados causales de M5 con anclas y sesiones correctas por mercado; no trasladar 1/5/9 Forex a BTC/índices sin evidencia.
3. Validar las siete categorías/roles CRT aprobados con eventos y marcos temporales verdaderos, más MSS M5 y MSS M15 **independientes**, no repaint y negativos/holdout.
4. Sólo después de certificación positiva, integrar app/widget QA con deduplicación y caducidad de cuatro horas.

Sin LIVE, FundedNext, VPS, merge, operaciones o notificaciones Firebase reales. `sourceParityCertified=false`, `crtFamiliesCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`, `sendPush=false` y `canTrade=false` incluso si las 20.400 velas se leen correctamente.
