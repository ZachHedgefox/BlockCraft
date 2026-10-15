// Engine: world generation, textures, rendering, physics, block interaction

// ---------- World data ----------
const W=96,D=40,CH=16,SEED=Math.random()*1000;
const blocks=new Uint8Array(W*D*W);
const idx=(x,y,z)=>(x*W+z)*D+y;
const get=(x,y,z)=>y<0?1:(y>=D||x<0||z<0||x>=W||z>=W)?0:blocks[idx(x,y,z)];
const set=(x,y,z,v)=>{if(y>=0&&y<D&&x>=0&&z>=0&&x<W&&z<W)blocks[idx(x,y,z)]=v};
const rnd=(x,z)=>{const s=Math.sin(x*127.1+z*311.7+SEED)*43758.5453;return s-Math.floor(s)};
const sm=t=>t*t*(3-2*t);
function noise(x,z){const xi=Math.floor(x),zi=Math.floor(z),fx=sm(x-xi),fz=sm(z-zi);
 const a=rnd(xi,zi),b=rnd(xi+1,zi),c=rnd(xi,zi+1),d=rnd(xi+1,zi+1);
 return a+(b-a)*fx+(c-a)*fz+(a-b-c+d)*fx*fz}
// 1 grass 2 dirt 3 stone 4 sand 5 log 6 leaves 7 planks 8 cobble
const hs=[];
for(let x=0;x<W;x++)for(let z=0;z<W;z++){
 const h=Math.floor(16+noise(x/30,z/30)*12+noise(x/10,z/10)*4);hs[x*W+z]=h;
 for(let y=0;y<=h;y++)set(x,y,z,y==h?(h<=17?4:1):y>=h-3?(h<=17?4:2):3)}
for(let x=3;x<W-3;x++)for(let z=3;z<W-3;z++){
 const h=hs[x*W+z];
 if(get(x,h,z)==1&&rnd(x*1.7,z*2.3)>0.985){
  const t=4+(rnd(x,z)*2|0);
  for(let dy=t-2;dy<=t+1;dy++){const r=dy>t-1?1:2;
   for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)
    if(!(r==2&&Math.abs(dx)==2&&Math.abs(dz)==2&&rnd(x+dx,z+dz)>.5)&&!get(x+dx,h+dy,z+dz))set(x+dx,h+dy,z+dz,6)}
  for(let dy=1;dy<=t;dy++)set(x,h+dy,z,5)}}

// ---------- Procedural textures ----------
const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d');
let sd=1;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
function tile(i,f){const ox=(i%16)*16,oy=(i>>4)*16;
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const c=f(x,y),n=.85+r()*.3;
  g.fillStyle=`rgb(${c[0]*n|0},${c[1]*n|0},${c[2]*n|0})`;g.fillRect(ox+x,oy+y,1,1)}}
tile(0,()=>[88,160,48]);
tile(1,(x,y)=>y<4?[88,160,48]:[134,96,67]);
tile(2,()=>[134,96,67]);
tile(3,()=>[125,125,125]);
tile(4,()=>[219,207,142]);
tile(5,x=>x%4==0?[70,54,32]:[104,82,50]);
tile(6,(x,y)=>Math.max(Math.abs(x-7.5),Math.abs(y-7.5))%4<1.5?[120,92,55]:[170,140,88]);
tile(7,()=>r()<.3?[30,85,25]:[55,125,42]);
tile(8,(x,y)=>y%4==3?[110,85,50]:[170,135,80]);
tile(9,(x,y)=>((x+(y>>3)*4)%8==0||y%8==0)?[70,70,70]:[130,130,130]);
const T={9:[10],10:[11],1:[0,1,2],2:[2],3:[3],4:[4],5:[6,5,6],6:[7],7:[8],8:[9]};
tile(10,(x,y)=>(x%8<1||y%8<1)?[60,40,20]:y<8?[150,110,60]:[185,150,95]);
tile(11,(x,y)=>(y%4==3||(x+(y>>2)%2*4)%8==7)?[190,190,180]:[150,70,55]);
const tex=(b,f)=>{const t=T[b];return t.length==1?t[0]:f==2?t[0]:f==3?t[2]:t[1]};

// ---------- Rendering ----------
const renderer=new THREE.WebGLRenderer({antialias:false});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x87ceeb);scene.fog=new THREE.Fog(0x87ceeb,40,110);
const cam=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.05,200);cam.rotation.order='YXZ';
const tx=new THREE.CanvasTexture(cv);tx.magFilter=tx.minFilter=THREE.NearestFilter;
const mat=new THREE.MeshBasicMaterial({map:tx,vertexColors:true});
const FC=[
 {n:[1,0,0],s:.8,c:[[1,0,1],[1,0,0],[1,1,0],[1,1,1]]},
 {n:[-1,0,0],s:.8,c:[[0,0,0],[0,0,1],[0,1,1],[0,1,0]]},
 {n:[0,1,0],s:1,c:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]]},
 {n:[0,-1,0],s:.5,c:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]},
 {n:[0,0,1],s:.65,c:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]]},
 {n:[0,0,-1],s:.65,c:[[1,0,0],[0,0,0],[0,1,0],[1,1,0]]}];
const chunks={};
function build(cx,cz){
 if(cx<0||cz<0||cx>=W/CH||cz>=W/CH)return;
 const P=[],U=[],C=[],I=[];let n=0;
 for(let x=cx*CH;x<cx*CH+CH;x++)for(let z=cz*CH;z<cz*CH+CH;z++)for(let y=0;y<D;y++){
  const b=blocks[idx(x,y,z)];if(!b)continue;
  for(let f=0;f<6;f++){const F=FC[f];if(get(x+F.n[0],y+F.n[1],z+F.n[2]))continue;
   const t=tex(b,f),u=(t%16)/16,v=1-((t>>4)+1)/16,e=.0005;
   F.c.forEach((c,k)=>{P.push(x+c[0],y+c[1],z+c[2]);
    U.push(u+(k==0||k==3?e:1/16-e),v+(k<2?e:1/16-e));C.push(F.s,F.s,F.s)});
   I.push(n,n+1,n+2,n,n+2,n+3);n+=4}}
 const key=cx+','+cz,old=chunks[key];
 if(old){scene.remove(old);old.geometry.dispose()}
 if(!n){delete chunks[key];return}
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 geo.setIndex(I);
 const m=new THREE.Mesh(geo,mat);scene.add(m);chunks[key]=m}
for(let cx=0;cx<W/CH;cx++)for(let cz=0;cz<W/CH;cz++)build(cx,cz);
function rebuildAt(x,z){const cx=x/CH|0,cz=z/CH|0;build(cx,cz);
 if(x%CH==0)build(cx-1,cz);if(x%CH==CH-1)build(cx+1,cz);
 if(z%CH==0)build(cx,cz-1);if(z%CH==CH-1)build(cx,cz+1)}

// ---------- Player ----------
const pl={x:W/2+.5,y:hs[(W/2)*W+W/2]+2,z:W/2+.5,vx:0,vy:0,vz:0,ground:false,fly:false,yaw:0,pitch:0};
const R=.3,H=1.8;
function hit(x,y,z){
 for(let i=Math.floor(x-R);i<=Math.floor(x+R);i++)for(let j=Math.floor(y);j<=Math.floor(y+H);j++)for(let k=Math.floor(z-R);k<=Math.floor(z+R);k++)
  if(get(i,j,k))return true;return false}
const keys={};
function step(dt){
 const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0);
 const sp=(keys.ShiftLeft?1.4:1)*(pl.fly?10:4.3),sn=Math.sin(pl.yaw),cs=Math.cos(pl.yaw);
 const dx=-sn*f+cs*s,dz=-cs*f-sn*s,l=Math.hypot(dx,dz)||1,mv=f||s?1:0;
 pl.vx=dx/l*sp*mv;pl.vz=dz/l*sp*mv;
 if(pl.fly)pl.vy=((keys.Space?1:0)-(keys.KeyC?1:0))*8;
 else{pl.vy=Math.max(pl.vy-28*dt,-50);if(keys.Space&&pl.ground)pl.vy=9}
 for(const a of['x','y','z']){const o=pl[a];pl[a]+=pl['v'+a]*dt;
  if(hit(pl.x,pl.y,pl.z)){pl[a]=o;if(a=='y'){if(pl.vy<0)pl.ground=true;pl.vy=0}}
  else if(a=='y')pl.ground=false}
 pl.x=Math.min(W-1,Math.max(1,pl.x));pl.z=Math.min(W-1,Math.max(1,pl.z));
 if(pl.y<-20){pl.y=D;pl.vy=0}}

// ---------- Interaction ----------
const sel=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004,1.004,1.004)),new THREE.LineBasicMaterial({color:0}));
scene.add(sel);
function ray(){
 const d=new THREE.Vector3();cam.getWorldDirection(d);
 const px=pl.x,py=pl.y+1.62,pz=pl.z;let lx,ly,lz;
 for(let t=0;t<6;t+=.04){const x=Math.floor(px+d.x*t),y=Math.floor(py+d.y*t),z=Math.floor(pz+d.z*t);
  if(get(x,y,z))return{x,y,z,px:lx,py:ly,pz:lz};lx=x;ly=y;lz=z}
 return null}

addEventListener('keydown',e=>{keys[e.code]=1;
 if(e.code.startsWith('Digit')){const n=+e.code[5];if(n>=1&&n<=9)Inv.pick(n-1)}
 if(e.code=='KeyF'&&Game.mode=='creative')pl.fly=!pl.fly;if(e.code=='KeyE'||(e.code=='Escape'&&Inv.isOpen()))Inv.toggle();if(e.code=='Space')e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('wheel',e=>Inv.pick(Inv.sel+(e.deltaY>0?1:-1)));
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(!document.pointerLockElement)return;
 pl.yaw-=e.movementX*.0022;pl.pitch=Math.max(-1.55,Math.min(1.55,pl.pitch-e.movementY*.0022))});
addEventListener('mousedown',e=>{if(!document.pointerLockElement)return;
 const h=ray();if(!h)return;
 if(e.button==0){if(h.y>0){Inv.onBreak(get(h.x,h.y,h.z));set(h.x,h.y,h.z,0);rebuildAt(h.x,h.z)}}
 else if(e.button==2&&h.px!==undefined){
  const id=Inv.held();if(!id)return;set(h.px,h.py,h.pz,id);
  if(hit(pl.x,pl.y,pl.z))set(h.px,h.py,h.pz,0);else{rebuildAt(h.px,h.pz);Inv.onPlace()}}});
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});

// ---------- Loop ----------
let last=performance.now();
(function loop(now){requestAnimationFrame(loop);
 const dt=Math.min(.05,(now-last)/1000);last=now;
 if(document.pointerLockElement)step(dt);
 cam.position.set(pl.x,pl.y+1.62,pl.z);cam.rotation.set(pl.pitch,pl.yaw,0);
 const h=ray();sel.visible=!!h;if(h)sel.position.set(h.x+.5,h.y+.5,h.z+.5);
 renderer.render(scene,cam)})(last);
