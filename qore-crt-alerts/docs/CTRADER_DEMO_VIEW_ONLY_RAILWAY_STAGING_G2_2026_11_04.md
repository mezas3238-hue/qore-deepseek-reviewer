# QORE CRT ALERTS — G2: fuente cTrader DEMO de solo lectura + Railway STAGING

**Corte: 2026-11-04. Repo `mezas3238-hue/qore-deepseek-reviewer` · PR #74 DRAFT · NO MERGE / NO LIVE / NO PUSH / NO TRADING.**

## Objetivo preservado

- Radar 34 fuentes fijas en `IC:` (IC Markets) sin OANDA/COINBASE ni sustituciones al cambiar el chart.
- Seis H4 por día, 7 familias CRT en QA, MSS M5/M15 independientes. La paridad con tradingview sigue SIN certificar.
- Cada alerta confirmada expira exactamente 4 horas después de **su propio timestamp de cierre** o antes si la estructura queda invalidada. El backend no renueva los relojes al enviar, almacenar o abrir Android.
- Infra independiente. **No usar datos ni secretos del proyecto Movete Fácil**.

## Recursos reales creados en Railway (sin despliegue)

- Proyecto privado nuevo **`qore-crt-alerts-qa`**. ID `091cf49e-8489-4cc7-a957-218c50bd1428`.
- Ambiente **`staging`**: `1d86d681-f64d-4bcc-8ff7-aeda93403fcd`.
- Servicio **`crt-demo-readonly-worker`**: `48f5de19-cabc-4ff0-b615-525fae7832a3` en estado **`staged-create`**, no aplicado, no desplegado, **ninguna instancia en ejecución**, ninguna exposición HTTP.
- 8 variables **solo staged**: `NODE_ENV=test`, `QORE_CT_STAGE=DEMO`, `QORE_CT_OAUTH_SCOPE=accounts`, `QORE_PROVIDER=IC`, `QORE_ALERT_TTL_SECONDS=14400`, `QORE_PUSH_ENABLED=false`, `QORE_TRADING_ENABLED=false`, `QORE_CT_QA_PROBE=DISABLED_UNTIL_OWNER_VIEW_TOKEN`.
- **NINGUNA credencial configurada**, sin conexión cTrader real. El proyecto no contiene Supabase ni recursos de movilidad.
- **No aceptar/aplicar el staged patch** antes de completar QA, dependencia y secretos; crear servicio staged sin fuente no genera trabajo de mercado.

## Código real implementado y probado con datos simulados

1. `src/ctrader-demo-view-session-qa.mjs`: máquina de estados JSON (Protobuf ids 2100/2101,2149/2150,2102/2103,2114/2115,2116/2117,2137/2138). Corrige con correlación `clientMsgId`; requiere `permissionScope=0` explícito y `isLive=false`, broker `brokerTitleShort` exactamente el esperado, cuenta ctid exacta, símbolo+instrumento IC34 aprobado; nunca `2106` de órdenes ni ninguna escritura.
2. `src/ctrader-demo-wss-probe-qa.mjs`: cliente WSS de una sola sesión a `wss://demo.ctraderapi.com:5036` únicamente bajo opt-in explícito; timeout ≤40s, respuestas limitadas y salida segura sin secretos. Solo devuelve inventario y, si el Owner aprueba un símbolo, hasta 300 barras M5 cerradas, 72h de ventana, huecos/fase nativa, **sin certificar paridad**.
3. `src/ctrader-ic34-candidate-audit-qa.mjs`: coteja **todas las 34** referencias IC con nombres de símbolos encontrados en cTrader. Diferencia candidato exacto, ambiguo o ausente. La coincidencia de nombre **no** autoriza mapeo ni certifica OHLC ni habilita alertas. Reconoce `EUR/USD` como posible nombre nativo de `IC:EURUSD`; preserva el alias `IC:USTEC` para NDX100 y `IC:US500` para SPX500.
4. `scripts/run-ctrader-demo-one-shot.mjs`: comando manual mediante `npm run probe:ctrader:demo:view` en Node 22. No ejecutarlo desde un repo público con credenciales en archivos o logs; usar variables del servidor solo para pruebas autorizadas. Sin configuración explícita falla con `BLOCKED` y no abre socket.
5. Tests `test/ctrader-demo-view-session-qa.test.mjs`, `test/ctrader-demo-wss-probe-qa.test.mjs` y `test/ctrader-ic34-candidate-audit-qa.test.mjs`. Usan WebSocket fake, nunca tocan el broker.

## Variables secretas que el Owner deberá configurar SOLO en Railway cuando posea app Open API aprobada

**Se deben añadir exclusivamente como secretos privados del servicio `staging`, nunca en chat, Pine, APK ni GitHub:**

- `QORE_CT_CLIENT_ID`: Client ID de una aplicación Open API propia y aprobada.
- `QORE_CT_CLIENT_SECRET`: Client Secret de la aplicación propia.
- `QORE_CT_VIEW_ACCESS_TOKEN`: token OAuth autorizado con alcance `accounts` (view-only). **NO** usar `trading`.
- `QORE_CT_DEMO_ACCOUNT_ID`: ID numérico de una cuenta DEMO expresamente autorizada.
- `QORE_CT_EXPECTED_BROKER_TITLE`: texto **exacto** del campo `brokerTitleShort` para esa cuenta IC Markets. No suponer que coincide con el prefijo `IC:` de TradingView.
- Para muestra histórica opcional, confirmar antes `QORE_CT_SAMPLE_SYMBOL_ID`, `QORE_CT_SAMPLE_SYMBOL_NAME` y `QORE_CT_SAMPLE_INSTRUMENT_ID`, sobre un símbolo visto realmente en inventario.
- Solo cuando las anteriores estén listas y mediante ejecución QA manual: `QORE_CT_QA_PROBE=OWNER_APPROVED_VIEW_ONLY`; debe seguir desactivado por defecto.

## Pruebas pendientes (bloqueantes, NO logradas)

1. **OAuth y broker reales**: validar contra servidor DEMO que el proveedor IC Markets aparece, el alcance es explícitamente view-only, la cuenta autorizada es DEMO y se reciben nombres e IDs de símbolos. Si el proveedor omite la marca `permissionScope=0` en JSON, la versión estricta bloqueará y requerirá reconciliación documentada, no un fallback inseguro.
2. **Paridad de feed**: comparar 48 M5 cerradas y continuas por H4 y referencia `IC:` de TradingView: fase nativa, husos, spread/cotización, gap de sesiones, 6 H4. Coincidencia de nombre **no equivale a paridad de OHLC**.
3. **Causalidad/replay**: certificar las 7 familias y MSS M5/M15 del mismo ciclo contra Pine M5/M15/H4 tras recarga. Un `barstate.islast` no constituye un ledger histórico confiable.
4. **Infraestructura de alertas**: crear Supabase CRT independiente solo con consentimiento sobre los recursos potencialmente facturables; aplicar schema privado de 4h, API TLS Auth/App Check, outbox TTL y limpieza, desde Railway; después integrar Android físico.
5. **Notificaciones FCM**: desactivadas por QA, no existe emisor real ni token registrado. Las alertas no se entregan hasta certificación y habilitación Owner.

## Referencias oficiales

- Endpoint JSON demo: https://help.ctrader.com/open-api/proxies-endpoints/
- JSON `clientMsgId`, `payloadType`, `payload`: https://help.ctrader.com/open-api/sending-receiving-json/
- OAuth read-only scope `accounts`: https://help.ctrader.com/open-api/account-authentication/
- Historial M5 OHLC relativo y symbolId: https://help.ctrader.com/open-api/symbol-data/
- Definiciones ProtoOAPayloadType y SCOPE_VIEW: https://help.ctrader.com/open-api/model-messages/

**Sin automatización en el servidor desplegada todavía.**