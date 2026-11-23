import { redirect } from "next/navigation";

// Verifikasi kode kini terjadi di /masuk.
export default function VerifikasiPage() {
  redirect("/masuk");
}
