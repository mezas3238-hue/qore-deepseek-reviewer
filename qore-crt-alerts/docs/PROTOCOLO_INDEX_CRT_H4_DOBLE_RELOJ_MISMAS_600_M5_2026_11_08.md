# QORE CRT — contrafactual H4 de tres índices sobre el mismo feed M5 (PR hijo de #97)
**8 noviembre 2026 · Solo QA / DEMO / STAGING · 34 instrumentos obligatorios · NO MERGE / LIVE / ÓRDENES / FCM / PUSH**

## Alcance exacto
El examen anterior de los 34 mercados demostró que USTEC, US500 y US30 abren H4 nativas de cTrader en 01/05/09/13/17/21 Nueva York. Las horas soberanas de C1 para índices en `ny-clock.mjs` permanecen **02/06/22 NY**. Las cinco muestras estacionales (febrero, marzo, julio, octubre y noviembre) contenían **447** H4 nativas; **0** abiertas en 02/06/22, **225** abiertas en 01/05/21. No son señales y no prueban equivalencia Pine.

**Nuevo estudio:** la misma muestra real de **600 M5 cerradas** por índice (misma cuenta/view, mismo símbolo exacto, mismas OHLC) se particiona, independientemente, en:
- **Reloj A / Owner:** `aggregateClosedM5(..., {timeframe:"H4",family:"index"})`, C1 actual 02/06/22 NY.
- **Reloj B / solo hipótesis:** H4 de exactamente 48 M5 contiguas ancladas a la fase nativa H4 observada de cTrader. Sus aperturas 01/05/21 NY se examinan como **candidatas no aprobadas**.

La fase de B debe estar respaldada por una comparación interna real con H4 nativas desde el mismo M5 del bróker (cero diferencias OHLC en bloques verificables) y tener una sola fase durante las 600 M5. Las ventanas DST mixtas quedan bloqueadas; no se extrapola una fase para otras fechas. Cada bloque incompleto, falta de barras o salto de sesión queda excluido, sin inventar ni desplazar precios.

Se cuentan solo **geometrías observables después de velas cerradas**: C1 con C2 completa, barrida simple con retorno a C1, expansión C2 rechazada, barrida doble rechazada, C3 cerrada válida o invalidada, Inside estricto con retorno a C2, MULTI_N de consolidación y patrón distribuido de cuatro H4. Cada testigo conserva C1, cierre C2, cierre terminal, dirección y categoría; **no se llama señal**. Esta verificación geométrica NO reimplementa la máquina completa `f_engine()` Pine, ni verifica la correspondencia de los siete roles ni MSS M5/M15.

## Puertas de seguridad que permanecen
- **34/34** símbolos se siguen consultando en cTrader DEMO. Únicamente USTEC, US500 y US30 participan en el comparador de dos relojes.
- **Veto anterior no cambia:** `NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA`, `cyclesEvaluated=0` en esos tres índices, `canTrade=false`, `sendPush=false` y `noRepaintCertified=false`.
- Las otras **31** fuentes mantienen intacto el detector actual, incluida la separación de MSS M5 y M15 y el guard de pivote pre-sweep.
- No se edita `ny-clock.mjs`, ni el indicador TradingView, ni el reloj C1, ni se convierten horarios alternativos en una decisión metodológica.
- El resultado de geometría con B queda marcado `clockChangeAuthorized=false`, `indexCrtMssBlocked=true`, `pineEventParityCertified=false`, `tradingViewSourceParityCertified=false`.
- Comparación breve: 600 M5 implican unas 50 h, por lo que pueden faltar positivos de MULTI_N, sesiones/holidays o controles de no repaint. Que un contador sea cero **no certifica ausencia de estructura**.

## Cómo interpretar la salida
`indexH4OwnerC2Returns` y `indexH4NativeCandidateC2Returns` son geometrías bajo dos particiones de **las mismas 600 M5**, no dos fuentes de datos ni decisiones de entrada. Los testigos con diferente C1/C2 son **definiciones distintas del mismo movimiento**, no discrepancias de precio. Los resultados son comparativos y no un backtest de rentabilidad.

**Siguiente puerta:** capturas reales exportables de TradingView Pine del mismo período, con feed/horario/OHLC de referencia y evento C1/C2/C3/MSS por mercado, más holdout, no repaint y revisión explícita del Owner del reloj índice. Ninguna alerta móvil o widget hasta certificación.
