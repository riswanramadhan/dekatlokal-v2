import Script from "next/script";

const landingRuntime = `
(() => {
  if (window.__dekatlokalLandingRuntimeLoaded) return;
  window.__dekatlokalLandingRuntimeLoaded = true;

  const navItems = [
    ["Beranda", "#beranda"],
    ["Cara Kerja", "#akses-belajar"],
    ["Cerita", "#pengalaman"],
    ["Course", "#course"],
    ["Harga", "#paket"],
    ["FAQ", "#faq"]
  ];

  function bindNav() {
    const navbar = document.querySelector(".dl-navbar");
    const menuButton = document.querySelector(".dl-navbar-menu-button");
    const overlay = document.querySelector(".dl-mobile-overlay");
    const mobileMenu = document.getElementById("landing-mobile-menu");
    const closeButton = mobileMenu?.querySelector(".dl-mobile-menu-head button");
    const navLinksWrap = document.querySelector(".dl-navbar-links");
    const navIndicator = navLinksWrap?.querySelector(".dl-navbar-indicator");
    const desktopLinks = Array.from(document.querySelectorAll(".dl-navbar-links a"));
    const mobileLinks = Array.from(document.querySelectorAll(".dl-mobile-menu a"));
    if (!navbar || !menuButton || !overlay || !mobileMenu) return;

    function setMenuOpen(isOpen) {
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Tutup menu utama" : "Buka menu utama");
      mobileMenu.classList.toggle("is-open", isOpen);
      overlay.classList.toggle("is-open", isOpen);
      overlay.setAttribute("aria-hidden", String(!isOpen));
      overlay.tabIndex = isOpen ? 0 : -1;
      document.body.classList.toggle("dl-menu-is-open", isOpen);
    }

    function setScrolled() {
      const isScrolled = window.scrollY > 32;
      navbar.classList.toggle("is-scrolled", isScrolled);
      navbar.dataset.scrolled = String(isScrolled);
    }

    function moveIndicator(link) {
      if (!navLinksWrap || !navIndicator) return;
      if (!link) {
        navLinksWrap.style.setProperty("--nav-indicator-left", "0px");
        navLinksWrap.style.setProperty("--nav-indicator-width", "0px");
        return;
      }
      const wrapRect = navLinksWrap.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      navLinksWrap.style.setProperty("--nav-indicator-left", String(linkRect.left - wrapRect.left) + "px");
      navLinksWrap.style.setProperty("--nav-indicator-width", String(linkRect.width) + "px");
    }

    function setActive(sectionId) {
      const href = "#" + sectionId;
      let activeDesktopLink = null;
      [...desktopLinks, ...mobileLinks].forEach((link) => {
        const isActive = link.getAttribute("href") === href;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
        if (isActive && desktopLinks.includes(link)) activeDesktopLink = link;
      });
      moveIndicator(activeDesktopLink);
    }

    function updateActiveFromScroll() {
      if (window.scrollY <= 12) {
        setActive(navItems[0][1].slice(1));
        return;
      }
      const marker = window.scrollY + Math.max(110, window.innerHeight * 0.36);
      let activeId = navItems[0][1].slice(1);
      for (const [, href] of navItems) {
        const section = document.querySelector(href);
        if (!section) continue;
        const top = section.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) activeId = href.slice(1);
      }
      setActive(activeId);
    }

    if (menuButton.dataset.dlMenuBound !== "true") {
      menuButton.dataset.dlMenuBound = "true";
      menuButton.addEventListener("click", () => {
        setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
      });
      overlay.addEventListener("click", () => setMenuOpen(false));
      closeButton?.addEventListener("click", () => setMenuOpen(false));
      mobileLinks.forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setMenuOpen(false);
      });
    }

    if (navbar.dataset.dlScrollBound !== "true") {
      navbar.dataset.dlScrollBound = "true";
      window.addEventListener("scroll", () => {
        setScrolled();
        updateActiveFromScroll();
      }, { passive: true });
      const sections = navItems
        .map(([, href]) => document.querySelector(href))
        .filter(Boolean);
      if ("IntersectionObserver" in window && sections.length) {
        const observer = new IntersectionObserver(() => updateActiveFromScroll(), {
          rootMargin: "-28% 0px -58%",
          threshold: [0.01, 0.2, 0.5],
        });
        sections.forEach((section) => observer.observe(section));
      }
    }

    if (navLinksWrap && navLinksWrap.dataset.dlIndicatorBound !== "true") {
      navLinksWrap.dataset.dlIndicatorBound = "true";
      desktopLinks.forEach((link) => {
        link.addEventListener("mouseenter", () => moveIndicator(link));
        link.addEventListener("focus", () => moveIndicator(link));
      });
      navLinksWrap.addEventListener("mouseleave", updateActiveFromScroll);
      window.addEventListener("resize", updateActiveFromScroll, { passive: true });
      window.addEventListener("hashchange", () => window.setTimeout(updateActiveFromScroll, 80), { passive: true });
    }

    setScrolled();
    updateActiveFromScroll();
    window.setTimeout(updateActiveFromScroll, 260);
  }

  function bindStory() {
    const carousel = document.querySelector(".dl-story-carousel");
    const track = carousel?.querySelector(".dl-story-track");
    const cards = Array.from(carousel?.querySelectorAll(".dl-story-card") || []);
    const dotsWrap = carousel?.querySelector(".dl-story-dots");
    const count = carousel?.querySelector(".dl-story-count");
    const prev = carousel?.querySelector(".dl-story-side-arrow.is-left");
    const next = carousel?.querySelector(".dl-story-side-arrow.is-right");
    if (!carousel || !track || !dotsWrap || cards.length === 0) return;
    if (carousel.dataset.dlStoryBound === "true") return;
    carousel.dataset.dlStoryBound = "true";

    let index = 0;
    let visibleCount = 3;
    let maxIndex = 0;
    let pointerStart = null;
    let autoplayTimer = null;
    const autoplayEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function getVisibleCount() {
      if (window.innerWidth < 700) return 1;
      if (window.innerWidth < 1080) return 2;
      return 3;
    }

    function syncDots() {
      const targetCount = maxIndex + 1;
      let dots = Array.from(dotsWrap.querySelectorAll("button"));
      if (dots.length !== targetCount) {
        dotsWrap.replaceChildren();
        for (let dotIndex = 0; dotIndex < targetCount; dotIndex += 1) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.setAttribute("aria-label", "Tampilkan cerita " + (dotIndex + 1));
          dotsWrap.appendChild(dot);
        }
        dots = Array.from(dotsWrap.querySelectorAll("button"));
      }
      dots.forEach((dot, dotIndex) => {
        dot.onclick = () => setStoryIndex(dotIndex);
      });
    }

    function queueAutoplay() {
      if (!autoplayEnabled) return;
      window.clearTimeout(autoplayTimer);
      autoplayTimer = window.setTimeout(() => {
        if (!document.hidden) setStoryIndex(index >= maxIndex ? 0 : index + 1, false);
        queueAutoplay();
      }, 6000);
    }

    function setStoryIndex(nextIndex, resetAutoplay = true) {
      index = nextIndex > maxIndex ? 0 : nextIndex < 0 ? maxIndex : nextIndex;
      track.style.setProperty("--story-index", String(index));
      track.style.setProperty("--story-visible", String(visibleCount));
      cards.forEach((card, cardIndex) => {
        card.setAttribute("aria-hidden", String(cardIndex < index || cardIndex >= index + visibleCount));
      });
      const dots = Array.from(dotsWrap.querySelectorAll("button"));
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-pressed", String(isActive));
      });
      if (count) {
        count.textContent = String(index + 1).padStart(2, "0") + " / " + String(maxIndex + 1).padStart(2, "0");
      }
      if (resetAutoplay) queueAutoplay();
    }

    function updateStoryLayout() {
      visibleCount = getVisibleCount();
      maxIndex = Math.max(0, cards.length - visibleCount);
      syncDots();
      setStoryIndex(Math.min(index, maxIndex));
    }

    prev?.addEventListener("click", () => setStoryIndex(index - 1));
    next?.addEventListener("click", () => setStoryIndex(index + 1));
    carousel.addEventListener("pointercancel", () => {
      pointerStart = null;
    });
    carousel.addEventListener("pointerdown", (event) => {
      pointerStart = event.clientX;
    });
    carousel.addEventListener("pointerup", (event) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      if (Math.abs(distance) > 48) setStoryIndex(index + (distance < 0 ? 1 : -1));
      pointerStart = null;
    });

    updateStoryLayout();
    window.addEventListener("resize", updateStoryLayout, { passive: true });

    queueAutoplay();
  }

  function bindFaq() {
    const items = Array.from(document.querySelectorAll(".dl-faq-item"));
    if (!items.length || items[0].dataset.dlFaqBound === "true") return;

    function getAnswer(item) {
      return item.querySelector(".dl-faq-answer");
    }

    function getSummary(item) {
      return item.querySelector("summary");
    }

    function clearFaqTimer(item) {
      if (item.__dlFaqTimer) {
        window.clearTimeout(item.__dlFaqTimer);
        item.__dlFaqTimer = null;
      }
    }

    function setInitialState(item) {
      const answer = getAnswer(item);
      const summary = getSummary(item);
      if (!answer) return;
      summary?.setAttribute("aria-expanded", String(item.open));
      item.classList.toggle("is-active", item.open);
      answer.style.maxHeight = item.open ? answer.scrollHeight + "px" : "0px";
      answer.style.opacity = item.open ? "1" : "0";
      answer.style.transform = item.open ? "translateY(0)" : "translateY(-4px)";
    }

    function openItem(item) {
      const answer = getAnswer(item);
      const summary = getSummary(item);
      if (!answer) return;
      clearFaqTimer(item);
      item.open = true;
      item.classList.remove("is-closing");
      item.classList.add("is-active", "is-opening");
      summary?.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = "0px";
      answer.style.opacity = "0";
      answer.style.transform = "translateY(-4px)";
      answer.getBoundingClientRect();
      window.requestAnimationFrame(() => {
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.style.opacity = "1";
        answer.style.transform = "translateY(0)";
      });
      item.__dlFaqTimer = window.setTimeout(() => {
        item.classList.remove("is-opening");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }, 360);
    }

    function closeItem(item) {
      const answer = getAnswer(item);
      const summary = getSummary(item);
      if (!answer || !item.open) return;
      clearFaqTimer(item);
      item.classList.remove("is-active", "is-opening");
      item.classList.add("is-closing");
      summary?.setAttribute("aria-expanded", "false");
      answer.style.maxHeight = answer.scrollHeight + "px";
      answer.style.opacity = "1";
      answer.style.transform = "translateY(0)";
      answer.getBoundingClientRect();
      window.requestAnimationFrame(() => {
        answer.style.maxHeight = "0px";
        answer.style.opacity = "0";
        answer.style.transform = "translateY(-4px)";
      });
      item.__dlFaqTimer = window.setTimeout(() => {
        item.open = false;
        item.classList.remove("is-closing");
        answer.style.maxHeight = "0px";
      }, 360);
    }

    items.forEach((item) => {
      item.dataset.dlFaqBound = "true";
      setInitialState(item);
      getSummary(item)?.addEventListener("click", (event) => {
        event.preventDefault();
        const shouldOpen = !item.open || item.classList.contains("is-closing");
        if (shouldOpen) {
          items.forEach((otherItem) => {
            if (otherItem !== item) closeItem(otherItem);
          });
          openItem(item);
        } else {
          closeItem(item);
        }
      });
    });

    window.addEventListener("resize", () => {
      items.forEach((item) => {
        const answer = getAnswer(item);
        if (answer && item.open && !item.classList.contains("is-closing")) {
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    }, { passive: true });
  }

  function bindLanding() {
    bindNav();
    bindStory();
    bindFaq();
  }

  function scheduleBinding() {
    window.setTimeout(bindLanding, 120);
    window.setTimeout(bindLanding, 800);
    window.setTimeout(bindLanding, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleBinding, { once: true });
  } else {
    scheduleBinding();
  }
  window.addEventListener("load", () => window.setTimeout(bindLanding, 0), { once: true });
})();
`;

export function LandingRuntimeScript() {
  return (
    <Script
      id="dl-landing-runtime"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{ __html: landingRuntime }}
    />
  );
}
