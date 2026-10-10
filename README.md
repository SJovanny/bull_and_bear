# Bull & Bear — pub motion design (16:9, ≈ 54 s, versions FR et EN)

Film promotionnel de l'app **Bull & Bear** (journal de trading), généré **en code** avec [Remotion](https://www.remotion.dev) (React + TypeScript).
1920×1080, 30 images/s, 10 chapitres, **deux versions** : `Ad` (français, principale) et `AdEn` (anglais), même code, textes et durées par langue. Le dépôt de l'app (`../bull_and_bear`) n'est jamais modifié : on y lit les textes et on y copie des captures.

Message : *tenir un journal de trades, sans effort, aide à devenir plus discipliné et plus rentable.*
Plan phare : le téléphone, le zoom dans l'écran, la connexion automatique de cTrader, la courbe qui monte et le PnL qui grimpe.

## Où on en est (10 octobre 2026)

Version **française** terminée : 9 lignes de voix (ElevenLabs v4, tutoiement), ≈ 30,4 s, deux formats — `Ad` (16:9, 1920×1080) et `AdVertical` (9:16, 1080×1920, réseaux sociaux).
Accroche : « T'as encore cramé un compte, pas vrai ? ». Scènes : accroche → pas de journal / Notion → téléphone (cTrader) → MetaTrader → revue sur le vrai graphique TradingView
(`lightweight-charts`) → fiche de trade du journal → installation de l'appli depuis le site (PWA) → logo « Le journal de trading fait pour toi ».

| Étape | État |
| --- | --- |
| Script FR (tutoiement, tags Eleven v4) | **Fait** : `VOIX-OFF.v5.txt` |
| Voix FR | **Faites** : `public/voix/01..09.wav` (silences rognés ; bruts dans `public/voix-brut/`) ; `public/voix-longue/` = ancienne version de 54 s, non utilisée |
| Calage | **Fait** : `src/timings.ts` (voix jouées à 1,08×) ; `scripts/place-voice.sh` |
| Musique | **Faite** (synthèse, libre de droits) : `scripts/make-music.py`, calée sur les coupes |
| Mix | `scripts/mix-audio.sh` (musique sous la voix, −14 LUFS) |
| Version anglaise | **À faire** : voix EN, montage EN (chapitres et ancres d'origine), version verticale EN |
| Rendu 60 i/s | À faire (rendu actuel à 30 i/s) |

## Tout se modifie dans cinq fichiers

- `src/timings.ts` : durée de chaque chapitre (secondes), instants des animations dans le chapitre, lignes de voix et leur position — **par langue** (`TIMINGS.fr`, `TIMINGS.en`).
- `src/copy.ts` : tous les textes de la pub, en français et en anglais (les écrans du téléphone restent en anglais : c'est l'interface réelle de l'app).
- `src/data.ts` : les chiffres de **démonstration** (courbe, PnL, win rate, profit factor, drawdown).
- `src/tokens.ts` : couleurs et polices, reprises de `apps/web/src/app/globals.css` (thème sombre) et de `layout.tsx`.
- `src/ui/PhoneScreens.tsx` : libellés exacts des écrans du téléphone (repris de `broker-connect-modal.tsx`, `resync-button.tsx`, `comptes/page.tsx`).

Les chapitres sont dans `src/scenes/` : `Matter` (accroche), `Kinetic` (pas de journal), `PhoneScene` (cTrader), `TwoPaths` (MetaTrader), `ChartReview` (vrai graphique TradingView),
`Journal` (fiche de trade mock), `Install` (PWA), `LogoEnd`. Anciennes scènes de la version 54 s, toujours utilisées par l'anglais : `Layers3D`, `Cards`, `Route`, `Numbers`.
Le format (16:9 ou vertical) est lu par `src/stage.ts` ; l'assemblage est dans `src/Ad.tsx`.

## Commandes

```bash
npm run dev                                   # aperçu animé (Remotion Studio) : « Ad » (FR), « AdVertical » (FR 9:16), « AdEn » (EN)
python3 scripts/make-music.py out/musique-fond.wav 30.37        # musique de fond (durée en s)
ATEMPO=1.08 TOTAL_MS=30370 OFFSETS="150 2110 4530 8240 12350 15290 17530 21820 25190" \
  scripts/place-voice.sh public/voix/0{1..9}.wav out/voix-off-fr.wav      # pose les 9 lignes FR (OFFSETS = `at` de timings.ts, en ms)
scripts/mix-audio.sh out/voix-off-fr.wav out/musique-fond.wav out/audio-mix.wav 30.37   # voix + musique, −14 LUFS
npx remotion render src/index.ts Ad out/ad-16x9-muet.mp4 --codec=h264 --crf=16          # idem avec « AdVertical » pour le 9:16
ffmpeg -i out/ad-16x9-muet.mp4 -i out/audio-mix.wav -c:v copy -c:a aac -b:a 256k -t 30.37 out/ad-fr-16x9.mp4
node scripts/render-stills.mjs                # images clés (anciennes planches)
```

Remotion lance un navigateur sans interface : dans Claude Code, ces commandes doivent s'exécuter **hors du bac à sable** (une autorisation sera demandée).

## Contraintes

- Chiffres à l'écran = **données de démonstration**, mention légale en pied de page du chapitre 5 au 9 et sur l'écran final. Aucun gain promis.
- Les écrans du téléphone sont **reconstruits** (pas de captures) avec les libellés réels de l'app (en anglais, comme dans l'app).
- La page d'autorisation cTrader est volontairement générique : ni logo ni habillage de la marque cTrader.
- MetaTrader = import de fichier (pas « automatique ») : le film dit « en un clic ».
- Sous-titres : toujours dans la langue de la voix (jamais FR sous une voix EN). Slogan anglais = celui de la landing : « Trade. Review. Grow. ».
- Mouvements doux : jamais de flash ni de tremblement. Palette : bleu nuit de l'app, bleu `#3B82F6`, teal `#14B8A6`, vert `#10B981`, rouge `#EF4444`.

## Reprendre sur un autre poste

Ce projet vit sur la branche **`ads`** du dépôt de l'app (historique indépendant : ne jamais la fusionner dans `main`). Le cloner **à côté** du dépôt de l'app :

```bash
git clone -b ads --single-branch git@github.com:SJovanny/bull_and_bear.git bull_and_bear_pub
cd bull_and_bear_pub && npm install
```

- Les voix ne sont **pas** encore dans le dépôt : à régénérer dans ElevenLabs (lignes dans `VOIX-OFF.txt` / `VOIX-OFF.en.txt`), puis `public/voix/NN.mp3` et `public/voix-en/NN.mp3`. Attention aux doublons de téléchargement : vérifier que les 10 fichiers sont bien différents.
- Prérequis : Node 20+, ffmpeg. Le premier rendu télécharge le Chrome sans interface de Remotion.
- Suite : caler les animations sur les voix (`scripts/place-voice.sh`, `dur` dans `src/timings.ts`), ajouter la musique, rendre (60 i/s, −14 LUFS).
