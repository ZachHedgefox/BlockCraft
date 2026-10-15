// Main menu, game modes, pause screen
const Game={
 mode:'survival',state:'menu',
 start(m){this.mode=m;this.state='play';pl.fly=false;pl.vy=0;Inv.reset(m);menu(null);this.resume()},
 resume(){renderer.domElement.requestPointerLock()}};
const M=document.getElementById('menu');
const btn=(t,f)=>{const e=document.createElement('button');e.className='btn';e.textContent=t;e.onclick=f;return e};
const el=(tag,html)=>{const e=document.createElement(tag);e.innerHTML=html;return e};
function menu(kind){
 M.classList.toggle('hidden',!kind);if(!kind)return;
 if(kind=='title')M.replaceChildren(el('h1','BLOCKCRAFT'),
  btn('Survival World',()=>Game.start('survival')),btn('Creative World',()=>Game.start('creative')),btn('How to Play',()=>menu('help')));
 if(kind=='help')M.replaceChildren(el('div','WASD move · Space jump · Shift sprint<br>Left click break · Right click place<br>1-9 / wheel: hotbar · E: inventory &amp; crafting<br>Creative: F toggles flight, Space/C up/down'),btn('Back',()=>menu('title')));
 if(kind=='pause')M.replaceChildren(el('h2','Game Paused'),
  btn('Resume',()=>{menu(null);Game.resume()}),btn('Back to Title',()=>{Game.state='menu';menu('title')}));}
document.addEventListener('pointerlockchange',()=>{
 if(!document.pointerLockElement&&Game.state=='play'&&!Inv.isOpen())menu('pause')});
setInterval(()=>{if(Game.state=='menu')pl.yaw+=.004},16);  // slow title-screen panorama
Inv.reset('survival');menu('title');
