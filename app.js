import {G,models,fields,unit,toDisplay,toSI,solve} from './physics.js';
const $=id=>document.getElementById(id),svg=$('canvas');
const names={block:'Mass block',mass2:'Right mass',surface:'Surface',force:'Applied force',friction:'Friction',pulley:'Fixed pulley',projectile:'Projectile',spring:'Spring',orbit:'Circular path',rotor:'Rigid rotor'};
const icons={block:'□',mass2:'□',surface:'◩',force:'↗',friction:'≋',pulley:'◎',projectile:'↗',spring:'∿',orbit:'◌',rotor:'⟳'};
const locations={block:[350,210],mass2:[520,260],surface:[220,330],force:[455,180],friction:[420,290],pulley:[400,110],projectile:[130,320],spring:[180,210],orbit:[400,220],rotor:[400,220]};
let state,selected,time=0,running=false,last=0,solution,error='',drag=null;
const fmt=n=>Number.isFinite(n)?Number(n.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:5}):'∞';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function example(model='surface',system=state?.units||'metric'){
 const parts=models[model].allowed.map(kind=>({kind,x:locations[kind][0],y:locations[kind][1]}));
 if(model==='pulley'){parts.find(e=>e.kind==='block').x=280;parts.find(e=>e.kind==='block').y=260;}
 if(model==='spring'){parts.find(e=>e.kind==='block').x=480;}
 if(model==='collision'){parts[0].x=260;parts[0].y=250;parts[1].x=540;parts[1].y=250;}
 state={version:1,model,units:system,params:{...models[model].defaults},parts,target:Object.keys(models[model].targets)[0]};
 selected=parts.find(e=>e.kind==='block'||e.kind==='projectile')?.kind||parts[0].kind;time=0;pause();render();
}
function persist(){try{localStorage.setItem('dynamics-experiment',JSON.stringify(state));}catch{}}
function pause(){running=false;$('play').textContent='▶ Run simulation';}
function calculate(){try{solution=solve(state.model,state.params,state.parts);error='';}catch(e){solution=null;error=e.message;pause();}}
function render(){calculate();renderTabs();renderPalette();renderProperties();renderTarget();renderSolution();draw();persist();}
function renderTabs(){$('models').innerHTML=Object.entries(models).map(([key,m])=>`<button data-model="${key}" class="${key===state.model?'active':''}" aria-pressed="${key===state.model}"><span>${m.icon}</span>${m.name}</button>`).join('');$('scene-name').textContent=models[state.model].name;$('model-note').textContent=models[state.model].description;$('units').value=state.units;$('timeline').max=state.params.duration;}
function renderPalette(){$('palette').innerHTML=models[state.model].allowed.map(kind=>`<button class="element-card" draggable="true" data-kind="${kind}" ${state.parts.some(e=>e.kind===kind)?'aria-label="'+names[kind]+' already added"':''}><span class="element-icon">${icons[kind]}</span><span><strong>${names[kind]}</strong><small>${state.parts.some(e=>e.kind===kind)?'In your system · select':'Click or drag to add'}</small></span><span class="add">${state.parts.some(e=>e.kind===kind)?'✓':'+'}</span></button>`).join('');}
function editableKeys(){
 const groups={block:['m','v0','acceleration','restitution'],mass2:['m2','v2'],rotor:['inertia','torque','omega0'],surface:['angle'],force:['F'],friction:['mus','muk'],projectile:['speed','launch','height'],spring:['k','x0'],orbit:['radius','orbital'],pulley:[]};
 return (groups[selected]||[]).filter(key=>key in state.params);
}
function renderProperties(){
 const el=state.parts.find(e=>e.kind===selected);
 $('properties').innerHTML=`<div class="selected-title"><span>${icons[selected]||'◈'}</span><div><strong>${el?names[selected]:'Experiment'}</strong><small>${el?'Selected element':'Select an element to edit'}</small></div>${el?'<button id="remove" title="Remove selected element" aria-label="Remove selected element">×</button>':''}</div>`+
 [...editableKeys(),'duration'].map(key=>{const f=fields[key];return `<label class="field">${f[0]}<span><input data-param="${key}" type="number" step="any" min="${toDisplay(f[2],f[1],state.units)}" max="${toDisplay(f[3],f[1],state.units)}" value="${Number(toDisplay(state.params[key],f[1],state.units).toPrecision(9))}"><em>${unit(f[1],state.units)}</em></span></label>`;}).join('')+
 (selected==='surface'?'<div class="surface-presets"><button data-angle="0">Flat</button><button data-angle="30">30° incline</button><button data-angle="45">45°</button></div>':'')+
 (state.model==='pulley'&&selected==='pulley'?'<p class="muted">Connected automatically to the left and right masses with an ideal rope.</p>':'');
}
function renderTarget(){const m=models[state.model];$('target').innerHTML=Object.entries(m.targets).map(([key,v])=>`<option value="${key}">${v[0]}</option>`).join('');$('target').value=state.target;}
function renderSolution(){
 const target=models[state.model].targets[state.target];
 if(error){$('result').innerHTML=`<div class="error">${escape(error)}</div>`;$('steps').innerHTML='<p class="muted">Complete the system with valid parameters to see its worked solution.</p>';$('assumptions').textContent='';return;}
 const value=toDisplay(solution.values[state.target],target[1],state.units);
 $('result').innerHTML=`<span class="eyebrow">${escape(target[0].toUpperCase())}</span><div class="result-number">${fmt(value)} <span>${unit(target[1],state.units)}</span></div><small>${state.model==='collision'?'Post-impact result.':state.model==='surface'&&state.target==='a'?'Initial acceleration.':`Observation time: ${fmt(state.params.duration)} s.`}</small>`;
 $('steps').innerHTML=solution.steps.map((s,i)=>`<article class="step"><span class="step-index">0${i+1}</span><div><h3>${s.title}</h3><p>${s.detail}</p><div class="equation" data-equation="${i}"></div></div></article>`).join('')+`<article class="step answer"><span class="step-index">✓</span><div><h3>${target[0]}</h3><div class="equation" id="final-equation"></div><p>Substitution steps use SI units. The final answer uses your selected unit system.</p></div></article>`;
 const math=(node,latex)=>{if(window.katex)window.katex.render(latex,node,{displayMode:true,throwOnError:false,trust:false});else node.textContent=latex;};
 solution.steps.forEach((s,i)=>math(document.querySelector(`[data-equation="${i}"]`),s.latex));
 math($('final-equation'),`\\text{${target[0]}}=${Number.isFinite(value)?Number(value.toPrecision(6)):'\\infty'}\\,\\text{${unit(target[1],state.units)}}`);
 $('assumptions').innerHTML=`<strong>Model assumptions</strong><span>${models[state.model].assumptions} Gravity = ${fmt(toDisplay(G,'accel',state.units))} ${unit('accel',state.units)}.</span>`;
}
function arrow(x1,y1,x2,y2,color='#ee815c',label=''){if(!color.startsWith('#'))color='#'+color;return `<path d="M${x1},${y1} L${x2},${y2}" stroke="${color}" stroke-width="2.5" marker-end="url(#arrow-${color.slice(1)})"/><text x="${x2+8}" y="${y2-7}" fill="${color}" class="vector-label">${label}</text>`;}
function draw(){
 const p=state.params,model=state.model;let live;
 try{live=solve(model,p,state.parts,time).values;}catch{}
 const defs=`<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d8dedb"/></pattern>${['ee815c','4f8c79','688bba'].map(c=>`<marker id="arrow-${c}" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#${c}"/></marker>`).join('')}</defs><rect width="800" height="440" fill="url(#grid)"/><text x="28" y="34" class="canvas-label">${model==='surface'?'+ axis: downhill / right':model==='pulley'?'+ axis: left down':'IDEALIZED MOTION'}</text><g transform="translate(36,380)">${arrow(0,0,40,0,'688bba','x')}${arrow(0,0,0,-40,'688bba','y')}</g>`;
 let background='';
 if(model==='projectile'&&live){const full=solution?.values||live;const sx=560/Math.max(full.range,1),sy=240/Math.max(full.peak,1);let path='';for(let i=0;i<=80;i++){const t=full.flight*i/80,x=130+full.vx*t*sx,y=350-(p.height+full.vy*t-G*t*t/2)*sy;path+=`${i?'L':'M'}${x},${y} `;}background=`<path d="${path}" fill="none" stroke="#8bad9e" stroke-width="2" stroke-dasharray="5 6"/><path d="M95 350H740" stroke="#b9c6be"/><text x="620" y="375" class="canvas-label">GROUND · y = 0</text>`;}
 if(model==='pulley'){
 const pulley=state.parts.find(e=>e.kind==='pulley'),left=state.parts.find(e=>e.kind==='block'),right=state.parts.find(e=>e.kind==='mass2');
 if(pulley&&left&&right){const offset=live?Math.tanh(live.s/5)*65:0;background=`<path d="M${left.x} ${left.y+offset} L${pulley.x-30} ${pulley.y} A30 30 0 0 1 ${pulley.x+30} ${pulley.y} L${right.x} ${right.y-offset}" stroke="#8e9c96" stroke-width="3" fill="none"/>`;}
 }
 svg.innerHTML=defs+background+[...state.parts].sort((a,b)=>Number(!['surface','orbit','spring','pulley'].includes(a.kind))-Number(!['surface','orbit','spring','pulley'].includes(b.kind))).map(e=>{
 let {x,y,kind}=e,g='';let rotate=0;
 if(kind==='surface'){
 const rise=Math.tan(p.angle*Math.PI/180)*300;const h=Math.min(210,rise);
 g=`<path d="M0 0 L300 0 L0 -${h} Z" fill="#dce5df" stroke="#a1b4a8" stroke-width="2"/><path d="M0 -${h} L300 0" stroke="#527866" stroke-width="4"/><text x="65" y="28" class="element-label">${p.angle}° surface</text>`;
 }else if(kind==='block'||kind==='mass2'){
 let m=kind==='mass2'?p.m2:p.m;
 if(live&&time>0){if(model==='surface'){let d=Math.tanh(live.s/8)*110;x+=d*Math.cos(p.angle*Math.PI/180);y+=d*Math.sin(p.angle*Math.PI/180);}if(model==='pulley')y+=(kind==='mass2'?-1:1)*Math.tanh(live.s/5)*65;if(model==='spring')x+=Math.tanh((live.x-p.x0)/2)*140;if(model==='kinematics')x+=Math.tanh(live.s/12)*180;if(model==='collision'){const v=kind==='mass2'?live.v2:live.v1,u=kind==='mass2'?p.v2:p.v0;const contact=kind==='mass2'?438:362;x=time<1?e.x+(contact-e.x)*time:contact+Math.tanh(v*(time-1)/10)*210;}if(model==='circular'){const orbit=state.parts.find(e=>e.kind==='orbit');x=orbit.x+120*Math.cos(p.orbital/p.radius*time);y=orbit.y+120*Math.sin(p.orbital/p.radius*time);}}
 if(model==='circular'&&time===0){const orbit=state.parts.find(e=>e.kind==='orbit');if(orbit){x=orbit.x+120;y=orbit.y;}}
 rotate=model==='surface'?p.angle:0;
 g=`<rect x="-38" y="-32" width="76" height="64" rx="10" fill="${kind==='mass2'?'#779785':'#e8a184'}" stroke="${kind==='mass2'?'#527866':'#ca7c5f'}" stroke-width="2"/><path d="M-28 -21H25" stroke="#ffffff70" stroke-width="2"/><text text-anchor="middle" y="5" fill="#3f3e35" font-size="17" font-weight="600">${fmt(toDisplay(m,'mass',state.units))}</text><text text-anchor="middle" y="22" fill="#554c43" font-size="11">${unit('mass',state.units)}</text><text y="56" text-anchor="middle" class="element-label">${model==='pulley'?(kind==='mass2'?'m₂':'m₁'):'mass'}</text>`;
 if(model==='surface'){const theta=p.angle*Math.PI/180;g+=`<g transform="rotate(${-rotate})">${arrow(0,0,0,90,'ee815c','mg')}${arrow(0,0,65*Math.sin(theta),-65*Math.cos(theta),'4f8c79','N')}</g>`;}
 }else if(kind==='force'){const sign=p.F<0?-1:1;g=arrow(-40*sign,0,45*sign,0,'ee815c','F')+`<text x="0" y="32" text-anchor="middle" class="element-label">${fmt(toDisplay(p.F,'force',state.units))} ${unit('force',state.units)}</text>`;rotate=model==='surface'?p.angle:0;
 }else if(kind==='friction'){const sign=Math.sign(solution?.values.friction||-1);rotate=p.angle;g=arrow(-30*sign,0,30*sign,0,'4f8c79','f')+`<text x="0" y="28" text-anchor="middle" class="element-label">μs ${fmt(p.mus)} · μk ${fmt(p.muk)}</text>`;
 }else if(kind==='pulley'){g='<path d="M0 -32V-68M-45 -68H45" stroke="#8e9c96" stroke-width="4"/><circle r="31" fill="#f2f3eb" stroke="#527866" stroke-width="4"/><circle r="21" fill="none" stroke="#c0cec5" stroke-width="2"/><circle r="5" fill="#527866"/>';
 }else if(kind==='spring'){const block=state.parts.find(e=>e.kind==='block');let end=(block?block.x:480)-x-40+(live?Math.tanh((live.x-p.x0)/2)*140:0);end=Math.max(50,end);let path='M0 0L15 0';for(let i=0;i<12;i++)path+=`L${15+(end-30)*(i+1)/13} ${i%2?15:-15}`;path+=`L${end-15} 0L${end} 0`;g=`<path d="M0 -40V40" stroke="#8e9c96" stroke-width="6"/><path d="${path}" fill="none" stroke="#527866" stroke-width="3"/><text x="70" y="52" class="element-label">k = ${fmt(toDisplay(p.k,'stiffness',state.units))} ${unit('stiffness',state.units)}</text>`;
 }else if(kind==='rotor'){const angle=live?live.theta*180/Math.PI:0;g=`<circle r="100" fill="#e3ebe0" stroke="#72957d" stroke-width="3"/><g transform="rotate(${-angle})"><path d="M-90 0H90M0 -90V90" stroke="#a4b69c" stroke-width="8"/><circle cx="70" cy="0" r="12" fill="#d99a78"/></g><circle r="10" fill="#527866"/><text y="135" text-anchor="middle" class="element-label">I = ${fmt(toDisplay(p.inertia,'inertia',state.units))} ${unit('inertia',state.units)}</text>`;}else if(kind==='orbit'){g=`<circle r="120" stroke="#8bad9e" stroke-width="2" stroke-dasharray="5 6" fill="none"/><circle r="4" fill="#527866"/>${arrow(100,0,8,0,'4f8c79','Fᶜ')}<text y="152" text-anchor="middle" class="element-label">r = ${fmt(toDisplay(p.radius,'length',state.units))} ${unit('length',state.units)}</text>`;
 }else if(kind==='projectile'){if(live){const full=solution?.values||live;x=130+live.x*560/Math.max(full.range,1);y=350-live.y*240/Math.max(full.peak,1);}g=`<circle r="14" fill="#e8a184" stroke="#ca7c5f" stroke-width="2"/>${time===0?arrow(0,0,70*Math.cos(p.launch*Math.PI/180),-70*Math.sin(p.launch*Math.PI/180),'ee815c','v₀'):''}`;}
 return `<g data-element="${kind}" tabindex="0" role="button" aria-label="Select ${names[kind]}" aria-pressed="${kind===selected}" transform="translate(${x},${y}) rotate(${rotate})" class="canvas-element ${kind===selected?'selected':''}"><rect class="hitbox" x="${kind==='surface'?-10:-48}" y="${kind==='surface'?-220:-45}" width="${kind==='surface'?320:96}" height="${kind==='surface'?245:100}" rx="12"/>${g}</g>`;
 }).join('');
 $('empty').hidden=state.parts.length>0;$('time').textContent=time.toFixed(2)+' s';$('timeline').value=time;
}
function add(kind,point){if(!models[state.model].allowed.includes(kind))return;pause();time=0;const existing=state.parts.find(e=>e.kind===kind);if(!existing)state.parts.push({kind,x:point?.x??locations[kind][0],y:point?.y??locations[kind][1]});selected=kind;render();}
function point(event){const pt=svg.createSVGPoint();pt.x=event.clientX;pt.y=event.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse());}
$('models').onclick=e=>{const button=e.target.closest('[data-model]');if(button)example(button.dataset.model);};
$('palette').onclick=e=>{const button=e.target.closest('[data-kind]');if(button)add(button.dataset.kind);};
$('palette').ondragstart=e=>{const button=e.target.closest('[data-kind]');if(button)e.dataTransfer.setData('text/plain',button.dataset.kind);};
svg.ondragover=e=>e.preventDefault();svg.ondrop=e=>{e.preventDefault();add(e.dataTransfer.getData('text/plain'),point(e));};
svg.onpointerdown=e=>{const node=e.target.closest('[data-element]');if(!node)return;pause();time=0;selected=node.dataset.element;const p=point(e),el=state.parts.find(x=>x.kind===selected);drag={kind:selected,dx:p.x-el.x,dy:p.y-el.y};svg.setPointerCapture(e.pointerId);renderProperties();draw();};
svg.onpointermove=e=>{if(!drag)return;const p=point(e),el=state.parts.find(x=>x.kind===drag.kind);el.x=Math.max(60,Math.min(700,p.x-drag.dx));el.y=Math.max(80,Math.min(350,p.y-drag.dy));draw();};
svg.onpointerup=()=>{if(drag){drag=null;persist();}};svg.onpointercancel=()=>drag=null;
svg.onkeydown=e=>{const kind=e.target.closest('[data-element]')?.dataset.element;if(!kind)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();selected=kind;renderProperties();return;}const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(delta){e.preventDefault();pause();time=0;selected=kind;const el=state.parts.find(x=>x.kind===kind);el.x=Math.max(60,Math.min(700,el.x+delta[0]));el.y=Math.max(80,Math.min(350,el.y+delta[1]));renderProperties();draw();svg.querySelector(`[data-element="${kind}"]`).focus();persist();}};
$('properties').oninput=e=>{const key=e.target.dataset.param;if(!key)return;pause();time=0;state.params[key]=toSI(e.target.value===''?NaN:Number(e.target.value),fields[key][1],state.units);calculate();renderSolution();draw();$('timeline').max=state.params.duration;persist();};
$('properties').onclick=e=>{if(e.target.closest('#remove')){pause();time=0;state.parts=state.parts.filter(x=>x.kind!==selected);selected=state.parts[0]?.kind;render();}if(e.target.dataset.angle){state.params.angle=Number(e.target.dataset.angle);time=0;pause();render();}};
$('units').onchange=e=>{state.units=e.target.value;render();};$('target').onchange=e=>{state.target=e.target.value;renderSolution();persist();};
$('clear').onclick=()=>{pause();state.parts=[];selected=null;time=0;render();};$('reset').onclick=()=>example(state.model);
$('play').onclick=()=>{if(error)return;if(running){pause();return;}if(time>=state.params.duration)time=0;running=true;last=performance.now();$('play').textContent='Ⅱ Pause';};
$('rewind').onclick=()=>{pause();time=0;draw();};$('timeline').oninput=e=>{pause();time=Number(e.target.value);draw();};
function frame(now){if(running){time=Math.min(state.params.duration,time+(now-last)/1000);last=now;draw();if(time>=state.params.duration)pause();}requestAnimationFrame(frame);}requestAnimationFrame(frame);
$('help').onclick=()=>$('help-dialog').showModal();$('close-help').onclick=()=>$('help-dialog').close();
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export').onclick=()=>download('dynamics-experiment.json',JSON.stringify(state,null,2),'application/json');
function parseState(raw){
 const s=JSON.parse(raw),m=models[s.model];if(s.version!==1||!m||!['metric','imperial'].includes(s.units)||!Object.hasOwn(m.targets,s.target)||!Array.isArray(s.parts)||s.parts.length>m.allowed.length)throw Error('Invalid experiment format.');
 const params={};for(const key of Object.keys(m.defaults)){if(typeof s.params?.[key]!=='number'||!Number.isFinite(s.params[key]))throw Error('Invalid parameter: '+key);params[key]=s.params[key];}
 const seen=new Set();const parts=s.parts.map(e=>{if(!m.allowed.includes(e.kind)||seen.has(e.kind)||!Number.isFinite(e.x)||!Number.isFinite(e.y))throw Error('Invalid element.');seen.add(e.kind);return {kind:e.kind,x:Math.max(60,Math.min(700,e.x)),y:Math.max(80,Math.min(350,e.y))};});
 return {version:1,model:s.model,units:s.units,target:s.target,params,parts};
}
$('import').onclick=()=>$('file').click();$('file').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw Error('Experiment file is too large.');const next=parseState(await file.text());state=next;selected=state.parts[0]?.kind;time=0;pause();render();}catch(err){alert('Could not open experiment: '+err.message);}e.target.value='';};
$('copy').onclick=async()=>{if(!solution)return;const target=models[state.model].targets[state.target];const text=solution.steps.map(s=>`% ${s.title}\n${s.latex}`).join('\n\n')+`\n\n% ${target[0]} (${state.units})\n${toDisplay(solution.values[state.target],target[1],state.units)}\\,\\text{${unit(target[1],state.units)}}`;
 try{await navigator.clipboard.writeText(text);$('copy').textContent='Copied ✓';setTimeout(()=>$('copy').textContent='Copy LaTeX',1500);}catch{download('dynamics-solution.tex',text,'text/plain');}};
try{const raw=localStorage.getItem('dynamics-experiment');if(raw){state=parseState(raw);selected=state.parts[0]?.kind;render();}else example();}catch{example();}



