# QORE CRT — examen real M15/H4 nativas en los 34 instrumentos

Corte: 2026-11-07. **GitHub DRAFT, Railway STAGING, IC Markets cTrader DEMO, SCOPE_VIEW ONLY. NO LIVE, NO OPERACIONES, NO PUSH, NO MERGE.**

## Punto de partida confirmado

- 34/34 símbolos exactos, vinculados al inventario de 365 símbolos mediante SHA-256 `98ee4738ffb49b894b6a25dc3ac80bfe43d77b6012cd7839733b5258d43e9885`.
- 600 M5 cerradas × 34 = **20.400 M5 reales**; 13 instrumentos con huecos temporales. Ver `EVIDENCIA_REAL_34x600_M5_Y_HUECOS_UTC_2026_11_07.md`.
- La clasificación indicativa de sesiones/pausas de 34 instrumentos está implementada offline en PR #92, pero **ningún calendario de plataforma está certificado**.
- Solo EURUSD había aprobado pruebas independientes de M15 nativa y H4 nativa, respectivamente, contra sus reconstrucciones con 600 M5.

## Examen nuevo: M15 y H4 realmente descargadas del broker para **cada uno de los 34**

Se exige bandera **exacta** y mutuamente exclusiva con CSV y pruebas especiales de EURUSD:

```text
QORE_CT_QA_COHORT34=OWNER_APPROVED_FULL_34_DEMO_M5_QA
QORE_CT_QA_COHORT34_PAGES=2
QORE_CT_QA_NATIVE_ALL34_TF=OWNER_APPROVED_34_NATIVE_M15_H4_QA
QORE_CT_QA_HISTORY_PAGES=1
QORE_CT_QA_NATIVE_M15_COMPARE=DISABLED
QORE_CT_QA_NATIVE_H4_AUDIT=DISABLED
QORE_CT_QA_M5_CSV_EXPORT=DISABLED
QORE_TRADING_ENABLED=false
QORE_PUSH_ENABLED=false
```

La autenticación y el inventario de **los 34 símbolos** se validan *antes* de autorizar cualquier lectura histórica. Después cada símbolo se vuelve a autenticar en SCOPE_VIEW y en DEMO; recupera sus 600 M5 cerradas con dos peticiones, una consulta nativa M15 `period=7, count<=250` y otra nativa H4 `period=10, count<=30`. Dos conexiones como máximo, sin retries automáticos, sin operaciones ni conexión al gateway.

Según el protocolo Spotware, el valor `low` y los `deltaOpen/deltaHigh/deltaClose` vienen en unidades 1/100000, para todos los instrumentos. Cada vela de 15 minutos se compara con **tres** M5 **cerradas y consecutivas**; cada vela H4 con **48** M5 cerradas y consecutivas en el **timestamp propio de la H4 nativa**, no en una hora desplazada para hacerla coincidir artificialmente con Forex. Ningún vacío de sesión se rellena.

Los resultados reales de cada instrumento deben reportar: conteo M15/H4 nativas, bloques M5 completos comparables, bloques descartados por M5 incompletas, desigualdades OHLC exactas por campo, diferencia máxima en ticks de 1e-5 y fase de apertura H4. Los conteos de H4 comparadas pueden variar por sesiones y cierres; no se presupone que todos tengan 12 H4 comparables.

### Reglas fail-closed

Si cualquier respuesta no pertenece a la cuenta DEMO, al símbolo nativo exacto, al período solicitado o contiene barras duplicadas/no cerradas, el símbolo queda bloqueado; jamás puede marcarse **34/34 nativas leídas** por omisión. Si una vela nativa difiere, se conserva el conteo de divergencias y se prohíbe certificar esa comparación. Las barras de sesión faltantes no se interpolan. BTCUSD continúa como categoría independiente.

Un match OHLC dentro de cTrader **no** constituye paridad con TradingView, no valida siete familias/categorías CRT, no demuestra MSS causal M5 o M15, y no activa alertas.

Fuentes técnicas oficiales: https://help.ctrader.com/open-api/model-messages/ y https://help.ctrader.com/open-api/symbol-data/.

## Puertas obligatorias posteriores

1. Auditar cada mercado con muestras independientes/holdout, ventanas de sesiones verificadas, DST y feriados; aclarar huecos de Forex/BTC y las pausas de índices/metales.
2. Comparar dos fuentes **independientes** de los 34 símbolos si se obtienen datos originales de TradingView; nunca asumir equivalencia por nombre.
3. Certificar eventos de **las siete categorías CRT** y los MSS **M5/M15 separados**, con causalidad, no repaint, negativos y TTL de alertas de cuatro horas.
4. Conectar app y widget Android **únicamente a eventos certificados**, tras sus pruebas QA.

Este PR prepara y ejecuta lectura/comparación de **34 instrumentos reales**; hasta que Railway informe la campaña no se afirma un resultado de M15/H4.
