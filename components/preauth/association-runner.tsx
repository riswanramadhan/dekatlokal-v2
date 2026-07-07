"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";

export function AssociationRunner({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form action={action} className="mt-5" ref={formRef}>
      <Button className="w-full" type="submit">
        Hubungkan sekarang
      </Button>
    </form>
  );
}
