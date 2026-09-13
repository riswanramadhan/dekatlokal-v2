"use client";
import { useRef, useState } from "react";
import { instrument } from "@/lib/decision-engine";
import { expertReadiness } from "@/lib/digital-checkup/expert-readiness";
import type { ExpertDraft } from "@/lib/digital-checkup/validation";
export function ExpertSubmitReview({draft,confirmed,busy,onConfirm,onReview,onSubmit}:{draft:ExpertDraft;confirmed:boolean;busy:boolean;onConfirm:(value:boolean)=>void;onReview:(tab:number,anchor?:string)=>void;onSubmit:()=>Promise<void>}) {
  const {issues,cr,cycles,ready}=expertReadiness(draft);
  const [message,setMessage]=useState("");
  const alert=useRef<HTMLDivElement>(null), confirmation=useRef<HTMLInputElement>(null);
  const title=(code:string)=>instrument.dimensions.find(d=>d.code===code)?.internalTitle ?? code;
  return <><h2>Tinjau dan kirim penilaian</h2><p>Telaah: {Object.values(draft.reviews).filter(r=>r.clarity!=null&&r.relevance!=null).length}/32 · Pasangan: {draft.pairs.length}/28 · Relevansi: {Object.values(draft.relevance).flatMap(Object.values).filter(v=>v!=null).length}/56.</p>
    <div className="dc-note"><strong>{ready?"Penilaian siap dikirim":"Ada bagian yang perlu ditinjau"}</strong><p>Isian lengkap belum tentu konsisten. Penilaian final harus memenuhi CR ≤ 0,10 agar dapat digunakan dalam model.</p>{cr&&<p>CR saat ini: <strong>{cr.CR.toFixed(5)}</strong> · {cr.consistent?"Konsisten":"Perlu ditinjau"}</p>}
    {issues.length>0&&<ul className="dc-submit-issues">{issues.map((issue,i)=><li key={i}><p>{issue.message}</p><button className="dc-secondary" type="button" disabled={busy} onClick={()=>onReview(issue.tab,issue.anchor)}>Tinjau bagian ini</button></li>)}</ul>}</div>
    {cr&&!cr.consistent&&<section className="dc-pair-guidance"><h3>Mulai tinjauan dari pasangan ini</h3><p>Daftar ini menunjukkan penyimpangan relatif terbesar, bukan jawaban pengganti. Periksa kembali arah kepentingan dan intensitas berdasarkan pertimbangan Anda. Contoh: jika A lebih penting dari B dan B lebih penting dari C, hubungan A dengan C perlu sejalan.</p>{cr.reviewPairs.map(p=><button className="dc-secondary" key={p.left+p.right} onClick={()=>onReview(3,`pair-${p.left}-${p.right}`)}>{p.left}–{p.right}<span>{title(p.left)} / {title(p.right)}</span></button>)}</section>}
    {cr&&!cr.consistent&&cycles.length>0&&<div className="dc-note"><strong>Arah prioritas yang saling berputar</strong><p>Tanda &gt; berarti “lebih penting dari”. Pola berikut berasal dari isian Anda dan perlu ditinjau, bukan disalin sebagai jawaban baru.</p>{cycles.map(c=><p key={c.join()}>{c.join(" > ")}</p>)}</div>}
    <label className="dc-check"><input ref={confirmation} type="checkbox" checked={confirmed} onChange={e=>{onConfirm(e.target.checked);setMessage("");}}/>Penilaian sudah saya tinjau dan siap dikunci.</label>
    {message&&<div ref={alert} tabIndex={-1} className="dc-error" role="alert">{message}</div>}
    <button type="button" className="dc-primary" disabled={busy} onClick={async()=>{if(!ready){setMessage("Penilaian belum dapat dikirim final. Gunakan tombol tinjauan di atas; jawaban Anda tetap tersimpan sebagai draf.");requestAnimationFrame(()=>alert.current?.focus());return;}if(!confirmed){setMessage("Centang konfirmasi penilaian sebelum mengirim.");confirmation.current?.focus();return;}setMessage("");try{await onSubmit();}catch(e){setMessage(e instanceof Error?e.message:"Pengiriman belum berhasil. Draf tetap tersedia; coba kirim lagi.");requestAnimationFrame(()=>alert.current?.focus());}}}>{busy?"Mengirim penilaian…":"Kirim penilaian final"}</button>
  </>;
}
