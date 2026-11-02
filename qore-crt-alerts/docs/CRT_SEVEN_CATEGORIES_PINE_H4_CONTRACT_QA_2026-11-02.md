# CRT RADAR PRO — 7 categorías legadas / cuatro morfologías / MSS M15 · QA de contrato

**Fecha:** 2026-11-02. **Estado:** QORE LAB QA, ningún candidato LIVE, sin órdenes, sin alertas push.

## Qué se ha comprobado directamente del código

El código `qore-crt-alerts/src/crt-structural-morphologies.mjs` declara **4 morfologías H4 estructurales**: `CRT_2C_RETURN`, `CRT_3C_REVERSAL`, `CRT_MULTICANDLE`, `CRT_INSIDE_BAR`. No equivale a siete familias estructurales ratificadas. El expediente visual [Issue #60](https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/60) identifica cuatro morfologías en Rowdy FX 08/20; MSS, CISD, KOD, TS/TBS y OTE de 19/20 son estilos de entrada LTF, no necesariamente familias H4.

Las **siete categorías de programación** y su posición real en el contrato actual son:

| Categoría | Rol | Operatividad QA |
|---|---|---|
| `CRT_3C_REVERSAL` | Estructural | Forma H4 + invalidación C3; NO push |
| `CRT_2C_CANDIDATE` | Fase pendiente | No ratificada |
| `CRT_2C_EXPANSION` | Expansión, retorno fallido | Diagnóstico / rechazo |
| `CRT_INSIDE_RETURN` | Variante estructural | Solo H4 cerrada dentro de C2 estricto |
| `CRT_INSIDE_CONTINUATION` | Variante sin criterio operativo aprobado | Diagnóstico / rechazo |
| `CRT_MULTICANDLE` | Morfología / hipótesis auxiliar | Multi-N y 4H distribuido en QA |
| `CRT_M15_RETEST` | Confirmación de entrada posterior al MSS | No es una familia H4 |

**Conclusión técnica honesta:** no debe declararse *7/7 familias estructurales activas* ni sustituirse la exigencia de MSS M15 con las categorías QA. El usuario desea escaneo real de todas las variantes válidas, no siete etiquetas para inflar un dashboard.

## Suite de contrato agregada

`qore-crt-alerts/test/crt-seven-category-pine-contract-20261102.test.mjs` comprueba los siguientes fallos de manera independiente de cualquier feed comercial:

- CRT 2C retornado con C2 cerrada, **sin exigir C3**; evolución a 3C en H4 posterior y rechazo de C3 invalidada.
- Doble barrido, expansión fuera de C1, Inside continuado y doble barrido Inside **no pueden** convertirse en señales ratificadas.
- Inside return **estricto dentro de C2**, no simplemente un retorno a C1.
- Multi-N dos H4 interiores y barrida terminal; Multi4 H4 distribuido se mantiene como hipótesis separada.
- MSS M15 sólo del mismo proveedor, ticker, ciclo, dirección y pivote confirmado previo al sweep; ninguna M5 sustituye a una M15.
- Retest M15 únicamente en M15 posterior al MSS, mismo nivel/ciclo y sin push.
- 34 slots aislados con proveedores sintéticos; contrato del Pine requiere `request.security` M5 en cada símbolo, `calc_bars_count=1500`, alertas OFF y `Solo CRT` por defecto.

**Lo que no prueba:** ejecución del compilador Pine, equivalencia con `f_engine()` original sobre mismos OHLC, detector de MSS idéntico al de TradingView, garantía de que las siete categorías se deban clasificar como familias estructurales, paridad TradingView/cTrader/Coinbase ni validez de una estrategia.

## Desfase histórico 1500 M5

El escaneo Pine actual se limita por defecto a `calc_bars_count=1500` por feed; la calibración anterior en QORE Core cubrió 47 días. `RESP:34` significa acceso a feeds, no 34 CRT vigentes. Por eso se prepara un experimento controlado en QORE Core con las **mismas fuentes M5** y reglas del prescreen: longitud 1500 vs período completo. Este ensayo no sustituye el replay Pine con idénticos OHLC ni autoriza aumentar a ciegas las peticiones M5, los límites de memoria o el número de solicitudes.

## Gates siguientes

1. Congelar fuente visual original del usuario y auditar con DeepSeek cualquier familia sin definición literal. Prompt [ligado al Issue #60](https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/60), no inventar nombres.
2. Extraer un contrato ejecutable de `f_engine()` basado en los mismos datos proveedor que Trader Lab (C1→C2→C3, strict sweep, Inside, Multi4, Multi-N, MSS M5/M15, pivotes, FVG y PDH/PDL).
3. Reproducir exactamente el pipeline en CI con registros causales por C1 y H4 cerrado; comparar MATCH/MISMATCH por instrumento y modelo, sin recalibrar sobre el holdout.
4. Paridad M5 1500 / memoria / prioridades, falsos positivos y negativos, NO repaint y cierre de vela H4/M15.
5. Compilación real TradingView, pruebas 34 feeds y Android push E2E autónomo. Sin merge ni LIVE hasta cerrar.

**Referencia de ejecución histórica no-Holdout:** [QORE Core PR #1004](https://github.com/mezas3238-hue/qore-core/pull/1004), 34/34 calibración M5, 0/34 holdout independiente certificado.
