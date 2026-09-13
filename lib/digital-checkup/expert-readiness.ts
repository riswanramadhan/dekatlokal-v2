import { consistency, crispMatrix, instrument, relevanceMatrix } from "@/lib/decision-engine";
import { validateExpertFinal, type ExpertDraft } from "./validation";
export type ExpertIssue = { message: string; tab: number; anchor?: string };
export function expertReadiness(draft: ExpertDraft) {
  const issues: ExpertIssue[] = [];
  const p=draft.profile;
  if(!p.name || !p.institution || !p.jobTitle || !p.expertise || p.experienceYears===null || !p.consent) issues.push({tab:0,message:"Lengkapi profil, pengalaman, bidang keahlian, dan persetujuan."});
  if(draft.decision!=="layak_uji_coba") issues.push({tab:2,message:"Keputusan instrumen belum layak uji coba. Tinjau telaah dan keputusan instrumen."});
  for(const q of instrument.questions) {
    const r=draft.reviews[q.code];
    if(!r || r.relevance==null || r.clarity==null) { issues.push({tab:2,anchor:`expert-${q.code}`,message:`Lengkapi nilai relevansi dan kejelasan ${q.code}.`}); break; }
    if((r.relevance<=2 || r.clarity<=2) && !r.suggestion.trim()) {issues.push({tab:2,anchor:`expert-${q.code}`,message:`Tambahkan usulan perbaikan ${q.code} untuk nilai 1 atau 2.`});break;}
  }
  let cr:ReturnType<typeof consistency>|null=null;
  const cycles:string[][]=[];
  try {
    const matrix=crispMatrix(draft.pairs);
    cr=consistency(matrix);
    const codes=instrument.dimensions.map(d=>d.code);
    for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)for(let k=j+1;k<8;k++) {
      if(matrix[i][j]>1&&matrix[j][k]>1&&matrix[k][i]>1) cycles.push([codes[i],codes[j],codes[k],codes[i]]);
      else if(matrix[i][j]<1&&matrix[j][k]<1&&matrix[k][i]<1) cycles.push([codes[i],codes[k],codes[j],codes[i]]);
    }
    if(!cr.consistent) issues.push({tab:3,anchor:cr.reviewPairs[0]?`pair-${cr.reviewPairs[0].left}-${cr.reviewPairs[0].right}`:undefined,message:`CR ${cr.CR.toFixed(5)} melebihi batas 0,10. Tinjau hubungan antar pasangan sebelum mengirim final.`});
  } catch {issues.push({tab:3,message:"Lengkapi 28 pasangan. Pilihan setara menggunakan 1; pilihan lebih penting menggunakan 2–9."});}
  try {relevanceMatrix(draft.relevance as Record<string,Record<string,number>>);} catch {issues.push({tab:4,message:"Lengkapi 56 nilai relevansi modul. Nilai 0 tetap merupakan jawaban yang sah."});}
  if(!issues.length) try {validateExpertFinal(draft);} catch(e) {issues.push({tab:0,message:e instanceof Error?e.message:"Periksa kembali kelengkapan penilaian."});}
  return {issues,cr,cycles:cycles.slice(0,3),ready:issues.length===0};
}
