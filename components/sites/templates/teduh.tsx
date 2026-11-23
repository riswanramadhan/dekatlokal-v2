import { Check, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/sites/schema";
import { paletteStyle } from "@/lib/sites/palettes";
import { TEMPLATE_FONTS } from "../fonts";
import { anchor, ctaLabel, external, FaqList, HeroImage, HoursRows, LocalBadge, mapHref, MotifBand, MotifField, orderProps, ProductOrder, sectionCopy, SiteCredit, Socials, StickyOrder, TemplateRoot, type TemplateProps } from "../parts";
import s from "./teduh.module.css";

/** Teduh: tenang & lembut, hero lengkung, alur pesan 1-2-3 khas DekatLokal, menu layanan dengan harga. */
export function TeduhTemplate({ content, mode }: TemplateProps) {
  const copy = sectionCopy(content.category);
  const map = mapHref(content);
  const steps = [
    { title: `Pilih ${copy.productsLabel.toLowerCase()}`, text: "Tekan Pilih pada yang kamu mau, bisa lebih dari satu." },
    { title: "Kirim lewat WhatsApp", text: "Daftar pilihanmu terkirim rapi ke kami, lengkap dengan total." },
    { title: "Kami konfirmasi", text: "Jadwal atau pengantaran kami atur bersama kamu." },
  ];
  return <TemplateRoot className={s.root} fonts={TEMPLATE_FONTS.teduh} style={paletteStyle(content.palette)} mode={mode}>
    <header className={s.top}>
      <a className={s.brand} href="#beranda">{content.businessName}</a>
      <nav className={s.nav} aria-label="Navigasi">
        {content.products.length ? <a href="#layanan">{copy.productsLabel}</a> : null}
        <a href="#kontak">Lokasi</a>
        {content.faq.length ? <a href="#tanya">Tanya</a> : null}
      </nav>
    </header>

    <main>
      <section className={s.hero} {...anchor(mode, "beranda")}>
        <div className={s.heroText}>
          <LocalBadge content={content} mode={mode} />
          <h1 className={s.title}>{content.tagline || content.businessName}</h1>
          {content.tagline ? <p className={s.lead}>{content.businessName} · {copy.categoryLabel}</p> : null}
          <div className={s.actions}>
            <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
            {content.products.length ? <a className={s.ghost} href="#layanan">Lihat {copy.productsLabel.toLowerCase()}</a> : null}
          </div>
        </div>
        <figure className={s.heroMedia}>
          <MotifField motif="ceplok" className={s.heroMotif} />
          <div className={s.arch}><HeroImage content={content} mode={mode} className={s.heroImg} /></div>
        </figure>
      </section>

      <ol className={s.steps} aria-label="Cara pesan">
        {steps.map((step, index) => <li key={step.title}>
          <span className={s.stepNo}>{index + 1}</span>
          <div><strong>{step.title}</strong><p>{step.text}</p></div>
        </li>)}
      </ol>

      <MotifBand motif="ceplok" />

      {content.products.length ? <section className={s.menu} {...anchor(mode, "layanan")}>
        <div className={s.head}>
          <p className={s.kicker}>{copy.productsLabel}</p>
          <h2>{copy.productsTitle}</h2>
        </div>
        <ul className={s.menuList}>
          {content.products.map((item) => <li key={item.name} className={s.menuItem}>
            <div className={s.menuText}>
              <h3>{item.name}</h3>
              {item.description ? <p>{item.description}</p> : null}
            </div>
            <span className={s.price}>{formatPrice(item.price)}</span>
            <ProductOrder content={content} item={item} className={s.pick} label={`Pilih ${item.name}`}>Pilih</ProductOrder>
          </li>)}
        </ul>
      </section> : null}

      {content.services.length || content.about ? <section className={s.care}>
        {content.about ? <p className={s.about}>{content.about}</p> : null}
        {content.services.length ? <ul className={s.benefits} aria-label={copy.servicesLabel}>
          {content.services.map((item) => <li key={item.title}>
            <span className={s.tick} aria-hidden="true"><Check size={16} /></span>
            <div><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}</div>
          </li>)}
        </ul> : null}
      </section> : null}

      {content.testimonials.length ? <section className={s.voices} aria-label="Kata pelanggan">
        {content.testimonials.map((item) => <figure key={item.name + item.quote}>
          <blockquote>{item.quote}</blockquote>
          <figcaption><strong>{item.name}</strong>{item.role ? <span>{item.role}</span> : null}</figcaption>
        </figure>)}
      </section> : null}

      <section className={s.visit} {...anchor(mode, "kontak")}>
        <div className={s.visitCard}>
          <h2>Kunjungi kami</h2>
          {content.address ? <p className={s.address}><MapPin size={18} aria-hidden="true" />{content.address}</p> : null}
          <HoursRows content={content} className={s.hours} />
          <div className={s.actions}>
            <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
            {map ? <a className={s.ghost} href={map} {...external}>Buka Google Maps</a> : null}
          </div>
          <Socials content={content} className={s.socials} />
        </div>
        {content.faq.length ? <div className={s.faq} {...anchor(mode, "tanya")}>
          <h2>Pertanyaan umum</h2>
          <FaqList content={content} className={s.faqList} />
        </div> : null}
      </section>
    </main>

    <footer className={s.footer}>
      <MotifBand motif="ceplok" />
      <p className={s.footBrand}>{content.businessName}</p>
      <SiteCredit mode={mode} />
    </footer>
    <StickyOrder content={content} mode={mode} />
  </TemplateRoot>;
}
