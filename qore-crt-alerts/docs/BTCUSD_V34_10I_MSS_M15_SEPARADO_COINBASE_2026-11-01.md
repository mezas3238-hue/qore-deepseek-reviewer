# BTCUSD — MSS M5 y M15 independientes; corregido doble proveedor

**Fecha: 1 de noviembre de 2026 · QA candidato V34.10i · NO LIVE / NO MERGE · PR #55 DRAFT**

## Evidencia del propietario: dos capturas reales Coinbase, M5 y M15

Las capturas muestran BTCUSD de **Coinbase** en M5 y M15.
El panel del candidato anterior V34.10h mostraba dos filas:

| Fila | CRT | MSS M5 | MSS M15 |
|---|---|---|---|
| BTCUSD [G] (símbolo gráfico Coinbase) | BEARISH | ✓ | — |
| BTCUSD (slot 08 por defecto IC:BTCUSD) | BEARISH | ✓ | ✓ |

**Diagnóstico probado leyendo Pine:** el input s08 era
`input.symbol("IC:BTCUSD","BTCUSD")` y el escáner QA BTC
consultaba directamente ese símbolo, mientras que el motor del
gráfico consultaba `syminfo.tickerid`. Los dos mercados pueden tener
diferentes velas, swings y rompimientos M15. No atribuir el ✓
de IC:BTCUSD a Coinbase.

Las fotos también incluyen una anotación manual del propietario
para el nivel MSS M15 que debe analizarse como swing propio de
**velas M15**, no como una línea MSS M5. La captura no muestra
todos los valores OHLC ni fecha exacta del pivot para
certificar numéricamente la ruptura.

## Cambios reales en el candidato NUEVO, conservando V34.9 y b–h

Archivo Pine:
`crt-radar-pro/CRT_RADAR_PRO_V34_10I_QA_BTC_MSS15_INDEPENDIENTE_NO_INTEGRADO.pine`

Fuente Git blob SHA inmutable:
`e817b887a7ac9445cbee1576d07991b6972a9e96`

TXT de copiar:
`crt-radar-pro/CRT_RADAR_PRO_V34_10I_BTC_MSS15_ANDROID_COPIAR.txt`

### 1. Mismo proveedor y un solo BTCUSD en el panel

En modo predeterminado **BTCUSD solo**, cuando el gráfico abierto
es BTCUSD, `scanSymbols[7] := syminfo.tickerid`. El escáner y
la fila `BTCUSD [G]` usan las MISMAS velas del gráfico Coinbase,
y la fila extra del input `IC:BTCUSD` ya no aparece como
una segunda confirmación. El input original del slot 08 no
fue borrado; al seleccionar el modo experimental **34**
continúa usando el símbolo configurado y debe auditarse
por separado. **NO** se certifica el modo 34.

### 2. MSS M15 autónomo y de vela cerrada

El motor ya formaba M15 desde tres M5 consecutivas. Se reforzaron
sus puertas:

- M15 requiere **tres M5 completamente cerradas y consecutivas**.
- Pivot M15 swing izquierdo=2 / derecho=2 y pivote
  congelado de antes de la barrida C2; **NO** se recicla
  el pivote del MSS M5.
- Una vela M15 propia debe **CERRAR** al otro lado del nivel
  M15, con cruce estricto y cierre previo M15 consecutivo;
  la mecha o un cierre M5 anticipado NO cuentan.
- El timestamp del evento debe estar alineado a un cierre
  de M15 (`m15At % 900000 === 0`) y ser posterior a
  la barrida, además de no superar el último cierre real
  M15 registrado por el agregador.
- La señal puede confirmarse **durante C2 o C3**,
  pero no antes de su barrida. C3 sigue invalidando
  solamente por el cierre H4 frente al extremo de C2.
- En el dashboard gráfico `✓` M15 requiere todas las
  puertas independientes; el check de M5 jamás lo habilita.

### 3. Visualización correcta del nivel

La línea de nivel **MSS M15** se muestra en naranja
punteado mientras espera ruptura, usando el pivot M15
congelado antes de la barrida de C2.
Si una vela M15 cerrada la rompe correctamente,
se pinta azul; el panel cambia a **M15 OK**.
El MSS M5 mantiene su línea propia color teal.
Si no hay pivot M15 válido, no se inventa línea.

Fila nueva `BTC MSS QA`:
`M5 OK / M5 ESP`, `M15 OK / M15 ESP`, precio exacto
`PIV:` M15, hora NY de última vela M15 completa,
`MISMO FEED`. La ventana de datos incorpora timestamp
de última M15 cerrada y confirmación M15 válida.
Los 12 campos de paridad Pine originales continúan presentes.

Se conservan el CRT H4 horario Nueva York,
el PDH/PDL **1D del proveedor** validado por el usuario,
34 inputs del indicador, aislamiento de memoria
BTC 1/34, alertas TradingView apagadas y FCM NO LIVE.

## Comprobación GitHub y gates todavía pendientes

Pruebas estáticas nuevas:
`qore-crt-alerts/test/pine-btcusd-v34-10i-m15-independent.test.mjs`
validan fuente única Coinbase, pivot M15, barra M15,
cierre, estado M5 separado, línea pendiente, retención
PDH 1D y SHA exacto.
El paquete de paridad ahora reconoce el SHA del candidato V34.10i,
**solo como identificador del código**.

**IMPORTANTE:** ninguna suite Node compila realmente Pine
en TradingView; el resultado real del usuario es irremplazable.
Conservamos PR DRAFT sin merge y sin activar notificaciones
ni señales Live.

## Comprobación Android / TradingView

1. Retirar la V34.10h anterior y agregar una sola copia V34.10i
   desde el archivo TXT exacto. Usar el gráfico de
   **COINBASE:BTCUSD**, M5 y luego M15, opción `BTCUSD solo`.
   En este modo el slot interno utiliza automáticamente el
   mismo ticker que está abierto.
2. El panel no debe mostrar dos BTCUSD para dos proveedores.
   Debe existir solo `BTCUSD [G]` con su CRT actual.
3. Observar línea **naranja** nivel M15 mientras espera;
   dashboard **M15 ESP** y **sin ✓** M15 hasta el
   CIERRE válido de la vela M15 que rompa su propio pivot.
4. Si se cumple la ruptura por cierre M15, línea azul y
   **M15 OK / ✓**. M5 puede mostrarse ✓ antes,
   **sin implicar** confirmación M15.
5. Comparar posición de `PIV:` con el swing M15 marcado
   en la captura del propietario y la última vela M15.
   Si difiere, revisar velas M15 exactas del mismo
   feed antes de dar la certificación por aprobada.
