import { expect, test } from "@playwright/test";

test.setTimeout(180_000);

for (const width of [320, 390, 768, 1440]) {
  test(`brand layout at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#hero-title")).toContainText("Agar lebih Dekat dengan");
    await expect(page.locator(".dl-dashboard-welcome h2")).toHaveText("Selamat Datang, Sarah!");
    const copy = await page.locator(".dl-hero-copy").boundingBox();
    const mockup = await page.locator(".dl-hero-product").boundingBox();
    expect(mockup!.y - (copy!.y + copy!.height)).toBeGreaterThanOrEqual(0);
    expect(mockup!.y - (copy!.y + copy!.height)).toBeLessThanOrEqual(26);
    expect(mockup!.y).toBeLessThan(680);
    const logo = page.locator(".dl-logo-strip");
    await expect(logo).toHaveCSS("border-radius", "0px");
    await expect(page.locator(".dl-logo-strip-label")).toHaveCSS("text-align", "center");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath("hero.png") });
    await page.locator("#course").evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expect.poll(() => page.locator(".dl-course-image img").first().evaluate((element) => (element as HTMLImageElement).naturalWidth), { timeout: 20000 }).toBeGreaterThan(0);
    await expect(page.locator(".dl-access-badge").first()).toHaveCSS("background-color", "rgb(234, 242, 255)");
    if (width === 1440) {
      const rail = await page.locator(".dl-navbar").boundingBox();
      for (const selector of [".dl-course-grid", ".dl-access-board", ".dl-story-carousel", ".dl-pricing-layout", ".dl-faq-layout"]) {
        const box = await page.locator(selector).boundingBox();
        expect(Math.abs(box!.x - rail!.x), selector).toBeLessThan(2);
        expect(Math.abs(box!.width - rail!.width), selector).toBeLessThan(2);
      }
    }
    const cards = await page.locator(".dl-course-card").evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      const action = element.querySelector(".dl-course-actions")!.getBoundingClientRect();
      return { y: box.y, bottom: box.bottom, action: action.y };
    }));
    for (const card of cards) {
      for (const other of cards.filter((other) => Math.abs(other.y - card.y) < 2)) {
        expect(Math.abs(other.bottom - card.bottom)).toBeLessThan(2);
        expect(Math.abs(other.action - card.action)).toBeLessThan(2);
      }
    }
    await page.screenshot({ path: testInfo.outputPath("courses.png") });
    await page.locator("#mulai").scrollIntoViewIfNeeded();
    await expect(page.locator(".dl-final-visual")).toHaveCount(0);
    await expect(page.locator(".dl-final-copy")).toHaveCSS("text-align", "center");
    await expect(page.locator("#mulai .dl-section-kicker")).toHaveCSS("text-align", "center");
    if (width === 1440) expect(await page.locator("#mulai").evaluate((element)=>getComputedStyle(element,"::before").animationName)).toBe("dc-cta-breathe");
    await page.screenshot({ path: testInfo.outputPath("cta.png") });
  });
}

test("mobile menu expands as one navbar and latest sections stay compact", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const navbar = page.locator(".dl-navbar");
  const trigger = page.getByRole("button", { name: "Buka menu utama" });
  const closed = await navbar.boundingBox();
  await expect(trigger).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(navbar).toHaveCSS("transition-duration", "0.55s, 0.4s, 0.5s, 0.35s");
  await trigger.click();
  await expect(page.locator(".dl-navbar-menu-button")).toHaveAttribute("aria-expanded", "true");
  await page.waitForTimeout(600);
  const opened = await navbar.boundingBox();
  expect(opened!.height).toBeGreaterThan(closed!.height);
  expect(opened!.height).toBeGreaterThan(380);
  expect(Math.abs(opened!.x - closed!.x)).toBeLessThan(1);
  expect(Math.abs(opened!.width - closed!.width)).toBeLessThan(1);
  await expect(navbar.locator("#landing-mobile-menu")).toBeVisible();
  await page.locator(".dl-navbar-menu-button").click();
  await page.waitForTimeout(120);
  const closing = await navbar.boundingBox();
  expect(closing!.height).toBeGreaterThan(closed!.height);
  expect(closing!.height).toBeLessThan(opened!.height);
  await page.waitForTimeout(520);
  const closedAgain = await navbar.boundingBox();
  expect(Math.abs(closedAgain!.height-closed!.height)).toBeLessThan(2);
  await expect(page.locator(".dl-navbar-menu-button")).toHaveAttribute("aria-expanded","false");
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe("");

  await page.locator("#pengalaman").scrollIntoViewIfNeeded();
  await expect(page.locator(".dl-story-arrows")).toBeHidden();
  await expect(page.locator(".dl-story-controls")).toBeHidden();
  await expect(page.locator(".dl-story-viewport")).toHaveCSS("overflow-x", "auto");
  await expect(page.locator(".dl-story-image img").first()).toHaveCSS("object-position", "50% 0%");
  await expect(page.locator(".dl-story-carousel")).toHaveCSS("touch-action","auto");
  await expect(page.locator(".dl-story-viewport")).toHaveCSS("touch-action","auto");
  const storyCards=await page.locator(".dl-story-card").evaluateAll(nodes=>nodes.slice(0,2).map(node=>{const box=node.getBoundingClientRect();return {left:box.left,right:box.right}}));
  expect(storyCards[1].left).toBeLessThan(390);
  const storyY=await page.evaluate(()=>scrollY);
  await page.locator(".dl-story-viewport").hover();
  await page.mouse.wheel(0,320);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(storyY);

  const sectionFlow = await page.evaluate(() => {
    const ids = ["pengalaman", "course", "paket"];
    return ids.map((id) => {
      const node = document.getElementById(id)!;
      const box = node.getBoundingClientRect();
      return { id, height: box.height, minHeight: getComputedStyle(node).minHeight };
    });
  });
  for (const section of sectionFlow) {
    expect(section.height, section.id).toBeGreaterThan(0);
    expect(section.minHeight, section.id).toBe("0px");
  }

  await page.locator("#course").scrollIntoViewIfNeeded();
  await expect(page.locator("#course .dl-course-grid")).toHaveCSS("touch-action","auto");
  const courseCards=await page.locator("#course .dl-course-card").evaluateAll(nodes=>nodes.slice(0,2).map(node=>{const box=node.getBoundingClientRect();return {left:box.left,right:box.right}}));
  expect(courseCards[1].left).toBeLessThan(390);
  const courseY=await page.evaluate(()=>scrollY);
  await page.locator("#course .dl-course-grid").hover();
  await page.mouse.wheel(0,320);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(courseY);

  await page.locator("#paket").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: /Tumbuh/ })).toContainText("Rp499.000");
  await expect(page.getByRole("button", { name: /Melesat/ })).toContainText("Rp799.000");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".dl-footer-grid")).toHaveCSS("text-align","left");
  expect(parseFloat(await page.locator(".dl-footer-links a").first().evaluate(element=>getComputedStyle(element).fontSize))).toBeLessThanOrEqual(12);
});

test("headline changes in order without moving the mockup", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.bringToFront();
  const word = page.locator(".dl-changing-word");
  await expect(word).toHaveCSS("animation-duration", "3s");
  const y = (await page.locator(".dl-hero-product").boundingBox())!.y;
  const words = ["customer", "cuan", "pasar", "peluang", "teknologi", "pertumbuhan"];
  const first = (await word.textContent())!;
  await expect(word).toHaveText(words[(words.indexOf(first) + 1) % words.length], { timeout: 4500 });
  expect(Math.abs((await page.locator(".dl-hero-product").boundingBox())!.y - y)).toBeLessThan(1);
});

test("logo and story motion keep running while hovered", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const logoTrack = page.locator(".dl-logo-track");
  await page.locator(".dl-logo-strip").hover();
  await expect(logoTrack).toHaveCSS("animation-play-state", "running");
  const story = page.locator(".dl-story-carousel");
  await story.scrollIntoViewIfNeeded();
  await story.hover();
  const track = page.locator(".dl-story-track");
  const first = await track.evaluate((element) => getComputedStyle(element).getPropertyValue("--story-index"));
  await expect.poll(() => track.evaluate((element) => getComputedStyle(element).getPropertyValue("--story-index")), { timeout: 4500 }).not.toBe(first);
});

test("login UI validates locally and offers Google and email only", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/masuk");
  await expect(page.getByRole("heading", { name: "Yuk, lanjut tumbuh." })).toBeVisible();
  await expect(page.getByText(/maintenance|WhatsApp/i)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: "Lanjut dengan Google" }).click();
  await expect(page.getByRole("status")).toContainText("belum tersedia");
  await page.getByLabel("Email", { exact: true }).fill("sarah@example.com");
  await expect(page.getByLabel("Kata sandi", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Kirim kode masuk"})).toBeVisible();
  await page.getByRole("link", { name: "Kebijakan Privasi", exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "Kebijakan Privasi", exact: true })).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath("login-mobile.png") });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  await expect(page.locator(".dl-signin-aside")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath("login-desktop.png") });
});

test("admin has a separate email and password entry at /admin",async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.route("**/api/digital-checkup/admin-auth",async route=>route.fulfill({status:401,json:{error:"Email atau kata sandi belum cocok."}}));
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading",{name:"Masuk admin"})).toBeVisible();
  await expect(page.getByLabel("Email admin",{exact:true})).toBeVisible();
  await expect(page.getByLabel("Kata sandi",{exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:/Google|kode email/i})).toHaveCount(0);
  await page.getByLabel("Email admin",{exact:true}).fill("admin@example.org");
  await page.getByLabel("Kata sandi",{exact:true}).fill("simulation-only");
  await page.getByRole("button",{name:"Masuk dashboard"}).click();
  await expect(page.getByRole("alert")).toContainText("belum cocok");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({path:testInfo.outputPath("admin-login-mobile.png"),fullPage:true});
});

test("PWA manifest, icons, and safe offline fallback", async ({ page, context, request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();
  const manifest = await response.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.theme_color).toBe("#0255f5");
  for (const size of [192, 512]) {
    const icon = await request.get(`/pwa-icon/${size}`);
    expect(icon.ok()).toBeTruthy();
    expect(icon.headers()["content-type"]).toContain("image/png");
    const png = await icon.body();
    expect(png.readUInt32BE(16)).toBe(size);
    expect(png.readUInt32BE(20)).toBe(size);
  }
  await page.goto("/");
  // Registration is production-only; explicitly register here to exercise the worker in dev too.
  await page.evaluate(async () => {
    await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
  });
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload();
  }
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 10000 }).toBe(true);
  await context.setOffline(true);
  await page.goto("/masuk");
  await expect(page.getByRole("heading", { name: "Yah, koneksinya terputus." })).toBeVisible();
  const cacheUrls = await page.evaluate(async () => {
    const cache = await caches.open("dekatlokal-offline-v1");
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  expect(cacheUrls).toEqual(["/offline.html"]);
  await context.setOffline(false);
});
