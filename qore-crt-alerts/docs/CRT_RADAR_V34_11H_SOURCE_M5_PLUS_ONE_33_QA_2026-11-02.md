# V34.11h — fuente M5 con fase +1 minuto; 33 mercados, BTC independiente

**2 de noviembre 2026 | CANDIDATO EXPERIMENTAL / NO LIVE**

## Evidencia real recibida
Captura de TradingView Android NZDCAD M15 usando `CRT MSS QA 4C 11G`: la auditoría `QA NO BTC` sigue indicando `R:33/33, 0C1:30, C1+:3, BLOQ:30`. Primera página: AUDJPY `MAL INI=31, MAL FIN=31, NO48=1`; GBPUSD `31/31/2`; GBPJPY `31/31/1`; XAUUSD `33/33/7`. Última H4 de `IC:NZDCAD`: `# M5=48, INICIO Δm=1, FIN Δm=1`.

**Lectura:** hay evidencia de H4 aparentemente completas pero desplazadas +1 minuto frente a un anclaje NY a `:00`. Eso no demuestra que todas las fuentes tengan el mismo desfase, pero sí que el filtrado estrictamente a `:00` rechaza al menos esta H4 aunque haya 48 M5. Las etiquetas inferiores `12:01`, `20:16` del gráfico M15 son coherentes con una fuente de vela desplazada. Ni `PARC=943` ni `MAL INI` autorizan a corregir OHLC modificando timestamps sin preservar fuente.

## Solución implementada (segura para QA)

Archivo Pine `crt-radar-pro/CRT_RADAR_PRO_V34_11H_FASE_PROVEEDOR_33_QA_NO_LIVE.pine`, Git blob `638b01991bfce4901dbdfb3b9d640a8cdb896fd1`.

- En `03 / Dashboard`, nuevo ajuste `QA: probar desfase +1m M5 en 33 (SIN ALERTAS)` — ON por defecto en este **candidato QA solamente**.
- Para cada M5 cerrada del feed **no BTC**, si `minute(barT, America/New_York) % 5 == 1` **y segundos =0**, construye el bloque de la **fuente original** con el anclaje NY nominal +60.000 milisegundos. BTC usa únicamente su propio `f_btc_crt_h4_ny`, sin ningún desplazamiento. Otros offsets 2/3/4 minutos NO se arreglan por estimación ni se copian de NZDCAD.
- La fuente M5 desplazada también requiere **M15 propias**: agrupación M15 por :01/:16/:31/:46 y H1 por :01, exigiendo 3 o 12 M5 consecutivas exactamente, no inventando pivotes. Los once filtros de cierre exacto M15, incluidos Inside/Multi y retest, aceptan la fase real **únicamente** para la fuente no BTC en modo experimental. M15 estándar y BTC conservan cierre :00/:15/:30/:45; la M15 debe estar cerrada, el pivote confirmado y anterior a C2, y la ruptura debe ocurrir después de la barrida.
- Se conservan estrictamente `h4Continuous && h4Count == 48 && h4FirstT == h4Bucket && h4LastEnd == h4Bucket + H4MS`, los cierres M5, las condiciones CRT de C1/C2/C3, el MSS M15 independiente, la dirección y las reglas de invalidación.
- El dashboard de los 33 **identifica explícitamente `QA +1m`**, y muestra en cada fila `FX+1 / MET+1 / IND+0` (por ejemplo), con el `minute%5` de su **propia** M5, nunca de BTC.
- **Bloqueo explícito** de todas las alertas `if useAlerts and not qaPhase1NonBtc`. Los niveles de gráfico CRT no BTC no se muestran como operativos mientras QA +1m esté ON. Datos y contadores son diagnósticos, NO un certificado de CRT NY oficial `:00`.
- Siguen los mismos 34 símbolos `request.security(...,"5", ...calc_bars_count=1500)`, los mismos 60 plots y visualización compacta de fábrica. Cuando se desactiva el ajuste QA, se conserva el motor estricto anterior en los 33.

## Advertencia fundamental

**Una H4 de la fuente entre 01:01 y 05:01 no es exactamente la H4 NY estándar 01:00–05:00.** Es una reconstrucción **candidata** sobre velas originales desplazadas. No transformar el resultado en señal real hasta cotejar si el proveedor forma oficialmente H4/M15 con esas fronteras, si su OHLC coincide con las velas originales y cómo trata huecos/sesiones/DST. Ninguna etiqueta `C1+` posterior implica por sí sola un setup válido bajo CRT de Rowdy FX u otras variantes.

## Validación pedida en Android

1. Mantener V34.11g como respaldo. Crear indicador QA **V34.11h** desde la rama, dejando ocultos otros overlays; seleccionar IC:NZDCAD en M15 (y después M5).
2. Dejar `00 / Memoria: 34 instrumentos`; `03 / Dashboard: QA auditar los 33 instrumentos sin BTC` ON; `QA 33: mostrar causas H4` ON; nuevo `QA: probar desfase +1m M5 en 33 (SIN ALERTAS)` ON.
3. Capturar `R:xx/33, 0C1, C1+, BLOQ, HIST`, `MAL INI/MAL FIN/NO48` de la primera página y las líneas `# M5, INICIO Δm, FIN Δm`. Con fase +1 y 48 M5 correctas el último NZDCAD **debería** marcar 48/0/0 si el desfase tiene esa causa. Si permanece +1/+1, el script no recibió fase +1 del M5 que espera (problema de feed o Pine), NO forzar.
4. Recorrer las 9 páginas y observar por feed etiquetas `FX+0/FX+1` y análogas de índice/metal. Tomar 33 resultados individuales; la primera página sola no certifica 33.
5. Con QA +1 OFF, comparar bajo mismo proveedor/instante: si se restaura bloqueo 30/33, el cambio de fase contribuye. Comprobar la propia H4 del broker, así como M15 L2/R2 y primer cierre de ruptura con las velas cerradas, y validar un holdout fuera de muestra del mismo proveedor. En IC/M15 la última H4 debe tener continuidad sin huecos; si hay menos de 48, RECHAZAR.
6. Solo tras paridad real TV/Trader Lab/34 feeds y acuerdo explícito de la hora base del modelo CRT, habilitar otros caminos de producción. **NO MERGE / NO LIVE / NO PUSH**.

## Controles automáticos
`qore-crt-alerts/test/pine-v34-11h-33-source-phase-one-minute.test.mjs` contiene regresiones de 48 M5, fase +1, cero cambios BTC, rechazo de 47/49 velas, imposibilidad de alertar y auditoría por feed. `src/crt-seven-category-event-parity.mjs` fija SHA exacto V34.11h; resultado siempre UNCERTIFIED aunque las pruebas sintéticas coincidan.
