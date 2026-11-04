# Contraste experto externo H01-H26 — CRT V34.12I, 2026-11-02

**QA, NO CERTIFICANTE.** Auditor externo recibió copia cortada del RADAR en `int audit`. Revisión independiente del código **completo** de la rama `feature/crt-v34-11a-seven-catalog-34feeds-20261102` en PR #74. HEAD antes de cambios: `4924e34963dd7aece4dd44663b9ece1a8887acd0`.

| Hallazgo | Dictamen y acción |
|---|---|
| H-04 Radar truncado | **Error de transferencia**, no de GitHub. Archivo íntegro 2.834 líneas, incluye UDT `Signal`, `f_engine`, `Signal.new`, loop 34 y dashboard. **Aun no compilado Pine real.** |
| A.1 | No probado como bug: en Pine v6 un `bool` nunca es `na`; mantener guarda explícita como CLARIDAD, no “fix”. |
| A.2 | El MSS terminal se computa cuando el gráfico abre a 04:00 y procesa M5 03:55; en 04:05 se extrae antes de limpiar. NO mover bloques sin evidencia. |
| H-01 | Cabecera stale “BTCUSD-only default” falsa; Radar A escanea 34 por defecto, Chart B usa solo ticker abierto. **Cabeceras corregidas.** |
| H-05 | Chart B heredó 19 inputs inoperantes, incluyendo dos de alertas sin `alert()` ni `alertcondition()`; opciones de dashboard no producen dashboard. **Eliminadas sólo en B** (18 inputs reales conservados). Radar A mantiene escaneo/inputs. |
| H-08 | Diagnóstico H4 erróneo: TradingView documenta 4H como periodo 240 minutos e intradía; `timeframe.isintraday` es true. `visualChartAligned` puede impedir el dibujo si la H4 del broker no coincide con NY. |
| H-13 | `Signal.new` 132 campos sigue deuda de mantenimiento, **prueba de paridad y conteo ya existe**, no afirmar que no hay test. |
| H-18 | Un C2 provisional puede vivir en motor, pero `chartCoreC1` exige `own.phase == 2`, `isPatternValid` y `modelKind == "CRT_2C_RETURN"`. No se le da etiqueta “RAT” mientras sea provisional en el dibujo. |
| H-07, H-11, H-12, H-15, H-17 | Limitaciones históricas, fases y sesiones de CFD/DST, cálculo de memoria por 34 feeds: **riesgos plausibles todavía no certificados**, no aplicar reglas de calendario inventadas. Se requiere mismo broker, datos reales y memoria medida en Pine. |
| H-19, H-21 | 2C/MSS en C2 y TRUE 3C con barrida en C3 son **familias diferentes**; conservar identidad. “MSS C2 heredado” se publica tras ratificación de C2, pero verificar causalidad de precios/tiempos con replay real. |
| H-03, H-06, H-14, H-16, H-20, H-22–H-26 | Mantenimiento, diseño, o controles existentes sin bug reproducido: no refactor de riesgo antes de Pine real. |

## Alcance exacto de cambios
1. Radar A: sólo cabecera; **ni el escaneo 34 ni el motor fueron modificados**.
2. Chart B: sólo cabecera y 19 inputs heredados sin efecto, `scanAll` derivado y grupos vinculados; retiene motor, precios, líneas, MFA de pivotes, fase M5 por proveedor y audit FVG. No incorpora alertas.
3. Prueba estática específica anti-regresión y ajuste de test anterior que suponía un interruptor de alertas funcional en Chart B.
4. No se cambiarán límites de memoria, sesiones CFD ni DST basándose sólo en cifras sin observar un broker/sesión.

## Puertas todavía pendientes
Compilar **ambos** en TradingView Pine Editor v6, medir errores `Memory limits exceeded`, recuperar H4 de BTC y 33 feeds equivalentes con licencia, 48 M5 H4 reales, medir A↔B↔Trader Lab, solucionar MSS M15 Multi4 y FCM dispositivo físico. El informe externo **no ejecutó** ninguno. PR #74 DRAFT / NO MERGE / NO LIVE / NO PUSH.

Fuente oficial: https://www.tradingview.com/pine-script-docs/concepts/chart-information/ y https://www.tradingview.com/pine-script-reference/v6/
