# HANDOFF MAESTRO — CRT RADAR PRO — CONTINUIDAD V34.9 / M5B V34.10b
**Fecha:** 31 octubre 2026
**Propietario del criterio y autorización:** usuario.
**Rol del nuevo chat:** Arquitecto Principal Pine Script v6, Integrador y Auditor independiente junto con DeepSeek.
**Misión:** terminar el indicador privado de TradingView sin reconstruir desde cero ni perder CRT, MSS, PDH/PDL, Inside Bar, dashboard o alertas.

## 0. INSTRUCCIÓN INMEDIATA AL NUEVO ARQUITECTO
1. LEER ESTE HANDOFF COMPLETO ANTES de cambiar código.
2. Consultar la fuente real en GitHub; no confiar en una respuesta previa de DeepSeek si su visor recorta datos.
3. **V34.9 es la única versión OFICIAL DE DESARROLLO; V34.10b es candidato NO INTEGRADO.**
4. Primero revisar respuesta de DeepSeek al Issue #54 (si existe), auditar errores y dejar un parche candidato; integrar solo con permiso explícito del propietario.
5. Mantener el método ChatGPT ↔ DeepSeek mediante **PROMPTS DE COPIAR Y PEGAR**. ChatGPT redacta instrucciones precisas, el usuario las transmite, DeepSeek revisa y devuelve análisis/parche, ChatGPT valida sobre GitHub y pide autorización antes de integración.
6. No declarar compilación en TradingView, ejecución real, alertas operativas o coincidencia gráfico/dashboard si no se han verificado.

## 1. FUENTES DE VERDAD — GITHUB (VERIFICADAS)
Repositorio público de colaboración de código y auditoría: https://github.com/mezas3238-hue/qore-deepseek-reviewer

- **V34.8** — base preservada (1.065 líneas; blob SHA `002ab35494c2d690af0cd5edd6725eea9806d8c6`):
  https://raw.githubusercontent.com/mezas3238-hue/qore-deepseek-reviewer/review/crt-radar-v34-8-v34-9-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_8_MODULO4B_INTEGRADO.pine
- **V34.9 M5A INTEGRADO, OFICIAL DE DESARROLLO** — (1.163 líneas; SHA `5cab1d68c3bb369543933e78294b08fe2a93c206`):
  https://raw.githubusercontent.com/mezas3238-hue/qore-deepseek-reviewer/development/crt-radar-v34-9-m5a-integrated-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_9_MODULO5A_INTEGRADO.pine
  Rama: `development/crt-radar-v34-9-m5a-integrated-20261031`.
- **V34.10 M5B candidato anterior NO integrado** — (1.221 líneas; SHA `e26361f0dbaf46c99bbde9b8b3c14199d20143ae`):
  https://raw.githubusercontent.com/mezas3238-hue/qore-deepseek-reviewer/review/crt-radar-v34-10-m5b-candidate-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_10_MODULO5B_CANDIDATO_NO_INTEGRADO.pine
  Problema: saltos normales de sesión tratados como pérdida de datos.
- **V34.10b M5B sesiones, candidato más reciente NO integrado** — (1.231 líneas; SHA `657a622f4d0b2fbcadad0b9b0f8261191d396261`):
  https://raw.githubusercontent.com/mezas3238-hue/qore-deepseek-reviewer/review/crt-radar-v34-10b-m5b-session-audit-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_10B_MODULO5B_SESIONES_CANDIDATO_NO_INTEGRADO.pine
  Rama: `review/crt-radar-v34-10b-m5b-session-audit-20261031`.
- Issue #52 (V34.9 + prompt M5B): https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/52
- Issue #53 (auditoría de V34.10 original): https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/53
- **Issue #54 (AUDITORÍA PENDIENTE: V34.10b; contiene seis extractos completos)**: https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/54
- Archivo de entrada para una auditoría anterior en fragmentos cortos, útil si DeepSeek trunca código grande:
  https://raw.githubusercontent.com/mezas3238-hue/qore-deepseek-reviewer/review/crt-radar-audit-numbered-60-20261031/crt-radar-pro/audit_numbered_60/INICIO_AUDITORIA_DEEPSEEK.txt

**REGLAS GIT:** ninguna rama principal `main` ha sido modificada por estas integraciones; NO merge, NO force-push, NO publicar resultados operativos no verificados, NO sobreescribir V34.8 o V34.9.

## 2. ESPECIFICACIONES DEL INDICADOR
- Plataforma: TradingView, editor Pine Script v6, usuario principalmente en Android; indicador **privado**, no estrategia con órdenes, sin integrar broker FundedNext.
- Universo: 34 instrumentos configurables (forex e índices) escaneados con `request.security(ticker,"5",f_engine())`. También calcula el instrumento del gráfico; hay dos expresiones de solicitud (una en el bucle de 34 y otra para el abierto), lo cual NO implica garantizar 35 solicitudes únicas en todos los casos, y debe auditarse contra límites TradingView.
- Dashboard: primera fila siempre corresponde al símbolo del gráfico, páginas para el resto de 34, símbolos/brokers configurables, columnas `ACTIVO | CRT H4 | PDH | PDL | MSS M5 | MSS M15`; estados provisorio, ratificado, invalidado, pendiente, etc. No ocultar el dashboard en gráfico M15.
- Alertas: por activo y señales MSS M5/M15; usuario quiere alertas Android, sujeto a verificación real del plan y del flujo de alertas de TradingView. No dar por operativas sin pruebas.
- Gráfico: solo CRT actual, no llenar histórico de CRH/CRL/MSS/objetos; niveles CRH y CRL de C1 H4 y nivel MSS del swing estructural correcto, sin líneas falsas.

### 2.1. REGLA CRT Y MSS
- C1: vela H4 acumulación terminada; sus High/Low son CRH/CRL.
- C2: vela H4 siguiente barre CRH o CRL (barrida **estricta**, no confundir toque con confirmación), y debe cerrar de nuevo dentro del rango C1. Toque exacto puede ser PRE-candidato visual solo; no da confirmación.
- C3: H4 siguiente distribuye en sentido opuesto al barrido. Invalida si la C3 H4 CIERRA fuera del extremo de la mecha C2 según dirección; no invalidar con un mero barrido intrabar M5.
- Requiere 3 velas H4 reales consecutivas y temporalidad H4 para CRT. C2/MSS pueden pasar a C3 según etapa, siempre sobre datos confirmados.
- MSS: ruptura **por cierre** de swing/pivote confirmado antes de la barrida, asociada al mismo CRT; hay detectores M5 y M15 independientes; pivote 2/2 por defecto; revisar frescura del pivote y dirección bull/bear.
- Casos Inside Bar y CRT de dos velas: subsistemas existentes, algunos experimentales/diagnósticos. Nunca reemplazan por sí solos la estructura CRT normal sin especificación y validación.

### 2.2. HORARIOS NY — DISCREPANCIA ABIERTA Y CRÍTICA
Requisitos expresos del usuario (zona `America/New_York`, con DST):
- **FOREX:** C1 01 → C2 05 → C3 09; C1 05 → C2 09 → C3 13; C1 21 → C2 01 → C3 05.
- **ÍNDICES:** C1 02 → C2 06 → C3 10; C1 06 → C2 10 → C3 14; C1 22 → C2 02 → C3 06.
- **DESVIACIÓN EN EL CÓDIGO V34.9:** línea 47 usa por defecto `scheduleMode="Todas las H4 NY"`, y los tres orígenes son modo opcional. Así, se examinan más C1 que las tres ventanas definidas por el usuario. No declarar resuelta la alineación hasta decidir/integrar la corrección o confirmar expresamente la intención actual del usuario. Respetar horarios NY incluso en DST. No inventar compatibilidad con horarios propios del bróker.

## 3. HISTORIAL TÉCNICO: TRABAJO YA REALIZADO
- V31–V34: motor M5 que reconstruye H4 y M15 para CRT y MSS M5/M15, escáner de 34, dashboard/paginación, símbolo del gráfico primero, CRT dinámico, estados C2 provisional/C3 ratificado y memoria limitada.
- V34.x: controles de continuidad de datos M5 (gaps) y cierre H4, candidatos Inside Bar, discriminación de patrones de 2 velas y expiración.
- **V34.8 M4B**: PDH y PDL por sesión de NY calculados con M5 cerradas; primera barrida estricta, clasificación por etapa `INT / T C2 / T C3 / T PRE / T OTR / N/D` o variantes visibles. Integración en dashboard sin usar PDH/PDL como filtros obligatorios.
- **V34.9 M5A (AUTORIZADO / INTEGRADO EN CÓDIGO Y GITHUB):**
  - Tipos `FvgBar`, `FvgContext`; `f_add_context_fvg(array<FvgContext> store,...)` ya tipada; NO volver a proponer cambiar `array store`.
  - Reconstrucción FVG H1 (12 M5 cerradas consecutivas) y H4 (48 M5 cerradas consecutivas); tres barras TF completas para detectar el espacio.
  - Bullish: `Low(C3)>High(C1)`; bearish: `High(C3)<Low(C1)`; sin igualdad, `formedAt` es fin de tercera vela cerrada, sin anticipación.
  - Estados al crear `INTACTO`; 10 FVG por TF/activo como máximo, deduplicación por identificador estable; H1 y H4 independientes; FVG solo es contexto NO gate de CRT; sin gráficos FVG ni nuevas solicitudes `request.security`.
  - DeepSeek auditó fragmentos: detectó inicialmente un supuesto defecto falso en tipado L164 y lo reconoció; luego auditó H1/H4 favorablemente. Esto NO constituye compilación real.
  - Se reportaron 46 verificaciones locales estáticas/simuladas; no son E2E ni garantías Pine.
- **V34.10 M5B (NO INTEGRADO):** DeepSeek propuso `firstTouchAt`, `maxPenetration`, `dataGap`, estados `INTACTO/PARCIAL/LLENADO_TOTAL/INVALIDADO/DATOS_INCOMPLETOS`. La propuesta original tenía falsa detección DATA_GAP con umbral arbitrario 10 min, sobrescritura de estado, penetración sin tope, código duplicado y sin seguimiento del último cierre procesado. ChatGPT corrigió estos aspectos en el candidato V34.10 y realizó simulaciones (55/55 locales reportadas), sin compilar. DeepSeek confirmó que la función mejoró y encontró el defecto de fines de semana.
- **V34.10b M5B (ÚLTIMO CANDIDATO NO INTEGRADO):**
  - `f_update_context_fvg` con una sola lógica para H1 y H4.
  - Seguimiento tras `formedAt`, barra M5 de 300000 ms, `lastEvaluatedEnd` contra doble procesamiento, `firstTouchAt`, `maxPenetration` limitado a 0..1, invalidación por CIERRE estricto más allá del extremo opuesto, llenado total por mecha, con precedencia de INVALIDADO.
  - Estados `DATOS_INCOMPLETOS` e `INVALIDADO` terminales en candidato; datos inciertos no deben reactivarse.
  - Revisión de pausas de sesión con `session.islastbar[1]`, `session.islastbar[2]`, `session.isfirstbar[1]` dentro del motor M5. Solo tolera gap entre final de sesión marcado por el proveedor y primer bar de la siguiente; de otro modo marca incertidumbre; no ignorar gaps solo porque cruzan medianoche o fin de semana.
  - Líneas precisas del V34.10b: función en 189; `knownClosedSession` 194; flags de sesión en 239–242; seguimiento H1/H4 dentro `f_engine()` alrededor 856–867; NO asumir que DeepSeek leyó más allá de lo que su visor muestra.
  - 11 comprobaciones estáticas y 20 simulaciones de reglas independientes fueron correctas, pero no son compilación Pine/QA del feed.
  - **PENDIENTE QUE DEEPSEEK AUDITE LA V34.10b**. Puede haber false positives de DATOS_INCOMPLETOS en proveedores sin `session.islastbar`; también comprobar que las marcas de sesión son apropiadas a FX, índices, CFDs, futuros, sesiones extendidas, días festivos y DST; revisar compatibilidad Pine.
  - El estado actual NO autoriza integrar M5B.

## 4. MODALIDAD OBLIGATORIA DE COLABORACIÓN CHATGPT + DEEPSEEK
**No se conecta DeepSeek automáticamente**: el usuario transporta manualmente los prompts/respuestas entre apps.
Ciclo de trabajo:
1. ChatGPT/arquitecto verifica en GitHub última rama, blob SHA, funciones y líneas.
2. ChatGPT redacta **PROMPT COMPLETO formato COPIAR Y PEGAR**, con misión, base exacta, enlaces GitHub RAW/Issue, requisitos, exclusiones, entregables, defectos comprobables y orden `NO INTEGRAR`.
3. Usuario pega el prompt en DeepSeek.
4. DeepSeek analiza y devuelve observaciones y/o parche; **nunca afirmar que inspeccionó 1200 líneas si su visor muestra 400**.
5. Usuario copia respuesta de DeepSeek en este chat.
6. ChatGPT verifica cada afirmación contra código REAL y decide ACEPTAR/RECHAZAR/EN REVISIÓN; no dar por buenas auditorías alucinadas.
7. Si se aprueba conceptualmente, preparar **archivo candidato en nueva rama** con diff acotado, pruebas locales, SHA y URLs. Solo integrar en versión oficial con autorización **EXPRESA** del usuario.
8. Repetir hasta terminar módulos; NO promover a `main`, ni a TradingView como producción sin validación.
**Truncamiento DeepSeek recurrente:** visor muestra código incompleto, a veces reduce ~1200 líneas a 300–400 o reinicia numeración; no perder tiempo mandando solo el RAW. Usar Issues GitHub que contienen extractos reales, o bloques de 40–60 líneas ABSOLUTAMENTE NUMERADOS y una pregunta específica. Enlaces que se corten al editar una WritingBlock NO sirven; enviar URL corto del issue y, si falla, pegarlos en texto plano. Lo más reciente: Issue #54, que contiene seis fragmentos del V34.10b.

## 5. TRABAJO PENDIENTE — ORDEN DE EJECUCIÓN
### P0 — Auditar, corregir y aprobar M5B V34.10b
1. Recuperar respuesta real de DeepSeek a Issue #54 o proporcionar prompt corto actualizado si aún no existe.
2. Verificar en código exacto `knownClosedSession`, `session.islastbar`, `session.isfirstbar`, `previousBarEnd`, constructor `FvgContext` y las llamadas en `f_engine()`.
3. Matriz: Forex FX 24/5; índice cash; futuros sesiones regulares/extendidas; CFDs; apertura domingo/cierre viernes; cortes diarios; festivos, DST NY; barra de proveedor faltante justo antes de cierre; símbolo sin marca de última sesión.
4. Diseñar semántica cuando faltan marcas: no inventar velas, no borrar FVG sanos por saltos reglamentarios si pueden verificarse, nunca ocultar gaps reales. Pedir a DeepSeek un parche mínimo **solo** si identifica defecto real.
5. Validar estados: INTACTO, toque exacto 0%, PARCIAL, LLENADO_TOTAL, INVALIDADO, DATOS_INCOMPLETOS, duplicación, primer M5 posterior y zona H1/H4 independiente.
6. Verificar no regresión: CRT/MSS/PDH/PDL/Inside/dashboard/alerts intactos, número de solicitudes no incrementado.
7. **No integrar V34.10b sin nueva orden explícita**; la aprobación previa fue exclusivamente para V34.9.

### P1 — Reconciliar reglas CRT H4 y horarios
- Resolver discrepancia `scheduleMode="Todas las H4 NY"` vs los 3 ciclos C1 solicitados para Forex e índices. No cambiar regla del dueño por iniciativa propia; presentar la discrepancia con evidencia y la corrección mínima.
- Confirmar que C1/C2/C3 no se mezclan, que C2 barre solo CRH o CRL, que cierre C2 vuelve dentro C1, que C3 cierra con reglas correctas, y que MSS se asocia al swing previo real. Verificar fechas NY DST y rollover.
- Revisar conflictos visuales observados por usuario: CRH/CRL/MSS mal ubicados, panel y gráfico con estados diferentes; ejemplos previos incluyeron EURCAD M15 y GBPAUD; pruebas deben hacerse en varios pares/índices, no solo un caso.

### P2 — Completar FVG más allá de M5A/M5B
- Relevancia FVG con ciclo CRT, asociación con `linkedCrt`, mitigación/vida útil y limpieza; definir si FVG es contexto, no filtro de rechazo.
- Detección futura de FVG M15 y M5 (siempre con datos cerrados), IFVG, inversión, zonas solapadas; propuesta técnica antes de integración.
- Modelos y estilos de entrada que usuario solicitó según imágenes compartidas en chats anteriores; NO inventar reglas que no estén confirmadas, pedir reutilizar las referencias/imágenes cuando se trabajen esos modelos. Para la mayoría de las tareas no bloquear por pedirlas antes de avanzar.
- Gráficos FVG y alertas opcionales discretos; mantener CRT actual visible y evitar saturación de líneas/cajas.

### P3 — Resolver UI/dashboard/escáner
- Validar 34 tickers configurables, comparabilidad de broker TradingView con FundedNext, símbolo activo primero y paginación; no desaparición al cambiar a M15/H4, consistencia de gráfica/tabla, estados provisionales y confirmados, actualización en invalidación.
- Verificar límites reales TradingView de `request.security()`, tiempo de ejecución, `calc_bars_count`, UDT/memoria y volumen de históricos; disponer de degradación elegante para símbolos inválidos.
- Comprobar alertas por CRT y MSS M5/M15, evitar duplicados, timestamps y recepción en Android.

### P4 — Pruebas y terminación REAL
- Compilar en Pine Editor v6, corregir TODOS los errores del compilador, conservar el código de regreso.
- Ensayos manuales/automáticos de lógica con datos históricos y replay de velas reales en distintas temporalidades/símbolos; comprobación de no repaint/lookahead y continuidad intrasesión/extrasesión.
- Contrastar FVG H1/H4 y M15/M5 con velas propias del proveedor, horarios y DST; confirmar mitigación e invalidación en eventos reales, no solo simulaciones JS/Python.
- Matriz de 34 instrumentos, abrir cada uno y verificar panel vs dibujo vs alertas.
- Publicar código final limpio para uso privado, instrucciones de instalación en móvil/TradingView y configuración de alertas.
- SOLO llamar `FINAL / CERTIFICADO` al cumplir criterios de aceptación: compila, no repinta, reglas CRT acordadas, FVG correcto, dashboard coherente, alertas verificadas, rendimiento soportable y aprobación propietaria.

## 6. ADVERTENCIAS Y DECISIONES INNEGOCIABLES
- V34.9 **oficial de desarrollo**, no oficial de TradingView ni instalada automáticamente. NO declarar V34.10 o V34.10b integradas.
- No extrapolar éxito de pruebas teóricas; antecedentes: 46/46 para V34.9, 55/55 V34.10, 31/31 V34.10b son inspecciones/simulaciones locales y no Pine Editor.
- No rechazar CRT por condiciones FVG, PDH, PDL opcionales; no crear señales de entrada sin MSS confirmado según especificación.
- No usar `request.security` adicional para cada TF o instrumento sin evaluar límites.
- No afirmar conexión real a DeepSeek, cuenta TradingView, editor Android, ni compilación si no existen resultados.
- No escribir un handoff tras otro sin avanzar; este documento debe conducir a código auditado y pruebas tangibles.

## 7. PRIMER PROMPT LISTO PARA DEEPSEEK (COPIAR Y PEGAR)
DEEPSEEK — CRT RADAR PRO, AUDITORÍA DEL ÚLTIMO CANDIDATO V34.10b. Código oficial de base V34.9:
https://raw.githubusercontent.com/mezas3238-hue/qore-deepseek-reviewer/development/crt-radar-v34-9-m5a-integrated-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_9_MODULO5A_INTEGRADO.pine
Candidato V34.10b (NO INTEGRADO):
https://raw.githubusercontent.com/mezas3238-hue/qore-deepseek-reviewer/review/crt-radar-v34-10b-m5b-session-audit-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_10B_MODULO5B_SESIONES_CANDIDATO_NO_INTEGRADO.pine
Lee PRIMERO el Issue #54, que contiene seis fragmentos REALES Y NUMERADOS:
https://github.com/mezas3238-hue/qore-deepseek-reviewer/issues/54
Audita las marcas de inicio y fin de sesión por símbolo/TF M5, el tratamiento de fin de semana, cierres diarios, festivos, DST NY, interrupciones reales del feed; valida el constructor FvgContext, las cuatro creaciones de FVG H1/H4 y las dos llamadas f_update_context_fvg dentro de f_engine. Documenta defectos comprobados con líneas exactas, riesgos no comprobados y parches mínimos. No confundas visor truncado con ausencia de código. No cambies ni integres. No afirmes compilación TradingView. Entrega dictamen APROBABLE SOLO PARA ENSAYO / REQUIERE CORRECCIÓN / NO AUDITABLE.

## 8. CRITERIOS PARA EL NUEVO CHAT
Al abrir el nuevo chat, el arquitecto debe:
- Contestar con estado objetivo V34.9 oficial / V34.10b candidato;
- Recuperar GitHub y revisar Issue #54;
- Elaborar o usar el prompt para DeepSeek y continuar revisión de M5B sin rehacer motores;
- Proponer plan de cierre por módulos + validación Pine;
- Documentar cada avance en GitHub con SHA y estado, sin main/merge sin permiso.
