# -*- coding: utf-8 -*-
"""Bina Skrip_Tadabbur_Majlis_Khatam_17Nov2026.docx daripada fail .md.
Satu sumber kebenaran: sunting .md, kemudian jalankan skrip ini.
    python scripts/bina-skrip-docx.py
"""
import os
import re
import sys

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'Skrip_Tadabbur_Majlis_Khatam_17Nov2026.md')
OUT = os.path.join(ROOT, 'Skrip_Tadabbur_Majlis_Khatam_17Nov2026.docx')

GREEN = RGBColor(0x0B, 0x6B, 0x45)
DARK = RGBColor(0x14, 0x24, 0x2B)
GREY = RGBColor(0x55, 0x67, 0x5D)
ARABIC = re.compile(r'[\u0600-\u06FF]')
INLINE = re.compile(r'(\*\*.+?\*\*|`.+?`|(?<!\*)\*(?!\*).+?(?<!\*)\*(?!\*)|\[[^\]]+\]\([^)]+\))')


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    el = OxmlElement('w:shd')
    el.set(qn('w:val'), 'clear')
    el.set(qn('w:color'), 'auto')
    el.set(qn('w:fill'), hexcolor)
    tcPr.append(el)


def border(par, color='C9A227', size='12', edge='bottom'):
    pPr = par._p.get_or_add_pPr()
    pbdr = OxmlElement('w:pBdr')
    e = OxmlElement(f'w:{edge}')
    e.set(qn('w:val'), 'single')
    e.set(qn('w:sz'), size)
    e.set(qn('w:space'), '4')
    e.set(qn('w:color'), color)
    pbdr.append(e)
    pPr.append(pbdr)


def add_inline(par, text, base_size=10.5, base_color=None, base_bold=False, base_italic=False):
    """Tulis teks dengan **tebal**, *italik*, `kod` dan [pautan](url)."""
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1 (\2)', text)
    for piece in INLINE.split(text):
        if not piece:
            continue
        bold, italic, code = base_bold, base_italic, False
        if piece.startswith('**') and piece.endswith('**') and len(piece) > 4:
            piece, bold = piece[2:-2], True
        elif piece.startswith('`') and piece.endswith('`') and len(piece) > 2:
            piece, code = piece[1:-1], True
        elif piece.startswith('*') and piece.endswith('*') and len(piece) > 2:
            piece, italic = piece[1:-1], True
        run = par.add_run(piece)
        run.bold = bold
        run.italic = italic
        run.font.size = Pt(base_size)
        run.font.name = 'Consolas' if code else ('Traditional Arabic' if ARABIC.search(piece) else 'Segoe UI')
        if ARABIC.search(piece):
            run.font.size = Pt(base_size + 3.5)
            rPr = run._element.get_or_add_rPr()
            rPr.append(OxmlElement('w:rtl'))
        if base_color is not None:
            run.font.color.rgb = base_color


def add_para(doc, style=None, space_after=4, space_before=0, indent=None):
    p = doc.add_paragraph(style=style) if style else doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_after = Pt(space_after)
    pf.space_before = Pt(space_before)
    pf.line_spacing = 1.22
    if indent is not None:
        pf.left_indent = Cm(indent)
    return p


def heading(doc, text, level):
    style = {1: 'Heading 1', 2: 'Heading 2', 3: 'Heading 3', 4: 'Heading 4'}.get(level, 'Heading 3')
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_before = Pt(12 if level <= 2 else 9)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Segoe UI'
    run.font.size = Pt({1: 17, 2: 13, 3: 11, 4: 10.5}.get(level, 10.5))
    run.font.color.rgb = GREEN if level <= 2 else DARK
    if level <= 2:
        border(p, color='C9A227' if level == 2 else '0B6B45', size='12')
    return p


def flush_table(doc, rows):
    if not rows:
        return
    cols = len(rows[0])
    t = doc.add_table(rows=0, cols=cols)
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r_i, row in enumerate(rows):
        cells = t.add_row().cells
        for c_i in range(cols):
            val = row[c_i] if c_i < len(row) else ''
            cell = cells[c_i]
            cell.text = ''
            par = cell.paragraphs[0]
            par.paragraph_format.space_after = Pt(2)
            par.paragraph_format.line_spacing = 1.1
            add_inline(par, val, base_size=9)
            if r_i == 0:
                for r in par.runs:
                    r.bold = True
                    r.font.color.rgb = GREEN
                shade(cell, 'EAF3EE')
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)


def build():
    with open(SRC, encoding='utf-8') as fh:
        lines = fh.read().splitlines()

    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
    sec.top_margin = sec.bottom_margin = Cm(1.7)
    sec.left_margin = sec.right_margin = Cm(1.8)

    normal = doc.styles['Normal']
    normal.font.name = 'Segoe UI'
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = DARK
    for lvl in (1, 2, 3, 4):
        st = doc.styles[f'Heading {lvl}']
        st.font.name = 'Segoe UI'
        st.font.color.rgb = GREEN if lvl <= 2 else DARK

    table_rows, quote_buf = [], []

    def flush_quote():
        nonlocal quote_buf
        for q in quote_buf:
            p = add_para(doc, indent=0.55, space_after=4)
            border(p, color='C9A227', size='12', edge='left')
            add_inline(p, q, base_size=10, base_color=RGBColor(0x24, 0x36, 0x2E))
        quote_buf = []

    def flush():
        nonlocal table_rows
        flush_quote()
        if table_rows:
            flush_table(doc, table_rows)
            table_rows = []

    for raw in lines:
        line = raw.rstrip()
        if line.startswith('|') and line.count('|') >= 2:
            flush_quote()
            cells = [c.strip() for c in line.strip('|').split('|')]
            if all(re.fullmatch(r':?-{2,}:?', c) for c in cells if c):
                continue
            table_rows.append(cells)
            continue
        if table_rows:
            flush()

        if not line.strip():
            if quote_buf:
                quote_buf.append('')
            continue

        if line.strip() == '---':
            flush_quote()
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(3)
            border(p, color='D5DED8', size='6')
            continue

        m = re.match(r'^(#{1,6})\s+(.*)$', line)
        if m:
            flush_quote()
            heading(doc, m.group(2).strip(), len(m.group(1)))
            continue

        if line.startswith('>'):
            text = re.sub(r'^>\s?', '', line)
            if text.strip() == '':
                if quote_buf:
                    quote_buf.append('')
            else:
                quote_buf.append(text)
            continue
        flush_quote()

        m = re.match(r'^(\s*)[-*]\s+\[( |x|X)\]\s+(.*)$', line)
        if m:
            p = add_para(doc, space_after=2, indent=0.85)
            p.paragraph_format.first_line_indent = Cm(-0.55)
            add_inline(p, '☐  ' + m.group(3))
            continue

        m = re.match(r'^(\s*)[-*]\s+(.*)$', line)
        if m:
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.2
            add_inline(p, m.group(2))
            continue

        m = re.match(r'^(\s*)\d+[.)]\s+(.*)$', line)
        if m:
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.2
            add_inline(p, m.group(2))
            continue

        # Perenggan biasa (termasuk baris pertama yang tebal).
        p = add_para(doc)
        add_inline(p, line.strip())

    flush()

    # Footer
    footer = sec.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fr = footer.add_run('Majlis Khatam Al-Quran Perdana Murid Tahun 6 · 17 November 2026 · KAFA Integrasi As-Syariff')
    fr.font.size = Pt(7.5)
    fr.font.color.rgb = GREY

    doc.save(OUT)
    return OUT


if __name__ == '__main__':
    try:
        print('OK', build())
    except Exception as exc:  # noqa: BLE001
        print('GAGAL:', exc, file=sys.stderr)
        raise
