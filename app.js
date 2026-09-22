const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

document.querySelector('.menu-btn').addEventListener('click',()=>document.querySelector('.topbar').classList.toggle('nav-open'));
$$('#nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.topbar').classList.remove('nav-open')));

const canvas = $('#trendChart'), ctx = canvas.getContext('2d');
let values = [3.12,3.14,3.13,3.18,3.17,3.21,3.20,3.22,3.24,3.23,3.25,3.26];
let alerts = [];
let running = false;

function fitCanvas(){
  const dpr=window.devicePixelRatio||1, rect=canvas.getBoundingClientRect();
  canvas.width=rect.width*dpr; canvas.height=180*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); drawChart();
}
function drawChart(){
  const w=canvas.clientWidth,h=180; ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='rgba(148,163,184,.10)';ctx.lineWidth=1;
  for(let i=1;i<5;i++){let y=i*h/5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  const min=Math.min(...values)-.08,max=Math.max(...values)+.08;
  const pts=values.map((v,i)=>[i*(w/(values.length-1)),h-25-(v-min)/(max-min)*(h-45)]);
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(56,217,255,.22)');g.addColorStop(1,'rgba(56,217,255,0)');
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fillStyle=g;ctx.fill();
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle='#38d9ff';ctx.lineWidth=2;ctx.stroke();
  pts.forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle='#07111f';ctx.fill();ctx.strokeStyle='#38d9ff';ctx.stroke()});
}
function setRisk(score){
  let level=score>=70?'HIGH':score>=40?'MEDIUM':'LOW';
  const ring=$('#riskRing'); ring.className='big-ring '+level.toLowerCase();
  $('#riskLabel').textContent=level; $('#riskScore').textContent=score;
  $('#meterFill').style.width=score+'%';
  $('#meterFill').style.background=level==='HIGH'?'#ff667d':level==='MEDIUM'?'#ffd166':'#45e0a1';
  $('#riskMessage').textContent=level==='HIGH'?'High-risk demo reading. Veterinary assessment would be required.':level==='MEDIUM'?'Moderate-risk demo reading. Continue monitoring and consider follow-up.':'Current simulated readings are within the low-risk demo range.';
  return level;
}
function addAlert(level,ec,temp){
  const time=new Date().toLocaleTimeString();
  alerts.unshift({level,ec,temp,time}); alerts=alerts.slice(0,6);
  $('#alertCount').textContent=alerts.length;
  $('#alertsList').innerHTML=alerts.map(a=>`<div class="alert ${a.level.toLowerCase()}"><i class="dot"></i><div><strong>${a.level} risk · Q${Math.ceil(Math.random()*4)}</strong><small>${a.ec.toFixed(2)} mS/cm · ${a.temp.toFixed(1)} °C · ${a.time}</small></div></div>`).join('');
}
function simulate(){
  const base=3.15+Math.random()*.32;
  const temp=36.7+Math.random()*.9;
  const ec=base+(Math.random()<.18?Math.random()*1.7:0);
  const score=Math.min(100,Math.max(4,Math.round((ec-3.0)*38+(temp-37)*7+Math.random()*18)));
  values.push(ec); if(values.length>18)values.shift();
  $('#ecValue').textContent=ec.toFixed(2); $('#tempValue').textContent=temp.toFixed(1);
  $('#quarterValue').textContent='Q'+(1+Math.floor(Math.random()*4));
  const trend=values.at(-1)-values.at(-3); $('#ecTrend').textContent=trend>.18?'rising':trend<-.12?'falling':'stable';
  $('#timeStamp').textContent=new Date().toLocaleTimeString();
  const level=setRisk(score);
  if(level!=='LOW') addAlert(level,ec,temp);
  drawChart();
  $('#toast').textContent=`Demo reading processed: ${level} risk`;
  $('#toast').classList.add('show'); setTimeout(()=>$('#toast').classList.remove('show'),1800);
}
$('#simulateBtn').addEventListener('click',simulate);
window.addEventListener('resize',fitCanvas);
fitCanvas();

const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
$$('.reveal').forEach(e=>obs.observe(e));

setInterval(()=>{if(running)simulate()},7000);
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='d')simulate()});
