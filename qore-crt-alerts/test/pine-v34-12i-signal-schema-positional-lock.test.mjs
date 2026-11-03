import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../../crt-radar-pro/", import.meta.url);
const read = n => readFileSync(new URL(n, root), "utf8");
const radar = read("QORE_CRT_RADAR_A_34_MERCADOS_V34_12_I_MSS5_INSIDE_MULTIN_QA_NO_LIVE.pine");
const chart = read("QORE_CRT_CHART_B_C1_MSS_V34_12_I_EXTRA_M5_QA_NO_LIVE.pine");
const golden = JSON.parse(readFileSync(new URL("../fixtures/v34-12i-signal-schema-lock.json", import.meta.url), "utf8"));

function fields(source) {
  const first = source.indexOf("type Signal\n");
  const last = source.indexOf("// M3B.2", first);
  assert.ok(first >= 0 && last > first, "Signal UDT boundaries");
  return source.slice(first, last).split("\n")
    .map(line => line.match(/^    (int|float|bool|string|FamilyVisual) ([A-Za-z_]\w*)\b/))
    .filter(Boolean)
    .map(match => ({ type: match[1], name: match[2] }));
}

function constructorArgs(source) {
  const token = "Signal.new(";
  const start = source.indexOf(token);
  assert.ok(start >= 0, "Signal constructor");
  let depth = 1, quote = false, escaped = false, part = "";
  const result = [];
  for(let i = start + token.length; i < source.length; i++) {
    const c = source[i];
    if(quote) {
      part += c;
      if(escaped) escaped = false;
      else if(c === "\\") escaped = true;
      else if(c === '"') quote = false;
      continue;
    }
    if(c === '"') { quote = true; part += c; continue; }
    if(c === "(") { depth++; part += c; continue; }
    if(c === ")") {
      depth--;
      if(depth === 0) { result.push(part.trim()); return result; }
      part += c; continue;
    }
    if(c === "," && depth === 1) { result.push(part.trim()); part = ""; continue; }
    part += c;
  }
  throw new Error("Unterminated Signal.new");
}

function assertSnapshot(source) {
  const f = fields(source), a = constructorArgs(source);
  assert.equal(f.length, 132);
  assert.equal(a.length, 132);
  assert.deepEqual(f, golden.fields);
  assert.deepEqual(a, golden.arguments);
}

test("Signal 132 fields and full constructor positional mapping locked for Radar A and Chart B", () => {
  assertSnapshot(radar);
  assertSnapshot(chart);
  assert.deepEqual(fields(radar), fields(chart));
  assert.deepEqual(constructorArgs(radar), constructorArgs(chart));
});

test("Detect same-type reordered fields, altered constructor argument, and deleted field", () => {
  const f = fields(radar), a = constructorArgs(radar);
  const switched = f.map(x => ({ ...x }));
  [switched[0], switched[1]] = [switched[1], switched[0]];
  assert.notDeepEqual(switched, golden.fields, "same int-type field swap must trigger drift");
  const changed = [...a]; changed[0] = "outDir";
  assert.notDeepEqual(changed, golden.arguments, "changed argument must trigger drift");
  assert.notEqual(f.slice(1).length, golden.fields.length, "missing field must trigger drift");
});

test("No live alert calls nor difference in shared A/B engine", () => {
  const engine = s => s.slice(s.indexOf("f_engine() =>"),s.indexOf("f_engine_snapshot() =>"));
  assert.equal(engine(radar), engine(chart));
  assert.ok(!/\balert\s*\(|\balertcondition\s*\(/.test(radar+chart));
});
