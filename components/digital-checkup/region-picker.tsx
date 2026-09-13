"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Globe, MapPin, Search } from "lucide-react";
import { regions, websiteProgramPotential } from "@/lib/digital-checkup/regions";
type Option = { code: string; name: string };
function SearchSelect({ label, value, options, disabled = false, onChange }: { label: string; value: string; options: readonly Option[]; disabled?: boolean; onChange: (value: string) => void }) {
  const id = useId(), [open, setOpen] = useState(false), [query, setQuery] = useState(""), [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const selected = options.find(o => o.code === value);
  const normalize = (s: string) => s.toLocaleLowerCase("id").replace("sidrap", "sidenreng rappang").replace("palopi", "palopo");
  const filtered = options.filter(o => normalize(o.name).includes(normalize(query)));
  const activeCode = filtered[active]?.code;
  useEffect(() => { if(open && activeCode) document.getElementById(id+"-"+activeCode)?.scrollIntoView?.({block:"nearest"}); }, [activeCode,open,id]);
  const choose = (code: string) => { input.current?.focus(); onChange(code); setQuery(""); setOpen(false); };
  return <div className="dc-search-select" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) { setOpen(false); setQuery(""); } }}>
    <label htmlFor={id}>{label}</label><div className="dc-search-control"><Search size={17} aria-hidden="true" /><input ref={input} id={id} role="combobox" aria-expanded={open} aria-controls={id+"-list"} aria-autocomplete="list" aria-activedescendant={open && filtered[active] ? id+"-"+filtered[active].code : undefined} autoComplete="off" disabled={disabled} placeholder={disabled ? "Pilih provinsi dulu" : "Ketik untuk mencari…"} value={open ? query : selected?.name ?? ""} onFocus={() => { setOpen(true); setQuery(""); setActive(0); }} onChange={e => { setOpen(true); setQuery(e.target.value); setActive(0); }} onKeyDown={e => { if (e.key === "Escape") { setOpen(false); setQuery(""); } else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive(n => Math.max(0, Math.min(filtered.length-1, n + (e.key === "ArrowDown" ? 1 : -1)))); } else if (e.key === "Enter" && open && filtered[active]) { e.preventDefault(); choose(filtered[active].code); } }} /><ChevronDown size={16} aria-hidden="true" /></div>
    {open && !disabled && <ul id={id+"-list"} role="listbox" aria-label={label} className="dc-search-list">{filtered.length ? filtered.map((o, i) => <li id={id+"-"+o.code} role="option" aria-selected={o.code === value} key={o.code} className={i === active ? "is-active" : ""} onMouseDown={e => e.preventDefault()} onClick={() => choose(o.code)} onMouseMove={() => setActive(i)}><span>{o.name}</span>{o.code === value && <Check size={16} />}</li>) : <li role="presentation">Belum ketemu. Coba nama lain, ya.</li>}</ul>}
  </div>;
}
export function RegionPicker({ provinceCode, cityCode, onChange }: { provinceCode: string; cityCode: string; onChange: (provinceCode: string, cityCode: string, location: string) => void }) {
  const province = regions.find(p => p.code === provinceCode);
  const potential = websiteProgramPotential(provinceCode, cityCode);
  return <section className="dc-region-fields" aria-label="Lokasi usaha"><SearchSelect label="Provinsi" value={provinceCode} options={regions} onChange={code => onChange(code, "", "")} /><SearchSelect label="Kota / kabupaten" value={cityCode} options={province?.cities ?? []} disabled={!province} onChange={code => { const city = province?.cities.find(c => c.code === code); onChange(provinceCode, code, city ? city.name+", "+province!.name : ""); }} /><div className={potential ? "dc-region-note is-potential" : "dc-region-note"} role="status">{potential ? <><MapPin size={20} aria-hidden="true" /><div><strong>Berpotensi dapat program website gratis</strong><p>Lokasi usahamu termasuk daerah yang berpotensi ikut. Penerimaan tetap mengikuti syarat dan ketersediaan program.</p></div></> : <><Globe size={20} aria-hidden="true" /><p>Di mana pun usahamu, Digital Checkup dan kelas gratis tetap bisa kamu ikuti.</p></>}</div><a href="https://www.dekatlokal.com/digital-checkup" target="_blank" rel="noopener noreferrer" className="dc-program-link">Lihat daerah & ketentuan program website gratis ↗</a></section>;
}
