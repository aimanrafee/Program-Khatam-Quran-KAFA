# -*- coding: utf-8 -*-
"""Bina dokumentasi DOCX Majlis Khatam 2026 daripada kandungan rasmi."""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'dokumen', 'Majlis-Khatam-2026-Dokumentasi.docx')
LOGO = os.path.join(ROOT, 'logo-kafa-128.png')

GREEN = RGBColor(0x0B, 0x6B, 0x45)
DARK = RGBColor(0x12, 0x23, 0x2B)
GREY = RGBColor(0x55, 0x67, 0x5D)
GOLD = RGBColor(0xC9, 0xA2, 0x27)

doc = Document()
sec = doc.sections[0]
sec.page_width = Cm(21.0)
sec.page_height = Cm(29.7)
sec.top_margin = Cm(1.7)
sec.bottom_margin = Cm(1.6)
sec.left_margin = Cm(1.6)
sec.right_margin = Cm(1.6)

normal = doc.styles['Normal']
normal.font.name = 'Segoe UI'
normal.font.size = Pt(10.5)
normal.font.color.rgb = DARK
normal.paragraph_format.space_after = Pt(4)
normal.paragraph_format.line_spacing = 1.3


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hexcolor)
    tcPr.append(shd)


def p(text='', bold=False, size=10.5, color=None, italic=False, align=None, space_after=4):
    par = doc.add_paragraph()
    run = par.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(size)
    if color is not None:
        run.font.color.rgb = color
    if align is not None:
        par.alignment = align
    par.paragraph_format.space_after = Pt(space_after)
    return par


def h1(text):
    par = doc.add_paragraph()
    par.paragraph_format.space_before = Pt(12)
    par.paragraph_format.space_after = Pt(5)
    run = par.add_run(text)
    run.bold = True
    run.font.size = Pt(12)
    run.font.color.rgb = GREEN
    pPr = par._p.get_or_add_pPr()
    pbdr = OxmlElement('w:pBdr')
    left = OxmlElement('w:left')
    left.set(qn('w:val'), 'single')
    left.set(qn('w:sz'), '18')
    left.set(qn('w:space'), '6')
    left.set(qn('w:color'), 'C9A227')
    pbdr.append(left)
    pPr.append(pbdr)
    return par


def h2(text):
    par = doc.add_paragraph()
    par.paragraph_format.space_before = Pt(8)
    par.paragraph_format.space_after = Pt(3)
    run = par.add_run(text)
    run.bold = True
    run.font.size = Pt(10.5)
    run.font.color.rgb = DARK
    return par


def bullet(text, check=False):
    par = doc.add_paragraph(style='List Bullet' if not check else None)
    if check:
        par.paragraph_format.left_indent = Cm(0.8)
        par.paragraph_format.first_line_indent = Cm(-0.45)
        par.add_run('☐  ')
    par.add_run(text)
    par.paragraph_format.space_after = Pt(2)
    return par


def table(rows, widths=None, header=False):
    t = doc.add_table(rows=0, cols=len(rows[0]))
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r_i, row in enumerate(rows):
        cells = t.add_row().cells
        for c_i, val in enumerate(row):
            cells[c_i].text = ''
            par = cells[c_i].paragraphs[0]
            par.paragraph_format.space_after = Pt(2)
            run = par.add_run(str(val))
            run.font.size = Pt(9.5)
            if header and r_i == 0:
                run.bold = True
                run.font.color.rgb = GREEN
                shade(cells[c_i], 'EAF3EE')
            elif c_i == 0 and not header:
                run.bold = True
                shade(cells[c_i], 'F6FAF7')
            if widths:
                cells[c_i].width = Cm(widths[c_i])
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def arabic(text):
    par = doc.add_paragraph()
    par.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pPr = par._p.get_or_add_pPr()
    bidi = OxmlElement('w:bidi')
    pPr.append(bidi)
    run = par.add_run(text)
    run.font.size = Pt(16)
    run.font.name = 'Traditional Arabic'
    rPr = run._element.get_or_add_rPr()
    rtl = OxmlElement('w:rtl')
    rPr.append(rtl)
    par.paragraph_format.space_after = Pt(8)
    return par


# ---------- Kepala dokumen ----------
head = doc.add_table(rows=1, cols=2)
head.autofit = False
head.columns[0].width = Cm(2.6)
head.columns[1].width = Cm(15.2)
cell_logo, cell_text = head.rows[0].cells
cell_logo.paragraphs[0].add_run().add_picture(LOGO, width=Cm(2.1))
cell_text.text = ''
org = cell_text.paragraphs[0].add_run('KAFA INTEGRASI AS-SYARIFF · TELOK DATOK · BANTING · KUALA LANGAT')
org.bold = True
org.font.size = Pt(8)
org.font.color.rgb = GREEN
t1 = cell_text.add_paragraph().add_run('Dokumentasi Ringkas\nMajlis Khatam Al-Quran Perdana Murid Tahun 6')
t1.bold = True
t1.font.size = Pt(16)
t1.font.color.rgb = DARK
t2 = cell_text.add_paragraph().add_run('Peringkat Negeri Selangor Kali Ke-11 · 2026M / 1448H')
t2.font.size = Pt(9.5)
t2.font.color.rgb = GREY

# garis bawah
par = doc.add_paragraph()
pPr = par._p.get_or_add_pPr()
pbdr = OxmlElement('w:pBdr')
bottom = OxmlElement('w:bottom')
bottom.set(qn('w:val'), 'single')
bottom.set(qn('w:sz'), '18')
bottom.set(qn('w:space'), '4')
bottom.set(qn('w:color'), '0B6B45')
pbdr.append(bottom)
pPr.append(pbdr)
par.paragraph_format.space_after = Pt(6)

# ---------- 1 ----------
h1('1. Maklumat Program')
table([
    ['Nama program', 'Majlis Khatam Al-Quran Perdana Murid Tahun 6, Peringkat Negeri Selangor Kali Ke-11 (2026M / 1448H)'],
    ['Tarikh', 'Selasa, 17 November 2026M / 07 Jamadilakhir 1448H'],
    ['Masa', '2.30 – 4.00 petang (rehat pada 4.00 petang)'],
    ['Tempat', 'Dewan Sekolah, KAFA Integrasi As-Syariff, Telok Datok, Banting, Kuala Langat, Selangor'],
    ['Penganjur', 'KAFA Integrasi As-Syariff'],
    ['Pemantau', 'Bahagian Pendidikan Islam, Jabatan Agama Islam Selangor (JAIS)'],
    ['Sasaran', '176 murid Tahun 1 hingga 6; 22 murid Tahun 6 ialah murid yang berkhatam'],
    ['Pengendali slot', 'Muhammad Aiman bin Mohamad Rafee'],
    ['Guru Besar', 'Ustazah Mufidah binti Masroni'],
    ['Siaran langsung', 'Facebook Live (pautan diisi oleh penyelaras program)'],
    ['Laman slaid', 'https://aimanrafee.github.io/Program-Khatam-Quran-KAFA/'],
], widths=[4.3, 13.5])

# ---------- 2 ----------
h1('2. Latar Belakang')
p('Majlis Khatam Al-Quran Perdana ini diadakan untuk meraikan murid Tahun 6 yang telah menamatkan bacaan Al-Quran 30 juzuk. Ia juga menjadi ruang untuk mengingatkan seluruh murid Tahun 1 hingga 6 bahawa khatam bukan penamat, tetapi permulaan kepada amalan membaca, memahami dan menghidupkan Al-Quran dalam kehidupan harian.')
p('Majlis ini dilaksanakan sebagai program peringkat negeri dan dipantau oleh Bahagian Pendidikan Islam, Jabatan Agama Islam Selangor. Siaran langsung di Facebook dijalankan bagi membolehkan pemantauan, dokumentasi dan bukti pelaksanaan program direkodkan secara telus.')

# ---------- 3 ----------
h1('3. Objektif')
for i, x in enumerate([
    'Meraikan 22 murid Tahun 6 yang telah mengkhatamkan bacaan Al-Quran.',
    'Membimbing murid mentadabbur Surah Az-Zalzalah dan memahami tanggungjawab selepas khatam.',
    'Menanam identiti murid soleh dalam kalangan murid Tahun 1 hingga 6 sebagai khalifah dan hamba Allah yang bertanggungjawab, berdisiplin, berakhlak, amanah, jujur dan bijaksana.',
    'Menegaskan bahawa tidak ada keberkatan dan kejayaan dunia serta akhirat melainkan daripada Allah SWT.',
    'Menyediakan dokumentasi dan bukti pelaksanaan yang kemas untuk pemantauan Bahagian Pendidikan Islam, JAIS.',
], 1):
    par = doc.add_paragraph(style='List Number')
    par.add_run(x)
    par.paragraph_format.space_after = Pt(2)

# ---------- 4 ----------
h1('4. Aturcara')
table([
    ['Masa', 'Tempoh', 'Acara', 'Pemilik'],
    ['2.30 – 2.40', '10 minit', 'Pembukaan: salam, mukadimah, doa pembuka dan Al-Fatihah', 'Pengendali'],
    ['2.40 – 3.00', '20 minit', 'Tadabbur Surah Az-Zalzalah (bacaan, makna, penghayatan, soal jawab)', 'Pengendali'],
    ['3.00 – 3.20', '20 minit', 'Tazkirah, identiti murid soleh, keberkatan daripada Allah, ikrar dan doa penutup', 'Pengendali'],
    ['3.20 – 3.50', '30 minit', 'Majlis Khatam: Ad-Dhuha hingga An-Nas, Al-Fatihah, Al-Baqarah 1–5 dan doa khatam', 'Pengacara majlis'],
    ['3.50 – 4.00', '10 minit', 'Ucapan guru', 'Guru Besar'],
    ['4.00', '—', 'Rehat', '—'],
], widths=[2.5, 2.0, 10.0, 3.3], header=True)

# ---------- 5 ----------
h1('5. Urutan Bacaan Khatam')
for x in [
    'Bacaan dimulakan dengan Surah Ad-Dhuha (93) dan diteruskan mengikut urutan hingga Surah An-Nas (114).',
    'Selepas Surah An-Nas, kembali membaca Surah Al-Fatihah.',
    'Kemudian membaca Surah Al-Baqarah ayat 1 hingga 5.',
    'Diakhiri dengan doa khatam, selawat, doa untuk ibu bapa dan guru, serta Al-Fatihah.',
]:
    bullet(x)
p('Surah 93–114: Ad-Dhuha, Asy-Syarh, At-Tin, Al-\'Alaq, Al-Qadr, Al-Bayyinah, Az-Zalzalah, Al-\'Adiyat, Al-Qari\'ah, At-Takathir, Al-\'Asr, Al-Humazah, Al-Fil, Quraisy, Al-Ma\'un, Al-Kausar, Al-Kafirun, An-Nasr, Al-Masad, Al-Ikhlas, Al-Falaq, An-Nas.', size=8.5, color=GREY)
p('Nota: Urutan ini ialah amalan majlis khatam yang biasa di Malaysia. Ia bukan ibadah wajib dan bukan syarat sah khatam. Yang dituntut ialah membaca dengan betul, memahami makna dan berdoa dengan ikhlas kepada Allah.', size=9, color=GREY)

# ---------- 6 ----------
h1('6. Doa Khatam dan Makna')
arabic('اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً. اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.')
p('Makna: Ya Allah, rahmatilah aku dengan Al-Quran. Jadikanlah ia bagiku imam, cahaya, petunjuk dan rahmat. Ya Allah, ingatkanlah aku apa yang aku lupa daripadanya, ajarkanlah aku apa yang aku tidak tahu, kurniakanlah aku membaca dan melafazkannya sepanjang malam dan hujung siang, dan jadikanlah ia hujah bagiku, wahai Tuhan sekalian alam.')
p('Doa ini masyhur dibaca selepas khatam. Ia dibaca sebagai doa, bukan sebagai hadis marfu\' yang sabit daripada Nabi ﷺ. Lafaz hendaklah disahkan dengan guru atau ustaz sebelum majlis.', size=9, color=GREY)

doc.add_page_break()

# ---------- 7 ----------
h1('7. Ringkasan Slot Tadabbur dan Tazkirah')
h2('7.1 Tadabbur Surah Az-Zalzalah (2.40 – 3.00)')
for x in [
    'Surah Az-Zalzalah: surah ke-99, 8 ayat, Juzuk 30.',
    'Bacaan ayat 1–8, makna dan penghayatan: bumi bergoncang, bumi menjadi saksi, manusia keluar berpuak-puak, dan amalan seberat zarah tetap dilihat.',
    'Tiga pengajaran: dunia sementara; setiap amalan dicatat dan diperlihatkan; yang kecil pun dikira.',
]:
    bullet(x)
h2('7.2 Identiti Murid Soleh (3.00 – 3.20)')
for x in [
    'Khalifah, hamba Allah, bertanggungjawab, berdisiplin, berakhlak dan beradab, amanah, jujur, bijaksana.',
    'Tahun 1–2: adab asas, kenal Allah, hormat ibu bapa dan guru.',
    'Tahun 3–4: solat, tugasan, amanah dan jujur.',
    'Tahun 5–6: kepimpinan, contoh kepada adik-adik, memahami makna dan mengamalkan Al-Quran.',
]:
    bullet(x)
h2('7.3 Keberkatan Hanya daripada Allah')
p('Tidak ada keberkatan, taufik, pertolongan atau kejayaan dunia dan akhirat melainkan daripada Allah SWT. Usaha manusia hanyalah sebab; hasil dan keberkatannya milik Allah. Pegangan ini menolak kepercayaan kepada tangkal, azimat, bomoh dan kuasa ghaib selain Allah.')
p('Dalil utama: Al-Quran 7:96 (keberkatan kerana iman dan takwa), 11:88 (taufik hanya dengan Allah), 3:160 (pertolongan Allah), 1:5 (ibadah dan permohonan hanya kepada Allah), 2:201 (kebaikan dunia dan akhirat).', size=9, color=GREY)

# ---------- 8 ----------
h1('8. Siaran Langsung dan Pemantauan')
table([
    ['Platform', 'Facebook Live'],
    ['Tujuan', 'Pemantauan, dokumentasi dan bukti pelaksanaan program peringkat negeri'],
    ['Pemantau', 'Bahagian Pendidikan Islam, Jabatan Agama Islam Selangor'],
    ['Pautan siaran', '______________________________________________ (diisi oleh penyelaras)'],
    ['Simpanan rakaman', 'Rakaman disimpan sebagai bukti pelaksanaan dan dilampirkan dalam laporan program'],
], widths=[4.3, 13.5])
p('Pautan Facebook Live hendaklah diuji sekurang-kurangnya 30 minit sebelum majlis. Pastikan audio dewan jelas, kamera menghala ke pentas dan skrin slaid, serta rakaman tidak terputus.', size=9, color=GREY)

# ---------- 9 ----------
h1('9. Bukti Pelaksanaan')
for x in [
    'Senarai hadir murid, guru dan tetamu.',
    'Surat jemputan dan surat kebenaran program.',
    'Aturcara rasmi majlis.',
    'Slaid tadabbur dan tazkirah (laman web).',
    'Rakaman Facebook Live dan tangkapan skrin siaran.',
    'Gambar rasmi program.',
    'Laporan ringkas selepas program.',
    'Dokumentasi ini dalam format PDF dan Word.',
]:
    bullet(x, check=True)

# ---------- 10 ----------
h1('10. Pautan Rujukan')
table([
    ['Laman slaid', 'https://aimanrafee.github.io/Program-Khatam-Quran-KAFA/'],
    ['Halaman dokumentasi', 'majlis-khatam-2026.html'],
    ['Pangkalan dalil', 'data/dalil.json (ayat, hadis, tafsir dan nota manhaj)'],
    ['Jadual program', 'data/jadual.json'],
    ['Urutan dan doa khatam', 'data/khatam.json'],
], widths=[4.3, 13.5])

# ---------- 11 ----------
h1('11. Nota Manhaj dan Penutup')
p('Kandungan majlis ini berpandukan Al-Quran, Sunnah yang sabit dan kefahaman para ulama Ahlus Sunnah wal Jamaah. Tujuan penyampaian ialah mengajak murid mengagungkan kalam Allah, mentaati Rasulullah ﷺ dan beramal soleh ikhlas kerana Allah, bukan untuk mencari pujian manusia. Segala keberkatan dan kejayaan dunia serta akhirat hanya daripada Allah SWT.')
p('Dokumentasi ini disediakan sebagai rujukan penyelaras, pengendali slot dan pihak pemantau. Sebarang pembetulan maklumat hendaklah disahkan oleh Guru Besar dan penyelaras program sebelum dilaporkan.')

# ---------- Tandatangan ----------
t = doc.add_table(rows=1, cols=2)
t.autofit = False
t.columns[0].width = Cm(8.7)
t.columns[1].width = Cm(8.7)
for i, (name, role) in enumerate([
    ('Muhammad Aiman bin Mohamad Rafee', 'Pengendali Slot Tadabbur dan Tazkirah'),
    ('Ustazah Mufidah binti Masroni', 'Guru Besar, KAFA Integrasi As-Syariff'),
]):
    cell = t.rows[0].cells[i]
    cell.text = ''
    par = cell.paragraphs[0]
    par.paragraph_format.space_before = Pt(34)
    run = par.add_run('_____________________________')
    par2 = cell.add_paragraph()
    r1 = par2.add_run(name)
    r1.bold = True
    r1.font.size = Pt(9.5)
    par3 = cell.add_paragraph()
    r2 = par3.add_run(role)
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = GREY

p('Dokumen dijana pada 17 November 2026 · Versi 1.0 · Untuk pemantauan Bahagian Pendidikan Islam, JAIS.', size=8.5, color=GREY)

doc.save(OUT)
print('OK', OUT)
