import { layoutGlyphs, normalizeArabic, VECTOR_FONT_STYLES } from './arabic.js';
import { keyedFloat, hashHex } from './hash.js';

const W = 1400;
const PALETTES = {
  gold: {name:'ذهب على ليل',bg:'#070b11',glow:'#15202a',ink:'#d6a84f',light:'#fff0b8',deep:'#76501d',accent:'#496071',dust:'#e8d6a6'},
  ivory:{name:'حبر على ورق',bg:'#e8ddc5',glow:'#fff8e9',ink:'#20221f',light:'#6f4a22',deep:'#0e1515',accent:'#b08a4d',dust:'#715b3c'},
  lapis:{name:'لازورد وذهب',bg:'#07182d',glow:'#173658',ink:'#d7bd78',light:'#fff1c2',deep:'#8e692d',accent:'#4f8db0',dust:'#b6cee0'},
  jade: {name:'زمرد',bg:'#061b18',glow:'#153a32',ink:'#b9d6bb',light:'#f0e0a7',deep:'#537e6c',accent:'#ceac60',dust:'#d0e5d0'},
  ember:{name:'عنبر',bg:'#211016',glow:'#48212b',ink:'#e4b66d',light:'#fff0cf',deep:'#99504a',accent:'#c86f60',dust:'#f4d1ae'},
  silver:{name:'فضة',bg:'#10171e',glow:'#26323b',ink:'#d5e0e5',light:'#ffffff',deep:'#70838f',accent:'#7f9fb1',dust:'#dce9ec'}
};
const MODES = new Set(['classic','flow','seal','geometric','minimal']);
const round = n => Number(n.toFixed(2));
const xml = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&apos;");
const rnd = (seed,key,min,max) => round(keyedFloat(seed,key,min,max));

function shapeWord(raw, fontStyle) {
  const letters = normalizeArabic(raw);
  if (!letters) return null;
  const shaped = layoutGlyphs([...letters], fontStyle);
  const b = shaped.bounds;
  return {letters,tokens:shaped.tokens,bounds:b,width:Math.max(1,b.xMax-b.xMin),height:Math.max(1,b.yMax-b.yMin)};
}
function makeLine(words) {
  return {words,width:words.reduce((s,w)=>s+w.width,0)+Math.max(0,words.length-1)*270,height:Math.max(...words.map(w=>w.height))};
}
function wrapText(text,maxUnits,fontStyle) {
  const lines=[];
  for (const paragraph of String(text).replace(/\r/g,'').split('\n')) {
    const words=paragraph.trim().split(/\s+/).map(word => shapeWord(word, fontStyle)).filter(Boolean);
    let row=[],used=0;
    for (const word of words) {
      const next=used+(row.length?270:0)+word.width;
      if (row.length&&next>maxUnits) { lines.push(makeLine(row));row=[];used=0; }
      if (row.length) used+=270;
      row.push(word);used+=word.width;
    }
    if (row.length) lines.push(makeLine(row));
  }
  return lines;
}
function diamond(x,y,size,color,opacity=1) {
  return `<path d="M ${round(x)} ${round(y-size)} L ${round(x+size*.7)} ${round(y)} L ${round(x)} ${round(y+size)} L ${round(x-size*.7)} ${round(y)} Z" fill="${color}" opacity="${opacity}"/>`;
}
function star(x,y,rad,color,opacity=1) {
  const pts=[];
  for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,rr=i%2?rad*.25:rad;pts.push(`${round(x+Math.cos(a)*rr)},${round(y+Math.sin(a)*rr)}`);}
  return `<polygon points="${pts.join(' ')}" fill="${color}" opacity="${opacity}"/>`;
}
function grain(seed,p,detail,height) {
  let out='';
  for(let i=0;i<28+detail*21;i++){const x=rnd(seed,`gx${i}`,35,W-35),y=rnd(seed,`gy${i}`,35,height-35),r=rnd(seed,`gr${i}`,.55,2.2),op=rnd(seed,`go${i}`,.08,.3);out+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${p.dust}" opacity="${op}"/>`;}
  return out;
}
function frame(mode,p,height,seed) {
  const c=p.accent,m=height/2;
  if(mode==='seal'){
    const rr=Math.min(W*.43,height*.43),ticks=[];
    for(let i=0;i<40;i++){const a=i/40*Math.PI*2,x1=W/2+Math.cos(a)*(rr-16),y1=m+Math.sin(a)*(rr-16),x2=W/2+Math.cos(a)*(rr-6),y2=m+Math.sin(a)*(rr-6);ticks.push(`<path d="M ${round(x1)} ${round(y1)} L ${round(x2)} ${round(y2)}" stroke="${p.ink}" stroke-width="${i%5===0?3:1}" opacity=".7"/>`);}
    return `<g fill="none" stroke="${c}"><circle cx="${W/2}" cy="${m}" r="${round(rr)}" stroke-width="2.4"/><circle cx="${W/2}" cy="${m}" r="${round(rr-14)}" stroke-width=".8"/><circle cx="${W/2}" cy="${m}" r="${round(rr-27)}" stroke-dasharray="2 8" stroke-width=".7"/></g>${ticks.join('')}${star(W/2,m-rr+4,10,p.light)}${star(W/2,m+rr-4,10,p.light)}${star(W/2-rr+4,m,10,p.light)}${star(W/2+rr-4,m,10,p.light)}`;
  }
  if(mode==='geometric'){
    return `<rect width="${W}" height="${height}" fill="url(#grid)"/><g fill="none" stroke="${c}" opacity=".8"><path d="M ${W/2} 60 L ${W-60} ${m} L ${W/2} ${height-60} L 60 ${m} Z"/><path d="M ${W/2} 84 L ${W-84} ${m} L ${W/2} ${height-84} L 84 ${m} Z" stroke-dasharray="2 8"/><rect x="86" y="86" width="${W-172}" height="${height-172}"/></g>${diamond(94,94,10,p.light)}${diamond(W-94,94,10,p.light)}${diamond(94,height-94,10,p.light)}${diamond(W-94,height-94,10,p.light)}`;
  }
  if(mode==='minimal') return `<g fill="none" stroke="${c}" stroke-width="1.6"><path d="M 75 165 V 75 H 165 M ${W-165} 75 H ${W-75} V 165 M 75 ${height-165} V ${height-75} H 165 M ${W-165} ${height-75} H ${W-75} V ${height-165}"/></g>`;
  if(mode==='classic'){
    return `<g fill="none" stroke="${c}"><rect x="45" y="45" width="${W-90}" height="${height-90}" rx="4" stroke-width="2"/><rect x="64" y="64" width="${W-128}" height="${height-128}" stroke-width=".8" opacity=".7"/><path d="M 88 112 Q 88 88 112 88 M ${W-112} 88 Q ${W-88} 88 ${W-88} 112 M 88 ${height-112} Q 88 ${height-88} 112 ${height-88} M ${W-112} ${height-88} Q ${W-88} ${height-88} ${W-88} ${height-112}" stroke-width="3"/></g>${star(91,91,12,p.light)}${star(W-91,91,12,p.light)}${star(91,height-91,12,p.light)}${star(W-91,height-91,12,p.light)}${diamond(W/2,86,7,p.light)}${diamond(W/2,height-86,7,p.light)}`;
  }
  const shift=rnd(seed,'flow-shift',-24,24);
  return `<g fill="none" stroke="${c}" stroke-width="1.7" opacity=".85"><path d="M 75 ${m-80+shift} C 155 ${m-140} 238 ${m+18} 100 ${m+70} C 55 ${m+83} 55 ${m+29} 112 ${m+27}"/><path d="M ${W-75} ${m+80-shift} C ${W-155} ${m+140} ${W-238} ${m-18} ${W-100} ${m-70} C ${W-55} ${m-83} ${W-55} ${m-29} ${W-112} ${m-27}"/><path d="M 110 ${height-104} Q ${W/2} ${height-40} ${W-110} ${height-104}" stroke-dasharray="1 9"/></g>${star(112,m,10,p.light)}${star(W-112,m,10,p.light)}`;
}
function flourishes(seed,p,box,mode,detail,height) {
  const out=[],y1=box.top+(box.bottom-box.top)*.26,y2=box.bottom-(box.bottom-box.top)*.18,left=Math.max(100,box.left-32),right=Math.min(W-100,box.right+32);
  if(mode==='flow'||mode==='classic'){
    out.push(`<g fill="none" stroke="${p.accent}" stroke-linecap="round"><path d="M ${rnd(seed,'fl1x',105,230)} ${round(y1+28)} C ${rnd(seed,'fl1c1',210,340)} ${round(y1-85)} ${round(left-110)} ${round(y1+80)} ${round(left)} ${round(y1)}" stroke-width="3.2"/><path d="M ${round(right)} ${round(y2)} C ${round(right+95)} ${round(y2-60)} ${rnd(seed,'fl2c',W-340,W-200)} ${round(y2+85)} ${rnd(seed,'fl2x',W-230,W-105)} ${round(y2-22)}" stroke-width="3.2"/><path d="M ${rnd(seed,'fl3x',260,460)} ${round(y2+65)} Q ${W/2} ${round(y2+105)} ${rnd(seed,'fl4x',W-460,W-260)} ${round(y2+46)}" stroke-width="1.5" opacity=".6"/></g>`);
    for(let i=0;i<detail*2;i++) out.push(diamond(rnd(seed,`fdx${i}`,115,W-115),rnd(seed,`fdy${i}`,Math.max(90,box.top-85),Math.min(height-90,box.bottom+95)),rnd(seed,`fds${i}`,3,6),p.light,.7));
  }else if(mode==='seal'){
    const rr=Math.min(W*.43,Math.max(350,(box.bottom-box.top)*.82));
    for(let i=0;i<detail*4;i++){const a=keyedFloat(seed,`sa${i}`,0,Math.PI*2),rad=rr+rnd(seed,`sr${i}`,-22,22);out.push(star(W/2+Math.cos(a)*rad,(box.top+box.bottom)/2+Math.sin(a)*rad,rnd(seed,`ss${i}`,4,7),p.light,.7));}
  }else if(mode==='geometric'){
    for(let i=0;i<detail*3;i++)out.push(diamond(rnd(seed,`dx${i}`,130,W-130),rnd(seed,`dy${i}`,105,Math.max(130,box.top-65)),rnd(seed,`ds${i}`,3,7),p.accent,.8));
  }
  return out.join('');
}
function glyphPaths(lines,scale,startY,gapPx,p) {
  const groups=[];let y=startY;
  for(const line of lines){
    const h=line.height*scale,w=line.width*scale;let x=W/2+w/2;
    for(const word of line.words){
      const ww=word.width*scale,wh=word.height*scale,left=x-ww,top=y+(h-wh)/2;
      const transform=`translate(${round(left)} ${round(top+wh)}) scale(${round(scale)} ${round(-scale)}) translate(${round(-word.bounds.xMin)} ${round(-word.bounds.yMin)})`;
      const paths=word.tokens.map(t=>`<path d="${t.glyph.path}" transform="translate(${round(t.x)} 0)"/>`).join('');
      groups.push(`<g transform="${transform}">${paths}</g>`);x=left-270*scale;
    }
    y+=h+gapPx;
  }
  const g=groups.join('');
  return `<g fill="#000" opacity=".52" transform="translate(7 10)">${g}</g><g fill="url(#metal)" stroke="${p.deep}" stroke-width="2.6" stroke-linejoin="round" filter="url(#shadow)">${g}</g><g fill="none" stroke="${p.light}" stroke-width="1.05" opacity=".55" transform="translate(-1 -1)">${g}</g>`;
}
export function renderArtSvg(rawText,options={}) {
  const text=String(rawText??'').trim();if(!text)throw new Error('اكتب عبارة عربية أولًا.');
  const mode=MODES.has(options.mode)?options.mode:'classic';
  const fontStyle=VECTOR_FONT_STYLES.some(item=>item.key===options.fontStyle)?options.fontStyle:'amiri';
  const fontFamily=VECTOR_FONT_STYLES.find(item=>item.key===fontStyle).name;
  const palette=Object.hasOwn(PALETTES,options.palette)?options.palette:'gold',p=PALETTES[palette];
  const detail=Math.max(1,Math.min(5,Math.round(Number(options.detail)||3)));
  const desired=Math.max(.25,Math.min(.56,Number(options.scale)||.43));
  const seed=String(options.seed||text),key=seed+'|'+mode+'|'+palette+'|'+fontStyle+'|'+detail+'|'+text;
  const maxWidth=mode==='seal'?790:mode==='geometric'?1060:1160;
  const lines=wrapText(text,maxWidth/desired,fontStyle);
  if(!lines.length)throw new Error('لم أجد حروفًا عربية مدعومة. اكتب نصًا عربيًا واضحًا.');
  if(lines.length>9)throw new Error('النص طويل جدًا لهذا التكوين. استخدم تسعة أسطر أو أقل.');
  const totalUnits=lines.reduce((sum,line)=>sum+line.height,0)+Math.max(0,lines.length-1)*260;
  const scale=Math.max(.08,Math.min(desired,maxWidth/Math.max(...lines.map(l=>l.width)),(mode==='seal'?455:890)/totalUnits));
  const gapPx=260*scale,lineHeights=lines.map(l=>l.height*scale);
  const contentH=lineHeights.reduce((a,b)=>a+b,0)+Math.max(0,lines.length-1)*gapPx;
  const height=mode==='seal'?1000:Math.max(900,Math.min(1800,Math.ceil(contentH+360)));
  const startY=(height-contentH)/2;let y=startY;
  const box={left:W,right:0,top:Infinity,bottom:0};
  for(const line of lines){const h=line.height*scale,w=line.width*scale;box.left=Math.min(box.left,W/2-w/2);box.right=Math.max(box.right,W/2+w/2);box.top=Math.min(box.top,y);box.bottom=Math.max(box.bottom,y+h);y+=h+gapPx;}
  const id='rawnq-'+hashHex(key),background=grain(key,p,detail,height),frames=frame(mode,p,height,key),fl=flourishes(key,p,box,mode,detail,height);
  const glyphs=glyphPaths(lines,scale,startY,gapPx,p);
  const halo=`<ellipse cx="${W/2}" cy="${height/2}" rx="${round(Math.min(W*.43,(box.right-box.left)/2+145))}" ry="${round(Math.min(height*.36,(box.bottom-box.top)/2+130))}" fill="${p.accent}" opacity=".08"/>`;
  const sideLines=`<g fill="none" stroke="${p.accent}" opacity=".33" stroke-width="1"><path d="M 145 ${height*.24} C 265 ${height*.12} 230 ${height*.4} 120 ${height*.43}"/><path d="M ${W-145} ${height*.24} C ${W-265} ${height*.12} ${W-230} ${height*.4} ${W-120} ${height*.43}"/><path d="M 145 ${height*.76} C 275 ${height*.87} 220 ${height*.6} 120 ${height*.64}"/><path d="M ${W-145} ${height*.76} C ${W-275} ${height*.87} ${W-220} ${height*.6} ${W-120} ${height*.64}"/></g>`;
  const marks=Array.from({length:detail*2},(_,i)=>i%2?star(rnd(key,`mx${i}`,110,W-110),rnd(key,`my${i}`,100,height-100),rnd(key,`ms${i}`,4,8),p.light,.8):diamond(rnd(key,`nx${i}`,110,W-110),rnd(key,`ny${i}`,100,height-100),rnd(key,`ns${i}`,4,8),p.ink,.8)).join('');
  const title=xml(text);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">
<title>${title}</title><desc>Code-generated Arabic calligraphic composition using standalone vector glyph paths from ${fontFamily} and SVG ornament. No runtime font or image is needed.</desc>
<defs><radialGradient id="${id}-bg" cx="50%" cy="42%" r="78%"><stop offset="0%" stop-color="${p.glow}"/><stop offset="100%" stop-color="${p.bg}"/></radialGradient>
<linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${p.light}"/><stop offset="22%" stop-color="${p.ink}"/><stop offset="46%" stop-color="${p.light}"/><stop offset="64%" stop-color="${p.deep}"/><stop offset="82%" stop-color="${p.ink}"/><stop offset="100%" stop-color="${p.light}"/></linearGradient>
<filter id="shadow" x="-18%" y="-18%" width="136%" height="136%"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/><feOffset dy="4" dx="1" result="offset"/><feComponentTransfer><feFuncA type="linear" slope=".5"/></feComponentTransfer><feMerge><feMergeNode in="offset"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M 44 0 L 0 0 0 44" fill="none" stroke="${p.accent}" stroke-width=".55" opacity=".14"/></pattern></defs>
<rect width="${W}" height="${height}" fill="url(#${id}-bg)"/>${halo}${mode==='geometric'?`<rect width="${W}" height="${height}" fill="url(#grid)" opacity=".7"/>`:''}${sideLines}${background}${frames}${fl}<g>${marks}</g>${glyphs}
<g fill="none" stroke="${p.light}" opacity=".28" stroke-width=".8"><path d="M 160 ${height-130} H 355 M ${W-355} ${height-130} H ${W-160}"/><circle cx="${W/2}" cy="${height-130}" r="4" fill="${p.ink}" stroke="none"/><circle cx="${W/2-14}" cy="${height-130}" r="2" fill="${p.light}" stroke="none"/><circle cx="${W/2+14}" cy="${height-130}" r="2" fill="${p.light}" stroke="none"/></g></svg>`;
  return {svg,width:W,height,fontStyle,fontFamily,normalized:lines.flatMap(l=>l.words.map(w=>w.letters)).join(' '),lineCount:lines.length,glyphCount:lines.reduce((s,l)=>s+l.words.reduce((n,w)=>n+w.tokens.length,0),0),scale};
}
export const ART_PALETTES=Object.freeze(Object.fromEntries(Object.entries(PALETTES).map(([key,p])=>[key,{name:p.name,bg:p.bg,ink:p.ink,accent:p.accent}])));