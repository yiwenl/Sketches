"use strict";(self.webpackChunkfxhash_boilerplate_webpack=self.webpackChunkfxhash_boilerplate_webpack||[]).push([[437],{891:(e,n,o)=>{o.r(n),o.d(n,{default:()=>r});var i=o(247),t=o(564),a=o.n(t);let d=!0;const l=()=>{d&&window.history.pushState("experiment","Title",window.location.origin+window.location.pathname+"?config="+JSON.stringify(i.default))};let w=-1;const r={enabled:d,reload:()=>{d&&(window.location.href=window.location.origin+window.location.pathname+"?config="+JSON.stringify(i.default))},reset:()=>{window.location.href=window.location.origin+window.location.pathname},refresh:l,delayReload:()=>{d&&(window.clearTimeout(w),w=window.setTimeout((()=>{window.location.href=window.location.origin+window.location.pathname+"?config="+JSON.stringify(i.default)}),500))},init:(e=!0)=>{d=e;const n=a()(window.location.search,!0);let o={};n.query.config&&(o=JSON.parse(n.query.config)),Object.assign(i.default,o),l()}}},824:(e,n,o)=>{o.r(n),o.d(n,{default:()=>d});var i=o(376),t=o(247),a=o(891);o(619);const d=e=>{const{refresh:n,reload:o}=a.default,d=new i.XS({width:300});window.gui=d,d.add(t.default,"numParticles",[32,48,64,96,128]).onChange(o),d.add(t.default,"numSets",[10,12,14,16]).name("Ribbon length").onFinishChange(o),d.add(t.default,"useHandDetection").onChange(o),d.add(a.default,"reset").name("Reset Default Settings")}}}]);