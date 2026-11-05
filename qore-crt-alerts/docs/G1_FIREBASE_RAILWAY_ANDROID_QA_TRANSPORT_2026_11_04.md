# QORE CRT ALERTS — G1 Firebase + Railway + Android QA (sin señales operables)

**Corte: 04-nov-2026. PR #77 DRAFT. NO MERGE / NO LIVE / NO ORDERS / MARKET PUSH OFF.**

## Entregado en código

1. Android `QoreDashboardActivity.kt` incorpora en **Ajustes**: "Preparar identidad Firebase (obtener UID)", vincular el teléfono QA, solicitar notificación de prueba y desvincular. En **Alertas** incluye "Actualizar bandeja QA desde Railway".
2. `QaDeviceTransport.kt` solo ejecuta Firebase Auth anónimo por acción voluntaria; el registro de dispositivos requiere ID token, App Check y HTTPS. No guarda tokens Firebase en GitHub, Pine o APK como literales.
3. `QaSystemTestPolicy.kt` y `QoreMessagingService.kt`: aceptan exclusivamente `QORE_QA_SYSTEM_TEST_V1 / SYSTEM_TEST / testOnly=true` con vigencia exacta **60 segundos**, deduplicación, permisos locales y mensaje **PRUEBA / NO es señal CRT**. `BuildConfig.STAGING_NOTIFICATIONS_ENABLED=false` sigue bloqueando cualquier notificación de mercado.
4. `src/qa-firebase-transport-bridge.mjs` ofrece endpoints autenticados Firebase ID + App Check y cuenta Owner permitida: `POST /qa/v1/device/enroll`, `POST /qa/v1/device/unregister`, `POST /qa/v1/system/test-ping`, `GET /qa/v1/alerts`, `POST /qa/v1/observation/stage`. Únicamente puede emitir un **test del sistema** (data-only FCM); observaciones CRT/MSS `OFFLINE_REPLAY` permanecen **bloqueadas, no certificadas, no enviables y con TTL 4 horas**.
5. `scripts/railway-firebase-transport-entry.mjs` usa Firebase Admin con credencial almacenada **solo en Railway** y solo conecta si las comprobaciones de ambiente están listas. Ningún endpoint permite enviar señales de mercado ni órdenes.
6. Tests `test/qa-firebase-transport-bridge.test.mjs`, `QaSystemTestPolicyTest.kt` y regresiones Android. La compilación QA sin configuración externa deja el transporte bloqueado.

## Railway — preparado, NO desplegado

Proyecto `qore-crt-alerts-qa` (`091cf49e-8489-4cc7-a957-218c50bd1428`) / STAGING (`1d86d681-f64d-4bcc-8ff7-aeda93403fcd`).

- Servicio original de lectura puntual cTrader DEMO: `crt-demo-readonly-worker` (`48f5de19-cabc-4ff0-b615-525fae7832a3`), todavía staged y sin credenciales.
- Nuevo servicio HTTP separado: `crt-alerts-firebase-qa-bridge` (`77c2066c-73db-4f95-a531-7915490f1e8e`), **staged-create** sin despliegue ni dominio.
- Comando previsto: `npm run railway:firebase:qa`, carpeta `/qore-crt-alerts`, healthcheck `/qa/health`, sin restart automático, Build Railpack.
- Variables no secretas ya staged: `NODE_ENV=test`, `QORE_CT_STAGE=DEMO`, `QORE_PROVIDER=IC`, `QORE_TRADING_ENABLED=false`, `QORE_PUSH_ENABLED=false`, `QORE_ALERT_TTL_SECONDS=14400`, `QORE_QA_SYSTEM_TEST_ENABLED=false`.
- **NO usar accept-deploy** antes de autorizar costos y completar credenciales; el entorno contiene otros cambios pendientes para el lector DEMO y la operación podría aplicar ambos.

## Configuración que el Owner debe autorizar desde Android (NO pegar credenciales en el chat)

**Firebase Console** [https://console.firebase.google.com/](https://console.firebase.google.com/):

1. Crear **un proyecto independiente** de QORE Mobile: `QORE CRT Alerts QA`. Registrar una aplicación Android con paquete **`com.qore.crtalerts.qa`** (NO `com.qore.crtalerts`).
2. Habilitar **Firebase Authentication → Anonymous** exclusivamente para la prueba QA y configurar **Firebase Cloud Messaging HTTP v1** para el proyecto.
3. Configurar **App Check** de esta app. Para un APK debug distribuido fuera de Play, el proveedor Debug produce un secreto local que debe registrarse de modo privado en la consola (necesita acceso a logs del dispositivo). **No compartir ni publicar el secreto Debug**. Para una compilación de Google Play, usar Play Integrity.
4. Registrar los valores públicos de la app móvil en GitHub Actions **Secrets** de `qore-deepseek-reviewer`: `QORE_FIREBASE_ANDROID_API_KEY`, `QORE_FIREBASE_ANDROID_APP_ID`, `QORE_FIREBASE_PROJECT_ID`, `QORE_FIREBASE_SENDER_ID`. **NO añadir `google-services.json` al repositorio.**
5. Compilar una APK QA con esos valores para abrir **Ajustes → Preparar identidad Firebase (obtener UID)**. Guardar la UID mostrada como variable privada `QORE_QA_OWNER_UID` en el servicio Railway de notificaciones. La UID no es una contraseña, pero NO enviar tokens Auth/FCM/App Check.
6. En Railway, definir `QORE_FIREBASE_PROJECT_ID`, `QORE_FIREBASE_APP_ID` (igual a `QORE_FIREBASE_ANDROID_APP_ID`) y `QORE_FIREBASE_SERVICE_ACCOUNT_JSON` como variable privada de servidor. Crear credencial limitada al proyecto QA y nunca pasarla a GitHub ni a la APK.
7. Una vez autorizado el despliegue separado de STAGING y generado el dominio TLS, colocar `QORE_QA_BRIDGE_URL=https://<dominio-railway>` en **GitHub Actions → Variables**, junto a `QORE_QA_TEST_TRANSPORT_BUILD=true`, y configurar en Railway `QORE_QA_SYSTEM_TEST_ENABLED=true`. Ambas activaciones son **solo de test no mercado**.
8. Generar e instalar la APK QA configurada. Con el usuario autorizado y App Check vigente, pulsar **Vincular mi Android**, conceder permiso de notificación, y después **Enviar notificación de conexión (NO señal)**. Comprobar mensaje en el teléfono con la app minimizada y abierta; rechazar fecha futura, repetidos y caducados.
9. **Actualizar bandeja QA desde Railway** solo puede mostrar observaciones de replay con banderas `OFFLINE_REPLAY / BLOCKED_NOT_CERTIFIED / sendPush=false`. Nunca muestra como señal certificada una entrada no probada.

**No conectados hoy:** proyecto Firebase propio; service account privada; Owner UID; dominio Railway; cTrader Open API DEMO autorizado; fuente 34 IC Markets y paridad externa de siete categorías; emisor de alertas financieras certificado; registro persistente de dispositivos; E2E de notificación al teléfono real.

## Límites y puertas de fase G2

- El almacén QA actual de dispositivo y observaciones está **solo en memoria**: un reinicio Railway lo pierde. Para producto operativo instalar un almacén seguro persistente independiente con revocación y purga de alertas a las 4 horas; no reutilizar el Supabase de Movete Fácil.
- La prueba `FCM accepted` **no demuestra recepción en Android**. Exige evidencia en dispositivo real con pantalla apagada o app cerrada; las restricciones del SO y fuerza de cierre pueden afectar entrega.
- La recepción de un mensaje técnico no certifica 34 feeds, 7 familias CRT, MSS M5/M15, ni paridad de TradingView frente a cTrader. Hasta certificar M5 nativas, H4, fases, cronología, holdout y no-repaint, **no activar avisos financieros**.
- En G2 se deberá implantar generación CRT desde M5 autorizadas, ID de evento inmutable, normalización IC por símbolo, control de revocación y solo entonces valorar alertas de mercado con TTL restante ≤4 h.

Referencias: [Firebase Auth ID Token](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [Firebase App Check en backend](https://firebase.google.com/docs/app-check/custom-resource-backend), [FCM HTTP v1](https://firebase.google.com/docs/cloud-messaging/send/v1-api), [App Check debug Android](https://firebase.google.com/docs/app-check/android/debug-provider).
