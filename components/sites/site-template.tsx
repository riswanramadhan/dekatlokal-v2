// Memilih komponen template berdasarkan kode. Tanpa hook: dipakai server (situs publik, galeri) dan client (builder).
import type { SiteContent } from "@/lib/sites/schema";
import type { TemplateCode } from "@/lib/sites/templates";
import type { TemplateMode } from "./parts";
import { EtalaseTemplate } from "./templates/etalase";
import { KelasTemplate } from "./templates/kelas";
import { KriyaTemplate } from "./templates/kriya";
import { PasarTemplate } from "./templates/pasar";
import { SenjaTemplate } from "./templates/senja";
import { StudioTemplate } from "./templates/studio";
import { TeduhTemplate } from "./templates/teduh";
import { WarungTemplate } from "./templates/warung";

const COMPONENTS = { warung: WarungTemplate, etalase: EtalaseTemplate, studio: StudioTemplate, pasar: PasarTemplate, kriya: KriyaTemplate, kelas: KelasTemplate, senja: SenjaTemplate, teduh: TeduhTemplate } satisfies Record<TemplateCode, unknown>;

export function SiteTemplate({ template, content, mode }: { template: TemplateCode; content: SiteContent; mode: TemplateMode }) {
  const Component = COMPONENTS[template] ?? WarungTemplate;
  return <Component content={content} mode={mode} />;
}
