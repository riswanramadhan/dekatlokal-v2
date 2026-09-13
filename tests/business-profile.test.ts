import { expect, it } from "vitest";
import { profileSchema } from "@/lib/digital-checkup/validation";
import { blindCase } from "@/lib/digital-checkup/service";
import { vi } from "vitest";
import { instrument } from "@/lib/decision-engine";
vi.mock("server-only",()=>({}));
const profile={profileVersion:2 as const,businessName:"SIMULASI",email:"simulation@example.org",whatsapp:"081234567890",consent:true,sector:"Makanan & minuman",district:"Kota Makassar, Sulawesi Selatan",provinceCode:"73",cityCode:"73.71",businessAgeMonths:1,peopleCount:1,respondentRole:"Pemilik",salesChannels:["WhatsApp"],goal:"Mencatat transaksi",instagram:"",tiktok:"",googleMaps:""};
it("requires contact details for new profiles but keeps historical profiles readable",()=>{
  expect(profileSchema.safeParse(profile).success).toBe(true);
  expect(profileSchema.safeParse({...profile,email:"",whatsapp:"",businessName:""}).success).toBe(false);
  expect(profileSchema.safeParse({...profile,profileVersion:undefined,email:undefined,whatsapp:undefined,businessName:undefined}).success).toBe(true);
});
it("validates optional social profiles and Google Maps links",()=>{
  expect(profileSchema.safeParse({...profile,instagram:"@usaha.kita",tiktok:"usaha_kita",googleMaps:"https://maps.app.goo.gl/example"}).success).toBe(true);
  expect(profileSchema.safeParse({...profile,googleMaps:"javascript:alert(1)"}).success).toBe(false);
  expect(profileSchema.safeParse({...profile,instagram:"https://instagram.com/usaha"}).success).toBe(false);
});
it("never exposes business contacts to case reviewers",()=>{
  const data=blindCase({id:"case",status:"draft",payload:{}}, {payload:{profile,answers:Object.fromEntries(instrument.questions.map(q=>[q.code,0])) }} as never, "UMKM-TEST");
  expect(JSON.stringify(data)).not.toMatch(/simulation@example.org|081234567890|SIMULASI/);
});
