import { Clock3, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/sites/schema";
import { paletteStyle } from "@/lib/sites/palettes";
import { TEMPLATE_FONTS } from "../fonts";
import { anchor, ctaLabel, external, FaqList, HeroImage, HoursRows, LocalBadge, mapHref, MotifBand, orderProps, pad, ProductOrder, sectionCopy, SiteCredit, Socials, StickyOrder, TemplateRoot, type TemplateProps } from "../parts";
import s from "./warung.module.css";

/** Warung: hangat, serif lembut, papan menu dengan titik penuntun harga. */
export function WarungTemplate({ content, mode }: TemplateProps) {
  const copy = sectionCopy(content.category);
  const map = mapHref(content);
  const [lead, ...quotes] = content.testimonials;
  return <TemplateRoot className={s.root} fonts={TEMPLATE_FONTS.warung} style={paletteStyle(content.palette)} mode={mode}>
    <header className={s.top}>
      <a className={s.brand} href="#beranda">{content.businessName}</a>
      <nav className={s.nav} aria-label="Navigasi">
        {content.products.length ? <a href="#menu">{copy.productsLabel}</a> : null}
        <a href="#kontak">Lokasi</a>
        {content.faq.length ? <a href="#tanya">Tanya</a> : null}
      </nav>
    </header>

    <main>
      <section className={s.hero} {...anchor(mode, "beranda")}>
        <div className={s.heroText}>
          <p className={s.eyebrow}>{copy.categoryLabel}</p>
          <LocalBadge content={content} mode={mode} />
          <h1 className={s.title}>{content.businessName}</h1>
          {content.tagline ? <p className={s.lead}>{content.tagline}</p> : null}
          <div className={s.actions}>
            <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
            {content.products.length ? <a className={s.ghost} href="#menu">Lihat {copy.productsLabel.toLowerCase()}</a> : null}
          </div>
          {content.hours[0] ? <p className={s.openNote}><Clock3 size={16} aria-hidden="true" />{content.hours[0].days}, {content.hours[0].time}</p> : null}
        </div>
        <figure className={s.heroMedia}>
          <HeroImage content={content} mode={mode} className={s.heroImg} />
        </figure>
      </section>

      <MotifBand motif="kawung" />

      {content.services.length ? <section className={s.perks} aria-label={copy.servicesLabel}>
        {content.services.map((item, index) => <article key={item.title}>
          <span className={s.perkNo}>{pad(index)}</span>
          <h2>{item.title}</h2>
          {item.description ? <p>{item.description}</p> : null}
        </article>)}
      </section> : null}

      {content.about ? <section className={s.story}>
        <p className={s.eyebrow}>Cerita kami</p>
        <p className={s.storyText}>{content.about}</p>
      </section> : null}

      {content.products.length ? <section className={s.menu} {...anchor(mode, "menu")}>
        <div className={s.menuHead}>
          <p className={s.eyebrow}>{copy.productsLabel}</p>
          <h2>{copy.productsTitle}</h2>
        </div>
        <ul className={s.menuList}>
          {content.products.map((item) => <li key={item.name} className={s.menuItem}>
            <div className={s.menuRow}>
              <h3>{item.name}</h3>
              <span className={s.leader} aria-hidden="true" />
              <span className={s.price}>{formatPrice(item.price)}</span>
            </div>
            {item.description ? <p>{item.description}</p> : null}
            <ProductOrder content={content} item={item} className={s.itemOrder} label={`Pesan ${item.name}`}>Pesan</ProductOrder>
          </li>)}
        </ul>
      </section> : null}

      {lead ? <section className={s.quotes} aria-label="Kata pelanggan">
        <blockquote className={s.bigQuote}>
          <p>“{lead.quote}”</p>
          <footer>{lead.name}{lead.role ? <span>, {lead.role}</span> : null}</footer>
        </blockquote>
        {quotes.length ? <div className={s.smallQuotes}>{quotes.map((item) => <blockquote key={item.name + item.quote}><p>“{item.quote}”</p><footer>{item.name}{item.role ? `, ${item.role}` : ""}</footer></blockquote>)}</div> : null}
      </section> : null}

      <section className={s.visit} {...anchor(mode, "kontak")}>
        <div className={s.visitCard}>
          <div>
            <p className={s.eyebrow}>Mampir atau pesan antar</p>
            <h2>Kami tunggu, ya.</h2>
            {content.address ? <p className={s.address}><MapPin size={18} aria-hidden="true" />{content.address}</p> : null}
            <div className={s.visitActions}>
              <a className={s.primary} {...orderProps(content)}>{ctaLabel(content)}</a>
              {map ? <a className={s.ghost} href={map} {...external}>Buka Google Maps</a> : null}
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
        <h2>Sering ditanyakan</h2>
        <FaqList content={content} className={s.faqList} />
      </section> : null}
    </main>

    <MotifBand motif="kawung" />
    <footer className={s.footer}>
      <p className={s.footBrand}>{content.businessName}</p>
      <p>{[content.city, content.address && "Pesan lewat WhatsApp"].filter(Boolean).join(" · ")}</p>
      <SiteCredit mode={mode} />
    </footer>
    <StickyOrder content={content} mode={mode} className={s.sticky} />
  </TemplateRoot>;
}
