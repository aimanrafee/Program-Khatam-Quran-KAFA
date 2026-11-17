# Tadabbur Az-Zalzalah · Majlis Khatam (slaid web)

Laman statik vanila (HTML/CSS/ES modules), tanpa binaan dan tanpa pakej luar.

## Struktur
- `data/slides.json`: semua kandungan slaid. Ubah teks di sini sahaja.
- `data/fx.json`: tetapan gerakan dan micro-interaksi (ripple, tilt, magnetic, navigasi).
- `js/render.js`: pendaftar jenis slaid (`hero`, `list`, `cards`, `ayat`, `quote`). Tambah jenis baharu dalam objek `types`.
- `js/fx.js`: harness kesan. Tambah kesan baharu dalam objek `effects`, kemudian aktifkan dalam `fx.json`.
- `js/nav.js`: papan kekunci, swipe, roda tetikus, titik, hash `#n`.

## Kawalan
Anak panah / Space / PageUp / PageDown, Home / End, `F` skrin penuh, swipe pada telefon.

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
