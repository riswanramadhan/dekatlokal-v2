import { test, expect } from '@playwright/test';
import { instrument } from '../../lib/decision-engine';

test('mobile UMKM journey with explicitly simulated API: consent, 32 answers, review, immutable result', async ({ page }, info) => {
  await page.setViewportSize({ width: 360, height: 800 });
  let saved: Record<string, unknown> | null = null;
  await page.route('**/api/digital-checkup/assessment', async route => {
    const request=route.request(), body=request.method()==='GET'?{}:request.postDataJSON();
    if(request.method()==='POST') saved={id:'SIMULATION-ONLY',code:'SIMULASI-UMKM',status:'draft',revision:0,revisionNumber:1,payload:{profile:body.profile,answers:{}},scores:null,run:null};
    if(request.method()==='PATCH')saved={...saved,status:body.final?'submitted':'draft',revision:body.revision+1,payload:{profile:body.profile,answers:body.answers},scores:body.final?Array(8).fill(0):null,submittedAt:body.final?'2026-09-10T00:00:00Z':null};
    if(body.final) await new Promise(resolve=>setTimeout(resolve,800));
    await route.fulfill({json:saved});
  });
  await page.goto('/mulai');
  await expect(page.getByRole('heading',{name:'Usahamu mau ke mana? Yuk, cari langkahnya.'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Mulai Checkup Gratis'})).toBeDisabled();
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Mulai Checkup Gratis'}).click();
  await page.getByRole('button',{name:'Lanjut ke pertanyaan'}).click();
  await expect(page.getByRole('combobox',{name:/^Jenis usaha/})).toBeFocused();
  await page.getByLabel('Nama bisnis',{exact:true}).fill('SIMULASI bisnis');
  await page.getByLabel('Email',{exact:true}).fill('simulation@example.org');
  await page.getByLabel('Nomor WhatsApp',{exact:true}).fill('081234567890');
  await page.getByRole('combobox',{name:/^Jenis usaha/}).selectOption('Makanan & minuman');
  await page.getByRole('combobox',{name:'Provinsi',exact:true}).fill('Sulawesi Selatan');
  expect(await page.getByRole('combobox',{name:'Provinsi',exact:true}).evaluate(el=>parseFloat(getComputedStyle(el).paddingLeft))).toBeGreaterThanOrEqual(39);
  await page.getByRole('option',{name:'Sulawesi Selatan',exact:true}).click();
  await page.getByRole('combobox',{name:'Kota / kabupaten',exact:true}).fill('Makassar');
  await page.screenshot({path:info.outputPath('region-search-mobile.png'),fullPage:true});
  await page.getByRole('option',{name:'Kota Makassar',exact:true}).click();
  await expect(page.getByText('Berpotensi dapat program website gratis',{exact:true})).toBeVisible();
  await expect(page.getByLabel('Lama usaha (bulan)',{exact:true})).toHaveValue('');
  await page.getByLabel('Lama usaha (bulan)',{exact:true}).fill('0');
  await page.getByLabel('Jumlah orang, termasuk pemilik',{exact:true}).fill('1');
  await page.getByRole('checkbox',{name:'WhatsApp',exact:true}).check();
  await page.getByLabel('Apa yang ingin kamu bereskan dalam 30 hari?').fill('SIMULASI: mencatat transaksi');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({path:info.outputPath('profile-region-mobile.png'),fullPage:true});
  await page.getByRole('button',{name:'Lanjut ke pertanyaan'}).click();
  await page.getByRole('button',{name:'Lanjut',exact:true}).click();
  await expect(page.locator('.dc-error[role="alert"]')).toContainText('Q01');
  for(let step=0;step<8;step++){
    await expect(page.getByText(`Bagian ${step+1} dari 8`)).toBeVisible();
    for(const q of instrument.questions.slice(step*4,step*4+4))await page.locator(`#${q.code}-0`).check();
    await expect(page.locator('.dc-error')).toHaveCount(0);
    if(step===0){
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
      await page.screenshot({path:info.outputPath('checkup-mobile.png'),fullPage:true});
    }
    await page.getByRole('button',{name:step===7?'Tinjau jawaban':'Lanjut',exact:true}).click();
  }
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Kirim dan lihat hasil'}).click();
  await expect(page.getByRole('dialog',{name:'Menyiapkan hasil checkup'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Ini gambaran usahamu hari ini.'})).toBeVisible();
  await expect(page.getByText('Jawabanmu sudah tersimpan. Rekomendasi sedang disiapkan.')).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Simpan hasil & mulai belajar'})).toHaveAttribute('href','/masuk');
  await expect(page.getByRole('button',{name:'Perbarui status'})).toHaveCount(0);
  expect(await page.evaluate(()=>Boolean(localStorage.getItem('dekatlokal.checkup.draft.v1')))).toBe(true);
  await page.screenshot({path:info.outputPath('checkup-result-mobile.png'),fullPage:true});
});

test('mobile email OTP UI requests and verifies a simulated code without sending email',async({page},info)=>{
  await page.setViewportSize({width:360,height:800});
  const requests:Record<string,unknown>[]=[];
  await page.route('**/api/digital-checkup/auth',async route=>{
    const body=route.request().postDataJSON(); requests.push(body);
    await route.fulfill({json:{message:body.mode==='otp_request'?'SIMULASI: kode dikirim.':'SIMULASI: kode diverifikasi.'}});
  });
  await page.goto('/masuk');
  await page.getByLabel('Email',{exact:true}).fill('simulation@example.org');
  await page.getByRole('button',{name:'Kirim kode masuk',exact:true}).click();
  await page.getByLabel('Kode dari email',{exact:true}).fill('123456');
  await expect(page.getByRole('button',{name:/Kirim ulang dalam/})).toBeDisabled();
  await page.getByRole('button',{name:'Verifikasi & lanjut',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('kode diverifikasi');
  expect(requests.map(r=>r.mode)).toEqual(['otp_request','otp_verify']);
  expect(requests[1].token).toBe('123456');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({path:info.outputPath('signin-otp-mobile.png'),fullPage:true});
});

test('checkup desktop and sign-in remain usable; unauthorized research is rejected',async({page,request},info)=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/mulai');
  await expect(page.getByRole('heading',{name:'Usahamu mau ke mana? Yuk, cari langkahnya.'})).toBeVisible();
  await page.screenshot({path:info.outputPath('checkup-desktop.png'),fullPage:true});
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Mulai Checkup Gratis'}).click();
  await expect(page.getByRole('heading',{name:'Ceritakan sedikit usahamu.'})).toBeVisible();
  await page.screenshot({path:info.outputPath('profile-desktop.png'),fullPage:true});
  await page.setViewportSize({width:360,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({path:info.outputPath('profile-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/masuk');
  await expect(page.getByRole('button',{name:'Lanjut dengan Google'})).toBeVisible();
  await expect(page.getByLabel('Email',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Kirim kode masuk',exact:true})).toBeVisible();
  await expect(page.getByLabel('Kata sandi admin / ahli',{exact:true})).toHaveCount(0);
  await page.screenshot({path:info.outputPath('signin-desktop.png'),fullPage:true});
  const response=await request.get('/api/digital-checkup/research');
  expect(response.ok()).toBe(false);
  expect(await response.text()).not.toContain('service_role');
  await page.goto('/ahli');
  await expect(page).toHaveURL(/\/ahli$/);
  await expect(page.getByRole('heading',{name:'Penilaian Ahli'})).toBeVisible();
  await expect(page.getByRole('textbox',{name:/email/i})).toHaveCount(0);
  for(const name of ['Ayu Anisela','Asluddin','Rizky Amelia']) await expect(page.getByRole('radio',{name:new RegExp(name)})).toBeVisible();
  await page.screenshot({path:info.outputPath('expert-entry-desktop.png'),fullPage:true});
  await page.setViewportSize({width:360,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({path:info.outputPath('expert-entry-mobile.png'),fullPage:true});
  await page.getByRole('radio',{name:/Ayu Anisela/}).check();
  await page.getByRole('button',{name:'Mulai menilai',exact:true}).click();
  await expect(page.getByLabel('Nama',{exact:true})).toHaveValue('Ayu Anisela');
  await expect(page.getByLabel('Instansi',{exact:true})).toHaveValue('Rumah BUMN Makassar');
  await expect(page.getByLabel('Jabatan',{exact:true})).toHaveValue('CFO');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({path:info.outputPath('expert-workspace-mobile.png'),fullPage:true});
});

test('landing CTA and support links fit mobile and desktop',async({page},info)=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const cta=page.locator('.dl-cta-refined');
  await cta.scrollIntoViewIfNeeded();
  await expect(cta.getByRole('link',{name:'Mulai Checkup Gratis'})).toBeVisible();
  await cta.screenshot({path:info.outputPath('cta-desktop.png')});
  const contact=page.getByRole('link',{name:'Hubungi DekatLokal',exact:true});
  await expect(contact).toHaveAttribute('href',/wa\.me\/6289516335023\?text=/);
  await contact.hover();
  await expect(contact).toHaveCSS('color','rgb(2, 85, 245)');
  await page.setViewportSize({width:360,height:800});
  await cta.scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await cta.screenshot({path:info.outputPath('cta-mobile.png')});
});
