export type PortfolioType = "UMKM" | "Sociopreneur";

export const southSulawesiRegions = [
  { id: "makassar", label: "Makassar" },
  { id: "gowa", label: "Gowa" },
] as const;

export type SouthSulawesiRegion = (typeof southSulawesiRegions)[number]["id"];

export interface UmkmPortfolioItem {
  slug: string;
  name: string;
  type: PortfolioType;
  category: string;
  description: string;
  details: readonly string[];
  location: string;
  regions: SouthSulawesiRegion[];
  logoImage: string;
  image: string;
  imageAlt: string;
  websiteUrl: string;
}

const logoPath = (slug: string) => `/image/logos/umkm/${slug}.webp`;
const cardPath = (slug: string) => `/image/website-umkm/cards/${slug}.webp`;

export const PORTFOLIO_LAST_UPDATED = "2026-07-08";

export const umkmPortfolio: UmkmPortfolioItem[] = [
  {
    slug: "aroma-bakery",
    name: "Aroma Bakery",
    type: "UMKM",
    category: "Bakery",
    description: "Roti rumahan berbahan pilihan dengan beragam isian untuk camilan, acara keluarga, toko, dan warung.",
    details: [
      "Aroma Bakery adalah usaha roti rumahan di Makassar yang menghadirkan roti segar dan halal dengan beragam pilihan isian. Produknya cocok dinikmati sebagai camilan sehari-hari, suguhan acara keluarga, maupun bekal praktis.",
      "Selain melayani pembelian langsung, Aroma Bakery membuka peluang pemesanan untuk kebutuhan acara dan titip jual di toko atau warung. Pilihan produknya disusun agar mudah dijangkau oleh pelanggan yang mencari roti lokal dengan rasa yang akrab dan proses pemesanan yang sederhana.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("aroma-bakery"),
    image: cardPath("aroma-bakery"),
    imageAlt: "Tampilan website Aroma Bakery pada layar laptop",
    websiteUrl: "https://aromabakery.dekatlokal.com",
  },
  {
    slug: "dapur-karaeng",
    name: "Dapur Karaeng Lu'Mu",
    type: "UMKM",
    category: "Makanan Sehat",
    description:
      "Makanan sehat khas Sulawesi dengan Sambal Karaeng, menu homemade tanpa pengawet, dan konsep refill ramah lingkungan.",
    details: [
      "Dapur Karaeng Lu'Mu adalah UMKM makanan sehat di Makassar yang menghadirkan cita rasa lokal Sulawesi melalui Sambal Karaeng sebagai produk unggulan. Sambal dibuat dari cabai pilihan serta ikan tuna atau cakalang berkualitas, tanpa bahan pengawet, dan tersedia dalam beberapa level pedas.",
      "Selain sambal, Dapur Karaeng Lu'Mu menyediakan Dimsum Mentai, Siomay, Otak-Otak, Nasi Liwet Ayam Kampung, dan Pisang Ijo. Website usahanya membantu pelanggan melihat pilihan produk, pembayaran QRIS, konsep refill ramah lingkungan, serta jalur pemesanan WhatsApp.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: "/image/logos/umkm/dapur-karaeng.jpg",
    image: "/image/website-umkm/cards/dapur-karaeng.png",
    imageAlt: "Tampilan website Dapur Karaeng Lu'Mu dengan produk makanan sehat Makassar",
    websiteUrl: "https://dapurkaraeng.dekatlokal.com",
  },
  {
    slug: "bio-atama",
    name: "Bio Atama",
    type: "UMKM",
    category: "Herbal Wanita",
    description: "Produk herbal alami dari tumbuhan karang laut untuk mendukung kesehatan wanita dan keharmonisan keluarga.",
    details: [
      "Bio Atama menghadirkan produk herbal berbahan alami yang memanfaatkan karang laut dari Sulawesi Selatan. Produk ini dikembangkan sebagai pilihan perawatan tradisional bagi wanita dan tersedia dalam kemasan yang praktis untuk penggunaan pribadi.",
      "Melalui website resminya, pelanggan dapat mengenal bahan utama, pilihan produk, dan cara pemesanan Bio Atama dengan lebih jelas. Informasi disajikan secara ringkas agar calon pelanggan dapat mempertimbangkan produk sesuai kebutuhannya sebelum menghubungi penjual.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("bio-atama"),
    image: cardPath("bio-atama"),
    imageAlt: "Produk herbal Bio Atama",
    websiteUrl: "https://bioatama.dekatlokal.com",
  },
  {
    slug: "kira-kira-michi",
    name: "Kira Kira Michi",
    type: "UMKM",
    category: "Custom Merchandise",
    description: "Custom merchandise premium dengan pilihan totebag, kaus, hoodie, produk kayu, dan desain eksklusif.",
    details: [
      "Kira Kira Michi merupakan usaha merchandise kreatif yang melayani produk custom dan pre-order untuk kebutuhan personal, komunitas, maupun acara. Pilihannya mencakup totebag, pakaian, aksesori akrilik, produk berbahan kayu, pouch, dan beragam barang kreatif lainnya.",
      "Setiap pesanan dapat disesuaikan dengan konsep dan identitas yang diinginkan pelanggan. Pendekatan ini membuat Kira Kira Michi cocok untuk hadiah, kebutuhan promosi, merchandise komunitas, atau produk edisi khusus yang ingin tampil lebih personal.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("kira-kira-michi"),
    image: cardPath("kira-kira-michi"),
    imageAlt: "Custom merchandise Kira Kira Michi",
    websiteUrl: "https://kirakiramichi.dekatlokal.com",
  },
  {
    slug: "iboo-idn",
    name: "Iboo IDN",
    type: "UMKM",
    category: "Wellness Shot",
    description: "Wellness shot berbahan buah, sayur, dan rempah alami tanpa gula maupun air tambahan.",
    details: [
      "Iboo IDN memproduksi wellness shot dalam kemasan praktis dengan perpaduan buah, sayur, dan rempah alami. Racikannya dibuat tanpa tambahan gula maupun air sehingga karakter bahan yang digunakan tetap menjadi bagian utama produk.",
      "Ukuran saji yang ringkas membuat produk Iboo IDN mudah dimasukkan ke dalam rutinitas harian. Pelanggan dapat mempelajari pilihan varian dan melakukan pemesanan secara langsung melalui kanal kontak yang tersedia di website.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("iboo-idn"),
    image: cardPath("iboo-idn"),
    imageAlt: "Produk wellness shot Iboo IDN",
    websiteUrl: "https://ibooidn.dekatlokal.com",
  },
  {
    slug: "minyak-pamboang",
    name: "Minyak Pamboang",
    type: "UMKM",
    category: "Herbal Tradisional",
    description: "Minyak herbal tradisional Pusaka Mandar untuk perawatan luka ringan, iritasi kulit, dan kebutuhan keluarga.",
    details: [
      "Minyak Pamboang Pusaka Mandar adalah minyak herbal tradisional yang berangkat dari pengetahuan dan racikan keluarga di Tanah Mandar. Produk ini digunakan sebagai minyak perawatan keluarga untuk kebutuhan luar seperti luka ringan dan iritasi kulit.",
      "Minyak Pamboang tersedia dalam kemasan yang mudah dibawa dan dapat dipesan secara daring. Website produknya membantu pelanggan memahami latar belakang, kegunaan, ukuran kemasan, serta jalur pemesanan sebelum menghubungi penjual.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("minyak-pamboang"),
    image: cardPath("minyak-pamboang"),
    imageAlt: "Minyak Pamboang Pusaka Mandar",
    websiteUrl: "https://minyakpamboang.dekatlokal.com",
  },
  {
    slug: "kopi-teko",
    name: "Kopi Teko",
    type: "UMKM",
    category: "Venue & Kuliner",
    description: "Venue bazar kampus dan event komunitas dengan panggung, sound system, area luas, dan harga mahasiswa.",
    details: [
      "Kopi Teko menyediakan ruang acara di Makassar untuk bazar kampus, gathering, pertunjukan komunitas, dan kegiatan kreatif lainnya. Area venue dapat menampung lebih dari 200 orang serta dilengkapi panggung, sound system, dan area parkir.",
      "Konsepnya dirancang ramah untuk mahasiswa dan komunitas yang membutuhkan tempat berkegiatan dengan fasilitas dalam satu lokasi. Informasi kapasitas, fasilitas, dan proses reservasi dapat dilihat terlebih dahulu melalui website sebelum calon penyewa menghubungi pengelola.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("kopi-teko"),
    image: cardPath("kopi-teko"),
    imageAlt: "Venue acara Kopi Teko Makassar",
    websiteUrl: "https://kopiteko.dekatlokal.com",
  },
  {
    slug: "eyfa-natural-oil",
    name: "Eyfa Natural Oil",
    type: "UMKM",
    category: "Perawatan Alami",
    description: "Minyak kemiri murni dalam tiga varian untuk membantu merawat rambut, kulit kepala, dan kulit keluarga.",
    details: [
      "Eyfa Natural Oil menghadirkan minyak kemiri alami yang diolah dari biji kemiri pilihan untuk perawatan rambut, kulit kepala, dan kulit. Produk tersedia dalam tiga varian sehingga pelanggan dapat memilih sesuai kebutuhan perawatan hariannya.",
      "Kemasan yang praktis memudahkan produk digunakan di rumah maupun dibawa saat bepergian. Melalui website, pelanggan dapat mengenali perbedaan varian, melihat informasi produk, dan terhubung langsung ke jalur pemesanan Eyfa Natural Oil.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("eyfa-natural-oil"),
    image: cardPath("eyfa-natural-oil"),
    imageAlt: "Tiga varian Eyfa Natural Oil",
    websiteUrl: "https://eyfa.dekatlokal.com",
  },
  {
    slug: "mulkan-mimbaun",
    name: "Mulkan Mimba'un",
    type: "UMKM",
    category: "Oleh-oleh Lokal",
    description: "Pilihan makanan dan minuman lokal, termasuk olahan abon tuna panggang sebagai produk unggulan.",
    details: [
      "Mulkan Mimba'un menawarkan pilihan makanan dan minuman lokal dari Makassar untuk kebutuhan camilan maupun oleh-oleh. Koleksinya meliputi abon tuna panggang, keripik tempe, otak-otak ikan, minuman berbahan gula aren dan jahe, serta kopi lokal.",
      "Ragam produk tersebut memberi pelanggan beberapa pilihan dalam satu tempat, baik untuk konsumsi sendiri maupun sebagai buah tangan. Website Mulkan Mimba'un menampilkan produk unggulan dan memudahkan calon pembeli melanjutkan pemesanan melalui kontak yang tersedia.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("mulkan-mimbaun"),
    image: cardPath("mulkan-mimbaun"),
    imageAlt: "Koleksi produk Mulkan Mimba'un",
    websiteUrl: "https://mulkanmimbaun.dekatlokal.com",
  },
  {
    slug: "rumah-keripik",
    name: "Rumah Keripik",
    type: "UMKM",
    category: "Camilan & Oleh-oleh",
    description: "Aneka keripik renyah untuk camilan dan oleh-oleh, dikemas praktis dengan cita rasa yang akrab di lidah.",
    details: [
      "Rumah Keripik memproduksi camilan lokal seperti keripik pisang dan putu kacang untuk pelanggan di Makassar dan Gowa. Produknya disiapkan sebagai camilan rumahan yang renyah, praktis dibawa, dan sesuai untuk dijadikan oleh-oleh.",
      "Rumah Keripik menaruh perhatian pada proses produksi dan pengemasan agar produk tetap nyaman dinikmati pelanggan. Pilihan camilan, informasi singkat usaha, dan akses pemesanan dirangkum dalam website sehingga calon pembeli dapat menghubungi penjual dengan mudah.",
    ],
    location: "Gowa",
    regions: ["gowa"],
    logoImage: logoPath("rumah-keripik"),
    image: cardPath("rumah-keripik"),
    imageAlt: "Aneka camilan Rumah Keripik",
    websiteUrl: "https://rumahkeripik.dekatlokal.com",
  },
  {
    slug: "kareppe-crunch",
    name: "Kareppe Crunch",
    type: "UMKM",
    category: "Makanan Kemasan",
    description: "Kerupuk singkong premium khas Makassar-Gowa dengan beragam rasa untuk camilan, oleh-oleh, dan reseller.",
    details: [
      "Kareppe Crunch menghadirkan kerupuk singkong dengan karakter rasa khas Makassar dan Gowa. Camilan ini tersedia dalam beberapa pilihan rasa dan dikemas agar praktis dinikmati sendiri, dibagikan, atau dibawa sebagai oleh-oleh.",
      "Selain melayani pembelian satuan, Kareppe Crunch juga dapat menjadi pilihan produk bagi pelanggan yang tertarik menjualnya kembali. Website usaha merangkum varian, informasi produk, dan cara pemesanan agar pelanggan maupun calon reseller dapat terhubung langsung dengan penjual.",
    ],
    location: "Gowa",
    regions: ["gowa"],
    logoImage: "/image/logos/umkm/logo-kareppe-transparent.webp",
    image: cardPath("kareppe-crunch"),
    imageAlt: "Kerupuk singkong Kareppe Crunch",
    websiteUrl: "https://kareppecrunch.dekatlokal.com",
  },
  {
    slug: "gingerfit-plus",
    name: "Gingerfit+",
    type: "UMKM",
    category: "Gingershot Organik",
    description: "Gingershot organik berbahan jahe dengan beragam varian fresh booster untuk rutinitas sehat harian.",
    details: [
      "Gingerfit+ adalah produk gingershot organik dari Gowa yang menggunakan jahe sebagai bahan utama. Pilihan variannya memadukan bahan seperti madu, kunyit, lemon, wortel, nanas, serta varian dengan kafein untuk preferensi yang berbeda.",
      "Produk dikemas sebagai minuman berukuran praktis yang mudah menjadi bagian dari rutinitas harian. Website Gingerfit+ membantu pelanggan mengenali varian yang tersedia dan meneruskan pemesanan melalui kanal kontak resmi usaha.",
    ],
    location: "Gowa",
    regions: ["gowa"],
    logoImage: logoPath("gingerfit-plus"),
    image: cardPath("gingerfit-plus"),
    imageAlt: "Produk gingershot organik Gingerfit+",
    websiteUrl: "https://gingerfitplus.dekatlokal.com",
  },
  {
    slug: "bakpia-malino",
    name: "Bakpia Malino",
    type: "UMKM",
    category: "Camilan Tradisional",
    description:
      "Bakpia Malino menghadirkan camilan tradisional khas Malino, Kabupaten Gowa, dengan pilihan rasa unik dari bahan segar khas Sulawesi Selatan.",
    details: [
      "Bakpia Malino merupakan camilan tradisional khas Malino, Kabupaten Gowa, yang diproduksi oleh PT Dapoer Noyutri Malino. Produk ini mengolah bahan pilihan dari Sulawesi Selatan menjadi bakpia dengan beragam rasa yang cocok dinikmati sebagai camilan maupun oleh-oleh.",
      "Setiap varian dibuat untuk membawa karakter Malino ke dalam produk yang mudah dibawa dan dibagikan. Bakpia Malino telah memiliki sertifikasi halal, dan informasi pilihan rasa serta pemesanannya dapat ditemukan melalui website resmi usaha.",
    ],
    location: "Gowa",
    regions: ["gowa"],
    logoImage: logoPath("bakpia-malino"),
    image: cardPath("bakpia-malino"),
    imageAlt: "Produk Bakpia Malino khas Gowa",
    websiteUrl: "https://bakpiamalino.dekatlokal.com",
  },
  {
    slug: "growmates",
    name: "Growmates",
    type: "Sociopreneur",
    category: "Sosial & Edukasi",
    description: "Ruang bertemu untuk mendampingi anak bertumbuh melalui kegiatan sosial, edukasi, dan psikologi anak.",
    details: [
      "Growmates adalah ruang kolaborasi bagi orang-orang yang ingin ikut menemani proses tumbuh anak melalui kegiatan sosial dan edukasi. Programnya menghubungkan kepedulian komunitas dengan aktivitas yang memperhatikan pembelajaran, psikologi anak, dan pendampingan yang hangat.",
      "Melalui berbagai kegiatan, Growmates mengajak relawan dan mitra untuk bertumbuh sekaligus memberi dampak. Website Growmates menjadi tempat untuk mengenal gerakan, melihat arah program, dan menemukan cara berpartisipasi dalam kegiatan yang sedang dijalankan.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("growmates"),
    image: cardPath("growmates"),
    imageAlt: "Program sosial dan edukasi Growmates",
    websiteUrl: "https://growmates.dekatlokal.com",
  },
  {
    slug: "with-soerai",
    name: "With Soerai",
    type: "Sociopreneur",
    category: "Pemberdayaan Perempuan",
    description: "Komunitas pemberdayaan perempuan muda Indonesia Timur melalui capacity building, mentorship, dan kepemimpinan.",
    details: [
      "With Soerai merupakan komunitas yang berfokus pada pemberdayaan perempuan muda di Indonesia Timur. Kegiatannya mencakup pengembangan kapasitas, mentorship, pembelajaran kepemimpinan, dan ruang bertemu yang dibangun bersama komunitas.",
      "Program With Soerai dirancang untuk membantu peserta memperluas pengetahuan, keberanian, dan jejaring pendukung. Website komunitas merangkum identitas gerakan, program yang dijalankan, serta cara bagi calon peserta atau mitra untuk terhubung.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("with-soerai"),
    image: cardPath("with-soerai"),
    imageAlt: "Kegiatan pemberdayaan perempuan With Soerai",
    websiteUrl: "https://with-soerai.dekatlokal.com",
  },
  {
    slug: "synergy-unhas",
    name: "Synergy Unhas",
    type: "Sociopreneur",
    category: "Energi & Edukasi",
    description: "Program pembelajaran konseptual dan pengalaman langsung untuk menyiapkan pemimpin masa depan di bidang energi.",
    details: [
      "Synergy Unhas adalah program pengembangan calon pemimpin muda di bidang energi. Pembelajarannya memadukan pemahaman konseptual dengan pengalaman langsung agar peserta dapat melihat tantangan dan peluang sektor energi secara lebih utuh.",
      "Program ini memberi ruang bagi mahasiswa untuk belajar, bertukar gagasan, dan membangun kesiapan menghadapi kebutuhan industri energi di masa depan. Website Synergy Unhas menjadi pusat informasi mengenai arah program, rangkaian kegiatan, dan kesempatan untuk terlibat.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("synergy-unhas"),
    image: cardPath("synergy-unhas"),
    imageAlt: "Program energi Synergy Universitas Hasanuddin",
    websiteUrl: "https://synergy-unhas.dekatlokal.com",
  },
  {
    slug: "sikola-indonesia",
    name: "Sikola Indonesia",
    type: "Sociopreneur",
    category: "Pendidikan & Mentoring",
    description: "Platform bimbingan personal untuk kompetisi, beasiswa, dan persiapan karier mahasiswa bersama mentor berprestasi.",
    details: [
      "Sikola Indonesia adalah platform mentoring untuk mahasiswa yang sedang mempersiapkan kompetisi, beasiswa, maupun langkah awal karier. Pendampingan dilakukan secara personal bersama mentor yang memiliki pengalaman dan rekam prestasi pada bidang terkait.",
      "Peserta dapat menggunakan sesi mentoring untuk menyusun strategi, meninjau persiapan, dan memperoleh sudut pandang yang lebih terarah. Website Sikola Indonesia menjelaskan pilihan pendampingan serta membantu mahasiswa menemukan jalur mentoring yang sesuai dengan tujuannya.",
    ],
    location: "Makassar",
    regions: ["makassar"],
    logoImage: logoPath("sikola-indonesia"),
    image: cardPath("sikola-indonesia"),
    imageAlt: "Platform mentoring mahasiswa Sikola Indonesia",
    websiteUrl: "https://sikola-indonesia.dekatlokal.com",
  },
];
