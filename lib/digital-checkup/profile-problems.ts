import { profileSchema, type BusinessProfile } from "./validation";
export function profileProblems(profile:BusinessProfile) {
  const issues=new Map<string,string>();
  const required=[...(profile.profileVersion===2?["businessName","email","whatsapp"]:[]),"sector","provinceCode","cityCode","businessAgeMonths","peopleCount","salesChannels","goal"] as (keyof BusinessProfile)[];
  for(const key of required){const value=profile[key];if(value==null || value==="" || (typeof value==="string"&&!value.trim()) || (typeof value==="number"&&!Number.isFinite(value)) || (Array.isArray(value)&&!value.length))issues.set(key,"Wajib diisi. Lengkapi bagian ini untuk melanjutkan.");}
  const parsed=profileSchema.safeParse(profile);
  if(!parsed.success) for(const issue of parsed.error.issues){const key=String(issue.path[0]);if(!issues.has(key))issues.set(key,issue.message);}
  return Array.from(issues,([key,message])=>({key,message}));
}
