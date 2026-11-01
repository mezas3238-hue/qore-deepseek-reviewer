# Recuperación de trabajos anteriores CRT RADAR PRO + DeepSeek
**Corte: 2026-11-01 · Verificado contra GitHub + Handoff Maestro conservado.**
**Ámbito: inventario de ingeniería y trazabilidad, NO nuevo diseño, compilación ni integración.**

## 0. Restricciones de continuidad

- GitHub como fuente de código. No sustituir V34.8, V34.9 ni candidatos probados visualmente; PR #55 DRAFT, SIN merge, SIN LIVE.
- En TradingView BTCUSD: Owner ha validado visualmente BTC H4, niveles CRT y MSS M5/M15 diferenciados, y PDH/PDL de la anterior vela 1D del mismo proveedor. Esas capturas NO prueban por sí solas la paridad completa del backend ni todas las familias.
- CRT oficial de señales: **H4 tres velas**. C1 rango; C2 barrida unilateral estricta y cierre dentro de C1; C3 distribución, invalidación solo cuando C3 H4 cierra fuera de mecha C2. Requiere **MSS M15 propio, vela cerrada y pivote 2/2 anterior a la barrida**. MSS M5 es auxiliar.
- C1 BTC/Forex NY: 01, 05, 21. Índices NY: 02,06,22. `America/New_York` DST.
- No usar familia adicional, Inside, FVG, retest o MSS M5 como reemplazo tácito del gate H4+M15.
- Colaboración con DeepSeek fue mediada por prompts manuales del usuario. **No existe una respuesta original de DeepSeek verificable que apruebe las siete familias exactamente como aparecen en V34.10j** entre los registros recuperados: distinguir clasificación actual de dictamen histórico.

## 1. Fuentes originales efectivamente recuperadas

| Origen | Estado | Enlace |
|---|---|---|
| Handoff Maestro de 31 Oct | Recuperado completo en archivo del usuario; reproduce auditorías y reglas | [Handoff GitHub](https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/review/crt-radar-v34-10b-m5b-session-audit-20261031/crt-radar-pro/docs/HANDOFF_MAESTRO_CRT_RADAR_PRO_V34_9_M5B_2026-10-31.md) |
| V34.8 base conservada | Archivo Pine real verificado; 1065 líneas; SHA `002ab35494c2d690af0cd5edd6725eea9806d8c6` | [V34.8](https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/review/crt-radar-v34-8-v34-9-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_8_MODULO4B_INTEGRADO.pine) |
| V34.9 oficial de desarrollo histórico | Archivo Pine real verificado; 1163 líneas; SHA `5cab1d68c3bb369543933e78294b08fe2a93c206` | [V34.9](https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/development/crt-radar-v34-9-m5a-integrated-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_9_MODULO5A_INTEGRADO.pine) |
| Issue #52 | Prompt DeepSeek 5B original y alcance de la V34.9; sin comentarios | [Issue #52](https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/52) |
| Issue #53 | Auditoría de 5B V34.10; defectos/escenarios FVG | [Issue #53](https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/53) |
| Issue #54 | Auditoría V34.10b, seis extractos reales y contraauditoría de la respuesta DeepSeek, más continuaciones QA | [Issue #54](https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/54) |
| V34.10j actual | Candidato QA: 1712 líneas; SHA `feebb0850e2c34a6a3b6b16c1cebd45591e56665` | [V34.10j](https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/feature/qore-crt-alerts-contract-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_10J_QA_CATALOGO_MODELOS_ENTRADAS_CRT_NO_INTEGRADO.pine) |
| Clasificador backend | Siete familias declaradas, replay offline, `sendPush:false` | [Catálogo backend](https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/feature/qore-crt-alerts-contract-20261031/qore-crt-alerts/src/crt-entry-model-catalog.mjs) |
| Documentación de la 10j | Tabla original de siete familias y limitaciones explícitas | [Catálogo QA](https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/feature/qore-crt-alerts-contract-20261031/qore-crt-alerts/docs/BTCUSD_V34_10J_CATALOGO_MODELOS_CRT_2026-11-01.md) |

## 2. Capacidades anteriores verificadas en código

### V34.8

Contiene `InsideCandidate`, identificadores `INSIDE_RETURN` y `INSIDE_CONTINUATION`, `CRT_2C_RETURN` y `CRT_2C_EXPANSION`, MSS M5/M15, CRT principal, PDH/PDL y dashboard 34 símbolos. **Inside Return/Continuation ya existían** antes de la clasificación V34.10j. No reimplementar desde cero.

### V34.9

Conserva todos los anteriores y añade `FvgContext` con FVG H1/H4 de tres barras, calculadas desde las M5 del mismo ticker (H1: 12, H4: 48); zonas con `formedAt`, límite de almacenamiento 10 por TF, sin reconsultas extras ni FVG como gate. El Handoff documenta correcciones técnicas surgidas del análisis con DeepSeek.

### V34.10/V34.10b (auditorías DeepSeek, candidatos no integrados)

Se recuperó la lógica de mitigación de FVG con los estados `INTACTO`, `PARCIAL`, `LLENADO_TOTAL`, `INVALIDADO`, `DATOS_INCOMPLETOS`; `firstTouchAt`, `lastEvaluatedEnd`, penetración limitada [0,1], invalidación por cierre y control conservador de gaps. DeepSeek cuestionó pausas de fin de semana/sesión. Issue #54 conserva respuesta/contraauditoría que concluye **aprobable solo para ensayo**, NO validación de la totalidad de modelos CRT. No volver a diseñar el módulo FVG sin revisar ese dictamen.

### Continuaciones V34.10b y actual PR #55

- Auditoría de **C2 strict sweep**: igualdad exacta de CRH/CRL puede indicar candidato, pero NO cuenta como barrida; doble barrida real requiere extremos estrictos. Issue #54.
- V34.10c y siguientes corrigieron consumo de memoria en TradingView BTC, sesiones NY y 48 M5 por H4 (casos DST), referencias PDH/PDL de la 1D **del mismo proveedor**, y MSS M15 independiente de M5. El propietario aportó capturas de funcionamiento BTCUSD Coinbase para versión de prueba anterior.
- V34.10j añade filas `MODELO CRT`/`OTROS CRT QA`, el clasificador de siete familias y suite Node/replay. El proyecto de notificaciones Android sigue bloqueado por gates reales de fuente/paridad/FCM. No tratar las suites Node como compilación Pine.

## 3. Estado real de las siete familias de V34.10j

| Familia en catálogo backend | Evidencia recuperada | Estado de implementación |
|---|---|---|
| `CRT_3C_REVERSAL` | Núcleo H4 C1/C2/C3 + MSS M15 implementado, validado visualmente parcialmente en BTCUSD | Detector primario, candidato de entrada solo con el gate vigente |
| `CRT_2C_CANDIDATE` | `CRT_2C_RETURN` ya en V34.8 | Detector/candidato; no entrada final sin reglas del Owner |
| `CRT_2C_EXPANSION` | `CRT_2C_EXPANSION` ya en V34.8 | Detector diagnóstico; incompatible con C2 cierre dentro C1 |
| `CRT_INSIDE_RETURN` | `INSIDE_RETURN` e `InsideCandidate` ya en V34.8 | Detector experimental, sin aprobación de entrada autónoma |
| `CRT_INSIDE_CONTINUATION` | `INSIDE_CONTINUATION` en V34.8 | Detector/estado experimental, no entrada confirmada |
| `CRT_MULTICANDLE` | Conversaciones antiguas describen acumulación/manipulación extendida; V34.10j backend lista la familia | Solo etiqueta/catalogación; NO detector Pine completo recuperado |
| `CRT_M15_RETEST` | Conversaciones antiguas citan retesteo 50%/OTE y una versión V35 no localizada en las ramas del repo | Solo etiqueta/catalogación; NO detector Pine completo recuperado |

En V34.10j, `MSS_CONFIRMED_C2` y `MSS_CONFIRMED_C3` son **subtipos de 3C**, no familias adicionales. Los conceptos `DOUBLE_MSS`, `TS/TBS`, `CISD`, `OTE`, `IFVG` son **estilos/confirmaciones/contextos mencionados en conversaciones anteriores**, no forman por sí solos el listado de siete familias del catálogo. En el texto real de V34.8 y V34.9 no encontramos implementaciones llamadas TS/TBS o CISD; en V34.10j tampoco se localizaron módulos completos bajo esos nombres. El historial conversacional menciona V35 y aproximaciones de tales estilos, pero **no hay archivo fuente verificado de esa V35 en las ramas buscadas del repositorio**. No afirmar pérdidas irreversibles ni fingir recuperación del código ausente.

## 4. Brechas que hay que cerrar sin rehacer las bases

1. Rastrear código fuente original de V35/estilos si se conserva en otra rama o artefacto; no recrear a partir de nombres sueltos ni llamarlo aprobado por DeepSeek.
2. Recuperar respuesta original de DeepSeek que habría auditado **exactamente las siete familias**; los issues #52–#54 recuperados auditan **FVG 5B**, no esa taxonomía de siete. Hasta localizarla, evitar afirmar ese dictamen como confirmado.
3. Comparar `CRT_MULTICANDLE` y `CRT_M15_RETEST` con reglas escritas del arquitecto previo, y solo después proponer detectores Pine aislados con pruebas.
4. Ejecutar en TradingView una **compilación real de V34.10j**, que todavía no consta. El éxito anterior de V34.10i en BTC no sustituye esta prueba.
5. Mantener el QA en `BTCUSD solo` durante la certificación; el escaneo simultáneo 34/34 requerirá una optimización y ensayo independiente de memoria y paridad.
6. Fuente de precios continua y backend/Firebase Android reales siguen pendientes; jamás habilitar avisos por el mero reconocimiento de una familia.

## 5. Plan de continuidad exacto

El siguiente trabajo NO es volver a investigar CRT desde cero: es reconciliar **implementaciones originales preservadas**, **documentación DeepSeek disponible**, **clasificador V34.10j** y **estilos antiguos aún sin código comprobado**. El detector 3C con M15 se mantiene soberano hasta autorización expresa para otro modelo operativo. Conservar soporte Coinbase BTC y proteger GitHub branch y V34.9.

**Esta recuperación crea solo este archivo de trazabilidad. No altera Pine, el engine de backend, PR merge, Firebase ni el estado de certificación.**
