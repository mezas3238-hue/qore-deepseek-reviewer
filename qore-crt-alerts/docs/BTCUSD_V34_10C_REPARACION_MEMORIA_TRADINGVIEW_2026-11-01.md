# V34.10c QA MEMORIA BTCUSD — reparar "Memory limits exceeded"

**1 noviembre 2026 · candidato independiente; NO compilado aún en TradingView**

## Evidencia de campo y diagnóstico

Captura proporcionada por propietario en TradingView Android, gráfico BTCUSD H4:
indicador `CRT MSS QA C2` mostró **Error de ejecución —
Memory limits exceeded**. El script se cargó, por lo tanto el problema
no es necesariamente un error de sintaxis. La causa exacta requiere
perfilado en TradingView; la hipótesis de mayor peso es 35 llamadas
`request.security` con salida tipo `Signal` de 42 campos a lo largo
de hasta 2500 barras M5 por llamada. Además el motor mantiene tres
colecciones de pivotes/FVG/Inside de tamaño acotado en cada feed.

La documentación oficial de TradingView confirma que la devolución
repetida de UDTs/colecciones desde `request.*` puede superar memoria y
recomienda devolver objetos **solo en `barstate.islast`** cuando
únicamente interesa el estado actual, y limitar historial y peticiones:

https://www.tradingview.com/pine-script-docs/errors/RE10139/

## Corrección aplicada en GitHub, sin modificar la candidata anterior

**Nuevo script**, sin sobreescribir V34.9 o V34.10b:

[CRT RADAR PRO V34.10c QA MEMORIA BTCUSD](https://github.com/mezas3238-hue/qore-deepseek-reviewer/blob/feature/qore-crt-alerts-contract-20261031/crt-radar-pro/CRT_RADAR_PRO_V34_10C_QA_MEMORIA_BTCUSD_NO_INTEGRADO.pine)

Git blob SHA-1 exacto:
`3406fa3301ac7b4a65e7db5d02c14773b8c63739`

- Nuevo input `00 / Memoria (QA) > Alcance escaneo`:
  **BTCUSD solo (predeterminado)** o
  **34 instrumentos (experimental)**.
- Solo BTCUSD (slot 08) entra en el bucle de `request.security` por
  defecto. **Los 34 símbolos y sus inputs siguen en el código**,
  pero los otros 33 NO son escaneados en este modo.
- `f_engine_snapshot()` ejecuta `f_engine()` siempre sobre cada
  M5 del contexto, para conservar H4 C1/C2/C3, MSS pivotes 2/2,
  PDH/PDL e información FVG; únicamente devuelve el objeto `Signal`
  en `barstate.islast`. Esto evita almacenar la UDT completa en
  cada barra histórica devuelta a la gráfica.
- `calc_bars_count` baja de 2500 a 1500 para escáner y gráfico,
  manteniendo varias jornadas de M5 para la prueba de BTCUSD.
- La fila del gráfico siempre se calcula; si es BTCUSD con el
  mismo proveedor que s08 pueden quedar hasta dos solicitudes
  lógicas. Otros 33 NO aparecen como supuestas señales analizadas.
- Footer `BTC QA 1/34` hace visible la reducción; no declara
  falsamente cobertura simultánea 34/34.
- Se preservan `America/New_York`, C1 Forex 01/05/21, barrida
  estricta, H4 C3 close-only invalidation, MSS M15 obligatorio,
  alertas desactivadas por defecto y los 12 campos Data Window.
- El contrato de paridad backend acepta este SHA de candidata
  **solo para instrumento BTCUSD**, con captura real
  `verifiedOnTradingView:true`; no concede certificación.
- No se activó FCM, no hay merge ni trading LIVE.

## Pasos en Android para verificar en TradingView

1. **Retira del gráfico el antiguo `CRT MSS QA C2`** (señal
   de exclamación roja) para evitar seguir gastando memoria.
2. En Chrome Android activa **Sitio para computadora** si Pine
   Editor no aparece. Abre el nuevo script V34.10c del enlace anterior
   en GitHub, botón Raw/copiar archivo íntegro. En TradingView
   Pine Editor crea una copia privada y pega el nuevo código.
3. Elige BTCUSD en gráfico. Para comparación con Coinbase spot,
   utiliza **`COINBASE:BTCUSD`** tanto en el gráfico como en
   el input `BTCUSD` (s08). En la captura original solo se ve
   `BTCUSD`, el proveedor exacto no está confirmado.
4. En `00 / Memoria (QA)`, deja **BTCUSD solo**. Mantén
   `Escaneo C1 = Solo C1 de tres horarios NY`, alertas OFF,
   y confirma primero en **M5** y luego **H4** (la captura falló
   en H4). El modo 34 es experimental, NO elegir para esta prueba.
5. Envía captura del resultado: error de compilación con línea,
   **Memory limits exceeded** todavía presente, o indicador
   funcionando sin error con panel y C1. Cada resultado define
   el siguiente ajuste. No afirmar éxito sin evidencia real.

## Prueba de paridad posterior

Cuando V34.10c cargue sin error, usar un mismo ciclo BTCUSD de
`COINBASE:BTCUSD` y exportación exacta de M5 de Coinbase.
Comparar primero OHLC, luego 12 campos Data Window con
`qore-crt-alerts/scripts/compare-parity.mjs`. El laboratorio
anterior cruzó cambio horario NY y devolvió
`BACKEND_INCOMPLETE`; no inventar paridad en ese período.
Consulta:
`qore-crt-alerts/docs/BTCUSD_TRADINGVIEW_PINE_COMPILATION_AND_PARITY_2026-11-01.md`.

**Los tests de GitHub para V34.10c son ESTÁTICOS. NO compilan Pine en
TradingView ni demuestran que el fallo de memoria haya desaparecido.**
