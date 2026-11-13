// Forêt pixel art : la scène est dessinée sur un petit canvas, agrandi par le CSS.
// Le monde fait 4 écrans de large : le défilement horizontal de #stage déplace la caméra (cam).
const cv=document.getElementById('c'),g=cv.getContext('2d'),stage=document.getElementById('stage'),world=document.getElementById('world'),
bar=document.getElementById('bar'),pct=document.getElementById('pct'),msg=document.getElementById('msg'),
hint=document.getElementById('hint'),tg=document.getElementById('tg');

// Deux palettes : jour (0) et nuit (1)
const PAL=[
 {sky:['#8fd3ff','#a6dcff','#bfe6ff','#d6f0ff'],far:'#86c394',m1:'#3f8a54',m2:'#2f7045',p1:'#4fb35f',p2:'#3a9a4e',gr:'#56a64a',gd:'#3f8a3a',dirt:'#6b4a2b',tr:'#5a3a22',cl:'#ffffff',sun:'#ffe066',ff:'#fff7a8'},
 {sky:['#0b1030','#121a46','#1b2660','#26337a'],far:'#1d3a4d',m1:'#1a4a45',m2:'#12383a',p1:'#2c7a5c',p2:'#226650',gr:'#24574a',gd:'#1a4338',dirt:'#2a1f1a',tr:'#2b1c14',cl:'#3d4d80',sun:'#f3f0d0',ff:'#ffe76a'}
];
const MSG=['Réveil des arbres…','Arrosage des fougères…','Allumage des lucioles…','Presque prêt…'];
const mo=matchMedia('(prefers-reduced-motion: reduce)').matches?0:1; // 0 = animations autonomes coupées

let N=matchMedia('(prefers-color-scheme: dark)').matches?1:0,
pal,S,W,H,WW,GY,M,far,mid,clouds,stars,flies,saps=[],drops=[],
rain=0,prog=0,done=0,px=.5,py=.5,cam=0,t=0,last=0,shown=-1,drag=null,moved=0;

const rnd=n=>Math.floor(Math.random()*n);
// Un "pixel" = un rectangle sur le petit canvas, agrandi ensuite par le CSS
const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
const disc=(cx,cy,r,c)=>{for(let d=-r;d<=r;d++){const w=Math.floor(Math.sqrt(r*r-d*d));R(cx-w,cy+d,2*w+1,1,c)}};
// Un sapin : des étages de plus en plus larges, moitié gauche / moitié droite pour l’ombre
const pine=(x,b,h,c1,c2,tr)=>{
  R(x-1,b-4,2,4,tr);
  for(let y=0;y<h-4;y++){
    const w=Math.max(1,Math.floor(y*.3)+1-(y%6<2?1:0));
    R(x-w,b-h+y,w,1,c1);R(x,b-h+y,w,1,c2);
  }
};
// Position d’un nuage à l’écran : il glisse lentement quand on avance (effet de profondeur)
const cloudX=c=>((c.x-cam*.2)%M+M)%M-40;

function theme(){
  pal=PAL[N];
  document.documentElement.dataset.theme=N?'dark':'light';
  tg.textContent=N?'Jour':'Nuit';
}

function init(){
  const bw=stage.clientWidth,bh=stage.clientHeight;
  S=bw<600?4:5;                        // taille d’un pixel à l’écran
  W=Math.ceil(bw/S);H=Math.ceil(bh/S); // taille de l’écran en pixels d’art
  WW=W*4;M=W+80;                       // largeur du monde
  cv.width=W;cv.height=H;cv.style.width=W*S+'px';cv.style.height=H*S+'px';
  world.style.width=WW*S+'px';
  GY=Math.floor(H*.78);                // hauteur de l’horizon
  far=[];mid=[];
  for(let x=-12;x<W+(WW-W)*.3+12;x+=11)far.push({x:x+rnd(6),h:20+rnd(12)});
  for(let x=-12;x<WW+12;x+=19)mid.push({x:x+rnd(8),h:28+rnd(14)});
  clouds=[...Array(5)].map((_,i)=>({x:rnd(M),y:32+(i%4)*7+rnd(5),w:18+rnd(12),v:2+Math.random()*2}));
  stars=[...Array(45)].map(()=>({x:rnd(W),y:rnd(GY*.7)}));
  flies=[...Array(72)].map(()=>({x:rnd(WW),y:GY-30+rnd(40),vx:0,vy:0,p:Math.random()*6}));
}

function update(dt){
  clouds.forEach(c=>{c.x+=c.v*dt*mo;if(c.x>M)c.x-=M});
  saps.forEach(s=>s.g=Math.min(1,s.g+dt*(rain>0?.2:.07)));   // la pluie fait pousser plus vite
  if(rain>0){
    rain-=dt;
    for(let i=0;i<3;i++){
      const c=clouds[rnd(clouds.length)],x=cloudX(c);
      if(x>-10&&x<W+10)drops.push({x:x+cam+rnd(c.w),y:c.y+7});
    }
  }
  drops.forEach(d=>d.y+=dt*90);
  drops=drops.filter(d=>d.y<H);
  const tx=px*W+cam,ty=py*H;
  flies.forEach(f=>{
    f.p+=dt*3;
    f.vx+=(Math.random()-.5)*60*dt*mo;f.vy+=(Math.random()-.5)*60*dt*mo;
    if(Math.hypot(tx-f.x,ty-f.y)<60){f.vx+=(tx-f.x)*dt;f.vy+=(ty-f.y)*dt} // attirées par le curseur
    f.vx*=.97;f.vy*=.97;f.x+=f.vx*dt;f.y+=f.vy*dt;
    if(f.y>GY+6)f.vy=-Math.abs(f.vy)-1;
    if(f.y<8)f.vy=Math.abs(f.vy)+1;
    f.x=(f.x+WW)%WW;
  });
  if(!done){
    prog=Math.min(100,prog+dt*(prog<90?1.5:.4));
    if(prog>=100){done=1;setTimeout(()=>{prog=0;done=0},4000)}
  }
  const p=Math.floor(prog);
  if(p!==shown){
    shown=p;
    pct.textContent=p+'\u00a0%';
    msg.textContent=p>=100?'Forêt chargée ! (ou presque…)':MSG[Math.min(3,p/25|0)];
    [...bar.children].forEach((e,i)=>e.classList.toggle('on',i<p/5));
  }
}

function draw(){
  const bh=Math.ceil(GY/4),sx=Math.round(W*.82),sy=40;
  pal.sky.forEach((c,i)=>R(0,i*bh,W,bh+1,c));
  if(N)stars.forEach((s,i)=>{if(Math.sin(t*2*mo+i)>-.6)R(s.x,s.y,1,1,'#fff')});
  disc(sx,sy,7,pal.sun);
  if(N)disc(sx+3,sy-2,6,pal.sky[Math.min(3,Math.floor(sy/bh))]);   // croissant de lune
  clouds.forEach(c=>{
    const x=cloudX(c);
    R(x,c.y+3,c.w,4,pal.cl);R(x+3,c.y+1,c.w*.5,3,pal.cl);R(x+c.w*.45,c.y,c.w*.35,4,pal.cl);
  });
  // Arbres lointains : ils défilent à 30 % de la vitesse du sol
  far.forEach(o=>{const x=o.x-cam*.3;if(x>-16&&x<W+16)pine(x,GY,o.h,pal.far,pal.far,pal.far)});
  R(0,GY,W,H-GY,pal.gr);
  for(let wx=Math.floor(cam/6)*6;wx<cam+W+6;wx+=6){const k=(wx*37)%7;R(wx-cam,GY-(k>4?1:0),1,k>4?2:1,pal.gd)}
  for(let wx=Math.floor(cam/8)*8;wx<cam+W+8;wx+=8){
    const k=(wx*53)%13;
    if(k<4)R(wx-cam,GY+3+(k*11)%Math.max(1,H-GY-8),1,1,['#ff6b9a','#ffd23f','#ffffff','#b48cff'][k]);
  }
  R(0,H-3,W,3,pal.dirt);
  mid.forEach(o=>{const x=o.x-cam;if(x>-16&&x<W+16)pine(x,GY+3,o.h,pal.m1,pal.m2,pal.tr)});
  saps.slice().sort((a,b)=>a.fy-b.fy).forEach(s=>{
    const x=s.fx*WW-cam,b=s.fy*H;
    if(x<-20||x>W+20)return;
    if(s.g<.2){R(x-1,b-3,3,1,pal.p1);R(x,b-2,1,2,pal.p2)}
    else pine(x,b,6+s.g*30,pal.p1,pal.p2,pal.tr);
  });
  drops.forEach(d=>R(d.x-cam,d.y,1,3,'#7fb5ff'));
  flies.forEach(f=>{
    const x=f.x-cam;
    if(x<-3||x>W+3)return;
    const a=.5+.5*Math.sin(f.p);
    g.globalAlpha=.2*a;R(x-1,f.y-1,3,3,pal.ff);
    g.globalAlpha=N?.3+.7*a:.3+.4*a;R(x,f.y,1,1,pal.ff);
    g.globalAlpha=1;
  });
}

// Position du pointeur en pixels d’art, à l’écran
const tgt=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/S,(e.clientY-r.top)/S]};

// Souris : on fait défiler en glissant (au doigt, le navigateur s’en charge tout seul)
cv.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse')return;
  drag={x:e.clientX,s:stage.scrollLeft};moved=0;cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove',e=>{
  const [x,y]=tgt(e);px=x/W;py=y/H;
  if(drag&&e.buttons){
    const d=e.clientX-drag.x;
    if(Math.abs(d)>5)moved=1;
    if(moved)stage.scrollLeft=drag.s-d;
  }
});
cv.addEventListener('pointerup',()=>{drag=null});
// Un clic (sans glisser) : pluie si on touche un nuage, sinon on plante un arbre
cv.addEventListener('click',e=>{
  if(moved){moved=0;return}
  const [x,y]=tgt(e);
  hint.hidden=true;
  if(clouds.some(c=>{const cx=cloudX(c);return x>cx-3&&x<cx+c.w+3&&y>c.y-3&&y<c.y+10})){rain=6;return}
  if(y>=GY-2){
    if(saps.length>=60)saps.shift();
    saps.push({fx:(x+cam)/WW,fy:Math.min(H-4,Math.max(GY+3,y))/H,g:0});
    if(!done)prog=Math.min(100,prog+4);   // planter fait avancer le chargement
  }
});
// Molette : la scène avance vers la droite (ou la gauche)
stage.addEventListener('wheel',e=>{
  e.preventDefault();
  stage.scrollLeft+=(e.deltaY+e.deltaX)*(e.deltaMode?33:1);
},{passive:false});
stage.addEventListener('scroll',()=>{hint.hidden=true},{passive:true});
tg.onclick=()=>{N^=1;theme()};
addEventListener('resize',init);

bar.innerHTML='<i></i>'.repeat(20);
theme();init();
requestAnimationFrame(function loop(ts){
  const dt=Math.min(.05,(ts-last)/1000||0);
  last=ts;t+=dt;
  cam=Math.round(stage.scrollLeft/S);   // la caméra suit le défilement, par pixels d’art entiers
  update(dt);draw();
  requestAnimationFrame(loop);
});
