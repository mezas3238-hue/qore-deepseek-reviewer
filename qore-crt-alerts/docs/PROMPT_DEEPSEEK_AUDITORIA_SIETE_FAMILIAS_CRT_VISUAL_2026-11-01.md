# PROMPT PARA DEEPSEEK — AUDITORÍA DEFINITIVA DE LAS 7 FAMILIAS CRT
## CRT RADAR PRO + QORE CRT ALERTS — solo investigación y especificación técnica

Actúa como investigador experto en Candle Range Theory (CRT), analista forense de diagramas, arquitecto Pine Script v6 y auditor independiente. Necesito **completar la detección simultánea en 34 instrumentos** del indicador existente, conservando MSS M5 y M15 independientes y una futura app Android de alertas. **NO reconstruyas desde cero ni escribas código definitivo hasta resolver las ambigüedades de taxonomía.**

### Fuentes obligatorias y precedencia
1. **Adjunto obligatorio del propietario:** `DOSSIER_VISUAL_CRT.pdf` (20 páginas). Lee las imágenes, no solo el texto. Láminas cruciales: Rowdy FX 07/20, 08/20, 09/20, 11/20, 19/20, 20/20; anteriores PREV02, PREV03, PREV05, PREV06, PREV07, PREV08 (páginas 5, 6, 10, 11, 12–15). Del curso hay 19 de 20 láminas, **falta 10/20**: no inventes su contenido.
2. Fuente de código **Pine actual V34.10n**: https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/feature/crt-radar-v34-10n-valid-only-20261101/crt-radar-pro/CRT_RADAR_PRO_V34_10N_SOLO_CRT_VALIDOS_QA_NO_INTEGRADO.pine
3. Clasificador actual: https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/feature/crt-radar-v34-10n-valid-only-20261101/qore-crt-alerts/src/crt-entry-model-catalog.mjs
4. Detectores auxiliares QA: https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/feature/crt-radar-v34-10n-valid-only-20261101/qore-crt-alerts/src/crt-auxiliary-models.mjs
5. Handoff de V34/V35 y análisis anteriores (adjunto si se aporta): `HANDOFF_MAESTRO_CRT_V34_CONTINUIDAD.md`, `CRT_MSS_H4_ENTRADAS_V35.pine`. V35 es experimental, no base certificada.
6. PRs de continuidad #55, #56, #57, #59 en el repositorio indicado. No tocar ni fusionar PRs.

**Si una fuente no está accesible para ti, indícalo exactamente antes de opinar. No afirmes haber visto imágenes o código que no pudiste abrir.**

### Ambigüedad principal: "7 familias" vs "4 modelos estructurales"
Las láminas Rowdy FX 08/20 y PREV05/06/07 muestran **cuatro morfologías**: CRT de 2 velas, CRT de 3 velas, CRT de múltiples velas e Inside Bar. El código existente enumera **siete categorías**:
A. CRT_3C_REVERSAL
B. CRT_2C_CANDIDATE
C. CRT_2C_EXPANSION
D. CRT_INSIDE_RETURN
E. CRT_INSIDE_CONTINUATION
F. CRT_MULTICANDLE
G. CRT_M15_RETEST

Esto **NO demuestra** que sean siete familias estructurales. En particular, B puede ser fase, C puede ser invalidación y G puede ser entrada posterior. El propietario exige que el radar reconozca **las siete familias reales acordadas**, escaneando 34 instrumentos; **NO convertir siete etiquetas arbitrarias en siete señales**.

#### Entregable 1 — Taxonomía auditada
Construye una tabla de cada modelo/estilo con:
- ID estable propuesto, nombre exacto usado en fuente, clasificación: MORFOLOGÍA / ESTADO / INVALIDACIÓN / CONFIRMACIÓN / ESTILO DE ENTRADA.
- Imagen y página exacta o cita visual específica que sustenta su existencia.
- Reglas observables, lo que es explícito en imagen y lo que es interpretación.
- ¿Se confirma autónomamente como CRT H4 estructural? ¿Requiere C3? ¿MSS M15 propio?
- Cómo representar la variante alcista y la bajista.
- Evidencia insuficiente y preguntas que debemos devolver al propietario, si existen.

Decide con prueba documental si hay **7 familias morfológicas**, **4 modelos morfológicos + estilos de entrada**, u otra clasificación. Si las siete familias previas no están definidas, **no inventes una taxonomía nueva** para satisfacer el número; devuelve la lista exacta que queda por aprobar.

#### Entregable 2 — Máquina de estados por modelo
Para cada morfología verdaderamente documentada, especifica condiciones algorítmicas en OHLC y timestamps:
C1 H4 terminada, CRH/CRL/50%; barrida estricta y/o toque; C2 retorno, cierre dentro o fuera; Inside Bar que altera el orden; manipulación distribuida en N velas; C3 y distribución; invalidación (cierre H4), precedencia y caducidad.
Incluye casos simultáneos/superpuestos: un instrumento puede contener candidatos de varias familias en diferentes C1 y la última C1 no debe borrar los anteriores.
Para cada una define los estados `CANDIDATE`, `RATIFIED_H4`, `AWAITING_MSS_M15`, `MSS_M15_CONFIRMED`, `INVALIDATED`, `EXPIRED` cuando sean aplicables.

#### Entregable 3 — MSS, contextos y estilos independientes
- MSS M5 y MSS M15 por pivote confirmado L2/R2 (parametrizable), pivote anterior a la barrida, ruptura **por cierre de SU temporalidad**. No copiar M5 como M15.
- Confirmación M15 durante C2 o C3 si es del MISMO ciclo, símbolo, proveedor y dirección. No usar barras incompletas ni datos futuros.
- Definir por separado los estilos dibujados: MSS M5, MSS M15, doble MSS, CISD, TS/TBS, KOD, retroceso 50%, OTE, retest MSS M15 y contexto FVG H1/H4, PDH/PDL. No permitir que una etiqueta de contexto cree un CRT ni un tick M15.
- Resuelve expresamente si "CRT de 2 velas" requiere C3 para ratificarse o puede ratificarse en el cierre de C2; las imágenes muestran variantes y el código actual obliga a 3 H4. No imponer reglas del 3C a los cuatro modelos sin evidencia.

#### Entregable 4 — Calendario, datos y rendimiento
- Horario America/New_York con DST: Forex referencias C1 01/05/21, índices 02/06/22; el handoff antiguo pide analizar todas las H4 de la cuadrícula en modo ampliado. Explica precedencia frente al modo estricto opcional.
- H4 y M15 agregadas desde **M5 cerradas del MISMO proveedor**; gestión conservadora de interrupciones del mercado, gaps, DST y cierres incompletos.
- 34 instrumentos en una instancia Pine; `request.security`, límite de tiempo/memoria, riesgo en M5/M15/H4 y qué arquitectura es viable sin inventar que está certificada.
- Mostrar únicamente tickers con un CRT **válido según SU modelo** (no candidatos ni históricos), distinguiendo `CRT RATIFICADO` de `CRT + MSS M15`. No mostrar lista completa de 34.
- NO emitir órdenes, activar LIVE ni notificaciones Android antes de E2E.

#### Entregable 5 — Tests y plan de integración
Diseña fixtures sintéticos de velas H4/M5/M15 para **cada familia aceptada**, alza/baja, varios C1 simultáneos, MSS C2/C3, doble barrida, C2 fuera, Inside, Multi, huecos, DST, no-repaint y 34 activos. Entrega matriz `modelo | OHLC/timestamps | esperado | motivo`.
Compara **V34.10n actual vs reglas de cada imagen** y da parche mínimo en pseudocódigo, con componentes y archivos exactos. Si entregas Pine v6, márcalo CANDIDATO sin afirmar compilación real. No modificar la base ni fusionar PRs.

### Formato de respuesta requerido
1. Confirmación de archivos e imágenes realmente abiertos.
2. Tabla `FUENTE → CONCLUSIÓN → CONFIANZA → REGLA`.
3. Matriz de las siete categorías actuales, señalando cuáles son familias estructurales reales y cuáles son fases/confirmaciones/invalidaciones.
4. Especificación de modelos estructurales por separado y estilos de entrada por separado.
5. Contradicciones exactas y preguntas de decisión si no están resueltas.
6. Fixtures H4/M5/M15 y regresiones a exigir.
7. Propuesta de arquitectura conservando el Pine V34.10n, 34 escaneos y la aplicación Android con notificaciones bloqueadas.

**Importante:** no optimices modelos por win rate imaginario; no mezcles dibujos teóricos con señales reales, ni autorices LIVE. Toma las imágenes del propietario como evidencia prioritaria y las afirmaciones no sustentadas como hipótesis explícitas.
