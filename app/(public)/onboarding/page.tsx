import { redirect } from "next/navigation";

// Alur lama. Pengguna langsung diarahkan ke Digital Checkup.
export default function OnboardingPage() {
  redirect("/mulai");
}
