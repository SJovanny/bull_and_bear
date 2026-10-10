// Format de la composition : 16:9 (1920×1080) ou vertical 9:16 (1080×1920, réseaux sociaux). Les scènes adaptent leur mise en page avec `v`.
import { useVideoConfig } from "remotion";

export const useStage = () => {
  const { width, height } = useVideoConfig();
  return { w: width, h: height, v: height > width };
};
