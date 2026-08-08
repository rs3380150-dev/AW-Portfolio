import argparse
import math
import shutil
import tempfile
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


PAGE_W, PAGE_H = A4
MARGIN = 42

INK = HexColor("#02080C")
NAVY = HexColor("#061723")
NAVY_2 = HexColor("#092331")
BLUE = HexColor("#0B78AC")
BLUE_DARK = HexColor("#075C8A")
BLUE_LIGHT = HexColor("#66BFE6")
COPPER = HexColor("#D18A5A")
COPPER_LIGHT = HexColor("#E0A174")
PAPER = HexColor("#F5F3EF")
SILVER = HexColor("#C7D1D8")
MUTED = HexColor("#91A0AA")
MUTED_DARK = HexColor("#647681")

ARTIST = "Achyut Wadhwa"
ROLE = "Music Producer / DJ / Performer / Multi-Instrumentalist"
LOCATION = "India - Worldwide"
EMAIL = "wadhwaachyut@gmail.com"
PHONE = "+91 70098 20546"
PHONE_ALT = "+91 98789 06586"
INSTAGRAM = "@achyutwadhwa"
INSTAGRAM_URL = "https://instagram.com/achyutwadhwa"
WHATSAPP_URL = "https://wa.me/917009820546"

BIO = [
    "Achyut Wadhwa is a music producer, DJ, live performer, and multi-instrumentalist working at the intersection of rhythm and atmosphere.",
    "Drawing from the storied legacy of the electronic scene, his sound moves through genre-fluid body music, driving grooves, and psychedelic energy. The result is a sophisticated but physical sound built for rooms that want depth as much as impact.",
    "Whether behind the decks, on stage, or in the studio, Achyut prioritizes the narrative of the set: tension, release, texture, and momentum. Every performance is shaped as a journey that elevates the spirit of the reveler while pushing modern electronic music through a high-fidelity, high-energy lens.",
]

PILLARS = [
    ("01", "Rhythm", "Grooves that lock the room in, then evolve through pressure, silence, and release."),
    ("02", "Atmosphere", "Instrumental texture, analog detail, and psychedelic energy give every idea a world beyond the drop."),
    ("03", "Narrative", "The journey matters as much as the destination: tension, story, spirit, and lasting impact."),
]

CORE_FORMATS = [
    ("DJ PERFORMANCE", "Narrative club, festival, private-event, and destination sets shaped around the room, crowd, and energy arc."),
    ("LIVE PERFORMER SET", "Performance-led electronic formats with stage presence, live-feel transitions, musical cues, and immersive movement."),
    ("MULTI-INSTRUMENTAL", "Melodic hooks, harmonic layers, motifs, and live-feeling textures developed for tracks and special performances."),
    ("MUSIC PRODUCTION", "Original records, custom remixes, sonic identities, arrangements, and collaboration-ready electronic productions."),
]

SERVICES = [
    ("01", "DJ Performances", "Club, festival, private, and destination sets."),
    ("02", "Live Performance", "Stage-led electronic experiences with presence."),
    ("03", "Music Production", "Original concepts through polished final masters."),
    ("04", "Custom Remixes", "Distinct reinterpretations with depth and pressure."),
    ("05", "Mixing & Mastering", "High-fidelity polish built to translate."),
    ("06", "Creative Collaborations", "For artists, vocalists, brands, and visual teams."),
]

EVENT_CONTEXTS = [
    "Clubs & festivals",
    "Premium private events",
    "College festivals",
    "Corporate experiences",
    "Weddings & celebrations",
    "Studio collaborations",
]


def parse_args():
    parser = argparse.ArgumentParser(description="Generate the Achyut Wadhwa press kit.")
    parser.add_argument("--frontend", type=Path, default=None)
    parser.add_argument("--output", type=Path, default=None)
    return parser.parse_args()


def register_fonts():
    candidates = {
        "Display": Path("C:/Windows/Fonts/ARIALNB.TTF"),
        "DisplayBold": Path("C:/Windows/Fonts/ARIALNBD.TTF"),
        "Body": Path("C:/Windows/Fonts/arial.ttf"),
        "BodyBold": Path("C:/Windows/Fonts/arialbd.ttf"),
        "Editorial": Path("C:/Windows/Fonts/georgiai.ttf"),
    }
    fallbacks = {
        "Display": "Helvetica",
        "DisplayBold": "Helvetica-Bold",
        "Body": "Helvetica",
        "BodyBold": "Helvetica-Bold",
        "Editorial": "Times-Italic",
    }
    fonts = {}
    for name, path in candidates.items():
        if path.exists():
            pdfmetrics.registerFont(TTFont(name, str(path)))
            fonts[name] = name
        else:
            fonts[name] = fallbacks[name]
    return fonts


def set_alpha(c, fill=1, stroke=1):
    if hasattr(c, "setFillAlpha"):
        c.setFillAlpha(fill)
    if hasattr(c, "setStrokeAlpha"):
        c.setStrokeAlpha(stroke)


def reset_alpha(c):
    set_alpha(c, 1, 1)


def lerp_color(a, b, t):
    return Color(
        a.red + (b.red - a.red) * t,
        a.green + (b.green - a.green) * t,
        a.blue + (b.blue - a.blue) * t,
    )


def vertical_gradient(c, x, y, w, h, start, end, steps=90):
    step = h / steps
    for i in range(steps):
        c.setFillColor(lerp_color(start, end, i / max(steps - 1, 1)))
        c.rect(x, y + i * step, w, step + 0.6, fill=1, stroke=0)


def image_cover(c, path, x, y, w, h, radius=0):
    with Image.open(path) as im:
        iw, ih = im.size
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    dx = x + (w - dw) / 2
    dy = y + (h - dh) / 2
    c.saveState()
    if radius:
        clip = c.beginPath()
        clip.roundRect(x, y, w, h, radius)
        c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(ImageReader(str(path)), dx, dy, dw, dh, mask="auto")
    c.restoreState()


def image_contain(c, path, x, y, w, h, radius=0):
    with Image.open(path) as im:
        iw, ih = im.size
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    dx = x + (w - dw) / 2
    dy = y + (h - dh) / 2
    c.saveState()
    if radius:
        clip = c.beginPath()
        clip.roundRect(x, y, w, h, radius)
        c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(ImageReader(str(path)), dx, dy, dw, dh, mask="auto")
    c.restoreState()


def make_assets(frontend, work_dir):
    work_dir.mkdir(parents=True, exist_ok=True)
    portrait_source = frontend / "public" / "images" / "about-portrait.jpeg"
    if not portrait_source.exists():
        raise FileNotFoundError(f"Portrait not found: {portrait_source}")

    portrait_asset = work_dir / "press-kit-portrait.jpg"

    with Image.open(portrait_source).convert("RGB") as src:
        src = ImageOps.exif_transpose(src)
        src = ImageEnhance.Contrast(src).enhance(1.05)
        src = ImageEnhance.Sharpness(src).enhance(1.10)
        src.save(portrait_asset, quality=94, optimize=True, progressive=True)

    return {"portrait": portrait_asset}


def measure(text, font, size):
    return pdfmetrics.stringWidth(text, font, size)


def wrap_text(text, font, size, max_width):
    lines = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            candidate = f"{current} {word}"
            if measure(candidate, font, size) <= max_width:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def draw_text(c, value, x, y, font, size, color=PAPER, align="left"):
    reset_alpha(c)
    text_width = measure(value, font, size)
    if align == "right":
        x -= text_width
    elif align == "center":
        x -= text_width / 2
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setFillColor(color)
    t.setCharSpace(0)
    t.textLine(value)
    c.drawText(t)


def draw_wrapped(c, value, x, y, max_width, font, size, leading, color=SILVER, max_lines=None):
    lines = wrap_text(value, font, size, max_width)
    if max_lines:
        lines = lines[:max_lines]
    for line in lines:
        draw_text(c, line, x, y, font, size, color)
        y -= leading
    return y


def draw_tracking(c, value, x, y, font, size, tracking, color=BLUE_LIGHT):
    reset_alpha(c)
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setFillColor(color)
    t.setCharSpace(tracking)
    t.textLine(value.upper())
    c.drawText(t)


def draw_equalizer(c, x, y, color=BLUE, scale=1):
    heights = [12, 22, 16, 28, 19, 25]
    c.setFillColor(color)
    for i, height in enumerate(heights):
        c.roundRect(x + i * 7 * scale, y, 3 * scale, height * scale, 1.5 * scale, fill=1, stroke=0)


def draw_rule(c, x, y, w, color=BLUE, alpha=1, width=1):
    c.setStrokeColor(color)
    set_alpha(c, stroke=alpha)
    c.setLineWidth(width)
    c.line(x, y, x + w, y)
    reset_alpha(c)


def draw_page_label(c, number, section, fonts, light=False):
    color = NAVY if light else BLUE_LIGHT
    muted = MUTED_DARK if light else MUTED
    draw_text(c, f"{number:02d}", MARGIN, PAGE_H - 34, fonts["BodyBold"], 8, muted)
    draw_rule(c, MARGIN + 24, PAGE_H - 31, 32, color, 0.9, 0.7)
    draw_tracking(c, section, MARGIN + 67, PAGE_H - 35, fonts["BodyBold"], 7.4, 2.4, color)


def draw_footer(c, page, fonts, light=False):
    base = NAVY if light else PAPER
    muted = MUTED_DARK if light else MUTED
    set_alpha(c, stroke=0.22)
    c.setStrokeColor(base)
    c.setLineWidth(0.4)
    c.line(MARGIN, 33, PAGE_W - MARGIN, 33)
    reset_alpha(c)
    draw_tracking(c, "ACHYUT WADHWA / PRESS KIT", MARGIN, 18, fonts["BodyBold"], 6.6, 1.4, muted)
    draw_text(c, f"{page:02d} / 06", PAGE_W - MARGIN, 18, fonts["BodyBold"], 7, muted, "right")


def draw_heading(c, eyebrow, title, x, y, width, fonts, light=False, size=35):
    accent = BLUE_DARK if light else BLUE_LIGHT
    title_color = NAVY if light else PAPER
    draw_tracking(c, eyebrow, x, y, fonts["BodyBold"], 7.6, 2.5, accent)
    y -= 42
    lines = wrap_text(title.upper(), fonts["DisplayBold"], size, width)
    for line in lines:
        draw_text(c, line, x, y, fonts["DisplayBold"], size, title_color)
        y -= size * 1.02
    draw_rule(c, x, y - 2, 72, accent, 1, 1.2)
    return y - 28


def draw_glow(c, x, y, radius, color, alpha=0.08):
    for i in range(18, 0, -1):
        r = radius * i / 18
        c.setFillColor(color)
        set_alpha(c, fill=alpha * (1 - i / 19) * 0.55)
        c.circle(x, y, r, fill=1, stroke=0)
    reset_alpha(c)


def draw_wave_field(c, x, y, w, h, color=BLUE_LIGHT, alpha=0.12, lines=10, amplitude=18, cycles=1.6):
    c.saveState()
    clip = c.beginPath()
    clip.rect(x, y, w, h)
    c.clipPath(clip, stroke=0, fill=0)
    c.setStrokeColor(color)
    set_alpha(c, stroke=alpha)
    c.setLineWidth(0.55)
    steps = 72
    for row in range(lines):
        baseline = y + (row + 0.5) * h / lines
        phase = row * 0.48
        path = c.beginPath()
        for step in range(steps + 1):
            ratio = step / steps
            px = x + ratio * w
            envelope = math.sin(math.pi * ratio) ** 1.35
            py = baseline + math.sin(ratio * math.pi * 2 * cycles + phase) * amplitude * envelope
            if step == 0:
                path.moveTo(px, py)
            else:
                path.lineTo(px, py)
        c.drawPath(path, stroke=1, fill=0)
    c.restoreState()
    reset_alpha(c)


def draw_signal_grid(c, x, y, w, h, color=BLUE_LIGHT, alpha=0.06, spacing=28):
    c.setStrokeColor(color)
    set_alpha(c, stroke=alpha)
    c.setLineWidth(0.35)
    column = x
    while column <= x + w:
        c.line(column, y, column, y + h)
        column += spacing
    row = y
    while row <= y + h:
        c.line(x, row, x + w, row)
        row += spacing
    reset_alpha(c)


def draw_orbit_lines(c, cx, cy, color=BLUE_LIGHT, alpha=0.10):
    c.setStrokeColor(color)
    set_alpha(c, stroke=alpha)
    for radius in (54, 82, 116, 154, 198):
        c.setLineWidth(0.55 if radius < 120 else 0.35)
        c.circle(cx, cy, radius, fill=0, stroke=1)
    reset_alpha(c)


def draw_cover(c, assets, fonts):
    vertical_gradient(c, 0, 0, PAGE_W, PAGE_H, INK, NAVY_2)
    draw_glow(c, PAGE_W - 65, PAGE_H - 70, 250, BLUE, 0.075)
    draw_glow(c, 80, 180, 220, BLUE_DARK, 0.055)
    draw_signal_grid(c, PAGE_W - 280, 0, 280, PAGE_H, BLUE_LIGHT, 0.035, 31)
    draw_wave_field(c, 0, 105, PAGE_W, 470, BLUE_LIGHT, 0.055, 11, 30, 1.25)
    draw_orbit_lines(c, PAGE_W + 28, PAGE_H - 56, BLUE_LIGHT, 0.055)

    draw_equalizer(c, MARGIN, PAGE_H - 72, BLUE_LIGHT, 0.9)
    draw_tracking(c, "OFFICIAL PRESS KIT / 2026", MARGIN + 55, PAGE_H - 63, fonts["BodyBold"], 7.6, 2.1, PAPER)
    draw_text(c, "01", PAGE_W - MARGIN, PAGE_H - 63, fonts["BodyBold"], 8, SILVER, "right")

    panel_x = PAGE_W - 246
    panel_y = 292
    panel_w = 202
    panel_h = 324
    c.setFillColor(PAPER)
    c.setStrokeColor(BLUE_LIGHT)
    set_alpha(c, fill=0.12, stroke=0.38)
    c.setLineWidth(0.8)
    c.roundRect(panel_x, panel_y, panel_w, panel_h, 8, fill=1, stroke=1)
    reset_alpha(c)
    image_y = panel_y + 58
    image_h = panel_h - 66
    c.setFillColor(INK)
    c.roundRect(panel_x + 8, image_y, panel_w - 16, image_h, 5, fill=1, stroke=0)
    image_contain(c, assets["portrait"], panel_x + 8, image_y, panel_w - 16, image_h, 5)
    draw_rule(c, panel_x + 18, panel_y + 51, panel_w - 36, BLUE_LIGHT, 0.35, 0.55)
    draw_tracking(c, "MUSIC / PERFORMANCE / SOUND", panel_x + 18, panel_y + 24, fonts["BodyBold"], 5.4, 0.8, SILVER)

    draw_tracking(c, "ACHYUT", MARGIN, 545, fonts["BodyBold"], 10, 4.0, BLUE_LIGHT)
    draw_text(c, "ACHYUT", MARGIN, 479, fonts["DisplayBold"], 58, PAPER)
    draw_text(c, "WADHWA", MARGIN + 2, 426, fonts["DisplayBold"], 51, COPPER_LIGHT)
    draw_rule(c, MARGIN, 398, 222, BLUE_LIGHT, 0.9, 1.1)
    y = draw_wrapped(c, ROLE, MARGIN, 370, 235, fonts["BodyBold"], 10.2, 15.5, PAPER)
    draw_text(c, "RHYTHM / ATMOSPHERE / MOVEMENT", MARGIN, y - 28, fonts["Body"], 8.5, SILVER)

    draw_tracking(c, LOCATION, MARGIN, 94, fonts["BodyBold"], 7.3, 2.0, BLUE_LIGHT)
    draw_text(c, EMAIL, MARGIN, 69, fonts["Body"], 9.5, PAPER)
    draw_text(c, INSTAGRAM, MARGIN, 52, fonts["Body"], 9.5, PAPER)


def draw_profile(c, assets, fonts):
    vertical_gradient(c, 0, 0, PAGE_W, PAGE_H, INK, NAVY)
    draw_glow(c, PAGE_W - 48, PAGE_H - 80, 210, BLUE, 0.075)
    draw_wave_field(c, 320, 80, PAGE_W - 320, 650, BLUE_LIGHT, 0.045, 12, 24, 1.4)
    draw_page_label(c, 2, "ARTIST PROFILE", fonts)

    y = draw_heading(c, "02 / BIOGRAPHY", "At the intersection of rhythm and atmosphere.", MARGIN, PAGE_H - 85, 490, fonts, size=30)
    bio_x = MARGIN
    bio_w = 306
    for idx, paragraph in enumerate(BIO):
        y = draw_wrapped(c, paragraph, bio_x, y, bio_w, fonts["Body"], 10, 15.2, SILVER)
        y -= 13 if idx < len(BIO) - 1 else 0

    highlight_h = 132
    highlight_y = y - highlight_h - 20
    c.setFillColor(PAPER)
    c.setStrokeColor(BLUE_LIGHT)
    set_alpha(c, fill=0.055, stroke=0.30)
    c.roundRect(bio_x, highlight_y, bio_w, highlight_h, 5, fill=1, stroke=1)
    reset_alpha(c)
    draw_tracking(c, "FEATURED EXPERIENCE", bio_x + 16, highlight_y + 108, fonts["BodyBold"], 6.8, 1.9, BLUE_LIGHT)
    draw_tracking(c, "BRAND COLLABORATIONS", bio_x + 16, highlight_y + 82, fonts["BodyBold"], 5.8, 1.3, COPPER_LIGHT)
    brand_card_gap = 8
    brand_card_w = (bio_w - 32 - brand_card_gap) / 2
    brand_card_y = highlight_y + 52
    for index, brand in enumerate(("MG HECTOR", "PORSCHE")):
        brand_card_x = bio_x + 16 + index * (brand_card_w + brand_card_gap)
        c.setFillColor(PAPER)
        c.setStrokeColor(BLUE_LIGHT)
        set_alpha(c, fill=0.045, stroke=0.25)
        c.roundRect(brand_card_x, brand_card_y, brand_card_w, 24, 3, fill=1, stroke=1)
        reset_alpha(c)
        draw_text(c, brand, brand_card_x + brand_card_w / 2, brand_card_y + 7.5, fonts["DisplayBold"], 9.6, PAPER, "center")
    draw_rule(c, bio_x + 16, highlight_y + 47, bio_w - 32, PAPER, 0.13, 0.45)
    draw_tracking(c, "LIVE APPEARANCE - 2023", bio_x + 16, highlight_y + 28, fonts["BodyBold"], 5.8, 1.3, COPPER_LIGHT)
    draw_text(c, "MISSOSEXY, DELHI", bio_x + 16, highlight_y + 9, fonts["DisplayBold"], 12.5, PAPER)

    divider_x = 370
    c.setStrokeColor(BLUE_LIGHT)
    set_alpha(c, stroke=0.17)
    c.setLineWidth(0.55)
    c.line(divider_x, 128, divider_x, 566)
    reset_alpha(c)

    side_x = 394
    side_w = PAGE_W - side_x - MARGIN
    draw_tracking(c, "CORE DISCIPLINES", side_x, 560, fonts["BodyBold"], 7.1, 2.0, BLUE_LIGHT)
    roles = ["Music Producer", "DJ", "Performer", "Multi-Instrumentalist"]
    role_y = 520
    for idx, role in enumerate(roles):
        draw_text(c, f"0{idx + 1}", side_x, role_y, fonts["BodyBold"], 7.4, BLUE_LIGHT)
        draw_text(c, role.upper(), side_x + 27, role_y - 1, fonts["DisplayBold"], 12.4, PAPER)
        draw_rule(c, side_x, role_y - 20, side_w, PAPER, 0.13, 0.45)
        role_y -= 58

    quote_y = 112
    quote_h = 146
    c.setFillColor(PAPER)
    c.setStrokeColor(BLUE_LIGHT)
    set_alpha(c, fill=0.055, stroke=0.24)
    c.roundRect(side_x, quote_y, side_w, quote_h, 5, fill=1, stroke=1)
    reset_alpha(c)
    draw_tracking(c, "CREATIVE PRINCIPLE", side_x + 16, quote_y + quote_h - 25, fonts["BodyBold"], 6.4, 1.6, COPPER_LIGHT)
    draw_wrapped(c, '"THE JOURNEY IS AS IMPACTFUL AS THE DESTINATION."', side_x + 16, quote_y + 88, side_w - 32, fonts["Editorial"], 10.1, 14.2, PAPER)
    draw_wrapped(c, "Narrative first - in the booth, on stage, and in the studio.", side_x + 16, quote_y + 38, side_w - 32, fonts["Body"], 8.2, 11.6, MUTED)
    draw_footer(c, 2, fonts)


def draw_identity(c, assets, fonts):
    vertical_gradient(c, 0, 0, PAGE_W, PAGE_H, INK, NAVY_2)
    draw_signal_grid(c, 0, 0, PAGE_W, PAGE_H, BLUE_LIGHT, 0.025, 34)
    draw_wave_field(c, 0, 92, PAGE_W, 620, BLUE_LIGHT, 0.045, 12, 27, 1.45)
    draw_glow(c, PAGE_W - 45, PAGE_H - 120, 220, BLUE, 0.07)
    draw_orbit_lines(c, PAGE_W + 48, 168, BLUE_LIGHT, 0.04)
    draw_page_label(c, 3, "SOUND IDENTITY", fonts)
    draw_heading(c, "03 / CREATIVE DIRECTION", "Built for movement. Designed with depth.", MARGIN, PAGE_H - 90, 470, fonts, size=28)

    band_x, band_y = MARGIN, 438
    band_w, band_h = PAGE_W - 2 * MARGIN, 148
    c.setFillColor(PAPER)
    c.setStrokeColor(BLUE_LIGHT)
    set_alpha(c, fill=0.045, stroke=0.22)
    c.roundRect(band_x, band_y, band_w, band_h, 5, fill=1, stroke=1)
    reset_alpha(c)
    draw_wave_field(c, band_x + 1, band_y + 1, band_w - 2, band_h - 2, BLUE_LIGHT, 0.12, 7, 16, 1.55)
    draw_tracking(c, "HIGH-FIDELITY ELECTRONIC MUSIC", band_x + 18, band_y + band_h - 29, fonts["BodyBold"], 7, 2.1, BLUE_LIGHT)
    draw_text(c, "GENRE-FLUID", band_x + 18, band_y + 64, fonts["DisplayBold"], 29, PAPER)
    draw_wrapped(c, "Driving grooves / psychedelic energy / instrumental texture / atmospheric storytelling", band_x + 300, band_y + 78, band_w - 320, fonts["Body"], 9, 14, SILVER)

    gap = 12
    card_y = 197
    card_h = 204
    card_w = (PAGE_W - 2 * MARGIN - 2 * gap) / 3
    for idx, (num, title, body) in enumerate(PILLARS):
        x = MARGIN + idx * (card_w + gap)
        c.setFillColor(PAPER)
        c.setStrokeColor(COPPER_LIGHT if idx == 1 else BLUE_LIGHT)
        set_alpha(c, fill=0.048, stroke=0.20)
        c.roundRect(x, card_y, card_w, card_h, 5, fill=1, stroke=1)
        reset_alpha(c)
        draw_text(c, num, x + 16, card_y + card_h - 27, fonts["BodyBold"], 8, BLUE_LIGHT)
        draw_rule(c, x + 39, card_y + card_h - 24, card_w - 55, BLUE_LIGHT, 0.35, 0.65)
        draw_text(c, title.upper(), x + 16, card_y + card_h - 66, fonts["DisplayBold"], 16.5, PAPER)
        draw_wrapped(c, body, x + 16, card_y + card_h - 101, card_w - 32, fonts["Body"], 9.2, 14, SILVER)

    draw_tracking(c, "INFLUENCES", MARGIN, 164, fonts["BodyBold"], 7.2, 2.2, BLUE_LIGHT)
    influences = "Electronic legacy  /  Body music  /  Psychedelic energy  /  Live instrumentation  /  High-fidelity production"
    draw_wrapped(c, influences, MARGIN, 138, PAGE_W - 2 * MARGIN, fonts["BodyBold"], 8.1, 12, SILVER)
    draw_footer(c, 3, fonts)


def draw_formats(c, assets, fonts):
    vertical_gradient(c, 0, 0, PAGE_W, PAGE_H, INK, NAVY_2)
    draw_signal_grid(c, 350, 0, PAGE_W - 350, PAGE_H, BLUE_LIGHT, 0.035, 30)
    draw_wave_field(c, 318, 30, PAGE_W - 318, PAGE_H - 60, BLUE_LIGHT, 0.07, 14, 27, 1.25)
    draw_orbit_lines(c, PAGE_W + 48, PAGE_H - 170, BLUE_LIGHT, 0.045)
    draw_glow(c, PAGE_W - 25, 250, 210, BLUE_DARK, 0.055)
    draw_page_label(c, 4, "PERFORMANCE FORMATS", fonts)
    y = draw_heading(c, "04 / LIVE + STUDIO", "Four disciplines. One coherent artist identity.", MARGIN, PAGE_H - 88, 300, fonts, size=31)

    card_w = 245
    card_h = 122
    positions = [(MARGIN, 410), (310, 410), (MARGIN, 268), (310, 268)]
    for idx, ((title, body), (x, bottom)) in enumerate(zip(CORE_FORMATS, positions)):
        c.setFillColor(PAPER)
        c.setStrokeColor(BLUE_LIGHT if idx != 2 else COPPER_LIGHT)
        set_alpha(c, fill=0.055, stroke=0.22)
        c.roundRect(x, bottom, card_w, card_h, 5, fill=1, stroke=1)
        reset_alpha(c)
        draw_text(c, f"0{idx + 1}", x + 16, bottom + card_h - 25, fonts["BodyBold"], 8, BLUE_LIGHT)
        draw_text(c, title, x + 16, bottom + card_h - 51, fonts["DisplayBold"], 14.5, PAPER)
        draw_wrapped(c, body, x + 16, bottom + card_h - 76, card_w - 32, fonts["Body"], 8.7, 12.4, SILVER)

    draw_tracking(c, "BUILT FOR", MARGIN, 221, fonts["BodyBold"], 7.2, 2.4, BLUE_LIGHT)
    x, y = MARGIN, 187
    for index, label in enumerate(EVENT_CONTEXTS):
        w = measure(label.upper(), fonts["BodyBold"], 7.3) + 26
        if x + w > PAGE_W - MARGIN:
            x = MARGIN
            y -= 34
        c.setFillColor(PAPER)
        c.setStrokeColor(SILVER)
        set_alpha(c, fill=0.06, stroke=0.24)
        c.roundRect(x, y - 8, w, 24, 12, fill=1, stroke=1)
        reset_alpha(c)
        draw_text(c, label.upper(), x + 13, y, fonts["BodyBold"], 7.3, PAPER)
        x += w + 8
    draw_footer(c, 4, fonts)


def draw_services(c, assets, fonts):
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    draw_glow(c, 70, 180, 220, BLUE, 0.09)
    draw_glow(c, PAGE_W - 80, PAGE_H - 120, 160, COPPER, 0.045)
    draw_page_label(c, 5, "SERVICES + BOOKING", fonts)
    draw_heading(c, "05 / COLLABORATION", "From a room-moving set to a release-ready master.", MARGIN, PAGE_H - 88, 460, fonts, size=31)

    start_y = 560
    row_h = 104
    col_gap = 18
    col_w = (PAGE_W - 2 * MARGIN - col_gap) / 2
    for idx, (num, title, body) in enumerate(SERVICES):
        col = idx % 2
        row = idx // 2
        x = MARGIN + col * (col_w + col_gap)
        y = start_y - row * row_h
        draw_text(c, num, x, y, fonts["BodyBold"], 8, BLUE_LIGHT)
        draw_rule(c, x + 24, y + 3, col_w - 24, BLUE_LIGHT, 0.25, 0.5)
        draw_text(c, title.upper(), x, y - 27, fonts["DisplayBold"], 15, PAPER)
        draw_wrapped(c, body, x, y - 50, col_w, fonts["Body"], 8.9, 13, SILVER)

    c.setFillColor(PAPER)
    c.setStrokeColor(COPPER_LIGHT)
    set_alpha(c, fill=0.055, stroke=0.28)
    c.roundRect(MARGIN, 77, PAGE_W - 2 * MARGIN, 94, 5, fill=1, stroke=1)
    reset_alpha(c)
    draw_tracking(c, "BOOKING NOTES", MARGIN + 18, 145, fonts["BodyBold"], 7.2, 2.2, COPPER_LIGHT)
    draw_wrapped(c, "Set duration, equipment, playback, and stage requirements are confirmed per booking. A technical rider and production advance can be shared once the performance format is locked.", MARGIN + 18, 119, PAGE_W - 2 * MARGIN - 36, fonts["Body"], 8.8, 13.2, SILVER)
    draw_footer(c, 5, fonts)


def draw_qr(c, url, x, y, size):
    c.setFillColor(PAPER)
    c.roundRect(x, y, size, size, 6, fill=1, stroke=0)
    qr = QrCodeWidget(url)
    qr.barWidth = size - 20
    qr.barHeight = size - 20
    qr.barFillColor = INK
    drawing = Drawing(size - 20, size - 20)
    drawing.add(qr)
    renderPDF.draw(drawing, c, x + 10, y + 10)


def draw_contact_row(c, label, value, x, y, width, fonts, link=None):
    draw_tracking(c, label, x, y, fonts["BodyBold"], 6.8, 2.0, BLUE_LIGHT)
    draw_text(c, value, x, y - 27, fonts["BodyBold"], 13, PAPER)
    draw_rule(c, x, y - 45, width, PAPER, 0.15, 0.5)
    if link:
        c.linkURL(link, (x, y - 39, x + width, y + 8), relative=0, thickness=0)


def draw_contact(c, assets, fonts):
    vertical_gradient(c, 0, 0, PAGE_W, PAGE_H, INK, NAVY_2)
    draw_signal_grid(c, 0, 0, PAGE_W, PAGE_H, BLUE_LIGHT, 0.025, 34)
    draw_wave_field(c, 0, 220, PAGE_W, 520, BLUE_LIGHT, 0.05, 12, 30, 1.35)
    draw_orbit_lines(c, PAGE_W + 32, PAGE_H - 100, BLUE_LIGHT, 0.055)
    draw_glow(c, 88, PAGE_H - 130, 210, COPPER, 0.035)
    draw_glow(c, PAGE_W - 70, 235, 190, BLUE, 0.06)
    draw_page_label(c, 6, "CONTACT + BOOKING", fonts)

    y = draw_heading(c, "06 / AVAILABLE WORLDWIDE", "Create the next room, record, or moment together.", MARGIN, PAGE_H - 88, 470, fonts, size=34)
    draw_wrapped(c, "Open for DJ bookings, live performances, production projects, remixes, and creative collaborations.", MARGIN, y + 3, 430, fonts["Body"], 11, 16, SILVER)

    left_x = MARGIN
    row_w = 305
    draw_contact_row(c, "EMAIL / COLLABS", EMAIL, left_x, 500, row_w, fonts, f"mailto:{EMAIL}")
    draw_contact_row(c, "INSTAGRAM", INSTAGRAM, left_x, 421, row_w, fonts, INSTAGRAM_URL)
    draw_contact_row(c, "PHONE", PHONE, left_x, 342, row_w, fonts, "tel:+917009820546")
    draw_contact_row(c, "WHATSAPP", PHONE, left_x, 263, row_w, fonts, WHATSAPP_URL)
    draw_contact_row(c, "BASE", LOCATION, left_x, 184, row_w, fonts)

    qr_x, qr_y, qr_size = PAGE_W - MARGIN - 138, 245, 138
    draw_qr(c, INSTAGRAM_URL, qr_x, qr_y, qr_size)
    draw_tracking(c, "SCAN FOR INSTAGRAM", qr_x + 2, qr_y - 24, fonts["BodyBold"], 6.4, 1.5, PAPER)
    draw_text(c, "Secondary: " + PHONE_ALT, PAGE_W - MARGIN, 164, fonts["Body"], 8.4, SILVER, "right")

    c.setFillColor(PAPER)
    c.setStrokeColor(BLUE_LIGHT)
    set_alpha(c, fill=0.075, stroke=0.30)
    c.roundRect(PAGE_W - MARGIN - 165, 87, 165, 58, 5, fill=1, stroke=1)
    reset_alpha(c)
    draw_tracking(c, "ACHYUT WADHWA", PAGE_W - MARGIN - 148, 122, fonts["BodyBold"], 6.8, 1.8, BLUE_LIGHT)
    draw_text(c, "Press Kit / 2026", PAGE_W - MARGIN - 148, 101, fonts["Body"], 9, PAPER)
    draw_footer(c, 6, fonts)


def build_pdf(output, assets, fonts):
    output.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output), pagesize=A4, pageCompression=1)
    c.setTitle("Achyut Wadhwa - Official Press Kit")
    c.setAuthor(ARTIST)
    c.setSubject("Artist biography, creative direction, performance formats, services, and booking contact")
    c.setKeywords("Achyut Wadhwa, DJ, music producer, performer, multi-instrumentalist, press kit")

    draw_cover(c, assets, fonts)
    c.showPage()
    draw_profile(c, assets, fonts)
    c.showPage()
    draw_identity(c, assets, fonts)
    c.showPage()
    draw_formats(c, assets, fonts)
    c.showPage()
    draw_services(c, assets, fonts)
    c.showPage()
    draw_contact(c, assets, fonts)
    c.save()


def main():
    args = parse_args()
    frontend = args.frontend.resolve() if args.frontend else Path(__file__).resolve().parents[1]

    output = args.output.resolve() if args.output else frontend / "public" / "press-kit.pdf"
    work_dir = Path(tempfile.gettempdir()) / "achyut-wadhwa-press-kit-v3"
    assets = make_assets(frontend, work_dir)
    fonts = register_fonts()
    build_pdf(output, assets, fonts)

    if args.output is None:
        archive = frontend.parent / "output" / "pdf" / "achyut-wadhwa-press-kit.pdf"
        archive.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(output, archive)
        print(archive)
    print(output)


if __name__ == "__main__":
    main()
