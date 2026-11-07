"""Draws the site logo: the pithead carved on the Wallyford Miners' Stone, set in a
square "carved panel" like the recessed panel it sits in on the stone.

The pithead is a tidied, symmetrical version of the carving: an eight-spoked winding
wheel, the rope running off its top right, legs that angle out from under the wheel
and then drop straight, a crossbar and an X brace.

    python3 tools/make_logo.py out

writes out/logo.svg (copy to _includes/logo.svg) and out/favicon.svg (copy to
assets/img/favicon.svg). The PNG icons (favicon-48.png, apple-touch-icon.png,
logo-512.png) are favicon.svg saved at 48, 180 and 512 px with a transparent
background.
"""
import math, pathlib, sys

def pithead(cx, top, scale, w_frame, w_spoke, w_brace, w_rope):
    X = lambda x: round(cx + x * scale, 2)          # x relative to the centre line
    Y = lambda y: round(top + y * scale, 2)          # y down from the top of the wheel
    R, Rs = 6.6, 5.75                                # wheel rim radius, spoke length
    spokes = []
    for k in range(4):                               # 4 lines through the hub = 8 spokes
        a = math.radians(k * 45); dx, dy = Rs * math.cos(a), Rs * math.sin(a)
        spokes.append(f"M{X(-dx)} {Y(R - dy)} {X(dx)} {Y(R + dy)}")
    a1, a2 = math.radians(125), math.radians(55)     # where the legs leave the wheel
    lt = (R * math.cos(a1), R + R * math.sin(a1)); rt = (R * math.cos(a2), R + R * math.sin(a2))
    half, bend, base = 7.6, 16.6, 27.6               # frame half-width, crossbar height, base
    ra = math.radians(-45); r0 = (R * math.cos(ra), R + R * math.sin(ra))
    rope = f"M{X(r0[0])} {Y(r0[1])} {X(r0[0] + 6.2)} {Y(r0[1] + 6.2)}"
    frame = (f"M{X(lt[0])} {Y(lt[1])} {X(-half)} {Y(bend)} {X(-half)} {Y(base)}"
             f"M{X(rt[0])} {Y(rt[1])} {X(half)} {Y(bend)} {X(half)} {Y(base)}"
             f"M{X(-half)} {Y(bend)}H{X(half)}M{X(-half - 2.4)} {Y(base)}H{X(half + 2.4)}")
    brace = f"M{X(-half)} {Y(bend)} {X(half)} {Y(base)}M{X(half)} {Y(bend)} {X(-half)} {Y(base)}"
    return (f'<circle cx="{X(0)}" cy="{Y(R)}" r="{round(R * scale, 2)}" stroke-width="{w_frame}"/>'
            f'<path d="{"".join(spokes)}" stroke-width="{w_spoke}"/>'
            f'<path d="{rope}" stroke-width="{w_rope}"/>'
            f'<path d="{frame}" stroke-width="{w_frame}"/>'
            f'<path d="{brace}" stroke-width="{w_brace}"/>')

def panel(colour, k=1.0):
    """Outer frame, recessed inner border and pithead. k thickens every line (for icons)."""
    w = lambda v: round(v * k, 2)
    return (f'<rect x="2.75" y="2.75" width="42.5" height="42.5" rx="5" fill="none" stroke="{colour}" stroke-width="{w(1.5)}"/>'
            f'<rect x="6.5" y="6.5" width="35" height="35" rx="1.5" fill="none" stroke="{colour}" stroke-width="{w(.8)}" opacity=".55"/>'
            f'<g fill="none" stroke="{colour}" stroke-linecap="round" stroke-linejoin="round">'
            + pithead(cx=23.4, top=9.6, scale=.98, w_frame=w(1.5), w_spoke=w(.9), w_brace=w(1.1), w_rope=w(1.2)) + '</g>')

# Header: coloured by the page (currentColor), hidden from screen readers (the name is next to it).
header = ('<svg class="logo" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">\n  '
          + panel("currentColor") + '\n</svg>\n')
# Icon (browser tab, phone home screen, search engines): bolder brass lines on the dark rounded square.
# The panel is shrunk to 86% so a dark margin shows round it, and the lines are thickened to match.
icon = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">\n  <rect width="48" height="48" rx="10" fill="#1b1e21"/>\n  '
        '<g transform="translate(3.36 3.36) scale(.86)">' + panel("#e0b768", k=1.6) + '</g>\n</svg>\n')
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
(out / "logo.svg").write_text(header); (out / "favicon.svg").write_text(icon)
print("wrote", out / "logo.svg", "and", out / "favicon.svg")
