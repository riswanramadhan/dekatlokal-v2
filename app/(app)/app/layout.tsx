import { redirect } from "next/navigation";

export default function SignedInAppLayout() {
  // Legacy prototype routes never expose simulated account data in the live journey.
  redirect("/dashboard");
}
