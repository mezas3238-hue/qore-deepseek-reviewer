# V34.11i — TradingView Android: el catálogo 7 mostró 3C M15 pero la fuente +1m continúa en QA

**2-Nov-2026 · QA experimental / no merge / no alertas**

## Resultado visible y alcance de la captura

En el gráfico IC:NZDCAD M15, con V34.11h y la vista ampliada de siete categorías activada, el panel mostraba `R:34/34`, `SIN:0`, `7 CAT QA`, y la primera página:

- AUDJPY: `3C M15✓` en el catálogo de modelos y `RT M15 QA` en retest. Es una marca de estado **del motor en ese instante**, no certificación independiente ni señal de trading.
- GBPUSD y GBPJPY: `EXP RECH`, es decir, expansión rechazada que **nunca** debe tratarse como entrada válida.
- XAUUSD: sin estado de las categorías desplegadas en ese instante.
- `HIST:32`: 32 fuentes con algún modelo histórico contado por el scanner (no implica 32/33 H4 reparadas ni 32 señales).
- `R:34/34` significa feeds respondidos, **no** C1 válidas para 33 mercados ni paridad con Trader Lab.

La captura indica que el Pine V34.11h llega a renderizar eventos y categorías más allá de BTC, pero **no** demuestra ausencia de falso MSS15, cero H4 bloqueadas ni integridad de las siete familias.

## Corrección V34.11i

**Fuente:** `crt-radar-pro/CRT_RADAR_PRO_V34_11I_CATALOGO_QA_NO_SENALES_33.pine`; Git blob **`ca7ad8c339a5ea82b63a316d4af95bc82abba28f`**, derivado de V34.11h en PR #74.

- El panel ampliado etiqueta un 3C con cierre MSS15 como **`3C M15 QA`** (naranja) y 3C sin MSS15 como **`3C ESP QA`**, nunca `3C M15✓` verde. `EXP RECH`, `CONT RECH`, `RT M15 QA`, `MULTI QA` conservan estado de diagnóstico.
- Con `qaPhase1NonBtc` ON, se impide convertir 3C del experimento de fase +1m de **cualquiera de los 33 no BTC** en un `scanCrtValid`, `certifiedCRT` o `ownCRTValid` de la lista compacta operativa. **No se deshabilita la observación de las siete categorías.**
- BTCUSD es independiente del experimento: el motor H4/MSS de BTC no se cambia, ni tampoco la validación de 48 M5, ciclo C1/C2/C3, pivote confirmado M15, retest causal, ni funciones de fuente `IC/OANDA`.
- Los mismos 34 `request.security(symbol,"5")`, 60 `plot()` y mismas alertas inhibidas en QA +1m. No se ha validado Pine V34.11i todavía en el editor real; tests offline no equivalen a compilación.

## Próxima prueba que realmente decide si los 33 quedaron reparados

1. Poner `00 / Memoria:34`. En `03 / Dashboard`, activar **QA: auditar los 33 instrumentos sin BTC** y mantener **QA: probar desfase +1m M5 en 33 (SIN ALERTAS)**.
2. Leer `R:xx/33`, `0C1`, `C1+`, `BLOQ`, `H4`, `PARC`, `INT`, comparar contra medición **anterior** V34.11g: `R:33/33, 0C1:30, C1+:3, BLOQ:30, PARC:943, INT:13`.
3. Registrar las **9 páginas** por instrumento, no solo las cuatro filas iniciales. Verificar que en NZDCAD `# M5=48, INICIO Δm=0, FIN Δm=0` bajo la misma fuente exacta; y no copiar el resultado de NZDCAD a los 32 restantes.
4. Cotejar de forma independiente primer cierre MSS15 de AUDJPY contra 3 velas M5 cerradas consecutivas de IC/OANDA a fase +1m, pivote M15 L2/R2 antes del sweep, ruptura por cierre M15 DESPUÉS del sweep, identidad C1/C2, y retest posterior. Sin capturas de velas/tiempos no hay certificación de `3C M15 QA`.
5. Comparar mismo H4/M15 del feed real con Trader Lab y evaluar si una H4 **01:01–05:01** corresponde a las reglas de referencia definidas como H4 NY **01:00–05:00**. Mantener prueba fuera de muestra, DST/no repaint y Android E2E bloqueados.
6. En el panel ampliado, comprobar que ya no haya ✓ verde en `3C/M15` para las 33 en fase QA. Las marcas `QA` no son recomendaciones de operar.

**Resultado deseado pero todavía no demostrado:** 33/33 feeds con H4 coherentes, validaciones MSS15 causales, siete categorías correctas según sus funciones (rechazos/provisionales/no todos entradas). **PR DRAFT / NO MERGE / NO LIVE / NO PUSH.**


## Compilación real: error reportado y corregido
Captura real del editor Pine en Android mostró `Syntax error at input "bool" (CE10156)` en línea 2766, `1 of 2 problems`. Causa reproducida en GitHub: comentario y declaraciones `bool catM15Observed` / `string cat3Label` tenían **21 espacios** mientras el bloque `if eligibleSeenMobile...` exige **20**. Corregidos los tres renglones en el mismo archivo V34.11i; SHA nuevo `ca7ad8c339a5ea82b63a316d4af95bc82abba28f`. La segunda incidencia también podría derivarse del mismo bloque, pero requiere **compilar de nuevo** para comprobarla. Se incorporó regresión de indentación Pine; las pruebas Node no reemplazan el compilador de TradingView.
