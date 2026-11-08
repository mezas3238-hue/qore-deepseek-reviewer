# QORE CRT — corrección de causalidad MSS M15 antes de la barrida

**Corte de QA: 7–8 noviembre 2026.** Investigación sobre los 34 mercados cTrader DEMO en un PR DRAFT. **NO LIVE, MERGE, órdenes, Firebase ni notificaciones reales.**

## Fallo lógico observado en código

La función `frozenM15Pivot` segmenta por discontinuidades M15, pero su comprobación final exigía

```js
run.at(-1).closedAt!==sweepStart && run.at(-1).closedAt>sweepStart
```

Como `prior` filtra barras con `closedAt <= sweepStart`, la segunda condición era imposible salvo entrada alterada. En consecuencia, podía aceptarse un pivote congelado **aunque faltara por completo la M15 inmediatamente anterior a la barrida M5**. El pivote era de un segmento terminado antes de la ventana del barrido.

## Reparación QA conservadora

En `mss-m15.mjs`, un pivote solo es elegible si la última M15 cerrada del segmento continuo termina no después de `sweepStart` y a **menos de 15 minutos** del inicio de barrida. Esto permite M5 en el cierre exacto de M15 o 5/10 minutos después, y bloquea una M15 totalmente ausente antes de la barrida.

No cambia cómo se reconoce un swing: las desigualdades estrictas izquierda/derecha, edad del pivote, dirección, requisitos de vela cerrada, ciclo C1/C2/C3 y fuentes permanecen intactos. La detección MSS M5 continúa separada. No hay renumeración ni permisos nuevos.

## Pruebas adicionales

- Rechazar la última M15 ausente antes de la barrida: sweep en cierre M15, +5 min y +10 min.
- Admitir exactamente 0/5/10 minutos desde una última M15 cerrada real hasta la barrida.
- El pivote congelado antes del sweep no puede modificarse al añadir más M15 posteriores (invariancia de prefijo). Esta prueba es local y **no equivale a certificación independiente de no repaint del indicador Pine**.

## Estado / próxima prueba

El PR se incorpora como hijo de #95. Primero deben pasar las pruebas GitHub; después puede repetirse una campaña **34/34 real DEMO STAGING** para observar si se reducen testigos MSS M15 que antes se aceptaban sin la barra pre-sweep. En cualquier caso `sendPush=false`, `canTrade=false`, `sourceParityCertified=false`, `mssM15Certified=false`, `noRepaintCertified=false`.

**El conflicto H4 de USTEC/US500/US30 sigue bloqueado**; esta corrección no lo resuelve ni cambia las horas C1 aprobadas.
