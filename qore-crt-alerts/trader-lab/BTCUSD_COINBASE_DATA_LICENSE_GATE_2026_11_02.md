# BTCUSD — puerta de licencia y proveedor (02 nov 2026)

**Estado:** BTCUSD sigue **SIN fuente OHLC M5 homologada** en `34-instrument-source-preflight-2026-11-01.json`. Ningún dato BTC se descargó, activó ni incorporó al motor, al replay de holdout o a alertas. **No declarar feed resuelto**.

## Investigación de fuentes oficiales
- Documentación del [Coinbase Advanced Trade Public Get Product Candles](https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/public/get-public-product-candles): existe endpoint público de velas `BTC-USD` con parámetros de inicio, fin, granularidad y límite; API pública **no equivale** a licencia de explotación en aplicaciones para usuarios externos.
- [Coinbase Market Data Terms of Use](https://www.coinbase.com/legal/market_data), versión declarada 07 agosto 2026, cláusulas **2** y **3**: uso limitado a fines personales o de investigación de la organización; restringe aplicaciones destinadas a terceros, redistribución/difusión de datos y derivados sin consentimiento previo expreso y aplicaciones para mejora de algoritmos/IA. Se requiere interpretación contractual específica y permiso explícito antes de incorporar el feed a un producto QORE CRT ALERTS distribuido.
- [Coinbase Data Marketplace](https://help.coinbase.com/en/data-marketplace/getting-started/coinbase-data-marketplace): canal oficial de compra/licencia de datos históricos mediante contrato. **No se contrató** aquí ni se obtuvo aprobación del titular.
- La identidad de mercado visible en TradingView para BTC debe ser exacta (se había trabajado con COINBASE:BTCUSD en pruebas previas); el producto de API `BTC-USD` no demuestra aún equivalencia byte a byte de OHLC a ese símbolo ni la política de sesiones/H4 del indicador.

## Decisión de ingeniería
- **FAIL CLOSED:** `data_license_verified=false`, `btc_source_available=false`, `source_content_attested=false`, `real_price_replay_executed=false`, `holdout_period_frozen=false`. No se modificó el preflight para aparentar avance.
- Antes de consumir datos BTC: acreditar derecho de uso para investigación y producto distribuido, proveedor, symbol mapping TradingView, cobertura histórica, H4 NY/DST, 48 barras M5 contiguas, huecos, y hash/manifest de datos recibidos.
- No interpolar una fuente BTC de otro broker ni usar snapshots públicos como si fuesen el OHLC oficial de TradingView.
- Los 33 archivos actuales son de calibración previa y permanecen **no autorizados para LIVE**; su hash verificado NO constituye licencia.

**NO MERGE / NO LIVE / NO PUSH.** Esta nota identifica un riesgo jurídico de datos y una ruta de investigación; no sustituye una revisión legal de contrato.
