# ADR — QORE CRT ALERTS: paleta Chart + alertas persistentes Railway/Supabase

**Fecha:** 2026-11-04 · **PR #74 DRAFT** · **QA / NO LIVE / NO PUSH / NO MERGE**.

## Solicitud Owner

1. Todas las líneas/zonas propias de Chart deben tener **colores configurables desde Android**.
2. Evaluar **Supabase o Railway** para alojar y almacenar las alertas, sin VPS propio y sin mantener TradingView abierto.
3. Reglas soberanas: 34 fuentes TradingView con prefijo `IC:` sin cambio de proveedor; seis H4 diarias; MSS M5 y M15 causales e independientes; no falsificar certificación de las siete familias; no auto-trading ni notificaciones reales antes de QA.

## Entregable visual inmediato

`crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12X_COLORES_PERSONALIZABLES_QA_NO_LIVE.pine`

- Grupo nuevo **04B / Colores de Chart (personalizables)**, con 15 inputs `input.color`:
  - CRH y CRL provisionales; CRH y CRL ratificados; histórico gris.
  - MSS M5 propio / MSS M5 familia adicional QA, MSS M15 pendiente / confirmado.
  - PDH intacto/tomado y PDL intacto/tomado **por separado**.
  - FVG H4 alcista / bajista, más `input.int` de transparencia (83 base, +5 si parcialmente mitigado, máximo 100).
- Cubre `line.new`, `line.set_color`, `label.new`, `label.set_textcolor`, `box.new`, `box.set_bgcolor`, `box.set_border_color`; personalización en **Ajustes → Entradas de datos**, no necesariamente en pestaña Estilo para dibujos dinámicos.
- `f_engine()` idéntico a W, sin nuevos `request.security`, sin cambios de precios, calendarios, determinismo ni alertas.
- QA: `qore-crt-alerts/test/pine-v34-12x-configurable-chart-colors.test.mjs`, CI estático PASS. **Todavía no hay compilación Pine Editor real de X**.

## Arquitectura objetivo sin TradingView ejecutándose

```text
IC Markets cTrader DEMO (Open API, credencial owner y alcance accounts/view-only)
      ↓ velas M5/cotizaciones y timestamp de cierre, 34 símbolos reales mapeados
Railway: worker persistente de datos + replay determinista C1/C2/C3 + MSS
      ↓ evento QA idempotente, evidencia OHLC, estado de certificación
Supabase PostgreSQL (auditoría persistente, RLS, eventos, entregas)
      ├─ Supabase Realtime → interfaz Android mientras está conectada
      └─ outbox + emisor server-side FCM → notificación Android con app cerrada
```

**Distinciones obligatorias:**
- Railway es **cómputo**, Supabase es **base de datos y Realtime**; ninguna de las dos plataformas crea señales CRT por sí sola. Hace falta obtener velas de una fuente autorizada y ejecutar el motor validado.
- El Pine de TradingView **no puede hacer HTTP POST arbitrario** a Railway/Supabase. Existe integración **por webhook de alertas creadas en TradingView** si el plan lo permite, pero el plan **Basic tiene cero alertas técnicas activas según precios verificados al 04-Nov-2026**; no basar el producto en ellas. Incluso con webhook, el Pine requiere emitir `alert()/alertcondition()` y el usuario crear la alerta manualmente. NO implementado.
- cTrader Open API puede ofrecer velas históricas y en vivo con un **account demo/view-only autorizado**, pero no se ha verificado aún que la cuenta específica de IC Markets del Owner tenga cobertura real de los 34 símbolos, ni que sus precios/horarios coincidan exactamente con `IC:` de TradingView. Mantener un **gate de paridad de proveedor/sesión** antes de certificar alertas. Nunca sustituir IC por OANDA/COINBASE sin permiso. En Railway usar credenciales como secretos protegidos, **no dentro del APK, Pine o GitHub**.
- Para 34 fuentes, consolidar una conexión autorizada / suscripciones y reconexión con heartbeats y límites oficiales. En cTrader **solo DEMO, accounts scope, SCOPE_VIEW**; NO `SCOPE_TRADE`, no órdenes, no lotes ni acceso a LIVE.
- Supabase Edge Functions sirven para tareas breves; no reemplazan cómodamente a un worker persistente de 24/7 con WebSocket por sus límites de ejecución.

## Modelo de eventos propuesto (NO desplegado)

Tabla privada / RLS de solo lectura al usuario Owner `crt_event_ledger`:

`id` (UUID), `event_key` (UNIQUE determinista), `feed='IC'`, `symbol`, `source_symbol_id`, `session_anchor`, `family`, `direction`, `event_type`, `c1_open_at`, `bar_closed_at`, `timeframe`, `sweep_price`, `crh`, `crl`, `mss_m5_at`, `mss_m15_at`, `pdh_price`, `pdl_price`, `pdh_taken`, `pdl_taken`, `fvg_top`, `fvg_bottom`, `fvg_status`, `source_quality`, `qa_status`, `replay_hash`, `created_at`.

Una fila por hecho confirmado y fuente; `event_key` combina broker, instrumento, familia, C1, timeframe, tipo de evento y cierre de vela, con unicidad transaccional para evitar duplicados al reconectar. No comparar IDs de tickers de brokers distintos. Tabla `notification_outbox` con `event_key`, `recipient_id`, `delivery_state`, `attempts`, `last_error`, `sent_at`. Tokens FCM almacenados de forma protegida y vinculados a usuario/dispositivo.

**Seguridad:** RLS en tablas expuestas; nadie en Android recibe la clave service-role/secret. Solo el backend puede insertar eventos; el usuario autenticado lee únicamente sus eventos. Realtime por canales privados con autorización. Historial permanente en Postgres (Realtime NO reemplaza persistencia); el móvil consulta pendientes en reconexión. Auditoría de identidad fuente, cierre M5 y certif. antes de cualquier notificación real.

## Secuencia de implementación (aún NO autorizada para desplegar)

G0 — Auditar si existe proyecto Supabase/Railway específico de CRT ALERTS (NO mezclarlo automáticamente con la app de movilidad Movete Fácil). Reservar secretos en backend; revisar presupuesto y cuenta demo de IC.

G1 — Cliente IC cTrader Open API, lectura M5 de **un** símbolo demo, inventario exacto y cierre de velas. Comparación de OHLC/husos/fase con la versión `IC:` de TradingView para definir paridad.

G2 — Replay M5→H4 y MSS M5/M15 de todo el conjunto congelado; validar que Node/Railway y Pine coinciden evento por evento, con el mismo contrato por familia. Rechazar eventos sin evidencia, no “reparar” bajo cap mediante invención.

G3 — Crear tablas/Postgres RLS y endpoint autenticado para eventos QA; upsert idempotente, reintentos y métricas, pruebas de fallo/reinicio/recovery.

G4 — Android: lista de eventos persistente, Supabase Realtime mientras conectada, FCM desde backend cuando cerrada. Activar notificaciones reales **solo tras** certificación de M5/H4, consentimiento Owner y evidencia de entrega.

G5 — Extender 1→34 instrumentos, siete familias, MSScausales, sin permitir un nuevo proveedor automático ni reemplazar slots radar.

## Referencias oficiales verificadas (04-Nov-2026)

- Pine `input.color()` y campos Estilo vs Entradas de datos: https://www.tradingview.com/pine-script-docs/concepts/inputs/
- TradingView límites/capacidades de alertas por plan: https://www.tradingview.com/pricing/
- Railway servicios de larga duración: https://docs.railway.com/build-deploy
- Supabase Realtime Broadcast: https://supabase.com/docs/guides/realtime/broadcast
- Firebase envío FCM: https://firebase.google.com/docs/cloud-messaging/send/v1-api
- cTrader endpoints DEMO y JSON: https://help.ctrader.com/open-api/proxies-endpoints/
- cTrader suscripciones trendbars: https://help.ctrader.com/open-api/symbol-data/
- Seguridad: no exponer secretos a APK, webhook ni Pine.

**ESTADO:** propuesta de arquitectura + colores en Pine versionado; NO backend de CRT desplegado, NO tablas creadas, NO push/alertas activadas, NO equivalencia de datos IC certificada.
