# HANDOFF MAESTRO EJECUTIVO — CRT RADAR PRO + QORE CRT ALERTS

**Corte:** 31 de octubre de 2026 (Paraguay).  
**Destino:** siguiente chat, Arquitecto Ejecutivo Principal e Integrador A+B+C+D.  
**Misión:** TERMINAR el indicador privado TradingView Pine v6 y una app Android nativa de alertas CRT+MSS, SIN depender de las alertas de TradingView para el transporte, sin rehacer lo existente, sin merge ni LIVE no autorizados.

**Instrucción 0:** leer COMPLETO este documento, verificar GitHub HEAD real y las acciones antes de cualquier cambio. Los SHA aquí indicados son la base previa al commit documental. No fiarse de un handoff sin contrastar fuentes.

## 1. Fuentes de verdad y control de cambios

- GitHub: https://github.com/mezas3238-hue/qore-deepseek-reviewer
- PR principal: https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/55 (OPEN, DRAFT, sin merge al corte).
- Rama: feature/qore-crt-alerts-contract-20261031
- Base PR: review/crt-radar-v34-10b-qa-strict-20261031
- HEAD base verificado: 6a0d905d781426febc051d213d9f1f5e8fea5e8e
- Indicador: carpeta crt-radar-pro/
- Software backend, SQL y Android: carpeta qore-crt-alerts/
- V34.9 OFICIAL DE DESARROLLO: crt-radar-pro/CRT_RADAR_PRO_V34_9_MODULO5A_INTEGRADO.pine en development/crt-radar-v34-9-m5a-integrated-20261031.
- Pine QA estricto/paridad: crt-radar-pro/CRT_RADAR_PRO_V34_10B_QA_C2_BARRIDA_ESTRICTA_NO_INTEGRADO.pine, blob SHA 9a572500608fefbc24ae89b99d2e876529d0bfa5.
- V34.8 preservado; V34.10b NO integrado. No sobrescribir V34.9 ni modificar main sin autorización expresa.
- Este proyecto NO es QORE Mobile / Movete Fácil, ni qore-core de CIBO: no cruzar infraestructura, credenciales ni tablas por semejanza.

## 2. Estado comprobado en GitHub (no confundir CI y producción)

| Pieza | Verificación | Estado |
| --- | --- | --- |
| Node.js 22 backend/replay | 170/170 pruebas PASS | QA offline |
| HTTP Node → PostgreSQL 16 real, rol restringido | 12/12 comprobaciones PASS | PostgreSQL efímero en GitHub |
| SQL RLS, dedup y CAS | CI SUCCESS | NO aplicado externamente |
| Android Kotlin | testDebugUnitTest + assembleDebug SUCCESS | Compila en CI; NO teléfono |
| DeepSeek harness workflow | CI SUCCESS | No valida compilador Pine |
| Compilación Pine Editor en TradingView | Sin prueba | PENDIENTE |
| Paridad Pine con OHLC M5 del mismo proveedor | Sin captura real | PENDIENTE |
| Proveedor M5 licenciado y conexión para los 34 | No conectado | PENDIENTE |
| Firebase real Auth/App Check, Admin, FCM | Solo adaptadores/mocks | PENDIENTE |
| PostgreSQL externo STAGING | No conectado | PENDIENTE |
| Android con consentimiento/token y recepción física FCM | No probado/activado | PENDIENTE |
| Merge/despliegue LIVE | Sin orden | NO REALIZADO |

Evidencias correspondientes al HEAD base:
- Node 170/170: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243642036
- HTTP a PostgreSQL 16 real, 12/12: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243641443
- SQL PostgreSQL 16: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243641680
- Android QA Kotlin build: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243641506
- DeepSeek harness: https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41243641467

**EVIDENCIA IMPORTANTE:** las 12 comprobaciones son HTTP↔PostgreSQL realmente integrado en GitHub, pero los verificadores Firebase Auth/App Check son simulados. Ninguna evidencia prueba feed M5, Pine en TradingView, Firebase externo o notificaciones en Android real.

## 3. Objetivo funcional final e invariables del usuario

El indicador privado TradingView debe mostrar el CRT actual con sus niveles CRH/CRL/MSS exactos, panel siempre visible en M15, cobertura de 34 activos y seis columnas ACTIVO | CRT H4 | PDH | PDL | MSS M5 | MSS M15; estados provisionales, ratificados, invalidación, datos incompletos. Símbolo del gráfico en primera fila y paginación/filas configurables. No saturar el gráfico con históricos.

La app Android QORE CRT ALERTS debe recibir señales producidas por un backend INDEPENDIENTE de las alertas TradingView: un proveedor autorizado aporta datos M5 cerrados, el motor reproduce CRT y MSS, se contrastan reglas contra Pine, se persiste un evento único, y el sistema envía FCM a un teléfono auténticamente autorizado. TradingView sirve como referencia de verificación/paridad; NO como canal de envío obligatorio. Sin órdenes ni ejecución de trading.

Reglas soberanas:
1. C1 H4 terminada define CRH y CRL.
2. C2 H4 inmediatamente siguiente BARRE estrictamente CRH o CRL y CIERRA de regreso dentro del rango C1. Un simple toque no confirma CRT.
3. C3 H4 siguiente distribuye en dirección opuesta. C3 invalida al CIERRE H4 más allá del extremo de la mecha de C2; no invalidar por mera mecha intrabar.
4. Son TRES H4 consecutivas; no sustituir por patrones de dos velas.
5. MSS M15 obligatorio: ruptura por CIERRE de pivote/swing 2/2 confirmado ANTES de la barrida, mismo ciclo C1/C2/C3; puede ratificarse en C2 o C3 conforme a las condiciones de cierre.
6. MSS M5 auxiliar; FVG H1/H4, PDH/PDL e Inside Bar son CONTEXTO, NO sustitutos de MSS M15.
7. Datos incompletos, huecos no justificables, divergencia de proveedor, no-repaint pendiente, estado invalidado, o C2 provisional: NO PUSH.
8. Mostrar solo CRT vigente y mantener panel/gráfico/backend coherentes.

Horarios C1 en America/New_York con DST:
- Forex y metales clasificados como FX: C1 01 → C2 05 → C3 09; C1 05 → C2 09 → C3 13; C1 21 → C2 01 → C3 05.
- Índices: C1 02 → C2 06 → C3 10; C1 06 → C2 10 → C3 14; C1 22 → C2 02 → C3 06.
- Riesgo: V34.9 puede tener modo predeterminado Todas las H4 NY; QA debe usar Solo C1 de tres horarios NY. Revisar default antes de integrar.
- BTCUSD consta como crypto en backend, SIN horario C1 aprobado; resolver expresamente, no inventar el de forex.

Los 34 IDs exactos de qore-crt-alerts/src/instruments.mjs:
AUDJPY, GBPUSD, GBPJPY, XAUUSD, NDX100, SPX500, US30, BTCUSD, AUDUSD, USDCAD, USDJPY, EURUSD, USDCHF, NZDUSD, NZDJPY, NZDCHF, XAGUSD, AUDCAD, AUDCHF, AUDNZD, CADCHF, CADJPY, CHFJPY, EURAUD, EURCAD, EURCHF, EURGBP, EURJPY, EURNZD, GBPAUD, GBPCAD, GBPCHF, GBPNZD, NZDCAD.
Símbolos TV IC:/OANDA: no constituyen licencia de un feed externo ni homologación FundedNext MT5.

## 4. Pine existente: no reinventar

- V34.8 M4B incorporó PDH/PDL y barridas NY al dashboard.
- V34.9 M5A integrado incorporó FVG de contexto H1 (12 M5 completas por H1) y H4 (48 M5 completas por H4), tres velas TF cerradas, detección bullish/bearish estricta, 10 FVG por TF/activo, dedup y NO gate CRT.
- V34.10b M5B candidato incluye formedAt, firstTouchAt, maxPenetration 0..1, lastEvaluatedEnd, estados INTACTO/PARCIAL/LLENADO_TOTAL/INVALIDADO/DATOS_INCOMPLETOS; supervisión de gaps y flags session.islastbar/isfirstbar. Sin validación TradingView, NO integrado.
- Candidatos adicionales aislados: CRT_RADAR_PRO_V34_10B_QA_TRES_CICLOS_NO_INTEGRADO.pine, CRT_RADAR_PRO_V34_10B_QA_ALERTAS_RATIFICADAS_NO_INTEGRADO.pine, CRT_RADAR_PRO_V34_10B_QA_FVG_OBSERVABILIDAD_NO_INTEGRADO.pine y QA_C2_BARRIDA_ESTRICTA. No fusionar a ciegas.
- Guías: crt-radar-pro/docs/HANDOFF_MAESTRO_CRT_RADAR_PRO_V34_9_M5B_2026-10-31.md, QA_PINE_V34_10B_ALERTAS_2026-10-31.md, QA_FVG_DATA_WINDOW_V34_10B_2026-10-31.md.
- Auditar Issue DeepSeek #54: https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/54
- Riesgo serio: request.security(..., "5", f_engine()) en gráficos M15/H4 puede devolver una muestra intrabar por vela anfitriona; probar consumo de solicitudes y coherencia histórico/tiempo real. Las pruebas JS no compilan Pine.
- Casos prioritarios: EURCAD/GBPAUD (líneas/MSS discutidas), EURUSD, GBPUSD, XAUUSD y NAS100USD; comprobar M5→M15→H4, DST, fines de semana FX, feriados, RTH/ETH índices, CFDs y proveedor sin flags de sesión.
- Solo cuando el propietario lo autorice se integra candidato validado en oficial.

## 5. Backend existente y rutas exactas

Carpeta qore-crt-alerts/src:
- instruments.mjs: inventario 34, feedSymbol NULL y feedStatus UNVERIFIED.
- contracts.mjs: OHLC M5 UTC cerrado.
- closed-m5-ingestion.mjs: guardas de gaps, duplicados, stale, offline.
- ny-clock.mjs: calendarios y ventanas C1 NY con DST.
- aggregate.mjs: M5→M15/H4 consecutivas completas.
- crt-h4.mjs: C1/C2/C3 estricto.
- mss-m15.mjs: swing 2/2, M15 confirmado antes de barrida, misma C1.
- mss-m5.mjs: contexto de swing M5.
- replay-cycle.mjs: ciclo total offline.
- signal-gate.mjs: CRT ratificado + MSS M15; sendPush:false.
- parity-audit.mjs: 12 campos Data Window y SHA256 de velas.
- observation-ledger.mjs: observación inmutable, dedup/fingerprint, en cuarentena.
- notification-preview.mjs: sobre de mensaje simulado certificado=false, transport DISABLED.
- device-registration.mjs: QA in-memory con Auth/AppCheck inyectados, HMAC, opt-in, FID rotación, revocación/caducidad.
- firebase-admin-verifiers.mjs: Firebase Admin adaptador de verifyIdToken con revocación y verifyToken App Check consumible, SIN inicialización de Firebase real.
- qa-device-http.mjs: HTTP en loopback GET/POST/DELETE; límites JSON/rate-limit, sin ruta de envío.
- pg-qa-device-registry.mjs: adaptador parametrizado pg.query con CAS; erroes SQL esperados 409, fallos internos 503; no DB externa.
- fcm-delivery-policy.mjs: SOLO simulador de errores FCM/backoff, NO remitente.

Pruebas y contrato:
- qore-crt-alerts/README.md
- qore-crt-alerts/docs/PINE_PARITY_CAPTURE.md
- qore-crt-alerts/docs/QA_DEVICE_HTTP.md
- qore-crt-alerts/docs/PG_DEVICE_REGISTRY.md
- qore-crt-alerts/docs/HTTP_PG16_REAL_CI.md
- qore-crt-alerts/scripts/compare-parity.mjs
- qore-crt-alerts/scripts/ci-postgres-http-e2e.mjs

Comandos reproducibles desde raíz del repo:
- cd qore-crt-alerts && npm test
- cd qore-crt-alerts && npm run parity -- dataset.json pine-capture.json
El segundo exige datos M5 y 12 campos Pine REALES; MATCH_UNCERTIFIED jamás significa certificación operativa.

## 6. PostgreSQL y CI — implementado y límite de seguridad

Migraciones NO APLICADAS a Supabase/Railway:
- sql/001_quarantined_observations.sql: replay solo, FORCE RLS, BLOCKED_NOT_CERTIFIED y rechazo conflicto de OHLC.
- sql/002_qa_devices_blocked.sql: tabla device handle/FID hash, consentimiento, revocación, expiración 30 días, delivery bloqueado.
- sql/003_qa_device_revision.sql: compare-and-swap revision para alta/rotación y revocación, doble solicitud/histórico bloqueado.
- sql/004_ephemeral_http_role.sql: rol NOLOGIN qore_crt_http_qa y RLS para servidor SOLO QA, separado de observaciones. Es un artefacto de CI, NO aplicar literalmente a infraestructura productiva.

Workflow .github/workflows/qore-crt-alerts-http-postgres-e2e.yml:
- Arranca PostgreSQL 16 efímero; rol test sin superusuario ni BYPASSRLS.
- Node HTTP sobre 127.0.0.1 + cliente pg real.
- 12/12: crear, duplicados, listado por usuario, dos rotaciones concurrentes (solo una), otro usuario no revoca, App Check inválido, opt-out y no reactivación, no accesos al ledger, sendPush:false.
- Códigos 409 de conflicto CAS sin fuga de detalles y 503 para DB no disponible.
- Los errores SQL que aparecen en logs son los rechazos EXPECTED y no significan fallo del E2E si Action está verde.

Riesgo crítico: el rol de servidor tiene acceso a tabla device detrás de RLS del mismo rol. NUNCA entregar contraseña/URL a app móvil o browser. La API actual solo se diseñó para LOOPBACK; no publicar abierta en internet ni reutilizar los secretos de otro proyecto. Requiere TLS/gateway, roles mínimos reales, rate limit distribuido, backups, migraciones revisadas y autorización para STAGING.

## 7. Android Kotlin existente

Carpeta qore-crt-alerts/android:
- com.qore.crtalerts.qa; compile SDK 36, target 35, JDK17, Gradle9.6, AGP9.5 en CI.
- MainActivity.kt: estado desactivado, preferencia LOCAL de interés en futuras alertas, botón para borrarla.
- QaConsentGate.kt: compuertas independientes: interés, BuildConfig, inscripción verificada, Pine certificada, permiso Android.
- QoreMessagingService.kt: FirebaseMessagingService, onNewToken NO registra token; verificación de mensajes + gate.
- NotificationPolicy.kt: esquema, CRT_MSS M15, eventId, símbolo, dirección, sha; no confundir campo certified:true con prueba criptográfica.
- AndroidManifest.xml: firebase_messaging_auto_init_enabled=false, firebase_analytics_collection_enabled=false, receiver no exportado; POST_NOTIFICATIONS declarado, NO solicitado.
- BuildConfig.STAGING_NOTIFICATIONS_ENABLED=false; en QA serverEnrollmentVerified=false y tradingEngineCertified=false. No se puede enviar/mostrar push real.
- Tests: NotificationPolicyTest.kt, QaConsentGateTest.kt, QaNotificationPipelineTest.kt; GitHub testDebugUnitTest y assembleDebug PASS.
- NO proyecto Firebase, google-services.json, tokens FCM, notificaciones recibidas, APK firmado para release ni test físico verificado.

**No confundir guardar preferencia local con consentimiento para Firebase**, FID, permiso Android o señales LIVE.

## 8. Trabajos pendientes en orden de máxima prioridad

### A. Pine / TradingView / certificación

A1. Compilar realmente el candidato Pine v6 en TradingView; guardar mensaje exacto del Pine Editor, versión SHA, entrada Solo C1 de tres horarios NY y plan/límites de request.security. No afirmar compilación por análisis estático.
A2. Reparar errores Pine en candidatos separados; no tocar oficial sin autorización; mantener CRT tres H4, barrida estricta C2 y MSS M15 2/2 previo a barrida, sin futuro.
A3. Demostrar sincronización M5/M15/H4 en gráfico, panel y backend. Nivel CRH/CRL = C1; MSS = swing congelado. Gráfico EURCAD y GBPAUD obligatorios.
A4. Auditar FVG M5B H1/H4, mitigación y pausa de sesiones sin false positives; debug Data Window y CSV, no dibujos FVG inventados.
A5. Capturar EXACTAMENTE 12 campos Pine QA Data Window y OHLC M5 del MISMO proveedor, sellado SHA. Guía PINE_PARITY_CAPTURE.md; comparar ciclo C2 cerrada/C3 en curso. Diferencias registradas con evidencias, no silenciadas.
A6. Verificar no-repaint, DST y cobertura 34/34, incluyendo límites operativos de la plataforma. Resolver BTCUSD crypto sin horario atribuido.
Salida de A: evidencia de compilación REAL, QA de paridad y matriz instrumento×sesión, no solo más tests JavaScript.

### B. Feed M5 y backend continuo independiente de TradingView

B1. Elegir proveedor autorizado/licenciado tras revisar disponibilidad y coste para 34 instrumentos; comprobar tiempo NY, broker, símbolos, derecho de distribución y cierre H4. No inventar continuidad con FundedNext.
B2. Implementar cliente/provider plug-in con historical backfill, streaming o polling de barras M5 cerradas, normalización UTC y verificación finality, timeouts, retries y métricas.
B3. Sincronizar histórico de al menos C1+C2+C3 más M15 previo al barrido; sin velas ficticias, huecos no justificables ni memoria futura.
B4. Migrar lógica actual de replay a pipeline continuo con estado persistente/idempotente y re-evaluación ante datos tardíos, sin anticipar señales.
B5. Certificar por instrumento mapeo, spread/timestamp, horario, fidelidad frente a Pine y latencia medible. No declarar 34 disponibles por tenerlos en INSTRUMENTS.

### C. Firebase STAGING / consentimiento / Android

C1. Configurar proyecto propio Firebase STAGING, app QA, Firebase App ID (no equivale a package name), Auth real, App Check real y FCM, usando gestor de secretos; no pegar claves en chat ni en repositorio.
C2. Vincular firebase-admin-verifiers.mjs a SDK configurado, exigir ID token válido/no revocado y App Check limited-use consumible. Controles de audiencia/proyecto y contra replay.
C3. Diseñar inicio de sesión/registro Android, opt-in legítimo, aviso de privacidad y permisos POST_NOTIFICATIONS solo cuando corresponde. El toggle local actual no es autorización técnica.
C4. Enrolar FID/FCM token en HTTPS autenticado, cifrado en servidor, rotación, expiración, opt-out revocable, logout y limpieza UNREGISTERED; jamás exponer token en logs.
C5. Crear gateway con TLS y servidor STAGING seguro. La API actual solo acepta loopback; NO hacerla pública quitando guardas sin revisión.
C6. Tras autorización expresa para prueba en STAGING, enviar primero un mensaje SINTÉTICO de laboratorio a teléfono real, comprobar foreground/background/Android13+/permisos/revocación. Mensaje de prueba NO significa señal CRT certificada.
Salida de C: prueba física autenticada de FCM sintético y evidencia de revocación, no señal comercial.

### D. PostgreSQL STAGING / API / outbox y operación

D1. Aprobar y provisionar instancia PostgreSQL16 STAGING independiente; revisar 001-004 antes de migrar, porque 004 es rol de CI. Roles mínimos, TLS, backups, rollback y secreto protegido.
D2. Integrar pg-qa-device-registry a la DB real bajo servidor autenticado, añadir API HTTPS, auditoría sin PII/tokens, rate-limit distribuido y seguridad de sesiones.
D3. Diseñar almacenamiento cifrado de token FCM y relación usuario-dispositivo, con consentimiento y exclusión. La tabla actual solo guarda FID hash: no permite push real.
D4. Implementar outbox transaccional de eventos certificados, clave de idempotencia evento+ciclo+dispositivo, locks/leases, cola, backpressure, retry/backoff/jitter, limpieza token, estados y telemetría.
D5. Implementar remitente Firebase Admin real pero DESACTIVADO hasta certificación/gate. Separar permisos de cuarentena y transportes; un payload certificado:true es texto no confiable, nunca activa FCM por sí solo.
D6. E2E STAGING de API→PG→outbox→FCM sintético, concurrencia, crash/restart y no duplicación. Monitorear latencia y costes.
Salida de D: almacenamiento y transporte seguros en STAGING, NO despliegue LIVE.

### Integración A+B+C+D y aceptación final

Cadena de PRODUCCIÓN FUTURA, sin habilitar aún:
Proveedor M5 licenciado → OHLC M5 cerrado → agregado H4/M15 → CRT C1/C2/C3 ratificado → MSS M15 de mismo ciclo → paridad Pine aprobada → evento único PostgreSQL → outbox autorizado → FCM → dispositivo Android autenticado → recepción/historial/auditoría.

Probar y documentar:
1. CRT+MSS M15 válido, una señal por evento.
2. C2 provisional: cero avisos.
3. Solo MSS M5 sin M15: cero avisos.
4. C3 cierra y invalida: cero avisos, panel/estado coherente.
5. Datos incompletos / desalineación / mercado cerrado / BTC sin regla: cero avisos.
6. App Check inválido, sesión revocada, opt-out, permiso Android denegado: cero avisos.
7. Rotación token, dos solicitudes concurrentes, falla DB, red cortada: no duplicados.
8. 34 símbolos, DST/sesiones especiales, latencia/frescura y no-repaint.
9. Evidencia Pine Editor + dataset M5 + paridad + SQL externo + FCM en teléfono real.
10. Solicitar autorización separada del propietario antes de merge, release/distribución o alertas LIVE.

## 9. Defectos/riesgos a no ignorar

- Existe diferencia significativa entre V34.9 oficial y V34.10b candidato; no integrar sin orden expresa.
- TradingView M5 vía request.security puede producir estados diferentes al mirar gráfico M15/H4; no proclamar paridad por test sintético.
- Feed M5 con símbolo TV IC/OANDA no equivale automáticamente al broker FundedNext/MT5; registrar proveedor/sesión y precios exactos.
- MATCH_UNCERTIFIED del auditor de Pine no es certificación y la captura verificada es atestación del operador, no origen criptográfico.
- Los datos de un payload FCM con certified:true no prueban nada sobre la fuente ni el CRT; exigir autorización en el servidor.
- El rol PostgreSQL del HTTP es privado, no credencial Android. La migración 004 fue creada para CI. Nunca reutilizar secretos de otros proyectos.
- Rate-limit in-memory y registry in-memory son solo QA, no producción distribuida.
- Un FCM ping sintético puede probar recepción, pero no certifica señales de mercado.
- No activar FCM auto-init antes de consentimiento; no publicar APK QA como app final.
- No afirmar rentabilidad ni órdenes de trading: app de alertas, NO broker.

## 10. Coordinación con DeepSeek ante ambigüedades

DeepSeek no recibe información automáticamente. El arquitecto redacta prompt de copiar/pegar con:
- Issue #54: https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/54
- Archivo exacto, rama, SHA de blob, funciones y extractos numerados 40–60 líneas (evita truncamientos).
- Problema técnico concreto, expectativa de prueba y restricciones NO INTEGRAR.
- Exigir respuesta con línea/caso reproducible/parche mínimo/limitaciones de lectura.
El usuario entrega prompt a DeepSeek y devuelve respuesta; ChatGPT verifica cada hallazgo contra fuente REAL. No declarar que DeepSeek vio 1300 líneas si su visor truncó a 300. CI DeepSeek Harness PASS no reemplaza esa auditoría.

Prompt modelo: «Audita SOLO este fragmento numerado de Pine v6 y el SHA indicado. Busca barridas C2 estrictas, pivotes MSS M15 sin repaint, límites request.security, horarios DST, y flags de sesión FVG M5B. Enumera cada hallazgo con línea exacta, escenario reproducible, gravedad y parche mínimo NO integrado. Distingue código no visto; no afirmes compilación ni activación LIVE».

## 11. Autorizaciones/datos externos que realmente faltan

- Elegir y autorizar feed M5 con derechos para 34 instrumentos y soporte de sesiones/calendario.
- Capturas reales de compilación Pine y Data Window con OHLC exportado del mismo proveedor.
- Configurar proyecto Firebase STAGING separado y secrets Admin/App Check; no se han comprobado.
- Base PostgreSQL STAGING y hosting HTTPS separado; migraciones revisadas y orden de aplicar.
- Teléfono de prueba Android y consentimiento para mensajes sintéticos en STAGING.
- Decidir tratamiento BTCUSD y mapeos no homologados; no inventar.
No detener toda la ingeniería esperando estos datos: avanzar en CI, seguridad, adapters y pruebas reproducibles en ramas aisladas.

## 12. Criterio auténtico de «aplicación terminada»

La app Android instalada y autenticada permite gestionar consentimientos y símbolos; un feed M5 autorizado transmite barras cerradas; el backend detecta CRT H4+MSS M15 correctamente en los mismos datos que Pine; se produce un evento persistido e idempotente; el servidor seguro envía solo notificaciones certificadas y autorizadas; el teléfono las recibe sin duplicados y muestra estados/historial; las pruebas GitHub + Pine real + STAGING externo + dispositivo físico están documentadas y el propietario autoriza release.

**ESTADO ACTUAL: QA sólida, pero NO app de alertas reales. NO LIVE. NO merge.**

---

## 13. PROMPT COPIAR/PEGAR PARA EMPEZAR EL SIGUIENTE CHAT

Actúa como Arquitecto Ejecutivo Principal e Integrador A+B+C+D de CRT RADAR PRO y QORE CRT ALERTS. Tu misión es TERMINAR el indicador TradingView y la aplicación Android de alertas INDEPENDIENTES de TradingView; no más handoffs ni reconstrucciones.

Repositorio: https://github.com/mezas3238-hue/qore-deepseek-reviewer
PR DRAFT: https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/55
Rama: feature/qore-crt-alerts-contract-20261031
Documento obligatorio: qore-crt-alerts/docs/HANDOFF_MAESTRO_CRT_RADAR_QORE_ALERTS_EJECUCION_FINAL_2026-10-31.md

PRIMERO lee COMPLETO el documento en GitHub; luego verifica HEAD actual, PR y GitHub Actions. El estado base era 170/170 Node PASS, 12/12 HTTP→PostgreSQL16 real PASS y Android Kotlin PASS. Firebase Auth/AppCheck y FCM reales, fuente M5 autorizada, Pine Editor real, paridad de 34 activos y teléfono E2E siguen PENDIENTES.

Conserva V34.9 oficial de desarrollo y V34.10b solo candidato. No force push, no merge, no LIVE ni señales sin autorización. Respetar CRT tres H4 C1/C2/C3 con barrida estricta y MSS M15 confirmado del mismo ciclo; MSS M5/FVG/PDH/PDL son contextuales. Horarios NY DST: FX C1=01/05/21; índices=02/06/22. BTCUSD sin regla aprobada.

Divide y ejecuta en paralelo: A Pine/QA/paridad, B M5/stream/backend continuo, C Android/Firebase Auth+AppCheck/consentimiento, D PostgreSQL STAGING/outbox/FCM/seguridad. Publica código nuevo, tests y enlaces a commits/CI en GitHub. NO presentar mocks como reales. Solicita solo los accesos y evidencias externas imprescindibles, sin detener el trabajo offline. Ante ambigüedades Pine redacta PROMPT COPIAR/PEGAR para DeepSeek y valida sus hallazgos contra GitHub.

El próximo trabajo debe implementar el bloque funcional más crítico con pruebas, no generar un nuevo handoff. Solo declara la app terminada cuando demuestres Feed M5 autorizado → Pine/paridad → evento CRT+MSS M15 → DB → FCM → Android físico con los mismos identificadores y sin duplicados.
