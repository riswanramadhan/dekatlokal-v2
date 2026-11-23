import { redirect } from "next/navigation";

// Penautan hasil checkup kini otomatis saat masuk akun.
export default function HubungkanCheckupPage() {
  redirect("/masuk");
}
