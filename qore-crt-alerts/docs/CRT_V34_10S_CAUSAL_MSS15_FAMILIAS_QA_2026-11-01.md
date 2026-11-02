# CRT RADAR PRO V34.10s — MSS M15 independiente para Inside y Multi-N
Fecha: 2026-11-01 | NO INTEGRADO | PR DRAFT | NO LIVE

## Objetivo
El propietario solicita concluir el indicador multi-familia CRT (34 instrumentos, solo modelos válidos visibles) y después completar las alertas Android. V34.10r demostró vía captura real en COINBASE:BTCUSD M15: 2C:2, 3C:2, INS:1, M4:0, MN:0 históricos, sin eventos vigentes. V34.10r no enlazaba un MSS M15 causal propio a Inside/Multi-N. El índice `CRT:0 QA:0` actual no es defecto demostrado.

## Trabajo en Pine V34.10s
1. **Inside Bar**: se añaden `pivot15`, `pivot15At`, `mss15At` a cada `InsideCandidate` (máx. 10). En **la primera vela M5 cerrada** que barre estrictamente un extremo de C2 se congela el último swing M15 confirmado, del mismo `request.security` de ese proveedor. El pivote debe preceder al INICIO de la M5 barrida y estar dentro del límite de antigüedad existente. En barrida doble, se vacían esos datos.
2. **MSS Inside**: cada vela M15 se obtiene de **tres M5 consecutivas**. Solo después del cierre M15, comparando con la M15 previa contigua, se admite cruce desde el lado contrario del pivote congelado y `closed15At > inside.sweepAt`. No reutiliza el MSS del CRT 2C/3C. Un Inside que termina como CONTINUATION, UNRESOLVED o AMBIGUOUS no se publica como CRT válido aunque hubiese habido cruce.
3. **Multi-N**: se añade un pequeño arreglo de `MultiNMssCandidate`, **máximo cuatro candidatos por H4 terminal**, identificados por C1 y `terminalH4Start`. Cada candidato exige H4 precedentes completas y consecutivas, C1 horaria permitida y 2..5 H4 interiores estrictas. En la primera M5 barrida congela su pivote M15 anterior al sweep, recuerda la dirección y bloquea una barrida opuesta posterior. Mantiene su propio `mss15At`.
4. **Ratificación Multi-N**: en el cierre de la H4 terminal se conserva la misma definición estructural de V34.10q. Se extrae la evidencia MSS de la C1 y terminal H4 **exactas** del candidato correspondiente; se limpia el arreglo temporal de la H4 concluida. Si no hubo cruce durante la terminal, se permite un MSS M15 cerrado de la H4 siguiente con el pivote todavía congelado, mientras el evento QA conserve vigencia. No admite un evento M5 como si fuese M15.
5. **Huecos**: se reinicializan las pruebas MSS auxiliares al perder continuidad M5 del mismo proveedor. Ningún tick se emite si falta pivote pre-sweep, la M15 previa contigua o una M15 completa.
6. **`Signal` por símbolo**: se añaden `extraFamilySweepAt`, `extraFamilyM15Pivot`, `extraFamilyM15PivotAt`, `extraFamilyM15At`, `extraFamilyM15C1`, siempre de la familia seleccionada por su propio C1. Cuando no hay prueba completa los valores son `na`.
7. **Dashboard**: en `Solo CRT + QA` se muestra `M15 QA` SOLO cuando la familia Inside o Multi-N tiene prueba propia. Multi4 distribuido todavía **no** obtiene marca MSS propia. `Solo CRT` queda reservado a CRT principal vigente. En la Ventana de datos se exponen identidad C1, sweep, pivote y cierre M15 para cotejo OHLC.
8. **Alertas/órdenes**: la salida `alert()` sigue condicionada exclusivamente al antiguo `scanCrtValid`, `useAlerts=false` y el CRT principal; no se añade ningún envío FCM, ni auto-trading. **M15 QA no es entrada confirmada LIVE.**

## Pruebas en GitHub
- `src/crt-family-mss15-causal.mjs` ofrece réplica offline pura que comprueba fuente, ciclo, pivote formado y confirmado antes del sweep, M15 cerrada y continuidad.
- `test/crt-family-mss15-causal.test.mjs` cubre causalidad del mismo modelo, caso opuesto, falsos pivotes, mala fuente, M5 disfrazada de M15, huecos, ratificación H4 y eventos no accionables.
- `test/pine-v34-10s-family-m15-causal.test.mjs` revisa estáticamente congelación Pine, UDT, 34 símbolos, alertas OFF y MSS principal intacto.
- Pine y TXT completo Android deben mantenerse idénticos; el enlace de copia debe apuntar a la **rama GitHub**, no a un SHA aislado.
- La suite Node **NO compila Pine**. Una compilación real en TradingView Android + validación contra OHLC reales del mismo proveedor son obligatorias.

## Límites conocidos
- **Dentro de QA**: estructura Inside Return y Multi-N no pasan automáticamente a CRT operativos válidos en `Solo CRT`; falta certificación contra láminas originales y paridad M5 con backend.
- **Multi4 distribuido** no tiene aún un candidato MSS completo: ni la estructura de cuatro H4 ni la variación Multi-N quedan consideradas unificadas.
- Solo se expone en la UDT el evento QA adicional priorizado; varios modelos candidatos pueden coexistir internamente, pero el panel no muestra todavía todos los eventos simultáneos por símbolo.
- La definición de las «7 familias» debe seguir distinguiendo cuatro morfologías estructurales documentadas y tres categorías auxiliares/variantes/confirmaciones. Ninguna contradicción visual de DeepSeek se asume como regla aprobada.
- No se ha certificado escaneo estable de 34 símbolos, Pine/no repaint en vivo, ni E2E Android/FCM.
- Mantener los PR #55/#56/#57/#59/#61/#62/#63/#64 y esta rama **DRAFT sin merge ni LIVE**.

## Cómo validar desde Android
1. Conservar V34.10r (ya compila y muestra auditoría histórica).
2. Copiar el **TXT completo V34.10s** desde la rama GitHub usando Raw y agregar como un indicador nuevo.
3. Abrir `COINBASE:BTCUSD` en M15 con `34 instrumentos (experimental)`, `Solo CRT + QA` temporal, alertas apagadas.
4. Cuando aparezca Inside o Multi-N ratificado, observar `M15 QA` **solo** si la propia barrida y el pivote anterior provocaron ruptura M15 cerrada; verificar timestamps de Data Window cuando estén disponibles.
5. Comparar CRT tradicional, MSS M5, MSS M15, PDH/PDL y FVG frente a V34.10r. Los resultados principales no deberían alterarse.
6. Volver a `Solo CRT` para el uso normal; esperar que las familias no certificadas no aparezcan allí.
