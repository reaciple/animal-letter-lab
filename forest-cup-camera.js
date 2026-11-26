/* Forest Cup camera preview for Character Lab v1.20.0 */
(()=>{'use strict';
const TAU=Math.PI*2, R=25, L=74, P=2*L+TAU*R, mod=x=>((x%1)+1)%1;
function track(f,lane=0){
 let u=mod(f)*P, x,z,dx,dz;
 if(u<L/2){x=u;z=-R;dx=1;dz=0}
 else if((u-=L/2)<Math.PI*R){let a=u/R;x=L/2+Math.sin(a)*R;z=-Math.cos(a)*R;dx=Math.cos(a);dz=Math.sin(a)}
 else if((u-=Math.PI*R)<L){x=L/2-u;z=R;dx=-1;dz=0}
 else if((u-=L)<Math.PI*R){let a=u/R;x=-L/2-Math.sin(a)*R;z=Math.cos(a)*R;dx=-Math.cos(a);dz=-Math.sin(a)}
 else{x=-L/2+u-Math.PI*R;z=-R;dx=1;dz=0}
 return {x:x+dz*lane,z:z-dx*lane,dx,dz}}
function camera(f,w,h){
 const a=track(f),b=track(f+.034),shoulder=13+5*Math.cos(TAU*f),cx=a.x-a.dx*13+a.dz*shoulder,cz=a.z-a.dz*13-a.dx*shoulder,cy=8.7;
 const vx=b.x-cx,vz=b.z-cz,dist=Math.hypot(vx,vz),fx=vx/dist,fz=vz/dist,tilt=Math.atan2(cy-1.2,dist),ct=Math.cos(tilt),st=Math.sin(tilt),lens=Math.min(h*1.16,w*1.18);
 return {fx,fz,project(x,y,z){let X=x-cx,Z=z-cz,Y=y-cy,F=X*fx+Z*fz,d=F*ct-Y*st;
 return {x:w*.5+lens*(X*fz-Z*fx)/Math.max(.8,d),y:h*.50-lens*(Y*ct+F*st)/Math.max(.8,d),d,k:lens/Math.max(.8,d)}}}}
const stripes=['#cf7858','#d47e5d','#d88562','#d17d5d'],drops=[[.105,'🚀'],[.235,'🎆'],[.365,'🫧'],[.50,'🌀'],[.64,'🪶'],[.78,'🌟'],[.90,'🎆']];
function stadium(canvas,svg,rail,gear){
 const g=canvas.getContext('2d');if(!g)throw Error('canvas');
 const imgCache=new Map(),decor=[],sections=[];let raf=0,alive=true,last=-Infinity;
 function img(url){if(!url)return null;if(!imgCache.has(url)){let v=new Image();v.src=url;imgCache.set(url,v)}const im=imgCache.get(url);return im.complete&&im.naturalWidth?im:null}
 const people=['#f5bc85','#ac8067','#f9e1ae','#98bdb1','#fbcecc'];
 for(let i=0;i<136;i++){let f=i/136,a=track(f,8.5),b=track((i+1)/136,8.5);decor.push({a,b,type:'rail',i});if(i%2===0){a=track(f,23+(i%7));decor.push({a,type:'tree',i});}if(i%3===0){a=track(f,13);decor.push({a,b:track(f+.017,13),type:'stand',i})}}
 for(let i=0;i<164;i++){let f=i/164,e=(i+1)/164;sections.push({a:track(f,-5),b:track(e,-5),c:track(e,5),d:track(f,5),f,e,i})}
 const runners=[],labels=[...svg.querySelectorAll('text')];
 for(const label of ['나','상대']){const lab=labels.find(n=>n.textContent===label);if(!lab)throw Error('선수 위치');const group=lab.parentElement.previousElementSibling;
 const sheet=group?.querySelector('image[width="4"][height="3"]');const href=n=>n?.getAttribute('href')||n?.getAttribute('xlink:href');
 let art=href(sheet),wingG=group?.querySelector('linearGradient[id$="kit"]'),custom=group&&[...group.querySelectorAll('image')].find(n=>n.getAttribute('width')==='45'),shape=wingG&&group.querySelector('path[stroke-width="2"]'),path=shape?new Path2D(shape.getAttribute('d')):null;
 const stops=wingG?[...wingG.querySelectorAll('stop')].map(n=>n.getAttribute('stop-color')):[];
 let fallback=null;if(!art&&group){fallback=document.createElementNS('http://www.w3.org/2000/svg','svg');fallback.setAttribute('viewBox','-50 -75 100 83');fallback.style.cssText='position:absolute;pointer-events:none;overflow:visible';const c=group.cloneNode(true);c.removeAttribute('transform');fallback.append(c);canvas.after(fallback)}
 runners.push({art,wing:href(custom),path,stops,fallback});}
 const glyph={'새싹':'✿','물결':'≈','구름':'☁','혜성':'☄','번개':'ϟ','무지개':'🌈'}[gear]||'✦';
 let trailUrl='',timer=0;
 function draw(now){if(!alive)return;raf=requestAnimationFrame(draw);if(document.hidden||now-last<33)return;last=now;
 try{if(!svg.isConnected){stop();return}const rect=svg.getBoundingClientRect(),w=rect.width,h=rect.height;if(w<5||h<5)return;
 const scale=Math.min(devicePixelRatio||1,1.45,1400/w);if(canvas.width!==Math.round(w*scale)||canvas.height!==Math.round(h*scale)){canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale)}
 g.setTransform(scale,0,0,scale,0,0);const bars=rail.children,F=[bars[1],bars[0]].map(n=>Math.min(1,Math.max(0,(parseFloat(n.style.left)||0)/100)));const cam=camera(F[0],w,h),proj=(p,y=0)=>cam.project(p.x,y,p.z),time=now/1000;
 const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#78bbd2');sky.addColorStop(.48,'#f3e5bd');sky.addColorStop(.49,'#a0bd8b');sky.addColorStop(1,'#88b480');g.fillStyle=sky;g.fillRect(0,0,w,h);
 const yaw=Math.atan2(cam.fx,cam.fz);for(let layer=0;layer<2;layer++){g.fillStyle=layer?'#8cb7a0':'#adcac2';g.beginPath();g.moveTo(0,h*.50);for(let k=0;k<=60;k++){let th=yaw+(k/60-.5)*1.8,yy=h*(.415+layer*.033+.028*Math.sin(th*6+layer)+.018*Math.cos(th*11+layer));g.lineTo(k*w/60,yy)}g.lineTo(w,h*.50);g.fill()}
 const far=[],world=[];
 function face(points,col){let arr=points.map(([p,y])=>({p,y,q:proj(p,y)})),verts=[];for(let i=0;i<arr.length;i++){let A=arr[i],B=arr[(i+1)%arr.length];if(A.q.d>=1)verts.push(A.q);if((A.q.d>=1)!==(B.q.d>=1)){let t=(1-A.q.d)/(B.q.d-A.q.d);verts.push(cam.project(A.p.x+(B.p.x-A.p.x)*t,A.y+(B.y-A.y)*t,A.p.z+(B.p.z-A.p.z)*t))}}if(verts.length<3)return;g.fillStyle=col;g.beginPath();verts.forEach((v,i)=>i?g.lineTo(v.x,v.y):g.moveTo(v.x,v.y));g.closePath();g.fill()}
 function line(a,b,col,width){if(a.d<1||b.d<1)return;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.strokeStyle=col;g.lineWidth=Math.max(.55,width);g.stroke()}
 function oval(x,y,rx,ry,col){g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
 function put(list,q,paint,pad=100){if(q.d>1.4&&q.x>-pad*q.k&&q.x<w+pad*q.k)list.push([q.d,paint])}
 for(const s of sections){let q=proj(s.a);if(q.d< -3)continue;far.push([q.d,()=>{face([[s.a,0],[s.b,0],[s.c,0],[s.d,0]],stripes[(s.i>>2)%4]);for(const lane of [-4.9,0,4.9])line(proj(track(s.f,lane)),proj(track(s.e,lane)),'#fff1cf',q.k*(lane===0?.035:.12));if(s.i===0||s.i===163){for(let j=0;j<10;j++){let p=track(s.f,j-5),b=track(s.e,j-5),c=track(s.e,j-4),d=track(s.f,j-4);face([[p,.01],[b,.01],[c,.01],[d,.01]],(j+s.i)%2?'#fcf3cf':'#364b4e')}}}])}
 for(const o of decor){let q=proj(o.a);put(world,q,()=>{let k=q.k;if(o.type==='tree'){line(q,proj(o.a,4),'#866b50',k*.45);const j=proj(o.a,4.5);oval(j.x,j.y,k*2.3,k*(2.5+o.i%3*.3),'#508c72');oval(j.x-k*.6,j.y-k*.7,k*1.5,k*1.7,'#75a581')}
 else if(o.type==='rail'){line(q,proj(o.a,1),'#af8057',.14*k);line(proj(o.a,.82),proj(o.b,.82),'#fff1c6',.14*k)}
 else{let a=o.a,b=o.b;face([[a,0],[b,0],[b,2.3],[a,2.3]],'#598d89');line(proj(a,2.25),proj(b,2.25),'#ffdc9f',k*.25);
 for(let j=0;j<6;j++){const frac=(j+.4)/6,p={x:a.x+(b.x-a.x)*frac,z:a.z+(b.z-a.z)*frac},v=proj(p,2.7+.14*Math.sin(time*3+j+o.i));oval(v.x,v.y,.28*k,.32*k,people[(o.i+j)%5]);if(j%3===0){oval(v.x-.18*k,v.y-.24*k,.12*k,.13*k,people[(o.i+j)%5]);oval(v.x+.18*k,v.y-.24*k,.12*k,.13*k,people[(o.i+j)%5])}}}},7)}
 for(const f of [0,.25,.5,.75]){const a=track(f,5.5),b=track(f,-5.5),q=proj(a);put(world,q,()=>{line(q,proj(a,4.6),'#cd9b60',q.k*.19);let top=proj(a,4.6);if(f===0){line(proj(b),proj(b,4.6),'#cd9b60',q.k*.19);face([[a,4.6],[b,4.6],[b,3.95],[a,3.95]],'#f6d57b');for(let j=0;j<10;j+=2){let p=track(0,j-5),n=track(0,j-4);face([[p,4.6],[n,4.6],[n,4.27],[p,4.27]],'#244a4b')}}else{g.fillStyle='#ed925e';g.beginPath();g.moveTo(top.x,top.y);g.lineTo(top.x+q.k*1.3,top.y+.21*q.k);g.lineTo(top.x,top.y+.76*q.k);g.fill()}},9)}
 for(const [f,icon] of drops){if(F.every(v=>v>=f))continue;let q=proj(track(f),1);put(world,q,()=>{oval(q.x,q.y,.76*q.k,.76*q.k,'#fff6cf');g.font=Math.max(8,1.06*q.k)+'px sans-serif';g.textAlign='center';g.fillStyle='#354f50';g.fillText(icon,q.x,q.y+.34*q.k)},2)}
 if(!trailUrl&&time-timer>.35){timer=time;trailUrl=svg.querySelector('.wing-trail image')?.getAttribute('href')||''}
 runners.forEach((u,i)=>{const p=track(F[i],i?-.98:.98),q=proj(p);if(u.fallback)u.fallback.style.display='none';put(world,q,()=>{let height=Math.min(h*.31,q.k*3.1),dy=p.dx*cam.fx+p.dz*cam.fz,dx=p.dx*cam.fz-p.dz*cam.fx,row=Math.abs(dy)>.77?(dy>0?2:1):0,frame=Math.floor(F[i]*P*1.65)%4,flip=row===0&&dx<0;
 oval(q.x,q.y,height*.32,height*.075,'#3c332f55');const im=img(u.art),wi=img(u.wing),fx=img(trailUrl);
 if(i===0&&(u.path||wi)&&F[0]>0&&F[0]<1){for(let j=0;j<5;j++){let t=(F[0]*P*.85+j/5)%1,v=proj(track(F[0]-t*.012,.98),.5+.35*Math.sin(t*3));if(v.d<=1)continue;let z=Math.max(2,v.k*.43*(1-t));g.globalAlpha=(1-t)*.9;if(fx)g.drawImage(fx,v.x-z,v.y-z,2*z,2*z);else{g.fillStyle=u.stops[1]||'#a3dc72';g.font=2*z+'px sans-serif';g.textAlign='center';g.fillText(glyph,v.x,v.y)}}g.globalAlpha=1}
 if(u.fallback){Object.assign(u.fallback.style,{display:'block',left:(q.x-height*.5)+'px',top:(q.y-height)+'px',width:height+'px',height:height+'px',transform:'scaleX('+(flip?-1:1)+')'})}
 else if(im){g.save();g.translate(q.x,q.y);g.scale((flip?-1:1)*height/100,height/100);const fl=Math.sin(F[i]*P*2)*.21;
 const wings=()=>{if(!u.path&&!wi)return;g.save();g.translate(row===0?-6:0,-42);g.scale(row===2?.53:.69,row===2?.53:.69);for(let side=0;side<(row===0?1:2);side++){g.save();g.scale(side?-1:1,1);g.rotate(fl);if(wi){let s=Math.min(45/wi.naturalWidth,32/wi.naturalHeight);g.drawImage(wi,-wi.naturalWidth*s,-wi.naturalHeight*s*.6,wi.naturalWidth*s,wi.naturalHeight*s)}else{let c=g.createLinearGradient(0,-22,0,14);c.addColorStop(0,u.stops[0]||'#e8efa2');c.addColorStop(1,u.stops[1]||'#55ae74');g.fillStyle=c;g.fill(u.path);g.strokeStyle=u.stops[2]||'#28624e';g.lineWidth=1.4;g.stroke(u.path)}g.restore()}g.restore()};
 if(row===1)wings();g.drawImage(im,frame*im.width/4,row*im.height/3,im.width/4,im.height/3,-50,-100,100,100);if(row!==1)wings();g.restore()}
 },5)});
 for(const list of [far,world]){list.sort((a,b)=>b[0]-a[0]);for(const [,paint] of list)paint()}
 }catch(e){stop();canvas.dispatchEvent(new Event('camera-error'))}}
 function stop(){alive=false;cancelAnimationFrame(raf);for(const r of runners)r.fallback?.remove();svg.style.opacity='';canvas.remove()}
 raf=requestAnimationFrame(draw);return stop}
let mode=false,gear='',shown=null,dispose=null,button=null,boundRoom=null,failed=null;
try{mode=localStorage.getItem('forest-cup-camera:'+location.pathname)==='1'}catch{}
function sync(){
 const room=document.querySelector('.meet-lobby'),ticket=room?.querySelector('.race-ticket');
 if(ticket&&(!button?.isConnected||boundRoom!==room)){boundRoom=room;button=document.createElement('button');button.type='button';button.className='secondary';button.style.cssText='padding:6px 11px;border-radius:12px;min-height:42px';const label=()=>{button.textContent=mode?'✓ 입체 경기장':'입체 경기장 체험';button.setAttribute('aria-pressed',String(mode))};label();button.onclick=()=>{mode=!mode;failed=null;try{localStorage.setItem('forest-cup-camera:'+location.pathname,mode?'1':'0')}catch{}label()};ticket.insertBefore(button,ticket.lastElementChild)}
 if(room){const name=room.querySelector('.wing-goods .is-worn>span')?.textContent;gear=(name||'').split(' ')[0]}
 const svg=document.querySelector('svg.stadium'),rail=svg?.parentElement?.querySelector('.race-rail');
 if(shown&&(!shown.isConnected||shown!==svg||!mode)){dispose?.();dispose=null;shown=null}
 if(mode&&svg&&svg!==shown&&svg!==failed&&rail?.children.length===2){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.style.cssText='pointer-events:none;position:absolute;inset:0;width:100%;height:100%;display:block';svg.after(canvas);
 try{dispose=stadium(canvas,svg,rail,gear);shown=svg;svg.style.opacity='0';canvas.addEventListener('camera-error',()=>{failed=svg;shown=null;dispose=null})}catch{failed=svg;canvas.remove();svg.style.opacity=''}}
}
setInterval(sync,250);sync();})();
