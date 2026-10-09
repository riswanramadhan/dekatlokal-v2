import { ContentLoading } from "@/components/digital-checkup/content-loading";
import "@/app/checkup.css";
export default function Loading() { return <main className="ck-app" aria-busy="true"><div className="ck-body"><div className="ck-stage"><ContentLoading title="Menyiapkan Digital Checkup" description="Sebentar, ruang checkup kamu sedang dimuat." /></div></div></main>; }
