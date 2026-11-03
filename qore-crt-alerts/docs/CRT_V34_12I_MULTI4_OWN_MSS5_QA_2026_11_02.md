# CRT V34.12I — Multi4 MSS M5 propio, QA sin alertas

Fecha: 2026-11-02. PR #74 DRAFT / NO LIVE / NO PUSH / NO MERGE.

Se reutilizan los motores V34.12I A/B. Cada H4 completa elegible como C1 instala un candidato limitado (maximo cuatro) para la C2a siguiente. Solo la primera M5 con barrida estricta de esa C1 durante C2a congela el pivote M5 L2/R2 confirmado y anterior a la barrida. C2b y C3 pueden ofrecer cierre M5 cruzado posterior, pero nunca instalar una barrida inicial tardia. Un sweep opuesto posterior invalida el candidato y su MSS. Una brecha de M5 o H4 incompleta borra candidatos.

Al cerrar la cuarta H4, la geometria Multi4 original permanece obligatoria; solo se extrae un MSS M5 si existe candidato de C1 y C2a identicos, direccion igual, barrida antes de cerrar C2a, y cruce causal M5 dentro de la ventana. En otros casos el dashboard y Chart B conservan N/V. No se usa el MSS M5 de Multi-N, Inside o 2C. No se inventa MSS M15 propio de Multi4: queda pendiente de diseño y evidencia real.

Se mantienen 132 campos de Signal, motor A/B textual identico, presupuesto de plots y useAlerts OFF. La prueba automatica es solo estatica/determinista, **no certificacion TradingView**. Pendiente: Pine Editor v6, mismo feed M5, 4 H4 reales, positivos y negativos Multi4, MSS M15 independiente y paridad Trader Lab. Holdout no sellado, FCM no certificado.
