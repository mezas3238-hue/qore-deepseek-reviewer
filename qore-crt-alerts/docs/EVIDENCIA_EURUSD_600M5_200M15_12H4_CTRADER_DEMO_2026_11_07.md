# QORE CRT ALERTS — lectura EURUSD M5/M15/H4 real, corte 2026-11-07

## Evidencia real (no simulada)

Servicio: Railway `qore-crt-alerts-qa` / `staging` / `crt-demo-readonly-worker`.

- Despliegue código PR #87: `4f540878-cfde-48a3-abac-cfce23969939`, estado `SUCCESS`, commit `5d1cbf3a5cff8ef7f8c8b4f67fc70a06d18fe3ac`.
- Resultado estructurado en los **atributos de los logs de Railway**: `HISTORICAL_M5_QA_UNCERTIFIED`, `connected=true`.
- cTrader IC Markets DEMO, `Raw Trading Ltd`, EURUSD nativo `symbolId=1`, OAuth `accounts/SCOPE_VIEW`.
- 2 páginas históricas, **600 velas M5 cerradas**, 0 huecos, fase 0 min.
- **200 contextos M15 cerrados**, derivados de 3 M5 consecutivas, 0 parciales y 0 rechazados; `nativeBrokerM15Compared=false`.
- **12 H4 completas** con anchors NY Forex 1/5/9, un H4 parcial excluido, 0 rechazadas.
- Seguridad: `canTrade=false`, `sendPush=false`, `sourceParityCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`.
- Bridge QORE Mobile: `NOT_ATTEMPTED_IN_HISTORICAL_M5_QA`. Sin Firebase ni operaciones.

**Observación de logs:** en PR #86 se corrigió la terminación de línea de Node; Railway ahora ingiere el JSON como **atributos estructurados** (no como texto literal en `message`). Para recuperar un resultado usar `get_logs` y buscar los atributos `state`, `m5ClosedBars`, `m15QaSummary`, `h4QaSummary`, nunca mostrar secretos.

## Archivos de origen y custodia

PR #86 exportó **600 OHLC reales** mediante 25 segmentos privados, reconstruidos y validados localmente contra la huella SHA256:

`30a9a0f22f2b27a02043ef35c88032d103da09c967000bdd965bcf20739d8d01`.

Ventana cTrader: apertura M5 `2026-11-04T20:00:00.000Z` hasta `2026-11-06T21:55:00.000Z`. El archivo CSV original (600) más derivados M15 (200), H4 (12) e informe QA se entregó al Owner como artefacto de la conversación. **No se almacenó un dump de las 600 cotizaciones en GitHub, QORE Mobile, Supabase ni Firebase.**

## Próximos pasos obligatorios (QA)

1. Tratar el feed **cTrader IC Markets DEMO** como fuente candidata única de señales de la futura app; *no* reemplazar silenciosamente el indicador de TradingView. Evitar dependencia de exportación de TradingView Basic/Free; si llega evidencia original independiente, comparar OHLC, no asumir paridad.
2. Confirmar M15 nativo con una consulta `ProtoOAGetTrendbarsReq period=M15` separada y comparar los 200 M15 reconstruidos; **200 contextos M15 NO prueban MSS M15**.
3. Extender de EURUSD a 33 símbolos restantes en lotes controlados: evitar sobrecargar el API y mantener excepciones de sesión/horarios para índices, metales y BTCUSD. Las 34 coincidencias por nombre permanecen sin aprobación automática.
4. Portar/validar el detector completo de las siete categorías CRT ya definidas, anclas H4 1/5/9 y MSS independientes M5/M15; pruebas de causación, repaint, falsos positivos y datos de holdout. No copiar MSS M5 al campo M15.
5. Integrar con gateway QORE Mobile QA y widget Android **solo cuando los eventos hayan sido certificados**. TTL de alertas 4 horas, con expiración, deduplicación y lectura privada.
6. No realizar merge, deploy a producción, operaciones LIVE/FundedNext, ni activar push sin una orden separada y certificación externa.

Estado actual: **ingesta M5/H4/M15 derivado de EURUSD verificada**, **TV/cTrader igualdad no verificada**, **MSS no certificado**, **siete CRT no certificados**, **app/widget no conectado a señales reales**.
