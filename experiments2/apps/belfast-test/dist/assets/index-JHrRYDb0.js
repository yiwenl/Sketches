var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var l=window.requestAnimationFrame,u=60,d=1,f=0,p=0,m=0,h=0,g=0,_=new Map,v=[],y=new Set,b=[],x=[],S=!1,C=0;function w(e){return _.delete(e)}function T(e){if(e<=0||!Number.isFinite(e))throw Error(`Frame rate must be a positive number`);u=e,l=e=>{requestAnimationFrame((t=>{let n=1e3/u,r=t-m;r>=n?e(t):setTimeout((()=>l(e)),n-r)}))}}function E(e=!1){if(S&&!e)return;let t,n=0;for(let[e,t]of _)t?.func(t.args);for(;b.length>0;)t=b.pop(),t.func(t.args);for(n=0;n<v.length;n++)t=v[n],f-t.time>t.delay/d&&(t.func(t.args),t.repeat?t.time=f:(v.splice(n,1),n--));let r=performance.now();for(;y.length>0;){if(t=y.shift(),!(performance.now()-r<1e3/u*d)){y.unshift(t);break}t.func(t.args)}}function D(e){m=f,e===void 0?(g+=1e3/u*d,f=g):(S||(h===0&&(h=e),g+=e-h,h=e),f=g),p=f-m,b=b.concat(x),x=[]}f=performance.now(),function e(t){E(),D(t),l(e)}(f);var O={addEF:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for enterframe task.`);let n=++C;return _.set(n,{func:e,args:t}),{id:n,cancel:()=>{w(n)}}},removeEF:w,delay:function(e,t,n,r=!1){if(typeof e!=`function`)throw Error(`Invalid function provided for delayed task.`);let i=++C,a={id:i,func:e,args:n,delay:t,time:f,repeat:r,cancelled:!1};return v.push(a),{cancel:()=>{let e=v.findIndex((e=>e.id===i));e!==-1&&v.splice(e,1)}}},next:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for next frame task.`);x.push({func:e,args:t})},defer:function(e,t){if(typeof e!=`function`)throw Error(`Invalid function provided for deferred task.`);y.add({func:e,args:t})},getTime:function(){return f/1e3},getDeltaTime:function(){return p},setFrameRate:T,setTimeScale:function(e){if(e<0||!Number.isFinite(e))throw Error(`Time scale must be a non-negative number`);d=e,T(u*d)},getTimeScale:function(){return d},setEnterframeFunc:function(e){l=e},step:function(){E(!0),D()},pause:function(){S=!0,h=0},resume:function(){S=!1},isPaused:function(){return S},removeAllTasks:function(){_.clear(),v.length=0,y.clear(),b.length=0,x.length=0,g=0,f=0}},k=Object.defineProperty,A=(e,t,n)=>t in e?k(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,j=(e,t,n)=>A(e,typeof t==`symbol`?t:t+``,n),M=1e-6,N=typeof Float32Array<`u`?Float32Array:Array;function P(){var e=new N(16);return N!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function ee(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function te(e,t,n){var r=t[0],i=t[1],a=t[2],o=t[3],s=t[4],c=t[5],l=t[6],u=t[7],d=t[8],f=t[9],p=t[10],m=t[11],h=t[12],g=t[13],_=t[14],v=t[15],y=n[0],b=n[1],x=n[2],S=n[3];return e[0]=y*r+b*s+x*d+S*h,e[1]=y*i+b*c+x*f+S*g,e[2]=y*a+b*l+x*p+S*_,e[3]=y*o+b*u+x*m+S*v,y=n[4],b=n[5],x=n[6],S=n[7],e[4]=y*r+b*s+x*d+S*h,e[5]=y*i+b*c+x*f+S*g,e[6]=y*a+b*l+x*p+S*_,e[7]=y*o+b*u+x*m+S*v,y=n[8],b=n[9],x=n[10],S=n[11],e[8]=y*r+b*s+x*d+S*h,e[9]=y*i+b*c+x*f+S*g,e[10]=y*a+b*l+x*p+S*_,e[11]=y*o+b*u+x*m+S*v,y=n[12],b=n[13],x=n[14],S=n[15],e[12]=y*r+b*s+x*d+S*h,e[13]=y*i+b*c+x*f+S*g,e[14]=y*a+b*l+x*p+S*_,e[15]=y*o+b*u+x*m+S*v,e}function F(e,t,n,r,i){var a=1/Math.tan(t/2);if(e[0]=a/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i!=null&&i!==1/0){var o=1/(r-i);e[10]=i*o,e[14]=i*r*o}else e[10]=-1,e[14]=-r;return e}function I(e,t,n,r){var i,a,o,s,c,l,u,d,f,p,m=t[0],h=t[1],g=t[2],_=r[0],v=r[1],y=r[2],b=n[0],x=n[1],S=n[2];return Math.abs(m-b)<M&&Math.abs(h-x)<M&&Math.abs(g-S)<M?ee(e):(u=m-b,d=h-x,f=g-S,p=1/Math.sqrt(u*u+d*d+f*f),u*=p,d*=p,f*=p,i=v*f-y*d,a=y*u-_*f,o=_*d-v*u,p=Math.sqrt(i*i+a*a+o*o),p?(p=1/p,i*=p,a*=p,o*=p):(i=0,a=0,o=0),s=d*o-f*a,c=f*i-u*o,l=u*a-d*i,p=Math.sqrt(s*s+c*c+l*l),p?(p=1/p,s*=p,c*=p,l*=p):(s=0,c=0,l=0),e[0]=i,e[1]=s,e[2]=u,e[3]=0,e[4]=a,e[5]=c,e[6]=d,e[7]=0,e[8]=o,e[9]=l,e[10]=f,e[11]=0,e[12]=-(i*m+a*h+o*g),e[13]=-(s*m+c*h+l*g),e[14]=-(u*m+d*h+f*g),e[15]=1,e)}function L(){var e=new N(3);return N!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function R(e){var t=new N(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function z(e,t,n){var r=new N(3);return r[0]=e,r[1]=t,r[2]=n,r}function B(e,t,n,r){return e[0]=t,e[1]=n,e[2]=r,e}function ne(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e}function V(e,t){var n=t[0],r=t[1],i=t[2],a=n*n+r*r+i*i;return a>0&&(a=1/Math.sqrt(a)),e[0]=t[0]*a,e[1]=t[1]*a,e[2]=t[2]*a,e}function re(e,t,n){var r=t[0],i=t[1],a=t[2],o=n[0],s=n[1],c=n[2];return e[0]=i*c-a*s,e[1]=a*o-r*c,e[2]=r*s-i*o,e}var ie=ne;(function(){var e=L();return function(t,n,r,i,a,o){var s,c;for(n||=3,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2];return t}})();var ae=class{constructor(e,t=.1){j(this,`easing`),j(this,`_value`),j(this,`_targetValue`),j(this,`_min`),j(this,`_max`),j(this,`_efIndex`),this.easing=t,this._value=e,this._targetValue=e,this._efIndex=O.addEF(()=>this._update())}_update(){this._checkLimit(),this._value+=(this._targetValue-this._value)*this.easing,Math.abs(this._targetValue-this._value)<1e-4&&(this._value=this._targetValue)}setTo(e){this._targetValue=this._value=e,this._checkLimit(),this._value=this._targetValue}add(e){this._targetValue+=e,this._checkLimit()}limit(e,t){if(e>t){this.limit(t,e);return}this._min=e,this._max=t,this._checkLimit()}_checkLimit(){this._min!==void 0&&this._targetValue<this._min&&(this._targetValue=this._min),this._max!==void 0&&this._targetValue>this._max&&(this._targetValue=this._max)}destroy(){O.removeEF(this._efIndex)}set value(e){this._targetValue=e}get value(){return this._value}get targetValue(){return this._targetValue}};function H(e,t){return`touches`in e&&e.touches.length>0?(t.x=e.touches[0].pageX,t.y=e.touches[0].pageY):`clientX`in e&&(t.x=e.clientX,t.y=e.clientY),t}function oe(e){let t=e.deltaY;switch(e.deltaMode){case WheelEvent.DOM_DELTA_LINE:t*=16;break;case WheelEvent.DOM_DELTA_PAGE:t*=100;break}return-t/120}var se=class{constructor(e,t={}){j(this,`radius`),j(this,`position`,L()),j(this,`positionOffset`,L()),j(this,`center`),j(this,`sensitivity`,1),j(this,`zoomSpeed`,1),j(this,`panSpeed`,.01),j(this,`_camera`),j(this,`_listenerTarget`),j(this,`_up`),j(this,`_rx`),j(this,`_ry`),j(this,`_mouse`,{x:0,y:0}),j(this,`_preMouse`,{x:0,y:0}),j(this,`_panCenterStart`,L()),j(this,`_eye`,L()),j(this,`_forward`,L()),j(this,`_right`,L()),j(this,`_camUp`,L()),j(this,`_efIndex`),j(this,`_preRX`,0),j(this,`_preRY`,0),j(this,`_isLockZoom`,!1),j(this,`_isLockRotation`,!1),j(this,`_isLockPan`,!1),j(this,`_isInvert`,!1),j(this,`_isMouseDown`,!1),j(this,`_isPanning`,!1),j(this,`_destroyed`,!1),j(this,`_wheelBind`),j(this,`_downBind`),j(this,`_moveBind`),j(this,`_upBind`),this._camera=e,this._listenerTarget=t.listenerTarget??document.body,this.center=t.center?z(t.center[0],t.center[1],t.center[2]):L(),this._up=t.up?z(t.up[0],t.up[1],t.up[2]):z(0,1,0),this.sensitivity=t.sensitivity??1,this.zoomSpeed=t.zoomSpeed??1,this.panSpeed=t.panSpeed??.01;let n=t.radius??10;this.radius=new ae(n),this.position[2]=this.radius.value,this._rx=new ae(0),this._rx.limit(-Math.PI/2,Math.PI/2),this._ry=new ae(0),this._wheelBind=e=>this._onWheel(e),this._downBind=e=>this._onDown(e),this._moveBind=e=>this._onMove(e),this._upBind=()=>this._onUp(),this.connect(),this._efIndex=O.addEF(()=>this._loop())}connect(){this.disconnect(),this._listenerTarget.addEventListener(`wheel`,this._wheelBind,{passive:!1}),this._listenerTarget.addEventListener(`mousedown`,this._downBind),this._listenerTarget.addEventListener(`touchstart`,this._downBind,{passive:!1}),this._listenerTarget.addEventListener(`mousemove`,this._moveBind),this._listenerTarget.addEventListener(`touchmove`,this._moveBind,{passive:!1}),window.addEventListener(`touchend`,this._upBind),window.addEventListener(`mouseup`,this._upBind)}disconnect(){this._listenerTarget.removeEventListener(`wheel`,this._wheelBind),this._listenerTarget.removeEventListener(`mousedown`,this._downBind),this._listenerTarget.removeEventListener(`touchstart`,this._downBind),this._listenerTarget.removeEventListener(`mousemove`,this._moveBind),this._listenerTarget.removeEventListener(`touchmove`,this._moveBind),window.removeEventListener(`touchend`,this._upBind),window.removeEventListener(`mouseup`,this._upBind)}destroy(){this._destroyed||(this._destroyed=!0,this.disconnect(),O.removeEF(this._efIndex),this.radius.destroy(),this._rx.destroy(),this._ry.destroy())}lock(e=!0){this._isLockZoom=e,this._isLockRotation=e,this._isLockPan=e,this._isMouseDown=!1,this._isPanning=!1}lockZoom(e=!0){this._isLockZoom=e}lockRotation(e=!0){this._isLockRotation=e}lockPan(e=!0){this._isLockPan=e}inverseControl(e=!0){this._isInvert=e}update(){this._updatePosition()}get rx(){return this._rx}get ry(){return this._ry}_loop(){this._destroyed||(this._updatePosition(),this._updateCamera())}_updatePosition(){let e=this._rx.value,t=this._ry.value,n=this.radius.value;this.position[1]=Math.sin(e)*n;let r=Math.cos(e)*n;this.position[0]=Math.cos(t+Math.PI*.5)*r,this.position[2]=Math.sin(t+Math.PI*.5)*r,this.position[0]+=this.positionOffset[0],this.position[1]+=this.positionOffset[1],this.position[2]+=this.positionOffset[2]}_updateCamera(){this._camera.lookAt(this.position,this.center,this._up)}_isPanInput(e){return`button`in e?e.button===1||e.button===0&&e.shiftKey:!1}_panByPixels(e,t){this._updatePosition(),B(this._eye,this.position[0],this.position[1],this.position[2]),ie(this._forward,this.center,this._eye),V(this._forward,this._forward),re(this._right,this._forward,this._up),V(this._right,this._right),re(this._camUp,this._right,this._forward),V(this._camUp,this._camUp);let n=this.panSpeed*this.sensitivity;this.center[0]=this._panCenterStart[0]-this._right[0]*e*n+this._camUp[0]*t*n,this.center[1]=this._panCenterStart[1]-this._right[1]*e*n+this._camUp[1]*t*n,this.center[2]=this._panCenterStart[2]-this._right[2]*e*n+this._camUp[2]*t*n}_onDown(e){if(H(e,this._mouse),H(e,this._preMouse),this._isPanInput(e)&&!this._isLockPan){this._isPanning=!0,this._isMouseDown=!1,this._panCenterStart[0]=this.center[0],this._panCenterStart[1]=this.center[1],this._panCenterStart[2]=this.center[2];return}this._isLockRotation||(this._isPanning=!1,this._isMouseDown=!0,this._preRX=this._rx.targetValue,this._preRY=this._ry.targetValue)}_onMove(e){if(H(e,this._mouse),`touches`in e&&e.preventDefault(),this._isPanning){if(this._isLockPan)return;let e=this._mouse.x-this._preMouse.x,t=this._mouse.y-this._preMouse.y;this._panByPixels(e,t);return}if(this._isLockRotation||!this._isMouseDown)return;let t=-(this._mouse.x-this._preMouse.x);this._isInvert&&(t*=-1),this._ry.value=this._preRY-t*.01*this.sensitivity;let n=-(this._mouse.y-this._preMouse.y);this._isInvert&&(n*=-1),this._rx.value=this._preRX-n*.01*this.sensitivity}_onUp(){this._isMouseDown=!1,this._isPanning=!1}_onWheel(e){if(this._isLockZoom)return;e.preventDefault();let t=oe(e)*this.zoomSpeed;this.radius.add(-t*2),this.radius.targetValue<0&&this.radius.setTo(1e-4)}},ce=z(0,1,0),le=class e{constructor(){j(this,`viewMatrix`),j(this,`projectionMatrix`),j(this,`viewProjectionMatrix`),j(this,`position`,z(0,0,1)),j(this,`target`,z(0,0,0)),j(this,`up`,L()),this.viewMatrix=P(),this.projectionMatrix=P(),this.viewProjectionMatrix=P(),ee(this.projectionMatrix),this.lookAt(this.position,this.target)}static uniformByteSize(){return e.uniformFloatCount*4}lookAt(e,t,n=ce){return B(this.position,e[0],e[1],e[2]),B(this.target,t[0],t[1],t[2]),B(this.up,n[0],n[1],n[2]),I(this.viewMatrix,this.position,this.target,this.up),this}getViewMatrix(){return this.viewMatrix}getProjectionMatrix(){return this.projectionMatrix}getViewProjectionMatrix(e){let t=e??this.viewProjectionMatrix;return te(t,this.projectionMatrix,this.viewMatrix),t}writeUniformData(t,n=0){if(t.length<n+e.uniformFloatCount)throw Error(`Camera uniform target is too small. Need at least ${n+e.uniformFloatCount} floats.`);this.getViewProjectionMatrix(this.viewProjectionMatrix),t.set(this.viewProjectionMatrix,n);let r=this.viewMatrix;return t[n+16]=r[0],t[n+17]=r[4],t[n+18]=r[8],t[n+19]=0,t[n+20]=r[1],t[n+21]=r[5],t[n+22]=r[9],t[n+23]=0,t}getPosition(){return R(this.position)}getLookAtTarget(){return R(this.target)}getFieldOfView(){}updateProjection(){}};j(le,`uniformFloatCount`,24);var ue=le,de=class extends ue{constructor(e,t,n,r){super(),j(this,`fov`,Math.PI/4),j(this,`aspect`,1),j(this,`near`,.1),j(this,`far`,100),this.setPerspective(e,t,n,r)}setPerspective(e,t,n,r){return this.fov=e,this.aspect=t,this.near=n,this.far=r,F(this.getProjectionMatrix(),e,t,n,r),this}setAspect(e){return this.aspect=e,this.updateProjection(),this}getFieldOfView(){return this.fov}getAspect(){return this.aspect}getNear(){return this.near}getFar(){return this.far}updateProjection(){this.setPerspective(this.fov,this.aspect,this.near,this.far)}},fe=class e{constructor(e,t,n,r,i,a,o){j(this,`canvas`),j(this,`context`),j(this,`device`),j(this,`format`),j(this,`colorSpace`),j(this,`toneMappingMode`),j(this,`hdr`),this.canvas=e,this.context=t,this.device=n,this.format=r,this.colorSpace=i,this.toneMappingMode=a,this.hdr=o}get gpu(){return this.device}static async isSupported(){return navigator.gpu?await navigator.gpu.requestAdapter()!==null:!1}static async create(t,n={}){if(!navigator.gpu)throw Error(`WebGPU is not supported in this browser.`);let r=await navigator.gpu.requestAdapter({powerPreference:n.powerPreference});if(!r)throw Error(`Failed to request WebGPU adapter.`);let i=await r.requestDevice(),a=t.getContext(`webgpu`);if(!a)throw Error(`Failed to get WebGPU canvas context.`);let o=n.hdr??!1,s=n.colorSpace??`srgb`,c=n.toneMappingMode??(o?`extended`:`standard`),l=o?`rgba16float`:navigator.gpu.getPreferredCanvasFormat();return a.configure({device:i,format:l,alphaMode:n.alpha===!1?`opaque`:`premultiplied`,colorSpace:s,toneMapping:{mode:c}}),new e(t,a,i,l,s,c,o)}resize(e,t){let n=e??this.canvas.clientWidth,r=t??this.canvas.clientHeight;(this.canvas.width!==n||this.canvas.height!==r)&&(this.canvas.width=Math.max(1,n),this.canvas.height=Math.max(1,r))}getCurrentTexture(){return this.context.getCurrentTexture()}destroy(){this.device.destroy()}};function pe(e,t,n){return e.gpu.createShaderModule({code:t,label:n})}function me(e,t){return e.gpu.createRenderPipeline(t)}function he(e,t){return e.gpu.createComputePipeline(t)}function ge(e,t,n,r=0){if(n instanceof ArrayBuffer){e.gpu.queue.writeBuffer(t,r,n);return}e.gpu.queue.writeBuffer(t,r,n.buffer,n.byteOffset,n.byteLength)}var U={vertex:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,index:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,storage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,uniform:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,vertexStorage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST},W=class e{constructor(e,t,n,r){j(this,`gpu`),j(this,`size`),j(this,`usage`),j(this,`label`),this.gpu=e,this.size=t,this.usage=n,this.label=r}static uniformSize(e){return Math.ceil(e/16)*16}static create(t,n,r,i){return new e(t.gpu.createBuffer({size:n,usage:r,label:i}),n,r,i)}static fromData(t,n,r,i){let a=n.byteLength,o=e.create(t,a,r,i);return o.write(t,n),o}write(e,t,n=0){ge(e,this.gpu,t,n)}destroy(){this.gpu.destroy()}};function _e(e){return e instanceof W?{buffer:e.gpu}:e}var G=class e{constructor(e){j(this,`gpu`),this.gpu=e}static create(t,n,r,i=0,a){if(r instanceof W){let o=typeof i==`number`?i:0,s=typeof i==`string`?i:a;return e.createFromEntries(t,n,[{binding:o,resource:r}],s)}let o=typeof i==`string`?i:a;return e.createFromEntries(t,n,r,o)}static createFromEntries(t,n,r,i){return new e(t.gpu.createBindGroup({label:i,layout:n,entries:r.map(({binding:e,resource:t})=>({binding:e,resource:_e(t)}))}))}bind(e,t=0){e.setBindGroup(t,this.gpu)}},ve=class e{constructor(e,t,n,r,i){j(this,`width`),j(this,`height`),j(this,`view`),j(this,`sampler`),j(this,`gpu`),this.gpu=e,this.view=t,this.sampler=n,this.width=r,this.height=i}static async load(t,n,r={}){let i=await fetch(n);if(!i.ok)throw Error(`Failed to load texture from ${n}: ${i.status} ${i.statusText}`);let a=await i.blob(),o=await createImageBitmap(a);try{return e.fromBitmap(t,o,r)}finally{o.close()}}static fromBitmap(t,n,r={}){let i=r.label??`Texture`,a=r.format??`rgba8unorm`,o=n.width,s=n.height;if(o<=0||s<=0)throw Error(`Texture source must have positive width and height.`);let c=t.gpu.createTexture({label:i,size:[o,s,1],format:a,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT}),l=r.flipY??!0;return t.gpu.queue.copyExternalImageToTexture({source:n,flipY:l},{texture:c},[o,s]),new e(c,c.createView({label:`${i}View`}),t.gpu.createSampler({label:`${i}Sampler`,addressModeU:r.addressModeU??`clamp-to-edge`,addressModeV:r.addressModeV??`clamp-to-edge`,magFilter:r.magFilter??`linear`,minFilter:r.minFilter??`linear`}),o,s)}destroy(){this.gpu.destroy()}};function ye(e,t,n={}){let{clearColor:r={r:.05,g:.05,b:.08,a:1},loadOp:i=`clear`,storeOp:a=`store`,depthStencilAttachment:o}=n,s=`colorView`in t?t.colorView:t,c=o??(`colorView`in t&&t.depthView?{view:t.depthView,depthLoadOp:`clear`,depthClearValue:1,depthStoreOp:`store`}:void 0);return e.beginRenderPass({colorAttachments:[{view:s,clearValue:r,loadOp:i,storeOp:a}],depthStencilAttachment:c})}var be=class{constructor(e,t,n={}){j(this,`pipeline`);let{label:r=`Draw`,layout:i=`auto`,primitive:a={topology:`triangle-list`},depthStencil:o,targets:s=[{format:e.format}],vertexBuffers:c=[]}=typeof n==`string`?{label:n}:n,l=pe(e,t,`${r}Shader`);this.pipeline=me(e,{label:`${r}Pipeline`,layout:i,vertex:{module:l,entryPoint:`vs_main`,buffers:c},fragment:{module:l,entryPoint:`fs_main`,targets:s},primitive:a,depthStencil:o})}getBindGroupLayout(e=0){return this.pipeline.getBindGroupLayout(e)}draw(e,t,n,r=1){if(e.setPipeline(this.pipeline),n){let t=Array.isArray(n)?n:[n];for(let n=0;n<t.length;n++)t[n].bind(e,n)}typeof t==`number`?e.draw(t,r):(t.bind(e),t.hasIndexBuffer()?e.drawIndexed(t.getIndexCount(),r):e.draw(t.vertexCount,r))}},xe=class{constructor(e,t,n={}){j(this,`pipeline`);let{label:r=`Compute`,layout:i=`auto`,entryPoint:a=`cs_main`}=typeof n==`string`?{label:n}:n,o=pe(e,t,`${r}Shader`);this.pipeline=he(e,{label:`${r}Pipeline`,layout:i,compute:{module:o,entryPoint:a}})}getBindGroupLayout(e=0){return this.pipeline.getBindGroupLayout(e)}dispatch(e,t,n=1){if(e.setPipeline(this.pipeline),t){let n=Array.isArray(t)?t:[t];for(let t=0;t<n.length;t++)e.setBindGroup(t,n[t].gpu)}typeof n==`number`?e.dispatchWorkgroups(n):e.dispatchWorkgroups(n[0],n[1]??1,n[2]??1)}run(e,t,n=1,r){let i=e.beginComputePass(r?{label:r}:void 0);this.dispatch(i,t,n),i.end()}},Se=class{constructor(e){if(j(this,`vertexCount`),j(this,`bindings`,[]),j(this,`indexBuffer`),j(this,`indexCount`,0),j(this,`indexFormat`,`uint16`),e<=0)throw Error(`Mesh vertexCount must be greater than 0.`);this.vertexCount=e}addVertexBuffer(e){let t=e.slot??this.nextFreeSlot();if(this.bindings.some(e=>e.slot===t))throw Error(`Vertex buffer slot ${t} is already in use.`);return this.bindings.push({...e,slot:t}),this}getVertexLayouts(){if(this.bindings.length===0)return[];let e=Math.max(...this.bindings.map(e=>e.slot)),t=Array.from({length:e+1},()=>null);for(let e of this.bindings)t[e.slot]={arrayStride:e.arrayStride,stepMode:e.stepMode??`vertex`,attributes:e.attributes.map(e=>({shaderLocation:e.shaderLocation,format:e.format,offset:e.offset}))};return t}bind(e){for(let t of this.bindings)e.setVertexBuffer(t.slot,t.buffer.gpu);this.indexBuffer&&e.setIndexBuffer(this.indexBuffer.gpu,this.indexFormat)}setIndexBuffer(e,t,n=`uint16`){if(t<=0)throw Error(`Mesh index count must be greater than 0.`);return this.indexBuffer=e,this.indexCount=t,this.indexFormat=n,this}setIndexBufferFromData(e,t,n=`mesh-indices`){let r=t instanceof Uint32Array?`uint32`:`uint16`,i=W.fromData(e,t,U.index,n);return this.setIndexBuffer(i,t.length,r),i}hasIndexBuffer(){return this.indexBuffer!==void 0}getIndexCount(){return this.indexCount}nextFreeSlot(){let e=new Set(this.bindings.map(e=>e.slot)),t=0;for(;e.has(t);)t++;return t}};function Ce(e,t=`SceneUniformBindGroupLayout`){return e.gpu.createBindGroupLayout({label:t,entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}}]})}function we(e,t=`SceneUniformPipelineLayout`){let n=Ce(e,`${t}BindGroup`);return{pipelineLayout:e.gpu.createPipelineLayout({label:t,bindGroupLayouts:[n]}),bindGroupLayout:n}}var Te=`
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0),
  );
  let pos = positions[vertexIndex];
  output.position = vec4<f32>(pos, 0.0, 1.0);
  output.uv = vec2<f32>(pos.x * 0.5 + 0.5, -pos.y * 0.5 + 0.5);
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  return textureSample(sourceTexture, sourceSampler, input.uv);
}
`,Ee=class{constructor(e,t={}){j(this,`device`),j(this,`drawPass`),j(this,`bindGroupLayout`),j(this,`cachedTextureView`),j(this,`cachedSampler`),j(this,`cachedBindGroup`),this.device=e;let n=t.label??`CopyHelper`;this.drawPass=new be(e,Te,{label:n,targets:t.targets??[{format:e.format}],primitive:{topology:`triangle-list`,cullMode:`none`},depthStencil:t.depthStencil}),this.bindGroupLayout=this.drawPass.getBindGroupLayout(0)}draw(e,t,n,r={}){(!this.cachedBindGroup||this.cachedTextureView!==t||this.cachedSampler!==n)&&(this.cachedTextureView=t,this.cachedSampler=n,this.cachedBindGroup=G.create(this.device,this.bindGroupLayout,[{binding:0,resource:t},{binding:1,resource:n}],`copy-helper-bind-group`)),(r.x!==void 0||r.y!==void 0||r.width!==void 0||r.height!==void 0)&&(e.setViewport(r.x??0,r.y??0,r.width??this.device.canvas.width,r.height??this.device.canvas.height,0,1),e.setScissorRect(Math.floor(r.x??0),Math.floor(r.y??0),Math.floor(r.width??this.device.canvas.width),Math.floor(r.height??this.device.canvas.height))),this.drawPass.draw(e,3,this.cachedBindGroup)}};function De(e,t,n=1,r=`xy`){let i=[],a=[],o=e/n,s=t/n,c=1/n,l=-e*.5,u=-t*.5;function d(e,t,n,r,o,s){for(let r of[e,t,n])i.push(r[0],r[1],r[2]);for(let e of[r,o,s])a.push(e[0],e[1])}for(let e=0;e<n;e++)for(let t=0;t<n;t++){let i=o*e+l,a=s*t+u,f=e/n,p=t/n,m,h,g,_,v,y,b,x;r===`xz`?(m=[i,0,a+s],h=[i+o,0,a+s],g=[i+o,0,a],_=[i,0,a],v=[f,1-(p+c)],y=[f+c,1-(p+c)],b=[f+c,1-p],x=[f,1-p]):r===`yz`?(m=[0,a,i],h=[0,a,i+o],g=[0,a+s,i+o],_=[0,a+s,i],v=[f,p],y=[f+c,p],b=[f+c,p+c],x=[f,p+c]):(m=[i,a,0],h=[i+o,a,0],g=[i+o,a+s,0],_=[i,a+s,0],v=[f,p],y=[f+c,p],b=[f+c,p+c],x=[f,p+c]),d(m,h,g,v,y,b),d(m,g,_,v,b,x)}return{positions:new Float32Array(i),uvs:new Float32Array(a)}}function Oe(e=document.body){let t=document.createElement(`div`);t.style.cssText=`position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:2rem;font:16px/1.5 system-ui,sans-serif;background:#111;color:#eee;text-align:center;`,t.textContent=`WebGPU is not available in this browser. Try the latest Chrome, Edge, or Safari.`,e.appendChild(t)}async function ke(){if(!await fe.isSupported())throw Oe(),Error(`WebGPU is not supported.`)}var Ae=c(o(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?t.exports=r():typeof define==`function`&&define.amd?define(r):n.Stats=r()})(e,function(){var e=function(){function t(e){return i.appendChild(e.dom),e}function n(e){for(var t=0;t<i.children.length;t++)i.children[t].style.display=t===e?`block`:`none`;r=e}var r=0,i=document.createElement(`div`);i.style.cssText=`position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000`,i.addEventListener(`click`,function(e){e.preventDefault(),n(++r%i.children.length)},!1);var a=(performance||Date).now(),o=a,s=0,c=t(new e.Panel(`FPS`,`#0ff`,`#002`)),l=t(new e.Panel(`MS`,`#0f0`,`#020`));if(self.performance&&self.performance.memory)var u=t(new e.Panel(`MB`,`#f08`,`#201`));return n(0),{REVISION:16,dom:i,addPanel:t,showPanel:n,begin:function(){a=(performance||Date).now()},end:function(){s++;var e=(performance||Date).now();if(l.update(e-a,200),e>o+1e3&&(c.update(1e3*s/(e-o),100),o=e,s=0,u)){var t=performance.memory;u.update(t.usedJSHeapSize/1048576,t.jsHeapSizeLimit/1048576)}return e},update:function(){a=this.end()},domElement:i,setMode:n}};return e.Panel=function(e,t,n){var r=1/0,i=0,a=Math.round,o=a(window.devicePixelRatio||1),s=80*o,c=48*o,l=3*o,u=2*o,d=3*o,f=15*o,p=74*o,m=30*o,h=document.createElement(`canvas`);h.width=s,h.height=c,h.style.cssText=`width:80px;height:48px`;var g=h.getContext(`2d`);return g.font=`bold `+9*o+`px Helvetica,Arial,sans-serif`,g.textBaseline=`top`,g.fillStyle=n,g.fillRect(0,0,s,c),g.fillStyle=t,g.fillText(e,l,u),g.fillRect(d,f,p,m),g.fillStyle=n,g.globalAlpha=.9,g.fillRect(d,f,p,m),{dom:h,update:function(c,_){r=Math.min(r,c),i=Math.max(i,c),g.fillStyle=n,g.globalAlpha=1,g.fillRect(0,0,s,f),g.fillStyle=t,g.fillText(a(c)+` `+e+` (`+a(r)+`-`+a(i)+`)`,l,u),g.drawImage(h,d+o,f,p-o,m,d,f,p-o,m),g.fillRect(d+p-o,f,o,m),g.fillStyle=n,g.globalAlpha=.9,g.fillRect(d+p-o,f,o,a((1-c/_)*m))}}},e})}))(),1),K=class e{constructor(t,n,r,i,a=`div`){this.parent=t,this.object=n,this.property=r,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(a),this.domElement.classList.add(`controller`),this.domElement.classList.add(i),this.$name=document.createElement(`div`),this.$name.classList.add(`name`),e.nextNameID=e.nextNameID||0,this.$name.id=`lil-gui-name-${++e.nextNameID}`,this.$widget=document.createElement(`div`),this.$widget.classList.add(`widget`),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener(`keydown`,e=>e.stopPropagation()),this.domElement.addEventListener(`keyup`,e=>e.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(r)}name(e){return this._name=e,this.$name.textContent=e,this}onChange(e){return this._onChange=e,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(e=!0){return this.disable(!e)}disable(e=!0){return e===this._disabled?this:(this._disabled=e,this.domElement.classList.toggle(`disabled`,e),this.$disable.toggleAttribute(`disabled`,e),this)}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}options(e){let t=this.parent.add(this.object,this.property,e);return t.name(this._name),this.destroy(),t}min(e){return this}max(e){return this}step(e){return this}decimals(e){return this}listen(e=!0){return this._listening=e,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);let e=this.save();e!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=e}getValue(){return this.object[this.property]}setValue(e){return this.getValue()!==e&&(this.object[this.property]=e,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(e){return this.setValue(e),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}},je=class extends K{constructor(e,t,n){super(e,t,n,`boolean`,`label`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`checkbox`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener(`change`,()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}};function Me(e){let t,n;return(t=e.match(/(#|0x)?([a-f0-9]{6})/i))?n=t[2]:(t=e.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?n=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=e.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(n=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),n?`#`+n:!1}var Ne={isPrimitive:!0,match:e=>typeof e==`string`,fromHexString:Me,toHexString:Me},q={isPrimitive:!0,match:e=>typeof e==`number`,fromHexString:e=>parseInt(e.substring(1),16),toHexString:e=>`#`+e.toString(16).padStart(6,0)},Pe=[Ne,q,{isPrimitive:!1,match:e=>Array.isArray(e),fromHexString(e,t,n=1){let r=q.fromHexString(e);t[0]=(r>>16&255)/255*n,t[1]=(r>>8&255)/255*n,t[2]=(r&255)/255*n},toHexString([e,t,n],r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return q.toHexString(i)}},{isPrimitive:!1,match:e=>Object(e)===e,fromHexString(e,t,n=1){let r=q.fromHexString(e);t.r=(r>>16&255)/255*n,t.g=(r>>8&255)/255*n,t.b=(r&255)/255*n},toHexString({r:e,g:t,b:n},r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return q.toHexString(i)}}];function Fe(e){return Pe.find(t=>t.match(e))}var Ie=class extends K{constructor(e,t,n,r){super(e,t,n,`color`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`color`),this.$input.setAttribute(`tabindex`,-1),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$text=document.createElement(`input`),this.$text.setAttribute(`type`,`text`),this.$text.setAttribute(`spellcheck`,`false`),this.$text.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`display`),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=Fe(this.initialValue),this._rgbScale=r,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener(`input`,()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$text.addEventListener(`input`,()=>{let e=Me(this.$text.value);e&&this._setValueFromHexString(e)}),this.$text.addEventListener(`focus`,()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener(`blur`,()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(e){if(this._format.isPrimitive){let t=this._format.fromHexString(e);this.setValue(t)}else this._format.fromHexString(e,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(e){return this._setValueFromHexString(e),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}},Le=class extends K{constructor(e,t,n){super(e,t,n,`function`),this.$button=document.createElement(`button`),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener(`click`,e=>{e.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$disable=this.$button}},Re=class extends K{constructor(e,t,n,r,i,a){super(e,t,n,`number`),this._initInput(),this.min(r),this.max(i);let o=a!==void 0;this.step(o?a:this._getImplicitStep(),o),this.updateDisplay()}decimals(e){return this._decimals=e,this.updateDisplay(),this}min(e){return this._min=e,this._onUpdateMinMax(),this}max(e){return this._max=e,this._onUpdateMinMax(),this}step(e,t=!0){return this._step=e,this._stepExplicit=t,this}updateDisplay(){let e=this.getValue();if(this._hasSlider){let t=(e-this._min)/(this._max-this._min);t=Math.max(0,Math.min(t,1)),this.$fill.style.width=t*100+`%`}return this._inputFocused||(this.$input.value=this._decimals===void 0?e:e.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),window.matchMedia(`(pointer: coarse)`).matches&&(this.$input.setAttribute(`type`,`number`),this.$input.setAttribute(`step`,`any`)),this.$widget.appendChild(this.$input),this.$disable=this.$input;let e=()=>{let e=parseFloat(this.$input.value);isNaN(e)||(this._stepExplicit&&(e=this._snap(e)),this.setValue(this._clamp(e)))},t=e=>{let t=parseFloat(this.$input.value);isNaN(t)||(this._snapClampSetValue(t+e),this.$input.value=this.getValue())},n=e=>{e.key===`Enter`&&this.$input.blur(),e.code===`ArrowUp`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e))),e.code===`ArrowDown`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e)*-1))},r=e=>{this._inputFocused&&(e.preventDefault(),t(this._step*this._normalizeMouseWheel(e)))},i=!1,a,o,s,c,l,u=e=>{a=e.clientX,o=s=e.clientY,i=!0,c=this.getValue(),l=0,window.addEventListener(`mousemove`,d),window.addEventListener(`mouseup`,f)},d=e=>{if(i){let t=e.clientX-a,n=e.clientY-o;Math.abs(n)>5?(e.preventDefault(),this.$input.blur(),i=!1,this._setDraggingStyle(!0,`vertical`)):Math.abs(t)>5&&f()}if(!i){let t=e.clientY-s;l-=t*this._step*this._arrowKeyMultiplier(e),c+l>this._max?l=this._max-c:c+l<this._min&&(l=this._min-c),this._snapClampSetValue(c+l)}s=e.clientY},f=()=>{this._setDraggingStyle(!1,`vertical`),this._callOnFinishChange(),window.removeEventListener(`mousemove`,d),window.removeEventListener(`mouseup`,f)};this.$input.addEventListener(`input`,e),this.$input.addEventListener(`keydown`,n),this.$input.addEventListener(`wheel`,r,{passive:!1}),this.$input.addEventListener(`mousedown`,u),this.$input.addEventListener(`focus`,()=>{this._inputFocused=!0}),this.$input.addEventListener(`blur`,()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()})}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement(`div`),this.$slider.classList.add(`slider`),this.$fill=document.createElement(`div`),this.$fill.classList.add(`fill`),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add(`hasSlider`);let e=(e,t,n,r,i)=>(e-t)/(n-t)*(i-r)+r,t=t=>{let n=this.$slider.getBoundingClientRect(),r=e(t,n.left,n.right,this._min,this._max);this._snapClampSetValue(r)},n=e=>{this._setDraggingStyle(!0),t(e.clientX),window.addEventListener(`mousemove`,r),window.addEventListener(`mouseup`,i)},r=e=>{t(e.clientX)},i=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`mousemove`,r),window.removeEventListener(`mouseup`,i)},a=!1,o,s,c=e=>{e.preventDefault(),this._setDraggingStyle(!0),t(e.touches[0].clientX),a=!1},l=e=>{e.touches.length>1||(this._hasScrollBar?(o=e.touches[0].clientX,s=e.touches[0].clientY,a=!0):c(e),window.addEventListener(`touchmove`,u,{passive:!1}),window.addEventListener(`touchend`,d))},u=e=>{if(a){let t=e.touches[0].clientX-o,n=e.touches[0].clientY-s;Math.abs(t)>Math.abs(n)?c(e):(window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d))}else e.preventDefault(),t(e.touches[0].clientX)},d=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d)},f=this._callOnFinishChange.bind(this),p;this.$slider.addEventListener(`mousedown`,n),this.$slider.addEventListener(`touchstart`,l,{passive:!1}),this.$slider.addEventListener(`wheel`,e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)&&this._hasScrollBar)return;e.preventDefault();let t=this._normalizeMouseWheel(e)*this._step;this._snapClampSetValue(this.getValue()+t),this.$input.value=this.getValue(),clearTimeout(p),p=setTimeout(f,400)},{passive:!1})}_setDraggingStyle(e,t=`horizontal`){this.$slider&&this.$slider.classList.toggle(`active`,e),document.body.classList.toggle(`lil-gui-dragging`,e),document.body.classList.toggle(`lil-gui-${t}`,e)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(e){let{deltaX:t,deltaY:n}=e;return Math.floor(e.deltaY)!==e.deltaY&&e.wheelDelta&&(t=0,n=-e.wheelDelta/120,n*=this._stepExplicit?1:10),t+-n}_arrowKeyMultiplier(e){let t=this._stepExplicit?1:10;return e.shiftKey?t*=10:e.altKey&&(t/=10),t}_snap(e){let t=Math.round(e/this._step)*this._step;return parseFloat(t.toPrecision(15))}_clamp(e){return e<this._min&&(e=this._min),e>this._max&&(e=this._max),e}_snapClampSetValue(e){this.setValue(this._clamp(this._snap(e)))}get _hasScrollBar(){let e=this.parent.root.$children;return e.scrollHeight>e.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}},ze=class extends K{constructor(e,t,n,r){super(e,t,n,`option`),this.$select=document.createElement(`select`),this.$select.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`display`),this.$select.addEventListener(`change`,()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener(`focus`,()=>{this.$display.classList.add(`focus`)}),this.$select.addEventListener(`blur`,()=>{this.$display.classList.remove(`focus`)}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(r)}options(e){return this._values=Array.isArray(e)?e:Object.values(e),this._names=Array.isArray(e)?e:Object.keys(e),this.$select.replaceChildren(),this._names.forEach(e=>{let t=document.createElement(`option`);t.textContent=e,this.$select.appendChild(t)}),this.updateDisplay(),this}updateDisplay(){let e=this.getValue(),t=this._values.indexOf(e);return this.$select.selectedIndex=t,this.$display.textContent=t===-1?e:this._names[t],this}},Be=class extends K{constructor(e,t,n){super(e,t,n,`string`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`spellcheck`,`false`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$input.addEventListener(`input`,()=>{this.setValue(this.$input.value)}),this.$input.addEventListener(`keydown`,e=>{e.code===`Enter`&&this.$input.blur()}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}},Ve=`.lil-gui {
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
}`;function He(e){let t=document.createElement(`style`);t.innerHTML=e;let n=document.querySelector(`head link[rel=stylesheet], head style`);n?document.head.insertBefore(t,n):document.head.appendChild(t)}var Ue=!1,We=class e{constructor({parent:e,autoPlace:t=e===void 0,container:n,width:r,title:i=`Controls`,closeFolders:a=!1,injectStyles:o=!0,touchStyles:s=!0}={}){if(this.parent=e,this.root=e?e.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement(`div`),this.domElement.classList.add(`lil-gui`),this.$title=document.createElement(`div`),this.$title.classList.add(`title`),this.$title.setAttribute(`role`,`button`),this.$title.setAttribute(`aria-expanded`,!0),this.$title.setAttribute(`tabindex`,0),this.$title.addEventListener(`click`,()=>this.openAnimated(this._closed)),this.$title.addEventListener(`keydown`,e=>{(e.code===`Enter`||e.code===`Space`)&&(e.preventDefault(),this.$title.click())}),this.$title.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$children=document.createElement(`div`),this.$children.classList.add(`children`),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(i),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add(`root`),s&&this.domElement.classList.add(`allow-touch-styles`),!Ue&&o&&(He(Ve),Ue=!0),n?n.appendChild(this.domElement):t&&(this.domElement.classList.add(`autoPlace`),document.body.appendChild(this.domElement)),r&&this.domElement.style.setProperty(`--width`,r+`px`),this._closeFolders=a}add(e,t,n,r,i){if(Object(n)===n)return new ze(this,e,t,n);let a=e[t];switch(typeof a){case`number`:return new Re(this,e,t,n,r,i);case`boolean`:return new je(this,e,t);case`string`:return new Be(this,e,t);case`function`:return new Le(this,e,t)}console.error(`gui.add failed
	property:`,t,`
	object:`,e,`
	value:`,a)}addColor(e,t,n=1){return new Ie(this,e,t,n)}addFolder(t){let n=new e({parent:this,title:t});return this.root._closeFolders&&n.close(),n}load(e,t=!0){return e.controllers&&this.controllers.forEach(t=>{t instanceof Le||t._name in e.controllers&&t.load(e.controllers[t._name])}),t&&e.folders&&this.folders.forEach(t=>{t._title in e.folders&&t.load(e.folders[t._title])}),this}save(e=!0){let t={controllers:{},folders:{}};return this.controllers.forEach(e=>{if(!(e instanceof Le)){if(e._name in t.controllers)throw Error(`Cannot save GUI with duplicate property "${e._name}"`);t.controllers[e._name]=e.save()}}),e&&this.folders.forEach(e=>{if(e._title in t.folders)throw Error(`Cannot save GUI with duplicate folder "${e._title}"`);t.folders[e._title]=e.save()}),t}open(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),this.domElement.classList.toggle(`closed`,this._closed),this}close(){return this.open(!1)}_setClosed(e){this._closed!==e&&(this._closed=e,this._callOnOpenClose(this))}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}openAnimated(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),requestAnimationFrame(()=>{let t=this.$children.clientHeight;this.$children.style.height=t+`px`,this.domElement.classList.add(`transition`);let n=e=>{e.target===this.$children&&(this.$children.style.height=``,this.domElement.classList.remove(`transition`),this.$children.removeEventListener(`transitionend`,n))};this.$children.addEventListener(`transitionend`,n);let r=e?this.$children.scrollHeight:0;this.domElement.classList.toggle(`closed`,!e),requestAnimationFrame(()=>{this.$children.style.height=r+`px`})}),this}title(e){return this._title=e,this.$title.textContent=e,this}reset(e=!0){return(e?this.controllersRecursive():this.controllers).forEach(e=>e.reset()),this}onChange(e){return this._onChange=e,this}_callOnChange(e){this.parent&&this.parent._callOnChange(e),this._onChange!==void 0&&this._onChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(e){this.parent&&this.parent._callOnFinishChange(e),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onOpenClose(e){return this._onOpenClose=e,this}_callOnOpenClose(e){this.parent&&this.parent._callOnOpenClose(e),this._onOpenClose!==void 0&&this._onOpenClose.call(this,e)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(e=>e.destroy())}controllersRecursive(){let e=Array.from(this.controllers);return this.folders.forEach(t=>{e=e.concat(t.controllersRecursive())}),e}foldersRecursive(){let e=Array.from(this.folders);return this.folders.forEach(t=>{e=e.concat(t.foldersRecursive())}),e}},Ge=`// Camera-facing billboard planes, drawn back-to-front from the sorted keys,
// textured with a procedural ink-spray sprite atlas.
//
// Atlas UV is computed in the vertex shader; the fragment shader does a nearest
// texel fetch (textureLoad) for coverage (1 - r, black spray on white).

struct SceneUniforms {
  viewProj: mat4x4<f32>,
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
}

struct Plane {
  posSize: vec4<f32>, // xyz = world center, w = full size
  color: vec4<f32>,   // rgb + alpha
  params: vec4<f32>,  // x = sprite index
}

struct Key {
  dist: f32,
  index: u32,
}

struct AtlasInfo {
  grid: vec4<f32>, // x = cols, y = rows, z = planeScale
}

const ALPHA_CUTOFF: f32 = 0.02;

@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(1) @binding(0) var<storage, read> planes: array<Plane>;
@group(1) @binding(1) var<storage, read> keys: array<Key>;
@group(2) @binding(0) var<uniform> atlas: AtlasInfo;
@group(2) @binding(1) var spriteTex: texture_2d<f32>;

struct VertexInput {
  @location(0) localPosition: vec3<f32>, // unit quad, xy in [-0.5, 0.5]
  @builtin(instance_index) instance: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) atlasUv: vec2<f32>,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  let planeId = keys[input.instance].index;
  let plane = planes[planeId];
  let size = plane.posSize.w * atlas.grid.z;

  let worldPos =
    plane.posSize.xyz +
    scene.cameraRight.xyz * input.localPosition.x * size +
    scene.cameraUp.xyz * input.localPosition.y * size;

  let cols = atlas.grid.x;
  let rows = atlas.grid.y;
  let idx = u32(plane.params.x + 0.5);
  let col = f32(idx % u32(cols));
  let row = f32(idx / u32(cols));
  let local = input.localPosition.xy + vec2<f32>(0.5, 0.5);
  let atlasUv = (vec2<f32>(col, row) + local) / vec2<f32>(cols, rows);

  var output: VertexOutput;
  output.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  output.color = plane.color;
  output.atlasUv = atlasUv;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let dims = textureDimensions(spriteTex);
  let maxCoord = vec2<i32>(dims) - vec2<i32>(1);
  let texel = clamp(
    vec2<i32>(input.atlasUv * vec2<f32>(dims)),
    vec2<i32>(0),
    maxCoord,
  );

  let coverage = 1.0 - textureLoad(spriteTex, texel, 0).r;
  if (coverage < ALPHA_CUTOFF) {
    discard;
  }

  return vec4<f32>(input.color.rgb, input.color.a * coverage);
}
`,Ke=`// Sort pass 1: seed one key per plane with its squared distance to the camera.
//
// Squared distance is monotonic with true distance, so it orders identically
// without the sqrt. Padding slots beyond \`count\` (the key array is padded to a
// power of two for bitonic sort) get dist = -1 so they sink to the back of the
// descending order and are never drawn.

struct Plane {
  posSize: vec4<f32>,
  color: vec4<f32>,
  params: vec4<f32>, // keep layout in sync with planes-draw.wgsl
}

struct Key {
  dist: f32,
  index: u32,
}

struct DistParams {
  cameraPos: vec4<f32>,
  count: u32, // number of real planes
  total: u32, // padded power-of-two length of \`keys\`
  pad0: u32,
  pad1: u32,
}

@group(0) @binding(0) var<uniform> params: DistParams;
@group(0) @binding(1) var<storage, read> planes: array<Plane>;
@group(0) @binding(2) var<storage, read_write> keys: array<Key>;

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let i = globalId.x;
  if (i >= params.total) {
    return;
  }

  if (i < params.count) {
    let d = planes[i].posSize.xyz - params.cameraPos.xyz;
    keys[i] = Key(dot(d, d), i);
  } else {
    keys[i] = Key(-1.0, i);
  }
}
`,qe=`// Sort pass 2: a single bitonic compare-exchange step.
//
// The host dispatches this once per (k, j) step of the bitonic schedule. Each
// invocation owns element \`i\` and conditionally swaps with partner \`i ^ j\`. We
// sort DESCENDING by dist (farthest first) so the draw pass renders back-to-
// front for correct alpha blending.

struct Key {
  dist: f32,
  index: u32,
}

struct SortParams {
  j: u32,     // compare distance for this step
  k: u32,     // size of the current bitonic sequence
  total: u32, // padded element count
  pad: u32,
}

@group(0) @binding(0) var<uniform> params: SortParams;
@group(0) @binding(1) var<storage, read_write> keys: array<Key>;

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let i = globalId.x;
  if (i >= params.total) {
    return;
  }

  let partner = i ^ params.j;
  if (partner <= i) {
    return;
  }

  let a = keys[i];
  let b = keys[partner];

  let ascending = (i & params.k) == 0u;
  let needSwap = select(a.dist > b.dist, a.dist < b.dist, ascending);
  if (needSwap) {
    keys[i] = b;
    keys[partner] = a;
  }
}
`,Je={char:1,uchar:1,int8:1,uint8:1,short:2,ushort:2,int16:2,uint16:2,int:4,uint:4,int32:4,uint32:4,float:4,float32:4,double:8,float64:8};function Ye(e,t,n){switch(n){case`char`:case`int8`:return e.getInt8(t);case`uchar`:case`uint8`:return e.getUint8(t);case`short`:case`int16`:return e.getInt16(t,!0);case`ushort`:case`uint16`:return e.getUint16(t,!0);case`int`:case`int32`:return e.getInt32(t,!0);case`uint`:case`uint32`:return e.getUint32(t,!0);case`float`:case`float32`:return e.getFloat32(t,!0);case`double`:case`float64`:return e.getFloat64(t,!0);default:throw Error(`Unsupported PLY property type: ${n}`)}}function Xe(e,t){let n=new Uint8Array(e),r=new TextDecoder(`latin1`).decode(n.subarray(0,Math.min(n.length,65536))),i=r.indexOf(`end_header
`);if(i===-1)throw Error(`PLY: end_header not found (is this a binary PLY with a normal header?)`);let a=i+11,o=r.slice(0,i).split(`
`).map(e=>e.trim());if(!o.some(e=>e.startsWith(`format binary_little_endian`)))throw Error(`PLY: only binary_little_endian format is supported`);let s=0,c=!1,l=[],u=0;for(let e of o){if(e.startsWith(`element `)){let[,t,n]=e.split(/\s+/);c=t===`vertex`,c&&(s=Number.parseInt(n,10));continue}if(e.startsWith(`property `)&&c){let t=e.split(/\s+/);if(t[1]===`list`)throw Error(`PLY: list properties on vertex element are not supported`);let n=t[1],r=t[2],i=Je[n];if(i===void 0)throw Error(`PLY: unknown property type "${n}"`);l.push({name:r,type:n,offset:u,size:i}),u+=i}}if(s<=0)throw Error(`PLY: no vertices found`);let d=new Map(l.map(e=>[e.name,e])),f=t.map(e=>{let t=d.get(e);if(!t)throw Error(`PLY: requested property "${e}" not present in file`);return{name:e,prop:t,out:new Float32Array(s)}}),p=new DataView(e);for(let e=0;e<s;e++){let t=a+e*u;for(let n of f)n.out[e]=Ye(p,t+n.prop.offset,n.prop.type)}let m={};for(let e of f)m[e.name]=e.out;return{count:s,columns:m}}var Ze=[3,12];function J(e,t){return e+Math.random()*(t-e)}function Qe(e,t,n){let r=e*374761393+t*668265263+n*982451653|0;return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967296}function Y(e,t,n){return Qe(e,t,n)*2-1}function $e(e){return e*e*(3-2*e)}function X(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=$e(e-r),o=$e(t-i),s=Y(r,i,n),c=Y(r+1,i,n),l=Y(r,i+1,n),u=Y(r+1,i+1,n),d=s+(c-s)*a;return d+(l+(u-l)*a-d)*o}function et(e,t,n){let{seed:r,strength:i}=n,a=X(e*2.4+.3,t*2.4+.7,r),o=X(e*5.1+1.9,t*5.1+2.3,r+137),s=X(e*9.7+4.1,t*9.7+3.7,r+389);return{u:e+(a*.55+o*.3+s*.15)*i,v:t+(X(e*2.4+2.1,t*2.4+5.3,r+71)*.55+X(e*5.1+3.7,t*5.1+1.1,r+211)*.3+X(e*9.7+6.3,t*9.7+8.9,r+503)*.15)*i}}function Z(e,t,n){let r=et(e,t,n);return Math.sqrt(r.u*r.u+r.v*r.v)}function tt(e,t=!1){return{seed:e,strength:t?J(.18,.38):J(.14,.32)}}function nt(e,t,n,r,i,a){let o=et(e,t,a);return{x:n+o.u*i,y:r+o.v*i}}function rt(e,t,n,r,i){let a=t+r*.5,o=n+r*.5,s=r*.46,c=(r/256)**2,l=Math.floor(J(2200,4200)*c),u=J(.6,1.4),d=J(.7,1.1),f=.015;e.save(),e.fillStyle=`#000`;for(let t=0;t<l;t++){let t=Math.random()**+u,n=t;if(Math.random()<n*n*d)continue;let r=Math.random()*Math.PI*2,c=Math.cos(r)*t,l=Math.sin(r)*t;if(Z(c,l,i)>1.02)continue;let{x:p,y:m}=nt(c+J(-f,f),l+J(-f,f),a,o,s,i),h=J(.4,1.6);Math.random()<.025&&(h=J(2,5.5));let g=(1-n*.65)*J(.45,1);e.globalAlpha=Math.min(1,g),e.beginPath(),e.arc(p,m,h,0,Math.PI*2),e.fill()}e.restore()}function it(e,t,n,r,i){let a=t+r*.5,o=n+r*.5,s=r*.47,c=(r/256)**2,l=Math.floor(J(9e3,16e3)*c);e.save(),e.fillStyle=`#000`;for(let t=0;t<l;t++){let t=Math.random()*Math.PI*2,n=Math.sqrt(Math.random()),r=Math.cos(t)*n,c=Math.sin(t)*n;if(Z(r,c,i)>1.02)continue;let{x:l,y:u}=nt(r,c,a,o,s,i);e.globalAlpha=J(.12,.5),e.beginPath(),e.arc(l,u,J(.12,.42),0,Math.PI*2),e.fill()}e.restore()}function at(e,t,n,r,i){let a=e.getImageData(t,n,r,r),o=a.data,s=r*.5,c=r*.5,l=r*.48,u=J(1.4,2.2),{seed:d}=i;for(let e=0;e<r;e++)for(let t=0;t<r;t++){let n=(e*r+t)*4,a=Z((t+.5-s)/l,(e+.5-c)/l,i),f=a>=1?0:(1-a)**u,p=1-o[n]/255,m=Qe(t,e,d);m>.58&&(p=Math.min(1,p+(m-.58)*1.35)),p=Math.min(1,p*f);let h=Math.floor((1-p)*255);o[n]=h,o[n+1]=h,o[n+2]=h,o[n+3]=255}e.putImageData(a,t,n)}function ot(e,t,n,r,i){let a=tt(i);e.fillStyle=`#fff`,e.fillRect(t,n,r,r),rt(e,t,n,r,a),it(e,t,n,r,a),at(e,t,n,r,a)}function st(e,t,n,r,i){let a=tt(i,!0),o=e.createImageData(r,r),s=o.data,c=r*.5,l=r*.5,u=r*.46,d=J(.1,.18);e.fillStyle=`#fff`,e.fillRect(t,n,r,r);for(let e=0;e<r;e++)for(let t=0;t<r;t++){let n=(e*r+t)*4,o=Z((t+.5-c)/u,(e+.5-l)/u,a),f=0;if(o<1-d)f=1;else if(o<1){let e=(1-o)/d;f=e*e*(3-2*e)}let p=Qe(t,e,i);p>.72&&(f=Math.min(1,f+(p-.72)*.6));let m=Math.floor((1-f)*255);s[n]=m,s[n+1]=m,s[n+2]=m,s[n+3]=255}e.putImageData(o,t,n)}async function ct(e,t={}){let n=t.cols??4,r=t.rows??4,i=t.cell??128,a=n*r,o=document.createElement(`canvas`);o.width=n*i,o.height=r*i;let s=o.getContext(`2d`);if(!s)throw Error(`Failed to get 2D context for spray atlas`);for(let e=0;e<a;e++){let t=e%n*i,r=Math.floor(e/n)*i,a=e*7919+1;Ze.includes(e)?st(s,t,r,i,a):ot(s,t,r,i,a)}let c=await createImageBitmap(o),l=ve.fromBitmap(e,c,{label:`spray-atlas`,flipY:!1,addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`,magFilter:`nearest`,minFilter:`nearest`});return c.close(),{texture:l,cols:n,rows:r,count:a}}var lt=4,ut=6,dt=.008,ft=.1,Q=14,pt=1,mt=4,ht=4,gt=256,_t=1e-4,vt=.5,yt=12,bt=.28209479177387814,xt=12,St=8,Ct=256,wt={planeScale:1};function Tt(e){return 1/(1+Math.exp(-e))}function $(e,t,n){return Math.min(n,Math.max(t,e))}function Et(e){let t=1;for(;t<e;)t<<=1;return t}function Dt(e){let t=[];for(let n=2;n<=e;n<<=1)for(let e=n>>1;e>0;e>>=1)t.push({k:n,j:e});return t}async function Ot(e,t){let n=await fetch(e);if(!n.ok)throw Error(`Failed to load PLY: ${n.status} ${n.statusText}`);let{count:r,columns:i}=Xe(await n.arrayBuffer(),[`x`,`y`,`z`,`scale_0`,`scale_1`,`scale_2`,`f_dc_0`,`f_dc_1`,`f_dc_2`,`opacity`]),a=i.x,o=i.y,s=i.z,c=1/0,l=1/0,u=1/0,d=-1/0,f=-1/0,p=-1/0;for(let e=0;e<r;e++)c=Math.min(c,a[e]),l=Math.min(l,o[e]),u=Math.min(u,s[e]),d=Math.max(d,a[e]),f=Math.max(f,o[e]),p=Math.max(p,s[e]);let m=(c+d)*.5,h=(l+f)*.5,g=(u+p)*.5,_=Q/(Math.max(d-c,f-l,p-u)||1),v=Q*dt,y=Q*ft,b=i.scale_0,x=i.scale_1,S=i.scale_2,C=i.f_dc_0,w=i.f_dc_1,T=i.f_dc_2,E=i.opacity,D=Math.ceil(r/lt),O=new Float32Array(D*xt),k=0,A=0;for(let e=0;e<r;e+=lt){let n=A*xt;O[n+0]=(a[e]-m)*_,O[n+1]=-(o[e]-h)*_,O[n+2]=(s[e]-g)*_;let r=$((Math.exp(b[e])+Math.exp(x[e])+Math.exp(S[e]))/3*_*ut,v,y);O[n+3]=r*2,k+=r,O[n+4]=$(.5+bt*C[e],0,1),O[n+5]=$(.5+bt*w[e],0,1),O[n+6]=$(.5+bt*T[e],0,1),O[n+7]=$(Tt(E[e])*pt,0,1),O[n+8]=Math.floor(Math.random()*t),A++}return console.info(`[belfast-test] loaded ${r.toLocaleString()} splats, using ${D.toLocaleString()} planes (stride ${lt}); avg half-size ${(k/D).toFixed(3)} world units.`),{data:O,count:D}}async function kt(){await ke();let e=document.createElement(`canvas`);e.style.cssText=`display:block;width:100vw;height:100vh;`,document.body.appendChild(e);let t=new Ae.default;t.showPanel(0),t.dom.style.cssText=`position:fixed;top:0;left:0;z-index:10;`,document.body.appendChild(t.dom);let n=await fe.create(e),r=await ct(n,{cols:mt,rows:ht,cell:gt}),{data:i,count:a}=await Ot(`/Sketches/experiments2/apps/belfast-test/dist/grape.ply`,r.count),o=Et(a),s=Math.ceil(o/Ct),{positions:c}=De(1,1,1,`xy`),l=c.length/3,u=W.fromData(n,c,U.vertex,`plane-positions`),d=W.fromData(n,i,U.storage,`plane-instance-data`),f=W.create(n,o*St,U.storage,`sort-keys`),p=new Se(l).addVertexBuffer({buffer:u,arrayStride:12,attributes:[{shaderLocation:0,format:`float32x3`,offset:0}],slot:0,stepMode:`vertex`}),m=W.create(n,W.uniformSize(de.uniformByteSize()),U.uniform,`camera-uniforms`),h=new Float32Array(de.uniformFloatCount),g=new de(Math.PI/180*50,1,.1,200),_=new se(g,{listenerTarget:e,center:[0,0,0],radius:Q*1.4}),v=W.create(n,32,U.uniform,`distance-params`),y=new ArrayBuffer(32),b=new Float32Array(y,0,4),x=new Uint32Array(y,16,4);x[0]=a,x[1]=o;let S=new xe(n,Ke,{label:`PlaneDistance`,entryPoint:`cs_main`}),C=G.create(n,S.getBindGroupLayout(0),[{binding:0,resource:v},{binding:1,resource:d},{binding:2,resource:f}],`distance-bind-group`),w=new xe(n,qe,{label:`BitonicSort`,entryPoint:`cs_main`}),T=Dt(o).map(({k:e,j:t},r)=>{let i=W.create(n,16,U.uniform,`sort-params-${r}`);return i.write(n,new Uint32Array([t,e,o,0])),G.create(n,w.getBindGroupLayout(0),[{binding:0,resource:i},{binding:1,resource:f}],`sort-bind-group-${r}`)}),E=we(n,`GrapePlanesScene`),D=n.gpu.createBindGroupLayout({label:`PlanesStorageLayout`,entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}}]}),O=n.gpu.createBindGroupLayout({label:`SprayAtlasLayout`,entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:`float`}}]}),k=n.gpu.createPipelineLayout({label:`PlanesPipelineLayout`,bindGroupLayouts:[E.bindGroupLayout,D,O]}),A=W.create(n,16,U.uniform,`atlas-info`),j=new Float32Array([r.cols,r.rows,wt.planeScale,0]);A.write(n,j),new We({title:`Belfast Test`}).add(wt,`planeScale`,.1,8,.05).name(`Plane Scale`);let M=new Ee(n,{label:`SprayAtlasPreview`}),N=new be(n,Ge,{label:`GrapePlanes`,layout:k,vertexBuffers:p.getVertexLayouts(),primitive:{topology:`triangle-list`,cullMode:`none`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!1,depthCompare:`less`},targets:[{format:n.format,blend:{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}}]}),P=G.create(n,E.bindGroupLayout,m,0,`scene-bind-group`),ee=G.create(n,O,[{binding:0,resource:A},{binding:1,resource:r.texture.view}],`spray-atlas-bind-group`),te=G.create(n,D,[{binding:0,resource:d},{binding:1,resource:f}],`planes-storage-bind-group`);window.addEventListener(`beforeunload`,()=>{_.destroy(),u.destroy(),d.destroy(),f.destroy(),m.destroy(),v.destroy(),A.destroy(),r.texture.destroy()});let F=null,I=0,L=0,R=null,z=(e,t,n)=>{if(!R)return!0;let r=e-R[0],i=t-R[1],a=n-R[2],o=_t*_t;return r*r+i*i+a*a>o},B=()=>{e.width===I&&e.height===L||(I=e.width,L=e.height,I>0&&L>0&&g.setAspect(I/L))},ne=()=>{let t=e.width,r=e.height;if(F&&F.width===t&&F.height===r)return F.createView();F?.destroy();let i=n.gpu.createTexture({label:`depth-texture`,size:[t,r],format:`depth24plus`,usage:GPUTextureUsage.RENDER_ATTACHMENT});return F=i,i.createView()},V=()=>{t.begin(),n.resize(),B(),g.writeUniformData(h),m.write(n,h),j[2]=wt.planeScale,A.write(n,j);let i=g.getPosition(),o=z(i[0],i[1],i[2]);o&&(b[0]=i[0],b[1]=i[1],b[2]=i[2],v.write(n,y));let c=n.getCurrentTexture().createView(),l=ne(),u=n.gpu.createCommandEncoder({label:`grape-frame`});if(o){let e=u.beginComputePass({label:`sort-planes`});S.dispatch(e,C,s);for(let t of T)w.dispatch(e,t,s);e.end(),R=[i[0],i[1],i[2]]}let d=ye(u,c,{clearColor:{r:.04,g:.04,b:.05,a:1},depthStencilAttachment:{view:l,depthLoadOp:`clear`,depthClearValue:1,depthStoreOp:`store`}});N.draw(d,p,[P,te,ee],a),d.end();let f=Math.floor(Math.min(e.width,e.height)*vt),_=ye(u,c,{loadOp:`load`});M.draw(_,r.texture.view,r.texture.sampler,{x:yt,y:Math.max(0,e.height-f-yt),width:f,height:f}),_.end(),n.gpu.queue.submit([u.finish()]),t.end(),requestAnimationFrame(V)};V()}kt().catch(e=>{console.error(e)});