const S=function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function i(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerpolicy&&(n.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?n.credentials="include":e.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(e){if(e.ep)return;e.ep=!0;const n=i(e);fetch(e.href,n)}};S();const d="#ffffff";document.querySelector("#app");const P=document.querySelector("#scoreEl"),y=document.querySelector("#resultEl"),c={over:!1,active:!0},h=document.querySelector("canvas");h.width=1024;h.height=576;const{left:L,top:F}=h.getBoundingClientRect(),s=h.getContext("2d"),x=100;let f=0,g="left";function T(){var t=Math.random()*255>>0,o=Math.random()*255>>0,i=Math.random()*255>>0;return"rgba("+t+", "+o+", "+i+", 0.5)"}class q{constructor(){this.color=d,this.radius=10,this.position={x:h.width/2,y:h.height/2},this.projectiles=[],this.opacity=1}draw(){s.save(),s.globalAlpha=this.opacity,s.beginPath(),s.fillStyle=this.color,s.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2),s.fill(),s.closePath(),s.restore()}shoot({x:o,y:i}){this.projectiles.push(new A({position:this.position,target:{x:o,y:i}}))}hide(o){this.opacity=0;for(let i=0;i<100;i++)o.push(new m({color:d,position:{x:this.position.x,y:this.position.y}}))}}class A{constructor({position:o,target:i,color:a,radius:e}){this.radius=e||6,this.color=a||d,this.position={x:o.x,y:o.y},this.target={x:i.x,y:i.y},this.velocity={x:(this.position.x-this.target.x)/x*-1,y:(this.position.y-this.target.y)/x*-1},this.opacity=1}draw(){s.save(),s.globalAlpha=this.opacity,s.fillStyle=this.color,s.beginPath(),s.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2,!1),s.fill(),s.closePath(),s.restore()}update(){this.draw(),Math.abs(this.position.x-this.target.x)>1||Math.abs(this.position.y-this.target.y)>1?(this.position.x+=this.velocity.x,this.position.y+=this.velocity.y):(this.velocity.x=0,this.velocity.y=0,this.opacity=0)}}class R{constructor({position:o,color:i,radius:a}){this.radius=a,this.color=i||d,this.position={x:o.x,y:o.y},this.target={x:r.position.x,y:r.position.y},this.velocity={x:(this.position.x-this.target.x)/500*-1,y:(this.position.y-this.target.y)/500*-1},this.opacity=1}draw(){s.save(),s.globalAlpha=this.opacity,s.fillStyle=this.color,s.beginPath(),s.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2,!1),s.fill(),s.closePath(),s.restore()}update(){this.draw(),Math.abs(this.position.x-this.target.x)>1||Math.abs(this.position.y-this.target.y)>1?(this.position.x+=this.velocity.x,this.position.y+=this.velocity.y):(this.velocity.x=0,this.velocity.y=0,this.opacity=0)}hide(o){this.opacity=0;for(let i=0;i<100;i++)o.push(new m({color:this.color,position:{x:this.position.x,y:this.position.y}}))}}const v=.99;class m{constructor({position:o,color:i}){this.position={x:o.x,y:o.y},this.velocity={x:Math.floor([-1,1][Math.random()*2|0]*(Math.random()*10)),y:Math.floor([-1,1][Math.random()*2|0]*(Math.random()*10))},this.color=i,this.radius=Math.random()*5,this.opacity=1}draw(){s.save(),s.globalAlpha=this.opacity,s.fillStyle=this.color,s.beginPath(),s.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2,!1),s.fill(),s.closePath(),s.restore()}update(){this.draw(),this.velocity.x*=v,this.velocity.y*=v,this.position.x+=this.velocity.x,this.position.y+=this.velocity.y,this.opacity-=.01}}const r=new q,p=[],u=[];let M=0;function w(){!c.active||(requestAnimationFrame(w),s.fillStyle="rgba(0, 0, 0, 0.1)",s.fillRect(0,0,h.width,h.height),r.draw(),p.forEach((t,o)=>{t.position.x+t.radius>=r.position.x+r.radius&&t.position.x-t.radius<=r.position.x-r.radius&&t.position.y+t.radius>=r.position.y+r.radius&&t.position.y-t.radius<=r.position.y-r.radius?(E("you lose"),c.over=!0,r.opacity>0&&r.hide(u),setTimeout(()=>{c.active=!1},3e3)):t.update(),r.projectiles.forEach((i,a)=>{t.position.x+t.radius>=i.position.x+i.radius&&t.position.x-t.radius<=i.position.x-i.radius&&t.position.y+t.radius>=i.position.y+i.radius&&t.position.y-t.radius<=i.position.y-i.radius?(t.hide(u),C(),setTimeout(()=>{r.projectiles.find(l=>l===i)&&r.projectiles.splice(a,1),p.find(l=>l===t)&&p.splice(o,1)},0)):i.opacity===0?setTimeout(()=>{r.projectiles.splice(a,1)},0):i.update()})}),u.forEach((t,o)=>{t.opacity<=0?setTimeout(()=>{u.splice(o,1)},0):t.update()}),M%30==0&&I(),f>=1e3&&(c.over=!0,p.forEach((t,o)=>{t.hide(u),p.splice(o,1)}),setTimeout(()=>{c.active=!1},1e3),E("you win")),M++)}w();function b(t){let o=Math.random(),i,a,e;return o<=.25?(i=0-t,a=Math.random()*h.height-t,e="top"):o>=.26&&o<=.5?(i=Math.random()*h.width-t,a=0-t,e="left"):o>=.51&&o<=.75?(i=h.width+t,a=Math.random()*h.height-t,e="right"):(i=Math.random()*h.width-t,a=h.height+t,e="bottom"),g===e?b(t):(g=e,{x:i,y:a})}function I(){let t=Math.floor(Math.random()*30)+10;const{x:o,y:i}=b(t);p.push(new R({position:{x:o,y:i},color:T(),radius:t}))}function O({clientX:t,clientY:o,preventDefault:i}){c.over||r.shoot({x:t-L,y:o-F})}function C(t=100){f+=t,P.innerHTML=f.toString()}function E(t){y.innerHTML=t,y.classList.remove("hide")}addEventListener("mousedown",O);