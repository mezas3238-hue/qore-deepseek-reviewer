# CRT RADAR PRO V34.10u — Auditoría de los 34 símbolos, no solo BTCUSD
Fecha: 2026-11-01 | QA, DRAFT, SIN MERGE/LIVE

## Evidencia nueva del propietario: V34.10t en TradingView Android
Captura 1: `COINBASE:BTCUSD`, gráfico M15, indicador `CRT MSS QA 4C T`, `Vista: Auditoría histórica (QA)`.
**Lectura transcrita**:
- `34 HIST QA 2C:33 3C:23 IN:6 M4:2 MN:1`.
- `COBERT 34 RESP:34 SD:0 HIST:8 CRT:0 QA:0 M15QA:0`.
- `HIST M5 2C:2 3C:2 INS:1 M4:0 MN:0` para el ticker del gráfico, BTCUSD.
- `C2 RECH GAP:0 DOB:2 SIN:4 FUERA:5 HORA:0` en BTCUSD.
- `INS RECH GAP:0 DOB:1 OTRO:2 VENC:0 C3INV:0`.
- `MN TERM SIN:0 DOB:0 FUERA:1 H4 GAP:2`.
Captura 2: gráfico H1, `34 SCAN QA CRT:0 QA:0 RESP:34 SD:0`; `M5:44` de la H4 actual reconstruida. Dos indicadores pueden estar agregados, uno oculto: la imagen no demuestra 34 CRT simultáneos.
**Conclusión:** Ahora se comprueba que los 34 slots pueden devolver un estado y que el motor produjo historial de modelos en **8** de esos 34 feeds. NO prueba que los otros 26 tengan un problema; puede faltar estructura CRT, historial cerrado M5 suficiente o datos continuos. Los 65 registros de categorías NO son 65 señales; un mismo C1 puede estar en 2C y 3C. `CRT:0 QA:0` = ninguna formación vigente cumpliendo los filtros al instante de la captura, NO fallo demostrado.

## Bloqueo de observabilidad de V34.10t
La fila `34 HIST QA` suma por familia pero no permite saber **qué símbolos** contribuyeron los contadores. Para aislar los 26 sin detecciones hay que exponer las métricas del mismo `Signal` recibido por el escáner: `qaC1Ready`, `audit2C`, `audit3C`, `auditInside`, `auditM4`, `auditMN`, `auditH4Incomplete` y causas C2.

## Nuevo V34.10u (camino QA, sin alteración del motor)
- Añadir `Vista: Auditoría 34 por símbolo (QA)` como opción **NO predeterminada** de `03 / Dashboard`.
- Mantener `Alcance escaneo = 34 instrumentos (experimental)` por defecto.
- Usar solo los `Signal` de las 34 llamadas M5 **ya existentes**. No añadir `request.security`, `plot`, `alert` ni tocar `f_engine()`.
- Guardar en 10 arrays acotados (cada uno 34 enteros) si el slot tiene datos, C1 históricas, 2C/3C/Inside/Multi4/Multi-N, H4 incompletas, rechazos C2 y MSS15QA activo. La agregación no crea señales.
- La vista QA lista en el mismo panel **10 símbolos por página**, cuatro páginas, seis columnas:
  `ACTIVO | 2C/C1 | 3C | INS | M4 | MN`.
- `2C/C1` muestra, p.ej., `0/4`: había 4 C1 elegibles pero ningún 2C ratificado. `N/D` significa que `request.security` no entregó estado. `0/0` significa que el motor respondió, pero no contabilizó C1 en el historial procesado.
- El asterisco junto al ticker significa que hubo H4 incompleta; **no equivale necesariamente a pérdida del proveedor**, debido a DST, arranque incompleto, horarios o pausas.
- Resumen de página: gaps, rechazos C2 y MSS15QA; pie con número de página, `HIST:n`, `RESP:n`, `SD:n`, `CRT:n`, `QA:n`.
- `Solo CRT` y `Solo CRT + QA` no cambian; siguen enseñando solo formaciones actuales aprobadas según su estado y QA respectivamente. El panel con 34 tickers solo existe en modo de auditoría solicitado por el usuario.
- Si se activa `BTCUSD solo` para probar memoria, en auditoría solo se presenta el slot 08, y se señala la cobertura correcta.

## Guía QA Android
1. **Preservar V34.10t**, que el propietario ya ha cargado en el móvil. Crear indicador nuevo con el TXT completo V34.10u desde la rama GitHub, no un enlace de SHA.
2. Abrir `COINBASE:BTCUSD` M15, `Alcance escaneo: 34 instrumentos (experimental)` y alertas OFF.
3. Seleccionar `Vista: Auditoría 34 por símbolo (QA)`. Tomar capturas en `Pagina = 1, 2, 3 y 4`.
4. Determinar cuáles son los ocho tickers con contadores 2C/3C/Inside/M4/MN positivos. En cada ticker con `0/0` revisar horarios de mercado y disponibilidad de M5. En `0/NN` con C1 positivas buscar descartes C2 con OHLC y timestamp del mismo proveedor. Para entradas, considerar solo C1/C2 con H4 completa y MSS M15 causal del mismo ciclo.
5. Volver a `Vista: Solo CRT` para el uso habitual: **ninguna lista permanente de 34 mercados**.
6. Si falla compilación Pine/tiempo/memoria en TradingView Android, conservar 10t y registrar el error exacto. Los tests GitHub NO sustituyen compilación real.

## Criterios de salida pendientes
- Validar fuentes/horarios NY de cada símbolo Forex/índice y materialidad de los 26 sin patrones; `RESP:34` por sí solo no certifica todas las series.
- Unificar modelo Multi4 propio y sus MSS M15; revisar ambigüedad del catálogo heredado de "7 familias" sin fabricar siete modelos que las láminas no documentan.
- Validar Pine v6 en Android, no-repaint, tolerancia a cierre de mercados y consumo en 34 contextos.
- Alertas Android sin TradingView (backend+push) requieren E2E real autenticado. **NO FCM, NO LIVE, NO ÓRDENES, NO MERGE**.
