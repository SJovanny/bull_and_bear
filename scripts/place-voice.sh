#!/usr/bin/env bash
# Place les 10 lignes de la voix off sur la frise de la pub (début de chaque ligne = VOICE[].at de src/timings.ts) et écrit une piste unique.
# Usage : scripts/place-voice.sh 01.mp3 02.mp3 ... 10.mp3 sortie.wav   (tout format lu par ffmpeg)
# Variable optionnelle : OFFSETS="300 5300 11300 20300 28300 33300 38300 43300 47300 50300" (millisecondes)
# Affiche aussi la durée de chaque ligne face à son créneau : c'est là qu'on voit quelle scène rallonger ou raccourcir.
set -euo pipefail
[ "$#" -eq 11 ] || { echo "usage: $0 l01 l02 ... l10 sortie.wav" >&2; exit 1; }
read -r -a O <<< "${OFFSETS:-300 5300 11300 20300 28300 33300 38300 43300 47300 50300}"
TOTAL_MS=54000
ARGS=(); FILT=""; MIX=""
for i in 0 1 2 3 4 5 6 7 8 9; do
  F="${@:$((i+1)):1}"
  ARGS+=(-i "$F")
  FILT+="[$i:a]aresample=48000,aformat=channel_layouts=mono,adelay=${O[$i]}|${O[$i]}[v$i];"
  MIX+="[v$i]"
  if [ "$i" -lt 9 ]; then NEXT="${O[$((i+1))]}"; else NEXT="$TOTAL_MS"; fi
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
  awk -v n="$((i+1))" -v d="$D" -v s="${O[$i]}" -v e="$NEXT" 'BEGIN{slot=(e-s)/1000; printf "ligne %02d : %.1f s pour un créneau de %.1f s %s\n", n, d, slot, (d>slot? "  <-- DÉPASSE de " sprintf("%.1f", d-slot) " s" : "(ok)")}'
done
ffmpeg -v error -y "${ARGS[@]}" -filter_complex "${FILT}${MIX}amix=inputs=10:normalize=0:duration=longest[o]" -map "[o]" -ar 48000 -ac 1 "${@:11:1}"
echo "${@:11:1}"
