# Tadabbur Az-Zalzalah · Majlis Khatam (slaid web)

Laman statik vanila (HTML/CSS/ES modules), tanpa binaan dan tanpa pakej luar.

Majlis: **Majlis Khatam Al-Quran Perdana Murid Tahun 6, Peringkat Negeri Selangor Kali Ke-11 (2026M / 1448H)** · Selasa, 17 November 2026 · KAFA Integrasi As-Syariff, Telok Datok.

## Struktur
- `index.html`: pentas slaid, HUD, menu sisi dan dialog dokumentasi (ⓘ).
- `data/slides.json`: semua kandungan slaid (26 slaid, 3 sesi). Ubah teks di sini sahaja.
- `data/dalil.json`: pangkalan dalil (ayat, hadis, tafsir, nota manhaj) dengan rujukan, taraf dan pautan. Entri separuh ayat ditanda `"petikan": true`.
- `data/jadual.json`: segmen aturcara dan jumlah minit.
- `data/khatam.json`: urutan khatam (93–114 → Al-Fatihah → Al-Baqarah 1–5), adab dan doa khatam.
- `data/dokumen.json`: metadata dokumentasi, pautan muat turun dan maklumat siaran langsung.
- `data/fx.json`: tetapan gerakan dan micro-interaksi (ripple, tilt, magnetic, navigasi).
- `js/render.js`: pendaftar jenis slaid (`hero`, `list`, `cards`, `ayat`, `quote`, `jadual`, `tahap`, `khatam`, `doa`, `rujukan`). Tambah jenis baharu dalam objek `types`.
- `js/main.js`: memuatkan kelima-lima fail JSON dan menyambungkan nav, sidebar, fx dan dokumentasi.
- `js/sidebar.js`: menu sesi, carian slaid dan kumpulan **Dokumentasi**.
- `js/dokumen.js`: dialog ⓘ (PDF, Word, halaman dokumentasi, pautan LIVE).
- `js/fx.js`: harness kesan. Tambah kesan baharu dalam objek `effects`, kemudian aktifkan dalam `fx.json`.
- `js/nav.js`: papan kekunci, swipe, roda tetikus, titik, hash `#n`.

## Aturcara (2.30 – 4.00 petang)
| Masa | Segmen |
|---|---|
| 2.30 – 2.40 | Pembukaan, doa dan Al-Fatihah |
| 2.40 – 3.00 | Tadabbur Surah Az-Zalzalah |
| 3.00 – 3.20 | Tazkirah, identiti murid soleh dan keberkatan daripada Allah |
| 3.20 – 3.50 | Majlis Khatam: Ad-Dhuha (93) → An-Nas (114) → Al-Fatihah → Al-Baqarah 1–5 → doa khatam |
| 3.50 – 4.00 | Ucapan guru |
| 4.00 | Rehat |

Kandungan disusun mengikut tahap umur Tahun 1–6 (Tahun 1–2, 3–4, 5–6) dan menegaskan bahawa tiada keberkatan atau kejayaan dunia dan akhirat melainkan daripada Allah SWT, berpandukan Aqidah Ahlus Sunnah wal Jamaah.

## Kawalan
Anak panah / Space / PageUp / PageDown, Home / End, `F` skrin penuh, swipe pada telefon, `M` butiran, `S` menu sisi.

## Dokumentasi dan siaran langsung
- Butang **ⓘ** pada HUD membuka dialog dokumentasi: tarikh, tempat, pemantau, objektif, muat turun PDF/Word dan pautan LIVE.
- Menu sisi › **Dokumentasi** menyenaraikan muat turun yang sama.
- Halaman penuh: `majlis-khatam-2026.html` (boleh dicetak sebagai PDF).
- Dokumen: `dokumen/Majlis-Khatam-2026-Dokumentasi.pdf` dan `.docx`.
- Majlis disiarkan langsung di Facebook untuk pemantauan dan bukti pelaksanaan Bahagian Pendidikan Islam, JAIS. Pautan disimpan dalam `data/dokumen.json` (`live.pautan`) dan diisi oleh penyelaras.
- Poster: `majlis-khatam-2026.svg`.

## Semakan data
```bash
npm run semak        # semak data + teks ayat
npm run semak:data   # struktur slides/jadual/khatam/dalil
npm run semak:ayat   # banding teks Arab dengan quran.ai (edisi ar-uthmani-hafs)
npm run rehearsal    # simulasi masa dan aturcara
```
`semak:ayat` memerlukan sambungan internet. Entri `petikan` lulus jika teksnya terkandung dalam ayat kanun. Ia menggunakan MCP quran.ai; lihat `scripts/semak-ayat.mjs`.

## Bina semula dokumentasi
```bash
python scripts/bina-dokumen.py   # hasilkan dokumen/Majlis-Khatam-2026-Dokumentasi.docx
```
Kandungan sumber manual: `dokumen/sumber-dokumen.html`. PDF dijana daripada dokumen Word melalui eksport PDF.

## Jalankan setempat
`npx serve .` atau `python -m http.server`, kemudian buka `http://localhost:3000` (jangan buka `index.html` terus kerana `fetch` JSON perlu pelayan).

## Langkah cepat (repo: aimanrafee/Program-Khatam-Quran-KAFA)
1. Buka `.env`, ganti `ISI_TOKEN_PAT_DI_SINI` dengan PAT anda (Contents: Read and write untuk repo ini).
2. Windows: klik dua kali `push.bat`. Lain-lain: `node push.js "mesej commit"`.
3. GitHub: Settings, Pages, Deploy from branch, `main` / root. Laman: https://aimanrafee.github.io/Program-Khatam-Quran-KAFA/

## Push ke GitHub (butiran)
1. Salin `.env.example` kepada `.env`, isi `GITHUB_TOKEN`, `GITHUB_USER`, `GITHUB_REPO` (token: Contents Read and write). Letak `GITHUB_PAGES=true` untuk paparan pautan Pages.
2. Windows: klik dua kali `push.bat` (atau `push.bat "mesej commit"`). Mana-mana sistem: `node push.js "mesej commit"`.
3. Di GitHub: Settings > Pages > Deploy from branch > `main` / root.

`.env` sudah dalam `.gitignore` dan tidak akan di-push.

## Menu sisi dan butiran
- Menu sisi (☰ atau kekunci `S`) menyenaraikan 3 sesi: Tadabbur, Tazkirah, Majlis Khatam. Senarai dijana daripada `sessions` dan `sesi` pada setiap slaid dalam `data/slides.json`.
- Setiap slaid boleh ada `butiran` (`[{ "h": "Tajuk", "p": ["perenggan"] }]`) yang dipapar melalui butang **Lagi / Sembunyi** (atau kekunci `M`). Butang "Papar semua butiran" dalam menu membuka semuanya.
- Tetapan paparan (label, lebar minimum menu terbuka, butiran terbuka secara lalai) ada di `data/fx.json` bawah `ui`.
