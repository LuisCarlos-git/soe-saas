import { readFile, writeFile } from "node:fs/promises";

// Standalone preview of the product's runtime; the official Hairline bench remains untouched.
const runtime = await readFile(
  "packages/ui/dist/illustrations/book/book-runtime.js",
  "utf8",
);
const page = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SOE · Livro folheando</title>
<style>
:root{color-scheme:light;font:16px/1.5 system-ui,sans-serif;background:#f8fafc;color:#0f172a}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}
main{width:min(100%,440px);text-align:center}h1{font-size:24px;font-weight:600;margin:0 0 24px}
#book{width:100%;aspect-ratio:5/4;--hairline-plate:#f8fafc;--hairline-hi:#0f766e;--hairline-edge:#64748b;--hairline-mid:#475569;--hairline-lo:#e2e8f0}
button{min-height:44px;padding:10px 22px;margin-top:24px;background:#0f766e;border:0;border-radius:8px;color:white;font:inherit;cursor:pointer}
button:focus-visible{outline:2px solid #0f766e;outline-offset:4px}p{color:#475569}
</style></head><body><main><h1>Carregando página…</h1><div id="book" role="img" aria-label="Livro aberto com folhas passando continuamente da direita para a esquerda"></div><button id="toggle" type="button" aria-pressed="true">Parar</button><p id="status" role="status">Folhas virando continuamente</p></main>
<script type="module">
${runtime}
const host=document.getElementById("book"), button=document.getElementById("toggle"), status=document.getElementById("status");
const figure=createBookFigure(host,{play:true,theme:"light"});
let playing=true;
function describe(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){status.textContent="Movimento reduzido: ilustração estática";return;}
  status.textContent="Folhas virando continuamente";
  if(!playing)status.textContent="Animação parada";
}
button.addEventListener("click",()=>{playing=!playing;figure.update({play:playing});button.textContent="Iniciar";if(playing)button.textContent="Parar";button.setAttribute("aria-pressed",String(playing));describe();});
matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",describe);describe();
</script></body></html>`;
await writeFile("artifacts/hairline/book-loop.html", page);
console.log("artifacts/hairline/book-loop.html");
