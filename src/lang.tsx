// Langue de la composition : les scènes lisent leurs textes (useCopy) et leurs durées (useTimings) ici.
import { createContext, useContext } from "react";
import { COPY, type Copy } from "./copy";
import { TIMINGS, type Lang } from "./timings";

const LangContext = createContext<Lang>("fr");

export const LangProvider = LangContext.Provider;
export const useLang = () => useContext(LangContext);
export const useCopy = (): Copy => COPY[useLang()];
export const useTimings = () => TIMINGS[useLang()];
