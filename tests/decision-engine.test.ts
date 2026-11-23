import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { buildModel, conditionScores, consistency, crispMatrix, DIMENSIONS, instrument, minimumRanks, MODULES, PAIRS, relevanceMatrix, sensitivity, spearman, toTFN, topsis, type ExpertInput } from "@/lib/decision-engine";
import { canonical, inputHash, csvCell } from "@/lib/digital-checkup/canonical";
import { pythonCommand } from "./helpers/python";
export const answers = (n: number) => Object.fromEntries(instrument.questions.map((q) => [q.code, n]));
export const expert = (variant = 0): ExpertInput => ({ pairs: PAIRS.map((p) => ({ ...p, preferred: variant && p.left === 'C1' ? p.left : 'equal', intensity: variant && p.left === 'C1' ? variant+1 : 1 })), relevance: Object.fromEntries(MODULES.map((m, i) => [m, Object.fromEntries(DIMENSIONS.map((d, j) => [d, (i+j+variant)%5]))])) });

describe("fixed research instrument", () => {
  it("has exact ordered IDs, 32 questions, 160 options, seven alternatives", () => {
    expect(DIMENSIONS).toEqual(Array.from({ length: 8 }, (_, i) => `C${i+1}`));
    expect(MODULES).toEqual(Array.from({ length: 7 }, (_, i) => `A${i+1}`));
    expect(instrument.questions.map((q) => q.code)).toEqual(Array.from({ length: 32 }, (_, i) => `Q${String(i+1).padStart(2,'0')}`));
    instrument.questions.forEach((q) => expect(q.options.map((o) => o.score)).toEqual([0,1,2,3,4]));
    DIMENSIONS.forEach((d) => expect(instrument.questions.filter((q) => q.dimension === d)).toHaveLength(4));
  });
  it("has 28 unique pairs and reciprocal diagonal-one matrix", () => {
    expect(PAIRS).toHaveLength(28); const matrix = crispMatrix(expert(2).pairs);
    matrix.forEach((row, i) => row.forEach((x, j) => expect(x*matrix[j][i]).toBeCloseTo(1, 14)));
    matrix.forEach((row, i) => expect(row[i]).toBe(1));
    expect(() => crispMatrix([...expert().pairs.slice(1), expert().pairs[1]])).toThrow();
  });
  it.each([[1,[1,1,1]],[2,[1,2,3]],[9,[8,9,9]],[1/2,[1/3,1/2,1]],[1/9,[1/9,1/9,1/8]]] as const)("TFN %s", (x, expected) => expect(toTFN(x)).toEqual(expected));
  it("rejects invented fuzzy values", () => expect(() => toTFN(1.2)).toThrow());
  it("equal comparisons give exactly uniform weights", () => expect(buildModel([expert(),expert(),expert()]).w).toEqual(Array(8).fill(.125)));
  it("aggregates three experts geometrically and normalizes positive weights", () => {
    const model = buildModel([expert(),expert(1),expert(2)]);
    expect(model.groupTFN[0][1][1]).toBeCloseTo(6**(1/3),14);
    expect(model.w.every((w) => w>0)).toBe(true); expect(model.w.reduce((s,w)=>s+w)).toBeCloseTo(1,14);
    expect(() => buildModel([expert(),expert()])).toThrow();
  });
  it("detects inconsistent judgments", () => {
    expect(consistency(crispMatrix(expert(2).pairs)).CR).toBeLessThan(.1);
    const pairs = expert().pairs.map((p,i)=>({...p,preferred:i%2?p.left:p.right,intensity:9}));
    expect(consistency(crispMatrix(pairs)).CR).toBeGreaterThan(.1);
    expect(()=>buildModel([{...expert(),pairs},expert(),expert()])).toThrow();
  });
  it("accepts zero relevance and rejects null or missing cells", () => {
    const r = expert().relevance; expect(relevanceMatrix(r).flat()).toHaveLength(56);
    expect(relevanceMatrix(r).flat()).toContain(0);
    expect(()=>relevanceMatrix({...r,A1:{...r.A1,C1:null as unknown as number}})).toThrow();
    expect(()=>relevanceMatrix({...r,A1:{C1:0}})).toThrow();
  });
  it("zero is complete, null and missing answers are not zero", () => {
    expect(conditionScores(answers(0))).toEqual(Array(8).fill(0));
    expect(conditionScores(answers(4))).toEqual(Array(8).fill(100));
    expect(()=>conditionScores({...answers(0),Q01:null})).toThrow();
    expect(()=>conditionScores({Q01:0})).toThrow();
  });
});
describe("personal TOPSIS", () => {
  const w = Array(8).fill(.125), R = relevanceMatrix(expert().relevance);
  it("normalizes personal weights", () => expect(topsis(answers(2),w,R).q.reduce((s,x)=>s+x)).toBeCloseTo(1,14));
  it("does not invent rankings for perfect scores", () => expect(topsis(answers(4),w,R)).toMatchObject({ status:'NO_IDENTIFIED_GAP', ranking:[] }));
  it("reports an uncovered dimension", () => expect(topsis(answers(0),w,R.map(r=>[0,...r.slice(1)]))).toMatchObject({status:'UNCOVERED_DIMENSION',uncovered:['C1'],ranking:[]}));
  it("ignores zero relevance columns only when there is no gap there", () => {
    const a={...answers(0),Q01:4,Q02:4,Q03:4,Q04:4}; expect(topsis(a,w,R.map(r=>[0,...r.slice(1)])).status).toBe('RANKED');
  });
  it("identical alternatives have no false winner",()=>expect(topsis(answers(0),w,Array.from({length:7},()=>Array(8).fill(1)))).toMatchObject({status:'ALTERNATIVES_NOT_DISTINGUISHABLE',ranking:[]}));
  it("different gap patterns change priorities",()=>{
    const a={...answers(4),Q01:0,Q02:0,Q03:0,Q04:0};
    const b={...answers(4),Q05:0,Q06:0,Q07:0,Q08:0};
    expect(topsis(a,w,R).topSet).not.toEqual(topsis(b,w,R).topSet);
  });
  it("proportional gaps preserve C but not H",()=>{
    const a=topsis(answers(0),w,R),b=topsis(answers(2),w,R); expect(a.C).toEqual(b.C);expect(a.H).toBe(b.H*2);
  });
  it("ties use minimum rank and Spearman uses midranks",()=>{expect(minimumRanks([.9,.9,.5,.2])).toEqual([1,1,3,4]);expect(spearman([1,1,3],[1,1,3])).toBe(1);expect(spearman([1,1,1],[1,2,3])).toBeNull();});
  it("storage order never substitutes IDs",()=>{
    const e=expert(1), reversed={pairs:[...e.pairs].reverse(),relevance:Object.fromEntries(Object.entries(e.relevance).reverse().map(([k,v])=>[k,Object.fromEntries(Object.entries(v).reverse())]))};
    expect(buildModel([e,e,e])).toEqual(buildModel([reversed,reversed,reversed]));
    expect(conditionScores(Object.fromEntries(Object.entries(answers(2)).reverse()))).toEqual(conditionScores(answers(2)));
  });
  it("saves exactly 32 scenarios",()=>expect(sensitivity(answers(2),{w,R})).toHaveLength(32));
  it("canonical hash is order-independent and rejects nonfinite",()=>{expect(inputHash({b:2,a:1})).toBe(inputHash({a:1,b:2}));expect(()=>canonical({a:NaN})).toThrow();expect(csvCell('=1+1')).toBe('"\'=1+1"');});
});
describe("independent Python golden comparison", () => {
  for (const kind of ['normal','perfect','uncovered','identical','tie']) it(kind,()=>{
    const experts=[expert(),expert(1),expert(2)];
    if(kind==='uncovered') experts.forEach(e=>MODULES.forEach(m=>{e.relevance[m].C1=0;}));
    if(kind==='identical') experts.forEach(e=>MODULES.forEach(m=>{e.relevance[m]=Object.fromEntries(DIMENSIONS.map(d=>[d,2]));}));
    if(kind==='tie') experts.forEach(e=>{e.relevance.A2={...e.relevance.A1};});
    const a=kind==='normal'||kind==='tie'?Object.fromEntries(instrument.questions.map((q,i)=>[q.code,Math.floor(i/4)%5])):answers(kind==='perfect'?4:2),model=buildModel(experts),actual=topsis(a,model.w,model.R);
    const input={instrumentVersion:instrument.version,modelVersion:instrument.modelVersion,dimensionCodes:DIMENSIONS,moduleCodes:MODULES,experts,answers:a};
    const python=spawnSync(pythonCommand(),['scripts/decision-oracle.py'],{input:JSON.stringify(input),encoding:'utf8'});
    expect(python.status,python.stderr).toBe(0);const reference=JSON.parse(python.stdout);
    const compare=(x:unknown,y:unknown):void=>{if(typeof y==='number'){expect(typeof x).toBe('number');expect(Number.isFinite(x)).toBe(true);expect(Math.abs(Number(x)-y)).toBeLessThanOrEqual(1e-10*Math.max(1,Math.abs(y)));}else if(Array.isArray(y)){expect(Array.isArray(x)).toBe(true);expect((x as unknown[]).length).toBe(y.length);y.forEach((v,i)=>compare((x as unknown[])[i],v));}else expect(x).toEqual(y);};
    Object.entries(reference).forEach(([key,value])=>{if(['status','rank','topSet'].includes(key))expect(actual[key as keyof typeof actual]).toEqual(value);else compare(actual[key as keyof typeof actual],value);});
  });
});
