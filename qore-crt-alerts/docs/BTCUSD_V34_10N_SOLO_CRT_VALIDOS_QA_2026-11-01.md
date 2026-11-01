# CRT RADAR PRO V34.10n — SOLO CRT válidos entre 34 instrumentos

Fecha: 2026-11-01. Versión aislada NO INTEGRADA. No sustituye 10i/k/l/m.

## Requisito del propietario
"Yo no quiero que me muestre los 34 instrumentos, sólo quiero que me muestre cuando haya un crt valido."

El motor debe recorrer los 34 símbolos en modo `34 instrumentos (experimental)`, pero **solo** mostrar en la vista normal aquellos que cumplan CRT H4 C1/C2/C3 ratificado, vigente, fase 2, barrida C2 estricta y retorno estructural válido. El MSS M15 es obligatorio para una **confirmación de confluencia/entrada** futura, pero NO para reconocer un CRT H4 estructural válido. M5 y M15 se muestran en sus columnas independientes.

## Falla corregida
V34.10m incluía `st > 0` como filtro de resultados; con ello la fase provisional 1 y la memoria histórica fase 3 podían aparecer como si fueran CRT válidos. El contador CRT también los incluía.

## Solución
- Array `validCrtFlags` por símbolo, aislado de estado bruto y del MSS.
- Una fila CRT es válida cuando `phase == 2`, `isPatternValid`, `modelKind == CRT_2C_RETURN`, C1/C2 y `crtRatifiedAt` del mismo ciclo existen, y la ratificación ocurre como mínimo después de cerrar C2.
- Solo filas que cumplan el filtro llegan a `Solo CRT`, salvo la opción explícita de auditoría `Todos los instrumentos`.
- En el propio gráfico (fila fija 1), si no existe CRT H4 válido, mostrar `ESPERA CRT` y guiones en vez de atribuir al BTCUSD una señal inexistente. El gráfico sigue mostrándose y el módulo QA de BTC sigue visible para depuración.
- El resumen cambia de `CRT:n` a `VALID:n`. `34 SCAN QA` señala escaneo, no 34 señales ni feeds homologados.
- Mantiene la configuración por defecto `Vista = Solo CRT`, escaneo experimental 34 seleccionado por el usuario, sin alertas.
- No se modifica el motor M5/H4/M15, FVG, PDH/PDL, retest ni el conteo de solicitudes `request.security`.
- Si no hay coincidencias: mostrar `SIN OTROS CRT`; resultado normal, no evidencia por sí sola de que el escaneo esté roto.

## Verificación Android
1. Conservar V34.10m como respaldo. Abrir una copia V34.10n en COINBASE:BTCUSD M15, con `34 instrumentos (experimental)` y `Vista = Solo CRT`.
2. Comprobar que sin CRT H4 ratificado solo aparezca `ESPERA CRT`, ninguna fila de instrumento adicional falso, contador `VALID:0`.
3. En fecha/ciclo con C2 ratificada, debe aparecer el ticker y dirección; si MSS M15 aún espera, la columna debe quedar en guion.
4. Nunca mostrar C2 provisional (fase 1) ni último CRT expirado (fase 3) como CRT activo válido.
5. Pasar a `Todos los instrumentos` **solo para auditar la calidad del feed**, no como vista habitual ni como prueba de 34 CRT.
6. Comprobar CRT/MS5/MS15/PDH/PDL del gráfico y que se conservan los cuatro valores del retest M15 QA.

### Pendientes de certificación
- Compilación Pine V34.10n y prueba en TradingView Android aún pendientes.
- Los 34 instrumentos respondiendo no demuestran feed homologado, memoria bajo carga, paridad OHLC con backend ni no-repaint.
- FCM Android y alertas operativas desactivadas; no merge ni LIVE.
