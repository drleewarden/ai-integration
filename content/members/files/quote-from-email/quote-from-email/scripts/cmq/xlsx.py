"""Minimal .xlsx read/write with the standard library (no openpyxl).

Enough for the Client Register: several sheets of plain text and number cells, a bold
frozen header row, money formatting and an autofilter. Reads files that Google Sheets
has re-saved (shared strings, rich text, date serials come back as numbers).
"""
import os
import re
import zipfile
from datetime import date, timedelta
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      "pr": "http://schemas.openxmlformats.org/package/2006/relationships"}
_CELL_REF = re.compile(r"^([A-Z]+)(\d+)$")
# Characters XML 1.0 cannot carry; strip them rather than write a file Excel/Sheets rejects.
_BAD_XML = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def col_letter(i):
    s = ""
    i += 1
    while i:
        i, r = divmod(i - 1, 26)
        s = chr(65 + r) + s
    return s


def _col_index(letters):
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n - 1


def serial_to_iso(v):
    """Spreadsheet date serial (1900 system) to YYYY-MM-DD."""
    return (date(1899, 12, 30) + timedelta(days=int(float(v)))).isoformat()


# ---------- reading ----------

def read(path):
    """{sheet name: [row lists]} with every cell as str, or float for numeric cells."""
    with zipfile.ZipFile(path) as z:
        names = set(z.namelist())
        shared = []
        if "xl/sharedStrings.xml" in names:
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS):
                shared.append("".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t")))
        rels = {r.get("Id"): r.get("Target") for r in
                ET.fromstring(z.read("xl/_rels/workbook.xml.rels")).findall("pr:Relationship", NS)}
        out = {}
        for sh in ET.fromstring(z.read("xl/workbook.xml")).find("m:sheets", NS):
            target = rels[sh.get(f"{{{NS['r']}}}id")].lstrip("/")
            target = target if target.startswith("xl/") else "xl/" + target
            out[sh.get("name")] = _read_sheet(z.read(target), shared)
        return out


def _read_sheet(xml, shared):
    rows = []
    for row in ET.fromstring(xml).iter(f"{{{NS['m']}}}row"):
        cells = {}
        for c in row.findall("m:c", NS):
            m = _CELL_REF.match(c.get("r", ""))
            idx = _col_index(m.group(1)) if m else len(cells)
            t, v = c.get("t"), c.find("m:v", NS)
            if t == "s" and v is not None:
                val = shared[int(v.text)]
            elif t == "inlineStr":
                val = "".join(x.text or "" for x in c.iter(f"{{{NS['m']}}}t"))
            elif v is None:
                val = ""
            elif t in ("str", "e"):
                val = v.text or ""
            elif t == "b":
                val = "TRUE" if v.text == "1" else "FALSE"
            else:
                val = float(v.text)
            cells[idx] = val
        r_idx = int(row.get("r", len(rows) + 1)) - 1
        while len(rows) < r_idx:
            rows.append([])
        rows.append([cells.get(i, "") for i in range(max(cells) + 1)] if cells else [])
    return rows


# ---------- writing ----------

_STYLES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF0B1B3B"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>"""


def _cell(ref, val, style):
    if isinstance(val, (int, float)) and not isinstance(val, bool):
        s = f' s="{style}"' if style else ""
        return f'<c r="{ref}"{s}><v>{val}</v></c>'
    text = escape(_BAD_XML.sub("", str(val)))
    if not text:
        return ""
    s = ' s="1"' if style == 1 else ""
    return f'<c r="{ref}" t="inlineStr"{s}><is><t xml:space="preserve">{text}</t></is></c>'


def _sheet_xml(rows, money_cols, widths):
    body = []
    for r, row in enumerate(rows):
        cells = "".join(_cell(f"{col_letter(c)}{r + 1}", v, 1 if r == 0 else (2 if c in money_cols else 0))
                        for c, v in enumerate(row))
        body.append(f'<row r="{r + 1}">{cells}</row>')
    ncols = max((len(r) for r in rows), default=1)
    cols = "".join(f'<col min="{i + 1}" max="{i + 1}" width="{w}" customWidth="1"/>' for i, w in enumerate(widths))
    last = f"{col_letter(ncols - 1)}{max(len(rows), 1)}"
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<worksheet xmlns="{NS["m"]}" xmlns:r="{NS["r"]}">'
            '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" '
            'state="frozen"/></sheetView></sheetViews>'
            f'<cols>{cols}</cols><sheetData>{"".join(body)}</sheetData>'
            f'<autoFilter ref="A1:{last}"/></worksheet>')


def write(path, sheets):
    """sheets: list of (name, rows, money_col_indexes, col_widths). Atomic replace, so Drive
    never syncs a half-written file."""
    n = len(sheets)
    ct = "".join(f'<Override PartName="/xl/worksheets/sheet{i + 1}.xml" '
                 'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                 for i in range(n))
    files = {
        "[Content_Types].xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/styles.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            f'{ct}</Types>',
        "_rels/.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<Relationships xmlns="{NS["pr"]}"><Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
            'Target="xl/workbook.xml"/></Relationships>',
        "xl/workbook.xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<workbook xmlns="{NS["m"]}" xmlns:r="{NS["r"]}"><sheets>'
            + "".join(f'<sheet name="{escape(s[0])}" sheetId="{i + 1}" r:id="rId{i + 1}"/>' for i, s in enumerate(sheets))
            + '</sheets></workbook>',
        "xl/_rels/workbook.xml.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<Relationships xmlns="{NS["pr"]}">'
            + "".join(f'<Relationship Id="rId{i + 1}" '
                      'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
                      f'Target="worksheets/sheet{i + 1}.xml"/>' for i in range(n))
            + f'<Relationship Id="rId{n + 1}" '
              'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
              'Target="styles.xml"/></Relationships>',
        "xl/styles.xml": _STYLES,
    }
    for i, (_, rows, money, widths) in enumerate(sheets):
        files[f"xl/worksheets/sheet{i + 1}.xml"] = _sheet_xml(rows, set(money), widths)
    tmp = path.with_name(f".{path.name}.tmp")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)
    os.replace(tmp, path)
