# V34.11Q — Revisión técnica de DeepSeek y verdadero C3 con barrida de C1

Fecha de corte: 2 de noviembre de 2026. **QA / NO LIVE / NO PUSH / NO MERGE**.

## Decisión del propietario (recuperada de lámina 8/20)

Los **cuatro modelos estructurales** que deben poder distinguirse en los 34 feeds son:

1. **2 velas:** C1 rango H4; C2 barre UN extremo C1 y cierra de vuelta dentro C1; MSS M5/M15 es confirmación independiente. C3 puede distribuir, pero NO cambia 2C en «otro CRT de tres velas».
2. **3 velas independiente de la lámina:** C1 rango H4; C2 setup/consolidación **sin barrer C1**; C3 barre UN extremo de C1 y cierra dentro C1. Aceptar C2 que toque el límite C1 por igualdad, rechazar cruce estricto. Diferenciar del 2C que barre en C2.
3. **Inside Bar:** C2 estrictamente interior (high2 < high1, low2 > low1); C3 barre el límite de **C2**; no basta para afirmar un barrido de C1. Si además C3 barre C1 y cierra dentro, la clasificación 3C-C1-sweep tiene prioridad para el monitor QA y no genera dos alertas.
4. **Multi-Candle:** C1, varias velas de consolidación y vela final de barrida/retorno; mantener Multi4 y Multi-N diferenciados en QA, no convertirlos en 2C.

Esto sigue una **taxonomía particular de las láminas**. Algunos recursos externos llaman “modelo de tres velas” a C1 rango, C2 sweep, C3 distribución. No atribuir de forma universal ninguna variante a Rowdy FX sin disponer de la lámina precisa. Conservar la geometría indicada explícitamente por el propietario.

## Error certificado por lectura del código P

`category3C = outPhase==2 && outModel=="CRT_2C_RETURN"` era falso 3C: el mismo evento 2C ratificado en C3. Además la máscara de 7 roles mezclaba estados, rechazos y retest. “7 bits” no es “7 familias de entradas”.

## Implementación de investigación

- `qore-crt-alerts/src/crt-true-3c-rowdy-qa.mjs`: detector C1/C2/C3 H4 cerradas, contiguas, 48 M5 cada una, C2 sin barrida C1, C3 barrida estricta UNILATERAL C1 y cierre interior; registra identidad por proveedor, instrumento, C1, dirección; MSS5 y MSS15 solo si hay sweepAt observado y dos cierres causales independientes con pivotes anteriores. Sin órdenes/push. En ausencia de evidencia, `UNVERIFIED`.
- `crt-radar-pro/CRT_RADAR_PRO_V34_11Q_TRUE3C_ROWdy_C3_SWEEP_QA_NO_LIVE.pine`: archivo nuevo, no sobrescribe P. Detector de **estructura solamente** en `qaMultiNHistory` existente (7 H4 máximo, insertadas tras 48 M5/H4). Cambia bit 1 del catálogo a **C3 real con barrida de C1**, reservando `category2CActiveC3` como legado 2C. Captura la última C3 cerrada en `qaTrue3CSignedAt` (epoch ms firmado: positivo alcista, negativo bajista; UN campo adicional UDT = 127). Ventana de observación H4, no certificado histórico ni entrada.
- Dashboard de V34.11Q prioriza `3C TRUE QA / C3 CERR QA` sobre Inside cuando C3 barrió C1 (pero no importa MSS Inside), con dirección derivada exclusivamente del evento firmado. MSS5 y MSS15 **N/V** para esta nueva estructura: el contrato Python/JS offline exige pivote+ruptura del mismo ciclo, pero la evidencia M5/M15 de true3C NO está transportada todavía en `Signal` de Pine. Presentar `SI` aquí sería inventarlo.
- El detector antiguo 2C, Inside y Multi, guardas contra doble barrida, 34 `input.symbol`, H4 48 M5, fases nativas 0..4m, 60 plots y alertas bloqueadas permanecen operativamente intactos en una versión paralela. El UDT ahora tiene 127 campos; compilar realmente Pine v6 antes de admitir la versión.

## Riesgos y próximos trabajos obligatorios

1. **E2E real en TradingView:** compilar Q y verificar que el escáner detecta C2 setup/C3 sweep en un mercado, no solo que compile. Si falta historia M5 o fuentes no coinciden, clasificar “SIN DATO” y nunca falsificar un evento.
2. **MSS5/MSS15 independiente para true3C:** capturar en C3 el primer `sweepAt` estricto de C1, congelar un pivote M5/M15 confirmado *antes* de esa barrida, exigir ruptura por cierre de cada timeframe posterior a sweep y anterior al límite C3. El componente JS ya define evidencia pero **Pine todavía no la expone**.
3. **Paridad 34 feeds:** comparar Pine/Trader Lab misma fuente OHLC M5, 3C real, 2C, Inside, Multi4/MultiN, C1 NY exacto/DST, controles negativos de doble sweep, C3 incompleta, gap M5, phase. No reusar históricos ya inspeccionados como holdout.
4. **Taxonomía “7”**: distinguir cuatro familias estructurales de los estados/variantes operativos; si el propietario exige 7 familias morfológicas distintas, necesitaría una definición de tres adicionales, no llamar “entrada” a rechazo o retest. Hasta entonces no certificar 7/7 por 7 bits.
5. Alertas Android siguen independientes de TradingView pero no están listas para activar: proveedor homologado, motor CRT real, autenticación y prueba FCM real; continuar NO PUSH.

**No se puede afirmar que Q detecte con precisión real ni que 4/4 estructuras estén homologadas sin Pine Editor, fuente idéntica y holdout.**
