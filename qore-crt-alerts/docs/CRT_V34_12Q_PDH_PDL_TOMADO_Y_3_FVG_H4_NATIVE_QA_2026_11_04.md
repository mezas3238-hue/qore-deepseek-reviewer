# CRT RADAR 34+Chart V34.12Q — niveles 1D tomados e identificación FVG H4 del broker

Fecha: 2026-11-04. PR #74 DRAFT. **NO LIVE / NO PUSH / NO MERGE**.

## Solicitud actual del Owner

El Owner ya resolvió por su cuenta el problema de horarios/sesiones. No volver a alterar el motor de detección de CRT; la tarea es exclusivamente **marcar correctamente PDH, PDL y FVG** e indicar para cada nivel diario **TOMADO / INTACTO**.

## Archivo nuevo (V34.12P anterior conservado)

`crt-radar-pro/qa-34-feed-memory-probes/QORE_CRT_RADAR_34_CHART_V34_12Q_DAILY_TOMADO_FVG_H4_QA_NO_LIVE.pine`

### Niveles diarios del chart abierto

- El precio PDH/PDL sale exclusivamente del **ticker exacto del gráfico** y de la última vela `D` cerrada: `request.security(syminfo.tickerid,"D",[high[1],low[1],time[1],time_close[1]],lookahead=barmerge.lookahead_on)`. No usar `own.nyPDH/nyPDL` construidos con sesión de índice RTH 09:30–16 NY para fingir los extremos del Daily del proveedor. Referencia de 1D igual tanto en H4 como en 1D; precio histórico confirmado/no repaint.
- Dos estados independientes, reiniciados cuando `time("D")` marca **un nuevo día del mismo proveedor**:
  - `PDH 1D INTACTO` hasta que la mecha `high` observada en el día actual alcance o supere el PDH; después `PDH 1D TOMADO`.
  - `PDL 1D INTACTO` hasta que la mecha `low` observada en el día actual alcance o cruce el PDL; después `PDL 1D TOMADO`.
- Cada estado retiene por separado el inicio de la vela donde se observó la primera toma, en UTCmin de Data Window. En H4 **esa hora indica la APERTURA de la barra que lo tocó**, no la hora exacta intrabar ni una confirmación de cierre de vela.
- Líneas turquesa/fucsia si intactas; pasan a naranja al tomarse. No atribuir estos estados 1D al motor de liquidez RTH interno.

### FVG H4 del mismo proveedor, sin necesidad de CRT

- Una consulta adicional sobre el **H4 nativo del ticker abierto**, no sobre `own.fvgH4Top/Bottom` del bucket M5 del radar. La lógica del radar sigue intacta.
- Reconocimiento alcista: en tres H4 consecutivas **ya cerradas**, `low` de la tercera superior al `high` de la primera por al menos un tick; bearish inversa, `high` de tercera inferior al `low` de primera. Se exige adyacencia real de los timestamps H4 para no confundir saltos de fin de semana con FVG.
- Hasta tres zonas H4 activas y no completamente rellenadas (últimas 24 H4 por defecto). Se dibujan mediante boxes nativos y etiquetas:
  - **FVG H4 ALC/BAJ INTACTO:** ninguna mecha posterior entró a la zona.
  - **FVG H4 ALC/BAJ PARCIAL:** entró a la zona pero sin rellenarla completamente.
  - **FVG completamente rellenado:** dejar de mostrarlo; actualizar estado también con la H4 EN FORMACIÓN usando únicamente `high/low` que ya se observaron en el gráfico.
- FVG **no necesita que exista CRT** ni que su distancia al rango C1 sea pequeña. Los FVG anteriores de `f_engine` permanecen únicamente para diagnóstico interno, no se mezclan con los FVG dibujados por H4 nativo.
- No se usan barras H4 futuras: el muestreo desde `request.security(...,"240",...) lookahead_on` examina solamente índices **[1] en adelante** en el contexto H4. Se separa el movimiento **ya observado** de la H4 todavía abierta.
- Un hueco horario, un día sin negociación o falta de barras confirmadas puede suprimir zonas que una pantalla manual considere FVG; se informará en el contraste real con TradingView.

### Recursos / cuenta TradingView Basic

- Siguen los 34 slots M5, sin exclusiones ni allowlists nuevas; +1 única consulta a Daily y +1 única consulta a H4 del mismo ticker abierto. Estimación de **36 solicitudes únicas**, dentro del límite de 40 de cuenta no profesional, pero **no garantiza** ausencia de excesos de memoria/tiempo en Android.
- Las tres cajas FVG se crean/actualizan y se borran cuando su zona deja de ser válida; `max_boxes_count=5` y `max_labels_count=12` (CRT, PDH/PDL y FVG).
- **No se alteraron** `f_engine()`, clasificación 7 roles, filtro C1, población, stop/sesión ni MSS M5/M15. No se generan notificaciones ni señales operables.

## Verificación obligatoria desde el Android del Owner

1. Abrir `IC:US30` con las mismas opciones de símbolo/tipo de gráfico en 1D. Anotar máximos y mínimos de la vela Daily **anterior**.
2. En H4 con V34.12Q, confirmar que las dos líneas 1D coinciden exactamente con esos precios. Una mecha del día actual que toque el máximo debe poner **solo PDH** en TOMADO; una que toque el mínimo debe poner **solo PDL** en TOMADO. Al empezar un nuevo día cada uno vuelve a INTACTO con la nueva referencia.
3. Revisar una secuencia de 3 H4 consecutivas, contar visualmente el hueco entre 1 y 3, comprobar box direccional y condición INTACTO/PARCIAL/RELLENO al avanzar precio; contrastar en otro instrumento Forex/metales.
4. Comprobar en M5/M15 vs H4 la misma zona H4 confirmada. El gráfico 1D no muestra cajas H4, porque una consulta a timeframe inferior en D no constituye una secuencia H4 completa válida.
5. Si no aparece una zona/estado, comprobar que el gráfico coincide con el proveedor exacto de uno de los 34 feeds; **sin match no dibuja**. Recoger símbolo/proveedor, TF y hora de la barra para investigar. No declarar "7 familias certificadas" por ver los dibujos.

## Estado de pruebas

- `test/pine-v34-12q-daily-taken-h4-fvg-qa.test.mjs` verifica invariancia byte-a-byte del motor, 34 fuentes, solicitud diaria y H4, estados independientes de tomadas, cerraduras causales sin barras futuras, FVG sin CRT requerido, 3 zonas y sin alertas.
- Pruebas de repositorio Node son **QA estático**; todavía falta compilar y ejecutar este nuevo Pine en TradingView real y comparar las cotizaciones del mismo proveedor. No afirmar certificación sin esa prueba.

Documentación oficial: https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/ ; https://www.tradingview.com/pine-script-docs/writing/limitations/ .
