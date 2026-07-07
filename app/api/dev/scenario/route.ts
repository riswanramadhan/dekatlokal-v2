import { NextResponse } from "next/server";
import { scenarioKeySchema } from "@/domain/schemas";
import { SCENARIO_COOKIE } from "@/domain/services/app-service";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  if (env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as unknown;
  const parsed = scenarioKeySchema.safeParse(
    typeof body === "object" && body !== null && "scenario" in body
      ? body.scenario
      : undefined,
  );

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Skenario demo tidak dikenali." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ scenario: parsed.data });
  response.cookies.set(SCENARIO_COOKIE, parsed.data, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
