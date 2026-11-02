# CRT Radar V34.12C — corregir lectura del dashboard de 34 mercados

**2 noviembre 2026 · PR #74 DRAFT · QA NO LIVE / NO PUSH.**

## Hallazgo basado en las 4 capturas de NZDJPY M15 del usuario

Las páginas P1/4 a P4/4 muestran `R:34/34` y varios mercados con `2C QA`, `MSS M5 QA SI`, `MSS M15 QA SI`. En concreto NZDJPY, NZDUSD, AUDNZD y CADJPY presentan QA SI/QA SI en las capturas; se trata de observaciones del panel, **NO** pruebas de paridad de feed ni señales certificadas.

El pie `M15:0 | QA:16` no contradice esas filas: M15:0 contaba solo Core y omitía los MSS en QA. También el panel ampliado ordenaba por índice fijo (34 slots), dejando los pares con 2 MSS dispersos por cuatro páginas.

**El usuario todavía NO había instalado los nuevos indicadores A/B en el momento de las cuatro capturas.** No confundir las capturas del script anterior con una prueba del nuevo Radar A.

## Cambio aislado en candidato para Radar A

Archivo **nuevo**, no sustituye el original:
`crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_C_PRIORIDAD_MSS_QA_NO_LIVE.pine`

- Mantiene íntegro `f_engine()`, `Signal`, 34 entradas `input.symbol`, scanner M5/H4, mismo proveedor por slot y bloqueo de alertas. No cambia el indicador B de líneas.
- Reemplaza únicamente el monitor A de 6 columnas `MERCADO / CRT H4 / DIR / MSS M5 / MSS M15 / ETAPA` y añade una función pura de extracción de tiempos `f_monitorOwnMss(slot)`.
- Ordena resultados por **1) ambos MSS M5+M15, 2) MSS M15 solo, 3) MSS M5 solo, 4) CRT 2C sin MSS, 5) otras estructuras 3C verdadero, Inside, Multi en QA, 6) sin CRT o rechazadas** (estas últimas solo en expandido). Se mantienen **34 símbolos** y las **4 páginas de 10** al expandir, pero ahora los pares interesantes quedan al principio. En compacto aparecen solo estructuras, nunca un rechazo.
- En pie de página los contadores quedan independientes: `C` CRT Core, `QA` estructuras QA, `M5q` MSS5 confirmado dentro de 2C QA, `M15q` MSS15 confirmado 2C QA **y** M15 independiente de familia extra con prueba, `M15c` MSS15 Core, `R` fuentes respondidas. Evita el pie confuso `M15:0` junto a MSS QA.
- `QA SI` en M5 y M15 solo si pivote anterior a barrida, ruptura posterior, fase nativa correcta M5 o M15 y cierre independiente M15 (dentro del mismo `Signal` del mercado y ciclo 2C). Ningún MSS de otra familia se hereda. Inside/Multi con M15 propia verificada muestra `QA SI`; 3C TRUE todavía `N/V` porque le falta MSS propio.
- Muestra las etiquetas estructurales como `2C QA`, `3C TRUE QA`, `INS RET QA`, `MULTI QA` y variantes. **La máscara de 7 roles mezcla diagnósticos, estados y retests; NO equivale a 7 familias estructurales homologadas**. No se liberan roles rechazados a señales de entrada.
- `C1 N/D` continúa indicando que el panel tiene una estructura pero no dispone de OHLC C1 propio trazable para el gráfico B.

## Verificación y criterios

`qore-crt-alerts/test/pine-v34-12c-prioritized-dashboard-34-feeds.test.mjs` comprueba que A y C conservan motor idéntico y request único dinámico para 34 slots, no hay alertas, prioridades 0..5, contadores QA correctos, y guardas MSS independientes.

**CI Node exitoso no es certificación TradingView Pine v6.** Compilar el script V34.12C dentro del Pine Editor; si aparece CE10295, extraer también la función de render y reducir **solo la interfaz**, sin eliminar familias del motor. Si aparecen otros dos errores, inspeccionar los mensajes concretos del compilador. No declarar compilación ni certificación real sin hacerlo.

## Instrucciones Android

1. Mantener el indicador B de gráfico separado; no hace falta instalarlo para revisar este cambio del dashboard.
2. En TradingView Basic, abrir y pegar **Radar A V34.12C** en un indicador nuevo, compilar y añadir (retirar el radar anterior si se requieren sus dos slots).
3. Abrir `03 / Dashboard`, mantener `Panel compacto (movil)=ON`, `Monitor principal CRT+MSS=ON`, `Ver los 34 instrumentos (expandir)=ON`, `Ampliado: inspeccionar 7 categorias CRT (QA)=OFF`.
4. Abrir P1/4: si los eventos no cambiaron, NZDJPY/NZDUSD/AUDNZD/CADJPY con QA SI/QA SI deben subir al principio. Los eventos pueden haber cambiado por el mercado; no obligar coincidencia con captura vieja.
5. Verificar footer `M5q` y `M15q` frente a las filas, y probar P4/4 para asegurar que los 34 símbolos siguen representados sin duplicados.
6. Para calibrar Inside/Multi/TRUE3C, extraer evidencia exacta C1/C2/C3 y MSS5/MSS15 por TF con mismo broker, holdout y Trader Lab. La app Android sigue sin FCM real.

**Bloqueo permanente:** no afirmar `7/7` entradas certificadas, NO LIVE, NO PUSH, NO MERGE hasta Pine real y paridad externa.
