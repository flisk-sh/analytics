// The cabinet pages, in the Ledger look. The pages are shells; the numbers come from /api/* in the browser.
import { CSS } from './css.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,800&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">';
// Only the public landing page carries social metadata; the signed-in cabinet pages stay private.
const SITE_URL = 'https://analytics.flisk.si/';
const SEO_META = {
  canonical: SITE_URL,
  og: { title: 'Flisk Analytics', description: 'Cookieless web analytics for the Flisk sites.', url: SITE_URL, image: 'https://flisk.si/og.png' },
  twitter: { card: 'summary_large_image' },
};
const SEO = [
  `<link rel="canonical" href="${SEO_META.canonical}">`,
  ...Object.entries(SEO_META.og).map(([k, v]) => `<meta property="og:${k}" content="${v}">`),
  `<meta name="twitter:card" content="${SEO_META.twitter.card}">`,
].join('');

const GH = '<svg class="i" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';

export function layout(title, body, script = '', meta = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f5e4"><meta name="theme-color" content="#f7f5e4" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#161614" media="(prefers-color-scheme: dark)"><script defer data-domain="analytics.flisk.si" src="https://flisk.sh/a.js"></script><meta name="robots" content="noindex"><title>${esc(title)}</title>${meta}${FONTS}<style>${CSS}</style><script src="https://flisk.si/assets/bar.js" defer></script></head><body><a class="skip-link" href="#main">Skip to content</a>${body}${script ? `<script>${script}</script>` : ''}</body></html>`;
}

const LOGO = '<a class="logo" href="/"><span class="mk">&gt;_</span><span>flisk</span><small>Growth</small></a>';

function shell(login, active, inner) {
  const nav = [['Sites', '/'], ['API keys', '/tokens']].map(([n, h]) => `<a href="${h}" class="${n === active ? 'on' : ''}">${n}</a>`).join('');
  return `<div class="frame"><header class="top">${LOGO}<nav>${nav}</nav><form class="me" method="post" action="/logout" style="margin:0"><span class="m">${esc(login)}</span><button class="av" title="Sign out" style="border:0;cursor:pointer">${esc(login[0].toUpperCase())}</button></form></header><main id="main">${inner}</main></div>`;
}

export function loginPage(error = '') {
  const side = '<aside class="lside"><div class="big">0</div><div class="m">Cookies set on your visitors</div><div><div class="li"><b>01</b><span>No cookies, no consent banner</span></div><div class="li"><b>02</b><span>One script tag, under 1 KB</span></div><div class="li"><b>03</b><span>Same GitHub login as chat, fleet, inference</span></div></div></aside>';
  const note = error ? `<p style="color:var(--dn)">${esc(error)}</p>` : '<p>Sign in with GitHub to see your visitors. One login works across all Flisk sites, and we only read your GitHub name.</p>';
  return layout('Sign in · Flisk Analytics', `<div class="frame"><main id="main" class="login"><div class="lc">${LOGO}<h1>Know who comes to your site.</h1>${note}<a class="gbtn" href="/auth/login">${GH}Continue with GitHub</a><small>Visitors are counted without cookies.</small></div>${side}</main></div>`, '', SEO);
}

export function messagePage(title, text, login = '') {
  const inner = `<div class="err"><h1>${esc(title)}</h1><p>${esc(text)}</p><p><a class="btn" href="/">Back</a></p></div>`;
  return layout(title, login ? shell(login, '', inner) : `<div class="frame"><main id="main">${inner}</main></div>`);
}

const SITES_JS = `
var grid=document.getElementById('grid'),q=document.getElementById('q'),all=[];
function fmt(n){return n.toLocaleString('en-US')}
function spark(d){var w=300,h=50,m=Math.max.apply(null,d)||1,p=d.map(function(v,i){return [2+i*(w-4)/(d.length-1),3+(h-6)*(1-v/(m*1.12))]});
var l='M'+p.map(function(x){return x[0].toFixed(1)+','+x[1].toFixed(1)}).join(' L'),a=l+' L'+p[p.length-1][0]+','+(h-3)+' L2,'+(h-3)+' Z',e=p[p.length-1];
return '<svg class="ch" viewBox="0 0 '+w+' '+h+'"><path class="ar" d="'+a+'" fill="#16a34a" fill-opacity=".14"/><path class="ln" d="'+l+'"/><circle class="dot" cx="'+e[0]+'" cy="'+e[1]+'" r="3.5"/></svg>'}
function ask(s,l){return 'Add '+l.name+' ('+l.code+') to '+s.domain+'. '+l.v+' visitors in the last 30 days browse in '+l.name+' (Flisk Analytics, Visitor languages). Find the site repo, add the '+l.name+' translation under /'+l.code+'/ with hreflang links, keep English as the default, and open a PR.'}
function langs(s){if(!s.add||!s.add.length)return '';return '<div class="sl"><span class="m">Add</span>'+s.add.map(function(l){return '<a class="lng" target="_blank" rel="noopener" title="'+l.v+' visitors, 30d. Opens Claude with a ready prompt" href="https://claude.ai/new?q='+encodeURIComponent(ask(s,l))+'"><b>'+l.flag+'</b> '+l.name+' <small>'+l.v+'</small></a>'}).join('')+'</div>'}
function card(s){var up=s.change==null||s.change>=0;return '<div class="sc"><a class="sca" href="/site/'+s.domain+'"><div class="sch"><em class="fav" data-l="'+s.domain[0].toUpperCase()+'"><img src="https://'+s.domain+'/favicon.ico" alt="" width="20" height="20" loading="lazy" style="border-radius:inherit" onerror="this.parentNode.textContent=this.parentNode.dataset.l"></em><span>'+s.domain+'</span></div><div class="spk">'+spark(s.days)+'</div><div class="scn"><b>'+fmt(s.total)+'</b><span>visitors · 30d</span>'+(s.change==null?'':'<i class="kd '+(up?'up':'dn')+'">'+(up?'↗ ':'↘ ')+Math.abs(s.change)+'%</i>')+'</div></a>'+langs(s)+'</div>'}
function draw(){var t=q.value.toLowerCase(),list=all.filter(function(s){return s.domain.indexOf(t)>-1});
grid.innerHTML=list.map(card).join('')+(t&&!list.length?'<div class="empty" style="grid-column:1/-1">No sites match "'+t.replace(/[&<>"]/g,function(c){return '&#'+c.charCodeAt(0)+';'})+'"</div>':'')+'<a class="sc add" href="/new"><div>+<br>Add website</div></a>';
document.getElementById('sum').textContent=all.length+' site'+(all.length==1?'':'s')+' · '+fmt(all.reduce(function(a,s){return a+s.total},0))+' visitors in the last 30 days'}
q.oninput=draw;
fetch('/api/sites').then(function(r){return r.json()}).then(function(j){all=j.sites;draw()}).catch(function(){grid.innerHTML='<div class="empty">Could not load the numbers. Reload in a minute.</div>'});
`;

export function sitesPage(login) {
  const inner = `<div class="ph"><div><div class="m" style="color:var(--dim);margin-bottom:10px">Growth / Analytics</div><h1>Your sites</h1><p class="sub" id="sum">Loading…</p></div><a class="btn p" href="/new">+ Add website</a></div><div class="tools"><div class="srch m"><input id="q" placeholder="Search sites" style="border:0;background:none;font:inherit;text-transform:inherit;letter-spacing:inherit;outline:0;width:100%"></div></div><div class="sgrid" id="grid"><div class="empty">Loading…</div></div>`;
  return layout('Sites · Flisk Analytics', shell(login, 'Sites', inner), SITES_JS);
}

export function newSitePage(login, error = '') {
  const inner = `<div class="ph"><div><div class="m" style="color:var(--dim);margin-bottom:10px">Growth / Analytics / New</div><h1>Add a website</h1><p class="sub">The domain only, like flisk.sh. You get the install steps next.</p></div></div><div class="cwrap"><form class="form" method="post" action="/sites"><input name="domain" placeholder="flisk.sh" autocomplete="off" autofocus required><button>Add website</button></form>${error ? `<p style="color:var(--dn)">${esc(error)}</p>` : ''}</div>`;
  return layout('Add a website · Flisk Analytics', shell(login, 'Sites', inner));
}

const DASH_JS = `
var SITE=window.__SITE,Q=new URLSearchParams(location.search),range=Q.get('r')||'30d',from=+Q.get('from')||0,to=+Q.get('to')||0,by=Q.get('by')||'',metric='v',data={},tabState={},cur=null,logs=[],logKind='';
var DEFS=[{tabs:[['Channels','channels'],['Sources','sources'],['Campaigns','campaigns'],['Themes','themes']]},{tabs:[['Top pages','pages'],['Link clicks','links']]},{tabs:[['Countries','countries'],['Regions','regions'],['Cities','cities'],['Visitor languages','visitorlangs'],['Add a language','languages']]},{tabs:[['Browsers','browsers'],['Operating systems','os'],['Devices','devices']]}];
var HEAD={channels:'Channel',sources:'Source',campaigns:'Campaign',themes:'Theme',pages:'Page',links:'Link',countries:'Country',regions:'Region',cities:'City',visitorlangs:'Language',languages:'Language',browsers:'Browser',os:'Operating system',devices:'Device'};
var ML={v:'Visitors',vs:'Visits',pv:'Pageviews'},STEP_MS={hour:3600000,day:86400000,week:604800000},geo={};
function fmt(n){return n==null?'—':n.toLocaleString('en-US')}
function dur(s){if(s==null)return '—';var m=Math.floor(s/60);return m?m+'m '+(s%60)+'s':s+'s'}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function qs(){return 'range='+encodeURIComponent(range)+(from?'&from='+from+'&to='+to:'')+(by?'&by='+by:'')}
function when(t){return new Date(t.replace(' ','T')+'Z')}
function lab(t,step,long){var d=when(t);
if(step==='hour')return d.toLocaleString('en-US',long?{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZoneName:'short'}:{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
if(step==='week')return (long?'Week of ':'')+d.toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
return d.toLocaleDateString('en-US',long?{weekday:'short',month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}:{month:'short',day:'numeric',timeZone:'UTC'})}
function delta(c,p,inv){if(!p)return '';var d=Math.round((c-p)/p*100),good=inv?d<=0:d>=0;return '<i class="kd '+(good?'up':'dn')+'">'+(d>=0?'↗ ':'↘ ')+Math.abs(d)+'%</i>'}
function kpis(o){var c=o.current,p=o.previous,K=[['Unique visitors',fmt(c.visitors),delta(c.visitors,p.visitors),'v'],['Total visits',fmt(c.visits),delta(c.visits,p.visits),'vs'],['Pageviews',fmt(c.pageviews),delta(c.pageviews,p.pageviews),'pv'],['Views / visit',c.viewsPerVisit||'—',delta(c.viewsPerVisit,p.viewsPerVisit),''],['Bounce rate',c.bounceRate==null?'—':c.bounceRate+'%','',''],['Visit duration',dur(c.duration),'','']];
return K.map(function(k){return '<div class="k'+(k[3]===metric?' on':'')+(k[3]?' pick':'')+'"'+(k[3]?' data-m="'+k[3]+'" title="Show '+ML[k[3]].toLowerCase()+' on the chart"':'')+'><span class="kl">'+k[0]+'</span><b class="kv">'+k[1]+'</b>'+k[2]+'</div>'}).join('')}
function toolbar(o){var f=o.series[0],l=o.series[o.series.length-1],st=o.step,zoomed=!!from;
var iv=['hour','day','week'].map(function(s){return '<a data-by="'+s+'" class="'+(s===st?'on':'')+'">'+s+'</a>'}).join('');
return '<span class="m">'+ML[metric]+' per '+st+' · '+lab(f.t,st)+' – '+lab(l.t,st)+'</span><span class="cg"><span class="m hint">Drag on the chart to zoom</span><span class="seg iv">'+iv+'</span>'+(zoomed?'<a class="rz" id="rz">Reset zoom</a>':'')+'</span>'}
function chart(series,step){var w=1190,h=320,l=40,r=10,t=12,b=26,n=series.length,v=series.map(function(s){return s[metric]}),tot=v.reduce(function(a,x){return a+x},0),st=Math.max(1,Math.ceil((Math.max.apply(null,v)||0)*1.12/4)),mx=st*4;
geo={w:w,h:h,l:l,r:r,t:t,b:b,mx:mx};
function X(i){return l+i*(w-l-r)/Math.max(n-1,1)}function Y(x){return t+(h-t-b)*(1-x/mx)}
var s='<svg class="ch" id="svg" viewBox="0 0 '+w+' '+h+'">';
for(var k=0;k<5;k++){var y=t+(h-t-b)*k/4;s+='<line class="grid" x1="'+l+'" x2="'+(w-r)+'" y1="'+y+'" y2="'+y+'"/><text class="ax" x="'+(l-8)+'" y="'+(y+4)+'" text-anchor="end">'+st*(4-k)+'</text>'}
var nl=Math.min(6,n);for(var k=0;k<nl;k++){var i=Math.round(k*(n-1)/Math.max(nl-1,1));s+='<text class="ax" x="'+X(i)+'" y="'+(h-6)+'" text-anchor="'+(k==0?'start':k==nl-1?'end':'middle')+'">'+lab(series[i].t,step)+'</text>'}
var p=v.map(function(x,i){return [X(i),Y(x)]}),d='M'+p.map(function(x){return x[0].toFixed(1)+','+x[1].toFixed(1)}).join(' L'),e=p[p.length-1];
s+='<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s1"/><stop offset="1" class="s2"/></linearGradient></defs><path class="ar" d="'+d+' L'+e[0]+','+(h-b)+' L'+p[0][0]+','+(h-b)+' Z" fill="url(#g)"/><path class="ln" d="'+d+'"/><circle class="dot" cx="'+e[0]+'" cy="'+e[1]+'" r="4"/>';
if(!tot)s+='<text class="ax" x="'+(w/2)+'" y="'+(h/2)+'" text-anchor="middle">No '+ML[metric].toLowerCase()+' in this window</text>';
return s+'<rect id="sel" class="sel" x="0" y="'+t+'" width="0" height="'+(h-t-b)+'" style="display:none"/><line id="xh" class="xh" x1="0" x2="0" y1="'+t+'" y2="'+(h-b)+'" style="display:none"/><circle id="xd" class="dot" r="5" cx="0" cy="0" style="display:none"/></svg>'}
function bind(series,step){var svg=document.getElementById('svg'),tip=document.getElementById('tip'),box=document.getElementById('cbox'),n=series.length,g=geo,drag=null;
function X(i){return g.l+i*(g.w-g.l-g.r)/Math.max(n-1,1)}
function idx(e){var b=svg.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*g.w,i=Math.round((x-g.l)/(g.w-g.l-g.r)*(n-1));return Math.max(0,Math.min(n-1,i))}
function hide(){tip.style.display='none';document.getElementById('xh').style.display='none';document.getElementById('xd').style.display='none'}
svg.onpointermove=function(e){var i=idx(e),s=series[i],x=X(i),y=g.t+(g.h-g.t-g.b)*(1-s[metric]/g.mx),xh=document.getElementById('xh'),xd=document.getElementById('xd');
xh.setAttribute('x1',x);xh.setAttribute('x2',x);xh.style.display='';xd.setAttribute('cx',x);xd.setAttribute('cy',y);xd.style.display='';
if(drag){var a=Math.min(drag.i,i),z=Math.max(drag.i,i),sel=document.getElementById('sel');sel.setAttribute('x',X(a));sel.setAttribute('width',X(z)-X(a));sel.style.display=''}
var rows=['v','vs','pv'].map(function(m){return '<div class="tr'+(m===metric?' on':'')+'"><span>'+ML[m]+'</span><b>'+fmt(s[m])+'</b></div>'}).join('');
tip.innerHTML='<div class="tt">'+lab(s.t,step,true)+'</div>'+rows+(drag?'':'<div class="th2">Drag to zoom</div>');tip.style.display='block';
var bb=box.getBoundingClientRect(),lx=e.clientX-bb.left+16,ly=e.clientY-bb.top-tip.offsetHeight/2;if(lx+tip.offsetWidth>bb.width-8)lx=e.clientX-bb.left-tip.offsetWidth-16;tip.style.left=Math.max(8,lx)+'px';tip.style.top=Math.max(8,ly)+'px'};
svg.onpointerdown=function(e){drag={i:idx(e)};try{svg.setPointerCapture(e.pointerId)}catch(x){}};
svg.onpointerup=function(e){if(!drag)return;var a=Math.min(drag.i,idx(e)),z=Math.max(drag.i,idx(e));drag=null;document.getElementById('sel').style.display='none';if(z>a)zoom(series[a].t,series[z].t,step)};
svg.onpointerleave=function(){if(!drag)hide()};svg.onpointercancel=function(){drag=null;hide()};
svg.ondblclick=function(){if(from)resetZoom()}}
function zoom(t0,t1,step){from=when(t0).getTime();to=when(t1).getTime()+STEP_MS[step];by='';reload()}
function resetZoom(){from=to=0;by='';reload()}
function rows(list,key){if(!list||!list.length)return '<div class="empty" style="padding:18px 0">'+(key==='links'?'No link clicks yet. Links that leave the site and file downloads show up here.':'No data yet')+'</div>';var m=list[0].v;return list.map(function(x){return '<div class="r"><i class="fill" style="width:'+(x.v/m*100).toFixed(0)+'%"></i><span class="rl"><em class="ic">'+esc(x.k[0]||'?').toUpperCase()+'</em>'+esc(x.k)+(x.n?'<small class="m" style="color:var(--dim);margin-left:4px">'+esc(x.n)+'</small>':'')+'</span><span class="rv">'+fmt(x.v)+'</span></div>'}).join('')}
function keyOf(i){return tabState[i]||DEFS[i].tabs[0][1]}
function panel(i){var D=DEFS[i],key=keyOf(i),tabs=D.tabs.map(function(t){return '<a data-p="'+i+'" data-k="'+t[1]+'" class="'+(t[1]===key?'on':'')+'">'+t[0]+'</a>'}).join('');
return '<header class="tabs">'+tabs+'</header><div class="th"><span>'+HEAD[key]+'</span><span>'+(key==='links'?'Clicks':'Visitors')+'</span></div>'+(data[key]?rows(data[key],key):'<div class="empty skel" style="padding:18px 0">Loading…</div>')}
function drawPanels(){for(var i=0;i<4;i++)document.getElementById('p'+i).innerHTML=panel(i)}
function load(parts){return fetch('/api/stats?site='+encodeURIComponent(SITE)+'&'+qs()+'&parts='+parts.join(',')).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){for(var k in j.panels)data[k]=j.panels[k];return j})}
function drawChart(){if(!cur)return;document.getElementById('kpis').innerHTML=kpis(cur);document.getElementById('ctool').innerHTML=toolbar(cur);document.getElementById('chart').innerHTML=chart(cur.series,cur.step);bind(cur.series,cur.step)}
function head(j){cur=j;document.getElementById('live').textContent=j.live+' current visitor'+(j.live==1?'':'s');drawChart()}
function fail(){document.getElementById('chart').innerHTML='<div class="empty">Could not load the numbers. Reload in a minute.</div>'}
function sync(){var u=new URL(location.href);['from','to','by'].forEach(function(k){u.searchParams.delete(k)});u.searchParams.set('r',range);if(from){u.searchParams.set('from',from);u.searchParams.set('to',to)}if(by)u.searchParams.set('by',by);history.replaceState(null,'',u);
document.querySelectorAll('.seg.rg a').forEach(function(a){a.className=!from&&a.dataset.r===range?'on':''})}
function reload(){data={};sync();document.getElementById('chart').classList.add('skel');var parts=[0,1,2,3].map(keyOf);drawPanels();load(parts).then(function(j){document.getElementById('chart').classList.remove('skel');head(j);drawPanels()}).catch(fail)}
document.querySelectorAll('.seg.rg a').forEach(function(a){a.onclick=function(){range=a.dataset.r;from=to=0;by='';reload()}});
document.addEventListener('click',function(e){var t=e.target,a=t.closest('.tabs a[data-p]');
if(a){var i=+a.dataset.p,k=a.dataset.k;tabState[i]=k;drawPanels();if(!data[k])load([k]).then(drawPanels).catch(function(){});return}
var m=t.closest('.k[data-m]');if(m){metric=m.dataset.m;drawChart();return}
var b=t.closest('[data-by]');if(b){by=b.dataset.by;reload();return}
if(t.closest('#rz')){resetZoom();return}
var lk=t.closest('[data-lk]');if(lk){logKind=lk.dataset.lk;loadLogs()}});
function ago(d){var s=Math.max(0,Math.round((Date.now()-d)/1000));return s<60?s+'s ago':s<3600?Math.floor(s/60)+'m ago':s<86400?Math.floor(s/3600)+'h ago':Math.floor(s/86400)+'d ago'}
function drawLogs(){var tabs=[['','All events'],['pageview','Pageviews'],['click','Link clicks']].map(function(x){return '<a data-lk="'+x[0]+'" class="'+(x[0]===logKind?'on':'')+'">'+x[1]+'</a>'}).join('');
var body=logs.length?logs.map(function(x){var d=new Date(x.t),place=[x.city,x.country].filter(Boolean).join(', ')||'—',what=x.kind==='click'?'<b>→ '+esc(x.target)+'</b> <small>on '+esc(x.path)+'</small>':esc(x.path||'/');
return '<div class="lg"><span class="lt">'+d.toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})+' <small>'+ago(d)+'</small></span><span><em class="bd '+x.kind+'">'+(x.kind==='click'?'Click':'View')+'</em></span><span class="lw">'+what+'</span><span>'+esc(x.source||'—')+'</span><span>'+esc(place)+'</span><span>'+esc([x.browser,x.os].filter(Boolean).join(' · ')||'—')+'</span></div>'}).join(''):'<div class="empty">No events in the last 7 days.</div>';
document.getElementById('logs').innerHTML='<header class="tabs ltabs">'+tabs+'<span class="exp m">Live · newest first · local time</span></header><div class="lgw"><div class="lg lh"><span>Time</span><span>Event</span><span>Page / link</span><span>Source</span><span>Place</span><span>Device</span></div>'+body+'</div>'}
function loadLogs(){fetch('/api/logs?site='+encodeURIComponent(SITE)+'&limit=100&kind='+logKind).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){logs=j.events;drawLogs()}).catch(function(){document.getElementById('logs').innerHTML='<div class="empty">Could not load the log. Reload in a minute.</div>'})}
sync();drawPanels();load([0,1,2,3].map(keyOf)).then(function(j){head(j);drawPanels()}).catch(fail);
loadLogs();setInterval(function(){if(document.visibilityState==='visible')loadLogs()},30000);
`;

export function dashboardPage(login, site) {
  const seg = [['today', 'Today'], ['7d', '7D'], ['30d', '30D'], ['12m', '12M']].map(([r, n]) => `<a data-r="${r}">${n}</a>`).join('');
  const inner = `<div class="dh"><div class="dl"><a class="sw" href="/">← Sites</a><a class="sw" href="https://${esc(site)}" target="_blank" rel="noopener" title="Open ${esc(site)}"><em class="fav" data-l="${esc(site[0].toUpperCase())}"><img src="https://${esc(site)}/favicon.ico" alt="" width="20" height="20" style="border-radius:inherit" onerror="this.parentNode.textContent=this.parentNode.dataset.l"></em>${esc(site)} <span aria-hidden="true">↗</span></a><span class="live"><i></i><span id="live">… current visitors</span></span></div><div class="dr"><a class="ctl" href="/site/${esc(site)}/install">Install</a><div class="seg rg">${seg}</div></div></div><div class="kpis" id="kpis"><div class="k on"><span class="kl">Unique visitors</span><b class="kv">…</b></div></div><div class="cbox" id="cbox"><div class="ctool" id="ctool"></div><div id="chart"><div class="empty skel">Loading…</div></div><div class="tip" id="tip"></div></div><div class="panels">${[0, 1, 2, 3].map((i) => `<section class="panel" id="p${i}"></section>`).join('')}</div><section class="logs" id="logs"><div class="empty skel">Loading the log…</div></section>`;
  return layout(`${site} · Flisk Analytics`, shell(login, 'Sites', inner), `window.__SITE=${JSON.stringify(site)};${DASH_JS}`);
}

const SCRIPT_ORIGIN = 'https://flisk.sh';
export const snippets = (site) => ({
  html: `<script defer data-domain="${site}" src="${SCRIPT_ORIGIN}/a.js"></script>`,
  jekyllRun: `curl -fsSL ${SCRIPT_ORIGIN}/install/jekyll | sh -s -- ${site}`,
  jekyllInclude: `<!-- _includes/flisk-analytics.html -->\n<script defer data-domain="${site}" src="${SCRIPT_ORIGIN}/a.js"></script>`,
  jekyllLayout: '<!-- _layouts/default.html, inside <head> -->\n{% include flisk-analytics.html %}',
  next: `// app/layout.tsx\nimport Script from 'next/script'\n// inside <head> or <body>:\n<Script defer data-domain="${site}" src="${SCRIPT_ORIGIN}/a.js" />`,
  worker: `// in the HTML your Worker returns, inside <head>:\n<script defer data-domain="${site}" src="${SCRIPT_ORIGIN}/a.js"></script>`,
});

const code = (t) => `<div class="code"><span class="cp" data-copy>Copy</span><pre>${esc(t)}</pre></div>`;

const INSTALL_JS = `
document.querySelectorAll('.ctabs a').forEach(function(a){a.onclick=function(){document.querySelectorAll('.ctabs a').forEach(function(x){x.classList.toggle('on',x===a)});document.querySelectorAll('[data-tab]').forEach(function(p){p.hidden=p.dataset.tab!==a.dataset.t})}});
document.addEventListener('click',function(e){var c=e.target.closest('[data-copy]');if(!c)return;navigator.clipboard.writeText(c.parentNode.querySelector('pre').textContent);c.textContent='Copied';setTimeout(function(){c.textContent='Copy'},1200)});
var SITE=window.__SITE,tries=0,box=document.getElementById('wait');
function poll(){tries++;fetch('/api/stats?site='+encodeURIComponent(SITE)+'&range=today&parts=').then(function(r){return r.json()}).then(function(j){if(j.current&&j.current.pageviews>0){box.innerHTML='<span class="pulse"></span><div><b>First pageview received</b><small>'+j.current.pageviews+' so far today.</small></div><a class="btn" href="/site/'+SITE+'">Open dashboard</a>';return}if(tries<30)setTimeout(poll,10000)}).catch(function(){if(tries<30)setTimeout(poll,10000)})}
poll();
`;

export function installPage(login, site) {
  const s = snippets(site);
  const steps = '<div class="steps"><div class="st done"><b>✓</b>Add site<span>' + esc(site) + '</span></div><div class="st on"><b>2</b>Install</div><div class="st"><b>3</b>Verify</div></div>';
  const tab = (id, inner, on) => `<div data-tab="${id}"${on ? '' : ' hidden'}>${inner}</div>`;
  const jekyll = `<h3>One command</h3><p>Adds the include and the head line. Safe to run twice.</p>${code(`# in your Jekyll repo\n${s.jekyllRun}`)}<h3>Or by hand</h3><p>1. Create the include</p>${code(s.jekyllInclude)}<p>2. Add it to your layout</p>${code(s.jekyllLayout)}`;
  const body = `<div class="card"><div class="ctabs"><a class="on" data-t="jekyll">Jekyll</a><a data-t="html">HTML</a><a data-t="next">Next.js</a><a data-t="worker">Cloudflare Worker</a></div><div class="cbody">${tab('jekyll', jekyll, true)}${tab('html', `<h3>Add one line</h3><p>Inside the head of every page.</p>${code(s.html)}`)}${tab('next', `<h3>Next.js</h3><p>Add the script once in the root layout.</p>${code(s.next)}`)}${tab('worker', `<h3>Cloudflare Worker</h3><p>Add the line to the page your Worker returns.</p>${code(s.worker)}`)}</div></div>`;
  const wait = '<aside class="wait" id="wait"><span class="pulse"></span><div><b>Listening for the first pageview</b><small>Open ' + esc(site) + ' in another tab. It shows up here within a minute.</small></div><a class="btn" href="/site/' + esc(site) + '">Skip to dashboard</a></aside>';
  const inner = `<div class="ph"><div><div class="m" style="color:var(--dim);margin-bottom:10px">Growth / Analytics / ${esc(site)}</div><h1>Install the script</h1><p class="sub">Two minutes. No cookies, no consent banner.</p></div></div><div class="inst">${steps}<div class="cwrap">${body}${wait}</div></div>`;
  return layout(`Install ${site} · Flisk Analytics`, shell(login, 'Sites', inner), `window.__SITE=${JSON.stringify(site)};${INSTALL_JS}`);
}

export function tokensPage(login, tokens, fresh = null) {
  const origin = 'https://analytics.flisk.si';
  const when = (ms) => new Date(ms).toISOString().slice(0, 10);
  const made = fresh ? `<div class="card" style="margin-bottom:24px"><div class="cbody"><h3>Your new key</h3><p>Copy it now. It is not shown again.</p>${code(fresh.token)}<h3>Add it to Claude Code</h3>${code(`claude mcp add --transport http flisk-analytics ${origin}/mcp --header "Authorization: Bearer ${fresh.token}"`)}</div></div>` : '';
  const rows = tokens.length ? tokens.map((t) => `<form method="post" action="/tokens" style="display:flex;gap:16px;align-items:center;padding:12px 0;border-top:1px solid var(--rule,#d8d4bd)"><b style="flex:1">${esc(t.label)}</b><span class="m" style="color:var(--dim)">${when(t.created)}</span><button class="btn" name="revoke" value="${esc(t.id)}">Revoke</button></form>`).join('') : '<div class="empty" style="padding:18px 0">No keys yet</div>';
  const inner = `<div class="ph"><div><div class="m" style="color:var(--dim);margin-bottom:10px">Growth / Analytics / API keys</div><h1>API keys</h1><p class="sub">For agents. A key can add sites, get the install steps and read your numbers. Nothing else.</p></div></div>${made}<div class="card"><div class="cbody"><form method="post" action="/tokens" style="display:flex;gap:12px;margin-bottom:12px"><input name="label" maxlength="40" placeholder="Name, like claude-code" style="flex:1;padding:10px 12px;border:1px solid var(--rule,#d8d4bd);background:transparent;font:inherit"><button class="btn p">Make a key</button></form>${rows}</div></div><p class="sub" style="margin:24px;">Server: <code>${origin}/mcp</code> (MCP over HTTP). The same key works as <code>Authorization: Bearer</code> on <code>/api/sites</code> and <code>/api/stats</code>.</p>`;
  return layout('API keys · Flisk Analytics', shell(login, 'API keys', inner), "document.addEventListener('click',function(e){var c=e.target.closest('[data-copy]');if(!c)return;navigator.clipboard.writeText(c.parentNode.querySelector('pre').textContent);c.textContent='Copied';setTimeout(function(){c.textContent='Copy'},1200)});");
}
