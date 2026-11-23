import { formatPrice } from "@/lib/sites/schema";
import { paletteStyle } from "@/lib/sites/palettes";
import { TEMPLATE_FONTS } from "../fonts";
import { anchor, ctaLabel, external, FaqList, HeroImage, HoursRows, LocalBadge, mapHref, MotifBand, orderProps, pad, ProductOrder, sectionCopy, SiteCredit, Socials, StickyOrder, TemplateRoot, type TemplateProps } from "../parts";
import s from "./kriya.module.css";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

/** Kriya: serif klasik ringan, tata letak galeri yang tenang, koleksi bernomor dan kutipan besar. */
export function KriyaTemplate({ content, mode }: TemplateProps) {
  const copy = sectionCopy(content.category);
  const map = mapHref(content);
  return <TemplateRoot className={s.root} fonts={TEMPLATE_FONTS.kriya} style={paletteStyle(content.palette)} mode={mode}>
    <header className={s.top}>
      <a className={s.brand} href="#beranda">{content.businessName}</a>
      <nav className={s.nav} aria-label="Navigasi">
        {content.products.length ? <a href="#koleksi">{copy.productsLabel}</a> : null}
        {content.about ? <a href="#cerita">Cerita</a> : null}
        <a href="#kunjungi">Kunjungi</a>
      </nav>
    </header>

    <main>
      <section className={s.hero} {...anchor(mode, "beranda")}>
        <div className={s.heroText}>
          <p className={s.eyebrow}>{copy.categoryLabel}</p>
          <LocalBadge content={content} mode={mode} />
          <h1 className={s.title}>{content.businessName}</h1>
          {content.tagline ? <p className={s.lead}>{content.tagline}</p> : null}
          <a className={s.cta} {...orderProps(content)}>{ctaLabel(content)}</a>
        </div>
        {content.heroImage ? <figure className={s.frame}><div className={s.frameInner}><HeroImage content={content} mode={mode} className={s.heroImg} sizes="(min-width: 900px) 40vw, 90vw" /></div></figure> : null}
      </section>

      <MotifBand motif="truntum" />

      {content.about ? <section className={s.about} {...anchor(mode, "cerita")}>
        <h2 className={s.sectionLabel}>Cerita</h2>
        <p className={s.aboutText}>{content.about}</p>
      </section> : null}

      {content.products.length ? <section className={s.collection} {...anchor(mode, "koleksi")}>
        <header className={s.sectionHead}><h2 className={s.sectionLabel}>{copy.productsLabel}</h2><p className={s.sectionTitle}>{copy.productsTitle}</p></header>
        <ol className={s.items}>
          {content.products.map((item, index) => <li key={item.name}>
            <span className={s.itemNo}>{pad(index)}</span>
            <div className={s.itemBody}>
              <h3>{item.name}</h3>
              {item.description ? <p>{item.description}</p> : null}
              <ProductOrder content={content} item={item} className={s.itemOrder} label={`Pesan ${item.name}`}>Pesan</ProductOrder>
            </div>
            <span className={s.itemPrice}>{formatPrice(item.price)}</span>
          </li>)}
        </ol>
      </section> : null}

      {content.services.length ? <section className={s.values} aria-label={copy.servicesLabel}>
        {content.services.map((item, index) => <article key={item.title}>
          <span className={s.roman}>{ROMAN[index] ?? index + 1}</span>
          <h3>{item.title}</h3>
          {item.description ? <p>{item.description}</p> : null}
        </article>)}
      </section> : null}

      {content.testimonials.length ? <section className={s.quotes} aria-label="Kata pelanggan">
        {content.testimonials.map((item) => <figure key={item.name + item.quote}>
          <blockquote>“{item.quote}”</blockquote>
          <figcaption>{item.name}{item.role ? ` · ${item.role}` : ""}</figcaption>
        </figure>)}
      </section> : null}

      <section className={s.visit} {...anchor(mode, "kunjungi")}>
        <h2 className={s.sectionTitle}>Kunjungi kami</h2>
        <div className={s.visitGrid}>
          <div>
            <h3 className={s.sectionLabel}>Alamat</h3>
            <p>{content.address || content.city || "Alamat belum dicantumkan."}</p>
            {map ? <a href={map} {...external}>Lihat di peta</a> : null}
          </div>
          <div>
            <h3 className={s.sectionLabel}>Jam buka</h3>
            <HoursRows content={content} className={s.hours} />
          </div>
          <div>
            <h3 className={s.sectionLabel}>Pesan</h3>
            <a {...orderProps(content)}>{ctaLabel(content)}</a>
            <Socials content={content} className={s.socials} />
          </div>
        </div>
      </section>

      {content.faq.length ? <section className={s.faq}>
        <h2 className={s.sectionTitle}>Pertanyaan</h2>
        <FaqList content={content} className={s.faqList} />
      </section> : null}
    </main>

    <MotifBand motif="truntum" />
    <footer className={s.footer}>
      <p className={s.footBrand}>{content.businessName}</p>
      <SiteCredit mode={mode} className={s.credit} />
    </footer>
    <StickyOrder content={content} mode={mode} />
  </TemplateRoot>;
}
