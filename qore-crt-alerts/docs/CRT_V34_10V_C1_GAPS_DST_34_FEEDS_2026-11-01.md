# V34.10v — reparar C1 en 34 feeds y distinguir H4 incompletas por causa
Corte: 2026-11-01 · CANDIDATO QA · no integrar / sin alertas LIVE.

## Capturas reales que originan la corrección
El propietario aportó cuatro capturas de V34.10u en COINBASE:BTCUSD M15, `Auditoría 34 por símbolo`.
`RESP:34 SD:0 HIST:8 CRT:0 QA:0`.

| Feed | 2C | 3C | Inside | M4 | Multi-N | C1 anterior |
|---|---:|---:|---:|---:|---:|---:|
| NAS100USD | 4 | 3 | 0 | 0 | 0 | 0 |
| US500 | 5 | 2 | 1 | 0 | 0 | 0 |
| US30 | 4 | 2 | 0 | 0 | 0 | 0 |
| BTCUSD | 2 | 2 | 1 | 0 | 0 | 13 |
| EURCHF | 5 | 5 | 0 | 2 | 1 | 0 |
| EURGBP | 3 | 2 | 1 | 0 | 0 | 0 |
| EURNZD | 5 | 4 | 3 | 0 | 0 | 0 |
| GBPCHF | 5 | 3 | 0 | 0 | 0 | 0 |
| **Total** | **33** | **23** | **6** | **2** | **1** | — |

Los restantes **26 feeds** están presentes, pero no registran modelos durante el tramo M5 cargado. Cero histórico NO implica automáticamente defecto, y 2C y 3C pueden ser el mismo ciclo. Las 4 páginas reportan `GAP:207,311,221,94` por página (833 H4 no-48 acumuladas), demasiado inespecíficas para llamarlas fallas de red o proveedor.

## Hallazgo 1 (BUG confirmado): contador C1 limitado a BTC
V34.10u incrementaba `qaC1Ready` bajo `if isBTC`, mientras `qaAudit2C` registraba detecciones de TODOS los feeds. El panel reproducía falsos `EURCHF 5/0`, `NAS100USD 4/0`, `EURGBP 3/0`, etc.

**Arreglo V34.10v:** al superar el guard completo C1 (hora NY, barra M5 contigua, cierre H4, longitud mínima), incrementar `qaC1Ready` para cualquier instrumento, **antes** del `if isBTC` reservado al texto histórico BTC. Sin cambios en `c2Active`, `c2Start`, clasificación 2C/3C/Inside/M4/Multi-N, MSS o alertas. Esta corrección afecta únicamente la métrica de auditoría; no inventa nuevas oportunidades.

## Hallazgo 2: `H4 GAP` confundía tres causas
`qaAuditH4Incomplete` aumentaba cada vez que `fullH4` (exactamente 48 M5 y fronteras UTC/NY) fallaba. En índices/Forex con aperturas/cierres de sesión, este conteo **incluye H4 parciales normales**; en BTC la DST de 1 noviembre 2026 puede producir 60 M5 cerradas en H4 NY 01–05, y en marzo 36 M5. Ninguna de esas tres situaciones equivale automáticamente a datos defectuosos.

**Arreglo de observabilidad (sin relajar guard `fullH4`):** tres categorías disjuntas, para el feed M5 de cada símbolo:
- `DST`: H4 de duración cronológica 3 o 5 horas con todos sus M5, sin huecos; sigue NO aceptándose como `fullH4` de 48.
- `~ SES/PARC`: H4 no completa porque abre/cierra la sesión, acaba el historial cargado o faltan partes del bloque aunque el tramo observado sea continuo. Esta clase no prueba un fallo.
- `! M5 INTERNO`: se observó interrupción temporal entre M5 dentro del mismo bloque; requiere investigación de feed/calendario, tampoco implica por sí misma explotación.
La suma `DST + SES/PARC + M5 INTERNO` debe igualar `H4` no completas por símbolo durante el historial procesado. Se conserva el agregado original `qaAuditH4Incomplete`, para poder comparar con los 833 eventos de la prueba anterior.

## Android
1. Mantener V34.10u, que ya compiló y presentó cuatro páginas correctas en móvil.
2. Copiar V34.10v completa desde el **TXT en la rama** mediante Raw; agregarla como indicador nuevo.
3. Usar `Alcance: 34 instrumentos (experimental)`, `Vista: Auditoría 34 por símbolo (QA)` y páginas 1–4.
4. Esperar que `2C/C1` tenga ahora C1 en Forex/índices que cumplieron criterio (por ejemplo, EURCHF y US500). No asumir números exactos hasta ejecutar el indicador.
5. En cada página consultar `!M5`, `~PAR`, `DST`, `C2RE`, `M15QA`; marcadores `!`, `~`, `D` en nombres de feeds corresponden a motivo prioritario y pueden coexistir entre eventos diferentes.
6. Volver a `Vista: Solo CRT`: NO muestra los 34 tickers sin formaciones válidas. Alertas y FCM OFF.

## Validación y límites
- `qore-crt-alerts/src/crt-h4-completeness-qa.mjs` y `test/crt-h4-completeness-v34-10v.test.mjs`: casos normativos H4 48 M5, DST 60/36, sesión, tramo parcial, hueco interior.
- CI Node comprueba estructura, presupuestos `request.security`, ausencia de cambios en alertas y paridad TXT/Pine; **no ejecuta compilador TradingView Pine**.
- No se ha auditado todavía con OHLC de los 34 feeds la causa específica de los 26 sin patrones; falta validar finalización de las cuatro familias, MSS M15 Multi4 y posterior Android E2E.
- PRs #55/#59/#61/#63/#64/#65/#66/#67 protegidos; éste también DRAFT sin merge, sin FCM, sin órdenes ni LIVE.
