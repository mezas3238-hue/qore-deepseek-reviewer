# V34.10n — SOLO CRT H4 ratificados, 34 símbolos escaneados

Fecha: 2026-11-01. Candidato separado en PR DRAFT. Sin merge ni alertas LIVE.

## Orden exacta del propietario
"Yo no quiero que me muestre los 34 instrumentos, solo quiero que me muestre cuando exista un crt de verdad".

El escáner sigue consultando hasta 34 símbolos para DETECTAR CRT, pero el dashboard enseña EXCLUSIVAMENTE instrumentos con CRT H4 real ya ratificado. No se solicita mostrar la lista de 34 instrumentos ni los que aún carecen de CRT. El modo de vista de todos se ha eliminado de esta candidata.

## Reglas del filtro V34.10n
- Un CRT presentado debe tener fase 2 (C2 H4 ratificada, C3 en curso), modelo `CRT_2C_RETURN`, `isPatternValid=true`, dirección +1/-1 y `CRH>CRL`.
- C1, C2 y comienzo de C3 deben ser consecutivos (tramos H4 exactos); barrida C2 estricta y registrada dentro de C2, con retorno confirmado previamente por el motor.
- El filtro descarta `phase=1` provisional, `phase=3` histórico, `phase=0` sin señal, expansión/rechazo y diagnósticos Inside/MULTI4/retest aislados.
- La propia fila BTCUSD del gráfico solo aparece si ese BTC realmente tiene CRT ratificado. Si ninguno de los 34 o del gráfico tiene CRT: `SIN CRT H4 RATIFICADO`.
- Una señal CRT H4 de calidad estructural puede aparecer **sin MSS M15**: entonces MSS M15 permanece sin ✓. Las alertas operativas mantienen la condición independiente de MSS M15 cerrado, mismo ciclo y misma fuente.
- Los 34 símbolos consultados siguen pudiendo generar `RESP:34 SD:0` aunque no exista CRT alguno: NO significa que haya 34 señales ni que los feeds estén homologados.
- Cuando hay varios CRT reales, se usan páginas; máximo 18 páginas para permitir cubrir el universo en caso extremo, con solo 2 a 5 resultados por página. Nada se rellena con símbolos vacíos.
- Se conserva la referencia explícita del proveedor en cada fila escaneada `IC:BTCUSD` para evitar confundirla con `COINBASE:BTCUSD` del gráfico.
- El motor de CRT, MSS M5/M15, FVG H1/H4, PDH/PDL y retest V34.10m no cambia. No se añaden consultas `request.security` ni se activan alertas.

## Prueba Android
1. Respaldar V34.10m. Copiar V34.10n a un script nuevo y mantener M5 de COINBASE:BTCUSD para la prueba.
2. Ajustar `Alcance escaneo = 34 instrumentos (experimental)`. `Vista = Solo CRT` (única opción).
3. Con `CRT:0` la pantalla de señales debe mostrar `SIN CRT H4 RATIFICADO` y ningún ticker sin CRT.
4. Cuando se ratifique un verdadero CRT H4 de cualquiera de los 34, mostrar solo ese ticker (incluido el proveedor en símbolos externos), con dirección y ✓ MSS M15 únicamente si hay cierre M15 válido.
5. Inspeccionar histórico C1/C2/C3 y comparar la vela cerrada contra las reglas. Confirmar ausencia de errores de tiempo/memoria del Pine Editor en móvil.
6. Mantener todas las alertas de TradingView y FCM Android desactivadas. Este QA NO acredita homologación simultánea de los feeds ni no-repaint.

## Puertas pendientes
Pine V34.10n: falta compilación y validación visual real en TradingView Android.
Backend/Pine: falta paridad OHLC por proveedor y escaneo 34 sostenido. Alertas Android: falta FCM/STAGING E2E.
PR #55, #56, #57 y esta candidata se mantienen sin merge ni despliegue LIVE.
