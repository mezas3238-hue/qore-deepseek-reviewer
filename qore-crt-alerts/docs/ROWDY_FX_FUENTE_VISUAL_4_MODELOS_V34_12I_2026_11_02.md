# Fuente visual primaria Rowdy FX — mapeo conservador CRT (2 nov 2026)

**Procedencia examinada:** archivo previamente entregado por el usuario, `DOSSIER_VISUAL_CRT.pdf`, recuperado de la Biblioteca de archivos de ChatGPT. PDF: 20 páginas; contiene portada/índice y 19 de las 20 láminas del curso **Rowdy FX**. No se incorpora/copia su material gráfico al repositorio. Se identifica explícitamente ausencia de la lámina **10/20**. Esta auditoría se basa en inspección visual de las páginas pertinentes, no en inferencias del `qaCatalogMask`.

## Concordancia con el código
| Lámina del curso | Página del PDF | Evidencia visual | Interpretación permitida |
|---|---:|---|---|
| 07/20 | 5 | CRH / 50 % / CRL como niveles del rango C1 | Rango de referencia; no significa CRT confirmado |
| **08/20** | **5** | **THE 4 MODELS OF CRT**: 2nd Candle Model CRT, 3rd Candle Model CRT, Multiple Candle CRT, Inside Bar CRT | **Sólo cuatro familias estructurales distinguibles** |
| 09/20 | 6 | Structures of 2 Candle Model, varias morfologías | Variantes de **2C**, no nuevas familias por sí solas |
| 19/20 | 10 | Confirmaciones de menor temporalidad: 1m CISD, 2m MSS, KOD (Kiss of Death), TS/TBS, OTE | Confirmaciones/entradas LTF; **no familias CRT adicionales** |
| 20/20 | 11 | Time-based / confirmación dentro de C2 en ejemplos | Contexto temporal y posibilidad de confirmación LTF en C2; no sustituye la política NY/DST ni aporta 7 familias |

Nombres de referencia listados en el handoff previo: `EVIDENCIA_IMAGENES/ROWDY_08__1000962390.png`, `EVIDENCIA_IMAGENES/ROWDY_09__1000962389.png`. El expediente anterior identifica `PREV01–PREV08` y el dossier. No se afirma que los PNG estén presentes en la rama actual; se verificó el PDF en la Biblioteca.

## Matriz de estados de V34.12I (no promover por nombre)
1. CRT **2C RETURN**: familia estructural 2C, con ciclo C1/C2 y eventual C3 de distribución.
2. CRT **3C TRUE**: familia estructural 3C: C2 preparación sin barrida C1, **C3 barre C1** y retorna. Sus MSS M5/M15 propios están implementados como candidato QA en la rama; **sin compilación ni paridad TradingView real**.
3. CRT **INSIDE RETURN**: familia estructural Inside; C3 barre límites C2 y devuelve, con su propia causalidad. Inside Continuation es diagnóstico de rechazo, no quinta familia.
4. CRT **MULTI-CANDLE**: familia estructural múltiple; los detectores Multi4 y Multi-N son **variantes/hipótesis implementadas**, no dos nuevas familias canónicas, y necesitan evidencia geométrica real separada. Multi4 MSS M15 continúa N/V.

Por tanto `qaCatalogMask` (7 bits) es un **catálogo QA de observaciones/candidatos/descartes/retest** y jamás certificado “7/7 familias”. Elementos como retest MSS M15, expansión 2C rechazada, Inside Continuation y candidato 2C NO pueden contarse como familias nuevas.

## Puertas pendientes
- La lámina 10/20 falta: no reconstruir su texto ni deducir modelos no vistos.
- V34.12I A/B: compilación Pine Editor real, geometría dibujada y paridad externa con OHLC del broker exactamente elegido, condiciones positivas/negativas 34 mercados, superposición y deduplicación.
- Los materiales Rowdy son referencia visual, **no** un algoritmo determinista certificado ni una autorización para LIVE.
- Mantener PR #74 DRAFT, NO LIVE, NO MERGE, NO PUSH.

**Conclusión:** catálogo original visual recuperado **4 modelos estructurales**, no siete independientes. El desarrollo del código debe continuar sobre esos modelos y comparar sus variantes individualmente, sin fabricar categorías.
