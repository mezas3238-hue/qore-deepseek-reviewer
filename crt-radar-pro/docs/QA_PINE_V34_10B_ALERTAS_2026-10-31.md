# CRT RADAR PRO — Protocolo de validación Pine v6 (QA, no integrado)
Fecha: 2026-10-31
Repositorio: mezas3238-hue/qore-deepseek-reviewer
Rama aislada: review/crt-radar-v34-10b-qa-strict-20261031

## Fuente exacta a ensayar

- Código Pine candidato de alerta ratificada: `crt-radar-pro/CRT_RADAR_PRO_V34_10B_QA_ALERTAS_RATIFICADAS_NO_INTEGRADO.pine`.
- Base inmutable: `development/crt-radar-v34-9-m5a-integrated-20261031`, V34.9.
- Base M5B V34.10b inmutable: `review/crt-radar-v34-10b-m5b-session-audit-20261031`.
- CI offline: `https://github.com/mezas3238-hue/qore-deepseek-reviewer/actions/runs/41209428086` — 53/53 en JS/inspección estructural, **NO** compilador Pine.
- No hubo merge, no cambios de la versión oficial.

## P0: compilación real en TradingView

1. Abrir TradingView Web con Pine Editor y guardar copia privada nueva, sin sustituir el indicador vigente.
2. Copiar integralmente el archivo candidato del enlace GitHub en Pine Editor y verificar que comienza por `//@version=6`.
3. Pulsar «Añadir al gráfico» y registrar diagnóstico del compilador literal con línea y columna. **Si hay errores, detener la certificación.**
4. Revisar consumo de `request.*()` / límites de plan y timeout. No activar alertas en modo operativo hasta verificar el compilador.
5. Verificar entradas: `Escaneo C1 = Solo C1 de tres horarios NY`; FX 01/05/21 y índices 02/06/22 (zona `America/New_York`).

## P1: reloj CRT y panel

- Un CRT estándar debe usar C1 H4 terminada, C2 H4 posterior con barrida estricta de un único extremo y cierre de retorno dentro C1, y C3 H4 siguiente.
- Marcar C2 provisional con `*` sin disparar alerta operativa antes de ratificarla.
- Comprobar en el gráfico las líneas CRH/CRL = High/Low de C1 correspondiente, y MSS M5/M15 = swing previo congelado, con ruptura **por cierre**.
- Abrir EURCAD, GBPAUD, EURUSD, GBPUSD, XAUUSD y NAS100USD, cambiar M5 → M15 → H4 y comparar estado, dirección, C1 y líneas.
- El dashboard debe conservar el activo abierto en primera fila y filas configurables/páginas para los 34.
- ATENCIÓN: `request.security(symbol,\"5\",f_engine())` en gráfico M15/H4 retorna un solo estado intrabar por barra anfitriona, aunque f_engine se evalúe en contexto M5. Puede haber retraso o divergencia histórico/tiempo real que exige verificación.

## P2: FVG

- En la versión candidata M5B los FVG H1/H4 son **internos y sin cajas visibles**. Es imposible certificarlos por inspección de dibujos: hacen falta trazas de depuración opcionales o escenarios de feed auditables después de compilar.
- Ensayar primer toque posterior a formedAt; contacto exacto 0 %, parcial, llenado por mecha, invalidación por cierre estricto, deduplicación M5, estados terminales.
- Pausas: Forex fin de semana, índices RTH/ETH, CFD diario, festivos, DST America/New_York, barra omitida intrasesión y proveedor sin `session.islastbar`.
- No asumir que el horario visual del gráfico altera el timezone Pine.

## P3: alertas

- El nuevo candidato está aislado; no hay alertas instaladas automáticamente.
- En Pine Editor, confirmar compilación y crear una alerta con condición **Any alert() function call**, notificaciones en la aplicación móvil habilitadas.
- Validar: fase C2 provisional sin alerta; MSS M5/M15 confirmado durante C2 notificado al ratificar H4 dentro de ventana de 20 minutos; MSS de C3 notificado al ocurrir; una alerta por CRT/MSS/activo; alerta nueva en otro CRT.
- `varip array<int>` más `alert.freq_all` se proponen para deduplicar por activo/C1 durante actualizaciones realtime y permitir eventos distintos dentro de una vela anfitriona. **No certificado en TradingView**.
- Si el gráfico está en H4, pueden perderse señales por la latencia de la agregación o expirar la ventana. Ensayar inicialmente M5 y M15 y documentar ese límite antes de declarar alertas Android funcionales.
- Las alertas son notificaciones técnicas, nunca órdenes automáticas ni confirmación de rentabilidad.

## P4: cierre y criterios de aprobación

| Puerta | Requisito | Estado al publicar |
|---|---|---|
| GitHub CI offline | Todas las pruebas JS | PASS 53/53 |
| TradingView compilador | Sin errores Pine v6 | NO EJECUTADO |
| Feed FX/índices | 34 activos + sesiones | NO EJECUTADO |
| M15/H4 dashboard | CRT/MSS coherente vs M5 | NO EJECUTADO |
| FVG H1/H4 | Mitigación, sesiones, terminales | NO EJECUTADO |
| Alertas Android | Sin prematuras ni duplicadas | NO EJECUTADO |
| Autorización de integración | Orden expresa del propietario | PENDIENTE |

No llamar al indicador «certificado» ni integrar V34.10b/QA hasta superar todas las puertas.
