var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var l=window.requestAnimationFrame,u=60,d=1,f=0,p=0,m=0,h=0,g=0,_=new Map,v=[],y=new Set,b=[],x=[],S=!1,C=0;function w(e){return _.delete(e)}function T(e){if(e<=0||!Number.isFinite(e))throw Error(`Frame rate must be a positive number`);u=e,l=e=>{requestAnimationFrame((t=>{let n=1e3/u,r=t-m;r>=n?e(t):setTimeout((()=>l(e)),n-r)}))}}function E(e=!1){if(S&&!e)return;let t,n=0;for(let[e,t]of _)t?.func(t.args);for(;b.length>0;)t=b.pop(),t.func(t.args);for(n=0;n<v.length;n++)t=v[n],f-t.time>t.delay/d&&(t.func(t.args),t.repeat?t.time=f:(v.splice(n,1),n--));let r=performance.now();for(;y.length>0;){if(t=y.shift(),!(performance.now()-r<1e3/u*d)){y.unshift(t);break}t.func(t.args)}}function D(e){m=f,e===void 0?(g+=1e3/u*d,f=g):(S||(h===0&&(h=e),g+=e-h,h=e),f=g),p=f-m,b=b.concat(x),x=[]}f=performance.now(),function e(t){E(),D(t),l(e)}(f);var O={addEF:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for enterframe task.`);let n=++C;return _.set(n,{func:e,args:t}),{id:n,cancel:()=>{w(n)}}},removeEF:w,delay:function(e,t,n,r=!1){if(typeof e!=`function`)throw Error(`Invalid function provided for delayed task.`);let i=++C,a={id:i,func:e,args:n,delay:t,time:f,repeat:r,cancelled:!1};return v.push(a),{cancel:()=>{let e=v.findIndex((e=>e.id===i));e!==-1&&v.splice(e,1)}}},next:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for next frame task.`);x.push({func:e,args:t})},defer:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for deferred task.`);y.add({func:e,args:t})},getTime:function(){return f/1e3},getDeltaTime:function(){return p},setFrameRate:T,setTimeScale:function(e){if(e<0||!Number.isFinite(e))throw Error(`Time scale must be a non-negative number`);d=e,T(u*d)},getTimeScale:function(){return d},setEnterframeFunc:function(e){l=e},step:function(){E(!0),D()},pause:function(){S=!0,h=0},resume:function(){S=!1},isPaused:function(){return S},removeAllTasks:function(){_.clear(),v.length=0,y.clear(),b.length=0,x.length=0,g=0,f=0}},k=Object.defineProperty,A=(e,t,n)=>t in e?k(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,j=(e,t,n)=>A(e,typeof t==`symbol`?t:t+``,n),M=1e-6,N=typeof Float32Array<`u`?Float32Array:Array;function P(){var e=new N(16);return N!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function ee(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function F(e,t){var n=t[0],r=t[1],i=t[2],a=t[3],o=t[4],s=t[5],c=t[6],l=t[7],u=t[8],d=t[9],f=t[10],p=t[11],m=t[12],h=t[13],g=t[14],_=t[15],v=n*s-r*o,y=n*c-i*o,b=n*l-a*o,x=r*c-i*s,S=r*l-a*s,C=i*l-a*c,w=u*h-d*m,T=u*g-f*m,E=u*_-p*m,D=d*g-f*h,O=d*_-p*h,k=f*_-p*g,A=v*k-y*O+b*D+x*E-S*T+C*w;return A?(A=1/A,e[0]=(s*k-c*O+l*D)*A,e[1]=(i*O-r*k-a*D)*A,e[2]=(h*C-g*S+_*x)*A,e[3]=(f*S-d*C-p*x)*A,e[4]=(c*E-o*k-l*T)*A,e[5]=(n*k-i*E+a*T)*A,e[6]=(g*b-m*C-_*y)*A,e[7]=(u*C-f*b+p*y)*A,e[8]=(o*O-s*E+l*w)*A,e[9]=(r*E-n*O-a*w)*A,e[10]=(m*S-h*b+_*v)*A,e[11]=(d*b-u*S-p*v)*A,e[12]=(s*T-o*D-c*w)*A,e[13]=(n*D-r*T+i*w)*A,e[14]=(h*y-m*x-g*v)*A,e[15]=(u*x-d*y+f*v)*A,e):null}function I(e,t,n){var r=t[0],i=t[1],a=t[2],o=t[3],s=t[4],c=t[5],l=t[6],u=t[7],d=t[8],f=t[9],p=t[10],m=t[11],h=t[12],g=t[13],_=t[14],v=t[15],y=n[0],b=n[1],x=n[2],S=n[3];return e[0]=y*r+b*s+x*d+S*h,e[1]=y*i+b*c+x*f+S*g,e[2]=y*a+b*l+x*p+S*_,e[3]=y*o+b*u+x*m+S*v,y=n[4],b=n[5],x=n[6],S=n[7],e[4]=y*r+b*s+x*d+S*h,e[5]=y*i+b*c+x*f+S*g,e[6]=y*a+b*l+x*p+S*_,e[7]=y*o+b*u+x*m+S*v,y=n[8],b=n[9],x=n[10],S=n[11],e[8]=y*r+b*s+x*d+S*h,e[9]=y*i+b*c+x*f+S*g,e[10]=y*a+b*l+x*p+S*_,e[11]=y*o+b*u+x*m+S*v,y=n[12],b=n[13],x=n[14],S=n[15],e[12]=y*r+b*s+x*d+S*h,e[13]=y*i+b*c+x*f+S*g,e[14]=y*a+b*l+x*p+S*_,e[15]=y*o+b*u+x*m+S*v,e}function L(e,t,n,r,i){var a=1/Math.tan(t/2);if(e[0]=a/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i!=null&&i!==1/0){var o=1/(r-i);e[10]=i*o,e[14]=i*r*o}else e[10]=-1,e[14]=-r;return e}function R(e,t,n,r,i,a,o){var s=1/(t-n),c=1/(r-i),l=1/(a-o);return e[0]=-2*s,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=-2*c,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=l,e[11]=0,e[12]=(t+n)*s,e[13]=(i+r)*c,e[14]=a*l,e[15]=1,e}function te(e,t,n,r){var i,a,o,s,c,l,u,d,f,p,m=t[0],h=t[1],g=t[2],_=r[0],v=r[1],y=r[2],b=n[0],x=n[1],S=n[2];return Math.abs(m-b)<M&&Math.abs(h-x)<M&&Math.abs(g-S)<M?ee(e):(u=m-b,d=h-x,f=g-S,p=1/Math.sqrt(u*u+d*d+f*f),u*=p,d*=p,f*=p,i=v*f-y*d,a=y*u-_*f,o=_*d-v*u,p=Math.sqrt(i*i+a*a+o*o),p?(p=1/p,i*=p,a*=p,o*=p):(i=0,a=0,o=0),s=d*o-f*a,c=f*i-u*o,l=u*a-d*i,p=Math.sqrt(s*s+c*c+l*l),p?(p=1/p,s*=p,c*=p,l*=p):(s=0,c=0,l=0),e[0]=i,e[1]=s,e[2]=u,e[3]=0,e[4]=a,e[5]=c,e[6]=d,e[7]=0,e[8]=o,e[9]=l,e[10]=f,e[11]=0,e[12]=-(i*m+a*h+o*g),e[13]=-(s*m+c*h+l*g),e[14]=-(u*m+d*h+f*g),e[15]=1,e)}function z(){var e=new N(3);return N!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function B(e){var t=new N(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function V(e,t,n){var r=new N(3);return r[0]=e,r[1]=t,r[2]=n,r}function H(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function U(e,t,n,r){return e[0]=t,e[1]=n,e[2]=r,e}function ne(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e}function re(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e}function ie(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e}function ae(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+r*r+i*i)}function W(e,t){var n=t[0],r=t[1],i=t[2],a=n*n+r*r+i*i;return a>0&&(a=1/Math.sqrt(a)),e[0]=t[0]*a,e[1]=t[1]*a,e[2]=t[2]*a,e}function G(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function K(e,t,n){var r=t[0],i=t[1],a=t[2],o=n[0],s=n[1],c=n[2];return e[0]=i*c-a*s,e[1]=a*o-r*c,e[2]=r*s-i*o,e}function oe(e,t,n){var r=t[0],i=t[1],a=t[2],o=n[3]*r+n[7]*i+n[11]*a+n[15];return o||=1,e[0]=(n[0]*r+n[4]*i+n[8]*a+n[12])/o,e[1]=(n[1]*r+n[5]*i+n[9]*a+n[13])/o,e[2]=(n[2]*r+n[6]*i+n[10]*a+n[14])/o,e}var q=re;(function(){var e=z();return function(t,n,r,i,a,o){var s,c;for(n||=3,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2];return t}})();var se=class{constructor(e,t=.1){j(this,`easing`),j(this,`_value`),j(this,`_targetValue`),j(this,`_min`),j(this,`_max`),j(this,`_efIndex`),this.easing=t,this._value=e,this._targetValue=e,this._efIndex=O.addEF(()=>this._update())}_update(){this._checkLimit(),this._value+=(this._targetValue-this._value)*this.easing,Math.abs(this._targetValue-this._value)<1e-4&&(this._value=this._targetValue)}setTo(e){this._targetValue=this._value=e,this._checkLimit(),this._value=this._targetValue}add(e){this._targetValue+=e,this._checkLimit()}limit(e,t){if(e>t){this.limit(t,e);return}this._min=e,this._max=t,this._checkLimit()}_checkLimit(){this._min!==void 0&&this._targetValue<this._min&&(this._targetValue=this._min),this._max!==void 0&&this._targetValue>this._max&&(this._targetValue=this._max)}destroy(){O.removeEF(this._efIndex)}set value(e){this._targetValue=e}get value(){return this._value}get targetValue(){return this._targetValue}};function J(e,t){return`touches`in e&&e.touches.length>0?(t.x=e.touches[0].pageX,t.y=e.touches[0].pageY):`clientX`in e&&(t.x=e.clientX,t.y=e.clientY),t}function ce(e){let t=e.deltaY;switch(e.deltaMode){case WheelEvent.DOM_DELTA_LINE:t*=16;break;case WheelEvent.DOM_DELTA_PAGE:t*=100;break}return-t/120}var le=class{constructor(e,t={}){j(this,`radius`),j(this,`position`,z()),j(this,`positionOffset`,z()),j(this,`center`),j(this,`sensitivity`,1),j(this,`zoomSpeed`,1),j(this,`panSpeed`,.01),j(this,`_camera`),j(this,`_listenerTarget`),j(this,`_up`),j(this,`_rx`),j(this,`_ry`),j(this,`_mouse`,{x:0,y:0}),j(this,`_preMouse`,{x:0,y:0}),j(this,`_panCenterStart`,z()),j(this,`_eye`,z()),j(this,`_forward`,z()),j(this,`_right`,z()),j(this,`_camUp`,z()),j(this,`_efIndex`),j(this,`_preRX`,0),j(this,`_preRY`,0),j(this,`_isLockZoom`,!1),j(this,`_isLockRotation`,!1),j(this,`_isLockPan`,!1),j(this,`_isInvert`,!1),j(this,`_isMouseDown`,!1),j(this,`_isPanning`,!1),j(this,`_destroyed`,!1),j(this,`_wheelBind`),j(this,`_downBind`),j(this,`_moveBind`),j(this,`_upBind`),this._camera=e,this._listenerTarget=t.listenerTarget??document.body,this.center=t.center?V(t.center[0],t.center[1],t.center[2]):z(),this._up=t.up?V(t.up[0],t.up[1],t.up[2]):V(0,1,0),this.sensitivity=t.sensitivity??1,this.zoomSpeed=t.zoomSpeed??1,this.panSpeed=t.panSpeed??.01;let n=t.radius??10;this.radius=new se(n),this.position[2]=this.radius.value,this._rx=new se(0),this._rx.limit(-Math.PI/2,Math.PI/2),this._ry=new se(0),this._wheelBind=e=>this._onWheel(e),this._downBind=e=>this._onDown(e),this._moveBind=e=>this._onMove(e),this._upBind=()=>this._onUp(),this.connect(),this._efIndex=O.addEF(()=>this._loop())}connect(){this.disconnect(),this._listenerTarget.addEventListener(`wheel`,this._wheelBind,{passive:!1}),this._listenerTarget.addEventListener(`mousedown`,this._downBind),this._listenerTarget.addEventListener(`touchstart`,this._downBind,{passive:!1}),this._listenerTarget.addEventListener(`mousemove`,this._moveBind),this._listenerTarget.addEventListener(`touchmove`,this._moveBind,{passive:!1}),window.addEventListener(`touchend`,this._upBind),window.addEventListener(`mouseup`,this._upBind)}disconnect(){this._listenerTarget.removeEventListener(`wheel`,this._wheelBind),this._listenerTarget.removeEventListener(`mousedown`,this._downBind),this._listenerTarget.removeEventListener(`touchstart`,this._downBind),this._listenerTarget.removeEventListener(`mousemove`,this._moveBind),this._listenerTarget.removeEventListener(`touchmove`,this._moveBind),window.removeEventListener(`touchend`,this._upBind),window.removeEventListener(`mouseup`,this._upBind)}destroy(){this._destroyed||(this._destroyed=!0,this.disconnect(),O.removeEF(this._efIndex),this.radius.destroy(),this._rx.destroy(),this._ry.destroy())}lock(e=!0){this._isLockZoom=e,this._isLockRotation=e,this._isLockPan=e,this._isMouseDown=!1,this._isPanning=!1}lockZoom(e=!0){this._isLockZoom=e}lockRotation(e=!0){this._isLockRotation=e}lockPan(e=!0){this._isLockPan=e}inverseControl(e=!0){this._isInvert=e}update(){this._updatePosition()}get rx(){return this._rx}get ry(){return this._ry}_loop(){this._destroyed||(this._updatePosition(),this._updateCamera())}_updatePosition(){let e=this._rx.value,t=this._ry.value,n=this.radius.value;this.position[1]=Math.sin(e)*n;let r=Math.cos(e)*n;this.position[0]=Math.cos(t+Math.PI*.5)*r,this.position[2]=Math.sin(t+Math.PI*.5)*r,this.position[0]+=this.positionOffset[0],this.position[1]+=this.positionOffset[1],this.position[2]+=this.positionOffset[2]}_updateCamera(){this._camera.lookAt(this.position,this.center,this._up)}_isPanInput(e){return`button`in e?e.button===1||e.button===0&&e.shiftKey:!1}_panByPixels(e,t){this._updatePosition(),U(this._eye,this.position[0],this.position[1],this.position[2]),q(this._forward,this.center,this._eye),W(this._forward,this._forward),K(this._right,this._forward,this._up),W(this._right,this._right),K(this._camUp,this._right,this._forward),W(this._camUp,this._camUp);let n=this.panSpeed*this.sensitivity;this.center[0]=this._panCenterStart[0]-this._right[0]*e*n+this._camUp[0]*t*n,this.center[1]=this._panCenterStart[1]-this._right[1]*e*n+this._camUp[1]*t*n,this.center[2]=this._panCenterStart[2]-this._right[2]*e*n+this._camUp[2]*t*n}_onDown(e){if(J(e,this._mouse),J(e,this._preMouse),this._isPanInput(e)&&!this._isLockPan){this._isPanning=!0,this._isMouseDown=!1,this._panCenterStart[0]=this.center[0],this._panCenterStart[1]=this.center[1],this._panCenterStart[2]=this.center[2];return}this._isLockRotation||(this._isPanning=!1,this._isMouseDown=!0,this._preRX=this._rx.targetValue,this._preRY=this._ry.targetValue)}_onMove(e){if(J(e,this._mouse),`touches`in e&&e.preventDefault(),this._isPanning){if(this._isLockPan)return;let e=this._mouse.x-this._preMouse.x,t=this._mouse.y-this._preMouse.y;this._panByPixels(e,t);return}if(this._isLockRotation||!this._isMouseDown)return;let t=-(this._mouse.x-this._preMouse.x);this._isInvert&&(t*=-1),this._ry.value=this._preRY-t*.01*this.sensitivity;let n=-(this._mouse.y-this._preMouse.y);this._isInvert&&(n*=-1),this._rx.value=this._preRX-n*.01*this.sensitivity}_onUp(){this._isMouseDown=!1,this._isPanning=!1}_onWheel(e){if(this._isLockZoom)return;e.preventDefault();let t=ce(e)*this.zoomSpeed;this.radius.add(-t*2),this.radius.targetValue<0&&this.radius.setTo(1e-4)}},ue=class{constructor(e,t){j(this,`origin`),j(this,`direction`),j(this,`_target`,z()),j(this,`_edge1`,z()),j(this,`_edge2`,z()),j(this,`_normal`,z()),j(this,`_diff`,z()),j(this,`_a`,z()),j(this,`_b`,z()),j(this,`_c`,z()),this.origin=B(e),this.direction=B(t)}set(e,t){return H(this.origin,e),H(this.direction,t),this}at(e,t){let n=t??this._target;return H(n,this.direction),ie(n,n,e),ne(n,n,this.origin),n}intersectTriangle(e,t,n,r=!0){H(this._a,e),H(this._b,t),H(this._c,n),q(this._edge1,this._b,this._a),q(this._edge2,this._c,this._a),K(this._normal,this._edge1,this._edge2);let i=G(this.direction,this._normal),a;if(i>0){if(r)return null;a=1}else if(i<0)a=-1,i=-i;else return null;q(this._diff,this.origin,this._a),K(this._edge2,this._diff,this._edge2);let o=a*G(this.direction,this._edge2);if(o<0)return null;K(this._edge1,this._edge1,this._diff);let s=a*G(this.direction,this._edge1);if(s<0||o+s>i)return null;let c=-a*G(this._diff,this._normal);if(c<0)return null;let l=c/i,u=z();return this.at(l,u),u}intersectSphere(e,t){let n=z();q(n,e,this.origin);let r=G(n,this.direction),i=G(n,n)-r*r,a=t*t;if(i>a)return null;let o=Math.sqrt(a-i),s=r-o,c=r+o;if(s<0&&c<0)return null;let l=z();return s<0?this.at(c,l):this.at(s,l),l}},de=V(0,1,0),fe=class e{constructor(){j(this,`viewMatrix`),j(this,`projectionMatrix`),j(this,`viewProjectionMatrix`),j(this,`position`,V(0,0,1)),j(this,`target`,V(0,0,0)),j(this,`up`,z()),this.viewMatrix=P(),this.projectionMatrix=P(),this.viewProjectionMatrix=P(),ee(this.projectionMatrix),this.lookAt(this.position,this.target)}static uniformByteSize(){return e.uniformFloatCount*4}lookAt(e,t,n=de){return U(this.position,e[0],e[1],e[2]),U(this.target,t[0],t[1],t[2]),U(this.up,n[0],n[1],n[2]),te(this.viewMatrix,this.position,this.target,this.up),this}getViewMatrix(){return this.viewMatrix}getProjectionMatrix(){return this.projectionMatrix}getViewProjectionMatrix(e){let t=e??this.viewProjectionMatrix;return I(t,this.projectionMatrix,this.viewMatrix),t}writeUniformData(t,n=0){if(t.length<n+e.uniformFloatCount)throw Error(`Camera uniform target is too small. Need at least ${n+e.uniformFloatCount} floats.`);this.getViewProjectionMatrix(this.viewProjectionMatrix),t.set(this.viewProjectionMatrix,n);let r=this.viewMatrix;return t[n+16]=r[0],t[n+17]=r[4],t[n+18]=r[8],t[n+19]=0,t[n+20]=r[1],t[n+21]=r[5],t[n+22]=r[9],t[n+23]=0,t}generateRay(e,t){let n=P(),r=z();return I(n,this.projectionMatrix,this.viewMatrix),F(n,n),oe(r,e,n),q(r,r,this.position),W(r,r),t?(t.set(this.position,r),t):new ue(this.position,r)}getPosition(){return B(this.position)}getLookAtTarget(){return B(this.target)}getFieldOfView(){}updateProjection(){}};j(fe,`uniformFloatCount`,24);var pe=fe,me=class extends pe{constructor(e,t,n,r){super(),j(this,`fov`,Math.PI/4),j(this,`aspect`,1),j(this,`near`,.1),j(this,`far`,100),this.setPerspective(e,t,n,r)}setPerspective(e,t,n,r){return this.fov=e,this.aspect=t,this.near=n,this.far=r,L(this.getProjectionMatrix(),e,t,n,r),this}setAspect(e){return this.aspect=e,this.updateProjection(),this}getFieldOfView(){return this.fov}getAspect(){return this.aspect}getNear(){return this.near}getFar(){return this.far}updateProjection(){this.setPerspective(this.fov,this.aspect,this.near,this.far)}},he=class extends pe{constructor(e,t,n,r,i=.1,a=100){super(),j(this,`left`,-1),j(this,`right`,1),j(this,`bottom`,-1),j(this,`top`,1),j(this,`near`,.1),j(this,`far`,100),this.setOrthographic(e,t,n,r,i,a)}setOrthographic(e,t,n,r,i=.1,a=100){return this.left=e,this.right=t,this.bottom=n,this.top=r,this.near=i,this.far=a,R(this.getProjectionMatrix(),e,t,n,r,i,a),this}getFieldOfView(){}updateProjection(){this.setOrthographic(this.left,this.right,this.bottom,this.top,this.near,this.far)}};function ge({camera:e,center:t,radius:n,eye:r,up:i=V(0,1,0),padding:a=0}){let o=ae(r,t),s=n*(1+a);return e.lookAt(r,t,i),e.setOrthographic(-s,s,-s,s,Math.max(.01,o-s),o+s),e}var _e=class e{constructor(e,t,n,r,i,a,o){j(this,`canvas`),j(this,`context`),j(this,`device`),j(this,`format`),j(this,`colorSpace`),j(this,`toneMappingMode`),j(this,`hdr`),this.canvas=e,this.context=t,this.device=n,this.format=r,this.colorSpace=i,this.toneMappingMode=a,this.hdr=o}get gpu(){return this.device}static async isSupported(){return navigator.gpu?await navigator.gpu.requestAdapter()!==null:!1}static async create(t,n={}){if(!navigator.gpu)throw Error(`WebGPU is not supported in this browser.`);let r=await navigator.gpu.requestAdapter({powerPreference:n.powerPreference});if(!r)throw Error(`Failed to request WebGPU adapter.`);let i=await r.requestDevice(),a=t.getContext(`webgpu`);if(!a)throw Error(`Failed to get WebGPU canvas context.`);let o=n.hdr??!1,s=n.colorSpace??`srgb`,c=n.toneMappingMode??(o?`extended`:`standard`),l=o?`rgba16float`:navigator.gpu.getPreferredCanvasFormat();return a.configure({device:i,format:l,alphaMode:n.alpha===!1?`opaque`:`premultiplied`,colorSpace:s,toneMapping:{mode:c}}),new e(t,a,i,l,s,c,o)}resize(e,t){let n=e??this.canvas.clientWidth,r=t??this.canvas.clientHeight;(this.canvas.width!==n||this.canvas.height!==r)&&(this.canvas.width=Math.max(1,n),this.canvas.height=Math.max(1,r))}getCurrentTexture(){return this.context.getCurrentTexture()}destroy(){this.device.destroy()}};function ve(e,t,n){return e.gpu.createShaderModule({code:t,label:n})}function ye(e,t){return e.gpu.createRenderPipeline(t)}function be(e,t){return e.gpu.createComputePipeline(t)}function xe(e,t,n,r=0){if(n instanceof ArrayBuffer){e.gpu.queue.writeBuffer(t,r,n);return}e.gpu.queue.writeBuffer(t,r,n.buffer,n.byteOffset,n.byteLength)}var Y={vertex:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,index:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,storage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,uniform:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,vertexStorage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST},X=class e{constructor(e,t,n,r){j(this,`gpu`),j(this,`size`),j(this,`usage`),j(this,`label`),this.gpu=e,this.size=t,this.usage=n,this.label=r}static uniformSize(e){return Math.ceil(e/16)*16}static create(t,n,r,i){return new e(t.gpu.createBuffer({size:n,usage:r,label:i}),n,r,i)}static fromData(t,n,r,i){let a=n.byteLength,o=e.create(t,a,r,i);return o.write(t,n),o}write(e,t,n=0){xe(e,this.gpu,t,n)}destroy(){this.gpu.destroy()}};function Se(e){return e instanceof X?{buffer:e.gpu}:e}var Z=class e{constructor(e){j(this,`gpu`),this.gpu=e}static create(t,n,r,i=0,a){if(r instanceof X){let o=typeof i==`number`?i:0,s=typeof i==`string`?i:a;return e.createFromEntries(t,n,[{binding:o,resource:r}],s)}let o=typeof i==`string`?i:a;return e.createFromEntries(t,n,r,o)}static createFromEntries(t,n,r,i){return new e(t.gpu.createBindGroup({label:i,layout:n,entries:r.map(({binding:e,resource:t})=>({binding:e,resource:Se(t)}))}))}bind(e,t=0){e.setBindGroup(t,this.gpu)}};function Ce(e,t,n={}){let{clearColor:r={r:.05,g:.05,b:.08,a:1},loadOp:i=`clear`,storeOp:a=`store`,depthStencilAttachment:o}=n,s=`colorView`in t?t.colorView:t,c=o??(`colorView`in t&&t.depthView?{view:t.depthView,depthLoadOp:`clear`,depthClearValue:1,depthStoreOp:`store`}:void 0);return e.beginRenderPass({colorAttachments:[{view:s,clearValue:r,loadOp:i,storeOp:a}],depthStencilAttachment:c})}var we=class e{constructor(e,t){j(this,`format`),j(this,`depthFormat`),j(this,`sampler`),j(this,`device`),j(this,`label`),j(this,`withDepth`),j(this,`depthTextureUsage`),j(this,`colorTexture`),j(this,`depthTextureInternal`,null),j(this,`colorViewInternal`),j(this,`depthViewInternal`),j(this,`widthInternal`),j(this,`heightInternal`),this.device=e,this.label=t.label??`RenderTarget`,this.format=t.format??(e.hdr?`rgba16float`:e.format),this.withDepth=t.withDepth??!1,this.depthTextureUsage=t.depthTextureUsage??GPUTextureUsage.RENDER_ATTACHMENT,this.depthFormat=this.withDepth?t.depthFormat??`depth24plus`:void 0,this.widthInternal=Math.max(1,Math.floor(t.width)),this.heightInternal=Math.max(1,Math.floor(t.height)),this.sampler=e.gpu.createSampler({label:`${this.label}Sampler`,addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`,magFilter:`linear`,minFilter:`linear`});let{colorTexture:n,colorView:r,depthTexture:i,depthView:a}=this.createTextures();this.colorTexture=n,this.colorViewInternal=r,this.depthTextureInternal=i,this.depthViewInternal=a}static create(t,n){return new e(t,n)}get width(){return this.widthInternal}get height(){return this.heightInternal}get colorView(){return this.colorViewInternal}get depthView(){return this.depthViewInternal}get depthTexture(){return this.depthTextureInternal??void 0}resize(e,t){var n;let r=Math.max(1,Math.floor(e)),i=Math.max(1,Math.floor(t));if(r===this.widthInternal&&i===this.heightInternal)return;this.widthInternal=r,this.heightInternal=i,this.colorTexture.destroy(),(n=this.depthTextureInternal)==null||n.destroy();let{colorTexture:a,colorView:o,depthTexture:s,depthView:c}=this.createTextures();this.colorTexture=a,this.colorViewInternal=o,this.depthTextureInternal=s,this.depthViewInternal=c}beginRenderPass(e,t={}){return Ce(e,this,t)}destroy(){var e;this.colorTexture.destroy(),(e=this.depthTextureInternal)==null||e.destroy()}createTextures(){let e=this.device.gpu.createTexture({label:`${this.label}ColorTexture`,size:[this.widthInternal,this.heightInternal],format:this.format,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),t=e.createView({label:`${this.label}ColorView`});if(!this.withDepth||!this.depthFormat)return{colorTexture:e,colorView:t,depthTexture:null,depthView:void 0};let n=this.device.gpu.createTexture({label:`${this.label}DepthTexture`,size:[this.widthInternal,this.heightInternal],format:this.depthFormat,usage:this.depthTextureUsage});return{colorTexture:e,colorView:t,depthTexture:n,depthView:n.createView({label:`${this.label}DepthView`})}}},Te=class{constructor(e,t,n={}){j(this,`pipeline`);let{label:r=`Draw`,layout:i=`auto`,primitive:a={topology:`triangle-list`},depthStencil:o,targets:s=[{format:e.format}],vertexBuffers:c=[]}=typeof n==`string`?{label:n}:n,l=ve(e,t,`${r}Shader`);this.pipeline=ye(e,{label:`${r}Pipeline`,layout:i,vertex:{module:l,entryPoint:`vs_main`,buffers:c},fragment:{module:l,entryPoint:`fs_main`,targets:s},primitive:a,depthStencil:o})}getBindGroupLayout(e=0){return this.pipeline.getBindGroupLayout(e)}draw(e,t,n,r=1){if(e.setPipeline(this.pipeline),n){let t=Array.isArray(n)?n:[n];for(let n=0;n<t.length;n++)t[n].bind(e,n)}typeof t==`number`?e.draw(t,r):(t.bind(e),t.hasIndexBuffer()?e.drawIndexed(t.getIndexCount(),r):e.draw(t.vertexCount,r))}},Ee=class{constructor(e,t,n={}){j(this,`drawInternal`);let r=typeof n==`string`?{label:n}:n,{label:i=`DepthDraw`,depthFormat:a=`depth32float`,depthCompare:o=`less`,depthWriteEnabled:s=!0,...c}=r,l=r.depthStencil??{format:a,depthWriteEnabled:s,depthCompare:o};this.drawInternal=new Te(e,t,{label:i,targets:[],depthStencil:l,...c})}getBindGroupLayout(e=0){return this.drawInternal.getBindGroupLayout(e)}draw(e,t,n,r=1){this.drawInternal.draw(e,t,n,r)}},De=class e{constructor(e,t={}){j(this,`texture`),j(this,`view`),j(this,`sampler`),j(this,`size`),j(this,`label`),j(this,`renderTarget`),this.label=t.label??`ShadowMap`;let n=1024,r=1024;if(typeof t.size==`number`?(n=t.size,r=t.size):Array.isArray(t.size)&&(n=t.size[0],r=t.size[1]),this.size=[n,r],this.renderTarget=we.create(e,{label:`${this.label}Target`,width:n,height:r,withDepth:!0,depthFormat:t.format??`depth32float`,depthTextureUsage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),!this.renderTarget.depthTexture||!this.renderTarget.depthView)throw Error(`Failed to create shadow map depth texture`);this.texture=this.renderTarget.depthTexture,this.view=this.renderTarget.depthView,this.sampler=e.gpu.createSampler({label:`${this.label}Sampler`,compare:`less`,magFilter:`linear`,minFilter:`linear`,addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`})}static create(t,n){return new e(t,n)}beginRenderPass(e,t={}){let n=t.depthStencilAttachment??{view:this.view,depthClearValue:1,depthLoadOp:`clear`,depthStoreOp:`store`};return e.beginRenderPass({label:`${this.label}Pass`,colorAttachments:[],depthStencilAttachment:n,...t})}destroy(){this.renderTarget.destroy()}},Oe=`
fn sampleShadowPcf3x3(
  shadowMap: texture_depth_2d,
  shadowSampler: sampler_comparison,
  shadowCoord: vec4<f32>,
  mapSize: f32,
  bias: f32,
) -> f32 {
  let projCoords = shadowCoord.xyz / shadowCoord.w;
  let shadowPos = vec3<f32>(
    projCoords.x * 0.5 + 0.5,
    -projCoords.y * 0.5 + 0.5,
    projCoords.z - bias
  );

  // Out of bounds check without branches affecting textureSampleCompareLevel
  let inBounds = (
    shadowPos.x >= 0.0 && shadowPos.x <= 1.0 &&
    shadowPos.y >= 0.0 && shadowPos.y <= 1.0 &&
    shadowPos.z <= 1.0
  );

  let texelSize = 1.0 / mapSize;
  var shadow: f32 = 0.0;

  for (var y: i32 = -1; y <= 1; y++) {
    for (var x: i32 = -1; x <= 1; x++) {
      let offset = vec2<f32>(f32(x), f32(y)) * texelSize;
      shadow += textureSampleCompareLevel(
        shadowMap,
        shadowSampler,
        shadowPos.xy + offset,
        shadowPos.z
      );
    }
  }

  shadow /= 9.0;
  
  return select(1.0, shadow, inBounds);
}
`,ke=class{constructor(e,t,n={}){j(this,`pipeline`);let{label:r=`Compute`,layout:i=`auto`,entryPoint:a=`cs_main`}=typeof n==`string`?{label:n}:n,o=ve(e,t,`${r}Shader`);this.pipeline=be(e,{label:`${r}Pipeline`,layout:i,compute:{module:o,entryPoint:a}})}getBindGroupLayout(e=0){return this.pipeline.getBindGroupLayout(e)}dispatch(e,t,n=1){if(e.setPipeline(this.pipeline),t){let n=Array.isArray(t)?t:[t];for(let t=0;t<n.length;t++)e.setBindGroup(t,n[t].gpu)}typeof n==`number`?e.dispatchWorkgroups(n):e.dispatchWorkgroups(n[0],n[1]??1,n[2]??1)}run(e,t,n=1,r){let i=e.beginComputePass(r?{label:r}:void 0);this.dispatch(i,t,n),i.end()}},Ae=class{constructor(e){if(j(this,`vertexCount`),j(this,`bindings`,[]),j(this,`indexBuffer`),j(this,`indexCount`,0),j(this,`indexFormat`,`uint16`),e<=0)throw Error(`Mesh vertexCount must be greater than 0.`);this.vertexCount=e}addVertexBuffer(e){let t=e.slot??this.nextFreeSlot();if(this.bindings.some(e=>e.slot===t))throw Error(`Vertex buffer slot ${t} is already in use.`);return this.bindings.push({...e,slot:t}),this}getVertexLayouts(){if(this.bindings.length===0)return[];let e=Math.max(...this.bindings.map(e=>e.slot)),t=Array.from({length:e+1},()=>null);for(let e of this.bindings)t[e.slot]={arrayStride:e.arrayStride,stepMode:e.stepMode??`vertex`,attributes:e.attributes.map(e=>({shaderLocation:e.shaderLocation,format:e.format,offset:e.offset}))};return t}bind(e){for(let t of this.bindings)e.setVertexBuffer(t.slot,t.buffer.gpu);this.indexBuffer&&e.setIndexBuffer(this.indexBuffer.gpu,this.indexFormat)}setIndexBuffer(e,t,n=`uint16`){if(t<=0)throw Error(`Mesh index count must be greater than 0.`);return this.indexBuffer=e,this.indexCount=t,this.indexFormat=n,this}setIndexBufferFromData(e,t,n=`mesh-indices`){let r=t instanceof Uint32Array?`uint32`:`uint16`,i=X.fromData(e,t,Y.index,n);return this.setIndexBuffer(i,t.length,r),i}hasIndexBuffer(){return this.indexBuffer!==void 0}getIndexCount(){return this.indexCount}nextFreeSlot(){let e=new Set(this.bindings.map(e=>e.slot)),t=0;for(;e.has(t);)t++;return t}};function je(e,t=`SceneUniformBindGroupLayout`){return e.gpu.createBindGroupLayout({label:t,entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}}]})}function Me(e,t=`SceneUniformPipelineLayout`){let n=je(e,`${t}BindGroup`);return{pipelineLayout:e.gpu.createPipelineLayout({label:t,bindGroupLayouts:[n]}),bindGroupLayout:n}}function Ne(e,t,n=1,r=`xy`){let i=[],a=[],o=e/n,s=t/n,c=1/n,l=-e*.5,u=-t*.5;function d(e,t,n,r,o,s){for(let r of[e,t,n])i.push(r[0],r[1],r[2]);for(let e of[r,o,s])a.push(e[0],e[1])}for(let e=0;e<n;e++)for(let t=0;t<n;t++){let i=o*e+l,a=s*t+u,f=e/n,p=t/n,m,h,g,_,v,y,b,x;r===`xz`?(m=[i,0,a+s],h=[i+o,0,a+s],g=[i+o,0,a],_=[i,0,a],v=[f,1-(p+c)],y=[f+c,1-(p+c)],b=[f+c,1-p],x=[f,1-p]):r===`yz`?(m=[0,a,i],h=[0,a,i+o],g=[0,a+s,i+o],_=[0,a+s,i],v=[f,p],y=[f+c,p],b=[f+c,p+c],x=[f,p+c]):(m=[i,a,0],h=[i+o,a,0],g=[i+o,a+s,0],_=[i,a+s,0],v=[f,p],y=[f+c,p],b=[f+c,p+c],x=[f,p+c]),d(m,h,g,v,y,b),d(m,g,_,v,b,x)}return{positions:new Float32Array(i),uvs:new Float32Array(a)}}function Pe(e=document.body){let t=document.createElement(`div`);t.style.cssText=`position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:2rem;font:16px/1.5 system-ui,sans-serif;background:#111;color:#eee;text-align:center;`,t.textContent=`WebGPU is not available in this browser. Try the latest Chrome, Edge, or Safari.`,e.appendChild(t)}async function Fe(){if(!await _e.isSupported())throw Pe(),Error(`WebGPU is not supported.`)}var Ie=c(o(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?t.exports=r():typeof define==`function`&&define.amd?define(r):n.Stats=r()})(e,function(){var e=function(){function t(e){return i.appendChild(e.dom),e}function n(e){for(var t=0;t<i.children.length;t++)i.children[t].style.display=t===e?`block`:`none`;r=e}var r=0,i=document.createElement(`div`);i.style.cssText=`position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000`,i.addEventListener(`click`,function(e){e.preventDefault(),n(++r%i.children.length)},!1);var a=(performance||Date).now(),o=a,s=0,c=t(new e.Panel(`FPS`,`#0ff`,`#002`)),l=t(new e.Panel(`MS`,`#0f0`,`#020`));if(self.performance&&self.performance.memory)var u=t(new e.Panel(`MB`,`#f08`,`#201`));return n(0),{REVISION:16,dom:i,addPanel:t,showPanel:n,begin:function(){a=(performance||Date).now()},end:function(){s++;var e=(performance||Date).now();if(l.update(e-a,200),e>o+1e3&&(c.update(1e3*s/(e-o),100),o=e,s=0,u)){var t=performance.memory;u.update(t.usedJSHeapSize/1048576,t.jsHeapSizeLimit/1048576)}return e},update:function(){a=this.end()},domElement:i,setMode:n}};return e.Panel=function(e,t,n){var r=1/0,i=0,a=Math.round,o=a(window.devicePixelRatio||1),s=80*o,c=48*o,l=3*o,u=2*o,d=3*o,f=15*o,p=74*o,m=30*o,h=document.createElement(`canvas`);h.width=s,h.height=c,h.style.cssText=`width:80px;height:48px`;var g=h.getContext(`2d`);return g.font=`bold `+9*o+`px Helvetica,Arial,sans-serif`,g.textBaseline=`top`,g.fillStyle=n,g.fillRect(0,0,s,c),g.fillStyle=t,g.fillText(e,l,u),g.fillRect(d,f,p,m),g.fillStyle=n,g.globalAlpha=.9,g.fillRect(d,f,p,m),{dom:h,update:function(c,_){r=Math.min(r,c),i=Math.max(i,c),g.fillStyle=n,g.globalAlpha=1,g.fillRect(0,0,s,f),g.fillStyle=t,g.fillText(a(c)+` `+e+` (`+a(r)+`-`+a(i)+`)`,l,u),g.drawImage(h,d+o,f,p-o,m,d,f,p-o,m),g.fillRect(d+p-o,f,o,m),g.fillStyle=n,g.globalAlpha=.9,g.fillRect(d+p-o,f,o,a((1-c/_)*m))}}},e})}))(),1);function Le({count:e,radius:t,random:n=Math.random}){let r=new Float32Array(e*12),i=t*.82;for(let t=0;t<e;t++){let e=t*12,a=Re(n),o=Math.cbrt(n())*i,s=a[0]*o,c=a[1]*o,l=a[2]*o,u=ze([-a[2]+(n()-.5)*.2,(n()-.5)*.3,a[0]+(n()-.5)*.2]),d=.018+n()*.024,f=.7+n()*.3;r[e+0]=s,r[e+1]=c,r[e+2]=l,r[e+3]=(.018+n()*.042)*2,r[e+4]=u[0]*d,r[e+5]=u[1]*d,r[e+6]=u[2]*d,r[e+7]=n(),r[e+8]=f,r[e+9]=f,r[e+10]=f,r[e+11]=1}return r}function Re(e){let t=e()*2-1,n=e()*Math.PI*2,r=Math.sqrt(Math.max(0,1-t*t));return[Math.cos(n)*r,t,Math.sin(n)*r]}function ze(e){let t=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/t,e[1]/t,e[2]/t]}function Be({maxRadius:e,overshootMultiplier:t,billboardPadding:n=0}){return e*t+n}var Ve=`struct SceneUniforms {
  viewProj: mat4x4<f32>,
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
}

struct Particle {
  posSize: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
}

struct ShadowUniforms {
  lightViewProj: mat4x4<f32>,
  params: vec4<f32>, // x = strength, y = map size, z = bias
}

@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(1) @binding(0) var<storage, read> particles: array<Particle>;
@group(2) @binding(0) var<uniform> shadow: ShadowUniforms;
@group(2) @binding(1) var shadowMap: texture_depth_2d;
@group(2) @binding(2) var shadowSampler: sampler_comparison;

struct VertexInput {
  @location(0) localPosition: vec3<f32>,
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) local: vec2<f32>,
  @location(2) shadowCoord: vec4<f32>,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  let particle = particles[input.instance];
  let local = input.localPosition.xy;
  let worldPos =
    particle.posSize.xyz +
    scene.cameraRight.xyz * local.x * particle.posSize.w +
    scene.cameraUp.xyz * local.y * particle.posSize.w;

  var output: VertexOutput;
  let world = vec4<f32>(worldPos, 1.0);
  output.position = scene.viewProj * world;
  output.color = particle.color;
  output.local = local;
  output.shadowCoord = shadow.lightViewProj * world;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let d = length(input.local * 2.0);
  if (d > 1.0) {
    discard;
  }

  let visibility = sampleShadowPcf3x3(
    shadowMap,
    shadowSampler,
    input.shadowCoord,
    shadow.params.y,
    shadow.params.z,
  );
  let shade = mix(1.0 - shadow.params.x, 1.0, visibility);
  return vec4<f32>(input.color.rgb * shade, 1.0);
}
`,He=`struct SceneUniforms {
  viewProj: mat4x4<f32>,
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
}

struct Particle {
  posSize: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
}

@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(1) @binding(0) var<storage, read> particles: array<Particle>;

struct VertexInput {
  @location(0) localPosition: vec3<f32>,
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) local: vec2<f32>,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  let particle = particles[input.instance];
  let local = input.localPosition.xy;
  let worldPos =
    particle.posSize.xyz +
    scene.cameraRight.xyz * local.x * particle.posSize.w +
    scene.cameraUp.xyz * local.y * particle.posSize.w;

  var output: VertexOutput;
  output.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  output.local = local;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) {
  if (length(input.local * 2.0) > 1.0) {
    discard;
  }
}
`,Ue=`struct Particle {
  posSize: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
}

struct SimParams {
  time: f32,
  dt: f32,
  maxRadius: f32,
  count: u32,
  noiseScale: f32,
  forceScale: f32,
  damping: f32,
  centerForce: f32,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(2) var<storage, read_write> particlesOut: array<Particle>;

fn hash31(p: vec3<f32>) -> f32 {
  let h = dot(p, vec3<f32>(127.1, 311.7, 74.7));
  return fract(sin(h) * 43758.5453123);
}

fn valueNoise(p: vec3<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);

  let n000 = hash31(i + vec3<f32>(0.0, 0.0, 0.0));
  let n100 = hash31(i + vec3<f32>(1.0, 0.0, 0.0));
  let n010 = hash31(i + vec3<f32>(0.0, 1.0, 0.0));
  let n110 = hash31(i + vec3<f32>(1.0, 1.0, 0.0));
  let n001 = hash31(i + vec3<f32>(0.0, 0.0, 1.0));
  let n101 = hash31(i + vec3<f32>(1.0, 0.0, 1.0));
  let n011 = hash31(i + vec3<f32>(0.0, 1.0, 1.0));
  let n111 = hash31(i + vec3<f32>(1.0, 1.0, 1.0));

  let nx00 = mix(n000, n100, u.x);
  let nx10 = mix(n010, n110, u.x);
  let nx01 = mix(n001, n101, u.x);
  let nx11 = mix(n011, n111, u.x);
  let nxy0 = mix(nx00, nx10, u.y);
  let nxy1 = mix(nx01, nx11, u.y);
  return mix(nxy0, nxy1, u.z) * 2.0 - 1.0;
}

fn noiseVec(p: vec3<f32>) -> vec3<f32> {
  return vec3<f32>(
    valueNoise(p + vec3<f32>(13.5, 41.2, 7.1)),
    valueNoise(p + vec3<f32>(29.7, 5.3, 83.6)),
    valueNoise(p + vec3<f32>(61.1, 17.8, 19.4)),
  );
}

fn curlNoise(p: vec3<f32>) -> vec3<f32> {
  let e = 0.12;
  let dx = vec3<f32>(e, 0.0, 0.0);
  let dy = vec3<f32>(0.0, e, 0.0);
  let dz = vec3<f32>(0.0, 0.0, e);

  let pY0 = noiseVec(p - dy);
  let pY1 = noiseVec(p + dy);
  let pZ0 = noiseVec(p - dz);
  let pZ1 = noiseVec(p + dz);
  let pX0 = noiseVec(p - dx);
  let pX1 = noiseVec(p + dx);

  let x = pY1.z - pY0.z - pZ1.y + pZ0.y;
  let y = pZ1.x - pZ0.x - pX1.z + pX0.z;
  let z = pX1.y - pX0.y - pY1.x + pY0.x;
  return normalize(vec3<f32>(x, y, z) / (2.0 * e));
}

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let i = globalId.x;
  if (i >= params.count) {
    return;
  }

  let particle = particlesIn[i];
  var pos = particle.posSize.xyz;
  var vel = particle.velocity.xyz;

  let timeOffset = vec3<f32>(
    params.time * 0.16,
    params.time * 0.11,
    params.time * 0.13,
  );
  let noisePosition = (pos + timeOffset) * params.noiseScale;
  var force = curlNoise(noisePosition) * params.forceScale;

  let dist = length(pos);
  if (dist > params.maxRadius) {
    let overflow = dist - params.maxRadius;
    force += -normalize(pos) * overflow * params.centerForce;
  }

  vel = (vel + force * params.dt) * params.damping;
  pos = pos + vel * params.dt;

  let nextDist = length(pos);
  if (nextDist > params.maxRadius * 1.35) {
    pos = normalize(pos) * params.maxRadius;
    vel = vel * 0.25;
  }

  particlesOut[i] = Particle(
    vec4<f32>(pos, particle.posSize.w),
    vec4<f32>(vel, particle.velocity.w),
    particle.color,
  );
}
`,We=`${Oe}\n${Ve}`,Q=5e5,Ge=256,$=9,Ke=1024,qe=1.35,Je=.75,Ye=.65,Xe=.002,Ze=[2,18,.5],Qe=[0,0,-1],$e=Math.PI/180;async function et(){await Fe();let e=document.createElement(`canvas`);e.style.cssText=`display:block;width:100vw;height:100vh;touch-action:none;`,document.body.appendChild(e);let t=new Ie.default;t.showPanel(0),t.dom.style.cssText=`position:fixed;top:0;left:0;z-index:10;`,document.body.appendChild(t.dom);let n=document.createElement(`div`);n.textContent=`${Q.toLocaleString()} particles`,n.style.cssText=`position:fixed;right:14px;bottom:12px;z-index:10;color:#d8d8d8;font:12px/1.45 ui-sans-serif,system-ui,sans-serif;letter-spacing:0;text-shadow:0 1px 2px rgba(0,0,0,0.7);pointer-events:none;user-select:none;`,document.body.appendChild(n);let r=await _e.create(e),i=Le({count:Q,radius:$}),a=[X.fromData(r,i,Y.storage,`particles-a`),X.fromData(r,i,Y.storage,`particles-b`)],{positions:o}=Ne(1,1,1,`xy`),s=X.fromData(r,o,Y.vertex,`particle-quad-positions`),c=new Ae(o.length/3).addVertexBuffer({buffer:s,arrayStride:12,attributes:[{shaderLocation:0,format:`float32x3`,offset:0}],slot:0,stepMode:`vertex`}),l=X.create(r,X.uniformSize(me.uniformByteSize()),Y.uniform,`camera-uniforms`),u=new Float32Array(me.uniformFloatCount),d=new me(45*$e,1,.1,300),f=new le(d,{listenerTarget:e,center:[0,0,0],radius:$*4,sensitivity:1,zoomSpeed:.8,panSpeed:.02});f.rx.setTo(-.22),f.ry.setTo(.72);let p=new he(-1,1,-1,1,.1,100);ge({camera:p,center:[0,0,0],radius:Be({maxRadius:$,overshootMultiplier:qe,billboardPadding:Je}),eye:Ze,up:Qe,padding:1});let m=X.create(r,X.uniformSize(he.uniformByteSize()),Y.uniform,`light-camera-uniforms`),h=new Float32Array(he.uniformFloatCount);p.writeUniformData(h),m.write(r,h);let g=X.create(r,32,Y.uniform,`sim-params`),_=new ArrayBuffer(32),v=new Float32Array(_),y=new Uint32Array(_);v[2]=$,y[3]=Q,v[4]=.22,v[5]=7.2,v[6]=.992,v[7]=5.4;let b=new ke(r,Ue,{label:`ParticlesUpdate`,entryPoint:`cs_main`}),x=[Z.create(r,b.getBindGroupLayout(0),[{binding:0,resource:g},{binding:1,resource:a[0]},{binding:2,resource:a[1]}],`particles-update-a-to-b`),Z.create(r,b.getBindGroupLayout(0),[{binding:0,resource:g},{binding:1,resource:a[1]},{binding:2,resource:a[0]}],`particles-update-b-to-a`)],S=Me(r,`ParticlesScene`),C=r.gpu.createBindGroupLayout({label:`ParticlesStorageLayout`,entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}}]}),w=r.gpu.createBindGroupLayout({label:`ParticlesShadowLayout`,entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:`depth`}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{type:`comparison`}}]}),T=r.gpu.createPipelineLayout({label:`ParticlesShadowPipelineLayout`,bindGroupLayouts:[S.bindGroupLayout,C]}),E=r.gpu.createPipelineLayout({label:`ParticlesPipelineLayout`,bindGroupLayouts:[S.bindGroupLayout,C,w]}),D=new Ee(r,He,{label:`ParticlesShadowDraw`,layout:T,vertexBuffers:c.getVertexLayouts(),primitive:{topology:`triangle-list`,cullMode:`none`},depthFormat:`depth32float`,depthWriteEnabled:!0,depthCompare:`less`}),O=new Te(r,We,{label:`ParticlesDraw`,layout:E,vertexBuffers:c.getVertexLayouts(),primitive:{topology:`triangle-list`,cullMode:`none`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!0,depthCompare:`less`},targets:[{format:r.format}]}),k=Z.create(r,S.bindGroupLayout,l,0,`scene-bind-group`),A=Z.create(r,S.bindGroupLayout,m,0,`light-scene-bind-group`),j=a.map((e,t)=>Z.create(r,C,[{binding:0,resource:e}],`particle-draw-${t}`)),M=De.create(r,{label:`ParticlesShadowMap`,size:Ke,format:`depth32float`}),N=X.create(r,X.uniformSize(80),Y.uniform,`shadow-uniforms`),P=new Float32Array(20);P.set(p.getViewProjectionMatrix(),0),P[16]=Ye,P[17]=Ke,P[18]=Xe,N.write(r,P);let ee=Z.create(r,w,[{binding:0,resource:N},{binding:1,resource:M.view},{binding:2,resource:M.sampler}],`shadow-bind-group`),F=null,I=0,L=0,R=0,te=performance.now(),z=()=>{e.width===I&&e.height===L||(I=e.width,L=e.height,I>0&&L>0&&d.setAspect(I/L))},B=()=>{let t=e.width,n=e.height;return F&&F.width===t&&F.height===n?F.createView():(F?.destroy(),F=r.gpu.createTexture({label:`depth-texture`,size:[t,n],format:`depth24plus`,usage:GPUTextureUsage.RENDER_ATTACHMENT}),F.createView())},V=e=>{t.begin(),r.resize(),z();let n=Math.min(1/30,Math.max(1/240,(e-te)/1e3));te=e,v[0]=e*.001,v[1]=n,g.write(r,_),d.writeUniformData(u),l.write(r,u);let i=1-R,a=r.getCurrentTexture().createView(),o=B(),s=r.gpu.createCommandEncoder({label:`particles-frame`}),f=s.beginComputePass({label:`update-particles`});b.dispatch(f,x[R],Math.ceil(Q/Ge)),f.end();let p=M.beginRenderPass(s);D.draw(p,c,[A,j[i]],Q),p.end();let m=Ce(s,a,{clearColor:{r:.015,g:.015,b:.017,a:1},depthStencilAttachment:{view:o,depthLoadOp:`clear`,depthClearValue:1,depthStoreOp:`store`}});O.draw(m,c,[k,j[i],ee],Q),m.end(),r.gpu.queue.submit([s.finish()]),R=i,t.end(),requestAnimationFrame(V)};window.addEventListener(`beforeunload`,()=>{f.destroy(),F?.destroy(),l.destroy(),m.destroy(),g.destroy(),N.destroy(),M.destroy(),s.destroy(),a.forEach(e=>e.destroy())}),requestAnimationFrame(V)}et().catch(e=>{console.error(e)});