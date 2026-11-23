import { Clock3, MapPin, Plus } from "lucide-react";
import { formatPrice } from "@/lib/sites/schema";
import { paletteStyle } from "@/lib/sites/palettes";
import { TEMPLATE_FONTS } from "../fonts";
import { anchor, ctaLabel, external, FaqList, HeroImage, HoursRows, initials, mapHref, orderProps, sectionCopy, SiteCredit, Socials, StickyOrder, TemplateRoot, type TemplateProps } from "../parts";
import s from "./pasar.module.css";

/** Pasar: grotesk tebal bergaya poster, blok warna penuh, kartu produk dengan harga besar. */
export function PasarTemplate({ content, mode }: TemplateProps) {
  const copy = sectionCopy(content.category);
  const map = mapHref(content);
  return <TemplateRoot className={s.root} fonts={TEMPLATE_FONTS.pasar} style={paletteStyle(content.palette)} mode={mode}>
    <header className={s.top}>
      <a className={s.brand} href="#beranda"><span className={s.badge} aria-hidden="true">{initials(content.businessName)}</span>{content.businessName}</a>
      <a className={s.topCta} {...orderProps(content)}>Pesan</a>
    </header>

    <main>
      <section className={s.hero} {...anchor(mode, "beranda")}>
        <div className={s.heroBlock}>
          {content.city ? <p className={s.stamp}>dari {content.city}</p> : null}
          <h1 className={s.title}>{content.businessName}</h1>
          {content.tagline ? <p className={s.lead}>{content.tagline}</p> : null}
          <div className={s.actions}>
            <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
            {content.products.length ? <a className={s.textLink} href="#produk">Lihat {content.products.length} {copy.productsLabel.toLowerCase()}</a> : null}
          </div>
        </div>
        {content.heroImage ? <figure className={s.heroPhoto}><HeroImage content={content} mode={mode} className={s.heroImg} /></figure> : null}
      </section>

      {content.services.length ? <ul className={s.chips} aria-label={copy.servicesLabel}>
        {content.services.map((item) => <li key={item.title} title={item.description || undefined}>{item.title}</li>)}
      </ul> : null}

      {content.products.length ? <section className={s.products} {...anchor(mode, "produk")}>
        <div className={s.head}>
          <h2>{copy.productsTitle}</h2>
          <p>Harga bisa berubah sewaktu-waktu. Cek stok lewat WhatsApp.</p>
        </div>
        <ul className={s.grid}>
          {content.products.map((item) => <li key={item.name} className={s.card}>
            <h3>{item.name}</h3>
            {item.description ? <p>{item.description}</p> : null}
            <div className={s.cardFoot}>
              <span className={s.price}>{formatPrice(item.price)}</span>
              <a className={s.add} {...orderProps(content, item.name)} aria-label={`Pesan ${item.name}`}><Plus size={18} aria-hidden="true" /><span>Pesan</span></a>
            </div>
          </li>)}
        </ul>
      </section> : null}

      {content.about || content.services.some((item) => item.description) ? <section className={s.story}>
        <h2>Cerita kami</h2>
        {content.about ? <p className={s.storyText}>{content.about}</p> : null}
        {content.services.some((item) => item.description) ? <dl className={s.facts}>
          {content.services.map((item) => <div key={item.title}><dt>{item.title}</dt><dd>{item.description}</dd></div>)}
        </dl> : null}
      </section> : null}

      {content.testimonials.length ? <section className={s.reviews} aria-label="Kata pembeli">
        {content.testimonials.map((item) => <blockquote key={item.name + item.quote}>
          <p>{item.quote}</p>
          <footer><span className={s.avatar} aria-hidden="true">{initials(item.name)}</span><span><strong>{item.name}</strong>{item.role ? <small>{item.role}</small> : null}</span></footer>
        </blockquote>)}
      </section> : null}

      <section className={s.visit} {...anchor(mode, "kontak")}>
        <div className={s.visitPanel}>
          <h2>Ambil langsung atau kami antar</h2>
          {content.address ? <p className={s.row}><MapPin size={20} aria-hidden="true" /><span>{content.address}</span></p> : null}
          <div className={s.row}><Clock3 size={20} aria-hidden="true" /><HoursRows content={content} className={s.hours} /></div>
          <div className={s.actions}>
            <a className={s.primaryDark} {...orderProps(content)}>{ctaLabel(content)}</a>
            {map ? <a className={s.textLink} href={map} {...external}>Buka peta</a> : null}
          </div>
          <Socials content={content} className={s.socials} />
        </div>
        {content.faq.length ? <div className={s.faq}>
          <h2>Tanya-tanya</h2>
          <FaqList content={content} className={s.faqList} />
        </div> : null}
      </section>
    </main>

    <footer className={s.footer}>
      <p><strong>{content.businessName}</strong>{content.city ? ` · ${content.city}` : ""}</p>
      <SiteCredit mode={mode} className={s.credit} />
    </footer>
    <StickyOrder content={content} mode={mode} />
  </TemplateRoot>;
}
