import { z } from "zod";
import { clearExpertEntry, enterExpert, publicExpertRoster } from "@/lib/digital-checkup/expert-access";
import { failure, json, readBody } from "@/lib/digital-checkup/http";
export async function GET() {
  return json({ experts:publicExpertRoster() });
}
export async function POST(request:Request) {
  try {
    const body=z.discriminatedUnion("action",[z.object({ action:z.literal("enter"),slot:z.number().int().min(0).max(2),code:z.string().max(64).optional() }),z.object({ action:z.literal("leave") })]).parse(await readBody(request));
    if(body.action==="leave") await clearExpertEntry(); else await enterExpert(body.slot,body.code);
    return json({ next:"/ahli" });
  } catch(e) { return failure(e); }
}
