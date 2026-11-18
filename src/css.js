// Ledger look, ported from the approved design (analytics-admin-20261113 / A).
export const CSS = `
*{box-sizing:border-box}html,body{margin:0}body{background:var(--bg);color:var(--ink);font:14px/1.5 var(--sans);-webkit-font-smoothing:antialiased;min-height:100vh}
a{color:inherit;text-decoration:none}button{font:inherit;color:inherit;cursor:pointer;background:none;border:0}.i{flex-shrink:0}
.fav{display:inline-grid;place-items:center;width:20px;height:20px;font:600 11px var(--sans);font-style:normal;background:var(--favbg);color:var(--favfg);border-radius:var(--favr)}
.ch{display:block;width:100%;height:auto;overflow:visible}.grid{stroke:var(--line);stroke-width:1}.ax{fill:var(--dim);font:11px var(--mono)}
.ln{fill:none;stroke:var(--acc);stroke-width:2;stroke-linejoin:round}.pv{fill:none;stroke:var(--dim);stroke-dasharray:3 4;opacity:.55}.dot{fill:var(--acc);stroke:var(--panel);stroke-width:2}
.s1{stop-color:var(--acc);stop-opacity:var(--ao,.14)}.s2{stop-color:var(--acc);stop-opacity:0}
rect.bar{fill:var(--acc);opacity:.35}rect.bar.last{opacity:1}
.r{position:relative;display:flex;justify-content:space-between;align-items:center;height:34px;padding:0 10px;margin:2px 0;font-size:13.5px}
.r .fill{position:absolute;left:0;top:0;bottom:0;background:var(--barbg);border-radius:var(--rbar)}
.rl,.rv{position:relative;z-index:1;display:flex;align-items:center;gap:9px}.rv{font-variant-numeric:tabular-nums}
.ic{display:inline-grid;place-items:center;width:16px;height:16px;font:600 9px var(--sans);font-style:normal;background:var(--icbg);color:var(--dim);border-radius:3px}
.tabs{display:flex;gap:18px;align-items:center}.tabs a{color:var(--dim);padding-bottom:10px;margin-bottom:-1px;border-bottom:2px solid transparent}.tabs a.on{color:var(--ink);border-bottom-color:var(--ink)}.exp{margin-left:auto;color:var(--dim)}
.th{display:flex;justify-content:space-between;color:var(--dim);font-size:12px;padding:14px 10px 6px}
.kl,.kv{display:block}.kd{font-style:normal;font-size:12px}.kd.up{color:var(--up)}.kd.dn{color:var(--dn)}
.live{display:inline-flex;align-items:center;gap:8px;color:var(--dim)}.live i{width:7px;height:7px;border-radius:50%;background:var(--up)}
.seg{display:inline-flex}.seg a{padding:6px 12px;color:var(--dim)}.seg a.on{color:var(--ink)}
.ctl{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;color:var(--ink)}
.sw{display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:15px;padding:6px 10px}
.dh{display:flex;justify-content:space-between;align-items:center}.dl,.dr{display:flex;align-items:center;gap:16px}
.sc{display:block}.sch{display:flex;align-items:center;gap:9px;font-weight:600}.scn b{font-size:30px;font-weight:600}.scn{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.scn span{color:var(--dim);font-size:12.5px}
pre{margin:0;white-space:pre-wrap;word-break:break-all;font:12.5px/1.65 var(--mono)}
.gbtn{display:flex;align-items:center;justify-content:center;gap:10px;font-weight:600;padding:13px 18px}
.pulse{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--up);box-shadow:0 0 0 5px color-mix(in srgb,var(--up) 22%,transparent)}
.spk svg{width:100%}

:root{--bg:#f7f5e4;--panel:#fffef6;--ink:#171715;--dim:#6b6a5f;--line:#dcd9bf;--acc:#171715;--up:#16a34a;--dn:#b42318;--barbg:rgba(22,163,74,.13);--icbg:#ebe8cf;--favbg:#171715;--favfg:#f7f5e4;--favr:0;--rbar:0;--ao:.0;--sans:'Inter Tight',system-ui,sans-serif;--mono:'JetBrains Mono',monospace;--serif:Fraunces,serif}
.m,.kl,.th,.tabs,.seg,.ctl,.btn,.ctabs a,.sc.add{font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;font-size:11.5px}
.frame{max-width:1240px;margin:0 auto;border-left:1px solid var(--ink);border-right:1px solid var(--ink);min-height:100vh}
.top{display:flex;justify-content:space-between;align-items:stretch;height:48px;border-bottom:1px solid var(--ink)}
.logo{display:inline-flex;align-items:center;gap:9px;padding:0 20px;font:800 24px var(--serif);letter-spacing:-.03em;border-right:1px solid var(--ink)}
.mk{display:inline-grid;place-items:center;width:24px;height:24px;background:#22c55e;color:#0a0a0e;font:500 11px var(--mono)}
.logo small{font:11.5px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--dim);font-weight:400;margin-left:6px}
.top nav{display:flex;margin-right:auto;align-items:stretch}.top nav a{padding:0 20px;display:flex;align-items:center;font:11.5px var(--mono);text-transform:uppercase;letter-spacing:.06em;border-right:1px solid var(--ink)}.top nav a.on{background:var(--ink);color:var(--bg)}
.me{display:flex;align-items:center;gap:10px;padding:0 20px;border-left:1px solid var(--ink)}.av{width:24px;height:24px;background:var(--ink);color:var(--bg);display:grid;place-items:center;font:600 11px var(--sans)}
.dh{border-bottom:1px solid var(--ink);height:56px}.dl{padding-left:14px}.dr{height:100%;gap:0}.dr>*{height:100%;display:flex;align-items:center;border-left:1px solid var(--ink)}
.seg a{padding:0 14px;height:100%;display:flex;align-items:center;border-left:1px solid var(--line)}.seg a:first-child{border:0}.seg a.on{background:var(--ink);color:var(--bg)}.ctl{padding:0 18px}.sw{font:800 16px var(--serif);border:1px solid var(--ink);padding:6px 12px}
.kpis{display:grid;grid-template-columns:repeat(6,1fr);border-bottom:1px solid var(--ink)}.k{padding:18px 20px 16px;border-right:1px solid var(--ink)}.k:last-child{border:0}.k.on{background:var(--ink);color:var(--bg)}.k.on .kl{color:#cfcdb6}.k.on .kd.up{color:#7de39b}.k.on .kd.dn{color:#ff9d92}
.kv{font:800 34px/1.1 var(--serif);letter-spacing:-.03em;margin:8px 0 4px}
.cbox{padding:22px 24px 8px;border-bottom:1px solid var(--ink);position:relative}.cbox .s1{stop-color:#16a34a;stop-opacity:.22}.cbox .s2{stop-color:#16a34a;stop-opacity:0}.dot{fill:#16a34a}
.cbox .tag{position:absolute;right:24px;top:20px;display:flex;gap:18px}.tag span{display:flex;align-items:center;gap:8px}.tag i{width:18px;height:0;border-top:2px solid var(--ink)}.tag i.d{border-top:2px dotted var(--dim)}
.panels{display:grid;grid-template-columns:1fr 1fr}.panel{padding:18px 22px;border-right:1px solid var(--ink);border-bottom:1px solid var(--ink);min-height:300px}.panel:nth-child(2n){border-right:0}
.tabs{border-bottom:1px solid var(--line)}.tabs a{padding-bottom:11px}.th{padding-left:0;padding-right:0}.r{margin:3px 0}.r .fill{border-right:2px solid #16a34a}
.ph{display:flex;justify-content:space-between;align-items:flex-end;padding:30px 24px 24px;border-bottom:1px solid var(--ink)}.ph h1{font:800 44px/1 var(--serif);letter-spacing:-.035em;margin:0}.sub{margin:8px 0 0;color:var(--dim)}
.btn{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--ink);padding:11px 18px;background:transparent}.btn.p{background:var(--ink);color:var(--bg)}
.tools{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--ink);height:52px}.srch{display:flex;align-items:center;gap:10px;padding:0 22px;color:var(--dim);height:100%;border-right:1px solid var(--ink);width:360px}.tools .btn{height:100%;border:0;border-left:1px solid var(--ink)}
.sgrid{display:grid;grid-template-columns:repeat(3,1fr)}.sc{padding:22px 24px;border-right:1px solid var(--ink);border-bottom:1px solid var(--ink);background:var(--panel)}.sc:nth-child(3n){border-right:0}.spk{margin:18px 0 12px}.spk .ln{stroke:var(--ink);stroke-width:1.6}.spk .s1{stop-color:#16a34a;stop-opacity:.2}
.sc.add{display:grid;place-items:center;background:repeating-linear-gradient(135deg,transparent 0 6px,rgba(23,23,21,.06) 6px 7px);color:var(--dim);text-align:center}
.scn b{font:800 34px var(--serif);letter-spacing:-.03em}
.inst{display:grid;grid-template-columns:260px 1fr;min-height:700px}.steps{border-right:1px solid var(--ink)}.st{display:flex;gap:14px;align-items:center;padding:20px 22px;border-bottom:1px solid var(--ink);font-weight:500}.st b{display:grid;place-items:center;width:26px;height:26px;border:1px solid var(--ink);font:500 12px var(--mono)}.st.done b{background:#16a34a;border-color:#16a34a;color:#fff}.st.on{background:var(--ink);color:var(--bg)}.st.on b{border-color:var(--bg)}.st span{margin-left:auto;font:11px var(--mono);color:var(--dim)}
.cwrap{padding:26px 28px}.card{border:1px solid var(--ink);background:var(--panel)}.ctabs{display:flex;border-bottom:1px solid var(--ink)}.ctabs a{padding:12px 18px;border-right:1px solid var(--ink)}.ctabs a.on{background:var(--ink);color:var(--bg)}
.cbody{padding:20px 22px}.cbody h3{margin:0 0 6px;font:800 20px var(--serif);letter-spacing:-.02em}.cbody p{margin:0 0 12px;color:var(--dim)}
.code{background:#171715;color:#f7f5e4;padding:14px 16px;position:relative;margin-bottom:18px}.code .cp{position:absolute;right:10px;top:10px;color:#cfcdb6;display:flex;gap:6px;align-items:center;font:11px var(--mono);text-transform:uppercase}.code .c{color:#8a8870}.code .g{color:#7de39b}.code .s{color:#f3d58a}
.wait{margin-top:22px;border:1px solid var(--ink);padding:18px 22px;display:flex;align-items:center;gap:16px;background:repeating-linear-gradient(135deg,transparent 0 6px,rgba(22,163,74,.1) 6px 7px)}.wait b{font:800 18px var(--serif)}.wait small{display:block;color:var(--dim)}.wait .btn{margin-left:auto;background:var(--panel)}
.login{display:grid;grid-template-columns:1fr 1fr;min-height:760px}.lc{padding:60px;border-right:1px solid var(--ink);display:flex;flex-direction:column;justify-content:center}.lc .logo{border:0;padding:0}.lc h1{font:800 54px/1.02 var(--serif);letter-spacing:-.04em;margin:26px 0 14px}.lc p{color:var(--dim);font-size:16px;margin:0 0 30px;max-width:420px}.gbtn{background:var(--ink);color:var(--bg);border:1px solid var(--ink);max-width:380px;font:12px var(--mono);text-transform:uppercase;letter-spacing:.06em}.lc small{margin-top:18px;color:var(--dim);max-width:380px}
.lside{padding:60px;background:repeating-linear-gradient(135deg,transparent 0 7px,rgba(22,163,74,.1) 7px 8px);display:flex;flex-direction:column;justify-content:center;gap:22px}.lside .big{font:800 96px/.9 var(--serif);letter-spacing:-.05em}.lside .li{display:flex;gap:14px;padding:14px 0;border-top:1px solid var(--ink)}.lside .li b{font:500 12px var(--mono);color:#16a34a}.lside .mini{background:var(--panel);border:1px solid var(--ink);padding:14px 14px 4px}.lside .mini .s1{stop-color:#16a34a;stop-opacity:.2}

.err{padding:60px 24px;max-width:560px}.err h1{font:800 40px/1.05 var(--serif);letter-spacing:-.03em;margin:0 0 10px}.err p{color:var(--dim)}
.empty{padding:26px 24px;color:var(--dim)}.form{display:flex;gap:0;border:1px solid var(--ink);max-width:520px;margin-top:20px}.form input{flex:1;border:0;background:var(--panel);padding:0 16px;height:46px;font:14px var(--mono);outline:0}.form button{border:0;border-left:1px solid var(--ink);background:var(--ink);color:var(--bg);padding:0 22px;font:11.5px var(--mono);text-transform:uppercase;letter-spacing:.06em;cursor:pointer}

.ctool{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding-bottom:12px;min-height:36px}.ctool .cg{display:flex;align-items:center;gap:14px}.ctool .hint{color:var(--dim);text-transform:none;letter-spacing:0}
.seg.iv{border:1px solid var(--ink)}.seg.iv a{padding:5px 11px;height:auto}.rz{font:11.5px var(--mono);text-transform:uppercase;letter-spacing:.06em;border:1px solid var(--ink);padding:5px 11px;cursor:pointer;background:var(--ink);color:var(--bg)}
.k.pick{cursor:pointer}.k.pick:not(.on):hover{background:#fffef6}
#svg{touch-action:pan-y;cursor:crosshair;user-select:none}.xh{stroke:var(--ink);stroke-dasharray:3 3;opacity:.55;pointer-events:none}.sel{fill:#16a34a;fill-opacity:.16;stroke:#16a34a;pointer-events:none}#xd{pointer-events:none}
.tip{position:absolute;display:none;pointer-events:none;z-index:5;min-width:190px;background:var(--ink);color:var(--bg);padding:10px 12px;font:12px/1.5 var(--mono);box-shadow:0 4px 18px rgba(0,0,0,.25)}
.tip .tt{font-weight:500;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #4a493f}.tip .tr{display:flex;justify-content:space-between;gap:18px;color:#cfcdb6}.tip .tr.on{color:#fff}.tip .th2{margin-top:6px;color:#8a8870;font-size:11px}
.logs{border-bottom:1px solid var(--ink)}.logs>.tabs{padding:16px 22px 0}.ltabs .exp{margin-left:auto;padding-bottom:10px}.lgw{overflow-x:auto}
.lg{display:grid;grid-template-columns:200px 80px minmax(220px,2fr) 1fr 1fr 1.1fr;gap:14px;align-items:center;padding:9px 22px;border-bottom:1px solid var(--line);font-size:13px;min-width:900px}
.lg.lh{font:11.5px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}.lg small{color:var(--dim);font:11px var(--mono);margin-left:6px}.lg .lw{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lt{font-family:var(--mono);font-size:12.5px;white-space:nowrap}
.bd{font:600 10.5px var(--mono);font-style:normal;text-transform:uppercase;letter-spacing:.06em;padding:2px 7px;border:1px solid var(--ink)}.bd.click{background:#16a34a;border-color:#16a34a;color:#fff}
a.sc,.sca{cursor:pointer}.sca{display:block;color:inherit;text-decoration:none}.sl{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px;padding-top:12px;border-top:1px dashed var(--ink)}.sl .m{color:var(--dim)}.lng{border:1px solid var(--ink);padding:3px 8px;font-size:13px;color:inherit;text-decoration:none;cursor:pointer}.lng:hover{background:var(--ink);color:var(--panel)}.lng small{color:var(--dim);margin-left:2px}.lng b{font-weight:400}.sc:hover{background:#fff}.tabs a{cursor:pointer}.seg a{cursor:pointer}.skel{opacity:.45}
@media (max-width:900px){.frame{border:0}.kpis{grid-template-columns:repeat(2,1fr)}.panels,.sgrid{grid-template-columns:1fr}.panel,.sc{border-right:0!important}.inst,.login{display:block}.ctabs{flex-wrap:wrap}.steps{border-right:0;display:flex;flex-wrap:wrap}.lc{padding:40px 24px;border-right:0}.lc h1{font-size:38px}.lside{display:none}.ph{flex-direction:column;align-items:flex-start;gap:16px}.dh{height:auto;flex-direction:column;align-items:stretch;gap:0}.dr{height:46px;border-top:1px solid var(--ink)}.dl{height:56px}.top nav a{padding:0 12px}.logo{padding:0 12px}.logo small{display:none}.me{padding:0 12px}.me .m{display:none}.tools{height:auto;flex-direction:column;align-items:stretch}.srch{width:auto;border-right:0;height:48px}.panel{min-height:0}.tabs{flex-wrap:wrap;gap:12px}.form input{min-width:0}}
`;
