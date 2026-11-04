# QORE CRT ALERTS — lectura M5 directamente desde Android (SIN VPS)

Fecha: 03-Nov-2026. PR #74 DRAFT. Modo QA / NO LIVE / NO TRADING / NO PUSH / NO MERGE.

## Directiva corregida del Owner

El Owner NO tiene VPS. Solo dispone de su teléfono Android y TradingView Basic gratuito. Es un error condicionar el siguiente experimento a `vps-vrix` o a un servidor del Owner. La nueva ruta es **Android → cTrader DEMO Open API → velas M5** directamente, con el teléfono en primer plano y conexión a Internet. Se mantiene TradingView solo para visualización/paridad, sin webhooks ni suscripción.

## Trabajo implementado en esta rama

- `android/app/src/main/java/com/qore/crtalerts/CtraderMobileReadOnceQa.kt`: cliente Kotlin de ejecución única usando OkHttp/WebSocket JSON **exclusivamente** `wss://demo.ctraderapi.com:5036`. Secuencia de mensajes permitida: `ProtoOAApplicationAuthReq` (2100), `ProtoOAGetAccountListByAccessTokenReq` (2149), `ProtoOAAccountAuthReq` (2102), `ProtoOASymbolsListReq` (2114), `ProtoOAGetTrendbarsReq` (2137). No existe una solicitud de órdenes.
- Verifica `SCOPE_VIEW=0`, la cuenta cTrader exacta `isLive=false`, el `symbolId` habilitado y que el histórico corresponde a la misma cuenta/símbolo, periodo M5. Rechaza OHLC relativas inconsistentes, timestamps repetidos o fase M5 cambiante. Descarta velas sin cerrar. Informa número de barras y huecos sin certificación de paridad.
- `MainActivity.kt` agrega el panel colapsable 'Configurar lectura desde mi celular' con campos para datos de una aplicación Open API aprobada: Client ID, Client Secret, token OAuth `accounts`, identificador numérico DEMO y `symbolId` de un instrumento. Se ingresan únicamente dentro de la APK, **no por ChatGPT**. Campos sensibles con contraseña, limpieza después de uso y `FLAG_SECURE` para evitar capturas cuando el panel está abierto.
- No se guardan credenciales en SharedPreferences, archivos, GitHub ni logs. La conexión se cierra al detener o abandonar la Activity. El servicio Firebase permanece bloqueado por `STAGING_NOTIFICATIONS_ENABLED=false`.
- `AndroidManifest.xml`: agrega permiso de INTERNET. `app/build.gradle.kts`: OkHttp WebSocket.

## Limitaciones obligatorias

1. **La APK no tiene la aplicación Open API ni OAuth aprobados por sí misma**. Para consultar un broker real desde el teléfono, hay que registrar una aplicación en https://openapi.ctrader.com/ y autorizar la cuenta cTrader DEMO con permiso `accounts`, no `trading`. Las credenciales del broker son distintas de TradingView; no se deben publicar.
2. **Solo consulta M5 históricas de un `symbolId`** (máximo 500, últimas 72 horas). No es aún el motor continuo de los 34 mercados ni ejecuta replays CRT/MSS dentro de Kotlin. La lectura puede fallar si el proveedor no devuelve el identificador/los campos esperados. Primero certificar una consulta auténtica desde el teléfono.
3. **Seguridad de Client Secret:** es una prueba privada para el propietario, no lista para distribuirse por Google Play. Un secreto ingresado en un cliente móvil no es tan seguro como en un backend confidencial; para lanzamiento público se requiere rediseñar OAuth con protección apropiada. La app no embebe secretos.
4. **Segundo plano:** la lectura puntual se detiene al dejar la app. Un teléfono no garantiza notificaciones 24/7 si el usuario cierra la aplicación, hay pérdida de datos, restricciones del fabricante o Android detiene procesos. Android 15 limita los servicios `dataSync` en segundo plano a 6 horas por 24h para aplicaciones dirigidas a API 35+. No prometer cobertura constante con la pantalla apagada.
5. **Sin paridad certificada:** `IC:USDCAD` / `OANDA:EURCHF` de TradingView no son necesariamente el mismo feed que un símbolo de un broker cTrader. BTCUSD sigue separado. La lógica de siete familias no está certificada en el teléfono. El resultado es **QA, no señal financiera operable**.

## Secuencia para que el propietario use únicamente Android

1. Instalar la APK QA generada por GitHub Actions para esta rama cuando compile.
2. Abrir `Configurar lectura desde mi celular`, después de haber registrado la app Open API y autorizado el token **accounts** en navegador personal.
3. Introducir datos solo en la app; seleccionar `symbolId` válido del broker cTrader (no es igual al ticker de TradingView). Pulsar `Consultar M5 desde este teléfono (solo lectura)`.
4. Leer estado 'DEMO M5' y número de velas realmente cerradas. Si bloquea, verificar permisos y cobertura sin compartir credenciales en chat.
5. Siguiente desarrollo: unir M5 a replay CRT/MSS en Kotlin, ampliar a watchlist 34 con límites de API, reintentos, market-session/phase, prueba real E2E de alerta local y diseño de resiliencia cuando Android detiene el monitor. No activar FCM ni una supuesta cobertura 24h.

## Fuentes oficiales

- https://help.ctrader.com/open-api/proxies-endpoints/ (DEMO JSON WebSocket: 5036)
- https://help.ctrader.com/open-api/sending-receiving-json/ (IDs + JSON nested payload)
- https://help.ctrader.com/open-api/account-authentication/ (`accounts` solo lectura)
- https://help.ctrader.com/open-api/symbol-data/ (histórico M5 y gaps)
- https://developer.android.com/develop/background-work/services/fgs/timeout (límite Android 15)
