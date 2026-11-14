/*!
MIT License

Copyright (c) 2026 Lucas Marques

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/* global HL, hairline */
const {
  Cam, fit, proj, facing, rings, prism, solid, put, mk, rrect,
  poly, ringAt, rad, clamp, tween, tset, tval, tdone, register, pointer, disposer,
} = HL;
const W = 56, H = 42, BASE = 12, REST = [8, 22, 40];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stagger = value, active = -1;
  const C = Cam(45, 0.5, 1.8);
  fit(C, [[-64,-47,0],[64,47,0],[-64,47,0],[64,-47,0],[0,0,72]], 200, 166);
  const P = proj(C), front = facing(C), root = mk("g", {}, svg);
  // Covers, then bound paper blocks. The open gutter stays visible between them.
  for (const [x0,x1,z0,z1] of [[-63,-1,0,4],[1,63,0,4],[-59,-1,4,10],[1,59,4,10]]) {
    const [ring,inner] = rings(x0,-46,x1,46,3,1.2);
    put(solid(root), prism(P,front,ring,inner,z0,z1));
  }
  const spine = mk("path", { class: "nf lo", d: poly(ringAt(P,rrect(-1,-43,1,43,0.8,5),10)) }, root);
  const pages = REST.map((angle,i) => {
    const shape = solid(root);
    return { ...shape, index:i, angle:tween(angle), previous:NaN };
  });
  const [ring,inner] = rings(0,-H,W,H,2.5,1);
  const pose = (angle) => {
    const a = rad(angle);
    return (u,v,z) => P(u*Math.cos(a),v,BASE+u*Math.sin(a)+3*Math.sin(Math.PI*u/W)+z);
  };
  const centres = REST.map(angle => pose(angle)(W*0.72,18,1));
  function hit([x,y]) {
    let choice = -1, nearest = 52*52;
    centres.forEach(([sx,sy],i) => {
      const distance = (x-sx)**2+(y-sy)**2;
      if (distance < nearest) { nearest=distance; choice=i; }
    });
    return choice;
  }
  let previousOrder = "";
  function draw(now) {
    let moving = false;
    const order = [];
    pages.forEach(page => {
      const angle = tval(page.angle,now);
      if (Math.abs(angle-page.previous)>0.001 || !Number.isFinite(page.previous)) {
        put(page,prism(pose(angle),front,ring,inner,0,0.8));
        page.previous=angle;
      }
      order.push({ page, depth:Math.cos(rad(angle))+0.82*Math.sin(rad(angle)) });
      if (!tdone(page.angle,now)) moving=true;
    });
    order.sort((a,b)=>a.depth-b.depth);
    const key=order.map(({page})=>page.index).join("");
    if (key!==previousOrder) { order.forEach(({page})=>root.append(page.g)); previousOrder=key; }
    return moving;
  }
  const loop = register(stage,(_dt,now)=>draw(now));
  bag.add(loop.unregister);
  function select(index) {
    if (index===active) return;
    const from = index<0 ? active : index, now=performance.now();
    active=index;
    pages.forEach((page,i)=> {
      let target=REST[i];
      if (index>=0) {
        if (i<=index) target=152-Math.abs(i-index)*12;
        else target=clamp(REST[i]+Math.abs(i-index)*9,8,68);
      }
      tset(page.angle,target,now,Math.abs(i-from)*stagger);
      page.sil.classList.toggle("hi",i===(index<0 ? 2 : index));
    });
    read.textContent=index<0 ? "rest" : `page ${index+1}`;
    loop.wake();
  }
  pages[2].sil.classList.add("hi");
  read.textContent="rest";
  draw(performance.now());
  bag.add(pointer(stage,{ move:point=>select(hit(point)), leave:()=>select(-1) }));
  bag.add(()=>{ spine.remove(); svg.replaceChildren(); });
  return { set:value=>{ stagger=value; }, destroy:bag.dispose };
}

hairline({
  name: "book",
  means: "An open book: the pointer turns a leaf, and the neighbouring pages follow it.",
  rules: [1,2,3,4,6,7,8,9,10],
  range: [0,40,70],
  tour: [[228,195],[224,178],[215,155],null],
  mount,
});
