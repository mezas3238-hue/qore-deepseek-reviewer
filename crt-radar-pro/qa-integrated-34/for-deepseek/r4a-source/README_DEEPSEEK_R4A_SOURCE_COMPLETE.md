# QORE CRT RADAR PRO R4-A — código íntegro en 20 partes para auditoría DeepSeek

**Usa este índice, no el HTML de la vista del archivo original que puede truncarse al llegar a la línea 406.**

Este directorio es una **copia de lectura, no un indicador instalable**. Cada `PART_XX` es una sección **literal** del Pine R4-A original, sin encabezados añadidos, sin ajustes ni reemplazos. Concatenando el contenido de las 20 partes en el orden indicado se recuperan los bytes originales. **No copiar una parte aislada en TradingView.**

- Fuente original: [QORE_CRT_34_R4_AB_400_M5_AUTO_BUFFER_QA.pine](../../QORE_CRT_34_R4_AB_400_M5_AUTO_BUFFER_QA.pine)
- Git blob SHA-1 esperado: `693e3f49719e86e2ea0702f7b355af33bd0c4c7c`
- Longitud: 3.546 líneas físicas terminadas en LF (el `split("\n")` contiene 3.547 elementos, último vacío por newline terminal).
- Objetivo: leer el motor `f_engine()` completo y las siete categorías sin truncado.
- Validación automática: `../../tests/test_r4a_deepseek_20parts_exact.py`; GitHub Actions ejecuta coincidencia **byte por byte** contra la fuente.

## Índice de fragmentos

| Parte | Líneas del código original | Archivo |
|---|---:|---|
| 01 | 1–180 | [PART_01_L0001-0180.txt](PART_01_L0001-0180.txt) |
| 02 | 181–360 | [PART_02_L0181-0360.txt](PART_02_L0181-0360.txt) |
| 03 | 361–540 | [PART_03_L0361-0540.txt](PART_03_L0361-0540.txt) |
| 04 | 541–720 | [PART_04_L0541-0720.txt](PART_04_L0541-0720.txt) |
| 05 | 721–900 | [PART_05_L0721-0900.txt](PART_05_L0721-0900.txt) |
| 06 | 901–1080 | [PART_06_L0901-1080.txt](PART_06_L0901-1080.txt) |
| 07 | 1081–1260 | [PART_07_L1081-1260.txt](PART_07_L1081-1260.txt) |
| 08 | 1261–1440 | [PART_08_L1261-1440.txt](PART_08_L1261-1440.txt) |
| 09 | 1441–1620 | [PART_09_L1441-1620.txt](PART_09_L1441-1620.txt) |
| 10 | 1621–1800 | [PART_10_L1621-1800.txt](PART_10_L1621-1800.txt) |
| 11 | 1801–1980 | [PART_11_L1801-1980.txt](PART_11_L1801-1980.txt) |
| 12 | 1981–2160 | [PART_12_L1981-2160.txt](PART_12_L1981-2160.txt) |
| 13 | 2161–2340 | [PART_13_L2161-2340.txt](PART_13_L2161-2340.txt) |
| 14 | 2341–2520 | [PART_14_L2341-2520.txt](PART_14_L2341-2520.txt) |
| 15 | 2521–2700 | [PART_15_L2521-2700.txt](PART_15_L2521-2700.txt) |
| 16 | 2701–2880 | [PART_16_L2701-2880.txt](PART_16_L2701-2880.txt) |
| 17 | 2881–3060 | [PART_17_L2881-3060.txt](PART_17_L2881-3060.txt) |
| 18 | 3061–3240 | [PART_18_L3061-3240.txt](PART_18_L3061-3240.txt) |
| 19 | 3241–3420 | [PART_19_L3241-3420.txt](PART_19_L3241-3420.txt) |
| 20 | 3421–3547 | [PART_20_L3421-3547.txt](PART_20_L3421-3547.txt) |

## Protocolo estricto para DeepSeek
1. Lee **cada una de las 20 partes** en orden. No declares "lectura completa" si falta alguna o el resultado queda truncado.
2. Verifica nombres, rangos de líneas y longitudes; ejecuta la reconstrucción y compara SHA del objeto Git `blob <length>\\0<bytes>`. Si no puedes leer las veinte partes, **declara bloqueo en lugar de suponer la lógica**.
3. Auditado previamente: `CRT_2C_RETURN` ratificado con MSS M15 propio requiere evaluación independiente de `3C TRUE QA`; `qaTrue3CConfirmed` nace tras cerrar C3 y no implica por sí solo un MSS. `phase == 2 AND modelKind == "CRT_2C_RETURN"` es la ruta 2C, no un requisito automático para TRUE 3C.
4. La ratificación `C3` de TRUE 3C sucede **después** de que pueda ocurrir `mss5At` durante la misma C3: entrada más temprana = siguiente tick/vela ejecutable **después** de satisfacer ambas condiciones, con precios y datos existentes entonces.
5. SL C3 para TRUE 3C y SL C2 para 2C solo son **hipótesis por comprobar**, no están programados en el indicador. No asumir que `ATR .25` o cuerpo C3 50 % son reglas de Pine.
6. Se exigió holdout de **24 meses consecutivos**, no solo 2025. Si se selecciona 2024–2025, 2024 no puede utilizarse para validación y ambos años deben estar no expuestos.
7. La ventana `calc_bars_count=400` **no contiene dos años**. Es indispensable un replay temporal externo causal, datos M5 con spread y prueba de paridad de eventos 100 % antes del holdout.
8. El indicador tiene bloqueo QA para 33 mercados no BTC, e histórico incidente RE10110 en Android. No afirmar que el radar ha quedado certificado, o que TRUE 3C o 2C sean ya rentables o autorizados para LIVE.

**Restricciones Owner:** análisis y pruebas QA únicamente; no merge, no LIVE, no órdenes, no VPS.

## Ejemplo de reconstrucción local

```python
from pathlib import Path
import hashlib

part_dir = Path("crt-radar-pro/qa-integrated-34/for-deepseek/r4a-source")
chunks = sorted(part_dir.glob("PART_*.txt"))
assert len(chunks) == 20
src = b"".join(p.read_bytes() for p in chunks)
blob = hashlib.sha1(b"blob " + str(len(src)).encode() + b"\0" + src).hexdigest()
print(blob)
assert blob == "693e3f49719e86e2ea0702f7b355af33bd0c4c7c"
```

El test del repositorio comprueba adicionalmente bytes contra el `.pine` original en la misma rama.
