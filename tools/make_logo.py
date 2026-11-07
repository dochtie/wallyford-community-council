"""Draws the site logo: the pithead carved on the Wallyford Miners' Stone.

The coordinates below are a trace of the carving (from a 1500 x 2000 px photo),
scaled into the 48 x 48 logo. Run it to rebuild both versions:

    python3 tools/make_logo.py out

then copy out/logo.svg to _includes/logo.svg and out/favicon.svg to
assets/img/favicon.svg. The PNG icons (favicon-48.png, apple-touch-icon.png,
logo-512.png) are favicon.svg saved at 48, 180 and 512 px with a transparent
background.
"""
import math, sys, pathlib

WHEEL_C = (715, 730)          # wheel centre
RIM_R = 262                   # middle of the rim band (outer 290, inner 235)
SPOKE_R = 235                 # spokes run from the hub to the inner edge of the rim
ROPE = [(945, 550), (1238, 822)]                     # rope leaving the top right of the wheel
LEFT_LEG = [(562, 976), (458, 1150), (462, 1497)]    # leaves wheel, angles out, drops straight
RIGHT_LEG = [(913, 942), (1072, 1098), (1078, 1497)]
CROSSBAR_Y = 1165
GROUND_Y = 1497
GROUND_X = (380, 1180)
TOP_Y = 440                   # top of the wheel

def build(scale, top, cx_svg=24, cx_photo=790, w=None, dec=2):
    X = lambda x: round(cx_svg + (x - cx_photo) * scale, dec)
    Y = lambda y: round(top + (y - TOP_Y) * scale, dec)
    P = lambda p: f"{X(p[0])} {Y(p[1])}"
    cx, cy = X(WHEEL_C[0]), Y(WHEEL_C[1])
    r_rim, r_sp = round(RIM_R * scale, dec), round(SPOKE_R * scale, dec)
    spokes = []
    for k in range(4):                     # 4 lines through the hub = 8 spokes
        a = math.radians(k * 45)
        dx, dy = r_sp * math.cos(a), r_sp * math.sin(a)
        spokes.append(f"M{round(cx-dx,dec)} {round(cy-dy,dec)} {round(cx+dx,dec)} {round(cy+dy,dec)}")
    lx, rx = LEFT_LEG[2][0], RIGHT_LEG[2][0]
    frame = (f"M{P(LEFT_LEG[0])} {P(LEFT_LEG[1])} {P(LEFT_LEG[2])}"
             f"M{P(RIGHT_LEG[0])} {P(RIGHT_LEG[1])} {P(RIGHT_LEG[2])}"
             f"M{X(LEFT_LEG[1][0] + 4)} {Y(CROSSBAR_Y)}H{X(RIGHT_LEG[1][0] + 6)}")
    brace = (f"M{X(lx + 4)} {Y(CROSSBAR_Y)} {X(rx - 4)} {Y(GROUND_Y)}"
             f"M{X(rx - 2)} {Y(CROSSBAR_Y)} {X(lx + 2)} {Y(GROUND_Y)}")
    ground = f"M{X(GROUND_X[0])} {Y(GROUND_Y)}H{X(GROUND_X[1])}"
    rope = f"M{P(ROPE[0])} {P(ROPE[1])}"
    return dict(cx=cx, cy=cy, r=r_rim, spokes="".join(spokes), frame=frame, brace=brace, ground=ground, rope=rope)

# Header logo: thin lines inside the round badge, coloured by the page (currentColor).
h = build(scale=28.5 / 1057, top=7.6)
header = f'''<svg class="logo" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">
  <circle cx="24" cy="24" r="22.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="{h['cx']}" cy="{h['cy']}" r="{h['r']}" stroke-width="1.5"/>
    <path d="{h['spokes']}" stroke-width=".9"/>
    <path d="{h['rope']}" stroke-width="1.1"/>
    <path d="{h['frame']}{h['ground']}" stroke-width="1.5"/>
    <path d="{h['brace']}" stroke-width="1.1"/>
  </g>
</svg>
'''
# Icon (browser tab, phone home screen, Google): bolder lines on the dark rounded square.
i = build(scale=31 / 1057, top=7)
icon = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="10" fill="#1b1e21"/>
  <g fill="none" stroke="#e0b768" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="{i['cx']}" cy="{i['cy']}" r="{i['r']}" stroke-width="2.4"/>
    <path d="{i['spokes']}" stroke-width="1.3"/>
    <path d="{i['rope']}" stroke-width="1.7"/>
    <path d="{i['frame']}{i['ground']}" stroke-width="2.4"/>
    <path d="{i['brace']}" stroke-width="1.7"/>
  </g>
</svg>
'''
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
(out / "logo.svg").write_text(header); (out / "favicon.svg").write_text(icon)
print(header); print(icon)
