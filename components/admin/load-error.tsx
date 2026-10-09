import type { ReactNode } from "react";
// Pesan saat data pengelola gagal dimuat (sesi habis, penyimpanan belum terhubung, dsb.).
export function LoadError({ message }: { message: string }) {
  return <div className="adm-section"><p className="note note-danger" role="alert">{message || "Data belum bisa dimuat. Muat ulang halaman, lalu coba lagi."}</p></div>;
}

export async function attempt<T>(loader: () => Promise<T>): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try { return { data: await loader(), error: null }; }
  catch (error) { return { data: null, error: error instanceof Error ? error.message : "Data belum bisa dimuat." }; }
}

export function PageHead({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: ReactNode }) {
  return <header className="adm-head"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{lead && <p>{lead}</p>}</div>{children && <div className="adm-head-actions">{children}</div>}</header>;
}

export function Empty({ hint }: { hint?: string }) {
  return <div className="adm-empty"><strong>Belum ada data masuk</strong>{hint && <span>{hint}</span>}</div>;
}
