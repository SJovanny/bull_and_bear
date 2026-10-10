import React from "react";
import { Composition } from "remotion";
import { Ad, type AdProps } from "./Ad";
import { FPS, W, H, WV, HV } from "./tokens";
import { TIMINGS } from "./timings";

// « Ad » = version française (principale), « AdEn » = version anglaise. Même code, textes et durées par langue.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ad" component={Ad} width={W} height={H} fps={FPS} durationInFrames={TIMINGS.fr.totalFrames} defaultProps={{ lang: "fr", subs: true } satisfies AdProps} />
    <Composition id="AdEn" component={Ad} width={W} height={H} fps={FPS} durationInFrames={TIMINGS.en.totalFrames} defaultProps={{ lang: "en", subs: true } satisfies AdProps} />
    {/* vertical 9:16 : version française pour les réseaux sociaux */}
    <Composition id="AdVertical" component={Ad} width={WV} height={HV} fps={FPS} durationInFrames={TIMINGS.fr.totalFrames} defaultProps={{ lang: "fr", subs: true } satisfies AdProps} />
  </>
);
