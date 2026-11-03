# HANDOFF MAESTRO — QORE CRT RADAR PRO + QORE CRT ALERTS
**Corte verificado:** 2 de noviembre de 2026 (Paraguay). **Modo:** QA / NO LIVE / NO PUSH / NO MERGE.

## Misión
Continuar código existente, no reconstruir ni bifurcar proyectos. Completar dos indicadores Pine v6 (Radar A para 34 mercados, Chart B para niveles C1 CRH/CRL y MSS) y, una vez certificar sus reglas con datos reales en TradingView/Trader Lab, la app de alertas Android autónoma **sin depender de alertas de TradingView**. El usuario trabaja desde Android, emplea TradingView Basic (dos slots), pide dashboard compacto que resalte casos relevantes y expansión manual a 34 símbolos, sin activar trading automático ni alertas antes de certificar.

## Identidad del código
Repositorio: https://github.com/mezas3238-hue/qore-deepseek-reviewer
PR: https://github.com/mezas3238-hue/qore-deepseek-reviewer/pull/74 (OPEN DRAFT).
Rama: \`feature/crt-v34-11a-seven-catalog-34feeds-20261102\`.
**HEAD verificado antes de este archivo:** \`2427f5db7a2d6067bacaef72334e839c6f5c9bb6\`.
- Radar A candidato **V34.12I**: \`crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine\`.
- Chart B candidato **V34.12I**: \`crt-radar-pro/QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine\`.
- Estables anteriores que **NO reemplazar sin pruebas**: Radar A V34.12H \`crt-radar-pro/QORE_CRT_RADAR_A_34_MERCADOS_V34_12_H_6_FILAS_PRIORITARIAS_QA_NO_LIVE.pine\`; Chart B \`crt-radar-pro/QORE_CRT_CHART_B_C1_MSS_V34_12_QA_NO_LIVE.pine\`.
- Android/backend/laboratorio existentes: \`qore-crt-alerts/\` (no es un proyecto vacío); incluye \`android/\`, \`src/\`, \`sql/\`, \`test/\`, \`docs/\`, \`trader-lab/\`.
- Candidatos A/B V34.12I: \`type Signal\` **132 campos**, \`Signal.new()\` **132 argumentos**, \`f_engine()\` idéntico byte a byte. Los 128 primeros campos del contrato anterior permanecen en orden. Chart B tiene 63 llamadas a \`plot()\` (próximo al límite de 64 plot counts; compilar en Pine real). Radar A conserva 34 inputs de símbolos y una sola llamada dinámica de datos M5 por mercado, no escáner de un único BTC.
- Política de dedup offline: \`qore-crt-alerts/src/crt-canonical-event-qa.mjs\`, más \`src/crt-family-overlap-evidence-qa.mjs\`: **solo QA**; no conectada a push real.

## Evidencia de GitHub — no confundir con producción
Al HEAD anterior: GitHub Actions \`QORE CRT ALERTS foundation offline tests\` **716/716 PASS** en run #41556436392; \`CRT RADAR PRO V34.10b QA (offline only)\` SUCCESS; \`DeepSeek Harness independent audit-repair certification\` SUCCESS; \`QORE CRT ALERTS Android QA compilation\` SUCCESS. Estos workflows no compilan V34.12I en Pine Editor real y no prueban OHLC holdout ni recepción FCM física. El indicador A anterior D/E/F corrió visualmente en TradingView Android según capturas del propietario; **V34.12H, ambos V34.12I y Chart B actual no disponen de certificación Pine real**. No presentar 716 PASS como "7 familias certificadas".

## Funcionalidad requerida — mantener
- CRT H4 reconstruido de M5 **cerradas**, 48 M5 contiguas para H4 completa, proveedores idénticos, evitar lookahead/repaint. Forex y **BTCUSD** horario C1 NY 01:00/05:00/21:00; índices 02:00/06:00/22:00, \`America/New_York\` con DST.
- Barrida estricta única, cierre de retorno, invalidación en cierre H4 cuando corresponda; fases C1/C2/C3. PDH/PDL y FVG H1/H4 contextuales existentes, no borrar.
- MSS **M5** L2/R2 pivote confirmado anterior a barrida, ruptura por cierre M5 posterior en la misma fuente y C1; MSS **M15** reconstruido de tres M5 completas, pivote 15 anterior a barrida, ruptura por cierre M15 propio, jamás reutilizar MSS5 como MSS15.
- Radar A dashboard **6 columnas** \`MERCADO | CRT H4 | DIR | MSS M5 | MSS M15 | ETAPA\`. Compacto prioritario 2–6 filas (default 6 V34.12H/I), expandido 34 por páginas. En Pine tables no hay \`tap\` para expandir: control por Ajustes. Mostrar solamente señales CRT relevantes en principal, categorías de rechazo/diagnóstico separadas y marcadas QA. Mantener prioridad certificados > QA, y no mostrar \`SI\` sobre N/V.
- Chart B en segundo slot exclusivo TradingView Basic: mismo C1 del gráfico abierto y proveedor, CRH/CRL, línea MSS5 y MSS15 de ese ciclo; no atribuir líneas a un ciclo anterior.
- Android QORE CRT ALERTS: notificaciones push independientemente de TradingView, selección de 34 instrumentos, preferencias M5/M15, habilitar/deshabilitar avisos, historial y estado del motor, seguridad de dispositivos/tokens, dedup y anti-spam. **NO PUSH hasta verificación real**.

## Taxonomía — error que no se debe repetir
Del material verificado se distinguen **4 familias estructurales**: (1) 2C_RETURN: C2 barre C1 y cierra dentro; (2) 3C_TRUE: C2 setup sin barrer C1 y C3 barre C1, cierra dentro; (3) INSIDE_RETURN: C2 interior, C3 barre límite de C2 y retorna; (4) MULTI (Multi4/Multi-N como variantes). Los **7 bits de qaCatalogMask NO equivalen a 7 familias**: 3C verdadera, 2C pendiente, expansión 2C rechazada, Inside Return, Inside Continuation rechazada/no aprobada, Multi y retest M15; 2C Core queda fuera. Recuperar láminas completas Rowdy FX (solo 8/20 y 9/20 parcialmente discutidas) y resolver con propietario si hay modelos adicionales antes de prometer "7 familias reales". **No crear 3 categorías ficticias** ni eliminar observaciones de categorías solapadas.

## Trabajo YA HECHO
1. BTC horario igual a Forex por decisión; PDH/PDL ajustados y MSS M15 de 2C separado del MSS5. 34 feeds pueden responder: captura V34.12F \`R:34/34\`, S9 AUDUSD FEED OK, \`C1:15\`, \`H4:31/48\` / \`32/48\`; 48 se refiere a M5 de última H4, no 1.500 barras totales.
2. V34.12D historial mercados con eventos 2C/3C/INS/M4/MN = **34/9/15/4/2**, E mostró temporalmente **8/3/3/1/0**, F de nuevo **34/9/15/4/2**. D y E tenían motor, esquema y scanner byte idénticos; causa **NO AISLADA**. Modo \`memoryScan=BTCUSD solo\` por sí solo retornaría 1 slot, **no explica ocho**.
3. Auditoría de cierre exacto 3C vs INS, \`3C=INS:n\` variable (en capturas hasta seis). Misma fecha o misma H4 **no implica mismo C1 ni dos operaciones**; V34.12G marcó asteriscos por H4 exacta en vista histórica.
4. Radar A H: monitor de hasta seis mercados prioritarios, sin sustituir 34 feeds. A/B anteriores 128 campos iguales. V34.12I añadió a Inside/Multi-N pivote M5 congelado, mss5At posterior a barrida, reseteos por hueco y barrida doble; A/B pasaron a 132 campos, tests 716.
5. DeepSeek objetó A.1 primer segmento M5 y A.2 clear de Multi-N antes de última vela. A.1: Pine v6 bool no es \`na\` y \`barT=time[1]\`; aun así inicialización ahora explícita: \`if (na(qaExtraM5SegmentStart) or not previousM5Continuous) and not na(barT)\`. A.2: \`barT=time[1]\`, última M5 de H4 se procesa antes de que la siguiente M5 cerrada dispare \`nextH4\`, luego se extrae \`qaMultiNMss5At\` y limpia el array. **No mover el bloque por la sugerencia no reproducida**.
6. Canonical QA solo agrupa observaciones si ambas geometrías verificadas y comparten proveedor, C1Start, H4 terminal y dirección; guarda etiquetas secundarias, \`pushEnabled:false\`. No se ha conectado a FCM.

## PENDIENTES BLOQUEANTES, EN ORDEN

### P0 — Compilación real y regresión de ambos V34.12I
1. Usar Pine Editor de TradingView **por separado** (A y B, NO concatenados), en BTCUSD y uno o más FX M5/M15. Corregir únicamente errores reproducidos con mensaje exacto, línea y entorno; capturar QA de pantalla. No inferir CE10295 del script monolítico V34.11S. Verificar que el tamaño de Chart B y 63 \`plot()\` no excedan límites en compile real.
2. Fijar SHA commit y parámetros/broker por prueba; no mezclar H/B con I/I ni actualizar dos scripts a diferentes esquemas. Confirmar que ambos \`Signal\` y \`f_engine\` son idénticos y no hay nuevo repaint.
3. Comprobar en gráfico los niveles CRH/CRL y las confirmaciones reales M5/M15 sin mezcla de ciclos. Si se reproduce un error, preparar **una reparación focalizada más test**, no una cadena de versiones estéticas.

### P0 — Cerrar familias y MSS faltantes
4. Confirmar geometría desde Rowdy FX, test positivos/negativos C1/C2/C3 para 2C, true3C, Inside, Multi4/Multi-N, doble barrida, ventanas H4 y cierre estricto. Registrar falsos positivos.
5. **3C_TRUE:** implementar y demostrar su pivote M5 **y M15** propios (pre-sweep de C1 en C3), cierre causal y presentación por ciclo. Actualmente N/V por diseño.
6. **MULTI4:** implementar su MSS M5 propio y comprobar si existe MSS M15 verdaderamente propio; no atribuirle el de Multi-N o 2C. Conservar N/V hasta demostrarlo.
7. Inside/Multi-N: cerrar validación con datos **OHLC M5 del mismo broker** para MSS5 introducido en I; verificar M15 previo independiente; test primera sesión, gaps, doble barrida, cruce M5 final del bloque H4 y contaminación C1.
8. Mantener una sola clasificación visual prioritaria por evento **cuando haya coincidencia exacta de fuente, C1, barrida, dirección y H4 terminal**, sin borrar bits QA; \`canonicalEvent\` Node sigue QA hasta certificar feed y política. No promocionar 3C al MSS de Inside si ambos aparecen juntos.

### P1 — Reproducibilidad de 34 mercados / fases NY
9. Reproducir D→E→F con mismo broker, inputs y snapshot; documentar \`scanAll\`, \`memoryScan\`, \`qaPhase1NonBtc\`, selección de slot, \`calc_bars_count=1500\`, primeras/últimas marcas UTC M5 **por fuente**, número real de M5 contiguas y H4 completas. No usar \`qaH4LastBars==48\` como equivalente de tener 1500 barras ni \`bar_index[0]\` como inicio de fuente. El defecto 34→8→34 sigue NO EXPLICADO.
10. BTCUSD slot 8 debe usar proveedor del gráfico cuando corresponde; sus tres horarios C1 son los de Forex. Para los restantes 33 no extrapolar resultados BTC a NZDCAD; pruebas de los **34 individuales** y nativo :00/+1/+2 etc., NY DST, cierres de sesión, barras insuficientes.
11. Mantener \`R:x/34\` como respuestas y los contadores históricos como mercados con último evento, **no certificados**; unir QA con datos M5 y event IDs, no solo fechas.

### P1 — Trader Lab y certificación externa
12. Archivo de preflight: \`qore-crt-alerts/trader-lab/34-instrument-source-preflight-2026-11-01.json\`. Estado verificado: \`data_license_verified:false\`, \`holdout_period_frozen:false\`, \`real_price_replay_executed:false\`, \`pine_compiler_executed:false\`, \`usable_holdout_count:0\`, \`source_artifacts_metadata_present:33\`, \`missing_source_symbols:["BTCUSD"]\`, \`source_content_software_attested:false\`, \`final_verdict:BLOCKED_SOURCE_DATA_LICENSE_BTC_HOLDOUT\`.
13. Inventariar/localizar ZIP OHLC originales de 33 mercados, **abrir y comprobar contenido** y SHA-256 reales (no basta metadata); completar BTCUSD con feed y derechos de uso apropiados; confirmar identidad de broker de fuentes IC/otros y mapeo TradingView, calendario de sesiones, licencia. **No marcar true en JSON sin prueba.**
14. Congelar holdout temporal pre-registrado antes de inspeccionar resultados, mantener no fuga de datos; determinar mercados/fechas, reproducir historia M5 fuente homologada y cotejar por \`source + C1 + H4 cierre + dir + sweep + pivote5/15 + cierre MSS5/15 + invalidación\` entre Pine A, Chart B y Trader Lab. Matriz por 34 mercados × modelos, falsos positivos/negativos, fechas DST y retests.
15. Solicitar y conservar evidencia TradingView REAL de compilación y visualización, paridad OHLC/horas, comparaciones negativas, rechazos y firmas holdout; solo tras esos gates aceptar modelo/familia.

### P2 — QORE CRT ALERTS autónomo Android, una vez certificada la señal
16. Auditar y reutilizar \`qore-crt-alerts/src/{closed-m5-ingestion,crt-h4,mss-m5,mss-m15,crt-structural-morphologies,crt-true-3c-rowdy-qa,crt-canonical-event-qa,signal-gate,observation-ledger,device-registration,fcm-delivery-policy,qa-device-http}.mjs\`, \`android/app\` y \`sql/\`. Ya hay código; no reescribir app desde cero.
17. Garantizar **proveedor M5 real licenciado** (histórico+stream, pausas y reintentos), motor Node/TS/Python independiente de TradingView con total paridad sellada, ledger PostgreSQL con idempotencia y transacciones, identificadores \`broker/ticker/C1/familia/dir/ratified/MSS\`.
18. Integrar API/backend segura (Railway/PostgreSQL si se usa, no presumir servicio CRT desplegado sin verificar), Firebase Admin + cliente Android, tokens rotados, permisos, MFA/autenticación cuando corresponda, preferencias por 34 instrumentos/M5/M15, historial, opt-in/opt-out, dedup, backpressure, rate-limits, observabilidad y botón de prueba QA.
19. Ejecutar un circuito E2E con **Android físico** y FCM real: vela M5 real → motor CRT → MSS 15 válido → evento canonical → registro → envío FCM → recepción Android → abrir detalle, sin duplicado; replay y casos negativos. No basta BUILD SUCCESSFUL Android.
20. Solo tras gates, activar alertas por consentimiento, no órdenes ni ejecución de trades. Mantener \`NO PUSH\` y rutas de notificación bloqueadas por defecto hasta aprobación expresa.

## MATRIZ BREVE
- GitHub motor y controles sintéticos: **PASS OFFLINE 716/716**.
- Esquema actual A/B \`Signal\` y \`f_engine\`: **PASS ESTÁTICO 132/132**.
- A D/E/F en TradingView Android: **evidencia visual parcial**, no compilación I.
- Pine Editor real A I/B I: **NO VERIFICADO**.
- MSS M5 Inside/Multi-N: **implementado QA, falta paridad real**.
- MSS 3C_TRUE M5 y M15 propios: **FALTA**.
- MSS Multi4 M5 (y verificar M15 propio): **FALTA**.
- Histórico estable 34×M5: **causa raíz NO AISLADA**.
- 4 familias estructurales: **detección código, no homologadas**; "7 familias reales": **NO DEMOSTRADO**.
- Trader Lab preflight: **BLOCKED_SOURCE_DATA_LICENSE_BTC_HOLDOUT**.
- Android compila en QA: **PASS BUILD**, no demuestra envío FCM.
- Alertas reales y FCM E2E: **BLOQUEADO/NO VERIFICADO**.
- PR #74: **DRAFT / NO MERGE / NO LIVE / NO PUSH**.

## ARCHIVOS DE ALTO VALOR
- Contraste DeepSeek A.1/A.2: \`qore-crt-alerts/docs/DEEPSEEK_V34_12I_A1_A2_CONTRASTE_TIEMPOS_M5_H4_2026_11_02.md\`.
- Integración I y límites: \`qore-crt-alerts/docs/CRT_RADAR_V34_12I_MSS5_INSIDE_MULTIN_CAUSAL_Y_CANONICAL_QA_2026_11_02.md\`.
- Auditoría maestra contrastada: \`qore-crt-alerts/docs/DEEPSEEK_AUDITORIA_MAESTRA_CONTRASTE_VERIFICADO_2026_11_02.md\`.
- Tests V34.12I: \`qore-crt-alerts/test/pine-v34-12i-inside-multin-family-mss5-parity.test.mjs\`, \`pine-v34-12i-first-segment-h4-terminal-order-regression.test.mjs\`, \`crt-canonical-event-qa.test.mjs\`.
- Protocolo 7 roles: \`qore-crt-alerts/docs/CRT_7_ROLES_REAL_CERTIFICATION_PROTOCOL_2026-11-02.md\`.
- Histórico D/E/F: \`qore-crt-alerts/docs/CRT_RADAR_V34_12F_INCIDENTE_HISTORIA_34_A_8_COBERTURA_2026_11_02.md\`.
- Trader Lab: \`qore-crt-alerts/trader-lab/34-instrument-source-preflight-2026-11-01.json\`.

## INSTRUCCIONES OBLIGATORIAS PARA EL NUEVO ARQUITECTO
1. Leer este handoff, los archivos A/B candidatos y sus tests actuales. Verificar HEAD/PR y GitHub Actions; si hay cambios posteriores, actualizar estado en base a evidencia (no asumir 716 actual inmutable).
2. **Ejecutar** tareas técnicas en GitHub, no limitarse a proponerlas. Un parche por causa demostrada, pruebas de regresión y registro en PR DRAFT; no merge sin autorización.
3. Primer cierre práctico: compilación REAL A I/B I; luego MSS propios 3C/Multi4 y pruebas de 34 feed; luego Trader Lab holdout; luego Android real. Si no hay acceso al Pine Editor, entregar al propietario Android los **dos enlaces Raw de las versiones candidatas** y el procedimiento para compilar, sin fingir un resultado.
4. DeepSeek no tiene acceso a GitHub en la sesión del propietario: debe recibir contenido íntegro de cada archivo (no solo URL), y material de pruebas si se desea auditoría secundaria. **No tratar un archivo truncado como auditoría completa**.
5. No preguntar de nuevo decisiones cerradas: dos indicadores, 34 feeds, BTC horario Forex, Android independiente de TradingView, sin LIVE/PUSH antes de certificación. No etiquetar "7 familias certificadas" sin láminas y tests de modelos independientes.
6. Actualizar matriz \`PASS VERIFIED / PASS OFFLINE / NO VERIFICADO / FAIL / BLOQUEADO\`, commit, evidencia y próximas acciones en el PR. Prioridad terminar sin falsas certificaciones, respetando usuario móvil.


---

## ACTUALIZACIÓN DE CONTINUIDAD — posterior al corte V34.12I (2026-11-02)

**Línea base actual:** HEAD previo al addendum `3bb4542f4bc267f508407a6faa25838f1aa5606e`, PR #74 OPEN DRAFT, NO MERGE / NO LIVE / NO PUSH.

### Cambios efectivos en esta sesión de continuidad

- `8b3263603ec0` + `fc09bce72c81`: TRUE 3C MSS M5 y M15 con candidato propio, pivotes previos confirmados y cruces posteriores por cierre en el mismo C1/C3; sin reutilizar confirmaciones 2C/Inside. Documentado en `docs/CRT_V34_12I_TRUE3C_OWN_MSS5_MSS15_QA_2026_11_02.md`.
- `cfbffcb897df` + `36fb1f2b6bcc`: Multi4 MSS M5 propio en C2a, retención solo hasta cuarta H4, mismo C1 y doble barrida inválida; MSS M15 Multi4 **sigue N/V**. Documento `docs/CRT_V34_12I_MULTI4_OWN_MSS5_QA_2026_11_02.md`.
- CI GitHub `36fb1f2b6bcc`: Foundation **720/720 PASS** 0 FAIL (run #41560266899); CRT Radar QA y DeepSeek Harness SUCCESS; Android QA BUILD SUCCESSFUL. **No representa certificación Pine real ni entrega FCM**.
- `1a71f1ac1c39`: se descargaron y verificaron en contenedor **33 ZIP originales** de calibración del preflight, con SHA-256 del ZIP igual al catálogo, 45/47 sumas internas verificadas por archivo, 0 divergencias; sus manifiestos declaran **24.377.420 M5**. Evidencia: `trader-lab/33-archive-content-integrity-audit-2026-11-02.{md,json}`. Los 12 ZIP antiguos y 21 nuevos tienen identidades de captura distintas. **No declarar** por esto licencia, paridad de broker, holdout ni aptitud LIVE. **BTCUSD sigue faltante**.
- `3bb4542f4bc2`: se recuperó en la Biblioteca del usuario el `DOSSIER_VISUAL_CRT.pdf`, se inspeccionaron visualmente las láminas **08/20** (cuatro modelos estructurales), **09/20** (variaciones 2C), **19/20** (confirmaciones LTF) y **20/20** (time-based); la **10/20 falta**. Ver `docs/ROWDY_FX_FUENTE_VISUAL_4_MODELOS_V34_12I_2026_11_02.md`. **Siete roles QA NO son siete familias CRT**.

### Puertas de aceptación todavía BLOQUEADAS

1. Compilar A/B V34.12I **en Pine Editor real**, corregir errores reportados y cotejar gráficos H4/C1, MSS5/MSS15, broker, timestamps, H4 de 48 M5 y DST NY. Ninguna compilación Pine real fue ejecutada aquí.
2. MSS M15 propio de Multi4, pruebas geométricas positivas/negativas de 2C/3C TRUE/Inside/Multi4/Multi-N; verificar independencia y misma familia/C1/ciclo en A/B.
3. Identidad proveedor↔ticker↔TradingView exacta, permisos/licencias de uso, sesiones, BTCUSD; separar archivos de investigación previa de holdout no observado, registrarlo formalmente antes de replay; conservar todos los flags de licencia/holdout en falso.
4. Investigar causalmente (no por parches) variación de contadores históricos, deduplicación 3C/Inside, rango dibujado y ranking 34 mercados.
5. QORE CRT ALERTS: feed M5 autorizado continuo, paridad del motor autónomo con Pine, seguridad de tokens y dispositivos, FCM real a teléfono físico, deduplicación y controles de usuario.

**No publicar indicador como certificado, no merge, no alertas LIVE, no push Android, no inferir PASS externo a partir de CI.**
