# QORE CRT ALERTS — conector cTrader DEMO M5 (QA, plan FREE)

Fecha: 03-Nov-2026 · PR #74 DRAFT · **NO LIVE / NO TRADES / NO PUSH / NO MERGE**

## Objetivo y resultado

El Owner utiliza TradingView Basic gratuito: el indicador Pine sirve para mostrar y contrastar señales, pero **no** se toma como canal de webhooks. Para tener alertas con TradingView cerrado, QORE necesitará ejecutar **un motor independiente en el VPS**, alimentado por datos M5 autorizados y comprobar el resultado contra el indicador original.

En esta entrega se implementan:

- `src/ctrader-readonly-m5-qa.mjs`: allowlist de mensajes cTrader solo lectura; exige OAuth `accounts` y cuenta **DEMO** inequívoca; compara el catálogo exacto de 34 IDs del indicador con el inventario declarado por el broker. Ninguna coincidencia de nombre certifica paridad de OHLC IC/OANDA.
- `planM5Subscription`: construye sin enviar la secuencia **SubscribeSpots -> SubscribeLiveTrendbar M5** del Open API. No establece conexión ni solicita credenciales.
- `normalizeClosedCtraderTrendbar`: decodifica `utcTimestampInMinutes`, `low`, `deltaOpen`, `deltaHigh`, `deltaClose` (precios relativos ×100000 según cTrader), comprueba el periodo, cierre comprobado, precios OHLC y fase nativa 0..4.
- `CtraderClosedM5QaBuffer`: cuarentena para saltos M5, atrasos, inversiones, broker distinto, duplicados contradictorios y fase nativa cambiante. **La continuidad de 48 M5 H4 nunca se rellena artificialmente.**
- `src/ctrader-demo-crt-evaluator-qa.mjs`: evalúa CRT H4 y MSS M5/M15 sobre M5 DEMO cerradas con el motor `replayCycle`. Conserva la identidad propia `DemoBroker`; jamás reetiqueta una vela cTrader como `IC`/`OANDA`. Resultado `REPLAY_EVALUATED_NOT_TV_CERTIFIED`: **sendPush=false, actionable=false, canTrade=false**.
- `scripts/qa-ctrader-demo-inventory.mjs`: auditoría offline del inventario real del broker. No lee API ni requiere datos sensibles.
- Dos suites de regresión cubren lista de 34, BTC separado, selección por broker, 5 fases, credenciales inválidas, órdenes prohibidas, gap/duplicate/stale/out-of-order y replay sin certificación de Pine.

## Ejecución del reporte de inventario offline (sin contraseñas)

En el directorio `qore-crt-alerts` ejecutar:

```bash
npm run audit:ctrader-demo -- ./ruta/inventario-demo-seguro.json
```

Ejemplo **FICTICIO** de formato aceptado:

```json
{
  "account": {"ctidTraderAccountId": 123456, "isLive": false, "brokerName": "DemoBroker"},
  "scope": "accounts",
  "discoveredSymbols": [
    {"symbolId": 37, "symbolName": "USDCAD", "digits": 5, "enabled": true}
  ],
  "approvedMappings": [
    {"instrumentId": "USDCAD", "tvSymbol": "IC:USDCAD",
     "symbolId": 37, "brokerSymbolName": "USDCAD", "ownerApproved": true}
  ]
}
```

El resultado ficticio será `brokerCandidates:1`, `sourceParityCertified:0`, `sendPushEnabled:0` y **33/34 UNMAPPED**. Aún cuando los 34 estén en el broker, `sourceParityCertified` seguirá **0** hasta comparar OHLC reales.

**No subir tokens OAuth, client secret ni datos de cuentas reales a GitHub o a este documento.** Usar credenciales solo en el runtime protegido del VPS una vez autorizadas. No se incluyen credenciales en el ejemplo.

## Puertas técnicas todavía pendientes

1. **Open API app:** registrar y obtener aprobación de una aplicación en https://openapi.ctrader.com/; configurar redirect URI y autorización OAuth *accounts* de solo lectura sobre la cuenta **DEMO**. La aprobación y el consentimiento corresponden al dueño. No se ha hecho.
2. **Transporte auténtico:** adaptar SDK/client Protobuf o JSON en un servicio de VPS con TLS, gestión de reconexión y heartbeat; autenticar la cuenta DEMO y consultar `ProtoOASymbolsListReq`/`ProtoOASymbolByIdReq`. Luego adquirir histórico M5 y suscripciones Spots + LiveTrendbar M5. No se ha hecho.
3. **Cobertura verificable:** levantar el inventario real (con IDs y dígitos) y **aprobar uno por uno** correspondencias con los 34 nombres del Pine; investigar instrumentos OANDA ausentes en el broker. No asumir 34/34.
4. **Paridad:** fijar dos muestras por familia y controles negativos con Pine/Trader Lab por proveedor (OHLC/timestamps/fase H4/48 M5/MSS5/MSS15); BTC sigue su lógica separada. Ningún evento QA puede promocionarse por coincidencia de nombre o fixture.
5. **Backend:** servicio de eventos persistente y autenticado, idempotencia por *instrumento + proveedor + familia + C1 + etapa + hora*, políticas de frescura, auditoría de derechos de datos y endpoint de inscripción de Android.
6. **FCM Android:** proyecto Firebase con App Check, tokens registrados por usuario autenticado, consentimiento expreso, controles de entrega y prueba real al cerrar TradingView y al cerrar la app. **QA build sigue bloqueado** (`STAGING_NOTIFICATIONS_ENABLED=false`).

## Seguridad e interpretación

- La arquitectura actual **NO** está conectada a cTrader, al VPS ni a Firebase y **NO** entrega una sola alerta auténtica. No publicar números de cobertura observada como reales sin consultar primero el broker.
- `accounts` permite lectura, `trading` NO se solicita. No programar operaciones automáticas ni controles de trader en este módulo.
- La documentación oficial indica límite de solicitudes por conexión para datos históricos y no históricos; implementar throttling, backoff y monitoreo de desconexiones en la próxima fase.
- El API de cTrader no cobra por sí mismo, pero esto NO garantiza acceso universal a los 34 símbolos ni licencias de redistribución de precios.

Referencias: https://help.ctrader.com/open-api/account-authentication/ · https://help.ctrader.com/open-api/symbol-data/ · https://help.ctrader.com/open-api/api-application/ · https://help.ctrader.com/open-api/
