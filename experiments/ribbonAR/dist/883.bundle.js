"use strict";(self.webpackChunkfxhash_boilerplate_webpack=self.webpackChunkfxhash_boilerplate_webpack||[]).push([[883],{891:(n,e,o)=>{o.r(e),o.d(e,{default:()=>h});var t=o(247),i=o(564),a=o.n(i);let d=!0;const s=()=>{d&&window.history.pushState("experiment","Title",window.location.origin+window.location.pathname+"?config="+JSON.stringify(t.Z))};let c=-1;const h={enabled:d,reload:()=>{d&&(window.location.href=window.location.origin+window.location.pathname+"?config="+JSON.stringify(t.Z))},reset:()=>{window.location.href=window.location.origin+window.location.pathname},refresh:s,delayReload:()=>{d&&(window.clearTimeout(c),c=window.setTimeout((()=>{window.location.href=window.location.origin+window.location.pathname+"?config="+JSON.stringify(t.Z)}),500))},init:(n=!0)=>{d=n;const e=a()(window.location.search,!0);let o={};e.query.config&&(o=JSON.parse(e.query.config)),Object.assign(t.Z,o),s()}}},883:(n,e,o)=>{o.r(e),o.d(e,{default:()=>g});var t=o(896),i=o(376),a=o(247),d=o(891),s=o(619);o(943);let c,h,l;function r(){console.log("update"),l.drawImage(c,0,0)}function w(){const{width:n,height:e}=c,o=n/e,t=a.Z.thumbnailSize,i=Math.floor(t/o);document.body.appendChild(h),h.style.cssText=`\n  position:absolute;\n  bottom:0;\n  right:0;\n  width:${t}px;\n  height:${i}px;\n  z-index:9999;\n  `}const g=n=>{const{refresh:e,reload:o}=d.default,g={save:()=>{(0,s.Ak)(a.Z,"Settings")}},u=new i.XS({width:300});window.gui=u,u.add(a.Z,"numParticles",[32,48,64,96,128]).onChange(o),u.add(a.Z,"numSets",[10,12,14,16]).name("Ribbon length").onFinishChange(o);const f=u.addFolder("System"),m=()=>{e(),document.body.style.backgroundColor=(0,s.B8)(a.Z.background)};f.add(a.Z,"margin",0,500).step(1).onChange((function(){e()})),f.addColor(a.Z,"background").onChange(m),f.add(a.Z,"showThumbnail").onFinishChange(o),a.Z.showThumbnail&&f.add(a.Z,"thumbnailSize",0,500).step(1).onFinishChange((()=>{e(),w()})),f.add(a.Z,"autoSave").onFinishChange(o),f.add(g,"save").name("Save Settings"),f.add(d.default,"reset").name("Reset Default"),f.open(),m(),a.Z.showThumbnail&&function(n,e=2e3){c=n;const{width:o,height:t}=n;setInterval(r,e);const i=((n,e)=>{const o=document.createElement("canvas");o.width=n,o.height=e;const t=o.getContext("2d");return{canvas:o,ctx:t}})(o,t);h=i.canvas,l=i.ctx,w(),r()}(t.GL.canvas),i.XS.toggleHide()}}}]);