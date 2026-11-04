# QORE CRT ALERTS — cTrader DEMO conectado a fuente GitHub en Railway STAGING

**04 noviembre 2026 · PR #74 DRAFT · no deploy/no LIVE/no trading/no FCM.**

## Qué se preparó

Railway independiente de Movete Fácil:

- Proyecto privado: `qore-crt-alerts-qa` (`091cf49e-8489-4cc7-a957-218c50bd1428`).
- Ambiente: `staging` (`1d86d681-f64d-4bcc-8ff7-aeda93403fcd`).
- Servicio: `crt-demo-readonly-worker` (`48f5de19-cabc-4ff0-b615-525fae7832a3`).
- Monorepo root: `/qore-crt-alerts`, Node 22 (engine), Railpack, start `npm run railway:ctrader:demo:qa`, restart `NEVER`, sin dominio público. El servicio está en **staged-create** y no tiene despliegue.
- Fuente GitHub: `mezas3238-hue/qore-deepseek-reviewer` / `feature/crt-v34-11a-seven-catalog-34feeds-20261102`, PR DRAFT, fijada al commit de revisión en Railway staging. Los pushes futuros NO sustituyen ese commit fijado sin revisión.
- Ocho variables no secretas, staged: `NODE_ENV=test`, `QORE_CT_STAGE=DEMO`, `QORE_CT_OAUTH_SCOPE=accounts`, `QORE_PROVIDER=IC`, `QORE_ALERT_TTL_SECONDS=14400`, `QORE_PUSH_ENABLED=false`, `QORE_TRADING_ENABLED=false`, `QORE_CT_QA_PROBE=DISABLED_UNTIL_OWNER_VIEW_TOKEN`.

El comando no abre ningún socket a cTrader hasta que el Owner autorice explícitamente la prueba con las credenciales guardadas **solo** como variables privadas de Railway. Si falta algún valor, informa `AWAITING_OWNER_VIEW_ONLY_AUTHORIZATION` o `AWAITING_SECURE_CTRADER_CREDENTIALS` sin iniciar red. Una vez autorizado, realiza **una sola prueba** al endpoint **`wss://demo.ctraderapi.com:5036`**; no existe worker continuo, cotización live o app notificadora.

La sesión admite únicamente IDs de cTrader read-only 2100 → 2149 → 2102 → 2114 → (opcionalmente 2116, 2137 M5); compara `clientMsgId`, requiere cuenta DEMO, alcance `SCOPE_VIEW` y broker exacto, envía heartbeat 51 cada 10 s y no permite órdenes 2106. Su salida nunca contiene credenciales ni velas privadas. Verifica nombres de los 34 símbolos IC como **candidatos sin aprobar**, no como mapeos certificados.

## Pasos que el propietario puede hacer desde Android para la primera sesión REAL DEMO

1. Abrir el portal oficial **https://openapi.ctrader.com/**. Iniciar sesión con el cTrader ID asociado a su cuenta **IC Markets DEMO**.
2. Entrar en **Applications** y crear una aplicación si no existe. Spotware debe aprobarla. No usar una aplicación ajena ni tokens de otra cuenta. Una vez aprobada, ingresar al **Playground** de esa aplicación y seleccionar **scope = accounts** (solo lectura), **nunca trading**. Conceder acceso exclusivamente a su cuenta DEMO. La app puede requerir configurar una redirect URI registrada si no se usa el Playground.
3. Abrir el proyecto privado Railway `qore-crt-alerts-qa`, ambiente `staging`, servicio `crt-demo-readonly-worker` → **Variables**. Agregar **DIRECTAMENTE EN RAILWAY**, no en ChatGPT/GitHub/Pine/capturas:
   - `QORE_CT_CLIENT_ID` y `QORE_CT_CLIENT_SECRET`: credenciales de la app propia aprobada.
   - `QORE_CT_VIEW_ACCESS_TOKEN`: token OAuth del Playground con alcance `accounts`.
   - `QORE_CT_DEMO_ACCOUNT_ID`: identificador cTrader de la cuenta DEMO que el propio Owner autorizó.
   - `QORE_CT_EXPECTED_BROKER_TITLE`: valor exacto del nombre de broker mostrado por la cuenta, no inferirlo del prefijo `IC:`.
4. Mantener `QORE_CT_QA_PROBE=DISABLED_UNTIL_OWNER_VIEW_TOKEN` mientras se verifican esos datos. Para una única ejecución QA autorizada cambiarla a `OWNER_APPROVED_VIEW_ONLY`. El token y secretos nunca se imprimen.
5. Tras aprobación expresa del despliegue STAGING, aplicar la patch de Railway. El worker debe mostrar `INVENTORY_QA_ONLY` con el número de símbolos encontrados o un estado de bloqueo claro, **no `SIGNAL_CERTIFIED`**. Si aparece error por permisos, no degradar a `trading` ni usar cuenta LIVE. Aún sin notificaciones.
6. Después de inventario, y solo con aprobación expresa del Owner para un símbolo realmente encontrado, definir `QORE_CT_SAMPLE_SYMBOL_ID`, `QORE_CT_SAMPLE_SYMBOL_NAME`, `QORE_CT_SAMPLE_INSTRUMENT_ID` y volver a ejecutar una única consulta M5 histórica. La respuesta muestra `barCount`, `gaps` y `nativePhaseMin`, nunca alertas operables.

## Límites técnicos pendientes

- Las credenciales y una app Open API **todavía no están disponibles** en los recursos conectados. Sin ellas no es posible afirmar conexión real exitosa, lectura de cuenta, inventario ni cobertura de 34 símbolos.
- La fuente de cTrader puede diferir del ticker `IC:` de TradingView: se exige paridad de velas M5/H4/fases y siete familias CRT/MSS antes de generar alertas. Nombres parecidos no son evidencia de paridad.
- Aún falta activar y certificar un lector de M5 en vivo con control de cierre, replay de 34 mercados, API móvil autenticada, Supabase independiente y FCM; el buzón de **4 horas** está en QA y todo `sendPush` permanece en `false`.
- Un servicio en staging sin fuente aprobada/credenciales y con restart NEVER no genera trabajo autónomo ni conexión continua. **No desplegar sin consentimiento y revisión de costos de Railway**.

## Comprobación verificable

- `src/ctrader-demo-view-session-qa.mjs` (protocolo de cuenta y símbolo)
- `src/ctrader-demo-wss-probe-qa.mjs` (WebSocket DEMO + heartbeat)
- `src/ctrader-ic34-candidate-audit-qa.mjs` (34 nombres candidatos)
- `scripts/railway-ctrader-demo-entry.mjs` (fail-closed sin secretos)
- `test/railway-ctrader-demo-entry.test.mjs` y `test/ctrader-demo-wss-probe-qa.test.mjs` (QA simulada)
- Test CI de Github Actions: `cd qore-crt-alerts && npm test` (NO prueba de conexión real)

## Fuentes oficiales

- https://help.ctrader.com/open-api/api-application/
- https://help.ctrader.com/open-api/account-authentication/
- https://help.ctrader.com/open-api/proxies-endpoints/
- https://help.ctrader.com/open-api/connection/
- https://docs.railway.com/deployments/monorepo

**NO MERGE. NO LIVE. NO ORDERS. NO FCM.**
