// Mengubah jawaban AI (Markdown ringan) menjadi blok terstruktur yang aman dirender.
// Diporting dari DekatAI: tebal/miring/daftar/tautan tampil benar dan TIDAK ADA tanda bintang (*) yang bocor,
// termasuk saat teks masih setengah jalan ketika streaming. Tanpa regex lookbehind (aman di Safari iOS lama).

export type Inline =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; href: string; label: string; strong?: boolean };

export type Block = { type: "paragraph"; lines: Inline[][] } | { type: "list"; ordered: boolean; items: Inline[][] };

const TOKEN = /\*\*\*([^*\n]+?)\*\*\*|\*\*([^\n]+?)\*\*|__([^_\n]+?)__|`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s<>()[\]]+)/g;
const TRAILING_PUNCTUATION = /[.,!?;:'")\]]+$/;

const stripStars = (value: string) => value.replace(/\*+/g, "");

/** Label ramah untuk tautan agar tidak memanjang di gelembung chat. */
export function linkLabel(href: string): string {
  try {
    const url = new URL(href);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "wa.me" || host.endsWith("whatsapp.com")) return "Chat WhatsApp";
    if (/(^|\.)google\.|goo\.gl$/.test(host) && /maps|goo\.gl/.test(href)) return "Buka Google Maps";
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return `${host}${path}`;
  } catch {
    return href;
  }
}

/** Teks polos: pasangan *miring* jadi em, bintang yatim dibuang. */
function plainSegments(value: string): Inline[] {
  if (!value) return [];
  const out: Inline[] = [];
  value.split(/\*([^*\n]+?)\*/).forEach((part, index) => {
    if (!part) return;
    if (index % 2 === 1) { const em = stripStars(part).trim(); if (em) out.push({ type: "em", value: em }); }
    else { const text = stripStars(part); if (text) out.push({ type: "text", value: text }); }
  });
  return out;
}

function pushLink(out: Inline[], raw: string, strong = false) {
  const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? "";
  const href = trailing ? raw.slice(0, -trailing.length) : raw;
  out.push({ type: "link", href, label: linkLabel(href), strong });
  if (trailing) out.push({ type: "text", value: trailing });
}

export function parseInline(line: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  TOKEN.lastIndex = 0;
  for (let match = TOKEN.exec(line); match; match = TOKEN.exec(line)) {
    out.push(...plainSegments(line.slice(last, match.index)));
    const [, triple, double, underscore, code, mdLabel, mdHref, url] = match;
    const strongValue = triple ?? double ?? underscore;
    if (strongValue !== undefined) {
      const value = stripStars(strongValue).trim();
      if (/^https?:\/\/\S+$/.test(value)) pushLink(out, value, true);
      else if (value) out.push({ type: "strong", value });
    } else if (code !== undefined) out.push({ type: "code", value: code });
    else if (mdLabel !== undefined && mdHref !== undefined) out.push({ type: "link", href: mdHref, label: stripStars(mdLabel).trim() || linkLabel(mdHref) });
    else if (url !== undefined) pushLink(out, url);
    last = match.index + match[0].length;
  }
  out.push(...plainSegments(line.slice(last)));
  const merged: Inline[] = [];
  for (const item of out) {
    const previous = merged[merged.length - 1];
    if (item.type === "text" && previous?.type === "text") previous.value += item.value;
    else merged.push({ ...item });
  }
  return merged.filter((item) => item.type !== "text" || item.value.length > 0);
}

const BULLET = /^\s*[-*•+]\s+(.*)$/;
const ORDERED = /^\s*\d{1,2}[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s*(.*)$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const QUOTE = /^\s*>\s?(.*)$/;

export function parseReply(text: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: Inline[][] = [];
  let list: { ordered: boolean; items: Inline[][] } | null = null;
  const flushParagraph = () => { if (paragraph.length) blocks.push({ type: "paragraph", lines: paragraph }); paragraph = []; };
  const flushList = () => { if (list?.items.length) blocks.push({ type: "list", ordered: list.ordered, items: list.items }); list = null; };
  for (const rawLine of text.replace(/\r/g, "").split("\n")) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim()) { flushParagraph(); continue; }
    if (RULE.test(line)) { flushParagraph(); flushList(); continue; }
    const bullet = BULLET.exec(line);
    const ordered = bullet ? null : ORDERED.exec(line);
    if (bullet || ordered) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) { flushList(); list = { ordered: isOrdered, items: [] }; }
      const inline = parseInline((bullet ?? ordered)![1]);
      if (inline.length) list.items.push(inline);
      continue;
    }
    flushList();
    const heading = HEADING.exec(line);
    if (heading) { const value = stripStars(heading[1]).trim(); if (value) paragraph.push([{ type: "strong", value }]); continue; }
    const quote = QUOTE.exec(line);
    const inline = parseInline(quote ? quote[1] : line);
    if (inline.length) paragraph.push(inline);
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Teks polos tanpa markup (untuk pratinjau satu baris di kotak masuk). */
export function replyToPlainText(text: string): string {
  return parseReply(text)
    .map((block) => block.type === "paragraph"
      ? block.lines.map((line) => line.map((item) => ("label" in item ? item.label : item.value)).join("")).join(" ")
      : block.items.map((item) => `• ${item.map((part) => ("label" in part ? part.label : part.value)).join("")}`).join(" "))
    .join(" ").replace(/\s+/g, " ").trim();
}
