# QORE CRT — doble reloj H4: fuente nativa vs metodología original
**QA 7–8 noviembre 2026; 34 instrumentos IC Markets cTrader DEMO; NO LIVE, NO ORDENES, NO PUSH, NO MERGE.**

## Problema demostrado anteriormente

El ensayo real de 34 símbolos (PR #94, Railway deploy `3bc3d264-4ab9-4ad9-ac74-9dc639b40fcc`) evaluó 34/34 fuentes: 31 pudieron entrar en modo diagnóstico CRT/MSS y **USTEC, US500, US30 fueron bloqueados** por diferencia entre la fase H4 nativa observada (UTC 120 minutos módulo 240) y la fase calculada por el configurador de índices `ny-clock.mjs` (UTC 180 minutos módulo 240, muestra noviembre de 2026).

**Los precios de H4 no son el problema:** en la campaña anterior 390 H4 y 6.789 M15 nativas elegibles coincidieron exactamente en OHLC con la reconstrucción de M5. El problema es la **definición de inicio y, por tanto, de C1/C2/C3** para los índices; el anclaje H4 elegido por el indicador puede producir otras velas.

## Qué hace este experimento

El módulo `src/qa-ctrader-34-native-vs-owner-h4-clock.mjs` no modifica el detector CRT ni las horas aprobadas. Recibe los **600 M5 reales y cerrados de cada instrumento**, verifica identidad de fuente y símbolo, y exige el resumen de paridad interna M5/H4 de la misma cuenta cTrader.

Para cada uno de los **34**:
1. Reconstruye las H4 usando el **reloj soberano** definido por `aggregateClosedM5`/`aggregateClosedCryptoM5` + `ny-clock.mjs`, sin alterar su configuración.
2. Genera una segunda reconstrucción **solo para comparación QA** usando el inicio modular de las H4 nativas que cTrader reportó y que ya fue comprobado con bloques completos de 48 M5.
3. Cuenta cuántos bloques completos de H4 tienen exactamente **el mismo timestamp de apertura**, cuáles solo existen en el reloj original, y cuáles solo en el reloj nativo.
4. Para los índices, cuenta si alguna H4 nativa comienza en las horas C1 actualmente autorizadas **02/06/22 New York**. Puede enumerar horas adyacentes *observadas*, **sin proponerlas como aprobación, sin crear operaciones y sin seleccionar una por defecto**.
5. Rechaza fuentes manipuladas, barras abiertas, símbolos mezclados y muestras con fase nativa múltiple sin segmentación DST. Nunca rellena velas de mercado cerrado.

**Distinción de DST:** La diferencia observada en noviembre no demuestra que un corrimiento fijo de una hora solucione todo el año. En julio, con una fase UTC de ejemplo igual a 120 minutos, el reloj original de índices puede alinear sus aperturas. Ese escenario es **una prueba sintética**, NO evidencia del feed de julio. Se necesitan datos **reales de la misma cuenta** a ambos lados del cambio DST para una decisión definitiva. Nunca desplazar retrospectivamente los precios.

## Gobernanza y futuro

- Siguen intactos `C1_HOURS.index=[2,6,22]`, el algoritmo CRT/MSS, los siete roles con sus estados de rechazo, los 34 IDs cTrader y todas las salvaguardas de fuente. 
- El nuevo resultado de doble reloj es **diagnóstico privado**; `clockReconciled=false`, `needsIndependentSeasonalSample=true`, `crtCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`, `sendPush=false`, `canTrade=false`.
- La auditoría del PR #95 se injerta en la misma ejecución 34/34 ya preparada, sin un segundo feed ni endpoint. **No se certifican** los índices ni se inventan CRT/MSS mientras el reloj y la paridad Pine sigan pendientes.
- Próxima decisión técnica del Owner: revisar evidencia H4 nativa de índices en invierno/verano y el horario oficial del bróker, y autorizar **explícitamente** la metodología de C1 o un adaptador separado si procede. No alterar una estrategia aprobada por decisión automática.
- Posteriormente: pruebas positivas/negativas de MULTI4/MULTI_N, cierre de pivotes, holdout/no repaint, paridad exacta de eventos Pine–Trader Lab sobre 34 mercados, TTL 4 h y pruebas app/widget. No FCM real todavía.

**GitHub sigue siendo fuente soberana.**
