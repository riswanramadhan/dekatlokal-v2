# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing-brand.pw.ts >> headline changes in order without moving the mockup
- Location: tests\e2e\landing-brand.pw.ts:40:5

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('.dl-changing-word')
Expected: "cuan"
Received: "customer"

Call log:
  - Expect "toHaveText" with timeout 4500ms
  - waiting for locator('.dl-changing-word')
    6 × locator resolved to <span class="dl-changing-word">customer</span>
      - unexpected value "customer"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Ke beranda DekatLokal" [ref=e4] [cursor=pointer]:
        - /url: "#beranda"
        - img "DekatLokal" [ref=e5]
      - navigation "Navigasi landing page" [ref=e6]:
        - link "Beranda" [ref=e7] [cursor=pointer]:
          - /url: "#beranda"
        - link "Cara Kerja" [ref=e8] [cursor=pointer]:
          - /url: "#akses-belajar"
        - link "Cerita" [ref=e9] [cursor=pointer]:
          - /url: "#pengalaman"
        - link "Kelas" [ref=e10] [cursor=pointer]:
          - /url: "#course"
        - link "Harga" [ref=e11] [cursor=pointer]:
          - /url: "#paket"
        - link "Tanya Jawab" [ref=e12] [cursor=pointer]:
          - /url: "#faq"
      - generic [ref=e13]:
        - link "Masuk" [ref=e14] [cursor=pointer]:
          - /url: /masuk
        - link "Mulai Cek" [ref=e15] [cursor=pointer]:
          - /url: /mulai
          - text: Mulai Cek
          - img [ref=e16]
    - main [ref=e18]:
      - region "Cek kondisi usahamu. Agar lebih Dekat dengan customer, cuan, pasar, peluang, teknologi, dan pertumbuhan." [ref=e19]:
        - generic [ref=e22]:
          - heading "Cek kondisi usahamu. Agar lebih Dekat dengan customer, cuan, pasar, peluang, teknologi, dan pertumbuhan." [level=1] [ref=e23]:
            - generic [ref=e24]: Cek kondisi usahamu.
            - generic [ref=e25]: Agar lebih Dekat dengan
            - generic [ref=e27]: cuan
            - generic [ref=e28]: customer, cuan, pasar, peluang, teknologi, dan pertumbuhan.
          - paragraph [ref=e29]: Usaha mau maju, tapi bingung mulai dari mana? Cek kondisinya dulu, lalu temukan langkah yang bisa kamu coba hari ini.
          - generic [ref=e30]:
            - link "Cek Usahaku Gratis" [ref=e31] [cursor=pointer]:
              - /url: /mulai
              - text: Cek Usahaku Gratis
              - img [ref=e32]
            - link "Lihat cara kerjanya" [ref=e35] [cursor=pointer]:
              - /url: "#akses-belajar"
          - list "Informasi Digital Checkup" [ref=e36]:
            - listitem [ref=e37]:
              - img [ref=e38]
              - text: Gratis
            - listitem [ref=e41]:
              - img [ref=e42]
              - text: Cuma 5–7 menit
            - listitem [ref=e45]:
              - img [ref=e46]
              - text: Hasil langsung
        - img "Pratinjau ruang belajar DekatLokal" [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e57]:
              - img [ref=e58]
              - generic [ref=e62]: digitalcheckup.dekatlokal.com/app
            - generic [ref=e66]:
              - complementary [ref=e67]:
                - generic [ref=e68]:
                  - img [ref=e69]
                  - strong [ref=e70]: DekatLokal
                - generic [ref=e71]: Ruang belajar
                - generic [ref=e72]:
                  - generic [ref=e73]:
                    - img [ref=e74]
                    - text: Ringkasan
                  - generic [ref=e79]:
                    - img [ref=e80]
                    - text: Kelas saya
                  - generic [ref=e83]:
                    - img [ref=e84]
                    - text: Hasil praktik
                  - generic [ref=e88]:
                    - img [ref=e89]
                    - text: Pencapaian
                - generic [ref=e95]:
                  - img [ref=e97]
                  - strong [ref=e100]: Langkah berikutnya
                  - paragraph [ref=e101]: Lanjut satu materi lagi hari ini.
              - generic [ref=e102]:
                - generic [ref=e103]:
                  - generic [ref=e104]:
                    - img [ref=e105]
                    - generic [ref=e108]: Cari materi belajar...
                  - generic [ref=e110]: SA
                - generic [ref=e112]:
                  - generic [ref=e113]:
                    - generic [ref=e114]:
                      - generic [ref=e115]: Ruang belajarmu
                      - heading [level=2] [ref=e116]: Selamat Datang, Sarah!
                      - paragraph [ref=e117]: Belajar sebentar, coba langsung di usahamu.
                    - generic [ref=e118]:
                      - img [ref=e119]
                      - text: Level Bertumbuh
                  - generic [ref=e122]:
                    - article [ref=e123]:
                      - img [ref=e125]
                      - generic [ref=e127]:
                        - paragraph [ref=e128]: Progres belajar
                        - strong [ref=e129]: 67%
                        - generic [ref=e130]: 6 dari 9 materi
                    - article [ref=e131]:
                      - img [ref=e133]
                      - generic [ref=e136]:
                        - paragraph [ref=e137]: Kelas aktif
                        - strong [ref=e138]: "3"
                        - generic [ref=e139]: Siap dilanjutkan
                    - article [ref=e140]:
                      - img [ref=e142]
                      - generic [ref=e144]:
                        - paragraph [ref=e145]: Belajar rutin
                        - strong [ref=e146]: 7 hari
                        - generic [ref=e147]: Terus pertahankan
                  - generic [ref=e148]:
                    - generic [ref=e149]:
                      - text: Kelas untukmu
                      - heading [level=3] [ref=e150]: Lanjutkan belajar
                    - generic [ref=e151]:
                      - text: Lihat semua
                      - img [ref=e152]
                  - generic [ref=e154]:
                    - article [ref=e155]:
                      - generic [ref=e156]:
                        - generic [ref=e157]: "01"
                        - img [ref=e159]
                      - generic [ref=e162]:
                        - generic [ref=e163]: Sedang dipelajari
                        - generic [ref=e164]: Fondasi Usaha
                        - heading [level=4] [ref=e165]: Brand yang Mudah Diingat
                        - strong [ref=e169]: 72%
                        - paragraph [ref=e170]:
                          - img [ref=e171]
                          - text: 12 menit tersisa
                    - article [ref=e174]:
                      - generic [ref=e175]:
                        - generic [ref=e176]: "02"
                        - img [ref=e178]
                      - generic [ref=e181]:
                        - generic [ref=e182]: Rekomendasi
                        - generic [ref=e183]: Pemasaran
                        - heading [level=4] [ref=e184]: Konten yang Bantu Jualan
                        - strong [ref=e188]: 46%
                        - paragraph [ref=e189]:
                          - img [ref=e190]
                          - text: 12 menit tersisa
                    - article [ref=e193]:
                      - generic [ref=e194]:
                        - generic [ref=e195]: "03"
                        - img [ref=e197]
                      - generic [ref=e200]:
                        - generic [ref=e201]: Wajib
                        - generic [ref=e202]: Keuangan
                        - heading [level=4] [ref=e203]: Catatan Keuangan Praktis
                        - strong [ref=e207]: 28%
                        - paragraph [ref=e208]:
                          - img [ref=e209]
                          - text: 12 menit tersisa
        - generic "Usaha lokal bersama DekatLokal" [ref=e212]:
          - paragraph [ref=e213]: Bareng usaha lokal, tumbuh selangkah lagi
          - generic [ref=e215]:
            - img "Aroma Bakery" [ref=e217]
            - img "Bakpia Malino" [ref=e219]
            - img "Banangih" [ref=e221]
            - img "Bio Atama" [ref=e223]
            - img "Dapur Karaeng" [ref=e225]
            - img "Eyfa Natural Oil" [ref=e227]
            - img "Gingerfit Plus" [ref=e229]
            - img "Growmates" [ref=e231]
            - img "Iboo IDN" [ref=e233]
            - img "Kira Kira Michi" [ref=e235]
            - img "Kopi Teko" [ref=e237]
            - img "Kareppe" [ref=e239]
            - img "Minyak Pamboang" [ref=e241]
            - img "Mulkan Mimbaun" [ref=e243]
            - img "Rumah Keripik" [ref=e245]
            - img "Sikola Indonesia" [ref=e247]
            - img "Synergy Unhas" [ref=e249]
            - img "With Soerai" [ref=e251]
      - region "Mulai dari yang penting. Lanjut tanpa bingung." [ref=e270]:
        - generic [ref=e271]:
          - article [ref=e272]:
            - generic [ref=e273]:
              - paragraph [ref=e274]: Cara kerjanya
              - heading "Mulai dari yang penting. Lanjut tanpa bingung." [level=2] [ref=e275]
              - paragraph [ref=e276]: Nggak perlu mengerjakan semuanya sekaligus. Mulai dari hal yang paling dibutuhkan usahamu, lalu lanjut satu per satu.
          - generic [ref=e277]:
            - article [ref=e278]:
              - img [ref=e280]
              - generic [ref=e287]:
                - generic [ref=e288]: 01 / Cek Usahaku Gratis
                - heading "Ceritakan kondisi usahamu" [level=3] [ref=e289]
                - paragraph [ref=e290]: Jawab pertanyaan sederhana dalam 5-7 menit.
              - img "Pemilik UMKM memulai Digital Checkup melalui ponsel" [ref=e292]
            - article [ref=e293]:
              - img [ref=e295]
              - generic [ref=e297]:
                - generic [ref=e298]: 02 / Pahami hasil
                - heading "Lihat tiga fokus utama" [level=3] [ref=e299]
                - paragraph [ref=e300]: Temukan apa yang perlu dikerjakan lebih dahulu dan alasannya.
              - img "Pemilik usaha meninjau hasil analisis usahanya" [ref=e302]
            - article [ref=e303]:
              - img [ref=e305]
              - generic [ref=e309]:
                - generic [ref=e310]: 03 / Langsung praktik
                - heading "Kerjakan langsung di usaha" [level=3] [ref=e311]
                - paragraph [ref=e312]: Coba latihan sederhana untuk produk, promosi, atau catatan usahamu.
              - img "Pelaku UMKM menerapkan aksi pada produk usahanya" [ref=e314]
            - article [ref=e315]:
              - img [ref=e317]
              - generic [ref=e320]:
                - generic [ref=e321]: 04 / Lanjut belajar
                - heading "Belajar dari mana saja" [level=3] [ref=e322]
                - paragraph [ref=e323]: Belajar sebentar dulu, lanjut lagi saat ada waktu.
              - img "Pemilik UMKM belajar course menggunakan laptop" [ref=e325]
      - region "Bukan soal langsung besar. Soal terus bergerak." [ref=e326]:
        - generic [ref=e327]:
          - generic [ref=e328]:
            - paragraph [ref=e329]: Cerita perjalanan UMKM
            - heading "Bukan soal langsung besar. Soal terus bergerak." [level=2] [ref=e330]
          - paragraph [ref=e331]: Kenalan dengan usaha lokal yang terus belajar, merapikan jualan, dan mencoba hal baru.
        - region "Cerita perjalanan UMKM" [ref=e332]:
          - generic [ref=e335]:
            - article [ref=e336]:
              - generic [ref=e337]:
                - img [ref=e338]
                - generic [ref=e339]: Produk alami
              - generic [ref=e340]:
                - paragraph [ref=e341]: Produk bagus butuh pesan yang gampang dipahami. Bio Atama merapikan cara menjelaskan manfaat produknya supaya calon pelanggan tidak perlu menebak.
                - generic [ref=e342]:
                  - img [ref=e344]
                  - generic [ref=e345]:
                    - strong [ref=e346]: Bio Atama
                    - generic [ref=e347]: Perjalanan usaha lokal
            - article [ref=e348]:
              - generic [ref=e349]:
                - img "Tim Eyfa Natural Oil dalam perjalanan pengembangan usaha" [ref=e350]
                - generic [ref=e351]: Perawatan alami
              - generic [ref=e352]:
                - paragraph [ref=e353]: Identitas yang konsisten bikin produk lebih mudah dikenali. Eyfa mulai dari tampilan sederhana yang bisa dipakai di setiap tempat jualan.
                - generic [ref=e354]:
                  - img "Logo Eyfa Natural Oil" [ref=e356]
                  - generic [ref=e357]:
                    - strong [ref=e358]: Eyfa Natural Oil
                    - generic [ref=e359]: Perjalanan usaha lokal
            - article [ref=e360]:
              - generic [ref=e361]:
                - img "Tim Gingerfit Plus menunjukkan perkembangan usaha" [ref=e362]
                - generic [ref=e363]: Minuman herbal
              - generic [ref=e364]:
                - paragraph [ref=e365]: Bertumbuh tidak harus serba sekaligus. Gingerfit memilih prioritas yang paling dekat, mengerjakannya, lalu lanjut ke langkah berikutnya.
                - generic [ref=e366]:
                  - img "Logo Gingerfit Plus" [ref=e368]
                  - generic [ref=e369]:
                    - strong [ref=e370]: Gingerfit Plus
                    - generic [ref=e371]: Perjalanan usaha lokal
            - article [ref=e372]:
              - generic [ref=e373]:
                - img "Tim Iboo IDN dalam perjalanan pengembangan usaha" [ref=e374]
                - generic [ref=e375]: Produk lokal
              - generic [ref=e376]:
                - paragraph [ref=e377]: Saat rencana usaha lebih jelas, bikin konten dan mengambil keputusan terasa lebih ringan. Iboo IDN memulai dari hal yang paling berdampak.
                - generic [ref=e378]:
                  - img "Logo Iboo IDN" [ref=e380]
                  - generic [ref=e381]:
                    - strong [ref=e382]: Iboo IDN
                    - generic [ref=e383]: Perjalanan usaha lokal
            - article [ref=e384]:
              - generic [ref=e385]:
                - img [ref=e386]
                - generic [ref=e387]: Kuliner
              - generic [ref=e388]:
                - paragraph [ref=e389]: Cerita produk yang kuat membuat orang lebih mudah ingat. Kareppe menyusun tampilan online agar karakter produknya tetap terasa di layar.
                - generic [ref=e390]:
                  - img [ref=e392]
                  - generic [ref=e393]:
                    - strong [ref=e394]: Kareppe
                    - generic [ref=e395]: Perjalanan usaha lokal
            - article [ref=e396]:
              - generic [ref=e397]:
                - img [ref=e398]
                - generic [ref=e399]: Kuliner kreatif
              - generic [ref=e400]:
                - paragraph [ref=e401]: Ide kreatif jadi lebih kuat saat tampilannya konsisten. Kira Kira Michi menyatukan identitas, konten, dan pengalaman pelanggan.
                - generic [ref=e402]:
                  - img [ref=e404]
                  - generic [ref=e405]:
                    - strong [ref=e406]: Kira Kira Michi
                    - generic [ref=e407]: Perjalanan usaha lokal
            - article [ref=e408]:
              - generic [ref=e409]:
                - img [ref=e410]
                - generic [ref=e411]: Kopi lokal
              - generic [ref=e412]:
                - paragraph [ref=e413]: Kopi Teko merapikan informasi produk dan cara pemesanan agar pelanggan bisa menemukan, memahami, lalu membeli dengan lebih mudah.
                - generic [ref=e414]:
                  - img [ref=e416]
                  - generic [ref=e417]:
                    - strong [ref=e418]: Kopi Teko
                    - generic [ref=e419]: Perjalanan usaha lokal
            - article [ref=e420]:
              - generic [ref=e421]:
                - img [ref=e422]
                - generic [ref=e423]: Produk tradisional
              - generic [ref=e424]:
                - paragraph [ref=e425]: Produk lokal punya cerita yang layak dikenal lebih luas. Minyak Pamboang membawanya ke ruang digital dengan langkah yang bisa dikerjakan satu per satu.
                - generic [ref=e426]:
                  - img [ref=e428]
                  - generic [ref=e429]:
                    - strong [ref=e430]: Minyak Pamboang
                    - generic [ref=e431]: Perjalanan usaha lokal
            - article [ref=e432]:
              - generic [ref=e433]:
                - img [ref=e434]
                - generic [ref=e435]: Produk lokal
              - generic [ref=e436]:
                - paragraph [ref=e437]: Mulkan Mimbaun mengubah target besar menjadi langkah kecil yang jelas. Jadi lebih mudah dimulai dan dilanjutkan.
                - generic [ref=e438]:
                  - img [ref=e440]
                  - generic [ref=e441]:
                    - strong [ref=e442]: Mulkan Mimbaun
                    - generic [ref=e443]: Perjalanan usaha lokal
            - article [ref=e444]:
              - generic [ref=e445]:
                - img [ref=e446]
                - generic [ref=e447]: Camilan
              - generic [ref=e448]:
                - paragraph [ref=e449]: Rumah Keripik mulai dari informasi produk yang rapi, supaya promosi tidak cuma ramai sesaat tetapi benar-benar membantu penjualan.
                - generic [ref=e450]:
                  - img [ref=e452]
                  - generic [ref=e453]:
                    - strong [ref=e454]: Rumah Keripik
                    - generic [ref=e455]: Perjalanan usaha lokal
          - generic:
            - button "Cerita sebelumnya" [ref=e456] [cursor=pointer]:
              - img [ref=e457]
            - button "Cerita berikutnya" [ref=e459] [cursor=pointer]:
              - img [ref=e460]
          - generic [ref=e462]:
            - group "Pilih kelompok cerita" [ref=e463]:
              - button "Tampilkan kelompok cerita 1" [ref=e464] [cursor=pointer]
              - button "Tampilkan kelompok cerita 2" [pressed] [ref=e466] [cursor=pointer]
              - button "Tampilkan kelompok cerita 3" [ref=e468] [cursor=pointer]
              - button "Tampilkan kelompok cerita 4" [ref=e470] [cursor=pointer]
              - button "Tampilkan kelompok cerita 5" [ref=e472] [cursor=pointer]
              - button "Tampilkan kelompok cerita 6" [ref=e474] [cursor=pointer]
              - button "Tampilkan kelompok cerita 7" [ref=e476] [cursor=pointer]
              - button "Tampilkan kelompok cerita 8" [ref=e478] [cursor=pointer]
            - generic [ref=e481]: 02 / 08
      - region "Belajar seperlunya. Praktikkan setelahnya." [ref=e482]:
        - generic [ref=e483]:
          - generic [ref=e484]:
            - paragraph [ref=e485]: Belajar yang langsung kepakai
            - heading "Belajar seperlunya. Praktikkan setelahnya." [level=2] [ref=e486]
            - paragraph [ref=e487]: Materi singkat dan contoh sehari-hari. Selesai belajar, langsung coba untuk jualanmu.
          - generic [ref=e488]:
            - article [ref=e489]:
              - generic [ref=e490]:
                - img "Pelaku UMKM merapikan tampilan online usahanya" [ref=e491]
                - generic [ref=e492]:
                  - generic [ref=e493]: Gratis
                  - generic [ref=e494]: Prioritas
              - generic [ref=e495]:
                - generic [ref=e496]:
                  - generic [ref=e497]: Kelas DekatLokal
                  - generic [ref=e498]: Digitalisasi
                - heading "Mulai Jualan Online" [level=3] [ref=e499]
                - paragraph [ref=e500]: Bikin usahamu lebih mudah ditemukan dan dihubungi pelanggan lewat internet.
                - generic [ref=e501]:
                  - generic [ref=e502]:
                    - img [ref=e503]
                    - generic [ref=e505]:
                      - strong [ref=e506]: Fokus
                      - text: Mulai jualan online
                  - generic [ref=e507]:
                    - img [ref=e508]
                    - generic [ref=e511]:
                      - strong [ref=e512]: Durasi
                      - text: 20-30 menit
                  - generic [ref=e513]:
                    - img [ref=e514]
                    - generic [ref=e517]:
                      - strong [ref=e518]: Akses
                      - text: Terbuka setelah Checkup
                - generic [ref=e519]:
                  - generic [ref=e520]:
                    - generic [ref=e521]: Mulai dari
                    - strong [ref=e523]: Rp0
                  - generic [ref=e524]: Fondasi
                - generic "Aksi untuk Digitalisasi UMKM" [ref=e525]:
                  - link "Masuk untuk belajar" [ref=e526] [cursor=pointer]:
                    - /url: /masuk
                    - text: Masuk untuk belajar
                    - img [ref=e527]
            - article [ref=e529]:
              - generic [ref=e530]:
                - img "Proses menyusun identitas visual usaha lokal" [ref=e531]
                - generic [ref=e532]:
                  - generic [ref=e533]: Gratis
                  - generic [ref=e534]: Prioritas
              - generic [ref=e535]:
                - generic [ref=e536]:
                  - generic [ref=e537]: Kelas DekatLokal
                  - generic [ref=e538]: Branding
                - heading "Bikin Usaha Mudah Diingat" [level=3] [ref=e539]
                - paragraph [ref=e540]: Rapikan nama, tampilan, dan cerita usahamu supaya pelanggan gampang mengenalinya.
                - generic [ref=e541]:
                  - generic [ref=e542]:
                    - img [ref=e543]
                    - generic [ref=e545]:
                      - strong [ref=e546]: Fokus
                      - text: Usaha mudah dikenali
                  - generic [ref=e547]:
                    - img [ref=e548]
                    - generic [ref=e551]:
                      - strong [ref=e552]: Durasi
                      - text: 25-35 menit
                  - generic [ref=e553]:
                    - img [ref=e554]
                    - generic [ref=e557]:
                      - strong [ref=e558]: Akses
                      - text: Terbuka setelah Checkup
                - generic [ref=e559]:
                  - generic [ref=e560]:
                    - generic [ref=e561]: Mulai dari
                    - strong [ref=e563]: Rp0
                  - generic [ref=e564]: Fondasi
                - generic "Aksi untuk Branding UMKM" [ref=e565]:
                  - link "Masuk untuk belajar" [ref=e566] [cursor=pointer]:
                    - /url: /masuk
                    - text: Masuk untuk belajar
                    - img [ref=e567]
            - article [ref=e569]:
              - generic [ref=e570]:
                - img "Pemilik UMKM menata kemasan produk" [ref=e571]
                - generic [ref=e572]:
                  - generic [ref=e573]: Gratis
                  - generic [ref=e574]: Prioritas
              - generic [ref=e575]:
                - generic [ref=e576]:
                  - generic [ref=e577]: Kelas DekatLokal
                  - generic [ref=e578]: Penjualan
                - heading "Produk Rapi, Kemasan Menarik" [level=3] [ref=e579]
                - paragraph [ref=e580]: Buat informasi produk dan kemasan yang jelas agar pelanggan lebih yakin membeli.
                - generic [ref=e581]:
                  - generic [ref=e582]:
                    - img [ref=e583]
                    - generic [ref=e585]:
                      - strong [ref=e586]: Fokus
                      - text: Info produk jelas
                  - generic [ref=e587]:
                    - img [ref=e588]
                    - generic [ref=e591]:
                      - strong [ref=e592]: Durasi
                      - text: 25-35 menit
                  - generic [ref=e593]:
                    - img [ref=e594]
                    - generic [ref=e597]:
                      - strong [ref=e598]: Akses
                      - text: Terbuka setelah Checkup
                - generic [ref=e599]:
                  - generic [ref=e600]:
                    - generic [ref=e601]: Mulai dari
                    - strong [ref=e603]: Rp0
                  - generic [ref=e604]: Fondasi
                - generic "Aksi untuk Produk dan Kemasan" [ref=e605]:
                  - link "Masuk untuk belajar" [ref=e606] [cursor=pointer]:
                    - /url: /masuk
                    - text: Masuk untuk belajar
                    - img [ref=e607]
            - article [ref=e609]:
              - generic [ref=e610]:
                - img "Pembuatan konten promosi produk UMKM" [ref=e611]
                - generic [ref=e613]: Gratis
              - generic [ref=e614]:
                - generic [ref=e615]:
                  - generic [ref=e616]: Kelas DekatLokal
                  - generic [ref=e617]: Penjualan
                - heading "Promosi Nggak Putus-Putus" [level=3] [ref=e618]
                - paragraph [ref=e619]: Susun ide dan jadwal konten sederhana supaya promosi tetap jalan di sela jualan.
                - generic [ref=e620]:
                  - generic [ref=e621]:
                    - img [ref=e622]
                    - generic [ref=e624]:
                      - strong [ref=e625]: Fokus
                      - text: Promosi rutin
                  - generic [ref=e626]:
                    - img [ref=e627]
                    - generic [ref=e630]:
                      - strong [ref=e631]: Durasi
                      - text: 20-30 menit
                  - generic [ref=e632]:
                    - img [ref=e633]
                    - generic [ref=e636]:
                      - strong [ref=e637]: Akses
                      - text: Terbuka setelah Checkup
                - generic [ref=e638]:
                  - generic [ref=e639]:
                    - generic [ref=e640]: Mulai dari
                    - strong [ref=e642]: Rp0
                  - generic [ref=e643]: Fondasi
                - generic "Aksi untuk Konsistensi Promosi" [ref=e644]:
                  - link "Masuk untuk belajar" [ref=e645] [cursor=pointer]:
                    - /url: /masuk
                    - text: Masuk untuk belajar
                    - img [ref=e646]
            - article [ref=e648]:
              - generic [ref=e649]:
                - img "Pemilik usaha mengelola pesanan dari tempat jualan" [ref=e650]
                - generic [ref=e652]: Premium
              - generic [ref=e653]:
                - generic [ref=e654]:
                  - generic [ref=e655]: Kelas DekatLokal
                  - generic [ref=e656]: Penjualan
                - heading "Tambah Tempat Jualan" [level=3] [ref=e657]
                - paragraph [ref=e658]: Pilih tempat jualan online yang cocok dan rapikan cara menerima pesanan.
                - generic [ref=e659]:
                  - generic [ref=e660]:
                    - img [ref=e661]
                    - generic [ref=e663]:
                      - strong [ref=e664]: Fokus
                      - text: Tempat jualan
                  - generic [ref=e665]:
                    - img [ref=e666]
                    - generic [ref=e669]:
                      - strong [ref=e670]: Durasi
                      - text: 35-45 menit
                  - generic [ref=e671]:
                    - img [ref=e672]
                    - generic [ref=e676]:
                      - strong [ref=e677]: Akses
                      - text: Selesaikan tiga kelas dasar.
                - generic [ref=e678]:
                  - generic [ref=e679]:
                    - generic [ref=e680]: Mulai dari
                    - strong [ref=e682]: Rp99.000
                  - generic [ref=e683]: Lanjutan
                - generic "Aksi untuk Marketplace dan Kanal Penjualan" [ref=e684]:
                  - link "Masuk untuk belajar" [ref=e685] [cursor=pointer]:
                    - /url: /masuk
                    - text: Masuk untuk belajar
                    - img [ref=e686]
            - article [ref=e688]:
              - generic [ref=e689]:
                - img "Pencatatan operasional dan keuangan usaha kecil" [ref=e690]
                - generic [ref=e692]: Premium
              - generic [ref=e693]:
                - generic [ref=e694]:
                  - generic [ref=e695]: Kelas DekatLokal
                  - generic [ref=e696]: Operasional
                - heading "Catat Uang, Rapikan Usaha" [level=3] [ref=e697]
                - paragraph [ref=e698]: Pisahkan uang pribadi dan usaha, lalu catat pemasukan dan pengeluaran harian.
                - generic [ref=e699]:
                  - generic [ref=e700]:
                    - img [ref=e701]
                    - generic [ref=e703]:
                      - strong [ref=e704]: Fokus
                      - text: Catatan usaha
                  - generic [ref=e705]:
                    - img [ref=e706]
                    - generic [ref=e709]:
                      - strong [ref=e710]: Durasi
                      - text: 35-45 menit
                  - generic [ref=e711]:
                    - img [ref=e712]
                    - generic [ref=e716]:
                      - strong [ref=e717]: Akses
                      - text: Selesaikan tiga kelas dasar.
                - generic [ref=e718]:
                  - generic [ref=e719]:
                    - generic [ref=e720]: Mulai dari
                    - strong [ref=e722]: Rp99.000
                  - generic [ref=e723]: Lanjutan
                - generic "Aksi untuk Operasional dan Keuangan Dasar" [ref=e724]:
                  - link "Masuk untuk belajar" [ref=e725] [cursor=pointer]:
                    - /url: /masuk
                    - text: Masuk untuk belajar
                    - img [ref=e726]
            - article [ref=e728]:
              - generic [ref=e729]:
                - img "Dokumen legalitas usaha sedang disiapkan" [ref=e730]
                - generic [ref=e732]: Premium
              - generic [ref=e733]:
                - generic [ref=e734]:
                  - generic [ref=e735]: Kelas DekatLokal
                  - generic [ref=e736]: Legalitas
                - heading "Urus Dokumen Usaha" [level=3] [ref=e737]
                - paragraph [ref=e738]: Kenali dokumen yang dibutuhkan usahamu dan pelajari langkah mengurusnya.
                - generic [ref=e739]:
                  - generic [ref=e740]:
                    - img [ref=e741]
                    - generic [ref=e743]:
                      - strong [ref=e744]: Fokus
                      - text: Dokumen usaha
                  - generic [ref=e745]:
                    - img [ref=e746]
                    - generic [ref=e749]:
                      - strong [ref=e750]: Durasi
                      - text: 30-40 menit
                  - generic [ref=e751]:
                    - img [ref=e752]
                    - generic [ref=e756]:
                      - strong [ref=e757]: Akses
                      - text: Selesaikan tiga kelas dasar.
                - generic [ref=e758]:
                  - generic [ref=e759]:
                    - generic [ref=e760]: Mulai dari
                    - strong [ref=e762]: Rp99.000
                  - generic [ref=e763]: Lanjutan
                - generic "Aksi untuk Legalitas Usaha" [ref=e764]:
                  - link "Masuk untuk belajar" [ref=e765] [cursor=pointer]:
                    - /url: /masuk
                    - text: Masuk untuk belajar
                    - img [ref=e766]
            - article [ref=e768]:
              - generic [ref=e769]:
                - img "Pemilik UMKM menyusun rencana pertumbuhan" [ref=e770]
                - generic [ref=e772]: Premium
              - generic [ref=e773]:
                - generic [ref=e774]:
                  - generic [ref=e775]: Kelas DekatLokal
                  - generic [ref=e776]: Pengembangan
                - heading "Bikin Rencana yang Jalan" [level=3] [ref=e777]
                - paragraph [ref=e778]: Ubah target besar jadi langkah kecil yang bisa kamu kerjakan setiap minggu.
                - generic [ref=e779]:
                  - generic [ref=e780]:
                    - img [ref=e781]
                    - generic [ref=e783]:
                      - strong [ref=e784]: Fokus
                      - text: Rencana usaha
                  - generic [ref=e785]:
                    - img [ref=e786]
                    - generic [ref=e789]:
                      - strong [ref=e790]: Durasi
                      - text: 30-40 menit
                  - generic [ref=e791]:
                    - img [ref=e792]
                    - generic [ref=e796]:
                      - strong [ref=e797]: Akses
                      - text: Selesaikan tiga kelas dasar.
                - generic [ref=e798]:
                  - generic [ref=e799]:
                    - generic [ref=e800]: Mulai dari
                    - strong [ref=e802]: Rp99.000
                  - generic [ref=e803]: Lanjutan
                - generic "Aksi untuk Komitmen dan Growth Mindset" [ref=e804]:
                  - link "Masuk untuk belajar" [ref=e805] [cursor=pointer]:
                    - /url: /masuk
                    - text: Masuk untuk belajar
                    - img [ref=e806]
      - region "Mulai gratis. Naik level saat sudah siap." [ref=e808]:
        - generic [ref=e809]:
          - generic [ref=e810]:
            - generic [ref=e811]:
              - paragraph [ref=e812]: Pilih sesuai kebutuhan
              - heading "Mulai gratis. Naik level saat sudah siap." [level=2] [ref=e813]
              - paragraph [ref=e814]: Bereskan fondasinya dulu. Kalau butuh pendampingan lebih jauh, pilih paket yang benar-benar cocok dengan tujuanmu.
            - generic "Pilih paket DekatLokal" [ref=e815]:
              - button "Fondasi Gratis Mulai dari kondisi usaha dan tuntaskan tiga fokus paling penting. Rp0" [pressed] [ref=e816] [cursor=pointer]:
                - generic [ref=e818]:
                  - strong [ref=e819]: Fondasi Gratis
                  - generic [ref=e820]: Mulai dari kondisi usaha dan tuntaskan tiga fokus paling penting.
                - generic [ref=e821]: Rp0
              - button "Tumbuh Terarah Lanjut belajar dan bangun tampilan online usahamu. Rp249.000" [ref=e822] [cursor=pointer]:
                - generic [ref=e824]:
                  - strong [ref=e825]: Tumbuh Terarah
                  - generic [ref=e826]: Lanjut belajar dan bangun tampilan online usahamu.
                - generic [ref=e827]: Rp249.000
              - button "Pendampingan Naik Kelas Dapatkan masukan untuk promosi, website, dan rencana usahamu. Rp799.000" [ref=e828] [cursor=pointer]:
                - generic [ref=e830]:
                  - strong [ref=e831]: Pendampingan Naik Kelas
                  - generic [ref=e832]: Dapatkan masukan untuk promosi, website, dan rencana usahamu.
                - generic [ref=e833]: Rp799.000
          - article [ref=e834]:
            - generic [ref=e836]:
              - generic [ref=e837]: Paket 01
              - heading "Fondasi Gratis" [level=3] [ref=e838]
            - generic [ref=e839]:
              - strong [ref=e840]: Rp0
              - generic [ref=e841]: tanpa biaya
            - link "Mulai Gratis" [ref=e842] [cursor=pointer]:
              - /url: /mulai
              - generic [ref=e843]: Mulai Gratis
              - img [ref=e844]
            - paragraph [ref=e846]: Mulai dari kondisi usaha dan tuntaskan tiga fokus paling penting.
            - generic [ref=e847]:
              - heading "Yang kamu dapatkan" [level=4] [ref=e848]
              - list [ref=e849]:
                - listitem [ref=e850]:
                  - img [ref=e852]
                  - text: Cek delapan bagian penting usahamu
                - listitem [ref=e854]:
                  - img [ref=e856]
                  - text: Tiga kelas dasar sesuai kebutuhanmu
                - listitem [ref=e858]:
                  - img [ref=e860]
                  - text: Kuis dan tugas praktik usaha
                - listitem [ref=e862]:
                  - img [ref=e864]
                  - text: Simpan hasil praktik dan perkembangan belajar
            - paragraph [ref=e868]:
              - strong [ref=e869]: Mulai tanpa biaya
              - text: Cek usahamu dulu. Pilih langkah berikutnya setelah melihat hasilnya.
        - paragraph [ref=e870]: Mulai dari yang gratis dulu. Paket berbayar belum dibuka; kamu bisa tanya tim kami sebelum memilih.
      - region "Masih ada yang bikin ragu?" [ref=e871]:
        - generic [ref=e872]:
          - generic [ref=e873]:
            - paragraph [ref=e876]: FAQ
            - heading "Masih ada yang bikin ragu?" [level=2] [ref=e877]
          - generic [ref=e878]:
            - region "Tentang Digital Checkup" [ref=e879]:
              - heading "Tentang Digital Checkup" [level=3] [ref=e880]
              - generic [ref=e881]:
                - group [ref=e882]:
                  - generic "Apakah Digital Checkup DekatLokal gratis?" [ref=e883] [cursor=pointer]:
                    - generic [ref=e884]: Apakah Digital Checkup DekatLokal gratis?
                  - paragraph [ref=e886]: Iya, gratis. Jawab pertanyaan tentang usahamu, lalu lihat apa yang sudah bagus dan apa yang perlu kamu perbaiki dulu.
                - group [ref=e887]:
                  - generic "Apa yang saya dapat setelah mengisi Checkup?" [ref=e888] [cursor=pointer]:
                    - generic [ref=e889]: Apa yang saya dapat setelah mengisi Checkup?
                - group [ref=e891]:
                  - generic "Apakah harus punya akun dulu?" [ref=e892] [cursor=pointer]:
                    - generic [ref=e893]: Apakah harus punya akun dulu?
            - region "Tentang Ruang Tumbuh" [ref=e895]:
              - heading "Tentang Ruang Tumbuh" [level=3] [ref=e896]
              - generic [ref=e897]:
                - group [ref=e898]:
                  - generic "Kalau saya belum terbiasa teknologi, apakah tetap bisa ikut?" [ref=e899] [cursor=pointer]:
                    - generic [ref=e900]: Kalau saya belum terbiasa teknologi, apakah tetap bisa ikut?
                - group [ref=e902]:
                  - generic "Apakah hasil Checkup langsung membuat saya dapat website gratis?" [ref=e903] [cursor=pointer]:
                    - generic [ref=e904]: Apakah hasil Checkup langsung membuat saya dapat website gratis?
                - group [ref=e906]:
                  - generic "Untuk apa data usaha saya dipakai?" [ref=e907] [cursor=pointer]:
                    - generic [ref=e908]: Untuk apa data usaha saya dipakai?
      - region "Usahamu punya peluang. Yuk, cari langkah berikutnya." [ref=e910]:
        - generic [ref=e913]:
          - paragraph [ref=e914]: Langkah kecil, mulai hari ini
          - heading "Usahamu punya peluang. Yuk, cari langkah berikutnya." [level=2] [ref=e915]
          - paragraph [ref=e916]: Luangkan 5–7 menit untuk cek usahamu. Lihat yang perlu dibenahi, lalu mulai dari yang paling mudah.
          - link "Cek Usahaku Sekarang" [ref=e918] [cursor=pointer]:
            - /url: /mulai
            - text: Cek Usahaku Sekarang
            - img [ref=e919]
    - contentinfo [ref=e922]:
      - generic [ref=e923]:
        - generic [ref=e924]:
          - img "DekatLokal" [ref=e925]
          - paragraph [ref=e926]: Teman belajar pemilik usaha. Cek kondisi jualanmu, temukan yang perlu dibenahi, lalu coba langkah kecil setiap hari.
          - link "hello@dekatlokal.com" [ref=e927] [cursor=pointer]:
            - /url: mailto:hello@dekatlokal.com
          - generic [ref=e928]: Indonesia
        - generic [ref=e929]:
          - heading "Platform" [level=2] [ref=e930]
          - link "Digital Checkup" [ref=e931] [cursor=pointer]:
            - /url: /mulai
          - link "Cara Kerja" [ref=e932] [cursor=pointer]:
            - /url: "#akses-belajar"
          - link "Kelas" [ref=e933] [cursor=pointer]:
            - /url: "#course"
          - link "Harga" [ref=e934] [cursor=pointer]:
            - /url: "#paket"
        - generic [ref=e935]:
          - heading "Ruang Tumbuh" [level=2] [ref=e936]
          - link "Mulai Belajar" [ref=e937] [cursor=pointer]:
            - /url: /masuk
          - link "Perkembangan Belajar" [ref=e938] [cursor=pointer]:
            - /url: /masuk
          - link "Hasil Praktik" [ref=e939] [cursor=pointer]:
            - /url: /masuk
        - generic [ref=e940]:
          - heading "Dukungan" [level=2] [ref=e941]
          - link "Masuk" [ref=e942] [cursor=pointer]:
            - /url: /masuk
          - link "Bantuan" [ref=e943] [cursor=pointer]:
            - /url: mailto:hello@dekatlokal.com
          - link "Hubungi Kami" [ref=e944] [cursor=pointer]:
            - /url: mailto:hello@dekatlokal.com
      - generic [ref=e945]: DekatLokal
      - generic [ref=e946]:
        - generic [ref=e947]: © 2026 DekatLokal. Hak cipta dilindungi.
        - generic [ref=e948]:
          - link "Kebijakan Privasi" [ref=e949] [cursor=pointer]:
            - /url: https://dekatlokal.com/privacy-policy
          - link "Syarat & Ketentuan" [ref=e950] [cursor=pointer]:
            - /url: https://dekatlokal.com/terms-of-service
        - generic [ref=e951]: UMKM bertumbuh, satu langkah lebih dekat.
  - button "Open Next.js Dev Tools" [ref=e957] [cursor=pointer]:
    - generic [ref=e960]:
      - text: Compiling
      - generic [ref=e961]:
        - generic [ref=e962]: .
        - generic [ref=e963]: .
        - generic [ref=e964]: .
  - alert [ref=e965]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test.setTimeout(90_000);
  4   | 
  5   | for (const width of [320, 390, 768, 1440]) {
  6   |   test(`brand layout at ${width}px`, async ({ page }, testInfo) => {
  7   |     await page.setViewportSize({ width, height: 900 });
  8   |     await page.emulateMedia({ reducedMotion: "reduce" });
  9   |     await page.goto("/");
  10  |     await expect(page.locator("#hero-title")).toContainText("Agar lebih Dekat dengan");
  11  |     await expect(page.locator(".dl-dashboard-welcome h2")).toHaveText("Selamat Datang, Sarah!");
  12  |     const copy = await page.locator(".dl-hero-copy").boundingBox();
  13  |     const mockup = await page.locator(".dl-hero-product").boundingBox();
  14  |     expect(mockup!.y - (copy!.y + copy!.height)).toBeGreaterThanOrEqual(0);
  15  |     expect(mockup!.y - (copy!.y + copy!.height)).toBeLessThanOrEqual(26);
  16  |     expect(mockup!.y).toBeLessThan(680);
  17  |     const logo = page.locator(".dl-logo-strip");
  18  |     await expect(logo).toHaveCSS("border-radius", "0px");
  19  |     await expect(page.locator(".dl-logo-strip-label")).toHaveCSS("text-align", "center");
  20  |     expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  21  |     await page.screenshot({ path: testInfo.outputPath("hero.png") });
  22  |     await page.locator("#course").scrollIntoViewIfNeeded();
  23  |     const cards = await page.locator(".dl-course-card").evaluateAll((elements) => elements.map((element) => {
  24  |       const box = element.getBoundingClientRect();
  25  |       const action = element.querySelector(".dl-course-actions")!.getBoundingClientRect();
  26  |       return { y: box.y, bottom: box.bottom, action: action.y };
  27  |     }));
  28  |     for (const card of cards) {
  29  |       for (const other of cards.filter((other) => Math.abs(other.y - card.y) < 2)) {
  30  |         expect(Math.abs(other.bottom - card.bottom)).toBeLessThan(2);
  31  |         expect(Math.abs(other.action - card.action)).toBeLessThan(2);
  32  |       }
  33  |     }
  34  |     await page.screenshot({ path: testInfo.outputPath("courses.png") });
  35  |     await page.locator("#mulai").scrollIntoViewIfNeeded();
  36  |     await page.screenshot({ path: testInfo.outputPath("cta.png") });
  37  |   });
  38  | }
  39  | 
  40  | test("headline changes in order without moving the mockup", async ({ page }) => {
  41  |   await page.goto("/");
  42  |   const word = page.locator(".dl-changing-word");
  43  |   await expect(word).toHaveCSS("animation-duration", "3s");
  44  |   const y = (await page.locator(".dl-hero-product").boundingBox())!.y;
  45  |   const words = ["customer", "cuan", "pasar", "peluang", "teknologi", "pertumbuhan"];
  46  |   const first = (await word.textContent())!;
> 47  |   await expect(word).toHaveText(words[(words.indexOf(first) + 1) % words.length], { timeout: 4500 });
      |                      ^ Error: expect(locator).toHaveText(expected) failed
  48  |   expect(Math.abs((await page.locator(".dl-hero-product").boundingBox())!.y - y)).toBeLessThan(1);
  49  | });
  50  | 
  51  | test("login UI validates locally and offers Google and email only", async ({ page }, testInfo) => {
  52  |   await page.setViewportSize({ width: 390, height: 844 });
  53  |   await page.goto("/masuk");
  54  |   await expect(page.getByRole("heading", { name: "Yuk, lanjut tumbuh." })).toBeVisible();
  55  |   await expect(page.getByText(/maintenance|WhatsApp/i)).toHaveCount(0);
  56  |   await page.getByRole("button", { name: "Lanjut dengan Google" }).click();
  57  |   await expect(page.getByRole("status")).toContainText("belum tersedia");
  58  |   await page.getByLabel("Email", { exact: true }).fill("sarah@example.com");
  59  |   await page.getByLabel("Kata sandi", { exact: true }).fill("example-password");
  60  |   await page.getByRole("button", { name: "Tampilkan kata sandi" }).click();
  61  |   await expect(page.locator("#signin-password")).toHaveAttribute("type", "text");
  62  |   await page.getByRole("button", { name: "Sembunyikan kata sandi" }).click();
  63  |   await expect(page.locator("#signin-password")).toHaveAttribute("type", "password");
  64  |   const requests: string[] = [];
  65  |   page.on("request", (request) => { if (request.method() === "POST") requests.push(request.url()); });
  66  |   await page.getByRole("button", { name: "Masuk", exact: true }).click();
  67  |   await expect(page).toHaveURL(/\/masuk$/);
  68  |   expect(requests).toEqual([]);
  69  |   expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  70  |   await page.screenshot({ path: testInfo.outputPath("login-mobile.png"), fullPage: true });
  71  |   await page.setViewportSize({ width: 1440, height: 900 });
  72  |   await page.screenshot({ path: testInfo.outputPath("login-desktop.png"), fullPage: true });
  73  | });
  74  | 
  75  | test("PWA manifest, icons, and safe offline fallback", async ({ page, context, request }) => {
  76  |   const response = await request.get("/manifest.webmanifest");
  77  |   expect(response.ok()).toBeTruthy();
  78  |   const manifest = await response.json();
  79  |   expect(manifest.display).toBe("standalone");
  80  |   expect(manifest.theme_color).toBe("#0255f5");
  81  |   for (const size of [192, 512]) {
  82  |     const icon = await request.get(`/pwa-icon/${size}`);
  83  |     expect(icon.ok()).toBeTruthy();
  84  |     expect(icon.headers()["content-type"]).toContain("image/png");
  85  |     const png = await icon.body();
  86  |     expect(png.readUInt32BE(16)).toBe(size);
  87  |     expect(png.readUInt32BE(20)).toBe(size);
  88  |   }
  89  |   await page.goto("/");
  90  |   // Registration is production-only; explicitly register here to exercise the worker in dev too.
  91  |   await page.evaluate(async () => {
  92  |     await navigator.serviceWorker.register("/sw.js");
  93  |     await navigator.serviceWorker.ready;
  94  |   });
  95  |   await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 10000 }).toBe(true);
  96  |   await context.setOffline(true);
  97  |   await page.goto("/masuk");
  98  |   await expect(page.getByRole("heading", { name: "Yah, koneksinya terputus." })).toBeVisible();
  99  |   const cacheUrls = await page.evaluate(async () => {
  100 |     const cache = await caches.open("dekatlokal-offline-v1");
  101 |     return (await cache.keys()).map((request) => new URL(request.url).pathname);
  102 |   });
  103 |   expect(cacheUrls).toEqual(["/offline.html"]);
  104 |   await context.setOffline(false);
  105 | });
  106 | 
```