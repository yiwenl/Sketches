(self.webpackChunkfxhash_boilerplate_webpack=self.webpackChunkfxhash_boilerplate_webpack||[]).push([[756],{3466:function(e){var t;e.exports=((t=function(){function e(e){return a.appendChild(e.dom),e}function l(e){for(var t=0;t<a.children.length;t++)a.children[t].style.display=t===e?"block":"none";n=e}var n=0,a=document.createElement("div");a.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",a.addEventListener("click",(function(e){e.preventDefault(),l(++n%a.children.length)}),!1);var i=(performance||Date).now(),o=i,r=0,f=e(new t.Panel("FPS","#0ff","#002")),c=e(new t.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var d=e(new t.Panel("MB","#f08","#201"));return l(0),{REVISION:16,dom:a,addPanel:e,showPanel:l,begin:function(){i=(performance||Date).now()},end:function(){r++;var e=(performance||Date).now();if(c.update(e-i,200),e>o+1e3&&(f.update(1e3*r/(e-o),100),o=e,r=0,d)){var t=performance.memory;d.update(t.usedJSHeapSize/1048576,t.jsHeapSizeLimit/1048576)}return e},update:function(){i=this.end()},domElement:a,setMode:l}}).Panel=function(e,t,l){var n=1/0,a=0,i=Math.round,o=i(window.devicePixelRatio||1),r=80*o,f=48*o,c=3*o,d=2*o,p=3*o,s=15*o,u=74*o,h=30*o,m=document.createElement("canvas");m.width=r,m.height=f,m.style.cssText="width:80px;height:48px";var w=m.getContext("2d");return w.font="bold "+9*o+"px Helvetica,Arial,sans-serif",w.textBaseline="top",w.fillStyle=l,w.fillRect(0,0,r,f),w.fillStyle=t,w.fillText(e,c,d),w.fillRect(p,s,u,h),w.fillStyle=l,w.globalAlpha=.9,w.fillRect(p,s,u,h),{dom:m,update:function(f,v){n=Math.min(n,f),a=Math.max(a,f),w.fillStyle=l,w.globalAlpha=1,w.fillRect(0,0,r,s),w.fillStyle=t,w.fillText(i(f)+" "+e+" ("+i(n)+"-"+i(a)+")",c,d),w.drawImage(m,p+o,s,u-o,h,p,s,u-o,h),w.fillRect(p+u-o,s,o,h),w.fillStyle=l,w.globalAlpha=.9,w.fillRect(p+u-o,s,o,i((1-f/v)*h))}}},t)},8756:(e,t,l)=>{"use strict";l.r(t);var n=l(3466),a=l.n(n),i=l(51);const o=new(a());document.body.appendChild(o.domElement),i.Z.addEF((()=>{o.update()}))}}]);