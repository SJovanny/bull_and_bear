# Bull & Bear — pub motion design (16:9, ≈ 54 s, versions FR et EN)

Film promotionnel de l'app **Bull & Bear** (journal de trading), généré **en code** avec [Remotion](https://www.remotion.dev) (React + TypeScript).
1920×1080, 30 images/s, 10 chapitres, **deux versions** : `Ad` (français, principale) et `AdEn` (anglais), même code, textes et durées par langue. Le dépôt de l'app (`../bull_and_bear`) n'est jamais modifié : on y lit les textes et on y copie des captures.

Message : *tenir un journal de trades, sans effort, aide à devenir plus discipliné et plus rentable.*
Plan phare : le téléphone, le zoom dans l'écran, la connexion automatique de cTrader, la courbe qui monte et le PnL qui grimpe.

## Où on en est (8 octobre 2026)

| Étape | État |
| --- | --- |
| 1. Script (10 lignes de voix) | **Validé** (FR) : `VOIX-OFF.txt` ; **version anglaise rédigée** : `VOIX-OFF.en.txt` |
| 2. Installation | **Faite** (Remotion 4.0.534, skills Remotion dans `.claude/skills/`) |
| 3. Scènes animées, muettes | **Faites** : 10 chapitres, images clés dans `docs/stills-fr/` et `docs/stills-en/` (JPEG), planches `docs/planche-stills.jpg` et `docs/planche-stills-en.jpg` (les PNG se régénèrent dans `out/`) |
| 4. Voix off | **À faire** : 10 fichiers ElevenLabs par langue, `public/voix/01.mp3` … `10.mp3` (FR) et `public/voix-en/01.mp3` … `10.mp3` (EN) |
| 5. Calage sur la voix | À faire, **langue par langue** : `scripts/place-voice.sh` signale les lignes qui dépassent leur créneau ; on renseigne `dur` dans `src/timings.ts` (sous-titres exacts) |
| 5 bis. Sous-titres | **Faits** (incrustés, dans la langue de la voix, durées estimées tant que la voix manque) ; désactivables : prop `subs` |
| 6. Musique | À faire : un mp3 libre de droits dans `assets/music/` |
| 7. Rendu final | À faire : 60 i/s, son à −14 LUFS |

## Tout se modifie dans cinq fichiers

- `src/timings.ts` : durée de chaque chapitre (secondes), instants des animations dans le chapitre, lignes de voix et leur position — **par langue** (`TIMINGS.fr`, `TIMINGS.en`).
- `src/copy.ts` : tous les textes de la pub, en français et en anglais (les écrans du téléphone restent en anglais : c'est l'interface réelle de l'app).
- `src/data.ts` : les chiffres de **démonstration** (courbe, PnL, win rate, profit factor, drawdown).
- `src/tokens.ts` : couleurs et polices, reprises de `apps/web/src/app/globals.css` (thème sombre) et de `layout.tsx`.
- `src/ui/PhoneScreens.tsx` : libellés exacts des écrans du téléphone (repris de `broker-connect-modal.tsx`, `resync-button.tsx`, `comptes/page.tsx`).

Les chapitres sont dans `src/scenes/` : `Matter` (1), `Kinetic` (2), `PhoneScene` (3 et 4, un seul plan), `TwoPaths` (5), `Layers3D` (6),
`Cards` (7), `Route` (8), `Numbers` (9), `LogoEnd` (10). L'assemblage est dans `src/Ad.tsx`.

## Commandes

```bash
npm run dev                                   # aperçu animé (Remotion Studio) : compositions « Ad » (FR) et « AdEn » (EN)
node scripts/render-stills.mjs                # les 26 images clés FR -> out/stills (un préfixe en argument : « 04 » = chapitre 4)
node scripts/render-stills.mjs --comp=AdEn    # idem en anglais -> out/stills-en
npx remotion render src/index.ts Ad out/ad-muet.mp4 --codec=h264 --crf=18   # maquette muette
scripts/place-voice.sh public/voix/{01..10}.mp3 out/voix-off-fr.wav         # pose les 10 lignes FR sur la frise (idem avec public/voix-en/ pour l'anglais)
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
