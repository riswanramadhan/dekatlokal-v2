import { ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/lib/sites/schema";
import { paletteStyle } from "@/lib/sites/palettes";
import { TEMPLATE_FONTS } from "../fonts";
import { anchor, ctaLabel, cx, external, FaqList, HeroImage, HoursRows, LocalBadge, mapHref, MotifBand, orderProps, pad, ProductOrder, sectionCopy, SiteCredit, Socials, StickyOrder, TemplateRoot, type TemplateProps } from "../parts";
import s from "./etalase.module.css";

/** Etalase: grotesk lebar huruf kapital, foto penuh, katalog berkisi bergaya label harga butik. */
export function EtalaseTemplate({ content, mode }: TemplateProps) {
  const copy = sectionCopy(content.category);
  const map = mapHref(content);
  const hasImage = Boolean(content.heroImage);
  return <TemplateRoot className={s.root} fonts={TEMPLATE_FONTS.etalase} style={paletteStyle(content.palette)} mode={mode}>
    <p className={s.bar}>{ctaLabel(content)}{content.city ? <span> · Dari {content.city}</span> : null}</p>
    <header className={s.top}>
      <a className={s.brand} href="#beranda">{content.businessName}</a>
      <nav className={s.nav} aria-label="Navigasi">
        {content.products.length ? <a href="#katalog">{copy.productsLabel}</a> : null}
        <a href="#toko">Toko</a>
        <a {...orderProps(content)}>WhatsApp</a>
      </nav>
    </header>

    <main>
      <section className={cx(s.hero, !hasImage && s.heroPlain)} {...anchor(mode, "beranda")}>
        <div className={s.heroMedia}><HeroImage content={content} mode={mode} className={s.heroImg} sizes="100vw" /></div>
        <div className={s.heroText}>
          <p className={s.kicker}>{copy.categoryLabel}</p>
          <LocalBadge content={content} mode={mode} />
          <h1 className={s.title}>{content.businessName}</h1>
          {content.tagline ? <p className={s.lead}>{content.tagline}</p> : null}
          <div className={s.actions}>
            <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
            {content.products.length ? <a className={s.secondary} href="#katalog">Lihat {copy.productsLabel.toLowerCase()}</a> : null}
          </div>
        </div>
      </section>

      <MotifBand motif="songket" />

      {content.services.length ? <ul className={s.strip} aria-label={copy.servicesLabel}>
        {content.services.map((item) => <li key={item.title}><strong>{item.title}</strong>{item.description ? <span>{item.description}</span> : null}</li>)}
      </ul> : null}

      {content.products.length ? <section className={s.catalog} {...anchor(mode, "katalog")}>
        <div className={s.sectionHead}>
          <h2>{copy.productsTitle}</h2>
          <span className={s.count}>({String(content.products.length).padStart(2, "0")})</span>
        </div>
        <ul className={s.grid}>
          {content.products.map((item, index) => <li key={item.name} className={s.card}>
            <div className={s.cardTop}><span>No. {pad(index)}</span><span className={s.tag}>{formatPrice(item.price)}</span></div>
            <h3>{item.name}</h3>
            {item.description ? <p>{item.description}</p> : null}
            <ProductOrder content={content} item={item} className={s.cardOrder} label={`Pesan ${item.name}`}>Pesan <ArrowUpRight size={16} aria-hidden="true" /></ProductOrder>
          </li>)}
        </ul>
      </section> : null}

      {content.about ? <section className={s.about}>
        <h2 className={s.aboutLabel}>Tentang kami</h2>
        <p className={s.aboutText}>{content.about}</p>
      </section> : null}

      {content.testimonials.length ? <section className={s.reviews} aria-label="Ulasan pembeli">
        {content.testimonials.map((item) => <blockquote key={item.name + item.quote}>
          <p>{item.quote}</p>
          <footer><strong>{item.name}</strong>{item.role ? <span>{item.role}</span> : null}</footer>
        </blockquote>)}
      </section> : null}

      <section className={s.store} {...anchor(mode, "toko")}>
        <h2>Kunjungi toko</h2>
        <div className={s.storeGrid}>
          <div className={s.storeCell}>
            <h3>Alamat</h3>
            <p>{content.address || content.city || "Alamat belum dicantumkan."}</p>
            {map ? <a href={map} {...external}>Petunjuk arah <ArrowUpRight size={15} aria-hidden="true" /></a> : null}
          </div>
          <div className={s.storeCell}>
            <h3>Jam buka</h3>
            <HoursRows content={content} className={s.hours} />
          </div>
          <div className={s.storeCell}>
            <h3>Kontak</h3>
            <p>Tanya stok, ukuran, dan ongkir lewat WhatsApp.</p>
            <a {...orderProps(content)}>Chat sekarang <ArrowUpRight size={15} aria-hidden="true" /></a>
            <Socials content={content} className={s.socials} />
          </div>
        </div>
      </section>

      {content.faq.length ? <section className={s.faq}>
        <h2>Pertanyaan</h2>
        <FaqList content={content} className={s.faqList} />
      </section> : null}
    </main>

    <MotifBand motif="songket" />
    <footer className={s.footer}>
      <p className={s.wordmark} aria-hidden="true">{content.businessName}</p>
      <SiteCredit mode={mode} className={s.credit} />
    </footer>
    <StickyOrder content={content} mode={mode} />
  </TemplateRoot>;
}
