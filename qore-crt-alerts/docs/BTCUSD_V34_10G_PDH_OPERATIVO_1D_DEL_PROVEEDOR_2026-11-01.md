# BTCUSD PDH/PDL operativo de la vela 1D del proveedor — V34.10g QA

**1 de noviembre 2026 · PR #55 DRAFT · NO LIVE · SIN MERGE**

## Resultado confirmado en imagen de propietario

La captura de TradingView 1D mostró que la variante
V34.10f todavía presentaba dos niveles distintos:

| Referencia | PDH | PDL |
| --- | ---: | ---: |
| 1D GRAFICO (anterior D cerrada) | 77.645,12 | 76.954,57 |
| NY 00:00 a 00:00 | 77.747,48 | 76.954,57 |

Diferencia PDH: **102,36 USD**. La captura enseña la D anterior
del 31/10 00:00 a 01/11 00:00 en la zona del proveedor, mientras
la referencia NY cerró 01/11 00:00 hora `America/New_York`.
Los cierres de calendario NO tienen por qué coincidir.
No se conoce aún el ticker exacto del exchange.
No hay evidencia que certifique que el proveedor de la captura sea Coinbase.

## Cambio de criterio BTC QA

El propietario quiere que el PDH/PDL **coincida con el del gráfico 1D
del mismo símbolo**, no con el del día NY de calendario.
La nueva regla operacional para BTCUSD en QA es:
- PDH = **máximo** de la última vela D **CERRADA** de
  `syminfo.tickerid`, obtenido mediante `high[1]` y
  `lookahead=barmerge.lookahead_on`.
- PDL = **mínimo** de la misma vela, mediante `low[1]`.
- Referencia = inicio y cierre de esa misma D, `time[1]` y
  `time_close[1]`, expresado en `syminfo.timezone`.
- Estado PDH `T 1D` únicamente cuando el máximo de M5 cerradas
  de la jornada D actual es estrictamente mayor que PDH; PDL igual
  con mínimo inferior. Igualdad no cuenta.
- Requiere que las M5 actuales sean contiguas **desde la apertura
  de la D actual**, exactamente en el timestamp de cierre de la
  previa D. Si falta el inicio o una M5, se muestra `N/D`, nunca
  `INT` falso.
- El día NY 00:00–00:00 queda como **NY SOLO QA**, referencia
  diagnóstica. NO alimenta estados PDH/PDL principales de BTCUSD
  del gráfico. No se pretende que ambos precios sean iguales.
- CRT H4 sigue con horario de Nueva York **01/05/21**,
  independiente del PDH diario. MSS M15 obligatorio, 48×M5 H4
  completas, modo memoria BTC 1/34.
- Esta variante aún no habilita atribución de la barrida 1D a
  un C2/C3 particular. Su texto `T 1D` NO significa CRT validado.
  El QA de NY muestra por separado `T OTR` si aplica.
- No hay notificaciones reales de Android ni live trading.

## Código publicado

Nueva candidata separada:
`crt-radar-pro/CRT_RADAR_PRO_V34_10G_QA_BTC_PDH_1D_OFICIAL_NO_INTEGRADO.pine`

Identidad exacta del archivo Git blob SHA:
`48de848a550ac2b9d222a554a640164774b932e9`.

Copia Android:
`crt-radar-pro/CRT_RADAR_PRO_V34_10G_BTC_PDH_1D_ANDROID_COPIAR.txt`.

El Pine agrega un acumulador del máximo/mínimo de las **M5 cerradas
de la D del proveedor actual** usando `time("D")[1]` para
identificar la frontera del día de mercado y exige continuidad
M5 desde el timestamp de la apertura D. El valor del PDH/PDL
viene siempre directamente de la solicitud D confirmada del mismo
ticker, no de una aproximación M5.

La fila 9 del panel muestra **D PROVEEDOR**, apertura/cierre de
la vela D anterior y si el M5 actual es completo (`M5 OK` o
`M5 N/D`).
La fila 10 muestra **PDH 1D OFIC**, **PDL 1D OFIC** y sus
estados propios; en la cabecera los indicadores son `PDH 1D`,
`PDL 1D`.
La fila 11 pasa a **NY SOLO QA**, sin confundirse con la operación.

## Auditoría backend

El nuevo módulo offline
`qore-crt-alerts/src/btcusd-provider-daily-liquidity.mjs`
requiere la vela diaria previamente confirmada del proveedor EXACTO
y la secuencia de M5 cerradas contiguas desde el inicio del día
actual. No calcula falsamente una D con las M5 incompletas,
no cambia de proveedor ni genera señales. Pruebas de:
- Referencia PDH 77.645,12 y toma estricta de high.
- Igualdad estricta = INTACTO.
- PDL tomado sin PDH.
- Día corriente sin M5 inicial / huecos = N/D.
- Rechazo de otras fuentes.
- Sesión de proveedor con ancla distinta de la NY.
- Integridad del Pine por SHA.

Suite GitHub Foundation: **252/252 PASS**.
Evidencia:
https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41331703033

## Próxima comprobación real (Android)

1. Quitar del gráfico V34.10f. Pegar el TXT completo V34.10g
   en una copia nueva de TradingView Pine Editor.
2. Abrir BTCUSD 1D, dejar `BTCUSD solo`, alertas desactivadas.
3. Confirmar que la fila principal **PDH 1D OFIC**
   coincida exactamente con el high de la vela **inmediatamente
   anterior** al día actual, no con la vela seleccionada con
   el cursor por accidente.
4. Mirar `D PROVEEDOR` para validar el rango horario de
   esa vela; verificar `M5 OK` antes de confiar en `T 1D`.
   El precio PDH/PDL se puede conocer desde D aunque el estado
   de barrida sea `N/D` por falta de datos M5.
5. Enviar captura completa de filas 9/10/11 y ticker del proveedor.
   Si el PDH 1D OFIC sigue diferente del máximo previo, comprobar
   en datos OHLC la identidad del símbolo, hora y contexto sin
   afirmar certificación.

**NOTA DE SEGURIDAD:** Las 252 pruebas son estáticas/fixture
en GitHub. NO son compilación Pine de V34.10g en TradingView ni
homologación a datos Coinbase/FundedNext. El PR sigue DRAFT.
