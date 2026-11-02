# CRT RADAR PRO V34.11N — objetivo funcional del propietario

**2 nov 2026 · QA solamente · NO LIVE / NO FCM / NO MERGE / NO ORDERS**

## Objetivo explícito

> El indicador vigila los 34 mercados y avisa **dónde se produce un CRT válido y si hubo MSS confirmado en M5 y M15**. Nada más debe ocupar la pantalla normal.

**Criterio de verdad**: el CRT es el requisito estructural; MSS M5 y MSS M15 son confirmaciones **separadas**, nunca se reutiliza M5 como M15 ni MSS de otro instrumento, ciclo o proveedor. Un CRT sin MSS15 debe continuar visible como CRT, con M15 «NO» (pendiente), no inventar una entrada.

## Taxonomía real heredada

El catálogo implementado tiene **7 roles de programación**; no se han documentado siete **estructuras de entrada** distintas verificadas:

| Rol | Significado | ¿En pantalla como CRT válido? |
|---|---|---|
| CRT_3C_REVERSAL | 3 velas, C1/C2 ratificado con C3 no invalidada | Solo si estructura H4 real vigente y válida |
| CRT_2C_CANDIDATE | C2 candidata antes del cierre ratificado | NO, provisional |
| CRT_2C_EXPANSION | Expansión / no retorno | NO, rechazo |
| CRT_INSIDE_RETURN | Inside Bar con retorno | QA estructural, no verde aún |
| CRT_INSIDE_CONTINUATION | Continuación no aprobada | NO, rechazo |
| CRT_MULTICANDLE | Multi4 / Multi-N | QA estructural, sin confundir variantes |
| CRT_M15_RETEST | Retest posterior al MSS M15 | QA confirmación, NO nueva estructura H4 |

Las cuatro morfologías visuales de base documentadas por Rowdy FX/DeepSeek son 2C, 3C, Inside y Multi-Candle. Se debe preservar la inspección de siete roles, pero **NO decir 7/7 modelos operativos certificados** solo por mostrar siete bits.

## Código nuevo sin tocar detector

`crt-radar-pro/CRT_RADAR_PRO_V34_11N_MONITOR_7_ROLES_CRT_MSS5_MSS15_QA_NO_LIVE.pine` conserva V34.11M como respaldo:
- `03 / Dashboard → Monitor simple: CRT 7 roles + MSS M5/M15 (QA)` ON por defecto.
- En móvil, columnas únicas: MERCADO / CRT 7 / DIR / MSS M5 / MSS M15 / ETAPA.
- Compacto: 2 CRT estructurales visibles (priorizar mismo-ciclo MSS15). Con `Ver los 34 instrumentos (expandir)`: **34 mercados**, 10 por página, y etiquetas de rol diagnóstico, sin líneas PDH/PDL.
- Para el «SI» de MSS5 y MSS15 exige estructura CRT **core válida**, mismo C1 y sweep, pivote anterior a sweep, ruptura posterior, fase nativa de la fuente en M5/M15; M15 además no puede ser futura frente al último M15 cerrado.
- Los 33 mercados no BTC con un rol estructural actual `3C`, `Inside Return` o `Multi-Candle` todavía **no homologado** aparecen como `QA H4` en compacto (ámbar, no señal verde), aunque el bloque de validación core permanezca cerrado. No ocultar el escaneo; tampoco confundir un bit QA con ratificación.
- Inside y Multi QA llevan `QA H4`, M5 `N/V`, M15 `N/V` o `QA`; nunca obtienen un ✓ verde de una confirmación core perteneciente a otro ciclo.
- Rechazos EXP/INS CONT, C2 provisional y retest M15 no producen CRT operativo ni MSS falso.
- Los 34 `input.symbol`, 34 solicitudes M5 por feed, `f_engine()`, las 48 M5/H4 cerradas, fases 0..4, DST NY y 60 `plot()` permanecen sin cambios.
- La opción original `QA: ver tiempos CRT/MSS de 1 instrumento` permite diagnóstico; la matriz original de siete categorías continúa accesible desactivando Monitor simple.

El JS `src/crt-seven-role-monitor-qa.mjs` expone un verificador offline con identidad de ciclo, M5/M15 independientes y salidas siempre `sendPush:false`. No hay llamadas a servidor, FCM, mercado ni operaciones.

## Puertas abiertas para terminar

1. **Pine Editor REAL**: compilar y cargar 11N en TradingView Android, probar los 34 símbolos, límites/memoria, panel compacto y expandido.
2. **Fuentes M5 idénticas por instrumento**: mismo broker y datos OHLC para Pine y Trader Lab; diferencias +1/+2 no implican alineación del feed con fuente distinta.
3. **Matriz 7 roles × 34 mercados**: demostrar detecciones reales por rol con ciclos, horarios, direcciones, variantes y controles negativos; no duplicar 2C/3C del mismo ciclo; demostrar el caso 3C, 2C, Inside, Multi4/Multi-N y retest M15.
4. **MSS5 y MSS15**: causalidad, pivote L2/R2 anterior a sweep, ruptura por cierre en timeframe propio y sin repaint.
5. **Holdout y Android**: test futuro no consultado, feed autónomo homologado y FCM E2E autenticado con consentimiento, sin activar hasta recibir certificación externa.
6. Mantener **NO LIVE** mientras `0/7` roles carecen de certificación exterior. Nunca llamar «completado» porque un dashboard vea 34/34 ni porque los tests unitarios estén verdes.

**Resultado esperado cuando se complete el producto**: “EURUSD · CRT 3C alcista · MSS M5 SI · MSS M15 NO”; actualización a M15 SI solo tras cierre M15 causal del mismo ciclo. Alertas Android solo con motor autónomo homologado e infraestructura aprobada.
