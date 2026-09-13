import { expect, it } from "vitest";
import { regions, validRegion, websiteProgramPotential } from "@/lib/digital-checkup/regions";
import { profileSchema } from "@/lib/digital-checkup/validation";
it("contains a complete, deduplicated snapshot of 38 provinces and 514 cities/regencies",()=>{
  expect(regions).toHaveLength(38);
  const cities=regions.flatMap(p=>p.cities);expect(cities).toHaveLength(514);
  expect(new Set(cities.map(c=>c.code)).size).toBe(514);
  for(const p of regions)for(const c of p.cities)expect(c.code.startsWith(p.code+".")).toBe(true);
});
it("only marks the requested South Sulawesi locations as potentially eligible",()=>{
  const eligible=regions.flatMap(p=>p.cities.filter(c=>websiteProgramPotential(p.code,c.code)));
  expect(eligible).toHaveLength(14);
  expect(websiteProgramPotential("73","73.73")).toBe(true);
  expect(websiteProgramPotential("73","73.72")).toBe(false);
  expect(websiteProgramPotential("32","73.71")).toBe(false);
  expect(websiteProgramPotential("73","")).toBe(false);
});
it("rejects mismatched province/city pairs but preserves old location snapshots",()=>{
  const profile={consent:true,sector:"Usaha",district:"Lokasi lama",businessAgeMonths:0,peopleCount:1,respondentRole:"Pemilik",salesChannels:["Toko"],goal:"Belajar",note:""};
  expect(profileSchema.safeParse(profile).success).toBe(true);
  expect(profileSchema.safeParse({...profile,provinceCode:"73",cityCode:"32.01"}).success).toBe(false);
  expect(validRegion("73","73.71")).toBe(true);
});
