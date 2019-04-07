!function(e){var t={};function r(o){if(t[o])return t[o].exports;var n=t[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=t,r.d=function(e,t,o){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(o,n,function(t){return e[t]}.bind(null,n));return o},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=7)}([function(e,t){e.exports=require("stream")},function(e,t){e.exports=require("zlib")},function(e,t){e.exports=require("url")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("https")},function(module,exports,__webpack_require__){var __WEBPACK_AMD_DEFINE_RESULT__;
/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
!function(){"use strict";var ERROR="input is invalid type",WINDOW="object"==typeof window,root=WINDOW?window:{};root.JS_SHA256_NO_WINDOW&&(WINDOW=!1);var WEB_WORKER=!WINDOW&&"object"==typeof self,NODE_JS=!root.JS_SHA256_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node;NODE_JS?root=global:WEB_WORKER&&(root=self);var COMMON_JS=!root.JS_SHA256_NO_COMMON_JS&&"object"==typeof module&&module.exports,AMD=__webpack_require__(6),ARRAY_BUFFER=!root.JS_SHA256_NO_ARRAY_BUFFER&&"undefined"!=typeof ArrayBuffer,HEX_CHARS="0123456789abcdef".split(""),EXTRA=[-2147483648,8388608,32768,128],SHIFT=[24,16,8,0],K=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],OUTPUT_TYPES=["hex","array","digest","arrayBuffer"],blocks=[];!root.JS_SHA256_NO_NODE_JS&&Array.isArray||(Array.isArray=function(e){return"[object Array]"===Object.prototype.toString.call(e)}),!ARRAY_BUFFER||!root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW&&ArrayBuffer.isView||(ArrayBuffer.isView=function(e){return"object"==typeof e&&e.buffer&&e.buffer.constructor===ArrayBuffer});var createOutputMethod=function(e,t){return function(r){return new Sha256(t,!0).update(r)[e]()}},createMethod=function(e){var t=createOutputMethod("hex",e);NODE_JS&&(t=nodeWrap(t,e)),t.create=function(){return new Sha256(e)},t.update=function(e){return t.create().update(e)};for(var r=0;r<OUTPUT_TYPES.length;++r){var o=OUTPUT_TYPES[r];t[o]=createOutputMethod(o,e)}return t},nodeWrap=function(method,is224){var crypto=eval("require('crypto')"),Buffer=eval("require('buffer').Buffer"),algorithm=is224?"sha224":"sha256",nodeMethod=function(e){if("string"==typeof e)return crypto.createHash(algorithm).update(e,"utf8").digest("hex");if(null==e)throw new Error(ERROR);return e.constructor===ArrayBuffer&&(e=new Uint8Array(e)),Array.isArray(e)||ArrayBuffer.isView(e)||e.constructor===Buffer?crypto.createHash(algorithm).update(new Buffer(e)).digest("hex"):method(e)};return nodeMethod},createHmacOutputMethod=function(e,t){return function(r,o){return new HmacSha256(r,t,!0).update(o)[e]()}},createHmacMethod=function(e){var t=createHmacOutputMethod("hex",e);t.create=function(t){return new HmacSha256(t,e)},t.update=function(e,r){return t.create(e).update(r)};for(var r=0;r<OUTPUT_TYPES.length;++r){var o=OUTPUT_TYPES[r];t[o]=createHmacOutputMethod(o,e)}return t};function Sha256(e,t){t?(blocks[0]=blocks[16]=blocks[1]=blocks[2]=blocks[3]=blocks[4]=blocks[5]=blocks[6]=blocks[7]=blocks[8]=blocks[9]=blocks[10]=blocks[11]=blocks[12]=blocks[13]=blocks[14]=blocks[15]=0,this.blocks=blocks):this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],e?(this.h0=3238371032,this.h1=914150663,this.h2=812702999,this.h3=4144912697,this.h4=4290775857,this.h5=1750603025,this.h6=1694076839,this.h7=3204075428):(this.h0=1779033703,this.h1=3144134277,this.h2=1013904242,this.h3=2773480762,this.h4=1359893119,this.h5=2600822924,this.h6=528734635,this.h7=1541459225),this.block=this.start=this.bytes=this.hBytes=0,this.finalized=this.hashed=!1,this.first=!0,this.is224=e}function HmacSha256(e,t,r){var o,n=typeof e;if("string"===n){var s,i=[],a=e.length,u=0;for(o=0;o<a;++o)(s=e.charCodeAt(o))<128?i[u++]=s:s<2048?(i[u++]=192|s>>6,i[u++]=128|63&s):s<55296||s>=57344?(i[u++]=224|s>>12,i[u++]=128|s>>6&63,i[u++]=128|63&s):(s=65536+((1023&s)<<10|1023&e.charCodeAt(++o)),i[u++]=240|s>>18,i[u++]=128|s>>12&63,i[u++]=128|s>>6&63,i[u++]=128|63&s);e=i}else{if("object"!==n)throw new Error(ERROR);if(null===e)throw new Error(ERROR);if(ARRAY_BUFFER&&e.constructor===ArrayBuffer)e=new Uint8Array(e);else if(!(Array.isArray(e)||ARRAY_BUFFER&&ArrayBuffer.isView(e)))throw new Error(ERROR)}e.length>64&&(e=new Sha256(t,!0).update(e).array());var h=[],c=[];for(o=0;o<64;++o){var l=e[o]||0;h[o]=92^l,c[o]=54^l}Sha256.call(this,t,r),this.update(c),this.oKeyPad=h,this.inner=!0,this.sharedMemory=r}Sha256.prototype.update=function(e){if(!this.finalized){var t,r=typeof e;if("string"!==r){if("object"!==r)throw new Error(ERROR);if(null===e)throw new Error(ERROR);if(ARRAY_BUFFER&&e.constructor===ArrayBuffer)e=new Uint8Array(e);else if(!(Array.isArray(e)||ARRAY_BUFFER&&ArrayBuffer.isView(e)))throw new Error(ERROR);t=!0}for(var o,n,s=0,i=e.length,a=this.blocks;s<i;){if(this.hashed&&(this.hashed=!1,a[0]=this.block,a[16]=a[1]=a[2]=a[3]=a[4]=a[5]=a[6]=a[7]=a[8]=a[9]=a[10]=a[11]=a[12]=a[13]=a[14]=a[15]=0),t)for(n=this.start;s<i&&n<64;++s)a[n>>2]|=e[s]<<SHIFT[3&n++];else for(n=this.start;s<i&&n<64;++s)(o=e.charCodeAt(s))<128?a[n>>2]|=o<<SHIFT[3&n++]:o<2048?(a[n>>2]|=(192|o>>6)<<SHIFT[3&n++],a[n>>2]|=(128|63&o)<<SHIFT[3&n++]):o<55296||o>=57344?(a[n>>2]|=(224|o>>12)<<SHIFT[3&n++],a[n>>2]|=(128|o>>6&63)<<SHIFT[3&n++],a[n>>2]|=(128|63&o)<<SHIFT[3&n++]):(o=65536+((1023&o)<<10|1023&e.charCodeAt(++s)),a[n>>2]|=(240|o>>18)<<SHIFT[3&n++],a[n>>2]|=(128|o>>12&63)<<SHIFT[3&n++],a[n>>2]|=(128|o>>6&63)<<SHIFT[3&n++],a[n>>2]|=(128|63&o)<<SHIFT[3&n++]);this.lastByteIndex=n,this.bytes+=n-this.start,n>=64?(this.block=a[16],this.start=n-64,this.hash(),this.hashed=!0):this.start=n}return this.bytes>4294967295&&(this.hBytes+=this.bytes/4294967296<<0,this.bytes=this.bytes%4294967296),this}},Sha256.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var e=this.blocks,t=this.lastByteIndex;e[16]=this.block,e[t>>2]|=EXTRA[3&t],this.block=e[16],t>=56&&(this.hashed||this.hash(),e[0]=this.block,e[16]=e[1]=e[2]=e[3]=e[4]=e[5]=e[6]=e[7]=e[8]=e[9]=e[10]=e[11]=e[12]=e[13]=e[14]=e[15]=0),e[14]=this.hBytes<<3|this.bytes>>>29,e[15]=this.bytes<<3,this.hash()}},Sha256.prototype.hash=function(){var e,t,r,o,n,s,i,a,u,h=this.h0,c=this.h1,l=this.h2,f=this.h3,d=this.h4,p=this.h5,y=this.h6,b=this.h7,m=this.blocks;for(e=16;e<64;++e)t=((n=m[e-15])>>>7|n<<25)^(n>>>18|n<<14)^n>>>3,r=((n=m[e-2])>>>17|n<<15)^(n>>>19|n<<13)^n>>>10,m[e]=m[e-16]+t+m[e-7]+r<<0;for(u=c&l,e=0;e<64;e+=4)this.first?(this.is224?(s=300032,b=(n=m[0]-1413257819)-150054599<<0,f=n+24177077<<0):(s=704751109,b=(n=m[0]-210244248)-1521486534<<0,f=n+143694565<<0),this.first=!1):(t=(h>>>2|h<<30)^(h>>>13|h<<19)^(h>>>22|h<<10),o=(s=h&c)^h&l^u,b=f+(n=b+(r=(d>>>6|d<<26)^(d>>>11|d<<21)^(d>>>25|d<<7))+(d&p^~d&y)+K[e]+m[e])<<0,f=n+(t+o)<<0),t=(f>>>2|f<<30)^(f>>>13|f<<19)^(f>>>22|f<<10),o=(i=f&h)^f&c^s,y=l+(n=y+(r=(b>>>6|b<<26)^(b>>>11|b<<21)^(b>>>25|b<<7))+(b&d^~b&p)+K[e+1]+m[e+1])<<0,t=((l=n+(t+o)<<0)>>>2|l<<30)^(l>>>13|l<<19)^(l>>>22|l<<10),o=(a=l&f)^l&h^i,p=c+(n=p+(r=(y>>>6|y<<26)^(y>>>11|y<<21)^(y>>>25|y<<7))+(y&b^~y&d)+K[e+2]+m[e+2])<<0,t=((c=n+(t+o)<<0)>>>2|c<<30)^(c>>>13|c<<19)^(c>>>22|c<<10),o=(u=c&l)^c&f^a,d=h+(n=d+(r=(p>>>6|p<<26)^(p>>>11|p<<21)^(p>>>25|p<<7))+(p&y^~p&b)+K[e+3]+m[e+3])<<0,h=n+(t+o)<<0;this.h0=this.h0+h<<0,this.h1=this.h1+c<<0,this.h2=this.h2+l<<0,this.h3=this.h3+f<<0,this.h4=this.h4+d<<0,this.h5=this.h5+p<<0,this.h6=this.h6+y<<0,this.h7=this.h7+b<<0},Sha256.prototype.hex=function(){this.finalize();var e=this.h0,t=this.h1,r=this.h2,o=this.h3,n=this.h4,s=this.h5,i=this.h6,a=this.h7,u=HEX_CHARS[e>>28&15]+HEX_CHARS[e>>24&15]+HEX_CHARS[e>>20&15]+HEX_CHARS[e>>16&15]+HEX_CHARS[e>>12&15]+HEX_CHARS[e>>8&15]+HEX_CHARS[e>>4&15]+HEX_CHARS[15&e]+HEX_CHARS[t>>28&15]+HEX_CHARS[t>>24&15]+HEX_CHARS[t>>20&15]+HEX_CHARS[t>>16&15]+HEX_CHARS[t>>12&15]+HEX_CHARS[t>>8&15]+HEX_CHARS[t>>4&15]+HEX_CHARS[15&t]+HEX_CHARS[r>>28&15]+HEX_CHARS[r>>24&15]+HEX_CHARS[r>>20&15]+HEX_CHARS[r>>16&15]+HEX_CHARS[r>>12&15]+HEX_CHARS[r>>8&15]+HEX_CHARS[r>>4&15]+HEX_CHARS[15&r]+HEX_CHARS[o>>28&15]+HEX_CHARS[o>>24&15]+HEX_CHARS[o>>20&15]+HEX_CHARS[o>>16&15]+HEX_CHARS[o>>12&15]+HEX_CHARS[o>>8&15]+HEX_CHARS[o>>4&15]+HEX_CHARS[15&o]+HEX_CHARS[n>>28&15]+HEX_CHARS[n>>24&15]+HEX_CHARS[n>>20&15]+HEX_CHARS[n>>16&15]+HEX_CHARS[n>>12&15]+HEX_CHARS[n>>8&15]+HEX_CHARS[n>>4&15]+HEX_CHARS[15&n]+HEX_CHARS[s>>28&15]+HEX_CHARS[s>>24&15]+HEX_CHARS[s>>20&15]+HEX_CHARS[s>>16&15]+HEX_CHARS[s>>12&15]+HEX_CHARS[s>>8&15]+HEX_CHARS[s>>4&15]+HEX_CHARS[15&s]+HEX_CHARS[i>>28&15]+HEX_CHARS[i>>24&15]+HEX_CHARS[i>>20&15]+HEX_CHARS[i>>16&15]+HEX_CHARS[i>>12&15]+HEX_CHARS[i>>8&15]+HEX_CHARS[i>>4&15]+HEX_CHARS[15&i];return this.is224||(u+=HEX_CHARS[a>>28&15]+HEX_CHARS[a>>24&15]+HEX_CHARS[a>>20&15]+HEX_CHARS[a>>16&15]+HEX_CHARS[a>>12&15]+HEX_CHARS[a>>8&15]+HEX_CHARS[a>>4&15]+HEX_CHARS[15&a]),u},Sha256.prototype.toString=Sha256.prototype.hex,Sha256.prototype.digest=function(){this.finalize();var e=this.h0,t=this.h1,r=this.h2,o=this.h3,n=this.h4,s=this.h5,i=this.h6,a=this.h7,u=[e>>24&255,e>>16&255,e>>8&255,255&e,t>>24&255,t>>16&255,t>>8&255,255&t,r>>24&255,r>>16&255,r>>8&255,255&r,o>>24&255,o>>16&255,o>>8&255,255&o,n>>24&255,n>>16&255,n>>8&255,255&n,s>>24&255,s>>16&255,s>>8&255,255&s,i>>24&255,i>>16&255,i>>8&255,255&i];return this.is224||u.push(a>>24&255,a>>16&255,a>>8&255,255&a),u},Sha256.prototype.array=Sha256.prototype.digest,Sha256.prototype.arrayBuffer=function(){this.finalize();var e=new ArrayBuffer(this.is224?28:32),t=new DataView(e);return t.setUint32(0,this.h0),t.setUint32(4,this.h1),t.setUint32(8,this.h2),t.setUint32(12,this.h3),t.setUint32(16,this.h4),t.setUint32(20,this.h5),t.setUint32(24,this.h6),this.is224||t.setUint32(28,this.h7),e},HmacSha256.prototype=new Sha256,HmacSha256.prototype.finalize=function(){if(Sha256.prototype.finalize.call(this),this.inner){this.inner=!1;var e=this.array();Sha256.call(this,this.is224,this.sharedMemory),this.update(this.oKeyPad),this.update(e),Sha256.prototype.finalize.call(this)}};var exports=createMethod();exports.sha256=exports,exports.sha224=createMethod(!0),exports.sha256.hmac=createHmacMethod(),exports.sha224.hmac=createHmacMethod(!0),COMMON_JS?module.exports=exports:(root.sha256=exports.sha256,root.sha224=exports.sha224,AMD&&(__WEBPACK_AMD_DEFINE_RESULT__=function(){return exports}.call(exports,__webpack_require__,exports,module),void 0===__WEBPACK_AMD_DEFINE_RESULT__||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)))}()},function(e,t){(function(t){e.exports=t}).call(this,{})},function(e,t,r){"use strict";r.r(t);var o=r(0),n=r(3),s=r(2),i=r(4),a=r(1);const u=Symbol("buffer"),h=Symbol("type");class c{constructor(){this[h]="";const e=arguments[0],t=arguments[1],r=[];if(e){const t=e,o=Number(t.length);for(let e=0;e<o;e++){const o=t[e];let n;n=o instanceof Buffer?o:ArrayBuffer.isView(o)?Buffer.from(o.buffer,o.byteOffset,o.byteLength):o instanceof ArrayBuffer?Buffer.from(o):o instanceof c?o[u]:Buffer.from("string"==typeof o?o:String(o)),r.push(n)}}this[u]=Buffer.concat(r);let o=t&&void 0!==t.type&&String(t.type).toLowerCase();o&&!/[^\u0020-\u007E]/.test(o)&&(this[h]=o)}get size(){return this[u].length}get type(){return this[h]}slice(){const e=this.size,t=arguments[0],r=arguments[1];let o,n;o=void 0===t?0:t<0?Math.max(e+t,0):Math.min(t,e),n=void 0===r?e:r<0?Math.max(e+r,0):Math.min(r,e);const s=Math.max(n-o,0),i=this[u].slice(o,o+s),a=new c([],{type:arguments[2]});return a[u]=i,a}}function l(e,t,r){Error.call(this,e),this.message=e,this.type=t,r&&(this.code=this.errno=r.code),Error.captureStackTrace(this,this.constructor)}let f;Object.defineProperties(c.prototype,{size:{enumerable:!0},type:{enumerable:!0},slice:{enumerable:!0}}),Object.defineProperty(c.prototype,Symbol.toStringTag,{value:"Blob",writable:!1,enumerable:!1,configurable:!0}),l.prototype=Object.create(Error.prototype),l.prototype.constructor=l,l.prototype.name="FetchError";try{f=require("encoding").convert}catch(e){}const d=Symbol("Body internals"),p=o.PassThrough;function y(e){var t=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=r.size;let s=void 0===n?0:n;var i=r.timeout;let a=void 0===i?0:i;null==e?e=null:"string"==typeof e||m(e)||e instanceof c||Buffer.isBuffer(e)||"[object ArrayBuffer]"===Object.prototype.toString.call(e)||ArrayBuffer.isView(e)||e instanceof o||(e=String(e)),this[d]={body:e,disturbed:!1,error:null},this.size=s,this.timeout=a,e instanceof o&&e.on("error",function(e){const r="AbortError"===e.name?e:new l(`Invalid response body while trying to fetch ${t.url}: ${e.message}`,"system",e);t[d].error=r})}function b(){var e=this;if(this[d].disturbed)return y.Promise.reject(new TypeError(`body used already for: ${this.url}`));if(this[d].disturbed=!0,this[d].error)return y.Promise.reject(this[d].error);if(null===this.body)return y.Promise.resolve(Buffer.alloc(0));if("string"==typeof this.body)return y.Promise.resolve(Buffer.from(this.body));if(this.body instanceof c)return y.Promise.resolve(this.body[u]);if(Buffer.isBuffer(this.body))return y.Promise.resolve(this.body);if("[object ArrayBuffer]"===Object.prototype.toString.call(this.body))return y.Promise.resolve(Buffer.from(this.body));if(ArrayBuffer.isView(this.body))return y.Promise.resolve(Buffer.from(this.body.buffer,this.body.byteOffset,this.body.byteLength));if(!(this.body instanceof o))return y.Promise.resolve(Buffer.alloc(0));let t=[],r=0,n=!1;return new y.Promise(function(o,s){let i;e.timeout&&(i=setTimeout(function(){n=!0,s(new l(`Response timeout while trying to fetch ${e.url} (over ${e.timeout}ms)`,"body-timeout"))},e.timeout)),e.body.on("error",function(t){"AbortError"===t.name?(n=!0,s(t)):s(new l(`Invalid response body while trying to fetch ${e.url}: ${t.message}`,"system",t))}),e.body.on("data",function(o){if(!n&&null!==o){if(e.size&&r+o.length>e.size)return n=!0,void s(new l(`content size at ${e.url} over limit: ${e.size}`,"max-size"));r+=o.length,t.push(o)}}),e.body.on("end",function(){if(!n){clearTimeout(i);try{o(Buffer.concat(t))}catch(t){s(new l(`Could not create Buffer from response body for ${e.url}: ${t.message}`,"system",t))}}})})}function m(e){return"object"==typeof e&&"function"==typeof e.append&&"function"==typeof e.delete&&"function"==typeof e.get&&"function"==typeof e.getAll&&"function"==typeof e.has&&"function"==typeof e.set&&("URLSearchParams"===e.constructor.name||"[object URLSearchParams]"===Object.prototype.toString.call(e)||"function"==typeof e.sort)}function g(e){let t,r,n=e.body;if(e.bodyUsed)throw new Error("cannot clone body after it is used");return n instanceof o&&"function"!=typeof n.getBoundary&&(t=new p,r=new p,n.pipe(t),n.pipe(r),e[d].body=t,n=r),n}function S(e){const t=e.body;return null===t?0:"string"==typeof t?Buffer.byteLength(t):m(t)?Buffer.byteLength(String(t)):t instanceof c?t.size:Buffer.isBuffer(t)?t.length:"[object ArrayBuffer]"===Object.prototype.toString.call(t)?t.byteLength:ArrayBuffer.isView(t)?t.byteLength:t&&"function"==typeof t.getLengthSync&&(t._lengthRetrievers&&0==t._lengthRetrievers.length||t.hasKnownLength&&t.hasKnownLength())?t.getLengthSync():null}y.prototype={get body(){return this[d].body},get bodyUsed(){return this[d].disturbed},arrayBuffer(){return b.call(this).then(function(e){return e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength)})},blob(){let e=this.headers&&this.headers.get("content-type")||"";return b.call(this).then(function(t){return Object.assign(new c([],{type:e.toLowerCase()}),{[u]:t})})},json(){var e=this;return b.call(this).then(function(t){try{return JSON.parse(t.toString())}catch(t){return y.Promise.reject(new l(`invalid json response body at ${e.url} reason: ${t.message}`,"invalid-json"))}})},text(){return b.call(this).then(function(e){return e.toString()})},buffer(){return b.call(this)},textConverted(){var e=this;return b.call(this).then(function(t){return function(e,t){if("function"!=typeof f)throw new Error("The package `encoding` must be installed to use the textConverted() function");const r=t.get("content-type");let o,n,s="utf-8";r&&(o=/charset=([^;]*)/i.exec(r));n=e.slice(0,1024).toString(),!o&&n&&(o=/<meta.+?charset=(['"])(.+?)\1/i.exec(n));!o&&n&&(o=/<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(n))&&(o=/charset=(.*)/i.exec(o.pop()));!o&&n&&(o=/<\?xml.+?encoding=(['"])(.+?)\1/i.exec(n));o&&("gb2312"!==(s=o.pop())&&"gbk"!==s||(s="gb18030"));return f(e,"UTF-8",s).toString()}(t,e.headers)})}},Object.defineProperties(y.prototype,{body:{enumerable:!0},bodyUsed:{enumerable:!0},arrayBuffer:{enumerable:!0},blob:{enumerable:!0},json:{enumerable:!0},text:{enumerable:!0}}),y.mixIn=function(e){for(const t of Object.getOwnPropertyNames(y.prototype))if(!(t in e)){const r=Object.getOwnPropertyDescriptor(y.prototype,t);Object.defineProperty(e,t,r)}},y.Promise=global.Promise;const _=/[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/,A=/[^\t\x20-\x7e\x80-\xff]/;function H(e){if(e=`${e}`,_.test(e))throw new TypeError(`${e} is not a legal HTTP header name`)}function E(e){if(e=`${e}`,A.test(e))throw new TypeError(`${e} is not a legal HTTP header value`)}function w(e,t){t=t.toLowerCase();for(const r in e)if(r.toLowerCase()===t)return r}const R=Symbol("map");class v{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0;if(this[R]=Object.create(null),e instanceof v){const t=e.raw(),r=Object.keys(t);for(const e of r)for(const r of t[e])this.append(e,r)}else if(null==e);else{if("object"!=typeof e)throw new TypeError("Provided initializer must be an object");{const t=e[Symbol.iterator];if(null!=t){if("function"!=typeof t)throw new TypeError("Header pairs must be iterable");const r=[];for(const t of e){if("object"!=typeof t||"function"!=typeof t[Symbol.iterator])throw new TypeError("Each header pair must be iterable");r.push(Array.from(t))}for(const e of r){if(2!==e.length)throw new TypeError("Each header pair must be a name/value tuple");this.append(e[0],e[1])}}else for(const t of Object.keys(e)){const r=e[t];this.append(t,r)}}}}get(e){H(e=`${e}`);const t=w(this[R],e);return void 0===t?null:this[R][t].join(", ")}forEach(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,r=O(this),o=0;for(;o<r.length;){var n=r[o];const s=n[0],i=n[1];e.call(t,i,s,this),r=O(this),o++}}set(e,t){t=`${t}`,H(e=`${e}`),E(t);const r=w(this[R],e);this[R][void 0!==r?r:e]=[t]}append(e,t){t=`${t}`,H(e=`${e}`),E(t);const r=w(this[R],e);void 0!==r?this[R][r].push(t):this[R][e]=[t]}has(e){return H(e=`${e}`),void 0!==w(this[R],e)}delete(e){H(e=`${e}`);const t=w(this[R],e);void 0!==t&&delete this[R][t]}raw(){return this[R]}keys(){return T(this,"key")}values(){return T(this,"value")}[Symbol.iterator](){return T(this,"key+value")}}function O(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"key+value";return Object.keys(e[R]).sort().map("key"===t?function(e){return e.toLowerCase()}:"value"===t?function(t){return e[R][t].join(", ")}:function(t){return[t.toLowerCase(),e[R][t].join(", ")]})}v.prototype.entries=v.prototype[Symbol.iterator],Object.defineProperty(v.prototype,Symbol.toStringTag,{value:"Headers",writable:!1,enumerable:!1,configurable:!0}),Object.defineProperties(v.prototype,{get:{enumerable:!0},forEach:{enumerable:!0},set:{enumerable:!0},append:{enumerable:!0},has:{enumerable:!0},delete:{enumerable:!0},keys:{enumerable:!0},values:{enumerable:!0},entries:{enumerable:!0}});const C=Symbol("internal");function T(e,t){const r=Object.create(B);return r[C]={target:e,kind:t,index:0},r}const B=Object.setPrototypeOf({next(){if(!this||Object.getPrototypeOf(this)!==B)throw new TypeError("Value of `this` is not a HeadersIterator");var e=this[C];const t=e.target,r=e.kind,o=e.index,n=O(t,r);return o>=n.length?{value:void 0,done:!0}:(this[C].index=o+1,{value:n[o],done:!1})}},Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));function j(e){const t=Object.assign({__proto__:null},e[R]),r=w(e[R],"Host");return void 0!==r&&(t[r]=t[r][0]),t}Object.defineProperty(B,Symbol.toStringTag,{value:"HeadersIterator",writable:!1,enumerable:!1,configurable:!0});const x=Symbol("Response internals"),P=n.STATUS_CODES;class X{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};y.call(this,e,t);const r=t.status||200;this[x]={url:t.url,status:r,statusText:t.statusText||P[r],headers:new v(t.headers)}}get url(){return this[x].url}get status(){return this[x].status}get ok(){return this[x].status>=200&&this[x].status<300}get statusText(){return this[x].statusText}get headers(){return this[x].headers}clone(){return new X(g(this),{url:this.url,status:this.status,statusText:this.statusText,headers:this.headers,ok:this.ok})}}y.mixIn(X.prototype),Object.defineProperties(X.prototype,{url:{enumerable:!0},status:{enumerable:!0},ok:{enumerable:!0},statusText:{enumerable:!0},headers:{enumerable:!0},clone:{enumerable:!0}}),Object.defineProperty(X.prototype,Symbol.toStringTag,{value:"Response",writable:!1,enumerable:!1,configurable:!0});const k=Symbol("Request internals"),U=s.parse,M=s.format,I="destroy"in o.Readable.prototype;function F(e){return"object"==typeof e&&"object"==typeof e[k]}class z{constructor(e){let t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};F(e)?t=U(e.url):(t=e&&e.href?U(e.href):U(`${e}`),e={});let o=r.method||e.method||"GET";if(o=o.toUpperCase(),(null!=r.body||F(e)&&null!==e.body)&&("GET"===o||"HEAD"===o))throw new TypeError("Request with GET/HEAD method cannot have body");let n=null!=r.body?r.body:F(e)&&null!==e.body?g(e):null;y.call(this,n,{timeout:r.timeout||e.timeout||0,size:r.size||e.size||0});const s=new v(r.headers||e.headers||{});if(null!=r.body){const e=function(e){const t=e.body;return null===t?null:"string"==typeof t?"text/plain;charset=UTF-8":m(t)?"application/x-www-form-urlencoded;charset=UTF-8":t instanceof c?t.type||null:Buffer.isBuffer(t)?null:"[object ArrayBuffer]"===Object.prototype.toString.call(t)?null:ArrayBuffer.isView(t)?null:"function"==typeof t.getBoundary?`multipart/form-data;boundary=${t.getBoundary()}`:null}(this);null===e||s.has("Content-Type")||s.append("Content-Type",e)}let i=F(e)?e.signal:null;if("signal"in r&&(i=r.signal),null!=i&&!function(e){const t=e&&"object"==typeof e&&Object.getPrototypeOf(e);return!(!t||"AbortSignal"!==t.constructor.name)}(i))throw new TypeError("Expected signal to be an instanceof AbortSignal");this[k]={method:o,redirect:r.redirect||e.redirect||"follow",headers:s,parsedURL:t,signal:i},this.follow=void 0!==r.follow?r.follow:void 0!==e.follow?e.follow:20,this.compress=void 0!==r.compress?r.compress:void 0===e.compress||e.compress,this.counter=r.counter||e.counter||0,this.agent=r.agent||e.agent}get method(){return this[k].method}get url(){return M(this[k].parsedURL)}get headers(){return this[k].headers}get redirect(){return this[k].redirect}get signal(){return this[k].signal}clone(){return new z(this)}}function L(e){Error.call(this,e),this.type="aborted",this.message=e,Error.captureStackTrace(this,this.constructor)}y.mixIn(z.prototype),Object.defineProperty(z.prototype,Symbol.toStringTag,{value:"Request",writable:!1,enumerable:!1,configurable:!0}),Object.defineProperties(z.prototype,{method:{enumerable:!0},url:{enumerable:!0},headers:{enumerable:!0},redirect:{enumerable:!0},clone:{enumerable:!0},signal:{enumerable:!0}}),L.prototype=Object.create(Error.prototype),L.prototype.constructor=L,L.prototype.name="AbortError";const $=o.PassThrough,D=s.resolve;function N(e,t){if(!N.Promise)throw new Error("native promise missing, set fetch.Promise to your favorite alternative");return y.Promise=N.Promise,new N.Promise(function(r,s){const h=new z(e,t),f=function(e){const t=e[k].parsedURL,r=new v(e[k].headers);if(r.has("Accept")||r.set("Accept","*/*"),!t.protocol||!t.hostname)throw new TypeError("Only absolute URLs are supported");if(!/^https?:$/.test(t.protocol))throw new TypeError("Only HTTP(S) protocols are supported");if(e.signal&&e.body instanceof o.Readable&&!I)throw new Error("Cancellation of streamed requests with AbortSignal is not supported in node < 8");let n=null;if(null==e.body&&/^(POST|PUT)$/i.test(e.method)&&(n="0"),null!=e.body){const t=S(e);"number"==typeof t&&(n=String(t))}return n&&r.set("Content-Length",n),r.has("User-Agent")||r.set("User-Agent","node-fetch/1.0 (+https://github.com/bitinn/node-fetch)"),e.compress&&!r.has("Accept-Encoding")&&r.set("Accept-Encoding","gzip,deflate"),r.has("Connection")||e.agent||r.set("Connection","close"),Object.assign({},t,{method:e.method,headers:j(r),agent:e.agent})}(h),d=("https:"===f.protocol?i:n).request,p=h.signal;let y=null;const b=function(){let e=new L("The user aborted a request.");s(e),h.body&&h.body instanceof o.Readable&&h.body.destroy(e),y&&y.body&&y.body.emit("error",e)};if(p&&p.aborted)return void b();const g=function(){b(),w()},H=d(f);let E;function w(){H.abort(),p&&p.removeEventListener("abort",g),clearTimeout(E)}p&&p.addEventListener("abort",g),h.timeout&&H.once("socket",function(e){E=setTimeout(function(){s(new l(`network timeout at: ${h.url}`,"request-timeout")),w()},h.timeout)}),H.on("error",function(e){s(new l(`request to ${h.url} failed, reason: ${e.message}`,"system",e)),w()}),H.on("response",function(e){clearTimeout(E);const t=function(e){const t=new v;for(const r of Object.keys(e))if(!_.test(r))if(Array.isArray(e[r]))for(const o of e[r])A.test(o)||(void 0===t[R][r]?t[R][r]=[o]:t[R][r].push(o));else A.test(e[r])||(t[R][r]=[e[r]]);return t}(e.headers);if(N.isRedirect(e.statusCode)){const o=t.get("Location"),n=null===o?null:D(h.url,o);switch(h.redirect){case"error":return s(new l(`redirect mode is set to error: ${h.url}`,"no-redirect")),void w();case"manual":if(null!==n)try{t.set("Location",n)}catch(e){s(e)}break;case"follow":if(null===n)break;if(h.counter>=h.follow)return s(new l(`maximum redirect reached at: ${h.url}`,"max-redirect")),void w();const o={headers:new v(h.headers),follow:h.follow,counter:h.counter+1,agent:h.agent,compress:h.compress,method:h.method,body:h.body,signal:h.signal};return 303!==e.statusCode&&h.body&&null===S(h)?(s(new l("Cannot follow redirect with body being a readable stream","unsupported-redirect")),void w()):(303!==e.statusCode&&(301!==e.statusCode&&302!==e.statusCode||"POST"!==h.method)||(o.method="GET",o.body=void 0,o.headers.delete("content-length")),r(N(new z(n,o))),void w())}}e.once("end",function(){p&&p.removeEventListener("abort",g)});let o=e.pipe(new $);const n={url:h.url,status:e.statusCode,statusText:e.statusMessage,headers:t,size:h.size,timeout:h.timeout},i=t.get("Content-Encoding");if(!h.compress||"HEAD"===h.method||null===i||204===e.statusCode||304===e.statusCode)return y=new X(o,n),void r(y);const u={flush:a.Z_SYNC_FLUSH,finishFlush:a.Z_SYNC_FLUSH};if("gzip"==i||"x-gzip"==i)return o=o.pipe(a.createGunzip(u)),y=new X(o,n),void r(y);if("deflate"!=i&&"x-deflate"!=i)y=new X(o,n),r(y);else{e.pipe(new $).once("data",function(e){o=8==(15&e[0])?o.pipe(a.createInflate()):o.pipe(a.createInflateRaw()),y=new X(o,n),r(y)})}}),function(e,t){const r=t.body;null===r?e.end():"string"==typeof r?(e.write(r),e.end()):m(r)?(e.write(Buffer.from(String(r))),e.end()):r instanceof c?(e.write(r[u]),e.end()):Buffer.isBuffer(r)?(e.write(r),e.end()):"[object ArrayBuffer]"===Object.prototype.toString.call(r)?(e.write(Buffer.from(r)),e.end()):ArrayBuffer.isView(r)?(e.write(Buffer.from(r.buffer,r.byteOffset,r.byteLength)),e.end()):r.pipe(e)}(H,h)})}N.isRedirect=function(e){return 301===e||302===e||303===e||307===e||308===e},N.Promise=global.Promise;var q=N,W=r(5),J=r.n(W);const{JOOMAG_API_ENDPOINT:K}=process.env,{JOOMAG_API_ID:Y}=process.env,{JOOMAG_API_SECRET:V}=process.env;var G={},Z=new Array;async function Q(e){for(var t=0,r=0;r<Z.length&&Z[r].ts<e;r++)t++;if(t>0){for(r=0;r<t;r++)console.log("removing cache: "+Z[r].key),delete G[Z[r].key];Z.splice(0,t)}}exports.handler=(async(e,t)=>{var r=new Date,o=Date.now()-3e4,n=e.queryStringParameters.pubid;if(!n||!n.match(/^[A-Za-z0-9]{5,100}$/))throw"pubid must be ^[a-zA-Z0-9]{5,100}$";var s=G[n];if(s&&s.ts&&s.ts>o)return{statusCode:200,headers:{"Content-Type":"application/vnd.cpu.republivision.v1+json","Access-Control-Allow-Origin":"*","x-joomag-cache-status":"hit"},body:s.data};var i=K+"/magazines/"+n+"/issues",a="GET"+i,u=J.a.hmac(V,a),h=Date.now();return Promise.all([q(i,{headers:{key:Y,sig:u}}),Q(o)]).then(e=>e[0].json()).then(function(e){var t=JSON.stringify(e.data);console.log({ts:r.toISOString(),duration:Date.now()-h,pubid:n,status:"OK",length:t.length,jmStatus:e.error,jmMsg:e.message,rsp100:t.substr(0,100)});var o={statusCode:200,headers:{"Content-Type":"application/vnd.cpu.republivision.v1+json","Access-Control-Allow-Origin":"*","x-joomag-cache-status":"miss"},body:t},s={ts:Date.now(),key:n,data:t};return G[n]=s,Z.push(s),o}).catch(function(e){var t=String(e);return console.error({ts:r.toISOString(),duration:Date.now()-h,pubid:n,status:"ERROR",error:t}),{statusCode:500,body:t}})})}]);