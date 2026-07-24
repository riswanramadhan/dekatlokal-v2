import type { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

// Metadata hanya bisa diekspor dari server component
export const metadata: Metadata = {
  title: "Masuk | Dekat Lokal Admin",
  // Cegah mesin pencari mengindeks halaman login
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Masuk ke Panel Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Gunakan akun yang telah diberikan oleh administrator.
          </p>
        </div>

        {/* Semua interaksi ada di dalam client component ini */}
        <LoginForm />

        {/* <p className="text-center text-xs text-muted-foreground">
          Akses dibatasi hanya untuk personel yang berwenang.
        </p> */}

      </div>
    </div>
  );
}
