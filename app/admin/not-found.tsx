import Link from "next/link";

export default function AdminNotFound() {
  return <div className="adm-section adm-notfound">
    <p className="eyebrow">Tidak ditemukan</p>
    <h1>Halaman atau checkup ini tidak ada</h1>
    <p>Tautannya mungkin salah ketik, atau datanya belum masuk.</p>
    <Link className="btn btn-primary btn-sm" href="/admin/checkup">Kembali ke data checkup</Link>
  </div>;
}
