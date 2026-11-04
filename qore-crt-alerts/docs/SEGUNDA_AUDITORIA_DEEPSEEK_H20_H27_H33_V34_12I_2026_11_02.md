# DeepSeek segunda auditoría: H-20 y H-27–H-33 — contraste V34.12I
Fecha: 2026-11-02. Base previa: `a2a1c6e643261c43cd4753a51bcf32c2926129f2`. **QA / NO LIVE / NO PUSH / NO MERGE**.

**H-27 confirmado:** Radar A sólo muestra panel, no dibuja CRH/CRL o MSS del chart: eso pertenece a Chart B. Se eliminan inputs engañosos del Radar y se actualiza la cabecera.

**H-28 confirmado:** `modeDashboard` era inerte. Se elimina, no se pierde el panel compacto, el expandido 34 ni historial verdaderos.

**H-29 confirmado:** `showSlotEventAudit` y `showNonBtcCohortQA` ocultaban el dashboard sin sustituto. Ahora se renderiza vista de 1 slot o QA 33 sin BTC (10 filas/página), desde los arrays ya existentes. El match de slot es exacto por broker; si no coincide, la tabla muestra `SIN SLOT / BROKER` en vez de inventar un feed. `qa33RootView`, `qaHistoricLast`, `qaReadableUtc`, `qaFollowChart` y `qaEventSlot` ahora tienen efecto real.

**H-30 confirmado:** `useAlerts` y `alertFreshMinutes` aparentaban permitir alertas, pero las llamadas estaban anuladas por `if false` y no existía `alert()`. Se eliminan controles y bloque muerto, NO se activan alertas.

**H-31 confirmado:** retirados inputs de Radar sin uso y gate `compactMobile`/`userFocus7` que podían dejar pantalla vacía. Conserva `page`, `expandFull34`, `showCatalog7` y `compactPriorityRows`.

**H-32 confirmado parcialmente:** la prioridad del chart sólo se aplica si `ticker.standard(syminfo.tickerid)` coincide **exactamente** con un feed; si otro broker, NO se suplanta ni mezcla, salvo BTC slot 8 ya soportado. En el panel se señala el gráfico seleccionado con `▶`.

**H-33 confirmado:** modo fase proveedor no-BTC es experimental y desplaza anclas. Se deja como opt-in `qaPhase1NonBtc=false` por defecto en A y B; no se relaja la validación de 48 M5/H4 ni se certifican feeds discontinuos.

**H-20 hipótesis aún no reproducida:** imponer que todo pivote MSS esté dentro del precio C1 podría eliminar pivotes estructurales válidos; antes de añadir tal filtro exige caso Rowdy + holdout y evaluación por familia.

No cambió el `f_engine()`, los 132 campos de `Signal` ni `Signal.new`. Sin compilación Pine Editor real ni paridad TradingView, NO CERTIFICANTE.