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
