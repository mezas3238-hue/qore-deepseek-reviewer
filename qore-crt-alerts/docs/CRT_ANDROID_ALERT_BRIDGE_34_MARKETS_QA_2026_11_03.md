# QORE CRT ALERTS — conexión indicador → aplicación (fase de contrato QA)

Fecha 2026-11-03 · PR #74 DRAFT · NO LIVE/NO PUSH/NO MERGE

## Solicitud del usuario

La app Android debe informar **qué par** presenta CRT, **qué familia** (2C, 3C, Inside, Multi4, Multi-N), **dirección**, **MSS M5** y **MSS M15**, con eventos posteriores separados y sin mezclar brokers.

## Arquitectura correcta

1. **Backend de precios propio**, con derechos de acceso y M5 cerradas para los 34 símbolos, calcula CRT/MSS independientemente del estado abierto/cerrado de TradingView.
2. **Certificación por par** compara OHLC H4/CRT/MSS y cronología con Pine/Trader Lab. Un CRT QA de una vela +1/+2 no se promueve automáticamente a RAT.
3. **Registro de evento** con identidad inmutable (proveedor, instrumento, C1, dirección, modelo, tipo y cierre). CRT observado, MSS M5 y MSS M15 se almacenan como eventos diferentes, nunca M5=M15.
4. **Servicio autenticado** (Firebase Auth + App Check + registro de dispositivos, persistencia idempotente, FCM sender) genera push al teléfono y conserva inbox histórico.
5. **Android** consulta el inbox y muestra estado CRT/PENDIENTE/CONFIRMADO/RECHAZADO, modelo, fechas, broker, MSS M5 y M15. Requiere permiso de notificaciones expreso. No debe depender de TradingView abierto.

## Implementado en esta ronda

`src/qa-market-alert-bridge.mjs` + `test/qa-market-alert-bridge.test.mjs`: proyección compartida `renderCrtMssQaStatus`, 34 símbolos exactos, eventos CRT/MSS5/MSS15 diferenciados, rechazo de identidad de broker incorrecta y deduplicación/retención de conflictos. Solo registros `OFFLINE_REPLAY`, `BLOCKED_NOT_CERTIFIED`, `sendPush=false`. No hay red ni FCM; NO representa una conexión real. Ejemplo de formato final previsto:

- `USDCAD / IC:USDCAD — MULTI4 alcista — CRT H4 observado (QA)`
- `MSS M5 pendiente` / `MSS M15 pendiente`
- Ante ruptura auténtica propia, un **nuevo evento** `MSS_M5_OBSERVED` o `MSS_M15_OBSERVED` actualiza el ciclo sin generar doble notificación.

## Bloqueantes materiales

- El código de Android usa `BuildConfig.STAGING_NOTIFICATIONS_ENABLED=false`, Firebase auto-init false, no proyecto Firebase real, sin inscripción autenticada ni emisor FCM.
- `README` del proyecto confirma **sin feed real para 34**, sin conexión a base de datos de producción ni despliegue de servicio. No debemos habilitar push con el estado actual.
- Para la entrega real, hace falta proveedor autorizado de datos M5 de los 34 símbolos con identidad/broker verificables, credenciales y despliegue protegido y pruebas reales de recepción Android.
- En TradingView un script con `alert()` no crea una alerta automáticamente; el usuario tiene que configurarla. Esa vía puede servir como puente temporal en QA, pero no cumple independencia de TradingView y tampoco certifica los 34 proveedores.

El objetivo de la siguiente fase es enlazar la proyección de eventos a un inbox autenticado (backend), adaptar el cliente Kotlin para las tres clases y validar caso 2C+M15 y Multi4 N/V en USDCAD. Sin aprobación para LIVE.

## Entrega de continuación — 03-Nov-2026: hora y precio por confirmación

Se añadió el renderizador Android `QaCrtNotificationText.kt`, integrado al futuro receptor FCM `QoreMessagingService.kt`. La notificación **CRT H4** informa el mercado, familia, dirección y MSS M5/M15 pendientes. Cuando el evento del **mismo ciclo** confirma MSS M5 o MSS M15, el texto despliega la **hora local del teléfono** (`dd/MM HH:mm`) y **precio de cierre** por separado; se utiliza `Notification.BigTextStyle` para que se lean las cuatro líneas.

Contrato Android `QaCrtStatusContract.kt`: todo MSS `CONFIRMED` exige `mssM5AtMs/mssM5Price` o `mssM15AtMs/mssM15Price` según corresponda. Rechaza precio cero, negativo, no numérico; timestamps que no sean cierres nativos de M5/M15, posteriores al evento o ajenos al C1; rechaza pruebas adjuntas a estado `AWAITING/UNVERIFIED`. `NotificationPolicy.kt` comunica los datos exclusivamente después de validar el contrato. Esta validación de forma NO equivale a autenticar la fuente de datos.

En el replay QA `qa-replay-to-android-inbox.mjs` busca el **cierre M5 exacto** de la ruptura respectiva para extraer `close`; `qa-market-alert-bridge.mjs` añade hora/precio **solo si** el MSS estaba CONFIRMADO en ese instante. La primera notificación no puede mostrar el precio de una ruptura futura; el MSS M5 no sustituye al MSS M15. Se amplió la batería `qa-alert-stage-price-proof.test.mjs` y `QaCrtNotificationTextTest.kt` para cubrir estados, presentación y rechazos.

**Lo que NO se ha activado:** sigue `BuildConfig.STAGING_NOTIFICATIONS_ENABLED=false`; Firebase auto-init deshabilitado; el servicio mantiene `serverEnrollmentVerified=false` y `tradingEngineCertified=false`; no se recibe un feed de 34 proveedores ni se ejecuta envío FCM. Las pruebas sintéticas no son señales financieras ni validación de siete familias. Ninguna APK de esta fase debe anunciar alertas operativas.

### Orden para conectar indicador y entregar al Android

1. Exportar **eventos estructurados del Pine** a un endpoint STAGING autenticado, por familia, feed, ciclo C1, cierre H4/M5/M15, dirección, hora, precio y OHLC SHA. No basta con el texto de la tabla. Una alerta TradingView debe configurarse explícitamente en TradingView; requiere compatibilidad con la cuota y plan, y no garantiza por sí sola la cobertura certificada de 34 feeds.
2. Comparar cada evento con replay independiente sobre las mismas velas y fases nativas; aislar provisionales y rechazos; ejecutar 34 mercados, negativos, holdout/no-repaint, M5/M15 independientes.
3. Crear inbox persistente con identidad **incluyendo la familia** para no colapsar familias simultáneas, deduplicación, control de orden, credenciales backend y registro de dispositivo autorizado.
4. Aprovisionar Firebase real, inscripción autenticada con consentimiento y permisos Android; desplegar emisor FCM sujeto a los gates y probar mensajes reales con la app cerrada.
5. Certificar E2E por mercado y ciclo antes de encender el flag en una build de STAGING. No MERGE / NO LIVE / NO PUSH hasta aprobar los gates.

**Corrección posterior de deduplicación (03-Nov):** el `eventId` de transporte V2 conserva sus seis campos por compatibilidad, pero ahora `BlockedQaInbox` y `QoreMessagingService` utilizan la clave compuesta `eventId + "|" + family` para retención, notificación y repetidos. Dos familias en el mismo instrumento/C1/dirección/instante generan filas separadas; dos mensajes contradictorios de la **misma familia y evento** quedan en cuarentena. El futuro backend persistente deberá utilizar la misma unicidad compuesta (o una versión V3 formal) antes de recibir alertas reales.
