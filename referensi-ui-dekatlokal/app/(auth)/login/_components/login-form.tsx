"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { signIn } from "../actions";
import { loginSchema, type LoginValues } from "../schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    setServerError(null);

    startTransition(async () => {
      const result = await signIn(values.email, values.password);

      if (!result.success) {
        setServerError(result.error);
        form.resetField("password");
        return;
      }

      router.push("/admin/dashboard");
    });
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">

      {/* Server error: respons gagal dari server, bukan field validation */}
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        {/* ── Email ── */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={isPending}
                aria-required="true"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* ── Password ── */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id={field.name}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isPending}
                  aria-required="true"
                  aria-invalid={fieldState.invalid}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isPending}
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye    className="h-4 w-4" aria-hidden="true" />
                  }
                </button>
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* ── Submit ── */}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Memproses…</>
            : "Masuk"
          }
        </Button>
      </form>
    </div>
  );
}
