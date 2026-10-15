// Inventory, hotbar, creative palette and 2x2 crafting
const Inv=(()=>{
 const S=Array(36).fill(null),CR=Array(4).fill(null);
 let out=null,cur=null,sel=0,open=false;
 const RECIPES=[{i:{5:1},o:[7,4]},{i:{7:4},o:[9,1]},{i:{3:1},o:[8,1]},{i:{8:4},o:[10,4]}];
 const cu=document.createElement('div');cu.id='cursor';document.body.append(cu);
 addEventListener('mousemove',e=>{cu.style.left=e.clientX-18+'px';cu.style.top=e.clientY-18+'px'});
 const icon=id=>{const c=document.createElement('canvas');c.width=c.height=16;const t=tex(id,0);
  c.getContext('2d').drawImage(cv,(t%16)*16,(t>>4)*16,16,16,0,0,16,16);return c};
 const cell=(st,fn,on)=>{const d=document.createElement('div');d.className='cell'+(on?' on':'');
  if(st){d.append(icon(st.id));if(st.n>1&&Game.mode=='survival'){const b=document.createElement('b');b.textContent=st.n;d.append(b)}}
  d.onclick=fn;return d};
 function add(id,n=1){
  for(const s of S)if(n&&s&&s.id==id&&s.n<64){const k=Math.min(n,64-s.n);s.n+=k;n-=k}
  for(let i=0;i<36&&n>0;i++)if(!S[i]){const k=Math.min(n,64);S[i]={id,n:k};n-=k}}
 function click(arr,i){const s=arr[i];
  if(cur&&s&&s.id==cur.id){const k=Math.min(cur.n,64-s.n);s.n+=k;cur.n-=k;if(!cur.n)cur=null}
  else{arr[i]=cur;cur=s}
  craft()}
 function craft(){const c={};CR.forEach(s=>s&&(c[s.id]=(c[s.id]||0)+s.n));
  const r=RECIPES.find(r=>Object.keys(c).length==Object.keys(r.i).length&&Object.keys(r.i).every(k=>c[k]>=r.i[k]));
  out=r?{id:r.o[0],n:r.o[1],r}:null}
 function takeOut(){
  if(!out||(cur&&(cur.id!=out.id||cur.n+out.n>64)))return;
  for(const k in out.r.i){let n=out.r.i[k];
   CR.forEach((s,i)=>{if(s&&s.id==k&&n){const t=Math.min(n,s.n);s.n-=t;n-=t;if(!s.n)CR[i]=null}})}
  cur={id:out.id,n:(cur?cur.n:0)+out.n};craft()}
 function render(){
  document.getElementById('bar').replaceChildren(...S.slice(0,9).map((s,i)=>cell(s,()=>pick(i),i==sel)));
  cu.replaceChildren(...(cur?[icon(cur.id)]:[]));
  const el=document.getElementById('inv');el.classList.toggle('hidden',!open);
  if(!open)return;
  const t=document.createElement('div');t.textContent=Game.mode=='creative'?'Creative Inventory':'Inventory & Crafting';
  const grid=(arr,off,len,fn)=>{const g=document.createElement('div');g.className='grid';
   for(let i=0;i<len;i++)g.append(fn?fn(i):cell(arr[off+i],()=>{click(arr,off+i);render()}));return g};
  const cr=document.createElement('div');cr.className='craft';
  cr.append(grid(CR,0,4),'→',cell(out,()=>{takeOut();render()}));
  const parts=[t];
  if(Game.mode=='creative')parts.push(grid(0,0,10,i=>cell({id:i+1,n:1},()=>{cur={id:i+1,n:64};render()})));
  el.replaceChildren(...parts,cr,grid(S,9,27),grid(S,0,9));}
 function pick(i){sel=(i+9)%9;render()}
 function toggle(){
  if(!open&&Game.state!='play')return;
  open=!open;
  if(open)document.exitPointerLock();
  else{CR.forEach((s,i)=>{if(s)add(s.id,s.n);CR[i]=null});if(cur&&Game.mode=='survival')add(cur.id,cur.n);cur=null;out=null;Game.resume()}
  render()}
 return{
  get sel(){return sel},pick,toggle,isOpen:()=>open,
  held:()=>S[sel]?S[sel].id:0,
  onPlace(){if(Game.mode!='survival')return;if(!--S[sel].n)S[sel]=null;render()},
  onBreak(b){if(Game.mode=='survival'&&b){add(b==1?2:b);render()}},
  reset(m){S.fill(null);CR.fill(null);cur=out=null;open=false;sel=0;
   if(m=='creative')for(let i=0;i<9;i++)S[i]={id:i+1,n:64};render()}};
})();
