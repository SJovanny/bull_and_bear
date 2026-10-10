#!/usr/bin/env bash
# Place les lignes de la voix off sur la frise de la pub (début de chaque ligne = VOICE[].at de src/timings.ts) et écrit une piste unique.
# Usage : scripts/place-voice.sh 01.mp3 02.mp3 ... NN.mp3 sortie.wav   (tout format lu par ffmpeg)
# Variables : OFFSETS="200 2630 ..." (ms, une par ligne, obligatoire sauf pour 10 lignes) ; TOTAL_MS (durée de la pub, défaut 54000) ;
#             ATEMPO (vitesse de lecture, défaut 1 ; ex. 1.12). Les durées affichées tiennent compte d'ATEMPO.
# Affiche aussi la durée de chaque ligne face à son créneau : c'est là qu'on voit quelle scène rallonger ou raccourcir.
set -euo pipefail
[ "$#" -ge 3 ] || { echo "usage: $0 l01 l02 ... lNN sortie.wav" >&2; exit 1; }
N=$(($#-1))
if [ "$N" -eq 10 ]; then DEF="300 5300 11300 20300 28300 33300 38300 43300 47300 50300"; else DEF=""; fi
read -r -a O <<< "${OFFSETS:-$DEF}"
[ "${#O[@]}" -eq "$N" ] || { echo "OFFSETS : $N valeurs attendues (ms)" >&2; exit 1; }
TOTAL_MS="${TOTAL_MS:-54000}"
T="${ATEMPO:-1}"
ARGS=(); FILT=""; MIX=""
for ((i=0; i<N; i++)); do
  F="${@:$((i+1)):1}"
  ARGS+=(-i "$F")
  FILT+="[$i:a]atempo=${T},aresample=48000,aformat=channel_layouts=mono,adelay=${O[$i]}|${O[$i]}[v$i];"
  MIX+="[v$i]"
  if [ "$i" -lt $((N-1)) ]; then NEXT="${O[$((i+1))]}"; else NEXT="$TOTAL_MS"; fi
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
  awk -v n="$((i+1))" -v d="$D" -v t="$T" -v s="${O[$i]}" -v e="$NEXT" 'BEGIN{d=d/t; slot=(e-s)/1000; printf "ligne %02d : %.2f s pour un créneau de %.2f s %s\n", n, d, slot, (d>slot? "  <-- DÉPASSE de " sprintf("%.2f", d-slot) " s" : "(ok)")}'
done
ffmpeg -v error -y "${ARGS[@]}" -filter_complex "${FILT}${MIX}amix=inputs=${N}:normalize=0:duration=longest[o]" -map "[o]" -ar 48000 -ac 1 "${@:$((N+1)):1}"
echo "${@:$((N+1)):1}"
