# QORE CRT ALERTS — Construcción G1: alertas con validez 4 horas

Corte: 04-Nov-2026. PR #74 DRAFT, QA, NO MERGE, NO LIVE, NO FCM REAL.

## Directiva Owner (obligatoria)

Cada alerta CRT o MSS caduca exactamente cuatro horas después de la confirmación causal del evento por cierre de vela; no se renueva al guardarse, abrir Android, reintentar FCM o recibir un duplicado. Si la estructura deja de ser válida antes, se invalida inmediatamente. No registrar historiales de 7/30 días. Los 34 feeds Radar son fijos IC Markets; seis H4 por día; sin otros proveedores; sin VPS propio.

## Código construido

- **src/qa-four-hour-inbox.mjs**: motor temporal en memoria que reutiliza la validación de eventos CRT/MSS offline existente. TTL 14.400.000 ms desde eventAtMs, dedup por eventId+family, eventos independientes CRT/MSS5/MSS15, invalidación temprana, capacidad acotada y purga de expirados. Ningún envío.
- **src/qa-four-hour-http.mjs**: servidor de consulta QA únicamente por loopback 127.0.0.1, sin APIs mutantes ni FCM. Endpoints GET /qa/health y GET /qa/v1/alerts; no público ni desplegado.
- **src/qa-four-hour-delivery-policy.mjs**: calcula el TTL FCM de manera conservadora desde el tiempo REAL restante. Secundarios vencidos, invalidados o no-QA son no enviables. DRY RUN, sin SDK de envío.
- **sql/006_qa_four_hour_alerts.sql**: tabla privada qore_crt_alerts.qa_alerts_4h, RLS y FORCE RLS, sin grants a usuarios anónimos; restricción SQL de diferencia temporal exacta de 4 horas. Bloqueo permanente BLOCKED_NOT_CERTIFIED y funciones SECURITY INVOKER privadas para stage/idempotencia, invalidación y purga. NO aplicada a Supabase conectado.
- **src/pg-qa-four-hour-alerts.mjs**: adaptador parametrizado para ejecución desde backend privilegiado, sin URL ni secreto en código. Consulta eventos activos con expires_at posterior a ahora e invalidated_at nulo, incluso si la purga física se retrasa.
- **Android QaFourHourAlertPolicy.kt**: comprueba confirmedAtMs y expiresAtMs exactos y rechaza alertas futuras, vencidas e invalidadas. QoreMessagingService.kt usa ese gate, programa setTimeoutAfter y elimina dedup vencidos al recibir nuevos mensajes. BuildConfig.STAGING_NOTIFICATIONS_ENABLED sigue siendo false.
- **Android QaCrtStatusContract.kt**: las cinco fuentes antiguas OANDA fueron reemplazadas por IC:USTEC, IC:EURCHF, IC:EURGBP, IC:EURNZD, IC:GBPCHF, con siete categorías QA reconocidas. La pantalla inicial informa vigencia máxima 4 horas sin afirmar entregas reales.

## Verificaciones

- Node: test/qa-four-hour-inbox.test.mjs, test/qa-four-hour-http.test.mjs, test/pg-qa-four-hour-alerts.test.mjs y test/qa-four-hour-delivery-policy.test.mjs.
- Kotlin: QaFourHourAlertPolicyTest.kt en Android.
- PostgreSQL efímero CI: sql/test_qa_four_hour_alerts.sql, enlazado desde workflow qore-crt-alerts-postgres-offline.yml. No se usa base real del Owner.
- **Aprobación de CI no significa que el detector CRT, el móvil ni FCM estén certificados.**

## Recursos inspeccionados

Railway conectado tiene los proyectos qore-mobile-staging, qore-mobile-gateway y qore-trader-replay-mobile. Supabase conectado tiene qore-mobile-staging. Ninguno está identificado como infraestructura autónoma de CRT ALERTS. No se reutilizó ninguno y no se creó proyecto nuevo con costo potencial.

## Para activar un producto real, todavía pendientes

1. Obtener y verificar velas cerradas M5 desde IC Markets con cTrader Open API DEMO view-only, cuenta aprobada y permisos; validar disponibilidad real de 34 símbolos. Nunca copiar claves dentro del APK o GitHub.
2. Ejecutar replay de paridad M5/H4 y MSS M5/M15 entre fuente, backend y Pine, incluidos siete modelos y cambios de gráfica. Rechazar señales no certificadas.
3. Aprovisionar un proyecto aislado de Supabase + Railway para CRT; aplicar migración, configurar purga de vencidos, cuenta de backend de mínimo privilegio, autenticación y secretos.
4. Preparar API HTTPS autenticada de consultas y registro de dispositivos con Firebase Auth/App Check; comprobar permisos, revocaciones, reconexión y TTL desde Android físico.
5. Solo tras certificación, autorizar STAGING push FCM DATA-ONLY; el TTL FCM en segundos debe ser menor o igual al tiempo restante, sin enviar al vencer o invalidarse.

**No confundir una alerta vigente por cuatro horas con autorización para ejecutar entrada durante cuatro horas**: el evento puede dejar de ser operable antes. Actualmente ningún mensaje de mercado es enviable y no hay operaciones.
