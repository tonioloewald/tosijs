var Bs=Object.defineProperty;var Ia=(n,t)=>{for(var e in t)Bs(n,e,{get:t[e],enumerable:!0,configurable:!0,set:(a)=>t[e]=()=>a})};var lt=((n)=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(t,e)=>(typeof require<"u"?require:t)[e]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var $n={};Ia($n,{xinValue:()=>gn,xinProxy:()=>ho,xinPath:()=>Ms,xin:()=>M,warnDeprecated:()=>ft,version:()=>kt,vars:()=>d,varDefault:()=>p,updates:()=>Ls,unobserve:()=>cn,touchElement:()=>fe,touch:()=>bn,tosiValue:()=>z,tosiSetValue:()=>Ps,tosiPath:()=>nn,tosi:()=>U,throttle:()=>Fn,svgElements:()=>wt,settings:()=>ut,on:()=>Dn,observe:()=>xt,mathML:()=>ro,makeComponent:()=>ke,invertLuminance:()=>ue,initVars:()=>ni,hotReload:()=>we,getListItem:()=>yn,getListInstance:()=>ye,getListBinding:()=>ge,getCssVar:()=>to,elements:()=>m,deprecated:()=>he,deleteListItem:()=>pi,debounce:()=>vt,css:()=>Yn,boxedProxy:()=>xe,boxed:()=>yt,blueprintLoader:()=>wi,blueprint:()=>vi,bindings:()=>$,bind:()=>A,StyleSheet:()=>Gn,MoreMath:()=>$s,Component:()=>b,Color:()=>f,BlueprintLoader:()=>je,Blueprint:()=>jt});function hn(n){if(n==null||typeof n!=="object")return n;if(n instanceof Set)return new Set(n);else if(Array.isArray(n))return n.map(hn);let t={};for(let e in n){let a=n[e];if(n!=null&&typeof n==="object")t[e]=hn(a);else t[e]=a}return t}var Ua="-xin-data",Ln=`.${Ua}`,Fa="-xin-event",Ea=`.${Fa}`,q=Symbol.for("xin-path"),pn=Symbol.for("xin-value"),Ba="xinObserve",Pa="xinBind",Ma="xinOn",te=Symbol("list-binding"),ee=Symbol("list-instance"),La=new Set;function ft(n,t){if(!La.has(n))console.warn(t),La.add(n)}function he(n,t){let e=!1;return(...a)=>{if(!e)console.warn(t),e=!0;return n(...a)}}var nn=(n)=>{return n&&n[q]||void 0};function z(n){if(typeof n==="object"&&n!==null){let t=n[pn];return t!==void 0?t:n}return n}function Ps(n,t){if(nn(n)===void 0)throw Error("tosiSetValue requires a xin or boxed proxy");n[pn]=t}var Ms=he(nn,"xinPath is deprecated. Use tosiPath instead."),gn=he(z,"xinValue is deprecated. Use tosiValue instead."),qn=new WeakMap,mn=new WeakMap,Un=(n)=>{let t=n.cloneNode();if(t instanceof Element){let e=mn.get(n),a=qn.get(n);if(e!=null)mn.set(t,hn(e));if(a!=null)qn.set(t,hn(a))}for(let e of Array.from(n instanceof HTMLTemplateElement?n.content.childNodes:n.childNodes))if(e instanceof Element||e instanceof DocumentFragment)t.appendChild(Un(e));else t.appendChild(e.cloneNode());return t},ut={debug:!1,perf:!1},Da=Symbol("observer should be removed"),mt=[],bt=[],ae=!1,oe,se;class Ya{description;test;callback;constructor(n,t){let e=typeof t==="string"?`"${t}"`:`function ${t.name}`,a;if(typeof n==="string")this.test=(o)=>typeof o==="string"&&o!==""&&(n.startsWith(o)||o.startsWith(n)),a=`test = "${n}"`;else if(n instanceof RegExp)this.test=n.test.bind(n),a=`test = "${n.toString()}"`;else if(n instanceof Function)this.test=n,a=`test = function ${n.name}`;else throw Error("expect listener test to be a string, RegExp, or test function");if(this.description=`${a}, ${e}`,typeof t==="function")this.callback=t;else throw Error("expect callback to be a path or function");mt.push(this)}}var Ls=async()=>{if(oe===void 0)return;await oe},Ds=()=>{if(ut.perf)console.time("xin async update");let n=Array.from(bt);for(let t of n)mt.filter((e)=>{let a;try{a=e.test(t)}catch(o){throw Error(`Listener ${e.description} threw "${o}" at "${t}"`)}if(a===Da)return cn(e),!1;return a}).forEach((e)=>{let a;try{a=e.callback(t)}catch(o){console.error(`Listener ${e.description} threw "${o}" handling "${t}"`)}if(a===Da)cn(e)});if(bt.splice(0),ae=!1,typeof se==="function")se();if(ut.perf)console.timeEnd("xin async update")},bn=(n)=>{let t=typeof n==="string"?n:nn(n);if(t===void 0)throw console.error("touch was called on an invalid target",n),Error("touch was called on an invalid target");if(ae===!1)oe=new Promise((e)=>{se=e}),ae=setTimeout(Ds);if(bt.find((e)=>t.startsWith(e))==null)bt.push(t)},Pn=(n,t)=>{return new Ya(n,t)},cn=(n)=>{let t=mt.indexOf(n);if(t>-1)mt.splice(t,1);else throw Error("unobserve failed, listener not found")},gt={},ie=null,As=(n)=>{ie=n},pe=()=>{if(ie===null)throw Error("xin proxy not initialized");return ie},re=null,le=null,Os=(n,t)=>{re=n,le=t},dt=()=>{if(re===null)throw Error("bind not initialized");return re},ct=()=>{if(le===null)throw Error("on not initialized");return le},Ja=(n,t)=>{let e=new Event(t);n.dispatchEvent(e)},Ga=(n)=>{if(n instanceof HTMLInputElement)return n.type;else if(n instanceof HTMLSelectElement&&n.hasAttribute("multiple"))return"multi-select";else return"other"},zs=(n,t)=>{switch(Ga(n)){case"radio":n.checked=n.value===t;break;case"checkbox":n.checked=!!t;break;case"date":n.valueAsDate=new Date(t);break;case"multi-select":for(let e of Array.from(n.querySelectorAll("option")))e.selected=t[e.value];break;default:n.value=t}},_s=(n)=>{switch(Ga(n)){case"radio":{let t=n.parentElement?.querySelector(`[name="${n.name}"]:checked`);return t!=null?t.value:null}case"checkbox":return n.checked;case"date":return n.valueAsDate?.toISOString();case"multi-select":return Array.from(n.querySelectorAll("option")).reduce((t,e)=>{return t[e.value]=e.selected,t},{});default:return n.value}},{ResizeObserver:Aa}=globalThis,de=Aa!=null?new Aa((n)=>{for(let t of n){let e=t.target;Ja(e,"resize")}}):{observe(){},unobserve(){}},Oa=(n,t,e=!0)=>{if(n!=null&&t!=null)if(typeof t==="string")n.textContent=t;else if(Array.isArray(t))t.forEach((a)=>{n.append(a instanceof Node&&e?Un(a):a)});else if(t instanceof Node)n.append(e?Un(t):t);else throw Error("expect text content or document node")},vt=(n,t=250)=>{let e;return(...a)=>{if(e!==void 0)clearTimeout(e);e=setTimeout(()=>{n(...a)},t)}},Fn=(n,t=250)=>{let e,a=Date.now()-t,o=!1;return(...s)=>{if(clearTimeout(e),e=setTimeout(()=>{n(...s),a=Date.now()},t),!o&&Date.now()-a>=t){o=!0;try{n(...s),a=Date.now()}finally{o=!1}}}},Rs=(n)=>{try{return JSON.stringify(n)}catch(t){return"{has circular references}"}},$a=(...n)=>Error(n.map(Rs).join(" ")),Hs=()=>new Date(parseInt("1000000000",36)+Date.now()).valueOf().toString(36).slice(1),Ns=0,Vs=()=>(parseInt("10000",36)+ ++Ns).toString(36).slice(-5),Ws=()=>Hs()+Vs(),ce=Symbol("delete"),Ka=Symbol("new-object"),Kt=Symbol("automatic-index");function Za(n){if(n==="")return[];if(Array.isArray(n))return n;else{let t=[];while(n.length>0){let e=n.search(/\[[^\]]+\]/);if(e===-1){t.push(n.split("."));break}else{let a=n.slice(0,e);if(n=n.slice(e),a!=="")t.push(a.split("."));if(e=n.indexOf("]")+1,t.push(n.slice(1,e-1)),n.slice(e,e+1)===".")e+=1;n=n.slice(e)}}return t}}var G=new WeakMap;function Qa(n,t){if(G.get(n)===void 0)G.set(n,{});if(G.get(n)[t]===void 0)G.get(n)[t]={};let e=G.get(n)[t];if(t==="_auto_")n.forEach((a,o)=>{if(a[Kt]===void 0)a[Kt]=Ws();e[a[Kt]+""]=o});else n.forEach((a,o)=>{e[Mn(a,t)+""]=o});return e}function Xs(n,t){if(G.get(n)===void 0||G.get(n)[t]===void 0)return Qa(n,t);else return G.get(n)[t]}function qs(n,t,e){e=e+"";let a=Xs(n,t)[e];if(a===void 0||Mn(n[a],t)+""!==e)a=Qa(n,t)[e];return a}function Us(n,t,e){if(n[t]===void 0&&e!==void 0)n[t]=e;return n[t]}function no(n,t,e,a){let o=t!==""?qs(n,t,e):e;if(a===ce)return n.splice(o,1),G.delete(n),Symbol("deleted");else if(a===Ka){if(t===""&&n[o]===void 0)n[o]={}}else if(a!==void 0)if(o!==void 0)n[o]=a;else if(t!==""&&Mn(a,t)+""===e+"")n.push(a),o=n.length-1;else throw Error(`byIdPath insert failed at [${t}=${e}]`);return n[o]}function za(n){if(!Array.isArray(n))throw $a("setByPath failed: expected array, found",n)}function _a(n){if(n==null||!(n instanceof Object))throw $a("setByPath failed: expected Object, found",n)}function Mn(n,t){let e=Za(t),a=n,o,s,i,r;for(o=0,s=e.length;a!==void 0&&o<s;o++){let l=e[o];if(Array.isArray(l))for(i=0,r=l.length;a!==void 0&&i<r;i++){let c=l[i];a=a[c]}else if(a.length===0){if(a=a[Number(l.slice(1))],l[0]!=="=")return}else if(l.includes("=")){let[c,...h]=l.split("=");a=no(a,c,h.join("="))}else i=parseInt(l,10),a=a[i]}return a}function Fs(n,t,e){let a=n;if(t==="")throw Error("setByPath cannot be used to set the root object");let o=Za(t);while(a!=null&&o.length>0){let s=o.shift();if(typeof s==="string"){let i=s.indexOf("=");if(i>-1){if(i===0)_a(a);else za(a);let r=s.slice(0,i),l=s.slice(i+1);if(a=no(a,r,l,o.length>0?Ka:e),o.length===0)return!0}else{za(a);let r=parseInt(s,10);if(o.length>0)a=a[r];else{if(e!==ce){if(a[r]===e)return!1;a[r]=e}else a.splice(r,1);return!0}}}else if(Array.isArray(s)&&s.length>0){_a(a);while(s.length>0){let i=s.shift();if(s.length>0||o.length>0)a=Us(a,i,s.length>0?{}:[]);else{if(e!==ce){if(a[i]===e)return!1;a[i]=e}else{if(!Object.prototype.hasOwnProperty.call(a,i))return!1;delete a[i]}return!0}}}else throw Error(`setByPath failed, bad path ${t}`)}throw Error(`setByPath(${n}, ${t}, ${e}) failed`)}var $={value:{toDOM:zs,fromDOM(n){return _s(n)}},text:{toDOM(n,t){n.textContent=t}},enabled:{toDOM(n,t){n.disabled=!t}},disabled:{toDOM(n,t){n.disabled=Boolean(t)}},list:{toDOM(n,t,e){ge(n,t,e).update(t)}}};function Q(n){return n.replace(/[A-Z]/g,(t)=>{return`-${t.toLocaleLowerCase()}`})}function Ys(n){return n.replace(/-([a-z])/g,(t,e)=>{return e.toLocaleUpperCase()})}var Js=180/Math.PI,Gs=Math.PI/180;function X(n,t,e){return e<n?NaN:t<n?n:t>e?e:t}function Z(n,t,e,a=!0){if(a)e=X(0,e,1);return e*(t-n)+n}var $s={RADIANS_TO_DEGREES:Js,DEGREES_TO_RADIANS:Gs,clamp:X,lerp:Z};function to(n,t=document.body){let e=getComputedStyle(t);if(n.endsWith(")")&&n.startsWith("var("))n=n.slice(4,-1);return e.getPropertyValue(n).trim()}var Ks=(n,t,e)=>{return(0.299*n+0.587*t+0.114*e)/255},rn=(n)=>("00"+Math.round(Number(n)).toString(16)).slice(-2);class eo{h;s;l;constructor(n,t,e){n/=255,t/=255,e/=255;let a=Math.max(n,t,e),o=a-Math.min(n,t,e),s=o!==0?a===n?(t-e)/o:a===t?2+(e-n)/o:4+(n-t)/o:0;this.h=60*s<0?60*s+360:60*s,this.s=o!==0?a<=0.5?o/(2*a-o):o/(2-(2*a-o)):0,this.l=(2*a-o)/2}}var Bn=globalThis.document!==void 0?globalThis.document.createElement("span"):void 0;class f{r;g;b;a;static fromVar(n,t=document.body){return f.fromCss(to(n,t))}static fromCss(n){let t=n;if(Bn instanceof HTMLSpanElement)Bn.style.color="black",Bn.style.color=n,document.body.appendChild(Bn),t=getComputedStyle(Bn).color,Bn.remove();let[e,a,o,s]=t.match(/[\d.]+/g)||["0","0","0","0"],i=t.startsWith("color(srgb")?255:1;return new f(Number(e)*i,Number(a)*i,Number(o)*i,s==null?1:Number(s))}static fromHsl(n,t,e,a=1){let o,s,i;if(t===0)o=s=i=e;else{let l=(g,w,v)=>{if(v<0)v+=1;if(v>1)v-=1;if(v<0.16666666666666666)return g+(w-g)*6*v;if(v<0.5)return w;if(v<0.6666666666666666)return g+(w-g)*(0.6666666666666666-v)*6;return g},c=e<0.5?e*(1+t):e+t-e*t,h=2*e-c,u=(n%360+360)%360/360;o=l(h,c,u+0.3333333333333333),s=l(h,c,u),i=l(h,c,u-0.3333333333333333)}let r=new f(o*255,s*255,i*255,a);return r.hslCached={h:(n%360+360)%360,s:t,l:e},r}static black=new f(0,0,0);static white=new f(255,255,255);constructor(n,t,e,a=1){this.r=X(0,n,255),this.g=X(0,t,255),this.b=X(0,e,255),this.a=X(0,a,1)}get inverse(){return new f(255-this.r,255-this.g,255-this.b,this.a)}get inverseLuminance(){let{h:n,s:t,l:e}=this._hsl;return f.fromHsl(n,t,1-e,this.a)}get opaque(){return this.a===1?this:new f(this.r,this.g,this.b,1)}contrasting(n=1){return this.opaque.blend(this.brightness>0.5?f.black:f.white,n)}get rgb(){let{r:n,g:t,b:e}=this;return`rgb(${n.toFixed(0)},${t.toFixed(0)},${e.toFixed(0)})`}get rgba(){let{r:n,g:t,b:e,a}=this;return`rgba(${n.toFixed(0)},${t.toFixed(0)},${e.toFixed(0)},${a.toFixed(2)})`}get RGBA(){return[this.r/255,this.g/255,this.b/255,this.a]}get ARGB(){return[this.a,this.r/255,this.g/255,this.b/255]}hslCached;get _hsl(){if(this.hslCached==null)this.hslCached=new eo(this.r,this.g,this.b);return this.hslCached}get hsl(){let{h:n,s:t,l:e}=this._hsl;return`hsl(${n.toFixed(0)}deg ${(t*100).toFixed(0)}% ${(e*100).toFixed(0)}%)`}get hsla(){let{h:n,s:t,l:e}=this._hsl;return`hsl(${n.toFixed(0)}deg ${(t*100).toFixed(0)}% ${(e*100).toFixed(0)}% / ${(this.a*100).toFixed(0)}%)`}get mono(){let n=this.brightness*255;return new f(n,n,n)}get brightness(){return Ks(this.r,this.g,this.b)}get html(){return this.toString()}toString(){return this.a===1?"#"+rn(this.r)+rn(this.g)+rn(this.b):"#"+rn(this.r)+rn(this.g)+rn(this.b)+rn(Math.floor(255*this.a))}brighten(n){let{h:t,s:e,l:a}=this._hsl,o=X(0,a+n*(1-a),1);return f.fromHsl(t,e,o,this.a)}darken(n){let{h:t,s:e,l:a}=this._hsl,o=X(0,a*(1-n),1);return f.fromHsl(t,e,o,this.a)}saturate(n){let{h:t,s:e,l:a}=this._hsl,o=X(0,e+n*(1-e),1);return f.fromHsl(t,o,a,this.a)}desaturate(n){let{h:t,s:e,l:a}=this._hsl,o=X(0,e*(1-n),1);return f.fromHsl(t,o,a,this.a)}rotate(n){let{h:t,s:e,l:a}=this._hsl,o=(t+360+n)%360;return f.fromHsl(o,e,a,this.a)}opacity(n){let{h:t,s:e,l:a}=this._hsl;return f.fromHsl(t,e,a,n)}swatch(){return console.log(`%c      %c ${this.html}, ${this.rgba}`,`background-color: ${this.html}`,"background-color: transparent"),this}blend(n,t){return new f(Z(this.r,n.r,t),Z(this.g,n.g,t),Z(this.b,n.b,t),Z(this.a,n.a,t))}static blendHue(n,t,e){let a=(t-n+720)%360;if(a<180)return n+e*a;else return n-(360-a)*e}mix(n,t){let e=this._hsl,a=n._hsl;return f.fromHsl(e.s===0?a.h:a.s===0?e.h:f.blendHue(e.h,a.h,t),Z(e.s,a.s,t),Z(e.l,a.l,t),Z(this.a,n.a,t))}colorMix(n,t){return f.fromCss(`color-mix(in hsl, ${this.html}, ${n.html} ${(t*100).toFixed(0)}%)`)}}function Gn(n,t){let e=m.style(Yn(t));e.id=n,document.head.append(e)}var Zs=["animation-iteration-count","flex","flex-base","flex-grow","flex-shrink","opacity","order","tab-size","widows","z-index","zoom"],ao=(n,t)=>{if(typeof t==="number"&&!Zs.includes(n))t=`${t}px`;if(n.startsWith("_"))if(n.startsWith("__"))n="--"+n.substring(2),t=`var(${n}-default, ${t})`;else n="--"+n.substring(1);return{prop:n,value:String(t)}},Qs=(n,t,e)=>{if(e===void 0)return"";if(e instanceof f)e=e.html;let a=ao(t,e);return`${n}  ${a.prop}: ${a.value};`},oo=(n,t,e="")=>{let a=Q(n);if(typeof t==="object"&&!(t instanceof f)){let o=Object.keys(t).map((s)=>oo(s,t[s],`${e}  `)).join(`
`);return`${e}  ${n} {
${o}
${e}  }`}else return Qs(e,a,t)},Yn=(n,t="")=>{return Object.keys(n).map((e)=>{let a=n[e];if(typeof a==="string"){if(e==="@import")return`@import url('${a}');`;throw Error("top-level string value only allowed for `@import`")}let o=Object.keys(a).map((s)=>oo(s,a[s])).join(`
`);return`${t}${e} {
${o}
}`}).join(`

`)},ni=(n)=>{ft("initVars","initVars is deprecated. Just use _ and __ prefixes instead.");let t={};for(let e of Object.keys(n)){let a=n[e],o=Q(e);t[`--${o}`]=typeof a==="number"&&a!==0?String(a)+"px":a}return t},ue=(n)=>{let t={};for(let e of Object.keys(n)){let a=n[e];if(a instanceof f)t[e]=a.inverseLuminance;else if(typeof a==="string"&&a.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/))t[e]=f.fromCss(a).inverseLuminance}return t},p=new Proxy({},{get(n,t){if(n[t]===void 0){let e="--"+Q(t);n[t]=(a)=>`var(${e}, ${a})`}return n[t]}}),d=new Proxy({},{get(n,t){if(t==="default")return p;if(n[t]==null){t=Q(t);let[,e,,a,o,s]=t.match(/^([-\w]*?)((_)?(\d+)(\w?))?$/)||["",t],i=`--${e}`;if(o!=null){let r=a==null?Number(o)/100:-Number(o)/100;switch(s){case"b":{let l=f.fromVar(i);n[t]=r>0?l.brighten(r).rgba:l.darken(-r).rgba}break;case"s":{let l=f.fromVar(i);n[t]=r>0?l.saturate(r).rgba:l.desaturate(-r).rgba}break;case"h":{let l=f.fromVar(i);n[t]=l.rotate(r*100).rgba}break;case"o":{let l=f.fromVar(i);n[t]=l.opacity(r).rgba}break;case"":n[t]=`calc(var(${i}) * ${r})`;break;default:throw console.error(s),Error(`Unrecognized method ${s} for css variable ${i}`)}}else n[t]=`var(${i})`}return n[t]}}),ti="http://www.w3.org/1998/Math/MathML",ei="http://www.w3.org/2000/svg",ht={},so=(n,t,e)=>{let a=ao(Q(t),e);if(a.prop.startsWith("--"))n.style.setProperty(a.prop,a.value);else n.style[t]=a.value},ai=(n)=>{return{toDOM(t,e){so(t,n,e)}}},io=(n,t,e)=>{if(t==="style")if(typeof e==="object")for(let a of Object.keys(e))if(nn(e[a]))A(n,e[a],ai(a));else so(n,a,e[a]);else n.setAttribute("style",e);else if(n[t]!==void 0){let{MathMLElement:a}=globalThis;if(n instanceof SVGElement||a!==void 0&&n instanceof a)n.setAttribute(t,e);else n[t]=e}else{let a=Q(t);if(a==="class")e.split(" ").forEach((o)=>{n.classList.add(o)});else if(n[a]!==void 0)n[a]=e;else if(typeof e==="boolean")e?n.setAttribute(a,""):n.removeAttribute(a);else n.setAttribute(a,e)}},oi=(n)=>{return{toDOM(t,e){io(t,n,e)}}},si=(n,t,e)=>{if(t==="apply")e(n);else if(t.match(/^on[A-Z]/)!=null){let a=t.substring(2).toLowerCase();Dn(n,a,e)}else if(t==="bind")if((typeof e.binding==="string"?$[e.binding]:e.binding)!==void 0&&e.value!==void 0)A(n,e.value,e.binding instanceof Function?{toDOM:e.binding}:e.binding);else throw Error("bad binding");else if(t.match(/^bind[A-Z]/)!=null){let a=t.substring(4,5).toLowerCase()+t.substring(5),o=$[a];if(o!==void 0)A(n,e,o);else throw Error(`${t} is not allowed, bindings.${a} is not defined`)}else if(nn(e))A(n,e,oi(t));else io(n,t,e)},me=(n,...t)=>{if(ht[n]===void 0){let[o,s]=n.split("|");if(s===void 0)ht[n]=globalThis.document.createElement(o);else ht[n]=globalThis.document.createElementNS(s,o)}let e=ht[n].cloneNode(),a={};for(let o of t)if(o instanceof Element||o instanceof DocumentFragment||typeof o==="string"||typeof o==="number")if(e instanceof HTMLTemplateElement)e.content.append(o);else e.append(o);else if(nn(o))e.append(m.span({bindText:o}));else Object.assign(a,o);for(let o of Object.keys(a)){let s=a[o];si(e,o,s)}return e},be=(...n)=>{let t=globalThis.document.createDocumentFragment();for(let e of n)t.append(e);return t},m=new Proxy({fragment:be},{get(n,t){if(t=t.replace(/[A-Z]/g,(e)=>`-${e.toLocaleLowerCase()}`),n[t]===void 0)n[t]=(...e)=>me(t,...e);return n[t]},set(){throw Error("You may not add new properties to elements")}}),wt=new Proxy({fragment:be},{get(n,t){if(n[t]===void 0)n[t]=(...e)=>me(`${t}|${ei}`,...e);return n[t]},set(){throw Error("You may not add new properties to elements")}}),ro=new Proxy({fragment:be},{get(n,t){if(n[t]===void 0)n[t]=(...e)=>me(`${t}|${ti}`,...e);return n[t]},set(){throw Error("You may not add new properties to elements")}}),ii=["sort","splice","copyWithin","fill","pop","push","reverse","shift","unshift"],ri=!0,li=/^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/,di=(n)=>li.test(n),ln=(n="",t="")=>{if(n==="")return t;else if(t.match(/^\d+$/)!==null||t.includes("="))return`${n}[${t}]`;else return`${n}.${t}`},lo={};function Zt(n,t){if(n!==null&&(typeof n==="object"||typeof n==="function"))return n;return new Proxy(lo,un(t,!0))}var pt=()=>new Proxy({},un("^",!0)),Ra=!1;function dn(){if(!Ra)console.warn("xinValue, tosiValue, xinPath, tosiPath, etc. are deprecated. Use value, path, observe, bind, on, binding, listBinding instead."),Ra=!0}var Ha=(n)=>{return n===lo},un=(n,t)=>({get(e,a){if(Ha(e)){let r=()=>Mn(gt,n);switch(a){case"path":return n;case"value":return r();case"valueOf":case"toJSON":return()=>r();case Symbol.toPrimitive:return(l)=>{let c=r();if(l==="number")return Number(c);if(l==="string")return String(c);return c};case"toString":return()=>String(r());case"observe":return(l)=>{let c=Pn(n,l);return()=>cn(c)};case"on":return(l,c)=>ct()(l,c,r());case"bind":return(l,c,h)=>{dt()(l,n,c,h)};case"binding":return(l)=>({bind:{value:n,binding:l}});case"listBinding":return(l=({span:h})=>h({bindText:"^"}),c={})=>[{bindList:{value:n,...c}},m.template(l(m,pt()))];case pn:case"xinValue":case"tosiValue":return dn(),r();case q:case"xinPath":case"tosiPath":return dn(),n;case Ba:case"tosiObserve":return dn(),(l)=>{let c=Pn(n,l);return()=>cn(c)};case Ma:case"tosiOn":return dn(),(l,c)=>ct()(l,c,r());case Pa:case"tosiBind":return dn(),(l,c,h)=>{dt()(l,n,c,h)};case"tosiBinding":return dn(),(l)=>({bind:{value:n,binding:l}});case"tosiListBinding":return dn(),(l=({span:h})=>h({bindText:"^"}),c={})=>[{bindList:{value:n,...c}},m.template(l(m,pt()))]}if(typeof a==="string"&&/^\d+$/.test(a)){let l=r();if(typeof l==="string")return l[parseInt(a,10)]}if(a==="length"){let l=r();if(typeof l==="string")return l.length}return}if(t&&!(a in e))switch(a){case"path":return n;case"value":return e.valueOf?e.valueOf():e;case"valueOf":case"toJSON":return()=>e.valueOf?e.valueOf():e;case"observe":return(r)=>{let l=Pn(n,r);return()=>cn(l)};case"on":return(r,l)=>ct()(r,l,z(e));case"bind":return(r,l,c)=>{dt()(r,n,l,c)};case"binding":return(r)=>({bind:{value:n,binding:r}});case"listBinding":return(r=({span:c})=>c({bindText:"^"}),l={})=>[{bindList:{value:n,...l}},m.template(r(m,pt()))]}switch(a){case q:case"xinPath":case"tosiPath":return n;case pn:case"xinValue":case"tosiValue":return e.valueOf?e.valueOf():e;case Ba:case"xinObserve":case"tosiObserve":return(r)=>{let l=Pn(n,r);return()=>cn(l)};case Ma:case"xinOn":case"tosiOn":return(r,l)=>ct()(r,l,z(e));case Pa:case"xinBind":case"tosiBind":return(r,l,c)=>{dt()(r,n,l,c)};case"tosiBinding":return(r)=>({bind:{value:n,binding:r}});case"tosiListBinding":return(r=({span:c})=>c({bindText:"^"}),l={})=>[{bindList:{value:n,...l}},m.template(r(m,pt()))]}if(typeof a==="symbol")return e[a];let o=Object.getOwnPropertyDescriptor(e,a);if(o&&!o.configurable&&!o.writable&&"value"in o)return o.value;let s=a,i=s.match(/^([^.[]+)\.(.+)$/)??s.match(/^([^\]]+)(\[.+)/)??s.match(/^(\[[^\]]+\])\.(.+)$/)??s.match(/^(\[[^\]]+\])\[(.+)$/);if(i!==null){let[,r,l]=i,c=ln(n,r),h=Mn(e,r);return h!==null&&typeof h==="object"?new Proxy(h,un(c,t))[l]:h}if(s.startsWith("[")&&s.endsWith("]"))s=s.substring(1,s.length-1);if(!Array.isArray(e)&&e[s]!==void 0||Array.isArray(e)&&s.includes("=")){let r;if(s.includes("=")){let[l,c]=s.split("=");r=e.find((h)=>`${Mn(h,l)}`===c)}else r=e[s];if(r instanceof Object){let l=ln(n,s);return new Proxy(r instanceof Function?r.bind(e):r,un(l,t))}else return t?Zt(r,ln(n,s)):r}else if(Array.isArray(e)){let r=e[s];return typeof r==="function"?(...l)=>{let c=l.map((u)=>z(u)),h=r.apply(e,c);if(ii.includes(s))bn(n);return h}:typeof r==="object"?new Proxy(r,un(ln(n,s),t)):t?Zt(r,ln(n,s)):r}else return t?Zt(e[s],ln(n,s)):e[s]},set(e,a,o){o=z(o);let s=a===pn||a==="xinValue"||a==="tosiValue"||a==="value"&&(Ha(e)||t)?n:ln(n,a);if(ri&&!di(s))throw Error(`setting invalid path ${s}`);if(z(M[s])!==o&&Fs(gt,s,o))bn(s);return!0}}),xt=(n,t)=>{let e=typeof t==="function"?t:M[t];if(typeof e!=="function")throw Error(`observe expects a function or path to a function, ${t} is neither`);return Pn(n,e)},M=new Proxy(gt,un("",!1));As(M);var yt=new Proxy(gt,un("",!0)),ci=16,hi=100;function Na(n,t){let e=Array.from(n.querySelectorAll(Ln));if(n.matches(Ln))e.unshift(n);for(let a of e){let o=mn.get(a);for(let s of o){if(s.path.startsWith("^"))s.path=`${t}${s.path.substring(1)}`;if(s.binding.toDOM!=null)s.binding.toDOM(a,M[s.path])}}}class co{boundElement;listTop;listBottom;template;options;itemToElement;array=[];_update;_previousSlice;static filterBoundObservers=new WeakMap;constructor(n,t,e={}){if(this.boundElement=n,this.itemToElement=new WeakMap,n.children.length!==1)throw Error("ListBinding expects an element with exactly one child element");if(n.children[0]instanceof HTMLTemplateElement){let a=n.children[0];if(a.content.children.length!==1)throw Error("ListBinding expects a template with exactly one child element");this.template=Un(a.content.children[0])}else this.template=n.children[0],this.template.remove();if(this.options=e,this.listTop=document.createElement("div"),this.listBottom=document.createElement("div"),this.listTop.classList.add("virtual-list-padding"),this.listBottom.classList.add("virtual-list-padding"),this.boundElement.append(this.listTop),this.boundElement.append(this.listBottom),e.virtual!=null)if(de.observe(this.boundElement),this._update=Fn(()=>{this.update(this.array,!0)},ci),this.boundElement.addEventListener("resize",this._update),e.virtual.scrollContainer==="window")window.addEventListener("scroll",this._update),window.addEventListener("resize",this._update);else this.boundElement.addEventListener("scroll",this._update)}visibleSlice(){let{virtual:n,hiddenProp:t,visibleProp:e}=this.options,a=this.array;if(t!==void 0)a=a.filter((l)=>l[t]!==!0);if(e!==void 0)a=a.filter((l)=>l[e]===!0);if(this.options.filter&&this.needle!==void 0)a=this.options.filter(a,this.needle);let o=0,s=a.length-1,i=0,r=0;if(n!=null&&this.boundElement instanceof HTMLElement){let l=this.boundElement.offsetWidth,c=n.scrollContainer==="window",h,u;if(c){h=window.innerHeight;let O=this.boundElement.getBoundingClientRect();u=Math.max(0,-O.top)}else h=this.boundElement.offsetHeight,u=this.boundElement.scrollTop;if(n.visibleColumns==null)n.visibleColumns=n.width!=null?Math.max(1,Math.floor(l/n.width)):1;let g=Math.ceil(h/n.height)+(n.rowChunkSize||1),w=Math.ceil(a.length/n.visibleColumns),v=n.visibleColumns*g,j=Math.floor(u/n.height);if(j>w-g+1)j=Math.max(0,w-g+1);if(n.rowChunkSize)j-=j%n.rowChunkSize;o=j*n.visibleColumns,s=o+v-1,i=j*n.height,r=Math.max((w-g)*n.height-i,0)}return{items:a,firstItem:o,lastItem:s,topBuffer:i,bottomBuffer:r}}needle;filter=Fn((n)=>{if(this.needle!==n)this.needle=n,this.update(this.array)},hi);update(n,t){if(n==null)n=[];this.array=n;let{hiddenProp:e,visibleProp:a}=this.options,o=nn(n),s=this.visibleSlice();this.boundElement.classList.toggle("-xin-empty-list",s.items.length===0);let i=this._previousSlice,{firstItem:r,lastItem:l,topBuffer:c,bottomBuffer:h}=s;if(e===void 0&&a===void 0&&t===!0&&i!=null&&r===i.firstItem&&l===i.lastItem)return;this._previousSlice=s;let u=0,g=0,w=0;for(let T of Array.from(this.boundElement.children)){if(T===this.listTop||T===this.listBottom)continue;let C=T[ee];if(C==null)T.remove();else{let S=s.items.indexOf(C);if(S<r||S>l)T.remove(),this.itemToElement.delete(C),u++}}this.listTop.style.height=String(c)+"px",this.listBottom.style.height=String(h)+"px";let v=[],{idPath:j}=this.options;for(let T=r;T<=l;T++){let C=s.items[T];if(C===void 0)continue;let S=this.itemToElement.get(z(C));if(S==null){if(w++,S=Un(this.template),typeof C==="object")this.itemToElement.set(z(C),S),S[ee]=z(C);if(this.boundElement.insertBefore(S,this.listBottom),j!=null){let P=C[j],En=`${o}[${j}=${P}]`;Na(S,En)}else{let P=`${o}[${T}]`;Na(S,P)}}v.push(S)}let O=null;for(let T of v){if(T.previousElementSibling!==O)if(g++,O?.nextElementSibling!=null)this.boundElement.insertBefore(T,O.nextElementSibling);else this.boundElement.insertBefore(T,this.listBottom);O=T}if(ut.perf)console.log(o,"updated",{removed:u,created:w,moved:g})}}var ge=(n,t,e)=>{let a=n[te];if(t&&a===void 0)a=new co(n,t,e),n[te]=a;return a},ye=(n)=>{let t;while(!(t=n[ee])&&n&&n.parentElement)n=n.parentElement;return t?{element:n,item:t}:void 0},yn=(n)=>{let t=ye(n);return t?t.item:void 0},pi=(n)=>{let t=ye(n);if(!t)return console.error("deleteListItem failed, element is not part of a list instance",n),!1;let e=ge(t.element.parentElement);if(!e.options.idPath)return console.error("deleteListItem failed, list binding has no idPath",n.parentElement,e),!1;let a=e.array.indexOf(t.item);if(a>-1)return e.array.splice(a,1),!0;return!1},{document:Jn,MutationObserver:Va}=globalThis,fe=(n,t)=>{let e=mn.get(n);if(e==null)return;for(let a of e){let{binding:o,options:s}=a,{path:i}=a,{toDOM:r}=o;if(r!=null){if(i.startsWith("^")){let l=yn(n);if(l!=null&&l[q]!=null)i=a.path=`${l[q]}${i.substring(1)}`;else throw console.error(`Cannot resolve relative binding ${i}`,n,"is not part of a list"),Error(`Cannot resolve relative binding ${i}`)}if(t==null||i.startsWith(t))r(n,pe()[i],s)}}};if(Va!=null)new Va((n)=>{n.forEach((t)=>{Array.from(t.addedNodes).forEach((e)=>{if(e instanceof Element)Array.from(e.querySelectorAll(Ln)).forEach((a)=>fe(a))})})}).observe(Jn.body,{subtree:!0,childList:!0});Pn(()=>!0,(n)=>{let t=Array.from(Jn.querySelectorAll(Ln));for(let e of t)fe(e,n)});var Wa=(n)=>{let t=n.target?.closest(Ln);while(t!=null){let e=mn.get(t);for(let a of e){let{binding:o,path:s}=a,{fromDOM:i}=o;if(i!=null){let r;try{r=i(t,a.options)}catch(l){throw console.error("Cannot get value from",t,"via",a),Error("Cannot obtain value fromDOM")}if(r!=null){let l=pe(),c=l[s];if(c==null)l[s]=r;else{let h=c[q]!=null?c[pn]:c,u=r[q]!=null?r[pn]:r;if(h!==u)l[s]=u}}}}t=t.parentElement.closest(Ln)}};if(globalThis.document!=null)Jn.body.addEventListener("change",Wa,!0),Jn.body.addEventListener("input",Wa,!0);function A(n,t,e,a){if(n instanceof DocumentFragment)throw Error("bind cannot bind to a DocumentFragment");let o;if(typeof t==="object"&&t[q]===void 0&&a===void 0){let{value:r}=t;o=typeof r==="string"?r:r[q],a=t,delete a.value}else o=typeof t==="string"?t:t[q];if(o==null)throw Error("bind requires a path or object with xin Proxy");let{toDOM:s}=e;n.classList?.add(Ua);let i=mn.get(n);if(i==null)i=[],mn.set(n,i);if(i.push({path:o,binding:e,options:a}),s!=null&&!o.startsWith("^"))bn(o);if(a?.filter&&a?.needle)A(n,a.needle,{toDOM(r,l){console.log({needle:l}),r[te]?.filter(l)}});return n}var Xa=new Set,ui=(n)=>{let t=n?.target?.closest(Ea),e=!1,a=new Proxy(n,{get(s,i){if(i==="stopPropagation")return()=>{n.stopPropagation(),e=!0};else{let r=s[i];return typeof r==="function"?r.bind(s):r}}}),o=new Set;while(!e&&t!=null){let s=qn.get(t)[n.type]||o;for(let i of s){if(typeof i==="function")i(a);else{let r=pe()[i];if(typeof r==="function")r(a);else throw Error(`no event handler found at path ${i}`)}if(e)continue}t=t.parentElement!=null?t.parentElement.closest(Ea):null}};function Dn(n,t,e){let a=qn.get(n);if(n.classList.add(Fa),a==null)a={},qn.set(n,a);if(!a[t])a[t]=new Set;if(a[t].add(e),!Xa.has(t))Xa.add(t),Jn.body.addEventListener(t,ui,!0);return()=>{a[t].delete(e)}}Os(A,Dn);var mi=0;function Qt(){return`custom-elt${(mi++).toString(36)}`}var qa=0,Xn={};function bi(n,t){let e=Xn[n],a=Yn(t).replace(/:host\b/g,n);Xn[n]=e?e+`
`+a:a}function gi(n){if(Xn[n])document.head.append(m.style({id:n+"-component"},Xn[n]));delete Xn[n]}class b extends HTMLElement{static elements=m;static _elementCreator;instanceId;styleNode;static styleSpec;static styleNode;content=m.slot();isSlotted;static _tagName=null;static get tagName(){return this._tagName}static StyleNode(n){return console.warn("StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly"),m.style(Yn(n))}static elementCreator(n={}){let t=this;if(t._elementCreator==null){let{tag:e,styleSpec:a}=n,o=n!=null?e:null;if(o==null)if(typeof t.name==="string"&&t.name!==""){if(o=Q(t.name),o.startsWith("-"))o=o.slice(1)}else o=Qt();if(customElements.get(o)!=null)console.warn(`${o} is already defined`);if(o.match(/\w+(-\w+)+/)==null)console.warn(`${o} is not a legal tag for a custom-element`),o=Qt();while(customElements.get(o)!==void 0)o=Qt();if(t._tagName=o,a!==void 0)bi(o,a);window.customElements.define(o,this,n),t._elementCreator=m[o]}return t._elementCreator}initAttributes(...n){let t={},e={};new MutationObserver((a)=>{let o=!1;if(a.forEach((s)=>{o=!!(s.attributeName&&n.includes(Ys(s.attributeName)))}),o&&this.queueRender!==void 0)this.queueRender(!1)}).observe(this,{attributes:!0}),n.forEach((a)=>{t[a]=hn(this[a]);let o=Q(a);Object.defineProperty(this,a,{enumerable:!1,get(){if(typeof t[a]==="boolean")return this.hasAttribute(o);else if(this.hasAttribute(o))return typeof t[a]==="number"?parseFloat(this.getAttribute(o)):this.getAttribute(o);else if(e[a]!==void 0)return e[a];else return t[a]},set(s){if(typeof t[a]==="boolean"){if(s!==this[a]){if(s)this.setAttribute(o,"");else this.removeAttribute(o);this.queueRender()}}else if(typeof t[a]==="number"){if(s!==parseFloat(this[a]))this.setAttribute(o,s),this.queueRender()}else if(typeof s==="object"||`${s}`!==`${this[a]}`){if(s===null||s===void 0||typeof s==="object")this.removeAttribute(o);else this.setAttribute(o,s);this.queueRender(),e[a]=s}}})})}initValue(){let n=Object.getOwnPropertyDescriptor(this,"value");if(n===void 0||n.get!==void 0||n.set!==void 0)return;let t=this.hasAttribute("value")?this.getAttribute("value"):hn(this.value);delete this.value,Object.defineProperty(this,"value",{enumerable:!1,get(){return t},set(e){if(t!==e)t=e,this.queueRender(!0)}})}_parts;get parts(){let n=this.shadowRoot!=null?this.shadowRoot:this;if(this._parts==null)this._parts=new Proxy({},{get(t,e){if(t[e]===void 0){let a=n.querySelector(`[part="${e}"]`);if(a==null)a=n.querySelector(e);if(a==null)throw Error(`elementRef "${e}" does not exist!`);a.removeAttribute("data-ref"),t[e]=a}return t[e]}});return this._parts}constructor(){super();qa+=1,this.initAttributes("hidden"),this.instanceId=`${this.tagName.toLocaleLowerCase()}-${qa}`,this._value=hn(this.defaultValue)}connectedCallback(){if(gi(this.constructor.tagName),this.hydrate(),this.role!=null)this.setAttribute("role",this.role);if(this.onResize!==void 0){if(de.observe(this),this._onResize==null)this._onResize=this.onResize.bind(this);this.addEventListener("resize",this._onResize)}if(this.value!=null&&this.getAttribute("value")!=null)this._value=this.getAttribute("value");this.queueRender()}disconnectedCallback(){de.unobserve(this)}_changeQueued=!1;_renderQueued=!1;queueRender(n=!1){if(!this._hydrated)return;if(!this._changeQueued)this._changeQueued=n;if(!this._renderQueued)this._renderQueued=!0,requestAnimationFrame(()=>{if(this._changeQueued)Ja(this,"change");this._changeQueued=!1,this._renderQueued=!1,this.render()})}_hydrated=!1;hydrate(){if(!this._hydrated){this.initValue();let n=typeof this.content!=="function",t=typeof this.content==="function"?this.content(m):this.content,{styleSpec:e}=this.constructor,{styleNode:a}=this.constructor;if(e)a=this.constructor.styleNode=m.style(Yn(e)),delete this.constructor.styleNode;if(this.styleNode)console.warn(this,"styleNode is deprecrated, use static styleNode or statc styleSpec instead"),a=this.styleNode;if(a){let o=this.attachShadow({mode:"open"});o.appendChild(a.cloneNode(!0)),Oa(o,t,n)}else if(t!==null){let o=Array.from(this.childNodes);Oa(this,t,n),this.isSlotted=this.querySelector("slot,xin-slot")!==void 0;let s=Array.from(this.querySelectorAll("slot"));if(s.length>0)s.forEach(ve.replaceSlot);if(o.length>0){let i={"":this};Array.from(this.querySelectorAll("xin-slot")).forEach((r)=>{i[r.name]=r}),o.forEach((r)=>{let l=i[""],c=r instanceof Element?i[r.slot]:l;(c!==void 0?c:l).append(r)})}}this._hydrated=!0}}render(){}}class ve extends b{name="";content=null;static replaceSlot(n){let t=document.createElement("xin-slot");if(n.name!=="")t.setAttribute("name",n.name);n.replaceWith(t)}constructor(){super();this.initAttributes("name")}}var Jl=ve.elementCreator({tag:"xin-slot"}),we=(n=()=>!0)=>{let t=localStorage.getItem("xin-state");if(t!=null){let a=JSON.parse(t);for(let o of Object.keys(a).filter(n))if(M[o]!==void 0)Object.assign(M[o],a[o]);else M[o]=a[o]}let e=vt(()=>{let a={},o=z(M);for(let s of Object.keys(o).filter(n))a[s]=o[s];localStorage.setItem("xin-state",JSON.stringify(a)),console.log("xin state saved to localStorage")},500);xt(n,e)},kt="1.1.3";function U(n){return Object.assign(yt,n),yt}function xe(n){return ft("boxedProxy","boxedProxy is deprecated, please use tosi() instead"),U(n)}function ho(n,t=!1){if(t)return ft("xinProxy-boxed","xinProxy(..., true) is deprecated; use tosi(...) instead"),xe(n);return Object.keys(n).forEach((e)=>{M[e]=n[e]}),M}var yi={};async function ke(n,t){let{type:e,styleSpec:a}=await t(n,{Color:f,Component:b,elements:m,svgElements:wt,mathML:ro,varDefault:p,vars:d,xin:M,boxed:yt,xinProxy:ho,boxedProxy:xe,tosi:U,makeComponent:ke,bind:A,on:Dn,version:kt}),o={type:e,creator:e.elementCreator({tag:n,styleSpec:a})};return yi[n]=o,o}var ne={},fi=(n)=>import(n);class jt extends b{tag="anon-elt";src="";property="default";loaded;blueprintLoaded=(n)=>{};async packaged(){let{tag:n,src:t,property:e}=this,a=`${n}.${e}:${t}`;if(!this.loaded){if(ne[a]===void 0)ne[a]=fi(t).then((o)=>{let s=o[e];return ke(n,s)});else console.log(`using cached ${n} with signature ${a}`);this.loaded=await ne[a],this.blueprintLoaded(this.loaded)}return this.loaded}constructor(){super();this.initAttributes("tag","src","property")}}var vi=jt.elementCreator({tag:"xin-blueprint",styleSpec:{":host":{display:"none"}}});class je extends b{allLoaded=()=>{};constructor(){super()}async load(){let n=Array.from(this.querySelectorAll(jt.tagName)).filter((t)=>t.src).map((t)=>t.packaged());await Promise.all(n),this.allLoaded()}connectedCallback(){super.connectedCallback(),this.load()}}var wi=je.elementCreator({tag:"xin-loader",styleSpec:{":host":{display:"none"}}});var Ta={};Ia(Ta,{xrControllersText:()=>tl,xrControllers:()=>nl,xinTagList:()=>Rl,xinTag:()=>ks,xinSizer:()=>Al,xinSelect:()=>Tn,xinSegmented:()=>Dl,xinRating:()=>xl,xinPasswordStrength:()=>wl,xinNotification:()=>gs,xinMenu:()=>jr,xinLocalized:()=>Xt,xinForm:()=>Zr,xinFloat:()=>Je,xinField:()=>Kr,xinCarousel:()=>hr,version:()=>Sa,updateLocalized:()=>ea,trackDrag:()=>an,tosijs:()=>$n,tosiMonth:()=>bl,tosiDialog:()=>Ht,tabSelector:()=>ms,svgIcon:()=>rr,svg2DataUrl:()=>Vt,styleSheet:()=>Jo,spacer:()=>Hn,sizeBreak:()=>ka,sideNav:()=>wa,setLocale:()=>gr,scriptTag:()=>Cn,richTextWidgets:()=>xs,richText:()=>El,removeLastMenu:()=>In,postNotification:()=>fl,positionFloat:()=>Qo,popMenu:()=>J,popFloat:()=>Zo,menu:()=>is,markdownViewer:()=>ua,mapBox:()=>pl,makeSorter:()=>ns,makeExamplesLive:()=>dl,localize:()=>E,localePicker:()=>vr,liveExample:()=>Ut,isBreached:()=>fs,initLocalization:()=>fr,icons:()=>y,i18n:()=>I,gamepadText:()=>Qr,gamepadState:()=>us,findHighestZ:()=>Wt,filterPart:()=>Nt,filterBuilder:()=>Ur,elastic:()=>Sl,editableRect:()=>Nr,dragAndDrop:()=>ls,digest:()=>ys,defineIcons:()=>ir,dataTable:()=>Lr,createSubMenu:()=>os,createMenuItem:()=>ss,createMenuAction:()=>as,commandButton:()=>W,colorInput:()=>Ko,codeEditor:()=>_t,bringToFront:()=>ot,bodymovinPlayer:()=>dr,blockStyle:()=>ya,b3d:()=>lr,availableFilters:()=>la,abTest:()=>sr,XinTagList:()=>Ca,XinTag:()=>Ft,XinSizer:()=>ja,XinSelect:()=>it,XinSegmented:()=>va,XinRating:()=>ga,XinPasswordStrength:()=>ba,XinNotification:()=>Sn,XinMenu:()=>sa,XinLocalized:()=>Y,XinForm:()=>st,XinFloat:()=>on,XinField:()=>qt,XinCarousel:()=>ta,TosiMonth:()=>ma,TosiDialog:()=>ra,TabSelector:()=>ha,SvgIcon:()=>Qe,SizeBreak:()=>xa,SideNav:()=>Vn,RichText:()=>fa,MarkdownViewer:()=>pa,MapBox:()=>jn,LocalePicker:()=>aa,LiveExample:()=>Nn,FilterPart:()=>da,FilterBuilder:()=>ca,EditableRect:()=>N,DataTable:()=>ia,CodeEditor:()=>Rn,BodymovinPlayer:()=>_n,B3d:()=>na,AbTest:()=>zn});function Se(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var vn=Se();function fo(n){vn=n}var nt={exec:()=>null};function k(n,t=""){let e=typeof n=="string"?n:n.source,a={replace:(o,s)=>{let i=typeof s=="string"?s:s.source;return i=i.replace(L.caret,"$1"),e=e.replace(o,i),a},getRegex:()=>new RegExp(e,t)};return a}var L={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:(n)=>new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}#`),htmlBeginRegex:(n)=>new RegExp(`^ {0,${Math.min(3,n-1)}}<(?:[a-z].*>|!--)`,"i")},xi=/^(?:[ \t]*(?:\n|$))+/,ki=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,ji=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,tt=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Ci=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Te=/(?:[*+-]|\d{1,9}[.)])/,vo=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,wo=k(vo).replace(/bull/g,Te).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Si=k(vo).replace(/bull/g,Te).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Ie=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Ti=/^[^\n]+/,Ee=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,Ii=k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",Ee).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Ei=k(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Te).getRegex(),Et="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Be=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Bi=k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))","i").replace("comment",Be).replace("tag",Et).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),xo=k(Ie).replace("hr",tt).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Et).getRegex(),Pi=k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",xo).getRegex(),Pe={blockquote:Pi,code:ki,def:Ii,fences:ji,heading:Ci,hr:tt,html:Bi,lheading:wo,list:Ei,newline:xi,paragraph:xo,table:nt,text:Ti},po=k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",tt).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}\t)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Et).getRegex(),Mi={...Pe,lheading:Si,table:po,paragraph:k(Ie).replace("hr",tt).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",po).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Et).getRegex()},Li={...Pe,html:k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Be).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:nt,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:k(Ie).replace("hr",tt).replace("heading",` *#{1,6} *[^
]`).replace("lheading",wo).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Di=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Ai=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,ko=/^( {2,}|\\)\n(?!\s*$)/,Oi=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Bt=/[\p{P}\p{S}]/u,Me=/[\s\p{P}\p{S}]/u,jo=/[^\s\p{P}\p{S}]/u,zi=k(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,Me).getRegex(),Co=/(?!~)[\p{P}\p{S}]/u,_i=/(?!~)[\s\p{P}\p{S}]/u,Ri=/(?:[^\s\p{P}\p{S}]|~)/u,Hi=/\[(?:[^\[\]`]|`[^`]*?`)*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)|`[^`]*?`|<(?! )[^<>]*?>/g,So=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,Ni=k(So,"u").replace(/punct/g,Bt).getRegex(),Vi=k(So,"u").replace(/punct/g,Co).getRegex(),To="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Wi=k(To,"gu").replace(/notPunctSpace/g,jo).replace(/punctSpace/g,Me).replace(/punct/g,Bt).getRegex(),Xi=k(To,"gu").replace(/notPunctSpace/g,Ri).replace(/punctSpace/g,_i).replace(/punct/g,Co).getRegex(),qi=k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,jo).replace(/punctSpace/g,Me).replace(/punct/g,Bt).getRegex(),Ui=k(/\\(punct)/,"gu").replace(/punct/g,Bt).getRegex(),Fi=k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Yi=k(Be).replace("(?:-->|$)","-->").getRegex(),Ji=k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Yi).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),St=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/,Gi=k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",St).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Io=k(/^!?\[(label)\]\[(ref)\]/).replace("label",St).replace("ref",Ee).getRegex(),Eo=k(/^!?\[(ref)\](?:\[\])?/).replace("ref",Ee).getRegex(),$i=k("reflink|nolink(?!\\()","g").replace("reflink",Io).replace("nolink",Eo).getRegex(),uo=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Le={_backpedal:nt,anyPunctuation:Ui,autolink:Fi,blockSkip:Hi,br:ko,code:Ai,del:nt,emStrongLDelim:Ni,emStrongRDelimAst:Wi,emStrongRDelimUnd:qi,escape:Di,link:Gi,nolink:Eo,punctuation:zi,reflink:Io,reflinkSearch:$i,tag:Ji,text:Oi,url:nt},Ki={...Le,link:k(/^!?\[(label)\]\((.*?)\)/).replace("label",St).getRegex(),reflink:k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",St).getRegex()},Ce={...Le,emStrongRDelimAst:Xi,emStrongLDelim:Vi,url:k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",uo).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:k(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",uo).getRegex()},Zi={...Ce,br:k(ko).replace("{2,}","*").getRegex(),text:k(Ce.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Ct={normal:Pe,gfm:Mi,pedantic:Li},Kn={normal:Le,gfm:Ce,breaks:Zi,pedantic:Ki},Qi={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},mo=(n)=>Qi[n];function F(n,t){if(t){if(L.escapeTest.test(n))return n.replace(L.escapeReplace,mo)}else if(L.escapeTestNoEncode.test(n))return n.replace(L.escapeReplaceNoEncode,mo);return n}function bo(n){try{n=encodeURI(n).replace(L.percentDecode,"%")}catch{return null}return n}function go(n,t){let e=n.replace(L.findPipe,(s,i,r)=>{let l=!1,c=i;for(;--c>=0&&r[c]==="\\";)l=!l;return l?"|":" |"}),a=e.split(L.splitPipe),o=0;if(a[0].trim()||a.shift(),a.length>0&&!a.at(-1)?.trim()&&a.pop(),t)if(a.length>t)a.splice(t);else for(;a.length<t;)a.push("");for(;o<a.length;o++)a[o]=a[o].trim().replace(L.slashPipe,"|");return a}function Zn(n,t,e){let a=n.length;if(a===0)return"";let o=0;for(;o<a;){let s=n.charAt(a-o-1);if(s===t&&!e)o++;else if(s!==t&&e)o++;else break}return n.slice(0,a-o)}function nr(n,t){if(n.indexOf(t[1])===-1)return-1;let e=0;for(let a=0;a<n.length;a++)if(n[a]==="\\")a++;else if(n[a]===t[0])e++;else if(n[a]===t[1]&&(e--,e<0))return a;return e>0?-2:-1}function yo(n,t,e,a,o){let s=t.href,i=t.title||null,r=n[1].replace(o.other.outputLinkReplace,"$1");a.state.inLink=!0;let l={type:n[0].charAt(0)==="!"?"image":"link",raw:e,href:s,title:i,text:r,tokens:a.inlineTokens(r)};return a.state.inLink=!1,l}function tr(n,t,e){let a=n.match(e.other.indentCodeCompensation);if(a===null)return t;let o=a[1];return t.split(`
`).map((s)=>{let i=s.match(e.other.beginningSpace);if(i===null)return s;let[r]=i;return r.length>=o.length?s.slice(o.length):s}).join(`
`)}var Tt=class{options;rules;lexer;constructor(n){this.options=n||vn}space(n){let t=this.rules.block.newline.exec(n);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(n){let t=this.rules.block.code.exec(n);if(t){let e=t[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?e:Zn(e,`
`)}}}fences(n){let t=this.rules.block.fences.exec(n);if(t){let e=t[0],a=tr(e,t[3]||"",this.rules);return{type:"code",raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:a}}}heading(n){let t=this.rules.block.heading.exec(n);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let a=Zn(e,"#");(this.options.pedantic||!a||this.rules.other.endingSpaceChar.test(a))&&(e=a.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(n){let t=this.rules.block.hr.exec(n);if(t)return{type:"hr",raw:Zn(t[0],`
`)}}blockquote(n){let t=this.rules.block.blockquote.exec(n);if(t){let e=Zn(t[0],`
`).split(`
`),a="",o="",s=[];for(;e.length>0;){let i=!1,r=[],l;for(l=0;l<e.length;l++)if(this.rules.other.blockquoteStart.test(e[l]))r.push(e[l]),i=!0;else if(!i)r.push(e[l]);else break;e=e.slice(l);let c=r.join(`
`),h=c.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");a=a?`${a}
${c}`:c,o=o?`${o}
${h}`:h;let u=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(h,s,!0),this.lexer.state.top=u,e.length===0)break;let g=s.at(-1);if(g?.type==="code")break;if(g?.type==="blockquote"){let w=g,v=w.raw+`
`+e.join(`
`),j=this.blockquote(v);s[s.length-1]=j,a=a.substring(0,a.length-w.raw.length)+j.raw,o=o.substring(0,o.length-w.text.length)+j.text;break}else if(g?.type==="list"){let w=g,v=w.raw+`
`+e.join(`
`),j=this.list(v);s[s.length-1]=j,a=a.substring(0,a.length-g.raw.length)+j.raw,o=o.substring(0,o.length-w.raw.length)+j.raw,e=v.substring(s.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:a,tokens:s,text:o}}}list(n){let t=this.rules.block.list.exec(n);if(t){let e=t[1].trim(),a=e.length>1,o={type:"list",raw:"",ordered:a,start:a?+e.slice(0,-1):"",loose:!1,items:[]};e=a?`\\d{1,9}\\${e.slice(-1)}`:`\\${e}`,this.options.pedantic&&(e=a?e:"[*+-]");let s=this.rules.other.listItemRegex(e),i=!1;for(;n;){let l=!1,c="",h="";if(!(t=s.exec(n))||this.rules.block.hr.test(n))break;c=t[0],n=n.substring(c.length);let u=t[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,(T)=>" ".repeat(3*T.length)),g=n.split(`
`,1)[0],w=!u.trim(),v=0;if(this.options.pedantic?(v=2,h=u.trimStart()):w?v=t[1].length+1:(v=t[2].search(this.rules.other.nonSpaceChar),v=v>4?1:v,h=u.slice(v),v+=t[1].length),w&&this.rules.other.blankLine.test(g)&&(c+=g+`
`,n=n.substring(g.length+1),l=!0),!l){let T=this.rules.other.nextBulletRegex(v),C=this.rules.other.hrRegex(v),S=this.rules.other.fencesBeginRegex(v),P=this.rules.other.headingBeginRegex(v),En=this.rules.other.htmlBeginRegex(v);for(;n;){let $t=n.split(`
`,1)[0],Wn;if(g=$t,this.options.pedantic?(g=g.replace(this.rules.other.listReplaceNesting,"  "),Wn=g):Wn=g.replace(this.rules.other.tabCharGlobal,"    "),S.test(g)||P.test(g)||En.test(g)||T.test(g)||C.test(g))break;if(Wn.search(this.rules.other.nonSpaceChar)>=v||!g.trim())h+=`
`+Wn.slice(v);else{if(w||u.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||S.test(u)||P.test(u)||C.test(u))break;h+=`
`+g}!w&&!g.trim()&&(w=!0),c+=$t+`
`,n=n.substring($t.length+1),u=Wn.slice(v)}}o.loose||(i?o.loose=!0:this.rules.other.doubleBlankLine.test(c)&&(i=!0));let j=null,O;this.options.gfm&&(j=this.rules.other.listIsTask.exec(h),j&&(O=j[0]!=="[ ] ",h=h.replace(this.rules.other.listReplaceTask,""))),o.items.push({type:"list_item",raw:c,task:!!j,checked:O,loose:!1,text:h,tokens:[]}),o.raw+=c}let r=o.items.at(-1);if(r)r.raw=r.raw.trimEnd(),r.text=r.text.trimEnd();else return;o.raw=o.raw.trimEnd();for(let l=0;l<o.items.length;l++)if(this.lexer.state.top=!1,o.items[l].tokens=this.lexer.blockTokens(o.items[l].text,[]),!o.loose){let c=o.items[l].tokens.filter((u)=>u.type==="space"),h=c.length>0&&c.some((u)=>this.rules.other.anyLine.test(u.raw));o.loose=h}if(o.loose)for(let l=0;l<o.items.length;l++)o.items[l].loose=!0;return o}}html(n){let t=this.rules.block.html.exec(n);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(n){let t=this.rules.block.def.exec(n);if(t){let e=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),a=t[2]?t[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",o=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:e,raw:t[0],href:a,title:o}}}table(n){let t=this.rules.block.table.exec(n);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let e=go(t[1]),a=t[2].replace(this.rules.other.tableAlignChars,"").split("|"),o=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],s={type:"table",raw:t[0],header:[],align:[],rows:[]};if(e.length===a.length){for(let i of a)this.rules.other.tableAlignRight.test(i)?s.align.push("right"):this.rules.other.tableAlignCenter.test(i)?s.align.push("center"):this.rules.other.tableAlignLeft.test(i)?s.align.push("left"):s.align.push(null);for(let i=0;i<e.length;i++)s.header.push({text:e[i],tokens:this.lexer.inline(e[i]),header:!0,align:s.align[i]});for(let i of o)s.rows.push(go(i,s.header.length).map((r,l)=>({text:r,tokens:this.lexer.inline(r),header:!1,align:s.align[l]})));return s}}lheading(n){let t=this.rules.block.lheading.exec(n);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(n){let t=this.rules.block.paragraph.exec(n);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(n){let t=this.rules.block.text.exec(n);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(n){let t=this.rules.inline.escape.exec(n);if(t)return{type:"escape",raw:t[0],text:t[1]}}tag(n){let t=this.rules.inline.tag.exec(n);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(n){let t=this.rules.inline.link.exec(n);if(t){let e=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(e)){if(!this.rules.other.endAngleBracket.test(e))return;let s=Zn(e.slice(0,-1),"\\");if((e.length-s.length)%2===0)return}else{let s=nr(t[2],"()");if(s===-2)return;if(s>-1){let i=(t[0].indexOf("!")===0?5:4)+t[1].length+s;t[2]=t[2].substring(0,s),t[0]=t[0].substring(0,i).trim(),t[3]=""}}let a=t[2],o="";if(this.options.pedantic){let s=this.rules.other.pedanticHrefTitle.exec(a);s&&(a=s[1],o=s[3])}else o=t[3]?t[3].slice(1,-1):"";return a=a.trim(),this.rules.other.startAngleBracket.test(a)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(e)?a=a.slice(1):a=a.slice(1,-1)),yo(t,{href:a&&a.replace(this.rules.inline.anyPunctuation,"$1"),title:o&&o.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer,this.rules)}}reflink(n,t){let e;if((e=this.rules.inline.reflink.exec(n))||(e=this.rules.inline.nolink.exec(n))){let a=(e[2]||e[1]).replace(this.rules.other.multipleSpaceGlobal," "),o=t[a.toLowerCase()];if(!o){let s=e[0].charAt(0);return{type:"text",raw:s,text:s}}return yo(e,o,e[0],this.lexer,this.rules)}}emStrong(n,t,e=""){let a=this.rules.inline.emStrongLDelim.exec(n);if(!a||a[3]&&e.match(this.rules.other.unicodeAlphaNumeric))return;if(!(a[1]||a[2])||!e||this.rules.inline.punctuation.exec(e)){let o=[...a[0]].length-1,s,i,r=o,l=0,c=a[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(c.lastIndex=0,t=t.slice(-1*n.length+o);(a=c.exec(t))!=null;){if(s=a[1]||a[2]||a[3]||a[4]||a[5]||a[6],!s)continue;if(i=[...s].length,a[3]||a[4]){r+=i;continue}else if((a[5]||a[6])&&o%3&&!((o+i)%3)){l+=i;continue}if(r-=i,r>0)continue;i=Math.min(i,i+r+l);let h=[...a[0]][0].length,u=n.slice(0,o+a.index+h+i);if(Math.min(o,i)%2){let w=u.slice(1,-1);return{type:"em",raw:u,text:w,tokens:this.lexer.inlineTokens(w)}}let g=u.slice(2,-2);return{type:"strong",raw:u,text:g,tokens:this.lexer.inlineTokens(g)}}}}codespan(n){let t=this.rules.inline.code.exec(n);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal," "),a=this.rules.other.nonSpaceChar.test(e),o=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return a&&o&&(e=e.substring(1,e.length-1)),{type:"codespan",raw:t[0],text:e}}}br(n){let t=this.rules.inline.br.exec(n);if(t)return{type:"br",raw:t[0]}}del(n){let t=this.rules.inline.del.exec(n);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(n){let t=this.rules.inline.autolink.exec(n);if(t){let e,a;return t[2]==="@"?(e=t[1],a="mailto:"+e):(e=t[1],a=e),{type:"link",raw:t[0],text:e,href:a,tokens:[{type:"text",raw:e,text:e}]}}}url(n){let t;if(t=this.rules.inline.url.exec(n)){let e,a;if(t[2]==="@")e=t[0],a="mailto:"+e;else{let o;do o=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(o!==t[0]);e=t[0],t[1]==="www."?a="http://"+t[0]:a=t[0]}return{type:"link",raw:t[0],text:e,href:a,tokens:[{type:"text",raw:e,text:e}]}}}inlineText(n){let t=this.rules.inline.text.exec(n);if(t){let e=this.lexer.state.inRawBlock;return{type:"text",raw:t[0],text:t[0],escaped:e}}}},_=class n{tokens;options;state;tokenizer;inlineQueue;constructor(t){this.tokens=[],this.tokens.links=Object.create(null),this.options=t||vn,this.options.tokenizer=this.options.tokenizer||new Tt,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let e={other:L,block:Ct.normal,inline:Kn.normal};this.options.pedantic?(e.block=Ct.pedantic,e.inline=Kn.pedantic):this.options.gfm&&(e.block=Ct.gfm,this.options.breaks?e.inline=Kn.breaks:e.inline=Kn.gfm),this.tokenizer.rules=e}static get rules(){return{block:Ct,inline:Kn}}static lex(t,e){return new n(e).lex(t)}static lexInline(t,e){return new n(e).inlineTokens(t)}lex(t){t=t.replace(L.carriageReturn,`
`),this.blockTokens(t,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let a=this.inlineQueue[e];this.inlineTokens(a.src,a.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(t,e=[],a=!1){for(this.options.pedantic&&(t=t.replace(L.tabCharGlobal,"    ").replace(L.spaceLine,""));t;){let o;if(this.options.extensions?.block?.some((i)=>(o=i.call({lexer:this},t,e))?(t=t.substring(o.raw.length),e.push(o),!0):!1))continue;if(o=this.tokenizer.space(t)){t=t.substring(o.raw.length);let i=e.at(-1);o.raw.length===1&&i!==void 0?i.raw+=`
`:e.push(o);continue}if(o=this.tokenizer.code(t)){t=t.substring(o.raw.length);let i=e.at(-1);i?.type==="paragraph"||i?.type==="text"?(i.raw+=(i.raw.endsWith(`
`)?"":`
`)+o.raw,i.text+=`
`+o.text,this.inlineQueue.at(-1).src=i.text):e.push(o);continue}if(o=this.tokenizer.fences(t)){t=t.substring(o.raw.length),e.push(o);continue}if(o=this.tokenizer.heading(t)){t=t.substring(o.raw.length),e.push(o);continue}if(o=this.tokenizer.hr(t)){t=t.substring(o.raw.length),e.push(o);continue}if(o=this.tokenizer.blockquote(t)){t=t.substring(o.raw.length),e.push(o);continue}if(o=this.tokenizer.list(t)){t=t.substring(o.raw.length),e.push(o);continue}if(o=this.tokenizer.html(t)){t=t.substring(o.raw.length),e.push(o);continue}if(o=this.tokenizer.def(t)){t=t.substring(o.raw.length);let i=e.at(-1);i?.type==="paragraph"||i?.type==="text"?(i.raw+=(i.raw.endsWith(`
`)?"":`
`)+o.raw,i.text+=`
`+o.raw,this.inlineQueue.at(-1).src=i.text):this.tokens.links[o.tag]||(this.tokens.links[o.tag]={href:o.href,title:o.title},e.push(o));continue}if(o=this.tokenizer.table(t)){t=t.substring(o.raw.length),e.push(o);continue}if(o=this.tokenizer.lheading(t)){t=t.substring(o.raw.length),e.push(o);continue}let s=t;if(this.options.extensions?.startBlock){let i=1/0,r=t.slice(1),l;this.options.extensions.startBlock.forEach((c)=>{l=c.call({lexer:this},r),typeof l=="number"&&l>=0&&(i=Math.min(i,l))}),i<1/0&&i>=0&&(s=t.substring(0,i+1))}if(this.state.top&&(o=this.tokenizer.paragraph(s))){let i=e.at(-1);a&&i?.type==="paragraph"?(i.raw+=(i.raw.endsWith(`
`)?"":`
`)+o.raw,i.text+=`
`+o.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=i.text):e.push(o),a=s.length!==t.length,t=t.substring(o.raw.length);continue}if(o=this.tokenizer.text(t)){t=t.substring(o.raw.length);let i=e.at(-1);i?.type==="text"?(i.raw+=(i.raw.endsWith(`
`)?"":`
`)+o.raw,i.text+=`
`+o.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=i.text):e.push(o);continue}if(t){let i="Infinite loop on byte: "+t.charCodeAt(0);if(this.options.silent){console.error(i);break}else throw Error(i)}}return this.state.top=!0,e}inline(t,e=[]){return this.inlineQueue.push({src:t,tokens:e}),e}inlineTokens(t,e=[]){let a=t,o=null;if(this.tokens.links){let r=Object.keys(this.tokens.links);if(r.length>0)for(;(o=this.tokenizer.rules.inline.reflinkSearch.exec(a))!=null;)r.includes(o[0].slice(o[0].lastIndexOf("[")+1,-1))&&(a=a.slice(0,o.index)+"["+"a".repeat(o[0].length-2)+"]"+a.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(o=this.tokenizer.rules.inline.anyPunctuation.exec(a))!=null;)a=a.slice(0,o.index)+"++"+a.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(o=this.tokenizer.rules.inline.blockSkip.exec(a))!=null;)a=a.slice(0,o.index)+"["+"a".repeat(o[0].length-2)+"]"+a.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);a=this.options.hooks?.emStrongMask?.call({lexer:this},a)??a;let s=!1,i="";for(;t;){s||(i=""),s=!1;let r;if(this.options.extensions?.inline?.some((c)=>(r=c.call({lexer:this},t,e))?(t=t.substring(r.raw.length),e.push(r),!0):!1))continue;if(r=this.tokenizer.escape(t)){t=t.substring(r.raw.length),e.push(r);continue}if(r=this.tokenizer.tag(t)){t=t.substring(r.raw.length),e.push(r);continue}if(r=this.tokenizer.link(t)){t=t.substring(r.raw.length),e.push(r);continue}if(r=this.tokenizer.reflink(t,this.tokens.links)){t=t.substring(r.raw.length);let c=e.at(-1);r.type==="text"&&c?.type==="text"?(c.raw+=r.raw,c.text+=r.text):e.push(r);continue}if(r=this.tokenizer.emStrong(t,a,i)){t=t.substring(r.raw.length),e.push(r);continue}if(r=this.tokenizer.codespan(t)){t=t.substring(r.raw.length),e.push(r);continue}if(r=this.tokenizer.br(t)){t=t.substring(r.raw.length),e.push(r);continue}if(r=this.tokenizer.del(t)){t=t.substring(r.raw.length),e.push(r);continue}if(r=this.tokenizer.autolink(t)){t=t.substring(r.raw.length),e.push(r);continue}if(!this.state.inLink&&(r=this.tokenizer.url(t))){t=t.substring(r.raw.length),e.push(r);continue}let l=t;if(this.options.extensions?.startInline){let c=1/0,h=t.slice(1),u;this.options.extensions.startInline.forEach((g)=>{u=g.call({lexer:this},h),typeof u=="number"&&u>=0&&(c=Math.min(c,u))}),c<1/0&&c>=0&&(l=t.substring(0,c+1))}if(r=this.tokenizer.inlineText(l)){t=t.substring(r.raw.length),r.raw.slice(-1)!=="_"&&(i=r.raw.slice(-1)),s=!0;let c=e.at(-1);c?.type==="text"?(c.raw+=r.raw,c.text+=r.text):e.push(r);continue}if(t){let c="Infinite loop on byte: "+t.charCodeAt(0);if(this.options.silent){console.error(c);break}else throw Error(c)}}return e}},It=class{options;parser;constructor(n){this.options=n||vn}space(n){return""}code({text:n,lang:t,escaped:e}){let a=(t||"").match(L.notSpaceStart)?.[0],o=n.replace(L.endingNewline,"")+`
`;return a?'<pre><code class="language-'+F(a)+'">'+(e?o:F(o,!0))+`</code></pre>
`:"<pre><code>"+(e?o:F(o,!0))+`</code></pre>
`}blockquote({tokens:n}){return`<blockquote>
${this.parser.parse(n)}</blockquote>
`}html({text:n}){return n}def(n){return""}heading({tokens:n,depth:t}){return`<h${t}>${this.parser.parseInline(n)}</h${t}>
`}hr(n){return`<hr>
`}list(n){let{ordered:t,start:e}=n,a="";for(let i=0;i<n.items.length;i++){let r=n.items[i];a+=this.listitem(r)}let o=t?"ol":"ul",s=t&&e!==1?' start="'+e+'"':"";return"<"+o+s+`>
`+a+"</"+o+`>
`}listitem(n){let t="";if(n.task){let e=this.checkbox({checked:!!n.checked});n.loose?n.tokens[0]?.type==="paragraph"?(n.tokens[0].text=e+" "+n.tokens[0].text,n.tokens[0].tokens&&n.tokens[0].tokens.length>0&&n.tokens[0].tokens[0].type==="text"&&(n.tokens[0].tokens[0].text=e+" "+F(n.tokens[0].tokens[0].text),n.tokens[0].tokens[0].escaped=!0)):n.tokens.unshift({type:"text",raw:e+" ",text:e+" ",escaped:!0}):t+=e+" "}return t+=this.parser.parse(n.tokens,!!n.loose),`<li>${t}</li>
`}checkbox({checked:n}){return"<input "+(n?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:n}){return`<p>${this.parser.parseInline(n)}</p>
`}table(n){let t="",e="";for(let o=0;o<n.header.length;o++)e+=this.tablecell(n.header[o]);t+=this.tablerow({text:e});let a="";for(let o=0;o<n.rows.length;o++){let s=n.rows[o];e="";for(let i=0;i<s.length;i++)e+=this.tablecell(s[i]);a+=this.tablerow({text:e})}return a&&(a=`<tbody>${a}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+a+`</table>
`}tablerow({text:n}){return`<tr>
${n}</tr>
`}tablecell(n){let t=this.parser.parseInline(n.tokens),e=n.header?"th":"td";return(n.align?`<${e} align="${n.align}">`:`<${e}>`)+t+`</${e}>
`}strong({tokens:n}){return`<strong>${this.parser.parseInline(n)}</strong>`}em({tokens:n}){return`<em>${this.parser.parseInline(n)}</em>`}codespan({text:n}){return`<code>${F(n,!0)}</code>`}br(n){return"<br>"}del({tokens:n}){return`<del>${this.parser.parseInline(n)}</del>`}link({href:n,title:t,tokens:e}){let a=this.parser.parseInline(e),o=bo(n);if(o===null)return a;n=o;let s='<a href="'+n+'"';return t&&(s+=' title="'+F(t)+'"'),s+=">"+a+"</a>",s}image({href:n,title:t,text:e,tokens:a}){a&&(e=this.parser.parseInline(a,this.parser.textRenderer));let o=bo(n);if(o===null)return F(e);n=o;let s=`<img src="${n}" alt="${e}"`;return t&&(s+=` title="${F(t)}"`),s+=">",s}text(n){return"tokens"in n&&n.tokens?this.parser.parseInline(n.tokens):("escaped"in n)&&n.escaped?n.text:F(n.text)}},De=class{strong({text:n}){return n}em({text:n}){return n}codespan({text:n}){return n}del({text:n}){return n}html({text:n}){return n}text({text:n}){return n}link({text:n}){return""+n}image({text:n}){return""+n}br(){return""}},R=class n{options;renderer;textRenderer;constructor(t){this.options=t||vn,this.options.renderer=this.options.renderer||new It,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new De}static parse(t,e){return new n(e).parse(t)}static parseInline(t,e){return new n(e).parseInline(t)}parse(t,e=!0){let a="";for(let o=0;o<t.length;o++){let s=t[o];if(this.options.extensions?.renderers?.[s.type]){let r=s,l=this.options.extensions.renderers[r.type].call({parser:this},r);if(l!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(r.type)){a+=l||"";continue}}let i=s;switch(i.type){case"space":{a+=this.renderer.space(i);continue}case"hr":{a+=this.renderer.hr(i);continue}case"heading":{a+=this.renderer.heading(i);continue}case"code":{a+=this.renderer.code(i);continue}case"table":{a+=this.renderer.table(i);continue}case"blockquote":{a+=this.renderer.blockquote(i);continue}case"list":{a+=this.renderer.list(i);continue}case"html":{a+=this.renderer.html(i);continue}case"def":{a+=this.renderer.def(i);continue}case"paragraph":{a+=this.renderer.paragraph(i);continue}case"text":{let r=i,l=this.renderer.text(r);for(;o+1<t.length&&t[o+1].type==="text";)r=t[++o],l+=`
`+this.renderer.text(r);e?a+=this.renderer.paragraph({type:"paragraph",raw:l,text:l,tokens:[{type:"text",raw:l,text:l,escaped:!0}]}):a+=l;continue}default:{let r='Token with "'+i.type+'" type was not found.';if(this.options.silent)return console.error(r),"";throw Error(r)}}}return a}parseInline(t,e=this.renderer){let a="";for(let o=0;o<t.length;o++){let s=t[o];if(this.options.extensions?.renderers?.[s.type]){let r=this.options.extensions.renderers[s.type].call({parser:this},s);if(r!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(s.type)){a+=r||"";continue}}let i=s;switch(i.type){case"escape":{a+=e.text(i);break}case"html":{a+=e.html(i);break}case"link":{a+=e.link(i);break}case"image":{a+=e.image(i);break}case"strong":{a+=e.strong(i);break}case"em":{a+=e.em(i);break}case"codespan":{a+=e.codespan(i);break}case"br":{a+=e.br(i);break}case"del":{a+=e.del(i);break}case"text":{a+=e.text(i);break}default:{let r='Token with "'+i.type+'" type was not found.';if(this.options.silent)return console.error(r),"";throw Error(r)}}}return a}},Qn=class{options;block;constructor(n){this.options=n||vn}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens","emStrongMask"]);static passThroughHooksRespectAsync=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(n){return n}postprocess(n){return n}processAllTokens(n){return n}emStrongMask(n){return n}provideLexer(){return this.block?_.lex:_.lexInline}provideParser(){return this.block?R.parse:R.parseInline}},er=class{defaults=Se();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=R;Renderer=It;TextRenderer=De;Lexer=_;Tokenizer=Tt;Hooks=Qn;constructor(...n){this.use(...n)}walkTokens(n,t){let e=[];for(let a of n)switch(e=e.concat(t.call(this,a)),a.type){case"table":{let o=a;for(let s of o.header)e=e.concat(this.walkTokens(s.tokens,t));for(let s of o.rows)for(let i of s)e=e.concat(this.walkTokens(i.tokens,t));break}case"list":{let o=a;e=e.concat(this.walkTokens(o.items,t));break}default:{let o=a;this.defaults.extensions?.childTokens?.[o.type]?this.defaults.extensions.childTokens[o.type].forEach((s)=>{let i=o[s].flat(1/0);e=e.concat(this.walkTokens(i,t))}):o.tokens&&(e=e.concat(this.walkTokens(o.tokens,t)))}}return e}use(...n){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return n.forEach((e)=>{let a={...e};if(a.async=this.defaults.async||a.async||!1,e.extensions&&(e.extensions.forEach((o)=>{if(!o.name)throw Error("extension name required");if("renderer"in o){let s=t.renderers[o.name];s?t.renderers[o.name]=function(...i){let r=o.renderer.apply(this,i);return r===!1&&(r=s.apply(this,i)),r}:t.renderers[o.name]=o.renderer}if("tokenizer"in o){if(!o.level||o.level!=="block"&&o.level!=="inline")throw Error("extension level must be 'block' or 'inline'");let s=t[o.level];s?s.unshift(o.tokenizer):t[o.level]=[o.tokenizer],o.start&&(o.level==="block"?t.startBlock?t.startBlock.push(o.start):t.startBlock=[o.start]:o.level==="inline"&&(t.startInline?t.startInline.push(o.start):t.startInline=[o.start]))}"childTokens"in o&&o.childTokens&&(t.childTokens[o.name]=o.childTokens)}),a.extensions=t),e.renderer){let o=this.defaults.renderer||new It(this.defaults);for(let s in e.renderer){if(!(s in o))throw Error(`renderer '${s}' does not exist`);if(["options","parser"].includes(s))continue;let i=s,r=e.renderer[i],l=o[i];o[i]=(...c)=>{let h=r.apply(o,c);return h===!1&&(h=l.apply(o,c)),h||""}}a.renderer=o}if(e.tokenizer){let o=this.defaults.tokenizer||new Tt(this.defaults);for(let s in e.tokenizer){if(!(s in o))throw Error(`tokenizer '${s}' does not exist`);if(["options","rules","lexer"].includes(s))continue;let i=s,r=e.tokenizer[i],l=o[i];o[i]=(...c)=>{let h=r.apply(o,c);return h===!1&&(h=l.apply(o,c)),h}}a.tokenizer=o}if(e.hooks){let o=this.defaults.hooks||new Qn;for(let s in e.hooks){if(!(s in o))throw Error(`hook '${s}' does not exist`);if(["options","block"].includes(s))continue;let i=s,r=e.hooks[i],l=o[i];Qn.passThroughHooks.has(s)?o[i]=(c)=>{if(this.defaults.async&&Qn.passThroughHooksRespectAsync.has(s))return(async()=>{let u=await r.call(o,c);return l.call(o,u)})();let h=r.call(o,c);return l.call(o,h)}:o[i]=(...c)=>{if(this.defaults.async)return(async()=>{let u=await r.apply(o,c);return u===!1&&(u=await l.apply(o,c)),u})();let h=r.apply(o,c);return h===!1&&(h=l.apply(o,c)),h}}a.hooks=o}if(e.walkTokens){let o=this.defaults.walkTokens,s=e.walkTokens;a.walkTokens=function(i){let r=[];return r.push(s.call(this,i)),o&&(r=r.concat(o.call(this,i))),r}}this.defaults={...this.defaults,...a}}),this}setOptions(n){return this.defaults={...this.defaults,...n},this}lexer(n,t){return _.lex(n,t??this.defaults)}parser(n,t){return R.parse(n,t??this.defaults)}parseMarkdown(n){return(t,e)=>{let a={...e},o={...this.defaults,...a},s=this.onError(!!o.silent,!!o.async);if(this.defaults.async===!0&&a.async===!1)return s(Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof t>"u"||t===null)return s(Error("marked(): input parameter is undefined or null"));if(typeof t!="string")return s(Error("marked(): input parameter is of type "+Object.prototype.toString.call(t)+", string expected"));if(o.hooks&&(o.hooks.options=o,o.hooks.block=n),o.async)return(async()=>{let i=o.hooks?await o.hooks.preprocess(t):t,r=await(o.hooks?await o.hooks.provideLexer():n?_.lex:_.lexInline)(i,o),l=o.hooks?await o.hooks.processAllTokens(r):r;o.walkTokens&&await Promise.all(this.walkTokens(l,o.walkTokens));let c=await(o.hooks?await o.hooks.provideParser():n?R.parse:R.parseInline)(l,o);return o.hooks?await o.hooks.postprocess(c):c})().catch(s);try{o.hooks&&(t=o.hooks.preprocess(t));let i=(o.hooks?o.hooks.provideLexer():n?_.lex:_.lexInline)(t,o);o.hooks&&(i=o.hooks.processAllTokens(i)),o.walkTokens&&this.walkTokens(i,o.walkTokens);let r=(o.hooks?o.hooks.provideParser():n?R.parse:R.parseInline)(i,o);return o.hooks&&(r=o.hooks.postprocess(r)),r}catch(i){return s(i)}}}onError(n,t){return(e)=>{if(e.message+=`
Please report this to https://github.com/markedjs/marked.`,n){let a="<p>An error occurred:</p><pre>"+F(e.message+"",!0)+"</pre>";return t?Promise.resolve(a):a}if(t)return Promise.reject(e);throw e}}},fn=new er;function x(n,t){return fn.parse(n,t)}x.options=x.setOptions=function(n){return fn.setOptions(n),x.defaults=fn.defaults,fo(x.defaults),x};x.getDefaults=Se;x.defaults=vn;x.use=function(...n){return fn.use(...n),x.defaults=fn.defaults,fo(x.defaults),x};x.walkTokens=function(n,t){return fn.walkTokens(n,t)};x.parseInline=fn.parseInline;x.Parser=R;x.parser=R.parse;x.Renderer=It;x.TextRenderer=De;x.Lexer=_;x.lexer=_.lex;x.Tokenizer=Tt;x.Hooks=Qn;x.parse=x;var{options:Gl,setOptions:$l,use:Kl,walkTokens:Zl,parseInline:Ql}=x;var nd=R.parse,td=_.lex;var{getPrototypeOf:ld,defineProperty:ar,getOwnPropertyNames:dd}=Object;var or=(n,t)=>{for(var e in t)ar(n,e,{get:t[e],enumerable:!0,configurable:!0,set:(a)=>t[e]=()=>a})},cd=((n)=>lt)(function(n){return lt.apply(this,arguments)}),Ae={};class zn extends b{static set conditions(n){Object.assign(Ae,n);for(let t of[...zn.instances])t.queueRender()}condition="";not=!1;static instances=new Set;constructor(){super();this.initAttributes("condition","not")}connectedCallback(){super.connectedCallback(),zn.instances.add(this)}disconnectedCallback(){super.disconnectedCallback(),zn.instances.delete(this)}render(){if(this.condition!==""&&(this.not?Ae[this.condition]!==!0:Ae[this.condition]===!0))this.toggleAttribute("hidden",!1);else this.toggleAttribute("hidden",!0)}}var sr=zn.elementCreator({tag:"xin-ab"}),Pt={};function Cn(n,t){if(Pt[n]===void 0){if(t!==void 0){let a=globalThis[t];Pt[n]=Promise.resolve({[t]:a})}let e=m.script({src:n});document.head.append(e),Pt[n]=new Promise((a)=>{e.onload=()=>a(globalThis)})}return Pt[n]}var Oe={};function Jo(n){if(Oe[n]===void 0){let t=m.link({rel:"stylesheet",type:"text/css",href:n});document.head.append(t),Oe[n]=new Promise((e)=>{t.onload=e})}return Oe[n]}var zt={earth:'<svg class="color" viewBox="0 0 48 48"><g><g><g><path style="fill:#a3d9ff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M7,13.46 C5.10,16.52,4,20.13,4,24 C4,31.81,8.47,38.57,15,41.87 C15,41.87,15,31,15,31 C15,31,9,29,9,29 C9,29,9,19,9,19 C9,19,7,15,7,15 C7,15,7,13.46,7,13.46 z"/><path style="fill:#a3d9ff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M18.40,4.79 C20.18,4.28,22.06,4,24,4 C27.57,4,30.92,4.93,33.82,6.57 C33.82,6.57,29,13,29,13 C29,13,31,19,31,19 C31,19,37,21,37,21 C37,21,39,29,39,29 C39,29,37.35,38.89,37.35,38.89 C33.81,42.07,29.13,44,24,44 C21.03,44,18.22,43.35,15.69,42.20 C15.69,42.20,27,29,27,29 C27,29,27,25,27,25 C27,25,21,23,21,23 C21,23,15,19,15,19 C15,19,11,19,11,19 C11,19,11,13,11,13 C11,13,13,11,13,11 C13,11,15,15,15,15 C15,15,17,15,17,15 C17,15,17,9,17,9 C17,9,18.40,4.79,18.40,4.79 z"/><path style="fill:#274e42;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M18.40,4.79 C18.40,4.79,17,9,17,9 C17,9,17,15,17,15 C17,15,15,15,15,15 C15,15,13,11,13,11 C13,11,11,13,11,13 C11,13,11,19,11,19 C11,19,15,19,15,19 C15,19,21,23,21,23 C21,23,27,25,27,25 C27,25,27,29,27,29 C27,29,15.69,42.20,15.69,42.20 C15.46,42.09,15.23,41.98,15,41.87 C15,41.87,15,31,15,31 C15,31,9,29,9,29 C9,29,9,19,9,19 C9,19,7,15,7,15 C7,15,7,13.46,7,13.46 C9.57,9.32,13.62,6.19,18.40,4.79 z"/><path style="fill:#274e42;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M33.82,6.57 C33.82,6.57,29,13,29,13 C29,13,31,19,31,19 C31,19,37,21,37,21 C37,21,39,29,39,29 C39,29,37.35,38.89,37.35,38.89 C41.43,35.23,44,29.91,44,24 C44,16.52,39.90,10.00,33.82,6.57 z"/></g></g></g></svg> ',blueprint:'<svg class="color" viewBox="0 0 24 24"><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10.5,14.5 C10.5,14.5,7.5,15.5,7.5,17.5 C7.5,19.5,10.5,19.5,10.5,19.5"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M18.50,14.5 C18.50,14.5,21.50,15.5,21.50,17.5 C21.50,19.5,18.50,19.5,18.50,19.5"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M7,5.09 C7,3.94,7.90,3,9,3 C9,3,20,3,20,3 C21.10,3,22,3.94,22,5.09 C22,5.09,22,12.41,22,12.41 C22,13.56,21.10,14.5,20,14.5 C20,14.5,9,14.5,9,14.5 C7.90,14.5,7,13.56,7,12.41 C7,12.41,7,5.09,7,5.09 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M14.5,5.5 C14.5,5.5,14.5,11.5,14.5,11.5"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M16.5,7.5 C16.5,7.5,16.5,8.5,16.5,8.5"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.5,7.5 C12.5,7.5,12.5,8.5,12.5,8.5"/><g/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M18.5,21.5 C18.5,21.5,17.5,20.5,17.5,20.5 C17.5,20.5,16.5,21.5,16.5,21.5"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.5,21.5 C12.5,21.5,11.5,20.5,11.5,20.5 C11.5,20.5,10.5,21.5,10.5,21.5"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10.5,14.5 C10.5,14.5,18.5,14.5,18.5,14.5 C18.5,14.5,18.5,19.5,18.5,19.5 C18.5,19.5,10.5,19.5,10.5,19.5 C10.5,19.5,10.5,14.5,10.5,14.5 z"/><g><g><path style="fill:#5e78ca;fill-rule:nonzero;stroke:#f2f2f2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M14,16.5 C14,16.5,16,16.5,16,16.5 C16,16.5,14.53,19.5,14.53,19.5"/><path style="fill:#5e78ca;fill-rule:evenodd;stroke:none;" d="M3.59,8.5 C3.59,8.5,12.59,8.5,12.59,8.5 C12.59,8.5,14.53,19.5,14.53,19.5 C14.53,19.5,5.53,19.5,5.53,19.5 C5.53,19.5,3.59,8.5,3.59,8.5 z"/><path style="fill:#5e78ca;fill-rule:nonzero;stroke:#f2f2f2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.59,8.5 C12.59,8.5,11.12,11.5,11.12,11.5 C11.12,11.5,2.12,11.5,2.12,11.5 C2.12,11.5,3.59,8.5,3.59,8.5"/><path style="fill:#5e78ca;fill-rule:nonzero;stroke:#f2f2f2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.59,8.5 C12.59,8.5,14.53,19.5,14.53,19.5"/><path style="fill:#5e78ca;fill-rule:nonzero;stroke:#f2f2f2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M4.12,11.5 C4.12,11.5,5.53,19.5,5.53,19.5"/></g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M9.24,12.5 C10.75,12.5,12.20,13.73,12.46,15.24 C12.46,15.24,12.46,15.24,12.46,15.24 C12.68,16.49,11.85,17.5,10.60,17.5 C10.60,17.5,10.55,17.5,10.55,17.5 C10.17,17.5,9.92,17.81,9.98,18.19 C9.98,18.19,9.98,18.19,9.98,18.19 C10.21,19.47,9.36,20.5,8.08,20.5 C8.08,20.5,6.39,20.5,6.39,20.5 C5.10,20.5,3.87,19.45,3.64,18.16 C3.64,18.16,3.12,15.21,3.12,15.21 C2.86,13.71,3.86,12.5,5.35,12.5 C5.35,12.5,9.24,12.5,9.24,12.5 z"/></g></g></svg> ',tosiXr:'<svg class="color" viewBox="0 0 24 24"><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M8.00,14.25 C8.00,14.25,5.00,15.25,5.00,17.25 C5.00,19.25,8.00,19.25,8.00,19.25"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M16.00,14.25 C16.00,14.25,19.00,15.25,19.00,17.25 C19.00,19.25,16.00,19.25,16.00,19.25"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M4.50,4.85 C4.50,3.69,5.40,2.75,6.50,2.75 C6.50,2.75,17.50,2.75,17.50,2.75 C18.61,2.75,19.50,3.69,19.50,4.85 C19.50,4.85,19.50,12.16,19.50,12.16 C19.50,13.32,18.61,14.25,17.50,14.25 C17.50,14.25,6.50,14.25,6.50,14.25 C5.40,14.25,4.50,13.32,4.50,12.16 C4.50,12.16,4.50,4.85,4.50,4.85 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.00,5.25 C12.00,5.25,12.00,11.25,12.00,11.25"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M14.00,7.25 C14.00,7.25,14.00,8.25,14.00,8.25"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10.00,7.25 C10.00,7.25,10.00,8.25,10.00,8.25"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M16.00,21.25 C16.00,21.25,15.00,20.25,15.00,20.25 C15.00,20.25,14.00,21.25,14.00,21.25"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10.00,21.25 C10.00,21.25,9.00,20.25,9.00,20.25 C9.00,20.25,8.00,21.25,8.00,21.25"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M8.00,14.25 C8.00,14.25,16.00,14.25,16.00,14.25 C16.00,14.25,16.00,19.25,16.00,19.25 C16.00,19.25,8.00,19.25,8.00,19.25 C8.00,19.25,8.00,14.25,8.00,14.25 z"/><path style="fill:#ff7bac;fill-opacity:0.75;fill-rule:evenodd;stroke:#000000;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-width:1;" d="M12.00,4.00 C12.00,4,11.99,4,11.99,4 C6.19,4,3,4.73,3,8.50 C3,11.39,4.66,13.00,7.27,13 C9.88,13.00,10.68,11.13,11.99,11.13 C11.99,11.13,12.00,11.13,12,11.13 C12.00,11.13,12.01,11.13,12.01,11.13 C13.32,11.13,14.12,13.00,16.73,13 C19.34,13.00,21,11.39,21,8.50 C21,4.73,17.81,4,12.01,4 C12.01,4,12.00,4,12.00,4.00 C12.00,4.00,12.00,4.00,12.00,4.00 z"/></g></svg> ',cmy:'<svg class="color filled" viewBox="0 0 24 24"><g><g><path style="fill:#00ff00;fill-rule:evenodd;" d="M12.00,10.88 C10.90,10.01,9.51,9.5,8.00,9.5 C7.22,9.5,6.47,9.64,5.78,9.89 C6.37,11.85,7.87,13.42,9.78,14.11 C10.17,12.81,10.96,11.69,12.00,10.88 z"/><path style="fill:#0000ff;fill-rule:evenodd;" d="M12.00,10.88 C13.10,10.01,14.49,9.5,16,9.5 C16.78,9.5,17.53,9.64,18.22,9.89 C17.63,11.85,16.13,13.42,14.22,14.11 C13.83,12.81,13.04,11.69,12.00,10.88 C12.00,10.88,12.00,10.88,12.00,10.88 z"/><path style="fill:#000000;fill-rule:evenodd;" d="M9.78,14.11 C10.17,12.81,10.96,11.69,12.00,10.88 C13.04,11.69,13.83,12.81,14.22,14.11 C13.53,14.36,12.78,14.5,12,14.5 C11.22,14.5,10.47,14.36,9.78,14.11 C9.78,14.11,9.78,14.11,9.78,14.11 z"/><path style="fill:#ff0000;fill-rule:evenodd;" d="M9.78,14.11 C9.60,14.71,9.5,15.34,9.5,16 C9.5,18.08,10.48,19.93,12.00,21.12 C13.52,19.93,14.50,18.08,14.50,16 C14.50,15.34,14.40,14.71,14.22,14.11 C13.53,14.36,12.78,14.5,12,14.5 C11.22,14.5,10.47,14.36,9.78,14.11 C9.78,14.11,9.78,14.11,9.78,14.11 z"/><path style="fill:#02fefe;fill-rule:evenodd;" d="M5.78,9.89 C5.60,9.29,5.5,8.66,5.5,8 C5.5,4.41,8.41,1.5,12,1.5 C15.59,1.5,18.5,4.41,18.5,8 C18.5,8.66,18.40,9.29,18.22,9.89 C17.53,9.64,16.78,9.5,16,9.5 C14.49,9.5,13.10,10.01,12.00,10.88 C10.90,10.01,9.51,9.5,8.00,9.5 C7.22,9.5,6.47,9.64,5.78,9.89 C5.78,9.89,5.78,9.89,5.78,9.89 z"/><path style="fill:#fffe00;fill-rule:evenodd;" d="M5.78,9.89 C3.28,10.80,1.50,13.19,1.50,16 C1.50,19.59,4.41,22.5,8.00,22.5 C9.51,22.5,10.90,21.99,12.00,21.12 C10.48,19.93,9.5,18.08,9.5,16 C9.5,15.34,9.60,14.71,9.78,14.11 C7.87,13.42,6.37,11.85,5.78,9.89 C5.78,9.89,5.78,9.89,5.78,9.89 z"/><path style="fill:#ff00ff;fill-rule:evenodd;" d="M18.22,9.89 C20.72,10.80,22.5,13.19,22.5,16 C22.5,19.59,19.59,22.5,16,22.5 C14.49,22.5,13.10,21.99,12.00,21.12 C13.52,19.93,14.50,18.08,14.50,16 C14.50,15.34,14.40,14.71,14.22,14.11 C16.13,13.42,17.63,11.85,18.22,9.89 z"/></g></g></svg> ',rgb:'<svg class="color filled" viewBox="0 0 24 24"><g><g><path style="fill:#ff00ff;fill-rule:evenodd;" d="M12.00,10.88 C10.90,10.01,9.51,9.5,8.00,9.5 C7.22,9.5,6.47,9.64,5.78,9.89 C6.37,11.85,7.87,13.42,9.78,14.11 C10.17,12.81,10.96,11.69,12.00,10.88 z"/><path style="fill:#ffff00;fill-rule:evenodd;" d="M12.00,10.88 C13.10,10.01,14.49,9.5,16,9.5 C16.78,9.5,17.53,9.64,18.22,9.89 C17.63,11.85,16.13,13.42,14.22,14.11 C13.83,12.81,13.04,11.69,12.00,10.88 C12.00,10.88,12.00,10.88,12.00,10.88 z"/><path style="fill:#ffffff;fill-rule:evenodd;" d="M9.78,14.11 C10.17,12.81,10.96,11.69,12.00,10.88 C13.04,11.69,13.83,12.81,14.22,14.11 C13.53,14.36,12.78,14.5,12,14.5 C11.22,14.5,10.47,14.36,9.78,14.11 C9.78,14.11,9.78,14.11,9.78,14.11 z"/><path style="fill:#00ffff;fill-rule:evenodd;" d="M9.78,14.11 C9.60,14.71,9.5,15.34,9.5,16 C9.5,18.08,10.48,19.93,12.00,21.12 C13.52,19.93,14.50,18.08,14.50,16 C14.50,15.34,14.40,14.71,14.22,14.11 C13.53,14.36,12.78,14.5,12,14.5 C11.22,14.5,10.47,14.36,9.78,14.11 C9.78,14.11,9.78,14.11,9.78,14.11 z"/><path style="fill:#ff0000;fill-rule:evenodd;" d="M5.78,9.89 C5.60,9.29,5.5,8.66,5.5,8 C5.5,4.41,8.41,1.5,12,1.5 C15.59,1.5,18.5,4.41,18.5,8 C18.5,8.66,18.40,9.29,18.22,9.89 C17.53,9.64,16.78,9.5,16,9.5 C14.49,9.5,13.10,10.01,12.00,10.88 C10.90,10.01,9.51,9.5,8.00,9.5 C7.22,9.5,6.47,9.64,5.78,9.89 C5.78,9.89,5.78,9.89,5.78,9.89 z"/><path style="fill:#0000ff;fill-rule:evenodd;" d="M5.78,9.89 C3.28,10.80,1.50,13.19,1.50,16 C1.50,19.59,4.41,22.5,8.00,22.5 C9.51,22.5,10.90,21.99,12.00,21.12 C10.48,19.93,9.5,18.08,9.5,16 C9.5,15.34,9.60,14.71,9.78,14.11 C7.87,13.42,6.37,11.85,5.78,9.89 C5.78,9.89,5.78,9.89,5.78,9.89 z"/><path style="fill:#00ff00;fill-rule:evenodd;" d="M18.22,9.89 C20.72,10.80,22.5,13.19,22.5,16 C22.5,19.59,19.59,22.5,16,22.5 C14.49,22.5,13.10,21.99,12.00,21.12 C13.52,19.93,14.50,18.08,14.50,16 C14.50,15.34,14.40,14.71,14.22,14.11 C16.13,13.42,17.63,11.85,18.22,9.89 z"/></g></g></svg> ',xrColor:'<svg class="color filled" viewBox="0 0 40 24"><g><g><g><path style="fill:#000000;fill-rule:evenodd;" d="M20.00,2.00 C19.99,2.00,19.98,2,19.98,2 C8.39,2,2,3.61,2,12.00 C2,18.41,5.32,22.00,10.54,22 C15.77,22.00,17.37,17.85,19.98,17.85 C19.98,17.85,19.99,17.85,20,17.85 C20.01,17.85,20.02,17.85,20.02,17.85 C22.63,17.85,24.23,22.00,29.46,22 C34.68,22.00,38,18.41,38,12.00 C38,3.61,31.61,2,20.02,2 C20.02,2,20.01,2.00,20.00,2.00 C20.00,2.00,20.00,2.00,20.00,2.00 z"/></g><path style="fill:#fbed21;fill-rule:evenodd;" d="M12.20,19.84 C15.79,19.39,17.07,16.46,19.07,16.46 C19.07,16.46,19.08,16.46,19.09,16.46 C19.09,16.46,19.10,16.46,19.11,16.46 C19.44,16.46,19.75,16.54,20.06,16.68 C20.37,16.54,20.68,16.46,21.01,16.46 C21.02,16.46,21.02,16.46,21.03,16.46 C21.04,16.46,21.04,16.46,21.05,16.46 C23.05,16.46,24.33,19.39,27.92,19.84 C31.66,19.40,33.98,16.50,33.98,11.62 C33.98,4.91,29.04,3.44,20.06,3.35 C11.07,3.44,6.14,4.91,6.14,11.62 C6.14,16.50,8.46,19.40,12.20,19.84 z"/><path style="fill:#8cc63f;fill-rule:evenodd;" d="M12.20,19.84 C12.52,19.87,12.86,19.89,13.21,19.89 C16.86,19.89,18.37,17.43,20.06,16.68 C19.75,16.54,19.44,16.46,19.11,16.46 C19.10,16.46,19.09,16.46,19.09,16.46 C19.08,16.46,19.07,16.46,19.07,16.46 C17.07,16.46,15.79,19.39,12.20,19.84 z"/><path style="fill:#8cc63f;fill-rule:evenodd;" d="M20.06,3.35 C20.37,3.35,20.69,3.35,21.01,3.35 C21.02,3.35,21.02,3.35,21.03,3.35 C21.03,3.35,21.03,3.35,21.03,3.35 C21.04,3.35,21.04,3.35,21.05,3.35 C30.64,3.35,35.92,4.68,35.92,11.62 C35.92,16.92,33.18,19.89,28.86,19.89 C28.53,19.89,28.22,19.87,27.92,19.84 C31.66,19.40,33.98,16.50,33.98,11.62 C33.98,4.91,29.04,3.44,20.06,3.35 C20.06,3.35,20.06,3.35,20.06,3.35 z"/><path style="fill:#ff1c23;fill-rule:evenodd;" d="M20.06,16.68 C21.74,17.43,23.25,19.89,26.91,19.89 C27.26,19.89,27.59,19.87,27.92,19.84 C24.33,19.39,23.05,16.46,21.05,16.46 C21.04,16.46,21.04,16.46,21.03,16.46 C21.02,16.46,21.02,16.46,21.01,16.46 C20.68,16.46,20.37,16.54,20.06,16.68 z"/><path style="fill:#ff1c23;fill-rule:evenodd;" d="M12.20,19.84 C11.90,19.87,11.59,19.89,11.26,19.89 C6.94,19.89,4.19,16.92,4.19,11.62 C4.19,4.68,9.48,3.35,19.07,3.35 C19.07,3.35,19.08,3.35,19.09,3.35 C19.09,3.35,19.09,3.35,19.09,3.35 C19.09,3.35,19.1,3.35,19.11,3.35 C19.43,3.35,19.75,3.35,20.06,3.35 C11.07,3.44,6.14,4.91,6.14,11.62 C6.14,16.50,8.46,19.40,12.20,19.84 z"/></g><g><path style="fill:#8cc63e;fill-rule:nonzero;" d="M22.55,8.63 C22.55,9.05,22.55,9.46,22.55,9.88 C22.54,10.25,22.85,10.56,23.20,10.55 C23.54,10.56,23.85,10.25,23.85,9.88 C23.85,9.46,23.85,9.05,23.85,8.63 C23.85,8.26,23.54,7.95,23.20,7.96 C22.85,7.95,22.54,8.26,22.55,8.63 z"/><path style="fill:#8cc63e;fill-rule:nonzero;" d="M17.32,8.63 C17.32,9.05,17.32,9.46,17.32,9.88 C17.31,10.25,17.62,10.56,17.97,10.55 C18.31,10.56,18.62,10.25,18.62,9.88 C18.62,9.46,18.62,9.05,18.62,8.63 C18.62,8.26,18.31,7.95,17.97,7.96 C17.62,7.95,17.31,8.26,17.32,8.63 z"/><path style="fill:#8cc63e;fill-rule:nonzero;" d="M19.99,4.39 C19.99,8.09,19.99,11.80,19.99,15.50 C19.99,15.87,20.30,16.18,20.64,16.17 C20.99,16.18,21.30,15.87,21.29,15.50 C21.29,11.80,21.29,8.09,21.29,4.39 C21.30,4.02,20.99,3.71,20.64,3.72 C20.30,3.71,19.99,4.02,19.99,4.39 z"/><path style="fill:#fe1a22;fill-rule:nonzero;" d="M21.43,8.63 C21.43,9.05,21.43,9.46,21.43,9.88 C21.42,10.25,21.73,10.56,22.08,10.55 C22.42,10.56,22.73,10.25,22.73,9.88 C22.73,9.46,22.73,9.05,22.73,8.63 C22.73,8.26,22.42,7.95,22.08,7.96 C21.73,7.95,21.42,8.26,21.43,8.63 z"/><path style="fill:#fe1a22;fill-rule:nonzero;" d="M16.20,8.63 C16.20,9.05,16.20,9.46,16.20,9.88 C16.19,10.25,16.50,10.56,16.85,10.55 C17.19,10.56,17.50,10.25,17.50,9.88 C17.50,9.46,17.50,9.05,17.50,8.63 C17.50,8.26,17.19,7.95,16.85,7.96 C16.50,7.95,16.19,8.26,16.20,8.63 z"/><path style="fill:#fe1a22;fill-rule:nonzero;" d="M18.87,4.39 C18.87,8.09,18.87,11.80,18.87,15.50 C18.87,15.87,19.18,16.18,19.52,16.17 C19.86,16.18,20.18,15.87,20.17,15.50 C20.17,11.80,20.17,8.09,20.17,4.39 C20.18,4.02,19.86,3.71,19.52,3.72 C19.18,3.71,18.87,4.02,18.87,4.39 z"/><path style="fill:#000000;fill-rule:nonzero;" d="M21.97,8.63 C21.97,9.05,21.97,9.46,21.97,9.88 C21.97,10.25,22.28,10.56,22.62,10.55 C22.97,10.56,23.28,10.25,23.27,9.88 C23.27,9.46,23.27,9.05,23.27,8.63 C23.28,8.26,22.97,7.95,22.62,7.96 C22.28,7.95,21.97,8.26,21.97,8.63 z"/><path style="fill:#000000;fill-rule:nonzero;" d="M16.74,8.63 C16.74,9.05,16.74,9.46,16.74,9.88 C16.74,10.25,17.05,10.56,17.39,10.55 C17.74,10.56,18.05,10.25,18.04,9.88 C18.04,9.46,18.04,9.05,18.04,8.63 C18.05,8.26,17.74,7.95,17.39,7.96 C17.05,7.95,16.74,8.26,16.74,8.63 z"/><path style="fill:#000000;fill-rule:nonzero;" d="M19.41,4.39 C19.41,8.09,19.41,11.80,19.41,15.50 C19.41,15.87,19.72,16.18,20.07,16.17 C20.41,16.18,20.72,15.87,20.72,15.50 C20.72,11.80,20.72,8.09,20.72,4.39 C20.72,4.02,20.41,3.71,20.07,3.72 C19.72,3.71,19.41,4.02,19.41,4.39 z"/></g></g></svg> ',tosiUi:'<svg class="color" viewBox="0 0 48 48"><g><g><g><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M3,33 C3,31.90,3.90,31,5,31 C5,31,43,31,43,31 C44.10,31,45,31.90,45,33 C45,33,45,43,45,43 C45,44.10,44.10,45,43,45 C43,45,5,45,5,45 C3.90,45,3,44.10,3,43 C3,43,3,33,3,33 z"/><g><path style="fill:#ffffff;fill-rule:evenodd;stroke:#ed247b;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M7,35 C7,35,7,36.34,7,38 C7,39.66,8.34,41,10,41 C11.66,41,13,39.66,13,38 C13,36.34,13,35,13,35"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#ed247b;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M17,35 C17,35,17,41,17,41"/></g><g><path style="fill:#ed247b;fill-rule:evenodd;stroke:none;" d="M38,33 C40.76,33,43,35.24,43,38 C43,40.76,40.76,43,38,43 C35.24,43,33,40.76,33,38 C33,35.24,35.24,33,38,33 z"/><path style="fill:#ed247b;fill-rule:nonzero;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M40,36 C40,36,36,40,36,40"/><path style="fill:#ed247b;fill-rule:nonzero;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M36,36 C36,36,40,40,40,40"/></g></g><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M15.97,21.01 C15.97,21.01,9.97,23.01,9.97,27.01 C9.97,31.01,15.97,31.01,15.97,31.01"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M31.97,21.01 C31.97,21.01,37.97,23.01,37.97,27.01 C37.97,31.01,31.97,31.01,31.97,31.01"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M31,33 C31,33,29.49,31,29.49,31 C29.49,31,27.97,33,27.97,33"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M19.97,33 C19.97,33,17.97,31,17.97,31 C17.97,31,15.97,33,15.97,33"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M15.97,21 C15.97,21,31.97,21,31.97,21 C31.97,21,31.97,31,31.97,31 C31.97,31,15.97,31,15.97,31 C15.97,31,15.97,21,15.97,21 z"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M9,7.18 C9,4.87,10.79,3,13.00,3 C13.00,3,35.02,3,35.02,3 C37.23,3,39.03,4.87,39.03,7.18 C39.03,7.18,39.03,21.82,39.03,21.82 C39.03,24.13,37.23,26,35.02,26 C35.02,26,13.00,26,13.00,26 C10.79,26,9,24.13,9,21.82 C9,21.82,9,7.18,9,7.18 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M24,11 C24,11,24,23,24,23"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M28,15 C28,15,28,17,28,17"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M20,15 C20,15,20,17,20,17"/></g></g></g></svg> ',tosiFavicon:'<svg class="color" viewBox="0 0 48 48"><g><g><path style="fill:#ed247b;fill-rule:evenodd;stroke:none;" d="M1,9 C1,4.58,4.58,1,9,1 C9,1,39,1,39,1 C43.42,1,47,4.58,47,9 C47,9,47,39,47,39 C47,43.42,43.42,47,39,47 C39,47,9,47,9,47 C4.58,47,1,43.42,1,39 C1,39,1,9,1,9 z"/><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M16,29 C16,29,10,31,10,35 C10,39,16,39,16,39"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M32.00,29 C32.00,29,38.00,31,38.00,35 C38.00,39,32.00,39,32.00,39"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M9,10.18 C9,7.87,10.79,6,13,6 C13,6,35,6,35,6 C37.21,6,39,7.87,39,10.18 C39,10.18,39,24.82,39,24.82 C39,27.13,37.21,29,35,29 C35,29,13,29,13,29 C10.79,29,9,27.13,9,24.82 C9,24.82,9,10.18,9,10.18 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M24,11 C24,11,24,23,24,23"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M28,15 C28,15,28,17,28,17"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M20,15 C20,15,20,17,20,17"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M32,43 C32,43,30,41,30,41 C30,41,28,43,28,43"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M20,43 C20,43,18,41,18,41 C18,41,16,43,16,43"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M16,29 C16,29,32,29,32,29 C32,29,32,39,32,39 C32,39,16,39,16,39 C16,39,16,29,16,29 z"/></g></g></g></svg> ',tosiPlatform:'<svg class="color" viewBox="0 0 48 48"><g><g><g><path style="fill:#3ea9f5;fill-rule:evenodd;stroke:none;" d="M23.97,47 C23.97,47,39,47,39,47 C43.42,47,47,43.42,47,39 C47,39,47,9,47,9 C47,4.58,43.42,1,39,1 C39,1,9,1,9,1 C4.58,1,1,4.58,1,9 C1,9,1,39,1,39 C1,41.64,2.28,43.98,4.25,45.44 C4.09,44.82,4,44.17,4,43.5 C4,39.36,7.36,36,11.5,36 C15.14,36,18.18,38.60,18.86,42.05 C19.07,42.02,19.28,42,19.5,42 C21.99,42,24,44.01,24,46.5 C24,46.67,23.99,46.84,23.97,47 z"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:none;" d="M4.25,45.44 C4.09,44.82,4,44.17,4,43.5 C4,39.36,7.36,36,11.5,36 C15.14,36,18.18,38.60,18.86,42.05 C19.07,42.02,19.28,42,19.5,42 C21.99,42,24,44.01,24,46.5 C24,46.67,23.99,46.84,23.97,47 C23.97,47,9,47,9,47 C7.22,47,5.58,46.42,4.25,45.44 z"/></g><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M35,35 C35,35,32.17,35,32.17,35 C32.17,35,32.17,37.83,32.17,37.83"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M31,39 C31,39,28.17,39,28.17,39 C28.17,39,28.17,41.83,28.17,41.83"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M7.48,16 C4.45,16,2,18.45,2,21.48 C2,21.48,2,21.48,2,21.48 C2,23.98,4.02,26,6.52,26 C6.52,26,6.62,26,6.62,26 C7.38,26,8,26.62,8,27.38 C8,27.38,8,27.38,8,27.38 C8,29.93,10.07,32,12.62,32 C12.62,32,16,32,16,32 C18.58,32,20.68,29.91,20.68,27.32 C20.68,27.32,20.68,21.42,20.68,21.42 C20.68,18.43,18.25,16,15.26,16 C15.26,16,7.48,16,7.48,16 z"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M17,29 C17,29,33,29,33,29 C33,29,33,29,33,29 C33,34.52,28.52,39,23,39 C23,39,23,39,23,39 C19.69,39,17,36.31,17,33 C17,33,17,29,17,29 z"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M40.52,16 C43.55,16,46,18.45,46,21.48 C46,21.48,46,21.48,46,21.48 C46,23.98,43.98,26,41.48,26 C41.48,26,41.38,26,41.38,26 C40.62,26,40,26.62,40,27.38 C40,27.38,40,27.38,40,27.38 C40,29.93,37.93,32,35.38,32 C35.38,32,32,32,32,32 C29.42,32,27.32,29.91,27.32,27.32 C27.32,27.32,27.32,21.42,27.32,21.42 C27.32,18.43,29.75,16,32.74,16 C32.74,16,40.52,16,40.52,16 z"/><g><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M6,10.18 C6,7.87,7.79,6,10,6 C10,6,32,6,32,6 C34.21,6,36,7.87,36,10.18 C36,10.18,36,24.82,36,24.82 C36,27.13,34.21,29,32,29 C32,29,10,29,10,29 C7.79,29,6,27.13,6,24.82 C6,24.82,6,10.18,6,10.18 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M21,11 C21,11,21,23,21,23"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M25,15 C25,15,25,17,25,17"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2;" d="M17,15 C17,15,17,17,17,17"/></g></g></g></svg> ',tosi:'<svg class="color" viewBox="0 0 24 24"><g><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M8.00,14.25 C8.00,14.25,5.00,15.25,5.00,17.25 C5.00,19.25,8.00,19.25,8.00,19.25"/><path style="fill:#9e9e9e;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M16.00,14.25 C16.00,14.25,19.00,15.25,19.00,17.25 C19.00,19.25,16.00,19.25,16.00,19.25"/><path style="fill:#ffffff;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M4.50,4.85 C4.50,3.69,5.40,2.75,6.50,2.75 C6.50,2.75,17.50,2.75,17.50,2.75 C18.61,2.75,19.50,3.69,19.50,4.85 C19.50,4.85,19.50,12.16,19.50,12.16 C19.50,13.32,18.61,14.25,17.50,14.25 C17.50,14.25,6.50,14.25,6.50,14.25 C5.40,14.25,4.50,13.32,4.50,12.16 C4.50,12.16,4.50,4.85,4.50,4.85 z"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M12.00,5.25 C12.00,5.25,12.00,11.25,12.00,11.25"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M14.00,7.25 C14.00,7.25,14.00,8.25,14.00,8.25"/><path style="fill:#ffffff;fill-rule:nonzero;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10.00,7.25 C10.00,7.25,10.00,8.25,10.00,8.25"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M16.00,21.25 C16.00,21.25,15.00,20.25,15.00,20.25 C15.00,20.25,14.00,21.25,14.00,21.25"/><path style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M10.00,21.25 C10.00,21.25,9.00,20.25,9.00,20.25 C9.00,20.25,8.00,21.25,8.00,21.25"/><path style="fill:#e4e4e4;fill-rule:evenodd;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:1;" d="M8.00,14.25 C8.00,14.25,16.00,14.25,16.00,14.25 C16.00,14.25,16.00,19.25,16.00,19.25 C16.00,19.25,8.00,19.25,8.00,19.25 C8.00,19.25,8.00,14.25,8.00,14.25 z"/></g></svg> ',sortDescending:'<svg class="stroked" viewBox="0 0 24 24"><g><path d="M16.5,14.5 C16.5,14.5,7.5,14.5,7.5,14.5"/><path d="M14.5,18.5 C14.5,18.5,9.5,18.5,9.5,18.5"/><path d="M18.5,10.5 C18.5,10.5,5.5,10.5,5.5,10.5"/><path d="M20.5,6.5 C20.5,6.5,3.5,6.5,3.5,6.5"/></g></svg> ',columns:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path></svg>',underline:'<svg class="stroked" viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>',grid:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',triangle:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>',search:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',volume2:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',arrowUpCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>',pauseCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>',checkSquare:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',arrowDown:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>',figma:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path></svg>',cornerRightUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="10 9 15 4 20 9"></polyline><path d="M4 20h7a4 4 0 0 0 4-4V4"></path></svg>',chevronsRight:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>',list:'<svg class="stroked" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',chevronsDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>',wind:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>',cornerUpRight:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="15 14 20 9 15 4"></polyline><path d="M4 20v-7a4 4 0 0 1 4-4h12"></path></svg>',target:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',scissors:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>',minimize2:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>',playCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>',crosshair:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>',airplay:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path><polygon points="12 15 17 21 7 21 12 15"></polygon></svg>',xOctagon:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',repeat:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>',edit3:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',volume1:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',sunrise:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline></svg>',toggleRight:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="16" cy="12" r="3"></circle></svg>',umbrella:'<svg class="stroked" viewBox="0 0 24 24"><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"></path></svg>',user:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',fileMinus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>',xCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',circle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>',phoneMissed:'<svg class="stroked" viewBox="0 0 24 24"><line x1="23" y1="1" x2="17" y2="7"></line><line x1="17" y1="1" x2="23" y2="7"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',edit2:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>',cornerLeftUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="14 9 9 4 4 9"></polyline><path d="M20 20h-7a4 4 0 0 1-4-4V4"></path></svg>',home:'<svg class="stroked" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',gitlab:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"></path></svg>',music:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',smartphone:'<svg class="stroked" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',moreHorizontal:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>',sliders:'<svg class="stroked" viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>',arrowUpLeft:'<svg class="stroked" viewBox="0 0 24 24"><line x1="17" y1="17" x2="7" y2="7"></line><polyline points="7 17 7 7 17 7"></polyline></svg>',chevronDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>',hexagon:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',github:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>',crop:'<svg class="stroked" viewBox="0 0 24 24"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path></svg>',tag:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',briefcase:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',rotateCw:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>',map:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>',inbox:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>',alignJustify:'<svg class="stroked" viewBox="0 0 24 24"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>',plusSquare:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',power:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>',database:'<svg class="stroked" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',cameraOff:'<svg class="stroked" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"></path></svg>',toggleLeft:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="8" cy="12" r="3"></circle></svg>',file:'<svg class="stroked" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>',messageCircle:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',voicemail:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="5.5" cy="11.5" r="4.5"></circle><circle cx="18.5" cy="11.5" r="4.5"></circle><line x1="5.5" y1="16" x2="18.5" y2="16"></line></svg>',terminal:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',move:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>',maximize:'<svg class="stroked" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>',chevronUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>',arrowDownLeft:'<svg class="stroked" viewBox="0 0 24 24"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg>',fileText:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',droplet:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>',zapOff:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="12.41 6.75 13 2 10.57 4.92"></polyline><polyline points="18.57 12.91 21 10 15.66 10"></polyline><polyline points="8 8 3 14 12 14 11 22 16 16"></polyline><line x1="1" y1="1" x2="23" y2="23"></line></svg>',x:'<svg class="stroked" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',barChart:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',lock:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',logIn:'<svg class="stroked" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>',shoppingBag:'<svg class="stroked" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',divide:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="6" r="2"></circle><line x1="5" y1="12" x2="19" y2="12"></line><circle cx="12" cy="18" r="2"></circle></svg>',cloudDrizzle:'<svg class="stroked" viewBox="0 0 24 24"><line x1="8" y1="19" x2="8" y2="21"></line><line x1="8" y1="13" x2="8" y2="15"></line><line x1="16" y1="19" x2="16" y2="21"></line><line x1="16" y1="13" x2="16" y2="15"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="12" y1="15" x2="12" y2="17"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>',refreshCw:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',chevronRight:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>',clipboard:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',package:'<svg class="stroked" viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',instagram:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',link:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',videoOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',key:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>',meh:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',cornerDownRight:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>',arrowRight:'<svg class="stroked" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',aperture:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line></svg>',stopCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>',logOut:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',arrowLeftCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line></svg>',barChart2:'<svg class="stroked" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',gitPullRequest:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg>',minimize:'<svg class="stroked" viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>',minusSquare:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>',settings:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',cloudSnow:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="22" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line></svg>',thumbsDown:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>',type:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>',archive:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>',phoneOutgoing:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 7 23 1 17 1"></polyline><line x1="16" y1="8" x2="23" y2="1"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',pocket:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path><polyline points="8 10 12 14 16 10"></polyline></svg>',mail:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',shield:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',download:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',phoneForwarded:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="19 1 23 5 19 9"></polyline><line x1="15" y1="5" x2="23" y2="5"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',cornerRightDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="10 15 15 20 20 15"></polyline><path d="M4 4h7a4 4 0 0 1 4 4v12"></path></svg>',bookOpen:'<svg class="stroked" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',divideSquare:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line><line x1="12" y1="8" x2="12" y2="8"></line></svg>',server:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',tv:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>',skipForward:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>',volume:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>',userPlus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',batteryCharging:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"></path><line x1="23" y1="13" x2="23" y2="11"></line><polyline points="11 6 7 12 13 12 9 18"></polyline></svg>',layers:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',slash:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>',radio:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>',book:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',userMinus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="23" y1="11" x2="17" y2="11"></line></svg>',bell:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',gitBranch:'<svg class="stroked" viewBox="0 0 24 24"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>',coffee:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',code:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',thermometer:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>',cast:'<svg class="stroked" viewBox="0 0 24 24"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path><line x1="2" y1="20" x2="2.01" y2="20"></line></svg>',flag:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>',eyeOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',battery:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>',disc:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>',frown:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',tool:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',cpu:'<svg class="stroked" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>',bold:'<svg class="stroked" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>',hash:'<svg class="stroked" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>',share2:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',plus:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',check:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',rotateCcw:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>',hardDrive:'<svg class="stroked" viewBox="0 0 24 24"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>',bluetooth:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline></svg>',pieChart:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>',headphones:'<svg class="stroked" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',rss:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>',wifi:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',cornerUpLeft:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>',watch:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"></circle><polyline points="12 9 12 12 13.5 13.5"></polyline><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"></path></svg>',info:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',userX:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>',loader:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',refreshCcw:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>',folderPlus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>',gitMerge:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M6 21V9a9 9 0 0 0 9 9"></path></svg>',mic:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',copy:'<svg class="stroked" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',zoomIn:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',arrowRightCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>',alignRight:'<svg class="stroked" viewBox="0 0 24 24"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>',image:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',maximize2:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>',checkCircle:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',sunset:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="9" x2="12" y2="2"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="16 5 12 9 8 5"></polyline></svg>',save:'<svg class="stroked" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>',smile:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',navigation:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>',cloudLightning:'<svg class="stroked" viewBox="0 0 24 24"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>',paperclip:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>',fastForward:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>',xSquare:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>',award:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',zoomOut:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',box:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',thumbsUp:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>',percent:'<svg class="stroked" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>',sidebar:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>',square:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',play:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',gitCommit:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><line x1="1.05" y1="12" x2="7" y2="12"></line><line x1="17.01" y1="12" x2="22.96" y2="12"></line></svg>',table:'<svg class="stroked" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path></svg>',send:'<svg class="stroked" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',phoneCall:'<svg class="stroked" viewBox="0 0 24 24"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',speaker:'<svg class="stroked" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><circle cx="12" cy="14" r="4"></circle><line x1="12" y1="6" x2="12.01" y2="6"></line></svg>',facebook:'<svg class="filled" version="1.1" viewBox="0 0 512 512"><g></g><path d="M464 0h-416c-26.4 0-48 21.6-48 48v416c0 26.4 21.6 48 48 48h208v-224h-64v-64h64v-32c0-52.9 43.1-96 96-96h64v64h-64c-17.6 0-32 14.4-32 32v32h96l-16 64h-80v224h144c26.4 0 48-21.6 48-48v-416c0-26.4-21.6-48-48-48z"></path></svg> ',codesandbox:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',camera:'<svg class="stroked" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',link2:'<svg class="stroked" viewBox="0 0 24 24"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path><line x1="8" y1="12" x2="16" y2="12"></line></svg>',printer:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>',folderMinus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="9" y1="14" x2="15" y2="14"></line></svg>',arrowUpRight:'<svg class="stroked" viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>',truck:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',lifeBuoy:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>',penTool:'<svg class="stroked" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.59 7.59"></path><circle cx="11" cy="11" r="2"></circle></svg>',atSign:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>',feather:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>',trash:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',wifiOff:'<svg class="stroked" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',cornerLeftDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="14 15 9 20 4 15"></polyline><path d="M20 4h-7a4 4 0 0 0-4 4v12"></path></svg>',dollarSign:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',star:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',cloudOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',sun:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',messageSquare:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',edit:'<svg class="stroked" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',anchor:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12H2a10 10 0 0 0 20 0h-3"></path></svg>',alertCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',chevronsUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>',uploadCloud:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>',twitch:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path></svg>',youtube:'<svg class="filled" version="1.1" viewBox="0 0 512 512"><g></g><path d="M506.9 153.6c0 0-5-35.3-20.4-50.8-19.5-20.4-41.3-20.5-51.3-21.7-71.6-5.2-179.1-5.2-179.1-5.2h-0.2c0 0-107.5 0-179.1 5.2-10 1.2-31.8 1.3-51.3 21.7-15.4 15.5-20.3 50.8-20.3 50.8s-5.1 41.4-5.1 82.9v38.8c0 41.4 5.1 82.9 5.1 82.9s5 35.3 20.3 50.8c19.5 20.4 45.1 19.7 56.5 21.9 41 3.9 174.1 5.1 174.1 5.1s107.6-0.2 179.2-5.3c10-1.2 31.8-1.3 51.3-21.7 15.4-15.5 20.4-50.8 20.4-50.8s5.1-41.4 5.1-82.9v-38.8c-0.1-41.4-5.2-82.9-5.2-82.9zM203.1 322.4v-143.9l138.3 72.2-138.3 71.7z"></path></svg> ',unlock:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>',compass:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',plusCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',creditCard:'<svg class="stroked" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',cloudRain:'<svg class="stroked" viewBox="0 0 24 24"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>',trash2:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',skipBack:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>',filePlus:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>',delete:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>',command:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>',clock:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',octagon:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon></svg>',phone:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',eye:'<svg class="stroked" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',phoneOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>',codepen:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line></svg>',dribbble:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path></svg>',gift:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>',externalLink:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',zap:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',trello:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="9"></rect><rect x="14" y="7" width="3" height="5"></rect></svg>',moreVertical:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>',micOff:'<svg class="stroked" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',share:'<svg class="stroked" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>',arrowUp:'<svg class="stroked" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',bellOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',linkedin:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>',video:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',divideCircle:'<svg class="stroked" viewBox="0 0 24 24"><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line><line x1="12" y1="8" x2="12" y2="8"></line><circle cx="12" cy="12" r="10"></circle></svg>',activity:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',twitter:'<svg class="stroked" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>',mapPin:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',filter:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>',phoneIncoming:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="16 2 16 8 22 8"></polyline><line x1="23" y1="1" x2="16" y2="8"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',italic:'<svg class="stroked" viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>',chevronsLeft:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>',calendar:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',globe:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',arrowLeft:'<svg class="stroked" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',alignCenter:'<svg class="stroked" viewBox="0 0 24 24"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>',minusCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>',arrowDownRight:'<svg class="stroked" viewBox="0 0 24 24"><line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline></svg>',framer:'<svg class="stroked" viewBox="0 0 24 24"><path d="M5 16V9h14V2H5l14 14h-7m-7 0l7 7v-7m-7 0h7"></path></svg>',volumeX:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>',slack:'<svg class="stroked" viewBox="0 0 24 24"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"></path><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"></path><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"></path><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"></path><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"></path><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"></path></svg>',cloud:'<svg class="stroked" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>',downloadCloud:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg>',shuffle:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>',rewind:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>',upload:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',trendingDown:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>',pause:'<svg class="stroked" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',arrowDownCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg>',bookmark:'<svg class="stroked" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',alertTriangle:'<svg class="stroked" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',userCheck:'<svg class="stroked" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>',tablet:'<svg class="stroked" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',alertOctagon:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',menu:'<svg class="stroked" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',chrome:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>',shoppingCart:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',folder:'<svg class="stroked" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',users:'<svg class="stroked" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',cornerDownLeft:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>',monitor:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',minus:'<svg class="stroked" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',helpCircle:'<svg class="stroked" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',navigation2:'<svg class="stroked" viewBox="0 0 24 24"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>',chevronLeft:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>',film:'<svg class="stroked" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>',moon:'<svg class="stroked" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',shieldOff:'<svg class="stroked" viewBox="0 0 24 24"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"></path><path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',layout:'<svg class="stroked" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',mousePointer:'<svg class="stroked" viewBox="0 0 24 24"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path><path d="M13 13l6 6"></path></svg>',alignLeft:'<svg class="stroked" viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>',heart:'<svg class="stroked" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',trendingUp:'<svg class="stroked" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',listBullet:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,6 C21,6,10,6,10,6"/><path style="" d="M21,12 C21,12,10,12,10,12"/><path style="" d="M21,18 C21,18,10,18,10,18"/><path style="" d="M5.5,5 C6.05,5,6.5,5.45,6.5,6 C6.5,6.55,6.05,7,5.5,7 C4.95,7,4.5,6.55,4.5,6 C4.5,5.45,4.95,5,5.5,5 z"/><path style="" d="M5.5,11 C6.05,11,6.5,11.45,6.5,12 C6.5,12.55,6.05,13,5.5,13 C4.95,13,4.5,12.55,4.5,12 C4.5,11.45,4.95,11,5.5,11 z"/><path style="" d="M5.5,17 C6.05,17,6.5,17.45,6.5,18 C6.5,18.55,6.05,19,5.5,19 C4.95,19,4.5,18.55,4.5,18 C4.5,17.45,4.95,17,5.5,17 z"/></g></svg> ',indent:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,10 C21,10,8,10,8,10"/><path style="" d="M21,6 C21,6,8,6,8,6"/><path style="" d="M21,14 C21,14,8,14,8,14"/><path style="" d="M21,18 C21,18,8,18,8,18"/><path style="" d="M2.5,9 C2.5,9,5.5,12,5.5,12 C5.5,12,2.5,15,2.5,15"/></g></svg> ',fontBold:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M13.5,11 C15.71,11,17.5,12.68,17.5,14.75 C17.5,16.82,15.71,18.5,13.5,18.5 C13.5,18.5,8.5,18.5,8.5,18.5 C8.5,18.5,8.5,3.5,8.5,3.5 C8.5,3.5,13.5,3.5,13.5,3.5 C15.71,3.5,17.5,5.18,17.5,7.25 C17.5,9.32,15.71,11,13.5,11 C13.5,11,13.5,11,13.5,11 z"/><path style="" d="M13.5,11 C13.5,11,8.5,11,8.5,11"/><path style="" d="M12.5,11 C14.71,11,16.5,12.68,16.5,14.75 C16.5,16.82,14.71,18.5,12.5,18.5 C12.5,18.5,7.5,18.5,7.5,18.5 C7.5,18.5,7.5,3.5,7.5,3.5 C7.5,3.5,12.5,3.5,12.5,3.5 C14.71,3.5,16.5,5.18,16.5,7.25 C16.5,9.32,14.71,11,12.5,11 C12.5,11,12.5,11,12.5,11 z"/><path style="" d="M12.5,11 C12.5,11,7.5,11,7.5,11"/></g></svg> ',fontItalic:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M17.00,4.50 C17.00,4.50,13.00,4.50,13.00,4.50"/><path style="" d="M11.00,19.50 C11.00,19.50,7.00,19.50,7.00,19.50"/><path style="" d="M15.00,4.50 C15.00,4.50,9.00,19.50,9.00,19.50"/></g></svg> ',fontUnderline:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M7.5,3.5 C7.5,3.5,7.5,10.74,7.5,13.5 C7.5,16.26,9.74,18.5,12.5,18.5 C15.26,18.5,17.5,16.26,17.5,13.5 C17.5,10.74,17.5,3.5,17.5,3.5"/><path style="" d="M7.5,21.5 C7.5,21.5,17.5,21.5,17.5,21.5"/></g></svg> ',outdent:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,10 C21,10,8,10,8,10"/><path style="" d="M21,6 C21,6,8,6,8,6"/><path style="" d="M21,14 C21,14,8,14,8,14"/><path style="" d="M21,18 C21,18,8,18,8,18"/><path style="" d="M5.5,9 C5.5,9,2.5,12,2.5,12 C2.5,12,5.5,15,5.5,15"/></g></svg> ',listNumber:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,6 C21,6,10,6,10,6"/><path style="" d="M21,12 C21,12,10,12,10,12"/><path style="" d="M21,18 C21,18,10,18,10,18"/><path style="" d="M4.5,5 C4.5,5,5.5,4,5.5,4 C5.5,4,5.5,8,5.5,8"/><path style="" d="M4.5,10 C4.5,10,5.50,10,5.50,10 C6.05,10,6.5,10.45,6.5,11.00 C6.5,11.00,6.5,11.00,6.5,11.00 C6.5,11.55,6.05,12,5.50,12 C5.50,12,5.50,12,5.50,12 C4.95,12,4.5,12.45,4.5,13.00 C4.5,13.00,4.5,14,4.5,14 C4.5,14,6.5,14,6.5,14"/><path style="" d="M4.5,16 C4.5,16,5.50,16,5.50,16 C6.05,16,6.5,16.45,6.5,17.00 C6.5,17.00,6.5,17.00,6.5,17.00 C6.5,17.55,6.05,18,5.50,18 C5.50,18,4.5,18,4.5,18 C4.5,18,5.50,18,5.50,18 C6.05,18,6.5,18.45,6.5,19.00 C6.5,19.00,6.5,19.00,6.5,19.00 C6.5,19.55,6.05,20,5.50,20 C5.50,20,4.5,20,4.5,20"/></g></svg> ',resize:'<svg class="stroked" version="1.1" viewBox="0, 0, 24, 24"><g><path d="M9,3 L3,3 L3,9"/><path d="M15,21 L21,21 L21,15"/><path d="M3,3 L10,10"/><path d="M21,21 L14,14"/></g></svg> ',bug:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M8,6 C8,3.79,9.79,2,12,2 C14.21,2,16,3.79,16,6 C16,6,8,6,8,6 z"/><path style="" d="M20,7 C20,7,18,9,18,9"/><path style="" d="M20,19 C20,19,18,17,18,17"/><path style="" d="M21,13 C21,13,18,13,18,13"/><path style="" d="M16.44,9 C17.30,9,18.00,9.70,18.00,10.56 C18.00,10.56,18.00,15.00,18.00,15.00 C18.00,18.31,15.31,21,12,21 C8.69,21,6,18.31,6,15.00 C6,15.00,6,10.56,6,10.56 C6,9.70,6.70,9,7.56,9 C7.56,9,16.44,9,16.44,9 z"/><path style="" d="M4,7 C4,7,6,9,6,9"/><path style="" d="M4,19 C4,19,6,17,6,17"/><path style="" d="M3,13 C3,13,6,13,6,13"/><path style="" d="M12,12 C12,12,12,17,12,17"/></g></svg> ',blog:'<svg class="stroked" viewBox="0 0 24 24"><g><path style="" d="M21,10.02 C21,10.02,21,15,21,15 C21,15.53,20.79,16.04,20.41,16.41 C20.04,16.79,19.53,17,19,17 C19,17,7,17,7,17 C5.67,18.33,4.33,19.67,3,21 C3,21,3,5,3,5 C3,4.47,3.21,3.96,3.59,3.59 C3.96,3.21,4.47,3,5,3 C8.53,3,10.49,3,14.02,3"/><path style="" d="M19,2 C19.54,1.46,20.32,1.25,21.05,1.45 C21.78,1.65,22.35,2.22,22.55,2.95 C22.75,3.68,22.54,4.46,22,5 C22,5,15.5,11.5,15.5,11.5 C14.17,11.83,12.83,12.17,11.5,12.5 C11.83,11.17,12.17,9.83,12.5,8.5 C15.67,5.33,15.83,5.17,19,2 z"/><path style="" d="M14.60,3"/><path style="" d="M21,8.77"/><path style="" d="M7,7 C7,7,10,7,10,7"/><path style="" d="M7,10 C7,10,9,10,9,10"/></g></svg> ',sortAscending:'<svg class="stroked" viewBox="0 0 24 24"><g><path d="M16.5,10.5 C16.5,10.5,7.5,10.5,7.5,10.5"/><path d="M14.5,6.5 C14.5,6.5,9.5,6.5,9.5,6.5"/><path d="M18.5,14.5 C18.5,14.5,5.5,14.5,5.5,14.5"/><path d="M20.5,18.5 C20.5,18.5,3.5,18.5,3.5,18.5"/></g></svg> ',npm:'<svg class="filled" version="1.1" viewBox="0 0 512 512"><g></g><path d="M0 0v512h512v-512h-512zM416 416h-64v-256h-96v256h-160v-320h320v320z"></path></svg> ',game:'<svg class="filled" version="1.1" viewBox="0 0 704 512"><g></g><path d="M528 96.79v-0.79h-336c-88.36 0-160 71.64-160 160s71.64 160 160 160c52.34 0 98.82-25.14 128.01-64h63.98c29.19 38.86 75.66 64 128.01 64 88.37 0 160-71.63 160-160 0-82.97-63.15-151.18-144-159.21zM288 288h-64v64h-64v-64h-64v-64h64v-64h64v64h64v64zM480 288c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zM576 288c-17.67 0-32-14.33-32-32 0-17.67 14.33-32 32-32s32 14.33 32 32c0 17.67-14.33 32-32 32z"></path></svg> ',google:'<svg class="filled" version="1.1" viewBox="0 0 512 512"><g></g><path d="M256 0c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zM259.8 448c-106.1 0-192-85.9-192-192s85.9-192 192-192c51.8 0 95.2 18.9 128.6 50.2l-52.1 50.2c-14.3-13.7-39.2-29.6-76.5-29.6-65.6 0-119 54.3-119 121.2s53.5 121.2 119 121.2c76 0 104.5-54.6 108.9-82.8h-108.9v-65.8h181.3c1.6 9.6 3 19.2 3 31.8 0.1 109.7-73.4 187.6-184.3 187.6z"></path></svg> ',discord:'<svg class="filled" version="1.1" viewBox="0 0 1013 768"><g></g><path d="M858.38 64.32c-60.41-28.44-130.58-50.8-204.05-63.60l-5.01-0.72c-8.35 14.47-17.31 32.35-25.34 50.74l-1.44 3.7c-34.87-5.53-75.06-8.69-116.00-8.69s-81.14 3.16-120.37 9.25l4.37-0.56c-9.48-22.09-18.44-39.97-28.27-57.29l1.49 2.86c-78.56 13.64-148.78 36.05-214.41 66.65l5.19-2.17c-132.30 195.75-168.17 386.63-150.24 574.80v0c73.25 54.65 158.46 98.55 250.43 127.12l5.97 1.60c19.28-25.64 37.51-54.63 53.29-85.10l1.63-3.45c-33.48-12.62-61.98-26.51-88.96-42.66l2.48 1.38c7.25-5.26 14.35-10.68 21.2-15.94 75.07 36.14 163.23 57.26 256.32 57.26s181.25-21.12 259.94-58.83l-3.62 1.56c6.93 5.66 14.03 11.08 21.2 15.94-24.54 14.80-53.09 28.72-82.88 40.10l-3.75 1.26c17.37 33.87 35.61 62.84 56.05 90.05l-1.14-1.58c98.00-30.05 183.28-73.93 258.78-130.22l-2.22 1.58c21.04-218.22-35.95-407.35-150.63-575.04zM338.33 523.56c-49.97 0-91.26-45.35-91.26-101.14s39.85-101.54 91.10-101.54 92.21 45.75 91.34 101.54-40.25 101.14-91.18 101.14zM674.99 523.56c-50.05 0-91.18-45.35-91.18-101.14s39.85-101.54 91.18-101.54 91.97 45.75 91.10 101.54-40.17 101.14-91.10 101.14z"></path></svg> '},ir=(n)=>{Object.assign(zt,n)},Vt=(n,t,e,a=1)=>{if(n.setAttribute("xmlns","http://www.w3.org/2000/svg"),t||e)for(let s of[...n.querySelectorAll("path, polygon")]){if(t)s.setAttribute("fill",t);if(e)s.setAttribute("stroke",e),s.setAttribute("stroke-width",String(a))}let o=n.querySelectorAll("[style]");n.removeAttribute("style");for(let s of[...o]){let{fill:i,stroke:r,strokeWidth:l,strokeLinecap:c,strokeLinejoin:h}=s.style;if(i)s.setAttribute("fill",f.fromCss(i).html);if(r)s.setAttribute("stroke",f.fromCss(r).html);if(l)s.setAttribute("strokeWidth",l);if(c)s.setAttribute("strokeLinecap",c);if(h)s.setAttribute("strokeLinejoin",h);s.removeAttribute("style")}return`url(data:image/svg+xml;charset=UTF-8,${encodeURIComponent(n.outerHTML)})`},y=new Proxy(zt,{get(n,t){let e=zt[t];if(t&&!e)console.warn(`icon ${t} does not exist`);if(!e)e=zt.square;return(...a)=>{let o=m.div();o.innerHTML=e;let s=o.querySelector("svg"),i=new Set(s.classList);i.add("xin-icon");let r=wt.svg({class:Array.from(i).join(" "),viewBox:s.getAttribute("viewBox")},...a,...s.children);return r.style.strokeWidth=p.xinIconStrokeWidth("2px"),r.style.stroke=p.xinIconStroke(i.has("filled")?"none":"currentColor"),r.style.fill=p.xinIconFill(i.has("stroked")?"none":"currentColor"),r.style.height=p.xinIconSize("16px"),r}}});class Qe extends b{icon="";size=0;fill="";stroke="";strokeWidth=1;constructor(){super();this.initAttributes("icon","size","fill","stroke","strokeWidth")}render(){super.render(),this.textContent="";let n={};if(this.size)n.height=this.size+"px",this.style.setProperty("--xin-icon-size",`${this.size}px`);if(this.stroke)n.stroke=this.stroke,n.strokeWidth=this.strokeWidth;n.fill=this.fill,this.append(y[this.icon]({style:n}))}}var rr=Qe.elementCreator({tag:"xin-icon",styleSpec:{":host":{display:"inline-flex",stroke:"currentColor",strokeWidth:p.iconStrokeWidth("2px"),strokeLinejoin:p.iconStrokeLinejoin("round"),strokeLinecap:p.iconStrokeLinecap("round"),fill:p.iconFill("none")},":host, :host svg":{height:p.xinIconSize("16px")}}}),Bo=()=>{};class na extends b{babylonReady;BABYLON;static styleSpec={":host":{display:"block",position:"relative"},":host canvas":{width:"100%",height:"100%"},":host .babylonVRicon":{height:50,width:80,backgroundColor:"transparent",filter:"drop-shadow(0 0 4px #000c)",backgroundImage:Vt(y.xrColor()),backgroundPosition:"center",backgroundRepeat:"no-repeat",border:"none",borderRadius:5,borderStyle:"none",outline:"none",transition:"transform 0.125s ease-out"},":host .babylonVRicon:hover":{transform:"scale(1.1)"}};content=m.canvas({part:"canvas"});constructor(){super();this.babylonReady=(async()=>{let{BABYLON:n}=await Cn("https://cdn.babylonjs.com/babylon.js","BABYLON");return n})()}scene;engine;sceneCreated=Bo;update=Bo;_update=()=>{if(this.scene){if(this.update!==void 0)this.update(this,this.BABYLON);if(this.scene.activeCamera!==void 0)this.scene.render()}};onResize(){if(this.engine)this.engine.resize()}loadScene=async(n,t,e)=>{let{BABYLON:a}=await Cn("https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js","BABYLON");a.SceneLoader.Append(n,t,this.scene,e)};loadUI=async(n)=>{let{BABYLON:t}=await Cn("https://cdn.babylonjs.com/gui/babylon.gui.min.js","BABYLON"),e=t.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI",!0,this.scene),{snippetId:a,jsonUrl:o,data:s,size:i}=n;if(i)e.idealWidth=i,e.renderAtIdealSize=!0;let r;if(a)r=await e.parseFromSnippetAsync(a);else if(o)r=await e.parseFromURLAsync(o);else if(s)r=e.parseContent(s);else return null;let l=e.getChildren()[0],c=l.children.reduce((h,u)=>{return h[u.name]=u,h},{});return{advancedTexture:e,gui:r,root:l,widgets:c}};connectedCallback(){super.connectedCallback();let{canvas:n}=this.parts;this.babylonReady.then(async(t)=>{if(this.BABYLON=t,this.engine=new t.Engine(n,!0),this.scene=new t.Scene(this.engine),this.sceneCreated)await this.sceneCreated(this,t);if(this.scene.activeCamera===void 0)new t.ArcRotateCamera("default-camera",-Math.PI/2,Math.PI/2.5,3,new t.Vector3(0,0,0)).attachControl(this.parts.canvas,!0);this.engine.runRenderLoop(this._update)})}}var lr=na.elementCreator({tag:"xin-3d"});class _n extends b{content=null;src="";json="";config={renderer:"svg",loop:!0,autoplay:!0};static bodymovinAvailable;animation;static styleSpec={":host":{width:400,height:400,display:"inline-block"}};_loading=!1;get loading(){return this._loading}constructor(){super();if(this.initAttributes("src","json"),_n.bodymovinAvailable===void 0)_n.bodymovinAvailable=Cn("https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js","bodymovin")}doneLoading=()=>{this._loading=!1};load=({bodymovin:n})=>{if(this._loading=!0,this.config.container=this.shadowRoot!==null?this.shadowRoot:void 0,this.json!=="")this.config.animationData=this.json,delete this.config.path;else if(this.src!=="")delete this.config.animationData,this.config.path=this.src;else console.log("%c<xin-lottie>%c expected either %cjson%c (animation data) or %csrc% c(url) but found neither.","color: #44f; background: #fff; padding: 0 5px","color: default","color: #44f; background: #fff; padding: 0 5px","color: default","color: #44f; background: #fff; padding: 0 5px","color: default");if(this.animation){this.animation.destroy();let t=this.shadowRoot;if(t!==null)t.querySelector("svg")?.remove()}this.animation=n.loadAnimation(this.config),this.animation.addEventListener("DOMLoaded",this.doneLoading)};render(){super.render(),_n.bodymovinAvailable.then(this.load).catch((n)=>{console.error(n)})}}var dr=_n.elementCreator({tag:"xin-lottie"}),{button:ze,slot:cr,div:Mt}=m;class ta extends b{arrows=!1;dots=!1;loop=!1;maxVisibleItems=1;snapDelay=0.1;snapDuration=0.25;auto=0;lastAutoAdvance=Date.now();interval;autoAdvance=()=>{if(this.auto>0&&this.auto*1000<Date.now()-this.lastAutoAdvance)this.forward()};_page=0;get page(){return this._page}set page(n){let{scroller:t,back:e,forward:a}=this.parts;if(this.lastPage<=0)a.disabled=e.disabled=!0,n=0;else n=Math.max(0,Math.min(this.lastPage,n)),n=isNaN(n)?0:n;if(this._page!==n)this._page=isNaN(n)?0:n,this.animateScroll(this._page*t.offsetWidth),e.disabled=this.page<=0&&!this.loop,a.disabled=this.page>=this.lastPage&&!this.loop}get visibleItems(){return[...this.children].filter((n)=>getComputedStyle(n).display!=="none")}get lastPage(){return Math.max(Math.ceil(this.visibleItems.length/(this.maxVisibleItems||1))-1,0)}static styleSpec={":host":{display:"flex",flexDirection:"column",position:"relative"},":host svg":{height:d.carouselIconSize},":host button":{outline:"none",border:"none",boxShadow:"none",background:"transparent",color:d.carouselButtonColor,padding:0},":host::part(back), :host::part(forward)":{position:"absolute",top:0,bottom:0,width:d.carouseButtonWidth,zIndex:2},":host::part(back)":{left:0},":host::part(forward)":{right:0},":host button:disabled":{opacity:0.5,pointerEvents:"none"},":host button:hover":{color:d.carouselButtonHoverColor},":host button:active":{color:d.carouselButtonActiveColor},":host::part(pager)":{position:"relative"},":host::part(scroller)":{overflow:"auto hidden",position:"relative"},":host::part(grid)":{display:"grid",justifyItems:"center"},":host *::-webkit-scrollbar, *::-webkit-scrollbar-thumb":{display:"none"},":host .dot":{background:d.carouselButtonColor,borderRadius:d.carouselDotSize,height:d.carouselDotSize,width:d.carouselDotSize,transition:d.carouselDotTransition},":host .dot:not(.current):hover":{background:d.carouselButtonHoverColor,height:d.carouselDotSize150,width:d.carouselDotSize150,margin:d.carouselDotSize_25},":host .dot:not(.current):active":{background:d.carouselButtonActiveColor},":host .dot.current":{background:d.carouselDotCurrentColor},":host::part(progress)":{display:"flex",gap:d.carouselDotSpacing,justifyContent:"center",padding:d.carouselProgressPadding}};easing=(n)=>{return Math.sin(n*Math.PI*0.5)};indicateCurrent=()=>{let{scroller:n,progress:t}=this.parts,e=n.scrollLeft/n.offsetWidth;[...t.children].forEach((a,o)=>{a.classList.toggle("current",Math.floor(o/this.maxVisibleItems-e)===0)}),this.lastAutoAdvance=Date.now(),clearTimeout(this.snapTimer),this.snapTimer=setTimeout(this.snapPosition,this.snapDelay*1000)};snapPosition=()=>{let{scroller:n}=this.parts,t=Math.round(n.scrollLeft/n.offsetWidth);if(t!==this.page)this.page=t>this.page?Math.ceil(t):Math.floor(t);this.lastAutoAdvance=Date.now()};back=()=>{this.page=this.page>0?this.page-1:this.lastPage};forward=()=>{this.page=this.page<this.lastPage?this.page+1:0};handleDotClick=(n)=>{let{progress:t}=this.parts,e=[...t.children].indexOf(n.target);if(e>-1)this.page=Math.floor(e/this.maxVisibleItems)};snapTimer;animationFrame;animateScroll(n,t=-1,e=0){cancelAnimationFrame(this.animationFrame);let{scroller:a}=this.parts;if(t===-1){t=a.scrollLeft,e=Date.now(),this.animationFrame=requestAnimationFrame(()=>{this.animateScroll(n,t,e)});return}let o=(Date.now()-e)/1000;if(o>=this.snapDuration||Math.abs(a.scrollLeft-n)<2)a.scrollLeft=n,this.animationFrame=null;else a.scrollLeft=t+this.easing(o/this.snapDuration)*(n-t),this.animationFrame=requestAnimationFrame(()=>{this.animateScroll(n,t,e)})}content=()=>[Mt({part:"pager"},ze({title:"previous slide",part:"back"},y.chevronLeft()),Mt({title:"slides",role:"group",part:"scroller"},Mt({part:"grid"},cr())),ze({title:"next slide",part:"forward"},y.chevronRight())),Mt({title:"choose slide to display",role:"group",part:"progress"})];constructor(){super();this.initAttributes("dots","arrows","maxVisibleItems","snapDuration","loop","auto")}connectedCallback(){super.connectedCallback(),this.ariaRoleDescription="carousel",this.ariaOrientation="horizontal",this.ariaReadOnly="true";let{back:n,forward:t,scroller:e,progress:a}=this.parts;n.addEventListener("click",this.back),t.addEventListener("click",this.forward),e.addEventListener("scroll",this.indicateCurrent),a.addEventListener("click",this.handleDotClick),this.lastAutoAdvance=Date.now(),this.interval=setInterval(this.autoAdvance,100)}disconnectedCallback(){clearInterval(this.interval)}render(){super.render();let{dots:n,arrows:t,visibleItems:e,lastPage:a}=this,{progress:o,back:s,forward:i,grid:r}=this.parts;e.forEach((l)=>{l.role="group"}),r.style.gridTemplateColumns=`${100/this.maxVisibleItems/(1+this.lastPage)}% `.repeat(e.length).trim(),r.style.width=(1+this.lastPage)*100+"%",o.textContent="",o.append(...e.map((l,c)=>ze({title:`item ${c+1}`,class:"dot"}))),this.indicateCurrent(),o.style.display=n&&a>0?"":"none",s.hidden=i.hidden=!(t&&a>0)}}var hr=ta.elementCreator({tag:"xin-carousel",styleSpec:{":host":{_carouselIconSize:24,_carouselButtonColor:"#0004",_carouselButtonHoverColor:"#0006",_carouselButtonActiveColor:"#000c",_carouseButtonWidth:48,_carouselDotCurrentColor:"#0008",_carouselDotSize:8,_carouselDotSpacing:d.carouselDotSize,_carouselProgressPadding:12,_carouselDotTransition:"0.125s ease-in-out"},":host:focus":{outline:"none",boxShadow:"none"}}}),Po="https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.2/",Go="ace/theme/tomorrow",pr=async(n,t="html",e={},a=Go)=>{let{ace:o}=await Cn(`${Po}ace.min.js`);o.config.set("basePath",Po);let s=o.edit(n,{mode:`ace/mode/${t}`,tabSize:2,useSoftTabs:!0,useWorker:!1,...e});return s.setTheme(a),s};class Rn extends b{source="";get value(){return this.editor===void 0?this.source:this.editor.getValue()}set value(n){if(this.editor===void 0)this.source=n;else this.editor.setValue(n),this.editor.clearSelection(),this.editor.session.getUndoManager().reset()}mode="javascript";disabled=!1;role="code editor";get editor(){return this._editor}_editor;_editorPromise;options={};theme=Go;static styleSpec={":host":{display:"block",position:"relative",width:"100%",height:"100%"}};constructor(){super();this.initAttributes("mode","theme","disabled")}onResize(){if(this.editor!==void 0)this.editor.resize(!0)}connectedCallback(){if(super.connectedCallback(),this.source==="")this.value=this.textContent!==null?this.textContent.trim():"";if(this._editorPromise===void 0)this._editorPromise=pr(this,this.mode,this.options,this.theme),this._editorPromise.then((n)=>{this._editor=n,n.setValue(this.source,1),n.clearSelection(),n.session.getUndoManager().reset()})}render(){if(super.render(),this._editorPromise!==void 0)this._editorPromise.then((n)=>n.setReadOnly(this.disabled))}}var _t=Rn.elementCreator({tag:"xin-code"}),{input:_e}=m,Mo=f.fromCss("#8888");class $o extends b{value=Mo.rgba;color=Mo;static styleSpec={":host":{_gap:8,_swatchSize:32,_cssWidth:72,_alphaWidth:72,display:"inline-flex",gap:d.gap,alignItems:"center"},':host input[type="color"]':{border:0,width:d.swatchSize,height:d.swatchSize,background:"transparent"},":host::part(alpha)":{width:d.alphaWidth},":host::part(css)":{width:d.cssWidth,fontFamily:"monospace"}};content=[_e({title:"base color",type:"color",part:"rgb"}),_e({type:"range",title:"opacity",part:"alpha",min:0,max:1,step:0.05}),_e({title:"css color spec",part:"css"})];valueChanged=!1;update=(n)=>{let{rgb:t,alpha:e,css:a}=this.parts;if(n.type==="input")this.color=f.fromCss(t.value),this.color.a=Number(e.value),a.value=this.color.html;else this.color=f.fromCss(a.value),t.value=this.color.html.substring(0,7),e.value=String(this.color.a);t.style.opacity=String(this.color.a),this.value=this.color.rgba,this.valueChanged=!0};connectedCallback(){super.connectedCallback();let{rgb:n,alpha:t,css:e}=this.parts;n.addEventListener("input",this.update),t.addEventListener("input",this.update),e.addEventListener("change",this.update)}render(){if(this.valueChanged){this.valueChanged=!1;return}let{rgb:n,alpha:t,css:e}=this.parts;this.color=f.fromCss(this.value),n.value=this.color.html.substring(0,7),n.style.opacity=String(this.color.a),t.value=String(this.color.a),e.value=this.color.html}}var Ko=$o.elementCreator({tag:"xin-color"}),tn=m.div({style:{content:" ",position:"fixed",top:0,left:0,right:0,bottom:0}}),Lt={passive:!0},an=(n,t,e="move")=>{if(!n.type.startsWith("touch")){let{clientX:a,clientY:o}=n;tn.style.cursor=e,ot(tn),document.body.append(tn);let s=(i)=>{let r=i.clientX-a,l=i.clientY-o;if(t(r,l,i)===!0)tn.removeEventListener("mousemove",s),tn.removeEventListener("mouseup",s),tn.remove()};tn.addEventListener("mousemove",s,Lt),tn.addEventListener("mouseup",s,Lt)}else if(n instanceof TouchEvent){let a=n.changedTouches[0],o=a.identifier,s=a.clientX,i=a.clientY,r=n.target,l=0,c=0,h=(u)=>{let g=[...u.touches].find((w)=>w.identifier===o);if(g!==void 0)l=g.clientX-s,c=g.clientY-i;if(u.type==="touchmove")u.stopPropagation(),u.preventDefault();if(t(l,c,u)===!0||g===void 0)r.removeEventListener("touchmove",h),r.removeEventListener("touchend",h),r.removeEventListener("touchcancel",h)};r.addEventListener("touchmove",h),r.addEventListener("touchend",h,Lt),r.addEventListener("touchcancel",h,Lt)}},Wt=(n="body *")=>[...document.querySelectorAll(n)].map((t)=>parseFloat(getComputedStyle(t).zIndex)).reduce((t,e)=>isNaN(t)||Number(t)<e?e:Number(t),0),ot=(n,t="body *")=>{n.style.zIndex=String(Wt(t)+1)},{slot:ur}=m;class on extends b{static floats=new Set;drag=!1;remainOnResize="remove";remainOnScroll="remain";content=ur();static styleSpec={":host":{position:"fixed"}};constructor(){super();this.initAttributes("drag","remainOnResize","remainOnScroll")}reposition=(n)=>{if(n.target?.closest(".no-drag"))return;if(this.drag){ot(this);let t=this.offsetLeft,e=this.offsetTop;an(n,(a,o,s)=>{if(this.style.left=`${t+a}px`,this.style.top=`${e+o}px`,this.style.right="auto",this.style.bottom="auto",s.type==="mouseup")return!0})}};connectedCallback(){super.connectedCallback(),on.floats.add(this);let n={passive:!0};this.addEventListener("touchstart",this.reposition,n),this.addEventListener("mousedown",this.reposition,n),ot(this)}disconnectedCallback(){super.disconnectedCallback(),on.floats.delete(this)}}var Je=on.elementCreator({tag:"xin-float"});window.addEventListener("resize",()=>{[...on.floats].forEach((n)=>{if(n.remainOnResize==="hide")n.hidden=!0;else if(n.remainOnResize==="remove")n.remove()})},{passive:!0});document.addEventListener("scroll",(n)=>{if(n.target instanceof HTMLElement&&n.target.closest(on.tagName))return;[...on.floats].forEach((t)=>{if(t.remainOnScroll==="hide")t.hidden=!0;else if(t.remainOnScroll==="remove")t.remove()})},{passive:!0,capture:!0});var Zo=(n)=>{let{content:t,target:e,position:a,remainOnScroll:o,remainOnResize:s}=n,i=Array.isArray(t)?Je(...t):Je(t);return Qo(i,e,a,o,s),document.body.append(i),i},Qo=(n,t,e,a,o)=>{{let{position:w}=getComputedStyle(n);if(w!=="fixed")n.style.position="fixed";if(o)n.remainOnResize=o;if(a)n.remainOnScroll=a;ot(n)}let{left:s,top:i,width:r,height:l}=t.getBoundingClientRect(),c=s+r*0.5,h=i+l*0.5,u=window.innerWidth,g=window.innerHeight;if(e==="side")e=(c<u*0.5?"e":"w")+(h<g*0.5?"s":"n");else if(e==="auto"||e===void 0)e=(h<g*0.5?"s":"n")+(c<u*0.5?"e":"w");if(n.style.top=n.style.left=n.style.right=n.style.bottom=n.style.transform="",e.length===2){let[w,v]=e;switch(w){case"n":n.style.bottom=(g-i).toFixed(2)+"px";break;case"e":n.style.left=(s+r).toFixed(2)+"px";break;case"s":n.style.top=(i+l).toFixed(2)+"px";break;case"w":n.style.right=(u-s).toFixed(2)+"px";break}switch(v){case"n":n.style.bottom=(g-i-l).toFixed(2)+"px";break;case"e":n.style.left=s.toFixed(2)+"px";break;case"s":n.style.top=i.toFixed(2)+"px";break;case"w":n.style.right=(u-s-r).toFixed(2)+"px";break}n.style.transform=""}else if(e==="n")n.style.bottom=(g-i).toFixed(2)+"px",n.style.left=c.toFixed(2)+"px",n.style.transform="translateX(-50%)";else if(e==="s")n.style.top=(i+l).toFixed(2)+"px",n.style.left=c.toFixed(2)+"px",n.style.transform="translateX(-50%)";else if(e==="e")n.style.left=(s+r).toFixed(2)+"px",n.style.top=h.toFixed(2)+"px",n.style.transform="translateY(-50%)";else if(e==="w")n.style.right=(u-s).toFixed(2)+"px",n.style.top=h.toFixed(2)+"px",n.style.transform="translateY(-50%)";n.style.setProperty("--max-height",`calc(100vh - ${n.style.top||n.style.bottom})`),n.style.setProperty("--max-width",`calc(100vw - ${n.style.left||n.style.right})`)};function ns(n,t=!0){return(e,a)=>{let o=n(e),s=n(a);for(let i in o)if(o[i]!==s[i])return(Array.isArray(t)?t[i]!==!1:t)?o[i]>s[i]?1:-1:o[i]>s[i]?-1:1;return 0}}var{button:mr,span:Lo,input:br}=m,ts=(n,t)=>{return!!n.find((e)=>{if(e===null||t==null)return!1;else if(Array.isArray(e))return ts(e,t);else if(e.value===t||e===t)return!0})};class it extends b{editable=!1;showIcon=!1;hideCaption=!1;options="";value="";placeholder="";filter="";localized=!1;disabled=!1;setValue=(n,t=!1)=>{if(this.value!==n)this.value=n;if(t)this.dispatchEvent(new Event("action"))};getValue=()=>this.value;get selectOptions(){return typeof this.options==="string"?this.options.split(",").map((n)=>n.trim()||null):this.options}buildOptionMenuItem=(n)=>{if(n===null)return null;let{setValue:t,getValue:e}=this,a,o,s;if(typeof n==="string")o=s=n;else({icon:a,caption:o,value:s}=n);if(this.localized)o=E(o);let{options:i}=n;if(i)return{icon:a,caption:o,checked:()=>ts(i,e()),menuItems:i.map(this.buildOptionMenuItem)};return{icon:a,caption:o,checked:()=>e()===s,action:typeof s==="function"?async()=>{let r=await s();if(r!==void 0)t(r,!0)}:()=>{if(typeof s==="string")t(s,!0)}}};get optionsMenu(){let n=this.selectOptions.map(this.buildOptionMenuItem);if(this.filter==="")return n;let t=(e)=>{if(e===null)return!0;else if(e.menuItems)return e.menuItems=e.menuItems.filter(t),e.menuItems.length>0;else return e.caption.toLocaleLowerCase().includes(this.filter)};return n.filter(t)}handleChange=(n)=>{let{value:t}=this.parts,e=t.value||"";if(this.value!==String(e))this.value=e,this.dispatchEvent(new Event("change"));this.filter="",n.stopPropagation(),n.preventDefault()};handleKey=(n)=>{if(n.key==="Enter")n.preventDefault()};filterMenu=Fn(()=>{this.filter=this.parts.value.value.toLocaleLowerCase(),In(0),this.popOptions()});popOptions=(n)=>{if(n&&n.type==="click")this.filter="";this.poppedOptions=this.optionsMenu,J({target:this,menuItems:this.poppedOptions,showChecked:!0})};content=()=>[mr({part:"button",onClick:this.popOptions},Lo(),br({part:"value",value:this.value,tabindex:0,onKeydown:this.handleKey,onInput:this.filterMenu,onChange:this.handleChange}),y.chevronDown())];constructor(){super();this.initAttributes("options","editable","placeholder","showIcon","hideCaption","localized","disabled")}get allOptions(){let n=[];function t(e){for(let a of e)if(typeof a==="string")n.push({caption:a,value:a});else if(a?.value)n.push(a);else if(a?.options)t(a.options)}return t(this.selectOptions),n}findOption(){return this.allOptions.find((n)=>n.value===this.value)||{caption:this.value,value:this.value}}localeChanged=()=>{this.queueRender()};connectedCallback(){if(super.connectedCallback(),this.localized)Y.allInstances.add(this)}disconnectedCallback(){if(super.disconnectedCallback(),this.localized)Y.allInstances.delete(this)}render(){super.render();let{value:n,button:t}=this.parts;t.disabled=this.disabled;let e=n.previousElementSibling,a=this.findOption(),o=Lo();if(n.value=this.localized?E(a.caption):a.caption,a.icon)if(a.icon instanceof HTMLElement)o=a.icon.cloneNode(!0);else o=y[a.icon]();e.replaceWith(o),n.setAttribute("placeholder",this.localized?E(this.placeholder):this.placeholder),n.style.pointerEvents=this.editable?"":"none",n.readOnly=!this.editable}}var Tn=it.elementCreator({tag:"xin-select",styleSpec:{":host":{"--gap":"8px","--touch-size":"44px","--padding":"0 8px","--value-padding":"0 8px","--icon-width":"24px","--fieldWidth":"140px",display:"inline-block",position:"relative"},":host button":{display:"flex",alignItems:"center",justifyItems:"center",gap:d.gap,textAlign:"left",height:d.touchSize,padding:d.padding,position:"relative",width:"100%"},":host:not([show-icon]) button > :first-child":{display:"none"},":host[hide-caption] button > :nth-child(2)":{display:"none"},':host [part="value"]':{width:d.fieldWidth,padding:d.valuePadding,height:d.touchSize,lineHeight:d.touchSize,boxShadow:"none",whiteSpace:"nowrap",outline:"none",background:"transparent",flex:"1"},':host [part="value"]:not(:focus)':{overflow:"hidden",textOverflow:"ellipsis",background:"transparent"}}}),{span:es}=m,{i18n:I}=U({i18n:{locale:window.navigator.language,locales:[window.navigator.language],languages:[window.navigator.language],emoji:[""],stringMap:{},localeOptions:[{icon:es(),caption:window.navigator.language,value:window.navigator.language}]}});$.localeOptions={toDOM(n,t){if(n instanceof it)n.options=t}};var gr=(n)=>{if(I.locales.includes(n))I.locale=n;else console.error(`language ${n} is not available`)},ea=()=>{let n=Array.from(Y.allInstances);for(let t of n)t.localeChanged()};xt(I.locale.xinPath,ea);var yr=ns((n)=>[n.caption.toLocaleLowerCase()]);function fr(n){let[t,,e,a,...o]=n.split(`
`).map((s)=>s.split("\t"));if(t&&e&&a&&o){if(I.locales=t,I.languages=e,I.emoji=a,I.stringMap=o.reduce((s,i)=>{return s[i[0].toLocaleLowerCase()]=i,s},{}),I.localeOptions=t.map((s,i)=>({icon:es({title:t[i]},a[i]),caption:e[i],value:s})).sort(yr),!I.locales.includes(I.locale.valueOf())){let s=I.locale.substring(0,2);I.locale=I.locales.find((i)=>i.substring(0,2)===s)||I.locales[0]}ea()}}function E(n){if(n.endsWith("…"))return E(n.substring(0,n.length-1))+"…";let t=I.locales.indexOf(I.locale.valueOf());if(t>-1){let e=I.stringMap[n.toLocaleLowerCase()],a=e&&e[t];if(a)n=n.toLocaleLowerCase()===n?a.toLocaleLowerCase():a.valueOf()}return n}class aa extends b{hideCaption=!1;content=()=>{return Tn({part:"select",showIcon:!0,title:E("Language"),bindValue:I.locale,bindLocaleOptions:I.localeOptions})};constructor(){super();this.initAttributes("hideCaption")}render(){super.render(),this.parts.select.toggleAttribute("hide-caption",this.hideCaption)}}var vr=aa.elementCreator({tag:"xin-locale-picker"});class Y extends b{static allInstances=new Set;contents=()=>m.xinSlot();refString="";constructor(){super();this.initAttributes("refString")}connectedCallback(){super.connectedCallback(),Y.allInstances.add(this)}disconnectedCallback(){super.disconnectedCallback(),Y.allInstances.delete(this)}localeChanged(){if(!this.refString)this.refString=this.textContent||"";this.textContent=this.refString?E(this.refString):""}render(){super.render(),this.localeChanged()}}var Xt=Y.elementCreator({tag:"xin-localized",styleSpec:{":host":{pointerEvents:"none"}}}),wr=(n,t)=>{t=t.toLocaleLowerCase();let e=!!t.match(/\^|ctrl/),a=!!t.match(/⌘|meta/),o=!!t.match(/⌥|⎇|alt|option/),s=!!t.match(/⇧|shift/),i=t.slice(-1);return n.key===i&&n.metaKey===a&&n.ctrlKey===e&&n.altKey===o&&n.shiftKey===s},{div:Do,button:oa,span:V,a:xr,xinSlot:kr}=m;Gn("xin-menu-helper",{".xin-menu":{overflow:"hidden auto",maxHeight:`calc(${d.maxHeight} - ${p.menuInset("8px")})`,borderRadius:d.spacing50,background:p.menuBg("#fafafa"),boxShadow:p.menuShadow(`${d.spacing13} ${d.spacing50} ${d.spacing} #0004`)},".xin-menu > div":{width:p.menuWidth("auto")},".xin-menu-trigger":{paddingLeft:0,paddingRight:0,minWidth:p.touchSize("48px")},".xin-menu-separator":{display:"inline-block",content:" ",height:"1px",width:"100%",background:p.menuSeparatorColor("#2224"),margin:p.menuSeparatorMargin("8px 0")},".xin-menu-item":{boxShadow:"none",border:"none !important",display:"grid",alignItems:"center",justifyContent:"flex-start",textDecoration:"none",gridTemplateColumns:"0px 1fr 30px",width:"100%",gap:0,background:"transparent",padding:p.menuItemPadding("0 16px"),height:p.menuItemHeight("48px"),lineHeight:p.menuItemHeight("48px"),textAlign:"left"},".xin-menu-item, .xin-menu-item > span":{color:p.menuItemColor("#222")},".xin-menu-with-icons .xin-menu-item":{gridTemplateColumns:"30px 1fr 30px"},".xin-menu-item svg":{stroke:p.menuItemIconColor("#222")},".xin-menu-item.xin-menu-item-checked":{background:p.menuItemHoverBg("#eee")},".xin-menu-item > span:nth-child(2)":{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textAlign:"left"},".xin-menu-item:hover":{boxShadow:"none !important",background:p.menuItemHoverBg("#eee")},".xin-menu-item:active":{boxShadow:"none !important",background:p.menuItemActiveBg("#aaa"),color:p.menuItemActiveColor("#000")},".xin-menu-item:active svg":{stroke:p.menuItemIconActiveColor("#000")}});var as=(n,t)=>{let e=n.checked&&n.checked()&&"check"||!1,a=n?.icon||e||V(" ");if(typeof a==="string")a=y[a]();let o;if(typeof n?.action==="string")o=xr({class:"xin-menu-item",href:n.action},a,t.localized?V(E(n.caption)):V(n.caption),V(n.shortcut||" "));else o=oa({class:"xin-menu-item",onClick:n.action},a,t.localized?V(E(n.caption)):V(n.caption),V(n.shortcut||" "));if(o.classList.toggle("xin-menu-item-checked",e!==!1),n?.enabled&&!n.enabled())o.setAttribute("disabled","");return o},os=(n,t)=>{let e=n.checked&&n.checked()&&"check"||!1,a=n?.icon||e||V(" ");if(typeof a==="string")a=y[a]();let o=oa({class:"xin-menu-item",disabled:!(!n.enabled||n.enabled()),onClick(s){J(Object.assign({},t,{menuItems:n.menuItems,target:o,submenuDepth:(t.submenuDepth||0)+1,position:"side"})),s.stopPropagation(),s.preventDefault()}},a,t.localized?V(E(n.caption)):V(n.caption),y.chevronRight({style:{justifySelf:"flex-end"}}));return o},ss=(n,t)=>{if(n===null)return V({class:"xin-menu-separator"});else{let e=n?.action?as(n,t):os(n,t);if(t.showChecked&&n.checked&&n.checked())requestAnimationFrame(()=>{e.scrollIntoView({block:"center"})});return e}},is=(n)=>{let{target:t,width:e,menuItems:a}=n,o=a.find((s)=>s?.icon||s?.checked);return Do({class:o?"xin-menu xin-menu-with-icons":"xin-menu",onClick(){In(0)}},Do({style:{minWidth:t.offsetWidth+"px",width:typeof e==="number"?`${e}px`:e},onMousedown(s){s.preventDefault(),s.stopPropagation()}},...a.map((s)=>ss(s,n))))},On,kn=[],In=(n=0)=>{let t=kn.splice(n);for(let e of t)e.menu.remove();return On=t[0],n>0?kn[n-1]:void 0};document.body.addEventListener("mousedown",(n)=>{if(n.target&&!kn.find((t)=>t.target.contains(n.target)))In(0)});document.body.addEventListener("keydown",(n)=>{if(n.key==="Escape")In(0)});var J=(n)=>{n=Object.assign({submenuDepth:0},n);let{target:t,position:e,submenuDepth:a}=n;if(On&&!document.body.contains(On?.menu))On=void 0;if(kn.length&&!document.body.contains(kn[0].menu))kn.splice(0);if(a===0&&On?.target===t)return;let o=In(a);if(On?.target===t)return;if(o&&o.target===t){In();return}if(!n.menuItems?.length)return;let s=is(n),i=Zo({content:s,target:t,position:e});i.remainOnScroll="remove",kn.push({target:t,menu:i})};function rs(n,t){for(let e of n){if(!e)continue;let{shortcut:a}=e,{menuItems:o}=e;if(a){if(wr(t,a))return e}else if(o){let s=rs(o,t);if(s)return s}}return}class sa extends b{menuItems=[];menuWidth="auto";localized=!1;showMenu=(n)=>{if(n.type==="click"||n.code==="Space")J({target:this.parts.trigger,width:this.menuWidth,localized:this.localized,menuItems:this.menuItems}),n.stopPropagation(),n.preventDefault()};content=()=>oa({tabindex:0,part:"trigger",onClick:this.showMenu},kr());handleShortcut=async(n)=>{let t=rs(this.menuItems,n);if(t){if(t.action instanceof Function)t.action()}};constructor(){super();this.initAttributes("menuWidth","localized","icon"),this.addEventListener("keydown",this.showMenu)}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.handleShortcut,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.handleShortcut)}}var jr=sa.elementCreator({tag:"xin-menu",styleSpec:{":host":{display:"inline-block"},":host button > xin-slot":{display:"flex",alignItems:"center",gap:p.xinMenuTriggerGap("10px")}}}),ls={};or(ls,{init:()=>ps,draggedElement:()=>Er});var Cr=()=>!!document.querySelector(".drag-source"),ds=(n,t)=>{if(!n)return!1;for(let e of n)if(e==="special/any")return!0;else if(e.indexOf("*")>-1){let[a,o]=e.split("/"),[s,i]=t.split("/");if((a==="*"||a===s)&&(o==="*"||o===i))return!0}else if(e===t)return!0},Rt=(n)=>{for(let t of[...document.querySelectorAll(`.${n}`)])t.classList.remove(n)},cs=()=>{Rt("drag-over"),Rt("drag-source"),Rt("drag-target")},Ge=(n,t=";")=>{return(n||"").split(t).map((e)=>e.trim()).filter((e)=>e!=="")},hs=(n)=>{if(!n)n=[];let t=[...document.querySelectorAll("[data-drop]")];for(let e of t){let a=Ge(e.dataset.drop);if(n.find((o)=>ds(a,o)))e.classList.add("drag-target");else e.classList.remove("drag-target")}};function Sr(n){let t=n.target?.closest('[draggable="true"],a[href]');if(!t)return;t.classList.add("drag-source");let e=t.matches('[draggable="true"]')?Ge(t.dataset.drag||"text/html"):Ge(t.dataset.drag||"url");for(let a of e){let o=t.dataset.dragContent||(a==="text/html"?t.innerHTML:t.textContent);n.dataTransfer?.setData(a,o||"")}hs(n.dataTransfer?.types),n.stopPropagation()}function Ao(n){if(!Cr())hs(n.dataTransfer?.types);let t=n.target.closest(".drag-target");if(t&&n.dataTransfer)t.classList.add("drag-over"),n.dataTransfer.dropEffect="copy";else n.preventDefault(),n.stopPropagation()}function Tr(){Rt("drag-over")}function Ir(n){let t=n.target.closest(".drag-target");if(t){let e=(t.dataset?.drop||"").split(";");for(let a of e)if(ds(n.dataTransfer?.types,a))if(a==="text/html")t.innerHTML=n.dataTransfer?.getData(a)||"";else t.textContent=n.dataTransfer?.getData(a)||""}cs()}var Er=()=>document.querySelector(".drag-source"),Oo=!1,ps=()=>{if(Oo)return;document.body.addEventListener("dragstart",Sr),document.body.addEventListener("dragenter",Ao),document.body.addEventListener("dragover",Ao),document.body.addEventListener("drop",Ir),document.body.addEventListener("dragleave",Tr),document.body.addEventListener("dragend",cs),window.addEventListener("dragover",(n)=>n.preventDefault()),window.addEventListener("drop",(n)=>n.preventDefault()),Oo=!0};function Br(n,t,e){let a=n.find((o)=>o[t]!==void 0&&o[t]!==null);if(a!==void 0){let o=a[t];switch(typeof o){case"string":if(o.match(/^\d+(\.\d+)?$/))return 6*e;else if(o.includes(" "))return 20*e;else return 12*e;case"number":return 6*e;case"boolean":return 5*e;case"object":return!1;default:return 8*e}}return!1}var{div:An,span:Dt,button:Pr,template:Mr}=m,zo=(n)=>n;class ia extends b{select=!1;multiple=!1;nosort=!1;nohide=!1;noreorder=!1;selectionChanged=()=>{};localized=!1;selectedKey=Symbol("selected");selectBinding=(n,t)=>{n.toggleAttribute("aria-selected",t[this.selectedKey]===!0)};pinnedTop=0;pinnedBottom=0;maxVisibleRows=1e4;get value(){return{array:this.array,filter:this.filter,columns:this.columns}}set value(n){let{array:t,columns:e,filter:a}=gn(n);if(this._array!==t||this._columns!==e||this._filter!==a)this.queueRender();this._array=t||[],this._columns=e||null,this._filter=a||zo}rowData={visible:[],pinnedTop:[],pinnedBottom:[]};_array=[];_columns=null;_filter=zo;charWidth=15;rowHeight=30;minColumnWidth=30;get virtual(){return this.rowHeight>0?{height:this.rowHeight}:void 0}constructor(){super();this.rowData=U({[this.instanceId]:this.rowData})[this.instanceId],this.initAttributes("rowHeight","charWidth","minColumnWidth","select","multiple","pinnedTop","pinnedBottom","nosort","nohide","noreorder","localized")}get array(){return this._array}set array(n){this._array=gn(n),this.queueRender()}get filter(){return this._filter}set filter(n){if(this._filter!==n)this._filter=n,this.queueRender()}get sort(){if(this._sort)return this._sort;let n=this._columns?.find((e)=>e.sort==="ascending"||e.sort==="descending");if(!n)return;let{prop:t}=n;return n.sort==="ascending"?(e,a)=>e[t]>a[t]?1:-1:(e,a)=>e[t]>a[t]?-1:1}set sort(n){if(this._sort!==n)this._sort=n,this.queueRender()}get columns(){if(!Array.isArray(this._columns)){let{_array:n}=this;this._columns=Object.keys(n[0]||{}).map((t)=>{let e=Br(n,t,this.charWidth);return{name:t.replace(/([a-z])([A-Z])/g,"$1 $2").toLocaleLowerCase(),prop:t,align:typeof n[0][t]==="number"||n[0][t]!==""&&!isNaN(n[0][t])?"right":"left",visible:e!==!1,width:e?e:0}})}return this._columns}set columns(n){this._columns=n,this.queueRender()}get visibleColumns(){return this.columns.filter((n)=>n.visible!==!1)}content=null;getColumn(n){let t=(n.touches!==void 0?n.touches[0].clientX:n.clientX)-this.getBoundingClientRect().x,e=n.touches!==void 0?20:5,a=0,o=[];return this.visibleColumns.find((s)=>{if(s.visible!==!1)return a+=s.width,o.push(a),Math.abs(t-a)<e})}setCursor=(n)=>{if(this.getColumn(n)!==void 0)this.style.cursor="col-resize";else this.style.cursor=""};resizeColumn=(n)=>{let t=this.getColumn(n);if(t!==void 0){let e=Number(t.width),a=n.touches!==void 0,o=a?n.touches[0].identifier:void 0;an(n,(s,i,r)=>{if((a?[...r.touches].find((c)=>c.identifier===o):!0)===void 0)return!0;let l=e+s;if(t.width=l>this.minColumnWidth?l:this.minColumnWidth,this.setColumnWidths(),r.type==="mouseup")return!0},"col-resize")}};selectRow(n,t=!0){if(t)n[this.selectedKey]=!0;else delete n[this.selectedKey]}selectRows(n,t=!0){for(let e of n||this.array)this.selectRow(e,t)}deSelect(n){this.selectRows(n,!1)}rangeStart;updateSelection=(n)=>{if(!this.select&&!this.multiple)return;let{target:t}=n;if(!(t instanceof HTMLElement))return;let e=t.closest(".tr");if(!(e instanceof HTMLElement))return;let a=yn(e);if(a===!1)return;let o=n,s=window.getSelection();if(s!==null)s.removeAllRanges();let i=this.visibleRows;if(this.multiple&&o.shiftKey&&i.length>0&&this.rangeStart!==a){let r=this.rangeStart===void 0||this.rangeStart[this.selectedKey]===!0,[l,c]=[this.rangeStart!==void 0?i.indexOf(this.rangeStart):0,i.indexOf(a)].sort((h,u)=>h-u);if(l>-1)for(let h=l;h<=c;h++){let u=i[h];this.selectRow(u,r)}}else if(this.multiple&&o.metaKey){this.selectRow(a,!a[this.selectedKey]);let r=i.indexOf(a),l=i[r+1],c=r>0?i[r-1]:void 0;if(l!==void 0&&l[this.selectedKey]===!0)this.rangeStart=l;else if(c!==void 0&&c[this.selectedKey]===!0)this.rangeStart=c;else this.rangeStart=void 0}else this.rangeStart=a,this.deSelect(),this.selectRow(a,!0);this.selectionChanged(this.visibleSelectedRows);for(let r of Array.from(this.querySelectorAll(".tr"))){let l=yn(r);this.selectBinding(r,l)}};connectedCallback(){super.connectedCallback(),this.addEventListener("mousemove",this.setCursor),this.addEventListener("mousedown",this.resizeColumn),this.addEventListener("touchstart",this.resizeColumn,{passive:!0}),this.addEventListener("mouseup",this.updateSelection),this.addEventListener("touchend",this.updateSelection)}setColumnWidths(){this.style.setProperty("--grid-columns",this.visibleColumns.map((n)=>n.width+"px").join(" ")),this.style.setProperty("--grid-row-width",this.visibleColumns.reduce((n,t)=>n+t.width,0)+"px")}sortByColumn=(n,t="auto")=>{for(let e of this.columns.filter((a)=>gn(a.sort)!==!1))if(gn(e)===n){if(t==="auto")e.sort=e.sort==="ascending"?"descending":"ascending";else e.sort=t;this.queueRender()}else delete e.sort};popColumnMenu=(n,t)=>{let{sortByColumn:e}=this,a=this.columns.filter((i)=>i.visible===!1),o=this.queueRender.bind(this),s=[];if(!this.nosort&&t.sort!==!1)s.push({caption:this.localized?`${E("Sort")} ${E("Ascending")}`:"Sort Ascending",icon:"sortAscending",action(){e(t)}},{caption:this.localized?`${E("Sort")} ${E("Descending")}`:"Sort Ascending",icon:"sortDescending",action(){e(t,"descending")}});if(!this.nohide){if(s.length)s.push(null);s.push({caption:this.localized?`${E("Hide")} ${E("Column")}`:"Hide Column",icon:"eyeOff",enabled:()=>t.visible!==!0,action(){t.visible=!1,o()}},{caption:this.localized?`${E("Show")} ${E("Column")}`:"Show Column",icon:"eye",enabled:()=>a.length>0,menuItems:a.map((i)=>{return{caption:i.name||i.prop,action(){delete i.visible,o()}}})})}J({target:n,localized:this.localized,menuItems:s})};get captionSpan(){return this.localized?Xt:Dt}headerCell=(n)=>{let{popColumnMenu:t}=this,e="none",a;switch(n.sort){case"ascending":a=y.sortAscending(),e="descending";break;case!1:break;default:break;case"descending":e="ascending",a=y.sortDescending()}let o=!(this.nosort&&this.nohide)?Pr({class:"menu-trigger",onClick(s){t(s.target,n),s.stopPropagation()}},a||y.moreVertical()):{};return n.headerCell!==void 0?n.headerCell(n):Dt({class:"th",role:"columnheader",ariaSort:e,style:{...this.cellStyle,textAlign:n.align||"left"}},this.captionSpan(typeof n.name==="string"?n.name:n.prop),Dt({style:{flex:"1"}}),o)};dataCell=(n)=>{if(n.dataCell!==void 0)return n.dataCell(n);return Dt({class:"td",role:"cell",style:{...this.cellStyle,textAlign:n.align||"left"},bindText:`^.${n.prop}`})};get visibleRows(){return gn(this.rowData.visible)}get visibleSelectedRows(){return this.visibleRows.filter((n)=>n[this.selectedKey])}get selectedRows(){return this.array.filter((n)=>n[this.selectedKey])}rowTemplate(n){return Mr(An({class:"tr",role:"row",bind:{value:"^",binding:{toDOM:this.selectBinding}}},...n.map(this.dataCell)))}draggedColumn;dropColumn=(n)=>{let t=n.target.closest(".drag-over"),e=Array.from(t.parentElement.children).indexOf(t),a=this.visibleColumns[e],o=this.columns.indexOf(this.draggedColumn),s=this.columns.indexOf(a);this.columns.splice(o,1),this.columns.splice(s,0,this.draggedColumn),console.log({event:n,target:t,targetIndex:e,draggedIndex:o,droppedIndex:s}),this.queueRender(),n.preventDefault(),n.stopPropagation()};render(){super.render(),this.rowData.pinnedTop=this.pinnedTop>0?this._array.slice(0,this.pinnedTop):[],this.rowData.pinnedBottom=this.pinnedBottom>0?this._array.slice(this._array.length-this.pinnedBottom):[],this.rowData.visible=this.filter(this._array.slice(this.pinnedTop,Math.min(this.maxVisibleRows,this._array.length-this.pinnedTop-this.pinnedBottom)));let{sort:n}=this;if(n)this.rowData.visible.sort(n);this.textContent="",this.style.display="flex",this.style.flexDirection="column";let{visibleColumns:t}=this;if(this.style.setProperty("--row-height",`${this.rowHeight}px`),this.setColumnWidths(),!this.noreorder)ps();let e=this.instanceId+"-column-header",a=t.map((o)=>{let s=this.headerCell(o);if(!this.noreorder)s.setAttribute("draggable","true"),s.dataset.drag=e,s.dataset.drop=e,s.addEventListener("dragstart",()=>{this.draggedColumn=o}),s.addEventListener("drop",this.dropColumn);return s});if(this.append(An({class:"thead",role:"rowgroup",style:{touchAction:"none"}},An({class:"tr",role:"row"},...a))),this.pinnedTop>0)this.append(An({part:"pinnedTopRows",class:"tbody",role:"rowgroup",style:{flex:"0 0 auto",overflow:"hidden",height:`${this.rowHeight*this.pinnedTop}px`},bindList:{value:this.rowData.pinnedTop,virtual:this.virtual}},this.rowTemplate(t)));if(this.append(An({part:"visibleRows",class:"tbody",role:"rowgroup",style:{content:" ",minHeight:"100px",flex:"1 1 100px",overflow:"hidden auto"},bindList:{value:this.rowData.visible,virtual:this.virtual}},this.rowTemplate(t))),this.pinnedBottom>0)this.append(An({part:"pinnedBottomRows",class:"tbody",role:"rowgroup",style:{flex:"0 0 auto",overflow:"hidden",height:`${this.rowHeight*this.pinnedBottom}px`},bindList:{value:this.rowData.pinnedBottom,virtual:this.virtual}},this.rowTemplate(t)))}}var Lr=ia.elementCreator({tag:"xin-table",styleSpec:{":host":{overflow:"auto hidden"},":host .thead, :host .tbody":{width:d.gridRowWidth},":host .tr":{display:"grid",gridTemplateColumns:d.gridColumns,height:d.rowHeight,lineHeight:d.rowHeight},":host .td, :host .th":{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",display:"flex",alignItems:"center"},":host .th .menu-trigger":{color:"currentColor",background:"none",padding:0,lineHeight:d.touchSize,height:d.touchSize,width:d.touchSize},':host [draggable="true"]':{cursor:"ew-resize"},':host [draggable="true"]:active':{background:p.draggedHeaderBg("#0004"),color:p.draggedHeaderColor("#fff")},":host .drag-over":{background:p.dropHeaderBg("#fff4")}}}),{dialog:Dr,button:Re,header:Ar,footer:Or,xinSlot:He,h3:Ne,p:Ve,label:zr,input:_r,div:Rr}=m;class ra extends b{static async alert(n,t="Alert"){return new Promise((e)=>{let a=Ht({removeOnClose:!0,closeOnBackgroundClick:!0,dialogWillClose(){e()}},Ne({slot:"header"},t),Ve(n));document.body.append(a),a.showModal()})}static async confirm(n,t="Confirm"){return new Promise((e)=>{let a=Ht({removeOnClose:!0,dialogWillClose(o){e(o==="confirm")}},Ne({slot:"header"},t),Ve(n),Re({slot:"footer",onClick(){a.close()}},"Cancel"));document.body.append(a),a.showModal()})}static async prompt(n,t="Prompt",e=""){return new Promise((a)=>{let o=_r({value:e}),s=Ht({removeOnClose:!0,dialogWillClose(i){a(i==="confirm"?o.value:null)},initialFocus(){o.focus()}},Ne({slot:"header"},t),Ve(zr({style:{display:"flex",flexDirection:"column",alignItems:"stretch",gap:5}},Rr(n),o)),Re({slot:"footer",onClick(){s.close()}},"Cancel"));document.body.append(s),s.showModal()})}removeOnClose=!1;closeOnBackgroundClick=!1;constructor(){super();this.initAttributes("removeOnClose","closeOnBackgroundClick"),Dn(this,"click",()=>{if(this.closeOnBackgroundClick)this.close()})}dialogWillClose=(n="cancel")=>{console.log("dialog will close with",n)};initialFocus(){this.parts.ok.focus()}#n=(n)=>{};showModal=()=>{return this.style.zIndex=String(Wt()),new Promise((n)=>{this.#n=n,this.parts.dialog.showModal(),requestAnimationFrame(()=>{this.initialFocus()})})};close=(n="cancel")=>{if(this.dialogWillClose(n),this.#n(n),this.parts.dialog.close(),this.removeOnClose)this.remove()};ok=()=>{this.close("confirm")};content=()=>Dr({part:"dialog"},Ar(He({name:"header"})),He(),Or(He({name:"footer"}),Re({part:"ok",onClick:this.ok},"OK")))}var Ht=ra.elementCreator({tag:"tosi-dialog",styleSpec:{":host > dialog::backdrop":{backdropFilter:"blur(8px)"},":host > dialog:not([open])":{display:"none"},":host > dialog[open]":{minWidth:300,border:0,borderRadius:10,overflow:"hidden",maxHeight:"calc(100% - 20px)",padding:0,display:"flex",flexDirection:"column",gap:5,boxShadow:"0 5px 10px #0004"},":host > dialog > *":{padding:"0 20px"},":host > dialog > header":{display:"flex",justifyContent:"center",gap:10},":host > dialog > footer":{display:"flex",justifyContent:"flex-end",gap:10,paddingBottom:20}}}),{div:H,slot:Hr}=m;class N extends b{static angleSize=15;static gridSize=8;static snapAngle=!1;static snapToGrid=!1;static styleSpec={":host":{"--handle-bg":"#fff4","--handle-color":"#2228","--handle-hover-bg":"#8ff8","--handle-hover-color":"#222","--handle-size":"20px","--handle-padding":"2px"},":host ::slotted(*)":{position:"absolute"},":host > :not(style,slot)":{boxSizing:"border-box",content:'" "',position:"absolute",display:"flex",height:d.handleSize,width:d.handleSize,padding:d.handlePadding,"--text-color":d.handleColor,background:d.handleBg},":host > .drag-size":{top:0,bottom:0,left:0,right:0,height:"auto",width:"auto",background:"transparent",cursor:"ew-resize"},':host > [part="rotate"]':{transform:`translateY(${d.handleSize_50})`},":host > [locked] > svg:first-child, :host > :not([locked]) > svg+svg":{display:"none"},":host .icon-unlock":{opacity:0.5},":host svg":{pointerEvents:"none"},":host > *:hover":{"--text-color":d.handleHoverColor,background:d.handleHoverBg}};static snappedCoords(n,t){let{gridSize:e}=N;return N.snapToGrid||n.shiftKey?t.map((a)=>Math.round(a/e)*e):t}static snappedAngle(n,t){let{angleSize:e}=N;return N.snapAngle||n.shiftKey?Math.round(t/e)*e:t}get locked(){let n=this.parentElement;if(n.style.inset)return{left:!0,top:!0,bottom:!0,right:!0};let t=n.style.right.match(/\d/)!==null,e=!t||n.style.left.match(/\d/)!==null,a=n.style.bottom.match(/\d/)!==null,o=!a||n.style.top.match(/\d/)!==null;return{left:e,top:o,bottom:a,right:t}}set locked(n){let{bottom:t,right:e}=n,{left:a,top:o}=n,s=this.parentElement,i=s.offsetLeft,r=s.offsetTop,l=s.offsetWidth,c=s.offsetHeight,h=s.offsetParent.offsetWidth-i-l,u=s.offsetParent.offsetHeight-r-c;if(Object.assign(s.style,{left:"",right:"",top:"",bottom:"",width:"",height:""}),!e)a=!0;if(!t)o=!0;if(a)s.style.left=i+"px";if(e)s.style.right=h+"px";if(a&&e)s.style.width="auto";else s.style.width=l+"px";if(o)s.style.top=r+"px";if(t)s.style.bottom=u+"px";if(o&&t)s.style.height="auto";else s.style.height=c+"px";this.queueRender()}get coords(){let{top:n,left:t,right:e,bottom:a}=this.parentElement.style;return{top:parseFloat(n),left:parseFloat(t),right:parseFloat(e),bottom:parseFloat(a)}}get left(){return this.parentElement.offsetLeft}get width(){return this.parentElement.offsetWidth}get right(){return this.parentElement.offsetParent.offsetWidth-(this.left+this.width)}get top(){return this.parentElement.offsetTop}get height(){return this.parentElement.offsetHeight}get bottom(){return this.parentElement.offsetParent.offsetHeight-(this.top+this.height)}triggerChange=()=>{this.parentElement.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))};adjustPosition=(n)=>{let{locked:t}=this;this.locked=t;let e=this.parentElement,{top:a,left:o,bottom:s,right:i}=this.coords;an(n,(r,l,c)=>{if([r,l]=N.snappedCoords(c,[r,l]),!isNaN(a))e.style.top=a+l+"px";if(!isNaN(s))e.style.bottom=s-l+"px";if(!isNaN(o))e.style.left=o+r+"px";if(!isNaN(i))e.style.right=i-r+"px";if(c.type==="mouseup")return this.triggerChange(),!0})};resize=(n)=>{let t=this.parentElement,{locked:e}=this;this.locked=Object.assign({left:!0,top:!0,right:!0,bottom:!0});let[a,o]=[this.right,this.bottom];an(n,(s,i,r)=>{let l=a-s,c=o-i;if([l,c]=N.snappedCoords(r,[l,c]),t.style.right=l+"px",t.style.bottom=c+"px",r.type==="mouseup")return this.locked=e,this.triggerChange(),!0})};adjustSize=(n)=>{let t=this.parentElement,{locked:e}=this,a=n.target.getAttribute("part");this.locked=Object.assign({left:!0,right:!0,top:!0,bottom:!0});let o=this[a];an(n,(s,i,r)=>{let[l]=N.snappedCoords(r,[o+(["left","right"].includes(a)?s:i)*(["right","bottom"].includes(a)?-1:1)]);if(t.style[a]=l+"px",r.type==="mouseup")return this.locked=e,this.triggerChange(),!0})};get rect(){return this.parentElement.getBoundingClientRect()}get center(){let n=this.parentElement.getBoundingClientRect();return{x:n.x+n.width*0.5,y:n.y+n.height*0.5}}get element(){return this.parentElement}adjustRotation=(n)=>{let{center:t}=this,{transformOrigin:e}=this.element.style;if(!e)this.element.style.transformOrigin="50% 50%";an(n,(a,o,s)=>{let{clientX:i,clientY:r}=s,l=i-t.x,c=r-t.y,h=c>0?90:-90;if(l!==0)h=Math.atan2(c,l)*180/Math.PI;if(h=N.snappedAngle(s,h),h===0)this.element.style.transformOrigin="",this.element.style.transform="";else this.element.style.transform=`rotate(${h}deg)`;return this.triggerChange(),s.type==="mouseup"})};toggleLock=(n)=>{let{locked:t}=this,e=n.target.title.split(" ")[1];t[e]=!t[e],this.locked=t,this.queueRender(),n.stopPropagation(),n.preventDefault()};content=()=>[H({part:"move",style:{top:"50%",left:"50%",transform:"translate(-50%,-50%)"}},y.move()),H({part:"left",title:"resize left",class:"drag-size",style:{left:"-6px",width:"8px"}}),H({part:"right",title:"resize right",class:"drag-size",style:{left:"calc(100% - 2px)",width:"8px"}}),H({part:"top",title:"resize top",class:"drag-size",style:{top:"-6px",height:"8px",cursor:"ns-resize"}}),H({part:"bottom",title:"resize bottom",class:"drag-size",style:{top:"calc(100% - 2px)",height:"8px",cursor:"ns-resize"}}),H({part:"resize",style:{top:"100%",left:"100%"}},y.resize()),H({part:"rotate",style:{top:"50%",right:"0"}},y.refreshCw()),H({part:"lockLeft",title:"lock left",style:{top:"50%",left:0,transform:"translate(-100%, -50%)"}},y.unlock(),y.lock()),H({part:"lockRight",title:"lock right",style:{top:"50%",left:"100%",transform:"translate(0%, -50%)"}},y.unlock(),y.lock()),H({part:"lockTop",title:"lock top",style:{top:0,left:"50%",transform:"translate(-50%, -100%)"}},y.unlock(),y.lock()),H({part:"lockBottom",title:"lock bottom",style:{top:"100%",left:"50%",transform:"translate(-50%, 0%)"}},y.unlock(),y.lock()),Hr()];constructor(){super();this.initAttributes("rotationSnap","positionSnap")}connectedCallback(){super.connectedCallback();let{left:n,right:t,top:e,bottom:a,lockLeft:o,lockRight:s,lockTop:i,lockBottom:r,move:l,resize:c,rotate:h}=this.parts,u={passive:!0};[n,t,e,a].forEach((g)=>{g.addEventListener("mousedown",this.adjustSize,u),g.addEventListener("touchstart",this.adjustSize,u)}),[o,s,i,r].forEach((g)=>{g.addEventListener("click",this.toggleLock)}),c.addEventListener("mousedown",this.resize,u),l.addEventListener("mousedown",this.adjustPosition,u),h.addEventListener("mousedown",this.adjustRotation,u),c.addEventListener("touchstart",this.resize,u),l.addEventListener("touchstart",this.adjustPosition,u),h.addEventListener("touchstart",this.adjustRotation,u)}render(){if(super.render(),!this.parentElement)return;let{lockLeft:n,lockRight:t,lockTop:e,lockBottom:a}=this.parts,{left:o,right:s,top:i,bottom:r}=this.locked;n.toggleAttribute("locked",o),t.toggleAttribute("locked",s),e.toggleAttribute("locked",i),a.toggleAttribute("locked",r)}}var Nr=N.elementCreator({tag:"xin-editable"}),{div:Vr,input:Wr,button:$e,span:Xr}=m,_o=(n)=>n,Ro="null filter, everything matches",la={contains:{caption:"contains",negative:"does not contain",makeTest:(n)=>{return n=n.toLocaleLowerCase(),(t)=>String(t).toLocaleLowerCase().includes(n)}},hasTags:{caption:"has tags",makeTest:(n)=>{let t=n.split(/[\s,]/).map((e)=>e.trim().toLocaleLowerCase()).filter((e)=>e!=="");return(e)=>Array.isArray(e)&&t.find((a)=>!e.includes(a))===void 0}},doesNotHaveTags:{caption:"does not have tags",makeTest:(n)=>{let t=n.split(/[\s,]/).map((e)=>e.trim().toLocaleLowerCase()).filter((e)=>e!=="");return(e)=>Array.isArray(e)&&t.find((a)=>e.includes(a))===void 0}},equals:{caption:"=",negative:"≠",makeTest:(n)=>{if(isNaN(Number(n)))return n=String(n).toLocaleLowerCase(),(e)=>String(e).toLocaleLowerCase()===n;let t=Number(n);return(e)=>Number(e)===t}},after:{caption:"is after",negative:"is before",makeTest:(n)=>{let t=new Date(n);return(e)=>new Date(e)>t}},greaterThan:{caption:">",negative:"≤",makeTest:(n)=>{if(!isNaN(Number(n))){let t=Number(n);return(e)=>Number(e)>t}return n=n.toLocaleLowerCase(),(t)=>String(t).toLocaleLowerCase()>n}},truthy:{caption:"is true/non-empty/non-zero",negative:"is false/empty/zero",needsValue:!1,makeTest:()=>(n)=>!!n},isTrue:{caption:"= true",needsValue:!1,makeTest:()=>(n)=>n===!0},isFalse:{caption:"= false",needsValue:!1,makeTest:()=>(n)=>n===!1}},qr={description:"anything",test:()=>!0};function Ho(n){return n.options[n.selectedIndex]?.caption||""}class da extends b{fields=[];filters=la;haystack="*";condition="contains";needle="";content=()=>[Tn({part:"haystack"}),Tn({part:"condition"}),Wr({part:"needle",type:"search"}),Xr({part:"padding"}),$e({part:"remove",title:"delete"},y.trash())];filter=qr;constructor(){super();this.initAttributes("haystack","condition","needle")}get state(){let{haystack:n,needle:t,condition:e}=this.parts;return{haystack:n.value,needle:t.value,condition:e.value}}set state(n){Object.assign(this,n)}buildFilter=()=>{let{haystack:n,condition:t,needle:e}=this.parts,a=t.value.startsWith("~"),o=a?t.value.slice(1):t.value,s=this.filters[o];e.hidden=s.needsValue===!1;let i=s.needsValue===!1?s.makeTest(void 0):s.makeTest(e.value),r=n.value,l;if(r!=="*")l=a?(u)=>!i(u[r]):(u)=>i(u[r]);else l=a?(u)=>Object.values(u).find((g)=>!i(g))!==void 0:(u)=>Object.values(u).find((g)=>i(g))!==void 0;let c=s.needsValue!==!1?` "${e.value}"`:"",h=`${Ho(n)} ${Ho(t)}${c}`;this.filter={description:h,test:l},this.parentElement?.dispatchEvent(new Event("change"))};connectedCallback(){super.connectedCallback();let{haystack:n,condition:t,needle:e,remove:a}=this.parts;n.addEventListener("change",this.buildFilter),t.addEventListener("change",this.buildFilter),e.addEventListener("input",this.buildFilter),n.value=this.haystack,t.value=this.condition,e.value=this.needle,a.addEventListener("click",()=>{let{parentElement:o}=this;this.remove(),o?.dispatchEvent(new Event("change"))})}render(){super.render();let{haystack:n,condition:t,needle:e}=this.parts;if(n.options=[{caption:"any field",value:"*"},...this.fields.map((a)=>a.prop)],t.options=Object.keys(this.filters).map((a)=>{let o=this.filters[a];return o.negative!==void 0?[{caption:o.caption,value:a},{caption:o.negative,value:"~"+a}]:{caption:o.caption,value:a}}).flat(),this.haystack!=="")n.value=this.haystack;if(this.condition!=="")t.value=this.condition;if(this.needle!=="")e.value=this.needle;this.buildFilter()}}var Nt=da.elementCreator({tag:"xin-filter-part",styleSpec:{":host":{display:"flex"},":host .xin-icon:":{verticalAlign:"middle",pointerEvents:"none"},':host [part="haystack"], :host [part="condition"]':{flex:"1"},':host [part="needle"]':{flex:2},':host [hidden]+[part="padding"]':{display:"block",content:" ",flex:"1 1 auto"}}});class ca extends b{_fields=[];get fields(){return this._fields}set fields(n){this._fields=n,this.queueRender()}get state(){let{filterContainer:n}=this.parts;return[...n.children].map((t)=>t.state)}set state(n){let{fields:t,filters:e}=this,{filterContainer:a}=this.parts;a.textContent="";for(let o of n)a.append(Nt({fields:t,filters:e,...o}))}filter=_o;description=Ro;addFilter=()=>{let{fields:n,filters:t}=this,{filterContainer:e}=this.parts;e.append(Nt({fields:n,filters:t}))};content=()=>[$e({part:"add",title:"add filter condition",onClick:this.addFilter,class:"round"},y.plus()),Vr({part:"filterContainer"}),$e({part:"reset",title:"reset filter",onClick:this.reset},y.x())];filters=la;reset=()=>{let{fields:n,filters:t}=this,{filterContainer:e}=this.parts;this.description=Ro,this.filter=_o,e.textContent="",e.append(Nt({fields:n,filters:t})),this.dispatchEvent(new Event("change"))};buildFilter=()=>{let{filterContainer:n}=this.parts;if(n.children.length===0){this.reset();return}let t=[...n.children].map((a)=>a.filter),e=t.map((a)=>a.test);this.description=t.map((a)=>a.description).join(", "),this.filter=(a)=>a.filter((o)=>e.find((s)=>s(o)===!1)===void 0),this.dispatchEvent(new Event("change"))};connectedCallback(){super.connectedCallback();let{filterContainer:n}=this.parts;n.addEventListener("change",this.buildFilter),this.reset()}render(){super.render()}}var Ur=ca.elementCreator({tag:"xin-filter",styleSpec:{":host":{height:"auto",display:"grid",gridTemplateColumns:"32px calc(100% - 64px) 32px",alignItems:"center"},':host [part="filterContainer"]':{display:"flex",flexDirection:"column",alignItems:"stretch",flex:"1 1 auto"},':host [part="haystack"]':{_fieldWidth:"100px"},':host [part="condition"]':{_fieldWidth:"60px"},':host [part="needle"]':{_fieldWidth:"80px"},':host [part="add"], :host [part="reset"]':{"--button-size":"var(--touch-size, 32px)",borderRadius:"999px",height:"var(--button-size)",lineHeight:"var(--button-size)",margin:"0",padding:"0",textAlign:"center",width:"var(--button-size)",flex:"0 0 var(--button-size)"}}}),{form:Fr,slot:We,xinSlot:No,label:Yr,input:Jr,span:Gr}=m;function en(n,t,e){if(e!==""&&e!==!1)n.setAttribute(t,e);else n.removeAttribute(t)}function $r(n){switch(n.type){case"checkbox":return n.checked;case"radio":{let t=n.parentElement?.querySelector(`input[type="radio"][name="${n.name}"]:checked`);return t?t.value:null}case"range":case"number":return Number(n.value);default:return Array.isArray(n.value)&&n.value.length===0?null:n.value}}function Vo(n,t){if(!(n instanceof HTMLElement));else if(n instanceof HTMLInputElement)switch(n.type){case"checkbox":n.checked=t;break;case"radio":n.checked=t===n.value;break;default:n.value=String(t||"")}else if(t!=null||n.value!=null)n.value=String(t||"")}class qt extends b{caption="";key="";type="";optional=!1;pattern="";placeholder="";min="";max="";step="";fixedPrecision=-1;value=null;content=Yr(No({part:"caption"}),Gr({part:"field"},No({part:"input",name:"input"}),Jr({part:"valueHolder"})));constructor(){super();this.initAttributes("caption","key","type","optional","pattern","placeholder","min","max","step","fixedPrecision","prefix","suffix")}valueChanged=!1;handleChange=()=>{let{input:n,valueHolder:t}=this.parts,e=n.children[0]||t;if(e!==t)t.value=e.value;this.value=$r(e),this.valueChanged=!0;let a=this.closest("xin-form");if(a&&this.key!=="")switch(this.type){case"checkbox":a.fields[this.key]=e.checked;break;case"number":case"range":if(this.fixedPrecision>-1)e.value=Number(e.value).toFixed(this.fixedPrecision),a.fields[this.key]=Number(e.value);else a.fields[this.key]=Number(e.value);break;default:a.fields[this.key]=e.value}};initialize(n){let t=n.fields[this.key]!==void 0?n.fields[this.key]:this.value;if(t!=null&&t!==""){if(n.fields[this.key]==null)n.fields[this.key]=t;this.value=t}}connectedCallback(){super.connectedCallback();let{input:n,valueHolder:t}=this.parts,e=this.closest(st.tagName);if(e instanceof st)this.initialize(e);t.addEventListener("change",this.handleChange),n.addEventListener("change",this.handleChange,!0)}render(){if(this.valueChanged){this.valueChanged=!1;return}let{input:n,caption:t,valueHolder:e,field:a}=this.parts;if(t.textContent?.trim()==="")t.append(this.caption!==""?this.caption:this.key);if(this.type==="text"){n.textContent="";let o=m.textarea({value:this.value});if(this.placeholder)o.setAttribute("placeholder",this.placeholder);n.append(o)}else if(this.type==="color")n.textContent="",n.append(Ko({value:this.value}));else if(n.children.length===0){if(en(e,"placeholder",this.placeholder),en(e,"type",this.type),en(e,"pattern",this.pattern),en(e,"min",this.min),en(e,"max",this.max),this.step)en(e,"step",this.step);else if(this.fixedPrecision>0&&this.type==="number")en(e,"step",Math.pow(10,-this.fixedPrecision))}if(Vo(e,this.value),Vo(n.children[0],this.value),this.prefix?a.setAttribute("prefix",this.prefix):a.removeAttribute("prefix"),this.suffix?a.setAttribute("suffix",this.suffix):a.removeAttribute("suffix"),e.classList.toggle("hidden",n.children.length>0),n.children.length>0)e.setAttribute("tabindex","-1");else e.removeAttribute("tabindex");n.style.display=n.children.length===0?"none":"",en(e,"required",!this.optional)}}class st extends b{context={};value={};get isValid(){return[...this.querySelectorAll("*")].filter((n)=>n.required!==void 0).find((n)=>!n.reportValidity())===void 0}static styleSpec={":host":{display:"flex",flexDirection:"column"},":host::part(header), :host::part(footer)":{display:"flex"},":host::part(content)":{display:"flex",flexDirection:"column",overflow:"hidden auto",height:"100%",width:"100%",position:"relative",boxSizing:"border-box"},":host form":{display:"flex",flex:"1 1 auto",position:"relative",overflow:"hidden"}};content=[We({part:"header",name:"header"}),Fr({part:"form"},We({part:"content"})),We({part:"footer",name:"footer"})];getField=(n)=>{return this.querySelector(`xin-field[key="${n}"]`)};get fields(){if(typeof this.value==="string")try{this.value=JSON.parse(this.value)}catch(e){console.log("<xin-form> could not use its value, expects valid JSON"),this.value={}}let{getField:n}=this,t=this.dispatchEvent.bind(this);return new Proxy(this.value,{get(e,a){return e[a]},set(e,a,o){if(e[a]!==o){e[a]=o;let s=n(a);if(s)s.value=o;t(new Event("change"))}return!0}})}set fields(n){let t=[...this.querySelectorAll(qt.tagName)];for(let e of t)e.value=n[e.key]}submit=()=>{this.parts.form.dispatchEvent(new Event("submit"))};handleSubmit=(n)=>{n.preventDefault(),n.stopPropagation(),this.submitCallback(this.value,this.isValid)};submitCallback=(n,t)=>{console.log("override submitCallback to handle this data",{value:n,isValid:t})};connectedCallback(){super.connectedCallback();let{form:n}=this.parts;n.addEventListener("submit",this.handleSubmit)}}var Kr=qt.elementCreator({tag:"xin-field",styleSpec:{':host [part="field"]':{position:"relative",display:"flex",alignItems:"center",gap:p.prefixSuffixGap("8px")},':host [part="field"][prefix]::before':{content:"attr(prefix)"},':host [part="field"][suffix]::after':{content:"attr(suffix)"},':host [part="field"] > *, :host [part="input"] > *':{width:"100%"},":host textarea":{resize:"none"},':host input[type="checkbox"]':{width:"fit-content"},":host .hidden":{position:"absolute",pointerEvents:"none",opacity:0}}}),Zr=st.elementCreator({tag:"xin-form"});function us(){return navigator.getGamepads().filter((n)=>n!==null).map((n)=>{let{id:t,axes:e,buttons:a}=n;return{id:t,axes:e,buttons:a.map((o,s)=>{let{pressed:i,value:r}=o;return{index:s,pressed:i,value:r}}).filter((o)=>o.pressed||o.value!==0).reduce((o,s)=>{return o[s.index]=s.value,o},{})}})}function Qr(){let n=us();return n.length===0?"no active gamepads":n.map(({id:t,axes:e,buttons:a})=>{let o=e.map((i)=>i.toFixed(2)).join(" "),s=Object.keys(a).map((i)=>`[${i}](${a[Number(i)].toFixed(2)})`).join(" ");return`${t}
${o}
${s}`}).join(`
`)}function nl(n){let t={};return n.input.onControllerAddedObservable.add((e)=>{e.onMotionControllerInitObservable.add((a)=>{let o={};a.getComponentIds().forEach((s)=>{let i=a.getComponent(s);if(o[s]={pressed:i.pressed},i.onButtonStateChangedObservable.add(()=>{o[s].pressed=i.pressed}),i.onAxisValueChangedObservable)o[s].axes=[],i.onAxisValueChangedObservable.add((r)=>{o[s].axes=r})}),t[a.handedness]=o})}),t}function tl(n){if(n===void 0||Object.keys(n).length===0)return"no xr inputs";return Object.keys(n).map((t)=>{let e=n[t],a=Object.keys(e).filter((o)=>e[o].pressed).join(" ");return`${t}
${a}`}).join(`
`)}var{div:wn,slot:Wo,span:el,button:al}=m;class ha extends b{value=0;localized=!1;makeTab(n,t,e){let a=t.getAttribute("name"),o=t.querySelector('template[role="tab"]')?.content.cloneNode(!0)||(this.localized?Xt(a):el(a));return wn(o,{part:"tab",tabindex:0,role:"tab",ariaControls:e},t.hasAttribute("data-close")?al({title:"close",class:"close"},y.x()):{})}static styleSpec={":host":{display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",boxShadow:"none !important"},slot:{position:"relative",display:"block",flex:"1",overflow:"hidden",overflowY:"auto"},'slot[name="after-tabs"]':{flex:"0 0 auto"},"::slotted([hidden])":{display:"none !important"},":host::part(tabpanel)":{display:"flex",flexDirection:"column",overflowX:"auto"},":host::part(tabrow)":{display:"flex"},":host .tabs":{display:"flex",userSelect:"none",whiteSpace:"nowrap"},":host .tabs > div":{padding:`${d.spacing50} ${d.spacing}`,cursor:"default",display:"flex",alignItems:"baseline"},':host .tabs > [aria-selected="true"]':{"--text-color":d.xinTabsSelectedColor,color:d.textColor},":host .elastic":{flex:"1"},":host .border":{background:"var(--xin-tabs-bar-color, #ccc)"},":host .border > .selected":{content:" ",width:0,height:"var(--xin-tabs-bar-height, 2px)",background:d.xinTabsSelectedColor,transition:"ease-out 0.2s"},":host button.close":{border:0,background:"transparent",textAlign:"center",marginLeft:d.spacing50,padding:0},":host button.close > svg":{height:"12px"}};onCloseTab=null;content=[wn({role:"tabpanel",part:"tabpanel"},wn({part:"tabrow"},wn({class:"tabs",part:"tabs"}),wn({class:"elastic"}),Wo({name:"after-tabs"})),wn({class:"border"},wn({class:"selected",part:"selected"}))),Wo()];constructor(){super();this.initAttributes("localized")}addTabBody(n,t=!1){if(!n.hasAttribute("name"))throw console.error("element has no name attribute",n),Error("element has no name attribute");if(this.append(n),this.setupTabs(),t)this.value=this.bodies.length-1;this.queueRender()}removeTabBody(n){n.remove(),this.setupTabs(),this.queueRender()}keyTab=(n)=>{let{tabs:t}=this.parts,e=[...t.children].indexOf(n.target);switch(n.key){case"ArrowLeft":this.value=(e+Number(t.children.length)-1)%t.children.length,t.children[this.value].focus(),n.preventDefault();break;case"ArrowRight":this.value=(e+1)%t.children.length,t.children[this.value].focus(),n.preventDefault();break;case" ":this.pickTab(n),n.preventDefault();break;default:}};get bodies(){return[...this.children].filter((n)=>n.hasAttribute("name"))}pickTab=(n)=>{let{tabs:t}=this.parts,e=n.target,a=e.closest("button.close")!==null,o=e.closest(".tabs > div"),s=[...t.children].indexOf(o);if(a){let i=this.bodies[s];if(!this.onCloseTab||this.onCloseTab(i)!==!1)this.removeTabBody(this.bodies[s])}else if(s>-1)this.value=s};setupTabs=()=>{let{tabs:n}=this.parts,t=[...this.children].filter((e)=>!e.hasAttribute("slot")&&e.hasAttribute("name"));if(n.textContent="",this.value>=t.length)this.value=t.length-1;for(let e in t){let a=t[e],o=`${this.instanceId}-${e}`;a.id=o;let s=this.makeTab(this,a,o);n.append(s)}};connectedCallback(){super.connectedCallback();let{tabs:n}=this.parts;n.addEventListener("click",this.pickTab),n.addEventListener("keydown",this.keyTab),this.setupTabs(),Y.allInstances.add(this)}disconnectedCallback(){super.disconnectedCallback(),Y.allInstances.delete(this)}localeChanged=()=>{this.queueRender()};onResize(){this.queueRender()}render(){let{tabs:n,selected:t}=this.parts,e=this.bodies;for(let a=0;a<e.length;a++){let o=e[a],s=n.children[a];if(this.value===Number(a))s.setAttribute("aria-selected","true"),t.style.marginLeft=`${s.offsetLeft-n.offsetLeft}px`,t.style.width=`${s.offsetWidth}px`,o.toggleAttribute("hidden",!1);else s.toggleAttribute("aria-selected",!1),o.toggleAttribute("hidden",!0)}}}var ms=ha.elementCreator({tag:"xin-tabs"}),{div:At,xinSlot:ol,style:sl,button:xn,h4:il,pre:rl}=m,ll=(async()=>{}).constructor;class Nn extends b{persistToDom=!1;prettier=!1;prefix="lx";storageKey="live-example-payload";context={};uuid=crypto.randomUUID();remoteId="";lastUpdate=0;interval;static insertExamples(n,t={}){let e=[...n.querySelectorAll(".language-html,.language-js,.language-css")].filter((a)=>!a.closest(Nn.tagName)).map((a)=>({block:a.parentElement,language:a.classList[0].split("-").pop(),code:a.innerText}));for(let a=0;a<e.length;a+=1){let o=[e[a]];while(a<e.length-1&&e[a].block.nextElementSibling===e[a+1].block)o.push(e[a+1]),a+=1;let s=Ut({context:t});o[0].block.parentElement.insertBefore(s,o[0].block),o.forEach((i)=>{switch(i.language){case"js":s.js=i.code;break;case"html":s.html=i.code;break;case"css":s.css=i.code;break}i.block.remove()}),s.showDefaultTab()}}constructor(){super();this.initAttributes("persistToDom","prettier")}get activeTab(){let{editors:n}=this.parts;return[...n.children].find((t)=>t.getAttribute("hidden")===null)}getEditorValue(n){return this.parts[n].value}setEditorValue(n,t){let e=this.parts[n];e.value=t}get css(){return this.getEditorValue("css")}set css(n){this.setEditorValue("css",n)}get html(){return this.getEditorValue("html")}set html(n){this.setEditorValue("html",n)}get js(){return this.getEditorValue("js")}set js(n){this.setEditorValue("js",n)}updateUndo=()=>{let{activeTab:n}=this,{undo:t,redo:e}=this.parts;if(n instanceof Rn&&n.editor!==void 0){let a=n.editor.session.getUndoManager();t.disabled=!a.hasUndo(),e.disabled=!a.hasRedo()}else t.disabled=!0,e.disabled=!0};undo=()=>{let{activeTab:n}=this;if(n instanceof Rn)n.editor.undo()};redo=()=>{let{activeTab:n}=this;if(n instanceof Rn)n.editor.redo()};get isMaximized(){return this.classList.contains("-maximize")}flipLayout=()=>{this.classList.toggle("-vertical")};exampleMenu=()=>{J({target:this.parts.exampleWidgets,width:"auto",menuItems:[{icon:"edit2",caption:"view/edit code",action:this.showCode},{icon:"edit",caption:"view/edit code in a new window",action:this.openEditorWindow},null,{icon:this.isMaximized?"minimize":"maximize",caption:this.isMaximized?"restore preview":"maximize preview",action:this.toggleMaximize}]})};handleShortcuts=(n)=>{if(n.metaKey||n.ctrlKey){let t=!1;switch(n.key){case"s":case"r":this.refresh(),t=!0;break;case"/":this.flipLayout();break;case"c":if(n.shiftKey)this.copy(),t=!0;break}if(t)n.preventDefault(),n.stopPropagation()}};content=()=>[At({part:"example"},sl({part:"style"}),xn({title:"example menu",part:"exampleWidgets",onClick:this.exampleMenu},y.code())),At({class:"code-editors",part:"codeEditors",onKeydown:this.handleShortcuts,hidden:!0},il("Code"),xn({title:"close code",class:"transparent close-button",onClick:this.closeCode},y.x()),ms({part:"editors",onChange:this.updateUndo},_t({name:"js",mode:"javascript",part:"js"}),_t({name:"html",mode:"html",part:"html"}),_t({name:"css",mode:"css",part:"css"}),At({slot:"after-tabs",class:"row"},xn({title:"undo",part:"undo",class:"transparent",onClick:this.undo},y.cornerUpLeft()),xn({title:"redo",part:"redo",class:"transparent",onClick:this.redo},y.cornerUpRight()),xn({title:"flip direction (⌘/ | ^/)",class:"transparent",onClick:this.flipLayout},y.columns({class:"layout-indicator"})),xn({title:"copy as markdown (⌘⇧C | ^⇧C)",class:"transparent",onClick:this.copy},y.copy()),xn({title:"reload (⌘R | ^R)",class:"transparent",onClick:this.refreshRemote},y.refreshCw())))),ol({part:"sources",hidden:!0})];connectedCallback(){super.connectedCallback();let{sources:n}=this.parts;this.initFromElements([...n.children]),addEventListener("storage",this.remoteChange),this.interval=setInterval(this.remoteChange,500),this.undoInterval=setInterval(this.updateUndo,250)}disconnectedCallback(){super.disconnectedCallback();let{storageKey:n,remoteKey:t}=this;clearInterval(this.interval),clearInterval(this.undoInterval),localStorage.setItem(n,JSON.stringify({remoteKey:t,sentAt:Date.now(),close:!0}))}copy=()=>{let n=this.js!==""?"```js\n"+this.js.trim()+"\n```\n":"",t=this.html!==""?"```html\n"+this.html.trim()+"\n```\n":"",e=this.css!==""?"```css\n"+this.css.trim()+"\n```\n":"";navigator.clipboard.writeText(n+t+e)};toggleMaximize=()=>{this.classList.toggle("-maximize")};get remoteKey(){return this.remoteId!==""?this.prefix+"-"+this.remoteId:this.prefix+"-"+this.uuid}remoteChange=(n)=>{let t=localStorage.getItem(this.storageKey);if(n instanceof StorageEvent&&n.key!==this.storageKey)return;if(t===null)return;let{remoteKey:e,sentAt:a,css:o,html:s,js:i,close:r}=JSON.parse(t);if(a<=this.lastUpdate)return;if(e!==this.remoteKey)return;if(r===!0)window.close();console.log("received new code",a,this.lastUpdate),this.lastUpdate=a,this.css=o,this.html=s,this.js=i,this.refresh()};showCode=()=>{this.classList.add("-maximize"),this.classList.toggle("-vertical",this.offsetHeight>this.offsetWidth),this.parts.codeEditors.hidden=!1};closeCode=()=>{if(this.remoteId!=="")window.close();else this.classList.remove("-maximize"),this.parts.codeEditors.hidden=!0};openEditorWindow=()=>{let{storageKey:n,remoteKey:t,css:e,html:a,js:o,uuid:s,prefix:i}=this,r=location.href.split("?")[0]+`?${i}=${s}`;localStorage.setItem(n,JSON.stringify({remoteKey:t,sentAt:Date.now(),css:e,html:a,js:o})),window.open(r)};refreshRemote=()=>{let{remoteKey:n,css:t,html:e,js:a}=this;localStorage.setItem(this.storageKey,JSON.stringify({remoteKey:n,sentAt:Date.now(),css:t,html:e,js:a}))};updateSources=()=>{if(this.persistToDom){let{sources:n}=this.parts;n.innerText="";for(let t of["js","css","html"])if(this[t])n.append(rl({class:`language-${t}`,innerHTML:this[t]}))}};refresh=async()=>{if(this.remoteId!=="")return;let{transform:n}=await import("https://cdn.jsdelivr.net/npm/sucrase@3.35.0/+esm"),{example:t,style:e}=this.parts,a=At({class:"preview"});a.innerHTML=this.html,e.innerText=this.css;let o=t.querySelector(".preview");if(o)o.replaceWith(a);else t.insertBefore(a,this.parts.exampleWidgets);let s={preview:a,...this.context};try{let i=this.js;for(let r of Object.keys(this.context))i=i.replace(new RegExp(`import \\{(.*)\\} from '${r}'`,"g"),`const {$1} = ${r.replace(/-/g,"")}`);if(new ll(...Object.keys(s).map((r)=>r.replace(/-/g,"")),n(i,{transforms:["typescript"]}).code)(...Object.values(s)).catch((r)=>console.error(r)),this.persistToDom)this.updateSources()}catch(i){console.error(i),window.alert(`Error: ${i}, the console may have more information…`)}};initFromElements(n){for(let t of n){t.hidden=!0;let[e,...a]=t.innerHTML.split(`
`);if(["js","html","css"].includes(e)){let o=a.filter((i)=>i.trim()!=="").map((i)=>i.match(/^\s*/)[0].length).sort()[0],s=(o>0?a.map((i)=>i.substring(o)):a).join(`
`);this.parts[e].value=s}else{let o=["js","html","css"].find((s)=>t.matches(`.language-${s}`));if(o)this.parts[o].value=o==="html"?t.innerHTML:t.innerText}}}showDefaultTab(){let{editors:n}=this.parts;if(this.js!=="")n.value=0;else if(this.html!=="")n.value=1;else if(this.css!=="")n.value=2}render(){if(super.render(),this.remoteId!==""){let n=localStorage.getItem(this.storageKey);if(n!==null){let{remoteKey:t,sentAt:e,css:a,html:o,js:s}=JSON.parse(n);if(this.remoteKey!==t)return;this.lastUpdate=e,this.css=a,this.html=o,this.js=s,this.parts.example.hidden=!0,this.parts.codeEditors.hidden=!1,this.classList.add("-maximize"),this.updateUndo()}}else this.refresh()}}var Ut=Nn.elementCreator({tag:"xin-example",styleSpec:{":host":{"--xin-example-height":"320px","--code-editors-bar-bg":"#777","--code-editors-bar-color":"#fff","--widget-bg":"#fff8","--widget-color":"#000",position:"relative",display:"flex",height:"var(--xin-example-height)",background:"var(--background)",boxSizing:"border-box"},":host.-maximize":{position:"fixed",left:"0",top:"0",height:"100vh",width:"100vw",margin:"0 !important"},".-maximize":{zIndex:101},":host.-vertical":{flexDirection:"column"},":host .layout-indicator":{transition:"0.5s ease-out",transform:"rotateZ(270deg)"},":host.-vertical .layout-indicator":{transform:"rotateZ(180deg)"},":host.-maximize .hide-if-maximized, :host:not(.-maximize) .show-if-maximized":{display:"none"},':host [part="example"]':{flex:"1 1 50%",height:"100%",position:"relative",overflowX:"auto"},":host .preview":{height:"100%",position:"relative",overflow:"hidden",boxShadow:"inset 0 0 0 2px #8883"},':host [part="editors"]':{flex:"1 1 200px",height:"100%",position:"relative"},':host [part="exampleWidgets"]':{position:"absolute",left:"5px",bottom:"5px","--widget-color":"var(--brand-color)",borderRadius:"5px",width:"44px",height:"44px",lineHeight:"44px",zIndex:"100"},':host [part="exampleWidgets"] svg':{stroke:"var(--widget-color)"},":host .code-editors":{overflow:"hidden",background:"white",position:"relative",top:"0",right:"0",flex:"1 1 50%",height:"100%",flexDirection:"column",zIndex:"10"},":host .code-editors:not([hidden])":{display:"flex"},":host .code-editors > h4":{padding:"5px",margin:"0",textAlign:"center",background:"var(--code-editors-bar-bg)",color:"var(--code-editors-bar-color)",cursor:"move"},":host .close-button":{position:"absolute",top:"0",right:"0",color:"var(--code-editors-bar-color)"},":host button.transparent, :host .sizer":{width:"32px",height:"32px",lineHeight:"32px",textAlign:"center",padding:"0",margin:"0"},":host .sizer":{cursor:"nwse-resize"}}});function dl(n){let t=[...n.querySelectorAll("pre")].filter((e)=>["js","html","css","json"].includes(e.innerText.split(`
`)[0]));for(let e=0;e<t.length;e++){let a=[t[e]];while(t[e].nextElementSibling===t[e+1])a.push(t[e+1]),e+=1;let o=Ut();n.insertBefore(o,a[0]),o.initFromElements(a)}}var cl=new URL(window.location.href).searchParams,Xo=cl.get("lx");if(Xo)document.title+=" [code editor]",document.body.textContent="",document.body.append(Ut({remoteId:Xo}));var{div:hl}=m;class jn extends b{coords="65.01715565258993,25.48081004203459,12";content=hl({style:{width:"100%",height:"100%"}});get map(){return this._map}mapStyle="mapbox://styles/mapbox/streets-v12";token="";static mapboxCSSAvailable;static mapboxAvailable;_map;static styleSpec={":host":{display:"inline-block",position:"relative",width:"400px",height:"400px",textAlign:"left"}};constructor(){super();if(this.initAttributes("coords","token","mapStyle"),jn.mapboxCSSAvailable===void 0)jn.mapboxCSSAvailable=Jo("https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.css").catch((n)=>{console.error("failed to load mapbox-gl.css",n)}),jn.mapboxAvailable=Cn("https://api.mapbox.com/mapbox-gl-js/v1.4.1/mapbox-gl.js").catch((n)=>{console.error("failed to load mapbox-gl.js",n)})}connectedCallback(){if(super.connectedCallback(),!this.token)console.error("mapbox requires an access token which you can provide via the token attribute")}render(){if(super.render(),!this.token)return;let{div:n}=this.parts,[t,e,a]=this.coords.split(",").map((o)=>Number(o));if(this.map)this.map.remove();jn.mapboxAvailable.then(({mapboxgl:o})=>{console.log("%cmapbox may complain about missing css -- don't panic!","background: orange; color: black; padding: 0 5px;"),o.accessToken=this.token,this._map=new o.Map({container:n,style:this.mapStyle,zoom:a,center:[e,t]}),this._map.on("render",()=>this._map.resize())})}}var pl=jn.elementCreator({tag:"xin-map"});function bs(n,t){if(t==null)t="";else if(typeof t!=="string")t=String(t);return t.replace(/\{\{([^}]+)\}\}/g,(e,a)=>{let o=M[`${n}${a.startsWith("[")?a:"."+a}`];return o===void 0?e:bs(n,String(o))})}class pa extends b{src="";value="";content=null;elements=!1;context={};options={};constructor(){super();this.initAttributes("src","elements","context")}connectedCallback(){if(super.connectedCallback(),this.src!=="")(async()=>{let n=await fetch(this.src);this.value=await n.text()})();else if(this.value==="")if(this.elements)this.value=this.innerHTML;else this.value=this.textContent!=null?this.textContent:""}didRender=()=>{};render(){super.render(),M[this.instanceId]=typeof this.context==="string"?JSON.parse(this.context):this.context;let n=bs(this.instanceId,this.value);if(this.elements){let t=n.split(`
`).reduce((e,a)=>{if(a.startsWith("<")||e.length===0)e.push(a);else{let o=e[e.length-1];if(!o.startsWith("<")||!o.endsWith(">"))e[e.length-1]+=`
`+a;else e.push(a)}return e},[]);this.innerHTML=t.map((e)=>e.startsWith("<")&&e.endsWith(">")?e:x(e,this.options)).join("")}else this.innerHTML=x(n,this.options);this.didRender()}}var ua=pa.elementCreator({tag:"xin-md"}),{div:Xe,span:Ot,button:qe}=m,et=86400000,ul=[0,1,2,3,4,5,6],ml=[1,2,3,4,5,6,7,8,9,10,11,12],Ke=(n,t=2,e="0")=>String(n).padStart(t,e),at=(n,t,e)=>new Date(`${n}-${Ke(t)}-${Ke(e)}`);class ma extends b{month=NaN;year=NaN;minDate=at(new Date().getFullYear()-100,1,1).toISOString().split("T")[0];maxDate=at(new Date().getFullYear()+10,12,31).toISOString().split("T")[0];weekStart=0;selectable=!1;multiple=!1;range=!1;disabled=!1;readonly=!1;selectedDays=[];value="";get endDay(){return 1-this.weekStart}get months(){return ml.map((n)=>({caption:at(2025,n,1).toString().split(" ")[1],value:String(n)}))}get years(){let n=Number(this.minDate.split("-")[0]),t=Number(this.maxDate.split("-")[0]),e=[];for(let a=n;a<=t;a++)e.push(String(a));return e}monthChanged=(n,t)=>{};gotoMonth(n,t){if(this.month!==t||this.year!==n)this.month=t,this.year=n,this.monthChanged(n,t)}setMonth=()=>{this.gotoMonth(Number(this.parts.year.value),Number(this.parts.month.value))};get to(){return this.selectedDays[1]||""}set to(n){this.selectedDays[1]=n,this.selectedDays.splice(2)}get from(){return this.selectedDays[0]||""}set from(n){this.selectedDays[0]=n,this.selectedDays.splice(2)}clickDate=(n)=>{let t=n.target.getAttribute("title");this.selectDate(t)};keyDate=(n)=>{let t=!1;switch(n.code){case"Space":let e=n.target.getAttribute("title");this.selectDate(e),t=!0;break;case"Tab":break;default:console.log(n)}if(t)n.preventDefault(),n.stopPropagation()};#n="";selectDate=(n)=>{if(this.#n=n,this.range){if(!this.to)this.selectedDays=[n,n];else if(this.from===n&&this.to===n)this.selectedDays=[];else if(this.from===n)this.from=this.to;else if(this.to===n)this.to=this.from;else if(n<this.from)this.from=n;else if(n>this.to)this.to=n;else if(n<this.from)this.from=n;else this.to=n;this.value=`${this.from},${this.to}`}else if(this.multiple){if(this.selectedDays.includes(n))this.selectedDays.splice(this.selectedDays.indexOf(n),1);else this.selectedDays.push(n),this.selectedDays.sort();this.value=this.selectedDays.join(",")}else if(this.selectable)if(this.selectedDays.includes(n))this.value="",this.selectedDays=[];else this.value=n,this.selectedDays=[n]};nextMonth=()=>{if(this.month<12)this.gotoMonth(this.year,this.month+1);else this.gotoMonth(this.year+1,1)};previousMonth=()=>{if(this.month>1)this.gotoMonth(this.year,this.month-1);else this.gotoMonth(this.year-1,12)};checkDay=(n)=>{if(!this.range)return this.selectedDays.includes(n);else if(this.range)return this.from&&n>=this.from&&n<=this.to;return!1};dateMenuItem=(n,t="")=>{return n=n.split("T")[0],{caption:t||n,enabled:()=>!n.startsWith(`${this.year}-${Ke(this.month)}-`),action:()=>{this.gotoDate(n)}}};jumpMenu=()=>{J({target:this.parts.jump,menuItems:[this.dateMenuItem(new Date().toISOString(),"This Month"),...this.selectedDays.length===0?[]:[null],...this.selectedDays.map((n)=>this.dateMenuItem(n))]})};content=()=>[Xe({part:"header"},qe({part:"previous",onClick:this.previousMonth},y.chevronLeft()),Ot({style:{flex:"1"}}),qe({part:"jump",onClick:this.jumpMenu},y.calendar()),Tn({part:"month",options:this.months,onChange:this.setMonth}),Tn({part:"year",options:[this.year],onChange:this.setMonth}),Ot({style:{flex:"1"}}),qe({part:"next",onClick:this.nextMonth},y.chevronRight())),Xe({part:"week"}),Xe({part:"days"})];gotoDate(n){let t=new Date(n);this.gotoMonth(t.getFullYear(),t.getMonth()+1)}constructor(){super();this.initAttributes("month","year","weekStart","minDate","maxDate","selectable","multiple","range","disabled","readonly")}connectedCallback(){super.connectedCallback();let n=new Date(this.value.split(",").pop()||Date.now());if(isNaN(this.month))this.month=n.getMonth()+1;if(isNaN(this.year))this.year=n.getFullYear()}days=[];render(){let{week:n,days:t,jump:e,month:a,year:o,previous:s,next:i}=this.parts;this.selectedDays=this.value?this.value.split(","):[];let r=at(this.year,this.month,1),l=new Date(r.valueOf()-(7+r.getDay()-this.weekStart)%7*et),c=this.month===12?1:this.month+1,h=new Date(at(this.year+(this.month===12?1:0),c,1).valueOf()-et),u=new Date(h.valueOf()+(this.weekStart*2+5+this.endDay-h.getDay())%7*et),g=ul.map((C)=>new Date(l.valueOf()+C*et).toString().split(" ")[0]);this.days=[];let w=new Date().toISOString().split("T")[0];for(let C=l.valueOf();C<=u.valueOf();C+=et){let S=new Date(C),P=S.toISOString().split("T")[0];this.days.push({date:S,selected:!1,inMonth:S.getMonth()+1===this.month,isToday:P===w,isWeekend:S.getDay()%6===0,inRange:!!(this.from&&P>=this.from&&P<=this.to)})}a.value=String(this.month),o.value=String(this.year);let v=(a.disabled=o.disabled=e.disabled=s.disabled=i.disabled=this.disabled||this.readonly)||!this.selectable&&!this.range&&!this.multiple;o.options=this.years,n.textContent="",n.append(...g.map((C)=>Ot({class:"day"},C))),t.textContent="";let j=null,{to:O,from:T}=this;if(t.append(...this.days.map((C)=>{let S=["date"];if(C.inMonth)S.push("in-month");if(C.isToday)S.push("today");let P=C.date.toISOString().split("T")[0];if(this.checkDay(P))S.push("checked");if(S.push(C.isWeekend?"weekend":"weekday"),this.range){if(O===P)S.push("range-end");if(T===P)S.push("range-start")}let En=Ot({class:S.join(" "),title:P,onClick:this.clickDate,onKeydown:this.keyDate,tabindex:"0"},C.date.getDate());if(P===this.#n)j=En;return En})),j)j.focus()}}var bl=ma.elementCreator({tag:"tosi-month",styleSpec:{":host":{display:"block"},":host [part=header]":{display:"flex",alignItems:"stretch",justifyContent:"stretch"},":host[disabled]":{pointerEvents:"none",opacity:p.disabledOpacity(0.6)},':host [part="month"], :host [part="year"]':{_fieldWidth:"4em",flex:"1"},":host [part=week], :host [part=days]":{display:"grid",gridTemplateColumns:"auto auto auto auto auto auto auto",justifyItems:"stretch"},":host .today":{background:p.monthTodayBackground("transparent"),boxShadow:p.monthTodayShadow("none"),backdropFilter:p.monthTodayBackdropFilter("brightness(0.9)"),fontWeight:p.monthTodayFontWeight("800")},":host .day, :host .date":{padding:5,display:"flex",justifyContent:"center",userSelect:"none"},":host .day":{color:p.monthDayColor("hotpink"),background:p.monthDayBackground("white"),fontWeight:p.monthDayFontWeight("800")},":host .date":{cursor:"default"},":host .weekend":{background:p.monthWeekendBackground("#eee")},":host .date:not(.in-month)":{opacity:0.5},":host .date.checked":{color:p.monthDateCheckedColor("white"),background:p.monthDateCheckedBackground("hotpink")},":host:not([range]) .date.checked":{borderRadius:p.monthDateCheckedBorderRadius("10px")},":host .range-start":{borderTopLeftRadius:p.monthDateCheckedBorderRadius("10px"),borderBottomLeftRadius:p.monthDateCheckedBorderRadius("10px")},":host .range-end":{borderTopRightRadius:p.monthDateCheckedBorderRadius("10px"),borderBottomRightRadius:p.monthDateCheckedBorderRadius("10px")}}}),{div:Ue,button:gl}=m,yl={error:"red",warn:"orange",info:"royalblue",log:"gray",success:"green",progress:"royalblue"};class Sn extends b{static singleton;static styleSpec={":host":{_notificationSpacing:8,_notificationWidth:360,_notificationPadding:`${d.notificationSpacing} ${d.notificationSpacing50} ${d.notificationSpacing} ${d.notificationSpacing200}`,_notificationBg:"#fafafa",_notificationAccentColor:"#aaa",_notificationTextColor:"#444",_notificationIconSize:d.notificationSpacing300,_notificationButtonSize:48,_notificationBorderWidth:"3px 0 0",_notificationBorderRadius:d.notificationSpacing50,position:"fixed",left:0,right:0,bottom:0,paddingBottom:d.notificationSpacing,width:d.notificationWidth,display:"flex",flexDirection:"column-reverse",margin:"0 auto",gap:d.notificationSpacing,maxHeight:"50vh",overflow:"hidden auto",boxShadow:"none !important"},":host *":{color:d.notificationTextColor},":host .note":{display:"grid",background:d.notificationBg,padding:d.notificationPadding,gridTemplateColumns:`${d.notificationIconSize} 1fr ${d.notificationButtonSize}`,gap:d.notificationSpacing,alignItems:"center",borderRadius:d.notificationBorderRadius,boxShadow:`0 2px 8px #0006, inset 0 0 0 2px ${d.notificationAccentColor}`,borderColor:d.notificationAccentColor,borderWidth:d.notificationBorderWidth,borderStyle:"solid",transition:"0.5s ease-in",transitionProperty:"margin, opacity",zIndex:1},":host .note .icon":{stroke:d.notificationAccentColor},":host .note button":{display:"flex",lineHeight:d.notificationButtonSize,padding:0,margin:0,height:d.notificationButtonSize,width:d.notificationButtonSize,background:"transparent",alignItems:"center",justifyContent:"center",boxShadow:"none",border:"none",position:"relative"},":host .note button:hover svg":{stroke:d.notificationAccentColor},":host .note button:active svg":{borderRadius:99,stroke:d.notificationBg,background:d.notificationAccentColor,padding:d.spacing50},":host .note svg":{height:d.notificationIconSize,width:d.notificationIconSize,pointerEvents:"none"},":host .message":{display:"flex",flexDirection:"column",alignItems:"center",gap:d.notificationSpacing},":host .note.closing":{opacity:0,zIndex:0}};static removeNote(n){n.classList.add("closing"),n.style.marginBottom=-n.offsetHeight+"px";let t=()=>{n.remove()};n.addEventListener("transitionend",t),setTimeout(t,1000)}static post(n){let{message:t,duration:e,type:a,close:o,progress:s,icon:i,color:r}=Object.assign({type:"info",duration:-1},typeof n==="string"?{message:n}:n);if(!this.singleton)this.singleton=gs();let l=this.singleton;document.body.append(l),l.style.zIndex=String(Wt()+1);let c=r||yl[a],h=s||a==="progress"?m.progress():{},u=()=>{if(o)o();Sn.removeNote(w)},g=i instanceof SVGElement?i:i?y[i]({class:"icon"}):y.info({class:"icon"}),w=Ue({class:`note ${a}`,style:{_notificationAccentColor:c}},g,Ue({class:"message"},Ue(t),h),gl({class:"close",title:"close",apply(v){v.addEventListener("click",u)}},y.x()));if(l.shadowRoot.append(w),h instanceof HTMLProgressElement&&s instanceof Function){h.setAttribute("max",String(100)),h.value=s();let v=setInterval(()=>{if(!l.shadowRoot.contains(w)){clearInterval(v);return}let j=s();if(h.value=j,j>=100)Sn.removeNote(w)},1000)}if(e>0)setTimeout(()=>{Sn.removeNote(w)},e*1000);return w.scrollIntoView(),u}content=null}var gs=Sn.elementCreator({tag:"xin-notification"});function fl(n){return Sn.post(n)}var ys=async(n,t="SHA-1")=>{let e=new TextEncoder().encode(n),a=await crypto.subtle.digest(t,e);return Array.from(new Uint8Array(a)).map((o)=>o.toString(16).padStart(2,"0")).join("")},fs=async(n)=>{let t=await ys(n),e=await fetch(`https://weakpass.com/api/v1/search/${t}`);if(e.ok){let a=await e.json();console.log("password found in weakpass database",a)}return e.status!==404},{span:Fe,xinSlot:vl}=m;class ba extends b{minLength=8;goodLength=12;indicatorColors="#f00,#f40,#f80,#ef0,#8f0,#0a2";descriptionColors="#000,#000,#000,#000,#000,#fff";issues={tooShort:!0,short:!0,noUpper:!0,noLower:!0,noNumber:!0,noSpecial:!0};issueDescriptions={tooShort:"too short",short:"short",noUpper:"no upper case",noLower:"no lower case",noNumber:"no digits",noSpecial:"no unusual characters"};value=0;strengthDescriptions=["unacceptable","very weak","weak","moderate","strong","very strong"];constructor(){super();this.initAttributes("minLength","goodLength","indicatorColors")}strength(n){return this.issues={tooShort:n.length<this.minLength,short:n.length<this.goodLength,noUpper:!n.match(/[A-Z]/),noLower:!n.match(/[a-z]/),noNumber:!n.match(/[0-9]/),noSpecial:!n.match(/[^a-zA-Z0-9]/)},this.issues.tooShort?0:Object.values(this.issues).filter((t)=>!t).length-1}async isBreached(){let n=this.querySelector("input")?.value;if(!n||typeof n!=="string")return!0;return await fs(n)}updateIndicator=(n)=>{let{level:t,description:e}=this.parts,a=this.indicatorColors.split(","),o=this.descriptionColors.split(","),s=this.strength(n);if(this.value!==s)this.value=s,this.dispatchEvent(new Event("change"));t.style.width=`${(s+1)*16.67}%`,this.style.setProperty("--indicator-color",a[s]),this.style.setProperty("--description-color",o[s]),e.textContent=this.strengthDescriptions[s]};update=(n)=>{let t=n.target.closest("input");this.updateIndicator(t?.value||"")};content=()=>[vl({onInput:this.update}),Fe({part:"meter"},Fe({part:"level"}),Fe({part:"description"}))];render(){super.render();let n=this.querySelector("input");this.updateIndicator(n?.value)}}var wl=ba.elementCreator({tag:"xin-password-strength",styleSpec:{":host":{display:"inline-flex",flexDirection:"column",gap:d.spacing50,position:"relative"},":host xin-slot":{display:"flex"},':host [part="meter"]':{display:"block",position:"relative",height:p.meterHeight("24px"),background:p.indicatorBg("white"),borderRadius:p.meterRadius("4px"),boxShadow:p.meterShadow(`inset 0 0 0 2px ${d.indicatorColor}`)},':host [part="level"]':{height:p.levelHeight("20px"),content:'" "',display:"inline-block",width:0,transition:"0.15s ease-out",background:d.indicatorColor,margin:p.levelMargin("2px"),borderRadius:p.levelRadius("2px")},':host [part="description"]':{position:"absolute",inset:"0",color:d.descriptionColor,height:p.meterHeight("24px"),lineHeight:p.meterHeight("24px"),textAlign:"center"}}}),{span:Ye}=m;class ga extends b{iconSize=24;min=1;max=5;step=1;value=null;icon="star";ratingFill="#f91";ratingStroke="#e81";emptyFill="#ccc";emptyStroke="none";readonly=!1;hollow=!1;static styleSpec={":host":{display:"inline-block",position:"relative",width:"fit-content"},":host::part(container)":{position:"relative",display:"inline-block"},":host::part(empty), :host::part(filled)":{height:"100%",whiteSpace:"nowrap",overflow:"hidden"},":host::part(empty)":{pointerEvents:"none",_xinIconFill:d.emptyFill,_xinIconStroke:d.emptyStroke},":host::part(filled)":{position:"absolute",left:0,_xinIconFill:d.ratingFill,_xinIconStroke:d.ratingStroke},":host svg":{transform:"scale(0.9)",pointerEvents:"all !important",transition:"0.25s ease-in-out"},":host svg:hover":{transform:"scale(1)"},":host svg:active":{transform:"scale(1.1)"}};constructor(){super();this.initAttributes("max","min","icon","step","ratingStroke","ratingColor","emptyStroke","emptyColor","readonly","iconSize","hollow")}content=()=>Ye({part:"container"},Ye({part:"empty"}),Ye({part:"filled"}));displayValue(n){let{empty:t,filled:e}=this.parts,a=Math.round((n||0)/this.step)*this.step;e.style.width=a/this.max*t.offsetWidth+"px"}update=(n)=>{if(this.readonly)return;let{empty:t}=this.parts,e=n instanceof MouseEvent?n.pageX-t.getBoundingClientRect().x:0,a=Math.min(Math.max(this.min,Math.round(e/t.offsetWidth*this.max/this.step+this.step*0.5)*this.step),this.max);if(n.type==="click")this.value=a;else if(n.type==="mousemove")this.displayValue(a);else this.displayValue(this.value||0)};handleKey=(n)=>{let t=Number(this.value);if(t==null)t=Math.round((this.min+this.max)*0.5*this.step)*this.step;let e=!1;switch(n.key){case"ArrowUp":case"ArrowRight":t+=this.step,e=!0;break;case"ArrowDown":case"ArrowLeft":t-=this.step,e=!0;break}if(this.value=Math.max(Math.min(t,this.max),this.min),e)n.stopPropagation(),n.preventDefault()};connectedCallback(){super.connectedCallback();let{container:n}=this.parts;n.tabIndex=0,n.addEventListener("mousemove",this.update,!0),n.addEventListener("mouseleave",this.update),n.addEventListener("blur",this.update),n.addEventListener("click",this.update),n.addEventListener("keydown",this.handleKey)}_renderedIcon="";render(){super.render();let n=this.iconSize+"px";if(this.style.setProperty("--rating-fill",this.ratingFill),this.style.setProperty("--rating-stroke",this.ratingStroke),this.style.setProperty("--empty-fill",this.emptyFill),this.style.setProperty("--empty-stroke",this.emptyStroke),this.style.setProperty("--xin-icon-size",n),this.readonly)this.role="image";else this.role="slider";this.ariaLabel=`rating ${this.value} out of ${this.max}`,this.ariaValueMax=String(this.max),this.ariaValueMin=String(this.min),this.ariaValueNow=this.value===null?String(-1):String(this.value);let{empty:t,filled:e}=this.parts;if(t.classList.toggle("hollow",this.hollow),this._renderedIcon!==this.icon){this._renderedIcon=this.icon;for(let a=0;a<this.max;a++)t.append(y[this.icon]()),e.append(y[this.icon]())}this.displayValue(this.value)}}var xl=ga.elementCreator({tag:"xin-rating"}),{xinSlot:qo,div:kl,button:jl,span:vs}=m,Cl=[{caption:"Title",tagType:"H1"},{caption:"Heading",tagType:"H2"},{caption:"Subheading",tagType:"H3"},{caption:"Minor heading",tagType:"H4"},{caption:"Body",tagType:"P"},{caption:"Code Block",tagType:"PRE"}];function ya(n=Cl){return Tn({title:"paragraph style",slot:"toolbar",class:"block-style",options:n.map(({caption:t,tagType:e})=>({caption:t,value:`formatBlock,${e}`}))})}function Hn(n="10px"){return vs({slot:"toolbar",style:{flex:`0 0 ${n}`,content:" "}})}function Sl(n="10px"){return vs({slot:"toolbar",style:{flex:`0 0 ${n}`,content:" "}})}function W(n,t,e){return jl({slot:"toolbar",dataCommand:t,title:n},e)}var Tl=()=>[W("left-justify","justifyLeft",y.alignLeft()),W("center","justifyCenter",y.alignCenter()),W("right-justify","justifyRight",y.alignRight()),Hn(),W("bullet list","insertUnorderedList",y.listBullet()),W("numbered list","insertOrderedList",y.listNumber()),Hn(),W("indent","indent",y.indent()),W("indent","outdent",y.outdent())],ws=()=>[W("bold","bold",y.fontBold()),W("italic","italic",y.fontItalic()),W("underline","underline",y.fontUnderline())],Il=()=>[ya(),Hn(),...ws()],xs=()=>[ya(),Hn(),...Tl(),Hn(),...ws()];class fa extends b{widgets="default";isInitialized=!1;get value(){return this.isInitialized?this.parts.doc.innerHTML:this.savedValue||this.innerHTML}set value(n){if(this.isInitialized)this.parts.doc.innerHTML=n;else this.innerHTML=n}blockElement(n){let{doc:t}=this.parts;while(n.parentElement!==null&&n.parentElement!==t)n=n.parentElement;return n.parentElement===t?n:void 0}get selectedBlocks(){let{doc:n}=this.parts,t=window.getSelection();if(t===null)return[];let e=[];for(let a=0;a<t.rangeCount;a++){let o=t.getRangeAt(a);if(!n.contains(o.commonAncestorContainer))continue;let s=this.blockElement(o.startContainer),i=this.blockElement(o.endContainer);e.push(s);while(s!==i&&s!==null)s=s.nextElementSibling,e.push(s)}return e}get selectedText(){let n=window.getSelection();if(n===null)return"";return this.selectedBlocks.length?n.toString():""}selectionChange=()=>{};handleSelectChange=(n)=>{let t=n.target.closest(it.tagName);if(t==null)return;this.doCommand(t.value)};handleButtonClick=(n)=>{let t=n.target.closest("button");if(t==null)return;this.doCommand(t.dataset.command)};content=[qo({name:"toolbar",part:"toolbar",onClick:this.handleButtonClick,onChange:this.handleSelectChange}),kl({part:"doc",contenteditable:!0,style:{flex:"1 1 auto",outline:"none"}}),qo({part:"content"})];constructor(){super();this.initAttributes("widgets")}doCommand(n){if(n===void 0)return;let t=n.split(",");console.log("execCommand",t[0],!1,...t.slice(1)),document.execCommand(t[0],!1,...t.slice(1))}updateBlockStyle(){let n=this.parts.toolbar.querySelector(".block-style");if(n===null)return;let t=this.selectedBlocks.map((e)=>e.tagName);t=[...new Set(t)],n.value=t.length===1?`formatBlock,${t[0]}`:""}connectedCallback(){super.connectedCallback();let{doc:n,content:t}=this.parts;if(t.innerHTML!==""&&n.innerHTML==="")n.innerHTML=t.innerHTML,t.innerHTML="";this.isInitialized=!0,t.style.display="none",document.addEventListener("selectionchange",(e)=>{this.updateBlockStyle(),this.selectionChange(e,this)})}render(){let{toolbar:n}=this.parts;if(super.render(),n.children.length===0)switch(this.widgets){case"minimal":n.append(...Il());break;case"default":n.append(...xs());break}}}var El=fa.elementCreator({tag:"xin-word",styleSpec:{":host":{display:"flex",flexDirection:"column",height:"100%"},':host [part="toolbar"]':{padding:4,display:"flex",gap:"0px",flex:"0 0 auto",flexWrap:"wrap"},':host [part="toolbar"] > button':{_xinIconSize:18}}}),{div:Bl,slot:Pl,label:Ml,span:Ll,input:Uo}=m;class va extends b{choices="";other="";multiple=!1;name="";placeholder="Please specify…";localized=!1;value=null;get values(){return(this.value||"").split(",").map((n)=>n.trim()).filter((n)=>n!=="")}content=()=>[Pl(),Bl({part:"options"},Uo({part:"custom",hidden:!0}))];static styleSpec={":host":{display:"inline-flex",gap:p.segmentedOptionGap("8px"),alignItems:p.segmentedAlignItems("center")},":host, :host::part(options)":{flexDirection:p.segmentedDirection("row")},":host label":{display:"inline-grid",alignItems:"center",gap:p.segmentedOptionGap("8px"),gridTemplateColumns:p.segmentedOptionGridColumns("0px 24px 1fr"),padding:p.segmentedOptionPadding("4px 12px"),font:p.segmentedOptionFont("16px")},":host label:has(:checked)":{color:p.segmentedOptionCurrentColor("#eee"),background:p.segmentedOptionCurrentBackground("#44a")},":host svg":{height:p.segmentOptionIconSize("16px"),stroke:p.segmentedOptionIconColor("currentColor")},":host label.no-icon":{gap:0,gridTemplateColumns:p.segmentedOptionGridColumns("0px 1fr")},':host input[type="radio"], :host input[type="checkbox"]':{visibility:p.segmentedInputVisibility("hidden")},":host::part(options)":{display:"flex",borderRadius:p.segmentedOptionsBorderRadius("8px"),background:p.segmentedOptionsBackground("#fff"),color:p.segmentedOptionColor("#222"),overflow:"hidden",alignItems:p.segmentedOptionAlignItems("stretch")},":host::part(custom)":{padding:p.segmentedOptionPadding("4px 12px"),color:p.segmentedOptionCurrentColor("#eee"),background:p.segmentedOptionCurrentBackground("#44a"),font:p.segmentedOptionFont("16px"),border:"0",outline:"none"},":host::part(custom)::placeholder":{color:p.segmentedOptionCurrentColor("#eee"),opacity:p.segmentedPlaceholderOpacity(0.75)}};constructor(){super();this.initAttributes("direction","choices","other","multiple","name","placeholder","localized")}valueChanged=!1;handleChange=()=>{let{options:n,custom:t}=this.parts;if(this.multiple){let e=[...n.querySelectorAll("input:checked")];this.value=e.map((a)=>a.value).join(",")}else{let e=n.querySelector("input:checked");if(!e)this.value=null;else if(e.value)t.setAttribute("hidden",""),this.value=e.value;else t.removeAttribute("hidden"),t.focus(),t.select(),this.value=t.value}this.valueChanged=!0};handleKey=(n)=>{switch(n.code){case"Space":n.target.click();break}};connectedCallback(){super.connectedCallback();let{options:n}=this.parts;if(this.name==="")this.name=this.instanceId;if(n.addEventListener("change",this.handleChange),n.addEventListener("keydown",this.handleKey),this.other&&this.multiple)console.warn(this,"is set to [other] and [multiple]; [other] will be ignored"),this.other=""}get _choices(){let n=Array.isArray(this.choices)?this.choices:this.choices.split(",").filter((t)=>t.trim()!=="").map((t)=>{let[e,a]=t.split("=").map((r)=>r.trim()),[o,s]=(a||e).split(":").map((r)=>r.trim()),i=s?y[s]():"";return{value:e,icon:i,caption:o}});if(this.other&&!this.multiple){let[t,e]=this.other.split(":");n.push({value:"",caption:t,icon:e})}return n}get isOtherValue(){return Boolean(this.value===""||this.value&&!this._choices.find((n)=>n.value===this.value))}render(){if(super.render(),this.valueChanged){this.valueChanged=!1;return}let{options:n,custom:t}=this.parts;n.textContent="";let e=this.multiple?"checkbox":"radio",{values:a,isOtherValue:o}=this;if(n.append(...this._choices.map((s)=>{return Ml({tabindex:0},Uo({type:e,name:this.name,value:s.value,checked:a.includes(s.value)||s.value===""&&o,tabIndex:-1}),s.icon||{class:"no-icon"},this.localized?Xt(s.caption):Ll(s.caption))})),this.other&&!this.multiple)t.hidden=!o,t.value=o?this.value:"",t.placeholder=this.placeholder,n.append(t)}}var Dl=va.elementCreator({tag:"xin-segmented"}),{slot:Fo}=m;class Vn extends b{minSize=800;navSize=200;compact=!1;contentVisible=!1;value="normal";content=[Fo({name:"nav",part:"nav"}),Fo({part:"content"})];static styleSpec={":host":{display:"grid",gridTemplateColumns:`${p.navWidth("50%")} ${p.contentWidth("50%")}`,gridTemplateRows:"100%",position:"relative",margin:p.margin("0 0 0 -100%"),transition:p.sideNavTransition("0.25s ease-out")},":host slot":{position:"relative"},":host slot:not([name])":{display:"block"},':host slot[name="nav"]':{display:"block"}};onResize=()=>{let{content:n}=this.parts,t=this.offsetParent;if(t===null)return;let e=this.value;if(this.compact=t.offsetWidth<this.minSize,[...this.childNodes].find((a)=>a instanceof Element?a.getAttribute("slot")!=="nav":!0)===void 0)e="compact/nav",this.style.setProperty("--nav-width","100%"),this.style.setProperty("--content-width","0%");else if(!this.compact)e="normal",n.classList.add("-xin-sidenav-visible"),this.style.setProperty("--nav-width",`${this.navSize}px`),this.style.setProperty("--content-width",`calc(100% - ${this.navSize}px)`),this.style.setProperty("--margin","0");else if(n.classList.remove("-xin-sidenav-visible"),this.style.setProperty("--nav-width","50%"),this.style.setProperty("--content-width","50%"),this.contentVisible)e="compact/content",this.style.setProperty("--margin","0 0 0 -100%");else e="compact/nav",this.style.setProperty("--margin","0 -100% 0 0");if(this.value!==e)this.value=e};observer;connectedCallback(){super.connectedCallback(),this.contentVisible=this.parts.content.childNodes.length===0,globalThis.addEventListener("resize",this.onResize),this.observer=new MutationObserver(this.onResize),this.observer.observe(this,{childList:!0}),this.style.setProperty("--side-nav-transition","0s"),setTimeout(()=>{this.style.removeProperty("--side-nav-transition")},250)}disconnectedCallback(){super.disconnectedCallback(),this.observer.disconnect()}constructor(){super();this.initAttributes("minSize","navSize","compact","contentVisible")}render(){super.render(),this.onResize()}}var wa=Vn.elementCreator({tag:"xin-sidenav"}),{slot:Yo}=m;class xa extends b{minWidth=0;minHeight=0;value="normal";content=[Yo({part:"normal"}),Yo({part:"small",name:"small"})];static styleSpec={":host":{display:"inline-block",position:"relative"}};constructor(){super();this.initAttributes("minWidth","minHeight")}onResize=()=>{let{normal:n,small:t}=this.parts,e=this.offsetParent;if(!(e instanceof HTMLElement))return;else if(e.offsetWidth<this.minWidth||e.offsetHeight<this.minHeight)n.hidden=!0,t.hidden=!1,this.value="small";else n.hidden=!1,t.hidden=!0,this.value="normal"};connectedCallback(){super.connectedCallback(),globalThis.addEventListener("resize",this.onResize)}disconnectedCallback(){super.disconnectedCallback(),globalThis.removeEventListener("resize",this.onResize)}}var ka=xa.elementCreator({tag:"xin-sizebreak"});class ja extends b{target=null;static styleSpec={":host":{_resizeIconFill:"#222",display:"block",position:"absolute",bottom:-7,right:-7,padding:14,width:44,height:44,opacity:0.25,transition:"opacity 0.25s ease-out"},":host(:hover)":{opacity:0.5},":host svg":{width:16,height:16,stroke:d.resizeIconFill}};content=y.resize();get minSize(){let{minWidth:n,minHeight:t}=getComputedStyle(this.target);return{width:parseFloat(n)||32,height:parseFloat(t)||32}}resizeTarget=(n)=>{let{target:t}=this;if(!t)return;let{offsetWidth:e,offsetHeight:a}=t;t.style.left=t.offsetLeft+"px",t.style.top=t.offsetTop+"px",t.style.bottom="",t.style.right="";let{minSize:o}=this;an(n,(s,i,r)=>{if(t.style.width=Math.max(o.width,e+s)+"px",t.style.height=Math.max(o.height,a+i)+"px",r.type==="mouseup")return!0},"nwse-resize")};connectedCallback(){if(super.connectedCallback(),!this.target)this.target=this.parentElement;let n={passive:!0};this.addEventListener("mousedown",this.resizeTarget,n),this.addEventListener("touchstart",this.resizeTarget,n)}}var Al=ja.elementCreator({tag:"xin-sizer"}),{div:Ol,input:zl,span:_l,button:Ze}=m;class Ft extends b{caption="";removeable=!1;removeCallback=()=>{this.remove()};content=()=>[_l({part:"caption"},this.caption),Ze(y.x(),{part:"remove",hidden:!this.removeable,onClick:this.removeCallback})];constructor(){super();this.initAttributes("caption","removeable")}}var ks=Ft.elementCreator({tag:"xin-tag",styleSpec:{":host":{"--tag-close-button-color":"#000c","--tag-close-button-bg":"#fffc","--tag-button-opacity":"0.5","--tag-button-hover-opacity":"0.75","--tag-bg":p.brandColor("blue"),"--tag-text-color":p.brandTextColor("white"),display:"inline-flex",borderRadius:p.tagRoundedRadius(d.spacing50),color:d.tagTextColor,background:d.tagBg,padding:`0 ${d.spacing75} 0 ${d.spacing75}`,height:`calc(${d.lineHeight} + ${d.spacing50})`,lineHeight:`calc(${d.lineHeight} + ${d.spacing50})`},':host > [part="caption"]':{position:"relative",whiteSpace:"nowrap",overflow:"hidden",flex:"1 1 auto",fontSize:p.fontSize("16px"),color:d.tagTextColor,textOverflow:"ellipsis"},':host [part="remove"]':{boxShadow:"none",margin:`0 ${d.spacing_50} 0 ${d.spacing25}`,padding:0,display:"inline-flex",alignItems:"center",alignSelf:"center",justifyContent:"center",height:d.spacing150,width:d.spacing150,color:d.tagCloseButtonColor,background:d.tagCloseButtonBg,borderRadius:p.tagCloseButtonRadius("99px"),opacity:d.tagButtonOpacity},':host [part="remove"]:hover':{background:d.tagCloseButtonBg,opacity:d.tagButtonHoverOpacity}}});class Ca extends b{disabled=!1;name="";availableTags=[];value=[];textEntry=!1;editable=!1;placeholder="enter tags";get tags(){return typeof this.value==="string"?this.value.split(",").map((n)=>n.trim()).filter((n)=>n!==""):this.value}constructor(){super();this.initAttributes("name","value","textEntry","availableTags","editable","placeholder","disabled")}addTag=(n)=>{if(n.trim()==="")return;let{tags:t}=this;if(!t.includes(n))t.push(n);this.value=t,this.queueRender(!0)};toggleTag=(n)=>{if(this.tags.includes(n))this.value=this.tags.filter((t)=>t!==n);else this.addTag(n);this.queueRender(!0)};enterTag=(n)=>{let{tagInput:t}=this.parts;switch(n.key){case",":{let e=t.value.split(",")[0];this.addTag(e)}break;case"Enter":{let e=t.value.split(",")[0];this.addTag(e)}n.stopPropagation(),n.preventDefault();break;default:}};popSelectMenu=()=>{let{toggleTag:n}=this,{tagMenu:t}=this.parts,e=typeof this.availableTags==="string"?this.availableTags.split(","):this.availableTags,a=this.tags.filter((s)=>!e.includes(s));if(a.length)e.push(null,...a);let o=e.map((s)=>{if(s===""||s===null)return null;else if(typeof s==="object")return{checked:()=>this.tags.includes(s.value),caption:s.caption,action(){n(s.value)}};else return{checked:()=>this.tags.includes(s),caption:s,action(){n(s)}}});J({target:t,width:"auto",menuItems:o})};content=()=>[Ze({style:{visibility:"hidden"},tabindex:-1}),Ol({part:"tagContainer",class:"row"}),zl({part:"tagInput",class:"elastic",onKeydown:this.enterTag}),Ze({title:"add tag",part:"tagMenu",onClick:this.popSelectMenu},y.chevronDown())];removeTag=(n)=>{if(this.editable&&!this.disabled){let t=n.target.closest(Ft.tagName);this.value=this.tags.filter((e)=>e!==t.caption),t.remove(),this.queueRender(!0)}n.stopPropagation(),n.preventDefault()};render(){super.render();let{tagContainer:n,tagMenu:t,tagInput:e}=this.parts;if(t.disabled=this.disabled,e.value="",e.setAttribute("placeholder",this.placeholder),this.editable&&!this.disabled)t.toggleAttribute("hidden",!1),e.toggleAttribute("hidden",!this.textEntry);else t.toggleAttribute("hidden",!0),e.toggleAttribute("hidden",!0);n.textContent="";let{tags:a}=this;for(let o of a)n.append(ks({caption:o,removeable:this.editable&&!this.disabled,removeCallback:this.removeTag}))}}var Rl=Ca.elementCreator({tag:"xin-tag-list",styleSpec:{":host":{"--tag-list-bg":"#f8f8f8","--touch-size":"44px","--spacing":"16px",display:"grid",gridTemplateColumns:"auto",alignItems:"center",background:d.tagListBg,gap:d.spacing25,borderRadius:p.taglistRoundedRadius(d.spacing50),overflow:"hidden"},":host[editable]":{gridTemplateColumns:`0px auto ${d.touchSize}`},":host[editable][text-entry]":{gridTemplateColumns:`0px 2fr 1fr ${d.touchSize}`},':host [part="tagContainer"]':{display:"flex",content:'" "',alignItems:"center",background:d.inputBg,borderRadius:p.tagContainerRadius(d.spacing50),boxShadow:d.borderShadow,flexWrap:"nowrap",overflow:"auto hidden",gap:d.spacing25,minHeight:`calc(${d.lineHeight} + ${d.spacing})`,padding:d.spacing25},':host [part="tagMenu"]':{width:d.touchSize,height:d.touchSize,lineHeight:d.touchSize,textAlign:"center",padding:0,margin:0},":host [hidden]":{display:"none !important"},':host button[part="tagMenu"]':{background:d.brandColor,color:d.brandTextColor}}}),Sa="1.0.6";var K=f.fromCss("#EE257B"),js={_textColor:"#222",_brandColor:K,_background:"#fafafa",_inputBg:"#fdfdfd",_backgroundShaded:"#f5f5f5",_navBg:K.rotate(30).desaturate(0.5).brighten(0.9),_barColor:K.opacity(0.4),_focusColor:K.opacity(0.7),_placeholderColor:K.opacity(0.4),_brandTextColor:K.rotate(30).brighten(0.9),_insetBg:K.rotate(45).brighten(0.8),_codeBg:K.rotate(-15).desaturate(0.5).brighten(0.9),_linkColor:K.rotate(-30).darken(0.5),_shadowColor:"#0004",_menuBg:"#fafafa",_menuItemActiveColor:"#000",_menuItemIconActiveColor:"#000",_menuItemActiveBg:"#aaa",_menuItemHoverBg:"#eee",_menuItemColor:"#222",_menuSeparatorColor:"#2224",_scrollThumbColor:"#0006",_scrollBarColor:"#0001"},Cs={"@import":"https://fonts.googleapis.com/css2?family=Aleo:ital,wght@0,100..900;1,100..900&famiSpline+Sans+Mono:ital,wght@0,300..700;1,300..700&display=swap",":root":{_fontFamily:"'Aleo', sans-serif",_codeFontFamily:"'Spline Sans Mono', monospace",_fontSize:"16px",_codeFontSize:"14px",...js,_spacing:"10px",_lineHeight:d.fontSize160,_h1Scale:"2",_h2Scale:"1.5",_h3Scale:"1.25",_touchSize:"32px",_headerHeight:`calc(${d.lineHeight} * ${d.h2Scale} + ${d.spacing200})`},"@media (prefers-color-scheme: dark)":{body:{_darkmode:"true"}},".darkmode":{...ue(js),_menuShadow:"0 0 0 2px #a0f3d680",_menuSeparatorColor:"#a0f3d640"},".high-contrast":{filter:"contrast(2)"},".monochrome":{filter:"grayscale(1)"},".high-contrast.monochrome":{filter:"contrast(2) grayscale(1)"},"*":{boxSizing:"border-box",scrollbarColor:`${d.scrollThumbColor} ${d.scrollBarColor}`,scrollbarWidth:"thin"},body:{fontFamily:d.fontFamily,fontSize:d.fontSize,margin:"0",lineHeight:d.lineHeight,background:d.background,_linkColor:d.brandColor,_xinTabsSelectedColor:d.brandColor,_xinTabsBarColor:d.brandTextColor,_menuItemIconColor:d.brandColor,color:d.textColor},"input, button, select, textarea":{fontFamily:d.fontFamily,fontSize:d.fontSize,color:"currentColor",background:d.inputBg},select:{WebkitAppearance:"none",appearance:"none"},header:{background:d.brandColor,color:d.brandTextColor,_textColor:d.brandTextColor,_linkColor:d.transTextColor,display:"flex",alignItems:"center",padding:"0 var(--spacing)",lineHeight:"calc(var(--line-height) * var(--h1-scale))",height:d.headerHeight,whiteSpace:"nowrap"},h1:{color:d.brandColor,fontSize:"calc(var(--font-size) * var(--h1-scale))",lineHeight:"calc(var(--line-height) * var(--h1-scale))",fontWeight:"400",borderBottom:`4px solid ${d.barColor}`,margin:`${d.spacing} 0 ${d.spacing200}`,padding:0},"header h2":{color:d.brandTextColor,whiteSpace:"nowrap"},h2:{color:d.brandColor,fontSize:"calc(var(--font-size) * var(--h2-scale))",lineHeight:"calc(var(--line-height) * var(--h2-scale))",margin:"calc(var(--spacing) * var(--h2-scale)) 0"},h3:{fontSize:"calc(var(--font-size) * var(--h3-scale))",lineHeight:"calc(var(--line-height) * var(--h3-scale))",margin:"calc(var(--spacing) * var(--h3-scale)) 0"},main:{alignItems:"stretch",display:"flex",flexDirection:"column",maxWidth:"100vw",height:"100vh",overflow:"hidden"},"main > xin-sidenav":{height:"calc(100vh - var(--header-height))"},"main > xin-sidenav::part(nav)":{background:d.navBg},"input[type=search]":{borderRadius:99},blockquote:{position:"relative",background:d.insetBg,margin:"0 48px 48px 0",borderRadius:d.spacing,padding:"var(--spacing) calc(var(--spacing) * 2)",filter:`drop-shadow(0px 1px 1px ${d.shadowColor})`},"blockquote > :first-child":{marginTop:"0"},"blockquote > :last-child":{marginBottom:"0"},"blockquote::before":{content:'" "',display:"block",width:1,height:1,border:"10px solid transparent",borderTopColor:d.insetBg,borderRightColor:d.insetBg,position:"absolute",bottom:-20,right:24},"blockquote::after":{content:'" "',width:48,height:48,display:"block",bottom:-48,right:-24,position:"absolute",background:Vt(y.tosi())},".bar":{display:"flex",gap:d.spacing,justifyContent:"center",alignItems:"center",padding:d.spacing,flexWrap:"wrap",_textColor:d.brandColor,background:d.barColor},a:{textDecoration:"none",color:d.linkColor,opacity:"0.9",borderBottom:"1px solid var(--brand-color)"},"button, select, .clickable":{transition:"ease-out 0.2s",background:d.brandTextColor,_textColor:d.brandColor,display:"inline-block",textDecoration:"none",padding:"0 calc(var(--spacing) * 1.25)",border:"none",borderRadius:"calc(var(--spacing) * 0.5)"},"button, select, clickable, input":{lineHeight:"calc(var(--line-height) + var(--spacing))"},"select:has(+ .icon-chevron-down)":{paddingRight:"calc(var(--spacing) * 2.7)"},"select + .icon-chevron-down":{marginLeft:"calc(var(--spacing) * -2.7)",width:"calc(var(--spacing) * 2.7)",alignSelf:"center",pointerEvents:"none",objectPosition:"left center",_textColor:d.brandColor},"label > select + .icon-chevron-down":{marginLeft:"calc(var(--spacing) * -3.5)"},"input, textarea":{border:"none",outline:"none",borderRadius:"calc(var(--spacing) * 0.5)"},input:{padding:"0 calc(var(--spacing) * 1.5)"},textarea:{padding:"var(--spacing) calc(var(--spacing) * 1.25)",lineHeight:d.lineHeight,minHeight:"calc(var(--spacing) + var(--line-height) * 4)"},"input[type='number']":{paddingRight:0,width:"6em",textAlign:"right"},"input[type=number]::-webkit-inner-spin-button":{margin:"1px 3px 1px 0.5em",opacity:1,inset:1},"input[type='checkbox'], input[type='radio']":{maxWidth:d.lineHeight},"::placeholder":{color:d.placeholderColor},img:{verticalAlign:"middle"},"button:hover, button:hover, .clickable:hover":{boxShadow:"inset 0 0 0 2px var(--brand-color)"},"button:active, button:active, .clickable:active":{background:d.brandColor,color:d.brandTextColor},label:{display:"inline-flex",gap:"calc(var(--spacing) * 0.5)",alignItems:"center"},".elastic":{flex:"1 1 auto",overflow:"hidden",position:"relative"},svg:{fill:"currentcolor",pointerEvents:"none"},"svg text":{fontSize:"16px",fontWeight:"bold",fill:"#000",stroke:"#fff8",strokeWidth:"0.5",opacity:"0"},"svg text.hover":{opacity:"1"},".thead":{background:d.brandColor,color:d.brandTextColor},".th + .th":{border:"1px solid #fff4",borderWidth:"0 1px"},".th, .td":{padding:"0 var(--spacing)"},".tr:not([aria-selected]):hover":{background:"#08835810"},"[aria-selected]":{background:"#08835820"},":disabled":{opacity:"0.5",filter:"saturate(0)",pointerEvents:"none"},pre:{background:d.codeBg,padding:d.spacing,borderRadius:"calc(var(--spacing) * 0.25)",overflow:"auto",fontSize:d.codeFontSize,lineHeight:"calc(var(--font-size) * 1.2)"},"pre, code":{fontFamily:d.codeFontFamily,_textColor:d.brandColor,fontSize:"90%"},".-xin-sidenav-visible .close-content":{display:"none"},".transparent, .iconic":{background:"none"},".iconic":{padding:"0",fontSize:"150%",lineHeight:"calc(var(--line-height) + var(--spacing))",width:"calc(var(--line-height) + var(--spacing))",textAlign:"center"},".transparent:hover, .iconic:hover":{background:"#0002",boxShadow:"none",color:d.textColor},".transparent:active, .iconic:active":{background:"#0004",boxShadow:"none",color:d.textColor},"xin-sidenav:not([compact]) .show-within-compact":{display:"none"},".on.on":{background:d.brandColor,_textColor:d.brandTextColor},".current":{background:d.background},".doc-link":{cursor:"pointer",borderBottom:"none",transition:"0.15s ease-out",marginLeft:"20px",padding:"calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5)"},".doc-link:not(.current):hover":{background:d.background},".doc-link:not(.current)":{opacity:"0.8",marginLeft:0},"xin-example":{margin:"var(--spacing) 0"},"xin-example .preview.preview":{padding:10},"xin-example [part=editors]":{background:d.insetBg},"[class*='icon-'], xin-icon":{color:"currentcolor",height:d.fontSize,pointerEvents:"none"},"[class*='icon-']":{verticalAlign:"middle"},".icon-plus":{content:"'+'"},table:{borderCollapse:"collapse"},thead:{background:d.brandColor,color:d.brandTextColor},tbody:{background:d.background},"tr:nth-child(2n)":{background:d.backgroundShaded},"th, td":{padding:"calc(var(--spacing) * 0.5) var(--spacing)"},"header xin-locale-picker xin-select button":{color:"currentcolor",background:"transparent",gap:"2px"},"img.logo, xin-icon.logo":{animation:"2s ease-in-out 0s infinite alternate logo-swing"},"@keyframes logo-swing":{"0%":{transform:"perspective(1000px) rotateY(15deg)"},"100%":{transform:"perspective(1000px) rotateY(-15deg)"}}};var Yt=[{text:`# tosijs

<!--{ "pin": "top" }-->

> \`xinjs\` has been renamed \`tosijs\`. Updating the documentation and links is a
> work in progress. The goal is for the API to remain stable during the transition.
> If/when you want to migrate from \`xinjs\` to \`tosijs\`, here's a [guide for migrating to tosijs](/?Migration.md)

[tosijs.net](https://tosijs.net) | [tosijs-ui](https://ui.tosijs.net) | [github](https://github.com/tonioloewald/tosijs) | [npm](https://www.npmjs.com/package/tosijs) | [cdn](https://www.jsdelivr.com/package/npm/tosijs) | [react-tosijs](https://react.tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

[![tosijs is on NPM](https://badge.fury.io/js/tosijs.svg)](https://www.npmjs.com/package/tosijs)
[![tosijs is about 10kB gzipped](https://deno.bundlejs.com/?q=tosijs&badge=)](https://bundlejs.com/?q=tosijs&badge=)
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
- written in Typescript, Javascript-friendly
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
    ...readmeTodoDemo.list.tosiListBinding(
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

\`tosijs\` lets you work with pure HTML and web-component as cleanly—more cleanly—and efficiently than
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
or virtual DOM required. And it all works just as well with web-components. This is you get when
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

    const { style, h1, slot } = elements
    export class MyComponent extends Component {
      styleNode = style(css({
        h1: {
          color: 'blue'
        }
      }))
      content = [ h1('hello world'), slot() ]
    }

The difference is that \`web-components\` are drop-in replacements for standard HTML elements
and interoperate happily with one-another and other libraries, load asynchronously,
and are natively supported by all modern browsers.

## What \`tosijs\` does

### Observe Object State

\`tosijs\` tracks the state of objects you assign to it using \`paths\` allowing economical
and direct updates to application state.

    import { xinProxy, observe } from 'tosijs'

    const { app } = xinProxy({
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
      document.body.classList.toggle('dark-mode', app.prefs.darkmode)
    })

    observe('app.docs', () => {
      // render docs
    })

> #### What does \`xinProxy\` do, and what is a \`XinProxy\`?
>
> \`xinProxy\` is syntax sugar for assigning something to \`xin\` (which is a \`XinProxyObject\`)
> and then getting it back out again.
>
> A \`XinProxy\` is an [ES Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
> wrapped around an \`object\` (which in Javascript means anything
> that has a \`constructor\` which in particular includes \`Array\`s, \`class\` instances, \`function\`s
> and so on, but not "scalars" like \`number\`s, \`string\`s, \`boolean\`s, \`null\`, and \`undefined\`)
>
> All you need to know about a \`XinProxy\` is that it's Proxy wrapped around your original
> object that allows you to interact with the object normally, but which allows \`tosijs\` to
> **observe** changes made to the wrapped object and tell interested parties about the changes.
>
> If you want to original object back you can just hold on to a reference or use \`xinValue(someProxy)\`
> to unwrap it.

### No Tax, No Packaging

\`tosijs\` does not modify the stuff you hand over to it… it just wraps objects
with a \`Proxy\` and then if you use \`xin\` to make changes to those objects,
\`tosijs\` will notify any interested observers.

**Note** \`xinProxy({foo: {...}})\` is syntax sugar for \`xin.foo = {...}\`.

    import { xinProxy, observe } from 'tosijs'
    const { foo } = xinProxy({
      foo: {
        bar: 17
      }
    })

    observe('foo.bar', v => {
      console.log('foo.bar was changed to', xin.foo.bar)
    })

    foo.bar = 17        // does not trigger the observer
    foo.bar = Math.PI   // triggers the observer

### Paths are like JavaScript

\`xin\` is designed to behave just like a JavaScript \`Object\`. What you put
into it is what you get out of it:

    import { xin, xinValue } from 'tosijs'

    const foo = {bar: 'baz'}
    xin.foo = foo

    // xin.foo returns a Proxy wrapped around foo (without touching foo)
    xinValue(xin.foo) === foo

    // really, it's just the original object
    xin.foo.bar = 'lurman'
    foo.bar === 'lurman' // true

    // seriously, it's just the original object
    foo.bar = 'luhrman'
    xin.foo.bar === 'luhrman' // true

### …but better!

It's very common to deal with arrays of objects that have unique id values,
so \`tosijs\` supports the idea of id-paths

    import { xinProxy, xin } from 'tosijs

    const { app } = xinProxy ({
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
    console.log(xin['app.list[id=1234abcd'])   // hello world

### Telling \`xin\` about changes using \`touch()\`

Sometimes you will modify an object behind \`xin\`'s back (e.g. for efficiency).
When you want to trigger updates, simply touch the path.

    import { xin, observe, touch } from 'tosijs'

    const foo = { bar: 17 }
    xin.foo = foo
    observe('foo.bar', path => console.log(path, '->', xin[path])
    xin.foo.bar = -2              // console will show: foo.bar -> -2

    foo.bar = 100                 // nothing happens
    touch('foo.bar')              // console will show: foo.bar -> 100

### CSS

\`tosijs\` includes utilities for working with css.

    import {css, vars, initVars, darkMode} from 'tosijs'
    const cssVars = {
      textFont: 'sans-serif'
      color: '#111'
    }

\`initVars()\` processes an object changing its keys from camelCase to --kabob-case:

    initVars(cssVars) // emits { --text-font: "sans-serif", --color: "#111" }

\`darkMode()\` processes an object, taking only the color properties and inverting their luminance values:
darkMode(cssVars) // emits { color: '#ededed' }

The \`vars\` simply converts its camelCase properties into css variable references

    vars.fooBar // emits 'var(--foo-bar)'
    calc(\`\${vars.width} + 2 * \${vars.spacing}\`) // emits 'calc(var(--width) + 2 * var(--spacing))'

\`css()\` processes an object, rendering it as CSS

    css({
      '.container': {
        'position', 'relative'
      }
    }) // emits .container { position: relative; }

## Color

\`tosijs\` includes a powerful \`Color\` class for manipulating colors.

    import {Color} from 'tosijs
    const translucentBlue = new Color(0, 0, 255, 0.5) // r, g, b, a parameters
    const postItBackground = Color.fromCss('#e7e79d')
    const darkGrey = Color.fromHsl(0, 0, 0.2)

The color objects have computed properties for rendering the color in different ways,
making adjustments, blending colors, and so forth.

## Hot Reload

One of the nice things about working with the React toolchain is hot reloading.
\`tosijs\` supports hot reloading (and not just in development!) via the \`hotReload()\`
function:

    import {xin, hotReload} from 'tosijs'

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

### Types

\`tosijs\` [type-by-example](https://www.npmjs.com/package/type-by-example) has been
broken out into a separate standalone library. (Naturally it works very well with
tosijs but they are completely independent.)

## Development Notes

You'll need to install [bun](https://bun.sh/) and [nodejs](https://nodejs.org)),
and then run \`npm install\` and \`bun install\`. \`bun\` is used because it's
**fast** and is a really nice test-runner.

To work interactively on the demo code, use \`bun start\`. This runs the demo
site on localhost.

To build everything run \`bun run make\` which builds production versions of the
demo site (in \`www\`) and the \`dist\` and \`cdn\` directories.

To create a local package (for experimenting with a build) run \`bun pack\`.

### Parcel Occasionally Gets Screwed Up

- remove all the parcel transformer dependencies @parcel/\\*
- rm -rf node_modules
- run the update script
- npx parcel build (which restores needed parcel transformers)

## Related Libraries

- react-tosijs [react-tosijs](https://github.com/tonioloewald/react-tosijs#readme)
  allows you to use xin's path-observer model in React [ReactJS](https://reactjs.org) apps
- type-by-example [github](https://github.com/tonioloewald/type-by-example) | [npm](https://www.npmjs.com/package/type-by-example)
  is a library for declaring types in pure javascript, allowing run-time type-checking.
- filter-shapes [github](https://github.com/tonioloewald/filter-shapes) | [npm](https://www.npmjs.com/package/filter-shapes)
  is a library for filtering objects (and arrays of objects) to specific shapes (e.g. to reduce storage / bandwidth costs).
  It is built on top of type-by-example.

## Credits

\`tosijs\` is in essence a highly incompatible update to \`b8rjs\` with the goal
of removing cruft, supporting more use-cases, and eliminating functionality
that has been made redundant by improvements to the JavaScript language and
DOM APIs.

\`tosijs\` is being developed using [bun](https://bun.sh/).
\`bun\` is crazy fast (based on Webkit's JS engine, vs. V8), does a lot of stuff
natively, and runs TypeScript (with import and require) directly.

Logo animation by [@anicoremotion](https://pro.fiverr.com/freelancers/anicoremotion).
`,title:"tosijs",filename:"README.md",path:"README.md",pin:"top"},{text:`# 1. tosi

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

## Helper properties and functions

\`BoxedProxy\` provides these helper properties and methods on all boxed values
(scalars, objects, and arrays):

- \`.value\` gets or sets the underlying value
- \`.path\` gets the string path
- \`.observe(callback)\` watches for changes, returns an unsubscribe function
- \`.bind(element, binding, options?)\` binds the value to a DOM element
- \`.on(element, eventType)\` binds an event handler
- \`.binding(binding)\` returns an inline binding spec for use with elements
- \`.listBinding(templateBuilder, options?)\` returns a list binding spec
- \`.valueOf()\` / \`.toJSON()\` for type coercion (scalars also have \`.toString()\`)

Example:
\`\`\`
boxed.foo.color.bind(element, {
  toDOM(element, color){
    element.style.backgroundColor = color
  }
})

// Works on objects too:
boxed.app.user.path      // 'app.user'
boxed.app.user.value     // { name: 'Alice', ... }
boxed.app.items.observe(callback)  // observe array changes
\`\`\`

> Note: The \`xinValue\`, \`xinPath\`, \`xinObserve\`, \`xinBind\`, \`xinOn\`, and
> \`tosiValue\`, \`tosiPath\`, etc. names still work but are deprecated.
> Use the shorter names above.

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

This lets you write bindings that support autocomplete and lint. Yay!`,title:"1.1 tosi, xin, and xinProxy",filename:"xin-proxy.ts",path:"src/xin-proxy.ts"},{text:`# 1.2 path-listener

\`path-listener\` implements the \`tosijs\` observer model. Although these events
are exported from \`tosijs\` they shouldn't need to be used very often. Mostly
they're used to manage state.

## \`touch(path: string)\`

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
it appear correctly in the UI?`,title:"1.2 path-listener",filename:"path-listener.ts",path:"src/path-listener.ts"},{text:"# 1.3 metadata\n\n## `xinValue(x: any): any`\n\n`xinValue` is helpful when you want to strip the `xin` or `boxed` proxy off of a\nvalue. `xinValue` passes through normal values, so it's safe to use on anything.\n\n```\nimport { boxed } from 'tosijs'\n\nconst foo = { bar: 'hello', baz: 17 }\nboxed.foo = foo\n\nboxed.foo.bar === foo.bar               // false, boxed.foo.bar is a proxy\nboxed.foo === foo                       // false, boxed.foo is a proxy\nboxed.foo.baz === 17                    // false, boxed.foo.baz is a proxy\nxinValue(boxed.foo.bar) === 'hello'     // true\nboxed.foo.bar.value === 'hello'         // true (preferred)\nboxed.foo.xinValue === foo              // true (deprecated)\nboxed.foo.baz.value === 17              // true\nxinValue(boxed.foo) === xinValue(foo)   // true\nfoo.xinValue                            // undefined! foo isn't a proxy\n```\n\n## `xinPath(x: any): string | undefined`\n\n`xinPath` will get you the path of a `xin` or `boxed` proxy. `xinPath` will be\nundefined for anything that's isn't a `xin` or `boxed` proxy, so it can also\nbe used to tell if a value is a (`xin` or `boxed`) proxy.\n\n> Note: For boxed scalars, prefer using `.value` and `.path` directly:\n> `boxed.foo.bar.value` and `boxed.foo.bar.path`",title:"1.3 metadata",filename:"metadata.ts",path:"src/metadata.ts"},{text:`# 2. bind

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

The basic structure of a **list-binding** is:

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

\`\`\`js
  import { elements, tosi } from 'tosijs'
  const { listBindingExample } = tosi({
    listBindingExample: {
      array: ['this', 'is', 'an', 'example']
    }
  })

  const { h3, ul, li, template } = elements

  preview.append(
    h3('binding an array of strings'),
    ul(
      ...listBindingExample.array.tosiListBinding(({li}, item) => li(item))
    )
  )
\`\`\`

### tosiListBinding(templateBuilder: ListTemplateBuilder, options?: ListBindingOptions) => [ElementProps, HTMLTemplateElement]

    type ListTemplateBuilder<U = any> = (elements: ElementsProxy, item: U) => HTMLElement
    type ListBinding = [ElementProps, HTMLTemplateElement]

The example leverages new syntax sugar that makes list-binding simpler
and more intuitive. (It's intended to be as convenient as mapping an array to elements,
except that you get dynamic binding, virtualized lists, versus a static list.)

If you have a BoxedProxy<T[]>, you can use \`tosiListBinding()\`
to create the binding inline (see the example above). Under the hood, the template
gets created and an object with the necessary specifications is produced.

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

Simply add a \`virtual\` property to the list-binding specifying a *minimum* \`height\` (and, optionally,
\`height\`) and the list will be \`virtualized\` (meaning that only visible elements will be rendered,
missing elements being replaced by a single padding element above and below the list).

You can (optionally) specify \`rowChunkSize\` to virtualize the list in chunks of rows to allow
consistent \`:nth-child()\` styling.

Now you can trivially bind an array of a million objects to the DOM and have it scroll at
120fps.

\`\`\`js
import { elements, tosi } from 'tosijs'
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const { emojiListExample } = tosi({
  emojiListExample: {
    array: await request.json()
  }
})

const { div } = elements

preview.append(
  div(
    {
      class: 'emoji-table'
    },
    ...emojiListExample.array.tosiListBinding(({div, span}, item) =>
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
)
\`\`\`
\`\`\`css
.emoji-table {
  height: 100%;
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

\`\`\`js
import { elements, tosi } from 'tosijs'
const { div, template } = elements
const list = []
for (let i = 0; i < 2000; i++) {
  list.push({id: i})
}

const { bigBindTest } = tosi({
  bigBindTest: list
})

preview.append(
  div(
    {
      class: 'virtual-grid-example',
    },
    ...bigBindTest.tosiListBinding(
      ({div}, item) => div({
        class: 'cell',
        bindText: item.id
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
)
\`\`\`
\`\`\`css
.virtual-grid-example {
  height: 100%;
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
    ...filterListExample.array.tosiListBinding(
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
virtualization will correctly account for content above the list.`,title:"2.1 binding arrays",filename:"list-binding.ts",path:"src/list-binding.ts"},{text:"# 2.2 bindings\n\n`bindings` is simply a collection of common bindings.\n\nYou can create your own bindings easily enough (and add them to `bindings` if so desired).\n\nA `binding` looks like this:\n\n```\ninterface XinBinding {\n  toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void\n  fromDOM?: (element: HTMLElement) => any\n}\n```\n\nThe `fromDOM` function is only needed for bindings to elements that trigger `change` or `input`\nevents, typically `<input>`, `<textarea>`, and `<select>` elements, and of course your\nown [Custom Elements](/?components.ts).\n\n## value\n\nThe `value` binding syncs state from `xin` to the bound element's `value` property. In\ngeneral this should only be used for binding simple things, like `<input>` and `<textarea>`\nelements.\n\n## text\n\nThe `text` binding copies state from `xin` to the bound element's `textContent` property.\n\n## enabled & disabled\n\nThe `enabled` and `disabled` bindings allow you to make a widget's enabled status\nbe determined by the truthiness of something in `xin`, e.g.\n\n```\nimport { xinProxy, elements } from 'tosijs'\n\nconst myDoc = xinProxy({\n    myDoc: {\n        content: ''\n        unsavedChanges: false\n    }\n}, 1)\n\n// this button will only be enabled if there is something in `myList.array`\ndocument.body.append(\n    elements.textarea({\n        bindValue: myDoc.content,\n        onInput() {\n            myDoc.unsavedChanges = true\n        }\n    }),\n    elements.button(\n        'Save Changes',\n        {\n            bindEnabled: myDoc.unsavedChanges,\n            onClick() {\n                // save the doc\n                myDoc.unsavedChanges = false\n            }\n        }\n    )\n)\n```\n\n## list\n\nThe `list` binding makes a copy of a `template` element inside the bound element\nfor every item in the bound `Array`.\n\nIt uses the existing **single** child element it finds inside the bound element\nas its `template`. If the child is a `<template>` (which is a good idea) then it\nexpects that `template` to have a *single child element*.\n\nE.g. if you have a simple unordered list:\n\n    <ul>\n      <li></li>\n    </ul>\n\nYou can bind an array to the `<ul>` and it will make a copy of the `<li>` inside\nfor each item in the source array.\n\nThe `list` binding accepts as options:\n- `idPath: string`\n- `initInstance: (element, item: any) => void`\n- `updateInstance: (element, item: any) => void`\n- `virtual: {width?: number, height: number}`\n- `hiddenProp: symbol | string`\n- `visibleProp: symbol | string`\n\n`initInstance` is called once for each element created, and is passed\nthat element and the array value that it represents.\n\nMeanwhile, `updateInstance` is called once on creation and then any time the\narray value is updated.\n\n### Virtual List Binding\n\nIf you want to bind large arrays with minimal performance impact, you can make a list\nbinding `virtual` by passing the `height` (and optionally `width`) of an item.\nOnly visible elements will be rendered. Just make sure the values passed represent\nthe *minimum* dimensions of the individual rendered items if they can vary in size.\n\n### Filtered Lists and Detail Views\n\nYou can **filter** the elements you wish to display in a bound list by using the\n`hiddenProp` (to hide elements of the list) and/or `visibleProp` (to show elements\nof the list).\n\nYou can pass a `path` or a `symbol` as either the `hiddenProp` or `visibleProp`.\n\nTypically, you can use `hiddenProp` to power filters and `visibleProp` to power\ndetail views. The beauty of using symbols is that it won't impact the serialized\nvalues of the array and different views of the array can use different selection\nand filtering criteria.\n\n> **Note** for a given list-binding, if you specify `hiddenProp` (but not `visibleProp`),\n> then all items in the array will be shown *unless* `item[hiddenProp] === true`.\n>\n> Conversely, if you specify `visibleProp` (but not `hiddenProp`), then all items\n> in the array will be ignored *unless* `item[visibleProp] === true`.\n>\n> If, for some reason, you specify both then an item will only be visible if\n> it `item[visibleProp] === true` and `item[hiddenProp] !== true`.\n\n### Binding custom-elements using idPath\n\nIf you list-bind a custom-element with `bindValue` implemented and providing an\n`idPath` then the list-binding will bind the array items to the value of the\ncustom-element.\n\n### xin-empty-list class\n\nThe `list` binding will automatically add the class `-xin-empty-list` to a\ncontainer bound to an empty array, making it easier to conditionally render\ninstructions or explanations when a list is empty.",title:"2.2 bindings",filename:"bindings.ts",path:"src/bindings.ts"},{text:`# 3. elements

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
> Again, use with caution!`,title:"3. elements",filename:"elements.ts",path:"src/elements.ts"},{text:`# 4. web-components

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
  static styleSpec = {
    ':host': {
      display: 'flex',
      gap: '10px',
    },
  }
}

export const toolBar = ToolBar.elementCreator({ tag: 'tool-bar' })
\`\`\`

This component is just a structural element. By default a \`Component\` subclass will
comprise itself and a \`<slot>\`. You can change this by giving your subclass its
own \`content\` template.

The last line defines the \`ToolBar\` class as the implementation of \`<tool-bar>\`
HTML elements (\`tool-bar\` is derived automatically from the class name) and
returns an \`ElementCreator\` function that creates \`<tool-bar>\` elements.

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
  caption = 'untitled'
  value = ''

  constructor() {
    super()
    this.initAttributes('caption')
  }

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

If you'd like to see a more complex example along the same lines, look at
[xin-form and xin-field](https://ui.tosijs.net/?form.ts).

##### <slot> names and the \`slot\` attribute

\`\`\`
class MenuBar extends Component {
  static styleSpec = {
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

#### \`<xin-slot>\`

If you put \`<slot>\` elements inside a \`Component\` subclass that doesn't have a
shadowDOM, they will automatically be replaced with \`<xin-slot>\` elements that
have the expected behavior (i.e. sucking in children in based on their \`<slot>\`
attribute).

\`<xin-slot>\` doesn't support \`:slotted\` but since there's no shadowDOM, just
style such elements normally, or use \`xin-slot\` as a CSS-selector.

Note that you cannot give a \`<slot>\` element attributes (other than \`name\`) so if
you want to give a \`<xin-slot>\` attributes (such as \`class\` or \`style\`), create it
explicitly (e.g. using \`elements.xinSlot()\`) rather than using \`<slot>\` elements
and letting them be switched out (because they'll lose any attributes you give them).

Here's a very simple example:

\`\`\`js
import { Component, elements } from 'tosijs'

class FauxSlotExample extends Component {
  content = ({h4, h5, xinSlot}) => [
    h4('This is a web-component with no shadow DOM and working slots!'),
    h5('top slot'),
    xinSlot({name: 'top'}),
    h5('middle slot'),
    xinSlot(),
    h5('bottom slot'),
    xinSlot({name: 'bottom'}),
  ]
}

const fauxSlotExample = FauxSlotExample.elementCreator({
  tag: 'faux-slot-example',
  styleSpec: {
    ':host': {
      display: 'flex',
      flexDirection: 'column'
    },
    ':host h4, :host h5': {
      margin: 0,
    },
    ':host xin-slot': {
      border: '2px solid grey'
    }
  }
})

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

> **Note**: the \`render()\` method of the base \`Component\` class doesn't currently
> do anything, so calling it is optional (but a good practice in case one day…)
>
> It is *necessary* however to call \`super.connectedCallback\`, \`super.disconnectedCallback\`
> and \`super()\` in the \`constructor()\` should you override them.

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

> Note that if a component does not use the shadowDOM, its \`<slot>\` elements will be replaced with \`<xin-slot>\` elements.
> This allows composition to work as expected without requiring the shadow DOM.

### Component methods

#### initAttributes(...attributeNames: string[])

    class LabeledInput extends Component {
      caption: string = 'untitled'
      value: string = ''

      constructor() {
        super()
        this.initAttributes('caption')
      }

      ...
    }

Sets up basic behavior such as queueing a render if an attribute is changed, setting
attributes based on the DOM source, updating them if they're changed, implementing
boolean attributes in the expected manner, and so forth.

Call \`initAttributes\` in your subclass's \`constructor\`, and make sure to call \`super()\`.

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

### Component static methods

#### Component.elementCreator(options? {tag?: string, styleSpec: XinStyleSheet}): ElementCreator

    export const toolBar = ToolBar.elementCreator({tag: 'tool-bar'})

Returns a function that creates the custom-element. If you don't pass a \`tag\` or if the provided tag
is already in use, a new unique tag will be used.

If no tag is provided, the Component will try to use introspection to "snake-case" the
"ClassName", but if you're using name mangling this won't work and you'll get something
pretty meaningless.

If you want to create a global \`<style>\` sheet for the element (especially useful if
your component doesn't use the \`shadowDOM\`) then you can pass \`styleSpec\`. E.g.

    export const toolBar = ToolBar.elementCreator({
      tag: 'tool-bar',
      styleSpec: {
        ':host': { // note that ':host' will be turned into the tagName automatically!
          display: 'flex',
          padding: 'var(--toolbar-padding, 0 8px)',
          gap: '4px'
        }
      }
    })

This will—assuming "tool-bar" is available—create:

    <style id="tool-bar-helper">
      tool-bar {
        display: flex;
        padding: var(--toolbar-padding, 0 8px);
        gap: 4px;
      }
    <style>

And append it to \`document.head\` when the first instance of \`<tool-bar>\` is inserted in the DOM.

Finally, \`elementCreator\` is memoized and only generated once (and the arguments are
ignored on all subsequent calls).

## Examples

[tosijs-ui](https://ui.tosijs.net) is a component library built using this \`Component\` class
that provides the essential additions to standard HTML elements needed to build many
user-interfaces.

- [xin-example](https://ui.tosijs.net/?live-example.ts) uses multiple named slots to implement
  powers the interactive examples used for this site.
- [xin-sidebar](https://ui.tosijs.net/?side-nav.ts) implements the sidebar navigation
  used on this site.
- [xin-table](https://ui.tosijs.net/?data-table.ts) implements virtualized tables
  with resizable, reorderable, sortable columns that can handle more data
  than you're probably willing to load.
- [xin-form and xin-field](https://ui.tosijs.net/?form.ts) allow you to
  quickly create forms that leverage all the built-in functionality of \`<input>\`
  elements (including powerful validation) even for custom-fields.
- [xin-md](https://ui.tosijs.net/?markdown-viewer.ts) uses \`marked\` to render
  markdown.
- [xin-3d](https://ui.tosijs.net/?babylon-3d.ts) lets you easily embed 3d scenes
  in your application using [babylonjs](https://babylonjs.com/)`,title:"4. web-components",filename:"component.ts",path:"src/component.ts"},{text:`# 4.1 blueprints

One issue with standard web-components built with tosijs is that building them
"sucks in" the version of \`tosijs\` you're working with. This isn't a huge problem
with monolithic code-bases, but it does prevent components from being loaded
"on-the-fly" from CDNs and composed on the spot and it does make it hard to
"tree shake" component libraries.

\`\`\`js
import { elements, blueprintLoader, blueprint } from 'tosijs'

preview.append(
  blueprintLoader(
    blueprint({
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

To address these issues, \`tosijs\` provides a \`<xin-loader>\` loader component and
a function \`makeComponent\` that can define a component given a blueprint
function.

## \`<xin-loader>\`—the blueprint loader

\`<xin-loader>\` is a simple custom-element provided by \`tosijs\` for the dynamic loading
of component **blueprints**. It will load its \`<xin-blueprint>\`s in parallel.

\`\`\`
<xin-loader>
  <xin-blueprint tag="swiss-clock" src="https://loewald.com/lib/swiss-clock"></xin-blueprint>
</xin-loader>
<swiss-clock>
  <code style="color: var(--brand-color)">tosijs</code> rules!
</swiss-clock>
\`\`\`

### \`<xin-blueprint>\` Attributes

- \`src\` is the url of the \`blueprint\` javascript module (required)
- \`tag\` is the tagName you wish to use. This defaults to the name of the source file if suitable.
- \`property\` allows you to load a named exported property from a blueprint module
  (allowing one blueprint to export multiple blueprints). By default, it's \`default\`.
- \`loaded\` is the \`XinPackagedComponent\` after loading

#### \`<xin-blueprint>\` Properties

- \`blueprintLoaded(package: XinPackagedComponent)\` \`<xin-blueprint>\` when its blueprint is loaded.

#### \`<xin-loader>\` Properties

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
import { blueprintLoader, blueprint } from 'tosijs'

let clockType = null

preview.append(
  blueprintLoader(
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
    blueprint({
      tag: 'swiss-clock',
      src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
      blueprintLoaded({type, creator}) {
        clockType = type
        preview.append(creator())
      },
    }),
    blueprint({
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
      static styleSpec = {
        ':host': {
          color: varDefault.textColor('#222'),
          background: vars.bgColor,
        },

        content = () => [
          h2('my thing'),
          slot()
        ]
      }
    }

    export const myThing = myThing.elementCreator({
      tag: 'my-thing',
      styleSpec: {
        _bgColor: '#f00'
      }
    })

You can define a "blueprint" like this:

    import { XinBlueprint } from 'tosijs'

    const blueprint: XinBlueprint = (
      tag,
      { Component, elements, vars, varDefault }
    ) => {
      const {h2, slot} = elements

      class MyThing extends Component {
        static styleSpec = {
          ':host': {
            color: varDefault.textColor('#222'),
            background: vars.bgColor,
          },

          content = () => [
            h2('my thing'),
            slot()
          ]
        }
      }

      return {
        type: MyThing,
        styleSpec: {
          _bgColor: '#f00'
        }
      }
    }

The blueprint function can be \`async\`, so you can use async import inside it to pull in dependencies.

> **Note** that in this example the blueprint is a *pure* function (i.e. it has no side-effects).
> If this blueprint is consumed twice, each will be completely independent. A non-pure blueprint
> could be implemented such that the different versions of the blueprint share information.
> E.g. you could maintain a list of all the instances of any version of the blueprint.`,title:"4.1 blueprints",filename:"blueprint-loader.ts",path:"src/blueprint-loader.ts"},{text:`# 4.2 makeComponent

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
  styleSpec?: XinStyleSheet
}
\`\`\`

Note that a crucial benefit of blueprints is that the **consumer** of the blueprint gets
to choose the \`tagName\` of the custom-element.`,title:"4.2 makeComponent",filename:"make-component.ts",path:"src/make-component.ts"},{text:`# 5. css

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
the javascript payload.`,title:"5. css",filename:"css.ts",path:"src/css.ts"},{text:"# 5.1 color\n\n`tosijs` includes a lightweight, powerful `Color` class for manipulating colors.\nI hope at some point CSS will provide sufficiently capable native color calculations\nso that this will no longer be needed. Some of these methods have begun to appear,\nand are approaching wide implementation.\n\n## Color\n\nThe most straightforward methods for creating a `Color` instance are to use the\n`Color()` constructor to create an `rgb` or `rgba` representation, or using the\n`Color.fromCss()` to create a `Color` from any CSS (s)rgb representation,\ne.g.\n\n```\nnew Color(255, 255, 0)               // yellow\nnew Color(0, 128, 0, 0.5)            // translucent dark green\nColor.fromCss('#000')                // black\nColor.fromCss('hsl(90deg 100% 50%))  // orange\nColor.fromCss('color(srgb 1 0 0.5))  // purple\n```\n\nNote that `Color.fromCss()` is not compatible with non-srgb color spaces. The new CSS\ncolor functions produce color specifications of the form `color(<space> ....)` and\n`Color.fromCSS()` will handle `color(srgb ...)` correctly (this is so it can parse the\noutput of `color-mix(in hsl ...)` but not other [color spaces](https://developer.mozilla.org/en-US/blog/css-color-module-level-4/#whats_new_in_css_colors_module_level_4).\n\n## Manipulating Colors\n\n```js\nimport { elements, Color } from 'tosijs'\n\nconst { label, span, div, input, button } = elements\n\nconst swatches = div({ class: 'swatches' })\nfunction makeSwatch(text) {\n  const color = Color.fromCss(colorInput.value)\n  const adjustedColor = eval('color.' + text)\n  swatches.style.setProperty('--original', color)\n  swatches.append(\n    div(\n      text,\n      {\n        class: 'swatch',\n        title: `${adjustedColor.html} ${adjustedColor.hsla}`,\n        style: {\n          _adjusted: adjustedColor,\n          _text: adjustedColor.contrasting()\n        }\n      }\n    )\n  )\n}\n\nconst colorInput = input({\n  type: 'color',\n  value: '#000',\n  onInput: update\n})\nconst red = Color.fromCss('#f00')\nconst gray = Color.fromCss('#888')\nconst teal = Color.fromCss('teal')\nconst aliceblue = Color.fromCss('aliceblue')\n\nfunction update() {\n  swatches.textContent = ''\n  makeSwatch('brighten(-0.5)')\n  makeSwatch('brighten(0.5)')\n  makeSwatch('saturate(0.25)')\n  makeSwatch('saturate(0.5)')\n  makeSwatch('desaturate(0.5)')\n  makeSwatch('desaturate(0.75)')\n  makeSwatch('contrasting()')\n  makeSwatch('contrasting(0.05)')\n  makeSwatch('contrasting(0.25)')\n  makeSwatch('contrasting(0.45)')\n  makeSwatch('inverseLuminance')\n  makeSwatch('mono')\n  makeSwatch('rotate(-330)')\n  makeSwatch('rotate(60)')\n  makeSwatch('rotate(-270)')\n  makeSwatch('rotate(120)')\n  makeSwatch('rotate(-210)')\n  makeSwatch('rotate(180)')\n  makeSwatch('rotate(-150)')\n  makeSwatch('rotate(240)')\n  makeSwatch('rotate(-90)')\n  makeSwatch('rotate(300)')\n  makeSwatch('rotate(-30)')\n  makeSwatch('opacity(0.1)')\n  makeSwatch('opacity(0.5)')\n  makeSwatch('opacity(0.75)')\n  makeSwatch('rotate(-90).opacity(0.75)')\n  makeSwatch('brighten(0.5).desaturate(0.5)')\n  makeSwatch('blend(Color.black, 0.5)')\n  makeSwatch('mix(Color.white, 0.4)')\n  makeSwatch('blend(gray, 0.4)')\n  makeSwatch('mix(red, 0.25)')\n  makeSwatch('mix(red, 0.5)')\n  makeSwatch('mix(red, 0.75)')\n  makeSwatch('mix(teal, 0.25)')\n  makeSwatch('mix(teal, 0.5)')\n  makeSwatch('mix(teal, 0.75)')\n  makeSwatch('colorMix(aliceblue, 0.25)')\n  makeSwatch('colorMix(aliceblue, 0.5)')\n  makeSwatch('colorMix(aliceblue, 0.75)')\n}\n\nfunction randomColor() {\n  colorInput.value = Color.fromHsl(Math.random() * 360, Math.random(), Math.random() * 0.5 + 0.25)\n  update()\n}\n\nrandomColor()\n\npreview.append(\n  label(\n    span('base color'),\n    colorInput\n  ),\n  button(\n    'Random(ish) Color',\n    {\n      onClick: randomColor\n    }\n  ),\n  swatches\n)\n```\n```css\n.preview .swatches {\n  display: flex;\n  gap: 4px;\n  padding: 4px;\n  flex-wrap: wrap;\n  font-size: 80%;\n}\n.preview .swatch {\n  display: inline-block;\n  padding: 2px 6px;\n  color: var(--text);\n  background: var(--adjusted);\n  border: 2px solid var(--original);\n}\n```\n\nEach of these methods creates a new color instance based on the existing color(s).\n\nIn each case `amount` is from 0 to 1, and `degrees` is an angle in degrees.\n\n- `brighten(amount: number)`\n- `darken(amount: number)`\n- `saturate(amount: number)`\n- `desaturate(amount: number)`\n- `rotate(angle: number)`\n- `opacity(amount: number)` — this just creates a color with that opacity (it doesn't adjust it)\n- `mix(otherColor: Color, amount)` — produces a mix of the two colors in HSL-space\n- `colorMix(otherColor: Color, amount)` — uses `color-mix(in hsl...)` to blend the colors\n- `blend(otherColor: Color, amount)` — produces a blend of the two colors in RGB-space (usually icky)\n- `contrasting(amount = 1)` — produces a **contrasting color** by blending the color with black (if its\n  `brightness` is > 0.5) or white by `amount`. The new color will always have opacity 1.\n  `contrasting()` produce nearly identical results to `contrast-color()`.\n\n> **Note** the captions in the example above are colored using `contrasting()` and thus\n> should always be readable. In general, a base color will produce the worst results when\n> its `brightness` is around 0.5, much as is the case with the new and experimental CSS\n> [contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color)\n> function.\n>\n> **Also note** that highly translucent colors might produce disappointing `.contrasting()`\n> results since it's the blended color you need to worry about.\n\nWhere-ever possible, unless otherwise indicated, all of these operations are performed in HSL-space.\nHSL space is not great! For example, `desaturate` essentially blends you with medium gray (`#888`)\nrather than a BT.601 `brightness` value where \"yellow\" is really bright and \"blue\" is really dark.\n\nIf you want to desaturate colors more nicely, you can try blending them with their own `mono`.\n\n## Static Methods\n\nThese are alternatives to the standard `Color(r, g, b, a = 1)` constructor.\n\n`Color.fromVar(cssVariableName: string, element = document.body): Color` evaluates\nthe color at the specified element and then returns a `Color` instance with that\nvalue. It will accept both bare variable names (`--foo-bar`) and wrapped (`var(--foo-bar)`).\n\n`Color.fromCss(cssColor: string): Color` produces a `Color` instance from any\ncss color definition the browser can handle.\n\n`Color.fromHsl(h: number, s: number, l: number, a = 1)` produces a `Color`\ninstance from HSL/HSLA values. The HSL values are cached internally and\nused for internal calculations to reduce precision problems that occur\nwhen converting HSL to RGB and back. It's nowhere near as sophisticated as\nthe models used by (say) Adobe or Apple, but it's less bad than doing all\ncomputations in rgb.\n\n## Static Properties\n\n- `black`, `white` — handy constants\n\n## Properties\n\n- `r`, `g`, `b` are numbers from 0 to 255.\n- `a` is a number from 0 to 1\n\n## Properties (read-only)\n\n- `html` — the color in HTML `#rrggbb[aa]` format\n- `inverse` — the photonegative of the color (light is dark, orange is blue)\n- `opaque` - the color, but guaranteed opaque\n- `inverseLuminance` — inverts luminance but keeps hue, great for \"dark mode\"\n- `rgb` and `rgba` — the color in `rgb(...)` and `rgba(...)` formats.\n- `hsl` and `hsla` — the color in `hsl(...)` and `hsla(...)` formats.\n- `RGBA` and `ARGB` — return the values as arrays of numbers from 0 to 1 for use with\n  [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) (for example).\n- `brightness` — this is the brightness of the color based on [BT.601](https://www.itu.int/rec/R-REC-BT.601)\n- `mono` — this produces a `Color` instance that a greyscale version (based on `brightness`)\n\n## Utilities\n\n- `swatch()` emits the color into the console with a swatch and returns the color for chaining.\n- `toString()` emits the `html` property",title:"5.1 color",filename:"color.ts",path:"src/color.ts"},{text:"# A.1 more-math\n\nSome simple functions egregiously missing from the Javascript `Math`\nobject. They are exported from `tosijs` as the `MoreMath` object.\n\n## Functions\n\n`clamp(min, v, max)` will return `v` if it's between `min` and `max`\nand the `min` or `max` otherwise.\n\nIf min > max, the function will return NaN.\n\n```\nclamp(0, 0.5, 1)        // produces 0.5\nclamp(0, -0.5, 1)       // produces 0\nclamp(-50, 75, 50)      // produces 50\n```\n\n`lerp(a, b, t, clamped = true)` will interpolate linearly between `a` and `b` using\nparameter `t`. `t` will be clamped to the interval `[0, 1]`, so\n`lerp` will be clamped *between* a and b unless you pass `false` as the\noptional fourth parameter (allowing `lerp()` to extrapolate).\n\n```\nlerp(0, 10, 0.5)        // produces 5\nlerp(0, 10, 2)          // produces 10\nlerp(0, 10, 2, false)   // produces 20\nlerp(5, -5, 0.75)       // produces -2.5\n```\n\n## Constants\n\n`RADIANS_TO_DEGREES` and `DEGREES_TO_RADIANS` are values to multiply\nan angle by to convert between degrees and radians.",title:"A.1 more-math",filename:"more-math.ts",path:"src/more-math.ts"},{text:`# A.2 throttle & debounce

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
However, parameters passed to skipped calls will *never* reach the wrapped function.`,title:"A.2 throttle & debounce",filename:"throttle.ts",path:"src/throttle.ts"},{text:"# A.3 hotReload\n\n`hotReload()` persists any root-level paths in `xin` that its test function evaluates as true\nto `localStorage`.\n\n```\nhotReload(test: PathTestFunction = () => true): void\n```",title:"A.3 hotReload",filename:"hot-reload.ts",path:"src/hot-reload.ts"},{text:`# A.4 Working with React

A lot of developers are going to be using React. Is \`tosijs\` relevant to React developers?

Absolutely!

- [react-tosijs](https://react.tosijs.net) provides \`useTosi()\` to create hooks that
  connect any data into a React component.
- [react-tosijs](https://react.tosijs.net) provides the \`reactWebComponents\` proxy
  that turn any web-component into a React functional component.
`,title:"A.4 Working with React",filename:"React.md",path:"React.md"},{text:`# Beads - AI-Native Issue Tracking

Welcome to Beads! This repository uses **Beads** for issue tracking - a modern, AI-native tool designed to live directly in your codebase alongside your code.

## What is Beads?

Beads is issue tracking that lives in your repo, making it perfect for AI coding agents and developers who want their issues close to their code. No web UI required - everything works through the CLI and integrates seamlessly with git.

**Learn more:** [github.com/steveyegge/beads](https://github.com/steveyegge/beads)

## Quick Start

### Essential Commands

\`\`\`bash
# Create new issues
bd create "Add user authentication"

# View all issues
bd list

# View issue details
bd show <issue-id>

# Update issue status
bd update <issue-id> --status in_progress
bd update <issue-id> --status done

# Sync with git remote
bd sync
\`\`\`

### Working with Issues

Issues in Beads are:
- **Git-native**: Stored in \`.beads/issues.jsonl\` and synced like code
- **AI-friendly**: CLI-first design works perfectly with AI coding agents
- **Branch-aware**: Issues can follow your branch workflow
- **Always in sync**: Auto-syncs with your commits

## Why Beads?

✨ **AI-Native Design**
- Built specifically for AI-assisted development workflows
- CLI-first interface works seamlessly with AI coding agents
- No context switching to web UIs

🚀 **Developer Focused**
- Issues live in your repo, right next to your code
- Works offline, syncs when you push
- Fast, lightweight, and stays out of your way

🔧 **Git Integration**
- Automatic sync with git commits
- Branch-aware issue tracking
- Intelligent JSONL merge resolution

## Get Started with Beads

Try Beads in your own projects:

\`\`\`bash
# Install Beads
curl -sSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Initialize in your repo
bd init

# Create your first issue
bd create "Try out Beads"
\`\`\`

## Learn More

- **Documentation**: [github.com/steveyegge/beads/docs](https://github.com/steveyegge/beads/tree/main/docs)
- **Quick Start Guide**: Run \`bd quickstart\`
- **Examples**: [github.com/steveyegge/beads/examples](https://github.com/steveyegge/beads/tree/main/examples)

---

*Beads: Issue tracking that moves at the speed of thought* ⚡
`,title:"Beads - AI-Native Issue Tracking",filename:"README.md",path:".beads/README.md"},{text:`# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tosijs (formerly xinjs) is a lightweight (~10kB gzipped) path-based state management library for web applications. It uses proxy-based observers to eliminate binding boilerplate, similar to Redux but simpler. Works with vanilla JS/TS, web components, and integrates with React via react-tosijs.

**Key characteristics:**
- Zero runtime dependencies
- No JSX, transpilation, or virtual DOM required
- Direct DOM manipulation with native HTML and web standards
- Full TypeScript support with strict mode

## Commands

\`\`\`bash
bun start                   # Dev server with hot reload (https://localhost:8018)
bun test                    # Run all tests
bun test src/foo.test.ts    # Run specific test file
bun run format              # Lint and format code (ESLint --fix + Prettier)
bun run dev.ts --build      # Production build only (runs tests, then exits)
bun run free-port           # Kill process on port 8018
bun pack                    # Create local package tarball for testing
\`\`\`

**Note:** The dev server requires TLS certificates in \`tls/key.pem\` and \`tls/certificate.pem\`.

## Build System

The build system (\`dev.ts\`) uses Bun's bundler and outputs three formats:
- \`dist/index.js\` - IIFE for browser/script tags
- \`dist/module.js\` - ES Module
- \`dist/main.js\` - CommonJS

TypeScript declarations are generated via \`tsc --declaration\`. The build runs tests before bundling. Documentation is generated by \`docs.js\` from markdown files and inline \`/*#...#*/\` comments into \`demo/docs.json\`.

## Architecture

\`\`\`
State (xin) ─────────────────────────────────────────────
    │
    ├── tosi({ key: value })     # Register + get typed proxy (preferred)
    ├── xinProxy({ key: value }) # Alias for tosi()
    ├── observe(path, callback)  # React to state changes
    ├── touch(path)              # Force update notification
    └── bind(element, bindings)  # Connect DOM to state
            │
            ├── fromDOM: path    # Input -> state
            └── toDOM: path      # State -> output
\`\`\`

**Core modules:**
- \`xin.ts\` / \`xin-proxy.ts\` - State management with path-based observers; \`tosi()\` and \`xinProxy()\` are the main entry points
- \`by-path.ts\` - Path parsing and value access (e.g., \`'app.user.name'\`, \`'list[id=123]'\`)
- \`elements.ts\` - Element factory functions (\`div()\`, \`span()\`, etc.)
- \`bind.ts\` - Data binding connecting state to DOM
- \`list-binding.ts\` - Array/list bindings with virtual scrolling support
- \`component.ts\` - Base class for web components
- \`css.ts\` - CSS generation utilities (\`css()\`, \`vars\`, \`initVars()\`)

**Key types (in \`xin-types.ts\`):**
- \`BoxedProxy<T>\` - Type-safe proxy for state objects and arrays with:
  - \`.value\` / \`.path\` - Get underlying value and path string
  - \`.observe()\`, \`.bind()\`, \`.on()\`, \`.binding()\`, \`.listBinding()\` - Reactive bindings
  - \`.valueOf()\`, \`.toJSON()\` - Type coercion
  - Note: \`xinValue\`, \`xinPath\`, \`tosiValue\`, \`tosiPath\`, etc. are deprecated; use the above
- \`BoxedScalar<T>\` - Lightweight proxy for primitives (string/number/boolean); same API as \`BoxedProxy\`
- \`XinBinding<T>\` - Binding specification with \`toDOM\` and \`fromDOM\` functions
- \`Component\` - Abstract base class for web components

## Testing

Tests use Bun's test runner with Happy DOM for DOM environment (configured in \`bunfig.toml\` and \`happydom.ts\`). Test files follow the pattern \`*.test.ts\` in the \`src/\` directory.

## Code Style

- ESLint with TypeScript parser; \`any\` is allowed (\`@typescript-eslint/no-explicit-any: 0\`)
- Unused function arguments must be prefixed with \`_\` (via \`argsIgnorePattern\`)
- Prettier: single quotes, no semicolons, 2-space indent, trailing commas (ES5)

## Issue Tracking

This project uses **bd (beads)** for issue tracking. Run \`bd prime\` for full workflow context.

\`\`\`bash
bd ready                    # Find unblocked work
bd list --status=open       # All open issues
bd show <id>                # View issue details
bd create --title="..." --type=task|bug|feature --priority=2  # Create issue
bd update <id> --status=in_progress  # Claim work
bd close <id>               # Complete work
bd sync                     # Sync with git (run at session end)
\`\`\`

**Session end protocol:** Always run \`bd sync\` and \`git push\` before ending a session. See AGENTS.md for the full checklist.
`,title:"CLAUDE.md",filename:"CLAUDE.md",path:"CLAUDE.md"},{text:`Use 'bd' for task tracking

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until \`git push\` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   \`\`\`bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   \`\`\`
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until \`git push\` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
`,title:"Use 'bd' for task tracking",filename:"AGENTS.md",path:"AGENTS.md"},{text:'# Migrating from `xinjs` to `tosijs`\n\n<!--{ "pin": "bottom" }-->\n\nIn a nutshell:\n\n1. Update to `xinjs` (and `xinjs-ui`) 1.0.6\n2. Fix any issues\n3. Replace all references to "xinjs" with "tosijs"\n\n`xinjs` and `tosijs` 1.0.6 should be identical (likewise `xinjs-ui` and `tosijs-ui`), so the only thing you need to change\nshould be the module names.\n\n> Please [let me know](https://discord.gg/ramJ9rgky5) if there are any issues.\n',title:"Migrating from xinjs to tosijs",filename:"Migration.md",path:"Migration.md",pin:"bottom"},{text:`# todo

## work in progress

<!--{ "pin": "bottom" }-->

- change \`MutationObserver\` in Component if there's an \`onDomChanged\`
  or something handler to trigger it as appropriate
- automated golden tests?
- \`css()\` should handle multiple \`@import\`s
- possibly leverage component static property method (if we can keep type preservation)

## known issues

- bindList cloning doesn't duplicate svgs for some reason
`,title:"todo",filename:"TODO.md",path:"TODO.md",pin:"bottom"}];Gn("demo-style",Cs);var sn="tosijs";setTimeout(()=>{let n=f.fromVar(d.brandColor),t=f.fromVar(d.background);console.log(`welcome to %c${sn}`,`background: ${n.html}; color: ${t.html}; padding: 0 5px;`)},100);var Nl=document.location.search!==""?document.location.search.substring(1).split("&")[0]:"README.md",Vl=Yt.find((n)=>n.filename===Nl)||Yt[0],{app:B,prefs:D}=U({app:{title:sn,blogUrl:"https://loewald.com",discordUrl:"https://discord.com/invite/ramJ9rgky5",githubUrl:`https://github.com/tonioloewald/${sn}#readme`,npmUrl:`https://www.npmjs.com/package/${sn}`,tosijsuiUrl:"https://ui.tosijs.net",bundleBadgeUrl:`https://deno.bundlejs.com/?q=${sn}&badge=`,bundleUrl:`https://bundlejs.com/?q=${sn}`,cdnBadgeUrl:`https://data.jsdelivr.com/v1/package/npm/${sn}/badge`,cdnUrl:`https://www.jsdelivr.com/package/npm/${sn}`,optimizeLottie:!1,lottieFilename:"",lottieData:"",docs:Yt,currentDoc:Vl,compact:!1},prefs:{theme:"system",highContrast:!1,monochrome:!1,locale:""}});we((n)=>{if(n.startsWith("prefs"))return!0;return!1});$.docLink={toDOM(n,t){n.setAttribute("href",`?${t}`)}};$.current={toDOM(n,t){let e=n.getAttribute("href")||"";n.classList.toggle("current",t===e.substring(1))}};setTimeout(()=>{Object.assign(globalThis,{app:B,tosi:U,img:Gt,bindings:$,elements:m,vars:d,touch:bn,Color:f})},1000);var Ss=document.querySelector("main"),{h2:Wl,div:Ts,span:rt,a:Jt,img:Gt,header:Xl,button:Is,template:ql,input:Ul}=m;A(document.body,"prefs.theme",{toDOM(n,t){if(t==="system")t=getComputedStyle(document.body).getPropertyValue("--darkmode")==="true"?"dark":"light";n.classList.toggle("darkmode",t==="dark")}});A(document.body,D.highContrast,{toDOM(n,t){n.classList.toggle("high-contrast",t.valueOf())}});A(document.body,D.monochrome,{toDOM(n,t){n.classList.toggle("monochrome",t.valueOf())}});window.addEventListener("popstate",()=>{let n=window.location.search.substring(1);B.currentDoc=B.docs.find((t)=>t.filename===n)||B.docs[0]});var Fl=vt(()=>{console.time("filter");let n=Es.value.toLocaleLowerCase();B.docs.forEach((t)=>{t.hidden=!t.title.toLocaleLowerCase().includes(n)&&!t.text.toLocaleLowerCase().includes(n)}),bn(B.docs),console.timeEnd("filter")}),Es=Ul({slot:"nav",placeholder:"search",type:"search",style:{width:"calc(100% - 10px)",margin:"5px"},onInput:Fl});if(Ss)Ss.append(Xl(Is({class:"iconic",style:{color:d.linkColor},title:"navigation",bind:{value:B.compact,binding:{toDOM(n,t){n.style.display=t?"":"none",n.nextSibling.style.display=t?"":"none"}}},onClick(){let n=document.querySelector(Vn.tagName);n.contentVisible=!n.contentVisible}},y.menu()),rt({style:{flex:"0 0 10px"}}),Jt({href:"/",style:{display:"flex",alignItems:"center",borderBottom:"none"},title:`tosijs ${kt}, tosijs-ui ${Sa}`},Gt({src:"favicon.svg",style:{height:40,marginRight:10}}),Wl({bindText:"app.title"})),rt({class:"elastic"}),ka({minWidth:750},rt({style:{marginRight:d.spacing,display:"flex",alignItems:"center",gap:d.spacing50}},Jt({href:B.bundleUrl},Gt({alt:"bundlejs size badge",src:B.bundleBadgeUrl})),Jt({href:B.cdnUrl},Gt({alt:"jsdelivr",src:B.cdnBadgeUrl}))),rt({slot:"small"})),rt({style:{flex:"0 0 10px"}}),Is({title:"theme",class:"iconic",onClick(n){J({target:n.target.closest("button"),menuItems:[{icon:"github",caption:"github",action:B.githubUrl.value},{icon:"npm",caption:"npm",action:B.npmUrl.value},{icon:"discord",caption:"discord",action:B.discordUrl.value},{icon:"tosiUi",caption:"tosijs-ui",action:B.tosijsuiUrl.value},{icon:"blog",caption:"Blog",action:"https://loewald.com"},null,{icon:"rgb",caption:"Color Theme",menuItems:[{caption:"System",checked(){return D.theme.value==="system"},action(){D.theme.value="system"}},{caption:"Dark",checked(){return D.theme.value==="dark"},action(){D.theme.value="dark"}},{caption:"Light",checked(){return D.theme.value==="light"},action(){D.theme.value="light"}},null,{caption:"High Contrast",checked(){return D.highContrast.value},action(){D.highContrast.value=!D.highContrast.value}},{caption:"Monochrome",checked(){return D.monochrome.value},action(){D.monochrome.value=!D.monochrome.value}}]}]})}},y.moreVertical())),wa({name:"Documentation",navSize:200,minSize:600,style:{flex:"1 1 auto",overflow:"hidden"},onChange(){let n=document.querySelector(Vn.tagName);B.compact.value=n.compact}},Es,Ts({slot:"nav",style:{display:"flex",flexDirection:"column",width:"100%",height:"100%",overflowY:"scroll"},bindList:{hiddenProp:"hidden",value:B.docs}},ql(Jt({class:"doc-link",bindCurrent:"app.currentDoc.filename",bindDocLink:"^.filename",bindText:"^.title",onClick(n){let t=n.target.closest("a");if(!t)return;let e=yn(n.target),a=n.target.closest("xin-sidenav");a.contentVisible=!0;let{href:o}=t;window.history.pushState({href:o},"",o),B.currentDoc=e,n.preventDefault()}}))),Ts({style:{position:"relative",overflowY:"scroll",height:"100%"}},ua({style:{display:"block",maxWidth:"44em",margin:"auto",padding:"0 1em",overflow:"hidden"},bindValue:"app.currentDoc.text",didRender(){Nn.insertExamples(this,{tosijs:$n,"tosijs-ui":Ta})}}))));

//# debugId=C6646223CB966D6D64756E2164756E21
//# sourceMappingURL=index.js.map
