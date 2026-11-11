# REAUDITORÍA DEEPSEEK — QORE CRT 34 R4-A, CÓDIGO COMPLETO DISPONIBLE

**Fuente obligatoria:** repositorio `mezas3238-hue/qore-deepseek-reviewer`; consulta primero el índice de **20 partes literales**:
https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/qa/crt-34-v34-12x-integration-ci-20261109/crt-radar-pro/qa-integrated-34/for-deepseek/r4a-source/README_DEEPSEEK_R4A_SOURCE_COMPLETE.md

Fuente original Pine v6: `QORE_CRT_34_R4_AB_400_M5_AUTO_BUFFER_QA.pine`, Git blob SHA `693e3f49719e86e2ea0702f7b355af33bd0c4c7c`. Los 20 fragmentos reconstruyen BYTE POR BYTE las 3546 líneas físicas del mismo Pine. Si no puedes leerlos, solicita al Owner que adjunte el ZIP de código íntegro; NO infieras los bloques faltantes.

### Errores a subsanar en tu segunda auditoría
1. TRUE 3C es `3C TRUE QA`; su `qaTrue3CConfirmed` se consolida al **cierre completo de C3**; `mss5At` se puede confirmar mientras C3 sigue formándose, no después de ella según el bloque de seguimiento. La primera entrada no puede ser anterior al cierre de C3 y al MSS propio. Registrar bid/ask de primera vela ejecutable; prohibido copiar el precio anterior con hindsight.
2. Es incorrecto exigir en el Modelo B simultáneamente `phase==2`, `modelKind==CRT_2C_RETURN` y TRUE 3C, pues `CRT_2C_RETURN` es un circuito independiente. Formular dos máquinas de estados: A 2C RETURN ratificado + MSS15 propio, B TRUE 3C ratificado + MSS5 propio. Confirmar las condiciones exactas de cada estructura con líneas y expresiones.
3. La estrategia A usa barrida en C2; B usa barrida en C3. Los SL propuestos detrás del extremo de barrida + buffer ATR son hipótesis, NO están en el Pine. Derivar niveles con precios observables en el instante de la orden. No atribuir precios HL de C3 cerrada antes del cierre.
4. MSS propios de Inside y Multi-N/Multi4 sí están implementados (p.ej. `q4.mss5At`, `qaMultiNMss5At`, MSS M15), pero permanecen QA no operables sin validación; no afirmar "nunca tienen MSS".
5. Los 33 mercados no BTC permanecen en observación QA; `bool scanCrtValid = structuralCoreObserved and i == 7`. Se están evaluando hipótesis para todos los 34, no operando 34 mercados certificados.
6. La limitación de 400 M5 (~33h20 de velas continuas) impide usar el indicador como backtest de 2 años. Reproducir `f_engine` en replay secuencial con warmup, datos M5 por proveedor y evidencias de paridad exacta. `f_engine_snapshot()` solo emite la UDT en `barstate.islast`.
7. Mantener **holdout de 24 meses consecutivos sin exposición**. 2024–2025 solo es válido si está intacto: no usar 2024 en validación y holdout a la vez. No confundir hash de dataset con garantía de no haberlo usado.
8. Aportar para cada operación: qué había disponible en tiempo real, qué confirmó un cierre H4/MSS, timestamp legal de orden, bid/ask, SL válido, TP al lado correcto y costos; NO inventar evidencia, datasets ni tasas de acierto.

### Entregables, en este orden
A. Certifica lectura de 20/20 fragmentos y muestra el SHA del código reconstituido.
B. Tabla de ecuaciones exactas que activan A y B, con referencias a líneas 2026 y variables reales.
C. Primer instante legal para LONG y SHORT, y fórmulas completas de SL/TP como hipótesis congelables.
D. Análisis de ambigüedades donde los campos del `Signal` no bastan y se necesitan nuevos eventos de replay (solo QA, código Pine intacto).
E. Inventario **real y verificable** de velas y costos de los 34 feeds, sin simular disponibilidad de Kaggle/MT5.
F. Separación temporal inequívoca desarrollo / validación / holdout de 24 meses, más protocolo de congelación previa y ejecución única.
G. Si falta data o no puedes verificar paridad, veredicto **NO CERTIFICABLE** y lista exacta de impedimentos.

**Sin LIVE, sin trading automático, sin VPS, sin merge, sin editar el Pine original.**