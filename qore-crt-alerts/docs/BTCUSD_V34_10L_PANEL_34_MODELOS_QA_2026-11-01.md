# CRT RADAR PRO V34.10l — panel 34/34 y diagnósticos visibles en BTCUSD
Fecha: 2026-11-01. Rama separada, PR DRAFT, NO LIVE, sin merge.

## Evidencia y alcance
El propietario aportó capturas de V34.10k en COINBASE:BTCUSD M15 y H4. Ambas muestran CRT bajista, MSS M5/M15 ✓, PDH/PDL 1D y modo 34 con 'OK:34 SD:0'. Aún no hay exportación auditada de Data Window, paridad OHLC o prueba de notificaciones reales. 'H4 BROKER != NY' es una advertencia de anclas H4 distintas, no una invalidez automática.

## Defecto de presentación
V34.10k dibuja el catálogo en filas 5/6 solo si `btcSameChartOnly`, que resulta falso cuando `scanAll=true`. Además los resultados paginados podían escribir en filas 5-14, ocupadas por diagnóstico y auditoría, sobreescribiendo filas.

## Solución V34.10l aislada
- En BTCUSD, mostrar MODELO CRT y OTROS CRT QA si `showEntryCatalog` está marcado, incluso en escaneo 34; se usa exclusivamente `own`, el mismo feed M5 del gráfico.
- Reservar filas 5/6 y 7-14. Paginación de otros símbolos: máximo 3 por página con catálogo BTC, 5 sin catálogo, aunque el ajuste solicite más filas. El gráfico abierto queda en fila 1.
- Hacer dinámica la etiqueta: M15 OK (QA) tras la validación propia, M15 REQUERIDO en espera.
- En escaneo 34: '34 SNAP QA' y 'RESP:n SD:n'. Respuestas de request.security NO prueban feed homologado, paridad, simultaneidad ininterrumpida ni no-repaint.
- Ninguna llamada request.security adicional. Código del motor intacto desde `f_index()` hasta `var table board` (incluye FVG H1/H4, CRT H4 NY, MSS M5/M15, PDH/PDL y auxiliares). Alertas OFF.
- V34.10i/j/k se conservan exactamente sin modificación.

## Archivos
- `crt-radar-pro/CRT_RADAR_PRO_V34_10L_QA_PANEL_34_MODELOS_NO_INTEGRADO.pine`
- `crt-radar-pro/CRT_RADAR_PRO_V34_10L_PANEL_34_MODELOS_ANDROID_COPIAR.txt`
- `qore-crt-alerts/test/pine-btcusd-v34-10l-dashboard-34.test.mjs`

## Prueba en Android
1. Conservar V34.10i y V34.10k. Crear un script nuevo desde el TXT 10l; no reemplazar el que ya funciona.
2. COINBASE:BTCUSD M15; escaneo '34 instrumentos (experimental)' y 'Mostrar clasificacion de modelos CRT' activado; alertas apagadas.
3. Comprobar filas MODELO CRT y OTROS CRT QA con etiquetas MULTI4 ESP / RETEST ESP o su diagnóstico fundamentado. No esperar patrones nuevos si aún no ocurrieron.
4. Inspeccionar M5 y H4; mantener mismos niveles CRT HIGH/LOW, MSS M5/M15, PDH/PDL. En H4 diferenciar H4 de broker de motor NY.
5. Capturar Data Window con timestamps de C1, C2, M5/M15, MULTI4 y RETEST para comparar mismo feed con backend.
6. Probar páginas sucesivas en vista 'Todos los instrumentos' y confirmar ausencia de sobreescritura, error de memoria o tiempos de cálculo. No inferir capacidad 34 solo de un instante.

## Comp puertas
Compilación real 10l Pine Editor: PENDIENTE.
Paridad Pine/backend y 34 feeds: PENDIENTE.
Android FCM STAGING E2E: PENDIENTE.
NO habilitar señales, FCM, LIVE, merge ni producción.

## Receptor Android — endurecimiento adicional sin entrega
- `NotificationPolicy.kt` compara el eventId de seis segmentos con símbolo, dirección, tiempo MSS y C1 del propio evento; impide usar una ruptura M5 como si fuera MSS M15 y exige cierre UTC M15 exacto.
- La ventana del evento debe estar después de C1+4H y no después de C1+12H. No acredita que exista un ciclo de mercado real.
- `NotificationPolicyTest.kt` agrega casos de suplantación cruzada, cierre M15 desalineado y ciclo ajeno.
- BuildConfig `STAGING_NOTIFICATIONS_ENABLED=false`, consentimiento/inscripción no verificados, sin SDK emisor, sin tokens ni push. El endurecimiento de la coherencia de un payload no equivale a autenticación de servidor, evidencia de TradingView ni autorización de LIVE.
