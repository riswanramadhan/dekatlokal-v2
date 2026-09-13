"use client";
import { ScanLine } from "lucide-react";
import { useEffect, useRef } from "react";
export function ScanLoading() {
  const modal=useRef<HTMLDivElement>(null);
  useEffect(()=>{ const previous=document.activeElement as HTMLElement|null, overflow=document.body.style.overflow; document.body.style.overflow="hidden"; modal.current?.focus(); return()=>{document.body.style.overflow=overflow;if(previous?.isConnected) previous.focus({preventScroll:true});}; },[]);
  return <div ref={modal} tabIndex={-1} onKeyDown={e=>{if(e.key==="Tab"){e.preventDefault();modal.current?.focus();}}} className="dc-scan-overlay" role="dialog" aria-modal="true" aria-labelledby="scan-title"><div className="dc-scan-card" role="status" aria-live="polite"><div className="dc-scan-art"><ScanLine size={56} strokeWidth={1.2}/><span/></div><h2 id="scan-title">Menyiapkan hasil checkup</h2><p>Jawabanmu sedang disimpan dan dihitung. Tunggu sebentar, ya.</p><div className="dc-scan-track"><span/></div><small>Tetap di halaman ini sampai hasilnya muncul.</small></div></div>;
}
