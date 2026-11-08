# QORE CRT — 34 instrumentos: diagnóstico causal CRT/MSS y divergencia H4 índices

**Corte:** 2026-11-07. **Modo:** IC Markets cTrader DEMO / Railway STAGING / OAuth SCOPE_VIEW. **No LIVE, operaciones, FCM, merge ni alertas de usuarios.**

## Evidencias anteriores intactas

La campaña real PR #93 comprobó **20.400 M5, 8.500 M15 nativas y 1.019 H4 nativas** en 34/34 símbolos. En **6.789 M15** y **390 H4** con suficientes M5 cerradas se detectaron **cero diferencias OHLC**. Se preservan los 12 M15 y 22 H4 bloques incompletos. Esto NO es paridad externa con TradingView y NO certifica señales.

## Nueva auditoría: correr los detectores existentes sobre las velas reales

El modo experimental `QORE_CT_QA_CRT_MSS_ALL34=OWNER_APPROVED_CLOSED_34_CRT_MSS_REPLAY_QA` se habilita únicamente junto a los flags `OWNER_APPROVED_FULL_34_DEMO_M5_QA` (2 × 300 M5 cerradas) y `OWNER_APPROVED_34_NATIVE_M15_H4_QA` (M15/H4 nativas). La consulta inicial de inventario y huella **34/34** precede a cada una de las consultas históricas.

Después de demostrar la misma fuente nativa y que **ninguna comparación M15/H4 elegible difiere** de las M5, se invocan **los motores de laboratorio existentes**: `replayCycle`, `inspectCrtH4`, `inspectMssM5`, `inspectMssM15` e `inspectCrtMorphologies`. Nunca se copia un resultado MSS M5 a MSS M15. Se valida por separado que la confirmación M5 esté cerrada en M5, que la M15 lo esté en M15, que ambos usen la misma identidad de C1, instrumento y dirección y que las fechas no estén en el futuro.

En cada mercado el resultado informa el número real de H4 completas e incompletas, C1/C2 elegibles, estados CRT, MSS M5, MSS M15 y conteos observados de los **siete roles**, preservando los roles *PROVISIONAL* y *REJECTION* como no operables. Sin observaciones en la muestra, se informa `NOT_OBSERVED_IN_SAMPLE`; **nunca** se inventa un CRT positivo.

El resultado por símbolo se publica únicamente como **contadores de QA privados de Railway**, sin velas ni datos personales o secretos, sin API de órdenes y sin acceso a QORE Mobile. Se conserva `noRepaintCertified=false`, `mssM5Certified=false`, `mssM15Certified=false`, `sevenCrtRolesCertified=false`, `sourceParityCertified=false`, `canTrade=false`, `sendPush=false`.

## Hallazgo técnico: anclaje temporal incompatible para índices

El código soberano actual `ny-clock.mjs` tiene `C1_HOURS.index=[2,6,22]` Nueva York y fija el ciclo H4 de índices en 02/06/10/14/18/22 NY. En noviembre 2026, esto produce fase UTC **180 minutos módulo 240** (03/07/11/15/19/23 UTC). Pero el examen real cTrader DEMO de los 34 símbolos observó las H4 nativas de **USTEC, US500 y US30** con fase UTC **120 minutos módulo 240** (02/06/10/14/18/22 UTC).

**No son el mismo H4.** No es válido pasar un resultado de velas M5 reconstruidas bajo el calendario antiguo de índices a un CRT supuestamente equivalente a cTrader, ni desplazar las velas automáticamente una hora. El examen devuelve `NATIVE_VS_CONFIGURED_NY_H4_CLOCK_MISMATCH_QA` y **no evalúa CRT/MSS de esos tres mercados** hasta que se reconcilie y autorice el reloj. Los restantes 31 se examinan para **diagnóstico de laboratorio no certificado**.

Este conflicto de horario NO contradice la coincidencia anterior de OHLC nativa-vs-M5: allí las 48 M5 se agruparon con el inicio real de la H4 nativa; aquí el código de señales usa su propio anclaje Nueva York de índices, que resulta distinto. Este es precisamente el error que esta puerta previene.

**BTCUSD:** el agrupador BTC tiene su ruta propia (`aggregateClosedCryptoM5`), y conserva su horario C1 propietario; no se convierte automáticamente a Forex como señal autorizada.

## Lo que aún falta para concluir

1. Owner/arquitectura: revisar horarios y anclas **por mercado**, especialmente el desfase H4 de índices. Sin cambiar en secreto el código soberano.
2. Conseguir trazas reales de eventos Pine de la versión aprobada del indicador y compararlas **evento a evento**, con C1 y timestamps; un panel con siete bits no certifica siete familias.
3. Controles positivos y negativos de las siete categorías, holdout, no repaint de pivotes, MSS M5/M15 independientes y TTL alertas 4h.
4. Solo tras superar esos controles, activar pruebas aisladas app/widget; nunca LIVE, FundedNext ni FCM real sin nueva autorización.

Se conserva DRAFT/NO MERGE y GitHub como fuente soberana.
