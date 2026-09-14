import { after } from "next/server";
import { processRecommendationJobs } from "@/lib/digital-checkup/jobs";
import { z } from "zod";
import { requireActor, serviceClient } from "@/lib/supabase/server";
import { dbError, failure, json, readBody } from "@/lib/digital-checkup/http";
import { freezeModel, runAssessment, type AssessmentRow, type RunRow } from "@/lib/digital-checkup/service";
import { usabilitySchema } from "@/lib/digital-checkup/validation";
import { ALGORITHM, compareRankings, conditionScores, instrument as decisionInstrument } from "@/lib/decision-engine";
import { canonical, csvCell } from "@/lib/digital-checkup/canonical";
import { expertDirectory } from "@/lib/digital-checkup/expert-directory";
import { processExpertPanel } from "@/lib/digital-checkup/auto-panel";

export async function GET(request: Request) {
  try {
    await requireActor(["admin", "researcher"]);
    try { await processExpertPanel(); } catch { /* The dashboard still loads diagnostics when model activation is pending. */ }
    const db = serviceClient(), params = new URL(request.url).searchParams;
    const tables = ["dc_instrument_versions", "dc_decision_model_versions", "dc_expert_assignments", "dc_assessment_sessions", "dc_decision_model_inputs", "dc_decision_runs", "dc_expert_case_assignments", "dc_usability_tests", "dc_umkm_profiles"] as const;
    // Explicit pagination: exports must not silently stop at PostgREST's 1,000 rows.
    const rows = await Promise.all(tables.map(async (table) => {
      const result: Record<string, unknown>[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db.from(table).select("*").order("id").range(offset, offset + 499);
        dbError(error); result.push(...(data ?? [])); if (!data || data.length < 500) return result;
      }
    }));
    const [instruments, versions, experts, assessments, models, runs, cases, usability, businesses] = rows;
    const version = params.get("version"), runId = params.get("run");
    const selectedRuns = (runs as unknown as RunRow[]).filter((r) => (!runId || r.id === runId) && (!version || r.canonical_input.modelVersion === version));
    if (params.get("format") === "canonical") {
      if (!runId || selectedRuns.length !== 1) throw new Error("Pilih satu run yang tersedia.");
      return new Response(canonical(selectedRuns[0].canonical_input), { headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=canonical-input.json", "Cache-Control": "private, no-store" } });
    }
    const code = (id: unknown) => String(businesses.find((b) => b.id === id)?.code ?? "");
    const safeAssessments = assessments.filter((a) => (!runId && !version) || selectedRuns.some((r) => r.assessment_id === a.id)).map((a) => {
      const value = a as unknown as AssessmentRow;
      const p = value.payload.profile;
      return { id: a.id, code: code(a.umkm_id), instrumentId: a.instrument_id, status: a.status, revision: a.revision_number, submittedAt: a.submitted_at, answers: value.payload.answers, metadata: { sector: p.sector, district: p.district, businessAgeMonths: p.businessAgeMonths, peopleCount: p.peopleCount, respondentRole: p.respondentRole, salesChannels: p.salesChannels } };
    });
    const selectedModels = models.filter((m) => (!runId && !version) || selectedRuns.some((r) => r.model_input_id === m.id));
    const safeExperts = experts.filter((e) => (!runId && !version) || selectedModels.some((m) => (m.expert_ids as string[]).includes(String(e.id)))).map((e) => {
      const p = e.payload as Record<string, unknown>;
      // Free-text reviews may contain identifiers; use numeric reviews in anonymous exports.
      const reviews = Object.fromEntries(Object.entries((p.reviews ?? {}) as Record<string, { relevance: number; clarity: number }>).map(([q, v]) => [q, { relevance: v.relevance, clarity: v.clarity }]));
      return { id: e.id, code: e.code, instrumentId: e.instrument_id, status: e.status, revision: e.revision, submittedAt: e.stage1_submitted_at, pairs: p.pairs ?? [], relevance: p.relevance ?? {}, reviews, decision: p.decision, consistency: p.consistency };
    });
    const validations = cases.filter((c) => safeAssessments.some((a) => a.id === c.assessment_id)).map((c) => {
      const p = c.payload as { decision?: string; ranks?: Record<string, number>; rationale?: string };
      const run = selectedRuns.filter((r) => r.assessment_id === c.assessment_id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      return { id: c.id, assessmentId: c.assessment_id, expertCode: experts.find((e) => e.id === c.expert_assignment_id)?.code, umkmCode: safeAssessments.find((a) => a.id === c.assessment_id)?.code, status: c.status, decision: p.decision, ranks: p.ranks, rationale: p.rationale, runId: run?.id, metrics: c.status === "submitted" && p.decision === "Dinilai" && p.ranks && run?.status === "RANKED" ? compareRankings(run.trace, p.ranks) : null };
    });
    const valid = validations.filter((v) => v.metrics), abstains = validations.filter((v) => v.status === "submitted" && v.decision === "Tidak dapat menilai");
    const adminAssessments=safeAssessments.map((assessment,index)=>{
      const source=assessments.find((item)=>item.id===assessment.id) as unknown as AssessmentRow|undefined;
      return {...assessment,demoCode:`U${String(index+1).padStart(3,"0")}`,businessName:source?.payload.profile.businessName?.trim()||"Usaha tanpa nama"};
    });
    const usedExpertIds=new Set(selectedModels.flatMap((model)=>(model.expert_ids as string[])??[]));
    const adminExperts=safeExperts.map((expert)=>({...expert,displayName:expertDirectory.find((item)=>item.assignmentId===expert.id)?.name||"Ahli",usedInModel:usedExpertIds.has(String(expert.id))}));
    const format=params.get("format");
    if(format==="expert-assessments"){
      const report={
        schemaVersion:"DL-EXPERT-ASSESSMENTS-1.0",
        exportedAt:new Date().toISOString(),
        instrument:decisionInstrument.version,
        totalExperts:experts.length,
        experts:experts.map((expert)=>{
          const payload=expert.payload as {
            profile?:{name?:string;institution?:string;jobTitle?:string;experienceYears?:number|null;expertise?:string;assessmentDate?:string};
            reviews?:Record<string,{relevance:number|null;clarity:number|null;suggestion:string}>;
            decision?:string|null;generalNote?:string;pairs?:{left:string;right:string;preferred:string;intensity:number}[];
            relevance?:Record<string,Record<string,number|null>>;consistency?:{lambdaMax:number;CI:number;CR:number;consistent:boolean};
          };
          const directory=expertDirectory.find((item)=>item.assignmentId===expert.id);
          return {
            name:directory?.name||payload.profile?.name||expert.code,
            jobTitle:directory?.jobTitle||payload.profile?.jobTitle||"",
            institution:directory?.institution||payload.profile?.institution||"",
            status:expert.status,
            usedInModel:usedExpertIds.has(String(expert.id)),
            submittedAt:expert.stage1_submitted_at,
            profile:{experienceYears:payload.profile?.experienceYears??null,expertise:payload.profile?.expertise||"",assessmentDate:payload.profile?.assessmentDate||null},
            decision:payload.decision??null,
            generalNote:payload.generalNote||"",
            consistency:payload.consistency??null,
            completion:{questionReviews:Object.keys(payload.reviews??{}).length,totalQuestionReviews:32,pairwise:(payload.pairs??[]).length,totalPairwise:28,relevance:Object.values(payload.relevance??{}).flatMap(Object.values).filter((value)=>value!=null).length,totalRelevance:56},
            questionReviews:decisionInstrument.questions.map((question)=>({questionCode:question.code,question:question.text,dimension:question.dimension,relevance:payload.reviews?.[question.code]?.relevance??null,clarity:payload.reviews?.[question.code]?.clarity??null,suggestion:payload.reviews?.[question.code]?.suggestion||""})),
            pairwise:(payload.pairs??[]).map((pair)=>({left:pair.left,leftName:decisionInstrument.dimensions.find((item)=>item.code===pair.left)?.title,right:pair.right,rightName:decisionInstrument.dimensions.find((item)=>item.code===pair.right)?.title,preferred:pair.preferred,intensity:pair.intensity})),
            moduleRelevance:decisionInstrument.modules.map((module)=>({moduleCode:module.code,moduleName:module.name,scores:decisionInstrument.dimensions.map((dimension)=>({dimensionCode:dimension.code,dimensionName:dimension.title,score:payload.relevance?.[module.code]?.[dimension.code]??null}))})),
          };
        }),
      };
      return new Response(JSON.stringify(report,null,2),{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":"attachment; filename=hasil-penilaian-ahli.json","Cache-Control":"private, no-store"}});
    }
    if(format==="umkm-answers"){
      const report={
        schemaVersion:"DL-UMKM-ANSWERS-1.0",
        exportedAt:new Date().toISOString(),
        instrument:decisionInstrument.version,
        totalBusinesses:adminAssessments.length,
        businesses:adminAssessments.map((assessment)=>{
          const source=assessments.find((item)=>item.id===assessment.id) as unknown as AssessmentRow|undefined;
          const profile=source?.payload.profile;
          const complete=Object.keys(assessment.answers).length===32&&Object.values(assessment.answers).every((value)=>value!=null);
          return {
            code:assessment.demoCode,
            businessName:assessment.businessName,
            status:assessment.status,
            revision:assessment.revision,
            profile:{sector:profile?.sector||"",provinceCode:profile?.provinceCode||"",cityCode:profile?.cityCode||"",district:profile?.district||"",businessAgeMonths:profile?.businessAgeMonths??null,peopleCount:profile?.peopleCount??null,respondentRole:profile?.respondentRole||"",salesChannels:profile?.salesChannels??[],goal:profile?.goal||"",note:profile?.note||"",instagram:profile?.instagram||"",tiktok:profile?.tiktok||"",googleMaps:profile?.googleMaps||""},
            completion:{answered:Object.values(assessment.answers).filter((value)=>value!=null).length,total:32},
            answers:decisionInstrument.questions.map((question)=>{const score=assessment.answers[question.code]??null;return {questionCode:question.code,dimension:question.dimension,question:question.text,score,answer:question.options.find((option)=>option.score===score)?.label||"Belum dijawab"};}),
            dimensionScores:complete?conditionScores(assessment.answers):null,
          };
        }),
      };
      return new Response(JSON.stringify(report,null,2),{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":"attachment; filename=jawaban-digital-checkup-umkm.json","Cache-Control":"private, no-store"}});
    }
    const result = {
      ...(!params.get("format") ? { reviewIssues: experts.flatMap((e) => {
        const p = e.payload as { generalNote?: string; reviews?: Record<string, { relevance: number; clarity: number; suggestion: string }> };
        return Object.entries(p.reviews ?? {}).filter(([, r]) => r.relevance <= 2 || r.clarity <= 2 || r.suggestion).map(([question, r]) => ({ expertCode: e.code, question, suggestion: r.suggestion, generalNote: p.generalNote }));
      }) } : {}),
      instruments: instruments.map(({ id, code, status, content, frozen_at }) => ({ id, code, status, content, frozenAt: frozen_at })), versions, experts: params.get("format")?safeExperts:adminExperts, assessments: params.get("format")?safeAssessments:adminAssessments,
      models: selectedModels.map(({ id, model_version_id, input_hash, trace, created_at }) => ({ id, modelVersionId: model_version_id, inputHash: input_hash, trace, createdAt: created_at })), runs: selectedRuns, validations,
      usability: usability.filter((u) => safeAssessments.some((a) => a.id === u.assessment_id)).map((u) => ({ id: u.id, umkmCode: safeAssessments.find((a) => a.id === u.assessment_id)?.code, date: u.actual_date, tasks: u.task_statuses, minutes: u.total_minutes, ease: u.ease })),
      summary: { validPairs: valid.length, uniqueBusinesses: new Set(valid.map((v) => v.umkmCode)).size, uniqueExperts: new Set(valid.map((v) => experts.find((e) => e.code === v.expertCode)?.expert_user_id).filter(Boolean)).size, abstentions: abstains.length, sensitivityScenarios: selectedRuns.reduce((n, r) => n + r.sensitivity.length, 0) },
    };
    if (params.get("format")) {
      // Rationale remains available in the authorized dashboard, not in anonymous downloads.
      const anonymous = { ...result, validations: validations.map((v) => ({ id: v.id, assessmentId: v.assessmentId, expertCode: v.expertCode, umkmCode: v.umkmCode, status: v.status, decision: v.decision, ranks: v.ranks, runId: v.runId, metrics: v.metrics })) };
      if(params.get("format")==="colab"){
        const content=JSON.stringify({
          schemaVersion:"DL-COLAB-1.0",
          algorithm:ALGORITHM,
          dimensions:decisionInstrument.dimensions.map((item)=>item.code),
          modules:decisionInstrument.modules.map((item)=>item.code),
          modelInputs:result.models,
          experts:anonymous.experts,
          records:safeAssessments.map((assessment,index)=>{
            const assessmentRuns=selectedRuns.filter((item)=>item.assessment_id===assessment.id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
            const decision=assessmentRuns[0];
            return {
              assessmentId:assessment.id,
              umkmCode:`U${String(index+1).padStart(3,"0")}`,
              instrumentId:assessment.instrumentId,
              revision:assessment.revision,
              submittedAt:assessment.submittedAt,
              metadata:assessment.metadata,
              answers:assessment.answers,
              dimensionScores:conditionScores(assessment.answers),
              canonicalInput:decision?.canonical_input??null,
              run:decision?{
                id:decision.id,
                modelInputId:decision.model_input_id,
                status:decision.status,
                trace:decision.trace,
                inputHash:decision.input_hash,
                buildId:decision.build_id,
                createdAt:decision.created_at,
              }:null,
            };
          }),
        },null,2);
        return new Response(content,{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":"attachment; filename=digital-checkup-colab.json","Cache-Control":"private, no-store"}});
      }
      const csv = params.get("format") === "csv";
      const content = csv ? "dataset,data\r\n" + Object.entries(anonymous).flatMap(([name, values]) => (Array.isArray(values) ? values : [values]).map((v) => `${csvCell(name)},${csvCell(JSON.stringify(v))}`)).join("\r\n") : JSON.stringify(anonymous, null, 2);
      return new Response(content, { headers: { "Content-Type": csv ? "text/csv; charset=utf-8" : "application/json", "Content-Disposition": `attachment; filename=digital-checkup.${csv ? "csv" : "json"}`, "Cache-Control": "private, no-store" } });
    }
    return json(result);
  } catch (e) { return failure(e); }
}

export async function POST(request: Request) {
  try {
    const actor = await requireActor(["admin", "researcher"]), db = serviceClient();
    const input = z.discriminatedUnion("action", [
      z.object({ action: z.literal("freeze"), versionId: z.string().uuid(), expertIds: z.array(z.string().uuid()).length(3), confirmed: z.literal(true) }),
      z.object({ action: z.literal("compute"), assessmentId: z.string().uuid() }),
      z.object({ action: z.literal("cases"), assessmentId: z.string().uuid(), expertIds: z.array(z.string().uuid()).min(1).max(3) }),
      z.object({ action: z.literal("usability"), payload: usabilitySchema }),
      z.object({ action: z.literal("version"), sourceId: z.string().uuid(), code: z.string().regex(/^DC-MODEL-[A-Za-z0-9.-]{1,40}$/) }),
      z.object({ action: z.literal("deleteExpert"), id: z.string().uuid(), confirmed: z.literal(true) }),
    ]).parse(await readBody(request));
    if (input.action === "freeze") {
      const id = await freezeModel(input.versionId, input.expertIds, actor.id);
      after(async () => { try { await processRecommendationJobs(); } catch { /* Scheduled worker retries. */ } });
      return json({ id });
    }
    if (input.action === "compute") {
      const { data, error } = await db.from("dc_assessment_sessions").select("*").eq("id", input.assessmentId).eq("status", "submitted").single(); dbError(error);
      const run = await runAssessment(data as AssessmentRow); if (!run) throw new Error("Bekukan model dengan tiga ahli final lebih dulu."); return json({ id: run.id });
    }
    if (input.action === "cases") {
      const { data: assessment, error } = await db.from("dc_assessment_sessions").select("instrument_id").eq("id", input.assessmentId).eq("status", "submitted").single(); dbError(error);
      const { data: experts, error: ee } = await db.from("dc_expert_assignments").select("id").in("id", input.expertIds).eq("instrument_id", assessment!.instrument_id).eq("status", "submitted"); dbError(ee);
      if (experts?.length !== input.expertIds.length) throw new Error("Pilih ahli final dari instrumen yang sama.");
      const { error: ce } = await db.from("dc_expert_case_assignments").upsert(experts.map((e) => ({ expert_assignment_id: e.id, assessment_id: input.assessmentId })), { onConflict: "expert_assignment_id,assessment_id", ignoreDuplicates: true }); dbError(ce);
    }
    if (input.action === "usability") {
      const p = input.payload;
      const { error } = await db.from("dc_usability_tests").insert({ assessment_id: p.assessmentId, actual_date: p.date, task_statuses: p.tasks, total_minutes: p.minutes, ease: p.ease, note: p.note, recorded_by: actor.id }); dbError(error);
    }
    if (input.action === "version") {
      const { data, error } = await db.rpc("dc_clone_model", { p_source: input.sourceId, p_code: input.code, p_actor: actor.id }); dbError(error); return json({ id: data });
    }
    if(input.action==="deleteExpert"){
      const {data:used,error:ue}=await db.from("dc_decision_model_inputs").select("id").contains("expert_ids",[input.id]).limit(1);dbError(ue);
      if(used?.length)throw new Error("Penilaian ini sudah dipakai model dan harus tetap disimpan agar hasil dapat diuji ulang.");
      const {data:assignment,error:ae}=await db.from("dc_expert_assignments").select("id,status").eq("id",input.id).single();dbError(ae);
      if(assignment?.status==="submitted")throw new Error("Penilaian final bersifat tetap. Buat versi model baru jika panel perlu diganti.");
      const {error}=await db.from("dc_expert_assignments").delete().eq("id",input.id);dbError(error);
      return json({ok:true});
    }
    return json({ ok: true });
  } catch (e) { return failure(e); }
}
