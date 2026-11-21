import{$ as e,$n as t,A as n,An as r,B as i,C as a,Cn as o,Ct as s,D as c,Dn as l,Dt as u,E as d,En as f,Et as p,F as m,Fn as h,G as g,Gn as _,H as v,I as y,In as b,J as x,Jn as S,K as C,Kn as w,L as T,Ln as E,M as D,Mn as O,Mt as k,N as A,Nt as j,O as M,Ot as N,P,Pn as F,Q as I,Qn as ee,R as te,S as ne,Sn as L,St as re,T as ie,Tn as ae,Tt as oe,U as se,V as ce,Vn as le,W as ue,X as de,Xn as fe,Y as pe,Yn as me,Z as he,Zn as ge,_ as _e,_n as R,_r as ve,_t as ye,a as be,ar as z,at as B,b as V,bn as xe,bt as H,c as U,cr as Se,ct as Ce,d as we,dr as Te,dt as Ee,er as De,et as Oe,f as W,fn as ke,fr as Ae,ft as je,g as Me,gr as Ne,gt as Pe,h as Fe,hn as Ie,ht as Le,i as Re,ir as ze,it as G,j as K,jn as Be,k as Ve,kn as He,kt as Ue,l as We,lt as Ge,m as Ke,mn as qe,mt as Je,n as Ye,nr as Xe,nt as Ze,o as q,or as Qe,ot as $e,p as et,pn as tt,pr as nt,pt as rt,q as it,qn as J,r as at,rr as ot,rt as st,s as ct,sr as lt,st as ut,tr as dt,tt as ft,un as pt,ur as mt,ut as ht,v as gt,vr as _t,vt,w as yt,wt as bt,x as xt,xn as St,xt as Ct,y as wt,yr as Tt,yt as Et,zn as Dt}from"./three.core-YvqyuUxa.js";var Ot=.499,kt=.002,At=1.7,jt=256,Mt=128,Nt=8,Pt=8,Ft=2,It=[0,1,1,0],Lt=[0,0,1,1],Rt=[1,0,3,2],zt=[3,2,1,0],Bt=32,Vt=class{width;height;f;net;flat;shade;relief;ground;constructor(e,t){this.relief=e,this.ground=t,this.width=e.width,this.height=e.height;let n=this.width*this.height;this.f=new Float64Array(n*4),this.net=new Float64Array(n*16),this.flat=new Uint8Array(n),this.shade=new Float64Array(n*8);let r=new Kt(e,t,null);r.start(null),r.solve(jt),r.write(this.f),Ht(r,this.f,this.width,this.height,this.net,this.flat,this.shade)}refit(e,t,n,r){return this.refitting(e,t,n,r).finish()}refitting(e,t,n,r){let i=Pt,a=Math.max(0,e-i),o=Math.max(0,t-i),s=Math.min(this.width,n+i)-a,c=Math.min(this.height,r+i)-o,l=Array(s*c*4),u=new Float64Array(s*c*4);for(let e=0;e<c;e++)for(let t=0;t<s;t++)for(let n=0;n<4;n++){let r=((e+o)*this.width+t+a)*4+n,i=(e*s+t)*4+n;l[i]=this.relief.corner[r],u[i]=this.f[r]}let d=new Kt({width:s,height:c,corner:l},{water:(e,t)=>this.ground.water(e+a,t+o),worked:(e,t)=>this.ground.worked(e+a,t+o)},(i,s)=>i+a>e&&s+o>t&&i+a<n-1&&s+o<r-1);d.start(u);let f=d.system(),p=0,m=(e=1/0)=>{for(;p<Mt;){let t=Math.min(Nt,Mt-p);if(f(t),p+=t,e!==1/0&&performance.now()>=e)break}return p>=Mt};return{sweep:m,finish:()=>(m(),this.settle(d,u,e,t,n,r,a,o,s,c))}}settle(e,t,n,r,i,a,o,s,c,l){e.write(t);let u=(e,t)=>e+o>=n&&t+s>=r&&e+o<i&&t+s<a,d=new Float64Array(c*l*16),f=new Uint8Array(c*l),p=new Float64Array(c*l*8);Ht(e,t,c,l,d,f,p);let m=[];for(let e=0;e<l;e++)for(let l=0;l<c;l++){if(!u(l,e))continue;let h=(e+s)*this.width+l+o,g=e*c+l;for(let e=0;e<4;e++)this.f[h*4+e]=t[g*4+e];let _=this.flat[h]!==f[g];for(let e=0;e<16;e++)_||=Math.abs(this.net[h*16+e]-d[g*16+e])>1e-4,this.net[h*16+e]=d[g*16+e];for(let t=0;t<8;t++){let c=l+o+It[t>>1],u=e+s+Lt[t>>1];c!==n&&c!==i&&u!==r&&u!==a&&(_||=Math.abs(this.shade[h*8+t]-p[g*8+t])>.001,this.shade[h*8+t]=p[g*8+t])}this.flat[h]=f[g],_&&m.push(h)}return m}cornerAt(e,t,n){return this.f[(t*this.width+e)*4+n]}on(e,t,n,r){let i=this.net,a=(t*this.width+e)*16;if(this.flat[t*this.width+e])return i[a];let o=Wt(n),s=Wt(r),c=0;for(let e=0;e<4;e++)c+=s[e]*(o[0]*i[a+e*4]+o[1]*i[a+e*4+1]+o[2]*i[a+e*4+2]+o[3]*i[a+e*4+3]);return c}slope(e,t,n,r){let i=this.net,a=(t*this.width+e)*16;if(this.flat[t*this.width+e])return[0,0];let o=Wt(n),s=Wt(r),c=Gt(n),l=Gt(r),u=0,d=0;for(let e=0;e<4;e++)for(let t=0;t<4;t++){let n=i[a+e*4+t];u+=c[t]*s[e]*n,d+=o[t]*l[e]*n}return[u,d]}shadeAt(e,t,n,r){let i=this.shade,a=(t*this.width+e)*8,o=[(1-n)*(1-r),n*(1-r),n*r,(1-n)*r];return[o[0]*i[a]+o[1]*i[a+2]+o[2]*i[a+4]+o[3]*i[a+6],o[0]*i[a+1]+o[1]*i[a+3]+o[2]*i[a+5]+o[3]*i[a+7]]}bend(e,t){if(this.flat[t*this.width+e])return 0;let n=this.net,r=(t*this.width+e)*16,i=0,a=0,o=0;for(let e=0;e<4;e++)for(let t=0;t<4;t++){let s=n[r+e*4+t];t<2&&(i=Math.max(i,Math.abs(s-2*n[r+e*4+t+1]+n[r+e*4+t+2]))),e<2&&(a=Math.max(a,Math.abs(s-2*n[r+(e+1)*4+t]+n[r+(e+2)*4+t]))),t<3&&e<3&&(o=Math.max(o,Math.abs(s-n[r+e*4+t+1]-n[r+(e+1)*4+t]+n[r+(e+1)*4+t+1])))}return(6*i+6*a+18*o)/8}at(e,t){let n=Math.min(this.width-1,Math.max(0,Math.floor(e))),r=Math.min(this.height-1,Math.max(0,Math.floor(t)));return this.on(n,r,Math.min(1,Math.max(0,e-n)),Math.min(1,Math.max(0,t-r)))}};function Ht(e,t,n,r,i,a,o){let s=e.count,c=new Float64Array(s),l=new Float64Array(s);for(let n=0;n<s;n++)for(let[r,i,a,o]of[[0,Rt,It,c],[2,zt,Lt,l]]){if(e.next[n*4+r]<0||e.next[n*4+r+1]<0)continue;let s=NaN;for(let r=e.first[n];r<e.first[n+1];r++){let n=e.list[r],o=(t[(n&-4)+i[n&3]]-t[n])*(a[n&3]===0?1:-1);s=Number.isNaN(s)?o:Ut(s,o)}o[n]=s}for(let o=0;o<n*r;o++){let n=o*4,r=i,s=o*16;for(let i=0;i<4;i++){let a=e.of[n+i],o=It[i]*3,u=Lt[i]*3,d=It[i]?-1:1,f=Lt[i]?-1:1,p=t[n+i],m=d*c[a]/3,h=f*l[a]/3;r[s+u*4+o]=p,r[s+u*4+o+d]=p+m,r[s+(u+f)*4+o]=p+h,r[s+(u+f)*4+o+d]=p+m+h}let u=1;for(let e=1;e<16;e++)if(r[s+e]!==r[s]){u=0;break}a[o]=u}let u=c,d=l,f=[];for(let t=0;t<Ft;t++){let t=new Float64Array(s),n=new Float64Array(s);for(let r=0;r<s;r++){if(e.pinned[r])continue;let i=2*u[r],a=2*d[r],o=2;e.around(r,f);for(let e of f)i+=u[e],a+=d[e],o++;t[r]=i/o,n[r]=a/o}u=t,d=n}for(let n=0;n<t.length;n++){let t=e.of[n];o[n*2]=u[t],o[n*2+1]=d[t]}}var Ut=(e,t)=>e>0&&t>0?Math.min(e,t):e<0&&t<0?Math.max(e,t):0,Wt=e=>{let t=1-e;return[t*t*t,3*e*t*t,3*e*e*t,e*e*e]},Gt=e=>{let t=1-e;return[-3*t*t,3*t*t-6*e*t,6*e*t-3*e*e,3*e*e]},Kt=class{of;first;list;count;next;q;lo;hi;h;pinned;free;constructor(e,t,n){let r=e.width,i=e.height,a=e.corner,o=r*i*4,s=Int32Array.from({length:o},(e,t)=>t),c=e=>{for(;s[e]!==e;)s[e]=s[s[e]],e=s[e];return e},l=(e,t)=>{e=c(e),t=c(t),e!==t&&(s[Math.max(e,t)]=Math.min(e,t))};for(let e=0;e<i;e++)for(let t=0;t<r;t++){let n=(e*r+t)*4;t+1<r&&a[n+1]===a[n+4]&&a[n+2]===a[n+7]&&(l(n+1,n+4),l(n+2,n+7)),e+1<i&&a[n+3]===a[n+r*4]&&a[n+2]===a[n+r*4+1]&&(l(n+3,n+r*4),l(n+2,n+r*4+1))}this.of=new Int32Array(o);let u=new Int32Array(o).fill(-1),d=0;for(let e=0;e<o;e++){let t=c(e);u[t]<0&&(u[t]=d++),this.of[e]=u[t]}this.count=d,this.first=new Int32Array(d+1);for(let e=0;e<o;e++)this.first[this.of[e]+1]++;for(let e=0;e<d;e++)this.first[e+1]+=this.first[e];this.list=new Int32Array(o);let f=this.first.slice(0,d);for(let e=0;e<o;e++)this.list[f[this.of[e]]++]=e;this.next=new Int32Array(d*4).fill(-1),this.q=new Float64Array(d),this.lo=new Float64Array(d),this.hi=new Float64Array(d),this.h=new Float64Array(d),this.pinned=new Uint8Array(d);let p=new Uint8Array(d).fill(1),m=[];for(let e=0;e<d;e++){for(let i=this.first[e];i<this.first[e+1];i++){let a=this.list[i],o=a>>2,s=a&3,c=o%r,l=(o-c)/r;(t.water(c,l)||t.worked(c,l))&&(this.pinned[e]=1),n&&!n(c,l)&&(p[e]=0),this.link(e,It[s]===0?0:1,this.of[(a&-4)+Rt[s]]),this.link(e,Lt[s]===0?2:3,this.of[(a&-4)+zt[s]])}let i=a[this.list[this.first[e]]];this.q[e]=i,this.lo[e]=this.pinned[e]?i:Math.min(i,Math.max(0,i-Ot)),this.hi[e]=this.pinned[e]?i:i+Ot,p[e]&&!this.pinned[e]&&m.push(e)}this.free=Int32Array.from(m)}link(e,t,n){let r=e*4+t,i=this.next[r];this.next[r]=i===-1||i===n?n:-2}around(e,t){t.length=0;for(let n=this.first[e];n<this.first[e+1];n++){let e=this.list[n],r=this.of[(e&-4)+Rt[e&3]],i=this.of[(e&-4)+zt[e&3]];t.includes(r)||t.push(r),t.includes(i)||t.push(i)}}start(e){for(let t=0;t<this.count;t++){let n=this.q[t];if(e){let r=0;for(let n=this.first[t];n<this.first[t+1];n++)r+=e[this.list[n]];n=r/(this.first[t+1]-this.first[t])}this.h[t]=Math.min(this.hi[t],Math.max(this.lo[t],n))}}write(e){for(let t=0;t<e.length;t++)e[t]=this.h[this.of[t]]}solve(e){this.system()(e)}system(){let e=this.free,t=new Int32Array(this.count).fill(-1);e.forEach((e,n)=>{t[e]=n});let n=new Int32Array(e.length*Bt),r=new Float64Array(e.length*Bt),i=new Uint8Array(e.length),a=(e,t,a)=>{let o=e*Bt;for(let s=0;s<i[e];s++)if(n[o+s]===t){r[o+s]+=a;return}if(i[e]===Bt)throw Error(`Surface: a fan touches too many others`);n[o+i[e]]=t,r[o+i[e]++]=a},o=(e,n,r)=>{for(let i=0;i<e.length;i++){let o=t[e[i]];if(o>=0)for(let t=0;t<e.length;t++)a(o,e[t],r*n[i]*n[t])}};for(let t=0;t<e.length;t++)a(t,e[t],kt);for(let e=0;e<this.count;e++)for(let n of[0,2]){let r=this.next[e*4+n],i=this.next[e*4+n+1];r>=0&&i>=0&&(t[e]>=0||t[r]>=0||t[i]>=0)&&o([i,e,r],[1,-2,1],1)}for(let e=0;e<this.of.length;e+=4){let n=[this.of[e],this.of[e+1],this.of[e+2],this.of[e+3]];n.some(e=>t[e]>=0)&&o(n,[1,-1,1,-1],2)}let s=new Int32Array(e.length+1),c=new Float64Array(e.length);for(let t=0;t<e.length;t++)s[t+1]=s[t]+i[t]-1;let l=new Int32Array(s[e.length]),u=new Float64Array(s[e.length]);for(let t=0,a=0;t<e.length;t++)for(let o=0;o<i[t];o++){let i=n[t*Bt+o],s=r[t*Bt+o];i===e[t]?c[t]=s:(l[a]=i,u[a++]=s)}let d=this.h,f=this.q,p=new Float64Array(e.length),m=new Float64Array(e.length),h=new Float64Array(e.length);for(let t=0;t<e.length;t++)p[t]=this.lo[e[t]],m[t]=this.hi[e[t]],h[t]=f[e[t]];return t=>{for(let n=0;n<t;n++)for(let t=0;t<e.length;t++){let n=e[t],r=d[n],i=kt*(r-h[t]);for(let e=s[t];e<s[t+1];e++)i+=u[e]*(d[l[e]]-r);let a=r-At*i/c[t];d[n]=a<p[t]?p[t]:a>m[t]?m[t]:a}}}},qt={grass:0,bare:1,track:2,rock:3,woods:4,water:5},Jt={loam:0,silt:1,clay:2,sand:3,stony:4};function Yt(e){let t=e.width*e.height;if(!(e.width>0&&e.height>0&&e.tile>0&&e.level>0))throw Error(`setLand: a land ${e.width} x ${e.height}, tile ${e.tile}, level ${e.level}`);Zt(`setLand`,t,e);let n=e.map;if(n.x<0||n.y<0||n.width<0||n.height<0||n.x+n.width>e.width||n.y+n.height>e.height)throw Error(`setLand: the map is not inside the land`);let r=e.beyond;if(r&&(r.nx<2||r.nz<2||r.cell<=0||r.height.length!==r.nx*r.nz))throw Error(`setLand: beyond's grid ${r.nx} x ${r.nz} has ${r.height.length} heights`)}function Xt(e,t,n){if(t.x<0||t.y<0||t.width<=0||t.height<=0||t.x+t.width>e.width||t.y+t.height>e.height)throw Error(`updateLand: the rectangle is not inside the land`);Zt(`updateLand`,t.width*t.height,{...n,level:e.level})}function Zt(e,t,n){let r=[[`corners`,n.corners,4*t],[`worked`,n.worked,t],[`cover`,n.cover,t],[`ground`,n.ground,t]];for(let[t,n,i]of r)if(n&&n.length!==i)throw Error(`${e}: ${t} has ${n.length} values for ${i}`);if(n.corners)for(let t of n.corners){let r=t/n.level;if(Math.abs(r-Math.round(r))>1e-4)throw Error(`${e}: a corner at ${t} m is not a whole number of ${n.level} m levels`)}}function Qt(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function $t(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Y={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},X={common:{diffuse:{value:new W(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new B},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new B}},envmap:{envMap:{value:null},envMapRotation:{value:new B},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new B}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new B}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new B},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new B},normalScale:{value:new _(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new B},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new B}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new B}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new B}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new W(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new W(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0},uvTransform:{value:new B}},sprite:{diffuse:{value:new W(16777215)},opacity:{value:1},center:{value:new _(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new B},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0}}},en={basic:{uniforms:Qe([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.fog]),vertexShader:Y.meshbasic_vert,fragmentShader:Y.meshbasic_frag},lambert:{uniforms:Qe([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new W(0)}}]),vertexShader:Y.meshlambert_vert,fragmentShader:Y.meshlambert_frag},phong:{uniforms:Qe([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new W(0)},specular:{value:new W(1118481)},shininess:{value:30}}]),vertexShader:Y.meshphong_vert,fragmentShader:Y.meshphong_frag},standard:{uniforms:Qe([X.common,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.roughnessmap,X.metalnessmap,X.fog,X.lights,{emissive:{value:new W(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag},toon:{uniforms:Qe([X.common,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.gradientmap,X.fog,X.lights,{emissive:{value:new W(0)}}]),vertexShader:Y.meshtoon_vert,fragmentShader:Y.meshtoon_frag},matcap:{uniforms:Qe([X.common,X.bumpmap,X.normalmap,X.displacementmap,X.fog,{matcap:{value:null}}]),vertexShader:Y.meshmatcap_vert,fragmentShader:Y.meshmatcap_frag},points:{uniforms:Qe([X.points,X.fog]),vertexShader:Y.points_vert,fragmentShader:Y.points_frag},dashed:{uniforms:Qe([X.common,X.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Y.linedashed_vert,fragmentShader:Y.linedashed_frag},depth:{uniforms:Qe([X.common,X.displacementmap]),vertexShader:Y.depth_vert,fragmentShader:Y.depth_frag},normal:{uniforms:Qe([X.common,X.bumpmap,X.normalmap,X.displacementmap,{opacity:{value:1}}]),vertexShader:Y.meshnormal_vert,fragmentShader:Y.meshnormal_frag},sprite:{uniforms:Qe([X.sprite,X.fog]),vertexShader:Y.sprite_vert,fragmentShader:Y.sprite_frag},background:{uniforms:{uvTransform:{value:new B},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Y.background_vert,fragmentShader:Y.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new B}},vertexShader:Y.backgroundCube_vert,fragmentShader:Y.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Y.cube_vert,fragmentShader:Y.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Y.equirect_vert,fragmentShader:Y.equirect_frag},distanceRGBA:{uniforms:Qe([X.common,X.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Y.distanceRGBA_vert,fragmentShader:Y.distanceRGBA_frag},shadow:{uniforms:Qe([X.lights,X.fog,{color:{value:new W(0)},opacity:{value:1}}]),vertexShader:Y.shadow_vert,fragmentShader:Y.shadow_frag}};en.physical={uniforms:Qe([en.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new B},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new B},clearcoatNormalScale:{value:new _(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new B},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new B},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new B},sheen:{value:0},sheenColor:{value:new W(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new B},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new B},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new B},transmissionSamplerSize:{value:new _},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new B},attenuationDistance:{value:0},attenuationColor:{value:new W(0)},specularColor:{value:new W(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new B},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new B},anisotropyVector:{value:new _},anisotropyMap:{value:null},anisotropyMapTransform:{value:new B}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag};var tn={r:0,b:0,g:0},nn=new yt,rn=new $e;function an(e,t,n,r,i,a,s){let c=new W(0),l=a===!0?0:1,u,d,f=null,p=0,m=null;function h(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function g(t){let n=!1,i=h(t);i===null?v(c,l):i&&i.isColor&&(v(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,s):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,s),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function _(t,n){let r=h(n);r&&(r.isCubeTexture||r.mapping===306)?(d===void 0&&(d=new ut(new ct(1,1,1),new o({name:`BackgroundCubeMaterial`,uniforms:dt(en.backgroundCube.uniforms),vertexShader:en.backgroundCube.vertexShader,fragmentShader:en.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute(`normal`),d.geometry.deleteAttribute(`uv`),d.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(d)),nn.copy(n.backgroundRotation),nn.x*=-1,nn.y*=-1,nn.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(nn.y*=-1,nn.z*=-1),d.material.uniforms.envMap.value=r,d.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(rn.makeRotationFromEuler(nn)),d.material.toneMapped=et.getTransfer(r.colorSpace)!==St,(f!==r||p!==r.version||m!==e.toneMapping)&&(d.material.needsUpdate=!0,f=r,p=r.version,m=e.toneMapping),d.layers.enableAll(),t.unshift(d,d.geometry,d.material,0,0,null)):r&&r.isTexture&&(u===void 0&&(u=new ut(new re(2,2),new o({name:`BackgroundMaterial`,uniforms:dt(en.background.uniforms),vertexShader:en.background.vertexShader,fragmentShader:en.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(u)),u.material.uniforms.t2D.value=r,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.toneMapped=et.getTransfer(r.colorSpace)!==St,r.matrixAutoUpdate===!0&&r.updateMatrix(),u.material.uniforms.uvTransform.value.copy(r.matrix),(f!==r||p!==r.version||m!==e.toneMapping)&&(u.material.needsUpdate=!0,f=r,p=r.version,m=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null))}function v(t,n){t.getRGB(tn,z(e)),r.buffers.color.setClear(tn.r,tn.g,tn.b,n,s)}function y(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0)}return{getClearColor:function(){return c},setClearColor:function(e,t=1){c.set(e),l=t,v(c,l)},getClearAlpha:function(){return l},setClearAlpha:function(e){l=e,v(c,l)},render:g,addToRenderList:_,dispose:y}}function on(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function sn(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function cn(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function ln(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Ct,s=new B,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function un(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new ge(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var dn=4,fn=[.125,.215,.35,.446,.526,.582],pn=20,mn=new Et,hn=new W,gn=null,_n=0,vn=0,yn=!1,bn=(1+Math.sqrt(5))/2,xn=1/bn,Sn=[new w(-bn,xn,0),new w(bn,xn,0),new w(-xn,0,bn),new w(xn,0,bn),new w(0,bn,-xn),new w(0,bn,xn),new w(-1,1,-1),new w(1,1,-1),new w(-1,1,1),new w(1,1,1)],Cn=new w,wn=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Cn}=i;gn=this._renderer.getRenderTarget(),_n=this._renderer.getActiveCubeFace(),vn=this._renderer.getActiveMipmapLevel(),yn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=An(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=kn(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(gn,_n,vn),this._renderer.xr.enabled=yn,e.scissorTest=!1,Dn(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),gn=this._renderer.getRenderTarget(),_n=this._renderer.getActiveCubeFace(),vn=this._renderer.getActiveMipmapLevel(),yn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,r={magFilter:de,minFilter:de,generateMipmaps:!1,type:A,format:j,colorSpace:e,depthBuffer:!1},i=En(t,n,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=En(t,n,r);let{_lodMax:e}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Tn(e)),this._blurMaterial=On(e,t,n)}return i}_compileMaterial(e){let t=new ut(this._lodPlanes[0],e);this._renderer.compile(t,mn)}_sceneToCubeUV(e,t,n,r,i){let a=new H(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(hn),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new Ce({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new ut(new ct,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(hn),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Dn(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=An()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=kn());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new ut(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Dn(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,mn)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=Sn[(r-t-1)%Sn.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new ut(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):pn;m>pn&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${pn}`);let h=[],g=0;for(let e=0;e<pn;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Dn(t,3*v*(r>_-dn?r-_+dn:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,mn)}};function Tn(e){let t=[],n=[],r=[],i=e,a=e-dn+1+fn.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-dn?s=fn[o-e+dn-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new We;h.setAttribute(`position`,new U(f,3)),h.setAttribute(`uv`,new U(p,2)),h.setAttribute(`faceIndex`,new U(m,1)),t.push(h),i>dn&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function En(e,t,n){let r=new ee(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Dn(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function On(e,t,n){let r=new Float32Array(pn),i=new w(0,1,0);return new o({name:`SphericalGaussianBlur`,defines:{n:pn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:jn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function kn(){return new o({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:jn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function An(){return new o({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:jn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function jn(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Mn(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new wn(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new wn(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function Nn(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Se(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function Pn(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(De(n)?h:F)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Fn(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function In(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Ln(e,t,n){let r=new WeakMap,i=new J;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new _e(h,p,m,u);g.type=Ve,g.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new _(p,m)},r.set(o,d);function y(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Rn(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var zn=new Be,Bn=new xt(1,1),Vn=new _e,Hn=new Me,Un=new Ke,Wn=[],Gn=[],Kn=new Float32Array(16),qn=new Float32Array(9),Jn=new Float32Array(4);function Yn(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Wn[i];if(a===void 0&&(a=new Float32Array(i),Wn[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Xn(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Zn(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Qn(e,t){let n=Gn[t];n===void 0&&(n=new Int32Array(t),Gn[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function $n(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function er(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xn(n,t))return;e.uniform2fv(this.addr,t),Zn(n,t)}}function tr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Xn(n,t))return;e.uniform3fv(this.addr,t),Zn(n,t)}}function nr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xn(n,t))return;e.uniform4fv(this.addr,t),Zn(n,t)}}function rr(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Xn(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Zn(n,t)}else{if(Xn(n,r))return;Jn.set(r),e.uniformMatrix2fv(this.addr,!1,Jn),Zn(n,r)}}function ir(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Xn(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Zn(n,t)}else{if(Xn(n,r))return;qn.set(r),e.uniformMatrix3fv(this.addr,!1,qn),Zn(n,r)}}function ar(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Xn(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Zn(n,t)}else{if(Xn(n,r))return;Kn.set(r),e.uniformMatrix4fv(this.addr,!1,Kn),Zn(n,r)}}function or(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function sr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xn(n,t))return;e.uniform2iv(this.addr,t),Zn(n,t)}}function cr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Xn(n,t))return;e.uniform3iv(this.addr,t),Zn(n,t)}}function lr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xn(n,t))return;e.uniform4iv(this.addr,t),Zn(n,t)}}function ur(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function dr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xn(n,t))return;e.uniform2uiv(this.addr,t),Zn(n,t)}}function fr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Xn(n,t))return;e.uniform3uiv(this.addr,t),Zn(n,t)}}function pr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xn(n,t))return;e.uniform4uiv(this.addr,t),Zn(n,t)}}function mr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Bn.compareFunction=515,a=Bn):a=zn,n.setTexture2D(t||a,i)}function hr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Hn,i)}function gr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Un,i)}function _r(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Vn,i)}function vr(e){switch(e){case 5126:return $n;case 35664:return er;case 35665:return tr;case 35666:return nr;case 35674:return rr;case 35675:return ir;case 35676:return ar;case 5124:case 35670:return or;case 35667:case 35671:return sr;case 35668:case 35672:return cr;case 35669:case 35673:return lr;case 5125:return ur;case 36294:return dr;case 36295:return fr;case 36296:return pr;case 35678:case 36198:case 36298:case 36306:case 35682:return mr;case 35679:case 36299:case 36307:return hr;case 35680:case 36300:case 36308:case 36293:return gr;case 36289:case 36303:case 36311:case 36292:return _r}}function yr(e,t){e.uniform1fv(this.addr,t)}function br(e,t){let n=Yn(t,this.size,2);e.uniform2fv(this.addr,n)}function xr(e,t){let n=Yn(t,this.size,3);e.uniform3fv(this.addr,n)}function Sr(e,t){let n=Yn(t,this.size,4);e.uniform4fv(this.addr,n)}function Cr(e,t){let n=Yn(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function wr(e,t){let n=Yn(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Tr(e,t){let n=Yn(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Er(e,t){e.uniform1iv(this.addr,t)}function Dr(e,t){e.uniform2iv(this.addr,t)}function Or(e,t){e.uniform3iv(this.addr,t)}function kr(e,t){e.uniform4iv(this.addr,t)}function Ar(e,t){e.uniform1uiv(this.addr,t)}function jr(e,t){e.uniform2uiv(this.addr,t)}function Mr(e,t){e.uniform3uiv(this.addr,t)}function Nr(e,t){e.uniform4uiv(this.addr,t)}function Pr(e,t,n){let r=this.cache,i=t.length,a=Qn(n,i);Xn(r,a)||(e.uniform1iv(this.addr,a),Zn(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||zn,a[e])}function Fr(e,t,n){let r=this.cache,i=t.length,a=Qn(n,i);Xn(r,a)||(e.uniform1iv(this.addr,a),Zn(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Hn,a[e])}function Ir(e,t,n){let r=this.cache,i=t.length,a=Qn(n,i);Xn(r,a)||(e.uniform1iv(this.addr,a),Zn(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Un,a[e])}function Lr(e,t,n){let r=this.cache,i=t.length,a=Qn(n,i);Xn(r,a)||(e.uniform1iv(this.addr,a),Zn(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Vn,a[e])}function Rr(e){switch(e){case 5126:return yr;case 35664:return br;case 35665:return xr;case 35666:return Sr;case 35674:return Cr;case 35675:return wr;case 35676:return Tr;case 5124:case 35670:return Er;case 35667:case 35671:return Dr;case 35668:case 35672:return Or;case 35669:case 35673:return kr;case 5125:return Ar;case 36294:return jr;case 36295:return Mr;case 36296:return Nr;case 35678:case 36198:case 36298:case 36306:case 35682:return Pr;case 35679:case 36299:case 36307:return Fr;case 35680:case 36300:case 36308:case 36293:return Ir;case 36289:case 36303:case 36311:case 36292:return Lr}}var zr=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=vr(t.type)}},Br=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Rr(t.type)}},Vr=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Hr=/(\w+)(\])?(\[|\.)?/g;function Ur(e,t){e.seq.push(t),e.map[t.id]=t}function Wr(e,t,n){let r=e.name,i=r.length;for(Hr.lastIndex=0;;){let a=Hr.exec(r),o=Hr.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Ur(n,l===void 0?new zr(s,e,t):new Br(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Vr(s),Ur(n,e)),n=e}}}var Gr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Wr(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Kr(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var qr=37297,Jr=0;function Yr(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Xr=new B;function Zr(e){et._getMatrix(Xr,et.workingColorSpace,e);let t=`mat3( ${Xr.elements.map(e=>e.toFixed(4))} )`;switch(et.getTransfer(e)){case Oe:return[t,`LinearTransferOETF`];case St:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Qr(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Yr(e.getShaderSource(t),r)}return i}function $r(e,t){let n=Zr(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function ei(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var ti=new w;function ni(){return et.getLuminanceCoefficients(ti),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${ti.x.toFixed(4)}, ${ti.y.toFixed(4)}, ${ti.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function ri(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(oi).join(`
`)}function ii(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function ai(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function oi(e){return e!==``}function si(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ci(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var li=/^[ \t]*#include +<([\w\d./]+)>/gm;function ui(e){return e.replace(li,fi)}var di=new Map;function fi(e,t){let n=Y[t];if(n===void 0){let e=di.get(t);if(e!==void 0)n=Y[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return ui(n)}var pi=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function mi(e){return e.replace(pi,hi)}function hi(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function gi(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function _i(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function vi(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function yi(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function bi(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function xi(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Si(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=_i(n),l=vi(n),u=yi(n),d=bi(n),f=xi(n),p=ri(n),m=ii(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(oi).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(oi).join(`
`),_.length>0&&(_+=`
`)):(g=[gi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(oi).join(`
`),_=[gi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Y.tonemapping_pars_fragment,n.toneMapping===0?``:ei(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Y.colorspace_pars_fragment,$r(`linearToOutputTexel`,n.outputColorSpace),ni(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(oi).join(`
`)),o=ui(o),o=si(o,n),o=ci(o,n),s=ui(s),s=si(s,n),s=ci(s,n),o=mi(o),s=mi(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Kr(i,i.VERTEX_SHADER,y),S=Kr(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Qr(i,x,`vertex`),n=Qr(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Gr(i,h),T=ai(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,qr)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Jr++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Ci=0,wi=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Ti(e),t.set(e,n)),n}},Ti=class{constructor(e){this.id=Ci++,this.code=e,this.usedTimes=0}};function Ei(t,n,r,i,a,o,s){let c=new g,l=new wi,u=new Set,d=[],f=a.logarithmicDepthBuffer,p=a.vertexTextures,m=a.precision,h={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function _(e){return u.add(e),e===0?`uv`:`uv${e}`}function v(o,c,d,g,v){let y=g.fog,b=v.geometry,x=o.isMeshStandardMaterial?g.environment:null,S=(o.isMeshStandardMaterial?r:n).get(o.envMap||x),C=S&&S.mapping===306?S.image.height:null,w=h[o.type];o.precision!==null&&(m=a.getMaxPrecision(o.precision),m!==o.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,o.precision,`not supported, using`,m,`instead.`));let T=b.morphAttributes.position||b.morphAttributes.normal||b.morphAttributes.color,E=T===void 0?0:T.length,D=0;b.morphAttributes.position!==void 0&&(D=1),b.morphAttributes.normal!==void 0&&(D=2),b.morphAttributes.color!==void 0&&(D=3);let O,k,A,j;if(w){let e=en[w];O=e.vertexShader,k=e.fragmentShader}else O=o.vertexShader,k=o.fragmentShader,l.update(o),A=l.getVertexShaderID(o),j=l.getFragmentShaderID(o);let M=t.getRenderTarget(),N=t.state.buffers.depth.getReversed(),P=v.isInstancedMesh===!0,F=v.isBatchedMesh===!0,I=!!o.map,ee=!!o.matcap,te=!!S,ne=!!o.aoMap,L=!!o.lightMap,re=!!o.bumpMap,ie=!!o.normalMap,ae=!!o.displacementMap,oe=!!o.emissiveMap,se=!!o.metalnessMap,ce=!!o.roughnessMap,le=o.anisotropy>0,ue=o.clearcoat>0,de=o.dispersion>0,fe=o.iridescence>0,pe=o.sheen>0,me=o.transmission>0,he=le&&!!o.anisotropyMap,ge=ue&&!!o.clearcoatMap,_e=ue&&!!o.clearcoatNormalMap,R=ue&&!!o.clearcoatRoughnessMap,ve=fe&&!!o.iridescenceMap,ye=fe&&!!o.iridescenceThicknessMap,be=pe&&!!o.sheenColorMap,z=pe&&!!o.sheenRoughnessMap,B=!!o.specularMap,V=!!o.specularColorMap,xe=!!o.specularIntensityMap,H=me&&!!o.transmissionMap,U=me&&!!o.thicknessMap,Se=!!o.gradientMap,Ce=!!o.alphaMap,we=o.alphaTest>0,Te=!!o.alphaHash,Ee=!!o.extensions,De=0;o.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(De=t.toneMapping);let Oe={shaderID:w,shaderType:o.type,shaderName:o.name,vertexShader:O,fragmentShader:k,defines:o.defines,customVertexShaderID:A,customFragmentShaderID:j,isRawShaderMaterial:o.isRawShaderMaterial===!0,glslVersion:o.glslVersion,precision:m,batching:F,batchingColor:F&&v._colorsTexture!==null,instancing:P,instancingColor:P&&v.instanceColor!==null,instancingMorph:P&&v.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:M===null?t.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:e,alphaToCoverage:!!o.alphaToCoverage,map:I,matcap:ee,envMap:te,envMapMode:te&&S.mapping,envMapCubeUVHeight:C,aoMap:ne,lightMap:L,bumpMap:re,normalMap:ie,displacementMap:p&&ae,emissiveMap:oe,normalMapObjectSpace:ie&&o.normalMapType===1,normalMapTangentSpace:ie&&o.normalMapType===0,metalnessMap:se,roughnessMap:ce,anisotropy:le,anisotropyMap:he,clearcoat:ue,clearcoatMap:ge,clearcoatNormalMap:_e,clearcoatRoughnessMap:R,dispersion:de,iridescence:fe,iridescenceMap:ve,iridescenceThicknessMap:ye,sheen:pe,sheenColorMap:be,sheenRoughnessMap:z,specularMap:B,specularColorMap:V,specularIntensityMap:xe,transmission:me,transmissionMap:H,thicknessMap:U,gradientMap:Se,opaque:o.transparent===!1&&o.blending===1&&o.alphaToCoverage===!1,alphaMap:Ce,alphaTest:we,alphaHash:Te,combine:o.combine,mapUv:I&&_(o.map.channel),aoMapUv:ne&&_(o.aoMap.channel),lightMapUv:L&&_(o.lightMap.channel),bumpMapUv:re&&_(o.bumpMap.channel),normalMapUv:ie&&_(o.normalMap.channel),displacementMapUv:ae&&_(o.displacementMap.channel),emissiveMapUv:oe&&_(o.emissiveMap.channel),metalnessMapUv:se&&_(o.metalnessMap.channel),roughnessMapUv:ce&&_(o.roughnessMap.channel),anisotropyMapUv:he&&_(o.anisotropyMap.channel),clearcoatMapUv:ge&&_(o.clearcoatMap.channel),clearcoatNormalMapUv:_e&&_(o.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:R&&_(o.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&_(o.iridescenceMap.channel),iridescenceThicknessMapUv:ye&&_(o.iridescenceThicknessMap.channel),sheenColorMapUv:be&&_(o.sheenColorMap.channel),sheenRoughnessMapUv:z&&_(o.sheenRoughnessMap.channel),specularMapUv:B&&_(o.specularMap.channel),specularColorMapUv:V&&_(o.specularColorMap.channel),specularIntensityMapUv:xe&&_(o.specularIntensityMap.channel),transmissionMapUv:H&&_(o.transmissionMap.channel),thicknessMapUv:U&&_(o.thicknessMap.channel),alphaMapUv:Ce&&_(o.alphaMap.channel),vertexTangents:!!b.attributes.tangent&&(ie||le),vertexColors:o.vertexColors,vertexAlphas:o.vertexColors===!0&&!!b.attributes.color&&b.attributes.color.itemSize===4,pointsUvs:v.isPoints===!0&&!!b.attributes.uv&&(I||Ce),fog:!!y,useFog:o.fog===!0,fogExp2:!!y&&y.isFogExp2,flatShading:o.flatShading===!0&&o.wireframe===!1,sizeAttenuation:o.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:N,skinning:v.isSkinnedMesh===!0,morphTargets:b.morphAttributes.position!==void 0,morphNormals:b.morphAttributes.normal!==void 0,morphColors:b.morphAttributes.color!==void 0,morphTargetsCount:E,morphTextureStride:D,numDirLights:c.directional.length,numPointLights:c.point.length,numSpotLights:c.spot.length,numSpotLightMaps:c.spotLightMap.length,numRectAreaLights:c.rectArea.length,numHemiLights:c.hemi.length,numDirLightShadows:c.directionalShadowMap.length,numPointLightShadows:c.pointShadowMap.length,numSpotLightShadows:c.spotShadowMap.length,numSpotLightShadowsWithMaps:c.numSpotLightShadowsWithMaps,numLightProbes:c.numLightProbes,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:o.dithering,shadowMapEnabled:t.shadowMap.enabled&&d.length>0,shadowMapType:t.shadowMap.type,toneMapping:De,decodeVideoTexture:I&&o.map.isVideoTexture===!0&&et.getTransfer(o.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:oe&&o.emissiveMap.isVideoTexture===!0&&et.getTransfer(o.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:o.premultipliedAlpha,doubleSided:o.side===2,flipSided:o.side===1,useDepthPacking:o.depthPacking>=0,depthPacking:o.depthPacking||0,index0AttributeName:o.index0AttributeName,extensionClipCullDistance:Ee&&o.extensions.clipCullDistance===!0&&i.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ee&&o.extensions.multiDraw===!0||F)&&i.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:i.has(`KHR_parallel_shader_compile`),customProgramCacheKey:o.customProgramCacheKey()};return Oe.vertexUv1s=u.has(1),Oe.vertexUv2s=u.has(2),Oe.vertexUv3s=u.has(3),u.clear(),Oe}function y(e){let n=[];if(e.shaderID?n.push(e.shaderID):(n.push(e.customVertexShaderID),n.push(e.customFragmentShaderID)),e.defines!==void 0)for(let t in e.defines)n.push(t),n.push(e.defines[t]);return e.isRawShaderMaterial===!1&&(x(n,e),S(n,e),n.push(t.outputColorSpace)),n.push(e.customProgramCacheKey),n.join()}function x(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function S(e,t){c.disableAll(),t.supportsVertexTextures&&c.enable(0),t.instancing&&c.enable(1),t.instancingColor&&c.enable(2),t.instancingMorph&&c.enable(3),t.matcap&&c.enable(4),t.envMap&&c.enable(5),t.normalMapObjectSpace&&c.enable(6),t.normalMapTangentSpace&&c.enable(7),t.clearcoat&&c.enable(8),t.iridescence&&c.enable(9),t.alphaTest&&c.enable(10),t.vertexColors&&c.enable(11),t.vertexAlphas&&c.enable(12),t.vertexUv1s&&c.enable(13),t.vertexUv2s&&c.enable(14),t.vertexUv3s&&c.enable(15),t.vertexTangents&&c.enable(16),t.anisotropy&&c.enable(17),t.alphaHash&&c.enable(18),t.batching&&c.enable(19),t.dispersion&&c.enable(20),t.batchingColor&&c.enable(21),t.gradientMap&&c.enable(22),e.push(c.mask),c.disableAll(),t.fog&&c.enable(0),t.useFog&&c.enable(1),t.flatShading&&c.enable(2),t.logarithmicDepthBuffer&&c.enable(3),t.reversedDepthBuffer&&c.enable(4),t.skinning&&c.enable(5),t.morphTargets&&c.enable(6),t.morphNormals&&c.enable(7),t.morphColors&&c.enable(8),t.premultipliedAlpha&&c.enable(9),t.shadowMapEnabled&&c.enable(10),t.doubleSided&&c.enable(11),t.flipSided&&c.enable(12),t.useDepthPacking&&c.enable(13),t.dithering&&c.enable(14),t.transmission&&c.enable(15),t.sheen&&c.enable(16),t.opaque&&c.enable(17),t.pointsUvs&&c.enable(18),t.decodeVideoTexture&&c.enable(19),t.decodeVideoTextureEmissive&&c.enable(20),t.alphaToCoverage&&c.enable(21),e.push(c.mask)}function C(e){let t=h[e.type],n;if(t){let e=en[t];n=b.clone(e.uniforms)}else n=e.uniforms;return n}function w(e,n){let r;for(let e=0,t=d.length;e<t;e++){let t=d[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new Si(t,n,e,o),d.push(r)),r}function T(e){if(--e.usedTimes===0){let t=d.indexOf(e);d[t]=d[d.length-1],d.pop(),e.destroy()}}function E(e){l.remove(e)}function D(){l.dispose()}return{getParameters:v,getProgramCacheKey:y,getUniforms:C,acquireProgram:w,releaseProgram:T,releaseShaderCache:E,programs:d,dispose:D}}function Di(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Oi(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function ki(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ai(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Oi),r.length>1&&r.sort(t||ki),i.length>1&&i.sort(t||ki)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function ji(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Ai,e.set(t,[i])):n>=r.length?(i=new Ai,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Mi(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new w,color:new W};break;case`SpotLight`:n={position:new w,direction:new w,color:new W,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new w,color:new W,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new w,skyColor:new W,groundColor:new W};break;case`RectAreaLight`:n={color:new W,position:new w,halfWidth:new w,halfHeight:new w}}return e[t.id]=n,n}}}function Ni(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Pi=0;function Fi(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Ii(e){let t=new Mi,n=Ni(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new w);let i=new w,a=new $e,o=new $e;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Fi);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=X.LTC_FLOAT_1,r.rectAreaLTC2=X.LTC_FLOAT_2):(r.rectAreaLTC1=X.LTC_HALF_1,r.rectAreaLTC2=X.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Pi++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Li(e){let t=new Ii(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function Ri(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Li(e),t.set(n,[a])):r>=i.length?(a=new Li(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var zi=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Bi=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Vi(e,t,r){let i=new n,a=new _,s=new _,c=new J,l=new Ge({depthPacking:k}),u=new ht,d={},f=r.maxTextureSize,p={0:1,1:0,2:2},m=new o({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new _},radius:{value:4}},vertexShader:zi,fragmentShader:Bi}),h=m.clone();h.defines.HORIZONTAL_PASS=1;let g=new We;g.setAttribute(`position`,new U(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new ut(g,m),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let b=this.type;this.render=function(t,n,r){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||t.length===0)return;let o=e.getRenderTarget(),l=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),d=e.state;d.setBlending(0),d.buffers.depth.getReversed()===!0?d.buffers.color.setClear(0,0,0,0):d.buffers.color.setClear(1,1,1,1),d.buffers.depth.setTest(!0),d.setScissorTest(!1);let p=b!==3&&this.type===3,m=b===3&&this.type!==3;for(let o=0,l=t.length;o<l;o++){let l=t[o],u=l.shadow;if(u===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(u.autoUpdate===!1&&u.needsUpdate===!1)continue;a.copy(u.mapSize);let h=u.getFrameExtents();if(a.multiply(h),s.copy(u.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(s.x=Math.floor(f/h.x),a.x=s.x*h.x,u.mapSize.x=s.x),a.y>f&&(s.y=Math.floor(f/h.y),a.y=s.y*h.y,u.mapSize.y=s.y)),u.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:Je,magFilter:Je};u.map!==null&&u.map.dispose(),u.map=new ee(a.x,a.y,e),u.map.texture.name=l.name+`.shadowMap`,u.camera.updateProjectionMatrix()}e.setRenderTarget(u.map),e.clear();let g=u.getViewportCount();for(let e=0;e<g;e++){let t=u.getViewport(e);c.set(s.x*t.x,s.y*t.y,s.x*t.z,s.y*t.w),d.viewport(c),u.updateMatrices(l,e),i=u.getFrustum(),C(n,r,u.camera,l,this.type)}u.isPointLightShadow!==!0&&this.type===3&&x(u,r),u.needsUpdate=!1}b=this.type,y.needsUpdate=!1,e.setRenderTarget(o,l,u)};function x(n,r){let i=t.update(v);m.defines.VSM_SAMPLES!==n.blurSamples&&(m.defines.VSM_SAMPLES=n.blurSamples,h.defines.VSM_SAMPLES=n.blurSamples,m.needsUpdate=!0,h.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new ee(a.x,a.y)),m.uniforms.shadow_pass.value=n.map.texture,m.uniforms.resolution.value=n.mapSize,m.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,m,v,null),h.uniforms.shadow_pass.value=n.mapPass.texture,h.uniforms.resolution.value=n.mapSize,h.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,h,v,null)}function S(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,w)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function C(n,r,a,o,s){if(n.visible===!1)return;if(n.layers.test(r.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||i.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let i=t.update(n),c=n.material;if(Array.isArray(c)){let t=i.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=S(n,d,o,s);n.onBeforeShadow(e,n,r,a,i,t,u),e.renderBufferDirect(a,null,i,t,n,u),n.onAfterShadow(e,n,r,a,i,t,u)}}}else if(c.visible){let t=S(n,c,o,s);n.onBeforeShadow(e,n,r,a,i,t,null),e.renderBufferDirect(a,null,i,t,n,null),n.onAfterShadow(e,n,r,a,i,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)C(c[e],r,a,o,s)}function w(e){e.target.removeEventListener(`dispose`,w);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var Hi={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Ui(e,t){function n(){let t=!1,n=new J,r=null,i=new J(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ae(e.DEPTH_TEST):oe(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Hi[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ae(e.STENCIL_TEST):oe(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new W(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,N=0,P=e.getParameter(e.VERSION);P.indexOf(`WebGL`)===-1?P.indexOf(`OpenGL ES`)!==-1&&(N=parseFloat(/^OpenGL ES (\d)/.exec(P)[1]),M=N>=2):(N=parseFloat(/^WebGL (\d)/.exec(P)[1]),M=N>=1);let F=null,I={},ee=e.getParameter(e.SCISSOR_BOX),te=e.getParameter(e.VIEWPORT),ne=new J().fromArray(ee),L=new J().fromArray(te);function re(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ie={};ie[e.TEXTURE_2D]=re(e.TEXTURE_2D,e.TEXTURE_2D,1),ie[e.TEXTURE_CUBE_MAP]=re(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ie[e.TEXTURE_2D_ARRAY]=re(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ie[e.TEXTURE_3D]=re(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ae(e.DEPTH_TEST),o.setFunc(3),me(!1),he(1),ae(e.CULL_FACE),fe(0);function ae(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function oe(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function se(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function ce(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function le(t){return m!==t&&(e.useProgram(t),m=t,!0)}let ue={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ue[103]=e.MIN,ue[104]=e.MAX;let de={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function fe(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(oe(e.BLEND),h=!1);return}if(h===!1&&(ae(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(ue[n],ue[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(de[r],de[i],de[o],de[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function pe(t,n){t.side===2?oe(e.CULL_FACE):ae(e.CULL_FACE);let r=t.side===1;n&&(r=!r),me(r),t.blending===1&&t.transparent===!1?fe(0):fe(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),_e(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ae(e.SAMPLE_ALPHA_TO_COVERAGE):oe(e.SAMPLE_ALPHA_TO_COVERAGE)}function me(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function he(t){t===0?oe(e.CULL_FACE):(ae(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function ge(t){t!==O&&(M&&e.lineWidth(t),O=t)}function _e(t,n,r){t?(ae(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(e.polygonOffset(n,r),k=n,A=r)):oe(e.POLYGON_OFFSET_FILL)}function R(t){t?ae(e.SCISSOR_TEST):oe(e.SCISSOR_TEST)}function ve(t){t===void 0&&(t=e.TEXTURE0+j-1),F!==t&&(e.activeTexture(t),F=t)}function ye(t,n,r){r===void 0&&(r=F===null?e.TEXTURE0+j-1:F);let i=I[r];i===void 0&&(i={type:void 0,texture:void 0},I[r]=i),(i.type!==t||i.texture!==n)&&(F!==r&&(e.activeTexture(r),F=r),e.bindTexture(t,n||ie[t]),i.type=t,i.texture=n)}function be(){let t=I[F];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function z(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function B(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function V(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function xe(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function H(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function U(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ce(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(t){ne.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ne.copy(t))}function De(t){L.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),L.copy(t))}function Oe(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function ke(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Ae(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},F=null,I={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new W(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,ne.set(0,0,e.canvas.width,e.canvas.height),L.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ae,disable:oe,bindFramebuffer:se,drawBuffers:ce,useProgram:le,setBlending:fe,setMaterial:pe,setFlipSided:me,setCullFace:he,setLineWidth:ge,setPolygonOffset:_e,setScissorTest:R,activeTexture:ve,bindTexture:ye,unbindTexture:be,compressedTexImage2D:z,compressedTexImage3D:B,texImage2D:we,texImage3D:Te,updateUBOMapping:Oe,uniformBlockBinding:ke,texStorage2D:Se,texStorage3D:Ce,texSubImage2D:V,texSubImage3D:xe,compressedTexSubImage2D:H,compressedTexSubImage3D:U,scissor:Ee,viewport:De,reset:Ae}}function Wi(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new _,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):ot(`canvas`)}function h(e,t,n){let r=1,i=H(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function g(e){return e.generateMipmaps}function v(t){e.generateMipmap(t)}function y(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function b(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?Oe:et.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function x(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function S(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),T(t),t.isVideoTexture&&u.delete(t)}function w(e){let t=e.target;t.removeEventListener(`dispose`,w),D(t)}function T(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&E(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function E(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function D(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let O=0;function k(){O=0}function A(){let e=O;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),O+=1,e}function j(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function M(t,i){let a=r.get(t);if(t.isVideoTexture&&B(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{oe(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function N(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){oe(a,t,i);return}n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function P(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){oe(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function F(t,i){let a=r.get(t);if(t.version>0&&a.__version!==t.version){se(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ee={[R]:e.REPEAT,[we]:e.CLAMP_TO_EDGE,[rt]:e.MIRRORED_REPEAT},te={[Je]:e.NEAREST,[Pe]:e.NEAREST_MIPMAP_NEAREST,[Le]:e.NEAREST_MIPMAP_LINEAR,[de]:e.LINEAR,[I]:e.LINEAR_MIPMAP_NEAREST,[he]:e.LINEAR_MIPMAP_LINEAR},ne={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function L(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ee[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ee[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ee[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,te[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,te[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,ne[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function re(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,C));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=j(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&E(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ie(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ae(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ie(n.start,r.width,4),c=ie(t.start,r.width,4);n.start<=i+1&&a===c&&ie(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function oe(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=re(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=et.getPrimaries(et.workingColorSpace),r=o.colorSpace===``?null:et.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=xe(o,p);let m=a.convert(o.format,o.colorSpace),_=a.convert(o.type),y=b(o.internalFormat,m,_,o.colorSpace,o.isVideoTexture);L(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=S(o,p);if(o.isDepthTexture)y=x(o.format===V,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,y,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,y,p.width,p.height,0,m,_,null));else if(o.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,O,y,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,_,C.data):n.texImage2D(e.TEXTURE_2D,t,y,C.width,C.height,0,m,_,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,O,y,p.width,p.height),D&&ae(o,p,m,_)):n.texImage2D(e.TEXTURE_2D,0,y,p.width,p.height,0,m,_,p.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,y,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023){if(m!==null){if(T){if(D){if(o.layerUpdates.size>0){let r=ze(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,y,C.width,C.height,p.depth,0,C.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,_,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,y,C.width,C.height,p.depth,0,m,_,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,O,y,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,_,C.data):n.texImage2D(e.TEXTURE_2D,t,y,C.width,C.height,0,m,_,C.data):m===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,y,C.width,C.height,0,C.data)}}else if(o.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,y,p.width,p.height,p.depth),D){if(o.layerUpdates.size>0){let t=ze(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,_,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,_,p.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,y,p.width,p.height,p.depth,0,m,_,p.data)}else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,O,y,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,_,p.data)):n.texImage3D(e.TEXTURE_3D,0,y,p.width,p.height,p.depth,0,m,_,p.data);else if(o.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,O,y,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,y,t,r,0,m,_,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=H(w[0]);n.texStorage2D(e.TEXTURE_2D,O,y,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,_,C):n.texImage2D(e.TEXTURE_2D,t,y,m,_,C);o.generateMipmaps=!1}else if(T){if(E){let t=H(p);n.texStorage2D(e.TEXTURE_2D,O,y,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,_,p)}else n.texImage2D(e.TEXTURE_2D,0,y,m,_,p);g(o)&&v(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function se(t,o,s){if(o.image.length!==6)return;let c=re(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=et.getPrimaries(et.workingColorSpace),r=o.colorSpace===``?null:et.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=xe(o,m[e]);let _=m[0],y=a.convert(o.format,o.colorSpace),x=a.convert(o.type),C=b(o.internalFormat,y,x,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=S(o,_);L(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,_.width,_.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,y,x,i.data):y===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,y,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=H(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,y,x,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,y,x,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,y,x,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,y,x,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,y,x,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,y,x,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,y,x,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,y,x,i.image[t])}}}g(o)&&v(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ce(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=b(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,be(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function le(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=x(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=be(n);z(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=b(o.internalFormat,c,l,o.colorSpace),d=be(n);r&&z(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):z(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ue(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),M(i.depthTexture,0);let o=a.__webglTexture,c=be(i);if(i.depthTexture.format===1026)z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function fe(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?ue(i.__webglFramebuffer[0],t):ue(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),le(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),le(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function pe(t,n,i){let a=r.get(t);n!==void 0&&ce(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&fe(t)}function me(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,w);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&z(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=b(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=be(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),le(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),L(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)ce(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else ce(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&v(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),L(c,a),ce(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),g(a)&&v(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),L(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)ce(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else ce(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&v(r),n.unbindTexture()}t.depthBuffer&&fe(t)}function ge(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(g(a)){let t=y(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),v(t),n.unbindTexture()}}}let _e=[],ve=[];function ye(t){if(t.samples>0){if(z(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(_e.length=0,ve.length=0,_e.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(_e.push(l),ve.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,ve)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,_e))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function be(e){return Math.min(i.maxSamples,e.samples)}function z(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function B(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function xe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(et.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function H(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=A,this.resetTextureUnits=k,this.setTexture2D=M,this.setTexture2DArray=N,this.setTexture3D=P,this.setTextureCube=F,this.rebindTextures=pe,this.setupRenderTarget=me,this.updateRenderTargetMipmap=ge,this.updateMultisampleRenderTarget=ye,this.setupDepthRenderbuffer=fe,this.setupFrameBufferTexture=ce,this.useMultisampledRTT=z}function Gi(e,t){function n(n,r=``){let i,a=et.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Ki=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,qi=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Ji=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new d(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new o({vertexShader:Ki,fragmentShader:qi,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ut(new re(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Yi=class extends ie{constructor(e,n){super();let r=this,i=null,a=1,o=null,s=`local-floor`,c=1,l=null,u=null,f=null,p=null,m=null,h=null,g=typeof XRWebGLBinding<`u`,v=new Ji,y={},b=n.getContextAttributes(),x=null,S=null,C=[],T=[],D=new _,O=null,k=new H;k.viewport=new J;let A=new H;A.viewport=new J;let M=[k,A],N=new at,P=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let n=C[e];return n===void 0&&(n=new t,C[e]=n),n.getTargetRaySpace()},this.getControllerGrip=function(e){let n=C[e];return n===void 0&&(n=new t,C[e]=n),n.getGripSpace()},this.getHand=function(e){let n=C[e];return n===void 0&&(n=new t,C[e]=n),n.getHandSpace()};function I(e){let t=T.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,l||o),n.dispatchEvent({type:e.type,data:e.inputSource}))}function te(){i.removeEventListener(`select`,I),i.removeEventListener(`selectstart`,I),i.removeEventListener(`selectend`,I),i.removeEventListener(`squeeze`,I),i.removeEventListener(`squeezestart`,I),i.removeEventListener(`squeezeend`,I),i.removeEventListener(`end`,te),i.removeEventListener(`inputsourceschange`,ne);for(let e=0;e<C.length;e++){let t=T[e];t!==null&&(T[e]=null,C[e].disconnect(t))}P=null,F=null,v.reset();for(let e in y)delete y[e];e.setRenderTarget(x),m=null,p=null,f=null,i=null,S=null,ue.stop(),r.isPresenting=!1,e.setPixelRatio(O),e.setSize(D.width,D.height,!1),r.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){a=e,r.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){s=e,r.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(e){l=e},this.getBaseLayer=function(){return p===null?m:p},this.getBinding=function(){return f===null&&g&&(f=new XRWebGLBinding(i,n)),f},this.getFrame=function(){return h},this.getSession=function(){return i},this.setSession=async function(t){if(i=t,i!==null){if(x=e.getRenderTarget(),i.addEventListener(`select`,I),i.addEventListener(`selectstart`,I),i.addEventListener(`selectend`,I),i.addEventListener(`squeeze`,I),i.addEventListener(`squeezestart`,I),i.addEventListener(`squeezeend`,I),i.addEventListener(`end`,te),i.addEventListener(`inputsourceschange`,ne),b.xrCompatible!==!0&&await n.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(D),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let t=null,r=null,o=null;b.depth&&(o=b.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,t=b.stencil?V:wt,r=b.stencil?Dt:le);let s={colorFormat:n.RGBA8,depthFormat:o,scaleFactor:a};f=this.getBinding(),p=f.createProjectionLayer(s),i.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),S=new ee(p.textureWidth,p.textureHeight,{format:j,type:E,depthTexture:new xt(p.textureWidth,p.textureHeight,r,void 0,void 0,void 0,void 0,void 0,void 0,t),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{let t={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:a};m=new XRWebGLLayer(i,n,t),i.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),S=new ee(m.framebufferWidth,m.framebufferHeight,{format:j,type:E,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await i.requestReferenceSpace(s),ue.setContext(i),ue.start(),r.isPresenting=!0,r.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function ne(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=T.indexOf(n);r>=0&&(T[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=T.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=T.length){T.push(n),r=e;break}else if(T[e]===null){T[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let L=new w,re=new w;function ie(e,t,n){L.setFromMatrixPosition(t.matrixWorld),re.setFromMatrixPosition(n.matrixWorld);let r=L.distanceTo(re),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ae(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(i===null)return;let t=e.near,n=e.far;v.texture!==null&&(v.depthNear>0&&(t=v.depthNear),v.depthFar>0&&(n=v.depthFar)),N.near=A.near=k.near=t,N.far=A.far=k.far=n,(P!==N.near||F!==N.far)&&(i.updateRenderState({depthNear:N.near,depthFar:N.far}),P=N.near,F=N.far),N.layers.mask=e.layers.mask|6,k.layers.mask=N.layers.mask&3,A.layers.mask=N.layers.mask&5;let r=e.parent,a=N.cameras;ae(N,r);for(let e=0;e<a.length;e++)ae(a[e],r);a.length===2?ie(N,k,A):N.projectionMatrix.copy(k.projectionMatrix),oe(e,N,r)};function oe(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Ue*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(p!==null||m!==null)return c},this.setFoveation=function(e){c=e,p!==null&&(p.fixedFoveation=e),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=e)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(N)},this.getCameraTexture=function(e){return y[e]};let se=null;function ce(t,n){if(u=n.getViewerPose(l||o),h=n,u!==null){let t=u.views;m!==null&&(e.setRenderTargetFramebuffer(S,m.framebuffer),e.setRenderTarget(S));let n=!1;t.length!==N.cameras.length&&(N.cameras.length=0,n=!0);for(let r=0;r<t.length;r++){let i=t[r],a=null;if(m!==null)a=m.getViewport(i);else{let t=f.getViewSubImage(p,i);a=t.viewport,r===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=M[r];o===void 0&&(o=new H,o.layers.enable(r),o.viewport=new J,M[r]=o),o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(i.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),r===0&&(N.matrix.copy(o.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),n===!0&&N.cameras.push(o)}let a=i.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&i.depthUsage==`gpu-optimized`&&g){f=r.getBinding();let e=f.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&v.init(e,i.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),f=r.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=y[n];e||(e=new d,y[n]=e);let t=f.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=T[e],r=C[e];t!==null&&r!==void 0&&r.update(t,n,l||o)}se&&se(t,n),n.detectedPlanes&&r.dispatchEvent({type:`planesdetected`,data:n}),h=null}let ue=new Qt;ue.setAnimationLoop(ce),this.setAnimationLoop=function(e){se=e},this.dispose=function(){}}},Xi=new yt,Zi=new $e;function Qi(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,z(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,Xi.copy(o),Xi.x*=-1,Xi.y*=-1,Xi.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(Xi.y*=-1,Xi.z*=-1),e.envMapRotation.value.setFromMatrix4(Zi.makeRotationFromEuler(Xi)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function $i(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var ea=class{constructor(t={}){let{canvas:r=Xe(),context:i=null,depth:a=!0,stencil:o=!1,alpha:s=!1,antialias:c=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:p=!1}=t;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<`u`&&i instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);m=i.getContextAttributes().alpha}else m=s;let h=new Uint32Array(4),g=new Int32Array(4),_=null,v=null,y=[],b=[];this.domElement=r,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let x=this,S=!1;this._outputColorSpace=xe;let C=0,T=0,D=null,O=-1,k=null,j=new J,M=new J,N=null,P=new W(0),F=0,I=r.width,te=r.height,ne=1,L=null,re=null,ie=new J(0,0,I,te),ae=new J(0,0,I,te),oe=!1,se=new n,ce=!1,le=!1,ue=new $e,de=new w,pe=new J,me={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ge=!1;function _e(){return D===null?ne:1}let R=i;function ve(e,t){return r.getContext(e,t)}try{let e={alpha:!0,depth:a,stencil:o,antialias:c,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:f};if(`setAttribute`in r&&r.setAttribute(`data-engine`,`three.js r180`),r.addEventListener(`webglcontextlost`,Be,!1),r.addEventListener(`webglcontextrestored`,Ve,!1),r.addEventListener(`webglcontextcreationerror`,He,!1),R===null){let t=`webgl2`;if(R=ve(t,e),R===null)throw ve(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let ye,be,z,B,V,H,U,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze;function G(){ye=new Nn(R),ye.init(),Le=new Gi(R,ye),be=new cn(R,ye,t,Le),z=new Ui(R,ye),be.reversedDepthBuffer&&p&&z.buffers.depth.setReversed(!0),B=new In(R),V=new Di,H=new Wi(R,ye,z,V,be,Le,B),U=new un(x),Ce=new Mn(x),we=new $t(R),Re=new on(R,we),Te=new Pn(R,we,B,Re),Ee=new Rn(R,Te,we,B),Pe=new Ln(R,be,H),je=new ln(V),De=new Ei(x,U,Ce,ye,be,Re,je),Oe=new Qi(x,V),ke=new ji,Ae=new Ri(ye),Ne=new an(x,U,Ce,z,Ee,m,l),Me=new Vi(x,Ee,be),ze=new $i(R,B,be,z),Fe=new sn(R,ye,B),Ie=new Fn(R,ye,B),B.programs=De.programs,x.capabilities=be,x.extensions=ye,x.properties=V,x.renderLists=ke,x.shadowMap=Me,x.state=z,x.info=B}G();let K=new Yi(x,R);this.xr=K,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){let e=ye.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=ye.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ne},this.setPixelRatio=function(e){e!==void 0&&(ne=e,this.setSize(I,te,!1))},this.getSize=function(e){return e.set(I,te)},this.setSize=function(e,t,n=!0){if(K.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}I=e,te=t,r.width=Math.floor(e*ne),r.height=Math.floor(t*ne),n===!0&&(r.style.width=e+`px`,r.style.height=t+`px`),this.setViewport(0,0,e,t)},this.getDrawingBufferSize=function(e){return e.set(I*ne,te*ne).floor()},this.setDrawingBufferSize=function(e,t,n){I=e,te=t,ne=n,r.width=Math.floor(e*n),r.height=Math.floor(t*n),this.setViewport(0,0,e,t)},this.getCurrentViewport=function(e){return e.copy(j)},this.getViewport=function(e){return e.copy(ie)},this.setViewport=function(e,t,n,r){e.isVector4?ie.set(e.x,e.y,e.z,e.w):ie.set(e,t,n,r),z.viewport(j.copy(ie).multiplyScalar(ne).round())},this.getScissor=function(e){return e.copy(ae)},this.setScissor=function(e,t,n,r){e.isVector4?ae.set(e.x,e.y,e.z,e.w):ae.set(e,t,n,r),z.scissor(M.copy(ae).multiplyScalar(ne).round())},this.getScissorTest=function(){return oe},this.setScissorTest=function(e){z.setScissorTest(oe=e)},this.setOpaqueSort=function(e){L=e},this.setTransparentSort=function(e){re=e},this.getClearColor=function(e){return e.copy(Ne.getClearColor())},this.setClearColor=function(){Ne.setClearColor(...arguments)},this.getClearAlpha=function(){return Ne.getClearAlpha()},this.setClearAlpha=function(){Ne.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(D!==null){let t=D.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=D.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Ne.getClearColor(),r=Ne.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(h[0]=i,h[1]=a,h[2]=o,h[3]=r,R.clearBufferuiv(R.COLOR,0,h)):(g[0]=i,g[1]=a,g[2]=o,g[3]=r,R.clearBufferiv(R.COLOR,0,g))}else r|=R.COLOR_BUFFER_BIT}t&&(r|=R.DEPTH_BUFFER_BIT),n&&(r|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){r.removeEventListener(`webglcontextlost`,Be,!1),r.removeEventListener(`webglcontextrestored`,Ve,!1),r.removeEventListener(`webglcontextcreationerror`,He,!1),Ne.dispose(),ke.dispose(),Ae.dispose(),V.dispose(),U.dispose(),Ce.dispose(),Ee.dispose(),Re.dispose(),ze.dispose(),De.dispose(),K.dispose(),K.removeEventListener(`sessionstart`,Ye),K.removeEventListener(`sessionend`,Ze),q.stop()};function Be(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),S=!0}function Ve(){console.log(`THREE.WebGLRenderer: Context Restored.`),S=!1;let e=B.autoReset,t=Me.enabled,n=Me.autoUpdate,r=Me.needsUpdate,i=Me.type;G(),B.autoReset=e,Me.enabled=t,Me.autoUpdate=n,Me.needsUpdate=r,Me.type=i}function He(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ue(e){let t=e.target;t.removeEventListener(`dispose`,Ue),We(t)}function We(e){Ge(e),V.remove(e)}function Ge(e){let t=V.get(e).programs;t!==void 0&&(t.forEach(function(e){De.releaseProgram(e)}),e.isShaderMaterial&&De.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=me);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=ct(e,t,n,r,i);z.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Te.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Re.setup(i,r,s,n,c);let h,g=Fe;if(c!==null&&(h=we.get(c),g=Ie,g.setIndex(h)),i.isMesh)r.wireframe===!0?(z.setLineWidth(r.wireframeLinewidth*_e()),g.setMode(R.LINES)):g.setMode(R.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),z.setLineWidth(e*_e()),i.isLineSegments?g.setMode(R.LINES):i.isLineLoop?g.setMode(R.LINE_LOOP):g.setMode(R.LINE_STRIP)}else i.isPoints?g.setMode(R.POINTS):i.isSprite&&g.setMode(R.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)Se(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(ye.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?we.get(c).bytesPerElement:1,o=V.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(R,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ke(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,at(e,t,n),e.side=0,e.needsUpdate=!0,at(e,t,n),e.side=2):at(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),v=Ae.get(n),v.init(t),b.push(v),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(v.pushLight(e),e.castShadow&&v.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(v.pushLight(e),e.castShadow&&v.pushShadow(e))}),v.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Ke(a,n,e),r.add(a)}else Ke(t,n,e),r.add(t)}}),v=b.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){V.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}ye.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let qe=null;function Je(e){qe&&qe(e)}function Ye(){q.stop()}function Ze(){q.start()}let q=new Qt;q.setAnimationLoop(Je),typeof self<`u`&&q.setContext(self),this.setAnimationLoop=function(e){qe=e,K.setAnimationLoop(e),e===null?q.stop():q.start()},K.addEventListener(`sessionstart`,Ye),K.addEventListener(`sessionend`,Ze),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(S===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),K.enabled===!0&&K.isPresenting===!0&&(K.cameraAutoUpdate===!0&&K.updateCamera(t),t=K.getCamera()),e.isScene===!0&&e.onBeforeRender(x,e,t,D),v=Ae.get(e,b.length),v.init(t),b.push(v),ue.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),se.setFromProjectionMatrix(ue,fe,t.reversedDepth),le=this.localClippingEnabled,ce=je.init(this.clippingPlanes,le),_=ke.get(e,y.length),_.init(),y.push(_),K.enabled===!0&&K.isPresenting===!0){let e=x.xr.getDepthSensingMesh();e!==null&&Qe(e,t,-1/0,x.sortObjects)}Qe(e,t,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(L,re),ge=K.enabled===!1||K.isPresenting===!1||K.hasDepthSensing()===!1,ge&&Ne.addToRenderList(_,e),this.info.render.frame++,ce===!0&&je.beginShadows();let n=v.state.shadowsArray;Me.render(n,e,t),ce===!0&&je.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=_.opaque,i=_.transmissive;if(v.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];nt(r,i,e,a)}ge&&Ne.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];tt(_,e,r,r.viewport)}}else i.length>0&&nt(r,i,e,t),ge&&Ne.render(e),tt(_,e,t);D!==null&&T===0&&(H.updateMultisampleRenderTarget(D),H.updateRenderTargetMipmap(D)),e.isScene===!0&&e.onAfterRender(x,e,t),Re.resetDefaultState(),O=-1,k=null,b.pop(),b.length>0?(v=b[b.length-1],ce===!0&&je.setGlobalState(x.clippingPlanes,v.state.camera)):v=null,y.pop(),_=y.length>0?y[y.length-1]:null};function Qe(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)v.pushLight(e),e.castShadow&&v.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||se.intersectsSprite(e)){r&&pe.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ue);let t=Ee.update(e),i=e.material;i.visible&&_.push(e,t,i,n,pe.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||se.intersectsObject(e))){let t=Ee.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),pe.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),pe.copy(e.boundingSphere.center)),pe.applyMatrix4(e.matrixWorld).applyMatrix4(ue)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&_.push(e,t,s,n,pe.z,o)}}else i.visible&&_.push(e,t,i,n,pe.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)Qe(i[e],t,n,r)}function tt(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;v.setupLightsView(n),ce===!0&&je.setGlobalState(x.clippingPlanes,n),r&&z.viewport(j.copy(r)),i.length>0&&rt(i,t,n),a.length>0&&rt(a,t,n),o.length>0&&rt(o,t,n),z.buffers.depth.setTest(!0),z.buffers.depth.setMask(!0),z.buffers.color.setMask(!0),z.setPolygonOffset(!1)}function nt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;v.state.transmissionRenderTarget[r.id]===void 0&&(v.state.transmissionRenderTarget[r.id]=new ee(1,1,{generateMipmaps:!0,type:ye.has(`EXT_color_buffer_half_float`)||ye.has(`EXT_color_buffer_float`)?A:E,minFilter:he,samples:4,stencilBuffer:o,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:et.workingColorSpace}));let i=v.state.transmissionRenderTarget[r.id],a=r.viewport||j;i.setSize(a.z*x.transmissionResolutionScale,a.w*x.transmissionResolutionScale);let s=x.getRenderTarget(),c=x.getActiveCubeFace(),l=x.getActiveMipmapLevel();x.setRenderTarget(i),x.getClearColor(P),F=x.getClearAlpha(),F<1&&x.setClearColor(16777215,.5),x.clear(),ge&&Ne.render(n);let u=x.toneMapping;x.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),v.setupLightsView(r),ce===!0&&je.setGlobalState(x.clippingPlanes,r),rt(e,n,r),H.updateMultisampleRenderTarget(i),H.updateRenderTargetMipmap(i),ye.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,it(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(H.updateMultisampleRenderTarget(i),H.updateRenderTargetMipmap(i))}x.setRenderTarget(s,c,l),x.setClearColor(P,F),d!==void 0&&(r.viewport=d),x.toneMapping=u}function rt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&it(o,t,n,s,l,c)}}function it(e,t,n,r,i,a){e.onBeforeRender(x,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(x,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,x.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,x.renderBufferDirect(n,t,r,i,e,a),i.side=2):x.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(x,t,n,r,i,a)}function at(e,t,n){t.isScene!==!0&&(t=me);let r=V.get(e),i=v.state.lights,a=v.state.shadowsArray,o=i.state.version,s=De.getParameters(e,i.state,a,t,n),c=De.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?Ce:U).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ue),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return st(e,s),u}else s.uniforms=De.getUniforms(e),e.onBeforeCompile(s,x),u=De.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=je.uniform),st(e,s),r.needsLights=dt(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function ot(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Gr.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function st(e,t){let n=V.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function ct(t,n,r,i,a){n.isScene!==!0&&(n=me),H.resetTextureUnits();let o=n.fog,s=i.isMeshStandardMaterial?n.environment:null,c=D===null?x.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:e,l=(i.isMeshStandardMaterial?Ce:U).get(i.envMap||s),u=i.vertexColors===!0&&!!r.attributes.color&&r.attributes.color.itemSize===4,d=!!r.attributes.tangent&&(!!i.normalMap||i.anisotropy>0),f=!!r.morphAttributes.position,p=!!r.morphAttributes.normal,m=!!r.morphAttributes.color,h=0;i.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(h=x.toneMapping);let g=r.morphAttributes.position||r.morphAttributes.normal||r.morphAttributes.color,_=g===void 0?0:g.length,y=V.get(i),b=v.state.lights;if(ce===!0&&(le===!0||t!==k)){let e=t===k&&i.id===O;je.setState(i,t,e)}let S=!1;i.version===y.__version?y.needsLights&&y.lightsStateVersion!==b.state.version?S=!0:y.outputColorSpace===c?a.isBatchedMesh&&y.batching===!1||!a.isBatchedMesh&&y.batching===!0||a.isBatchedMesh&&y.batchingColor===!0&&a.colorTexture===null||a.isBatchedMesh&&y.batchingColor===!1&&a.colorTexture!==null||a.isInstancedMesh&&y.instancing===!1||!a.isInstancedMesh&&y.instancing===!0||a.isSkinnedMesh&&y.skinning===!1||!a.isSkinnedMesh&&y.skinning===!0||a.isInstancedMesh&&y.instancingColor===!0&&a.instanceColor===null||a.isInstancedMesh&&y.instancingColor===!1&&a.instanceColor!==null||a.isInstancedMesh&&y.instancingMorph===!0&&a.morphTexture===null||a.isInstancedMesh&&y.instancingMorph===!1&&a.morphTexture!==null?S=!0:y.envMap===l?i.fog===!0&&y.fog!==o||y.numClippingPlanes!==void 0&&(y.numClippingPlanes!==je.numPlanes||y.numIntersection!==je.numIntersection)?S=!0:y.vertexAlphas===u&&y.vertexTangents===d&&y.morphTargets===f&&y.morphNormals===p&&y.morphColors===m&&y.toneMapping===h?y.morphTargetsCount!==_&&(S=!0):S=!0:S=!0:S=!0:(S=!0,y.__version=i.version);let C=y.currentProgram;S===!0&&(C=at(i,n,a));let w=!1,T=!1,E=!1,A=C.getUniforms(),j=y.uniforms;if(z.useProgram(C.program)&&(w=!0,T=!0,E=!0),i.id!==O&&(O=i.id,T=!0),w||k!==t){z.buffers.depth.getReversed()&&t.reversedDepth!==!0&&(t._reversedDepth=!0,t.updateProjectionMatrix()),A.setValue(R,`projectionMatrix`,t.projectionMatrix),A.setValue(R,`viewMatrix`,t.matrixWorldInverse);let e=A.map.cameraPosition;e!==void 0&&e.setValue(R,de.setFromMatrixPosition(t.matrixWorld)),be.logarithmicDepthBuffer&&A.setValue(R,`logDepthBufFC`,2/(Math.log(t.far+1)/Math.LN2)),(i.isMeshPhongMaterial||i.isMeshToonMaterial||i.isMeshLambertMaterial||i.isMeshBasicMaterial||i.isMeshStandardMaterial||i.isShaderMaterial)&&A.setValue(R,`isOrthographic`,t.isOrthographicCamera===!0),k!==t&&(k=t,T=!0,E=!0)}if(a.isSkinnedMesh){A.setOptional(R,a,`bindMatrix`),A.setOptional(R,a,`bindMatrixInverse`);let e=a.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),A.setValue(R,`boneTexture`,e.boneTexture,H))}a.isBatchedMesh&&(A.setOptional(R,a,`batchingTexture`),A.setValue(R,`batchingTexture`,a._matricesTexture,H),A.setOptional(R,a,`batchingIdTexture`),A.setValue(R,`batchingIdTexture`,a._indirectTexture,H),A.setOptional(R,a,`batchingColorTexture`),a._colorsTexture!==null&&A.setValue(R,`batchingColorTexture`,a._colorsTexture,H));let M=r.morphAttributes;if((M.position!==void 0||M.normal!==void 0||M.color!==void 0)&&Pe.update(a,r,C),(T||y.receiveShadow!==a.receiveShadow)&&(y.receiveShadow=a.receiveShadow,A.setValue(R,`receiveShadow`,a.receiveShadow)),i.isMeshGouraudMaterial&&i.envMap!==null&&(j.envMap.value=l,j.flipEnvMap.value=l.isCubeTexture&&l.isRenderTargetTexture===!1?-1:1),i.isMeshStandardMaterial&&i.envMap===null&&n.environment!==null&&(j.envMapIntensity.value=n.environmentIntensity),T&&(A.setValue(R,`toneMappingExposure`,x.toneMappingExposure),y.needsLights&&ut(j,E),o&&i.fog===!0&&Oe.refreshFogUniforms(j,o),Oe.refreshMaterialUniforms(j,i,ne,te,v.state.transmissionRenderTarget[t.id]),Gr.upload(R,ot(y),j,H)),i.isShaderMaterial&&i.uniformsNeedUpdate===!0&&(Gr.upload(R,ot(y),j,H),i.uniformsNeedUpdate=!1),i.isSpriteMaterial&&A.setValue(R,`center`,a.center),A.setValue(R,`modelViewMatrix`,a.modelViewMatrix),A.setValue(R,`normalMatrix`,a.normalMatrix),A.setValue(R,`modelMatrix`,a.matrixWorld),i.isShaderMaterial||i.isRawShaderMaterial){let e=i.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];ze.update(n,C),ze.bind(n,C)}}return C}function ut(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function dt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(e,t,n){let r=V.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),V.get(e.texture).__webglTexture=t,V.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=V.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let ft=R.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){D=e,C=t,T=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=V.get(e);if(s.__useDefaultFramebuffer!==void 0)z.bindFramebuffer(R.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)H.setupRenderTarget(e);else if(s.__hasExternalTextures)H.rebindTextures(e,V.get(e.texture).__webglTexture,V.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&V.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);H.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=V.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&H.useMultisampledRTT(e)===!1?V.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,j.copy(e.viewport),M.copy(e.scissor),N=e.scissorTest}else j.copy(ie).multiplyScalar(ne).floor(),M.copy(ae).multiplyScalar(ne).floor(),N=oe;if(n!==0&&(i=ft),z.bindFramebuffer(R.FRAMEBUFFER,i)&&r&&z.drawBuffers(e,i),z.viewport(j),z.scissor(M),z.setScissorTest(N),a){let r=V.get(e.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=V.get(e.textures[t]);R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=V.get(e.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,t.__webglTexture,n)}O=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=V.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){z.bindFramebuffer(R.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!be.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!be.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+s),R.readPixels(t,n,r,i,Le.convert(c),Le.convert(l),a))}finally{let e=D===null?null:V.get(D).__webglFramebuffer;z.bindFramebuffer(R.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=V.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){z.bindFramebuffer(R.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!be.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!be.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,d),R.bufferData(R.PIXEL_PACK_BUFFER,a.byteLength,R.STREAM_READ),e.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+s),R.readPixels(t,n,r,i,Le.convert(l),Le.convert(u),0);let f=D===null?null:V.get(D).__webglFramebuffer;z.bindFramebuffer(R.FRAMEBUFFER,f);let p=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await lt(R,p,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,d),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,a),R.deleteBuffer(d),R.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;H.setTexture2D(e,0),R.copyTexSubImage2D(R.TEXTURE_2D,n,0,0,o,s,i,a),z.unbindTexture()};let pt=R.createFramebuffer(),mt=R.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(Se(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Le.convert(t.format),_=Le.convert(t.type),v;t.isData3DTexture?(H.setTexture3D(t,0),v=R.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(H.setTexture2DArray(t,0),v=R.TEXTURE_2D_ARRAY):(H.setTexture2D(t,0),v=R.TEXTURE_2D),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,t.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,t.unpackAlignment);let y=R.getParameter(R.UNPACK_ROW_LENGTH),b=R.getParameter(R.UNPACK_IMAGE_HEIGHT),x=R.getParameter(R.UNPACK_SKIP_PIXELS),S=R.getParameter(R.UNPACK_SKIP_ROWS),C=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,h.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,h.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,l),R.pixelStorei(R.UNPACK_SKIP_ROWS,u),R.pixelStorei(R.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=V.get(e),r=V.get(t),h=V.get(n.__renderTarget),g=V.get(r.__renderTarget);z.bindFramebuffer(R.READ_FRAMEBUFFER,h.__webglFramebuffer),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,V.get(e).__webglTexture,i,d+n),R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,V.get(t).__webglTexture,a,m+n)),R.blitFramebuffer(l,u,o,s,f,p,o,s,R.DEPTH_BUFFER_BIT,R.NEAREST);z.bindFramebuffer(R.READ_FRAMEBUFFER,null),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||V.has(e)){let n=V.get(e),r=V.get(t);z.bindFramebuffer(R.READ_FRAMEBUFFER,pt),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,mt);for(let e=0;e<c;e++)w?R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):R.framebufferTexture2D(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,n.__webglTexture,i),T?R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):R.framebufferTexture2D(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,r.__webglTexture,a),i===0?T?R.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):R.copyTexSubImage2D(v,a,f,p,l,u,o,s):R.blitFramebuffer(l,u,o,s,f,p,o,s,R.COLOR_BUFFER_BIT,R.NEAREST);z.bindFramebuffer(R.READ_FRAMEBUFFER,null),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?R.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?R.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):R.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):R.texSubImage2D(R.TEXTURE_2D,a,f,p,o,s,g,_,h);R.pixelStorei(R.UNPACK_ROW_LENGTH,y),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,b),R.pixelStorei(R.UNPACK_SKIP_PIXELS,x),R.pixelStorei(R.UNPACK_SKIP_ROWS,S),R.pixelStorei(R.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&R.generateMipmap(v),z.unbindTexture()},this.initRenderTarget=function(e){V.get(e).__webglFramebuffer===void 0&&H.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?H.setTextureCube(e,0):e.isData3DTexture?H.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?H.setTexture2DArray(e,0):H.setTexture2D(e,0),z.unbindTexture()},this.resetState=function(){C=0,T=0,D=null,z.reset(),Re.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return fe}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=et._getDrawingBufferColorSpace(e),t.unpackColorSpace=et._getUnpackColorSpace()}};function ta(e,t){let n=e.getIndex(),r=e.getAttribute(`position`);if(!n)return[na(e)];e.boundingBox||e.computeBoundingBox();let i=e.boundingBox;if(Math.floor(i.min.x/t)===Math.ceil(i.max.x/t)-1&&Math.floor(i.min.z/t)===Math.ceil(i.max.z/t)-1)return[na(e)];let a=new Map;for(let e=0;e<n.count;e+=3){let i=n.getX(e),o=n.getX(e+1),s=n.getX(e+2),c=(r.getX(i)+r.getX(o)+r.getX(s))/3,l=(r.getZ(i)+r.getZ(o)+r.getZ(s))/3,u=`${Math.floor(c/t)},${Math.floor(l/t)}`,d=a.get(u);d||a.set(u,d=[]),d.push(i,o,s)}if(a.size<=1)return[na(e)];let o=Object.keys(e.attributes),s=[];for(let t of a.values()){let n=new Map,r=[],i=t.map(e=>{let t=n.get(e);return t===void 0&&(t=r.length,n.set(e,t),r.push(e)),t}),a=new We;for(let t of o){let n=e.getAttribute(t),i=n.itemSize,o=new n.array.constructor(r.length*i);r.forEach((e,t)=>{for(let r=0;r<i;r++)o[t*i+r]=n.array[e*i+r]}),a.setAttribute(t,new U(o,i,n.normalized))}a.setIndex(r.length>65535?new h(i,1):new F(i,1)),a.userData={...e.userData},s.push(na(a))}return e.dispose(),s}function na(e){return e.computeBoundingSphere(),e.boundingSphere.radius+=5,e}var ra=1<<21,ia=1<<22,aa=32768,oa=65536,sa=class{free;constructor(e){this.free=[[0,e]]}take(e){for(let t=0;t<this.free.length;t++){let n=this.free[t];if(n[1]<e)continue;let r=n[0];return n[1]===e?this.free.splice(t,1):(n[0]+=e,n[1]-=e),r}return-1}give(e,t){let n=0;for(;n<this.free.length&&this.free[n][0]<e;)n++;this.free.splice(n,0,[e,t]);let r=this.free[n+1];r&&e+t===r[0]&&(this.free[n][1]+=r[1],this.free.splice(n+1,1));let i=this.free[n-1];i&&i[0]+i[1]===e&&(i[1]+=this.free[n][1],this.free.splice(n,1))}end(e){let t=this.free.at(-1);return t&&t[0]+t[1]===e?t[0]:e}resize(e,t){if(t>e){this.give(e,t-e);return}let n=this.free.at(-1);t!==e&&n&&(n[1]=t-n[0],n[1]||this.free.pop())}},ca=class e{geometry;index;vertexCap;indexCap;vertices;indices;proxies=new Map;slots=new Set;drawn=!1;snug=!1;layout;constructor(t,n,r,i){this.layout=t,this.vertexCap=r,this.indexCap=i,this.vertices=new sa(r),this.indices=new sa(i),this.index=new Uint32Array(i),this.geometry=e.buffers(n,r,this.index)}static buffers(e,t,n){let r=new We;for(let[n,i]of Object.entries(e.attributes)){let e=i.array.constructor,a=new e(t*i.itemSize);a.set(i.array.subarray(0,Math.min(i.array.length,a.length))),r.setAttribute(n,new U(a,i.itemSize,i.normalized))}return r.setIndex(new U(n,1)),r.boundingSphere=new l(new w,1/0),r.boundingBox=new q(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0)),r}trim(){let e=(e,t)=>Math.min(t,Math.max(1,Math.ceil(e*1.125))),t=e(this.vertices.end(this.vertexCap),this.vertexCap),n=e(this.indices.end(this.indexCap),this.indexCap);(t<this.vertexCap||n<this.indexCap)&&this.resize(t,n),this.snug=!0}resize(t,n){let r=this.geometry,i=new Uint32Array(n);i.set(this.index.subarray(0,n)),this.geometry=e.buffers(r,t,i),this.index=i;for(let e of this.slots)for(let t of e.parts){let n=this.geometry.getAttribute(t.name),r=n.itemSize,i=n.array.subarray(e.vertex*r,(e.vertex+e.vertices)*r);t.own.array===t.view&&(t.own.array=i),t.into=n,t.view=i}this.vertices.resize(this.vertexCap,t),this.indices.resize(this.indexCap,n),this.vertexCap=t,this.indexCap=n,this.snug=!1;for(let e of this.proxies.values())for(let t of e.values())t.geometry=this.geometry;r.dispose()}take(e,t){let n=this.vertices.take(e);if(n<0)return[-1,-1];let r=this.indices.take(t);return r<0?(this.vertices.give(n,e),[-1,-1]):[n,r]}grow(e,t){let n=this.drawn?1.25:2,r=(e,t,r,i)=>e>=t&&r+i>e?-1:Math.min(t,Math.max(Math.ceil(e*n),r+i)),i=r(this.vertexCap,ra,this.vertices.end(this.vertexCap),e),a=r(this.indexCap,ia,this.indices.end(this.indexCap),t);return i<0||a<0||this.vertices.end(this.vertexCap)+e>i||this.indices.end(this.indexCap)+t>a?!1:(this.resize(Math.max(i,this.vertexCap),Math.max(a,this.indexCap)),!0)}proxy(e,t){let n=this.proxies.get(e);n||this.proxies.set(e,n=new Map);let r=n.get(t);return r||(r=Object.assign(new ut(this.geometry,e),{isBatchedMesh:!0,_multiDrawStarts:new Int32Array(16),_multiDrawCounts:new Int32Array(16),_multiDrawCount:0,_multiDrawInstances:null,_matricesTexture:null,_indirectTexture:null,_colorsTexture:null,colorTexture:null}),r.frustumCulled=!1,r.renderOrder=t,r.matrixAutoUpdate=!1,r.matrixWorldAutoUpdate=!1,n.set(t,r)),r}dispose(){this.geometry.dispose()}},la=class{pages=new Map;slots=new Map;pooled=new WeakSet;twins=new Map;hidden=[];shown=[];lists=new Map;frustum=new n;screen=new $e;centre=new J;enabled;constructor(e){this.enabled=e}hook(e){e.onBeforeRender=(t,n,r)=>this.before(e,r),e.onAfterRender=()=>this.after(e)}add(e){if(this.slots.has(e)||!ua(e))return!1;let t=e.getIndex(),n=Object.entries(e.attributes);for(let[,e]of n)if(e.isInterleavedBufferAttribute||this.pooled.has(e))return!1;let r=n[0][1].count,i=t.count;if(n.some(([,e])=>e.count!==r))return!1;let a=n.map(([e,t])=>`${e}:${t.itemSize}:${t.array.constructor.name}:${+!!t.normalized}`).sort().join(`,`),o=this.pages.get(a)??[];this.pages.set(a,o);let s,c=-1,l=-1;for(let e of o)if([c,l]=e.take(r,i),c>=0){s=e;break}let u=o.at(-1);!s&&u?.grow(r,i)&&([c,l]=u.take(r,i),c>=0&&(s=u)),s||(s=new ca(a,e,Math.max(aa,r),Math.max(oa,i)),o.push(s),[c,l]=s.take(r,i));let d={geometry:e,page:s,vertex:c,vertices:r,first:l,count:i,parts:[],index:t,indexArray:t.array,indexVersion:t.version,indexTaken:!1};for(let[e,t]of n){let n=s.geometry.getAttribute(e),i=t.itemSize,a=n.array.subarray(c*i,(c+r)*i);a.set(t.array),t.array=a,n.addUpdateRange(c*i,r*i),n.needsUpdate=!0,d.parts.push({name:e,own:t,into:n,version:t.version,view:a,taken:!1}),this.pooled.add(t)}return this.sendIndex(d),s.slots.add(d),this.slots.set(e,d),!0}remove(e,t=!0){let n=this.slots.get(e);if(!n)return;this.slots.delete(e);for(let e of n.parts)e.taken&&e.own.clearUpdateRanges(),this.pooled.delete(e.own);if(t){let t=new Set(n.parts.map(e=>e.view.buffer));for(let r of[...n.parts.map(e=>e.own),...Object.values(e.attributes)])t.has(r.array.buffer)&&(r.array=r.array.slice())}n.indexTaken&&n.index.clearUpdateRanges();let r=n.page;if(r.vertices.give(n.vertex,n.vertices),r.indices.give(n.first,n.count),r.slots.delete(n),r.slots.size)return;let i=this.pages.get(r.layout);i.splice(i.indexOf(r),1),i.length||this.pages.delete(r.layout),r.dispose()}sendIndex(e){let t=e.index.array,n=e.page;for(let r=0;r<e.count;r++)n.index[e.first+r]=t[r]+e.vertex;let r=n.geometry.getIndex();r.addUpdateRange(e.first,e.count),r.needsUpdate=!0}sync(){for(let e of this.slots.values()){let t=e.geometry;if(!ua(t)||t.index!==e.index||e.index.array!==e.indexArray||Object.keys(t.attributes).length!==e.parts.length||e.parts.some(e=>t.attributes[e.name]!==e.own||e.own.array!==e.view)){this.remove(t);continue}for(let t of e.parts){let n=t.own;n.version!==t.version&&(t.version=n.version,t.into.addUpdateRange(e.vertex*n.itemSize,e.vertices*n.itemSize),t.into.needsUpdate=!0,n.clearUpdateRanges(),t.taken=!0)}e.index.version!==e.indexVersion&&(e.indexVersion=e.index.version,this.sendIndex(e),e.index.clearUpdateRanges(),e.indexTaken=!0)}}twinOf(e){let t=this.twins.get(e);if(!t){let n=Object.create(e);n._listeners={},this.twins.set(e,t=n);let r=()=>{e.removeEventListener(`dispose`,r),this.twins.delete(e);for(let e of this.pages.values())for(let t of e)t.proxies.delete(n);n.dispose()};e.addEventListener(`dispose`,r)}return t}alone(){for(let e of this.slots.values()){for(let t of e.parts)t.taken&&t.own.clearUpdateRanges();e.indexTaken&&e.index.clearUpdateRanges()}}before(e,t){if(!this.enabled()){this.alone();return}if(this.slots.size){this.sync();for(let e of this.pages.values())for(let t of e)!t.drawn&&!t.snug&&t.trim();if(this.screen.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this.frustum.setFromProjectionMatrix(this.screen,fe,t.reversedDepth),this.collect(e,t),this.lists.size){for(let[t,n]of this.lists){n.sort((e,t)=>e.z-t.z||e.id-t.id);let r=t._multiDrawStarts,i=t._multiDrawCounts;r.length<n.length&&(t._multiDrawStarts=r=new Int32Array(n.length*2),t._multiDrawCounts=i=new Int32Array(n.length*2)),n.forEach((e,t)=>{r[t]=e.slot.first*4,i[t]=e.slot.count}),t._multiDrawCount=n.length,n[0].slot.page.drawn=!0,this.shown.push(t),e.add(t)}this.lists.clear()}}}collect(e,t){for(let n of e.children){if(!n.visible)continue;let e=n,r=e.isMesh?this.slots.get(e.geometry):void 0,i=e.material;if(!r||n.children.length||!i.isShaderMaterial||i.wireframe||n.layers.mask!==1||!da(n.matrixWorld)){n.children.length&&this.collect(n,t);continue}if(n.visible=!1,this.hidden.push(n),!n.layers.test(t.layers)||n.frustumCulled&&!this.frustum.intersectsObject(n))continue;e.geometry.boundingSphere||e.geometry.computeBoundingSphere();let a=e.geometry.boundingSphere,o=this.centre.set(a.center.x,a.center.y,a.center.z,1).applyMatrix4(this.screen).z,s=r.page.proxy(this.twinOf(i),n.renderOrder),c=this.lists.get(s);c||this.lists.set(s,c=[]),c.push({slot:r,z:o,id:n.id})}}after(e){for(let e of this.hidden)e.visible=!0;this.hidden.length=0;for(let t of this.shown)e.remove(t);this.shown.length=0}};function ua(e){return!!e.index&&Object.keys(e.attributes).length>0&&!e.groups.length&&!Object.keys(e.morphAttributes).length&&e.drawRange.start===0&&e.drawRange.count===1/0}function da(e){let t=e.elements;return t[0]===1&&t[5]===1&&t[10]===1&&t[15]===1&&t[1]===0&&t[2]===0&&t[3]===0&&t[4]===0&&t[6]===0&&t[7]===0&&t[8]===0&&t[9]===0&&t[11]===0&&t[12]===0&&t[13]===0&&t[14]===0}var fa=G.degToRad(30),pa=40,ma=20,ha=100,ga=class{camera=new Et(-1,1,1,-1,1,400);target=new w;view=0;zoom=32;distance=120;landTop=-1/0;screen={ratio:1,width:1,height:1,canvas:null};yaw=G.degToRad(45);ndc=new w;constructor(e=0,t=32){this.view=e,this.zoom=t,this.yaw=this.goalYaw()}get heading(){return this.yaw}goalYaw(){return G.degToRad(45+90*this.view)}turn(e){this.view=(this.view+e+4)%4}update(e,t=!1){let n=this.goalYaw(),r=n-this.yaw;return r=Math.atan2(Math.sin(r),Math.cos(r)),this.yaw=t||Math.abs(r)<1e-4?n:this.yaw+r*(1-Math.exp(-e*9)),Math.abs(r)>1e-4}backward(){return new w(Math.sin(this.yaw)*Math.cos(fa),Math.sin(fa),Math.cos(this.yaw)*Math.cos(fa))}pan(e,t){let n=new w(Math.cos(this.yaw),0,-Math.sin(this.yaw)),r=new w(-Math.sin(this.yaw),0,-Math.cos(this.yaw));this.target.addScaledVector(n,-e/this.zoom).addScaledVector(r,t/this.zoom/Math.sin(fa))}place(e){this.target.set(e.x,e.y??0,e.z),this.yaw=e.heading,this.view=(Math.round((e.heading-Math.PI/4)/(Math.PI/2))%4+4)%4,this.zoom=e.zoom*this.screen.ratio,this.apply(this.screen.width*this.screen.ratio,this.screen.height*this.screen.ratio)}toScreen(e,t,n){let r=this.ndc.set(e,t,n).project(this.camera),i=this.rect();return{x:i.left+(r.x+1)/2*i.width,y:i.top+(1-r.y)/2*i.height}}rayAt(e,t,n=new tt){let r=this.rect(),i=(e-r.left)/r.width*2-1,a=1-(t-r.top)/r.height*2;return n.origin.set(i,a,-1).unproject(this.camera),n.direction.copy(this.backward()).negate(),n}rect(){return this.screen.canvas?.getBoundingClientRect()??{left:0,top:0,width:this.screen.width,height:this.screen.height}}apply(e,t){let n=e/this.zoom/2,r=t/this.zoom/2,i=this.camera;i.left=-n,i.right=n,i.top=r,i.bottom=-r;let a=r/Math.tan(fa),o=Math.max(pa,this.landTop+ma-this.target.y);this.distance=Math.max(120,(r*Math.cos(fa)+o)/Math.sin(fa)),i.near=1,i.far=Math.max(300,this.distance+a+ha),i.position.copy(this.target).addScaledVector(this.backward(),this.distance),i.up.set(0,1,0),i.lookAt(this.target),i.updateProjectionMatrix(),i.updateMatrixWorld()}},_a=`
uniform sampler2D uCloudMap;
uniform vec4 uCloudRect;     // the map's corner (x, z) and 1 / its side
float cloudMapShade(vec2 xz) { return texture(uCloudMap, (xz - uCloudRect.xy) * uCloudRect.zw).r; }
`,va={height:16,rise:.2,size:256},ya=`
precision highp float;
in vec3 position;
uniform vec4 uCloudRect;
out vec2 vXZ;
void main() {
  vXZ = (position.xy * 0.5 + 0.5) / uCloudRect.zw;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,ba=`
precision highp float;
precision highp int;
${Ae}
in vec2 vXZ;
out vec4 fragColor;
void main() { fragColor = vec4(cloudShadeAt(vXZ), 0.0, 0.0, 1.0); }
`,xa=class{target;material;scene=new L;camera=new Et(-1,1,1,-1,0,1);drawn=``;uniforms;size;constructor(e,t=512){this.uniforms=e,this.size=t,this.target=new ee(t,t,{type:A,format:Ie,depthBuffer:!1,minFilter:de,magFilter:de,generateMipmaps:!1,wrapS:we,wrapT:we}),this.uniforms.uCloudMap.value=this.target.texture,this.material=new ke({glslVersion:K,vertexShader:ya,fragmentShader:ba,depthTest:!1,depthWrite:!1,uniforms:{uCloudRect:this.uniforms.uCloudRect,uCloudShape:{value:new J},uCloudHeavy:{value:new J},uCloudShift:{value:new J},uCloudNorm:{value:new J},uCloudThreshold:{value:new J},uCloudSeed:{value:0}}});let n=new ut(new re(2,2),this.material);n.frustumCulled=!1,this.scene.add(n)}setArea(e,t,n){let r=this.uniforms.uCloudRect.value;(r.x!==e||r.y!==t||r.z!==1/n)&&(r.set(e,t,1/n,1/n),this.drawn=``)}draw(e,t,n=nt){let r=JSON.stringify(t.cover>0&&t.cover<1?[t,n]:[t.cover]);if(r===this.drawn)return;this.drawn=r;let i=this.material.uniforms,a=this.uniforms.uCloudRect.value,{uCloudSeed:o,...s}=Ne(t,n,a.x,a.y);for(let[e,t]of Object.entries(s))i[e].value.fromArray(t);i.uCloudSeed.value=o,e.setRenderTarget(this.target),e.render(this.scene,this.camera)}dispose(){this.target.dispose(),this.material.dispose()}},Sa=[`spring`,`summer`,`autumn`,`winter`],Ca=[`mild`,`wet`,`dry`,`hot`,`gales`,`stormy`,`hard`,`highRiver`],wa={spring:{sunrise:6,sunset:19},summer:{sunrise:5,sunset:21},autumn:{sunrise:7,sunset:18},winter:{sunrise:8,sunset:16}},Ta={spring:45,summer:58,autumn:45,winter:25},Ea={spring:.85,summer:1,autumn:.85,winter:.7},Da=Object.freeze({sunrise:6,noon:12,sunset:20,height:58,arc:1}),Oa=1,ka=2,Aa=4,ja=.5,Ma=23.5;function Na(e){let t=wa[e.season],n=e.sunrise??t.sunrise,r=e.sunset??t.sunset;r===n&&(r=n+t.sunset-t.sunrise);let i=r-n;i>0&&i<=24||(i=(i%24+24)%24);let a=Math.min(Ma,Math.max(ja,i)),o=n+i/2;return Object.freeze({sunrise:o-a/2,noon:o,sunset:o+a/2,height:Ta[e.season],arc:Ea[e.season]})}var Pa=new WeakMap;function Fa(e){let t=Pa.get(e);if(t)return t;let n=Da,r=Math.min(1,(24-(e.sunset-e.sunrise))/Aa),i=Oa*r,a=ka*r;return t=[[n.sunrise-Oa,e.sunrise-i],[n.sunrise,e.sunrise],[n.noon,e.noon],[n.sunset,e.sunset],[n.sunset+ka,e.sunset+a],[n.sunrise-Oa+24,e.sunrise-i+24]],Pa.set(e,t),t}var Ia=(e,t)=>t+((e-t)%24+24)%24;function La(e,t,n){let r=Fa(t),i=1-n,a=Ia(e,r[0][n]),o=0;for(;o<r.length-2&&a>=r[o+1][n];)o++;let s=(a-r[o][n])/(r[o+1][n]-r[o][n]);return((r[o][i]+(r[o+1][i]-r[o][i])*s)%24+24)%24}var Ra=(e,t)=>La(e,t,1),za=(e,t)=>La(e,t,0),Ba=[{hour:5,sunAz:80,sunEl:-6,sunColor:6122152,skyColor:8160968,rimColor:9207496,hazeColor:7173296,skyTop:2897264,skyBottom:9076664,shadeHue:285,shadeLean:.55,shadeDepth:.42,litHue:280,litLean:.2,hazeDensity:.03,hazeFloor:.14,hazeMax:.55,exposure:.75,saturation:.9,cloudDim:.6,cloudHaze:.85,night:.7,nightShift:.7},{hour:7,sunAz:95,sunEl:10,sunColor:16762255,skyColor:11122918,rimColor:16756848,hazeColor:13157340,skyTop:7312854,skyBottom:15976870,shadeHue:270,shadeLean:.45,shadeDepth:.36,litHue:70,litLean:.18,hazeDensity:.03,hazeFloor:.1,hazeMax:.5,exposure:1,saturation:1.05,cloudDim:.8,cloudHaze:.85,night:0,nightShift:0},{hour:12,sunAz:115,sunEl:58,sunColor:16774364,skyColor:11850994,rimColor:16769162,hazeColor:12573935,skyTop:5215712,skyBottom:13625076,shadeHue:215,shadeLean:.4,shadeDepth:.3,litHue:95,litLean:.05,hazeDensity:.022,hazeFloor:.03,hazeMax:.45,exposure:1,saturation:1,cloudDim:1,cloudHaze:.85,night:0,nightShift:0},{hour:17.5,sunAz:215,sunEl:16,sunColor:16757864,skyColor:11053280,rimColor:16754248,hazeColor:15909538,skyTop:7114710,skyBottom:16173728,shadeHue:275,shadeLean:.6,shadeDepth:.34,litHue:60,litLean:.2,hazeDensity:.026,hazeFloor:.08,hazeMax:.5,exposure:1,saturation:1,cloudDim:.75,cloudHaze:.4,night:0,nightShift:0},{hour:19.5,sunAz:240,sunEl:2,sunColor:16748394,skyColor:9406152,rimColor:16743002,hazeColor:14131112,skyTop:4938408,skyBottom:16097416,shadeHue:295,shadeLean:.55,shadeDepth:.4,litHue:45,litLean:.35,hazeDensity:.03,hazeFloor:.1,hazeMax:.55,exposure:.9,saturation:1.1,cloudDim:.5,cloudHaze:.4,night:0,nightShift:0},{hour:22,sunAz:260,sunEl:35,sunColor:9608923,skyColor:6318504,rimColor:8231648,hazeColor:4343928,skyTop:1317436,skyBottom:3095154,shadeHue:275,shadeLean:.65,shadeDepth:.5,litHue:255,litLean:.5,hazeDensity:.03,hazeFloor:.14,hazeMax:.5,exposure:.55,saturation:.82,cloudDim:.5,cloudHaze:.85,night:1,nightShift:1}],Va=Ba.find(e=>e.hour===Da.noon),Ha={Dawn:7,Noon:12,"Golden hour":17.5,Sunset:19.5,Night:22};function Ua(e){return Object.fromEntries(Object.entries(Ha).map(([t,n])=>[t,za(n,e)]))}var Wa=(e,t,n)=>e+(t-e)*n,Ga=(e,t,n)=>e+((t-e+540)%360-180)*n,Ka=(e,t,n)=>new W(e).lerp(new W(t),n);function qa(e,t=Da){let n=(e%24+24)%24,r=Ja(t===Da?n:Ra(n,t));if(r.hour=n,t.height!==Da.height||t.arc!==Da.arc){let e=1-r.night;if(r.sunEl>0){let n=((Va.sunEl/t.height)**2-1)/Va.sunEl**2;r.sunEl=Wa(r.sunEl,r.sunEl/Math.sqrt(1+n*r.sunEl*r.sunEl),e)}r.sunAz=Va.sunAz+((r.sunAz-Va.sunAz+540)%360-180)*Wa(1,t.arc,e)}return r}function Ja(e){let t=(e%24+24)%24,n=[{...Ba[Ba.length-1],hour:Ba[Ba.length-1].hour-24},...Ba,{...Ba[0],hour:Ba[0].hour+24}],r=0;for(;r<n.length-2&&t>=n[r+1].hour;)r++;let i=n[r],a=n[r+1],o=(t-i.hour)/(a.hour-i.hour),s=o*o*(3-2*o);return{hour:t,sunAz:Ga(i.sunAz,a.sunAz,s),sunEl:Wa(i.sunEl,a.sunEl,s),dayEl:Wa(i.sunEl,a.sunEl,s),sunColor:Ka(i.sunColor,a.sunColor,s),skyColor:Ka(i.skyColor,a.skyColor,s),rimColor:Ka(i.rimColor,a.rimColor,s),hazeColor:Ka(i.hazeColor,a.hazeColor,s),skyTop:Ka(i.skyTop,a.skyTop,s),skyBottom:Ka(i.skyBottom,a.skyBottom,s),shadeHue:Ga(i.shadeHue,a.shadeHue,s),shadeLean:Wa(i.shadeLean,a.shadeLean,s),shadeDepth:Wa(i.shadeDepth,a.shadeDepth,s),litHue:Ga(i.litHue,a.litHue,s),litLean:Wa(i.litLean,a.litLean,s),hazeDensity:Wa(i.hazeDensity,a.hazeDensity,s),hazeMax:Wa(i.hazeMax,a.hazeMax,s),hazeFloor:Wa(i.hazeFloor,a.hazeFloor,s),exposure:Wa(i.exposure,a.exposure,s),saturation:Wa(i.saturation,a.saturation,s),cloudDim:Wa(i.cloudDim,a.cloudDim,s),cloudHaze:Wa(i.cloudHaze,a.cloudHaze,s),night:Wa(i.night,a.night,s),nightShift:Wa(i.nightShift,a.nightShift,s)}}var Ya={shift:0,chroma:1,light:0},Xa={sun:[1,1,1],sky:[1,1,1],haze:[1,1,1],shadeHue:215,shadeTurn:0,shadeDepth:0,litLean:1,hazeDensity:1,saturation:1},Za={spring:{shift:9,chroma:1.13,light:.015},summer:Ya,autumn:{shift:-19,chroma:.7,light:-.03},winter:{shift:-30,chroma:.52,light:.02}},Qa={spring:{...Xa,sun:[.99,1,1.02],haze:[.97,1,1.02],shadeHue:205,shadeTurn:.15,hazeDensity:.85,saturation:1.03},summer:{...Xa,sun:[1.02,1,.97],haze:[1.03,1,.95],litLean:1.15,hazeDensity:1.1},autumn:{...Xa,sun:[1.04,.99,.9],haze:[1.05,.99,.9],shadeHue:285,shadeTurn:.15,litLean:1.3,hazeDensity:1.15},winter:{...Xa,sun:[.96,.99,1.06],sky:[.96,.99,1.06],haze:[.95,.99,1.07],shadeHue:255,shadeTurn:.3,shadeDepth:.02,litLean:.6,saturation:.94}};function $a(e,t,n){let r=t=>({shift:e.shift-22*t,chroma:e.chroma*(1-.2*t),light:e.light+.04*t});switch(n){case`dry`:return r(t===`summer`?1:.5);case`hot`:return r(t===`summer`?.75:.4);case`wet`:return{shift:e.shift*.6+4,chroma:e.chroma*1.1,light:e.light-.015};case`hard`:return{...e,chroma:e.chroma*.8,light:e.light+.03};case`mild`:return{shift:e.shift*.6,chroma:1+(e.chroma-1)*.6,light:e.light*.6};default:return e}}function eo(e){return e?$a(Za[e.season],e.season,e.character):Ya}var to=G.smoothstep,no=Math.PI/180,ro=e=>to(e,100,114)*(1-to(e,195,220));function io(e,t,n){let r=n.shift===0&&n.chroma===1&&n.light===0,i=NaN,a=NaN,o=NaN,s=0,c=0,l=0;for(let u=0;u<e.length;u+=3){let d=e[u],f=e[u+1],p=e[u+2];if(r){t[u]=d,t[u+1]=f,t[u+2]=p;continue}if(d===i&&f===a&&p===o){t[u]=s,t[u+1]=c,t[u+2]=l;continue}i=d,a=f,o=p;let m=Math.cbrt(.4122214708*d+.5363325363*f+.0514459929*p),h=Math.cbrt(.2119034982*d+.6806995451*f+.1073969566*p),g=Math.cbrt(.0883024619*d+.2817188376*f+.6299787005*p),_=.2104542553*m+.793617785*h-.0040720468*g,v=1.9779984951*m-2.428592205*h+.4505937099*g,y=.0259040371*m+.7827717662*h-.808675766*g,b=Math.hypot(v,y),x=Math.atan2(y,v)/no;x<0&&(x+=360);let S=ro(x)*to(b,.02,.06);if(S<=0){t[u]=s=d,t[u+1]=c=f,t[u+2]=l=p;continue}x+=n.shift*S*(n.shift>0?1-to(x,140,172):1),b*=1+(n.chroma-1)*S,_+=n.light*S;let C=b*Math.cos(x*no),w=b*Math.sin(x*no),T=(_+.3963377774*C+.2158037573*w)**3,E=(_-.1055613458*C-.0638541728*w)**3,D=(_-.0894841775*C-1.291485548*w)**3;t[u]=s=Math.max(0,4.0767416621*T-3.3077115913*E+.2309699292*D),t[u+1]=c=Math.max(0,-1.2684380046*T+2.6097574011*E-.3413193965*D),t[u+2]=l=Math.max(0,-.0041960863*T-.7034186147*E+1.707614701*D)}}var ao=(e,t,n)=>e.setRGB(e.r*(1+(t[0]-1)*n),e.g*(1+(t[1]-1)*n),e.b*(1+(t[2]-1)*n)),oo=(e,t,n)=>e+(((t-e)%360+540)%360-180)*n;function so(e,t){if(!t)return e;let n=Qa[t.season],r=1-e.night;return r<=0?e:(ao(e.sunColor,n.sun,r),ao(e.rimColor,n.sun,r),ao(e.skyColor,n.sky,r),ao(e.hazeColor,n.haze,r),ao(e.skyTop,n.sky,r),ao(e.skyBottom,n.haze,r),e.shadeHue=oo(e.shadeHue,n.shadeHue,n.shadeTurn*r),e.shadeDepth+=n.shadeDepth*r,e.litLean*=1+(n.litLean-1)*r,e.hazeDensity*=1+(n.hazeDensity-1)*r,e.saturation*=1+(n.saturation-1)*r,e)}var co={spring:[10145109,8896326,13098106,16049884,15646920],summer:null,autumn:[13935406,13201450,10698026,10135614,12094010,12618292],winter:[9071434,7363138,10520934]},lo={sky:1,shadowFade:.4,shadowLift:1,shadowBlur:4,contrast:.78,litLean:.04,skyChroma:.8,shadeHue:270,shadeTurn:.8,rim:.04,hazeDensity:.5,hazeFloor:.5,exposure:.7,saturation:1},uo={contrast:.88,saturation:1.03,hazeDensity:.7,hazeFloor:.6,exposure:.43},fo=(e,t,n)=>e+(t-e)*n,po=(e,t,n)=>e+((t-e+540)%360-180)*n,mo=e=>.2126*e.r+.7152*e.g+.0722*e.b,ho=e=>e.clone().multiplyScalar(1/Math.max(e.r,e.g,e.b,.001));function go(e,t){let n=mo(e);return new W(fo(n,e.r,t),fo(n,e.g,t),fo(n,e.b,t))}var _o=e=>e*e,vo=e=>{let t=Math.min(1,Math.max(0,(e-.85)/.15));return t*t*(3-2*t)},yo=.8,bo=.4,xo=.65;function So(e,t,n){if(t<=0)return e;let r=t,i=e.night,a=go(ho(e.skyColor),n.skyChroma),o=a.clone().multiplyScalar(mo(e.hazeColor)/Math.max(mo(a),.001)),s=fo(n.exposure*e.cloudDim,uo.exposure,i)**(r*(1.5-.5*r));return{...e,sunColor:ho(e.sunColor).lerp(a,r*.98).multiplyScalar(fo(Math.max(e.sunColor.r,e.sunColor.g,e.sunColor.b),1,r)),rimColor:e.rimColor.clone().multiplyScalar(fo(1,n.rim,r)),hazeColor:e.hazeColor.clone().lerp(o,r*e.cloudHaze),skyTop:e.skyTop.clone().lerp(go(e.skyTop,.4),r),skyBottom:e.skyBottom.clone().lerp(go(e.skyBottom,.4),r),shadeHue:po(e.shadeHue,n.shadeHue,r*n.shadeTurn),shadeDepth:e.shadeDepth*fo(1,fo(n.contrast,uo.contrast,i),r),litLean:e.litLean*fo(1,n.litLean,r),hazeDensity:e.hazeDensity*fo(1,fo(n.hazeDensity,uo.hazeDensity,i),r),hazeFloor:e.hazeFloor*fo(1,fo(n.hazeFloor,uo.hazeFloor,i),r),exposure:e.exposure*s,saturation:e.saturation*fo(1,fo(n.saturation,uo.saturation,i),r)}}var Co=1.5,wo=.15,To=1.25,Eo=.6,Do=`
uniform sampler2D tWaterA;     // the water as it was (level, flow x, flow z, mud per cell)
uniform sampler2D tWaterB;     // the water as last sent
uniform float uWaterBlend;     // how far it has eased from A to B
uniform vec4 uWaterGrid;       // x0, z0, 1 / cell, 0 with no map
uniform float uWaterHigh;      // the highest the wet surface is, as it was and as last sent
vec4 waterCell(ivec2 c) {
  ivec2 n = textureSize(tWaterA, 0);
  c = clamp(c, ivec2(0), n - 1);
  return mix(texelFetch(tWaterA, c, 0), texelFetch(tWaterB, c, 0), uWaterBlend);
}
// The sheet over a point, on its own triangles (split from the +x cell to the +z one, as WaterField.index lays them):
// per cell, the surface (x), the surface it continues, before its dive (y; the same where it's wet), and its mud (z;
// how far down, negative, where it dives: the water isn't drawn below -HIDDEN_DIVE). Far below everything off the grid
// or with no map.
vec3 waterSheet(vec2 xz) {
  if (uWaterGrid.w < 0.5) return vec3(-1.0e6, -1.0e6, -1.0e6);
  vec2 g = (xz - uWaterGrid.xy) * uWaterGrid.z - 0.5;
  ivec2 n = textureSize(tWaterA, 0);
  // Off the sheet (which reaches the grid's edge, half a cell past the edge cells' centres).
  if (g.x < -0.5 || g.y < -0.5 || g.x > float(n.x) - 0.5 || g.y > float(n.y) - 0.5) return vec3(-1.0e6, -1.0e6, -1.0e6);
  vec2 i = floor(g), f = g - i;
  ivec2 c = ivec2(i);
  vec4 a = waterCell(c), b = waterCell(c + ivec2(1, 0)), d = waterCell(c + ivec2(0, 1)), e = waterCell(c + ivec2(1, 1));
  // Where it dives, its mud is how far down, negative (layWater).
  vec3 va = vec3(a.x, a.x - min(a.w, 0.0), a.w), vb = vec3(b.x, b.x - min(b.w, 0.0), b.w);
  vec3 vd = vec3(d.x, d.x - min(d.w, 0.0), d.w), ve = vec3(e.x, e.x - min(e.w, 0.0), e.w);
  return f.x + f.y < 1.0 ? va + (vb - va) * f.x + (vd - va) * f.y : ve + (vd - ve) * (1.0 - f.x) + (vb - ve) * (1.0 - f.y);
}
// The water's surface over a point, metres, as drawn.
float waterTop(vec2 xz) { return waterSheet(xz).x; }
// The surface of the water nearest a point: as drawn where it's wet, and on dry land the water it's nearest (the surface
// the sheet dives from). What the reflection leaves out is what's under it: a fence standing in a flood isn't mirrored
// below the flood, and nor is a dry hollow lower than the river beside it (mirrored, it would show in the river).
float waterNear(vec2 xz) { return waterSheet(xz).y; }
`;function Oo(e){let{nx:t,nz:n,level:r}=e,i=t*n;if(r.length!==i)throw Error(`water map: ${r.length} levels for ${t} x ${n} cells`);let a=new Float32Array(i*4),o=new Uint8Array(i).fill(255),s=new Float32Array(i),c=new Float32Array(i).fill(-1/0),l=new Int32Array(i),u=new Int32Array(i),d=0;for(let t=0;t<i;t++)Number.isNaN(r[t])||(a[t*4]=r[t],a[t*4+1]=e.flowX?.[t]??0,a[t*4+2]=e.flowZ?.[t]??0,a[t*4+3]=G.clamp(e.mud?.[t]??0,0,1),s[t]=G.clamp(e.ice?.[t]??0,0,1),o[t]=0,c[t]=r[t],l[d++]=t);let f=new Float32Array(d);for(let e=0;e<d;e++)f[e]=r[l[e]];for(let e=1;d&&e<255;e++){let r=0;for(let i=0;i<d;i++){let d=l[i],f=d%t,p=(d-f)/t,m=c[d],h=f>0?-1:0,g=+(f<t-1),_=p>0?-1:0,v=+(p<n-1);for(let n=_;n<=v;n++)for(let i=h;i<=g;i++){let l=d+n*t+i,f=o[l];f<e||(f===255&&(o[l]=e,u[r++]=l),m>c[l]&&(c[l]=m,a[l*4+1]=a[d*4+1],a[l*4+2]=a[d*4+2],a[l*4+3]=a[d*4+3],s[l]=s[d]))}}[l,u]=[u,l],d=r}for(let e=0;e<i;e++){if(o[e]===0)continue;let t=Number.isFinite(c[e])?Math.min(Co*Math.max(0,o[e]-1),4):4;a[e*4]=Number.isFinite(c[e])?c[e]-t:-1e3,t>0&&(a[e*4+3]=-t)}return f.sort((e,t)=>e-t),{data:a,ice:s,shore:Fo(e),dist:o,low:f[0]??0,high:f[f.length-1]??0,mid:f.length?f[f.length>>1]:null}}var ko=class{geometry=null;a=No(1,1);b=No(1,1);iceA=No(1,1);iceB=No(1,1);iced=!1;thaw=new Float32Array(1);iceTurn=new Float32Array(1);toIced=!1;grid=new J(0,0,1,0);mirror=0;low=0;high=0;wetLow=0;wetHigh=0;any=!1;get shownLow(){return this.wetLow-To}floor=null;nx=0;nz=0;cell=1;x0=0;z0=0;from=null;to=null;start=0;ease=0;version=0;shown=null;blend(e){if(this.ease<=0)return 1;let t=G.clamp((e-this.start)/this.ease,0,1);return t*t*(3-2*t)}settle(e){return this.iced&&!this.toIced&&this.blend(e)>=1&&(this.iced=!1),!this.any||!this.to||this.to.mid!==null||this.blend(e)<1?!1:(this.any=!1,!0)}set(e,t,n=Eo){if(!e){this.any=!1,this.iced=this.toIced=!1,this.from=this.to=null,this.grid.w=0,this.floor=null;return}let r=Oo(e),i=this.geometry&&this.to&&e.nx===this.nx&&e.nz===this.nz&&e.cell===this.cell&&e.x0===this.x0&&e.z0===this.z0;if(!i)this.nx=e.nx,this.nz=e.nz,this.cell=e.cell,this.x0=e.x0,this.z0=e.z0,this.build(),this.from=r,n=0;else{let e=this.blend(t),n=this.from,r=this.to,i=new Float32Array(n.data.length);for(let t=0;t<i.length;t++)i[t]=n.data[t]+(r.data[t]-n.data[t])*e;let a=new Uint8Array(n.dist.length);for(let t=0;t<a.length;t++)a[t]=e<1?Math.min(n.dist[t],r.dist[t]):r.dist[t];let o=new Float32Array(n.ice.length),s=new Float32Array(n.shore.length);for(let t=0;t<o.length;t++)o[t]=n.ice[t]+(r.ice[t]-n.ice[t])*e;for(let t=0;t<s.length;t++)s[t]=n.shore[t]+(r.shore[t]-n.shore[t])*e;let c=(e<1?[n,r]:[r]).filter(e=>e.mid!==null);this.from={data:i,ice:o,shore:s,dist:a,low:Math.min(...c.map(e=>e.low)),high:Math.max(...c.map(e=>e.high)),mid:c.length?r.mid??n.mid:null}}n>0&&r.mid===null&&this.from.mid!==null?this.to={...r,data:Io(this.from.data),shore:this.from.shore}:(n>0&&r.mid!==null&&this.from.mid===null&&(this.from={...this.from,data:Io(r.data)}),this.to=r),this.start=t,this.ease=n,this.upload(this.a,this.from.data),this.upload(this.b,this.to.data);let a=this.thaw,o=this.iceTurn,s=this.from.ice,c=this.to.ice;i||o.set(c);let l=!1,u=!1;for(let e=0;e<a.length;e++){let t=c[e];a[e]>.5?t>o[e]+1e-4?(a[e]=0,o[e]=t):o[e]=Math.min(o[e],t):t<o[e]-1e-4?(a[e]=1,o[e]=t):o[e]=Math.max(o[e],t),t>0&&(l=!0),s[e]>0&&(u=!0)}this.toIced=l,this.iced=l||n>0&&u,this.upload(this.iceA,Po(s,a,this.from.shore)),this.upload(this.iceB,Po(c,a,this.to.shore)),this.grid.set(this.x0,this.z0,1/this.cell,1),this.mirror=r.mid??this.from.mid??0,this.floor=r.mid===null?null:r.low,this.any=r.mid!==null||n>0&&this.from.mid!==null,this.index(),this.version++}footprint(e){let t=this.geometry;if(!t||!this.any||!this.from||!this.to)return Ao;let n=this.shown;if(n&&n.version===this.version&&n.settled===e)return n.boxes;let r=t.attributes.position.array,i=t.attributes.uv.array,a=t.index.array,o=t.drawRange.count,s=e?[this.to.data]:[this.from.data,this.to.data],c=-.15,l=this.nx,u=new Map,d=[],f=[0,0,0],p=[0,0,0];for(let e=0;e<o;e+=3){for(let t=0;t<3;t++){let n=a[e+t];f[t]=(i[n*2]+i[n*2+1]*l)*4}let t=a[e],n=a[e+1],o=a[e+2],m=(Math.floor((r[t*3]+r[n*3]+r[o*3])/48)+32768)*65536+Math.floor((r[t*3+2]+r[n*3+2]+r[o*3+2])/48)+32768,h=-1;for(let t of s)for(let n=0;n<3;n++){let i=f[n],o=f[(n+1)%3],l=t[i+3],g=t[o+3],_=a[e+n],v=a[e+(n+1)%3];if(l>=c){h<0&&(h=jo(u,d,m));for(let e of s)Mo(d,h,r[_*3],e[i],r[_*3+2])}if(l>=c!=g>=c){let e=(c-l)/(g-l);p[0]=r[_*3]+(r[v*3]-r[_*3])*e,p[2]=r[_*3+2]+(r[v*3+2]-r[_*3+2])*e,h<0&&(h=jo(u,d,m));for(let t of s)Mo(d,h,p[0],t[i]+(t[o]-t[i])*e,p[2])}}}return this.shown={version:this.version,settled:e,boxes:Float32Array.from(d)},this.shown.boxes}upload(e,t){e.image.data=t,e.needsUpdate=!0}build(){this.geometry?.dispose(),this.a.dispose(),this.b.dispose(),this.iceA.dispose(),this.iceB.dispose();let{nx:e,nz:t,cell:n,x0:r,z0:i}=this,o=e+2,s=t+2;this.a=No(e,t),this.b=No(e,t),this.iceA=No(e,t),this.iceB=No(e,t),this.thaw=new Float32Array(e*t),this.iceTurn=new Float32Array(e*t);let c=(e,t)=>e===0?0:e===t+1?t:e-.5,l=new Float32Array(o*s*3),u=new Float32Array(o*s*2);for(let a=0;a<s;a++)for(let s=0;s<o;s++){let d=a*o+s;l[d*3]=r+c(s,e)*n,l[d*3+2]=i+c(a,t)*n,u[d*2]=Math.min(Math.max(s-1,0),e-1),u[d*2+1]=Math.min(Math.max(a-1,0),t-1)}let d=new We;d.setAttribute(`position`,new U(l,3)),d.setAttribute(`uv`,new U(u,2)),d.setIndex(new U(new Uint32Array((o-1)*(s-1)*6),1).setUsage(a)),d.boundingBox=new q,this.geometry=d}index(){let e=this.geometry,{nx:t,nz:n}=this,r=this.from.dist,i=this.to.dist,a=t+2,o=n+2,s=new Uint8Array(a*o);for(let e=0;e<o;e++){let o=Math.min(Math.max(e-1,0),n-1)*t;for(let n=0;n<a;n++){let c=o+Math.min(Math.max(n-1,0),t-1);s[e*a+n]=+(r[c]<=1||i[c]<=1)}}let c=e.index,l=c.array,u=0,d=1/0,f=-1/0,p=1/0,m=-1/0;for(let e=0;e<n+1;e++)for(let n=0;n<t+1;n++){let t=e*a+n;if(!(s[t]|s[t+1]|s[t+a]|s[t+a+1]))continue;let r=t+1,i=t+a,o=i+1;l[u++]=t,l[u++]=i,l[u++]=r,l[u++]=r,l[u++]=i,l[u++]=o,d=Math.min(d,n),f=Math.max(f,n+1),p=Math.min(p,e),m=Math.max(m,e+1)}c.clearUpdateRanges(),c.addUpdateRange(0,u),c.needsUpdate=!0,e.setDrawRange(0,u);let h=[this.from,this.to].filter(e=>e.mid!==null);this.wetLow=Math.min(...h.map(e=>e.low),1/0),this.wetHigh=Math.max(...h.map(e=>e.high),-1/0),h.length||(this.wetLow=this.wetHigh=0),this.low=this.wetLow-4,this.high=this.wetHigh;let g=e.boundingBox,_=e.attributes.position.array;u?(g.min.set(_[(p*a+d)*3],this.low,_[(p*a+d)*3+2]),g.max.set(_[(m*a+f)*3],this.high,_[(m*a+f)*3+2])):(g.makeEmpty(),this.any=!1),e.boundingSphere=null}},Ao=new Float32Array;function jo(e,t,n){let r=e.get(n);return r===void 0&&(r=t.length,e.set(n,r),t.push(1/0,1/0,1/0,-1/0,-1/0,-1/0)),r}function Mo(e,t,n,r,i){n<e[t]&&(e[t]=n),r<e[t+1]&&(e[t+1]=r),i<e[t+2]&&(e[t+2]=i),n>e[t+3]&&(e[t+3]=n),r>e[t+4]&&(e[t+4]=r),i>e[t+5]&&(e[t+5]=i)}function No(e,t){return new gt(new Float32Array(e*t*4),e,t,j,Ve)}function Po(e,t,n){let r=new Float32Array(e.length*4);for(let i=0;i<e.length;i++)r[i*4]=e[i],r[i*4+1]=t[i],r[i*4+2]=n[i];return r}function Fo(e){let{nx:t,nz:n,level:r,cell:i}=e,a=new Float32Array(t*n),o=Math.SQRT2,s=1e9;for(let e=0;e<a.length;e++)a[e]=Number.isNaN(r[e])?0:s;let c=(e,r)=>e<0||r<0||e>=t||r>=n?s:a[r*t+e];for(let e=0;e<n;e++)for(let n=0;n<t;n++){let r=e*t+n;a[r]>0&&(a[r]=Math.min(a[r],c(n-1,e)+i,c(n,e-1)+i,c(n-1,e-1)+o*i,c(n+1,e-1)+o*i))}for(let e=n-1;e>=0;e--)for(let n=t-1;n>=0;n--){let r=e*t+n;a[r]>0&&(a[r]=Math.min(a[r],c(n+1,e)+i,c(n,e+1)+i,c(n+1,e+1)+o*i,c(n-1,e+1)+o*i))}for(let e=0;e<a.length;e++)a[e]>0&&(a[e]=Math.min(a[e]-i/2,8));return a}function Io(e){let t=e.slice();for(let e=0;e<t.length;e+=4)t[e]-=4,t[e+3]=-4;return t}var Lo=`
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
// 2D simplex noise (Ashima Arts, MIT), in [-1, 1].
vec3 permute3(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm2(vec2 p) { return snoise(p) * 0.65 + snoise(p * 2.13 + 17.1) * 0.35; }
// Brush strokes: noise stretched along a direction, so it reads as dabs laid side by side rather than as a cloud.
float strokes(vec2 p, float angle) {
  float c = cos(angle), s = sin(angle);
  vec2 q = vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
  return snoise(q * vec2(0.55, 2.6)) * 0.6 + snoise(q * vec2(1.3, 5.5) + 31.7) * 0.4;
}
// Brush dabs: the plane covered in overlapping, elongated dabs (cells in a stretched, turned frame), each with its own
// value, the way a painter lays strokes side by side. The cells blend softly into their neighbours (a smooth Voronoi), so a
// dab has a soft, rounded edge rather than a cut one. Returns the dab value in about [-1, 1].
float dabs(vec2 p, float angle, float stretch) {
  float c = cos(angle), s = sin(angle);
  vec2 q = vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
  q.x /= stretch;
  vec2 i = floor(q), f = fract(q);
  float sum = 0.0, wsum = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = hash22(i + g) * 0.9 + 0.05;
    vec2 r = g + o - f;
    r.x *= stretch * 0.5;
    float w = exp(-9.0 * dot(r, r));
    sum += w * (hash12(i + g + 4.1) * 2.0 - 1.0);
    wsum += w;
  }
  return sum / max(wsum, 1e-5);
}
// Two layers of dabs at different sizes and angles, so no grid shows: a value in about [-1, 1].
float dabLayer(vec2 p, float scale, float angle) {
  float a = dabs(p * scale, angle, 2.6);
  float b = dabs(p * scale * 1.9 + 17.3, angle + 0.4, 2.2);
  // Bristle streaks along the stroke.
  float hair = snoise(vec2(dot(p, vec2(cos(angle), sin(angle))) * scale * 1.2, dot(p, vec2(-sin(angle), cos(angle))) * scale * 9.0));
  return clamp(a * 1.25, -1.0, 1.0) * 0.6 + b * 0.3 + hair * 0.12;
}
// Dabs laid along a direction that may change across a surface. Turning the whole pattern by a varying angle would swirl it
// (far from the origin a small turn is a big shift), so the dabs are laid at fixed 30° steps and the two nearest blended.
float paintDabs(vec2 p, float scale, float angle) {
  const float STEP = 0.5235988;
  float k = angle / STEP, k0 = floor(k), w = smoothstep(0.3, 0.7, k - k0);
  return mix(dabLayer(p, scale, k0 * STEP), dabLayer(p, scale, (k0 + 1.0) * STEP), w);
}
float paintStrokes(vec2 p, float angle) {
  const float STEP = 0.5235988;
  float k = angle / STEP, k0 = floor(k), w = smoothstep(0.3, 0.7, k - k0);
  return mix(strokes(p, k0 * STEP), strokes(p, (k0 + 1.0) * STEP), w);
}
`,Ro=`
vec3 linToOklab(vec3 c) {
  c = max(c, 0.0);
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(l, 1.0 / 3.0); m = pow(m, 1.0 / 3.0); s = pow(s, 1.0 / 3.0);
  return vec3(0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
              1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
              0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLinRaw(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
              -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
              -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 oklabToLin(vec3 c) { return max(oklabToLinRaw(c), 0.0); }
// To linear sRGB, keeping the hue and lightness and giving up chroma when the colour is out of gamut, as a painter's pigment
// would (clipping the channels instead turns a deep green shade neon).
vec3 oklabToLinFit(vec3 lab) {
  vec3 c = oklabToLinRaw(lab);
  if (min(c.r, min(c.g, c.b)) >= 0.0) return c;
  float lo = 0.0, hi = 1.0;
  for (int i = 0; i < 6; i++) {
    float m = (lo + hi) * 0.5;
    vec3 t = oklabToLinRaw(vec3(lab.x, lab.yz * m));
    if (min(t.r, min(t.g, t.b)) >= 0.0) lo = m; else hi = m;
  }
  return max(oklabToLinRaw(vec3(lab.x, lab.yz * lo)), 0.0);
}
// Rotates a colour's hue by 'turn' radians, scales its chroma and shifts its lightness, in OKLCh.
vec3 lchShift(vec3 lab, float dL, float cMul, float turn) {
  float c = cos(turn), s = sin(turn);
  vec2 ab = vec2(c * lab.y - s * lab.z, s * lab.y + c * lab.z) * cMul;
  return vec3(lab.x + dL, ab);
}
// Pulls a colour's hue part of the way towards a target hue (radians in OKLab's a-b plane), the short way round, and never
// more than about 40°: a painter cools a shade, he doesn't swap its colour (yellow wheat in shade stays a warm olive).
vec3 hueToward(vec3 lab, float target, float amount) {
  float h = atan(lab.z, lab.y);
  float d = mod(target - h + 3.14159265, 6.2831853) - 3.14159265;
  float c = length(lab.yz), nh = h + clamp(d * amount, -0.7, 0.7);
  return vec3(lab.x, c * cos(nh), c * sin(nh));
}
`,zo=`
uniform vec3 uSunDir;        // world, towards the sun
uniform vec3 uSunColor;      // linear, multiplies the lit band
uniform vec3 uSkyColor;      // linear, the light that fills shadows from above
uniform vec3 uRimColor;      // linear, the warm edge light on foliage
uniform float uShadeHue;     // OKLab hue the shade band leans to (radians)
uniform float uShadeLean;    // how far it leans (0..1)
uniform float uShadeDepth;   // lightness taken off in shade
uniform float uLitHue;       // OKLab hue the lit band leans to
uniform float uLitLean;
uniform vec3 uOvercast;      // under cloud: x the share of light from the whole sky, y the share of cast shadow taken away,
                             // z how much wider shadows' edges get (see overcast.ts)
uniform float uTime;
uniform vec2 uWindDir;       // where the wind blows towards, a unit vector in xz
uniform float uWindSpeed;    // m/s, the wind's average (the game's, eased by the game)
uniform vec2 uWindDrift;     // how far the leaves in the air have been carried downwind (metres)
uniform float uWindFlutter;  // the leaves' flutter phase (radians)
uniform vec3 uViewBack;     // the main camera's backward direction (wind moves things only across it)
uniform sampler2D uShadowMap;
uniform mat4 uShadowMatrix;  // world -> shadow-map uv and depth
uniform vec2 uShadowTexel;
uniform vec2 uShadowArea;    // how much of the map, from its corner, the sun's view is drawn into (shadowDepthAt)
uniform float uMirror;       // 1 while drawing the water's reflection: the scene mirrored in the plane y = uMirrorY
uniform float uMirrorY;      // (the water at another height reads it shifted on screen: see WATER_FRAG)
${Do}
`,Bo=`
${_a}
uniform float uCloudStrength;  // how much a cloud's shade counts: as direct as the sun is (none before dawn, faint by the moon)
uniform vec3 uCloudOvercast;   // under a cloud, as uOvercast
uniform vec3 uCloudSunColor;   // under a cloud, as uSunColor
uniform vec3 uCloudRimColor;   // under a cloud, as uRimColor
uniform vec4 uCloudBands;      // under a cloud: the shade's hue (radians from uShadeHue, the short way), its depth, the lit
                               // band's lean, and the exposure (over the grade's)
uniform vec2 uCloudTint;       // under a cloud, from the gaps': the lit band's hue (radians, the short way) and the shade's
                               // lean (a storm's, storm.ts; none without one)
uniform float uLightExposure;  // in the gaps: the exposure, over the grade's
// The cloud's shade here, 0 in the sun .. 1 under the deepest of it, as strong as the sun is direct.
float gCloud = 0.0;
void cloudAt(vec3 p) { gCloud = cloudMapShade(p.xz) * uCloudStrength; }
vec3 overcastHere() { return mix(uOvercast, uCloudOvercast, gCloud); }
vec3 sunColorHere() { return mix(uSunColor, uCloudSunColor, gCloud); }
vec3 rimColorHere() { return mix(uRimColor, uCloudRimColor, gCloud); }
float shadeHueHere() { return uShadeHue + uCloudBands.x * gCloud; }
float litHueHere() { return uLitHue + uCloudTint.x * gCloud; }
float shadeLeanHere() { return uShadeLean + uCloudTint.y * gCloud; }
vec3 exposeHere(vec3 c) { return c * mix(uLightExposure, uCloudBands.w, gCloud); }
`,Vo=`
uniform sampler2D uSkyMap;
uniform vec4 uSkyRect;        // the sky map's corner (x, z) and 1 / its side
uniform vec3 uGapSkyTop;      // the sky in the gaps between the clouds, overhead
uniform vec3 uGapSkyBottom;   // and low down
uniform vec3 uCloudLit;       // a cloud's sunlit side, in the hour's light
uniform vec3 uCloudBelly;     // its underside; and the whole sky once it closes
uniform float uSkyClosed;     // how far the sky has closed, 0..1
float skyCloudAt(vec2 xz) { return texture(uSkyMap, (xz - uSkyRect.xy) * uSkyRect.zw).r; }
// Where a ray from p along r meets the clouds; rays near the horizon as if a little higher.
vec2 skyPoint(vec3 p, vec3 r) { return p.xz + r.xz / max(r.y, ${va.rise.toFixed(2)}) * ${va.height.toFixed(1)}; }
// The sky at xz, the gaps' between the top and the bottom by low (0 overhead .. 1 the horizon); cloud is how much of it
// is cloud.
vec3 mirrorSky(vec2 xz, float low, out float cloud) {
  vec3 gap = mix(uGapSkyTop, uGapSkyBottom, low);
  cloud = skyCloudAt(xz);
  float closed = uSkyClosed;
  // Lit (the developer's pick, #8): the side towards the sun bright, the thick middle a cooler grey.
  float sunward = skyCloudAt(xz + normalize(uSunDir.xz + vec2(1e-4, 0.0)) * 8.0);
  float edge = smoothstep(0.0, 0.25, cloud - sunward);
  vec3 belly = mix(mix(uCloudLit, uCloudBelly, 0.85) * 0.9, uCloudBelly, closed);
  vec3 col = mix(mix(mix(uCloudLit, uCloudBelly, closed), belly, smoothstep(0.5, 1.0, cloud)), uCloudLit * 1.15,
    edge * (1.0 - closed));
  return mix(gap, col, cloud);
}
`,Ho=`
float shadowDepthAt(vec2 uv) {
  return texture(uShadowMap, clamp(uv * uShadowArea, uShadowTexel * 0.5, uShadowArea - uShadowTexel * 0.5)).r;
}
// How much further (metres) a surface with normal n is pushed off itself before it reads the map, past its own push for
// all the map drawn over the window: the corner's texels are coarser (uShadowArea < 1), each a bigger patch whose depth is
// its centre's, and a surface at a slant to the sun sits in front of or behind that by its slope across the patch (shadow
// acne: lit ground at a low sun dashed with its own shade). A push of a texel's growth across the sun's view along the
// normal's lean in each axis covers it: the point is up to half a texel from the centre read, but half a texel's growth
// still left a speckle at the widest zoom, so a whole one. The price: every shadow comes up short by the push (stretched
// by a low sun), and what stands lower than it (a sill, at Low zoomed out) throws none, where the capped map could show
// one. None with all the map drawn: just as before.
float shadowSlack(vec3 n) {
  vec3 ax = vec3(uShadowMatrix[0][0], uShadowMatrix[1][0], uShadowMatrix[2][0]);   // uv a metre, across and up
  vec3 ay = vec3(uShadowMatrix[0][1], uShadowMatrix[1][1], uShadowMatrix[2][1]);
  vec2 grow = uShadowTexel * (1.0 - uShadowArea) / uShadowArea;                     // the texel's growth, in uv
  return abs(dot(n, ax)) * grow.x / dot(ax, ax) + abs(dot(n, ay)) * grow.y / dot(ay, ay);
}
`,Uo=`
${Ho}
float sunVisibility(vec3 worldPos, vec3 n, float brush) {
  vec3 p = worldPos + n * (0.04 + shadowSlack(n));
  vec4 s = uShadowMatrix * vec4(p, 1.0);
  vec3 uvz = s.xyz / s.w;
  if (uvz.x < 0.0 || uvz.x > 1.0 || uvz.y < 0.0 || uvz.y > 1.0 || uvz.z > 1.0) return 1.0;
  // The brush wobbles where the edge is sampled, so a shadow's border is painted rather than ruled.
  vec2 wob = vec2(brush, snoise(worldPos.xz * 1.7 + 9.0)) * uShadowTexel * 2.5;
  vec3 overcast = overcastHere();
  float vis = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 2.39996 + hash12(worldPos.xz * 31.0) * 6.283;
    float r = sqrt((float(i) + 0.5) / 8.0) * 2.2 * (1.0 + overcast.z);
    vec2 o = vec2(cos(a), sin(a)) * r * uShadowTexel + wob;
    float d = shadowDepthAt(uvz.xy + o);
    vis += (uvz.z - 0.0015 > d) ? 0.0 : 1.0;
  }
  return mix(vis / 8.0, 1.0, overcast.y);
}
`,Wo=`
// The look's light colours as tints: their hue, at a set strength, with the brightness left to the exposure.
vec3 tintOf(vec3 c, float amount) { return mix(vec3(1.0), c / max(max(c.r, c.g), max(c.b, 1e-3)), amount); }
vec3 sunTint() { return tintOf(sunColorHere(), 0.4); }
vec3 skyTint() { return tintOf(uSkyColor, 0.45); }
// How lit a surface is by the sun, 0..1, measured against flat ground: flat ground is in full sun whatever the hour (a
// painter keeps an evening meadow warm and lit), slopes and sides turned away from the sun fall into half-tone and shade.
// Under cloud the light comes from the whole sky instead: tops lit, sides in half-tone, undersides in shade.
float sunLight(vec3 n, float wrap) {
  float rel = dot(n, uSunDir) / max(uSunDir.y, 0.3);
  float sun = clamp((rel + wrap) / (1.0 + wrap), 0.0, 1.0);
  return mix(sun, clamp(0.5 + 0.5 * n.y, 0.0, 1.0), overcastHere().x);
}
// The direction brush strokes run on the ground: along the contours where it slopes, a set angle where it's flat.
float contourAngle(vec3 n, float fallback) {
  float m = length(n.xz);
  float a = atan(n.z, n.x) + 1.5707963;
  vec2 v = vec2(cos(2.0 * a), sin(2.0 * a)) * smoothstep(0.02, 0.12, m) + vec2(cos(2.0 * fallback), sin(2.0 * fallback)) * 0.25;
  return mod(atan(v.y, v.x) * 0.5, 3.14159265);
}

vec3 paintBands(vec3 base, float light, float soft, float upness) {
  vec3 lab = linToOklab(base);
  float shadeHue = shadeHueHere(), shadeDepth = mix(uShadeDepth, uCloudBands.y, gCloud), litLean = mix(uLitLean, uCloudBands.z, gCloud);
  // Shade: darker, a touch richer, with some of the look's shade colour mixed in (teal at noon, violet at dusk), the way a
  // painter cools a shadow with blue rather than black. Mixing, not turning the hue: yellow wheat in shade goes olive, not red.
  vec3 shadeMix = vec3(0.0, cos(shadeHue), sin(shadeHue)) * shadeLeanHere() * 0.09;
  vec3 shade = lchShift(lab, -shadeDepth * lab.x, 1.1, 0.0) + shadeMix;
  // Half-tone: between, with less of it.
  vec3 half_ = lchShift(lab, -shadeDepth * 0.45 * lab.x, 1.06, 0.0) + shadeMix * 0.45;
  // Lit: the colour itself, warmed by the hour.
  float litHue = litHueHere();
  vec3 lit = lchShift(lab, 0.02, 1.05, 0.0) + vec3(0.0, cos(litHue), sin(litHue)) * litLean * 0.09;
  float t1 = smoothstep(0.30 - soft, 0.30 + soft, light);
  float t2 = smoothstep(0.62 - soft, 0.62 + soft, light);
  vec3 col = oklabToLinFit(mix(mix(shade, half_, t1), lit, t2));
  // The sky fills the shade from above; the sun tints the lit band.
  vec3 sky = skyTint() * (0.8 + 0.2 * upness);
  return mix(col * sky, col * sunTint(), t2 * 0.85 + t1 * 0.15);
}
`,Go=`
// The waterline on things standing in the water (#18, the developer's pick "foam line"): a thin line of foam where the
// water meets them (not along blades and leaves, where it would speckle), and a faint wet band above it, darker where the
// water has wetted them, its top ragged.
// Only where the water is drawn, not where the sheet dives under the land, and not on things floating in it (gFloats, set
// by the material: a boat's inside is dry, and its own wet line rides with it).
float gFloats = 0.0;
vec3 waterline(vec3 color, vec3 p, float dy) {
  vec3 sheet = waterSheet(p.xz);
  // Where the water is drawn (as sheetHidden judges it).
  float shown = smoothstep(-${wo}, -${wo/2}, sheet.z);
  float h = p.y - sheet.x;
  if (shown <= 0.0 || h < -0.05 || h > 0.3) return color;
  float top = 0.16 + 0.07 * snoise(p.xz * 2.7 + p.y * 1.3);
  float wet = (1.0 - smoothstep(top * 0.6, top, h)) * smoothstep(-0.05, 0.0, h) * shown;
  vec3 lab = linToOklab(color);
  vec3 wetColor = oklabToLin(vec3(lab.x * 0.66, lab.yz * 1.15));
  color = mix(color, wetColor, wet * 0.55);
#ifndef THIN
  float w = max(dy, 0.004);
  // (And no more than a few pixels from where the water meets it: on ground nearly as flat as the water, a flooded meadow's,
  // the height's band alone would lie over a wide patch, #19. dy, the caller's, is taken before any fragment leaves; the
  // water's level barely changes over a pixel, so it measures the height above it as well.)
  float off = abs(h - 0.01);
  float line = (1.0 - smoothstep(0.025, 0.025 + w, off)) * (1.0 - smoothstep(1.5, 3.0, off / max(dy, 1e-5))) * shown;
  // Fainter along the ground's shore than round things standing in the water.
#ifdef FIELDS
  line *= 0.45;
#endif
  color = mix(color, exposeHere(vec3(0.86, 0.86, 0.82) * mix(skyTint(), sunTint(), 0.5)), line * 0.8);
#endif
  return color;
}
layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gAux;   // view normal xy, view depth, ink (1 inked, 0 painted)
void writeGBuffer(vec3 color, vec3 worldNormal, float viewDepth, float ink, float alpha) {
  // (Taken before any fragment leaves, where its neighbours' are still there to compare with.)
  float dy = fwidth(vWorldPos.y);
  // In the reflection, what's under the water isn't reflected: under the water nearest (waterNear; a flood stands higher
  // than the river).
  if (uMirror > 0.5 && vWorldPos.y < waterNear(vWorldPos.xz) - 0.01) discard;
#ifndef WATER_SHEET
  if (gFloats < 0.5 && vWorldPos.y < uWaterHigh + 0.3) color = waterline(color, vWorldPos, dy);
#endif
  vec3 vn = normalize((viewMatrix * vec4(worldNormal, 0.0)).xyz);
  // The reflection is stored premultiplied (over a clear, transparent black), so the water can filter it without darkening
  // the edges of what's reflected.
  gColor = vec4(uMirror > 0.5 ? color * alpha : color, alpha);
  gAux = vec4(vn.xy, viewDepth, ink);
}
`,Ko=5.5,qo=1.1,Jo={lift:2,linger:5,rise:.8,top:7,head:1},Yo=1,Xo=1,Zo=.6,Qo=.5,$o=.7,es=20,ts=.4,ns=class e{a=e.texture();b=e.texture();blend=0;grid=new J(0,0,1,1);any=!1;storm=0;look=Jo;source=null;lift=new Float32Array;ground=new Float32Array;groundHalf=new Uint16Array;emptyHalf=new Uint16Array;blank=new Set;d=new Float32Array;m=new Float32Array;d2=new Float32Array;m2=new Float32Array;speed=new Float32Array;speedSet=!1;speedTick=0;nx=0;nz=0;cell=1;x0=0;z0=0;tick=-1;snapA=null;snapB=null;fresh=!0;static texture(){let e=new gt(new Uint16Array(4),1,1,j,A);return e.magFilter=de,e.minFilter=de,e.wrapS=e.wrapT=we,e.needsUpdate=!0,e}setSource(e){this.source=e,this.nx&&this.layLift()}restart(){this.fresh=!0}set(e,t,n){if(this.blend=e.tick===t.tick?1:n,t!==this.snapB||e!==this.snapA||this.fresh){if((this.nx!==t.nx||this.nz!==t.nz||this.cell!==t.cell||this.x0!==t.x0||this.z0!==t.z0)&&this.lay(t),this.fresh||t.tick<this.tick||t.tick>this.tick+10){this.d.fill(0),this.m.fill(0),this.any=!1,this.speedSet=!1;for(let e=0;e<es;e++)this.step(t,ts);this.fresh=!1,this.upload(this.a),this.upload(this.b)}else{for(;this.tick<e.tick;)this.step(e);for(e===this.snapB?this.swap():this.upload(this.a);this.tick<t.tick;)this.step(t);this.upload(this.b)}this.tick=t.tick,this.snapA=e,this.snapB=t}}swap(){let e=this.a;this.a=this.b,this.b=e}lay(e){this.nx=e.nx,this.nz=e.nz,this.cell=e.cell,this.x0=e.x0,this.z0=e.z0;let t=e.nx*e.nz;this.grid.set(e.x0,e.z0,1/(e.nx*e.cell),1/(e.nz*e.cell)),this.lift=new Float32Array(t),this.ground=new Float32Array(t),this.groundHalf=new Uint16Array(t),this.emptyHalf=new Uint16Array(t),this.d=new Float32Array(t),this.m=new Float32Array(t),this.d2=new Float32Array(t),this.m2=new Float32Array(t),this.speed=new Float32Array(t),this.speedSet=!1,this.layLift(),this.fresh=!0}layLift(){let{nx:e,nz:t,cell:n,x0:r,z0:i}=this;this.lift.fill(0);let a=n<=4?this.source:null;if(a&&this.ground.fill(0),a)for(let o=0;o<t;o++)for(let t=0;t<e;t++){let s=r+(t+.5)*n,c=i+(o+.5)*n,l=Math.floor((s-a.x0)/a.cell),u=Math.floor((c-a.z0)/a.cell);l<0||u<0||l>=a.nx||u>=a.nz||(this.lift[o*e+t]=a.lift[u*a.nx+l],this.ground[o*e+t]=a.ground[u*a.nx+l])}for(let e=0;e<this.ground.length;e++)this.groundHalf[e]=as(this.ground[e]),this.emptyHalf[e]=as(this.ground[e]+Qo);this.blank.clear(),this.speedSet=!1}step(e,t=.1){if(this.tick++,this.storm<=0&&!this.any){this.speedSet=!1;return}let{nx:n,nz:r}=this,i=this.cell,a=this.look,o=Math.exp(-t/a.linger),s=Zo*t/i,c=this.d,l=this.m,u=this.d2,d=this.m2,f=this.lift,p=e.u,m=e.v,h=this.speed,g=Math.max(Ko,qo*e.speed),_=this.storm*a.lift*t,v=this.speedSet?this.storm*a.head*Xo:0,y=$o*a.top,b=Math.max(t,(e.tick-this.speedTick)*.1),x=a.rise*t,S=a.top,C=n-1,w=r-1,T=!1;for(let e=0,i=0;e<r;e++)for(let a=0;a<n;a++,i++){let E=p[i],D=m[i],O=a-E*s,k=e-D*s;O=O<0?0:O>C?C:O,k=k<0?0:k>w?w:k;let A=O|0,j=k|0;A>n-2&&(A=n-2),j>r-2&&(j=r-2);let M=O-A,N=k-j,P=j*n+A,F=P+n,I=c[P],ee=c[P+1],te=c[F],ne=c[F+1],L=0,re=0;if(I+ee+te+ne>0){let e=(1-M)*(1-N),t=M*(1-N),n=(1-M)*N,r=M*N;L=(I*e+ee*t+te*n+ne*r)*o,re=(l[P]*e+l[P+1]*t+l[F]*n+l[F+1]*r)*o,re=Math.min(re+L*x,L*S)}let ie=f[i];if(ie>0&&_>0){let e=Math.sqrt(E*E+D*D),n=e-g;if(n>0){let e=_*ie*n/(1+n/6);L+=e,re+=e*Qo}let r=(e-h[i])/b-Yo;if(v>0&&r>0&&n>-2){let e=v*ie*Math.min(r,10)*t;L+=e,re+=e*y}h[i]=e}L<1e-4?(L=0,re=0):T=!0,u[i]=L,d[i]=re}this.d=u,this.m=d,this.d2=c,this.m2=l,this.any=T,this.speedSet=_>0,this.speedTick=e.tick}upload(e){let t=this.nx*this.nz,n=e.image.data;if((e.image.width!==this.nx||e.image.height!==this.nz)&&(n=new Uint16Array(t*4),e.image={data:n,width:this.nx,height:this.nz},e.dispose(),this.blank.delete(e)),this.any)this.blank.delete(e);else{if(this.blank.has(e))return;this.blank.add(e)}let r=this.d,i=this.m,a=this.ground,o=this.groundHalf,s=this.emptyHalf;for(let e=0,c=0;e<t;e++,c+=4){let t=r[e];n[c+1]=o[e],n[c+3]=0,t>0?(n[c]=as(t),n[c+2]=as(a[e]+i[e]/t)):(n[c]=0,n[c+2]=s[e])}e.needsUpdate=!0}},rs=new Float32Array(1),is=new Uint32Array(rs.buffer);function as(e){rs[0]=e;let t=is[0],n=t>>>23&255;return n<113?t>>>16&32768:t>>>16&32768|n-112<<10|t>>>13&1023}var os={calm:0,breeze:5,gale:17,storm:25,hurricane:35};function ss(e){let t=`calm`;for(let[n,r]of Object.entries(os))e>=r-.5&&(t=n);return t}var cs=1.3620689655172413;function ls(e,t){let n=Math.cos(t),r=Math.sin(t),i=e=>new Float32Array(4).fill(e);return{nx:2,nz:2,cell:1e4,x0:-1e4,z0:-1e4,tick:0,speed:e,dirX:n,dirZ:r,gustiness:0,u:i(e*n),v:i(e*r),k:i(1),fu:i(e*n),fv:i(e*r)}}var us=class e{a=e.texture();b=e.texture();blend=0;grid=new J(0,0,1,1);usual=e.texture(Ie);snapA=null;snapB=null;mean=new Float32Array;meanTick=-1;meanGrid=``;meanSnap=null;meanSpan=0;static texture(e=pt){let t=new gt(new Uint16Array(e===1030?2:1),1,1,e,A);return t.magFilter=de,t.minFilter=de,t.wrapS=t.wrapT=we,t.needsUpdate=!0,t}set(t,n,r){if(this.grid.set(n.x0,n.z0,1/(n.nx*n.cell),1/(n.nz*n.cell)),n!==this.snapB||t!==this.snapA){if(t===this.snapB){let e=this.a;this.a=this.b,this.b=e}else e.upload(this.a,t);this.snapA=t,e.upload(this.b,n),this.snapB=n,this.updateUsual(n)}this.blend=t.tick===n.tick?1:r}static upload(e,t){let n=t.nx*t.nz,r=e.image.data;(e.image.width!==t.nx||e.image.height!==t.nz)&&(r=new Uint16Array(n*2),e.image={data:r,width:t.nx,height:t.nz},e.dispose());for(let e=0;e<n;e++)r[e*2]=as(t.u[e]),r[e*2+1]=as(t.v[e]);e.needsUpdate=!0}updateUsual(e){if(e===this.meanSnap)return;this.meanSnap=e;let t=e.nx*e.nz,n=this.usual,r=`${e.nx} ${e.nz} ${e.cell} ${e.x0} ${e.z0}`,i=this.mean;if(r!==this.meanGrid||e.tick<=this.meanTick||e.tick>this.meanTick+50){this.meanGrid=r,i=this.mean=new Float32Array(t);for(let n=0;n<t;n++)i[n]=Math.hypot(e.u[n],e.v[n]);this.meanSpan=.1}else{let n=(e.tick-this.meanTick)*.1;this.meanSpan=Math.min(ds,this.meanSpan+n);let r=Math.max(n/this.meanSpan,1-Math.exp(-n/ds));for(let n=0;n<t;n++){let t=e.u[n],a=e.v[n];i[n]+=(Math.sqrt(t*t+a*a)-i[n])*r}}this.meanTick=e.tick;let a=n.image.data;(n.image.width!==e.nx||n.image.height!==e.nz)&&(a=new Uint16Array(t),n.image={data:a,width:e.nx,height:e.nz},n.dispose());for(let e=0;e<t;e++)a[e]=as(i[e]);n.needsUpdate=!0}},ds=20,fs=Math.cos(25*Math.PI/180),ps=1.3,ms=6,hs=class e{speed=0;dirX=1;dirZ=0;gust=0;driftX=0;driftZ=0;flutter=0;haze={hx:1,hz:0,stretch:1,drift:0,streak:0};hazeNext=null;hazeFade=0;carried=0;time=null;set(e,t,n){let r=e.tick===t.tick?1:n,i=(e,t)=>e+(t-e)*r;this.speed=i(e.speed,t.speed),this.gust=i(e.gustiness,t.gustiness);let a=i(e.dirX,t.dirX),o=i(e.dirZ,t.dirZ),s=Math.hypot(a,o)||1;this.dirX=a/s,this.dirZ=o/s}static driftSpeed(e){return .8+.4*e}static hazeSpeed(e){return .12+.1*e}static dustSpeed(e){return .3+.3*e}static hazeStretch(e,t){return 1+e/10*(1+t)}hazeRate(){return G.lerp(e.hazeSpeed(this.speed),e.dustSpeed(this.speed),this.carried)}streakRate(){return 2*e.dustSpeed(this.speed)}static flutterRate(e){return 2*Math.PI*(.7+2.3*e/(e+12))}hazeFrame(t=0,n=0){return{hx:this.dirX,hz:this.dirZ,stretch:e.hazeStretch(this.speed,this.carried),drift:t,streak:n}}restart(){this.time=null}update(t){let n=this.time===null?-1:t-this.time;if(this.time=t,n<0){let n=e.driftSpeed(this.speed)*t;this.driftX=this.dirX*n,this.driftZ=this.dirZ*n,this.haze=this.hazeFrame(),this.haze.drift=this.hazeRate()*t/this.haze.stretch,this.haze.streak=this.streakRate()*t/6,this.hazeNext=null,this.hazeFade=0,this.flutter=e.flutterRate(this.speed)*t;return}let r=Math.ceil(Math.min(n,30)/.1);for(let e=0;e<r;e++)this.step(n/r)}step(t){let n=e.driftSpeed(this.speed)*t;this.driftX+=this.dirX*n,this.driftZ+=this.dirZ*n,this.flutter+=e.flutterRate(this.speed)*t;for(let e of this.hazeNext?[this.haze,this.hazeNext]:[this.haze])e.drift+=this.hazeRate()*t/e.stretch,e.streak+=this.streakRate()*t/6;if(this.hazeNext)this.hazeFade=Math.min(1,this.hazeFade+t/ms),this.hazeFade>=1&&(this.haze=this.hazeNext,this.hazeNext=null,this.hazeFade=0);else{let t=this.haze,n=e.hazeStretch(this.speed,this.carried)/t.stretch;(this.dirX*t.hx+this.dirZ*t.hz<fs||n>ps||n<1/ps)&&(this.hazeNext=this.hazeFrame(t.drift+37.1,t.streak+53.3),this.hazeFade=0)}}},gs=`

uniform sampler2D tWindA;    // the game's wind map at its earlier tick and its later (see WindField)
uniform sampler2D tWindB;
uniform sampler2D tWindUsual; // how hard the ground air usually blows there (m/s, see WindField.usual)
uniform float uWindBlend;    // the frame's share of the way between them
uniform vec4 uWindGrid;      // the map's corner (x, z) and 1 over its size (x, z)
uniform float uWindOn;       // 1, or 0 to read a still wind (the shelter map's pass)

float windForce() { return clamp(uWindSpeed / 35.0, 0.0, 1.5); }
vec3 windDir3() { return vec3(uWindDir.x, 0.0, uWindDir.y); }
vec2 windGround(vec2 xz) {
  vec2 uv = (xz - uWindGrid.xy) * uWindGrid.zw;
  return mix(texture2D(tWindA, uv).xy, texture2D(tWindB, uv).xy, uWindBlend) * uWindOn;
}
// A wind's direction as a vector in the ground plane, or the wind's as a whole where it's still.
vec3 windDirOf(vec2 w) { float l = length(w); return l > 0.01 ? vec3(w.x, 0.0, w.y) / l : windDir3(); }
// How hard it blows at a point against how hard it usually blows there: 1 as usual, more in a gust.
float windGustHere(vec2 xz) {
  vec2 uv = (xz - uWindGrid.xy) * uWindGrid.zw;
  return length(windGround(xz)) / max(texture2D(tWindUsual, uv).x, 0.3);
}
float windGust(vec2 xz) { return clamp(0.5 * length(windGround(xz)) / max(uWindSpeed, 0.5), 0.0, 1.0); }
`;function _s(e=5e3){let t=2654435769,n=()=>{t=t+1831565813>>>0;let e=Math.imul(t^t>>>15,t|1);return e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296},r=[5937722,8367678,11055178,13148224,11565626,9071162].map(e=>new W(e)),i=[],a=[],o=[],s=[],c=[],l=[],u=[];for(let t=0;t<e;t++){let e=[n(),n(),n()],d=n(),f=.06+n()*.06,p=r[Math.floor(n()*r.length)].clone().offsetHSL((n()-.5)*.03,0,(n()-.5)*.08);for(let[t,n]of[[-1,-1],[1,-1],[1,1],[-1,1]])i.push(...e),a.push(0,1,0),o.push(p.r,p.g,p.b),s.push(.3,.5,-1,.4),c.push(t,n,f,d),l.push(0,0);let m=t*4;u.push(m,m+1,m+2,m,m+2,m+3)}let d=new We;return d.setAttribute(`position`,new M(i,3)),d.setAttribute(`normal`,new M(a,3)),d.setAttribute(`color`,new M(o,3)),d.setAttribute(`aPaint`,new M(s,4)),d.setAttribute(`aCard`,new M(c,4)),d.setAttribute(`uv`,new M(l,2)),d.setIndex(new h(u,1)),d.userData.colours=o.slice(),d}function vs(e,t){let n=e.getAttribute(`color`),r=n.array;if(!t){r.set(e.userData.colours),n.needsUpdate=!0;return}let i=1374496513,a=()=>{i=i+1831565813>>>0;let e=Math.imul(i^i>>>15,i|1);return e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296},o=t.map(e=>new W(e));for(let e=0;e<r.length;e+=12){let t=o[Math.floor(a()*o.length)].clone().offsetHSL((a()-.5)*.03,0,(a()-.5)*.08);for(let n=0;n<4;n++)r[e+n*3]=t.r,r[e+n*3+1]=t.g,r[e+n*3+2]=t.b}n.needsUpdate=!0}function ys(e,t,n,r){let i=Math.floor(e),a=Math.floor(t),o=e-i,s=t-a,c=(e,t,i,a)=>{let o=((t%n+n)%n*n+(e%n+n)%n)*2;return r[o]*i+r[o+1]*a},l=e=>e*e*e*(e*(e*6-15)+10),u=c(i,a,o,s),d=c(i+1,a,o-1,s),f=c(i,a+1,o,s-1),p=c(i+1,a+1,o-1,s-1),m=l(o),h=l(s);return(u+(d-u)*m+(f-u)*h+(u-d-f+p)*m*h)*1.4}function bs(){let e=12345,t=()=>(e=e*1664525+1013904223>>>0)/4294967296,n=new Float32Array(512);for(let e=0;e<256;e++){let r=t()*Math.PI*2;n[e*2]=Math.cos(r),n[e*2+1]=Math.sin(r)}let r=new Uint8Array(65536);for(let e=0;e<256;e++)for(let t=0;t<256;t++){let i=ys((t+.5)*16/256,(e+.5)*16/256,16,n);r[e*256+t]=Math.round(G.clamp(i*.5+.5,0,1)*255)}let i=new gt(r,256,256,Ie,E);return i.wrapS=i.wrapT=R,i.magFilter=i.minFilter=de,i.needsUpdate=!0,i}var xs=(e,t)=>e.clone().multiplyScalar(.5).add(t.clone().multiplyScalar(.5)),Ss=null;function Cs(e,t,n,r){if(!Ss){let e=qa(12);Ss=xs(e.sunColor,e.skyColor)}let i=xs(n,r);return e.setRGB(t.r*i.r/Ss.r,t.g*i.g/Ss.g,t.b*i.b/Ss.b)}var ws=.6,Ts=`
uniform highp sampler2D uShelterFull;
uniform highp sampler2D uShelterPartial;
uniform highp sampler2D uShelterLand;
uniform mat4 uShelterMatrix;
// The map's depth to height: height = x - depth * y.
uniform vec2 uShelterHeight;
uniform float uShelterTexels;
// Whether p is under what the map at its texel holds, by a margin, so a roof doesn't shelter itself. A texel left clear
// (1, the far plane) holds nothing, however low p is.
float shelterUnder(highp sampler2D map, ivec2 t, float depth) {
  t = clamp(t, ivec2(0), ivec2(int(uShelterTexels) - 1));
  float d = texelFetch(map, t, 0).r;
  return d < 1.0 ? step(d, depth) : 0.0;
}
// Bilinear: the four texels round p, each compared, then blended.
float shelterSoft(highp sampler2D map, vec2 uv, float depth) {
  vec2 st = uv * uShelterTexels - 0.5;
  vec2 f = fract(st);
  ivec2 t = ivec2(floor(st));
  float a = shelterUnder(map, t, depth), b = shelterUnder(map, t + ivec2(1, 0), depth);
  float c = shelterUnder(map, t + ivec2(0, 1), depth), d = shelterUnder(map, t + ivec2(1, 1), depth);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float shelter(vec3 p) {
  vec3 s = (uShelterMatrix * vec4(p, 1.0)).xyz;
  if (any(lessThan(s.xy, vec2(0.0))) || any(greaterThan(s.xy, vec2(1.0)))) return 0.0;
  // Ten centimetres: a texel of a roof's slope, and a little more.
  float depth = s.z - 0.1 / uShelterHeight.y;
  return max(shelterSoft(uShelterFull, s.xy, depth), ${ws.toFixed(2)} * shelterSoft(uShelterPartial, s.xy, depth));
}
// The height a map holds over a point (its nearest texel), or -1e4 where it holds nothing or off the map.
float shelterHeightIn(highp sampler2D map, vec3 p) {
  vec3 s = (uShelterMatrix * vec4(p, 1.0)).xyz;
  if (any(lessThan(s.xy, vec2(0.0))) || any(greaterThan(s.xy, vec2(1.0)))) return -1e4;
  ivec2 t = clamp(ivec2(s.xy * uShelterTexels), ivec2(0), ivec2(int(uShelterTexels) - 1));
  float d = texelFetch(map, t, 0).r;
  return d < 1.0 ? uShelterHeight.x - d * uShelterHeight.y : -1e4;
}
float shelterTop(vec3 p) { return shelterHeightIn(uShelterFull, p); }
// The highest crown over p (where a drop a crown catches stops), and the land's own height there (the ground).
float crownTop(vec3 p) { return shelterHeightIn(uShelterPartial, p); }
float landTop(vec3 p) { return shelterHeightIn(uShelterLand, p); }
`,Es=5,Ds=new $e().set(0,0,0,-2,0,0,0,-2,0,0,0,0,0,0,0,1),Os=[`full`,`partial`,`land`],ks=e=>e===`none`?`full`:e;function As(e,t){return e.geometry.boundingBox||e.geometry.computeBoundingBox(),t.copy(e.geometry.boundingBox).applyMatrix4(e.matrixWorld)}var js=class{uniforms={uShelterFull:{value:null},uShelterPartial:{value:null},uShelterLand:{value:null},uShelterMatrix:{value:new $e().copy(Ds)},uShelterHeight:{value:new _(0,1)},uShelterTexels:{value:1}};area=null;full;partial;land;camera=new Et(-1,1,1,-1,0,1);overlay;overlayScene=new L;box=new q;whole=!0;parts={full:null,partial:null,land:null};added=new Map;drawn=null;lastPart=null;get dirty(){return this.whole||this.added.size>0||this.parts.full!==null||this.parts.partial!==null||this.parts.land!==null}get size(){return this.full.width}constructor(e=1024){let t=()=>{let t=new ee(e,e,{depthBuffer:!0,format:Ie});return t.depthTexture=new xt(e,e,le),t};this.full=t(),this.partial=t(),this.land=t(),this.uniforms.uShelterFull.value=this.full.depthTexture,this.uniforms.uShelterPartial.value=this.partial.depthTexture,this.uniforms.uShelterLand.value=this.land.depthTexture,this.uniforms.uShelterTexels.value=e,this.overlay=new o({glslVersion:K,vertexShader:Ms,fragmentShader:Ns,uniforms:{...this.uniforms,tAux:{value:null},uCameraWorld:{value:new $e},uHalf:{value:new _},uResolution:{value:new _}},transparent:!0,depthTest:!1,depthWrite:!1});let n=new ut(new re(2,2),this.overlay);n.frustumCulled=!1,this.overlayScene.add(n)}resize(e){if(e!==this.size){for(let t of[this.full,this.partial,this.land])t.setSize(e,e);this.uniforms.uShelterTexels.value=e,this.whole=!0}}changed(){this.whole=!0}add(e,t){this.added.set(e,t)}remove(e,t){this.added.delete(e)||(e.updateMatrixWorld(),this.changedIn(t,As(e,new q)))}changedIn(e,t){if(t.isEmpty())return;let n=this.parts[e];n?n.union(t):this.parts[e]=t.clone()}setArea(e){this.area=e,this.whole=!0}draw(e,t,n,r,i){if(!this.dirty)return!1;let a=this.area??r,o=this.takeParts();if(!a)return this.drawn=null,this.lastPart=null,this.uniforms.uShelterMatrix.value.copy(Ds),!0;let s=this.drawn;return o&&s&&s.area.x===a.x&&s.area.z===a.z&&s.area.side===a.side&&s.area.turn===a.turn&&this.drawParts(e,t,n,o,i)?!0:(this.lastPart=null,this.drawWhole(e,t,n,a,i),!0)}takeParts(){let e=this.whole,t=this.parts,n=new q;for(let[e,r]of this.added)e.parent&&(t[r]??=new q).union(As(e,n));return this.whole=!1,this.parts={full:null,partial:null,land:null},this.added.clear(),e?null:t}drawWhole(e,t,n,r,i){let a=this.box.makeEmpty(),o=new q,s=new Set;for(let e of n)e.cover!==`none`&&s.add(e.mesh);let c=-1/0;for(let e of t.children){let t=e;t.isMesh&&t.visible&&(As(t,o),a.union(o),s.has(t)&&(c=Math.max(c,o.max.y)))}let l=(a.isEmpty()?0:a.min.y)-1;c=Math.max(c,l)+1,this.drawn={area:{...r},top:c,bottom:l};let u=this.camera,d=r.side/2;u.left=-d,u.right=d,u.top=d,u.bottom=-d,u.near=0,u.far=c-l,u.position.set(r.x,c,r.z),u.up.set(-Math.sin(r.turn),0,-Math.cos(r.turn)),u.lookAt(r.x,l,r.z),u.updateProjectionMatrix(),u.updateMatrixWorld();let f=new $e().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);this.uniforms.uShelterMatrix.value.copy(f).multiply(u.projectionMatrix).multiply(u.matrixWorldInverse),this.uniforms.uShelterHeight.value.set(c,c-l),this.render(e,t,n,null,()=>!0,i)}drawParts(e,t,n,r,i){let{top:a,bottom:o}=this.drawn,s=new q,c=new Set,l={full:null,partial:null,land:null},u={full:null,partial:null,land:null};for(let e of Os){let t=r[e];t&&(l[e]=this.texels(t.clone().expandByScalar(Es)),l[e]&&(u[e]=this.footprint(l[e])))}for(let e of n){let t=e.cover===`none`?null:u[ks(e.cover)];if(t&&e.mesh.visible&&(As(e.mesh,s).expandByScalar(Es),!(s.min.x>t.max.x||s.max.x<t.min.x||s.min.z>t.max.z||s.max.z<t.min.z))){if(s.max.y-Es>a||s.min.y+Es<o)return!1;c.add(e.mesh)}}this.render(e,t,n,l,e=>c.has(e),i),this.lastPart=new q;for(let e of Os){let t=u[e];t&&this.lastPart.union(t)}return!0}render(e,t,n,r,i,a){let o=this.size,s=new Set;for(let e of t.children)e.visible&&(e.visible=!1,s.add(e));let c=n.map(e=>[e,e.mesh.material,e.mesh.visible]),l=a();try{for(let a of Os){let c=a===`full`?this.full:a===`partial`?this.partial:this.land;if(r){let e=r[a];if(!e)continue;c.scissor.set(e.x,e.y,e.w,e.h),c.scissorTest=!0}for(let e of n)e.mesh.visible=ks(e.cover)===a&&e.cover!==`none`&&s.has(e.mesh)&&i(e.mesh),e.mesh.material=e.depth;e.setRenderTarget(c),e.clear(!1,!0,!1),e.render(t,this.camera),c.scissorTest=!1,c.scissor.set(0,0,o,o)}}finally{l();for(let[e,t,n]of c)e.mesh.material=t,e.mesh.visible=n;for(let e of s)e.visible=!0}e.setRenderTarget(null)}footprint(e){let t=this.uniforms.uShelterMatrix.value.clone().invert(),n=new w,r=new q;for(let i of[e.x,e.x+e.w])for(let a of[e.y,e.y+e.h])r.expandByPoint(n.set(i/this.size,a/this.size,.5).applyMatrix4(t));return r}texels(e){let t=this.uniforms.uShelterMatrix.value,n=this.size,r=new w,i=1/0,a=1/0,o=-1/0,s=-1/0;for(let n of[e.min.x,e.max.x])for(let c of[e.min.z,e.max.z])r.set(n,0,c).applyMatrix4(t),i=Math.min(i,r.x),o=Math.max(o,r.x),a=Math.min(a,r.y),s=Math.max(s,r.y);let c=Math.max(0,Math.floor(i*n)-1),l=Math.max(0,Math.floor(a*n)-1),u=Math.min(n,Math.ceil(o*n)+1),d=Math.min(n,Math.ceil(s*n)+1);return u>c&&d>l?{x:c,y:l,w:u-c,h:d-l}:null}drawOverlay(e,t,n,r,i){let a=this.overlay.uniforms;a.tAux.value=t,a.uCameraWorld.value.copy(n.matrixWorld),a.uHalf.value.set(n.right,n.top),a.uResolution.value.set(r,i),e.render(this.overlayScene,this.camera)}dispose(){this.full.dispose(),this.partial.dispose(),this.land.dispose(),this.overlay.dispose()}},Ms=`
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,Ns=`
precision highp float;
${Ts}
uniform sampler2D tAux;
uniform mat4 uCameraWorld;
uniform vec2 uHalf;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 fragColor;
void main() {
  // The map itself, from above, in the bottom-left corner: roofs blue (lighter higher up), crowns teal.
  float inset = min(uResolution.x, uResolution.y) * 0.32;
  vec2 px = gl_FragCoord.xy - 12.0;
  if (px.x >= 0.0 && px.y >= 0.0 && px.x < inset && px.y < inset) {
    vec2 uv = px / inset;
    float full = texture(uShelterFull, uv).r, part = texture(uShelterPartial, uv).r;
    vec3 col = vec3(0.93, 0.9, 0.82);
    if (part < 1.0) col = mix(vec3(0.55, 0.85, 0.75), vec3(0.2, 0.55, 0.5), part);
    if (full < 1.0 && full <= part) col = mix(vec3(0.75, 0.85, 1.0), vec3(0.1, 0.25, 0.75), smoothstep(0.0, 1.0, full));
    fragColor = vec4(col, 0.92);
    return;
  }
  vec4 aux = texture(tAux, vUv);
  if (aux.z <= 0.0) discard;
  // Where this pixel is: the view's orthographic camera, back along its view by the depth.
  vec3 p = (uCameraWorld * vec4((vUv * 2.0 - 1.0) * uHalf, -aux.z, 1.0)).xyz;
  float under = shelter(p);
  vec3 s = (uShelterMatrix * vec4(p, 1.0)).xyz;
  bool onMap = all(greaterThanEqual(s.xy, vec2(0.0))) && all(lessThanEqual(s.xy, vec2(1.0)));
  // A roof's own top: at the full map's height there.
  float top = onMap ? 1.0 - smoothstep(0.08, 0.2, abs(shelterTop(p) - p.y)) : 0.0;
  float hatch = step(0.5, fract((gl_FragCoord.x + gl_FragCoord.y) / 10.0));
  float full = clamp((under - ${ws.toFixed(2)}) / ${.4.toFixed(2)}, 0.0, 1.0);
  float part = min(under, ${ws.toFixed(2)}) / ${ws.toFixed(2)} - full;
  vec4 col = vec4(0.0);
  col = mix(col, vec4(0.45, 0.95, 0.85, 0.4), part);
  col = mix(col, vec4(0.15, 0.35, 1.0, 0.45 + 0.25 * hatch), full);
  col = mix(col, vec4(1.0, 0.85, 0.2, 0.55), top * (1.0 - full));
  if (col.a <= 0.0) discard;
  fragColor = col;
}
`,Ps={density:.18,stroke:[2,1.4,.3,.42],taper:.5,speed:[7,10],slant:.7,splash:[.28,.2],veil:[.26,.3,6,.6,12],rings:[.32,.022,.5]},Fs=65536,Is=18.4,Ls=.3,Rs=1.2,zs=`0.78, 0.82, 0.86`,Bs=`
vec2 screenOf(vec3 p, out float z) {
  vec4 c = projectionMatrix * viewMatrix * vec4(p, 1.0);
  z = c.z / c.w;
  return c.xy / c.w;
}
// Where a drop falling down its slanted path (at height y it is over g - slant (y - base)) from \`top\` first meets the
// cover a map holds: stepping down the path to the first point under the cover, then halving the step between it and
// the last point over it. The steps are about a metre apart across the land (so a panel's edge isn't stepped over) and
// two up and down, \`most\` of them at most; straight down, one look. Far below the land if it meets none. A path that
// grazes the downwind edge of cover between two steps (a strip under a metre, in a wind) gets by, as rain blows in under
// an eave.
float coverAlong(highp sampler2D map, vec2 g, vec2 slant, float base, float top, float most) {
  if (dot(slant, slant) < 1e-4) return shelterHeightIn(map, vec3(g.x, 0.0, g.y));
  float over = top;
  int steps = int(clamp(ceil((top - base) * max(length(slant), 0.5)), 8.0, most));
  for (int i = 0; i <= steps; i++) {
    float y = mix(top, base, float(i) / float(steps));
    vec2 at = g - slant * (y - base);
    if (shelterHeightIn(map, vec3(at.x, 0.0, at.y)) < y) { over = y; continue; }
    if (i == 0) return top;
    float under = y;
    for (int j = 0; j < 3; j++) {
      float m = 0.5 * (over + under);
      vec2 am = g - slant * (m - base);
      if (shelterHeightIn(map, vec3(am.x, 0.0, am.y)) < m) over = m; else under = m;
    }
    return under;
  }
  return -1e9;
}
`,Vs=`
${zo}
${Lo}
${Ro}
${Bo}
${Wo}
${gs}
${Ts}
attribute vec3 aCorner;  // x across (-1, 1); y along the stroke (0 its tail, 1 its head) or up the splash (-1, 1); z 0 the stroke, 1 the splash
uniform vec2 uScreen;
uniform vec3 uViewTarget;
uniform vec4 uRainCells;   // the cells drawn: x, y the first (world cell), z how many across, w how many in all
uniform vec4 uRain;        // x the drops a cell shown (by rank), y how far the rain has fallen (m), z a drop's cycle (m), w how fast it falls (m/s)
uniform vec4 uRainStroke;  // its length (m), width (px), softness, opacity
uniform vec3 uRainShape;   // its taper, how far the wind slants it, the splash's size (m)
uniform float uRainSplash; // how far a drop would fall while it splashes (m)
varying vec4 vShape;       // the stroke: px across, px along from the tail, its length and half its width in px. The splash: its corner, and its age (0..1) in w
varying vec4 vColor;       // its colour, and how opaque
varying float vPart;       // 0 the stroke, 1 the splash
const float CELL = ${8 .toFixed(1)};
const float COLUMN = ${16 .toFixed(1)};
const float RANK_FADE = ${Ls};
// Starting high over the land, a drop fades in over its first few metres, so none appears out of nothing.
const float FADE_IN = 3.0;

${Bs}
void main() {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  vShape = vec4(0.0); vColor = vec4(0.0); vPart = aCorner.z;
  // Which drop: its cell of the world and its place among the cell's (its rank: the first ones show in the lightest
  // rain), and its own four random numbers, all from those, so a drop is the same whichever cells are drawn.
  int cells = int(uRainCells.w), across_ = int(uRainCells.z);
  int index = gl_InstanceID % cells, slot = gl_InstanceID / cells;
  vec2 cell = uRainCells.xy + vec2(float(index % across_), float(index / across_));
  vec2 seed = cell + float(slot) * vec2(61.7, -37.3);
  vec4 rnd = vec4(hash12(seed), hash12(seed + 19.19), hash12(seed + 47.7), hash12(seed + 83.3));
  float show = clamp((uRain.x - float(slot) - rnd.x * (1.0 - RANK_FADE)) / RANK_FADE, 0.0, 1.0);
  if (show <= 0.0) return;
  // Where it is in its fall, and where it lands this time round: somewhere new in its cell each fall.
  float u = uRain.y / uRain.z + rnd.y * 37.0;
  float round_ = mod(floor(u), 4096.0), fallen = fract(u) * uRain.z;
  vec2 g = (cell + hash22(vec2(rnd.z * 4093.0 + round_ * 1.618, rnd.w * 3967.0 + round_ * 0.7071))) * CELL;
  // Slanted by the wind where it lands: blown along at the wind's speed as it falls.
  vec2 slant = windGround(g) / max(uRain.w, 1.0) * uRainShape.y;
  slant *= min(1.0, ${Rs.toFixed(2)} / max(length(slant), 1e-4));
  // Where it would stop in the open: the land, or the water over it.
  float land = landTop(vec3(g.x, 0.0, g.y));
  if (land < -1e3) return;
  vec3 sheet = waterSheet(g);
  bool wet = sheet.z > -${(wo*.5).toFixed(3)} && sheet.x > land;
  float base = wet ? sheet.x : land;
  float top = base + COLUMN * (0.85 + 0.3 * fract(rnd.y * 5.13));
  // Off the screen, its whole path (a straight line, so between its ends): nothing more to do.
  float z0, z1;
  vec2 s0 = screenOf(vec3(g.x, base, g.y), z0);
  vec2 top0 = g - slant * (top - base);
  vec2 s1 = screenOf(vec3(top0.x, top, top0.y), z1);
  // Its widest stroke or its splash may reach past the path's ends by up to this much (px).
  float pxPerMetre = projectionMatrix[0][0] * uScreen.x * 0.5;
  vec2 reach = 1.0 + 2.0 * max(0.65 * uRainStroke.y + 1.0, max(uRainShape.z * pxPerMetre, 3.0)) / uScreen;
  if (any(greaterThan(min(s0, s1), reach)) || any(lessThan(max(s0, s1), -reach))) return;

  // Where it stops: there, or a roof, or (some of the time) a crown, along the way.
  float stop = base;
  float roof = coverAlong(uShelterFull, g, slant, base, top, 24.0);
  if (roof > stop) { stop = roof; wet = false; }
  bool caught = false;
  if (rnd.w < ${ws.toFixed(2)}) {
    float crown = coverAlong(uShelterPartial, g, slant, base, top, 24.0);
    // Lost among the leaves somewhere under the crown's top.
    if (crown > stop) { stop = max(crown - fract(rnd.z * 7.31) * 2.0, stop); caught = true; }
  }
  float drop = top - stop;
  float length_ = uRainStroke.x * (0.8 + 0.4 * fract(rnd.z * 3.7));
  vec2 half_ = uScreen * 0.5;

  // Lit as rain is where it is: by the sky, a little by the sun, as bright as the light there.
  vec3 mid = vec3(g.x, stop + 1.0, g.y);
  cloudAt(mid);
  vec3 col = exposeHere(vec3(${zs}) * mix(skyTint(), sunTint(), 0.3));
  float alpha = show;

  if (aCorner.z < 0.5) {
    // The stroke: its head falling from the top to where it stops, its tail a stroke's length behind, both stopping there.
    float head = max(top - fallen, stop), tail = max(min(top - fallen + length_, top), stop);
    if (tail - head < 1e-3) return;
    vec2 ha = g - slant * (head - base), ta = g - slant * (tail - base);
    float za, zb;
    vec2 sa = screenOf(vec3(ta.x, tail, ta.y), za) * half_, sb = screenOf(vec3(ha.x, head, ha.y), zb) * half_;
    vec2 d = sb - sa;
    float len = length(d);
    vec2 dir = len > 1e-3 ? d / len : vec2(0.0, -1.0), across = vec2(-dir.y, dir.x);
    // Each a little wider or narrower, fainter or stronger than the next, as a brush lays them.
    float hw = 0.5 * uRainStroke.y * (0.7 + 0.6 * fract(rnd.w * 11.3)), pad = hw + 1.0;
    float t = aCorner.y;
    vec2 sp = mix(sa, sb, t) + dir * (t * 2.0 - 1.0) * pad + across * aCorner.x * pad;
    gl_Position = vec4(sp / half_, mix(za, zb, t), 1.0);
    vShape = vec4(aCorner.x * pad, t * len + (t * 2.0 - 1.0) * pad, len, hw);
    // Fading as it shortens into what it hit, so its round end doesn't linger and blink out.
    float left = smoothstep(0.0, 0.4 * length_, tail - head);
    vColor = vec4(col, alpha * uRainStroke.w * (0.65 + 0.35 * fract(rnd.z * 17.9)) * smoothstep(0.0, FADE_IN, fallen) * left);
  } else {
    // The splash, where it landed, for a moment after: not on the water (the water's rings are its splash) nor in a crown.
    float age = (fallen - drop) / uRainSplash;
    if (wet || caught || age < 0.0 || age > 1.0) return;
    vec2 at = g - slant * (stop - base);
    // Brought a little towards the camera, so the land it lies on doesn't hide it.
    vec3 toCam = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
    float z;
    vec2 sc = screenOf(vec3(at.x, stop + 0.05, at.y) + toCam * 0.3, z) * half_;
    float size = max(uRainShape.z * pxPerMetre, 3.0);
    gl_Position = vec4((sc + aCorner.xy * size) / half_, z, 1.0);
    vShape = vec4(aCorner.xy, 0.0, age);
    vColor = vec4(col, alpha * min(1.0, uRainStroke.w * 1.6));
  }
}
`,Hs=`
precision highp float;
uniform vec4 uRainStroke;
uniform vec3 uRainShape;
varying vec4 vShape;
varying vec4 vColor;
varying float vPart;
layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gAux;
// A soft line's cover at d px from its middle, half w px wide: from a crisp edge (a pixel's blur) to a soft fall-off.
float lineCover(float d, float w, float soft) {
  float crisp = clamp(w + 0.5 - d, 0.0, 1.0);
  float x = d / max(w + 0.5, 0.75);
  return mix(crisp, exp(-x * x * 2.5), soft);
}
void main() {
  float a;
  if (vPart < 0.5) {
    float len = vShape.z, along = clamp(vShape.y, 0.0, len), t = len > 0.0 ? along / len : 1.0;
    // Thinner and fainter towards the tail.
    float taper = mix(1.0 - uRainShape.x, 1.0, t);
    float w = vShape.w * taper;
    // Thinner than a pixel: as wide as a pixel, fainter.
    float thin = min(1.0, w / 0.6);
    a = lineCover(length(vec2(vShape.x, vShape.y - along)), max(w, 0.6), uRainStroke.z) * thin * taper;
  } else {
    vec2 q = vShape.xy;
    float age = vShape.w;
    float grow = smoothstep(0.0, 0.25, age), fade = (1.0 - age) * (1.0 - age);
    // A crown: a few short ticks thrown up and out from where it landed.
    vec2 o = q - vec2(0.0, -0.55);
    float r = length(o), ang = atan(o.x, o.y);
    float k = clamp(floor(ang / 0.5 + 0.5), -2.0, 2.0);
    float off = abs(ang - k * 0.5) * r;
    float reach = mix(0.35, 1.05, grow);
    a = (1.0 - smoothstep(0.05, 0.12, off)) * smoothstep(reach - 0.5, reach - 0.3, r) * (1.0 - smoothstep(reach - 0.1, reach, r));
    a *= step(abs(ang), 1.3);
    a *= fade * smoothstep(0.0, 0.2, age);
  }
  a *= vColor.a;
  if (a < 0.004) discard;
  gColor = vec4(vColor.rgb * a, a);
  // The aux as it was: no lines on the rain, and the fog and haze by what's behind it.
  gAux = vec4(0.0);
}
`,Us=`
uniform vec4 uRings;     // x the share of cells with a ring each time, y the widest ring (m), z the line's width (m), w how strong
float rainRings(vec2 xz) {
  float cell = uRings.y * 2.0;
  vec2 q = xz / cell, i = floor(q);
  // At least about a pixel wide, so the rings don't shimmer as the camera draws back; fainter as they shrink to nothing.
  float px = max(length(fwidth(xz)), 1e-4);
  float w = max(uRings.z, px * 0.8);
  float far = smoothstep(px * 4.0, px * 10.0, uRings.y);
  float sum = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 c = i + vec2(x, y);
    float h = hash12(c * 1.37 + 0.5);
    float beat = uTime * (0.9 + 0.5 * h) + h * 9.0;
    float k = floor(beat), life = fract(beat);
    // Whether this cell rings this time, faded over a band of the share rather than switched, so a ring already spreading
    // as the rain eases off or sets in fades rather than blinks.
    float on = clamp((uRings.x - hash12(c * 3.1 + mod(k, 512.0) * 0.731) * 0.85) / 0.15, 0.0, 1.0);
    if (on <= 0.0) continue;
    vec2 r = hash22(c + mod(k, 512.0) * vec2(7.13, 3.71));
    vec2 centre = (c + 0.2 + 0.6 * r) * cell;
    float d = length(xz - centre), rad = life * uRings.y * (0.6 + 0.4 * r.x);
    float fade = (1.0 - life) * (1.0 - life) * smoothstep(0.0, 0.06, life);
    float ring = exp(-pow((d - rad) / w, 2.0)) * fade;
    sum += ring * on;
  }
  return min(sum, 1.0) * uRings.w * far;
}
`,Ws=`
uniform vec4 uRainVeil;       // x how thick, y how far its streaks have fallen (in their noise's cells), z its slant across the screen, w how crisp
uniform vec4 uRainVeilShape;  // x its streaks' width (m), y their length (m), z its sheets' size (m), w how far its sheets have fallen (cells)
uniform vec3 uRainVeilColor;
// How far past the camera's target it's at its thickest (m).
const float VEIL_FAR = 30.0;
float rainVeil(vec2 ndc, float depth) {
  if (uRainVeil.x <= 0.0) return 0.0;
  float far = smoothstep(0.0, VEIL_FAR, depth - uTargetDepth);
  // Where the pixel is in the view's plane (m), moving with the land as the camera pans.
  vec3 r = normalize(uCamRight), u = normalize(uCamUp);
  vec2 s = vec2(dot(uCamPos, r) + ndc.x * length(uCamRight), dot(uCamPos, u) + ndc.y * length(uCamUp));
  s.x += s.y * uRainVeil.z;
  float n = fogNoise(vec2(s.x / uRainVeilShape.x, s.y / uRainVeilShape.y + uRainVeil.y));
  float streak = smoothstep(mix(-0.2, 0.25, uRainVeil.w), mix(0.9, 0.45, uRainVeil.w), n);
  float sheets = fogNoise(s / uRainVeilShape.z + vec2(31.0, uRainVeilShape.w)) * 0.5 + 0.5;
  return uRainVeil.x * far * mix(0.3, 1.0, streak) * mix(0.45, 1.0, sheets);
}
`;function Gs(){let e=new T,t=new Float32Array([-1,0,0,1,0,0,-1,1,0,1,1,0,-1,-1,1,1,-1,1,-1,1,1,1,1,1]);return e.setAttribute(`aCorner`,new U(t,3)),e.setAttribute(`position`,new U(new Float32Array(24),3)),e.setIndex([0,1,2,2,1,3,4,5,6,6,5,7]),e.instanceCount=0,e.boundingBox=new q,e.boundingSphere=new l(new w,1/0),e}var Ks=new w,qs=new w;function Js(e,t,n){n.makeEmpty();let r=qs.set(0,0,-1).transformDirection(e.matrixWorld);for(let i of[t-8,t+8+Is])for(let[t,a]of[[-1,-1],[1,-1],[-1,1],[1,1]]){let o=Ks.set(t,a,0).unproject(e);o.addScaledVector(r,(i-o.y)/r.y),n.expandByPoint(o)}return n}var Ys=class{uniforms={uRainCells:{value:new J(0,0,1,1)},uRain:{value:new J(0,0,1,8)},uRainStroke:{value:new J},uRainShape:{value:new w},uRainSplash:{value:1},uRings:{value:new J(0,.4,.04,0)}};veil={uRainVeil:{value:new J},uRainVeilShape:{value:new J(1,1,1,1)},uRainVeilColor:{value:new W}};mesh;fallen=0;last=NaN;box=new q;corner=new w;constructor(e,t){let n=Gs(),r=new o({glslVersion:K,uniforms:{...e,...t,...this.uniforms},vertexShader:Vs,fragmentShader:Hs,transparent:!0,depthWrite:!1,side:2,blending:5,blendSrc:201,blendDst:205,blendSrcAlpha:201,blendDstAlpha:205});this.mesh=new ut(n,r),this.mesh.frustumCulled=!1,this.mesh.userData.kind=`rain`,this.mesh.userData.reflect=!1,this.mesh.userData.under=!1}update(e,t,n,r,i,a,o,s,c){let l=Ps,u=a?G.clamp(t,0,1):0,d=G.lerp(l.speed[0],l.speed[1],u),f=e-this.last;f>=0?this.fallen+=d*(f<=1?f:.1):this.fallen=d*e,this.last=e;let p=l.splash[1]*(l.speed[0]+l.speed[1])*.5,m=18.4+Math.max(l.stroke[0]*1.2,p)+1,h=l.density*u**.6*Math.min((n/44)**2,4)*i*8*8,g=this.uniforms,_=Math.min(Rs,o.length()/Math.max(d,1)*l.slant*1.5+.1),v=Js(s,c,this.box),y=_*26.4+2,b=Math.floor((v.min.x-y)/8),x=Math.floor((v.min.z-y)/8),S=Math.floor((v.max.x+y)/8)-b+1,C=S*(Math.floor((v.max.z+y)/8)-x+1),w=Math.min(Math.ceil(h),Math.floor(Fs/C));g.uRainCells.value.set(b,x,S,C),g.uRain.value.set(h,this.fallen%(m*4096),m,d),g.uRainStroke.value.set(l.stroke[0],l.stroke[1]*Math.sqrt(n/44)*r,l.stroke[2],l.stroke[3]),g.uRainShape.value.set(l.taper,l.slant,l.splash[0]),g.uRainSplash.value=p;let T=this.mesh.geometry;T.instanceCount=C*w,this.mesh.visible=w>0,g.uRings.value.set(Math.min(1,u*1.1),l.rings[0],l.rings[1],l.rings[2]*Math.min(1,.4+u));let E=this.veil,D=this.corner.setFromMatrixColumn(s.matrixWorld,0).normalize(),O=o.x*D.x+o.y*D.z,k=this.fallen*Math.cos(Math.PI/6);E.uRainVeil.value.set(l.veil[0]*u,k/l.veil[2]%16,O*l.slant/(d*Math.cos(Math.PI/6)),l.veil[3]),E.uRainVeilShape.value.set(l.veil[1],l.veil[2],l.veil[4],k*.25/l.veil[4]%16)}setVeilColor(e){e(this.veil.uRainVeilColor.value,Xs)}},Xs=new W().setRGB(.74,.78,.82),Zs=2.5,Qs=`
uniform sampler2D tSunHad;   // the sun each spot of the ground has had since dawn (SunMemory), over the hollows map's square
uniform float uSunHadOn;
// The sun had at xz, 0 (none since dawn) .. 1 (enough to clear any frost short of a hard one): (x) on the ground, (y) on
// what's highest there (a roof's top, a crown's; the ground's where nothing stands over it).
vec2 sunHadAt(vec2 xz) {
  if (uSunHadOn < 0.5 || uHollowsOn < 0.5) return vec2(0.0);
  vec2 uv = (uHollowsMap * vec3(xz, 1.0)).xy;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec2(0.0);
  return clamp(texture(tSunHad, uv).rg, 0.0, 1.0);
}
// How much of a surface the frost whitens here, 0..1: 'early' is how early this spot frosts (1 a hollow or a grass tip,
// first in and last out; -1 an open rise), 'sun' the sun it's had since dawn (sunHadAt), 'brush' the material's own
// brushwork there (about -1..1), which the edge of what's left wanders along, as a melting frost's does, rather than
// tracing a shadow's line. Each spot frosts once the game's frost passes its own threshold, which the sun raises: frost
// at 1 is past them all. No noise of its own: frost is in every pixel of the land, many times over in the grass.
float frostCover(float early, float sun, float brush) {
  float th = 0.06 + 0.3 * (0.5 - 0.5 * clamp(early, -1.0, 1.0)) + 0.6 * sun + 0.07 * clamp(brush, -1.0, 1.0);
  return smoothstep(th - 0.08, th + 0.08, gFrost);
}
// The rime over 'col': 'amount' how much (frostCover times how far the surface takes it), lit as the snow's paint is
// ('light', 0 deep shade .. 1 full sun), its crystals the material's own brushwork ('brush', about -1..1), broken up
// over metres by the land's pattern (the thin snow's, from the hollows map). Matte: the developer's pick of three
// candidates on #14 (the others were crisp, whiter with a deeper blue shade, and glittering, with points of light).
vec3 frostPaint(vec3 col, float light, float amount, float brush) {
  if (amount <= 0.0) return col;
  float grain = clamp(brush, -1.0, 1.0);
  // A rime, not a cover: the paint under it shows through, paled toward the snow's paint, and keeps its own hues (the
  // ground's greens and browns read through it). In shade it's the snow's blue, softened toward the paint under it.
  vec3 rime = snowPaint(light, 0.05, 0.0);
  float inShade = 1.0 - smoothstep(0.30, 0.62, light);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 hue = col - lum;
  float mottle = gHollow.z >= 0.0 ? clamp(gHollow.w, -1.0, 1.0) : 0.0;
  rime = mix(rime, mix(rime, col * 1.25 + 0.08, 0.45), inShade);
  float a = amount * (0.46 + 0.1 * mottle + 0.12 * grain);
  return mix(col, rime, a) + hue * a * mix(0.6, 0.2, inShade);
}
`,$s=class{uniforms={tSunHad:{value:null},uSunHadOn:{value:0}};targets;camera=new Et(-1,1,1,-1,0,1);quadScene=new L;material;hour=null;pending=0;fresh=!0;blank=!1;size;constructor(e,t=512){this.size=t;let n=()=>new ee(t,t,{type:A,format:pt,depthBuffer:!1,minFilter:de,magFilter:de,generateMipmaps:!1});this.targets=[n(),n()],this.material=new o({glslVersion:K,vertexShader:ec,fragmentShader:tc,uniforms:{...e,tPrev:{value:null},uAdd:{value:0},uFresh:{value:1},uGuess:{value:0},uUnmap:{value:new B}},depthTest:!1,depthWrite:!1});let r=new ut(new re(2,2),this.material);r.frustumCulled=!1,this.quadScene.add(r)}on=!1;update(e,t,n,r,i,a,o,s,c){let l=this.uniforms;if(!o||!c){this.on=!1,l.uSunHadOn.value=0,this.fresh=!0,this.blank=!1,this.hour=null;return}this.on||(this.on=!0,this.fresh=!0,this.blank=!1,this.hour=null);let u=t===null?null:((t-n)%24+24)%24,d=u!==null&&u<r-n,f=d?G.smoothstep(i,0,25)*(1-.85*a):0,p=0,m=0;if(u===null){if(!this.fresh)return}else if(!d){if(this.hour=u,this.pending=0,this.blank)return;this.fresh=!0,this.blank=!0}else if(this.hour===null||u<this.hour-1e-6||u-this.hour>.5){let e=this.hour===null||u<this.hour,t=e?0:this.hour;e&&(this.fresh=!0),this.pending=0,p=(u-t)*f,m=1,this.hour=u}else{if(this.pending+=u-this.hour,this.hour=u,this.pending<.02&&!this.fresh)return;p=this.pending*f,this.pending=0}d&&(this.blank=!1);let h=this.material.uniforms;h.uUnmap.value.copy(s).invert(),h.tPrev.value=this.targets[0].texture,h.uAdd.value=p/Zs,h.uFresh.value=+!!this.fresh,h.uGuess.value=m,e.setRenderTarget(this.targets[1]),e.render(this.quadScene,this.camera),e.setRenderTarget(null),this.targets.reverse(),this.fresh=!1,l.tSunHad.value=this.targets[0].texture,l.uSunHadOn.value=1}dispose(){for(let e of this.targets)e.dispose();this.material.dispose()}},ec=`
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,tc=`
precision highp float;
${Ts}
${_a}
uniform float uCloudStrength;
uniform sampler2D uShadowMap;
uniform mat4 uShadowMatrix;
uniform vec2 uShadowTexel;
uniform vec2 uShadowArea;
${Ho}
uniform sampler2D tPrev;
uniform float uAdd;
uniform float uFresh;
uniform float uGuess;
uniform mat3 uUnmap;
in vec2 vUv;
out vec4 fragColor;
// The sun at a point, over a patch about 0.6 m across (a shadow's edge moves through the morning, so what it leaves is
// soft). Out of the shadow map's window (the shadows follow the view), what's there is unknown: taken as a third of the
// open's sun, as for the hours skipped by a jump (uGuess), so shade the view left keeps some of its frost.
float sunAt(vec3 p) {
  float seen = 0.0;
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.0472 + 0.3;
    vec4 s = uShadowMatrix * vec4(p + vec3(cos(a), 0.0, sin(a)) * 0.3, 1.0);
    vec3 uvz = s.xyz / s.w;
    bool out_ = any(lessThan(uvz.xy, vec2(0.0))) || any(greaterThan(uvz.xy, vec2(1.0))) || uvz.z > 1.0;
    seen += out_ ? 0.33 : uvz.z - 0.003 <= shadowDepthAt(uvz.xy) ? 1.0 : 0.0;
  }
  return seen / 6.0;
}
void main() {
  vec2 had = uFresh > 0.5 ? vec2(0.0) : texture(tPrev, vUv).rg;
  vec2 xz = (uUnmap * vec3(vUv, 1.0)).xy;
  vec3 p = vec3(xz.x, 0.0, xz.y);
  float land = landTop(p);
  float top = max(shelterTop(p), crownTop(p));
  float lift = 0.08 + shadowSlack(vec3(0.0, 1.0, 0.0));   // off the ground, more where the map's texels are coarse
  float ground = land > -1e3 ? sunAt(vec3(xz.x, land + lift, xz.y)) : 1.0;
  float high = top > land + 0.3 ? sunAt(vec3(xz.x, top + lift, xz.y)) : ground;
  float cloud = 1.0 - 0.85 * cloudMapShade(xz) * uCloudStrength;
  // Hours skipped (uGuess 1) are taken from this one shadow, though the shadows swung through them: what's in shade now
  // is taken as having had a third of the open's sun, so a still at noon keeps frost in the long shade, thinned.
  vec2 sun = mix(vec2(ground, high), mix(vec2(ground, high), vec2(1.0), 0.33), uGuess);
  fragColor = vec4(had + uAdd * cloud * sun, 0.0, 1.0);
}
`,nc=.6,rc=[`snow`,`frost`,`wet`,`mud`],ic=`
uniform sampler2D tGroundA;     // the ground as it was (snow, frost, wet, mud per cell, a byte each)
uniform sampler2D tGroundB;     // the ground as last sent
uniform float uGroundBlend;     // how far it has eased from A to B
uniform vec4 uGroundGrid;       // x0, z0, 1 / the grid's width, 1 / its depth (metres)
uniform float uGroundOn;        // 0 when it's bare everywhere, as it was and as last sent; 2 drawing the bed under the water
// The last read, kept: a material's wet and its snow read the same point, and the second takes the first's (#11).
vec2 gGroundAt = vec2(-1e30);
vec4 gGroundHere = vec4(0.0);
vec4 groundState(vec2 xz) {
  if (uGroundOn < 0.5) return vec4(0.0);
  if (xz == gGroundAt) return gGroundHere;
  vec2 uv = (xz - uGroundGrid.xy) * uGroundGrid.zw;
  // Once it has eased in (nearly always), only the map last sent.
  vec4 b = texture(tGroundB, uv);
  gGroundAt = xz;
  gGroundHere = uGroundBlend >= 1.0 ? b : mix(texture(tGroundA, uv), b, uGroundBlend);
  return gGroundHere;
}
`,ac=class{uniforms={tGroundA:{value:sc(1,1)},tGroundB:{value:sc(1,1)},uGroundBlend:{value:1},uGroundGrid:{value:new J(0,0,1,1)},uGroundOn:{value:0}};get any(){return this.uniforms.uGroundOn.value>.5}get frost(){return this.any&&(this.frostFrom||this.frostTo)}nx=0;nz=0;cell=0;x0=0;z0=0;from=null;to=null;anyFrom=!1;anyTo=!1;frostFrom=!1;frostTo=!1;start=0;ease=0;blend(e){if(this.ease<=0)return 1;let t=G.clamp((e-this.start)/this.ease,0,1);return t*t*(3-2*t)}update(e){let t=this.blend(e);this.uniforms.uGroundBlend.value=t,t>=1&&(this.frostFrom=this.frostTo),t>=1&&this.anyFrom!==this.anyTo&&(this.anyFrom=this.anyTo,this.uniforms.uGroundOn.value=+!!this.anyTo)}set(e,t,n=nc){let r=this.uniforms;if(!e){let{nx:e,nz:i,cell:a,x0:o,z0:s}=this;if(this.to&&n>0){this.set({nx:e,nz:i,cell:a,x0:o,z0:s},t,n);return}this.from=this.to=null,this.anyFrom=this.anyTo=this.frostFrom=this.frostTo=!1,r.uGroundOn.value=0;return}let{nx:i,nz:a,cell:o,x0:s,z0:c}=e,l=i*a;for(let t of rc){let n=e[t];if(n&&n.length!==l)throw Error(`ground map: ${n.length} ${t} values for ${i} x ${a} cells`)}let u=new Uint8Array(l*4),d=!1,f=!1;if(rc.forEach((t,n)=>{let r=t===`mud`&&e.mud?oc(e.mud,i,a):e[t];if(r)for(let e=0;e<l;e++){let i=Math.round(G.clamp(r[e]||0,0,1)*255);u[e*4+n]=i,i&&(d=!0,t===`frost`&&(f=!0))}}),!(this.to&&i===this.nx&&a===this.nz&&o===this.cell&&s===this.x0&&c===this.z0))this.nx=i,this.nz=a,this.cell=o,this.x0=s,this.z0=c,r.tGroundA.value.dispose(),r.tGroundB.value.dispose(),r.tGroundA.value=sc(i,a),r.tGroundB.value=sc(i,a),r.uGroundGrid.value.set(s,c,1/(i*o),1/(a*o)),this.from=u,this.anyFrom=d,this.frostFrom=f,n=0;else{let e=this.blend(t),n=this.from,r=this.to;if(e>=1)this.from=r,this.anyFrom=this.anyTo,this.frostFrom=this.frostTo;else{let t=new Uint8Array(n.length);for(let i=0;i<t.length;i++)t[i]=Math.round(n[i]+(r[i]-n[i])*e);this.from=t,this.anyFrom||=this.anyTo,this.frostFrom||=this.frostTo}}this.to=u,this.anyTo=d,this.frostTo=f,this.start=t,this.ease=n,cc(r.tGroundA.value,this.from),cc(r.tGroundB.value,u),r.uGroundBlend.value=this.blend(t),r.uGroundOn.value=d||n>0&&this.anyFrom?1:0}};function oc(e,t,n){let r=new Float32Array(e.length);for(let i=0;i<n;i++)for(let a=0;a<t;a++){let o=0;for(let r=Math.max(0,i-1);r<=Math.min(n-1,i+1);r++)for(let n=Math.max(0,a-1);n<=Math.min(t-1,a+1);n++)o=Math.max(o,e[r*t+n]||0);r[i*t+a]=o}return r}function sc(e,t){let n=new gt(new Uint8Array(e*t*4),e,t,j,E);return n.minFilter=n.magFilter=de,n.wrapS=n.wrapT=we,n.needsUpdate=!0,n}function cc(e,t){e.image.data=t,e.needsUpdate=!0}var lc=`
uniform sampler2D tHollows;
uniform mat3 uHollowsMap;       // x, z to the map's uv
uniform float uHollowsOn;
vec4 hollowAt(vec2 xz) {
  if (uHollowsOn < 0.5) return vec4(0.0, 0.0, -1.0, 0.0);
  vec2 uv = (uHollowsMap * vec3(xz, 1.0)).xy;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec4(0.0, 0.0, -1.0, 0.0);
  return texture(tHollows, uv);
}
`,uc=1.2,dc=4,fc=.8,pc=class{uniforms={tHollows:{value:null},uHollowsMap:{value:new B},uHollowsOn:{value:0}};whole=!0;part=null;drawn=null;heights;dips;camera=new Et(-1,1,1,-1,0,1);quadScene=new L;material;size;get dirty(){return this.whole||this.part!==null}constructor(e=1024){this.size=e,this.heights=new ee(e,e,{depthBuffer:!0,format:Ie}),this.heights.depthTexture=new xt(e,e,le),this.dips=new ee(e,e,{type:A,format:j,depthBuffer:!1,minFilter:de,magFilter:de,generateMipmaps:!1}),this.uniforms.tHollows.value=this.dips.texture,this.material=new o({glslVersion:K,vertexShader:hc,fragmentShader:gc,uniforms:{tHeights:{value:this.heights.depthTexture},uSide:{value:1},uRange:{value:new _},uUnmap:{value:new B}},depthTest:!1,depthWrite:!1});let t=new ut(new re(2,2),this.material);t.frustumCulled=!1,this.quadScene.add(t)}changed(){this.whole=!0}changedIn(e){e.isEmpty()||(this.part?this.part.union(e):this.part=e.clone())}draw(e,t,n,r,i,a){if(!this.dirty)return;let o=this.whole?null:this.part;this.whole=!1,this.part=null;let s=this.uniforms;if(!i||n.length===0){s.uHollowsOn.value=0,this.drawn=null;return}let c=this.drawn,l=new q,u=null,d=null,f=null;if(o&&c&&c.area.x===i.x&&c.area.z===i.z&&c.area.side===i.side&&c.area.turn===i.turn){d=this.texels(o.clone().expandByScalar(5));let e=d&&this.footprint(d);if(f=e&&this.texels(e.expandByScalar(5)),!d||!f)return;let t=this.footprint(d);u=[];for(let e of n)if(l.setFromObject(e),!(l.min.x>t.max.x||l.max.x<t.min.x||l.min.z>t.max.z||l.max.z<t.min.z)){if(l.min.y<c.bottom||l.max.y>c.top){u=null;break}u.push(e)}}let p=this.camera,m=this.material.uniforms;if(!u){let e=new q;for(let t of n)e.expandByObject(t);let t=e.min.y-1,r=e.max.y+1;this.drawn={area:{...i},top:r,bottom:t};let o=i.side/2;p.left=-o,p.right=o,p.top=o,p.bottom=-o,p.near=0,p.far=r-t,p.position.set(i.x,r,i.z),p.up.set(-Math.sin(i.turn),0,-Math.cos(i.turn)),p.lookAt(i.x,t,i.z),p.updateProjectionMatrix(),p.updateMatrixWorld();let c=new $e().multiplyMatrices(p.projectionMatrix,p.matrixWorldInverse).elements;s.uHollowsMap.value.set(.5*c[0],.5*c[8],.5*c[12]+.5,.5*c[1],.5*c[9],.5*c[13]+.5,0,0,1),Object.assign(m,a),m.uSide.value=i.side,m.uRange.value.set(r,r-t),m.uUnmap.value.copy(s.uHollowsMap.value).invert()}u||(d=null,f=null);let h=[];for(let e of t.children)e.visible&&(e.visible=!1,h.push(e));let g=u??n,_=g.map(e=>[e,e.material]);for(let e of g)e.visible=!0,e.material=r;mc(this.heights,d),e.setRenderTarget(this.heights),e.clear(!1,!0,!1),e.render(t,p),mc(this.heights,null);for(let[e,t]of _)e.material=t,e.visible=!1;for(let e of h)e.visible=!0;mc(this.dips,f),e.setRenderTarget(this.dips),e.render(this.quadScene,this.camera),mc(this.dips,null),e.setRenderTarget(null),s.uHollowsOn.value=1}texels(e){let t=this.uniforms.uHollowsMap.value,n=this.size,r=new w,i=1/0,a=1/0,o=-1/0,s=-1/0;for(let n of[e.min.x,e.max.x])for(let c of[e.min.z,e.max.z])r.set(n,c,1).applyMatrix3(t),i=Math.min(i,r.x),o=Math.max(o,r.x),a=Math.min(a,r.y),s=Math.max(s,r.y);let c=Math.max(0,Math.floor(i*n)-1),l=Math.max(0,Math.floor(a*n)-1),u=Math.min(n,Math.ceil(o*n)+1),d=Math.min(n,Math.ceil(s*n)+1);return u>c&&d>l?new J(c,l,u-c,d-l):null}footprint(e){let t=this.material.uniforms.uUnmap.value,n=new w,r=new q;for(let i of[e.x,e.x+e.z])for(let a of[e.y,e.y+e.w])n.set(i/this.size,a/this.size,1).applyMatrix3(t),r.expandByPoint(new w(n.x,0,n.y));return r.min.y=-1/0,r.max.y=1/0,r}dispose(){this.heights.dispose(),this.dips.dispose(),this.material.dispose()}};function mc(e,t){e.scissorTest=t!==null,t?e.scissor.copy(t):e.scissor.set(0,0,e.width,e.height)}var hc=`
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,gc=`
precision highp float;
${Lo}
${Ts}
uniform highp sampler2D tHeights;
uniform float uSide;
uniform vec2 uRange;
uniform mat3 uUnmap;
in vec2 vUv;
out vec4 fragColor;
float heightAt(vec2 uv, out float ok) {
  float d = texture(tHeights, uv).r;
  ok = d < 1.0 && all(greaterThanEqual(uv, vec2(0.0))) && all(lessThanEqual(uv, vec2(1.0))) ? 1.0 : 0.0;
  return uRange.x - d * uRange.y;
}
float around(vec2 uv, float radius, float h0) {
  float sum = 0.0, n = 0.0, ok;
  for (int i = 0; i < 48; i++) {
    float r = sqrt((float(i) + 0.5) / 48.0) * radius / uSide, a = float(i) * 2.39996;
    float h = heightAt(uv + vec2(cos(a), sin(a)) * r, ok);
    sum += h * ok; n += ok;
  }
  return n > 0.0 ? sum / n - h0 : 0.0;
}
// The ground's rise per metre along 'dir' (uv; 'metres' long): across both neighbours, or one-sided where the other is off
// the ground or the map.
float slopeAlong(vec2 dir, float h0, float metres) {
  float okP, okM;
  float hp = heightAt(vUv + dir, okP), hm = heightAt(vUv - dir, okM);
  if (okP > 0.5 && okM > 0.5) return (hp - hm) / (2.0 * metres);
  if (okP > 0.5) return (hp - h0) / metres;
  if (okM > 0.5) return (h0 - hm) / metres;
  return 0.0;
}
void main() {
  float ok;
  float h0 = heightAt(vUv, ok);
  if (ok < 0.5) { fragColor = vec4(0.0, 0.0, -1.0, 0.0); return; }
  vec2 xz = (uUnmap * vec3(vUv, 1.0)).xy;
  // How far the ground faces up, as the ground's snow takes it (materials.ts: smoothstep(0.55, 0.9, n.y)), from its
  // slope over two texels each way.
  vec2 step_ = 2.0 / vec2(textureSize(tHeights, 0));
  float metres = step_.x * uSide;
  vec3 n = normalize(vec3(-slopeAlong(vec2(step_.x, 0.0), h0, metres), 1.0, -slopeAlong(vec2(0.0, step_.y), h0, metres)));
  float up = smoothstep(0.55, 0.9, n.y);
  float uneven = fbm2(xz * 0.6 + 4.0) * 0.9 + snoise(xz * 1.4 + 11.0) * 0.1;
  float near = around(vUv, ${uc.toFixed(1)}, h0), far = around(vUv, ${dc.toFixed(1)}, h0) * ${fc};
  // The deeper of the two in a hollow; on a rise, the higher.
  float dip = max(near, far) > 0.0 ? max(near, far) : min(near, far);
  // The pattern a thin snow breaks along (snow.ts), worked out here once rather than in every pixel that reads it: the
  // hollows fill first and the rises go bare, broken up by the unevenness and a finer drift.
  float drift = snoise(xz * 1.9 + 23.0) * 0.75 + snoise(xz * 4.3 + 5.0) * 0.25;
  float pattern = clamp(-dip * 6.0, -1.0, 1.0) * 0.45 + uneven * 0.4 + drift * 0.35;
  fragColor = vec4(dip, up, shelter(vec3(xz.x, h0, xz.y)), pattern);
}
`,_c=`
${ic}
${lc}
uniform vec3 uSnowGap[4];    // the snow's paint in the gaps' light: its shade, half-tone, lit band and a stroke in it
uniform vec3 uSnowCloud[4];  // and under a cloud
const float SNOW_METRES = ${.9.toFixed(2)};
// The snow lying here (0..1, the game's depth, less under shelter), the frost (0..1, the game's, less under shelter), and
// the land's hollow here (hollowAt), read by groundAt.
float gSnow = 0.0;
float gFrost = 0.0;
vec4 gHollow = vec4(0.0, 0.0, -1.0, 0.0);
// The snow lying at p, and the frost: none under a roof, to its edge; under a crown, less. What stands low on the ground (the ground, the
// grass, the crops, stones, wood, the foot of a trunk) reads the shelter at the ground with the land's hollows, in one
// lookup (AT_GROUND), rather than the shelter map's eight at p; what stands higher (a branch, a tall stone over a low
// roof's edge) reads it where it is. While the bed under the water is drawn (uGroundOn 2), none below the water's top.
// Returns the more of the two (0: neither here).
float gAbove = 0.0;   // how high p is over the land under it (AT_GROUND)
float groundAt(vec3 p) {
  vec2 g = groundState(p.xz).xy;
  gSnow = g.x; gFrost = g.y;
  if (max(gSnow, gFrost) < 0.004 || (uGroundOn > 1.5 && p.y < waterTop(p.xz))) { gSnow = gFrost = 0.0; return 0.0; }
#ifdef AT_GROUND
  gHollow = hollowAt(p.xz);
#ifndef GROUND
  gAbove = p.y - landTop(p);
#endif
  // Cover is only ever over things: where the ground is open, so is everything standing on it. Where it's sheltered, a
  // thing standing up out of it may be over the cover (a branch over a low roof's edge): whether a roof or a crown is
  // over it, at its texel (two lookups; thin things don't need the soft edge).
  float cover = gHollow.z < 0.0 ? shelter(p) : gHollow.z <= 0.0 || gAbove < 0.3 ? gHollow.z
    : max(step(p.y, shelterTop(p) - 0.1), ${ws.toFixed(2)} * step(p.y, crownTop(p) - 0.1));
#else
  float cover = shelter(p);
#endif
  gSnow = gSnow < 0.004 ? 0.0 : gSnow * (1.0 - cover);
  gFrost = gFrost < 0.004 ? 0.0 : gFrost * (1.0 - cover);
  return max(gSnow, gFrost);
}
// A pattern over the land a thin cover breaks along (about -1..1; low first covered), the same for everything at a
// place, so the grass is white where the ground under it is: the land's hollows fill first and its rises go bare, broken
// up by its unevenness and a finer drift (worked out once, in the hollows map). Call after groundAt.
float snowPattern(vec2 xz) {
  if (gHollow.z >= 0.0) return gHollow.w;
  return snoise(xz * 0.6 + 4.0) * 0.6 + snoise(xz * 1.9 + 23.0) * 0.4;
}
// How much of a surface the snow covers, 0..1: from how deep it lies (d, 0..1) on a surface facing up as much as 'up' says
// (0..1), whole from SNOW_WHOLE up, in patches below, breaking along 'pattern'. 'edge' is how soft a patch's edge is.
float snowCover(float d, float up, float pattern, float edge) {
  float t = d * up / ${.3.toFixed(2)};
  float th = 0.5 + 0.42 * clamp(pattern, -1.0, 1.0);
  return smoothstep(th - edge, th + edge, t);
}
// How far up a thing standing on the ground the snow buries it, 0..1 (things at the ground: grass, crops, stones; call
// after groundAt, under AT_GROUND), with a soft line: the height of the snow's surface, at its depth, over the land. Only
// as far as the ground round it is white (a thin snow's patches, less on a slope), so it comes in with the ground's.
float snowBuries(vec3 p, float d) {
  float under = 1.0 - smoothstep(-0.02, 0.03, gAbove - d * SNOW_METRES);
  return under * snowCover(d, gHollow.z >= 0.0 ? gHollow.y : 1.0, snowPattern(p.xz), 0.06);
}
// The snow's own paint, lit by 'light' as paintBands lights a surface (0 deep shade .. 1 full sun), its bands' edges 'soft'
// wide, 'brush' the material's brush there (about -1..1), so a wide snowfield is still paint: the strokes show faintly in
// its lit band, a little darker and cooler. Its colours are worked out in the hour's light once a frame
// (SnowPaint below), in the gaps and under a cloud, mixed here by the cloud's shade. Not exposed (the material does that,
// as for its own).
vec3 snowPaint(float light, float soft, float brush) {
  vec3 shade = mix(uSnowGap[0], uSnowCloud[0], gCloud), half_ = mix(uSnowGap[1], uSnowCloud[1], gCloud);
  vec3 lit = mix(uSnowGap[2], uSnowCloud[2], gCloud), stroked = mix(uSnowGap[3], uSnowCloud[3], gCloud);
  float stroke = clamp(brush, -1.0, 1.0);
  lit = mix(lit, stroked, max(stroke, 0.0) * 0.6) * (1.0 - min(stroke, 0.0) * 0.015);
  float t1 = smoothstep(0.30 - soft, 0.30 + soft, light);
  float t2 = smoothstep(0.62 - soft, 0.62 + soft, light);
  return mix(mix(shade, half_, t1), lit, t2);
}
${Qs}
`,vc={l:.95,c:.008},yc={l:.87,c:.035},bc={l:.74,c:.075},xc=e=>Math.min(295,Math.max(250,(e%360+360)%360)),Sc=e=>e*e*e;function Cc(e,t,n){let r=Sc(e+.3963377774*t+.2158037573*n),i=Sc(e-.1055613458*t-.0638541728*n),a=Sc(e-.0894841775*t-1.291485548*n);return[4.0767416621*r-3.3077115913*i+.2309699292*a,-1.2684380046*r+2.6097574011*i-.3413193965*a,-.0041960863*r-.7034186147*i+1.707614701*a]}function wc(e,t,n,r){let i=G.degToRad(r),a=Math.cos(i),o=Math.sin(i),s=0,c=1;if(Math.min(...Cc(t,a*n,o*n))<0)for(let e=0;e<12;e++){let e=(s+c)/2;Math.min(...Cc(t,a*n*e,o*n*e))>=0?s=e:c=e}else s=1;let[l,u,d]=Cc(t,a*n*s,o*n*s);return e.setRGB(Math.max(l,0),Math.max(u,0),Math.max(d,0))}function Tc(e,t,n){let r=Math.max(t.r,t.g,t.b,.001),i=1-n;return e.setRGB(i+n*t.r/r,i+n*t.g/r,i+n*t.b/r)}var Ec=new W,Dc=new W,Oc=new W,kc=class{uniforms={uSnowGap:{value:[0,1,2,3].map(()=>new W)},uSnowCloud:{value:[0,1,2,3].map(()=>new W)}};update(e,t){this.paint(this.uniforms.uSnowGap.value,e),this.paint(this.uniforms.uSnowCloud.value,t)}paint(e,t){let n=xc(t.shadeHue),r=n,i=t.sky;Tc(Ec,t.sunColor,.4),Tc(Dc,t.skyColor,.45);let a=1+.18*i;wc(e[0],bc.l,bc.c,n).multiply(Dc),wc(e[1],yc.l,yc.c,r).multiply(Oc.copy(Dc).lerp(Ec,.15));let o=G.degToRad(t.litHue),s=G.degToRad(r),c=vc.c*Math.cos(o)*(1-i)+.03*Math.cos(s)*i,l=vc.c*Math.sin(o)*(1-i)+.03*Math.sin(s)*i;wc(e[2],vc.l,Math.hypot(c,l),G.radToDeg(Math.atan2(l,c))).multiply(Ec),wc(e[3],vc.l-.04,.035,r).multiply(Ec);for(let t of e)t.multiplyScalar(a)}},Ac=130;function jc(e){let t=new Float32Array(e.length/3),n=G.smoothstep;for(let r=0;r<t.length;r++){let i=e[3*r],a=e[3*r+1],o=e[3*r+2],s=Math.cbrt(.4122214708*i+.5363325363*a+.0514459929*o),c=Math.cbrt(.2119034982*i+.6806995451*a+.1073969566*o),l=Math.cbrt(.0883024619*i+.2817188376*a+.6299787005*o),u=1.9779984951*s-2.428592205*c+.4505937099*l,d=.0259040371*s+.7827717662*c-.808675766*l,f=Math.atan2(d,u)*180/Math.PI,p=G.clamp((Ac-f)/54,0,1);t[r]=p*n(Math.hypot(u,d),.015,.03)}return t}var Mc=`
// How wet and how muddy it is here (0..1, the game's, less under shelter), set by wetAt.
float gWet = 0.0, gMud = 0.0;
// The wet and the mud at p, less what shelters it: none under a roof, to its edge; under a crown, less. What stands low on
// the ground (AT_GROUND: the ground, the grass, the crops, stones and wood) reads its shelter at the ground with the
// land's hollows, in one lookup; what stands higher there (a branch over a low roof's edge) whether a roof or a crown is
// over it, as the snow does (groundAt); the rest reads the shelter map where it is. Under the water, none (the bed is the
// water's).
float wetAt(vec3 p) {
  vec2 g = groundState(p.xz).zw;
  gWet = g.x; gMud = g.y;
  if (gWet + gMud < 0.004 || (uGroundOn > 1.5 && p.y < waterTop(p.xz))) { gWet = 0.0; gMud = 0.0; return 0.0; }
#ifdef AT_GROUND
  // Read a little off the point, by a wobble keyed to the world, so a dry patch's edge is painted, not ruled along the
  // roof's (a fifth of a metre either way).
  vec2 q = p.xz * 2.1;
  float h = hollowAt(p.xz + vec2(sin(q.y + 1.7 * sin(q.x * 0.71)), sin(q.x * 1.13 + 1.7 * sin(q.y * 0.83))) * 0.15).z;
#ifdef GROUND
  float above = 0.0;
#else
  float above = h > 0.0 ? p.y - landTop(p) : 0.0;
#endif
  float cover = h < 0.0 ? shelter(p) : above < 0.3 ? h
    : max(step(p.y, shelterTop(p) - 0.1), ${ws.toFixed(2)} * step(p.y, crownTop(p) - 0.1));
#else
  float cover = shelter(p);
#endif
  gWet *= 1.0 - cover; gMud *= 1.0 - cover;
  return gWet + gMud;
}
// How wet it looks, 0..1: it darkens fast, nearly all of it by 0.6.
float wetShow() { return smoothstep(0.0, 0.6, gWet); }
const vec3 WET_LUMA = vec3(0.2126, 0.7152, 0.0722);
// How much of the ground's earth is mud here (set by wetBase).
float gMudShown = 0.0;
// Wet paint, darker and richer: 42% darker at its wettest, its colour 30% deeper. In plain RGB, not OKLab: it's paid on
// every pixel of the ground while it's wet. Both once it's lit (wetFinish, on paintBands' colour), as a wet stone takes the same light as a dry one and is darker
// and deeper for it: the lit and the shade alike, so the shade keeps its teal or violet in proportion, only deeper. Not
// before: paintBands would see a darker, richer colour, its shade (darker and cooler) would fall past the colours a screen
// can show, and it would pull each back by a search, on nearly half the screen, for 0.15 ms or so (Sol, #11). Here the
// richer colour is clipped where it passes them, as dark, deep paint is at its richest.
vec3 wetFinish(vec3 c) {
  if (gWet <= 0.0) return c;
  float w = wetShow();
  // The mud has its own colour (muddy): richer still would turn it orange.
  float y = dot(c, WET_LUMA), s = 1.0 + 0.3 * w * (1.0 - gMudShown);
  return max(mix(vec3(y), c, s), 0.0) * (1.0 - 0.42 * w);
}
#ifdef GROUND
// How much of the ground here is earth (earthShares, by vertex).
varying float vEarth;
// Mud: only on the earth itself. The game's cells are coarser than a track: mud on the grass beside it would read as a
// brown halo. So mud takes the earth's share of the ground (vEarth, a metre or so between vertices): no hard line, which
// would follow the vertices' triangles, so the mud blends out as the earth does.
float mudHere() {
  if (gMud <= 0.0) return 0.0;
  float earth = smoothstep(0.15, 0.85, vEarth);
  // A muddy cell's earth is all mud (the map's mud is spread a cell, ground.ts): a steep rise, so it doesn't fade between
  // one cell's middle and the next's; where the game's mud ends, a ragged edge, keyed to the world.
  return smoothstep(0.15, 0.45, gMud + snoise(vRestPos.xz * 0.9 + 3.0) * 0.12) * earth;
}
// Muddy earth: a dark, rich brown (sRGB 110, 75, 50 as against its own grey) at a fifth of the earth's brightness, before
// it's lit (and darker again once lit, as all wet paint is: wetFinish).
vec3 muddy(vec3 c, float m) {
  vec3 mud = dot(c, WET_LUMA) * 0.22 * vec3(1.82, 0.82, 0.36);
  return mix(c, mud, m * 0.9);
}
#endif
// A painted surface's own colour, wet (call after wetAt), before it's lit: the ground's earth muddy where the game says.
// (Darker and richer once lit: wetFinish.)
vec3 wetBase(vec3 c) {
#ifdef GROUND
  gMudShown = mudHere();
  if (gMudShown > 0.0) c = muddy(c, gMudShown);
#endif
  return c;
}
`,Nc=`
vec3 wetInked(vec3 c, vec3 n, vec3 p) {
  float w = wetShow();
  if (w <= 0.0) return c;
  float y = dot(c, WET_LUMA);
  c = max(mix(vec3(y), c, 1.0 + 0.12 * w), 0.0) * (1.0 - 0.27 * w);
  vec3 v = toCamera();
  if (uMirror > 0.5) v.y = -v.y;
  vec3 r = reflect(-v, n);
  float cloud;
  vec3 seen = mirrorSky(skyPoint(p, r), 1.0 - clamp(r.y * 1.5, 0.0, 1.0), cloud);
  float fres = 0.1 + 0.35 * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);
  return mix(c, seen, fres * w);
}
`,Pc=4294967295,Fc={lit:1,edge:.35,rim:0},Ic=.35,Lc=.45;function Rc(){return{tToolsOverlay:{value:null},uToolsOverlayRect:{value:new J(0,0,4,0)},uToolsOverlaySize:{value:new _(1,1)},uToolsOverlayOn:{value:0},uToolsOverlayLook:{value:new w(Fc.lit,Fc.edge,Fc.rim)},uToolsGridRect:{value:new J(0,0,4,0)},uToolsGridSize:{value:new _(1,1)},uToolsGrid:{value:new w(0,Ic,Lc)}}}var zc=`
uniform sampler2D tToolsOverlay;
uniform vec4 uToolsOverlayRect;
uniform vec2 uToolsOverlaySize;
uniform float uToolsOverlayOn;
uniform vec3 uToolsOverlayLook;
uniform vec4 uToolsGridRect;
uniform vec2 uToolsGridSize;
uniform vec3 uToolsGrid;
vec3 toolsSrgbToLin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
// The overlay's colour on tile t (alpha 0 off the overlay or where it's clear).
vec4 toolsOverlayAt(ivec2 t) {
  if (t.x < 0 || t.y < 0 || t.x >= int(uToolsOverlaySize.x) || t.y >= int(uToolsOverlaySize.y)) return vec4(0.0);
  return texelFetch(tToolsOverlay, t, 0);
}
vec3 groundTools(vec3 col, vec3 p, vec3 n, float light) {
  if (uToolsOverlayOn > 0.5) {
    vec2 q = (p.xz - uToolsOverlayRect.xy) / uToolsOverlayRect.z;
    ivec2 t = ivec2(floor(q));
    vec4 o = toolsOverlayAt(t);
    if (o.a > 0.0) {
      float lit = uToolsOverlayLook.x;
      // Painted in the land's light (the bands it was painted with), or as in full sun wherever it lies.
      vec3 tint = paintBands(toolsSrgbToLin(o.rgb), mix(1.0, light, lit), 0.02, n.y * 0.5 + 0.5);
      // How far into the tile from its nearest sides (tiles, and pixels), and whether the tiles across them have another colour.
      vec2 f = fract(q), fw = max(fwidth(q), vec2(1e-5));
      vec2 d = min(f, 1.0 - f), side = d / fw;
      ivec2 across = t + ivec2(f.x < 0.5 ? -1 : 1, f.y < 0.5 ? -1 : 1);
      float otherX = distance(toolsOverlayAt(ivec2(across.x, t.y)), o) > 0.01 ? 1.0 : 0.0;
      float otherY = distance(toolsOverlayAt(ivec2(t.x, across.y)), o) > 0.01 ? 1.0 : 0.0;
      float differs = max(otherX * (1.0 - smoothstep(0.5, 1.5, side.x)), otherY * (1.0 - smoothstep(0.5, 1.5, side.y)));
      // A rim: a band along the inside of the region's border, the colour at nearly full strength.
      float rimT = uToolsOverlayLook.z / uToolsOverlayRect.z, rim = 0.0;
      if (rimT > 0.0) rim = max(otherX * (1.0 - smoothstep(rimT - fw.x, rimT + fw.x, d.x)), otherY * (1.0 - smoothstep(rimT - fw.y, rimT + fw.y, d.y)));
      // A wash: the colour laid over the paint, which keeps its own light and dark as much as the colour is lit.
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722)), own = max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 1e-3);
      col = mix(col, tint * mix(1.0, 0.55 + 0.45 * lum / own, lit), max(uToolsOverlayRect.w, rim * 0.9));
      col *= 1.0 - differs * uToolsOverlayLook.y;
    }
  }
  if (uToolsGrid.x > 0.5) {
    vec2 q = (p.xz - uToolsGridRect.xy) / uToolsGridRect.z;
    if (q.x >= 0.0 && q.y >= 0.0 && q.x <= uToolsGridSize.x && q.y <= uToolsGridSize.y) {
      vec2 fw = max(fwidth(q), vec2(1e-5));
      vec2 g = abs(fract(q + 0.5) - 0.5) / fw;
      float line = 1.0 - smoothstep(0.4, 1.2, min(g.x, g.y));
      // A contour at each level's height, on the land that slopes across it gently (on a cliff they'd crowd into a smear;
      // on the flat, a terrace standing at a level, there's no line to draw, only the whole terrace).
      float contour = 0.0;
      if (uToolsGridRect.w > 0.0) {
        float h = p.y / uToolsGridRect.w, slope = fwidth(h), fh = max(slope, 1e-5);
        contour = (1.0 - smoothstep(0.5, 1.4, abs(fract(h + 0.5) - 0.5) / fh)) * (1.0 - smoothstep(0.25, 0.6, fh)) * smoothstep(1e-4, 5e-4, slope);
      }
      col *= 1.0 - max(line * uToolsGrid.y, contour * uToolsGrid.z);
    }
  }
  return col;
}
`,Bc=class{uniforms=Rc();texture=null;setOverlay(e){let t=this.uniforms;if(!e){t.uToolsOverlayOn.value=0;return}let{width:n,height:r}=e;(!this.texture||this.texture.image.width!==n||this.texture.image.height!==r)&&(this.texture?.dispose(),this.texture=new gt(new Uint8Array(n*r*4),n,r,j,E),this.texture.minFilter=this.texture.magFilter=Je,this.texture.generateMipmaps=!1);let i=this.texture.image.data;for(let t=0;t<n*r;t++){let n=e.color[t]??4294967295,r=n>16777215;i[t*4]=r?0:n>>16&255,i[t*4+1]=r?0:n>>8&255,i[t*4+2]=r?0:n&255,i[t*4+3]=r?0:255}this.texture.needsUpdate=!0,t.tToolsOverlay.value=this.texture,t.uToolsOverlayRect.value.set(e.x0??0,e.z0??0,e.tile??4,G.clamp(e.strength,0,1)),t.uToolsOverlaySize.value.set(n,r),t.uToolsOverlayOn.value=1}setLook(e){this.uniforms.uToolsOverlayLook.value.set(G.clamp(e.lit,0,1),G.clamp(e.edge,0,1),Math.max(0,e.rim))}setGrid(e){let t=this.uniforms;if(!e){t.uToolsGrid.value.x=0;return}t.uToolsGridRect.value.set(e.x0??0,e.z0??0,e.tile??4,e.level),t.uToolsGridSize.value.set(e.width,e.height),t.uToolsGrid.value.x=1}},Vc={none:0,lamp:1,window:2},Hc=-1e6,Uc=256,Wc=1.5,Gc=64,Kc=e=>({target:e.target,pace0:e.pace0,angle0:e.angle0,t0:e.t0}),qc=class e{texture=e.makeTexture(1);turns=[];holds=[];gens=[];lights=[];free=[];time=null;dirty=!1;fresh=new Set;static makeTexture(e){let t=new gt(new Float32Array(Uc*e*4),Uc,e,j,Ve);return t.needsUpdate=!0,t}get count(){return this.holds.filter(e=>e>0).length}add(t,n,r,i=Vc.none,a){let o=this.free.pop();if(o===void 0){o=this.holds.length,this.holds.push(0),this.turns.push(null),this.gens.push(0),this.lights.push(null);let t=Math.ceil(this.holds.length*4/Uc);if(t!==this.texture.image.height){let n=this.texture.image.data;this.texture.dispose(),this.texture=e.makeTexture(t),this.texture.image.data.set(n)}}this.lights[o]=a?{x:a.x,y:a.y,z:a.z}:null,this.turns[o]=r?{speed:r,target:0,pace0:0,angle0:0,t0:null,past:[],next:[]}:null;let s=this.texture.image.data,c=o*4*4;return s.fill(0,c,c+16),s[c]=t.x,s[c+1]=t.y,s[c+2]=t.z,s[c+4]=n.x,s[c+5]=n.y,s[c+6]=n.z,s[c+7]=1,s[c+8]=i,s[c+9]=1,s.fill(Hc,c+12,c+16),this.fresh.add(o),this.dirty=!0,o}hold(e){for(let t of e)this.holds[t]++}release(e){for(let t of e)!(this.holds[t]>0)||--this.holds[t]>0||(this.turns[t]=null,this.gens[t]++,this.free.push(t))}unheld(e){for(let t of e)!(this.holds[t]>0)&&!this.free.includes(t)&&(this.turns[t]=null,this.gens[t]++,this.free.push(t))}generation(e){return this.gens[e]}spin(e,t){let n=this.turns[e];n&&n.target!==t&&(n.next.length=0,n.t0!==null&&this.time!==null&&this.anchor(n,this.time),n.target=t,this.dirty=!0)}show(e,t){let n=this.texture.image.data,r=e*4*4,i=+!!t;n[r+7]!==i&&(n[r+7]=i,!this.fresh.has(e)&&this.time!==null&&(n[r+12+3-1]>Hc&&(n[r+15]=n[r+12+3-1]),n.copyWithin(r+13,r+12,r+12+3-1),n[r+12]=this.time),this.dirty=!0)}light(e,t){let n=this.texture.image.data,r=e*4*4+9,i=+!!t;n[r]!==i&&(n[r]=i,this.dirty=!0)}glowing(e,t){let n=this.texture.image.data,r=[];for(let t=0;t<this.holds.length;t++){if(!(this.holds[t]>0))continue;let i=t*4*4,a=n[i+8];if(a===Vc.lamp?n[i+7]<.5:a!==Vc.window||n[i+9]<.5)continue;let o=this.lights[t],s=o?.x??n[i],c=o?.y??n[i+1],l=o?.z??n[i+2];r.push({x:s,y:c,z:l,glow:a,far:(s-e.x)**2+(l-e.z)**2})}return r.sort((e,t)=>e.far-t.far).slice(0,t)}anchor(e,t){e.past.push(Kc(e)),e.past.length>Gc&&e.past.shift(),e.angle0=this.angleOf(e,t)%(2*Math.PI),e.pace0=this.paceOf(e,t),e.t0=t}paceOf(e,t){let n=Math.max(0,t-(e.t0??t));return e.target+(e.pace0-e.target)*Math.exp(-n/Wc)}angleOf(e,t){let n=Math.max(0,t-(e.t0??t));return e.angle0+e.speed*(e.target*n+(e.pace0-e.target)*Wc*(1-Math.exp(-n/Wc)))}sweep(e){let t=e.getAttribute(`aPart`),n=e.getAttribute(`position`);if(!t)return;let r=this.texture.image.data,i=new q,a=new w,o=new w,s=new w,c=new w,u=new w;for(let e=0;e<n.count;e++){a.fromBufferAttribute(n,e);let l=Math.round(t.getX(e))-1;if(l<0){i.expandByPoint(a);continue}let d=l*4*4;o.set(r[d],r[d+1],r[d+2]),s.set(r[d+4],r[d+5],r[d+6]),a.sub(o),c.copy(s).multiplyScalar(s.dot(a)).add(o);let f=a.addScaledVector(s,-s.dot(a)).length();u.set(Math.sqrt(Math.max(0,1-s.x*s.x)),Math.sqrt(Math.max(0,1-s.y*s.y)),Math.sqrt(Math.max(0,1-s.z*s.z))).multiplyScalar(f),i.expandByPoint(c.clone().sub(u)),i.expandByPoint(c.add(u))}let d=i.getBoundingSphere(new l);e.boundingBox=e.boundingBox?e.boundingBox.union(i):i,e.boundingSphere=e.boundingSphere?e.boundingSphere.union(d):d}pose(){return this.texture.image.data}posed(e,t=this.pose()){let n=e.getAttribute(`aPart`),r=e.getAttribute(`position`);if(!n)return null;let i=t,a=new Float32Array(r.count*3),o=new w,s=new w,c=new w;for(let e=0;e<r.count;e++){o.fromBufferAttribute(r,e);let t=Math.round(n.getX(e))-1;if(t>=0&&(t+1)*4*4<=i.length){let e=t*4*4;s.set(i[e],i[e+1],i[e+2]),i[e+7]<.5?o.copy(s):i[e+3]!==0&&o.sub(s).applyAxisAngle(c.set(i[e+4],i[e+5],i[e+6]),i[e+3]).add(s)}o.toArray(a,e*3)}return new U(a,3)}update(e){if(this.time!==null&&e<this.time)for(let t of this.turns)for(;t&&t.past.length&&t.t0!==null&&e<t.t0;)t.next.push(Kc(t)),Object.assign(t,t.past.pop());for(let t of this.turns)for(;t&&t.next.length&&e>=t.next[t.next.length-1].t0;)t.past.push(Kc(t)),t.past.length>Gc&&t.past.shift(),Object.assign(t,t.next.pop());this.time=e,this.fresh.clear();let t=this.texture.image.data,n=!1;for(let r=0;r<this.turns.length;r++){let i=this.turns[r];if(!i)continue;if(i.t0===null){if(i.target===0)continue;i.t0=e}let a=this.angleOf(i,e)%(2*Math.PI),o=r*4*4+3;t[o]!==a&&(t[o]=a,n=!0),i.target===0&&i.pace0!==0&&!i.next.length&&Math.abs(this.paceOf(i,e))<1e-4&&(this.anchor(i,e),i.pace0=0)}(n||this.dirty)&&(this.texture.needsUpdate=!0,this.dirty=!1)}},Jc=1/256,Yc=`
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`,Xc=`
uniform sampler2D uPickAux;
uniform ivec2 uPickAt;
layout(location = 0) out vec4 outAux;
void main() {
  ivec2 p = uPickAt + ivec2(gl_FragCoord.xy) - 1, size = textureSize(uPickAux, 0);
  outAux = p.x < 0 || p.y < 0 || p.x >= size.x || p.y >= size.y ? vec4(0.0) : texelFetch(uPickAux, p, 0);
}
`,Zc=e=>.3+e*.004,Qc=class{target=new ee(3,3,{type:Ve,format:j,depthBuffer:!1,minFilter:Je,magFilter:Je,generateMipmaps:!1});material=new o({glslVersion:K,vertexShader:Yc,fragmentShader:Xc,depthTest:!1,depthWrite:!1,uniforms:{uPickAux:{value:null},uPickAt:{value:new _}}});scene=new L;camera=new Et(-1,1,1,-1,0,1);world;raycaster=new qe;constructor(e){this.world=e;let t=new ut(new re(2,2),this.material);t.frustumCulled=!1,this.scene.add(t)}copy(e,t,n,r,i){this.material.uniforms.uPickAux.value=t,this.material.uniforms.uPickAt.value.set(Math.floor(n),i-1-Math.floor(r));let a=e.getRenderTarget();e.setRenderTarget(this.target),e.render(this.scene,this.camera),e.setRenderTarget(a)}read(e){let t=new Float32Array(36);return e.readRenderTargetPixels(this.target,0,0,3,3,t),t}readAsync(e){let t=e.readRenderTargetPixelsAsync(this.target,0,0,3,3,new Float32Array(36)),n=e.getContext();return n.bindBuffer(n.PIXEL_PACK_BUFFER,null),t}snapshot(){let e=[];for(let t of this.world.tagged())t.visible&&t.parent&&e.push({mesh:t,matrix:t.matrixWorld.clone(),tag:t.userData.tag});return e}hit(e,t,n,r,i,a){let o=1/0,s=4;for(let t=0;t<9;t++){let n=e[t*4+2];n>0&&n<o&&(o=n,s=t)}if(!Number.isFinite(o))return null;let c=new w(n.x+(s%3-1)*r.x,n.y+(Math.floor(s/3)-1)*r.y,-1),l=new tt(c.unproject(t),t.getWorldDirection(new w)),u=o-t.near,d=l.at(u,new w),f=Zc(o),p=i??this.snapshot(),m=e[s*4+3],h=e=>e>.001953125&&e<.005859375;if(h(m))return this.past(l,u-f,p,a);let g=null,_=null,v=1/0,y=new w,b=new $e,x=new q,S=new w,C=[];this.raycaster.ray.copy(l);for(let{mesh:e,matrix:t,tag:n}of p){let r=e.geometry;r.boundingBox||r.computeBoundingBox(),b.copy(t).invert(),y.copy(d).applyMatrix4(b);let i=b.elements;if(S.set(Math.hypot(i[0],i[4],i[8]),Math.hypot(i[1],i[5],i[9]),Math.hypot(i[2],i[6],i[10])).multiplyScalar(f),x.copy(r.boundingBox),x.min.sub(S),x.max.add(S),!x.containsPoint(y))continue;let o=0;if(!$c.has(e.userData.kind)){o=1/0;for(let n of this.meet(e,t,a,C))o=Math.min(o,Math.abs(n.distance-u));if(o>f)continue}o<v&&(g=e,_=n,v=o)}if(g)return{tag:_,what:`thing`,point:d};let T=!1;for(let t=0;t<9;t++)h(e[t*4+3])&&(T=!0);if(T&&m>390625e-9&&m<.99){let e=this.past(l,0,p,a);if(e)return e}let E=this.world.landHit(l);if(E&&l.origin.distanceTo(E)<=u+f)return{tag:null,what:`land`,point:E};let D=this.world.waterAt(d.x,d.z);return D!==null&&Math.abs(d.y-D)<f?{tag:null,what:`water`,point:d}:{tag:null,what:`plant`,point:d}}meet(e,t,n,r){let i=this.world.posed?.(e.geometry,n);if(r.length=0,i){let n=new We;n.setAttribute(`position`,i),n.setIndex(e.geometry.index);let a=new ut(n,e.material);a.matrixWorld.copy(t),a.raycast(this.raycaster,r)}else{let n=e.matrixWorld.clone();e.matrixWorld.copy(t),e.raycast(this.raycaster,r),e.matrixWorld.copy(n)}return r}past(e,t,n,r){let i=null,a=1/0,o=[];this.raycaster.ray.copy(e);for(let e of n)if(!$c.has(e.mesh.userData.kind))for(let n of this.meet(e.mesh,e.matrix,r,o))n.distance>=t&&n.distance<a&&(a=n.distance,i=e);let s=this.world.landHit(e),c=s?e.origin.distanceTo(s):1/0;if(i&&a<=c)return{tag:i.tag,what:`thing`,point:e.at(a,new w)};if(!s||c<t)return null;let l=this.world.waterAt(s.x,s.z);if(l!==null&&l>s.y&&e.direction.y<0){let t=e.at((l-e.origin.y)/e.direction.y,new w),n=this.world.waterAt(t.x,t.z);if(n!==null&&Math.abs(n-l)<.05)return{tag:null,what:`water`,point:t}}return{tag:null,what:`land`,point:s}}},$c=new Set([`foliage`,`debris`,`smoke`]),el={[Vc.lamp]:5,[Vc.window]:6},tl={rise:4.5,size:2.4,life:5,share:.6},nl=e=>G.smoothstep(e,.3,.85),rl=class{post={uPools:{value:Array.from({length:16},()=>new J)},uPoolN:{value:0},uPoolGlow:{value:0}};update(e,t,n,r){let i=nl(n);e.uNightGlow.value=i;let a=this.post;if(a.uPoolGlow.value=i,i<=0){a.uPoolN.value=0;return}let o=t.glowing(r,16);o.forEach((e,t)=>a.uPools.value[t].set(e.x,e.y,e.z,el[e.glow])),a.uPoolN.value=o.length}},il=`
uniform vec4 uPools[16];
uniform int uPoolN;
uniform float uPoolGlow;
vec3 nightPools(vec3 c, vec3 p) {
  float pool = 0.0;
  for (int i = 0; i < 16; i++) {
    if (i >= uPoolN) break;
    vec4 l = uPools[i];
    vec3 d = p - l.xyz;
    // Spread wide on the ground below it, less up the walls above it.
    d.y *= d.y > 0.0 ? 1.5 : 0.4;
    float r = clamp(length(d) / l.w, 0.0, 1.0);
    pool += (1.0 - r) * (1.0 - r);
  }
  pool = min(pool, 1.4) * uPoolGlow;
  const vec3 LAMP = vec3(1.0, 0.62, 0.28);
  return c + (c * 3.5 + 0.02) * LAMP * pool;
}
`;function al(){return{uSunDir:{value:new w(.3,.8,.5).normalize()},uSunColor:{value:new W(1,1,1)},uSkyColor:{value:new W(1,1,1)},uRimColor:{value:new W(1,.8,.4)},uShadeHue:{value:-1.6},uShadeLean:{value:.3},uShadeDepth:{value:.3},uLitHue:{value:1.3},uLitLean:{value:.1},uOvercast:{value:new w},uTime:{value:0},uWindDir:{value:new _(1,0)},uWindSpeed:{value:0},uWindDrift:{value:new _},uWindFlutter:{value:0},tWindA:{value:null},tWindB:{value:null},tWindUsual:{value:null},uWindBlend:{value:0},uWindGrid:{value:new J(0,0,1,1)},uWindOn:{value:1},tTreePose:{value:null},tPartPose:{value:null},uPartsRest:{value:0},uNightGlow:{value:0},uViewBack:{value:new w(0,0,1)},uViewTarget:{value:new w},uShadowMap:{value:null},uShadowMatrix:{value:new $e},uShadowTexel:{value:new _(1/2048,1/2048)},uShadowArea:{value:new _(1,1)},uMirror:{value:0},uMirrorY:{value:0},tWaterA:{value:null},tWaterB:{value:null},uWaterBlend:{value:1},uWaterGrid:{value:new J(0,0,1,0)},uWaterHigh:{value:-1e6},tIceA:{value:null},tIceB:{value:null},uIceOn:{value:0},uLandSquare:{value:new J(0,0,0,0)},uUnder:{value:null},uUnderAux:{value:null},uReflect:{value:null},uScreen:{value:new _(1,1)},uSkyTop:{value:new W},uSkyBottom:{value:new W},uCloudMap:{value:null},uCloudRect:{value:new J(-64,-64,1/128,1/128)},uCloudStrength:{value:0},uCloudOvercast:{value:new w},uCloudSunColor:{value:new W(1,1,1)},uCloudRimColor:{value:new W(1,.8,.4)},uCloudBands:{value:new J(0,.3,.1,1)},uCloudTint:{value:new _(0,0)},uLightExposure:{value:1},uSkyMap:{value:null},uSkyRect:{value:new J(-128,-128,1/256,1/256)},uGapSkyTop:{value:new W},uGapSkyBottom:{value:new W},uCloudLit:{value:new W},uCloudBelly:{value:new W},uSkyClosed:{value:0}}}var ol=`
// The silhouettes drawn first (see prepassMaterial) must land at exactly the depth the painting does, on every GPU.
invariant gl_Position;
${zo}
${Lo}
${gs}
attribute vec4 aPaint;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vColor;
varying vec4 vPaint;
varying float vViewDepth;
// Where the point is with no wind: the brush is keyed to it, so the paint moves with what moves, not through it.
varying vec3 vRestPos;
// Puts a world position on screen, mirrored in the water when drawing its reflection. The surface is still lit where it
// really is (vWorldPos and the normal stay unmirrored), so a tree in the water shows its shaded underside.
// A movement with its part along the main camera's view taken out: on screen it looks the same, but nothing comes nearer or
// goes farther, so things that overlap never swap which is in front. (Wind moving leaves to and fro in depth would swap
// overlapping dabs of different colours, and the swatches would pop.) Mirrored in the reflection. The sun's shadow pass uses
// the main camera's direction too, so the shadows move with what casts them.
vec3 acrossView(vec3 d) {
  vec3 b = uMirror > 0.5 ? uViewBack * vec3(1.0, -1.0, 1.0) : uViewBack;
  return d - b * dot(d, b);
}
// How a point of a tree moves in the wind (tree: its foot's x and z, its height, and how much of its top's movement this
// point takes; a height of 0 is no tree; id: the tree's texel in tTreePose). The top is where the tree's spring has it
// (TreeSprings); the rest bends with it from the foot, by the share built into each point (growTree). The movement is drawn
// across the view only (drawnShift), so a bending crown's strokes never swap which is in front.
uniform sampler2D tTreePose;
vec3 treeWind(vec4 tree, float id) {
  if (tree.z <= 0.0) return vec3(0.0);
  int i = int(id + 0.5);
  vec2 top = texelFetch(tTreePose, ivec2(i % 256, i / 256), 0).xy * uWindOn;
  vec3 d = vec3(top.x, 0.0, top.y);
  // The top dips a little as the tree leans over.
  d.y -= dot(d, d) / (1.4 * tree.z);
  return d * tree.w;
}
// A tree's movement as drawn. It's real 3D where it's lit (vWorldPos) and in the sun's shadow pass, so it shades and casts
// its shadow where it really is; for the eye only its part across the view is drawn (see acrossView), which puts it on the
// same pixels without changing its depth, so neighbouring trees rocking out of step never swap their overlapping edges.
vec3 drawnShift(vec3 d) {
#ifdef SHADOW_PASS
  return d;
#else
  return acrossView(d);
#endif
}
void place(vec3 world) {
  if (uMirror > 0.5) world.y = 2.0 * uMirrorY - world.y;
  vec4 vp = viewMatrix * vec4(world, 1.0);
  vViewDepth = -vp.z;
  gl_Position = projectionMatrix * vp;
}
`,sl=`
${ol}
varying vec2 vUv;
#ifdef GROUND
// How much of the ground is earth, from its own colours (wet.ts's earthShares): where mud can lie (#11).
attribute float aEarth;
varying float vEarth;
#endif
#ifdef TREES
attribute vec4 aTree;
attribute float aTreeId;
#endif
#ifdef CROP
varying float vGust;
#endif
#ifdef PARTS
// A model's part as the game has it now (parts.ts): its vertices carry its slot + 1 (0: no part). Turned about its axle
// by its angle, or, hidden, folded to its axle, where it draws nothing. Its normal turns with it.
attribute float aPart;
uniform highp sampler2D tPartPose;
uniform float uPartsRest;
uniform float uNightGlow;
// How much it glows now (#205: a lamp while it shows, windows while they're lit, at night), and whether it's windows.
varying vec2 vGlow;
vec2 partGlow() {
  if (aPart < 0.5 || uNightGlow <= 0.0) return vec2(0.0);
  int i = (int(aPart + 0.5) - 1) * 4;
  ivec2 at = ivec2(i % 256, i / 256);
  vec4 glow = texelFetch(tPartPose, at + ivec2(2, 0), 0);
  if (glow.x == ${Vc.lamp}.0) return vec2(uNightGlow, 0.0);
  if (glow.x == ${Vc.window}.0) return vec2(uNightGlow * glow.y * 0.85, 1.0);
  return vec2(0.0);
}
void movePart(inout vec3 p, inout vec3 n) {
  if (aPart < 0.5 || uPartsRest > 0.5) return;
  int i = (int(aPart + 0.5) - 1) * 4;
  ivec2 at = ivec2(i % 256, i / 256);
  vec4 axle = texelFetch(tPartPose, at, 0), along = texelFetch(tPartPose, at + ivec2(1, 0), 0);
  if (along.w < 0.5) { p = axle.xyz; return; }
  if (axle.w == 0.0) return;
  vec3 k = along.xyz, d = p - axle.xyz;
  float c = cos(axle.w), s = sin(axle.w);
  p = axle.xyz + d * c + cross(k, d) * s + k * dot(k, d) * (1.0 - c);
  n = n * c + cross(k, n) * s + k * dot(k, n) * (1.0 - c);
}
#endif
void main() {
#ifdef PARTS
  vec3 pos = position, nrm = normal;
  // Where it is at rest: the brush and the snow's pattern go round with it.
  vRestPos = (modelMatrix * vec4(position, 1.0)).xyz;
  movePart(pos, nrm);
  vGlow = partGlow();
  vec4 wp = modelMatrix * vec4(pos, 1.0);
#else
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vRestPos = wp.xyz;
  vec3 nrm = normal;
#endif
#ifdef CROP
  // The field gives a little under each gust: its top sinks and drifts downwind.
  vGust = windGust(wp.xz);
  float give = vGust * windForce();
  wp.xyz += (windDir3() * 0.1 - vec3(0.0, 0.14, 0.0)) * give;
#endif
  vWorldPos = wp.xyz;
#ifdef TREES
  vec3 tree = treeWind(aTree, aTreeId);
  vWorldPos += tree;
  wp.xyz += drawnShift(tree);
#endif
  vNormal = normalize(mat3(modelMatrix) * nrm);
  vColor = color;
  vPaint = aPaint;
  vUv = uv;
#ifdef GROUND
  vEarth = aEarth;
#endif
  place(wp.xyz);
}
`,cl=`
${ol}
varying vec2 vFlow;
varying float vMud;
varying vec2 vMirrorShift;
uniform sampler2D tIceA;
uniform sampler2D tIceB;
uniform float uIceOn;
varying vec3 vIce;
void main() {
  vec4 w = waterCell(ivec2(uv + 0.5));
  // The ice (#14): how frozen, and whether it's thawing (1) or freezing.
  vIce = vec3(0.0);
  if (uIceOn > 0.5) {
    ivec2 c = clamp(ivec2(uv + 0.5), ivec2(0), textureSize(tIceA, 0) - 1);
    vIce = mix(texelFetch(tIceA, c, 0).xyz, texelFetch(tIceB, c, 0).xyz, uWaterBlend);
  }
  vec4 wp = modelMatrix * vec4(position.x, w.x, position.z, 1.0);
  vRestPos = wp.xyz;
  vWorldPos = wp.xyz;
  vNormal = vec3(0.0, 1.0, 0.0);
  vColor = WATER_COLOR;
  vPaint = vec4(0.0);
  vFlow = w.yz;
  vMud = w.w;
  vMirrorShift = (projectionMatrix * viewMatrix * vec4(0.0, 2.0 * (w.x - uMirrorY), 0.0, 0.0)).xy * 0.5;
  place(wp.xyz);
}
`,ll=`
${ol}
attribute vec4 aCard;
attribute vec4 aTree;
attribute float aTreeId;
uniform vec2 uScreen;
varying vec4 vCard;
varying vec3 vDabNormal;
varying float vCardPx;
varying float vFlash;
void main() {
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 toCam = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
  float a = aPaint.z >= 0.0 ? aPaint.z + (aCard.w - 0.5) * 0.7 : aCard.w * 6.2831853;
  vec2 c = mat2(cos(a), sin(a), -sin(a), cos(a)) * aCard.xy;
  vec4 wc = modelMatrix * vec4(position, 1.0);
  vec3 rest = wc.xyz + (right * c.x + up * c.y) * aCard.z;
  // Wind: the crown moves with its tree (see treeWind and drawnShift); each dab flutters on its own, faster and wider as the
  // wind rises (though leaves turn edge-on and stop flapping, so not much), never more than a little of its size, and only
  // across the view (see acrossView).
  float s = uWindSpeed, seed = aCard.w;
  float g = windGust(aTree.z > 0.0 ? aTree.xy : wc.xz);
  float leafy = aPaint.x >= ${4 .toFixed(1)} ? 0.0 : 1.0;  // wood neither flutters nor turns over
  float amp = leafy * min(0.004 + 0.045 * s / (s + 12.0), 0.15 * aCard.z) * (0.7 + 0.6 * g);
  float ph = uWindFlutter * (0.8 + 0.4 * fract(seed * 7.13)) + seed * 40.0;
  vec3 flutter = (windDir3() * sin(ph) + vec3(-uWindDir.y, 0.0, uWindDir.x) * 0.5 * sin(ph * 1.31 + seed * 9.0)
    + vec3(0.0, 0.5 * cos(ph * 0.87 + seed * 21.0), 0.0)) * amp;
  vec3 tree = treeWind(aTree, aTreeId);
  wc.xyz += acrossView(flutter);
  // In a gale and up, leaves on the windward side turn over in the gusts and show their pale undersides. Slowly, a few at a
  // time, in waves that travel with the gusts, so no dab blinks.
  float windward = smoothstep(-0.3, 0.6, -dot(normalize(mat3(modelMatrix) * normal), windDir3()));
  float turn = g + 0.35 * sin(uWindFlutter * 0.13 * (0.8 + 0.4 * fract(seed * 3.7)) + seed * 51.0);
  vFlash = leafy * smoothstep(0.35, 0.8, windForce()) * smoothstep(0.55, 0.95, turn) * (0.35 + 0.65 * windward);
  vec3 world = wc.xyz + (right * c.x + up * c.y) * aCard.z;
  vWorldPos = world + tree;
  vRestPos = rest;
  vNormal = normalize(mat3(modelMatrix) * normal);
  // Each dab bulges towards the viewer a little; kept faint, so turning the camera doesn't relight the crown.
  vDabNormal = normalize(right * c.x * 0.55 + up * c.y * 0.55 + toCam * 0.45);
  vColor = color;
  vPaint = aPaint;
  vCard = aCard;
  // Screen pixels per unit of the card, for its edge's antialiasing (orthographic: the same everywhere on screen).
  vCardPx = aCard.z * projectionMatrix[0][0] * uScreen.x * 0.5;
  // Spring's and autumn's strokes (#13, aPaint.x raised by CRISP_EDGE) have crisper edges: their brighter colours make the
  // part-covered pixels along an edge, which change as the camera moves a pixel, shimmer more than green leaves'.
  // The flags add up (a fallen leaf is both): wood's comes off first, then the crisp edge's.
  float paintX = aPaint.x >= ${4 .toFixed(1)} ? aPaint.x - ${4 .toFixed(1)} : aPaint.x;
  if (paintX >= ${2 .toFixed(1)}) { paintX -= ${2 .toFixed(1)}; vCardPx *= 1.8; }
  vPaint.x = paintX;
  place(world + drawnShift(tree));
}
`,ul=`
${ol}
attribute vec4 aBlade;
uniform vec2 uScreen;
varying vec2 vBlade;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  // Blades are flat, and a flat blade seen edge-on is a sliver under a pixel wide that crawls as the camera moves. Turn each
  // most of the way to face the camera, and keep it at least a pixel and a bit across. The turn works on the blade's axis as
  // an unoriented line (angles doubled), so it never jumps as the camera turns past a blade edge-on. Every vertex of a blade
  // carries the same angle, so all of them turn the axis identically, then take their own signed distance along it: rows
  // stay in step and mirrored vertices stay on opposite sides. Not in the sun's shadow pass: no camera there.
#ifndef SHADOW_PASS
  vec3 across = mat3(modelMatrix) * vec3(cos(aBlade.w), 0.0, sin(aBlade.w));
  float stretch = length(across.xz);
  if (aBlade.z != 0.0 && stretch > 1e-6) {
    vec2 dir = across.xz / stretch;
    float a = atan(dir.y, dir.x), b = atan(viewMatrix[2][0], viewMatrix[0][0]);
    vec2 m = mix(vec2(cos(2.0 * a), sin(2.0 * a)), vec2(cos(2.0 * b), sin(2.0 * b)), 0.75);
    float c = 0.5 * atan(m.y, m.x);
    vec2 axis = vec2(cos(c), sin(c));
    axis *= dot(axis, dir) < 0.0 ? -1.0 : 1.0;
    float halfWidth = abs(aBlade.z) * stretch;
    float pxPerMetre = projectionMatrix[0][0] * uScreen.x * 0.5;
    wp.xz += axis * sign(aBlade.z) * max(halfWidth, 0.6 / pxPerMetre) - dir * aBlade.z * stretch;
  }
#endif
  // Wind: each blade bends with the wind where it stands (the game's map: further in a gust, less in a hedge's lee), more
  // towards the tip and with the square of the speed, and rocks about that; the tip dips as it bends. Across the view only,
  // so blades never swap which is in front.
  vRestPos = wp.xyz;
  vec2 here = windGround(wp.xz);
  float h = aBlade.x * aBlade.x, s = length(here);
  vec3 dir = windDirOf(here);
  float bend = 0.02 + 0.0035 * s + 2.4e-4 * s * s;
  float rock = sin(uWindFlutter * 0.8 * (0.85 + 0.3 * aBlade.y) + aBlade.y * 6.283 + wp.x * 0.7) * (0.012 + 0.0025 * s);
  float d = min(bend + rock, 0.6) * h;
  wp.xyz += acrossView(dir * d - vec3(0.0, d * d * 1.2, 0.0));
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vColor = color;
  vPaint = aPaint;
  vBlade = aBlade.xy;
  place(wp.xyz);
}
`,dl=`
${ol}
attribute vec4 aCard;
uniform vec2 uScreen;
uniform vec3 uViewTarget;
varying vec4 vCard;
varying vec3 vDabNormal;
varying float vCardPx;
varying float vFlash;
const float BOX = 128.0;
void main() {
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 toCam = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
  float seed = aCard.w, k = fract(seed * 13.71);
  float share = smoothstep(14.0, 40.0, uWindSpeed);
  float show = smoothstep(k, k + 0.08, share * 1.08);
  // Carried by the gusts, some leaves faster than others, wandering a little across the wind.
  vec2 side = vec2(-uWindDir.y, uWindDir.x);
  float ph = uWindFlutter * (0.2 + 0.15 * fract(seed * 5.3)) + seed * 30.0;
  vec2 xz = position.xy * BOX + uWindDrift * (1.0 + 0.6 * fract(seed * 3.1)) + side * sin(ph * 0.7) * 1.5;
  vec2 rel = mod(xz - uViewTarget.xz + BOX * 0.5, BOX) - BOX * 0.5;
  float fade = 1.0 - smoothstep(0.4 * BOX, 0.48 * BOX, max(abs(rel.x), abs(rel.y)));
  float size = aCard.z * show * fade;
  vec3 c0 = vec3(uViewTarget.x + rel.x, uViewTarget.y + 1.0 + position.z * 6.0 + sin(ph) * 0.8, uViewTarget.z + rel.y);
  // Tumbling: the leaf turns on the screen, and narrows and widens as it flips over.
  float a = seed * 6.2831853 + ph * 1.7;
  vec2 c = mat2(cos(a), sin(a), -sin(a), cos(a)) * (aCard.xy * vec2(1.0, max(abs(cos(ph * 2.3)), 0.2)));
  vec3 world = c0 + (right * c.x + up * c.y) * size;
  vWorldPos = world;
  // Its paint is the leaf's own, wherever it flies.
  vRestPos = position * BOX;
  vNormal = normalize(vec3(sin(ph * 2.3), 1.0, cos(ph * 1.9)));
  vDabNormal = toCam;
  vColor = color;
  vPaint = aPaint;
  vCard = aCard;
  vCardPx = max(size, 1e-4) * projectionMatrix[0][0] * uScreen.x * 0.5;
  vFlash = 0.0;
  place(world);
}
`,fl=`
${ol}
attribute vec4 aCard;
attribute float aPart;
uniform highp sampler2D tPartPose;
uniform vec2 uScreen;
varying vec4 vCard;
varying vec3 vDabNormal;
varying float vCardPx;
varying float vFlash;
void main() {
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 toCam = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
  const float RISE = ${tl.rise.toFixed(2)}, SIZE = ${tl.size.toFixed(2)}, LIFE = ${tl.life.toFixed(2)};
  float seed = aCard.w, life = LIFE;
  // Since it left, and whether it left while the smoke was on (after the part last started showing, or before it stopped).
  float age = mod(uTime + seed * life, life), left = uTime - age, drawn = 1.0;
  if (aPart > 0.5) {
    int i = (int(aPart + 0.5) - 1) * 4;
    ivec2 at = ivec2(i % 256, i / 256);
    // On when it left: on now, unless it has started or stopped an odd number of times since (its last few changes);
    // none if it left before the history kept.
    float on = texelFetch(tPartPose, at + ivec2(1, 0), 0).w;
    vec4 changes = texelFetch(tPartPose, at + ivec2(3, 0), 0);
    float flips = dot(vec3(greaterThan(changes.xyz, vec3(left))), vec3(1.0));
    drawn = left >= changes.w && (on > 0.5) == (mod(flips, 2.0) < 0.5) ? 1.0 : 0.0;
  }
  if (fract(seed * 7.31) >= ${tl.share.toFixed(2)}) drawn = 0.0;
  float k = age / life;
  float size = aCard.z * SIZE * mix(0.45, 1.35, k) * smoothstep(0.0, 0.12, k) * (1.0 - smoothstep(0.55, 1.0, k)) * drawn;
  // Up, slowing as it goes; downwind, faster in a wind; wavering a little.
  vec2 wind = uWindDir * age * (0.25 + uWindSpeed * 0.03);
  float waver = sin(age * 1.7 + seed * 40.0) * 0.18 * k;
  vec3 from = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 c0 = from + vec3(wind.x + waver * right.x, RISE * (1.0 - (1.0 - k) * (1.0 - k)), wind.y + waver * right.z);
  vec3 world = c0 + (right * aCard.x + up * aCard.y) * size;
  vWorldPos = world;
  // Its paint stays with it as it rises.
  vRestPos = from + vec3(seed * 9.0, 0.0, seed * 5.0);
  vNormal = normalize(toCam + up * 0.6);
  vDabNormal = toCam;
  vColor = color;
  vPaint = aPaint;
  vCard = aCard;
  vCardPx = max(size, 1e-4) * projectionMatrix[0][0] * uScreen.x * 0.5;
  vFlash = 0.0;
  place(world);
}
`,pl=`
${zo}
${Lo}
${Ro}
${Bo}
${Uo}
${Wo}
${gs}
varying vec3 vWorldPos;
varying vec3 vRestPos;
varying vec3 vNormal;
varying vec3 vColor;
varying vec4 vPaint;
varying float vViewDepth;
${Go}
vec3 toCamera() { return normalize(vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2])); }
${Ts}
${_c}
${Mc}

#ifdef BASIS
// The brush by place, baked at load (basisBakeMaterial): for each of the BASIS brush scales, seven layers over the ground's
// square, the brush on the flat at 0°, 30°, ... 180°. paintDabs and paintStrokes only ever blend two of those angles, so
// the two either side of 'angle', blended as they blend them, give the brush there: dabs, strokes, fine strokes, drift.
uniform highp sampler2DArray uBasis;
uniform mat3 uFieldsMap;
uniform float uBasisScales[BASIS];
vec4 basisFields(vec2 xz, float scale, float angle) {
  float k = angle / 0.5235988, k0 = floor(k), w = smoothstep(0.3, 0.7, k - k0);
  // The nearest scale baked.
  float layers = 0.0, nearest = abs(scale - uBasisScales[0]);
  for (int i = 1; i < BASIS; i++) {
    float d = abs(scale - uBasisScales[i]);
    if (d < nearest) { nearest = d; layers = float(i * 7); }
  }
  k0 += layers;
  vec2 uv = (uFieldsMap * vec3(xz, 1.0)).xy;
  return (mix(texture(uBasis, vec3(uv, k0)), texture(uBasis, vec3(uv, k0 + 1.0)), w) - 0.5) / 0.45;
}
#endif

// Where the brush runs on a surface: across the ground on flat faces, up the sides on steep ones, blended between the three
// world planes by the normal, so curved surfaces (stones, trunks, the wheat's rounded edge) carry no seam. The top plane's
// strokes follow the contours, the sides' run at the surface's set angle.
vec3 planeWeights(vec3 n) {
  vec3 w = pow(abs(n), vec3(4.0));
  // Planes under 1% are skipped; take that much off each so the skip doesn't leave a step.
  w = max(w / (w.x + w.y + w.z) - 0.01, 0.0);
  return w / (w.x + w.y + w.z);
}
float dabsOn(vec3 p, vec3 w, float scale, float top, float side) {
  float s = 0.0;
  if (w.y > 0.0) s += w.y * paintDabs(p.xz, scale, top);
  if (w.x > 0.0) s += w.x * paintDabs(p.zy, scale, side);
  if (w.z > 0.0) s += w.z * paintDabs(p.xy, scale, side);
  return s;
}
float strokesOn(vec3 p, vec3 w, float top, float side) {
  float s = 0.0;
  if (w.y > 0.0) s += w.y * paintStrokes(p.xz, top);
  if (w.x > 0.0) s += w.x * paintStrokes(p.zy, side);
  if (w.z > 0.0) s += w.z * paintStrokes(p.xy, side);
  return s;
}

// The surface's own colour, drifting in hue and value across the world (one meadow runs yellow-green to emerald to teal),
// by 'amount'; 'dab' is the brush mark's own shift, already as strong as the surface wants it.
// 'drift' is driftField's value there.
float driftField(vec3 p) { return fbm2(p.xz * 0.06 + 3.1); }
vec3 driftColorOf(vec3 base, float drift, float amount, float dab) {
  vec3 lab = linToOklab(base);
  lab = lchShift(lab, drift * 0.02 * amount + dab * 0.05, 1.0 + drift * 0.05 * amount + dab * 0.08, drift * 0.12 * amount + dab * 0.13);
  return oklabToLin(lab);
}
vec3 driftColor(vec3 base, vec3 p, float amount, float dab) { return driftColorOf(base, driftField(p), amount, dab); }

float rimLight(vec3 n, float amount) {
  float f = pow(1.0 - clamp(dot(n, toCamera()), 0.0, 1.0), 2.5);
  return amount * f * smoothstep(-0.1, 0.5, dot(n, uSunDir));
}
`,ml=`
// How steep (the normal's height) ground may be and still read its baked fields: a cliff's faces are painted live.
#define FIELDS_STEEP 0.5
vec4 brushFields(vec3 p, vec3 n) {
  vec3 w = planeWeights(n);
  float angle = contourAngle(n, vPaint.z);
  return vec4(dabsOn(p, w, vPaint.y, angle, vPaint.z), strokesOn(p * vPaint.y * 0.6, w, angle, vPaint.z),
    strokesOn(p * vPaint.y * 1.3, w, angle, vPaint.z), driftField(p));
}
`,hl=`
${pl}
${ml}
varying vec2 vUv;
#ifdef CROP
varying float vGust;
#endif
#ifdef FIELDS
// The ground's brush fields, over the square uFieldsMap takes the ground's x and z to; stored as 0.5 + value / 2.
uniform sampler2D uFields;
uniform mat3 uFieldsMap;
#endif
#ifdef GROUND
${zc}
#endif
void main() {
  cloudAt(vWorldPos);
  vec3 n = normalize(vNormal);
  vec3 p = vRestPos;
#ifdef FIELDS
  // Read where they were baked; worked out live on a steep face (a cliff's, which the bake can't hold: it's drawn flat)
  // and past the square (the country beyond), #210.
  vec2 fieldsAt = (uFieldsMap * vec3(p.xz, 1.0)).xy;
  bool baked = abs(n.y) >= FIELDS_STEEP && all(greaterThanEqual(fieldsAt, vec2(0.0))) && all(lessThanEqual(fieldsAt, vec2(1.0)));
  vec4 fields = baked ? texture(uFields, fieldsAt) * 2.0 - 1.0 : brushFields(p, n);
#elif defined(BASIS)
  // A crop's brush: on top, read by place; down its sides (a field's edges, whatever its height), worked out live. As
  // brushFields, term by term.
  vec3 w = planeWeights(n);
  vec4 top = basisFields(p.xz, vPaint.y, contourAngle(n, vPaint.z));
  vec4 fields = vec4(w.y * top.xyz, top.w);
  float s = vPaint.y, side = vPaint.z;
  if (w.x > 0.0) fields.xyz += w.x * vec3(paintDabs(p.zy, s, side), paintStrokes(p.zy * s * 0.6, side), paintStrokes(p.zy * s * 1.3, side));
  if (w.z > 0.0) fields.xyz += w.z * vec3(paintDabs(p.xy, s, side), paintStrokes(p.xy * s * 0.6, side), paintStrokes(p.xy * s * 1.3, side));
#else
  vec4 fields = brushFields(p, n);
#endif
  // aPaint.x is how much brushwork shows here: a painter works the banks, edges and turns of the land and leaves the
  // open lawn as quiet colour.
  float detail = vPaint.x;
  float dab = fields.x * detail;
  float br = fields.y;
  vec3 base = driftColorOf(vColor, fields.w, 1.0, dab);
  float vis = sunVisibility(vWorldPos, n, br);
  // Cast shadows on the ground fall to half-tone rather than deep shade: the land stays light and calm.
  float floor_ = mix(0.18, 0.3, smoothstep(0.5, 0.7, abs(n.y)));
  float light = sunLight(n, 0.3) * mix(floor_, 1.0, vis) + dab * 0.07 + br * 0.04 * detail;
  // A fine, faint layer of strokes everywhere, so close up even the quiet lawn is paint, not airbrush. It fades out (its
  // contrast, not its place) as the camera pulls back and the strokes get too small to read.
  vec3 fp = p * vPaint.y * 1.3;
  float fine = fields.z * (1.0 - smoothstep(0.12, 0.4, length(fwidth(fp))));
  light += fine * 0.04;
#ifdef CROP
  // Wind in a field, the way a painter shows it: the gusts roll through as long bands of light (the stalks bent over,
  // showing their paler sides to the sky), with a little shade in the troughs between, stronger as the wind rises.
  float force = smoothstep(0.0, 0.6, windForce());
  float sheen = smoothstep(0.45, 0.85, vGust) - (1.0 - smoothstep(0.1, 0.4, vGust)) * 0.5;
  light += sheen * force * 0.16;
  base = mix(base, oklabToLin(lchShift(linToOklab(base), 0.05, 0.8, 0.0)), max(sheen, 0.0) * force * 0.6);
#endif
  // Wet (#11, wet.ts): the earth muddy, then the paint darker and richer once lit (wetFinish).
  if (uGroundOn > 0.5 && wetAt(p) > 0.0) base = wetBase(base);
  vec3 col = paintBands(base, light, 0.05, n.y * 0.5 + 0.5);
  col = wetFinish(col);
  col += rimColorHere() * rimLight(n, vPaint.w);
  // Frost (#14, frost.ts), and lying snow over it (snow.ts).
  if (uGroundOn > 0.5 && groundAt(p) > 0.0) {
    if (gFrost > 0.0) {
#ifdef GROUND
      // The ground, where it faces up: the hollows first in and last out (the thin snow's pattern: the land's hollows, its
      // unevenness and a finer drift), the sun it's had since dawn clearing it.
      float early = gHollow.z >= 0.0 ? -gHollow.w : 0.0, takes = smoothstep(0.3, 0.8, n.y);
      const bool high = false;
#elif defined(CROP)
      // A crop's tips: early, as the grass's.
      float early = 0.4 + (gHollow.z >= 0.0 ? -gHollow.w * 0.5 : 0.0), takes = smoothstep(0.1, 0.7, n.y);
      const bool high = false;
#else
      // Stones and wood, trunks and bare branches: their tops, a pale edge along a branch, in the sun it's had up there.
      float early = 0.0, takes = smoothstep(0.35, 0.85, n.y) * 0.8;
      const bool high = true;
#endif
      float brush = dab + br * 0.5;
      if (takes > 0.0) {
        vec2 sun = sunHadAt(p.xz);
        col = frostPaint(col, light, frostCover(early, high ? sun.y : sun.x, brush) * takes, brush);
      }
    }
    if (gSnow > 0.0) {
#ifdef GROUND
    // The ground: whole from SNOW_WHOLE up on the flat, less on steep banks; thinner, in patches along the land's own
    // hollows, a patch's edge broken by the brush.
    float cover = snowCover(gSnow, smoothstep(0.55, 0.9, n.y), snowPattern(p.xz) + dab * 0.15, 0.06);
#elif defined(CROP)
    // A crop: its top as the ground's, and its sides buried as deep as the snow lies.
    float cover = max(snowCover(gSnow, smoothstep(0.6, 0.9, n.y), snowPattern(p.xz), 0.06), snowBuries(p, gSnow));
#else
    // Stones and wood: their tops, in patches, and buried at their foot.
    float cover = max(snowCover(gSnow, smoothstep(0.5, 0.85, n.y), snowPattern(p.xz) * 0.6 + br * 0.4, 0.05), snowBuries(p, gSnow));
#endif
    col = mix(col, snowPaint(light, 0.05, fields.x * 1.2 + fine * 0.8), cover);
    }
  }
#ifdef GROUND
  // The game's tools on the land (#206, overlay.ts): its overlay and grid, over the snow, so they read in any weather.
  col = groundTools(col, p, n, light);
#endif
  writeGBuffer(exposeHere(col), n, vViewDepth, 0.0, 1.0);
}
`,gl=`
float dabShape(vec2 c, float seed, float aspect) {
  vec2 q = vec2(c.x, c.y / max(aspect, 0.2));
  float ang = atan(q.y, q.x);
  float lobes = sin(ang * 5.0 + seed) * 0.07 + sin(ang * 9.0 + seed * 1.7) * 0.04;
  // Pointed ends along the stroke: the sides pull in as |x| grows.
  float taper = (1.0 - aspect) * 0.35 * c.x * c.x;
  return 1.0 - length(q) - taper + lobes * aspect + snoise(c * 2.4 + seed) * 0.12;
}
`,_l=`
// Thin things (blades, leaves): no foam line along them, only the wet band (waterline).
#define THIN 1
${pl}
${gl}
varying vec4 vCard;
varying vec3 vDabNormal;
varying float vCardPx;
varying float vFlash;
void main() {
  vec2 c = vCard.xy;
  float seed = vCard.w * 91.0;
  float edge = dabShape(c, seed, vPaint.y);
  // The edge softened over one pixel. Its slope comes from the ellipse, not from fwidth: screen derivatives are taken per
  // 2x2 block of pixels, so they change as the picture moves by one pixel and the edges would shimmer. The reflection is drawn
  // at half size and mirrored (the card no longer faces the camera squarely), so there the derivatives are the right measure.
  vec2 q = vec2(c.x, c.y / max(vPaint.y, 0.2));
  float slope = length(vec2(q.x, q.y / max(vPaint.y, 0.2))) / max(length(q), 1e-3);
  float px = uMirror > 0.5 ? 1.0 / max(fwidth(edge), 1e-4) : vCardPx / (slope * 1.2);
  float alpha = clamp(edge * px + 0.5, 0.0, 1.0);
  if (alpha < 0.02) discard;
#ifdef PREPASS
  // Only the dab's shape and coverage: the painting comes after, where the dab shows.
#ifdef MIRROR_CLIP
  if (vWorldPos.y < waterNear(vWorldPos.xz) - 0.01) discard;
#endif
  gColor = vec4(0.0, 0.0, 0.0, alpha);
  gAux = vec4(0.0);
  return;
#endif
  cloudAt(vWorldPos);
  vec3 nCanopy = normalize(vNormal);
  vec3 n = normalize(nCanopy + vDabNormal * 0.2);
  vec3 p = vRestPos;
  // Strokes follow the dab, so each one carries a couple of brush marks.
  float br = strokes(c * 1.6 + seed, seed);
  vec3 base = driftColor(vColor, p, vPaint.x, br * 0.35 * vPaint.x);
  // A leaf turned over by the wind shows its underside: paler, greyer and cooler, a silvery green.
  vec3 under = linToOklab(base);
  under = hueToward(lchShift(under, 0.13, 0.5, 0.0), shadeHueHere(), 0.25);
  base = mix(base, oklabToLinFit(under), vFlash * 0.75);
  float vis = sunVisibility(vWorldPos, nCanopy, br);
  // In the crown's own shadow the lumps still read: the shadow lowers the light rather than flattening it.
  float lit = sunLight(n, 0.35);
  // Out of the sun, a mass is still lit by the sky from above: tops lighter than undersides, so the shade keeps its form.
  float light = lit * mix(0.32, 1.0, vis) + br * 0.08 + nCanopy.y * 0.12 * (1.0 - vis * lit);
  // A dab is a touch darker at its lower edge, where it tucks under the next.
  light -= (1.0 - smoothstep(-1.0, 0.6, c.y)) * 0.06;
  // Wet (#11, wet.ts): darker and richer once lit (wetFinish).
  if (uGroundOn > 0.5 && wetAt(p) > 0.0) base = wetBase(base);
  vec3 col = paintBands(base, light, 0.07, nCanopy.y * 0.5 + 0.5);
  col = wetFinish(col);
  // A crown's shade goes deeper than the ground's, and cooler: the dark under a tree is what makes it a mass.
  vec3 lab = linToOklab(col);
  float shade = 1.0 - smoothstep(0.25, 0.6, light);
  lab.x *= 1.0 - 0.22 * shade;
  col = oklabToLinFit(hueToward(lab, shadeHueHere(), 0.08 * shade));
  col += rimColorHere() * rimLight(nCanopy, vPaint.w) * vis * 0.15;
  // Against the sun the crown's edges glow, light coming through the leaves.
  float behind = smoothstep(0.0, 0.7, dot(-toCamera(), uSunDir));
  // Light through a leaf takes the leaf's colour: a warm yellow-green, not the sun's orange.
  float side = pow(1.0 - abs(dot(nCanopy, toCamera())), 3.0);
  col += rimColorHere() * tintOf(base, 0.75) * behind * side * vPaint.w * 0.7 * mix(0.4, 1.0, vis);
#ifndef NO_SNOW
  // Frost (#14): a pale rime on the dabs facing up, the crown's top most, as the sun up there has left it. Lying snow over
  // it: the dabs facing up take it, whole dabs at a time (each its own threshold), the crown's top most (under its own
  // leaves, less: the shelter map's crowns).
  if (uGroundOn > 0.5 && groundAt(p) > 0.0) {
    if (gFrost > 0.0 && nCanopy.y > 0.2) col = frostPaint(col, light, frostCover(0.0, sunHadAt(p.xz).y, br) * smoothstep(0.2, 0.8, nCanopy.y) * 0.55, br);
    float cover = snowCover(gSnow, smoothstep(0.05, 0.7, nCanopy.y), hash12(vec2(vCard.w * 37.0, 3.1)) * 2.0 - 1.0, 0.04);
    if (gSnow > 0.0) col = mix(col, snowPaint(light, 0.07, 0.0), cover);
  }
#endif
#ifdef SMOKE
  // Marked as smoke, for a pick to see past (SMOKE_INK, pick.ts).
  writeGBuffer(exposeHere(col), n, vViewDepth, ${Jc.toFixed(8)}, alpha);
#else
  writeGBuffer(exposeHere(col), n, vViewDepth, 0.0, alpha);
#endif
}
`,vl=`
// Thin things (blades, leaves): no foam line along them, only the wet band (waterline).
#define THIN 1
${pl}
varying vec2 vBlade;
void main() {
  // Grass is lit like the ground it grows from (its normal is the ground's), so a meadow reads as one painted surface.
  cloudAt(vWorldPos);
  vec3 n = normalize(vNormal);
  vec3 p = vRestPos;
  float angle = contourAngle(n, vPaint.z);
#ifdef BASIS
  vec4 fields = basisFields(p.xz, vPaint.y, angle);
  float dab = fields.x * 0.6;
  float br = fields.y;
  vec3 base = driftColorOf(vColor, fields.w, vPaint.x, dab);
#else
  float dab = paintDabs(p.xz, vPaint.y, angle) * 0.6;
  float br = paintStrokes(p.xz * vPaint.y * 0.6, angle);
  vec3 base = driftColor(vColor, p, vPaint.x, dab);
#endif
  float vis = sunVisibility(vWorldPos, n, br);
  float light = sunLight(n, 0.3) * mix(0.18, 1.0, vis) + dab * 0.07 + br * 0.04;
  // Tips catch a little more light than roots.
  light += (vBlade.x - 0.5) * 0.1;
  // Wet (#11, wet.ts): darker and richer once lit (wetFinish).
  if (uGroundOn > 0.5 && wetAt(p) > 0.0) base = wetBase(base);
  vec3 col = paintBands(base, light, 0.06, 0.8);
  col = wetFinish(col);
  col += rimColorHere() * vPaint.w * vBlade.x * vBlade.x * vis * 0.25;
  // Frost (#14): the blades' tips first, before the ground round them (winter's straw whitening most), the sun the ground
  // has had clearing it. Lying snow over it: where the ground under it is white, a blade is buried as deep as the snow
  // lies, its tip poking through; painted as the ground's snow is, so the buried part is lost in it.
  if (uGroundOn > 0.5 && groundAt(p) > 0.0) {
    if (gFrost > 0.0 && vBlade.x > 0.2) {
      float early = 0.5 + (gHollow.z >= 0.0 ? -gHollow.w * 0.5 : 0.0);
      col = frostPaint(col, light, frostCover(early, sunHadAt(p.xz).x, br) * smoothstep(0.2, 0.85, vBlade.x), br);
    }
    float cover = gSnow > 0.0 ? snowBuries(p, gSnow) : 0.0;
    if (cover > 0.0) col = mix(col, snowPaint(light, 0.06, 0.0), cover);
  }
  writeGBuffer(exposeHere(col), n, vViewDepth, 0.0, 1.0);
}
`,yl=`
${pl}
${Vo}
${Nc}
uniform vec3 uSkyTop;
uniform vec3 uSkyBottom;
varying vec2 vUv;
#ifdef PARTS
varying vec2 vGlow;
#endif
void main() {
  cloudAt(vWorldPos);
  vec3 n = normalize(vNormal);
  // Mirroring flips which side faces the camera.
  if (gl_FrontFacing == (uMirror > 0.5)) n = -n;
  vec3 p = vWorldPos;
  float finish = vPaint.x;
  // It floats (no waterline on it, #18).
  gFloats = vPaint.w;
  vec3 base = vColor;
  float vis = sunVisibility(p, n, 0.0);
  float light = sunLight(n, 0.2) * mix(0.2, 1.0, vis);
  if (finish > 1.5 && finish < 2.5) {
    // Timber: a few long grain streaks.
    float g = snoise(vec2(vUv.x * 1.5, vUv.y * 24.0)) * 0.5 + 0.5;
    base = oklabToLin(lchShift(linToOklab(base), (g - 0.5) * 0.05, 1.0, 0.0));
  }
  vec3 col = paintBands(base, light, 0.02, n.y * 0.5 + 0.5);
  if (finish > 2.5) {
    // Tin (uv in metres: down the slope, along the ridge): its corrugations, as tone only, never lines; fading out
    // before they're a few pixels apart, so they don't crawl.
    float q = vUv.y * vPaint.z;
    float fade = 1.0 - smoothstep(0.12, 0.3, max(fwidth(q), 1e-4));
    col *= 1.0 - 0.09 * fade * (0.5 + 0.5 * cos(q * 6.2831853));
  }
  if (finish > 0.5 && finish < 1.5) {
    // Solar glass: deep blue cells under the sky's reflection: the clouds drift across the whole array (one sky over all
    // of it, the water's too), brightest where the glass turns towards the horizon, with a sheen where the sun is.
    vec2 cells = vUv * vPaint.yz;
    // Lines a pixel's worth antialiased, and fading out as the cells shrink to a few pixels, so they don't crawl.
    vec2 fw = max(fwidth(cells), 1e-4);
    vec2 line = clamp((0.03 - (0.5 - abs(fract(cells) - 0.5))) / fw + 0.5, 0.0, 1.0);
    float grid = max(line.x, line.y) * (1.0 - smoothstep(0.12, 0.3, max(fw.x, fw.y)));
    vec3 v = toCamera();
    // In the water's reflection the glass is seen from the camera's mirror image, below the water.
    if (uMirror > 0.5) v.y = -v.y;
    vec3 r = reflect(-v, n);
    float fres = 0.2 + 0.5 * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.0);
    // The sky it faces, the clouds drifting through it (#8), and long glints across the rows.
    float cloud;
    vec3 seen = mirrorSky(skyPoint(p, r), 1.0 - clamp(r.y * 1.5, 0.0, 1.0), cloud);
    float glint = smoothstep(0.75, 1.0, sin(dot(p.xz, vec2(0.55, 0.35)) + fbm2(p.xz * 0.1) * 1.5));
    // Dark glass mirrors weakly: a cloud shows as a paler patch in its blue, not white.
    seen = mix(mix(uGapSkyTop, uGapSkyBottom, 1.0 - clamp(r.y * 1.5, 0.0, 1.0)), seen, 0.5);
    vec3 sky = mix(seen, mix(uSkyBottom, vec3(1.0), 0.5), glint * 0.6);
    vec3 glass = mix(col, sky * sunTint(), clamp(fres + cloud * 0.15 + glint * 0.4, 0.0, 1.0));
    float sun = pow(max(dot(r, uSunDir), 0.0), 6.0);
    // No sun to shine in it under a cloud.
    glass = mix(glass, vec3(1.0) * sunTint(), sun * 0.6 * vis * (1.0 - gCloud));
    col = mix(glass, glass * 1.3 + 0.04, grid * 0.35);
  }
  // Wet (#11, wet.ts): darker, with the sky glazed over it (not the solar glass, which is glass wet or dry).
  if (uGroundOn > 0.5 && (finish < 0.5 || finish > 1.5) && wetAt(p) > 0.0) col = wetInked(col, n, p);
  // Frost (#14): a pale rime on the tops of built things (roofs, fences, crates, a solar panel's glass), as the sun up
  // there has left it. Lying snow over it: on their tops and their roofs' slopes. A thin cover is a veil the roof shows
  // through, thickening to white (patches on a roof read as camouflage), a little uneven.
  if (uGroundOn > 0.5 && groundAt(p) > 0.0) {
    if (gFrost > 0.0 && n.y > 0.35) col = frostPaint(col, light, frostCover(-0.2, sunHadAt(p.xz).y, 0.0) * smoothstep(0.35, 0.7, n.y) * 0.85, 0.0);
    if (gSnow > 0.0) {
      // Keyed to where it is at rest, so the snow on a turning part goes round with it.
      float uneven = snoise(vRestPos.xz * 1.3) * 0.7 + snoise(vRestPos.xz * 5.0) * 0.3;
      float cover = snowCover(gSnow, smoothstep(0.4, 0.65, n.y), uneven * 0.25, 0.45);
      col = mix(col, snowPaint(light, 0.02, uneven * 0.3), cover);
    }
  }
  col = exposeHere(col);
#ifdef PARTS
  // Lit at night (#205): a lamp or a fire in its own colour, bright, whatever the light; windows a warm lamplight.
  if (vGlow.x > 0.0) col = mix(col, vGlow.y > 0.5 ? vec3(1.7, 0.86, 0.3) : vColor * 2.2 + vec3(0.2, 0.12, 0.03), vGlow.x);
#endif
  writeGBuffer(col, n, vViewDepth, 1.0, 1.0);
}
`,bl=400,xl={ripple:.0035,chop:.006,chopMax:1.5,reflectNudge:1.6,blurPx:3,coverWide:2.5},Sl=e=>Number.isInteger(e)?e.toFixed(1):String(e),Cl=`
uniform vec4 uLandSquare;
bool sheetHidden(vec3 p, float mud) {
  if (mud < -${wo}) return true;
  if (uLandSquare.z <= 0.0) return false;
  vec2 d = p.xz - uLandSquare.xy;
  float c = cos(uLandSquare.w), s = sin(uLandSquare.w);
  return max(abs(c * d.x - s * d.y), abs(s * d.x + c * d.y)) > uLandSquare.z;
}
`,wl=`
${pl}
${Vo}
uniform sampler2D uUnder;
uniform sampler2D uUnderAux;
uniform sampler2D uReflect;
uniform vec2 uScreen;
uniform vec3 uSkyTop;
uniform vec3 uSkyBottom;
varying vec2 vFlow;
varying float vMud;
varying vec2 vMirrorShift;
${Cl}
${Us}
// The ice (#14): how frozen the water is here and whether it's thawing (the game's map, per cell, see WaterField), and
// how it's painted: milky along the banks, dark over the deep channel (the developer's pick of three candidates on #14;
// the others were black all over, and milky all over).
varying vec3 vIce;
uniform float uIceOn;
// A cracked sheet's cells (and the floes it breaks into): how far inside its cell a point is (the gap to the next
// cell's centre, 0 on an edge), and the cell's id.
vec3 iceCells(vec2 q) {
  vec2 i = floor(q), f = fract(q), id = vec2(0.0);
  float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = g + hash22(i + g) * 0.8 + 0.1 - f;
    float d = dot(o, o);
    if (d < d1) { d2 = d1; d1 = d; id = i + g; } else if (d < d2) d2 = d;
  }
  return vec3(sqrt(d2) - sqrt(d1), id);
}
// The flow carries the ripples and the glints along (a flow map: two copies, each carried for a while and then put back,
// crossfaded so neither's jump shows, each place on its own beat so no pulse runs over the whole river). However the flow
// turns and changes speed across the water, the pattern is never dragged out of shape.
const float FLOW_CYCLE = 4.0;
float crest(float ripple) { return smoothstep(-0.15, 0.35, ripple); }
// Glints of sun on the ripples' crests: soft points drawn out a little along the current (the developer, #19: dashes
// across it read as horizontal ticks), carried along by it, each winking in and out on its own beat. Sparse and soft, so
// they sit on the clear water rather than whiting it out.
float sparkle(vec2 q, vec2 dir) {
  vec2 fq = vec2(dot(q, dir), dot(q, vec2(-dir.y, dir.x))) * vec2(2.2, 3.0);
  vec2 cell = floor(fq), f = fract(fq) - 0.5 - (hash22(cell) - 0.5) * 0.5;
  float h = hash12(cell + 7.3);
  float wink = max(0.0, sin(uTime * (2.0 + h * 3.0) + h * 40.0));
  return (1.0 - smoothstep(0.5, 1.0, length(f / vec2(0.3, 0.17)))) * step(0.5, h) * wink;
}
// Fast water's streaks (#18): long bands of light along the flow, in the flow's own frame, carried as the ripples are.
float streaks(vec2 q, vec2 dir) {
  vec2 r = vec2(dot(q, dir), dot(q, vec2(-dir.y, dir.x)));
  return snoise(r * vec2(0.2, 3.0)) * 0.65 + snoise(r * vec2(0.45, 6.5) + 5.0) * 0.35;
}
// Patterns laid along the flow are laid at fixed 30° turns and the two nearest blended, as the ground's brush is
// (paintStrokes): turning a pattern by the flow's own angle, which changes round a bend, shears it the more the further it
// is from the world's origin, into the marbled swirls across the current the developer found (#19).
vec3 flowTurns(float a) {
  const float STEP = 0.5235988;
  float k = a / STEP, k0 = floor(k);
  return vec3(k0 * STEP, (k0 + 1.0) * STEP, smoothstep(0.3, 0.7, k - k0));
}
vec2 turnDir(float a) { return vec2(cos(a), sin(a)); }
float sparkleT(vec2 q, vec3 t) { return mix(sparkle(q, turnDir(t.x)), sparkle(q, turnDir(t.y)), t.z); }
float streaksT(vec2 q, vec3 t) { return mix(streaks(q, turnDir(t.x)), streaks(q, turnDir(t.y)), t.z); }

// Light through the ripples, gathered into a moving web on the bed (the clear stream).
float caustic(vec2 q) {
  vec2 a = q * 1.5;
  float c1 = 1.0 - abs(snoise(a + vec2(uTime * 0.22, 0.0)));
  float c2 = 1.0 - abs(snoise(a * 1.37 + 5.0 - vec2(0.0, uTime * 0.18)));
  return pow(c1 * c2, 5.0);
}
void main() {
  if (sheetHidden(vWorldPos, vMud)) discard;
  // How much the silt shows: a little soon browns water (and halfway between teal and brown is grey).
  float mud = 1.0 - pow(1.0 - clamp(vMud, 0.0, 1.0), 3.0);
  cloudAt(vWorldPos);
  vec3 n = vec3(0.0, 1.0, 0.0);
  vec3 p = vWorldPos;
  vec2 flow = vFlow;
  float speed = length(flow);
  // The ripples lie along the flow; still water lies along the map's x.
  float flowA = speed > 1e-4 ? atan(flow.y, flow.x) : 0.0;
  vec2 uv = gl_FragCoord.xy / uScreen;
  float beat = uTime / FLOW_CYCLE + snoise(p.xz * 0.11 + 3.0) * 0.5;
  float f1 = fract(beat), f2 = fract(beat + 0.5);
  float w1 = 1.0 - abs(2.0 * f1 - 1.0), w2 = 1.0 - w1;
  // The two copies' weights, keeping the pattern's strength through the crossfade (two unlike patterns averaged are fainter).
  float norm = inversesqrt(w1 * w1 + w2 * w2);
  vec2 q1 = p.xz - flow * f1 * FLOW_CYCLE, q2 = p.xz - flow * f2 * FLOW_CYCLE + vec2(17.3, 9.1);
  // Ripples: long, soft swells along the flow, and their screen-space nudge.
  float ripple1 = paintStrokes(q1 * 1.3, flowA) * 0.65 + paintStrokes(q1 * 2.9 + 7.0, flowA + 0.3) * 0.35;
  float ripple2 = paintStrokes(q2 * 1.3, flowA) * 0.65 + paintStrokes(q2 * 2.9 + 7.0, flowA + 0.3) * 0.35;
  float ripple = (ripple1 * w1 + ripple2 * w2) * norm;
  vec2 nudge = (vec2(snoise(q1 * 1.7), snoise(q1 * 1.7 + 19.0)) * w1 + vec2(snoise(q2 * 1.7), snoise(q2 * 1.7 + 19.0)) * w2) * norm
    * ${Sl(xl.ripple)};
  // Chop: the wind raises short wavelets across its direction that run downwind, rougher in the gusts. They break up the
  // reflection, and in a storm their crests whiten. They travel as short waves do, about a metre a second in a storm, far
  // slower than the gusts: any faster and they flicker, and the glints and whitecaps keyed to them blink.
  float windA = atan(uWindDir.y, uWindDir.x);
  float chopAmt = smoothstep(0.03, 0.7, windForce()) * (0.5 + windGust(p.xz));
  vec2 cq = p.xz - uWindDrift * 0.1;
  float chop = strokes(cq * 3.2, windA + 1.5707963) * 0.6 + strokes(cq * 6.5 + 3.0, windA + 1.3) * 0.4;
  ripple = mix(ripple, chop, clamp(chopAmt * 0.8, 0.0, 0.8)) + chop * chopAmt * 0.25;
  nudge += vec2(snoise(cq * 4.0), snoise(cq * 4.0 + 7.0)) * ${Sl(xl.chop)} * chopAmt;
  // Cat's paws (#36): where a gust passes over the water in a light wind, a patch of it roughens: fine ripples that
  // break up the reflection a little, darken it a little and glint. The look is the developer's pick, "glitter": the
  // glints carry it, and the mild darkening lets the patch read as one. The patch travels with the gust; the ripples stay
  // nearly put, as they do on a pond. Gone in a dead calm, and from about 8 m/s, when the whole surface is chop. (Their nudge, with the chop's
  // in a light wind, stays well inside WATER_REACH.)
  // Water lies low among banks and trees, sheltered more in some places than others, so a gust is read against how hard
  // the wind usually blows just there: a paw where it's blowing a quarter harder than usual.
  // The wind's cells are a metre or more and a gust spans many, so its edge is broken up by a ragged noise carried with
  // the air: scalloped patches a few metres across, and small ones running ahead, not the whole stream dimming at once.
  // Only round a gust: in the usual wind the noise alone would make paws.
  vec2 bq = (p.xz - uWindDrift * 0.8) * 0.4;
  float ragged = snoise(bq) * 0.6 + snoise(bq * 2.3 + 5.0) * 0.4;
  float gustHere = windGustHere(p.xz);
  float paw = smoothstep(1.15, 1.3, gustHere + ragged * 0.35 * smoothstep(1.0, 1.15, gustHere))
    * smoothstep(0.5, 2.0, uWindSpeed) * (1.0 - smoothstep(6.0, 10.0, uWindSpeed));
  vec2 pq = p.xz * 7.0 - uWindDir * uTime * 0.15;
  nudge += vec2(snoise(pq), snoise(pq + 11.0)) * 0.002 * paw;

  // Under the water.
  vec2 uvBed = uv + nudge;
  vec3 bed = texture(uUnder, uvBed).rgb;
  float bedDepth = texture(uUnderAux, uvBed).z;
  float path = bedDepth > 0.0 ? max(bedDepth - vViewDepth, 0.0) : 3.0;
  vec3 turns = flowTurns(flowA);
  // How warm the low sun's light is: 1 at the golden hour and sunset, none at noon or night (#19: the evening water was
  // slate-blue, mirroring the upper sky, when it should glow warm). It takes both a gold sun and a low one. The colour
  // alone (linear, red over blue: ~0.3 at noon, ~0.45-0.6 mid-morning and early afternoon, 0.73 at sunset, 0.86 at the
  // golden hour) would light it all day, since the sun warms through the afternoon. The height alone would light a
  // winter's noon, its sun low but white. An overcast sky greys the sun (overcast.ts), a storm's golden break golds it.
  vec3 sunHue = uSunColor / max(max(uSunColor.r, uSunColor.g), 1e-3);
  float warmth = smoothstep(0.55, 0.75, sunHue.r - sunHue.b) * smoothstep(-0.03, 0.06, uSunDir.y)
    * (1.0 - smoothstep(0.3, 0.5, uSunDir.y));
  vec3 waterLab = linToOklab(vColor);
  // Clear (#19, the developer's pick): little tint in the shallows, where the bed shows, a deep, saturated teal in the deep.
  vec3 scatter = oklabToLin(lchShift(waterLab, -0.02, 1.7, -0.1));
  vec3 absorb = vec3(1.3, 0.45, 0.36);
  float vis = sunVisibility(p, n, ripple);
  // The bed honey-coloured in the evening light, and the light through the ripples on it: only where the sun reaches it,
  // through shallow, clear water. (One copy, not carried by the flow: the web shimmers in place on its own.)
  bed *= mix(vec3(1.0), vec3(1.3, 1.08, 0.72), warmth * 0.6);
  float sunOnBed = vis * (1.0 - gCloud) * (1.0 - overcastHere().x) * exp(-path * 1.1) * (1.0 - mud);
  if (sunOnBed > 0.01) bed += bed * caustic(p.xz) * sunTint() * 1.8 * sunOnBed;
  // Muddy water (#18, the developer's pick "brown"): silt makes it ochre brown and opaque, the bed lost a hand's depth down.
  scatter = mix(scatter, vec3(0.28, 0.15, 0.045), mud);
  absorb = mix(absorb, vec3(4.0, 4.4, 5.0), mud);
  vec3 through = exp(-absorb * path);
  // The body of the water is lit from above by the sky; the sun shows in its sparks.
  // The bed and the reflection are lit where they are already; the water's own light is exposed here (exposeHere).
  // (Silt is lit as the land is, by the sun as much as the sky.)
  scatter = exposeHere(scatter * mix(skyTint(), mix(skyTint(), sunTint(), 0.6), mud) * mix(0.75, 1.0, vis));
  vec3 under = bed * through + scatter * (1.0 - through);

  // The reflection, and the sky where nothing is reflected: looking down at 30 degrees, the water mirrors the sky 30 degrees up.
  // Taken through a small blur: the reflection is drawn at half size, and its thin bright things (grass blades above all)
  // would flicker as the camera moves.
  vec2 rt = ${Sl(xl.blurPx)} / uScreen;
  vec2 ruv = uv + nudge * ${Sl(xl.reflectNudge)} - vMirrorShift;
  vec4 refl = (texture(uReflect, ruv) * 2.0 + texture(uReflect, ruv + vec2(rt.x, 0.0)) + texture(uReflect, ruv - vec2(rt.x, 0.0))
    + texture(uReflect, ruv + vec2(0.0, rt.y)) + texture(uReflect, ruv - vec2(0.0, rt.y))) / 6.0;
  // The upper sky, and on the ripples' crests, which tilt towards the horizon, the glow low in it: a mean of the two would be grey.
  // The clouds in it (#8) along the mirrored ray, shaken by the ripples.
  // In the evening the whole surface mirrors the glow low in the sky, evenly and softly, so the evening water reads warm
  // rather than slate (#19, the developer's pick "evening B", a third softer: fuller, it went pale. Not in streaks on the
  // swells: those smears, round one, the developer found ugly).
  float evenCrest = warmth * 0.3;
  float low = 0.25 + 0.6 * evenCrest;
  vec3 sky = mix(uGapSkyTop, uGapSkyBottom, 0.25);
  if (evenCrest > 0.0) {
    vec3 glowLow = oklabToLin(lchShift(linToOklab(mix(uGapSkyBottom, sunColorHere() / max(max(sunColorHere().r, sunColorHere().g), 1e-3), 0.45)), 0.04, 1.3, 0.0));
    sky = mix(sky, glowLow, evenCrest);
  }
  sky = exposeHere(sky);
  vec3 mirrored = sky * (1.0 - refl.a) + refl.rgb;
  // Mostly see-through: the bed shows in the shallows, and the reflection grows only where the water is deep and dark.
  float depthy = 1.0 - (through.g * 0.5 + through.b * 0.5);
  // (Muddy water is opaque, but its silt is what shows, not a deep pool's mirror.)
  float fres = clamp(0.04 + depthy * 0.18 * (1.0 - 0.6 * mud) + ripple * 0.06, 0.0, 0.4);
  // Under an overcast sky the water mirrors more of it, bright and even, and reads as pale steel among the dimmed land
  // rather than murky (the bed, unlit by any sun, shows less). (#19)
  fres = mix(fres, 0.32, overcastHere().x * 0.7 * (1.0 - 0.6 * mud));
  fres = mix(fres, 0.4, evenCrest * 0.4 * (1.0 - 0.6 * mud));
  vec3 col = mix(under, mirrored, fres);
  // The clouds in it (#8), along the mirrored ray and shaken by the ripples: their light over the sky's, alike over the
  // shallows and the deep (the depth is read at half size, and its grain would show against a bright cloud and shimmer as
  // the camera moves), and over the faint things mirrored in front of them (thin blades), not the solid ones. How strongly
  // they show: the developer's pick, "clear" (#8).
  float cloud;
  vec3 clouded = exposeHere(mirrorSky(skyPoint(p, reflect(-toCamera(), n)) + nudge * ${Sl(bl)}, low, cloud));
  vec2 wide = rt * ${Sl(xl.coverWide)};
  float cover = (refl.a * 2.0 + texture(uReflect, ruv + wide).a + texture(uReflect, ruv - wide).a
    + texture(uReflect, ruv + vec2(wide.x, -wide.y)).a + texture(uReflect, ruv - vec2(wide.x, -wide.y)).a) / 6.0;
  float solid = smoothstep(0.35, 0.9, cover);
  // Fading out at the very edge, where only a film of water lies over the bank.
  float film = smoothstep(0.0, 0.5, path);
  col += (clouded - sky) * (1.0 - solid) * film * 0.365 * (0.85 + 0.3 * ripple);
  col = mix(col, exposeHere(mix(uSkyBottom, vec3(1.0), 0.25)), smoothstep(0.5, 0.9, ripple) * 0.25 * depthy * (1.0 - 0.6 * mud));
  // Sparkle: glints of sun on the ripples' crests (sparkle), carried by the flow as the ripples are.
  // (Worked out only where one could show: on a crest, in the sun.)
  float spark = crest(ripple) * vis * (1.0 - gCloud);
  if (spark > 0.001) spark *= sparkleT(q1, turns) * w1 + sparkleT(q2, turns) * w2;
  // No glints under a cloud.
  // (The river's own glints dim a little in a paw, as it darkens.)
  // (In the evening the glints take the low sun's gold, #19: the developer's idea.)
  vec3 glintC = exposeHere(mix(vec3(1.0), sunTint(), 0.5));
  if (warmth > 0.0) glintC = mix(glintC, exposeHere(oklabToLin(lchShift(linToOklab(sunColorHere()), 0.0, 1.5, 0.0))) * 1.2, warmth);
  col = mix(col, glintC,
    spark * (0.2 + depthy * 0.4) * (1.0 - paw * 0.28));
  // The paws: a little darker and cooler, as a roughened patch mirrors less of the bright sky, and glinting in fine points
  // that wink quickly, as many more tiny facets catch the sun. Only as bright as the sun is direct (uCloudStrength): none
  // under full cover or before dawn, faint by the moon. (gCloud is the cloud's shade already scaled by uCloudStrength, so
  // this is the direct light times the cloud's gap.)
  col = mix(col, col * vec3(0.5, 0.58, 0.68), paw * 0.35);
  vec2 gq = p.xz * 6.0 - uWindDir * uTime * 0.15;
  vec2 gc = floor(gq), gf = fract(gq) - 0.5 - (hash22(gc) - 0.5) * 0.6;
  float gh = hash12(gc + 3.1);
  float glit = (1.0 - smoothstep(0.1, 0.2, length(gf))) * step(0.4, gh) * max(0.0, sin(uTime * (5.0 + gh * 6.0) + gh * 50.0));
  col = mix(col, glintC, glit * paw * vis * max(uCloudStrength - gCloud, 0.0));
  // Fast water (#18, the developer's pick "streaks"), from about a metre a second: the stream in spate.
  float fast = smoothstep(0.45, 1.1, speed);
  if (fast > 0.0) {
    // Streaks: the surface torn into long bands along the flow, their faces catching the sky's glow, darker between.
    float st = (streaksT(q1, turns) * w1 + streaksT(q2, turns) * w2) * norm;
    col = mix(col, exposeHere(mix(uSkyBottom, vec3(1.0), 0.35) * skyTint()), smoothstep(0.2, 0.7, st) * fast * 0.32);
    col *= 1.0 - (1.0 - smoothstep(-0.7, -0.2, st)) * fast * 0.14;
  }
  // Whitecaps on the chop's crests in a storm.
  float caps = smoothstep(0.55, 0.9, chop) * smoothstep(0.45, 1.0, windForce()) * smoothstep(0.4, 0.9, windGust(p.xz) + 0.2);
  col = mix(col, exposeHere(mix(uSkyBottom, vec3(1.0), 0.6) * skyTint()), caps * 0.45);
  // Rain's rings (#11): pale lines of the sky's light where the drops land, fewer under a crown, none under a roof.
  if (uRings.x > 0.0) {
    float rings = rainRings(p.xz) * (1.0 - shelter(p));
    col = mix(col, exposeHere(mix(uSkyBottom, vec3(1.0), 0.45) * skyTint()), rings);
  }
  // Ice (#14). In a cell partly frozen, the water by the banks and the slow water freeze first and the fast middle last
  // (how far from the shore: the map's, per cell, smoothed between them). New ice is a clear dark skin; it pales
  // (in the milky looks) as it ages. Thawing, it darkens wet, dark leads open along the flow, and the middle breaks into
  // floes that drift down with the flow and shrink, the ice along the banks going last.
  // (Its rank and its derivatives taken wherever there's ice anywhere: the same for every pixel, so they're defined at
  // the edge of the frozen cells too.)
  if (uIceOn > 0.5) {
    float iceAmt = vIce.x;
    bool thawing = vIce.y > 0.5;
    float shore = vIce.z;
    float breakup = snoise(p.xz * 0.5 + 41.0) * 0.6 + snoise(p.xz * 1.6 + 3.0) * 0.4;
    // (Never below a little over nothing: no ice at all where the map has none, and no seam where a frozen cell meets an
    // open one.)
    float order = max(0.55 * smoothstep(0.0, 3.5, shore) + 0.3 * smoothstep(0.1, 0.7, speed) + 0.12 * breakup + 0.02, 0.04);
    float reach = iceAmt * 1.1;
    float fixedIce = smoothstep(order - 0.03, order + 0.03, reach);
    // How long it's been frozen here, 0 a new skin .. 1 old ice.
    float age = smoothstep(0.0, 0.3, reach - order);
    // Along the flow and across it (still water: the map's x), at the two nearest of the fixed turns and blended (#19:
    // turned by the flow's own angle, the leads and streaks sheared into swirls round a bend; see flowTurns).
    vec2 d0 = turnDir(turns.x), d1 = turnDir(turns.y);
    vec2 cr = vec2(dot(p.xz, d0), dot(p.xz, vec2(-d0.y, d0.x))), cr1 = vec2(dot(p.xz, d1), dot(p.xz, vec2(-d1.y, d1.x)));
    // The ice's edge against open water: a pale line, a pixel or two wide, as its rim catches the light.
    float edgeAt = reach - order - 0.012;
    // (No wider than a band of the rank, however steeply the ice changes between cells, and fading out as the ice does,
    // so nothing's left to cut off where there's next to none.)
    float rim = (1.0 - smoothstep(0.0, clamp(fwidth(edgeAt) * 1.5, 0.006, 0.04), abs(edgeAt))) * smoothstep(0.002, 0.03, iceAmt);
    // How fine a detail can be before it's under a pixel (taken here, before the branches).
    float fine = 1.0 - smoothstep(0.1, 0.3, length(fwidth(p.xz * 9.0)));
    float cw = length(fwidth(p.xz * 0.6));
    if (iceAmt > 0.002) {
      float iceCover = fixedIce, floes = 0.0;
      if (thawing) {
        // Leads: dark lanes along the flow, opening as the ice goes.
        float lane = abs(mix(snoise(cr * vec2(0.12, 0.9) + 13.0), snoise(cr1 * vec2(0.12, 0.9) + 13.0), turns.z));
        float lead = smoothstep(0.0, 0.03, lane - (1.0 - iceAmt) * 0.22);
        iceCover *= lead; rim *= lead;
        // Floes, carried by the flow as the ripples are (two copies, each carried a while and put back): each copy's floes
        // shrink away as it fades and grow as it comes back, fewer as the ice goes. (Only in the open water.)
        if (fixedIce < 0.999) {
          float fb = uTime / 14.0 + snoise(p.xz * 0.07 + 5.0) * 0.5;
          float g1 = fract(fb), g2 = fract(fb + 0.5), v1 = 1.0 - abs(2.0 * g1 - 1.0), v2 = 1.0 - v1;
          vec3 c1 = iceCells((p.xz - flow * g1 * 14.0) * 0.8), c2 = iceCells((p.xz - flow * g2 * 14.0) * 0.8 + vec2(31.0, 17.0));
          float left = smoothstep(0.02, 0.5, iceAmt);
          // (Each floe shrinks away by its own share of what's left, so they go one by one, none at once.)
          float s1 = 0.06 + (1.0 - left) * 0.3 + (1.0 - smoothstep(0.0, 0.3, v1)) * 0.6 + clamp((hash12(c1.yz) - left) * 3.0, 0.0, 1.0) * 0.5;
          float s2 = 0.06 + (1.0 - left) * 0.3 + (1.0 - smoothstep(0.0, 0.3, v2)) * 0.6 + clamp((hash12(c2.yz + 9.0) - left) * 3.0, 0.0, 1.0) * 0.5;
          float f1 = smoothstep(0.0, 0.04, c1.x - s1), f2 = smoothstep(0.0, 0.04, c2.x - s2);
          floes = max(f1, f2) * (1.0 - fixedIce);
          iceCover = max(iceCover, floes);
        }
      }
      if (iceCover + rim > 0.001) {
        float lightI = sunLight(n, 0.3) * mix(0.3, 1.0, vis);
        // Black ice: dark, the bed faint through it, and glossy: the sky and the banks mirrored whole, not broken by ripples.
        vec2 ruv0 = uv - vMirrorShift;
        // (Blurred a little wider than the open water's: with no ripples to break it up, its half-size texels would shimmer.)
        vec2 rt0 = rt * 1.6;
        vec4 r0 = (texture(uReflect, ruv0) * 2.0 + texture(uReflect, ruv0 + vec2(rt0.x, 0.0)) + texture(uReflect, ruv0 - vec2(rt0.x, 0.0))
          + texture(uReflect, ruv0 + vec2(0.0, rt0.y)) + texture(uReflect, ruv0 - vec2(0.0, rt0.y))) / 6.0;
        vec3 mirror0 = sky * (1.0 - r0.a) + r0.rgb;
        vec3 black = bed * through * 0.35 + scatter * (1.0 - through) * 0.5;
        black = mix(black, mirror0, 0.32) + (clouded - sky) * (1.0 - solid) * 0.25;
        // Milky ice by the banks: pale blue-white, lit as the snow is, streaked along the flow by how it froze.
        float m = 1.0 - smoothstep(0.8, 2.2, shore + breakup * 0.5);
        // A floe's broken ice is paler.
        m = max(m * age, floes * 0.55);
        vec3 iceCol = black;
        if (m > 0.0) {
          float streak = mix(snoise(cr * vec2(0.35, 4.0) + 7.0) * 0.65 + snoise(cr * vec2(0.9, 9.0)) * 0.35 * fine,
            snoise(cr1 * vec2(0.35, 4.0) + 7.0) * 0.65 + snoise(cr1 * vec2(0.9, 9.0)) * 0.35 * fine, turns.z);
          vec3 milky = snowPaint(lightI, 0.08, streak * 0.5) * vec3(0.74, 0.84, 0.96);
          iceCol = mix(black, mix(milky, black, 0.28 + 0.1 * streak), m);
        }
        // Cracks: fine pale lines keyed to the world, fading as the cells shrink towards a pixel.
        if (age > 0.0 && cw < 0.1) {
          vec3 ck = iceCells(p.xz * 0.6 + 9.0);
          float crack = (1.0 - smoothstep(0.0, 0.03 + cw, ck.x)) * (1.0 - smoothstep(0.03, 0.1, cw)) * age
            * smoothstep(-0.2, 0.3, snoise(p.xz * 0.25 + 77.0));
          iceCol = mix(iceCol, snowPaint(lightI, 0.05, 0.0), crack * mix(0.3, 0.45, m));
        }
        // Thawing: wet, darker and glossier as it goes.
        if (thawing) iceCol = mix(iceCol * 0.82, mirror0, 0.12 * (1.0 - iceAmt));
        // Lying snow (the ground's map) on it: a thin dusting streaked by the wind, at most, so the river still reads.
        float lying = groundState(p.xz).x;
        if (lying > 0.004) {
          vec2 wr = vec2(dot(p.xz, uWindDir), dot(p.xz, vec2(-uWindDir.y, uWindDir.x)));
          float drift = snoise(wr * vec2(0.25, 0.6) + 2.0) * 0.7 + snoise(wr * vec2(0.7, 1.6)) * 0.3 * fine;
          iceCol = mix(iceCol, snowPaint(lightI, 0.06, drift * 0.3), smoothstep(-0.1, 0.6, drift + lying - 0.5) * min(lying * 1.4, 0.5) * age);
        }
        col = mix(col, iceCol, iceCover);
        col = mix(col, snowPaint(lightI, 0.05, 0.0), rim * 0.5);
      }
    }
  }
  writeGBuffer(col, n, vViewDepth, 0.0, 1.0);
}
`,Tl=`
layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gAux;
#if defined(MIRROR_CLIP) || defined(WATER_SHEET)
varying vec3 vWorldPos;
#endif
#ifdef MIRROR_CLIP
${Do}
#endif
#ifdef WATER_SHEET
${Cl}
varying float vMud;
#endif
void main() {
#ifdef WATER_SHEET
  if (sheetHidden(vWorldPos, vMud)) discard;
#endif
#ifdef MIRROR_CLIP
  // As writeGBuffer does in the reflection: what's under the water isn't reflected.
  if (vWorldPos.y < waterNear(vWorldPos.xz) - 0.01) discard;
#endif
  gColor = vec4(0.0); gAux = vec4(0.0);
}
`,El=`
void main() { gl_FragColor = vec4(1.0); }
`,Dl=`
${Lo}
${gl}
varying vec4 vCard;
varying vec4 vPaint;
bool dabOut() { return dabShape(vCard.xy, vCard.w * 91.0, vPaint.y) < 0.0; }
`,Ol=`
${Lo}
${gl}
varying vec4 vCard;
varying vec4 vPaint;
void main() {
  if (dabShape(vCard.xy, vCard.w * 91.0, vPaint.y) < 0.0) discard;
  gl_FragColor = vec4(1.0);
}
`,kl={paint:sl,ground:sl,crop:sl,ink:sl,water:cl,foliage:ll,grass:ul,debris:dl,smoke:fl},Al={paint:hl,ground:hl,crop:hl,ink:yl,water:wl,foliage:_l,grass:vl,debris:_l,smoke:_l},jl=new W(2911860),Ml={paint:{TREES:1,AT_GROUND:1,PARTS:1},ink:{PARTS:1},ground:{TREES:1,GROUND:1,AT_GROUND:1},crop:{CROP:1,AT_GROUND:1},grass:{AT_GROUND:1},debris:{NO_SNOW:1},smoke:{NO_SNOW:1,SMOKE:1},water:{WATER_SHEET:1,WATER_COLOR:`vec3(${jl.r.toFixed(6)}, ${jl.g.toFixed(6)}, ${jl.b.toFixed(6)})`}},Nl=e=>e===`foliage`||e===`debris`||e===`smoke`,Pl=e=>e===`grass`||Nl(e)||e===`ink`?2:0;function Fl(e){return e.defaultAttributeValues.aPart=[0],e}function Il(e,t){let n=new o({glslVersion:K,uniforms:{...t},vertexShader:kl[e],fragmentShader:Al[e],defines:{...Ml[e]},vertexColors:!0,side:Pl(e)});return Nl(e)&&(n.alphaToCoverage=!0),Fl(n)}function Ll(e,t,n=!1){let r=new o({glslVersion:K,uniforms:{...t},vertexShader:kl[e],fragmentShader:Nl(e)?Al[e]:Tl,defines:{...Ml[e],PREPASS:1,...n?{MIRROR_CLIP:1}:{}},vertexColors:!0,side:Pl(e),colorWrite:!1});return Nl(e)&&(r.alphaToCoverage=!0),Fl(r)}function Rl(e,t,n,r){return Fl(new o({glslVersion:K,uniforms:{...t,...r},vertexShader:kl[e],fragmentShader:n,defines:{...Ml[e]},vertexColors:!0,side:Pl(e),depthTest:!1,depthWrite:!1}))}function zl(e,t){return Fl(new o({uniforms:{...t},vertexShader:kl[e],fragmentShader:Nl(e)?Ol:El,defines:{...Ml[e],SHADOW_PASS:1},vertexColors:!0,side:2,colorWrite:!1}))}var Bl=`
attribute vec4 aPaint;
uniform mat3 uFieldsMap;
varying vec3 vRestPos;
varying vec3 vNormal;
varying vec4 vPaint;
// The rest of the painting's inputs, unused here.
varying vec3 vWorldPos;
varying vec3 vColor;
varying float vViewDepth;
void main() {
  vRestPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vPaint = aPaint;
  vWorldPos = vRestPos; vColor = vec3(0.0); vViewDepth = 0.0;
  gl_Position = vec4((uFieldsMap * vec3(vRestPos.xz, 1.0)).xy * 2.0 - 1.0, 0.0, 1.0);
}
`,Vl=`
${pl}
${ml}
void main() {
  vec3 n = normalize(vNormal);
  // A steep face lies over the ground beside it when drawn flat: left out (it's painted live).
  if (abs(n.y) < FIELDS_STEEP) discard;
  gColor = brushFields(vRestPos, n) * 0.5 + 0.5;
  gAux = vec4(0.0);
}
`;function Hl(e,t){return new o({glslVersion:K,uniforms:{...e,uFieldsMap:{value:t}},vertexShader:Bl,fragmentShader:Vl,side:2,depthTest:!1,depthWrite:!1})}var Ul=`
uniform mat3 uFieldsUnmap;
varying vec3 vRestPos;
// The rest of the painting's inputs, unused here.
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vColor;
varying vec4 vPaint;
varying float vViewDepth;
void main() {
  vec2 xz = (uFieldsUnmap * vec3(position.xy * 0.5 + 0.5, 1.0)).xy;
  vRestPos = vec3(xz.x, 0.0, xz.y);
  vWorldPos = vRestPos; vNormal = vec3(0.0, 1.0, 0.0); vColor = vec3(0.0); vPaint = vec4(0.0); vViewDepth = 0.0;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,Wl=`
${pl}
uniform float uBakeScale;
uniform float uBakeLayer;
void main() {
  // As paintDabs and paintStrokes work them out at the layer's angle. Stored as 0.5 + 0.45 value: dabs reach a little
  // past 1.
  float angle = uBakeLayer * 0.5235988;
  vec2 p = vRestPos.xz;
  float s = uBakeScale;
  gColor = vec4(dabLayer(p, s, angle), strokes(p * s * 0.6, angle), strokes(p * s * 1.3, angle), driftField(vRestPos)) * 0.45 + 0.5;
  gAux = vec4(0.0);
}
`;function Gl(e,t,n,r){return new o({glslVersion:K,uniforms:{...e,uFieldsUnmap:{value:t},uBakeScale:{value:n},uBakeLayer:{value:r}},vertexShader:Ul,fragmentShader:Wl,side:2,depthTest:!1,depthWrite:!1})}var Kl={perSecond:2,minGap:.6,perTen:2},ql=.2,Jl=.25,Yl=.05,Xl=.06,Zl=.03,Ql=.4,$l=.25,eu=.15,tu=.35,nu={peak:1,rise:0,hold:.05,fall:.25},ru={peak:1,rise:.4,hold:0,fall:.8},iu={peak:1,rise:.3,hold:0,fall:.7},au={peak:1,rise:.2,hold:.1,fall:.8},ou={jag:.62,most:2.6,width:21,branches:3},su={full:[Jl,.75],gentle:[.03,.03],off:[.03,.03]},cu={color:[1,.48,.14],time:7,radius:2.3,burn:.75,brush:.5},lu=4,uu=4,du={full:.35,gentle:.6,off:.6},fu=90,pu=65,mu=17,hu=3,gu={full:1,gentle:.12,off:.12},_u=[{at:0,shape:{peak:1,rise:0,hold:.06,fall:.16}},{at:.09,shape:{peak:.6,rise:0,hold:.02,fall:.14}}],vu={peak:1,rise:.06,hold:.05,fall:.45},yu=.3,bu=.56;function xu(e){let t=e|0;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}var Su=class{rises=[];admit(e){this.rises=this.rises.filter(t=>e-t<=10);let t=this.rises.filter(t=>e-t<=1).length,n=this.rises[this.rises.length-1];return t>=Kl.perSecond||this.rises.length>=Kl.perTen||n!==void 0&&e-n<Kl.minGap?!1:(this.rises.push(e),!0)}};function Cu(e,t){return t<0?0:t<e.rise?e.peak*t/e.rise:t<e.rise+e.hold?e.peak:e.peak*Math.max(0,1-(t-e.rise-e.hold)/e.fall)**1.5}var wu=e=>e.rise+e.hold+e.fall,Tu=class{setting=`full`;clock=()=>performance.now()/1e3;governor=new Su;flash=null;farSwell=null;bolts=Array(lu).fill(null);nextBolt=0;glows=Array(uu).fill(null);nextGlow=0;lastBolt=-1/0;lastGlow=-1/0;seed=1;level=0;boltLight=new w(0,1,0);aiming=!1;farDir=new _(1,0);strikePoint=new w;center=new w;active=!1;boltsLive=!1;post={uFlashOn:{value:0},uFlashW:{value:0},uFlashAimed:{value:0},uFlashTint:{value:0},uFlashFar:{value:new w},uFarCenter:{value:new w},uGlows:{value:Array.from({length:uu},()=>new J)},uGlowN:{value:0},uGlowColor:{value:new J},uGlowShape:{value:new J},uGlowCap:{value:new _}};boltScene=new L;boltMesh;boltMaterial;geo;boltU={tAux:{value:null},uRes:{value:new _(1,1)},uBoltGlow:{value:Array(lu).fill(0)},uBoltCap:{value:1},uBoltPx:{value:1},uHaze:{value:new W}};constructor(){this.geo=new We;for(let[e,t]of[[`position`,3],[`aPrev`,3],[`aNext`,3],[`aInfo`,4]]){let n=new U(new Float32Array(928*t),t);n.setUsage(a),this.geo.setAttribute(e,n)}let e=[];for(let t=0;t<lu;t++){let n=t*232,r=t=>{for(let r=0;r<t-1;r++){let t=n+r*2;e.push(t,t+1,t+2,t+2,t+1,t+3)}n+=t*2};r(pu);for(let e=0;e<hu;e++)r(mu)}this.geo.setIndex(e),this.geo.boundingSphere=new l(new w,1/0),this.boltMaterial=new o({vertexShader:Du,fragmentShader:Ou,uniforms:this.boltU,transparent:!0,depthTest:!1,depthWrite:!1,side:2,blending:5,blendSrc:201,blendDst:205,blendSrcAlpha:200,blendDstAlpha:201}),this.boltMesh=new ut(this.geo,this.boltMaterial),this.boltMesh.frustumCulled=!1,this.boltScene.add(this.boltMesh)}strike(e,t,n,r){let i=this.clock(),a=G.clamp(e.strength??1,0,1),o=e.y??t(e.x,e.z),s=e.seed??(this.seed=this.seed*48271%2147483647);if(i-this.lastBolt>=du[this.setting]){this.lastBolt=i;let t=this.nextBolt;this.nextBolt=(t+1)%lu,this.bolts[t]={start:i,strength:a,soft:this.setting!==`full`},this.buildBolt(t,e.x,o,e.z,s,ou,r)}if(i-this.lastGlow>=du[this.setting]){this.lastGlow=i;let t=this.nextGlow;this.nextGlow=(t+1)%uu,this.glows[t]={x:e.x,y:o,z:e.z,start:i,strength:a}}if(this.setting===`off`)return;let c=a*(1-.6*G.smoothstep(Math.hypot(e.x-n.x,e.z-n.z),30,200));this.setting===`full`?this.governor.admit(i)&&(this.flash={start:i,shape:nu,weight:ql*c,strike:!0},this.strikePoint.set(e.x,o,e.z)):(!this.flash||i-this.flash.start>=wu(this.flash.shape))&&(this.flash={start:i,shape:ru,weight:Yl*c,strike:!1})}flicker(e={}){if(this.setting===`off`)return;let t=this.clock();if(this.farSwell&&t-this.farSwell.start<wu(this.farSwell.shape))return;let n=e.bearing??(this.seed=this.seed*48271%2147483647)/2147483647*Math.PI*2;this.farDir.set(Math.cos(n),Math.sin(n));let r=this.setting===`gentle`,i=G.clamp(e.strength??1,0,1);this.farSwell={start:t,shape:r?iu:au,weight:(r?Zl:Xl)*i,strike:!1}}update(e,t,n,r,i,a){let o=this.clock(),s=this.post;this.center.copy(e),this.setting===`off`&&(this.flash=this.farSwell=null);let c=e=>e&&o-e.start<wu(e.shape)?Cu(e.shape,o-e.start):0,l=c(this.flash),u=c(this.farSwell),d=this.farSwell;l<=0&&this.flash&&o-this.flash.start>=wu(this.flash.shape)&&(this.flash=null),u<=0&&d&&o-d.start>=wu(d.shape)&&(this.farSwell=null),this.level=this.flash?.strike?l:0;let f=this.flash?.strike??!1;s.uFlashW.value=l*(this.flash?.weight??0),s.uFlashTint.value=l*(f?Ql:$l),s.uFlashFar.value.set(this.farDir.x,this.farDir.y,u*(d?.weight??0)),s.uFarCenter.value.set(this.center.x,this.center.z,n);let p=!1;if(this.bolts.forEach((e,t)=>{let n=e===null?-1:o-e.start;if(e===null||n>(e.soft?bu:yu)){this.boltU.uBoltGlow.value[t]=0,this.bolts[t]=null;return}p=!0;let r=0;if(e.soft)r=Cu(vu,n);else for(let e of _u)r=Math.max(r,Cu(e.shape,n-e.at));this.boltU.uBoltGlow.value[t]=r*e.strength}),this.boltsLive=p,this.boltMesh.visible=p,p){let e=this.boltU;e.uRes.value.set(r,i),e.tAux.value=a,e.uBoltCap.value=gu[this.setting],e.uBoltPx.value=ou.width*Math.sqrt(t/44)*(i/1080)}let m=cu,h=0;for(let e of this.glows){if(!e)continue;let t=(o-e.start)/m.time;t>=1||(s.uGlows.value[h].set(e.x,e.y,e.z,e.strength*(1-t)**2*Math.min(1,(o-e.start)/.12)),h++)}s.uGlowN.value=h;let g=.2126*m.color[0]+.7152*m.color[1]+.0722*m.color[2];s.uGlowColor.value.set(m.color[0]/g,m.color[1]/g,m.color[2]/g,m.burn),s.uGlowShape.value.set(m.radius,0,m.brush,0),s.uGlowCap.value.set(su[this.setting][0],su[this.setting][1]),this.active=l>0||u>0||p||h>0,s.uFlashOn.value=+!!this.active}light(e){if(this.aiming=this.level>eu&&e.uOvercast.value.y>=tu&&e.uCloudOvercast.value.y>=tu,this.post.uFlashAimed.value=+!!this.aiming,!this.aiming)return;let t=Math.hypot(this.strikePoint.x-this.center.x,this.strikePoint.z-this.center.z),n=Math.max(t,18),r=t>1?(this.strikePoint.x-this.center.x)/t:.7,i=t>1?(this.strikePoint.z-this.center.z)/t:.7;this.boltLight.set(r*n,34,i*n).normalize(),e.uOvercast.value.y=1,e.uCloudOvercast.value.y=1}draw(e,t,n){this.boltsLive&&(this.boltU.uHaze.value.copy(n),e.render(this.boltScene,t))}buildBolt(e,t,n,r,i,a,o){let s=xu(i),c=this.geo.getAttribute(`position`),l=this.geo.getAttribute(`aPrev`),u=this.geo.getAttribute(`aNext`),d=this.geo.getAttribute(`aInfo`),f=e*232,p=(t,n,r,i)=>{t.forEach((a,o)=>{let s=t[Math.max(0,o-1)],p=t[Math.min(t.length-1,o+1)];for(let m=0;m<2;m++)c.setXYZ(f,a.x,a.y,a.z),l.setXYZ(f,s.x,s.y,s.z),u.setXYZ(f,p.x,p.y,p.z),d.setXYZW(f,m===0?-1:1,G.lerp(r,i,o/(t.length-1)),e,n),f++})},m=new w(t+(s()-.5)*24,n+fu,r+(s()-.5)*24),h=Eu(new w(t,n,r),m,pu,a.jag,a.most,o,s);p(h,1,0,1);for(let e=0;e<hu;e++){if(e>=a.branches){p(Array(mu).fill(h[0]),0,0,0);continue}let t=6+Math.floor(s()*16),r=h[t],i=s()<.5?-1:1,c=(1.5+s()*3.5)*i,l=o;p(Eu(r,new w(r.x+Math.cos(l)*c,Math.max(n+.4,r.y-1-s()*3),r.z-Math.sin(l)*c),mu,a.jag*.8,a.most*.4,o,s),.55,t/64,(t+18)/64)}for(let e of[c,l,u,d])e.needsUpdate=!0}precompile(e,t){e.compile(this.boltScene,t)}};function Eu(e,t,n,r,i,a,o){let s=e.distanceTo(t),c=[e.clone()],l=0,u=1,d=a+(o()-.5)*.6;for(let f=1;f<n;f++){let p=f===n-1?1:(f/(n-1))**1.6,m=Math.min((p-l)*s*r,i)*(.5+o());l=p,o()<.3&&(d=a+(o()-.5)*.9),u=-u*(o()<.86?1:-1);let h=e.clone().lerp(t,p);f<n-1&&(h.x+=Math.cos(d)*m*u,h.z-=Math.sin(d)*m*u),c.push(h)}return c}var Du=`
attribute vec3 aPrev;
attribute vec3 aNext;
attribute vec4 aInfo; // across (-1, 1), along (0 the ground .. 1 the top), the bolt, its width
uniform vec2 uRes;
uniform float uBoltGlow[${lu}];
uniform float uBoltPx;
varying vec3 vStroke; // across (-1, 1), along, its depth from the camera (m)
varying float vGlow;
void main() {
  vGlow = uBoltGlow[int(aInfo.z + 0.5)];
  mat4 pv = projectionMatrix * viewMatrix;
  vec4 c = pv * vec4(position, 1.0);
  if (vGlow <= 0.0 || aInfo.w <= 0.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); vStroke = vec3(0.0); return; }
  vec4 a = pv * vec4(aPrev, 1.0), b = pv * vec4(aNext, 1.0);
  vec2 d = (b.xy / b.w - a.xy / a.w) * uRes;
  d = length(d) > 1e-4 ? normalize(d) : vec2(0.0, 1.0);
  vec2 n = vec2(-d.y, d.x);
  // Thinner towards its top, the wide glow fades with it.
  float wide = uBoltPx * aInfo.w * mix(1.0, 0.35, aInfo.y);
  c.xy += n * aInfo.x * wide / uRes * 2.0 * c.w;
  gl_Position = c;
  vStroke = vec3(aInfo.x, aInfo.y, -(viewMatrix * vec4(position, 1.0)).z);
}`,Ou=`
uniform sampler2D tAux;
uniform vec2 uRes;
uniform vec3 uHaze;
uniform float uBoltCap;
varying vec3 vStroke;
varying float vGlow;
vec3 srgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  // Hidden behind what stands nearer the camera, softly.
  float sd = texture2D(tAux, uv).z;
  float seen = sd <= 0.0 ? 1.0 : smoothstep(vStroke.z - 2.0, vStroke.z - 0.3, sd);
  // Into the haze at the top of the screen, and high up.
  float top = 1.0 - smoothstep(0.62, 1.0, uv.y);
  float high = 1.0 - smoothstep(0.6, 1.0, vStroke.y);
  float fade = top * high;
  float x = abs(vStroke.x);
  float g = clamp(vGlow, 0.0, 2.0);
  // A hot wire: a white core, a soft blue halo.
  float core = 1.0 - smoothstep(0.08, 0.18, x), halo = exp(-x * x * 7.0);
  vec3 col = srgb(vec3(0.42, 0.55, 1.0)) * halo * 0.7 + vec3(1.0) * core;
  float a = core * 0.9;
  // As it dies away, everywhere.
  float v = min(g, 1.0) * uBoltCap;
  // Toned down, it's only ever a mix towards a colour no brighter than white.
  if (uBoltCap < 1.0) col /= max(1.0, max(col.r, max(col.g, col.b)));
  col *= v; a *= v;
  if (uBoltCap < 1.0) a = max(a, max(col.r, max(col.g, col.b)));
  // Fading into the haze: towards its colour, then gone.
  col = mix(srgb(uHaze) * length(col) * 0.6, col, fade);
  float keep = seen * fade;
  gl_FragColor = vec4(col * keep, a * keep);
}`,ku=`
uniform float uFlashOn;
uniform float uFlashW;
uniform float uFlashAimed;
uniform float uFlashTint;
uniform vec3 uFlashFar;
uniform vec3 uFarCenter;
uniform vec4 uGlows[${uu}];   // x, y, z, how strong
uniform int uGlowN;
uniform vec4 uGlowColor;   // its colour (of brightness 1), how burnt
uniform vec4 uGlowShape;   // radius (m), -, brush
uniform vec2 uGlowCap;     // the most it lifts a pixel, the most it darkens one
uniform sampler2D uShadowMap;
uniform mat4 uShadowMatrix;
uniform vec2 uShadowTexel;
uniform vec2 uShadowArea;
${Ho}
float boltSees(vec3 p) {
  vec4 s = uShadowMatrix * vec4(p + vec3(0.0, 0.08 + shadowSlack(vec3(0.0, 1.0, 0.0)), 0.0), 1.0);
  vec3 uvz = s.xyz / s.w;
  if (uvz.x < 0.0 || uvz.x > 1.0 || uvz.y < 0.0 || uvz.y > 1.0 || uvz.z > 1.0) return 1.0;
  float seen = 0.0;
  for (int i = 0; i < 4; i++) {
    float a = float(i) * 1.5708 + 0.6;
    seen += uvz.z - 0.003 > shadowDepthAt(uvz.xy + vec2(cos(a), sin(a)) * uShadowTexel * 1.2) ? 0.0 : 1.0;
  }
  return seen / 4.0;
}
vec3 lightningFinal(vec3 o, vec3 p, bool sky) {
  const vec3 COLD = vec3(0.8, 0.88, 1.0), LUMA = vec3(0.2126, 0.7152, 0.0722);
  float glows = sky ? 0.0 : float(uGlowN);
  if (uFlashW <= 0.0 && uFlashFar.z <= 0.0 && glows <= 0.0) return o;
  o = clamp(o, 0.0, 1.0);
  // sRGB to light and back, near enough (within a percent or so) at a fraction of the cost: this is every pixel of the screen.
  vec3 c = o * (o * (o * 0.305306011 + 0.682171111) + 0.012522878);
  float w = uFlashW;
  // Lit from the bolt: what it can't see keeps less of the flash.
  if (w > 0.0 && !sky && uFlashAimed > 0.5) w *= mix(0.3, 1.0, boltSees(p));
  float far = uFlashFar.z;
  if (far > 0.0 && !sky) {
    // From the edge of the screen the storm's beyond, fading across to nothing at the other side (where on the screen: its
    // reach from the middle, about -1 to 1 across).
    vec2 q = (p.xz - uFarCenter.xy) / uFarCenter.z;
    far *= smoothstep(-0.9, 1.0, dot(q, uFlashFar.xy));
  }
  float lift = max(w, far), touched = lift;
  if (lift > 0.0) {
    float l = dot(c, LUMA);
    // Towards a cold colour of the same brightness, then lifted, the dark less. Mostly by raising what's there, so the
    // colours keep and it reads as light; only some of it a white wash, which on its own looks like fog.
    c = mix(c, vec3(l) * COLD / dot(COLD, LUMA), uFlashTint);
    float raise = lift * mix(0.45, 1.0, sqrt(l));
    c = mix(c * min((l + raise) / max(l, 1e-3), 5.0), c + COLD * raise, 0.3);
  }
  if (uGlowN > 0 && !sky) {
    float glow = 0.0, burn = 0.0;
    for (int i = 0; i < uGlowN; i++) {
      vec4 g = uGlows[i];
      float r = length(p.xz - g.xz) / uGlowShape.x;
      if (r > 3.5) continue;
      float h = max(0.0, p.y - g.y - 0.6), n = fogNoise(p.xz * 1.6 + g.xz);
      float body = exp(-r * r * (1.0 + 0.7 * uGlowShape.z * n));
      float level = g.w * (1.0 - smoothstep(0.0, 2.2, h));
      // The strongest, not the sum: strikes on one spot can't add up past the limit.
      glow = max(glow, level * body);
      burn = max(burn, uGlowColor.w * level * smoothstep(1.3, 0.2, r));
    }
    touched += glow + burn;
    c *= 1.0 - min(burn, uGlowCap.y);
    c += uGlowColor.rgb * min(glow, 1.0) * max(uGlowCap.x - lift, 0.0);
  }
  // Left exactly as it was unless something lit it.
  if (touched <= 0.0) return o;
  vec3 a = sqrt(min(c, vec3(1.0))), b = sqrt(a);
  return 0.585122381 * a + 0.783140355 * b - 0.368262736 * sqrt(b);
}
`,Au={density:1.5,flake:[6,.7,.9],smear:.03,rim:.9,sway:[.4,.3],speed:[.9,1.3]},ju=4,Mu=.06,Nu=.75,Pu=1.2,Fu=20,Iu=.4,Lu=[7,20],Ru=.35,zu=2.5,Bu=24,Vu=1.35,Hu=4096,Uu={middle:.3,far:.85,sheets:.55},Wu=new W().setRGB(.88,.92,.98),Gu=`
${zo}
${Lo}
${Ro}
${Bo}
${Wo}
${gs}
${Ts}
${Bs}
attribute vec3 aCorner;   // x across (-1, 1), y along the flake's smear (0 its tail, 1 its head)
uniform vec2 uScreen;
uniform vec4 uSnowCells;  // the air's cells drawn: x, y the first, z how many across, w how many in all
uniform vec4 uSnow;       // x the flakes a cell shown (by rank), y how far the snow has fallen (m), z a flake's cycle (m), w how fast it falls (m/s)
uniform vec4 uSnowAir;    // x, y how far the air has carried the flakes (m, wrapped), z, w how far a flake drifts a metre of fall
uniform vec4 uSnowFlake;  // its size (px), softness, opacity, smear (s)
uniform vec4 uSnowMove;   // its sway (m), how often (a second), its rim
uniform vec2 uSnowWind;   // the wind as a whole (m/s): a gust surges a flake on by as much more as it blows there
uniform float uSnowSmearMost; // the longest a smear is drawn (px)
uniform float uSnowGround; // the land's height at the view's target (m): the land in view is within LAND_BELOW and LAND_ABOVE of it
uniform vec3 uSnowGap[4];
uniform vec3 uSnowCloud[4];
varying vec4 vShape;      // px across, px along from the tail, its smear's length (px), 0
varying vec4 vAxes;       // its direction on the screen and across it
varying vec2 vRadii;      // its half width across and along (px)
varying vec4 vColor;      // its colour, and how opaque
varying vec3 vShade;      // its lower side's colour
const float CELL = ${8 .toFixed(1)};
const float COLUMN = ${16 .toFixed(1)};
const float RANK_FADE = ${Ls};
const float PERIOD = ${Hu.toFixed(1)};
// Starting high over the land, a flake fades in over its first few metres, and out over its last few centimetres.
const float FADE_IN = 2.5, FADE_OUT = 0.35;

void main() {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  vShape = vec4(0.0); vAxes = vec4(0.0); vRadii = vec2(1.0); vColor = vec4(0.0); vShade = vec3(0.0);
  // Which flake: its cell of the air and its place among the cell's (its rank: the first ones show in the lightest snow),
  // and its own random numbers, all from those (the cell's key repeating every PERIOD cells, as the air's drift does).
  int cells = int(uSnowCells.w), across_ = int(uSnowCells.z);
  int index = gl_InstanceID % cells, slot = gl_InstanceID / cells;
  vec2 cell = uSnowCells.xy + vec2(float(index % across_), float(index / across_));
  vec2 seed = mod(cell, PERIOD) + float(slot) * vec2(61.7, -37.3);
  vec4 rnd = vec4(hash12(seed), hash12(seed + 19.19), hash12(seed + 47.7), hash12(seed + 83.3));
  float show = clamp((uSnow.x - float(slot) - rnd.x * (1.0 - RANK_FADE)) / RANK_FADE, 0.0, 1.0);
  if (show <= 0.0) return;
  // How high it is over where it will land: falling from its column's top each cycle, somewhere new in its cell each time.
  float u = uSnow.y / uSnow.z + rnd.y * 37.0;
  float round_ = mod(floor(u), 4096.0);
  float column = COLUMN * (0.85 + 0.3 * fract(rnd.y * 5.13));
  float h = column - fract(u) * uSnow.z;
  if (h < 0.0) return;
  vec2 xz = (cell + hash22(vec2(rnd.z * 4093.0 + round_ * 1.618, rnd.w * 3967.0 + round_ * 0.7071))) * CELL + uSnowAir.xy;
  // Its sway, on its own beat (a loop, a little slower one way than the other), and the gusts' surge.
  float beat = uSnowMove.y * 6.2832 * (0.7 + 0.6 * fract(rnd.w * 7.7)), phase = rnd.z * 6.2832;
  vec2 swayed = uSnowMove.x * vec2(sin(uTime * beat + phase), sin(uTime * beat * 0.77 + phase * 1.3));
  vec2 swaying = uSnowMove.x * beat * vec2(cos(uTime * beat + phase), 0.77 * cos(uTime * beat * 0.77 + phase * 1.3));
  xz += swayed;
  // Off the screen, before anything is looked up (most of the cells drawn are: the air over the land in view reaches far
  // past the screen's edges). Across, a point's place on the screen doesn't hang on its height; up and down, the land under
  // it is within LAND_BELOW and LAND_ABOVE of the target's. With room for the surge, the smear and the flake.
  vec2 half_ = uScreen * 0.5;
  float pxPerMetre = projectionMatrix[0][0] * half_.x, zc;
  vec2 low = screenOf(vec3(xz.x, uSnowGround - ${8 .toFixed(1)} + h, xz.y), zc);
  vec2 high = screenOf(vec3(xz.x, uSnowGround + ${8 .toFixed(1)} + h, xz.y), zc);
  vec2 room = 1.0 + ((${zu.toFixed(1)} + 2.0) * pxPerMetre + uSnowFlake.x) / half_;
  if (abs(low.x) > room.x || low.y > room.y || high.y < -room.y) return;
  vec2 surge = uSnowWind * (min(windGustHere(xz), 3.0) - 1.0) * ${Ru.toFixed(2)};
  surge *= min(1.0, ${zu.toFixed(1)} / max(length(surge), 1e-4));
  xz += surge;
  // Where it lands: down its slanted path, on the land or the water there.
  vec2 slant = uSnowAir.zw;
  vec2 g = xz + slant * h;
  float land = landTop(vec3(g.x, 0.0, g.y));
  if (land < -1e3) return;
  vec3 sheet = waterSheet(g);
  float base = sheet.z > -${(wo*.5).toFixed(3)} && sheet.x > land ? sheet.x : land;
  float top = base + column;
  vec3 p = vec3(xz.x, base + h, xz.y);
  // Off the screen: nothing more to do.
  float z;
  vec2 head = screenOf(p, z);
  vec2 sideways = slant * uSnow.w + swaying;
  vec3 vel = vec3(sideways.x, -uSnow.w, sideways.y);
  float reach = uSnowFlake.x + length(vel) * uSnowFlake.w * pxPerMetre * 2.0 + 2.0;
  if (any(greaterThan(abs(head), 1.0 + reach / half_))) return;
  // Stopped on the way: by a roof, or (some of the time) by a crown, lost among its leaves. Only the path it has come down
  // need be traced (and the little under it that it fades over): from the column's top to just under where it is now,
  // about half its whole path on average. At most TRACE_MOST reads of each map.
  float stop = base, below = p.y - FADE_OUT;
  vec2 at = xz + slant * FADE_OUT;
  float roof = coverAlong(uShelterFull, at, slant, below, top, ${Bu.toFixed(1)});
  stop = max(stop, roof);
  if (rnd.w < ${ws.toFixed(2)}) {
    float crown = coverAlong(uShelterPartial, at, slant, below, top, ${Bu.toFixed(1)});
    if (crown > stop) stop = max(crown - fract(rnd.z * 7.31) * 2.0, stop);
  }
  if (p.y <= stop) return;
  float alpha = show * smoothstep(0.0, FADE_OUT, p.y - stop) * smoothstep(column, column - FADE_IN, h);

  // Its smear: from where it was a moment ago to where it is, on the screen.
  float zt;
  vec2 sb = head * half_, sa = screenOf(p - vel * uSnowFlake.w, zt) * half_;
  vec2 d = sb - sa;
  float len = length(d);
  vec2 dir = len > 1e-3 ? d / len : vec2(0.0, -1.0), across = vec2(-dir.y, dir.x);
  // Each a little bigger or smaller than the next.
  float r = 0.5 * uSnowFlake.x * (0.7 + 0.6 * fract(rnd.w * 11.3));
  // A fast flake (a blizzard's, close up) stretches only so far: a long dash reads as rain.
  len = min(len, uSnowSmearMost);
  sa = sb - dir * len;
  float ra = r, rb = r;
  float pad = max(ra, rb) + 1.0;
  float t = aCorner.y;
  vec2 sp = mix(sa, sb, t) + dir * (t * 2.0 - 1.0) * pad + across * aCorner.x * pad;
  gl_Position = vec4(sp / half_, z, 1.0);
  vShape = vec4(aCorner.x * pad, t * len + (t * 2.0 - 1.0) * pad, len, 0.0);
  vAxes = vec4(dir, across);
  vRadii = vec2(ra, rb);
  // A longer smear spreads the same flake thinner, part way (a fast blizzard's streaks still read).
  alpha *= mix(1.0, (2.0 * r) / (len + 2.0 * r), 0.5) * uSnowFlake.z * (0.75 + 0.25 * fract(rnd.z * 17.9));
  // Lit as the lying snow is (its paint, snow.ts), in the light where it is, a little brighter than its lit band (a flake
  // in the air catches the light from all round): so it reads as a bright fleck over the white land as well as the dark.
  // A flake big enough to show its form has its lower side in the shade's blue.
  cloudAt(p);
  vec3 lit = mix(uSnowGap[2], uSnowCloud[2], gCloud), half2 = mix(uSnowGap[1], uSnowCloud[1], gCloud);
  vec3 shade = mix(uSnowGap[0], uSnowCloud[0], gCloud);
  vColor = vec4(exposeHere(lit * ${Vu.toFixed(2)}), alpha);
  vShade = exposeHere(mix(shade, half2, 0.35));
}
`,Ku=`
precision highp float;
uniform vec4 uSnowFlake;
uniform vec4 uSnowMove;
varying vec4 vShape;
varying vec4 vAxes;
varying vec2 vRadii;
varying vec4 vColor;
varying vec3 vShade;
layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gAux;
void main() {
  float len = vShape.z, along = clamp(vShape.y, 0.0, len);
  vec2 q = vec2(vShape.x, vShape.y - along);
  // How far out from its middle line it is, as a share of its radius (its across and along radii differ as it turns).
  float ra = max(vRadii.x, 0.5), rb = max(vRadii.y, 0.5);
  float k = length(vec2(q.x / ra, q.y / rb));
  // From a crisp edge (a pixel's blur) to a soft fall-off.
  float rpx = min(ra, rb);
  float crisp = clamp((1.0 - k) * rpx + 0.5, 0.0, 1.0);
  float a = mix(crisp, exp(-k * k * 2.2), uSnowFlake.y);
  // Smaller than a pixel: as big as a pixel, fainter.
  a *= min(1.0, min(vRadii.x, vRadii.y) / 0.6) * vColor.a;
  if (a < 0.004) discard;
  // Its lower side on the screen in the snow's shade.
  vec2 off = vAxes.zw * q.x + vAxes.xy * q.y;
  // Only a flake big enough to show its form, and only its round end, not a streak's length.
  float rim = smoothstep(-0.45, 0.55, -off.y / max(ra, rb)) * uSnowMove.z * smoothstep(2.0, 5.0, max(ra, rb))
    * (2.0 * rb) / (len + 2.0 * rb);
  vec3 c = mix(vColor.rgb, vShade, rim);
  gColor = vec4(c * a, a);
  // The aux as it was: no lines on the snow, and the fog and haze by what's behind it.
  gAux = vec4(0.0);
}
`,qu=`
uniform vec4 uSnowVeil;      // x how thick the whiteout is (0..1), y how far its sheets have blown (cells), z the middle's most, w the distance's
uniform vec4 uSnowVeilFrame; // x, y the wind's heading; z how strong the wisps over the lying snow, w how far they've blown (cells)
uniform vec3 uSnowVeilColor;
// How far past the camera's target the whiteout is thickest (m), and how far nearer it starts.
const float SNOW_FAR = 45.0, SNOW_NEAR = 12.0;
float snowVeil(vec3 p, float depth) {
  if (uSnowVeil.x <= 0.0) return 0.0;
  float far = smoothstep(-SNOW_NEAR, SNOW_FAR, depth - uTargetDepth);
  // Big soft sheets of blowing snow, carried downwind, thicker in the gusts (the game's, from its wind map): the farm
  // nearly vanishes as a gust's sheet sweeps through, and comes back after.
  vec2 h = uSnowVeilFrame.xy, q = vec2(dot(p.xz, h), dot(p.xz, vec2(-h.y, h.x)));
  float n = fogNoise(vec2(q.x / 30.0 - uSnowVeil.y, q.y / 16.0)) * 0.6 + fogNoise(vec2(q.x / 10.0 - uSnowVeil.y * 2.4, q.y / 7.0) + 7.0) * 0.4;
  float gust = clamp(windGustHere(p.xz), 0.0, 2.5) - 1.0;
  float sheets = clamp(0.75 + ${Uu.sheets.toFixed(2)} * n + gust * 0.7, 0.15, 1.5);
  float most = mix(uSnowVeil.z, uSnowVeil.w, far);
  return min(uSnowVeil.x * mix(uSnowVeil.z * 0.6, uSnowVeil.w, far) * sheets, most * uSnowVeil.x);
}
// Low wisps of snow lifted off the lying snow and streaming downwind, in a gale: only where snow lies, and only on what's
// low over the land (the ground, the grass, a fence's foot), strongest in the gusts.
float snowDrifting(vec3 p) {
  if (uSnowVeilFrame.z <= 0.0) return 0.0;
  float lying = groundState(p.xz).x;
  if (lying < 0.02) return 0.0;
  float low = 1.0 - smoothstep(0.3, 1.2, p.y - landTop(p));
  if (low <= 0.0) return 0.0;
  // None under a roof (the porch's floor, under the panels), less under a crown, as the lying snow (groundAt): the ground's
  // shelter from the hollows map (one read), or off it the shelter map's.
  float cover = hollowAt(p.xz).z;
  lying *= 1.0 - (cover < 0.0 ? shelter(p) : cover);
  if (lying < 0.02) return 0.0;
  vec2 h = uSnowVeilFrame.xy, q = vec2(dot(p.xz, h), dot(p.xz, vec2(-h.y, h.x)));
  vec2 s = vec2(q.x / 6.0 - uSnowVeilFrame.w, q.y / 0.8);
  float n = fogNoise(s * 0.5 + 3.0) * 0.65 + fogNoise(s * vec2(1.3, 1.9) + 9.0) * 0.35;
  float wisp = smoothstep(0.0, 0.55, n) * clamp(0.3 + 0.7 * windGustHere(p.xz), 0.0, 1.6);
  return uSnowVeilFrame.z * min(lying * 4.0, 1.0) * low * min(wisp, 1.0) * 0.55;
}
`;function Ju(){let e=new T;return e.setAttribute(`aCorner`,new U(new Float32Array([-1,0,0,1,0,0,-1,1,0,1,1,0]),3)),e.setAttribute(`position`,new U(new Float32Array(12),3)),e.setIndex([0,1,2,2,1,3]),e.instanceCount=0,e.boundingBox=new q,e.boundingSphere=new l(new w,1/0),e}function Yu(e,t){return Math.min(1,e*1.25)*G.smoothstep(t,Lu[0],Lu[1])}var Xu=class{uniforms={uSnowCells:{value:new J(0,0,1,1)},uSnow:{value:new J(0,0,1,1)},uSnowAir:{value:new J},uSnowFlake:{value:new J},uSnowMove:{value:new J},uSnowWind:{value:new _},uSnowSmearMost:{value:Fu},uSnowGround:{value:0}};veil={uSnowVeil:{value:new J},uSnowVeilFrame:{value:new J(1,0,0,0)},uSnowVeilColor:{value:new W}};mesh;fallen=0;air=new _;sheets=0;wisps=0;last=NaN;box=new q;constructor(e,t){let n=new o({glslVersion:K,uniforms:{...e,...t,...this.uniforms},vertexShader:Gu,fragmentShader:Ku,transparent:!0,depthWrite:!1,side:2,blending:5,blendSrc:201,blendDst:205,blendSrcAlpha:201,blendDstAlpha:205});this.mesh=new ut(Ju(),n),this.mesh.frustumCulled=!1,this.mesh.userData.kind=`snow`,this.mesh.userData.reflect=!1,this.mesh.userData.under=!1}update(e,t,n,r,i,a,o,s,c,l){let u=Au,d=a?G.clamp(t,0,1):0,f=s.length(),p=Yu(d,f),m=G.lerp(u.speed[0],u.speed[1],d)+Mu*f*p,h=Math.min(ju,f*G.lerp(Iu,1,p)/m),g=f>.001?s.x/f*h:0,_=f>.001?s.y/f*h:0,v=e-this.last,y=Hu*8;if(!(v>=0))this.fallen=m*e,this.air.set(g*m*e,_*m*e);else{let e=v<=1?v:.1;this.fallen+=m*e,this.air.x+=g*m*e,this.air.y+=_*m*e}this.air.set((this.air.x%y+y)%y,(this.air.y%y+y)%y),this.last=e;let b=Is+1,x=u.density*d**.7*(1+Nu*p)*Math.min((n/44)**2,4)*i*8*8,S=Js(c,l,this.box),C=zu+u.sway[0]+1,w=Math.floor((S.min.x-C-this.air.x)/8),T=Math.floor((S.min.z-C-this.air.y)/8),E=Math.floor((S.max.x+C-this.air.x)/8)-w+1,D=E*(Math.floor((S.max.z+C-this.air.y)/8)-T+1),O=Math.min(Math.ceil(x),Math.floor(Fs/D)),k=this.uniforms;k.uSnowCells.value.set(w,T,E,D),k.uSnow.value.set(x,this.fallen%(b*4096),b,m),k.uSnowAir.value.set(this.air.x,this.air.y,g,_),k.uSnowFlake.value.set(u.flake[0]*Math.sqrt(n/44)*r,u.flake[1],u.flake[2],u.smear*(1+Pu*p)),k.uSnowMove.value.set(u.sway[0],u.sway[1],u.rim,0),k.uSnowWind.value.copy(s),k.uSnowGround.value=l,k.uSnowSmearMost.value=Fu*r;let A=this.mesh.geometry;A.instanceCount=D*O,this.mesh.visible=O>0;let j=v>=0?v<=1?v:.1:0;this.sheets=(this.sheets+f*j/30)%80,this.wisps=(this.wisps+f*1.4*j/6)%320;let M=this.veil,N=Math.max(p,.25*d**1.5);M.uSnowVeil.value.set(N,this.sheets,Uu.middle,Uu.far);let P=f>.001?s.x/f:1,F=f>.001?s.y/f:0;M.uSnowVeilFrame.value.set(P,F,o&&a?G.smoothstep(f,10,22):0,this.wisps)}setVeilColor(e){e(this.veil.uSnowVeilColor.value,Wu)}},Zu={color:16773312,width:2,glow:0,fill:.5},Qu=`
uniform sampler2D uMarksAux;
uniform vec4 uMarkTint;
uniform float uMarkHi;
varying float vViewDepth;
layout(location = 0) out vec4 gMark;
void main() {
  // Where something nearer shows, the thing doesn't: no mark (the depth is the G-buffer's, resolved and half-float, so
  // allow for its rounding).
  float shown = texelFetch(uMarksAux, ivec2(gl_FragCoord.xy), 0).z;
  if (shown > 0.0 && vViewDepth > shown + 0.15 + shown * 0.004) discard;
  // The tint's colour, and in alpha its strength (0..127) plus 128 if highlighted.
  gMark = vec4(uMarkTint.rgb, (floor(uMarkTint.a * 127.0 + 0.5) + (uMarkHi > 0.5 ? 128.0 : 0.0)) / 255.0);
}
`,$u=`
uniform sampler2D tMarks;
uniform float uMarksOn;
uniform vec4 uHighlight;
uniform vec2 uHighlightStyle;
float markHi(vec4 m) { return step(127.5, floor(m.a * 255.0 + 0.5)); }
vec3 marksOver(vec3 o, vec2 uv) {
  vec4 m = texture2D(tMarks, uv);
  float a = floor(m.a * 255.0 + 0.5), hi = step(127.5, a);
  o = mix(o, m.rgb, mod(a, 128.0) / 127.0);
  // The highlight round what shows of the thing: looked for its width out in twelve directions, the outline. A halo
  // (glow) takes that faintly and looks nearer too, a third and two thirds of the way out, taking those more, so it fades.
  float glow = uHighlightStyle.x, near = 0.0;
  vec2 px = uHighlight.w / uResolution;
  for (int i = 0; i < 12; i++) {
    float t = float(i) * 0.5235988;
    near = max(near, mix(1.0, 0.15, glow) * markHi(texture2D(tMarks, uv + vec2(cos(t), sin(t)) * px)));
  }
  if (glow > 0.0) {
    for (int k = 1; k <= 2; k++) {
      float r = float(k) / 3.0;
      for (int i = 0; i < 8; i++) {
        float t = (float(i) + float(k) * 0.5) * 0.7853982;
        near = max(near, glow * (1.15 - r) * markHi(texture2D(tMarks, uv + vec2(cos(t), sin(t)) * px * r)));
      }
    }
  }
  o = mix(o, uHighlight.rgb, clamp(near, 0.0, 1.0) * (1.0 - hi) * 0.95);
  // The thing itself a little brighter.
  o = mix(o, o * 1.1 + 0.03, hi * uHighlightStyle.y);
  return o;
}
`;function ed(){return{tMarks:{value:null},uMarksOn:{value:0},uHighlight:{value:new J(1,1,1,2)},uHighlightStyle:{value:new _(0,.5)}}}var td=class{post=ed();target=new ee(1,1,{type:E,format:j,depthBuffer:!1,minFilter:Je,magFilter:Je,generateMipmaps:!1});marked=new Map;scene=new L;aux={value:null};look=Zu;shared;constructor(e){this.shared=e,this.post.tMarks.value=this.target.texture,this.setLook(Zu,1)}set(e,t){let n=this.marked.get(e);if(!t||!t.highlight&&!(t.tint&&t.tint.strength>0)){n&&(this.drop(n),this.marked.delete(e));return}let r=e.userData.kind;if(r===`foliage`||r===`debris`||r===`smoke`||r===`water`)return;if(n){n.mark=t,this.style(n);return}let i={mesh:e,mark:t,twin:null},a=new ut(e.geometry,Rl(r,this.shared,Qu,{uMarksAux:this.aux,uMarkTint:{value:new J},uMarkHi:{value:0}}));a.matrixAutoUpdate=!1,a.matrixWorldAutoUpdate=!1,a.frustumCulled=!1,i.twin=a,this.scene.add(a),this.style(i),this.marked.set(e,i)}forget(e){let t=this.marked.get(e);t&&(this.drop(t),this.marked.delete(e))}get any(){return this.marked.size>0}setLook(t,n){this.look=t;let r=new W().setHex(t.color,e);this.post.uHighlight.value.set(r.r,r.g,r.b,t.width*n),this.post.uHighlightStyle.value.set(G.clamp(t.glow,0,1),G.clamp(t.fill,0,1))}setSize(e,t,n){this.target.setSize(e,t),this.setLook(this.look,n)}draw(e,t,n){let r=0;for(let e of this.marked.values()){let t=e.twin;t.visible=e.mesh.visible&&e.mesh.parent!==null,t.matrixWorld.copy(e.mesh.matrixWorld),t.visible&&r++}this.post.uMarksOn.value=+(r>0),r&&(this.aux.value=n,e.setRenderTarget(this.target),e.setClearColor(0,0),e.clear(!0,!1,!1),e.render(this.scene,t))}style(t){let n=t.twin.material.uniforms,r=t.mark.tint,i=new W;r&&i.setHex(r.color,e),n.uMarkTint.value.set(i.r,i.g,i.b,r?G.clamp(r.strength,0,1):0),n.uMarkHi.value=+!!t.mark.highlight}drop(e){e.twin&&(this.scene.remove(e.twin),e.twin.material.dispose())}},nd=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,rd=`
precision highp float;
uniform sampler2D tColor;
uniform sampler2D tAux;
uniform vec2 uResolution;
uniform float uLineWidth;
uniform float uLines;
uniform float uTargetDepth;
uniform vec3 uHazeColor;
uniform float uHazeDensity;
uniform float uHazeMax;
uniform float uHazeFloor;
uniform vec3 uSkyTop;
uniform vec3 uSkyBottom;
uniform float uExposure;
uniform float uSaturation;
uniform float uNightShift;
uniform float uShadeHue;
uniform float uGrain;
uniform float uVignette;    // how dark the corners go (a storm closes them in, storm.ts)
// Where a pixel is in the world: the camera's position, its right and up scaled to half the view, and its forward (the
// camera is orthographic, so every pixel looks the same way and its depth is a distance along it).
uniform vec3 uCamPos;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamFwd;
// The fog (#9): its colour as lit; x how thick, y its base, z its top, w how far under its top it thins (metres). Its
// patches lie in a frame laid along the wind (WindState.haze): x, y its heading, z how far they're drawn out along it, w
// how far they've drifted; and a second frame fading in after the wind turns (uFogNext, uFogFade: how far it's in), so a
// turn never swings them. uFogStreak: how far dust's streaks have blown along each.
uniform sampler2D tFogNoise;
uniform vec3 uFogColor;
uniform vec4 uFog;
uniform vec4 uFogFrame;
uniform vec4 uFogNext;
uniform float uFogFade;
uniform vec2 uFogStreak;
// Dust (#9): x how far the haze is dust, y how strong its streaks are, z how much the gusts thicken and thin it.
uniform vec3 uDust;
// The wind as a whole (the gusts are in its map: see WIND_GLSL).
uniform float uWindSpeed;
uniform vec2 uWindDir;
// Fresh dust (#36, dust.ts): its field at the wind's last two ticks (the optical depth, the ground's height, the dust's
// top), the frame's share of the way between them, where it lies (its corner, 1 over its size), whether there's any, and
// its colour as lit.
uniform sampler2D tDustA;
uniform sampler2D tDustB;
uniform float uDustBlend;
uniform vec4 uDustGrid;
uniform float uDustOn;
uniform vec3 uDustColor;
uniform float uDustReach;
// The heat's shimmer (#9): x how far it shifts the picture (pixels), y the time (seconds).
uniform vec2 uShimmer;
varying vec2 vUv;
${Lo}
${Ro}
${gs}
${$u}

const float FAR = 1e4;
float depthOf(vec4 a) { return a.z <= 0.0 ? FAR : a.z; }

// The fog gathers over FOG_SOFT_BASE metres above its base, if it has one, and thins to nothing at its top over uFog.w
// metres: most of its depth, so a shallow mist lies thickest along the water and in the hollows, and a deep fog veils all
// the land while roofs and crowns rise out of it. Its thickness is per depth of the layer, so a shallow mist and a deep fog
// of the same amount hide the bottom of the layer alike.
const float FOG_SOFT_BASE = 1.0;
const float FOG_NOISE_CELLS = ${16 .toFixed(1)};
const float FOG_DENSITY = 2.5;
// The most it hides: the farm still shows through the thickest.
const float FOG_MAX = 0.85;

// The baked noise (fog.ts) at a point in noise cells: about -1..1.
float fogNoise(vec2 p) { return texture2D(tFogNoise, p / FOG_NOISE_CELLS).r * 2.0 - 1.0; }
${Ws}
${ic}
${lc}
${Ts}
${qu}

// How thick the fog is at a height, 0..1.
float fogProfile(float y) {
  return clamp((uFog.z - y) / uFog.w, 0.0, 1.0) * clamp((y - uFog.y) / FOG_SOFT_BASE, 0.0, 1.0);
}

// Patches, keyed to the world and drifting with the wind, stretched along it: a thick fog covers everything, a thin one
// breaks up, and the low parts of the layer keep it longest. Two sizes, drifting at different speeds, so the patches
// change shape as they go rather than sliding as one sheet.
float fogPatchIn(vec4 f, vec2 xz) {
  vec2 q = vec2(dot(xz, f.xy) / f.z - f.w, dot(xz, vec2(-f.y, f.x)));
  return fogNoise(q * 0.055) * 0.65 + fogNoise(q * 0.14 + vec2(f.w * 0.035, 0.0) + 11.0) * 0.35;
}
float fogPatch(vec2 xz, float y) {
  float n = fogPatchIn(uFogFrame, xz);
  if (uFogFade > 0.0) n = mix(n, fogPatchIn(uFogNext, xz), smoothstep(0.0, 1.0, uFogFade));
  float bias = (uFog.x - 0.35) * 2.5 + fogProfile(y) * 0.5 - 0.25;
  return smoothstep(-0.5, 0.5, n + bias);
}

// Dust, how much thicker (or thinner, below 1) it is at a point: the gusts sweep it in in waves, thinning between them, and fine streaks blow along the wind through it, quicker than its clouds,
// strongest in a gust. It thickens the dust rather than moving where its patches start, so it shows in a storm's thick
// dust too. Read once, at the surface: the few metres the view crosses in the layer wouldn't show, and reading it at every
// step cost most of what dust adds.
// The gusts are the game's (windGust, from its map): the same that bow the grass, crest for crest.
float fogStreakIn(vec4 f, float drift, vec2 xz) {
  vec2 s = vec2(dot(xz, f.xy) / ${6 .toFixed(1)} - drift, dot(xz, vec2(-f.y, f.x)));
  return fogNoise(s * 0.6 + 5.0);
}
float fogDust(vec2 xz) {
  if (uDust.x <= 0.0) return 1.0;
  float gust = windGust(xz);
  float n = fogStreakIn(uFogFrame, uFogStreak.x, xz);
  if (uFogFade > 0.0) n = mix(n, fogStreakIn(uFogNext, uFogStreak.y, xz), smoothstep(0.0, 1.0, uFogFade));
  float streak = n * uDust.y * (0.3 + 1.4 * gust);
  return max(1.0 + uDust.x * (streak + (gust - 0.5) * uDust.z), 0.1);
}

// The share of a surface the fog hides: summed along the view's path up out of the layer from the surface, in a few
// steps, so a patch veils what's under it and things rising out of the fog clear it.
float fogAt(vec3 p) {
  float ya = max(p.y, uFog.y), yb = uFog.z;
  if (yb <= ya) return 0.0;
  vec3 back = -uCamFwd;
  float dy = (yb - ya) / 4.0, sum = 0.0;
  for (int i = 0; i < 4; i++) {
    float y = ya + (float(i) + 0.5) * dy;
    vec3 q = p + back * ((y - p.y) / back.y);
    sum += fogProfile(y) * fogPatch(q.xz, y);
  }
  return FOG_MAX * (1.0 - exp(-sum * dy / uFog.w * uFog.x * FOG_DENSITY * fogDust(p.xz)));
}

// Fresh dust: how much of a surface it hides. Summed along the view's path up out of the dust from the surface, in a few
// steps (up to the look's top and half a metre over), each reading the field where the path is then: a puff is a column
// over the ground, thick up to its top and thinning over the top half metre, so it veils what's behind and below it and
// has depth as the view looks through it.
const float DUST_MAX = 0.8;
vec3 dustField(vec2 xz) {
  vec2 uv = (xz - uDustGrid.xy) * uDustGrid.zw;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec3(0.0);
  return mix(texture2D(tDustA, uv).xyz, texture2D(tDustB, uv).xyz, uDustBlend);
}
float freshDust(vec3 p) {
  if (uDustOn <= 0.0) return 0.0;
  vec3 back = -uCamFwd;
  const int STEPS = 5;
  float dy = uDustReach / float(STEPS), sum = 0.0;
  for (int i = 0; i < STEPS; i++) {
    float y = p.y + (float(i) + 0.5) * dy;
    vec3 f = dustField((p + back * ((y - p.y) / back.y)).xz);
    float depth = max(f.z - f.y, 0.1);
    sum += f.x / depth * clamp((f.z - y) / 0.5 + 0.5, 0.0, 1.0) * step(f.y - 0.3, y);
  }
  return DUST_MAX * (1.0 - exp(-sum * dy / back.y));
}

// Laid over a colour: a veil of its colour, with a trace of the paint's own colour given back over it at the veil's
// lightness. The developer's pick (#9, 'tint'): the fog drains colour, as fog does, but the land under it isn't flat
// grey. A plain veil drained it all; giving back more (0.3, 0.6) read less like fog.
const float FOG_KEEP = 0.15;
vec3 fogOver(vec3 c, float f) {
  if (f <= 0.0) return c;
  vec3 v = mix(c, uFogColor, f);
  vec3 lab = linToOklab(v);
  lab.yz += linToOklab(c).yz * FOG_KEEP * f;
  return oklabToLinFit(lab);
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

// Where a pixel is in the world, from its place on the screen and its depth.
${ku}
${il}
vec3 worldAt(vec2 uv, float d) {
  vec2 ndc = uv * 2.0 - 1.0;
  return uCamPos + uCamRight * ndc.x + uCamUp * ndc.y + uCamFwd * d;
}

void main() {
  vec2 uv = vUv;
  vec4 aux = texture2D(tAux, uv);
  // Heat shimmer: the picture wavers sideways a fraction of a pixel, in thin bands keyed to the world that rise and drift
  // (the hot air over the land), so it stays with the land as the camera moves.
  if (uShimmer.x > 0.0 && aux.z > 0.0) {
    vec3 p = worldAt(uv, aux.z);
    vec2 q = vec2(dot(p.xz, normalize(uCamRight.xz)) * 0.8, p.y * 4.0 + dot(p.xz, normalize(uCamUp.xz)) * 2.0 - uShimmer.y * 1.6);
    uv.x += fogNoise(q + uShimmer.y * vec2(0.15, 0.0)) * uShimmer.x / uResolution.x;
    aux = texture2D(tAux, uv);
  }
  vec4 painted = texture2D(tColor, uv);
  vec3 c = painted.rgb;
  float d = depthOf(aux);
  bool sky = d >= FAR;

  if (sky) {
    // Under any rain drawn over it (see rain.ts: premultiplied, over nothing).
    c = mix(uSkyBottom, uSkyTop, smoothstep(0.2, 1.0, vUv.y)) * (1.0 - painted.a) + painted.rgb;
  }

  // Ink: a line on an inked surface where it ends against something farther (its silhouette) or folds sharply (a crease).
  // Lines are drawn only on the inked side, in a darker, richer shade of the surface's own colour, never black.
  float edge = 0.0;
  if (uLines > 0.5 && aux.w > 0.02) {
    vec2 px = uLineWidth / uResolution;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.785398;
      vec2 o = vec2(cos(a), sin(a)) * px;
      vec4 b = texture2D(tAux, uv + o);
      float dd = depthOf(b) - d;
      float sil = smoothstep(0.06, 0.16, dd);
      float crease = b.w * smoothstep(0.3, 0.55, length(aux.xy - b.xy));
      edge = max(edge, max(sil, crease * 0.85));
    }
    edge *= aux.w;
  }

  // Pools of lamplight at night (#205, nightLights.ts): on the surface, under the fog and the haze.
  if (!sky && uPoolN > 0) c = nightPools(c, worldAt(uv, d));

  // Fog or dust: lying on the land, over the surface and under the distance's haze.
  float fog = 0.0;
  if (!sky && uFog.x > 0.0) {
    fog = fogAt(worldAt(uv, d));
    c = fogOver(c, fog);
  }

  // Fresh dust, lifted by the gusts: over the fog, a veil of the earth's colour.
  if (!sky && uDustOn > 0.0) c = mix(c, uDustColor, freshDust(worldAt(uv, d)));

  // Snow blowing low over the lying snow in a gale (#14): wisps of the whiteout's colour over the land.
  if (!sky && uSnowVeilFrame.z > 0.0) c = mix(c, uSnowVeilColor, snowDrifting(worldAt(uv, d)));

  // Haze: the hour's air over everything, thickening with distance past the camera's target.
  if (!sky) {
    float far = max(d - uTargetDepth, 0.0);
    float haze = max((1.0 - exp(-far * uHazeDensity)) * uHazeMax, uHazeFloor);
    c = mix(c, uHazeColor, haze);
  }

  // The veil of rain over the distance (#11), over the haze: rain between the eye and the far land.
  c = mix(c, uRainVeilColor, rainVeil(uv * 2.0 - 1.0, d));
  // The blizzard's whiteout (#14), over it all but the sky: the air between the eye and the land white with snow.
  float white = sky ? 0.0 : snowVeil(worldAt(uv, d), d);
  c = mix(c, uSnowVeilColor, white);

  // In fog, lines fade halfway with what they draw. The developer's pick (#9, 'soft'): fading all the way looked more like
  // a painting, but the things the player can use got lost in the fog.
  edge *= 1.0 - fog / FOG_MAX * 0.5;
  // And halfway into the whiteout, as into fog (#14).
  edge *= 1.0 - white / ${Uu.far.toFixed(2)} * 0.5;
  if (edge > 0.0) {
    vec3 lab = linToOklab(c);
    vec3 ink = hueToward(lchShift(lab, -0.45 * lab.x, 1.25, 0.0), uShadeHue, 0.25);
    c = mix(c, oklabToLinFit(ink), edge * 0.9);
  }

  // Grade: exposure, a soft shoulder instead of a hard clip, richer chroma.
  c *= uExposure;
  c = c / (1.0 + max(c - 0.8, 0.0) * 0.9);
  vec3 lab = linToOklab(c);
  lab.yz *= uSaturation;
  // At night, from yellow-green towards blue (the 'blue' night).
  lab.yz += vec2(0.005, -0.035) * uNightShift;
  c = oklabToLinFit(lab);

  vec3 o = toSrgb(c);
  // The game's marks on its things (#206, marks.ts): tints and highlights, over the graded picture.
  if (uMarksOn > 0.5) o = marksOver(o, vUv);
  // A faint canvas tooth, and a gentle vignette.
  o += (hash12(gl_FragCoord.xy) - 0.5) * uGrain;
  vec2 v = vUv - 0.5;
  o *= 1.0 - dot(v, v) * uVignette;
  // Lightning (#12), laid over the finished picture: the flash, the far lightning, the glow where it struck.
  if (uFlashOn > 0.5) o = lightningFinal(o, sky ? vec3(0.0) : worldAt(uv, d), sky);
  gl_FragColor = vec4(o, 1.0);
}
`,id=13620952,ad={clear:{cloud:0},scattered:{cloud:.3},overcast:{cloud:1},"soft-rain":{cloud:.7,rain:.35},storm:{cloud:1,rain:.9,storm:1},mist:{cloud:.2,haze:{amount:.4,color:id,top:.6}},fog:{cloud:.6,haze:{amount:.6,color:id,top:4}},"low-cloud":{cloud:1,haze:{amount:.7,color:id,top:9,base:4.5}},dust:{cloud:.4,heat:.5,haze:{amount:.7,color:12884578,top:6,kind:`dust`}},"heat-wave":{cloud:0,heat:1},snow:{cloud:.9,snow:.5},blizzard:{cloud:1,snow:1}},od=1.5,sd=class{goal={cloud:0,sunUnder:0,storm:0,rain:0,snow:0,heat:0,haze:0,hazeColor:new W(id),hazeTop:4,dust:0,hazeBase:null};cloud=0;clouds={cover:0,x:0,z:0,seed:0};drift={x:0,z:0,vx:0,vz:0,since:null};overcast=0;sunUnder=0;storm=0;rain=0;snow=0;heat=0;haze=0;hazeColor=new W(id);hazeTop=4;hazeBase=-50;dust=0;ground=-50;time=null;setGround(e){this.ground=e,this.hazeBase=Math.max(this.hazeBase,Math.min(e,this.goal.hazeTop))}baseGoal(){return Math.min(this.goal.hazeBase??this.ground,this.goal.hazeTop)}set(e,t=!1){let n=this.goal,r=(e=0)=>G.clamp(e,0,1);if(n.cloud=r(e.cloud),n.sunUnder=r(e.sunUnder),n.storm=r(e.storm),n.rain=r(e.rain),n.snow=r(e.snow),n.heat=r(e.heat),n.haze=r(e.haze?.amount),e.haze&&(n.hazeColor.setHex(e.haze.color),n.hazeTop=e.haze.top,n.hazeBase=e.haze.base??null,n.dust=+(e.haze.kind===`dust`),this.haze<.01&&(this.hazeColor.copy(n.hazeColor),this.hazeTop=n.hazeTop,this.hazeBase=this.baseGoal(),this.dust=n.dust)),this.cloud=this.clouds.cover=n.cloud,e.drift){let t=this.drift;t.x=e.drift.x,t.z=e.drift.z,t.vx=e.drift.vx??0,t.vz=e.drift.vz??0,t.since=null,this.clouds.x=t.x,this.clouds.z=t.z}e.cloudSeed!==void 0&&(this.clouds.seed=e.cloudSeed),t&&this.snap()}snap(){let e=this.goal;this.cloud=this.overcast=e.cloud,this.sunUnder=e.sunUnder,this.storm=e.storm,this.rain=e.rain,this.snow=e.snow,this.heat=e.heat,this.haze=e.haze,this.hazeColor.copy(e.hazeColor),this.hazeTop=e.hazeTop,this.hazeBase=this.baseGoal(),this.dust=e.dust}update(e){let t=this.drift;(t.since===null||e<t.since)&&(t.since=e);let n=Math.max(0,e-t.since);this.clouds.x=t.x+t.vx*n,this.clouds.z=t.z+t.vz*n;let r=this.time===null?0:e-this.time;if(this.time=e,r<=0)return;let i=this.goal,a=1-Math.exp(-r/od);this.overcast+=(i.cloud-this.overcast)*a,this.sunUnder+=(i.sunUnder-this.sunUnder)*a,this.storm+=(i.storm-this.storm)*a,this.rain+=(i.rain-this.rain)*a,this.snow+=(i.snow-this.snow)*a,this.heat+=(i.heat-this.heat)*a,this.haze+=(i.haze-this.haze)*a,this.hazeColor.lerp(i.hazeColor,a),this.hazeTop+=(i.hazeTop-this.hazeTop)*a,this.hazeBase+=(this.baseGoal()-this.hazeBase)*a,this.dust+=(i.dust-this.dust)*a}},cd={sun:16766094,sunTurn:.7,sunGain:1.1,skyTurn:.35,haze:16111776,hazeDensity:1.6,hazeFloor:.1,contrast:.92,exposure:1.05,saturation:.95,litLean:.25,shimmer:3.5},ld=(e,t,n)=>e+(t-e)*n,ud=e=>.2126*e.r+.7152*e.g+.0722*e.b,dd=e=>Math.max(e.r,e.g,e.b,.001),fd=e=>e.clone().multiplyScalar(1/dd(e)),pd=(e,t)=>e.clone().multiplyScalar(ud(t)/Math.max(ud(e),1e-4)),md=(e,t)=>t*(1-e.night)*G.smoothstep(e.sunEl,-4,12);function hd(e,t,n){let r=t.dust*Math.min(1,t.haze*1.4),i=md(e,t.heat);if(r<=0&&i<=0)return e;let a={...e};if(r>0){let n=t.hazeColor,i=fd(new W(n.r**1.6,n.g**1.6,n.b**1.6));a.sunColor=e.sunColor.clone().lerp(i.multiplyScalar(dd(e.sunColor)),.9*r).multiplyScalar(1-.3*r),a.skyColor=e.skyColor.clone().lerp(fd(n).multiplyScalar(dd(e.skyColor)),.6*r),a.rimColor=e.rimColor.clone().multiplyScalar(1-.5*r),a.hazeColor=e.hazeColor.clone().lerp(pd(n,e.hazeColor),r),a.hazeDensity=e.hazeDensity*(1+2*r),a.hazeFloor=e.hazeFloor+.15*r,a.exposure=e.exposure*(1-.15*r)}if(i>0){let t=new W(n.sun),r=new W(n.haze);a.sunColor=a.sunColor.clone().lerp(fd(t).multiplyScalar(dd(a.sunColor)),n.sunTurn*i).multiplyScalar(ld(1,n.sunGain,i)),a.skyColor=a.skyColor.clone().lerp(pd(fd(t),a.skyColor),n.skyTurn*i),a.hazeColor=a.hazeColor.clone().lerp(pd(r,a.hazeColor).lerp(r,.5),i),a.hazeDensity*=ld(1,n.hazeDensity,i),a.hazeFloor=ld(a.hazeFloor,Math.max(a.hazeFloor,n.hazeFloor),i),a.shadeDepth=e.shadeDepth*ld(1,n.contrast,i),a.litLean=ld(e.litLean,Math.max(e.litLean,n.litLean),i),a.exposure*=ld(1,n.exposure,i),a.saturation=e.saturation*ld(1,n.saturation,i)}return a}var gd=.35,_d={exposure:.64,nightExposure:.76,light:8165060,lightTurn:.6,shadeHue:250,shadeTurn:.6,lean:.18,depth:1.3,litHue:215,litLean:.22,saturation:1.16,air:5202832,airTurn:.7,airLight:.65,airDensity:1.7,airFloor:.03,deck:.45,vignette:.62,rim:.3},vd=(e,t,n)=>e+(t-e)*n,yd=(e,t,n)=>e+((t-e+540)%360-180)*n,bd=e=>.2126*e.r+.7152*e.g+.0722*e.b,xd=e=>Math.max(e.r,e.g,e.b,.001),Sd=e=>e.clone().multiplyScalar(1/xd(e)),Cd=(e,t,n)=>e.clone().lerp(Sd(t).multiplyScalar(xd(e)),n);function wd(e,t,n=_d){if(t<=0)return e;let r=t,i=e.night,a=new W(n.light),o=new W(n.air),s=Sd(o).multiplyScalar(bd(e.hazeColor)*n.airLight/Math.max(bd(Sd(o)),1e-4)),c=e=>Cd(e,a,n.lightTurn*r).multiplyScalar(vd(1,n.deck,r));return{...e,sunColor:Cd(e.sunColor,a,n.lightTurn*r),skyColor:Cd(e.skyColor,a,n.lightTurn*r),rimColor:e.rimColor.clone().multiplyScalar(vd(1,n.rim,r)),hazeColor:e.hazeColor.clone().lerp(s,n.airTurn*r),skyTop:c(e.skyTop),skyBottom:c(e.skyBottom),shadeHue:yd(e.shadeHue,n.shadeHue,n.shadeTurn*r),shadeLean:e.shadeLean+n.lean*r,shadeDepth:e.shadeDepth*vd(1,n.depth,r),litHue:n.litLean>0?yd(e.litHue,n.litHue,r):e.litHue,litLean:e.litLean+n.litLean*r,hazeDensity:e.hazeDensity*vd(1,n.airDensity,r),hazeFloor:e.hazeFloor+n.airFloor*r,exposure:e.exposure*vd(1,vd(n.exposure,n.nightExposure,i),r),saturation:e.saturation*vd(1,n.saturation,r)}}var Td=e=>G.smoothstep(e,0,.3),Ed=new W(16757856),Dd=18,Od=.7;function kd(e,t,n=_d){if(t<=0)return e;let r=Td(t)*G.smoothstep(e.dayEl,14,30),i=wd(e,t,n);return{...e,sunEl:vd(e.sunEl,Math.min(e.sunEl,Dd),r),sunColor:Cd(e.sunColor,Ed,.85*r),rimColor:Cd(e.rimColor,Ed,r),litHue:yd(e.litHue,62,r),litLean:vd(e.litLean,Math.max(e.litLean,.22),r),shadeHue:i.shadeHue,shadeLean:i.shadeLean,shadeDepth:i.shadeDepth,hazeColor:i.hazeColor,hazeDensity:i.hazeDensity,hazeFloor:i.hazeFloor,exposure:e.exposure*vd(1,Od,t),saturation:i.saturation}}var Ad={sun:1,exposure:.6,sky:.45,shadowFade:.35,shadowSun:.85,shadowBlur:1.5,rim:1.2,warmth:1.4,depth:.95,air:.3},jd=(e,t,n)=>e+(t-e)*n,Md=(e,t,n)=>e+((t-e+540)%360-180)*n,Nd=G.smoothstep;function Pd(e,t,n,r=0){let i=1-Nd(t.night,0,.15),a=Nd(t.dayEl,-2,3),o=1-Nd(t.dayEl,14,26);return e*i*a*(r>0?jd(o,1,Td(r)):o)*Nd(n,.6,1)}function Fd(e,t,n){return n<=0?e:{...e,sky:jd(e.sky,t.sky,n),shadowFade:jd(e.shadowFade,t.shadowFade,n),shadowLift:e.shadowLift*(1-t.shadowSun*n),shadowBlur:jd(e.shadowBlur,t.shadowBlur,n)}}function Id(e,t,n,r){if(r<=0)return e;let i=n.air*r;return{...e,sunEl:jd(e.sunEl,t.sunEl,r),sunColor:e.sunColor.clone().lerp(t.sunColor,n.sun*r),rimColor:e.rimColor.clone().lerp(t.rimColor.clone().multiplyScalar(n.rim),r),shadeDepth:jd(e.shadeDepth,t.shadeDepth*n.depth,r),litHue:Md(e.litHue,t.litHue,r),litLean:jd(e.litLean,t.litLean*n.warmth,r),hazeColor:e.hazeColor.clone().lerp(t.hazeColor,i),exposure:jd(e.exposure,t.exposure,n.exposure*r),saturation:jd(e.saturation,t.saturation,i)}}var Ld={cypress:1,broadleaf:.55,fruit:.5,round:.5,bush:.35},Rd={cypress:{hz:.6,damping:.12,drag:.008},broadleaf:{hz:.45,damping:.18,drag:.012},fruit:{hz:.7,damping:.18,drag:.012},round:{hz:.8,damping:.16,drag:.012},bush:{hz:1.5,damping:.25,drag:.015}};function zd(e){return .36*(1-Math.exp(-(e*e)/676))}var Bd=.3,Vd=.7,Hd=1/60,Ud=.25,Wd=256;function Gd(e,t){let n=Math.floor(e),r=e-n,i=r*r*(3-2*r),a=e=>{let n=Math.imul(e^t,739982445)^695872825;return n=Math.imul(n^n>>>15,2246822507),n^=n>>>13,(n>>>0)/4294967296*2-1};return a(n)+(a(n+1)-a(n))*i}var Kd=class e{texture=e.makeTexture(1);trees=[];ids=new Map;state=new Float32Array;seeds=new Int32Array;holds=[];free=[];fresh=[];time=null;placed=0;static makeTexture(e){let t=new gt(new Float32Array(Wd*e*4),Wd,e,j,Ve);return t.needsUpdate=!0,t}get count(){return this.trees.length-this.free.length}add(t){let n=new Set,r=t.map(e=>{let t=`${e.x} ${e.z} ${e.kind}`,r=this.ids.get(t);if(r===void 0){let n=this.free.pop();n===void 0?(r=this.trees.length,this.trees.push(e),this.holds.push(0)):(r=n,this.trees[r]=e,this.fresh.push(r),this.seeds[r]=Math.imul(Math.round(e.x*97),2654435761)^Math.round(e.z*131)),this.ids.set(t,r)}else(this.trees[r].height!==e.height||this.trees[r].scale!==e.scale)&&(this.trees[r]=e);return n.has(r)||(n.add(r),this.holds[r]++),r}),i=this.trees.length;if(i>this.seeds.length){let t=new Float32Array(i*4);t.set(this.state),this.state=t,this.seeds=Int32Array.from(this.trees,e=>Math.imul(Math.round(e.x*97),2654435761)^Math.round(e.z*131));let n=Math.ceil(i/Wd);if(n!==this.texture.image.height){let t=this.texture.image.data;this.texture.dispose(),this.texture=e.makeTexture(n),this.texture.image.data.set(t)}}return r}release(e){for(let t of e){if(!(this.holds[t]>0)||--this.holds[t]>0)continue;let e=this.trees[t];this.ids.delete(`${e.x} ${e.z} ${e.kind}`),this.free.push(t)}}at(e,t){let n=[];for(let r=0;r<this.trees.length;r++){let i=this.trees[r];this.holds[r]>0&&Math.abs(i.x-e)<1e-4&&Math.abs(i.z-t)<1e-4&&n.push(r)}return n}target(e,t,n,r,i){let a=this.trees[e],o=this.seeds[e],[s,c]=_t(n[0],n[1],n[2],a.x,a.z,6),l=s/cs,u=c/cs,d=Math.hypot(l,u);if(d<1e-4)return i[0]=i[1]=0,d;let f=l/d,p=u/d,m=Bd*r,h=e=>.75*Gd(t/Vd,o+e)+.5*Gd(t/(2.7*Vd),o+e+7),g=zd(d*Math.max(0,1+m*h(0)))*a.height,_=zd(d)*a.height*m*.6*h(3);return i[0]=f*g-p*_,i[1]=p*g+f*_,d}restart(){this.time=null}update(e,t,n){let r=this.trees.length;if(!r||!t)return;let i=this.time===null?-1:e-this.time;this.time=e;let a=this.state,o=[0,0],s=r=>{this.target(r,e,t,n,o),a.set([o[0],o[1],0,0],r*4)},c=this.fresh.length>0;if(i<0||i>1)for(let e=0;e<r;e++)s(e);else{for(let e=this.placed;e<r;e++)s(e);for(let e of this.fresh)s(e);for(let r=0;r<this.placed&&i>0;r++){if(!(this.holds[r]>0))continue;let s=this.trees[r],c=Rd[s.kind],l=2*Math.PI*c.hz/Math.sqrt(s.scale),u=Math.ceil(i/Math.min(Hd,Ud/l)),d=i/u;for(let s=1;s<=u;s++){let u=this.target(r,e-i+s*d,t,n,o),f=2*Math.min(1,c.damping+c.drag*u)*l,p=a[r*4+2],m=a[r*4+3];p+=(l*l*(o[0]-a[r*4])-f*p)*d,m+=(l*l*(o[1]-a[r*4+1])-f*m)*d,a[r*4]+=p*d,a[r*4+1]+=m*d,a[r*4+2]=p,a[r*4+3]=m}}if(i===0&&this.placed===r&&!c)return}this.placed=r,this.fresh=[];let l=this.texture.image.data;for(let e=0;e<r;e++)l[e*4]=a[e*4],l[e*4+1]=a[e*4+1];this.texture.needsUpdate=!0}},qd=class{filled=0;x0=0;y0=0;x1=-1;y1=-1;grid=new Uint8Array(2304);sums=new Int32Array(2401);positions=new Float32Array(41472);attribute=new U(this.positions,3).setUsage(a);geometry=new We;scene=new L;constructor(){this.geometry.setAttribute(`position`,this.attribute);let e=new o({vertexShader:`void main() { gl_Position = vec4(position.xy, 1.0, 1.0); }`,fragmentShader:`void main() { gl_FragColor = vec4(0.0); }`,colorWrite:!1,depthFunc:1,depthWrite:!0}),t=new ut(this.geometry,e);t.frustumCulled=!1,this.scene.add(t),this.scene.matrixWorldAutoUpdate=!1}get full(){return this.filled===2304}build(e,t,n,r,i=null,a=0,o=0){let s=e=>Math.min(1-a,Math.max(-1+a,e)),c=e=>Math.min(1-o,Math.max(-1+o,e)),l=this.grid;l.fill(0);for(let a=0;a<e.length;a+=6){let o=(e[a+1]+e[a+4])/2,l=(e[a]+e[a+3])/2,u=i===null?o:2*i-o,d=(e[a+2]+e[a+5])/2,f=(e[a+3]-e[a])/2,p=(e[a+4]-e[a+1])/2,m=(e[a+5]-e[a+2])/2,h=t[0]*l+t[4]*u+t[8]*d+t[12],g=t[1]*l+t[5]*u+t[9]*d+t[13],_=Math.abs(t[0])*f+Math.abs(t[4])*p+Math.abs(t[8])*m,v=Math.abs(t[1])*f+Math.abs(t[5])*p+Math.abs(t[9])*m,y=_+n,b=v+r;if(i===null){this.markRect(h-y,g-b,h+y,g+b);continue}let x=h+t[4]*(o-u),S=g+t[5]*(o-u);x+_>=-1&&x-_<=1&&S+v>=-1&&S-v<=1&&this.markRect(s(h-y),c(g-b),s(h+y),c(g+b))}let u=this.sums,d=this.positions,f=0,p=0,m=48,h=48,g=-1,_=-1;for(let e=0;e<48;e++){let t=0;for(let n=0;n<48;n++)t+=l[e*48+n],u[(e+1)*49+n+1]=u[e*49+n+1]+t;for(let t=0;t<48;t++){if(!l[e*48+t])continue;let n=t;for(;t+1<48&&l[e*48+t+1];)t++;f+=t+1-n,n<m&&(m=n),t>g&&(g=t),e<h&&(h=e),_=e;let r=2*n/48-1,i=2*(t+1)/48-1,a=2*e/48-1,o=2*(e+1)/48-1;d[p++]=r,d[p++]=a,d[p++]=0,d[p++]=i,d[p++]=a,d[p++]=0,d[p++]=r,d[p++]=o,d[p++]=0,d[p++]=i,d[p++]=a,d[p++]=0,d[p++]=i,d[p++]=o,d[p++]=0,d[p++]=r,d[p++]=o,d[p++]=0}}this.filled=f,this.x0=m,this.y0=h,this.x1=g,this.y1=_,this.attribute.clearUpdateRanges(),this.attribute.addUpdateRange(0,p),this.attribute.needsUpdate=!0,this.geometry.setDrawRange(0,p/3)}markRect(e,t,n,r){let i=this.squares(e,t,n,r);if(i)for(let e=i[1];e<=i[3];e++)this.grid.fill(1,e*48+i[0],e*48+i[2]+1)}range=[0,0,0,0];squares(e,t,n,r){if(!(n>=-1&&e<=1&&r>=-1&&t<=1))return null;let i=this.range,a=e=>Math.min(47,Math.max(0,Math.floor((e+1)*48/2)));return i[0]=a(e),i[1]=a(t),i[2]=a(n),i[3]=a(r),i}touches(e,t,n,r){let i=this.squares(e,t,n,r);if(!i)return!1;let a=this.sums;return a[(i[3]+1)*49+i[2]+1]-a[i[1]*49+i[2]+1]-a[(i[3]+1)*49+i[0]]+a[i[1]*49+i[0]]>0}scissor(e,t){let n=e.width,r=e.height,i=Math.floor(this.x0*n/48),a=Math.floor(this.y0*r/48),o=Math.ceil((this.x1+1)*n/48),s=Math.ceil((this.y1+1)*r/48);return t.set(i,a,o-i,s-a)}};function Jd(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new We,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Yd(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Yd(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}return c}function Yd(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new U(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function Xd(e,t=1e-4){t=Math.max(t,2**-52);let n={},r=e.getIndex(),i=e.getAttribute(`position`),a=r?r.count:i.count,o=0,s=Object.keys(e.attributes),c={},l={},u=[],d=[`getX`,`getY`,`getZ`,`getW`],f=[`setX`,`setY`,`setZ`,`setW`];for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.attributes[n];c[n]=new r.constructor(new r.array.constructor(r.count*r.itemSize),r.itemSize,r.normalized);let i=e.morphAttributes[n];i&&(l[n]||(l[n]=[]),i.forEach((e,t)=>{let r=new e.array.constructor(e.count*e.itemSize);l[n][t]=new e.constructor(r,e.itemSize,e.normalized)}))}let p=t*.5,m=10**Math.log10(1/t),h=p*m;for(let t=0;t<a;t++){let i=r?r.getX(t):t,a=``;for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),o=r.itemSize;for(let e=0;e<o;e++)a+=`${~~(r[d[e]](i)*m+h)},`}if(a in n)u.push(n[a]);else{for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),a=e.morphAttributes[n],u=r.itemSize,p=c[n],m=l[n];for(let e=0;e<u;e++){let t=d[e],n=f[e];if(p[n](o,r[t](i)),a)for(let e=0,r=a.length;e<r;e++)m[e][n](o,a[e][t](i))}}n[a]=o,u.push(o),o++}}let g=e.clone();for(let t in e.attributes){let e=c[t];if(g.setAttribute(t,new e.constructor(e.array.slice(0,o*e.itemSize),e.itemSize,e.normalized)),t in l)for(let e=0;e<l[t].length;e++){let n=l[t][e];g.morphAttributes[t][e]=new n.constructor(n.array.slice(0,o*n.itemSize),n.itemSize,n.normalized)}}return g.setIndex(u),g}function Zd(e,t){if(t===0)return console.warn(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.`),e;if(t===2||t===1){let n=e.getIndex();if(n===null){let t=[],r=e.getAttribute(`position`);if(r!==void 0){for(let e=0;e<r.count;e++)t.push(e);e.setIndex(t),n=e.getIndex()}else return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.`),e}let r=n.count-2,i=[];if(t===2)for(let e=1;e<=r;e++)i.push(n.getX(0)),i.push(n.getX(e)),i.push(n.getX(e+1));else for(let e=0;e<r;e++)e%2==0?(i.push(n.getX(e)),i.push(n.getX(e+1)),i.push(n.getX(e+2))):(i.push(n.getX(e+2)),i.push(n.getX(e+1)),i.push(n.getX(e)));i.length/3!==r&&console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.`);let a=e.clone();return a.setIndex(i),a.clearGroups(),a}return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:`,t),e}var Qd=[0,1,0,0],$d=class{pos=[];nrm=[];col=[];paint=[];uv=[];extra=[];index=[];tree;treeId;trees=[];parts;part=0;extraName;extraSize;kind;constructor(e){this.kind=e;let t=e===`foliage`||e===`smoke`;this.extraName=t?`aCard`:e===`grass`?`aBlade`:null,this.extraSize=t||e===`grass`?4:0,this.tree=e===`paint`||e===`foliage`?[]:null,this.treeId=this.tree?[]:null,this.parts=e===`ink`||e===`paint`||e===`smoke`?[]:null}get vertexCount(){return this.pos.length/3}vertex(e,t,n,r,i=[0,0],a=[]){this.pos.push(e.x,e.y,e.z),this.nrm.push(t.x,t.y,t.z),this.col.push(n.r,n.g,n.b),this.paint.push(...r),this.uv.push(...i);for(let e=0;e<this.extraSize;e++)this.extra.push(a[e]??0);return this.tree?.push(0,0,0,0),this.treeId?.push(-1),this.parts?.push(this.part),this.vertexCount-1}markTree(e,t,n){if(!this.tree||!this.treeId)throw Error(`a ${this.kind} mesh has no trees`);let r=this.trees.push(t)-1;for(let i=e;i<this.vertexCount;i++)this.tree[i*4]=t.x,this.tree[i*4+1]=t.z,this.tree[i*4+2]=t.height,this.tree[i*4+3]=n(this.pos[i*3+1]),this.treeId[i]=r}get lastTree(){return this.trees[this.trees.length-1]}own(e,t){if(!this.treeId||e>=this.vertexCount)return;let n=this.trees.indexOf(t);n<0&&(n=this.trees.push(t)-1);for(let t=e;t<this.vertexCount;t++)this.treeId[t]<0&&(this.treeId[t]=n)}heightsSince(e){let t=[];for(let n=e;n<this.vertexCount;n++)t.push(this.pos[n*3+1]);return t}tri(e,t,n){this.index.push(e,t,n)}quad(e,t,n,r){this.index.push(e,t,n,e,n,r)}addGeometry(e,t,n,r){let i=(e.index,e),a=i.getAttribute(`position`),o=i.getAttribute(`normal`),s=i.getAttribute(`uv`),c=new B().getNormalMatrix(t),l=new w,u=new w,d=this.vertexCount;for(let e=0;e<a.count;e++)l.fromBufferAttribute(a,e).applyMatrix4(t),u.fromBufferAttribute(o,e).applyMatrix3(c).normalize(),this.vertex(l,u,n,r,s?[s.getX(e),s.getY(e)]:[0,0]);if(i.index)for(let e=0;e<i.index.count;e++)this.index.push(d+i.index.getX(e));else for(let e=0;e<a.count;e++)this.index.push(d+e)}get hasParts(){return!!this.parts?.some(e=>e>0)}build(e){let t=new We;if(t.setAttribute(`position`,new M(this.pos,3)),t.setAttribute(`normal`,new M(this.nrm,3)),t.setAttribute(`color`,new M(this.col,3)),t.setAttribute(`aPaint`,new M(this.paint,4)),t.setAttribute(`uv`,new M(this.uv,2)),this.extraName&&t.setAttribute(this.extraName,new M(this.extra,this.extraSize)),this.tree&&t.setAttribute(`aTree`,new M(this.tree,4)),this.treeId&&(t.setAttribute(`aTreeId`,new M(this.treeId,1)),t.userData.trees=this.trees),e&&this.parts&&this.hasParts){let n=new Set;t.setAttribute(`aPart`,new M(this.parts.map(t=>t?(n.add(e[t-1]),e[t-1]+1):0),1)),t.userData.parts=n}return this.vertexCount>65535?t.setIndex(new h(this.index,1)):t.setIndex(this.index),t}};function ef(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var tf=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],nf=(()=>{let e=ef(1337),t=Array.from({length:256},(e,t)=>t);for(let n=255;n>0;n--){let r=Math.floor(e()*(n+1));[t[n],t[r]]=[t[r],t[n]]}return[...t,...t]})();function rf(e,t){let n=.5*(Math.sqrt(3)-1),r=(3-Math.sqrt(3))/6,i=(e+t)*n,a=Math.floor(e+i),o=Math.floor(t+i),s=(a+o)*r,c=e-(a-s),l=t-(o-s),[u,d]=c>l?[1,0]:[0,1],f=c-u+r,p=l-d+r,m=c-1+2*r,h=l-1+2*r,g=a&255,_=o&255,v=(e,t,n)=>{let r=.5-e*e-t*t;if(r<0)return 0;let i=tf[n%8];return r*=r,r*r*(i[0]*e+i[1]*t)};return 70*(v(c,l,nf[g+nf[_]])+v(f,p,nf[g+u+nf[_+d]])+v(m,h,nf[g+1+nf[_+1]]))}var Z=e=>new W(e),af=8,of=4,sf=256,cf=[1,2,4,8],lf=.04,uf=3,df=16,ff=8,pf=1.2,mf=.3,hf=2,gf=8,_f=3,vf=[[0,-1],[1,0],[0,1],[-1,0]],yf={groundTint:1,beyond:{light:.78,chroma:.55}},bf={near:.8,far:3,wave:6,rag:.35},xf=e=>new W(e),Sf={lush:xf(5937224),dry:xf(10004050),lime:xf(10929242),emerald:xf(4229210),worn:xf(10130528),bare:xf(11045474),track:xf(12624500),rock:xf(10129796),floor:xf(4088374),bed:xf(10126944),deep:xf(6969920),lip:xf(6261306),damp:xf(5398586),shingle:xf(10524290)},Cf=[xf(10255962),xf(9204047)],wf=[xf(9340794),xf(8419950)],Tf={[Jt.silt]:{toward:xf(5521436),mix:.12,lift:-.04},[Jt.clay]:{toward:xf(10772540),mix:.22,lift:-.02},[Jt.sand]:{toward:xf(14732436),mix:.26,lift:.04},[Jt.stony]:{toward:xf(9079426),mix:.26,lift:0}},Ef={[qt.grass]:{drift:.3,brush:2,meadow:1},[qt.bare]:{drift:.45,brush:2.5,meadow:0},[qt.track]:{drift:.55,brush:2.5,meadow:0},[qt.rock]:{drift:.6,brush:2,meadow:.3},[qt.woods]:{drift:.3,brush:1.5,meadow:.4},[qt.water]:{drift:.5,brush:2,meadow:0}},Df=[.5,2.5,0,0],Of=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)};function kf(e){let t=Math.abs(e[0]-e[2]),n=Math.abs(e[1]-e[3]);return t===n?e[0]+e[2]>=e[1]+e[3]:t<n}var Af=class{width;height;tile;level;x0;z0;map;look;adder;relief;worked;cover;ground;drawnPaint;surface;shore;detail;paint;dry;wet;raw;rowDry;chunks;geometries;pieceOf;pieces=new Map;stale=new Set;fitting=null;pending=new Set;built=new Map;apronMoved=!1;change=null;given=!1;next;revision=0;ahead=!1;onSwap=null;changed=null;cols;apron=null;apronGeometry=null;beyond;apronAt;fields;low=0;high=0;constructor(e,t,n=yf){Yt(t),this.adder=e,this.look=n,this.width=t.width,this.height=t.height,this.tile=t.tile,this.level=t.level,this.x0=t.x0,this.z0=t.z0,this.map={...t.map},this.beyond=t.beyond??null;let r=this.apronLines(),i=(e,t)=>e>-1e-6&&e<t+1e-6;this.apronAt=r&&{xs:r.xs.map(e=>(e-this.x0)/this.tile).filter(e=>i(e,this.width)),ys:r.zs.map(e=>(e-this.z0)/this.tile).filter(e=>i(e,this.height))};let a=t.width*t.height;this.relief={width:t.width,height:t.height,corner:Float64Array.from(t.corners,e=>Math.round(e/t.level))},this.worked=Uint8Array.from(t.worked),this.cover=Uint8Array.from(t.cover),this.ground=Uint8Array.from(t.ground),this.next={corner:this.relief.corner.slice(),worked:this.worked.slice(),cover:this.cover.slice(),ground:this.ground.slice()};let o=this.next;this.surface=new Vt(this.relief,{water:(e,t)=>o.cover[t*this.width+e]===qt.water,worked:(e,t)=>o.worked[t*this.width+e]===1}),this.shore=new Te({width:t.width,height:t.height,corner:this.relief.corner,water:e=>this.cover[e]===qt.water,worked:e=>this.worked[e]===1}),this.detail=new Uint8Array(a);for(let e=0;e<a;e++)this.detail[e]=this.cut(e%this.width,Math.floor(e/this.width));this.dry=new Float32Array(a),this.wet=new Float32Array(a),this.raw=new Float32Array(a),this.rowDry=new Float32Array(a),this.dryness(null),this.paint=new Float32Array(a*4);for(let e=0;e<a;e++)this.paintTile(e,this.paint,e*4);this.drawnPaint=this.paint.slice(),this.bounds();let s=Math.max(t.width,t.height)*t.tile;this.fields={x:t.x0+t.width*t.tile/2,z:t.z0+t.height*t.tile/2,side:s,turn:0},this.cols=Math.ceil(t.width/af);let c=Math.ceil(t.height/af);this.chunks=Array(this.cols*c).fill(null),this.geometries=Array(this.cols*c).fill(null),this.pieceOf=new Int32Array(this.cols*c).fill(-1);let l=t.map,u=Math.ceil(this.cols/of);for(let e=0;e<this.chunks.length;e++){let t=e%this.cols,n=Math.floor(e/this.cols),r=t*af,i=n*af;if(r+af>l.x-af&&r<l.x+l.width+af&&i+af>l.y-af&&i<l.y+l.height+af)continue;let a=Math.floor(n/of)*u+Math.floor(t/of);this.pieceOf[e]=a;let o=this.pieces.get(a);o||this.pieces.set(a,o={chunks:[],mesh:null,geometry:null}),o.chunks.push(e)}e.changeGround(null,()=>{for(let e=0;e<this.chunks.length;e++)this.setChunk(e,this.chunkGeometry(e));this.merge(),this.addApron()})}dispose(){this.adder.changeGround(null,()=>{for(let e=0;e<this.chunks.length;e++)this.setChunk(e,null);this.merge(),this.addApron(!1)});for(let e of this.built.values())e?.dispose();this.pending.clear(),this.built.clear(),this.change=null,this.fitting=null}update(e,t){Xt({width:this.width,height:this.height,level:this.level},e,t);let n=this.width,{corner:r,worked:i,cover:a,ground:o}=this.next,s=this.change??{dirty:new Set,fit:null,paint:null,watered:!1},c=0;for(let l=0;l<e.height;l++)for(let u=0;u<e.width;u++){let d=e.x+u,f=e.y+l,p=f*n+d,m=l*e.width+u,h=!1,g=!1;if(t.corners)for(let e=0;e<4;e++){let n=Math.round(t.corners[m*4+e]/this.level);n!==r[p*4+e]&&(r[p*4+e]=n,h=!0)}t.worked&&t.worked[m]!==i[p]&&(i[p]=t.worked[m],h=!0),t.cover&&t.cover[m]!==a[p]&&(t.cover[m]===qt.water!=(a[p]===qt.water)&&(h=!0,s.watered=!0),a[p]=t.cover[m],g=!0),t.ground&&t.ground[m]!==o[p]&&(o[p]=t.ground[m],g=!0),h&&(s.fit=jf(s.fit,d,f)),(h||g)&&(s.dirty.add(p),s.paint=jf(s.paint,d,f),c++)}return c===0?0:(this.change=s,this.given=!0,c)}step(e=3){let t=performance.now()+e,n=this.given;this.given=!1;let r=!1;for(;;){if(!this.fitting&&this.pending.size===0&&this.built.size===0&&!this.apronMoved&&!this.change)return!0;if(r&&performance.now()>=t)return!1;if(r=!0,this.fitting){let{change:e,refit:n,taken:r}=this.fitting;if(n&&!n.sweep(t))continue;this.fitting=null,this.settle(e,n,r)}else if(this.pending.size>0){let e=this.pending.values().next().value;this.pending.delete(e),this.built.set(e,this.chunkGeometry(e))}else if(this.built.size>0||this.apronMoved)this.swap();else if(this.change){if(n&&e!==1/0)return!1;this.begin(this.change),this.change=null}}}begin(e){let t=this.relief.corner,n=this.next,r=this.width,i=this.height,a=e.fit,o={tiles:[...e.dirty],values:new Uint8Array(e.dirty.size*3)};o.tiles.forEach((e,t)=>o.values.set([n.worked[e],n.cover[e],n.ground[e]],t*3));for(let r of e.dirty){for(let e=0;e<4;e++)t[r*4+e]=n.corner[r*4+e];this.low=Math.min(this.low,Math.min(t[r*4],t[r*4+1],t[r*4+2],t[r*4+3])*this.level-pf-1),this.high=Math.max(this.high,(Math.max(t[r*4],t[r*4+1],t[r*4+2],t[r*4+3])+1)*this.level)}let s=a&&this.surface.refitting(Math.max(0,a.x0-ff),Math.max(0,a.y0-ff),Math.min(r,a.x1+ff),Math.min(i,a.y1+ff));this.fitting={change:e,refit:s,taken:o}}settle({dirty:e,fit:t,paint:n,watered:r},i,{tiles:a,values:o}){let s=this.width,c=this.height;a.forEach((e,t)=>{this.worked[e]=o[t*3],this.cover[e]=o[t*3+1],this.ground[e]=o[t*3+2]});let l=n??{x0:0,y0:0,x1:0,y1:0};if(t&&i){for(let t of i.finish())e.add(t);this.ahead=!0;let n=this.dryness(r?null:t);l={x0:Math.min(l.x0,n.x0),y0:Math.min(l.y0,n.y0),x1:Math.max(l.x1,n.x1),y1:Math.max(l.y1,n.y1)}}if(n)for(let t of this.shore.update(n))e.add(t);let u=new Float32Array(4);for(let t=l.y0;t<l.y1;t++)for(let n=l.x0;n<l.x1;n++){let r=t*s+n;this.paintTile(r,u);let i=!1;for(let e=0;e<4;e++)Math.abs(u[e]-this.paint[r*4+e])>1e-6&&(i=!0);i&&(this.paint.set(u,r*4),e.add(r))}let d=(e,t,n)=>{let r=e%s,i=(e-r)/s;for(let e=-t;e<=t;e++)for(let a=-t;a<=t;a++){let t=r+a,o=i+e;t>=0&&o>=0&&t<s&&o<c&&n(t,o)}};for(let t of[...e])d(t,1,(t,n)=>{let r=n*s+t,i=this.cut(t,n);i!==this.detail[r]&&(this.detail[r]=i,e.add(r))});for(let t of e)this.changed=jf(this.changed,t%s,Math.floor(t/s));let f=this.beyond?Math.ceil(this.beyond.cell/this.tile):0;for(let t of e){let e=t%s,n=(t-e)/s,r=this.beyond!==null&&(e===0||n===0||e===s-1||n===c-1);d(t,r?2+f:2,(e,t)=>this.pending.add(Math.floor(t/af)*this.cols+Math.floor(e/af))),r&&(this.apronMoved=!0,this.changed=jf(jf(this.changed,Math.max(0,e-f),Math.max(0,n-f)),Math.min(s-1,e+f),Math.min(c-1,n+f)))}}swap(){let e=af*this.tile,t=new q;for(let n of this.built.keys()){let r=this.x0+n%this.cols*e,i=this.z0+Math.floor(n/this.cols)*e;t.union(new q(new w(r,-1/0,i),new w(r+e,1/0,i+e)))}this.apronMoved&&(t=null),this.adder.changeGround(t,()=>{for(let[e,t]of this.built)this.setChunk(e,t);this.merge(),this.apronMoved&&(this.addApron(!1),this.addApron())}),this.built.clear(),this.apronMoved=!1,this.drawnPaint.set(this.paint),this.revision++,this.ahead=!1;let n=this.changed;if(this.changed=null,n&&this.onSwap){let e=Math.max(0,n.x0-2),t=Math.max(0,n.y0-2),r=Math.min(this.width,n.x1+2),i=Math.min(this.height,n.y1+2);this.onSwap({x0:this.x0+e*this.tile,z0:this.z0+t*this.tile,x1:this.x0+r*this.tile,z1:this.z0+i*this.tile})}}bedAt(e,t){if(e<this.x0||t<this.z0||e>this.x0+this.width*this.tile||t>this.z0+this.height*this.tile)return 0;let n=Math.min(this.width,(e-this.x0)/this.tile),r=Math.min(this.height,(t-this.z0)/this.tile);return this.sunk(n,r)/pf}heightAt(e,t){if(e>=this.x0&&t>=this.z0&&e<=this.x0+this.width*this.tile&&t<=this.z0+this.height*this.tile){let n=Math.min(this.width,(e-this.x0)/this.tile),r=Math.min(this.height,(t-this.z0)/this.tile),i=Math.min(this.width-1,Math.floor(n)),a=Math.min(this.height-1,Math.floor(r));return this.drawn(i,a,n-i,r-a)}return this.beyondAt(e,t)}landColourAt(e,t,n=new W){let r=(e-this.x0)/this.tile,i=(t-this.z0)/this.tile;if(r>=0&&i>=0&&r<=this.width&&i<=this.height){let a=Math.min(this.width-1,Math.floor(r)),o=Math.min(this.height-1,Math.floor(i)),s=this.normal(a,o,r-a,i-o,If.n);return this.topColour(a,o,r,i,e,t,s,n,this.drawnPaint),n}return this.beyondColour(e,t,n,this.drawnPaint)}beyondColour(e,t,n,r=this.paint){let i=rf(e*.015+2,t*.015+8)*.5+.5;if(n.copy(Sf.floor).lerp(Sf.emerald,i*.3),this.dull(n),!this.beyond)return n;let a=this.x0,o=this.x0+this.width*this.tile,s=this.z0,c=this.z0+this.height*this.tile,l=Math.min(o,Math.max(a,e)),u=Math.min(c,Math.max(s,t)),d=Math.hypot(e-l,t-u),f=Mf*this.beyond.cell;if(d<f){let e=If.edge;this.baseColour((l-this.x0)/this.tile,(u-this.z0)/this.tile,e,r),n.lerp(e,1-Of(0,f,d))}return n}hit(e,t=new w){let n=e.origin,r=e.direction,i=r.length();if(i===0)return null;let a=r.x/i,o=r.y/i,s=r.z/i,c=o<0?Math.max(0,(this.high+1-n.y)/o):0,l=o<0?(this.low-1-n.y)/o:c+4*(this.width+this.height)*this.tile,u=this.beyond,d=this.x0+this.width*this.tile,f=this.z0+this.height*this.tile,p=[[n.x,a,Math.min(this.x0,u?u.x0:1/0),Math.max(d,u?u.x0+(u.nx-1)*u.cell:-1/0)],[n.z,s,Math.min(this.z0,u?u.z0:1/0),Math.max(f,u?u.z0+(u.nz-1)*u.cell:-1/0)]];for(let[e,t,n,r]of p){if(Math.abs(t)<1e-12){if(e<n||e>r)return null;continue}let i=(n-e)/t,a=(r-e)/t;c=Math.max(c,Math.min(i,a)),l=Math.min(l,Math.max(i,a))}if(c>l)return null;let m=e=>n.y+o*e-this.heightAt(n.x+a*e,n.z+s*e),h=m(c)>=0;for(let e=c;e<l;){let r=Math.min(e+.5,l),i=m(r);if(i>0||!h){h||=i>0,e=r;continue}let c=e,u=r;for(let e=0;e<24;e++){let e=(c+u)/2;m(e)>0?c=e:u=e}return t.set(n.x+a*u,n.y+o*u,n.z+s*u)}return null}drawn(e,t,n,r){return this.surface.on(e,t,n,r)*this.level-pf*this.shore.depth(e,t,e+n,t+r)}sunk(e,t){let n=Math.min(this.width-1,Math.max(0,Math.floor(e))),r=Math.min(this.height-1,Math.max(0,Math.floor(t)));return pf*this.shore.depth(n,r,e,t)}normal(e,t,n,r,i){let[a,o]=this.surface.slope(e,t,n,r),s=this.level/this.tile,c=.02,l=e+n,u=t+r,d=a*s-(this.sunk(l+c,u)-this.sunk(l-c,u))/(2*c*this.tile),f=o*s-(this.sunk(l,u+c)-this.sunk(l,u-c))/(2*c*this.tile);return i.set(-d,1,-f).normalize()}cut(e,t){let n=this.surface.bend(e,t)*this.level,r=this.map,i=Math.max(r.x-1-e,e-(r.x+r.width),r.y-1-t,t-(r.y+r.height),0),a=i<=uf?4:i<=df?2:1;return(this.nearBank(e,t)||this.shore.isBank(e,t))&&(a=Math.max(a,4)),i<=uf&&this.shore.isSteep(e,t)&&(a=8),cf.find(e=>e>=a&&n/(e*e)<=lf)??8}nearBank(e,t){if(this.cover[t*this.width+e]!==qt.water)return!1;for(let n=-1;n<=1;n++)for(let r=-1;r<=1;r++){let i=e+r,a=t+n;if(i>=0&&a>=0&&i<this.width&&a<this.height&&this.cover[a*this.width+i]!==qt.water)return!0}return!1}joins(e,t,n){let r=e+vf[n][0],i=t+vf[n][1];if(r<0||i<0||r>=this.width||i>=this.height)return!1;let a=this.sideOf(e,t,n),o=this.sideOf(r,i,(n+2)%4);return a[0]===o[0]&&a[1]===o[1]}sideOf(e,t,n){let r=this.relief.corner,i=(t*this.width+e)*4;switch(n){case 0:return[r[i],r[i+1]];case 1:return[r[i+1],r[i+2]];case 2:return[r[i+3],r[i+2]];default:return[r[i],r[i+3]]}}steps(e,t,n){let r=this.detail[t*this.width+e],i=e+vf[n][0],a=t+vf[n][1];return i<0||a<0||i>=this.width||a>=this.height?r:Math.max(r,this.detail[a*this.width+i])}bounds(){let e=1/0,t=-1/0;for(let n of this.relief.corner)e=Math.min(e,n),t=Math.max(t,n);this.low=e*this.level-pf-1,this.high=(t+1)*this.level;let n=this.beyond;if(n)for(let e of n.height)this.low=Math.min(this.low,e),this.high=Math.max(this.high,e)}dryness(e){let t=this.width,n=this.height,r=t*n,i=Nf,a=this.relief.corner;if(!e){let e=this.wet.fill(1/0),i=[];for(let t=0;t<r;t++)this.cover[t]===qt.water&&(e[t]=0,i.push(t));for(let r=0;r<i.length;r++){let a=i[r],o=a%t,s=(a-o)/t;for(let[r,c]of vf){let l=o+r,u=s+c,d=u*t+l;l<0||u<0||l>=t||u>=n||e[d]<=e[a]+1||(e[d]=e[a]+1,i.push(d))}}}let o=e??{x0:0,y0:0,x1:t,y1:n};for(let e=o.y0;e<o.y1;e++)for(let n=o.x0;n<o.x1;n++){let r=e*t+n,i=(a[r*4]+a[r*4+1]+a[r*4+2]+a[r*4+3])/4;this.raw[r]=.6*Math.min(1,Math.max(0,i/10))+.4*(1-Math.exp(-Math.min(this.wet[r],40)/4))}let s=Math.max(0,o.x0-i),c=Math.min(t,o.x1+i),l=Math.max(0,o.y0-i),u=Math.min(n,o.y1+i);for(let e=o.y0;e<o.y1;e++)for(let n=s;n<c;n++){let r=0,a=0;for(let o=-i;o<=i;o++){let i=n+o;i>=0&&i<t&&(r+=this.raw[e*t+i],a++)}this.rowDry[e*t+n]=r/a}for(let e=l;e<u;e++)for(let r=s;r<c;r++){let a=0,o=0;for(let s=-i;s<=i;s++){let i=e+s;i>=0&&i<n&&(a+=this.rowDry[i*t+r],o++)}this.dry[e*t+r]=a/o}return{x0:s,y0:l,x1:c,y1:u}}paintTile(e,t,n=0){let r=If.a,i=this.cover[e]===qt.water,a=i?qt.grass:this.cover[e];switch(a){case qt.bare:r.copy(Sf.bare);break;case qt.track:r.copy(Sf.track);break;case qt.rock:r.copy(Sf.lush).lerp(Sf.dry,this.dry[e]).lerp(Sf.rock,.65);break;case qt.woods:r.copy(Sf.floor);break;default:r.copy(Sf.lush).lerp(Sf.dry,i?0:this.dry[e])}this.tint(r,this.ground[e]),t[n]=r.r,t[n+1]=r.g,t[n+2]=r.b,t[n+3]=(Ef[a]??Ef[0]).meadow}tint(e,t){let n=Tf[t],r=this.look.groundTint;n&&r!==0&&(e.lerp(n.toward,n.mix*r),e.multiplyScalar(1+n.lift*r*2))}dull(e){let{light:t,chroma:n}=this.look.beyond,r=.2126*e.r+.7152*e.g+.0722*e.b;return e.setRGB((r+(e.r-r)*n)*t,(r+(e.g-r)*n)*t,(r+(e.b-r)*n)*t)}dullBy(e,t){if(t<=0)return;if(t>=1){this.dull(e);return}let n=If.dulled.copy(e);this.dull(n),e.lerp(n,t)}dullness(e,t){let n=this.map,r=Math.max(n.x-e,e-(n.x+n.width)),i=Math.max(n.y-t,t-(n.y+n.height)),a=r>0||i>0?Math.hypot(Math.max(0,r),Math.max(0,i)):Math.max(r,i);if(a<=0)return 0;let{near:o,far:s,wave:c,rag:l}=bf,u=Math.min(1,Math.max(0,rf(e/c+11.3,t/c-4.7)*.5+.5));return Of(0,o+(s-o)*u+l*rf(e*.45-3.1,t*.45+5.9),a)}colourAt(e,t,n,r=this.paint){let i=e+.35*rf(e*.55+17,t*.55-5),a=t+.35*rf(e*.55-31,t*.55+9),o=i-.5,s=a-.5,c=Math.floor(o),l=Math.floor(s),u=o-c,d=s-l,f=Math.min(this.width-1,Math.max(0,c)),p=Math.min(this.width-1,Math.max(0,c+1)),m=Math.min(this.height-1,Math.max(0,l)),h=Math.min(this.height-1,Math.max(0,l+1)),g=(m*this.width+f)*4,_=(m*this.width+p)*4,v=(h*this.width+f)*4,y=(h*this.width+p)*4,b=(1-u)*(1-d),x=u*(1-d),S=(1-u)*d,C=u*d,w=r[g]*b+r[_]*x+r[v]*S+r[y]*C,T=r[g+1]*b+r[_+1]*x+r[v+1]*S+r[y+1]*C,E=r[g+2]*b+r[_+2]*x+r[v+2]*S+r[y+2]*C,D=r[g+3]*b+r[_+3]*x+r[v+3]*S+r[y+3]*C;return n.setRGB(w,T,E),D}setChunk(e,t){if(this.pieceOf[e]>=0){this.geometries[e]?.dispose(),this.geometries[e]=t,this.stale.add(this.pieceOf[e]);return}let n=this.chunks[e];n&&this.adder.remove(n),this.geometries[e]?.dispose(),this.geometries[e]=t,this.chunks[e]=t&&this.adder.add(t,`ground`,{under:!0,tile:af*this.tile,fields:this.fields})}merge(){for(let e of this.stale){let t=this.pieces.get(e);t.mesh&&this.adder.remove(t.mesh),t.geometry?.dispose();let n=t.chunks.map(e=>this.geometries[e]).filter(e=>e!==null),r=n.length?Jd(n):null;r&&this.adder.prepare(r),t.geometry=r,t.mesh=r&&this.adder.add(r,`ground`,{under:!0,tile:32*this.tile,fields:this.fields})}this.stale.clear()}addApron(e=!0){this.apron&&this.adder.remove(this.apron),this.apronGeometry?.dispose(),this.apronGeometry=e?this.apronMesh():null,this.apron=this.apronGeometry&&this.adder.add(this.apronGeometry,`ground`,{under:!0,tile:sf,fields:this.fields})}chunkGeometry(e){let t=e%this.cols,n=Math.floor(e/this.cols),r=new $d(`paint`);for(let e=n*af;e<Math.min(this.height,(n+1)*af);e++)for(let n=t*af;n<Math.min(this.width,(t+1)*af);n++){this.top(r,n,e);for(let t=0;t<4;t++){let i=n+vf[t][0],a=e+vf[t][1];i<0||a<0||i>=this.width||a>=this.height?this.face(r,n,e,t,null):this.joins(n,e,t)||this.face(r,n,e,t,[i,a])}}if(r.vertexCount===0)return null;let i=r.build();return this.pieceOf[e]<0&&this.adder.prepare(i),i}vy=0;baseColour(e,t,n,r=this.paint,i=1){let a=this.colourAt(e,t,n,r);this.dullBy(n,this.dullness(e,t));let o=rf((this.x0+e*this.tile)*.02+7,(this.z0+t*this.tile)*.02-3)*.5+.5,s=a*i;n.lerp(Sf.lime,Of(.55,.9,o)*.35*s).lerp(Sf.emerald,Of(.6,.95,1-o)*.35*s)}alongApron(e,t,n,r){let i=this.apronAt;if(!i)return;let a=this.beyond.cell/this.tile,o=this.width,s=this.height,c=[[e,t,i.ys,e=>[0,e]],[o-e,t,i.ys,e=>[o,e]],[t,e,i.xs,e=>[e,0]],[s-t,e,i.xs,e=>[e,s]]],l=0,u=0,d=0,f=0,p=0,m=If.alongA,h=If.alongB;for(let[e,t,i,o]of c){if(e>=a)continue;let s=0;for(;s+2<i.length&&i[s+1]<=t;)s++;let c=Math.min(1,Math.max(0,(t-i[s])/(i[s+1]-i[s])));if(this.baseColour(...o(i[s]),m,r),this.baseColour(...o(i[s+1]),h,r),m.lerp(h,c),e<=1e-9){n.copy(m);return}let g=1-Of(0,a,e),_=g/e;l+=m.r*_,u+=m.g*_,d+=m.b*_,f+=_,p=Math.max(p,g)}f>0&&n.lerp(If.alongA.setRGB(l/f,u/f,d/f),p)}painted={steep:0,shingle:0,bed:0};topColour(e,t,n,r,i,a,o,s,c=this.paint){let l=this.shore,u=l.depth(e,t,n,r),d=l.at(n,r),f=Of(.2,.42,u);this.baseColour(n,r,s,c,1-f);let p=Of(.35,.9,Math.hypot(o.x,o.z)/Math.max(.001,o.y));s.lerp(Sf.worn,p*.5*(1-f));let m=rf(i*.35+11,a*.35-4);s.lerp(Sf.damp,Of(-.55,-.05,d+.1*m)*.45*(1-f));let h=Of(mt,.2,u)*(1-Of(.3,.5,u))*Of(-.35,.25,rf(i*.6-2,a*.6+6));s.lerp(Sf.shingle,h*.6);let g=If.a.copy(Sf.bed).lerp(Sf.deep,u*.7);this.dullBy(g,this.dullness(n,r)),s.lerp(g,f),this.alongApron(n,r,s,c),this.painted.steep=p,this.painted.shingle=h,this.painted.bed=f}vertex(e,t,n,r,i){let a=t+r,o=n+i,s=this.vy=this.drawn(t,n,r,i),c=this.normal(t,n,r,i,If.n),l=If.c,u=this.x0+a*this.tile,d=this.z0+o*this.tile;this.topColour(t,n,a,o,u,d,c,l);let{steep:f,shingle:p,bed:m}=this.painted,h=this.cover[n*this.width+t],g=Ef[m>.5?qt.water:h===qt.water?qt.grass:h]??Ef[0],_=Math.min(1,g.drift+f*.4+p*.3+rf(u*.21+3,d*.21-9)*.15);return e.vertex({x:u,y:s,z:d},c,l,[_,g.brush,.7+rf(u*.05,d*.05)*.9,0])}top(e,t,n){let r=this.detail[n*this.width+t],i=[0,1,2,3].map(e=>this.steps(t,n,e)),a=[],o=[];for(let i=0;i<=r;i++)for(let s=0;s<=r;s++)a.push(this.vertex(e,t,n,s/r,i/r)),o.push(this.vy);let s=(e,t)=>a[t*(r+1)+e],c=(e,t)=>o[t*(r+1)+e],l=(t,n,r)=>e.tri(t,r,n);for(let a=0;a<r;a++)for(let o=0;o<r;o++){let u=[s(o,a)],d=(a,o,s)=>{let c=i[a]/r;for(let r=1;r<c;r++){let[l,d]=s((o*c+(a>=2?-r:r))/i[a]);u.push(this.vertex(e,t,n,l,d))}};if(a===0&&d(0,o,e=>[e,0]),u.push(s(o+1,a)),o===r-1&&d(1,a,e=>[1,e]),u.push(s(o+1,a+1)),a===r-1&&d(2,o+1,e=>[e,1]),u.push(s(o,a+1)),o===0&&d(3,a+1,e=>[0,e]),u.length===4){kf([c(o,a),c(o+1,a),c(o+1,a+1),c(o,a+1)])?(l(u[0],u[1],u[2]),l(u[0],u[2],u[3])):(l(u[0],u[1],u[3]),l(u[1],u[2],u[3]));continue}let f=this.vertex(e,t,n,(o+.5)/r,(a+.5)/r);for(let e=0;e<u.length;e++)l(f,u[e],u[(e+1)%u.length])}}sideLine(e,t,n){let r=this.steps(e,t,n),i=Pf[n],a=Array.from({length:r+1},(n,a)=>{let[o,s]=i(a/r);return this.drawn(e,t,o,s)});return e=>{let t=Math.min(r-1,Math.floor(e*r)),n=e*r-t;return a[t]+(a[t+1]-a[t])*n}}face(e,t,n,r,i){let a=this.sideLine(t,n,r),o=i?this.sideLine(i[0],i[1],(r+2)%4):e=>a(e)-_f,s=i?Math.max(this.steps(t,n,r),this.steps(i[0],i[1],(r+2)%4)):this.steps(t,n,r),[c,l]=Ff[r],u=If.out.set(vf[r][0],0,vf[r][1]),d=e=>this.x0+(t+e)*this.tile,f=e=>this.z0+(n+e)*this.tile,p=this.dullness(t+(c[0]+l[0])/2,n+(c[1]+l[1])/2),m=If.lip.copy(Sf.lip),h=If.floor.copy(Sf.floor);this.dullBy(m,p),this.dullBy(h,p);for(let t=0;t<s;t++){let n=t/s,r=(t+1)/s,g=[a(n),a(r)],_=[o(n),o(r)];if(g[0]<=_[0]+1e-6&&g[1]<=_[1]+1e-6)continue;let v=[d(c[0]+(l[0]-c[0])*n),f(c[1]+(l[1]-c[1])*n)],y=[d(c[0]+(l[0]-c[0])*r),f(c[1]+(l[1]-c[1])*r)];if(!i){Bf(e,v,y,[_],[g],h,u,Df);continue}let b=[g[0]-mf,g[1]-mf];Bf(e,v,y,[_,b],[g],m,u,Df);let x=this.level,S=Math.floor(Math.min(..._)/x/hf),C=Math.ceil(Math.max(...b)/x/hf);for(let t=S;t<C;t++){let n=t*hf*x,r=(t+1)*hf*x,i=If.band.copy((t*hf>=gf?wf:Cf)[t&1]);this.dullBy(i,p),Bf(e,v,y,[_,[n,n]],[b,[r,r]],i,u,Df)}}}beyondAt(e,t){let n=this.beyond,r=Math.min(this.x0+this.width*this.tile,Math.max(this.x0,e)),i=Math.min(this.z0+this.height*this.tile,Math.max(this.z0,t)),a=()=>this.heightAt(r,i);if(!n)return a();let o=Math.min(n.nx-1.001,Math.max(0,(e-n.x0)/n.cell)),s=Math.min(n.nz-1.001,Math.max(0,(t-n.z0)/n.cell)),c=Math.floor(o),l=Math.floor(s),u=o-c,d=s-l,f=n.height,p=(e,t)=>f[t*n.nx+e],m=(p(c,l)*(1-u)+p(c+1,l)*u)*(1-d)+(p(c,l+1)*(1-u)+p(c+1,l+1)*u)*d,h=Of(0,n.cell,Math.hypot(e-r,t-i));return h>=1?m:a()+(m-a())*h}apronLines(){let e=this.beyond;if(!e)return null;let t=(t,n,r)=>[...new Set([...Array.from({length:n},(n,r)=>t+r*e.cell),...r])].sort((e,t)=>e-t);return{xs:t(e.x0,e.nx,[this.x0,this.x0+this.width*this.tile]),zs:t(e.z0,e.nz,[this.z0,this.z0+this.height*this.tile])}}apronMesh(){if(!this.beyond)return null;let e=this.x0,t=this.x0+this.width*this.tile,n=this.z0,r=this.z0+this.height*this.tile,{xs:i,zs:a}=this.apronLines(),o=new $d(`paint`),s=i.length,c=If.c,l=If.n;for(let e of a)for(let t of i){let n=this.heightAt(t,e);l.set(this.heightAt(t-1,e)-this.heightAt(t+1,e),2,this.heightAt(t,e-1)-this.heightAt(t,e+1)).normalize(),this.beyondColour(t,e,c),o.vertex({x:t,y:n,z:e},l,c,[.3,1.5,.7,0])}for(let c=0;c+1<a.length;c++)for(let l=0;l+1<s;l++){if(i[l]>=e&&i[l+1]<=t&&a[c]>=n&&a[c+1]<=r)continue;let u=c*s+l;o.quad(u,u+s,u+s+1,u+1)}return o.vertexCount?o.build():null}},jf=(e,t,n)=>e?{x0:Math.min(e.x0,t),y0:Math.min(e.y0,n),x1:Math.max(e.x1,t+1),y1:Math.max(e.y1,n+1)}:{x0:t,y0:n,x1:t+1,y1:n+1},Mf=3,Nf=3,Pf=[e=>[e,0],e=>[1,e],e=>[e,1],e=>[0,e]],Ff=[[[0,0],[1,0]],[[1,0],[1,1]],[[0,1],[1,1]],[[0,0],[0,1]]],If={a:new W,c:new W,lip:new W,floor:new W,band:new W,dulled:new W,edge:new W,alongA:new W,alongB:new W,n:new w,out:new w},Lf=new w,Rf=new w,zf=new w;function Bf(e,t,n,r,i,a,o,s){let c=[...r,...i],l=[0,1];for(let e=0;e<c.length;e++)for(let t=e+1;t<c.length;t++){let n=c[e][0]-c[t][0],r=c[e][1]-c[t][1];(n<0&&r>0||n>0&&r<0)&&l.push(n/(n-r))}l.sort((e,t)=>e-t);let u=(e,t)=>e[0]+(e[1]-e[0])*t,d=e=>Math.max(...r.map(t=>u(t,e))),f=e=>Math.min(...i.map(t=>u(t,e)));for(let r=0;r+1<l.length;r++){let i=l[r],c=l[r+1];if(c-i<1e-6)continue;let u=d(i),p=d(c),m=f(i),h=f(c);if(m-u<1e-6&&h-p<1e-6)continue;let g=(e,r)=>({x:t[0]+(n[0]-t[0])*e,y:r,z:t[1]+(n[1]-t[1])*e}),_=[g(i,u),g(i,Math.max(u,m)),g(c,Math.max(p,h)),g(c,p)],v=e.vertex(_[0],o,a,s),y=e.vertex(_[1],o,a,s),b=e.vertex(_[2],o,a,s),x=e.vertex(_[3],o,a,s);Lf.set(_[2].x-_[0].x,_[2].y-_[0].y,_[2].z-_[0].z),Rf.set(_[3].x-_[1].x,_[3].y-_[1].y,_[3].z-_[1].z),zf.crossVectors(Lf,Rf).dot(o)>=0?e.quad(v,y,b,x):e.quad(v,x,b,y)}}var Vf={fits:10354624,blocked:16738896,tint:1,opacity:.28,shade:.4,lines:1},Hf=.6,Uf={route:.5,dashed:.3,wire:.12},Wf={route:3,dashed:2.5,wire:1.6},Gf=.08,Kf=1,qf=1.2,Jf=.05,Yf=1.4,Xf=`
uniform sampler2D uOnTopAux;
uniform sampler2D uOnTopCrops;
bool hiddenAt(float depth) {
  ivec2 at = ivec2(gl_FragCoord.xy);
  float shown = texelFetch(uOnTopAux, at, 0).z, crop = texelFetch(uOnTopCrops, at, 0).r;
  return shown > 0.0 && depth > shown + 0.15 + shown * 0.004 + crop * ${4 .toFixed(1)};
}
vec3 toSrgbOnTop(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
`,Zf=`
invariant gl_Position;
varying vec3 vColorOnTop;
varying vec3 vNormalOnTop;
varying float vHeightOnTop;
varying float vDepthOnTop;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0), vp = viewMatrix * wp;
  vNormalOnTop = normalize(mat3(modelMatrix) * normal);
  vHeightOnTop = wp.y;
#ifdef USE_COLOR
  vColorOnTop = color.rgb;
#else
  vColorOnTop = vec3(0.8);
#endif
  vDepthOnTop = -vp.z;
  gl_Position = projectionMatrix * vp;
}
`,Qf=`
${Xf}
uniform vec3 uPreviewColor;
uniform vec4 uPreviewLook;
uniform vec3 uSunDir;
varying vec3 vColorOnTop;
varying vec3 vNormalOnTop;
varying float vHeightOnTop;
varying float vDepthOnTop;
layout(location = 0) out vec4 outColor;
void main() {
  if (hiddenAt(vDepthOnTop)) discard;
  // uPreviewLook: how much of the state's colour (x), how solid (y), how much the sun shades it (z), how much its level
  // lines show (w): a line a pixel or so wide at each LEVEL_LINES of height, on the surfaces that rise (a flat roof at a
  // line's height would be all line).
  float lit = mix(1.0, 0.62 + 0.38 * max(dot(normalize(vNormalOnTop), uSunDir), 0.0), uPreviewLook.z);
  vec3 c = mix(toSrgbOnTop(vColorOnTop), uPreviewColor, uPreviewLook.x) * lit;
  float h = vHeightOnTop / ${Hf.toFixed(2)}, rise = fwidth(h), fh = max(rise, 1e-4);
  float line = uPreviewLook.w * (1.0 - smoothstep(0.6, 1.4, abs(fract(h + 0.5) - 0.5) / fh)) * smoothstep(0.002, 0.006, rise);
  outColor = vec4(mix(c, uPreviewColor, line), mix(uPreviewLook.y, 1.0, line));
}
`,$f=`
layout(location = 0) out vec4 outColor;
void main() { outColor = vec4(0.0); }
`,ep=`
uniform sampler2D uOnTopAux;
varying float vViewDepth;
layout(location = 0) out vec4 outColor;
#ifdef CROP_DABS
${Dl}
#endif
void main() {
#ifdef CROP_DABS
  if (dabOut()) discard;
#endif
  float shown = texelFetch(uOnTopAux, ivec2(gl_FragCoord.xy), 0).z;
  if (shown <= 0.0 || vViewDepth > shown + 0.02 + shown * 0.0007) discard;
  outColor = vec4(1.0);
}
`,tp=`
attribute vec4 aSide;
attribute float aMinPx;
uniform vec2 uOnTopScreen;
varying vec4 vColorOnTop;
varying float vDepthOnTop;
void main() {
  float pxPerMetre = projectionMatrix[0][0] * uOnTopScreen.x * 0.5;
  vec3 p = position + aSide.xyz * max(aSide.w, aMinPx * uOnTopScreen.y * 0.5 / pxPerMetre);
  vec4 vp = viewMatrix * modelMatrix * vec4(p, 1.0);
  vColorOnTop = color;
  vDepthOnTop = -vp.z;
  gl_Position = projectionMatrix * vp;
}
`,np=`
${Xf}
varying vec4 vColorOnTop;
varying float vDepthOnTop;
layout(location = 0) out vec4 outColor;
void main() {
  if (hiddenAt(vDepthOnTop)) discard;
  outColor = vec4(toSrgbOnTop(vColorOnTop.rgb), vColorOnTop.a);
}
`,rp=new w(0,1,0),ip=class{previews=new L;lines=new L;groups=new Map;aux={value:null};cropTarget=new ee(1,1,{type:E,format:j,depthBuffer:!1,minFilter:Je,magFilter:Je,generateMipmaps:!1});crops=new L;cropTwins=new Map;cropMaterials=new Map;shared;screen={value:new _(1,1)};sunDir;depthOnly;lineMaterial;land;landRevision;look=Vf;lookUniform={value:new J};constructor(e,t,n){this.shared=e,this.sunDir=e.uSunDir,this.land=t,this.landRevision=n,this.setLook(Vf),this.depthOnly=new o({glslVersion:K,vertexShader:Zf,fragmentShader:$f,colorWrite:!1,side:2}),this.lineMaterial=new o({glslVersion:K,vertexShader:tp,fragmentShader:np,vertexColors:!0,transparent:!0,depthWrite:!1,depthTest:!1,side:2,uniforms:{uOnTopAux:this.aux,uOnTopCrops:{value:this.cropTarget.texture},uOnTopScreen:this.screen}})}setSize(e,t){this.cropTarget.setSize(e,t)}setLook(e){this.look=e,this.lookUniform.value.set(e.tint,e.opacity,e.shade,e.lines);for(let e of this.previews.children)this.setPreview(e,e.userData.preview)}addPreview(e,t){let n=new o({glslVersion:K,vertexShader:Zf,fragmentShader:Qf,vertexColors:!!e.getAttribute(`color`),transparent:!0,depthWrite:!1,depthFunc:3,side:2,uniforms:{uOnTopAux:this.aux,uOnTopCrops:{value:this.cropTarget.texture},uSunDir:this.sunDir,uPreviewColor:{value:new W},uPreviewLook:this.lookUniform}}),r=new ut(e,n);return r.frustumCulled=!1,this.setPreview(r,t),this.previews.add(r),r}setPreview(t,n){t.material.uniforms.uPreviewColor.value.setHex(n===`fits`?this.look.fits:this.look.blocked,e),t.userData.preview=n}removePreview(e){this.previews.remove(e),e.material.dispose()}setLines(e,t){let n=this.groups.get(t);if(n&&(this.lines.remove(n.mesh),n.mesh.geometry.dispose(),this.groups.delete(t)),!e?.length)return;let r=this.build(e);if(!r)return;let i=new ut(r,this.lineMaterial);i.frustumCulled=!1,this.lines.add(i);let a=e.some(e=>e.points.some(e=>e.y===void 0));this.groups.set(t,{lines:e,mesh:i,land:a?this.landRevision():null})}get any(){return this.previews.children.length>0||this.lines.children.length>0}draw(e,t,n,r,i,a,o){if(!this.any)return;let s=this.landRevision();for(let[e,t]of[...this.groups])t.land!==null&&t.land!==s&&this.setLines(t.lines,e);this.aux.value=n,this.screen.value.set(i,a),this.drawCrops(e,t,o),e.setRenderTarget(r),this.previews.children.some(e=>e.visible)&&(e.clear(!1,!0,!1),this.previews.overrideMaterial=this.depthOnly,e.render(this.previews,t),this.previews.overrideMaterial=null,e.render(this.previews,t)),this.lines.children.length&&e.render(this.lines,t)}drawCrops(e,t,n){let r=new Set;for(let e of n.children){let t=e,n=e.userData.kind;if(!t.isMesh||!e.userData.crop)continue;r.add(t);let i=this.cropTwins.get(t);(!i||i.geometry!==t.geometry)&&(i&&this.crops.remove(i),i=new ut(t.geometry,this.cropMaterial(n)),i.matrixAutoUpdate=!1,i.matrixWorldAutoUpdate=!1,this.crops.add(i),this.cropTwins.set(t,i)),i.visible=t.visible,i.frustumCulled=t.frustumCulled,i.matrixWorld.copy(t.matrixWorld)}for(let[e,t]of this.cropTwins)r.has(e)||(this.crops.remove(t),this.cropTwins.delete(e));let i=e.getClearColor(new W),a=e.getClearAlpha();e.setRenderTarget(this.cropTarget),e.setClearColor(0,0),e.clear(!0,!1,!1),e.render(this.crops,t),e.setClearColor(i,a)}cropMaterial(e){let t=this.cropMaterials.get(e);return t||(t=Rl(e,this.shared,ep,{uOnTopAux:this.aux}),(e===`foliage`||e===`debris`)&&(t.defines.CROP_DABS=1),this.cropMaterials.set(e,t)),t}build(e){let t=[],n=[],r=[],i=[],a=[],o=new W,s=new w,c=new w,l=new w,u=new w,d=(e,s,c,l,u,d)=>{let f=t.length/3;for(let a of[e,s])for(let e of[-1,1])t.push(a.x,a.y,a.z),n.push(c.x*e,c.y*e,c.z*e,l),r.push(u),i.push(o.r,o.g,o.b,d);a.push(f,f+1,f+2,f+1,f+3,f+2)};for(let t of e){let e=t.closed?[...t.points,t.points[0]]:t.points;if(e.length<2)continue;o.setHex(t.color);let n=(t.width??Uf[t.style])/2,r=Wf[t.style],i=t.opacity??1,a=[];for(let n=0;n+1<e.length;n++){let r=e[n],i=e[n+1],o=Math.hypot(i.x-r.x,i.z-r.z),s=t.style===`wire`?8:Math.max(1,Math.ceil(o/Kf)),c=t.style===`wire`?Math.min(Yf,o*Jf):0;for(let e=n===0?0:1;e<=s;e++){let t=e/s,n=r.x+(i.x-r.x)*t,o=r.z+(i.z-r.z)*t,l=r.y??this.land(r.x,r.z)+Gf,u=i.y??this.land(i.x,i.z)+Gf,d=r.y===void 0&&i.y===void 0?this.land(n,o)+Gf:l+(u-l)*t-c*4*t*(1-t);a.push(new w(n,d,o))}}let f=0;for(let e=0;e+1<a.length;e++){s.copy(a[e]),c.copy(a[e+1]);let o=l.subVectors(c,s).length();if(!(o<1e-5)){if(l.divideScalar(o),t.style===`wire`){u.crossVectors(l,rp),u.lengthSq()<1e-8&&u.set(1,0,0),u.normalize(),d(s,c,u,n,r,i),d(s,c,u.crossVectors(l,u).normalize(),n,r,i);continue}if(u.set(-l.z,0,l.x),u.lengthSq()<1e-8&&u.set(1,0,0),u.normalize(),t.style===`dashed`){let e=f;f+=o;for(let t=Math.floor(e/2)*2;t<f;t+=2){let a=Math.max(t,e),o=Math.min(t+qf,f);o<=a||d(new w().copy(s).addScaledVector(l,a-e),new w().copy(s).addScaledVector(l,o-e),u,n,r,i)}continue}d(s,c,u,n,r,i)}}}if(!t.length)return null;let f=new We;return f.setAttribute(`position`,new M(t,3)),f.setAttribute(`aSide`,new M(n,4)),f.setAttribute(`aMinPx`,new M(r,1)),f.setAttribute(`color`,new M(i,4)),f.setIndex(a),f}},ap=1.6,op=new W(13150074),sp={across:4096/320/8,up:4096/216/8};function cp(e){if(!(e>=.05))throw Error(`brush3d: shadowCap must be at least 0.05 (Infinity for none), not ${e}`);return e}var lp=[`debris`,`rain`,`snow`],up=class{gl;scene=new L;view=new ga;shared=al();settings={lines:!0,shadows:!0,grain:.012,prepass:!0,pools:!0,waterScissor:!0,waterMask:!0,equalDepth:!0,falling:!0,fallingShare:1,shelterDebug:!1,reflection:!0,under:!0,resolveDepth:!0};width=1;height=1;screenRatio;pixelRatio;maxRatio=1/0;reflectionScale=1;maxPixels=1/0;timer=null;output=null;gbuffer;shadowTarget;sunCamera=new Et(-1,1,1,-1,.5,400);shadowCenter;shadowRadius;shadowFollow;shadowCap;post;postScene=new L;postCamera=new Et(-1,1,1,-1,0,1);materials=new Map;casters=new Set;silhouettes=new D;twins=new Map;pools=new la(()=>this.settings.pools);fields=new Map;fieldSizes=new Map;underTarget;reflectTarget;look=null;seasonSet=null;debris;dayNow=Da;seasonal=new Map;ownColours=new WeakMap;turnedFor=new WeakMap;water=new ko;waterMesh=null;wind=new hs;windField=new us;trees=new Kd;parts=new qc;nightLights=new rl;windNow=null;dust=new ns;weather=new sd;shelter;ground=new ac;hollows=new pc;snow=new kc;sunMemory;clockHour=null;sunElNow=90;rain;lightning=new Tu;rainShown=!0;snowfall;snowShown=!0;cloudMap;skyMap;cloudShape=nt;groundTools=new Bc;marks;onTop;picker;tagged=new Set;drawnCamera=new Et;drawn=!1;waterMap=null;canvas;constructor(e,t={}){this.canvas=e,this.view.screen.canvas=e,this.gl=new ea({canvas:e,antialias:!1,alpha:!1,preserveDrawingBuffer:!0}),mp(e,new WeakRef(this)),this.gl.autoClear=!1,this.screenRatio=t.pixelRatio??Math.min(window.devicePixelRatio||1,2),this.pixelRatio=this.screenRatio,this.view.screen.ratio=this.screenRatio;let n=t.samples??4;this.gbuffer=new ee(1,1,{count:2,samples:n,type:A,format:j,depthBuffer:!0,minFilter:de,magFilter:de});let r=t.shadowMapSize??2048;this.shadowTarget=new ee(r,r,{depthBuffer:!0}),this.shadowTarget.depthTexture=new xt(r,r,le),this.shared.uShadowMap.value=this.shadowTarget.depthTexture,this.shared.uShadowTexel.value.set(1/r,1/r),this.shadowCenter=t.shadowCenter?.clone()??new w,this.shadowRadius=t.shadowRadius??30,this.shadowFollow=t.shadowFollow??!1,this.shadowCap=cp(t.shadowCap??1);let i=()=>new ee(1,1,{count:2,type:A,format:j,depthBuffer:!0,minFilter:de,magFilter:de});this.shelter=new js(t.shelterSize??1024),Object.assign(this.shared,this.shelter.uniforms,this.ground.uniforms,this.hollows.uniforms,this.snow.uniforms),Object.assign(this.shared,this.groundTools.uniforms),this.marks=new td(this.shared),this.onTop=new ip(this.shared,(e,t)=>this.landAt(e,t),()=>this.landRevision),this.picker=new Qc({landHit:(e,t)=>this.landHit(e,t),waterAt:(e,t)=>this.waterAt(e,t),tagged:()=>this.tagged,posed:(e,t)=>this.parts.posed(e,t)}),this.rain=new Ys(this.shared,this.shelter.uniforms),this.scene.add(this.rain.mesh),this.snowfall=new Xu(this.shared,this.shelter.uniforms),this.scene.add(this.snowfall.mesh),this.cloudMap=new xa(this.shared),this.skyMap=new xa({uCloudMap:this.shared.uSkyMap,uCloudRect:this.shared.uSkyRect},va.size),this.sunMemory=new $s(this.shared),Object.assign(this.shared,this.sunMemory.uniforms),this.underTarget=i(),this.reflectTarget=i(),this.shared.uUnder.value=this.underTarget.textures[0],this.shared.uUnderAux.value=this.underTarget.textures[1],this.shared.uReflect.value=this.reflectTarget.textures[0],this.post=new o({vertexShader:nd,fragmentShader:rd,depthTest:!1,depthWrite:!1,uniforms:{tColor:{value:this.gbuffer.textures[0]},tAux:{value:this.gbuffer.textures[1]},uResolution:{value:new _(1,1)},uLineWidth:{value:1.5},uLines:{value:1},uTargetDepth:{value:120},uHazeColor:{value:new W},uHazeDensity:{value:.02},uHazeMax:{value:.4},uHazeFloor:{value:0},uSkyTop:{value:new W},uSkyBottom:{value:new W},uExposure:{value:1},uSaturation:{value:1},uNightShift:{value:0},uShadeHue:{value:0},uGrain:{value:.012},uVignette:{value:gd},uCamPos:{value:new w},uCamRight:{value:new w},uCamUp:{value:new w},uCamFwd:{value:new w},uFogColor:{value:new W},uFog:{value:new J},tFogNoise:{value:bs()},uDust:{value:new w},uFogFrame:{value:new J(1,0,1,0)},uFogNext:{value:new J(1,0,1,0)},uFogFade:{value:0},uFogStreak:{value:new _},uWindSpeed:this.shared.uWindSpeed,uWindDir:this.shared.uWindDir,tWindA:this.shared.tWindA,tWindB:this.shared.tWindB,uWindBlend:this.shared.uWindBlend,uWindGrid:this.shared.uWindGrid,uWindOn:this.shared.uWindOn,tWindUsual:this.shared.tWindUsual,uShimmer:{value:new _},tDustA:{value:this.dust.a},tDustB:{value:this.dust.b},uDustBlend:{value:0},uDustGrid:{value:this.dust.grid},uDustOn:{value:0},uDustColor:{value:new W},uDustReach:{value:4.5},...this.rain.veil,...this.snowfall.veil,...this.ground.uniforms,...this.shelter.uniforms,...this.hollows.uniforms,...this.lightning.post,...this.nightLights.post,uShadowMap:this.shared.uShadowMap,uShadowMatrix:this.shared.uShadowMatrix,uShadowTexel:this.shared.uShadowTexel,uShadowArea:this.shared.uShadowArea,...this.marks.post}}),this.postScene.add(new ut(new re(2,2),this.post)),this.silhouettes.visible=!1,this.scene.add(this.silhouettes),this.pools.hook(this.scene),this.debris=this.add(_s(),`debris`,{castShadow:!1})}setWind(e,t,n){this.wind.set(e,t,n),this.windField.set(e,t,n);let r=this.weather;this.dust.storm=r.dust*G.smoothstep(r.haze,0,.1)*Math.min(1,.5+r.haze/.5),this.dust.set(e,t,n),this.windNow=[e,t,n]}restartWind(){this.wind.restart(),this.trees.restart(),this.dust.restart()}setTime(e){this.shared.uTime.value=e}setDustSource(e){this.dust.setSource(e)}setWeather(e,t=!1){this.weather.set(e,t)}strike(e){let t=(this.land??=pp.from(this.scene))??pp.FLAT;this.lightning.strike(e,(e,n)=>t.at(e,n),this.view.target,this.view.heading)}flicker(e){this.lightning.flicker(e)}material(e){let t=this.materials.get(e);return t||(t={main:Il(e,this.shared),depth:zl(e,this.shared),prepass:Ll(e,this.shared),mirrorPrepass:Ll(e,this.shared,!0)},e===`water`&&Object.assign(t.main.uniforms,this.shelter.uniforms,this.rain.uniforms),this.materials.set(e,t)),t.main}add(e,t,n={}){if(n.tile&&t!==`water`){let r=e.getAttribute(`color`),i=r&&this.ownColours.get(r),a=i&&Float32Array.from(r.array);i&&r.array.set(i);let o=ta(e,n.tile);a&&r.array.set(a);let s=o.map(e=>this.addOne(e,t,n,!0));s[0].userData.tiles=s;for(let t of s)t.userData.cut=t.geometry!==e;return s[0]}return n.cull&&t!==`water`?this.addOne(na(e),t,n,!0):this.addOne(e,t,n,!1)}addOne(e,t,n,r){let i=e.userData.trees,a=e.getAttribute(`aTreeId`);if(i?.length&&a){let t=this.trees.add(i),n=a.array;for(let e=0;e<n.length;e++)n[e]=n[e]<0?-1:t[n[e]];e.userData.trees=void 0,e.userData.springs=new Set(t)}let o=e.userData.parts;o?.size&&(this.parts.hold(o),this.parts.sweep(e),this.shared.tPartPose.value=this.parts.texture);let s=n.seasonal??(t===`ground`||t===`grass`),c=e.getAttribute(`color`);t===`ground`&&c&&!e.getAttribute(`aEarth`)&&e.setAttribute(`aEarth`,new U(jc(this.ownColours.get(c)??c.array),1)),s&&this.seasonal.set(e,(this.seasonal.get(e)??0)+1),this.turn(e);let l=new ut(e,this.material(t));l.userData.seasonal=s,l.frustumCulled=r,l.userData.kind=t,l.userData.under=n.under??!1,l.userData.reflect=n.reflect??t!==`water`,l.userData.fields=n.fields,l.userData.cover=n.cover??(t===`ink`?`full`:t===`foliage`?`partial`:`none`),n.tag!==void 0&&(l.userData.tag=n.tag,this.tagged.add(l));let u=l.userData.cover;u!==`none`&&t!==`ground`&&this.shelter.add(l,u),this.scene.add(l),t===`ground`&&this.groundMoved(null),(n.castShadow??t!==`water`)&&this.casters.add(l);let d=new ut(e,this.materials.get(t).prepass);return d.frustumCulled=r,d.renderOrder=-1,d.matrixAutoUpdate=!1,d.matrixWorldAutoUpdate=!1,this.silhouettes.add(d),this.twins.set(l,d),t!==`water`&&this.pools.add(e),l}remove(e){let t=e.userData.tiles;if(t){for(let e of t)e.userData.tiles=void 0,this.remove(e);return}this.scene.remove(e),this.tagged.delete(e),this.marks.forget(e);let n=e.geometry.userData.springs;n&&(this.trees.release(n),e.geometry.userData.springs=void 0);let r=e.geometry.userData.parts;r?.size&&this.parts.release(r),this.pools.remove(e.geometry,!e.userData.cut),e.userData.cut&&e.geometry.dispose(),e.userData.seasonal&&this.unseason(e.geometry),this.casters.delete(e);let i=this.twins.get(e);i&&(this.silhouettes.remove(i),this.twins.delete(e));let a=e.userData.cover;a!==`none`&&e.userData.kind!==`ground`&&this.shelter.remove(e,a),e.userData.kind===`ground`&&this.groundMoved(null)}removeTrees(e,t){return this.changeTrees(e,t.map(([e,t])=>({x:e,z:t,dy:0})),!0)}moveTrees(e,t){return this.changeTrees(e,t,!1)}changeTrees(e,t,n){let r=new Map;for(let e of t)for(let t of this.trees.at(e.x,e.z))r.set(t,e.dy);if(!r.size)return 0;let i=new Set,a=new q,o=new w;for(let t of e)for(let e of t.userData.tiles??[t]){let t=e.geometry,s=t.userData.springs,c=s?[...r.keys()].filter(e=>s.has(e)):[];if(!c.length)continue;let u=t.getAttribute(`position`),d=t.getAttribute(`aTreeId`),f=-1,p=-1;a.makeEmpty();for(let e=0;e<d.count;e++){let t=d.getX(e),s=r.get(t);s!==void 0&&(a.expandByPoint(o.fromBufferAttribute(u,e)),n||(u.setY(e,u.getY(e)+s),a.expandByPoint(o.fromBufferAttribute(u,e))),i.add(t),f<0&&(f=e),p=e)}if(n){for(let e of c)s.delete(e);this.trees.release(c)}if(f<0)continue;if(n){let e=t.getIndex(),n=-1,i=-1;if(e)for(let t=0;t<e.count;t+=3){let a=e.getX(t);r.has(d.getX(a))&&(e.setX(t+1,a),e.setX(t+2,a),n<0&&(n=t),i=t+3)}n>=0&&(e.addUpdateRange(n,i-n),e.needsUpdate=!0)}else u.addUpdateRange(f*3,(p-f+1)*3),u.needsUpdate=!0,t.boundingBox?.union(a),t.boundingSphere?.union(a.getBoundingSphere(new l));let m=e.userData.cover;m!==`none`&&(e.updateMatrixWorld(),this.shelter.changedIn(m,a.applyMatrix4(e.matrixWorld)))}return i.size}changeGround(e,t){let n=this.groundChange;this.groundChange=n??{area:new q};let r=this.groundChange.area;r&&(e?r.union(e):this.groundChange.area=null);try{t()}finally{if(!n){let{area:e}=this.groundChange;this.groundChange=null,this.groundMoved(e,!0)}}}prepare(e){let t=e.getAttribute(`color`);t&&!e.getAttribute(`aEarth`)&&e.setAttribute(`aEarth`,new U(jc(this.ownColours.get(t)??t.array),1)),t&&this.turnColour(t),e.computeBoundingBox()}bakeGround(e){let t=this.fields.get(`ground`),n=this.materials.get(`ground`)?.main;if(!t||!n)return;let r=n.uniforms.uFieldsMap.value,i=t.width,a=null,o=new be;if(e){let t=new be,n=new w;for(let i of[e.min.x,e.max.x])for(let a of[e.min.z,e.max.z])n.set(i,a,1).applyMatrix3(r),t.expandByPoint(new _(n.x,n.y));let s=Math.max(0,Math.floor(t.min.x*i)-2),c=Math.max(0,Math.floor(t.min.y*i)-2),l=Math.min(i,Math.ceil(t.max.x*i)+2),u=Math.min(i,Math.ceil(t.max.y*i)+2);if(l<=s||u<=c)return;a=new J(s,c,l-s,u-c);let d=r.clone().invert();for(let e of[s,l])for(let t of[c,u])n.set(e/i,t/i,1).applyMatrix3(d),o.expandByPoint(new _(n.x,n.y))}let s=this.groundBaker??=Hl(this.shared,r);s.uniforms.uFieldsMap.value=r;let c=new L,l=new q;this.pools.hook(c);for(let t of this.scene.children){let n=t;if(t.userData.kind!==`ground`||!t.userData.fields||!n.isMesh||(t.updateMatrixWorld(),e&&(n.geometry.boundingBox||n.geometry.computeBoundingBox(),l.copy(n.geometry.boundingBox).applyMatrix4(t.matrixWorld),l.max.x<o.min.x||l.min.x>o.max.x||l.max.z<o.min.y||l.min.z>o.max.y)))continue;let r=new ut(n.geometry,s);r.frustumCulled=!1,r.matrixWorld.copy(t.matrixWorld),r.matrixAutoUpdate=!1,r.matrixWorldAutoUpdate=!1,c.add(r)}t.scissorTest=a!==null,a&&t.scissor.copy(a),this.gl.setRenderTarget(t),this.gl.setClearColor(8421504,1),this.gl.clear(!0,!1,!1),this.gl.render(c,this.postCamera),t.scissorTest=!1,this.gl.setRenderTarget(null)}groundBaker=null;groundChange=null;groundMoved(e,t=!1){(!this.groundChange||t)&&(this.measureGround(),e?(this.shelter.changedIn(`land`,e),this.hollows.changedIn(e)):(this.shelter.changed(),this.hollows.changed()),this.cloudArea=!1,this.land=e&&this.land?this.land.refresh(this.scene,e):null,this.bakeGround(e))}rebakeFields(){for(let[e,t]of[...this.fieldSizes])this.setFields(e,t)}setFields(e,t){t>0?this.fieldSizes.set(e,t):this.fieldSizes.delete(e);let n=this.materials.get(e)?.main;if(this.fields.get(e)?.dispose(),this.fields.delete(e),e===`ground`&&(this.groundBaker?.dispose(),this.groundBaker=null),!n)return!1;delete n.defines.FIELDS,delete n.defines.BASIS,n.needsUpdate=!0;let r=this.scene.children.filter(t=>t.userData.kind===e),i=this.scene.children.find(e=>e.userData.kind===`ground`&&e.userData.fields),a=i?.userData.fields;if(t<=0||!i||!a)return!1;let o=Math.cos(a.turn)/a.side,s=Math.sin(a.turn)/a.side,c=new B().set(o,-s,.5-o*a.x+s*a.z,s,o,.5-s*a.x-o*a.z,0,0,1),l={type:E,format:j,depthBuffer:!1,minFilter:de,magFilter:de,generateMipmaps:!1},u=new L,d=(e,t=0)=>{this.gl.setRenderTarget(e,t),this.gl.setClearColor(8421504,1),this.gl.clear(!0,!1,!1),this.gl.render(u,this.postCamera)},f;if(e!==`ground`){let e=[...new Set(r.flatMap(e=>{let t=e.geometry.getAttribute(`aPaint`);return Array.from({length:t.count},(e,n)=>t.getY(n))}))];if(e.length===0||e.length>8)return!1;f=new me(t,t,e.length*7,l);let i=new ut(new re(2,2));i.frustumCulled=!1,u.add(i);let a=c.clone().invert();e.forEach((e,t)=>{for(let n=0;n<7;n++){let r=Gl(this.shared,a,e,n);i.material=r,d(f,t*7+n),r.dispose()}}),i.geometry.dispose(),n.uniforms.uBasis={value:f.texture},n.uniforms.uBasisScales={value:e},n.defines.BASIS=e.length}else f=new ee(t,t,l),n.uniforms.uFields={value:f.texture},n.defines.FIELDS=1;return this.gl.setRenderTarget(null),this.fields.set(e,f),n.uniforms.uFieldsMap={value:c},e===`ground`&&this.bakeGround(null),!0}paintOver(e,t){for(let[n,r]of this.materials)r.main.depthWrite=!e,r.main.depthFunc=e&&t(n)?4:3}setVisible(e,t){if(e===`rain`){this.rainShown=t;return}if(e===`snow`){this.snowShown=t;return}if(e===`water`){this.waterShown=t,this.waterMesh&&(this.waterMesh.visible=t&&this.water.any);return}for(let n of this.scene.children)n.userData.kind===e&&n.visible!==t&&(n.visible=t,(n.userData.cover!==`none`||e===`ground`)&&this.shelter.changed())}setWater(e,t=Eo){let n=this.water.geometry;this.waterMap=e,this.water.set(e,this.shared.uTime.value,t);let r=this.shared;r.tWaterA.value=this.water.a,r.tWaterB.value=this.water.b,r.uWaterGrid.value.copy(this.water.grid),r.tIceA.value=this.water.iceA,r.tIceB.value=this.water.iceB,r.uIceOn.value=+!!this.water.iced,(this.water.geometry!==n||!this.waterMesh)&&(this.waterMesh&&this.remove(this.waterMesh),this.waterMesh=this.water.geometry?this.add(this.water.geometry,`water`):null),this.waterMesh&&(this.waterMesh.visible=this.water.any&&this.waterShown),this.measureGround()}waterShown=!0;setLand(e,t=yf){this.painted?.dispose(),this.painted=new Af(this,e,t),this.painted.onSwap=e=>{for(let t of this.landChanged)t(e)},this.landsSet++;let n=this.landArea,r={x0:e.x0,z0:e.z0,x1:e.x0+e.width*e.tile,z1:e.z0+e.height*e.tile};this.landArea=r;let i=n?{x0:Math.min(n.x0,r.x0),z0:Math.min(n.z0,r.z0),x1:Math.max(n.x1,r.x1),z1:Math.max(n.z1,r.z1)}:r;for(let e of this.landChanged)e(i)}landArea=null;painted=null;landsSet=0;get landRevision(){return`${this.landsSet} ${this.painted?.revision??0}`}landChanged=new Set;onLandChange(e){return this.landChanged.add(e),()=>{this.landChanged.delete(e)}}updateLand(e,t){return this.painted?.update(e,t)??0}landAt(e,t){return this.painted?.heightAt(e,t)??0}get landAhead(){return this.painted?.ahead??!1}landColourAt(e,t,n=new W){return this.painted?this.painted.landColourAt(e,t,n):n.setHex(5937224)}bedAt(e,t){return this.painted?.bedAt(e,t)??0}landHit(e,t){return this.painted?.hit(e,t)??null}setGround(e,t=nc){this.ground.set(e,this.shared.uTime.value,t)}measureGround(){let e=this.water.floor===null?1/0:this.water.floor-1,t=-1/0;for(let n of this.scene.children){if(n.userData.kind!==`ground`)continue;let r=n.geometry;r.boundingBox||r.computeBoundingBox(),e=Math.min(e,r.boundingBox.min.y),t=Math.max(t,r.boundingBox.max.y)}Number.isFinite(e)&&this.weather.setGround(e-.5),this.view.landTop=t}setOverlay(e){this.groundTools.setOverlay(e)}setOverlayLook(e=Fc){this.groundTools.setLook(e)}setGrid(e){this.groundTools.setGrid(e)}setLines(e,t=`lines`){this.onTop.setLines(e,t)}addPreview(e,t){return this.onTop.addPreview(e,t)}setPreviewLook(e=Vf){this.onTop.setLook(e)}setPreview(e,t){this.onTop.setPreview(e,t)}removePreview(e){this.onTop.removePreview(e)}setMark(e,t){this.marks.set(e,t)}setHighlightLook(e=Zu){this.marks.setLook(e,this.pixelRatio)}pick(e,t){let n=this.pickAt(e,t);return n?(this.picker.copy(this.gl,this.gbuffer.textures[1],n.x,n.y,this.height),this.picker.hit(this.picker.read(this.gl),this.drawnCamera,n.ndc,n.px)):null}async requestPick(e,t){let n=this.pickAt(e,t);if(!n)return null;this.picker.copy(this.gl,this.gbuffer.textures[1],n.x,n.y,this.height);let r=this.drawnCamera.clone(),i=this.picker.snapshot(),a=this.parts.pose().slice();return this.picker.hit(await this.picker.readAsync(this.gl),r,n.ndc,n.px,i,a)}pickAt(e,t){if(!this.drawn)return null;let n=this.canvas.getBoundingClientRect(),r=(e-n.left)/n.width,i=(t-n.top)/n.height;if(!(r>=0&&r<1&&i>=0&&i<1))return null;let a=Math.floor(r*this.width),o=Math.floor(i*this.height);return{x:a,y:o,ndc:new _((a+.5)/this.width*2-1,1-(o+.5)/this.height*2),px:new _(2/this.width,2/this.height)}}waterAt(e,t){let n=this.waterMap;if(!n)return null;let r=Math.floor((e-n.x0)/n.cell),i=Math.floor((t-n.z0)/n.cell);if(r<0||i<0||r>=n.nx||i>=n.nz)return null;let a=n.level[i*n.nx+r];return Number.isFinite(a)?a:null}resize(e,t){this.pixelRatio=Math.min(this.screenRatio,this.maxRatio,Math.sqrt(this.maxPixels/Math.max(1,e*t))),this.gl.setPixelRatio(this.pixelRatio),this.gl.setSize(e,t,!1),this.view.screen.width=e,this.view.screen.height=t,this.width=this.canvas.width,this.height=this.canvas.height,this.gbuffer.setSize(this.width,this.height);let n=Math.max(1,Math.round(this.width/2)),r=Math.max(1,Math.round(this.height/2));this.underTarget.setSize(n,r);let i=this.reflectionScale;this.reflectTarget.setSize(Math.max(1,Math.round(n*i)),Math.max(1,Math.round(r*i))),this.marks.setSize(this.width,this.height,this.pixelRatio),this.onTop.setSize(this.width,this.height),this.shared.uScreen.value.set(this.width,this.height),this.post.uniforms.uResolution.value.set(this.width,this.height)}setMaxRatio(e){if(e===this.maxRatio)return;this.maxRatio=e;let{width:t,height:n}=this.view.screen;t>0&&n>0&&this.resize(t,n)}setReflectionScale(e){if(e===this.reflectionScale)return;this.reflectionScale=e;let{width:t,height:n}=this.view.screen;t>0&&n>0&&this.resize(t,n)}get quality(){return{samples:this.gbuffer.samples,shadowMapSize:this.shadowTarget.width,shadowCap:this.shadowCap,shelterSize:this.shelter.size,maxPixels:this.maxPixels,reflectionScale:this.reflectionScale}}setQuality(e){cp(e.shadowCap);let t=this.quality;if(e.samples!==t.samples&&(this.gbuffer.samples=e.samples,this.gbuffer.dispose()),e.shadowMapSize!==t.shadowMapSize&&(this.shadowTarget.setSize(e.shadowMapSize,e.shadowMapSize),this.shared.uShadowTexel.value.set(1/e.shadowMapSize,1/e.shadowMapSize)),(e.shadowMapSize!==t.shadowMapSize||e.shadowCap!==t.shadowCap)&&(this.shadowPitch=[0,0],this.flashShadowPitch=[0,0]),this.shadowCap=e.shadowCap,this.shelter.resize(e.shelterSize),e.maxPixels!==t.maxPixels||e.reflectionScale!==t.reflectionScale){this.maxPixels=e.maxPixels,this.reflectionScale=e.reflectionScale;let{width:t,height:n}=this.view.screen;t>0&&n>0&&this.resize(t,n)}}setLook(e){this.look=e}setSeason(e){this.seasonSet=e&&{...e},this.dayNow=e?Na(e):Da;for(let e of this.seasonal.keys())this.turn(e);vs(this.debris.geometry,e?co[e.season]:null)}unseason(e){let t=this.seasonal.get(e);if(t===void 0)return;if(t>1){this.seasonal.set(e,t-1);return}this.seasonal.delete(e);let n=e.getAttribute(`color`),r=n&&this.ownColours.get(n);if(n&&r){for(let e of this.seasonal.keys())if(e.getAttribute(`color`)===n)return;n.array.set(r),n.needsUpdate=!0,this.ownColours.delete(n),this.turnedFor.delete(n)}}turn(e){if(!this.seasonal.has(e))return;let t=e.getAttribute(`color`);t&&this.turnColour(t)}turnColour(e){if(this.turnedFor.has(e)&&this.turnedFor.get(e)===this.seasonSet)return;let t=eo(this.seasonSet),n=this.ownColours.get(e);(n||t.shift!==0||t.chroma!==1||t.light!==0)&&(n||this.ownColours.set(e,n=Float32Array.from(e.array)),io(n,e.array,t),e.needsUpdate=!0,this.turnedFor.set(e,this.seasonSet))}get season(){return this.seasonSet&&{...this.seasonSet}}get day(){return this.dayNow}setHour(e){this.look=so(qa(e,this.dayNow),this.seasonSet),this.clockHour=e}applyLook(e){let t=this.weather.overcast,n=lo,r=G.smoothstep(e.sunEl,-8,6);this.nightLights.update(this.shared,this.parts,e.night,this.shared.uViewTarget.value);let i=r*G.lerp(1,bo,e.night),a=G.lerp(t,vo(t),i),o=this.weather,s=e=>hd(e,o,cd),c=o.storm,l=(e,t)=>wd(e,c*t),u=Pd(o.sunUnder,e,t,c)*i,d=kd(e,c),f=(e,t)=>Id(e,d,Ad,u*t),p=l(So(e,t,n),t),m=s({...p,hazeColor:f(p,t).hazeColor}),h=s(f(l(So(e,a,n),a),a)),g=s(f(l(So(e,1,n),1),1)),_=this.shared,v=Fd(n,Ad,u),y=_o(a),b=y*v.shadowLift;_.uOvercast.value.set(y*v.sky,y*v.shadowFade,y*v.shadowBlur),_.uCloudOvercast.value.set(v.sky,G.lerp(G.lerp(yo,n.shadowFade,b),v.shadowFade,u),v.shadowBlur),_.uCloudStrength.value=i;let x=G.degToRad(h.sunAz),S=G.degToRad(Math.max(h.sunEl,4));this.sunElNow=h.sunEl,_.uSunDir.value.set(Math.cos(x)*Math.cos(S),Math.sin(S),Math.sin(x)*Math.cos(S)).normalize(),this.shadowDir.copy(_.uSunDir.value),b>0&&this.shadowDir.lerp(new w(0,1,0),b).normalize(),_.uSunColor.value.copy(h.sunColor).lerp(h.skyColor,1-r),_.uCloudSunColor.value.copy(g.sunColor).lerp(g.skyColor,1-r),_.uSkyColor.value.copy(h.skyColor),_.uRimColor.value.copy(h.rimColor).multiplyScalar(r),_.uCloudRimColor.value.copy(g.rimColor).multiplyScalar(r);let C=G.degToRad;_.uShadeHue.value=C(h.shadeHue),_.uShadeLean.value=h.shadeLean,_.uShadeDepth.value=h.shadeDepth,_.uLitHue.value=C(h.litHue),_.uLitLean.value=h.litLean,_.uLightExposure.value=h.exposure/m.exposure;let T=G.lerp(xo,1,a);_.uCloudBands.value.set(C((g.shadeHue-h.shadeHue+540)%360-180),g.shadeDepth,g.litLean,g.exposure*T/m.exposure),c>0?_.uCloudTint.value.set(C((g.litHue-h.litHue+540)%360-180),g.shadeLean-h.shadeLean):_.uCloudTint.value.set(0,0),this.snow.update({shadeHue:h.shadeHue,litHue:h.litHue,sky:_.uOvercast.value.x,sunColor:_.uSunColor.value,skyColor:h.skyColor},{shadeHue:h.shadeHue+_.uCloudBands.value.x*180/Math.PI,litHue:h.litHue+_.uCloudTint.value.x*180/Math.PI,sky:_.uCloudOvercast.value.x,sunColor:_.uCloudSunColor.value,skyColor:h.skyColor});let E=this.post.uniforms;E.uHazeColor.value.copy(m.hazeColor),E.uHazeDensity.value=m.hazeDensity,E.uHazeMax.value=m.hazeMax,E.uHazeFloor.value=m.hazeFloor,E.uSkyTop.value.copy(m.skyTop),E.uSkyBottom.value.copy(m.skyBottom),_.uSkyTop.value.copy(m.skyTop),_.uSkyBottom.value.copy(m.skyBottom),_.uGapSkyTop.value.copy(h.skyTop),_.uGapSkyBottom.value.copy(h.skyBottom),_.uCloudBelly.value.copy(g.skyTop).lerp(g.skyBottom,.25),u>0&&_.uCloudBelly.value.multiplyScalar(s(l(So(e,a,n),a)).exposure/h.exposure);let D=e.sunColor,O=new W(1,1,1).lerp(D.clone().multiplyScalar(1/Math.max(D.r,D.g,D.b,.001)),.85);_.uCloudLit.value.copy(h.skyBottom).lerp(O,.7*G.lerp(.15,1,r)),_.uSkyClosed.value=a,E.uVignette.value=G.lerp(gd,_d.vignette,c*t),E.uExposure.value=m.exposure,E.uSaturation.value=m.saturation,E.uNightShift.value=m.nightShift,E.uShadeHue.value=C(m.shadeHue),this.lightning.light(_),this.lightning.aiming&&this.shadowDir.copy(this.lightning.boltLight),this.applyFog(),E.uShimmer.value.set(md(h,o.heat)*cd.shimmer,this.shared.uTime.value),this.updateSunCamera()}applyFog(){let e=this.weather,t=this.wind,n=this.post.uniforms,r=this.shared;Cs(n.uFogColor.value,e.hazeColor,r.uSunColor.value,r.uSkyColor.value);let i=G.lerp(1/(1+Math.max(0,t.speed-5)/20),1,e.dust),a=Math.max(e.hazeBase,this.water.floor??e.hazeTop-4);n.uFog.value.set(e.haze*i,e.hazeBase,e.hazeTop,Math.max(.5,.7*(e.hazeTop-a)));let o=t.haze,s=t.hazeNext??o;n.uFogFrame.value.set(o.hx,o.hz,o.stretch,o.drift),n.uFogNext.value.set(s.hx,s.hz,s.stretch,s.drift),n.uFogFade.value=t.hazeNext?t.hazeFade:0,n.uFogStreak.value.set(o.streak,s.streak),n.uDust.value.set(e.dust,.25+.5*Math.min(t.speed/25,1),ap);let c=this.dust;n.tDustA.value=c.a,n.tDustB.value=c.b,n.uDustBlend.value=c.blend,n.uDustOn.value=+!!c.any,n.uDustReach.value=c.look.top+.5,Cs(n.uDustColor.value,op.clone().lerp(e.hazeColor,e.dust),r.uSunColor.value,r.uSkyColor.value),this.rain.setVeilColor((e,t)=>Cs(e,t,r.uSunColor.value,r.uSkyColor.value)),this.snowfall.setVeilColor((e,t)=>Cs(e,t,r.uSunColor.value,r.uSkyColor.value))}updateSunCamera(){let e=this.sunCamera,t=this.shared.uSunDir.value;if(e.up.set(-t.x,0,-t.z),e.up.lengthSq()<1e-6&&e.up.set(0,0,1),e.near=1,e.far=300,this.shadowFollow){let t=this.view.target,n=this.shadowDir;e.position.copy(n).multiplyScalar(n.dot(t)+150),e.lookAt(e.position.clone().sub(n)),e.updateMatrixWorld(),this.followView()}else{let t=this.shadowRadius;e.left=-t,e.right=t,e.top=t,e.bottom=-t,e.position.copy(this.shadowCenter).addScaledVector(this.shadowDir,150),e.lookAt(this.shadowCenter),this.drawShadowInto(this.shadowTarget.width,this.shadowTarget.height)}e.updateProjectionMatrix(),e.updateMatrixWorld();let n=new $e().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);this.shared.uShadowMatrix.value.copy(n).multiply(e.projectionMatrix).multiply(e.matrixWorldInverse),this.shadowDirty=!0}shadowDirty=!0;followView(){let e=this.sunCamera,t=this.view.camera;t.updateMatrixWorld();let n=(this.land??=pp.from(this.scene))??pp.FLAT,r=e.matrixWorldInverse,i=new w(0,0,-1).transformDirection(t.matrixWorld),a=1/0,o=-1/0,s=1/0,c=-1/0,l=new w,u=new w,d=()=>{l.applyMatrix4(r),a=Math.min(a,l.x),o=Math.max(o,l.x),s=Math.min(s,l.y),c=Math.max(c,l.y)};for(let e=0;e<=8;e++)for(let r=0;r<=8;r++){u.set(G.lerp(t.left,t.right,e/8),G.lerp(t.bottom,t.top,r/8),0).applyMatrix4(t.matrixWorld);let a=n.trace(u,i);l.copy(u).addScaledVector(i,a),d(),l.copy(u).addScaledVector(i,a+pp.TALL/i.y),d()}let f=(e,t)=>t>e||t<e-16?Math.ceil(t/8)*8:e,p=this.lightning.aiming,m=p?this.flashShadowSize:this.shadowSize,h=p?this.flashShadowPitch:this.shadowPitch;p||(this.flashShadowSize=[0,0],this.flashShadowPitch=[0,0]);let g=m[0]=f(m[0],o-a+6),_=m[1]=f(m[1],c-s+6),v=this.view.zoom/this.screenRatio,y=this.shadowZooming,b=this.shadowTexels(g,this.shadowTarget.width,sp.across*v,y?h[0]:0),x=this.shadowTexels(_,this.shadowTarget.height,sp.up*v,y?h[1]:0);h[0]=b.capped?b.pitch:0,h[1]=x.capped?x.pitch:0,e.left=Math.round(((a+o)/2-g/2)/b.pitch)*b.pitch,e.right=e.left+b.size,e.bottom=Math.round(((s+c)/2-_/2)/x.pitch)*x.pitch,e.top=e.bottom+x.size,this.drawShadowInto(b.texels,x.texels)}shadowTexels(e,t,n,r){let i=n*this.shadowCap;if(Number.isFinite(i)){let n=2**(Math.floor(Math.log2(1/i)*16)/16);for(let i of r&&Math.abs(Math.log2(r/n))<=.5?[r,n]:[n]){let n=Math.ceil(e/i);if(n<t)return{texels:n,pitch:i,size:n*i,capped:!0}}}return{texels:t,pitch:e/t,size:e,capped:!1}}drawShadowInto(e,t){let n=this.shadowTarget;n.viewport.set(0,0,e,t),this.shared.uShadowArea.value.set(e/n.width,t/n.height)}land=null;shadowSize=[0,0];flashShadowSize=[0,0];shadowZoom=NaN;shadowZooming=!0;shadowPitch=[0,0];flashShadowPitch=[0,0];shadowDir=new w(0,1,0);drawOnly(e,t,n,r=null,i=!1){let a=[];for(let e of this.scene.children){if(!e.visible)continue;if(!t(e)){e.visible=!1,a.push(e);continue}if(!r||!e.isMesh||this.reaches(e,r,i))continue;e.visible=!1,a.push(e);let n=this.twins.get(e);n?.visible&&(n.visible=!1,a.push(n))}if(e.scissorTest=n!==null,n&&e.scissor.copy(n),this.gl.setRenderTarget(e),r&&!r.full){let e=this.gl.state.buffers.depth;e.setClear(0),this.gl.clear(!0,!0,!1),e.setClear(1),this.gl.render(r.scene,this.view.camera)}else this.gl.clear(!0,!0,!1);this.gl.render(this.scene,this.view.camera);for(let e of a)e.visible=!0}reachCentre=new w;reaches(e,t,n){if(!dp.has(e.userData.kind))return!0;let r=e.geometry;r.boundingSphere||r.computeBoundingSphere();let i=r.boundingSphere;if(!Number.isFinite(i.radius))return!0;let a=this.reachCentre.copy(i.center).applyMatrix4(e.matrixWorld);n&&(a.y=2*this.water.mirror-a.y);let o=i.radius*Math.max(1,e.matrixWorld.getMaxScaleOnAxis())+(e.frustumCulled?0:5),s=this.maskMatrix.elements,c=s[0]*a.x+s[4]*a.y+s[8]*a.z+s[12],l=s[1]*a.x+s[5]*a.y+s[9]*a.z+s[13];return t.touches(c-o*this.maskScale.x,l-o*this.maskScale.y,c+o*this.maskScale.x,l+o*this.maskScale.y)}underMask=new qd;reflectMask=new qd;maskMatrix=new $e;maskScale=new _;maskScissor=[new J,new J];buildMasks(e){let t=this.view.camera,n=this.waterMesh?.visible?this.water.footprint(this.shared.uWaterBlend.value>=1):null,r=this.maskMatrix.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse).elements;this.maskScale.set(Math.hypot(r[0],r[4],r[8]),Math.hypot(r[1],r[5],r[9]));let i=new Float32Array,a=(e,t,a,o,s)=>{let c=t+a/this.width+2/e.width,l=t+a/this.height+2/e.height;o.build(n??i,r,2*c,2*l,s,1/e.width,1/e.height)};a(this.underTarget,e,0,this.underMask,null),a(this.reflectTarget,e*xl.reflectNudge,xl.blurPx*xl.coverWide,this.reflectMask,this.water.mirror)}mirrorShift(){let e=this.water,t=2*Math.max(e.wetHigh-e.mirror,e.mirror-e.shownLow,0),n=this.view.camera,r=new $e().multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse).elements;return new _(r[4]*t*.5,r[5]*t*.5)}waterBox=new be;corner=new w;waterOnScreen(){let e=this.waterBox.makeEmpty(),t=this.corner;for(let n of this.scene.children){if(!n.visible||n.userData.kind!==`water`)continue;let r=n;r.geometry.boundingBox||r.geometry.computeBoundingBox();let i=r.geometry.boundingBox;for(let n=0;n<8;n++)t.set(n&1?i.max.x:i.min.x,n&2?i.max.y:i.min.y,n&4?i.max.z:i.min.z),t.applyMatrix4(r.matrixWorld).project(this.view.camera),e.expandByPoint(new _(t.x,t.y))}return e.isEmpty()||e.max.x<-1||e.min.x>1||e.max.y<-1||e.min.y>1?null:e}waterRect(e,t,n,r,i=new _){if(!this.settings.waterScissor)return null;let a=t.width,o=t.height,s=n+Math.abs(i.x)+r/this.width,c=n+Math.abs(i.y)+r/this.height,l=Math.max(0,Math.floor(((e.min.x+1)/2-s)*a)-2),u=Math.max(0,Math.floor(((e.min.y+1)/2-c)*o)-2),d=Math.min(a,Math.ceil(((e.max.x+1)/2+s)*a)+2),f=Math.min(o,Math.ceil(((e.max.y+1)/2+c)*o)+2);return new J(l,u,d-l,f-u)}drawShelter(){let e=this.scene.children.filter(e=>e.isMesh&&e.userData.cover!==void 0).map(e=>({mesh:e,cover:e.userData.kind===`ground`?`land`:e.userData.cover,depth:this.materials.get(e.userData.kind).depth})),t=this.shared;this.shelter.draw(this.gl,this.scene,e,this.groundSquare(),()=>{let e=[t.uTime.value,t.uWindSpeed.value,t.uWindOn.value,t.uWindFlutter.value,t.uWindDir.value.clone(),t.uWindDrift.value.clone(),t.uViewBack.value.clone()];return t.uTime.value=0,t.uWindSpeed.value=0,t.uWindOn.value=0,t.uWindFlutter.value=0,t.uWindDir.value.set(1,0),t.uWindDrift.value.set(0,0),t.uViewBack.value.set(0,1,0),t.uPartsRest.value=1,()=>{t.uPartsRest.value=0,[t.uTime.value,t.uWindSpeed.value,t.uWindOn.value,t.uWindFlutter.value]=e,t.uWindDir.value.copy(e[4]),t.uWindDrift.value.copy(e[5]),t.uViewBack.value.copy(e[6])}})}groundSquare(){let e=this.scene.children.filter(e=>e.isMesh&&e.userData.kind===`ground`),t=e.find(e=>e.userData.fields)?.userData.fields;if(t||!e.length)return t??null;let n=new q;for(let t of e)n.expandByObject(t);let r=n.getCenter(new w),i=n.getSize(new w);return{x:r.x,z:r.z,side:Math.max(i.x,i.z),turn:0}}drawHollows(){let e=this.scene.children.filter(e=>e.isMesh&&e.userData.kind===`ground`&&e.visible),t=this.materials.get(`ground`)?.depth;t&&this.hollows.draw(this.gl,this.scene,e,t,this.groundSquare(),this.shelter.uniforms)}drawClouds(){if(!this.cloudArea){let e=this.scene.children.find(e=>e.userData.kind===`ground`&&e.userData.fields)?.userData.fields,t=e?e.side/2*(Math.abs(Math.cos(e.turn))+Math.abs(Math.sin(e.turn)))+2:64;this.cloudMap.setArea((e?.x??0)-t,(e?.z??0)-t,2*t),this.shared.uLandSquare.value.set(e?.x??0,e?.z??0,e?e.side/2:0,e?.turn??0);let n=t+va.height/va.rise;this.skyMap.setArea((e?.x??0)-n,(e?.z??0)-n,2*n),this.cloudArea=!!e}this.cloudMap.draw(this.gl,this.weather.clouds,this.cloudShape),this.skyMap.draw(this.gl,this.weather.clouds,this.cloudShape)}cloudArea=!1;windNowVector=new _;lightningCompiled=!1;render(e){if(!this.look)throw Error(`setHour (or setLook) before render`);let t=this.view.zoom/this.screenRatio;this.shadowZooming=t!==this.shadowZoom,this.shadowZoom=t;let n=this.timer;n?.mark(`setup`,!1);let r=this.shared,i=this.wind;r.uTime.value=e,i.carried=this.weather.dust,i.update(e),r.uWindDir.value.set(i.dirX,i.dirZ),r.uWindSpeed.value=i.speed,r.uWindDrift.value.set(i.driftX,i.driftZ);let a=this.windField;r.tWindA.value=a.a,r.tWindB.value=a.b,r.tWindUsual.value=a.usual,r.uWindBlend.value=a.blend,r.uWindGrid.value.copy(a.grid),this.trees.update(e,this.windNow,i.gust),r.tTreePose.value=this.trees.texture,this.parts.update(e),r.tPartPose.value=this.parts.texture,r.uWindFlutter.value=i.flutter,this.weather.update(e),r.uWaterBlend.value=this.water.blend(e),this.water.settle(e)&&this.waterMesh&&(this.waterMesh.visible=!1),r.uIceOn.value=+!!this.water.iced,r.uMirrorY.value=this.water.mirror,r.uWaterHigh.value=this.water.any?this.water.wetHigh:-1e6,this.ground.update(e),this.painted?.step(),this.land??=pp.from(this.scene),this.lightningCompiled||=(this.lightning.precompile(this.gl,this.view.camera),!0);let o=(this.view.camera.right+this.view.camera.top*2)/2;this.lightning.update(this.view.target,this.view.zoom,o,this.width,this.height,this.gbuffer.textures[1]),this.applyLook(this.look);let s=[];if(!this.settings.falling)for(let e of this.scene.children)e.visible&&lp.includes(e.userData.kind)&&(e.visible=!1,s.push(e));let c=this.screenRatio/this.pixelRatio;this.view.apply(this.width*c,this.height*c),r.uViewBack.value.copy(this.view.backward()),r.uViewTarget.value.copy(this.view.target),this.post.uniforms.uTargetDepth.value=this.view.distance,this.shadowFollow&&this.updateSunCamera();let l=this.view.camera,u=this.post.uniforms;u.uCamPos.value.copy(l.position),u.uCamRight.value.setFromMatrixColumn(l.matrixWorld,0).multiplyScalar(l.right),u.uCamUp.value.setFromMatrixColumn(l.matrixWorld,1).multiplyScalar(l.top),u.uCamFwd.value.setFromMatrixColumn(l.matrixWorld,2).negate(),this.rain.update(e,this.weather.rain,this.view.zoom,this.pixelRatio/this.screenRatio,this.settings.fallingShare,this.settings.falling&&this.rainShown,this.windNowVector.copy(r.uWindDir.value).multiplyScalar(r.uWindSpeed.value),l,this.view.target.y),this.snowfall.update(e,this.weather.snow,this.view.zoom,this.pixelRatio/this.screenRatio,this.settings.fallingShare,this.settings.falling&&this.snowShown,this.ground.any,this.windNowVector,l,this.view.target.y),this.scene.updateMatrixWorld();for(let[e,t]of this.twins)t.matrixWorld.copy(e.matrixWorld);this.scene.matrixWorldAutoUpdate=!1;let d=this.gl;if(n?.mark(`shelter`,this.shelter.dirty),this.shelter.dirty){this.drawShelter();let e=this.shelter.lastPart;e?this.hollows.changedIn(e):this.hollows.changed()}let f=this.ground.any&&this.hollows.dirty;if(n?.mark(`hollows`,f),f&&this.drawHollows(),n?.mark(`clouds`),this.drawClouds(),n?.mark(`shadow`),d.setRenderTarget(this.shadowTarget),d.clear(!1,!0,!1),this.settings.shadows){let e=new Map,t=[];for(let e of this.scene.children)!this.casters.has(e)&&e.visible&&(e.visible=!1,t.push(e));for(let t of this.casters)e.set(t,t.material),t.material=this.materials.get(t.userData.kind).depth;d.render(this.scene,this.sunCamera);for(let[t,n]of e)t.material=n;for(let e of t)e.visible=!0}this.shadowDirty=!1,this.sunMemory.update(d,this.clockHour,this.dayNow.sunrise,this.dayNow.sunset,this.sunElNow,r.uOvercast.value.x,this.ground.frost,this.hollows.uniforms.uHollowsMap.value,this.hollows.uniforms.uHollowsOn.value>.5),n?.mark(`under`),d.setClearColor(0,0);let p=(xl.ripple+xl.chop*xl.chopMax)*1.1,m=this.settings.waterMask&&this.view.camera.isOrthographicCamera&&(this.settings.under||this.settings.reflection);m&&this.buildMasks(p);let h=m?null:this.waterOnScreen(),g=(e,t,n)=>this.settings.waterScissor?t.scissor(e,n):null;if((m?this.underMask.filled>0:h)&&this.settings.under){let e=this.ground.uniforms.uGroundOn,t=e.value;t>.5&&(e.value=2),this.drawOnly(this.underTarget,e=>e.userData.under,m?g(this.underTarget,this.underMask,this.maskScissor[0]):this.waterRect(h,this.underTarget,p,0),m?this.underMask:null),e.value=t}n?.mark(`reflect`);let _=this.settings.prepass;if((m?this.reflectMask.filled>0:h)&&this.settings.reflection){if(this.shared.uMirror.value=1,this.silhouettes.visible=_,_)for(let[e,t]of this.twins)t.visible=e.visible&&e.userData.reflect,t.material=this.materials.get(e.userData.kind).mirrorPrepass;this.paintOver(_,()=>!1);let e=[...this.materials.values()].flatMap(e=>[e.main,e.mirrorPrepass]).filter(e=>e.side===0);for(let t of e)t.side=1;let t=m?g(this.reflectTarget,this.reflectMask,this.maskScissor[1]):this.waterRect(h,this.reflectTarget,p*xl.reflectNudge,xl.blurPx*xl.coverWide,this.mirrorShift());this.drawOnly(this.reflectTarget,e=>e.userData.reflect||e===this.silhouettes,t,m?this.reflectMask:null,!0);for(let t of e)t.side=0;this.shared.uMirror.value=0}if(n?.mark(`main`),this.gbuffer.resolveDepthBuffer=this.settings.resolveDepth,d.setRenderTarget(this.gbuffer),d.clear(!0,!0,!1),this.silhouettes.visible=_,_)for(let[e,t]of this.twins)t.visible=e.visible,t.material=this.materials.get(e.userData.kind).prepass;this.paintOver(_,e=>this.settings.equalDepth&&e===`foliage`),d.render(this.scene,this.view.camera),this.silhouettes.visible=!1,this.paintOver(!1,()=>!1),this.marks.draw(d,this.view.camera,this.gbuffer.textures[1]),n?.mark(`post`),d.setRenderTarget(this.output);let v=this.post.uniforms;v.uLines.value=+!!this.settings.lines,v.uGrain.value=this.settings.grain,v.uLineWidth.value=G.clamp(.6+this.view.zoom/48,.8,2.2)*this.pixelRatio*.75,d.render(this.postScene,this.postCamera),this.settings.shelterDebug&&this.shelter.drawOverlay(d,this.gbuffer.textures[1],this.view.camera,this.width,this.height),n?.mark(`bolt`,this.lightning.active),this.lightning.draw(d,l,v.uHazeColor.value),this.onTop.draw(d,l,this.gbuffer.textures[1],this.output,this.width,this.pixelRatio,this.scene),this.drawnCamera.copy(l),this.drawn=!0;for(let e of s)e.visible=!0;this.scene.matrixWorldAutoUpdate=!0,n?.endFrame()}},dp=new Set([`ground`,`paint`,`crop`,`foliage`,`grass`,`ink`]),fp=new $e,pp=class e{static TALL=16;static CELL=2;static FLAT=new e(0,0,0,0,new Float32Array,0,0);x0;z0;nx;nz;max;lo;hi;constructor(e,t,n,r,i,a,o){this.x0=e,this.z0=t,this.nx=n,this.nz=r,this.max=i,this.lo=a,this.hi=o}static from(t){let n=new q,r=t.children.filter(e=>e.userData.kind===`ground`&&e.isMesh);for(let e of r)n.expandByObject(e);if(n.isEmpty())return null;let i=e.CELL,a=Math.ceil((n.max.x-n.min.x)/i)+1,o=Math.ceil((n.max.z-n.min.z)/i)+1,s=new Float32Array(a*o).fill(n.min.y),c=new w;for(let e of r){let t=e.geometry.getAttribute(`position`);for(let r=0;r<t.count;r++){c.fromBufferAttribute(t,r).applyMatrix4(e.matrixWorld);let o=Math.floor((c.z-n.min.z)/i)*a+Math.floor((c.x-n.min.x)/i);c.y>s[o]&&(s[o]=c.y)}}return new e(n.min.x,n.min.z,a,o,s,n.min.y,n.max.y)}refresh(t,n){let r=e.CELL,i=Math.floor((n.min.x-this.x0)/r),a=Math.floor((n.max.x-this.x0)/r),o=Math.floor((n.min.z-this.z0)/r),s=Math.floor((n.max.z-this.z0)/r);if(this.nx===0||i<0||o<0||a>=this.nx||s>=this.nz)return null;for(let e=o;e<=s;e++)this.max.fill(this.lo,e*this.nx+i,e*this.nx+a+1);let c=new q(new w(this.x0+i*r,-1/0,this.z0+o*r),new w(this.x0+(a+1)*r,1/0,this.z0+(s+1)*r)),l=new q,u=new w,d=this.hi;for(let e of t.children){let t=e;if(e.userData.kind!==`ground`||!t.isMesh)continue;let n=t.geometry;if(n.boundingBox||n.computeBoundingBox(),!l.copy(n.boundingBox).applyMatrix4(e.matrixWorld).intersectsBox(c))continue;let f=n.getAttribute(`position`),p=!e.matrixWorld.equals(fp);for(let t=0;t<f.count;t++){u.fromBufferAttribute(f,t),p&&u.applyMatrix4(e.matrixWorld);let n=Math.floor((u.x-this.x0)/r),c=Math.floor((u.z-this.z0)/r);if(n<i||n>a||c<o||c>s)continue;if(u.y<this.lo)return null;let l=c*this.nx+n;u.y>this.max[l]&&(this.max[l]=u.y),d=Math.max(d,u.y)}}return new e(this.x0,this.z0,this.nx,this.nz,this.max,this.lo,d)}at(t,n){let r=e.CELL,i=Math.floor((t-this.x0)/r),a=Math.floor((n-this.z0)/r),o=-1/0;for(let e=-1;e<=0;e++)for(let t=-1;t<=0;t++){let n=i+t,r=a+e;n>=0&&r>=0&&n<this.nx&&r<this.nz&&(o=Math.max(o,this.max[r*this.nx+n]))}return o===-1/0?0:o}trace(e,t){if(this.nx===0)return-e.y/t.y;let n=Math.max(0,(this.hi-e.y)/t.y),r=(this.lo-e.y)/t.y;for(;n<r;n+=1){let r=e.x+t.x*n,i=e.y+t.y*n,a=e.z+t.z*n;if(i<=this.at(r,a))return n}return r}};function mp(e,t){let n=()=>{let r=t.deref();r?r.rebakeFields():e.removeEventListener(`webglcontextrestored`,n)};e.addEventListener(`webglcontextrestored`,n)}var hp={high:{samples:4,shadowMapSize:4096,shadowCap:1,shelterSize:1024,maxPixels:2073600,reflectionScale:1},medium:{samples:4,shadowMapSize:2048,shadowCap:.75,shelterSize:512,maxPixels:2073600,reflectionScale:.5},low:{samples:2,shadowMapSize:2048,shadowCap:.5,shelterSize:512,maxPixels:144e4,reflectionScale:.5}},gp=1e-6,_p=class{prev=null;cur=null;stepMs=0;safetyHits=0;obstacles=null;queue=[];inFlight=1;clock=0;saves=[];disposed=!1;idlers=[];listeners=[];worker;constructor(e,t,n,r,i={}){this.worker=e,e.onmessage=e=>this.receive(e.data),e.postMessage({type:`init`,grid:t,obstacles:n,goal:r,options:i})}receive(e){if(e.type===`obstacles`){this.obstacles={solid:e.solid,drag:e.drag};return}if(e.type===`save`){this.saves.shift()?.resolve(e.save);return}this.prev=e.restored?e.snap:this.cur??e.snap,this.cur=e.snap,e.ms&&(this.stepMs=e.ms),this.safetyHits=e.safetyHits,this.inFlight--;for(let t of this.listeners)t(e.snap);this.pump()}setGoal(e){this.queue.push({goal:structuredClone(e)}),this.pump()}setObstacles(e){this.queue.push({obstacles:structuredClone(e)}),this.pump()}advance(e){this.clock+=e/Tt;let t=Math.floor(this.clock+gp);if(t>0){this.clock=Math.max(0,this.clock-t);let e=this.queue[this.queue.length-1];e&&`ticks`in e?e.ticks+=t:this.queue.push({ticks:t})}this.pump()}save(){return this.disposed?Promise.reject(Error(`The wind is disposed`)):new Promise((e,t)=>{this.queue.push({save:{resolve:e,reject:t}}),this.pump()})}restore(e){for(let e=this.queue.length-1;e>=0&&!(`save`in this.queue[e]);e--)`ticks`in this.queue[e]&&this.queue.splice(e,1);this.clock=0,this.queue.push({restore:structuredClone(e)}),this.pump()}setState(e){for(let e=this.queue.length-1;e>=0&&!(`save`in this.queue[e]);e--)`ticks`in this.queue[e]&&this.queue.splice(e,1);this.clock=0,this.queue.push({state:structuredClone(e)}),this.pump()}lead(e){this.clock=Math.min(1,Math.max(0,e))}get pending(){return this.inFlight+this.queue.reduce((e,t)=>e+(`ticks`in t?t.ticks:0),0)}get alpha(){return this.inFlight>0||this.queue.some(e=>`ticks`in e)?1:Math.min(1,this.clock)}idle(){return new Promise(e=>{this.idlers.push(e),this.pump()})}onTick(e){this.listeners.push(e)}at(e,t,n=0){return!this.prev||!this.cur?[0,0]:_t(this.prev,this.cur,this.alpha,e,t,n)}pump(){for(;!this.disposed&&this.inFlight===0&&this.queue.length;){let e=this.queue[0];if(`goal`in e)this.queue.shift(),this.worker.postMessage({type:`goal`,goal:e.goal});else if(`obstacles`in e)this.queue.shift(),this.worker.postMessage({type:`setObstacles`,obstacles:e.obstacles});else if(`state`in e)this.queue.shift(),this.inFlight=1,this.worker.postMessage({type:`state`,state:e.state});else if(`save`in e)this.queue.shift(),this.saves.push(e.save),this.worker.postMessage({type:`save`});else if(`restore`in e)this.queue.shift(),this.inFlight=1,this.worker.postMessage({type:`restore`,save:e.restore});else{let t=Math.min(e.ticks,4);e.ticks-=t,e.ticks||this.queue.shift(),this.inFlight=t,this.worker.postMessage({type:`step`,ticks:t})}}if(this.disposed||this.inFlight===0&&!this.queue.length)for(let e of this.idlers.splice(0))e()}dispose(){this.disposed=!0,this.worker.terminate?.();let e=Error(`The wind is disposed`);for(let t of this.queue)`save`in t&&t.save.reject(e);for(let t of this.saves)t.reject(e);this.queue.length=0,this.saves.length=0;for(let e of this.idlers.splice(0))e()}};function vp(e,t,n,r={}){return new _p(new Worker(new URL(new URL(`worker-D0MRp953.js`,import.meta.url).href,``+import.meta.url),{type:`module`}),e,t,n,r)}var yp=new URL(`bakery-BjZvDSjW.glb`,import.meta.url).href,bp=new URL(`battery-CCUjypl6.glb`,import.meta.url).href,xp=new URL(`beehive-j5Q5vGq_.glb`,import.meta.url).href,Sp=new URL(`bench-BsjnMNfy.glb`,import.meta.url).href,Cp=new URL(`cannery-DH35y9z9.glb`,import.meta.url).href,wp=new URL(`composter-CuTZwEt2.glb`,import.meta.url).href,Tp=new URL(`coop-C2jEI7pp.glb`,import.meta.url).href,Ep=new URL(`crates-BTB1jXsW.glb`,import.meta.url).href,Dp=new URL(`depot-CB6PVlRC.glb`,import.meta.url).href,Op=new URL(`digester-CJ2MkOxN.glb`,import.meta.url).href,kp=new URL(`farmhouse-vx5hWjJM.glb`,import.meta.url).href,Ap=new URL(`garage-PQV-MInZ.glb`,import.meta.url).href,jp=new URL(`greenhouse-CylJLq1v.glb`,import.meta.url).href,Mp=new URL(`lantern-ijgOUgAZ.glb`,import.meta.url).href,Np=new URL(`loom-CcyZs8My.glb`,import.meta.url).href,Pp=new URL(`mill-BIsbzb4Q.glb`,import.meta.url).href,Fp=new URL(`oil_press-BP32LWby.glb`,import.meta.url).href,Ip=new URL(`planter-CsD6iYPC.glb`,import.meta.url).href,Lp=new URL(`pylon-jeqScZHb.glb`,import.meta.url).href,Rp=new URL(`rain_tank-Ce_8_Sib.glb`,import.meta.url).href,zp=new URL(`silo-Czsb2Dk4.glb`,import.meta.url).href,Bp=new URL(`solar_panel-Cjnp8wT8.glb`,import.meta.url).href,Vp=new URL(`spinner-yOT3eIxO.glb`,import.meta.url).href,Hp=new URL(`sprinkler-DXgqgS6t.glb`,import.meta.url).href,Up=new URL(`truck-B8Eqaj0V.glb`,import.meta.url).href,Wp=new URL(`water_wheel-Dn_SiU5_.glb`,import.meta.url).href,Gp=new URL(`weather_station-C6UwI6TQ.glb`,import.meta.url).href,Kp=new URL(`wind_turbine-CUgGZHeq.glb`,import.meta.url).href,qp={bakery:{title:`Bakery`,group:`processing`,about:`A domed clay oven with its chimney, a lime-white bakehouse under a planted roof, bread on the counter.`,tiles:[2,2],triangles:1639,lo:[-3.75,0,-3.8],hi:[3.75,7.85,3.75],parts:[`plant_flower_01`,`plant_flower_02`,`plant_herb_00`,`plant_herb_03`,`plant_herb_05`,`plant_herb_06`,`plant_herb_07`,`plant_herb_08`,`plant_vine_09`,`running_glow`,`smoke_emitter`]},battery:{title:`Battery`,group:`power`,about:`Four ceramic cells on a timber deck, joined by copper bars. The charge rings are separate pieces for the game to light.`,tiles:[2,2],triangles:2030,lo:[-3.6,0,-3.6],hi:[3.6,4.52,3.6],parts:[`charge_0`,`charge_1`,`charge_2`,`charge_3`]},beehive:{title:`Beehive`,group:`farming`,about:`Three stacked hives in soft colours on a timber stand, with a planter of flowers for the bees.`,tiles:[1,1],triangles:594,lo:[-1.7,0,-.95],hi:[1.7,2.29,1.6],parts:[`plant_flower_00`,`plant_flower_01`,`plant_flower_02`,`plant_flower_03`]},bench:{title:`Bench`,group:`home`,about:`A timber bench between two terracotta pots: somewhere to sit and look at the farm.`,tiles:[1,1],triangles:268,lo:[-1.98,0,-.46],hi:[1.98,1,.26],parts:[`plant_shrub_00`,`plant_shrub_01`]},cannery:{title:`Cannery`,group:`processing`,about:`A big copper kettle on a tiled stove, steam off its pipe, red jars on a rack under a solar awning.`,tiles:[2,2],triangles:3119,lo:[-3.75,0,-3.75],hi:[3.85,5.6,3.75],parts:[`plant_flower_01`,`plant_herb_00`,`running_glow`,`smoke_emitter`]},composter:{title:`Composter`,group:`farming`,about:`Three slatted timber bins from fresh cuttings to dark compost, a ceramic tumbler on a frame, a barrow and sacks.`,tiles:[2,2],triangles:1096,lo:[-3.67,-0,-3.68],hi:[3.67,3.68,3.56],parts:[`move_spin_drum`,`plant_flower_01`,`plant_herb_00`]},coop:{title:`Coop`,group:`farming`,about:`A long rounded henhouse under a planted roof with a solar sheet, a pop-hole and ramp, and a run with an open gate arch.`,tiles:[3,3],triangles:2020,lo:[-5.67,0,-5.85],hi:[5.67,5.05,5.69],parts:[`plant_flower_01`,`plant_herb_00`,`plant_herb_02`,`plant_herb_03`,`plant_vine_04`]},crates:{title:`Crates`,group:`home`,about:`A stack of harvest crates with a sack and a jar: yard dressing.`,tiles:[1,1],triangles:994,lo:[-1.5,0,-1.2],hi:[1.26,1.57,1.26],parts:[]},depot:{title:`Depot`,group:`logistics`,about:`A stone platform with a rounded office and a cargo canopy, a ramp, a landing ring and a mooring mast for the airship.`,tiles:[3,3],triangles:3629,lo:[-5.8,0,-5.8],hi:[5.8,10.17,5.8],parts:[`plant_flower_01`,`plant_flower_04`,`plant_flower_05`,`plant_herb_00`,`plant_herb_02`,`plant_herb_03`,`running_beacon`]},digester:{title:`Digester`,group:`power`,about:`A round tank under a planted dome: farm waste in at the hopper, gas to the copper bell, a small flare on its pipe.`,tiles:[2,2],triangles:1182,lo:[-3.78,0,-3.78],hi:[3.78,6.95,3.78],parts:[`plant_flower_00`,`plant_flower_03`,`plant_herb_01`,`plant_herb_02`,`plant_herb_04`,`smoke_emitter`]},farmhouse:{title:`Farmhouse`,group:`home`,about:`A rounded two-storey house under a planted roof, a sunroom under solar glass, a vine pergola, a rain tank off the roof.`,tiles:[3,3],triangles:2749,lo:[-5.8,0,-5.8],hi:[5.8,8.95,5.8],parts:[`plant_flower_01`,`plant_flower_03`,`plant_flower_06`,`plant_flower_07`,`plant_flower_08`,`plant_flower_09`,`plant_flower_14`,`plant_flower_15`,`plant_flower_16`,`plant_herb_00`,`plant_herb_02`,`plant_herb_12`,`plant_herb_13`,`plant_herb_17`,`plant_herb_18`,`plant_herb_19`,`plant_shrub_04`,`plant_vine_10`,`plant_vine_11`,`smoke_emitter`]},garage:{title:`Garage`,group:`logistics`,about:`An open-fronted timber shelter for the truck: boarded walls, a barrel roof half planted and half solar, a charging post.`,tiles:[2,2],triangles:1174,lo:[-3.78,0,-3.85],hi:[3.78,4.7,3.75],parts:[`plant_flower_01`,`plant_herb_00`,`plant_herb_02`,`plant_herb_03`,`plant_herb_04`,`plant_herb_05`,`plant_vine_06`,`running_lamp`]},greenhouse:{title:`Greenhouse`,group:`farming`,about:`A long barrel of sea-glass panes on a low timber wall, timber ribs, a copper ridge with two vent hoods, a glazed door.`,tiles:[3,3],triangles:1911,lo:[-5.5,0,-5.65],hi:[5.64,5.26,5.96],parts:[`plant_flower_06`,`plant_flower_07`,`plant_flower_08`,`plant_flower_09`,`plant_herb_02`,`plant_herb_03`,`plant_herb_04`,`plant_herb_05`,`plant_vine_00`,`plant_vine_01`]},lantern:{title:`Lantern`,group:`home`,about:`A solar lantern on a timber post: a small solar cap, a copper arm, a globe for the game to light at dusk.`,tiles:[1,1],triangles:208,lo:[-.4,0,-.3],hi:[.4,3.31,.82],parts:[`running_glow`]},loom:{title:`Loom`,group:`processing`,about:`A big timber loom in the open, striped linen growing down it, bolts of cloth on a rack, a rounded store behind.`,tiles:[2,2],triangles:1435,lo:[-3.75,0,-3.75],hi:[3.75,4.38,3.75],parts:[`plant_flower_01`,`plant_herb_00`,`plant_herb_02`,`plant_vine_03`]},mill:{title:`Mill`,group:`processing`,about:`A hopper up a slim timber tower, millstones turning in the open at its foot, flour running into a sack.`,tiles:[2,2],triangles:1498,lo:[-3.75,0,-3.75],hi:[3.75,7.75,3.75],parts:[`move_spin_stone`,`plant_herb_00`,`plant_herb_01`,`plant_herb_02`,`plant_herb_03`,`plant_herb_04`,`running_flour`]},oil_press:{title:`Oil press`,group:`processing`,about:`A timber screw press with a copper handwheel, golden oil running to a jar, and a small store with a shelf of oil.`,tiles:[2,2],triangles:2811,lo:[-3.83,0,-3.75],hi:[3.75,5.38,3.75],parts:[`move_spin_wheel`,`plant_flower_01`,`plant_flower_02`,`plant_flower_03`,`plant_flower_04`,`plant_herb_00`]},planter:{title:`Planters`,group:`home`,about:`Two raised timber beds of herbs and flowers and a copper watering can: yard dressing.`,tiles:[1,1],triangles:148,lo:[-1.7,0,-1.6],hi:[1.78,.56,1.4],parts:[`plant_flower_04`,`plant_flower_05`,`plant_flower_06`,`plant_herb_00`,`plant_herb_01`,`plant_herb_02`,`plant_herb_03`]},pylon:{title:`Pylon`,group:`power`,about:`A slim timber pole with ceramic insulators, a copper cap and a small lamp. Quiet: a farm has many.`,tiles:[1,1],triangles:422,lo:[-1,0,-.4],hi:[1,5.72,.88],parts:[]},rain_tank:{title:`Rain tank`,group:`home`,about:`A ceramic rain tank on stone feet, with a copper downpipe, a tap and a bucket.`,tiles:[1,1],triangles:536,lo:[-1.21,0,-1.05],hi:[1.05,3.67,1.55],parts:[]},silo:{title:`Silo`,group:`logistics`,about:`A ceramic grain store: copper hoops, a planted cap, a gauge window showing how full it is, and a filling pipe.`,tiles:[2,2],triangles:1013,lo:[-3.75,0,-3.75],hi:[3.75,10.05,3.75],parts:[`plant_flower_01`,`plant_herb_00`,`plant_herb_02`]},solar_panel:{title:`Solar panel`,group:`power`,about:`One sheet of solar glass on two copper posts, low and quiet; the meadow grows under it.`,tiles:[2,2],triangles:242,lo:[-3.7,0,-2.04],hi:[3.7,3.3,2.62],parts:[]},spinner:{title:`Spinner`,group:`processing`,about:`A great spinning wheel in the open, bobbins of dyed thread under a solar awning, a round wool store behind.`,tiles:[2,2],triangles:2257,lo:[-3.75,0,-3.8],hi:[3.75,4.6,3.75],parts:[`move_spin_wheel`,`plant_flower_01`,`plant_flower_02`,`plant_flower_03`,`plant_herb_00`]},sprinkler:{title:`Sprinkler`,group:`farming`,about:`A copper riser on a ceramic valve, taller than a person. The two-armed head is a separate piece, ready to spin.`,tiles:[1,1],triangles:504,lo:[-1.85,0,-.85],hi:[1.44,3.06,.85],parts:[`move_spin_head`]},truck:{title:`Truck`,group:`logistics`,about:`A small electric farm truck: a rounded ceramic cab with solar glass on its roof and an open timber bed.`,tiles:[1,1],triangles:920,lo:[-1.07,0,-1.74],hi:[1.07,1.96,1.75],parts:[`move_spin_wheel_bl`,`move_spin_wheel_br`,`move_spin_wheel_fl`,`move_spin_wheel_fr`]},water_wheel:{title:`Water wheel`,group:`power`,about:`A ten-paddle wheel hung over the river off the front of its bank, a copper dynamo on its shaft, a generator house behind.`,tiles:[2,2],triangles:1961,lo:[-3.75,-.87,-3.8],hi:[3.75,4.63,6.79],parts:[`dynamo`,`move_spin_wheel`,`plant_flower_01`,`plant_flower_03`,`plant_flower_04`,`plant_herb_00`,`plant_herb_02`,`plant_vine_05`,`running_control_window`]},weather_station:{title:`Weather station`,group:`farming`,about:`A louvred white instrument box under a planted lid, a copper mast with vane and spinning cups, and a rain gauge.`,tiles:[1,1],triangles:979,lo:[-1.54,0,-1.85],hi:[1.91,4.67,1.52],parts:[`move_spin_anemometer`,`plant_herb_00`]},wind_turbine:{title:`Wind turbine`,group:`power`,about:`A slim ceramic tower, a rotor ten metres across with terracotta tips. The rotor is a separate piece, ready to turn.`,tiles:[1,1],triangles:639,lo:[-2.58,0,-1.5],hi:[4.95,18.75,1.57],parts:[`move_spin_rotor`]}},Jp=Object.assign({"./bakery.glb":yp,"./battery.glb":bp,"./beehive.glb":xp,"./bench.glb":Sp,"./cannery.glb":Cp,"./composter.glb":wp,"./coop.glb":Tp,"./crates.glb":Ep,"./depot.glb":Dp,"./digester.glb":Op,"./farmhouse.glb":kp,"./garage.glb":Ap,"./greenhouse.glb":jp,"./lantern.glb":Mp,"./loom.glb":Np,"./mill.glb":Pp,"./oil_press.glb":Fp,"./planter.glb":Ip,"./pylon.glb":Lp,"./rain_tank.glb":Rp,"./silo.glb":zp,"./solar_panel.glb":Bp,"./spinner.glb":Vp,"./sprinkler.glb":Hp,"./truck.glb":Up,"./water_wheel.glb":Wp,"./weather_station.glb":Gp,"./wind_turbine.glb":Kp}),Yp=Object.fromEntries(Object.entries(qp).map(([e,t])=>[e,{...t,name:e,url:Jp[`./${e}.glb`]}])),Xp=[`logistics`,`farming`,`processing`,`power`,`home`],Zp=Xp.flatMap(e=>Object.values(Yp).filter(t=>t.group===e)),Qp=e=>e.tiles[0]>=2&&e.hi[1]>1.5&&e.name!==`solar_panel`;function $p(e,t,n=.5){let r=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)};return(1-r(1,1+n,Math.abs(e)))*r(1.7-n,1.7,t)*(1-r(8,8+n,t))}var Q={lime:Z(10929242),meadow:Z(6987850),emerald:Z(4229210),teal:Z(3899502),moss:Z(5210176),mud:Z(6967864),bed:Z(10126944),water:Z(2911860),stone:Z(10129796),reed:Z(7309882),soil:Z(9066036),timber:Z(12947285),ceramic:Z(15656658),brass:Z(12618312),glass:Z(1920928),bark:Z(7227966),leaf:Z(5151290),leafLight:Z(9225290),fruitLeaf:Z(5939262),cypress:Z(3107394),fruit:Z(15755820),wheatRoot:Z(9083450),wheatTip:Z(15778906),dirt:Z(13084538),rut:Z(10782304),wheat:Z(16043854),wheatDeep:Z(14457908),fence:Z(12100746),crate:Z(11565642),apple:Z(14172204),deepLeaf:Z(3108932)},em=(e,t,n)=>{let r=Math.min(Math.max((n-e)/(t-e),0),1);return r*r*(3-2*r)};function tm(e){let t=.25;return{height:e,normal:(n,r)=>new w(e(n-t,r)-e(n+t,r),2*t,e(n,r-t)-e(n,r+t)).normalize()}}function nm(e,t,n,r,i,a,o){let s=e.vertex(t,n,r,o,[0,0],[-1,-1,i,a]);e.vertex(t,n,r,o,[0,0],[1,-1,i,a]),e.vertex(t,n,r,o,[0,0],[1,1,i,a]),e.vertex(t,n,r,o,[0,0],[-1,1,i,a]),e.quad(s,s+1,s+2,s+3)}function rm(e){let t=e.scale??1,n=e.kind===`bush`||e.kind===`cypress`,r=(e.kind===`cypress`||e.kind===`bush`||e.kind===`round`?.8:2.2)*t;return{circle:{x:e.x,z:e.z,radius:r},drag:n?ve.crown:ve.crown/2}}function im(e,t,n,r,i){let a=r.scale??1,o=n.height(r.x,r.z)-.05,s=new w(r.x,o,r.z),c=e.vertexCount,l=t.vertexCount,d=r.kind===`cypress`,f=r.kind===`bush`,p=r.kind===`round`,m=[.4,2.5,1.57,0],h=(d?1.2:f?.25:p?.9:1.45)*a,g=(d?.16:f?.06:p?.1:.2)*Math.sqrt(a),_=new Fe(g*.65,g,h+.4*a,9,5);e.addGeometry(_,new $e().makeTranslation(r.x,o+(h+.4*a)/2,r.z),Q.bark,m);let v=(t,n,r,i)=>{let o=new Fe(i*Math.sqrt(a),r*Math.sqrt(a),t.distanceTo(n),6,3),s=new u().setFromUnitVectors(new w(0,1,0),n.clone().sub(t).normalize());e.addGeometry(o,new $e().compose(t.clone().lerp(n,.5),s,new w(1,1,1)),Q.bark,m)},y=[],b=e=>new w(0,e,0);if(f){let e=2+ +(i()<.5),t=i()*Math.PI;for(let n=0;n<e;n++){let r=t+n/e*Math.PI*2,o=new w(Math.cos(r),0,Math.sin(r)).multiplyScalar(.25*a);y.push({c:s.clone().add(o).add(b((.6+i()*.2)*a)),r:(.45+i()*.12)*a,tone:i()})}}else if(p){if(y.push({c:s.clone().add(b(h+.55*a)),r:(.62+i()*.12)*a,tone:i()}),i()<.6){let e=i()*Math.PI*2;y.push({c:s.clone().add(new w(Math.cos(e)*.3*a,h+.75*a,Math.sin(e)*.3*a)),r:.42*a,tone:i()})}}else if(!d){let e=s.clone().add(b(h*.85)),t=3+ +(i()<.6),n=i()*Math.PI*2;for(let r=0;r<t;r++){let o=n+r/t*Math.PI*2+(i()-.5)*1,s=.6+i()*.45,c=(1.2+i()*1)*a,l=new w(Math.sin(s)*Math.cos(o),Math.cos(s),Math.sin(s)*Math.sin(o)),u=e.clone().addScaledVector(l,c);if(v(e,u,.1,.05),y.push({c:u.clone().addScaledVector(l,.25*a).add(b(.3*a)),r:(.75+i()*.45)*a,tone:i()}),i()<.55){let t=new w(-l.z,0,l.x).multiplyScalar((i()<.5?.5:-.5)*a);y.push({c:e.clone().addScaledVector(l,c*.5).add(t).add(b(.15*a)),r:(.45+i()*.2)*a,tone:i()})}}let r=e.clone().add(new w((i()-.5)*.4*a,(1.5+i()*.4)*a,(i()-.5)*.4*a));v(e,r,.09,.04),y.push({c:r.clone().add(b(.35*a)),r:(.7+i()*.25)*a,tone:i()})}let x=y.reduce((e,t)=>e.addScaledVector(t.c,1/y.length),new w),S=new w(1,1.2,1),C=r.leaf??(d?Q.cypress:r.kind===`fruit`||f?Q.fruitLeaf:Q.leaf),T=a**.45*(r.stroke??1),E=(e,t,n)=>{let r=em(-.1,.9,t.y),a=e.clone().offsetHSL(-.03*r,.05*r,.09*r);return a.multiplyScalar(1-n*.42),a.offsetHSL((i()-.5)*.012,(i()-.5)*.04,(i()-.5)*.02)};if(d){let e=5.4*a,n=5+Math.floor(i()*3),o=i()*Math.PI*2,c=e=>(.3+.75*Math.sin(Math.min(1,.22+e*2.6)*Math.PI/2)*(1-e*.86))*a,l=Math.round(420*a*a/T/(r.stroke??1));for(let r=0;r<l;r++){let r=i()**.85,l=i()*Math.PI*2,u=.86+.2*Math.max(0,Math.cos((l-o)*n*.5))**2+(i()-.5)*.1,d=i()<.2?.5+i()*.4:0,f=c(r)*u*(1-d*.6),p=s.clone().add(new w(Math.cos(l)*f,1*a+r*e,Math.sin(l)*f)),m=new w(Math.cos(l),.25+r*.9,Math.sin(l)).normalize(),h=(d?.4+i()*.2:.17+i()*.13)*T;nm(t,p,m,E(C,m,d),h,i(),[.7,.32+i()*.14,Math.PI/2,.35])}}for(let e of y){let n=C.clone().offsetHSL((e.tone-.5)*.03,0,(e.tone-.5)*.04),a=e.r/T;for(let o of[{count:14,depth:[.35,.3],size:[.5,.25],inner:1},{count:78,depth:[.68,.32],size:[.32,.22],inner:0},{count:34,depth:[1,.13],size:[.13,.09],inner:0}])for(let s=0,c=Math.round((o.inner?o.count:o.count*(r.fill??1))*a*a);s<c;s++){let r=i()*2-1,a=i()*Math.PI*2,s=Math.sqrt(1-r*r),c=new w(s*Math.cos(a)*1.12,r<0?r*.55:r,s*Math.sin(a)*1.12),l=o.depth[0]+i()*o.depth[1],u=e.c.clone().addScaledVector(c,e.r*l),d=u.clone().sub(x).multiply(S).normalize().multiplyScalar(.55).addScaledVector(c.clone().normalize(),.45).normalize(),f=o.inner?1:Math.max(0,(.85-l)/.25)*.5+(r<-.25?.4:0),p=(o.size[0]+i()*o.size[1])*T;nm(t,u,d,E(n,d,Math.min(f,1)),p,i(),[.7,.45+i()*.35,-1,.7])}}let D=r.fruit??(r.kind===`fruit`?Q.fruit:null);if(D){let e=Math.round(26*(r.fruitDensity??1)*y.reduce((e,t)=>e+t.r*t.r,0)/3);for(let n=0;n<e;n++){let e=y[Math.floor(i()*y.length)],n=i()*.9-.2,r=i()*Math.PI*2,a=Math.sqrt(1-n*n),o=new w(a*Math.cos(r),n,a*Math.sin(r));nm(t,e.c.clone().addScaledVector(o,e.r*1),o,D.clone().offsetHSL((i()-.5)*.04,0,(i()-.5)*.08),(.1+i()*.04)*Math.min(1.2,T),i(),[.2,1,-1,.5])}}let O=t.heightsSince(l).sort((e,t)=>e-t),k=Math.max(O[O.length-1],...e.heightsSince(c))-o,A=Math.max(O[Math.floor(O.length*.1)]-o,k*.2),j=Ld[r.kind],M=e=>{let t=Math.max(e-o,0);return Math.min(t/A,1)**2*(1-j)+Math.min(t/k,1)**2*j},N={x:r.x,z:r.z,height:k,kind:r.kind,scale:a};e.markTree(c,N,M),t.markTree(l,N,M)}function am(e,t,n,r,i,a,o,s=-1/0,c){let l=Xd(new P(1,2).deleteAttribute(`normal`).deleteAttribute(`uv`)),d=l.getAttribute(`position`),f=o()*100,p=.5+o()*.25,m=o()*Math.PI,h=new w,g=new w(0,1,0),_=new w(1.15,p,.9);for(let e=0;e<d.count;e++){h.fromBufferAttribute(d,e);let t=1+rf(h.x*1.3+f,h.z*1.3+h.y)*.18;h.multiplyScalar(t).multiply(_).applyAxisAngle(g,m),d.setXYZ(e,h.x,h.y,h.z)}l.computeVertexNormals();let v=(c??t.height(n,r))+i*p*(1-2*a),y=new $e().compose(new w(n,v,r),new u,new w(i,i,i)),b=l.getAttribute(`normal`),x=new w,S=new w,C=Q.stone.clone().offsetHSL((o()-.5)*.04,(o()-.5)*.1,(o()-.5)*.12),T=e.vertexCount;for(let t=0;t<d.count;t++){x.fromBufferAttribute(d,t).applyMatrix4(y),S.fromBufferAttribute(b,t);let n=v>s+.05?Math.max(0,S.y-.35)*1.2:0;e.vertex(x,S,C.clone().lerp(Q.moss,Math.min(n,.8)),[.6,3,.8,0])}let E=l.getIndex();for(let t=0;t<E.count;t+=3)e.tri(T+E.getX(t),T+E.getX(t+1),T+E.getX(t+2))}var om={};function sm(e){let t=om[e];if(t)return t;let n=Xd(new P(1,e).deleteAttribute(`normal`).deleteAttribute(`uv`)),r=n.getAttribute(`position`),i=n.getIndex();return t={pos:Float32Array.from(r.array),idx:Uint16Array.from(i.array)},n.dispose(),om[e]=t,t}var cm=new yt,lm=new $e,um=new W;function dm(e,t,n,r,i,a){let{rx:o,ry:s,rz:c}=i,l=i.detail??2,u=i.sink??.34,d=i.crag??.55,f=i.moss??.55,p=i.yaw??a()*Math.PI*2,m=i.pitch??0,h=i.roll??0,{pos:g,idx:_}=sm(l),v=g.length/3,y=a()*100,b=a()*Math.PI*2,x=(.18+a()*.34)*(.6+.4*d),S=a()*Math.PI*2,C=.12+a()*.32,w=Math.sqrt(1-C*C),T=S+1.7+a()*1.1,E=.08+a()*.3,D=Math.sqrt(1-E*E),O=[Math.sin(x)*Math.cos(b),w*Math.cos(S),D*Math.cos(T)],k=[Math.cos(x),C,E],A=[Math.sin(x)*Math.sin(b),w*Math.sin(S),D*Math.sin(T)],j=[.72-d*.16+(a()-.5)*.08,.78-d*.14+(a()-.5)*.08,.8-d*.14+(a()-.5)*.08];cm.set(m,p,h,`YXZ`),lm.makeRotationFromEuler(cm);let M=lm.elements,N=t.height(n,r)+s*(1-2*u),P=new Float32Array(v*3),F=new Float32Array(v*3),I=new Float32Array(v);for(let e=0;e<v;e++){let i=g[e*3],a=g[e*3+1],l=g[e*3+2],u=rf(i*1.35+y,l*1.35+a*1.15),f=rf(i*2.85-y*.7,a*2.4+l*2.65),p=1+u*(.13+.09*d)+f*(.03+.05*d),m=i*p,h=a*p,_=l*p;for(let e=0;e<3;e++){let t=m*O[e]+h*k[e]+_*A[e];if(t>j[e]){let n=t-j[e],r=n*(.52+.36*d)*(n/(n+.12));m-=O[e]*r,h-=k[e]*r,_-=A[e]*r}}let v=a<0?1+-a*.16:1-Math.max(0,a-.25)*.14*d;m*=v*o,h*=s,_*=v*c;let b=n+M[0]*m+M[4]*h+M[8]*_,x=N+M[1]*m+M[5]*h+M[9]*_,S=r+M[2]*m+M[6]*h+M[10]*_,C=t.height(b,S);if(I[e]=C,a<0){let e=-a,t=C-Math.max(.35,s*.45)*e;x>t&&(x+=(t-x)*em(0,.55,e))}P[e*3]=b,P[e*3+1]=x,P[e*3+2]=S}for(let e=0;e<_.length;e+=3){let t=_[e]*3,n=_[e+1]*3,r=_[e+2]*3,i=P[n]-P[t],a=P[n+1]-P[t+1],o=P[n+2]-P[t+2],s=P[r]-P[t],c=P[r+1]-P[t+1],l=P[r+2]-P[t+2],u=a*l-o*c,d=o*s-i*l,f=i*c-a*s;F[t]+=u,F[t+1]+=d,F[t+2]+=f,F[n]+=u,F[n+1]+=d,F[n+2]+=f,F[r]+=u,F[r+1]+=d,F[r+2]+=f}let ee=(i.color??Q.stone).clone().offsetHSL((a()-.5)*.03,(a()-.5)*.08,(a()-.5)*.09),te=e.vertexCount;for(let t=0;t<v;t++){let n=P[t*3],r=P[t*3+1],i=P[t*3+2],a=F[t*3],o=F[t*3+1],s=F[t*3+2],c=Math.hypot(a,o,s);c>1e-6?(a/=c,o/=c,s/=c):(a=0,o=1,s=0),um.copy(ee);let l=1-em(-.05,.45,r-I[t]);l>0&&um.lerp(Q.mud,l*.18).multiplyScalar(1-l*.14);let u=Math.sin(r*3.6+rf(n*.35+y,i*.35-y)*2);if(um.multiplyScalar(1+u*(.025+.02*d)),f>0&&o>.35){let e=em(-.22,.48,rf(n*.42+13.7,i*.42-9.3)),t=Math.min(.78,f*em(.36,.84,o)*(.35+.65*e));t>.01&&um.lerp(Q.moss,t)}e.vertex({x:n,y:r,z:i},{x:a,y:o,z:s},um,[.55,2.6,.8,0])}for(let t=0;t<_.length;t+=3)e.tri(te+_[t],te+_[t+1],te+_[t+2])}function fm(e,t,n,r,i,a,o,s){let c=t.height(n,r),l=t.normal(n,r),u=a.clone().lerp(Q.teal,.35).multiplyScalar(.82),d=a.clone().lerp(Q.lime,.1),f=u.clone().lerp(d,.55),[p,m]=s?.blades??[4,4],[h,g]=s?.width??[.035,.02],_=s?.spread??.04,v=p+Math.floor(o()*m),y=[.8,.85,.8,.6];for(let t=0;t<v;t++){let t=o()*Math.PI*2,a=i*(.6+o()*.6),s=h+o()*g,p=.25+o()*.45,m=o(),v=Math.cos(t),b=Math.sin(t),x=-b*s,S=v*s,C=Math.atan2(v,-b),w=n+v*_,T=r+b*_,E=e.vertex({x:w-x,y:c-.02,z:T-S},l,u,y,[0,0],[0,m,-s,C]),D=e.vertex({x:w+x,y:c-.02,z:T+S},l,u,y,[0,0],[0,m,s,C]),O=w+v*p*a*.4,k=T+b*p*a*.4,A=c+a*.55,j=e.vertex({x:O+x*.7,y:A,z:k+S*.7},l,f,y,[0,0],[.55,m,s*.7,C]),M=e.vertex({x:O-x*.7,y:A,z:k-S*.7},l,f,y,[0,0],[.55,m,-s*.7,C]),N=e.vertex({x:w+v*p*a,y:c+a,z:T+b*p*a},l,d,y,[0,0],[1,m]);e.quad(E,D,j,M),e.tri(M,j,N)}}var pm=Z(6177064),mm=.62,hm=.84,gm=.012;function _m(e,t,n,r,i,a){let[o,s]=a?.blades??[8,10],[c,l]=a?.tall??[.5,.45],u=a?.across??.45,[d,f]=a?.width??[.018,.012],p=a?.colour??Q.reed,m=a?.tip??Q.lime,h=a?.tipMix??.25,g=a?.heads??0,_=a?.head??pm,v=o+Math.floor(i()*s),y=c+i()*l,b=[.6,.85,1.4,.5];for(let a=0;a<v;a++){let a=n+(i()-.5)*u,o=r+(i()-.5)*u,s=t.height(a,o)-.03,c=t.normal(a,o),l=i()*Math.PI,v=d+i()*f,x=y*(.6+i()*.5),S=Math.cos(l)*v,C=Math.sin(l)*v,w=(i()-.5)*.25,T=i(),E=p.clone().lerp(Q.teal,.4).multiplyScalar(.75),D=p.clone().lerp(m,h*i()),O=e.vertex({x:a-S,y:s,z:o-C},c,E,b,[0,0],[0,T,-v,l]),k=e.vertex({x:a+S,y:s,z:o+C},c,E,b,[0,0],[0,T,v,l]);if(!(g>0&&i()<g)){let t=e.vertex({x:a+w*x,y:s+x,z:o+w*x*.5},c,D,b,[0,0],[1,T]);e.tri(O,k,t);continue}let A=(t,n,r,i)=>e.vertex({x:a+w*x*t+i*Math.cos(l)*n,y:s+x*t,z:o+w*x*.5*t+i*Math.sin(l)*n},c,r,b,[0,0],[t,T,i*n,l]),j=E.clone().lerp(D,mm),M=v*.38+gm;e.quad(O,k,A(mm,v*.38,j,1),A(mm,v*.38,j,-1));let N=_.clone().multiplyScalar(.8);e.quad(A(mm,M,N,-1),A(mm,M,N,1),A(hm,M,_,1),A(hm,M,_,-1));let P=A(hm,v*.16000000000000003,D,-1),F=A(hm,v*.16000000000000003,D,1);e.tri(P,F,e.vertex({x:a+w*x,y:s+x,z:o+w*x*.5},c,D,b,[0,0],[1,T]))}}function vm(e,t,n,r,i,a,o,s,c,l,u){for(let u=0;u<c;u++){let c=l()*Math.PI*2,u=Math.sqrt(l()),d=Math.sqrt(1-u*u)*(.6+l()*.4),f=new w(Math.cos(c)*d,u+.2,Math.sin(c)*d).normalize();nm(e,new w(t+Math.cos(c)*d*i,n+u*a*.85,r+Math.sin(c)*d*i),f,s.clone().lerp(o,em(.1,.7,u)).offsetHSL((l()-.5)*.015,0,(l()-.5)*.05),(.1+l()*.07)*Math.max(.6,i/.35),l(),[.6,.6+l()*.3,-1,.6])}if(u)for(let o=0;o<4;o++){let o=l()*Math.PI*2,s=.3+l()*.55;nm(e,new w(t+Math.cos(o)*i*.9,n+s*a,r+Math.sin(o)*i*.9),new w(Math.cos(o),.4,Math.sin(o)).normalize(),u.clone().offsetHSL((l()-.5)*.03,0,(l()-.5)*.08),.06+l()*.02,l(),[.2,1,-1,.5])}}function ym(e,t,n,r,i,a,o){let[s,c]=o?.lift??[.18,.22],[l,u]=o?.size??[.055,.035],d=t.height(n,r)+s+a()*c;nm(e,new w(n,d,r),new w(0,1,0),i.clone().offsetHSL(0,0,(a()-.5)*.08),l+a()*u,a(),[.2+(o?.crisp?2:0),1,-1,.3])}function bm(e,t,n,r,i,a,o,s){for(let c=0;c<a;c++){let a=n+(o()-.5)*2.4,c=r+(o()-.5)*2.4;s(a,c)&&ym(e,t,a,c,i,o)}}var xm=class e{points=[];length;grid=null;static REACH=24;gridX=0;gridMin=0;gridCell=.35;gridN=0;gridNx=0;constructor(e,t=.5){let n=new He(e.map(([e,t])=>new _(e,t))),r=n.getLength(),i=Math.max(2,Math.ceil(r/t));for(let e of n.getSpacedPoints(i))this.points.push(e);this.length=r}near(e,t){let n=1/0,r=0,i=1,a=0,o=1,s=0,c=this.points;for(let l=0;l<c.length-1;l++){let u=c[l],d=c[l+1],f=d.x-u.x,p=d.y-u.y,m=f*f+p*p,h=Math.sqrt(m),g=Math.min(1,Math.max(0,((e-u.x)*f+(t-u.y)*p)/m)),_=u.x+f*g-e,v=u.y+p*g-t,y=_*_+v*v;y<n&&(n=y,r=s+g*h,i=f/h,a=p/h,o=f*(t-u.y)-p*(e-u.x)<0?1:-1),s+=h}return{distance:Math.sqrt(n),along:r,dx:i,dz:a,side:o}}distance(t,n,r=e.REACH){if(!this.grid){let e=1/0,t=1/0,n=-1/0,i=-1/0;for(let r of this.points)e=Math.min(e,r.x),n=Math.max(n,r.x),t=Math.min(t,r.y),i=Math.max(i,r.y);let a=this.gridCell;this.gridX=Math.floor((e-r)/a)*a,this.gridMin=Math.floor((t-r)/a)*a,this.gridNx=Math.ceil((n+r-this.gridX)/a)+1,this.gridN=Math.ceil((i+r-this.gridMin)/a)+1;let o=this.gridNx,s=this.gridN,c=new Float32Array(o*s);for(let e=0;e<s;e++)for(let t=0;t<o;t++)c[e*o+t]=this.near(this.gridX+t*a,this.gridMin+e*a).distance;this.grid=c}let i=this.gridNx,a=(t-this.gridX)/this.gridCell,o=(n-this.gridMin)/this.gridCell;if(a<0||o<0||a>=i-1||o>=this.gridN-1){let e=Math.max(0,-a,a-(i-1))*this.gridCell,t=Math.max(0,-o,o-(this.gridN-1))*this.gridCell;return r+Math.hypot(e,t)}let s=Math.floor(a),c=Math.floor(o),l=a-s,u=o-c,d=this.grid,f=d[c*i+s],p=d[c*i+s+1],m=d[(c+1)*i+s],h=d[(c+1)*i+s+1];return(f*(1-l)+p*l)*(1-u)+(m*(1-l)+h*l)*u}at(e){let t=this.points,n=0;for(let r=0;r<t.length-1;r++){let i=t[r],a=t[r+1],o=i.distanceTo(a);if(n+o>=e||r===t.length-2){let t=Math.min(1,Math.max(0,(e-n)/o));return{x:i.x+(a.x-i.x)*t,z:i.y+(a.y-i.y)*t,dx:(a.x-i.x)/o,dz:(a.y-i.y)/o}}n+=o}return{x:t[0].x,z:t[0].y,dx:1,dz:0}}};function Sm(e,t){return!e||e===`summer`?null:{season:e,canFall:t}}var Cm=new class extends $d{constructor(){super(`foliage`)}vertex(){return 0}quad(){}tri(){}addGeometry(){}markTree(){}heightsSince(){return[]}},wm=new w(0,1,0),Tm=(e,t)=>ef(Math.imul(Math.round(e.x*97),2654435761)^Math.imul(Math.round(e.z*131)+t,2246822507))(),Em=e=>{let t=e()*2-1,n=e()*Math.PI*2,r=Math.sqrt(1-t*t);return new w(r*Math.cos(n),t,r*Math.sin(n))},Dm=[.4,2.5,1.57,0],Om=[.5,5,1.57,0];function km(e,t,n,r,i,a,o,s){let c=n.clone().sub(t).normalize(),l=Math.abs(c.y)<.9?wm.clone().cross(c).normalize():new w(1,0,0).cross(c).normalize(),u=c.clone().cross(l),d=e.vertexCount,f=new w;for(let[c,d]of[[t,r],[n,i]])for(let t=0;t<o;t++){let n=t/o*Math.PI*2;f.copy(l).multiplyScalar(Math.cos(n)).addScaledVector(u,Math.sin(n)),e.vertex({x:c.x+f.x*d,y:c.y+f.y*d,z:c.z+f.z*d},f,a,s)}for(let t=0;t<o;t++){let n=(t+1)%o;e.quad(d+t,d+n,d+o+n,d+o+t)}}function Am(e,t,n,r,i){let a=[],o=[],s=Math.sqrt(n),c=e.kind===`fruit`||e.kind===`bush`,l=e.kind===`round`,u=e.form===`willow`,d=(e,t,n,s,c,l,u)=>{let f=c===0?4:c===1?3:2,p=n/f,m=t.clone().normalize(),h=e.clone();for(let e=0;e<f;e++){let t=s*(1-e/f*.55),o=s*(1-(e+1)/f*.55),g=h.clone().addScaledVector(m,p);if(a.push({a:h,b:g,ra:t,rb:o,order:c}),c<i){let t=e===f-1?2:+(r()<.45);for(let e=0;e<t;e++){let e=Em(r).cross(m).normalize(),t=.5+r()*.5,i=m.clone().multiplyScalar(Math.cos(t)).addScaledVector(e,Math.sin(t)).addScaledVector(wm,u*.6).normalize();d(g,i,n*(.5+r()*.25),o*.92,c+1,l*1.15,u)}}m.addScaledVector(Em(r),l).addScaledVector(wm,u).normalize(),h=g}o.push({p:h,dir:m,order:c})},f=(c?.5:l?.9:u?1.1:1.45)*n,p=(c?.09:l?.07:.2)*s,m=Em(r).multiplyScalar(.06).add(wm).normalize(),h=t.clone().addScaledVector(m,f);if(a.push({a:t,b:h,ra:p,rb:p*.78,order:0}),l){d(h,wm,1.4*n,.05*s,1,.2,.15);for(let e=0;e<4;e++){let e=r()*Math.PI*2,t=.5+r()*.5,i=new w(Math.sin(t)*Math.cos(e),Math.cos(t),Math.sin(t)*Math.sin(e));d(h.clone().addScaledVector(wm,(.2+r()*.7)*n),i,(.5+r()*.5)*n,.024*s,2,.28,.1)}}else{let e=c?3+ +(r()<.5):3+Math.floor(r()*3),t=r()*Math.PI*2;for(let i=0;i<e;i++){let a=t+i/e*Math.PI*2+(r()-.5)*.9,o=c?.7+r()*.35:u?.4+r()*.45:.6+r()*.55;d(h,new w(Math.sin(o)*Math.cos(a),Math.cos(o),Math.sin(o)*Math.sin(a)),(c?.85+r()*.35:u?1.5+r()*.7:1.5+r()*1.2)*n,(c?.065:.115)*s,0,c?.4:.26,c?.1:.14)}!c&&!u&&d(h,wm,(1.3+r()*.6)*n,.095*s,0,.2,.12)}return{segs:a,tips:o,fork:h}}function jm(e,t){return Q.bark.clone().lerp(Z(4929096),Math.min(1,e*.34)).offsetHSL((t-.5)*.02,0,(t-.5)*.04)}function Mm(e,t,n,r){let i=em(-.1,.9,t.y),a=e.getHSL({h:0,s:0,l:0}).h,o=a>.17&&a<.55?-.03:.02,s=e.clone().offsetHSL(o*i,.05*i,.09*i);return s.multiplyScalar(1-n*.42),s.offsetHSL((r()-.5)*.012,(r()-.5)*.04,(r()-.5)*.02)}function Nm(e,t,n,r,i,a,o=1,s=1){let c=t.reduce((e,n)=>e.addScaledVector(n.c,1/t.length),new w),l=new w(1,1.2,1),u=[{count:12,depth:[.35,.3],size:[.5,.22],inner:1},{count:62,depth:[.68,.32],size:[.28,.18],inner:0},{count:30,depth:[1,.13],size:[.12,.08],inner:0}];for(let d of t){let t=d.r/n;for(let f of u){let u=f.inner?1:o;for(let o=0,p=Math.round((f.inner?f.count:f.count*s)*i*t*t/u/u);o<p;o++){let t=a()*2-1,i=a()*Math.PI*2,o=Math.sqrt(1-t*t),s=new w(o*Math.cos(i)*1.12,t<0?t*.55:t,o*Math.sin(i)*1.12),p=f.depth[0]+a()*f.depth[1],m=d.c.clone().addScaledVector(s,d.r*p),h=m.clone().sub(c).multiply(l).normalize().multiplyScalar(.55).addScaledVector(s.clone().normalize(),.45).normalize(),g=f.inner?1:Math.max(0,(.85-p)/.25)*.5+(t<-.25?.4:0),_=(f.size[0]+a()*f.size[1])*n*u;nm(e,m,h,Mm(r(d,h,f.inner===1),h,Math.min(g,1),a),_,a(),[2.7,.45+a()*.35,-1,.7])}}}}function Pm(e,t,n,r,i,a){let o=Math.round(26*r*t.reduce((e,t)=>e+t.r*t.r,0)/3);for(let r=0;r<o;r++){let r=t[Math.floor(a()*t.length)],o=a()*.9-.2,s=a()*Math.PI*2,c=Math.sqrt(1-o*o),l=new w(c*Math.cos(s),o,c*Math.sin(s)),u=n.clone().offsetHSL((a()-.5)*.04,0,(a()-.5)*.08);nm(e,r.c.clone().addScaledVector(l,r.r),l,u,(.1+a()*.04)*Math.min(1.2,i),a(),[.2,1,-1,.5])}}function Fm(e){let t=[.25,.55,.82],n=Tm(e,2),r=Tm(e,3);return n<t[0]?r*.15:n<t[1]?.45+r*.17:n<t[2]?.7+r*.15:.88+r*.12}function Im(e,t){let n=[[0,e],[.28,Z(10793530)],[.5,Z(14854690)],[.75,Z(14707224)],[1,Z(12003868)]],r=Math.max(0,Math.min(1,t));for(let e=0;e<n.length-1;e++){let[t,i]=n[e],[a,o]=n[e+1];if(r<=a)return i.clone().lerp(o,(r-t)/(a-t))}return n[n.length-1][1].clone()}var Lm={white:Z(16312008),pink:Z(15773836),leafShare:.3},Rm=Z(10145109),zm=3.2;function Bm(e,t,n){let r=[],i=2+ +(n()<.5),a=n()*Math.PI;for(let o=0;o<i;o++){let s=a+o/i*Math.PI*2,c=new w(Math.cos(s),0,Math.sin(s)).multiplyScalar(.25*t);r.push({c:e.clone().add(c).add(new w(0,(.6+n()*.2)*t,0)),r:(.45+n()*.12)*t,tone:n()})}return r}var Vm=e=>e.kind===`cypress`||e.form===`wood`&&(e.kind===`broadleaf`||e.kind===`round`)&&Tm(e,1)<.2,Hm=e=>e.kind===`bush`&&e.form!==`orchard`,Um=Z(2054716),Wm=class{wood=new $d(`paint`);leaves=new $d(`foliage`);twigs=new $d(`foliage`);limbs=new $d(`paint`);litter=new $d(`foliage`);dress;constructor(e){this.dress=e}get season(){return this.dress?.season??`summer`}grow(e,t,n){let r=[this.wood,this.limbs,this.leaves,this.twigs,this.litter],i=r.map(e=>e.vertexCount),a=this.wood.lastTree;this.growOne(e,t,n);let o=this.wood.lastTree;o&&o!==a&&r.forEach((e,t)=>e.own(i[t],o))}growOne(e,t,n){let r=this.dress;if(!r){im(this.wood,this.leaves,e,t,n);return}if(Vm(t)){let r=t.kind===`cypress`?t.leaf:Um.clone().lerp(t.leaf??Q.deepLeaf,.25);im(this.wood,this.leaves,e,r?{...t,leaf:r}:t,n);return}im(Cm,Cm,e,t,n);let i=ef(Math.imul(Math.round(t.x*311),739982445)^Math.imul(Math.round(t.z*317),2246822507));r.season===`winter`?this.winter(e,t,i):this.leafy(e,t,i,r)}winter(e,t,n){let r=t.scale??1,i=e.height(t.x,t.z)-.05,a=new w(t.x,i,t.z),o=this.wood.vertexCount,s=this.twigs.vertexCount,c=r**.45*(t.stroke??1);if(Hm(t)){km(this.wood,a,a.clone().add(new w(0,.35*r,0)),.05*Math.sqrt(r),.03,Q.bark,5,Dm);let e=Bm(a,r,n),l=Z(5128004),u=Z(8020048);for(let t of e){let e=t.r/c;for(let r=0,i=Math.round(150*e*e);r<i;r++){let e=n()*2-1,r=n()*Math.PI*2,i=Math.sqrt(1-e*e),a=new w(i*Math.cos(r)*1.12,e<0?e*.55:e,i*Math.sin(r)*1.12),o=.55+n()*.5,s=t.c.clone().addScaledVector(a,t.r*o),d=l.clone().lerp(u,n()*.7).multiplyScalar(1-(e<0?.25:0));nm(this.twigs,s,a.clone().normalize(),d.offsetHSL(0,0,e*.03),(.07+n()*.08)*c,n(),[6.5,.2+n()*.14,Math.PI/2+(n()-.5)*1.8,.2])}}this.mark(o,s,t,i,r,.4*r);return}let l=t.kind===`broadleaf`?3:2,{segs:u,tips:d,fork:f}=Am(t,a,r,n,l);for(let e of u){let t=e.order===0?5:e.order===1?4:3;km(this.wood,e.a,e.b,e.ra,e.rb,jm(e.order,n()),t,e.order>=2?Om:Dm)}if(t.kind===`broadleaf`&&Tm(t,5)<.4){let e=t.form===`willow`,i=Z(11037492);for(let t of d){if(t.order<l-1)continue;let a=e?4:t.order>=l?2:1;for(let o=0;o<a;o++){let a=Em(n).multiplyScalar((.12+n()*.26)*r).add(wm.clone().multiplyScalar(e?-.5*r*n():.1*r*n())),o=t.p.clone().add(a).addScaledVector(t.dir,.15*r);n()<.5&&nm(this.twigs,o,t.dir,i.clone().offsetHSL((n()-.5)*.03,0,(n()-.5)*.06),(.09+n()*.06)*c,n(),[2.5,.6,-1,.4])}}}this.mark(o,s,t,i,r,Math.max(f.y-i,.2))}leafy(e,t,n,r){let i=t.scale??1,a=e.height(t.x,t.z)-.05,o=new w(t.x,a,t.z),s=this.wood.vertexCount,c=this.leaves.vertexCount,l=this.twigs.vertexCount,u=this.limbs.vertexCount,d=i**.45*(t.stroke??1),f=r.season===`spring`,p=t.leaf??(t.kind===`fruit`||t.kind===`bush`?Q.fruitLeaf:Q.leaf),m,h;if(t.kind===`bush`)m=Bm(o,i,n),km(this.wood,o,o.clone().add(new w(0,.3*i,0)),.05*Math.sqrt(i),.03,Q.bark,5,Dm),h=.25*i;else{let{segs:e,tips:r,fork:s}=Am(t,o,i,n,t.kind===`broadleaf`?2:1);for(let t of e)km(t.order===0?this.wood:this.limbs,t.a,t.b,t.ra,t.rb,jm(t.order,n()),t.order===0?5:t.order===1?4:3,Dm);m=r.filter(e=>e.order>=1||t.kind!==`broadleaf`).map(e=>({c:e.p.clone().addScaledVector(e.dir,.15*i).add(new w(0,.15*i,0)),r:(f?.42+n()*.22:.55+n()*.3)*i,tone:n()}));for(let e=m.length-1;e>0;e--){let t=Math.floor(n()*(e+1));[m[e],m[t]]=[m[t],m[e]]}m.length=Math.min(m.length,f?12:9),h=Math.max(s.y-a,.2)}m.length||(m=[{c:o.clone().add(new w(0,1.6*i,0)),r:.7*i,tone:n()}]),f?this.dressSpring(t,m,d,p,n,r,e):this.dressAutumn(t,m,d,p,n,r,e),this.mark(s,l,t,a,i,h,c,u)}dressSpring(e,t,n,r,i,a,o){let s=r.clone().lerp(Rm,.55),c=e.kind===`fruit`||e.form===`orchard`,l=!c&&(e.form===`hedge`&&Tm(e,6)<.14||e.form===`wood`&&Tm(e,6)<.09),u=c||l,d=Lm;Nm(this.leaves,t,n,(e,t,n)=>u&&!n&&i()>=(l?d.leafShare+.2:d.leafShare)?d.white.clone().lerp(d.pink,i()*.55+(t.y<0?.35:0)):(u&&n?s.clone().lerp(Z(12094072),.45):s.clone()).offsetHSL((e.tone-.5)*.04,0,(e.tone-.5)*.04),u?.92:.85,i,u?.78:1,e.fill),u&&this.fall(e,t,i,a,()=>d.white.clone().lerp(d.pink,i()),.025,o,[.05,.04])}dressAutumn(e,t,n,r,i,a,o){let s=Fm(e);for(let e of t)e.tone=s+(e.tone-.5)*2*.3;Nm(this.leaves,t,n,(e,t)=>Im(r,e.tone+t.y*.1),1-.2*Math.max(0,s),i,1,e.fill);let c=e.fruit??(e.kind===`fruit`?Q.fruit:null);c&&Pm(this.leaves,t,c,(e.fruitDensity??1)*.7,n,i),e.kind!==`bush`&&this.fall(e,t,i,a,()=>Im(r,s+(i()-.5)*.35).multiplyScalar(.85+i()*.15),.06+.12*Math.max(0,s),o,[.07,.06])}fall(e,t,n,r,i,a,o,s){let c=t.reduce((t,n)=>Math.max(t,Math.hypot(n.c.x-e.x,n.c.z-e.z)+n.r),.5)*1.15,l=Math.round(Math.PI*c*c*a*zm*16*(.07/(s[0]+s[1]/2))**2);for(let t=0;t<l;t++){let t=c*Math.sqrt(n())*(.25+.75*n()),a=n()*Math.PI*2,l=e.x+Math.cos(a)*t,u=e.z+Math.sin(a)*t;if(!r.canFall(l,u))continue;let d=s[0]+n()*s[1],f=o.height(l,u)+.03+d*.4;nm(this.litter,new w(l,f,u),wm,i(),d,n(),[6.4,.55,-1,.15])}}mark(e,t,n,r,i,a,o,s=this.limbs.vertexCount){let c=[...this.wood.heightsSince(e),...this.limbs.heightsSince(s),...this.twigs.heightsSince(t),...o===void 0?[]:this.leaves.heightsSince(o)],l=Math.max(...c,r+i)-r,u=Ld[n.kind],d=Math.max(a,l*.2),f=e=>{let t=Math.max(e-r,0);return Math.min(t/d,1)**2*(1-u)+Math.min(t/l,1)**2*u},p={x:n.x,z:n.z,height:l,kind:n.kind,scale:i};this.wood.markTree(e,p,f),this.limbs.vertexCount>s&&this.limbs.markTree(s,p,f),this.twigs.vertexCount>t&&this.twigs.markTree(t,p,f),o!==void 0&&this.leaves.vertexCount>o&&this.leaves.markTree(o,p,f)}addTo(e,t={}){let n=[],r=(r,i,a={})=>{r.vertexCount&&n.push(e.add(r.build(),i,{...t,...a}))};return r(this.wood,`paint`),r(this.limbs,`paint`,{castShadow:!1}),r(this.leaves,`foliage`),r(this.twigs,`foliage`,{cover:`none`,castShadow:!1}),r(this.litter,`foliage`,{cover:`none`,castShadow:!1}),n}},Gm=[`wheat`,`beans`,`tomato`,`sunflower`,`flax`],Km=[`oak`,`birch`,`pine`,`willow`,`poplar`,`apple`,`bush`],qm=Z(8021848),Jm={oak:{kind:`broadleaf`,leaf:Z(4161348),scale:1.5,far:{spring:Z(7776334),summer:Z(4617032),autumn:Z(14256690),winter:qm}},birch:{kind:`broadleaf`,leaf:Z(8829008),scale:1.25,far:{spring:Z(9550945),summer:Z(10272872),autumn:Z(14922812),winter:Z(9202790)}},pine:{kind:`cypress`,leaf:Z(2842188),scale:1.4,far:{spring:Z(2643535),summer:Z(2643535),autumn:Z(2643535),winter:Z(2643535)}},willow:{kind:`broadleaf`,form:`willow`,leaf:Z(7314504),scale:1.25,far:{spring:Z(9550945),summer:Z(8631184),autumn:Z(13480010),winter:Z(11832642)}},poplar:{kind:`cypress`,leaf:Z(4160068),scale:1.6,far:{spring:Z(5801552),summer:Z(3040061),autumn:Z(14922812),winter:qm}},apple:{kind:`fruit`,form:`orchard`,scale:1.05,far:{spring:Z(1532e4),summer:Z(5666883),autumn:Z(12613678),winter:qm}},bush:{kind:`bush`,form:`thicket`,scale:1.3,far:{spring:Z(7776334),summer:Z(5407292),autumn:Z(11030575),winter:Z(7165508)}}};function Ym(e,t,n,r,i){let a=Jm[e];return{kind:a.kind,form:a.form,leaf:a.leaf,x:t,z:n,seed:i,scale:a.scale*r}}function Xm(e,t,n,r,i,a,o,s){let c=Jm[a].far[o],l=n+i*1.3,u=Math.round(3+1.5*i);for(let n=0;n<u;n++){let n=s()*2-1,a=s()*Math.PI*2,o=Math.sqrt(1-n*n),u=new w(o*Math.cos(a),n<0?n*.6:n,o*Math.sin(a)),d=new w(t,l,r).addScaledVector(u,i*(.55+s()*.4)),f=em(-.2,.9,u.y);nm(e,d,u,c.clone().offsetHSL(-.02*f,.04*f,.08*f-.06).offsetHSL(0,0,(s()-.5)*.05),(.42+s()*.14)*i,s(),[.7,.5+s()*.3,-1,.6])}}var Zm=[{tall:.1,base:Z(9222224),deep:Z(6986308),tip:Z(11586664),root:Z(6969914)},{tall:.35,base:Z(8171594),deep:Z(5936194),tip:Z(11061344),root:Z(5144120),stalks:3},{tall:.7,base:Z(10271818),deep:Z(7248446),tip:Z(13815920),root:Z(6195770),stalks:5,ears:!0},{tall:.85,base:Q.wheat,deep:Q.wheatDeep,tip:Q.wheatTip,root:Q.wheatRoot,stalks:6,ears:!0}],Qm={base:Z(5212732),deep:Z(3170346),tip:Z(8827982),root:Z(4086314)},$m=[{tall:.12,...Qm,base:Z(6987844),plants:3,leaf:.09},{tall:.4,...Qm,plants:3,leaf:.16},{tall:1.4,...Qm,plants:3,leaf:.2,blooms:[{color:Z(15920374),per:5,size:.085},{color:Z(13017312),per:3,size:.08}]},{tall:1.55,...Qm,base:Z(4883e3),plants:3,leaf:.2,blooms:[{color:Z(9221180),per:9,size:.1,shape:.35,sink:.25},{color:Z(15920374),per:1.5,size:.075}]}],eh={base:Z(5147194),deep:Z(2906664),tip:Z(9090130),root:Z(3954216)},th=[{tall:.12,...eh,base:Z(6725702),plants:1.6,leaf:.1},{tall:.45,...eh,plants:1.6,leaf:.2},{tall:.85,...eh,plants:1.6,leaf:.26,blooms:[{color:Z(16044604),per:7,size:.075}]},{tall:.95,...eh,plants:1.6,leaf:.26,blooms:[{color:Z(14172202),per:7,size:.11,sink:.12},{color:Z(14708782),per:2,size:.1,sink:.15},{color:Z(16044604),per:1.5,size:.07}]}],nh={base:Z(5934900),deep:Z(3499050),tip:Z(9747530),root:Z(4546604)},rh=[{tall:.15,...nh,base:Z(7382084),plants:2.2,leaf:.1},{tall:.6,...nh,plants:2.2,leaf:.22},{tall:1.35,...nh,plants:2.2,leaf:.26,heads:{petals:Z(15909914),eye:Z(6969892),size:.13,per:2.2}},{tall:1.6,...nh,plants:2.2,leaf:.28,heads:{petals:Z(16172052),eye:Z(4861976),size:.2,per:2.2}}],ih={base:Z(7249508),deep:Z(5012050),tip:Z(10272902),root:Z(5400636)},ah={wheat:Zm,beans:$m,tomato:th,sunflower:rh,flax:[{tall:.08,...ih,base:Z(8826976)},{tall:.3,...ih,stalks:3},{tall:.55,...ih,stalks:4,blooms:[{color:Z(8826598),per:26,size:.06},{color:Z(11586800),per:8,size:.05}]},{tall:.65,...ih,base:Z(9084506),tip:Z(12891242),stalks:4,blooms:[{color:Z(8826598),per:14,size:.06},{color:Z(12098138),per:12,size:.05}]}]},oh=new w(0,1,0),sh=[[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]],ch=[2.5,.7,-1,.5],lh=[2.2,1,-1,.3],uh=class{mass=new $d(`crop`);stalks=new $d(`grass`);dabs=new $d(`foliage`);add(e){let t=e.side??4,n=t/2,r=e.joins??0,i=ah[e.crop][e.stage],a=(t,i)=>{let a=1/0;for(let[o,s,c]of sh)r&o||(a=Math.min(a,s?n-s*(t-e.x):n-c*(i-e.z)));return a},o=(e,t)=>Math.max(.02,i.tall*em(0,.7,a(e,t))*(1+.08*rf(e*.5,t*.5))),s=Math.max(2,Math.round(t/.5)+1),c=t/(s-1),l=this.mass.vertexCount,u=new W;for(let t=0;t<s;t++)for(let r=0;r<s;r++){let s=e.x-n+r*c,l=e.z-n+t*c,d=.12,f=new w(o(s-d,l)-o(s+d,l),2*d,o(s,l-d)-o(s,l+d)).normalize(),p=em(-.35,.35,Math.sin(l*1.7*Math.PI)+.3*rf(s*.08,l*.3));u.copy(i.base).lerp(i.deep,p*.6).lerp(i.tip,em(.5,.9,rf(s*.06+9,l*.09))*.3).lerp(i.root,(1-em(.1,.8,a(s,l)))*.35),this.mass.vertex({x:s,y:e.y+o(s,l),z:l},f,u,[.5,1.3,0,0])}for(let e=0;e<s-1;e++)for(let t=0;t<s-1;t++){let n=l+e*s+t;this.mass.quad(n,n+s,n+s+1,n+1)}let d=ef(Math.imul(Math.round(e.x*13),2654435761)^Math.round(e.z*17)),f=()=>{let n=e.x+(d()-.5)*t,r=e.z+(d()-.5)*t;return{x:n,z:r,d:a(n,r)}},p=t*t;if(i.stalks)for(let t=0,n=Math.round(i.stalks*p*2);t<n;t++){let{x:t,z:n,d:r}=f();r<.05||r>.8&&d()>.35||this.stalk(t,e.y,n,o(t,n)+i.tall*(.05+d()*.15),i,d,i.ears??!1)}if(i.plants&&i.leaf)for(let t=0,n=Math.round(i.plants*p*.6);t<n;t++){let{x:t,z:n,d:r}=f();if(r<.1)continue;let a=e.y+o(t,n);for(let e=0;e<3;e++){let e=new w(d()-.5,.9,d()-.5).normalize(),r=new w(t+e.x*i.leaf,a-i.leaf*(.2+d()*.5),n+e.z*i.leaf),o=em(0,1,e.y+(d()-.5)*.4),s=i.base.clone().lerp(i.tip,o*.5).lerp(i.deep,(1-o)*.4).offsetHSL((d()-.5)*.02,0,(d()-.5)*.05);nm(this.dabs,r,e,s,i.leaf*(.8+d()*.4),d(),ch)}}for(let t of i.blooms??[])for(let n=0,r=Math.round(t.per*p);n<r;n++){let{x:n,z:r,d:i}=f();if(i<.15)continue;let a=e.y+o(n,r)-(t.sink??0)*d()+t.size*.4;nm(this.dabs,new w(n,a,r),oh,t.color.clone().offsetHSL((d()-.5)*.02,0,(d()-.5)*.07),t.size*(.8+d()*.4),d(),t.shape?[lh[0],t.shape,Math.PI/2+(d()-.5)*.4,.3]:lh)}if(i.heads){let t=i.heads;for(let n=0,r=Math.round(t.per*p*.5);n<r;n++){let{x:n,z:r,d:a}=f();if(a<.2)continue;let s=e.y+i.tall*em(0,.7,a)*(.95+d()*.15);this.stalk(n,e.y+o(n,r)*.7,r,s-e.y-o(n,r)*.7,i,d,!1);let c=new w(n,s,r),l=new w(.6,.5,.3).normalize();nm(this.dabs,c,l,t.petals.clone().offsetHSL((d()-.5)*.02,0,(d()-.5)*.06),t.size*(.85+d()*.3),d(),[2.2,1,-1,.4]),nm(this.dabs,c.clone().addScaledVector(l,t.size*.5),l,t.eye,t.size*.42,d(),[2.1,1,-1,.1])}}}stalk(e,t,n,r,i,a,o){let s=this.stalks,c=.026,l=(a()-.5)*.12,u=a()*Math.PI,d=a(),f=Math.cos(u)*c,p=Math.sin(u)*c,m=[.5,1.4,.4,.8],h=new w(e+l,t+r,n+l*.5),g=i.tip.clone().lerp(i.deep,a()*.6),_=i.root.clone().lerp(g,.7),v=s.vertex({x:e-f,y:t,z:n-p},oh,i.root,m,[0,0],[0,d,-.026,u]),y=s.vertex({x:e+f,y:t,z:n+p},oh,i.root,m,[0,0],[0,d,c,u]),b=s.vertex({x:h.x+f*.6,y:h.y-.16,z:h.z+p*.6},oh,_,m,[0,0],[.8,d,c*.6,u]),x=s.vertex({x:h.x-f*.6,y:h.y-.16,z:h.z-p*.6},oh,_,m,[0,0],[.8,d,-.0156,u]);if(s.quad(v,y,b,x),!o)return;let S=s.vertex({x:h.x-f*2.2,y:h.y-.06,z:h.z-p*2.2},oh,g,m,[0,0],[.9,d,-.0572,u]),C=s.vertex({x:h.x+f*2.2,y:h.y-.06,z:h.z+p*2.2},oh,g,m,[0,0],[.9,d,c*2.2,u]),T=s.vertex({x:h.x+l*.3,y:h.y+.12,z:h.z},oh,g,m,[0,0],[1,d]);s.tri(x,b,C),s.tri(x,C,T),s.tri(x,T,S)}addTo(e){let t=[e.add(this.mass.build(),`crop`)];this.stalks.vertexCount&&t.push(e.add(this.stalks.build(),`grass`,{castShadow:!1,seasonal:!1})),this.dabs.vertexCount&&t.push(e.add(this.dabs.build(),`foliage`,{castShadow:!1,cover:`none`}));for(let e of t)e.userData.crop=!0;return t}},dh=[.4,2.5,1.57,0],fh=e=>{let t=e()*2-1,n=e()*Math.PI*2,r=Math.sqrt(1-t*t);return new w(r*Math.cos(n),t,r*Math.sin(n))};function ph(e,t,n,r,i,a){let o=new Fe(i,r,t.distanceTo(n),7,4),s=new u().setFromUnitVectors(oh,n.clone().sub(t).normalize());e.addGeometry(o,new $e().compose(t.clone().lerp(n,.5),s,new w(1,1,1)),a,dh),o.dispose()}function mh(e,t,n,r){let i=em(-.1,.9,t.y),a=e.getHSL({h:0,s:0,l:0}).h,o=a>.17&&a<.55?-.03:.02;return e.clone().offsetHSL(o*i,.05*i,.09*i).multiplyScalar(1-n*.42).offsetHSL((r()-.5)*.012,(r()-.5)*.04,(r()-.5)*.03)}function hh(e,t,n,r,i){let a=t.scale??1,o=e.flatMap(([e,t])=>e.heightsSince(t)),s=Math.max(...o,r+a)-r,c=Ld[n],l=Math.max(i,s*.2),u=e=>{let t=Math.max(e-r,0);return Math.min(t/l,1)**2*(1-c)+Math.min(t/s,1)**2*c},d={x:t.x,z:t.z,height:s,kind:n,scale:a};for(let[t,n]of e)t.vertexCount>n&&t.markTree(n,d,u)}var gh=(e,t,n,r=7)=>Math.round(r*e/(4*t*t)*(.4+.6*(n.fill??1)));function _h(e,t,n,r,i){n===`pine`?yh(e,t,r,i):n===`willow`?xh(e,t,r,i):n===`poplar`?Sh(e,t,r,i):e.grow(t,r,i)}var vh=Z(2842188);function yh(e,t,n,r){let i=n.scale??1,a=t.height(n.x,n.z)-.05,o=new w(n.x,a,n.z),{wood:s,leaves:c}=e,l=s.vertexCount,u=c.vertexCount,d=i**.45*(n.stroke??1),f=n.leaf??vh,p=(t,n)=>{let i=mh(f,t,n,r);return e.season===`spring`&&t.y>.4&&r()<.3?i.lerp(Z(7314e3),.35):i},m=6.4*i,h=Math.sqrt(i);ph(s,o,o.clone().add(new w(0,m*.9,0)),.17*h,.04*h,Q.bark);let g=.08*m,_=1.75*i,v=6+Math.floor(r()*3),y=r()*Math.PI*2,b=e=>_*(1-e)**1.05+.08*i,x=.24*d,S=gh(Math.PI*_*Math.hypot(_,m),x,n);for(let e=0;e<S;e++){let e=1-Math.sqrt(r()),t=r()*Math.PI*2,n=r()<.18?.55+r()*.3:0,a=.84+.22*Math.max(0,Math.cos((t-y)*v*.5))**2+(r()-.5)*.08,s=b(e)*a*(1-n*.6),l=o.clone().add(new w(Math.cos(t)*s,g+e*(m-g)-.25*i*(s/_),Math.sin(t)*s)),u=new w(Math.cos(t),.45+e*.4,Math.sin(t)).normalize();nm(c,l,u,p(u,n),x*(n?1.5:.75+r()*.5),r(),[.65,.5,-1,.4])}hh([[s,l],[c,u]],n,`cypress`,a,g)}function bh(e,t,n){let r=e.leaf??Z(7314504);return t===`spring`?r.clone().lerp(Z(11850858),.55):t===`autumn`?r.clone().lerp(Z(14203964),.6+n()*.3):r.clone()}function xh(e,t,n,r){let i=n.scale??1,a=t.height(n.x,n.z)-.05,o=new w(n.x,a,n.z),s=Math.sqrt(i),{wood:c,leaves:l,twigs:u}=e,d=c.vertexCount,f=l.vertexCount,p=u.vertexCount,m=i**.45*(n.stroke??1),h=e.season===`winter`,g=h?u:l,_=(e,t,n,i,a)=>h?nm(g,e,t.clone().setY(t.y+1.4).normalize(),n,i*.75,r(),[6.4,.16,a,.3]):nm(g,e,t,n,i,r(),[.6,.3,a,.5]),v=bh(n,e.season,r),y=o.clone().add(new w((r()-.5)*.4*i,1.3*i,(r()-.5)*.4*i));ph(c,o,y,.28*s,.2*s,Q.bark);let b=y.clone().add(new w(0,1.75*i,0)),x=2.3*i,S=1.25*i,C=4+Math.floor(r()*2),T=r()*Math.PI*2;for(let e=0;e<C;e++){let t=T+e/C*Math.PI*2+(r()-.5)*.6,n=b.clone().add(new w(Math.cos(t)*x*.75,S*.35,Math.sin(t)*x*.75));ph(c,y,y.clone().lerp(n,.55).add(new w(0,.5*i,0)),.12*s,.08*s,Q.bark),ph(c,y.clone().lerp(n,.55).add(new w(0,.5*i,0)),n,.08*s,.035*s,Q.bark)}if(!h){let e=.27*m,t=gh(2*Math.PI*x*x*.8,e,n);for(let n=0;n<t;n++){let t=fh(r);t.y<-.15&&(t.y=-t.y*.4);let n=r()<.2?.6:0;nm(l,b.clone().add(new w(t.x*x,t.y*S,t.z*x).multiplyScalar(n?.6:.9+r()*.15)),t,mh(v,t,n,r),e*(n?1.4:.8+r()*.4),r(),[.6,.55,-1,.5])}}let E=Z(13148224),D=(h?.2:.22)*m,O=Math.round(2*Math.PI*x/D*(n.fill??1));for(let e=0;e<O*1.3;e++){let t=r()*Math.PI*2,o=e>=O,s=x*(o?.7:.9+r()*.15),c=b.y+S*(.05+r()*.3)-(o?.2*i:0),l=a+(.35+r()*.7)*i,u=(h?.24:.3)*m,d=Math.max(2,Math.round((c-l)/u));for(let e=0;e<=d;e++){let a=e/d,u=s+.3*i*a*a,f=new w(n.x+Math.cos(t)*u,c-a*(c-l),n.z+Math.sin(t)*u),p=new w(Math.cos(t),.25-.5*a,Math.sin(t)).normalize();h?_(f,p,E.clone().offsetHSL((r()-.5)*.03,0,(r()-.5)*.08-a*.05),.15*m,Math.PI/2):_(f,p,mh(v,p,o?.55:a*.25,r),.2*m,Math.PI/2+(r()-.5)*.2)}}hh([[c,d],[l,f],[u,p]],n,`broadleaf`,a,1.3*i)}function Sh(e,t,n,r){let i=n.scale??1,a=t.height(n.x,n.z)-.05,o=new w(n.x,a,n.z),s=Math.sqrt(i),{wood:c,leaves:l,twigs:u}=e,d=c.vertexCount,f=l.vertexCount,p=u.vertexCount,m=i**.45*(n.stroke??1),h=e.season,g=7.2*i,_=.07*g;ph(c,o,o.clone().add(new w(0,g*.88,0)),.18*s,.04*s,Q.bark);let v=e=>(.22+.6*Math.sin(Math.PI*Math.min(1,.1+e*.92))**.7*(1-.4*e))*i,y=n.leaf??Z(4160068),b=(Math.imul(Math.round(n.x*97),2654435761)>>>0)/4294967296,x=h===`spring`?y.clone().lerp(Z(10275934),.6):h===`autumn`?y.clone().lerp(Z(15120442),.65+b*.35):y,S=h===`winter`,C=S?u:l,T=(S?.15:.22)*m,E=2*Math.PI*.6*i*(g-_);for(let e=0,t=gh(E,T,n,S?3:7);e<t;e++){let e=r(),t=r()*Math.PI*2,n=S?0:r()<.18?.55+r()*.3:0,i=v(e)*(n?.5:.85+r()*.25),a=o.clone().add(new w(Math.cos(t)*i,_+e*(g-_),Math.sin(t)*i)),s=new w(Math.cos(t),S?1.4:.3+e*.6,Math.sin(t)).normalize();S?nm(C,a,s,Q.bark.clone().lerp(Z(4929096),.3+r()*.4).offsetHSL(0,0,(r()-.5)*.05),T,r(),[6.4,.14,Math.PI/2+(r()-.5)*.3,.2]):nm(C,a,s,mh(x,s,n,r),T*(n?1.4:.8+r()*.4),r(),[.6,.38,Math.PI/2+(r()-.5)*.35,.45])}hh([[c,d],[l,f],[u,p]],n,`cypress`,a,_)}var Ch=class extends ft{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new Oh(e)}),this.register(function(e){return new kh(e)}),this.register(function(e){return new Rh(e)}),this.register(function(e){return new zh(e)}),this.register(function(e){return new Bh(e)}),this.register(function(e){return new jh(e)}),this.register(function(e){return new Mh(e)}),this.register(function(e){return new Nh(e)}),this.register(function(e){return new Ph(e)}),this.register(function(e){return new Dh(e)}),this.register(function(e){return new Fh(e)}),this.register(function(e){return new Ah(e)}),this.register(function(e){return new Lh(e)}),this.register(function(e){return new Ih(e)}),this.register(function(e){return new Th(e)}),this.register(function(e){return new Vh(e)}),this.register(function(e){return new Hh(e)})}load(e,t,n,r){let i=this,a;if(this.resourcePath!==``)a=this.resourcePath;else if(this.path!==``){let t=Ze.extractUrlBase(e);a=Ze.resolveURL(t,this.path)}else a=Ze.extractUrlBase(e);this.manager.itemStart(e);let o=function(t){r?r(t):console.error(t),i.manager.itemError(e),i.manager.itemEnd(e)},s=new c(this.manager);s.setPath(this.path),s.setResponseType(`arraybuffer`),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,function(n){try{i.parse(n,a,function(n){t(n),i.manager.itemEnd(e)},o)}catch(e){o(e)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let i,a={},o={},s=new TextDecoder;if(typeof e==`string`)i=JSON.parse(e);else if(e instanceof ArrayBuffer){if(s.decode(new Uint8Array(e,0,4))===Uh){try{a[$.KHR_BINARY_GLTF]=new Kh(e)}catch(e){r&&r(e);return}i=JSON.parse(a[$.KHR_BINARY_GLTF].content)}else i=JSON.parse(s.decode(e))}else i=e;if(i.asset===void 0||i.asset.version[0]<2){r&&r(Error(`THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.`));return}let c=new vg(i,{path:t||this.resourcePath||``,crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let e=0;e<this.pluginCallbacks.length;e++){let t=this.pluginCallbacks[e](c);t.name||console.error(`THREE.GLTFLoader: Invalid plugin found: missing name`),o[t.name]=t,a[t.name]=!0}if(i.extensionsUsed)for(let e=0;e<i.extensionsUsed.length;++e){let t=i.extensionsUsed[e],n=i.extensionsRequired||[];switch(t){case $.KHR_MATERIALS_UNLIT:a[t]=new Eh;break;case $.KHR_DRACO_MESH_COMPRESSION:a[t]=new qh(i,this.dracoLoader);break;case $.KHR_TEXTURE_TRANSFORM:a[t]=new Jh;break;case $.KHR_MESH_QUANTIZATION:a[t]=new Yh;break;default:n.indexOf(t)>=0&&o[t]===void 0&&console.warn(`THREE.GLTFLoader: Unknown extension "`+t+`".`)}}c.setExtensions(a),c.setPlugins(o),c.parse(n,r)}parseAsync(e,t){let n=this;return new Promise(function(r,i){n.parse(e,t,r,i)})}};function wh(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}var $={KHR_BINARY_GLTF:`KHR_binary_glTF`,KHR_DRACO_MESH_COMPRESSION:`KHR_draco_mesh_compression`,KHR_LIGHTS_PUNCTUAL:`KHR_lights_punctual`,KHR_MATERIALS_CLEARCOAT:`KHR_materials_clearcoat`,KHR_MATERIALS_DISPERSION:`KHR_materials_dispersion`,KHR_MATERIALS_IOR:`KHR_materials_ior`,KHR_MATERIALS_SHEEN:`KHR_materials_sheen`,KHR_MATERIALS_SPECULAR:`KHR_materials_specular`,KHR_MATERIALS_TRANSMISSION:`KHR_materials_transmission`,KHR_MATERIALS_IRIDESCENCE:`KHR_materials_iridescence`,KHR_MATERIALS_ANISOTROPY:`KHR_materials_anisotropy`,KHR_MATERIALS_UNLIT:`KHR_materials_unlit`,KHR_MATERIALS_VOLUME:`KHR_materials_volume`,KHR_TEXTURE_BASISU:`KHR_texture_basisu`,KHR_TEXTURE_TRANSFORM:`KHR_texture_transform`,KHR_MESH_QUANTIZATION:`KHR_mesh_quantization`,KHR_MATERIALS_EMISSIVE_STRENGTH:`KHR_materials_emissive_strength`,EXT_MATERIALS_BUMP:`EXT_materials_bump`,EXT_TEXTURE_WEBP:`EXT_texture_webp`,EXT_TEXTURE_AVIF:`EXT_texture_avif`,EXT_MESHOPT_COMPRESSION:`EXT_meshopt_compression`,EXT_MESH_GPU_INSTANCING:`EXT_mesh_gpu_instancing`},Th=class{constructor(e){this.parser=e,this.name=$.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(t){let n=this.parser,i=`light:`+t,a=n.cache.get(i);if(a)return a;let o=n.json,c=((o.extensions&&o.extensions[this.name]||{}).lights||[])[t],l,u=new W(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],e);let d=c.range===void 0?0:c.range;switch(c.type){case`directional`:l=new ne(u),l.target.position.set(0,0,-1),l.add(l.target);break;case`point`:l=new s(u),l.distance=d;break;case`spot`:l=new r(u),l.distance=d,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle===void 0?0:c.spot.innerConeAngle,c.spot.outerConeAngle=c.spot.outerConeAngle===void 0?Math.PI/4:c.spot.outerConeAngle,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw Error(`THREE.GLTFLoader: Unexpected light type: `+c.type)}return l.position.set(0,0,0),ug(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=n.createUniqueName(c.name||`light_`+t),a=Promise.resolve(l),n.cache.add(i,a),a}getDependency(e,t){if(e===`light`)return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],i=(r.extensions&&r.extensions[this.name]||{}).light;return i===void 0?null:this._loadLight(i).then(function(e){return n._getNodeRef(t.cache,i,e)})}},Eh=class{constructor(){this.name=$.KHR_MATERIALS_UNLIT}getMaterialType(){return Ce}extendParams(t,n,r){let i=[];t.color=new W(1,1,1),t.opacity=1;let a=n.pbrMetallicRoughness;if(a){if(Array.isArray(a.baseColorFactor)){let n=a.baseColorFactor;t.color.setRGB(n[0],n[1],n[2],e),t.opacity=n[3]}a.baseColorTexture!==void 0&&i.push(r.assignTexture(t,`map`,a.baseColorTexture,xe))}return Promise.all(i)}},Dh=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Oh=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&i.push(n.assignTexture(t,`clearcoatMap`,a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&i.push(n.assignTexture(t,`clearcoatRoughnessMap`,a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(i.push(n.assignTexture(t,`clearcoatNormalMap`,a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){let e=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new _(e,e)}return Promise.all(i)}},kh=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_DISPERSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name];return t.dispersion=r.dispersion===void 0?0:r.dispersion,Promise.resolve()}},Ah=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&i.push(n.assignTexture(t,`iridescenceMap`,a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&i.push(n.assignTexture(t,`iridescenceThicknessMap`,a.iridescenceThicknessTexture)),Promise.all(i)}},jh=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_SHEEN}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(t,n){let r=this.parser,i=r.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let a=[];n.sheenColor=new W(0,0,0),n.sheenRoughness=0,n.sheen=1;let o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){let t=o.sheenColorFactor;n.sheenColor.setRGB(t[0],t[1],t[2],e)}return o.sheenRoughnessFactor!==void 0&&(n.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&a.push(r.assignTexture(n,`sheenColorMap`,o.sheenColorTexture,xe)),o.sheenRoughnessTexture!==void 0&&a.push(r.assignTexture(n,`sheenRoughnessMap`,o.sheenRoughnessTexture)),Promise.all(a)}},Mh=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&i.push(n.assignTexture(t,`transmissionMap`,a.transmissionTexture)),Promise.all(i)}},Nh=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_VOLUME}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(t,n){let r=this.parser,i=r.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let a=[],o=i.extensions[this.name];n.thickness=o.thicknessFactor===void 0?0:o.thicknessFactor,o.thicknessTexture!==void 0&&a.push(r.assignTexture(n,`thicknessMap`,o.thicknessTexture)),n.attenuationDistance=o.attenuationDistance||1/0;let s=o.attenuationColor||[1,1,1];return n.attenuationColor=new W().setRGB(s[0],s[1],s[2],e),Promise.all(a)}},Ph=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_IOR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name];return t.ior=r.ior===void 0?1.5:r.ior,Promise.resolve()}},Fh=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_SPECULAR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(t,n){let r=this.parser,i=r.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let a=[],o=i.extensions[this.name];n.specularIntensity=o.specularFactor===void 0?1:o.specularFactor,o.specularTexture!==void 0&&a.push(r.assignTexture(n,`specularIntensityMap`,o.specularTexture));let s=o.specularColorFactor||[1,1,1];return n.specularColor=new W().setRGB(s[0],s[1],s[2],e),o.specularColorTexture!==void 0&&a.push(r.assignTexture(n,`specularColorMap`,o.specularColorTexture,xe)),Promise.all(a)}},Ih=class{constructor(e){this.parser=e,this.name=$.EXT_MATERIALS_BUMP}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return t.bumpScale=a.bumpFactor===void 0?1:a.bumpFactor,a.bumpTexture!==void 0&&i.push(n.assignTexture(t,`bumpMap`,a.bumpTexture)),Promise.all(i)}},Lh=class{constructor(e){this.parser=e,this.name=$.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ee}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&i.push(n.assignTexture(t,`anisotropyMap`,a.anisotropyTexture)),Promise.all(i)}},Rh=class{constructor(e){this.parser=e,this.name=$.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let i=r.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures`);return null}return t.loadTextureImage(e,i.source,a)}},zh=class{constructor(e){this.parser=e,this.name=$.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},Bh=class{constructor(e){this.parser=e,this.name=$.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},Vh=class{constructor(e){this.name=$.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let e=n.extensions[this.name],r=this.parser.getDependency(`buffer`,e.buffer),i=this.parser.options.meshoptDecoder;if(!i||!i.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files`);return null}return r.then(function(t){let n=e.byteOffset||0,r=e.byteLength||0,a=e.count,o=e.byteStride,s=new Uint8Array(t,n,r);return i.decodeGltfBufferAsync?i.decodeGltfBufferAsync(a,o,s,e.mode,e.filter).then(function(e){return e.buffer}):i.ready.then(function(){let t=new ArrayBuffer(a*o);return i.decodeGltfBuffer(new Uint8Array(t),a,o,s,e.mode,e.filter),t})})}return null}},Hh=class{constructor(e){this.name=$.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let r=t.meshes[n.mesh];for(let e of r.primitives)if(e.mode!==$h.TRIANGLES&&e.mode!==$h.TRIANGLE_STRIP&&e.mode!==$h.TRIANGLE_FAN&&e.mode!==void 0)return null;let i=n.extensions[this.name].attributes,a=[],o={};for(let e in i)a.push(this.parser.getDependency(`accessor`,i[e]).then(t=>(o[e]=t,o[e])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(e=>{let t=e.pop(),n=t.isGroup?t.children:[t],r=e[0].count,i=[];for(let e of n){let t=new $e,n=new w,a=new u,s=new w(1,1,1),c=new te(e.geometry,e.material,r);for(let e=0;e<r;e++)o.TRANSLATION&&n.fromBufferAttribute(o.TRANSLATION,e),o.ROTATION&&a.fromBufferAttribute(o.ROTATION,e),o.SCALE&&s.fromBufferAttribute(o.SCALE,e),c.setMatrixAt(e,t.compose(n,a,s));for(let t in o)if(t===`_COLOR_0`){let e=o[t];c.instanceColor=new y(e.array,e.itemSize,e.normalized)}else t!==`TRANSLATION`&&t!==`ROTATION`&&t!==`SCALE`&&e.geometry.setAttribute(t,o[t]);vt.prototype.copy.call(c,e),this.parser.assignFinalMaterial(c),i.push(c)}return t.isGroup?(t.clear(),t.add(...i),t):i[0]}))}},Uh=`glTF`,Wh=12,Gh={JSON:1313821514,BIN:5130562},Kh=class{constructor(e){this.name=$.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Wh),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Uh)throw Error(`THREE.GLTFLoader: Unsupported glTF-Binary header.`);if(this.header.version<2)throw Error(`THREE.GLTFLoader: Legacy binary file detected.`);let r=this.header.length-Wh,i=new DataView(e,Wh),a=0;for(;a<r;){let t=i.getUint32(a,!0);a+=4;let r=i.getUint32(a,!0);if(a+=4,r===Gh.JSON){let r=new Uint8Array(e,Wh+a,t);this.content=n.decode(r)}else if(r===Gh.BIN){let n=Wh+a;this.body=e.slice(n,n+t)}a+=t}if(this.content===null)throw Error(`THREE.GLTFLoader: JSON content not found.`)}},qh=class{constructor(e,t){if(!t)throw Error(`THREE.GLTFLoader: No DRACOLoader instance provided.`);this.name=$.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(t,n){let r=this.json,i=this.dracoLoader,a=t.extensions[this.name].bufferView,o=t.extensions[this.name].attributes,s={},c={},l={};for(let e in o){let t=ig[e]||e.toLowerCase();s[t]=o[e]}for(let e in t.attributes){let n=ig[e]||e.toLowerCase();if(o[e]!==void 0){let i=r.accessors[t.attributes[e]];l[n]=eg[i.componentType].name,c[n]=i.normalized===!0}}return n.getDependency(`bufferView`,a).then(function(t){return new Promise(function(n,r){i.decodeDracoFile(t,function(e){for(let t in e.attributes){let n=e.attributes[t],r=c[t];r!==void 0&&(n.normalized=r)}n(e)},s,l,e,r)})})}},Jh=class{constructor(){this.name=$.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0?e:(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0,e)}},Yh=class{constructor(){this.name=$.KHR_MESH_QUANTIZATION}},Xh=class extends v{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r*3+r;for(let e=0;e!==r;e++)t[e]=n[i+e];return t}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=o*2,c=o*3,l=r-t,u=(n-t)/l,d=u*u,f=d*u,p=e*c,m=p-c,h=-2*f+3*d,g=f-d,_=1-h,v=g-d+u;for(let e=0;e!==o;e++){let t=a[m+e+o],n=a[m+e+s]*l,r=a[p+e+o],c=a[p+e]*l;i[e]=_*t+v*n+h*r+g*c}return i}},Zh=new u,Qh=class extends Xh{interpolate_(e,t,n,r){let i=super.interpolate_(e,t,n,r);return Zh.fromArray(i).normalize().toArray(i),i}},$h={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},eg={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},tg={9728:Je,9729:de,9984:Pe,9985:I,9986:Le,9987:he},ng={33071:we,33648:rt,10497:R},rg={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},ig={POSITION:`position`,NORMAL:`normal`,TANGENT:`tangent`,TEXCOORD_0:`uv`,TEXCOORD_1:`uv1`,TEXCOORD_2:`uv2`,TEXCOORD_3:`uv3`,COLOR_0:`color`,WEIGHTS_0:`skinWeight`,JOINTS_0:`skinIndex`},ag={scale:`scale`,translation:`position`,rotation:`quaternion`,weights:`morphTargetInfluences`},og={CUBICSPLINE:void 0,LINEAR:ue,STEP:se},sg={OPAQUE:`OPAQUE`,MASK:`MASK`,BLEND:`BLEND`};function cg(e){return e.DefaultMaterial===void 0&&(e.DefaultMaterial=new je({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:0})),e.DefaultMaterial}function lg(e,t,n){for(let r in n.extensions)e[r]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[r]=n.extensions[r])}function ug(e,t){t.extras!==void 0&&(typeof t.extras==`object`?Object.assign(e.userData,t.extras):console.warn(`THREE.GLTFLoader: Ignoring primitive type .extras, `+t.extras))}function dg(e,t,n){let r=!1,i=!1,a=!1;for(let e=0,n=t.length;e<n;e++){let n=t[e];if(n.POSITION!==void 0&&(r=!0),n.NORMAL!==void 0&&(i=!0),n.COLOR_0!==void 0&&(a=!0),r&&i&&a)break}if(!r&&!i&&!a)return Promise.resolve(e);let o=[],s=[],c=[];for(let l=0,u=t.length;l<u;l++){let u=t[l];if(r){let t=u.POSITION===void 0?e.attributes.position:n.getDependency(`accessor`,u.POSITION);o.push(t)}if(i){let t=u.NORMAL===void 0?e.attributes.normal:n.getDependency(`accessor`,u.NORMAL);s.push(t)}if(a){let t=u.COLOR_0===void 0?e.attributes.color:n.getDependency(`accessor`,u.COLOR_0);c.push(t)}}return Promise.all([Promise.all(o),Promise.all(s),Promise.all(c)]).then(function(t){let n=t[0],o=t[1],s=t[2];return r&&(e.morphAttributes.position=n),i&&(e.morphAttributes.normal=o),a&&(e.morphAttributes.color=s),e.morphTargetsRelative=!0,e})}function fg(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,r=t.weights.length;n<r;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let t=0,r=n.length;t<r;t++)e.morphTargetDictionary[n[t]]=t}else console.warn(`THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.`)}}function pg(e){let t,n=e.extensions&&e.extensions[$.KHR_DRACO_MESH_COMPRESSION];if(t=n?`draco:`+n.bufferView+`:`+n.indices+`:`+mg(n.attributes):e.indices+`:`+mg(e.attributes)+`:`+e.mode,e.targets!==void 0)for(let n=0,r=e.targets.length;n<r;n++)t+=`:`+mg(e.targets[n]);return t}function mg(e){let t=``,n=Object.keys(e).sort();for(let r=0,i=n.length;r<i;r++)t+=n[r]+`:`+e[n[r]]+`;`;return t}function hg(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw Error(`THREE.GLTFLoader: Unsupported normalized accessor component type.`)}}function gg(e){return e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0?`image/jpeg`:e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0?`image/webp`:e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0?`image/ktx2`:`image/png`}var _g=new $e,vg=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new wh,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,i=!1,a=-1;if(typeof navigator<`u`){let e=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(e)===!0;let t=e.match(/Version\/(\d+)/);r=n&&t?parseInt(t[1],10):-1,i=e.indexOf(`Firefox`)>-1,a=i?e.match(/Firefox\/([0-9]+)\./)[1]:-1}this.textureLoader=typeof createImageBitmap>`u`||n&&r<17||i&&a<98?new O(this.options.manager):new m(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new c(this.options.manager),this.fileLoader.setResponseType(`arraybuffer`),this.options.crossOrigin===`use-credentials`&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,r=this.json,i=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(e){return e._markDefs&&e._markDefs()}),Promise.all(this._invokeAll(function(e){return e.beforeRoot&&e.beforeRoot()})).then(function(){return Promise.all([n.getDependencies(`scene`),n.getDependencies(`animation`),n.getDependencies(`camera`)])}).then(function(t){let a={scene:t[0][r.scene||0],scenes:t[0],animations:t[1],cameras:t[2],asset:r.asset,parser:n,userData:{}};return lg(i,a,r),ug(a,r),Promise.all(n._invokeAll(function(e){return e.afterRoot&&e.afterRoot(a)})).then(function(){for(let e of a.scenes)e.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n].joints;for(let t=0,n=r.length;t<n;t++)e[r[t]].isBone=!0}for(let t=0,r=e.length;t<r;t++){let r=e[t];r.mesh!==void 0&&(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0&&(n[r.mesh].isSkinnedMesh=!0)),r.camera!==void 0&&this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let r=n.clone(),i=(e,t)=>{let n=this.associations.get(e);n!=null&&this.associations.set(t,n);for(let[n,r]of e.children.entries())i(r,t.children[n])};return i(n,r),r.name+=`_instance_`+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let r=e(t[n]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let r=0;r<t.length;r++){let i=e(t[r]);i&&n.push(i)}return n}getDependency(e,t){let n=e+`:`+t,r=this.cache.get(n);if(!r){switch(e){case`scene`:r=this.loadScene(t);break;case`node`:r=this._invokeOne(function(e){return e.loadNode&&e.loadNode(t)});break;case`mesh`:r=this._invokeOne(function(e){return e.loadMesh&&e.loadMesh(t)});break;case`accessor`:r=this.loadAccessor(t);break;case`bufferView`:r=this._invokeOne(function(e){return e.loadBufferView&&e.loadBufferView(t)});break;case`buffer`:r=this.loadBuffer(t);break;case`material`:r=this._invokeOne(function(e){return e.loadMaterial&&e.loadMaterial(t)});break;case`texture`:r=this._invokeOne(function(e){return e.loadTexture&&e.loadTexture(t)});break;case`skin`:r=this.loadSkin(t);break;case`animation`:r=this._invokeOne(function(e){return e.loadAnimation&&e.loadAnimation(t)});break;case`camera`:r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(n){return n!=this&&n.getDependency&&n.getDependency(e,t)}),!r)throw Error(`Unknown type: `+e)}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,r=this.json[e+(e===`mesh`?`es`:`s`)]||[];t=Promise.all(r.map(function(t,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!==`arraybuffer`)throw Error(`THREE.GLTFLoader: `+t.type+` buffer type is not supported.`);if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[$.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(e,i){n.load(Ze.resolveURL(t.uri,r.path),e,void 0,function(){i(Error(`THREE.GLTFLoader: Failed to load buffer "`+t.uri+`".`))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency(`buffer`,t.buffer).then(function(e){let n=t.byteLength||0,r=t.byteOffset||0;return e.slice(r,r+n)})}loadAccessor(e){let t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let e=rg[r.type],t=eg[r.componentType],n=r.normalized===!0,i=new t(r.count*e);return Promise.resolve(new U(i,e,n))}let a=[];return r.bufferView===void 0?a.push(null):a.push(this.getDependency(`bufferView`,r.bufferView)),r.sparse!==void 0&&(a.push(this.getDependency(`bufferView`,r.sparse.indices.bufferView)),a.push(this.getDependency(`bufferView`,r.sparse.values.bufferView))),Promise.all(a).then(function(e){let a=e[0],o=rg[r.type],s=eg[r.componentType],c=s.BYTES_PER_ELEMENT,l=c*o,u=r.byteOffset||0,d=r.bufferView===void 0?void 0:n.bufferViews[r.bufferView].byteStride,f=r.normalized===!0,p,m;if(d&&d!==l){let e=Math.floor(u/d),n=`InterleavedBuffer:`+r.bufferView+`:`+r.componentType+`:`+e+`:`+r.count,l=t.cache.get(n);l||(p=new s(a,e*d,r.count*d/c),l=new i(p,d/c),t.cache.add(n,l)),m=new ce(l,o,u%d/c,f)}else p=a===null?new s(r.count*o):new s(a,u,r.count*o),m=new U(p,o,f);if(r.sparse!==void 0){let t=rg.SCALAR,n=eg[r.sparse.indices.componentType],i=r.sparse.indices.byteOffset||0,c=r.sparse.values.byteOffset||0,l=new n(e[1],i,r.sparse.count*t),u=new s(e[2],c,r.sparse.count*o);a!==null&&(m=new U(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let e=0,t=l.length;e<t;e++){let t=l[e];if(m.setX(t,u[e*o]),o>=2&&m.setY(t,u[e*o+1]),o>=3&&m.setZ(t,u[e*o+2]),o>=4&&m.setW(t,u[e*o+3]),o>=5)throw Error(`THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.`)}m.normalized=f}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,i=t.images[r],a=this.textureLoader;if(i.uri){let e=n.manager.getHandler(i.uri);e!==null&&(a=e)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let r=this,i=this.json,a=i.textures[e],o=i.images[t],s=(o.uri||o.bufferView)+`:`+a.sampler;if(this.textureCache[s])return this.textureCache[s];let c=this.loadImageSource(t,n).then(function(t){t.flipY=!1,t.name=a.name||o.name||``,t.name===``&&typeof o.uri==`string`&&o.uri.startsWith(`data:image/`)===!1&&(t.name=o.uri);let n=(i.samplers||{})[a.sampler]||{};return t.magFilter=tg[n.magFilter]||1006,t.minFilter=tg[n.minFilter]||1008,t.wrapS=ng[n.wrapS]||1e3,t.wrapT=ng[n.wrapT]||1e3,t.generateMipmaps=!t.isCompressedTexture&&t.minFilter!==1003&&t.minFilter!==1006,r.associations.set(t,{textures:e}),t}).catch(function(){return null});return this.textureCache[s]=c,c}loadImageSource(e,t){let n=this,r=this.json,i=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(e=>e.clone());let a=r.images[e],o=self.URL||self.webkitURL,s=a.uri||``,c=!1;if(a.bufferView!==void 0)s=n.getDependency(`bufferView`,a.bufferView).then(function(e){c=!0;let t=new Blob([e],{type:a.mimeType});return s=o.createObjectURL(t),s});else if(a.uri===void 0)throw Error(`THREE.GLTFLoader: Image `+e+` is missing URI and bufferView`);let l=Promise.resolve(s).then(function(e){return new Promise(function(n,r){let a=n;t.isImageBitmapLoader===!0&&(a=function(e){let t=new Be(e);t.needsUpdate=!0,n(t)}),t.load(Ze.resolveURL(e,i.path),a,void 0,r)})}).then(function(e){return c===!0&&o.revokeObjectURL(s),ug(e,a),e.userData.mimeType=a.mimeType||gg(a.uri),e}).catch(function(e){throw console.error(`THREE.GLTFLoader: Couldn't load texture`,s),e});return this.sourceCache[e]=l,l}assignTexture(e,t,n,r){let i=this;return this.getDependency(`texture`,n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),i.extensions[$.KHR_TEXTURE_TRANSFORM]){let e=n.extensions===void 0?void 0:n.extensions[$.KHR_TEXTURE_TRANSFORM];if(e){let t=i.associations.get(a);a=i.extensions[$.KHR_TEXTURE_TRANSFORM].extendTexture(a,e),i.associations.set(a,t)}}return r!==void 0&&(a.colorSpace=r),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,r=t.attributes.tangent===void 0,i=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let e=`PointsMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new oe,st.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,t.sizeAttenuation=!1,this.cache.add(e,t)),n=t}else if(e.isLine){let e=`LineBasicMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new it,st.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,this.cache.add(e,t)),n=t}if(r||i||a){let e=`ClonedMaterial:`+n.uuid+`:`;r&&(e+=`derivative-tangents:`),i&&(e+=`vertex-colors:`),a&&(e+=`flat-shading:`);let t=this.cache.get(e);t||(t=n.clone(),i&&(t.vertexColors=!0),a&&(t.flatShading=!0),r&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(n))),n=t}e.material=n}getMaterialType(){return je}loadMaterial(t){let n=this,r=this.json,i=this.extensions,a=r.materials[t],o,s={},c=a.extensions||{},l=[];if(c[$.KHR_MATERIALS_UNLIT]){let e=i[$.KHR_MATERIALS_UNLIT];o=e.getMaterialType(),l.push(e.extendParams(s,a,n))}else{let r=a.pbrMetallicRoughness||{};if(s.color=new W(1,1,1),s.opacity=1,Array.isArray(r.baseColorFactor)){let t=r.baseColorFactor;s.color.setRGB(t[0],t[1],t[2],e),s.opacity=t[3]}r.baseColorTexture!==void 0&&l.push(n.assignTexture(s,`map`,r.baseColorTexture,xe)),s.metalness=r.metallicFactor===void 0?1:r.metallicFactor,s.roughness=r.roughnessFactor===void 0?1:r.roughnessFactor,r.metallicRoughnessTexture!==void 0&&(l.push(n.assignTexture(s,`metalnessMap`,r.metallicRoughnessTexture)),l.push(n.assignTexture(s,`roughnessMap`,r.metallicRoughnessTexture))),o=this._invokeOne(function(e){return e.getMaterialType&&e.getMaterialType(t)}),l.push(Promise.all(this._invokeAll(function(e){return e.extendMaterialParams&&e.extendMaterialParams(t,s)})))}a.doubleSided===!0&&(s.side=2);let u=a.alphaMode||sg.OPAQUE;if(u===sg.BLEND?(s.transparent=!0,s.depthWrite=!1):(s.transparent=!1,u===sg.MASK&&(s.alphaTest=a.alphaCutoff===void 0?.5:a.alphaCutoff)),a.normalTexture!==void 0&&o!==Ce&&(l.push(n.assignTexture(s,`normalMap`,a.normalTexture)),s.normalScale=new _(1,1),a.normalTexture.scale!==void 0)){let e=a.normalTexture.scale;s.normalScale.set(e,e)}if(a.occlusionTexture!==void 0&&o!==Ce&&(l.push(n.assignTexture(s,`aoMap`,a.occlusionTexture)),a.occlusionTexture.strength!==void 0&&(s.aoMapIntensity=a.occlusionTexture.strength)),a.emissiveFactor!==void 0&&o!==Ce){let t=a.emissiveFactor;s.emissive=new W().setRGB(t[0],t[1],t[2],e)}return a.emissiveTexture!==void 0&&o!==Ce&&l.push(n.assignTexture(s,`emissiveMap`,a.emissiveTexture,xe)),Promise.all(l).then(function(){let e=new o(s);return a.name&&(e.name=a.name),ug(e,a),n.associations.set(e,{materials:t}),a.extensions&&lg(i,e,a),e})}createUniqueName(e){let t=p.sanitizeNodeName(e||``);return t in this.nodeNamesUsed?t+`_`+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,r=this.primitiveCache;function i(e){return n[$.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(e,t).then(function(n){return bg(n,e,t)})}let a=[];for(let n=0,o=e.length;n<o;n++){let o=e[n],s=pg(o),c=r[s];if(c)a.push(c.promise);else{let e;e=o.extensions&&o.extensions[$.KHR_DRACO_MESH_COMPRESSION]?i(o):bg(new We,o,t),r[s]={primitive:o,promise:e},a.push(e)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,r=this.extensions,i=n.meshes[e],a=i.primitives,o=[];for(let e=0,t=a.length;e<t;e++){let t=a[e].material===void 0?cg(this.cache):this.getDependency(`material`,a[e].material);o.push(t)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(n){let o=n.slice(0,n.length-1),s=n[n.length-1],c=[];for(let n=0,l=s.length;n<l;n++){let l=s[n],u=a[n],d,p=o[n];if(u.mode===$h.TRIANGLES||u.mode===$h.TRIANGLE_STRIP||u.mode===$h.TRIANGLE_FAN||u.mode===void 0)d=i.isSkinnedMesh===!0?new f(l,p):new ut(l,p),d.isSkinnedMesh===!0&&d.normalizeSkinWeights(),u.mode===$h.TRIANGLE_STRIP?d.geometry=Zd(d.geometry,1):u.mode===$h.TRIANGLE_FAN&&(d.geometry=Zd(d.geometry,2));else if(u.mode===$h.LINES)d=new pe(l,p);else if(u.mode===$h.LINE_STRIP)d=new C(l,p);else if(u.mode===$h.LINE_LOOP)d=new x(l,p);else if(u.mode===$h.POINTS)d=new bt(l,p);else throw Error(`THREE.GLTFLoader: Primitive mode unsupported: `+u.mode);Object.keys(d.geometry.morphAttributes).length>0&&fg(d,i),d.name=t.createUniqueName(i.name||`mesh_`+e),ug(d,i),u.extensions&&lg(r,d,u),t.assignFinalMaterial(d),c.push(d)}for(let n=0,r=c.length;n<r;n++)t.associations.set(c[n],{meshes:e,primitives:n});if(c.length===1)return i.extensions&&lg(r,c[0],i),c[0];let l=new D;i.extensions&&lg(r,l,i),t.associations.set(l,{meshes:e});for(let e=0,t=c.length;e<t;e++)l.add(c[e]);return l})}loadCamera(e){let t,n=this.json.cameras[e],r=n[n.type];if(!r){console.warn(`THREE.GLTFLoader: Missing camera parameters.`);return}return n.type===`perspective`?t=new H(G.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type===`orthographic`&&(t=new Et(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),ug(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let e=0,r=t.joints.length;e<r;e++)n.push(this._loadNodeShallow(t.joints[e]));return t.inverseBindMatrices===void 0?n.push(null):n.push(this.getDependency(`accessor`,t.inverseBindMatrices)),Promise.all(n).then(function(e){let n=e.pop(),r=e,i=[],a=[];for(let e=0,o=r.length;e<o;e++){let o=r[e];if(o){i.push(o);let t=new $e;n!==null&&t.fromArray(n.array,e*16),a.push(t)}else console.warn(`THREE.GLTFLoader: Joint "%s" could not be found.`,t.joints[e])}return new ae(i,a)})}loadAnimation(e){let t=this.json,n=this,r=t.animations[e],i=r.name?r.name:`animation_`+e,a=[],o=[],s=[],c=[],l=[];for(let e=0,t=r.channels.length;e<t;e++){let t=r.channels[e],n=r.samplers[t.sampler],i=t.target,u=i.node,d=r.parameters===void 0?n.input:r.parameters[n.input],f=r.parameters===void 0?n.output:r.parameters[n.output];i.node!==void 0&&(a.push(this.getDependency(`node`,u)),o.push(this.getDependency(`accessor`,d)),s.push(this.getDependency(`accessor`,f)),c.push(n),l.push(i))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(s),Promise.all(c),Promise.all(l)]).then(function(e){let t=e[0],a=e[1],o=e[2],s=e[3],c=e[4],l=[];for(let e=0,r=t.length;e<r;e++){let r=t[e],i=a[e],u=o[e],d=s[e],f=c[e];if(r===void 0)continue;r.updateMatrix&&r.updateMatrix();let p=n._createAnimationTracks(r,i,u,d,f);if(p)for(let e=0;e<p.length;e++)l.push(p[e])}let u=new Ye(i,void 0,l);return ug(u,r),u})}createNodeMesh(e){let t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency(`mesh`,r.mesh).then(function(e){let t=n._getNodeRef(n.meshCache,r.mesh,e);return r.weights!==void 0&&t.traverse(function(e){if(e.isMesh)for(let t=0,n=r.weights.length;t<n;t++)e.morphTargetInfluences[t]=r.weights[t]}),t})}loadNode(e){let t=this.json,n=this,r=t.nodes[e],i=n._loadNodeShallow(e),a=[],o=r.children||[];for(let e=0,t=o.length;e<t;e++)a.push(n.getDependency(`node`,o[e]));let s=r.skin===void 0?Promise.resolve(null):n.getDependency(`skin`,r.skin);return Promise.all([i,Promise.all(a),s]).then(function(e){let t=e[0],n=e[1],r=e[2];r!==null&&t.traverse(function(e){e.isSkinnedMesh&&e.bind(r,_g)});for(let e=0,r=n.length;e<r;e++)t.add(n[e]);return t})}_loadNodeShallow(e){let t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let i=t.nodes[e],a=i.name?r.createUniqueName(i.name):``,o=[],s=r._invokeOne(function(t){return t.createNodeMesh&&t.createNodeMesh(e)});return s&&o.push(s),i.camera!==void 0&&o.push(r.getDependency(`camera`,i.camera).then(function(e){return r._getNodeRef(r.cameraCache,i.camera,e)})),r._invokeAll(function(t){return t.createNodeAttachment&&t.createNodeAttachment(e)}).forEach(function(e){o.push(e)}),this.nodeCache[e]=Promise.all(o).then(function(t){let o;if(o=i.isBone===!0?new Re:t.length>1?new D:t.length===1?t[0]:new vt,o!==t[0])for(let e=0,n=t.length;e<n;e++)o.add(t[e]);if(i.name&&(o.userData.name=i.name,o.name=a),ug(o,i),i.extensions&&lg(n,o,i),i.matrix!==void 0){let e=new $e;e.fromArray(i.matrix),o.applyMatrix4(e)}else i.translation!==void 0&&o.position.fromArray(i.translation),i.rotation!==void 0&&o.quaternion.fromArray(i.rotation),i.scale!==void 0&&o.scale.fromArray(i.scale);if(!r.associations.has(o))r.associations.set(o,{});else if(i.mesh!==void 0&&r.meshCache.refs[i.mesh]>1){let e=r.associations.get(o);r.associations.set(o,{...e})}return r.associations.get(o).nodes=e,o}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],r=this,i=new D;n.name&&(i.name=r.createUniqueName(n.name)),ug(i,n),n.extensions&&lg(t,i,n);let a=n.nodes||[],o=[];for(let e=0,t=a.length;e<t;e++)o.push(r.getDependency(`node`,a[e]));return Promise.all(o).then(function(e){for(let t=0,n=e.length;t<n;t++)i.add(e[t]);return r.associations=(e=>{let t=new Map;for(let[e,n]of r.associations)(e instanceof st||e instanceof Be)&&t.set(e,n);return e.traverse(e=>{let n=r.associations.get(e);n!=null&&t.set(e,n)}),t})(i),i})}_createAnimationTracks(e,t,n,r,i){let a=[],o=e.name?e.name:e.uuid,s=[];ag[i.path]===ag.weights?e.traverse(function(e){e.morphTargetInfluences&&s.push(e.name?e.name:e.uuid)}):s.push(o);let c;switch(ag[i.path]){case ag.weights:c=ye;break;case ag.rotation:c=N;break;case ag.translation:case ag.scale:c=S;break;default:switch(n.itemSize){case 1:c=ye;break;default:c=S}}let l=r.interpolation===void 0?ue:og[r.interpolation],u=this._getArrayFromAccessor(n);for(let e=0,n=s.length;e<n;e++){let n=new c(s[e]+`.`+ag[i.path],t.array,u,l);r.interpolation===`CUBICSPLINE`&&this._createCubicSplineTrackInterpolant(n),a.push(n)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let e=hg(t.constructor),n=new Float32Array(t.length);for(let r=0,i=t.length;r<i;r++)n[r]=t[r]*e;t=n}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(e){return new(this instanceof N?Qh:Xh)(this.times,this.values,this.getValueSize()/3,e)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function yg(e,t,n){let r=t.attributes,i=new q;if(r.POSITION!==void 0){let e=n.json.accessors[r.POSITION],t=e.min,a=e.max;if(t!==void 0&&a!==void 0){if(i.set(new w(t[0],t[1],t[2]),new w(a[0],a[1],a[2])),e.normalized){let t=hg(eg[e.componentType]);i.min.multiplyScalar(t),i.max.multiplyScalar(t)}}else{console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`);return}}else return;let a=t.targets;if(a!==void 0){let e=new w,t=new w;for(let r=0,i=a.length;r<i;r++){let i=a[r];if(i.POSITION!==void 0){let r=n.json.accessors[i.POSITION],a=r.min,o=r.max;if(a!==void 0&&o!==void 0){if(t.setX(Math.max(Math.abs(a[0]),Math.abs(o[0]))),t.setY(Math.max(Math.abs(a[1]),Math.abs(o[1]))),t.setZ(Math.max(Math.abs(a[2]),Math.abs(o[2]))),r.normalized){let e=hg(eg[r.componentType]);t.multiplyScalar(e)}e.max(t)}else console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`)}}i.expandByVector(e)}e.boundingBox=i;let o=new l;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,e.boundingSphere=o}function bg(e,t,n){let r=t.attributes,i=[];function a(t,r){return n.getDependency(`accessor`,t).then(function(t){e.setAttribute(r,t)})}for(let t in r){let n=ig[t]||t.toLowerCase();n in e.attributes||i.push(a(r[t],n))}if(t.indices!==void 0&&!e.index){let r=n.getDependency(`accessor`,t.indices).then(function(t){e.setIndex(t)});i.push(r)}return et.workingColorSpace!==`srgb-linear`&&`COLOR_0`in r&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${et.workingColorSpace}" not supported.`),ug(e,t),yg(e,t,n),Promise.all(i).then(function(){return t.targets===void 0?e:dg(e,t.targets,n)})}var xg={plain:Qd,timber:[2,1,0,0],glass:[1,2,2,0],tin:[3,0,5,0]},Sg=[.75,2.6,.7,.25],Cg=new Ch;async function wg(e){return(await Cg.loadAsync(e)).scene}var Tg={herb:{leaf:[8368718,6987850,9222738],foot:4881984,dabs:12},flower:{leaf:[7645772,6987850],foot:4881984,bloom:[15764400,16109374,16249572,10975960,15226698],dabs:12},shrub:{leaf:[5151290,4229210,5939262],foot:3107394,dabs:20},vine:{leaf:[5939262,5151290,6989898],foot:4094524,dabs:9}},Eg=/^(move_spin_|running_|charge_(\d+))/,Dg=/^running_(glow|lamp|beacon|light|fire|.*window)/,Og=.3,kg=.5,Ag=8,jg=new W(.58,.57,.62),Mg=[.4,.9,-1,.3];function Ng(e){let t=e.geometry.getAttribute(`_color`);if(!t)return 1;let n=0;for(let e=0;e<t.count;e++)n+=t.getY(e);return n/Math.max(t.count,1)}var Pg=.6,Fg=class{smoke=[];spins=[];running=[];charges=[];windows=[];table=null;slots=[];gens=[];pace=0;shown={running:!0,charge:null};get any(){return this.spins.length+this.running.length+this.charges.length+this.windows.length>0}spin(e){this.pace=e;for(let t of this.spins){let n=this.slot(t);n!==null&&this.table.spin(n,e)}}show(e){e.running!==void 0&&(this.shown.running=e.running),e.charge!==void 0&&(this.shown.charge=e.charge),this.apply()}bind(e,t){this.table=e,this.slots=t,this.gens=t.map(t=>e.generation(t)),this.spin(this.pace),this.apply()}apply(){if(!this.table)return;for(let e of this.running){let t=this.slot(e);t!==null&&this.table.show(t,this.shown.running)}for(let e of this.windows){let t=this.slot(e);t!==null&&this.table.light(t,this.shown.running)}let e=this.shown.charge;this.charges.forEach((t,n)=>{for(let r of t){let t=this.slot(r);t!==null&&this.table.show(t,e===null||n<e)}})}slot(e){let t=this.slots[e];return t!==void 0&&this.table.generation(t)===this.gens[e]?t:null}},Ig=class{ink=new $d(`ink`);paint=new $d(`paint`);leaves=new $d(`foliage`);smoke=new $d(`smoke`);rand;smokeRand;parts=[];things=[];constructor(e=7){this.rand=ef(e),this.smokeRand=ef(e+1013)}add(e,t,n=!1){e.updateMatrixWorld(!0);let r=new w,i=new w,a=new W,o=new w,s=new u,c=new Fg,l=new Map,d={at:new w,n:0,part:-1},f=new Map;this.things.push(c);let p=n=>{for(let r=n;r&&r!==e;r=r.parent){let e=Eg.exec(r.name);if(!e)continue;let n=l.get(r);if(n===void 0){let i=t.clone().multiply(r.matrixWorld),a=e[1]===`move_spin_`;n=this.parts.push({origin:new w().setFromMatrixPosition(i),axis:new w().setFromMatrixColumn(i,0).normalize(),speed:a?r.userData.speed??Pg:0,glow:Dg.test(r.name)?Vc.lamp:Vc.none})-1,l.set(r,n),a?c.spins.push(n):e[2]===void 0?c.running.push(n):(c.charges[Number(e[2])]??=[]).push(n)}return n+1}return 0};e.traverse(e=>{let l=e,u=t.clone().multiply(e.matrixWorld);if(!l.isMesh){let t=/^plant_([a-z]+)_/.exec(e.name)?.[1];t&&Tg[t]&&(u.decompose(r,s,o),this.grow(t,r,o.x,o.y)),/^smoke_emitter/.test(e.name)&&this.chimney(c,new w().setFromMatrixPosition(u));return}let m=l.material.name,h=m===`moss`,g=new B().getNormalMatrix(u),_=h?this.paint:this.ink;_.part=p(e);let v=!_.part&&m===`glass`&&Ng(l)>Og;v&&d.part<0&&(d.part=this.parts.push({origin:new w,axis:new w(1,0,0),speed:0,glow:Vc.window})-1,c.windows.push(d.part));let y=h?Sg:xg[m]??Qd,b=l.geometry,x=n&&!h?[y[0],y[1],y[2],1]:y,S=b.getAttribute(`position`),C=b.getAttribute(`normal`),T=b.getAttribute(`_color`),E=b.getAttribute(`uv`),D=_.vertexCount,O=_.part>0&&this.parts[_.part-1].glow===Vc.lamp?f.get(_.part)??{at:new w,n:0}:null;O&&f.set(_.part,O);for(let e=0;e<S.count;e++){r.fromBufferAttribute(S,e).applyMatrix4(u),i.fromBufferAttribute(C,e).applyMatrix3(g).normalize(),T?a.setRGB(T.getX(e),T.getY(e),T.getZ(e)):a.setRGB(1,1,1);let t=v&&Math.abs(i.y)<kg;t&&(_.part=d.part+1,d.at.add(r),d.n++),O&&(O.at.add(r),O.n++),_.vertex(r,i,a,x,E?[E.getX(e),E.getY(e)]:[0,0]),t&&(_.part=0)}let k=b.index;if(k)for(let e=0;e<k.count;e+=3)_.tri(D+k.getX(e),D+k.getX(e+1),D+k.getX(e+2));else for(let e=0;e<S.count;e+=3)_.tri(D+e,D+e+1,D+e+2);_.part=0});for(let e=0;e<c.charges.length;e++)c.charges[e]??=[];d.part>=0&&this.parts[d.part].origin.copy(d.at.divideScalar(Math.max(d.n,1)));for(let[e,t]of f)t.n&&(this.parts[e-1].light=t.at.divideScalar(t.n));return c}chimney(e,t){e.smoke.push(t);let n=this.parts.push({origin:t.clone(),axis:new w(1,0,0),speed:0,glow:Vc.none})-1;e.running.push(n),this.smoke.part=n+1;let r=new w(0,1,0),i=this.smokeRand;for(let e=0;e<Ag;e++)nm(this.smoke,t,r,jg.clone().offsetHSL(0,0,(i()-.5)*.06),.3*(.8+i()*.4),(e+i()*.6)/Ag,Mg);this.smoke.part=0}grow(e,t,n,r){let i=Tg[e],a=this.rand,o=e=>Z(e[Math.floor(a()*e.length)]),s=o(i.leaf),c=Z(i.foot),l=i.bloom?o(i.bloom):void 0,u=Math.round(i.dabs*Math.max(.6,n/.5));if(e!==`vine`){vm(this.leaves,t.x,t.y,t.z,n,r,s,c,u,a,l);return}for(let e=0;e<r;e+=n*.9){let i=1-e/r*.35;vm(this.leaves,t.x+(a()-.5)*n*.5,t.y+e,t.z+(a()-.5)*n*.5,n*i,n*1.3,s.clone().offsetHSL(0,0,(a()-.5)*.05),c,u,a)}}addTo(e,t){let n=[],r=e.parts,i=r?this.parts.map(e=>r.add(e.origin,e.axis,e.speed,e.glow,e.light)):void 0;if(this.ink.vertexCount&&n.push(e.add(this.ink.build(i),`ink`,{tag:t})),this.paint.vertexCount&&n.push(e.add(this.paint.build(i),`paint`,{seasonal:!0,cover:`full`,tag:t})),this.leaves.vertexCount&&n.push(e.add(this.leaves.build(),`foliage`,{cover:`none`,seasonal:!0,tag:t})),this.smoke.vertexCount&&i&&n.push(e.add(this.smoke.build(i),`smoke`,{cover:`none`,castShadow:!1})),r&&i){for(let e of this.things)e.bind(r,i);r.unheld(i)}return n}},Lg=class{gpu;frames=[];ext;pool=[];current=null;frame={cpu:{},queries:[]};waiting=[];gl;constructor(e,t=!0){this.gl=e,this.ext=t?e.getExtension(`EXT_disjoint_timer_query_webgl2`):null,this.gpu=this.ext!==null}mark(e,t=!0){let n=performance.now(),r=this.gl,i=this.ext;if(this.current&&(this.frame.cpu[this.current.name]=(this.frame.cpu[this.current.name]??0)+n-this.current.cpu,i&&this.current.gpu&&r.endQuery(i.TIME_ELAPSED_EXT)),this.current=e===null?null:{name:e,cpu:n,gpu:t},e!==null&&i&&t){let t=this.pool.pop()??r.createQuery();r.beginQuery(i.TIME_ELAPSED_EXT,t),this.frame.queries.push([e,t])}}endFrame(){this.mark(null);let e={cpu:this.frame.cpu,gpu:null};this.frames.push(e),this.ext&&this.waiting.push({times:e,queries:this.frame.queries}),this.frame={cpu:{},queries:[]},this.poll()}poll(){let e=this.gl,t=this.ext;if(t){if(e.getParameter(t.GPU_DISJOINT_EXT)){for(let t of this.waiting.splice(0))for(let[,n]of t.queries)e.deleteQuery(n);return}for(;this.waiting.length;){let t=this.waiting[0];if(!t.queries.every(([,t])=>e.getQueryParameter(t,e.QUERY_RESULT_AVAILABLE)))break;this.waiting.shift();let n={};for(let[r,i]of t.queries)n[r]=(n[r]??0)+e.getQueryParameter(i,e.QUERY_RESULT)/1e6,this.pool.push(i);t.times.gpu=n}}}async settle(){for(let e=0;this.waiting.length&&e<600;e++)await new Promise(e=>setTimeout(e,5)),this.poll()}reset(){this.frames.length=0}},Rg=[`setup`,`shelter`,`clouds`,`shadow`,`under`,`reflect`,`main`,`post`,`bolt`],zg=[`ground`,`paint`,`grass`,`foliage`,`crop`,`ink`,`water`,`debris`,`rain`,`snow`];async function Bg(e,t,n,r,i=()=>{},a=90){let o=e.gl.getContext(),s=new Lg(o),c=new Uint8Array(4),l=()=>o.readPixels(0,0,1,1,o.RGBA,o.UNSIGNED_BYTE,c),u=()=>new Promise(e=>requestAnimationFrame(e)),d=[],f=20,p=e.view,m=p.zoom,h=e.quality,g=e.maxRatio,_={...e.settings};e.setMaxRatio(1/0);let v={width:p.screen.width,height:p.screen.height},y=new ee(1,1,{depthBuffer:!1});e.output=y;try{for(let[c,g]of r.entries()){e.setQuality({...g.quality??h,...g.tweak}),Object.assign(e.settings,_,g.settings),e.resize(g.width/e.screenRatio,g.height/e.screenRatio),y.setSize(o.drawingBufferWidth,o.drawingBufferHeight),p.zoom=m*g.height/1080,p.update(0,!0),n(g),g.weather&&e.setWeather(g.weather,!0);let r={nx:1,nz:1,cell:2e3,x0:-1e3,z0:-1e3};g.lying!==void 0&&e.setGround({...r,snow:new Float32Array([g.lying])},0),g.frost!==void 0&&e.setGround({...r,frost:new Float32Array([g.frost])},0),g.wet&&e.setGround({...r,wet:new Float32Array([g.wet.wet]),mud:new Float32Array([g.wet.mud])},0);let v=ls(g.wind,31*Math.PI/180);e.setWind(v,v,0);for(let t of zg)e.setVisible(t,!g.hide?.includes(t));let b=e.lightning.clock;if(g.lightning){let t=b();e.lightning.clock=()=>t,e.strike({x:e.view.target.x,z:e.view.target.z,seed:7}),e.lightning.clock=()=>t+.03}let x=n=>{g.shelter&&e.shelter.changed(),t(n)};for(let e=0;e<20;e++)x(f+=1/60),e%5==4&&(l(),await u());l(),e.timer=s,s.reset();let S=[];for(let e=0;e<a;e++){let t=performance.now();x(f+=1/60),S.push(performance.now()-t),e%6==5&&await u()}e.timer=null,await s.settle();let C=s.frames.filter(e=>e.gpu),w=s.gpu&&C.length?Vg(C.map(e=>e.gpu)):null,T={...Vg(s.frames.map(e=>e.cpu)),frame:Ug(S)};l();let E=performance.now();for(let e=0;e<30;e++)x(f+=1/60);l();let D=(performance.now()-E)/30,O=[],k=new Lg(o,!1);e.timer=k;for(let e=0;e<12;e++){let e=performance.now();x(f+=1/60),O.push(performance.now()-e),l()}e.timer=null;let A=e.gl.info,j=A.autoReset,M=0,N=0;A.autoReset=!1;try{A.reset(),x(f+=1/60),M=A.render.calls,N=A.render.triangles}finally{A.autoReset=j}l();let P={label:g.label,width:g.width,height:g.height,gpu:w,cpu:T,uncapped:D,cpuAlone:Ug(O),cpuAlonePasses:Vg(k.frames.map(e=>e.cpu)),draws:M,triangles:N};e.lightning.clock=b,d.push(P),i(P,c)}}finally{e.output=null,y.dispose(),e.timer=null,e.setQuality(h),Object.assign(e.settings,_),e.maxRatio=g,e.resize(v.width,v.height);for(let t of zg)e.setVisible(t,!0);p.zoom=m,p.update(0,!0),n()}return d}function Vg(e){let t={};for(let n of Rg)t[n]=Ug(e.map(e=>e[n]??0));return t.frame=Rg.reduce((e,n)=>e+t[n],0),t}function Hg(e){let t=e[0].map((t,n)=>Math.max(...e.map(e=>e[n].length)));return e.map(e=>e.map((e,n)=>n?e.padStart(t[n]):e.padEnd(t[n])).join(`  `)).join(`
`)}function Ug(e){let t=[...e].sort((e,t)=>e-t);return t.length?t.length%2?t[(t.length-1)/2]:(t[t.length/2-1]+t[t.length/2])/2:0}function Wg(e){let t=`${Hg([[`case`,...Rg.slice(1).map(e=>`${e}`),`GPU`,`CPU`,`CPU alone`,`draws`,`uncapped`,`fps`],...e.map(e=>[e.label,...Rg.slice(1).map(t=>e.gpu?e.gpu[t].toFixed(2):`-`),e.gpu?e.gpu.frame.toFixed(2):`-`,e.cpu.frame.toFixed(2),e.cpuAlone.toFixed(2),String(e.draws),e.uncapped.toFixed(2),(1e3/e.uncapped).toFixed(0)])])}\n\nCPU alone, pass by pass (where the CPU waits on the GPU, the pass takes the GPU's time so far):\n${Hg([[`case`,...Rg],...e.map(e=>[e.label,...Rg.map(t=>(e.cpuAlonePasses[t]??0).toFixed(2))])])}`;return e.some(e=>e.gpu&&e.gpu.frame>e.uncapped*1.5)?`${t}\n\nThe GPU timers here add up to far more than the uncapped frame: they count waiting, not work. Read the uncapped column.`:t}export{Jt as $,$p as A,ad as B,tm as C,Yp as D,Xp as E,$d as F,ls as G,Fc as H,Qd as I,Ca as J,ss as K,rf as L,hp as M,up as N,Zp as O,Vf as P,qt as Q,ef as R,fm as S,rm as T,Pc as U,Zu as V,os as W,za as X,Sa as Y,fa as Z,ym as _,wg as a,_m as b,Km as c,Ym as d,Vt as et,Wm as f,dm as g,xm as h,Ig as i,vp as j,Qp as k,Xm as l,Q as m,Wg as n,Gm as o,Sm as p,Ua as q,Bg as r,uh as s,zg as t,_h as u,bm as v,em as w,am as x,vm as y,Z as z};