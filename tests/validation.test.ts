import { it, expect } from 'vitest';
import { assessmentSchema, blankExpert, caseSchema, validateExpertFinal } from '@/lib/digital-checkup/validation';
import { DIMENSIONS, MODULES, PAIRS, instrument } from '@/lib/decision-engine';
import { topsis } from '@/lib/decision-engine';
import { publicResult } from '@/lib/digital-checkup/public-result';
const profile={sector:'SIMULASI',district:'TEST',businessAgeMonths:0,peopleCount:1,respondentRole:'Pemilik',salesChannels:['Toko'],goal:'TEST',consent:true};
const answers=Object.fromEntries(instrument.questions.map(q=>[q.code,0]));
it('anonymous result DTO never reveals panel weights, matrices or TOPSIS coefficients',()=>{
  const result=publicResult(topsis(answers,Array(8).fill(.125),MODULES.map((_,i)=>DIMENSIONS.map((__,j)=>(i+j)%5))));
  expect(Object.keys(result.trace).sort()).toEqual(['ranking','status','topSet','uncovered']);
  result.trace.ranking.forEach(r=>expect(Object.keys(r).sort()).toEqual(['code','rank']));
  expect(result).not.toHaveProperty('w');expect(result).not.toHaveProperty('R');
});
it('server final requires consent, review confirmation and all 32 real scores',()=>{
  const request={profile,answers,final:true,confirmed:true,revision:0};
  expect(assessmentSchema.safeParse(request).success).toBe(true);
  expect(assessmentSchema.safeParse({...request,confirmed:false}).success).toBe(false);
  expect(assessmentSchema.safeParse({...request,profile:{...profile,consent:false}}).success).toBe(false);
  expect(assessmentSchema.safeParse({...request,answers:{...answers,Q32:null}}).success).toBe(false);
  expect(assessmentSchema.safeParse({...request,answers:{...answers,Q32:'0'}}).success).toBe(false);
});
it('low expert review scores require explicit suggestions; revision decision cannot freeze',()=>{
  const draft={...blankExpert(),profile:{name:'SIMULASI',institution:'TEST',jobTitle:'TEST',experienceYears:0,expertise:'TEST',consent:true,assessmentDate:'2026-09-11'},decision:'layak_uji_coba',reviews:Object.fromEntries(instrument.questions.map(q=>[q.code,{relevance:4,clarity:4,suggestion:''}])),pairs:PAIRS.map(p=>({...p,preferred:'equal',intensity:1})),relevance:Object.fromEntries(MODULES.map(m=>[m,Object.fromEntries(DIMENSIONS.map(d=>[d,0]))]))};
  expect(()=>validateExpertFinal(draft)).not.toThrow();
  expect(()=>validateExpertFinal({...draft,decision:'perlu_revisi'})).toThrow();
  expect(()=>validateExpertFinal({...draft,reviews:{...draft.reviews,Q01:{relevance:2,clarity:4,suggestion:''}}})).toThrow(/Q01/);
  expect(()=>validateExpertFinal({...draft,reviews:{...draft.reviews,Q01:{relevance:2,clarity:4,suggestion:'SIMULASI usulan'}}})).not.toThrow();
});
it('case drafts may be incomplete; finals require unique ranks or reasoned abstention',()=>{
  expect(caseSchema.safeParse({decision:'Dinilai',ranks:{},rationale:'',final:false}).success).toBe(true);
  expect(caseSchema.safeParse({decision:'Dinilai',ranks:{},rationale:'TEST',final:true,confirmed:true}).success).toBe(false);
  const final={decision:'Tidak dapat menilai',ranks:{},rationale:'SIMULASI di luar keahlian',final:true,confirmed:true};
  expect(caseSchema.safeParse(final).success).toBe(true);
  expect(caseSchema.safeParse({...final,rationale:''}).success).toBe(false);
  expect(caseSchema.safeParse({...final,ranks:{A1:1}}).success).toBe(false);
});
