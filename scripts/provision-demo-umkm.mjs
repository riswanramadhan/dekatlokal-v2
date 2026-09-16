import { createHash, randomBytes } from "node:crypto";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
const email=process.env.DC_DEMO_USER_EMAIL?.trim().toLowerCase();
const displayName=process.env.DC_DEMO_USER_NAME?.trim()||"User Demo DekatLokal";
if(!url||!serviceKey)throw new Error("Konfigurasi Supabase server belum tersedia.");
if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("Isi DC_DEMO_USER_EMAIL dengan inbox demo yang benar-benar bisa menerima OTP.");

const db=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
const fail=(error,message)=>{if(error)throw new Error(message);};
const mask=(value)=>{const [name,domain]=value.split("@");return `${name.slice(0,2)}***@${domain}`;};

async function findUser(target){
  for(let page=1;page<=50;page++){
    const {data,error}=await db.auth.admin.listUsers({page,perPage:200});fail(error,"Daftar akun Supabase belum bisa dibaca.");
    const found=data.users.find((user)=>user.email?.toLowerCase()===target);if(found)return found;
    if(data.users.length<200)return null;
  }
  throw new Error("Akun belum ditemukan dalam batas pencarian aman.");
}

let user=await findUser(email);
if(!user){
  const {data,error}=await db.auth.admin.createUser({email,email_confirm:true,user_metadata:{name:displayName,full_name:displayName,account_type:"demo_umkm"}});fail(error,"Akun demo belum berhasil dibuat.");user=data.user;
}else{
  const {data,error}=await db.auth.admin.updateUserById(user.id,{email_confirm:true,user_metadata:{...user.user_metadata,name:displayName,full_name:displayName,account_type:"demo_umkm"}});fail(error,"Profil akun demo belum berhasil diperbarui.");user=data.user;
}
if(!user)throw new Error("Akun demo tidak tersedia.");
const {data:existingProfile,error:existingProfileError}=await db.from("dc_profiles").select("role").eq("user_id",user.id).maybeSingle();fail(existingProfileError,"Role akun demo belum bisa diperiksa.");
if(existingProfile&&existingProfile.role!=="umkm")throw new Error("Email tersebut sudah memiliki role staf. Gunakan inbox demo lain.");
const {error:profileError}=await db.from("dc_profiles").upsert({user_id:user.id,role:"umkm",display_name:displayName},{onConflict:"user_id"});fail(profileError,"Role akun demo belum berhasil disimpan.");

const {data:modelVersion,error:modelError}=await db.from("dc_decision_model_versions").select("id,instrument_id,code").not("frozen_at","is",null).order("created_at",{ascending:false}).limit(1).maybeSingle();fail(modelError,"Versi model belum bisa dibaca.");
if(!modelVersion)throw new Error("Model tiga ahli belum aktif. Aktifkan model sebelum membuat akun demo.");
const {data:modelInput,error:modelInputError}=await db.from("dc_decision_model_inputs").select("id").eq("model_version_id",modelVersion.id).maybeSingle();fail(modelInputError,"Input model belum bisa dibaca.");
if(!modelInput)throw new Error("Jejak Fuzzy AHP belum tersedia untuk model aktif.");
const {data:instrument,error:instrumentError}=await db.from("dc_instrument_versions").select("id,code,content").eq("id",modelVersion.instrument_id).single();fail(instrumentError,"Instrumen aktif belum bisa dibaca.");
const questions=instrument.content?.questions;
if(!Array.isArray(questions)||questions.length!==32)throw new Error("Instrumen aktif tidak memiliki tepat 32 pertanyaan.");

const profile={profileVersion:2,businessName:"Kedai Demo DekatLokal",email,whatsapp:"080000000000",instagram:"",tiktok:"",googleMaps:"",sector:"Makanan & minuman",district:"Kota Makassar",provinceCode:"73",cityCode:"73.71",businessAgeMonths:18,peopleCount:3,respondentRole:"Pemilik",salesChannels:["WhatsApp","Toko fisik"],goal:"Merapikan pemasaran digital dan pencatatan usaha dalam 30 hari.",note:"Data khusus demonstrasi dashboard; kontak ini bukan nomor layanan.",consent:true};
const scores=[3,2,1,2,1,2,2,4];
const answers=Object.fromEntries(questions.map((question)=>{const dimensionIndex=Number(String(question.dimension).slice(1))-1;return [question.code,scores[dimensionIndex]];}));

let {data:business,error:businessError}=await db.from("dc_umkm_profiles").select("id").eq("owner_id",user.id).contains("metadata",{demoAccount:true}).limit(1).maybeSingle();fail(businessError,"Profil usaha demo belum bisa dibaca.");
if(!business){
  const code=`DEMO-${randomBytes(6).toString("hex").toUpperCase()}`;
  const created=await db.from("dc_umkm_profiles").insert({owner_id:user.id,code,metadata:{demoAccount:true,businessName:profile.businessName}}).select("id").single();fail(created.error,"Profil usaha demo belum berhasil dibuat.");business=created.data;
}

let {data:assessment,error:assessmentError}=await db.from("dc_assessment_sessions").select("id,status,revision").eq("umkm_id",business.id).eq("instrument_id",instrument.id).order("revision_number",{ascending:false}).limit(1).maybeSingle();fail(assessmentError,"Checkup demo belum bisa dibaca.");
if(!assessment){
  const secret=randomBytes(32).toString("hex");
  const tokenHash=createHash("sha256").update(secret).digest("hex");
  const created=await db.from("dc_assessment_sessions").insert({umkm_id:business.id,instrument_id:instrument.id,token_hash:tokenHash,expires_at:new Date(Date.now()+30*86400_000).toISOString(),payload:{profile,answers:{}}}).select("id,status,revision").single();fail(created.error,"Sesi checkup demo belum berhasil dibuat.");assessment=created.data;
  const saved=await db.rpc("dc_save_assessment",{p_id:assessment.id,p_token_hash:tokenHash,p_payload:{profile,answers},p_revision:assessment.revision,p_final:true});fail(saved.error,"Jawaban checkup demo belum berhasil difinalkan.");assessment={...assessment,status:"submitted"};
}

const {data:run,error:runError}=await db.from("dc_decision_runs").select("id,status").eq("assessment_id",assessment.id).eq("model_input_id",modelInput.id).maybeSingle();fail(runError,"Status rekomendasi demo belum bisa dibaca.");
console.log(`Akun demo siap: ${mask(email)}`);
console.log("Cara masuk: buka https://digitalcheckup.dekatlokal.com/masuk lalu minta kode OTP ke inbox tersebut.");
console.log(`Checkup: ${assessment.status}. Rekomendasi: ${run?.status||"akan dihitung otomatis saat dashboard pertama dibuka"}.`);
console.log("Akses gratis 7 hari baru dimulai saat dashboard pertama kali dibuka.");
