import { Fragment } from "react";
import { parseReply, type Inline } from "@/lib/sites/format";

/**
 * Menampilkan jawaban AI Admin: **tebal**, *miring*, daftar, dan tautan dirender benar tanpa bintang bocor.
 * Diporting dari DekatAIRichText. Komponen murni (tanpa hook), bisa di client maupun server.
 */
function InlineContent({ items }: { items: Inline[] }) {
  return <>{items.map((item, index) => {
    switch (item.type) {
      case "strong": return <strong key={index}>{item.value}</strong>;
      case "em": return <em key={index}>{item.value}</em>;
      case "code": return <code key={index}>{item.value}</code>;
      case "link": return <a key={index} href={item.href} target="_blank" rel="noopener noreferrer nofollow">{item.label}</a>;
      default: return <Fragment key={index}>{item.value}</Fragment>;
    }
  })}</>;
}

export function ChatRichText({ text, className }: { text: string; className?: string }) {
  return <div className={className}>{parseReply(text).map((block, index) => block.type === "paragraph"
    ? <p key={index}>{block.lines.map((line, lineIndex) => <Fragment key={lineIndex}>{lineIndex > 0 ? <br /> : null}<InlineContent items={line} /></Fragment>)}</p>
    : block.ordered
      ? <ol key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}><InlineContent items={item} /></li>)}</ol>
      : <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}><InlineContent items={item} /></li>)}</ul>)}</div>;
}
