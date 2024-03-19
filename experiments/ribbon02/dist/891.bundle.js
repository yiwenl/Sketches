"use strict";(self.webpackChunkfxhash_boilerplate_webpack=self.webpackChunkfxhash_boilerplate_webpack||[]).push([[891],{129:(e,o)=>{var t=Object.prototype.hasOwnProperty;function n(e){try{return decodeURIComponent(e.replace(/\+/g," "))}catch(e){return null}}function r(e){try{return encodeURIComponent(e)}catch(e){return null}}o.stringify=function(e,o){o=o||"";var n,s,a=[];for(s in"string"!=typeof o&&(o="?"),e)if(t.call(e,s)){if((n=e[s])||null!=n&&!isNaN(n)||(n=""),s=r(s),n=r(n),null===s||null===n)continue;a.push(s+"="+n)}return a.length?o+a.join("&"):""},o.parse=function(e){for(var o,t=/([^=?#&]+)=?([^&]*)/g,r={};o=t.exec(e);){var s=n(o[1]),a=n(o[2]);null===s||null===a||s in r||(r[s]=a)}return r}},851:e=>{e.exports=function(e,o){if(o=o.split(":")[0],!(e=+e))return!1;switch(o){case"http":case"ws":return 80!==e;case"https":case"wss":return 443!==e;case"ftp":return 21!==e;case"gopher":return 70!==e;case"file":return!1}return 0!==e}},564:(e,o,t)=>{var n=t(851),r=t(129),s=/^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/,a=/[\n\r\t]/g,i=/^[A-Za-z][A-Za-z0-9+-.]*:\/\//,c=/:\d+$/,l=/^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i,p=/^[a-zA-Z]:/;function h(e){return(e||"").toString().replace(s,"")}var u=[["#","hash"],["?","query"],function(e,o){return w(o.protocol)?e.replace(/\\/g,"/"):e},["/","pathname"],["@","auth",1],[NaN,"host",void 0,1,1],[/:(\d*)$/,"port",void 0,1],[NaN,"hostname",void 0,1,1]],f={hash:1,query:1};function d(e){var o,n=("undefined"!=typeof window?window:void 0!==t.g?t.g:"undefined"!=typeof self?self:{}).location||{},r={},s=typeof(e=e||n);if("blob:"===e.protocol)r=new g(unescape(e.pathname),{});else if("string"===s)for(o in r=new g(e,{}),f)delete r[o];else if("object"===s){for(o in e)o in f||(r[o]=e[o]);void 0===r.slashes&&(r.slashes=i.test(e.href))}return r}function w(e){return"file:"===e||"ftp:"===e||"http:"===e||"https:"===e||"ws:"===e||"wss:"===e}function m(e,o){e=(e=h(e)).replace(a,""),o=o||{};var t,n=l.exec(e),r=n[1]?n[1].toLowerCase():"",s=!!n[2],i=!!n[3],c=0;return s?i?(t=n[2]+n[3]+n[4],c=n[2].length+n[3].length):(t=n[2]+n[4],c=n[2].length):i?(t=n[3]+n[4],c=n[3].length):t=n[4],"file:"===r?c>=2&&(t=t.slice(2)):w(r)?t=n[4]:r?s&&(t=t.slice(2)):c>=2&&w(o.protocol)&&(t=n[4]),{protocol:r,slashes:s||w(r),slashesCount:c,rest:t}}function g(e,o,t){if(e=(e=h(e)).replace(a,""),!(this instanceof g))return new g(e,o,t);var s,i,c,l,f,y,C=u.slice(),v=typeof o,b=this,x=0;for("object"!==v&&"string"!==v&&(t=o,o=null),t&&"function"!=typeof t&&(t=r.parse),s=!(i=m(e||"",o=d(o))).protocol&&!i.slashes,b.slashes=i.slashes||s&&o.slashes,b.protocol=i.protocol||o.protocol||"",e=i.rest,("file:"===i.protocol&&(2!==i.slashesCount||p.test(e))||!i.slashes&&(i.protocol||i.slashesCount<2||!w(b.protocol)))&&(C[3]=[/(.*)/,"pathname"]);x<C.length;x++)"function"!=typeof(l=C[x])?(c=l[0],y=l[1],c!=c?b[y]=e:"string"==typeof c?~(f="@"===c?e.lastIndexOf(c):e.indexOf(c))&&("number"==typeof l[2]?(b[y]=e.slice(0,f),e=e.slice(f+l[2])):(b[y]=e.slice(f),e=e.slice(0,f))):(f=c.exec(e))&&(b[y]=f[1],e=e.slice(0,f.index)),b[y]=b[y]||s&&l[3]&&o[y]||"",l[4]&&(b[y]=b[y].toLowerCase())):e=l(e,b);t&&(b.query=t(b.query)),s&&o.slashes&&"/"!==b.pathname.charAt(0)&&(""!==b.pathname||""!==o.pathname)&&(b.pathname=function(e,o){if(""===e)return o;for(var t=(o||"/").split("/").slice(0,-1).concat(e.split("/")),n=t.length,r=t[n-1],s=!1,a=0;n--;)"."===t[n]?t.splice(n,1):".."===t[n]?(t.splice(n,1),a++):a&&(0===n&&(s=!0),t.splice(n,1),a--);return s&&t.unshift(""),"."!==r&&".."!==r||t.push(""),t.join("/")}(b.pathname,o.pathname)),"/"!==b.pathname.charAt(0)&&w(b.protocol)&&(b.pathname="/"+b.pathname),n(b.port,b.protocol)||(b.host=b.hostname,b.port=""),b.username=b.password="",b.auth&&(~(f=b.auth.indexOf(":"))?(b.username=b.auth.slice(0,f),b.username=encodeURIComponent(decodeURIComponent(b.username)),b.password=b.auth.slice(f+1),b.password=encodeURIComponent(decodeURIComponent(b.password))):b.username=encodeURIComponent(decodeURIComponent(b.auth)),b.auth=b.password?b.username+":"+b.password:b.username),b.origin="file:"!==b.protocol&&w(b.protocol)&&b.host?b.protocol+"//"+b.host:"null",b.href=b.toString()}g.prototype={set:function(e,o,t){var s=this;switch(e){case"query":"string"==typeof o&&o.length&&(o=(t||r.parse)(o)),s[e]=o;break;case"port":s[e]=o,n(o,s.protocol)?o&&(s.host=s.hostname+":"+o):(s.host=s.hostname,s[e]="");break;case"hostname":s[e]=o,s.port&&(o+=":"+s.port),s.host=o;break;case"host":s[e]=o,c.test(o)?(o=o.split(":"),s.port=o.pop(),s.hostname=o.join(":")):(s.hostname=o,s.port="");break;case"protocol":s.protocol=o.toLowerCase(),s.slashes=!t;break;case"pathname":case"hash":if(o){var a="pathname"===e?"/":"#";s[e]=o.charAt(0)!==a?a+o:o}else s[e]=o;break;case"username":case"password":s[e]=encodeURIComponent(o);break;case"auth":var i=o.indexOf(":");~i?(s.username=o.slice(0,i),s.username=encodeURIComponent(decodeURIComponent(s.username)),s.password=o.slice(i+1),s.password=encodeURIComponent(decodeURIComponent(s.password))):s.username=encodeURIComponent(decodeURIComponent(o))}for(var l=0;l<u.length;l++){var p=u[l];p[4]&&(s[p[1]]=s[p[1]].toLowerCase())}return s.auth=s.password?s.username+":"+s.password:s.username,s.origin="file:"!==s.protocol&&w(s.protocol)&&s.host?s.protocol+"//"+s.host:"null",s.href=s.toString(),s},toString:function(e){e&&"function"==typeof e||(e=r.stringify);var o,t=this,n=t.host,s=t.protocol;s&&":"!==s.charAt(s.length-1)&&(s+=":");var a=s+(t.protocol&&t.slashes||w(t.protocol)?"//":"");return t.username?(a+=t.username,t.password&&(a+=":"+t.password),a+="@"):t.password?(a+=":"+t.password,a+="@"):"file:"!==t.protocol&&w(t.protocol)&&!n&&"/"!==t.pathname&&(a+="@"),(":"===n[n.length-1]||c.test(t.hostname)&&!t.port)&&(n+=":"),a+=n+t.pathname,(o="object"==typeof t.query?e(t.query):t.query)&&(a+="?"!==o.charAt(0)?"?"+o:o),t.hash&&(a+=t.hash),a}},g.extractProtocol=m,g.location=d,g.trimLeft=h,g.qs=r,e.exports=g},891:(e,o,t)=>{t.r(o),t.d(o,{default:()=>l});var n=t(247),r=t(564),s=t.n(r);let a=!0;const i=()=>{a&&window.history.pushState("experiment","Title",window.location.origin+window.location.pathname+"?config="+JSON.stringify(n.default))};let c=-1;const l={enabled:a,reload:()=>{a&&(window.location.href=window.location.origin+window.location.pathname+"?config="+JSON.stringify(n.default))},reset:()=>{window.location.href=window.location.origin+window.location.pathname},refresh:i,delayReload:()=>{a&&(window.clearTimeout(c),c=window.setTimeout((()=>{window.location.href=window.location.origin+window.location.pathname+"?config="+JSON.stringify(n.default)}),500))},init:(e=!0)=>{a=e;const o=s()(window.location.search,!0);let t={};o.query.config&&(t=JSON.parse(o.query.config)),Object.assign(n.default,t),i()}}}}]);