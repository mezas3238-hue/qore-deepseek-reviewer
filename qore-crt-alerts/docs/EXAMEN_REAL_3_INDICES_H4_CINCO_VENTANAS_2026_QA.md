# QORE CRT — examen REAL del reloj H4 por estaciones en índices (cTrader DEMO)
**Corte:** 7/8 noviembre 2026. **Alcance:** inventario de 34 instrumentos, investigación adicional de las H4 nativas de USTEC, US500 y US30. **NO MERGE / LIVE / ÓRDENES / FCM / PUSH / VPS.**

## Problema y evidencia verificable anterior
- En PR #95 se constató con datos reales de IC Markets DEMO: **34/34** símbolos auditados; 358 H4 completas compartían timestamp en las dos reconstrucciones; 62 H4 completas solo aparecían en uno de los relojes; los únicos conflictos eran USTEC, US500 y US30.
- En esos tres índices, la fase H4 nativa observada en noviembre era **UTC 120 min módulo H4**, frente a **UTC 180 min** en la reconstrucción H4 con las C1 de metodología `C1_HOURS.index=[2,6,22]` NY.
- No es lícito renombrar el calendario, cambiar C1 ni interpolar velas para hacer coincidir los dos relojes. Coincidencia OHLC en bloques con horas nativas no prueba paridad de eventos del indicador Pine.

## Nuevo examen auténtico de calendario: cinco períodos de 2026

El modo de solo lectura se activa *únicamente* bajo la bandera exacta

```text
QORE_CT_QA_INDEX_H4_SEASONS_2026=OWNER_APPROVED_INDEX_H4_SEASONS_READONLY_QA
```

y exige conservar las banderas originales de DEMO: `QORE_CT_STAGE=DEMO`, `QORE_CT_OAUTH_SCOPE=accounts`, `QORE_TRADING_ENABLED=false`, `QORE_PUSH_ENABLED=false`, `QORE_CT_QA_COHORT34=OWNER_APPROVED_FULL_34_DEMO_M5_QA`, `QORE_CT_QA_COHORT34_PAGES=2`, `QORE_CT_QA_NATIVE_ALL34_TF=OWNER_APPROVED_34_NATIVE_M15_H4_QA`, `QORE_CT_QA_M5_CSV_EXPORT=DISABLED`. No se cambia el comando del worker ni se crean credenciales nuevas.

Primero se autentica el mismo manifiesto nativo completo de 34 nombres e IDs, con SHA256 `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`. Cada uno de los 34 sigue recibiendo su consulta normal de 600 M5 cerradas, M15 y H4 nativas, y su diagnóstico CRT/MSS (si está habilitado). **Solamente para los tres índices** se agregan **cinco solicitudes H4 históricas acotadas** por símbolo, cTrader Open API VIEW `period=10, count<=48`, sin retries automáticos.

| Ventana temporal UTC | Propósito |
|---|---|
| 23 febrero–2 marzo 2026 | Invierno antes de DST de marzo |
| 16–23 marzo 2026 | Después de DST de marzo |
| 6–13 julio 2026 | Verano |
| 19–26 octubre 2026 | Antes del cambio DST de noviembre |
| 2–7 noviembre 2026 | Después del cambio DST de noviembre |

El mensaje `ProtoOAGetTrendbarsReq` limita la cantidad de velas respecto de `toTimestamp`; las respuestas reales devolvieron registros anteriores a `fromTimestamp` en la primera consulta. El validador ahora conserva un **conteo explícito de H4 descartadas por estar antes del inicio**, siempre dentro de una tolerancia histórica acotada de 14 días, y calcula las fases **exclusivamente** con las velas abiertas dentro de la ventana solicitada. Las barras posteriores al final, futuras o demasiado antiguas siguen bloqueadas. Fuente técnica: https://help.ctrader.com/open-api/symbol-data/ .

Cada ventana registra solo el **número de H4 cerradas, fase UTC módulo cuatro horas, horas de apertura NY y conteos de H4 que caen en horas C1 actuales vs horas adyacentes no autorizadas**. Las H4 sin datos o ventanas mixtas por transición DST quedan clasificadas como bloqueadas; no se fabrican barras ni precios. Esta nueva muestra es de aperturas H4, no reconstrucción M5/H4 completa de meses anteriores.

## Criterio de seguridad y pasos siguientes
- El origen de la sesión cTrader exige autenticación DEMO + SCOPE_VIEW, bróker Raw Trading Ltd, símbolo nativo exacto y callbacks correlacionados de read-only. Máximo 2 sesiones simultáneas.
- Las consultas históricas están fijadas a períodos del pasado. No hay parámetros arbitrarios para que el modo amplíe mercados, solicite LIVE o envíe órdenes.
- Es necesario verificar con los resultados reales si la fase H4 **cambia con la estación** y si ese cambio coincide con la definición aprobada de C1. No concluir antes de que Railway devuelva 34/34 y las 15 ventanas completas.
- Cualquier solución futura de reloj requiere decisión metodológica explícita; las pruebas de estas cinco ventanas no modifican `ny-clock.mjs`.
- El estado sigue `clockCertified=false`, `sourceParityCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`, `sevenCrtRolesCertified=false`, `canTrade=false`, `sendPush=false`.
- También falta el cotejo evento a evento con Pine para los 34 instrumentos, positivos y negativos MULTI4/MULTI_N, no repaint, holdout, y E2E app/widget con TTL 4 horas.

**GitHub fuente soberana, PR DRAFT hasta autorización de merge.**
