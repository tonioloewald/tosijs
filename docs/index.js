var Ll=Object.defineProperty;var El=(n)=>n;function nr(n,e){this[n]=El.bind(null,e)}var bi=(n,e)=>{for(var t in e)Ll(n,t,{get:e[t],enumerable:!0,configurable:!0,set:nr.bind(e,t)})};var er=((n)=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(e,t)=>(typeof require<"u"?require:e)[t]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var Fe={};bi(Fe,{xinValue:()=>hr,xinSlot:()=>s1,xinProxy:()=>ra,xinPath:()=>dr,xin:()=>Q,warnDeprecated:()=>tn,version:()=>Ct,vars:()=>d,varDefault:()=>u,validateAgainstConstraints:()=>oa,updates:()=>Gi,unobserve:()=>_e,touchElement:()=>Mi,touch:()=>E,tosiValue:()=>D,tosiUnique:()=>k1,tosiSlot:()=>o1,tosiSetValue:()=>rr,tosiPath:()=>on,tosiLoader:()=>S1,tosiBlueprint:()=>B1,tosiAccessor:()=>lr,tosi:()=>H,throttle:()=>he,sync:()=>w1,svgElements:()=>wt,share:()=>x1,settings:()=>yt,scrollListItemIntoView:()=>Jr,onThemePreferencesChange:()=>Yi,onStylesheetChange:()=>Ir,on:()=>pe,observe:()=>Hi,mathML:()=>ea,makeComponent:()=>Ei,invertLuminance:()=>Re,initVars:()=>_r,hotReload:()=>Ji,getThemePreferences:()=>Xe,getListItem:()=>mn,getListInstance:()=>Zi,getListBinding:()=>vt,getCssVar:()=>Zs,elements:()=>x,deprecated:()=>en,deleteListItem:()=>Zr,debounce:()=>Jn,css:()=>ce,boxedProxy:()=>Li,boxed:()=>dn,blueprintLoader:()=>z1,blueprint:()=>A1,bindings:()=>sn,bindParts:()=>Rr,bind:()=>Vn,TOSI_ACCESSOR:()=>Wi,TAKE_DESCRIPTOR:()=>bt,StyleSheet:()=>Bn,MoreMath:()=>zr,Component:()=>f,Color:()=>v,BlueprintLoader:()=>no,Blueprint:()=>Bt});function Mn(n){if(n==null||typeof n!=="object")return n;if(n instanceof Set)return new Set(n);else if(Array.isArray(n))return n.map(Mn);let e={};for(let t in n){let i=n[t];if(n!=null&&typeof n==="object")e[t]=Mn(i);else e[t]=i}return e}var Fi="-xin-data",re=`.${Fi}`,Us="-xin-event",xs=`.${Us}`,jn=Symbol.for("xin-path"),de=Symbol.for("xin-value"),tr="xinObserve",ir="xinBind",or="xinOn",Wi=Symbol.for("tosi-accessor"),bt=Symbol.for("tosi-take"),ut=Symbol("list-binding"),le=Symbol("list-instance"),zi=new Map;function sr(n,e){let t=zi.get(n);if(t===void 0)t=new Set,zi.set(n,t);t.add(e)}function ar(n){return zi.get(n)}var bs=new Set;function tn(n,e){if(!bs.has(n))console.warn(e),bs.add(n)}function en(n,e){let t=!1;return(...i)=>{if(!t)console.warn(e),t=!0;return n(...i)}}var on=(n)=>{return n&&n[jn]||void 0};function D(n){if(typeof n==="object"&&n!==null){let e=n[de];return e!==void 0?e:n}return n}function lr(n){return n!=null?n[Wi]:void 0}function rr(n,e){if(on(n)===void 0)throw Error("tosiSetValue requires a xin or boxed proxy");n[de]=e}var dr=en(on,"xinPath is deprecated. Use tosiPath instead."),hr=en(D,"xinValue is deprecated. Use tosiValue instead."),Ve=new WeakMap,qn=new WeakMap,qe=(n)=>{let e=n.cloneNode();if(e instanceof Element){let t=qn.get(n),i=Ve.get(n);if(t!=null)qn.set(e,Mn(t));if(i!=null)Ve.set(e,Mn(i))}for(let t of Array.from(n instanceof HTMLTemplateElement?n.content.childNodes:n.childNodes))if(t instanceof Element||t instanceof DocumentFragment)e.appendChild(qe(t));else e.appendChild(t.cloneNode());return e},yt={debug:!1,perf:!1},cr=(n)=>{try{return JSON.stringify(n)}catch(e){return"{has circular references}"}},Rs=(...n)=>Error(n.map(cr).join(" ")),pr=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),ur=0,yr=()=>(parseInt("10000",36)+ ++ur).toString(36).slice(-5),Xs=()=>pr()+yr(),Oi=Symbol("delete"),Fs=Symbol("new-object"),fi=Symbol("automatic-index");function Ws(n){if(n==="")return[];if(Array.isArray(n))return n;else{let e=[];while(n.length>0){let t=n.search(/\[[^\]]+\]/);if(t===-1){e.push(n.split("."));break}else{let i=n.slice(0,t);if(n=n.slice(t),i!=="")e.push(i.split("."));if(t=n.indexOf("]")+1,e.push(n.slice(1,t-1)),n.slice(t,t+1)===".")t+=1;n=n.slice(t)}}return e}}var Tn=new WeakMap;function Gs(n,e){if(Tn.get(n)===void 0)Tn.set(n,{});if(Tn.get(n)[e]===void 0)Tn.get(n)[e]={};let t=Tn.get(n)[e];if(e==="_auto_")n.forEach((i,o)=>{if(i[fi]===void 0)i[fi]=Xs();t[i[fi]+""]=o});else n.forEach((i,o)=>{t[$(i,e)+""]=o});return t}function mr(n,e){if(Tn.get(n)===void 0||Tn.get(n)[e]===void 0)return Gs(n,e);else return Tn.get(n)[e]}function gr(n,e,t){t=t+"";let i=mr(n,e)[t];if(i===void 0||$(n[i],e)+""!==t)i=Gs(n,e)[t];return i}function xr(n,e,t){if(n[e]===void 0&&t!==void 0)n[e]=t;return n[e]}function Ys(n,e,t,i){let o=e!==""?gr(n,e,t):t;if(i===Oi)return n.splice(o,1),Tn.delete(n),Symbol("deleted");else if(i===Fs){if(e===""&&n[o]===void 0)n[o]={}}else if(i!==void 0)if(o!==void 0)n[o]=i;else if(e!==""&&$(i,e)+""===t+"")n.push(i),o=n.length-1;else throw Error(`byIdPath insert failed at [${e}=${t}]`);return n[o]}function fs(n){if(!Array.isArray(n))throw Rs("setByPath failed: expected array, found",n)}function ws(n){if(n==null||!(n instanceof Object))throw Rs("setByPath failed: expected Object, found",n)}function $(n,e){let t=Ws(e),i=n,o,s,a,r;for(o=0,s=t.length;i!==void 0&&o<s;o++){let l=t[o];if(Array.isArray(l))for(a=0,r=l.length;i!==void 0&&a<r;a++){let h=l[a];i=i[h]}else if(i.length===0){if(i=i[Number(l.slice(1))],l[0]!=="=")return}else if(l.includes("=")){let[h,...c]=l.split("=");i=Ys(i,h,c.join("="))}else a=parseInt(l,10),i=i[a]}return i}function Ne(n,e,t){let i=n;if(e==="")throw Error("setByPath cannot be used to set the root object");let o=Ws(e);while(i!=null&&o.length>0){let s=o.shift();if(typeof s==="string"){let a=s.indexOf("=");if(a>-1){if(a===0)ws(i);else fs(i);let r=s.slice(0,a),l=s.slice(a+1);if(i=Ys(i,r,l,o.length>0?Fs:t),o.length===0)return!0}else{fs(i);let r=parseInt(s,10);if(o.length>0)i=i[r];else{if(t!==Oi){if(i[r]===t)return!1;i[r]=t}else i.splice(r,1);return!0}}}else if(Array.isArray(s)&&s.length>0){ws(i);while(s.length>0){let a=s.shift();if(s.length>0||o.length>0)i=xr(i,a,s.length>0?{}:[]);else{if(t!==Oi){if(i[a]===t)return!1;i[a]=t}else{if(!Object.prototype.hasOwnProperty.call(i,a))return!1;delete i[a]}return!0}}}else throw Error(`setByPath failed, bad path ${e}`)}throw Error(`setByPath(${n}, ${e}, ${t}) failed`)}var L={},Pi=null,br=(n)=>{Pi=n},ft=()=>{if(Pi===null)throw Error("xin proxy not initialized");return Pi},Ii=null,Ti=null,fr=(n,e)=>{Ii=n,Ti=e},wr=()=>{if(Ii===null)throw Error("bind not initialized");return Ii},vr=()=>{if(Ti===null)throw Error("on not initialized");return Ti},vs=Symbol("observer should be removed"),mt=[],ae=[],Vi=!1,qi,_i;function kr(n,e,t,i){let o=ar(n);if(o===void 0)return[];let s=[];for(let a of o){let r=$(t,a);if(r!==void 0)s.push(`${n}[${a}=${r}]${i}`)}return s}class Ks{description;test;callback;constructor(n,e){let t=typeof e==="string"?`"${e}"`:`function ${e.name}`,i;if(typeof n==="string")this.test=(o)=>typeof o==="string"&&o!==""&&(n.startsWith(o)||o.startsWith(n)),i=`test = "${n}"`;else if(n instanceof RegExp)this.test=n.test.bind(n),i=`test = "${n.toString()}"`;else if(n instanceof Function)this.test=n,i=`test = function ${n.name}`;else throw Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${i}, ${t}`,typeof e==="function")this.callback=e;else throw Error("expect callback to be a path or function");mt.push(this)}}var Gi=async()=>{if(qi===void 0)return;await qi},Cr=()=>{if(yt.perf)console.time("xin async update");let n=Array.from(ae);ae.length=0,Vi=!1;for(let e of n)mt.filter((t)=>{let i;try{i=t.test(e)}catch(o){throw Error(`Listener ${t.description} threw "${o}" at "${e}"`)}if(i===vs)return _e(t),!1;return i}).forEach((t)=>{let i;try{i=t.callback(e)}catch(o){console.error(`Listener ${t.description} threw "${o}" handling "${e}"`)}if(i===vs)_e(t)});if(typeof _i==="function")_i();if(yt.perf)console.timeEnd("xin async update")},E=(n)=>{let e=typeof n==="string"?n:on(n);if(e===void 0)throw console.error("touch was called on an invalid target",n),Error("touch was called on an invalid target");if(Vi===!1)qi=new Promise((i)=>{_i=i}),Vi=setTimeout(Cr);if(ae.find((i)=>e.startsWith(i))==null)ae.push(e);let t=e.match(/^(.+)\[(\d+)\](.*)$/);if(t!==null){let[,i,o,s]=t,a=parseInt(o,10),r=$(L,`${i}[${a}]`);if(r!=null){let l=kr(i,a,r,s);for(let h of l)if(ae.find((c)=>h.startsWith(c))==null)ae.push(h)}}},Ue=(n,e)=>{return new Ks(n,e)},_e=(n)=>{let e=mt.indexOf(n);if(e>-1)mt.splice(e,1);else throw Error("unobserve failed, listener not found")},Qs=(n,e)=>{let t=new Event(e);n.dispatchEvent(t)},$s=(n)=>{if(n instanceof HTMLInputElement)return n.type;else if(n instanceof HTMLSelectElement&&n.hasAttribute("multiple"))return"multi-select";else return"other"},jr=(n,e)=>{switch($s(n)){case"radio":n.checked=n.value===e;break;case"checkbox":n.checked=!!e;break;case"date":n.valueAsDate=new Date(e);break;case"multi-select":for(let t of Array.from(n.querySelectorAll("option")))t.selected=e[t.value];break;default:n.value=e}},Br=(n)=>{switch($s(n)){case"radio":{let e=n.parentElement?.querySelector(`[name="${n.name}"]:checked`);return e!=null?e.value:null}case"checkbox":return n.checked;case"date":return n.valueAsDate?.toISOString();case"multi-select":return Array.from(n.querySelectorAll("option")).reduce((e,t)=>{return e[t.value]=t.selected,e},{});default:return n.value}},{ResizeObserver:ks}=globalThis,Di=ks!=null?new ks((n)=>{for(let e of n){let t=e.target;Qs(t,"resize")}}):{observe(){},unobserve(){}},Cs=(n,e,t=!0)=>{if(n!=null&&e!=null)if(typeof e==="string")n.textContent=e;else if(Array.isArray(e))e.forEach((i)=>{n.append(i instanceof Node&&t?qe(i):i)});else if(e instanceof Node)n.append(t?qe(e):e);else throw Error("expect text content or document node")},Jn=(n,e=250)=>{let t;return(...i)=>{if(t!==void 0)clearTimeout(t);t=setTimeout(()=>{n(...i)},e)}},he=(n,e=250)=>{let t,i=Date.now()-e,o=!1;return(...s)=>{if(clearTimeout(t),t=setTimeout(()=>{n(...s),i=Date.now()},e),!o&&Date.now()-i>=e){o=!0;try{n(...s),i=Date.now()}finally{o=!1}}}},sn={value:{toDOM:jr,fromDOM(n){return Br(n)}},text:{toDOM(n,e){n.textContent=e}},enabled:{toDOM(n,e){n.disabled=!e}},disabled:{toDOM(n,e){n.disabled=Boolean(e)}},list:{toDOM(n,e,t){vt(n,e,t).update(e)}}};function Cn(n){return n.replace(/[A-Z]/g,(e)=>{return`-${e.toLocaleLowerCase()}`})}function Hs(n){return n.replace(/-([a-z])/g,(e,t)=>{return t.toLocaleUpperCase()})}var Sr=180/Math.PI,Ar=Math.PI/180;function kn(n,e,t){return t<n?NaN:e<n?n:e>t?t:e}function Un(n,e,t,i=!0){if(i)t=kn(0,t,1);return t*(e-n)+n}var zr={RADIANS_TO_DEGREES:Sr,DEGREES_TO_RADIANS:Ar,clamp:kn,lerp:Un};function Zs(n,e=document.body){let t=getComputedStyle(e);if(n.endsWith(")")&&n.startsWith("var("))n=n.slice(4,-1);return t.getPropertyValue(n).trim()}var Or=(n,e,t)=>{return(0.299*n+0.587*e+0.114*t)/255},Hn=(n)=>("00"+Math.round(Number(n)).toString(16)).slice(-2);class Ms{h;s;l;constructor(n,e,t){n/=255,e/=255,t/=255;let i=Math.max(n,e,t),o=i-Math.min(n,e,t),s=o!==0?i===n?(e-t)/o:i===e?2+(t-n)/o:4+(n-e)/o:0;this.h=60*s<0?60*s+360:60*s,this.s=o!==0?i<=0.5?o/(2*i-o):o/(2-(2*i-o)):0,this.l=(2*i-o)/2}}var Rn=globalThis.document!==void 0?globalThis.document.createElement("span"):void 0;if(Rn)Rn.style.display="none";class v{r;g;b;a;static fromVar(n,e=document.body){return v.fromCss(Zs(n,e))}static fromCss(n){let e=n.match(/^#([0-9a-fA-F]+)$/);if(e){let l=e[1];if(l.length===3)return new v(parseInt(l[0]+l[0],16),parseInt(l[1]+l[1],16),parseInt(l[2]+l[2],16));if(l.length===4)return new v(parseInt(l[0]+l[0],16),parseInt(l[1]+l[1],16),parseInt(l[2]+l[2],16),parseInt(l[3]+l[3],16)/255);if(l.length===6)return new v(parseInt(l.slice(0,2),16),parseInt(l.slice(2,4),16),parseInt(l.slice(4,6),16));if(l.length===8)return new v(parseInt(l.slice(0,2),16),parseInt(l.slice(2,4),16),parseInt(l.slice(4,6),16),parseInt(l.slice(6,8),16)/255)}let t=n;if(Rn instanceof HTMLSpanElement)Rn.style.color="black",Rn.style.color=n,document.body.appendChild(Rn),t=getComputedStyle(Rn).color,Rn.remove();let[i,o,s,a]=t.match(/[\d.]+/g)||["0","0","0","0"],r=t.startsWith("color(srgb")?255:1;return new v(Number(i)*r,Number(o)*r,Number(s)*r,a==null?1:Number(a))}static fromHsl(n,e,t,i=1){let o,s,a;if(e===0)o=s=a=t;else{let l=(y,w,g)=>{if(g<0)g+=1;if(g>1)g-=1;if(g<0.16666666666666666)return y+(w-y)*6*g;if(g<0.5)return w;if(g<0.6666666666666666)return y+(w-y)*(0.6666666666666666-g)*6;return y},h=t<0.5?t*(1+e):t+e-t*e,c=2*t-h,p=(n%360+360)%360/360;o=l(c,h,p+0.3333333333333333),s=l(c,h,p),a=l(c,h,p-0.3333333333333333)}let r=new v(o*255,s*255,a*255,i);return r.hslCached={h:(n%360+360)%360,s:e,l:t},r}static black=new v(0,0,0);static white=new v(255,255,255);constructor(n,e,t,i=1){this.r=kn(0,n,255),this.g=kn(0,e,255),this.b=kn(0,t,255),this.a=kn(0,i,1)}get inverse(){return new v(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:n,s:e,l:t}=this._hsl;return v.fromHsl(n,e,1-t,this.a)}get opaque(){return this.a===1?this:new v(this.r,this.g,this.b,1)}contrasting(n=1){return this.opaque.blend(this.brightness>0.5?v.black:v.white,n)}get rgb(){let{r:n,g:e,b:t}=this;return`rgb(${n.toFixed(0)},${e.toFixed(0)},${t.toFixed(0)})`}get rgba(){let{r:n,g:e,b:t,a:i}=this;return`rgba(${n.toFixed(0)},${e.toFixed(0)},${t.toFixed(0)},${i.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}hslCached;get _hsl(){if(this.hslCached==null)this.hslCached=new Ms(this.r,this.g,this.b);return this.hslCached}get hsl(){let{h:n,s:e,l:t}=this._hsl;return`hsl(${n.toFixed(0)}deg ${(e*100).toFixed(0)}% ${(t*100).toFixed(0)}%)`}get hsla(){let{h:n,s:e,l:t}=this._hsl;return`hsl(${n.toFixed(0)}deg ${(e*100).toFixed(0)}% ${(t*100).toFixed(0)}% / ${(this.a*100).toFixed(0)}%)`}get mono(){let n=this.brightness*255;return new v(n,n,n)}get brightness(){return Or(this.r,this.g,this.b)}get html(){return this.toString()}toString(){return this.a===1?"#"+Hn(this.r)+Hn(this.g)+Hn(this.b):"#"+Hn(this.r)+Hn(this.g)+Hn(this.b)+Hn(Math.floor(255*this.a))}brighten(n){let{h:e,s:t,l:i}=this._hsl,o=kn(0,i+n*(1-i),1);return v.fromHsl(e,t,o,this.a)}darken(n){let{h:e,s:t,l:i}=this._hsl,o=kn(0,i*(1-n),1);return v.fromHsl(e,t,o,this.a)}saturate(n){let{h:e,s:t,l:i}=this._hsl,o=kn(0,t+n*(1-t),1);return v.fromHsl(e,o,i,this.a)}desaturate(n){let{h:e,s:t,l:i}=this._hsl,o=kn(0,t*(1-n),1);return v.fromHsl(e,o,i,this.a)}rotate(n){let{h:e,s:t,l:i}=this._hsl,o=(e+360+n)%360;return v.fromHsl(o,t,i,this.a)}opacity(n){let{h:e,s:t,l:i}=this._hsl;return v.fromHsl(e,t,i,n)}swatch(){return console.log(`%c      %c ${this.html}, ${this.rgba}`,`background-color: ${this.html}`,"background-color: transparent"),this}blend(n,e){return new v(Un(this.r,n.r,e),Un(this.g,n.g,e),Un(this.b,n.b,e),Un(this.a,n.a,e))}static blendHue(n,e,t){let i=(e-n+720)%360;if(i<180)return n+t*i;else return n-(360-i)*t}mix(n,e){let t=this._hsl,i=n._hsl;return v.fromHsl(t.s===0?i.h:i.s===0?t.h:v.blendHue(t.h,i.h,e),Un(t.s,i.s,e),Un(t.l,i.l,e),Un(this.a,n.a,e))}colorMix(n,e){return v.fromCss(`color-mix(in hsl, ${this.html}, ${n.html} ${(e*100).toFixed(0)}%)`)}static computedColorStylesheet=null;static computedColors=new Map;static recomputeQueued=!1;static registerComputedColor(n,e,t,i){if(!v.computedColors.has(n))v.computedColors.set(n,{varName:e,scale:t,method:i}),v.queueRecompute()}static queueRecompute(){if(v.recomputeQueued)return;v.recomputeQueued=!0,queueMicrotask(()=>{v.recomputeQueued=!1,v.recomputeColors()})}static recomputeColors(){if(v.computedColors.size===0)return;let n=[];for(let[t,{varName:i,scale:o,method:s}]of v.computedColors)try{let a=v.fromVar(i),r;switch(s){case"b":r=o>0?a.brighten(o):a.darken(-o);break;case"s":r=o>0?a.saturate(o):a.desaturate(-o);break;case"h":r=a.rotate(o*100);break;case"o":r=a.opacity(o);break;default:continue}n.push(`  ${t}: ${r.rgba};`)}catch(a){}if(n.length===0)return;let e=`:root {
${n.join(`
`)}
}`;if(v.computedColorStylesheet===null)v.computedColorStylesheet=document.createElement("style"),v.computedColorStylesheet.id="tosijs-computed-colors",document.head.append(v.computedColorStylesheet);v.computedColorStylesheet.textContent=e}}var gt=new Set,js=!1;function Pr(){if(!js)js=!0,gt.add(()=>v.queueRecompute())}function Ir(n){return gt.add(n),()=>gt.delete(n)}function Tr(){Pr();for(let n of gt)n()}function Bn(n,e){let t=D(e),i=x.style(ce(t));i.id=n,document.head.append(i);let o=on(e);if(o!==void 0)Hi(o,()=>{i.textContent=ce(D(e)),Tr()})}var Vr=/^(animation-iteration-count|column-count|flex(-grow|-shrink)?|font-weight|line-height|opacity|order|orphans|scale|tab-size|widows|z-index|zoom)$/,Js=(n,e)=>{if(typeof e==="number"&&!Vr.test(n))e=`${e}px`;if(n.startsWith("_"))if(n.startsWith("__"))n="--"+n.substring(2),e=`var(${n}-default, ${e})`;else n="--"+n.substring(1);return{prop:n,value:String(e)}},qr=(n,e,t)=>{if(t===void 0)return"";if(t instanceof v)t=t.html;let i=Js(e,t);return`${n}  ${i.prop}: ${i.value};`},Ls=(n,e,t="")=>{let i=Cn(n);if(typeof e==="object"&&!(e instanceof v)){let o=Object.keys(e).map((s)=>Ls(s,e[s],`${t}  `)).join(`
`);return`${t}  ${n} {
${o}
${t}  }`}else return qr(t,i,e)},ce=(n,e="")=>{return Object.keys(n).map((t)=>{let i=n[t];if(typeof i==="string"){if(t==="@import")return`@import url('${i}');`;throw Error("top-level string value only allowed for `@import`")}let o=Object.keys(i).map((s)=>Ls(s,i[s])).join(`
`);return`${e}${t} {
${o}
}`}).join(`

`)},_r=(n)=>{tn("initVars","initVars is deprecated. Just use _ and __ prefixes instead.");let e={};for(let t of Object.keys(n)){let i=n[t],o=Cn(t);e[`--${o}`]=typeof i==="number"&&i!==0?String(i)+"px":i}return e},Re=(n)=>{let e={};for(let t of Object.keys(n)){let i=n[t];if(i instanceof v)e[t]=i.inverseLuminance;else if(typeof i==="string"&&i.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/))e[t]=v.fromCss(i).inverseLuminance}return e},u=new Proxy({},{get(n,e){if(n[e]===void 0){let t="--"+Cn(e);n[e]=(i)=>`var(${t}, ${i})`}return n[e]}}),d=new Proxy({},{get(n,e){if(e==="default")return u;if(n[e]==null){e=Cn(e);let[,t,,i,o,s]=e.match(/^([-\w]*?)((_)?(\d+)(\w?))?$/)||["",e],a=`--${t}`;if(o!=null){let r=i==null?Number(o)/100:-Number(o)/100;switch(s){case"b":case"s":case"h":case"o":{let l=`--${e}`;v.registerComputedColor(l,a,r,s),n[e]=`var(${l})`}break;case"":n[e]=`calc(var(${a}) * ${r})`;break;default:throw console.error(s),Error(`Unrecognized method ${s} for css variable ${a}`)}}else n[e]=`var(${a})`}return n[e]}});function Xe(){let n=(e)=>typeof matchMedia<"u"&&matchMedia(e).matches;return{colorScheme:n("(prefers-color-scheme: dark)")?"dark":"light",contrast:n("(prefers-contrast: more)")?"more":n("(prefers-contrast: less)")?"less":n("(prefers-contrast: custom)")?"custom":"no-preference",reducedMotion:n("(prefers-reduced-motion: reduce)"),reducedTransparency:n("(prefers-reduced-transparency: reduce)"),forcedColors:n("(forced-colors: active)")}}function Yi(n){if(typeof matchMedia>"u")return()=>{};let e=["(prefers-color-scheme: dark)","(prefers-contrast: more)","(prefers-contrast: less)","(prefers-contrast: custom)","(prefers-reduced-motion: reduce)","(prefers-reduced-transparency: reduce)","(forced-colors: active)"],t=()=>n(Xe()),i=e.map((o)=>matchMedia(o));for(let o of i)o.addEventListener("change",t);return()=>{for(let o of i)o.removeEventListener("change",t)}}var Dr="http://www.w3.org/1998/Math/MathML",Nr="http://www.w3.org/2000/svg",ct={},Es=(n,e,t)=>{let i=Js(Cn(e),t);if(i.prop.startsWith("--"))n.style.setProperty(i.prop,i.value);else n.style[e]=i.value},Ur=(n)=>{return{toDOM(e,t){Es(e,n,t)}}},na=(n,e,t)=>{if(e==="style")if(typeof t==="object")for(let i of Object.keys(t))if(on(t[i]))Vn(n,t[i],Ur(i));else Es(n,i,t[i]);else n.setAttribute("style",t);else{let i=Cn(e),o=n.constructor.observedAttributes;if(o?.includes(e)||o?.includes(i))if(typeof t==="boolean")t?n.setAttribute(i,""):n.removeAttribute(i);else n.setAttribute(i,t);else if(n[e]!==void 0){let{MathMLElement:s}=globalThis;if(n instanceof SVGElement||s!==void 0&&n instanceof s)n.setAttribute(e,t);else n[e]=t}else if(i==="class")t.split(" ").forEach((s)=>{n.classList.add(s)});else if(n[i]!==void 0)n[i]=t;else if(typeof t==="boolean")t?n.setAttribute(i,""):n.removeAttribute(i);else n.setAttribute(i,t)}},wi={},Bs=(n)=>{if(!wi[n])wi[n]={toDOM(e,t){na(e,n,t)}};return wi[n]},Ki=(n,e,t)=>{if(e==="apply")t(n);else if(e.match(/^on[A-Z]/)!=null){let i=e.substring(2).toLowerCase();pe(n,i,t)}else if(e==="bind")if((typeof t.binding==="string"?sn[t.binding]:t.binding)!==void 0&&t.value!==void 0)Vn(n,t.value,t.binding instanceof Function?{toDOM:t.binding}:t.binding);else throw Error("bad binding");else if(e.match(/^bind[A-Z]/)!=null){let i=e.substring(4,5).toLowerCase()+e.substring(5);if(i!=="value"){let s=i==="text"?"textContent":i==="enabled"?"disabled (with .tosi.take(v => !v))":i==="disabled"?"disabled":i==="list"?".tosi.listBinding()":null;if(s)tn(`bind${i}`,`bind${e.substring(4)} is deprecated. Use { ${s}: ... } instead.`)}let o=sn[i];if(o!==void 0)Vn(n,t,o);else throw Error(`${e} is not allowed, bindings.${i} is not defined`)}else if(t!=null&&typeof t==="object"&&t[bt])Vn(n,t,Bs(e));else if(on(t))Vn(n,t,Bs(e));else na(n,e,t)},Qi=(n,...e)=>{if(ct[n]===void 0){let[o,s]=n.split("|");if(s===void 0)ct[n]=globalThis.document.createElement(o);else ct[n]=globalThis.document.createElementNS(s,o)}let t=ct[n].cloneNode(),i={};for(let o of e)if(o instanceof Element||o instanceof DocumentFragment||typeof o==="string"||typeof o==="number")if(t instanceof HTMLTemplateElement)t.content.append(o);else t.append(o);else if(on(o))t.append(x.span({bindText:o}));else Object.assign(i,o);for(let o of Object.keys(i)){let s=i[o];Ki(t,o,s)}return t},$i=(...n)=>{let e=globalThis.document.createDocumentFragment();for(let t of n)e.append(t);return e},x=new Proxy({fragment:$i},{get(n,e){if(e=e.replace(/[A-Z]/g,(t)=>`-${t.toLocaleLowerCase()}`),n[e]===void 0)n[e]=(...t)=>Qi(e,...t);return n[e]},set(){throw Error("You may not add new properties to elements")}}),wt=new Proxy({fragment:$i},{get(n,e){if(n[e]===void 0)n[e]=(...t)=>Qi(`${e}|${Nr}`,...t);return n[e]},set(){throw Error("You may not add new properties to elements")}}),ea=new Proxy({fragment:$i},{get(n,e){if(n[e]===void 0)n[e]=(...t)=>Qi(`${e}|${Dr}`,...t);return n[e]},set(){throw Error("You may not add new properties to elements")}}),Ss=new WeakSet;function Rr(n,e,t="part"){let i=`[data-${t}]`;for(let o of Array.from(n.querySelectorAll(i))){if(Ss.has(o))continue;let s=o.getAttribute(`data-${t}`);if(s==null)continue;let a=e[s];if(a==null)continue;Ss.add(o);for(let r of Object.keys(a))Ki(o,r,a[r])}}var Xr=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],Fr=!0,Wr=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,Gr=(n)=>Wr.test(n),Nn=(n="",e="")=>{if(n==="")return e;else if(e.match(/^\d+$/)!==null||e.includes("="))return`${n}[${e}]`;else return`${n}.${e}`},xt={};function vi(n,e){if(n!==null&&(typeof n==="object"||typeof n==="function"))return n;return new Proxy(xt,Xn(e,!0))}var ta=()=>new Proxy({},Xn("^",!0)),ki=(n)=>{let e=n(ta())?.path;if(!e?.startsWith("^."))throw Error("selector must return a property of the item");return e.substring(2)},Ci=(n,e,t)=>{for(let i=0;i<n.length;i++)if(`${$(n[i],e)}`===`${t}`)return i;return-1},Yr=(n,e)=>({listFind(t,i){if(t instanceof Element){let a=t;while(a&&!a[le]&&a.parentElement)a=a.parentElement;let r=a?.[le];if(r==null)return;let l=e.indexOf(r);return l!==-1?dn[n][l]:void 0}let o=ki(t),s=Ci(e,o,i);return s!==-1?dn[n][s]:void 0},listUpdate(t,i){let o=ki(t),s=$(i,o),a=Ci(e,o,s);if(a!==-1){let r=dn[n][a];for(let l of Object.keys(i))r[l]=i[l];return r}return dn[n].push(i),dn[n][e.length-1]},listRemove(t,i){let o=ki(t),s=Ci(e,o,i);if(s===-1)return!1;return dn[n].splice(s,1),!0}}),As=!1;function Kr(){if(!As)console.warn("xinValue, tosiValue, xinPath, tosiPath, etc. are deprecated. Use .tosi.value, .tosi.path, .tosi.observe(), etc. instead."),As=!0}var zs=(n)=>{return n===xt},Qr=(n,e)=>({get(t,i){switch(i){case"value":return e===xt?$(L,n):e.valueOf?e.valueOf():e;case"path":return n;case"touch":return()=>E(n);case"observe":return(o)=>{let s=Ue(n,o);return()=>_e(s)};case"bind":return(o,s,a)=>{wr()(o,n,s,a)};case"on":{let o=e===xt?$(L,n):e.valueOf?e.valueOf():e;return(s,a)=>vr()(s,a,o)}case"binding":return(o)=>({bind:{value:n,binding:o}});case"listBinding":return(o=({span:a})=>a({bindText:"^"}),s={})=>{let a=s.virtual?.itemsPerRow??1,r=[];for(let l=0;l<a;l++)r.push(o(x,ta(),l));return[{bindList:{value:n,...s}},x.template(...r)]};case"listFind":case"listUpdate":case"listRemove":return Yr(n,Array.isArray(e)?e:[])[i];case"take":return(...o)=>{let s=o[o.length-1],a=o.slice(0,-1).map((r)=>typeof r==="string"?r:r[jn]);return{[bt]:!0,paths:[n,...a],transform:s}}}return},set(t,i,o){if(i==="value"){if(o=D(o),D(Q[n])!==o&&Ne(L,n,o))E(n);return!0}return!1}}),Pe=(n,e)=>new Proxy(e,Qr(n,e)),Os=new Set(["path","value","touch","observe","bind","on","binding","listBinding","listFind","listUpdate","listRemove","take"]),Ps=new Map([[jn,"path"],["xinPath","path"],["tosiPath","path"],[de,"value"],["xinValue","value"],["tosiValue","value"],[tr,"observe"],["xinObserve","observe"],["tosiObserve","observe"],[or,"on"],["xinOn","on"],["tosiOn","on"],[ir,"bind"],["xinBind","bind"],["tosiBind","bind"],["tosiBinding","binding"],["tosiListBinding","listBinding"]]),Xn=(n,e)=>({get(t,i){if((i==="tosi"||i===Wi)&&e)return Pe(n,t);if(zs(t)){let l=()=>$(L,n);switch(i){case"valueOf":case"toJSON":return()=>l();case Symbol.toPrimitive:return(p)=>{let y=l();if(p==="number")return Number(y);if(p==="string")return String(y);return y};case"toString":return()=>String(l())}if(Os.has(i))return Pe(n,t)[i];let h=Ps.get(i);if(h!==void 0)return Kr(),Pe(n,t)[h];let c=l();if(c!=null){let p=Object(c);if(i in p){let y=p[i];return typeof y==="function"?y.bind(p):y}}return}if(e&&(i==="valueOf"||i==="toJSON"))return()=>t.valueOf?t.valueOf():t;if(e&&!(i in t)&&Os.has(i))return Pe(n,t)[i];let o=Ps.get(i);if(o!==void 0)return Pe(n,t)[o];if(typeof i==="symbol")return t[i];let s=Object.getOwnPropertyDescriptor(t,i);if(s&&!s.configurable&&!s.writable&&"value"in s)return s.value;let a=i,r=a.match(/^([^.[]+)\.(.+)$/)??a.match(/^([^\]]+)(\[.+)/)??a.match(/^(\[[^\]]+\])\.(.+)$/)??a.match(/^(\[[^\]]+\])\[(.+)$/);if(r!==null){let[,l,h]=r,c=Nn(n,l),p=D($(t,l));return p!==null&&typeof p==="object"?new Proxy(p,Xn(c,e))[h]:p}if(a.startsWith("[")&&a.endsWith("]"))a=a.substring(1,a.length-1);if(!Array.isArray(t)&&t[a]!==void 0||Array.isArray(t)&&a.includes("=")){let l;if(a.includes("=")){let[h,c]=a.split("=");l=t.find((p)=>`${$(p,h)}`===c)}else l=t[a];if(l instanceof Object){l=D(l);let h=Nn(n,a);return new Proxy(l instanceof Function?l.bind(t):l,Xn(h,e))}else return e?vi(l,Nn(n,a)):l}else if(Array.isArray(t)){let l=t[a];return typeof l==="function"?(...h)=>{let c=h.map((y)=>D(y)),p=l.apply(t,c);if(Xr.includes(a))E(n);if(p!=null&&typeof p==="object"){if(a==="find"||a==="findLast"||a==="at"){let y=t.indexOf(p);if(y!==-1)return new Proxy(p,Xn(Nn(n,String(y)),e))}}return p}:typeof l==="object"?new Proxy(D(l),Xn(Nn(n,a),e)):e?vi(l,Nn(n,a)):l}else{let l=t[a];if(l!==null&&typeof l==="object")l=D(l);return e?vi(l,Nn(n,a)):l}},set(t,i,o){if(o=D(o),o!==null&&typeof o==="object")if(Array.isArray(o))for(let a=0;a<o.length;a++)o[a]=D(o[a]);else for(let a of Object.keys(o))o[a]=D(o[a]);let s=i===de||i==="xinValue"||i==="tosiValue"||i==="value"&&(zs(t)||e)?n:Nn(n,i);if(Fr&&!Gr(s))throw Error(`setting invalid path ${s}`);if(D(Q[s])!==o&&Ne(L,s,o))E(s);return!0}}),Hi=(n,e)=>{let t=typeof e==="function"?e:Q[e];if(typeof t!=="function")throw Error(`observe expects a function or path to a function, ${e} is neither`);return Ue(n,t)},Q=new Proxy(L,Xn("",!1));br(Q);var dn=new Proxy(L,Xn("",!0)),$r=16,Hr=100;function Is(n,e){let t=Array.from(n.querySelectorAll(re));if(n.matches(re))t.unshift(n);for(let i of t){let o=qn.get(i);for(let s of o){if(s.path.startsWith("^"))s.path=`${e}${s.path.substring(1)}`;if(s.binding.toDOM!=null)s.binding.toDOM(i,Q[s.path])}}}class ia{boundElement;listTop;listBottom;isNamespaced;templates;options;itemToElement;idToElement=new Map;array=[];_filteredCache;_update;_previousSlice;static filterBoundObservers=new WeakMap;constructor(n,e,t={}){if(this.boundElement=n,this.itemToElement=new WeakMap,t.idPath!=null){let a=on(e);if(a!=null)sr(a,t.idPath)}let i=t.virtual?.itemsPerRow??1,o=Array.from(n.children).find((a)=>a instanceof HTMLTemplateElement);if(o!=null){let a=i;if(o.content.children.length<1||o.content.children.length!==a)throw Error(`ListBinding expects a template with exactly ${a} child element(s)`);this.templates=Array.from(o.content.children).map((r)=>qe(r)),o.remove()}else if(n.children.length===1)this.templates=[n.children[0]],this.templates[0].remove();else throw Error("ListBinding expects a <template> child or exactly one child element");this.options=t;let s=n.namespaceURI;if(this.isNamespaced=s==="http://www.w3.org/2000/svg"||s==="http://www.w3.org/1998/Math/MathML",this.isNamespaced)this.listTop=null,this.listBottom=null;else this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.listTop.classList.add("virtual-list-padding"),this.listBottom.classList.add("virtual-list-padding"),this.listTop.setAttribute("role","presentation"),this.listBottom.setAttribute("role","presentation"),this.listTop.setAttribute("aria-hidden","true"),this.listBottom.setAttribute("aria-hidden","true"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom);if(i>1){this.boundElement.classList.add("tosi-virtual-grid");let a=this.boundElement.style;if(a!=null)a.setProperty("--tosi-columns",String(i)),a.display=a.display||"grid",a.gridTemplateColumns=a.gridTemplateColumns||"repeat(var(--tosi-columns), 1fr)";if(this.listTop!=null&&this.listBottom!=null)this.listTop.style.gridColumn="1 / -1",this.listBottom.style.gridColumn="1 / -1"}if(t.virtual!=null&&!this.boundElement.getAttribute("role"))this.boundElement.setAttribute("role",i>1?"grid":"list");if(this.boundElement[ut]=this,this.isNamespaced&&t.virtual!=null)console.warn("ListBinding: virtual scrolling is not supported in SVG/MathML containers, ignoring virtual option");if(!this.isNamespaced&&t.virtual!=null)if(Di.observe(this.boundElement),this._update=he(()=>{this.update(this.array,!0)},$r),this.boundElement.addEventListener("resize",this._update),t.virtual.scrollContainer==="window")window.addEventListener("scroll",this._update),window.addEventListener("resize",this._update);else this.boundElement.addEventListener("scroll",this._update)}filteredArray(){if(this._filteredCache!=null)return this._filteredCache;let{hiddenProp:n,visibleProp:e}=this.options,t=this.array;if(n!==void 0)t=t.filter((i)=>i[n]!==!0);if(e!==void 0)t=t.filter((i)=>i[e]===!0);if(this.options.filter&&this.needle!==void 0)t=this.options.filter(t,this.needle);return this._filteredCache=t,t}visibleSlice(){let{virtual:n}=this.options,e=this.filteredArray(),t=0,i=e.length-1,o=0,s=0;if(n!=null&&this.boundElement instanceof HTMLElement){let a=this.boundElement.offsetWidth,r=n.scrollContainer==="window",l,h;if(r){l=window.innerHeight;let y=this.boundElement.getBoundingClientRect();h=Math.max(0,-y.top)}else l=this.boundElement.offsetHeight,h=this.boundElement.scrollTop;let c=n.width!=null?Math.max(1,Math.floor(a/n.width)):n.visibleColumns??1,p=Math.ceil(e.length/c);if(n.minHeight!=null){let y=n.minHeight,w=Math.ceil(l/y)+(n.rowChunkSize||1),g=c*w,k=p*y,j=Math.max(0,k-l),B=j>0?Math.min(1,Math.max(0,h/j)):0,A=Math.max(0,p-w+1),V=B*A,R=Math.floor(V);if(n.rowChunkSize)R-=R%n.rowChunkSize;return t=R*c,i=t+g-1,o=h,s=Math.max(0,k-h-l),{items:e,firstItem:t,lastItem:i,topBuffer:o,bottomBuffer:s,interpolation:{t:B,position:V,scrollTop:h,viewportHeight:l,totalScrollHeight:k,rowHeight:n.height}}}else{let y=Math.ceil(l/n.height)+(n.rowChunkSize||1),w=c*y,g=Math.floor(h/n.height);if(g>p-y+1)g=Math.max(0,p-y+1);if(n.rowChunkSize)g-=g%n.rowChunkSize;t=g*c,i=t+w-1,o=g*n.height,s=Math.max((p-y)*n.height-o,0)}}return{items:e,firstItem:t,lastItem:i,topBuffer:o,bottomBuffer:s}}needle;filter=he((n)=>{if(this.needle!==n)this.needle=n,this.update(this.array)},Hr);update(n,e){if(n==null)n=[];if(this.array=n,!e)this._filteredCache=void 0;let{hiddenProp:t,visibleProp:i}=this.options,o=on(n),s=this.visibleSlice();if(this.boundElement.classList.toggle("-xin-empty-list",s.items.length===0),this.options.virtual!=null)this.boundElement.setAttribute("aria-rowcount",String(s.items.length));let a=this._previousSlice,{firstItem:r,lastItem:l,topBuffer:h,bottomBuffer:c}=s,p=t===void 0&&i===void 0&&e===!0&&a!=null&&r===a.firstItem&&l===a.lastItem;if(p&&s.interpolation==null&&h===a.topBuffer&&c===a.bottomBuffer)return;if(p&&s.interpolation!=null){this._updateInterpolatedBuffers(s);return}this._previousSlice=s;let y=0,w=0,g=0,{idPath:k}=this.options,j=this.options.virtual?.itemsPerRow??1,B;if(k!=null){B=new Set;for(let T=r;T<=l;T++){let S=s.items[T];if(S!==void 0)B.add(String(S[k]))}}let A=new Set;for(let T of Array.from(this.boundElement.children)){if(T===this.listTop||T===this.listBottom)continue;let S=T[le];if(S==null)continue;else if(S===!0)T.remove(),y++;else{if(A.has(S))continue;let z;if(k!=null)z=!B.has(String(S[k]));else{let _=s.items.indexOf(S);z=_<r||_>l}if(z){A.add(S);let _=this.itemToElement.get(S);if(_!=null)for(let q of _)q.remove();else T.remove();if(this.itemToElement.delete(S),k!=null)this.idToElement.delete(String(S[k]));y++}}}if(this.listTop!=null&&this.listBottom!=null)this.listTop.style.height=String(h)+"px",this.listBottom.style.height=String(c)+"px";let V=[];for(let T=r;T<=l;T++){let S=s.items[T];if(S===void 0)continue;let z=this.itemToElement.get(D(S));if(z==null&&k!=null){let _=String(S[k]);if(z=this.idToElement.get(_),z!=null){let q=D(S);this.itemToElement.set(q,z);for(let ln of z)ln[le]=q}}if(z==null){g++;let _=D(S);if(z=this.templates.map((q)=>qe(q)),typeof S==="object")this.itemToElement.set(_,z);for(let q of z)q[le]=typeof S==="object"?_:!0;for(let q of z)if(this.listBottom!=null)this.boundElement.insertBefore(q,this.listBottom);else this.boundElement.append(q);if(k!=null){let q=S[k],ln=`${o}[${k}=${q}]`;for(let ht of z)Is(ht,ln);this.idToElement.set(String(q),z)}else{let q=`${o}[${T}]`;for(let ln of z)Is(ln,q)}}if(this.options.virtual!=null){let _=String(T+1);if(j>1)for(let q=0;q<z.length;q++){let ln=z[q];ln.setAttribute("role","gridcell"),ln.setAttribute("aria-rowindex",_),ln.setAttribute("aria-colindex",String(q+1))}else for(let q of z)q.setAttribute("role","listitem"),q.setAttribute("aria-rowindex",_)}V.push(...z)}let R=null;for(let T of V){if(T.previousElementSibling!==R)if(w++,R?.nextElementSibling!=null)this.boundElement.insertBefore(T,R.nextElementSibling);else if(this.listBottom!=null)this.boundElement.insertBefore(T,this.listBottom);else this.boundElement.append(T);R=T}if(s.interpolation!=null)this._updateInterpolatedBuffers(s);if(yt.perf)console.log(o,"updated",{removed:y,created:g,moved:w})}_updateInterpolatedBuffers(n){let{t:e,position:t,scrollTop:i,viewportHeight:o,totalScrollHeight:s,rowHeight:a}=n.interpolation,r=0;for(let p of Array.from(this.boundElement.children)){if(p===this.listTop||p===this.listBottom)continue;r+=p.offsetHeight||a}let l=i,h=i+o-r,c=Math.max(0,e*h+(1-e)*l-t%1*a);if(this.listTop!=null&&this.listBottom!=null)this.listTop.style.height=String(c)+"px",this.listBottom.style.height=String(Math.max(0,s-c-r))+"px"}}var vt=(n,e,t)=>{let i=n[ut];if(e&&i===void 0)i=new ia(n,e,t),n[ut]=i;return i},Zi=(n)=>{let e;while(!(e=n[le])&&n&&n.parentElement)n=n.parentElement;return e?{element:n,item:e}:void 0},mn=(n)=>{let e=Zi(n);return e?e.item:void 0},Zr=(n)=>{let e=Zi(n);if(!e)return console.error("deleteListItem failed, element is not part of a list instance",n),!1;let t=vt(e.element.parentElement);if(!t.options.idPath)return console.error("deleteListItem failed, list binding has no idPath",n.parentElement,t),!1;let i=t.array.indexOf(e.item);if(i>-1)return t.array.splice(i,1),!0;return!1},Mr={start:"start",middle:"center",end:"end",nearest:"nearest"},Jr=(n,e,t={})=>{let i=vt(n);if(i==null)return console.error("scrollListItemIntoView failed, element has no list binding",n),!1;let{position:o="middle"}=t,s=i.filteredArray(),a=D(e)??e,r=s.indexOf(a);if(r===-1)return console.error("scrollListItemIntoView failed, item not found in list",e),!1;let{virtual:l}=i.options;if(l!=null&&n instanceof HTMLElement){let h=l.width!=null?Math.max(1,Math.floor(n.offsetWidth/l.width)):l.visibleColumns??1,c=Math.floor(r/h),p=l.minHeight??l.height,y=Math.ceil(s.length/h),w=l.scrollContainer==="window",g=w?window.innerHeight:n.offsetHeight,k;if(l.minHeight!=null){let j=Math.ceil(g/p)+(l.rowChunkSize||1),B=y*p,A=Math.max(0,B-g),V=Math.max(1,y-j+1),R=c/V;switch(o){case"start":k=R*A;break;case"end":k=Math.max(0,(c-j+1)/V*A);break;case"nearest":{let T=w?Math.max(0,-n.getBoundingClientRect().top):n.scrollTop,S=A>0?T/A:0,z=Math.floor(S*V);if(c<z)k=R*A;else if(c>=z+j)k=Math.max(0,(c-j+1)/V*A);else return!0;break}default:{let T=c-Math.floor(j/2);k=Math.max(0,T)/V*A}}}else{let j=c*l.height;switch(o){case"start":k=j;break;case"end":k=j-g+l.height;break;case"nearest":{let B=w?Math.max(0,-n.getBoundingClientRect().top):n.scrollTop;if(j<B)k=j;else if(j+l.height>B+g)k=j-g+l.height;else return!0;break}default:k=j-(g-l.height)/2}}if(k=Math.max(0,k),w){let j=n.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:j+k,behavior:"smooth"})}else n.scrollTo({top:k,behavior:"smooth"})}else{let h=i.itemToElement.get(a);if(h==null||h.length===0)return console.error("scrollListItemIntoView failed, no DOM element found for item",e),!1;h[0].scrollIntoView({block:Mr[o]??"center",behavior:"smooth"})}return!0},{document:De,MutationObserver:Ts}=globalThis,Mi=(n,e)=>{let t=qn.get(n);if(t==null)return;for(let i of t){let{binding:o,options:s}=i,{path:a}=i,{toDOM:r}=o;if(r!=null){if(a.startsWith("^")){let l=mn(n);if(l!=null&&l[jn]!=null)a=i.path=`${l[jn]}${a.substring(1)}`;else{if(n instanceof HTMLElement)console.warn(`Unresolved relative binding "${a}" —`,n,"is not part of a list. If this is a list template, wrap it in a <template>.");continue}}if(e==null||a.startsWith(e))r(n,ft()[a],s)}}};if(Ts!=null)new Ts((n)=>{n.forEach((e)=>{Array.from(e.addedNodes).forEach((t)=>{if(t instanceof Element)Array.from(t.querySelectorAll(re)).forEach((i)=>Mi(i))})})}).observe(De.body,{subtree:!0,childList:!0});Ue(()=>!0,(n)=>{let e=Array.from(De.querySelectorAll(re));for(let t of e)Mi(t,n)});var Vs=(n)=>{let e=n.target?.closest(re);while(e!=null){let t=qn.get(e);for(let i of t){let{binding:o,path:s}=i,{fromDOM:a}=o;if(a!=null){let r;try{r=a(e,i.options)}catch(l){throw console.error("Cannot get value from",e,"via",i),Error("Cannot obtain value fromDOM")}if(r!=null){let l=ft(),h=l[s];if(h==null)l[s]=r;else{let c=h[jn]!=null?h[de]:h,p=r[jn]!=null?r[de]:r;if(c!==p)l[s]=p}}}}e=e.parentElement.closest(re)}};if(globalThis.document!=null)De.body.addEventListener("change",Vs,!0),De.body.addEventListener("input",Vs,!0);function Lr(n,e,t,i){let{paths:o,transform:s}=e,{toDOM:a}=t;if(a==null)return n;let r=null,l={toDOM(c,p,y){let w=ft(),g=o.map((j)=>w[j]);if(r!==null&&g.every((j,B)=>j===r[B]))return;r=g;let k=s(...g);a(c,k,y)},fromDOM:t.fromDOM};n.classList?.add(Fi);let h=qn.get(n);if(h==null)h=[],qn.set(n,h);for(let c of o)h.push({path:c,binding:l,options:i});if(!o[0].startsWith("^"))E(o[0]);return n}function Vn(n,e,t,i){if(n instanceof DocumentFragment)throw Error("bind cannot bind to a DocumentFragment");if(e!=null&&typeof e==="object"&&e[bt])return Lr(n,e,t,i);let o;if(typeof e==="object"&&e[jn]===void 0&&i===void 0){let{value:r}=e;o=typeof r==="string"?r:r[jn],i=e,delete i.value}else o=typeof e==="string"?e:e[jn];if(o==null)throw Error("bind requires a path or object with xin Proxy");let{toDOM:s}=t;n.classList?.add(Fi);let a=qn.get(n);if(a==null)a=[],qn.set(n,a);if(a.push({path:o,binding:t,options:i}),s!=null&&!o.startsWith("^"))E(o);if(i?.filter&&i?.needle)Vn(n,i.needle,{toDOM(r,l){console.log({needle:l}),r[ut]?.filter(l)}});return n}var qs=new Set,Er=(n)=>{let e=n?.target?.closest(xs),t=!1,i=new Proxy(n,{get(s,a){if(a==="stopPropagation")return()=>{n.stopPropagation(),t=!0};else{let r=s[a];return typeof r==="function"?r.bind(s):r}}}),o=new Set;while(!t&&e!=null){let s=Ve.get(e)[n.type]||o;for(let a of s){if(typeof a==="function")a(i);else{let r=ft()[a];if(typeof r==="function")r(i);else throw Error(`no event handler found at path ${a}`)}if(t)continue}e=e.parentElement!=null?e.parentElement.closest(xs):null}};function pe(n,e,t){let i=Ve.get(n);if(n.classList.add(Us),i==null)i={},Ve.set(n,i);if(!i[e])i[e]=new Set;if(i[e].add(t),!qs.has(e))qs.add(e),De.body.addEventListener(e,Er,!0);return()=>{i[e].delete(t)}}fr(Vn,pe);function oa(n,e){if(!n.internals)return;let t={},i="";if(n.hasAttribute("required")&&e==="")t.valueMissing=!0,i="Please fill out this field.";let o=n.getAttribute("minlength");if(o&&e.length<parseInt(o,10))t.tooShort=!0,i=`Please use at least ${o} characters.`;let s=n.getAttribute("maxlength");if(s&&e.length>parseInt(s,10))t.tooLong=!0,i=`Please use no more than ${s} characters.`;let a=n.getAttribute("pattern");if(a&&e!=="")try{if(!new RegExp(`^(?:${a})$`).test(e))t.patternMismatch=!0,i="Please match the requested format."}catch{}if(Object.keys(t).length>0)n.internals.setValidity(t,i,n);else n.internals.setValidity({})}var n1=0;function ji(){return`custom-elt${(n1++).toString(36)}`}var _s=0,Bi=null;function e1(){if(Bi===null)Bi=new MutationObserver((n)=>{let e=new Set;for(let t of n)if(t.type==="attributes"&&t.target instanceof f){let i=t.target,o=Hs(t.attributeName);if(i._legacyTrackedAttrs?.has(o))e.add(i)}for(let t of e)t.queueRender(!1)});return Bi}var Te={};function t1(n,e){let t=Te[n],i=ce(e).replace(/:host\(([^)]+)\)/g,`${n}$1`).replace(/:host\b/g,n);Te[n]=t?t+`
`+i:i}function i1(n){if(Te[n])document.head.append(x.style({id:n+"-component"},Te[n]));delete Te[n]}class f extends HTMLElement{static elements=x;static _elementCreator;static initAttributes;static formAssociated;static preferredTagName;static shadowStyleSpec;static lightStyleSpec;static extends;internals;get validity(){return this.internals?.validity}get validationMessage(){return this.internals?.validationMessage??""}get willValidate(){return this.internals?.willValidate??!1}checkValidity(){return this.internals?.checkValidity()??!0}reportValidity(){return this.internals?.reportValidity()??!0}setCustomValidity(n){if(this.internals)if(n)this.internals.setValidity({customError:!0},n);else this.internals.setValidity({})}setValidity(n,e,t){this.internals?.setValidity(n,e,t)}setFormValue(n,e){this.internals?.setFormValue(n,e)}static get observedAttributes(){let n=this.initAttributes;if(n)return["hidden",...Object.keys(n).map(Cn)];return["hidden"]}instanceId;styleNode;static styleSpec;static styleNode;content=x.slot();isSlotted;static _tagName=null;static get tagName(){return this._tagName}_legacyTrackedAttrs;_attrValues;_valueChanged=!1;static StyleNode(n){return console.warn("StyleNode is deprecated, use static shadowStyleSpec instead"),x.style(ce(n))}static elementCreator(n={}){let e=this;if(!Object.prototype.hasOwnProperty.call(e,"_elementCreator")){if(n.tag!==void 0)tn("elementCreator-tag","Passing tag to elementCreator() is deprecated. Use static preferredTagName instead.");if(n.styleSpec!==void 0)tn("elementCreator-styleSpec","Passing styleSpec to elementCreator() is deprecated. Use static lightStyleSpec instead.");if(n.extends!==void 0)tn("elementCreator-extends","Passing extends to elementCreator() is deprecated. Use static extends instead.");let t=n.tag??e.preferredTagName;if(t==null)if(typeof e.name==="string"&&e.name!==""){if(t=Cn(e.name),t.startsWith("-"))t=t.slice(1)}else t=ji();if(customElements.get(t)!=null)console.warn(`${t} is already defined`);if(t.match(/\w+(-\w+)+/)==null)console.warn(`${t} is not a legal tag for a custom-element`),t=ji();while(customElements.get(t)!==void 0)t=ji();e._tagName=t;let i=n.styleSpec??e.lightStyleSpec;if(i!==void 0)t1(t,i);let o=n.extends??e.extends,s=o?{extends:o}:void 0;window.customElements.define(t,this,s),e._elementCreator=x[t]}return e._elementCreator}initAttributes(...n){if(tn("initAttributes","initAttributes() is deprecated. Use static initAttributes = { ... } instead."),!this._legacyTrackedAttrs)this._legacyTrackedAttrs=new Set;for(let i of n)this._legacyTrackedAttrs.add(i);e1().observe(this,{attributes:!0});let e={},t={};n.forEach((i)=>{e[i]=Mn(this[i]);let o=Cn(i);Object.defineProperty(this,i,{enumerable:!1,get(){if(typeof e[i]==="boolean")return this.hasAttribute(o);else if(this.hasAttribute(o))return typeof e[i]==="number"?parseFloat(this.getAttribute(o)):this.getAttribute(o);else if(t[i]!==void 0)return t[i];else return e[i]},set(s){if(typeof e[i]==="boolean"){if(s!==this[i]){if(s)this.setAttribute(o,"");else this.removeAttribute(o);this.queueRender()}}else if(typeof e[i]==="number"){if(s!==parseFloat(this[i]))this.setAttribute(o,s),this.queueRender()}else if(typeof s==="object"||`${s}`!==`${this[i]}`){if(s===null||s===void 0||typeof s==="object")this.removeAttribute(o);else this.setAttribute(o,s);this.queueRender(),t[i]=s}}})})}initValue(){let n=Object.getOwnPropertyDescriptor(this,"value");if(n===void 0||n.get!==void 0||n.set!==void 0)return;let e=this.hasAttribute("value")?this.getAttribute("value"):Mn(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get(){return e},set(t){if(e!==t)e=t,this._valueChanged=!0,this.queueRender(!0)}})}_parts;get parts(){let n=this.shadowRoot!=null?this.shadowRoot:this;if(this._parts==null)this._parts=new Proxy({},{get(e,t){if(e[t]===void 0){let i=n.querySelector(`[part="${t}"]`);if(i==null)i=n.querySelector(t);if(i==null)throw Error(`elementRef "${t}" does not exist!`);i.removeAttribute("data-ref"),e[t]=i}return e[t]}});return this._parts}attributeChangedCallback(n,e,t){let i=Hs(n);if(!this._legacyTrackedAttrs?.has(i))this.queueRender(!1)}constructor(){super();if(_s+=1,this.constructor.formAssociated&&typeof this.attachInternals==="function"&&!this.internals)this.internals=this.attachInternals();let n=this.constructor.initAttributes;if(n)this._setupAttributeAccessors(n);this.instanceId=`${this.tagName.toLocaleLowerCase()}-${_s}`,this._value=Mn(this.defaultValue)}_setupAttributeAccessors(n){if(!this._attrValues)this._attrValues=new Map;for(let e of Object.keys(n)){let t=Cn(e),i=n[e];if(e==="value"){console.warn(`${this.tagName}: 'value' cannot be an attribute. Use the Component value property instead.`);continue}if(typeof i==="object"&&i!==null){console.warn(`${this.tagName}: initAttributes.${e} is an object. Use a regular property instead.`);continue}let o=this,s=!1;while(o){let a=Object.getOwnPropertyDescriptor(o,e);if(a){if(!a.configurable||a.get||a.set){s=!0;break}break}o=Object.getPrototypeOf(o)}if(s)continue;Object.defineProperty(this,e,{enumerable:!1,get:()=>{if(typeof i==="boolean")return this.hasAttribute(t);else if(this.hasAttribute(t))return typeof i==="number"?parseFloat(this.getAttribute(t)):this.getAttribute(t);else if(this._attrValues.has(e))return this._attrValues.get(e);else return i},set:(a)=>{if(typeof i==="boolean"){if(a!==this[e]){if(a)this.setAttribute(t,"");else this.removeAttribute(t);this.queueRender()}}else if(typeof i==="number"){if(a!==parseFloat(this[e]))this.setAttribute(t,a),this.queueRender()}else if(typeof a==="object"||`${a}`!==`${this[e]}`){if(a===null||a===void 0||typeof a==="object")this.removeAttribute(t);else this.setAttribute(t,a);this.queueRender(),this._attrValues.set(e,a)}}})}}connectedCallback(){if(i1(this.constructor.tagName),this.hydrate(),this.role!=null)this.setAttribute("role",this.role);if(this.constructor.formAssociated&&!this.hasAttribute("tabindex"))this.setAttribute("tabindex","0");if(this.onResize!==void 0){if(Di.observe(this),this._onResize==null)this._onResize=this.onResize.bind(this);this.addEventListener("resize",this._onResize)}if(this.value!=null&&this.getAttribute("value")!=null)this._value=this.getAttribute("value");if(this.internals&&this.value!==void 0)this.internals.setFormValue(this.value),this.validateValue();this.queueRender()}disconnectedCallback(){Di.unobserve(this)}formResetCallback(){if(this.value!==void 0)this.value=this.defaultValue??""}formDisabledCallback(n){if(n)this.setAttribute("disabled","");else this.removeAttribute("disabled")}formStateRestoreCallback(n){if(this.value!==void 0&&typeof n==="string")this.value=n}_changeQueued=!1;_renderQueued=!1;queueRender(n=!1){if(!this._hydrated)return;if(!this._changeQueued)this._changeQueued=n;if(!this._renderQueued)this._renderQueued=!0,requestAnimationFrame(()=>{if(this._changeQueued){if(Qs(this,"change"),this.internals&&this.value!==void 0)this.internals.setFormValue(this.value)}this._changeQueued=!1,this._renderQueued=!1,this.render()})}_hydrated=!1;hydrate(){if(!this._hydrated){this.initValue();let n=typeof this.content!=="function",e=typeof this.content==="function"?this.content(x):this.content;if(Array.isArray(e)){let s={};e=e.filter((a)=>{if(a instanceof Node||typeof a==="string"||typeof a==="number"||on(a))return!0;return Object.assign(s,a),!1});for(let a of Object.keys(s))Ki(this,a,s[a])}let t=this.constructor,i=t.shadowStyleSpec??t.styleSpec;if(t.styleSpec&&!t.shadowStyleSpec)tn("static-styleSpec","static styleSpec is deprecated. Use static shadowStyleSpec instead.");let{styleNode:o}=t;if(i)o=t.styleNode=x.style(ce(i)),delete t.styleNode;if(this.styleNode)console.warn(this,"styleNode is deprecated, use static shadowStyleSpec instead"),o=this.styleNode;if(o){let s=this.attachShadow({mode:"open"});s.appendChild(o.cloneNode(!0)),Cs(s,e,n)}else if(e!==null){let s=Array.from(this.childNodes);Cs(this,e,n),this.isSlotted=this.querySelector("slot,tosi-slot,xin-slot")!==void 0;let a=Array.from(this.querySelectorAll("slot"));if(a.length>0)a.forEach(kt.replaceSlot);if(s.length>0){let r={"":this};Array.from(this.querySelectorAll("tosi-slot,xin-slot")).forEach((l)=>{r[l.name]=l}),s.forEach((l)=>{let h=r[""],c=l instanceof Element?r[l.slot]:h;(c!==void 0?c:h).append(l)})}}this._hydrated=!0}}render(){if(this._valueChanged&&this.internals&&this.value!==void 0)this.internals.setFormValue(this.value),this.validateValue();this._valueChanged=!1}validateValue(){if(!this.internals||this.value===void 0)return;let n=typeof this.value==="string"?this.value:String(this.value);oa(this,n)}}class kt extends f{static preferredTagName="tosi-slot";static initAttributes={name:""};content=null;static replaceSlot(n){let e=document.createElement("tosi-slot");if(n.name!=="")e.setAttribute("name",n.name);n.replaceWith(e)}}var o1=kt.elementCreator();class sa extends f{static preferredTagName="xin-slot";static initAttributes={name:""};content=null;constructor(){super();tn("xin-slot","<xin-slot> is deprecated. Use <tosi-slot> instead.")}static replaceSlot=kt.replaceSlot}var s1=sa.elementCreator(),Ji=(n=()=>!0)=>{let e=localStorage.getItem("xin-state");if(e!=null){let i=JSON.parse(e);for(let o of Object.keys(i).filter(n))if(Q[o]!==void 0)Object.assign(Q[o],i[o]);else Q[o]=i[o]}let t=Jn(()=>{let i={},o=D(Q);for(let s of Object.keys(o).filter(n))i[s]=o[s];localStorage.setItem("xin-state",JSON.stringify(i)),console.log("xin state saved to localStorage")},500);Hi(n,t)},a1="tosijs-share",l1="tosijs-share",Ie="shared",r1=1,Ni=new Set,Ui=new Set,Si=new Map,Zn=null,Ri="",pt=null,d1=null;function Ds(){if(pt!=null)return Promise.resolve(pt);return new Promise((n,e)=>{let t=indexedDB.open(l1,r1);t.onupgradeneeded=()=>{t.result.createObjectStore(Ie)},t.onsuccess=()=>{pt=t.result,n(pt)},t.onerror=()=>e(t.error)})}var h1={async get(n){let e=await Ds();return new Promise((t,i)=>{let o=e.transaction(Ie,"readonly").objectStore(Ie).get(n);o.onsuccess=()=>t(o.result),o.onerror=()=>i(o.error)})},async set(n,e){let t=await Ds();return new Promise((i,o)=>{let s=t.transaction(Ie,"readwrite");s.objectStore(Ie).put(e,n),s.oncomplete=()=>i(),s.onerror=()=>o(s.error)})}};function aa(){return d1??h1}function c1(n){return n!=null&&n.type==="tosijs-share"&&typeof n.path==="string"}function la(n){for(let e of Ni)if(n===e||n.startsWith(e+"."))return e;return}function p1(n){for(let e of Ui)if(n===e||n.startsWith(e+"."))return!0;return!1}function u1(n,e){Ui.add(n),Ne(L,n,e),E(n),Gi().then(()=>{Ui.delete(n)})}function y1(){if(Zn!=null)return Zn;return Ri=crypto.randomUUID(),Zn=new BroadcastChannel(a1),Zn.onmessage=(n)=>{let e=n.data;if(!c1(e))return;if(e.origin===Ri)return;if(la(e.path)===void 0)return;u1(e.path,e.value)},Zn}function m1(n,e){if(Zn==null)return;let t={type:"tosijs-share",path:n,value:e,origin:Ri};Zn.postMessage(t)}function g1(n){if(!Si.has(n))Si.set(n,Jn(()=>{let e=$(L,n);aa().set(n,e)},500));Si.get(n)()}async function x1(...n){if(typeof BroadcastChannel>"u")return{restored:[]};y1();let e=[],t=aa();for(let i of n){let o=typeof i==="string"?i:on(i);if(o===void 0)throw Error("share() requires boxed proxies or string paths. Got a non-proxy value.");if(Ni.has(o))continue;Ni.add(o);let s=await t.get(o);if(s!==void 0)Ne(L,o,s),E(o),e.push(i);else{let a=$(L,o);await t.set(o,a)}Ue((a)=>a===o||a.startsWith(o+"."),(a)=>{if(p1(a))return;let r=la(a);if(r===void 0)return;let l=$(L,a);m1(a,l),g1(r)})}return{restored:e}}var Xi=new Set;function Ns(n,e){for(let t of n)if(e===t||e.startsWith(t+"."))return t;return}function b1(n){for(let e of Xi)if(n===e||n.startsWith(e+"."))return!0;return!1}function f1(n,e){Xi.add(n),Ne(L,n,e),E(n),Gi().then(()=>{Xi.delete(n)})}async function w1(n,e,...t){let i=new Set,o=[],s=[],a=e.throttleInterval??100;await n.connect();let r=he(()=>{if(o.length===0)return;let l=o.splice(0);n.send(l)},a);n.onReceive((l)=>{for(let h of l){if(Ns(i,h.path)===void 0)continue;f1(h.path,h.value)}});for(let l of t){let h=typeof l==="string"?l:on(l);if(h===void 0)throw Error("sync() requires boxed proxies or string paths. Got a non-proxy value.");i.add(h);let c=Ue((p)=>p===h||p.startsWith(h+"."),(p)=>{if(b1(p))return;if(Ns(i,p)===void 0)return;let y=$(L,p);o.push({path:p,value:y}),r()});s.push(c)}return{disconnect(){for(let l of s)_e(l);s.length=0,i.clear(),o.length=0,n.disconnect()}}}var Ct="1.6.0";function H(n){return Object.assign(dn,n),dn}function Li(n){return tn("boxedProxy","boxedProxy is deprecated, please use tosi() instead"),H(n)}var v1=new FinalizationRegistry((n)=>{n()});function k1(n,e){let t=Xs();dn[t]=n;let i=dn[t],o=()=>{delete Q[t]};if(e)v1.register(e,o);return[i,o]}function ra(n,e=!1){if(e)return tn("xinProxy-boxed","xinProxy(..., true) is deprecated; use tosi(...) instead"),Li(n);return Object.keys(n).forEach((t)=>{Q[t]=n[t]}),Q}var C1={};async function Ei(n,e){let t=await e(n,{Color:v,Component:f,elements:x,svgElements:wt,mathML:ea,varDefault:u,vars:d,xin:Q,boxed:dn,xinProxy:ra,boxedProxy:Li,tosi:H,makeComponent:Ei,bind:Vn,on:pe,version:Ct}),{type:i}=t;i.preferredTagName=n;let o=t.lightStyleSpec??t.styleSpec;if(o)i.lightStyleSpec=o;let s={type:i,creator:i.elementCreator()};return C1[n]=s,s}var jt={":host":{display:"none"}},Ai={},j1=(n)=>import(n);class Bt extends f{static preferredTagName="tosi-blueprint";static lightStyleSpec=jt;static initAttributes={tag:"anon-elt",src:"",property:"default"};loaded;blueprintLoaded=(n)=>{};async packaged(){let{tag:n,src:e,property:t}=this,i=`${n}.${t}:${e}`;if(!this.loaded){if(Ai[i]===void 0)Ai[i]=j1(e).then((o)=>{let s=o[t];return Ei(n,s)});else console.log(`using cached ${n} with signature ${i}`);this.loaded=await Ai[i],this.blueprintLoaded(this.loaded)}return this.loaded}}var B1=Bt.elementCreator();class no extends f{static preferredTagName="tosi-loader";static lightStyleSpec=jt;allLoaded=()=>{};async load(){let n=Array.from(this.querySelectorAll("tosi-blueprint, xin-blueprint")).filter((e)=>e.src).map((e)=>e.packaged());await Promise.all(n),this.allLoaded()}connectedCallback(){super.connectedCallback(),this.load()}}var S1=no.elementCreator();class da extends Bt{static preferredTagName="xin-blueprint";static lightStyleSpec=jt;constructor(){super();tn("xin-blueprint","<xin-blueprint> is deprecated. Use <tosi-blueprint> instead.")}}var A1=da.elementCreator();class ha extends f{static preferredTagName="xin-loader";static lightStyleSpec=jt;allLoaded=()=>{};constructor(){super();tn("xin-loader","<xin-loader> is deprecated. Use <tosi-loader> instead.")}async load(){let n=Array.from(this.querySelectorAll("xin-blueprint")).filter((e)=>e.src).map((e)=>e.packaged());await Promise.all(n),this.allLoaded()}connectedCallback(){super.connectedCallback(),this.load()}}var z1=ha.elementCreator();var hs={};bi(hs,{xrControllersText:()=>Ed,xrControllers:()=>Ld,xinTagList:()=>Nh,xinTag:()=>_h,xinTabs:()=>pd,xinTable:()=>g2,xinSizer:()=>Ph,xinSidenav:()=>zd,xinSelect:()=>K1,xinSegmented:()=>zh,xinRating:()=>yh,xinPasswordStrength:()=>ph,xinNotification:()=>rh,xinMenu:()=>d2,xinMd:()=>ld,xinLocalized:()=>J1,xinForm:()=>Md,xinFloat:()=>F1,xinField:()=>Zd,xinCarousel:()=>D1,version:()=>pi,updateLocalized:()=>ho,trackDrag:()=>an,tosijs:()=>Fe,tosiTagList:()=>_l,tosiTag:()=>rs,tosiTabs:()=>Ee,tosiTable:()=>fo,tosiSizer:()=>ql,tosiSidenav:()=>tt,tosiSelect:()=>cn,tosiSegmented:()=>Tl,tosiRichText:()=>Pl,tosiRating:()=>Bl,tosiPasswordStrength:()=>jl,tosiNotification:()=>es,tosiMonth:()=>oh,tosiMenu:()=>_a,tosiMd:()=>ke,tosiLocalized:()=>zn,tosiLocalePicker:()=>va,tosiForm:()=>wl,tosiFloat:()=>Ye,tosiField:()=>fl,tosiDialog:()=>Xt,tosiCarousel:()=>pa,testManager:()=>un,tabSelector:()=>cd,svgIcon:()=>I1,svg2DataUrl:()=>Ge,styleSheet:()=>At,spacer:()=>Be,sizeBreak:()=>as,sideNav:()=>Go,setLocale:()=>Q1,scriptTag:()=>hn,runTests:()=>ni,richTextWidgets:()=>Ol,richText:()=>kh,rewriteImports:()=>Gn,resolveMenuItems:()=>pn,removeLastMenu:()=>Z,postNotification:()=>dh,positionFloat:()=>xa,popMenu:()=>X,popFloat:()=>ro,popDropMenu:()=>qa,parseShortcut:()=>qt,modifierKeys:()=>L1,menu:()=>Ta,matchShortcut:()=>co,markdownViewer:()=>_o,mapBox:()=>eh,makeSorter:()=>It,localize:()=>U,localePicker:()=>M1,loadTransform:()=>Zt,liveExample:()=>ti,legacyAliases:()=>Ul,keystroke:()=>E1,keycode:()=>Ca,isBreached:()=>Cl,insertExamples:()=>Et,initLocalization:()=>H1,icons:()=>m,i18n:()=>F,gamepadText:()=>Jd,gamepadState:()=>vl,findShortcutAction:()=>xo,findHighestZ:()=>En,filterPart:()=>oi,filterForDrop:()=>Qe,filterForClick:()=>mo,filterBuilder:()=>Fd,expect:()=>Uo,executeInline:()=>Jt,executeInIframe:()=>Lt,executeCode:()=>tl,enableTests:()=>Fo,elastic:()=>bh,editableRect:()=>Dd,dragAndDrop:()=>Nt,displayShortcut:()=>_t,disableTests:()=>Wo,digest:()=>kl,defineIcons:()=>P1,defaultColors:()=>ds,dataTable:()=>m2,createThemeWithLegacy:()=>Wh,createTheme:()=>ui,createTestContext:()=>Ro,createSubMenu:()=>go,createMenuItem:()=>Ia,createMenuAction:()=>Oa,createDropMenuItem:()=>Pa,createDocBrowser:()=>qd,createDarkTheme:()=>Nl,componentVars:()=>Gh,commandButton:()=>wn,colorInput:()=>lo,codeEditor:()=>me,canonicalShortcut:()=>e2,bringToFront:()=>Wn,bodymovinPlayer:()=>V1,blockStyle:()=>os,baseVariables:()=>Dl,baseTheme:()=>Xh,baseDarkTheme:()=>Fh,b3d:()=>T1,availableFilters:()=>Qo,applyTheme:()=>Rh,abTest:()=>O1,XinWord:()=>vh,XinTagList:()=>Dh,XinTag:()=>qh,XinSizer:()=>Oh,XinSelect:()=>Y1,XinSegmented:()=>Ah,XinRating:()=>uh,XinPasswordStrength:()=>ch,XinNotification:()=>lh,XinMenu:()=>h2,XinLocalized:()=>Tt,XinForm:()=>Hd,XinFloat:()=>X1,XinField:()=>$d,XinCarousel:()=>_1,TosiTagList:()=>Ae,TosiTag:()=>at,TosiTabs:()=>Ht,TosiTable:()=>Rt,TosiSizer:()=>ci,TosiSidenav:()=>oe,TosiSelect:()=>Sn,TosiSegmented:()=>Se,TosiRating:()=>di,TosiPasswordStrength:()=>ri,TosiNotification:()=>Qn,TosiMonth:()=>Eo,TosiMenu:()=>Ut,TosiMd:()=>$t,TosiLocalized:()=>An,TosiLocalePicker:()=>Vt,TosiForm:()=>ai,TosiFloat:()=>_n,TosiField:()=>si,TosiDialog:()=>jo,TosiCarousel:()=>Ot,TabSelector:()=>hd,SvgIcon:()=>io,SizeBreak:()=>ss,SideNav:()=>ii,STORAGE_KEY:()=>Mt,RichText:()=>hi,RemoteSyncManager:()=>et,MarkdownViewer:()=>ad,MapBox:()=>se,LocalePicker:()=>Z1,LiveExample:()=>In,FilterPart:()=>$o,FilterBuilder:()=>Ho,EditableRect:()=>fn,DataTable:()=>y2,CodeEditor:()=>Ln,BodymovinPlayer:()=>ye,B3d:()=>oo,AbTest:()=>ue});var eo={};class ue extends f{static preferredTagName="tosi-ab";static set conditions(n){Object.assign(eo,n);for(let e of[...ue.instances])e.queueRender()}static initAttributes={condition:"",not:!1};static instances=new Set;connectedCallback(){super.connectedCallback(),ue.instances.add(this)}disconnectedCallback(){super.disconnectedCallback(),ue.instances.delete(this)}render(){if(this.condition!==""&&(this.not?eo[this.condition]!==!0:eo[this.condition]===!0))this.toggleAttribute("hidden",!1);else this.toggleAttribute("hidden",!0)}}var O1=ue.elementCreator();var St={};function hn(n,e){if(St[n]===void 0){if(e!==void 0){let i=globalThis[e];St[n]=Promise.resolve({[e]:i})}let t=x.script({src:n});document.head.append(t),St[n]=new Promise((i)=>{t.onload=()=>i(globalThis)})}return St[n]}var to={};function At(n){if(to[n]===void 0){let e=x.link({rel:"stylesheet",type:"text/css",href:n});document.head.append(e),to[n]=new Promise((t)=>{e.onload=t})}return to[n]}var We={earth:'<svg class="color" viewBox="0 0 48 48"><g><g><g><path style="fill:#a3d9ff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M7,13.46 C5.1,16.52,4,20.13,4,24 C4,31.81,8.47,38.57,15,41.87 C15,41.87,15,31,15,31 C15,31,9,29,9,29 C9,29,9,19,9,19 C9,19,7,15,7,15 C7,15,7,13.46,7,13.46 z"/><path style="fill:#a3d9ff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M18.4,4.79 C20.18,4.28,22.06,4,24,4 C27.57,4,30.92,4.93,33.82,6.57 C33.82,6.57,29,13,29,13 C29,13,31,19,31,19 C31,19,37,21,37,21 C37,21,39,29,39,29 C39,29,37.35,38.89,37.35,38.89 C33.81,42.07,29.13,44,24,44 C21.03,44,18.22,43.35,15.69,42.2 C15.69,42.2,27,29,27,29 C27,29,27,25,27,25 C27,25,21,23,21,23 C21,23,15,19,15,19 C15,19,11,19,11,19 C11,19,11,13,11,13 C11,13,13,11,13,11 C13,11,15,15,15,15 C15,15,17,15,17,15 C17,15,17,9,17,9 C17,9,18.4,4.79,18.4,4.79 z"/><path style="fill:#274e42;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M18.4,4.79 C18.4,4.79,17,9,17,9 C17,9,17,15,17,15 C17,15,15,15,15,15 C15,15,13,11,13,11 C13,11,11,13,11,13 C11,13,11,19,11,19 C11,19,15,19,15,19 C15,19,21,23,21,23 C21,23,27,25,27,25 C27,25,27,29,27,29 C27,29,15.69,42.2,15.69,42.2 C15.46,42.09,15.23,41.98,15,41.87 C15,41.87,15,31,15,31 C15,31,9,29,9,29 C9,29,9,19,9,19 C9,19,7,15,7,15 C7,15,7,13.46,7,13.46 C9.57,9.32,13.62,6.19,18.4,4.79 z"/><path style="fill:#274e42;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M33.82,6.57 C33.82,6.57,29,13,29,13 C29,13,31,19,31,19 C31,19,37,21,37,21 C37,21,39,29,39,29 C39,29,37.35,38.89,37.35,38.89 C41.43,35.23,44,29.91,44,24 C44,16.52,39.9,10,33.82,6.57 z"/></g></g></g></svg> ',blueprint:'<svg class="color" viewBox="0 0 24 24"><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10.5,14.5 C10.5,14.5,7.5,15.5,7.5,17.5 C7.5,19.5,10.5,19.5,10.5,19.5"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M18.5,14.5 C18.5,14.5,21.5,15.5,21.5,17.5 C21.5,19.5,18.5,19.5,18.5,19.5"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M7,5.09 C7,3.94,7.9,3,9,3 C9,3,20,3,20,3 C21.1,3,22,3.94,22,5.09 C22,5.09,22,12.41,22,12.41 C22,13.56,21.1,14.5,20,14.5 C20,14.5,9,14.5,9,14.5 C7.9,14.5,7,13.56,7,12.41 C7,12.41,7,5.09,7,5.09 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M14.5,5.5 C14.5,5.5,14.5,11.5,14.5,11.5"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M16.5,7.5 C16.5,7.5,16.5,8.5,16.5,8.5"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.5,7.5 C12.5,7.5,12.5,8.5,12.5,8.5"/><g/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M18.5,21.5 C18.5,21.5,17.5,20.5,17.5,20.5 C17.5,20.5,16.5,21.5,16.5,21.5"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.5,21.5 C12.5,21.5,11.5,20.5,11.5,20.5 C11.5,20.5,10.5,21.5,10.5,21.5"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10.5,14.5 C10.5,14.5,18.5,14.5,18.5,14.5 C18.5,14.5,18.5,19.5,18.5,19.5 C18.5,19.5,10.5,19.5,10.5,19.5 C10.5,19.5,10.5,14.5,10.5,14.5 z"/><g><g><path style="fill:#5e78ca;fill-rule:nonzero;stroke:#f2f2f2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M14,16.5 C14,16.5,16,16.5,16,16.5 C16,16.5,14.53,19.5,14.53,19.5"/><path style="fill:#5e78ca;fill-rule:evenodd;stroke:none;" d="M3.59,8.5 C3.59,8.5,12.59,8.5,12.59,8.5 C12.59,8.5,14.53,19.5,14.53,19.5 C14.53,19.5,5.53,19.5,5.53,19.5 C5.53,19.5,3.59,8.5,3.59,8.5 z"/><path style="fill:#5e78ca;fill-rule:nonzero;stroke:#f2f2f2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.59,8.5 C12.59,8.5,11.12,11.5,11.12,11.5 C11.12,11.5,2.12,11.5,2.12,11.5 C2.12,11.5,3.59,8.5,3.59,8.5"/><path style="fill:#5e78ca;fill-rule:nonzero;stroke:#f2f2f2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.59,8.5 C12.59,8.5,14.53,19.5,14.53,19.5"/><path style="fill:#5e78ca;fill-rule:nonzero;stroke:#f2f2f2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M4.12,11.5 C4.12,11.5,5.53,19.5,5.53,19.5"/></g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M9.24,12.5 C10.75,12.5,12.2,13.73,12.46,15.24 C12.46,15.24,12.46,15.24,12.46,15.24 C12.68,16.49,11.85,17.5,10.6,17.5 C10.6,17.5,10.55,17.5,10.55,17.5 C10.17,17.5,9.92,17.81,9.98,18.19 C9.98,18.19,9.98,18.19,9.98,18.19 C10.21,19.47,9.36,20.5,8.08,20.5 C8.08,20.5,6.39,20.5,6.39,20.5 C5.1,20.5,3.87,19.45,3.64,18.16 C3.64,18.16,3.12,15.21,3.12,15.21 C2.86,13.71,3.86,12.5,5.35,12.5 C5.35,12.5,9.24,12.5,9.24,12.5 z"/></g></g></svg> ',tosiXr:'<svg class="color" viewBox="0 0 24 24"><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M8,14.25 C8,14.25,5,15.25,5,17.25 C5,19.25,8,19.25,8,19.25"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M16,14.25 C16,14.25,19,15.25,19,17.25 C19,19.25,16,19.25,16,19.25"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M4.5,4.85 C4.5,3.69,5.4,2.75,6.5,2.75 C6.5,2.75,17.5,2.75,17.5,2.75 C18.61,2.75,19.5,3.69,19.5,4.85 C19.5,4.85,19.5,12.16,19.5,12.16 C19.5,13.32,18.61,14.25,17.5,14.25 C17.5,14.25,6.5,14.25,6.5,14.25 C5.4,14.25,4.5,13.32,4.5,12.16 C4.5,12.16,4.5,4.85,4.5,4.85 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12,5.25 C12,5.25,12,11.25,12,11.25"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M14,7.25 C14,7.25,14,8.25,14,8.25"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10,7.25 C10,7.25,10,8.25,10,8.25"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M16,21.25 C16,21.25,15,20.25,15,20.25 C15,20.25,14,21.25,14,21.25"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10,21.25 C10,21.25,9,20.25,9,20.25 C9,20.25,8,21.25,8,21.25"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M8,14.25 C8,14.25,16,14.25,16,14.25 C16,14.25,16,19.25,16,19.25 C16,19.25,8,19.25,8,19.25 C8,19.25,8,14.25,8,14.25 z"/><path style="fill:#ff7bac;fill-opacity:0.75;fill-rule:evenodd;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-width:1;" d="M12,4 C12,4,11.99,4,11.99,4 C6.19,4,3,4.73,3,8.5 C3,11.39,4.66,13,7.27,13 C9.88,13,10.68,11.13,11.99,11.13 C11.99,11.13,12,11.13,12,11.13 C12,11.13,12.01,11.13,12.01,11.13 C13.32,11.13,14.12,13,16.73,13 C19.34,13,21,11.39,21,8.5 C21,4.73,17.81,4,12.01,4 C12.01,4,12,4,12,4 C12,4,12,4,12,4 z"/></g></svg> ',cmy:'<svg class="color filled" viewBox="0 0 24 24"><g><g><path style="fill:#00ff00;fill-rule:evenodd;" d="M12,10.88 C10.9,10.01,9.51,9.5,8,9.5 C7.22,9.5,6.47,9.64,5.78,9.89 C6.37,11.85,7.87,13.42,9.78,14.11 C10.17,12.81,10.96,11.69,12,10.88 z"/><path style="fill:#0000ff;fill-rule:evenodd;" d="M12,10.88 C13.1,10.01,14.49,9.5,16,9.5 C16.78,9.5,17.53,9.64,18.22,9.89 C17.63,11.85,16.13,13.42,14.22,14.11 C13.83,12.81,13.04,11.69,12,10.88 C12,10.88,12,10.88,12,10.88 z"/><path style="fill:#000000;fill-rule:evenodd;" d="M9.78,14.11 C10.17,12.81,10.96,11.69,12,10.88 C13.04,11.69,13.83,12.81,14.22,14.11 C13.53,14.36,12.78,14.5,12,14.5 C11.22,14.5,10.47,14.36,9.78,14.11 C9.78,14.11,9.78,14.11,9.78,14.11 z"/><path style="fill:#ff0000;fill-rule:evenodd;" d="M9.78,14.11 C9.6,14.71,9.5,15.34,9.5,16 C9.5,18.08,10.48,19.93,12,21.12 C13.52,19.93,14.5,18.08,14.5,16 C14.5,15.34,14.4,14.71,14.22,14.11 C13.53,14.36,12.78,14.5,12,14.5 C11.22,14.5,10.47,14.36,9.78,14.11 C9.78,14.11,9.78,14.11,9.78,14.11 z"/><path style="fill:#02fefe;fill-rule:evenodd;" d="M5.78,9.89 C5.6,9.29,5.5,8.66,5.5,8 C5.5,4.41,8.41,1.5,12,1.5 C15.59,1.5,18.5,4.41,18.5,8 C18.5,8.66,18.4,9.29,18.22,9.89 C17.53,9.64,16.78,9.5,16,9.5 C14.49,9.5,13.1,10.01,12,10.88 C10.9,10.01,9.51,9.5,8,9.5 C7.22,9.5,6.47,9.64,5.78,9.89 C5.78,9.89,5.78,9.89,5.78,9.89 z"/><path style="fill:#fffe00;fill-rule:evenodd;" d="M5.78,9.89 C3.28,10.8,1.5,13.19,1.5,16 C1.5,19.59,4.41,22.5,8,22.5 C9.51,22.5,10.9,21.99,12,21.12 C10.48,19.93,9.5,18.08,9.5,16 C9.5,15.34,9.6,14.71,9.78,14.11 C7.87,13.42,6.37,11.85,5.78,9.89 C5.78,9.89,5.78,9.89,5.78,9.89 z"/><path style="fill:#ff00ff;fill-rule:evenodd;" d="M18.22,9.89 C20.72,10.8,22.5,13.19,22.5,16 C22.5,19.59,19.59,22.5,16,22.5 C14.49,22.5,13.1,21.99,12,21.12 C13.52,19.93,14.5,18.08,14.5,16 C14.5,15.34,14.4,14.71,14.22,14.11 C16.13,13.42,17.63,11.85,18.22,9.89 z"/></g></g></svg> ',rgb:'<svg class="color filled" viewBox="0 0 24 24"><g><g><path style="fill:#ff00ff;fill-rule:evenodd;" d="M12,10.88 C10.9,10.01,9.51,9.5,8,9.5 C7.22,9.5,6.47,9.64,5.78,9.89 C6.37,11.85,7.87,13.42,9.78,14.11 C10.17,12.81,10.96,11.69,12,10.88 z"/><path style="fill:#ffff00;fill-rule:evenodd;" d="M12,10.88 C13.1,10.01,14.49,9.5,16,9.5 C16.78,9.5,17.53,9.64,18.22,9.89 C17.63,11.85,16.13,13.42,14.22,14.11 C13.83,12.81,13.04,11.69,12,10.88 C12,10.88,12,10.88,12,10.88 z"/><path style="fill:#ffffff;fill-rule:evenodd;" d="M9.78,14.11 C10.17,12.81,10.96,11.69,12,10.88 C13.04,11.69,13.83,12.81,14.22,14.11 C13.53,14.36,12.78,14.5,12,14.5 C11.22,14.5,10.47,14.36,9.78,14.11 C9.78,14.11,9.78,14.11,9.78,14.11 z"/><path style="fill:#00ffff;fill-rule:evenodd;" d="M9.78,14.11 C9.6,14.71,9.5,15.34,9.5,16 C9.5,18.08,10.48,19.93,12,21.12 C13.52,19.93,14.5,18.08,14.5,16 C14.5,15.34,14.4,14.71,14.22,14.11 C13.53,14.36,12.78,14.5,12,14.5 C11.22,14.5,10.47,14.36,9.78,14.11 C9.78,14.11,9.78,14.11,9.78,14.11 z"/><path style="fill:#ff0000;fill-rule:evenodd;" d="M5.78,9.89 C5.6,9.29,5.5,8.66,5.5,8 C5.5,4.41,8.41,1.5,12,1.5 C15.59,1.5,18.5,4.41,18.5,8 C18.5,8.66,18.4,9.29,18.22,9.89 C17.53,9.64,16.78,9.5,16,9.5 C14.49,9.5,13.1,10.01,12,10.88 C10.9,10.01,9.51,9.5,8,9.5 C7.22,9.5,6.47,9.64,5.78,9.89 C5.78,9.89,5.78,9.89,5.78,9.89 z"/><path style="fill:#0000ff;fill-rule:evenodd;" d="M5.78,9.89 C3.28,10.8,1.5,13.19,1.5,16 C1.5,19.59,4.41,22.5,8,22.5 C9.51,22.5,10.9,21.99,12,21.12 C10.48,19.93,9.5,18.08,9.5,16 C9.5,15.34,9.6,14.71,9.78,14.11 C7.87,13.42,6.37,11.85,5.78,9.89 C5.78,9.89,5.78,9.89,5.78,9.89 z"/><path style="fill:#00ff00;fill-rule:evenodd;" d="M18.22,9.89 C20.72,10.8,22.5,13.19,22.5,16 C22.5,19.59,19.59,22.5,16,22.5 C14.49,22.5,13.1,21.99,12,21.12 C13.52,19.93,14.5,18.08,14.5,16 C14.5,15.34,14.4,14.71,14.22,14.11 C16.13,13.42,17.63,11.85,18.22,9.89 z"/></g></g></svg> ',xrColor:'<svg class="color filled" viewBox="0 0 40 24"><g><g><g><path style="fill:#000000;fill-rule:evenodd;" d="M20,2 C19.99,2,19.98,2,19.98,2 C8.39,2,2,3.61,2,12 C2,18.41,5.32,22,10.54,22 C15.77,22,17.37,17.85,19.98,17.85 C19.98,17.85,19.99,17.85,20,17.85 C20.01,17.85,20.02,17.85,20.02,17.85 C22.63,17.85,24.23,22,29.46,22 C34.68,22,38,18.41,38,12 C38,3.61,31.61,2,20.02,2 C20.02,2,20.01,2,20,2 C20,2,20,2,20,2 z"/></g><path style="fill:#fbed21;fill-rule:evenodd;" d="M12.2,19.84 C15.79,19.39,17.07,16.46,19.07,16.46 C19.07,16.46,19.08,16.46,19.09,16.46 C19.09,16.46,19.1,16.46,19.11,16.46 C19.44,16.46,19.75,16.54,20.06,16.68 C20.37,16.54,20.68,16.46,21.01,16.46 C21.02,16.46,21.02,16.46,21.03,16.46 C21.04,16.46,21.04,16.46,21.05,16.46 C23.05,16.46,24.33,19.39,27.92,19.84 C31.66,19.4,33.98,16.5,33.98,11.62 C33.98,4.91,29.04,3.44,20.06,3.35 C11.07,3.44,6.14,4.91,6.14,11.62 C6.14,16.5,8.46,19.4,12.2,19.84 z"/><path style="fill:#8cc63f;fill-rule:evenodd;" d="M12.2,19.84 C12.52,19.87,12.86,19.89,13.21,19.89 C16.86,19.89,18.37,17.43,20.06,16.68 C19.75,16.54,19.44,16.46,19.11,16.46 C19.1,16.46,19.09,16.46,19.09,16.46 C19.08,16.46,19.07,16.46,19.07,16.46 C17.07,16.46,15.79,19.39,12.2,19.84 z"/><path style="fill:#8cc63f;fill-rule:evenodd;" d="M20.06,3.35 C20.37,3.35,20.69,3.35,21.01,3.35 C21.02,3.35,21.02,3.35,21.03,3.35 C21.03,3.35,21.03,3.35,21.03,3.35 C21.04,3.35,21.04,3.35,21.05,3.35 C30.64,3.35,35.92,4.68,35.92,11.62 C35.92,16.92,33.18,19.89,28.86,19.89 C28.53,19.89,28.22,19.87,27.92,19.84 C31.66,19.4,33.98,16.5,33.98,11.62 C33.98,4.91,29.04,3.44,20.06,3.35 C20.06,3.35,20.06,3.35,20.06,3.35 z"/><path style="fill:#ff1c23;fill-rule:evenodd;" d="M20.06,16.68 C21.74,17.43,23.25,19.89,26.91,19.89 C27.26,19.89,27.59,19.87,27.92,19.84 C24.33,19.39,23.05,16.46,21.05,16.46 C21.04,16.46,21.04,16.46,21.03,16.46 C21.02,16.46,21.02,16.46,21.01,16.46 C20.68,16.46,20.37,16.54,20.06,16.68 z"/><path style="fill:#ff1c23;fill-rule:evenodd;" d="M12.2,19.84 C11.9,19.87,11.59,19.89,11.26,19.89 C6.94,19.89,4.19,16.92,4.19,11.62 C4.19,4.68,9.48,3.35,19.07,3.35 C19.07,3.35,19.08,3.35,19.09,3.35 C19.09,3.35,19.09,3.35,19.09,3.35 C19.09,3.35,19.1,3.35,19.11,3.35 C19.43,3.35,19.75,3.35,20.06,3.35 C11.07,3.44,6.14,4.91,6.14,11.62 C6.14,16.5,8.46,19.4,12.2,19.84 z"/></g><g><path style="fill:#8cc63e;fill-rule:nonzero;" d="M22.55,8.63 C22.55,9.05,22.55,9.46,22.55,9.88 C22.54,10.25,22.85,10.56,23.2,10.55 C23.54,10.56,23.85,10.25,23.85,9.88 C23.85,9.46,23.85,9.05,23.85,8.63 C23.85,8.26,23.54,7.95,23.2,7.96 C22.85,7.95,22.54,8.26,22.55,8.63 z"/><path style="fill:#8cc63e;fill-rule:nonzero;" d="M17.32,8.63 C17.32,9.05,17.32,9.46,17.32,9.88 C17.31,10.25,17.62,10.56,17.97,10.55 C18.31,10.56,18.62,10.25,18.62,9.88 C18.62,9.46,18.62,9.05,18.62,8.63 C18.62,8.26,18.31,7.95,17.97,7.96 C17.62,7.95,17.31,8.26,17.32,8.63 z"/><path style="fill:#8cc63e;fill-rule:nonzero;" d="M19.99,4.39 C19.99,8.09,19.99,11.8,19.99,15.5 C19.99,15.87,20.3,16.18,20.64,16.17 C20.99,16.18,21.3,15.87,21.29,15.5 C21.29,11.8,21.29,8.09,21.29,4.39 C21.3,4.02,20.99,3.71,20.64,3.72 C20.3,3.71,19.99,4.02,19.99,4.39 z"/><path style="fill:#fe1a22;fill-rule:nonzero;" d="M21.43,8.63 C21.43,9.05,21.43,9.46,21.43,9.88 C21.42,10.25,21.73,10.56,22.08,10.55 C22.42,10.56,22.73,10.25,22.73,9.88 C22.73,9.46,22.73,9.05,22.73,8.63 C22.73,8.26,22.42,7.95,22.08,7.96 C21.73,7.95,21.42,8.26,21.43,8.63 z"/><path style="fill:#fe1a22;fill-rule:nonzero;" d="M16.2,8.63 C16.2,9.05,16.2,9.46,16.2,9.88 C16.19,10.25,16.5,10.56,16.85,10.55 C17.19,10.56,17.5,10.25,17.5,9.88 C17.5,9.46,17.5,9.05,17.5,8.63 C17.5,8.26,17.19,7.95,16.85,7.96 C16.5,7.95,16.19,8.26,16.2,8.63 z"/><path style="fill:#fe1a22;fill-rule:nonzero;" d="M18.87,4.39 C18.87,8.09,18.87,11.8,18.87,15.5 C18.87,15.87,19.18,16.18,19.52,16.17 C19.86,16.18,20.18,15.87,20.17,15.5 C20.17,11.8,20.17,8.09,20.17,4.39 C20.18,4.02,19.86,3.71,19.52,3.72 C19.18,3.71,18.87,4.02,18.87,4.39 z"/><path style="fill:#000000;fill-rule:nonzero;" d="M21.97,8.63 C21.97,9.05,21.97,9.46,21.97,9.88 C21.97,10.25,22.28,10.56,22.62,10.55 C22.97,10.56,23.28,10.25,23.27,9.88 C23.27,9.46,23.27,9.05,23.27,8.63 C23.28,8.26,22.97,7.95,22.62,7.96 C22.28,7.95,21.97,8.26,21.97,8.63 z"/><path style="fill:#000000;fill-rule:nonzero;" d="M16.74,8.63 C16.74,9.05,16.74,9.46,16.74,9.88 C16.74,10.25,17.05,10.56,17.39,10.55 C17.74,10.56,18.05,10.25,18.04,9.88 C18.04,9.46,18.04,9.05,18.04,8.63 C18.05,8.26,17.74,7.95,17.39,7.96 C17.05,7.95,16.74,8.26,16.74,8.63 z"/><path style="fill:#000000;fill-rule:nonzero;" d="M19.41,4.39 C19.41,8.09,19.41,11.8,19.41,15.5 C19.41,15.87,19.72,16.18,20.07,16.17 C20.41,16.18,20.72,15.87,20.72,15.5 C20.72,11.8,20.72,8.09,20.72,4.39 C20.72,4.02,20.41,3.71,20.07,3.72 C19.72,3.71,19.41,4.02,19.41,4.39 z"/></g></g></svg> ',tosiUi:'<svg class="color" viewBox="0 0 48 48"><g><g><g><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M3,33 C3,31.9,3.9,31,5,31 C5,31,43,31,43,31 C44.1,31,45,31.9,45,33 C45,33,45,43,45,43 C45,44.1,44.1,45,43,45 C43,45,5,45,5,45 C3.9,45,3,44.1,3,43 C3,43,3,33,3,33 z"/><g><path style="fill:#ffffff;fill-rule:evenodd;stroke:#ed247b;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M7,35 C7,35,7,36.34,7,38 C7,39.66,8.34,41,10,41 C11.66,41,13,39.66,13,38 C13,36.34,13,35,13,35"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#ed247b;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M17,35 C17,35,17,41,17,41"/></g><g><path style="fill:#ed247b;fill-rule:evenodd;stroke:none;" d="M38,33 C40.76,33,43,35.24,43,38 C43,40.76,40.76,43,38,43 C35.24,43,33,40.76,33,38 C33,35.24,35.24,33,38,33 z"/><path style="fill:#ed247b;fill-rule:nonzero;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M40,36 C40,36,36,40,36,40"/><path style="fill:#ed247b;fill-rule:nonzero;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M36,36 C36,36,40,40,40,40"/></g></g><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M15.97,21.01 C15.97,21.01,9.97,23.01,9.97,27.01 C9.97,31.01,15.97,31.01,15.97,31.01"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M31.97,21.01 C31.97,21.01,37.97,23.01,37.97,27.01 C37.97,31.01,31.97,31.01,31.97,31.01"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M31,33 C31,33,29.49,31,29.49,31 C29.49,31,27.97,33,27.97,33"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M19.97,33 C19.97,33,17.97,31,17.97,31 C17.97,31,15.97,33,15.97,33"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M15.97,21 C15.97,21,31.97,21,31.97,21 C31.97,21,31.97,31,31.97,31 C31.97,31,15.97,31,15.97,31 C15.97,31,15.97,21,15.97,21 z"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M9,7.18 C9,4.87,10.79,3,13,3 C13,3,35.02,3,35.02,3 C37.23,3,39.03,4.87,39.03,7.18 C39.03,7.18,39.03,21.82,39.03,21.82 C39.03,24.13,37.23,26,35.02,26 C35.02,26,13,26,13,26 C10.79,26,9,24.13,9,21.82 C9,21.82,9,7.18,9,7.18 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M24,11 C24,11,24,23,24,23"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M28,15 C28,15,28,17,28,17"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M20,15 C20,15,20,17,20,17"/></g></g></g></svg> ',tosiFavicon:'<svg class="color" viewBox="0 0 48 48"><g><g><path style="fill:#ed247b;fill-rule:evenodd;stroke:none;" d="M1,9 C1,4.58,4.58,1,9,1 C9,1,39,1,39,1 C43.42,1,47,4.58,47,9 C47,9,47,39,47,39 C47,43.42,43.42,47,39,47 C39,47,9,47,9,47 C4.58,47,1,43.42,1,39 C1,39,1,9,1,9 z"/><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M16,29 C16,29,10,31,10,35 C10,39,16,39,16,39"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M32,29 C32,29,38,31,38,35 C38,39,32,39,32,39"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M9,10.18 C9,7.87,10.79,6,13,6 C13,6,35,6,35,6 C37.21,6,39,7.87,39,10.18 C39,10.18,39,24.82,39,24.82 C39,27.13,37.21,29,35,29 C35,29,13,29,13,29 C10.79,29,9,27.13,9,24.82 C9,24.82,9,10.18,9,10.18 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M24,11 C24,11,24,23,24,23"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M28,15 C28,15,28,17,28,17"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M20,15 C20,15,20,17,20,17"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M32,43 C32,43,30,41,30,41 C30,41,28,43,28,43"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M20,43 C20,43,18,41,18,41 C18,41,16,43,16,43"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M16,29 C16,29,32,29,32,29 C32,29,32,39,32,39 C32,39,16,39,16,39 C16,39,16,29,16,29 z"/></g></g></g></svg> ',tosiPlatform:'<svg class="color" viewBox="0 0 48 48"><g><g><g><path style="fill:#3ea9f5;fill-rule:evenodd;stroke:none;" d="M23.97,47 C23.97,47,39,47,39,47 C43.42,47,47,43.42,47,39 C47,39,47,9,47,9 C47,4.58,43.42,1,39,1 C39,1,9,1,9,1 C4.58,1,1,4.58,1,9 C1,9,1,39,1,39 C1,41.64,2.28,43.98,4.25,45.44 C4.09,44.82,4,44.17,4,43.5 C4,39.36,7.36,36,11.5,36 C15.14,36,18.18,38.6,18.86,42.05 C19.07,42.02,19.28,42,19.5,42 C21.99,42,24,44.01,24,46.5 C24,46.67,23.99,46.84,23.97,47 z"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:none;" d="M4.25,45.44 C4.09,44.82,4,44.17,4,43.5 C4,39.36,7.36,36,11.5,36 C15.14,36,18.18,38.6,18.86,42.05 C19.07,42.02,19.28,42,19.5,42 C21.99,42,24,44.01,24,46.5 C24,46.67,23.99,46.84,23.97,47 C23.97,47,9,47,9,47 C7.22,47,5.58,46.42,4.25,45.44 z"/></g><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M35,35 C35,35,32.17,35,32.17,35 C32.17,35,32.17,37.83,32.17,37.83"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M31,39 C31,39,28.17,39,28.17,39 C28.17,39,28.17,41.83,28.17,41.83"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M7.48,16 C4.45,16,2,18.45,2,21.48 C2,21.48,2,21.48,2,21.48 C2,23.98,4.02,26,6.52,26 C6.52,26,6.62,26,6.62,26 C7.38,26,8,26.62,8,27.38 C8,27.38,8,27.38,8,27.38 C8,29.93,10.07,32,12.62,32 C12.62,32,16,32,16,32 C18.58,32,20.68,29.91,20.68,27.32 C20.68,27.32,20.68,21.42,20.68,21.42 C20.68,18.43,18.25,16,15.26,16 C15.26,16,7.48,16,7.48,16 z"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M17,29 C17,29,33,29,33,29 C33,29,33,29,33,29 C33,34.52,28.52,39,23,39 C23,39,23,39,23,39 C19.69,39,17,36.31,17,33 C17,33,17,29,17,29 z"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M40.52,16 C43.55,16,46,18.45,46,21.48 C46,21.48,46,21.48,46,21.48 C46,23.98,43.98,26,41.48,26 C41.48,26,41.38,26,41.38,26 C40.62,26,40,26.62,40,27.38 C40,27.38,40,27.38,40,27.38 C40,29.93,37.93,32,35.38,32 C35.38,32,32,32,32,32 C29.42,32,27.32,29.91,27.32,27.32 C27.32,27.32,27.32,21.42,27.32,21.42 C27.32,18.43,29.75,16,32.74,16 C32.74,16,40.52,16,40.52,16 z"/><g><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M6,10.18 C6,7.87,7.79,6,10,6 C10,6,32,6,32,6 C34.21,6,36,7.87,36,10.18 C36,10.18,36,24.82,36,24.82 C36,27.13,34.21,29,32,29 C32,29,10,29,10,29 C7.79,29,6,27.13,6,24.82 C6,24.82,6,10.18,6,10.18 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M21,11 C21,11,21,23,21,23"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M25,15 C25,15,25,17,25,17"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M17,15 C17,15,17,17,17,17"/></g></g></g></svg> ',tosi:'<svg class="color" viewBox="0 0 48 48"><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M38.35,31.7 C39.78,34.37,38.78,37.69,36.11,39.13 C36.11,39.13,36.11,39.13,36.11,39.13 C33.92,40.31,31.18,39.48,29.99,37.29 C29.99,37.29,29.95,37.2,29.95,37.2 C29.58,36.53,28.75,36.27,28.08,36.64 C28.08,36.64,28.08,36.64,28.08,36.64 C25.83,37.84,23.03,37,21.82,34.76 C21.82,34.76,20.22,31.78,20.22,31.78 C18.99,29.5,19.85,26.67,22.12,25.44 C22.12,25.44,27.32,22.65,27.32,22.65 C29.96,21.23,33.24,22.22,34.66,24.85 C34.66,24.85,38.35,31.7,38.35,31.7 z"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M10.65,31.7 C9.22,34.37,10.22,37.69,12.89,39.13 C12.89,39.13,12.89,39.13,12.89,39.13 C15.08,40.31,17.82,39.48,19.01,37.29 C19.01,37.29,19.05,37.2,19.05,37.2 C19.42,36.53,20.25,36.27,20.92,36.64 C20.92,36.64,20.92,36.64,20.92,36.64 C23.17,37.84,25.97,37,27.18,34.76 C27.18,34.76,28.78,31.78,28.78,31.78 C30.01,29.5,29.15,26.67,26.88,25.44 C26.88,25.44,21.68,22.65,21.68,22.65 C19.04,21.23,15.76,22.22,14.34,24.85 C14.34,24.85,10.65,31.7,10.65,31.7 z"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M32.5,43 C32.5,43,30.5,41,30.5,41 C30.5,41,28.5,43,28.5,43"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M20.5,43 C20.5,43,18.5,41,18.5,41 C18.5,41,16.5,43,16.5,43"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M16.5,29 C16.5,29,32.5,29,32.5,29 C32.5,29,32.5,36,32.5,36 C32.5,37.66,31.16,39,29.5,39 C29.5,39,19.5,39,19.5,39 C17.84,39,16.5,37.66,16.5,36 C16.5,36,16.5,29,16.5,29 z"/><g><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M9.5,10.18 C9.5,7.87,11.29,6,13.5,6 C13.5,6,35.5,6,35.5,6 C37.71,6,39.5,7.87,39.5,10.18 C39.5,10.18,39.5,24.82,39.5,24.82 C39.5,27.13,37.71,29,35.5,29 C35.5,29,13.5,29,13.5,29 C11.29,29,9.5,27.13,9.5,24.82 C9.5,24.82,9.5,10.18,9.5,10.18 z"/><g><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M24.5,11 C24.5,11,24.5,23,24.5,23"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M28.5,15 C28.5,15,28.5,17,28.5,17"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M20.5,15 C20.5,15,20.5,17,20.5,17"/></g></g></g></svg> ',sortDescending:'<svg class="stroked" viewBox="0 0 24 24"><g><path d="M16.5,14.5 C16.5,14.5,7.5,14.5,7.5,14.5"/><path d="M14.5,18.5 C14.5,18.5,9.5,18.5,9.5,18.5"/><path d="M18.5,10.5 C18.5,10.5,5.5,10.5,5.5,10.5"/><path d="M20.5,6.5 C20.5,6.5,3.5,6.5,3.5,6.5"/></g></svg> ',columns:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path></svg>',underline:'<svg class="stroked" viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>',grid:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',triangle:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>',search:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',volume2:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',arrowUpCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>',pauseCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>',checkSquare:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',arrowDown:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>',figma:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path></svg>',cornerRightUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="10 9 15 4 20 9"></polyline><path d="M4 20h7a4 4 0 0 0 4-4V4"></path></svg>',chevronsRight:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>',list:'<svg class="stroked" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',chevronsDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>',wind:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>',cornerUpRight:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="15 14 20 9 15 4"></polyline><path d="M4 20v-7a4 4 0 0 1 4-4h12"></path></svg>',target:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',scissors:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>',minimize2:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>',playCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>',crosshair:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>',airplay:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path><polygon points="12 15 17 21 7 21 12 15"></polygon></svg>',xOctagon:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',repeat:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>',edit3:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',volume1:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',sunrise:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline></svg>',toggleRight:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="16" cy="12" r="3"></circle></svg>',umbrella:'<svg class="stroked" viewBox="0 0 24 24"><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"></path></svg>',user:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',fileMinus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>',xCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',circle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>',phoneMissed:'<svg class="stroked" viewBox="0 0 24 24"><line x1="23" y1="1" x2="17" y2="7"></line><line x1="17" y1="1" x2="23" y2="7"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',edit2:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>',cornerLeftUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="14 9 9 4 4 9"></polyline><path d="M20 20h-7a4 4 0 0 1-4-4V4"></path></svg>',home:'<svg class="stroked" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',gitlab:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"></path></svg>',music:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',smartphone:'<svg class="stroked" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',moreHorizontal:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>',sliders:'<svg class="stroked" viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>',arrowUpLeft:'<svg class="stroked" viewBox="0 0 24 24"><line x1="17" y1="17" x2="7" y2="7"></line><polyline points="7 17 7 7 17 7"></polyline></svg>',chevronDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>',hexagon:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',github:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>',crop:'<svg class="stroked" viewBox="0 0 24 24"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path></svg>',tag:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',briefcase:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',rotateCw:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>',map:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>',inbox:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>',alignJustify:'<svg class="stroked" viewBox="0 0 24 24"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>',plusSquare:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',power:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>',database:'<svg class="stroked" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',cameraOff:'<svg class="stroked" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"></path></svg>',toggleLeft:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="8" cy="12" r="3"></circle></svg>',file:'<svg class="stroked" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>',messageCircle:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',voicemail:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="5.5" cy="11.5" r="4.5"></circle><circle cx="18.5" cy="11.5" r="4.5"></circle><line x1="5.5" y1="16" x2="18.5" y2="16"></line></svg>',terminal:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',move:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>',maximize:'<svg class="stroked" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>',chevronUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>',arrowDownLeft:'<svg class="stroked" viewBox="0 0 24 24"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg>',fileText:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',droplet:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>',zapOff:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="12.41 6.75 13 2 10.57 4.92"></polyline><polyline points="18.57 12.91 21 10 15.66 10"></polyline><polyline points="8 8 3 14 12 14 11 22 16 16"></polyline><line x1="1" y1="1" x2="23" y2="23"></line></svg>',x:'<svg class="stroked" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',barChart:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',lock:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',logIn:'<svg class="stroked" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>',shoppingBag:'<svg class="stroked" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',divide:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="6" r="2"></circle><line x1="5" y1="12" x2="19" y2="12"></line><circle cx="12" cy="18" r="2"></circle></svg>',cloudDrizzle:'<svg class="stroked" viewBox="0 0 24 24"><line x1="8" y1="19" x2="8" y2="21"></line><line x1="8" y1="13" x2="8" y2="15"></line><line x1="16" y1="19" x2="16" y2="21"></line><line x1="16" y1="13" x2="16" y2="15"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="12" y1="15" x2="12" y2="17"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>',refreshCw:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',chevronRight:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>',clipboard:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',package:'<svg class="stroked" viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',instagram:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',link:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',videoOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',key:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>',meh:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',cornerDownRight:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>',arrowRight:'<svg class="stroked" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',aperture:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line></svg>',stopCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>',logOut:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',arrowLeftCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line></svg>',barChart2:'<svg class="stroked" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',gitPullRequest:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg>',minimize:'<svg class="stroked" viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>',minusSquare:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>',settings:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.6.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.6.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.6.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.6.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',cloudSnow:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="22" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line></svg>',thumbsDown:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>',type:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>',archive:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>',phoneOutgoing:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 7 23 1 17 1"></polyline><line x1="16" y1="8" x2="23" y2="1"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',pocket:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path><polyline points="8 10 12 14 16 10"></polyline></svg>',mail:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',shield:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',download:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',phoneForwarded:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="19 1 23 5 19 9"></polyline><line x1="15" y1="5" x2="23" y2="5"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',cornerRightDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="10 15 15 20 20 15"></polyline><path d="M4 4h7a4 4 0 0 1 4 4v12"></path></svg>',bookOpen:'<svg class="stroked" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',divideSquare:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line><line x1="12" y1="8" x2="12" y2="8"></line></svg>',server:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',tv:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>',skipForward:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>',volume:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>',userPlus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',batteryCharging:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"></path><line x1="23" y1="13" x2="23" y2="11"></line><polyline points="11 6 7 12 13 12 9 18"></polyline></svg>',layers:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',slash:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>',radio:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>',book:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',userMinus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="23" y1="11" x2="17" y2="11"></line></svg>',bell:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',gitBranch:'<svg class="stroked" viewBox="0 0 24 24"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>',coffee:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',code:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',thermometer:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>',cast:'<svg class="stroked" viewBox="0 0 24 24"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path><line x1="2" y1="20" x2="2.01" y2="20"></line></svg>',flag:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>',eyeOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',battery:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>',disc:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>',frown:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',tool:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',cpu:'<svg class="stroked" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>',bold:'<svg class="stroked" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>',hash:'<svg class="stroked" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>',share2:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',plus:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',check:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',rotateCcw:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>',hardDrive:'<svg class="stroked" viewBox="0 0 24 24"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>',bluetooth:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline></svg>',pieChart:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>',headphones:'<svg class="stroked" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',rss:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>',wifi:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',cornerUpLeft:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>',watch:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"></circle><polyline points="12 9 12 12 13.5 13.5"></polyline><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"></path></svg>',info:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',userX:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>',loader:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',refreshCcw:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>',folderPlus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>',gitMerge:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M6 21V9a9 9 0 0 0 9 9"></path></svg>',mic:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',copy:'<svg class="stroked" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',zoomIn:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',arrowRightCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>',alignRight:'<svg class="stroked" viewBox="0 0 24 24"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>',image:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',maximize2:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>',checkCircle:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',sunset:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="9" x2="12" y2="2"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="16 5 12 9 8 5"></polyline></svg>',save:'<svg class="stroked" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>',smile:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',navigation:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>',cloudLightning:'<svg class="stroked" viewBox="0 0 24 24"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>',paperclip:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>',fastForward:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>',xSquare:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>',award:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',zoomOut:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',box:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',thumbsUp:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>',percent:'<svg class="stroked" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>',sidebar:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>',square:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',play:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',gitCommit:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><line x1="1.05" y1="12" x2="7" y2="12"></line><line x1="17.01" y1="12" x2="22.96" y2="12"></line></svg>',table:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path></svg>',send:'<svg class="stroked" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',phoneCall:'<svg class="stroked" viewBox="0 0 24 24"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',speaker:'<svg class="stroked" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><circle cx="12" cy="14" r="4"></circle><line x1="12" y1="6" x2="12.01" y2="6"></line></svg>',facebook:'<svg class="filled" version="1" viewBox="0 0 512 512"><path d="M464 0h-416c-26 0-48 22-48 48v416c0 26 22 48 48 48h208v-224h-64v-64h64v-32c0-53 43-96 96-96h64v64h-64c-18 0-32 14-32 32v32h96l-16 64h-80v224h144c26 0 48-22 48-48v-416c0-26-22-48-48-48z"></path></svg> ',codesandbox:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',camera:'<svg class="stroked" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',link2:'<svg class="stroked" viewBox="0 0 24 24"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path><line x1="8" y1="12" x2="16" y2="12"></line></svg>',printer:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>',folderMinus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="9" y1="14" x2="15" y2="14"></line></svg>',arrowUpRight:'<svg class="stroked" viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>',truck:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',lifeBuoy:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>',penTool:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.59 7.59"></path><circle cx="11" cy="11" r="2"></circle></svg>',atSign:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>',feather:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>',trash:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',wifiOff:'<svg class="stroked" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',cornerLeftDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="14 15 9 20 4 15"></polyline><path d="M20 4h-7a4 4 0 0 0-4 4v12"></path></svg>',dollarSign:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',star:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',cloudOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',sun:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',messageSquare:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',edit:'<svg class="stroked" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',anchor:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12H2a10 10 0 0 0 20 0h-3"></path></svg>',alertCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',chevronsUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>',uploadCloud:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>',twitch:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path></svg>',youtube:'<svg class="filled" version="1" viewBox="0 0 512 512"><g></g><path d="M507 154c0 0-5-35-20-51-20-20-41-21-51-22-72-5-179-5-179-5h-0c0 0-108 0-179 5-10 1-32 1-51 22-15 16-20 51-20 51s-5 41-5 83v39c0 41 5 83 5 83s5 35 20 51c20 20 45 20 57 22 41 4 174 5 174 5s108-0 179-5c10-1 32-1 51-22 15-16 20-51 20-51s5-41 5-83v-39c-0-41-5-83-5-83zM203 322v-144l138 72-138 72z"></path></svg> ',unlock:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>',compass:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',plusCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',creditCard:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',cloudRain:'<svg class="stroked" viewBox="0 0 24 24"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>',trash2:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',skipBack:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>',filePlus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>',delete:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>',command:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>',clock:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',octagon:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon></svg>',phone:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',eye:'<svg class="stroked" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',phoneOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>',codepen:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line></svg>',dribbble:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path></svg>',gift:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>',externalLink:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',zap:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',trello:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="9"></rect><rect x="14" y="7" width="3" height="5"></rect></svg>',moreVertical:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>',micOff:'<svg class="stroked" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',share:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>',arrowUp:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',bellOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',linkedin:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>',video:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',divideCircle:'<svg class="stroked" viewBox="0 0 24 24"><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line><line x1="12" y1="8" x2="12" y2="8"></line><circle cx="12" cy="12" r="10"></circle></svg>',activity:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',twitter:'<svg class="stroked" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>',mapPin:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',filter:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>',phoneIncoming:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="16 2 16 8 22 8"></polyline><line x1="23" y1="1" x2="16" y2="8"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',italic:'<svg class="stroked" viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>',chevronsLeft:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>',calendar:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',globe:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',arrowLeft:'<svg class="stroked" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',alignCenter:'<svg class="stroked" viewBox="0 0 24 24"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>',minusCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>',arrowDownRight:'<svg class="stroked" viewBox="0 0 24 24"><line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline></svg>',framer:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 16V9h14V2H5l14 14h-7m-7 0l7 7v-7m-7 0h7"></path></svg>',volumeX:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>',slack:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"></path><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"></path><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"></path><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"></path><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"></path><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"></path></svg>',cloud:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>',downloadCloud:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg>',shuffle:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>',rewind:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>',upload:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',trendingDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>',pause:'<svg class="stroked" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',arrowDownCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg>',bookmark:'<svg class="stroked" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',alertTriangle:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',userCheck:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>',tablet:'<svg class="stroked" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',alertOctagon:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',menu:'<svg class="stroked" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',chrome:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>',shoppingCart:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',folder:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',users:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',cornerDownLeft:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>',monitor:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',minus:'<svg class="stroked" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',helpCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',navigation2:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>',chevronLeft:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>',film:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>',moon:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',shieldOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"></path><path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',layout:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',mousePointer:'<svg class="stroked" viewBox="0 0 24 24"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path><path d="M13 13l6 6"></path></svg>',alignLeft:'<svg class="stroked" viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>',heart:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',trendingUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',listBullet:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,6 C21,6,10,6,10,6"/><path style="" d="M21,12 C21,12,10,12,10,12"/><path style="" d="M21,18 C21,18,10,18,10,18"/><path style="" d="M5.5,5 C6.05,5,6.5,5.45,6.5,6 C6.5,6.55,6.05,7,5.5,7 C4.95,7,4.5,6.55,4.5,6 C4.5,5.45,4.95,5,5.5,5 z"/><path style="" d="M5.5,11 C6.05,11,6.5,11.45,6.5,12 C6.5,12.55,6.05,13,5.5,13 C4.95,13,4.5,12.55,4.5,12 C4.5,11.45,4.95,11,5.5,11 z"/><path style="" d="M5.5,17 C6.05,17,6.5,17.45,6.5,18 C6.5,18.55,6.05,19,5.5,19 C4.95,19,4.5,18.55,4.5,18 C4.5,17.45,4.95,17,5.5,17 z"/></g></svg> ',indent:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,10 C21,10,8,10,8,10"/><path style="" d="M21,6 C21,6,8,6,8,6"/><path style="" d="M21,14 C21,14,8,14,8,14"/><path style="" d="M21,18 C21,18,8,18,8,18"/><path style="" d="M2.5,9 C2.5,9,5.5,12,5.5,12 C5.5,12,2.5,15,2.5,15"/></g></svg> ',fontBold:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M13.5,11 C15.71,11,17.5,12.68,17.5,14.75 C17.5,16.82,15.71,18.5,13.5,18.5 C13.5,18.5,8.5,18.5,8.5,18.5 C8.5,18.5,8.5,3.5,8.5,3.5 C8.5,3.5,13.5,3.5,13.5,3.5 C15.71,3.5,17.5,5.18,17.5,7.25 C17.5,9.32,15.71,11,13.5,11 C13.5,11,13.5,11,13.5,11 z"/><path style="" d="M13.5,11 C13.5,11,8.5,11,8.5,11"/><path style="" d="M12.5,11 C14.71,11,16.5,12.68,16.5,14.75 C16.5,16.82,14.71,18.5,12.5,18.5 C12.5,18.5,7.5,18.5,7.5,18.5 C7.5,18.5,7.5,3.5,7.5,3.5 C7.5,3.5,12.5,3.5,12.5,3.5 C14.71,3.5,16.5,5.18,16.5,7.25 C16.5,9.32,14.71,11,12.5,11 C12.5,11,12.5,11,12.5,11 z"/><path style="" d="M12.5,11 C12.5,11,7.5,11,7.5,11"/></g></svg> ',fontItalic:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M17,4.5 C17,4.5,13,4.5,13,4.5"/><path style="" d="M11,19.5 C11,19.5,7,19.5,7,19.5"/><path style="" d="M15,4.5 C15,4.5,9,19.5,9,19.5"/></g></svg> ',fontUnderline:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M7.5,3.5 C7.5,3.5,7.5,10.74,7.5,13.5 C7.5,16.26,9.74,18.5,12.5,18.5 C15.26,18.5,17.5,16.26,17.5,13.5 C17.5,10.74,17.5,3.5,17.5,3.5"/><path style="" d="M7.5,21.5 C7.5,21.5,17.5,21.5,17.5,21.5"/></g></svg> ',outdent:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,10 C21,10,8,10,8,10"/><path style="" d="M21,6 C21,6,8,6,8,6"/><path style="" d="M21,14 C21,14,8,14,8,14"/><path style="" d="M21,18 C21,18,8,18,8,18"/><path style="" d="M5.5,9 C5.5,9,2.5,12,2.5,12 C2.5,12,5.5,15,5.5,15"/></g></svg> ',listNumber:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,6 C21,6,10,6,10,6"/><path style="" d="M21,12 C21,12,10,12,10,12"/><path style="" d="M21,18 C21,18,10,18,10,18"/><path style="" d="M4.5,5 C4.5,5,5.5,4,5.5,4 C5.5,4,5.5,8,5.5,8"/><path style="" d="M4.5,10 C4.5,10,5.5,10,5.5,10 C6.05,10,6.5,10.45,6.5,11 C6.5,11,6.5,11,6.5,11 C6.5,11.55,6.05,12,5.5,12 C5.5,12,5.5,12,5.5,12 C4.95,12,4.5,12.45,4.5,13 C4.5,13,4.5,14,4.5,14 C4.5,14,6.5,14,6.5,14"/><path style="" d="M4.5,16 C4.5,16,5.5,16,5.5,16 C6.05,16,6.5,16.45,6.5,17 C6.5,17,6.5,17,6.5,17 C6.5,17.55,6.05,18,5.5,18 C5.5,18,4.5,18,4.5,18 C4.5,18,5.5,18,5.5,18 C6.05,18,6.5,18.45,6.5,19 C6.5,19,6.5,19,6.5,19 C6.5,19.55,6.05,20,5.5,20 C5.5,20,4.5,20,4.5,20"/></g></svg> ',resize:'<svg class="stroked" version="1.1" viewBox="0, 0, 24, 24"><g><path d="M9,3 L3,3 L3,9"/><path d="M15,21 L21,21 L21,15"/><path d="M3,3 L10,10"/><path d="M21,21 L14,14"/></g></svg> ',bug:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M8,6 C8,3.79,9.79,2,12,2 C14.21,2,16,3.79,16,6 C16,6,8,6,8,6 z"/><path style="" d="M20,7 C20,7,18,9,18,9"/><path style="" d="M20,19 C20,19,18,17,18,17"/><path style="" d="M21,13 C21,13,18,13,18,13"/><path style="" d="M16.44,9 C17.3,9,18,9.7,18,10.56 C18,10.56,18,15,18,15 C18,18.31,15.31,21,12,21 C8.69,21,6,18.31,6,15 C6,15,6,10.56,6,10.56 C6,9.7,6.7,9,7.56,9 C7.56,9,16.44,9,16.44,9 z"/><path style="" d="M4,7 C4,7,6,9,6,9"/><path style="" d="M4,19 C4,19,6,17,6,17"/><path style="" d="M3,13 C3,13,6,13,6,13"/><path style="" d="M12,12 C12,12,12,17,12,17"/></g></svg> ',blog:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,10.02 C21,10.02,21,15,21,15 C21,15.53,20.79,16.04,20.41,16.41 C20.04,16.79,19.53,17,19,17 C19,17,7,17,7,17 C5.67,18.33,4.33,19.67,3,21 C3,21,3,5,3,5 C3,4.47,3.21,3.96,3.59,3.59 C3.96,3.21,4.47,3,5,3 C8.53,3,10.49,3,14.02,3"/><path style="" d="M19,2 C19.54,1.46,20.32,1.25,21.05,1.45 C21.78,1.65,22.35,2.22,22.55,2.95 C22.75,3.68,22.54,4.46,22,5 C22,5,15.5,11.5,15.5,11.5 C14.17,11.83,12.83,12.17,11.5,12.5 C11.83,11.17,12.17,9.83,12.5,8.5 C15.67,5.33,15.83,5.17,19,2 z"/><path style="" d="M14.6,3"/><path style="" d="M21,8.77"/><path style="" d="M7,7 C7,7,10,7,10,7"/><path style="" d="M7,10 C7,10,9,10,9,10"/></g></svg> ',sortAscending:'<svg class="stroked" viewBox="0 0 24 24"><g><path d="M16.5,10.5 C16.5,10.5,7.5,10.5,7.5,10.5"/><path d="M14.5,6.5 C14.5,6.5,9.5,6.5,9.5,6.5"/><path d="M18.5,14.5 C18.5,14.5,5.5,14.5,5.5,14.5"/><path d="M20.5,18.5 C20.5,18.5,3.5,18.5,3.5,18.5"/></g></svg> ',npm:'<svg class="filled" version="1" viewBox="0 0 512 512"><path d="M0 0v512h512v-512h-512zM416 416h-64v-256h-96v256h-160v-320h320v320z"></path></svg> ',game:'<svg class="filled" version="1" viewBox="0 0 704 512"><path d="M528 97v-1h-336c-88 0-160 72-160 160s72 160 160 160c52 0 99-25 128-64h64c29 39 76 64 128 64 88 0 160-72 160-160 0-83-63-151-144-159zM288 288h-64v64h-64v-64h-64v-64h64v-64h64v64h64v64zM480 288c-18 0-32-14-32-32s14-32 32-32 32 14 32 32-14 32-32 32zM576 288c-18 0-32-14-32-32 0-18 14-32 32-32s32 14 32 32c0 18-14 32-32 32z"></path></svg> ',google:'<svg class="filled" version="1" viewBox="0 0 512 512"><path d="M256 0c-141 0-256 115-256 256s115 256 256 256 256-115 256-256-115-256-256-256zM260 448c-106 0-192-86-192-192s86-192 192-192c52 0 95 19 129 50l-52 50c-14-14-39-30-77-30-66 0-119 54-119 121s54 121 119 121c76 0 105-55 109-83h-109v-66h181c2 10 3 19 3 32 0 110-73 188-184 188z"></path></svg> ',discord:'<svg class="filled" version="1" viewBox="0 0 1013 768"><path d="M858 64c-60-28-131-51-204-64l-5-1c-8 14-17 32-25 51l-1 4c-35-6-75-9-116-9s-81 3-120 9l4-1c-9-22-18-40-28-57l1 3c-79 14-149 36-214 67l5-2c-132 196-168 387-150 575v0c73 55 158 99 250 127l6 2c19-26 38-55 53-85l2-3c-33-13-62-27-89-43l2 1c7-5 14-11 21-16 75 36 163 57 256 57s181-21 260-59l-4 2c7 6 14 11 21 16-25 15-53 29-83 40l-4 1c17 34 36 63 56 90l-1-2c98-30 183-74 259-130l-2 2c21-218-36-407-151-575zM338 524c-50 0-91-45-91-101s40-102 91-102 92 46 91 102-40 101-91 101zM675 524c-50 0-91-45-91-101s40-102 91-102 92 46 91 102-40 101-91 101z"></path></svg> '};var P1=(n)=>{Object.assign(We,n)},Ge=(n,e,t,i)=>{n.setAttribute("xmlns","http://www.w3.org/2000/svg");for(let a of[...n.querySelectorAll("path, polygon, line, circle, rect, ellipse, polyline")]){if(e!==void 0)a.setAttribute("fill",e);if(t!==void 0)a.setAttribute("stroke",t);if(i!==void 0)a.setAttribute("stroke-width",String(i))}let o=n.querySelectorAll("[style]");n.removeAttribute("style");for(let a of[...o]){let{fill:r,stroke:l,strokeWidth:h,strokeLinecap:c,strokeLinejoin:p}=a.style;if(r)a.setAttribute("fill",v.fromCss(r).html);if(l)a.setAttribute("stroke",v.fromCss(l).html);if(h)a.setAttribute("strokeWidth",h);if(c)a.setAttribute("strokeLinecap",c);if(p)a.setAttribute("strokeLinejoin",p);a.removeAttribute("style")}return`url(data:image/svg+xml;charset=UTF-8,${encodeURIComponent(n.outerHTML)})`},m=new Proxy(We,{get(n,e){let t=We[e];if(e&&!t)console.warn(`icon ${e} does not exist`);if(!t)t=We.square;return(...i)=>{let o=x.div();o.innerHTML=t;let s=o.querySelector("svg"),a=new Set(s.classList);a.add("tosi-icon");let r=wt.svg({class:Array.from(a).join(" "),viewBox:s.getAttribute("viewBox")},...i,...s.children);if(r.style.strokeWidth=u.tosiIconStrokeWidth("2px"),a.has("filled"))r.style.stroke="none",r.style.fill="currentColor";else if(a.has("stroked"))r.style.stroke=u.tosiIconStroke("currentColor"),r.style.fill="none";else r.style.stroke=u.tosiIconStroke("currentColor"),r.style.fill=u.tosiIconFill("currentColor");return r.style.height=u.tosiIconSize("16px"),r}}});class io extends f{static preferredTagName="tosi-icon";static lightStyleSpec={":host":{"--tosi-icon-size":"var(--xin-icon-size, 16px)","--tosi-icon-stroke-width":"var(--xin-icon-stroke-width, var(--icon-stroke-width, 2px))","--tosi-icon-stroke-linejoin":"var(--icon-stroke-linejoin, round)","--tosi-icon-stroke-linecap":"var(--icon-stroke-linecap, round)","--tosi-icon-fill":"var(--xin-icon-fill, var(--icon-fill, none))",display:"inline-flex",stroke:"currentColor",strokeWidth:u.tosiIconStrokeWidth("2px"),strokeLinejoin:u.tosiIconStrokeLinejoin("round"),strokeLinecap:u.tosiIconStrokeLinecap("round"),fill:u.tosiIconFill("none")},":host, :host svg":{height:u.tosiIconSize("16px")}};static initAttributes={icon:"",size:0,fill:"",stroke:"",strokeWidth:1};render(){super.render(),this.textContent="";let n={};if(this.size)n.height=this.size+"px",this.style.setProperty("--tosi-icon-size",`${this.size}px`),this.style.setProperty("--xin-icon-size",`${this.size}px`);if(this.stroke)n.stroke=this.stroke,n.strokeWidth=this.strokeWidth;if(this.fill)n.fill=this.fill;this.append(m[this.icon]({style:n}))}}var I1=io.elementCreator();var ca=()=>{};class oo extends f{static preferredTagName="tosi-3d";babylonReady;BABYLON;static shadowStyleSpec={":host":{display:"block",position:"relative"},":host canvas":{width:"100%",height:"100%"},":host .babylonVRicon":{height:50,width:80,backgroundColor:"transparent",filter:"drop-shadow(0 0 4px #000c)",backgroundImage:Ge(m.xrColor()),backgroundPosition:"center",backgroundRepeat:"no-repeat",border:"none",borderRadius:5,borderStyle:"none",outline:"none",transition:"transform 0.125s ease-out"},":host .babylonVRicon:hover":{transform:"scale(1.1)"}};content=x.canvas({part:"canvas"});constructor(){super();this.babylonReady=(async()=>{let{BABYLON:n}=await hn("https://cdn.babylonjs.com/babylon.js","BABYLON");return n})()}scene;engine;sceneCreated=ca;update=ca;_update=()=>{if(this.scene){if(this.update!==void 0)this.update(this,this.BABYLON);if(this.scene.activeCamera!==void 0)this.scene.render()}};onResize(){if(this.engine)this.engine.resize()}loadScene=async(n,e,t)=>{let{BABYLON:i}=await hn("https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js","BABYLON");i.SceneLoader.Append(n,e,this.scene,t)};loadUI=async(n)=>{let{BABYLON:e}=await hn("https://cdn.babylonjs.com/gui/babylon.gui.min.js","BABYLON"),t=e.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI",!0,this.scene),{snippetId:i,jsonUrl:o,data:s,size:a}=n;if(a)t.idealWidth=a,t.renderAtIdealSize=!0;let r;if(i)r=await t.parseFromSnippetAsync(i);else if(o)r=await t.parseFromURLAsync(o);else if(s)r=t.parseContent(s);else return null;let l=t.getChildren()[0],h=l.children.reduce((c,p)=>{return c[p.name]=p,c},{});return{advancedTexture:t,gui:r,root:l,widgets:h}};connectedCallback(){super.connectedCallback();let{canvas:n}=this.parts;this.babylonReady.then(async(e)=>{if(this.BABYLON=e,this.engine=new e.Engine(n,!0),this.scene=new e.Scene(this.engine),this.sceneCreated)await this.sceneCreated(this,e);if(this.scene.activeCamera===void 0)new e.ArcRotateCamera("default-camera",-Math.PI/2,Math.PI/2.5,3,new e.Vector3(0,0,0)).attachControl(this.parts.canvas,!0);this.engine.runRenderLoop(this._update)})}}var T1=oo.elementCreator();class ye extends f{static preferredTagName="tosi-lottie";static initAttributes={src:"",json:""};content=null;config={renderer:"svg",loop:!0,autoplay:!0};static bodymovinAvailable;animation;static shadowStyleSpec={":host":{width:400,height:400,display:"inline-block"}};_loading=!1;get loading(){return this._loading}constructor(){super();if(ye.bodymovinAvailable===void 0)ye.bodymovinAvailable=hn("https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js","bodymovin")}doneLoading=()=>{this._loading=!1};load=({bodymovin:n})=>{if(this._loading=!0,this.config.container=this.shadowRoot!==null?this.shadowRoot:void 0,this.json!=="")this.config.animationData=this.json,delete this.config.path;else if(this.src!=="")delete this.config.animationData,this.config.path=this.src;else console.log("%c<tosi-lottie>%c expected either %cjson%c (animation data) or %csrc% c(url) but found neither.","color: #44f; background: #fff; padding: 0 5px","color: default","color: #44f; background: #fff; padding: 0 5px","color: default","color: #44f; background: #fff; padding: 0 5px","color: default");if(this.animation){this.animation.destroy();let e=this.shadowRoot;if(e!==null)e.querySelector("svg")?.remove()}this.animation=n.loadAnimation(this.config),this.animation.addEventListener("DOMLoaded",this.doneLoading)};render(){super.render(),ye.bodymovinAvailable.then(this.load).catch((n)=>{console.error(n)})}}var V1=ye.elementCreator();var{button:so,slot:q1,div:zt}=x;class Ot extends f{static preferredTagName="tosi-carousel";static initAttributes={dots:!1,arrows:!1,maxVisibleItems:1,snapDuration:0.25,snapDelay:0.1,loop:!1,auto:0};lastAutoAdvance=Date.now();interval;autoAdvance=()=>{if(this.auto>0&&this.auto*1000<Date.now()-this.lastAutoAdvance)this.forward()};_page=0;get page(){return this._page}set page(n){let{scroller:e,back:t,forward:i}=this.parts;if(this.lastPage<=0)i.disabled=t.disabled=!0,n=0;else n=Math.max(0,Math.min(this.lastPage,n)),n=isNaN(n)?0:n;if(this._page!==n)this._page=isNaN(n)?0:n,this.animateScroll(this._page*e.offsetWidth),t.disabled=this.page<=0&&!this.loop,i.disabled=this.page>=this.lastPage&&!this.loop}get visibleItems(){return[...this.children].filter((n)=>getComputedStyle(n).display!=="none")}get lastPage(){return Math.max(Math.ceil(this.visibleItems.length/(this.maxVisibleItems||1))-1,0)}static shadowStyleSpec={":host":{_carouselIconSize:24,_carouselButtonColor:"#0004",_carouselButtonHoverColor:"#0006",_carouselButtonActiveColor:"#000c",_carouseButtonWidth:48,_carouselDotCurrentColor:"#0008",_carouselDotSize:8,_carouselDotSpacing:d.carouselDotSize,_carouselProgressPadding:12,_carouselDotTransition:"0.125s ease-in-out",display:"flex",flexDirection:"column",position:"relative"},":host:focus":{outline:"none",boxShadow:"none"},":host svg":{height:d.carouselIconSize},":host button":{outline:"none",border:"none",boxShadow:"none",background:"transparent",color:d.carouselButtonColor,padding:0},":host::part(back), :host::part(forward)":{position:"absolute",top:0,bottom:0,width:d.carouseButtonWidth,zIndex:2},":host::part(back)":{left:0},":host::part(forward)":{right:0},":host button:disabled":{opacity:0.5,pointerEvents:"none"},":host button:hover":{color:d.carouselButtonHoverColor},":host button:active":{color:d.carouselButtonActiveColor},":host::part(pager)":{position:"relative"},":host::part(scroller)":{overflow:"auto hidden",position:"relative"},":host::part(grid)":{display:"grid",justifyItems:"center"},":host *::-webkit-scrollbar, *::-webkit-scrollbar-thumb":{display:"none"},":host .dot":{background:d.carouselButtonColor,borderRadius:d.carouselDotSize,height:d.carouselDotSize,width:d.carouselDotSize,transition:d.carouselDotTransition},":host .dot:not(.current):hover":{background:d.carouselButtonHoverColor,height:d.carouselDotSize150,width:d.carouselDotSize150,margin:d.carouselDotSize_25},":host .dot:not(.current):active":{background:d.carouselButtonActiveColor},":host .dot.current":{background:d.carouselDotCurrentColor},":host::part(progress)":{display:"flex",gap:d.carouselDotSpacing,justifyContent:"center",padding:d.carouselProgressPadding}};easing=(n)=>{return Math.sin(n*Math.PI*0.5)};indicateCurrent=()=>{let{scroller:n,progress:e}=this.parts,t=n.scrollLeft/n.offsetWidth;[...e.children].forEach((i,o)=>{i.classList.toggle("current",Math.floor(o/this.maxVisibleItems-t)===0)}),this.lastAutoAdvance=Date.now(),clearTimeout(this.snapTimer),this.snapTimer=setTimeout(this.snapPosition,this.snapDelay*1000)};snapPosition=()=>{let{scroller:n}=this.parts,e=Math.round(n.scrollLeft/n.offsetWidth);if(e!==this.page)this.page=e>this.page?Math.ceil(e):Math.floor(e);this.lastAutoAdvance=Date.now()};back=()=>{this.page=this.page>0?this.page-1:this.lastPage};forward=()=>{this.page=this.page<this.lastPage?this.page+1:0};handleDotClick=(n)=>{let{progress:e}=this.parts,t=[...e.children].indexOf(n.target);if(t>-1)this.page=Math.floor(t/this.maxVisibleItems)};snapTimer;animationFrame;animateScroll(n,e=-1,t=0){cancelAnimationFrame(this.animationFrame);let{scroller:i}=this.parts;if(e===-1){e=i.scrollLeft,t=Date.now(),this.animationFrame=requestAnimationFrame(()=>{this.animateScroll(n,e,t)});return}let o=(Date.now()-t)/1000;if(o>=this.snapDuration||Math.abs(i.scrollLeft-n)<2)i.scrollLeft=n,this.animationFrame=null;else i.scrollLeft=e+this.easing(o/this.snapDuration)*(n-e),this.animationFrame=requestAnimationFrame(()=>{this.animateScroll(n,e,t)})}content=()=>[zt({part:"pager"},so({title:"previous slide",part:"back"},m.chevronLeft()),zt({title:"slides",role:"group",part:"scroller"},zt({part:"grid"},q1())),so({title:"next slide",part:"forward"},m.chevronRight())),zt({title:"choose slide to display",role:"group",part:"progress"})];connectedCallback(){super.connectedCallback(),this.ariaRoleDescription="carousel",this.ariaOrientation="horizontal",this.ariaReadOnly="true";let{back:n,forward:e,scroller:t,progress:i}=this.parts;n.addEventListener("click",this.back),e.addEventListener("click",this.forward),t.addEventListener("scroll",this.indicateCurrent),i.addEventListener("click",this.handleDotClick),this.lastAutoAdvance=Date.now(),this.interval=setInterval(this.autoAdvance,100)}disconnectedCallback(){clearInterval(this.interval)}render(){super.render();let{dots:n,arrows:e,visibleItems:t,lastPage:i}=this,{progress:o,back:s,forward:a,grid:r}=this.parts;t.forEach((l)=>{l.role="group"}),r.style.gridTemplateColumns=`${100/this.maxVisibleItems/(1+this.lastPage)}% `.repeat(t.length).trim(),r.style.width=(1+this.lastPage)*100+"%",o.textContent="",o.append(...t.map((l,h)=>so({title:`item ${h+1}`,class:"dot"}))),this.indicateCurrent(),o.style.display=n&&i>0?"":"none",s.hidden=a.hidden=!(e&&i>0)}}var _1=Ot,pa=Ot.elementCreator(),D1=pa;var ua="https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.2/",ya="ace/theme/tomorrow",N1=async()=>{let{ace:n}=await hn(`${ua}ace.min.js`);return n},U1=async(n,e="html",t={},i=ya)=>{let o=await N1();o.config.set("basePath",ua);let s=o.edit(n,{mode:`ace/mode/${e}`,tabSize:2,useSoftTabs:!0,useWorker:!1,...t});return s.setTheme(i),{ace:o,editor:s}};class Ln extends f{static preferredTagName="tosi-code";source="";get value(){return this.editor===void 0?this.source:this.editor.getValue()}set value(n){if(this.editor===void 0)this.source=n;else this.editor.setValue(n),this.editor.clearSelection(),this.editor.session.getUndoManager().reset()}static initAttributes={mode:"javascript",theme:ya,disabled:!1};role="code editor";_ace;_editor;_editorPromise;options={};get ace(){return this._ace}get editor(){return this._editor}static shadowStyleSpec={":host":{display:"block",position:"relative",width:"100%",height:"100%"}};onResize(){if(this.editor!==void 0)this.editor.resize(!0)}connectedCallback(){if(super.connectedCallback(),this.source==="")this.value=this.textContent!==null?this.textContent.trim():"";if(this._editorPromise===void 0)this._editorPromise=U1(this,this.mode,this.options,this.theme),this._editorPromise.then(({ace:n,editor:e})=>{this._ace=n,this._editor=e,e.setValue(this.source,1),e.clearSelection(),e.session.getUndoManager().reset()})}render(){if(super.render(),this._editorPromise!==void 0)this._editorPromise.then(({editor:n})=>n.setReadOnly(this.disabled))}}var me=Ln.elementCreator();var{input:ao}=x,ma=v.fromCss("#8888");class ga extends f{static preferredTagName="tosi-color";value=ma.rgba;color=ma;static shadowStyleSpec={":host":{_gap:8,_swatchSize:32,_cssWidth:72,_alphaWidth:72,display:"inline-flex",gap:d.gap,alignItems:"center"},':host input[type="color"]':{border:0,width:d.swatchSize,height:d.swatchSize,background:"transparent"},":host::part(alpha)":{width:d.alphaWidth},":host::part(css)":{width:d.cssWidth,fontFamily:"monospace"}};content=[ao({title:"base color",type:"color",part:"rgb"}),ao({type:"range",title:"opacity",part:"alpha",min:0,max:1,step:0.05}),ao({title:"css color spec",part:"css"})];valueChanged=!1;update=(n)=>{let{rgb:e,alpha:t,css:i}=this.parts;if(n.type==="input")this.color=v.fromCss(e.value),this.color.a=Number(t.value),i.value=this.color.html;else this.color=v.fromCss(i.value),e.value=this.color.html.substring(0,7),t.value=String(this.color.a);e.style.opacity=String(this.color.a),this.value=this.color.rgba,this.valueChanged=!0};connectedCallback(){super.connectedCallback();let{rgb:n,alpha:e,css:t}=this.parts;n.addEventListener("input",this.update),e.addEventListener("input",this.update),t.addEventListener("change",this.update)}render(){if(this.valueChanged){this.valueChanged=!1;return}let{rgb:n,alpha:e,css:t}=this.parts;this.color=v.fromCss(this.value),n.value=this.color.html.substring(0,7),n.style.opacity=String(this.color.a),e.value=String(this.color.a),t.value=this.color.html}}var lo=ga.elementCreator();var Fn=x.div({style:{content:" ",position:"fixed",top:0,left:0,right:0,bottom:0}}),Pt={passive:!0},an=(n,e,t="move")=>{if(!n.type.startsWith("touch")){let{clientX:o,clientY:s}=n;Fn.style.cursor=t,Wn(Fn),document.body.append(Fn);let a=(r)=>{let l=r.clientX-o,h=r.clientY-s;if(e(l,h,r)===!0)Fn.removeEventListener("mousemove",a),Fn.removeEventListener("mouseup",a),Fn.remove()};Fn.addEventListener("mousemove",a,Pt),Fn.addEventListener("mouseup",a,Pt)}else if(n instanceof TouchEvent){let o=n.changedTouches[0],s=o.identifier,a=o.clientX,r=o.clientY,l=n.target,h=0,c=0,p=(y)=>{let w=[...y.touches].find((g)=>g.identifier===s);if(w!==void 0)h=w.clientX-a,c=w.clientY-r;if(y.type==="touchmove")y.stopPropagation(),y.preventDefault();if(e(h,c,y)===!0||w===void 0)l.removeEventListener("touchmove",p),l.removeEventListener("touchend",p),l.removeEventListener("touchcancel",p)};l.addEventListener("touchmove",p),l.addEventListener("touchend",p,Pt),l.addEventListener("touchcancel",p,Pt)}},En=(n="body *")=>[...document.querySelectorAll(n)].map((e)=>parseFloat(getComputedStyle(e).zIndex)).reduce((e,t)=>isNaN(e)||Number(e)<t?t:Number(e),0),Wn=(n,e="body *")=>{n.style.zIndex=String(En(e)+1)};var{slot:R1}=x;class _n extends f{static preferredTagName="tosi-float";static floats=new Set;static initAttributes={drag:!1,remainOnResize:"remove",remainOnScroll:"remain"};content=R1();static shadowStyleSpec={":host":{position:"fixed"}};reposition=(n)=>{if(n.target?.closest(".no-drag"))return;if(this.drag){Wn(this);let t=this.offsetLeft,i=this.offsetTop;an(n,(o,s,a)=>{if(this.style.left=`${t+o}px`,this.style.top=`${i+s}px`,this.style.right="auto",this.style.bottom="auto",a.type==="mouseup")return!0})}};connectedCallback(){super.connectedCallback(),_n.floats.add(this);let n={passive:!0};this.addEventListener("touchstart",this.reposition,n),this.addEventListener("mousedown",this.reposition,n),Wn(this)}disconnectedCallback(){super.disconnectedCallback(),_n.floats.delete(this)}}var X1=_n,Ye=_n.elementCreator(),F1=Ye;window.addEventListener("resize",()=>{Array.from(_n.floats).forEach((n)=>{if(n.remainOnResize==="hide")n.hidden=!0;else if(n.remainOnResize==="remove")n.remove()})},{passive:!0});document.addEventListener("scroll",(n)=>{if(n.target instanceof HTMLElement&&n.target.closest(_n.tagName))return;Array.from(_n.floats).forEach((e)=>{if(e.remainOnScroll==="hide")e.hidden=!0;else if(e.remainOnScroll==="remove")e.remove()})},{passive:!0,capture:!0});var ro=(n)=>{let{content:e,target:t,position:i,remainOnScroll:o,remainOnResize:s,draggable:a}=n,r=Array.isArray(e)?Ye(...e):Ye(e);if(xa(r,t,i,o,s,a),n.class)r.setAttribute("class",n.class);return document.body.append(r),r},xa=(n,e,t,i,o,s=!1)=>{{let{position:g}=getComputedStyle(n);if(g!=="fixed")n.style.position="fixed";if(o)n.remainOnResize=o;if(i)n.remainOnScroll=i;Wn(n)}n.drag=s;let{left:a,top:r,width:l,height:h}=e.getBoundingClientRect(),c=a+l*0.5,p=r+h*0.5,y=window.innerWidth,w=window.innerHeight;if(t==="side")t=(c<y*0.5?"e":"w")+(p<w*0.5?"s":"n");else if(t==="auto"||t===void 0)t=(p<w*0.5?"s":"n")+(c<y*0.5?"e":"w");if(n.style.top=n.style.left=n.style.right=n.style.bottom=n.style.transform="",t.length===2){let[g,k]=t;switch(g){case"n":n.style.bottom=(w-r).toFixed(2)+"px";break;case"e":n.style.left=(a+l).toFixed(2)+"px";break;case"s":n.style.top=(r+h).toFixed(2)+"px";break;case"w":n.style.right=(y-a).toFixed(2)+"px";break}switch(k){case"n":n.style.bottom=(w-r-h).toFixed(2)+"px";break;case"e":n.style.left=a.toFixed(2)+"px";break;case"s":n.style.top=r.toFixed(2)+"px";break;case"w":n.style.right=(y-a-l).toFixed(2)+"px";break}n.style.transform=""}else if(t==="n")n.style.bottom=(w-r).toFixed(2)+"px",n.style.left=c.toFixed(2)+"px",n.style.transform="translateX(-50%)";else if(t==="s")n.style.top=(r+h).toFixed(2)+"px",n.style.left=c.toFixed(2)+"px",n.style.transform="translateX(-50%)";else if(t==="e")n.style.left=(a+l).toFixed(2)+"px",n.style.top=p.toFixed(2)+"px",n.style.transform="translateY(-50%)";else if(t==="w")n.style.right=(y-a).toFixed(2)+"px",n.style.top=p.toFixed(2)+"px",n.style.transform="translateY(-50%)";n.style.setProperty("--max-height",`calc(100vh - ${n.style.top||n.style.bottom})`),n.style.setProperty("--max-width",`calc(100vw - ${n.style.left||n.style.right})`)};function It(n,e=!0){return(t,i)=>{let o=n(t),s=n(i);for(let a in o)if(o[a]!==s[a])return(Array.isArray(e)?e[a]!==!1:e)?o[a]>s[a]?1:-1:o[a]>s[a]?-1:1;return 0}}var{button:W1,span:ba,input:G1}=x,fa=(n,e)=>{return!!n.find((t)=>{if(t===null||e==null)return!1;else if(Array.isArray(t))return fa(t,e);else if(t.value===e||t===e)return!0})};class Sn extends f{static preferredTagName="tosi-select";static formAssociated=!0;static lightStyleSpec={":host":{"--tosi-select-gap":"var(--tosi-spacing-sm, 8px)","--tosi-select-touch-size":"var(--tosi-touch-size, 44px)","--tosi-select-padding":"0 var(--tosi-spacing-sm, 8px)","--tosi-select-value-padding":"0 var(--tosi-spacing-sm, 8px)","--tosi-select-icon-width":"24px","--tosi-select-field-width":"140px","--gap":"var(--tosi-select-gap)","--touch-size":"var(--tosi-select-touch-size)","--padding":"var(--tosi-select-padding)","--value-padding":"var(--tosi-select-value-padding)","--icon-width":"var(--tosi-select-icon-width)","--fieldWidth":"var(--tosi-select-field-width)",display:"inline-flex",position:"relative"},":host button":{display:"flex",alignItems:"center",justifyItems:"center",gap:d.tosiSelectGap,textAlign:"left",height:d.tosiSelectTouchSize,padding:d.tosiSelectPadding,position:"relative",width:"100%"},":host:not([show-icon]) button > :first-child":{display:"none"},":host[hide-caption] button > :nth-child(2)":{display:"none"},':host [part="value"]':{width:d.tosiSelectFieldWidth,padding:d.tosiSelectValuePadding,height:d.tosiSelectTouchSize,lineHeight:d.tosiSelectTouchSize,boxShadow:"none",whiteSpace:"nowrap",outline:"none",background:"transparent",flex:"1"},':host [part="value"]:not(:focus)':{overflow:"hidden",textOverflow:"ellipsis",background:"transparent"}};static initAttributes={editable:!1,placeholder:"",showIcon:!1,hideCaption:!1,localized:!1,disabled:!1,required:!1,name:""};_options=[];get options(){return this._options}set options(n){if(typeof n==="string")this._options=Sn.parseOptionsString(n);else this._options=n;this.queueRender()}static parseOptionsString(n){return n.split(",").map((e)=>{let t=e.trim();if(t==="")return null;let[i,o]=t.split("=").map((r)=>r.trim());if(!o)return{value:i,caption:i};let[s,a]=o.split(":").map((r)=>r.trim());return{value:i,caption:s||i,icon:a||void 0}})}value="";filter="";isExpanded=!1;formDisabledCallback(n){this.disabled=n}formResetCallback(){this.value=""}setValue=(n,e=!1)=>{if(this.value!==n)this.value=n,this.queueRender(!0);if(e)this.dispatchEvent(new Event("action"))};getValue=()=>this.value;get selectOptions(){return this.options}buildOptionMenuItem=(n)=>{if(n===null)return null;let{setValue:e,getValue:t}=this,i,o,s;if(typeof n==="string")o=s=n;else({icon:i,caption:o,value:s}=n);if(this.localized)o=U(o);let{options:a}=n;if(a)return{icon:i,caption:o,checked:()=>fa(a,t()),menuItems:a.map(this.buildOptionMenuItem)};return{icon:i,caption:o,checked:()=>t()===s,action:typeof s==="function"?async()=>{let r=await s();if(r!==void 0)e(r,!0)}:()=>{if(typeof s==="string")e(s,!0)}}};poppedOptions=[];get optionsMenu(){let n=this.selectOptions.map(this.buildOptionMenuItem);if(this.filter==="")return n;let e=(t)=>{if(t===null)return!0;else if(t.menuItems){let i=pn(t.menuItems);return t.menuItems=i.filter(e),i.length>0}else return t.caption.toLocaleLowerCase().includes(this.filter)};return n.filter(e)}handleChange=(n)=>{let{value:e}=this.parts,t=e.value||"";if(this.value!==String(t))this.value=t,this.dispatchEvent(new Event("change"));this.filter="",n.stopPropagation(),n.preventDefault()};handleKey=(n)=>{if(n.key==="Enter")n.preventDefault()};filterMenu=he(()=>{this.filter=this.parts.value.value.toLocaleLowerCase(),Z(0),this.popOptions()});popOptions=(n)=>{if(n&&n.type==="click")this.filter="";this.poppedOptions=this.optionsMenu,this.isExpanded=!0,this.updateAriaExpanded(),X({target:this,menuItems:this.poppedOptions,showChecked:!0,role:"listbox",onClose:()=>{this.isExpanded=!1,this.updateAriaExpanded()}})};updateAriaExpanded(){let{value:n}=this.parts;n.setAttribute("aria-expanded",String(this.isExpanded))}content=()=>[W1({type:"button",part:"button",onClick:this.popOptions},ba(),G1({part:"value",value:this.value,tabindex:0,role:"combobox",ariaHaspopup:"listbox",ariaExpanded:"false",ariaAutocomplete:this.editable?"list":"none",onKeydown:this.handleKey,onInput:this.filterMenu,onChange:this.handleChange}),m.chevronDown())];get allOptions(){let n=[];function e(t){for(let i of t)if(typeof i==="string")n.push({caption:i,value:i});else if(i?.value)n.push(i);else if(i?.options)e(i.options)}return e(this.selectOptions),n}findOption(){return this.allOptions.find((e)=>e.value===this.value)||{caption:this.value,value:this.value}}localeChanged=()=>{this.queueRender()};connectedCallback(){super.connectedCallback();let n=this.getAttribute("options");if(n&&this._options.length===0)this._options=Sn.parseOptionsString(n);if(this.localized)Tt.allInstances.add(this)}disconnectedCallback(){if(super.disconnectedCallback(),this.localized)Tt.allInstances.delete(this)}render(){super.render();let{value:n,button:e}=this.parts;e.disabled=this.disabled;let t=n.previousElementSibling,i=this.findOption(),o=ba();if(n.value=this.localized?U(i.caption):i.caption,i.icon)if(i.icon instanceof HTMLElement)o=i.icon.cloneNode(!0);else o=m[i.icon]();t.replaceWith(o),n.setAttribute("placeholder",this.localized?U(this.placeholder):this.placeholder),n.style.pointerEvents=this.editable?"":"none",n.readOnly=!this.editable}}var Y1=Sn,cn=Sn.elementCreator(),K1=en((...n)=>cn(...n),"xinSelect is deprecated, use tosiSelect instead (tag is now <tosi-select>)");var{span:wa}=x,{i18n:F}=H({i18n:{locale:window.navigator.language,locales:[window.navigator.language],languages:[window.navigator.language],emoji:[""],stringMap:{},localeOptions:[{icon:wa(),caption:window.navigator.language,value:window.navigator.language}]}});sn.localeOptions={toDOM(n,e){if(n instanceof Sn)n.options=e}};var Q1=(n)=>{if(F.locales.value.includes(n))F.locale.value=n;else console.error(`language ${n} is not available`)},ho=()=>{let n=Array.from(An.allInstances);for(let e of n)e.localeChanged()};F.locale.observe(ho);var $1=It((n)=>[n.caption.toLocaleLowerCase()]);function H1(n){let[e,,t,i,...o]=n.split(`
`).map((s)=>s.split("\t"));if(e&&t&&i&&o){if(F.locales.value=e,F.languages.value=t,F.emoji.value=i,F.stringMap.value=o.reduce((s,a)=>{return s[a[0].toLocaleLowerCase()]=a,s},{}),F.localeOptions.value=e.map((s,a)=>({icon:wa({title:e[a]},i[a]),caption:t[a],value:s})).sort($1),!F.locales.value.includes(F.locale.value)){let s=F.locale.value.substring(0,2);F.locale.value=F.locales.value.find((a)=>a.substring(0,2)===s)||F.locales.value[0]}ho()}}function U(n){if(n.endsWith("…"))return U(n.substring(0,n.length-1))+"…";let e=F.locales.value.indexOf(F.locale.value);if(e>-1){let t=D(F.stringMap),i=n.toLocaleLowerCase(),o=t[i],s=o&&o[e];if((!s||s==='"')&&i.includes("#")){let a=t[i.substring(0,i.indexOf("#"))];s=a&&a[e]}if(s)s=s.split("#",2)[0],n=n.toLocaleLowerCase()===n?s.toLocaleLowerCase():s;else n=n.split("#",2)[0]}else n=n.split("#",2)[0];return n}class Vt extends f{static preferredTagName="tosi-locale-picker";static initAttributes={hideCaption:!1};content=()=>{return cn({part:"select",showIcon:!0,title:U("Language"),bindValue:F.locale,bindLocaleOptions:F.localeOptions})};render(){super.render(),this.parts.select.toggleAttribute("hide-caption",this.hideCaption)}}var Z1=Vt,va=Vt.elementCreator(),M1=va;class An extends f{static preferredTagName="tosi-localized";static lightStyleSpec={":host":{pointerEvents:"none"}};static allInstances=new Set;static initAttributes={refString:""};contents=()=>x.xinSlot();connectedCallback(){super.connectedCallback(),An.allInstances.add(this)}disconnectedCallback(){super.disconnectedCallback(),An.allInstances.delete(this)}localeChanged(){if(!this.refString)this.refString=this.textContent||"";this.textContent=this.refString?U(this.refString):""}render(){super.render(),this.localeChanged()}}var Tt=An,zn=An.elementCreator(),J1=zn;var ka=typeof navigator<"u"&&/Mac|iPhone|iPad|iPod/.test(navigator.platform||""),L1=ka?{meta:"⌘",ctrl:"⌃",alt:"⌥",shift:"⇧",escape:"⎋"}:{meta:"Meta",ctrl:"Ctrl",alt:"Alt",shift:"Shift",escape:"Esc"},Ca=(n)=>{if(n.code)return n.code.replace(/^Key|^Digit/,"");return n.key},E1=(n)=>{let e=[];if(n.altKey)e.push("alt");if(n.ctrlKey)e.push("ctrl");if(n.metaKey)e.push("meta");if(n.shiftKey)e.push("shift");return e.push(Ca(n)),e.join("-")},n2=[[/\^|ctrl-?/i,"ctrlKey"],[/⌘|meta-?/i,"metaKey"],[/⌥|⎇|alt-?|option-?/i,"altKey"],[/⇧|shift-?/i,"shiftKey"]],qt=(n)=>{let e=n.trim(),t={ctrlKey:!1,metaKey:!1,altKey:!1,shiftKey:!1,key:""};for(let[i,o]of n2)if(i.test(e))t[o]=!0,e=e.replace(i,"");return e=e.replace(/^-+/,""),t.key=e.toLowerCase(),t},co=(n,e)=>{let t=qt(e);return n.key.toLowerCase()===t.key&&n.metaKey===t.metaKey&&n.ctrlKey===t.ctrlKey&&n.altKey===t.altKey&&n.shiftKey===t.shiftKey},e2=(n)=>{let e=qt(n),t=[];if(e.altKey)t.push("alt");if(e.ctrlKey)t.push("ctrl");if(e.metaKey)t.push("meta");if(e.shiftKey)t.push("shift");return t.push(e.key),t.join("-")},_t=(n)=>{let e=qt(n);if(ka){let i=[];if(e.ctrlKey)i.push("⌃");if(e.altKey)i.push("⌥");if(e.shiftKey)i.push("⇧");if(e.metaKey)i.push("⌘");return i.push(e.key.toUpperCase()),i.join("")}let t=[];if(e.ctrlKey)t.push("Ctrl");if(e.altKey)t.push("Alt");if(e.shiftKey)t.push("Shift");if(e.metaKey)t.push("Meta");return t.push(e.key.toUpperCase()),t.join("+")};var Nt={};bi(Nt,{stringToTypes:()=>xe,isTypeAllowed:()=>be,init:()=>yo,draggedElement:()=>a2});var t2=()=>!!document.querySelector(".drag-source"),be=(n,e)=>{if(!n)return!1;for(let t of n)if(t==="special/any")return!0;else if(t.indexOf("*")>-1){let[i,o]=t.split("/"),[s,a]=e.split("/");if((i==="*"||i===s)&&(o==="*"||o===a))return!0}else if(t===e)return!0},Dt=(n)=>{for(let e of[...document.querySelectorAll(`.${n}`)])e.classList.remove(n)},Sa=()=>{if(ge)ge.disconnect(),ge=null;po=[],Dt("drag-over"),Dt("drag-source"),Dt("drag-target")},xe=(n,e=";")=>{return(n||"").split(e).map((t)=>t.trim()).filter((t)=>t!=="")},po=[],ge=null,uo=(n)=>{if(!n)n=[];po=n;let e=[...document.querySelectorAll("[data-drop]")];for(let t of e){let i=xe(t.dataset.drop);if(n.find((o)=>be(i,o)))t.classList.add("drag-target");else t.classList.remove("drag-target")}if(!ge)ge=new MutationObserver(()=>uo(po)),ge.observe(document.body,{childList:!0,subtree:!0})};function i2(n){let e=n.target?.closest('[draggable="true"],a[href]');if(!e)return;e.classList.add("drag-source");let t=e.matches('[draggable="true"]')?xe(e.dataset.drag||"text/html"):xe(e.dataset.drag||"url");for(let i of t){let o=e.dataset.dragContent||(i==="text/html"?e.innerHTML:e.textContent);n.dataTransfer?.setData(i,o||"")}uo(n.dataTransfer?.types),n.stopPropagation()}function ja(n){if(!t2())uo(n.dataTransfer?.types);let e=n.target.closest(".drag-target");if(e&&n.dataTransfer)e.classList.add("drag-over"),n.dataTransfer.dropEffect="copy";else n.preventDefault(),n.stopPropagation()}function o2(){Dt("drag-over")}function s2(n){let e=n.target.closest(".drag-target");if(e){let t=(e.dataset?.drop||"").split(";");for(let i of t)if(be(n.dataTransfer?.types,i))if(i==="text/html")e.innerHTML=n.dataTransfer?.getData(i)||"";else e.textContent=n.dataTransfer?.getData(i)||""}Sa()}var a2=()=>document.querySelector(".drag-source"),Ba=!1,yo=()=>{if(Ba)return;document.body.addEventListener("dragstart",i2),document.body.addEventListener("dragenter",ja),document.body.addEventListener("dragover",ja),document.body.addEventListener("drop",s2),document.body.addEventListener("dragleave",o2),document.body.addEventListener("dragend",Sa),window.addEventListener("dragover",(n)=>n.preventDefault()),window.addEventListener("drop",(n)=>n.preventDefault()),Ba=!0};var pn=(n)=>typeof n==="function"?n():n,{div:Aa,button:$e,span:W,a:l2,xinSlot:r2}=x,za=(n)=>{let e=[];for(let t of n)if(t===null){if(e.length>0&&e[e.length-1]!==null)e.push(t)}else e.push(t);while(e.length>0&&e[e.length-1]===null)e.pop();return e},Qe=(n,e,t=!1)=>{let i=[];for(let o of n){if(o===null){i.push(o);continue}let{acceptsDrop:s}=o;if(!s){if(!t)i.push({...o,enabled:()=>!1});continue}if(!e.some((l)=>be(s,l))){if(!t)i.push({...o,enabled:()=>!1});continue}let r=o;if(r.menuItems){let l=Qe(pn(r.menuItems),e,!0);if(l.length>0||r.dropAction){let h=t?l:Qe(pn(r.menuItems),e,!1);i.push({...r,menuItems:h})}else if(!t)i.push({...r,enabled:()=>!1})}else i.push(o)}return za(i)},mo=(n,e=!1)=>{let t=[];for(let i of n){if(i===null){t.push(i);continue}let{action:o,menuItems:s}=i;if(o||s)if(s){let a=mo(pn(s),!0);if(a.length>0){let r=e?a:mo(pn(s),!1);t.push({...i,menuItems:r})}else if(!e)t.push({...i,enabled:()=>!1})}else t.push(i);else if(!e)t.push({...i,enabled:()=>!1})}return za(t)};Bn("xin-menu-helper",{".xin-menu":{overflow:"hidden auto",maxHeight:`calc(${d.maxHeight} - ${u.menuInset("8px")})`,borderRadius:d.spacing50,background:u.menuBg("#fafafa"),boxShadow:u.menuShadow(`${d.spacing13} ${d.spacing50} ${d.spacing} #0004`)},".xin-menu > div":{width:u.menuWidth("auto")},".xin-menu-trigger":{paddingLeft:0,paddingRight:0,minWidth:u.touchSize("48px")},".xin-menu-separator":{display:"inline-block",content:" ",height:"1px",width:"100%",background:u.menuSeparatorColor("#2224"),margin:u.menuSeparatorMargin("8px 0")},".xin-menu-item":{boxShadow:"none",border:"none !important",display:"grid",alignItems:"center",justifyContent:"flex-start",textDecoration:"none",gridTemplateColumns:"0px 1fr 30px",width:"100%",gap:0,background:"transparent",padding:u.menuItemPadding("0 16px"),height:u.menuItemHeight("48px"),lineHeight:u.menuItemHeight("48px"),textAlign:"left"},".xin-menu-item, .xin-menu-item > span":{color:u.menuItemColor("#222")},".xin-menu-with-icons .xin-menu-item":{gridTemplateColumns:"30px 1fr 30px"},".xin-menu-item svg":{stroke:u.menuItemIconColor("#222")},".xin-menu-item.xin-menu-item-checked":{background:u.menuItemHoverBg("#eee")},".xin-menu-item > span:nth-child(2)":{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textAlign:"left"},".xin-menu-item:hover":{boxShadow:"none !important",background:u.menuItemHoverBg("#eee")},".xin-menu-item.drag-target:hover":{boxShadow:`inset 0 0 0 2px color-mix(in srgb, ${u.menuDropOverBg("#2196F3")} 50%, transparent) !important`},".xin-menu-item:active":{boxShadow:"none !important",background:u.menuItemActiveBg("#aaa"),color:u.menuItemActiveColor("#000")},".xin-menu-item:active svg":{stroke:u.menuItemIconActiveColor("#000")},".xin-menu-item-highlight":{boxShadow:"none !important",background:u.menuItemActiveBg("#aaa"),color:u.menuItemActiveColor("#000")},".xin-menu-item-highlight svg":{stroke:u.menuItemIconActiveColor("#000")},".xin-drop-over":{background:`${u.menuDropOverBg("#2196F3")} !important`,color:`${u.menuDropOverColor("#fff")} !important`},".xin-drop-over > span":{color:`${u.menuDropOverColor("#fff")} !important`},".xin-drop-over svg":{stroke:`${u.menuDropOverColor("#fff")} !important`},".drag-target":{boxShadow:`inset 0 0 0 2px color-mix(in srgb, ${u.menuDropOverBg("#2196F3")} 50%, transparent) !important`}});var Oa=(n,e)=>{let t=n.checked&&n.checked()&&"check"||!1,i=n?.icon||t||W(" ");if(typeof i==="string")i=m[i]();let o=e.role==="listbox"?"option":"menuitem",s;if(typeof n?.action==="string")s=l2({class:"xin-menu-item",role:o,href:n.action},i,e.localized?W(U(n.caption)):W(n.caption),W(n.shortcut?_t(n.shortcut):" "));else s=$e({class:"xin-menu-item",role:o,onClick:n.action},i,e.localized?W(U(n.caption)):W(n.caption),W(n.shortcut?_t(n.shortcut):" "));if(s.classList.toggle("xin-menu-item-checked",t!==!1),e.role==="listbox"&&t)s.setAttribute("aria-selected","true");if(n?.enabled&&!n.enabled())s.setAttribute("disabled",""),s.setAttribute("aria-disabled","true");return s},Pa=(n,e)=>{let t=n?.icon||W(" ");if(typeof t==="string")t=m[t]();let i=$e({class:"xin-menu-item",onDragenter(o){we(),i.classList.add("xin-drop-over"),o.preventDefault()},onDragover(o){if(o.preventDefault(),o.dataTransfer)o.dataTransfer.dropEffect="copy"},onDragleave(o){let s=o.relatedTarget;if(s&&i.contains(s))return;i.classList.remove("xin-drop-over")},onDrop(o){if(o.preventDefault(),o.stopPropagation(),i.classList.remove("xin-drop-over"),n.dropAction&&o.dataTransfer)n.dropAction(o.dataTransfer);Z(0)}},t,e.localized?W(U(n.caption)):W(n.caption),W(" "));if(n.dropAction&&n.acceptsDrop)i.dataset.drop=n.acceptsDrop.join(";");if(n?.enabled&&!n.enabled())i.setAttribute("disabled",""),i.setAttribute("aria-disabled","true");return i},go=(n,e)=>{let t=n.checked&&n.checked()&&"check"||!1,i=n?.icon||t||W(" ");if(typeof i==="string")i=m[i]();let o=null,s=!1,a=$e({class:"xin-menu-item",disabled:!(!n.enabled||n.enabled()),onClick(r){if(e._dropMode)return;X(Object.assign({},e,{menuItems:pn(n.menuItems),target:a,submenuDepth:(e.submenuDepth||0)+1,position:"side"})),r.stopPropagation(),r.preventDefault()},onDragenter(r){if(!e._dropMode)return;we(),r.preventDefault(),r.stopPropagation();let l=r.relatedTarget;if(l&&a.contains(l))return;if(a.classList.add("xin-drop-over"),s){if(Z((e.submenuDepth||0)+1),s=!1,o)clearTimeout(o);o=null;return}if(o)clearTimeout(o);o=setTimeout(()=>{s=!0;let h=pn(n.menuItems),c=e._dataTypes?Qe(h,e._dataTypes,e.hideDisabled):h;if(c.length>0)X(Object.assign({},e,{menuItems:c,target:a,submenuDepth:(e.submenuDepth||0)+1,position:"side",_dropMode:!0,_dataTypes:e._dataTypes}))},e.disclosureDelay??200)},onDragover(r){if(!e._dropMode)return;if(r.preventDefault(),r.stopPropagation(),r.dataTransfer)r.dataTransfer.dropEffect=n.dropAction?"copy":"link"},onDragleave(r){if(!e._dropMode)return;let l=r.relatedTarget;if(l&&a.contains(l))return;if(s&&l&&M.some((h)=>h.menu.contains(l)||h.target.contains(l)))return;if(a.classList.remove("xin-drop-over"),o)clearTimeout(o),o=null},onDrop(r){if(!e._dropMode||!n.dropAction)return;if(r.preventDefault(),r.stopPropagation(),a.classList.remove("xin-drop-over"),r.dataTransfer)n.dropAction(r.dataTransfer);Z(0)}},i,e.localized?W(U(n.caption)):W(n.caption),m.chevronRight({style:{justifySelf:"flex-end"}}));if(e._dropMode&&n.dropAction&&n.acceptsDrop)a.dataset.drop=n.acceptsDrop.join(";");return a},Ia=(n,e)=>{if(n===null)return W({class:"xin-menu-separator"});else if(e._dropMode){let t=n;if(t.menuItems&&pn(t.menuItems).length>0)return go(t,e);else if(n.dropAction)return Pa(n,e);else{let o=n?.icon||W(" ");if(typeof o==="string")o=m[o]();return $e({class:"xin-menu-item",disabled:!0},o,e.localized?W(U(n.caption)):W(n.caption),W(" "))}}else{let t=n?.action?Oa(n,e):go(n,e);if(e.showChecked&&n.checked&&n.checked())requestAnimationFrame(()=>{t.scrollIntoView({block:"center"})});return t}},Ta=(n)=>{let{target:e,width:t,menuItems:i,role:o="menu"}=n,s=i.find((l)=>l?.icon||l?.checked),a=n.submenuDepth||0,r=Aa({class:s?"xin-menu xin-menu-with-icons":"xin-menu",role:o,onClick(){if(!n._dropMode)Z(0)},onDragover(l){if(!n._dropMode)return;l.preventDefault()},onDragenter(){if(!n._dropMode)return;we()},onDragleave(l){if(!n._dropMode)return;let h=l.relatedTarget;if(h&&r.contains(h))return;if(h&&M.some((c)=>c.menu.contains(h)||c.target.contains(h)))return;Va(a)}},Aa({style:{minWidth:e.offsetWidth+"px",width:typeof t==="number"?`${t}px`:t},onMousedown(l){l.preventDefault(),l.stopPropagation()}},...i.map((l)=>Ia(l,n))));return r},fe,M=[],Ke=null,we=()=>{if(Ke)clearTimeout(Ke),Ke=null},Va=(n)=>{we(),Ke=setTimeout(()=>{Ke=null,Z(n)},500)},Z=(n=0)=>{if(we(),n===0)document.querySelectorAll("tosi-menu.xin-drop-over").forEach((t)=>t.classList.remove("xin-drop-over"));let e=M.splice(n);for(let t of e)if(t.menu.remove(),t.onClose)t.onClose();return fe=e[0],n>0?M[n-1]:void 0};document.addEventListener("mousedown",(n)=>{if(M.length===0)return;let e=n.composedPath();if(!M.find((t)=>e.includes(t.target)||e.includes(t.menu)))Z(0)});document.body.addEventListener("keydown",(n)=>{if(n.key==="Escape")Z(0)});var X=(n)=>{n=Object.assign({submenuDepth:0},n);let{target:e,position:t,submenuDepth:i}=n;if(fe&&!document.body.contains(fe?.menu))fe=void 0;if(M.length&&!document.body.contains(M[0].menu))M.splice(0);if(n._dropMode){if(M.length>i&&M[i]?.target===e)return;Z(i)}else{if(i===0&&fe?.target===e)return;let a=Z(i);if(fe?.target===e)return;if(a&&a.target===e){Z();return}}if(!n.menuItems?.length)return;let o=Ta(n),s=ro({content:o,target:e,position:t});s.remainOnScroll=n._dropMode?"remain":"remove",M.push({target:e,menu:s,onClose:n.onClose})},qa=(n)=>{let{dataTypes:e,...t}=n,i=Qe(n.menuItems,e,n.hideDisabled);if(!i.length)return;X({...t,menuItems:i,_dropMode:!0,_dataTypes:e})};function xo(n,e,t=[]){for(let i of n){if(!i)continue;let{shortcut:o}=i,{menuItems:s}=i;if(o){if(co(e,o)){let a=i;if(a.enabled&&!a.enabled())return;if(t.some((r)=>r.enabled&&!r.enabled()))return;return{action:a,path:t}}}else if(s){let a=xo(pn(s),e,[...t,i]);if(a)return a}}return}class Ut extends f{static preferredTagName="tosi-menu";static lightStyleSpec={":host":{display:"inline-block"},":host button > xin-slot":{display:"flex",alignItems:"center",gap:u.tosiMenuTriggerGap("10px")}};static initAttributes={menuWidth:"auto",localized:!1,icon:"",acceptsDrop:"",disclosureDelay:0,hideDisabled:!1};menuItems=[];dropAction=null;_dragMatches=!1;_matchesDrag(n){if(!this.acceptsDrop)return!1;let e=xe(this.acceptsDrop);return[...n.dataTransfer?.types||[]].some((i)=>e.some((o)=>be([o],i)))}showMenu=(n)=>{if(n.type==="click"||n.code==="Space")X({target:this.parts.trigger,width:this.menuWidth,localized:this.localized,menuItems:this.menuItems}),n.stopPropagation(),n.preventDefault()};handleDragEnter=(n)=>{if(this._dragMatches=this._matchesDrag(n),!this._dragMatches)return;we(),this.classList.add("xin-drop-over");let e=[...n.dataTransfer?.types||[]];if(this.menuItems.length)qa({target:this.parts.trigger,menuItems:this.menuItems,dataTypes:e,width:this.menuWidth,localized:this.localized,disclosureDelay:this.disclosureDelay||void 0,hideDisabled:this.hideDisabled});n.preventDefault()};handleDragOver=(n)=>{if(!this._dragMatches)return;if(n.preventDefault(),n.dataTransfer)n.dataTransfer.dropEffect=this.dropAction?"copy":"link"};handleDragLeave=(n)=>{if(!this._dragMatches)return;let e=n.relatedTarget;if(e&&this.contains(e))return;if(e&&M.some((t)=>t.menu.contains(e)||t.target.contains(e))){this.classList.remove("xin-drop-over");return}this.classList.remove("xin-drop-over"),Va(0)};handleDrop=(n)=>{if(!this._dragMatches||!this.dropAction)return;if(n.preventDefault(),n.stopPropagation(),this.classList.remove("xin-drop-over"),n.dataTransfer)this.dropAction(n.dataTransfer);Z(0)};content=()=>$e({tabindex:0,part:"trigger",onClick:this.showMenu},r2());handleShortcut=async(n)=>{let e=xo(this.menuItems,n);if(!e)return;n.preventDefault(),n.stopImmediatePropagation();let{action:t,path:i}=e;if(this.isConnected&&document.body.contains(this))await this.animateShortcut(i,t);if(t.action instanceof Function)t.action()};findMenuItemByCaption(n,e){for(let t of n.querySelectorAll(".xin-menu-item")){let i=t.children[1];if(i&&i.textContent===e)return t}return null}async animateShortcut(n,e){Z(0),X({target:this.parts.trigger,width:this.menuWidth,localized:this.localized,menuItems:this.menuItems}),await new Promise((i)=>setTimeout(i,80));for(let i=0;i<n.length;i++){let o=i+1,s=M[i]?.menu;if(!s)break;let a=this.findMenuItemByCaption(s,n[i].caption);if(!a)break;X({target:a,width:this.menuWidth,localized:this.localized,menuItems:pn(n[i].menuItems),submenuDepth:o,position:"side"}),await new Promise((r)=>setTimeout(r,80))}let t=M[M.length-1]?.menu;if(t){let i=this.findMenuItemByCaption(t,e.caption);if(i)i.classList.add("xin-menu-item-highlight")}await new Promise((i)=>setTimeout(i,300)),Z(0)}constructor(){super();this.addEventListener("keydown",this.showMenu),this.addEventListener("dragenter",this.handleDragEnter),this.addEventListener("dragover",this.handleDragOver),this.addEventListener("dragleave",this.handleDragLeave),this.addEventListener("drop",this.handleDrop)}connectedCallback(){if(super.connectedCallback(),document.addEventListener("keydown",this.handleShortcut,!0),this.acceptsDrop)this.dataset.drop=this.acceptsDrop}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.handleShortcut)}}var _a=Ut.elementCreator(),d2=_a,h2=Ut;function c2(n,e,t){let i=n.find((o)=>o[e]!==void 0&&o[e]!==null);if(i!==void 0){let o=i[e];switch(typeof o){case"string":if(o.match(/^\d+(\.\d+)?$/))return 6*t;else if(o.includes(" "))return 20*t;else return 12*t;case"number":return 6*t;case"boolean":return 5*t;case"object":return!1;default:return 8*t}}return!1}var{div:ve,span:bo,button:p2,template:u2}=x,Da=(n)=>n;class Rt extends f{static preferredTagName="tosi-table";static lightStyleSpec={":host":{"--tosi-table-row-height":"32px","--tosi-table-touch-size":"var(--tosi-touch-size, 44px)","--tosi-table-dragged-header-bg":"#0004","--tosi-table-dragged-header-color":"#fff","--tosi-table-drop-header-bg":"#fff4","--row-height":"var(--tosi-table-row-height)","--touch-size":"var(--tosi-table-touch-size)","--dragged-header-bg":"var(--tosi-table-dragged-header-bg)","--dragged-header-color":"var(--tosi-table-dragged-header-color)","--drop-header-bg":"var(--tosi-table-drop-header-bg)",overflow:"auto hidden"},":host .thead, :host .tbody":{width:d.tosiTableGridRowWidth},":host .tr":{display:"grid",gridTemplateColumns:d.tosiTableGridColumns,height:d.tosiTableRowHeight,lineHeight:d.tosiTableRowHeight},":host .td, :host .th":{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",display:"flex",alignItems:"center"},":host .th .menu-trigger":{color:"currentColor",background:"none",padding:0,lineHeight:d.tosiTableTouchSize,height:d.tosiTableTouchSize,width:d.tosiTableTouchSize},':host [draggable="true"]':{cursor:"ew-resize"},':host [draggable="true"]:active':{background:d.tosiTableDraggedHeaderBg,color:d.tosiTableDraggedHeaderColor},":host .drag-over":{background:d.tosiTableDropHeaderBg}};static initAttributes={rowHeight:30,charWidth:15,minColumnWidth:30,select:!1,multiple:!1,pinnedTop:0,pinnedBottom:0,nosort:!1,nohide:!1,noreorder:!1,localized:!1};selectionChanged=()=>{};selectedKey=Symbol("selected");selectBinding=(n,e)=>{if(e==null)return;n.toggleAttribute("aria-selected",e[this.selectedKey]===!0)};maxVisibleRows=1e4;get value(){return{array:this.array,filter:this.filter,columns:this.columns}}set value(n){let{array:e,columns:t,filter:i}=D(n);if(this._array!==e||this._columns!==t||this._filter!==i)this.queueRender();this._array=e||[],this._columns=t||null,this._filter=i||Da}rowData={visible:[],pinnedTop:[],pinnedBottom:[]};_array=[];_columns=null;_filter=Da;get virtual(){return this.rowHeight>0?{height:this.rowHeight}:void 0}constructor(){super();this.rowData=H({[this.instanceId]:this.rowData})[this.instanceId]}get array(){return this._array}set array(n){this._array=D(n),this.queueRender()}get filter(){return this._filter}set filter(n){if(this._filter!==n)this._filter=n,this.queueRender()}get sort(){if(this._sort)return this._sort;let n=this._columns?.find((t)=>t.sort==="ascending"||t.sort==="descending");if(!n)return;let{prop:e}=n;return n.sort==="ascending"?(t,i)=>t[e]>i[e]?1:-1:(t,i)=>t[e]>i[e]?-1:1}set sort(n){if(this._sort!==n)this._sort=n,this.queueRender()}get columns(){if(!Array.isArray(this._columns)){let{_array:n}=this;this._columns=Object.keys(n[0]||{}).map((e)=>{let t=c2(n,e,this.charWidth);return{name:e.replace(/([a-z])([A-Z])/g,"$1 $2").toLocaleLowerCase(),prop:e,align:typeof n[0][e]==="number"||n[0][e]!==""&&!isNaN(n[0][e])?"right":"left",visible:t!==!1,width:t?t:0}})}return this._columns}set columns(n){this._columns=n,this.queueRender()}get visibleColumns(){return this.columns.filter((n)=>n.visible!==!1)}content=null;getColumn(n){let e=(n.touches!==void 0?n.touches[0].clientX:n.clientX)-this.getBoundingClientRect().x,t=n.touches!==void 0?20:5,i=0,o=[];return this.visibleColumns.find((a)=>{if(a.visible!==!1)return i+=a.width,o.push(i),Math.abs(e-i)<t})}setCursor=(n)=>{if(this.getColumn(n)!==void 0)this.style.cursor="col-resize";else this.style.cursor=""};resizeColumn=(n)=>{let e=this.getColumn(n);if(e!==void 0){let t=Number(e.width),i=n.touches!==void 0,o=i?n.touches[0].identifier:void 0;an(n,(s,a,r)=>{if((i?[...r.touches].find((c)=>c.identifier===o):!0)===void 0)return!0;let h=t+s;if(e.width=h>this.minColumnWidth?h:this.minColumnWidth,this.setColumnWidths(),r.type==="mouseup")return!0},"col-resize")}};selectRow(n,e=!0){if(e)n[this.selectedKey]=!0;else delete n[this.selectedKey];for(let t of Array.from(this.querySelectorAll(".tr"))){let i=mn(t);this.selectBinding(t,i)}}selectRows(n,e=!0){for(let t of n||this.array)if(e)t[this.selectedKey]=!0;else delete t[this.selectedKey];for(let t of Array.from(this.querySelectorAll(".tr"))){let i=mn(t);this.selectBinding(t,i)}}deSelect(n){this.selectRows(n,!1)}rangeStart;updateSelection=(n)=>{if(!this.select&&!this.multiple)return;let{target:e}=n;if(!(e instanceof HTMLElement))return;let t=e.closest(".tr");if(!(t instanceof HTMLElement))return;let i=mn(t);if(i==null)return;let o=n,s=window.getSelection();if(s!==null)s.removeAllRanges();let a=this.visibleRows;if(this.multiple&&o.shiftKey&&a.length>0&&this.rangeStart!==i){let r=this.rangeStart===void 0||this.rangeStart[this.selectedKey]===!0,[l,h]=[this.rangeStart!==void 0?a.indexOf(this.rangeStart):0,a.indexOf(i)].sort((c,p)=>c-p);if(l>-1)for(let c=l;c<=h;c++){let p=a[c];this.selectRow(p,r)}}else if(this.multiple&&o.metaKey){this.selectRow(i,!i[this.selectedKey]);let r=a.indexOf(i),l=a[r+1],h=r>0?a[r-1]:void 0;if(l!==void 0&&l[this.selectedKey]===!0)this.rangeStart=l;else if(h!==void 0&&h[this.selectedKey]===!0)this.rangeStart=h;else this.rangeStart=void 0}else this.rangeStart=i,this.deSelect(),this.selectRow(i,!0);this.selectionChanged(this.visibleSelectedRows);for(let r of Array.from(this.querySelectorAll(".tr"))){let l=mn(r);this.selectBinding(r,l)}};connectedCallback(){super.connectedCallback(),this.addEventListener("mousemove",this.setCursor),this.addEventListener("mousedown",this.resizeColumn),this.addEventListener("touchstart",this.resizeColumn,{passive:!0}),this.addEventListener("mouseup",this.updateSelection),this.addEventListener("touchend",this.updateSelection)}setColumnWidths(){let n=this.visibleColumns.map((t)=>t.width+"px").join(" "),e=this.visibleColumns.reduce((t,i)=>t+i.width,0)+"px";this.style.setProperty("--tosi-table-grid-columns",n),this.style.setProperty("--tosi-table-grid-row-width",e),this.style.setProperty("--grid-columns",n),this.style.setProperty("--grid-row-width",e)}sortByColumn=(n,e="auto")=>{for(let t of this.columns.filter((i)=>D(i.sort)!==!1))if(D(t)===n){if(e==="auto")t.sort=t.sort==="ascending"?"descending":"ascending";else t.sort=e;this.queueRender()}else delete t.sort};popColumnMenu=(n,e)=>{let{sortByColumn:t}=this,i=this.columns.filter((a)=>a.visible===!1),o=this.queueRender.bind(this),s=[];if(!this.nosort&&e.sort!==!1)s.push({caption:this.localized?`${U("Sort")} ${U("Ascending")}`:"Sort Ascending",icon:"sortAscending",action(){t(e)}},{caption:this.localized?`${U("Sort")} ${U("Descending")}`:"Sort Descending",icon:"sortDescending",action(){t(e,"descending")}});if(!this.nohide){if(s.length)s.push(null);s.push({caption:this.localized?`${U("Hide")} ${U("Column")}`:"Hide Column",icon:"eyeOff",enabled:()=>e.visible!==!0,action(){e.visible=!1,o()}},{caption:this.localized?`${U("Show")} ${U("Column")}`:"Show Column",icon:"eye",enabled:()=>i.length>0,menuItems:i.map((a)=>{return{caption:a.name||a.prop,action(){delete a.visible,o()}}})})}X({target:n,localized:this.localized,menuItems:s})};get captionSpan(){return this.localized?zn:bo}headerCell=(n)=>{let{popColumnMenu:e}=this,t="none",i;switch(n.sort){case"ascending":i=m.sortAscending(),t="descending";break;case!1:break;default:break;case"descending":t="ascending",i=m.sortDescending()}let o=!(this.nosort&&this.nohide)?p2({class:"menu-trigger",onClick(s){e(s.target,n),s.stopPropagation()}},i||m.moreVertical()):{};return n.headerCell!==void 0?n.headerCell(n):bo({class:"th",role:"columnheader",ariaSort:t,style:{...this.cellStyle,justifyContent:n.align||"left"}},this.captionSpan({style:{flex:"1"}},typeof n.name==="string"?n.name:n.prop),o)};dataCell=(n)=>{if(n.dataCell!==void 0)return n.dataCell(n);return bo({class:"td",role:"cell",style:{...this.cellStyle,justifyContent:n.align||"left"},bindText:`^.${n.prop}`})};get visibleRows(){return D(this.rowData.visible)}get visibleSelectedRows(){return this.visibleRows.filter((n)=>n[this.selectedKey])}get selectedRows(){return this.array.filter((n)=>n[this.selectedKey])}rowTemplate(n){return u2(ve({class:"tr",role:"row",bind:{value:"^",binding:{toDOM:this.selectBinding}}},...n.map(this.dataCell)))}draggedColumn;dropColumn=(n)=>{let e=n.target.closest(".drag-over"),t=Array.from(e.parentElement.children).indexOf(e),i=this.visibleColumns[t],o=this.columns.indexOf(this.draggedColumn),s=this.columns.indexOf(i);this.columns.splice(o,1),this.columns.splice(s,0,this.draggedColumn),console.log({event:n,target:e,targetIndex:t,draggedIndex:o,droppedIndex:s}),this.queueRender(),n.preventDefault(),n.stopPropagation()};render(){super.render(),this.rowData.pinnedTop=this.pinnedTop>0?this._array.slice(0,this.pinnedTop):[],this.rowData.pinnedBottom=this.pinnedBottom>0?this._array.slice(this._array.length-this.pinnedBottom):[],this.rowData.visible=this.filter(this._array.slice(this.pinnedTop,Math.min(this.maxVisibleRows,this._array.length-this.pinnedTop-this.pinnedBottom)));let{sort:n}=this;if(n)this.rowData.visible.sort(n);this.textContent="",this.style.display="flex",this.style.flexDirection="column";let{visibleColumns:e}=this;if(this.style.setProperty("--tosi-table-row-height",`${this.rowHeight}px`),this.style.setProperty("--row-height",`${this.rowHeight}px`),this.setColumnWidths(),!this.noreorder)yo();let t=this.instanceId+"-column-header",i=e.map((o)=>{let s=this.headerCell(o);if(!this.noreorder&&s.children[0]){let a=s.children[0];a.setAttribute("draggable","true"),a.style.pointerEvents="all",a.dataset.drag=t,s.dataset.drop=t,a.addEventListener("dragstart",()=>{this.draggedColumn=o}),s.addEventListener("drop",this.dropColumn)}return s});if(this.append(ve({class:"thead",role:"rowgroup",style:{touchAction:"none"}},ve({class:"tr",role:"row"},...i))),this.pinnedTop>0)this.append(ve({part:"pinnedTopRows",class:"tbody",role:"rowgroup",style:{flex:"0 0 auto",overflow:"hidden",height:`${this.rowHeight*this.pinnedTop}px`},bindList:{value:this.rowData.pinnedTop,virtual:this.virtual}},this.rowTemplate(e)));if(this.append(ve({part:"visibleRows",class:"tbody",role:"rowgroup",style:{content:" ",minHeight:"100px",flex:"1 1 100px",overflow:"hidden auto"},bindList:{value:this.rowData.visible,virtual:this.virtual}},this.rowTemplate(e))),this.pinnedBottom>0)this.append(ve({part:"pinnedBottomRows",class:"tbody",role:"rowgroup",style:{flex:"0 0 auto",overflow:"hidden",height:`${this.rowHeight*this.pinnedBottom}px`},bindList:{value:this.rowData.pinnedBottom,virtual:this.virtual}},this.rowTemplate(e)))}}var y2=Rt,fo=Rt.elementCreator(),m2=fo,g2=fo;var{dialog:x2,button:wo,header:b2,footer:f2,xinSlot:vo,h3:ko,p:Co,label:w2,input:v2,div:k2}=x;class jo extends f{static preferredTagName="tosi-dialog";static lightStyleSpec={":host > dialog::backdrop":{backdropFilter:"blur(8px)"},":host > dialog:not([open])":{display:"none"},":host > dialog[open]":{minWidth:300,border:0,borderRadius:10,overflow:"hidden",maxHeight:"calc(100% - 20px)",padding:0,display:"flex",flexDirection:"column",gap:5,_dialogShadow:u.menuShadow("0 5px 10px #0004"),_dialogBackground:u.background("#fafafa"),_dialogColor:u.textColor("#222"),boxShadow:d.dialogShadow,background:d.dialogBackground,color:d.dialogColor},":host > dialog > *":{padding:"0 20px"},":host > dialog > header":{display:"flex",justifyContent:"center",gap:10},":host > dialog > footer":{display:"flex",justifyContent:"flex-end",gap:10,paddingBottom:20}};static async alert(n,e="Alert"){return new Promise((t)=>{let i=Xt({removeOnClose:!0,closeOnBackgroundClick:!0,dialogWillClose(){t()}},ko({slot:"header"},e),n.includes(`
`)?x.pre({style:{whiteSpace:"pre-wrap",margin:0}},n):Co(n));document.body.append(i),i.showModal()})}static async confirm(n,e="Confirm"){return new Promise((t)=>{let i=Xt({removeOnClose:!0,dialogWillClose(o){t(o==="confirm")}},ko({slot:"header"},e),Co(n),wo({slot:"footer",onClick(){i.close()}},"Cancel"));document.body.append(i),i.showModal()})}static async prompt(n,e="Prompt",t=""){return new Promise((i)=>{let o=v2({value:t}),s=Xt({removeOnClose:!0,dialogWillClose(a){i(a==="confirm"?o.value:null)},initialFocus(){o.focus()}},ko({slot:"header"},e),Co(w2({style:{display:"flex",flexDirection:"column",alignItems:"stretch",gap:5}},k2(n),o)),wo({slot:"footer",onClick(){s.close()}},"Cancel"));document.body.append(s),s.showModal()})}static initAttributes={removeOnClose:!1,closeOnBackgroundClick:!1};constructor(){super();pe(this,"click",()=>{if(this.closeOnBackgroundClick)this.close()})}dialogWillClose=(n="cancel")=>{console.log("dialog will close with",n)};initialFocus(){this.parts.ok.focus()}#n=(n)=>{};showModal=()=>{return this.style.zIndex=String(En()),new Promise((n)=>{this.#n=n,this.parts.dialog.showModal(),requestAnimationFrame(()=>{this.initialFocus()})})};close=(n="cancel")=>{if(this.dialogWillClose(n),this.#n(n),this.parts.dialog.close(),this.removeOnClose)this.remove()};ok=()=>{this.close("confirm")};content=()=>x2({part:"dialog"},b2(vo({name:"header"})),vo(),f2(vo({name:"footer"}),wo({part:"ok",onClick:this.ok},"OK")))}var Xt=jo.elementCreator();function So(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var ee=So();function Ga(n){ee=n}var Je={exec:()=>null};function P(n,e=""){let t=typeof n=="string"?n:n.source,i={replace:(o,s)=>{let a=typeof s=="string"?s:s.source;return a=a.replace(nn.caret,"$1"),t=t.replace(o,a),i},getRegex:()=>new RegExp(t,e)};return i}var C2=(()=>{try{return!!new RegExp("(?<=1)(?<!1)")}catch{return!1}})(),nn={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:(n)=>new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}#`),htmlBeginRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}<(?:[a-z].*>|!--)`,"i")},j2=/^(?:[ \t]*(?:\n|$))+/,B2=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,S2=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Le=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,A2=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Ao=/(?:[*+-]|\d{1,9}[.)])/,Ya=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,Ka=P(Ya).replace(/bull/g,Ao).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),z2=P(Ya).replace(/bull/g,Ao).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),zo=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,O2=/^[^\n]+/,Oo=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,P2=P(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",Oo).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),I2=P(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Ao).getRegex(),Kt="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Po=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,T2=P("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))","i").replace("comment",Po).replace("tag",Kt).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Qa=P(zo).replace("hr",Le).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Kt).getRegex(),V2=P(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",Qa).getRegex(),Io={blockquote:V2,code:B2,def:P2,fences:S2,heading:A2,hr:Le,html:T2,lheading:Ka,list:I2,newline:j2,paragraph:Qa,table:Je,text:O2},Na=P("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Le).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}\t)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Kt).getRegex(),q2={...Io,lheading:z2,table:Na,paragraph:P(zo).replace("hr",Le).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Na).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Kt).getRegex()},_2={...Io,html:P(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Po).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Je,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:P(zo).replace("hr",Le).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Ka).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},D2=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,N2=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,$a=/^( {2,}|\\)\n(?!\s*$)/,U2=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Qt=/[\p{P}\p{S}]/u,To=/[\s\p{P}\p{S}]/u,Ha=/[^\s\p{P}\p{S}]/u,R2=P(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,To).getRegex(),Za=/(?!~)[\p{P}\p{S}]/u,X2=/(?!~)[\s\p{P}\p{S}]/u,F2=/(?:[^\s\p{P}\p{S}]|~)/u,W2=P(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",C2?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),Ma=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,G2=P(Ma,"u").replace(/punct/g,Qt).getRegex(),Y2=P(Ma,"u").replace(/punct/g,Za).getRegex(),Ja="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",K2=P(Ja,"gu").replace(/notPunctSpace/g,Ha).replace(/punctSpace/g,To).replace(/punct/g,Qt).getRegex(),Q2=P(Ja,"gu").replace(/notPunctSpace/g,F2).replace(/punctSpace/g,X2).replace(/punct/g,Za).getRegex(),$2=P("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,Ha).replace(/punctSpace/g,To).replace(/punct/g,Qt).getRegex(),H2=P(/\\(punct)/,"gu").replace(/punct/g,Qt).getRegex(),Z2=P(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),M2=P(Po).replace("(?:-->|$)","-->").getRegex(),J2=P("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",M2).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Wt=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/,L2=P(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",Wt).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),La=P(/^!?\[(label)\]\[(ref)\]/).replace("label",Wt).replace("ref",Oo).getRegex(),Ea=P(/^!?\[(ref)\](?:\[\])?/).replace("ref",Oo).getRegex(),E2=P("reflink|nolink(?!\\()","g").replace("reflink",La).replace("nolink",Ea).getRegex(),Ua=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Vo={_backpedal:Je,anyPunctuation:H2,autolink:Z2,blockSkip:W2,br:$a,code:N2,del:Je,emStrongLDelim:G2,emStrongRDelimAst:K2,emStrongRDelimUnd:$2,escape:D2,link:L2,nolink:Ea,punctuation:R2,reflink:La,reflinkSearch:E2,tag:J2,text:U2,url:Je},nd={...Vo,link:P(/^!?\[(label)\]\((.*?)\)/).replace("label",Wt).getRegex(),reflink:P(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Wt).getRegex()},Bo={...Vo,emStrongRDelimAst:Q2,emStrongLDelim:Y2,url:P(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",Ua).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:P(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",Ua).getRegex()},ed={...Bo,br:P($a).replace("{2,}","*").getRegex(),text:P(Bo.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Ft={normal:Io,gfm:q2,pedantic:_2},He={normal:Vo,gfm:Bo,breaks:ed,pedantic:nd},td={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Ra=(n)=>td[n];function On(n,e){if(e){if(nn.escapeTest.test(n))return n.replace(nn.escapeReplace,Ra)}else if(nn.escapeTestNoEncode.test(n))return n.replace(nn.escapeReplaceNoEncode,Ra);return n}function Xa(n){try{n=encodeURI(n).replace(nn.percentDecode,"%")}catch{return null}return n}function Fa(n,e){let t=n.replace(nn.findPipe,(s,a,r)=>{let l=!1,h=a;for(;--h>=0&&r[h]==="\\";)l=!l;return l?"|":" |"}),i=t.split(nn.splitPipe),o=0;if(i[0].trim()||i.shift(),i.length>0&&!i.at(-1)?.trim()&&i.pop(),e)if(i.length>e)i.splice(e);else for(;i.length<e;)i.push("");for(;o<i.length;o++)i[o]=i[o].trim().replace(nn.slashPipe,"|");return i}function Ze(n,e,t){let i=n.length;if(i===0)return"";let o=0;for(;o<i;){let s=n.charAt(i-o-1);if(s===e&&!t)o++;else if(s!==e&&t)o++;else break}return n.slice(0,i-o)}function id(n,e){if(n.indexOf(e[1])===-1)return-1;let t=0;for(let i=0;i<n.length;i++)if(n[i]==="\\")i++;else if(n[i]===e[0])t++;else if(n[i]===e[1]&&(t--,t<0))return i;return t>0?-2:-1}function Wa(n,e,t,i,o){let s=e.href,a=e.title||null,r=n[1].replace(o.other.outputLinkReplace,"$1");i.state.inLink=!0;let l={type:n[0].charAt(0)==="!"?"image":"link",raw:t,href:s,title:a,text:r,tokens:i.inlineTokens(r)};return i.state.inLink=!1,l}function od(n,e,t){let i=n.match(t.other.indentCodeCompensation);if(i===null)return e;let o=i[1];return e.split(`
`).map((s)=>{let a=s.match(t.other.beginningSpace);if(a===null)return s;let[r]=a;return r.length>=o.length?s.slice(o.length):s}).join(`
`)}var Gt=class{options;rules;lexer;constructor(n){this.options=n||ee}space(n){let e=this.rules.block.newline.exec(n);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(n){let e=this.rules.block.code.exec(n);if(e){let t=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?t:Ze(t,`
`)}}}fences(n){let e=this.rules.block.fences.exec(n);if(e){let t=e[0],i=od(t,e[3]||"",this.rules);return{type:"code",raw:t,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:i}}}heading(n){let e=this.rules.block.heading.exec(n);if(e){let t=e[2].trim();if(this.rules.other.endingHash.test(t)){let i=Ze(t,"#");(this.options.pedantic||!i||this.rules.other.endingSpaceChar.test(i))&&(t=i.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(n){let e=this.rules.block.hr.exec(n);if(e)return{type:"hr",raw:Ze(e[0],`
`)}}blockquote(n){let e=this.rules.block.blockquote.exec(n);if(e){let t=Ze(e[0],`
`).split(`
`),i="",o="",s=[];for(;t.length>0;){let a=!1,r=[],l;for(l=0;l<t.length;l++)if(this.rules.other.blockquoteStart.test(t[l]))r.push(t[l]),a=!0;else if(!a)r.push(t[l]);else break;t=t.slice(l);let h=r.join(`
`),c=h.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");i=i?`${i}
${h}`:h,o=o?`${o}
${c}`:c;let p=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,s,!0),this.lexer.state.top=p,t.length===0)break;let y=s.at(-1);if(y?.type==="code")break;if(y?.type==="blockquote"){let w=y,g=w.raw+`
`+t.join(`
`),k=this.blockquote(g);s[s.length-1]=k,i=i.substring(0,i.length-w.raw.length)+k.raw,o=o.substring(0,o.length-w.text.length)+k.text;break}else if(y?.type==="list"){let w=y,g=w.raw+`
`+t.join(`
`),k=this.list(g);s[s.length-1]=k,i=i.substring(0,i.length-y.raw.length)+k.raw,o=o.substring(0,o.length-w.raw.length)+k.raw,t=g.substring(s.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:i,tokens:s,text:o}}}list(n){let e=this.rules.block.list.exec(n);if(e){let t=e[1].trim(),i=t.length>1,o={type:"list",raw:"",ordered:i,start:i?+t.slice(0,-1):"",loose:!1,items:[]};t=i?`\\d{1,9}\\${t.slice(-1)}`:`\\${t}`,this.options.pedantic&&(t=i?t:"[*+-]");let s=this.rules.other.listItemRegex(t),a=!1;for(;n;){let l=!1,h="",c="";if(!(e=s.exec(n))||this.rules.block.hr.test(n))break;h=e[0],n=n.substring(h.length);let p=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,(B)=>" ".repeat(3*B.length)),y=n.split(`
`,1)[0],w=!p.trim(),g=0;if(this.options.pedantic?(g=2,c=p.trimStart()):w?g=e[1].length+1:(g=e[2].search(this.rules.other.nonSpaceChar),g=g>4?1:g,c=p.slice(g),g+=e[1].length),w&&this.rules.other.blankLine.test(y)&&(h+=y+`
`,n=n.substring(y.length+1),l=!0),!l){let B=this.rules.other.nextBulletRegex(g),A=this.rules.other.hrRegex(g),V=this.rules.other.fencesBeginRegex(g),R=this.rules.other.headingBeginRegex(g),T=this.rules.other.htmlBeginRegex(g);for(;n;){let S=n.split(`
`,1)[0],z;if(y=S,this.options.pedantic?(y=y.replace(this.rules.other.listReplaceNesting,"  "),z=y):z=y.replace(this.rules.other.tabCharGlobal,"    "),V.test(y)||R.test(y)||T.test(y)||B.test(y)||A.test(y))break;if(z.search(this.rules.other.nonSpaceChar)>=g||!y.trim())c+=`
`+z.slice(g);else{if(w||p.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||V.test(p)||R.test(p)||A.test(p))break;c+=`
`+y}!w&&!y.trim()&&(w=!0),h+=S+`
`,n=n.substring(S.length+1),p=z.slice(g)}}o.loose||(a?o.loose=!0:this.rules.other.doubleBlankLine.test(h)&&(a=!0));let k=null,j;this.options.gfm&&(k=this.rules.other.listIsTask.exec(c),k&&(j=k[0]!=="[ ] ",c=c.replace(this.rules.other.listReplaceTask,""))),o.items.push({type:"list_item",raw:h,task:!!k,checked:j,loose:!1,text:c,tokens:[]}),o.raw+=h}let r=o.items.at(-1);if(r)r.raw=r.raw.trimEnd(),r.text=r.text.trimEnd();else return;o.raw=o.raw.trimEnd();for(let l=0;l<o.items.length;l++)if(this.lexer.state.top=!1,o.items[l].tokens=this.lexer.blockTokens(o.items[l].text,[]),!o.loose){let h=o.items[l].tokens.filter((p)=>p.type==="space"),c=h.length>0&&h.some((p)=>this.rules.other.anyLine.test(p.raw));o.loose=c}if(o.loose)for(let l=0;l<o.items.length;l++)o.items[l].loose=!0;return o}}html(n){let e=this.rules.block.html.exec(n);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(n){let e=this.rules.block.def.exec(n);if(e){let t=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),i=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",o=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:t,raw:e[0],href:i,title:o}}}table(n){let e=this.rules.block.table.exec(n);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let t=Fa(e[1]),i=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),o=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],s={type:"table",raw:e[0],header:[],align:[],rows:[]};if(t.length===i.length){for(let a of i)this.rules.other.tableAlignRight.test(a)?s.align.push("right"):this.rules.other.tableAlignCenter.test(a)?s.align.push("center"):this.rules.other.tableAlignLeft.test(a)?s.align.push("left"):s.align.push(null);for(let a=0;a<t.length;a++)s.header.push({text:t[a],tokens:this.lexer.inline(t[a]),header:!0,align:s.align[a]});for(let a of o)s.rows.push(Fa(a,s.header.length).map((r,l)=>({text:r,tokens:this.lexer.inline(r),header:!1,align:s.align[l]})));return s}}lheading(n){let e=this.rules.block.lheading.exec(n);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(n){let e=this.rules.block.paragraph.exec(n);if(e){let t=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}}}text(n){let e=this.rules.block.text.exec(n);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(n){let e=this.rules.inline.escape.exec(n);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(n){let e=this.rules.inline.tag.exec(n);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(n){let e=this.rules.inline.link.exec(n);if(e){let t=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(t)){if(!this.rules.other.endAngleBracket.test(t))return;let s=Ze(t.slice(0,-1),"\\");if((t.length-s.length)%2===0)return}else{let s=id(e[2],"()");if(s===-2)return;if(s>-1){let a=(e[0].indexOf("!")===0?5:4)+e[1].length+s;e[2]=e[2].substring(0,s),e[0]=e[0].substring(0,a).trim(),e[3]=""}}let i=e[2],o="";if(this.options.pedantic){let s=this.rules.other.pedanticHrefTitle.exec(i);s&&(i=s[1],o=s[3])}else o=e[3]?e[3].slice(1,-1):"";return i=i.trim(),this.rules.other.startAngleBracket.test(i)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(t)?i=i.slice(1):i=i.slice(1,-1)),Wa(e,{href:i&&i.replace(this.rules.inline.anyPunctuation,"$1"),title:o&&o.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(n,e){let t;if((t=this.rules.inline.reflink.exec(n))||(t=this.rules.inline.nolink.exec(n))){let i=(t[2]||t[1]).replace(this.rules.other.multipleSpaceGlobal," "),o=e[i.toLowerCase()];if(!o){let s=t[0].charAt(0);return{type:"text",raw:s,text:s}}return Wa(t,o,t[0],this.lexer,this.rules)}}emStrong(n,e,t=""){let i=this.rules.inline.emStrongLDelim.exec(n);if(!i||i[3]&&t.match(this.rules.other.unicodeAlphaNumeric))return;if(!(i[1]||i[2])||!t||this.rules.inline.punctuation.exec(t)){let o=[...i[0]].length-1,s,a,r=o,l=0,h=i[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(h.lastIndex=0,e=e.slice(-1*n.length+o);(i=h.exec(e))!=null;){if(s=i[1]||i[2]||i[3]||i[4]||i[5]||i[6],!s)continue;if(a=[...s].length,i[3]||i[4]){r+=a;continue}else if((i[5]||i[6])&&o%3&&!((o+a)%3)){l+=a;continue}if(r-=a,r>0)continue;a=Math.min(a,a+r+l);let c=[...i[0]][0].length,p=n.slice(0,o+i.index+c+a);if(Math.min(o,a)%2){let w=p.slice(1,-1);return{type:"em",raw:p,text:w,tokens:this.lexer.inlineTokens(w)}}let y=p.slice(2,-2);return{type:"strong",raw:p,text:y,tokens:this.lexer.inlineTokens(y)}}}}codespan(n){let e=this.rules.inline.code.exec(n);if(e){let t=e[2].replace(this.rules.other.newLineCharGlobal," "),i=this.rules.other.nonSpaceChar.test(t),o=this.rules.other.startingSpaceChar.test(t)&&this.rules.other.endingSpaceChar.test(t);return i&&o&&(t=t.substring(1,t.length-1)),{type:"codespan",raw:e[0],text:t}}}br(n){let e=this.rules.inline.br.exec(n);if(e)return{type:"br",raw:e[0]}}del(n){let e=this.rules.inline.del.exec(n);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(n){let e=this.rules.inline.autolink.exec(n);if(e){let t,i;return e[2]==="@"?(t=e[1],i="mailto:"+t):(t=e[1],i=t),{type:"link",raw:e[0],text:t,href:i,tokens:[{type:"text",raw:t,text:t}]}}}url(n){let e;if(e=this.rules.inline.url.exec(n)){let t,i;if(e[2]==="@")t=e[0],i="mailto:"+t;else{let o;do o=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(o!==e[0]);t=e[0],e[1]==="www."?i="http://"+e[0]:i=e[0]}return{type:"link",raw:e[0],text:t,href:i,tokens:[{type:"text",raw:t,text:t}]}}}inlineText(n){let e=this.rules.inline.text.exec(n);if(e){let t=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:t}}}},gn=class n{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||ee,this.options.tokenizer=this.options.tokenizer||new Gt,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:nn,block:Ft.normal,inline:He.normal};this.options.pedantic?(t.block=Ft.pedantic,t.inline=He.pedantic):this.options.gfm&&(t.block=Ft.gfm,this.options.breaks?t.inline=He.breaks:t.inline=He.gfm),this.tokenizer.rules=t}static get rules(){return{block:Ft,inline:He}}static lex(e,t){return new n(t).lex(e)}static lexInline(e,t){return new n(t).inlineTokens(e)}lex(e){e=e.replace(nn.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let i=this.inlineQueue[t];this.inlineTokens(i.src,i.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],i=!1){for(this.options.pedantic&&(e=e.replace(nn.tabCharGlobal,"    ").replace(nn.spaceLine,""));e;){let o;if(this.options.extensions?.block?.some((a)=>(o=a.call({lexer:this},e,t))?(e=e.substring(o.raw.length),t.push(o),!0):!1))continue;if(o=this.tokenizer.space(e)){e=e.substring(o.raw.length);let a=t.at(-1);o.raw.length===1&&a!==void 0?a.raw+=`
`:t.push(o);continue}if(o=this.tokenizer.code(e)){e=e.substring(o.raw.length);let a=t.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+o.raw,a.text+=`
`+o.text,this.inlineQueue.at(-1).src=a.text):t.push(o);continue}if(o=this.tokenizer.fences(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.heading(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.hr(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.blockquote(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.list(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.html(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.def(e)){e=e.substring(o.raw.length);let a=t.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+o.raw,a.text+=`
`+o.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[o.tag]||(this.tokens.links[o.tag]={href:o.href,title:o.title},t.push(o));continue}if(o=this.tokenizer.table(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.lheading(e)){e=e.substring(o.raw.length),t.push(o);continue}let s=e;if(this.options.extensions?.startBlock){let a=1/0,r=e.slice(1),l;this.options.extensions.startBlock.forEach((h)=>{l=h.call({lexer:this},r),typeof l=="number"&&l>=0&&(a=Math.min(a,l))}),a<1/0&&a>=0&&(s=e.substring(0,a+1))}if(this.state.top&&(o=this.tokenizer.paragraph(s))){let a=t.at(-1);i&&a?.type==="paragraph"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+o.raw,a.text+=`
`+o.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):t.push(o),i=s.length!==e.length,e=e.substring(o.raw.length);continue}if(o=this.tokenizer.text(e)){e=e.substring(o.raw.length);let a=t.at(-1);a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+o.raw,a.text+=`
`+o.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):t.push(o);continue}if(e){let a="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(a);break}else throw Error(a)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let i=e,o=null;if(this.tokens.links){let l=Object.keys(this.tokens.links);if(l.length>0)for(;(o=this.tokenizer.rules.inline.reflinkSearch.exec(i))!=null;)l.includes(o[0].slice(o[0].lastIndexOf("[")+1,-1))&&(i=i.slice(0,o.index)+"["+"a".repeat(o[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(o=this.tokenizer.rules.inline.anyPunctuation.exec(i))!=null;)i=i.slice(0,o.index)+"++"+i.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let s;for(;(o=this.tokenizer.rules.inline.blockSkip.exec(i))!=null;)s=o[2]?o[2].length:0,i=i.slice(0,o.index+s)+"["+"a".repeat(o[0].length-s-2)+"]"+i.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);i=this.options.hooks?.emStrongMask?.call({lexer:this},i)??i;let a=!1,r="";for(;e;){a||(r=""),a=!1;let l;if(this.options.extensions?.inline?.some((c)=>(l=c.call({lexer:this},e,t))?(e=e.substring(l.raw.length),t.push(l),!0):!1))continue;if(l=this.tokenizer.escape(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.tag(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.link(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(l.raw.length);let c=t.at(-1);l.type==="text"&&c?.type==="text"?(c.raw+=l.raw,c.text+=l.text):t.push(l);continue}if(l=this.tokenizer.emStrong(e,i,r)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.codespan(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.br(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.del(e)){e=e.substring(l.raw.length),t.push(l);continue}if(l=this.tokenizer.autolink(e)){e=e.substring(l.raw.length),t.push(l);continue}if(!this.state.inLink&&(l=this.tokenizer.url(e))){e=e.substring(l.raw.length),t.push(l);continue}let h=e;if(this.options.extensions?.startInline){let c=1/0,p=e.slice(1),y;this.options.extensions.startInline.forEach((w)=>{y=w.call({lexer:this},p),typeof y=="number"&&y>=0&&(c=Math.min(c,y))}),c<1/0&&c>=0&&(h=e.substring(0,c+1))}if(l=this.tokenizer.inlineText(h)){e=e.substring(l.raw.length),l.raw.slice(-1)!=="_"&&(r=l.raw.slice(-1)),a=!0;let c=t.at(-1);c?.type==="text"?(c.raw+=l.raw,c.text+=l.text):t.push(l);continue}if(e){let c="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(c);break}else throw Error(c)}}return t}},Yt=class{options;parser;constructor(n){this.options=n||ee}space(n){return""}code({text:n,lang:e,escaped:t}){let i=(e||"").match(nn.notSpaceStart)?.[0],o=n.replace(nn.endingNewline,"")+`
`;return i?'<pre><code class="language-'+On(i)+'">'+(t?o:On(o,!0))+`</code></pre>
`:"<pre><code>"+(t?o:On(o,!0))+`</code></pre>
`}blockquote({tokens:n}){return`<blockquote>
${this.parser.parse(n)}</blockquote>
`}html({text:n}){return n}def(n){return""}heading({tokens:n,depth:e}){return`<h${e}>${this.parser.parseInline(n)}</h${e}>
`}hr(n){return`<hr>
`}list(n){let{ordered:e,start:t}=n,i="";for(let a=0;a<n.items.length;a++){let r=n.items[a];i+=this.listitem(r)}let o=e?"ol":"ul",s=e&&t!==1?' start="'+t+'"':"";return"<"+o+s+`>
`+i+"</"+o+`>
`}listitem(n){let e="";if(n.task){let t=this.checkbox({checked:!!n.checked});n.loose?n.tokens[0]?.type==="paragraph"?(n.tokens[0].text=t+" "+n.tokens[0].text,n.tokens[0].tokens&&n.tokens[0].tokens.length>0&&n.tokens[0].tokens[0].type==="text"&&(n.tokens[0].tokens[0].text=t+" "+On(n.tokens[0].tokens[0].text),n.tokens[0].tokens[0].escaped=!0)):n.tokens.unshift({type:"text",raw:t+" ",text:t+" ",escaped:!0}):e+=t+" "}return e+=this.parser.parse(n.tokens,!!n.loose),`<li>${e}</li>
`}checkbox({checked:n}){return"<input "+(n?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:n}){return`<p>${this.parser.parseInline(n)}</p>
`}table(n){let e="",t="";for(let o=0;o<n.header.length;o++)t+=this.tablecell(n.header[o]);e+=this.tablerow({text:t});let i="";for(let o=0;o<n.rows.length;o++){let s=n.rows[o];t="";for(let a=0;a<s.length;a++)t+=this.tablecell(s[a]);i+=this.tablerow({text:t})}return i&&(i=`<tbody>${i}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+i+`</table>
`}tablerow({text:n}){return`<tr>
${n}</tr>
`}tablecell(n){let e=this.parser.parseInline(n.tokens),t=n.header?"th":"td";return(n.align?`<${t} align="${n.align}">`:`<${t}>`)+e+`</${t}>
`}strong({tokens:n}){return`<strong>${this.parser.parseInline(n)}</strong>`}em({tokens:n}){return`<em>${this.parser.parseInline(n)}</em>`}codespan({text:n}){return`<code>${On(n,!0)}</code>`}br(n){return"<br>"}del({tokens:n}){return`<del>${this.parser.parseInline(n)}</del>`}link({href:n,title:e,tokens:t}){let i=this.parser.parseInline(t),o=Xa(n);if(o===null)return i;n=o;let s='<a href="'+n+'"';return e&&(s+=' title="'+On(e)+'"'),s+=">"+i+"</a>",s}image({href:n,title:e,text:t,tokens:i}){i&&(t=this.parser.parseInline(i,this.parser.textRenderer));let o=Xa(n);if(o===null)return On(t);n=o;let s=`<img src="${n}" alt="${t}"`;return e&&(s+=` title="${On(e)}"`),s+=">",s}text(n){return"tokens"in n&&n.tokens?this.parser.parseInline(n.tokens):("escaped"in n)&&n.escaped?n.text:On(n.text)}},qo=class{strong({text:n}){return n}em({text:n}){return n}codespan({text:n}){return n}del({text:n}){return n}html({text:n}){return n}text({text:n}){return n}link({text:n}){return""+n}image({text:n}){return""+n}br(){return""}},xn=class n{options;renderer;textRenderer;constructor(e){this.options=e||ee,this.options.renderer=this.options.renderer||new Yt,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new qo}static parse(e,t){return new n(t).parse(e)}static parseInline(e,t){return new n(t).parseInline(e)}parse(e,t=!0){let i="";for(let o=0;o<e.length;o++){let s=e[o];if(this.options.extensions?.renderers?.[s.type]){let r=s,l=this.options.extensions.renderers[r.type].call({parser:this},r);if(l!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(r.type)){i+=l||"";continue}}let a=s;switch(a.type){case"space":{i+=this.renderer.space(a);continue}case"hr":{i+=this.renderer.hr(a);continue}case"heading":{i+=this.renderer.heading(a);continue}case"code":{i+=this.renderer.code(a);continue}case"table":{i+=this.renderer.table(a);continue}case"blockquote":{i+=this.renderer.blockquote(a);continue}case"list":{i+=this.renderer.list(a);continue}case"html":{i+=this.renderer.html(a);continue}case"def":{i+=this.renderer.def(a);continue}case"paragraph":{i+=this.renderer.paragraph(a);continue}case"text":{let r=a,l=this.renderer.text(r);for(;o+1<e.length&&e[o+1].type==="text";)r=e[++o],l+=`
`+this.renderer.text(r);t?i+=this.renderer.paragraph({type:"paragraph",raw:l,text:l,tokens:[{type:"text",raw:l,text:l,escaped:!0}]}):i+=l;continue}default:{let r='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(r),"";throw Error(r)}}}return i}parseInline(e,t=this.renderer){let i="";for(let o=0;o<e.length;o++){let s=e[o];if(this.options.extensions?.renderers?.[s.type]){let r=this.options.extensions.renderers[s.type].call({parser:this},s);if(r!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(s.type)){i+=r||"";continue}}let a=s;switch(a.type){case"escape":{i+=t.text(a);break}case"html":{i+=t.html(a);break}case"link":{i+=t.link(a);break}case"image":{i+=t.image(a);break}case"strong":{i+=t.strong(a);break}case"em":{i+=t.em(a);break}case"codespan":{i+=t.codespan(a);break}case"br":{i+=t.br(a);break}case"del":{i+=t.del(a);break}case"text":{i+=t.text(a);break}default:{let r='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(r),"";throw Error(r)}}}return i}},Me=class{options;block;constructor(n){this.options=n||ee}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens","emStrongMask"]);static passThroughHooksRespectAsync=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(n){return n}postprocess(n){return n}processAllTokens(n){return n}emStrongMask(n){return n}provideLexer(){return this.block?gn.lex:gn.lexInline}provideParser(){return this.block?xn.parse:xn.parseInline}},sd=class{defaults=So();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=xn;Renderer=Yt;TextRenderer=qo;Lexer=gn;Tokenizer=Gt;Hooks=Me;constructor(...n){this.use(...n)}walkTokens(n,e){let t=[];for(let i of n)switch(t=t.concat(e.call(this,i)),i.type){case"table":{let o=i;for(let s of o.header)t=t.concat(this.walkTokens(s.tokens,e));for(let s of o.rows)for(let a of s)t=t.concat(this.walkTokens(a.tokens,e));break}case"list":{let o=i;t=t.concat(this.walkTokens(o.items,e));break}default:{let o=i;this.defaults.extensions?.childTokens?.[o.type]?this.defaults.extensions.childTokens[o.type].forEach((s)=>{let a=o[s].flat(1/0);t=t.concat(this.walkTokens(a,e))}):o.tokens&&(t=t.concat(this.walkTokens(o.tokens,e)))}}return t}use(...n){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return n.forEach((t)=>{let i={...t};if(i.async=this.defaults.async||i.async||!1,t.extensions&&(t.extensions.forEach((o)=>{if(!o.name)throw Error("extension name required");if("renderer"in o){let s=e.renderers[o.name];s?e.renderers[o.name]=function(...a){let r=o.renderer.apply(this,a);return r===!1&&(r=s.apply(this,a)),r}:e.renderers[o.name]=o.renderer}if("tokenizer"in o){if(!o.level||o.level!=="block"&&o.level!=="inline")throw Error("extension level must be 'block' or 'inline'");let s=e[o.level];s?s.unshift(o.tokenizer):e[o.level]=[o.tokenizer],o.start&&(o.level==="block"?e.startBlock?e.startBlock.push(o.start):e.startBlock=[o.start]:o.level==="inline"&&(e.startInline?e.startInline.push(o.start):e.startInline=[o.start]))}"childTokens"in o&&o.childTokens&&(e.childTokens[o.name]=o.childTokens)}),i.extensions=e),t.renderer){let o=this.defaults.renderer||new Yt(this.defaults);for(let s in t.renderer){if(!(s in o))throw Error(`renderer '${s}' does not exist`);if(["options","parser"].includes(s))continue;let a=s,r=t.renderer[a],l=o[a];o[a]=(...h)=>{let c=r.apply(o,h);return c===!1&&(c=l.apply(o,h)),c||""}}i.renderer=o}if(t.tokenizer){let o=this.defaults.tokenizer||new Gt(this.defaults);for(let s in t.tokenizer){if(!(s in o))throw Error(`tokenizer '${s}' does not exist`);if(["options","rules","lexer"].includes(s))continue;let a=s,r=t.tokenizer[a],l=o[a];o[a]=(...h)=>{let c=r.apply(o,h);return c===!1&&(c=l.apply(o,h)),c}}i.tokenizer=o}if(t.hooks){let o=this.defaults.hooks||new Me;for(let s in t.hooks){if(!(s in o))throw Error(`hook '${s}' does not exist`);if(["options","block"].includes(s))continue;let a=s,r=t.hooks[a],l=o[a];Me.passThroughHooks.has(s)?o[a]=(h)=>{if(this.defaults.async&&Me.passThroughHooksRespectAsync.has(s))return(async()=>{let p=await r.call(o,h);return l.call(o,p)})();let c=r.call(o,h);return l.call(o,c)}:o[a]=(...h)=>{if(this.defaults.async)return(async()=>{let p=await r.apply(o,h);return p===!1&&(p=await l.apply(o,h)),p})();let c=r.apply(o,h);return c===!1&&(c=l.apply(o,h)),c}}i.hooks=o}if(t.walkTokens){let o=this.defaults.walkTokens,s=t.walkTokens;i.walkTokens=function(a){let r=[];return r.push(s.call(this,a)),o&&(r=r.concat(o.call(this,a))),r}}this.defaults={...this.defaults,...i}}),this}setOptions(n){return this.defaults={...this.defaults,...n},this}lexer(n,e){return gn.lex(n,e??this.defaults)}parser(n,e){return xn.parse(n,e??this.defaults)}parseMarkdown(n){return(e,t)=>{let i={...t},o={...this.defaults,...i},s=this.onError(!!o.silent,!!o.async);if(this.defaults.async===!0&&i.async===!1)return s(Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return s(Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return s(Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));if(o.hooks&&(o.hooks.options=o,o.hooks.block=n),o.async)return(async()=>{let a=o.hooks?await o.hooks.preprocess(e):e,r=await(o.hooks?await o.hooks.provideLexer():n?gn.lex:gn.lexInline)(a,o),l=o.hooks?await o.hooks.processAllTokens(r):r;o.walkTokens&&await Promise.all(this.walkTokens(l,o.walkTokens));let h=await(o.hooks?await o.hooks.provideParser():n?xn.parse:xn.parseInline)(l,o);return o.hooks?await o.hooks.postprocess(h):h})().catch(s);try{o.hooks&&(e=o.hooks.preprocess(e));let a=(o.hooks?o.hooks.provideLexer():n?gn.lex:gn.lexInline)(e,o);o.hooks&&(a=o.hooks.processAllTokens(a)),o.walkTokens&&this.walkTokens(a,o.walkTokens);let r=(o.hooks?o.hooks.provideParser():n?xn.parse:xn.parseInline)(a,o);return o.hooks&&(r=o.hooks.postprocess(r)),r}catch(a){return s(a)}}}onError(n,e){return(t)=>{if(t.message+=`
Please report this to https://github.com/markedjs/marked.`,n){let i="<p>An error occurred:</p><pre>"+On(t.message+"",!0)+"</pre>";return e?Promise.resolve(i):i}if(e)return Promise.reject(t);throw t}}},ne=new sd;function I(n,e){return ne.parse(n,e)}I.options=I.setOptions=function(n){return ne.setOptions(n),I.defaults=ne.defaults,Ga(I.defaults),I};I.getDefaults=So;I.defaults=ee;I.use=function(...n){return ne.use(...n),I.defaults=ne.defaults,Ga(I.defaults),I};I.walkTokens=function(n,e){return ne.walkTokens(n,e)};I.parseInline=ne.parseInline;I.Parser=xn;I.parser=xn.parse;I.Renderer=Yt;I.TextRenderer=qo;I.Lexer=gn;I.lexer=gn.lex;I.Tokenizer=Gt;I.Hooks=Me;I.parse=I;var{options:ap,setOptions:lp,use:rp,walkTokens:dp,parseInline:hp}=I;var cp=xn.parse,pp=gn.lex;function nl(n,e){if(e==null)e="";else if(typeof e!=="string")e=String(e);return e.replace(/\{\{([^}]+)\}\}/g,(t,i)=>{let o=Q[`${n}${i.startsWith("[")?i:"."+i}`];return o===void 0?t:nl(n,String(o))})}class $t extends f{static preferredTagName="tosi-md";static initAttributes={src:"",elements:!1};context={};value="";content=null;options={};connectedCallback(){if(super.connectedCallback(),this.src!=="")(async()=>{let n=await fetch(this.src);this.value=await n.text()})();else if(this.value==="")if(this.elements)this.value=this.innerHTML;else this.value=this.textContent!=null?this.textContent:""}didRender=()=>{};render(){super.render(),Q[this.instanceId]=typeof this.context==="string"?JSON.parse(this.context):this.context;let n=nl(this.instanceId,this.value);if(this.elements){let e=n.split(`
`).reduce((t,i)=>{if(i.startsWith("<")||t.length===0)t.push(i);else{let o=t[t.length-1];if(!o.startsWith("<")||!o.endsWith(">"))t[t.length-1]+=`
`+i;else t.push(i)}return t},[]);this.innerHTML=e.map((t)=>t.startsWith("<")&&t.endsWith(">")?t:I(t,this.options)).join("")}else this.innerHTML=I(n,this.options);this.didRender()}}var ad=$t,ke=$t.elementCreator(),_o=ke,ld=ke;var{div:te,slot:el,span:rd,button:dd}=x;class Ht extends f{static preferredTagName="tosi-tabs";static initAttributes={localized:!1};value=0;makeTab(n,e,t){let i=e.getAttribute("name"),o=e.querySelector('template[role="tab"]')?.content.cloneNode(!0)||(this.localized?zn(i):rd(i));return te(o,{part:"tab",tabindex:0,role:"tab",ariaControls:t},e.hasAttribute("data-close")?dd({title:"close",class:"close"},m.x()):{})}static shadowStyleSpec={":host":{"--tosi-tabs-selected-color":"var(--xin-tabs-selected-color, var(--tosi-accent, currentColor))","--tosi-tabs-bar-color":"var(--xin-tabs-bar-color, #ccc)","--tosi-tabs-bar-height":"var(--xin-tabs-bar-height, 2px)",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",boxShadow:"none !important"},slot:{position:"relative",display:"block",flex:"1",overflow:"hidden",overflowY:"auto"},'slot[name="after-tabs"]':{flex:"0 0 auto"},"::slotted([hidden])":{display:"none !important"},":host::part(tabpanel)":{display:"flex",flexDirection:"column",overflowX:"auto"},":host::part(tabrow)":{display:"flex"},":host .tabs":{display:"flex",userSelect:"none",whiteSpace:"nowrap"},":host .tabs > div":{padding:`${d.spacing50} ${d.spacing}`,cursor:"default",display:"flex",alignItems:"baseline"},':host .tabs > [aria-selected="true"]':{"--text-color":d.tosiTabsSelectedColor,color:d.textColor},":host .elastic":{flex:"1"},":host .border":{background:d.tosiTabsBarColor},":host .border > .selected":{content:" ",width:0,height:d.tosiTabsBarHeight,background:d.tosiTabsSelectedColor,transition:"ease-out 0.2s"},":host button.close":{border:0,background:"transparent",textAlign:"center",marginLeft:d.spacing50,padding:0},":host button.close > svg":{height:"12px"}};onCloseTab=null;content=[te({role:"tabpanel",part:"tabpanel"},te({part:"tabrow"},te({class:"tabs",part:"tabs"}),te({class:"elastic"}),el({name:"after-tabs"})),te({class:"border"},te({class:"selected",part:"selected"}))),el()];addTabBody(n,e=!1){if(!n.hasAttribute("name"))throw console.error("element has no name attribute",n),Error("element has no name attribute");if(this.append(n),this.setupTabs(),e)this.value=this.bodies.length-1;this.queueRender()}removeTabBody(n){n.remove(),this.setupTabs(),this.queueRender()}keyTab=(n)=>{let{tabs:e}=this.parts,t=[...e.children].indexOf(n.target);switch(n.key){case"ArrowLeft":this.value=(t+Number(e.children.length)-1)%e.children.length,e.children[this.value].focus(),n.preventDefault();break;case"ArrowRight":this.value=(t+1)%e.children.length,e.children[this.value].focus(),n.preventDefault();break;case" ":this.pickTab(n),n.preventDefault();break;default:}};get bodies(){return[...this.children].filter((n)=>n.hasAttribute("name"))}pickTab=(n)=>{let{tabs:e}=this.parts,t=n.target,i=t.closest("button.close")!==null,o=t.closest(".tabs > div"),s=[...e.children].indexOf(o);if(i){let a=this.bodies[s];if(!this.onCloseTab||this.onCloseTab(a)!==!1)this.removeTabBody(this.bodies[s])}else if(s>-1)this.value=s};setupTabs=()=>{let{tabs:n}=this.parts,e=[...this.children].filter((t)=>!t.hasAttribute("slot")&&t.hasAttribute("name"));if(n.textContent="",this.value>=e.length)this.value=e.length-1;for(let t in e){let i=e[t],o=`${this.instanceId}-${t}`;i.id=o;let s=this.makeTab(this,i,o);n.append(s)}};connectedCallback(){super.connectedCallback();let{tabs:n}=this.parts;n.addEventListener("click",this.pickTab),n.addEventListener("keydown",this.keyTab),this.setupTabs(),An.allInstances.add(this)}disconnectedCallback(){super.disconnectedCallback(),An.allInstances.delete(this)}localeChanged=()=>{this.queueRender()};onResize(){this.queueRender()}render(){let{tabs:n,selected:e}=this.parts,t=this.bodies;for(let i=0;i<t.length;i++){let o=t[i],s=n.children[i];if(this.value===Number(i))s.setAttribute("aria-selected","true"),e.style.marginLeft=`${s.offsetLeft-n.offsetLeft}px`,e.style.width=`${s.offsetWidth}px`,o.toggleAttribute("hidden",!1);else s.toggleAttribute("aria-selected",!1),o.toggleAttribute("hidden",!0)}}}var hd=Ht,Ee=Ht.elementCreator(),cd=Ee,pd=Ee;var nt=(async()=>{}).constructor;function Gn(n,e){let t=n;for(let i of e)t=t.replace(new RegExp(`import \\{([^}]*)\\} from '${i}'`,"g"),(o,s)=>{return`const { ${s.replace(/\s+/g," ").trim()} } = ${i.replace(/-/g,"")}`});return t}async function tl(n,e,t){let i=Gn(n,Object.keys(e)),o=t(i,{transforms:["typescript"]}).code,s=Object.keys(e).map((l)=>l.replace(/-/g,"")),a=Object.values(e);await new nt(...s,o)(...a)}var ud=(n,e)=>{if(e.transforms.includes("typescript"))throw Error('TypeScript examples require the "sucrase" package. Install it with: npm install sucrase');return{code:n}},yd="https://cdn.jsdelivr.net/npm/sucrase@3.35.0/+esm";async function Zt(){try{let{transform:n}=await import("sucrase");return n}catch{}try{let{transform:n}=await import(yd);return n}catch{return console.warn("sucrase not available — TypeScript examples will not work. "+"Install with: npm install sucrase"),ud}}var Mt="live-example-payload";function il(n,e,t){return t!==""?`${n}-${t}`:`${n}-${e}`}function Do(n,e){try{localStorage.setItem(n,JSON.stringify(e))}catch(t){console.warn("live-example: failed to write to localStorage",t)}}function md(n){if(n===null)return null;try{return JSON.parse(n)}catch{return null}}function ol(n,e,t,i,o){let s=location.href.split("?")[0]+`?${n}=${e}`;Do(t,{remoteKey:i,sentAt:Date.now(),...o}),window.open(s)}var gd=typeof BroadcastChannel<"u";class et{storageKey;remoteKey;lastUpdate=0;interval;channel;listening=!1;onReceive;constructor(n,e,t){this.storageKey=n,this.remoteKey=e,this.onReceive=t}handlePayload=(n)=>{if(n.sentAt<=this.lastUpdate)return;if(n.remoteKey!==this.remoteKey)return;this.lastUpdate=n.sentAt,this.onReceive(n)};handleMessage=(n)=>{let e=n.data;if(e)this.handlePayload(e)};handlePoll=()=>{let n=null;try{n=localStorage.getItem(this.storageKey)}catch{return}let e=md(n);if(e)this.handlePayload(e)};startListening(){if(this.listening)return;if(this.listening=!0,gd)this.channel=new BroadcastChannel(this.storageKey),this.channel.onmessage=this.handleMessage;this.interval=setInterval(this.handlePoll,500)}stopListening(){if(!this.listening)return;if(this.listening=!1,this.channel)this.channel.close(),this.channel=void 0;if(this.interval)clearInterval(this.interval),this.interval=void 0}send(n){let e={remoteKey:this.remoteKey,sentAt:Date.now(),...n};if(Do(this.storageKey,e),this.channel)this.channel.postMessage(e)}sendClose(){let n={remoteKey:this.remoteKey,sentAt:Date.now(),css:"",html:"",js:"",close:!0};if(Do(this.storageKey,n),this.channel)this.channel.postMessage(n)}}var{div:sl}=x;function xd(n,e){let t=n.customElements;if(!t)return;let i=(s)=>{if(!s||t.get(s))return;let a=customElements.get(s);if(a)try{t.define(s,a)}catch{}};for(let s of Object.values(e))if(s&&typeof s==="object"){for(let a of Object.values(s))if(typeof a==="function"&&"tagName"in a)i(a.tagName)}let o=n.document;if(o){let s=o.querySelectorAll("*");for(let a of s){let r=a.tagName.toLowerCase();if(r.includes("-"))i(r)}}}async function Jt(n){let{html:e,css:t,js:i,context:o,transform:s,exampleElement:a,styleElement:r,widgetsElement:l,onError:h}=n,c=sl({class:"preview"});c.innerHTML=e,r.innerText=t;let p=a.querySelector(".preview");if(p)p.replaceWith(c);else a.insertBefore(c,l);let y={preview:c,...o};try{let w=Gn(i,Object.keys(o)),g=s(w,{transforms:["typescript"]}).code,k=Object.keys(y).map((A)=>A.replace(/-/g,"")),j=Object.values(y);await new nt(...k,g)(...j)}catch(w){if(console.error(w),c.append(sl({class:"preview-error"},String(w.message||w))),h)h(w);else window.alert(`Error: ${w}, the console may have more information…`)}return c}async function Lt(n){let{html:e,css:t,js:i,context:o,transform:s,exampleElement:a,widgetsElement:r,onError:l}=n,h=a.querySelector("iframe.preview-iframe");if(!h){h=document.createElement("iframe"),h.className="preview-iframe",h.style.cssText="width: 100%; height: 100%; border: none;";let g=a.querySelector(".preview");if(g)g.replaceWith(h);else a.insertBefore(h,r)}let c=h.contentDocument;if(!c)return console.error("Could not access iframe document"),null;let p=h.contentWindow;if(o.tosijs)p.tosijs=o.tosijs;if(o["tosijs-ui"])p.tosijsui=o["tosijs-ui"];c.open(),c.write(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; }
    .preview { height: 100%; position: relative; }
    ${t}
  </style>
</head>
<body>
  <div class="preview">${e}</div>
</body>
</html>`),c.close(),xd(p,o);let y=c.querySelector(".preview");if(!y)return console.error("Could not find preview element in iframe"),null;let w={preview:y,...o};try{let g=Gn(i,Object.keys(o)),k=s(g,{transforms:["typescript"]}).code,j=p.eval("(async () => {}).constructor"),B=Object.keys(w).map((R)=>R.replace(/-/g,"")),A=Object.values(w);await new j(...B,k)(...A)}catch(g){console.error(g);let k=c.createElement("div");if(k.className="preview-error",k.textContent=String(g.message||g),y.append(k),l)l(g);else window.alert(`Error: ${g}, the console may have more information…`)}return y}function Et(n,e,t,i){let o=[...n.querySelectorAll(".language-html,.language-js,.language-css,.language-test")].filter((s)=>!s.closest(i)).map((s)=>({block:s.parentElement,language:s.classList[0].split("-").pop(),code:s.innerText}));for(let s=0;s<o.length;s+=1){let a=[o[s]];while(s<o.length-1&&o[s].block.nextElementSibling===o[s+1].block)a.push(o[s+1]),s+=1;let r=t({context:e});a[0].block.parentElement.insertBefore(r,a[0].block),a.forEach((h)=>{switch(h.language){case"js":r.js=h.code;break;case"html":r.html=h.code;break;case"css":r.css=h.code;break;case"test":r.test=h.code;break}h.block.remove()}),r.showDefaultTab()}}var al={":host":{"--tosi-example-height":"320px","--code-editors-bar-bg":"#777","--code-editors-bar-color":"#fff","--widget-bg":"#fff8","--widget-color":"#000",position:"relative",display:"flex",height:"var(--tosi-example-height)",background:"var(--background)",boxSizing:"border-box"},":host.-maximize":{position:"fixed",left:"0",top:"0",height:"100vh",width:"100vw",margin:"0 !important"},".-maximize":{zIndex:101},":host.-vertical":{flexDirection:"column"},":host .layout-indicator":{transition:"0.5s ease-out",transform:"rotateZ(270deg)"},":host.-vertical .layout-indicator":{transform:"rotateZ(180deg)"},":host.-maximize .hide-if-maximized, :host:not(.-maximize) .show-if-maximized":{display:"none"},':host [part="example"]':{flex:"1 1 50%",height:"100%",position:"relative",overflowX:"auto"},":host .preview":{height:"100%",position:"relative",overflow:"hidden",boxShadow:"inset 0 0 0 2px #8883"},":host .preview-error":{padding:"8px 12px",margin:"8px",background:"#fee",color:"#900",borderRadius:"4px",fontSize:"13px",fontFamily:"system-ui, sans-serif",whiteSpace:"pre-wrap"},':host [part="editors"]':{flex:"1 1 200px",height:"100%",position:"relative"},':host [part="exampleWidgets"]':{position:"absolute",left:"5px",bottom:"5px","--widget-color":"var(--brand-color)",borderRadius:"5px",width:"44px",height:"44px",lineHeight:"44px",zIndex:"100"},':host [part="exampleWidgets"] svg':{stroke:"var(--widget-color)"},":host .code-editors":{overflow:"hidden",background:"white",position:"relative",top:"0",right:"0",flex:"1 1 50%",height:"100%",flexDirection:"column",zIndex:"10"},":host .code-editors:not([hidden])":{display:"flex"},":host .code-editors > h4":{padding:"5px",margin:"0",textAlign:"center",background:"var(--code-editors-bar-bg)",color:"var(--code-editors-bar-color)",cursor:"move"},":host button.transparent, :host .sizer":{width:"32px",height:"32px",lineHeight:"32px",textAlign:"center",padding:"0",margin:"0"},":host .sizer":{cursor:"nwse-resize"},':host [part="testIndicator"]':{position:"absolute",top:"8px",right:"8px",width:"12px",height:"12px",borderRadius:"50%",background:"#888",zIndex:"100",display:"none"},':host.-has-tests [part="testIndicator"]':{display:"block",opacity:"var(--tests-enabled, 1)"},':host.-test-running [part="testIndicator"]':{background:"#fa0",animation:"test-pulse 0.5s ease-in-out infinite"},':host.-test-passed [part="testIndicator"]':{background:"#0a0",animation:"test-fade 2s ease-out forwards"},':host.-test-failed [part="testIndicator"]':{background:"#c00",animation:"test-pulse 1s ease-in-out infinite"},"@keyframes test-pulse":{"0%, 100%":{opacity:"1"},"50%":{opacity:"0.4"}},"@keyframes test-fade":{"0%":{opacity:"1"},"50%":{opacity:"1"},"100%":{opacity:"0"}},':host.-test-passed [part="exampleWidgets"]':{"--widget-color":"#0a0"},':host.-test-failed [part="exampleWidgets"]':{"--widget-color":"#f00"},':host [part="testResults"]':{position:"absolute",bottom:"54px",left:"5px",background:"var(--widget-bg)",borderRadius:"5px",padding:"8px",fontSize:"14px",margin:"0",maxWidth:"400px",maxHeight:"200px",overflow:"auto",zIndex:"100"},':host [part="testResults"][hidden]':{display:"none"},":host .test-pass":{color:"#0a0"},":host .test-fail":{color:"#f00"}};class No extends Error{constructor(n){super(n);this.name="AssertionError"}}function ll(n,e){if(n===e)return!0;if(typeof n!==typeof e)return!1;if(n===null||e===null)return n===e;if(typeof n!=="object")return!1;let t=n,i=e;if(Array.isArray(t)!==Array.isArray(i))return!1;let o=Object.keys(t),s=Object.keys(i);if(o.length!==s.length)return!1;return o.every((a)=>ll(t[a],i[a]))}var bd=5000,fd={stringify(n){if(typeof n>"u")return"undefined";if(n===null)return"null";if(typeof Element<"u"&&n instanceof Element)return`<${n.tagName.toLowerCase()}>`;if(typeof Node<"u"&&n instanceof Node)return`[${n.nodeName}]`;try{return JSON.stringify(n)}catch{return String(n)}}},{stringify:Pn}=fd;function rl(n,e=!1){let t=(o,s)=>{if(!(e?!o:o))throw new No(e?`not: ${s}`:s)};return{toBe(o){t(n===o,`Expected ${Pn(n)} to be ${Pn(o)}`)},toEqual(o){t(ll(n,o),`Expected ${Pn(n)} to equal ${Pn(o)}`)},toBeTruthy(){t(!!n,`Expected ${Pn(n)} to be truthy`)},toBeFalsy(){t(!n,`Expected ${Pn(n)} to be falsy`)},toBeNull(){t(n===null,`Expected ${Pn(n)} to be null`)},toBeUndefined(){t(n===void 0,`Expected ${Pn(n)} to be undefined`)},toBeDefined(){t(n!==void 0,`Expected ${Pn(n)} to be defined`)},toContain(o){if(typeof n==="string")t(n.includes(o),`Expected "${n}" to contain "${o}"`);else if(Array.isArray(n))t(n.includes(o),`Expected array to contain ${Pn(o)}`);else throw new No("toContain requires string or array")},toHaveLength(o){let s=n.length;t(s===o,`Expected length ${s} to be ${o}`)},toMatch(o){t(o.test(n),`Expected "${n}" to match ${o}`)},toBeGreaterThan(o){t(n>o,`Expected ${n} to be greater than ${o}`)},toBeLessThan(o){t(n<o,`Expected ${n} to be less than ${o}`)},toBeInstanceOf(o){t(n instanceof o,`Expected value to be instance of ${o.name}`)},get not(){return rl(n,!e)}}}function Uo(n){return rl(n)}function wd(n){return new Promise((e)=>setTimeout(e,n))}function vd(n,e,t=1000){return new Promise((i,o)=>{let s=Date.now(),a=()=>{let r=n.querySelector(e);if(r){i(r);return}if(Date.now()-s>=t){o(Error(`Timeout waiting for "${e}" after ${t}ms`));return}requestAnimationFrame(a)};a()})}function kd(n,e,t){return Promise.race([n,new Promise((i,o)=>setTimeout(()=>o(Error(`Test "${t}" timed out after ${e}ms`)),e))])}function Ro(n,e=bd){let t="",i=[];return{pending:i,expect:Uo,test(o,s){let a=t?`${t} > ${o}`:o;try{let r=s();if(r instanceof Promise){let l=kd(r,e,a).then(()=>{n.push({name:a,passed:!0})}).catch((h)=>{n.push({name:a,passed:!1,error:h.message})});i.push(l)}else n.push({name:a,passed:!0})}catch(r){n.push({name:a,passed:!1,error:r.message})}},describe(o,s){let a=t;t=t?`${t} > ${o}`:o,s(),t=a}}}async function ni(n,e,t,i){let o=[],s=Ro(o),a={preview:e,...t,expect:s.expect,test:s.test,describe:s.describe,waitMs:wd,waitFor:(r,l)=>vd(e,r,l)};try{let r=Gn(n,Object.keys(t)),l=i(r,{transforms:["typescript"]}).code,h=Object.keys(a).map((y)=>y.replace(/-/g,"")),c=Object.values(a);await new nt(...h,l)(...c)}catch(r){o.push({name:"Test execution",passed:!1,error:r.message})}if(s.pending.length>0)await Promise.all(s.pending);return{passed:o.filter((r)=>r.passed).length,failed:o.filter((r)=>!r.passed).length,tests:o}}var{div:Ce,xinSlot:Cd,style:jd,button:ie,pre:dl,span:hl}=x,Xo="tosijs-ui-tests-enabled",Bd=typeof window<"u"&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1");function Sd(){if(typeof localStorage>"u")return!1;let n=localStorage.getItem(Xo);if(n!==null)return n==="true";return Bd}var{testManager:un}=H({testManager:{enabled:Sd()}});function ei(){document.body.classList.toggle("tests-enabled",un.enabled.value),document.body.style.setProperty("--tests-enabled",un.enabled.value?"1":"0")}if(typeof document<"u")if(document.body)ei();else document.addEventListener("DOMContentLoaded",ei);function Fo(){localStorage.setItem(Xo,"true"),un.enabled.value=!0,ei(),document.querySelectorAll("tosi-example").forEach((n)=>{n.refresh()})}function Wo(){localStorage.setItem(Xo,"false"),un.enabled.value=!1,ei()}class In extends f{static preferredTagName="tosi-example";static lightStyleSpec=al;static initAttributes={persistToDom:!1,iframe:!1};prefix="lx";storageKey=Mt;context={};uuid=crypto.randomUUID();remoteId="";remoteSync;undoInterval;testResults;pendingValues={};pendingShowDefaultTab=!1;beforeUnloadHandler;static insertExamples(n,e={}){Et(n,e,ti,In.tagName)}get activeTab(){let{editors:n}=this.parts;return[...n.children].find((e)=>e.getAttribute("hidden")===null)}get hydrated(){try{return this.parts.js!==void 0}catch{return!1}}getEditorValue(n){if(!this.hydrated)return this.pendingValues[n]??"";return this.parts[n].value}setEditorValue(n,e){if(!this.hydrated){this.pendingValues[n]=e;return}let t=this.parts[n];t.value=e}flushPendingValues(){for(let[n,e]of Object.entries(this.pendingValues)){let t=this.parts[n];if(t)t.value=e}if(this.pendingValues={},this.pendingShowDefaultTab)this.pendingShowDefaultTab=!1,this.showDefaultTab()}get css(){return this.getEditorValue("css")}set css(n){this.setEditorValue("css",n)}get html(){return this.getEditorValue("html")}set html(n){this.setEditorValue("html",n)}get js(){return this.getEditorValue("js")}set js(n){this.setEditorValue("js",n)}get test(){return this.getEditorValue("test")}set test(n){this.setEditorValue("test",n)}get remoteKey(){return il(this.prefix,this.uuid,this.remoteId)}updateUndo=()=>{let{activeTab:n}=this,{undo:e,redo:t}=this.parts;if(n instanceof Ln&&n.editor!==void 0){let i=n.editor.session.getUndoManager();e.disabled=!i.hasUndo(),t.disabled=!i.hasRedo()}else e.disabled=!0,t.disabled=!0;this.updateTestResultsVisibility()};updateTestResultsVisibility(){let{testResults:n}=this.parts,e=this.testResults,t=this.activeTab?.getAttribute("name")==="test",i=e&&e.failed>0;n.hidden=!e||e.tests.length===0||!t&&!i}undo=()=>{let{activeTab:n}=this;if(n instanceof Ln)n.editor.undo()};redo=()=>{let{activeTab:n}=this;if(n instanceof Ln)n.editor.redo()};get isMaximized(){return this.classList.contains("-maximize")}flipLayout=()=>{this.classList.toggle("-vertical")};exampleMenu=()=>{let n=un.enabled.value;X({target:this.parts.exampleWidgets,width:"auto",menuItems:[{icon:"edit2",caption:"view/edit code",action:this.showCode},{icon:"edit",caption:"view/edit code in a new window",action:this.openEditorWindow},null,{icon:this.isMaximized?"minimize":"maximize",caption:this.isMaximized?"restore preview":"maximize preview",action:this.toggleMaximize},null,{icon:n?"check":"",caption:"Run tests",action:()=>{if(n)Wo();else Fo()}}]})};handleShortcuts=(n)=>{if(n.metaKey||n.ctrlKey){let e=!1;switch(n.key){case"s":case"r":this.refresh(),e=!0;break;case"/":this.flipLayout();break;case"c":if(n.shiftKey)this.copy(),e=!0;break}if(e)n.preventDefault(),n.stopPropagation()}};content=()=>[Ce({part:"example"},jd({part:"style"}),Ce({part:"testIndicator",title:"test status"}),dl({part:"testResults",hidden:!0}),ie({title:"example menu",part:"exampleWidgets",onClick:this.exampleMenu},m.code())),Ce({class:"code-editors",part:"codeEditors",onKeydown:this.handleShortcuts,hidden:!0},Ee({part:"editors",onChange:this.updateUndo},me({name:"js",mode:"javascript",part:"js"}),me({name:"html",mode:"html",part:"html"}),me({name:"css",mode:"css",part:"css"}),me({name:"test",mode:"javascript",part:"test"}),Ce({slot:"after-tabs",class:"row"},ie({title:"undo",part:"undo",class:"transparent",onClick:this.undo},m.cornerUpLeft()),ie({title:"redo",part:"redo",class:"transparent",onClick:this.redo},m.cornerUpRight()),ie({title:"flip direction (⌘/ | ^/)",class:"transparent",onClick:this.flipLayout},m.columns({class:"layout-indicator"})),ie({title:"copy as markdown (⌘⇧C | ^⇧C)",class:"transparent",onClick:this.copy},m.copy()),ie({title:"reload (⌘R | ^R)",class:"transparent",onClick:this.refreshRemote},m.refreshCw()),ie({title:"close code",class:"transparent",onClick:this.closeCode},m.x())))),Cd({part:"sources",hidden:!0})];connectedCallback(){super.connectedCallback(),this.flushPendingValues();let{sources:n}=this.parts;this.initFromElements([...n.children]),this.remoteSync=new et(this.storageKey,this.remoteKey,(t)=>{if(t.close){if(this.remoteId!=="")window.close();else this.classList.remove("-maximize"),this.parts.codeEditors.hidden=!0;return}if(this.css=t.css,this.html=t.html,this.js=t.js,t.test)this.test=t.test;this.refresh()}),this.remoteSync.startListening();let e=Math.random()*100;this.undoInterval=setInterval(()=>{if(!document.hidden)this.updateUndo()},250+e),this.beforeUnloadHandler=()=>this.remoteSync?.sendClose(),addEventListener("beforeunload",this.beforeUnloadHandler)}disconnectedCallback(){if(super.disconnectedCallback(),this.remoteSync?.sendClose(),this.remoteSync?.stopListening(),this.undoInterval)clearInterval(this.undoInterval),this.undoInterval=void 0;if(this.beforeUnloadHandler)removeEventListener("beforeunload",this.beforeUnloadHandler),this.beforeUnloadHandler=void 0}copy=()=>{let n=this.js!==""?"```js\n"+this.js.trim()+"\n```\n":"",e=this.html!==""?"```html\n"+this.html.trim()+"\n```\n":"",t=this.css!==""?"```css\n"+this.css.trim()+"\n```\n":"",i=this.test!==""?"```test\n"+this.test.trim()+"\n```\n":"";navigator.clipboard.writeText(n+e+t+i)};toggleMaximize=()=>{this.classList.toggle("-maximize")};showCode=()=>{this.classList.add("-maximize"),this.classList.toggle("-vertical",this.offsetHeight>this.offsetWidth),this.parts.codeEditors.hidden=!1};closeCode=()=>{if(this.remoteId!=="")this.remoteSync?.sendClose(),window.close();else this.remoteSync?.sendClose(),this.classList.remove("-maximize"),this.parts.codeEditors.hidden=!0};openEditorWindow=()=>{let{css:n,html:e,js:t,test:i}=this;ol(this.prefix,this.uuid,this.storageKey,this.remoteKey,{css:n,html:e,js:t,test:i}),this.classList.add("-maximize")};refreshRemote=()=>{this.remoteSync?.send({css:this.css,html:this.html,js:this.js,test:this.test})};updateSources=()=>{if(this.persistToDom){let{sources:n}=this.parts;n.innerText="";for(let e of["js","css","html","test"])if(this[e])n.append(dl({class:`language-${e}`,innerHTML:this[e]}))}};refresh=async()=>{if(this.remoteId!=="")return;let n=await Zt(),{example:e,style:t,exampleWidgets:i}=this.parts,o,s,a=(r)=>{s=r};if(this.iframe)o=await Lt({html:this.html,css:this.css,js:this.js,context:this.context,transform:n,exampleElement:e,widgetsElement:i,onError:a});else o=await Jt({html:this.html,css:this.css,js:this.js,context:this.context,transform:n,exampleElement:e,styleElement:t,widgetsElement:i,onError:a});if(this.persistToDom)this.updateSources();if((this.test||s)&&o&&un.enabled.value){if(this.classList.add("-has-tests","-test-running"),this.classList.remove("-test-passed","-test-failed"),this.testResults=this.test?await ni(this.test,o,this.context,n):{passed:0,failed:0,tests:[]},s)this.testResults.failed+=1,this.testResults.tests.unshift({name:"example loads without error",passed:!1,error:String(s)});this.classList.remove("-test-running"),this.displayTestResults()}else this.classList.remove("-has-tests","-test-running","-test-passed","-test-failed")};displayTestResults(){let{testResults:n,testIndicator:e}=this.parts,t=this.testResults;if(!t||t.tests.length===0){n.hidden=!0,this.classList.remove("-test-passed","-test-failed"),e.title="no tests";return}n.innerHTML="";let i=Ce({style:{marginBottom:"8px",fontWeight:"bold"}},`${t.passed}/${t.tests.length} tests passed`);n.append(i);for(let o of t.tests){let s=o.passed?"✓":"✗",a=o.passed?"test-pass":"test-fail",r=Ce({class:a},hl(s+" "),o.name,o.error?hl({style:{opacity:"0.7"}},` - ${o.error}`):"");n.append(r)}this.classList.toggle("-test-passed",t.failed===0),this.classList.toggle("-test-failed",t.failed>0),e.title=t.failed===0?`${t.passed} tests passed`:`${t.failed}/${t.tests.length} tests failed`,this.updateTestResultsVisibility(),this.dispatchEvent(new CustomEvent("testcomplete",{bubbles:!0,detail:{results:t,element:this}}))}initFromElements(n){for(let e of n){e.hidden=!0;let[t,...i]=e.innerHTML.split(`
`);if(["js","html","css","test"].includes(t)){let o=i.filter((a)=>a.trim()!=="").map((a)=>a.match(/^\s*/)[0].length).sort()[0],s=(o>0?i.map((a)=>a.substring(o)):i).join(`
`);this.setEditorValue(t,s)}else{let o=["js","html","css","test"].find((s)=>e.matches(`.language-${s}`));if(o)this.setEditorValue(o,o==="html"?e.innerHTML:e.innerText)}}}showDefaultTab(){if(!this.hydrated){this.pendingShowDefaultTab=!0;return}let{editors:n}=this.parts;if(this.js!=="")n.value=0;else if(this.html!=="")n.value=1;else if(this.css!=="")n.value=2;else if(this.test!=="")n.value=3}render(){if(super.render(),this.remoteId!==""){let n=localStorage.getItem(this.storageKey);if(n!==null){let e=JSON.parse(n);if(this.remoteKey!==e.remoteKey)return;if(this.css=e.css,this.html=e.html,this.js=e.js,e.test)this.test=e.test;this.parts.example.hidden=!0,this.parts.codeEditors.hidden=!1,this.classList.add("-maximize"),this.updateUndo()}}else this.refresh()}}var ti=In.elementCreator(),Ad=new URL(window.location.href).searchParams,cl=Ad.get("lx");if(cl)document.title+=" [code editor]",document.body.textContent="",document.body.append(ti({remoteId:cl}));var{slot:pl}=x;class oe extends f{static preferredTagName="tosi-sidenav";static initAttributes={minSize:800,navSize:200,compact:!1,contentVisible:!1};value="normal";content=[pl({name:"nav",part:"nav"}),pl({part:"content"})];static shadowStyleSpec={":host":{display:"grid",gridTemplateColumns:`${u.navWidth("50%")} ${u.contentWidth("50%")}`,gridTemplateRows:"100%",position:"relative",margin:u.margin("0 0 0 -100%"),transition:u.sideNavTransition("0.25s ease-out")},":host slot":{position:"relative"},":host slot:not([name])":{display:"block"},':host slot[name="nav"]':{display:"block"}};onResize=()=>{let{content:n}=this.parts,e=this.offsetParent;if(e===null)return;let t=this.value;if(this.compact=e.offsetWidth<this.minSize,[...this.childNodes].find((o)=>o instanceof Element?o.getAttribute("slot")!=="nav":!0)===void 0)t="compact/nav",this.style.setProperty("--nav-width","100%"),this.style.setProperty("--content-width","0%");else if(!this.compact)t="normal",n.classList.add("-tosi-sidenav-visible"),this.style.setProperty("--nav-width",`${this.navSize}px`),this.style.setProperty("--content-width",`calc(100% - ${this.navSize}px)`),this.style.setProperty("--margin","0");else if(n.classList.remove("-tosi-sidenav-visible"),this.style.setProperty("--nav-width","50%"),this.style.setProperty("--content-width","50%"),this.contentVisible)t="compact/content",this.style.setProperty("--margin","0 0 0 -100%");else t="compact/nav",this.style.setProperty("--margin","0 -100% 0 0");if(this.value!==t)this.value=t};observer;connectedCallback(){super.connectedCallback(),this.contentVisible=this.parts.content.childNodes.length===0,globalThis.addEventListener("resize",this.onResize),this.observer=new MutationObserver(this.onResize),this.observer.observe(this,{childList:!0}),this.style.setProperty("--side-nav-transition","0s"),setTimeout(()=>{this.style.removeProperty("--side-nav-transition")},250)}disconnectedCallback(){super.disconnectedCallback(),this.observer.disconnect()}render(){super.render(),this.onResize()}}var ii=oe,tt=oe.elementCreator(),Go=tt,zd=tt;var{div:Yo,span:it,a:Yn,header:Od,button:ul,template:Pd,input:Id,h2:Td}=x,je={pass:u.testColorPass("#0a0"),fail:u.testColorFail("#c00"),running:u.testColorRunning("#fa0")},Vd={"@keyframes test-pulse":{"0%, 100%":{opacity:"1"},"50%":{opacity:"0.7"}},"@keyframes test-appear":{from:{opacity:"0",transform:"scale(0.8)"},to:{opacity:"1",transform:"scale(1)"}},"@keyframes test-fade":{"0%, 20%":{opacity:"1",transform:"scale(1)"},"70%":{opacity:"1",transform:"scale(1.1)"},"100%":{opacity:"0",transform:"scale(0.9)",pointerEvents:"none"}},"body:not(.tests-enabled) .doc-link::after, body:not(.tests-enabled) .test-widget":{display:"none !important"},".doc-link.-test-passed::after, .doc-link.-test-failed::after":{content:"''",width:d.fontSize50,height:d.fontSize50,borderRadius:"50%",marginLeft:d.spacing50,display:"inline-block",verticalAlign:"middle"},".doc-link.-test-passed::after":{background:je.pass},".doc-link.-test-failed::after":{background:je.fail,animation:"test-pulse 2s ease-in-out infinite"},".test-widget":{_testBg:je.running,position:"fixed",bottom:d.spacing,right:d.spacing,zIndex:"1000",background:d.testBg,color:"white",gap:d.spacing50},".test-widget[hidden]":{display:"none"},".test-widget.-running":{_testBg:je.running,animation:"test-appear 0.3s ease-out, test-pulse 2s ease-in-out 0.3s infinite"},".test-widget.-passed":{_testBg:je.pass,animation:"test-fade 3s ease-out forwards"},".test-widget.-failed":{_testBg:je.fail,animation:"test-pulse 2s ease-in-out infinite"},".test-widget .count":{background:"white",color:d.testBg,borderRadius:"50%",width:d.lineHeight,height:d.lineHeight,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold"}};function qd(n){let{docs:e,context:t={},projectName:i="",projectLinks:o={},navSize:s=200,minSize:a=600}=n;for(let b of e)b.testStatus=void 0;let r=document.location.search!==""?document.location.search.substring(1).split("&")[0]:e[0]?.filename||"README.md",l=e.find((b)=>b.filename===r)||e[0],{app:h}=H({app:{docs:e,currentDoc:l,compact:!1}}),c={},p,y=!1,w=0,g=0;window.__docTestResults=new Promise((b)=>{p=b});let k=(b)=>{let C=c[b],O=h.docs.find((N)=>N.filename===b);if(O)O.testStatus=C?C.passed?"passed":"failed":void 0},j=()=>{if(g>=w&&p){let b={passed:0,failed:0,pages:c};for(let C of Object.values(c))b.passed+=C.totalPassed,b.failed+=C.totalFailed;if(p(b),p=void 0,B)fetch("/report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}).catch(()=>{})}},B=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1",A=(b)=>{let{results:C}=b.detail,O=String(h.currentDoc.filename);c[O]={passed:C.failed===0,tests:[...C.tests],totalPassed:C.passed,totalFailed:C.failed},k(O)},V=(b)=>{g++,j(),xi()};sn.docLink={toDOM(b,C){b.setAttribute("href",`?${C}`)}},sn.current={toDOM(b,C){let O=b.getAttribute("href")||"";b.classList.toggle("current",C===O.substring(1))}},sn.testStatus={toDOM(b,C){if(b.classList.remove("-test-passed","-test-failed"),C==="passed")b.classList.add("-test-passed");else if(C==="failed")b.classList.add("-test-failed")}};let R=Jn(()=>{let b=T.value.toLocaleLowerCase();h.docs.forEach((C)=>{C.hidden=!C.title.toLocaleLowerCase().includes(b)&&!C.text.toLocaleLowerCase().includes(b)}),E(h.docs)}),T=Id({slot:"nav",placeholder:"search",type:"search",style:{width:"calc(100% - 10px)",margin:"5px"},onInput:R});window.addEventListener("popstate",()=>{let b=window.location.search.substring(1);h.currentDoc=h.docs.find((C)=>C.filename===b)||h.docs[0]});let S=[ul({class:"iconic",style:{color:d.linkColor},title:"navigation",bind:{value:h.compact,binding:{toDOM(b,C){b.style.display=C?"":"none",b.nextSibling.style.display=C?"":"none"}}},onClick(){let b=document.querySelector(oe.tagName);b.contentVisible=!b.contentVisible}},m.menu()),it({style:{flex:"0 0 10px"}})];if(i)S.push(Yn({href:"/",style:{display:"flex",alignItems:"center",borderBottom:"none"}},o.tosijs?m.tosiUi({style:{_xinIconSize:40,marginRight:10}}):it(),Td(i)));if(S.push(it({class:"elastic"})),o.tosijs)S.push(Yn({class:"iconic",title:"tosijs",target:"_blank"},m.tosi(),{href:o.tosijs}));if(o.discord)S.push(Yn({class:"iconic",title:"discord",target:"_blank"},m.discord(),{href:o.discord}));if(o.blog)S.push(Yn({class:"iconic",title:"blog",target:"_blank"},m.blog(),{href:o.blog}));if(o.github)S.push(Yn({class:"iconic",title:"github",target:"_blank"},m.github(),{href:o.github}));if(o.npm)S.push(Yn({class:"iconic",title:"npmjs",target:"_blank"},m.npm(),{href:o.npm}));let z=Yo({style:{display:"flex",flexDirection:"column",maxWidth:"100vw",height:"100vh",overflow:"hidden"}},Od(...S),tt({name:"Documentation",navSize:s,minSize:a,style:{flex:"1 1 auto",overflow:"hidden"},onChange(){let b=document.querySelector(oe.tagName);h.compact=b.compact}},T,Yo({slot:"nav",style:{display:"flex",flexDirection:"column",width:"100%",height:"calc(100% - 44px)",overflowY:"scroll"},bindList:{idPath:"filename",hiddenProp:"hidden",value:h.docs}},Pd(Yn({class:"doc-link",bindCurrent:"app.currentDoc.filename",bindDocLink:"^.filename",bindTestStatus:"^.testStatus",onClick(b){let C=b.target,O=mn(b.target),N=b.target.closest("tosi-sidenav");N.contentVisible=!0;let{href:Y}=C;window.history.pushState({href:Y},"",Y),h.currentDoc=O,b.preventDefault();let vn=String(O.filename),rn=c[vn];if(rn&&!rn.passed)setTimeout(()=>{let K=document.querySelector("tosi-example.-test-failed");if(K)K.scrollIntoView({behavior:"smooth",block:"center"})},100)}},zn({bindText:"^.title"})))),Yo({style:{position:"relative",overflowY:"scroll",height:"100%"}},Yn({class:"view-source",target:"_blank",style:{display:o.github?"flex":"none",alignItems:"center",gap:"6px",position:"fixed",top:"calc(var(--xin-header-height, 60px) + 5px)",right:"5px",fontSize:"0.875em",color:"var(--brand-color, inherit)",opacity:"0.7",borderBottom:"none",transition:"opacity 0.2s ease"},onMouseenter(b){b.target.style.opacity="0.9"},onMouseleave(b){b.target.style.opacity="0.7"},bind:{value:h.currentDoc,binding(b,C){if(o.github&&C.path&&C.path!=="README.md")b.href=`${o.github}/blob/main/${C.path}`,b.style.display="flex";else b.style.display="none"}}},m.github({style:{_xinIconSize:16}}),"View source on GitHub"),ke({style:{display:"block",maxWidth:"44em",margin:"auto",padding:"0 1em",overflow:"hidden"},bindValue:"app.currentDoc.text",didRender(){In.insertExamples(this,t)}}))));Bn("test-indicators",Vd);let _=ul({class:"test-widget",hidden:!0,onClick:Zl},it({part:"label"},"Tests"),it({class:"count",part:"count"},"0"));z.appendChild(_);let q=!1;function ln(){q=!0,_.hidden=!1,_.classList.remove("-passed","-failed"),_.classList.add("-running"),ht()}function ht(){let b=_.querySelector('[part="label"]'),C=_.querySelector('[part="count"]'),O=Object.values(c).reduce((Y,vn)=>Y+vn.totalPassed,0),N=Object.values(c).reduce((Y,vn)=>Y+vn.totalFailed,0);if(b)if(q)b.textContent="Running";else if(N>0)b.textContent="Failed";else if(O>0)b.textContent="Passed";else b.textContent="Tests";if(C)C.textContent=N>0?String(N):String(O)}function xi(){let b=Object.values(c).reduce((C,O)=>C+O.totalFailed,0);if(q&&g>=w)if(q=!1,_.classList.remove("-running"),b>0)_.classList.add("-failed"),_.classList.remove("-passed"),_.hidden=!1;else _.classList.add("-passed"),_.classList.remove("-failed"),_.hidden=!1;ht()}function Zl(){let b=Object.entries(c).filter(([,O])=>!O.passed),C=[];for(let[O,N]of b){let Y=e.find((rn)=>rn.filename===O),vn=N.tests.filter((rn)=>!rn.passed);for(let rn of vn)C.push({caption:`${Y?.title||O}: ${rn.name}`,action:()=>{let K=h.docs.find((yn)=>String(yn.filename)===O);if(K)window.history.pushState({href:`?${O}`},"",`?${O}`),h.currentDoc=K,setTimeout(()=>{let yn=document.querySelector("tosi-example.-test-failed");if(yn)yn.scrollIntoView({behavior:"smooth",block:"center"})},100)}})}if(C.length>0)C.push(null);C.push({icon:"copy",caption:"Copy test results to clipboard",action:()=>{let O=Ml();navigator.clipboard.writeText(O)}}),X({target:_,menuItems:C})}function Ml(){let b=["# Test Results",""],C=0,O=0;for(let[N,Y]of Object.entries(c)){let rn=e.find((K)=>K.filename===N)?.title||N;if(C+=Y.totalPassed,O+=Y.totalFailed,Y.tests.length>0){b.push(`## ${rn}`),b.push("");for(let K of Y.tests){let yn=K.passed?"✓":"✗",ze=K.error?`- ${yn} ${K.name}: ${K.error}`:`- ${yn} ${K.name}`;b.push(ze)}b.push("")}}return b.unshift(`**Summary: ${C} passed, ${O} failed**`,""),b.join(`
`)}z.addEventListener("testcomplete",(b)=>{A(b),xi()});let Jl=async()=>{if(y)return;if(!un.enabled.value)return;y=!0;let b=e.filter((N)=>N.text.includes("```test"));if(w=b.length,w>0)ln();if(w===0){if(p)p({passed:0,failed:0,pages:{}}),p=void 0;return}let C=document.createElement("iframe");C.style.cssText="position: fixed; left: -9999px; width: 800px; height: 600px; visibility: hidden;",document.body.appendChild(C);let O=String(h.currentDoc.filename);for(let N of b){if(N.filename===O)continue;c[N.filename]={passed:!0,tests:[],totalPassed:0,totalFailed:0};let Y=document.createElement("div"),vn=ke({value:N.text,didRender(){In.insertExamples(this,t)}});Y.appendChild(vn);let rn=(yn)=>{let{results:ze}=yn.detail,Oe=c[N.filename];Oe.tests.push(...ze.tests),Oe.totalPassed+=ze.passed,Oe.totalFailed+=ze.failed,Oe.passed=Oe.totalFailed===0,k(N.filename),xi()};Y.addEventListener("testcomplete",rn);let K=C.contentDocument;if(K)K.body.innerHTML="",K.body.appendChild(Y),await new Promise((yn)=>setTimeout(yn,500));V(N.filename)}if(C.remove(),b.some((N)=>N.filename===O))setTimeout(()=>{V(O)},1000)},gs=()=>{if(!un.enabled.value)return;if(B)setTimeout(Jl,1000);else if(l.text.includes("```test"))w=1,ln(),setTimeout(()=>V(l.filename),2000);else if(p)p({passed:0,failed:0,pages:{}}),p=void 0};return gs(),un.enabled.observe(gs),z}var{div:bn,slot:_d}=x;class fn extends f{static preferredTagName="tosi-editable";static initAttributes={rotationSnap:0,positionSnap:0};static angleSize=15;static gridSize=8;static snapAngle=!1;static snapToGrid=!1;static shadowStyleSpec={":host":{"--handle-bg":"#fff4","--handle-color":"#2228","--handle-hover-bg":"#8ff8","--handle-hover-color":"#222","--handle-size":"20px","--handle-padding":"2px"},":host ::slotted(*)":{position:"absolute"},":host > :not(style,slot)":{boxSizing:"border-box",content:'" "',position:"absolute",display:"flex",height:d.handleSize,width:d.handleSize,padding:d.handlePadding,"--text-color":d.handleColor,background:d.handleBg},":host > .drag-size":{top:0,bottom:0,left:0,right:0,height:"auto",width:"auto",background:"transparent",cursor:"ew-resize"},':host > [part="rotate"]':{transform:`translateY(${d.handleSize_50})`},":host > [locked] > svg:first-child, :host > :not([locked]) > svg+svg":{display:"none"},":host .icon-unlock":{opacity:0.5},":host svg":{pointerEvents:"none"},":host > *:hover":{"--text-color":d.handleHoverColor,background:d.handleHoverBg}};static snappedCoords(n,e){let{gridSize:t}=fn;return fn.snapToGrid||n.shiftKey?e.map((i)=>Math.round(i/t)*t):e}static snappedAngle(n,e){let{angleSize:t}=fn;return fn.snapAngle||n.shiftKey?Math.round(e/t)*t:e}get locked(){let n=this.parentElement;if(n.style.inset)return{left:!0,top:!0,bottom:!0,right:!0};let e=n.style.right.match(/\d/)!==null,t=!e||n.style.left.match(/\d/)!==null,i=n.style.bottom.match(/\d/)!==null,o=!i||n.style.top.match(/\d/)!==null;return{left:t,top:o,bottom:i,right:e}}set locked(n){let{bottom:e,right:t}=n,{left:i,top:o}=n,s=this.parentElement,a=s.offsetLeft,r=s.offsetTop,l=s.offsetWidth,h=s.offsetHeight,c=s.offsetParent.offsetWidth-a-l,p=s.offsetParent.offsetHeight-r-h;if(Object.assign(s.style,{left:"",right:"",top:"",bottom:"",width:"",height:""}),!t)i=!0;if(!e)o=!0;if(i)s.style.left=a+"px";if(t)s.style.right=c+"px";if(i&&t)s.style.width="auto";else s.style.width=l+"px";if(o)s.style.top=r+"px";if(e)s.style.bottom=p+"px";if(o&&e)s.style.height="auto";else s.style.height=h+"px";this.queueRender()}get coords(){let{top:n,left:e,right:t,bottom:i}=this.parentElement.style;return{top:parseFloat(n),left:parseFloat(e),right:parseFloat(t),bottom:parseFloat(i)}}get left(){return this.parentElement.offsetLeft}get width(){return this.parentElement.offsetWidth}get right(){return this.parentElement.offsetParent.offsetWidth-(this.left+this.width)}get top(){return this.parentElement.offsetTop}get height(){return this.parentElement.offsetHeight}get bottom(){return this.parentElement.offsetParent.offsetHeight-(this.top+this.height)}triggerChange=()=>{this.parentElement.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))};adjustPosition=(n)=>{let{locked:e}=this;this.locked=e;let t=this.parentElement,{top:i,left:o,bottom:s,right:a}=this.coords;an(n,(r,l,h)=>{if([r,l]=fn.snappedCoords(h,[r,l]),!isNaN(i))t.style.top=i+l+"px";if(!isNaN(s))t.style.bottom=s-l+"px";if(!isNaN(o))t.style.left=o+r+"px";if(!isNaN(a))t.style.right=a-r+"px";if(h.type==="mouseup")return this.triggerChange(),!0})};resize=(n)=>{let e=this.parentElement,{locked:t}=this;this.locked=Object.assign({left:!0,top:!0,right:!0,bottom:!0});let[i,o]=[this.right,this.bottom];an(n,(s,a,r)=>{let l=i-s,h=o-a;if([l,h]=fn.snappedCoords(r,[l,h]),e.style.right=l+"px",e.style.bottom=h+"px",r.type==="mouseup")return this.locked=t,this.triggerChange(),!0})};adjustSize=(n)=>{let e=this.parentElement,{locked:t}=this,i=n.target.getAttribute("part");this.locked=Object.assign({left:!0,right:!0,top:!0,bottom:!0});let o=this[i];an(n,(s,a,r)=>{let[l]=fn.snappedCoords(r,[o+(["left","right"].includes(i)?s:a)*(["right","bottom"].includes(i)?-1:1)]);if(e.style[i]=l+"px",r.type==="mouseup")return this.locked=t,this.triggerChange(),!0})};get rect(){return this.parentElement.getBoundingClientRect()}get center(){let n=this.parentElement.getBoundingClientRect();return{x:n.x+n.width*0.5,y:n.y+n.height*0.5}}get element(){return this.parentElement}adjustRotation=(n)=>{let{center:e}=this,{transformOrigin:t}=this.element.style;if(!t)this.element.style.transformOrigin="50% 50%";an(n,(i,o,s)=>{let{clientX:a,clientY:r}=s,l=a-e.x,h=r-e.y,c=h>0?90:-90;if(l!==0)c=Math.atan2(h,l)*180/Math.PI;if(c=fn.snappedAngle(s,c),c===0)this.element.style.transformOrigin="",this.element.style.transform="";else this.element.style.transform=`rotate(${c}deg)`;return this.triggerChange(),s.type==="mouseup"})};toggleLock=(n)=>{let{locked:e}=this,t=n.target.title.split(" ")[1];e[t]=!e[t],this.locked=e,this.queueRender(),n.stopPropagation(),n.preventDefault()};content=()=>[bn({part:"move",style:{top:"50%",left:"50%",transform:"translate(-50%,-50%)"}},m.move()),bn({part:"left",title:"resize left",class:"drag-size",style:{left:"-6px",width:"8px"}}),bn({part:"right",title:"resize right",class:"drag-size",style:{left:"calc(100% - 2px)",width:"8px"}}),bn({part:"top",title:"resize top",class:"drag-size",style:{top:"-6px",height:"8px",cursor:"ns-resize"}}),bn({part:"bottom",title:"resize bottom",class:"drag-size",style:{top:"calc(100% - 2px)",height:"8px",cursor:"ns-resize"}}),bn({part:"resize",style:{top:"100%",left:"100%"}},m.resize()),bn({part:"rotate",style:{top:"50%",right:"0"}},m.refreshCw()),bn({part:"lockLeft",title:"lock left",style:{top:"50%",left:0,transform:"translate(-100%, -50%)"}},m.unlock(),m.lock()),bn({part:"lockRight",title:"lock right",style:{top:"50%",left:"100%",transform:"translate(0%, -50%)"}},m.unlock(),m.lock()),bn({part:"lockTop",title:"lock top",style:{top:0,left:"50%",transform:"translate(-50%, -100%)"}},m.unlock(),m.lock()),bn({part:"lockBottom",title:"lock bottom",style:{top:"100%",left:"50%",transform:"translate(-50%, 0%)"}},m.unlock(),m.lock()),_d()];connectedCallback(){super.connectedCallback();let{left:n,right:e,top:t,bottom:i,lockLeft:o,lockRight:s,lockTop:a,lockBottom:r,move:l,resize:h,rotate:c}=this.parts,p={passive:!0};[n,e,t,i].forEach((y)=>{y.addEventListener("mousedown",this.adjustSize,p),y.addEventListener("touchstart",this.adjustSize,p)}),[o,s,a,r].forEach((y)=>{y.addEventListener("click",this.toggleLock)}),h.addEventListener("mousedown",this.resize,p),l.addEventListener("mousedown",this.adjustPosition,p),c.addEventListener("mousedown",this.adjustRotation,p),h.addEventListener("touchstart",this.resize,p),l.addEventListener("touchstart",this.adjustPosition,p),c.addEventListener("touchstart",this.adjustRotation,p)}render(){if(super.render(),!this.parentElement)return;let{lockLeft:n,lockRight:e,lockTop:t,lockBottom:i}=this.parts,{left:o,right:s,top:a,bottom:r}=this.locked;n.toggleAttribute("locked",o),e.toggleAttribute("locked",s),t.toggleAttribute("locked",a),i.toggleAttribute("locked",r)}}var Dd=fn.elementCreator();var{div:Nd,input:Ud,button:Ko,span:Rd}=x,yl=(n)=>n,ml="null filter, everything matches",Qo={contains:{caption:"contains",negative:"does not contain",makeTest:(n)=>{return n=n.toLocaleLowerCase(),(e)=>String(e).toLocaleLowerCase().includes(n)}},hasTags:{caption:"has tags",makeTest:(n)=>{let e=n.split(/[\s,]/).map((t)=>t.trim().toLocaleLowerCase()).filter((t)=>t!=="");return(t)=>Array.isArray(t)&&e.find((i)=>!t.includes(i))===void 0}},doesNotHaveTags:{caption:"does not have tags",makeTest:(n)=>{let e=n.split(/[\s,]/).map((t)=>t.trim().toLocaleLowerCase()).filter((t)=>t!=="");return(t)=>Array.isArray(t)&&e.find((i)=>t.includes(i))===void 0}},equals:{caption:"=",negative:"≠",makeTest:(n)=>{if(isNaN(Number(n)))return n=String(n).toLocaleLowerCase(),(t)=>String(t).toLocaleLowerCase()===n;let e=Number(n);return(t)=>Number(t)===e}},after:{caption:"is after",negative:"is before",makeTest:(n)=>{let e=new Date(n);return(t)=>new Date(t)>e}},greaterThan:{caption:">",negative:"≤",makeTest:(n)=>{if(!isNaN(Number(n))){let e=Number(n);return(t)=>Number(t)>e}return n=n.toLocaleLowerCase(),(e)=>String(e).toLocaleLowerCase()>n}},truthy:{caption:"is true/non-empty/non-zero",negative:"is false/empty/zero",needsValue:!1,makeTest:()=>(n)=>!!n},isTrue:{caption:"= true",needsValue:!1,makeTest:()=>(n)=>n===!0},isFalse:{caption:"= false",needsValue:!1,makeTest:()=>(n)=>n===!1}},Xd={description:"anything",test:()=>!0};function gl(n){return n.options[n.selectedIndex]?.caption||""}class $o extends f{static preferredTagName="tosi-filter-part";static lightStyleSpec={":host":{display:"flex"},":host .tosi-icon:":{verticalAlign:"middle",pointerEvents:"none"},':host [part="haystack"], :host [part="condition"]':{flex:"1"},':host [part="needle"]':{flex:2},':host [hidden]+[part="padding"]':{display:"block",content:" ",flex:"1 1 auto"}};static initAttributes={haystack:"*",condition:"contains",needle:""};fields=[];filters=Qo;content=()=>[cn({part:"haystack"}),cn({part:"condition"}),Ud({part:"needle",type:"search"}),Rd({part:"padding"}),Ko({part:"remove",title:"delete"},m.trash())];filter=Xd;get state(){let{haystack:n,needle:e,condition:t}=this.parts;return{haystack:n.value,needle:e.value,condition:t.value}}set state(n){Object.assign(this,n)}buildFilter=()=>{let{haystack:n,condition:e,needle:t}=this.parts,i=e.value.startsWith("~"),o=i?e.value.slice(1):e.value,s=this.filters[o];t.hidden=s.needsValue===!1;let a=s.needsValue===!1?s.makeTest(void 0):s.makeTest(t.value),r=n.value,l;if(r!=="*")l=i?(p)=>!a(p[r]):(p)=>a(p[r]);else l=i?(p)=>Object.values(p).find((y)=>!a(y))!==void 0:(p)=>Object.values(p).find((y)=>a(y))!==void 0;let h=s.needsValue!==!1?` "${t.value}"`:"",c=`${gl(n)} ${gl(e)}${h}`;this.filter={description:c,test:l},this.parentElement?.dispatchEvent(new Event("change"))};connectedCallback(){super.connectedCallback();let{haystack:n,condition:e,needle:t,remove:i}=this.parts;n.addEventListener("change",this.buildFilter),e.addEventListener("change",this.buildFilter),t.addEventListener("input",this.buildFilter),n.value=this.haystack,e.value=this.condition,t.value=this.needle,i.addEventListener("click",()=>{let{parentElement:o}=this;this.remove(),o?.dispatchEvent(new Event("change"))})}render(){super.render();let{haystack:n,condition:e,needle:t}=this.parts;if(n.options=[{caption:"any field",value:"*"},...this.fields.map((i)=>i.prop)],e.options=Object.keys(this.filters).map((i)=>{let o=this.filters[i];return o.negative!==void 0?[{caption:o.caption,value:i},{caption:o.negative,value:"~"+i}]:{caption:o.caption,value:i}}).flat(),this.haystack!=="")n.value=this.haystack;if(this.condition!=="")e.value=this.condition;if(this.needle!=="")t.value=this.needle;this.buildFilter()}}var oi=$o.elementCreator();class Ho extends f{static preferredTagName="tosi-filter";static lightStyleSpec={":host":{height:"auto",display:"grid",gridTemplateColumns:"32px calc(100% - 64px) 32px",alignItems:"center"},':host [part="filterContainer"]':{display:"flex",flexDirection:"column",alignItems:"stretch",flex:"1 1 auto"},':host [part="haystack"]':{_fieldWidth:"100px"},':host [part="condition"]':{_fieldWidth:"60px"},':host [part="needle"]':{_fieldWidth:"80px"},':host [part="add"], :host [part="reset"]':{"--button-size":"var(--touch-size, 32px)",borderRadius:"999px",height:"var(--button-size)",lineHeight:"var(--button-size)",margin:"0",padding:"0",textAlign:"center",width:"var(--button-size)",flex:"0 0 var(--button-size)"}};_fields=[];get fields(){return this._fields}set fields(n){this._fields=n,this.queueRender()}get state(){let{filterContainer:n}=this.parts;return[...n.children].map((e)=>e.state)}set state(n){let{fields:e,filters:t}=this,{filterContainer:i}=this.parts;i.textContent="";for(let o of n)i.append(oi({fields:e,filters:t,...o}))}filter=yl;description=ml;addFilter=()=>{let{fields:n,filters:e}=this,{filterContainer:t}=this.parts;t.append(oi({fields:n,filters:e}))};content=()=>[Ko({part:"add",title:"add filter condition",onClick:this.addFilter,class:"round"},m.plus()),Nd({part:"filterContainer"}),Ko({part:"reset",title:"reset filter",onClick:this.reset},m.x())];filters=Qo;reset=()=>{let{fields:n,filters:e}=this,{filterContainer:t}=this.parts;this.description=ml,this.filter=yl,t.textContent="",t.append(oi({fields:n,filters:e})),this.dispatchEvent(new Event("change"))};buildFilter=()=>{let{filterContainer:n}=this.parts;if(n.children.length===0){this.reset();return}let e=[...n.children].map((i)=>i.filter),t=e.map((i)=>i.test);this.description=e.map((i)=>i.description).join(", "),this.filter=(i)=>i.filter((o)=>t.find((s)=>s(o)===!1)===void 0),this.dispatchEvent(new Event("change"))};connectedCallback(){super.connectedCallback();let{filterContainer:n}=this.parts;n.addEventListener("change",this.buildFilter),this.reset()}render(){super.render()}}var Fd=Ho.elementCreator();var{form:Wd,slot:Zo,xinSlot:xl,label:Gd,input:Yd,span:Kd}=x;function Kn(n,e,t){if(t!==""&&t!==!1)n.setAttribute(e,t);else n.removeAttribute(e)}function Qd(n){switch(n.type){case"checkbox":return n.checked;case"radio":{let e=n.parentElement?.querySelector(`input[type="radio"][name="${n.name}"]:checked`);return e?e.value:null}case"range":case"number":return Number(n.value);default:return Array.isArray(n.value)&&n.value.length===0?null:n.value}}function bl(n,e){if(!(n instanceof HTMLElement));else if(n instanceof HTMLInputElement)switch(n.type){case"checkbox":n.checked=e;break;case"radio":n.checked=e===n.value;break;default:n.value=String(e||"")}else if(e!=null||n.value!=null)n.value=String(e||"")}class si extends f{static preferredTagName="tosi-field";static lightStyleSpec={':host [part="field"]':{position:"relative",display:"flex",alignItems:"center",gap:u.prefixSuffixGap("8px")},':host [part="field"][prefix]::before':{content:"attr(prefix)"},':host [part="field"][suffix]::after':{content:"attr(suffix)"},':host [part="field"] > *, :host [part="input"] > *':{width:"100%"},":host textarea":{resize:"none"},':host input[type="checkbox"]':{width:"fit-content"},":host .hidden":{position:"absolute",pointerEvents:"none",opacity:0}};static initAttributes={caption:"",key:"",type:"",optional:!1,pattern:"",placeholder:"",min:"",max:"",step:"",fixedPrecision:-1,prefix:"",suffix:""};value=null;content=Gd(xl({part:"caption"}),Kd({part:"field"},xl({part:"input",name:"input"}),Yd({part:"valueHolder"})));valueChanged=!1;handleChange=()=>{let{input:n,valueHolder:e}=this.parts,t=n.children[0]||e;if(t!==e)e.value=t.value;this.value=Qd(t),this.valueChanged=!0;let i=this.closest("tosi-form");if(i&&this.key!=="")switch(this.type){case"checkbox":i.fields[this.key]=t.checked;break;case"number":case"range":if(this.fixedPrecision>-1)t.value=Number(t.value).toFixed(this.fixedPrecision),i.fields[this.key]=Number(t.value);else i.fields[this.key]=Number(t.value);break;default:i.fields[this.key]=t.value}};connectedCallback(){super.connectedCallback();let{input:n,valueHolder:e}=this.parts;e.addEventListener("change",this.handleChange),n.addEventListener("change",this.handleChange,!0)}render(){if(this.valueChanged){this.valueChanged=!1;return}let{input:n,caption:e,valueHolder:t,field:i}=this.parts;if(e.textContent?.trim()==="")e.append(this.caption!==""?this.caption:this.key);if(this.type==="text"){n.textContent="";let o=x.textarea({value:this.value});if(this.placeholder)o.setAttribute("placeholder",this.placeholder);n.append(o)}else if(this.type==="color")n.textContent="",n.append(lo({value:this.value}));else if(n.children.length===0){if(Kn(t,"placeholder",this.placeholder),Kn(t,"type",this.type),Kn(t,"pattern",this.pattern),Kn(t,"min",this.min),Kn(t,"max",this.max),this.step)Kn(t,"step",this.step);else if(this.fixedPrecision>0&&this.type==="number")Kn(t,"step",Math.pow(10,-this.fixedPrecision))}if(bl(t,this.value),bl(n.children[0],this.value),this.prefix?i.setAttribute("prefix",this.prefix):i.removeAttribute("prefix"),this.suffix?i.setAttribute("suffix",this.suffix):i.removeAttribute("suffix"),t.classList.toggle("hidden",n.children.length>0),n.children.length>0)t.setAttribute("tabindex","-1");else t.removeAttribute("tabindex");n.style.display=n.children.length===0?"none":"",Kn(t,"required",!this.optional)}}class ai extends f{static preferredTagName="tosi-form";context={};value={};get isValid(){return[...this.querySelectorAll("*")].filter((e)=>e.required!==void 0).find((e)=>!e.reportValidity())===void 0}static shadowStyleSpec={":host":{display:"flex",flexDirection:"column"},":host::part(header), :host::part(footer)":{display:"flex"},":host::part(content)":{display:"flex",flexDirection:"column",overflow:"hidden auto",height:"100%",width:"100%",position:"relative",boxSizing:"border-box"},":host form":{display:"flex",flex:"1 1 auto",position:"relative",overflow:"hidden"}};content=[Zo({part:"header",name:"header"}),Wd({part:"form"},Zo({part:"content"})),Zo({part:"footer",name:"footer"})];getField=(n)=>{return this.querySelector(`tosi-field[key="${n}"]`)};get fields(){if(typeof this.value==="string")try{this.value=JSON.parse(this.value)}catch(t){console.log("<tosi-form> could not use its value, expects valid JSON"),this.value={}}let{getField:n}=this,e=this.dispatchEvent.bind(this);return new Proxy(this.value,{get(t,i){return t[i]},set(t,i,o){if(t[i]!==o){t[i]=o;let s=n(i);if(s)s.value=o;e(new Event("change"))}return!0}})}set fields(n){let e=[...this.querySelectorAll("tosi-field")];for(let t of e)t.value=n[t.key]}submit=()=>{this.parts.form.dispatchEvent(new Event("submit"))};handleSubmit=(n)=>{n.preventDefault(),n.stopPropagation();let e=this.fields;this.submitCallback(e,this.isValid)};submitCallback=(n,e)=>{console.log("override submitCallback to handle this data",{value:n,isValid:e})};connectedCallback(){super.connectedCallback();let{form:n}=this.parts;n.addEventListener("submit",this.handleSubmit),this.addEventListener("change",this.handleElementChange,!0),this.initializeNamedElements()}handleElementChange=(n)=>{let e=n.target,t=e.getAttribute("name");if(t&&"value"in e)this.fields[t]=e.value};initializeNamedElements(){let n=this.fields,e=this.querySelectorAll("[name], [key]");for(let t of e){let i=t.getAttribute("name")||t.getAttribute("key");if(i&&n[i]!==void 0)t.value=n[i]}}}var $d=si,Hd=ai,fl=si.elementCreator(),wl=ai.elementCreator(),Zd=fl,Md=wl;function vl(){return navigator.getGamepads().filter((e)=>e!==null).map((e)=>{let{id:t,axes:i,buttons:o}=e;return{id:t,axes:i,buttons:o.map((s,a)=>{let{pressed:r,value:l}=s;return{index:a,pressed:r,value:l}}).filter((s)=>s.pressed||s.value!==0).reduce((s,a)=>{return s[a.index]=a.value,s},{})}})}function Jd(){let n=vl();return n.length===0?"no active gamepads":n.map(({id:e,axes:t,buttons:i})=>{let o=t.map((a)=>a.toFixed(2)).join(" "),s=Object.keys(i).map((a)=>`[${a}](${i[Number(a)].toFixed(2)})`).join(" ");return`${e}
${o}
${s}`}).join(`
`)}function Ld(n){let e={};return n.input.onControllerAddedObservable.add((t)=>{t.onMotionControllerInitObservable.add((i)=>{let o={};i.getComponentIds().forEach((a)=>{let r=i.getComponent(a);if(o[a]={pressed:r.pressed,touched:r.touched,value:r.value,axes:{x:r.axes.x,y:r.axes.y}},r.onButtonStateChangedObservable.add((l)=>{o[a].pressed=l.pressed,o[a].touched=l.touched,o[a].value=l.value}),r.onAxisValueChangedObservable)r.onAxisValueChangedObservable.add((l)=>{o[a].axes={x:l.x,y:l.y}})}),e[i.handedness]=o})}),e}function Ed(n){if(n===void 0||Object.keys(n).length===0)return"no xr inputs";return Object.keys(n).map((e)=>{let t=n[e],i=[];for(let[o,s]of Object.entries(t)){let a=[];if(s.pressed)a.push("P");if(s.touched)a.push("T");let r=s.value>0,l=s.axes.x!==0||s.axes.y!==0;if(a.length>0||r||l){let h=`${o}[${a.join("")}]`;if(r)h+=` v:${s.value.toFixed(2)}`;if(l)h+=` x:${s.axes.x.toFixed(2)} y:${s.axes.y.toFixed(2)}`;i.push(h)}}return`${e}
${i.join(`
`)||"(idle)"}`}).join(`
`)}var{div:nh}=x;class se extends f{static preferredTagName="tosi-map";static formAssociated=!0;static initAttributes={coords:"65.01715565258993,25.48081004203459,12",token:"",mapStyle:"mapbox://styles/mapbox/streets-v12",name:""};value="";formDisabledCallback(n){}formResetCallback(){this.value="",this.coords="65.01715565258993,25.48081004203459,12"}content=nh({style:{width:"100%",height:"100%"}});get map(){return this._map}static mapboxCSSAvailable;static mapboxAvailable;_map;static shadowStyleSpec={":host":{display:"inline-block",position:"relative",width:"400px",height:"400px",textAlign:"left"}};constructor(){super();if(se.mapboxCSSAvailable===void 0)se.mapboxCSSAvailable=At("https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.css").catch((n)=>{console.error("failed to load mapbox-gl.css",n)}),se.mapboxAvailable=hn("https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.js").catch((n)=>{console.error("failed to load mapbox-gl.js",n)})}connectedCallback(){if(super.connectedCallback(),!this.token)console.error("mapbox requires an access token which you can provide via the token attribute")}_lastCoords="";_lastStyle="";render(){if(super.render(),!this.token)return;if(this._map){if(this.coords!==this._lastCoords){let[o,s,a]=this.coords.split(",").map((r)=>Number(r));this._map.setCenter([s,o]),this._map.setZoom(a),this._lastCoords=this.coords}if(this.mapStyle!==this._lastStyle)this._map.setStyle(this.mapStyle),this._lastStyle=this.mapStyle;return}let{div:n}=this.parts,[e,t,i]=this.coords.split(",").map((o)=>Number(o));this._lastCoords=this.coords,this._lastStyle=this.mapStyle,se.mapboxAvailable.then(({mapboxgl:o})=>{console.log("%cmapbox may complain about missing css -- don't panic!","background: orange; color: black; padding: 0 5px;"),o.accessToken=this.token,this._map=new o.Map({container:n,style:this.mapStyle,zoom:i,center:[t,e]}),this._map.on("render",()=>this._map.resize()),this._map.on("moveend",()=>{let s=this._map.getCenter(),a=this._map.getZoom(),r=`${s.lat.toFixed(6)},${s.lng.toFixed(6)},${a.toFixed(1)}`;if(r!==this.value){if(this.internals)this.internals.setFormValue(r)}})})}}var eh=se.elementCreator();var{div:Mo,span:li,button:Jo}=x,ot=86400000,th=[0,1,2,3,4,5,6],ih=[1,2,3,4,5,6,7,8,9,10,11,12],Lo=(n,e=2,t="0")=>String(n).padStart(e,t),st=(n,e,t)=>new Date(`${n}-${Lo(e)}-${Lo(t)}`);class Eo extends f{static preferredTagName="tosi-month";static lightStyleSpec={":host":{display:"block"},":host [part=header]":{display:"flex",alignItems:"stretch",justifyContent:"stretch"},":host[disabled]":{pointerEvents:"none",opacity:u.disabledOpacity(0.6)},':host [part="month"], :host [part="year"]':{_fieldWidth:"4em",flex:"1"},":host [part=week], :host [part=days]":{display:"grid",gridTemplateColumns:"auto auto auto auto auto auto auto",justifyItems:"stretch"},":host .today":{background:u.monthTodayBackground("transparent"),boxShadow:u.monthTodayShadow("none"),backdropFilter:u.monthTodayBackdropFilter("brightness(0.9)"),fontWeight:u.monthTodayFontWeight("800")},":host .day, :host .date":{padding:5,display:"flex",justifyContent:"center",userSelect:"none"},":host .day":{color:u.monthDayColor("hotpink"),background:u.monthDayBackground("white"),fontWeight:u.monthDayFontWeight("800")},":host .date":{cursor:"default"},":host .weekend":{background:u.monthWeekendBackground("#eee")},":host .date:not(.in-month)":{opacity:0.5},":host .date.checked":{color:u.monthDateCheckedColor("white"),background:u.monthDateCheckedBackground("hotpink")},":host:not([range]) .date.checked":{borderRadius:u.monthDateCheckedBorderRadius("10px")},":host .range-start":{borderTopLeftRadius:u.monthDateCheckedBorderRadius("10px"),borderBottomLeftRadius:u.monthDateCheckedBorderRadius("10px")},":host .range-end":{borderTopRightRadius:u.monthDateCheckedBorderRadius("10px"),borderBottomRightRadius:u.monthDateCheckedBorderRadius("10px")}};static formAssociated=!0;static initAttributes={month:NaN,year:NaN,weekStart:0,minDate:st(new Date().getFullYear()-100,1,1).toISOString().split("T")[0],maxDate:st(new Date().getFullYear()+10,12,31).toISOString().split("T")[0],selectable:!1,multiple:!1,range:!1,disabled:!1,readonly:!1,required:!1,name:""};selectedDays=[];value="";formDisabledCallback(n){this.disabled=n}formResetCallback(){this.value="",this.selectedDays=[]}get endDay(){return 1-this.weekStart}get months(){return ih.map((n)=>({caption:st(2025,n,1).toString().split(" ")[1],value:String(n)}))}get years(){let n=Number(this.minDate.split("-")[0]),e=Number(this.maxDate.split("-")[0]),t=[];for(let i=n;i<=e;i++)t.push(String(i));return t}monthChanged=(n,e)=>{};gotoMonth(n,e){if(this.month!==e||this.year!==n)this.month=e,this.year=n,this.monthChanged(n,e)}setMonth=()=>{this.gotoMonth(Number(this.parts.year.value),Number(this.parts.month.value))};get to(){return this.selectedDays[1]||""}set to(n){this.selectedDays[1]=n,this.selectedDays.splice(2)}get from(){return this.selectedDays[0]||""}set from(n){this.selectedDays[0]=n,this.selectedDays.splice(2)}clickDate=(n)=>{let e=n.target.getAttribute("title");this.selectDate(e)};keyDate=(n)=>{let e=!1;switch(n.code){case"Space":{let t=n.target.getAttribute("title");this.selectDate(t),e=!0;break}case"Tab":break;default:console.log(n)}if(e)n.preventDefault(),n.stopPropagation()};#n="";selectDate=(n)=>{if(this.#n=n,this.range){if(!this.to)this.selectedDays=[n,n];else if(this.from===n&&this.to===n)this.selectedDays=[];else if(this.from===n)this.from=this.to;else if(this.to===n)this.to=this.from;else if(n<this.from)this.from=n;else if(n>this.to)this.to=n;else this.to=n;this.value=`${this.from},${this.to}`}else if(this.multiple){if(this.selectedDays.includes(n))this.selectedDays.splice(this.selectedDays.indexOf(n),1);else this.selectedDays.push(n),this.selectedDays.sort();this.value=this.selectedDays.join(",")}else if(this.selectable)if(this.selectedDays.includes(n))this.value="",this.selectedDays=[];else this.value=n,this.selectedDays=[n]};nextMonth=()=>{if(this.month<12)this.gotoMonth(this.year,this.month+1);else this.gotoMonth(this.year+1,1)};previousMonth=()=>{if(this.month>1)this.gotoMonth(this.year,this.month-1);else this.gotoMonth(this.year-1,12)};checkDay=(n)=>{if(!this.range)return this.selectedDays.includes(n);else if(this.range)return this.from&&n>=this.from&&n<=this.to;return!1};dateMenuItem=(n,e="")=>{return n=n.split("T")[0],{caption:e||n,enabled:()=>!n.startsWith(`${this.year}-${Lo(this.month)}-`),action:()=>{this.gotoDate(n)}}};jumpMenu=()=>{X({target:this.parts.jump,menuItems:[this.dateMenuItem(new Date().toISOString(),"This Month"),...this.selectedDays.length===0?[]:[null],...this.selectedDays.map((n)=>this.dateMenuItem(n))]})};content=()=>[Mo({part:"header"},Jo({part:"previous",onClick:this.previousMonth},m.chevronLeft()),li({style:{flex:"1"}}),Jo({part:"jump",onClick:this.jumpMenu},m.calendar()),cn({part:"month",options:this.months,onChange:this.setMonth}),cn({part:"year",options:[this.year],onChange:this.setMonth}),li({style:{flex:"1"}}),Jo({part:"next",onClick:this.nextMonth},m.chevronRight())),Mo({part:"week"}),Mo({part:"days"})];gotoDate(n){let e=new Date(n);this.gotoMonth(e.getFullYear(),e.getMonth()+1)}connectedCallback(){super.connectedCallback();let n=new Date(this.value.split(",").pop()||Date.now());if(isNaN(this.month))this.month=n.getMonth()+1;if(isNaN(this.year))this.year=n.getFullYear()}days=[];render(){super.render();let{week:n,days:e,jump:t,month:i,year:o,previous:s,next:a}=this.parts;this.selectedDays=this.value?this.value.split(","):[];let r=st(this.year,this.month,1),l=new Date(r.valueOf()-(7+r.getDay()-this.weekStart)%7*ot),h=this.month===12?1:this.month+1,c=new Date(st(this.year+(this.month===12?1:0),h,1).valueOf()-ot),p=new Date(c.valueOf()+(this.weekStart*2+5+this.endDay-c.getDay())%7*ot),y=th.map((B)=>new Date(l.valueOf()+B*ot).toString().split(" ")[0]);this.days=[];let w=new Date().toISOString().split("T")[0];for(let B=l.valueOf();B<=p.valueOf();B+=ot){let A=new Date(B),V=A.toISOString().split("T")[0];this.days.push({date:A,selected:!1,inMonth:A.getMonth()+1===this.month,isToday:V===w,isWeekend:A.getDay()%6===0,inRange:!!(this.from&&V>=this.from&&V<=this.to)})}i.value=String(this.month),o.value=String(this.year),i.disabled=o.disabled=t.disabled=s.disabled=a.disabled=this.disabled||this.readonly,o.options=this.years,n.textContent="",n.append(...y.map((B)=>li({class:"day"},B))),e.textContent="";let g=null,{to:k,from:j}=this;e.append(...this.days.map((B)=>{let A=["date"];if(B.inMonth)A.push("in-month");if(B.isToday)A.push("today");let V=B.date.toISOString().split("T")[0];if(this.checkDay(V))A.push("checked");if(A.push(B.isWeekend?"weekend":"weekday"),this.range){if(k===V)A.push("range-end");if(j===V)A.push("range-start")}let R=li({class:A.join(" "),title:V,onClick:this.clickDate,onKeydown:this.keyDate,tabindex:"0"},B.date.getDate());if(V===this.#n)g=R;return R})),g?.focus()}}var oh=Eo.elementCreator();var{div:ns,button:sh}=x,ah={error:"red",warn:"orange",info:"royalblue",log:"gray",success:"green",progress:"royalblue"};class Qn extends f{static preferredTagName="tosi-notification";static singleton;static shadowStyleSpec={":host":{_notificationSpacing:8,_notificationWidth:360,_notificationPadding:`${d.notificationSpacing} ${d.notificationSpacing50} ${d.notificationSpacing} ${d.notificationSpacing200}`,_notificationBg:"#fafafa",_notificationAccentColor:"#aaa",_notificationTextColor:"#444",_notificationIconSize:d.notificationSpacing300,_notificationButtonSize:48,_notificationBorderWidth:"3px 0 0",_notificationBorderRadius:d.notificationSpacing50,position:"fixed",left:0,right:0,bottom:0,paddingBottom:d.notificationSpacing,width:d.notificationWidth,display:"flex",flexDirection:"column-reverse",margin:"0 auto",gap:d.notificationSpacing,maxHeight:"50vh",overflow:"hidden auto",boxShadow:"none !important"},":host *":{color:d.notificationTextColor},":host .note":{display:"grid",background:d.notificationBg,padding:d.notificationPadding,gridTemplateColumns:`${d.notificationIconSize} 1fr ${d.notificationButtonSize}`,gap:d.notificationSpacing,alignItems:"center",borderRadius:d.notificationBorderRadius,boxShadow:`0 2px 8px #0006, inset 0 0 0 2px ${d.notificationAccentColor}`,borderColor:d.notificationAccentColor,borderWidth:d.notificationBorderWidth,borderStyle:"solid",transition:"0.5s ease-in",transitionProperty:"margin, opacity",zIndex:1},":host .note .icon":{stroke:d.notificationAccentColor},":host .note button":{display:"flex",lineHeight:d.notificationButtonSize,padding:0,margin:0,height:d.notificationButtonSize,width:d.notificationButtonSize,background:"transparent",alignItems:"center",justifyContent:"center",boxShadow:"none",border:"none",position:"relative"},":host .note button:hover svg":{stroke:d.notificationAccentColor},":host .note button:active svg":{borderRadius:99,stroke:d.notificationBg,background:d.notificationAccentColor,padding:d.spacing50},":host .note svg":{height:d.notificationIconSize,width:d.notificationIconSize,pointerEvents:"none"},":host .message":{display:"flex",flexDirection:"column",alignItems:"center",gap:d.notificationSpacing},":host .note.closing":{opacity:0,zIndex:0}};static removeNote(n){n.classList.add("closing"),n.style.marginBottom=-n.offsetHeight+"px";let e=()=>{n.remove()};n.addEventListener("transitionend",e),setTimeout(e,1000)}static post(n){let{message:e,duration:t,type:i,close:o,progress:s,icon:a,color:r}=Object.assign({type:"info",duration:-1},typeof n==="string"?{message:n}:n);if(!this.singleton)this.singleton=es();let l=this.singleton;document.body.append(l),l.style.zIndex=String(En()+1);let h=r||ah[i],c=s||i==="progress"?x.progress():{},p=()=>{if(o)o();Qn.removeNote(g)},y=a instanceof SVGElement?a:a?m[a]({class:"icon"}):m.info({class:"icon"}),w=i==="error"||i==="warn",g=ns({class:`note ${i}`,role:w?"alert":"status",ariaLive:w?"assertive":"polite",style:{_notificationAccentColor:h}},y,ns({class:"message"},ns(e),c),sh({class:"close",title:"close",ariaLabel:"Close notification",apply(k){k.addEventListener("click",p)}},m.x()));if(l.shadowRoot.append(g),c instanceof HTMLProgressElement&&s instanceof Function){c.setAttribute("max",String(100)),c.value=s();let k=setInterval(()=>{if(!l.shadowRoot.contains(g)){clearInterval(k);return}let j=s();if(c.value=j,j>=100)Qn.removeNote(g)},1000)}if(t>0)setTimeout(()=>{Qn.removeNote(g)},t*1000);return g.scrollIntoView(),p}content=null}var lh=Qn,es=Qn.elementCreator(),rh=es;function dh(n){return Qn.post(n)}var kl=async(n,e="SHA-1")=>{let i=new TextEncoder().encode(n),o=await crypto.subtle.digest(e,i);return Array.from(new Uint8Array(o)).map((r)=>r.toString(16).padStart(2,"0")).join("")},Cl=async(n)=>{let e=await kl(n),t=await fetch(`https://weakpass.com/api/v1/search/${e}`);if(t.ok){let i=await t.json();console.log("password found in weakpass database",i)}return t.status!==404},{span:ts,xinSlot:hh}=x;class ri extends f{static preferredTagName="tosi-password-strength";static lightStyleSpec={":host":{display:"inline-flex",flexDirection:"column",gap:d.spacing50,position:"relative"},":host xin-slot":{display:"flex"},':host [part="meter"]':{display:"block",position:"relative",height:u.meterHeight("24px"),background:u.indicatorBg("white"),borderRadius:u.meterRadius("4px"),boxShadow:u.meterShadow(`inset 0 0 0 2px ${d.indicatorColor}`)},':host [part="level"]':{height:u.levelHeight("20px"),content:'" "',display:"inline-block",width:0,transition:"0.15s ease-out",background:d.indicatorColor,margin:u.levelMargin("2px"),borderRadius:u.levelRadius("2px")},':host [part="description"]':{position:"absolute",inset:"0",color:d.descriptionColor,height:u.meterHeight("24px"),lineHeight:u.meterHeight("24px"),textAlign:"center"}};static initAttributes={minLength:8,goodLength:12,indicatorColors:"#f00,#f40,#f80,#ef0,#8f0,#0a2"};descriptionColors="#000,#000,#000,#000,#000,#fff";issues={tooShort:!0,short:!0,noUpper:!0,noLower:!0,noNumber:!0,noSpecial:!0};issueDescriptions={tooShort:"too short",short:"short",noUpper:"no upper case",noLower:"no lower case",noNumber:"no digits",noSpecial:"no unusual characters"};value=0;strengthDescriptions=["unacceptable","very weak","weak","moderate","strong","very strong"];strength(n){return this.issues={tooShort:n.length<this.minLength,short:n.length<this.goodLength,noUpper:!n.match(/[A-Z]/),noLower:!n.match(/[a-z]/),noNumber:!n.match(/[0-9]/),noSpecial:!n.match(/[^a-zA-Z0-9]/)},this.issues.tooShort?0:Object.values(this.issues).filter((e)=>!e).length-1}async isBreached(){let n=this.querySelector("input")?.value;if(!n||typeof n!=="string")return!0;return await Cl(n)}updateIndicator=(n)=>{let{level:e,description:t}=this.parts,i=this.indicatorColors.split(","),o=this.descriptionColors.split(","),s=this.strength(n);if(this.value!==s)this.value=s,this.dispatchEvent(new Event("change"));e.style.width=`${(s+1)*16.67}%`,this.style.setProperty("--indicator-color",i[s]),this.style.setProperty("--description-color",o[s]),t.textContent=this.strengthDescriptions[s]};update=(n)=>{let e=n.target.closest("input");this.updateIndicator(e?.value||"")};content=()=>[hh({onInput:this.update}),ts({part:"meter"},ts({part:"level"}),ts({part:"description"}))];render(){super.render();let n=this.querySelector("input");this.updateIndicator(n?.value)}}var ch=ri,jl=ri.elementCreator(),ph=jl;var{span:is}=x;class di extends f{static preferredTagName="tosi-rating";static formAssociated=!0;static initAttributes={max:5,min:1,icon:"star",step:1,ratingStroke:"#e81",ratingFill:"#f91",emptyStroke:"none",emptyFill:"#ccc",readonly:!1,iconSize:24,hollow:!1,required:!1,name:""};value="";formDisabledCallback(n){this.readonly=n}formResetCallback(){this.value=""}static shadowStyleSpec={":host":{display:"inline-block",position:"relative",width:"fit-content"},":host::part(container)":{position:"relative",display:"inline-block"},":host::part(empty), :host::part(filled)":{height:"100%",whiteSpace:"nowrap",overflow:"hidden"},":host::part(empty)":{pointerEvents:"none"},":host::part(filled)":{position:"absolute",left:0,transition:"width 0.15s ease-out"},":host svg":{transform:"scale(0.9)",pointerEvents:"all !important",transition:"0.25s ease-in-out"},":host svg:hover":{transform:"scale(1)"},":host svg:active":{transform:"scale(1.1)"}};content=()=>is({part:"container"},is({part:"empty"}),is({part:"filled"}));displayValue(n){let{empty:e,filled:t}=this.parts,o=Math.round((typeof n==="string"?0:n||0)/this.step)*this.step;t.style.width=o/this.max*e.offsetWidth+"px"}update=(n)=>{if(this.readonly)return;let{empty:e}=this.parts,t=n instanceof MouseEvent?n.pageX-e.getBoundingClientRect().x:0,i=Math.min(Math.max(this.min,Math.round(t/e.offsetWidth*this.max/this.step+this.step*0.5)*this.step),this.max);if(n.type==="click")this.value=i;else if(n.type==="mousemove")this.displayValue(i);else this.displayValue(this.value||0)};handleKey=(n)=>{let e=this.value===""?NaN:Number(this.value);if(isNaN(e))e=Math.round((this.min+this.max)*0.5*this.step)*this.step;let t=!1;switch(n.key){case"ArrowUp":case"ArrowRight":e+=this.step,t=!0;break;case"ArrowDown":case"ArrowLeft":e-=this.step,t=!0;break}if(this.value=Math.max(Math.min(e,this.max),this.min),t)n.stopPropagation(),n.preventDefault()};connectedCallback(){super.connectedCallback();let{container:n}=this.parts;n.tabIndex=0,n.addEventListener("mousemove",this.update,!0),n.addEventListener("mouseleave",this.update),n.addEventListener("blur",this.update),n.addEventListener("click",this.update),n.addEventListener("keydown",this.handleKey)}_renderedIcon="";render(){super.render();let n=this.iconSize+"px";if(this.style.setProperty("--tosi-icon-size",n),this.readonly)this.role="image";else this.role="slider";this.ariaLabel=`rating ${this.value} out of ${this.max}`,this.ariaValueMax=String(this.max),this.ariaValueMin=String(this.min),this.ariaValueNow=this.value===""?String(-1):String(this.value);let{empty:e,filled:t}=this.parts;if(e.classList.toggle("hollow",this.hollow),e.style.setProperty("--tosi-icon-fill",this.emptyFill),e.style.setProperty("--tosi-icon-stroke",this.emptyStroke),t.style.setProperty("--tosi-icon-fill",this.ratingFill),t.style.setProperty("--tosi-icon-stroke",this.ratingStroke),this._renderedIcon!==this.icon){this._renderedIcon=this.icon;for(let i=0;i<this.max;i++)e.append(m[this.icon]()),t.append(m[this.icon]())}this.displayValue(this.value)}}var uh=di,Bl=di.elementCreator(),yh=en((...n)=>Bl(...n),"xinRating is deprecated, use tosiRating instead (tag is now <tosi-rating>)");var{xinSlot:Sl,div:mh,button:gh,span:Al}=x,xh=[{caption:"Title",tagType:"H1"},{caption:"Heading",tagType:"H2"},{caption:"Subheading",tagType:"H3"},{caption:"Minor heading",tagType:"H4"},{caption:"Body",tagType:"P"},{caption:"Code Block",tagType:"PRE"}];function os(n=xh){return cn({title:"paragraph style",slot:"toolbar",class:"block-style",options:n.map(({caption:e,tagType:t})=>({caption:e,value:`formatBlock,${t}`}))})}function Be(n="10px"){return Al({slot:"toolbar",style:{flex:`0 0 ${n}`,content:" "}})}function bh(n="10px"){return Al({slot:"toolbar",style:{flex:`0 0 ${n}`,content:" "}})}function wn(n,e,t){return gh({slot:"toolbar",dataCommand:e,title:n},t)}var fh=()=>[wn("left-justify","justifyLeft",m.alignLeft()),wn("center","justifyCenter",m.alignCenter()),wn("right-justify","justifyRight",m.alignRight()),Be(),wn("bullet list","insertUnorderedList",m.listBullet()),wn("numbered list","insertOrderedList",m.listNumber()),Be(),wn("indent","indent",m.indent()),wn("indent","outdent",m.outdent())],zl=()=>[wn("bold","bold",m.fontBold()),wn("italic","italic",m.fontItalic()),wn("underline","underline",m.fontUnderline())],wh=()=>[os(),Be(),...zl()],Ol=()=>[os(),Be(),...fh(),Be(),...zl()];class hi extends f{static preferredTagName="tosi-rich-text";static lightStyleSpec={":host":{display:"flex",flexDirection:"column",height:"100%"},':host [part="toolbar"]':{padding:4,display:"flex",gap:"0px",flex:"0 0 auto",flexWrap:"wrap"},':host [part="toolbar"] > button':{_xinIconSize:18}};static formAssociated=!0;static initAttributes={widgets:"default",name:"",required:!1};isInitialized=!1;savedValue="";formDisabledCallback(n){if(this.isInitialized)this.parts.doc.contentEditable=n?"false":"true"}formResetCallback(){this.value=""}_value="";get value(){return this.isInitialized?this.parts.doc.innerHTML:this._value}set value(n){let e=this._value;if(this._value=n,this.isInitialized){if(this.parts.doc.innerHTML!==n)this.parts.doc.innerHTML=n}if(e!==n&&this.internals)this.internals.setFormValue(n)}blockElement(n){let{doc:e}=this.parts;while(n.parentElement!==null&&n.parentElement!==e)n=n.parentElement;return n.parentElement===e?n:void 0}get selectedBlocks(){let{doc:n}=this.parts,e=window.getSelection();if(e===null)return[];let t=[];for(let i=0;i<e.rangeCount;i++){let o=e.getRangeAt(i);if(!n.contains(o.commonAncestorContainer))continue;let s=this.blockElement(o.startContainer),a=this.blockElement(o.endContainer);t.push(s);while(s!==a&&s!==null)s=s.nextElementSibling,t.push(s)}return t}get selectedText(){let n=window.getSelection();if(n===null)return"";return this.selectedBlocks.length?n.toString():""}selectionChange=()=>{};_updatingBlockStyle=!1;handleSelectChange=(n)=>{if(this._updatingBlockStyle)return;let t=n.target?.closest(Sn.tagName);if(t==null)return;this.doCommand(t.value)};handleButtonClick=(n)=>{let t=n.target?.closest("button");if(t==null)return;this.doCommand(t.dataset.command)};content=[Sl({name:"toolbar",part:"toolbar",onClick:this.handleButtonClick,onChange:this.handleSelectChange}),mh({part:"doc",contenteditable:!0,style:{flex:"1 1 auto",outline:"none"}}),Sl({part:"content"})];doCommand(n){if(n===void 0)return;let e=n.split(",");console.log("execCommand",e[0],!1,...e.slice(1)),document.execCommand(e[0],!1,...e.slice(1))}updateBlockStyle(){let n=this.parts.toolbar.querySelector(".block-style");if(n===null)return;let e=this.selectedBlocks.map((t)=>t.tagName);e=[...new Set(e)],this._updatingBlockStyle=!0,n.value=e.length===1?`formatBlock,${e[0]}`:"",this._updatingBlockStyle=!1}hasContent(){return(this.parts.doc.textContent||"").trim().length>0}handleInput=()=>{if(this.internals)this.internals.setFormValue(this.parts.doc.innerHTML),this.updateValidity()};updateValidity(){if(this.internals)if(this.required&&!this.hasContent())this.internals.setValidity({valueMissing:!0},"Please enter some content",this.parts.doc);else this.internals.setValidity({})}connectedCallback(){super.connectedCallback();let{doc:n,content:e}=this.parts;if(e.innerHTML!==""&&n.innerHTML==="")n.innerHTML=e.innerHTML,e.innerHTML="";this.isInitialized=!0,e.style.display="none",n.addEventListener("input",this.handleInput),this.updateValidity(),document.addEventListener("selectionchange",(t)=>{this.updateBlockStyle(),this.selectionChange(t,this)})}render(){let{toolbar:n}=this.parts;if(super.render(),n.children.length===0)switch(this.widgets){case"minimal":n.append(...wh());break;case"default":n.append(...Ol());break}}}var vh=hi,Pl=hi.elementCreator(),kh=en((...n)=>Pl(...n),"richText is deprecated, use tosiRichText instead (tag is now <tosi-rich-text>)");var{div:Ch,slot:jh,label:Bh,span:Sh,input:Il}=x;class Se extends f{static preferredTagName="tosi-segmented";static formAssociated=!0;static initAttributes={direction:"row",other:"",multiple:!1,name:"",placeholder:"Please specify…",localized:!1,required:!1};_choices=[];get choices(){return this._choices}set choices(n){if(typeof n==="string")this._choices=Se.parseChoicesString(n);else this._choices=n;this.queueRender()}static parseChoicesString(n){return n.split(",").filter((e)=>e.trim()!=="").map((e)=>{let[t,i]=e.split("=").map((r)=>r.trim()),[o,s]=(i||t).split(":").map((r)=>r.trim()),a=s?m[s]():"";return{value:t,icon:a,caption:o}})}value="";formDisabledCallback(n){}formResetCallback(){this.value=""}get values(){return(this.value||"").split(",").map((n)=>n.trim()).filter((n)=>n!=="")}content=()=>[jh(),Ch({part:"options"},Il({part:"custom",hidden:!0}))];static shadowStyleSpec={":host":{display:"inline-flex",gap:u.segmentedOptionGap("8px"),alignItems:u.segmentedAlignItems("center")},":host, :host::part(options)":{flexDirection:u.segmentedDirection("row")},":host label":{display:"inline-grid",alignItems:"center",gap:u.segmentedOptionGap("8px"),gridTemplateColumns:u.segmentedOptionGridColumns("0px 24px 1fr"),padding:u.segmentedOptionPadding("4px 12px"),font:u.segmentedOptionFont("16px")},":host label:focus":{outline:"none",boxShadow:u.segmentedFocusShadow(`inset 0 0 0 2px ${u.segmentedOptionCurrentBackground("#44a")}`),borderRadius:u.segmentedOptionsBorderRadius("8px")},":host label:has(:checked)":{color:u.segmentedOptionCurrentColor("#eee"),background:u.segmentedOptionCurrentBackground("#44a")},":host label:has(:checked):focus":{boxShadow:u.segmentedCurrentFocusShadow(`inset 0 0 0 2px ${u.segmentedOptionCurrentColor("#eee")}`)},":host svg":{height:u.segmentOptionIconSize("16px"),stroke:u.segmentedOptionIconColor("currentColor")},":host label.no-icon":{gap:0,gridTemplateColumns:u.segmentedOptionGridColumns("0px 1fr")},':host input[type="radio"], :host input[type="checkbox"]':{visibility:u.segmentedInputVisibility("hidden")},":host::part(options)":{display:"flex",borderRadius:u.segmentedOptionsBorderRadius("8px"),background:u.segmentedOptionsBackground("#fff"),color:u.segmentedOptionColor("#222"),overflow:"hidden",alignItems:u.segmentedOptionAlignItems("stretch")},":host::part(custom)":{padding:u.segmentedOptionPadding("4px 12px"),color:u.segmentedOptionCurrentColor("#eee"),background:u.segmentedOptionCurrentBackground("#44a"),font:u.segmentedOptionFont("16px"),border:"0",outline:"none"},":host::part(custom)::placeholder":{color:u.segmentedOptionCurrentColor("#eee"),opacity:u.segmentedPlaceholderOpacity(0.75)}};valueChanged=!1;handleChange=()=>{let{options:n,custom:e}=this.parts;if(this.multiple){let t=[...n.querySelectorAll("input:checked")];this.value=t.map((i)=>i.value).join(",")}else{let t=n.querySelector("input:checked");if(!t)this.value="";else if(t.value)e.setAttribute("hidden",""),this.value=t.value;else e.removeAttribute("hidden"),e.focus(),e.select(),this.value=e.value}this.valueChanged=!0};handleKey=(n)=>{let e=!1;switch(n.code){case"Space":if(n.target instanceof HTMLLabelElement)n.target.click(),e=!0;break;case"Tab":if(!(n.target instanceof HTMLLabelElement))n.target.closest("label").focus();break;case"ArrowLeft":case"ArrowUp":{let t=n.target.closest("label");if(t.previousElementSibling instanceof HTMLLabelElement)t.previousElementSibling.focus()}e=!0;break;case"ArrowRight":case"ArrowDown":{let t=n.target.closest("label");if(t.nextElementSibling instanceof HTMLLabelElement)t.nextElementSibling.focus()}e=!0;break}if(e)n.preventDefault(),n.stopPropagation()};connectedCallback(){super.connectedCallback();let n=this.getAttribute("choices");if(n&&this._choices.length===0)this._choices=Se.parseChoicesString(n);let{options:e}=this.parts;if(this.name==="")this.name=this.instanceId;if(e.addEventListener("change",this.handleChange),e.addEventListener("keydown",this.handleKey),this.other&&this.multiple)console.warn(this,"is set to [other] and [multiple]; [other] will be ignored"),this.other=""}get _choicesWithOther(){let n=[...this.choices];if(this.other&&!this.multiple){let[e,t]=this.other.split(":");n.push({value:"",caption:e,icon:t})}return n}get isOtherValue(){return Boolean(this.value===""||this.value&&!this._choicesWithOther.find((n)=>n.value===this.value))}render(){if(super.render(),this.valueChanged){this.valueChanged=!1;return}let{options:n,custom:e}=this.parts;n.textContent="";let t=this.multiple?"checkbox":"radio",{values:i,isOtherValue:o}=this;if(n.append(...this._choicesWithOther.map((s)=>{return Bh({tabindex:0},Il({type:t,name:this.name,value:s.value,checked:i.includes(s.value)||s.value===""&&o,tabIndex:-1}),s.icon||{class:"no-icon"},this.localized?zn(s.caption):Sh(s.caption))})),this.other&&!this.multiple)e.hidden=!o,e.value=o?this.value:"",e.placeholder=this.placeholder,n.append(e)}}var Ah=Se,Tl=Se.elementCreator(),zh=en((...n)=>Tl(...n),"xinSegmented is deprecated, use tosiSegmented instead (tag is now <tosi-segmented>)");var{slot:Vl}=x;class ss extends f{static preferredTagName="tosi-sizebreak";static initAttributes={minWidth:0,minHeight:0};value="normal";content=[Vl({part:"normal"}),Vl({part:"small",name:"small"})];static shadowStyleSpec={":host":{display:"inline-block",position:"relative"}};onResize=()=>{let{normal:n,small:e}=this.parts,t=this.offsetParent;if(!(t instanceof HTMLElement))return;else if(t.offsetWidth<this.minWidth||t.offsetHeight<this.minHeight)n.hidden=!0,e.hidden=!1,this.value="small";else n.hidden=!1,e.hidden=!0,this.value="normal"};connectedCallback(){super.connectedCallback(),globalThis.addEventListener("resize",this.onResize)}disconnectedCallback(){super.disconnectedCallback(),globalThis.removeEventListener("resize",this.onResize)}}var as=ss.elementCreator();class ci extends f{static preferredTagName="tosi-sizer";target=null;static shadowStyleSpec={":host":{_resizeIconFill:"#222",display:"block",position:"absolute",bottom:-7,right:-7,padding:14,width:44,height:44,opacity:0.25,transition:"opacity 0.25s ease-out"},":host(:hover)":{opacity:0.5},":host svg":{width:16,height:16,stroke:d.resizeIconFill}};content=m.resize();get minSize(){let{minWidth:n,minHeight:e}=getComputedStyle(this.target);return{width:parseFloat(n)||32,height:parseFloat(e)||32}}resizeTarget=(n)=>{let{target:e}=this;if(!e)return;let{offsetWidth:t,offsetHeight:i}=e;e.style.left=e.offsetLeft+"px",e.style.top=e.offsetTop+"px",e.style.bottom="",e.style.right="";let{minSize:o}=this;an(n,(s,a,r)=>{if(e.style.width=Math.max(o.width,t+s)+"px",e.style.height=Math.max(o.height,i+a)+"px",r.type==="mouseup")return!0},"nwse-resize")};connectedCallback(){if(super.connectedCallback(),!this.target)this.target=this.parentElement;let n={passive:!0};this.addEventListener("mousedown",this.resizeTarget,n),this.addEventListener("touchstart",this.resizeTarget,n)}}var Oh=ci,ql=ci.elementCreator(),Ph=ql;var{div:Ih,input:Th,span:Vh,button:ls}=x;class at extends f{static preferredTagName="tosi-tag";static lightStyleSpec={":host":{"--tag-close-button-color":"#000c","--tag-close-button-bg":"#fffc","--tag-button-opacity":"0.5","--tag-button-hover-opacity":"0.75","--tag-bg":u.brandColor("blue"),"--tag-text-color":u.brandTextColor("white"),display:"inline-flex",borderRadius:u.tagRoundedRadius(d.spacing50),color:d.tagTextColor,background:d.tagBg,padding:`0 ${d.spacing75} 0 ${d.spacing75}`,height:`calc(${d.lineHeight} + ${d.spacing50})`,lineHeight:`calc(${d.lineHeight} + ${d.spacing50})`},':host > [part="caption"]':{position:"relative",whiteSpace:"nowrap",overflow:"hidden",flex:"1 1 auto",fontSize:u.fontSize("16px"),color:d.tagTextColor,textOverflow:"ellipsis"},':host [part="remove"]':{boxShadow:"none",margin:`0 ${d.spacing_50} 0 ${d.spacing25}`,padding:0,display:"inline-flex",alignItems:"center",alignSelf:"center",justifyContent:"center",height:d.spacing150,width:d.spacing150,color:d.tagCloseButtonColor,background:d.tagCloseButtonBg,borderRadius:u.tagCloseButtonRadius("99px"),opacity:d.tagButtonOpacity},':host [part="remove"]:hover':{background:d.tagCloseButtonBg,opacity:d.tagButtonHoverOpacity}};static initAttributes={caption:"",removeable:!1};removeCallback=()=>{this.remove()};content=()=>[Vh({part:"caption"},this.caption),ls(m.x(),{type:"button",part:"remove",hidden:!this.removeable,ariaLabel:`Remove ${this.caption}`,onClick:this.removeCallback})]}var qh=at,rs=at.elementCreator(),_h=en((...n)=>rs(...n),"xinTag is deprecated, use tosiTag instead (tag is now <tosi-tag>)");class Ae extends f{static preferredTagName="tosi-tag-list";static lightStyleSpec={":host":{"--tag-list-bg":"#f8f8f8","--touch-size":"44px","--spacing":"16px",display:"grid",gridTemplateColumns:"auto",alignItems:"center",background:d.tagListBg,gap:d.spacing25,borderRadius:u.taglistRoundedRadius(d.spacing50),overflow:"hidden"},":host[editable]":{gridTemplateColumns:`0px auto ${d.touchSize}`},":host[editable][text-entry]":{gridTemplateColumns:`0px 2fr 1fr ${d.touchSize}`},':host [part="tagContainer"]':{display:"flex",content:'" "',alignItems:"center",background:d.inputBg,borderRadius:u.tagContainerRadius(d.spacing50),boxShadow:d.borderShadow,flexWrap:"nowrap",overflow:"auto hidden",gap:d.spacing25,minHeight:`calc(${d.lineHeight} + ${d.spacing})`,padding:d.spacing25},':host [part="tagMenu"]':{width:d.touchSize,height:d.touchSize,lineHeight:d.touchSize,textAlign:"center",padding:0,margin:0},":host [hidden]":{display:"none !important"},':host button[part="tagMenu"]':{background:d.brandColor,color:d.brandTextColor}};static formAssociated=!0;static initAttributes={name:"",textEntry:!1,editable:!1,placeholder:"enter tags",disabled:!1,required:!1};value="";get tags(){return this.value.split(",").map((n)=>n.trim()).filter((n)=>n!=="")}set tags(n){this.value=n.join(",")}_availableTags=[];get availableTags(){return this._availableTags}set availableTags(n){if(typeof n==="string")this._availableTags=Ae.parseAvailableTagsString(n);else this._availableTags=n;this.queueRender()}static parseAvailableTagsString(n){return n.split(",").map((e)=>{let t=e.trim();return t===""?null:t})}connectedCallback(){super.connectedCallback();let n=this.getAttribute("available-tags");if(n&&this._availableTags.length===0)this._availableTags=Ae.parseAvailableTagsString(n)}formDisabledCallback(n){this.disabled=n}formResetCallback(){this.value=""}addTag=(n)=>{let e=n.trim();if(e===""||this.tags.includes(e))return;this.tags=[...this.tags,e],this.queueRender(!0)};toggleTag=(n)=>{if(this.tags.includes(n))this.tags=this.tags.filter((e)=>e!==n),this.queueRender(!0);else this.addTag(n)};enterTag=(n)=>{let{tagInput:e}=this.parts;switch(n.key){case",":{let t=e.value.split(",")[0];this.addTag(t)}break;case"Enter":{let t=e.value.split(",")[0];this.addTag(t)}n.stopPropagation(),n.preventDefault();break;default:}};popSelectMenu=()=>{let{toggleTag:n}=this,{tagMenu:e}=this.parts,t=[...this.availableTags],i=this.tags.filter((s)=>!t.includes(s));if(i.length)t.push(null,...i);let o=t.map((s)=>{if(s===""||s===null)return null;else if(typeof s==="object")return{checked:()=>this.tags.includes(s.value),caption:s.caption,action(){n(s.value)}};else return{checked:()=>this.tags.includes(s),caption:s,action(){n(s)}}});X({target:e,width:"auto",menuItems:o})};content=()=>[ls({type:"button",style:{visibility:"hidden"},tabindex:-1}),Ih({part:"tagContainer",class:"row",role:"list",ariaLabel:"Selected tags"}),Th({part:"tagInput",class:"elastic",ariaLabel:"Enter new tag",onKeydown:this.enterTag}),ls({type:"button",title:"add tag",ariaLabel:"Select tags from list",ariaHaspopup:"listbox",part:"tagMenu",onClick:this.popSelectMenu},m.chevronDown())];removeTag=(n)=>{if(this.editable&&!this.disabled){let e=n.target.closest(at.tagName);this.tags=this.tags.filter((t)=>t!==e.caption),e.remove(),this.queueRender(!0)}n.stopPropagation(),n.preventDefault()};render(){super.render();let{tagContainer:n,tagMenu:e,tagInput:t}=this.parts;if(e.disabled=this.disabled,t.value="",t.setAttribute("placeholder",this.placeholder),this.editable&&!this.disabled)e.toggleAttribute("hidden",!1),t.toggleAttribute("hidden",!this.textEntry);else e.toggleAttribute("hidden",!0),t.toggleAttribute("hidden",!0);n.textContent="";for(let i of this.tags)n.append(rs({caption:i,removeable:this.editable&&!this.disabled,removeCallback:this.removeTag}))}}var Dh=Ae,_l=Ae.elementCreator(),Nh=en((...n)=>_l(...n),"xinTagList is deprecated, use tosiTagList instead (tag is now <tosi-tag-list>)");var pi="1.4.6";var ds={accent:v.fromCss("#EE257B"),background:v.fromCss("#fafafa"),text:v.fromCss("#222222")},Dl={_tosiSpacingXs:"4px",_tosiSpacingSm:"8px",_tosiSpacing:"12px",_tosiSpacingLg:"16px",_tosiSpacingXl:"24px",_tosiFontFamily:"system-ui, -apple-system, sans-serif",_tosiFontSize:"16px",_tosiLineHeight:"1.5",_tosiCodeFontFamily:"ui-monospace, monospace",_tosiCodeFontSize:"14px",_tosiTouchSize:"44px",_tosiBorderRadius:"4px",_tosiBorderRadiusLg:"8px",_tosiTransition:"0.15s ease-out"};function Uh(n){let{accent:e,background:t,text:i}=n,o=n.accentText??e.contrasting(),s=n.backgroundInset??t.darken(0.03),a=n.border??i.opacity(0.15),r=n.shadow??i.opacity(0.1),l=n.focus??e.opacity(0.5);return{_tosiAccent:e,_tosiAccentLight:e.brighten(0.15),_tosiAccentDark:e.darken(0.15),_tosiAccentText:o,_tosiBg:t,_tosiBgInset:s,_tosiBgHover:t.darken(0.05),_tosiBgActive:t.darken(0.1),_tosiText:i,_tosiTextMuted:i.opacity(0.6),_tosiTextDisabled:i.opacity(0.4),_tosiBorder:a,_tosiBorderFocus:e,_tosiShadow:r,_tosiShadowColor:r,_tosiFocusRing:`0 0 0 2px ${l}`,_tosiInputBg:t,_tosiInputBorder:a,_tosiInputBorderFocus:e,_tosiButtonBg:t,_tosiButtonText:i,_tosiButtonBorder:a,_tosiButtonHoverBg:t.darken(0.05),_tosiButtonActiveBg:e,_tosiButtonActiveText:o}}function ui(n){return{":root":{...Dl,...Uh(n)}}}function Nl(n){let t=ui(n)[":root"];return{":root":Re(t)}}function Rh(n,e="tosi-theme"){Bn(e,n)}var Xh=ui(ds),Fh=Nl(ds),Ul={"--xin-icon-size":d.tosiIconSize,"--xin-icon-fill":d.tosiIconFill,"--xin-icon-stroke":d.tosiIconStroke,"--xin-tabs-bar-color":d.tosiTabsBarColor,"--xin-tabs-bar-height":d.tosiTabsBarHeight,"--xin-tabs-selected-color":d.tosiTabsSelectedColor,"--spacing":d.tosiSpacing,"--gap":d.tosiSpacingSm,"--touch-size":d.tosiTouchSize,"--background":d.tosiBg,"--text-color":d.tosiText,"--brand-color":d.tosiAccent,"--brand-text-color":d.tosiAccentText};function Wh(n){return{":root":{...ui(n)[":root"],...Ul}}}function Gh(n,e){let t={};for(let[i,o]of Object.entries(e)){let s=`--tosi-${n}-${i.replace(/([A-Z])/g,"-$1").toLowerCase()}`;t[i]=`var(${s}, ${o})`}return t}var Dn=v.fromCss("#EE257B");function Fl(){return{_textColor:"#222",_brandColor:Dn,_background:"#fafafa",_inputBg:"#fdfdfd",_backgroundShaded:"#f5f5f5",_navBg:Dn.rotate(30).desaturate(0.5).brighten(0.9),_barColor:Dn.opacity(0.4),_focusColor:Dn.opacity(0.7),_placeholderColor:Dn.opacity(0.4),_brandTextColor:Dn.rotate(30).brighten(0.9),_insetBg:Dn.rotate(45).brighten(0.8),_codeBg:Dn.rotate(-15).desaturate(0.5).brighten(0.9),_linkColor:Dn.rotate(-30).darken(0.5),_shadowColor:"#0004",_menuBg:"#fafafa",_menuItemActiveColor:"#000",_menuItemIconActiveColor:"#000",_menuItemActiveBg:"#aaa",_menuItemHoverBg:"#eee",_menuItemColor:"#222",_menuSeparatorColor:"#2224",_scrollThumbColor:"#0006",_scrollBarColor:"#0001"}}function Yh(){let n=Fl();return{...Re(n),_menuShadow:"0 0 0 2px #a0f3d680",_menuSeparatorColor:"#a0f3d640"}}function cs(n){return n==="dark"?Yh():Fl()}var Wl="tosijs-theme";function rt(){try{let n=localStorage.getItem(Wl);if(n)return JSON.parse(n)}catch(n){}return{colorScheme:"system",highContrast:"system"}}function Kh(n){try{localStorage.setItem(Wl,JSON.stringify(n))}catch(e){}}function ps(n,e){return n==="system"?e.colorScheme:n}function us(n,e){return n==="system"?e.contrast==="more":n}function ys(n){return n?{filter:"contrast(1.5)"}:{filter:"none"}}var Rl=rt(),Xl=Xe(),{colorStyles:lt}=H({colorStyles:{":root":cs(ps(Rl.colorScheme,Xl)),body:ys(us(Rl.highContrast,Xl))}});Yi((n)=>{let e=rt();lt[":root"]=cs(ps(e.colorScheme,n)),lt.body=ys(us(e.highContrast,n))});function ms(n){let t={...rt(),...n};Kh(t);let i=Xe();lt[":root"]=cs(ps(t.colorScheme,i)),lt.body=ys(us(t.highContrast,i))}var Qh={"@import":"https://fonts.googleapis.com/css2?family=Aleo:ital,wght@0,100..900;1,100..900&famiSpline+Sans+Mono:ital,wght@0,300..700;1,300..700&display=swap",":root":{_fontFamily:"'Aleo', sans-serif",_codeFontFamily:"'Spline Sans Mono', monospace",_fontSize:"16px",_codeFontSize:"14px",_spacing:"10px",_lineHeight:d.fontSize160,_h1Scale:"2",_h2Scale:"1.5",_h3Scale:"1.25",_touchSize:"32px",_headerHeight:`calc(${d.lineHeight} * ${d.h2Scale} + ${d.spacing200})`},"*":{boxSizing:"border-box",scrollbarColor:`${d.scrollThumbColor} ${d.scrollBarColor}`,scrollbarWidth:"thin"},body:{fontFamily:d.fontFamily,fontSize:d.fontSize,margin:"0",lineHeight:d.lineHeight,background:d.background,_linkColor:d.brandColor,_xinTabsSelectedColor:d.brandColor,_xinTabsBarColor:d.brandTextColor,_menuItemIconColor:d.brandColor,color:d.textColor},"input, button, select, textarea":{fontFamily:d.fontFamily,fontSize:d.fontSize,color:"currentColor",background:d.inputBg},select:{WebkitAppearance:"none",appearance:"none"},header:{background:d.brandColor,color:d.brandTextColor,_textColor:d.brandTextColor,_linkColor:d.transTextColor,display:"flex",alignItems:"center",padding:"0 var(--spacing)",lineHeight:"calc(var(--line-height) * var(--h1-scale))",height:d.headerHeight,whiteSpace:"nowrap"},h1:{color:d.brandColor,fontSize:"calc(var(--font-size) * var(--h1-scale))",lineHeight:"calc(var(--line-height) * var(--h1-scale))",fontWeight:"400",borderBottom:`4px solid ${d.barColor}`,margin:`${d.spacing} 0 ${d.spacing200}`,padding:0},"header h2":{color:d.brandTextColor,whiteSpace:"nowrap"},h2:{color:d.brandColor,fontSize:"calc(var(--font-size) * var(--h2-scale))",lineHeight:"calc(var(--line-height) * var(--h2-scale))",margin:"calc(var(--spacing) * var(--h2-scale)) 0"},h3:{fontSize:"calc(var(--font-size) * var(--h3-scale))",lineHeight:"calc(var(--line-height) * var(--h3-scale))",margin:"calc(var(--spacing) * var(--h3-scale)) 0"},main:{alignItems:"stretch",display:"flex",flexDirection:"column",maxWidth:"100vw",height:"100vh",overflow:"hidden"},"main > xin-sidenav":{height:"calc(100vh - var(--header-height))"},"main > xin-sidenav::part(nav)":{background:d.navBg},"input[type=search]":{borderRadius:99},blockquote:{position:"relative",background:d.insetBg,margin:"0 48px 48px 0",borderRadius:d.spacing,padding:"var(--spacing) calc(var(--spacing) * 2)",filter:`drop-shadow(0px 1px 1px ${d.shadowColor})`},"blockquote > :first-child":{marginTop:"0"},"blockquote > :last-child":{marginBottom:"0"},"blockquote::before":{content:'" "',display:"block",width:1,height:1,border:"10px solid transparent",borderTopColor:d.insetBg,borderRightColor:d.insetBg,position:"absolute",bottom:-20,right:24},"blockquote::after":{content:'" "',width:48,height:48,display:"block",bottom:-48,right:-24,position:"absolute",background:Ge(m.tosi())},".bar":{display:"flex",gap:d.spacing,justifyContent:"center",alignItems:"center",padding:d.spacing,flexWrap:"wrap",_textColor:d.brandColor,background:d.barColor},a:{textDecoration:"none",color:d.linkColor,opacity:"0.9",borderBottom:"1px solid var(--brand-color)"},"button, select, .clickable":{transition:"ease-out 0.2s",background:d.brandTextColor,_textColor:d.brandColor,display:"inline-block",textDecoration:"none",padding:"0 calc(var(--spacing) * 1.25)",border:"none",borderRadius:"calc(var(--spacing) * 0.5)"},"button, select, clickable, input":{lineHeight:"calc(var(--line-height) + var(--spacing))"},"select:has(+ .icon-chevron-down)":{paddingRight:"calc(var(--spacing) * 2.7)"},"select + .icon-chevron-down":{marginLeft:"calc(var(--spacing) * -2.7)",width:"calc(var(--spacing) * 2.7)",alignSelf:"center",pointerEvents:"none",objectPosition:"left center",_textColor:d.brandColor},"label > select + .icon-chevron-down":{marginLeft:"calc(var(--spacing) * -3.5)"},"input, textarea":{border:"none",outline:"none",borderRadius:"calc(var(--spacing) * 0.5)"},input:{padding:"0 calc(var(--spacing) * 1.5)"},textarea:{padding:"var(--spacing) calc(var(--spacing) * 1.25)",lineHeight:d.lineHeight,minHeight:"calc(var(--spacing) + var(--line-height) * 4)"},"input[type='number']":{paddingRight:0,width:"6em",textAlign:"right"},"input[type=number]::-webkit-inner-spin-button":{margin:"1px 3px 1px 0.5em",opacity:1,inset:1},"input[type='checkbox'], input[type='radio']":{maxWidth:d.lineHeight},"::placeholder":{color:d.placeholderColor},img:{verticalAlign:"middle"},"button:hover, button:hover, .clickable:hover":{boxShadow:"inset 0 0 0 2px var(--brand-color)"},"button:active, button:active, .clickable:active":{background:d.brandColor,color:d.brandTextColor},label:{display:"inline-flex",gap:"calc(var(--spacing) * 0.5)",alignItems:"center"},".elastic":{flex:"1 1 auto",overflow:"hidden",position:"relative"},svg:{fill:"currentcolor",pointerEvents:"none"},"svg text":{fontSize:"16px",fontWeight:"bold",fill:"#000",stroke:"#fff8",strokeWidth:"0.5",opacity:"0"},"svg text.hover":{opacity:"1"},".thead":{background:d.brandColor,color:d.brandTextColor},".th + .th":{border:"1px solid #fff4",borderWidth:"0 1px"},".th, .td":{padding:"0 var(--spacing)"},".tr:not([aria-selected]):hover":{background:"#08835810"},"[aria-selected]":{background:"#08835820"},":disabled":{opacity:"0.5",filter:"saturate(0)",pointerEvents:"none"},pre:{background:d.codeBg,padding:d.spacing,borderRadius:"calc(var(--spacing) * 0.25)",overflow:"auto",fontSize:d.codeFontSize,lineHeight:"calc(var(--font-size) * 1.2)"},"pre, code":{fontFamily:d.codeFontFamily,_textColor:d.brandColor,fontSize:"90%"},".-xin-sidenav-visible .close-content":{display:"none"},".transparent, .iconic":{background:"none"},".iconic":{padding:"0",fontSize:"150%",lineHeight:"calc(var(--line-height) + var(--spacing))",width:"calc(var(--line-height) + var(--spacing))",textAlign:"center"},".transparent:hover, .iconic:hover":{background:"#0002",boxShadow:"none",color:d.textColor},".transparent:active, .iconic:active":{background:"#0004",boxShadow:"none",color:d.textColor},"xin-sidenav:not([compact]) .show-within-compact":{display:"none"},".on.on":{background:d.brandColor,_textColor:d.brandTextColor},".current":{background:d.background},".doc-link":{cursor:"pointer",borderBottom:"none",transition:"0.15s ease-out",marginLeft:"20px",padding:"calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5)"},".doc-link:not(.current):hover":{background:d.background},".doc-link:not(.current)":{opacity:"0.8",marginLeft:0},"xin-example":{margin:"var(--spacing) 0"},"xin-example .preview.preview":{padding:10},"xin-example [part=editors]":{background:d.insetBg},"[class*='icon-'], xin-icon":{color:"currentcolor",height:d.fontSize,pointerEvents:"none"},"[class*='icon-']":{verticalAlign:"middle"},".icon-plus":{content:"'+'"},table:{borderCollapse:"collapse"},thead:{background:d.brandColor,color:d.brandTextColor},tbody:{background:d.background},"tr:nth-child(2n)":{background:d.backgroundShaded},"th, td":{padding:"calc(var(--spacing) * 0.5) var(--spacing)"},"header xin-locale-picker xin-select button":{color:"currentcolor",background:"transparent",gap:"2px"},"img.logo, xin-icon.logo":{animation:"2s ease-in-out 0s infinite alternate logo-swing"},"@keyframes logo-swing":{"0%":{transform:"perspective(1000px) rotateY(15deg)"},"100%":{transform:"perspective(1000px) rotateY(-15deg)"}}};function Gl(){Bn("demo-colors",lt),Bn("demo-layout",Qh)}var yi=[{text:`# tosijs

<!--{ "pin": "top" }-->

> \`xinjs\` has been renamed \`tosijs\`. Updating the documentation and links is a
> work in progress. The goal is for the API to remain stable during the transition.
> If/when you want to migrate from \`xinjs\` to \`tosijs\`, here's a [guide for migrating to tosijs](/?Migration.md)

[tosijs.net](https://tosijs.net) | [tosijs-ui](https://ui.tosijs.net) | [github](https://github.com/tonioloewald/tosijs) | [npm](https://www.npmjs.com/package/tosijs) | [cdn](https://www.jsdelivr.com/package/npm/tosijs) | [react-tosijs](https://react.tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

[![tosijs is on NPM](https://badge.fury.io/js/tosijs.svg)](https://www.npmjs.com/package/tosijs)
[![tosijs is about 15kB gzipped](https://deno.bundlejs.com/?q=tosijs&badge=)](https://bundlejs.com/?q=tosijs&badge=)
[![tosijs on jsdelivr](https://data.jsdelivr.com/v1/package/npm/tosijs/badge)](https://www.jsdelivr.com/package/npm/tosijs)

<div style="text-align: center; margin: 20px">
  <xin-lottie style="display: inline-block; width: 280px; height: 280px; background: #da1167; border-radius: 40px" src="/tosi.json">
    <img style="width: 280px" alt="tosijs logo" src="https://tosijs.net/favicon.svg">
  </xin-lottie>
</div>

> For a pretty thorough overview of tosijs, you might like to start with [What is tosijs?](https://loewald.com/blog/2025/6/4/what-is-tosijs).
> To understand the thinking behind tosijs, there's [What should a front-end framework do?](https://loewald.com/blog/2025/6/4/what-should-a-front-end-framework-do).

### Build UIs with less code

If you want to build a web-application that's performant, robust, and maintainable,
\`tosijs\` lets you:

- build user-interfaces with pure javascript/typescript—no JSX, complex tooling, or spooky action-at-a-distance
- manage application state almost effortlessly—eliminate most binding code
- bind application state to the UI and services without locking yourself into a specific framework
- work in Typescript or Javascript
- use web-components, build your own web-components quickly and easily
- manage CSS efficiently and flexibly using CSS variables and Color computations
- leverage existing business logic and libraries without complex wrappers

\`\`\`js
import { elements, tosi, touch, deleteListItem } from 'tosijs'

const todo = {
  list: [],
  addItem(reminder) {
    if (reminder.trim()) {
      todo.list.push({ id: Math.random(), reminder })
    }
  },
}

todo.addItem('wash the cat')
todo.addItem('buy milk')

const { readmeTodoDemo } = tosi({ readmeTodoDemo: todo })

const { h4, ul, template, li, label, input } = elements
preview.append(
  h4('To Do List'),
  ul(
    ...readmeTodoDemo.list.listBinding(
      ({ li, button }, item) =>
        li(
          item.reminder,
          button('Done!', {
            style: {
              marginLeft: 10,
            },
            onClick(event) {
              deleteListItem(event.target)
            },
          })
        ),
      { idPath: 'id' }
    )
  ),
  label(
    'Reminder',
    input({
      placeholder: 'enter a reminder',
      onKeydown(event) {
        if (event.key === 'Enter') {
          event.preventDefault()
          readmeTodoDemo.addItem(event.target.value)
          event.target.value = ''
          touch(readmeTodoDemo)
        }
      },
    })
  )
)
\`\`\`

In general, \`tosijs\` is able to accomplish the same or better compactness, expressiveness,
and simplicity as you get with highly-refined React-centric toolchains, but without transpilation,
domain-specific-languages, or other tricks that provide "convenience" at the cost of becoming locked-in
to React, a specific state-management system (which permeates your business logic), and usually a specific UI framework.

\`tosijs\` lets you work with pure HTML and web-components as cleanly—more cleanly—and efficiently than
React toolchains let you work with JSX.

    export default function App() {
      return (
        <div className="App">
          <h1>Hello React</h1>
          <h2>Start editing to see some magic happen!</h2>
        </div>
      );
    }

Becomes:

    const { div, h1, h2 } = elements // exported from tosijs
    export const App = () => div(
      { class: 'App' },
      h1('Hello tosijs'),
      h2('Start editing to see some magic happen!')
    )

Except this reusable component outputs native DOM nodes. No transpilation, spooky magic at a distance,
or virtual DOM required. And it all works just as well with web-components. This is what you get when
you run App() in the console:

    ▼ <div class="App">
        <h1>Hello tosijs</h1>
        <h2>Start editing to see some magic happen!</h2>
      </div>

The ▼ is there to show that's **DOM nodes**, not HTML.

\`tosijs\` lets you lean into web-standards and native browser functionality while writing less code that's
easier to run, debug, deploy, and maintain. Bind data direct to standard input elements—without having
to fight their basic behavior—and now you're using _native_ functionality with _deep accessibility_ support
as opposed to whatever the folks who wrote the library you're using have gotten around to implementing.

> **Aside**: \`tosijs\` will also probably work perfectly well with \`Angular\`, \`Vue\`, et al, but I haven't
> bothered digging into it and don't want to deal with \`ngZone\` stuff unless someone is paying
> me.

If you want to build your own \`web-components\` versus use something off-the-rack like
[Shoelace](https://shoelace.style), \`tosijs\` offers a \`Component\` base class that, along with
its \`elements\` and \`css\` libraries allows you to implement component views in pure Javascript
more compactly than with \`jsx\` (and without a virtual DOM).

    import { Component, elements, css } from 'tosijs'

    const { h1, slot } = elements
    export class MyComponent extends Component {
      static shadowStyleSpec = css({
        h1: {
          color: 'blue'
        }
      })
      content = [ h1('hello world'), slot() ]
    }

The difference is that \`web-components\` are drop-in replacements for standard HTML elements
and interoperate happily with one-another and other libraries, load asynchronously,
and are natively supported by all modern browsers.

## What \`tosijs\` does

### Observe Object State

\`tosijs\` tracks the state of objects you assign to it using \`paths\` allowing economical
and direct updates to application state.

    import { tosi, observe } from 'tosijs'

    const { app } = tosi({
      app: {
        prefs: {
          darkmode: false
        },
        docs: [
          {
            id: 1234,
            title: 'title',
            body: 'markdown goes here'
          }
        ]
      }
    })

    observe('app.prefs.darkmode', () => {
      document.body.classList.toggle('dark-mode', app.prefs.darkmode.value)
    })

    observe('app.docs', () => {
      // render docs
    })

> #### What does \`tosi\` do, and what is a \`BoxedProxy\`?
>
> \`tosi\` is syntax sugar for assigning something to \`xin\` (which is a proxy over
> the central registry) and then getting it back out as a \`BoxedProxy\`.
>
> A \`BoxedProxy\` is an [ES Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
> wrapped around an \`object\` (which in Javascript means anything
> that has a \`constructor\` which in particular includes \`Array\`s, \`class\` instances, \`function\`s
> and so on, but not "scalars" like \`number\`s, \`string\`s, \`boolean\`s, \`null\`, and \`undefined\`)
>
> All you need to know about a \`BoxedProxy\` is that it's a Proxy wrapped around your original
> object that allows you to interact with the object normally, but which allows \`tosijs\` to
> **observe** changes made to the wrapped object and tell interested parties about the changes.
>
> If you want the original object back you can use \`.value\` on any proxy to unwrap it.

### No Tax, No Packaging

\`tosijs\` does not modify the stuff you hand over to it… it just wraps objects
with a \`Proxy\` and then if you use \`xin\` to make changes to those objects,
\`tosijs\` will notify any interested observers.

**Note** \`tosi({foo: {...}})\` is syntax sugar for \`xin.foo = {...}\`.

    import { tosi, observe } from 'tosijs'
    const { foo } = tosi({
      foo: {
        bar: 17
      }
    })

    observe('foo.bar', (path) => {
      console.log('foo.bar was changed to', foo.bar.value)
    })

    foo.bar = 17        // does not trigger the observer
    foo.bar = Math.PI   // triggers the observer

### Paths are like JavaScript

\`xin\` is designed to behave just like a JavaScript \`Object\`. What you put
into it is what you get out of it:

    import { xin } from 'tosijs'

    const foo = {bar: 'baz'}
    xin.foo = foo

    // xin.foo returns the value directly
    xin.foo.bar === 'baz'

    // really, it's just the original object
    xin.foo.bar = 'lurman'
    foo.bar === 'lurman' // true

    // seriously, it's just the original object
    foo.bar = 'luhrman'
    xin.foo.bar === 'luhrman' // true

### …but better!

It's very common to deal with arrays of objects that have unique id values,
so \`tosijs\` supports the idea of id-paths

    import { tosi, xin } from 'tosijs'

    const { app } = tosi({
      app: {
        list: [
          {
            id: '1234abcd',
            text: 'hello world'
          },
          {
            id: '5678efgh',
            text: 'so long, redux'
          }
        ]
      }
    })

    console.log(app.list[0].text)              // hello world
    console.log(app.list['id=5678efgh'])       // so long, redux
    console.log(xin['app.list[id=1234abcd]'])  // hello world

### Telling \`xin\` about changes using \`touch()\`

Sometimes you will modify an object behind \`xin\`'s back (e.g. for efficiency).
When you want to trigger updates, simply touch the path.

    import { xin, observe, touch } from 'tosijs'

    const foo = { bar: 17 }
    xin.foo = foo
    observe('foo.bar', (path) => console.log(path, '->', xin[path]))
    xin.foo.bar = -2              // console will show: foo.bar -> -2

    foo.bar = 100                 // nothing happens
    touch('foo.bar')              // console will show: foo.bar -> 100

Every \`BoxedProxy\` also has a \`.touch()\` method:

    app.user.name.touch()     // force update for a scalar
    app.items[2].touch()      // force update for a list item

For list items with \`idPath\`, \`.touch()\` automatically synthesizes the
equivalent id-path touch, so DOM bindings update correctly.

### List Operations

Proxied arrays have \`listFind\`, \`listUpdate\`, and \`listRemove\` methods
for common list operations:

    // Find — returns proxied item (mutations trigger observers)
    const item = app.items.listFind((item) => item.id, 'abc')

    // Find by DOM element (in click handlers)
    const item = app.items.listFind(clickedElement)

    // Upsert — update in place or push if not found
    app.items.listUpdate((item) => item.id, { id: 'abc', name: 'New' })

    // Remove — returns true if found
    app.items.listRemove((item) => item.id, 'abc')

\`listUpdate\` preserves object identity — it mutates the existing object
property by property, so only changed properties fire observers and DOM
elements are reused (no teardown/recreation).

### CSS

\`tosijs\` includes utilities for working with css.

    import { css, vars } from 'tosijs'

The \`vars\` proxy converts camelCase properties into css variable references:

    vars.fooBar // emits 'var(--foo-bar)'
    \`calc(\${vars.width} + 2 * \${vars.spacing})\` // emits 'calc(var(--width) + 2 * var(--spacing))'

\`css()\` processes an object, rendering it as CSS:

    css({
      '.container': {
        position: 'relative'
      }
    }) // emits .container { position: relative; }

CSS variables can be declared using \`_\` and \`__\` prefixes in \`css()\` objects:

    css({
      ':root': {
        _textFont: 'sans-serif',   // emits --text-font: sans-serif
        _color: '#111',            // emits --color: #111
      }
    })

## Color

\`tosijs\` includes a powerful \`Color\` class for manipulating colors.

    import { Color } from 'tosijs'
    const translucentBlue = new Color(0, 0, 255, 0.5) // r, g, b, a parameters
    const postItBackground = Color.fromCss('#e7e79d')
    const darkGrey = Color.fromHsl(0, 0, 0.2)

The color objects have computed properties for rendering the color in different ways,
making adjustments, blending colors, and so forth.

Use \`invertLuminance()\` to generate dark-mode equivalents of color values.

## Hot Reload

One of the nice things about working with the React toolchain is hot reloading.
\`tosijs\` supports hot reloading (and not just in development!) via the \`hotReload()\`
function:

    import { xin, hotReload } from 'tosijs'

    xin.app = {
      ...
    }

    hotReload()

\`hotReload\` stores serializable state managed by \`xin\` in localStorage and restores
it (by overlay) on reload. Because any functions (for example) won't be persisted,
simply call \`hotReload\` after initializing your app state and you're good to go.

\`hotReload\` accepts a test function (path => boolean) as a parameter.
Only top-level properties in \`xin\` that pass the test will be persisted.

To completely reset the app, run \`localStorage.clear()\` in the console.

## Development Notes

You'll need to install [bun](https://bun.sh/) and then run \`bun install\`.

    bun start                  # dev server with hot reload (https://localhost:8018)
    bun test                   # run all tests
    bun run dev.ts --build     # production build (runs tests, then bundles)
    bun run format             # lint and format (ESLint + Prettier)
    bun pack                   # create local package tarball

## Related Libraries

- [tosijs-ui](https://ui.tosijs.net) — a web-component library built on tosijs \`Component\`
- [tosijs-3d](https://3d.tosijs.net) — 3D graphics library built on tosijs
- [react-tosijs](https://github.com/tonioloewald/react-tosijs#readme) — use tosijs's path-observer model in [React](https://reactjs.org) apps

## Credits

\`tosijs\` is in essence a highly incompatible update to \`b8rjs\` with the goal
of removing cruft, supporting more use-cases, and eliminating functionality
that has been made redundant by improvements to the JavaScript language and
DOM APIs.

\`tosijs\` is being developed using [bun](https://bun.sh/).
\`bun\` is crazy fast (based on Webkit's JS engine, vs. V8), does a lot of stuff
natively, and runs TypeScript (with import and require) directly.

Logo animation by [@anicoremotion](https://pro.fiverr.com/freelancers/anicoremotion).
`,title:"tosijs",filename:"README.md",path:"README.md",pin:"top"},{text:`# 0. Building Apps with tosijs

<!--{}-->

> This guide explains how to think about building applications with tosijs.
> It's not an API reference — it's a mental model. If you're coming from React
> or another reactive framework, this is the most important thing to read first.

## The Downhill Model

In React, data flows "uphill." A child component needs to tell a parent something
happened, so you lift state up, pass callbacks down, drill props through layers
of components, and eventually something re-renders — often much more than needed.
You fight the framework to avoid unnecessary work.

tosijs works downhill. State changes at the top. The UI updates at the bottom.
Nothing in between needs to know about it.

    state changes → observers fire → bound DOM updates

There's no virtual DOM, no diffing, no reconciliation. When \`user.name\` changes,
the one \`<span>\` bound to \`user.name\` updates. Nothing else re-renders.

The key concept is the **path**. Where React thinks in terms of a component tree,
tosijs thinks in terms of addresses: \`app.user.name\` is a path. Bindings watch
paths. Mutations fire on paths. Everything in tosijs routes through paths — that's
why binding to a specific scalar path is so much more efficient than binding to
an object and diffing.

## The Three Steps

### 1. Put your state in a proxy

    const { app } = tosi({
      app: {
        user: { name: 'Alice', email: 'alice@example.com' },
        messages: [],
        prefs: { darkMode: false }
      }
    })

This is your entire application state. It's a plain JavaScript object — your
business logic doesn't know tosijs exists. You can add methods to it.
You can pass pieces of it to functions. The proxy wrapping is invisible
to your code.

There's no \`dispatch\`, no \`setState\`, no action creators.
To change state, just change it:

    app.user.name.value = 'Bob'

The proxy sees the mutation and notifies anyone who cares.

> **TypeScript note:** \`app.user.name\` is a \`BoxedScalar<string>\`, not a
> raw string. Use \`.value\` to read or write the underlying primitive.
> At runtime, direct assignment works too, but TypeScript's type system
> can't express asymmetric get/set on mapped types.

This also means \`===\` doesn't work on proxied scalars — JavaScript
doesn't allow objects to be strictly equal to primitives:

    app.user.name === 'Bob'        // always false — comparing proxy to string
    app.user.name.value === 'Bob'  // correct

Reach for \`.value\` whenever you need the raw primitive — for comparisons,
assignments, or passing to external APIs.

### 2. Build your UI with bindings

    const { div, h1, input, ul } = elements

    const view = div(
      h1(app.user.name),
      input({ value: app.user.name }),
      div({ class: 'status', hidden: app.loggedIn })
    )

This is real DOM — not a template, not JSX, not a virtual representation.
You build it once. It doesn't re-render. You're writing a structure with
live bindings, not a render function that gets called over and over.

**Proxies become live bindings automatically.** Pass a proxy as a child
and it becomes a text-bound \`<span>\` — \`h1(app.user.name)\` just works
(at the cost of one extra DOM element; use \`textContent: app.user.name\`
if that bothers you). Pass a proxy as any property or attribute and tosijs
detects it and binds it — \`hidden: app.loggedIn\` stays in sync with state.
This eliminates the need for most custom bindings.

\`bindText\` and \`bindValue\` are shorthands that also handle \`fromDOM\`
(two-way binding). For anything truly custom, use
\`bind: { value, binding: { toDOM, fromDOM } }\`. A function is also
accepted as shorthand for \`{ toDOM: fn }\`:

    div({ bind: {
      value: app.prefs.darkMode,
      binding(el, isDark) {
        el.classList.toggle('dark', isDark)
      }
    }})

**Bind individual scalar values, not objects.** This is the key insight.
When you bind \`app.user.name\` to a \`<span>\`, tosijs sets up a listener
on that exact path. When only the name changes, only that \`<span>\` updates.

If you bound the entire \`app.user\` object and pulled out \`.name\` in a
\`toDOM\` function, the binding would fire on _any_ change to user — name,
email, whatever. You'd be doing React's job of figuring out what actually
changed. Don't. Let the path system do it for you.

**\`fromDOM\` bindings flow user input back to state** — an \`<input>\` with
\`bindValue: app.user.name\` writes directly to \`app.user.name\` when the
user types. Two-way binding with zero boilerplate.

**Conditional UI?** Don't think \`condition ? <A/> : <B/>\`. Instead,
build both and bind visibility:

    div(
      loginForm({ bind: {
        value: app.loggedIn,
        binding(el, loggedIn) { el.hidden = loggedIn }
      }}),
      dashboard({ bind: {
        value: app.loggedIn,
        binding(el, loggedIn) { el.hidden = !loggedIn }
      }})
    )

Both elements exist in the DOM. Bindings show/hide them. No teardown,
no re-creation, no lost state.

For large, expensive UI branches you don't want in the initial DOM at all,
just append them when needed — it's standard DOM manipulation:

    const container = div()
    app.showFeature.observe(() => {
      if (app.showFeature.value && !container.children.length) {
        container.append(buildExpensiveFeature())
      }
    })

No lazy-loading API, no \`Suspense\`, no dynamic imports. A function returns
an element, you put it in the DOM, bindings activate. That's it.

### 3. Use list bindings for collections

    ul(
      ...app.messages.listBinding(
        ({li, span}, msg) => li(
          span({ bindText: msg.sender }),
          span({ bindText: msg.body })
        ),
        {
          idPath: 'id',
          virtual: { height: 60 }
        }
      )
    )

This looks like \`...items.map(item => li(item.name))\` — familiar one-shot
rendering. It's not. The binding stays alive: additions, removals, and
property changes on \`app.messages\` automatically update the DOM. The
familiar mapping syntax is a Trojan horse for live list rendering.

Virtual list bindings only render what's visible. A list of a million
messages renders the same number of DOM nodes as a list of twenty.
Scrolling is O(1) — the same virtual slice calculation runs regardless
of list size.

**Always specify \`idPath\` for arrays of objects.** This enables surgical
updates — changing one property on one item updates one DOM element.
Without it, the list falls back to index-based paths that break on reorder.

> **Id values must not contain \`]\` characters.** Paths are encoded as
> \`list[id=value]\`, so a \`]\` in the value breaks the parser. Characters
> like \`[\`, \`=\`, and \`.\` are safe. Use numeric ids or UUIDs and you'll
> never hit this.

### Finding, updating, and removing list items

Proxied arrays have \`listFind\`, \`listUpdate\`, and \`listRemove\` methods
that use the same selector pattern as \`listBinding\`:

    // Find an item — returns proxied, so mutations trigger updates
    const item = app.items.listFind((item) => item.id, 'abc')
    if (item) item.name.value = 'Updated'

    // Find by DOM element (in a click handler)
    const item = app.items.listFind(e.target)

    // Update in place — preserves object identity and DOM elements
    app.items.listUpdate((item) => item.id, {
      id: 'abc', name: 'New Name', score: 100
    })

    // Remove
    app.items.listRemove((item) => item.id, 'abc')

\`listUpdate\` is the key one: it mutates the existing object property by
property through the proxy, so only changed properties fire observers and
the DOM element is reused. If the item doesn't exist, it pushes a new one.

## Proxied vs. Raw

The proxy is the core of tosijs, so understanding where it applies matters.

### \`for...of\` gives proxied items; callbacks give raw items

\`for...of\` on a proxied array yields proxied items — mutations trigger
observers. But \`forEach\`, \`map\`, and \`filter\` pass _raw_ items to callbacks.
Mutations inside these are invisible to tosijs.

    // for...of gives proxied items — mutations trigger observers
    for (const item of app.items) {
      item.score.value = 100  // observers fire
    }

    // forEach/map/filter pass raw items — mutations are silent
    app.items.forEach(item => {
      item.score = 100  // no observer fires
    })
    touch(app.items)  // manual touch needed after raw mutations

### \`this\` in proxied methods

Methods on proxied objects receive the proxy as \`this\`, which means
property access goes through the proxy. This is usually what you want —
mutations trigger observers automatically. But be aware that \`this.items\`
returns a proxied array, not a raw one:

    const todo = {
      items: [],
      add(text) {
        // \`this\` is the proxy — this push triggers observers
        this.items.push({ id: Date.now(), text, done: false })
      }
    }

If you need the raw value (e.g. for serialization), use
\`tosiValue(this.items)\` or \`this.items.value\`.

## Why This Works

### No component tree means no prop drilling

State lives in the \`tosi()\` proxy. Any element anywhere can bind to any path. You don't
need wrapper components to shuttle data through the hierarchy. A deeply
nested \`<span>\` can bind directly to \`app.user.name\` without any of its
ancestors knowing or caring.

### Business logic stays clean

Your data objects are just objects. They can have methods:

    const todo = {
      items: [],
      add(text) {
        this.items.push({ id: Date.now(), text, done: false })
      },
      toggle(id) {
        for (const item of this.items) {
          if (item.id.value === id) {
            item.done.value = !item.done.value
            break
          }
        }
      }
    }

    const { app } = tosi({ app: todo })

Note the \`toggle\` method uses \`for...of\` (which yields proxied items) and
\`.value\` for reads and writes. This ensures mutations trigger observers.
Array callbacks like \`find\` and \`forEach\` pass raw items — see
"Proxied vs. Raw" below.

No imports from tosijs needed in your business logic — though methods
called through the proxy receive proxied \`this\`, so your code does need
to be proxy-aware (using \`.value\` and \`for...of\`). You can test
\`todo.add()\` and \`todo.toggle()\` with plain unit tests.

### Deeply async by default

You can set up bindings before data exists. When data arrives — from a fetch,
a websocket, user input — the bindings just start working:

    const { app } = tosi({ app: { posts: [] } })

    // UI is already bound to app.posts
    // this just works whenever the fetch completes
    fetch('/api/posts')
      .then(r => r.json())
      .then(posts => { app.posts.value = posts })

No suspense boundaries, no effect hooks. The real UI is already mounted —
an empty bound list is your loading state, and it fills in with no layout
shift when data arrives. If you want an explicit loading indicator, bind one:

    div({ class: 'spinner', hidden: app.loaded })

That's a real element with a real binding, not a parallel placeholder UI
that gets swapped out. Other frameworks have you build two versions of your
UI and orchestrate the handoff. tosijs just has the UI, and it fills in.

Note the bare \`hidden: app.loaded\` — when you pass a proxy value as any
element property, tosijs detects it and creates a live binding automatically.
No \`bind: { value, binding }\` needed for simple property mappings.

Bindings to paths that don't exist yet are safe — they render as empty/blank
until data arrives. No \`TypeError: cannot read property of undefined\`.
The proxy intercepts the access; tosijs simply waits for the path to
materialize before firing the first update.

### \`observe()\` is for side effects, not rendering

In React you'd use \`useEffect\` for everything. In tosijs, DOM rendering
is handled by bindings. \`observe()\` is for _side effects_ — things that
aren't directly binding a value to a DOM property:

    app.prefs.darkMode.observe(() => {
      document.body.classList.toggle('dark', app.prefs.darkMode.value)
    })

The \`.observe()\` method on a boxed value watches that exact path. You can
also use the standalone \`observe()\` function for pattern matching:

    observe('app.prefs', () => { /* any pref changed */ })
    observe(/app\\.user\\./, path => { /* any user field changed */ })

Toggle a body class. Fire an analytics event. Persist to localStorage.
That's what \`observe()\` is for.

## Components

tosijs includes a \`Component\` base class for web components. A few things
to know:

### \`content()\` vs \`render()\`

- **\`content()\` runs once.** It builds the DOM during hydration and never
  re-runs. Set up bindings here — they handle all data-driven updates
  automatically.

- **\`render()\` runs on attribute changes.** It's for _structural_ changes
  driven by attributes — showing/hiding sections, swapping an \`<input>\`
  from \`type="text"\` to \`type="password"\`, reconfiguring layout. It is
  **not** for updating text, values, or display state.

The separation: **attributes drive structure, bindings drive content.**

    class MessageBubble extends Component {
      static initAttributes = { expanded: false }

      content = ({div, span}) => [
        span({ bindText: msg.sender }),
        div({
          class: 'body',
          bind: {
            // structure: show/hide based on attribute
            value: this.expanded,
            binding: (el, expanded) => { el.hidden = !expanded }
          }
        },
          span({ bindText: msg.body })  // content: flows through binding
        )
      ]
    }

**The anti-pattern** is writing an \`updateDisplay()\` method that manually
sets \`textContent\`, toggles classes, and shows/hides elements — then
calling it from event handlers. This recreates React's "render on every
change" model inside what should be a binding-driven system. If you find
yourself writing a method that walks the DOM and sets properties, those
should be bindings set up in \`content()\`.

When state lives in the \`tosi()\` proxy rather than in component instance
variables, bindings can reach it directly. A component that stores
\`this.isExpanded = true\` and manually propagates that to the DOM is
doing extra work — store it in the proxy and let bindings handle it.

### Light DOM is where the action is

From reading most web component documentation, you'd think shadow DOM was
the only option. It isn't. tosijs components use **light DOM by default**,
and this is a deliberate choice, not a limitation.

Shadow DOM gives you style encapsulation — great for word-processor-style
isolated widgets, but a memory and performance hit for everything else.
It also creates an encapsulation boundary that blocks path bindings,
external styling, and the usual DOM query APIs.

tosijs takes the one really valuable feature of shadow DOM components —
\`<slot>\` composition — and makes it work in the light DOM. You get:

- **Path bindings work everywhere.** No encapsulation boundary to cross.
- **CSS just works.** Style your components the same way you style everything else.
- **Lighter weight.** No shadow root overhead per instance.
- **Slot composition.** tosijs rewrites \`<slot>\` elements in light DOM components.

#### How \`<xin-slot>\` works

Native \`<slot>\` elements only work inside a shadow root. tosijs solves this
by automatically replacing any \`<slot>\` in a light DOM component with an
\`<xin-slot>\` custom element that provides the same composition behavior:
children with a matching \`slot="name"\` attribute get moved into the
corresponding \`<xin-slot name="name">\`, and unslotted children go into the
default (unnamed) \`<xin-slot>\`.

This happens during hydration — you write \`<slot>\` in your \`content()\` and
tosijs handles the rewrite transparently. You can also use \`xinSlot()\`
directly from the \`elements\` proxy if you need to set attributes like
\`class\` or \`style\` on the slot container (plain \`<slot>\` elements lose
non-\`name\` attributes during the rewrite).

\`\`\`
class CardLayout extends Component {
  content = ({ h3, xinSlot }) => [
    h3('Header'),
    xinSlot({ name: 'top', style: { background: '#eee' } }),
    h3('Body'),
    xinSlot(), // default slot
    h3('Footer'),
    xinSlot({ name: 'bottom' }),
  ]
}
\`\`\`

Two things to keep in mind:

- **\`:slotted\` doesn't apply** — there's no shadow DOM, so style slotted
  children with normal CSS selectors. You can use \`xin-slot\` as a selector.
- **The rewrite is one-way.** Once hydration runs, the DOM contains
  \`<xin-slot>\` elements. If you inspect the DOM, you'll see \`<xin-slot>\`,
  not \`<slot>\`.

Components declare their styles via static properties:

- **\`static shadowStyleSpec\`** — injected into the shadow DOM as a \`<style>\` element.
  Setting this causes the component to use shadow DOM.
- **\`static lightStyleSpec\`** — appended to \`document.head\` as a global \`<style>\`.
  \`:host\` selectors are rewritten to the component's tag name, so
  \`:host { display: flex }\` becomes \`my-tag { display: flex }\`.
- **\`static preferredTagName\`** — sets the tag name explicitly (survives minification).

> The older patterns — \`static styleSpec\` (alias for \`shadowStyleSpec\`) and
> passing \`{ tag, styleSpec }\` to \`elementCreator()\` — still work but are deprecated.

Use light DOM unless you know _exactly_ why you need shadow DOM.
When you do, the mental model is:

- **Light DOM** (default): bindings flow through naturally.
- **Shadow DOM**: self-contained islands that receive data via
  attributes/properties and manage their own internals. You handle
  rendering inside the shadow root yourself.

A good example: an email message bubble might use Shadow DOM for the
HTML body (CSS isolation from untrusted email styles) but keep
everything else — sender, subject, timestamps — in Light DOM with
normal bindings.

## Gotchas

### Observer callbacks receive paths, not values

Observer callbacks are called with the _path_ that changed, not the new value:

    app.prefs.darkMode.observe((path) => {
      // path is a string like 'app.prefs.darkMode'
      // to get the value, read it explicitly:
      const isDark = app.prefs.darkMode.value
      document.body.classList.toggle('dark', isDark)
    })

This is true for both the \`.observe()\` method and the standalone \`observe()\` function.

### \`touch()\` is the escape hatch

When you mutate state behind the proxy's back — from a raw reference,
inside a \`forEach\`, after a bulk operation — call \`touch()\` to
tell tosijs to propagate updates. Most of the time the proxy handles
this automatically. \`touch()\` is for when it can't.

Every boxed proxy has a \`.touch()\` method, and there's also a standalone
\`touch()\` function you can import:

    app.user.name.touch()     // on a scalar
    app.items[2].touch()      // on a list item
    touch(app.items)          // standalone, on an array
    touch('app.user')         // standalone, by path string

For list items with \`idPath\`, \`.touch()\` automatically synthesizes the
equivalent id-path touch, so DOM bindings update correctly even when you've
mutated the raw data behind the proxy's back.

\`touch()\` is also useful for **batch optimization**. If you need to make
many mutations, you can bypass the proxy, mutate the raw data directly,
and call \`touch()\` once at the end — one notification instead of N:

    const raw = app.items.value
    for (let i = 0; i < raw.length; i++) {
      raw[i].score = computeScore(raw[i])
    }
    touch(app.items)  // single update for all mutations

## The React Comparison, In Short

| React                     | tosijs                              |
| ------------------------- | ----------------------------------- |
| \`useState\` + \`setState\`   | assign via \`.value\`                 |
| \`useEffect\`               | \`observe()\` (but rarely needed)     |
| \`useMemo\` / \`useCallback\` | not needed — no re-renders to avoid |
| props / prop drilling     | bind directly to any path           |
| Context API               | everything is already global        |
| \`key\` prop on lists       | \`idPath\` on list bindings           |
| Virtual DOM diffing       | path-based direct DOM updates       |
| Component re-render       | individual binding updates          |
| ~45kB gzipped             | ~15kB gzipped (core)                |

The fundamental difference: React asks "what changed?" after every state update
and works backwards to figure out the minimum DOM update. tosijs knows exactly
what changed (the path) and updates exactly the DOM nodes bound to that path.
React is O(tree size). tosijs is O(bindings on the changed path).
`,title:"0. Building Apps with tosijs",filename:"Building-Apps.md",path:"Building-Apps.md"},{text:`# 1. tosi

\`tosi()\` assigns an object passed to it to a global state object,
and returns an observer proxy (\`BoxedProxy\`) wrapped around the global state object.

BoxedProxy wraps any object you pull out of it in an observer
proxy. It boxes booleans, numbers, and strings in lightweight proxies
that know their path and can access/modify the underlying value.

In rough terms:

\`\`\`
const state = {}
const boxed = new Proxy(state, ...)
tosi = (obj<T>): BoxedProxy<T> => {
  Object.assign(state, obj)
  return state
}
\`\`\`

This allows the following pattern, which gives Typescript a lot of useful
information for free, allowing autocomplete, etc. with a minimumn of
boilerplate.

\`\`\`
import { tosi, elements, bind } from 'tosijs'

const { prefs } = tosi({
  prefs: {
    theme: 'system',
    highcontrast: false
  }
})

// this example continues…
\`\`\`

So \`{ prefs: ... }\` is assigned to the state object, and now \`prefs\`
holds the same stuff except it's wrapped in a \`BoxedProxy\`.

The \`BoxedProxy\` behaves just like the original object, except
that it:

- knows where it came from, so \`prefs.path === 'prefs'\`
- will automatically trigger updates if its properties are changed through it
- can return the underlying value:
  \`prefs.value === prefs.valueOf() === the prefs property of the object passed to \`tosi()\`
- it will wrap its non-object properties in objects and wrap those objects
  in a BoxedProxy, so \`prefs.theme.path === 'prefs.theme'\`

\`\`\`
prefs.theme.value === 'system'          // true
prefs.theme.path === 'prefs.theme'      // true
prefs.theme.valueOf() === 'system'      // true
String(prefs.theme) === 'system'        // true (via Symbol.toPrimitive)
\`\`\`

The \`BoxedProxy\` observes changes made through it and updates bound elements
accordingly:

\`\`\`
bind(document.body, prefs.theme, {
  toDOM(element, value) {
    element.classList.toggle('dark-mode', value === 'dark')
  }
}

const { select, option } = elements

document.body.append(
  select(
    { bindValue: prefs.theme },
    option('system'),
    option('dark'),
    option('light')
  )
)
\`\`\`

Setting up the binding to \`document.body\` will set the \`class\`
appropriately, and modifying \`prefs.theme\` will update the
bound element automatically.

\`\`\`
proxy.theme.value = 'dark'
\`\`\`

> In javascript you can just write \`proxy.theme = 'dark'\` (TypeScript
> doesn't allow this due to asymmetric get/set type limitations).

This, in a nutshell, explains exactly what \`tosijs\` is designed to do.

\`tosi\` tracks state and allows you to bind data to your user interface
directly and with almost no code, with clean separation between business
logic and presentation.

The [\`elements\` proxy](/?elements.ts) lets you build HTML elements with
data and event bindings more compactly and efficiently than you can using
JSX/TSX, and it deals in regular \`HTMLElement\`—no virtual DOM, tranpilation
magic, spooky action at a distance, or any similar nonsense.

If you need to do complex bindings, the \`bind\` method lets you directly
link data to the DOM and automatically sets up observers for you.

\`Component\` lets you create reusable web-components.

\`css\` lets you write CSS economically and makes it easy to leverage the power
of CSS variables, while \`Color\` allows you to do color math quickly and
easily until similar functionality is added to CSS.

> In Finnish, *tosi* means true or really.
>
> As conceived, \`tosi()\` is an observer \`Proxy\` wrapped around your application's
> state. It's the **single source of truth for application state**.
>
> Note that the interactive examples on the tosijs.net website allow TypeScript
> but the Typescript is simply stripped to javascript using [sucrase](https://sucrase.io/).

## xin

\`xin\` is a path-based implementation of the **observer** or **pub/sub**
pattern designed to be very simple and straightforward to use, leverage
Typescript type-checking and autocompletion, and let you get more done with
less code and no weird build magic (such as special decorators or "execution zones").

## In a nutshell

\`xin\` is a single object wrapped with an **observer** proxy.

- when you assign an object (or array) to \`xin\` as a property, you're
  just assigning a property to the object. When you pull it out, you
  get a **proxy** of the underlying value, but the original value is
  still there, untouched.
  \`\`\`
  const foo = { bar: 'baz' }
  xin.foo = foo
  xin.foo.bar === foo.bar
  xin.foo.bar === 'baz'
  xin.foo !== foo            // xin.foo is a proxy
  xin.foo.value === foo   // foo is still there!
  \`\`\`
- if you change a property of something already in \`xin\` then this
  change will be \`observed\` and anything *listening* for changes to
  the value at that **path** will be notified.
- tosijs's \`bind\` method leverages the proxy to keep the UI synced
  with application state.

In the following example there's a \`<div>\` and an \`<input>\`. The
textContent of the former and the value of the latter are bound to
the **path** \`xinExample.string\`.

\`xin\` is exposed as a global in the console, so you can go into
console and look at \`xin.xinExample\` and (for example) directly
change it via the console.

You can also turn on Chrome's rendering tools to see how
efficiently the DOM is updated. And also note that typing into
the input field doesn't lose any state (so your text selection
and insertion point are stable.

\`\`\`js
import { xin, elements } from 'tosijs'

xin.xinExample = {
  string: 'hello, xin'
}

const { label, input, div, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10
      }
    },
    div({bindText: 'xinExample.string'}),
    label(
      span('Edit this'),
      input({ bindValue: 'xinExample.string'})
    )
  )
)
\`\`\`

- a **data-path** typically resembles the way you'd reference a value inside
  a javascript object…
- \`xin\` also supports **id-paths** which allow you to create stable references
  to elements in arrays using a (hopefully unique) identifier. E.g. instead
  of referring to an item in an array as \`xin.foo.array[3]\`, assuming it had
  an \`id\` of \`abcd1234\` you could write \`xin.foo.array[id=abcd1234]\`. This makes
  handling large arrays much more efficient.
- when you pull an object-value out of \`xin\` it comes wrapped in the xin
  observer proxy, so it continues to support id-paths and so on.

### A Calculator

\`\`\`js
import { xin, elements, touch } from 'tosijs'

// here's a vanilla javascript calculator
const calculator = {
  x: 4,
  y: 3,
  op: '+',
  result: 0,
  evaluate() {
    this.result = eval(\`\${this.x} \${this.op} \${this.y}\`)
  }
}

calculator.evaluate()

xin.calculatorExample = calculator

// now we'll give it a user interface…
const { input, select, option, div, span } = elements

preview.append(
  div(
    {
      onChange() {
        calculator.evaluate()
        touch('calculatorExample.result')
      }
    },
    input({bindValue: 'calculatorExample.x', placeholder: 'x'}),
    select(
      {
        bindValue: 'calculatorExample.op'
      },
      option('+'),
      option('-'),
      option({value: '*'}, '×'),
      option({value: '/'}, '÷'),
    ),
    input({bindValue: 'calculatorExample.y', placeholder: 'y'}),
    span('='),
    span({bindText: 'calculatorExample.result' })
  )
)
\`\`\`

Important points:

- \`xin\` points at a single object. It's a [Singleton](https://en.wikipedia.org/wiki/Singleton_pattern).
- \`boxed\` points to the **same** object
- \`xin\` and \`boxed\` are observers. They watch the object they point to and
  track changes made by accessing the underlying data through them.
- because \`calculator.evaluate()\` changes \`calculator.result\`
  directly, \`touch()\` is needed to tell \`xin\` that the change occurred.
  See [path-listener](/?path-listener.ts) for more documentation on \`touch()\`.
- \`xin\` is more than just an object!
    - \`xin['foo.bar']\` gets you the same thing \`xin.foo.bar\` gets you.
    - \`xin.foo.bar = 17\` tells \`xin\` that \`foo.bar\` changed, which triggers DOM updates.

> If you're reading this on tosijs.net then this the demo app you're looking
> works a bit like this and \`xin\` (and \`boxed\`) are exposed as globals so
> you can play with them in the **debug console**.
>
> Try going into the console and typing \`xin.app.title\` to see what you get,
> and then try \`xin.app.title = 'foobar' and see what happens to the heading.
>
> Also try \`xin.prefs.theme\` and try \`app.prefs.theme = 'dark'\` etc.

Once an object is assigned to  \`xin\`, changing it within \`xin\` is simple.
Try this in the console:

\`\`\`
xin.calculatorExample.x = 17
\`\`\`

This will update the \`x\` field in the calculator, but not the result.
The result is updated when a \`change\` event is triggered.

If you wanted the calculator to update based on *any* change to its
internal state, you could instead write:

\`\`\`
observe('calculatorExample', () => {
  calculator.evaluate()
  touch('calculatorExample.result')
})
\`\`\`

Now the \`onChange\` handler isn't necessary at all. \`observe\`
is documented in [path-listener](/?path-listener.ts).

\`\`\`js
import { observe, xin, elements } from 'tosijs'

const { h3, div } = elements

const history = div('This shows changes made to the preceding example')

preview.append(
  h3('Changes to the calculatorExample'),
  history
)

observe(/calculatorExample\\./, path => {
  const value = xin[path]
  history.insertBefore(div(\`\${path} = \${value}\`), history.firstChild)
})
\`\`\`

Now, if you sneakily make changes behind \`xin\`'s back, e.g. by modifying the values
directly, e.g.

\`\`\`
const emails = await getEmails()
xin.emails = emails

// notes that xin.emails is really JUST emails
emails.push(...)
emails.splice(...)
emails[17].from = '...'
\`\`\`

Then \`xin\` won't know and observers won't fire. So you can simply \`touch\` the path
impacted:

\`\`\`
import { touch } from 'tosijs'
touch('emails')
\`\`\`

In the calculator example, the vanilla \`calculator\` code calls \`evaluate\` behind
\`xin\`'s back and uses \`touch('calculatorExample.result')\` to let \`xin\` know that
\`calculatorExample.result\` has changed. This causes \`xin\` to update the
DOM.

## How it works

\`xin\` is a \`Proxy\` wrapped around a bare object: effectively a map of strings to values.

When you access the properties of an object assigned to \`xin\` it wraps the values in
similar proxies, and tracks the **path** that got you there:

\`\`\`
xin.foo = {
  bar: 'baz',
  luhrman: {
    job: 'director'
  }
}
\`\`\`

Now if you pull objects back out of \`xin\`:

\`\`\`
let foo = xin.foo
let luhrman = foo.luhrman
\`\`\`

\`foo\` is a \`Proxy\` wrapped around the original *untouched* object, and it knows it came from 'foo'.
Similarly \`luhrman\` is a \`Proxy\` that knows it came from 'foo.luhrman'.

If you **change** a value in a wrapped object, e.g.

\`\`\`
foo.bar = 'bob'
luhrman.job = 'writer'
\`\`\`

Then it will trigger any observers looking for relevant changes. And each change will fire the observer
and tell it the \`path\` that was changed. E.g. an observer watching \`lurman\` will be fired if \`lurman\`
or one of \`lurman\`'s properties is changed.

## The \`boxed\` proxy

\`boxed\` is a sister to \`xin\` that wraps "scalar" values (\`boolean\`, \`number\`, \`string\`) in
lightweight proxies. These proxies know their path and provide convenient access to the
underlying value. E.g. if you write something like:

\`\`\`
xin.test = { answer: 42 }
boxed.box = { pie: 'apple' }
\`\`\`

Then:

\`\`\`
xin.test.answer === 42
xin.box.pie === 'apple'
// boxed scalars have .value and .path
boxed.test.answer.value === 42
boxed.box.pie.value === 'apple'
boxed.test.answer.path === 'test.answer'
boxed.box.pie.path === 'box.pie'
// valueOf() works for coercion
boxed.test.answer.valueOf() === 42
String(boxed.box.pie) === 'apple'
\`\`\`

Boxed scalars also delegate to the underlying value's prototype methods,
so you can call string, number, and boolean methods directly:

\`\`\`
boxed.box.pie.toUpperCase() === 'APPLE'
boxed.box.pie.startsWith('app') === true
boxed.box.pie.length === 5
boxed.test.answer.toFixed(2) === '42.00'
\`\`\`

Aside from always "boxing" scalar values, \`boxed\` works just like \`xin\`.

In the console, you can also access \`boxed\` and look at what happens if you
access \`boxed.xinExample.string\`. Note that this changes the value you get,
the underlying value is still what it was. If you set it to a new \`string\`
value that's what will be stored. \`xin\` doesn't monkey with the values you
assign.

### Why?!

As far as Typescript is concerned, \`xinProxy\` just passes back what you put into it,
which means that you can now write bindings with type-checking and autocomplete and
never use string literals. So something like this *just works*:

\`\`\`
const div = elements.div({bindText: boxed.box.pie})
\`\`\`

…because \`boxed.box.pie\` has a \`xinPath\` which is what is actually used for binding,
whereas \`xin.box.pie\` is just a scalar value. Without \`boxed\` you could write
\`bindText: 'box.pie'\` but you don't get lint support or autocomplete. (Also, in
some cases, you might even mangle the names of an object during minification and
\`boxed\` will know the mangled name).

### If you need the thing itself or the path to the thing…

\`proxy\`s returned by \`xin\` are typically indistinguishable from the original object, but
in a pinch \`tosiPath()\` will give you the path (\`string\`) of a \`XinProxy\` while \`tosiValue\`
will give its "bare" value. \`tosiPath()\` can also be used to test if something is actually
a proxy, as it will return \`undefined\` for regular objects.

E.g.

\`\`\`
tosiPath(luhrman) === 'foo.luhrman'     // true
const bareLurhman = tosiValue(luhrman)  // not wrapped
\`\`\`

You may want the thing itself to, for example, perform a large number of changes to an
object without firing observers. You can let \`xin\` know you've made changes behind its back using
\`touch\`, e.g.

\`\`\`
doTerribleThings(tosiValue(luhrman))
// eslint-disable-next-line
touch(luhrman)
\`\`\`

This is **useful** because \`boxed.foo.bar\` always knows where it came from, while
\`xin.foo.bar\` only knows where it came from if it's an object value.

This means you can write:

\`\`\`js
import { boxed, elements } from 'tosijs'

boxed.boxedExample = {
  string: 'hello, boxed'
}

const { boxedExample } = boxed

const { label, input, div, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10
      }
    },
    div({bindText: boxedExample.string}),
    label(
      span('Edit this'),
      input({ bindValue: boxedExample.string})
    )
  )
)
\`\`\`

And the difference here is you can bind direct to the reference itself rather
than a string. This leverages autocomplete, linting, and so on in a way that
using string paths doesn't.

It does have a downside! \`boxedExample.string !== 'hello, boxed'\` and
\`boxedExample.string !== boxedExample.string\` because they're proxies, not primitives.
This is critical for comparisons such as \`===\` and \`!==\`.
Always use \`.value\`, \`tosiValue()\`, or \`valueOf()\` when comparing:
\`boxed.foo.bar.value === 'hello'\` or \`tosiValue(boxed.foo.bar) === 'hello'\`.

## The \`.tosi\` accessor

Every boxed proxy has a \`.tosi\` property that provides the full reactive API
without risk of name collisions. If your data has properties named \`value\`,
\`path\`, \`observe\`, etc., those will shadow the proxy's direct API — but \`.tosi\`
is always available.

\`\`\`
proxy.foo.tosi.value        // get the underlying value
proxy.foo.tosi.value = 17   // set it (triggers observers)
proxy.foo.tosi.path         // 'foo'
proxy.foo.tosi.observe(cb)  // watch for changes
proxy.foo.tosi.touch()      // force update notification
proxy.foo.tosi.bind(el, binding)
proxy.foo.tosi.on(el, eventType)
proxy.foo.tosi.binding(binding)
proxy.foo.tosi.listBinding(templateBuilder, options)
proxy.foo.tosi.listFind(selector, value)
proxy.foo.tosi.listUpdate(selector, newValue)
proxy.foo.tosi.listRemove(selector, value)
\`\`\`

This is the recommended API. The only reserved name is \`tosi\` itself — don't
use it as a property name in your data.

If you do have data with a \`tosi\` property, use \`tosiAccessor(proxy)\` or
the \`TOSI_ACCESSOR\` symbol directly — these are guaranteed collision-free:

\`\`\`
import { tosiAccessor, TOSI_ACCESSOR } from 'tosijs'

const acc = tosiAccessor(proxy.foo)  // always works
const acc2 = proxy.foo[TOSI_ACCESSOR]  // also always works
acc.value  // underlying value
acc.path   // path string
\`\`\`

## Direct helper properties (deprecated)

The following properties are also available directly on boxed proxies, but
they can be shadowed by actual properties on the target object. Prefer
\`.tosi.*\` instead:

- \`.value\` gets or sets the underlying value
- \`.path\` gets the string path
- \`.observe(callback)\` watches for changes, returns an unsubscribe function
- \`.touch()\` forces an update notification
- \`.bind(element, binding, options?)\` binds the value to a DOM element
- \`.on(element, eventType)\` binds an event handler
- \`.binding(binding)\` returns an inline binding spec for use with elements
- \`.listBinding(templateBuilder, options?)\` returns a list binding spec
- \`.valueOf()\` / \`.toJSON()\` for type coercion (scalars also have \`.toString()\`)

Boxed scalars also expose all methods from the underlying primitive's prototype
(e.g. \`.toUpperCase()\`, \`.startsWith()\`, \`.toFixed()\`, \`.length\`, index access).

Arrays also have:
- \`.listFind(selector, value)\` finds an item by field and returns it proxied
- \`.listFind(element)\` finds the array item bound to a DOM element
- \`.listUpdate(selector, newValue)\` updates an existing item in place or pushes if not found
- \`.listRemove(selector, value)\` removes an item by field match

> Note: The \`xinValue\`, \`xinPath\`, \`xinObserve\`, \`xinBind\`, \`xinOn\`, and
> \`tosiValue\`, \`tosiPath\`, etc. names still work but are deprecated.
> Use \`.tosi.*\` instead.

## \`.take()\` — Reactive Binding Transforms

\`.take()\` creates a reactive binding descriptor that transforms values before
they reach the DOM. It eliminates most custom bindings.

### Single-path transform

\`\`\`js
import { tosi, elements } from 'tosijs'

const { takeDemo } = tosi({ takeDemo: { count: 3, items: ['a', 'b', 'c'] } })

const { span, button } = elements

preview.append(
  span({ bindText: takeDemo.count.tosi.take(n => \`Count: \${n}\`) }),
  button('Delete', {
    bindEnabled: takeDemo.items.tosi.take(list => list.length > 0),
  })
)
\`\`\`

### Multi-path transform

Pass additional proxies before the transform function. The transform receives
all current values when any of the watched paths change.

\`\`\`js
import { tosi, elements } from 'tosijs'

const { takeMultiDemo } = tosi({
  takeMultiDemo: { firstName: 'Alice', lastName: 'Smith' }
})

const { span, input, label } = elements

preview.append(
  span({ bindText: takeMultiDemo.firstName.tosi.take(
    takeMultiDemo.lastName,
    (first, last) => \`\${first} \${last}\`
  ) }),
  label('First', input({ bindValue: takeMultiDemo.firstName })),
  label('Last', input({ bindValue: takeMultiDemo.lastName })),
)
\`\`\`

\`.take()\` is efficient: the transform only runs when the input values actually
change (compared by identity). If an observer fires but the value is the same,
the transform is skipped entirely.

### Filtered list with \`.take()\`

\`.take()\` works with list bindings to create reactive filtered views. The filter
re-evaluates when any of the watched paths change, but the list binding still
does surgical DOM updates.

\`\`\`js
import { elements, tosi, touch } from 'tosijs'

const { takeFilterDemo } = tosi({
  takeFilterDemo: {
    search: '',
    items: [
      { id: 1, name: 'Alice', role: 'engineer' },
      { id: 2, name: 'Bob', role: 'designer' },
      { id: 3, name: 'Carol', role: 'engineer' },
      { id: 4, name: 'Dave', role: 'manager' },
      { id: 5, name: 'Eve', role: 'designer' },
    ]
  }
})

const { div, input, label, ul } = elements

preview.append(
  div(
    { style: { display: 'flex', flexDirection: 'column', gap: 10, padding: 10 } },
    label('Filter', input({
      placeholder: 'type to filter...',
      bindValue: takeFilterDemo.search,
    })),
    div({
      bindText: takeFilterDemo.items.tosi.take(
        takeFilterDemo.search,
        (items, search) => {
          const s = search.toLowerCase()
          const count = s ? items.filter(i => i.name.toLowerCase().includes(s) || i.role.includes(s)).length : items.length
          return \`Showing \${count} of \${items.length}\`
        }
      ),
      style: { fontStyle: 'italic', opacity: 0.7 },
    }),
    ul(
      ...takeFilterDemo.items.tosi.listBinding(
        ({li, span}, item) => li(
          span({ bindText: item.name, style: { fontWeight: 'bold' } }),
          ' — ',
          span({ bindText: item.role }),
        ),
        {
          idPath: 'id',
          filter: (items, needle) => needle
            ? items.filter(i => i.name.toLowerCase().includes(needle) || i.role.includes(needle))
            : items,
          needle: takeFilterDemo.search.tosi.take(s => s.toLowerCase()),
        }
      )
    )
  )
)
\`\`\`

## List Operations

When working with list-bound arrays, you often need to find, update, or remove
items efficiently. The \`listFind\`, \`listUpdate\`, and \`listRemove\` methods on
proxied arrays handle this with the same selector pattern used by \`listBinding\`.

### Selectors

All three methods use a **selector callback** to identify which field to match on.
The callback receives a placeholder proxy (the same \`^\` proxy trick used by
\`listBinding\`) and should return a property of the item:

    (item) => item.id        // match on the 'id' field
    (item) => item.uid       // match on 'uid'
    (item) => item.meta.key  // nested field paths work too

### \`listFind(selector, value)\` / \`listFind(element)\`

Find an item and return it as a proxied object (so mutations trigger observers):

    const item = app.items.listFind((item) => item.id, 'abc')
    if (item) {
      item.name.value = 'Updated'  // triggers observers + DOM updates
    }

You can also pass a DOM element to find the array item bound to it — useful
in click handlers on list-bound elements:

    container.addEventListener('click', (e) => {
      const item = app.items.listFind(e.target)
      if (item) console.log('Clicked:', item.name.value)
    })

### \`listUpdate(selector, newValue)\`

Upsert: update an existing item **in place** or push a new one. This is the
recommended way to update list items because it preserves object identity —
the \`itemToElement\` WeakMap still maps to the same DOM element, so no
teardown/recreation occurs:

    // Update existing — only changed properties fire observers
    app.items.listUpdate((item) => item.id, {
      id: 'abc', name: 'New Name', score: 100
    })

    // Item not found — pushes as new
    app.items.listUpdate((item) => item.id, {
      id: 'xyz', name: 'Brand New'
    })

Returns the proxied item (existing or newly pushed).

### \`listRemove(selector, value)\`

Remove an item by field match. Returns \`true\` if removed, \`false\` if not found:

    app.items.listRemove((item) => item.id, 'abc')  // true if found

### To Do List Example

Each of the features described thus far, along with the features of the
\`elementCreator\` functions provided by the [elements](/?elements.ts) proxy
are designed to eliminate boilerplate, simplify your code, and reduce
the chance of making costly errors.

This example puts all of this together.

\`\`\`js
import { elements, tosi } from 'tosijs'

const { todos } = tosi({
  todos: {
    list: [],
    newItem: ''
  }
})

const { h3, div, label, input, button, template } = elements

const addItem = () => {
  todos.list.push({
    description: todos.newItem.value
  })
  todos.newItem.value = ''
}

preview.append(
  h3('To do'),
  div(
    {
      bindList: {
        value: todos.list
      }
    },
    template(
      div({ bindText: '^.description' })
    )
  ),
  div(
    input({
      placeholder: 'task',
      bindValue: todos.newItem,
      onKeyup(event) {
        if(event.key === 'Enter' && todos.newItem.value !== '') {
          addItem()
        }
      }
    }),
    button('Add', {
      bindEnabled: todos.newItem,
      onClick: addItem
    })
  )
)
\`\`\``,title:"1. tosi",filename:"xin.ts",path:"src/xin.ts"},{text:`# 1.1 tosi, xin, and xinProxy

> This documentation is mainly here for explanatory purposes. Just use \`tosi()\`
> as described in section 1.

The key to managing application state with \`tosijs\` is the \`xin\` proxy object
(and \`boxed\`). These are documented [here](/?xin.ts).

## \`xinProxy()\` and \`tosi()\`

> \`tosi()\` was formerly called \`boxedProxy()\`.

After coding with \`xin\` for a while, it became apparent that a common pattern
was something like this:

    import myThing as _myThing from 'path/to/my-thing'
    import { xin } from 'tosijs'

    xin.myThing = _myThing
    export const myThing = xin.myThing as typeof _myThing

Now we can use the new \`myThing\` in a pretty intuitive way, leverage autocomplete
most of the time, and it's all pretty nice.

And because \`myThing.path.to.something\` is actually a \`XinProxy\` we can actually
bind to it directly. So instead of typing (or mis-typing):

    customElement({bindValue: 'mything.path.to.something'}))

We can type the following and even use autocomplete:

    customElement({bindValue: mything.path.to.something}))

This gets you:

    const { myThing } = xinProxy({ myThing: ... })

And after working with that for a while, the question became, what if we could
leverage autocomplete even for non-object properties?

This gets us to:

    const { myThing } = boxedProxy({ myThing: ... })

…(and also \`boxed\`).

\`boxed\` and \`boxedProxy\` deliver a proxy wrapped around an object wrapped around
the original \`string\`, \`boolean\`, or \`number\`. This gets you autocomplete and
strong typing in general, at the cost of slight annoyances (e.g. having to write
\`myThing.path.to.string.valueOf() === 'some value'\`). That's the tradeoff. In
practice it's really very nice.

\`xinProxy(foo)\` is simply declared as a function that takes an object of type T and
returns a BoxedProxy<T>.

    import { xinProxy } from 'tosijs'

    const { foo, bar } = boxedProxy({
      foo: 'bar',
      bar: {
        director: 'luhrmann'
      }
    })

This is syntax sugar for:

    import { boxed } from 'tosijs'

    const stuff = {
      foo: 'bar',
      bar: {
        director: 'luhrmann',
        born: 1962
      }
    }

    Object.assign(boxed, stuff)

    const { foo, bar } = boxed as XinProxy<typeof stuff>

So, Typescript will know that \`foo\` is a \`string\` and \`bar\` is a \`XinProxy<typeof stuff.bar>\`.

Now, \`boxedProxy\` is the same except replace \`XinProxy\` with \`BoxedProxy\` and
now Typescript will know that \`foo\` is a \`BoxedProxy<string>\`, \`bar\` is a \`BoxedProxy<typeof stuff.bar>\`
and \`bar.born\` is a \`BoxedProxy<number>\`.

This lets you write bindings that support autocomplete and lint. Yay!

## \`tosiUnique()\`

\`tosiUnique()\` creates a reactive proxy stored under a guaranteed unique key.
This is useful for component instances or any situation where you need
per-instance reactive state without worrying about key collisions.

It returns a tuple of \`[proxy, removeFunc]\`:

- \`proxy\` is a \`BoxedProxy<T>\` — the reactive proxy for your object
- \`removeFunc\` is a cleanup function that removes the state from the registry

If you pass an \`owner\` object (e.g. \`this\` in a component), the state will
be automatically cleaned up when the owner is garbage collected — no need
to call the remove function manually.

Typical usage in a component:

    class MyComponent extends Component {
      proxy = tosiUnique({ count: 0, name: '' }, this)[0]
    }

Or if you want explicit cleanup control:

    const [proxy, remove] = tosiUnique({ count: 0, name: '' })
    // ... later ...
    remove()`,title:"1.1 tosi, xin, and xinProxy",filename:"xin-proxy.ts",path:"src/xin-proxy.ts"},{text:`# 1.2 path-listener

\`path-listener\` implements the \`tosijs\` observer model. Although these events
are exported from \`tosijs\` they shouldn't need to be used very often. Mostly
they're used to manage state.

## \`touch(path: string)\` and \`.touch()\`

This is used to inform \`xin\` that a value at a path has changed. Remember that
xin simply wraps an object, and if you change the object directly, \`xin\` won't
necessarily know about it.

The two most common uses for \`touch()\` are:

1. You want to make lots of changes to a large data structure, possibly
   over a period of time (e.g. update hundreds of thousands of values
   in a table that involve service calls or heavy computation) and don't
   want to thrash the UI so you just change the object directly.
2. You want to change the content of an object but need a something that
   is bound to the "outer" object to be refreshed.

Every \`BoxedProxy\` also has a \`.touch()\` method, so you can call it directly
on any proxied value:

    app.user.name.touch()   // force update for this scalar
    app.user.touch()        // force update for the whole object
    app.items[2].touch()    // force update for a list item

### Id-path synthesis

When you touch a path that contains an array index (e.g. \`items[2]\` or
\`items[2].name\`), \`touch()\` automatically synthesizes the equivalent id-path
touches (e.g. \`items[id=abc]\` or \`items[id=abc].name\`). This means that
\`.touch()\` on list items correctly updates DOM elements bound via \`idPath\`,
even when you've mutated the underlying data behind the proxy's back.

## \`observe()\` and \`unobserve()\`

    const listener = observe(
      path: string | RegExp | (path: string) => boolean,
      (changedPath: string) => {
        ...
      }
    )

    // and later, when you're done
    unobserve(listener);

\`observe(…)\` lets you call a function whenever a specified path changes. You'll
be passed the path that changed and you can do whatever you like. It returns
a reference to the listener to allow you to dispose of it later.

\`unobserve(listener)\` removes the listener.

> This is how binding works. When you bind a path to an interface element, an
> observer is created that knows when to update the interface element. (If the
> binding is "two-way" (i.e. provides a \`fromDOM\` callback) then an \`input\` or
> \`change\` event that hits that element will update the value at the bound
> path.

## \`async updates()\`

You can \`await updates()\` or use \`updates().then(…)\` to execute code
after any changes have been rendered to the DOM. Typically, you shouldn't
have to mess with this, but sometimes—for example—you might need to know
how large a rendered UI element is to adjust something else.

It's also used a lot in unit tests. After you perform some logic, does
it appear correctly in the UI?`,title:"1.2 path-listener",filename:"path-listener.ts",path:"src/path-listener.ts"},{text:`# 1.3 metadata

## \`tosiAccessor(x: any): TosiAccessor | undefined\`

\`tosiAccessor\` returns the collision-free accessor object from any boxed proxy,
using the \`TOSI_ACCESSOR\` symbol internally. Returns \`undefined\` for non-proxy values.

This is the guaranteed escape hatch — it works even if your data has a property
named \`tosi\` that would shadow the \`.tosi\` convenience accessor.

\`\`\`
import { tosiAccessor, TOSI_ACCESSOR } from 'tosijs'

const { app } = tosi({ app: { tosi: 'shadowed!', name: 'test' } })

// .tosi is always intercepted by the proxy (not shadowed in practice)
app.tosi.path === 'app'

// tosiAccessor() and TOSI_ACCESSOR are guaranteed collision-free
const acc = tosiAccessor(app)
acc.path === 'app'
acc.value  // { tosi: 'shadowed!', name: 'test' }

// TOSI_ACCESSOR symbol works directly
app[TOSI_ACCESSOR].path === 'app'

// returns undefined for non-proxy values
tosiAccessor('hello') === undefined
tosiAccessor({ foo: 1 }) === undefined
\`\`\`

## \`xinValue(x: any): any\` (deprecated)

\`xinValue\` strips the \`xin\` or \`boxed\` proxy off of a value.
Passes through non-proxy values unchanged. Prefer \`.value\` or \`.tosi.value\`.

\`\`\`
import { boxed } from 'tosijs'

const foo = { bar: 'hello', baz: 17 }
boxed.foo = foo

boxed.foo.bar === foo.bar               // false, boxed.foo.bar is a proxy
boxed.foo === foo                       // false, boxed.foo is a proxy
boxed.foo.baz === 17                    // false, boxed.foo.baz is a proxy
boxed.foo.bar.value === 'hello'         // true (preferred)
xinValue(boxed.foo.bar) === 'hello'     // true
boxed.foo.baz.value === 17              // true
xinValue(boxed.foo) === xinValue(foo)   // true
foo.xinValue                            // undefined! foo isn't a proxy
\`\`\`

## \`xinPath(x: any): string | undefined\` (deprecated)

\`xinPath\` returns the path of a \`xin\` or \`boxed\` proxy. Returns \`undefined\`
for non-proxy values. Prefer \`.path\` or \`.tosi.path\`.`,title:"1.3 metadata",filename:"metadata.ts",path:"src/metadata.ts"},{text:`# 2. bind

\`bind()\` lets you synchronize data / application state to the user-interface reliably,
efficiently, and with a minimum of code.

## An Aside on Reactive Programming vs. the Observer Model

A good deal of front-end code deals with keeping the application's
state synchronized with the user-interface. One approach to this problem
is [Reactive Programming](https://en.wikipedia.org/wiki/Reactive_programming)
as exemplified by [React](https://reactjs.org) and its many imitators.

\`tosijs\` works very well with React via the [useTosi](https://github.com/tonioloewald/react-tosijs) React "hook".
But \`tosijs\` is not designed for "reactive programming" and in fact "hooks" aren't
"reactive" at all, so much as an example of the "observer" or "pub/sub" pattern.

\`tosijs\` is a "path-observer" in that it's an implementation of the
[Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern)
where **path strings** serve as a level of *indirection* to the things observed.
This allows data to be "observed" before it exists, which in particular *decouples* the setup
of the user interface from the initialization of data and allows user interfaces
built with \`tosijs\` to be *deeply asynchronous*.

## \`bind()\`

\`\`\`
bind<T = Element>(
  element: T,
  what: XinTouchableType,
  binding: XinBinding,
  options: XinObject
): T
\`\`\`

\`bind()\` binds a \`path\` to an element, syncing the value at the path to and/or from the DOM.

\`\`\`js
import { bind, tosi } from 'tosijs'

const { simpleBindExample } = tosi({
  simpleBindExample: {
    showThing: true
  }
})

bind(
  preview.querySelector('b'),
  'simpleBindExample.showThing',
  {
    toDOM(element, value) {
      element.style.visibility = value ? 'visible' : 'hidden'
    }
  }
)

bind(
  preview.querySelector('input[type=checkbox]'),
  // the tosi can be used instead of a string path
  simpleBindExample.showThing,
  // we could just use bindings.value here
  {
    toDOM(element, value) {
      element.checked = value
    },
    fromDOM(element) {
      return element.checked
    }
  }
)
\`\`\`
\`\`\`html
<b>The thing</b><br>
<label>
  <input type="checkbox">
  Show the thing
</label>
\`\`\`

The \`bind\` function is a simple way of tying an \`HTMLElement\`'s properties to
state via \`path\` using [bindings](/?bindings.ts)

\`\`\`
import {bind, bindings, xin, elements, updates} from 'tosijs'
const {div, input} = elements

const divElt = div()
bind(divElt, 'app.title', bindings.text)
document.body.append(divElt)

const inputElt = input()
bind(inputElt, 'app.title', bindings.value)

xin.app = {title: 'hello world'}
await updates()
\`\`\`

What's happening is essentially the same as:

\`\`\`
divElt.textContent = xin.app.title
observe('app.title', () => divElt.textContent = xin.app.title)

inputElt.value = xin.app.title
observe('app.title', () => inputElt.value = xin.app.title)
inputElt.addEventListener('change', () => { xin.app.title = inputElt.value })
\`\`\`

Except:

1. this code is harder to write
2. it will fail if xin.app hasn't been initialized (which it hasn't been!)
3. inputElt will also trigger *debounced* updates on \`input\` events

After this. \`div.textContent\` and \`inputElt.value\` are 'hello world'.
If the user edits the value of \`inputElt\` then \`xin.app.title\` will
be updated, and \`app.title\` will be listed as a changed path, and
an update will be fired via \`setTimout\`. When that update fires,
anything observer of the paths \`app.text\` and \`app\` will be fired.

A \`binding\` looks like this:

\`\`\`
interface XinBinding {
  toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
  fromDOM?: (element: HTMLElement) => any
}
\`\`\`

Simply put the \`toDOM\` method updates the DOM based on changes in state
while \`fromDOM\` updates state based on data in the DOM. Most bindings
will have a \`toDOM\` method but no \`fromDOM\` method since \`bindings.value\`
(which has both) covers most of the use-cases for \`fromDOM\`.

It's easy to write your own \`bindings\` if those in \`bindings\` don't meet your
need, e.g. here's a custom binding that toggles the visibility of an element
based on whether the bound value is neither "falsy" nor an empty \`Array\`.

\`\`\`
const visibility = {
  toDOM(element, value) {
    if (element.dataset.origDisplay === undefined && element.style.display !== 'none') {
      element.dataset.origDisplay = element.style.display
    }
    element.style.display = (value != null && value.length > 0) ? element.dataset.origDisplay : 'none'
  }
}
bind(listElement, 'app.bigList', visibility)
\`\`\`

## \`on()\`

\`\`\`
on(element: Element, eventType: string, handler: XinEventHandler): VoidFunction

export type XinEventHandler<T extends Event = Event, E extends Element = Element> =
  | ((evt: T & {target: E}) => void)
  | ((evt: T & {target: E}) => Promise<void>)
  | string
\`\`\`

\`\`\`js
import { elements, on, tosi } from 'tosijs'
import { postNotification } from 'tosijs-ui'

const makeHandler = (message) => () => {
  postNotification({ message, duration: 2 })
}

const { onExample } = tosi({
  onExample: {
    clickHandler: makeHandler('Hello from onExample proxy')
  }
})

const { button, div, h2 } = elements

const hasListener = button('has listener')
hasListener.addEventListener('click', makeHandler('Hello from addEventListener'))

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 10
      }
    },
    h2('Event Handler Examples'),
    hasListener,
    button('just a callback', {onClick: makeHandler('just a callback')}),
    button('via proxy', {onClick: onExample.clickHandler}),
  )
)
\`\`\`

\`on()\` binds event-handlers to DOM elements.

More than syntax sugar for \`addEventListener\`, \`on()\` allows you to bind event
handlers inside \`xin\` by path (e.g. allowing event-handling code to be loaded
asynchronously or lazily, or simply allowing event-handlers to be switched dynamically
without rebinding) and it uses event-bubbling to minimize the actual number of
event handlers that need to be registered.

\`on()\` returns a function for removing the event handler.

In essence, only one event handler of a given type is ever added to the
DOM by \`on()\` (at \`document.body\` level), and then when that event is detected,
that handler goes from the original target through to the DOM and fires off
event-handlers, passing them an event proxy (so that \`stopPropagation()\` still
works).

## \`touchElement()\`

\`\`\`
touchElement(element: Element, changedPath?: string)
\`\`\`

This is a low-level function for *immediately* updating a bound element. If you specifically
want to force a render of an element (versus anything bound to a path), simply call
\`touchElement(element)\`. Specifying a \`changedPath\` will only trigger bindings bound
to paths staring with the provided path.`,title:"2. bind",filename:"bind.ts",path:"src/bind.ts"},{text:`# 2.1 binding arrays

The most likely source of complexity and performance issues in applications is
displaying large lists or grids of objects. \`tosijs\` provides robust support
for handling this efficiently.

## \`bindList\` and \`bindings.list\`

## \`.tosi.listBinding()\` — the preferred way

The simplest way to bind an array is with \`.tosi.listBinding()\` (or \`.listBinding()\`
directly on a BoxedProxy). It takes a template builder function that receives
the \`elements\` proxy and a placeholder item for bindings:

\`\`\`js
import { elements, tosi } from 'tosijs'
const { listBindingExample } = tosi({
  listBindingExample: {
    array: ['this', 'is', 'an', 'example']
  }
})

const { h3, ul } = elements

preview.append(
  h3('binding an array of strings'),
  ul(
    ...listBindingExample.array.tosi.listBinding(({li}, item) => li(item))
  )
)
\`\`\`

### listBinding(templateBuilder, options?) => [ElementProps, HTMLTemplateElement]

    type ListTemplateBuilder<U = any> = (elements: ElementsProxy, item: U) => HTMLElement

The template builder receives two arguments: the \`elements\` proxy (destructure
the tags you need) and a placeholder proxy for the array item. Property access
on the placeholder creates relative bindings (\`^.name\`, \`^.score\`, etc.)
automatically.

Spread the result into a container element — it returns an \`[ElementProps, HTMLTemplateElement]\`
tuple that the container uses to set up the list binding.

Under the hood, this creates the same \`bindList\` + \`template\` structure shown below,
but without the boilerplate.

### Options

Pass options as the second argument:

    ...items.tosi.listBinding(({div}, item) => div(item.name), {
      idPath: 'id',           // unique id field for surgical updates
      virtual: { height: 30 } // virtualize for large lists
    })

### \`bindList\` + \`template\` — the low-level way

For reference, the equivalent low-level structure that \`.listBinding()\` generates:

    div( // container element
      {
        bindList: {
          value: boxed.path.to.array // OR 'path.to.array'
          idPath: 'id' // (optional) path to unique id of array items
        }
      },
      template( // template for the repeated item
        div( // repeated item should have a single root element
          ... // whatever you want
          span({
            bindText: '^.foo.bar' // binding to a given array member's \`foo.bar\`
              // '^' refers to the array item itself
          })
        )
      )
    )

You rarely need this form — \`.listBinding()\` is more concise and type-safe.

Even better, \`templateBuilder()\` is passed the \`elements\` proxy and a placeholder \`BoxedProxy\` of
the array's type, supporting autocompletion of property names within the template.

### id-paths

**id-paths** are a wrinkle in \`xin\`'s paths specifically there to make list-binding more efficient.
This is because in many cases you will encounter large arrays of objects, each with a unique id somewhere, e.g. it might be \`id\` or \`uid\`
or even buried deeper…

    xin.message = [
      {
        id: '1234abcd',
        title: 'hello',
        body: 'hello there!'
      },
      …
    ]

Instead of referring to the first item in \`messages\` as \`messages[0]\` it can be referred to
as \`messages[id=1234abcd]\`, and this will retrieve the item regardless of its position in messages.

Specifying an \`idPath\` in a list-binding will allow the list to be more efficiently updated.
It's the equivalent of a \`key\` in React, the difference being that it's optional and
specifically intended to leverage pre-existing keys where available.

### When to use idPath

**Always use \`idPath\` for arrays of objects** unless you have a very simple case.

Without \`idPath\`:
- Bindings use index-based paths like \`list[0].name\`
- If items are reordered (sort, splice, etc.), bindings point to wrong items
- Fine-grained property updates may not reach the correct DOM elements
- The list binding will work, but inefficiently - often recreating elements

Without \`idPath\` is fine for:
- Simple arrays of scalars (\`['apple', 'banana', 'cherry']\`)
- Static lists that never reorder
- Lists where you always replace items wholesale, never update properties

> **Id values must not contain \`]\` characters.** Id-paths are encoded as
> \`list[id=value]\` in path strings, so a \`]\` in the value will break the
> path parser. Characters like \`[\`, \`=\`, and \`.\` are fine. If your ids
> could contain \`]\`, use a sanitized field or a separate numeric id.

### Surgical Updates with id-paths

When you specify an \`idPath\`, something remarkable happens: changes to individual
item properties trigger surgical DOM updates without re-rendering the entire list.

Here's how it works:

1. When a list binding is created with an \`idPath\`, tosijs registers that array path
2. When you modify an item property (e.g., \`list[0].color = 'red'\`), tosijs detects
   this is inside an array item
3. It automatically synthesizes an equivalent id-path touch (e.g., \`list[id=123].color\`)
4. Bindings registered with id-path notation receive the update

This means you can update one property on one item in a list of millions, and only
that single DOM element updates. No diffing, no virtual DOM, no reconciliation -
just direct, surgical updates.

**To see this in action:** Open your browser's DevTools, enable "Paint flashing"
(in Chrome: DevTools → More tools → Rendering → Paint flashing), and watch the
virtualized grid example below. Only the cells whose values actually change will flash.

## Iterating and Searching Arrays

When working with proxied arrays, it's important to understand how different
iteration patterns behave:

### \`for...of\` loops yield proxied items

    for (const item of list) {
      // item is a proxy - use .value for scalars
      console.log(item.name.value)

      // mutations trigger observers and surgical DOM updates
      item.score.value = 100
    }

### \`find()\`, \`findLast()\`, and \`at()\` return proxied items

    // The predicate receives raw items - no .value needed for comparisons
    const found = list.find(item => item.id === 'abc')

    // The result is proxied - mutations work and trigger updates
    found.score.value = 100

This is the best of both worlds: clean predicate syntax without \`.value\`,
and the returned item is fully reactive.

### \`forEach()\`, \`map()\`, \`filter()\`, etc. pass raw items to callbacks

    // Callbacks receive raw items for clean predicate/transform syntax
    list.filter(item => item.score > 50)
    list.map(item => item.name)

    // But mutations in forEach won't trigger observers!
    list.forEach(item => {
      item.score = 100  // Modifies raw object - NO observer triggered
    })

If you need to mutate items, use \`for...of\` instead, or call \`touch()\` on
the array or individual items after your \`forEach\`:

    // Option 1: Use for...of
    for (const item of list) {
      item.score.value = 100  // Triggers observers
    }

    // Option 2: Touch after forEach
    list.forEach(item => {
      item.score = 100
    })
    touch('path.to.list')  // Manually notify observers

## Virtualized Lists

The real power of \`bindList\` comes from its support for virtualizing lists.

    bindList: {
      value: emojiListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
        rowChunkSize: 3,
      },
    }

Simply add a \`virtual\` property to the list-binding specifying the row \`height\`
and the list will be \`virtualized\` (meaning that only visible elements will be rendered,
missing elements being replaced by a single padding element above and below the list).
For variable-height items, add \`minHeight\` — see **Variable-Height Items** below.

You can (optionally) specify \`rowChunkSize\` to virtualize the list in chunks of rows to allow
consistent \`:nth-child()\` styling.

Now you can trivially bind an array of a million objects to the DOM and have it scroll at
120fps.

\`\`\`js
import { elements, tosi, scrollListItemIntoView } from 'tosijs'
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const emojiData = await request.json()
const { emojiListExample } = tosi({
  emojiListExample: {
    array: emojiData
  }
})

const { div, button } = elements

const emojiTable = div(
  {
    class: 'emoji-table'
  },
  ...emojiListExample.array.listBinding(({div, span}, item) =>
    div(
      {
        class: 'emoji-row',
        tabindex: 0,
      },
      span({ bindText: item.chars, class: 'graphic' }),
      span({ bindText: item.name, class: 'no-overflow' }),
      span({ bindText: item.category, class: 'no-overflow' }),
      span({ bindText: item.subcategory, class: 'no-overflow' })
    ),
    {
      value: emojiListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
        rowChunkSize: 3
      },
    }
  )
)

const scrollTo = (name) => {
  const item = emojiData.find(e => e.name === name)
  if (item) scrollListItemIntoView(emojiTable, item)
}

preview.append(
  emojiTable,
  div(
    { class: 'scroll-buttons' },
    button('rocket', { onClick: () => scrollTo('rocket') }),
    button('flag: Finland', { onClick: () => scrollTo('flag: Finland') }),
    button('pile of poo', { onClick: () => scrollTo('pile of poo') }),
  ),
)
\`\`\`
\`\`\`css
.scroll-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}
.emoji-table {
  height: calc(100% - 36px);
  overflow: auto;
}
.emoji-row {
  display: grid;
  grid-template-columns: 50px 300px 200px 200px;
  align-items: center;
  height: 30px;
  overflow-x: hidden;
}
.emoji-row:nth-child(3n) {
  background: #f002;
}
.emoji-row:nth-child(3n+2) {
  background: #00f2;
}

.emoji-row > .graphic {
  font-size: 20px;
  justify-self: center;
}

.emoji-row > * {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
\`\`\`

### Virtualized Grids

You can virtualize a grid by styling the padding elements (with class \`.virtual-list-padding\`)
to have the correct column span. (You can also just specify a fixed \`width\` for your list.)

This example creates 2000 cells with random text colors, then updates 10% of them
randomly every 500ms. Enable paint flashing to see the surgical updates in action.
Note how \`rowChunkSize: 2\` allows consistent row shading via \`:nth-child()\`.

\`\`\`js
import { elements, tosi, scrollListItemIntoView } from 'tosijs'

// Generate random saturated colors
const randomColor = () => {
  const h = Math.floor(Math.random() * 360)
  return \`hsl(\${h}, 80%, 45%)\`
}

const list = []
for (let i = 0; i < 2000; i++) {
  list.push({ id: i, color: randomColor() })
}

const { bigBindTest } = tosi({
  bigBindTest: list
})

// Update 10% of items randomly every 500ms
setInterval(() => {
  const count = Math.floor(list.length * 0.1)
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * list.length)
    bigBindTest[idx].color = randomColor()
  }
}, 500)

const { div, button } = elements

const grid = div(
  {
    class: 'virtual-grid-example',
  },
  ...bigBindTest.listBinding(
    ({div}, item) => div({
      class: 'cell',
      bindText: item.id,
      bind: {
        value: item.color,
        binding: {
          toDOM(el, color) {
            el.style.color = color
          }
        }
      }
    }),
    {
      idPath: 'id',
      virtual: {
        height: 40,
        visibleColumns: 7,
        rowChunkSize: 2,
      }
    }
  )
)

preview.append(
  grid,
  div(
    { class: 'scroll-buttons' },
    button('Scroll to #17', {
      onClick() {
        scrollListItemIntoView(grid, list[17])
      }
    }),
    button('Scroll to #1000', {
      onClick() {
        scrollListItemIntoView(grid, list[1000])
      }
    }),
    button('Scroll to #1984', {
      onClick() {
        scrollListItemIntoView(grid, list[1984])
      }
    })
  ),
)
\`\`\`
\`\`\`css
.scroll-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}
.virtual-grid-example {
  height: calc(100% - 36px);
  width: 100%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 14% 14% 14% 14% 14% 14% 14%;
}

.virtual-grid-example .virtual-list-padding {
  grid-column: 1 / 8;
}

.virtual-grid-example .cell {
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-weight: bold;
  transition: color 0.3s ease;
}

.virtual-grid-example .cell:nth-child(14n+2),
.virtual-grid-example .cell:nth-child(14n+3),
.virtual-grid-example .cell:nth-child(14n+4),
.virtual-grid-example .cell:nth-child(14n+5),
.virtual-grid-example .cell:nth-child(14n+6),
.virtual-grid-example .cell:nth-child(14n+7),
.virtual-grid-example .cell:nth-child(14n+8) {
  background: #0001;
}
\`\`\`

## Multi-Column Grids with \`itemsPerRow\`

When \`itemsPerRow\` is set, the template builder is called N times per array item,
with a \`columnIndex\` argument (0..N-1). This produces a flat CSS grid where every
cell is a direct child of the container — which means \`position: sticky\` works
naturally for pinned rows and columns.

The container automatically gets:
- Class \`tosi-virtual-grid\`
- CSS variable \`--tosi-columns\` (equal to \`itemsPerRow\`)
- \`display: grid\` with \`grid-template-columns: repeat(var(--tosi-columns), 1fr)\`

Override \`grid-template-columns\` in your own CSS to set custom column widths.

\`\`\`js
import { elements, tosi } from 'tosijs'

const columns = [
  { key: 'id',     label: '#',          w: '40px',  sticky: 'left:0' },
  { key: 'name',   label: 'Name',       w: '120px', sticky: 'left:40px', edge: 'right' },
  { key: 'dept',   label: 'Department', w: '110px' },
  { key: 'role',   label: 'Role',       w: '80px' },
  { key: 'level',  label: 'Level',      w: '60px' },
  { key: 'region', label: 'Region',     w: '70px' },
  { key: 'joined', label: 'Joined',     w: '90px' },
  { key: 'email',  label: 'Email',      w: '160px' },
  { key: 'team',   label: 'Team',       w: '100px' },
  { key: 'score',  label: 'Score',      w: '60px' },
  { key: 'status', label: 'Status',     w: '80px',  sticky: 'right:0', edge: 'left' },
]

const depts = ['Engineering', 'Design', 'Product', 'QA', 'Marketing', 'Sales']
const roles = ['Lead', 'Senior', 'Mid', 'Junior']
const regions = ['AMER', 'EMEA', 'APAC']
const teams = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega']
const statuses = ['Active', 'Away', 'Offline']

const data = Array.from({ length: 2000 }, (_, i) => ({
  id: i,
  name: \`Person \${i}\`,
  dept: depts[i % depts.length],
  role: roles[i % roles.length],
  level: \`L\${3 + (i % 5)}\`,
  region: regions[i % regions.length],
  joined: \`2024-\${String((i % 12) + 1).padStart(2, '0')}-15\`,
  email: \`person\${i}@example.com\`,
  team: teams[i % teams.length],
  score: Math.floor(Math.random() * 100),
  status: statuses[i % statuses.length],
}))

const { gridDemo } = tosi({ gridDemo: data })
const { div, span } = elements

const stickyStyle = (col) => col.sticky
  ? \`position:sticky;\${col.sticky}\`
  : ''
const cellClass = (base, col) =>
  base + (col.sticky ? ' sg-pinned' : '') + (col.edge ? \` sg-edge-\${col.edge}\` : '')

// Headers and data cells are siblings in the same grid scroll container.
// Headers are static children; data cells come from the list binding.
// Both sticky columns (left/right) and the sticky header row work via CSS.
const grid = div(
  { class: 'sg-grid' },
  // Header cells — static content, preserved across list updates
  ...columns.map(col =>
    span({
      class: cellClass('sg-header', col),
      style: stickyStyle(col),
    }, col.label)
  ),
  // Data cells — itemsPerRow stamps one cell per column per array item
  ...gridDemo.listBinding(
    ({ span }, item, columnIndex) => {
      const col = columns[columnIndex]
      return span({
        class: cellClass('sg-cell', col),
        style: stickyStyle(col),
        bindText: item[col.key],
      })
    },
    {
      idPath: 'id',
      virtual: { height: 28, itemsPerRow: columns.length },
    }
  )
)

preview.append(grid)
\`\`\`
\`\`\`css
.sg-grid {
  height: 100%;
  overflow: auto;
  grid-template-columns: 40px 120px 110px 80px 60px 70px 90px 160px 100px 60px 80px !important;
}
.sg-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--bg-color, #f5f5f5);
  font-weight: bold;
  padding: 4px 8px;
  border-bottom: 2px solid #ccc;
  white-space: nowrap;
}
.sg-cell {
  padding: 4px 8px;
  height: 28px;
  line-height: 20px;
  border-bottom: 1px solid #eee;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sg-pinned {
  background: var(--bg-color, #fff);
  z-index: 1;
}
.sg-header.sg-pinned {
  z-index: 3;
  background: var(--bg-color, #f5f5f5);
}
.sg-edge-right { border-right: 2px solid #ccc; }
.sg-edge-left  { border-left: 2px solid #ccc; }
\`\`\`

## Variable-Height Items

If your list items have varying heights, you can use \`minHeight\` instead of
relying solely on \`height\`. When \`minHeight\` is specified, the list uses
scroll-fraction interpolation: the total scroll area is estimated from
\`minHeight\`, and the visible slice is determined by interpolating between
the top and bottom of the list based on scroll position.

Items render at their **natural height** — no fixed-height constraint.
The scrollbar position is approximate but smooth.

    bindList: {
      value: myArray,
      idPath: 'id',
      virtual: {
        height: 40,
        minHeight: 30,
      },
    }

\`\`\`js
import { elements, tosi, scrollListItemIntoView } from 'tosijs'

const items = Array.from({ length: 2000 }, (_, i) => ({
  id: i,
  label: \`Item #\${i}\`,
  // Vary description length to create different heights
  description: i % 7 === 0
    ? 'This item has a much longer description that will cause it to wrap onto multiple lines, demonstrating variable-height rendering in the virtualized list.'
    : i % 3 === 0
      ? 'Medium-length description for this item.'
      : '',
}))

const { varHeightExample } = tosi({ varHeightExample: { items } })

const { div, span, button } = elements

const list = div(
  {
    class: 'var-height-list',
  },
  ...varHeightExample.items.listBinding(
    ({div, span}, item) => div(
      {
        class: 'var-height-item',
      },
      span({ bindText: item.label, class: 'var-item-label' }),
      span({ bindText: item.description, class: 'var-item-desc' }),
    ),
    {
      idPath: 'id',
      virtual: {
        height: 40,
        minHeight: 30,
      },
    }
  )
)

preview.append(
  list,
  div(
    { class: 'scroll-buttons' },
    button('Scroll to #5', {
      onClick() {
        scrollListItemIntoView(list, items[5])
      }
    }),
    button('Scroll to #1000', {
      onClick() {
        scrollListItemIntoView(list, items[1000])
      }
    }),
    button('Scroll to #1995', {
      onClick() {
        scrollListItemIntoView(list, items[1995])
      }
    }),
  ),
)
\`\`\`
\`\`\`css
.scroll-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}
.var-height-list {
  height: calc(100% - 36px);
  width: 100%;
  overflow-y: auto;
}
.var-height-item {
  padding: 6px 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.var-height-item:nth-child(odd) {
  background: #f8f8f8;
}
.var-item-label {
  font-weight: bold;
  font-size: 14px;
}
.var-item-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}
.var-item-desc:empty {
  display: none;
}
\`\`\`

## Filtered Lists

It's also extremely common to want to filter a rendered list, and \`tosijs\`
provides both simple and powerful methods for doing this.

## \`hiddenProp\` and \`visibleProp\`

\`hiddenProp\` and \`visibleProp\` allow you to use a property to hide or show array
elements (and they can be \`symbol\` values if you want to avoid "polluting"
your data, e.g. for round-tripping to a database.)

## \`filter\` and \`needle\`

    bindList: {
      value: filterListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
      },
      filter: (emojis, needle) => {
        needle = needle.trim().toLocaleLowerCase()
        if (!needle) {
          return emojis
        }
        return emojis.filter(emoji => \`\${emoji.name} \${emoji.category} \${emoji.subcategory}\`.toLocaleLowerCase().includes(needle))
      },
      needle: filterListExample.needle
    }

If \`bindList\`'s options provide a \`filter\` function and a \`needle\` (proxy or path) then
the list will be filtered using the function via throttled updates.

\`filter\` is passed the whole array, and \`needle\` can be anything so, \`filter\` can
sort the array or even synthesize it entirely.

In this example the \`needle\` is an object containing both a \`needle\` string and \`sort\`
value, and the \`filter\` function filters the list if the string is non-empty, and
sorts the list if \`sort\` is not "default". Also note that an \`input\` event handler
is used to \`touch\` the object and trigger updates.

\`\`\`js
// note that this example is styled by the earlier example

import { elements, tosi } from 'tosijs'
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const { filterListExample } = tosi({
  filterListExample: {
    config: {
      needle: '',
      sort: 'default',
    },
    array: await request.json()
  }
})

const { b, div, span, template, label, input, select, option } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        padding: 10,
        gap: 10,
        height: 60,
        alignItems: 'center'
      },
      onInput() {
        // need to trigger change if any prop of config changes
        touch(filterListExample.config)
      },
    },
    b('filtered list'),
    span({style: 'flex: 1'}),
    label(
      span('sort by'),
      select(
        {
          bindValue: filterListExample.config.sort
        },
        option('default'),
        option('name'),
        option('category')
      ),
    ),
    input({
      type: 'search',
      placeholder: 'filter emoji',
      bindValue: filterListExample.config.needle
    })
  ),
  div(
    {
      class: 'emoji-table',
      style: 'height: calc(100% - 60px)',
    },
    ...filterListExample.array.listBinding(
      ({div, span}, item) => div(
        {
          class: 'emoji-row',
          tabindex: 0,
        },
        span({ bindText: item.chars, class: 'graphic' }),
        span({ bindText: item.name, class: 'no-overflow' }),
        span({ bindText: item.category, class: 'no-overflow' }),
        span({ bindText: item.subcategory, class: 'no-overflow' })
      ),
      {
        idPath: 'name',
        virtual: {
          height: 30,
          rowChunkSize: 3,
        },
        filter: (emojis, config) => {
          let { needle, sort } = config
          needle = needle.trim().toLocaleLowerCase()
          if (needle) {
            emojis = emojis.filter(emoji => \`\${emoji.name} \${emoji.category} \${emoji.subcategory}\`.toLocaleLowerCase().includes(needle))
          }
          return config.sort === 'default' ? emojis : emojis.sort((a, b) => a[config.sort] > b[config.sort] ? 1 : -1)
        },
        needle: filterListExample.config
      }
    )
  )
)
\`\`\`

## List Utilities

Suppose you have used the a list binding to bind an array of objects
to a \`<ul>\`. So the DOM hierarchy looks something like this:

    <ul>  <-- array is bound to this element
      <template>
        <li>
          <span>...</span>
        </li>
      </template>
      <li>  <-- bound to array[0]
        <span>...</span>
      </li>
      <li>  <-- bound to array[1]
        <span>...</span>
      </li>
      ...
    </ul>

### \`getListBinding(element: Element): ListBinding | undefined\`

This gets the ListBinding object managing the bound list contained on the provided
element (if any). In the example above, you could call it on the \`<ul>\` and you'd
get back a \`ListBinding\` instance that contains all kinds of juicy information.

### \`getListItem(element: Element): any\`

Gets you the array item bound to the list instance containing the element (if any).

You could call this on an \`<li>\` element or a any element inside it and get back
the array item bound to the \`<li>\`.

### \`getListInstance(element: Element): { element: Element, item: any } | undefined\`

This returns both the root element bound to the array item, and the array item itself.

Again, you could call this on an \`<li>\` or its contents.

### \`deleteListItem(element: Element): boolean\`

If the element is part of a list instance bound to an array, this splices bound item out of the array
(and updates the rendered list).

If you call this on an \`<li>\` or something inside it, this will splice the bound
array item out of the array and then triggers an update the bound list.

> \`deleteListItem()\` requires that the list binding specifies
> a valid \`idPath\`, or it will throw an error (and fail).

### \`scrollListItemIntoView(element: Element, item: any, options?): boolean\`

Scrolls a bound array item into view within its list container. This is
especially useful for virtualized lists where the item's DOM element may
not exist yet.

- \`element\` - the list container element (the one with the \`bindList\`)
- \`item\` - the raw array item to scroll to
- \`options.position\` - where to place the item in the viewport:
  \`'start'\`, \`'middle'\` (default), \`'end'\`, or \`'nearest'\`

Returns \`true\` on success, \`false\` if the binding or item can't be found
(with a \`console.error\` explaining what went wrong).

For **virtual lists**, the scroll position is computed mathematically from
the item's index and row height, then applied via \`scrollTo({ behavior: 'smooth' })\`.
For **non-virtual lists**, the item's DOM element is found and
\`scrollIntoView()\` is called directly.

## List Operations on Proxied Arrays

In addition to the utility functions above, proxied arrays have \`listFind\`,
\`listUpdate\`, and \`listRemove\` methods that use the same selector pattern
as \`listBinding\`. These are documented in detail in [tosi](/?tosi.ts), but
here's a quick summary:

    // Find an item — returns a proxied item (mutations trigger observers)
    const item = app.items.listFind((item) => item.id, 'abc')

    // Find by DOM element (e.g. in a click handler)
    const item = app.items.listFind(clickedElement)

    // Upsert — update in place (preserving object identity) or push
    app.items.listUpdate((item) => item.id, { id: 'abc', name: 'New Name' })

    // Remove by field match
    app.items.listRemove((item) => item.id, 'abc')

\`listUpdate\` is designed to work hand-in-hand with list bindings: it mutates
the existing object property by property through the proxy, so the
\`itemToElement\` WeakMap still points to the same DOM element. Only changed
properties fire observers, producing surgical DOM updates with no element
teardown or recreation.

## Window Scroll Container (Experimental)

By default, virtualized lists scroll within their container element. For infinite-scroll
feeds or full-page lists, you can use the window as the scroll container instead by
setting \`scrollContainer: 'window'\` in the virtual options:

    bindList: {
      value: feedItems,
      idPath: 'id',
      virtual: {
        height: 120,
        scrollContainer: 'window'
      }
    }

With \`scrollContainer: 'window'\`, the list virtualizes based on the window's scroll
position and viewport height, rather than the element's own scroll position. The list
calculates which items are visible by comparing the element's position (via
\`getBoundingClientRect()\`) against the window's scroll position and inner height.

This is ideal for:
- Social media-style feeds
- Search results pages
- Any full-page scrolling list where the list is part of the main document flow

**Important**: The list element should not be inside a separately scrollable container
when using window scroll. The element can be positioned anywhere on the page - the
virtualization will correctly account for content above the list.

## Templates and Namespaced Elements

List bindings use a **template** — the first child of the bound container — to stamp out
repeated items. The template can be either:

- A \`<template>\` element (recommended for HTML lists). Its content is inert and won't
  trigger premature bindings.
- A **naked element** (the first child is used directly and removed from the DOM).
  This is necessary for **SVG** and **MathML** containers, since \`<template>\` is an
  HTML element and invalid inside namespaced contexts.

### Relative bindings on templates

Bindings that start with \`^\` (relative to the list item) cannot resolve until the
template is cloned into a list instance. If \`touchElement\` encounters an unresolved
\`^\` binding:

- **HTML elements**: a \`console.warn\` is emitted suggesting you wrap the template in
  a \`<template>\` element (which keeps its content inert and avoids the issue).
- **Non-HTML elements** (SVG, MathML, etc.): the binding is silently skipped, since
  \`<template>\` is not available in these namespaces and naked templates are the only option.

In both cases, the \`^\` binding resolves correctly once the cloned element is placed
in a list instance.`,title:"2.1 binding arrays",filename:"list-binding.ts",path:"src/list-binding.ts"},{text:"# 2.2 bindings\n\n`bindings` is simply a collection of common bindings.\n\nYou can create your own bindings easily enough (and add them to `bindings` if so desired).\n\nA `binding` looks like this:\n\n```\ninterface XinBinding {\n  toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void\n  fromDOM?: (element: HTMLElement) => any\n}\n```\n\nThe `fromDOM` function is only needed for bindings to elements that trigger `change` or `input`\nevents, typically `<input>`, `<textarea>`, and `<select>` elements, and of course your\nown [Custom Elements](/?components.ts).\n\n## value\n\nThe `value` binding syncs state from `xin` to the bound element's `value` property. In\ngeneral this should only be used for binding simple things, like `<input>` and `<textarea>`\nelements.\n\n## text\n\nThe `text` binding copies state from `xin` to the bound element's `textContent` property.\n\n## enabled & disabled\n\n> **Note:** `bindEnabled` and `bindDisabled` are deprecated. Use bare proxy\n> property bindings instead:\n>\n>     button({ disabled: proxy.flag })\n>     button({ disabled: proxy.items.tosi.take(list => !list.length) })\n\nThe `enabled` and `disabled` bindings allow you to make a widget's enabled status\nbe determined by the truthiness of something in `xin`, e.g.\n\n```\nimport { tosi, elements } from 'tosijs'\n\nconst { myDoc } = tosi({\n    myDoc: {\n        content: '',\n        unsavedChanges: false\n    }\n})\n\ndocument.body.append(\n    elements.textarea({\n        bindValue: myDoc.content,\n        onInput() {\n            myDoc.unsavedChanges.value = true\n        }\n    }),\n    elements.button(\n        'Save Changes',\n        {\n            disabled: myDoc.unsavedChanges.tosi.take(v => !v),\n            onClick() {\n                myDoc.unsavedChanges.value = false\n            }\n        }\n    )\n)\n```\n\n## list\n\nThe `list` binding makes a copy of a `template` element inside the bound element\nfor every item in the bound `Array`.\n\nIt uses the existing **single** child element it finds inside the bound element\nas its `template`. If the child is a `<template>` (which is a good idea) then it\nexpects that `template` to have a *single child element*.\n\nE.g. if you have a simple unordered list:\n\n    <ul>\n      <li></li>\n    </ul>\n\nYou can bind an array to the `<ul>` and it will make a copy of the `<li>` inside\nfor each item in the source array.\n\nThe `list` binding accepts as options:\n- `idPath: string`\n- `initInstance: (element, item: any) => void`\n- `updateInstance: (element, item: any) => void`\n- `virtual: {width?: number, height: number}`\n- `hiddenProp: symbol | string`\n- `visibleProp: symbol | string`\n\n`initInstance` is called once for each element created, and is passed\nthat element and the array value that it represents.\n\nMeanwhile, `updateInstance` is called once on creation and then any time the\narray value is updated.\n\n### Virtual List Binding\n\nIf you want to bind large arrays with minimal performance impact, you can make a list\nbinding `virtual` by passing the `height` (and optionally `width`) of an item.\nOnly visible elements will be rendered. Just make sure the values passed represent\nthe *minimum* dimensions of the individual rendered items if they can vary in size.\n\n### Filtered Lists and Detail Views\n\nYou can **filter** the elements you wish to display in a bound list by using the\n`hiddenProp` (to hide elements of the list) and/or `visibleProp` (to show elements\nof the list).\n\nYou can pass a `path` or a `symbol` as either the `hiddenProp` or `visibleProp`.\n\nTypically, you can use `hiddenProp` to power filters and `visibleProp` to power\ndetail views. The beauty of using symbols is that it won't impact the serialized\nvalues of the array and different views of the array can use different selection\nand filtering criteria.\n\n> **Note** for a given list-binding, if you specify `hiddenProp` (but not `visibleProp`),\n> then all items in the array will be shown *unless* `item[hiddenProp] === true`.\n>\n> Conversely, if you specify `visibleProp` (but not `hiddenProp`), then all items\n> in the array will be ignored *unless* `item[visibleProp] === true`.\n>\n> If, for some reason, you specify both then an item will only be visible if\n> it `item[visibleProp] === true` and `item[hiddenProp] !== true`.\n\n### Binding custom-elements using idPath\n\nIf you list-bind a custom-element with `bindValue` implemented and providing an\n`idPath` then the list-binding will bind the array items to the value of the\ncustom-element.\n\n### xin-empty-list class\n\nThe `list` binding will automatically add the class `-xin-empty-list` to a\ncontainer bound to an empty array, making it easier to conditionally render\ninstructions or explanations when a list is empty.",title:"2.2 bindings",filename:"bindings.ts",path:"src/bindings.ts"},{text:`# 3. elements

\`tosijs\` provides \`elements\` for easily and efficiently generating DOM elements
without using \`innerHTML\` or other unsafe methods.

\`\`\`js
import { elements } from 'tosijs'

const { div, input, label, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 10
      }
    },
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('text'),
      input({value: 'hello world', placeholder: 'type something'})
    ),
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('checkbox'),
      input({type: 'checkbox', checked: true})
    )
  )
)
\`\`\`

## \`ElementCreator\` functions

\`elements\` is a proxy whose properties are element factory functions,
referred to throughout this documentation as \`elementCreator\`s, functions
of type \`ElementCreator\`. So \`elements.div\` is a function that returns a \`<div>\`
element, \`elements.foo\` creates <foo> elements, and elements.fooBar creates
\`<foo-bar>\` elements.

The arguments of \`elementCreator\`s can be strings, numbers, other
elements, or property-maps, which are converted into attributes or properties
(or bindings).

E.g.

\`\`\`js
import { elements, tosi } from 'tosijs'

const { elementCreatorDemo } = tosi({
  elementCreatorDemo: {
    isChecked: true,
    someString: 'hello elementCreator',
    someColor: 'blue',
    clicks: 0
  }
})

const { div, button, label, input } = elements

preview.append(
  div('I am a div'),
  div(
    {
      style: { color: 'blue' }
    },
    elementCreatorDemo.someString
  ),
  label(
    'Edit someString',
    input({bindValue: elementCreatorDemo.someString})
  ),
  div(
    button(
      'Click me',
      {
        onClick() {
          elementCreatorDemo.clicks += 1
        }
      }
    ),
    div(elementCreatorDemo.clicks, ' clicks so far'),
  ),
  label(
    'isChecked?',
    input({type: 'checkbox', bindValue: elementCreatorDemo.isChecked})
  )
)
\`\`\`

## camelCase conversion

Attributes in camelCase, e.g. \`dataInfo\`, will be converted to kebab-case,
so:

    span({dataInfo: 'foo'})        // produces <span data-info="foo"></span>

## style properties

\`style\` properties can be objects, and these are used to modify the
element's \`style\` object (while a string property will just change the
element's \`style\` attribute, eliminating previous changes).

    span({style: 'border: 1px solid red'}, {style: 'font-size: 15px'})

…produces \`<span style="font-size: 15px"></span>\`, which is probably
not what was wanted.

    span({style: {border: '1px solid red'}, {style: {fontSize: '15px'}}})

…produces \`<span style="border: 1px solid red; fon-size: 15px></span>\`
which is probably what was wanted.

## event handlers

Properties starting with \`on\` (followed by an uppercase letter)
will be converted into event-handlers, so \`onMouseup\` will be
turned into a \`mouseup\` listener.

## binding

You can [bind](/?bind.ts) an element to state using [bindings](/?bindings.ts)
using convenient properties, e.g.

    import { elements } from 'tosijs'
    const {div} = elements
    div({ bindValue: 'app.title' })

…is syntax sugar for:

    import { elements, bind, bindings } from 'tosijs'
    const { div } = elements
    bind( div(), 'app.title', bindings.value )

If you want to use your own bindings, you can use \`apply\`:

    const visibleBinding = {
      toDOM(element, value) {
        element.classList.toggle('hidden', !value)
      }
    }

    div({ apply(elt){
      bind(elt, 'app.prefs.isVisible', visibleBinding})
    } })

## event-handlers

You can attach event handlers to elements using \`on<EventType>\`
as syntax sugar, e.g.

    import { elements } from 'tosijs'
    const { button } = elements
    document.body.append(
      button('click me', {onClick() {
        alert('clicked!')
      }})
    )

…is syntax sugar for:

    import { elements, on } from 'tosijs'
    const { button } = elements
    const aButton = button('click me')
    on(aButton, 'click', () => {
      alert('clicked!')
    })
    document.body.append(
      aButton
    )

There are some subtle but important differences between \`on()\` and
\`addEventListener\` which are discussed in detail in the section on
[bind](/?bind.ts).

## apply

A property named \`apply\` is assumed to be a function that will be called
on the element.

    span({
      apply(element){ element.textContent = 'foobar'}
    })

…produces \`<span>foobar</span>\`.

## fragment

\`elements.fragment\` is produces \`DocumentFragment\`s, but is otherwise
just like other element factory functions.

## svgElements

\`svgElements\` is a proxy just like \`elements\` but it produces **SVG** elements in
the appropriate namespace.

\`\`\`js
import { svgElements, tosi, xin } from 'tosijs'

const { svg, g, path, circle, polygon } = svgElements

// --- radar background ---
const outerRing = 'M128,8 C194.274,8,248,61.7258,248,128 C248,194.274,194.274,248,128,248 C61.7258,248,8.00001,194.274,8.00001,128 C8.00001,61.7258,61.7258,8,128,8 z'
const vLine = 'M128,53 C128,53,128,203,128,203'
const hRight = 'M203,128 C203,128,143,128,143,128'
const hLeft = 'M113,128 C113,128,53,128,53,128'
const guide = 'fill:#00a79e;fill-opacity:0.127;fill-rule:evenodd;stroke:#00a79e;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:4;'
const axis = guide + 'stroke-opacity:0.24;'

// --- two separate arrays: friendlies and hostiles ---
let nextId = 0
const RANGE = 115

function spawnFriendly() {
  const angle = Math.random() * Math.PI * 2
  const heading = angle + Math.PI * (0.6 + Math.random() * 0.8)
  const speed = 0.2 + Math.random() * 0.3
  return {
    id: nextId++,
    x: 128 + Math.cos(angle) * 105, y: 128 + Math.sin(angle) * 105,
    dx: Math.cos(heading) * speed, dy: Math.sin(heading) * speed,
  }
}

function spawnHostile() {
  const angle = Math.random() * Math.PI * 2
  const heading = angle + Math.PI * (0.7 + Math.random() * 0.6)
  const speed = 0.5 + Math.random() * 0.6
  return {
    id: nextId++,
    x: 128 + Math.cos(angle) * 110, y: 128 + Math.sin(angle) * 110,
    dx: Math.cos(heading) * speed, dy: Math.sin(heading) * speed,
  }
}

const { friendlies, hostiles } = tosi({
  friendlies: Array.from({ length: 6 }, spawnFriendly),
  hostiles: Array.from({ length: 4 }, spawnHostile),
})

// custom binding: position a <g> from its list item's x,y
const position = (el, item) => {
  if (item) el.setAttribute('transform', \`translate(\${item.x},\${item.y})\`)
}

// --- list-bound blip layers (one per array, no filter needed) ---
const friendlyLayer = g(
  g(
    circle({ r: '5', fill: 'none', stroke: '#8cc63f', 'stroke-width': '1' }),
    { bind: { value: '^', binding: position } }
  ),
  { bindList: { value: friendlies, idPath: 'id' } }
)
const hostileLayer = g(
  g(
    polygon({ points: '0,-6 5.2,3 -5.2,3', fill: 'none', stroke: '#ff1d25', 'stroke-width': '1.5', 'stroke-linejoin': 'round' }),
    { bind: { value: '^', binding: position } }
  ),
  { bindList: { value: hostiles, idPath: 'id' } }
)

preview.append(
  svg(
    { width: '256', height: '256', viewBox: '0 0 256 256' },
    g(
      path({ style: guide + 'stroke-opacity:0.5;', d: outerRing }),
      path({ style: axis, d: vLine }),
      path({ style: axis, d: hRight }),
      path({ style: axis, d: hLeft }),
    ),
    friendlyLayer,
    hostileLayer,
  )
)

// animate: advance, cull out-of-range, spawn new
function tick(arr) {
  const kept = []
  for (const b of arr) {
    const nx = b.x + b.dx, ny = b.y + b.dy
    if (Math.sqrt((nx - 128) ** 2 + (ny - 128) ** 2) < RANGE) {
      kept.push({ ...b, x: nx, y: ny })
    }
  }
  return kept
}
setInterval(() => {
  const f = tick(xin.friendlies)
  if (Math.random() < 0.06) f.push(spawnFriendly())
  xin.friendlies = f

  const h = tick(xin.hostiles)
  if (Math.random() < 0.04) h.push(spawnHostile())
  xin.hostiles = h
}, 50)
\`\`\`

## mathML

\`mathML\` is a proxy just like \`elements\` but it products **MathML** elements in
the appropriate namespace.

> ### Caution
>
> Both \`svgElements\` and \`mathML\` are experimental and do not have anything like  the
> degree of testing behind them as \`elements\`. In particular, the properties of
> SVG elements (and possible MathML elements) are quite different from ordinary
> elements, so the underlying \`ElementCreator\` will never try to set properties
> directly and will always use \`setAttribute(...)\`.
>
> E.g. \`svgElements.svg({viewBox: '0 0 100 100'})\` will call \`setAttribute()\` and
> not set the property directly, because the \`viewBox\` property is… weird, but
> setting the attribute works.
>
> Again, use with caution!

## \`bindParts()\`

\`\`\`
bindParts(
  root: Element,
  bindingMap: Record<string, ElementProps>,
  dataAttribute?: string  // default: 'part'
): void
\`\`\`

\`bindParts()\` applies \`ElementProps\` to elements inside \`root\` that are identified
by a \`data-\` attribute. This lets you take an existing chunk of DOM — from \`innerHTML\`,
a CMS, a server-rendered page, or an HTML \`<template>\` — and wire up bindings,
event handlers, and properties without having to build the DOM programmatically.

    const root = document.querySelector('.my-widget')
    root.innerHTML = \`
      <h2 data-part="title"></h2>
      <input data-part="search">
      <button data-part="submit">Go</button>
    \`

    bindParts(root, {
      title:  { bindText: app.title },
      search: { bindValue: app.query },
      submit: { onClick: () => performSearch() },
    })

Each key in \`bindingMap\` is matched against the value of \`data-part\` (or whatever
\`dataAttribute\` you specify). Matching elements receive the full \`ElementProps\`
treatment — the same logic used by element creators — so \`bind\`, \`bindText\`,
\`on*\` handlers, \`style\`, \`class\`, \`apply\`, and proxy values all work.

Elements are tracked via a \`WeakSet\` so calling \`bindParts()\` again on the same
root is safe — already-bound elements are skipped.

### Custom data attribute

Pass a third argument to use a different attribute name:

    bindParts(root, map, 'role')  // matches data-role="..."`,title:"3. elements",filename:"elements.ts",path:"src/elements.ts"},{text:`# 4. web-components

**tosijs** provides the abstract \`Component\` class to make defining custom-elements
easier.

## Component

To define a custom-element you can subclass \`Component\`, simply add the properties
and methods you want, with some help from \`Component\` itself, and then simply
export your new class's \`elementCreator()\` which is a function that defines your
new component's element and produces instances of it as needed.

\`\`\`
import {Component} from 'tosijs'

class ToolBar extends Component {
  static preferredTagName = 'tool-bar'
  static shadowStyleSpec = {
    ':host': {
      display: 'flex',
      gap: '10px',
    },
  }
}

export const toolBar = ToolBar.elementCreator()
\`\`\`

> **Note**: Custom elements default to \`display: inline\`, which often causes them to
> appear dimensionless. Unless you want this (e.g., for content-holder elements),
> set an explicit \`display\` value (e.g., \`block\`, \`inline-block\`, \`flex\`) in your
> \`:host\` styles.

This component is just a structural element. By default a \`Component\` subclass will
comprise itself and a \`<slot>\`. You can change this by giving your subclass its
own \`content\` template.

\`static preferredTagName\` sets the desired tag name for the custom element.
If omitted, it is derived from the class name (e.g. \`ToolBar\` → \`tool-bar\`),
but this does not survive minification. \`elementCreator()\` returns an
\`ElementCreator\` function that creates instances of the element.

See [elements](/?elements.ts) for more information on \`ElementCreator\` functions.

### Component properties

#### content: Element | Element[] | () => Element | () => Element[] | null

Here's a simple example of a custom-element that simply produces a
\`<label>\` wrapped around \`<span>\` and an \`<input>\`. Its value is synced
to that of its \`<input>\` so the user doesn't need to care about how
it works internally.

\`\`\`js
import { Component, elements } from 'tosijs'

class LabeledInput extends Component {
  static initAttributes = { caption: 'untitled' }
  value = ''

  content = ({label, span, input}) => label(span(), input())

  connectedCallback() {
    super.connectedCallback()
    const {input} = this.parts
    input.addEventListener('input', () => {
      this.value = input.value
    })
  }

  render() {
    super.render()
    const {span, input} = this.parts
    span.textContent = this.caption
    if (input.value !== this.value) {
      input.value = this.value
    }
  }
}

const labeledInput = LabeledInput.elementCreator()

preview.append(
  labeledInput({caption: 'A text field', value: 'some text'})
)
\`\`\`

\`content\` is, in essence, a template for the internals of the element. By default
it's a single \`<slot>\` element. If you explicitly want an element with no content
you can set your subclass's content to \`null\` or omit any \`<slot>\` from its template.

By setting content to be a function that returns elements instead of a collection
of elements you can take customize elements based on the component's properties.
In particular, you can use \`onXxxx\` syntax sugar to bind events.

(Note that you cannot bind to xin paths reliably if your component uses a \`shadowDOM\`
because \`xin\` cannot "see" elements there. As a general rule, you need to take care
of anything in the \`shadowDOM\` yourself.)

##### ElementProps in content arrays

When \`content\` returns an array, any plain objects (ElementProps) in the array are
applied to the **host element** itself, just as they would be applied to the element
being created by \`div()\`, \`span()\`, etc. This provides a clean way to set up styles,
event handlers, classes, and bindings on the component from within \`content\`:

\`\`\`
class MyButton extends Component {
  static preferredTagName = 'my-button'

  content = ({span}) => [
    { onClick: () => console.log('clicked!'), style: { cursor: 'pointer' } },
    span({part: 'label'}, 'Click me'),
  ]
}
\`\`\`

Multiple ElementProps objects are merged (later values override earlier ones).
Only plain objects are treated as props — DOM nodes, strings, numbers, and proxied
values pass through as children.

If you'd like to see a more complex example along the same lines, look at
[form and field](https://ui.tosijs.net/?form.ts).

##### <slot> names and the \`slot\` attribute

\`\`\`
class MenuBar extends Component {
  static shadowStyleSpec = {
    ':host, :host > slot': {
      display: 'flex',
    },
    ':host > slot:nth-child(1)': {
      flex: '1 1 auto'
    },
  }

  content = ({slot}) => [slot(), slot({name: 'gadgets'})]
}

export menuBar = MenuBar.elementCreator()
\`\`\`

One of the neat things about custom-elements is that you can give them *multiple*
\`<slot>\`s with different \`name\` attributes and then have children target a specific
slot using the \`slot\` attribute.

This app's layout (the nav sidebar that disappears if the app is in a narrow space, etc.)
is built using just such a custom-element.

#### \`<tosi-slot>\`

If you put \`<slot>\` elements inside a \`Component\` subclass that doesn't have a
shadowDOM, they will automatically be replaced with \`<tosi-slot>\` elements that
have the expected behavior (i.e. sucking in children in based on their \`<slot>\`
attribute).

\`<tosi-slot>\` doesn't support \`:slotted\` but since there's no shadowDOM, just
style such elements normally, or use \`tosi-slot\` as a CSS-selector.

Note that you cannot give a \`<slot>\` element attributes (other than \`name\`) so if
you want to give a \`<tosi-slot>\` attributes (such as \`class\` or \`style\`), create it
explicitly (e.g. using \`elements.tosiSlot()\`) rather than using \`<slot>\` elements
and letting them be switched out (because they'll lose any attributes you give them).

> The legacy name \`<xin-slot>\` still works but emits a deprecation warning.

Here's a very simple example:

\`\`\`js
import { Component, elements } from 'tosijs'

class FauxSlotExample extends Component {
  content = ({h4, h5, tosiSlot}) => [
    h4('This is a web-component with no shadow DOM and working slots!'),
    h5('top slot'),
    tosiSlot({name: 'top'}),
    h5('middle slot'),
    tosiSlot(),
    h5('bottom slot'),
    tosiSlot({name: 'bottom'}),
  ]
}

FauxSlotExample.preferredTagName = 'faux-slot-example'
FauxSlotExample.lightStyleSpec = {
  ':host': {
    display: 'flex',
    flexDirection: 'column'
  },
  ':host h4, :host h5': {
    margin: 0,
  },
  ':host tosi-slot': {
    border: '2px solid grey'
  }
}
const fauxSlotExample = FauxSlotExample.elementCreator()

const { div } = elements

preview.append(
  fauxSlotExample(
    div({slot: 'bottom'}, 'I should be on the bottom'),
    div({slot: 'top'}, 'I should be on the top'),
    div('I should be in the middle')
  )
)
\`\`\`

> ##### Background
>
> \`<slot>\` elements do not work as expected in shadowDOM-less components. This is
> hugely annoying since it prevents components from composing nicely unless they
> have a shadowDOM, and while the shadowDOM is great for small widgets, it's
> terrible for composite views and breaks \`tosijs\`'s bindings (inside the shadow
> DOM you need to do data- and event- binding manually).

#### styleNode: HTMLStyleElement

\`styleNode\` is the \`<style>\` element that will be inserted into the element's
\`shadowRoot\`.

If a \`Component\` subclass has no \`styleNode\`, no \`shadowRoot\` will be
created. This reduces the memory and performance cost of the element.

This is to avoid the performance/memory costs associated with the \`shadowDOM\`
for custom-elements with no styling.

##### Notes

Styling custom-elements can be tricky, and it's worth learning about
how the \`:host\` and \`:slotted()\` selectors work.

It's also very useful to understand how CSS-Variables interact with the
\`shadowDOM\`. In particular, CSS-variables are passed into the \`shadowDOM\`
when other CSS rules are not. You can use css rules to modify css-variables
which will then penetrate the \`shadowDOM\`.

#### refs: {[key:string]: Element | undefined}

    render() {
      super.render() // see note
      const {span, input} = this.parts
      span.textContent = this.caption
      if (input.value !== this.value) {
        input.value = this.value
      }
    }

> **Note**: For form-associated components, \`super.render()\` syncs the form value
> automatically when the value changes. Always call \`super.render()\` if you override
> \`render()\` in a form-associated component.
>
> It is *necessary* to call \`super.connectedCallback\`, \`super.disconnectedCallback\`,
> \`super.render()\` (for form-associated), and \`super()\` in the \`constructor()\`
> should you override them.

\`this.parts\` returns a proxy that provides elements conveniently and efficiently. It
is intended to facilitate access to static elements (it memoizes its values the
first time they are computed).

\`this.parts.foo\` will return a content element with \`data-ref="foo"\`. If no such
element is found it tries it as a css selector, so \`this.parts['.foo']\` would find
a content element with \`class="foo"\` while \`this.parts.h1\` will find an \`<h1>\`.

\`this.parts\` will also remove a \`data-ref\` attribute once it has been used to find
the element. This means that if you use all your refs in \`render\` or \`connectedCallback\`
then no trace will remain in the DOM for a mounted element.

### Component properties

#### content: ((elements: ElementsProxy) => ContentType) | null | ContentType = slot()

A component's content \`property\` can either be static content (it defaults to being a \`<slot>\` element) or an arrow function
that creates the basic content of the element on hydration. Static content will be deep-cloned.

By using an arrow function the content created can refer to the custom-element's properties and attributes (and this occurs post-initialization). This also means you can bind event-handlers in the component (which should also be arrow functions unless they don't need to refer to the element)

Because a \`content\` function is passed the \`elements\` proxy, you can easily destructure any element creators you need:

\`\`\`
content = ({div}) => div('hello world')
\`\`\`

\`ContentType\` can be an HTMLElement or an array of elements.

> Note that if a component does not use the shadowDOM, its \`<slot>\` elements will be replaced with \`<tosi-slot>\` elements.
> This allows composition to work as expected without requiring the shadow DOM.

### Component static properties

#### static initAttributes: Record<string, any>

Declares attributes that should be watched and synced with properties. The keys are
property names (camelCase), and the values are the defaults which also determine the type.

    import { Component } from 'tosijs'

    class MyWidget extends Component {
      static initAttributes = {
        caption: '',      // string attribute
        count: 0,         // number attribute (auto-parsed)
        disabled: false,  // boolean attribute (presence/absence)
      }

      render() {
        // this.caption, this.count, this.disabled are automatically available
        // and synced with HTML attributes
      }
    }

This replaces both the old \`initAttributes()\` method call AND the instance property
declarations. A single static object now defines which properties are attributes,
their default values, and their types:

- **All-in-one**: Attributes, defaults, and types defined in one place
- **Declarative**: No constructor needed
- **Type inference**: Default values determine parsing (boolean attributes just work)

##### Attribute Types

- **string** (default \`''\`): Attribute value used as-is
- **number** (default \`0\`): Attribute value parsed with \`parseFloat()\`
- **boolean** (default \`false\`): Presence means \`true\`, absence means \`false\`

For non-attribute properties (e.g. objects), just declare them as regular instance
properties on your class.

##### Migration from initAttributes()

Old (deprecated):

    class MyComponent extends Component {
      caption = ''
      count = 0

      constructor() {
        super()
        this.initAttributes('caption', 'count')
      }
    }

New:

    class MyComponent extends Component {
      static initAttributes = { caption: '', count: 0 }
    }

### Component methods

#### queueRender(triggerChangeEvent = false): void

Uses \`requestAnimationFrame\` to queue a call to the component's \`render\` method. If
called with \`true\` it will also trigger a \`change\` event.

#### private initValue(): void

**Don't call this!** Sets up expected behavior for an \`HTMLElement\` with
a value (i.e. triggering a \`change\` events and \`render\` when the \`value\` changes).

#### private hydrate(): void

**Don't call this** Appends \`content\` to the element (or its \`shadowRoot\` if it has a \`styleNode\`)

#### connectedCallback(): void

If the class has an \`onResize\` handler then a ResizeObserver will trigger \`resize\`
events on the element when its size changes and \`onResize\` will be set up to respond
to \`resize\` events.

Also, if the subclass has defined \`value\`, calls \`initValue()\`.

\`connectedCallback\` is a great place to attach **event-handlers** to elements in your component.

Be sure to call \`super.connectedCallback()\` if you implement \`connectedCallback\` in the subclass.

#### disconnectedCallback(): void

Be sure to call \`super.disconnectedCallback()\` if you implement \`disconnectedCallback\` in the subclass.

#### render(): void

Be sure to call \`super.render()\` if you implement \`render\` in the subclass.

### Component static properties

#### Component.elements

    const {label, span, input} = Component.elements

This is simply provided as a convenient way to get to [elements](/?elements.ts)

#### static formAssociated: boolean

Set \`static formAssociated = true\` in your subclass to enable form participation
via \`ElementInternals\`. When true, the component will have \`this.internals\` available
for form integration, validation, ARIA properties, and custom states.

Form-associated components are automatically made focusable (\`tabindex="0"\`) unless
you explicitly set a different \`tabindex\`. This is required for form validation to
work correctly (the browser needs to focus invalid elements).

See [web-component-validation](/?web-component-validation) for the complete validation
API documentation, including:

- Validation methods (\`checkValidity()\`, \`reportValidity()\`, \`setValidity()\`)
- Automatic validation against HTML attributes (\`required\`, \`minlength\`, \`maxlength\`, \`pattern\`)
- Form lifecycle callbacks (\`formResetCallback\`, \`formDisabledCallback\`, \`formStateRestoreCallback\`)
- Custom states via \`this.internals.states\`
- Complete examples

#### value property

**If your component has a \`value\`, it should behave like an \`<input>\`.**

The \`value\` property is special in Component. It is NOT an attribute - it's a property
that can be *initialized* from an attribute. Here's what you need to know:

1. **Declare it with a default**: Simply assign a non-undefined default (e.g., \`value = ''\`)
2. **Initialization**: If a \`value\` attribute is present, it initializes the property (as a string)
3. **Setting value**: You can set it to any type directly (e.g., objects, arrays)
4. **Change events**: When \`value\` changes, a \`change\` event is automatically dispatched
5. **Auto-render**: When \`value\` changes, \`render()\` is automatically called
6. **Computed values**: If your value is computed, call \`queueRender(true)\` to trigger change + render

**Do NOT put \`value\` in \`static initAttributes\`** - it will be rejected with a warning.
The Component class handles \`value\` specially to provide form-like behavior automatically.

#### adoptedCallback

The \`adoptedCallback\` lifecycle method is called when a component is moved to a different
document, such as into or out of an iframe. Subclasses can implement this directly.

\`\`\`js
import { Component, elements } from 'tosijs'

class AdoptableWidget extends Component {
  docCount = 0

  content = ({span}) => span({part: 'info'})

  adoptedCallback() {
    this.docCount++
    this.queueRender()
  }

  render() {
    this.parts.info.textContent = \`Adopted \${this.docCount} time(s). Document: \${this.ownerDocument.title || 'untitled'}\`
  }
}

AdoptableWidget.preferredTagName = 'adoptable-widget'
const adoptableWidget = AdoptableWidget.elementCreator()
const {iframe, button, div, span} = elements

const widget = adoptableWidget()
const widgetSlot = span({class: 'widget-slot'}, widget)
const frame = iframe()
const moveBtn = button('Move to iframe')
const backBtn = button('Move back')

moveBtn.addEventListener('click', () => {
  frame.contentDocument.body.append(frame.contentDocument.adoptNode(widget))
})
backBtn.addEventListener('click', () => {
  widgetSlot.append(document.adoptNode(widget))
})

preview.append(widgetSlot, div(moveBtn, backBtn), frame)
\`\`\`
\`\`\`css
.preview .widget-slot {
  display: block;
  min-height: 40px;
  border: 2px dashed #888;
  margin-bottom: 10px;
}
.preview adoptable-widget {
  display: block;
  padding: 10px;
  background: #666;
  color: white;
}
.preview > div { display: flex; gap: 8px; margin-bottom: 10px; }
.preview iframe {
  width: 100%;
  height: 60px;
  border: 2px dashed #888;
  background: #fff;
}
\`\`\`

### Component static properties

#### \`static preferredTagName?: string\`

Sets the desired tag name for the custom element. If omitted, it is derived
from the class name (e.g. \`ToolBar\` → \`tool-bar\`), but this does **not** survive
minification. If the tag is already in use, a unique anonymous tag is generated.

#### \`static shadowStyleSpec?: XinStyleSheet\`

Styles injected into the component's shadow DOM as a \`<style>\` element.
Setting this property causes the component to use shadow DOM.

#### \`static lightStyleSpec?: XinStyleSheet\`

Global styles appended to \`document.head\` when the first instance is inserted
in the DOM. \`:host\` selectors are automatically rewritten to the tag name, e.g.:

    class ToolBar extends Component {
      static preferredTagName = 'tool-bar'
      static lightStyleSpec = {
        ':host': {
          display: 'flex',
          padding: 'var(--toolbar-padding, 0 8px)',
          gap: '4px'
        }
      }
    }

produces \`tool-bar { display: flex; ... }\` in a global \`<style>\` element.

#### \`static extends?: string\`

For customized built-in elements. Passed as \`{ extends }\` to \`customElements.define()\`.

### Component static methods

#### Component.elementCreator(): ElementCreator

    export const toolBar = ToolBar.elementCreator()

Returns a function that creates the custom-element. Registration uses
\`preferredTagName\`, \`lightStyleSpec\`, \`shadowStyleSpec\`, and \`extends\`
from the class's static properties.

\`elementCreator\` is memoized and only generated once.

> **Deprecated:** Passing \`{ tag, styleSpec, extends }\` as options to
> \`elementCreator()\` still works but emits deprecation warnings.
> Use the static properties instead.

## Examples

[tosijs-ui](https://ui.tosijs.net) is a component library built using this \`Component\` class
that provides the essential additions to standard HTML elements needed to build many
user-interfaces.

- [live-example](https://ui.tosijs.net/?live-example.ts) uses multiple named slots to implement
  powers the interactive examples used for this site.
- [side-nav](https://ui.tosijs.net/?side-nav.ts) implements the sidebar navigation
  used on this site.
- [data-table](https://ui.tosijs.net/?data-table.ts) implements virtualized tables
  with resizable, reorderable, sortable columns that can handle more data
  than you're probably willing to load.
- [form and field](https://ui.tosijs.net/?form.ts) allow you to
  quickly create forms that leverage all the built-in functionality of \`<input>\`
  elements (including powerful validation) even for custom-fields.
- [markdown-viewer](https://ui.tosijs.net/?markdown-viewer.ts) uses \`marked\` to render
  markdown.
- [babylon-3d](https://ui.tosijs.net/?babylon-3d.ts) lets you easily embed 3d scenes
  in your application using [babylonjs](https://babylonjs.com/)`,title:"4. web-components",filename:"component.ts",path:"src/component.ts"},{text:`# 4.1. web-component-validation

Form validation for custom elements using \`ElementInternals\`.

## Overview

When building form-associated custom elements, you want them to behave like native
\`<input>\` elements - participating in form submission, validation, and lifecycle events.

With \`static formAssociated = true\` and a \`value\` property, your Component subclass
automatically gets:

- Form submission (value appears in FormData)
- Validation API (\`checkValidity()\`, \`reportValidity()\`, \`setCustomValidity()\`)
- Automatic validation for \`required\`, \`minlength\`, \`maxlength\`, \`pattern\` attributes
- Form lifecycle callbacks (reset, disabled state, browser restore)
- Focusability for validation UI

## Quick Start

Here's a minimal form-associated component:

\`\`\`js
import { Component, elements } from 'tosijs'

class SimpleInput extends Component {
  static preferredTagName = 'simple-input'
  static formAssociated = true
  value = ''

  content = ({input}) => input({part: 'input', style: 'padding: 8px'})

  connectedCallback() {
    super.connectedCallback()
    this.parts.input.addEventListener('input', (e) => {
      this.value = e.target.value
    })
  }

  render() {
    super.render()
    if (this.parts.input.value !== this.value) {
      this.parts.input.value = this.value
    }
  }
}

const simpleInput = SimpleInput.elementCreator()
const { form, button, div } = elements

const output = div()
const myForm = form(
  simpleInput({name: 'username', required: true}),
  button({type: 'submit'}, 'Submit')
)
myForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const fd = new FormData(e.target)
  output.textContent = 'FormData: ' + [...fd.entries()].map(([k,v]) => \`\${k}=\${v}\`).join(', ')
})

preview.append(myForm, output)
\`\`\`
\`\`\`css
.preview form { display: flex; gap: 8px; align-items: center; }
.preview simple-input { display: inline-block; }
\`\`\`

## Validation API

Form-associated components expose the standard validation API:

### Properties

- \`validity: ValidityState\` - Current validity state (readonly)
- \`validationMessage: string\` - Current validation message (readonly)
- \`willValidate: boolean\` - Whether element will be validated (readonly)

### Methods

- \`checkValidity()\` - Returns \`true\` if valid; fires \`invalid\` event if not
- \`reportValidity()\` - Like \`checkValidity()\` but shows browser validation UI
- \`setCustomValidity(message)\` - Set custom error (empty string clears)
- \`setValidity(flags, message?, anchor?)\` - Low-level validity control
- \`setFormValue(value, state?)\` - Explicitly set form value
- \`validateValue()\` - Run constraint validation (called automatically)

### ValidityStateFlags

When calling \`setValidity()\`, you can set these flags:
- \`valueMissing\` - required but empty
- \`typeMismatch\` - wrong type (email, url, etc.)
- \`patternMismatch\` - doesn't match pattern attribute
- \`tooLong\` - exceeds maxlength
- \`tooShort\` - below minlength
- \`rangeUnderflow\` / \`rangeOverflow\` - outside min/max range
- \`stepMismatch\` - doesn't match step
- \`badInput\` - browser can't parse input
- \`customError\` - custom error via setCustomValidity

## Automatic Validation

Component automatically validates against standard HTML constraint attributes
when \`value\` changes:

- \`required\` - value cannot be empty
- \`minlength\` - minimum string length
- \`maxlength\` - maximum string length
- \`pattern\` - regex pattern (anchored to full string)

\`\`\`js
import { Component, elements } from 'tosijs'

class ValidatedInput extends Component {
  static preferredTagName = 'validated-input'
  static formAssociated = true
  value = ''

  content = ({input}) => input({part: 'input', style: 'padding: 8px'})

  connectedCallback() {
    super.connectedCallback()
    this.parts.input.addEventListener('input', (e) => {
      this.value = e.target.value
    })
  }

  render() {
    super.render()
    if (this.parts.input.value !== this.value) {
      this.parts.input.value = this.value
    }
  }
}

const validatedInput = ValidatedInput.elementCreator()
const { form, button, div } = elements

const output = div()
const myForm = form(
  validatedInput({
    name: 'code',
    required: true,
    minlength: '3',
    maxlength: '10',
    pattern: '[a-z]+'
  }),
  button({type: 'submit'}, 'Submit')
)
myForm.addEventListener('submit', (e) => {
  e.preventDefault()
  output.textContent = 'Valid! Value: ' + e.target.elements.code.value
})

preview.append(div('Enter 3-10 lowercase letters:'), myForm, output)
\`\`\`
\`\`\`css
.preview form { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
.preview validated-input { display: inline-block; }
\`\`\`

### Custom Validation

Override \`validateValue()\` for custom logic. Call \`super.validateValue()\` first
to include standard constraint validation:

    validateValue() {
      super.validateValue() // check required, minlength, etc.

      // Add custom validation
      if (this.value && !/^[a-z][a-z0-9_]*$/.test(this.value)) {
        this.setValidity(
          { patternMismatch: true },
          'Must start with letter, only lowercase letters/numbers/underscores',
          this
        )
      }
    }

## Form Lifecycle Callbacks

Component provides default implementations for form lifecycle callbacks:

### formResetCallback()

Called when the containing \`<form>\` is reset. Default resets \`value\` to
\`defaultValue\` or empty string.

### formDisabledCallback(disabled: boolean)

Called when the form or a parent \`<fieldset>\` is disabled/enabled.
Default syncs the \`disabled\` attribute.

### formStateRestoreCallback(state)

Called when browser restores form state (back/forward navigation).
Default restores string values.

## Custom States

Use \`this.internals.states\` to expose component state to CSS via \`:state()\`:

\`\`\`js
import { Component, elements } from 'tosijs'

class StatefulInput extends Component {
  static preferredTagName = 'stateful-input'
  static formAssociated = true
  value = ''

  content = ({input}) => input({part: 'input', style: 'padding: 8px; border: 2px solid #ccc; border-radius: 4px;'})

  connectedCallback() {
    super.connectedCallback()
    const input = this.parts.input

    input.addEventListener('input', () => {
      this.value = input.value
    })

    input.addEventListener('focus', () => {
      this.internals.states.add('focused')
    })

    input.addEventListener('blur', () => {
      this.internals.states.delete('focused')
      // Show validation state on blur
      if (this.validity && !this.validity.valid) {
        this.internals.states.add('invalid')
      } else {
        this.internals.states.delete('invalid')
      }
    })
  }

  render() {
    super.render()
    if (this.parts.input.value !== this.value) {
      this.parts.input.value = this.value
    }
  }
}

const statefulInput = StatefulInput.elementCreator()
const { div } = elements

preview.append(
  div('Required, min 3 chars. Focus shows blue border, invalid on blur shows red:'),
  statefulInput({required: true, minlength: '3'})
)
\`\`\`
\`\`\`css
.preview stateful-input { display: block; margin-top: 8px; }
.preview stateful-input:state(focused) input { border-color: #007bff !important; outline: none; }
.preview stateful-input:state(invalid) input { border-color: #dc3545 !important; }
\`\`\`

## Browser Support

\`ElementInternals\` is supported in all modern browsers:
- Chrome 77+, Firefox 93+, Safari 16.4+, Edge 79+

For older browsers, form-associated features gracefully degrade - the component
still works but won't participate in form submission or validation.

## See Also

- [web-components](/?web-components) - Component class documentation
- [MDN: ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
- [MDN: Form-associated custom elements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals)`,title:"4.1. web-component-validation",filename:"form-validation.ts",path:"src/form-validation.ts"},{text:`# 4.2 blueprints

One issue with standard web-components built with tosijs is that building them
"sucks in" the version of \`tosijs\` you're working with. This isn't a huge problem
with monolithic code-bases, but it does prevent components from being loaded
"on-the-fly" from CDNs and composed on the spot and it does make it hard to
"tree shake" component libraries.

\`\`\`js
import { elements, tosiLoader, tosiBlueprint } from 'tosijs'

preview.append(
  tosiLoader(
    tosiBlueprint({
      tag: 'swiss-clock',
      src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
      blueprintLoaded({creator}) {
        preview.append(creator())
      }
    }),
  )
)
\`\`\`

Another issue is name-collision. What if two people create a \`<tab-selector>\` component
and you want to use both of them? Or you want to switch to a new and better one but
don't want to do it everywhere all at once?

With blueprints, the *consumer* of the component chooses the \`tag\`, reducing the
chance of name-collision. (You can consume the same blueprint multiple times,
giving each one its own tag.)

To address these issues, \`tosijs\` provides a \`<tosi-loader>\` loader component and
a function \`makeComponent\` that can define a component given a blueprint
function.

## \`<tosi-loader>\`—the blueprint loader

\`<tosi-loader>\` is a simple custom-element provided by \`tosijs\` for the dynamic loading
of component **blueprints**. It will load its \`<tosi-blueprint>\`s in parallel.

\`\`\`
<tosi-loader>
  <tosi-blueprint tag="swiss-clock" src="https://loewald.com/lib/swiss-clock"></tosi-blueprint>
</tosi-loader>
<swiss-clock>
  <code style="color: var(--brand-color)">tosijs</code> rules!
</swiss-clock>
\`\`\`

> The legacy names \`<xin-blueprint>\` and \`<xin-loader>\` still work but emit a
> one-time deprecation warning. New code should use \`<tosi-blueprint>\` and
> \`<tosi-loader>\`.

### \`<tosi-blueprint>\` Attributes

- \`src\` is the url of the \`blueprint\` javascript module (required)
- \`tag\` is the tagName you wish to use. This defaults to the name of the source file if suitable.
- \`property\` allows you to load a named exported property from a blueprint module
  (allowing one blueprint to export multiple blueprints). By default, it's \`default\`.
- \`loaded\` is the \`XinPackagedComponent\` after loading

#### \`<tosi-blueprint>\` Properties

- \`blueprintLoaded(package: XinPackagedComponent)\` \`<tosi-blueprint>\` when its blueprint is loaded.

#### \`<tosi-loader>\` Properties

- \`allLoaded()\` is called when all the blueprints have loaded.

## \`makeComponent(tag: string, blueprint: XinBlueprint): Promise<XinPackagedCompoent>\`

\`makeComponent\` takes a \`tag\` of your choice and a \`blueprint\` and generates
the custom-element's \`class\` and \`elementCreator\` as its \`type\` and \`creator\`
properties.

So, instead of:

    import {myThing} from './path/to/my-thing'

    document.body.append(myThing())

You could write:

    import { makeComponent } from 'tosijs'
    import myThingBlueprint from './path/to/my-thing-blueprint'

    makeComponent('different-tag', myThingBlueprint).then((packaged) => {
      document.body.append(packaged.creator())
    })

This is a more complex example that loads two components and only generates
the test component once everything is ready:

\`\`\`js
import { tosiLoader, tosiBlueprint } from 'tosijs'

let clockType = null

preview.append(
  tosiLoader(
    {
      allLoaded() {
        const xinTest = this.querySelector('[tag="xin-test"]').loaded.creator
        preview.append(
          xinTest({
            description: \`\${clockType.tagName} registered\`,
            test() {
              return (
                preview.querySelector(clockType.tagName) && preview.querySelector(clockType.tagName).constructor !==
                HTMLElement
              )
            },
          })
        )
      },
    },
    tosiBlueprint({
      tag: 'swiss-clock',
      src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
      blueprintLoaded({type, creator}) {
        clockType = type
        preview.append(creator())
      },
    }),
    tosiBlueprint({
      tag: 'xin-test',
      src: 'https://tonioloewald.github.io/xin-test/dist/blueprint.js',
    })
  )
)
\`\`\`

## \`XinBlueprint\`

    export interface XinFactory {
      Color: typeof Color
      Component: typeof Component
      elements: typeof elements
      svgElements: typeof svgElements
      mathML: typeof mathML
      vars: typeof vars
      varDefault: typeof varDefault
      xin: typeof xin
      boxed: typeof boxed
      xinProxy: typeof xinProxy
      boxedProxy: typeof boxedProxy // deprecated
      tosi: typeof tosi
      makeComponent: typeof makeComponent
      bind: typeof bind
      on: typeof on
      version: string
    }

    export interface XinPackagedComponent {
      type: typeof Component
      creator: ElementCreator
    }

    export type XinBlueprint = (
      tag: string,
      module: XinFactory
    ) => XinPackagedComponent

\`XinBlueprint\` lets you provide a component "blueprint", in the form of a function,
that can be loaded and turned into an actual component. The beauty of this is that
unlike an actual component, the blueprint has no special dependencies.

So instead of defining a component like this:

    import { Component, elements, vars, varDefault } from 'tosijs'

    const { h2, slot } = elements

    export class MyThing extends Component {
      static preferredTagName = 'my-thing'
      static shadowStyleSpec = {
        ':host': {
          color: varDefault.textColor('#222'),
          background: vars.bgColor,
        },
      }
      static lightStyleSpec = {
        _bgColor: '#f00'
      }

      content = () => [
        h2('my thing'),
        slot()
      ]
    }

    export const myThing = MyThing.elementCreator()

You can define a "blueprint" like this:

    import { XinBlueprint } from 'tosijs'

    const blueprint: XinBlueprint = (
      tag,
      { Component, elements, vars, varDefault }
    ) => {
      const {h2, slot} = elements

      class MyThing extends Component {
        static shadowStyleSpec = {
          ':host': {
            color: varDefault.textColor('#222'),
            background: vars.bgColor,
          },
        }

        content = () => [
          h2('my thing'),
          slot()
        ]
      }

      return {
        type: MyThing,
        lightStyleSpec: {
          _bgColor: '#f00'
        }
      }
    }

The blueprint function can be \`async\`, so you can use async import inside it to pull in dependencies.

> **Note** that in this example the blueprint is a *pure* function (i.e. it has no side-effects).
> If this blueprint is consumed twice, each will be completely independent. A non-pure blueprint
> could be implemented such that the different versions of the blueprint share information.
> E.g. you could maintain a list of all the instances of any version of the blueprint.`,title:"4.2 blueprints",filename:"blueprint-loader.ts",path:"src/blueprint-loader.ts"},{text:`# 4.3 makeComponent

\`makeComponent(tag: string, bluePrint: XinBlueprint<T>): Promise<XinComponentSpec<T>>\`
hydrates [blueprints](/?blueprint-loader.ts) into usable [web-components](./?component.ts).

Here are the relevant interfaces:

\`\`\`
export interface PartsMap<T = Element> {
  [key: string]: T
}

export type XinBlueprint<T = PartsMap> = (
  tag: string,
  module: XinFactory
) => XinComponentSpec<T> | Promise<XinComponentSpec<T>>

export interface XinComponentSpec<T = PartsMap> {
  type: Component<T>
  lightStyleSpec?: XinStyleSheet
  styleSpec?: XinStyleSheet // deprecated, use lightStyleSpec
}
\`\`\`

Note that a crucial benefit of blueprints is that the **consumer** of the blueprint gets
to choose the \`tagName\` of the custom-element.`,title:"4.3 makeComponent",filename:"make-component.ts",path:"src/make-component.ts"},{text:`# 5. css

\`tosijs\` provides a collection of utilities for working with CSS rules that
help leverage CSS variables to produce highly maintainable and lightweight
code that is nonetheless easy to customize.

The basic goal is to be able to implement some or all of our CSS very efficiently, compactly,
and reusably in Javascript because:

- Javascript quality tooling is really good, CSS quality tooling is terrible
- Having to write CSS in Javascript is *inevitable* so it might as well be consistent and painless
- It turns out you can get by with *much less* and generally *simpler* CSS this way
- You get some natural wins this way. E.g. writing two definitions of \`body {}\` is easy to do
  and bad in CSS. In Javascript it's simply an error!

The \`css\` module attempts to implement all this the simplest and most obvious way possible,
providing syntax sugar to help with best-practices such as \`css-variables\` and the use of
\`@media\` queries to drive consistency, themes, and accessibility.

## css(styleMap: XinStyleMap): string

A function that, given a \`XinStyleMap\` renders CSS code. What is a XinStyleMap?
It's kind of what you'd expect if you wanted to represent CSS as Javascript in
the most straightforward way possible. It allows for things like \`@import\`,
\`@keyframes\` and so forth, but knows just enough about CSS to help with things
like autocompletion of CSS rules (rendered as camelcase) so that, unlike me, it
can remind you that it's \`whiteSpace\` and not \`whitespace\`.

\`\`\`
import {elements, css} from 'tosijs'
const {style} = elements

const myStyleMap = {
  body: {
    color: 'red'
  },
  button: {
    borderRadius: 5
  }
}

document.head.append(style(css(myStyleMap)))
\`\`\`

There's a convenient \`Stylesheet()\` function that does all this and adds an id to the
resulting \`<style>\` element to make it easier to figure out where a given stylesheet
came from.

\`\`\`
Stylesheet('my-styles', {
  body: {
    color: 'red'
  },
  button: {
    borderRadius: 5
  }
})
\`\`\`

…inserts the following in the \`document.head\`:

\`\`\`
<style id="my-styles">
body {
  color: red;
}
button {
  border-radius: 5px;
}
</style>
\`\`\`

If a bare, non-zero **number** is assigned to a CSS property it will have 'px' suffixed
to it automatically. There are *no bare numeric*ele properties in CSS except \`0\`.

Why \`px\`? Well the other obvious options would be \`rem\` and \`em\` but \`px\` seems the
least surprising option.

\`css\` should render nested rules, such as \`@keyframes\` and \`@media\` correctly.

## Initializing CSS Variables

You can initialize CSS variables using \`_\` or \`__\` prefixes on property names.
One bar, turns the camelCase property-name into a --snake-case CSS variable
name, while two creates a default that can be overridden.

\`\`\`
StyleSheet('my-theme', {
  ':root', {
    _fooBar: 'red',
    __bazBar: '10px'
  }
})
\`\`\`

Will produce:

\`\`\`
<style id="my-theme">
  :root {
    --foo-bar: red;
    --baz-bar: var(--baz-bar-default, 10px);
  }
</style>
\`\`\`
\`\`\`js
import { elements, vars } from 'tosijs'
const { div } = elements

window.CSS.registerProperty({
  name: '--at-bar',
  syntax: '<color>',
  inherits: true,
  initialValue: 'green',
})

preview.append(
  div(
    {
      style: {
        _fooBar: 'red',
        __bazBar: 'blue',
      }
    },
    div(
      {
        style: { color: vars.fooBar },
      },
      'fooBar'
    ),
    div(
      {
        style: { color: vars.bazBar },
      },
      'bazBar'
    ),
    div(
      {
        style: { color: vars.atBar },
      },
      'atBar'
    ),
  )
)
\`\`\`

> ### @property and CSS.registerProperty() considered harmful
>
> This [new CSS feature}(https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
> is well-intentioned but ill-considered. I advise
> against using it yourself until its serious flaws are addressed. The problem
> is that if someone registers a variable you're using or you register
> a variable someone else is using then your CSS may be broken. And
> you can't re-register a variable either.

> This is a bit like the problem
> that tosijs Component works around with tagNames, but in practice far more
> difficult to solve. It is impossible to tell if a given instance of
> a given variable name is an intentional reuse or a new separate variable.
> No-one intentionally defines two different components with the same tag.

## invertLuminance({[key: string]: any}) => {[key: string]: string}

Given a map of CSS properties (in camelCase) emit a map of those properties that
has color values with their luminance inverted.

    const myStyleMap = {
      ':root': cssVars,                      // includes --font-size
      '@media (prefers-color-scheme: dark)': {
        ':root': invertLuminance(cssVars)    // omits --font-size
      },
    }

## vars

\`vars\` is a proxy object that will return a css variable string from
a camelCase property, e.g.

    vars.camelCase // 'var(--camel-case)'

> **it isn't called \`var\`** because that's a reserved word!

### varDefault

\`varDefault\` is a proxy object just like \`vars\` except that it returns a
\`function\` that takes a property and renders it as a css variable reference
with a default, e.g

    varDefault.borderColor('red') // \`var(--border-color, red)\`

## \`getCssVar(variable: string, atElement = document.body): string\`

\`getCssVar()\` obtains the css variable evaluated at the specified element
(an element defined at \`:root\` can be evaluated at \`document.body\`). You
can provide the name, e.g. \`--foo-bar\`, or "wrapped", e.g. \`var(--foo-bar)\`.

### Syntax Sugar for \`calc(...)\`

More importantly, \`vars\` allows you to conveniently perform calculations
on css (dimensional) variables by a percentage:

    vars.camelSize50    // 'calc(var(--camel-size) * 0.5)'
    vars.camelSize_50   // 'calc(var(--camel-size) * -0.5)'

### Computed Colors

> #### Notes
>
> \`color()\` and \`color-mix()\` are [now enjoy 91% support](https://caniuse.com/?search=color-mix) as of writing.
> See [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) documentation.
> Where they meet your needs, I'd suggest using them.
>
> [contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color) is coming in Safari 26,
> but [currently enjoys 0% upport](https://caniuse.com/?search=contrast-color).
>
> **Caution** although these look superficially like the \`vars\` syntax
> sugar for \`calc()\` performed on dimensional variables, they are in fact
> color calculations are performed on colors *evaluated* on \`document.body\` at
> execution time. (So they won'b automatically be recomputed on theme change.)

You can write:

\`\`\`
const styleSpec = {
  _lineHeight: 24,
  _spacing: 5,
  _buttonHeight: calc(\`vars.lineHeight + vars.spacing200\`)
)
\`\`\`

And then render this as CSS and stick it into a StyleNode and it will work.

You *cannot* write:

\`\`\`
const styleSpec = {
  _background: '#fafafa',
  _blockColor: vars.background_5b
}
\`\`\`

Because \`--background\` isn't defined on \`document.body\` yet, so vars.background_5b
won't be able to tell what \`--background\` is going to be yet. So either you need to
do this in two stags (create a StyleNode that defines the base color \`--background\`
then define the computed colors and add this) OR use a \`Color\` instance:

\`\`\`
const background = Color.fromCss('#fafafa')

initVars({
  background: background.toHTML,
  blockColor: background.brighten(-0.05).toHTML
})
\`\`\`

Until browsers support color calculations the way they support dimension arithmetic with \`calc()\`
this is the miserable existence we all lead. That, or defining huge arrays of color
values that we mostly don't use and are often not exactly what we want. You choose!

> **New** color now supports CSS [named colors](https://developer.mozilla.org/en-US/docs/Web/CSS/named-color),
such as \`black\`, \`red\`, and \`aliceblue\`.

\`vars\` also allows you to perform color calculations on css (color)
variables:

#### Change luminance with \`b\` (for brighten) suffix

The scale value is treated as a percentage and moves the brightness
that far from its current value to 100% (if positive) or 0% (if negattive).

    vars.textColor50b   // increases the luminance of textColor
    vars.textColor_50b  // halves the luminance of textColor

#### Change saturation with \`s\` suffix

The scale value is treated as a percentage and moves the saturation
that far from its current value to 100% (if positive) or 0% (if negattive).

    vars.textColor50s   // increases the saturation of textColor
    vars.textColor_50s  // halves the saturation of textColor

#### Rotate hue with \`h\` suffix

    vars.textColor30h   // rotates the hue of textColor by 30°
    vars.textColor_90h  // rotates the hue of textColor by -90°

#### Set Opacity with \`o\` suffix

Unlike the other modifiers, \`o\` simply sets the opacity of the
resulting color to the value provided.

    vars.textColor50o   // textColor with opacity set to 0.5

## More to follow?

The more I use the \`css\` module, the more I like it and the more ideas I have
to make it even better, but I have a very tight size/complexity target
for \`tosijs\` so these new ideas really have to earn a spot. Perhaps the
feature I have come closest to adding and then decided against was providing
syntax-sugar for classs so that:

    css({
      _foo: {
        color: 'red'
      }
    })

Would render:

    .foo {
      color: 'red'
    }

But looking at the code I and others have written, the case for this is weak as most class
declarations are not just bare classes. This doesn't help with declarations
for \`input.foo\` or \`.foo::after\` or \`.foo > *\` and now there'd be things that
look different which violates the "principle of least surprise". So, no.

### Something to Declare

Where I am always looking to improve this module (and all of \`tosijs\`) is to
do a better job of **declaring** things to improve autocomplete behavior and
minimize casting and other Typescript antipatterns. E.g. adding a ton of
declarations to \`elements\` and \`css\` has done wonders to reduce the need for
stuff like \`const nameElement = this.parts.nameField as unknown as HTMLInputElement\`
and prevent css property typos without adding a single byte to the size of
the javascript payload.

## onStylesheetChange(callback: () => void): () => void

Registers a callback that fires whenever any observant stylesheet regenerates
(i.e., when a proxy-backed \`StyleSheet\` detects a change and rewrites its CSS).
Returns an unsubscribe function.

    const unsub = onStylesheetChange(() => {
      console.log('a stylesheet was updated')
    })

    // later
    unsub()`,title:"5. css",filename:"css.ts",path:"src/css.ts"},{text:"# 5.1 color\n\n`tosijs` includes a lightweight, powerful `Color` class for manipulating colors.\nI hope at some point CSS will provide sufficiently capable native color calculations\nso that this will no longer be needed. Some of these methods have begun to appear,\nand are approaching wide implementation.\n\n## Color\n\nThe most straightforward methods for creating a `Color` instance are to use the\n`Color()` constructor to create an `rgb` or `rgba` representation, or using the\n`Color.fromCss()` to create a `Color` from any CSS (s)rgb representation,\ne.g.\n\n```\nnew Color(255, 255, 0)               // yellow\nnew Color(0, 128, 0, 0.5)            // translucent dark green\nColor.fromCss('#000')                // black\nColor.fromCss('hsl(90deg 100% 50%))  // orange\nColor.fromCss('color(srgb 1 0 0.5))  // purple\n```\n\nNote that `Color.fromCss()` is not compatible with non-srgb color spaces. The new CSS\ncolor functions produce color specifications of the form `color(<space> ....)` and\n`Color.fromCSS()` will handle `color(srgb ...)` correctly (this is so it can parse the\noutput of `color-mix(in hsl ...)` but not other [color spaces](https://developer.mozilla.org/en-US/blog/css-color-module-level-4/#whats_new_in_css_colors_module_level_4).\n\n## Manipulating Colors\n\n```js\nimport { elements, Color } from 'tosijs'\n\nconst { label, span, div, input, button } = elements\n\nconst swatches = div({ class: 'swatches' })\nfunction makeSwatch(text) {\n  const color = Color.fromCss(colorInput.value)\n  const adjustedColor = eval('color.' + text)\n  swatches.style.setProperty('--original', color)\n  swatches.append(\n    div(\n      text,\n      {\n        class: 'swatch',\n        title: `${adjustedColor.html} ${adjustedColor.hsla}`,\n        style: {\n          _adjusted: adjustedColor,\n          _text: adjustedColor.contrasting()\n        }\n      }\n    )\n  )\n}\n\nconst colorInput = input({\n  type: 'color',\n  value: '#000',\n  onInput: update\n})\nconst red = Color.fromCss('#f00')\nconst gray = Color.fromCss('#888')\nconst teal = Color.fromCss('teal')\nconst aliceblue = Color.fromCss('aliceblue')\n\nfunction update() {\n  swatches.textContent = ''\n  makeSwatch('brighten(-0.5)')\n  makeSwatch('brighten(0.5)')\n  makeSwatch('saturate(0.25)')\n  makeSwatch('saturate(0.5)')\n  makeSwatch('desaturate(0.5)')\n  makeSwatch('desaturate(0.75)')\n  makeSwatch('contrasting()')\n  makeSwatch('contrasting(0.05)')\n  makeSwatch('contrasting(0.25)')\n  makeSwatch('contrasting(0.45)')\n  makeSwatch('inverseLuminance')\n  makeSwatch('mono')\n  makeSwatch('rotate(-330)')\n  makeSwatch('rotate(60)')\n  makeSwatch('rotate(-270)')\n  makeSwatch('rotate(120)')\n  makeSwatch('rotate(-210)')\n  makeSwatch('rotate(180)')\n  makeSwatch('rotate(-150)')\n  makeSwatch('rotate(240)')\n  makeSwatch('rotate(-90)')\n  makeSwatch('rotate(300)')\n  makeSwatch('rotate(-30)')\n  makeSwatch('opacity(0.1)')\n  makeSwatch('opacity(0.5)')\n  makeSwatch('opacity(0.75)')\n  makeSwatch('rotate(-90).opacity(0.75)')\n  makeSwatch('brighten(0.5).desaturate(0.5)')\n  makeSwatch('blend(Color.black, 0.5)')\n  makeSwatch('mix(Color.white, 0.4)')\n  makeSwatch('blend(gray, 0.4)')\n  makeSwatch('mix(red, 0.25)')\n  makeSwatch('mix(red, 0.5)')\n  makeSwatch('mix(red, 0.75)')\n  makeSwatch('mix(teal, 0.25)')\n  makeSwatch('mix(teal, 0.5)')\n  makeSwatch('mix(teal, 0.75)')\n  makeSwatch('colorMix(aliceblue, 0.25)')\n  makeSwatch('colorMix(aliceblue, 0.5)')\n  makeSwatch('colorMix(aliceblue, 0.75)')\n}\n\nfunction randomColor() {\n  colorInput.value = Color.fromHsl(Math.random() * 360, Math.random(), Math.random() * 0.5 + 0.25)\n  update()\n}\n\nrandomColor()\n\npreview.append(\n  label(\n    span('base color'),\n    colorInput\n  ),\n  button(\n    'Random(ish) Color',\n    {\n      onClick: randomColor\n    }\n  ),\n  swatches\n)\n```\n```css\n.preview .swatches {\n  display: flex;\n  gap: 4px;\n  padding: 4px;\n  flex-wrap: wrap;\n  font-size: 80%;\n}\n.preview .swatch {\n  display: inline-block;\n  padding: 2px 6px;\n  color: var(--text);\n  background: var(--adjusted);\n  border: 2px solid var(--original);\n}\n```\n\nEach of these methods creates a new color instance based on the existing color(s).\n\nIn each case `amount` is from 0 to 1, and `degrees` is an angle in degrees.\n\n- `brighten(amount: number)`\n- `darken(amount: number)`\n- `saturate(amount: number)`\n- `desaturate(amount: number)`\n- `rotate(angle: number)`\n- `opacity(amount: number)` — this just creates a color with that opacity (it doesn't adjust it)\n- `mix(otherColor: Color, amount)` — produces a mix of the two colors in HSL-space\n- `colorMix(otherColor: Color, amount)` — uses `color-mix(in hsl...)` to blend the colors\n- `blend(otherColor: Color, amount)` — produces a blend of the two colors in RGB-space (usually icky)\n- `contrasting(amount = 1)` — produces a **contrasting color** by blending the color with black (if its\n  `brightness` is > 0.5) or white by `amount`. The new color will always have opacity 1.\n  `contrasting()` produce nearly identical results to `contrast-color()`.\n\n> **Note** the captions in the example above are colored using `contrasting()` and thus\n> should always be readable. In general, a base color will produce the worst results when\n> its `brightness` is around 0.5, much as is the case with the new and experimental CSS\n> [contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color)\n> function.\n>\n> **Also note** that highly translucent colors might produce disappointing `.contrasting()`\n> results since it's the blended color you need to worry about.\n\nWhere-ever possible, unless otherwise indicated, all of these operations are performed in HSL-space.\nHSL space is not great! For example, `desaturate` essentially blends you with medium gray (`#888`)\nrather than a BT.601 `brightness` value where \"yellow\" is really bright and \"blue\" is really dark.\n\nIf you want to desaturate colors more nicely, you can try blending them with their own `mono`.\n\n## Static Methods\n\nThese are alternatives to the standard `Color(r, g, b, a = 1)` constructor.\n\n`Color.fromVar(cssVariableName: string, element = document.body): Color` evaluates\nthe color at the specified element and then returns a `Color` instance with that\nvalue. It will accept both bare variable names (`--foo-bar`) and wrapped (`var(--foo-bar)`).\n\n`Color.fromCss(cssColor: string): Color` produces a `Color` instance from any\ncss color definition the browser can handle.\n\n`Color.fromHsl(h: number, s: number, l: number, a = 1)` produces a `Color`\ninstance from HSL/HSLA values. The HSL values are cached internally and\nused for internal calculations to reduce precision problems that occur\nwhen converting HSL to RGB and back. It's nowhere near as sophisticated as\nthe models used by (say) Adobe or Apple, but it's less bad than doing all\ncomputations in rgb.\n\n## Static Properties\n\n- `black`, `white` — handy constants\n\n## Properties\n\n- `r`, `g`, `b` are numbers from 0 to 255.\n- `a` is a number from 0 to 1\n\n## Properties (read-only)\n\n- `html` — the color in HTML `#rrggbb[aa]` format\n- `inverse` — the photonegative of the color (light is dark, orange is blue)\n- `opaque` - the color, but guaranteed opaque\n- `inverseLuminance` — inverts luminance but keeps hue, great for \"dark mode\"\n- `rgb` and `rgba` — the color in `rgb(...)` and `rgba(...)` formats.\n- `hsl` and `hsla` — the color in `hsl(...)` and `hsla(...)` formats.\n- `RGBA` and `ARGB` — return the values as arrays of numbers from 0 to 1 for use with\n  [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) (for example).\n- `brightness` — this is the brightness of the color based on [BT.601](https://www.itu.int/rec/R-REC-BT.601)\n- `mono` — this produces a `Color` instance that a greyscale version (based on `brightness`)\n\n## Utilities\n\n- `swatch()` emits the color into the console with a swatch and returns the color for chaining.\n- `toString()` emits the `html` property",title:"5.1 color",filename:"color.ts",path:"src/color.ts"},{text:"# A.1 more-math\n\nSome simple functions egregiously missing from the Javascript `Math`\nobject. They are exported from `tosijs` as the `MoreMath` object.\n\n## Functions\n\n`clamp(min, v, max)` will return `v` if it's between `min` and `max`\nand the `min` or `max` otherwise.\n\nIf min > max, the function will return NaN.\n\n```\nclamp(0, 0.5, 1)        // produces 0.5\nclamp(0, -0.5, 1)       // produces 0\nclamp(-50, 75, 50)      // produces 50\n```\n\n`lerp(a, b, t, clamped = true)` will interpolate linearly between `a` and `b` using\nparameter `t`. `t` will be clamped to the interval `[0, 1]`, so\n`lerp` will be clamped *between* a and b unless you pass `false` as the\noptional fourth parameter (allowing `lerp()` to extrapolate).\n\n```\nlerp(0, 10, 0.5)        // produces 5\nlerp(0, 10, 2)          // produces 10\nlerp(0, 10, 2, false)   // produces 20\nlerp(5, -5, 0.75)       // produces -2.5\n```\n\n## Constants\n\n`RADIANS_TO_DEGREES` and `DEGREES_TO_RADIANS` are values to multiply\nan angle by to convert between degrees and radians.",title:"A.1 more-math",filename:"more-math.ts",path:"src/more-math.ts"},{text:`# A.2 throttle & debounce

Usage:

\`\`\`
const debouncedFunc = debounce(func, 250)
const throttledFunc = debounce(func, 250)
\`\`\`

\`throttle(voidFunc, interval)\` and \`debounce(voidFunc, interval)\` are utility functions for
producing functions that filter out unnecessary repeated calls to a function, typically
in response to rapid user input, e.g. from keystrokes or pointer movement.

\`\`\`js
import { throttle, debounce, on } from 'tosijs'

function follow( element ) {
  return ( event ) => {
    element.style.top = event.offsetY + 'px'
    element.style.left = event.offsetX + 'px'
  }
}
on(preview, 'mousemove', follow(preview.querySelector('#unfiltered')))
on(preview, 'mousemove', throttle(follow(preview.querySelector('#throttle'))))
on(preview, 'mousemove', debounce(follow(preview.querySelector('#debounce'))))
\`\`\`
\`\`\`html
<h3>Throttle & Debounce in Action</h3>
<p>Move your mouse around in here…</p>
<p style="color: blue">follow function — triggers immediately</p>
<p style="color: red">throttled follow function — triggers every 250ms</p>
<p style="color: green">debounced follow function — stop moving for 250ms to trigger it</p>
<div id="unfiltered" class="follower" style="height: 20px; width: 20px; border-color: blue"></div>
<div id="throttle" class="follower" style="height: 40px; width: 40px; border-color: red"></div>
<div id="debounce" class="follower" style="height: 60px; width: 60px; border-color: green"></div>
\`\`\`
\`\`\`css
.preview * {
  pointer-events: none;
}
.preview .follower {
  top: 100px;
  left: 400px;
  position: absolute;
  border-width: 4px;
  border-style: solid;
  background: transparent;
  transform: translateX(-50%) translateY(-50%);
}
\`\`\`

The usual purpose of these functions is to prevent over-calling of a function based on
rapidly changing data, such as keyboard event or scroll event handling.

\`debounce\`ed functions will only actually be called \`interval\` ms after the last time the
wrapper is called.

E.g. if the user types into a search field, you can call a \`debounce\`ed
function to do the query, and it won't fire until the user stops typing for \`interval\` ms.

\`throttle\`ed functions will only called at most every \`interval\` ms.

E.g. if the user types into a search field, you can call a \`throttle\`ed function
every \`interval\` ms, including one last time after the last time the wrapper is called.

> In particular, both throttle and debounce are guaranteed to execute the
> wrapped function after the last call to the wrapper.

Note that parameters will be passed to the wrapped function, and that *the last call always goes through*.
However, parameters passed to skipped calls will *never* reach the wrapped function.`,title:"A.2 throttle & debounce",filename:"throttle.ts",path:"src/throttle.ts"},{text:"# A.3 hotReload\n\n`hotReload()` persists any root-level paths in `xin` that its test function evaluates as true\nto `localStorage`.\n\n```\nhotReload(test: PathTestFunction = () => true): void\n```",title:"A.3 hotReload",filename:"hot-reload.ts",path:"src/hot-reload.ts"},{text:`# A.4 share

\`share()\` synchronizes state across browser tabs and windows. Pass it
boxed proxies from \`tosi()\` and those paths will be kept in sync via
\`BroadcastChannel\` and persisted to \`IndexedDB\`.

\`\`\`
import { tosi, share } from 'tosijs'

const { app } = tosi({
  app: { user: null, settings: { theme: 'light' } }
})

const { restored } = await share(app.user, app.settings)

if (restored.includes(app.user)) {
  // another tab was already running — we inherited its state
}
\`\`\`

The first tab to call \`share()\` seeds the store. Subsequent tabs
inherit that data, overwriting their \`tosi()\` defaults. After setup,
changes in any tab propagate to all others in real-time.

## What to share

Share **small, session-level state**: user identity, preferences,
auth tokens, UI mode, active selections, cache-invalidation keys.

Don't share large datasets directly. Instead, share query metadata
(URLs, cache keys, timestamps) and let each tab fetch or cache the
data independently. This keeps the sync layer fast and avoids
hitting \`BroadcastChannel\` or \`IndexedDB\` with multi-megabyte writes.

## How it works

- Changes are sent as **deltas** via \`BroadcastChannel\` — only the
  changed path and its value are transmitted, not the entire root
  object.
- **Persistence** uses \`IndexedDB\` (async, no size limit). Full
  root-path snapshots are written on a debounced schedule for
  cold-start recovery.

## API

    share(...proxiesOrPaths: (BoxedProxy | string)[]): Promise<{ restored: (BoxedProxy | string)[] }>

- Accepts boxed proxies (from \`tosi()\`) or string paths
- Returns \`{ restored }\` — the subset of arguments whose values were
  overwritten from pre-existing stored data
- Idempotent: sharing the same path twice is a no-op
- Throws if an argument is neither a proxy nor a string

To clear shared state (e.g. on logout), set the values to their
empty/default state. The change will propagate to all tabs and
persist.

## Live Demo

Drag the squares around, then click **New Window** to open a second
copy. Drag in either window and watch the other update in real-time.

\`\`\`html
<div class="draggable" data-key="red"></div>
<div class="draggable" data-key="green"></div>
<div class="draggable" data-key="blue"></div>
<button class="spawn">New Window</button>
\`\`\`
\`\`\`css
.preview {
  touch-action: none;
  min-height: 200px;
}

.draggable {
  position: absolute;
  width: 50px;
  height: 50px;
  cursor: move;
  border-radius: 6px;
}

.draggable[data-key="red"]   { background: #f008; }
.draggable[data-key="green"] { background: #0f08; }
.draggable[data-key="blue"]  { background: #00f8; }

.spawn {
  position: absolute;
  bottom: 8px;
  right: 8px;
}
\`\`\`
\`\`\`js
import { tosi, share, xin } from 'tosijs'
import { trackDrag } from 'tosijs-ui'

const { squares } = tosi({
  squares: {
    red:   { x: 20,  y: 20 },
    green: { x: 120, y: 20 },
    blue:  { x: 220, y: 20 },
  }
})

await share(squares)

const draggables = [...preview.querySelectorAll('.draggable')]

function render() {
  for (const el of draggables) {
    const key = el.dataset.key
    el.style.left = xin.squares[key].x + 'px'
    el.style.top = xin.squares[key].y + 'px'
  }
}

render()
squares.observe(render)

function dragItem(event) {
  const el = event.target.closest('.draggable')
  if (!el) return
  const key = el.dataset.key
  const start = { ...xin.squares[key] }
  trackDrag(event, (dx, dy, event) => {
    xin.squares[key] = { x: start.x + dx, y: start.y + dy }
    render()
    return event.type === 'mouseup'
  })
}

preview.addEventListener('mousedown', dragItem)
preview.addEventListener('touchstart', dragItem, { passive: true })

preview.querySelector('.spawn').addEventListener('click', () => {
  window.open(location.href)
})
\`\`\``,title:"A.4 share",filename:"share.ts",path:"src/share.ts"},{text:`# A.4 Working with React

A lot of developers are going to be using React. Is \`tosijs\` relevant to React developers?

Absolutely!

- [react-tosijs](https://react.tosijs.net) provides \`useTosi()\` to create hooks that
  connect any data into a React component.
- [react-tosijs](https://react.tosijs.net) provides the \`reactWebComponents\` proxy
  that turn any web-component into a React functional component.
`,title:"A.4 Working with React",filename:"React.md",path:"React.md"},{text:`# A.5 sync

\`sync()\` synchronizes state across the network in real-time. Pass it a
transport, options, and boxed proxies from \`tosi()\` — local changes are
throttled and sent as batched deltas, and inbound messages from other
clients are applied to the local state automatically.

\`\`\`
import { tosi, sync } from 'tosijs'

const { game } = tosi({
  game: { players: {}, ball: { x: 0, y: 0 } }
})

const ws = new WebSocket('wss://my-server.example/sync')

const { disconnect } = await sync(
  websocketTransport(ws),
  { throttleInterval: 50 },
  game
)

// Later, to disconnect:
disconnect()
\`\`\`

## Transport interface

\`sync()\` is transport-agnostic. You provide an object that satisfies
\`SyncTransport\`:

    interface SyncTransport {
      send(messages: SyncMessage[]): void
      onReceive(handler: (messages: SyncMessage[]) => void): void
      connect(): Promise<void> | void
      disconnect(): void
    }

    interface SyncMessage {
      path: string
      value: any
    }

Messages are **batched** — \`send()\` receives an array of accumulated
deltas flushed at the throttle interval, and \`onReceive()\` delivers
batches from the server.

## WebSocket transport helper

\`\`\`
function websocketTransport(ws) {
  let handler = null
  let pingInterval = null

  return {
    connect() {
      return new Promise((resolve, reject) => {
        if (ws.readyState === WebSocket.OPEN) return resolve()
        ws.addEventListener('open', () => resolve(), { once: true })
        ws.addEventListener('error', reject, { once: true })
      })
    },
    send(messages) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(messages))
      }
    },
    onReceive(h) {
      handler = h
      ws.addEventListener('message', (event) => {
        handler(JSON.parse(event.data))
      })
      // Keep alive: send empty batch periodically so the server
      // knows we're still here (see idleTimeout in sync-server.ts)
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('[]')
      }, 15000)
    },
    disconnect() {
      clearInterval(pingInterval)
      ws.close()
    },
  }
}
\`\`\`

## Firebase Realtime Database transport

For Firebase, implement \`SyncTransport\` using \`onValue\` for inbound
and \`update\` for outbound. This is a sketch — adapt to your data model:

\`\`\`
import { ref, onValue, update } from 'firebase/database'

function firebaseTransport(db, rootPath) {
  let handler = null
  let unsubscribe = null

  return {
    connect() {
      const dbRef = ref(db, rootPath)
      unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val()
        if (data && handler) {
          // Convert Firebase snapshot to SyncMessage[]
          const messages = Object.entries(data).map(
            ([path, value]) => ({ path, value })
          )
          handler(messages)
        }
      })
    },
    send(messages) {
      const updates = {}
      for (const msg of messages) {
        updates[\`\${rootPath}/\${msg.path}\`] = msg.value
      }
      update(ref(db), updates)
    },
    onReceive(h) { handler = h },
    disconnect() { if (unsubscribe) unsubscribe() },
  }
}
\`\`\`

## Server architecture

The transport carries \`SyncMessage[]\` arrays. The **server** decides:

- **Broadcasting**: relay deltas to other connected clients
- **Persistence**: store state for snapshot-on-connect
- **Conflict resolution**: last-write-wins, server timestamps, or
  custom logic — \`sync()\` is conflict-agnostic

For most realistic applications, use a custom socket server as the
single source of truth. See \`examples/sync-server.ts\` for a minimal
Bun WebSocket relay server.

## API

    sync(
      transport: SyncTransport,
      options: SyncOptions,
      ...proxies: (BoxedProxy | string)[]
    ): Promise<{ disconnect: () => void }>

**SyncOptions:**

- \`throttleInterval\` — outbound batch interval in ms (default: 100)

The returned \`disconnect()\` removes all observers and calls
\`transport.disconnect()\`.`,title:"A.5 sync",filename:"sync.ts",path:"src/sync.ts"},{text:'# Migrating from `xinjs` to `tosijs`\n\n<!--{ "pin": "bottom" }-->\n\nIn a nutshell:\n\n1. Update to `xinjs` (and `xinjs-ui`) 1.0.6\n2. Fix any issues\n3. Replace all references to "xinjs" with "tosijs"\n\n`xinjs` and `tosijs` 1.0.6 should be identical (likewise `xinjs-ui` and `tosijs-ui`), so the only thing you need to change\nshould be the module names.\n\n> Please [let me know](https://discord.gg/ramJ9rgky5) if there are any issues.\n',title:"Migrating from xinjs to tosijs",filename:"Migration.md",path:"Migration.md",pin:"bottom"}];Gl();var $n="tosijs";setTimeout(()=>{let n=v.fromVar(d.brandColor),e=v.fromVar(d.background);console.log(`welcome to %c${$n}`,`background: ${n.html}; color: ${e.html}; padding: 0 5px;`)},100);var Hh=document.location.search!==""?document.location.search.substring(1).split("&")[0]:"README.md",Zh=yi.find((n)=>n.filename===Hh)||yi[0],Yl=rt(),{app:G,prefs:J}=H({app:{title:$n,blogUrl:"https://loewald.com",discordUrl:"https://discord.com/invite/ramJ9rgky5",githubUrl:`https://github.com/tonioloewald/${$n}#readme`,npmUrl:`https://www.npmjs.com/package/${$n}`,tosijsuiUrl:"https://ui.tosijs.net",bundleBadgeUrl:`https://deno.bundlejs.com/?q=${$n}&badge=`,bundleUrl:`https://bundlejs.com/?q=${$n}`,cdnBadgeUrl:`https://data.jsdelivr.com/v1/package/npm/${$n}/badge`,cdnUrl:`https://www.jsdelivr.com/package/npm/${$n}`,optimizeLottie:!1,lottieFilename:"",lottieData:"",docs:yi,currentDoc:Zh,compact:!1},prefs:{colorScheme:Yl.colorScheme,highContrast:Yl.highContrast,locale:""}});Ji((n)=>{if(n.startsWith("prefs"))return!0;return!1});sn.docLink={toDOM(n,e){n.setAttribute("href",`?${e}`)}};sn.current={toDOM(n,e){let t=n.getAttribute("href")||"";n.classList.toggle("current",e===t.substring(1))}};setTimeout(()=>{Object.assign(globalThis,{app:G,tosi:H,img:gi,bindings:sn,elements:x,vars:d,touch:E,Color:v})},1000);var Kl=document.querySelector("main"),{h2:Mh,div:Ql,span:dt,a:mi,img:gi,header:Jh,button:$l,template:Lh,input:Eh}=x;J.colorScheme.observe(()=>{ms({colorScheme:J.colorScheme.value})});J.highContrast.observe(()=>{ms({highContrast:J.highContrast.value})});window.addEventListener("popstate",()=>{let n=window.location.search.substring(1);G.currentDoc=G.docs.find((e)=>e.filename===n)||G.docs[0]});var nc=Jn(()=>{console.time("filter");let n=Hl.value.toLocaleLowerCase();G.docs.forEach((e)=>{e.hidden=!e.title.toLocaleLowerCase().includes(n)&&!e.text.toLocaleLowerCase().includes(n)}),E(G.docs),console.timeEnd("filter")}),Hl=Eh({slot:"nav",placeholder:"search",type:"search",style:{width:"calc(100% - 10px)",margin:"5px"},onInput:nc});if(Kl)Kl.append(Jh($l({class:"iconic",style:{color:d.linkColor},title:"navigation",bind:{value:G.compact,binding:{toDOM(n,e){n.style.display=e?"":"none",n.nextSibling.style.display=e?"":"none"}}},onClick(){let n=document.querySelector(ii.tagName);n.contentVisible=!n.contentVisible}},m.menu()),dt({style:{flex:"0 0 10px"}}),mi({href:"/",style:{display:"flex",alignItems:"center",borderBottom:"none"},title:`tosijs ${Ct}, tosijs-ui ${pi}`},gi({src:"favicon.svg",style:{height:40,marginRight:10}}),Mh({bindText:"app.title"})),dt({class:"elastic"}),as({minWidth:750},dt({style:{marginRight:d.spacing,display:"flex",alignItems:"center",gap:d.spacing50}},mi({href:G.bundleUrl},gi({alt:"bundlejs size badge",src:G.bundleBadgeUrl})),mi({href:G.cdnUrl},gi({alt:"jsdelivr",src:G.cdnBadgeUrl}))),dt({slot:"small"})),dt({style:{flex:"0 0 10px"}}),$l({title:"theme",class:"iconic",onClick(n){X({target:n.target.closest("button"),menuItems:[{icon:"github",caption:"github",action:G.githubUrl.value},{icon:"npm",caption:"npm",action:G.npmUrl.value},{icon:"discord",caption:"discord",action:G.discordUrl.value},{icon:"tosiUi",caption:"tosijs-ui",action:G.tosijsuiUrl.value},{icon:"blog",caption:"Blog",action:"https://loewald.com"},null,{icon:"rgb",caption:"Color Theme",menuItems:[{caption:"System",checked(){return J.colorScheme.value==="system"},action(){J.colorScheme.value="system"}},{caption:"Dark",checked(){return J.colorScheme.value==="dark"},action(){J.colorScheme.value="dark"}},{caption:"Light",checked(){return J.colorScheme.value==="light"},action(){J.colorScheme.value="light"}},null,{caption:"High Contrast (System)",checked(){return J.highContrast.value==="system"},action(){J.highContrast.value="system"}},{caption:"High Contrast On",checked(){return J.highContrast.value===!0},action(){J.highContrast.value=!0}},{caption:"High Contrast Off",checked(){return J.highContrast.value===!1},action(){J.highContrast.value=!1}}]}]})}},m.moreVertical())),Go({name:"Documentation",navSize:200,minSize:600,style:{flex:"1 1 auto",overflow:"hidden"},onChange(){let n=document.querySelector(ii.tagName);G.compact.value=n.compact}},Hl,Ql({slot:"nav",style:{display:"flex",flexDirection:"column",width:"100%",height:"100%",overflowY:"scroll"},bindList:{hiddenProp:"hidden",value:G.docs}},Lh(mi({class:"doc-link",bindCurrent:"app.currentDoc.filename",bindDocLink:"^.filename",bindText:"^.title",onClick(n){let e=n.target.closest("a");if(!e)return;let t=mn(n.target),i=n.target.closest("xin-sidenav");i.contentVisible=!0;let{href:o}=e;window.history.pushState({href:o},"",o),G.currentDoc=t,n.preventDefault()}}))),Ql({style:{position:"relative",overflowY:"scroll",height:"100%"}},_o({style:{display:"block",maxWidth:"44em",margin:"auto",padding:"0 1em",overflow:"hidden"},bindValue:"app.currentDoc.text",didRender(){In.insertExamples(this,{tosijs:Fe,"tosijs-ui":hs})}}))));

//# debugId=95BD4ADA7642655A64756E2164756E21
//# sourceMappingURL=index.js.map
