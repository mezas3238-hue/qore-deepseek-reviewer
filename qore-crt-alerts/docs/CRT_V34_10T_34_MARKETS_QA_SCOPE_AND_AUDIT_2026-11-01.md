# CRT RADAR PRO V34.10t — CRT + QA en los 34 mercados

Fecha: 2026-11-01 | DRAFT | NO LIVE | No constituye certificación de detección completa.

## Incidencia del propietario
«El problema es que el crt+QA solo detecta para btcusd y no para los 34 mercados».

## Causa técnica verificada en V34.10s
1. En `00 / Memoria (QA)`, `Alcance escaneo` tenía **valor predeterminado «BTCUSD solo»**, y el escáner contenía `if scanAll or i == 7`. Solo el índice 7 (BTC) se consultaba si el dueño no cambiaba manualmente ese valor. Cambiar solo la `Vista` a `Solo CRT + QA` **no activaba** `scanAll`.
2. Las filas del catálogo `MODELO CRT` y `OTROS CRT QA` estaban condicionadas por `if showEntryCatalog and chartBtcSymbol`: aun con el escáner completo, el catálogo explicativo solo se mostraba para BTCUSD.
3. `Auditoría histórica (QA)` extraía únicamente `own.audit*` del gráfico abierto, no los resultados de las otras 33 UDT. La presentación resultaba engañosa: no había forma de observar los diagnósticos agregados de todos los feeds.
4. Incluso cuando `scanAll` era TRUE, `RESP:34` indicaba 34 respuestas, NO 34 patrones. Un CRT se muestra solo si supera las condiciones H4 y está vigente; este filtro estricto debe permanecer.

## Cambio V34.10t
- **Predeterminado `Alcance escaneo = 34 instrumentos (experimental)`**. `BTCUSD solo` permanece como alternativa manual si la memoria o recursos de TradingView no soportan escaneo completo.
- Se conservan los mismos 34 `input.symbol`, con exactamente el mismo motor `f_engine()` y las mismas `request.security`. No se agrega detección artificial ni se relajan reglas OHLC.
- Cuando el gráfico es BTCUSD, el slot número 08 utiliza el **mismo proveedor** `syminfo.tickerid` del gráfico también cuando `scanAll` es TRUE (por ejemplo, COINBASE:BTCUSD). Evita comparar Coinbase con IC:BTCUSD como si fueran idénticos. Cuando el gráfico es otro mercado se utiliza el símbolo BTC del slot configurable.
- `Solo CRT`: muestra solamente CRT principales H4 ratificados y vigentes de cualquiera de los 34 mercados. `Solo CRT + QA`: además de los principales incluye Inside/Multi4/Multi-N que el motor haya ratificado estructuralmente y aún estén vigentes, **etiquetados QA**, con marcas `M15 QA` exclusivamente en las familias con pivote/sweep propios.
- Las filas `MODELO CRT`, `OTROS CRT QA` y `RETEST M15` ya pueden inspeccionarse en cualquier símbolo abierto, no solamente en BTC. Para ello se reservan filas 4–6 del panel y se paginan otras señales por las filas 2–3. Se amplió `Pagina` a 34 para permitir navegar todas las señales si hubiera muchas.
- La vista `Auditoría histórica (QA)` mantiene los conteos locales del gráfico `HIST M5 / C2 RECH / INS RECH / MN TERM`, y añade:
  - `34 HIST QA`: sumas de 2C, 3C, Inside, Multi4, Multi-N históricos en los feeds M5 **consultados** por el escáner, no operaciones independientes.
  - `COBERT 34`: RESP, SD, número de instrumentos con al menos un evento histórico (`HIST`), número con CRT/QA actualmente vigentes, y M15QA.
- Estos conteos no activan LIVE, no configuran órdenes, no demuestran que los 34 proveedores estén correctamente sincronizados ni que todos los modelos hayan sido certificados.
- La vista de auditoría no muestra las 34 filas, solo 2 líneas de resumen: la preferencia del dueño de ver únicamente modelos vigentes en uso normal sigue intacta.
- TXT completo y script Pine son idénticos y accesibles desde una RAMA GitHub, no un SHA fijo.

## Validaciones automáticas
`qore-crt-alerts/test/pine-v34-10t-34-market-qa.test.mjs` revisa:
1. Predeterminado realmente full scan y 34 símbolos configurados.
2. Mismo proveedor BTC en el gráfico y en slot 08.
3. La vista QA no cambia el alcance del escáner y filtra señales correctamente.
4. Histórico agregado procede de las UDT de cada uno de los 34, y no alimenta alertas.
5. Catálogo visible para Forex/índices/metales y paginación.
6. `f_engine()`, solicitud de datos, alertas, MSS, FVG, PDH/PDL, número de plots y el TXT se conservan.

**CI offline no equivale a compilación Pine v6 ni certifica 34 feeds en tiempo real**.

## Prueba TradingView Android
1. Conservar **V34.10r** (ya comprobada en el teléfono) y **V34.10s**; añadir V34.10t como un indicador nuevo usando el TXT completo de la **rama**.
2. COINBASE:BTCUSD, gráfico M15, `Alcance escaneo: 34 instrumentos (experimental)` ya predeterminado; `Vista: Solo CRT + QA` solo para diagnóstico, alertas **OFF**.
3. Ver `34 SCAN QA` y `RESP:34` cuando el proveedor suministre datos; comprobar si aparecen filas de Forex, metales o índices SOLO si hay CRT/QA vigente. No interpretar 0 actual como fallo sin revisar historial.
4. Pasar a `Auditoría histórica (QA)` y verificar `34 HIST QA` y `COBERT 34`. Es el primer aislamiento de si los modelos históricos han sido vistos en mercados distintos de BTC.
5. Abrir `OANDA:EURUSD` o uno de los mercados elegidos como gráfico; comprobar que aparece `MODELO CRT` / `OTROS CRT QA` para ese ticker, y que el motor ofrece datos históricos del mismo símbolo. Las 34 consultas deben seguir ejecutándose.
6. En caso de errores de límite Pine/request, memoria, tiempo de ejecución, enviar captura del error real sin cambiar los criterios de validez. Si todos los `HIST` excepto BTC son cero, examinar la cobertura M5 y ventanas H4 de cada proveedor, no generar señales falsas.
7. Volver a `Vista: Solo CRT` en uso habitual.

## Lo que NO se ha resuelto aún
- Multi4 distribuido sigue sin prueba MSS15 independiente; Inside/Multi-N permanecen QA.
- No todas las 7 categorías legadas son siete familias estructurales independientes; faltan reglas auditadas de todas las variantes.
- Se necesita compilación Pine real, validación OHLC por proveedor, continuidad 34 simultáneos y E2E alertas Android sin depender de TradingView.
- Sin merge de PR #65 o este PR. Sin LIVE, FCM ni órdenes.
