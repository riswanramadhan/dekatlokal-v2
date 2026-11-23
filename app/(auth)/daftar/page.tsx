import { redirect } from "next/navigation";

// Pendaftaran kini terjadi lewat kode email atau Google di /masuk.
export default function DaftarPage() {
  redirect("/masuk");
}
