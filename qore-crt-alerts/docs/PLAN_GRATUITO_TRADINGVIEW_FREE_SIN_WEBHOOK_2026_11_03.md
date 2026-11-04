# QORE CRT ALERTS — plan compatible con TradingView Basic FREE

Fecha: 2026-11-03. PR #74 DRAFT. NO LIVE / NO PUSH / NO MERGE.

## Restricción explícita del Owner

El Owner usa TradingView **Basic gratuito** y no contratará una suscripción para habilitar alertas. Por ello **no se puede tomar TradingView como fuente de webhooks ni de alertas técnicas programadas**. La app QORE CRT ALERTS debe recibir CRT H4 y MSS M5/M15 **con TradingView cerrado** y sin suscripción pagada a ese servicio.

El script Pine queda como interfaz gráfica y **oráculo de comparación de paridad**, no como transporte de eventos ni fuente de precios para el backend. No afirmar que el código Pine por sí solo pueda mandar eventos en FREE.

Fuentes: https://es.tradingview.com/pricing/ (Basic: 3 alertas de precio, 0 alertas técnicas y sin webhook). https://help.ctrader.com/open-api/ (Open API permite datos en tiempo real y DEMO). https://help.ctrader.com/open-api/terms-of-use/ (API sin costo de acceso, sujeto a condiciones). https://help.ctrader.com/open-api/symbol-data/ (trendbars M5 históricas y en vivo).

## Diseño FREE-FIRST a validar

1. **Fuente candidata, no conectada:** cuenta cTrader DEMO ya utilizada en el laboratorio VPS, con autorización de solo lectura `accounts` (nunca `trading`), registro de una aplicación Open API aprobada por Spotware y alcance del broker verificado. Uso exclusivo de eventos CRT: **no órdenes ni ejecución de trades**.
2. **Inventario real primero:** consultar lista de instrumentos que realmente ofrece el broker; mapear `symbolId`, digits, proveedor, sesión, horario de velas, contract type y 34 símbolos; **nunca equiparar automáticamente** `IC:USDCAD` / `OANDA:EURCHF` de TV con cotizaciones de un broker cTrader. Si no hay paridad/feed, registrar `UNAVAILABLE` o `SOURCE_NOT_PARITY_CERTIFIED`; no inventar precios ni suplir con datos de otro broker de manera silenciosa.
3. **Alimentación M5:** suscribir spots y trendbars cerradas mediante Open API de forma persistente sobre VPS autorizado. Rechazar barras abiertas, gaps, inversiones de tiempo, sesiones sin ticks, duplicados, incorrecta fase nativa y símbolos desconocidos. Calcular H4 a partir de 48 M5 cerradas, M15 de 3 M5 propias, M5 pivotes/ruptura por separado. Mantener el camino BTCUSD independiente de los 33.
4. **Motor independiente:** port/reutilización de los clasificadores CRT, 7 categorías, 3C/Inside/Multi4/Multi-N y MSS M5/M15 propios. Catalogar provisional/rechazado en estado QA y nunca promoverlo a alerta certificada. Identidad compuesta: proveedor, símbolo, C1, dirección, familia, tipo y tiempo. Paridad exacta contra capturas del Pine, replay independiente y holdout/no repaint antes de habilitar.
5. **Backend autenticado:** guardar estado por ciclo, eventos, precios, UTC, evidencia de datos, versión del motor, SLA/freshness y claves de idempotencia; expedir alertas `CRT_OBSERVED`, `MSS_M5_OBSERVED`, `MSS_M15_OBSERVED`. Evaluar permisos de redistribución de market data antes de persistir/enviar cotizaciones.
6. **Android:** FCM necesita su propio proyecto/registro autenticado y permiso Android; icono del instrumento, familia CRT, dirección, hora/precio de MSS5 y MSS15 actualizados. Probar teléfono con la app cerrada. El servicio FCM del repositorio está apagado por diseño (`BuildConfig.STAGING_NOTIFICATIONS_ENABLED=false`), no modificar el flag hasta un E2E verificado.

## Condiciones de verificación y restricciones

- cTrader Open API se ofrece sin cobro por el API, pero **no garantiza que los 34 instrumentos estén en la cuenta DEMO**, que los feeds coincidan con IC/OANDA de TradingView, que todos los mercados estén disponibles sin otras tarifas, o que se permita redistribuir precios a terceros. Se debe verificar con el broker y los TOS.
- Para acceder a Open API debe registrarse una aplicación y esperar aprobación. OAuth nunca se copia a GitHub. Solo el alcance `accounts` de lectura.
- La vía GitHub Actions cron **no reemplaza** una suscripción/servicio de eventos persistente y continuo para 34 mercados. El VPS existente es candidato después de autorización, pruebas de conectividad y manejo de secrets.
- Si la fuente DEMO no contiene uno o más de los 34, el sistema informa cobertura real N/34 y deja sin alerta los faltantes; jamás simula 34/34.
- TradingView FREE continúa útil para ver el indicador y contrastar una señal en pantalla, pero **no** garantiza un puente de alertas técnicas + webhooks.
- NO PUSH / NO LIVE / NO MERGE sigue vigente mientras se audita paridad, disponibilidad y precisión.
 
## Próxima ejecución técnica

Implementar un contrato de conector cTrader `READ_ONLY / NO_TRADE` con descubrimiento de 34 símbolos, registro de barras cerradas y estados por instrumento. Preparar casos de prueba de gaps/phase +1/+2, missing symbol, desconexión/reconexión, caducidad de datos y desacuerdo Pine. Después, configurar credenciales del propietario **directamente en el runtime seguro**, nunca por chat o repositorio. El acceso a broker, OAuth y VPS exige conexión/autorización explícita del Owner.
