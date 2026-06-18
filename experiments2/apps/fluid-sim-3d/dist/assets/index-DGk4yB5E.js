var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var l=window.requestAnimationFrame,u=60,d=1,f=0,p=0,m=0,h=0,g=0,_=new Map,v=[],y=new Set,b=[],x=[],S=!1,C=0;function w(e){return _.delete(e)}function T(e){if(e<=0||!Number.isFinite(e))throw Error(`Frame rate must be a positive number`);u=e,l=e=>{requestAnimationFrame((t=>{let n=1e3/u,r=t-m;r>=n?e(t):setTimeout((()=>l(e)),n-r)}))}}function E(e=!1){if(S&&!e)return;let t,n=0;for(let[e,t]of _)t?.func(t.args);for(;b.length>0;)t=b.pop(),t.func(t.args);for(n=0;n<v.length;n++)t=v[n],f-t.time>t.delay/d&&(t.func(t.args),t.repeat?t.time=f:(v.splice(n,1),n--));let r=performance.now();for(;y.length>0;){if(t=y.shift(),!(performance.now()-r<1e3/u*d)){y.unshift(t);break}t.func(t.args)}}function D(e){m=f,e===void 0?(g+=1e3/u*d,f=g):(S||(h===0&&(h=e),g+=e-h,h=e),f=g),p=f-m,b=b.concat(x),x=[]}f=performance.now(),function e(t){E(),D(t),l(e)}(f);var O={addEF:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for enterframe task.`);let n=++C;return _.set(n,{func:e,args:t}),{id:n,cancel:()=>{w(n)}}},removeEF:w,delay:function(e,t,n,r=!1){if(typeof e!=`function`)throw Error(`Invalid function provided for delayed task.`);let i=++C,a={id:i,func:e,args:n,delay:t,time:f,repeat:r,cancelled:!1};return v.push(a),{cancel:()=>{let e=v.findIndex((e=>e.id===i));e!==-1&&v.splice(e,1)}}},next:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for next frame task.`);x.push({func:e,args:t})},defer:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for deferred task.`);y.add({func:e,args:t})},getTime:function(){return f/1e3},getDeltaTime:function(){return p},setFrameRate:T,setTimeScale:function(e){if(e<0||!Number.isFinite(e))throw Error(`Time scale must be a non-negative number`);d=e,T(u*d)},getTimeScale:function(){return d},setEnterframeFunc:function(e){l=e},step:function(){E(!0),D()},pause:function(){S=!0,h=0},resume:function(){S=!1},isPaused:function(){return S},removeAllTasks:function(){_.clear(),v.length=0,y.clear(),b.length=0,x.length=0,g=0,f=0}},k=Object.defineProperty,A=(e,t,n)=>t in e?k(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,j=(e,t,n)=>A(e,typeof t==`symbol`?t:t+``,n),ee=1e-6,M=typeof Float32Array<`u`?Float32Array:Array;function N(){var e=new M(16);return M!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function te(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function ne(e,t){var n=t[0],r=t[1],i=t[2],a=t[3],o=t[4],s=t[5],c=t[6],l=t[7],u=t[8],d=t[9],f=t[10],p=t[11],m=t[12],h=t[13],g=t[14],_=t[15],v=n*s-r*o,y=n*c-i*o,b=n*l-a*o,x=r*c-i*s,S=r*l-a*s,C=i*l-a*c,w=u*h-d*m,T=u*g-f*m,E=u*_-p*m,D=d*g-f*h,O=d*_-p*h,k=f*_-p*g,A=v*k-y*O+b*D+x*E-S*T+C*w;return A?(A=1/A,e[0]=(s*k-c*O+l*D)*A,e[1]=(i*O-r*k-a*D)*A,e[2]=(h*C-g*S+_*x)*A,e[3]=(f*S-d*C-p*x)*A,e[4]=(c*E-o*k-l*T)*A,e[5]=(n*k-i*E+a*T)*A,e[6]=(g*b-m*C-_*y)*A,e[7]=(u*C-f*b+p*y)*A,e[8]=(o*O-s*E+l*w)*A,e[9]=(r*E-n*O-a*w)*A,e[10]=(m*S-h*b+_*v)*A,e[11]=(d*b-u*S-p*v)*A,e[12]=(s*T-o*D-c*w)*A,e[13]=(n*D-r*T+i*w)*A,e[14]=(h*y-m*x-g*v)*A,e[15]=(u*x-d*y+f*v)*A,e):null}function re(e,t,n){var r=t[0],i=t[1],a=t[2],o=t[3],s=t[4],c=t[5],l=t[6],u=t[7],d=t[8],f=t[9],p=t[10],m=t[11],h=t[12],g=t[13],_=t[14],v=t[15],y=n[0],b=n[1],x=n[2],S=n[3];return e[0]=y*r+b*s+x*d+S*h,e[1]=y*i+b*c+x*f+S*g,e[2]=y*a+b*l+x*p+S*_,e[3]=y*o+b*u+x*m+S*v,y=n[4],b=n[5],x=n[6],S=n[7],e[4]=y*r+b*s+x*d+S*h,e[5]=y*i+b*c+x*f+S*g,e[6]=y*a+b*l+x*p+S*_,e[7]=y*o+b*u+x*m+S*v,y=n[8],b=n[9],x=n[10],S=n[11],e[8]=y*r+b*s+x*d+S*h,e[9]=y*i+b*c+x*f+S*g,e[10]=y*a+b*l+x*p+S*_,e[11]=y*o+b*u+x*m+S*v,y=n[12],b=n[13],x=n[14],S=n[15],e[12]=y*r+b*s+x*d+S*h,e[13]=y*i+b*c+x*f+S*g,e[14]=y*a+b*l+x*p+S*_,e[15]=y*o+b*u+x*m+S*v,e}function ie(e,t,n,r,i){var a=1/Math.tan(t/2);if(e[0]=a/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i!=null&&i!==1/0){var o=1/(r-i);e[10]=i*o,e[14]=i*r*o}else e[10]=-1,e[14]=-r;return e}function ae(e,t,n,r){var i,a,o,s,c,l,u,d,f,p,m=t[0],h=t[1],g=t[2],_=r[0],v=r[1],y=r[2],b=n[0],x=n[1],S=n[2];return Math.abs(m-b)<ee&&Math.abs(h-x)<ee&&Math.abs(g-S)<ee?te(e):(u=m-b,d=h-x,f=g-S,p=1/Math.sqrt(u*u+d*d+f*f),u*=p,d*=p,f*=p,i=v*f-y*d,a=y*u-_*f,o=_*d-v*u,p=Math.sqrt(i*i+a*a+o*o),p?(p=1/p,i*=p,a*=p,o*=p):(i=0,a=0,o=0),s=d*o-f*a,c=f*i-u*o,l=u*a-d*i,p=Math.sqrt(s*s+c*c+l*l),p?(p=1/p,s*=p,c*=p,l*=p):(s=0,c=0,l=0),e[0]=i,e[1]=s,e[2]=u,e[3]=0,e[4]=a,e[5]=c,e[6]=d,e[7]=0,e[8]=o,e[9]=l,e[10]=f,e[11]=0,e[12]=-(i*m+a*h+o*g),e[13]=-(s*m+c*h+l*g),e[14]=-(u*m+d*h+f*g),e[15]=1,e)}function P(){var e=new M(3);return M!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function F(e){var t=new M(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function I(e,t,n){var r=new M(3);return r[0]=e,r[1]=t,r[2]=n,r}function L(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function R(e,t,n,r){return e[0]=t,e[1]=n,e[2]=r,e}function oe(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e}function se(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e}function ce(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e}function le(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+r*r+i*i)}function z(e,t){var n=t[0],r=t[1],i=t[2],a=n*n+r*r+i*i;return a>0&&(a=1/Math.sqrt(a)),e[0]=t[0]*a,e[1]=t[1]*a,e[2]=t[2]*a,e}function B(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function V(e,t,n){var r=t[0],i=t[1],a=t[2],o=n[0],s=n[1],c=n[2];return e[0]=i*c-a*s,e[1]=a*o-r*c,e[2]=r*s-i*o,e}function H(e,t,n){var r=t[0],i=t[1],a=t[2],o=n[3]*r+n[7]*i+n[11]*a+n[15];return o||=1,e[0]=(n[0]*r+n[4]*i+n[8]*a+n[12])/o,e[1]=(n[1]*r+n[5]*i+n[9]*a+n[13])/o,e[2]=(n[2]*r+n[6]*i+n[10]*a+n[14])/o,e}var U=se,ue=le;(function(){var e=P();return function(t,n,r,i,a,o){var s,c;for(n||=3,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2];return t}})();var de=class{constructor(e,t=.1){j(this,`easing`),j(this,`_value`),j(this,`_targetValue`),j(this,`_min`),j(this,`_max`),j(this,`_efIndex`),this.easing=t,this._value=e,this._targetValue=e,this._efIndex=O.addEF(()=>this._update())}_update(){this._checkLimit(),this._value+=(this._targetValue-this._value)*this.easing,Math.abs(this._targetValue-this._value)<1e-4&&(this._value=this._targetValue)}setTo(e){this._targetValue=this._value=e,this._checkLimit(),this._value=this._targetValue}add(e){this._targetValue+=e,this._checkLimit()}limit(e,t){if(e>t){this.limit(t,e);return}this._min=e,this._max=t,this._checkLimit()}_checkLimit(){this._min!==void 0&&this._targetValue<this._min&&(this._targetValue=this._min),this._max!==void 0&&this._targetValue>this._max&&(this._targetValue=this._max)}destroy(){O.removeEF(this._efIndex)}set value(e){this._targetValue=e}get value(){return this._value}get targetValue(){return this._targetValue}};function fe(e,t){return`touches`in e&&e.touches.length>0?(t.x=e.touches[0].pageX,t.y=e.touches[0].pageY):`clientX`in e&&(t.x=e.clientX,t.y=e.clientY),t}function pe(e){let t=e.deltaY;switch(e.deltaMode){case WheelEvent.DOM_DELTA_LINE:t*=16;break;case WheelEvent.DOM_DELTA_PAGE:t*=100;break}return-t/120}var me=class{constructor(e,t={}){j(this,`radius`),j(this,`position`,P()),j(this,`positionOffset`,P()),j(this,`center`),j(this,`sensitivity`,1),j(this,`zoomSpeed`,1),j(this,`panSpeed`,.01),j(this,`_camera`),j(this,`_listenerTarget`),j(this,`_up`),j(this,`_rx`),j(this,`_ry`),j(this,`_mouse`,{x:0,y:0}),j(this,`_preMouse`,{x:0,y:0}),j(this,`_panCenterStart`,P()),j(this,`_eye`,P()),j(this,`_forward`,P()),j(this,`_right`,P()),j(this,`_camUp`,P()),j(this,`_efIndex`),j(this,`_preRX`,0),j(this,`_preRY`,0),j(this,`_isLockZoom`,!1),j(this,`_isLockRotation`,!1),j(this,`_isLockPan`,!1),j(this,`_isInvert`,!1),j(this,`_isMouseDown`,!1),j(this,`_isPanning`,!1),j(this,`_destroyed`,!1),j(this,`_wheelBind`),j(this,`_downBind`),j(this,`_moveBind`),j(this,`_upBind`),this._camera=e,this._listenerTarget=t.listenerTarget??document.body,this.center=t.center?I(t.center[0],t.center[1],t.center[2]):P(),this._up=t.up?I(t.up[0],t.up[1],t.up[2]):I(0,1,0),this.sensitivity=t.sensitivity??1,this.zoomSpeed=t.zoomSpeed??1,this.panSpeed=t.panSpeed??.01;let n=t.radius??10;this.radius=new de(n),this.position[2]=this.radius.value,this._rx=new de(0),this._rx.limit(-Math.PI/2,Math.PI/2),this._ry=new de(0),this._wheelBind=e=>this._onWheel(e),this._downBind=e=>this._onDown(e),this._moveBind=e=>this._onMove(e),this._upBind=()=>this._onUp(),this.connect(),this._efIndex=O.addEF(()=>this._loop())}connect(){this.disconnect(),this._listenerTarget.addEventListener(`wheel`,this._wheelBind,{passive:!1}),this._listenerTarget.addEventListener(`mousedown`,this._downBind),this._listenerTarget.addEventListener(`touchstart`,this._downBind,{passive:!1}),this._listenerTarget.addEventListener(`mousemove`,this._moveBind),this._listenerTarget.addEventListener(`touchmove`,this._moveBind,{passive:!1}),window.addEventListener(`touchend`,this._upBind),window.addEventListener(`mouseup`,this._upBind)}disconnect(){this._listenerTarget.removeEventListener(`wheel`,this._wheelBind),this._listenerTarget.removeEventListener(`mousedown`,this._downBind),this._listenerTarget.removeEventListener(`touchstart`,this._downBind),this._listenerTarget.removeEventListener(`mousemove`,this._moveBind),this._listenerTarget.removeEventListener(`touchmove`,this._moveBind),window.removeEventListener(`touchend`,this._upBind),window.removeEventListener(`mouseup`,this._upBind)}destroy(){this._destroyed||(this._destroyed=!0,this.disconnect(),O.removeEF(this._efIndex),this.radius.destroy(),this._rx.destroy(),this._ry.destroy())}lock(e=!0){this._isLockZoom=e,this._isLockRotation=e,this._isLockPan=e,this._isMouseDown=!1,this._isPanning=!1}lockZoom(e=!0){this._isLockZoom=e}lockRotation(e=!0){this._isLockRotation=e}lockPan(e=!0){this._isLockPan=e}inverseControl(e=!0){this._isInvert=e}update(){this._updatePosition()}get rx(){return this._rx}get ry(){return this._ry}_loop(){this._destroyed||(this._updatePosition(),this._updateCamera())}_updatePosition(){let e=this._rx.value,t=this._ry.value,n=this.radius.value;this.position[1]=Math.sin(e)*n;let r=Math.cos(e)*n;this.position[0]=Math.cos(t+Math.PI*.5)*r,this.position[2]=Math.sin(t+Math.PI*.5)*r,this.position[0]+=this.positionOffset[0],this.position[1]+=this.positionOffset[1],this.position[2]+=this.positionOffset[2]}_updateCamera(){this._camera.lookAt(this.position,this.center,this._up)}_isPanInput(e){return`button`in e?e.button===1||e.button===0&&e.shiftKey:!1}_panByPixels(e,t){this._updatePosition(),R(this._eye,this.position[0],this.position[1],this.position[2]),U(this._forward,this.center,this._eye),z(this._forward,this._forward),V(this._right,this._forward,this._up),z(this._right,this._right),V(this._camUp,this._right,this._forward),z(this._camUp,this._camUp);let n=this.panSpeed*this.sensitivity;this.center[0]=this._panCenterStart[0]-this._right[0]*e*n+this._camUp[0]*t*n,this.center[1]=this._panCenterStart[1]-this._right[1]*e*n+this._camUp[1]*t*n,this.center[2]=this._panCenterStart[2]-this._right[2]*e*n+this._camUp[2]*t*n}_onDown(e){if(fe(e,this._mouse),fe(e,this._preMouse),this._isPanInput(e)&&!this._isLockPan){this._isPanning=!0,this._isMouseDown=!1,this._panCenterStart[0]=this.center[0],this._panCenterStart[1]=this.center[1],this._panCenterStart[2]=this.center[2];return}this._isLockRotation||(this._isPanning=!1,this._isMouseDown=!0,this._preRX=this._rx.targetValue,this._preRY=this._ry.targetValue)}_onMove(e){if(fe(e,this._mouse),`touches`in e&&e.preventDefault(),this._isPanning){if(this._isLockPan)return;let e=this._mouse.x-this._preMouse.x,t=this._mouse.y-this._preMouse.y;this._panByPixels(e,t);return}if(this._isLockRotation||!this._isMouseDown)return;let t=-(this._mouse.x-this._preMouse.x);this._isInvert&&(t*=-1),this._ry.value=this._preRY-t*.01*this.sensitivity;let n=-(this._mouse.y-this._preMouse.y);this._isInvert&&(n*=-1),this._rx.value=this._preRX-n*.01*this.sensitivity}_onUp(){this._isMouseDown=!1,this._isPanning=!1}_onWheel(e){if(this._isLockZoom)return;e.preventDefault();let t=pe(e)*this.zoomSpeed;this.radius.add(-t*2),this.radius.targetValue<0&&this.radius.setTo(1e-4)}},he=class{constructor(e,t){j(this,`origin`),j(this,`direction`),j(this,`_target`,P()),j(this,`_edge1`,P()),j(this,`_edge2`,P()),j(this,`_normal`,P()),j(this,`_diff`,P()),j(this,`_a`,P()),j(this,`_b`,P()),j(this,`_c`,P()),this.origin=F(e),this.direction=F(t)}set(e,t){return L(this.origin,e),L(this.direction,t),this}at(e,t){let n=t??this._target;return L(n,this.direction),ce(n,n,e),oe(n,n,this.origin),n}intersectTriangle(e,t,n,r=!0){L(this._a,e),L(this._b,t),L(this._c,n),U(this._edge1,this._b,this._a),U(this._edge2,this._c,this._a),V(this._normal,this._edge1,this._edge2);let i=B(this.direction,this._normal),a;if(i>0){if(r)return null;a=1}else if(i<0)a=-1,i=-i;else return null;U(this._diff,this.origin,this._a),V(this._edge2,this._diff,this._edge2);let o=a*B(this.direction,this._edge2);if(o<0)return null;V(this._edge1,this._edge1,this._diff);let s=a*B(this.direction,this._edge1);if(s<0||o+s>i)return null;let c=-a*B(this._diff,this._normal);if(c<0)return null;let l=c/i,u=P();return this.at(l,u),u}intersectSphere(e,t){let n=P();U(n,e,this.origin);let r=B(n,this.direction),i=B(n,n)-r*r,a=t*t;if(i>a)return null;let o=Math.sqrt(a-i),s=r-o,c=r+o;if(s<0&&c<0)return null;let l=P();return s<0?this.at(c,l):this.at(s,l),l}};function ge(e){if(`touches`in e&&e.touches.length>0)return{x:e.touches[0].pageX,y:e.touches[0].pageY};let t=e;return{x:t.clientX,y:t.clientY}}function _e(e,t){let n=e.x-t.x,r=e.y-t.y;return Math.sqrt(n*n+r*r)}var ve=class extends EventTarget{constructor(e,t,n,r={}){super(),j(this,`clickTolerance`,8),j(this,`modelMatrix`),j(this,`resolution`),j(this,`_camera`),j(this,`_faces`),j(this,`_ray`),j(this,`_skipMove`),j(this,`_listenerTarget`),j(this,`_lastPos`,{x:0,y:0}),j(this,`_firstPos`,{x:0,y:0}),j(this,`_hit`,I(-999,-999,-999)),j(this,`_onDownBind`),j(this,`_onMoveBind`),j(this,`_onUpBind`),this._camera=t,this.resolution=n??[window.innerWidth,window.innerHeight],this.modelMatrix=N(),this._ray=new he([0,0,0],[0,0,-1]),this._skipMove=r.skipMoveCheck??!1,this._listenerTarget=r.listenerTarget??window,this._faces=ye(e),this._onDownBind=e=>this._onDown(e),this._onMoveBind=e=>this._onMove(e),this._onUpBind=()=>this._onUp(),this.connect()}connect(){this._listenerTarget.addEventListener(`mousedown`,this._onDownBind),this._listenerTarget.addEventListener(`mousemove`,this._onMoveBind),this._listenerTarget.addEventListener(`mouseup`,this._onUpBind),this._listenerTarget.addEventListener(`touchstart`,this._onDownBind),this._listenerTarget.addEventListener(`touchmove`,this._onMoveBind),this._listenerTarget.addEventListener(`touchend`,this._onUpBind)}disconnect(){this._listenerTarget.removeEventListener(`mousedown`,this._onDownBind),this._listenerTarget.removeEventListener(`mousemove`,this._onMoveBind),this._listenerTarget.removeEventListener(`mouseup`,this._onUpBind),this._listenerTarget.removeEventListener(`touchstart`,this._onDownBind),this._listenerTarget.removeEventListener(`touchmove`,this._onMoveBind),this._listenerTarget.removeEventListener(`touchend`,this._onUpBind)}get hit(){return this._hit}_checkHit(e=`onHit`){let t=this._camera;if(!t)return;let n=this._lastPos.x/this.resolution[0]*2-1,r=-(this._lastPos.y/this.resolution[1])*2+1;t.generateRay([n,r,0],this._ray);let i=null,a=1/0,o=P(),s=P(),c=P();for(let e=0;e<this._faces.length;e++){let n=this._faces[e];H(o,[n[0],n[1],n[2]],this.modelMatrix),H(s,[n[3],n[4],n[5]],this.modelMatrix),H(c,[n[6],n[7],n[8]],this.modelMatrix);let r=this._ray.intersectTriangle(o,s,c);if(r){let e=ue(r,t.getPosition());e<a&&(i=F(r),a=e)}}i?(this._hit=F(i),this.dispatchEvent(new CustomEvent(e,{detail:{hit:i}}))):this.dispatchEvent(new CustomEvent(`onUp`))}_onDown(e){this._firstPos=ge(e),this._lastPos=ge(e),this._checkHit(`onDown`)}_onMove(e){this._lastPos=ge(e),this._skipMove||this._checkHit()}_onUp(){_e(this._firstPos,this._lastPos)<this.clickTolerance&&this._checkHit()}};function ye(e){let{positions:t,indices:n}=e,r=[];for(let e=0;e<n.length;e+=3){let i=n[e],a=n[e+1],o=n[e+2];r.push(new Float32Array([t[i*3],t[i*3+1],t[i*3+2],t[a*3],t[a*3+1],t[a*3+2],t[o*3],t[o*3+1],t[o*3+2]]))}return r}var be=I(0,1,0),xe=class e{constructor(){j(this,`viewMatrix`),j(this,`projectionMatrix`),j(this,`viewProjectionMatrix`),j(this,`position`,I(0,0,1)),j(this,`target`,I(0,0,0)),j(this,`up`,P()),this.viewMatrix=N(),this.projectionMatrix=N(),this.viewProjectionMatrix=N(),te(this.projectionMatrix),this.lookAt(this.position,this.target)}static uniformByteSize(){return e.uniformFloatCount*4}lookAt(e,t,n=be){return R(this.position,e[0],e[1],e[2]),R(this.target,t[0],t[1],t[2]),R(this.up,n[0],n[1],n[2]),ae(this.viewMatrix,this.position,this.target,this.up),this}getViewMatrix(){return this.viewMatrix}getProjectionMatrix(){return this.projectionMatrix}getViewProjectionMatrix(e){let t=e??this.viewProjectionMatrix;return re(t,this.projectionMatrix,this.viewMatrix),t}writeUniformData(t,n=0){if(t.length<n+e.uniformFloatCount)throw Error(`Camera uniform target is too small. Need at least ${n+e.uniformFloatCount} floats.`);this.getViewProjectionMatrix(this.viewProjectionMatrix),t.set(this.viewProjectionMatrix,n);let r=this.viewMatrix;return t[n+16]=r[0],t[n+17]=r[4],t[n+18]=r[8],t[n+19]=0,t[n+20]=r[1],t[n+21]=r[5],t[n+22]=r[9],t[n+23]=0,t}generateRay(e,t){let n=N(),r=P();return re(n,this.projectionMatrix,this.viewMatrix),ne(n,n),H(r,e,n),U(r,r,this.position),z(r,r),t?(t.set(this.position,r),t):new he(this.position,r)}getPosition(){return F(this.position)}getLookAtTarget(){return F(this.target)}getFieldOfView(){}updateProjection(){}};j(xe,`uniformFloatCount`,24);var Se=xe,Ce=class extends Se{constructor(e,t,n,r){super(),j(this,`fov`,Math.PI/4),j(this,`aspect`,1),j(this,`near`,.1),j(this,`far`,100),this.setPerspective(e,t,n,r)}setPerspective(e,t,n,r){return this.fov=e,this.aspect=t,this.near=n,this.far=r,ie(this.getProjectionMatrix(),e,t,n,r),this}setAspect(e){return this.aspect=e,this.updateProjection(),this}getFieldOfView(){return this.fov}getAspect(){return this.aspect}getNear(){return this.near}getFar(){return this.far}updateProjection(){this.setPerspective(this.fov,this.aspect,this.near,this.far)}},we=class e{constructor(e,t,n,r,i,a,o){j(this,`canvas`),j(this,`context`),j(this,`device`),j(this,`format`),j(this,`colorSpace`),j(this,`toneMappingMode`),j(this,`hdr`),this.canvas=e,this.context=t,this.device=n,this.format=r,this.colorSpace=i,this.toneMappingMode=a,this.hdr=o}get gpu(){return this.device}static async isSupported(){return navigator.gpu?await navigator.gpu.requestAdapter()!==null:!1}static async create(t,n={}){if(!navigator.gpu)throw Error(`WebGPU is not supported in this browser.`);let r=await navigator.gpu.requestAdapter({powerPreference:n.powerPreference});if(!r)throw Error(`Failed to request WebGPU adapter.`);let i=await r.requestDevice(),a=t.getContext(`webgpu`);if(!a)throw Error(`Failed to get WebGPU canvas context.`);let o=n.hdr??!1,s=n.colorSpace??`srgb`,c=n.toneMappingMode??(o?`extended`:`standard`),l=o?`rgba16float`:navigator.gpu.getPreferredCanvasFormat();return a.configure({device:i,format:l,alphaMode:n.alpha===!1?`opaque`:`premultiplied`,colorSpace:s,toneMapping:{mode:c}}),new e(t,a,i,l,s,c,o)}resize(e,t){let n=e??this.canvas.clientWidth,r=t??this.canvas.clientHeight;(this.canvas.width!==n||this.canvas.height!==r)&&(this.canvas.width=Math.max(1,n),this.canvas.height=Math.max(1,r))}getCurrentTexture(){return this.context.getCurrentTexture()}destroy(){this.device.destroy()}};function Te(e,t,n){return e.gpu.createShaderModule({code:t,label:n})}function Ee(e,t){return e.gpu.createRenderPipeline(t)}function De(e,t){return e.gpu.createComputePipeline(t)}function Oe(e,t,n,r=0){if(n instanceof ArrayBuffer){e.gpu.queue.writeBuffer(t,r,n);return}e.gpu.queue.writeBuffer(t,r,n.buffer,n.byteOffset,n.byteLength)}var W={vertex:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,index:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,storage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,uniform:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,vertexStorage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST},G=class e{constructor(e,t,n,r){j(this,`gpu`),j(this,`size`),j(this,`usage`),j(this,`label`),this.gpu=e,this.size=t,this.usage=n,this.label=r}static uniformSize(e){return Math.ceil(e/16)*16}static create(t,n,r,i){return new e(t.gpu.createBuffer({size:n,usage:r,label:i}),n,r,i)}static fromData(t,n,r,i){let a=n.byteLength,o=e.create(t,a,r,i);return o.write(t,n),o}write(e,t,n=0){Oe(e,this.gpu,t,n)}destroy(){this.gpu.destroy()}};function ke(e){return e instanceof G?{buffer:e.gpu}:e}var K=class e{constructor(e){j(this,`gpu`),this.gpu=e}static create(t,n,r,i=0,a){if(r instanceof G){let o=typeof i==`number`?i:0,s=typeof i==`string`?i:a;return e.createFromEntries(t,n,[{binding:o,resource:r}],s)}let o=typeof i==`string`?i:a;return e.createFromEntries(t,n,r,o)}static createFromEntries(t,n,r,i){return new e(t.gpu.createBindGroup({label:i,layout:n,entries:r.map(({binding:e,resource:t})=>({binding:e,resource:ke(t)}))}))}bind(e,t=0){e.setBindGroup(t,this.gpu)}},Ae={f32:{alignment:4,storageByteSize:4,valueFloatCount:1},vec2f:{alignment:8,storageByteSize:8,valueFloatCount:2},vec3f:{alignment:16,storageByteSize:16,valueFloatCount:3},vec4f:{alignment:16,storageByteSize:16,valueFloatCount:4},mat4x4f:{alignment:16,storageByteSize:64,valueFloatCount:16}};function je(e,t){let n=e%t;return n===0?e:e+t-n}function Me(e){return typeof e==`object`&&!!e&&`length`in e}var q=class e{constructor(e,t){j(this,`floatCount`),j(this,`byteSize`),j(this,`label`),j(this,`dataInternal`),j(this,`fields`,new Map),this.label=t;let n=0;for(let[t,r]of Object.entries(e)){let e=Ae[r];if(!e)throw Error(`Unsupported uniform field type "${r}" for "${t}".`);n=je(n,e.alignment),this.fields.set(t,{type:r,floatOffset:n/4,valueFloatCount:e.valueFloatCount}),n+=e.storageByteSize}this.byteSize=n,this.floatCount=this.byteSize/4,this.dataInternal=new Float32Array(this.floatCount)}static create(t,n){return new e(t,n)}get data(){return this.dataInternal}getOffset(e){let t=this.fields.get(e);if(!t)throw Error(`Unknown uniform field "${e}".`);return t.floatOffset}set(e,t){let n=this.fields.get(e);if(!n)throw Error(`Unknown uniform field "${e}".`);if(n.type===`f32`){if(typeof t!=`number`)throw Error(`Field "${e}" expects a number (f32).`);return this.dataInternal[n.floatOffset]=t,this}if(typeof t==`number`||!Me(t))throw Error(`Field "${e}" expects ${n.valueFloatCount} floats for type "${n.type}".`);if(t.length<n.valueFloatCount)throw Error(`Field "${e}" requires ${n.valueFloatCount} floats; got ${t.length}.`);if(t instanceof Float32Array)this.dataInternal.set(t.subarray(0,n.valueFloatCount),n.floatOffset);else{let e=n.valueFloatCount,r=n.floatOffset;for(let n=0;n<e;n++)this.dataInternal[r+n]=t[n]}return n.type===`vec3f`&&(this.dataInternal[n.floatOffset+3]=0),this}toFloat32Array(){return this.dataInternal}writeToBuffer(e,t,n=0){e.write(t,this.dataInternal,n)}},Ne=class e{constructor(e,t,n,r,i,a,o,s){j(this,`width`),j(this,`height`),j(this,`depth`),j(this,`format`),j(this,`view`),j(this,`storageView`),j(this,`sampler`),j(this,`_gpu`),this._gpu=e,this.view=t,this.storageView=n,this.sampler=r,this.width=i,this.height=a,this.depth=o,this.format=s}static create(t,n,r={}){let i=r.label??`Texture3D`,a=r.format??`rgba32float`,[o,s,c]=typeof n==`number`?[n,n,n]:n;if(o<=0||s<=0||c<=0)throw Error(`Texture3D size must have positive width, height, and depth.`);let l=r.usage??GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING,u=t.gpu.createTexture({label:i,dimension:`3d`,size:[o,s,c],format:a,usage:l}),d=u.createView({label:`${i}View`,dimension:`3d`});return new e(u,d,d,t.gpu.createSampler({label:`${i}Sampler`,addressModeU:r.addressModeU??`mirror-repeat`,addressModeV:r.addressModeV??`mirror-repeat`,addressModeW:r.addressModeW??`mirror-repeat`,magFilter:r.magFilter??`nearest`,minFilter:r.minFilter??`nearest`}),o,s,c,a)}get gpu(){return this._gpu}destroy(){this._gpu.destroy()}};function Pe(e,t,n={}){let{clearColor:r={r:.05,g:.05,b:.08,a:1},loadOp:i=`clear`,storeOp:a=`store`,depthStencilAttachment:o}=n,s=`colorView`in t?t.colorView:t,c=o??(`colorView`in t&&t.depthView?{view:t.depthView,depthLoadOp:`clear`,depthClearValue:1,depthStoreOp:`store`}:void 0);return e.beginRenderPass({colorAttachments:[{view:s,clearValue:r,loadOp:i,storeOp:a}],depthStencilAttachment:c})}var Fe=class{constructor(e,t,n={}){j(this,`pipeline`);let{label:r=`Draw`,layout:i=`auto`,primitive:a={topology:`triangle-list`},depthStencil:o,targets:s=[{format:e.format}],vertexBuffers:c=[]}=typeof n==`string`?{label:n}:n,l=Te(e,t,`${r}Shader`);this.pipeline=Ee(e,{label:`${r}Pipeline`,layout:i,vertex:{module:l,entryPoint:`vs_main`,buffers:c},fragment:{module:l,entryPoint:`fs_main`,targets:s},primitive:a,depthStencil:o})}getBindGroupLayout(e=0){return this.pipeline.getBindGroupLayout(e)}draw(e,t,n,r=1){if(e.setPipeline(this.pipeline),n){let t=Array.isArray(n)?n:[n];for(let n=0;n<t.length;n++)t[n].bind(e,n)}typeof t==`number`?e.draw(t,r):(t.bind(e),t.hasIndexBuffer()?e.drawIndexed(t.getIndexCount(),r):e.draw(t.vertexCount,r))}},J=class{constructor(e,t,n={}){j(this,`pipeline`);let{label:r=`Compute`,layout:i=`auto`,entryPoint:a=`cs_main`}=typeof n==`string`?{label:n}:n,o=Te(e,t,`${r}Shader`);this.pipeline=De(e,{label:`${r}Pipeline`,layout:i,compute:{module:o,entryPoint:a}})}getBindGroupLayout(e=0){return this.pipeline.getBindGroupLayout(e)}dispatch(e,t,n=1){if(e.setPipeline(this.pipeline),t){let n=Array.isArray(t)?t:[t];for(let t=0;t<n.length;t++)e.setBindGroup(t,n[t].gpu)}typeof n==`number`?e.dispatchWorkgroups(n):e.dispatchWorkgroups(n[0],n[1]??1,n[2]??1)}run(e,t,n=1,r){let i=e.beginComputePass(r?{label:r}:void 0);this.dispatch(i,t,n),i.end()}},Ie=class{constructor(e){if(j(this,`vertexCount`),j(this,`bindings`,[]),j(this,`indexBuffer`),j(this,`indexCount`,0),j(this,`indexFormat`,`uint16`),e<=0)throw Error(`Mesh vertexCount must be greater than 0.`);this.vertexCount=e}addVertexBuffer(e){let t=e.slot??this.nextFreeSlot();if(this.bindings.some(e=>e.slot===t))throw Error(`Vertex buffer slot ${t} is already in use.`);return this.bindings.push({...e,slot:t}),this}getVertexLayouts(){if(this.bindings.length===0)return[];let e=Math.max(...this.bindings.map(e=>e.slot)),t=Array.from({length:e+1},()=>null);for(let e of this.bindings)t[e.slot]={arrayStride:e.arrayStride,stepMode:e.stepMode??`vertex`,attributes:e.attributes.map(e=>({shaderLocation:e.shaderLocation,format:e.format,offset:e.offset}))};return t}bind(e){for(let t of this.bindings)e.setVertexBuffer(t.slot,t.buffer.gpu);this.indexBuffer&&e.setIndexBuffer(this.indexBuffer.gpu,this.indexFormat)}setIndexBuffer(e,t,n=`uint16`){if(t<=0)throw Error(`Mesh index count must be greater than 0.`);return this.indexBuffer=e,this.indexCount=t,this.indexFormat=n,this}setIndexBufferFromData(e,t,n=`mesh-indices`){let r=t instanceof Uint32Array?`uint32`:`uint16`,i=G.fromData(e,t,W.index,n);return this.setIndexBuffer(i,t.length,r),i}hasIndexBuffer(){return this.indexBuffer!==void 0}getIndexCount(){return this.indexCount}nextFreeSlot(){let e=new Set(this.bindings.map(e=>e.slot)),t=0;for(;e.has(t);)t++;return t}};function Le(e,t=`SceneUniformBindGroupLayout`){return e.gpu.createBindGroupLayout({label:t,entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}}]})}function Re(e,t=`SceneUniformPipelineLayout`){let n=Le(e,`${t}BindGroup`);return{pipelineLayout:e.gpu.createPipelineLayout({label:t,bindGroupLayouts:[n]}),bindGroupLayout:n}}var ze=`
struct SceneUniforms {
  viewProj: mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> scene: SceneUniforms;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) color: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = scene.viewProj * vec4<f32>(input.position, 1.0);
  output.color = input.color;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(input.color, 1.0);
}
`,Be=1e3;function Ve(e){return{positions:new Float32Array([-e,0,0,e,0,0,0,-e,0,0,e,0,0,0,-e,0,0,e]),colors:new Float32Array([1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1])}}var He=class{constructor(e,t={}){j(this,`mesh`),j(this,`lineDraw`),j(this,`positionBuffer`),j(this,`colorBuffer`);let n=t.length??Be,r=t.label??`AxisHelper`,{vertex:i}=W,{positions:a,colors:o}=Ve(n);this.positionBuffer=G.fromData(e,a,i,`${r}-positions`),this.colorBuffer=G.fromData(e,o,i,`${r}-colors`),this.mesh=new Ie(6).addVertexBuffer({buffer:this.positionBuffer,arrayStride:12,attributes:[{shaderLocation:0,format:`float32x3`,offset:0}],slot:0}).addVertexBuffer({buffer:this.colorBuffer,arrayStride:12,attributes:[{shaderLocation:1,format:`float32x3`,offset:0}],slot:1});let s=t.pipelineLayout??Re(e,`${r}Scene`).pipelineLayout;this.lineDraw=new Fe(e,ze,{label:r,layout:s,primitive:{topology:`line-list`},vertexBuffers:this.mesh.getVertexLayouts(),depthStencil:{format:`depth24plus`,depthWriteEnabled:!0,depthCompare:`less`}})}getBindGroupLayout(e=0){return this.lineDraw.getBindGroupLayout(e)}draw(e,t){this.lineDraw.draw(e,this.mesh,t)}destroy(){this.positionBuffer.destroy(),this.colorBuffer.destroy()}},Ue=class e{constructor(e,t){j(this,`textures`),j(this,`size`),this.textures=e,this.size=t}static create(t,n,r={}){let i=r.label??`Texture3DPingPong`,[a,o,s]=typeof n==`number`?[n,n,n]:n,c=Math.max(a,o,s);return new e([Ne.create(t,[a,o,s],{...r,label:`${i}-write`}),Ne.create(t,[a,o,s],{...r,label:`${i}-read`})],c)}get read(){return this.textures[1]}get write(){return this.textures[0]}swap(){let[e,t]=this.textures;this.textures=[t,e]}destroy(){for(let e of this.textures)e.destroy()}};function We(e,t){return t>65535?new Uint32Array(e):new Uint16Array(e)}var Ge=class{static plane(e={}){let t=e.width??1,n=e.height??1,r=Math.max(1,Math.floor(e.segmentsX??1)),i=Math.max(1,Math.floor(e.segmentsY??1)),a=[],o=[],s=[],c=[];for(let e=0;e<=i;e++)for(let c=0;c<=r;c++){let l=c/r,u=e/i,d=(l-.5)*t,f=(u-.5)*n;a.push(d,f,0),o.push(l,u),s.push(0,0,1)}let l=r+1;for(let e=0;e<i;e++)for(let t=0;t<r;t++){let n=e*l+t,r=n+1,i=n+l+1,a=n+l;c.push(n,r,i,n,i,a)}return{positions:new Float32Array(a),uvs:new Float32Array(o),normals:new Float32Array(s),indices:We(c,a.length/3)}}static sphere(e={}){let t=e.radius??1,n=Math.max(3,Math.floor(e.segments??12)),r=[],i=[],a=[],o=[];for(let e=0;e<=n;e++){let o=e/n,s=o*Math.PI,c=Math.cos(s),l=Math.sin(s);for(let e=0;e<=n;e++){let s=e/n,u=s*Math.PI*2,d=Math.cos(u),f=Math.sin(u),p=d*l,m=c,h=f*l;r.push(p*t,m*t,h*t),a.push(p,m,h),i.push(s,1-o)}}let s=n+1;for(let e=0;e<n;e++)for(let t=0;t<n;t++){let n=e*s+t,r=n+1,i=n+s+1,a=n+s;o.push(n,r,i,n,i,a)}return{positions:new Float32Array(r),uvs:new Float32Array(i),normals:new Float32Array(a),indices:We(o,r.length/3)}}static cube(e={}){let t=(e.size??1)*.5,n=[],r=[],i=[],a=[],o=0;function s(e,t,s,c,l){n.push(...e,...t,...s,...c),r.push(0,0,1,0,1,1,0,1),i.push(...l,...l,...l,...l),a.push(o+0,o+1,o+2,o+0,o+2,o+3),o+=4}return s([t,-t,-t],[t,t,-t],[t,t,t],[t,-t,t],[1,0,0]),s([-t,-t,t],[-t,t,t],[-t,t,-t],[-t,-t,-t],[-1,0,0]),s([-t,t,-t],[-t,t,t],[t,t,t],[t,t,-t],[0,1,0]),s([-t,-t,t],[-t,-t,-t],[t,-t,-t],[t,-t,t],[0,-1,0]),s([-t,-t,t],[t,-t,t],[t,t,t],[-t,t,t],[0,0,1]),s([t,-t,-t],[-t,-t,-t],[-t,t,-t],[t,t,-t],[0,0,-1]),{positions:new Float32Array(n),uvs:new Float32Array(r),normals:new Float32Array(i),indices:We(a,n.length/3)}}};function Ke(e=document.body){let t=document.createElement(`div`);t.style.cssText=`position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:2rem;font:16px/1.5 system-ui,sans-serif;background:#111;color:#eee;text-align:center;`,t.textContent=`WebGPU is not available in this browser. Try the latest Chrome, Edge, or Safari.`,e.appendChild(t)}async function qe(){if(!await we.isSupported())throw Ke(),Error(`WebGPU is not supported.`)}var Je=typeof Float32Array<`u`?Float32Array:Array;Math.PI/180,Math.hypot||(Math.hypot=function(){for(var e=0,t=arguments.length;t--;)e+=arguments[t]*arguments[t];return Math.sqrt(e)});function Ye(){var e=new Je(3);return Je!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function Xe(e){var t=new Je(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function Ze(e){var t=e[0],n=e[1],r=e[2];return Math.hypot(t,n,r)}function Qe(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function $e(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e}function et(e,t){var n=t[0],r=t[1],i=t[2],a=n*n+r*r+i*i;return a>0&&(a=1/Math.sqrt(a)),e[0]=t[0]*a,e[1]=t[1]*a,e[2]=t[2]*a,e}var tt=$e;(function(){var e=Ye();return function(t,n,r,i,a,o){var s,c;for(n||=3,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2];return t}})();var nt={TEXTURE_SIZE:32,DENSITY_DISSIPATION:.994,VELOCITY_DISSIPATION:.996,PRESSURE_DISSIPATION:.996,PRESSURE_ITERATIONS:20,CURL:5,ADVECTION_SCALE:1},Y=`
fn mirrorRepeat01(t: f32) -> f32 {
  var x = abs(t);
  let period = 2.0;
  x = x - floor(x / period) * period;
  if (x > 1.0) {
    x = 2.0 - x;
  }
  return x;
}

fn mirrorRepeat3(c: vec3<f32>) -> vec3<f32> {
  return vec3(mirrorRepeat01(c.x), mirrorRepeat01(c.y), mirrorRepeat01(c.z));
}

fn sampleScalarMirrored(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> f32 {
  let gs = gridSize;
  let m = mirrorRepeat3(uvw);
  let coord = vec3<i32>(clamp(m * gs, vec3(0.0), vec3(gs - 1.0)));
  return textureLoad(tex, coord, 0).x;
}

fn sampleVec3Mirrored(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> vec3<f32> {
  let gs = gridSize;
  let m = mirrorRepeat3(uvw);
  let coord = vec3<i32>(clamp(m * gs, vec3(0.0), vec3(gs - 1.0)));
  return textureLoad(tex, coord, 0).xyz;
}

fn sampleScalarOffset(tex: texture_3d<f32>, coord: vec3<i32>, gridSize: f32) -> f32 {
  let n = i32(gridSize);
  let cx = clamp(coord.x, 0, n - 1);
  let cy = clamp(coord.y, 0, n - 1);
  let cz = clamp(coord.z, 0, n - 1);
  return textureLoad(tex, vec3<i32>(cx, cy, cz), 0).x;
}

fn sampleVec3Offset(tex: texture_3d<f32>, coord: vec3<i32>, gridSize: f32) -> vec3<f32> {
  let n = i32(gridSize);
  let cx = clamp(coord.x, 0, n - 1);
  let cy = clamp(coord.y, 0, n - 1);
  let cz = clamp(coord.z, 0, n - 1);
  return textureLoad(tex, vec3<i32>(cx, cy, cz), 0).xyz;
}

fn sampleVelocityMirrored(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> vec3<f32> {
  let gs = gridSize;
  let mult = vec3<f32>(
    select(1.0, -1.0, uvw.x < 0.0 || uvw.x > 1.0),
    select(1.0, -1.0, uvw.y < 0.0 || uvw.y > 1.0),
    select(1.0, -1.0, uvw.z < 0.0 || uvw.z > 1.0),
  );
  let u = mirrorRepeat3(uvw);
  let coord = vec3<i32>(clamp(u * gs, vec3(0.0), vec3(gs - 1.0)));
  return textureLoad(tex, coord, 0).xyz * mult;
}

// ── Trilinear interpolation for smooth advection ──────────────────
fn sampleTrilinear(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> vec4<f32> {
  let m = mirrorRepeat3(uvw);
  let tc = m * gridSize - 0.5;         // continuous texel coords
  let t0 = floor(tc);
  let f  = tc - t0;                     // fractional part [0,1)

  let gs = i32(gridSize);
  let i0 = vec3<i32>(t0);
  let i1 = i0 + 1;
  // clamp to valid range
  let c0 = clamp(i0, vec3(0), vec3(gs - 1));
  let c1 = clamp(i1, vec3(0), vec3(gs - 1));

  // 8-tap load
  let v000 = textureLoad(tex, vec3<i32>(c0.x, c0.y, c0.z), 0);
  let v100 = textureLoad(tex, vec3<i32>(c1.x, c0.y, c0.z), 0);
  let v010 = textureLoad(tex, vec3<i32>(c0.x, c1.y, c0.z), 0);
  let v110 = textureLoad(tex, vec3<i32>(c1.x, c1.y, c0.z), 0);
  let v001 = textureLoad(tex, vec3<i32>(c0.x, c0.y, c1.z), 0);
  let v101 = textureLoad(tex, vec3<i32>(c1.x, c0.y, c1.z), 0);
  let v011 = textureLoad(tex, vec3<i32>(c0.x, c1.y, c1.z), 0);
  let v111 = textureLoad(tex, vec3<i32>(c1.x, c1.y, c1.z), 0);

  // lerp along x, then y, then z
  let a00 = mix(v000, v100, f.x);
  let a10 = mix(v010, v110, f.x);
  let a01 = mix(v001, v101, f.x);
  let a11 = mix(v011, v111, f.x);
  let b0  = mix(a00,  a10,  f.y);
  let b1  = mix(a01,  a11,  f.y);
  return mix(b0, b1, f.z);
}

fn sampleScalarTrilinear(tex: texture_3d<f32>, uvw: vec3<f32>, gridSize: f32) -> f32 {
  return sampleTrilinear(tex, uvw, gridSize).x;
}
`,rt=`
struct PassParams {
  gridSize: f32,
  dissipation: f32,
  timestep: f32,
  advectionScale: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var mapIn: texture_3d<f32>;
@group(0) @binding(3) var mapOut: texture_storage_3d<rgba32float, write>;

${Y}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let pos = (vec3<f32>(globalId) + 0.5) / params.gridSize;
  let vel = textureLoad(velocityIn, globalId, 0).xyz;

  let backPos = pos - vel * params.timestep * params.advectionScale / params.gridSize;

  // Use trilinear interpolation for smooth transport
  let sampled = sampleTrilinear(mapIn, backPos, params.gridSize);

  textureStore(mapOut, globalId, sampled * params.dissipation);
}
`,it=`
fn mod289_v4(x: vec4<f32>) -> vec4<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn perm(x: vec4<f32>) -> vec4<f32> {
  return mod289_v4(((x * 34.0) + 1.0) * x);
}

fn noise(p: vec3<f32>) -> f32 {
  let a = floor(p);
  var d = p - a;
  d = d * d * (3.0 - 2.0 * d);

  let b = vec4(a.x, a.x, a.y, a.y) + vec4(0.0, 1.0, 0.0, 1.0);
  let k1 = perm(vec4(b.x, b.y, b.x, b.y));
  let k2 = perm(vec4(k1.x, k1.y, k1.x, k1.y) + vec4(b.z, b.z, b.w, b.w));

  let c = k2 + vec4(a.z, a.z, a.z, a.z);
  let k3 = perm(c);
  let k4 = perm(c + vec4(1.0));

  let o1 = fract(k3 * (1.0 / 41.0));
  let o2 = fract(k4 * (1.0 / 41.0));

  let o3 = o2 * d.z + o1 * (1.0 - d.z);
  let o4 = vec2(o3.y, o3.w) * d.x + vec2(o3.x, o3.z) * (1.0 - d.x);

  return o4.y * d.y + o4.x * (1.0 - d.y);
}

fn snoise(p: vec3<f32>) -> f32 {
  return noise(p) * 2.0 - 1.0;
}

fn snoiseVec3(x: vec3<f32>) -> vec3<f32> {
  let s = snoise(x);
  let s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  let s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  return vec3(s, s1, s2);
}

fn curlNoise(p: vec3<f32>) -> vec3<f32> {
  let e = 0.1;
  let dx = vec3(e, 0.0, 0.0);
  let dy = vec3(0.0, e, 0.0);
  let dz = vec3(0.0, 0.0, e);

  let p_x0 = snoiseVec3(p - dx);
  let p_x1 = snoiseVec3(p + dx);
  let p_y0 = snoiseVec3(p - dy);
  let p_y1 = snoiseVec3(p + dy);
  let p_z0 = snoiseVec3(p - dz);
  let p_z1 = snoiseVec3(p + dz);

  let x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  let y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  let z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  let divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}
`;`${Y}${it}`;var at=`
struct ForceParams {
  grid: vec4<f32>,
  center: vec4<f32>,
  dir: vec4<f32>,
  force: vec4<f32>,
}

@group(0) @binding(0) var<uniform> params: ForceParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var densityIn: texture_3d<f32>;
@group(0) @binding(3) var velocityOut: texture_storage_3d<rgba32float, write>;
@group(0) @binding(4) var densityOut: texture_storage_3d<rgba32float, write>;

${it}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.grid.x);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  var velocity = textureLoad(velocityIn, globalId, 0).xyz;
  var density = textureLoad(densityIn, globalId, 0).x;
  let dt = params.force.x;
  let strength = params.force.y;
  let radius = params.force.z;
  let densityScale = params.force.w;
  let noiseStrength = params.dir.w;
  let time = params.grid.y;

  // Sim-space cell centre in [-0.5, 0.5] — matches webgpu_particles applyForces.
  let p = (vec3<f32>(globalId) + 0.5) / params.grid.x - 0.5;
  let delta = p - params.center.xyz;
  let dist = length(delta);

  if (dist < radius) {
    let t = 1.0 - dist / radius;
    let influence = pow(t, 3.0) * strength;
    var finalDir = params.dir.xyz;
    if (noiseStrength > 0.0) {
      let noise = curlNoise(p * 5.0 + vec3(0.0, time * 0.3, 0.0));
      finalDir += noise * noiseStrength;
    }
    velocity += finalDir * influence * dt;
    density += influence * densityScale * 0.001;
  }

  textureStore(velocityOut, globalId, vec4(velocity, 0.0));
  textureStore(densityOut, globalId, vec4(density, 0.0, 0.0, 0.0));
}
`,ot=`
struct PassParams {
  gridSize: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var divergenceOut: texture_storage_3d<rgba32float, write>;

${Y}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let uvw = (vec3<f32>(globalId) + 0.5) / params.gridSize;
  let texelSize = 1.0 / params.gridSize;

  let L = sampleVelocityMirrored(velocityIn, uvw - vec3(texelSize, 0.0, 0.0), params.gridSize).x;
  let R = sampleVelocityMirrored(velocityIn, uvw + vec3(texelSize, 0.0, 0.0), params.gridSize).x;
  let B = sampleVelocityMirrored(velocityIn, uvw - vec3(0.0, texelSize, 0.0), params.gridSize).y;
  let T = sampleVelocityMirrored(velocityIn, uvw + vec3(0.0, texelSize, 0.0), params.gridSize).y;
  let D = sampleVelocityMirrored(velocityIn, uvw - vec3(0.0, 0.0, texelSize), params.gridSize).z;
  let F = sampleVelocityMirrored(velocityIn, uvw + vec3(0.0, 0.0, texelSize), params.gridSize).z;

  let div = 0.5 * (R - L + T - B + F - D);
  textureStore(divergenceOut, globalId, vec4<f32>(div, 0.0, 0.0, 0.0));
}
`,st=`
struct PassParams {
  gridSize: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var pressureIn: texture_3d<f32>;
@group(0) @binding(2) var divergenceIn: texture_3d<f32>;
@group(0) @binding(3) var pressureOut: texture_storage_3d<rgba32float, write>;

${Y}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let c = vec3<i32>(globalId);
  let L = sampleScalarOffset(pressureIn, c - vec3(1, 0, 0), params.gridSize);
  let R = sampleScalarOffset(pressureIn, c + vec3(1, 0, 0), params.gridSize);
  let B = sampleScalarOffset(pressureIn, c - vec3(0, 1, 0), params.gridSize);
  let T = sampleScalarOffset(pressureIn, c + vec3(0, 1, 0), params.gridSize);
  let D = sampleScalarOffset(pressureIn, c - vec3(0, 0, 1), params.gridSize);
  let F = sampleScalarOffset(pressureIn, c + vec3(0, 0, 1), params.gridSize);
  let div = sampleScalarOffset(divergenceIn, c, params.gridSize);

  let p = (L + R + B + T + D + F - div) / 6.0;
  textureStore(pressureOut, globalId, vec4<f32>(p, 0.0, 0.0, 0.0));
}
`,ct=`
struct PassParams {
  gridSize: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var pressureIn: texture_3d<f32>;
@group(0) @binding(2) var velocityIn: texture_3d<f32>;
@group(0) @binding(3) var velocityOut: texture_storage_3d<rgba32float, write>;

${Y}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let c = vec3<i32>(globalId);
  let pL = sampleScalarOffset(pressureIn, c - vec3(1, 0, 0), params.gridSize);
  let pR = sampleScalarOffset(pressureIn, c + vec3(1, 0, 0), params.gridSize);
  let pB = sampleScalarOffset(pressureIn, c - vec3(0, 1, 0), params.gridSize);
  let pT = sampleScalarOffset(pressureIn, c + vec3(0, 1, 0), params.gridSize);
  let pD = sampleScalarOffset(pressureIn, c - vec3(0, 0, 1), params.gridSize);
  let pF = sampleScalarOffset(pressureIn, c + vec3(0, 0, 1), params.gridSize);
  let v = sampleVec3Offset(velocityIn, c, params.gridSize);

  let grad = 0.5 * vec3(pR - pL, pT - pB, pF - pD);
  textureStore(velocityOut, globalId, vec4(v - grad, 0.0));
}
`,lt=`
struct PassParams {
  gridSize: f32,
  dissipation: f32,
  _pad0: f32,
  _pad1: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var pressureIn: texture_3d<f32>;
@group(0) @binding(2) var pressureOut: texture_storage_3d<rgba32float, write>;

${Y}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let c = vec3<i32>(globalId);
  let p = sampleScalarOffset(pressureIn, c, params.gridSize);
  textureStore(pressureOut, globalId, vec4<f32>(p * params.dissipation, 0.0, 0.0, 0.0));
}
`,ut=`
struct VorticityParams {
  gridSize: f32,
  dt: f32,
  curl: f32,    // confinement strength (ε)
  _pad: f32,
}

@group(0) @binding(0) var<uniform> params: VorticityParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var velocityOut: texture_storage_3d<rgba32float, write>;

${Y}

// Compute curl(v) = ∇ × v  via central differences
fn computeCurl(tex: texture_3d<f32>, c: vec3<i32>, gs: f32) -> vec3<f32> {
  let vL = sampleVec3Offset(tex, c - vec3(1, 0, 0), gs);
  let vR = sampleVec3Offset(tex, c + vec3(1, 0, 0), gs);
  let vB = sampleVec3Offset(tex, c - vec3(0, 1, 0), gs);
  let vT = sampleVec3Offset(tex, c + vec3(0, 1, 0), gs);
  let vD = sampleVec3Offset(tex, c - vec3(0, 0, 1), gs);
  let vF = sampleVec3Offset(tex, c + vec3(0, 0, 1), gs);
  let curlScale = 0.5 * gs;

  return curlScale * vec3<f32>(
    (vT.z - vB.z) - (vF.y - vD.y),
    (vF.x - vD.x) - (vR.z - vL.z),
    (vR.y - vL.y) - (vT.x - vB.x),
  );
}

@compute @workgroup_size(4, 4, 4)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let gridSize = u32(params.gridSize);
  if (globalId.x >= gridSize || globalId.y >= gridSize || globalId.z >= gridSize) {
    return;
  }

  let c = vec3<i32>(globalId);
  let gs = params.gridSize;

  // Curl at this cell
  let omega = computeCurl(velocityIn, c, gs);

  // |curl| at neighbours for the gradient of |curl|
  let cL = length(computeCurl(velocityIn, c - vec3(1, 0, 0), gs));
  let cR = length(computeCurl(velocityIn, c + vec3(1, 0, 0), gs));
  let cB = length(computeCurl(velocityIn, c - vec3(0, 1, 0), gs));
  let cT = length(computeCurl(velocityIn, c + vec3(0, 1, 0), gs));
  let cD = length(computeCurl(velocityIn, c - vec3(0, 0, 1), gs));
  let cF = length(computeCurl(velocityIn, c + vec3(0, 0, 1), gs));

  // η = ∇|ω|  →  N = η / |η|
  let eta = vec3<f32>(cR - cL, cT - cB, cF - cD);
  let etaLen = length(eta);
  // Add a small epsilon to prevent amplifying microscopic grid noise into full-strength forces
  let N = eta / (etaLen + 1e-4);

  // Confinement force: f = epsilon * h * (N x omega).
  let texelSize = 1.0 / gs;
  let force = params.curl * cross(N, omega) * texelSize;

  let v = textureLoad(velocityIn, globalId, 0).xyz;
  textureStore(velocityOut, globalId, vec4(v + force * params.dt, 0.0));
}
`,dt=4,ft=1;function pt(){let e=Math.random()*Math.PI*2,t=Math.acos(2*Math.random()-1);return[Math.sin(t)*Math.cos(e),Math.sin(t)*Math.sin(e),Math.cos(t)]}var mt=q.create({gridSize:`f32`,dissipation:`f32`,timestep:`f32`,advectionScale:`f32`}),ht=q.create({gridSize:`f32`,_pad0:`f32`,_pad1:`f32`,_pad2:`f32`}),gt=q.create({gridSize:`f32`,dissipation:`f32`,_pad0:`f32`,_pad1:`f32`}),_t=q.create({grid:`vec4f`,center:`vec4f`,dir:`vec4f`,force:`vec4f`}),vt=q.create({gridSize:`f32`,dt:`f32`,curl:`f32`,_pad:`f32`}),yt=class{settings;maxRadius;_device;_gridSize;_dispatch;_dt=1/60;_time=0;_velocity;_density;_pressure;_divergenceTex;_passUniformBuffer;_gridUniformBuffer;_clearUniformBuffer;_vorticityUniformBuffer;_forceUniformBuffers=[];_advect;_applyForces;_vorticityConfinement;_divergenceCompute;_jacobi;_gradient;_clear;_pendingForces=[];constructor(e,t={},n=ft){this._device=e,this.maxRadius=n,this.settings={...nt};for(let e in t){let n=e;this.settings[n]!==void 0&&t[n]!==void 0&&(this.settings[n]=t[n])}let r=this.settings.TEXTURE_SIZE;this._gridSize=r,this._dispatch=[r/dt,r/dt,r/dt],this._velocity=Ue.create(e,r,{label:`Velocity`}),this._density=Ue.create(e,r,{label:`Density`}),this._pressure=Ue.create(e,r,{label:`Pressure`}),this._divergenceTex=Ne.create(e,r,{label:`Divergence`});let i=W.uniform;this._passUniformBuffer=G.create(e,G.uniformSize(mt.byteSize),i,`fluid-pass-uniforms`),this._gridUniformBuffer=G.create(e,G.uniformSize(ht.byteSize),i,`fluid-grid-uniforms`),this._clearUniformBuffer=G.create(e,G.uniformSize(gt.byteSize),i,`fluid-clear-uniforms`),this._vorticityUniformBuffer=G.create(e,G.uniformSize(vt.byteSize),i,`fluid-vorticity-uniforms`),this._advect=new J(e,rt,{label:`FluidAdvect`}),this._applyForces=new J(e,at,{label:`FluidApplyForces`}),this._vorticityConfinement=new J(e,ut,{label:`FluidVorticityConfinement`}),this._divergenceCompute=new J(e,ot,{label:`FluidDivergence`}),this._jacobi=new J(e,st,{label:`FluidJacobi`}),this._gradient=new J(e,ct,{label:`FluidGradient`}),this._clear=new J(e,lt,{label:`FluidClear`})}addForce(e,t,n,r,i=1,a=0){let o=.5/this.maxRadius;this._pendingForces.push({center:[e[0]*o,e[1]*o,e[2]*o],dir:t,radius:n*o,strength:r,densityScale:i,noiseStrength:a})}updateFlow(e,t,n=1,r=1,i=0){let a=[(e[0]-.5)*2*this.maxRadius,(e[1]-.5)*2*this.maxRadius,(e[2]-.5)*2*this.maxRadius],o=.08*r*this.maxRadius;this.addForce(a,t,o,800*n,1,i)}applyRandomForces(e,t={}){let{strengthMin:n=400,strengthMax:r=1200,radiusMin:i=.06,radiusMax:a=.14}=t;for(let t=0;t<e;t++){let e=[(Math.random()-.5)*2*this.maxRadius,(Math.random()-.5)*2*this.maxRadius,(Math.random()-.5)*2*this.maxRadius],t=n+Math.random()*(r-n),o=i+Math.random()*(a-i);this.addForce(e,pt(),o*this.maxRadius,t)}}updateFlowWithMap(e,t,n=1){}update(e,t){t!==void 0&&(this._dt=Math.min(t,.1)),this._time+=this._dt;let n=e.beginComputePass({label:`fluid-sim`});this._advectPass(n,this._velocity,this.settings.VELOCITY_DISSIPATION),this._advectPass(n,this._density,this.settings.DENSITY_DISSIPATION),this._flushForces(n),this.settings.CURL>0&&this._vorticityConfinementPass(n),this._divergencePass(n),this._clearPass(n);for(let e=0;e<this.settings.PRESSURE_ITERATIONS;e++)this._jacobiPass(n);this._gradientPass(n),n.end()}get velocity(){return this._velocity.read}get density(){return this._density.read}get divergence(){return this._divergenceTex}get pressure(){return this._pressure.read}get allTextures(){return[this.velocity,this.density,this._divergenceTex,this.pressure]}log(){console.log(`Fluid Settings : `);for(let e in this.settings)console.log(e,this.settings[e])}destroy(){this._velocity.destroy(),this._density.destroy(),this._pressure.destroy(),this._divergenceTex.destroy(),this._passUniformBuffer.destroy(),this._gridUniformBuffer.destroy(),this._clearUniformBuffer.destroy();for(let e of this._forceUniformBuffers)e.destroy();this._vorticityUniformBuffer.destroy()}_writePassUniforms(e){mt.set(`gridSize`,this._gridSize).set(`dissipation`,e).set(`timestep`,this._dt).set(`advectionScale`,this.settings.ADVECTION_SCALE).writeToBuffer(this._passUniformBuffer,this._device)}_writeGridUniforms(){ht.set(`gridSize`,this._gridSize).set(`_pad0`,0).set(`_pad1`,0).set(`_pad2`,0).writeToBuffer(this._gridUniformBuffer,this._device)}_advectPass(e,t,n){this._writePassUniforms(n);let r=K.create(this._device,this._advect.getBindGroupLayout(0),[{binding:0,resource:this._passUniformBuffer},{binding:1,resource:this._velocity.read.view},{binding:2,resource:t.read.view},{binding:3,resource:t.write.storageView}],`fluid-advect-bg`);this._advect.dispatch(e,r,this._dispatch),t.swap()}_vorticityConfinementPass(e){vt.set(`gridSize`,this._gridSize).set(`dt`,this._dt).set(`curl`,this.settings.CURL).set(`_pad`,0).writeToBuffer(this._vorticityUniformBuffer,this._device);let t=K.create(this._device,this._vorticityConfinement.getBindGroupLayout(0),[{binding:0,resource:this._vorticityUniformBuffer},{binding:1,resource:this._velocity.read.view},{binding:2,resource:this._velocity.write.storageView}],`fluid-vorticity-bg`);this._vorticityConfinement.dispatch(e,t,this._dispatch),this._velocity.swap()}_flushForces(e){for(let t=0;t<this._pendingForces.length;t++){let n=this._pendingForces[t],r=this._getForceUniformBuffer(t);_t.set(`grid`,[this._gridSize,this._time,0,0]).set(`center`,[n.center[0],n.center[1],n.center[2],0]).set(`dir`,[n.dir[0],n.dir[1],n.dir[2],n.noiseStrength]).set(`force`,[this._dt,n.strength,n.radius,n.densityScale]).writeToBuffer(r,this._device);let i=K.create(this._device,this._applyForces.getBindGroupLayout(0),[{binding:0,resource:r},{binding:1,resource:this._velocity.read.view},{binding:2,resource:this._density.read.view},{binding:3,resource:this._velocity.write.storageView},{binding:4,resource:this._density.write.storageView}],`fluid-apply-forces-bg`);this._applyForces.dispatch(e,i,this._dispatch),this._velocity.swap(),this._density.swap()}this._pendingForces.length=0}_getForceUniformBuffer(e){let t=this._forceUniformBuffers[e];return t||(t=G.create(this._device,G.uniformSize(_t.byteSize),W.uniform,`fluid-force-uniforms-${e}`),this._forceUniformBuffers[e]=t),t}_divergencePass(e){this._writeGridUniforms();let t=K.create(this._device,this._divergenceCompute.getBindGroupLayout(0),[{binding:0,resource:this._gridUniformBuffer},{binding:1,resource:this._velocity.read.view},{binding:2,resource:this._divergenceTex.storageView}],`fluid-divergence-bg`);this._divergenceCompute.dispatch(e,t,this._dispatch)}_clearPass(e){gt.set(`gridSize`,this._gridSize).set(`dissipation`,this.settings.PRESSURE_DISSIPATION).set(`_pad0`,0).set(`_pad1`,0).writeToBuffer(this._clearUniformBuffer,this._device);let t=K.create(this._device,this._clear.getBindGroupLayout(0),[{binding:0,resource:this._clearUniformBuffer},{binding:1,resource:this._pressure.read.view},{binding:2,resource:this._pressure.write.storageView}],`fluid-clear-bg`);this._clear.dispatch(e,t,this._dispatch),this._pressure.swap()}_jacobiPass(e){this._writeGridUniforms();let t=K.create(this._device,this._jacobi.getBindGroupLayout(0),[{binding:0,resource:this._gridUniformBuffer},{binding:1,resource:this._pressure.read.view},{binding:2,resource:this._divergenceTex.view},{binding:3,resource:this._pressure.write.storageView}],`fluid-jacobi-bg`);this._jacobi.dispatch(e,t,this._dispatch),this._pressure.swap()}_gradientPass(e){this._writeGridUniforms();let t=K.create(this._device,this._gradient.getBindGroupLayout(0),[{binding:0,resource:this._gridUniformBuffer},{binding:1,resource:this._pressure.read.view},{binding:2,resource:this._velocity.read.view},{binding:3,resource:this._velocity.write.storageView}],`fluid-gradient-bg`);this._gradient.dispatch(e,t,this._dispatch),this._velocity.swap()}},bt=`
struct SliceUniforms {
  viewProj: mat4x4<f32>,
  texSize: f32,
  volumeExtent: f32,
  showVelocity: f32,
  showDensity: f32,
  densityGain: f32,
  velocityThreshold: f32,
}

@group(0) @binding(0) var<uniform> scene: SliceUniforms;
@group(0) @binding(1) var velocityTex: texture_3d<f32>;
@group(0) @binding(2) var densityTex: texture_3d<f32>;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = scene.viewProj * vec4<f32>(input.position, 1.0);
  output.uv = input.uv;
  return output;
}

fn velocity_color(vel: vec3<f32>) -> vec3<f32> {
  let speed = length(vel);
  let dir = select(vec3<f32>(0.0, 1.0, 0.0), normalize(vel), speed > 0.0001);
  return vec3<f32>(
    max(dir.x, 0.0) * 0.85 + abs(dir.z) * 0.15,
    max(dir.y, 0.0),
    max(-dir.x, 0.0) * 0.85 + abs(dir.z) * 0.15
  );
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let n = i32(scene.texSize);
  let maxCoord = vec2<i32>(n - 1);
  let xy = clamp(vec2<i32>(input.uv * scene.texSize), vec2<i32>(0), maxCoord);
  let coord = vec3<i32>(xy, n / 2);

  let vel = textureLoad(velocityTex, coord, 0).xyz;
  let density = max(textureLoad(densityTex, coord, 0).x, 0.0);
  let speed = length(vel);

  let densitySignal = max(density * scene.densityGain, 0.0);
  let densityAlpha = clamp(densitySignal * 2.5, 0.0, 1.0) * scene.showDensity;
  let velocityAlpha = smoothstep(
    scene.velocityThreshold,
    scene.velocityThreshold * 3.0,
    speed
  ) * scene.showVelocity * 0.5;
  let densityColor = mix(
    vec3<f32>(0.16, 0.02, 0.0),
    vec3<f32>(1.0, 0.5, 0.05),
    clamp(densitySignal, 0.0, 1.0)
  ) * densityAlpha;
  let velColor = velocity_color(vel) * velocityAlpha * (1.0 - densityAlpha);

  let color = densityColor + velColor;
  let grid = max(
    step(fract(input.uv.x * 16.0), 0.018),
    step(fract(input.uv.y * 16.0), 0.018)
  );
  let gridColor = vec3<f32>(0.04, 0.08, 0.12) * grid * 0.35;
  let alpha = max(max(densityAlpha, velocityAlpha), grid * 0.08);

  return vec4<f32>(color + gridColor, alpha);
}
`,xt=q.create({viewProj:`mat4x4f`,texSize:`f32`,volumeExtent:`f32`,showVelocity:`f32`,showDensity:`f32`,densityGain:`f32`,velocityThreshold:`f32`}),St=class{mesh;device;positionBuffer;uvBuffer;indexBuffer;uniformBuffer;drawPass;bindGroupLayout;pipelineLayout;constructor(e,t={}){this.device=e;let n=t.texSize??32,r=t.volumeExtent??2,i=Ge.plane({width:r,height:r,segmentsX:1,segmentsY:1});this.positionBuffer=G.fromData(e,i.positions,W.vertex,`slice-plane-positions`),this.uvBuffer=G.fromData(e,i.uvs,W.vertex,`slice-plane-uvs`),this.indexBuffer=G.fromData(e,i.indices,W.index,`slice-plane-indices`),this.mesh=new Ie(i.positions.length/3).addVertexBuffer({buffer:this.positionBuffer,arrayStride:12,attributes:[{shaderLocation:0,format:`float32x3`,offset:0}],slot:0,stepMode:`vertex`}).addVertexBuffer({buffer:this.uvBuffer,arrayStride:8,attributes:[{shaderLocation:1,format:`float32x2`,offset:0}],slot:1,stepMode:`vertex`}).setIndexBuffer(this.indexBuffer,i.indices.length,i.indices instanceof Uint32Array?`uint32`:`uint16`),this.uniformBuffer=G.create(e,G.uniformSize(xt.byteSize),W.uniform,`slice-plane-uniforms`);let a=GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT;this.bindGroupLayout=e.gpu.createBindGroupLayout({label:`SlicePlaneBindGroupLayout`,entries:[{binding:0,visibility:a,buffer:{type:`uniform`}},{binding:1,visibility:a,texture:{sampleType:`unfilterable-float`,viewDimension:`3d`}},{binding:2,visibility:a,texture:{sampleType:`unfilterable-float`,viewDimension:`3d`}}]}),this.pipelineLayout=e.gpu.createPipelineLayout({label:`SlicePlanePipelineLayout`,bindGroupLayouts:[this.bindGroupLayout]}),this.drawPass=new Fe(e,bt,{label:`SlicePlane`,layout:this.pipelineLayout,vertexBuffers:this.mesh.getVertexLayouts(),primitive:{topology:`triangle-list`,cullMode:`none`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!1,depthCompare:`less`},targets:[{format:e.format,blend:{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}}]}),xt.set(`viewProj`,new Float32Array(16)).set(`texSize`,n).set(`volumeExtent`,r).set(`showVelocity`,1).set(`showDensity`,1).set(`densityGain`,14).set(`velocityThreshold`,1.2).writeToBuffer(this.uniformBuffer,e)}draw(e,t,n,r,i){xt.set(`viewProj`,r).set(`showVelocity`,+!!i.showVelocity).set(`showDensity`,+!!i.showDensity).set(`densityGain`,i.densityGain).set(`velocityThreshold`,i.velocityThreshold).writeToBuffer(this.uniformBuffer,this.device);let a=K.create(this.device,this.bindGroupLayout,[{binding:0,resource:this.uniformBuffer},{binding:1,resource:t.view},{binding:2,resource:n.view}],`slice-plane-bind-group`);this.drawPass.draw(e,this.mesh,a)}destroy(){this.positionBuffer.destroy(),this.uvBuffer.destroy(),this.indexBuffer.destroy(),this.uniformBuffer.destroy()}},X=class e{constructor(t,n,r,i,a=`div`){this.parent=t,this.object=n,this.property=r,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(a),this.domElement.classList.add(`controller`),this.domElement.classList.add(i),this.$name=document.createElement(`div`),this.$name.classList.add(`name`),e.nextNameID=e.nextNameID||0,this.$name.id=`lil-gui-name-${++e.nextNameID}`,this.$widget=document.createElement(`div`),this.$widget.classList.add(`widget`),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener(`keydown`,e=>e.stopPropagation()),this.domElement.addEventListener(`keyup`,e=>e.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(r)}name(e){return this._name=e,this.$name.textContent=e,this}onChange(e){return this._onChange=e,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(e=!0){return this.disable(!e)}disable(e=!0){return e===this._disabled?this:(this._disabled=e,this.domElement.classList.toggle(`disabled`,e),this.$disable.toggleAttribute(`disabled`,e),this)}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}options(e){let t=this.parent.add(this.object,this.property,e);return t.name(this._name),this.destroy(),t}min(e){return this}max(e){return this}step(e){return this}decimals(e){return this}listen(e=!0){return this._listening=e,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);let e=this.save();e!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=e}getValue(){return this.object[this.property]}setValue(e){return this.getValue()!==e&&(this.object[this.property]=e,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(e){return this.setValue(e),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}},Ct=class extends X{constructor(e,t,n){super(e,t,n,`boolean`,`label`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`checkbox`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener(`change`,()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}};function wt(e){let t,n;return(t=e.match(/(#|0x)?([a-f0-9]{6})/i))?n=t[2]:(t=e.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?n=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=e.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(n=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),n?`#`+n:!1}var Tt={isPrimitive:!0,match:e=>typeof e==`string`,fromHexString:wt,toHexString:wt},Z={isPrimitive:!0,match:e=>typeof e==`number`,fromHexString:e=>parseInt(e.substring(1),16),toHexString:e=>`#`+e.toString(16).padStart(6,0)},Et=[Tt,Z,{isPrimitive:!1,match:e=>Array.isArray(e),fromHexString(e,t,n=1){let r=Z.fromHexString(e);t[0]=(r>>16&255)/255*n,t[1]=(r>>8&255)/255*n,t[2]=(r&255)/255*n},toHexString([e,t,n],r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return Z.toHexString(i)}},{isPrimitive:!1,match:e=>Object(e)===e,fromHexString(e,t,n=1){let r=Z.fromHexString(e);t.r=(r>>16&255)/255*n,t.g=(r>>8&255)/255*n,t.b=(r&255)/255*n},toHexString({r:e,g:t,b:n},r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return Z.toHexString(i)}}];function Dt(e){return Et.find(t=>t.match(e))}var Ot=class extends X{constructor(e,t,n,r){super(e,t,n,`color`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`color`),this.$input.setAttribute(`tabindex`,-1),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$text=document.createElement(`input`),this.$text.setAttribute(`type`,`text`),this.$text.setAttribute(`spellcheck`,`false`),this.$text.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`display`),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=Dt(this.initialValue),this._rgbScale=r,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener(`input`,()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$text.addEventListener(`input`,()=>{let e=wt(this.$text.value);e&&this._setValueFromHexString(e)}),this.$text.addEventListener(`focus`,()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener(`blur`,()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(e){if(this._format.isPrimitive){let t=this._format.fromHexString(e);this.setValue(t)}else this._format.fromHexString(e,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(e){return this._setValueFromHexString(e),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}},Q=class extends X{constructor(e,t,n){super(e,t,n,`function`),this.$button=document.createElement(`button`),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener(`click`,e=>{e.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$disable=this.$button}},kt=class extends X{constructor(e,t,n,r,i,a){super(e,t,n,`number`),this._initInput(),this.min(r),this.max(i);let o=a!==void 0;this.step(o?a:this._getImplicitStep(),o),this.updateDisplay()}decimals(e){return this._decimals=e,this.updateDisplay(),this}min(e){return this._min=e,this._onUpdateMinMax(),this}max(e){return this._max=e,this._onUpdateMinMax(),this}step(e,t=!0){return this._step=e,this._stepExplicit=t,this}updateDisplay(){let e=this.getValue();if(this._hasSlider){let t=(e-this._min)/(this._max-this._min);t=Math.max(0,Math.min(t,1)),this.$fill.style.width=t*100+`%`}return this._inputFocused||(this.$input.value=this._decimals===void 0?e:e.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),window.matchMedia(`(pointer: coarse)`).matches&&(this.$input.setAttribute(`type`,`number`),this.$input.setAttribute(`step`,`any`)),this.$widget.appendChild(this.$input),this.$disable=this.$input;let e=()=>{let e=parseFloat(this.$input.value);isNaN(e)||(this._stepExplicit&&(e=this._snap(e)),this.setValue(this._clamp(e)))},t=e=>{let t=parseFloat(this.$input.value);isNaN(t)||(this._snapClampSetValue(t+e),this.$input.value=this.getValue())},n=e=>{e.key===`Enter`&&this.$input.blur(),e.code===`ArrowUp`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e))),e.code===`ArrowDown`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e)*-1))},r=e=>{this._inputFocused&&(e.preventDefault(),t(this._step*this._normalizeMouseWheel(e)))},i=!1,a,o,s,c,l,u=e=>{a=e.clientX,o=s=e.clientY,i=!0,c=this.getValue(),l=0,window.addEventListener(`mousemove`,d),window.addEventListener(`mouseup`,f)},d=e=>{if(i){let t=e.clientX-a,n=e.clientY-o;Math.abs(n)>5?(e.preventDefault(),this.$input.blur(),i=!1,this._setDraggingStyle(!0,`vertical`)):Math.abs(t)>5&&f()}if(!i){let t=e.clientY-s;l-=t*this._step*this._arrowKeyMultiplier(e),c+l>this._max?l=this._max-c:c+l<this._min&&(l=this._min-c),this._snapClampSetValue(c+l)}s=e.clientY},f=()=>{this._setDraggingStyle(!1,`vertical`),this._callOnFinishChange(),window.removeEventListener(`mousemove`,d),window.removeEventListener(`mouseup`,f)};this.$input.addEventListener(`input`,e),this.$input.addEventListener(`keydown`,n),this.$input.addEventListener(`wheel`,r,{passive:!1}),this.$input.addEventListener(`mousedown`,u),this.$input.addEventListener(`focus`,()=>{this._inputFocused=!0}),this.$input.addEventListener(`blur`,()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()})}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement(`div`),this.$slider.classList.add(`slider`),this.$fill=document.createElement(`div`),this.$fill.classList.add(`fill`),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add(`hasSlider`);let e=(e,t,n,r,i)=>(e-t)/(n-t)*(i-r)+r,t=t=>{let n=this.$slider.getBoundingClientRect(),r=e(t,n.left,n.right,this._min,this._max);this._snapClampSetValue(r)},n=e=>{this._setDraggingStyle(!0),t(e.clientX),window.addEventListener(`mousemove`,r),window.addEventListener(`mouseup`,i)},r=e=>{t(e.clientX)},i=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`mousemove`,r),window.removeEventListener(`mouseup`,i)},a=!1,o,s,c=e=>{e.preventDefault(),this._setDraggingStyle(!0),t(e.touches[0].clientX),a=!1},l=e=>{e.touches.length>1||(this._hasScrollBar?(o=e.touches[0].clientX,s=e.touches[0].clientY,a=!0):c(e),window.addEventListener(`touchmove`,u,{passive:!1}),window.addEventListener(`touchend`,d))},u=e=>{if(a){let t=e.touches[0].clientX-o,n=e.touches[0].clientY-s;Math.abs(t)>Math.abs(n)?c(e):(window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d))}else e.preventDefault(),t(e.touches[0].clientX)},d=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d)},f=this._callOnFinishChange.bind(this),p;this.$slider.addEventListener(`mousedown`,n),this.$slider.addEventListener(`touchstart`,l,{passive:!1}),this.$slider.addEventListener(`wheel`,e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)&&this._hasScrollBar)return;e.preventDefault();let t=this._normalizeMouseWheel(e)*this._step;this._snapClampSetValue(this.getValue()+t),this.$input.value=this.getValue(),clearTimeout(p),p=setTimeout(f,400)},{passive:!1})}_setDraggingStyle(e,t=`horizontal`){this.$slider&&this.$slider.classList.toggle(`active`,e),document.body.classList.toggle(`lil-gui-dragging`,e),document.body.classList.toggle(`lil-gui-${t}`,e)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(e){let{deltaX:t,deltaY:n}=e;return Math.floor(e.deltaY)!==e.deltaY&&e.wheelDelta&&(t=0,n=-e.wheelDelta/120,n*=this._stepExplicit?1:10),t+-n}_arrowKeyMultiplier(e){let t=this._stepExplicit?1:10;return e.shiftKey?t*=10:e.altKey&&(t/=10),t}_snap(e){let t=Math.round(e/this._step)*this._step;return parseFloat(t.toPrecision(15))}_clamp(e){return e<this._min&&(e=this._min),e>this._max&&(e=this._max),e}_snapClampSetValue(e){this.setValue(this._clamp(this._snap(e)))}get _hasScrollBar(){let e=this.parent.root.$children;return e.scrollHeight>e.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}},At=class extends X{constructor(e,t,n,r){super(e,t,n,`option`),this.$select=document.createElement(`select`),this.$select.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`display`),this.$select.addEventListener(`change`,()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener(`focus`,()=>{this.$display.classList.add(`focus`)}),this.$select.addEventListener(`blur`,()=>{this.$display.classList.remove(`focus`)}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(r)}options(e){return this._values=Array.isArray(e)?e:Object.values(e),this._names=Array.isArray(e)?e:Object.keys(e),this.$select.replaceChildren(),this._names.forEach(e=>{let t=document.createElement(`option`);t.textContent=e,this.$select.appendChild(t)}),this.updateDisplay(),this}updateDisplay(){let e=this.getValue(),t=this._values.indexOf(e);return this.$select.selectedIndex=t,this.$display.textContent=t===-1?e:this._names[t],this}},jt=class extends X{constructor(e,t,n){super(e,t,n,`string`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`spellcheck`,`false`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$input.addEventListener(`input`,()=>{this.setValue(this.$input.value)}),this.$input.addEventListener(`keydown`,e=>{e.code===`Enter`&&this.$input.blur()}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}},Mt=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles, .lil-gui.allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles, .lil-gui.force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  height: var(--title-height);
  line-height: calc(var(--title-height) - 4px);
  font-weight: 600;
  padding: 0 var(--padding);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  outline: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  border: none;
}
@media (hover: hover) {
  .lil-gui button:hover {
    background: var(--hover-color);
  }
  .lil-gui button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`;function Nt(e){let t=document.createElement(`style`);t.innerHTML=e;let n=document.querySelector(`head link[rel=stylesheet], head style`);n?document.head.insertBefore(t,n):document.head.appendChild(t)}var Pt=!1,Ft=class e{constructor({parent:e,autoPlace:t=e===void 0,container:n,width:r,title:i=`Controls`,closeFolders:a=!1,injectStyles:o=!0,touchStyles:s=!0}={}){if(this.parent=e,this.root=e?e.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement(`div`),this.domElement.classList.add(`lil-gui`),this.$title=document.createElement(`div`),this.$title.classList.add(`title`),this.$title.setAttribute(`role`,`button`),this.$title.setAttribute(`aria-expanded`,!0),this.$title.setAttribute(`tabindex`,0),this.$title.addEventListener(`click`,()=>this.openAnimated(this._closed)),this.$title.addEventListener(`keydown`,e=>{(e.code===`Enter`||e.code===`Space`)&&(e.preventDefault(),this.$title.click())}),this.$title.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$children=document.createElement(`div`),this.$children.classList.add(`children`),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(i),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add(`root`),s&&this.domElement.classList.add(`allow-touch-styles`),!Pt&&o&&(Nt(Mt),Pt=!0),n?n.appendChild(this.domElement):t&&(this.domElement.classList.add(`autoPlace`),document.body.appendChild(this.domElement)),r&&this.domElement.style.setProperty(`--width`,r+`px`),this._closeFolders=a}add(e,t,n,r,i){if(Object(n)===n)return new At(this,e,t,n);let a=e[t];switch(typeof a){case`number`:return new kt(this,e,t,n,r,i);case`boolean`:return new Ct(this,e,t);case`string`:return new jt(this,e,t);case`function`:return new Q(this,e,t)}console.error(`gui.add failed
	property:`,t,`
	object:`,e,`
	value:`,a)}addColor(e,t,n=1){return new Ot(this,e,t,n)}addFolder(t){let n=new e({parent:this,title:t});return this.root._closeFolders&&n.close(),n}load(e,t=!0){return e.controllers&&this.controllers.forEach(t=>{t instanceof Q||t._name in e.controllers&&t.load(e.controllers[t._name])}),t&&e.folders&&this.folders.forEach(t=>{t._title in e.folders&&t.load(e.folders[t._title])}),this}save(e=!0){let t={controllers:{},folders:{}};return this.controllers.forEach(e=>{if(!(e instanceof Q)){if(e._name in t.controllers)throw Error(`Cannot save GUI with duplicate property "${e._name}"`);t.controllers[e._name]=e.save()}}),e&&this.folders.forEach(e=>{if(e._title in t.folders)throw Error(`Cannot save GUI with duplicate folder "${e._title}"`);t.folders[e._title]=e.save()}),t}open(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),this.domElement.classList.toggle(`closed`,this._closed),this}close(){return this.open(!1)}_setClosed(e){this._closed!==e&&(this._closed=e,this._callOnOpenClose(this))}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}openAnimated(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),requestAnimationFrame(()=>{let t=this.$children.clientHeight;this.$children.style.height=t+`px`,this.domElement.classList.add(`transition`);let n=e=>{e.target===this.$children&&(this.$children.style.height=``,this.domElement.classList.remove(`transition`),this.$children.removeEventListener(`transitionend`,n))};this.$children.addEventListener(`transitionend`,n);let r=e?this.$children.scrollHeight:0;this.domElement.classList.toggle(`closed`,!e),requestAnimationFrame(()=>{this.$children.style.height=r+`px`})}),this}title(e){return this._title=e,this.$title.textContent=e,this}reset(e=!0){return(e?this.controllersRecursive():this.controllers).forEach(e=>e.reset()),this}onChange(e){return this._onChange=e,this}_callOnChange(e){this.parent&&this.parent._callOnChange(e),this._onChange!==void 0&&this._onChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(e){this.parent&&this.parent._callOnFinishChange(e),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onOpenClose(e){return this._onOpenClose=e,this}_callOnOpenClose(e){this.parent&&this.parent._callOnOpenClose(e),this._onOpenClose!==void 0&&this._onOpenClose.call(this,e)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(e=>e.destroy())}controllersRecursive(){let e=Array.from(this.controllers);return this.folders.forEach(t=>{e=e.concat(t.controllersRecursive())}),e}foldersRecursive(){let e=Array.from(this.folders);return this.folders.forEach(t=>{e=e.concat(t.foldersRecursive())}),e}},It=c(o(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?t.exports=r():typeof define==`function`&&define.amd?define(r):n.Stats=r()})(e,function(){var e=function(){function t(e){return i.appendChild(e.dom),e}function n(e){for(var t=0;t<i.children.length;t++)i.children[t].style.display=t===e?`block`:`none`;r=e}var r=0,i=document.createElement(`div`);i.style.cssText=`position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000`,i.addEventListener(`click`,function(e){e.preventDefault(),n(++r%i.children.length)},!1);var a=(performance||Date).now(),o=a,s=0,c=t(new e.Panel(`FPS`,`#0ff`,`#002`)),l=t(new e.Panel(`MS`,`#0f0`,`#020`));if(self.performance&&self.performance.memory)var u=t(new e.Panel(`MB`,`#f08`,`#201`));return n(0),{REVISION:16,dom:i,addPanel:t,showPanel:n,begin:function(){a=(performance||Date).now()},end:function(){s++;var e=(performance||Date).now();if(l.update(e-a,200),e>o+1e3&&(c.update(1e3*s/(e-o),100),o=e,s=0,u)){var t=performance.memory;u.update(t.usedJSHeapSize/1048576,t.jsHeapSizeLimit/1048576)}return e},update:function(){a=this.end()},domElement:i,setMode:n}};return e.Panel=function(e,t,n){var r=1/0,i=0,a=Math.round,o=a(window.devicePixelRatio||1),s=80*o,c=48*o,l=3*o,u=2*o,d=3*o,f=15*o,p=74*o,m=30*o,h=document.createElement(`canvas`);h.width=s,h.height=c,h.style.cssText=`width:80px;height:48px`;var g=h.getContext(`2d`);return g.font=`bold `+9*o+`px Helvetica,Arial,sans-serif`,g.textBaseline=`top`,g.fillStyle=n,g.fillRect(0,0,s,c),g.fillStyle=t,g.fillText(e,l,u),g.fillRect(d,f,p,m),g.fillStyle=n,g.globalAlpha=.9,g.fillRect(d,f,p,m),{dom:h,update:function(c,_){r=Math.min(r,c),i=Math.max(i,c),g.fillStyle=n,g.globalAlpha=1,g.fillRect(0,0,s,f),g.fillStyle=t,g.fillText(a(c)+` `+e+` (`+a(r)+`-`+a(i)+`)`,l,u),g.drawImage(h,d+o,f,p-o,m,d,f,p-o,m),g.fillRect(d+p-o,f,o,m),g.fillStyle=n,g.globalAlpha=.9,g.fillRect(d+p-o,f,o,a((1-c/_)*m))}}},e})}))(),1),Lt=`struct SceneUniforms {
  viewProj: mat4x4<f32>,
  lengthScale: f32,
  visGrid: f32,
  texSize: f32,
  volumeExtent: f32,
}

@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(0) @binding(1) var velocityTex: texture_3d<f32>;
@group(0) @binding(2) var densityTex: texture_3d<f32>;

struct VertexInput {
  @location(0) localPos: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
}

@vertex
fn vs_main(input: VertexInput, @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
  let visGrid = u32(scene.visGrid);
  let cellCount = visGrid * visGrid * visGrid;

  var output: VertexOutput;
  if (instanceIndex >= cellCount) {
    output.position = vec4<f32>(0.0, 0.0, -2.0, 1.0);
    output.color = vec3<f32>(0.0);
    return output;
  }

  let iz = instanceIndex / (visGrid * visGrid);
  let rem = instanceIndex % (visGrid * visGrid);
  let iy = rem / visGrid;
  let ix = rem % visGrid;

  let cell = vec3<f32>(f32(ix), f32(iy), f32(iz));
  let uvw = (cell + 0.5) / scene.visGrid;
  let center = (uvw - 0.5) * scene.volumeExtent;

  let coord = vec3<i32>((uvw - 0.5) * scene.texSize + scene.texSize * 0.5);
  let vel = textureLoad(velocityTex, coord, 0).xyz;
  let dens = textureLoad(densityTex, coord, 0).x;

  var direction = vel;
  let speed = length(direction);
  if (speed > 0.0001) {
    direction = direction / speed;
  } else {
    direction = vec3<f32>(0.0, 1.0, 0.0);
  }

  // Scale arrow by velocity magnitude (primary) and density (dye visibility).
  var arrowLen = max(speed * scene.lengthScale, dens * scene.lengthScale * 0.25);
  arrowLen = max(arrowLen, 0.002);
  let worldPos = center + input.localPos.y * direction * arrowLen;
  output.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  // Green channel highlights upward (+Y) flow.
  output.color = abs(direction) * 0.7 + vec3<f32>(0.08);
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(input.color, 1.0);
}
`,$=q.create({viewProj:`mat4x4f`,lengthScale:`f32`,visGrid:`f32`,texSize:`f32`,volumeExtent:`f32`}),Rt=class{instanceCount;mesh;device;segmentBuffer;sceneUniformBuffer;lineDraw;bindGroupLayout;pipelineLayout;constructor(e,t={}){this.device=e;let n=t.visGrid??16,r=t.texSize??32,i=t.volumeExtent??2,a=t.lengthScale??.35;this.instanceCount=n*n*n;let o=new Float32Array([0,0,0,0,1,0]);this.segmentBuffer=G.fromData(e,o,W.vertex,`arrow-segment`),this.mesh=new Ie(2).addVertexBuffer({buffer:this.segmentBuffer,arrayStride:12,attributes:[{shaderLocation:0,format:`float32x3`,offset:0}],slot:0,stepMode:`vertex`}),this.sceneUniformBuffer=G.create(e,G.uniformSize($.byteSize),W.uniform,`arrow-scene-uniforms`);let s=GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT;this.bindGroupLayout=e.gpu.createBindGroupLayout({label:`ArrowFieldBindGroupLayout`,entries:[{binding:0,visibility:s,buffer:{type:`uniform`}},{binding:1,visibility:s,texture:{sampleType:`unfilterable-float`,viewDimension:`3d`}},{binding:2,visibility:s,texture:{sampleType:`unfilterable-float`,viewDimension:`3d`}}]}),this.pipelineLayout=e.gpu.createPipelineLayout({label:`ArrowFieldPipelineLayout`,bindGroupLayouts:[this.bindGroupLayout]}),this.lineDraw=new Fe(e,Lt,{label:`ArrowField`,layout:this.pipelineLayout,vertexBuffers:this.mesh.getVertexLayouts(),primitive:{topology:`line-list`,cullMode:`none`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!0,depthCompare:`less`}}),$.set(`viewProj`,new Float32Array(16)).set(`lengthScale`,a).set(`visGrid`,n).set(`texSize`,r).set(`volumeExtent`,i).writeToBuffer(this.sceneUniformBuffer,e)}setViewProjection(e){$.set(`viewProj`,e).writeToBuffer(this.sceneUniformBuffer,this.device)}setLengthScale(e){$.set(`lengthScale`,e).writeToBuffer(this.sceneUniformBuffer,this.device)}draw(e,t,n,r){$.set(`viewProj`,r).writeToBuffer(this.sceneUniformBuffer,this.device);let i=K.create(this.device,this.bindGroupLayout,[{binding:0,resource:this.sceneUniformBuffer},{binding:1,resource:t.view},{binding:2,resource:n.view}],`arrow-field-bind-group`);this.lineDraw.draw(e,this.mesh,i,this.instanceCount)}destroy(){this.segmentBuffer.destroy(),this.sceneUniformBuffer.destroy()}},zt=64,Bt=32,Vt=1,Ht=Vt*2;async function Ut(){await qe();let e=document.createElement(`canvas`);e.style.cssText=`display:block;width:100vw;height:100vh;`,document.body.appendChild(e);let t=await we.create(e),n=new yt(t,{TEXTURE_SIZE:zt,DENSITY_DISSIPATION:.95,VELOCITY_DISSIPATION:.98,PRESSURE_DISSIPATION:.95,PRESSURE_ITERATIONS:24,CURL:6,ADVECTION_SCALE:16},Vt),r=new Rt(t,{visGrid:Bt,texSize:zt,volumeExtent:Ht,lengthScale:.5}),i=new St(t,{texSize:zt,volumeExtent:Ht}),a=new Ce(Math.PI/180*55,1,.1,100),o=new me(a,{listenerTarget:e,center:[0,0,0],radius:3.5}),s=new He(t,{length:1.2}),c=G.create(t,G.uniformSize(Ce.uniformByteSize()),W.uniform,`axis-uniforms`),l=new Float32Array(Ce.uniformFloatCount),u=K.create(t,s.getBindGroupLayout(0),c,0,`axis-bind-group`),d=new It.default;d.showPanel(0),document.body.appendChild(d.dom);let f=new ve(Ge.sphere({radius:Ht*.5,segments:24}),a,[e.width,e.height],{listenerTarget:e}),p=!0,m=Ye();f.addEventListener(`onHit`,(e=>{let t=e.detail.hit;if(p){Qe(m,t),p=!1;return}let n=Ye();tt(n,t,m);let r=Ze(n);if(r>.001&&r<1){let e=Xe(n);et(e,e)}Qe(m,t)}));let h={strength:520,radius:.22,swirlStrength:.9,swirlRadius:.35,updraft:.55,forceCount:8,advectionScale:16,lengthScale:.1,curl:n.settings.CURL,show3DGrid:!1,showVelocity:!0,showDensity:!0,densityGain:6,velocityThreshold:1.2,densityDissipation:n.settings.DENSITY_DISSIPATION,velocityDissipation:n.settings.VELOCITY_DISSIPATION,pressureIterations:n.settings.PRESSURE_ITERATIONS},g=new Ft({title:`Fluid Sim 3D`});g.add(h,`strength`,10,1200).name(`Force strength`),g.add(h,`radius`,.04,.4).name(`Force radius`),g.add(h,`swirlStrength`,0,2,.01).name(`Swirl strength`),g.add(h,`swirlRadius`,.04,.45,.01).name(`Swirl radius`),g.add(h,`updraft`,0,2,.01).name(`Updraft`),g.add(h,`forceCount`,1,16,1).name(`Force count`),g.add(h,`advectionScale`,1,64,1).name(`Advection scale`).onChange(e=>{n.settings.ADVECTION_SCALE=e}),g.add(h,`lengthScale`,.05,1).name(`Arrow length`),g.add(h,`show3DGrid`).name(`Show 3D grid`),g.add(h,`showVelocity`).name(`Show velocity`),g.add(h,`showDensity`).name(`Show density`),g.add(h,`densityGain`,.5,30,.1).name(`Density gain`),g.add(h,`velocityThreshold`,.01,2,.01).name(`Velocity threshold`),g.add(h,`curl`,0,20,1).name(`Curl (vorticity)`).onChange(e=>{n.settings.CURL=e}),g.add(h,`densityDissipation`,.9,1,.001).name(`Density decay`).onChange(e=>{n.settings.DENSITY_DISSIPATION=e}),g.add(h,`velocityDissipation`,.9,1,.001).name(`Velocity decay`).onChange(e=>{n.settings.VELOCITY_DISSIPATION=e}),g.add(h,`pressureIterations`,1,40,1).name(`Pressure iters`).onChange(e=>{n.settings.PRESSURE_ITERATIONS=e}),window.addEventListener(`beforeunload`,()=>{f.disconnect(),o.destroy(),s.destroy(),r.destroy(),i.destroy(),n.destroy(),c.destroy(),g.destroy()});let _=null,v=0,y=0,b=performance.now(),x=()=>{e.width===v&&e.height===y||(v=e.width,y=e.height,v>0&&y>0&&(a.setAspect(v/y),f.resolution=[v,y]))},S=()=>{let n=e.width,r=e.height;return _&&_.width===n&&_.height===r?_.createView():(_?.destroy(),_=t.gpu.createTexture({label:`depth-texture`,size:[n,r],format:`depth24plus`,usage:GPUTextureUsage.RENDER_ATTACHMENT}),_.createView())},C=e=>{if(n.addForce([0,0,0],[0,1,0],h.radius,h.strength*h.updraft,1.5,.25),h.swirlStrength<=0)return;let t=Math.max(1,Math.floor(h.forceCount)),r=e*.65;for(let e=0;e<t;e++){let i=r+e/t*Math.PI*2,a=Math.cos(i),o=Math.sin(i),s=[a*h.swirlRadius,0,o*h.swirlRadius],c=[-o*h.swirlStrength,h.updraft,a*h.swirlStrength],l=Math.hypot(c[0],c[1],c[2]);n.addForce(s,[c[0]/l,c[1]/l,c[2]/l],h.radius,h.strength/t,.35,.35)}},w=()=>{d.begin(),t.resize(),x();let e=performance.now(),o=Math.min((e-b)*.001,.1);b=e;let f=t.getCurrentTexture().createView(),p=S(),m=t.gpu.createCommandEncoder({label:`fluid-sim-3d-frame`});C(e*.001),n.update(m,o);let g=Pe(m,f,{clearColor:{r:.04,g:.04,b:.07,a:1},depthStencilAttachment:{view:p,depthLoadOp:`clear`,depthClearValue:1,depthStoreOp:`store`}}),_=a.getViewProjectionMatrix();(h.showVelocity||h.showDensity)&&i.draw(g,n.velocity,n.density,_,{showVelocity:h.showVelocity,showDensity:h.showDensity,densityGain:h.densityGain,velocityThreshold:h.velocityThreshold}),h.show3DGrid&&(r.setLengthScale(h.lengthScale),r.draw(g,n.velocity,n.density,_)),a.writeUniformData(l),c.write(t,l),s.draw(g,u),g.end(),t.gpu.queue.submit([m.finish()]),d.end(),requestAnimationFrame(w)};w()}Ut().catch(e=>{console.error(e)});