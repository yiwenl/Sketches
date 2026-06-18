(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=window.requestAnimationFrame,t=60,n=1,r=0,i=0,a=0,o=0,s=0,c=new Map,l=[],u=new Set,d=[],f=[],p=!1,m=0;function h(e){return c.delete(e)}function g(n){if(n<=0||!Number.isFinite(n))throw Error(`Frame rate must be a positive number`);t=n,e=n=>{requestAnimationFrame((r=>{let i=1e3/t,o=r-a;o>=i?n(r):setTimeout((()=>e(n)),i-o)}))}}function _(e=!1){if(p&&!e)return;let i,a=0;for(let[e,t]of c)t?.func(t.args);for(;d.length>0;)i=d.pop(),i.func(i.args);for(a=0;a<l.length;a++)i=l[a],r-i.time>i.delay/n&&(i.func(i.args),i.repeat?i.time=r:(l.splice(a,1),a--));let o=performance.now();for(;u.length>0;){if(i=u.shift(),!(performance.now()-o<1e3/t*n)){u.unshift(i);break}i.func(i.args)}}function v(e){a=r,e===void 0?(s+=1e3/t*n,r=s):(p||(o===0&&(o=e),s+=e-o,o=e),r=s),i=r-a,d=d.concat(f),f=[]}r=performance.now(),function t(n){_(),v(n),e(t)}(r);var y={addEF:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for enterframe task.`);let n=++m;return c.set(n,{func:e,args:t}),{id:n,cancel:()=>{h(n)}}},removeEF:h,delay:function(e,t,n,i=!1){if(typeof e!=`function`)throw Error(`Invalid function provided for delayed task.`);let a=++m,o={id:a,func:e,args:n,delay:t,time:r,repeat:i,cancelled:!1};return l.push(o),{cancel:()=>{let e=l.findIndex((e=>e.id===a));e!==-1&&l.splice(e,1)}}},next:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for next frame task.`);f.push({func:e,args:t})},defer:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for deferred task.`);u.add({func:e,args:t})},getTime:function(){return r/1e3},getDeltaTime:function(){return i},setFrameRate:g,setTimeScale:function(e){if(e<0||!Number.isFinite(e))throw Error(`Time scale must be a non-negative number`);n=e,g(t*n)},getTimeScale:function(){return n},setEnterframeFunc:function(t){e=t},step:function(){_(!0),v()},pause:function(){p=!0,o=0},resume:function(){p=!1},isPaused:function(){return p},removeAllTasks:function(){c.clear(),l.length=0,u.clear(),d.length=0,f.length=0,s=0,r=0}},b=Object.defineProperty,x=(e,t,n)=>t in e?b(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,S=(e,t,n)=>x(e,typeof t==`symbol`?t:t+``,n),C=1e-6,w=typeof Float32Array<`u`?Float32Array:Array;function T(){var e=new w(16);return w!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function E(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function D(e,t){var n=t[0],r=t[1],i=t[2],a=t[3],o=t[4],s=t[5],c=t[6],l=t[7],u=t[8],d=t[9],f=t[10],p=t[11],m=t[12],h=t[13],g=t[14],_=t[15],v=n*s-r*o,y=n*c-i*o,b=n*l-a*o,x=r*c-i*s,S=r*l-a*s,C=i*l-a*c,w=u*h-d*m,T=u*g-f*m,E=u*_-p*m,D=d*g-f*h,O=d*_-p*h,k=f*_-p*g,A=v*k-y*O+b*D+x*E-S*T+C*w;return A?(A=1/A,e[0]=(s*k-c*O+l*D)*A,e[1]=(i*O-r*k-a*D)*A,e[2]=(h*C-g*S+_*x)*A,e[3]=(f*S-d*C-p*x)*A,e[4]=(c*E-o*k-l*T)*A,e[5]=(n*k-i*E+a*T)*A,e[6]=(g*b-m*C-_*y)*A,e[7]=(u*C-f*b+p*y)*A,e[8]=(o*O-s*E+l*w)*A,e[9]=(r*E-n*O-a*w)*A,e[10]=(m*S-h*b+_*v)*A,e[11]=(d*b-u*S-p*v)*A,e[12]=(s*T-o*D-c*w)*A,e[13]=(n*D-r*T+i*w)*A,e[14]=(h*y-m*x-g*v)*A,e[15]=(u*x-d*y+f*v)*A,e):null}function O(e,t,n){var r=t[0],i=t[1],a=t[2],o=t[3],s=t[4],c=t[5],l=t[6],u=t[7],d=t[8],f=t[9],p=t[10],m=t[11],h=t[12],g=t[13],_=t[14],v=t[15],y=n[0],b=n[1],x=n[2],S=n[3];return e[0]=y*r+b*s+x*d+S*h,e[1]=y*i+b*c+x*f+S*g,e[2]=y*a+b*l+x*p+S*_,e[3]=y*o+b*u+x*m+S*v,y=n[4],b=n[5],x=n[6],S=n[7],e[4]=y*r+b*s+x*d+S*h,e[5]=y*i+b*c+x*f+S*g,e[6]=y*a+b*l+x*p+S*_,e[7]=y*o+b*u+x*m+S*v,y=n[8],b=n[9],x=n[10],S=n[11],e[8]=y*r+b*s+x*d+S*h,e[9]=y*i+b*c+x*f+S*g,e[10]=y*a+b*l+x*p+S*_,e[11]=y*o+b*u+x*m+S*v,y=n[12],b=n[13],x=n[14],S=n[15],e[12]=y*r+b*s+x*d+S*h,e[13]=y*i+b*c+x*f+S*g,e[14]=y*a+b*l+x*p+S*_,e[15]=y*o+b*u+x*m+S*v,e}function k(e,t,n,r,i){var a=1/Math.tan(t/2);if(e[0]=a/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i!=null&&i!==1/0){var o=1/(r-i);e[10]=i*o,e[14]=i*r*o}else e[10]=-1,e[14]=-r;return e}function A(e,t,n,r,i,a,o){var s=1/(t-n),c=1/(r-i),l=1/(a-o);return e[0]=-2*s,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=-2*c,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=l,e[11]=0,e[12]=(t+n)*s,e[13]=(i+r)*c,e[14]=a*l,e[15]=1,e}function ee(e,t,n,r){var i,a,o,s,c,l,u,d,f,p,m=t[0],h=t[1],g=t[2],_=r[0],v=r[1],y=r[2],b=n[0],x=n[1],S=n[2];return Math.abs(m-b)<C&&Math.abs(h-x)<C&&Math.abs(g-S)<C?E(e):(u=m-b,d=h-x,f=g-S,p=1/Math.sqrt(u*u+d*d+f*f),u*=p,d*=p,f*=p,i=v*f-y*d,a=y*u-_*f,o=_*d-v*u,p=Math.sqrt(i*i+a*a+o*o),p?(p=1/p,i*=p,a*=p,o*=p):(i=0,a=0,o=0),s=d*o-f*a,c=f*i-u*o,l=u*a-d*i,p=Math.sqrt(s*s+c*c+l*l),p?(p=1/p,s*=p,c*=p,l*=p):(s=0,c=0,l=0),e[0]=i,e[1]=s,e[2]=u,e[3]=0,e[4]=a,e[5]=c,e[6]=d,e[7]=0,e[8]=o,e[9]=l,e[10]=f,e[11]=0,e[12]=-(i*m+a*h+o*g),e[13]=-(s*m+c*h+l*g),e[14]=-(u*m+d*h+f*g),e[15]=1,e)}function j(){var e=new w(3);return w!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function M(e){var t=new w(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function N(e,t,n){var r=new w(3);return r[0]=e,r[1]=t,r[2]=n,r}function P(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function F(e,t,n,r){return e[0]=t,e[1]=n,e[2]=r,e}function te(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e}function ne(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e}function re(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e}function ie(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+r*r+i*i)}function I(e,t){var n=t[0],r=t[1],i=t[2],a=n*n+r*r+i*i;return a>0&&(a=1/Math.sqrt(a)),e[0]=t[0]*a,e[1]=t[1]*a,e[2]=t[2]*a,e}function L(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function R(e,t,n){var r=t[0],i=t[1],a=t[2],o=n[0],s=n[1],c=n[2];return e[0]=i*c-a*s,e[1]=a*o-r*c,e[2]=r*s-i*o,e}function z(e,t,n){var r=t[0],i=t[1],a=t[2],o=n[3]*r+n[7]*i+n[11]*a+n[15];return o||=1,e[0]=(n[0]*r+n[4]*i+n[8]*a+n[12])/o,e[1]=(n[1]*r+n[5]*i+n[9]*a+n[13])/o,e[2]=(n[2]*r+n[6]*i+n[10]*a+n[14])/o,e}var B=ne,ae=ie;(function(){var e=j();return function(t,n,r,i,a,o){var s,c;for(n||=3,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2];return t}})();var oe=class{constructor(e,t=.1){S(this,`easing`),S(this,`_value`),S(this,`_targetValue`),S(this,`_min`),S(this,`_max`),S(this,`_efIndex`),this.easing=t,this._value=e,this._targetValue=e,this._efIndex=y.addEF(()=>this._update())}_update(){this._checkLimit(),this._value+=(this._targetValue-this._value)*this.easing,Math.abs(this._targetValue-this._value)<1e-4&&(this._value=this._targetValue)}setTo(e){this._targetValue=this._value=e,this._checkLimit(),this._value=this._targetValue}add(e){this._targetValue+=e,this._checkLimit()}limit(e,t){if(e>t){this.limit(t,e);return}this._min=e,this._max=t,this._checkLimit()}_checkLimit(){this._min!==void 0&&this._targetValue<this._min&&(this._targetValue=this._min),this._max!==void 0&&this._targetValue>this._max&&(this._targetValue=this._max)}destroy(){y.removeEF(this._efIndex)}set value(e){this._targetValue=e}get value(){return this._value}get targetValue(){return this._targetValue}};function se(e,t){return`touches`in e&&e.touches.length>0?(t.x=e.touches[0].pageX,t.y=e.touches[0].pageY):`clientX`in e&&(t.x=e.clientX,t.y=e.clientY),t}function ce(e){let t=e.deltaY;switch(e.deltaMode){case WheelEvent.DOM_DELTA_LINE:t*=16;break;case WheelEvent.DOM_DELTA_PAGE:t*=100;break}return-t/120}var le=class{constructor(e,t={}){S(this,`radius`),S(this,`position`,j()),S(this,`positionOffset`,j()),S(this,`center`),S(this,`sensitivity`,1),S(this,`zoomSpeed`,1),S(this,`panSpeed`,.01),S(this,`_camera`),S(this,`_listenerTarget`),S(this,`_up`),S(this,`_rx`),S(this,`_ry`),S(this,`_mouse`,{x:0,y:0}),S(this,`_preMouse`,{x:0,y:0}),S(this,`_panCenterStart`,j()),S(this,`_eye`,j()),S(this,`_forward`,j()),S(this,`_right`,j()),S(this,`_camUp`,j()),S(this,`_efIndex`),S(this,`_preRX`,0),S(this,`_preRY`,0),S(this,`_isLockZoom`,!1),S(this,`_isLockRotation`,!1),S(this,`_isLockPan`,!1),S(this,`_isInvert`,!1),S(this,`_isMouseDown`,!1),S(this,`_isPanning`,!1),S(this,`_destroyed`,!1),S(this,`_wheelBind`),S(this,`_downBind`),S(this,`_moveBind`),S(this,`_upBind`),this._camera=e,this._listenerTarget=t.listenerTarget??document.body,this.center=t.center?N(t.center[0],t.center[1],t.center[2]):j(),this._up=t.up?N(t.up[0],t.up[1],t.up[2]):N(0,1,0),this.sensitivity=t.sensitivity??1,this.zoomSpeed=t.zoomSpeed??1,this.panSpeed=t.panSpeed??.01;let n=t.radius??10;this.radius=new oe(n),this.position[2]=this.radius.value,this._rx=new oe(0),this._rx.limit(-Math.PI/2,Math.PI/2),this._ry=new oe(0),this._wheelBind=e=>this._onWheel(e),this._downBind=e=>this._onDown(e),this._moveBind=e=>this._onMove(e),this._upBind=()=>this._onUp(),this.connect(),this._efIndex=y.addEF(()=>this._loop())}connect(){this.disconnect(),this._listenerTarget.addEventListener(`wheel`,this._wheelBind,{passive:!1}),this._listenerTarget.addEventListener(`mousedown`,this._downBind),this._listenerTarget.addEventListener(`touchstart`,this._downBind,{passive:!1}),this._listenerTarget.addEventListener(`mousemove`,this._moveBind),this._listenerTarget.addEventListener(`touchmove`,this._moveBind,{passive:!1}),window.addEventListener(`touchend`,this._upBind),window.addEventListener(`mouseup`,this._upBind)}disconnect(){this._listenerTarget.removeEventListener(`wheel`,this._wheelBind),this._listenerTarget.removeEventListener(`mousedown`,this._downBind),this._listenerTarget.removeEventListener(`touchstart`,this._downBind),this._listenerTarget.removeEventListener(`mousemove`,this._moveBind),this._listenerTarget.removeEventListener(`touchmove`,this._moveBind),window.removeEventListener(`touchend`,this._upBind),window.removeEventListener(`mouseup`,this._upBind)}destroy(){this._destroyed||(this._destroyed=!0,this.disconnect(),y.removeEF(this._efIndex),this.radius.destroy(),this._rx.destroy(),this._ry.destroy())}lock(e=!0){this._isLockZoom=e,this._isLockRotation=e,this._isLockPan=e,this._isMouseDown=!1,this._isPanning=!1}lockZoom(e=!0){this._isLockZoom=e}lockRotation(e=!0){this._isLockRotation=e}lockPan(e=!0){this._isLockPan=e}inverseControl(e=!0){this._isInvert=e}update(){this._updatePosition()}get rx(){return this._rx}get ry(){return this._ry}_loop(){this._destroyed||(this._updatePosition(),this._updateCamera())}_updatePosition(){let e=this._rx.value,t=this._ry.value,n=this.radius.value;this.position[1]=Math.sin(e)*n;let r=Math.cos(e)*n;this.position[0]=Math.cos(t+Math.PI*.5)*r,this.position[2]=Math.sin(t+Math.PI*.5)*r,this.position[0]+=this.positionOffset[0],this.position[1]+=this.positionOffset[1],this.position[2]+=this.positionOffset[2]}_updateCamera(){this._camera.lookAt(this.position,this.center,this._up)}_isPanInput(e){return`button`in e?e.button===1||e.button===0&&e.shiftKey:!1}_panByPixels(e,t){this._updatePosition(),F(this._eye,this.position[0],this.position[1],this.position[2]),B(this._forward,this.center,this._eye),I(this._forward,this._forward),R(this._right,this._forward,this._up),I(this._right,this._right),R(this._camUp,this._right,this._forward),I(this._camUp,this._camUp);let n=this.panSpeed*this.sensitivity;this.center[0]=this._panCenterStart[0]-this._right[0]*e*n+this._camUp[0]*t*n,this.center[1]=this._panCenterStart[1]-this._right[1]*e*n+this._camUp[1]*t*n,this.center[2]=this._panCenterStart[2]-this._right[2]*e*n+this._camUp[2]*t*n}_onDown(e){if(se(e,this._mouse),se(e,this._preMouse),this._isPanInput(e)&&!this._isLockPan){this._isPanning=!0,this._isMouseDown=!1,this._panCenterStart[0]=this.center[0],this._panCenterStart[1]=this.center[1],this._panCenterStart[2]=this.center[2];return}this._isLockRotation||(this._isPanning=!1,this._isMouseDown=!0,this._preRX=this._rx.targetValue,this._preRY=this._ry.targetValue)}_onMove(e){if(se(e,this._mouse),`touches`in e&&e.preventDefault(),this._isPanning){if(this._isLockPan)return;let e=this._mouse.x-this._preMouse.x,t=this._mouse.y-this._preMouse.y;this._panByPixels(e,t);return}if(this._isLockRotation||!this._isMouseDown)return;let t=-(this._mouse.x-this._preMouse.x);this._isInvert&&(t*=-1),this._ry.value=this._preRY-t*.01*this.sensitivity;let n=-(this._mouse.y-this._preMouse.y);this._isInvert&&(n*=-1),this._rx.value=this._preRX-n*.01*this.sensitivity}_onUp(){this._isMouseDown=!1,this._isPanning=!1}_onWheel(e){if(this._isLockZoom)return;e.preventDefault();let t=ce(e)*this.zoomSpeed;this.radius.add(-t*2),this.radius.targetValue<0&&this.radius.setTo(1e-4)}},ue=class{constructor(e,t){S(this,`origin`),S(this,`direction`),S(this,`_target`,j()),S(this,`_edge1`,j()),S(this,`_edge2`,j()),S(this,`_normal`,j()),S(this,`_diff`,j()),S(this,`_a`,j()),S(this,`_b`,j()),S(this,`_c`,j()),this.origin=M(e),this.direction=M(t)}set(e,t){return P(this.origin,e),P(this.direction,t),this}at(e,t){let n=t??this._target;return P(n,this.direction),re(n,n,e),te(n,n,this.origin),n}intersectTriangle(e,t,n,r=!0){P(this._a,e),P(this._b,t),P(this._c,n),B(this._edge1,this._b,this._a),B(this._edge2,this._c,this._a),R(this._normal,this._edge1,this._edge2);let i=L(this.direction,this._normal),a;if(i>0){if(r)return null;a=1}else if(i<0)a=-1,i=-i;else return null;B(this._diff,this.origin,this._a),R(this._edge2,this._diff,this._edge2);let o=a*L(this.direction,this._edge2);if(o<0)return null;R(this._edge1,this._edge1,this._diff);let s=a*L(this.direction,this._edge1);if(s<0||o+s>i)return null;let c=-a*L(this._diff,this._normal);if(c<0)return null;let l=c/i,u=j();return this.at(l,u),u}intersectSphere(e,t){let n=j();B(n,e,this.origin);let r=L(n,this.direction),i=L(n,n)-r*r,a=t*t;if(i>a)return null;let o=Math.sqrt(a-i),s=r-o,c=r+o;if(s<0&&c<0)return null;let l=j();return s<0?this.at(c,l):this.at(s,l),l}};function de(e){if(`touches`in e&&e.touches.length>0)return{x:e.touches[0].pageX,y:e.touches[0].pageY};let t=e;return{x:t.clientX,y:t.clientY}}function fe(e,t){let n=e.x-t.x,r=e.y-t.y;return Math.sqrt(n*n+r*r)}var pe=class extends EventTarget{constructor(e,t,n,r={}){super(),S(this,`clickTolerance`,8),S(this,`modelMatrix`),S(this,`resolution`),S(this,`_camera`),S(this,`_faces`),S(this,`_ray`),S(this,`_skipMove`),S(this,`_listenerTarget`),S(this,`_lastPos`,{x:0,y:0}),S(this,`_firstPos`,{x:0,y:0}),S(this,`_hit`,N(-999,-999,-999)),S(this,`_onDownBind`),S(this,`_onMoveBind`),S(this,`_onUpBind`),this._camera=t,this.resolution=n??[window.innerWidth,window.innerHeight],this.modelMatrix=T(),this._ray=new ue([0,0,0],[0,0,-1]),this._skipMove=r.skipMoveCheck??!1,this._listenerTarget=r.listenerTarget??window,this._faces=me(e),this._onDownBind=e=>this._onDown(e),this._onMoveBind=e=>this._onMove(e),this._onUpBind=()=>this._onUp(),this.connect()}connect(){this._listenerTarget.addEventListener(`mousedown`,this._onDownBind),this._listenerTarget.addEventListener(`mousemove`,this._onMoveBind),this._listenerTarget.addEventListener(`mouseup`,this._onUpBind),this._listenerTarget.addEventListener(`touchstart`,this._onDownBind),this._listenerTarget.addEventListener(`touchmove`,this._onMoveBind),this._listenerTarget.addEventListener(`touchend`,this._onUpBind)}disconnect(){this._listenerTarget.removeEventListener(`mousedown`,this._onDownBind),this._listenerTarget.removeEventListener(`mousemove`,this._onMoveBind),this._listenerTarget.removeEventListener(`mouseup`,this._onUpBind),this._listenerTarget.removeEventListener(`touchstart`,this._onDownBind),this._listenerTarget.removeEventListener(`touchmove`,this._onMoveBind),this._listenerTarget.removeEventListener(`touchend`,this._onUpBind)}get hit(){return this._hit}_checkHit(e=`onHit`){let t=this._camera;if(!t)return;let n=this._lastPos.x/this.resolution[0]*2-1,r=-(this._lastPos.y/this.resolution[1])*2+1;t.generateRay([n,r,0],this._ray);let i=null,a=1/0,o=j(),s=j(),c=j();for(let e=0;e<this._faces.length;e++){let n=this._faces[e];z(o,[n[0],n[1],n[2]],this.modelMatrix),z(s,[n[3],n[4],n[5]],this.modelMatrix),z(c,[n[6],n[7],n[8]],this.modelMatrix);let r=this._ray.intersectTriangle(o,s,c);if(r){let e=ae(r,t.getPosition());e<a&&(i=M(r),a=e)}}i?(this._hit=M(i),this.dispatchEvent(new CustomEvent(e,{detail:{hit:i}}))):this.dispatchEvent(new CustomEvent(`onUp`))}_onDown(e){this._firstPos=de(e),this._lastPos=de(e),this._checkHit(`onDown`)}_onMove(e){this._lastPos=de(e),this._skipMove||this._checkHit()}_onUp(){fe(this._firstPos,this._lastPos)<this.clickTolerance&&this._checkHit()}};function me(e){let{positions:t,indices:n}=e,r=[];for(let e=0;e<n.length;e+=3){let i=n[e],a=n[e+1],o=n[e+2];r.push(new Float32Array([t[i*3],t[i*3+1],t[i*3+2],t[a*3],t[a*3+1],t[a*3+2],t[o*3],t[o*3+1],t[o*3+2]]))}return r}var he=N(0,1,0),ge=class e{constructor(){S(this,`viewMatrix`),S(this,`projectionMatrix`),S(this,`viewProjectionMatrix`),S(this,`position`,N(0,0,1)),S(this,`target`,N(0,0,0)),S(this,`up`,j()),this.viewMatrix=T(),this.projectionMatrix=T(),this.viewProjectionMatrix=T(),E(this.projectionMatrix),this.lookAt(this.position,this.target)}static uniformByteSize(){return e.uniformFloatCount*4}lookAt(e,t,n=he){return F(this.position,e[0],e[1],e[2]),F(this.target,t[0],t[1],t[2]),F(this.up,n[0],n[1],n[2]),ee(this.viewMatrix,this.position,this.target,this.up),this}getViewMatrix(){return this.viewMatrix}getProjectionMatrix(){return this.projectionMatrix}getViewProjectionMatrix(e){let t=e??this.viewProjectionMatrix;return O(t,this.projectionMatrix,this.viewMatrix),t}writeUniformData(t,n=0){if(t.length<n+e.uniformFloatCount)throw Error(`Camera uniform target is too small. Need at least ${n+e.uniformFloatCount} floats.`);this.getViewProjectionMatrix(this.viewProjectionMatrix),t.set(this.viewProjectionMatrix,n);let r=this.viewMatrix;return t[n+16]=r[0],t[n+17]=r[4],t[n+18]=r[8],t[n+19]=0,t[n+20]=r[1],t[n+21]=r[5],t[n+22]=r[9],t[n+23]=0,t}generateRay(e,t){let n=T(),r=j();return O(n,this.projectionMatrix,this.viewMatrix),D(n,n),z(r,e,n),B(r,r,this.position),I(r,r),t?(t.set(this.position,r),t):new ue(this.position,r)}getPosition(){return M(this.position)}getLookAtTarget(){return M(this.target)}getFieldOfView(){}updateProjection(){}};S(ge,`uniformFloatCount`,24);var V=ge,_e=class extends V{constructor(e,t,n,r){super(),S(this,`fov`,Math.PI/4),S(this,`aspect`,1),S(this,`near`,.1),S(this,`far`,100),this.setPerspective(e,t,n,r)}setPerspective(e,t,n,r){return this.fov=e,this.aspect=t,this.near=n,this.far=r,k(this.getProjectionMatrix(),e,t,n,r),this}setAspect(e){return this.aspect=e,this.updateProjection(),this}getFieldOfView(){return this.fov}getAspect(){return this.aspect}getNear(){return this.near}getFar(){return this.far}updateProjection(){this.setPerspective(this.fov,this.aspect,this.near,this.far)}},ve=class extends V{constructor(e,t,n,r,i=.1,a=100){super(),S(this,`left`,-1),S(this,`right`,1),S(this,`bottom`,-1),S(this,`top`,1),S(this,`near`,.1),S(this,`far`,100),this.setOrthographic(e,t,n,r,i,a)}setOrthographic(e,t,n,r,i=.1,a=100){return this.left=e,this.right=t,this.bottom=n,this.top=r,this.near=i,this.far=a,A(this.getProjectionMatrix(),e,t,n,r,i,a),this}getFieldOfView(){}updateProjection(){this.setOrthographic(this.left,this.right,this.bottom,this.top,this.near,this.far)}};function ye({camera:e,center:t,radius:n,eye:r,up:i=N(0,1,0),padding:a=0}){let o=ie(r,t),s=n*(1+a);return e.lookAt(r,t,i),e.setOrthographic(-s,s,-s,s,Math.max(.01,o-s),o+s),e}var be=class e{constructor(e,t,n,r,i,a,o){S(this,`canvas`),S(this,`context`),S(this,`device`),S(this,`format`),S(this,`colorSpace`),S(this,`toneMappingMode`),S(this,`hdr`),this.canvas=e,this.context=t,this.device=n,this.format=r,this.colorSpace=i,this.toneMappingMode=a,this.hdr=o}get gpu(){return this.device}static async isSupported(){return navigator.gpu?await navigator.gpu.requestAdapter()!==null:!1}static async create(t,n={}){if(!navigator.gpu)throw Error(`WebGPU is not supported in this browser.`);let r=await navigator.gpu.requestAdapter({powerPreference:n.powerPreference});if(!r)throw Error(`Failed to request WebGPU adapter.`);let i=await r.requestDevice(),a=t.getContext(`webgpu`);if(!a)throw Error(`Failed to get WebGPU canvas context.`);let o=n.hdr??!1,s=n.colorSpace??`srgb`,c=n.toneMappingMode??(o?`extended`:`standard`),l=o?`rgba16float`:navigator.gpu.getPreferredCanvasFormat();return a.configure({device:i,format:l,alphaMode:n.alpha===!1?`opaque`:`premultiplied`,colorSpace:s,toneMapping:{mode:c}}),new e(t,a,i,l,s,c,o)}resize(e,t){let n=e??this.canvas.clientWidth,r=t??this.canvas.clientHeight;(this.canvas.width!==n||this.canvas.height!==r)&&(this.canvas.width=Math.max(1,n),this.canvas.height=Math.max(1,r))}getCurrentTexture(){return this.context.getCurrentTexture()}destroy(){this.device.destroy()}};function xe(e,t,n){return e.gpu.createShaderModule({code:t,label:n})}function H(e,t){return e.gpu.createRenderPipeline(t)}function U(e,t){return e.gpu.createComputePipeline(t)}function W(e,t,n,r=0){if(n instanceof ArrayBuffer){e.gpu.queue.writeBuffer(t,r,n);return}e.gpu.queue.writeBuffer(t,r,n.buffer,n.byteOffset,n.byteLength)}var G={vertex:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,index:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,storage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,uniform:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,vertexStorage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST},K=class e{constructor(e,t,n,r){S(this,`gpu`),S(this,`size`),S(this,`usage`),S(this,`label`),this.gpu=e,this.size=t,this.usage=n,this.label=r}static uniformSize(e){return Math.ceil(e/16)*16}static create(t,n,r,i){return new e(t.gpu.createBuffer({size:n,usage:r,label:i}),n,r,i)}static fromData(t,n,r,i){let a=n.byteLength,o=e.create(t,a,r,i);return o.write(t,n),o}write(e,t,n=0){W(e,this.gpu,t,n)}destroy(){this.gpu.destroy()}};function Se(e){return e instanceof K?{buffer:e.gpu}:e}var q=class e{constructor(e){S(this,`gpu`),this.gpu=e}static create(t,n,r,i=0,a){if(r instanceof K){let o=typeof i==`number`?i:0,s=typeof i==`string`?i:a;return e.createFromEntries(t,n,[{binding:o,resource:r}],s)}let o=typeof i==`string`?i:a;return e.createFromEntries(t,n,r,o)}static createFromEntries(t,n,r,i){return new e(t.gpu.createBindGroup({label:i,layout:n,entries:r.map(({binding:e,resource:t})=>({binding:e,resource:Se(t)}))}))}bind(e,t=0){e.setBindGroup(t,this.gpu)}},Ce={f32:{alignment:4,storageByteSize:4,valueFloatCount:1},u32:{alignment:4,storageByteSize:4,valueFloatCount:1},vec2f:{alignment:8,storageByteSize:8,valueFloatCount:2},vec3f:{alignment:16,storageByteSize:16,valueFloatCount:3},vec4f:{alignment:16,storageByteSize:16,valueFloatCount:4},mat4x4f:{alignment:16,storageByteSize:64,valueFloatCount:16}},we=4294967295;function Te(e,t){let n=e%t;return n===0?e:e+t-n}function Ee(e){return typeof e==`object`&&!!e&&`length`in e}var J=class e{constructor(e,t){S(this,`floatCount`),S(this,`byteSize`),S(this,`label`),S(this,`buffer`),S(this,`dataInternal`),S(this,`uintDataInternal`),S(this,`fields`,new Map),this.label=t;let n=0;for(let[t,r]of Object.entries(e)){let e=Ce[r];if(!e)throw Error(`Unsupported uniform field type "${r}" for "${t}".`);n=Te(n,e.alignment),this.fields.set(t,{type:r,floatOffset:n/4,valueFloatCount:e.valueFloatCount}),n+=e.storageByteSize}this.byteSize=n,this.floatCount=this.byteSize/4,this.buffer=new ArrayBuffer(this.byteSize),this.dataInternal=new Float32Array(this.buffer),this.uintDataInternal=new Uint32Array(this.buffer)}static create(t,n){return new e(t,n)}get data(){return this.dataInternal}getOffset(e){let t=this.fields.get(e);if(!t)throw Error(`Unknown uniform field "${e}".`);return t.floatOffset}set(e,t){let n=this.fields.get(e);if(!n)throw Error(`Unknown uniform field "${e}".`);if(n.type===`f32`){if(typeof t!=`number`)throw Error(`Field "${e}" expects a number (f32).`);return this.dataInternal[n.floatOffset]=t,this}if(n.type===`u32`){if(typeof t!=`number`)throw Error(`Field "${e}" expects a number (u32).`);if(!Number.isFinite(t)||!Number.isInteger(t)||t<0||t>we)throw Error(`Field "${e}" expects a u32 integer between 0 and ${we}.`);return this.uintDataInternal[n.floatOffset]=t,this}if(typeof t==`number`||!Ee(t))throw Error(`Field "${e}" expects ${n.valueFloatCount} floats for type "${n.type}".`);if(t.length<n.valueFloatCount)throw Error(`Field "${e}" requires ${n.valueFloatCount} floats; got ${t.length}.`);if(t instanceof Float32Array)this.dataInternal.set(t.subarray(0,n.valueFloatCount),n.floatOffset);else{let e=n.valueFloatCount,r=n.floatOffset;for(let n=0;n<e;n++)this.dataInternal[r+n]=t[n]}return n.type===`vec3f`&&(this.dataInternal[n.floatOffset+3]=0),this}toFloat32Array(){return this.dataInternal}writeToBuffer(e,t,n=0){e.write(t,this.dataInternal,n)}},De=class e{constructor(e,t,n,r,i,a,o,s){S(this,`width`),S(this,`height`),S(this,`depth`),S(this,`format`),S(this,`view`),S(this,`storageView`),S(this,`sampler`),S(this,`_gpu`),this._gpu=e,this.view=t,this.storageView=n,this.sampler=r,this.width=i,this.height=a,this.depth=o,this.format=s}static create(t,n,r={}){let i=r.label??`Texture3D`,a=r.format??`rgba32float`,[o,s,c]=typeof n==`number`?[n,n,n]:n;if(o<=0||s<=0||c<=0)throw Error(`Texture3D size must have positive width, height, and depth.`);let l=r.usage??GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.STORAGE_BINDING,u=t.gpu.createTexture({label:i,dimension:`3d`,size:[o,s,c],format:a,usage:l}),d=u.createView({label:`${i}View`,dimension:`3d`});return new e(u,d,d,t.gpu.createSampler({label:`${i}Sampler`,addressModeU:r.addressModeU??`mirror-repeat`,addressModeV:r.addressModeV??`mirror-repeat`,addressModeW:r.addressModeW??`mirror-repeat`,magFilter:r.magFilter??`nearest`,minFilter:r.minFilter??`nearest`}),o,s,c,a)}get gpu(){return this._gpu}destroy(){this._gpu.destroy()}};function Oe(e,t,n={}){let{clearColor:r={r:.05,g:.05,b:.08,a:1},loadOp:i=`clear`,storeOp:a=`store`,depthStencilAttachment:o}=n,s=`colorView`in t?t.colorView:t,c=o??(`colorView`in t&&t.depthView?{view:t.depthView,depthLoadOp:`clear`,depthClearValue:1,depthStoreOp:`store`}:void 0);return e.beginRenderPass({colorAttachments:[{view:s,clearValue:r,loadOp:i,storeOp:a}],depthStencilAttachment:c})}var ke=class e{constructor(e,t){S(this,`format`),S(this,`depthFormat`),S(this,`sampler`),S(this,`device`),S(this,`label`),S(this,`withDepth`),S(this,`depthTextureUsage`),S(this,`colorTexture`),S(this,`depthTextureInternal`,null),S(this,`colorViewInternal`),S(this,`depthViewInternal`),S(this,`widthInternal`),S(this,`heightInternal`),this.device=e,this.label=t.label??`RenderTarget`,this.format=t.format??(e.hdr?`rgba16float`:e.format),this.withDepth=t.withDepth??!1,this.depthTextureUsage=t.depthTextureUsage??GPUTextureUsage.RENDER_ATTACHMENT,this.depthFormat=this.withDepth?t.depthFormat??`depth24plus`:void 0,this.widthInternal=Math.max(1,Math.floor(t.width)),this.heightInternal=Math.max(1,Math.floor(t.height)),this.sampler=e.gpu.createSampler({label:`${this.label}Sampler`,addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`,magFilter:`linear`,minFilter:`linear`});let{colorTexture:n,colorView:r,depthTexture:i,depthView:a}=this.createTextures();this.colorTexture=n,this.colorViewInternal=r,this.depthTextureInternal=i,this.depthViewInternal=a}static create(t,n){return new e(t,n)}get width(){return this.widthInternal}get height(){return this.heightInternal}get colorView(){return this.colorViewInternal}get depthView(){return this.depthViewInternal}get depthTexture(){return this.depthTextureInternal??void 0}resize(e,t){var n;let r=Math.max(1,Math.floor(e)),i=Math.max(1,Math.floor(t));if(r===this.widthInternal&&i===this.heightInternal)return;this.widthInternal=r,this.heightInternal=i,this.colorTexture.destroy(),(n=this.depthTextureInternal)==null||n.destroy();let{colorTexture:a,colorView:o,depthTexture:s,depthView:c}=this.createTextures();this.colorTexture=a,this.colorViewInternal=o,this.depthTextureInternal=s,this.depthViewInternal=c}beginRenderPass(e,t={}){return Oe(e,this,t)}destroy(){var e;this.colorTexture.destroy(),(e=this.depthTextureInternal)==null||e.destroy()}createTextures(){let e=this.device.gpu.createTexture({label:`${this.label}ColorTexture`,size:[this.widthInternal,this.heightInternal],format:this.format,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),t=e.createView({label:`${this.label}ColorView`});if(!this.withDepth||!this.depthFormat)return{colorTexture:e,colorView:t,depthTexture:null,depthView:void 0};let n=this.device.gpu.createTexture({label:`${this.label}DepthTexture`,size:[this.widthInternal,this.heightInternal],format:this.depthFormat,usage:this.depthTextureUsage});return{colorTexture:e,colorView:t,depthTexture:n,depthView:n.createView({label:`${this.label}DepthView`})}}},Ae=class{constructor(e,t,n={}){S(this,`pipeline`);let{label:r=`Draw`,layout:i=`auto`,primitive:a={topology:`triangle-list`},depthStencil:o,targets:s=[{format:e.format}],vertexBuffers:c=[]}=typeof n==`string`?{label:n}:n,l=xe(e,t,`${r}Shader`);this.pipeline=H(e,{label:`${r}Pipeline`,layout:i,vertex:{module:l,entryPoint:`vs_main`,buffers:c},fragment:{module:l,entryPoint:`fs_main`,targets:s},primitive:a,depthStencil:o})}getBindGroupLayout(e=0){return this.pipeline.getBindGroupLayout(e)}draw(e,t,n,r=1){if(e.setPipeline(this.pipeline),n){let t=Array.isArray(n)?n:[n];for(let n=0;n<t.length;n++)t[n].bind(e,n)}typeof t==`number`?e.draw(t,r):(t.bind(e),t.hasIndexBuffer()?e.drawIndexed(t.getIndexCount(),r):e.draw(t.vertexCount,r))}},je=class{constructor(e,t,n={}){S(this,`drawInternal`);let r=typeof n==`string`?{label:n}:n,{label:i=`DepthDraw`,depthFormat:a=`depth32float`,depthCompare:o=`less`,depthWriteEnabled:s=!0,...c}=r,l=r.depthStencil??{format:a,depthWriteEnabled:s,depthCompare:o};this.drawInternal=new Ae(e,t,{label:i,targets:[],depthStencil:l,...c})}getBindGroupLayout(e=0){return this.drawInternal.getBindGroupLayout(e)}draw(e,t,n,r=1){this.drawInternal.draw(e,t,n,r)}};function Me(e={}){let{topology:t=`triangle-list`,cullMode:n=`back`,frontFace:r,stripIndexFormat:i,unclippedDepth:a}=e;return{topology:t,cullMode:n,...r?{frontFace:r}:{},...i?{stripIndexFormat:i}:{},...a===void 0?{}:{unclippedDepth:a}}}function Ne(e){let{colorFormat:t,depthFormat:n=`depth24plus`,depthCompare:r=`less`,depthWriteEnabled:i=!0,...a}=e;return{primitive:Me(a),depthStencil:{format:n,depthWriteEnabled:i,depthCompare:r},targets:[{format:t}]}}function Pe(e={}){let{depthFormat:t=`depth32float`,depthCompare:n=`less`,depthWriteEnabled:r=!0,...i}=e;return{primitive:Me(i),depthFormat:t,depthWriteEnabled:r,depthCompare:n}}var Fe=class e{constructor(e,t={}){S(this,`texture`),S(this,`view`),S(this,`sampler`),S(this,`size`),S(this,`label`),S(this,`renderTarget`),this.label=t.label??`ShadowMap`;let n=1024,r=1024;if(typeof t.size==`number`?(n=t.size,r=t.size):Array.isArray(t.size)&&(n=t.size[0],r=t.size[1]),this.size=[n,r],this.renderTarget=ke.create(e,{label:`${this.label}Target`,width:n,height:r,withDepth:!0,depthFormat:t.format??`depth32float`,depthTextureUsage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),!this.renderTarget.depthTexture||!this.renderTarget.depthView)throw Error(`Failed to create shadow map depth texture`);this.texture=this.renderTarget.depthTexture,this.view=this.renderTarget.depthView,this.sampler=e.gpu.createSampler({label:`${this.label}Sampler`,compare:`less`,magFilter:`linear`,minFilter:`linear`,addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`})}static create(t,n){return new e(t,n)}beginRenderPass(e,t={}){let n=t.depthStencilAttachment??{view:this.view,depthClearValue:1,depthLoadOp:`clear`,depthStoreOp:`store`};return e.beginRenderPass({label:`${this.label}Pass`,colorAttachments:[],depthStencilAttachment:n,...t})}destroy(){this.renderTarget.destroy()}},Ie=`
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
`,Y=class{constructor(e,t,n={}){S(this,`pipeline`);let{label:r=`Compute`,layout:i=`auto`,entryPoint:a=`cs_main`}=typeof n==`string`?{label:n}:n,o=xe(e,t,`${r}Shader`);this.pipeline=U(e,{label:`${r}Pipeline`,layout:i,compute:{module:o,entryPoint:a}})}getBindGroupLayout(e=0){return this.pipeline.getBindGroupLayout(e)}dispatch(e,t,n=1){if(e.setPipeline(this.pipeline),t){let n=Array.isArray(t)?t:[t];for(let t=0;t<n.length;t++)e.setBindGroup(t,n[t].gpu)}typeof n==`number`?e.dispatchWorkgroups(n):e.dispatchWorkgroups(n[0],n[1]??1,n[2]??1)}run(e,t,n=1,r){let i=e.beginComputePass(r?{label:r}:void 0);this.dispatch(i,t,n),i.end()}},Le=class{constructor(e){if(S(this,`vertexCount`),S(this,`bindings`,[]),S(this,`indexBuffer`),S(this,`indexCount`,0),S(this,`indexFormat`,`uint16`),e<=0)throw Error(`Mesh vertexCount must be greater than 0.`);this.vertexCount=e}addVertexBuffer(e){let t=e.slot??this.nextFreeSlot();if(this.bindings.some(e=>e.slot===t))throw Error(`Vertex buffer slot ${t} is already in use.`);return this.bindings.push({...e,slot:t}),this}getVertexLayouts(){if(this.bindings.length===0)return[];let e=Math.max(...this.bindings.map(e=>e.slot)),t=Array.from({length:e+1},()=>null);for(let e of this.bindings)t[e.slot]={arrayStride:e.arrayStride,stepMode:e.stepMode??`vertex`,attributes:e.attributes.map(e=>({shaderLocation:e.shaderLocation,format:e.format,offset:e.offset}))};return t}bind(e){for(let t of this.bindings)e.setVertexBuffer(t.slot,t.buffer.gpu);this.indexBuffer&&e.setIndexBuffer(this.indexBuffer.gpu,this.indexFormat)}setIndexBuffer(e,t,n=`uint16`){if(t<=0)throw Error(`Mesh index count must be greater than 0.`);return this.indexBuffer=e,this.indexCount=t,this.indexFormat=n,this}setIndexBufferFromData(e,t,n=`mesh-indices`){let r=t instanceof Uint32Array?`uint32`:`uint16`,i=K.fromData(e,t,G.index,n);return this.setIndexBuffer(i,t.length,r),i}hasIndexBuffer(){return this.indexBuffer!==void 0}getIndexCount(){return this.indexCount}nextFreeSlot(){let e=new Set(this.bindings.map(e=>e.slot)),t=0;for(;e.has(t);)t++;return t}};function Re(e,t=`SceneUniformBindGroupLayout`){return e.gpu.createBindGroupLayout({label:t,entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}}]})}function ze(e,t=`SceneUniformPipelineLayout`){let n=Re(e,`${t}BindGroup`);return{pipelineLayout:e.gpu.createPipelineLayout({label:t,bindGroupLayouts:[n]}),bindGroupLayout:n}}var Be=class e{constructor(e,t){S(this,`textures`),S(this,`size`),this.textures=e,this.size=t}static create(t,n,r={}){let i=r.label??`Texture3DPingPong`,[a,o,s]=typeof n==`number`?[n,n,n]:n,c=Math.max(a,o,s);return new e([De.create(t,[a,o,s],{...r,label:`${i}-write`}),De.create(t,[a,o,s],{...r,label:`${i}-read`})],c)}get read(){return this.textures[1]}get write(){return this.textures[0]}swap(){let[e,t]=this.textures;this.textures=[t,e]}destroy(){for(let e of this.textures)e.destroy()}};function Ve(e,t){return t>65535?new Uint32Array(e):new Uint16Array(e)}var He=class{static plane(e={}){let t=e.width??1,n=e.height??1,r=Math.max(1,Math.floor(e.segmentsX??1)),i=Math.max(1,Math.floor(e.segmentsY??1)),a=[],o=[],s=[],c=[];for(let e=0;e<=i;e++)for(let c=0;c<=r;c++){let l=c/r,u=e/i,d=(l-.5)*t,f=(u-.5)*n;a.push(d,f,0),o.push(l,u),s.push(0,0,1)}let l=r+1;for(let e=0;e<i;e++)for(let t=0;t<r;t++){let n=e*l+t,r=n+1,i=n+l+1,a=n+l;c.push(n,r,i,n,i,a)}return{positions:new Float32Array(a),uvs:new Float32Array(o),normals:new Float32Array(s),indices:Ve(c,a.length/3)}}static sphere(e={}){let t=e.radius??1,n=Math.max(3,Math.floor(e.segments??12)),r=[],i=[],a=[],o=[];for(let e=0;e<=n;e++){let o=e/n,s=o*Math.PI,c=Math.cos(s),l=Math.sin(s);for(let e=0;e<=n;e++){let s=e/n,u=s*Math.PI*2,d=Math.cos(u),f=Math.sin(u),p=d*l,m=c,h=f*l;r.push(p*t,m*t,h*t),a.push(p,m,h),i.push(s,1-o)}}let s=n+1;for(let e=0;e<n;e++)for(let t=0;t<n;t++){let n=e*s+t,r=n+1,i=n+s+1,a=n+s;o.push(n,r,i,n,i,a)}return{positions:new Float32Array(r),uvs:new Float32Array(i),normals:new Float32Array(a),indices:Ve(o,r.length/3)}}static cube(e={}){let t=(e.size??1)*.5,n=[],r=[],i=[],a=[],o=0;function s(e,t,s,c,l){n.push(...e,...t,...s,...c),r.push(0,0,1,0,1,1,0,1),i.push(...l,...l,...l,...l),a.push(o+0,o+1,o+2,o+0,o+2,o+3),o+=4}return s([t,-t,-t],[t,t,-t],[t,t,t],[t,-t,t],[1,0,0]),s([-t,-t,t],[-t,t,t],[-t,t,-t],[-t,-t,-t],[-1,0,0]),s([-t,t,-t],[-t,t,t],[t,t,t],[t,t,-t],[0,1,0]),s([-t,-t,t],[-t,-t,-t],[t,-t,-t],[t,-t,t],[0,-1,0]),s([-t,-t,t],[t,-t,t],[t,t,t],[-t,t,t],[0,0,1]),s([t,-t,-t],[-t,-t,-t],[-t,t,-t],[t,t,-t],[0,0,-1]),{positions:new Float32Array(n),uvs:new Float32Array(r),normals:new Float32Array(i),indices:Ve(a,n.length/3)}}};function Ue(e=document.body){let t=document.createElement(`div`);t.style.cssText=`position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:2rem;font:16px/1.5 system-ui,sans-serif;background:#111;color:#eee;text-align:center;`,t.textContent=`WebGPU is not available in this browser. Try the latest Chrome, Edge, or Safari.`,e.appendChild(t)}async function We(){if(!await be.isSupported())throw Ue(),Error(`WebGPU is not supported.`)}var Ge={TEXTURE_SIZE:32,DENSITY_DISSIPATION:.994,VELOCITY_DISSIPATION:.996,PRESSURE_DISSIPATION:.996,PRESSURE_ITERATIONS:20,CURL:5,ADVECTION_SCALE:1},X=`
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
`,Ke=`
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

${X}

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
`,qe=`
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
`;`${X}${qe}`;var Je=`
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

${qe}

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
`,Ye=`
struct PassParams {
  gridSize: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var divergenceOut: texture_storage_3d<rgba32float, write>;

${X}

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
`,Xe=`
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

${X}

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
`,Ze=`
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

${X}

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
`,Qe=`
struct PassParams {
  gridSize: f32,
  dissipation: f32,
  _pad0: f32,
  _pad1: f32,
}

@group(0) @binding(0) var<uniform> params: PassParams;
@group(0) @binding(1) var pressureIn: texture_3d<f32>;
@group(0) @binding(2) var pressureOut: texture_storage_3d<rgba32float, write>;

${X}

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
`,$e=`
struct VorticityParams {
  gridSize: f32,
  dt: f32,
  curl: f32,    // confinement strength (ε)
  _pad: f32,
}

@group(0) @binding(0) var<uniform> params: VorticityParams;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var velocityOut: texture_storage_3d<rgba32float, write>;

${X}

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
`,et=4,tt=1;function nt(){let e=Math.random()*Math.PI*2,t=Math.acos(2*Math.random()-1);return[Math.sin(t)*Math.cos(e),Math.sin(t)*Math.sin(e),Math.cos(t)]}var rt=J.create({gridSize:`f32`,dissipation:`f32`,timestep:`f32`,advectionScale:`f32`}),it=J.create({gridSize:`f32`,_pad0:`f32`,_pad1:`f32`,_pad2:`f32`}),at=J.create({gridSize:`f32`,dissipation:`f32`,_pad0:`f32`,_pad1:`f32`}),ot=J.create({grid:`vec4f`,center:`vec4f`,dir:`vec4f`,force:`vec4f`}),st=J.create({gridSize:`f32`,dt:`f32`,curl:`f32`,_pad:`f32`}),ct=class{settings;maxRadius;_device;_gridSize;_dispatch;_dt=1/60;_time=0;_velocity;_density;_pressure;_divergenceTex;_passUniformBuffer;_gridUniformBuffer;_clearUniformBuffer;_vorticityUniformBuffer;_forceUniformBuffers=[];_advect;_applyForces;_vorticityConfinement;_divergenceCompute;_jacobi;_gradient;_clear;_pendingForces=[];constructor(e,t={},n=tt){this._device=e,this.maxRadius=n,this.settings={...Ge};for(let e in t){let n=e;this.settings[n]!==void 0&&t[n]!==void 0&&(this.settings[n]=t[n])}let r=this.settings.TEXTURE_SIZE;this._gridSize=r,this._dispatch=[r/et,r/et,r/et],this._velocity=Be.create(e,r,{label:`Velocity`}),this._density=Be.create(e,r,{label:`Density`}),this._pressure=Be.create(e,r,{label:`Pressure`}),this._divergenceTex=De.create(e,r,{label:`Divergence`});let i=G.uniform;this._passUniformBuffer=K.create(e,K.uniformSize(rt.byteSize),i,`fluid-pass-uniforms`),this._gridUniformBuffer=K.create(e,K.uniformSize(it.byteSize),i,`fluid-grid-uniforms`),this._clearUniformBuffer=K.create(e,K.uniformSize(at.byteSize),i,`fluid-clear-uniforms`),this._vorticityUniformBuffer=K.create(e,K.uniformSize(st.byteSize),i,`fluid-vorticity-uniforms`),this._advect=new Y(e,Ke,{label:`FluidAdvect`}),this._applyForces=new Y(e,Je,{label:`FluidApplyForces`}),this._vorticityConfinement=new Y(e,$e,{label:`FluidVorticityConfinement`}),this._divergenceCompute=new Y(e,Ye,{label:`FluidDivergence`}),this._jacobi=new Y(e,Xe,{label:`FluidJacobi`}),this._gradient=new Y(e,Ze,{label:`FluidGradient`}),this._clear=new Y(e,Qe,{label:`FluidClear`})}addForce(e,t,n,r,i=1,a=0){let o=.5/this.maxRadius;this._pendingForces.push({center:[e[0]*o,e[1]*o,e[2]*o],dir:t,radius:n*o,strength:r,densityScale:i,noiseStrength:a})}updateFlow(e,t,n=1,r=1,i=0){let a=[(e[0]-.5)*2*this.maxRadius,(e[1]-.5)*2*this.maxRadius,(e[2]-.5)*2*this.maxRadius],o=.08*r*this.maxRadius;this.addForce(a,t,o,800*n,1,i)}applyRandomForces(e,t={}){let{strengthMin:n=400,strengthMax:r=1200,radiusMin:i=.06,radiusMax:a=.14}=t;for(let t=0;t<e;t++){let e=[(Math.random()-.5)*2*this.maxRadius,(Math.random()-.5)*2*this.maxRadius,(Math.random()-.5)*2*this.maxRadius],t=n+Math.random()*(r-n),o=i+Math.random()*(a-i);this.addForce(e,nt(),o*this.maxRadius,t)}}updateFlowWithMap(e,t,n=1){}update(e,t){t!==void 0&&(this._dt=Math.min(t,.1)),this._time+=this._dt;let n=e.beginComputePass({label:`fluid-sim`});this._advectPass(n,this._velocity,this.settings.VELOCITY_DISSIPATION),this._advectPass(n,this._density,this.settings.DENSITY_DISSIPATION),this._flushForces(n),this.settings.CURL>0&&this._vorticityConfinementPass(n),this._divergencePass(n),this._clearPass(n);for(let e=0;e<this.settings.PRESSURE_ITERATIONS;e++)this._jacobiPass(n);this._gradientPass(n),n.end()}get velocity(){return this._velocity.read}get density(){return this._density.read}get divergence(){return this._divergenceTex}get pressure(){return this._pressure.read}get allTextures(){return[this.velocity,this.density,this._divergenceTex,this.pressure]}log(){console.log(`Fluid Settings : `);for(let e in this.settings)console.log(e,this.settings[e])}destroy(){this._velocity.destroy(),this._density.destroy(),this._pressure.destroy(),this._divergenceTex.destroy(),this._passUniformBuffer.destroy(),this._gridUniformBuffer.destroy(),this._clearUniformBuffer.destroy();for(let e of this._forceUniformBuffers)e.destroy();this._vorticityUniformBuffer.destroy()}_writePassUniforms(e){rt.set(`gridSize`,this._gridSize).set(`dissipation`,e).set(`timestep`,this._dt).set(`advectionScale`,this.settings.ADVECTION_SCALE).writeToBuffer(this._passUniformBuffer,this._device)}_writeGridUniforms(){it.set(`gridSize`,this._gridSize).set(`_pad0`,0).set(`_pad1`,0).set(`_pad2`,0).writeToBuffer(this._gridUniformBuffer,this._device)}_advectPass(e,t,n){this._writePassUniforms(n);let r=q.create(this._device,this._advect.getBindGroupLayout(0),[{binding:0,resource:this._passUniformBuffer},{binding:1,resource:this._velocity.read.view},{binding:2,resource:t.read.view},{binding:3,resource:t.write.storageView}],`fluid-advect-bg`);this._advect.dispatch(e,r,this._dispatch),t.swap()}_vorticityConfinementPass(e){st.set(`gridSize`,this._gridSize).set(`dt`,this._dt).set(`curl`,this.settings.CURL).set(`_pad`,0).writeToBuffer(this._vorticityUniformBuffer,this._device);let t=q.create(this._device,this._vorticityConfinement.getBindGroupLayout(0),[{binding:0,resource:this._vorticityUniformBuffer},{binding:1,resource:this._velocity.read.view},{binding:2,resource:this._velocity.write.storageView}],`fluid-vorticity-bg`);this._vorticityConfinement.dispatch(e,t,this._dispatch),this._velocity.swap()}_flushForces(e){for(let t=0;t<this._pendingForces.length;t++){let n=this._pendingForces[t],r=this._getForceUniformBuffer(t);ot.set(`grid`,[this._gridSize,this._time,0,0]).set(`center`,[n.center[0],n.center[1],n.center[2],0]).set(`dir`,[n.dir[0],n.dir[1],n.dir[2],n.noiseStrength]).set(`force`,[this._dt,n.strength,n.radius,n.densityScale]).writeToBuffer(r,this._device);let i=q.create(this._device,this._applyForces.getBindGroupLayout(0),[{binding:0,resource:r},{binding:1,resource:this._velocity.read.view},{binding:2,resource:this._density.read.view},{binding:3,resource:this._velocity.write.storageView},{binding:4,resource:this._density.write.storageView}],`fluid-apply-forces-bg`);this._applyForces.dispatch(e,i,this._dispatch),this._velocity.swap(),this._density.swap()}this._pendingForces.length=0}_getForceUniformBuffer(e){let t=this._forceUniformBuffers[e];return t||(t=K.create(this._device,K.uniformSize(ot.byteSize),G.uniform,`fluid-force-uniforms-${e}`),this._forceUniformBuffers[e]=t),t}_divergencePass(e){this._writeGridUniforms();let t=q.create(this._device,this._divergenceCompute.getBindGroupLayout(0),[{binding:0,resource:this._gridUniformBuffer},{binding:1,resource:this._velocity.read.view},{binding:2,resource:this._divergenceTex.storageView}],`fluid-divergence-bg`);this._divergenceCompute.dispatch(e,t,this._dispatch)}_clearPass(e){at.set(`gridSize`,this._gridSize).set(`dissipation`,this.settings.PRESSURE_DISSIPATION).set(`_pad0`,0).set(`_pad1`,0).writeToBuffer(this._clearUniformBuffer,this._device);let t=q.create(this._device,this._clear.getBindGroupLayout(0),[{binding:0,resource:this._clearUniformBuffer},{binding:1,resource:this._pressure.read.view},{binding:2,resource:this._pressure.write.storageView}],`fluid-clear-bg`);this._clear.dispatch(e,t,this._dispatch),this._pressure.swap()}_jacobiPass(e){this._writeGridUniforms();let t=q.create(this._device,this._jacobi.getBindGroupLayout(0),[{binding:0,resource:this._gridUniformBuffer},{binding:1,resource:this._pressure.read.view},{binding:2,resource:this._divergenceTex.view},{binding:3,resource:this._pressure.write.storageView}],`fluid-jacobi-bg`);this._jacobi.dispatch(e,t,this._dispatch),this._pressure.swap()}_gradientPass(e){this._writeGridUniforms();let t=q.create(this._device,this._gradient.getBindGroupLayout(0),[{binding:0,resource:this._gridUniformBuffer},{binding:1,resource:this._pressure.read.view},{binding:2,resource:this._velocity.read.view},{binding:3,resource:this._velocity.write.storageView}],`fluid-gradient-bg`);this._gradient.dispatch(e,t,this._dispatch),this._velocity.swap()}},lt=`
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
`,ut=J.create({viewProj:`mat4x4f`,texSize:`f32`,volumeExtent:`f32`,showVelocity:`f32`,showDensity:`f32`,densityGain:`f32`,velocityThreshold:`f32`}),dt=class{mesh;device;positionBuffer;uvBuffer;indexBuffer;uniformBuffer;drawPass;bindGroupLayout;pipelineLayout;constructor(e,t={}){this.device=e;let n=t.texSize??32,r=t.volumeExtent??2,i=He.plane({width:r,height:r,segmentsX:1,segmentsY:1});this.positionBuffer=K.fromData(e,i.positions,G.vertex,`slice-plane-positions`),this.uvBuffer=K.fromData(e,i.uvs,G.vertex,`slice-plane-uvs`),this.indexBuffer=K.fromData(e,i.indices,G.index,`slice-plane-indices`),this.mesh=new Le(i.positions.length/3).addVertexBuffer({buffer:this.positionBuffer,arrayStride:12,attributes:[{shaderLocation:0,format:`float32x3`,offset:0}],slot:0,stepMode:`vertex`}).addVertexBuffer({buffer:this.uvBuffer,arrayStride:8,attributes:[{shaderLocation:1,format:`float32x2`,offset:0}],slot:1,stepMode:`vertex`}).setIndexBuffer(this.indexBuffer,i.indices.length,i.indices instanceof Uint32Array?`uint32`:`uint16`),this.uniformBuffer=K.create(e,K.uniformSize(ut.byteSize),G.uniform,`slice-plane-uniforms`);let a=GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT;this.bindGroupLayout=e.gpu.createBindGroupLayout({label:`SlicePlaneBindGroupLayout`,entries:[{binding:0,visibility:a,buffer:{type:`uniform`}},{binding:1,visibility:a,texture:{sampleType:`unfilterable-float`,viewDimension:`3d`}},{binding:2,visibility:a,texture:{sampleType:`unfilterable-float`,viewDimension:`3d`}}]}),this.pipelineLayout=e.gpu.createPipelineLayout({label:`SlicePlanePipelineLayout`,bindGroupLayouts:[this.bindGroupLayout]}),this.drawPass=new Ae(e,lt,{label:`SlicePlane`,layout:this.pipelineLayout,vertexBuffers:this.mesh.getVertexLayouts(),primitive:{topology:`triangle-list`,cullMode:`none`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!1,depthCompare:`less`},targets:[{format:e.format,blend:{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}}]}),ut.set(`viewProj`,new Float32Array(16)).set(`texSize`,n).set(`volumeExtent`,r).set(`showVelocity`,1).set(`showDensity`,1).set(`densityGain`,14).set(`velocityThreshold`,1.2).writeToBuffer(this.uniformBuffer,e)}draw(e,t,n,r,i){ut.set(`viewProj`,r).set(`showVelocity`,+!!i.showVelocity).set(`showDensity`,+!!i.showDensity).set(`densityGain`,i.densityGain).set(`velocityThreshold`,i.velocityThreshold).writeToBuffer(this.uniformBuffer,this.device);let a=q.create(this.device,this.bindGroupLayout,[{binding:0,resource:this.uniformBuffer},{binding:1,resource:t.view},{binding:2,resource:n.view}],`slice-plane-bind-group`);this.drawPass.draw(e,this.mesh,a)}destroy(){this.positionBuffer.destroy(),this.uvBuffer.destroy(),this.indexBuffer.destroy(),this.uniformBuffer.destroy()}},ft=typeof Float32Array<`u`?Float32Array:Array;Math.PI/180,Math.hypot||(Math.hypot=function(){for(var e=0,t=arguments.length;t--;)e+=arguments[t]*arguments[t];return Math.sqrt(e)});function pt(){var e=new ft(3);return ft!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function mt(e){var t=new ft(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function ht(e){var t=e[0],n=e[1],r=e[2];return Math.hypot(t,n,r)}function gt(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function _t(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e}function vt(e,t){var n=t[0],r=t[1],i=t[2],a=n*n+r*r+i*i;return a>0&&(a=1/Math.sqrt(a)),e[0]=t[0]*a,e[1]=t[1]*a,e[2]=t[2]*a,e}var yt=_t;(function(){var e=pt();return function(t,n,r,i,a,o){var s,c;for(n||=3,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2];return t}})();var Z={fluidTextureSize:32,strength:150,radius:6,noiseStrength:.35,advectionScale:16,curl:6,densityDissipation:.95,velocityDissipation:.98,pressureIterations:24,showFluidSlice:!0,showSliceVelocity:!0,showSliceDensity:!0};function bt({count:e,radius:t,baseScale:n=1,random:r=Math.random}){let i=new Float32Array(e*12),a=t*.82;for(let t=0;t<e;t++){let e=t*12,o=xt(r),s=Math.cbrt(r())*a,c=o[0]*s,l=o[1]*s,u=o[2]*s,d=St([-o[2]+(r()-.5)*.2,(r()-.5)*.3,o[0]+(r()-.5)*.2]),f=.018+r()*.024,p=.7+r()*.3;i[e+0]=c,i[e+1]=l,i[e+2]=u,i[e+3]=(.01+r()*.06)*2*n,i[e+4]=d[0]*f,i[e+5]=d[1]*f,i[e+6]=d[2]*f,i[e+7]=9+r()*2,i[e+8]=p,i[e+9]=p,i[e+10]=p,i[e+11]=1}return i}function xt(e){let t=e()*2-1,n=e()*Math.PI*2,r=Math.sqrt(Math.max(0,1-t*t));return[Math.cos(n)*r,t,Math.sin(n)*r]}function St(e){let t=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/t,e[1]/t,e[2]/t]}function Ct({maxRadius:e,overshootMultiplier:t,billboardPadding:n=0}){return e*t+n}var wt=`config`,Tt=class{static init(){let e=new URLSearchParams(window.location.search).get(wt);if(e)try{let t=JSON.parse(e);if(t&&typeof t==`object`)for(let e of Object.keys(Z))e in t&&Object.assign(Z,{[e]:t[e]})}catch(e){console.warn(`Failed to parse URL config`,e)}this.refresh()}static refresh(){let e=new URLSearchParams(window.location.search);e.set(wt,JSON.stringify(Z)),window.history.replaceState(`experiment`,document.title,`${window.location.pathname}?${e.toString()}${window.location.hash}`)}static reload(){window.location.href=window.location.origin+window.location.pathname+`?config=`+JSON.stringify(Z)}static reset(){window.location.href=window.location.pathname}},Et=`struct SceneUniforms {
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
@group(1) @binding(0) var<storage, read> cubes: array<Particle>;
@group(2) @binding(0) var<uniform> shadow: ShadowUniforms;
@group(2) @binding(1) var shadowMap: texture_depth_2d;
@group(2) @binding(2) var shadowSampler: sampler_comparison;

struct VertexInput {
  @location(0) localPosition: vec3<f32>,
  @location(1) localNormal: vec3<f32>,
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) shadowCoord: vec4<f32>,
}

fn buildBasis(forwardInput: vec3<f32>) -> mat3x3<f32> {
  let speedSq = dot(forwardInput, forwardInput);
  let forward = select(
    vec3<f32>(0.0, 1.0, 0.0),
    forwardInput * inverseSqrt(max(speedSq, 0.000001)),
    speedSq > 0.000001
  );
  let helper = select(
    vec3<f32>(0.0, 1.0, 0.0),
    vec3<f32>(1.0, 0.0, 0.0),
    abs(forward.y) > 0.92
  );
  let right = normalize(cross(helper, forward));
  let up = cross(forward, right);
  return mat3x3<f32>(right, forward, up);
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  let cube = cubes[input.instance];
  let basis = buildBasis(cube.velocity.xyz);
  let scale = vec3<f32>(cube.posSize.w * 0.35, cube.posSize.w * 3.2, cube.posSize.w * 0.35);
  let local = input.localPosition * scale;
  let normal = normalize(basis * input.localNormal);
  let worldPos = cube.posSize.xyz + basis * local;
  let world = vec4<f32>(worldPos, 1.0);

  var output: VertexOutput;
  output.position = scene.viewProj * world;
  output.color = cube.color.rgb;
  output.normal = normal;
  output.shadowCoord = shadow.lightViewProj * world;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let lightDir = normalize(vec3<f32>(1.0, 18.0, 8.0));
  var diffuse = max(dot(normalize(input.normal), lightDir), 0.0);
  diffuse = mix(0.7, 1.0, diffuse) + 0.1;
  let visibility = sampleShadowPcf3x3(
    shadowMap,
    shadowSampler,
    input.shadowCoord,
    shadow.params.y,
    shadow.params.z,
  );
  let shadowShade = mix(1.0 - shadow.params.x, 1.0, visibility);
  let lighting = diffuse * shadowShade;
  let colorGrad = vec3<f32>(1.0, 0.98, 0.96);
  return vec4<f32>(input.color * colorGrad * lighting, 1.0);
}
`,Dt=`struct SceneUniforms {
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
@group(1) @binding(0) var<storage, read> cubes: array<Particle>;

struct VertexInput {
  @location(0) localPosition: vec3<f32>,
  @location(1) localNormal: vec3<f32>,
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
}

fn buildBasis(forwardInput: vec3<f32>) -> mat3x3<f32> {
  let speedSq = dot(forwardInput, forwardInput);
  let forward = select(
    vec3<f32>(0.0, 1.0, 0.0),
    forwardInput * inverseSqrt(max(speedSq, 0.000001)),
    speedSq > 0.000001
  );
  let helper = select(
    vec3<f32>(0.0, 1.0, 0.0),
    vec3<f32>(1.0, 0.0, 0.0),
    abs(forward.y) > 0.92
  );
  let right = normalize(cross(helper, forward));
  let up = cross(forward, right);
  return mat3x3<f32>(right, forward, up);
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  let cube = cubes[input.instance];
  let basis = buildBasis(cube.velocity.xyz);
  let scale = vec3<f32>(cube.posSize.w * 0.35, cube.posSize.w * 3.2, cube.posSize.w * 0.35);
  let worldPos = cube.posSize.xyz + basis * (input.localPosition * scale);

  var output: VertexOutput;
  output.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  return output;
}

@fragment
fn fs_main() {}
`,Ot=`struct SceneUniforms {
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
  let colorGrad = vec3(1.0, 0.98, 0.96);
  return vec4<f32>(input.color.rgb * shade * colorGrad, 1.0);
}
`,kt=`struct SceneUniforms {
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
`,At=`struct Particle {
  posSize: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
}

struct SimParams {
  time: f32,
  dt: f32,
  maxRadius: f32,
  count: u32,
  fluidForceScale: f32,
  densityForceScale: f32,
  damping: f32,
  centerForce: f32,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(2) var<storage, read_write> particlesOut: array<Particle>;
@group(0) @binding(3) var velocityTex: texture_3d<f32>;
@group(0) @binding(4) var densityTex: texture_3d<f32>;

fn textureCoordFromWorld(pos: vec3<f32>) -> vec3<i32> {
  let dims = textureDimensions(velocityTex);
  let uvw = clamp(pos / (params.maxRadius * 2.0) + vec3<f32>(0.5), vec3<f32>(0.0), vec3<f32>(0.999));
  let coord = vec3<i32>(uvw * vec3<f32>(dims));
  return clamp(coord, vec3<i32>(0), vec3<i32>(dims) - vec3<i32>(1));
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

  let coord = textureCoordFromWorld(pos);
  let fluidVelocity = textureLoad(velocityTex, coord, 0).xyz;
  let density = max(textureLoad(densityTex, coord, 0).x, 0.0);
  let densityInfluence = 0.2 + density * params.densityForceScale;
  var force = fluidVelocity * params.fluidForceScale * densityInfluence;

  let dist = length(pos);
  let maxRadius = params.maxRadius;
  // let f = smoothstep(maxRadius * 0.5, maxRadius, dist);
  // force -= normalize(pos) * f * params.centerForce;
  let threshold = 0.6;
  if (dist > maxRadius * threshold) {
    var t = smoothstep(maxRadius, maxRadius * threshold, dist);
    t = 1.0 / max(t, 0.001);
    force -= normalize(pos) * t * params.centerForce;
  }
  

  let velDecay = 1.0 - smoothstep(maxRadius * 0.9, maxRadius, dist) * 0.03;
  vel *= velDecay;


  vel = (vel + force * params.dt * 0.5) * params.damping;

  let maxSpeed = particle.velocity.w;
  if(length(vel) > maxSpeed) {
    vel = normalize(vel) * maxSpeed;
  }
  pos = pos + vel * params.dt;


  particlesOut[i] = Particle(
    vec4<f32>(pos, particle.posSize.w),
    vec4<f32>(vel, particle.velocity.w),
    particle.color,
  );
}
`,jt=`${Ie}\n${Ot}`,Mt=`${Ie}\n${Et}`,Q=3e5,Nt=1e5,Pt=256,$=9,Ft=new Float32Array([0,1,0,-.8660254,-.5,0,.8660254,-.5,0]),It=$*2,Lt=1024*2,Rt=1.35,zt=.75,Bt=.65,Vt=.002,Ht=[1,18,8],Ut=[0,0,-1],Wt=$*.5,Gt=Math.PI/180,Kt={maxRadius:$*1.25,fluidForceScale:2.8,densityForceScale:.02,damping:.998,centerForce:8.4},qt={time:`f32`,dt:`f32`,maxRadius:`f32`,count:`u32`,fluidForceScale:`f32`,densityForceScale:`f32`,damping:`f32`,centerForce:`f32`},Jt=K.uniformSize(J.create(qt).byteSize),Yt=e=>J.create(qt).set(`time`,0).set(`dt`,1/60).set(`maxRadius`,Kt.maxRadius).set(`count`,e).set(`fluidForceScale`,Kt.fluidForceScale).set(`densityForceScale`,Kt.densityForceScale).set(`damping`,Kt.damping).set(`centerForce`,Kt.centerForce);async function Xt(){await We(),Tt.init();let e=document.createElement(`canvas`);e.className=`app-canvas`,document.body.appendChild(e);let t=document.createElement(`div`);t.textContent=`${Q.toLocaleString()} fluid particles`,t.className=`particle-count-label`,document.body.appendChild(t);let{fluidTextureSize:n,advectionScale:r,curl:i,densityDissipation:a,velocityDissipation:o,pressureIterations:s}=Z,c=await be.create(e),l=new ct(c,{TEXTURE_SIZE:n,DENSITY_DISSIPATION:a,VELOCITY_DISSIPATION:o,PRESSURE_DISSIPATION:.95,PRESSURE_ITERATIONS:s,CURL:i,ADVECTION_SCALE:r},$),u=new dt(c,{texSize:n,volumeExtent:It}),d=new dt(c,{texSize:n,volumeExtent:It}),f=bt({count:Q,radius:$}),p=bt({count:Nt,radius:$,baseScale:1}),m=[K.fromData(c,f,G.storage,`particles-a`),K.fromData(c,f,G.storage,`particles-b`)],h=[K.fromData(c,p,G.storage,`cubes-a`),K.fromData(c,p,G.storage,`cubes-b`)],g=K.fromData(c,Ft,G.vertex,`particle-triangle-positions`),_=new Le(Ft.length/3).addVertexBuffer({buffer:g,arrayStride:12,attributes:[{shaderLocation:0,format:`float32x3`,offset:0}],slot:0,stepMode:`vertex`}),v=He.cube({size:2}),y=K.fromData(c,v.positions,G.vertex,`cube-positions`),b=K.fromData(c,v.normals,G.vertex,`cube-normals`),x=K.fromData(c,v.indices,G.index,`cube-indices`),S=new Le(v.positions.length/3).addVertexBuffer({buffer:y,arrayStride:12,attributes:[{shaderLocation:0,format:`float32x3`,offset:0}],slot:0,stepMode:`vertex`}).addVertexBuffer({buffer:b,arrayStride:12,attributes:[{shaderLocation:1,format:`float32x3`,offset:0}],slot:1,stepMode:`vertex`}).setIndexBuffer(x,v.indices.length,v.indices instanceof Uint32Array?`uint32`:`uint16`),C=K.create(c,K.uniformSize(_e.uniformByteSize()),G.uniform,`camera-uniforms`),w=new Float32Array(_e.uniformFloatCount),T=new _e(45*Gt,1,.1,300),E=new le(T,{listenerTarget:e,center:[0,0,0],radius:$*4,sensitivity:1,zoomSpeed:.8,panSpeed:.02});E.rx.setTo(-.22),E.ry.setTo(.72);let D=new pe(He.sphere({radius:Wt,segments:24}),T,[e.width,e.height],{listenerTarget:e}),O=Z,k=!0,A=pt();D.addEventListener(`onHit`,(e=>{let t=e.detail.hit;if(k){gt(A,t),k=!1;return}let n=pt();yt(n,t,A);let r=ht(n);if(r>.001&&r<$){let e=mt(n);vt(e,e);let i=O.strength*(r*500);l.addForce([t[0],t[1],t[2]],[e[0],e[1],e[2]],O.radius,i,1,O.noiseStrength)}gt(A,t)}));let ee=new ve(-1,1,-1,1,.1,100);ye({camera:ee,center:[0,0,0],radius:Ct({maxRadius:$,overshootMultiplier:Rt,billboardPadding:zt})+1,eye:Ht,up:Ut,padding:1});let j=K.create(c,K.uniformSize(ve.uniformByteSize()),G.uniform,`light-camera-uniforms`),M=new Float32Array(ve.uniformFloatCount);ee.writeUniformData(M),j.write(c,M);let N=new ve(-1,1,-1,1,.1,100);ye({camera:N,center:[0,0,0],radius:$,eye:[0,0,$*3],up:[0,1,0]});let P=K.create(c,Jt,G.uniform,`particle-sim-params`),F=K.create(c,Jt,G.uniform,`cube-sim-params`),te=Yt(Q),ne=Yt(Nt),re=new Y(c,At,{label:`ParticlesUpdate`,entryPoint:`cs_main`}),ie=(e,t,n,r,i)=>q.create(c,re.getBindGroupLayout(0),[{binding:0,resource:t},{binding:1,resource:e[n]},{binding:2,resource:e[r]},{binding:3,resource:l.velocity.view},{binding:4,resource:l.density.view}],`${i}-update-${n}-to-${r}`),I=ze(c,`ParticlesScene`),L=c.gpu.createBindGroupLayout({label:`ParticlesStorageLayout`,entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}}]}),R=c.gpu.createBindGroupLayout({label:`ParticlesShadowLayout`,entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:`depth`}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{type:`comparison`}}]}),z=c.gpu.createPipelineLayout({label:`ParticlesShadowPipelineLayout`,bindGroupLayouts:[I.bindGroupLayout,L]}),B=c.gpu.createPipelineLayout({label:`ParticlesPipelineLayout`,bindGroupLayouts:[I.bindGroupLayout,L,R]}),ae=new je(c,kt,{label:`ParticlesShadowDraw`,layout:z,vertexBuffers:_.getVertexLayouts(),...Pe({cullMode:`none`,depthFormat:`depth32float`})}),oe=new je(c,Dt,{label:`CubesShadowDraw`,layout:z,vertexBuffers:S.getVertexLayouts(),...Pe({cullMode:`back`,depthFormat:`depth32float`})}),se=new Ae(c,jt,{label:`ParticlesDraw`,layout:B,vertexBuffers:_.getVertexLayouts(),...Ne({cullMode:`none`,colorFormat:c.format})}),ce=new Ae(c,Mt,{label:`CubesDraw`,layout:B,vertexBuffers:S.getVertexLayouts(),...Ne({cullMode:`back`,colorFormat:c.format})}),ue=q.create(c,I.bindGroupLayout,C,0,`scene-bind-group`),de=q.create(c,I.bindGroupLayout,j,0,`light-scene-bind-group`),fe=m.map((e,t)=>q.create(c,L,[{binding:0,resource:e}],`particle-draw-${t}`)),me=h.map((e,t)=>q.create(c,L,[{binding:0,resource:e}],`cube-draw-${t}`)),he=Fe.create(c,{label:`ParticlesShadowMap`,size:Lt,format:`depth32float`}),ge=K.create(c,K.uniformSize(80),G.uniform,`shadow-uniforms`),V=new Float32Array(20);V.set(ee.getViewProjectionMatrix(),0),V[16]=Bt,V[17]=Lt,V[18]=Vt,ge.write(c,V);let xe=q.create(c,R,[{binding:0,resource:ge},{binding:1,resource:he.view},{binding:2,resource:he.sampler}],`shadow-bind-group`),H=null,U=0,W=0,Se=0,Ce=performance.now(),we=()=>{e.width===U&&e.height===W||(U=e.width,W=e.height,U>0&&W>0&&(T.setAspect(U/W),D.resolution=[U,W]))},Te=()=>{let t=e.width,n=e.height;return H&&H.width===t&&H.height===n?H.createView():(H?.destroy(),H=c.gpu.createTexture({label:`depth-texture`,size:[t,n],format:`depth24plus`,usage:GPUTextureUsage.RENDER_ATTACHMENT}),H.createView())},Ee=(e,t,n)=>{if(!O.showFluidSlice||!O.showSliceVelocity&&!O.showSliceDensity)return;let r=[{visible:O.showSliceDensity,plane:u,showVelocity:!1,showDensity:!0},{visible:O.showSliceVelocity,plane:d,showVelocity:!0,showDensity:!1}].filter(e=>e.visible),i=Math.max(140,Math.min(280,Math.floor(Math.min(t,n)*.24))),a=Math.max(14,n-i-14);for(let t=0;t<r.length;t++){let n=14+t*(i+10);e.setViewport(n,a,i,i,0,1),e.setScissorRect(n,a,i,i),r[t].plane.draw(e,l.velocity,l.density,N.getViewProjectionMatrix(),{showVelocity:r[t].showVelocity,showDensity:r[t].showDensity,densityGain:6,velocityThreshold:1.2})}},J=t=>{null?.begin(),c.resize(),we();let n=Math.min(1/30,Math.max(1/240,(t-Ce)/1e3));Ce=t;let r=t*.001;te.set(`time`,r).set(`dt`,n).writeToBuffer(P,c),ne.set(`time`,r).set(`dt`,n).writeToBuffer(F,c),T.writeUniformData(w),C.write(c,w);let i=1-Se,a=c.getCurrentTexture().createView(),o=Te(),s=c.gpu.createCommandEncoder({label:`fluid-particles-frame`});l.update(s,n);let u=s.beginComputePass({label:`update-particles`});re.dispatch(u,ie(m,P,Se,i,`particles`),Math.ceil(Q/Pt)),re.dispatch(u,ie(h,F,Se,i,`cubes`),Math.ceil(Nt/Pt)),u.end();let d=he.beginRenderPass(s);ae.draw(d,_,[de,fe[i]],Q),oe.draw(d,S,[de,me[i]],Nt),d.end();let f=Oe(s,a,{clearColor:{r:.015,g:.014,b:.012,a:1},depthStencilAttachment:{view:o,depthLoadOp:`clear`,depthClearValue:1,depthStoreOp:`store`}});se.draw(f,_,[ue,fe[i],xe],Q),ce.draw(f,S,[ue,me[i],xe],Nt),f.end();let p=Oe(s,a,{loadOp:`load`,depthStencilAttachment:{view:o,depthLoadOp:`clear`,depthClearValue:1,depthStoreOp:`store`}});Ee(p,e.width,e.height),p.end(),c.gpu.queue.submit([s.finish()]),Se=i,null?.end(),requestAnimationFrame(J)};window.addEventListener(`beforeunload`,()=>{D.disconnect(),E.destroy(),null?.destroy(),u.destroy(),d.destroy(),l.destroy(),H?.destroy(),C.destroy(),j.destroy(),P.destroy(),F.destroy(),ge.destroy(),he.destroy(),g.destroy(),y.destroy(),b.destroy(),x.destroy(),m.forEach(e=>e.destroy()),h.forEach(e=>e.destroy())}),requestAnimationFrame(J)}Xt().catch(e=>{console.error(e)});