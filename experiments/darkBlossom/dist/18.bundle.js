"use strict";(self.webpackChunkfxhash_boilerplate_webpack=self.webpackChunkfxhash_boilerplate_webpack||[]).push([[18],{891:(t,i,e)=>{e.r(i),e.d(i,{default:()=>l});var s=e(247),n=e(564),o=e.n(n);let h=!0;const a=()=>{h&&window.history.pushState("experiment","Title",window.location.origin+window.location.pathname+"?config="+JSON.stringify(s.Z))};let r=-1;const l={enabled:h,reload:()=>{h&&(window.location.href=window.location.origin+window.location.pathname+"?config="+JSON.stringify(s.Z))},reset:()=>{window.location.href=window.location.origin+window.location.pathname},refresh:a,delayReload:()=>{h&&(window.clearTimeout(r),r=window.setTimeout((()=>{window.location.href=window.location.origin+window.location.pathname+"?config="+JSON.stringify(s.Z)}),500))},init:(t=!0)=>{h=t;const i=o()(window.location.search,!0);let e={};i.query.config&&(e=JSON.parse(i.query.config)),Object.assign(s.Z,e),a()}}},18:(t,i,e)=>{e.r(i),e.d(i,{default:()=>c}),e(896);var s=e(376),n=e(247),o=e(891),h=(e(619),e(821)),a=e(529),r=e.n(a),l=e(429),_=e.n(l);const u=class{constructor(t,i,e,s=!1){if("string"==typeof t){const{red:i,green:e,blue:s}=(0,h.Z)(t);this._r=i,this._g=e,this._b=s}else t.length?(this._r=t[0],this._g=t[1],this._b=t[2]):s?(this._hue=t,this._saturation=i,this.lightness=e):(this._r=t,this._g=i,this._b=e);this._updateHSL()}_updateRGB(){const t=_()(this._hue,this._saturation,this._lightness);this._r=t[0],this._g=t[1],this._b=t[2]}_updateHSL(){const t=r()(this._r,this._g,this._b);this._hue=t[0],this._saturation=parseFloat(t[1].split("%")[0])/100,this._lightness=parseFloat(t[2].split("%")[0])/100}set r(t){this._r=t,this._updateHSL()}get r(){return this._r}set g(t){this._g=t,this._updateHSL()}get g(){return this._g}set b(t){this._b=t,this._updateHSL()}get b(){return this._b}set hue(t){this._hue=t,this._updateRGB()}get hue(){return this._hue}set saturation(t){this._saturation=t,this._updateRGB()}get saturation(){return this._saturation}set lightness(t){this._lightness=t,this._updateRGB()}get lightness(){return this._lightness}get hex(){return 0}get value(){return[this._r,this._g,this._b]}set value(t){this._r=t[0],this._g=t[1],this.b=t[2]}get glsl(){return[this._r,this._g,this._b].map((t=>t/255))}};var g=e(367);const c=t=>{const{refresh:i,reload:e}=o.default,h=new u(n.Z.colorBg),a=new u(n.Z.colorShadow),r=new u(n.Z.colorPetal),l=[];for(let t in g.Z)l.push(t);const _=new s.XS({width:300});window.gui=_,_.add(n.Z,"colorTheme",l).onFinishChange((()=>{const t=g.Z[n.Z.colorTheme];console.log(t);for(const i in t)n.Z[i]=t[i];h.value=n.Z.colorBg,a.value=n.Z.colorShadow,r.value=n.Z.colorPetal,i()})),_.add(n.Z,"numParticles",[128,144,192,256,384,512]).onFinishChange(e)}}}]);