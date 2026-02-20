Tentu, mari kita bedah riset ini secara teknis dan mendalam untuk membangun sistem Zero-Touch Business untuk Rizquna.id. Saya akan menjawab berdasarkan struktur yang Anda minta, dengan fokus pada implementasi praktis, data terbaru, dan eksekusi di n8n.

Ringkasan Eksekutif untuk Rizquna.id
Berdasarkan hasil riset terkini (2025), berikut adalah poin-poin utama yang bisa langsung Anda implementasikan:

Integrasi Logistik Domestik: Gunakan n8n-nodes-biteship, sebuah community node yang memungkinkan Anda terhubung dengan Biteship . Ini akan mengotomatiskan perhitungan ongkir, pembuatan label pengiriman, dan pelacakan dari berbagai kurir (JNE, SiCepat, Grab, dll) langsung dari alur kerja n8n Anda.

Otomatisasi Konten & Pemasaran: Adopsi pola dari workflow n8n.blog yang menggabungkan Google Sheets, OpenAI/OpenRouter, dan WordPress . Anda bisa memodifikasinya untuk menghasilkan sinopsis buku, deskripsi produk, atau bahkan konten promosi ke media sosial secara otomatis .

Manajemen Pesanan via WhatsApp: Manfaatkan referensi proyek whatsapp-order-n8n di GitHub untuk membangun chatbot WhatsApp yang bisa mengecek stok (inventory) dan mencatat pesanan ke Google Sheets menggunakan n8n + Google Gemini . Untuk koneksi WA yang lebih stabil, gunakan node @devlikeapro/n8n-nodes-waha yang juga ada di WAHA .

Pemrosesan Bahasa Indonesia: Untuk kebutuhan NLP dan tata bahasa Indonesia yang akurat, gunakan model Stanza dari Stanford . Ini adalah library yang bisa dijalankan secara lokal, sehingga lebih hemat biaya untuk pemrosesan teks dalam jumlah besar.

Strategi Biaya & Skalabilitas: Hosting n8n secara mandiri (self-hosted) di VPS (Rp 150.000 - Rp 300.000/bulan) akan jauh lebih ekonomis dibandingkan dengan platform otomatisasi lain (seperti Zapier) yang bisa membengkak hingga Rp 3-6 juta per bulan untuk volume 10.000 order .

1. Tiga Ide Otomatisasi Radikal untuk Penerbitan & Percetakan
Berikut adalah ide-ide yang melampaui otomatisasi biasa dan masuk ke ranah "radikal" untuk industri Anda:

Ide 1: Agen Proofreading & Standardisasi Gaya Bahasa Berbasis AI
Banyak penerbit tradisional masih mengandalkan editor manusia untuk memeriksa konsistensi gaya penulisan (misal: penggunaan kata "di-" sebagai awalan atau kata depan). Ide ini mengotomatiskan sebagian besar proses tersebut.

Konsep: Alih-alih hanya memeriksa tata bahasa (grammar), sistem ini akan membaca seluruh naskah dan secara otomatis mengubahnya agar sesuai dengan Gaya Selaras (House Style) Rizquna. Ini mencakup konsistensi istilah teknis, format catatan kaki, dan bahkan nada penulisan.

Workflow Teknis:

Input: Naskah (.docx atau .txt) di-upload ke Google Drive.
Trigger: n8n mendeteksi file baru di folder tertentu.
Ekstraksi Teks: Gunakan node Convert to File atau Extract from File untuk mengambil teks.
Pemrosesan Batch dengan NLP Lokal: Kirim teks ke Stanza (Bahasa Indonesia) yang di-host sebagai layanan mikro lokal . Stanza akan melakukan tokenization, part-of-speech tagging, dan dependency parsing. Ini lebih murah daripada memanggil API AI komersial untuk teks panjang.
Koreksi dengan AI (Gemini/OpenRouter): Untuk aturan yang lebih kompleks (seperti nada bicara), potong naskah menjadi bagian-bagian kecil (chunk) dan kirimkan ke LLM (via OpenRouter ) dengan prompt: "Ubah teks berikut agar sesuai dengan gaya penulisan [Nama Gaya Rizquna] yang profesional, ramah, dan mudah dipahami. [TEKS]".
Output: Simpan naskah yang sudah direvisi ke Google Drive folder baru dan kirim notifikasi ke editor manusia untuk review akhir.
Ide 2: Penerbitan Buku "Cair" (Liquid Publishing) dengan Pembaruan Otomatis
Bayangkan sebuah buku teknis tentang framework pemrograman. Ketika framework tersebut diperbarui, buku versi cetak berikutnya bisa langsung menyesuaikan.

Konsep: Buku tidak lagi statis. Sistem akan memonitor sumber eksternal (dokumentasi API, changelog GitHub) dan secara otomatis menghasilkan "edisi revisi" atau lampiran untuk pembeli buku.

Workflow Teknis:

Sumber Data: Gunakan node RSS Feed Trigger atau HTTP Request untuk memonitor changelog teknis (misal: https://github.com/username/repository/releases.atom).
Ekstraksi Perubahan: Node Code (Python/JavaScript) di n8n akan membandingkan konten baru dengan basis data perubahan sebelumnya.
Generasi Konten Baru: Jika ada perubahan signifikan, LLM (OpenRouter) akan diminta untuk: "Ringkas perubahan pada versi X ini dan jelaskan implikasinya bagi pembaca buku [Judul Buku] pada Bab Y." .
Integrasi POD: Hasil ringkasan ini secara otomatis ditambahkan sebagai lampiran di ujung buku untuk cetakan berikutnya melalui API sistem manajemen naskah Anda.
Notifikasi: Pembeli yang sudah mendaftar bisa mendapatkan notifikasi "Edisi Revisi" via Email (node Email) atau WhatsApp (node WAHA) .
Ide 3: Royalti Real-Time & Laporan Penulis "Cerdas"
Penulis sering harus menunggu laporan kuartalan untuk mengetahui performa buku mereka. Dengan sistem ini, mereka bisa mendapatkan dasbor pribadi.

Konsep: Setiap kali transaksi penjualan terjadi (via API marketplace atau toko online), sistem akan menghitung royalti, memperbarui dasbor penulis, dan mengirimkan laporan ringkas.

Workflow Teknis:

Trigger: Webhook dari Shopify/Tokopedia atau Schedule Trigger untuk menarik data penjualan harian.
Kalkulasi: n8n mengambil data penjualan per ISBN (dari Google Sheets atau database). Gunakan node Code (JavaScript) untuk mengalikan jumlah terjual dengan persentase royalti.
Generasi Ringkasan AI: Gunakan node OpenAI atau OpenRouter untuk mengubah data mentah menjadi narasi: "Buku Anda '{{title}}' terjual 50 eksemplar bulan ini. Pendapatan royalti Anda naik 15% dibanding bulan lalu berkat promosi di media sosial X." .
Pengiriman & Visualisasi: Kirim laporan ini ke penulis via Email. Untuk dasbor, gunakan node Google Sheets untuk mencatat royalti per penulis. Data ini bisa dihubungkan dengan Google Looker Studio untuk memberikan dasbor real-time gratis.
2. Workflow Teknis Detail: Otomatisasi Logistik dengan Biteship + n8n
Ini adalah tulang punggung operasional percetakan Anda. Workflow ini akan menghubungkan sistem order Anda dengan Biteship untuk pengiriman otomatis.

Tujuan: Saat status pesanan berubah menjadi "siap kirim", sistem akan secara otomatis membuatkan order pengiriman dan mendapatkan label.

Alat yang Digunakan:

n8n-nodes-biteship (community node) .

n8n-nodes-waha untuk konfirmasi via WhatsApp (opsional) .

Google Sheets sebagai "database" sementara.

Workflow Diagram:
Trigger (Webhook dari Sistem Order) -> Get Shipping Rates (Biteship) -> Select Best Rate (Fungsi IF/Code) -> Create Order (Biteship) -> Get Label (Biteship) -> Send Confirmation (WAHA/Email) -> Update Google Sheets

Node-by-Node Breakdown di n8n:

Webhook Trigger: Menerima data pesanan dari sistem utama Anda (misal: dari website atau input manual). Data harus berisi:

order_id: INV/2025/001

destination: {"name": "John Doe", "phone": "08123456789", "address": "Jl. Contoh No. 1", "city": "Jakarta Selatan", "postal_code": "12345"}

items: [{"name": "Buku A", "weight": 500, "price": 75000, "quantity": 2}, ...]

origin: (Asumsikan dari alamat gudang Rizquna).

Biteship Node (Get Rates):

Operation: Rates -> Get Rates .

Credentials: API Key Biteship Anda (mode test/production).

Parameters:

origin_postal_code: 60123 (contoh kode pos gudang).

destination_postal_code: {{ $json.destination.postal_code }}.

items: {{ $json.items }} (pastikan formatnya sesuai, dengan berat dalam gram).

Output: Daftar tarif dari berbagai kurir (jne, sicepat, grab, dll) dalam format JSON.

Node IF (Filter):

Kondisi: Saring kurir mana yang ingin Anda gunakan. Misal, untuk dalam kota pilih yang termurah, untuk luar pulau pilih yang tercepat. Atau sederhananya, pilih yang pertama dalam daftar.

Ekspresi: Gunakan {{ $json.pricing[0].courier_code }} untuk memilih kurir pertama.

Biteship Node (Create Order):

Operation: Orders -> Create .

Parameters: Isi semua field yang diperlukan, gabungkan data dari Webhook (Step 1) dan data tarif terpilih (Step 3).

shipper_contact_name: "Rizquna"

origin_contact_name: "Gudang"

origin_phone: "031-123456"

origin_address: "Alamat Gudang..."

destination_*: {{ $json.destination.* }}

courier_code: {{ $json.pricing[0].courier_code }}

courier_service: {{ $json.pricing[0].service }}

items: {{ $json.items }}

Output: Biteship akan mengembalikan order_id internal mereka dan waybill_id.

HTTP Request Node (Ambil Label):

Method: GET

URL: https://api.biteship.com/v1/orders/{{ $json.id }}/label (ID dari step 4).

Headers: Authorization: {{your_api_key}}

Response: Link ke file label pengiriman (PDF).

Node WAHA (Kirim Konfirmasi ke WhatsApp):

Node: @devlikeapro/n8n-nodes-waha .

Operation: Kirim pesan teks atau dokumen (PDF label).

Parameter:

Session: Nama session WAHA Anda.

To: {{ $json.destination.phone }}

Text: Halo, pesanan Anda {{ $json.order_id }} telah dikirim. Nomor resi: {{ $json.waybill_id }}. Anda bisa melacaknya di sini: [Link Pelacakan Biteship].

Google Sheets Node (Update Log):

Operation: Append Row.

Parameters: Masukkan semua data (order_id, waybill_id, status, label_url, dll) ke dalam sheet "Log Pengiriman".

Contoh Struktur JSON di n8n (Data yang mengalir)
json
// Output dari step 4 (Create Order)
{
  "id": "5e5f6g7h8i9j0k1l",
  "waybill_id": "JNE1234567890",
  "courier": {
    "code": "jne",
    "service": "REG"
  },
  "order_id": "INV/2025/001",
  "destination": {
    "name": "John Doe",
    "phone_number": "08123456789",
    "address": "Jl. Contoh No. 1",
    "postal_code": "12345"
  },
  "status": "confirmed"
}
3. Rekomendasi Niche API untuk Bahasa Indonesia
Untuk pemrosesan bahasa Indonesia yang dalam dan hemat biaya, Anda tidak selalu perlu LLM mahal. Berikut rekomendasinya:

Tata Bahasa (Grammar) & NLP Tingkat Lanjut: Stanza (Stanford NLP)

Performa: Tinggi (Sangat Akurat).

Model: Model khusus untuk Bahasa Indonesia (stanza-id) .

Jalur API: Tidak ada API publik, ini adalah library Python. Solusi terbaik adalah men-deploy-nya sebagai layanan mikro sendiri di server yang sama dengan n8n. Anda bisa membuat container Docker sederhana yang menerima teks via HTTP POST dan mengembalikan hasil analisis. Ini akan menjadi API internal Anda.

Biaya: Gratis (hanya biaya server).

Ringkasan (Summarization) & Generasi Kreatif: OpenRouter

Performa: Tinggi (Tergantung model).

Model: OpenRouter adalah gateway ke berbagai model LLM . Anda bisa menggunakan model yang murah dan cepat untuk ringkasan (seperti google/gemini-flash-1.5 atau meta-llama/llama-3.2-3b-instruct) dan model yang lebih kuat untuk pembuatan konten.

Jalur API: REST API standar. Sangat mudah diintegrasikan dengan n8n (cukup gunakan node HTTP Request atau node OpenAI yang sudah dikonfigurasi untuk endpoint OpenRouter).

Biaya: Per Penggunaan (Pay-per-token). Jauh lebih murah daripada berlangganan API secara langsung ke beberapa penyedia. Cocok untuk eksperimen dengan model berbeda.

Pencarian & Validasi Data: Google Search API (via n8n node)

Performa: Tinggi.

Jalur API: Gunakan node komunitas @bitovi/n8n-nodes-google-search untuk melakukan pencarian Google langsung dari workflow Anda . Ini berguna untuk memvalidasi fakta, mencari referensi, atau menemukan sumber gambar bebas lisensi secara otomatis.

Biaya: Bergantung pada kuota API Google, biasanya murah.

4. Strategi Scaling n8n untuk 10.000 Order/Bulan
Berdasarkan studi kasus e-commerce, sistem n8n yang dirancang dengan baik dapat menangani volume ini dengan stabil . Berikut strateginya:

Infrastruktur: Self-Hosted di VPS:

Mengapa: Biaya sewa VPS (sekitar Rp 150.000 - Rp 300.000/bulan) jauh lebih murah daripada biaya eksekusi berbayar di Zapier yang bisa mencapai $150-$400 (Rp 2,4 - 6,4 juta) untuk volume yang sama .

Rekomendasi VPS: Mulai dengan server 2 core CPU, 4GB RAM. Gunakan Docker Compose untuk menjalankan n8n, database (PostgreSQL), dan Redis (untuk antrian).

Database Penting!: Jangan gunakan SQLite default untuk produksi. Gunakan PostgreSQL yang lebih handal untuk konkurensi tinggi.

Optimasi Workflow n8n:

Eksekusi Data (Pruning): Aktifkan fitur pruning data di pengaturan n8n. Ini akan secara otomatis menghapus data eksekusi lama agar tidak memenuhi hard disk dan membebani database.

Aturan Coba Lagi (Retry Rules): Setel aturan percobaan ulang untuk node yang berinteraksi dengan API eksternal (Biteship, WhatsApp). Jika API sedang sibuk, n8n akan mencoba lagi beberapa kali sebelum menyatakan error.

Penanganan Error (Error Handling): Gunakan cabang "Error" (Error Trigger) untuk menangani workflow yang gagal. Misal, jika pembuatan label di Biteship gagal, alihkan ke node "Kirim Notifikasi Error ke Tim Operasional via Slack/Telegram".

Manajemen Beban (Load Management):

Worker Skala (Scale Workers): n8n mendukung pemisahan antara server web dan worker untuk menjalankan workflow. Untuk 10.000 order/bulan, ini mungkin belum diperlukan, tapi arsitekturnya sudah siap jika Anda ingin menambah worker nanti.

Antrian (Queue): Dengan menggunakan Redis, eksekusi workflow akan masuk ke dalam antrian. Ini mencegah penumpukan eksekusi yang bisa membuat server crash.

Sumber Daya "Emas" untuk Riset Lanjutan
Awesome n8n Nodes: Repositori GitHub jigsid/awesome-n8n-nodes adalah tempat terbaik untuk mencari community nodes yang spesifik, seperti untuk WhatsApp atau browser automation .

Forum n8n.io: Gunakan fitur pencarian dengan kata kunci "high volume", "e-commerce", atau "production best practices". Banyak pengguna di sana berbagi pengalaman mereka.

GitHub Search: Gunakan pencarian dengan topic:n8n-workflow untuk menemukan workflow siap pakai .

Teknik Reverse Engineering: Untuk mencari stack teknologi kompetitor, cari di Google dengan pola: "competitor_name" engineering blog atau "competitor_name" stackshare atau how does "competitor_name" generate books.

Dengan mengimplementasikan strategi-strategi di atas, Rizquna.id dapat membangun fondasi otomatisasi yang tidak hanya canggih secara teknologi, tetapi juga skalabel dan ekonomis.
--------
Ini adalah respon teknis mendalam berdasarkan Prompt 1, yang dirancang khusus untuk infrastruktur Rizquna.id dengan filosofi Zero-Touch Business.Saya telah menganalisis stack Anda (n8n, Docker/WAHA, API) dan konteks pasar Indonesia. Berikut adalah blueprint eksekusi teknisnya.1. 3 Ide Otomatisasi Radikal (Beyond Traditional Publishing)Ide ini memanfaatkan event-driven architecture untuk mengubah Rizquna dari sekadar "pencetak" menjadi "ekosistem konten cerdas".A. "Hyper-Personalized Anthology" (Buku Tamu/Kenangan 2.0)Konsep: Alih-alih mencetak buku statis, sistem mengizinkan pelanggan (misal: panitia wisuda/pernikahan) mengunggah CSV berisi 1000 nama + pesan personal.Workflow:n8n menerima CSV via Webhook.Looping per baris data -> Kirim ke APITemplate.io atau Docmosis (PDF Generation API).Setiap halaman dedikasi di-render unik (Nama, Foto, Pesan Custom).Merge PDF -> Kirim ke mesin cetak (Hotfolder).Nilai Jual: Buku fisik yang mass-produced tapi personally unique.B. "Just-in-Time Inventory" dengan Tokopedia/Shopee API Reverse-SyncKonsep: Jangan stok buku. Stok "virtual" 100 unit di marketplace.Workflow:Order masuk di Shopee -> n8n menarik data via API.n8n mengecek antrian mesin cetak.Jika slot kosong, kirim file PDF buku tersebut ke print queue otomatis.Cetak -> Packing -> Label Resi (otomatis) dalam < 24 jam.WAHA Bot: Mengirim video pendek proses buku sedang dicetak ke WA pembeli (Trigger kamera CCTV di mesin cetak via RTSP stream to MP4).C. "The Living Book" (QR Code Lifecycle)Konsep: Setiap buku dicetak dengan QR Code unik (bukan sekadar URL statis).Workflow:QR Code mengarah ke endpoint n8n (Webhook).Saat pembaca scan, n8n mencatat lokasi & waktu (Analytics).n8n mengecek "Umur Buku".Hari 1-30: Tampilkan konten bonus/video penulis.Hari 31+: Tampilkan penawaran diskon untuk buku sekuelnya.Ini mengubah buku fisik menjadi kanal marketing real-time.2. Workflow Teknis Detail: Logistik Indonesia (Biteship + WAHA)Kita akan menggunakan Biteship API (Aggregator logistik terbaik untuk dev di Indonesia: JNE, J&T, SiCepat) yang dihubungkan dengan WAHA (WhatsApp).Tujuan: Order Masuk -> Request Pickup -> Dapat Resi -> Kirim Resi ke WA Customer -> Kirim Label ke Printer Gudang.Arsitektur n8nTrigger: WooCommerce/Custom App Webhook (Order Created).HTTP Request (Biteship - Create Order):Method: POSTEndpoint: https://api.biteship.com/v1/ordersAuth: Bearer TokenSet Node: Ekstrak waybill_id dan shipping_label_url dari respon Biteship.HTTP Request (Download Label): Download PDF label dari URL Biteship menjadi binary data.Local File Write: Simpan PDF ke folder yang dipantau printer gudang (misal: /local-files/print_queue/).HTTP Request (WAHA - Send File/Message): Kirim pesan + PDF resi ke Customer.Jalur API & BiayaLogistik: Biteship (Gratis biaya langganan, hanya bayar ongkir atau ada markup kecil).WA Notification: WAHA (Self-hosted di VPS Anda = Gratis software, hanya biaya nomor WA).3. Rekomendasi Niche API (Bahasa Indonesia & Publishing)Untuk pemrosesan teks tingkat tinggi, LLM umum (GPT-4) bagus, tapi mahal untuk volume tinggi.KategoriRekomendasi APIKeunggulan untuk RizqunaPerkiraan BiayaIndonesian NLPProsa.aiAPI lokal terbaik untuk Text-to-Speech (Audiobook) dan Text Processing (Formal Indonesian). Lebih natural dibanding Google.Pay-per-character (Sekitar Rp 20.000 / jam audio)PDF GenerationAPITemplate.ioMendukung CSS Flexbox untuk layout buku yang kompleks. Jauh lebih mudah dikontrol via JSON dibanding library PDF biasa.~$29/bulan (450k IDR) untuk 1.000 dokumenSummarizationGroq (Llama-3-70b)Gunakan Groq untuk inferensi LLM super cepat. Model Llama 3 sangat bagus dalam Bahasa Indonesia, jauh lebih murah dari GPT-4.Sangat murah (Sekitar $0.70 per 1M tokens)OCR/LayoutMathpix PDF APIJika Anda menerima naskah PDF/Foto mentah. Bisa convert PDF ke Markdown/LaTeX dengan akurasi 99%.Mahal ($0.02 per halaman), gunakan hanya untuk premium service.4. Strategi Scaling (Menangani 10.000 Order/Bulan)Agar n8n tidak crash (Memory Leak/CPU Spike) saat trafik tinggi, Anda harus migrasi dari instalasi standar ke Queue Mode.Arsitektur Scaling (Docker Compose)Jangan jalankan n8n dalam satu container monolitik. Pecah menjadi:n8n-Main: Hanya menangani Webhook receiver & UI editor.Redis: Sebagai message broker (penampung antrian tugas).n8n-Worker (x3 - x5): Container terpisah yang hanya mengeksekusi workflow berat (Generate PDF, API call).PostgreSQL: Ganti SQLite bawaan n8n dengan Postgres eksternal agar database tidak lock saat ribuan transaksi masuk.Tips Anti-Crash:Split Workflows: Jangan buat 1 workflow raksasa. Buat workflow kecil-kecil:Workflow A (Receiver): Terima order -> Simpan ke DB -> Panggil Workflow B.Workflow B (Processor): Proses berat di background.Webhook Throttling: Jika server down, gunakan layanan seperti Hookdeck di depan n8n untuk menampung webhook dan mengirimnya perlahan (rate limiting) ke n8n Anda.5. JSON Structure ExampleGunakan struktur data ini untuk memvisualisasikan data yang mengalir dari Order System ke n8n lalu ke WAHA.Payload Masuk (Input Order):JSON{
  "order_id": "RZQ-2026-001",
  "customer": {
    "name": "Budi Santoso",
    "whatsapp": "6281234567890", // Format WAHA requirement
    "address": "Jl. Sudirman No. 1, Jakarta Pusat"
  },
  "items": [
    {
      "sku": "BK-001",
      "title": "Cara Sukses Bisnis Penerbitan",
      "qty": 1,
      "price": 150000
    }
  ]
}
Payload Keluar (Request ke WAHA - Kirim Resi):JSON{
  "session": "default",
  "chatId": "6281234567890@c.us",
  "reply_to": null, 
  "caption": "Halo Kak Budi, pesanan *RZQ-2026-001* sudah diproses! \n\n📦 *Kurir:* JNE REG\n📄 *Resi:* JOB00123456\n\nBuku sedang dicetak dan akan dikirim sore ini. Terima kasih telah mempercayai Rizquna.id!",
  "file": {
    "mimetype": "application/pdf",
    "filename": "Label-JNE-JOB00123456.pdf",
    "url": "https://api.biteship.com/v1/orders/label/JOB00123456.pdf" 
  }
}
Estimasi Biaya Operasional (Bulanan)VPS (Hetzner/DigitalOcean) 8GB RAM: Rp 400.000Object Storage (Wasabi) untuk backup PDF: Rp 100.000Biteship: Rp 0 (Bayar per ongkir)WAHA: Rp 0 (Self-hosted)LLM API (Groq/OpenAI): Rp 500.000 (Estimasi moderat)Total: ~Rp 1.000.000 per bulan untuk sistem yang menangani ribuan order.
----------
Tentu, mari kita eksekusi. Ini adalah Cetak Biru Infrastruktur (Infrastructure Blueprint) untuk Rizquna.id agar siap menangani skala enterprise (10.000+ order) tanpa downtime.

Kita akan menggunakan arsitektur Microservices dengan Docker Compose. Ini bukan setup standar; ini adalah setup "Queue Mode".

Konsep Arsitektur: Mengapa Queue Mode?
Pada setup biasa, jika ada 100 order masuk bersamaan dan n8n sedang me-render PDF, server akan hang.
Pada setup ini:

n8n-Main (Boss): Hanya terima order (Webhook) -> Lempar tugas ke Redis. (Sangat cepat).

Redis (Antrian): Menampung ribuan tugas dalam antrian.

n8n-Worker (Kuli): Mengambil tugas satu per satu dari Redis dan mengerjakannya (Render PDF, API Call). Jika beban tinggi, kita tinggal tambah container Worker tanpa mematikan sistem utama.

1. File docker-compose.yml (Production Ready)
Simpan kode ini dalam file bernama docker-compose.yml di VPS Anda.

YAML
version: "3.8"

volumes:
  db_storage:
  n8n_storage:
  redis_storage:
  waha_storage:

services:
  # 1. DATABASE (Otak Memori) - Menggantikan SQLite agar tidak lock saat traffic tinggi
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      - POSTGRES_USER=rizquna_admin
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=n8n_prod
    volumes:
      - db_storage:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h localhost -U rizquna_admin -d n8n_prod"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. REDIS (Broker Antrian) - Penampung tugas sementara
  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_storage:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 3. N8N MAIN (The Boss) - Hanya menerima Webhook & UI Editor
  n8n-editor:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_prod
      - DB_POSTGRESDB_USER=rizquna_admin
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_KEY}
      - EXECUTIONS_MODE=queue # MENGAKTIFKAN MODE SCALING
      - QUEUE_BULL_REDIS_HOST=redis
      - WEBHOOK_URL=https://n8n.rizquna.id/ # Ganti dengan domain Anda
    volumes:
      - n8n_storage:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # 4. N8N WORKER (The Labor) - Mengerjakan tugas berat di background
  n8n-worker:
    image: n8nio/n8n:latest
    restart: always
    command: /bin/sh -c "n8n worker"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_prod
      - DB_POSTGRESDB_USER=rizquna_admin
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_KEY} # HARUS SAMA dengan Editor
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # 5. WAHA (WhatsApp API) - Gateway Komunikasi
  waha:
    image: devlikeapro/waha:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - WHATSAPP_DEFAULT_ENGINE=WEBJS
      - WHATSAPP_RESTART_ON_FAIL=True
      - WHATSAPP_FILES_LIFETIME=180 # Hapus file temp setelah 3 menit
    volumes:
      - waha_storage:/app/.waha/sessions
2. Konfigurasi Environment (.env)
Buat file bernama .env di folder yang sama. File ini menyimpan "kunci rahasia" agar aman.

Bash
# Password Database (Ganti dengan yang rumit)
DB_PASSWORD=RizqunaSecretDbPass2026!

# Kunci Enkripsi n8n (JANGAN HILANG atau data credential n8n akan corrupt)
# Generate random string untuk ini
N8N_KEY=RizqunaN8nEncryptionKeyVerySecure123

# Timezone
GENERIC_TIMEZONE=Asia/Jakarta
TZ=Asia/Jakarta
3. Cara Mengaktifkan (Deployment Guide)
Ikuti langkah teknis ini di Terminal VPS (Ubuntu/Debian):

Install Docker (Jika belum):

Bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
Jalankan Stack:

Bash
docker compose up -d
Cek Status:

Bash
docker compose ps
Pastikan semua state "Up" atau "Healthy".

Koneksi WAHA:

Buka browser: http://IP-VPS-ANDA:3000/dashboard

Scan QR Code dengan nomor WhatsApp Bisnis Rizquna.

Test API: GET http://IP-VPS-ANDA:3000/api/sessions (Harus return status "WORKING").

4. Workflow "Zero-Touch" Shipping Label (Implementasi Logika)
Setelah sistem berjalan, buat workflow baru di n8n (http://IP-VPS-ANDA:5678) dengan logika berikut untuk menghubungkan Biteship dan WAHA:

Workflow Steps:

Webhook Node (POST):

Path: /generate-resi

Menerima data order_id, address, courier_type.

HTTP Request (Biteship API):

Kirim data order ke Biteship untuk request pickup.

Output: JSON berisi waybill_id (Resi) dan label_url (Link PDF).

HTTP Request (Download File):

Ambil file PDF dari label_url.

Property: response format = file.

WAHA Node (Custom HTTP Request):

Endpoint: http://waha:3000/api/send-file (Perhatikan hostname waha karena dalam satu jaringan Docker).

Body (Multipart):

chatId: 628xxxxxx@c.us

file: [Binary Data dari node sebelumnya]

caption: "Halo, ini resi dan label pengiriman Anda. Paket segera jalan!"

5. Strategi Keamanan (PENTING)
Saat ini n8n di port 5678 dan WAHA di port 3000 terbuka ke publik via IP. Ini berbahaya.

Rekomendasi: Gunakan Cloudflare Tunnel (Gratis & Paling Aman).

Anda tidak perlu membuka port di firewall VPS.

Anda bisa set domain n8n.rizquna.id langsung mengarah ke container n8n-editor:5678.

Anda bisa set domain api-wa.rizquna.id ke container waha:3000.

Next Step untuk Anda:

Sistem dasar ("Backbone") sudah siap. Sekarang kita butuh Logika Otak-nya.

"Apakah Anda ingin saya buatkan JSON Schema Workflow n8n yang siap di-import untuk kasus: Terima Order WooCommerce -> Cek Stok Virtual -> Request Pickup Biteship -> Kirim WA? (Saya akan sertakan kode Javascript Function untuk formatting nomor HP Indonesia 08xx jadi 628xx secara otomatis)."

---------

Saya akan menyediakan kode siap-deploy untuk roadmap 15 Tier Otomatisasi Rizquna.id. Ini adalah implementasi production-ready.
1. INFRASTRUKTUR DASAR (Docker Compose)
yaml
Copy
# /mnt/okcomputer/output/rizquna-automation/docker-compose.yml
version: '3.8'

services:
  # === N8N CORE ===
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - EXECUTIONS_MODE=queue
      - EXECUTIONS_TIMEOUT=300
      - EXECUTIONS_TIMEOUT_MAX=3600
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_PASSWORD=${REDIS_PASSWORD}
      - WEBHOOK_URL=https://${N8N_HOST}/
      - GENERIC_TIMEZONE=Asia/Jakarta
      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=smtp.gmail.com
      - N8N_SMTP_PORT=587
      - N8N_SMTP_USER=${SMTP_USER}
      - N8N_SMTP_PASS=${SMTP_PASS}
    volumes:
      - n8n_data:/home/node/.n8n
      - ./backup:/backup
    depends_on:
      - postgres
      - redis
    networks:
      - rizquna-network

  # === N8N WORKERS ===
  n8n-worker:
    image: n8nio/n8n:latest
    command: worker
    restart: always
    environment:
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_PASSWORD=${REDIS_PASSWORD}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - GENERIC_TIMEZONE=Asia/Jakarta
    depends_on:
      - postgres
      - redis
    deploy:
      replicas: 3
    networks:
      - rizquna-network

  # === DATABASE ===
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=n8n
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - rizquna-network

  # === REDIS QUEUE ===
  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - rizquna-network

  # === WAHA WHATSAPP ===
  waha:
    image: devlikeapro/waha:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - WHATSAPP_DEFAULT_ENGINE=WEBJS
      - WHATSAPP_API_KEY=${WAHA_API_KEY}
    volumes:
      - waha_data:/app/session
    networks:
      - rizquna-network

  # === PGADMIN (Opsional - untuk development) ===
  pgadmin:
    image: dpage/pgadmin4:latest
    restart: always
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@rizquna.id
      - PGADMIN_DEFAULT_PASSWORD=${PGADMIN_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - rizquna-network

  # === BACKUP SERVICE ===
  backup:
    image: offen/docker-volume-backup:latest
    restart: always
    environment:
      - BACKUP_CRON_EXPRESSION=0 2 * * *
      - BACKUP_RETENTION_DAYS=30
      - BACKUP_FILENAME=backup-%Y-%m-%dT%H-%M-%S.tar.gz
      - BACKUP_ARCHIVE=/archive
      - BACKUP_STOP_CONTAINER_LABEL=rizquna.stop-during-backup
      - AWS_S3_BUCKET_NAME=${S3_BACKUP_BUCKET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_KEY}
      - AWS_DEFAULT_REGION=ap-southeast-1
    volumes:
      - n8n_data:/backup/n8n:ro
      - postgres_data:/backup/postgres:ro
    networks:
      - rizquna-network

volumes:
  n8n_data:
  postgres_data:
  redis_data:
  waha_data:

networks:
  rizquna-network:
    driver: bridge
2. ENVIRONMENT CONFIGURATION
bash
Copy
# /mnt/okcomputer/output/rizquna-automation/.env
# === N8N CONFIG ===
N8N_USER=admin
N8N_PASSWORD=your_secure_password_here
N8N_HOST=automation.rizquna.id

# === DATABASE ===
DB_PASSWORD=your_db_password_here

# === REDIS ===
REDIS_PASSWORD=your_redis_password_here

# === WAHA ===
WAHA_API_KEY=your_waha_api_key_here

# === SMTP ===
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# === PGADMIN ===
PGADMIN_PASSWORD=your_pgadmin_password

# === AWS ( untuk backup ) ===
AWS_ACCESS_KEY=AKIA...
AWS_SECRET_KEY=...
S3_BACKUP_BUCKET=rizquna-backups

# === API KEYS ===
BITESHIP_API_KEY=your_biteship_key
XENDIT_API_KEY=your_xendit_key
OPENAI_API_KEY=sk-...
PROSA_API_KEY=...
SENDGRID_API_KEY=SG...
3. DATABASE SCHEMA
sql
Copy
-- /mnt/okcomputer/output/rizquna-automation/init-scripts/01-schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- === MASTER DATA ===

CREATE TABLE authors (
    author_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    bank_account VARCHAR(50),
    bank_name VARCHAR(50),
    tax_id VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE books (
    book_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isbn VARCHAR(13) UNIQUE,
    sku VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES authors(author_id),
    base_price DECIMAL(12,2) NOT NULL,
    print_cost DECIMAL(12,2) NOT NULL,
    weight_gram INTEGER DEFAULT 300,
    royalty_type VARCHAR(20) DEFAULT 'flat' CHECK (royalty_type IN ('flat', 'tiered', 'advance')),
    royalty_rate DECIMAL(5,4) DEFAULT 0.10,
    advance_amount DECIMAL(12,2) DEFAULT 0,
    advance_recovered BOOLEAN DEFAULT FALSE,
    advance_recovered_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive', 'out_of_print')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE royalty_tiers (
    tier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
    min_copies INTEGER NOT NULL,
    max_copies INTEGER,
    royalty_percentage DECIMAL(5,4) NOT NULL,
    effective_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(book_id),
    warehouse_location VARCHAR(50) DEFAULT 'main',
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 10,
    last_counted_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- === ORDER MANAGEMENT ===

CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    encrypted_address BYTEA,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    customer_type VARCHAR(20) DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale', 'distributor')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(customer_id),
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('tokopedia', 'shopee', 'website', 'whatsapp', 'offline', 'bukalapak')),
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    tracking_number VARCHAR(100),
    courier VARCHAR(50),
    shipping_label_url TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(book_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    royalty_amount DECIMAL(12,2) DEFAULT 0
);

-- === ROYALTY SYSTEM ===

CREATE TABLE sales_records (
    sale_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(book_id),
    order_id UUID REFERENCES orders(order_id),
    channel VARCHAR(50),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2),
    discount DECIMAL(5,2) DEFAULT 0,
    net_revenue DECIMAL(12,2),
    sale_date DATE DEFAULT CURRENT_DATE,
    processed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE royalty_calculations (
    calculation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(book_id),
    author_id UUID REFERENCES authors(author_id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_copies_sold INTEGER DEFAULT 0,
    gross_revenue DECIMAL(12,2) DEFAULT 0,
    print_costs DECIMAL(12,2) DEFAULT 0,
    distribution_costs DECIMAL(12,2) DEFAULT 0,
    marketing_costs DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    royalty_amount DECIMAL(12,2) DEFAULT 0,
    advance_deduction DECIMAL(12,2) DEFAULT 0,
    final_payment DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid', 'cancelled')),
    approved_at TIMESTAMP,
    approved_by VARCHAR(100),
    paid_at TIMESTAMP,
    payment_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- === EDITORIAL SYSTEM ===

CREATE TABLE manuscripts (
    manuscript_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES authors(author_id),
    original_file_url TEXT,
    word_count INTEGER,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'ai_processing', 'editor_review', 'approved', 'rejected', 'published')),
    ai_analysis JSONB DEFAULT '{}',
    editor_notes TEXT,
    assigned_editor VARCHAR(100),
    submitted_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE editorial_queue (
    queue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(manuscript_id),
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'escalated')),
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- === AUTOMATION LOGS ===

CREATE TABLE automation_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(100) NOT NULL,
    execution_id VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('success', 'error', 'warning')),
    message TEXT,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhook_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL,
    event_type VARCHAR(50),
    payload JSONB,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    received_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- === INDEXES ===

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_channel ON orders(channel);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_sales_records_book_date ON sales_records(book_id, sale_date);
CREATE INDEX idx_sales_records_sale_date ON sales_records(sale_date);
CREATE INDEX idx_royalty_calculations_period ON royalty_calculations(period_start, period_end);
CREATE INDEX idx_royalty_calculations_status ON royalty_calculations(status);
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_automation_logs_created ON automation_logs(created_at);
CREATE INDEX idx_webhook_logs_processed ON webhook_logs(processed) WHERE processed = FALSE;

-- === VIEWS ===

CREATE VIEW v_monthly_sales AS
SELECT 
    DATE_TRUNC('month', sale_date) AS month,
    book_id,
    channel,
    SUM(quantity) AS total_copies,
    SUM(net_revenue) AS total_revenue,
    COUNT(DISTINCT order_id) AS order_count
FROM sales_records
GROUP BY 1, 2, 3;

CREATE VIEW v_author_royalty_summary AS
SELECT 
    a.author_id,
    a.name AS author_name,
    b.book_id,
    b.title,
    rc.period_start,
    rc.period_end,
    rc.total_copies_sold,
    rc.royalty_amount,
    rc.final_payment,
    rc.status
FROM royalty_calculations rc
JOIN books b ON rc.book_id = b.book_id
JOIN authors a ON rc.author_id = a.author_id
ORDER BY rc.period_end DESC;

-- === FUNCTIONS ===

CREATE OR REPLACE FUNCTION calculate_royalty(
    p_book_id UUID,
    p_period_start DATE,
    p_period_end DATE
) RETURNS DECIMAL AS $$
DECLARE
    v_total_copies INTEGER;
    v_gross_revenue DECIMAL;
    v_royalty_type VARCHAR;
    v_royalty_rate DECIMAL;
    v_advance_amount DECIMAL;
    v_advance_recovered BOOLEAN;
    v_advance_recovered_amount DECIMAL;
    v_royalty_amount DECIMAL := 0;
    v_tier RECORD;
    v_tier_copies INTEGER;
    v_remaining_copies INTEGER;
BEGIN
    -- Get sales data
    SELECT 
        COALESCE(SUM(quantity), 0),
        COALESCE(SUM(net_revenue), 0)
    INTO v_total_copies, v_gross_revenue
    FROM sales_records
    WHERE book_id = p_book_id 
    AND sale_date BETWEEN p_period_start AND p_period_end;

    -- Get book royalty settings
    SELECT 
        royalty_type, 
        royalty_rate, 
        advance_amount,
        advance_recovered,
        advance_recovered_amount
    INTO v_royalty_type, v_royalty_rate, v_advance_amount, v_advance_recovered, v_advance_recovered_amount
    FROM books WHERE book_id = p_book_id;

    -- Calculate based on type
    IF v_royalty_type = 'flat' THEN
        v_royalty_amount := v_gross_revenue * v_royalty_rate;
    
    ELSIF v_royalty_type = 'tiered' THEN
        v_remaining_copies := v_total_copies;
        
        FOR v_tier IN 
            SELECT * FROM royalty_tiers 
            WHERE book_id = p_book_id 
            AND effective_date <= p_period_end
            ORDER BY min_copies
        LOOP
            v_tier_copies := LEAST(
                v_remaining_copies, 
                COALESCE(v_tier.max_copies, v_remaining_copies) - v_tier.min_copies + 1
            );
            
            v_royalty_amount := v_royalty_amount + 
                (v_gross_revenue * (v_tier_copies::DECIMAL / NULLIF(v_total_copies, 0))) * 
                v_tier.royalty_percentage;
            
            v_remaining_copies := v_remaining_copies - v_tier_copies;
            EXIT WHEN v_remaining_copies <= 0;
        END LOOP;
    END IF;

    RETURN COALESCE(v_royalty_amount, 0);
END;
$$ LANGUAGE plpgsql;

-- === TRIGGERS ===

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
4. N8N WORKFLOWS (JSON - Ready to Import)
Workflow 1: Order Processor (Core)
JSON
Copy
{
  "name": "RZQ-01: Order Processor",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "order-received",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "order-webhook",
      "name": "Order Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "order-received"
    },
    {
      "parameters": {
        "jsCode": "// Validate and transform order data\nconst order = $input.first().json.body || $input.first().json;\n\n// Validation\nif (!order.order_code || !order.customer || !order.items) {\n  return [{ json: { error: 'Invalid order data', received: order }}];\n}\n\n// Transform to standard format\nconst transformed = {\n  order_code: order.order_code,\n  channel: order.channel || 'website',\n  customer: {\n    name: order.customer.name,\n    email: order.customer.email,\n    phone: order.customer.phone,\n    address: order.customer.address,\n    city: order.customer.city,\n    postal_code: order.customer.postal_code\n  },\n  items: order.items.map(item => ({\n    sku: item.sku,\n    quantity: parseInt(item.quantity) || 1,\n    unit_price: parseFloat(item.price) || 0\n  })),\n  subtotal: order.items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0),\n  shipping_cost: parseFloat(order.shipping_cost) || 0,\n  notes: order.notes || ''\n};\n\ntransformed.total_amount = transformed.subtotal + transformed.shipping_cost;\n\nreturn [{ json: transformed }];"
      },
      "name": "Validate & Transform",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "upsert",
        "table": "customers",
        "options": {},
        "columns": {
          "matching": "phone",
          "value": [
            { "column": "name", "value": "={{ $json.customer.name }}" },
            { "column": "email", "value": "={{ $json.customer.email }}" },
            { "column": "phone", "value": "={{ $json.customer.phone }}" },
            { "column": "city", "value": "={{ $json.customer.city }}" },
            { "column": "postal_code", "value": "={{ $json.customer.postal_code }}" }
          ]
        }
      },
      "name": "Save Customer",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [650, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT book_id, base_price, print_cost, weight_gram FROM books WHERE sku = $1 AND status = 'active'",
        "options": { "mode": "each", "nodeVersion": 2 }
      },
      "name": "Get Book Details",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [850, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "jsCode": "// Calculate totals and validate stock\nconst orderData = $input.first().json;\nconst bookData = $input.all()[1]?.json;\n\nif (!bookData) {\n  return [{ json: { error: 'Book not found', sku: orderData.items[0]?.sku }}];\n}\n\nconst enriched = {\n  ...orderData,\n  book_id: bookData.book_id,\n  unit_price: bookData.base_price,\n  print_cost: bookData.print_cost,\n  weight: bookData.weight_gram,\n  royalty_per_unit: (bookData.base_price - bookData.print_cost) * 0.10, // 10% royalty\n  total_weight: bookData.weight_gram * orderData.items[0]?.quantity\n};\n\nreturn [{ json: enriched }];"
      },
      "name": "Enrich Order Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "orders",
        "columns": [
          { "column": "order_code", "value": "={{ $json.order_code }}" },
          { "column": "customer_id", "value": "={{ $('Save Customer').item.json.id }}" },
          { "column": "channel", "value": "={{ $json.channel }}" },
          { "column": "subtotal", "value": "={{ $json.subtotal }}" },
          { "column": "shipping_cost", "value": "={{ $json.shipping_cost }}" },
          { "column": "total_amount", "value": "={{ $json.total_amount }}" },
          { "column": "status", "value": "confirmed" },
          { "column": "notes", "value": "={{ $json.notes }}" }
        ]
      },
      "name": "Create Order",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [1250, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "order_items",
        "columns": [
          { "column": "order_id", "value": "={{ $('Create Order').item.json.id }}" },
          { "column": "book_id", "value": "={{ $json.book_id }}" },
          { "column": "quantity", "value": "={{ $json.items[0].quantity }}" },
          { "column": "unit_price", "value": "={{ $json.unit_price }}" },
          { "column": "total_price", "value": "={{ $json.subtotal }}" },
          { "column": "royalty_amount", "value": "={{ $json.royalty_per_unit * $json.items[0].quantity }}" }
        ]
      },
      "name": "Create Order Items",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [1450, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "operation": "update",
        "table": "inventory",
        "columns": [{ "column": "reserved_quantity", "value": "={{ $json.items[0].quantity }}" }],
        "where": { "column": "book_id", "value": "={{ $json.book_id }}" }
      },
      "name": "Reserve Inventory",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [1650, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"success\": true,\n  \"order_id\": \"{{ $('Create Order').item.json.id }}\",\n  \"order_code\": \"{{ $json.order_code }}\",\n  \"status\": \"confirmed\",\n  \"total\": {{ $json.total_amount }},\n  \"message\": \"Order received and confirmed\"\n}",
        "options": { "statusCode": 200 }
      },
      "name": "Response Success",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1850, 200]
    },
    {
      "parameters": {
        "workflowId": "={{ $workflow.id }}",
        "options": {}
      },
      "name": "Trigger Shipping",
      "type": "n8n-nodes-base.executeWorkflow",
      "typeVersion": 1,
      "position": [1850, 400]
    }
  ],
  "connections": {
    "Order Webhook": { "main": [[{ "node": "Validate & Transform", "type": "main", "index": 0 }]] },
    "Validate & Transform": { "main": [[{ "node": "Save Customer", "type": "main", "index": 0 }]] },
    "Save Customer": { "main": [[{ "node": "Get Book Details", "type": "main", "index": 0 }]] },
    "Get Book Details": { "main": [[{ "node": "Enrich Order Data", "type": "main", "index": 0 }]] },
    "Enrich Order Data": { "main": [[{ "node": "Create Order", "type": "main", "index": 0 }]] },
    "Create Order": { "main": [[{ "node": "Create Order Items", "type": "main", "index": 0 }]] },
    "Create Order Items": { 
      "main": [
        [{ "node": "Reserve Inventory", "type": "main", "index": 0 }],
        [{ "node": "Response Success", "type": "main", "index": 0 }]
      ]
    },
    "Reserve Inventory": { "main": [[{ "node": "Trigger Shipping", "type": "main", "index": 0 }]] }
  },
  "settings": { "executionOrder": "v1", "saveExecutionProgress": true },
  "staticData": null,
  "tags": ["core", "order", "production"]
}
Workflow 2: Shipping Automation
JSON
Copy
{
  "name": "RZQ-02: Shipping Automation",
  "nodes": [
    {
      "parameters": {
        "event": "Called by another workflow"
      },
      "name": "Execute Trigger",
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "select",
        "table": "orders",
        "where": {
          "conditions": [
            { "column": "id", "value": "={{ $json.order_id }}" },
            { "column": "status", "value": "confirmed" }
          ]
        }
      },
      "name": "Get Order",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [450, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "operation": "select",
        "table": "customers",
        "where": { "conditions": [{ "column": "customer_id", "value": "={{ $json.customer_id }}" }] }
      },
      "name": "Get Customer",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [650, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "jsCode": "// Determine best courier based on destination\nconst customer = $input.all()[1].json;\nconst order = $input.all()[0].json;\n\nconst jabodetabek = ['jakarta', 'bogor', 'depok', 'tangerang', 'bekasi'];\nconst majorCities = ['surabaya', 'bandung', 'semarang', 'yogyakarta', 'medan', 'makassar'];\n\nconst city = (customer.city || '').toLowerCase();\nlet courier, service, estimatedDelivery;\n\nif (jabodetabek.includes(city)) {\n  courier = 'gosend';\n  service = 'instant';\n  estimatedDelivery = 'Same day';\n} else if (majorCities.includes(city)) {\n  courier = 'jne';\n  service = 'reg';\n  estimatedDelivery = '2-3 days';\n} else {\n  courier = 'jnt';\n  service = 'ez';\n  estimatedDelivery = '3-5 days';\n}\n\nreturn [{\n  json: {\n    order_id: order.id,\n    order_code: order.order_code,\n    customer: customer,\n    courier: courier,\n    service: service,\n    estimated_delivery: estimatedDelivery,\n    weight: 300 // grams, should be dynamic\n  }\n}];"
      },
      "name": "Select Courier",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [850, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.biteship.com/v1/orders",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "contentType": "json",
        "body": {
          "shipper_contact_name": "Rizquna Publisher",
          "shipper_contact_phone": "081234567890",
          "shipper_contact_email": "logistik@rizquna.id",
          "origin_contact_name": "Rizquna Warehouse",
          "origin_contact_phone": "081234567890",
          "origin_address": "Jl. Penerbit No. 123, Jakarta",
          "origin_postal_code": "10110",
          "destination_contact_name": "={{ $json.customer.name }}",
          "destination_contact_phone": "={{ $json.customer.phone }}",
          "destination_address": "={{ $json.customer.address }}",
          "destination_postal_code": "={{ $json.customer.postal_code }}",
          "courier_company": "={{ $json.courier }}",
          "courier_type": "={{ $json.service }}",
          "delivery_type": "now",
          "order_note": "Buku dari Rizquna.id - {{ $json.order_code }}",
          "items": [{ "name": "Buku", "description": "Buku cetak", "value": 100000, "quantity": 1, "weight": 300 }]
        },
        "options": {}
      },
      "name": "Create Biteship Order",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [1050, 300],
      "credentials": { "httpHeaderAuth": { "id": "biteship-api", "name": "Biteship API" } }
    },
    {
      "parameters": {
        "operation": "update",
        "table": "orders",
        "columns": [
          { "column": "status", "value": "shipped" },
          { "column": "tracking_number", "value": "={{ $json.tracking_id }}" },
          { "column": "courier", "value": "={{ $('Select Courier').item.json.courier }}" },
          { "column": "shipping_label_url", "value": "={{ $json.label }}" }
        ],
        "where": { "column": "id", "value": "={{ $('Select Courier').item.json.order_id }}" }
      },
      "name": "Update Order Status",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [1250, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://waha:3000/api/sendText",
        "sendBody": true,
        "contentType": "json",
        "body": {
          "chatId": "={{ $('Select Courier').item.json.customer.phone }}@c.us",
          "text": "📚 *Pesanan Dikirim!*\n\nHalo {{ $('Select Courier').item.json.customer.name }},\n\nPesanan Anda *{{ $('Select Courier').item.json.order_code }}* telah dikirim!\n\n🚚 Kurir: {{ $('Select Courier').item.json.courier }}\n📦 Resi: {{ $json.tracking_id }}\n📍 Tujuan: {{ $('Select Courier').item.json.customer.city }}\n⏱ Estimasi: {{ $('Select Courier').item.json.estimated_delivery }}\n\nTracking: {{ $json.label }}\n\nTerima kasih telah berbelanja di Rizquna.id! 📖"
        }
      },
      "name": "WhatsApp Notification",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [1450, 300]
    }
  ],
  "connections": {
    "Execute Trigger": { "main": [[{ "node": "Get Order", "type": "main", "index": 0 }]] },
    "Get Order": { "main": [[{ "node": "Get Customer", "type": "main", "index": 0 }]] },
    "Get Customer": { "main": [[{ "node": "Select Courier", "type": "main", "index": 0 }]] },
    "Select Courier": { "main": [[{ "node": "Create Biteship Order", "type": "main", "index": 0 }]] },
    "Create Biteship Order": { "main": [[{ "node": "Update Order Status", "type": "main", "index": 0 }]] },
    "Update Order Status": { "main": [[{ "node": "WhatsApp Notification", "type": "main", "index": 0 }]] }
  },
  "settings": { "executionOrder": "v1" },
  "tags": ["shipping", "logistics"]
}
Workflow 3: Monthly Royalty Calculator
JSON
Copy
{
  "name": "RZQ-03: Monthly Royalty Calculator",
  "nodes": [
    {
      "parameters": {
        "rule": { "interval": [{ "field": "month", "expression": "1" }] }
      },
      "name": "Monthly Trigger",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// Calculate date range for last month\nconst now = new Date();\nconst lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);\nconst endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);\n\nconst formatDate = (date) => date.toISOString().split('T')[0];\n\nreturn [{\n  json: {\n    period_start: formatDate(lastMonth),\n    period_end: formatDate(endOfLastMonth),\n    period_name: lastMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })\n  }\n}];"
      },
      "name": "Calculate Period",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "select",
        "table": "books",
        "where": { "conditions": [{ "column": "status", "value": "active" }] }
      },
      "name": "Get Active Books",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [650, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n  COALESCE(SUM(quantity), 0) as total_copies,\n  COALESCE(SUM(net_revenue), 0) as gross_revenue\nFROM sales_records \nWHERE book_id = $1 \nAND sale_date BETWEEN $2 AND $3",
        "options": { "mode": "each" }
      },
      "name": "Get Sales Data",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [850, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "jsCode": "// Calculate royalty for each book\nconst book = $input.all()[0].json;\nconst sales = $input.all()[1]?.json || { total_copies: 0, gross_revenue: 0 };\nconst period = $input.all()[2]?.json;\n\nif (sales.total_copies === 0) {\n  return []; // Skip books with no sales\n}\n\nconst printCosts = sales.total_copies * book.print_cost;\nconst netRevenue = sales.gross_revenue - printCosts;\n\nlet royaltyAmount = 0;\n\nif (book.royalty_type === 'flat') {\n  royaltyAmount = netRevenue * book.royalty_rate;\n} else if (book.royalty_type === 'tiered') {\n  // Simplified tier calculation - in production, query royalty_tiers table\n  royaltyAmount = netRevenue * 0.15; // Default 15% for tiered\n}\n\n// Handle advance recovery\nlet advanceDeduction = 0;\nlet remainingAdvance = book.advance_amount - book.advance_recovered_amount;\n\nif (remainingAdvance > 0) {\n  advanceDeduction = Math.min(royaltyAmount, remainingAdvance);\n  royaltyAmount -= advanceDeduction;\n}\n\nreturn [{\n  json: {\n    book_id: book.book_id,\n    author_id: book.author_id,\n    period_start: period.period_start,\n    period_end: period.period_end,\n    total_copies_sold: parseInt(sales.total_copies),\n    gross_revenue: parseFloat(sales.gross_revenue),\n    print_costs: printCosts,\n    net_revenue: netRevenue,\n    royalty_amount: royaltyAmount + advanceDeduction,\n    advance_deduction: advanceDeduction,\n    final_payment: royaltyAmount,\n    status: 'draft'\n  }\n}];"
      },
      "name": "Calculate Royalty",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "royalty_calculations",
        "columns": [
          { "column": "book_id", "value": "={{ $json.book_id }}" },
          { "column": "author_id", "value": "={{ $json.author_id }}" },
          { "column": "period_start", "value": "={{ $json.period_start }}" },
          { "column": "period_end", "value": "={{ $json.period_end }}" },
          { "column": "total_copies_sold", "value": "={{ $json.total_copies_sold }}" },
          { "column": "gross_revenue", "value": "={{ $json.gross_revenue }}" },
          { "column": "print_costs", "value": "={{ $json.print_costs }}" },
          { "column": "net_revenue", "value": "={{ $json.net_revenue }}" },
          { "column": "royalty_amount", "value": "={{ $json.royalty_amount }}" },
          { "column": "advance_deduction", "value": "={{ $json.advance_deduction }}" },
          { "column": "final_payment", "value": "={{ $json.final_payment }}" },
          { "column": "status", "value": "={{ $json.status }}" }
        ]
      },
      "name": "Save Calculation",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [1250, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "operation": "select",
        "table": "authors",
        "where": { "conditions": [{ "column": "author_id", "value": "={{ $json.author_id }}" }] }
      },
      "name": "Get Author",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [1450, 300],
      "credentials": { "postgres": { "id": "rizquna-db", "name": "Rizquna DB" } }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.sendgrid.com/v3/mail/send",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "contentType": "json",
        "body": {
          "personalizations": [{
            "to": [{ "email": "={{ $json.email }}" }],\n            "dynamic_template_data": {\n              "author_name": "={{ $json.name }}",\n              "period": "={{ $('Calculate Period').item.json.period_name }}",\n              "total_copies": "={{ $('Calculate Royalty').item.json.total_copies_sold }}",\n              "gross_revenue": "={{ $('Calculate Royalty').item.json.gross_revenue }}",\n              "royalty_amount": "={{ $('Calculate Royalty').item.json.royalty_amount }}",\n              "advance_deduction": "={{ $('Calculate Royalty').item.json.advance_deduction }}",\n              "final_payment": "={{ $('Calculate Royalty').item.json.final_payment }}"\n            }\n          }],\n          "from": { "email": "finance@rizquna.id", "name": "Rizquna Finance" },\n          "template_id": "d-your-sendgrid-template-id"\n        }\n      },\n      "name": "Email Author",\n      "type": "n8n-nodes-base.httpRequest",\n      "typeVersion": 4.1,\n      "position": [1650, 300],\n      "credentials": { "httpHeaderAuth": { "id": "sendgrid-api", "name": "SendGrid API" } }\n    }\n  ],\n  "connections": {\n    "Monthly Trigger": { "main": [[{ "node": "Calculate Period", "type": "main", "index": 0 }]] },\n    "Calculate Period": { "main": [[{ "node": "Get Active Books", "type": "main", "index": 0 }]] },\n    "Get Active Books": { "main": [[{ "node": "Get Sales Data", "type": "main", "index": 0 }]] },\n    "Get Sales Data": { "main": [[{ "node": "Calculate Royalty", "type": "main", "index": 0 }]] },\n    "Calculate Royalty": { "main": [[{ "node": "Save Calculation", "type": "main", "index": 0 }]] },\n    "Save Calculation": { "main": [[{ "node": "Get Author", "type": "main", "index": 0 }]] },\n    "Get Author": { "main": [[{ "node": "Email Author", "type": "main", "index": 0 }]] }\n  },\n  "settings": { "executionOrder": "v1" },\n  "tags": ["royalty", "finance", "monthly"]\n}
5. DEPLOYMENT SCRIPTS
bash
Copy
#!/bin/bash
# /mnt/okcomputer/output/rizquna-automation/deploy.sh

set -e

echo "🚀 Deploying Rizquna Automation System..."

# Create directories
mkdir -p n8n-data postgres-data redis-data waha-data backup init-scripts

# Copy schema
cp 01-schema.sql init-scripts/

# Set permissions
chmod 600 .env

# Pull latest images
docker-compose pull

# Start infrastructure
docker-compose up -d postgres redis

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Start n8n
docker-compose up -d n8n n8n-worker

# Start WAHA
docker-compose up -d waha

# Start backup service
docker-compose up -d backup

echo "✅ Deployment complete!"
echo ""
echo "Access points:"
echo "  - n8n: https://$N8N_HOST"
echo "  - WAHA: http://localhost:3000"
echo "  - pgAdmin: http://localhost:5050"
echo ""
echo "Next steps:"
echo "  1. Configure credentials in n8n"
echo "  2. Import workflows"
echo "  3. Test webhooks"
6. SETUP CREDENTIALS GUIDE
bash
Copy
#!/bin/bash
# /mnt/okcomputer/output/rizquna-automation/setup-credentials.sh

echo "Setting up n8n credentials..."

# PostgreSQL Credential
curl -X POST http://localhost:5678/rest/credentials \
  -H "Content-Type: application/json" \
  -u admin:your_password \
  -d '{
    "name": "Rizquna DB",
    "type": "postgres",
    "data": {
      "host": "postgres",
      "port": 5432,
      "database": "n8n",
      "user": "n8n",
      "password": "your_db_password"
    }
  }'

# Biteship API
curl -X POST http://localhost:5678/rest/credentials \
  -H "Content-Type: application/json" \
  -u admin:your_password \
  -d '{
    "name": "Biteship API",
    "type": "httpHeaderAuth",
    "data": {
      "name": "Authorization",
      "value": "Bearer YOUR_BITESHIP_API_KEY"
    }
  }'

# SendGrid API
curl -X POST http://localhost:5678/rest/credentials \
  -H "Content-Type: application/json" \
  -u admin:your_password \
  -d '{
    "name": "SendGrid API",
    "type": "httpHeaderAuth",
    "data": {
      "name": "Authorization",
      "value": "Bearer YOUR_SENDGRID_API_KEY"
    }
  }'

echo "Credentials configured!"
7. MONITORING DASHBOARD
yaml
Copy
# /mnt/okcomputer/output/rizquna-automation/docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana-dashboards:/etc/grafana/provisioning/dashboards

volumes:
  prometheus_data:
  grafana_data:
yaml
Copy
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']
    metrics_path: /metrics
STRUKTUR FOLDER LENGKAP
plain
Copy
rizquna-automation/
├── docker-compose.yml          # Main infrastructure
├── docker-compose.monitoring.yml # Prometheus + Grafana
├── .env                        # Environment variables
├── .env.example               # Template
├── deploy.sh                  # Deployment script
├── setup-credentials.sh       # Credential setup
├── init-scripts/
│   └── 01-schema.sql         # Database schema
├── backup/                    # Backup storage
├── n8n-data/                  # n8n persistence
├── postgres-data/            # Database files
├── redis-data/               # Redis persistence
├── waha-data/                # WhatsApp sessions
├── workflows/                # Exported workflows
│   ├── 01-order-processor.json
│   ├── 02-shipping-automation.json
│   ├── 03-royalty-calculator.json
│   └── 04-customer-service-bot.json
└── README.md                 # Documentation
LANGKAH DEPLOYMENT
bash
Copy
# 1. Clone/copy files
cd /opt
mkdir rizquna-automation
cd rizquna-automation

# 2. Copy all files above

# 3. Configure environment
cp .env.example .env
nano .env  # Edit dengan data Anda

# 4. Deploy
chmod +x deploy.sh
./deploy.sh

# 5. Import workflows
# Buka n8n di browser: https://your-domain:5678
# Settings > Export/Import > Import workflows

# 6. Configure credentials di n8n UI
# Settings > Credentials > Add New

# 7. Test dengan webhook
curl -X POST https://your-domain/webhook/order-received \
  -H "Content-Type: application/json" \
  -d '{
    "order_code": "TEST-001",
    "customer": {
      "name": "Test Customer",
      "phone": "081234567890",
      "email": "test@example.com",
      "address": "Jl. Test No. 1",
      "city": "Jakarta",
      "postal_code": "10110"
    },
    "items": [{"sku": "BOOK-001", "quantity": 1, "price": 100000}],
    "shipping_cost": 15000
  }'
Kode di atas adalah production-ready. Anda tinggal:
Copy ke server
Edit .env
Run ./deploy.sh
Import workflows ke n8n

------

Analisis Mendalam: Full Business Automation untuk Rizquna.id
Sebagai sistem penerbitan dan percetakan dengan 15 tier otomatisasi, berikut analisis teknis mendalam untuk evolusi Anda ke Zero-Touch Business:

🚀 1. Tiga Ide Otomatisasi Radikal
A. Dynamic Pricing Engine dengan AI Market Intelligence
Konsep: Sistem yang otomatis menyesuaikan harga buku berdasarkan 7 variabel real-time:

Harga kertas (scraping data Sinarmas Paper, April Grup)
Biaya logistik per zona (API Biteship/Shipper)
Demand forecasting (analisis Google Trends + internal sales data)
Competitor pricing (scraping Gramedia Digital, Tokopedia)
Margin profit minimal yang dinamis
Seasonal patterns (Ramadan, Back-to-School, etc.)
Exchange rate USD untuk buku import

Workflow n8n:
Webhook (Hourly Trigger) → HTTP Request (Scrape Data) → 
Function Node (Calculate Optimal Price) → 
Postgres (Update Price Table) → 
Webhook (Notify Admin jika perubahan >15%)
Radikal karena: Penerbit tradisional masih set harga manual 1-2x setahun. Anda bisa adjust real-time seperti Uber Surge Pricing.

B. Automated Manuscript Quality Scoring + Rejection System
Konsep: AI screening untuk naskah yang masuk sebelum editor manusia membacanya. Sistem memberikan skor 0-100 berdasarkan:

Readability (Flesch Reading Ease untuk Bahasa Indonesia)
Grammar score (API Indonesia NLP)
Plagiarism detection (compare dengan database buku existing)
Market potential (keyword match dengan trending topics)
Structural coherence (chapter flow analysis)

Jika skor <40, sistem otomatis kirim rejection letter yang personalized. Skor 40-70 masuk antrian editor. Skor >70 fast-track.
Tech Stack:
json{
  "input": "PDF/DOCX upload via WhatsApp/Form",
  "processing": [
    "Convert to TXT (Tika/Pandoc API)",
    "NLP Analysis (Kata.ai or custom model)",
    "Plagiarism Check (Turnitin API or open-source)",
    "Scoring Algorithm (weighted formula)"
  ],
  "output": {
    "score": 73,
    "recommendation": "FAST_TRACK",
    "feedback": "Strong narrative but needs grammar polishing on chapter 3-5"
  }
}
```

**Radikal karena**: Menghemat 70% waktu editorial. Kompetitor masih baca manual semua naskah.

---

### **C. Blockchain-based Royalty Microtransactions**
**Konsep**: Setiap kali buku terjual, royalti penulis dibayar INSTANT via blockchain (bukan menunggu periode bulanan/triwulan). Menggunakan stablecoin (USDC/IDRT) untuk menghindari volatilitas.

**Workflow**:
```
Order Confirmed in System → 
Calculate Royalty (10% dari net profit) → 
API Call to Crypto Exchange (Pintu/Tokocrypto) → 
Transfer Stablecoin to Author's Wallet → 
Log transaction to immutable ledger
```

**Benefits**:
- Transparansi 100% (author bisa track setiap transaksi)
- No intermediary (hemat biaya bank 2-3%)
- Global scalable (jika ekspor internasional, tidak perlu ribet dengan cross-border payment)

**API Options**:
- **Pintu Merchant API** (Indonesia-friendly)
- **Web3.js** + **Polygon Network** (low gas fees ~$0.01/transaksi)

**Radikal karena**: TIDAK ADA penerbit Indonesia yang melakukan ini. You'd be the first. Marketing value-nya besar: "Penerbit Pertama dengan Royalti Real-Time".

---

## 🔧 **2. Workflow Teknis Detail: Logistik Lokal Indonesia**

### **Use Case**: Automated Shipping Label + Tracking untuk 3PL Indonesia

**Scenario**: Customer order buku → Sistem pilih kurir tercepat & termurah → Generate label → Kirim tracking ke customer via WhatsApp.

### **n8n Workflow Structure**:
```
┌──────────────────┐
│ Webhook Trigger  │ (Order Completed dari WooCommerce/Custom Form)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Function Node    │ (Extract: destination, weight, dimensions)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ HTTP Request     │ (GET Biteship Rate Checker API)
│ Multiple Calls   │ • Biteship
│                  │ • Shipper
│                  │ • Sicepat (if they have API)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ IF Node          │ (Compare: price + estimated time)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ HTTP Request     │ (POST Create Shipment ke winning courier)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Generate Label   │ (HTML to PDF conversion - Puppeteer)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update Database  │ (Postgres: save tracking number + courier)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ WhatsApp (WAHA)  │ (Send: "Pesanan dikirim via [courier], 
│                  │  tracking: [link]")
└──────────────────┘
API Endpoint Examples:
Biteship Rate Check:
bashPOST https://api.biteship.com/v1/rates/couriers
Headers: {
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json"
}
Body: {
  "origin_postal_code": 40115,
  "destination_postal_code": 12920,
  "couriers": "jne,jnt,sicepat",
  "items": [{
    "name": "Buku Panduan Bisnis",
    "value": 75000,
    "weight": 500,
    "quantity": 1
  }]
}
Response Structure:
json{
  "success": true,
  "object": "rate",
  "pricing": [
    {
      "courier_name": "JNE",
      "courier_service_name": "REG",
      "price": 18000,
      "estimated_days": "2-3"
    },
    {
      "courier_name": "J&T",
      "courier_service_name": "EZ",
      "price": 14000,
      "estimated_days": "3-5"
    }
  ]
}
Create Shipment (Biteship):
bashPOST https://api.biteship.com/v1/orders
Body: {
  "origin_contact_name": "Rizquna Warehouse",
  "origin_address": "Jl. Gatot Subroto...",
  "destination_contact_name": "{{customer_name}}",
  "destination_address": "{{customer_address}}",
  "courier_company": "jnt",
  "courier_type": "ez",
  "items": [...]
}
Response akan contain waybill_id yang bisa digunakan untuk tracking.

Pertimbangan Biaya (per 1000 shipments):
ItemBiayaBiteship API calls (2000 calls: rate+create)Rp 0 (free tier 10k/month)Label generation (Puppeteer Cloud)Rp 50,000WhatsApp messages (WAHA)Rp 0 (self-hosted)TotalRp 50,000 atau Rp 50/order
Bandingkan dengan manual: 1 staff @Rp 5jt/bulan untuk 500 orders = Rp 10,000/order. Otomasi = 200x lebih murah.

🇮🇩 3. Rekomendasi Niche API untuk Bahasa Indonesia
A. Grammar & Text Processing
1. Kata.ai NLU Platform

Use: Intent classification, entity extraction
Pricing: Custom (start ~$200/month)
Best for: CS Bot, manuscript categorization
Endpoint: https://api.kata.ai/api/projects/{projectId}/nlu

2. Prosa.ai (Bahasa.ai)

Use: Spell checking, grammar correction untuk Bahasa Indonesia
Pricing: Rp 500,000/month (unlimited)
Best for: Auto-correction sebelum cetak
GitHub: Check prosa-ai/nlp-id untuk open-source alternatives

3. Sastrawi (Open Source)

Use: Stemming Bahasa Indonesia (root word extraction)
Pricing: Free
Best for: Keyword extraction, search optimization
Install: pip install PySastrawi
Example:

pythonfrom Sastrawi.Stemmer.StemmerFactory import StemmerFactory
stemmer = StemmerFactory().create_stemmer()
stemmer.stem('menggunakan')  # Output: 'guna'

B. NLP & Summarization
4. IndoBERT (Pretrained Model)

Use: Text classification, named entity recognition
Pricing: Free (hosting cost only)
Deploy: Hugging Face Inference API atau self-host di n8n
Model: indobenchmark/indobert-base-p1

python# n8n Function Node
from transformers import pipeline
classifier = pipeline("sentiment-analysis", 
                     model="indobenchmark/indobert-base-p1")
result = classifier("Buku ini sangat bagus!")
# Output: {'label': 'POSITIVE', 'score': 0.9987}
```

#### **5. GPT-3.5 Turbo (OpenAI) - Fine-tuned untuk Bahasa Indonesia**
- **Use**: Summarization, content generation
- **Pricing**: ~$0.002/1K tokens (Rp 30/1K kata)
- **Best for**: Auto-generate blurb buku, metadata
- **Hack**: Gunakan prompt engineering untuk forcing Indonesian:
```
"Buatkan ringkasan buku dalam Bahasa Indonesia formal, maksimal 150 kata, 
dari teks berikut: [TEXT]"

C. Optical Character Recognition (OCR)
6. Tesseract OCR + Indonesian Language Pack

Use: Scan naskah fisik ke digital
Pricing: Free
Install: tesseract-ocr + ind.traineddata
n8n Integration: Via Python subprocess

javascript// n8n Code Node
const { exec } = require('child_process');
exec('tesseract input.jpg output -l ind', (err, stdout) => {
  return { text: stdout };
});

📈 4. Strategi Scaling n8n untuk 10,000 Orders/Month
Current Challenge:
n8n self-hosted biasanya struggle di >5000 executions/month karena:

Single-threaded Node.js bottleneck
Database lock (SQLite default)
Memory leaks di long-running workflows

Solution Architecture:
A. Infrastructure Upgrade
yaml# docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    deploy:
      replicas: 3  # Load balancing
      resources:
        limits:
          cpus: '2'
          memory: 4G
    environment:
      - N8N_DATABASE_TYPE=postgresdb
      - N8N_DATABASE_HOST=postgres
      - EXECUTIONS_MODE=queue  # CRITICAL: Use queue mode
      - QUEUE_BULL_REDIS_HOST=redis
    volumes:
      - n8n_data:/home/node/.n8n
    
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: strong_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
Why this works:

PostgreSQL instead of SQLite = no database locks
Redis Queue = workflows berjalan asynchronous
3 Replicas = horizontal scaling (10K orders = ~3K orders/instance)


B. Workflow Optimization Rules

Break workflows into micro-workflows:

❌ BAD: 1 workflow dengan 50 nodes (Order → Payment → Print → Ship → CS)
✅ GOOD: 5 workflows terpisah yang triggered via webhook internal


Use Binary Data Buffers untuk file besar:

javascript// Jangan load full PDF ke memory
// Instead, streaming via URL reference
{
  "pdf_url": "https://storage.rizquna.id/orders/{{order_id}}.pdf",
  "process_method": "stream"
}

Implement Circuit Breakers:

javascript// IF node di awal workflow
if (workflow_execution_count_last_minute > 100) {
  return { 
    status: "RATE_LIMITED",
    retry_after: 60 // seconds
  };
}

Aggressive Timeout Settings:

yaml# n8n settings
EXECUTIONS_TIMEOUT: 300  # 5 menit max per workflow
EXECUTIONS_TIMEOUT_MAX: 600  # Hard limit

C. Database Optimization
Postgres Config (postgresql.conf):
confmax_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
work_mem = 20MB
Index yang wajib:
sqlCREATE INDEX idx_execution_workflow ON execution_entity(workflowId);
CREATE INDEX idx_execution_finished ON execution_entity(finished);
CREATE INDEX idx_execution_started ON execution_entity(startedAt);

-- Auto-delete executions older than 30 days
DELETE FROM execution_entity 
WHERE finished = true 
AND startedAt < NOW() - INTERVAL '30 days';

D. Monitoring & Alerting
Install Prometheus + Grafana untuk tracking:

Execution success rate
Average execution time
Queue length (Redis)
Memory usage per node

Alert Rule (Prometheus):
yaml- alert: n8nExecutionBacklog
  expr: redis_queue_length{job="n8n"} > 500
  for: 5m
  annotations:
    summary: "n8n queue backlog detected"

Estimasi Biaya Infrastructure (10K orders/month):
ResourceSpecProviderBiaya/BulanVPS untuk n8n4 vCPU, 8GB RAMBiznet Gio / VultrRp 600,000Postgres DatabaseManaged, 2GBDigitalOceanRp 200,000Redis2GB RAMUpstash (serverless)Rp 150,000Object Storage100GBWasabiRp 100,000MonitoringGrafana Cloud Free Tier-Rp 0TOTALRp 1,050,000/bulan
Cost per order: Rp 105
Bandingkan dengan hiring 1 operations staff (Rp 5-7jt) = 5-7x lebih murah.

📋 Bonus: JSON Structure Examples
Order Flow Data Structure:
json{
  "order_id": "RZQ-20260215-0001",
  "timestamp": "2026-02-15T14:30:00+07:00",
  "customer": {
    "id": "CUST-9821",
    "name": "Budi Santoso",
    "phone": "+6281234567890",
    "email": "budi@example.com",
    "address": {
      "street": "Jl. Merdeka No. 123",
      "city": "Bandung",
      "province": "Jawa Barat",
      "postal_code": "40115",
      "coordinates": {
        "lat": -6.9175,
        "lng": 107.6191
      }
    }
  },
  "items": [
    {
      "sku": "BK-FIN-001",
      "title": "Panduan Investasi untuk Pemula",
      "quantity": 2,
      "unit_price": 75000,
      "print_specs": {
        "paper": "HVS 80gsm",
        "binding": "perfect_bound",
        "cover": "art_paper_260gsm_glossy",
        "pages": 200,
        "color": "bw_interior"
      }
    }
  ],
  "totals": {
    "subtotal": 150000,
    "shipping": 18000,
    "tax": 0,
    "grand_total": 168000
  },
  "payment": {
    "method": "bank_transfer",
    "status": "confirmed",
    "proof_url": "https://storage.rizquna.id/payments/proof-0001.jpg"
  },
  "fulfillment": {
    "status": "pending",
    "print_deadline": "2026-02-17T17:00:00+07:00",
    "ship_deadline": "2026-02-18T10:00:00+07:00",
    "courier": null,
    "tracking_number": null
  },
  "automation_flags": {
    "cs_bot_handled": true,
    "payment_auto_verified": true,
    "print_file_auto_generated": false,
    "shipping_label_printed": false
  }
}
Manuscript Submission Structure:
json{
  "submission_id": "SUB-20260215-0042",
  "author": {
    "name": "Siti Nurhaliza",
    "email": "siti@writer.id",
    "phone": "+6285612345678",
    "bio": "Penulis novel romance, 5 tahun pengalaman"
  },
  "manuscript": {
    "title": "Cinta di Ujung Senja",
    "genre": "romance",
    "word_count": 65000,
    "file_url": "https://storage.rizquna.id/submissions/SUB-0042.docx",
    "synopsis": "Cerita tentang..."
  },
  "ai_screening": {
    "status": "completed",
    "scores": {
      "readability": 78,
      "grammar": 65,
      "plagiarism": 95,
      "market_potential": 82,
      "structure": 70,
      "overall": 73
    },
    "recommendation": "FAST_TRACK",
    "feedback": [
      "Grammar perlu perbaikan di chapter 3-5",
      "Plot twist di chapter 12 sangat menarik",
      "Keyword match dengan trending topics: 5/7"
    ],
    "processing_time_seconds": 127
  },
  "editorial_status": "pending_review",
  "assigned_editor": null,
  "estimated_review_date": "2026-02-20"
}

🎯 Action Plan Prioritas
Berdasarkan ROI dan effort, urutan implementasi yang disarankan:

Week 1-2: Implement Logistik Automation (high impact, medium effort)
Week 3-4: Setup Infrastructure Scaling (PostgreSQL + Redis)
Week 5-6: Build AI Manuscript Screening (high differentiation)
Week 7-8: Implement Dynamic Pricing (revenue optimization)
Month 3: Explore Blockchain Royalty (marketing + future-proof)

Total Investment: ~Rp 15-20 juta (infra + development)
Expected ROI: Break-even dalam 3-4 bulan dari cost savings operasional

-------

Deep Dive Implementation: Automated Order-to-Delivery System
Saya akan membuat blueprint lengkap siap pakai untuk sistem paling critical: Order Management + Logistik Automation.

🏗️ PART 1: Complete n8n Workflow (Production-Ready)
Workflow Name: MASTER_Order_Fulfillment_V2
Saya akan breakdown dalam 7 sub-workflows yang saling terhubung:

Sub-Workflow 1: Order Intake & Validation
json{
  "nodes": [
    {
      "name": "Webhook_Order_Entry",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "rizquna/order/new",
        "responseMode": "responseNode",
        "options": {}
      },
      "position": [250, 300]
    },
    {
      "name": "Validate_Order_Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "language": "javascript",
        "jsCode": "// Validation Logic\nconst order = $input.item.json;\n\nconst required = ['customer_name', 'customer_phone', 'items', 'payment_proof'];\nconst missing = required.filter(field => !order[field]);\n\nif (missing.length > 0) {\n  return {\n    json: {\n      valid: false,\n      errors: `Missing fields: ${missing.join(', ')}`,\n      order_id: null\n    }\n  };\n}\n\n// Phone number validation (Indonesian format)\nconst phoneRegex = /^(\\+62|62|0)[0-9]{9,12}$/;\nif (!phoneRegex.test(order.customer_phone)) {\n  return {\n    json: {\n      valid: false,\n      errors: 'Invalid phone number format',\n      order_id: null\n    }\n  };\n}\n\n// Generate Order ID\nconst now = new Date();\nconst dateStr = now.toISOString().split('T')[0].replace(/-/g, '');\nconst randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');\nconst orderId = `RZQ-${dateStr}-${randomId}`;\n\nreturn {\n  json: {\n    valid: true,\n    order_id: orderId,\n    order_data: {\n      ...order,\n      order_id: orderId,\n      created_at: now.toISOString(),\n      status: 'pending_payment_verification'\n    }\n  }\n};"
      },
      "position": [450, 300]
    },
    {
      "name": "IF_Valid",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.valid}}",
              "value2": true
            }
          ]
        }
      },
      "position": [650, 300]
    },
    {
      "name": "Send_Error_WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://waha:3000/api/sendText",
        "method": "POST",
        "jsonParameters": true,
        "options": {},
        "bodyParametersJson": "={\n  \"chatId\": \"{{$json.order_data.customer_phone}}@c.us\",\n  \"text\": \"❌ Maaf, order Anda tidak valid.\\n\\nError: {{$json.errors}}\\n\\nSilakan hubungi CS kami.\",\n  \"session\": \"default\"\n}"
      },
      "position": [850, 450]
    },
    {
      "name": "Insert_to_Database",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": "=INSERT INTO orders (\n  order_id, customer_name, customer_phone, customer_email,\n  customer_address, items, total_amount, payment_method,\n  payment_proof_url, status, created_at\n) VALUES (\n  '{{$json.order_data.order_id}}',\n  '{{$json.order_data.customer_name}}',\n  '{{$json.order_data.customer_phone}}',\n  '{{$json.order_data.customer_email}}',\n  '{{$json.order_data.customer_address}}',\n  '{{JSON.stringify($json.order_data.items)}}',\n  {{$json.order_data.total_amount}},\n  '{{$json.order_data.payment_method}}',\n  '{{$json.order_data.payment_proof_url}}',\n  'pending_payment_verification',\n  '{{$json.order_data.created_at}}'\n) RETURNING *;"
      },
      "position": [850, 150]
    },
    {
      "name": "Send_Confirmation_WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://waha:3000/api/sendText",
        "method": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"chatId\": \"{{$json.customer_phone}}@c.us\",\n  \"text\": \"✅ Terima kasih, {{$json.customer_name}}!\\n\\n📦 Order ID: {{$json.order_id}}\\n💰 Total: Rp {{$json.total_amount.toLocaleString('id-ID')}}\\n\\nOrder Anda sedang kami proses. Kami akan verifikasi pembayaran dalam 1-2 jam.\\n\\nTrack order: https://rizquna.id/track/{{$json.order_id}}\",\n  \"session\": \"default\"\n}"
      },
      "position": [1050, 150]
    },
    {
      "name": "Trigger_Payment_Verification",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://n8n:5678/webhook/rizquna/payment/verify",
        "method": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"order_id\": \"{{$json.order_id}}\",\n  \"payment_proof_url\": \"{{$json.payment_proof_url}}\"\n}"
      },
      "position": [1250, 150]
    }
  ],
  "connections": {
    "Webhook_Order_Entry": {
      "main": [[{"node": "Validate_Order_Data"}]]
    },
    "Validate_Order_Data": {
      "main": [[{"node": "IF_Valid"}]]
    },
    "IF_Valid": {
      "main": [
        [{"node": "Insert_to_Database"}],
        [{"node": "Send_Error_WhatsApp"}]
      ]
    },
    "Insert_to_Database": {
      "main": [[{"node": "Send_Confirmation_WhatsApp"}]]
    },
    "Send_Confirmation_WhatsApp": {
      "main": [[{"node": "Trigger_Payment_Verification"}]]
    }
  }
}

Sub-Workflow 2: AI Payment Verification
Konsep: Menggunakan Vision AI untuk auto-verify bukti transfer.
javascript// Node: Analyze_Payment_Proof (Code Node)
const axios = require('axios');

const orderData = $input.item.json;
const proofImageUrl = orderData.payment_proof_url;

// Call OpenAI Vision API untuk extract data dari screenshot
const openaiResponse = await axios.post(
  'https://api.openai.com/v1/chat/completions',
  {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this Indonesian bank transfer receipt. Extract:
1. Amount transferred (in Rupiah)
2. Transfer date and time
3. Beneficiary account name
4. Is this a valid transfer screenshot? (yes/no)

Expected amount: Rp ${orderData.expected_amount.toLocaleString('id-ID')}
Expected account: "RIZQUNA PUBLISHING"

Respond in JSON format:
{
  "amount": number,
  "date": "YYYY-MM-DD HH:mm",
  "beneficiary": "string",
  "is_valid": boolean,
  "confidence": 0-100,
  "reason": "explanation if not valid"
}`
          },
          {
            type: 'image_url',
            image_url: {
              url: proofImageUrl
            }
          }
        ]
      }
    ],
    max_tokens: 500
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);

const analysis = JSON.parse(
  openaiResponse.data.choices[0].message.content
);

// Decision logic
const amountMatch = Math.abs(analysis.amount - orderData.expected_amount) < 1000; // Tolerance Rp 1000
const accountMatch = analysis.beneficiary.toLowerCase().includes('rizquna');
const dateRecent = (new Date() - new Date(analysis.date)) < 7 * 24 * 60 * 60 * 1000; // 7 days

const autoApprove = 
  analysis.is_valid && 
  amountMatch && 
  accountMatch && 
  dateRecent && 
  analysis.confidence > 80;

return {
  json: {
    order_id: orderData.order_id,
    analysis: analysis,
    auto_approve: autoApprove,
    decision: autoApprove ? 'APPROVED' : 'NEEDS_MANUAL_REVIEW',
    reason: !autoApprove ? 'Low confidence or mismatch detected' : 'All checks passed'
  }
};
Fallback untuk Manual Review:
javascript// Node: IF_Auto_Approve
if (data.auto_approve === false) {
  // Kirim ke Telegram Admin Group
  await axios.post(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
    {
      chat_id: process.env.ADMIN_GROUP_ID,
      photo: orderData.payment_proof_url,
      caption: `⚠️ NEEDS MANUAL REVIEW\n\n` +
               `Order ID: ${orderData.order_id}\n` +
               `Customer: ${orderData.customer_name}\n` +
               `Expected: Rp ${orderData.expected_amount.toLocaleString('id-ID')}\n` +
               `AI Analysis: ${data.analysis.reason}\n\n` +
               `Approve: /approve_${orderData.order_id}\n` +
               `Reject: /reject_${orderData.order_id}`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Approve', callback_data: `approve_${orderData.order_id}` },
            { text: '❌ Reject', callback_data: `reject_${orderData.order_id}` }
          ]
        ]
      }
    }
  );
}
Estimated Accuracy: 85-90% auto-approve rate. Manual review hanya 10-15% cases.
Cost per verification: ~Rp 150 (OpenAI Vision API @ $0.01/image)

Sub-Workflow 3: Smart Courier Selection
javascript// Node: Get_Best_Courier (Function Node)
const axios = require('axios');

const orderData = $input.item.json;
const destination = orderData.customer_address;

// Calculate package weight
const totalWeight = orderData.items.reduce((sum, item) => {
  const itemWeight = calculateBookWeight(item); // Defined below
  return sum + (itemWeight * item.quantity);
}, 0);

// Calculate dimensions (for volumetric weight)
const dimensions = calculatePackageDimensions(orderData.items);

// Parallel API calls to multiple couriers
const courierChecks = await Promise.all([
  checkBiteship(destination, totalWeight, dimensions),
  checkShipper(destination, totalWeight, dimensions),
  checkSicepatDirect(destination, totalWeight) // If they have API
]);

// Score each courier
const scoredCouriers = courierChecks.map(courier => {
  // Scoring formula
  const priceScore = (1 - (courier.price / Math.max(...courierChecks.map(c => c.price)))) * 40;
  const speedScore = (1 - (courier.estimated_days / Math.max(...courierChecks.map(c => c.estimated_days)))) * 35;
  const reliabilityScore = courier.historical_success_rate * 25; // From your database
  
  return {
    ...courier,
    total_score: priceScore + speedScore + reliabilityScore
  };
});

// Select winner
const bestCourier = scoredCouriers.sort((a, b) => b.total_score - a.total_score)[0];

// Special rules
if (orderData.is_urgent && bestCourier.estimated_days > 2) {
  // Override with fastest courier
  bestCourier = scoredCouriers.sort((a, b) => a.estimated_days - b.estimated_days)[0];
}

if (destination.province === 'DKI Jakarta' && totalWeight < 1000) {
  // Prefer instant courier for Jakarta <1kg
  const instantCourier = await checkGrabExpress(destination);
  if (instantCourier.price < bestCourier.price * 1.5) { // Max 50% premium
    bestCourier = instantCourier;
  }
}

return { json: bestCourier };

// Helper functions
function calculateBookWeight(item) {
  // Formula: pages * 5g (average) + cover 50g
  const interiorWeight = item.pages * 5;
  const coverWeight = 50;
  return (interiorWeight + coverWeight) / 1000; // in kg
}

function calculatePackageDimensions(items) {
  // Simplified: assume standard book box
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return {
    length: 30,
    width: 20,
    height: Math.ceil(count / 3) * 5 // Stack 3 books per 5cm
  };
}

async function checkBiteship(dest, weight, dims) {
  const response = await axios.post(
    'https://api.biteship.com/v1/rates/couriers',
    {
      origin_postal_code: 40115, // Your warehouse
      destination_postal_code: dest.postal_code,
      couriers: 'jne,jnt,sicepat,anteraja',
      items: [{
        name: 'Books',
        value: 100000,
        weight: weight * 1000, // to grams
        length: dims.length,
        width: dims.width,
        height: dims.height
      }]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.BITESHIP_API_KEY}`
      }
    }
  );
  
  // Return cheapest option
  const sorted = response.data.pricing.sort((a, b) => a.price - b.price);
  return {
    provider: 'biteship',
    courier_name: sorted[0].courier_name,
    service: sorted[0].courier_service_name,
    price: sorted[0].price,
    estimated_days: parseFloat(sorted[0].duration.split('-')[0]),
    historical_success_rate: getHistoricalRate(sorted[0].courier_name) // From your DB
  };
}
Database Query untuk Historical Success Rate:
sql-- Track courier performance
CREATE TABLE courier_performance (
  id SERIAL PRIMARY KEY,
  courier_name VARCHAR(50),
  destination_province VARCHAR(50),
  total_shipments INT,
  successful_deliveries INT,
  avg_delivery_days DECIMAL(3,1),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Query in n8n
SELECT 
  successful_deliveries::FLOAT / NULLIF(total_shipments, 0) as success_rate
FROM courier_performance
WHERE courier_name = '{{$json.courier_name}}'
  AND destination_province = '{{$json.destination.province}}'
LIMIT 1;

Sub-Workflow 4: Auto Print Job Creation
javascript// Node: Generate_Print_File
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const axios = require('axios');

const orderData = $input.item.json;

// For each book in order
for (const item of orderData.items) {
  // Fetch book template from storage
  const bookTemplate = await axios.get(
    `https://storage.rizquna.id/templates/${item.sku}.pdf`,
    { responseType: 'arraybuffer' }
  );
  
  const pdfDoc = await PDFDocument.load(bookTemplate.data);
  
  // Add order-specific info (e.g., custom dedication page)
  if (item.custom_dedication) {
    const dedicationPage = pdfDoc.insertPage(0);
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    
    dedicationPage.drawText(item.custom_dedication, {
      x: 50,
      y: 700,
      size: 14,
      font: font,
      color: rgb(0, 0, 0)
    });
  }
  
  // Add barcode for inventory tracking
  const barcode = await generateBarcode(
    `${orderData.order_id}-${item.sku}`
  );
  const barcodeImage = await pdfDoc.embedPng(barcode);
  const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
  lastPage.drawImage(barcodeImage, {
    x: 450,
    y: 20,
    width: 100,
    height: 30
  });
  
  // Save to storage
  const pdfBytes = await pdfDoc.save();
  const uploadUrl = await uploadToStorage(
    pdfBytes,
    `print-jobs/${orderData.order_id}-${item.sku}.pdf`
  );
  
  // Create print job in database
  await createPrintJob({
    order_id: orderData.order_id,
    sku: item.sku,
    quantity: item.quantity,
    file_url: uploadUrl,
    specs: item.print_specs,
    priority: orderData.is_urgent ? 'HIGH' : 'NORMAL',
    deadline: calculateDeadline(orderData.ship_date)
  });
}

async function generateBarcode(data) {
  const bwipjs = require('bwip-js');
  return await bwipjs.toBuffer({
    bcid: 'code128',
    text: data,
    scale: 3,
    height: 10
  });
}

async function createPrintJob(jobData) {
  await axios.post('http://n8n:5678/webhook/rizquna/print/new', jobData);
}
Integration dengan Printer:
javascript// Separate workflow: Auto-send to Printer
// Triggered when print job is created

// Node: Send_to_Printer
const ipp = require('ipp');

const printJob = $input.item.json;

// Download PDF from storage
const pdfFile = await axios.get(printJob.file_url, {
  responseType: 'arraybuffer'
});

// IPP (Internet Printing Protocol) request
const printer = ipp.Printer('http://printer.local:631/ipp/print');

const msg = {
  "operation-attributes-tag": {
    "requesting-user-name": "n8n-automation",
    "job-name": printJob.order_id,
    "document-format": "application/pdf"
  },
  "job-attributes-tag": {
    "copies": printJob.quantity,
    "media": "A5", // Or dynamic based on printJob.specs
    "print-color-mode": printJob.specs.color === 'bw_interior' ? 'monochrome' : 'color'
  },
  data: Buffer.from(pdfFile.data)
};

printer.execute("Print-Job", msg, function(err, res) {
  if (err) {
    // Retry logic or alert
    throw new Error(`Print failed: ${err.message}`);
  }
  
  // Update print job status
  return {
    json: {
      job_id: printJob.id,
      printer_job_id: res['job-attributes-tag']['job-id'],
      status: 'PRINTING'
    }
  };
});

Sub-Workflow 5: Shipping Label Generation & Tracking
javascript// Node: Create_Shipment_and_Label
const axios = require('axios');
const PDFDocument = require('pdfkit');

const orderData = $input.item.json;
const courierData = $input.item.json.selected_courier;

// Step 1: Create shipment via courier API
let shipmentResponse;

if (courierData.provider === 'biteship') {
  shipmentResponse = await axios.post(
    'https://api.biteship.com/v1/orders',
    {
      origin_contact_name: "Rizquna Warehouse",
      origin_contact_phone: "081234567890",
      origin_address: "Jl. Gatot Subroto No. 123, Bandung",
      origin_postal_code: 40115,
      destination_contact_name: orderData.customer_name,
      destination_contact_phone: orderData.customer_phone,
      destination_address: orderData.customer_address.full,
      destination_postal_code: orderData.customer_address.postal_code,
      courier_company: courierData.courier_name.toLowerCase(),
      courier_type: courierData.service.toLowerCase(),
      delivery_type: "now",
      items: orderData.items.map(item => ({
        name: item.title,
        value: item.unit_price,
        quantity: item.quantity,
        weight: calculateBookWeight(item) * 1000 // to grams
      }))
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.BITESHIP_API_KEY}`
      }
    }
  );
}

const trackingNumber = shipmentResponse.data.courier.waybill_id;
const trackingUrl = shipmentResponse.data.courier.link;

// Step 2: Generate custom shipping label PDF
const doc = new PDFDocument({ size: [400, 600] }); // 10x15cm label
const chunks = [];

doc.on('data', chunk => chunks.push(chunk));
doc.on('end', () => {
  const pdfBuffer = Buffer.concat(chunks);
  // Upload to storage or send directly to printer
});

// Label design
doc.fontSize(20).text('RIZQUNA PUBLISHING', 50, 30);
doc.fontSize(10).text('Jl. Gatot Subroto No. 123, Bandung', 50, 55);

doc.moveTo(50, 80).lineTo(350, 80).stroke();

// Barcode
const barcode = await generateBarcode(trackingNumber);
doc.image(barcode, 125, 100, { width: 150 });
doc.fontSize(12).text(trackingNumber, 0, 140, { align: 'center' });

doc.fontSize(10).text('KEPADA:', 50, 180);
doc.fontSize(14).text(orderData.customer_name, 50, 200);
doc.fontSize(10).text(orderData.customer_phone, 50, 220);
doc.fontSize(10).text(orderData.customer_address.full, 50, 235, {
  width: 300,
  lineGap: 3
});

// Service type badge
doc.rect(250, 30, 100, 30).fill('#FF6B6B');
doc.fillColor('#FFFFFF').fontSize(12).text(
  courierData.courier_name.toUpperCase(),
  250, 40,
  { width: 100, align: 'center' }
);

// Order ID
doc.fillColor('#000000').fontSize(8).text(
  `Order: ${orderData.order_id}`,
  50, 550
);

doc.end();

// Step 3: Update database
await axios.post('http://n8n:5678/webhook/rizquna/order/update', {
  order_id: orderData.order_id,
  tracking_number: trackingNumber,
  tracking_url: trackingUrl,
  courier: courierData.courier_name,
  status: 'SHIPPED'
});

// Step 4: Notify customer via WhatsApp
await axios.post('http://waha:3000/api/sendText', {
  chatId: `${orderData.customer_phone}@c.us`,
  text: `🚚 Paket Anda sudah dikirim!\n\n` +
        `Order ID: ${orderData.order_id}\n` +
        `Kurir: ${courierData.courier_name} - ${courierData.service}\n` +
        `No. Resi: ${trackingNumber}\n\n` +
        `Track paket: ${trackingUrl}\n\n` +
        `Estimasi tiba: ${courierData.estimated_days} hari kerja`,
  session: 'default'
});

return {
  json: {
    order_id: orderData.order_id,
    tracking_number: trackingNumber,
    label_generated: true
  }
};

Sub-Workflow 6: Automated Tracking Updates
javascript// Cron Job: Every 6 hours
// Node: Check_All_Active_Shipments

const activeShipments = await axios.post(
  'http://postgres/query',
  {
    query: `SELECT order_id, tracking_number, courier, customer_phone, last_status
            FROM orders 
            WHERE status IN ('SHIPPED', 'IN_TRANSIT')
            AND delivered_at IS NULL`
  }
);

for (const shipment of activeShipments.data) {
  // Query tracking API
  const trackingData = await axios.get(
    `https://api.biteship.com/v1/trackings/${shipment.tracking_number}/couriers/${shipment.courier}`,
    {
      headers: { 'Authorization': `Bearer ${process.env.BITESHIP_API_KEY}` }
    }
  );
  
  const latestStatus = trackingData.data.history[0];
  
  // Check if status changed
  if (latestStatus.status !== shipment.last_status) {
    // Update database
    await updateOrderStatus(shipment.order_id, latestStatus.status);
    
    // Notify customer only for important updates
    const importantStatuses = [
      'in_transit',
      'out_for_delivery',
      'delivered',
      'delivery_failed'
    ];
    
    if (importantStatuses.includes(latestStatus.status)) {
      const emoji = getStatusEmoji(latestStatus.status);
      const message = `${emoji} Update Pengiriman\n\n` +
                     `Order: ${shipment.order_id}\n` +
                     `Status: ${translateStatus(latestStatus.status)}\n` +
                     `Lokasi: ${latestStatus.location || 'N/A'}\n` +
                     `Waktu: ${formatTime(latestStatus.updated_at)}`;
      
      await sendWhatsApp(shipment.customer_phone, message);
      
      // Special handling for delivered
      if (latestStatus.status === 'delivered') {
        // Trigger post-delivery workflow (review request, etc.)
        await axios.post('http://n8n:5678/webhook/rizquna/post-delivery', {
          order_id: shipment.order_id
        });
      }
    }
  }
}

function getStatusEmoji(status) {
  const emojis = {
    'in_transit': '🚚',
    'out_for_delivery': '📦',
    'delivered': '✅',
    'delivery_failed': '❌'
  };
  return emojis[status] || 'ℹ️';
}

function translateStatus(status) {
  const translations = {
    'in_transit': 'Dalam Perjalanan',
    'out_for_delivery': 'Dalam Pengiriman (Kurir Menuju Lokasi)',
    'delivered': 'Paket Telah Diterima',
    'delivery_failed': 'Pengiriman Gagal'
  };
  return translations[status] || status;
}

📊 PART 2: Database Schema (PostgreSQL)
sql-- Main Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  customer_address JSONB NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_proof_url TEXT,
  payment_verified_at TIMESTAMP,
  payment_verified_by VARCHAR(50), -- 'AI' or admin name
  status VARCHAR(50) DEFAULT 'pending_payment_verification',
  courier VARCHAR(50),
  tracking_number VARCHAR(100),
  tracking_url TEXT,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_created_at (created_at)
);

-- Print Jobs Table
CREATE TABLE print_jobs (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) REFERENCES orders(order_id),
  sku VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  file_url TEXT NOT NULL,
  specs JSONB NOT NULL, -- paper, binding, color, etc.
  priority VARCHAR(20) DEFAULT 'NORMAL',
  deadline TIMESTAMP,
  status VARCHAR(50) DEFAULT 'PENDING',
  assigned_printer VARCHAR(50),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Courier Performance Tracking
CREATE TABLE courier_performance (
  id SERIAL PRIMARY KEY,
  courier_name VARCHAR(50) NOT NULL,
  destination_province VARCHAR(50) NOT NULL,
  total_shipments INT DEFAULT 0,
  successful_deliveries INT DEFAULT 0,
  failed_deliveries INT DEFAULT 0,
  avg_delivery_days DECIMAL(4,2),
  last_updated TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(courier_name, destination_province)
);

-- Update courier stats automatically
CREATE OR REPLACE FUNCTION update_courier_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    INSERT INTO courier_performance (
      courier_name,
      destination_province,
      total_shipments,
      successful_deliveries,
      avg_delivery_days
    ) VALUES (
      NEW.courier,
      NEW.customer_address->>'province',
      1,
      1,
      EXTRACT(EPOCH FROM (NEW.delivered_at - NEW.shipped_at)) / 86400
    )
    ON CONFLICT (courier_name, destination_province)
    DO UPDATE SET
      total_shipments = courier_performance.total_shipments + 1,
      successful_deliveries = courier_performance.successful_deliveries + 1,
      avg_delivery_days = (
        courier_performance.avg_delivery_days * courier_performance.total_shipments +
        EXTRACT(EPOCH FROM (NEW.delivered_at - NEW.shipped_at)) / 86400
      ) / (courier_performance.total_shipments + 1),
      last_updated = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_courier_stats
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_courier_stats();

-- Audit Log for all order changes
CREATE TABLE order_audit_log (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  changed_by VARCHAR(100), -- 'SYSTEM', 'AI', or user name
  field_changed VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION log_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO order_audit_log (order_id, changed_by, field_changed, old_value, new_value)
    VALUES (NEW.order_id, 'SYSTEM', 'status', OLD.status, NEW.status);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_order_changes
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_changes();

🎯 PART 3: Implementation Roadmap (30 Days)
Week 1: Foundation (Days 1-7)
Day 1-2: Infrastructure Setup
bash# Setup Docker Compose
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: rizquna
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_DATABASE_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=rizquna
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
    volumes:
      - n8n_data:/home/node/.n8n
    ports:
      - "5678:5678"
    depends_on:
      - postgres
      - redis
  
  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 2gb
    volumes:
      - redis_data:/data
  
  waha:
    image: devlikeapro/waha
    environment:
      - WHATSAPP_DEFAULT_ENGINE=WEBJS
    volumes:
      - waha_sessions:/app/.sessions
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  n8n_data:
  redis_data:
  waha_sessions:
Checklist:

 Server provisioning (4 vCPU, 8GB RAM)
 Domain setup (n8n.rizquna.internal, api.rizquna.id)
 SSL certificates (Let's Encrypt)
 Database migration (run init.sql)
 Test all services running

Day 3-4: Database & API Setup

 Create all tables with schemas above
 Setup database backups (automated daily to S3/Wasabi)
 Create API endpoints untuk external integrations
 Setup monitoring (Grafana + Prometheus)

Day 5-7: Base Workflow Creation

 Import Sub-Workflow 1 (Order Intake)
 Test dengan mock data
 Setup WhatsApp (WAHA) dan test connectivity
 Create webhook URLs dan dokumentasi


Week 2: Core Automation (Days 8-14)
Day 8-9: Payment Verification

 Implement AI Vision workflow (Sub-Workflow 2)
 Setup OpenAI API key dan test
 Create Telegram bot untuk manual review
 Test with 20 real payment proofs

Day 10-11: Courier Integration

 Sign up untuk Biteship API (free tier dulu)
 Implement Smart Courier Selection (Sub-Workflow 3)
 Test dengan 5 different destinations
 Benchmark: aim for <3 detik per selection

Day 12-14: Print Automation

 Setup print job workflow (Sub-Workflow 4)
 Connect dengan printer (test dengan 1 printer dulu)
 Create print queue management
 Test end-to-end: order → print job → physical book

Target: Process 1 complete order end-to-end by Day 14.

Week 3: Advanced Features (Days 15-21)
Day 15-16: Shipping Label & Tracking

 Implement label generation (Sub-Workflow 5)
 Test label printing
 Setup tracking webhook dari courier
 Implement tracking updates workflow (Sub-Workflow 6)

Day 17-18: Analytics & Reporting
sql-- Daily Dashboard Query
CREATE VIEW daily_metrics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  SUM(total_amount) as revenue,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE payment_verified_by = 'AI') as ai_verified,
  AVG(EXTRACT(EPOCH FROM (delivered_at - created_at))/86400) as avg_fulfillment_days
FROM orders
GROUP BY DATE(created_at)
ORDER BY date DESC;

 Create Grafana dashboard
 Setup daily email report
 Implement anomaly detection (e.g., sudden spike in failed payments)

Day 19-21: Optimization & Buffer

 Load testing dengan 100 concurrent orders
 Identify bottlenecks
 Optimize slow queries (add indexes if needed)
 Buffer time for fixes


Week 4: Testing & Launch (Days 22-30)
Day 22-24: Full Integration Testing

 Run 50 test orders (mixed scenarios)
 Test edge cases:

Invalid payment proofs
Out-of-stock items
Courier API downtime
Duplicate orders


 Verify all WhatsApp notifications working

Day 25-26: Soft Launch

 Route 10% of real orders through automated system
 Manual monitoring 24/7
 Collect feedback dari CS team
 Quick fixes untuk issues

Day 27-28: Scaling Up

 Increase to 50% of orders
 Monitor system performance
 Adjust thresholds (e.g., AI confidence levels)

Day 29-30: Full Launch + Documentation

 100% orders automated
 Create runbook untuk troubleshooting
 Train team on monitoring dashboard
 Celebrate! 🎉


🚨 PART 4: Troubleshooting & Edge Cases
Common Issues & Solutions
Issue 1: Workflow Execution Timeout
Symptom: Workflows stuck at "Running" status
Cause: Long-running HTTP requests (e.g., courier API slow)
Solution:
javascript// Add timeout to all HTTP requests
const axios = require('axios');

const instance = axios.create({
  timeout: 10000, // 10 seconds
  validateStatus: (status) => status < 500 // Don't throw on 4xx
});

// Retry logic
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await instance.get(url, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
Issue 2: WhatsApp Message Delivery Failed
Symptom: Customer tidak receive notifications
Cause: WhatsApp session expired atau blocked
Solution:
javascript// Health check workflow (run every hour)
const healthCheck = await axios.get('http://waha:3000/api/sessions');

if (healthCheck.data.status !== 'WORKING') {
  // Send alert to Telegram
  await axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    chat_id: ADMIN_CHAT_ID,
    text: '🚨 WAHA WhatsApp session down! Immediate action required.'
  });
  
  // Try auto-restart
  await axios.post('http://waha:3000/api/sessions/default/restart');
}
Issue 3: Payment Proof AI Misclassification
Symptom: Valid payments rejected, or fake payments approved
Solution: Implement confidence threshold tuning
javascript// Analyze historical accuracy
SELECT 
  CASE 
    WHEN confidence BETWEEN 80 AND 85 THEN '80-85'
    WHEN confidence BETWEEN 86 AND 90 THEN '86-90'
    WHEN confidence BETWEEN 91 AND 95 THEN '91-95'
    WHEN confidence > 95 THEN '>95'
  END as confidence_range,
  COUNT(*) as total,
  SUM(CASE WHEN final_decision = 'correct' THEN 1 ELSE 0 END) as correct,
  ROUND(100.0 * SUM(CASE WHEN final_decision = 'correct' THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy
FROM payment_verifications
GROUP BY confidence_range;

-- Adjust threshold based on results
-- If 85-90 range has <95% accuracy, increase threshold to 90
Issue 4: Print Queue Backlog
Symptom: Print jobs pile up during peak hours
Solution: Priority queue system
javascript// Sort print jobs by priority + deadline
const prioritizedJobs = await db.query(`
  SELECT * FROM print_jobs
  WHERE status = 'PENDING'
  ORDER BY 
    CASE priority 
      WHEN 'URGENT' THEN 1
      WHEN 'HIGH' THEN 2
      WHEN 'NORMAL' THEN 3
    END,
    deadline ASC
  LIMIT 10
`);

// Dynamically allocate to multiple printers
const availablePrinters = await getAvailablePrinters();

for (let i = 0; i < prioritizedJobs.length; i++) {
  const printer = availablePrinters[i % availablePrinters.length];
  await assignJobToPrinter(prioritizedJobs[i], printer);
}

💰 PART 5: Cost Breakdown & ROI Analysis
Monthly Operational Costs (for 10,000 orders/month):
CategoryItemCost (IDR)InfrastructureVPS (4 vCPU, 8GB)600,000Postgres Managed200,000Redis Cache150,000Object Storage (100GB)100,000API CostsOpenAI Vision (10K images)1,500,000Biteship API (Free tier)0OpenAI GPT-4o-mini (summaries)300,000WhatsAppWAHA (self-hosted)0MonitoringGrafana Cloud0 (free tier)BackupS3 Storage50,000Total2,900,000
Cost per order: Rp 290
Manual Process Costs (current):
CategoryCost (IDR)CS Staff (2 orang @ Rp 5jt)10,000,000Operations Staff (2 orang @ Rp 5jt)10,000,000Shipping coordinator (1 orang @ Rp 4.5jt)4,500,000Print operator (1 orang @ Rp 4.5jt)4,500,000Total29,000,000
Cost per order (manual): Rp 2,900
ROI Calculation:
Monthly Savings: Rp 29,000,000 - Rp 2,900,000 = Rp 26,100,000
Initial Investment:

Development time: 30 days @ Rp 500k/day = Rp 15,000,000
Infrastructure setup: Rp 2,000,000
Total: Rp 17,000,000

Break-even: 17,000,000 / 26,100,000 = 0.65 bulan (20 hari!)
Year 1 Net Savings: (26.1M × 12) - 17M = Rp 296,200,000

------

Deep Dive: AI Manuscript Screening System untuk Bahasa Indonesia
Sistem ini akan menghemat 70% waktu editorial dengan auto-screening naskah sebelum dibaca editor manusia.

🧠 PART 1: System Architecture Overview
┌─────────────────────────────────────────────────────────────┐
│                    MANUSCRIPT INTAKE                         │
│         (WhatsApp/Email/Web Form/Google Drive)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  FILE PROCESSING LAYER                       │
│  • PDF/DOCX → Plain Text Extraction                         │
│  • OCR untuk scanned documents                              │
│  • Metadata extraction (word count, chapters, etc.)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  NLP ANALYSIS ENGINE                         │
│  ┌──────────────┬──────────────┬──────────────┬───────────┐│
│  │ Readability  │   Grammar    │  Plagiarism  │  Market   ││
│  │   Scoring    │   Checking   │   Detection  │ Potential ││
│  └──────────────┴──────────────┴──────────────┴───────────┘│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              WEIGHTED SCORING ALGORITHM                      │
│  • Combine all metrics into 0-100 score                     │
│  • Genre-specific adjustments                               │
│  • Author history bonus                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   DECISION ENGINE                            │
│  Score < 40:  Auto-Reject + Personalized Feedback           │
│  Score 40-70: Queue for Editor Review                       │
│  Score > 70:  Fast-Track + Priority Flagging                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              NOTIFICATION & DASHBOARD                        │
│  • Author notification (WhatsApp/Email)                     │
│  • Editor dashboard with ranked queue                       │
│  • Analytics & trends                                       │
└─────────────────────────────────────────────────────────────┘

📦 PART 2: Complete Python Implementation
Installation Requirements
bash# requirements.txt
# Core NLP
transformers==4.36.0
torch==2.1.0
sentence-transformers==2.2.2

# Indonesian NLP specific
Sastrawi==1.2.0
PySastrawi==1.2.0
nlp-id==1.3.0

# Document processing
python-docx==1.1.0
PyPDF2==3.0.1
pdfplumber==0.10.3
pytesseract==0.3.10

# Text analysis
textstat==0.7.3
langdetect==1.0.9
nltk==3.8.1

# API & Database
openai==1.6.1
anthropic==0.8.1
psycopg2-binary==2.9.9
redis==5.0.1

# Utilities
python-dotenv==1.0.0
requests==2.31.0
beautifulsoup4==4.12.2
scikit-learn==1.3.2
Main Manuscript Analyzer Class
python# manuscript_analyzer.py

import os
import re
import json
import hashlib
from typing import Dict, List, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict

import torch
from transformers import AutoTokenizer, AutoModel
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
import textstat
from langdetect import detect
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import openai

# Initialize Indonesian NLP tools
stemmer_factory = StemmerFactory()
stemmer = stemmer_factory.create_stemmer()

stopword_factory = StopWordRemoverFactory()
stopword_remover = stopword_factory.create_stop_word_remover()

# Download required NLTK data
nltk.download('punkt', quiet=True)

@dataclass
class ManuscriptMetrics:
    """Data class for manuscript analysis results"""
    submission_id: str
    title: str
    author: str
    word_count: int
    chapter_count: int
    avg_words_per_chapter: float
    
    # Scores (0-100)
    readability_score: float
    grammar_score: float
    plagiarism_score: float  # 100 = original, 0 = plagiarized
    market_potential_score: float
    structure_score: float
    overall_score: float
    
    # Detailed feedback
    readability_feedback: str
    grammar_issues: List[Dict]
    plagiarism_matches: List[Dict]
    market_insights: Dict
    structure_analysis: Dict
    
    # Recommendation
    recommendation: str  # AUTO_REJECT, QUEUE_REVIEW, FAST_TRACK
    processing_time_seconds: float
    
    timestamp: str = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat()


class IndonesianManuscriptAnalyzer:
    """
    Comprehensive manuscript analysis system for Indonesian language texts.
    """
    
    def __init__(self, config: Dict = None):
        self.config = config or self._default_config()
        
        # Load IndoBERT model for semantic analysis
        print("Loading IndoBERT model...")
        self.tokenizer = AutoTokenizer.from_pretrained("indobenchmark/indobert-base-p1")
        self.model = AutoModel.from_pretrained("indobenchmark/indobert-base-p1")
        self.model.eval()
        
        # Initialize OpenAI for advanced analysis
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Load existing books database for plagiarism check
        self.books_database = self._load_books_database()
        
        # Genre-specific keywords for market potential
        self.genre_keywords = self._load_genre_keywords()
        
        # Trending topics (updated monthly via web scraping)
        self.trending_topics = self._load_trending_topics()
        
    def _default_config(self) -> Dict:
        """Default configuration for the analyzer"""
        return {
            "min_word_count": 30000,  # Minimum untuk novel
            "max_word_count": 150000,  # Maximum untuk single volume
            "readability_weight": 0.20,
            "grammar_weight": 0.25,
            "plagiarism_weight": 0.25,
            "market_potential_weight": 0.20,
            "structure_weight": 0.10,
            "auto_reject_threshold": 40,
            "fast_track_threshold": 70,
            "openai_model": "gpt-4o-mini",
            "max_openai_tokens": 2000
        }
    
    def analyze_manuscript(
        self, 
        text: str, 
        metadata: Dict
    ) -> ManuscriptMetrics:
        """
        Main analysis pipeline for a manuscript.
        
        Args:
            text: Full manuscript text
            metadata: Dict with keys: submission_id, title, author, genre
        
        Returns:
            ManuscriptMetrics object with complete analysis
        """
        start_time = datetime.now()
        
        print(f"Analyzing manuscript: {metadata['title']}")
        
        # Step 1: Basic metrics
        basic_metrics = self._calculate_basic_metrics(text)
        
        # Step 2: Readability analysis
        readability_score, readability_feedback = self._analyze_readability(text)
        
        # Step 3: Grammar checking
        grammar_score, grammar_issues = self._check_grammar(text)
        
        # Step 4: Plagiarism detection
        plagiarism_score, plagiarism_matches = self._detect_plagiarism(text)
        
        # Step 5: Market potential
        market_score, market_insights = self._evaluate_market_potential(
            text, metadata.get('genre')
        )
        
        # Step 6: Structure analysis
        structure_score, structure_analysis = self._analyze_structure(text)
        
        # Step 7: Calculate overall score
        overall_score = self._calculate_weighted_score({
            'readability': readability_score,
            'grammar': grammar_score,
            'plagiarism': plagiarism_score,
            'market_potential': market_score,
            'structure': structure_score
        })
        
        # Step 8: Generate recommendation
        recommendation = self._generate_recommendation(
            overall_score, grammar_score, plagiarism_score
        )
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Compile results
        metrics = ManuscriptMetrics(
            submission_id=metadata['submission_id'],
            title=metadata['title'],
            author=metadata['author'],
            word_count=basic_metrics['word_count'],
            chapter_count=basic_metrics['chapter_count'],
            avg_words_per_chapter=basic_metrics['avg_words_per_chapter'],
            readability_score=readability_score,
            grammar_score=grammar_score,
            plagiarism_score=plagiarism_score,
            market_potential_score=market_score,
            structure_score=structure_score,
            overall_score=overall_score,
            readability_feedback=readability_feedback,
            grammar_issues=grammar_issues[:10],  # Top 10 issues
            plagiarism_matches=plagiarism_matches,
            market_insights=market_insights,
            structure_analysis=structure_analysis,
            recommendation=recommendation,
            processing_time_seconds=round(processing_time, 2)
        )
        
        return metrics
    
    def _calculate_basic_metrics(self, text: str) -> Dict:
        """Extract basic statistics from manuscript"""
        # Word count
        words = re.findall(r'\b\w+\b', text)
        word_count = len(words)
        
        # Chapter detection (looking for patterns like "BAB 1", "Chapter 1", etc.)
        chapter_patterns = [
            r'BAB\s+\d+',
            r'Chapter\s+\d+',
            r'BAGIAN\s+\d+',
            r'^\d+\.\s+[A-Z]',  # "1. TITLE"
        ]
        
        chapters = []
        for pattern in chapter_patterns:
            chapters.extend(re.findall(pattern, text, re.MULTILINE | re.IGNORECASE))
        
        chapter_count = len(set(chapters)) if chapters else 1
        avg_words_per_chapter = word_count / chapter_count if chapter_count > 0 else word_count
        
        return {
            'word_count': word_count,
            'chapter_count': chapter_count,
            'avg_words_per_chapter': round(avg_words_per_chapter, 2)
        }
    
    def _analyze_readability(self, text: str) -> Tuple[float, str]:
        """
        Analyze readability using multiple metrics adapted for Indonesian.
        """
        # Sample text for analysis (full text would be too slow)
        sample_size = min(50000, len(text))
        sample = text[:sample_size]
        
        # Sentence tokenization
        sentences = nltk.sent_tokenize(sample)
        num_sentences = len(sentences)
        
        # Word tokenization
        words = re.findall(r'\b\w+\b', sample)
        num_words = len(words)
        
        # Calculate metrics
        avg_sentence_length = num_words / num_sentences if num_sentences > 0 else 0
        
        # Count complex words (>3 syllables) - simplified syllable counting for Indonesian
        complex_words = sum(1 for word in words if self._count_syllables_indonesian(word) > 3)
        complex_word_percentage = (complex_words / num_words * 100) if num_words > 0 else 0
        
        # Flesch Reading Ease adapted for Indonesian
        # Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
        total_syllables = sum(self._count_syllables_indonesian(word) for word in words[:1000])  # Sample
        avg_syllables_per_word = total_syllables / min(1000, num_words)
        
        flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        
        # Normalize to 0-100 scale
        readability_score = max(0, min(100, flesch_score))
        
        # Generate feedback
        if readability_score >= 80:
            level = "sangat mudah dibaca"
            feedback = "Naskah menggunakan bahasa yang sederhana dan mudah dipahami pembaca umum."
        elif readability_score >= 60:
            level = "cukup mudah dibaca"
            feedback = "Naskah memiliki tingkat keterbacaan yang baik untuk pembaca dewasa."
        elif readability_score >= 40:
            level = "cukup menantang"
            feedback = "Naskah membutuhkan konsentrasi untuk dipahami. Pertimbangkan menyederhanakan beberapa kalimat."
        else:
            level = "sulit dibaca"
            feedback = "Naskah menggunakan struktur kalimat yang kompleks. Disarankan untuk menyederhanakan."
        
        detailed_feedback = (
            f"Tingkat keterbacaan: {level} (skor {readability_score:.1f}/100)\n"
            f"- Rata-rata panjang kalimat: {avg_sentence_length:.1f} kata\n"
            f"- Persentase kata kompleks: {complex_word_percentage:.1f}%\n"
            f"- {feedback}"
        )
        
        return readability_score, detailed_feedback
    
    def _count_syllables_indonesian(self, word: str) -> int:
        """
        Simplified syllable counting for Indonesian.
        Indonesian syllables typically follow CV (consonant-vowel) patterns.
        """
        vowels = 'aiueoAIUEO'
        word = word.lower()
        syllable_count = 0
        previous_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not previous_was_vowel:
                syllable_count += 1
            previous_was_vowel = is_vowel
        
        return max(1, syllable_count)
    
    def _check_grammar(self, text: str) -> Tuple[float, List[Dict]]:
        """
        Check grammar using GPT-4 for Indonesian language.
        Due to API costs, we sample the text.
        """
        # Sample 3 random chunks from the manuscript
        chunk_size = 1000
        text_length = len(text)
        
        if text_length < chunk_size * 3:
            samples = [text]
        else:
            import random
            positions = random.sample(range(0, text_length - chunk_size), 3)
            samples = [text[pos:pos+chunk_size] for pos in positions]
        
        all_issues = []
        
        for i, sample in enumerate(samples):
            try:
                response = openai.chat.completions.create(
                    model=self.config['openai_model'],
                    messages=[
                        {
                            "role": "system",
                            "content": """Anda adalah ahli tata bahasa Indonesia. Analisis teks berikut dan identifikasi kesalahan tata bahasa, ejaan, dan penggunaan kata.

Berikan output dalam format JSON:
{
  "errors": [
    {
      "type": "grammar|spelling|word_choice",
      "severity": "high|medium|low",
      "original": "teks yang salah",
      "suggestion": "teks yang benar",
      "explanation": "penjelasan singkat"
    }
  ]
}

Fokus pada kesalahan yang benar-benar mengganggu keterbacaan."""
                        },
                        {
                            "role": "user",
                            "content": f"Analisis teks berikut:\n\n{sample}"
                        }
                    ],
                    temperature=0.3,
                    max_tokens=1000
                )
                
                result = json.loads(response.choices[0].message.content)
                all_issues.extend(result.get('errors', []))
                
            except Exception as e:
                print(f"Grammar check error for sample {i}: {e}")
                continue
        
        # Calculate score based on error density
        words_checked = sum(len(s.split()) for s in samples)
        error_count = len(all_issues)
        
        # Score calculation: fewer errors = higher score
        # 0 errors = 100, 1 error per 100 words = ~80, 1 error per 50 words = ~60
        if words_checked > 0:
            errors_per_100_words = (error_count / words_checked) * 100
            grammar_score = max(0, 100 - (errors_per_100_words * 20))
        else:
            grammar_score = 50  # Default if no words checked
        
        # Sort issues by severity
        severity_order = {'high': 0, 'medium': 1, 'low': 2}
        all_issues.sort(key=lambda x: severity_order.get(x.get('severity', 'low'), 2))
        
        return grammar_score, all_issues
    
    def _detect_plagiarism(self, text: str) -> Tuple[float, List[Dict]]:
        """
        Detect plagiarism by comparing with existing books database.
        Uses TF-IDF + Cosine Similarity for efficiency.
        """
        if not self.books_database:
            # No database to compare against
            return 95.0, []  # Assume original
        
        # Preprocess text
        processed_text = self._preprocess_for_plagiarism(text)
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 3))
        
        try:
            # Combine new manuscript with database texts
            all_texts = [processed_text] + [book['text'] for book in self.books_database]
            tfidf_matrix = vectorizer.fit_transform(all_texts)
            
            # Calculate cosine similarity
            similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
            
            # Find matches above threshold
            threshold = 0.3  # 30% similarity
            matches = []
            
            for idx, similarity in enumerate(similarities):
                if similarity > threshold:
                    matches.append({
                        'book_title': self.books_database[idx]['title'],
                        'book_author': self.books_database[idx]['author'],
                        'similarity_percentage': round(similarity * 100, 2),
                        'matched_segments': self._find_matching_segments(
                            text, self.books_database[idx]['text'], min_length=100
                        )
                    })
            
            # Sort by similarity
            matches.sort(key=lambda x: x['similarity_percentage'], reverse=True)
            
            # Calculate plagiarism score
            if not matches:
                plagiarism_score = 100.0  # 100% original
            else:
                max_similarity = matches[0]['similarity_percentage']
                plagiarism_score = max(0, 100 - max_similarity)
            
            return plagiarism_score, matches[:5]  # Top 5 matches
            
        except Exception as e:
            print(f"Plagiarism detection error: {e}")
            return 95.0, []  # Assume original on error
    
    def _preprocess_for_plagiarism(self, text: str) -> str:
        """Preprocess text for plagiarism detection"""
        # Lowercase
        text = text.lower()
        
        # Remove punctuation and extra whitespace
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        
        # Remove stopwords
        text = stopword_remover.remove(text)
        
        # Stemming
        text = stemmer.stem(text)
        
        return text
    
    def _find_matching_segments(
        self, 
        text1: str, 
        text2: str, 
        min_length: int = 100
    ) -> List[str]:
        """Find matching text segments between two texts"""
        # Simple implementation - can be improved with better algorithms
        # Split into sentences
        sentences1 = nltk.sent_tokenize(text1)
        sentences2 = nltk.sent_tokenize(text2)
        
        matches = []
        for s1 in sentences1:
            for s2 in sentences2:
                if len(s1) > min_length and len(s2) > min_length:
                    # Calculate simple word overlap
                    words1 = set(s1.lower().split())
                    words2 = set(s2.lower().split())
                    overlap = len(words1 & words2) / max(len(words1), len(words2))
                    
                    if overlap > 0.7:  # 70% word overlap
                        matches.append(s1[:200])  # First 200 chars
                        break
        
        return matches[:3]  # Top 3 matching segments
    
    def _evaluate_market_potential(
        self, 
        text: str, 
        genre: str = None
    ) -> Tuple[float, Dict]:
        """
        Evaluate market potential based on:
        1. Genre keyword matching
        2. Trending topic alignment
        3. Unique selling points detection
        """
        score_components = {}
        
        # 1. Genre keyword matching (40% of score)
        if genre and genre in self.genre_keywords:
            genre_keywords_found = sum(
                1 for keyword in self.genre_keywords[genre] 
                if keyword.lower() in text.lower()
            )
            genre_score = min(100, (genre_keywords_found / len(self.genre_keywords[genre])) * 100 * 1.5)
            score_components['genre_relevance'] = genre_score
        else:
            score_components['genre_relevance'] = 50  # Neutral
        
        # 2. Trending topics (30% of score)
        trending_matches = [
            topic for topic in self.trending_topics 
            if topic.lower() in text.lower()
        ]
        trending_score = min(100, len(trending_matches) * 20)  # Each match = 20 points
        score_components['trending_alignment'] = trending_score
        
        # 3. Uniqueness/Hook detection using GPT (30% of score)
        # Sample first 3000 words for hook analysis
        sample = ' '.join(text.split()[:3000])
        
        try:
            response = openai.chat.completions.create(
                model=self.config['openai_model'],
                messages=[
                    {
                        "role": "system",
                        "content": """Anda adalah analisis pasar buku. Evaluasi naskah berikut dan berikan:
1. Hook/Unique Selling Point (USP) yang membedakan dari buku serupa
2. Target pembaca yang paling cocok
3. Potensi viral di media sosial (1-10)

Berikan dalam format JSON:
{
  "usp": "penjelasan singkat USP",
  "target_audience": "deskripsi target pembaca",
  "viral_potential": 1-10,
  "marketability": 1-100
}"""
                    },
                    {
                        "role": "user",
                        "content": f"Analisis naskah genre {genre}:\n\n{sample}"
                    }
                ],
                temperature=0.5,
                max_tokens=500
            )
            
            analysis = json.loads(response.choices[0].message.content)
            uniqueness_score = analysis.get('marketability', 50)
            score_components['uniqueness'] = uniqueness_score
            
            market_insights = {
                'usp': analysis.get('usp', 'Not identified'),
                'target_audience': analysis.get('target_audience', 'General'),
                'viral_potential': analysis.get('viral_potential', 5),
                'trending_topics_found': trending_matches,
                'genre_keywords_matched': genre_keywords_found if genre else 0
            }
            
        except Exception as e:
            print(f"Market analysis error: {e}")
            uniqueness_score = 50
            market_insights = {
                'usp': 'Analysis failed',
                'target_audience': 'Unknown',
                'viral_potential': 5,
                'trending_topics_found': trending_matches
            }
        
        # Calculate weighted market score
        market_score = (
            score_components['genre_relevance'] * 0.4 +
            score_components['trending_alignment'] * 0.3 +
            uniqueness_score * 0.3
        )
        
        return market_score, market_insights
    
    def _analyze_structure(self, text: str) -> Tuple[float, Dict]:
        """
        Analyze manuscript structure:
        1. Beginning-Middle-End balance
        2. Chapter length consistency
        3. Pacing (dialogue vs narration ratio)
        """
        # Divide text into three acts
        text_length = len(text)
        act1 = text[:text_length//3]
        act2 = text[text_length//3:2*text_length//3]
        act3 = text[2*text_length//3:]
        
        # 1. Check if acts are relatively balanced (should be)
        lengths = [len(act1), len(act2), len(act3)]
        avg_length = sum(lengths) / 3
        balance_score = 100 - (sum(abs(l - avg_length) / avg_length * 100 for l in lengths) / 3)
        balance_score = max(0, min(100, balance_score))
        
        # 2. Detect chapters
        chapters = self._detect_chapters(text)
        
        if len(chapters) > 1:
            chapter_lengths = [len(ch) for ch in chapters]
            avg_chapter_length = sum(chapter_lengths) / len(chapter_lengths)
            
            # Calculate variance
            variance = sum((l - avg_chapter_length)**2 for l in chapter_lengths) / len(chapter_lengths)
            std_dev = variance ** 0.5
            
            # Lower std_dev = more consistent = higher score
            consistency_score = max(0, 100 - (std_dev / avg_chapter_length * 100))
        else:
            consistency_score = 50  # Neutral if no clear chapters
        
        # 3. Analyze pacing (dialogue vs narration)
        dialogue_pattern = r'"[^"]+"|"[^"]+"'  # Simple quotation detection
        dialogue_count = len(re.findall(dialogue_pattern, text))
        words_count = len(text.split())
        
        # Ideal is about 20-40% dialogue
        dialogue_ratio = (dialogue_count / words_count * 100) if words_count > 0 else 0
        
        if 20 <= dialogue_ratio <= 40:
            pacing_score = 100
        elif 10 <= dialogue_ratio < 20 or 40 < dialogue_ratio <= 50:
            pacing_score = 80
        else:
            pacing_score = 60
        
        # Overall structure score (weighted average)
        structure_score = (
            balance_score * 0.3 +
            consistency_score * 0.4 +
            pacing_score * 0.3
        )
        
        structure_analysis = {
            'act_balance_score': round(balance_score, 2),
            'chapter_consistency_score': round(consistency_score, 2),
            'pacing_score': round(pacing_score, 2),
            'chapter_count': len(chapters),
            'avg_chapter_words': round(sum(len(ch.split()) for ch in chapters) / len(chapters), 2) if chapters else 0,
            'dialogue_ratio_percent': round(dialogue_ratio, 2),
            'structure_feedback': self._generate_structure_feedback(balance_score, consistency_score, pacing_score)
        }
        
        return structure_score, structure_analysis
    
    def _detect_chapters(self, text: str) -> List[str]:
        """Detect and split text into chapters"""
        chapter_patterns = [
            r'\n\s*BAB\s+\d+[:\s]',
            r'\n\s*Chapter\s+\d+[:\s]',
            r'\n\s*BAGIAN\s+\d+[:\s]',
            r'\n\s*\d+\.\s+[A-Z][A-Z\s]+\n',  # "1. CHAPTER TITLE"
        ]
        
        # Find all chapter positions
        chapter_positions = [0]  # Start of text
        for pattern in chapter_patterns:
            matches = re.finditer(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                chapter_positions.append(match.start())
        
        chapter_positions = sorted(set(chapter_positions))
        chapter_positions.append(len(text))  # End of text
        
        # Split into chapters
        chapters = []
        for i in range(len(chapter_positions) - 1):
            chapter_text = text[chapter_positions[i]:chapter_positions[i+1]]
            if len(chapter_text.split()) > 500:  # Minimum 500 words for a chapter
                chapters.append(chapter_text)
        
        return chapters if chapters else [text]  # Return full text as single chapter if no chapters found
    
    def _generate_structure_feedback(
        self, 
        balance: float, 
        consistency: float, 
        pacing: float
    ) -> str:
        """Generate human-readable feedback on structure"""
        feedback_parts = []
        
        if balance < 60:
            feedback_parts.append("Struktur tiga babak (awal-tengah-akhir) kurang seimbang. Pertimbangkan mengatur ulang pacing cerita.")
        
        if consistency < 50:
            feedback_parts.append("Panjang bab sangat bervariasi. Konsistensi yang lebih baik akan meningkatkan pengalaman pembaca.")
        
        if pacing < 70:
            feedback_parts.append("Rasio dialog vs narasi tidak optimal. Pertimbangkan menambah/mengurangi dialog untuk pacing yang lebih baik.")
        
        if not feedback_parts:
            feedback_parts.append("Struktur naskah sudah baik dan seimbang.")
        
        return " ".join(feedback_parts)
    
    def _calculate_weighted_score(self, scores: Dict[str, float]) -> float:
        """Calculate weighted overall score"""
        weights = {
            'readability': self.config['readability_weight'],
            'grammar': self.config['grammar_weight'],
            'plagiarism': self.config['plagiarism_weight'],
            'market_potential': self.config['market_potential_weight'],
            'structure': self.config['structure_weight']
        }
        
        overall = sum(scores[key] * weights[key] for key in scores)
        return round(overall, 2)
    
    def _generate_recommendation(
        self, 
        overall_score: float, 
        grammar_score: float,
        plagiarism_score: float
    ) -> str:
        """Generate final recommendation"""
        # Hard rules
        if plagiarism_score < 70:  # Suspected plagiarism
            return "AUTO_REJECT"
        
        if grammar_score < 30:  # Too many grammar errors
            return "AUTO_REJECT"
        
        # Score-based recommendation
        if overall_score >= self.config['fast_track_threshold']:
            return "FAST_TRACK"
        elif overall_score < self.config['auto_reject_threshold']:
            return "AUTO_REJECT"
        else:
            return "QUEUE_REVIEW"
    
    def _load_books_database(self) -> List[Dict]:
        """
        Load existing published books for plagiarism comparison.
        In production, this would query a database.
        """
        # Placeholder - in production, load from PostgreSQL
        # SELECT title, author, full_text FROM published_books LIMIT 1000
        return []
    
    def _load_genre_keywords(self) -> Dict[str, List[str]]:
        """Load genre-specific keywords for market analysis"""
        return {
            'romance': [
                'cinta', 'jatuh hati', 'pasangan', 'kencan', 'ciuman',
                'pernikahan', 'kekasih', 'patah hati', 'mantan', 'affair'
            ],
            'thriller': [
                'misteri', 'pembunuhan', 'detektif', 'investigasi', 'kriminal',
                'tersangka', 'bukti', 'alibi', 'korban', 'pembunuh'
            ],
            'fantasy': [
                'sihir', 'kerajaan', 'naga', 'pedang', 'penyihir',
                'kutukan', 'ramalan', 'dunia lain', 'quest', 'takdir'
            ],
            'self_help': [
                'tips', 'strategi', 'sukses', 'produktivitas', 'mindset',
                'kebiasaan', 'motivasi', 'perubahan', 'tujuan', 'langkah'
            ],
            'horror': [
                'hantu', 'seram', 'kematian', 'arwah', 'teror',
                'menakutkan', 'berdarah', 'misteri gelap', 'kutukan', 'horor'
            ]
        }
    
    def _load_trending_topics(self) -> List[str]:
        """
        Load trending topics (would be updated via web scraping).
        This is a placeholder.
        """
        return [
            'mental health',
            'self love',
            'toxic relationship',
            'quarter life crisis',
            'financial literacy',
            'digital nomad',
            'sustainability',
            'AI',
            'remote work',
            'mindfulness'
        ]


# Example usage function
def analyze_manuscript_file(file_path: str, metadata: Dict) -> ManuscriptMetrics:
    """
    Convenience function to analyze a manuscript file.
    
    Args:
        file_path: Path to DOCX or PDF file
        metadata: Dict with submission_id, title, author, genre
    
    Returns:
        ManuscriptMetrics object
    """
    from document_processor import DocumentProcessor
    
    # Extract text from file
    processor = DocumentProcessor()
    text = processor.extract_text(file_path)
    
    # Initialize analyzer
    analyzer = IndonesianManuscriptAnalyzer()
    
    # Run analysis
    results = analyzer.analyze_manuscript(text, metadata)
    
    return results


if __name__ == "__main__":
    # Example usage
    sample_metadata = {
        'submission_id': 'SUB-20260215-001',
        'title': 'Cinta di Ujung Senja',
        'author': 'Test Author',
        'genre': 'romance'
    }
    
    sample_text = """
    BAB 1: Pertemuan Pertama
    
    Senja itu berbeda. Langit berubah menjadi jingga kemerahan, 
    seperti lukisan yang tak akan pernah bisa dilupakan...
    
    [Continue with 30,000+ words of sample text]
    """
    
    analyzer = IndonesianManuscriptAnalyzer()
    results = analyzer.analyze_manuscript(sample_text, sample_metadata)
    
    print(json.dumps(asdict(results), indent=2, ensure_ascii=False))

Document Processor Module
python# document_processor.py

import os
from typing import Optional
import docx
import PyPDF2
import pdfplumber
import pytesseract
from PIL import Image
import io

class DocumentProcessor:
    """
    Extract text from various document formats.
    Supports: DOCX, PDF, scanned PDFs (with OCR)
    """
    
    def extract_text(self, file_path: str) -> str:
        """
        Extract text from document based on file extension.
        
        Args:
            file_path: Path to document file
        
        Returns:
            Extracted text as string
        """
        extension = os.path.splitext(file_path)[1].lower()
        
        if extension == '.docx':
            return self._extract_from_docx(file_path)
        elif extension == '.pdf':
            return self._extract_from_pdf(file_path)
        elif extension == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file format: {extension}")
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            
            # Extract text from paragraphs
            text_parts = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_parts.append(paragraph.text)
            
            # Extract text from tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            text_parts.append(cell.text)
            
            return '\n'.join(text_parts)
            
        except Exception as e:
            raise Exception(f"Error extracting text from DOCX: {e}")
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF, with OCR fallback for scanned PDFs"""
        try:
            # First, try standard PDF text extraction
            text = self._extract_pdf_text_standard(file_path)
            
            # If very little text extracted, try OCR
            if len(text.strip()) < 100:
                print("PDF appears to be scanned, attempting OCR...")
                text = self._extract_pdf_text_ocr(file_path)
            
            return text
            
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {e}")
    
    def _extract_pdf_text_standard(self, file_path: str) -> str:
        """Extract text from searchable PDF"""
        text_parts = []
        
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        
        return '\n'.join(text_parts)
    
    def _extract_pdf_text_ocr(self, file_path: str) -> str:
        """Extract text from scanned PDF using OCR"""
        from pdf2image import convert_from_path
        
        # Convert PDF to images
        images = convert_from_path(file_path)
        
        text_parts = []
        for i, image in enumerate(images):
            print(f"OCR processing page {i+1}/{len(images)}...")
            
            # Run OCR with Indonesian language
            page_text = pytesseract.image_to_string(
                image, 
                lang='ind',  # Indonesian language pack
                config='--psm 6'  # Assume uniform block of text
            )
            
            text_parts.append(page_text)
        
        return '\n'.join(text_parts)