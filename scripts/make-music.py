#!/usr/bin/env python3
"""Génère la musique de fond de la pub (synthèse pure, libre de droits) : style « pub corporate / tech », 120 BPM.
Calée sur les coupes du montage FR (0 · 2 · 8,2 · 12,3 · 15,3 · 17,5 · 21,8 · 24,95 s) : montée d'énergie par sections, whooshes aux transitions,
gros impact sur le logo (≈ 24,95 s) puis résolution. Usage : python3 scripts/make-music.py out/musique-fond.wav [durée_s]"""
import sys, wave
import numpy as np

SR = 44100
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 30.37
LOGO = 25.14  # début du chapitre logo : impact
BEAT = 0.5  # 120 BPM
N = int(SR * DUR)
rng = np.random.default_rng(11)
dry = np.zeros((N, 2))   # son direct
wet = np.zeros((N, 2))   # envoi réverbération
duck = np.ones(N)        # pompage sous le kick (sidechain « de style »)


def tt(d):
    return np.arange(int(SR * d)) / SR


def place(bus, start, sig, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    bus[i : i + len(sig), 0] += sig * gain * (1 - max(0.0, pan))
    bus[i : i + len(sig), 1] += sig * gain * (1 + min(0.0, pan))


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def adsr(d, a=0.005, r=0.1, curve=3.0):
    t = tt(d)
    env = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t * curve)
    rel = np.minimum(1, (d - t) / max(r, 1e-4))
    return env * rel


def pluck(f, d=0.5, bright=1.0):
    t = tt(d)
    x = np.zeros_like(t)
    for k in range(1, 8):
        x += np.sin(2 * np.pi * f * k * t) / (k ** 1.35) * np.exp(-t * (3.0 + k * 3.5 / bright))
    return x * np.minimum(1, t / 0.003) * 0.9


def bell(f, d=0.7):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.0 * t) + 0.25 * np.sin(2 * np.pi * f * 3.01 * t) + 0.15 * np.sin(2 * np.pi * f * 4.2 * t)
    return x * np.exp(-t * 6.5) * np.minimum(1, t / 0.002) * 0.5


def pad(freqs, d, bright=1.0):
    t = tt(d)
    x = np.zeros_like(t)
    for f in freqs:
        for det in (0.997, 1.0, 1.004):
            for k, amp in ((1, 1.0), (2, 0.45 * bright), (3, 0.22 * bright), (4, 0.1 * bright)):
                x += amp * np.sin(2 * np.pi * f * det * k * t + rng.uniform(0, 6.28))
    env = np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.4)
    return x * env * 0.05


def bass(f, d):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2 * t) + 0.12 * np.sin(2 * np.pi * f * 3 * t)
    return np.tanh(x * 1.4) * np.minimum(1, t / 0.004) * np.exp(-t * 2.4) * np.minimum(1, (d - t) / 0.03) * 0.5


def kick():
    t = tt(0.35)
    f = 48 + 120 * np.exp(-t * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 8.5) + 0.25 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 400)) * 0.95


def clap():
    t = tt(0.3)
    n = rng.normal(0, 1, len(t))
    n = np.diff(n, prepend=0)  # passe-haut grossier
    env = np.zeros_like(t)
    for off in (0.0, 0.011, 0.022):
        env += np.exp(-np.maximum(t - off, 0) * 60) * (t >= off)
    env *= np.exp(-t * 14)
    return n * env * 0.22


def hat(open_=False):
    t = tt(0.22 if open_ else 0.06)
    n = np.diff(rng.normal(0, 1, len(t)), n=2, prepend=[0, 0])
    return n * np.exp(-t * (16 if open_ else 80)) * 0.09


def whoosh(d, up=True):
    t = tt(d)
    n = rng.normal(0, 1, len(t))
    n = np.diff(n, prepend=0)
    e = (t / d) ** 2.2 if up else (1 - t / d) ** 2.2
    s = np.sin(2 * np.pi * (300 + 2400 * (t / d) ** 2) * t) * 0.12
    return (n * 0.25 + s) * e * np.minimum(1, (d - t) / 0.02)


def impact():
    t = tt(2.2)
    f = 90 * np.exp(-t * 2.2) + 30
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.0) * 0.9
    n = np.diff(rng.normal(0, 1, len(t)), prepend=0) * np.exp(-t * 4.5) * 0.30
    return boom + n


def add_duck(start, depth=0.5, rel=0.2):
    i = int(start * SR)
    seg = min(int(rel * SR), N - i)
    if seg > 0:
        duck[i : i + seg] = np.minimum(duck[i : i + seg], depth + (1 - depth) * np.linspace(0, 1, seg) ** 1.7)


# ── structure : sections alignées sur les coupes ─────────────────────────────────────────────────────────────────────────
# 0–2 s intro tendue · 2–8,2 s « pas de journal » (sobre, sombre) · 8,2–15,3 s cTrader/MetaTrader/revue (ça monte) · 15,3–21,8 s plein
# régime · 21,8–24,95 s installation (chaleureux) · 24,95 s impact + résolution (logo)
SECTIONS = [(0.0, 2.0, "intro"), (2.0, 8.2, "calm"), (8.2, 15.3, "lift"), (15.3, 21.8, "full"), (21.8, LOGO, "lift"), (LOGO, DUR + 1, "end")]
# progression : la mineur (tension) puis do majeur (lumière) — un accord par mesure de 2 s
PROG_MINOR = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [64, 67, 72]), (55, [62, 67, 71])]    # Am F C G
PROG_MAJOR = [(48, [64, 67, 72]), (55, [62, 67, 71]), (57, [64, 69, 72]), (53, [65, 69, 72])]    # C G Am F


def section_at(t):
    for a, b, name in SECTIONS:
        if a <= t < b:
            return name
    return "end"


K, CL, HC, HO = kick(), clap(), hat(), hat(True)
bar_len = 4 * BEAT
nbars = int(np.ceil(DUR / bar_len))
for bar in range(nbars):
    t0 = bar * bar_len
    sec_ = section_at(t0)
    prog = PROG_MINOR if sec_ in ("intro", "calm") else PROG_MAJOR
    root, tri = prog[bar % 4]
    # nappe (toujours), plus claire quand ça monte
    bright = {"intro": 0.5, "calm": 0.6, "lift": 0.9, "full": 1.2, "end": 1.0}[sec_]
    place(dry, t0, pad([midi(n) for n in tri], bar_len + 0.3, bright), 1.0, -0.15)
    place(wet, t0, pad([midi(n) for n in tri], bar_len + 0.3, bright), 0.6, 0.15)
    for beat in range(4):
        tb = t0 + beat * BEAT
        if tb >= DUR:
            break
        kick_on = sec_ in ("calm", "lift", "full") or (sec_ == "end" and bar == int(LOGO / bar_len) and beat == 0)
        if sec_ == "intro" and beat in (0, 2) and bar == 0:
            kick_on = beat == 0 and False
        if kick_on:
            place(dry, tb, K, 0.9 if sec_ != "calm" else 0.7)
            add_duck(tb, 0.62 if sec_ == "calm" else 0.5)
        if beat in (1, 3) and sec_ in ("lift", "full"):
            place(dry, tb, CL, 0.9, 0.1)
            place(wet, tb, CL, 0.7, -0.1)
        # hats : croches en calme, doubles croches quand ça monte
        steps = 4 if sec_ in ("lift", "full") else 2
        for s in range(steps):
            ts = tb + s * BEAT / steps
            if sec_ == "intro" and ts < 1.0:
                continue
            g = (0.9 if s == 0 else 0.55) * (0.8 if sec_ == "calm" else 1.0)
            place(dry, ts, HC, g, 0.3 if s % 2 else -0.3)
        if beat == 3 and sec_ in ("lift", "full"):
            place(dry, tb + BEAT / 2, HO, 0.8, 0.25)
        # basse : une note par temps (calme) ou croches (plein)
        if sec_ in ("calm", "lift", "full"):
            for s in range(2 if sec_ in ("lift", "full") else 1):
                ts = tb + s * BEAT / 2
                f = midi(root - 12) * (2 if (s == 1 and sec_ == "full") else 1)
                place(dry, ts, bass(f, BEAT / (2 if sec_ in ("lift", "full") else 1) * 0.92), 0.75)
        # piano / pluck : accord brisé (calme : 1 note par temps) ; arpège de cloches en doubles croches (plein)
        if sec_ in ("intro", "calm"):
            note = tri[[0, 2, 1, 2][beat]]
            place(dry, tb, pluck(midi(note), 0.9, 0.7), 0.5 if sec_ == "calm" else 0.35, -0.2)
            place(wet, tb, pluck(midi(note), 0.9, 0.7), 0.5, 0.2)
        if sec_ in ("lift", "full"):
            seq = [0, 1, 2, 1] if sec_ == "lift" else [0, 2, 1, 2]
            for s in range(2):
                note = tri[seq[(beat * 2 + s) % 4]] + (12 if sec_ == "full" else 0)
                ts = tb + s * BEAT / 2
                place(dry, ts, pluck(midi(note), 0.5, 1.0), 0.42, 0.3 if s else -0.3)
                place(wet, ts, bell(midi(note + 12), 0.7), 0.45, -0.2)
    # accord plaqué au début des mesures « plein régime » (stab)
    if sec_ == "full":
        for n in tri:
            place(dry, t0, pluck(midi(n), 0.7, 1.4), 0.3, 0.0)

# whooshes : montée juste avant chaque coupe, descente juste après
for cut in (2.0, 8.2, 12.3, 15.3, 17.5, 21.8, LOGO):
    place(dry, cut - 0.55, whoosh(0.55, True), 0.9)
    place(wet, cut - 0.55, whoosh(0.55, True), 0.5)
# riser d'intro
place(dry, 0.0, whoosh(2.0, True), 0.9)
# impact sur le logo + accord final lumineux et long
place(dry, LOGO, impact(), 1.0)
place(wet, LOGO, impact(), 0.5)
add_duck(LOGO, 0.35, 0.45)
final = [midi(n) for n in (48, 55, 60, 64, 67, 72)]
place(dry, LOGO, pad(final, DUR - LOGO + 0.2, 1.2), 1.3)
place(wet, LOGO, pad(final, DUR - LOGO + 0.2, 1.2), 1.0)
for i, n in enumerate((72, 76, 79, 84)):
    place(dry, LOGO + 0.4 + i * 0.16, bell(midi(n), 1.0), 0.55, (-0.4, -0.15, 0.15, 0.4)[i])
    place(wet, LOGO + 0.4 + i * 0.16, bell(midi(n), 1.0), 0.6, (0.4, 0.15, -0.15, -0.4)[i])


# réverbération : réponse impulsionnelle bruitée (1,7 s), convolution FFT
def reverb(x):
    L = int(SR * 1.7)
    t = np.arange(L) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.normal(0, 1, L) * np.exp(-t * 3.2) * (1 - np.exp(-t * 90))
        ir = ir - 0.6 * np.concatenate([[0], ir[:-1]])  # un peu moins de graves
        n = 1 << int(np.ceil(np.log2(len(x) + L)))
        y = np.fft.irfft(np.fft.rfft(x[:, ch], n) * np.fft.rfft(ir, n), n)[: len(x)]
        out[:, ch] = y / (np.max(np.abs(y)) + 1e-9)
    return out * 0.5


wet_out = reverb(wet)
bus = dry * duck[:, None] + wet_out * (0.55 + 0.45 * duck[:, None]) * 0.28
# courbe de dynamique : sobre sous « pas de journal », ça monte avec cTrader / MetaTrader, plein régime, puis le logo
ENV_T = [0, 1.9, 2.0, 8.1, 8.8, 15.2, 15.9, 21.7, 22.4, LOGO - 0.1, LOGO, DUR]
ENV_G = [0.55, 0.75, 0.55, 0.6, 0.85, 0.9, 1.0, 1.0, 0.9, 0.95, 1.25, 1.0]
bus *= np.interp(np.arange(N) / SR, ENV_T, ENV_G)[:, None]
bus = np.tanh(bus * 1.15)
# fondu d'entrée très court (évite le clic) et de sortie sur les 0,6 dernières secondes
fade = np.ones(N)
fi = int(0.02 * SR)
fo = int(0.6 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo)
bus *= fade[:, None]
bus /= np.max(np.abs(bus)) / 0.89
pcm = (bus * 32767).astype("<i2")
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{sys.argv[1]} — {N / SR:.1f} s")
