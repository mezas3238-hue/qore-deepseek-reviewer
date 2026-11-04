# Segunda auditoría DeepSeek — contraste directo SHA, H-12 y H-13 (2026-11-03)

**QA / NO LIVE / NO PUSH / NO MERGE.** Rama `feature/crt-v34-11a-seven-catalog-34feeds-20261102`, PR #74 (DRAFT).
Código fuente del auditor: Radar A blob `c37841f9ea422208e64c02a572b7a8d76d1db2a0` (2.915 líneas); Chart B blob `7a2297ab0d1cc30c8354a7623b25c5786b6c8023` (2.436 líneas). Diff revisado sobre el origen histórico de commit `87f01e87ed035d29802582d76e3b376c92fdb81f`.

## NUEVO-01: SHA CHART B — resuelto por diff exacto

SHA anterior: `4583af034cdce1af9829eb5e0cde134755e1e746`.
SHA actual: `7a2297ab0d1cc30c8354a7623b25c5786b6c8023`.

Se compararon íntegramente los dos contenidos, **2.436 líneas contra 2.436**, y solamente difieren **2 líneas**:

```diff
@@ -23 +23 @@
-// El grafico abierto va SIEMPRE primero, aun si esta en la pagina 4/5.
+// El grafico abierto va primero si el proveedor/ticker coincide exactamente con un feed.
@@ -78 +78 @@
-qaPhase1NonBtc = input.bool(true, "QA: fase M5 por feed 0..4m (SIN ALERTAS)", group=grp3, tooltip="Solo QA: utiliza la fase M5 cerrada 0,1,2,3,4 minutos del propio proveedor para reconstruir H4, H1 y M15 de cada feed NO BTC. Exige 48 M5 contiguas y pivote MSS15 propio. Nunca certifica H4 NY original, no muestra senales operativas ni permite alertas.")
+qaPhase1NonBtc = input.bool(false, "QA: fase M5 por feed 0..4m (SIN ALERTAS)", group=grp3, tooltip="Solo QA: utiliza la fase M5 cerrada 0,1,2,3,4 minutos del propio proveedor para reconstruir H4, H1 y M15 de cada feed NO BTC. Exige 48 M5 contiguas y pivote MSS15 propio. Nunca certifica H4 NY original, no muestra senales operativas ni permite alertas.")
```

Veredicto: línea 23 sólo comentario; línea 78 únicamente cambia `qaPhase1NonBtc` de `true` a `false`, dejando opcional el modo QA de desplazamiento de fase por proveedor. **No cambia `f_engine()`, la UDT Signal ni Signal.new**, y no hay diferencias en el cuerpo del motor. El cambio de SHA es esperado y está explicado; no es bug sin verificar.

## H-13 — pruebas existentes y nueva protección posicional

La afirmación "sin tests de constructor" es **incorrecta**: `qore-crt-alerts/test/pine-v34-12i-inside-multin-family-mss5-parity.test.mjs` ya comprueba que los dos scripts tienen 132 campos Signal, 132 argumentos Signal.new, UDT idéntica y motor byte-idéntico. Una prueba anterior `pine-v34-10s-udt-arity.test.mjs` protege un archivo histórico no integrado de 99 campos.

Para proteger también **drift de posición de campos del mismo tipo**, se añade un manifiesto cerrado de 132 pares tipo/nombre y 132 expresiones de constructor (`qore-crt-alerts/fixtures/v34-12i-signal-schema-lock.json`) y un test independiente (`qore-crt-alerts/test/pine-v34-12i-signal-schema-positional-lock.test.mjs`). Un cambio de nombre, orden, cantidad o expresión falla sin actualización deliberada del manifiesto.

La prueba es estructural; no reemplaza validación de tipos del compilador Pine Editor.

## H-15 — no sumar por error los dos indicadores

Radar A ejecuta una solicitud `request.security()` dinámica por cada uno de los **34 feeds**; Chart B es **un script independiente** con sus propias llamadas M5 + D. El valor 34+2 = 36 representa la suma conceptual de dos scripts instalados por separado, NO un límite de 36 llamadas en un solo indicador. Los límites efectivos de solicitudes/memoria deben verificarse **por script y por plan de TradingView**. Las 34 series M5 con 1.500 barras continúan con riesgo real de memoria, no demostrado ni refutado por CI offline.

## H-12 — condición 280 y DST de Forex/índices extendidos

En A y B, el bloque PDH/PDL no-BTC utiliza `curr_m5_count >= (pdhRth ? 78 : 280)`. En cambio, BTC calcula `expectedM5 = (endNY-startNY)/MIN5` y exige valor exacto 276/288/300. La regla no-BTC de 280 **no es una cuenta exacta de sesión**: permite algunas sesiones cortadas con M5 continuas y el inicio hasta 17:05, pero excluye una jornada de 23h DST (276 barras) aunque esté completa.

**No se modifica el detector ni se fuerza `curr_m5_count ∈ {276,288,300}`**: eso podría aceptar incorrectamente una sesión incompleta de 276 barras en un día normal, y la sesión concreta depende del calendario de proveedor, días y DST. Antes de cambiar H-12 se requiere especificar calendario de cada feed y derivar la duración teórica del **inicio y fin locales NY de la sesión exacta**, verificando continuidad, extremos y conteo exacto. QA de fin de semana/DST y proveedor real aún pendientes.

## H-20 / Multi4 / entorno

H-20 no es un bug demostrable: la especificación no exige que el swing MSS esté dentro de `[C1.low,C1.high]`. No añadir filtro geométrico sin evidencia.
Multi4 MSS M15 propio sigue pendiente.
Compilación Pine v6, replay de 34 símbolos, medición de memoria, calendarios FX, Android FCM real siguen pendientes.
