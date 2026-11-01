# CRT RADAR PRO V34.10j — catálogo de modelos y entradas (QA)

Fecha: 1 de noviembre de 2026. Repositorio `mezas3238-hue/qore-deepseek-reviewer`, PR #55 DRAFT. **NO LIVE, NO merge ni señales FCM.**

## Petición del propietario

Incorporar todos los modelos de entrada CRT. No existe un catálogo
único y universal de CRT: varias fuentes describen el núcleo de
barrida y regreso, y variantes 2 velas, 3 velas, multicandle,
Inside Bar, expansión y reentrada MSS/retest. Véase
https://www.candelacharts.com/blog/candle-range-theory-crt
y https://docs.candelacharts.com/models/crt-model-tm/overview .

**Reglas ya fijadas del proyecto, que no se anulan silenciosamente:**
- CRT exclusivamente H4, C1 rango, C2 barrida estricta unilateral
  y cierre dentro de C1, C3 distribución consecutiva.
- BTCUSD y Forex: C1 01/05/21 hora America/New_York, DST.
- Solo M15 cerrado, pivot confirmado 2/2 pre barrida C2,
  puede confirmar durante C2 o C3. MSS M5 auxiliar.
- C3 invalida solo con cierre H4 fuera de mecha C2.
- Misma fuente del gráfico; BTCUSD Coinbase 1D PDH/PDL
  confirmado directamente de la D del proveedor.
- Una etiqueta "modelo detectado" jamás implica automáticamente
  entrada operativa, alerta ni orden.

## Código nuevo

Pine QA independiente (conserva V34.9 y anteriores, incluida la
V34.10i probada en TradingView):
`crt-radar-pro/CRT_RADAR_PRO_V34_10J_QA_CATALOGO_MODELOS_ENTRADAS_CRT_NO_INTEGRADO.pine`

Git blob SHA:
`feebb0850e2c34a6a3b6b16c1cebd45591e56665`

Copia TXT idéntica para teléfono Android:
`crt-radar-pro/CRT_RADAR_PRO_V34_10J_CATALOGO_ENTRADAS_CRT_ANDROID_COPIAR.txt`

En `06 / Modelos de entrada CRT (QA)` activar o desactivar
`Mostrar clasificación de modelos CRT`. Por defecto ON,
solo muestra nuevas filas en modo `BTCUSD solo` del mismo gráfico.
No hace nuevas solicitudes `request.security()` ni escanea los
34 mercados en paralelo (el modo 34 sigue experimental por memoria).

### Familias reconocidas / estados

| Familia | Reconocimiento | Entrada del Owner |
| --- | --- | --- |
| `CRT_3C_REVERSAL` bullish/bearish | C1/C2/C3, barrida y retorno | Confirmable **solo con M15** |
| `CRT_3C_MSS_C2` | MSS M15 cerrado en C2; se ratifica al cerrar C2 | Confirmable desde comienzo C3 |
| `CRT_3C_MSS_C3` | MSS M15 cerrado en C3 | Confirmable al cierre M15 |
| `CRT_2C_CANDIDATE` | C2 aún provisional | No; esperar cierre de C2 y C3 |
| `CRT_2C_EXPANSION` | C2 cierra fuera de C1 | **DIAGNOSTICO / DESCARTADO** |
| `CRT_INSIDE_RETURN` | Inside H4, barrida y retorno en módulo Inside | Solo diagnóstico, no equivale al CRT principal |
| `CRT_INSIDE_CONTINUATION` | Inside H4 y continuación fuera del rango | Solo diagnóstico, no entrada |
| `CRT_MULTICANDLE` | Familia incluida en catálogo backend | **No hay detector Pine operativo aún**, requiere reglas y autorización explícitas distintas de 3 H4 consecutivas |
| `CRT_M15_RETEST` | Familia registrada en backend | **No hay detector Pine operativo aún**, pendiente definir retroceso / confirmación exacta en M15 |

Las dos variantes MSS C2/C3 son subtipos de la familia
`CRT_3C_REVERSAL`. En el código de clasificación se exponen
**siete familias principales**.

### Cambios de interfaz

- Fila **MODELO CRT**: `CRT 2C CANDIDATO`,
  `CRT 3C REVERSAL`, `CRT 3C REV MSS C2`,
  `CRT 3C REV MSS C3`, `CRT EXPANSION` o
  `CRT 3C HISTORICO`.
- Estado independiente `ESPERA CIERRE C2`,
  `ESPERA MSS M15`, `M15 CONFIRMADO`,
  `DIAG NO ENTRADA` o `EXPIRADO`.
- Fila **OTROS CRT QA**: último Inside Return /
  Continuation, claramente marcado `SOLO DIAGNOSTICO`;
  se reservan MULTI y RETEST como QA, **no detectores
  certificados**.
- Dirección compra/venta y hora del evento M15 real.
- Nuevo valor Data Window:
  `QA CRT modelo entrada confirmado UTC min`.
- Los ✓ independientes de MSS M5/M15 quedan intactos.
  No hay activación de órdenes, ni Pine alertas por esta
  clasificación, ni cambios en el envío FCM.

## Motor offline independiente

El módulo `src/crt-entry-model-catalog.mjs` contiene la
taxonomía explícita de 7 familias, etiquetas `QA_CONFIRMED_M15`,
`AWAITING_MSS_M15`, `DIAGNOSTIC_ONLY`, `REJECTED`,
`INVALIDATED`, etc., con `sendPush:false`.

`replay-cycle.mjs` produce `modelCatalog`, usando la
confirmación real del mismo ciclo de `signal-gate.mjs`.
No permite entrada por MSS M5 aislado, doble barrida,
C2 fuera C1, C3 invalidada, pivote M15 posterior a barrida,
horarios extraños, mercados distintos ni FVG/contexto aislado.

Pruebas `test/crt-entry-model-catalog.test.mjs`,
`test/pine-btcusd-v34-10j-entry-catalog.test.mjs`,
y E2E extendido `test/btcusd-end-to-end-blocked-preview.test.mjs`.

## Qué NO está certificado

- No se ha compilado la **V34.10j** realmente dentro de
  TradingView Android. Se probó visualmente **V34.10i** anterior.
- El clasificador no convierte 2C, múltiples H4, Inside
  Continuation o reingresos FVG en señales del Owner:
  requieren reglas de entrada, invalidación y paridad
  específicas, no es legítimo fingir que ya son operativos.
- Los modelos identificados no tienen aún prueba de ventaja
  estadística, rentabilidad o parámetros de riesgo.
- El software Android independiente no recibe notificaciones
  reales y el sistema de push FCM sigue bajo gates.

## Prueba en teléfono Android

1. Guardar un gráfico privado con V34.10i como copia de respaldo.
2. Quitar V34.10i del gráfico actual. Abrir TXT V34.10j,
   copiar código completo, pegar en Pine Editor y añadir
   al gráfico BTCUSD Coinbase.
3. Comprobar en M5 y M15: una sola fila BTCUSD [G], MSS
   M15 independiente, PDH/PDL 1D coincidentes.
4. Ver fila **MODELO CRT**. Cuando se confirme M15 en C2
   o C3 debe pasar de `ESPERA MSS M15` a
   `M15 CONFIRMADO`. Cuando solo existe un Inside
   debe figurar como **diagnóstico**.
5. Enviar captura del panel con hora C2/C3 y estado.
   Ninguna variante puede certificarse con tests
   estáticos de GitHub únicamente.

## Próximo módulo

Definir y probar de forma independiente variantes aún no
operativas (múltiples H4, retest MSS M15, confluencia
PDH/PDL/FVG), sin ampliar horarios ni reducir la regla
`H4 + MSS M15` salvo orden explícita del propietario.
