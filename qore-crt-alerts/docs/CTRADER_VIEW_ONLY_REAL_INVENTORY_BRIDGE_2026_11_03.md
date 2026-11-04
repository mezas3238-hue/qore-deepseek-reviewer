# QORE CRT ALERTS — conector de inventario cTrader DEMO SCOPE_VIEW

PR #74 DRAFT | NO LIVE | NO TRADE | NO FCM | NO MERGE

## Trabajo ejecutado

- `ctrader_probe/readonly_inventory.py`: proceso Python que usa el SDK oficial Spotware para consultar `demo.ctraderapi.com:5035` únicamente cuando un operador lo ejecute en un entorno seguro. Implementa autenticación de aplicación, validación explícita `SCOPE_VIEW=0`, rechazo de cuentas LIVE/ambiguas, autorización de una cuenta DEMO exacta y consulta de símbolos habilitados. No contiene mensajes de órdenes ni exporta credenciales o IDs de cuenta.
- `src/ctrader-probe-coverage-qa.mjs`: valida el JSON saneado y lo compara con los 34 instrumentos sin inferir equivalencia de feeds TradingView IC/OANDA. Exige mapeos individuales aprobados.
- `scripts/qa-ctrader-viewonly-34.mjs`: presenta cobertura potencial 0–34, siempre con `sourceParityCertified=0`, `sendPush=false`.
- `test_python/test_ctrader_view_only_probe.py` y `test/ctrader-probe-coverage-qa.test.mjs`: pruebas de alcance/identidad e inventario sin conectar con el broker. Incluidas en CI.

## Requisitos pendientes del operador

1. Crear/aprobar una aplicación en https://openapi.ctrader.com/ y autorizar una cuenta DEMO con OAuth `scope=accounts` desde el navegador del propietario. Nunca `trading`.
2. Recuperar acceso seguro al VPS `vps-vrix` (Desktop Commander lo reportó offline en esta sesión; esto no demuestra que el VPS esté apagado).
3. Instalar `ctrader-open-api` en un entorno virtual aislado e inyectar las variables sensibles directamente mediante el gestor de secretos: `QORE_CT_CLIENT_ID`, `QORE_CT_CLIENT_SECRET`, `QORE_CT_VIEW_ACCESS_TOKEN`, `QORE_CT_DEMO_ACCOUNT_ID`, y etiqueta local `QORE_CT_BROKER_LABEL`. No publicar ningún valor.
4. Ejecutar desde `qore-crt-alerts` el comando de lectura que se muestra abajo. El script solo produce el inventario saneado y termina; no instala un servicio permanente.

```bash
python3 -m ctrader_probe.readonly_inventory > /ruta/privada/probe.json
npm run audit:ctrader-viewonly-34 -- /ruta/privada/probe.json /ruta/privada/mapa-aprobado.json
```

El segundo archivo debe ser una lista de mapeos `instrumentId`, `tvSymbol`, `symbolId`, `brokerSymbolName`, `ownerApproved:true`. Si se omite, se informa honestamente 0/34 mapeados. Un `symbolName` igual NO certifica equivalencia OHLC con IC/OANDA. No subir el informe privado ni los secretos a GitHub.

## Puertas que siguen abiertas

- Consultar atributos y precisión `ProtoOASymbolByIdReq`, después obtener velas históricas M5 y suscribir Spots + LiveTrendbar del SDK con la misma autorización de SOLO LECTURA.
- Probar fecha/hora de cierre de cada M5, 48 M5/H4, sesgos de fase y 7 categorías del indicador contra replays independientes; no asumir 34/34.
- Desplegar backend de eventos autenticado, inbox persistente y configurar Firebase FCM con prueba E2E Android. El flag `STAGING_NOTIFICATIONS_ENABLED` no se ha modificado.

## Referencias oficiales

- https://help.ctrader.com/open-api/account-authentication/
- https://help.ctrader.com/open-api/symbol-data/
- https://help.ctrader.com/open-api/python-SDK/python-sdk-index/

## Extensión: una muestra histórica M5 del mismo broker (QA)

Tras ejecutar una primera vez y ver los `symbolId` habilitados, se puede fijar localmente `QORE_CT_SAMPLE_SYMBOL_ID` a **uno de esos IDs**. El mismo proceso autorizara una consulta `ProtoOAGetTrendbarsReq`, periodo numérico 5, últimas 72 horas y máximo 1000 barras. No cambia el token OAuth ni accede al endpoint LIVE.

- `ctrader_probe/closed_m5.py`: exige cuenta y símbolo coincidentes, periodo M5, timestamps UTC enteros, OHLC relativa consistente, fase nativa estable; **ignora la vela abierta** y registra cualquier salto M5 sin rellenar huecos.
- `src/ctrader-probe-coverage-qa.mjs`: valida el reporte opcional `historicalM5` incluyendo cada cierre, fase y huecos, y solo publica un resumen `sampleM5QA` con `barCount`/`gapCount`. Siempre `certified:false`, `sendPush:false`.
- `test_python/test_ctrader_closed_m5.py` y `test/ctrader-probe-coverage-qa.test.mjs`: pruebas sintéticas offline, no prueba de acceso a broker.

El muestreo usa un solo símbolo expresamente seleccionado; no autoriza la suscripción de los 34 mercados ni la paridad con TradingView. La respuesta cTrader puede tener huecos si no hubo ticks; se reportan, no se ocultan. Los archivos de datos siguen siendo privados y no deben añadirse a GitHub.
