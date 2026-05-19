import { franc } from "franc-min";

const ISO_TO_NAME: Record<string, string> = {
  kor: "Korean",
  eng: "English",
  jpn: "Japanese",
  cmn: "Chinese (Simplified)",
  spa: "Spanish",
  por: "Portuguese",
  fra: "French",
  deu: "German",
  rus: "Russian",
  ita: "Italian",
  vie: "Vietnamese",
  ind: "Indonesian",
  tha: "Thai",
  ara: "Arabic",
  tur: "Turkish",
};

export function detectLanguage(text: string): { iso: string; name: string } {
  if (!text || text.trim().length < 3) {
    return { iso: "eng", name: "English" };
  }
  const iso = franc(text, { minLength: 3 });
  if (iso === "und") return { iso: "eng", name: "English" };
  return { iso, name: ISO_TO_NAME[iso] ?? iso };
}
