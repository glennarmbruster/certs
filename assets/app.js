(function(){
'use strict';
const {exams,tracks}=window.catalog, {read,write,shuffled,record,finish,weighted}=Atlas;
const page=document.querySelector('#main'), here=document.body.dataset.slug||'', base=here?'../':'./', exam=exams.find(e=>e.slug===here), guide=document.body.dataset.guide==='yes';
const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const fmt=n=>n.toLocaleString('en-US');
const icon=n=>`<svg aria-hidden="true" class="icon"><use href="${base}assets/icons.svg#${n}"/></svg>`;
const el=id=>document.getElementById(id), hash=()=>decodeURIComponent(location.hash.slice(1)), href=(e,s='')=>base+e.slug+'/index.html'+(s?'#'+s:'');
const link=(label,url,primary=false,ic='')=>`<a class="bttn ${primary?'primary':'quiet'}" href="${url}">${ic?icon(ic):''}${esc(label)}</a>`;
const button=(label,action,primary=false,disabled=false)=>`<button class="bttn ${primary?'primary':'quiet'}" data-act="${action}" ${disabled?'disabled':''}>${esc(label)}</button>`;
const hlink=(hash,label,ic)=>`<a class="navlink" data-nav="${hash}" href="${base}index.html#${hash}">${icon(ic)}${label}</a>`;
const rail=el('rail');
rail.innerHTML=`<a class="brand" href="${base}index.html">${icon('atlas')}<span>Atlas<small>CERTIFICATION LAB</small></span></a><nav aria-label="Workspace"><p class="navtitle">Workspace</p>${hlink('dashboard','Dashboard','grid')}${hlink('library','Exam library','book')}${hlink('bookmarks','Bookmarks','bookmark')}${hlink('progress','My progress','chart')}</nav><nav aria-label="Learning tracks"><p class="navtitle">Learning tracks</p>${tracks.map((t,i)=>`<a class="navlink ${t.color}" data-nav="track-${i}" href="${base}index.html#track-${i}"><i class="swatch"></i>${t.short}</a>`).join('')}</nav><div class="railfoot">${icon('device')} &nbsp; Local workspace</div>`;
el('menu').onclick=()=>{const open=rail.classList.toggle('open');el('menu').setAttribute('aria-expanded',String(open));};
let bank=[],byId=new Map(),state=exam?read(exam.code):null,filter='',clock=null,viewResult=0;
const save=()=>{if(!write(exam.code,state))el('storage').hidden=false;};
const activate=()=>rail.querySelectorAll('[data-nav]').forEach(a=>{const on=!exam&&a.dataset.nav===(hash()||'dashboard');a.classList.toggle('current',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
const stat=(n,label,ic,c)=>`<div class="metric ${c}"><span class="tileicon">${icon(ic)}</span><div><strong>${n}</strong><small>${label}</small></div></div>`;
function draw(){
 const canvas=el('art');if(!canvas)return;
 const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
 const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;
 const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
 const s=Math.min(width/326,height/189);ctx.translate(width*.58,height*.52);ctx.scale(s,s);
 const iso=(x,y,z)=>[(x-y)*.91,(x+y)*.43-z];
 function line(points,stroke,fill,thick=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}ctx.strokeStyle=stroke;ctx.lineWidth=thick;ctx.stroke();}
 for(let i=-260;i<=260;i+=18){line([iso(i,-260,-59),iso(i,260,-59)],'#78b6c419');line([iso(-260,i,-59),iso(260,i,-59)],'#78b6c419');}
 for(const [z,c,top,side] of [[-40,'#669dd4','#244465','#233950'],[-12,'#76b8d5','#2d536a','#29465c'],[17,'#86e8cd','#34756f','#315c64']]){
 const a=iso(-58,-58,z),b=iso(58,-58,z),d=iso(-58,58,z),v=iso(58,58,z);
 line([d,v,iso(58,58,z-7),iso(-58,58,z-7)],c,side);line([v,b,iso(58,-58,z-7),iso(58,58,z-7)],c,side);
 line([a,b,v,d],c,top,1.8);
 for(let k=-39;k<47;k+=20){line([iso(k,-57,z),iso(k,57,z)],'#b6f5dd32');line([iso(-57,k,z),iso(57,k,z)],'#b6f5dd32');}
 }
 line([iso(-35,-34,17),iso(35,-34,17),iso(35,34,17),iso(-35,34,17)],'#a1f5db','#315966',1.5);
 line([iso(-20,-20,18),iso(19,-20,18),iso(19,19,18),iso(-20,19,18)],'#9df7e0','#507e83');
 for(const [x,y,z,dx,dy] of [[58,0,16,33,-22],[-58,12,-12,-42,-20],[25,59,-40,-8,28]]){const [a,b]=iso(x,y,z);line([[a,b],[a+dx,b+dy],[a+dx+Math.sign(dx)*24,b+dy]],'#88d3d8');ctx.fillStyle='#9ce8d9';ctx.fillRect(a+dx+Math.sign(dx)*24-2,b+dy-2,4,4);}
}
window.addEventListener('resize',draw);
function dashboard(){
 const view=hash()||'dashboard';activate();rail.classList.remove('open');el('menu').setAttribute('aria-expanded','false');
 const stats=exams.map(e=>read(e.code)), count=exams.reduce((n,e)=>n+(e.available?e.count:0),0),attempted=stats.reduce((n,s)=>n+Object.keys(s.items).length,0);
 const titles={dashboard:'Study dashboard',library:'Exam library',bookmarks:'Bookmarks',progress:'My progress'};
 const idx=view.startsWith('track-')?Number(view.slice(6)):-1, title=tracks[idx]?.name||titles[view]||'Study dashboard';
 el('crumb').textContent=title;
 let html=`<h1>${esc(title)}</h1>`;
 if(view==='bookmarks'||view==='progress'){
 html+=`<p class="intro">${view==='progress'?'Review your practice accuracy, timed scores, and domain results.':'Questions you saved, grouped by exam.'}</p>`;
 html+=exams.map((e,i)=>{const s=stats[i],n=view==='bookmarks'?s.bookmarks.length:Object.keys(s.items).length;if(!n&&!s.history.length&&view==='progress'||!n&&view==='bookmarks')return '';return `<a class="panel listing" href="${href(e,view==='bookmarks'?'saved':'review')}"><strong>${e.code}</strong> · ${e.title}<br><small>${n} ${view==='bookmarks'?'bookmarked':'questions attempted'} · ${view==='bookmarks'?'Open saved questions':'View domain results'}</small></a>`;}).join('')||`<p class="empty mt">${view==='bookmarks'?'Use Bookmark during a session to save a question here.':'Complete a practice question or a timed exam to see your progress here.'}</p>`;
 page.innerHTML=html;return;
 }
 const featured=exams.filter(e=>e.available).map(e=>({e,a:read(e.code).active})).filter(x=>x.a).sort((a,b)=>b.a.started-a.a.started)[0];
 const e=featured?.e||exams[0];
 if(view==='dashboard'){
 html+=`<p class="intro">Microsoft certification practice and study guides.</p><section class="hero"><div><div class="eyebrow">${featured?'IN PROGRESS':'START LEARNING'} &nbsp; / &nbsp; ${e.code}</div><h2>${esc(e.title)}</h2><p>${featured?`${featured.a.ids.length}-question ${featured.a.mode==='exam'?'timed exam':'practice session'}`:`${e.count} practice questions across ${e.domains.length} skill domains`}</p><div class="actions">${link(featured?'Resume session':'Open exam',href(e,featured?'session':''),true,'play')}${e.available?link('Study guide',base+e.slug+'/guide.html'):''}</div></div><canvas id="art" aria-hidden="true"></canvas></section><div class="metrics">${stat(exams.length,'Exam banks','book','blue')}${stat(fmt(count),'Practice questions','layers','mint')}${stat(fmt(attempted),'Questions attempted','chart','violet')}</div>`;
 }else html+=`<p class="intro">${tracks[idx]?.desc||'Choose an exam to practice, take a timed assessment, or read its study guide.'}</p>`;
 html+=`<div class="sectionhead"><h2>${view==='dashboard'?'Exam library':'Browse exams'}</h2><label class="searchwrap">${icon('search')}<span class="sr">Search exams</span><input class="search" id="search" placeholder="Search exams…" type="search" value="${esc(filter)}"></label></div><div id="catalog"></div>`;
 page.innerHTML=html;
 function list(){
 const term=filter.trim().toLowerCase();
 const groups=tracks.map((t,i)=>{if(idx>=0&&idx!==i)return '';const subset=exams.filter(e=>e.track===i&&(e.code+' '+e.title+' '+t.name).toLowerCase().includes(term));if(!subset.length)return '';
 return `<section class="${t.color}"><div class="ghead"><i class="swatch"></i><h3>${t.name}</h3><small>${subset.length} exams</small></div><div class="grid">${subset.map(e=>`<a class="card" href="${href(e)}"><div class="row"><span class="tileicon">${icon(e.icon)}</span><span class="code">${e.code}</span></div><h3>${e.title}</h3><div class="footrow"><span>${e.count} questions · ${e.custom?'Custom track':e.domains.length+' domains'}</span>${icon('arrow')}</div></a>`).join('')}</div></section>`;
 }).join('');el('catalog').innerHTML=groups||'<p class="empty">No exams match your search.</p>';}
 list();el('search').oninput=e=>{filter=e.target.value;list();};draw();
}
function tabs(view){return `<nav class="tabs" aria-label="Exam sections">${[['overview','Overview'],['practice','Practice'],['exam','Timed exam'],['review','Review']].map(([k,v])=>`<a href="#${k}" class="${view===k?'on':''}">${v}</a>`).join('')}<a href="guide.html">Study guide ↗</a></nav>`;}
function title(){return `<div class="eyebrow">${esc(tracks[exam.track].short)} &nbsp; / &nbsp; ${exam.code}</div><h1 style="margin-top:8px">${exam.title}</h1>`;}
function domainTable(){return `<div class="tablewrap"><table><thead><tr><th>Skill domain</th><th>${exam.custom?'Custom weight':'Published range'}</th><th>Questions / 40</th></tr></thead><tbody>${exam.domains.map(d=>`<tr><td>${d.name}</td><td>${d.min===d.max?d.min:d.min+'–'+d.max}%</td><td>${sampleCounts[d.name]||0}</td></tr>`).join('')}</tbody></table></div>`;}
let sampleCounts={};
function resume(){return state.active?`<div class="panel"><strong>Session in progress</strong><p>${state.active.ids.length} questions · ${state.active.mode==='exam'?'Timed exam':'Practice or review'}</p><div class="actions">${link('Resume session','#session',true)}${button('End session','end-existing')}</div></div>`:'';}
function overview(){return `${resume()}<div class="metrics">${stat(exam.count,'Practice questions','layers','mint')}${stat(exam.domains.length,'Skill domains','nodes','blue')}${stat(Object.keys(state.items).length,'Questions attempted','chart','violet')}</div><div class="actions">${link('Start practice','#practice',true,'play')}${link('Take timed exam','#exam')}${link('Read study guide','guide.html')}</div><div class="panel"><h2>Exam blueprint</h2><p>${exam.custom?'Custom weights for this independent Exchange deep dive.':'Timed exams use the normalized midpoints of Microsoft’s published ranges, rounded to whole questions.'}</p>${domainTable()}<a class="listing" href="${exam.source}">${exam.custom?'Microsoft hybrid documentation':'Microsoft Learn exam objectives'} ↗</a></div>`;}
function setup(mode){
 if(state.active)return resume();
 if(mode==='exam')return `<div class="panel"><h2>Timed exam</h2><p>Answer 40 questions in 50 minutes. You can revisit any answer until you submit or time expires. Feedback appears after submission.</p><p>The practice score is 1,000 × correct ÷ 40. A score of 700 passes this simulation. Microsoft uses its own scaled scoring model. Multi-select questions require an exact match.</p><div class="actions">${button('Begin timed exam','start-exam',true)}</div></div>${domainTable()}`;
 return `<div class="panel"><h2>Practice session</h2><p>Choose a domain. Single answers show feedback immediately. For multi-select questions, select the requested number and check your answer.</p><div class="formrow"><label>Skill domain<select id="domain"><option value="">All domains</option>${exam.domains.map(d=>`<option>${esc(d.name)}</option>`).join('')}</select></label><label>Session length<select id="length">${[10,20,40,'All'].map(n=>`<option>${n}</option>`).join('')}</select></label></div><div class="actions">${button('Begin practice','start-practice',true)}</div></div>`;}
function review(){
 const items=Object.values(state.items),miss=items.filter(x=>!x.last).length;
 return `${resume()}<div class="layout2"><div class="panel"><h2>Domain weakness tracker</h2><p>Accuracy across graded attempts. Lowest accuracy appears first.</p>${exam.domains.map(d=>{const a=items.filter(x=>x.domain===d.name);const tries=a.reduce((n,x)=>n+x.tries,0),hits=a.reduce((n,x)=>n+x.hits,0);return {name:d.name,tries,hits,pct:tries?Math.round(100*hits/tries):null};}).sort((a,b)=>(a.pct??101)-(b.pct??101)).map(d=>`<div class="mt"><div class="footrow"><strong>${d.name}</strong><span>${d.pct===null?'—':d.pct+'%'}</span></div><div class="bar"><i style="width:${d.pct||0}%"></i></div><small class="muted">${d.tries?d.hits+' correct / '+d.tries+' attempts':'No attempts yet'}</small></div>`).join('')}</div><div class="panel"><h2>Review questions</h2><p>Retry the questions you last missed, or study your bookmarks.</p><div class="actions">${button('Missed ('+miss+')','start-missed',true,!miss||!!state.active)}${link('Bookmarks ('+state.bookmarks.length+')','#saved')}</div></div></div><div class="panel"><h2>Session history</h2>${state.history.map((r,i)=>`<a class="listing" href="#result-${i}">${labelMode(r.mode)} · ${new Date(r.at).toLocaleString()} · ${r.hits}/${r.count}${r.mode==='exam'?' · '+r.score+'/1000':''}</a>`).join('')||'<p>No completed sessions yet.</p>'}</div>`;
}
function labelMode(m){return ({exam:'Timed exam',practice:'Practice',missed:'Missed questions',bookmarks:'Bookmarks'})[m]||'Practice';}
function saved(){return `<div class="panel"><h2>Bookmarked questions</h2><div class="actions">${button('Practice bookmarks','start-bookmarks',true,!state.bookmarks.length||!!state.active)}</div>${state.bookmarks.map(id=>byId.get(id)).filter(Boolean).map(q=>`<details class="listing"><summary>${esc(q.question)}</summary>${feedback(q,[],false)}</details>`).join('')||'<p class="mt">Bookmark a question during practice or an exam to save it here.</p>'}</div>${resume()}`;}
function feedback(q,selected,verdict=true){return `<section class="feedback">${verdict?`<h3 class="${Atlas.isCorrect(selected,q.correctAnswers)?'good':'bad'}">${Atlas.isCorrect(selected,q.correctAnswers)?'Correct answer':selected.length?'Incorrect answer':'Unanswered'}</h3>`:''}<p>${esc(q.explanation.summary)}</p><ol type="A">${q.options.map((o,i)=>`<li><strong>${q.correctAnswers.includes(i)?'Correct · ':''}${esc(o)}</strong>${selected.includes(i)?' · Your selection':''}<br>${esc(q.explanation.options[i])}</li>`).join('')}</ol><a href="guide.html#${q.topicId}">Study ${esc(q.docTopic)} →</a></section>`;}
function runPage(){
 const r=state.active;if(!r)return `<div class="panel"><p>No session in progress.</p>${link('Set up practice','#practice')}</div>`;
 const q=byId.get(r.ids[r.pos]), selected=r.answers[q.id]||[],checked=r.mode!=='exam'&&r.checked[q.id],isExam=r.mode==='exam';
 return `<div class="panel" id="question-panel"><div class="footrow"><span class="step">${esc(labelMode(r.mode).toUpperCase())} &nbsp; ${r.pos+1} / ${r.ids.length}</span>${isExam?'<span class="time" id="clock" aria-label="Time remaining"></span>':`<span class="tag">${q.difficulty}</span>`}</div><div class="bar"><i style="width:${(r.pos+1)/r.ids.length*100}%"></i></div><small class="muted">${esc(q.domain)} · ${q.type==='multi'?'Choose '+q.correctAnswers.length:'Choose one'}</small><h2 class="question">${esc(q.question)}</h2><div class="stack" role="group" aria-label="Answer choices">${q.options.map((o,i)=>`<label class="option ${checked?(q.correctAnswers.includes(i)?'yes':selected.includes(i)?'no':''):''}"><input type="${q.type==='multi'?'checkbox':'radio'}" name="choice" value="${i}" ${selected.includes(i)?'checked':''} ${checked?'disabled':''}><span>${esc(o)}</span></label>`).join('')}</div><div class="actions">${button(state.bookmarks.includes(q.id)?'Remove bookmark':'Bookmark','bookmark')}${q.type==='multi'&&!isExam&&!checked?button('Check answer','check',true,selected.length!==(q.type==='multi'?q.correctAnswers.length:1)):''}</div>${checked?feedback(q,selected):''}<div class="actions">${button('Previous','prev',false,r.pos===0)}${r.pos<r.ids.length-1?button('Next','next',true,!isExam&&!checked):''}${isExam||r.pos===r.ids.length-1?button(isExam?'Submit exam':'Finish session','submit',true,!isExam&&!checked):''}${link('Save & exit','#overview')}</div>${isExam?`<div class="formrow"><label>Jump to question<select id="jump">${r.ids.map((id,i)=>`<option value="${i}" ${i===r.pos?'selected':''}>${i+1} · ${(r.answers[id]||[]).length?'Answered':'Unanswered'}</option>`).join('')}</select></label></div>`:''}</div>`;}
function results(i){const r=state.history[i];if(!r)return review();return `<div class="panel"><div class="eyebrow">${labelMode(r.mode)} results</div><div class="resultscore">${r.mode==='exam'?r.score+' / 1000':r.hits+' / '+r.count}</div><h2>${r.mode==='exam'?(r.score>=700?'Pass':'Below passing score'):'Session complete'}</h2><p>${r.hits} correct out of ${r.count} questions.</p><div class="actions">${link('Domain results','#review')}${link('Practice again','#practice',true)}</div></div><div class="panel"><h2>Answer review</h2>${r.rows.map((x,i)=>{const q=byId.get(x.id);return q?`<details class="listing"><summary>${i+1}. ${x.hit?'Correct':'Missed'} · ${esc(q.question)}</summary>${feedback(q,x.selected)}</details>`:'';}).join('')}</div>`;}
function end(){finish(state,byId);save();location.hash='result-0';renderExam();}
function tick(){const r=state.active;if(r?.mode!=='exam')return;if(Date.now()>=r.deadline){end();return;}const sec=Math.ceil((r.deadline-Date.now())/1000);if(el('clock'))el('clock').textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
function renderExam(){
 let view=hash()||'overview';clearInterval(clock);
 if(state.active?.mode==='exam'){if(Date.now()>=state.active.deadline){end();return;}clock=setInterval(tick,500);}
 let content=view==='session'?runPage():view==='saved'?saved():view.startsWith('result-')?results(Number(view.slice(7))):view==='review'?review():['practice','exam'].includes(view)?setup(view):overview();
 page.innerHTML=title()+tabs(view==='saved'||view.startsWith('result-')?'review':view)+content;tick();
}
function start(mode){
 if(state.active)return;let pool=bank;
 if(mode==='missed')pool=bank.filter(q=>state.items[q.id]?.last===false);
 if(mode==='bookmarks')pool=bank.filter(q=>state.bookmarks.includes(q.id));
 if(mode==='practice'&&el('domain').value)pool=bank.filter(q=>q.domain===el('domain').value);
 const n=mode==='practice'?Number(el('length').value)||pool.length:pool.length;
 const ids=(mode==='exam'?weighted(bank,exam.domains,40):shuffled(pool).slice(0,n)).map(q=>q.id);
 if(!ids.length)return;
 const now=Date.now();state.active={mode,started:now,deadline:mode==='exam'?now+50*60000:null,ids,pos:0,answers:{},checked:{}};
 save();location.hash='session';renderExam();
}
page.addEventListener('change',ev=>{
 if(!state?.active)return;const r=state.active;if(r.mode==='exam'&&Date.now()>=r.deadline){end();return;}
 if(ev.target.id==='jump'){r.pos=Number(ev.target.value);save();renderExam();return;}
 if(ev.target.name!=='choice')return;
 const q=byId.get(r.ids[r.pos]);r.answers[q.id]=Array.from(page.querySelectorAll('input[name="choice"]:checked'),x=>Number(x.value));
 if(r.mode!=='exam'&&q.type==='single'&&!r.checked[q.id]){record(state,q,r.answers[q.id]);r.checked[q.id]=true;save();renderExam();return;}
 if(r.mode==='exam'){const jump=el('jump');if(jump)jump.options[r.pos].textContent=(r.pos+1)+' · '+(r.answers[q.id].length?'Answered':'Unanswered');}
 save();const check=page.querySelector('[data-act="check"]');if(check)check.disabled=r.answers[q.id].length!==q.correctAnswers.length;
});
page.addEventListener('click',ev=>{
 const action=ev.target.closest('[data-act]')?.dataset.act;if(!action)return;
 const r=state.active;if(r?.mode==='exam'&&Date.now()>=r.deadline){end();return;}
 if(action.startsWith('start-')){start(action.slice(6));return;}
 if(action==='submit'||action==='end-existing'){
 if(action==='end-existing'&&r.mode!=='exam'){
 if(!confirm('End this practice session? Checked answers will be kept.'))return;
 r.ids=r.ids.filter(id=>r.checked[id]);if(!r.ids.length){state.active=null;save();renderExam();return;}
 }else if(r.mode==='exam'&&!confirm('Submit this exam now? Unanswered questions count as incorrect.'))return;
 end();return;}
 if(!r)return;const q=byId.get(r.ids[r.pos]);
 if(action==='bookmark'){state.bookmarks=state.bookmarks.includes(q.id)?state.bookmarks.filter(x=>x!==q.id):[...state.bookmarks,q.id];}
 if(action==='check'&&!r.checked[q.id]){record(state,q,r.answers[q.id]||[]);r.checked[q.id]=true;}
 if(action==='next'||action==='prev')r.pos=Math.max(0,Math.min(r.ids.length-1,r.pos+(action==='next'?1:-1)));
 save();renderExam();if(action==='prev'||action==='next')el('question-panel')?.scrollIntoView({block:'start'});
});
function initGuide(){
 const input=el('guide-search');if(!input)return;
 const filterGuide=()=>{const query=input.value.trim().toLowerCase();let total=0;page.querySelectorAll('[data-section]').forEach(s=>{let n=0;s.querySelectorAll('[data-entry]').forEach(item=>{const show=!query||item.textContent.toLowerCase().includes(query);item.hidden=!show;if(show)n++;});s.hidden=!n;total+=n;});el('guide-count').textContent=query?total+' matching entries':'';};
 input.oninput=filterGuide;
}
window.addEventListener('storage',()=>{if(exam&&!guide&&bank.length){state=read(exam.code);renderExam();}else if(!exam){dashboard();}});
async function init(){
 try{
 if(guide){initGuide();return;}if(!exam){dashboard();return;}
 if(!exam.available){page.innerHTML=title()+'<p class="panel">This bank is scheduled for a later build phase.</p>';return;}
 const response=await fetch('questions.json');if(!response.ok)throw Error();bank=await response.json();byId=new Map(bank.map(q=>[q.id,q]));weighted(bank,exam.domains,40).forEach(q=>sampleCounts[q.domain]=(sampleCounts[q.domain]||0)+1);
 renderExam();
 }catch{page.innerHTML='<h1>Bank unavailable</h1><p class="panel">Open the site on GitHub Pages or a local HTTP server. Reload once online to download the question bank.</p>';}
}
window.addEventListener('hashchange',()=>{if(guide)return;if(!exam){filter='';dashboard();}else if(bank.length)renderExam();window.scrollTo(0,0);});
if('serviceWorker' in navigator){navigator.serviceWorker.register(base+'sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{el('offline').classList.add('ready');el('offline').lastElementChild.textContent='Offline ready';}).catch(()=>{el('offline').lastElementChild.textContent='Offline cache unavailable';});}else el('offline').lastElementChild.textContent='Online session';
init();
})();
