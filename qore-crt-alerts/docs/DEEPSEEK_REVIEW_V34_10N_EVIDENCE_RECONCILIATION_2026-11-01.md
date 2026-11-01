# Respuesta DeepSeek contrastada con V34.10n y dossier CRT original
Fecha: 2026-11-01. Auditoría QA; NO INTEGRADO / NO LIVE.
Fuente principal: imágenes originales del propietario en `DOSSIER_VISUAL_CRT.pdf` (biblioteca ChatGPT).
Documento GitHub: Issue #60. Código base PR #59 sin modificaciones.

## Evidencia y taxonomía
- Rowdy FX 08/20 (dossier p.5), PREV05/06/07 (p.14/15): cuatro **morfologías** CRT: 2 velas, 3 velas, varias velas, Inside Bar.
- Rowdy FX 09/20 (p.6): variantes de las 2 velas.
- Rowdy FX 19/20 (p.10): MSS, CISD, KOD, TS/TBS, OTE como **confirmaciones/estilos de entrada LTF**.
- Rowdy FX 20/20 (p.11): time-based CRT, confirmación posible en C2.
- Faltó Rowdy 10/20; no reconstruir de memoria.
- Los siete IDs en `src/crt-entry-model-catalog.mjs`: `CRT_3C_REVERSAL` (estructura), `CRT_2C_CANDIDATE` (fase), `CRT_2C_EXPANSION` (rechazo/contexto), `CRT_INSIDE_RETURN` (variante estructural), `CRT_INSIDE_CONTINUATION` (variante no aprobada), `CRT_MULTICANDLE` (morfología QA), `CRT_M15_RETEST` (confirmación posterior). **No son siete familias morfológicas independientes**. Si el propietario exige siete modelos estructurales adicionales, se necesita nombre/evidencia explícita, no se inventarán.

## Verificación de afirmaciones DeepSeek contra código REAL V34.10n
1. DeepSeek declara no tener acceso al PR #59; su apartado de diferencias es hipotético. Esta auditoría sí abrió el archivo completo `CRT_RADAR_PRO_V34_10N_SOLO_CRT_VALIDOS_QA_NO_INTEGRADO.pine`.
2. **3C YA EXISTE**: líneas ~962-1053, C2 barrida única estricta + cierre dentro de C1; `c3Active` desde cierre C2. En ~886-903, cierre H4 C3 invalida solo si traspasa mecha C2. No implementar por segunda vez.
3. **MSS C2 ya es posible**: el código conserva `c2M15At` y `c2M5At` al ratificar C2; C3 puede confirmar M15 que falta. Por tanto, la frase DeepSeek `MSS en 3C se busca en C3` no debe imponerse.
4. **Inside Bar YA EXISTE**, en `insideCandidates`: C2 inside estricta, barrida C3 por M5, `RATIFIED` al cierre dentro de **C2**, `CONTINUATION` al cerrar fuera de **C1**, `UNRESOLVED` al cerrar dentro C1 pero fuera C2 (líneas ~905-960, 1147-1168). DeepSeek propone aprobar cierre dentro C1: contradicción sin evidencia, mantenerla como hipótesis.
5. **MULTI4 YA EXISTE como diagnóstico**, líneas ~858-885: C1, barridas distribuidas en dos H4, distribución en cuarta; NO es exactamente el nuevo modelo propuesto por DeepSeek (varias velas dentro C1 y barrida final). Se implementan ambas interpretaciones **por separado SOLO QA**.
6. **Filtro 34 limitado a una sola familia**: línea ~1472 `s.modelKind=="CRT_2C_RETURN"`, `phase==2`. Ignora estados `insideCandidates` y MULTI4 aunque existan como diagnósticos del motor. No afirmar 7/7 escaneadas como CRT válidos ni activar alertas para ellas.
7. `Signal.isPatternValid` ya existe separado de `m15At`; DeepSeek infirió una mezcla sin localizarla. La clasificación del panel sigue necesitando identidad/pivote M15 por modelo.
8. La reconstrucción usa M5 cerrado y 34 `request.security` (una por símbolo), más M5 y D del gráfico. Límite oficial TradingView: 40 solicitudes únicas, 64 en Ultimate; pero los límites de memoria/ejecución y datos del proveedor requieren pruebas reales, no basta contar llamadas. Documentación TradingView https://www.tradingview.com/pine-script-docs/writing/limitations/

## Trabajo nuevo en la rama
- `src/crt-structural-morphologies.mjs`: **motor autónomo offline de cuatro morfologías** con clasificación separada de los siete IDs heredados.
- 2C válido exclusivamente si hubo una barrida estricta unilateral y cierre de C2 en el rango C1.
- 3C hereda el **mismo** ciclo ratificado en C2, y la tercera H4 cerrada verifica invalidación por extremo de C2; evita duplicar oportunidades. La clasificación histórica 3C después del cierre no sustituye al comportamiento durante C3.
- Inside retorno estricto a rango C2 solo QA, con ambigüedad C1-only y continuation no certificadas.
- Multi-Candle consolidación dentro C1 + barrida terminal C1 y retorno: hipótesis DeepSeek, QA; Multi4 barrida distribuida: interpretación preexistente preservada como diagnóstico separado.
- M15 correlacionado exige `state MSS_CONFIRMED_C2/C3`, `cycleId`, proveedor, símbolo, dirección, pivote previo, ruptura por cierre, sello M15 cerrado y tiempo observado. Sin heredar tick de otro modelo.
- Pruebas sintéticas H4 y M15, including invalidación, proveedor ajeno, gaps y doble barrida.
- El nuevo motor **no está conectado** al Pine ni a FCM; NO crea una alerta/orden independiente.

## Criterios de trabajo siguientes
1. Aprobar definiciones exactas Multi vs Inside C1/C2, y resolver 2C/3C mismo ciclo sin doble conteo. Cualquier regla no explícita será QA, no LIVE.
2. Tras pasar test offline, integrar salida estructural en `Signal` UDT del Pine por cada proveedor, sin añadir request.security por familia; conservar candidates simultáneos en un array acotado.
3. Escanear 34 alimentando las cuatro morfologías, pero mostrar solo CRT H4 estructuralmente RATIFICADO por SU regla. Mostrar modelo y dirección (sin 34 filas vacías). M15 M5 independientes por mismo ciclo, no reciclados; no generar ✓ para Inside/Multi hasta que su propia confirmación sea comprobable.
4. Validar compilación real Pine v6 y performance en TradingView Android/M5/M15/H4; fixtures con feeds homogéneos Forex, índices y BTC. Validar NY y DST, cierres de sesiones, ausencia de lookahead.
5. Paridad Pine/backend sobre mismo OHLC M5, serialización de eventId y replay, pruebas FCM E2E en Android solo STAGING tras autorización aparte.
6. PR DRAFT y NO MERGE, NO LIVE. Proteger V34.10i/k/l/m/n y PRs #55/#56/#57/#59.

## Cambios que NO se autorizaron todavía
- Convertir todos los diagnósticos a CRT válidos, activar señales/push o órdenes.
- Exigir C3 para 2C ni exigir solo C3 para MSS 3C.
- Sustituir el modo de los 34 símbolos por 34 indicadores o dibujar 34 filas constantes.
- Confundir `CRT_2C_EXPANSION` y retest M15 con morfologías estructurales.
