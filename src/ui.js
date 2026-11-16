// The cabinet pages, in the Ledger look. The pages are shells; the numbers come from /api/* in the browser.
import { CSS } from './css.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,800&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">';
const GH = '<svg class="i" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';

export function layout(title, body, script = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script defer data-domain="analytics.flisk.si" src="https://flisk.sh/a.js"></script><meta name="robots" content="noindex"><title>${esc(title)}</title>${FONTS}<style>${CSS}</style><script src="https://flisk.si/assets/bar.js" defer></script></head><body>${body}${script ? `<script>${script}</script>` : ''}</body></html>`;
}

const LOGO = '<a class="logo" href="/"><span class="mk">&gt;_</span><span>flisk</span><small>Growth</small></a>';

function shell(login, active, inner) {
  const nav = [['Sites', '/'], ['API keys', '/tokens']].map(([n, h]) => `<a href="${h}" class="${n === active ? 'on' : ''}">${n}</a>`).join('');
  return `<div class="frame"><header class="top">${LOGO}<nav>${nav}</nav><form class="me" method="post" action="/logout" style="margin:0"><span class="m">${esc(login)}</span><button class="av" title="Sign out" style="border:0;cursor:pointer">${esc(login[0].toUpperCase())}</button></form></header><main>${inner}</main></div>`;
}

export function loginPage(error = '') {
  const side = '<aside class="lside"><div class="big">0</div><div class="m">Cookies set on your visitors</div><div><div class="li"><b>01</b><span>No cookies, no consent banner</span></div><div class="li"><b>02</b><span>One script tag, under 1 KB</span></div><div class="li"><b>03</b><span>Same GitHub login as chat, fleet, inference</span></div></div></aside>';
  const note = error ? `<p style="color:var(--dn)">${esc(error)}</p>` : '<p>One login for chat, fleet, inference and analytics. We only read your GitHub name.</p>';
  return layout('Sign in · Flisk Analytics', `<div class="frame"><main class="login"><div class="lc">${LOGO}<h1>Know who comes to your site.</h1>${note}<a class="gbtn" href="/auth/login">${GH}Continue with GitHub</a><small>Visitors are counted without cookies.</small></div>${side}</main></div>`);
}

export function messagePage(title, text, login = '') {
  const inner = `<div class="err"><h1>${esc(title)}</h1><p>${esc(text)}</p><p><a class="btn" href="/">Back</a></p></div>`;
  return layout(title, login ? shell(login, '', inner) : `<div class="frame">${inner}</div>`);
}

const SITES_JS = `
var grid=document.getElementById('grid'),q=document.getElementById('q'),all=[];
function fmt(n){return n.toLocaleString('en-US')}
function spark(d){var w=300,h=50,m=Math.max.apply(null,d)||1,p=d.map(function(v,i){return [2+i*(w-4)/(d.length-1),3+(h-6)*(1-v/(m*1.12))]});
var l='M'+p.map(function(x){return x[0].toFixed(1)+','+x[1].toFixed(1)}).join(' L'),a=l+' L'+p[p.length-1][0]+','+(h-3)+' L2,'+(h-3)+' Z',e=p[p.length-1];
return '<svg class="ch" viewBox="0 0 '+w+' '+h+'"><path class="ar" d="'+a+'" fill="#16a34a" fill-opacity=".14"/><path class="ln" d="'+l+'"/><circle class="dot" cx="'+e[0]+'" cy="'+e[1]+'" r="3.5"/></svg>'}
function card(s){var up=s.change==null||s.change>=0;return '<a class="sc" href="/site/'+s.domain+'"><div class="sch"><em class="fav">'+s.domain[0].toUpperCase()+'</em><span>'+s.domain+'</span></div><div class="spk">'+spark(s.days)+'</div><div class="scn"><b>'+fmt(s.total)+'</b><span>visitors · 30d</span>'+(s.change==null?'':'<i class="kd '+(up?'up':'dn')+'">'+(up?'↗ ':'↘ ')+Math.abs(s.change)+'%</i>')+'</div></a>'}
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
var SITE=window.__SITE,range=new URLSearchParams(location.search).get('r')||'30d',data={},tabState={};
var DEFS=[{tabs:[['Channels','channels'],['Sources','sources'],['Campaigns','campaigns'],['Themes','themes']],head:'Source'},{tabs:[['Top pages','pages']],head:'Page'},{tabs:[['Countries','countries'],['Regions','regions'],['Cities','cities']],head:'Country'},{tabs:[['Browsers','browsers'],['Operating systems','os'],['Devices','devices']],head:'Browser'}];
var HEAD={channels:'Channel',sources:'Source',campaigns:'Campaign',themes:'Theme',pages:'Page',countries:'Country',regions:'Region',cities:'City',browsers:'Browser',os:'Operating system',devices:'Device'};
function fmt(n){return n==null?'—':n.toLocaleString('en-US')}
function dur(s){if(s==null)return '—';var m=Math.floor(s/60);return m?m+'m '+(s%60)+'s':s+'s'}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function delta(c,p,inv){if(!p)return '';var d=Math.round((c-p)/p*100),good=inv?d<=0:d>=0;return '<i class="kd '+(good?'up':'dn')+'">'+(d>=0?'↗ ':'↘ ')+Math.abs(d)+'%</i>'}
function kpis(o){var c=o.current,p=o.previous,K=[['Unique visitors',fmt(c.visitors),delta(c.visitors,p.visitors)],['Total visits',fmt(c.visits),delta(c.visits,p.visits)],['Pageviews',fmt(c.pageviews),delta(c.pageviews,p.pageviews)],['Views / visit',c.viewsPerVisit||'—',delta(c.viewsPerVisit,p.viewsPerVisit)],['Bounce rate',c.bounceRate==null?'—':c.bounceRate+'%',''],['Visit duration',dur(c.duration),'']];
return K.map(function(k,i){return '<div class="k'+(i?'':' on')+'"><span class="kl">'+k[0]+'</span><b class="kv">'+k[1]+'</b>'+k[2]+'</div>'}).join('')}
function chart(series){var w=1190,h=320,l=40,r=10,t=12,b=26,v=series.map(function(s){return s.v}),st=Math.max(1,Math.ceil((Math.max.apply(null,v)||0)*1.12/4)),mx=st*4,n=v.length,s='<svg class="ch" viewBox="0 0 '+w+' '+h+'">';
var p=v.map(function(x,i){return [l+i*(w-l-r)/Math.max(n-1,1),t+(h-t-b)*(1-x/mx)]});
for(var k=0;k<5;k++){var y=t+(h-t-b)*k/4;s+='<line class="grid" x1="'+l+'" x2="'+(w-r)+'" y1="'+y+'" y2="'+y+'"/><text class="ax" x="'+(l-8)+'" y="'+(y+4)+'" text-anchor="end">'+st*(4-k)+'</text>'}
for(var k=0;k<5;k++){var i=Math.round(k*(n-1)/4),x=l+i*(w-l-r)/Math.max(n-1,1),d=new Date(series[i].t.replace(' ','T')+'Z'),lab=range==='today'?d.getUTCHours()+':00':d.toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});s+='<text class="ax" x="'+x+'" y="'+(h-6)+'" text-anchor="'+(k==0?'start':k==4?'end':'middle')+'">'+lab+'</text>'}
var d='M'+p.map(function(x){return x[0].toFixed(1)+','+x[1].toFixed(1)}).join(' L'),e=p[p.length-1];
return s+'<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s1"/><stop offset="1" class="s2"/></linearGradient></defs><path class="ar" d="'+d+' L'+e[0]+','+(h-b)+' L'+p[0][0]+','+(h-b)+' Z" fill="url(#g)"/><path class="ln" d="'+d+'"/><circle class="dot" cx="'+e[0]+'" cy="'+e[1]+'" r="4"/></svg>'}
function rows(list){if(!list||!list.length)return '<div class="empty" style="padding:18px 0">No data yet</div>';var m=list[0].v;return list.map(function(x){return '<div class="r"><i class="fill" style="width:'+(x.v/m*100).toFixed(0)+'%"></i><span class="rl"><em class="ic">'+esc(x.k[0]||'?').toUpperCase()+'</em>'+esc(x.k)+'</span><span class="rv">'+fmt(x.v)+'</span></div>'}).join('')}
function panel(i){var D=DEFS[i],key=tabState[i]||D.tabs[0][1],tabs=D.tabs.map(function(t){return '<a data-p="'+i+'" data-k="'+t[1]+'" class="'+(t[1]===key?'on':'')+'">'+t[0]+'</a>'}).join('');
return '<header class="tabs">'+tabs+'</header><div class="th"><span>'+HEAD[key]+'</span><span>Visitors</span></div>'+(data[key]?rows(data[key]):'<div class="empty skel" style="padding:18px 0">Loading…</div>')}
function drawPanels(){for(var i=0;i<4;i++)document.getElementById('p'+i).innerHTML=panel(i)}
function load(parts){return fetch('/api/stats?site='+encodeURIComponent(SITE)+'&range='+range+'&parts='+parts.join(',')).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){for(var k in j.panels)data[k]=j.panels[k];return j})}
function head(j){document.getElementById('live').textContent=j.live+' current visitor'+(j.live==1?'':'s');document.getElementById('kpis').innerHTML=kpis(j);document.getElementById('chart').innerHTML=chart(j.series)}
function fail(){document.getElementById('chart').innerHTML='<div class="empty">Could not load the numbers. Reload in a minute.</div>'}
document.querySelectorAll('.seg a').forEach(function(a){a.className=a.dataset.r===range?'on':'';a.onclick=function(){var u=new URL(location.href);u.searchParams.set('r',a.dataset.r);location.href=u}});
document.addEventListener('click',function(e){var a=e.target.closest('.tabs a');if(!a)return;var i=+a.dataset.p,k=a.dataset.k;tabState[i]=k;drawPanels();if(!data[k])load([k]).then(drawPanels).catch(function(){})});
drawPanels();load(['channels','pages','countries','browsers']).then(function(j){head(j);drawPanels()}).catch(fail);
`;

export function dashboardPage(login, site) {
  const seg = [['today', 'Today'], ['7d', '7D'], ['30d', '30D'], ['12m', '12M']].map(([r, n]) => `<a data-r="${r}">${n}</a>`).join('');
  const inner = `<div class="dh"><div class="dl"><a class="sw" href="/">← Sites</a><span class="sw"><em class="fav">${esc(site[0].toUpperCase())}</em>${esc(site)}</span><span class="live"><i></i><span id="live">… current visitors</span></span></div><div class="dr"><a class="ctl" href="/site/${esc(site)}/install">Install</a><div class="seg">${seg}</div></div></div><div class="kpis" id="kpis"><div class="k on"><span class="kl">Unique visitors</span><b class="kv">…</b></div></div><div class="cbox" id="chart"><div class="empty skel">Loading…</div></div><div class="panels">${[0, 1, 2, 3].map((i) => `<section class="panel" id="p${i}"></section>`).join('')}</div>`;
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
