# CRT RADAR 34+Chart 12X — Diagnóstico de N/V en MSS, QA 2026-11-09

**Candidato en rama separada. NO MERGE / NO LIVE / NO ALERTAS / NO PUSH / SIN CERTIFICACIÓN PINE.**

## Evidencia en captura

Con `IC:BTCUSD` se observa `IC SLOT 8`, CRH/CRL de 2C ratificado y niveles PDH/PDL. Por tanto el problema anterior de `NO IC` ya no se reproduce **en esa captura BTC**, no se infiere que todos los 34 feeds estén correctos.

En otras filas (ejemplos XAGUSD, AUDCHF y EURGBP) la tabla V34.12X muestra `N/V` en MSS M5/M15 para familias `3C TRUE QA`, `MULTI4`, `MULTI-N` o `INSIDE`. El origen concreto estaba en el renderer del dashboard:

```pine
string m5Text = ... : ownExtraM5 ? "QA SI" : otherQA ? "N/V" : "—"
string m15Text = ... : ownExtraM15 ? "QA SI" : otherQA ? "N/V" : "—"
```

`N/V` significa **MSS propio no validado**, no ausencia definitiva de MSS ni ausencia de cotizaciones. El mismo motor bloquea prestar un MSS de una familia a otra, lo cual es correcto.

## Cambio propuesto — solo observabilidad, 34 mercados intactos

Copia *candidata* derivada del código V34.12X exacto (git blob original `470214fea377b05e537a18c0ce8097986da86fac`). No se reemplaza el archivo original.

Nuevos estados **QA** si no hay evidencia MSS propia en una familia auxiliar:

| Etiqueta | Significado verificable en la evidencia disponible |
|---|---|
| `SIN PRB` | Hay rol estructural visible, pero no candidato MSS perteneciente a esa misma familia/rol |
| `SIN C1` | No está acreditada la C1 propia del rol seleccionado |
| `SIN SWP` | No consta la hora de barrida para el candidato |
| `NO CERT` | M5 sin evidencia completa certificada. El motor **oculta** el pivote M5 si falla la prueba causal; por tanto no se puede determinar si el pivote realmente faltó |
| `SIN PIV` | Solo M15: no hay pivote previo disponible en los campos **sin máscara** de esa familia |
| `NO CONF` | M15: hay pivote previo, pero no hay confirmación causal exportada; puede no haber cruzado o haber fallado otro gate |
| `REV GATE` | Existen campos parciales, pero el validador no autorizó la confirmación; requiere auditoría de timestamps, C1, fase y dirección |
| `SIN FEED` | No hay respuesta válida del proveedor para ese slot |
| `SIN DIR` | No hay dirección coherente para el rol mostrado |

Los MSS certificados que ya estaban en `SI` / `QA SI`, y el core `NO` / `QA --`, **no cambian**. No se cambia `f_engine()`, la lógica de los 7 roles, CRT H4, pivotes, MSS, BTC independiente, sesiones, fases M5, feed IC, 34 `request.security`, PDH/PDL, FVG, colores, `plot`, alertas ni operadores.

Añadimos dos campos de lectura diagnóstica M5 por slot de los ya existentes en `Signal`: `extraFamilyM5PivotAt` y `extraFamilyM5At`, sin ninguna petición adicional. Las verificaciones M15 usan campos ya retenidos.

## Qué NO corrige

**No crea un MSS que no existe en el ledger**, ni garantiza que las familias observadas tengan prueba causal completa. Para convertir `SIN PRB`, `SIN C1`, `SIN PIV` o `NO VALID` en `QA SI`, debe obtenerse y auditarse la evidencia propia en el código y en las velas reales de IC Markets, con verificación exacta de C1 / sweep / pivote / M5-M15 / fase / reloj. La certificación no se fuerza cambiando textos.

## Validaciones

- Test de transformación completa: compara **todo** el Pine original con el candidato, exige exactamente seis sustituciones declaradas y SHA de blob original fijo.
- Comprobaciones de invariante: 34 slots, BTC independiente, símbolos IC, validación de MSS M5/M15 y prioridad de candidato propio.
- CI GitHub estático, no Pine Editor. **Falta compilar en TradingView Android, comparar las cuatro filas observadas y certificar en feeds reales.**

### Siguiente QA del propietario

1. Aplicar el candidato en un nuevo indicador **sin eliminar el actual**, y no crear alertas.
2. Comparar `IC:BTCUSD` y 2-3 pares con `N/V` antiguos sobre la misma vela.
3. Capturar etiquetas reales, fechas UTC, `QA: ver tiempos CRT/MSS de 1 instrumento` y `QA: ver último evento por categoría`.
4. Examinar primero `SIN PRB / SIN C1 / SIN PIV / NO VALID`, sin declarar éxito por la sustitución visual.

El siguiente cambio de lógica, si realmente procede, se hará en otra rama y tras certificar la causa.

## Hallazgo de auditoría 2 — payload M5 enmascarado

Revisado el constructor `Signal.new` original: `extraFamilyM5Pivot`,
`extraFamilyM5PivotAt`, `extraFamilyM5At` y `extraFamilyM5C1`
se exportan como `na` si `extraMss5Causal=false`. Por tanto, en el
PR inicial `SIN PIV` para M5 **no era una conclusión válida**: un pivote
podía existir y quedar oculto por cualquier otro gate. Se corrigió la
interfaz QA a `NO CERT` para M5, sin modificar ningún valor de Signal ni
el detector. M15 sí exporta el timestamp del pivote separadamente y permite
el estado `SIN PIV` cuando el campo es realmente NA.

El mismo `Signal.new` enmascara `extraFamilyM15At` si
`extraMssCausal=false`, así que `NO CONF` equivale a ausencia de una
*confirmación verificable*, no demostración de que nunca hubo un cruce.

Este hallazgo también determina la siguiente tarea de investigación: construir
pruebas reproducibles de las familias TRUE3C/INSIDE/MULTI4/MULTI-N sobre
OHLC M5 completos del mismo feed IC Markets, registrando C1, pivote congelado,
primera barrida, cierre de ruptura y las causas reales de invalidación. Con solo
esta captura de TradingView o el `Signal` ya filtrado no se puede certificar
un MSS que no esté publicado.

Los controles exact-diff garantizan que el motor CRT/MSS, fuentes, barreras
de seguridad y funciones de alertas son idénticos al V34.12X base.

## Registro reproducible de la siguiente prueba real en TradingView (sin LIVE)

Para los pares señalados en la captura, la identidad QA es:

| Instrumento | Slot fijo en el código | Fuente esperada |
|---|---:|---|
| BTCUSD | 8 | `IC:BTCUSD` |
| XAGUSD | 17 | `IC:XAGUSD` |
| AUDCHF | 19 | `IC:AUDCHF` |
| EURGBP | 27 | `IC:EURGBP` |
| EURNZD | 29 | `IC:EURNZD` |

En `Entradas de datos`:
1. Mantener `Alcance escaneo = 34 instrumentos`, `QA: fase M5 por feed 0..4m (SIN ALERTAS)` activado y filtro de proveedor IC intacto.
2. Desactivar temporalmente `QA historial: seguir el símbolo del gráfico (mismo broker)` **solo si** se seleccionará manualmente otro número de instrumento.
3. Establecer el slot deseado en `QA: número de instrumento` y activar `QA: ver tiempos CRT/MSS de 1 instrumento` y `QA: ver último evento histórico por categoría` **de uno en uno** para no superponer dos paneles.
4. Capturar para la misma vela M15: dirección, familia, timestamp C1, barrida, pivote y cierre MSS, y anotación del servidor de datos (`IC:`).
5. Contrastar la misma región en M5 y H4. Un estado `NO CERT` no se convierte en `QA SI` por interpretación visual.

No se cambia `right5/right15`, `maxPivotAge=720`, la fase M5 ni las ventanas H4 para provocar un resultado deseado. Un resultado real de TradingView debe ser revisado por estructura y proveedor antes de modificar los algoritmos.

### Criterios de aceptación (todavía abiertos)
- Cada familia expone un registro C1/sweep/pivote/ruptura **propio y temporalmente causal**.
- M15 exige las tres M5 cerradas consecutivas del mismo feed y cierre cruzado comprobable; M5 exige un cierre M5 posterior a la barrida.
- `SI/QA SI` solo aparece tras todos los gates originales, sin heredar MSS entre familias.
- No se retira `QA NO CERT`, `NO LIVE` ni `NO PUSH`.

## Forense offline R0 — contrastar MSS contra OHLC M5 cerrado

Se añade herramienta **solo lectura**:
`crt-radar-pro/qa-mss-reasons/tools/verify_mss_evidence_csv.py`.

**Alcance real:** compara una reclamación de MSS (familia, C1, barrida,
pivote congelado, dirección y plazo) contra un único flujo cronológico
de velas M5 cerradas, con reconstrucción M15 únicamente de grupos completos.
Revisa identidad del feed, ventanas completas, primer barrido compatible,
pivote L2/R2 y cruce estricto por cierre. No extrae la familia CRT del OHLC,
no autentica que el CSV proceda realmente del bróker y **no certifica Pine**.

**CSV input** (tres M5 completas para cada M15):

```csv
symbol,feed_id,open_time_utc,open,high,low,close,closed
```

El JSON de caso exige exactamente:
```json
{
  "symbol": "IC:XAGUSD",
  "feed_id": "IC:DEMO:SERVER_IDENTIFICADO",
  "family": "INSIDE QA",
  "direction": "BULLISH",
  "timeframe": "M5",
  "phase_min": 0,
  "c1_high": "34.50",
  "c1_low": "33.50",
  "sweep_window_start_utc": "2026-11-09T10:00:00+00:00",
  "sweep_close_utc": "2026-11-09T10:30:00+00:00",
  "frozen_pivot_open_utc": "2026-11-09T09:45:00+00:00",
  "frozen_pivot": "34.10",
  "observe_until_utc": "2026-11-09T12:00:00+00:00"
}
```
Los precios y tiempos del JSON son **solo ilustración del esquema**, no un
evento verdadero de XAGUSD. Nunca usar este ejemplo como señal.

Uso con datos verificables y autorizado fuera de producción:
```bash
python crt-radar-pro/qa-mss-reasons/tools/verify_mss_evidence_csv.py \
  --m5-csv ./caso_xagusd_m5.csv \
  --claim-json ./caso_xagusd.json \
  --out-json ./resultado_qa.json
```

Salida:
- `RAW_CROSS`: se corroboró matemáticamente cruce M5/M15 por cierre, **sin
  certificar** que el CRT y el pivote pertenecían a esa familia en TradingView.
- `NO_CROSS_OBSERVED`: no hubo cruce bajo las condiciones en el intervalo
  cerrado suministrado (no equivale a fallo del indicador).
- `INVALID`: barrida / pivote / cronología no corresponden a la prueba
  suministrada.
- `INCOMPLETE`: velas ausentes, ventana insuficiente o discontinuidad;
  abstenerse de concluir éxito o fracaso.

Una etiqueta `IC:` y un CSV no certifican autenticidad. Exigir fuente y
identificador real, registros OHLC confiables y reconciliación con el indicador.
`operational_alert_authorized=false`, `live_trading_authorized=false`,
`pine_parity_certified=false` y `crt_structure_certified=false` en toda salida.

**Nota metodológica:** el modelo forense R0 fija pivote L2/R2 y rechaza
swings no congelados antes de la barrida. No establece por sí solo
equivalencia exacta con cada familia o con el `f_engine` original; esa paridad
queda como gate independiente, pendiente de TradingView y del histórico real.
