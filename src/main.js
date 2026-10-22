import { renderArtSvg, ART_PALETTES } from './art-engine.js';
const $=id=>document.getElementById(id);
const input=$('phrase'),preview=$('artPreview'),status=$('statusLine'),seedInput=$('seed'),scaleInput=$('density'),detailInput=$('detail');
let mode='classic',palette='gold',activeSvg='',currentHeight=1000;
function settings(){return {mode,palette,seed:seedInput.value.trim()||input.value,scale:Number(scaleInput.value),detail:Number(detailInput.value)};}
function setActive(selector,value,attr){document.querySelectorAll(selector).forEach(el=>{const yes=el.getAttribute(attr)===value;el.classList.toggle('active',yes);el.setAttribute('aria-pressed',String(yes));});}
function render(){
 try{
  const result=renderArtSvg(input.value,settings());activeSvg=result.svg;currentHeight=result.height;preview.innerHTML=result.svg;preview.classList.remove('empty');
  status.textContent='تم توليد تكوين متجهي من المسارات — لا توجد خطوط ويب مطلوبة.';status.classList.remove('error-text');
  $('statGlyphs').textContent=result.glyphCount.toLocaleString('ar');$('statLines').textContent=result.lineCount.toLocaleString('ar');$('statScale').textContent=Math.round(result.scale*100)+'٪';
  $('paletteName').textContent=ART_PALETTES[palette].name;$('artMeta').textContent=result.width+' × '+result.height+' · SVG Paths';
 }catch(e){
  activeSvg='';preview.innerHTML='<div class="empty-state"><div class="empty-rosette">✳</div><strong>مساحة التكوين جاهزة</strong><p>أدخل عبارة عربية مدعومة ليبدأ الكود برسمها.</p></div>';preview.classList.add('empty');
  status.textContent=e.message||'تعذر توليد العمل.';status.classList.add('error-text');
  $('statGlyphs').textContent='—';$('statLines').textContent='—';$('statScale').textContent='—';
 }
}
function notify(text){const t=$('toast');t.textContent=text;t.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.classList.remove('show'),2300);}
function filename(){return 'rawnq-calligraphy-'+new Date().toISOString().slice(0,10);}
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
function requireArt(){if(!activeSvg){notify('أدخل نصًا عربيًا أولًا');return false;}return true;}
async function copy(value){try{await navigator.clipboard.writeText(value);notify('تم النسخ');}catch{notify('لم يسمح المتصفح بالنسخ؛ جرّب التصدير.');}}
$('exportSvg').addEventListener('click',()=>{if(requireArt()){download(new Blob([activeSvg],{type:'image/svg+xml;charset=utf-8'}),filename()+'.svg');notify('تم تنزيل SVG متجهي؛ الحروف مسارات وليست نص خطّي.');}});
$('exportPng').addEventListener('click',()=>{
 if(!requireArt())return;
 const url=URL.createObjectURL(new Blob([activeSvg],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
 img.onload=()=>{const c=document.createElement('canvas');c.width=2800;c.height=Math.round(2800*currentHeight/1400);const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);c.toBlob(blob=>{if(blob)download(blob,filename()+'.png');else notify('تعذر إنشاء PNG');URL.revokeObjectURL(url);},'image/png');};
 img.onerror=()=>{URL.revokeObjectURL(url);notify('تعذر تحويل العمل إلى PNG');};img.src=url;
});
$('copySvg').addEventListener('click',()=>{if(requireArt())copy(activeSvg);});
$('copyText').addEventListener('click',()=>copy(input.value));
$('reset').addEventListener('click',()=>{input.value='وَقُل رَّبِّ زِدْنِي عِلْمًا';seedInput.value='rawnaq-01';mode='classic';palette='gold';scaleInput.value='.43';detailInput.value='3';$('densityOut').textContent='متوازن';$('detailOut').textContent='متوسط';setActive('[data-mode]',mode,'data-mode');setActive('[data-palette]',palette,'data-palette');render();notify('تمت إعادة ضبط التكوين');});
$('randomize').addEventListener('click',()=>{const a=crypto.getRandomValues(new Uint32Array(2)).join('-');seedInput.value='rawnaq-'+a;render();notify('تغيّر التكوين مع بقاء النص نفسه');});
input.addEventListener('input',render);seedInput.addEventListener('input',render);
scaleInput.addEventListener('input',()=>{$('densityOut').textContent=Number(scaleInput.value)<.36?'صغير':Number(scaleInput.value)>.49?'بارز':'متوازن';render();});
detailInput.addEventListener('input',()=>{const d=Number(detailInput.value);$('detailOut').textContent=d<2?'هادئ':d>4?'كثيف':'متوسط';render();});
document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>{mode=el.getAttribute('data-mode');setActive('[data-mode]',mode,'data-mode');render();}));
document.querySelectorAll('[data-palette]').forEach(el=>el.addEventListener('click',()=>{palette=el.getAttribute('data-palette');setActive('[data-palette]',palette,'data-palette');render();}));
render();