/* global HL, specification */
export function createBookFigure(stage, options = {}) {
  HL.inject(document);
  stage.dataset.hairline = specification.name;
  stage.dataset.theme = options.theme ?? "light";
  const svg = HL.mk(
    "svg",
    { viewBox: "0 0 400 320", "aria-hidden": "true" },
    stage,
  );
  const read = { textContent: "rest" };
  const handle = specification.mount(
    { stage, svg, read },
    specification.range[1],
  );
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let lap = null;
  function update(next) {
    options = { ...options, ...next };
    lap?.stop();
    lap = null;
    HL.setReducedMotion(preference.matches);
    if (options.play && !preference.matches)
      lap = HL.tour(stage, specification.tour);
    stage.dataset.playing = String(Boolean(lap));
  }
  const changed = () => update({});
  preference.addEventListener("change", changed);
  update(options);
  return {
    update,
    destroy() {
      lap?.stop();
      preference.removeEventListener("change", changed);
      handle.destroy();
      stage.removeAttribute("data-hairline");
      stage.removeAttribute("data-playing");
    },
  };
}
