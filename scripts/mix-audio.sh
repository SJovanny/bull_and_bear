#!/usr/bin/env bash
# Mixe la voix off (piste unique issue de place-voice.sh) et la musique de fond : la musique baisse sous la voix (sidechain),
# niveau final −14 LUFS, fondu de sortie. Usage : scripts/mix-audio.sh voix.wav musique.wav sortie.wav DUREE_SECONDES
# Sans voix (« - ») : musique seule, fondu de sortie.
set -euo pipefail
[ "$#" -eq 4 ] || { echo "usage: $0 voix.wav|- musique.wav sortie.wav duree_s" >&2; exit 1; }
V="$1"; M="$2"; OUT="$3"; D="$4"
FADE_ST=$(awk -v d="$D" 'BEGIN{printf "%.2f", d-0.9}')
if [ "$V" = "-" ]; then
  ffmpeg -v error -y -i "$M" -t "$D" -af "volume=0.8,afade=t=out:st=${FADE_ST}:d=0.9,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 "$OUT"
else
  ffmpeg -v error -y -i "$V" -i "$M" -t "$D" -filter_complex \
    "[0:a]aformat=channel_layouts=stereo,asplit=2[vo][sc];[1:a]volume=0.55[mu];[mu][sc]sidechaincompress=threshold=0.02:ratio=9:attack=8:release=320[md];[vo][md]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=${D},afade=t=out:st=${FADE_ST}:d=0.9,loudnorm=I=-14:TP=-1.5:LRA=11[o]" \
    -map "[o]" -ar 48000 "$OUT"
fi
echo "$OUT"
