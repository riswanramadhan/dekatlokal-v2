import { expect, it } from "vitest";
import { resultInsight } from "@/lib/digital-checkup/result-insight";
import type { BusinessProfile } from "@/lib/digital-checkup/validation";

const profile:BusinessProfile={profileVersion:2,businessName:"Usaha Uji",email:"uji@example.org",whatsapp:"08123456789",instagram:"",tiktok:"",googleMaps:"",sector:"Makanan & minuman",district:"Kota Makassar, Sulawesi Selatan",provinceCode:"73",cityCode:"73.71",businessAgeMonths:12,peopleCount:2,respondentRole:"Pemilik",salesChannels:["WhatsApp"],goal:"Merapikan promosi",note:"",consent:true};

it("turns dimension scores into deterministic, human-readable strengths and priorities",()=>{
  const insight=resultInsight([75,50,25,50,25,50,50,100],profile);
  expect(insight.strongest).toMatchObject({code:"C8",title:"Siap ikut pendampingan",score:100});
  expect(insight.focus).toMatchObject({title:"Produk atau layanan",score:25});
  expect(insight.overview.toLowerCase()).toContain("modal terbaikmu");
});

it("only marks a business ready for website verification when location and base profile readiness both pass",()=>{
  expect(resultInsight([75,0,0,0,0,0,0,0],profile).website.state).toBe("ready");
  expect(resultInsight([25,0,0,0,0,0,0,0],profile).website.state).toBe("prepare");
  expect(resultInsight([75,0,0,0,0,0,0,0],{...profile,cityCode:"74.71",provinceCode:"74"}).website.state).toBe("learning");
});
