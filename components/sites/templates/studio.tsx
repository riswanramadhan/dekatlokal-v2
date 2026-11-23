import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/sites/schema";
import { paletteStyle } from "@/lib/sites/palettes";
import { TEMPLATE_FONTS } from "../fonts";
import { anchor, ctaLabel, external, FaqList, HeroImage, HoursRows, LocalBadge, mapHref, MotifBand, orderProps, pad, ProductOrder, sectionCopy, SiteCredit, Socials, StickyOrder, TemplateRoot, type TemplateProps } from "../parts";
import s from "./studio.module.css";

/** Studio: serif editorial + sans rapi, layanan bernomor dan tabel paket bergaris tipis. */
export function StudioTemplate({ content, mode }: TemplateProps) {
  const copy = sectionCopy(content.category);
  const map = mapHref(content);
  return <TemplateRoot className={s.root} fonts={TEMPLATE_FONTS.studio} style={paletteStyle(content.palette)} mode={mode}>
    <header className={s.top}>
      <a className={s.brand} href="#beranda"><span className={s.dot} aria-hidden="true" />{content.businessName}</a>
      <nav className={s.nav} aria-label="Navigasi">
        {content.services.length ? <a href="#layanan">{copy.servicesLabel}</a> : null}
        {content.products.length ? <a href="#paket">{copy.productsLabel}</a> : null}
        <a href="#kontak">Kontak</a>
      </nav>
      <a className={s.topCta} {...orderProps(content)}>{ctaLabel(content)}</a>
    </header>

    <main>
      <section className={s.hero} {...anchor(mode, "beranda")}>
        <LocalBadge content={content} mode={mode} />
        <h1 className={s.heading}>
          <span className={s.kicker}>{content.businessName}</span>
          <span className={s.display}>{content.tagline || copy.categoryLabel}</span>
        </h1>
        <dl className={s.facts}>
          <div><dt>Bidang</dt><dd>{copy.categoryLabel}</dd></div>
          {content.city ? <div><dt>Lokasi</dt><dd>{content.city}</dd></div> : null}
          {content.hours[0] ? <div><dt>Jam kerja</dt><dd>{content.hours[0].days}, {content.hours[0].time}</dd></div> : null}
          <div><dt>Respons</dt><dd>Lewat WhatsApp</dd></div>
        </dl>
      </section>

      <MotifBand motif="parang" />

      {content.heroImage ? <figure className={s.banner}><HeroImage content={content} mode={mode} className={s.bannerImg} sizes="100vw" /></figure> : null}

      {content.about ? <section className={s.about}>
        <h2 className={s.label}>Tentang</h2>
        <p className={s.aboutText}>{content.about}</p>
      </section> : null}

      {content.services.length ? <section className={s.split} {...anchor(mode, "layanan")}>
        <div className={s.splitHead}><h2 className={s.label}>{copy.servicesLabel}</h2><p className={s.sectionTitle}>Apa yang kami kerjakan</p></div>
        <ol className={s.rows}>
          {content.services.map((item, index) => <li key={item.title}>
            <span className={s.rowNo}>{pad(index)}</span>
            <div><h3>{item.title}</h3>{item.description ? <p>{item.description}</p> : null}</div>
          </li>)}
        </ol>
      </section> : null}

      {content.products.length ? <section className={s.pricing} {...anchor(mode, "paket")}>
        <div className={s.splitHead}><h2 className={s.label}>{copy.productsLabel}</h2><p className={s.sectionTitle}>{copy.productsTitle}</p></div>
        <ul className={s.table}>
          {content.products.map((item) => <li key={item.name}>
            <div className={s.tableName}><h3>{item.name}</h3>{item.description ? <p>{item.description}</p> : null}</div>
            <span className={s.tablePrice}>{formatPrice(item.price)}</span>
            <ProductOrder content={content} item={item} className={s.tableAction} label={`Pilih ${item.name}`}>Pilih <ArrowRight size={15} aria-hidden="true" /></ProductOrder>
          </li>)}
        </ul>
      </section> : null}

      {content.testimonials.length ? <section className={s.voices} aria-label="Kata klien">
        {content.testimonials.map((item) => <figure key={item.name + item.quote}>
          <blockquote>{item.quote}</blockquote>
          <figcaption>{item.name}{item.role ? <span> · {item.role}</span> : null}</figcaption>
        </figure>)}
      </section> : null}

      {content.faq.length ? <section className={s.split}>
        <div className={s.splitHead}><h2 className={s.label}>Tanya jawab</h2><p className={s.sectionTitle}>Sebelum mulai</p></div>
        <FaqList content={content} className={s.faqList} />
      </section> : null}

      <section className={s.contact} {...anchor(mode, "kontak")}>
        <p className={s.contactTitle}>Mari <em>bicara.</em></p>
        <div className={s.contactGrid}>
          <div>
            <h2 className={s.label}>Kantor</h2>
            <p>{content.address || content.city || "Layanan online"}</p>
            {map ? <a href={map} {...external}>Lihat peta</a> : null}
          </div>
          <div>
            <h2 className={s.label}>Jam kerja</h2>
            <HoursRows content={content} className={s.hours} />
          </div>
          <div>
            <h2 className={s.label}>Hubungi</h2>
            <a className={s.contactCta} {...orderProps(content)}>{ctaLabel(content)} <ArrowRight size={16} aria-hidden="true" /></a>
            <Socials content={content} className={s.socials} />
          </div>
        </div>
      </section>
    </main>

    <MotifBand motif="parang" />
    <footer className={s.footer}>
      <span>© {content.businessName}</span>
      <SiteCredit mode={mode} className={s.credit} />
    </footer>
    <StickyOrder content={content} mode={mode} />
  </TemplateRoot>;
}
