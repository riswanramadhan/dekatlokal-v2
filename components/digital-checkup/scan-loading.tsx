"use client";
import { ScanLine } from "lucide-react";
import { useEffect, useRef } from "react";
export function ScanLoading() {
  const modal=useRef<HTMLDivElement>(null);
  useEffect(()=>{ const previous=document.activeElement as HTMLElement|null, overflow=document.body.style.overflow; document.body.style.overflow="hidden"; modal.current?.focus(); return()=>{document.body.style.overflow=overflow;if(previous?.isConnected) previous.focus({preventScroll:true});}; },[]);
  return <div ref={modal} tabIndex={-1} onKeyDown={e=>{if(e.key==="Tab"){e.preventDefault();modal.current?.focus();}}} className="ck-overlay" role="dialog" aria-modal="true" aria-labelledby="scan-title"><div className="ck-overlay-card" role="status" aria-live="polite"><div className="ck-overlay-art"><ScanLine size={44} strokeWidth={1.4}/><span/></div><h2 id="scan-title">Menyiapkan hasil checkup</h2><p>Jawabanmu sedang disimpan dan dihitung. Tunggu sebentar, ya.</p><div className="ck-overlay-track"><span/></div><small>Tetap di halaman ini sampai hasilnya muncul.</small></div></div>;
}
