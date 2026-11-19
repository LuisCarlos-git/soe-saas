import type { Figure, HairlineOptions } from "@lucasmarkes/hairline";
export function createBookFigure(
  stage: HTMLElement,
  options?: Pick<HairlineOptions, "theme" | "play">,
): Pick<Figure, "destroy">;
