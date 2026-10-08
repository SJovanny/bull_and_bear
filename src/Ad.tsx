import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { C, FPS, SANS, sec } from "./tokens";
import { OVERLAP, TIMINGS, chapterStart, type ChapterId, type Lang } from "./timings";
import { COPY } from "./copy";
import { LangProvider } from "./lang";
import { tw } from "./motion";
import { Subtitles } from "./Subtitles";
import { Matter } from "./scenes/Matter";
import { Kinetic } from "./scenes/Kinetic";
import { PhoneScene } from "./scenes/PhoneScene";
import { TwoPaths } from "./scenes/TwoPaths";
import { Layers3D } from "./scenes/Layers3D";
import { Cards } from "./scenes/Cards";
import { Route } from "./scenes/Route";
import { Numbers } from "./scenes/Numbers";
import { LogoEnd } from "./scenes/LogoEnd";

const SCENES: Record<ChapterId, React.FC> = {
  matiere: Matter,
  typo: Kinetic,
  telephone: PhoneScene,
  chemins: TwoPaths,
  calques: Layers3D,
  cartes: Cards,
  parcours: Route,
  chiffres: Numbers,
  logo: LogoEnd,
};

/** Fondu enchaîné doux : entrée sur les OVERLAP premières images, sortie sur les OVERLAP images qui dépassent le chapitre. */
const Fade: React.FC<{ dur: number; first: boolean; last: boolean; children: React.ReactNode }> = ({ dur, first, last, children }) => {
  const f = useCurrentFrame();
  const o = (first ? 1 : tw(f, 0, OVERLAP, 0, 1)) * (last ? 1 : 1 - tw(f, dur, dur + OVERLAP, 0, 1));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Mention sur les chiffres de démonstration : du chapitre 5 au chapitre 9 (le logo final porte la sienne). */
const Legal: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const from = chapterStart(lang, "chemins") - 0.4;
  const to = chapterStart(lang, "logo") - 0.6;
  const o = tw(f, sec(from), sec(from + 0.6)) * (1 - tw(f, sec(to - 0.5), sec(to)));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: SANS, fontSize: 19, color: C.text2, opacity: o * 0.8 }}>
      {COPY[lang].legal}
    </div>
  );
};

export type AdProps = { lang: Lang; subs: boolean };

export const Ad: React.FC<AdProps> = ({ lang, subs }) => {
  const { chapters } = TIMINGS[lang];
  return (
    <LangProvider value={lang}>
      <AbsoluteFill style={{ background: C.bgDeep }}>
        {chapters.map((ch, i) => {
          const Scene = SCENES[ch.id];
          const dur = sec(ch.dur);
          return (
            <Sequence key={ch.id} name={ch.id} from={sec(ch.from)} durationInFrames={dur + (i === chapters.length - 1 ? 0 : OVERLAP)} premountFor={FPS}>
              <Fade dur={dur} first={i === 0} last={i === chapters.length - 1}>
                <Scene />
              </Fade>
            </Sequence>
          );
        })}
        <Legal lang={lang} />
        {subs && <Subtitles />}
      </AbsoluteFill>
    </LangProvider>
  );
};
