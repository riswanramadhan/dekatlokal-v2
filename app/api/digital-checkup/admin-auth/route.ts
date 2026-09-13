import { z } from "zod";
import { authClient, currentActor } from "@/lib/supabase/server";
import { clearExpertEntry } from "@/lib/digital-checkup/expert-access";
import { failure, json, readBody } from "@/lib/digital-checkup/http";
export async function POST(request:Request) {
  try {
    const input=z.object({email:z.string().trim().email().max(254),password:z.string().min(1).max(256)}).parse(await readBody(request));
    const client=await authClient();
    const {error}=await client.auth.signInWithPassword(input);
    if(error) return json({error:"Email atau kata sandi belum cocok."},401);
    try {
      const actor=await currentActor();
      if(!actor || !["admin","researcher"].includes(actor.role)) {await client.auth.signOut();return json({error:"Akun ini tidak memiliki akses admin."},403);}
    } catch {await client.auth.signOut();throw new Error("Akses admin belum dapat diverifikasi. Silakan coba lagi.");}
    await clearExpertEntry();
    return json({next:"/admin"});
  } catch(e) {return failure(e);}
}
