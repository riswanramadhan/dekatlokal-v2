import { ArrowUpRight, Clock3, MapPin, Plus } from "lucide-react";
import { formatPrice } from "@/lib/sites/schema";
import { paletteStyle } from "@/lib/sites/palettes";
import { TEMPLATE_FONTS } from "../fonts";
import { anchor, ctaLabel, external, FaqList, HeroImage, HoursRows, LocalBadge, mapHref, MotifBand, orderProps, pad, ProductOrder, sectionCopy, SiteCredit, Socials, StickyOrder, TemplateRoot, WhatsAppGlyph, type TemplateProps } from "../parts";
import s from "./senja.module.css";

/** Senja: gelap & hangat, foto penuh layar, rak produk yang bisa digeser, motif Bola Soba (Bugis-Makassar). */
export function SenjaTemplate({ content, mode }: TemplateProps) {
  const copy = sectionCopy(content.category);
  const map = mapHref(content);
  return <TemplateRoot className={s.root} fonts={TEMPLATE_FONTS.senja} style={paletteStyle(content.palette)} mode={mode}>
    <header className={s.top}>
      <a className={s.brand} href="#beranda">{content.businessName}</a>
      <a className={s.topOrder} {...orderProps(content)} aria-label={ctaLabel(content)}><WhatsAppGlyph size={18} /><span>Pesan</span></a>
    </header>

    <main>
      <section className={s.hero} {...anchor(mode, "beranda")}>
        <div className={s.heroMedia}><HeroImage content={content} mode={mode} className={s.heroImg} sizes="100vw" /></div>
        <div className={s.heroShade} aria-hidden="true" />
        <div className={s.heroText}>
          <LocalBadge content={content} mode={mode} />
          <h1 className={s.title}>{content.businessName}</h1>
          {content.tagline ? <p className={s.lead}>{content.tagline}</p> : null}
          <div className={s.actions}>
            <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
            {content.products.length ? <a className={s.ghost} href="#rak">Lihat {copy.productsLabel.toLowerCase()}</a> : null}
          </div>
        </div>
      </section>

      <MotifBand motif="lontara" className={s.band} />

      {content.products.length ? <section className={s.rail} {...anchor(mode, "rak")}>
        <div className={s.railHead}>
          <p className={s.kicker}>{copy.productsLabel}</p>
          <h2>{copy.productsTitle}</h2>
          <p className={s.hint}>Geser untuk lihat semua · tekan + untuk menambah pesanan</p>
        </div>
        <ul className={s.railList}>
          {content.products.map((item, index) => <li key={item.name} className={s.card}>
            <span className={s.cardNo}>{pad(index)}</span>
            <h3>{item.name}</h3>
            {item.description ? <p>{item.description}</p> : null}
            <div className={s.cardFoot}>
              <span className={s.price}>{formatPrice(item.price)}</span>
              <ProductOrder content={content} item={item} className={s.add} label={`Tambah ${item.name} ke pesanan`}><Plus size={18} aria-hidden="true" /></ProductOrder>
            </div>
          </li>)}
        </ul>
      </section> : null}

      {content.about || content.services.length ? <section className={s.story}>
        {content.about ? <div>
          <p className={s.kicker}>Cerita kami</p>
          <p className={s.storyText}>{content.about}</p>
        </div> : null}
        {content.services.length ? <ul className={s.perks} aria-label={copy.servicesLabel}>
          {content.services.map((item) => <li key={item.title}><strong>{item.title}</strong>{item.description ? <span>{item.description}</span> : null}</li>)}
        </ul> : null}
      </section> : null}

      {content.testimonials.length ? <section className={s.voices} aria-label="Kata pelanggan">
        {content.testimonials.map((item) => <blockquote key={item.name + item.quote}>
          <p>{item.quote}</p>
          <footer>{item.name}{item.role ? ` · ${item.role}` : ""}</footer>
        </blockquote>)}
      </section> : null}

      <section className={s.visit} {...anchor(mode, "kontak")}>
        <div className={s.visitCard}>
          <div className={s.visitMain}>
            <p className={s.kicker}>Datang atau pesan antar</p>
            <h2>Sampai ketemu di {content.city || "tempat kami"}.</h2>
            {content.address ? <p className={s.line}><MapPin size={18} aria-hidden="true" />{content.address}</p> : null}
            {content.hours[0] ? <p className={s.line}><Clock3 size={18} aria-hidden="true" />{content.hours[0].days}, {content.hours[0].time}</p> : null}
            <div className={s.actions}>
              <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
              {map ? <a className={s.ghost} href={map} {...external}>Google Maps <ArrowUpRight size={16} aria-hidden="true" /></a> : null}
            </div>
            <Socials content={content} className={s.socials} />
          </div>
          <div className={s.hoursBox}>
            <h3>Jam buka</h3>
            <HoursRows content={content} className={s.hours} />
          </div>
        </div>
      </section>

      {content.faq.length ? <section className={s.faq} {...anchor(mode, "tanya")}>
        <h2>Yang sering ditanyakan</h2>
        <FaqList content={content} className={s.faqList} />
      </section> : null}
    </main>

    <MotifBand motif="lontara" className={s.band} />
    <footer className={s.footer}>
      <p className={s.footBrand}>{content.businessName}</p>
      <SiteCredit mode={mode} />
    </footer>
    <StickyOrder content={content} mode={mode} />
  </TemplateRoot>;
}
