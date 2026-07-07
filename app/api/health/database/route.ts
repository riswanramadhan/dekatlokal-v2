import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/db/health";

export async function GET() {
  const health = await getDatabaseHealth();

  return NextResponse.json(health, {
    status: health.status === "error" ? 503 : 200,
  });
}
