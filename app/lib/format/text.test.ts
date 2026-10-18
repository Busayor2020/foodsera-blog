import { describe, expect, it } from "vitest";

import { foldText } from "./text";

describe("foldText", () => {
  it("removes Yoruba tone marks and dots below", () => {
    expect(foldText("Ẹ̀fọ́ Riro")).toBe("efo riro");
    expect(foldText("Ọbẹ̀ Ata Dín-dín")).toBe("obe ata din-din");
    expect(foldText("Ṣaki")).toBe("saki");
  });

  it("handles precomposed and decomposed text the same way", () => {
    const composed = "Ẹ̀fọ́".normalize("NFC");
    const decomposed = "Ẹ̀fọ́".normalize("NFD");
    expect(foldText(composed)).toBe(foldText(decomposed));
  });

  it("removes Igbo dots and tone marks", () => {
    expect(foldText("Ọ̀fẹ́ Ọ̀nụ̀gbụ̀")).toBe("ofe onugbu");
    expect(foldText("Ụ́tazị̀ and Ńchanwụ̀")).toBe("utazi and nchanwu");
    expect(foldText("Ṅkwọbị")).toBe("nkwobi");
  });

  it("makes Hausa hooked letters plain", () => {
    expect(foldText("Ƙosai da Ɗan wake")).toBe("kosai da dan wake");
    expect(foldText("Ɓeske ƴar")).toBe("beske yar");
    expect(foldText("Miyan ’yaƙuwa")).toBe("miyan 'yakuwa");
  });

  it("lower-cases and tidies spaces", () => {
    expect(foldText("  Party   JOLLOF ")).toBe("party jollof");
  });
});
