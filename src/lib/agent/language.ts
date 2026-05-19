import { franc } from "franc-min";

const ISO_TO_NAME: Record<string, string> = {
  kor: "Korean",
  eng: "English",
  jpn: "Japanese",
  cmn: "Chinese",
  spa: "Spanish",
  fra: "French",
  deu: "German",
  rus: "Russian",
};

export function detectLanguage(text: string): { iso: string; name: string } {
  if (!text || text.trim().length < 3) return { iso: "eng", name: "English" };
  const iso = franc(text, { minLength: 3 });
  if (iso === "und") return { iso: "eng", name: "English" };
  return { iso, name: ISO_TO_NAME[iso] ?? iso };
}
