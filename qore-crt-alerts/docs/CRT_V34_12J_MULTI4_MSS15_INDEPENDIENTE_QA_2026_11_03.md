# QORE CRT V34.12I QA — Multi4 MSS M15 independiente (03 Nov 2026)

**Estado:** QA / NO LIVE / NO PUSH / NO MERGE. Código en PR #74, no certificado por compilador Pine Editor ni replay real.

### Cambio mínimo

Multi4 conservaba C1, C2a, barrida, pivote M5 y MSS M5 propios. Ahora también congela `pivot15/pivot15At` del **último pivote M15 L2/R2 confirmado antes de la barrida C2a** del mismo feed, y observa un cruce de M15 **cerrada** independiente de M5 y de 2C/Inside/Multi-N/True3C.

Condiciones obligatorias: dirección única, C1+C2a propias, primer sweep en C2a, no doble barrida, pivote M15 previo al sweep y dentro del segmento M5 continuo, `closed15At > sweepAt`, cierre M15 completo de 3 M5, prev15 inmediato continuo, `f_m15_phase_ok`, cruce por cierre nuevo y cierre anterior, y fin antes del término de la cuarta H4. El contra-sweep borra **ambos MSS** y los pivotes.

Al cierre de la cuarta H4, sólo se publica la evidencia del candidato con **misma C1, C2a, dirección y barrida**. Los campos extraFamilyM15 de `Signal` ahora admiten Multi4 cuando esa familia es la dueña del evento y pasa el gate causal. El constructor `Signal.new` mantiene **132 campos en idéntico orden**; no afecta al esquema de Radar/Chart ni sus 34 símbolos.

La sonda Radar A 600 M5 se mantiene con 34 feeds, `qaPhase1NonBtc=false` por defecto y su control opcional de fase desplazada **sólo QA**. Otras 300/1500 M5 se actualizan con igual motor para evitar divergencia. No modificar `scanCrtValid`, no promover estructuras desplazadas a operativas.

### Evidencia y límites

`qore-crt-alerts/test/pine-v34-12j-multi4-own-mss15-qa.test.mjs`: comprueba paridad textual A/B/600, identidades de estado/candidato, gating independiente, doble sweep y simulación determinista positiva/negativa. No representa compilación Pine real, prueba de broker ni ejecución de los 34 mercados con OHLC históricos.

**Pendientes:** Pine Editor Android/web A+B, replay de Multi4 con caso auténtico positivo y negativas, 34 instrumentos con fuente verificada a minuto :00 NY, memoria real de 600 M5, alertas Android FCM. H20 sigue decisión de diseño; no se agrega limitación geométrica de pivote a C1 sin fuente.
