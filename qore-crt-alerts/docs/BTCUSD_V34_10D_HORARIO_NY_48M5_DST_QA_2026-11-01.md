# BTCUSD — corrección del horario de Nueva York · V34.10d QA

**Fecha:** 2026-11-01 · **Ámbito:** BTCUSD únicamente · **Estado:** candidata QA NO certificada · **PR #55 DRAFT**.

## Qué muestran las capturas

El usuario envió nueve capturas de BTCUSD H4 del 30 de octubre al
1 de noviembre de 2026, desplazando el cursor sobre barras con horas
12:00, 16:00, 20:00, 00:00, 04:00, 08:00, 12:00 y posteriormente
03:00 y 07:00. No se observa la zona horaria del gráfico ni la
identidad completa del exchange, por lo que NO debe inferirse que esas
horas sean horas oficiales de la estrategia, ni que el proveedor sea
Coinbase.

**Hecho fundamental:** el gráfico H4 nativo del exchange puede tener
ancla diferente del CRT; TradingView admite una zona horaria visual
distinta de la del exchange y de la seleccionada en el script Pine.
Ver:
https://www.tradingview.com/pine-script-docs/concepts/time/
https://www.tradingview.com/pine-script-docs/concepts/sessions/

BTCUSD **conserva** los horarios autorizados, siempre en
`America/New_York`, 7 días por semana:

| Ciclo | C1 NY | C2 NY | C3 NY |
| --- | --- | --- | --- |
| A | 01:00 | 05:00 | 09:00 |
| B | 05:00 | 09:00 | 13:00 |
| C | 21:00 | 01:00 siguiente día | 05:00 siguiente día |

NY cambia de UTC−4 a UTC−5 el **1 de noviembre de 2026**. Ejemplo
en Paraguay UTC−3: la 01:00 NY de un día anterior al cambio se
visualiza a las **02:00 PY**, y posteriormente a las **03:00 PY**.
Durante la noche del cambio, la **01:00 NY se repite dos veces**,
primero en EDT y luego en EST. No puede ratificarse sin identificar
la hora y existencia de 48 M5 continuas en exactamente cuatro horas
reales. En ese intervalo excepcional se bloquea un CRT incompleto.

## Código nuevo (separado de las versiones anteriores)

Archivo:
`crt-radar-pro/CRT_RADAR_PRO_V34_10D_QA_BTC_HORARIO_NY_NO_INTEGRADO.pine`

Git blob SHA definitivo:
`31e91681dcbc19592cd346b3127b398bc4fedaff`.

Derivado de V34.10c que ya mostró un dashboard sin fallo de memoria
en Android. Preserva los 34 inputs configurables, pero escanea BTCUSD
slot 08 por defecto en QA; los otros 33 NO son evaluados por ahora.
El indicador V34.9 y los QA V34.10b/c previos permanecen intactos.

Cambios:
- H4 BTC **C1** válida sólo cuando se reciben exactamente 48 M5,
  sin huecos y con cuatro horas UTC entre inicios de las dos H4.
- H4 BTC **C2** ratificable sólo con 48 M5 continuas y exactamente
  4 horas hasta el bloque siguiente. No es suficiente un mínimo de
  25 M5, aunque ese siga siendo el valor default para Forex.
- H4 BTC **C3** finalizada requiere igualmente 48 M5; si está
  incompleta, elimina el registro del CRT anterior para evitar
  supervivencia indebida. La invalidez por la mecha C2 sigue
  verificándose sólo al cierre H4 C3.
- La ventana de datos ofrece nuevos diagnósticos
  `QA BTC H4 NY inicio UTC min` y `QA BTC H4 M5 cerradas`.
- Fila 12 del dashboard muestra `BTC H4 NY`, apertura NY del
  bloque real del motor M5, `C1:01/05/21`, conteo M5 y diagnóstico.
  En H4 puede mostrar `ALINEADA` o `H4 BROKER != NY`; este
  último NO significa necesariamente que el motor esté mal.
  En M5 muestra `MOTOR M5 NY` en lugar de comparar con H4.
  Un conteo mayor de 48 indica `H4 EXTRA/DST`.
- Entrada `useAlerts=false` intacta. No hay FCM, ninguna señal
  LIVE, instalación ni merge.
- El paquete de captura Pine para BTC se ancla a este nuevo SHA,
  pero exige compilación real, feed exacto y auditoría contra
  las velas M5 del mismo proveedor antes de evaluar paridad.

## Instrucciones Android

1. Abrir la nueva versión en GitHub, copiar su código completo al
   editor Pine de TradingView como nueva copia privada. Eliminar
   del gráfico la versión antigua para evitar recursos duplicados.
2. En ajustes de `00 / Memoria (QA)`: `BTCUSD solo`.
   Mantener las alertas QA desactivadas.
3. Para comparar proveedores, revisar el ticker completo del gráfico
   y del parámetro `BTCUSD` slot 08; el mismo nombre abreviado
   no garantiza la misma serie OHLC.
4. Comprobar el panel en M5 y en H4. Leer la **fila `BTC H4 NY`**
   en vez de deducir C1 del cursor sobre las H4 nativas del broker.
5. Enviarnos captura del nuevo panel y nombre completo del mercado.
   Tras ello, comparar eventos reales CRT H4 + MSS M15 del mismo
   proveedor contra backend; la revisión DST no autoriza por sí sola
   alertas.

## Estado de certificación

Las pruebas Node de GitHub son estáticas/replay y **no compilan
Pine en TradingView**. Si la nueva variante no compila, hay que
revisar error y línea concreta; no declarar `PINE_COMPILE_OK`
sin una captura verdadera. El calendario NY aprobado permanece
soberano; no cambiar los horarios por las marcas de las barras H4
del proveedor.
