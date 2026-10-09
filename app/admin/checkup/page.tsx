import type { Metadata } from "next";
import { listCheckups } from "@/lib/digital-checkup/admin-data";
import { CheckupTable } from "@/components/admin/checkup-table";
import { attempt, LoadError, PageHead } from "@/components/admin/load-error";

export const metadata: Metadata = { title: "Data checkup" };
export const dynamic = "force-dynamic";

export default async function CheckupListPage() {
  const { data, error } = await attempt(listCheckups);
  if (!data) return <LoadError message={error ?? ""} />;
  const coded = new Set(data.filter((item) => item.code).map((item) => item.umkmId)).size;
  return <>
    <PageHead eyebrow="Data checkup" title="Semua checkup yang masuk" lead={`${coded} UMKM bernomor, ${data.filter((i) => i.status === "submitted").length} checkup final, ${data.filter((i) => i.status === "draft").length} draf. Nomor U001 dan seterusnya diberikan sekali per usaha berdasarkan urutan kiriman pertama.`} />
    <section className="adm-section"><CheckupTable items={data} /></section>
  </>;
}
