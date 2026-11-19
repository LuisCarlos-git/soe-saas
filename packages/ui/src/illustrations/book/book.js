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
  Cam, fit, proj, facing, rings, prism, solid, put, mk, rrect, poly, open,
  ringAt, run, clamp, lerp, tween, tset, tval, tdone, register, pointer, disposer, reducedMotion,
} = HL;
const W=56, H=42, BASE=10.6, REST=[0.065,0.13];
const INTERVAL=1.55, TURN=1.78;
const smooth = t => t*t*(3-2*t);

// Extra samples follow the flexing paper edge; a convex hull would make it a rigid board.
function sample(ring,closed=true) {
  const result=[];
  ring.forEach((a,i)=> {
    if (!closed&&i===ring.length-1) return;
    const b=ring[(i+1)%ring.length], steps=Math.max(1,Math.ceil(Math.hypot(a.u-b.u,a.v-b.v)/3));
    for (let j=0;j<steps;j++) result.push({u:lerp(a.u,b.u,j/steps),v:lerp(a.v,b.v,j/steps),nu:a.nu,nv:a.nv});
  });
  if (!closed) result.push(ring[ring.length-1]);
  return result;
}

function mount({ stage, svg, read }, value) {
  const bag=disposer();
  let flex=value, active=-1, elapsed=0, wasPlaying=false;
  const C=Cam(45,0.5,1.8);
  fit(C,[[-64,-47,0],[64,47,0],[-64,47,0],[64,-47,0],[0,0,72]],200,166);
  const P=proj(C), front=facing(C), root=mk("g",{},svg), binding=mk("g",{},root);
  for (const [x0,x1,z0,z1] of [[-63,-1,0,4],[1,63,0,4],[-59,-1,4,10],[1,59,4,10]]) {
    const [ring,inner]=rings(x0,-46,x1,46,3,1.2);
    put(solid(binding),prism(P,front,ring,inner,z0,z1));
  }
  mk("path",{class:"nf lo",d:poly(ringAt(P,rrect(-1,-43,1,43,0.8,5),10))},binding);
  const [outer,inset]=rings(0,-H,W,H,2.5,1);
  const outline=sample(outer), crease=sample(run(inset,front),false);
  const pages=REST.map((rest,index)=>({...solid(root),index,progress:tween(rest),previous:NaN}));

  // The far corner leads, the near corner lags, and the middle bows as a flexible sheet.
  // Both ends land exactly on the paper blocks; the spine never leaves the binding.
  function world(u,v,progress) {
    const s=u/W, envelope=Math.sin(Math.PI*progress);
    const local=clamp(progress-0.075*envelope*(v/H)*s,0,1);
    const angle=Math.PI*smooth(local), curl=Math.sin(Math.PI*local);
    const bow=Math.sin(Math.PI*s);
    return [
      u*Math.cos(angle)-flex*curl*bow,
      v,
      BASE+u*Math.sin(angle)+flex*0.44*curl*bow,
    ];
  }
  const pose=progress=>(u,v)=>P(...world(u,v,progress));
  const centres=REST.map(rest=>pose(rest)(W*0.72,18));
  function hit([x,y]) {
    let choice=-1, nearest=52*52;
    centres.forEach(([sx,sy],i)=> {
      const distance=(x-sx)**2+(y-sy)**2;
      if (distance<nearest) { nearest=distance; choice=i; }
    });
    return choice;
  }
  let previousOrder="";
  function draw(progresses,highlight) {
    const raised=[],flat=[];
    pages.forEach((page,i)=> {
      const progress=progresses[i], Q=pose(progress);
      if (!Number.isFinite(page.previous)||Math.abs(progress-page.previous)>0.0001) {
        put(page,{sil:poly(outline.map(q=>Q(q.u,q.v))),crease:open(crease.map(q=>Q(q.u,q.v)))});
        page.previous=progress;
      }
      page.sil.classList.toggle("hi",i===highlight);
      if (progress<=0.0001||progress>=0.9999) flat.push(page);
      else {
        const [x,,z]=world(W*0.5,0,progress);
        raised.push({page,depth:x+0.82*z});
      }
    });
    raised.sort((a,b)=>a.depth-b.depth);
    const key=flat.map(p=>p.index).join("")+"/"+raised.map(({page})=>page.index).join("");
    if (key!==previousOrder) {
      flat.forEach(page=>root.insertBefore(page.g,binding));
      raised.forEach(({page})=>root.append(page.g));
      previousOrder=key;
    }
  }
  const loop=register(stage,(dt,now)=> {
    // The host owns play. Only the visible Hairline clock advances this ambient loader.
    const playing=stage.dataset.playing==="true"&&!reducedMotion();
    if (playing) {
      if (!wasPlaying) elapsed=0;
      elapsed+=Math.min(dt,0.05);
      const progresses=pages.map((page,i)=> {
        if (elapsed<i*INTERVAL) return 0;
        return clamp(((elapsed-i*INTERVAL)%(pages.length*INTERVAL))/TURN,0,1);
      });
      draw(progresses,Math.floor(elapsed/INTERVAL)%pages.length);
      wasPlaying=true;
      return true;
    }
    wasPlaying=false;
    draw(pages.map(page=>tval(page.progress,now)),active<0 ? 1 : active);
    return pages.some(page=>!tdone(page.progress,now));
  });
  bag.add(loop.unregister);
  function select(index) {
    if (index===active) return;
    const from=index<0 ? active : index, now=performance.now();
    active=index;
    pages.forEach((page,i)=> {
      let target=REST[i];
      if (index>=0) target=clamp(0.36+(index-i)*0.12,0.1,0.72);
      tset(page.progress,target,now,Math.abs(i-from)*40);
    });
    read.textContent=index<0 ? "rest" : `page ${index+1}`;
    loop.wake();
  }
  read.textContent="rest";
  draw(REST,1);
  bag.add(pointer(stage,{move:point=>select(hit(point)),leave:()=>select(-1)}));
  bag.add(()=>svg.replaceChildren());
  return {set:value=>{flex=value;pages.forEach(page=>page.previous=NaN);loop.wake();},destroy:bag.dispose};
}

hairline({
  name:"book",
  means:"An open book with flexible leaves: a corner leads the turn and the paper settles across the spine.",
  rules:[1,2,3,4,6,7,8,9,10],
  range:[6,12,18],
  tour:[[228,195],[224,178],[228,195],null],
  mount,
});
