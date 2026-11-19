const $ = s => document.querySelector(s);
const fmt = n => Number(n).toLocaleString('en-US');
const baht = n => '฿' + Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const TH_M=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const TH_D=['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
const dobj = iso => new Date(iso+'T00:00:00');
const fd = iso => { const d=dobj(iso); return d.getDate()+' '+TH_M[d.getMonth()]; };
const fdl = iso => TH_D[dobj(iso).getDay()]+' '+fd(iso);
const fdy = iso => { const d=dobj(iso); return d.getDate()+' '+TH_M[d.getMonth()]+' '+(d.getFullYear()+543); };
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tip = $('#tip');
function showTip(e,html){tip.innerHTML=html;tip.style.opacity=1;const r=tip.getBoundingClientRect();
  let x=e.clientX+14,y=e.clientY+14; if(x+r.width>innerWidth-8)x=e.clientX-r.width-14; if(y+r.height>innerHeight-8)y=e.clientY-r.height-14;
  tip.style.transform=`translate(${Math.max(4,x)}px,${Math.max(4,y)}px)`;}
const hideTip=()=>{tip.style.opacity=0};
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/* ---------- header ---------- */
$('#chip-period').textContent='ช่วงข้อมูล '+fdy(D.period[0])+' – '+fdy(D.period[1]);
$('#chip-asof').textContent='ยอดสต็อก ณ '+fdy(D.asof);
$('#chip-src').textContent='จ่ายยา '+fmt(D.kpi.dispenses)+' ครั้ง · '+fmt(D.kpi.stock_lots)+' ล็อต';
$('#f-asof').textContent=fdy(D.asof);

/* ---------- KPI cards ---------- */
const IC={
 rx:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>',
 users:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5c2 .7 3 2.6 3 5.5"/></svg>',
 box:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
 low:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.01"/></svg>',
 clock:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};
const lowNames=D.reorder.filter(r=>r.qty<r.rl).map(r=>r.sku).join(', ');
const K=D.kpi;
const cards=[
 {ic:'rx',lb:'จำนวนครั้งที่จ่ายยา',v:K.dispenses,u:'ครั้ง',ft:`เฉลี่ย ${K.avg_day} ครั้ง/วัน · ไม่นับ void ${K.voids}`,num:true},
 {ic:'users',lb:'ผู้ป่วยที่รับบริการ (ไม่ซ้ำ)',v:K.patients,u:'คน',ft:`กลับมารับยามากกว่า 1 ครั้ง ${K.repeat} คน`,num:true},
 {ic:'box',lb:'มูลค่ายาคงคลัง (ล็อต active)',v:K.stock_value,u:'บาท',ft:`ล็อตหมดอายุ/ไม่ทราบวันหมดอายุ ${baht(K.quar_value)} ไม่นับรวม`,money:true},
 {ic:'low',lb:'ยาต่ำกว่าจุดสั่งซื้อ',v:K.low,u:`จาก ${K.stock_skus} SKU`,ft:lowNames||'ไม่มีรายการ',warn:K.low>0,tag:'ควรสั่งเพิ่ม',num:true},
 {ic:'clock',lb:'ล็อตใกล้หมดอายุ ≤ 90 วัน',v:K.near_n,u:'ล็อต',ft:`มูลค่ารวม ${baht(K.near_v)}`,warn:K.near_n>0,tag:'ควรจัดการก่อนหมดอายุ',num:true}
];
$('#kpis').innerHTML=cards.map((c,i)=>`<div class="card kpi ${c.warn?'warn':''}">
  <div class="ic">${IC[c.ic]}</div>${c.warn?`<div class="tag">▲ ${c.tag}</div><br>`:''}
  <div class="lb">${c.lb}</div><div class="val"><span data-i="${i}">0</span><small>${c.u}</small></div><div class="ft">${esc(c.ft)}</div></div>`).join('');
function countUp(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('#kpis .val span').forEach(el=>{
    const c=cards[el.dataset.i]; const show=x=>c.money?'฿'+Math.round(x).toLocaleString('en-US'):fmt(Math.round(x));
    if(reduce){el.textContent=show(c.v);return;}
    const t0=performance.now(),dur=900;
    const step=t=>{const p=Math.min(1,(t-t0)/dur);el.textContent=show(c.v*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};
    requestAnimationFrame(step);
  });
}

/* ---------- chart helpers ---------- */
const rtop=(x,y,w,h,r)=>{if(h<=0)return '';r=Math.min(r,h,w/2);return `M${x},${y+h}V${y+r}Q${x},${y} ${x+r},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${y+h}Z`};
const niceMax=(m,step)=>Math.max(step,Math.ceil(m/step)*step);

function lineChart(node,rows){
  const W=Math.max(320,node.clientWidth),H=345,m={l:34,r:14,t:20,b:30};
  const iw=W-m.l-m.r,ih=H-m.t-m.b,n=rows.length;
  const avg=rows.map((_,i)=>{const s=rows.slice(Math.max(0,i-6),i+1);return s.reduce((a,r)=>a+r.n,0)/s.length});
  const ymax=niceMax(Math.max(...rows.map(r=>r.n)),2);
  const x=i=>m.l+iw*i/(n-1), y=v=>m.t+ih*(1-v/ymax), step=iw/(n-1);
  let g='';
  for(let v=0;v<=ymax;v+=2){g+=`<line class="grid" x1="${m.l}" x2="${W-m.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${m.l-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`}
  let wk='';
  rows.forEach((r,i)=>{const d=dobj(r.d).getDay(); if(d===0||d===6){wk+=`<rect x="${x(i)-step/2}" y="${m.t}" width="${step}" height="${ih}" fill="var(--weekend)"/>`}});
  let xl='';
  rows.forEach((r,i)=>{if(i%4===0){xl+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${fd(r.d)}</text>`}});
  const pts=rows.map((r,i)=>`${x(i)},${y(r.n)}`);
  const line='M'+pts.join('L');
  const area=`M${x(0)},${y(0)}L${pts.join('L')}L${x(n-1)},${y(0)}Z`;
  const aline='M'+avg.map((v,i)=>`${x(i)},${y(v)}`).join('L');
  const pk=rows.reduce((a,r,i)=>r.n>rows[a].n?i:a,0);
  const lab=`<circle cx="${x(pk)}" cy="${y(rows[pk].n)}" r="5" fill="var(--blue)" stroke="var(--surface)" stroke-width="2"/>
    <text x="${x(pk)}" y="${y(rows[pk].n)-11}" text-anchor="middle" style="fill:var(--ink);font-weight:700;font-size:12px">สูงสุด ${rows[pk].n}</text>`;
  node.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="กราฟเส้นจำนวนครั้งที่จ่ายยารายวัน">
   <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--blue)" stop-opacity=".32"/><stop offset="1" stop-color="var(--blue)" stop-opacity="0"/></linearGradient></defs>
   ${wk}${g}${xl}<path d="${area}" fill="url(#ga)"/><path d="${aline}" fill="none" stroke="var(--orange)" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>
   <path d="${line}" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${lab}
   <g id="xh" style="display:none"><line id="xhl" y1="${m.t}" y2="${m.t+ih}" stroke="var(--ink-3)" stroke-dasharray="3 3"/><circle id="xhd" r="5.5" fill="var(--blue)" stroke="var(--surface)" stroke-width="2"/></g>
   <rect id="ov" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/></svg>`;
  const svg=node.querySelector('svg'),ov=svg.querySelector('#ov'),xh=svg.querySelector('#xh');
  ov.addEventListener('mousemove',e=>{
    const b=svg.getBoundingClientRect(),px=(e.clientX-b.left)*(W/b.width);
    const i=Math.max(0,Math.min(n-1,Math.round((px-m.l)/step)));
    xh.style.display='';xh.querySelector('#xhl').setAttribute('x1',x(i));xh.querySelector('#xhl').setAttribute('x2',x(i));
    xh.querySelector('#xhd').setAttribute('cx',x(i));xh.querySelector('#xhd').setAttribute('cy',y(rows[i].n));
    showTip(e,`<b>${fdl(rows[i].d)}</b>จ่ายยา ${rows[i].n} ครั้ง<br>เฉลี่ย 7 วัน ${avg[i].toFixed(1)}`);
  });
  ov.addEventListener('mouseleave',()=>{xh.style.display='none';hideTip()});
}

function colChart(node,rows,o){
  const W=Math.max(260,node.clientWidth),H=o.h||230,m={l:30,r:8,t:22,b:o.bb||28};
  const iw=W-m.l-m.r,ih=H-m.t-m.b,n=rows.length;
  const mx=Math.max(...rows.map(o.v)),st=o.step||2;
  const ts=st*Math.max(1,Math.ceil(mx/st/4)),ymax=ts*Math.max(1,Math.ceil(mx/ts));
  const slot=iw/n,bw=Math.min(46,slot*.64);
  const y=v=>m.t+ih*(1-v/ymax);
  let g='';
  for(let v=0;v<=ymax;v+=ts){g+=`<line class="grid" x1="${m.l}" x2="${W-m.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${m.l-6}" y="${y(v)+4}" text-anchor="end">${Number.isInteger(v)?v:v.toFixed(1)}</text>`}
  let bars='';
  rows.forEach((r,i)=>{
    const v=o.v(r),cx=m.l+slot*i+slot/2,h=ih*v/ymax;
    const col=o.c?o.c(r,i):'var(--blue)';
    bars+=`<path class="bar" data-i="${i}" d="${rtop(cx-bw/2,y(v),bw,h,5)}" fill="${col}"/>`;
    if(o.all||(o.hi&&o.hi(r,i)))bars+=`<text x="${cx}" y="${y(v)-6}" text-anchor="middle" style="fill:var(--ink);font-weight:700">${o.f?o.f(v):v}</text>`;
    bars+=`<text x="${cx}" y="${H-(o.bb?o.bb-16:9)}" text-anchor="middle">${esc(o.l(r))}</text>`;
    bars+=`<rect class="hit" data-i="${i}" x="${m.l+slot*i}" y="${m.t}" width="${slot}" height="${ih+m.b}" fill="transparent"/>`;
  });
  node.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="${esc(o.aria||'กราฟแท่ง')}">${g}${bars}</svg>`;
  node.querySelectorAll('.hit').forEach(h=>{
    const i=+h.dataset.i,bar=node.querySelector(`.bar[data-i="${i}"]`);
    h.addEventListener('mousemove',e=>{bar&&bar.setAttribute('opacity','.8');showTip(e,o.tip(rows[i]))});
    h.addEventListener('mouseleave',()=>{bar&&bar.removeAttribute('opacity');hideTip()});
  });
}

function hbars(node,rows,o){
  const max=Math.max(...rows.map(o.v),o.min||0);
  node.innerHTML=rows.map((r,i)=>`<div class="hb ${o.click?'clk':''}" data-i="${i}"><div class="hb-l" title="${esc(o.l(r))}">${esc(o.l(r))}</div>
   <div class="hb-t"><div class="hb-f" style="width:${Math.max(1.5,o.v(r)/max*100)}%;${o.c?`background:${o.c(r)}`:''}"></div>${o.ref?`<div class="hb-ref" style="left:${o.ref/max*100}%"></div>`:''}${o.ref2?`<div class="hb-ref2" style="left:${o.ref2/max*100}%"></div>`:''}</div>
   <div class="hb-v">${o.f(r)}</div></div>`).join('');
  node.querySelectorAll('.hb').forEach(h=>{const r=rows[+h.dataset.i];
    h.addEventListener('mousemove',e=>showTip(e,o.tip(r)));h.addEventListener('mouseleave',hideTip);
    if(o.click)h.addEventListener('click',()=>o.click(r));});
}

/* ---------- section subtitles (insights) ---------- */
const pkDay=D.days.reduce((a,r)=>r.n>a.n?r:a,D.days[0]);
const wkE=D.days.filter(r=>{const d=dobj(r.d).getDay();return d===0||d===6});
const wkD=D.days.filter(r=>{const d=dobj(r.d).getDay();return d!==0&&d!==6});
const avgWE=wkE.reduce((a,r)=>a+r.n,0)/wkE.length, avgWD=wkD.reduce((a,r)=>a+r.n,0)/wkD.length;
$('#s-trend').innerHTML=`วันที่คึกคักที่สุดคือ <b>${fdl(pkDay.d)}</b> (${pkDay.n} ครั้ง) · เสาร์–อาทิตย์เฉลี่ย <b>${avgWE.toFixed(1)}</b> ครั้ง/วัน เทียบกับวันธรรมดา <b>${avgWD.toFixed(1)}</b>`;
const t0=D.top[0]; $('#s-top').innerHTML=`<b>${esc(t0.name)}</b> ถูกจ่ายมากสุด ${t0.n} ครั้ง · วางเมาส์เพื่อดูจำนวนหน่วยที่จ่าย · คลิกเพื่อเปิดใน Drug Explorer`;
$('#s-cat').innerHTML=`หมวด <b>${esc(D.cats[0].name)}</b> สูงสุด ${D.cats[0].n} ครั้ง จาก ${D.cats.length} หมวดที่มีการจ่าย`;
const pkH=D.hours.reduce((a,r)=>r.n>a.n?r:a,D.hours[0]);
$('#s-hour').innerHTML=`ช่วง <b>${String(pkH.h).padStart(2,'0')}:00–${String(pkH.h).padStart(2,'0')}:59 น.</b> คนมากที่สุด (${pkH.n} ครั้ง)`;
const wdMax=D.wd.reduce((a,r)=>r.n>a.n?r:a,D.wd[0]);
$('#s-wd').innerHTML=`วัน <b>${esc(wdMax.name)}</b> มีการจ่ายมากที่สุด (${wdMax.n} ครั้ง)`;
const rxMax=D.rx.reduce((a,r)=>r.n>a.n?r:a,D.rx[0]);
$('#s-rx').innerHTML=`<b>${rxMax.name}</b> จ่ายมากที่สุด ${rxMax.n} ครั้ง (${(rxMax.n/K.dispenses*100).toFixed(0)}% ของทั้งหมด)`;
$('#s-cv').innerHTML=`รวม <b>${baht(K.stock_value)}</b> · หมวดสูงสุดคือ ${esc(D.catval[0].name)} (${baht(D.catval[0].v)})`;
const bk0=D.buckets[0];
$('#s-bk').innerHTML=`<b>${bk0.n} ล็อต</b> (${baht(bk0.v)}) จะหมดอายุภายใน 90 วัน · แท่งสีส้มคือกลุ่มที่ต้องเร่งจัดการ`;
$('#s-ro').innerHTML=`<b>${K.low} จาก ${K.stock_skus} SKU</b> ต่ำกว่า reorder level · เส้นดำ = 100% ของ reorder level`;
$('#s-near').innerHTML=`เรียงตามวันหมดอายุ · มูลค่ารวม <b>${baht(K.near_v)}</b>`;

/* ---------- alerts ---------- */
const expd=D.dq.exp_dispense, expLots=D.watch.filter(w=>w.status==='expired'&&w.qty>0);
$('#alerts').innerHTML=[
 {c:'r',i:'!',t:expd.length?`จ่ายยาล็อตหมดอายุแล้ว ${expd.length} ครั้ง`:'ไม่พบการจ่ายยาล็อตหมดอายุ',s:expd.map(e=>`${e[0]} (${e[1]} ล็อต ${e[2]} หมด ${fd(e[3])}, จ่าย ${fd(e[4])})`).join(' · ')},
 {c:'r',i:'⏹',t:`ยาหมดอายุที่ยังค้างในสต็อก ${expLots.length} ล็อต`,s:expLots.map(w=>`${w.name} ล็อต ${w.lot} (${fmt(w.qty)} หน่วย)`).join(' · ')||'ไม่มี'},
 {c:'o',i:'▲',t:`ต่ำกว่าจุดสั่งซื้อ ${K.low} SKU`,s:D.reorder.filter(r=>r.qty<r.rl).map(r=>`${r.name} เหลือ ${r.pct}%`).join(' · ')||'ไม่มี'},
 {c:'o',i:'⏱',t:`ใกล้หมดอายุ ≤ 90 วัน ${K.near_n} ล็อต`,s:D.near.length?`รายการแรก: ${D.near[0].name} ล็อต ${D.near[0].lot} (อีก ${D.near[0].days} วัน)`:'ไม่มี'}
].map(a=>`<div class="al ${a.c}"><div class="i" aria-hidden="true">${a.i}</div><div><b>${a.t}</b><span>${esc(a.s)}</span></div></div>`).join('');

/* ---------- tables ---------- */
$('#t-near').innerHTML=`<table><thead><tr><th>ยา</th><th>ล็อต</th><th>หมดอายุ</th><th class="n">เหลือ (วัน)</th><th class="n">จำนวน</th><th class="n">มูลค่า</th></tr></thead><tbody>${
 D.near.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.lot}</td><td>${fdy(r.expiry)}</td><td class="n"><span class="pill ${r.days<=60?'r':'o'}">${r.days}</span></td><td class="n">${fmt(r.qty)}</td><td class="n">${baht(r.v)}</td></tr>`).join('')}</tbody></table>`;
const stTH={written_off:['ตัดจำหน่าย','r'],quarantine:['กักกัน','o'],expired:['หมดอายุ','r'],unknown_expiry:['ไม่ทราบวันหมดอายุ','o'],error:['ข้อมูลผิดพลาด','r'],duplicate:['ล็อตซ้ำ','m']};
$('#t-watch').innerHTML=`<table><thead><tr><th>ยา</th><th>ล็อต</th><th>สถานะ</th><th>หมดอายุ</th><th class="n">คงเหลือ</th></tr></thead><tbody>${
 D.watch.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.lot}</td><td><span class="pill ${stTH[r.status][1]}">${stTH[r.status][0]}</span></td><td>${r.expiry?fdy(r.expiry):'<i style="color:var(--ink-3)">ไม่ระบุ</i>'}</td><td class="n">${fmt(r.qty)}</td></tr>`).join('')}</tbody></table>`;

/* ---------- data quality summary ---------- */
const Q0=D.qa,kd=Q0.kinds,q=D.dq;
$('#dq').innerHTML=[
 `พบ <b>${Q0.log.length} ประเด็น</b> จาก ${fmt(Q0.files.reduce((a,f)=>a+f.rows,0))} แถว: แก้ไขอัตโนมัติ ${kd.fixed||0} · ไม่นับ ${kd.excluded||0} · ติดธงให้ตรวจ ${kd.flagged||0}`,
 `<b>ไม่นับในตัวเลขการจ่าย ${q.excluded.length} รายการ:</b> ${q.excluded.map(e=>`${e[0]} (${e[1]})`).join(', ')}`,
 q.no_stock_lot.length?`<b>${q.no_stock_lot.map(x=>x[0]+' '+x[1]+' ล็อต '+x[2]).join(', ')}</b> ไม่มีล็อตนี้ใน stock`:'ทุกการจ่ายอ้างอิงล็อตที่มีใน stock',
 D.ov.unreg.length?`<b>${D.ov.unreg.join(', ')}</b> ไม่อยู่ในบัญชียา (drugs.json) จึงไม่มี reorder level, หมวด และ ATC`:'ทุก SKU อยู่ในบัญชียา',
 `ดูรายละเอียดทั้งหมดและดาวน์โหลด log ได้ที่แท็บ <b>คุณภาพข้อมูล</b>`
].map(t=>`<li><span class="d">i</span><span>${t}</span></li>`).join('');

/* ---------- render charts (re-run on resize) ---------- */
function drawAll(){
  lineChart($('#c-trend'),D.days);
  hbars($('#c-top'),D.top,{click:r=>openDrug(r.sku),l:r=>r.name,v:r=>r.n,f:r=>r.n+' ครั้ง',tip:r=>`<b>${esc(r.name)}</b>${r.n} ครั้ง · รวม ${fmt(r.qty)} ${esc(r.unit)}<br>${esc(r.cat)}`});
  hbars($('#c-cat'),D.cats,{l:r=>r.name,v:r=>r.n,f:r=>r.n+' ครั้ง',tip:r=>`<b>${esc(r.name)}</b>${r.n} ครั้ง (${(r.n/K.dispenses*100).toFixed(1)}%)`});
  const pkI=D.hours.reduce((a,r,i)=>r.n>D.hours[a].n?i:a,0);
  colChart($('#c-hour'),D.hours,{v:r=>r.n,l:r=>r.h,step:4,hi:(r,i)=>i===pkI,tip:r=>`<b>${String(r.h).padStart(2,'0')}:00–${String(r.h).padStart(2,'0')}:59 น.</b>${r.n} ครั้ง`,aria:'จำนวนครั้งที่จ่ายยารายชั่วโมง',c:(r,i)=>i===pkI?'var(--blue)':'var(--blue-line)'});
  const wI=D.wd.reduce((a,r,i)=>r.n>D.wd[a].n?i:a,0);
  colChart($('#c-wd'),D.wd,{v:r=>r.n,l:r=>r.name,step:4,all:true,tip:r=>`<b>วัน${esc(r.name)}</b>${r.n} ครั้ง`,aria:'จำนวนครั้งที่จ่ายยาตามวันในสัปดาห์',c:(r,i)=>i===wI?'var(--blue)':'var(--blue-line)'});
  colChart($('#c-rx'),D.rx,{v:r=>r.n,l:r=>r.name,step:10,all:true,tip:r=>`<b>${r.name}</b>${r.n} ครั้ง (${(r.n/K.dispenses*100).toFixed(1)}%)`,aria:'จำนวนครั้งที่จ่ายยาแยกตามเภสัชกร'});
  hbars($('#c-cv'),D.catval,{l:r=>r.name,v:r=>r.v,f:r=>'฿'+Math.round(r.v).toLocaleString('en-US'),tip:r=>`<b>${esc(r.name)}</b>${baht(r.v)} (${(r.v/K.stock_value*100).toFixed(1)}%)`});
  colChart($('#c-bk'),D.buckets,{v:r=>r.n,l:r=>r.name,step:10,all:true,h:240,tip:r=>`<b>${esc(r.name)}</b>${r.n} ล็อต · ${baht(r.v)}`,aria:'จำนวนล็อตตามอายุคงเหลือ',c:(r,i)=>i===0?'var(--orange)':'var(--blue)'});
  const ro=D.reorder.slice(0,10);
  hbars($('#c-ro'),ro,{l:r=>r.name,v:r=>r.pct,min:100,ref:100,f:r=>r.pct.toFixed(0)+'%',c:r=>r.qty<r.rl?'var(--orange)':'var(--blue)',
    tip:r=>`<b>${esc(r.name)}</b>คงเหลือ ${fmt(r.qty)} ${esc(r.unit)} / reorder ${fmt(r.rl)}<br>${r.qty<r.rl?'▲ ต่ำกว่าจุดสั่งซื้อ':'อยู่ในเกณฑ์'}`});
}

/* =====================================================================
   Shared helpers for the extra tabs
   ===================================================================== */
Object.assign(IC,{
 cart:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/></svg>',
 layers:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5M3 17.5l9 5 9-5" opacity=".6"/></svg>',
 grid:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>',
 pause:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/></svg>'
});
function animateNode(node,anim){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  node.querySelectorAll('.val span').forEach(el=>{
    const v=+el.dataset.v,m=el.dataset.m==='1',dec=+el.dataset.d;
    const show=x=>m?'฿'+Math.round(x).toLocaleString('en-US'):x.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
    if(reduce||!anim){el.textContent=show(v);return}
    const t0=performance.now(),dur=800;
    const step=t=>{const p=Math.min(1,(t-t0)/dur);el.textContent=show(v*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};
    requestAnimationFrame(step);
  });
}
function kpiRow(node,cards,anim){
  node.innerHTML=cards.map(c=>`<div class="card kpi ${c.warn?'warn':''}"><div class="ic">${IC[c.ic]}</div>${c.warn?`<div class="tag">▲ ${c.tag}</div><br>`:''}
   <div class="lb">${c.lb}</div><div class="val"><span data-v="${c.v}" data-m="${c.money?1:0}" data-d="${c.dec||0}">0</span><small>${c.u}</small></div><div class="ft">${esc(c.ft)}</div></div>`).join('');
  animateNode(node,anim);
}
function stackBars(node,rows,o){
  const max=Math.max(...rows.map(r=>r.a+r.b));
  node.innerHTML=rows.map((r,i)=>`<div class="hb" data-i="${i}"><div class="hb-l" title="${esc(o.l(r))}">${esc(o.l(r))}</div>
   <div class="hb-t" style="background:transparent"><div class="sb" style="width:${(r.a+r.b)/max*100}%">${r.a?`<div class="sb-a" style="flex:${r.a}"></div>`:''}${r.b?`<div class="sb-b" style="flex:${r.b}"></div>`:''}</div></div>
   <div class="hb-v">${r.a+r.b}</div></div>`).join('');
  node.querySelectorAll('.hb').forEach(h=>{const r=rows[+h.dataset.i];
    h.addEventListener('mousemove',e=>showTip(e,o.tip(r)));h.addEventListener('mouseleave',hideTip)});
}
const daysTo=iso=>Math.round((dobj(iso)-dobj(D.asof))/864e5);
const PILL={active:['ใช้งานได้','g'],quarantine:['กักกัน','o'],written_off:['ตัดจำหน่าย','r'],expired:['หมดอายุ','r'],unknown_expiry:['ไม่ทราบวันหมดอายุ','o'],error:['ข้อมูลผิดพลาด','r'],duplicate:['ล็อตซ้ำ','m']};
function dstat(r){
  if(!r.nlots)return ['ไม่มีสต็อก','m'];
  if(r.q<=0)return ['ไม่มียาที่ใช้ได้','r'];
  if(r.q<r.rl)return ['ต่ำกว่า reorder','o'];
  return ['มีสต็อก','g'];
}
const pillH=(p)=>`<span class="pill ${p[1]}">${p[0]}</span>`;
const nameOf=r=>`${r.name} ${r.strength}`;

/* =====================================================================
   Drug Overview
   ===================================================================== */
let ovInit=false;
function drawOverview(){
  const O=D.ov,dr=D.drugs;
  $('#ov-note').style.display=O.n_new?'':'none';$('#ov-legend').style.display=O.n_new?'':'none';
  if(!ovInit){
    ovInit=true;
    kpiRow($('#ov-kpis'),[
      {ic:'layers',lb:'รายการยาในบัญชี',v:O.n,u:'รายการ',ft:O.n_new?`บัญชีเดิม ${O.n_old} + เพิ่มใหม่ ${O.n_new}`:'จาก drugs.json'},
      {ic:'grid',lb:'หมวดยา',v:O.cats.length,u:'หมวด',ft:`ATC ระดับ 1 มี ${O.atc.length} กลุ่ม`},
      {ic:'rx',lb:'รูปแบบยา (Dosage form)',v:O.forms.length,u:'รูปแบบ',ft:`${O.forms[0].name} มากสุด ${O.forms[0].n} รายการ`},
      {ic:'box',lb:'ยาที่มีสต็อก',v:O.stocked,u:`จาก ${O.n}`,ft:`คิดเป็น ${(O.stocked/O.n*100).toFixed(1)}% ของบัญชี`},
      {ic:'users',lb:'ยาที่ถูกจ่ายในช่วงข้อมูล',v:O.dispensed,u:'รายการ',ft:`${(O.dispensed/O.n*100).toFixed(1)}% ของบัญชี · 30 วัน`}
    ],true);
  }
  const cats=O.cats;
  stackBars($('#ov-cat'),cats.map(c=>({name:c.name,a:c.old,b:c.new})),{l:r=>r.name,tip:r=>`<b>${esc(r.name)}</b>รวม ${r.a+r.b} รายการ<br>บัญชีเดิม ${r.a} · เพิ่มใน v2.0 ${r.b}`});
  $('#s-ovcat').innerHTML=`<b>${esc(cats[0].name)}</b> มากที่สุด ${cats[0].n} รายการ ${O.n_new?'· 2 หมวดใหม่ใน v2.0 มีเฉพาะรายการเพิ่มใหม่':''}`;
  const cov=cats.map(c=>({...c,p:c.stocked/c.n*100})).sort((a,b)=>b.p-a.p||b.n-a.n);
  hbars($('#ov-cov'),cov,{l:r=>r.name,v:r=>r.p,min:100,f:r=>`${r.stocked}/${r.n}`,
    tip:r=>`<b>${esc(r.name)}</b>มีสต็อก ${r.stocked} จาก ${r.n} รายการ (${r.p.toFixed(0)}%)<br>เคยถูกจ่าย ${r.dispensed} รายการ`});
  const zero=cov.filter(c=>c.stocked===0).length;
  $('#s-ovcov').innerHTML=`<b>${zero} หมวด</b> ยังไม่มีสต็อกเลย ${O.n_new?`· ยา v2.0 มีสต็อก <b>${O.new_stocked}</b> จาก ${O.n_new} รายการ`:`· ยานอกบัญชี (${O.unreg.join(', ')}) ไม่นับในหน้านี้`}`;
  hbars($('#ov-atc'),O.atc,{l:r=>`${r.code} · ${r.name}`,v:r=>r.n,f:r=>r.n,tip:r=>`<b>ATC ${r.code}</b>${esc(r.name)}<br>${r.n} รายการ (${(r.n/O.n*100).toFixed(1)}%)`});
  $('#s-ovatc').innerHTML=`ตรวจรูปแบบรหัส ATC แล้ว <b>${O.atc_bad.length===0?'ถูกต้องทุกรายการ':O.atc_bad.length+' รายการผิดรูปแบบ'}</b> (ตรวจเฉพาะรูปแบบ ไม่ได้ตรวจความถูกต้องของตัวยา)`;
  const topF=O.forms.slice(0,8),other=O.forms.slice(8).reduce((a,f)=>a+f.n,0);
  const fr=topF.concat(other?[{name:`อื่น ๆ (${O.forms.length-8} รูปแบบ)`,n:other}]:[]);
  hbars($('#ov-form'),fr,{l:r=>r.name,v:r=>r.n,f:r=>r.n,tip:r=>`<b>${esc(r.name)}</b>${r.n} รายการ (${(r.n/O.n*100).toFixed(1)}%)`});
  $('#s-ovform').innerHTML=`ยาเม็ดและแคปซูลรวม <b>${((O.forms[0].n+O.forms[1].n)/O.n*100).toFixed(0)}%</b> ของบัญชี`;
  const bins=[['≤10',0,10],['11–30',11,30],['31–60',31,60],['61–100',61,100],['101–200',101,200],['>200',201,1e9]];
  const hist=bins.map(([n,lo,hi])=>({name:n,n:dr.filter(r=>r.rl>=lo&&r.rl<=hi).length}));
  colChart($('#ov-rl'),hist,{v:r=>r.n,l:r=>r.name,step:20,all:true,tip:r=>`<b>Reorder level ${r.name}</b>${r.n} รายการ`,aria:'การกระจายของ reorder level'});
  $('#s-ovrl').innerHTML=`ต่ำสุด ${O.rl_min} · ค่ากลาง <b>${O.rl_med}</b> · สูงสุด ${fmt(O.rl_max)} หน่วย (นโยบายสมมติของร้าน)`;
}

/* =====================================================================
   Inventory Planning
   ===================================================================== */
const PL={lead:7,safe:7,cover:30,f:'all'};
let plInit=false;
function planRows(){
  return D.drugs.filter(r=>r.nlots||r.dn).map(r=>{
    const u=r.dq/D.pdays,q=r.q,cov=u>0?q/u:Infinity;
    const rop=Math.max(r.rl,Math.ceil(u*(PL.lead+PL.safe)));
    const target=Math.max(rop,Math.ceil(u*PL.cover));
    let pr='ok';
    if(u>0&&cov<=PL.lead)pr='urgent'; else if(q<rop)pr='should';
    const sug=pr==='ok'?0:Math.max(0,target-q);
    return {...r,u,cov,rop,target,pr,sug,cost2:sug*(r.cost||0)};
  }).sort((a,b)=>({urgent:0,should:1,ok:2}[a.pr]-{urgent:0,should:1,ok:2}[b.pr])||(a.cov-b.cov)||(a.q/a.rop-b.q/b.rop));
}
const PRI={urgent:['ด่วน','r','▲'],should:['ควรสั่ง','o','●'],ok:['ปกติ','g','✓']};
function drawPlan(){
  if(!plInit){
    plInit=true;
    $('#v-days').textContent=D.pdays;
    $('#pl-seg').innerHTML=[['all','ทั้งหมด'],['urgent','ด่วน'],['should','ควรสั่ง'],['ok','ปกติ']].map(([k,t])=>`<button type="button" data-f="${k}" aria-pressed="${k==='all'}">${t}</button>`).join('');
    $('#pl-seg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;PL.f=b.dataset.f;drawPlan()});
    $('#p-lead').addEventListener('input',e=>{PL.lead=+e.target.value;drawPlan()});
    $('#p-safe').addEventListener('input',e=>{PL.safe=+e.target.value;drawPlan()});
    $('#p-cover').addEventListener('input',e=>{PL.cover=+e.target.value;drawPlan()});
  }
  $('#v-lead').textContent=PL.lead;$('#v-safe').textContent=PL.safe;$('#v-cover').textContent=PL.cover;
  document.querySelectorAll('#pl-seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===PL.f));
  const rows=planRows();
  const urg=rows.filter(r=>r.pr==='urgent'),sh=rows.filter(r=>r.pr==='should');
  const need=urg.concat(sh),total=need.reduce((a,r)=>a+r.cost2,0);
  const risk=D.risk,riskVal=risk.reduce((a,r)=>a+r.val,0);
  const dead=rows.filter(r=>r.q>0&&r.dn===0),deadVal=dead.reduce((a,r)=>a+r.val,0);
  const first=!drawPlan.k;drawPlan.k=1;
  kpiRow($('#pl-kpis'),[
    {ic:'cart',lb:'รายการที่ควรสั่งซื้อ',v:need.length,u:`จาก ${rows.length} SKU`,ft:`ด่วน ${urg.length} · ควรสั่ง ${sh.length}`,warn:need.length>0,tag:'ต้องดำเนินการ'},
    {ic:'box',lb:'ประมาณการมูลค่าสั่งซื้อ',v:total,u:'บาท',ft:`lead ${PL.lead} + safety ${PL.safe} วัน · ครอบคลุม ${PL.cover} วัน`,money:true},
    {ic:'low',lb:'เสี่ยงขาดก่อนสินค้ามาถึง',v:urg.length,u:'SKU',ft:urg.length?urg.slice(0,3).map(r=>r.sku).join(', '):`ไม่มีรายการที่ใช้ได้น้อยกว่า ${PL.lead} วัน`,warn:urg.length>0,tag:'เร่งด่วน'},
    {ic:'clock',lb:'เสี่ยงหมดอายุก่อนใช้หมด',v:risk.length,u:'ล็อต',ft:`มูลค่าที่เสี่ยง ${baht(riskVal)}`,warn:risk.length>0,tag:'ควรจัดการ'},
    {ic:'pause',lb:'สต็อกไม่เคลื่อนไหว',v:dead.length,u:'SKU',ft:dead.length?`${dead.map(r=>r.sku).join(', ')} · ${baht(deadVal)}`:'ทุกรายการมีการจ่าย'}
  ],first);
  // days of cover chart
  const cv=rows.filter(r=>r.u>0&&r.q>=0).sort((a,b)=>a.cov-b.cov).slice(0,12);
  const CAP=Math.max(60,PL.cover*1.6);
  hbars($('#pl-cov'),cv,{l:nameOf,v:r=>Math.min(r.cov,CAP),min:CAP,ref:PL.lead,ref2:PL.cover,
    f:r=>r.cov>999?'999+ วัน':Math.round(r.cov)+' วัน',c:r=>r.pr==='urgent'?'var(--red)':r.pr==='should'?'var(--orange)':'var(--blue)',click:r=>openDrug(r.sku),
    tip:r=>`<b>${esc(nameOf(r))}</b>ใช้ได้ ${r.cov.toFixed(1)} วัน (${fmt(r.q)} ${esc(r.unit)} ÷ ${r.u.toFixed(2)}/วัน)<br>${PRI[r.pr][2]} ${PRI[r.pr][0]} · คลิกเพื่อดูรายละเอียด`});
  $('#s-plcov').innerHTML=`12 รายการที่ใช้ได้น้อยที่สุด · เส้นทึบ = lead time (${PL.lead} วัน) · เส้นประ = เป้าหมาย (${PL.cover} วัน)`;
  const top=need.filter(r=>r.cost2>0).sort((a,b)=>b.cost2-a.cost2).slice(0,10);
  if(top.length){
    hbars($('#pl-cost'),top,{l:nameOf,v:r=>r.cost2,f:r=>'฿'+Math.round(r.cost2).toLocaleString('en-US'),click:r=>openDrug(r.sku),
      c:r=>r.pr==='urgent'?'var(--red)':'var(--orange)',tip:r=>`<b>${esc(nameOf(r))}</b>สั่ง ${fmt(r.sug)} ${esc(r.unit)} × ${baht(r.cost||0)} = ${baht(r.cost2)}`});
    $('#s-plcost').innerHTML=`รวม <b>${baht(total)}</b> จาก ${need.length} รายการ · สีแดง = ด่วน สีส้ม = ควรสั่ง`;
  }else{$('#pl-cost').innerHTML='<div class="empty">ไม่มีรายการที่ต้องสั่งซื้อตามเงื่อนไขนี้</div>';$('#s-plcost').textContent='ลองเพิ่ม lead time หรือจำนวนวันครอบคลุม';}
  // table
  const shown=rows.filter(r=>PL.f==='all'||r.pr===PL.f);
  $('#s-pltab').innerHTML=`แสดง ${shown.length} จาก ${rows.length} SKU ที่มีสต็อกหรือมีการจ่าย · คลิกแถวเพื่อเปิดใน Drug Explorer`;
  $('#pl-table').innerHTML=shown.length?`<table><thead><tr><th>ยา</th><th>หมวด</th><th class="n">ใช้ได้</th><th class="n">ใช้/วัน</th><th class="n">ครอบคลุม (วัน)</th><th class="n">Reorder level</th><th class="n">จุดสั่งซื้อ</th><th class="n">แนะนำสั่ง</th><th class="n">ประมาณการ</th><th>ลำดับ</th></tr></thead><tbody>${
    shown.map(r=>`<tr class="clk" tabindex="0" data-sku="${r.sku}"><td><b>${esc(nameOf(r))}</b><br><span class="mini">${r.sku} · ${esc(r.form)}</span></td><td>${esc(r.cat)}</td>
     <td class="n">${fmt(r.q)}</td><td class="n">${r.u.toFixed(2)}</td><td class="n">${r.cov===Infinity?'—':r.cov>999?'999+':r.cov.toFixed(0)}</td><td class="n">${fmt(r.rl)}</td><td class="n">${fmt(r.rop)}</td>
     <td class="n"><b>${r.sug?fmt(r.sug):'—'}</b>${r.sug?` <span class="mini">${esc(r.unit)}</span>`:''}</td><td class="n">${r.sug?baht(r.cost2):'—'}</td>
     <td><span class="pill ${PRI[r.pr][1]}">${PRI[r.pr][2]} ${PRI[r.pr][0]}</span></td></tr>`).join('')}</tbody></table>`:'<div class="empty">ไม่มีรายการในกลุ่มนี้</div>';
  $('#pl-table').querySelectorAll('tr.clk').forEach(tr=>{
    tr.addEventListener('click',()=>openDrug(tr.dataset.sku));
    tr.addEventListener('keydown',e=>{if(e.key==='Enter')openDrug(tr.dataset.sku)});
  });
  $('#pl-risk').innerHTML=risk.length?`<table><thead><tr><th>ยา</th><th>ล็อต</th><th>หมดอายุ</th><th class="n">เหลือ (วัน)</th><th class="n">คงเหลือ</th><th class="n">คาดใช้ทัน</th><th class="n">เสี่ยงเหลือทิ้ง</th><th class="n">มูลค่าที่เสี่ยง</th></tr></thead><tbody>${
    risk.map(r=>`<tr><td><b>${esc(r.name)}</b><br><span class="mini">${r.sku} · ใช้เฉลี่ย ${r.rate}/วัน</span></td><td>${r.lot}</td><td>${fdy(r.exp)}</td><td class="n"><span class="pill ${r.days<=60?'r':'o'}">${r.days}</span></td>
     <td class="n">${fmt(r.q)}</td><td class="n">${fmt(r.use)}</td><td class="n"><b>${fmt(r.risk)}</b> <span class="mini">${esc(r.unit)}</span></td><td class="n">${baht(r.val)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">ไม่มีล็อตที่เสี่ยงหมดอายุก่อนใช้หมด</div>';
}

/* =====================================================================
   Drug Explorer
   ===================================================================== */
const EX={q:'',cat:'',form:'',status:'',src:'',sort:'dn',dir:-1,page:0,size:12,sel:null};
let exInit=false;
function exFiltered(){
  const q=EX.q.trim().toLowerCase();
  const a=D.drugs.filter(r=>{
    if(q&&!(`${r.sku} ${r.name} ${r.strength} ${r.atc} ${r.cat} ${r.form}`).toLowerCase().includes(q))return false;
    if(EX.cat&&r.cat!==EX.cat)return false;
    if(EX.form&&r.form!==EX.form)return false;
    if(EX.src==='new'&&!r.new)return false;
    if(EX.src==='old'&&r.new)return false;
    const s=EX.status;
    if(s==='stock'&&!r.nlots)return false;
    if(s==='none'&&r.nlots)return false;
    if(s==='low'&&!(r.nlots&&r.q<r.rl))return false;
    if(s==='near'&&!(r.exp&&daysTo(r.exp)<=90))return false;
    if(s==='disp'&&!r.dn)return false;
    return true;
  });
  const k=EX.sort,d=EX.dir;
  a.sort((x,y)=>{
    let c=typeof x[k]==='string'?String(x[k]).localeCompare(String(y[k]),'th'):(x[k]-y[k]);
    return (c*d)||x.name.localeCompare(y.name);
  });
  return a;
}
function exInitUI(){
  exInit=true;
  const opt=(v,t)=>`<option value="${esc(v)}">${esc(t)}</option>`;
  $('#ex-cat').innerHTML=opt('','ทุกหมวด')+D.ov.cats.map(c=>opt(c.name,`${c.name} (${c.n})`)).join('');
  $('#ex-form').innerHTML=opt('','ทุกรูปแบบ')+D.ov.forms.map(f=>opt(f.name,`${f.name} (${f.n})`)).join('');
  const bind=(id,key)=>$(id).addEventListener(id==='#ex-q'?'input':'change',e=>{EX[key]=e.target.value;EX.page=0;drawExplorer()});
  bind('#ex-q','q');bind('#ex-cat','cat');bind('#ex-form','form');bind('#ex-status','status');bind('#ex-src','src');
  $('#ex-reset').addEventListener('click',()=>{
    Object.assign(EX,{q:'',cat:'',form:'',status:'',src:'',page:0});
    ['#ex-q','#ex-cat','#ex-form','#ex-status','#ex-src'].forEach(i=>$(i).value='');drawExplorer();
  });
  if(!D.ov.n_new)$('#ex-src').closest('label').style.display='none';
  if(!EX.sel)EX.sel=[...D.drugs].sort((a,b)=>b.dn-a.dn)[0].sku;
}
function drawExplorer(){
  if(!exInit)exInitUI();
  const a=exFiltered(),pages=Math.max(1,Math.ceil(a.length/EX.size));
  EX.page=Math.min(EX.page,pages-1);
  const slice=a.slice(EX.page*EX.size,(EX.page+1)*EX.size);
  $('#ex-count').textContent=`แสดง ${fmt(a.length)} จาก ${fmt(D.drugs.length)} รายการ`;
  const cols=[['sku','SKU'],['name','ยา'],['cat','หมวด'],['atc','ATC'],['rl','Reorder','n'],['q','สต็อก','n'],['','สถานะ'],['dn','จ่าย (ครั้ง)','n']];
  const arrow=k=>EX.sort===k?(EX.dir>0?' ▲':' ▼'):'';
  $('#ex-table').innerHTML=`<thead><tr>${cols.map(([k,t,c])=>k?`<th class="sortable ${c||''}" data-k="${k}" aria-sort="${EX.sort===k?(EX.dir>0?'ascending':'descending'):'none'}">${t}${arrow(k)}</th>`:`<th>${t}</th>`).join('')}</tr></thead><tbody>${
   slice.length?slice.map(r=>{const near=r.exp&&daysTo(r.exp)<=90;
     return `<tr class="clk ${r.sku===EX.sel?'sel':''}" tabindex="0" data-sku="${r.sku}"><td><code>${r.sku}</code></td>
     <td><b>${esc(nameOf(r))}</b> ${r.unreg?'<span class="pill r" title="ไม่อยู่ใน drugs.json">นอกบัญชี</span>':r.new?'<span class="pill m" title="เพิ่มใน v2.0">ใหม่</span>':''}<br><span class="mini">${esc(r.form)}</span></td>
     <td>${esc(r.cat)}</td><td>${r.atc||'—'}</td><td class="n">${fmt(r.rl)}</td><td class="n">${r.nlots?fmt(r.q):'—'}</td>
     <td>${pillH(dstat(r))}${near?' <span class="pill o" title="หมดอายุภายใน 90 วัน">⏱</span>':''}</td><td class="n">${r.dn||'—'}</td></tr>`}).join(''):`<tr><td colspan="8"><div class="empty">ไม่พบรายการที่ตรงกับตัวกรอง</div></td></tr>`}</tbody>`;
  $('#ex-table').querySelectorAll('th.sortable').forEach(th=>th.addEventListener('click',()=>{
    const k=th.dataset.k;if(EX.sort===k)EX.dir*=-1;else{EX.sort=k;EX.dir=(k==='dn'||k==='q'||k==='rl')?-1:1}EX.page=0;drawExplorer();}));
  $('#ex-table').querySelectorAll('tr.clk').forEach(tr=>{
    const pick=()=>{EX.sel=tr.dataset.sku;drawExplorer()};
    tr.addEventListener('click',pick);tr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}});
  });
  $('#ex-pager').innerHTML=`<span>หน้า ${EX.page+1} / ${pages}</span><span><button class="btn" id="pg-p" type="button" ${EX.page===0?'disabled':''}>← ก่อนหน้า</button> <button class="btn" id="pg-n" type="button" ${EX.page>=pages-1?'disabled':''}>ถัดไป →</button></span>`;
  $('#pg-p').addEventListener('click',()=>{EX.page--;drawExplorer()});
  $('#pg-n').addEventListener('click',()=>{EX.page++;drawExplorer()});
  renderDetail(EX.sel);
}
function renderDetail(sku){
  const r=D.drugs.find(x=>x.sku===sku),node=$('#ex-detail');
  if(!r){node.innerHTML='<div class="empty">เลือกยาจากตารางเพื่อดูรายละเอียด</div>';return}
  const u=r.dq/D.pdays,cov=(u>0&&r.q>0)?r.q/u:null;
  const atcName=(D.ov.atc.find(a=>a.code===r.atc[0])||{}).name||'-';
  const chain=r.atc?[r.atc[0],r.atc.slice(0,3),r.atc.slice(0,4),r.atc.slice(0,5),r.atc]:[];
  const byDay={};r.dd.forEach(([d,q])=>byDay[d]=(byDay[d]||0)+q);
  const bars=D.days.map(x=>({d:x.d,q:byDay[x.d]||0}));
  const mx=Math.max(1,...bars.map(b=>b.q)),bw=300/bars.length;
  const svg=`<svg viewBox="0 0 300 70" width="100%" height="70" role="img" aria-label="ปริมาณที่จ่ายรายวัน"><line x1="0" x2="300" y1="62" y2="62" stroke="var(--grid)"/>${
    bars.map((b,i)=>{const h=b.q/mx*50;return b.q?`<path class="db" data-i="${i}" d="${rtop(i*bw+1.5,62-h,bw-3,h,2)}" fill="var(--blue)"/>`:''}).join('')}${
    bars.map((b,i)=>`<rect class="dh2" data-i="${i}" x="${i*bw}" y="0" width="${bw}" height="62" fill="transparent"/>`).join('')}
    <text x="0" y="69" style="font-size:9px">${fd(D.days[0].d)}</text><text x="300" y="69" text-anchor="end" style="font-size:9px">${fd(D.days[D.days.length-1].d)}</text></svg>`;
  const dst=dstat(r);
  node.innerHTML=`<h3 class="dh">${esc(nameOf(r))}</h3>
   <div class="mini">${r.sku} · ${esc(r.form)} · หน่วย: ${esc(r.unit)}</div>
   <div class="dtags">${pillH(dst)}${r.unreg?'<span class="pill r">ไม่อยู่ในบัญชียา</span>':r.new?'<span class="pill m">เพิ่มใน v2.0 · ยังไม่ได้ตรวจทาน</span>':''}${r.exp&&daysTo(r.exp)<=90?`<span class="pill o">⏱ หมดอายุ ${daysTo(r.exp)} วัน</span>`:''}</div>
   <div class="mini">${esc(r.cat)}</div>
   <div class="dsec">${r.atc?`รหัส ATC · กลุ่มหลัก ${r.atc[0]}: ${esc(atcName)}`:'รหัส ATC · ไม่มีข้อมูล (ไม่อยู่ในบัญชียา)'}</div>
   <div class="atcchain">${chain.map(c=>`<code>${c}</code>`).join('')}</div>
   <div class="dgrid">
    <div class="st"><small>สต็อกที่ใช้ได้</small><b>${r.nlots?fmt(r.q):'—'}<em>${r.nlots?esc(r.unit):''}</em></b></div>
    <div class="st"><small>Reorder level</small><b>${fmt(r.rl)}<em>${esc(r.unit)}</em></b></div>
    <div class="st"><small>จ่ายในช่วงข้อมูล</small><b>${r.dn}<em>ครั้ง</em></b></div>
    <div class="st"><small>ผู้ป่วย (ไม่ซ้ำ)</small><b>${r.dp}<em>คน</em></b></div>
    <div class="st"><small>ปริมาณที่จ่ายรวม</small><b>${fmt(r.dq)}<em>${esc(r.unit)}</em></b></div>
    <div class="st"><small>ครอบคลุม</small><b>${cov===null?'—':cov>999?'999+':cov.toFixed(0)}<em>${cov===null?'':'วัน'}</em></b></div>
   </div>
   <div class="dsec">ปริมาณที่จ่ายรายวัน${r.last?` · ล่าสุด ${fdy(r.last)}`:''}</div>
   ${r.dn?svg:'<div class="mini">ไม่มีการจ่ายในช่วงข้อมูล</div>'}
   <div class="dsec">ล็อตในสต็อก</div>
   ${r.lots.length?`<div class="scroll"><table><thead><tr><th>ล็อต</th><th>หมดอายุ</th><th class="n">คงเหลือ</th><th>สถานะ</th></tr></thead><tbody>${
     r.lots.map(l=>`<tr><td>${l.lot}</td><td>${l.exp?fdy(l.exp):'<i class="mini">ไม่ระบุ</i>'}</td><td class="n">${fmt(l.q)}</td><td>${pillH(PILL[l.st]||[l.st,'m'])}</td></tr>`).join('')}</tbody></table></div>`:'<div class="mini">ไม่มีข้อมูลสต็อกของยานี้ใน stock.json</div>'}`;
  node.querySelectorAll('.dh2').forEach(h=>{
    const b=bars[+h.dataset.i],p=node.querySelector(`.db[data-i="${h.dataset.i}"]`);
    h.addEventListener('mousemove',e=>{if(p)p.setAttribute('opacity','.75');showTip(e,`<b>${fdl(b.d)}</b>${b.q?`จ่าย ${fmt(b.q)} ${esc(r.unit)}`:'ไม่มีการจ่าย'}`)});
    h.addEventListener('mouseleave',()=>{if(p)p.removeAttribute('opacity');hideTip()});
  });
}
function openDrug(sku){
  Object.assign(EX,{q:'',cat:'',form:'',status:'',src:'',sel:sku});
  if(exInit)['#ex-q','#ex-cat','#ex-form','#ex-status','#ex-src'].forEach(i=>$(i).value='');
  const idx=exFiltered().findIndex(r=>r.sku===sku);
  EX.page=idx>=0?Math.floor(idx/EX.size):0;
  showTab('explorer');
  window.scrollTo({top:0,behavior:'smooth'});
}

/* =====================================================================
   Tab routing
   ===================================================================== */

/* =====================================================================
   Data Quality
   ===================================================================== */
const QA={f:'all'};let qaInit=false;
const KIND={fixed:['แก้ไขแล้ว','b'],excluded:['ไม่นับ','r'],flagged:['ติดธงให้ตรวจ','o']};
function drawQuality(){
  const Q=D.qa,L=[...Q.log].sort((a,b)=>a.file.localeCompare(b.file)||String(a.id).localeCompare(String(b.id)));
  const totalRows=Q.files.reduce((a,f)=>a+f.rows,0);
  kpiRow($('#qa-kpis'),[
    {ic:'layers',lb:'แถวข้อมูลที่ตรวจ',v:totalRows,u:'แถว',ft:`${Q.files.length} ไฟล์ · dispense, stock, drugs`},
    {ic:'low',lb:'ประเด็นที่พบ',v:L.length,u:'รายการ',ft:'บันทึกครบใน exception log'},
    {ic:'pause',lb:'ไม่นับในตัวเลข',v:Q.kinds.excluded||0,u:'รายการ',ft:'void · นอกช่วงเวลา · ติดลบ · ล็อตซ้ำ'},
    {ic:'rx',lb:'แก้รูปแบบอัตโนมัติ',v:Q.kinds.fixed||0,u:'รายการ',ft:'วันที่ ข้อความ รหัสซ้ำ'},
    {ic:'clock',lb:'ติดธงให้ตรวจ',v:Q.kinds.flagged||0,u:'รายการ',ft:'นับตามจริงแต่ควรยืนยันกับต้นทาง',warn:true,tag:'ควรตรวจ'}
  ],!qaInit);
  hbars($('#qa-files'),Q.files,{l:f=>`${f.file} (${fmt(f.rows)} แถว)`,v:f=>f.issues,min:Math.max(...Q.files.map(f=>f.issues)),f:f=>f.issues+' ประเด็น',
    tip:f=>`<b>${esc(f.file)}</b>${fmt(f.rows)} แถว · พบ ${f.issues} ประเด็น (${f.rows_affected} แถวที่ได้รับผลกระทบ)`});
  const w=Q.files.slice().sort((a,b)=>b.issues-a.issues)[0];
  $('#s-qafile').innerHTML=`<b>${esc(w.file)}</b> พบมากที่สุด ${w.issues} ประเด็น · drugs.json ไม่พบความผิดปกติในตัวไฟล์เอง`;
  $('#qa-ba').innerHTML=`<table><thead><tr><th>รายการ</th><th class="n">ก่อน (ดิบ)</th><th class="n">หลัง (สะอาด)</th><th class="n">ผลต่าง</th><th>หมายเหตุ</th></tr></thead><tbody>${
    Q.ba.map(b=>{const f=x=>b.money?baht(x):fmt(x),d=b.clean-b.raw;return `<tr><td><b>${esc(b.label)}</b></td><td class="n">${f(b.raw)}</td><td class="n"><b>${f(b.clean)}</b></td><td class="n">${d===0?'—':(d>0?'+':'−')+f(Math.abs(d))}</td><td class="mini">${esc(b.note)}</td></tr>`}).join('')}</tbody></table>`;
  if(!qaInit){
    qaInit=true;
    $('#qa-seg').innerHTML=[['all','ทั้งหมด'],['fixed','แก้ไขแล้ว'],['excluded','ไม่นับ'],['flagged','ติดธงให้ตรวจ']].map(([k,t])=>`<button type="button" data-f="${k}" aria-pressed="${k==='all'}">${t}</button>`).join('');
    $('#qa-seg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;QA.f=b.dataset.f;drawQuality()});
    $('#qa-dl').addEventListener('click',()=>{
      const rows=[['ไฟล์','รหัสแถว','ฟิลด์','ปัญหาที่พบ','วิธีจัดการ','ประเภท']].concat(L.map(l=>[l.file,l.id,l.field,l.found,l.action,KIND[l.kind][0]]));
      const csv='\ufeff'+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\r\n');
      try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='exception_log.csv';document.body.appendChild(a);a.click();a.remove()}catch(e){}
    });
  }
  document.querySelectorAll('#qa-seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===QA.f));
  const shown=L.filter(l=>QA.f==='all'||l.kind===QA.f);
  $('#s-qalog').innerHTML=`แสดง ${shown.length} จาก ${L.length} ประเด็น · เรียงตามไฟล์และรหัสแถว`;
  $('#qa-log').innerHTML=`<table><thead><tr><th>ไฟล์</th><th>รหัสแถว</th><th>ฟิลด์</th><th>ปัญหาที่พบ</th><th>วิธีจัดการ</th><th>ประเภท</th></tr></thead><tbody>${
    shown.map(l=>`<tr><td class="mini">${esc(l.file)}</td><td><code>${esc(l.id)}</code></td><td>${esc(l.field)}</td><td>${esc(l.found)}</td><td>${esc(l.action)}</td><td>${pillH(KIND[l.kind])}</td></tr>`).join('')}</tbody></table>`;
}
const TABDRAW={sales:drawAll,overview:drawOverview,plan:drawPlan,explorer:drawExplorer,quality:drawQuality};
let curTab='sales',salesCounted=false;
function showTab(t){
  if(!TABDRAW[t])t='sales';
  curTab=t;
  document.querySelectorAll('.tab-btn').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t));
  document.querySelectorAll('.tabpane').forEach(p=>p.classList.toggle('on',p.id==='pane-'+t));
  TABDRAW[t]();
  if(t==='sales'&&!salesCounted){countUp();salesCounted=true}
  try{history.replaceState(null,'','#'+t)}catch(e){}
}
document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>{showTab(b.dataset.tab);window.scrollTo({top:0,behavior:'smooth'})}));
showTab((location.hash||'').slice(1)||'sales');
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(curTab!=='explorer')TABDRAW[curTab]()},150)});

$('#theme').addEventListener('click',()=>{
  const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme=dark?'light':'dark';
});
