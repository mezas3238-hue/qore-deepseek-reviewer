ACTÚA COMO DEEPSEEK CODER, REVISOR TÉCNICO ADVERSARIAL FINAL DE QORE CORE.

REPO: mezas3238-hue/qore-core
PR: #443 — UMI14 UNR-019 Sukuk structural semantics
TRACKER: #442

BINDING CONGELADO OBLIGATORIO
BASE: 25ed21be1ba427820be78dbb8958d441e5f27f9c
HEAD: b2fae639779bdf27c497929af1a545ae70a42649
SYNTHETIC: db81e5268ee0abdc7cf07018d5daf7e9768d8604
SUPERFICIE: exactamente 3 archivos añadidos, +1458/-0.
CI: QORE CI #1417 verde sobre este HEAD.

REVISA EL HEAD CONGELADO. NO MODIFIQUES, NO HAGAS COMMIT/MERGE.

Contexto mínimo de adjudicación previa:
- DeepSeek Expert R1B propuso que corrupción reflectiva podía crear underlyings semánticamente duplicados que sobrevivieran logical_values(). IA lo RECHAZÓ: logical_values() invoca self.__post_init__(), y el __post_init__ agregado reconstruye seen_binding_ids/seen_semantic_bindings sobre los valores actuales y rechaza el duplicado. Expert R1B quedó PASS por IA. Intenta falsificar esta adjudicación de forma independiente; no la aceptes por autoridad.
- Los Coder R1B–R1F no publicaron ningún defecto técnico material adjudicable; quedaron inconclusos por infraestructura/completion.
- R1G no ejecutó revisión DeepSeek: falló PRE-API por un AttributeError del reviewer. No contiene evidencia técnica y no debe influir en tu veredicto.

OBJETIVO CONTRACTUAL
UNR-019 debe modelar de forma estática/provider-neutral una cualificación estructural de certificado Sukuk: estructura, certificate interest, underlying interests, legs contractuales ordenados, distribution source y evidencia externa Shari'ah, componiendo identidad UMI-02 y manteniendo separada la futura UNR-022 cross-family.

NO debe crear jurisprudence/compliance engine, autoridad legal/religiosa, cash-flow/payment calculation, valuation, market data, provider, Risk/account, execution, settlement mutation, Production ni real capital.

PRIORIDADES ADVERSARIALES
1. Busca estados inválidos aceptados o estados válidos razonables rechazados.
2. Verifica revalidación profunda y corrupción reflectiva, incluyendo duplicados cross-element y referencias rotas después de construcción.
3. Verifica canonicalización/orden total/determinismo; IDs distintos no deben esconder duplicados semánticos cuando el contrato los prohíbe.
4. Verifica exact runtime types/subclasses para UUID, str/code, date y wrappers UMI-02.
5. Verifica root EconomicIdentity y límites de familias/capability sin convertirlos en taxonomía cerrada no autorizada.
6. Verifica que structural legs, ordinales y binding refs conserven orden/materialidad y fallen cerrado ante duplicados/referencias inexistentes.
7. Verifica issue/maturity chronology y busca cronologías universales inventadas o ausentes.
8. Verifica la frontera UNR-019 vs UNR-022: no aceptar standalone Murabahah/Ijarah financing, Wakalah liquidity, Islamic hedge o syndicated-finance como raíz Sukuk por laundering de códigos.
9. Busca tests tautológicos, contradicciones source/tests/doc y claims que los tests no demuestren.
10. Confirma ausencia real de autoridad prohibida, no sólo por nombres/substrings.
11. Busca cualquier dimensión material omitida que haga que la cualificación Sukuk sea sólo un string opaco en lugar de estructura contractual útil.

PARA CADA HALLAZGO MATERIAL exige:
- ID/severidad;
- archivo/ubicación;
- invariante;
- witness CONSTRUIBLE que sobreviva todas las validaciones previas;
- expected/actual/impacto;
- corrección mínima;
- si exige mutar HEAD.

No reportes witnesses imposibles. No conviertas una diferencia nominal/textual en defecto sin invariante material. CI verde no es prueba semántica.

SALIDA
Si hay defectos materiales, enuméralos completos y termina: VALIDACIÓN BLOQUEADA.
Si después de revisión adversarial independiente no encuentras ninguno, termina EXACTAMENTE:

HALLAZGOS: NINGUNO
VALIDACIÓN OK
