# CRT RADAR 34+Chart 12X — Diagnóstico de N/V en MSS, QA 2026-11-09

**Candidato en rama separada. NO MERGE / NO LIVE / NO ALERTAS / NO PUSH / SIN CERTIFICACIÓN PINE.**

## Evidencia en captura

Con `IC:BTCUSD` se observa `IC SLOT 8`, CRH/CRL de 2C ratificado y niveles PDH/PDL. Por tanto el problema anterior de `NO IC` ya no se reproduce **en esa captura BTC**, no se infiere que todos los 34 feeds estén correctos.

En otras filas (ejemplos XAGUSD, AUDCHF y EURGBP) la tabla V34.12X muestra `N/V` en MSS M5/M15 para familias `3C TRUE QA`, `MULTI4`, `MULTI-N` o `INSIDE`. El origen concreto estaba en el renderer del dashboard:

```pine
string m5Text = ... : ownExtraM5 ? "QA SI" : otherQA ? "N/V" : "—"
string m15Text = ... : ownExtraM15 ? "QA SI" : otherQA ? "N/V" : "—"
```

`N/V` significa **MSS propio no validado**, no ausencia definitiva de MSS ni ausencia de cotizaciones. El mismo motor bloquea prestar un MSS de una familia a otra, lo cual es correcto.

## Cambio propuesto — solo observabilidad, 34 mercados intactos

Copia *candidata* derivada del código V34.12X exacto (git blob original `470214fea377b05e537a18c0ce8097986da86fac`). No se reemplaza el archivo original.

Nuevos estados **QA** si no hay evidencia MSS propia en una familia auxiliar:

| Etiqueta | Significado verificable en la evidencia disponible |
|---|---|
| `SIN PRB` | Hay rol estructural visible, pero no candidato MSS perteneciente a esa misma familia/rol |
| `SIN C1` | No está acreditada la C1 propia del rol seleccionado |
| `SIN SWP` | No consta la hora de barrida para el candidato |
| `SIN PIV` | No existe pivote del mismo modelo anterior a la barrida |
| `PEND MSS` | Hay pivote y barrida registrados, pero no cierre MSS propio registrado |
| `NO VALID` | Existe marca de MSS, pero falló al menos uno de los gates originales de certificación |
| `SIN FEED` | No hay respuesta válida del proveedor para ese slot |
| `SIN DIR` | No hay dirección coherente para el rol mostrado |

Los MSS certificados que ya estaban en `SI` / `QA SI`, y el core `NO` / `QA --`, **no cambian**. No se cambia `f_engine()`, la lógica de los 7 roles, CRT H4, pivotes, MSS, BTC independiente, sesiones, fases M5, feed IC, 34 `request.security`, PDH/PDL, FVG, colores, `plot`, alertas ni operadores.

Añadimos dos campos de lectura diagnóstica M5 por slot de los ya existentes en `Signal`: `extraFamilyM5PivotAt` y `extraFamilyM5At`, sin ninguna petición adicional. Las verificaciones M15 usan campos ya retenidos.

## Qué NO corrige

**No crea un MSS que no existe en el ledger**, ni garantiza que las familias observadas tengan prueba causal completa. Para convertir `SIN PRB`, `SIN C1`, `SIN PIV` o `NO VALID` en `QA SI`, debe obtenerse y auditarse la evidencia propia en el código y en las velas reales de IC Markets, con verificación exacta de C1 / sweep / pivote / M5-M15 / fase / reloj. La certificación no se fuerza cambiando textos.

## Validaciones

- Test de transformación completa: compara **todo** el Pine original con el candidato, exige exactamente seis sustituciones declaradas y SHA de blob original fijo.
- Comprobaciones de invariante: 34 slots, BTC independiente, símbolos IC, validación de MSS M5/M15 y prioridad de candidato propio.
- CI GitHub estático, no Pine Editor. **Falta compilar en TradingView Android, comparar las cuatro filas observadas y certificar en feeds reales.**

### Siguiente QA del propietario

1. Aplicar el candidato en un nuevo indicador **sin eliminar el actual**, y no crear alertas.
2. Comparar `IC:BTCUSD` y 2-3 pares con `N/V` antiguos sobre la misma vela.
3. Capturar etiquetas reales, fechas UTC, `QA: ver tiempos CRT/MSS de 1 instrumento` y `QA: ver último evento por categoría`.
4. Examinar primero `SIN PRB / SIN C1 / SIN PIV / NO VALID`, sin declarar éxito por la sustitución visual.

El siguiente cambio de lógica, si realmente procede, se hará en otra rama y tras certificar la causa.
