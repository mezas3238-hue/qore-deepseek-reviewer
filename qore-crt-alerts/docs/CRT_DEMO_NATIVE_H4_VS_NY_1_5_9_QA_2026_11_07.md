# QORE CRT — H4 native de cTrader frente a H4 Forex 1/5/9 Nueva York
**QA · 7 noviembre 2026. No merge, no LIVE, no operaciones, no FCM, no push, no producción.**

## Contexto comprobado
En Railway STAGING el worker autenticó IC Markets DEMO y obtuvo 600 M5 cerradas sin huecos, 200 M15 nativas con coincidencia exacta respecto a 200 M15 reconstruidas de tres M5, y 12 H4 completas reconstruidas de 48 M5 con anclas NY 1/5/9 (más un bloque parcial excluido). PR #88 y commit desplegado `d11682dd6940cdf240c34ba229e87367f482630f`.

## Nuevo examen H4 (PR hijo)
El protocolo oficial Spotware define `ProtoOATrendbarPeriod.H4 = 10`. Este módulo realiza UNA solicitud histórica adicional (`ProtoOAGetTrendbarsReq` = 2137, `period=10`, `count<=20`) **solo después** de validar la cuenta DEMO, el mismo símbolo nativo EURUSD ID 1, las 600 M5 cerradas, las 200 M15 derivadas y la coincidencia exacta de las 200 M15 nativas. El selector STAGING obligatorio es:

```text
QORE_CT_QA_NATIVE_M15_COMPARE=OWNER_APPROVED_NATIVE_M15_COMPARE
QORE_CT_QA_NATIVE_H4_AUDIT=OWNER_APPROVED_NATIVE_H4_PHASE_AUDIT
QORE_CT_QA_M5_CSV_EXPORT=DISABLED
```

La nueva auditoría NO presupone que las H4 nativas abran a las 1/5/9 de Nueva York. Identifica las fases UTC observadas y busca la intersección estricta de los timestamps de apertura de la H4 nativa y las 12 H4 NY reconstruidas. **No modifica timestamps ni fabrica paridad.** Las diferencias de fase se reportan como un hallazgo de incompatibilidad de anclas, no se compensan mediante un desplazamiento arbitrario.

Solo si coinciden los **12 timestamps** puede emitirse un candidato a coincidencia total OHLC. Aun entonces no equivale a TradingView `IC:EURUSD`, ni certifica CRT 7 familias, MSS M5, MSS M15, indicadores Android ni señales de mercado. Los cuatro valores OHLC se comparan sin tolerancia oculta (unidades de 1e-5).

El worker registra exclusivamente resumen técnico con fases/contadores/errores de comparación; **sin velas OHLC, secretos ni números de cuenta**. `canTrade=false`, `sendPush=false`, `sourceParityCertified=false` siempre.

## Protocolo para informes
- Si `CTRADER_NATIVE_H4_NY_OHLC_MATCH_QA`: anclas y 12 OHLC exactos coincidentes dentro de cTrader. No etiquetar como paridad TV.
- Si `CTRADER_NATIVE_H4_NY_OHLC_DIFFERENCE_QA`: mismos 12 inicios pero OHLC distintos. Fail closed.
- Si `CTRADER_NATIVE_H4_NY_CLOCK_MISMATCH_OR_INCOMPLETE_QA`: no confundir con un fallo de conexión; revisar fases observadas y cantidad de coincidencias. **Prohibido rephase** para forzar 1/5/9.
- Si `BLOCKED`: revisar contrato de cuenta DEMO, permisos VIEW, períodos H4/M15 o cierre de barras; no reintentar automáticamente.

## Próximas dependencias
Certificar la interpretación de sesiones/anchors de los 33 instrumentos restantes y BTCUSD por su ruta independiente; después los siete CRT y ambos MSS por eventos con evidencias de causación. La app/widget con TTL 4 h no recibirá señales reales hasta terminar esos gates. Mantener GitHub fuente de verdad y PR DRAFT.
