# QORE CRT — triage de 34 instrumentos y 151 intervalos M5 sin vela
**7 de noviembre de 2026 · IC Markets Global/Raw Trading Ltd · DEMO/STAGING · No merge, LIVE, órdenes, FCM ni alertas**

## Evidencia real
El PR #91 generó **600 M5 cerradas × 34 símbolos = 20.400** datos de cTrader DEMO, sin fallos de consulta. Fuente de los huecos: logs del deployment `5543e9fd-79b8-4a11-9635-944a2da6095c`, código `925b99fd43106e3065f66d82f4c010aa6c4d5086`, estructura saneada reproducida en `fixtures/real-ic34-600-m5-gap-observations-20261107.json`. No se han almacenado precios ni credenciales en el fixture.

**21 interrupciones** repartidas en **13 de 34** instrumentos, equivalentes a **151 intervalos M5 sin barras observadas**. Una interrupción puede deberse al cierre normal del producto, la ausencia de ticks o un fallo de datos. No convertir esos intervalos en velas sintéticas.

## Comparación contra horarios públicos del bróker

Fuente oficial IC Markets Global: https://www.icmarkets-global.com/en/trading-pricing/trading-hours

La página especifica:
- Índices **US30, US500 y USTEC**: pausa de `23:59–01:00` **hora del servidor**.
- Metales **XAU/USD y XAG/USD**: abren a `01:02` y cierran a `23:59` hora del servidor (viernes 23:57).
- **BTCUSD en cTrader**: lunes-jueves `00:05–23:59`, viernes `00:05–23:55`, sábado `00:45–23:59`, domingo `00:05–23:59` hora del servidor.
- Forex: `00:01–23:59` server (viernes 23:57).
- El propio bróker aclara que los horarios exactos aplicables deben consultarse en la **cuenta/plataforma**, pues pueden cambiar.

En la muestra del 4–7 de noviembre de 2026, la hora del servidor está alineada con Nueva York +7 horas (servidor GMT+2 tras DST de EE. UU.). Los datos publicados son un **criterio para hipótesis**, no certificación del calendario particular de la cuenta DEMO.

| Categoría de la triage | Interrupciones | Intervalos M5 |
|---|---:|---:|
| Coinciden con ventanas horarias publicadas (**candidatas**, no certificadas) | 13 | 132 |
| No se explican por las ventanas publicadas; requieren prueba adicional | 8 | 19 |
| **Total observado** | **21** | **151** |

El auditor puro clasifica como **candidatos** las 10 pausas diarias de metales/índices entre `22:00–23:00 UTC` del 4–5 de noviembre (correspondientes a medianoche–01:00 servidor), dos pausas BTC de cinco minutos y el cierre de viernes 23:55 servidor hasta el sábado 00:45 servidor.

Quedan **8 interrupciones sin explicar**:
- **BTCUSD:** sábado 7 nov `09:25–10:15 UTC` (10 intervalos M5), no coincide con las ventanas publicadas para ese sábado; requiere contraste con mantenimiento o sesión real del producto.
- **Forex:** GBPUSD (1 M5), AUDUSD (1), USDCAD (1), USDJPY (1), USDCHF (3), NZDUSD (1) y NZDCHF (1). Algunas ocurren cerca del cambio de jornada, pero fuera de la pausa mínima publicada. No declarar `normal` sin logs de cotizaciones/sesión.

**Importante:** un resultado `PUBLISHED_SCHEDULE_MATCH_CANDIDATE_QA` no elimina el hueco ni da permiso para crear eventos CRT o MSS alrededor de esas marcas horarias. Los indicadores deben saber que el mercado se detuvo y que no existe información causal durante el intervalo.

## Reproducibilidad y controles
- `npm run audit:34-session-gaps` ejecuta auditoría offline a partir del fixture saneado; no accede a Railway ni a credenciales.
- Tests garantizan 34/34 ID nativos, 600 M5 por símbolo, marcas UTC y duraciones coherentes; rechazan duplicados, precio implícito, cambios de fingerprint y horarios imposibles.
- El estimador de tiempo servidor usa America/New_York +7 horas para verificar la coincidencia de ventanas por invierno/verano; no garantiza que una excepción del broker se aplique al día real.
- `all34SessionCalendarsCertified=false`, `sourceParityCertified=false`, `crtFamiliesCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`, `canTrade=false`, `sendPush=false`.

## Puertas siguientes
1. Confirmar las sesiones individuales desde la especificación del símbolo **en la propia cuenta cTrader DEMO** (no solo web pública), incluyendo BTCUSD y DST.
2. Comprobar M15 y H4 reales contra agregados causales en los 34, sin forzar anclas ni llenar intervalos; comparar sesiones y cierres de mercado.
3. Alinear siete categorías CRT exactas y MSS M5/M15 independientes con el indicador aprobado, holdout/no repaint y contrastes positivos/negativos.
4. Conectar el gateway Android y widget únicamente con eventos certificados y TTL cuatro horas; nada de LIVE ni notificaciones mientras tanto.
