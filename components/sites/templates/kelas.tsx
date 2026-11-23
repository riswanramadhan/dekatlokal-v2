import { Check, Clock3, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/sites/schema";
import { paletteStyle } from "@/lib/sites/palettes";
import { TEMPLATE_FONTS } from "../fonts";
import { anchor, ctaLabel, external, FaqList, HeroImage, HoursRows, initials, mapHref, orderProps, sectionCopy, SiteCredit, Socials, StickyOrder, TemplateRoot, type TemplateProps } from "../parts";
import s from "./kelas.module.css";

/** Kelas: Lexend yang mudah dibaca, struktur kartu yang jelas, FAQ menonjol untuk calon peserta. */
export function KelasTemplate({ content, mode }: TemplateProps) {
  const copy = sectionCopy(content.category);
  const map = mapHref(content);
  const checklist = content.services.slice(0, 4);
  const school = content.category === "pendidikan";
  const join = school ? "Daftar" : "Pesan";
  return <TemplateRoot className={s.root} fonts={TEMPLATE_FONTS.kelas} style={paletteStyle(content.palette)} mode={mode}>
    <header className={s.top}>
      <a className={s.brand} href="#beranda"><span className={s.logo} aria-hidden="true">{initials(content.businessName)}</span><span>{content.businessName}</span></a>
      <nav className={s.nav} aria-label="Navigasi">
        {content.products.length ? <a href="#program">{copy.productsLabel}</a> : null}
        {content.faq.length ? <a href="#faq">FAQ</a> : null}
        <a href="#lokasi">Lokasi</a>
      </nav>
      <a className={s.topCta} {...orderProps(content)}>Hubungi</a>
    </header>

    <main>
      <section className={s.hero} {...anchor(mode, "beranda")}>
        <div className={s.heroText}>
          <p className={s.pill}>{copy.categoryLabel}{content.city ? ` di ${content.city}` : ""}</p>
          <h1 className={s.title}>{content.businessName}</h1>
          {content.tagline ? <p className={s.lead}>{content.tagline}</p> : null}
          {checklist.length ? <ul className={s.checks}>{checklist.map((item) => <li key={item.title}><span aria-hidden="true"><Check size={14} strokeWidth={3} /></span>{item.title}</li>)}</ul> : null}
          <div className={s.actions}>
            <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
            {content.products.length ? <a className={s.secondary} href="#program">Lihat {copy.productsLabel.toLowerCase()}</a> : null}
          </div>
        </div>
        <div className={s.heroVisual}>
          {content.heroImage ? <figure className={s.photo}><HeroImage content={content} mode={mode} className={s.heroImg} /></figure> : <div className={s.photoPlaceholder} aria-hidden="true">{initials(content.businessName)}</div>}
          <div className={s.statCard}>
            <strong>{content.products.length || content.services.length}</strong>
            <span>{content.products.length ? `${copy.productsLabel.toLowerCase()} tersedia` : "keunggulan"}</span>
            {content.hours[0] ? <small><Clock3 size={13} aria-hidden="true" />{content.hours[0].days}, {content.hours[0].time}</small> : null}
          </div>
        </div>
      </section>

      {content.products.length ? <section className={s.section} {...anchor(mode, "program")}>
        <div className={s.head}><p className={s.overline}>{copy.productsLabel}</p><h2>{copy.productsTitle}</h2></div>
        <ul className={s.cards}>
          {content.products.map((item) => <li key={item.name} className={s.card}>
            <h3>{item.name}</h3>
            {item.description ? <p>{item.description}</p> : null}
            <div className={s.cardFoot}>
              <span className={s.price}>{formatPrice(item.price)}</span>
              <a className={s.cardCta} {...orderProps(content, item.name)} aria-label={`${join} ${item.name}`}>{join}</a>
            </div>
          </li>)}
        </ul>
      </section> : null}

      {content.about || content.services.length ? <section className={s.why}>
        <div className={s.head}><p className={s.overline}>{copy.servicesLabel}</p><h2>{school ? "Belajar dengan tenang" : `Kenapa memilih ${content.businessName}`}</h2>{content.about ? <p className={s.about}>{content.about}</p> : null}</div>
        {content.services.length ? <ol className={s.reasons}>
          {content.services.map((item, index) => <li key={item.title}><span className={s.num} aria-hidden="true">{index + 1}</span><div><h3>{item.title}</h3>{item.description ? <p>{item.description}</p> : null}</div></li>)}
        </ol> : null}
      </section> : null}

      {content.testimonials.length ? <section className={s.section} aria-label="Testimoni">
        <div className={s.head}><p className={s.overline}>Testimoni</p><h2>Kata mereka</h2></div>
        <div className={s.testimonials}>
          {content.testimonials.map((item) => <figure key={item.name + item.quote}>
            <blockquote>{item.quote}</blockquote>
            <figcaption><span className={s.avatar} aria-hidden="true">{initials(item.name)}</span><span><strong>{item.name}</strong>{item.role ? <small>{item.role}</small> : null}</span></figcaption>
          </figure>)}
        </div>
      </section> : null}

      {content.faq.length ? <section className={s.section} {...anchor(mode, "faq")}>
        <div className={s.head}><p className={s.overline}>FAQ</p><h2>Pertanyaan yang sering muncul</h2></div>
        <FaqList content={content} className={s.faqList} />
      </section> : null}

      <section className={s.location} {...anchor(mode, "lokasi")}>
        <div>
          <p className={s.overline}>Jadwal & lokasi</p>
          <h2>Datang langsung atau tanya dulu</h2>
          {content.address ? <p className={s.address}><MapPin size={18} aria-hidden="true" />{content.address}</p> : null}
          <div className={s.actions}>
            <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
            {map ? <a className={s.secondary} href={map} {...external}>Buka peta</a> : null}
          </div>
          <Socials content={content} className={s.socials} />
        </div>
        <div className={s.schedule}>
          <h3>Jadwal</h3>
          <HoursRows content={content} className={s.hours} />
        </div>
      </section>
    </main>

    <footer className={s.footer}>
      <p>{content.businessName}{content.city ? ` · ${content.city}` : ""}</p>
      <SiteCredit mode={mode} className={s.credit} />
    </footer>
    <StickyOrder content={content} mode={mode} />
  </TemplateRoot>;
}
