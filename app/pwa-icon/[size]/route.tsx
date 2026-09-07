import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: requestedSize } = await params;
  if (requestedSize !== "192" && requestedSize !== "512") return new Response("Not found", { status: 404 });
  const size = Number(requestedSize);
  const logo = await readFile(join(process.cwd(), "public/brand/dekat-lokal-icon.png"));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Render the existing brand asset inside the maskable safe zone. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src={`data:image/png;base64,${logo.toString("base64")}`} width={size * 0.6} height={size * 0.6} />
    </div>,
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
