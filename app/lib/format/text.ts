// Hausa hooked letters have no decomposed form, so NFD can't strip them.
const PLAIN_LETTERS: Record<string, string> = {
  ɓ: "b",
  ɗ: "d",
  ƙ: "k",
  ƴ: "y",
  "’": "'",
  ʼ: "'",
};

/**
 * Text for matching and sorting: lower case, with accents, tone marks and dots
 * below removed and Hausa hooked letters made plain, so "Ẹ̀fọ́ Riro" and
 * "efo riro" compare equal.
 */
export function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[ɓɗƙƴ’ʼ]/g, (letter) => PLAIN_LETTERS[letter])
    .replace(/\s+/g, " ")
    .trim();
}
