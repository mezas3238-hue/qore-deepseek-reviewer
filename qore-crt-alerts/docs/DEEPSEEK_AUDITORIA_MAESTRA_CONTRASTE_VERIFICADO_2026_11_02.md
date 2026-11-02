# Contraste verificable de la Auditoría Maestra de DeepSeek
**Fecha:** 2026-11-02 (hora PYT) · **Fuente:** GitHub conectado, PR #74 DRAFT, rama `feature/crt-v34-11a-seven-catalog-34feeds-20261102` · **Estado:** QA / NO LIVE / NO PUSH / NO MERGE.

## A. Evidencias demostradas desde el repositorio

Archivos exactos:
- **A:** `crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_H_6_FILAS_PRIORITARIAS_QA_NO_LIVE.pine` (2578 líneas, blob SHA `2b7f1a9ae2fbdcbfca79c14e6738c9bc367bf627`).
- **B:** `crt-radar-pro/QORE_CRT_CHART_B_C1_MSS_V34_12_QA_NO_LIVE.pine` (2204 líneas, blob SHA `0b23b9c639a9645f32d31bebf11eb0c2a3fe2955`).
- **D:** `crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_D_AUDITORIA_FAMILIAS_QA_NO_LIVE.pine`.
- **E:** `crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_E_CIERRE_EXACTO_3C_INS_QA_NO_LIVE.pine`.

1. A y B son **dos scripts separados**, cada uno con su `//@version=6` y único `indicator()`. Una concatenación realizada al copiar a DeepSeek NO es el contenido de ninguno de estos archivos.
2. **Identidad byte a byte** en A/B de los bloques `type Signal`, `f_engine() =>` hasta `f_engine_snapshot() =>`, y del constructor completo `Signal.new(...)`. El tipo tiene **128 campos**, y el constructor **128 argumentos** (no 126). Posición constructor A aproximadamente línea 1982, B línea 1979. **No se debe pegar uno encima del otro como «reparación»**: ya coinciden.
3. **D→E:** byte idéntico `f_engine()`, `type Signal`, `Signal.new()` y todo el bloque antes de `// QA 34x5 historical family matrix` salvo título de indicador y nueva opción `qaHistoryFollowChart`. Todo el código después de `// Ranking 0=both MSS` es byte idéntico. La diferencia funcional es **solo en la vista histórica** (selector broker y comparación de timestamps). No está probado por qué los contadores históricos fueron 34/9/15/4/2, luego 8/3/3/1/0, luego se recuperaron con F.
4. **Extra-family MSS M15:** en A ~línea 2219 se calcula `family15QA` con `s.extraFamilyM15C1 == s.extraFamilyC1`, `s.extraFamilyM15PivotAt < s.extraFamilySweepAt`, ruptura `s.extraFamilyM15At > s.extraFamilySweepAt`, validación `f_m15_phase_ok` y `s.extraFamilyM15At <= s.qaLastClosedM15At`; en ~2220 se guarda `extraM15Flags`. El render ~2533 **lee el flag ya validado**. Los arrays `qaExtraPivot15AtBySlot`, `qaExtraSweepBySlot`, `qaExtraBreak15BySlot` y `qaExtraRatBySlot` **ya existen**, pero añadir el parche de DeepSeek al render como si el pivote no se comprobara sería redundante e introduciría una ventana de 4 h arbitraria respecto de la regla actual. Necesitamos test causal por familia, no otro filtro inventado.
5. **No suprimir bit Inside del catálogo** mediante `dual3CInside ? 0 : bit8`: la máscara es auditoría de dos geometrías, no autoriza por sí sola dos alertas. La deduplicación de señales debe hacerse por **identidad concreta de evento** (fuente, familia según política de prioridad, C1, dirección, cierre H4), con confirmación previa de la misma geometría y no por fecha DD/MM. Las seis coincidencias históricas `3C=INS:6` son pendientes de inspección de C1 y OHLC.
6. El fallo **CE10295 fue visto en captura V34.11S**, antiguo script unido, no en A/H y B por separado. No se ha mostrado error CE10295 en H o B. El número de líneas de `f_engine()` no prueba causa de CE10295 en el *main body*. Según documentación Pine v6, refactorizar funciones requiere respetar scopes, llamadas global-only y variables persistentes. **No dividir el motor experimentalmente sin compilación real y pruebas de equivalencia.**
7. `bar_index[0]` NO mide la primera vela disponible: es la barra actual. Para diagnosticar la variación de históricos hace falta registrar primer y último timestamp **dentro de cada fuente M5**, recuento real y mismo broker/ajustes, en ejecuciones repetidas con comparación exacta.
8. Las cuatro familias estructurales que el código distingue son **2C, 3C verdadero, Inside Return, Multi (4/N)**. La máscara de siete bits agrupa también estado provisional 2C, expansión rechazada, Inside Continuation y retest M15. Las siete familias morfológicas reclamadas NO están certificadas, ni se deben atribuir a Rowdy FX sin verificar todas las láminas relevantes.

## B. Evidencia de pruebas
- Último commit comprobado del PR: `05c5b10200c7c12bdb489232da67a531578ab5da` (DRAFT).
- Foundation offline GitHub Actions #41546510874: **698 tests, 698 PASS, 0 FAIL**.
- El Harness, Pine **offline para V34.10b** y compilación Android QA reportan SUCCESS para ese SHA, pero **NO certifican compilación Pine Editor real de A/H ni de B**, paridad de feed, ni FCM real.
- Los 34 feeds mostraron `R:34/34` en captura V34.12F; esto NO demuestra su rendimiento histórico consistente ni 34 señales CRT.

## C. No implementar sin evidencia
- Reescribir las 1.500 líneas del motor como cinco subfunciones sin una compilación real actual y regresión causal.
- Añadir un tercer `indicator()` a un solo archivo por un paste concatenado.
- Copiar un constructor de 128 argumentos sobre otro ya idéntico.
- Eliminar `categoryInsideReturn` del histórico porque comparte la misma hora H4 que 3C.
- Declarar error «M15 extra no valida pivote» cuando `family15QA` ya lo hace.
- Asumir que ventanas H4 de DST duran arbitrariamente tres o cinco horas: seguir el contrato explícito de sesiones NY con continuidad M5 y test de fechas DST reales.

## D. Puerta de salida y decisión de ingeniería
1. **Compilar A/H y B POR SEPARADO** en Pine Editor TradingView Basic. Guardar nombre de script, mensaje exacto, línea e imagen. No extrapolar CE10295 antiguo.
2. Si compilan, repetir un conjunto fijo de 34 feeds con mismo broker/inputs/ventana; instrumentar **timestamps M5 de origen por feed** solo si reaparece variación; no adjudicar causa sin reproducir.
3. Probar que cada modelo tiene C1/C2/C3, dirección, invalidez y MSS5/MSS15 causal independientes en mismo ciclo. Hoy **true3C/Inside/Multi MSS5/15 permanecen parcialmente QA o N/V**, especialmente los verdaderos 3C sin transporte Pine de MSS propio. No marcar señales como certificadas por un gráfico histórico.
4. Trader Lab con OHLC M5 del **mismo proveedor y ciclo**, DST, fuentes completas, negativos y holdout sellado. No presentar tests simulados como paridad real.
5. Android QORE CRT ALERTS: proveedor homologado + motor autónomo + FCM autenticado E2E real antes de PUSH.

**Conclusión:** Los defectos propuestos como «confirmados» para constructor A/B, paste de dos `indicator()` y pivote M15 extra **no están demostrados en el repositorio actual**. Las brechas materiales son compilación Pine real, reproducibilidad de históricos, certificación geométrica/MSS por familia y alertas Android. Mantener PR DRAFT.
