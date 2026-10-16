(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`attached`,t=1e3,n=1001,r=1002,i=1003,a=1004,o=1005,s=1006,c=1007,l=1008,u=1009,d=1010,f=1011,p=1012,m=1013,h=1014,g=1015,_=1016,v=1017,y=1018,b=1020,x=35902,S=35899,C=1021,w=1022,T=1023,E=1026,D=1027,ee=1028,O=1029,k=1030,A=1031,te=1033,j=33776,M=33777,N=33778,P=33779,ne=35840,re=35841,ie=35842,ae=35843,oe=36196,se=37492,ce=37496,F=37808,le=37809,ue=37810,de=37811,fe=37812,pe=37813,me=37814,I=37815,he=37816,ge=37817,_e=37818,L=37819,ve=37820,R=37821,ye=36492,be=36494,xe=36495,Se=36283,Ce=36284,we=36285,Te=36286,Ee=2300,De=2301,Oe=2302,ke=2400,Ae=2401,je=2402,Me=2500,Ne=3200,Pe=3201,Fe=`srgb`,Ie=`srgb-linear`,Le=`linear`,Re=`srgb`,ze=7680,Be=35044,Ve=35048,He=`300 es`,Ue=2e3,We=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Ge=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Ke=1234567,qe=Math.PI/180,Je=180/Math.PI;function Ye(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Ge[e&255]+Ge[e>>8&255]+Ge[e>>16&255]+Ge[e>>24&255]+`-`+Ge[t&255]+Ge[t>>8&255]+`-`+Ge[t>>16&15|64]+Ge[t>>24&255]+`-`+Ge[n&63|128]+Ge[n>>8&255]+`-`+Ge[n>>16&255]+Ge[n>>24&255]+Ge[r&255]+Ge[r>>8&255]+Ge[r>>16&255]+Ge[r>>24&255]).toLowerCase()}function z(e,t,n){return Math.max(t,Math.min(n,e))}function Xe(e,t){return(e%t+t)%t}function Ze(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function Qe(e,t,n){return e===t?0:(n-e)/(t-e)}function $e(e,t,n){return(1-n)*e+n*t}function et(e,t,n,r){return $e(e,t,1-Math.exp(-n*r))}function tt(e,t=1){return t-Math.abs(Xe(e,t*2)-t)}function nt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function rt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function it(e,t){return e+Math.floor(Math.random()*(t-e+1))}function at(e,t){return e+Math.random()*(t-e)}function ot(e){return e*(.5-Math.random())}function st(e){e!==void 0&&(Ke=e);let t=Ke+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function ct(e){return e*qe}function lt(e){return e*Je}function ut(e){return!(e&e-1)&&e!==0}function dt(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function ft(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function pt(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:console.warn(`THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function mt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function ht(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var gt={DEG2RAD:qe,RAD2DEG:Je,generateUUID:Ye,clamp:z,euclideanModulo:Xe,mapLinear:Ze,inverseLerp:Qe,lerp:$e,damp:et,pingpong:tt,smoothstep:nt,smootherstep:rt,randInt:it,randFloat:at,randFloatSpread:ot,seededRandom:st,degToRad:ct,radToDeg:lt,isPowerOfTwo:ut,ceilPowerOfTwo:dt,floorPowerOfTwo:ft,setQuaternionFromProperEuler:pt,normalize:ht,denormalize:mt},B=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},_t=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o===0){e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;return}if(u!==m||s!==d||c!==f||l!==p){let e=1-o,t=s*d+c*f+l*p+u*m,n=t>=0?1:-1,r=1-t*t;if(r>2**-52){let i=Math.sqrt(r),a=Math.atan2(i,t*n);e=Math.sin(e*a)/i,o=Math.sin(o*a)/i}let i=o*n;if(s=s*e+d*i,c=c*e+f*i,l=l*e+p*i,u=u*e+m*i,e===1-o){let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(z(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,i=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+i*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=i,this;let s=1-o*o;if(s<=2**-52){let e=1-t;return this._w=e*a+t*this._w,this._x=e*n+t*this._x,this._y=e*r+t*this._y,this._z=e*i+t*this._z,this.normalize(),this}let c=Math.sqrt(s),l=Math.atan2(c,o),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=i*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},V=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(yt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(yt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return vt.copy(this).projectOnVector(e),this.sub(vt)}reflect(e){return this.sub(vt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},vt=new V,yt=new _t,bt=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(xt.makeScale(e,t)),this}rotate(e){return this.premultiply(xt.makeRotation(-e)),this}translate(e,t){return this.premultiply(xt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},xt=new bt;function St(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Ct(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function wt(){let e=Ct(`canvas`);return e.style.display=`block`,e}var Tt={};function Et(e){e in Tt||(Tt[e]=!0,console.warn(e))}function Dt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Ot=new bt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),kt=new bt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function At(){let e={enabled:!0,workingColorSpace:Ie,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=Mt(e.r),e.g=Mt(e.g),e.b=Mt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Nt(e.r),e.g=Nt(e.g),e.b=Nt(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Le:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Et(`THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Et(`THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Ie]:{primaries:t,whitePoint:r,transfer:Le,toXYZ:Ot,fromXYZ:kt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Fe},outputColorSpaceConfig:{drawingBufferColorSpace:Fe}},[Fe]:{primaries:t,whitePoint:r,transfer:Re,toXYZ:Ot,fromXYZ:kt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Fe}}}),e}var jt=At();function Mt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Nt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Pt,Ft=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Pt===void 0&&(Pt=Ct(`canvas`)),Pt.width=e.width,Pt.height=e.height;let t=Pt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Pt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Ct(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Mt(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Mt(t[e]/255)*255):t[e]=Mt(t[e]);return{data:t,width:e.width,height:e.height}}return console.warn(`THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},It=0,Lt=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:It++}),this.uuid=Ye(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Rt(r[t].image)):e.push(Rt(r[t]))}else e=Rt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Rt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Ft.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var zt=0,Bt=new V,Vt=class e extends We{constructor(t=e.DEFAULT_IMAGE,r=e.DEFAULT_MAPPING,i=n,a=n,o=s,c=l,d=T,f=u,p=e.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:zt++}),this.uuid=Ye(),this.name=``,this.source=new Lt(t),this.mipmaps=[],this.mapping=r,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=o,this.minFilter=c,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new B(0,0),this.repeat=new B(1,1),this.center=new B(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new bt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Bt).x}get height(){return this.source.getSize(Bt).y}get depth(){return this.source.getSize(Bt).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case t:e.x-=Math.floor(e.x);break;case n:e.x=e.x<0?0:1;break;case r:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case t:e.y-=Math.floor(e.y);break;case n:e.y=e.y<0?0:1;break;case r:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Vt.DEFAULT_IMAGE=null,Vt.DEFAULT_MAPPING=300,Vt.DEFAULT_ANISOTROPY=1;var Ht=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this.w=z(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this.w=z(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ut=class extends We{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:s,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Ht(0,0,e,t),this.scissorTest=!1,this.viewport=new Ht(0,0,e,t);let r=new Vt({width:e,height:t,depth:n.depth});this.textures=[];let i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:s,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Lt(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},Wt=class extends Ut{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Gt=class extends Vt{constructor(e=null,t=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=i,this.minFilter=i,this.wrapR=n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Kt=class extends Vt{constructor(e=null,t=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=i,this.minFilter=i,this.wrapR=n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},qt=class{constructor(e=new V(1/0,1/0,1/0),t=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Yt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Yt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Yt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Yt):Yt.fromBufferAttribute(r,t),Yt.applyMatrix4(e.matrixWorld),this.expandByPoint(Yt);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Xt.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Xt.copy(e.boundingBox)),Xt.applyMatrix4(e.matrixWorld),this.union(Xt)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Yt),Yt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(rn),an.subVectors(this.max,rn),Zt.subVectors(e.a,rn),Qt.subVectors(e.b,rn),$t.subVectors(e.c,rn),en.subVectors(Qt,Zt),tn.subVectors($t,Qt),nn.subVectors(Zt,$t);let t=[0,-en.z,en.y,0,-tn.z,tn.y,0,-nn.z,nn.y,en.z,0,-en.x,tn.z,0,-tn.x,nn.z,0,-nn.x,-en.y,en.x,0,-tn.y,tn.x,0,-nn.y,nn.x,0];return!cn(t,Zt,Qt,$t,an)||(t=[1,0,0,0,1,0,0,0,1],!cn(t,Zt,Qt,$t,an))?!1:(on.crossVectors(en,tn),t=[on.x,on.y,on.z],cn(t,Zt,Qt,$t,an))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Yt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Yt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Jt[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Jt[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Jt[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Jt[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Jt[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Jt[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Jt[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Jt[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Jt),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Jt=[new V,new V,new V,new V,new V,new V,new V,new V],Yt=new V,Xt=new qt,Zt=new V,Qt=new V,$t=new V,en=new V,tn=new V,nn=new V,rn=new V,an=new V,on=new V,sn=new V;function cn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){sn.fromArray(e,a);let o=i.x*Math.abs(sn.x)+i.y*Math.abs(sn.y)+i.z*Math.abs(sn.z),s=t.dot(sn),c=n.dot(sn),l=r.dot(sn);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var ln=new qt,un=new V,dn=new V,fn=class{constructor(e=new V,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?ln.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;un.subVectors(e,this.center);let t=un.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(un,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(dn.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(un.copy(e.center).add(dn)),this.expandByPoint(un.copy(e.center).sub(dn))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},pn=new V,mn=new V,hn=new V,gn=new V,_n=new V,vn=new V,yn=new V,bn=class{constructor(e=new V,t=new V(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,pn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=pn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(pn.copy(this.origin).addScaledVector(this.direction,t),pn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){mn.copy(e).add(t).multiplyScalar(.5),hn.copy(t).sub(e).normalize(),gn.copy(this.origin).sub(mn);let i=e.distanceTo(t)*.5,a=-this.direction.dot(hn),o=gn.dot(this.direction),s=-gn.dot(hn),c=gn.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(mn).addScaledVector(hn,d),f}intersectSphere(e,t){pn.subVectors(e.center,this.origin);let n=pn.dot(this.direction),r=pn.dot(pn)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,pn)!==null}intersectTriangle(e,t,n,r,i){_n.subVectors(t,e),vn.subVectors(n,e),yn.crossVectors(_n,vn);let a=this.direction.dot(yn),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;gn.subVectors(this.origin,e);let s=o*this.direction.dot(vn.crossVectors(gn,vn));if(s<0)return null;let c=o*this.direction.dot(_n.cross(gn));if(c<0||s+c>a)return null;let l=-o*gn.dot(yn);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},H=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/xn.setFromMatrixColumn(e,0).length(),i=1/xn.setFromMatrixColumn(e,1).length(),a=1/xn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Cn,e,wn)}lookAt(e,t,n){let r=this.elements;return Dn.subVectors(e,t),Dn.lengthSq()===0&&(Dn.z=1),Dn.normalize(),Tn.crossVectors(n,Dn),Tn.lengthSq()===0&&(Math.abs(n.z)===1?Dn.x+=1e-4:Dn.z+=1e-4,Dn.normalize(),Tn.crossVectors(n,Dn)),Tn.normalize(),En.crossVectors(Dn,Tn),r[0]=Tn.x,r[4]=En.x,r[8]=Dn.x,r[1]=Tn.y,r[5]=En.y,r[9]=Dn.y,r[2]=Tn.z,r[6]=En.z,r[10]=Dn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],ee=r[13],O=r[2],k=r[6],A=r[10],te=r[14],j=r[3],M=r[7],N=r[11],P=r[15];return i[0]=a*x+o*T+s*O+c*j,i[4]=a*S+o*E+s*k+c*M,i[8]=a*C+o*D+s*A+c*N,i[12]=a*w+o*ee+s*te+c*P,i[1]=l*x+u*T+d*O+f*j,i[5]=l*S+u*E+d*k+f*M,i[9]=l*C+u*D+d*A+f*N,i[13]=l*w+u*ee+d*te+f*P,i[2]=p*x+m*T+h*O+g*j,i[6]=p*S+m*E+h*k+g*M,i[10]=p*C+m*D+h*A+g*N,i[14]=p*w+m*ee+h*te+g*P,i[3]=_*x+v*T+y*O+b*j,i[7]=_*S+v*E+y*k+b*M,i[11]=_*C+v*D+y*A+b*N,i[15]=_*w+v*ee+y*te+b*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=xn.set(r[0],r[1],r[2]).length(),a=xn.set(r[4],r[5],r[6]).length(),o=xn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],Sn.copy(this);let s=1/i,c=1/a,l=1/o;return Sn.elements[0]*=s,Sn.elements[1]*=s,Sn.elements[2]*=s,Sn.elements[4]*=c,Sn.elements[5]*=c,Sn.elements[6]*=c,Sn.elements[8]*=l,Sn.elements[9]*=l,Sn.elements[10]*=l,t.setFromRotationMatrix(Sn),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=Ue,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Ue,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},xn=new V,Sn=new H,Cn=new V(0,0,0),wn=new V(1,1,1),Tn=new V,En=new V,Dn=new V,On=new H,kn=new _t,An=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-z(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(z(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-z(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(z(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return On.makeRotationFromQuaternion(e),this.setFromRotationMatrix(On,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return kn.setFromEuler(this),this.setFromQuaternion(kn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};An.DEFAULT_ORDER=`XYZ`;var jn=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},Mn=0,Nn=new V,Pn=new _t,Fn=new H,In=new V,Ln=new V,Rn=new V,zn=new _t,Bn=new V(1,0,0),Vn=new V(0,1,0),Hn=new V(0,0,1),Un={type:`added`},Wn={type:`removed`},Gn={type:`childadded`,child:null},Kn={type:`childremoved`,child:null},qn=class e extends We{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Mn++}),this.uuid=Ye(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new V,n=new An,r=new _t,i=new V(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new H},normalMatrix:{value:new bt}}),this.matrix=new H,this.matrixWorld=new H,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new jn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Pn.setFromAxisAngle(e,t),this.quaternion.multiply(Pn),this}rotateOnWorldAxis(e,t){return Pn.setFromAxisAngle(e,t),this.quaternion.premultiply(Pn),this}rotateX(e){return this.rotateOnAxis(Bn,e)}rotateY(e){return this.rotateOnAxis(Vn,e)}rotateZ(e){return this.rotateOnAxis(Hn,e)}translateOnAxis(e,t){return Nn.copy(e).applyQuaternion(this.quaternion),this.position.add(Nn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Bn,e)}translateY(e){return this.translateOnAxis(Vn,e)}translateZ(e){return this.translateOnAxis(Hn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Fn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?In.copy(e):In.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Ln.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Fn.lookAt(Ln,In,this.up):Fn.lookAt(In,Ln,this.up),this.quaternion.setFromRotationMatrix(Fn),r&&(Fn.extractRotation(r.matrixWorld),Pn.setFromRotationMatrix(Fn),this.quaternion.premultiply(Pn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Un),Gn.child=e,this.dispatchEvent(Gn),Gn.child=null):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Wn),Kn.child=e,this.dispatchEvent(Kn),Kn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Fn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Fn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Fn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Un),Gn.child=e,this.dispatchEvent(Gn),Gn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ln,e,Rn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ln,zn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};qn.DEFAULT_UP=new V(0,1,0),qn.DEFAULT_MATRIX_AUTO_UPDATE=!0,qn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Jn=new V,Yn=new V,Xn=new V,Zn=new V,Qn=new V,$n=new V,er=new V,tr=new V,nr=new V,rr=new V,ir=new Ht,ar=new Ht,or=new Ht,sr=class e{constructor(e=new V,t=new V,n=new V){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Jn.subVectors(e,t),r.cross(Jn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Jn.subVectors(r,t),Yn.subVectors(n,t),Xn.subVectors(e,t);let a=Jn.dot(Jn),o=Jn.dot(Yn),s=Jn.dot(Xn),c=Yn.dot(Yn),l=Yn.dot(Xn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Zn)!==null&&Zn.x>=0&&Zn.y>=0&&Zn.x+Zn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Zn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Zn.x),s.addScaledVector(a,Zn.y),s.addScaledVector(o,Zn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return ir.setScalar(0),ar.setScalar(0),or.setScalar(0),ir.fromBufferAttribute(e,t),ar.fromBufferAttribute(e,n),or.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(ir,i.x),a.addScaledVector(ar,i.y),a.addScaledVector(or,i.z),a}static isFrontFacing(e,t,n,r){return Jn.subVectors(n,t),Yn.subVectors(e,t),Jn.cross(Yn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Jn.subVectors(this.c,this.b),Yn.subVectors(this.a,this.b),Jn.cross(Yn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Qn.subVectors(r,n),$n.subVectors(i,n),tr.subVectors(e,n);let s=Qn.dot(tr),c=$n.dot(tr);if(s<=0&&c<=0)return t.copy(n);nr.subVectors(e,r);let l=Qn.dot(nr),u=$n.dot(nr);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Qn,a);rr.subVectors(e,i);let f=Qn.dot(rr),p=$n.dot(rr);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector($n,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return er.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(er,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Qn,a).addScaledVector($n,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},cr={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},lr={h:0,s:0,l:0},ur={h:0,s:0,l:0};function dr(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var U=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Fe){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,jt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=jt.workingColorSpace){return this.r=e,this.g=t,this.b=n,jt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=jt.workingColorSpace){if(e=Xe(e,1),t=z(t,0,1),n=z(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=dr(i,r,e+1/3),this.g=dr(i,r,e),this.b=dr(i,r,e-1/3)}return jt.colorSpaceToWorking(this,r),this}setStyle(e,t=Fe){function n(t){t!==void 0&&parseFloat(t)<1&&console.warn(`THREE.Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:console.warn(`THREE.Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn(`THREE.Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Fe){let n=cr[e.toLowerCase()];return n===void 0?console.warn(`THREE.Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Mt(e.r),this.g=Mt(e.g),this.b=Mt(e.b),this}copyLinearToSRGB(e){return this.r=Nt(e.r),this.g=Nt(e.g),this.b=Nt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Fe){return jt.workingToColorSpace(fr.copy(this),e),Math.round(z(fr.r*255,0,255))*65536+Math.round(z(fr.g*255,0,255))*256+Math.round(z(fr.b*255,0,255))}getHexString(e=Fe){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=jt.workingColorSpace){jt.workingToColorSpace(fr.copy(this),t);let n=fr.r,r=fr.g,i=fr.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=jt.workingColorSpace){return jt.workingToColorSpace(fr.copy(this),t),e.r=fr.r,e.g=fr.g,e.b=fr.b,e}getStyle(e=Fe){jt.workingToColorSpace(fr.copy(this),e);let t=fr.r,n=fr.g,r=fr.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(lr),this.setHSL(lr.h+e,lr.s+t,lr.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(lr),e.getHSL(ur);let n=$e(lr.h,ur.h,t),r=$e(lr.s,ur.s,t),i=$e(lr.l,ur.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},fr=new U;U.NAMES=cr;var pr=0,mr=class extends We{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:pr++}),this.uuid=Ye(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new U(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ze,this.stencilZFail=ze,this.stencilZPass=ze,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},hr=class extends mr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new U(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new An,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},gr=_r();function _r(){let e=new ArrayBuffer(4),t=new Float32Array(e),n=new Uint32Array(e),r=new Uint32Array(512),i=new Uint32Array(512);for(let e=0;e<256;++e){let t=e-127;t<-27?(r[e]=0,r[e|256]=32768,i[e]=24,i[e|256]=24):t<-14?(r[e]=1024>>-t-14,r[e|256]=1024>>-t-14|32768,i[e]=-t-1,i[e|256]=-t-1):t<=15?(r[e]=t+15<<10,r[e|256]=t+15<<10|32768,i[e]=13,i[e|256]=13):t<128?(r[e]=31744,r[e|256]=64512,i[e]=24,i[e|256]=24):(r[e]=31744,r[e|256]=64512,i[e]=13,i[e|256]=13)}let a=new Uint32Array(2048),o=new Uint32Array(64),s=new Uint32Array(64);for(let e=1;e<1024;++e){let t=e<<13,n=0;for(;!(t&8388608);)t<<=1,n-=8388608;t&=-8388609,n+=947912704,a[e]=t|n}for(let e=1024;e<2048;++e)a[e]=939524096+(e-1024<<13);for(let e=1;e<31;++e)o[e]=e<<23;o[31]=1199570944,o[32]=2147483648;for(let e=33;e<63;++e)o[e]=2147483648+(e-32<<23);o[63]=3347054592;for(let e=1;e<64;++e)e!==32&&(s[e]=1024);return{floatView:t,uint32View:n,baseTable:r,shiftTable:i,mantissaTable:a,exponentTable:o,offsetTable:s}}function vr(e){Math.abs(e)>65504&&console.warn(`THREE.DataUtils.toHalfFloat(): Value out of range.`),e=z(e,-65504,65504),gr.floatView[0]=e;let t=gr.uint32View[0],n=t>>23&511;return gr.baseTable[n]+((t&8388607)>>gr.shiftTable[n])}function yr(e){let t=e>>10;return gr.uint32View[0]=gr.mantissaTable[gr.offsetTable[t]+(e&1023)]+gr.exponentTable[t],gr.floatView[0]}var br=class{static toHalfFloat(e){return vr(e)}static fromHalfFloat(e){return yr(e)}},xr=new V,Sr=new B,Cr=0,wr=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Cr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Be,this.updateRanges=[],this.gpuType=g,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Sr.fromBufferAttribute(this,t),Sr.applyMatrix3(e),this.setXY(t,Sr.x,Sr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)xr.fromBufferAttribute(this,t),xr.applyMatrix3(e),this.setXYZ(t,xr.x,xr.y,xr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)xr.fromBufferAttribute(this,t),xr.applyMatrix4(e),this.setXYZ(t,xr.x,xr.y,xr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)xr.fromBufferAttribute(this,t),xr.applyNormalMatrix(e),this.setXYZ(t,xr.x,xr.y,xr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)xr.fromBufferAttribute(this,t),xr.transformDirection(e),this.setXYZ(t,xr.x,xr.y,xr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=mt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ht(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=mt(t,this.array)),t}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=mt(t,this.array)),t}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=mt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=mt(t,this.array)),t}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),r=ht(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),r=ht(r,this.array),i=ht(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},Tr=class extends wr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Er=class extends wr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Dr=class extends wr{constructor(e,t,n){super(new Float32Array(e),t,n)}},Or=0,kr=new H,Ar=new qn,jr=new V,Mr=new qt,Nr=new qt,Pr=new V,Fr=class e extends We{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Or++}),this.uuid=Ye(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(St(e)?Er:Tr)(e,1):e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new bt().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return kr.makeRotationFromQuaternion(e),this.applyMatrix4(kr),this}rotateX(e){return kr.makeRotationX(e),this.applyMatrix4(kr),this}rotateY(e){return kr.makeRotationY(e),this.applyMatrix4(kr),this}rotateZ(e){return kr.makeRotationZ(e),this.applyMatrix4(kr),this}translate(e,t,n){return kr.makeTranslation(e,t,n),this.applyMatrix4(kr),this}scale(e,t,n){return kr.makeScale(e,t,n),this.applyMatrix4(kr),this}lookAt(e){return Ar.lookAt(e),Ar.updateMatrix(),this.applyMatrix4(Ar.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(jr).negate(),this.translate(jr.x,jr.y,jr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Dr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&console.warn(`THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new qt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Mr.setFromBufferAttribute(n),this.morphTargetsRelative?(Pr.addVectors(this.boundingBox.min,Mr.min),this.boundingBox.expandByPoint(Pr),Pr.addVectors(this.boundingBox.max,Mr.max),this.boundingBox.expandByPoint(Pr)):(this.boundingBox.expandByPoint(Mr.min),this.boundingBox.expandByPoint(Mr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new fn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new V,1/0);return}if(e){let n=this.boundingSphere.center;if(Mr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Nr.setFromBufferAttribute(n),this.morphTargetsRelative?(Pr.addVectors(Mr.min,Nr.min),Mr.expandByPoint(Pr),Pr.addVectors(Mr.max,Nr.max),Mr.expandByPoint(Pr)):(Mr.expandByPoint(Nr.min),Mr.expandByPoint(Nr.max))}Mr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Pr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Pr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Pr.fromBufferAttribute(a,t),o&&(jr.fromBufferAttribute(e,t),Pr.add(jr)),r=Math.max(r,n.distanceToSquared(Pr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new wr(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new V,s[e]=new V;let c=new V,l=new V,u=new V,d=new B,f=new B,p=new B,m=new V,h=new V;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new V,y=new V,b=new V,x=new V;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new wr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new V,i=new V,a=new V,o=new V,s=new V,c=new V,l=new V,u=new V;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Pr.fromBufferAttribute(e,t),Pr.normalize(),e.setXYZ(t,Pr.x,Pr.y,Pr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new wr(a,r,i)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},Ir=new H,Lr=new bn,Rr=new fn,zr=new V,Br=new V,Vr=new V,Hr=new V,Ur=new V,Wr=new V,Gr=new V,Kr=new V,qr=class extends qn{constructor(e=new Fr,t=new hr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Wr.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Ur.fromBufferAttribute(s,e),a?Wr.addScaledVector(Ur,r):Wr.addScaledVector(Ur.sub(t),r))}t.add(Wr)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Rr.copy(n.boundingSphere),Rr.applyMatrix4(i),Lr.copy(e.ray).recast(e.near),!(Rr.containsPoint(Lr.origin)===!1&&(Lr.intersectSphere(Rr,zr)===null||Lr.origin.distanceToSquared(zr)>(e.far-e.near)**2))&&(Ir.copy(i).invert(),Lr.copy(e.ray).applyMatrix4(Ir),(n.boundingBox===null||Lr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Lr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Yr(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Yr(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Yr(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Yr(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Jr(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Kr.copy(s),Kr.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Kr);return l<n.near||l>n.far?null:{distance:l,point:Kr.clone(),object:e}}function Yr(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Br),e.getVertexPosition(c,Vr),e.getVertexPosition(l,Hr);let u=Jr(e,t,n,r,Br,Vr,Hr,Gr);if(u){let e=new V;sr.getBarycoord(Gr,Br,Vr,Hr,e),i&&(u.uv=sr.getInterpolatedAttribute(i,s,c,l,e,new B)),a&&(u.uv1=sr.getInterpolatedAttribute(a,s,c,l,e,new B)),o&&(u.normal=sr.getInterpolatedAttribute(o,s,c,l,e,new V),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new V,materialIndex:0};sr.getNormal(Br,Vr,Hr,t.normal),u.face=t,u.barycoord=e}return u}var Xr=class e extends Fr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Dr(c,3)),this.setAttribute(`normal`,new Dr(l,3)),this.setAttribute(`uv`,new Dr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new V;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Zr(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function Qr(e){let t={};for(let n=0;n<e.length;n++){let r=Zr(e[n]);for(let e in r)t[e]=r[e]}return t}function $r(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function ei(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:jt.workingColorSpace}var ti={clone:Zr,merge:Qr},ni=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ri=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ii=class extends mr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ni,this.fragmentShader=ri,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Zr(e.uniforms),this.uniformsGroups=$r(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ai=class extends qn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new H,this.projectionMatrix=new H,this.projectionMatrixInverse=new H,this.coordinateSystem=Ue,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},oi=new V,si=new B,ci=new B,li=class extends ai{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Je*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(qe*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Je*2*Math.atan(Math.tan(qe*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){oi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(oi.x,oi.y).multiplyScalar(-e/oi.z),oi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(oi.x,oi.y).multiplyScalar(-e/oi.z)}getViewSize(e,t){return this.getViewBounds(e,si,ci),t.subVectors(ci,si)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(qe*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ui=-90,di=1,fi=class extends qn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new li(ui,di,e,t);r.layers=this.layers,this.add(r);let i=new li(ui,di,e,t);i.layers=this.layers,this.add(i);let a=new li(ui,di,e,t);a.layers=this.layers,this.add(a);let o=new li(ui,di,e,t);o.layers=this.layers,this.add(o);let s=new li(ui,di,e,t);s.layers=this.layers,this.add(s);let c=new li(ui,di,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},pi=class extends Vt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},mi=class extends Wt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new pi(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Xr(5,5,5),i=new ii({name:`CubemapFromEquirect`,uniforms:Zr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new qr(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=s),new fi(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},hi=class extends qn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},gi={type:`move`},_i=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new hi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new hi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new hi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(gi)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new hi;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},vi=class extends qn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new An,this.environmentIntensity=1,this.environmentRotation=new An,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},yi=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Be,this.updateRanges=[],this.version=0,this.uuid=Ye()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ye()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ye()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},bi=new V,xi=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)bi.fromBufferAttribute(this,t),bi.applyMatrix4(e),this.setXYZ(t,bi.x,bi.y,bi.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)bi.fromBufferAttribute(this,t),bi.applyNormalMatrix(e),this.setXYZ(t,bi.x,bi.y,bi.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)bi.fromBufferAttribute(this,t),bi.transformDirection(e),this.setXYZ(t,bi.x,bi.y,bi.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=mt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ht(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=mt(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=mt(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=mt(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=mt(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),r=ht(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),r=ht(r,this.array),i=ht(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){console.log(`THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new wr(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log(`THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Si=new V,Ci=new Ht,wi=new Ht,Ti=new V,Ei=new H,Di=new V,Oi=new fn,ki=new H,Ai=new bn,ji=class extends qr{constructor(t,n){super(t,n),this.isSkinnedMesh=!0,this.type=`SkinnedMesh`,this.bindMode=e,this.bindMatrix=new H,this.bindMatrixInverse=new H,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new qt),this.boundingBox.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,Di),this.boundingBox.expandByPoint(Di)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new fn),this.boundingSphere.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,Di),this.boundingSphere.expandByPoint(Di)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Oi.copy(this.boundingSphere),Oi.applyMatrix4(r),e.ray.intersectsSphere(Oi)!==!1&&(ki.copy(r).invert(),Ai.copy(e.ray).applyMatrix4(ki),(this.boundingBox===null||Ai.intersectsBox(this.boundingBox)!==!1)&&this._computeIntersections(e,t,Ai)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new Ht,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r===1/0?e.set(1,0,0,0):e.multiplyScalar(r),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===`attached`?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===`detached`?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn(`THREE.SkinnedMesh: Unrecognized bindMode: `+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,r=this.geometry;Ci.fromBufferAttribute(r.attributes.skinIndex,e),wi.fromBufferAttribute(r.attributes.skinWeight,e),Si.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let e=0;e<4;e++){let r=wi.getComponent(e);if(r!==0){let i=Ci.getComponent(e);Ei.multiplyMatrices(n.bones[i].matrixWorld,n.boneInverses[i]),t.addScaledVector(Ti.copy(Si).applyMatrix4(Ei),r)}}return t.applyMatrix4(this.bindMatrixInverse)}},Mi=class extends qn{constructor(){super(),this.isBone=!0,this.type=`Bone`}},Ni=class extends Vt{constructor(e=null,t=1,n=1,r,a,o,s,c,l=i,u=i,d,f){super(null,o,s,c,l,u,r,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Pi=new H,Fi=new H,Ii=class e{constructor(e=[],t=[]){this.uuid=Ye(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn(`THREE.Skeleton: Number of inverse bone matrices does not match amount of bones.`),this.boneInverses=[];for(let e=0,t=this.bones.length;e<t;e++)this.boneInverses.push(new H)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let t=new H;this.bones[e]&&t.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(t)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&t.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&(t.parent&&t.parent.isBone?(t.matrix.copy(t.parent.matrixWorld).invert(),t.matrix.multiply(t.matrixWorld)):t.matrix.copy(t.matrixWorld),t.matrix.decompose(t.position,t.quaternion,t.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let r=0,i=e.length;r<i;r++){let i=e[r]?e[r].matrixWorld:Fi;Pi.multiplyMatrices(i,t[r]),Pi.toArray(n,r*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new e(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Ni(t,e,e,T,g);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){let r=e.bones[n],i=t[r];i===void 0&&(console.warn(`THREE.Skeleton: No bone found with UUID:`,r),i=new Mi),this.bones.push(i),this.boneInverses.push(new H().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:`Skeleton`,generator:`Skeleton.toJSON`},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let r=0,i=t.length;r<i;r++){let i=t[r];e.bones.push(i.uuid);let a=n[r];e.boneInverses.push(a.toArray())}return e}},Li=class extends wr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ri=new H,zi=new H,Bi=[],Vi=new qt,Hi=new H,Ui=new qr,Wi=new fn,Gi=class extends qr{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Li(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Hi)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new qt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ri),Vi.copy(e.boundingBox).applyMatrix4(Ri),this.boundingBox.union(Vi)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new fn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ri),Wi.copy(e.boundingSphere).applyMatrix4(Ri),this.boundingSphere.union(Wi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Ui.geometry=this.geometry,Ui.material=this.material,Ui.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Wi.copy(this.boundingSphere),Wi.applyMatrix4(n),e.ray.intersectsSphere(Wi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Ri),zi.multiplyMatrices(n,Ri),Ui.matrixWorld=zi,Ui.raycast(e,Bi);for(let e=0,n=Bi.length;e<n;e++){let n=Bi[e];n.instanceId=i,n.object=this,t.push(n)}Bi.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Li(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ni(new Float32Array(r*this.count),r,this.count,ee,g));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;i[s]=o,i.set(n,s+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:`dispose`}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ki=new V,qi=new V,Ji=new bt,Yi=class{constructor(e=new V(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Ki.subVectors(n,t).cross(qi.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Ki),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ji.getNormalMatrix(e),r=this.coplanarPoint(Ki).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Xi=new fn,Zi=new B(.5,.5),Qi=new V,$i=class{constructor(e=new Yi,t=new Yi,n=new Yi,r=new Yi,i=new Yi,a=new Yi){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ue,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Xi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Xi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Xi)}intersectsSprite(e){return Xi.center.set(0,0,0),Xi.radius=.7071067811865476+Zi.distanceTo(e.center),Xi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Xi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Qi.x=r.normal.x>0?e.max.x:e.min.x,Qi.y=r.normal.y>0?e.max.y:e.min.y,Qi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Qi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},ea=class extends mr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new U(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ta=new V,na=new V,ra=new H,ia=new bn,aa=new fn,oa=new V,sa=new V,ca=class extends qn{constructor(e=new Fr,t=new ea){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)ta.fromBufferAttribute(t,e-1),na.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=ta.distanceTo(na);e.setAttribute(`lineDistance`,new Dr(n,1))}else console.warn(`THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),aa.copy(n.boundingSphere),aa.applyMatrix4(r),aa.radius+=i,e.ray.intersectsSphere(aa)===!1)return;ra.copy(r).invert(),ia.copy(e.ray).applyMatrix4(ra);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=la(this,e,ia,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=la(this,e,ia,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=la(this,e,ia,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=la(this,e,ia,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function la(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(ta.fromBufferAttribute(s,i),na.fromBufferAttribute(s,a),n.distanceSqToSegment(ta,na,oa,sa)>r)return;oa.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(oa);if(!(c<t.near||c>t.far))return{distance:c,point:sa.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var ua=new V,da=new V,fa=class extends ca{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)ua.fromBufferAttribute(t,e),da.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+ua.distanceTo(da);e.setAttribute(`lineDistance`,new Dr(n,1))}else console.warn(`THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},pa=class extends ca{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type=`LineLoop`}},ma=class extends mr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new U(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ha=new H,ga=new bn,_a=new fn,va=new V,ya=class extends qn{constructor(e=new Fr,t=new ma){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_a.copy(n.boundingSphere),_a.applyMatrix4(r),_a.radius+=i,e.ray.intersectsSphere(_a)===!1)return;ha.copy(r).invert(),ga.copy(e.ray).applyMatrix4(ha);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);va.fromBufferAttribute(l,n),ba(va,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)va.fromBufferAttribute(l,a),ba(va,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ba(e,t,n,r,i,a,o){let s=ga.distanceSqToPoint(e);if(s<n){let n=new V;ga.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var xa=class extends Vt{constructor(e,t,n=h,r,a,o,s=i,c=i,l,u=E,d=1){if(u!==1026&&u!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},r,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Lt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Sa=class extends Vt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ca=class e extends Fr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Dr(u,3)),this.setAttribute(`normal`,new Dr(d,3)),this.setAttribute(`uv`,new Dr(f,2));function _(){let a=new V,_=new V,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new B,m=new V,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},wa=class e extends Ca{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ta=class e extends Fr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Dr(i,3)),this.setAttribute(`normal`,new Dr(i.slice(),3)),this.setAttribute(`uv`,new Dr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new V,r=new V,i=new V;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new V;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new V;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new V,t=new V,n=new V,r=new V,o=new B,s=new B,c=new B;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.details)}},Ea=class e extends Ta{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Da=class e extends Fr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Dr(p,3)),this.setAttribute(`normal`,new Dr(m,3)),this.setAttribute(`uv`,new Dr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Oa=class extends mr{constructor(e){super(),this.isShadowMaterial=!0,this.type=`ShadowMaterial`,this.color=new U(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}},ka=class extends mr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new U(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new U(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new An,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Aa=class extends ka{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new B(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return z(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new U(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new U(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new U(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},ja=class extends mr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Ne,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ma=class extends mr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Na(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Pa(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Fa(e){function t(t,n){return e[t]-e[n]}let n=e.length,r=Array(n);for(let e=0;e!==n;++e)r[e]=e;return r.sort(t),r}function Ia(e,t,n){let r=e.length,i=new e.constructor(r);for(let a=0,o=0;o!==r;++a){let r=n[a]*t;for(let n=0;n!==t;++n)i[o++]=e[r+n]}return i}function La(e,t,n,r){let i=1,a=e[0];for(;a!==void 0&&a[r]===void 0;)a=e[i++];if(a===void 0)return;let o=a[r];if(o!==void 0){if(Array.isArray(o))do o=a[r],o!==void 0&&(t.push(a.time),n.push(...o)),a=e[i++];while(a!==void 0);else if(o.toArray!==void 0)do o=a[r],o!==void 0&&(t.push(a.time),o.toArray(n,n.length)),a=e[i++];while(a!==void 0);else do o=a[r],o!==void 0&&(t.push(a.time),n.push(o)),a=e[i++];while(a!==void 0)}}var Ra=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},za=class extends Ra{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ke,endingEnd:ke}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ae:i=e,o=2*t-n;break;case je:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Ae:a=e,s=2*n-t;break;case je:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Ba=class extends Ra{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Va=class extends Ra{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ha=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Na(t,this.TimeBufferType),this.values=Na(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Na(e.times,Array),values:Na(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Va(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ba(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new za(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ee:t=this.InterpolantFactoryMethodDiscrete;break;case De:t=this.InterpolantFactoryMethodLinear;break;case Oe:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return console.warn(`THREE.KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ee;case this.InterpolantFactoryMethodLinear:return De;case this.InterpolantFactoryMethodSmooth:return Oe}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Pa(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Oe,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Ha.prototype.ValueTypeName=``,Ha.prototype.TimeBufferType=Float32Array,Ha.prototype.ValueBufferType=Float32Array,Ha.prototype.DefaultInterpolation=De;var Ua=class extends Ha{constructor(e,t,n){super(e,t,n)}};Ua.prototype.ValueTypeName=`bool`,Ua.prototype.ValueBufferType=Array,Ua.prototype.DefaultInterpolation=Ee,Ua.prototype.InterpolantFactoryMethodLinear=void 0,Ua.prototype.InterpolantFactoryMethodSmooth=void 0;var Wa=class extends Ha{constructor(e,t,n,r){super(e,t,n,r)}};Wa.prototype.ValueTypeName=`color`;var Ga=class extends Ha{constructor(e,t,n,r){super(e,t,n,r)}};Ga.prototype.ValueTypeName=`number`;var Ka=class extends Ra{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)_t.slerpFlat(i,0,a,c-o,a,c,s);return i}},qa=class extends Ha{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Ka(this.times,this.values,this.getValueSize(),e)}};qa.prototype.ValueTypeName=`quaternion`,qa.prototype.InterpolantFactoryMethodSmooth=void 0;var Ja=class extends Ha{constructor(e,t,n){super(e,t,n)}};Ja.prototype.ValueTypeName=`string`,Ja.prototype.ValueBufferType=Array,Ja.prototype.DefaultInterpolation=Ee,Ja.prototype.InterpolantFactoryMethodLinear=void 0,Ja.prototype.InterpolantFactoryMethodSmooth=void 0;var Ya=class extends Ha{constructor(e,t,n,r){super(e,t,n,r)}};Ya.prototype.ValueTypeName=`vector`;var Xa=class{constructor(e=``,t=-1,n=[],r=Me){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=Ye(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,r=1/(e.fps||1);for(let e=0,i=n.length;e!==i;++e)t.push(Qa(n[e]).scale(r));let i=new this(e.name,e.duration,t,e.blendMode);return i.uuid=e.uuid,i.userData=JSON.parse(e.userData||`{}`),i}static toJSON(e){let t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let e=0,r=n.length;e!==r;++e)t.push(Ha.toJSON(n[e]));return r}static CreateFromMorphTargetSequence(e,t,n,r){let i=t.length,a=[];for(let e=0;e<i;e++){let o=[],s=[];o.push((e+i-1)%i,e,(e+1)%i),s.push(0,1,0);let c=Fa(o);o=Ia(o,1,c),s=Ia(s,1,c),!r&&o[0]===0&&(o.push(i),s.push(s[0])),a.push(new Ga(`.morphTargetInfluences[`+t[e].name+`]`,o,s).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let t=e;n=t.geometry&&t.geometry.animations||t.animations}for(let e=0;e<n.length;e++)if(n[e].name===t)return n[e];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let r={},i=/^([\w-]*?)([\d]+)$/;for(let t=0,n=e.length;t<n;t++){let n=e[t],a=n.name.match(i);if(a&&a.length>1){let e=a[1],t=r[e];t||(r[e]=t=[]),t.push(n)}}let a=[];for(let e in r)a.push(this.CreateFromMorphTargetSequence(e,r[e],t,n));return a}static parseAnimation(e,t){if(console.warn(`THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185`),!e)return console.error(`THREE.AnimationClip: No animation in JSONLoader data.`),null;let n=function(e,t,n,r,i){if(n.length!==0){let a=[],o=[];La(n,a,o,r),a.length!==0&&i.push(new e(t,a,o))}},r=[],i=e.name||`default`,a=e.fps||30,o=e.blendMode,s=e.length||-1,c=e.hierarchy||[];for(let e=0;e<c.length;e++){let i=c[e].keys;if(i&&i.length!==0){if(i[0].morphTargets){let e={},t=0;for(;t<i.length;t++)if(i[t].morphTargets)for(let n=0;n<i[t].morphTargets.length;n++)e[i[t].morphTargets[n]]=-1;for(let n in e){let e=[],a=[];for(let r=0;r!==i[t].morphTargets.length;++r){let r=i[t];e.push(r.time),a.push(+(r.morphTarget===n))}r.push(new Ga(`.morphTargetInfluence[`+n+`]`,e,a))}s=e.length*a}else{let a=`.bones[`+t[e].name+`]`;n(Ya,a+`.position`,i,`pos`,r),n(qa,a+`.quaternion`,i,`rot`,r),n(Ya,a+`.scale`,i,`scl`,r)}}}return r.length===0?null:new this(i,s,r,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,r=e.length;n!==r;++n){let e=this.tracks[n];t=Math.max(t,e.times[e.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e&&=this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Za(e){switch(e.toLowerCase()){case`scalar`:case`double`:case`float`:case`number`:case`integer`:return Ga;case`vector`:case`vector2`:case`vector3`:case`vector4`:return Ya;case`color`:return Wa;case`quaternion`:return qa;case`bool`:case`boolean`:return Ua;case`string`:return Ja}throw Error(`THREE.KeyframeTrack: Unsupported typeName: `+e)}function Qa(e){if(e.type===void 0)throw Error(`THREE.KeyframeTrack: track type undefined, can not parse`);let t=Za(e.type);if(e.times===void 0){let t=[],n=[];La(e.keys,t,n,`value`),e.times=t,e.values=n}return t.parse===void 0?new t(e.name,e.times,e.values,e.interpolation):t.parse(e)}var $a={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(this.files[e]=t)},get:function(e){if(this.enabled!==!1)return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}},eo=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},to=class{constructor(e){this.manager=e===void 0?eo:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};to.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var no={},ro=class extends Error{constructor(e,t){super(e),this.response=t}},io=class extends to{constructor(e){super(e),this.mimeType=``,this.responseType=``,this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=$a.get(`file:${e}`);if(i!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(i),this.manager.itemEnd(e)},0),i;if(no[e]!==void 0){no[e].push({onLoad:t,onProgress:n,onError:r});return}no[e]=[],no[e].push({onLoad:t,onProgress:n,onError:r});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?`include`:`same-origin`,signal:typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,s=this.responseType;fetch(a).then(t=>{if(t.status===200||t.status===0){if(t.status===0&&console.warn(`THREE.FileLoader: HTTP Status 0 received.`),typeof ReadableStream>`u`||t.body===void 0||t.body.getReader===void 0)return t;let n=no[e],r=t.body.getReader(),i=t.headers.get(`X-File-Size`)||t.headers.get(`Content-Length`),a=i?parseInt(i):0,o=a!==0,s=0,c=new ReadableStream({start(e){t();function t(){r.read().then(({done:r,value:i})=>{if(r)e.close();else{s+=i.byteLength;let r=new ProgressEvent(`progress`,{lengthComputable:o,loaded:s,total:a});for(let e=0,t=n.length;e<t;e++){let t=n[e];t.onProgress&&t.onProgress(r)}e.enqueue(i),t()}},t=>{e.error(t)})}}});return new Response(c)}throw new ro(`fetch for "${t.url}" responded with ${t.status}: ${t.statusText}`,t)}).then(e=>{switch(s){case`arraybuffer`:return e.arrayBuffer();case`blob`:return e.blob();case`document`:return e.text().then(e=>new DOMParser().parseFromString(e,o));case`json`:return e.json();default:if(o===``)return e.text();{let t=/charset="?([^;"\s]*)"?/i.exec(o),n=t&&t[1]?t[1].toLowerCase():void 0,r=new TextDecoder(n);return e.arrayBuffer().then(e=>r.decode(e))}}}).then(t=>{$a.add(`file:${e}`,t);let n=no[e];delete no[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onLoad&&r.onLoad(t)}}).catch(t=>{let n=no[e];if(n===void 0)throw this.manager.itemError(e),t;delete no[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onError&&r.onError(t)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},ao=new WeakMap,oo=class extends to{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=$a.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=ao.get(a);e===void 0&&(e=[],ao.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=Ct(`img`);function s(){l(),t&&t(this);let n=ao.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}ao.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),$a.remove(`image:${e}`);let n=ao.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}ao.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),$a.add(`image:${e}`,o),i.manager.itemStart(e),o.src=e,o}},so=class extends to{constructor(e){super(e)}load(e,t,n,r){let i=new Vt,a=new oo(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},co=class extends qn{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new U(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},lo=new H,uo=new V,fo=new V,po=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new B(512,512),this.mapType=u,this.map=null,this.mapPass=null,this.matrix=new H,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $i,this._frameExtents=new B(1,1),this._viewportCount=1,this._viewports=[new Ht(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;uo.setFromMatrixPosition(e.matrixWorld),t.position.copy(uo),fo.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(fo),t.updateMatrixWorld(),lo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(lo,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(lo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},mo=class extends po{constructor(){super(new li(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Je*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,i=e.distance||t.far;(n!==t.fov||r!==t.aspect||i!==t.far)&&(t.fov=n,t.aspect=r,t.far=i,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},ho=class extends co{constructor(e,t,n=0,r=Math.PI/3,i=0,a=2){super(e,t),this.isSpotLight=!0,this.type=`SpotLight`,this.position.copy(qn.DEFAULT_UP),this.updateMatrix(),this.target=new qn,this.distance=n,this.angle=r,this.penumbra=i,this.decay=a,this.map=null,this.shadow=new mo}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},go=new H,_o=new V,vo=new V,yo=class extends po{constructor(){super(new li(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new B(4,2),this._viewportCount=6,this._viewports=[new Ht(2,1,1,1),new Ht(0,1,1,1),new Ht(3,1,1,1),new Ht(1,1,1,1),new Ht(3,0,1,1),new Ht(1,0,1,1)],this._cubeDirections=[new V(1,0,0),new V(-1,0,0),new V(0,0,1),new V(0,0,-1),new V(0,1,0),new V(0,-1,0)],this._cubeUps=[new V(0,1,0),new V(0,1,0),new V(0,1,0),new V(0,1,0),new V(0,0,1),new V(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,r=this.matrix,i=e.distance||n.far;i!==n.far&&(n.far=i,n.updateProjectionMatrix()),_o.setFromMatrixPosition(e.matrixWorld),n.position.copy(_o),vo.copy(n.position),vo.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(vo),n.updateMatrixWorld(),r.makeTranslation(-_o.x,-_o.y,-_o.z),go.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(go,n.coordinateSystem,n.reversedDepth)}},bo=class extends co{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new yo}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},xo=class extends ai{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},So=class extends po{constructor(){super(new xo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Co=class extends co{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(qn.DEFAULT_UP),this.updateMatrix(),this.target=new qn,this.shadow=new So}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},wo=class{static extractUrlBase(e){let t=e.lastIndexOf(`/`);return t===-1?`./`:e.slice(0,t+1)}static resolveURL(e,t){return typeof e!=`string`||e===``?``:(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,`$1`)),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},To=new WeakMap,Eo=class extends to{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>`u`&&console.warn(`THREE.ImageBitmapLoader: createImageBitmap() not supported.`),typeof fetch>`u`&&console.warn(`THREE.ImageBitmapLoader: fetch() not supported.`),this.options={premultiplyAlpha:`none`},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=$a.get(`image-bitmap:${e}`);if(a!==void 0){if(i.manager.itemStart(e),a.then){a.then(n=>{if(To.has(a)===!0)r&&r(To.get(a)),i.manager.itemError(e),i.manager.itemEnd(e);else return t&&t(n),i.manager.itemEnd(e),n});return}return setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0),a}let o={};o.credentials=this.crossOrigin===`anonymous`?`same-origin`:`include`,o.headers=this.requestHeader,o.signal=typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let s=fetch(e,o).then(function(e){return e.blob()}).then(function(e){return createImageBitmap(e,Object.assign(i.options,{colorSpaceConversion:`none`}))}).then(function(n){return $a.add(`image-bitmap:${e}`,n),t&&t(n),i.manager.itemEnd(e),n}).catch(function(t){r&&r(t),To.set(s,t),$a.remove(`image-bitmap:${e}`),i.manager.itemError(e),i.manager.itemEnd(e)});$a.add(`image-bitmap:${e}`,s),i.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},Do=class extends li{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Oo=`\\[\\]\\.:\\/`,ko=RegExp(`[\\[\\]\\.:\\/]`,`g`),Ao=`[^\\[\\]\\.:\\/]`,jo=`[^`+Oo.replace(`\\.`,``)+`]`,Mo=`((?:WC+[\\/:])*)`.replace(`WC`,Ao),No=`(WCOD+)?`.replace(`WCOD`,jo),Po=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Ao),Fo=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Ao),Io=RegExp(`^`+Mo+No+Po+Fo+`$`),Lo=[`material`,`materials`,`bones`,`map`],Ro=class{constructor(e,t,n){let r=n||zo.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},zo=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(ko,``)}static parseTrackName(e){let t=Io.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Lo.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn(`THREE.PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){console.error(`THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};zo.Composite=Ro,zo.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},zo.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},zo.prototype.GetterByBindingType=[zo.prototype._getValue_direct,zo.prototype._getValue_array,zo.prototype._getValue_arrayElement,zo.prototype._getValue_toArray],zo.prototype.SetterByBindingTypeAndVersioning=[[zo.prototype._setValue_direct,zo.prototype._setValue_direct_setNeedsUpdate,zo.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[zo.prototype._setValue_array,zo.prototype._setValue_array_setNeedsUpdate,zo.prototype._setValue_array_setMatrixWorldNeedsUpdate],[zo.prototype._setValue_arrayElement,zo.prototype._setValue_arrayElement_setNeedsUpdate,zo.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[zo.prototype._setValue_fromArray,zo.prototype._setValue_fromArray_setNeedsUpdate,zo.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Bo=new H,Vo=class{constructor(e,t,n=0,r=1/0){this.ray=new bn(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new jn,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error(`THREE.Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Bo.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Bo),this}intersectObject(e,t=!0,n=[]){return Uo(e,this,n,t),n.sort(Ho),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Uo(e[r],this,n,t);return n.sort(Ho),n}};function Ho(e,t){return e.distance-t.distance}function Uo(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Uo(r[e],t,n,!0)}}function Wo(e,t,n,r){let i=Go(r);switch(n){case C:return e*t;case ee:return e*t/i.components*i.byteLength;case O:return e*t/i.components*i.byteLength;case k:return e*t*2/i.components*i.byteLength;case A:return e*t*2/i.components*i.byteLength;case w:return e*t*3/i.components*i.byteLength;case T:return e*t*4/i.components*i.byteLength;case te:return e*t*4/i.components*i.byteLength;case j:case M:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case N:case P:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case re:case ae:return Math.max(e,16)*Math.max(t,8)/4;case ne:case ie:return Math.max(e,8)*Math.max(t,8)/2;case oe:case se:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ce:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case F:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case le:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case ue:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case de:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case fe:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case pe:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case me:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case I:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case he:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case ge:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case _e:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case L:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case ve:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case R:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case ye:case be:case xe:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Se:case Ce:return Math.ceil(e/4)*Math.ceil(t/4)*8;case we:case Te:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Go(e){switch(e){case u:case d:return{byteLength:1,components:1};case p:case f:case _:return{byteLength:2,components:1};case v:case y:return{byteLength:2,components:4};case h:case m:case g:return{byteLength:4,components:1};case x:case S:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`180`}})),typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`180`);function Ko(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function qo(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Jo={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},W={common:{diffuse:{value:new U(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new bt},alphaMap:{value:null},alphaMapTransform:{value:new bt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new bt}},envmap:{envMap:{value:null},envMapRotation:{value:new bt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new bt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new bt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new bt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new bt},normalScale:{value:new B(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new bt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new bt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new bt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new bt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new U(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new U(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new bt},alphaTest:{value:0},uvTransform:{value:new bt}},sprite:{diffuse:{value:new U(16777215)},opacity:{value:1},center:{value:new B(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new bt},alphaMap:{value:null},alphaMapTransform:{value:new bt},alphaTest:{value:0}}},Yo={basic:{uniforms:Qr([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.fog]),vertexShader:Jo.meshbasic_vert,fragmentShader:Jo.meshbasic_frag},lambert:{uniforms:Qr([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new U(0)}}]),vertexShader:Jo.meshlambert_vert,fragmentShader:Jo.meshlambert_frag},phong:{uniforms:Qr([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new U(0)},specular:{value:new U(1118481)},shininess:{value:30}}]),vertexShader:Jo.meshphong_vert,fragmentShader:Jo.meshphong_frag},standard:{uniforms:Qr([W.common,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.roughnessmap,W.metalnessmap,W.fog,W.lights,{emissive:{value:new U(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Jo.meshphysical_vert,fragmentShader:Jo.meshphysical_frag},toon:{uniforms:Qr([W.common,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.gradientmap,W.fog,W.lights,{emissive:{value:new U(0)}}]),vertexShader:Jo.meshtoon_vert,fragmentShader:Jo.meshtoon_frag},matcap:{uniforms:Qr([W.common,W.bumpmap,W.normalmap,W.displacementmap,W.fog,{matcap:{value:null}}]),vertexShader:Jo.meshmatcap_vert,fragmentShader:Jo.meshmatcap_frag},points:{uniforms:Qr([W.points,W.fog]),vertexShader:Jo.points_vert,fragmentShader:Jo.points_frag},dashed:{uniforms:Qr([W.common,W.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Jo.linedashed_vert,fragmentShader:Jo.linedashed_frag},depth:{uniforms:Qr([W.common,W.displacementmap]),vertexShader:Jo.depth_vert,fragmentShader:Jo.depth_frag},normal:{uniforms:Qr([W.common,W.bumpmap,W.normalmap,W.displacementmap,{opacity:{value:1}}]),vertexShader:Jo.meshnormal_vert,fragmentShader:Jo.meshnormal_frag},sprite:{uniforms:Qr([W.sprite,W.fog]),vertexShader:Jo.sprite_vert,fragmentShader:Jo.sprite_frag},background:{uniforms:{uvTransform:{value:new bt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Jo.background_vert,fragmentShader:Jo.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new bt}},vertexShader:Jo.backgroundCube_vert,fragmentShader:Jo.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Jo.cube_vert,fragmentShader:Jo.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Jo.equirect_vert,fragmentShader:Jo.equirect_frag},distanceRGBA:{uniforms:Qr([W.common,W.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Jo.distanceRGBA_vert,fragmentShader:Jo.distanceRGBA_frag},shadow:{uniforms:Qr([W.lights,W.fog,{color:{value:new U(0)},opacity:{value:1}}]),vertexShader:Jo.shadow_vert,fragmentShader:Jo.shadow_frag}};Yo.physical={uniforms:Qr([Yo.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new bt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new bt},clearcoatNormalScale:{value:new B(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new bt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new bt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new bt},sheen:{value:0},sheenColor:{value:new U(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new bt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new bt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new bt},transmissionSamplerSize:{value:new B},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new bt},attenuationDistance:{value:0},attenuationColor:{value:new U(0)},specularColor:{value:new U(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new bt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new bt},anisotropyVector:{value:new B},anisotropyMap:{value:null},anisotropyMapTransform:{value:new bt}}]),vertexShader:Jo.meshphysical_vert,fragmentShader:Jo.meshphysical_frag};var Xo={r:0,b:0,g:0},Zo=new An,Qo=new H;function $o(e,t,n,r,i,a,o){let s=new U(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new qr(new Xr(1,1,1),new ii({name:`BackgroundCubeMaterial`,uniforms:Zr(Yo.backgroundCube.uniforms),vertexShader:Yo.backgroundCube.vertexShader,fragmentShader:Yo.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),Zo.copy(n.backgroundRotation),Zo.x*=-1,Zo.y*=-1,Zo.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(Zo.y*=-1,Zo.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Qo.makeRotationFromEuler(Zo)),u.material.toneMapped=jt.getTransfer(r.colorSpace)!==Re,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new qr(new Da(2,2),new ii({name:`BackgroundMaterial`,uniforms:Zr(Yo.background.uniforms),vertexShader:Yo.background.vertexShader,fragmentShader:Yo.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=jt.getTransfer(r.colorSpace)!==Re,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(Xo,ei(e)),r.buffers.color.setClear(Xo.r,Xo.g,Xo.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function es(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function ts(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function ns(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function rs(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Yi,s=new bt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function is(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new mi(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var as=4,os=[.125,.215,.35,.446,.526,.582],ss=20,cs=new xo,ls=new U,us=null,ds=0,fs=0,ps=!1,ms=(1+Math.sqrt(5))/2,hs=1/ms,gs=[new V(-ms,hs,0),new V(ms,hs,0),new V(-hs,0,ms),new V(hs,0,ms),new V(0,ms,-hs),new V(0,ms,hs),new V(-1,1,-1),new V(1,1,-1),new V(-1,1,1),new V(1,1,1)],_s=new V,vs=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=_s}=i;us=this._renderer.getRenderTarget(),ds=this._renderer.getActiveCubeFace(),fs=this._renderer.getActiveMipmapLevel(),ps=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ws(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Cs(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(us,ds,fs),this._renderer.xr.enabled=ps,e.scissorTest=!1,xs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),us=this._renderer.getRenderTarget(),ds=this._renderer.getActiveCubeFace(),fs=this._renderer.getActiveMipmapLevel(),ps=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:s,minFilter:s,generateMipmaps:!1,type:_,format:T,colorSpace:Ie,depthBuffer:!1},r=bs(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=bs(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=ys(r)),this._blurMaterial=Ss(r,e,t)}return r}_compileMaterial(e){let t=new qr(this._lodPlanes[0],e);this._renderer.compile(t,cs)}_sceneToCubeUV(e,t,n,r,i){let a=new li(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(ls),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new hr({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new qr(new Xr,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(ls),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;xs(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=ws()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Cs());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new qr(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;xs(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,cs)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=gs[(r-t-1)%gs.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new qr(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):ss;m>ss&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ss}`);let h=[],g=0;for(let e=0;e<ss;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];xs(t,3*v*(r>_-as?r-_+as:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,cs)}};function ys(e){let t=[],n=[],r=[],i=e,a=e-as+1+os.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-as?s=os[o-e+as-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Fr;h.setAttribute(`position`,new wr(f,3)),h.setAttribute(`uv`,new wr(p,2)),h.setAttribute(`faceIndex`,new wr(m,1)),t.push(h),i>as&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function bs(e,t,n){let r=new Wt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function xs(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Ss(e,t,n){let r=new Float32Array(ss),i=new V(0,1,0);return new ii({name:`SphericalGaussianBlur`,defines:{n:ss,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Ts(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Cs(){return new ii({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Ts(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function ws(){return new ii({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ts(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ts(){return`

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
	`}function Es(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new vs(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new vs(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function Ds(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Et(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function Os(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(St(n)?Er:Tr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function ks(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function As(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function js(e,t,n){let r=new WeakMap,i=new Ht;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),_=new Gt(h,p,m,u);_.type=g,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new B(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Ms(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var Ns=new Vt,Ps=new xa(1,1),Fs=new Gt,Is=new Kt,Ls=new pi,Rs=[],zs=[],Bs=new Float32Array(16),Vs=new Float32Array(9),Hs=new Float32Array(4);function Us(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Rs[i];if(a===void 0&&(a=new Float32Array(i),Rs[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Ws(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Gs(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Ks(e,t){let n=zs[t];n===void 0&&(n=new Int32Array(t),zs[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function qs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Js(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ws(n,t))return;e.uniform2fv(this.addr,t),Gs(n,t)}}function Ys(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Ws(n,t))return;e.uniform3fv(this.addr,t),Gs(n,t)}}function Xs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ws(n,t))return;e.uniform4fv(this.addr,t),Gs(n,t)}}function Zs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ws(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Gs(n,t)}else{if(Ws(n,r))return;Hs.set(r),e.uniformMatrix2fv(this.addr,!1,Hs),Gs(n,r)}}function Qs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ws(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Gs(n,t)}else{if(Ws(n,r))return;Vs.set(r),e.uniformMatrix3fv(this.addr,!1,Vs),Gs(n,r)}}function $s(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ws(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Gs(n,t)}else{if(Ws(n,r))return;Bs.set(r),e.uniformMatrix4fv(this.addr,!1,Bs),Gs(n,r)}}function ec(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function tc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ws(n,t))return;e.uniform2iv(this.addr,t),Gs(n,t)}}function nc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ws(n,t))return;e.uniform3iv(this.addr,t),Gs(n,t)}}function rc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ws(n,t))return;e.uniform4iv(this.addr,t),Gs(n,t)}}function ic(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function ac(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ws(n,t))return;e.uniform2uiv(this.addr,t),Gs(n,t)}}function oc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ws(n,t))return;e.uniform3uiv(this.addr,t),Gs(n,t)}}function sc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ws(n,t))return;e.uniform4uiv(this.addr,t),Gs(n,t)}}function cc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Ps.compareFunction=515,a=Ps):a=Ns,n.setTexture2D(t||a,i)}function lc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Is,i)}function uc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Ls,i)}function dc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Fs,i)}function fc(e){switch(e){case 5126:return qs;case 35664:return Js;case 35665:return Ys;case 35666:return Xs;case 35674:return Zs;case 35675:return Qs;case 35676:return $s;case 5124:case 35670:return ec;case 35667:case 35671:return tc;case 35668:case 35672:return nc;case 35669:case 35673:return rc;case 5125:return ic;case 36294:return ac;case 36295:return oc;case 36296:return sc;case 35678:case 36198:case 36298:case 36306:case 35682:return cc;case 35679:case 36299:case 36307:return lc;case 35680:case 36300:case 36308:case 36293:return uc;case 36289:case 36303:case 36311:case 36292:return dc}}function pc(e,t){e.uniform1fv(this.addr,t)}function mc(e,t){let n=Us(t,this.size,2);e.uniform2fv(this.addr,n)}function hc(e,t){let n=Us(t,this.size,3);e.uniform3fv(this.addr,n)}function gc(e,t){let n=Us(t,this.size,4);e.uniform4fv(this.addr,n)}function _c(e,t){let n=Us(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function vc(e,t){let n=Us(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function yc(e,t){let n=Us(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function bc(e,t){e.uniform1iv(this.addr,t)}function xc(e,t){e.uniform2iv(this.addr,t)}function Sc(e,t){e.uniform3iv(this.addr,t)}function Cc(e,t){e.uniform4iv(this.addr,t)}function wc(e,t){e.uniform1uiv(this.addr,t)}function Tc(e,t){e.uniform2uiv(this.addr,t)}function Ec(e,t){e.uniform3uiv(this.addr,t)}function Dc(e,t){e.uniform4uiv(this.addr,t)}function Oc(e,t,n){let r=this.cache,i=t.length,a=Ks(n,i);Ws(r,a)||(e.uniform1iv(this.addr,a),Gs(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||Ns,a[e])}function kc(e,t,n){let r=this.cache,i=t.length,a=Ks(n,i);Ws(r,a)||(e.uniform1iv(this.addr,a),Gs(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Is,a[e])}function Ac(e,t,n){let r=this.cache,i=t.length,a=Ks(n,i);Ws(r,a)||(e.uniform1iv(this.addr,a),Gs(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Ls,a[e])}function jc(e,t,n){let r=this.cache,i=t.length,a=Ks(n,i);Ws(r,a)||(e.uniform1iv(this.addr,a),Gs(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Fs,a[e])}function Mc(e){switch(e){case 5126:return pc;case 35664:return mc;case 35665:return hc;case 35666:return gc;case 35674:return _c;case 35675:return vc;case 35676:return yc;case 5124:case 35670:return bc;case 35667:case 35671:return xc;case 35668:case 35672:return Sc;case 35669:case 35673:return Cc;case 5125:return wc;case 36294:return Tc;case 36295:return Ec;case 36296:return Dc;case 35678:case 36198:case 36298:case 36306:case 35682:return Oc;case 35679:case 36299:case 36307:return kc;case 35680:case 36300:case 36308:case 36293:return Ac;case 36289:case 36303:case 36311:case 36292:return jc}}var Nc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=fc(t.type)}},Pc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Mc(t.type)}},Fc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Ic=/(\w+)(\])?(\[|\.)?/g;function Lc(e,t){e.seq.push(t),e.map[t.id]=t}function Rc(e,t,n){let r=e.name,i=r.length;for(Ic.lastIndex=0;;){let a=Ic.exec(r),o=Ic.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Lc(n,l===void 0?new Nc(s,e,t):new Pc(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Fc(s),Lc(n,e)),n=e}}}var zc=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Rc(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Bc(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Vc=37297,Hc=0;function Uc(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Wc=new bt;function Gc(e){jt._getMatrix(Wc,jt.workingColorSpace,e);let t=`mat3( ${Wc.elements.map(e=>e.toFixed(4))} )`;switch(jt.getTransfer(e)){case Le:return[t,`LinearTransferOETF`];case Re:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Kc(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Uc(e.getShaderSource(t),r)}return i}function qc(e,t){let n=Gc(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function Jc(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Yc=new V;function Xc(){return jt.getLuminanceCoefficients(Yc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Yc.x.toFixed(4)}, ${Yc.y.toFixed(4)}, ${Yc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Zc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(el).join(`
`)}function Qc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function $c(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function el(e){return e!==``}function tl(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function nl(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var rl=/^[ \t]*#include +<([\w\d./]+)>/gm;function il(e){return e.replace(rl,ol)}var al=new Map;function ol(e,t){let n=Jo[t];if(n===void 0){let e=al.get(t);if(e!==void 0)n=Jo[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return il(n)}var sl=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function cl(e){return e.replace(sl,ll)}function ll(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function ul(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}function dl(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function fl(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function pl(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function ml(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function hl(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function gl(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=dl(n),l=fl(n),u=pl(n),d=ml(n),f=hl(n),p=Zc(n),m=Qc(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(el).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(el).join(`
`),_.length>0&&(_+=`
`)):(g=[ul(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(el).join(`
`),_=[ul(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Jo.tonemapping_pars_fragment,n.toneMapping===0?``:Jc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Jo.colorspace_pars_fragment,qc(`linearToOutputTexel`,n.outputColorSpace),Xc(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(el).join(`
`)),o=il(o),o=tl(o,n),o=nl(o,n),s=il(s),s=tl(s,n),s=nl(s,n),o=cl(o),s=cl(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Bc(i,i.VERTEX_SHADER,y),S=Bc(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Kc(i,x,`vertex`),n=Kc(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new zc(i,h),T=$c(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Vc)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Hc++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var _l=0,vl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new yl(e),t.set(e,n)),n}},yl=class{constructor(e){this.id=_l++,this.code=e,this.usedTimes=0}};function bl(e,t,n,r,i,a,o){let s=new jn,c=new vl,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,ee,O,k;if(C){let e=Yo[C];D=e.vertexShader,ee=e.fragmentShader}else D=a.vertexShader,ee=a.fragmentShader,c.update(a),O=c.getVertexShaderID(a),k=c.getFragmentShaderID(a);let A=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),j=_.isInstancedMesh===!0,M=_.isBatchedMesh===!0,N=!!a.map,P=!!a.matcap,ne=!!x,re=!!a.aoMap,ie=!!a.lightMap,ae=!!a.bumpMap,oe=!!a.normalMap,se=!!a.displacementMap,ce=!!a.emissiveMap,F=!!a.metalnessMap,le=!!a.roughnessMap,ue=a.anisotropy>0,de=a.clearcoat>0,fe=a.dispersion>0,pe=a.iridescence>0,me=a.sheen>0,I=a.transmission>0,he=ue&&!!a.anisotropyMap,ge=de&&!!a.clearcoatMap,_e=de&&!!a.clearcoatNormalMap,L=de&&!!a.clearcoatRoughnessMap,ve=pe&&!!a.iridescenceMap,R=pe&&!!a.iridescenceThicknessMap,ye=me&&!!a.sheenColorMap,be=me&&!!a.sheenRoughnessMap,xe=!!a.specularMap,Se=!!a.specularColorMap,Ce=!!a.specularIntensityMap,we=I&&!!a.transmissionMap,Te=I&&!!a.thicknessMap,Ee=!!a.gradientMap,De=!!a.alphaMap,Oe=a.alphaTest>0,ke=!!a.alphaHash,Ae=!!a.extensions,je=0;a.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(je=e.toneMapping);let Me={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:ee,defines:a.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:M,batchingColor:M&&_._colorsTexture!==null,instancing:j,instancingColor:j&&_.instanceColor!==null,instancingMorph:j&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Ie,alphaToCoverage:!!a.alphaToCoverage,map:N,matcap:P,envMap:ne,envMapMode:ne&&x.mapping,envMapCubeUVHeight:S,aoMap:re,lightMap:ie,bumpMap:ae,normalMap:oe,displacementMap:f&&se,emissiveMap:ce,normalMapObjectSpace:oe&&a.normalMapType===1,normalMapTangentSpace:oe&&a.normalMapType===0,metalnessMap:F,roughnessMap:le,anisotropy:ue,anisotropyMap:he,clearcoat:de,clearcoatMap:ge,clearcoatNormalMap:_e,clearcoatRoughnessMap:L,dispersion:fe,iridescence:pe,iridescenceMap:ve,iridescenceThicknessMap:R,sheen:me,sheenColorMap:ye,sheenRoughnessMap:be,specularMap:xe,specularColorMap:Se,specularIntensityMap:Ce,transmission:I,transmissionMap:we,thicknessMap:Te,gradientMap:Ee,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:De,alphaTest:Oe,alphaHash:ke,combine:a.combine,mapUv:N&&h(a.map.channel),aoMapUv:re&&h(a.aoMap.channel),lightMapUv:ie&&h(a.lightMap.channel),bumpMapUv:ae&&h(a.bumpMap.channel),normalMapUv:oe&&h(a.normalMap.channel),displacementMapUv:se&&h(a.displacementMap.channel),emissiveMapUv:ce&&h(a.emissiveMap.channel),metalnessMapUv:F&&h(a.metalnessMap.channel),roughnessMapUv:le&&h(a.roughnessMap.channel),anisotropyMapUv:he&&h(a.anisotropyMap.channel),clearcoatMapUv:ge&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:_e&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:L&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:R&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:ye&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:be&&h(a.sheenRoughnessMap.channel),specularMapUv:xe&&h(a.specularMap.channel),specularColorMapUv:Se&&h(a.specularColorMap.channel),specularIntensityMapUv:Ce&&h(a.specularIntensityMap.channel),transmissionMapUv:we&&h(a.transmissionMap.channel),thicknessMapUv:Te&&h(a.thicknessMap.channel),alphaMapUv:De&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(oe||ue),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(N||De),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:je,decodeVideoTexture:N&&a.map.isVideoTexture===!0&&jt.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ce&&a.emissiveMap.isVideoTexture===!0&&jt.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Ae&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ae&&a.extensions.multiDraw===!0||M)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Me.vertexUv1s=l.has(1),Me.vertexUv2s=l.has(2),Me.vertexUv3s=l.has(3),l.clear(),Me}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=Yo[t];n=ti.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new gl(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function xl(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Sl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Cl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function wl(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Sl),r.length>1&&r.sort(t||Cl),i.length>1&&i.sort(t||Cl)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function Tl(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new wl,e.set(t,[i])):n>=r.length?(i=new wl,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function El(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new V,color:new U};break;case`SpotLight`:n={position:new V,direction:new V,color:new U,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new V,color:new U,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new V,skyColor:new U,groundColor:new U};break;case`RectAreaLight`:n={color:new U,position:new V,halfWidth:new V,halfHeight:new V}}return e[t.id]=n,n}}}function Dl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Ol=0;function kl(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Al(e){let t=new El,n=Dl(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new V);let i=new V,a=new H,o=new H;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(kl);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=W.LTC_FLOAT_1,r.rectAreaLTC2=W.LTC_FLOAT_2):(r.rectAreaLTC1=W.LTC_HALF_1,r.rectAreaLTC2=W.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Ol++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function jl(e){let t=new Al(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function Ml(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new jl(e),t.set(n,[a])):r>=i.length?(a=new jl(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Nl=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Pl=`uniform sampler2D shadow_pass;
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
}`;function Fl(e,t,n){let r=new $i,a=new B,o=new B,s=new Ht,c=new ja({depthPacking:Pe}),l=new Ma,u={},d=n.maxTextureSize,f={0:1,1:0,2:2},p=new ii({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new B},radius:{value:4}},vertexShader:Nl,fragmentShader:Pl}),m=p.clone();m.defines.HORIZONTAL_PASS=1;let h=new Fr;h.setAttribute(`position`,new wr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new qr(h,p),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let v=this.type;this.render=function(t,n,c){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||t.length===0)return;let l=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.state;p.setBlending(0),p.buffers.depth.getReversed()===!0?p.buffers.color.setClear(0,0,0,0):p.buffers.color.setClear(1,1,1,1),p.buffers.depth.setTest(!0),p.setScissorTest(!1);let m=v!==3&&this.type===3,h=v===3&&this.type!==3;for(let l=0,u=t.length;l<u;l++){let u=t[l],f=u.shadow;if(f===void 0){console.warn(`THREE.WebGLShadowMap:`,u,`has no shadow.`);continue}if(f.autoUpdate===!1&&f.needsUpdate===!1)continue;a.copy(f.mapSize);let g=f.getFrameExtents();if(a.multiply(g),o.copy(f.mapSize),(a.x>d||a.y>d)&&(a.x>d&&(o.x=Math.floor(d/g.x),a.x=o.x*g.x,f.mapSize.x=o.x),a.y>d&&(o.y=Math.floor(d/g.y),a.y=o.y*g.y,f.mapSize.y=o.y)),f.map===null||m===!0||h===!0){let e=this.type===3?{}:{minFilter:i,magFilter:i};f.map!==null&&f.map.dispose(),f.map=new Wt(a.x,a.y,e),f.map.texture.name=u.name+`.shadowMap`,f.camera.updateProjectionMatrix()}e.setRenderTarget(f.map),e.clear();let _=f.getViewportCount();for(let e=0;e<_;e++){let t=f.getViewport(e);s.set(o.x*t.x,o.y*t.y,o.x*t.z,o.y*t.w),p.viewport(s),f.updateMatrices(u,e),r=f.getFrustum(),x(n,c,f.camera,u,this.type)}f.isPointLightShadow!==!0&&this.type===3&&y(f,c),f.needsUpdate=!1}v=this.type,_.needsUpdate=!1,e.setRenderTarget(l,u,f)};function y(n,r){let i=t.update(g);p.defines.VSM_SAMPLES!==n.blurSamples&&(p.defines.VSM_SAMPLES=n.blurSamples,m.defines.VSM_SAMPLES=n.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new Wt(a.x,a.y)),p.uniforms.shadow_pass.value=n.map.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,p,g,null),m.uniforms.shadow_pass.value=n.mapPass.texture,m.uniforms.resolution.value=n.mapSize,m.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,m,g,null)}function b(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?l:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=u[e];r===void 0&&(r={},u[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,S)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?f[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function x(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=b(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=b(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)x(c[e],i,a,o,s)}function S(e){e.target.removeEventListener(`dispose`,S);for(let t in u){let n=u[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var Il={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Ll(e,t){function n(){let t=!1,n=new Ht,r=null,i=new Ht(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ce(e.DEPTH_TEST):F(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Il[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ce(e.STENCIL_TEST):F(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new U(0,0,0),w=0,T=!1,E=null,D=null,ee=null,O=null,k=null,A=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,j=0,M=e.getParameter(e.VERSION);M.indexOf(`WebGL`)===-1?M.indexOf(`OpenGL ES`)!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(M)[1]),te=j>=2):(j=parseFloat(/^WebGL (\d)/.exec(M)[1]),te=j>=1);let N=null,P={},ne=e.getParameter(e.SCISSOR_BOX),re=e.getParameter(e.VIEWPORT),ie=new Ht().fromArray(ne),ae=new Ht().fromArray(re);function oe(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let se={};se[e.TEXTURE_2D]=oe(e.TEXTURE_2D,e.TEXTURE_2D,1),se[e.TEXTURE_CUBE_MAP]=oe(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[e.TEXTURE_2D_ARRAY]=oe(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),se[e.TEXTURE_3D]=oe(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ce(e.DEPTH_TEST),o.setFunc(3),he(!1),ge(1),ce(e.CULL_FACE),me(0);function ce(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function F(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function le(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function ue(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function de(t){return m!==t&&(e.useProgram(t),m=t,!0)}let fe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};fe[103]=e.MIN,fe[104]=e.MAX;let pe={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function me(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(F(e.BLEND),h=!1);return}if(h===!1&&(ce(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(fe[n],fe[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(pe[r],pe[i],pe[o],pe[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function I(t,n){t.side===2?F(e.CULL_FACE):ce(e.CULL_FACE);let r=t.side===1;n&&(r=!r),he(r),t.blending===1&&t.transparent===!1?me(0):me(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),L(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ce(e.SAMPLE_ALPHA_TO_COVERAGE):F(e.SAMPLE_ALPHA_TO_COVERAGE)}function he(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function ge(t){t===0?F(e.CULL_FACE):(ce(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function _e(t){t!==ee&&(te&&e.lineWidth(t),ee=t)}function L(t,n,r){t?(ce(e.POLYGON_OFFSET_FILL),(O!==n||k!==r)&&(e.polygonOffset(n,r),O=n,k=r)):F(e.POLYGON_OFFSET_FILL)}function ve(t){t?ce(e.SCISSOR_TEST):F(e.SCISSOR_TEST)}function R(t){t===void 0&&(t=e.TEXTURE0+A-1),N!==t&&(e.activeTexture(t),N=t)}function ye(t,n,r){r===void 0&&(r=N===null?e.TEXTURE0+A-1:N);let i=P[r];i===void 0&&(i={type:void 0,texture:void 0},P[r]=i),(i.type!==t||i.texture!==n)&&(N!==r&&(e.activeTexture(r),N=r),e.bindTexture(t,n||se[t]),i.type=t,i.texture=n)}function be(){let t=P[N];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function xe(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ce(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ae(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function je(t){ie.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ie.copy(t))}function Me(t){ae.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ae.copy(t))}function Ne(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Pe(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Fe(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},N=null,P={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new U(0,0,0),w=0,T=!1,E=null,D=null,ee=null,O=null,k=null,ie.set(0,0,e.canvas.width,e.canvas.height),ae.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ce,disable:F,bindFramebuffer:le,drawBuffers:ue,useProgram:de,setBlending:me,setMaterial:I,setFlipSided:he,setCullFace:ge,setLineWidth:_e,setPolygonOffset:L,setScissorTest:ve,activeTexture:R,bindTexture:ye,unbindTexture:be,compressedTexImage2D:xe,compressedTexImage3D:Se,texImage2D:ke,texImage3D:Ae,updateUBOMapping:Ne,uniformBlockBinding:Pe,texStorage2D:De,texStorage3D:Oe,texSubImage2D:Ce,texSubImage3D:we,compressedTexSubImage2D:Te,compressedTexSubImage3D:Ee,scissor:je,viewport:Me,reset:Fe}}function Rl(e,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new B,y=new WeakMap,b,x=new WeakMap,S=!1;try{S=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function C(e,t){return S?new OffscreenCanvas(e,t):Ct(`canvas`)}function w(e,t,n){let r=1,i=ke(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);b===void 0&&(b=C(n,a));let o=t?C(n,a):b;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function T(e){return e.generateMipmaps}function E(t){e.generateMipmap(t)}function ee(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function O(t,n,r,i,a=!1){if(t!==null){if(e[t]!==void 0)return e[t];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+t+`'`)}let o=n;if(n===e.RED&&(r===e.FLOAT&&(o=e.R32F),r===e.HALF_FLOAT&&(o=e.R16F),r===e.UNSIGNED_BYTE&&(o=e.R8)),n===e.RED_INTEGER&&(r===e.UNSIGNED_BYTE&&(o=e.R8UI),r===e.UNSIGNED_SHORT&&(o=e.R16UI),r===e.UNSIGNED_INT&&(o=e.R32UI),r===e.BYTE&&(o=e.R8I),r===e.SHORT&&(o=e.R16I),r===e.INT&&(o=e.R32I)),n===e.RG&&(r===e.FLOAT&&(o=e.RG32F),r===e.HALF_FLOAT&&(o=e.RG16F),r===e.UNSIGNED_BYTE&&(o=e.RG8)),n===e.RG_INTEGER&&(r===e.UNSIGNED_BYTE&&(o=e.RG8UI),r===e.UNSIGNED_SHORT&&(o=e.RG16UI),r===e.UNSIGNED_INT&&(o=e.RG32UI),r===e.BYTE&&(o=e.RG8I),r===e.SHORT&&(o=e.RG16I),r===e.INT&&(o=e.RG32I)),n===e.RGB_INTEGER&&(r===e.UNSIGNED_BYTE&&(o=e.RGB8UI),r===e.UNSIGNED_SHORT&&(o=e.RGB16UI),r===e.UNSIGNED_INT&&(o=e.RGB32UI),r===e.BYTE&&(o=e.RGB8I),r===e.SHORT&&(o=e.RGB16I),r===e.INT&&(o=e.RGB32I)),n===e.RGBA_INTEGER&&(r===e.UNSIGNED_BYTE&&(o=e.RGBA8UI),r===e.UNSIGNED_SHORT&&(o=e.RGBA16UI),r===e.UNSIGNED_INT&&(o=e.RGBA32UI),r===e.BYTE&&(o=e.RGBA8I),r===e.SHORT&&(o=e.RGBA16I),r===e.INT&&(o=e.RGBA32I)),n===e.RGB&&(r===e.UNSIGNED_INT_5_9_9_9_REV&&(o=e.RGB9_E5),r===e.UNSIGNED_INT_10F_11F_11F_REV&&(o=e.R11F_G11F_B10F)),n===e.RGBA){let t=a?Le:jt.getTransfer(i);r===e.FLOAT&&(o=e.RGBA32F),r===e.HALF_FLOAT&&(o=e.RGBA16F),r===e.UNSIGNED_BYTE&&(o=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),r===e.UNSIGNED_SHORT_4_4_4_4&&(o=e.RGBA4),r===e.UNSIGNED_SHORT_5_5_5_1&&(o=e.RGB5_A1)}return(o===e.R16F||o===e.R32F||o===e.RG16F||o===e.RG32F||o===e.RGBA16F||o===e.RGBA32F)&&u.get(`EXT_color_buffer_float`),o}function k(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function A(e,t){return T(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function te(e){let t=e.target;t.removeEventListener(`dispose`,te),M(t),t.isVideoTexture&&y.delete(t)}function j(e){let t=e.target;t.removeEventListener(`dispose`,j),P(t)}function M(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=x.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&N(e),Object.keys(r).length===0&&x.delete(n)}f.remove(e)}function N(t){let n=f.get(t);e.deleteTexture(n.__webglTexture);let r=t.source,i=x.get(r);delete i[n.__cacheKey],h.memory.textures--}function P(t){let n=f.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),f.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let r=t.textures;for(let t=0,n=r.length;t<n;t++){let n=f.get(r[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),h.memory.textures--),f.remove(r[t])}f.remove(t)}let ne=0;function re(){ne=0}function ie(){let e=ne;return e>=p.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+p.maxTextures),ne+=1,e}function ae(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function oe(t,n){let r=f.get(t);if(t.isVideoTexture&&De(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&r.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{he(r,t,n);return}}else t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null);d.bindTexture(e.TEXTURE_2D,r.__webglTexture,e.TEXTURE0+n)}function se(t,n){let r=f.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version){he(r,t,n);return}d.bindTexture(e.TEXTURE_2D_ARRAY,r.__webglTexture,e.TEXTURE0+n)}function ce(t,n){let r=f.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version){he(r,t,n);return}d.bindTexture(e.TEXTURE_3D,r.__webglTexture,e.TEXTURE0+n)}function F(t,n){let r=f.get(t);if(t.version>0&&r.__version!==t.version){ge(r,t,n);return}d.bindTexture(e.TEXTURE_CUBE_MAP,r.__webglTexture,e.TEXTURE0+n)}let le={[t]:e.REPEAT,[n]:e.CLAMP_TO_EDGE,[r]:e.MIRRORED_REPEAT},ue={[i]:e.NEAREST,[a]:e.NEAREST_MIPMAP_NEAREST,[o]:e.NEAREST_MIPMAP_LINEAR,[s]:e.LINEAR,[c]:e.LINEAR_MIPMAP_NEAREST,[l]:e.LINEAR_MIPMAP_LINEAR},de={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function fe(t,n){if(n.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(n.magFilter===1006||n.magFilter===1007||n.magFilter===1005||n.magFilter===1008||n.minFilter===1006||n.minFilter===1007||n.minFilter===1005||n.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(t,e.TEXTURE_WRAP_S,le[n.wrapS]),e.texParameteri(t,e.TEXTURE_WRAP_T,le[n.wrapT]),(t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY)&&e.texParameteri(t,e.TEXTURE_WRAP_R,le[n.wrapR]),e.texParameteri(t,e.TEXTURE_MAG_FILTER,ue[n.magFilter]),e.texParameteri(t,e.TEXTURE_MIN_FILTER,ue[n.minFilter]),n.compareFunction&&(e.texParameteri(t,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(t,e.TEXTURE_COMPARE_FUNC,de[n.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(n.magFilter===1003||n.minFilter!==1005&&n.minFilter!==1008||n.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(n.anisotropy>1||f.get(n).__currentAnisotropy){let r=u.get(`EXT_texture_filter_anisotropic`);e.texParameterf(t,r.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(n.anisotropy,p.getMaxAnisotropy())),f.get(n).__currentAnisotropy=n.anisotropy}}}function pe(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,te));let i=n.source,a=x.get(i);a===void 0&&(a={},x.set(i,a));let o=ae(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},h.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&N(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function me(e,t,n){return Math.floor(Math.floor(e/n)/t)}function I(t,n,r,i){let a=t.updateRanges;if(a.length===0)d.texSubImage2D(e.TEXTURE_2D,0,0,0,n.width,n.height,r,i,n.data);else{a.sort((e,t)=>e.start-t.start);let o=0;for(let e=1;e<a.length;e++){let t=a[o],r=a[e],i=t.start+t.count,s=me(r.start,n.width,4),c=me(t.start,n.width,4);r.start<=i+1&&s===c&&me(r.start+r.count-1,n.width,4)===s?t.count=Math.max(t.count,r.start+r.count-t.start):(++o,a[o]=r)}a.length=o+1;let s=e.getParameter(e.UNPACK_ROW_LENGTH),c=e.getParameter(e.UNPACK_SKIP_PIXELS),l=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,n.width);for(let t=0,o=a.length;t<o;t++){let o=a[t],s=Math.floor(o.start/4),c=Math.ceil(o.count/4),l=s%n.width,u=Math.floor(s/n.width),f=c;e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u),d.texSubImage2D(e.TEXTURE_2D,0,l,u,f,1,r,i,n.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,s),e.pixelStorei(e.UNPACK_SKIP_PIXELS,c),e.pixelStorei(e.UNPACK_SKIP_ROWS,l)}}function he(t,n,r){let i=e.TEXTURE_2D;(n.isDataArrayTexture||n.isCompressedArrayTexture)&&(i=e.TEXTURE_2D_ARRAY),n.isData3DTexture&&(i=e.TEXTURE_3D);let a=pe(t,n),o=n.source;d.bindTexture(i,t.__webglTexture,e.TEXTURE0+r);let s=f.get(o);if(o.version!==s.__version||a===!0){d.activeTexture(e.TEXTURE0+r);let t=jt.getPrimaries(jt.workingColorSpace),c=n.colorSpace===``?null:jt.getPrimaries(n.colorSpace),l=n.colorSpace===``||t===c?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,l);let u=w(n.image,!1,p.maxTextureSize);u=Oe(n,u);let f=m.convert(n.format,n.colorSpace),h=m.convert(n.type),g=O(n.internalFormat,f,h,n.colorSpace,n.isVideoTexture);fe(i,n);let _,v=n.mipmaps,y=n.isVideoTexture!==!0,b=s.__version===void 0||a===!0,x=o.dataReady,S=A(n,u);if(n.isDepthTexture)g=k(n.format===D,n.type),b&&(y?d.texStorage2D(e.TEXTURE_2D,1,g,u.width,u.height):d.texImage2D(e.TEXTURE_2D,0,g,u.width,u.height,0,f,h,null));else if(n.isDataTexture){if(v.length>0){y&&b&&d.texStorage2D(e.TEXTURE_2D,S,g,v[0].width,v[0].height);for(let t=0,n=v.length;t<n;t++)_=v[t],y?x&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,_.width,_.height,f,h,_.data):d.texImage2D(e.TEXTURE_2D,t,g,_.width,_.height,0,f,h,_.data);n.generateMipmaps=!1}else y?(b&&d.texStorage2D(e.TEXTURE_2D,S,g,u.width,u.height),x&&I(n,u,f,h)):d.texImage2D(e.TEXTURE_2D,0,g,u.width,u.height,0,f,h,u.data)}else if(n.isCompressedTexture){if(n.isCompressedArrayTexture){y&&b&&d.texStorage3D(e.TEXTURE_2D_ARRAY,S,g,v[0].width,v[0].height,u.depth);for(let t=0,r=v.length;t<r;t++)if(_=v[t],n.format!==1023){if(f!==null){if(y){if(x){if(n.layerUpdates.size>0){let r=Wo(_.width,_.height,n.format,n.type);for(let i of n.layerUpdates){let n=_.data.subarray(i*r/_.data.BYTES_PER_ELEMENT,(i+1)*r/_.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,_.width,_.height,1,f,n)}n.clearLayerUpdates()}else d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,_.width,_.height,u.depth,f,_.data)}}else d.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,g,_.width,_.height,u.depth,0,_.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else y?x&&d.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,_.width,_.height,u.depth,f,h,_.data):d.texImage3D(e.TEXTURE_2D_ARRAY,t,g,_.width,_.height,u.depth,0,f,h,_.data)}else{y&&b&&d.texStorage2D(e.TEXTURE_2D,S,g,v[0].width,v[0].height);for(let t=0,r=v.length;t<r;t++)_=v[t],n.format===1023?y?x&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,_.width,_.height,f,h,_.data):d.texImage2D(e.TEXTURE_2D,t,g,_.width,_.height,0,f,h,_.data):f===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):y?x&&d.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,_.width,_.height,f,_.data):d.compressedTexImage2D(e.TEXTURE_2D,t,g,_.width,_.height,0,_.data)}}else if(n.isDataArrayTexture){if(y){if(b&&d.texStorage3D(e.TEXTURE_2D_ARRAY,S,g,u.width,u.height,u.depth),x){if(n.layerUpdates.size>0){let t=Wo(u.width,u.height,n.format,n.type);for(let r of n.layerUpdates){let n=u.data.subarray(r*t/u.data.BYTES_PER_ELEMENT,(r+1)*t/u.data.BYTES_PER_ELEMENT);d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,u.width,u.height,1,f,h,n)}n.clearLayerUpdates()}else d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,u.width,u.height,u.depth,f,h,u.data)}}else d.texImage3D(e.TEXTURE_2D_ARRAY,0,g,u.width,u.height,u.depth,0,f,h,u.data)}else if(n.isData3DTexture)y?(b&&d.texStorage3D(e.TEXTURE_3D,S,g,u.width,u.height,u.depth),x&&d.texSubImage3D(e.TEXTURE_3D,0,0,0,0,u.width,u.height,u.depth,f,h,u.data)):d.texImage3D(e.TEXTURE_3D,0,g,u.width,u.height,u.depth,0,f,h,u.data);else if(n.isFramebufferTexture){if(b){if(y)d.texStorage2D(e.TEXTURE_2D,S,g,u.width,u.height);else{let t=u.width,n=u.height;for(let r=0;r<S;r++)d.texImage2D(e.TEXTURE_2D,r,g,t,n,0,f,h,null),t>>=1,n>>=1}}}else if(v.length>0){if(y&&b){let t=ke(v[0]);d.texStorage2D(e.TEXTURE_2D,S,g,t.width,t.height)}for(let t=0,n=v.length;t<n;t++)_=v[t],y?x&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f,h,_):d.texImage2D(e.TEXTURE_2D,t,g,f,h,_);n.generateMipmaps=!1}else if(y){if(b){let t=ke(u);d.texStorage2D(e.TEXTURE_2D,S,g,t.width,t.height)}x&&d.texSubImage2D(e.TEXTURE_2D,0,0,0,f,h,u)}else d.texImage2D(e.TEXTURE_2D,0,g,f,h,u);T(n)&&E(i),s.__version=o.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function ge(t,n,r){if(n.image.length!==6)return;let i=pe(t,n),a=n.source;d.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+r);let o=f.get(a);if(a.version!==o.__version||i===!0){d.activeTexture(e.TEXTURE0+r);let t=jt.getPrimaries(jt.workingColorSpace),s=n.colorSpace===``?null:jt.getPrimaries(n.colorSpace),c=n.colorSpace===``||t===s?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,c);let l=n.isCompressedTexture||n.image[0].isCompressedTexture,u=n.image[0]&&n.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!l&&!u?f[e]=w(n.image[e],!0,p.maxCubemapSize):f[e]=u?n.image[e].image:n.image[e],f[e]=Oe(n,f[e]);let h=f[0],g=m.convert(n.format,n.colorSpace),_=m.convert(n.type),v=O(n.internalFormat,g,_,n.colorSpace),y=n.isVideoTexture!==!0,b=o.__version===void 0||i===!0,x=a.dataReady,S=A(n,h);fe(e.TEXTURE_CUBE_MAP,n);let C;if(l){y&&b&&d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=f[t].mipmaps;for(let r=0;r<C.length;r++){let i=C[r];n.format===1023?y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,g,_,i.data):g===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):d.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,i.data)}}}else{if(C=n.mipmaps,y&&b){C.length>0&&S++;let t=ke(f[0]);d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(u){y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,f[t].width,f[t].height,g,_,f[t].data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,f[t].width,f[t].height,0,g,_,f[t].data);for(let n=0;n<C.length;n++){let r=C[n].image[t].image;y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,r.width,r.height,g,_,r.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,r.width,r.height,0,g,_,r.data)}}else{y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,f[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,f[t]);for(let n=0;n<C.length;n++){let r=C[n];y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,g,_,r.image[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,g,_,r.image[t])}}}T(n)&&E(e.TEXTURE_CUBE_MAP),o.__version=a.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function _e(t,n,r,i,a,o){let s=m.convert(r.format,r.colorSpace),c=m.convert(r.type),l=O(r.internalFormat,s,c,r.colorSpace),u=f.get(n),p=f.get(r);if(p.__renderTarget=n,!u.__hasExternalTextures){let t=Math.max(1,n.width>>o),r=Math.max(1,n.height>>o);a===e.TEXTURE_3D||a===e.TEXTURE_2D_ARRAY?d.texImage3D(a,o,l,t,r,n.depth,0,s,c,null):d.texImage2D(a,o,l,t,r,0,s,c,null)}d.bindFramebuffer(e.FRAMEBUFFER,t),Ee(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,i,a,p.__webglTexture,0,Te(n)):(a===e.TEXTURE_2D||a>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&a<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,i,a,p.__webglTexture,o),d.bindFramebuffer(e.FRAMEBUFFER,null)}function L(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=k(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,c=Te(n);Ee(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,c,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,c,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],o=m.convert(a.format,a.colorSpace),s=m.convert(a.type),c=O(a.internalFormat,o,s,a.colorSpace),l=Te(n);r&&Ee(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,n.width,n.height):Ee(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,c,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,c,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ve(t,n){if(n&&n.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(d.bindFramebuffer(e.FRAMEBUFFER,t),!(n.depthTexture&&n.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let r=f.get(n.depthTexture);r.__renderTarget=n,(!r.__webglTexture||n.depthTexture.image.width!==n.width||n.depthTexture.image.height!==n.height)&&(n.depthTexture.image.width=n.width,n.depthTexture.image.height=n.height,n.depthTexture.needsUpdate=!0),oe(n.depthTexture,0);let i=r.__webglTexture,a=Te(n);if(n.depthTexture.format===1026)Ee(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,i,0,a):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,i,0);else if(n.depthTexture.format===1027)Ee(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,i,0,a):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,i,0);else throw Error(`Unknown depthTexture format`)}function R(t){let n=f.get(t),r=t.isWebGLCubeRenderTarget===!0;if(n.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(n.__depthDisposeCallback&&n.__depthDisposeCallback(),e){let t=()=>{delete n.__boundDepthTexture,delete n.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),n.__depthDisposeCallback=t}n.__boundDepthTexture=e}if(t.depthTexture&&!n.__autoAllocateDepthBuffer){if(r)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?ve(n.__webglFramebuffer[0],t):ve(n.__webglFramebuffer,t)}else if(r){n.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[r]),n.__webglDepthbuffer[r]===void 0)n.__webglDepthbuffer[r]=e.createRenderbuffer(),L(n.__webglDepthbuffer[r],t,!1);else{let i=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=n.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,i,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[0]):d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer),n.__webglDepthbuffer===void 0)n.__webglDepthbuffer=e.createRenderbuffer(),L(n.__webglDepthbuffer,t,!1);else{let r=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,i=n.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,r,e.RENDERBUFFER,i)}}d.bindFramebuffer(e.FRAMEBUFFER,null)}function ye(t,n,r){let i=f.get(t);n!==void 0&&_e(i.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),r!==void 0&&R(t)}function be(t){let n=t.texture,r=f.get(t),i=f.get(n);t.addEventListener(`dispose`,j);let a=t.textures,o=t.isWebGLCubeRenderTarget===!0,s=a.length>1;if(s||(i.__webglTexture===void 0&&(i.__webglTexture=e.createTexture()),i.__version=n.version,h.memory.textures++),o){r.__webglFramebuffer=[];for(let t=0;t<6;t++)if(n.mipmaps&&n.mipmaps.length>0){r.__webglFramebuffer[t]=[];for(let i=0;i<n.mipmaps.length;i++)r.__webglFramebuffer[t][i]=e.createFramebuffer()}else r.__webglFramebuffer[t]=e.createFramebuffer()}else{if(n.mipmaps&&n.mipmaps.length>0){r.__webglFramebuffer=[];for(let t=0;t<n.mipmaps.length;t++)r.__webglFramebuffer[t]=e.createFramebuffer()}else r.__webglFramebuffer=e.createFramebuffer();if(s)for(let t=0,n=a.length;t<n;t++){let n=f.get(a[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),h.memory.textures++)}if(t.samples>0&&Ee(t)===!1){r.__webglMultisampledFramebuffer=e.createFramebuffer(),r.__webglColorRenderbuffer=[],d.bindFramebuffer(e.FRAMEBUFFER,r.__webglMultisampledFramebuffer);for(let n=0;n<a.length;n++){let i=a[n];r.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.__webglColorRenderbuffer[n]);let o=m.convert(i.format,i.colorSpace),s=m.convert(i.type),c=O(i.internalFormat,o,s,i.colorSpace,t.isXRRenderTarget===!0),l=Te(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,r.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(r.__webglDepthRenderbuffer=e.createRenderbuffer(),L(r.__webglDepthRenderbuffer,t,!0)),d.bindFramebuffer(e.FRAMEBUFFER,null)}}if(o){d.bindTexture(e.TEXTURE_CUBE_MAP,i.__webglTexture),fe(e.TEXTURE_CUBE_MAP,n);for(let i=0;i<6;i++)if(n.mipmaps&&n.mipmaps.length>0)for(let a=0;a<n.mipmaps.length;a++)_e(r.__webglFramebuffer[i][a],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,a);else _e(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,0);T(n)&&E(e.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(s){for(let n=0,i=a.length;n<i;n++){let i=a[n],o=f.get(i),s=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(s=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(s,o.__webglTexture),fe(s,i),_e(r.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0+n,s,0),T(i)&&E(s)}d.unbindTexture()}else{let a=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(a=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(a,i.__webglTexture),fe(a,n),n.mipmaps&&n.mipmaps.length>0)for(let i=0;i<n.mipmaps.length;i++)_e(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,a,i);else _e(r.__webglFramebuffer,t,n,e.COLOR_ATTACHMENT0,a,0);T(n)&&E(a),d.unbindTexture()}t.depthBuffer&&R(t)}function xe(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(T(r)){let t=ee(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),E(t),d.unbindTexture()}}}let Se=[],Ce=[];function we(t){if(t.samples>0){if(Ee(t)===!1){let n=t.textures,r=t.width,i=t.height,a=e.COLOR_BUFFER_BIT,o=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,s=f.get(t),c=n.length>1;if(c)for(let t=0;t<n.length;t++)d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);d.bindFramebuffer(e.READ_FRAMEBUFFER,s.__webglMultisampledFramebuffer);let l=t.texture.mipmaps;l&&l.length>0?d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer[0]):d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer);for(let l=0;l<n.length;l++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(a|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(a|=e.STENCIL_BUFFER_BIT)),c){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,s.__webglColorRenderbuffer[l]);let t=f.get(n[l]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,r,i,0,0,r,i,a,e.NEAREST),_===!0&&(Se.length=0,Ce.length=0,Se.push(e.COLOR_ATTACHMENT0+l),t.depthBuffer&&t.resolveDepthBuffer===!1&&(Se.push(o),Ce.push(o),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Ce)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Se))}if(d.bindFramebuffer(e.READ_FRAMEBUFFER,null),d.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),c)for(let t=0;t<n.length;t++){d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,s.__webglColorRenderbuffer[t]);let r=f.get(n[t]).__webglTexture;d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,r,0)}d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&_){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Te(e){return Math.min(p.maxSamples,e.samples)}function Ee(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function De(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Oe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(jt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function ke(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=ie,this.resetTextureUnits=re,this.setTexture2D=oe,this.setTexture2DArray=se,this.setTexture3D=ce,this.setTextureCube=F,this.rebindTextures=ye,this.setupRenderTarget=be,this.updateRenderTargetMipmap=xe,this.updateMultisampleRenderTarget=we,this.setupDepthRenderbuffer=R,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=Ee}function zl(e,t){function n(n,r=``){let i,a=jt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Bl=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Vl=`
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

}`,Hl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Sa(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new ii({vertexShader:Bl,fragmentShader:Vl,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new qr(new Da(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ul=class extends We{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,d=null,f=null,p=null,m=null,g=typeof XRWebGLBinding<`u`,_=new Hl,v={},y=t.getContextAttributes(),x=null,S=null,C=[],w=[],ee=new B,O=null,k=new li;k.viewport=new Ht;let A=new li;A.viewport=new Ht;let te=[k,A],j=new Do,M=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new _i,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new _i,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new _i,C[e]=t),t.getHandSpace()};function P(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ne(){r.removeEventListener(`select`,P),r.removeEventListener(`selectstart`,P),r.removeEventListener(`selectend`,P),r.removeEventListener(`squeeze`,P),r.removeEventListener(`squeezestart`,P),r.removeEventListener(`squeezeend`,P),r.removeEventListener(`end`,ne),r.removeEventListener(`inputsourceschange`,re);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}M=null,N=null,_.reset();for(let e in v)delete v[e];e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,ue.stop(),n.isPresenting=!1,e.setPixelRatio(O),e.setSize(ee.width,ee.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,P),r.addEventListener(`selectstart`,P),r.addEventListener(`selectend`,P),r.addEventListener(`squeeze`,P),r.addEventListener(`squeezestart`,P),r.addEventListener(`squeezeend`,P),r.addEventListener(`end`,ne),r.addEventListener(`inputsourceschange`,re),y.xrCompatible!==!0&&await t.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(ee),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;y.depth&&(o=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=y.stencil?D:E,a=y.stencil?b:h);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Wt(f.textureWidth,f.textureHeight,{format:T,type:u,depthTexture:new xa(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new Wt(p.framebufferWidth,p.framebufferHeight,{format:T,type:u,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ue.setContext(r),ue.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function re(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let ie=new V,ae=new V;function oe(e,t,n){ie.setFromMatrixPosition(t.matrixWorld),ae.setFromMatrixPosition(n.matrixWorld);let r=ie.distanceTo(ae),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function se(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),j.near=A.near=k.near=t,j.far=A.far=k.far=n,(M!==j.near||N!==j.far)&&(r.updateRenderState({depthNear:j.near,depthFar:j.far}),M=j.near,N=j.far),j.layers.mask=e.layers.mask|6,k.layers.mask=j.layers.mask&3,A.layers.mask=j.layers.mask&5;let i=e.parent,a=j.cameras;se(j,i);for(let e=0;e<a.length;e++)se(a[e],i);a.length===2?oe(j,k,A):j.projectionMatrix.copy(k.projectionMatrix),ce(e,j,i)};function ce(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Je*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let F=null;function le(t,i){if(l=i.getViewerPose(c||a),m=i,l!==null){let t=l.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==j.cameras.length&&(j.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=te[n];o===void 0&&(o=new li,o.layers.enable(n),o.viewport=new Ht,te[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(j.matrix.copy(o.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),i===!0&&j.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new Sa,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}F&&F(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),m=null}let ue=new Ko;ue.setAnimationLoop(le),this.setAnimationLoop=function(e){F=e},this.dispose=function(){}}},Wl=new An,Gl=new H;function Kl(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,ei(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,Wl.copy(o),Wl.x*=-1,Wl.y*=-1,Wl.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(Wl.y*=-1,Wl.z*=-1),e.envMapRotation.value.setFromMatrix4(Gl.makeRotationFromEuler(Wl)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function ql(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Jl=class{constructor(e={}){let{canvas:t=wt(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);m=n.getContextAttributes().alpha}else m=a;let h=new Uint32Array(4),g=new Int32Array(4),v=null,y=null,b=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let S=this,C=!1;this._outputColorSpace=Fe;let w=0,T=0,E=null,D=-1,ee=null,O=new Ht,k=new Ht,A=null,te=new U(0),j=0,M=t.width,N=t.height,P=1,ne=null,re=null,ie=new Ht(0,0,M,N),ae=new Ht(0,0,M,N),oe=!1,se=new $i,ce=!1,F=!1,le=new H,ue=new V,de=new Ht,fe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},pe=!1;function me(){return E===null?P:1}let I=n;function he(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:f};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,He,!1),t.addEventListener(`webglcontextrestored`,We,!1),t.addEventListener(`webglcontextcreationerror`,Ge,!1),I===null){let t=`webgl2`;if(I=he(t,e),I===null)throw he(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let ge,_e,L,ve,R,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Le,Re,ze;function Be(){ge=new Ds(I),ge.init(),Le=new zl(I,ge),_e=new ns(I,ge,e,Le),L=new Ll(I,ge),_e.reversedDepthBuffer&&p&&L.buffers.depth.setReversed(!0),ve=new As(I),R=new xl,ye=new Rl(I,ge,L,R,_e,Le,ve),be=new is(S),xe=new Es(S),Se=new qo(I),Re=new es(I,Se),Ce=new Os(I,Se,ve,Re),we=new Ms(I,Ce,Se,ve),Me=new js(I,_e,ye),ke=new rs(R),Te=new bl(S,be,xe,ge,_e,Re,ke),Ee=new Kl(S,R),De=new Tl,Oe=new Ml(ge),je=new $o(S,be,xe,L,we,m,s),Ae=new Fl(S,we,_e),ze=new ql(I,ve,_e,L),Ne=new ts(I,ge,ve),Pe=new ks(I,ge,ve),ve.programs=Te.programs,S.capabilities=_e,S.extensions=ge,S.properties=R,S.renderLists=De,S.shadowMap=Ae,S.state=L,S.info=ve}Be();let Ve=new Ul(S,I);this.xr=Ve,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let e=ge.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=ge.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return P},this.setPixelRatio=function(e){e!==void 0&&(P=e,this.setSize(M,N,!1))},this.getSize=function(e){return e.set(M,N)},this.setSize=function(e,n,r=!0){if(Ve.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}M=e,N=n,t.width=Math.floor(e*P),t.height=Math.floor(n*P),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(M*P,N*P).floor()},this.setDrawingBufferSize=function(e,n,r){M=e,N=n,P=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(O)},this.getViewport=function(e){return e.copy(ie)},this.setViewport=function(e,t,n,r){e.isVector4?ie.set(e.x,e.y,e.z,e.w):ie.set(e,t,n,r),L.viewport(O.copy(ie).multiplyScalar(P).round())},this.getScissor=function(e){return e.copy(ae)},this.setScissor=function(e,t,n,r){e.isVector4?ae.set(e.x,e.y,e.z,e.w):ae.set(e,t,n,r),L.scissor(k.copy(ae).multiplyScalar(P).round())},this.getScissorTest=function(){return oe},this.setScissorTest=function(e){L.setScissorTest(oe=e)},this.setOpaqueSort=function(e){ne=e},this.setTransparentSort=function(e){re=e},this.getClearColor=function(e){return e.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor(...arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(E!==null){let t=E.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=E.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=je.getClearColor(),r=je.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(h[0]=i,h[1]=a,h[2]=o,h[3]=r,I.clearBufferuiv(I.COLOR,0,h)):(g[0]=i,g[1]=a,g[2]=o,g[3]=r,I.clearBufferiv(I.COLOR,0,g))}else r|=I.COLOR_BUFFER_BIT}t&&(r|=I.DEPTH_BUFFER_BIT),n&&(r|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,He,!1),t.removeEventListener(`webglcontextrestored`,We,!1),t.removeEventListener(`webglcontextcreationerror`,Ge,!1),je.dispose(),De.dispose(),Oe.dispose(),R.dispose(),be.dispose(),xe.dispose(),we.dispose(),Re.dispose(),ze.dispose(),Te.dispose(),Ve.dispose(),Ve.removeEventListener(`sessionstart`,Ze),Ve.removeEventListener(`sessionend`,Qe),$e.stop()};function He(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),C=!0}function We(){console.log(`THREE.WebGLRenderer: Context Restored.`),C=!1;let e=ve.autoReset,t=Ae.enabled,n=Ae.autoUpdate,r=Ae.needsUpdate,i=Ae.type;Be(),ve.autoReset=e,Ae.enabled=t,Ae.autoUpdate=n,Ae.needsUpdate=r,Ae.type=i}function Ge(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ke(e){let t=e.target;t.removeEventListener(`dispose`,Ke),qe(t)}function qe(e){Je(e),R.remove(e)}function Je(e){let t=R.get(e).programs;t!==void 0&&(t.forEach(function(e){Te.releaseProgram(e)}),e.isShaderMaterial&&Te.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=fe);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=ct(e,t,n,r,i);L.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ce.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Re.setup(i,r,s,n,c);let h,g=Ne;if(c!==null&&(h=Se.get(c),g=Pe,g.setIndex(h)),i.isMesh)r.wireframe===!0?(L.setLineWidth(r.wireframeLinewidth*me()),g.setMode(I.LINES)):g.setMode(I.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),L.setLineWidth(e*me()),i.isLineSegments?g.setMode(I.LINES):i.isLineLoop?g.setMode(I.LINE_LOOP):g.setMode(I.LINE_STRIP)}else i.isPoints?g.setMode(I.POINTS):i.isSprite&&g.setMode(I.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)Et(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(ge.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Se.get(c).bytesPerElement:1,o=R.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(I,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ye(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,at(e,t,n),e.side=0,e.needsUpdate=!0,at(e,t,n),e.side=2):at(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),y=Oe.get(n),y.init(t),x.push(y),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(y.pushLight(e),e.castShadow&&y.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(y.pushLight(e),e.castShadow&&y.pushShadow(e))}),y.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Ye(a,n,e),r.add(a)}else Ye(t,n,e),r.add(t)}}),y=x.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){R.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}ge.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let z=null;function Xe(e){z&&z(e)}function Ze(){$e.stop()}function Qe(){$e.start()}let $e=new Ko;$e.setAnimationLoop(Xe),typeof self<`u`&&$e.setContext(self),this.setAnimationLoop=function(e){z=e,Ve.setAnimationLoop(e),e===null?$e.stop():$e.start()},Ve.addEventListener(`sessionstart`,Ze),Ve.addEventListener(`sessionend`,Qe),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(C===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ve.enabled===!0&&Ve.isPresenting===!0&&(Ve.cameraAutoUpdate===!0&&Ve.updateCamera(t),t=Ve.getCamera()),e.isScene===!0&&e.onBeforeRender(S,e,t,E),y=Oe.get(e,x.length),y.init(t),x.push(y),le.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),se.setFromProjectionMatrix(le,Ue,t.reversedDepth),F=this.localClippingEnabled,ce=ke.init(this.clippingPlanes,F),v=De.get(e,b.length),v.init(),b.push(v),Ve.enabled===!0&&Ve.isPresenting===!0){let e=S.xr.getDepthSensingMesh();e!==null&&et(e,t,-1/0,S.sortObjects)}et(e,t,0,S.sortObjects),v.finish(),S.sortObjects===!0&&v.sort(ne,re),pe=Ve.enabled===!1||Ve.isPresenting===!1||Ve.hasDepthSensing()===!1,pe&&je.addToRenderList(v,e),this.info.render.frame++,ce===!0&&ke.beginShadows();let n=y.state.shadowsArray;Ae.render(n,e,t),ce===!0&&ke.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=v.opaque,i=v.transmissive;if(y.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];nt(r,i,e,a)}pe&&je.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];tt(v,e,r,r.viewport)}}else i.length>0&&nt(r,i,e,t),pe&&je.render(e),tt(v,e,t);E!==null&&T===0&&(ye.updateMultisampleRenderTarget(E),ye.updateRenderTargetMipmap(E)),e.isScene===!0&&e.onAfterRender(S,e,t),Re.resetDefaultState(),D=-1,ee=null,x.pop(),x.length>0?(y=x[x.length-1],ce===!0&&ke.setGlobalState(S.clippingPlanes,y.state.camera)):y=null,b.pop(),v=b.length>0?b[b.length-1]:null};function et(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)y.pushLight(e),e.castShadow&&y.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||se.intersectsSprite(e)){r&&de.setFromMatrixPosition(e.matrixWorld).applyMatrix4(le);let t=we.update(e),i=e.material;i.visible&&v.push(e,t,i,n,de.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||se.intersectsObject(e))){let t=we.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),de.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),de.copy(e.boundingSphere.center)),de.applyMatrix4(e.matrixWorld).applyMatrix4(le)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&v.push(e,t,s,n,de.z,o)}}else i.visible&&v.push(e,t,i,n,de.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)et(i[e],t,n,r)}function tt(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;y.setupLightsView(n),ce===!0&&ke.setGlobalState(S.clippingPlanes,n),r&&L.viewport(O.copy(r)),i.length>0&&rt(i,t,n),a.length>0&&rt(a,t,n),o.length>0&&rt(o,t,n),L.buffers.depth.setTest(!0),L.buffers.depth.setMask(!0),L.buffers.color.setMask(!0),L.setPolygonOffset(!1)}function nt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;y.state.transmissionRenderTarget[r.id]===void 0&&(y.state.transmissionRenderTarget[r.id]=new Wt(1,1,{generateMipmaps:!0,type:ge.has(`EXT_color_buffer_half_float`)||ge.has(`EXT_color_buffer_float`)?_:u,minFilter:l,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:jt.workingColorSpace}));let a=y.state.transmissionRenderTarget[r.id],o=r.viewport||O;a.setSize(o.z*S.transmissionResolutionScale,o.w*S.transmissionResolutionScale);let s=S.getRenderTarget(),c=S.getActiveCubeFace(),d=S.getActiveMipmapLevel();S.setRenderTarget(a),S.getClearColor(te),j=S.getClearAlpha(),j<1&&S.setClearColor(16777215,.5),S.clear(),pe&&je.render(n);let f=S.toneMapping;S.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),y.setupLightsView(r),ce===!0&&ke.setGlobalState(S.clippingPlanes,r),rt(e,n,r),ye.updateMultisampleRenderTarget(a),ye.updateRenderTargetMipmap(a),ge.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,it(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(ye.updateMultisampleRenderTarget(a),ye.updateRenderTargetMipmap(a))}S.setRenderTarget(s,c,d),S.setClearColor(te,j),p!==void 0&&(r.viewport=p),S.toneMapping=f}function rt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&it(o,t,n,s,l,c)}}function it(e,t,n,r,i,a){e.onBeforeRender(S,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(S,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,S.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,S.renderBufferDirect(n,t,r,i,e,a),i.side=2):S.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(S,t,n,r,i,a)}function at(e,t,n){t.isScene!==!0&&(t=fe);let r=R.get(e),i=y.state.lights,a=y.state.shadowsArray,o=i.state.version,s=Te.getParameters(e,i.state,a,t,n),c=Te.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?xe:be).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ke),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return st(e,s),u}else s.uniforms=Te.getUniforms(e),e.onBeforeCompile(s,S),u=Te.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=ke.uniform),st(e,s),r.needsLights=ut(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function ot(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=zc.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function st(e,t){let n=R.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function ct(e,t,n,r,i){t.isScene!==!0&&(t=fe),ye.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=E===null?S.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:Ie,c=(r.isMeshStandardMaterial?xe:be).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(m=S.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,g=h===void 0?0:h.length,_=R.get(r),v=y.state.lights;if(ce===!0&&(F===!0||e!==ee)){let t=e===ee&&r.id===D;ke.setState(r,e,t)}let b=!1;r.version===_.__version?_.needsLights&&_.lightsStateVersion!==v.state.version?b=!0:_.outputColorSpace===s?i.isBatchedMesh&&_.batching===!1||!i.isBatchedMesh&&_.batching===!0||i.isBatchedMesh&&_.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&_.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&_.instancing===!1||!i.isInstancedMesh&&_.instancing===!0||i.isSkinnedMesh&&_.skinning===!1||!i.isSkinnedMesh&&_.skinning===!0||i.isInstancedMesh&&_.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&_.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&_.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&_.instancingMorph===!1&&i.morphTexture!==null?b=!0:_.envMap===c?r.fog===!0&&_.fog!==a||_.numClippingPlanes!==void 0&&(_.numClippingPlanes!==ke.numPlanes||_.numIntersection!==ke.numIntersection)?b=!0:_.vertexAlphas===l&&_.vertexTangents===u&&_.morphTargets===d&&_.morphNormals===f&&_.morphColors===p&&_.toneMapping===m?_.morphTargetsCount!==g&&(b=!0):b=!0:b=!0:b=!0:(b=!0,_.__version=r.version);let x=_.currentProgram;b===!0&&(x=at(r,t,i));let C=!1,w=!1,T=!1,O=x.getUniforms(),k=_.uniforms;if(L.useProgram(x.program)&&(C=!0,w=!0,T=!0),r.id!==D&&(D=r.id,w=!0),C||ee!==e){L.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(I,`projectionMatrix`,e.projectionMatrix),O.setValue(I,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(I,ue.setFromMatrixPosition(e.matrixWorld)),_e.logarithmicDepthBuffer&&O.setValue(I,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(I,`isOrthographic`,e.isOrthographicCamera===!0),ee!==e&&(ee=e,w=!0,T=!0)}if(i.isSkinnedMesh){O.setOptional(I,i,`bindMatrix`),O.setOptional(I,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(I,`boneTexture`,e.boneTexture,ye))}i.isBatchedMesh&&(O.setOptional(I,i,`batchingTexture`),O.setValue(I,`batchingTexture`,i._matricesTexture,ye),O.setOptional(I,i,`batchingIdTexture`),O.setValue(I,`batchingIdTexture`,i._indirectTexture,ye),O.setOptional(I,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(I,`batchingColorTexture`,i._colorsTexture,ye));let A=n.morphAttributes;if((A.position!==void 0||A.normal!==void 0||A.color!==void 0)&&Me.update(i,n,x),(w||_.receiveShadow!==i.receiveShadow)&&(_.receiveShadow=i.receiveShadow,O.setValue(I,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(k.envMap.value=c,k.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),w&&(O.setValue(I,`toneMappingExposure`,S.toneMappingExposure),_.needsLights&&lt(k,T),a&&r.fog===!0&&Ee.refreshFogUniforms(k,a),Ee.refreshMaterialUniforms(k,r,P,N,y.state.transmissionRenderTarget[e.id]),zc.upload(I,ot(_),k,ye)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(zc.upload(I,ot(_),k,ye),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(I,`center`,i.center),O.setValue(I,`modelViewMatrix`,i.modelViewMatrix),O.setValue(I,`normalMatrix`,i.normalMatrix),O.setValue(I,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];ze.update(n,x),ze.bind(n,x)}}return x}function lt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function ut(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(e,t,n){let r=R.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),R.get(e.texture).__webglTexture=t,R.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=R.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let dt=I.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){E=e,w=t,T=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=R.get(e);if(s.__useDefaultFramebuffer!==void 0)L.bindFramebuffer(I.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)ye.setupRenderTarget(e);else if(s.__hasExternalTextures)ye.rebindTextures(e,R.get(e.texture).__webglTexture,R.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&R.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);ye.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=R.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&ye.useMultisampledRTT(e)===!1?R.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,O.copy(e.viewport),k.copy(e.scissor),A=e.scissorTest}else O.copy(ie).multiplyScalar(P).floor(),k.copy(ae).multiplyScalar(P).floor(),A=oe;if(n!==0&&(i=dt),L.bindFramebuffer(I.FRAMEBUFFER,i)&&r&&L.drawBuffers(e,i),L.viewport(O),L.scissor(k),L.setScissorTest(A),a){let r=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=R.get(e.textures[t]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,t.__webglTexture,n)}D=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){L.bindFramebuffer(I.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!_e.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!_e.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s),I.readPixels(t,n,r,i,Le.convert(c),Le.convert(l),a))}finally{let e=E===null?null:R.get(E).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){L.bindFramebuffer(I.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!_e.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!_e.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,d),I.bufferData(I.PIXEL_PACK_BUFFER,a.byteLength,I.STREAM_READ),e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s),I.readPixels(t,n,r,i,Le.convert(l),Le.convert(u),0);let f=E===null?null:R.get(E).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,f);let p=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Dt(I,p,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,d),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,a),I.deleteBuffer(d),I.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;ye.setTexture2D(e,0),I.copyTexSubImage2D(I.TEXTURE_2D,n,0,0,o,s,i,a),L.unbindTexture()};let ft=I.createFramebuffer(),pt=I.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(Et(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Le.convert(t.format),_=Le.convert(t.type),v;t.isData3DTexture?(ye.setTexture3D(t,0),v=I.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(ye.setTexture2DArray(t,0),v=I.TEXTURE_2D_ARRAY):(ye.setTexture2D(t,0),v=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,t.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,t.unpackAlignment);let y=I.getParameter(I.UNPACK_ROW_LENGTH),b=I.getParameter(I.UNPACK_IMAGE_HEIGHT),x=I.getParameter(I.UNPACK_SKIP_PIXELS),S=I.getParameter(I.UNPACK_SKIP_ROWS),C=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,h.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,h.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,l),I.pixelStorei(I.UNPACK_SKIP_ROWS,u),I.pixelStorei(I.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=R.get(e),r=R.get(t),h=R.get(n.__renderTarget),g=R.get(r.__renderTarget);L.bindFramebuffer(I.READ_FRAMEBUFFER,h.__webglFramebuffer),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(e).__webglTexture,i,d+n),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(t).__webglTexture,a,m+n)),I.blitFramebuffer(l,u,o,s,f,p,o,s,I.DEPTH_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||R.has(e)){let n=R.get(e),r=R.get(t);L.bindFramebuffer(I.READ_FRAMEBUFFER,ft),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,pt);for(let e=0;e<c;e++)w?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,n.__webglTexture,i),T?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,r.__webglTexture,a),i===0?T?I.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):I.copyTexSubImage2D(v,a,f,p,l,u,o,s):I.blitFramebuffer(l,u,o,s,f,p,o,s,I.COLOR_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?I.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h);I.pixelStorei(I.UNPACK_ROW_LENGTH,y),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,b),I.pixelStorei(I.UNPACK_SKIP_PIXELS,x),I.pixelStorei(I.UNPACK_SKIP_ROWS,S),I.pixelStorei(I.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&I.generateMipmap(v),L.unbindTexture()},this.initRenderTarget=function(e){R.get(e).__webglFramebuffer===void 0&&ye.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?ye.setTextureCube(e,0):e.isData3DTexture?ye.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?ye.setTexture2DArray(e,0):ye.setTexture2D(e,0),L.unbindTexture()},this.resetState=function(){w=0,T=0,E=null,L.reset(),Re.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Ue}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=jt._getDrawingBufferColorSpace(e),t.unpackColorSpace=jt._getUnpackColorSpace()}};function Yl(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Fr,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Xl(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Xl(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}return c}function Xl(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new wr(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function Zl(e,t){if(t===0)return console.warn(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.`),e;if(t===2||t===1){let n=e.getIndex();if(n===null){let t=[],r=e.getAttribute(`position`);if(r!==void 0){for(let e=0;e<r.count;e++)t.push(e);e.setIndex(t),n=e.getIndex()}else return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.`),e}let r=n.count-2,i=[];if(t===2)for(let e=1;e<=r;e++)i.push(n.getX(0)),i.push(n.getX(e)),i.push(n.getX(e+1));else for(let e=0;e<r;e++)e%2==0?(i.push(n.getX(e)),i.push(n.getX(e+1)),i.push(n.getX(e+2))):(i.push(n.getX(e+2)),i.push(n.getX(e+1)),i.push(n.getX(e)));i.length/3!==r&&console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.`);let a=e.clone();return a.setIndex(i),a.clearGroups(),a}return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:`,t),e}var Ql=class extends to{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new iu(e)}),this.register(function(e){return new au(e)}),this.register(function(e){return new mu(e)}),this.register(function(e){return new hu(e)}),this.register(function(e){return new gu(e)}),this.register(function(e){return new su(e)}),this.register(function(e){return new cu(e)}),this.register(function(e){return new lu(e)}),this.register(function(e){return new uu(e)}),this.register(function(e){return new ru(e)}),this.register(function(e){return new du(e)}),this.register(function(e){return new ou(e)}),this.register(function(e){return new pu(e)}),this.register(function(e){return new fu(e)}),this.register(function(e){return new tu(e)}),this.register(function(e){return new _u(e)}),this.register(function(e){return new vu(e)})}load(e,t,n,r){let i=this,a;if(this.resourcePath!==``)a=this.resourcePath;else if(this.path!==``){let t=wo.extractUrlBase(e);a=wo.resolveURL(t,this.path)}else a=wo.extractUrlBase(e);this.manager.itemStart(e);let o=function(t){r?r(t):console.error(t),i.manager.itemError(e),i.manager.itemEnd(e)},s=new io(this.manager);s.setPath(this.path),s.setResponseType(`arraybuffer`),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,function(n){try{i.parse(n,a,function(n){t(n),i.manager.itemEnd(e)},o)}catch(e){o(e)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let i,a={},o={},s=new TextDecoder;if(typeof e==`string`)i=JSON.parse(e);else if(e instanceof ArrayBuffer){if(s.decode(new Uint8Array(e,0,4))===yu){try{a[eu.KHR_BINARY_GLTF]=new Su(e)}catch(e){r&&r(e);return}i=JSON.parse(a[eu.KHR_BINARY_GLTF].content)}else i=JSON.parse(s.decode(e))}else i=e;if(i.asset===void 0||i.asset.version[0]<2){r&&r(Error(`THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.`));return}let c=new Ju(i,{path:t||this.resourcePath||``,crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let e=0;e<this.pluginCallbacks.length;e++){let t=this.pluginCallbacks[e](c);t.name||console.error(`THREE.GLTFLoader: Invalid plugin found: missing name`),o[t.name]=t,a[t.name]=!0}if(i.extensionsUsed)for(let e=0;e<i.extensionsUsed.length;++e){let t=i.extensionsUsed[e],n=i.extensionsRequired||[];switch(t){case eu.KHR_MATERIALS_UNLIT:a[t]=new nu;break;case eu.KHR_DRACO_MESH_COMPRESSION:a[t]=new Cu(i,this.dracoLoader);break;case eu.KHR_TEXTURE_TRANSFORM:a[t]=new wu;break;case eu.KHR_MESH_QUANTIZATION:a[t]=new Tu;break;default:n.indexOf(t)>=0&&o[t]===void 0&&console.warn(`THREE.GLTFLoader: Unknown extension "`+t+`".`)}}c.setExtensions(a),c.setPlugins(o),c.parse(n,r)}parseAsync(e,t){let n=this;return new Promise(function(r,i){n.parse(e,t,r,i)})}};function $l(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}var eu={KHR_BINARY_GLTF:`KHR_binary_glTF`,KHR_DRACO_MESH_COMPRESSION:`KHR_draco_mesh_compression`,KHR_LIGHTS_PUNCTUAL:`KHR_lights_punctual`,KHR_MATERIALS_CLEARCOAT:`KHR_materials_clearcoat`,KHR_MATERIALS_DISPERSION:`KHR_materials_dispersion`,KHR_MATERIALS_IOR:`KHR_materials_ior`,KHR_MATERIALS_SHEEN:`KHR_materials_sheen`,KHR_MATERIALS_SPECULAR:`KHR_materials_specular`,KHR_MATERIALS_TRANSMISSION:`KHR_materials_transmission`,KHR_MATERIALS_IRIDESCENCE:`KHR_materials_iridescence`,KHR_MATERIALS_ANISOTROPY:`KHR_materials_anisotropy`,KHR_MATERIALS_UNLIT:`KHR_materials_unlit`,KHR_MATERIALS_VOLUME:`KHR_materials_volume`,KHR_TEXTURE_BASISU:`KHR_texture_basisu`,KHR_TEXTURE_TRANSFORM:`KHR_texture_transform`,KHR_MESH_QUANTIZATION:`KHR_mesh_quantization`,KHR_MATERIALS_EMISSIVE_STRENGTH:`KHR_materials_emissive_strength`,EXT_MATERIALS_BUMP:`EXT_materials_bump`,EXT_TEXTURE_WEBP:`EXT_texture_webp`,EXT_TEXTURE_AVIF:`EXT_texture_avif`,EXT_MESHOPT_COMPRESSION:`EXT_meshopt_compression`,EXT_MESH_GPU_INSTANCING:`EXT_mesh_gpu_instancing`},tu=class{constructor(e){this.parser=e,this.name=eu.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n=`light:`+e,r=t.cache.get(n);if(r)return r;let i=t.json,a=((i.extensions&&i.extensions[this.name]||{}).lights||[])[e],o,s=new U(16777215);a.color!==void 0&&s.setRGB(a.color[0],a.color[1],a.color[2],Ie);let c=a.range===void 0?0:a.range;switch(a.type){case`directional`:o=new Co(s),o.target.position.set(0,0,-1),o.add(o.target);break;case`point`:o=new bo(s),o.distance=c;break;case`spot`:o=new ho(s),o.distance=c,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle===void 0?0:a.spot.innerConeAngle,a.spot.outerConeAngle=a.spot.outerConeAngle===void 0?Math.PI/4:a.spot.outerConeAngle,o.angle=a.spot.outerConeAngle,o.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,o.target.position.set(0,0,-1),o.add(o.target);break;default:throw Error(`THREE.GLTFLoader: Unexpected light type: `+a.type)}return o.position.set(0,0,0),Bu(o,a),a.intensity!==void 0&&(o.intensity=a.intensity),o.name=t.createUniqueName(a.name||`light_`+e),r=Promise.resolve(o),t.cache.add(n,r),r}getDependency(e,t){if(e===`light`)return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],i=(r.extensions&&r.extensions[this.name]||{}).light;return i===void 0?null:this._loadLight(i).then(function(e){return n._getNodeRef(t.cache,i,e)})}},nu=class{constructor(){this.name=eu.KHR_MATERIALS_UNLIT}getMaterialType(){return hr}extendParams(e,t,n){let r=[];e.color=new U(1,1,1),e.opacity=1;let i=t.pbrMetallicRoughness;if(i){if(Array.isArray(i.baseColorFactor)){let t=i.baseColorFactor;e.color.setRGB(t[0],t[1],t[2],Ie),e.opacity=t[3]}i.baseColorTexture!==void 0&&r.push(n.assignTexture(e,`map`,i.baseColorTexture,Fe))}return Promise.all(r)}},ru=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},iu=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&i.push(n.assignTexture(t,`clearcoatMap`,a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&i.push(n.assignTexture(t,`clearcoatRoughnessMap`,a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(i.push(n.assignTexture(t,`clearcoatNormalMap`,a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){let e=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new B(e,e)}return Promise.all(i)}},au=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_DISPERSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name];return t.dispersion=r.dispersion===void 0?0:r.dispersion,Promise.resolve()}},ou=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&i.push(n.assignTexture(t,`iridescenceMap`,a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&i.push(n.assignTexture(t,`iridescenceThicknessMap`,a.iridescenceThicknessTexture)),Promise.all(i)}},su=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_SHEEN}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[];t.sheenColor=new U(0,0,0),t.sheenRoughness=0,t.sheen=1;let a=r.extensions[this.name];if(a.sheenColorFactor!==void 0){let e=a.sheenColorFactor;t.sheenColor.setRGB(e[0],e[1],e[2],Ie)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&i.push(n.assignTexture(t,`sheenColorMap`,a.sheenColorTexture,Fe)),a.sheenRoughnessTexture!==void 0&&i.push(n.assignTexture(t,`sheenRoughnessMap`,a.sheenRoughnessTexture)),Promise.all(i)}},cu=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&i.push(n.assignTexture(t,`transmissionMap`,a.transmissionTexture)),Promise.all(i)}},lu=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_VOLUME}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];t.thickness=a.thicknessFactor===void 0?0:a.thicknessFactor,a.thicknessTexture!==void 0&&i.push(n.assignTexture(t,`thicknessMap`,a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;let o=a.attenuationColor||[1,1,1];return t.attenuationColor=new U().setRGB(o[0],o[1],o[2],Ie),Promise.all(i)}},uu=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_IOR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name];return t.ior=r.ior===void 0?1.5:r.ior,Promise.resolve()}},du=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_SPECULAR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];t.specularIntensity=a.specularFactor===void 0?1:a.specularFactor,a.specularTexture!==void 0&&i.push(n.assignTexture(t,`specularIntensityMap`,a.specularTexture));let o=a.specularColorFactor||[1,1,1];return t.specularColor=new U().setRGB(o[0],o[1],o[2],Ie),a.specularColorTexture!==void 0&&i.push(n.assignTexture(t,`specularColorMap`,a.specularColorTexture,Fe)),Promise.all(i)}},fu=class{constructor(e){this.parser=e,this.name=eu.EXT_MATERIALS_BUMP}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return t.bumpScale=a.bumpFactor===void 0?1:a.bumpFactor,a.bumpTexture!==void 0&&i.push(n.assignTexture(t,`bumpMap`,a.bumpTexture)),Promise.all(i)}},pu=class{constructor(e){this.parser=e,this.name=eu.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Aa}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&i.push(n.assignTexture(t,`anisotropyMap`,a.anisotropyTexture)),Promise.all(i)}},mu=class{constructor(e){this.parser=e,this.name=eu.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let i=r.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures`);return null}return t.loadTextureImage(e,i.source,a)}},hu=class{constructor(e){this.parser=e,this.name=eu.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},gu=class{constructor(e){this.parser=e,this.name=eu.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},_u=class{constructor(e){this.name=eu.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let e=n.extensions[this.name],r=this.parser.getDependency(`buffer`,e.buffer),i=this.parser.options.meshoptDecoder;if(!i||!i.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files`);return null}return r.then(function(t){let n=e.byteOffset||0,r=e.byteLength||0,a=e.count,o=e.byteStride,s=new Uint8Array(t,n,r);return i.decodeGltfBufferAsync?i.decodeGltfBufferAsync(a,o,s,e.mode,e.filter).then(function(e){return e.buffer}):i.ready.then(function(){let t=new ArrayBuffer(a*o);return i.decodeGltfBuffer(new Uint8Array(t),a,o,s,e.mode,e.filter),t})})}return null}},vu=class{constructor(e){this.name=eu.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let r=t.meshes[n.mesh];for(let e of r.primitives)if(e.mode!==ku.TRIANGLES&&e.mode!==ku.TRIANGLE_STRIP&&e.mode!==ku.TRIANGLE_FAN&&e.mode!==void 0)return null;let i=n.extensions[this.name].attributes,a=[],o={};for(let e in i)a.push(this.parser.getDependency(`accessor`,i[e]).then(t=>(o[e]=t,o[e])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(e=>{let t=e.pop(),n=t.isGroup?t.children:[t],r=e[0].count,i=[];for(let e of n){let t=new H,n=new V,a=new _t,s=new V(1,1,1),c=new Gi(e.geometry,e.material,r);for(let e=0;e<r;e++)o.TRANSLATION&&n.fromBufferAttribute(o.TRANSLATION,e),o.ROTATION&&a.fromBufferAttribute(o.ROTATION,e),o.SCALE&&s.fromBufferAttribute(o.SCALE,e),c.setMatrixAt(e,t.compose(n,a,s));for(let t in o)if(t===`_COLOR_0`){let e=o[t];c.instanceColor=new Li(e.array,e.itemSize,e.normalized)}else t!==`TRANSLATION`&&t!==`ROTATION`&&t!==`SCALE`&&e.geometry.setAttribute(t,o[t]);qn.prototype.copy.call(c,e),this.parser.assignFinalMaterial(c),i.push(c)}return t.isGroup?(t.clear(),t.add(...i),t):i[0]}))}},yu=`glTF`,bu=12,xu={JSON:1313821514,BIN:5130562},Su=class{constructor(e){this.name=eu.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,bu),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==yu)throw Error(`THREE.GLTFLoader: Unsupported glTF-Binary header.`);if(this.header.version<2)throw Error(`THREE.GLTFLoader: Legacy binary file detected.`);let r=this.header.length-bu,i=new DataView(e,bu),a=0;for(;a<r;){let t=i.getUint32(a,!0);a+=4;let r=i.getUint32(a,!0);if(a+=4,r===xu.JSON){let r=new Uint8Array(e,bu+a,t);this.content=n.decode(r)}else if(r===xu.BIN){let n=bu+a;this.body=e.slice(n,n+t)}a+=t}if(this.content===null)throw Error(`THREE.GLTFLoader: JSON content not found.`)}},Cu=class{constructor(e,t){if(!t)throw Error(`THREE.GLTFLoader: No DRACOLoader instance provided.`);this.name=eu.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,r=this.dracoLoader,i=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},s={},c={};for(let e in a){let t=Pu[e]||e.toLowerCase();o[t]=a[e]}for(let t in e.attributes){let r=Pu[t]||t.toLowerCase();if(a[t]!==void 0){let i=n.accessors[e.attributes[t]];c[r]=Au[i.componentType].name,s[r]=i.normalized===!0}}return t.getDependency(`bufferView`,i).then(function(e){return new Promise(function(t,n){r.decodeDracoFile(e,function(e){for(let t in e.attributes){let n=e.attributes[t],r=s[t];r!==void 0&&(n.normalized=r)}t(e)},o,c,Ie,n)})})}},wu=class{constructor(){this.name=eu.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0?e:(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0,e)}},Tu=class{constructor(){this.name=eu.KHR_MESH_QUANTIZATION}},Eu=class extends Ra{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r*3+r;for(let e=0;e!==r;e++)t[e]=n[i+e];return t}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=o*2,c=o*3,l=r-t,u=(n-t)/l,d=u*u,f=d*u,p=e*c,m=p-c,h=-2*f+3*d,g=f-d,_=1-h,v=g-d+u;for(let e=0;e!==o;e++){let t=a[m+e+o],n=a[m+e+s]*l,r=a[p+e+o],c=a[p+e]*l;i[e]=_*t+v*n+h*r+g*c}return i}},Du=new _t,Ou=class extends Eu{interpolate_(e,t,n,r){let i=super.interpolate_(e,t,n,r);return Du.fromArray(i).normalize().toArray(i),i}},ku={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Au={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},ju={9728:i,9729:s,9984:a,9985:c,9986:o,9987:l},Mu={33071:n,33648:r,10497:t},Nu={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Pu={POSITION:`position`,NORMAL:`normal`,TANGENT:`tangent`,TEXCOORD_0:`uv`,TEXCOORD_1:`uv1`,TEXCOORD_2:`uv2`,TEXCOORD_3:`uv3`,COLOR_0:`color`,WEIGHTS_0:`skinWeight`,JOINTS_0:`skinIndex`},Fu={scale:`scale`,translation:`position`,rotation:`quaternion`,weights:`morphTargetInfluences`},Iu={CUBICSPLINE:void 0,LINEAR:De,STEP:Ee},Lu={OPAQUE:`OPAQUE`,MASK:`MASK`,BLEND:`BLEND`};function Ru(e){return e.DefaultMaterial===void 0&&(e.DefaultMaterial=new ka({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:0})),e.DefaultMaterial}function zu(e,t,n){for(let r in n.extensions)e[r]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[r]=n.extensions[r])}function Bu(e,t){t.extras!==void 0&&(typeof t.extras==`object`?Object.assign(e.userData,t.extras):console.warn(`THREE.GLTFLoader: Ignoring primitive type .extras, `+t.extras))}function Vu(e,t,n){let r=!1,i=!1,a=!1;for(let e=0,n=t.length;e<n;e++){let n=t[e];if(n.POSITION!==void 0&&(r=!0),n.NORMAL!==void 0&&(i=!0),n.COLOR_0!==void 0&&(a=!0),r&&i&&a)break}if(!r&&!i&&!a)return Promise.resolve(e);let o=[],s=[],c=[];for(let l=0,u=t.length;l<u;l++){let u=t[l];if(r){let t=u.POSITION===void 0?e.attributes.position:n.getDependency(`accessor`,u.POSITION);o.push(t)}if(i){let t=u.NORMAL===void 0?e.attributes.normal:n.getDependency(`accessor`,u.NORMAL);s.push(t)}if(a){let t=u.COLOR_0===void 0?e.attributes.color:n.getDependency(`accessor`,u.COLOR_0);c.push(t)}}return Promise.all([Promise.all(o),Promise.all(s),Promise.all(c)]).then(function(t){let n=t[0],o=t[1],s=t[2];return r&&(e.morphAttributes.position=n),i&&(e.morphAttributes.normal=o),a&&(e.morphAttributes.color=s),e.morphTargetsRelative=!0,e})}function Hu(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,r=t.weights.length;n<r;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let t=0,r=n.length;t<r;t++)e.morphTargetDictionary[n[t]]=t}else console.warn(`THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.`)}}function Uu(e){let t,n=e.extensions&&e.extensions[eu.KHR_DRACO_MESH_COMPRESSION];if(t=n?`draco:`+n.bufferView+`:`+n.indices+`:`+Wu(n.attributes):e.indices+`:`+Wu(e.attributes)+`:`+e.mode,e.targets!==void 0)for(let n=0,r=e.targets.length;n<r;n++)t+=`:`+Wu(e.targets[n]);return t}function Wu(e){let t=``,n=Object.keys(e).sort();for(let r=0,i=n.length;r<i;r++)t+=n[r]+`:`+e[n[r]]+`;`;return t}function Gu(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw Error(`THREE.GLTFLoader: Unsupported normalized accessor component type.`)}}function Ku(e){return e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0?`image/jpeg`:e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0?`image/webp`:e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0?`image/ktx2`:`image/png`}var qu=new H,Ju=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new $l,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,i=!1,a=-1;if(typeof navigator<`u`){let e=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(e)===!0;let t=e.match(/Version\/(\d+)/);r=n&&t?parseInt(t[1],10):-1,i=e.indexOf(`Firefox`)>-1,a=i?e.match(/Firefox\/([0-9]+)\./)[1]:-1}this.textureLoader=typeof createImageBitmap>`u`||n&&r<17||i&&a<98?new so(this.options.manager):new Eo(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new io(this.options.manager),this.fileLoader.setResponseType(`arraybuffer`),this.options.crossOrigin===`use-credentials`&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,r=this.json,i=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(e){return e._markDefs&&e._markDefs()}),Promise.all(this._invokeAll(function(e){return e.beforeRoot&&e.beforeRoot()})).then(function(){return Promise.all([n.getDependencies(`scene`),n.getDependencies(`animation`),n.getDependencies(`camera`)])}).then(function(t){let a={scene:t[0][r.scene||0],scenes:t[0],animations:t[1],cameras:t[2],asset:r.asset,parser:n,userData:{}};return zu(i,a,r),Bu(a,r),Promise.all(n._invokeAll(function(e){return e.afterRoot&&e.afterRoot(a)})).then(function(){for(let e of a.scenes)e.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n].joints;for(let t=0,n=r.length;t<n;t++)e[r[t]].isBone=!0}for(let t=0,r=e.length;t<r;t++){let r=e[t];r.mesh!==void 0&&(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0&&(n[r.mesh].isSkinnedMesh=!0)),r.camera!==void 0&&this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let r=n.clone(),i=(e,t)=>{let n=this.associations.get(e);n!=null&&this.associations.set(t,n);for(let[n,r]of e.children.entries())i(r,t.children[n])};return i(n,r),r.name+=`_instance_`+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let r=e(t[n]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let r=0;r<t.length;r++){let i=e(t[r]);i&&n.push(i)}return n}getDependency(e,t){let n=e+`:`+t,r=this.cache.get(n);if(!r){switch(e){case`scene`:r=this.loadScene(t);break;case`node`:r=this._invokeOne(function(e){return e.loadNode&&e.loadNode(t)});break;case`mesh`:r=this._invokeOne(function(e){return e.loadMesh&&e.loadMesh(t)});break;case`accessor`:r=this.loadAccessor(t);break;case`bufferView`:r=this._invokeOne(function(e){return e.loadBufferView&&e.loadBufferView(t)});break;case`buffer`:r=this.loadBuffer(t);break;case`material`:r=this._invokeOne(function(e){return e.loadMaterial&&e.loadMaterial(t)});break;case`texture`:r=this._invokeOne(function(e){return e.loadTexture&&e.loadTexture(t)});break;case`skin`:r=this.loadSkin(t);break;case`animation`:r=this._invokeOne(function(e){return e.loadAnimation&&e.loadAnimation(t)});break;case`camera`:r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(n){return n!=this&&n.getDependency&&n.getDependency(e,t)}),!r)throw Error(`Unknown type: `+e)}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,r=this.json[e+(e===`mesh`?`es`:`s`)]||[];t=Promise.all(r.map(function(t,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!==`arraybuffer`)throw Error(`THREE.GLTFLoader: `+t.type+` buffer type is not supported.`);if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[eu.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(e,i){n.load(wo.resolveURL(t.uri,r.path),e,void 0,function(){i(Error(`THREE.GLTFLoader: Failed to load buffer "`+t.uri+`".`))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency(`buffer`,t.buffer).then(function(e){let n=t.byteLength||0,r=t.byteOffset||0;return e.slice(r,r+n)})}loadAccessor(e){let t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let e=Nu[r.type],t=Au[r.componentType],n=r.normalized===!0,i=new t(r.count*e);return Promise.resolve(new wr(i,e,n))}let i=[];return r.bufferView===void 0?i.push(null):i.push(this.getDependency(`bufferView`,r.bufferView)),r.sparse!==void 0&&(i.push(this.getDependency(`bufferView`,r.sparse.indices.bufferView)),i.push(this.getDependency(`bufferView`,r.sparse.values.bufferView))),Promise.all(i).then(function(e){let i=e[0],a=Nu[r.type],o=Au[r.componentType],s=o.BYTES_PER_ELEMENT,c=s*a,l=r.byteOffset||0,u=r.bufferView===void 0?void 0:n.bufferViews[r.bufferView].byteStride,d=r.normalized===!0,f,p;if(u&&u!==c){let e=Math.floor(l/u),n=`InterleavedBuffer:`+r.bufferView+`:`+r.componentType+`:`+e+`:`+r.count,c=t.cache.get(n);c||(f=new o(i,e*u,r.count*u/s),c=new yi(f,u/s),t.cache.add(n,c)),p=new xi(c,a,l%u/s,d)}else f=i===null?new o(r.count*a):new o(i,l,r.count*a),p=new wr(f,a,d);if(r.sparse!==void 0){let t=Nu.SCALAR,n=Au[r.sparse.indices.componentType],s=r.sparse.indices.byteOffset||0,c=r.sparse.values.byteOffset||0,l=new n(e[1],s,r.sparse.count*t),u=new o(e[2],c,r.sparse.count*a);i!==null&&(p=new wr(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let e=0,t=l.length;e<t;e++){let t=l[e];if(p.setX(t,u[e*a]),a>=2&&p.setY(t,u[e*a+1]),a>=3&&p.setZ(t,u[e*a+2]),a>=4&&p.setW(t,u[e*a+3]),a>=5)throw Error(`THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.`)}p.normalized=d}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,i=t.images[r],a=this.textureLoader;if(i.uri){let e=n.manager.getHandler(i.uri);e!==null&&(a=e)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let r=this,i=this.json,a=i.textures[e],o=i.images[t],s=(o.uri||o.bufferView)+`:`+a.sampler;if(this.textureCache[s])return this.textureCache[s];let c=this.loadImageSource(t,n).then(function(t){t.flipY=!1,t.name=a.name||o.name||``,t.name===``&&typeof o.uri==`string`&&o.uri.startsWith(`data:image/`)===!1&&(t.name=o.uri);let n=(i.samplers||{})[a.sampler]||{};return t.magFilter=ju[n.magFilter]||1006,t.minFilter=ju[n.minFilter]||1008,t.wrapS=Mu[n.wrapS]||1e3,t.wrapT=Mu[n.wrapT]||1e3,t.generateMipmaps=!t.isCompressedTexture&&t.minFilter!==1003&&t.minFilter!==1006,r.associations.set(t,{textures:e}),t}).catch(function(){return null});return this.textureCache[s]=c,c}loadImageSource(e,t){let n=this,r=this.json,i=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(e=>e.clone());let a=r.images[e],o=self.URL||self.webkitURL,s=a.uri||``,c=!1;if(a.bufferView!==void 0)s=n.getDependency(`bufferView`,a.bufferView).then(function(e){c=!0;let t=new Blob([e],{type:a.mimeType});return s=o.createObjectURL(t),s});else if(a.uri===void 0)throw Error(`THREE.GLTFLoader: Image `+e+` is missing URI and bufferView`);let l=Promise.resolve(s).then(function(e){return new Promise(function(n,r){let a=n;t.isImageBitmapLoader===!0&&(a=function(e){let t=new Vt(e);t.needsUpdate=!0,n(t)}),t.load(wo.resolveURL(e,i.path),a,void 0,r)})}).then(function(e){return c===!0&&o.revokeObjectURL(s),Bu(e,a),e.userData.mimeType=a.mimeType||Ku(a.uri),e}).catch(function(e){throw console.error(`THREE.GLTFLoader: Couldn't load texture`,s),e});return this.sourceCache[e]=l,l}assignTexture(e,t,n,r){let i=this;return this.getDependency(`texture`,n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),i.extensions[eu.KHR_TEXTURE_TRANSFORM]){let e=n.extensions===void 0?void 0:n.extensions[eu.KHR_TEXTURE_TRANSFORM];if(e){let t=i.associations.get(a);a=i.extensions[eu.KHR_TEXTURE_TRANSFORM].extendTexture(a,e),i.associations.set(a,t)}}return r!==void 0&&(a.colorSpace=r),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,r=t.attributes.tangent===void 0,i=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let e=`PointsMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new ma,mr.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,t.sizeAttenuation=!1,this.cache.add(e,t)),n=t}else if(e.isLine){let e=`LineBasicMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new ea,mr.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,this.cache.add(e,t)),n=t}if(r||i||a){let e=`ClonedMaterial:`+n.uuid+`:`;r&&(e+=`derivative-tangents:`),i&&(e+=`vertex-colors:`),a&&(e+=`flat-shading:`);let t=this.cache.get(e);t||(t=n.clone(),i&&(t.vertexColors=!0),a&&(t.flatShading=!0),r&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(n))),n=t}e.material=n}getMaterialType(){return ka}loadMaterial(e){let t=this,n=this.json,r=this.extensions,i=n.materials[e],a,o={},s=i.extensions||{},c=[];if(s[eu.KHR_MATERIALS_UNLIT]){let e=r[eu.KHR_MATERIALS_UNLIT];a=e.getMaterialType(),c.push(e.extendParams(o,i,t))}else{let n=i.pbrMetallicRoughness||{};if(o.color=new U(1,1,1),o.opacity=1,Array.isArray(n.baseColorFactor)){let e=n.baseColorFactor;o.color.setRGB(e[0],e[1],e[2],Ie),o.opacity=e[3]}n.baseColorTexture!==void 0&&c.push(t.assignTexture(o,`map`,n.baseColorTexture,Fe)),o.metalness=n.metallicFactor===void 0?1:n.metallicFactor,o.roughness=n.roughnessFactor===void 0?1:n.roughnessFactor,n.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,`metalnessMap`,n.metallicRoughnessTexture)),c.push(t.assignTexture(o,`roughnessMap`,n.metallicRoughnessTexture))),a=this._invokeOne(function(t){return t.getMaterialType&&t.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(t){return t.extendMaterialParams&&t.extendMaterialParams(e,o)})))}i.doubleSided===!0&&(o.side=2);let l=i.alphaMode||Lu.OPAQUE;if(l===Lu.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,l===Lu.MASK&&(o.alphaTest=i.alphaCutoff===void 0?.5:i.alphaCutoff)),i.normalTexture!==void 0&&a!==hr&&(c.push(t.assignTexture(o,`normalMap`,i.normalTexture)),o.normalScale=new B(1,1),i.normalTexture.scale!==void 0)){let e=i.normalTexture.scale;o.normalScale.set(e,e)}if(i.occlusionTexture!==void 0&&a!==hr&&(c.push(t.assignTexture(o,`aoMap`,i.occlusionTexture)),i.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=i.occlusionTexture.strength)),i.emissiveFactor!==void 0&&a!==hr){let e=i.emissiveFactor;o.emissive=new U().setRGB(e[0],e[1],e[2],Ie)}return i.emissiveTexture!==void 0&&a!==hr&&c.push(t.assignTexture(o,`emissiveMap`,i.emissiveTexture,Fe)),Promise.all(c).then(function(){let n=new a(o);return i.name&&(n.name=i.name),Bu(n,i),t.associations.set(n,{materials:e}),i.extensions&&zu(r,n,i),n})}createUniqueName(e){let t=zo.sanitizeNodeName(e||``);return t in this.nodeNamesUsed?t+`_`+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,r=this.primitiveCache;function i(e){return n[eu.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(e,t).then(function(n){return Xu(n,e,t)})}let a=[];for(let n=0,o=e.length;n<o;n++){let o=e[n],s=Uu(o),c=r[s];if(c)a.push(c.promise);else{let e;e=o.extensions&&o.extensions[eu.KHR_DRACO_MESH_COMPRESSION]?i(o):Xu(new Fr,o,t),r[s]={primitive:o,promise:e},a.push(e)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,r=this.extensions,i=n.meshes[e],a=i.primitives,o=[];for(let e=0,t=a.length;e<t;e++){let t=a[e].material===void 0?Ru(this.cache):this.getDependency(`material`,a[e].material);o.push(t)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(n){let o=n.slice(0,n.length-1),s=n[n.length-1],c=[];for(let n=0,l=s.length;n<l;n++){let l=s[n],u=a[n],d,f=o[n];if(u.mode===ku.TRIANGLES||u.mode===ku.TRIANGLE_STRIP||u.mode===ku.TRIANGLE_FAN||u.mode===void 0)d=i.isSkinnedMesh===!0?new ji(l,f):new qr(l,f),d.isSkinnedMesh===!0&&d.normalizeSkinWeights(),u.mode===ku.TRIANGLE_STRIP?d.geometry=Zl(d.geometry,1):u.mode===ku.TRIANGLE_FAN&&(d.geometry=Zl(d.geometry,2));else if(u.mode===ku.LINES)d=new fa(l,f);else if(u.mode===ku.LINE_STRIP)d=new ca(l,f);else if(u.mode===ku.LINE_LOOP)d=new pa(l,f);else if(u.mode===ku.POINTS)d=new ya(l,f);else throw Error(`THREE.GLTFLoader: Primitive mode unsupported: `+u.mode);Object.keys(d.geometry.morphAttributes).length>0&&Hu(d,i),d.name=t.createUniqueName(i.name||`mesh_`+e),Bu(d,i),u.extensions&&zu(r,d,u),t.assignFinalMaterial(d),c.push(d)}for(let n=0,r=c.length;n<r;n++)t.associations.set(c[n],{meshes:e,primitives:n});if(c.length===1)return i.extensions&&zu(r,c[0],i),c[0];let l=new hi;i.extensions&&zu(r,l,i),t.associations.set(l,{meshes:e});for(let e=0,t=c.length;e<t;e++)l.add(c[e]);return l})}loadCamera(e){let t,n=this.json.cameras[e],r=n[n.type];if(!r){console.warn(`THREE.GLTFLoader: Missing camera parameters.`);return}return n.type===`perspective`?t=new li(gt.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type===`orthographic`&&(t=new xo(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Bu(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let e=0,r=t.joints.length;e<r;e++)n.push(this._loadNodeShallow(t.joints[e]));return t.inverseBindMatrices===void 0?n.push(null):n.push(this.getDependency(`accessor`,t.inverseBindMatrices)),Promise.all(n).then(function(e){let n=e.pop(),r=e,i=[],a=[];for(let e=0,o=r.length;e<o;e++){let o=r[e];if(o){i.push(o);let t=new H;n!==null&&t.fromArray(n.array,e*16),a.push(t)}else console.warn(`THREE.GLTFLoader: Joint "%s" could not be found.`,t.joints[e])}return new Ii(i,a)})}loadAnimation(e){let t=this.json,n=this,r=t.animations[e],i=r.name?r.name:`animation_`+e,a=[],o=[],s=[],c=[],l=[];for(let e=0,t=r.channels.length;e<t;e++){let t=r.channels[e],n=r.samplers[t.sampler],i=t.target,u=i.node,d=r.parameters===void 0?n.input:r.parameters[n.input],f=r.parameters===void 0?n.output:r.parameters[n.output];i.node!==void 0&&(a.push(this.getDependency(`node`,u)),o.push(this.getDependency(`accessor`,d)),s.push(this.getDependency(`accessor`,f)),c.push(n),l.push(i))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(s),Promise.all(c),Promise.all(l)]).then(function(e){let t=e[0],a=e[1],o=e[2],s=e[3],c=e[4],l=[];for(let e=0,r=t.length;e<r;e++){let r=t[e],i=a[e],u=o[e],d=s[e],f=c[e];if(r===void 0)continue;r.updateMatrix&&r.updateMatrix();let p=n._createAnimationTracks(r,i,u,d,f);if(p)for(let e=0;e<p.length;e++)l.push(p[e])}let u=new Xa(i,void 0,l);return Bu(u,r),u})}createNodeMesh(e){let t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency(`mesh`,r.mesh).then(function(e){let t=n._getNodeRef(n.meshCache,r.mesh,e);return r.weights!==void 0&&t.traverse(function(e){if(e.isMesh)for(let t=0,n=r.weights.length;t<n;t++)e.morphTargetInfluences[t]=r.weights[t]}),t})}loadNode(e){let t=this.json,n=this,r=t.nodes[e],i=n._loadNodeShallow(e),a=[],o=r.children||[];for(let e=0,t=o.length;e<t;e++)a.push(n.getDependency(`node`,o[e]));let s=r.skin===void 0?Promise.resolve(null):n.getDependency(`skin`,r.skin);return Promise.all([i,Promise.all(a),s]).then(function(e){let t=e[0],n=e[1],r=e[2];r!==null&&t.traverse(function(e){e.isSkinnedMesh&&e.bind(r,qu)});for(let e=0,r=n.length;e<r;e++)t.add(n[e]);return t})}_loadNodeShallow(e){let t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let i=t.nodes[e],a=i.name?r.createUniqueName(i.name):``,o=[],s=r._invokeOne(function(t){return t.createNodeMesh&&t.createNodeMesh(e)});return s&&o.push(s),i.camera!==void 0&&o.push(r.getDependency(`camera`,i.camera).then(function(e){return r._getNodeRef(r.cameraCache,i.camera,e)})),r._invokeAll(function(t){return t.createNodeAttachment&&t.createNodeAttachment(e)}).forEach(function(e){o.push(e)}),this.nodeCache[e]=Promise.all(o).then(function(t){let o;if(o=i.isBone===!0?new Mi:t.length>1?new hi:t.length===1?t[0]:new qn,o!==t[0])for(let e=0,n=t.length;e<n;e++)o.add(t[e]);if(i.name&&(o.userData.name=i.name,o.name=a),Bu(o,i),i.extensions&&zu(n,o,i),i.matrix!==void 0){let e=new H;e.fromArray(i.matrix),o.applyMatrix4(e)}else i.translation!==void 0&&o.position.fromArray(i.translation),i.rotation!==void 0&&o.quaternion.fromArray(i.rotation),i.scale!==void 0&&o.scale.fromArray(i.scale);if(!r.associations.has(o))r.associations.set(o,{});else if(i.mesh!==void 0&&r.meshCache.refs[i.mesh]>1){let e=r.associations.get(o);r.associations.set(o,{...e})}return r.associations.get(o).nodes=e,o}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],r=this,i=new hi;n.name&&(i.name=r.createUniqueName(n.name)),Bu(i,n),n.extensions&&zu(t,i,n);let a=n.nodes||[],o=[];for(let e=0,t=a.length;e<t;e++)o.push(r.getDependency(`node`,a[e]));return Promise.all(o).then(function(e){for(let t=0,n=e.length;t<n;t++)i.add(e[t]);return r.associations=(e=>{let t=new Map;for(let[e,n]of r.associations)(e instanceof mr||e instanceof Vt)&&t.set(e,n);return e.traverse(e=>{let n=r.associations.get(e);n!=null&&t.set(e,n)}),t})(i),i})}_createAnimationTracks(e,t,n,r,i){let a=[],o=e.name?e.name:e.uuid,s=[];Fu[i.path]===Fu.weights?e.traverse(function(e){e.morphTargetInfluences&&s.push(e.name?e.name:e.uuid)}):s.push(o);let c;switch(Fu[i.path]){case Fu.weights:c=Ga;break;case Fu.rotation:c=qa;break;case Fu.translation:case Fu.scale:c=Ya;break;default:switch(n.itemSize){case 1:c=Ga;break;default:c=Ya}}let l=r.interpolation===void 0?De:Iu[r.interpolation],u=this._getArrayFromAccessor(n);for(let e=0,n=s.length;e<n;e++){let n=new c(s[e]+`.`+Fu[i.path],t.array,u,l);r.interpolation===`CUBICSPLINE`&&this._createCubicSplineTrackInterpolant(n),a.push(n)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let e=Gu(t.constructor),n=new Float32Array(t.length);for(let r=0,i=t.length;r<i;r++)n[r]=t[r]*e;t=n}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(e){return new(this instanceof qa?Ou:Eu)(this.times,this.values,this.getValueSize()/3,e)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function Yu(e,t,n){let r=t.attributes,i=new qt;if(r.POSITION!==void 0){let e=n.json.accessors[r.POSITION],t=e.min,a=e.max;if(t!==void 0&&a!==void 0){if(i.set(new V(t[0],t[1],t[2]),new V(a[0],a[1],a[2])),e.normalized){let t=Gu(Au[e.componentType]);i.min.multiplyScalar(t),i.max.multiplyScalar(t)}}else{console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`);return}}else return;let a=t.targets;if(a!==void 0){let e=new V,t=new V;for(let r=0,i=a.length;r<i;r++){let i=a[r];if(i.POSITION!==void 0){let r=n.json.accessors[i.POSITION],a=r.min,o=r.max;if(a!==void 0&&o!==void 0){if(t.setX(Math.max(Math.abs(a[0]),Math.abs(o[0]))),t.setY(Math.max(Math.abs(a[1]),Math.abs(o[1]))),t.setZ(Math.max(Math.abs(a[2]),Math.abs(o[2]))),r.normalized){let e=Gu(Au[r.componentType]);t.multiplyScalar(e)}e.max(t)}else console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`)}}i.expandByVector(e)}e.boundingBox=i;let o=new fn;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,e.boundingSphere=o}function Xu(e,t,n){let r=t.attributes,i=[];function a(t,r){return n.getDependency(`accessor`,t).then(function(t){e.setAttribute(r,t)})}for(let t in r){let n=Pu[t]||t.toLowerCase();n in e.attributes||i.push(a(r[t],n))}if(t.indices!==void 0&&!e.index){let r=n.getDependency(`accessor`,t.indices).then(function(t){e.setIndex(t)});i.push(r)}return jt.workingColorSpace!==`srgb-linear`&&`COLOR_0`in r&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${jt.workingColorSpace}" not supported.`),Bu(e,t),Yu(e,t,n),Promise.all(i).then(function(){return t.targets===void 0?e:Vu(e,t.targets,n)})}var Zu={NORMAL:0,EMISSIVE:1,DECOR:2,STEAM:3,GLOW:5,GROOVED:6},Qu=.25,$u=e=>Math.round(e)+Qu,ed=e=>{let t=new U(e);return[t.r,t.g,t.b]},td=new H,nd=new _t,rd=new An,id=new V,ad=new V,od=(e,t,n,r=0,i=0,a=0,o=1,s=o,c=o)=>td.compose(id.set(e,t,n),nd.setFromEuler(rd.set(r,i,a)),ad.set(o,s,c)).clone();function sd(e){for(let t of Object.keys(e.attributes)){let n=e.attributes[t],r=n.itemSize,i=n.array;for(let e=0;e<n.count;e+=3)for(let t=0;t<r;t++){let n=(e+1)*r+t,a=(e+2)*r+t,o=i[n];i[n]=i[a],i[a]=o}}}var cd=class{dynamic;parts=[];constructor(e=!1){this.dynamic=e}push(e,t,n,r){let i=e.attributes.position.count,a=new Float32Array(i*3),o=new Float32Array(i);for(let e=0;e<i;e++)a[e*3]=t[0],a[e*3+1]=t[1],a[e*3+2]=t[2],o[e]=n;if(e.setAttribute(`aColor`,new wr(a,3)),e.setAttribute(`aFlag`,new wr(o,1)),this.dynamic){let t=new Float32Array(i).fill(r?.mode??0),n=new Float32Array(i*3),a=new Float32Array(i*4);if(r?.anchor)for(let e=0;e<i;e++)n.set(r.anchor,e*3);let o=r?.anim;if(typeof o==`function`){let t=e.attributes.position;for(let e=0;e<i;e++)a.set(o(t.getX(e),t.getY(e),t.getZ(e)),e*4)}else if(o)for(let e=0;e<i;e++)a.set(o,e*4);e.setAttribute(`aMode`,new wr(t,1)),e.setAttribute(`aAnchor`,new wr(n,3)),e.setAttribute(`aAnim`,new wr(a,4))}this.parts.push(e)}pushPrepared(e){this.parts.push(e)}add(e,t,n,r=Zu.NORMAL,i=!1,a){let o=e.index?e.toNonIndexed():e.clone();for(let e of Object.keys(o.attributes))e!==`position`&&e!==`normal`&&o.deleteAttribute(e);t&&(o.applyMatrix4(t),t.determinant()<0&&sd(o)),(i||!o.attributes.normal)&&o.computeVertexNormals(),this.push(o,n,r,a)}build(){if(this.parts.length)return Yl(this.parts,!1);let e=new Fr,t=e=>new wr(new Float32Array,e);return e.setAttribute(`position`,t(3)),e.setAttribute(`normal`,t(3)),e.setAttribute(`aColor`,t(3)),e.setAttribute(`aFlag`,t(1)),this.dynamic&&(e.setAttribute(`aMode`,t(1)),e.setAttribute(`aAnchor`,t(3)),e.setAttribute(`aAnim`,t(4))),e}},ld={water:{shallow:8176844,deep:2382460,clarity:1.4,reflectivity:.55,roughness:.15,waveScale:.9,foam:15267060,foamAmount:.8,emission:0},canal:{shallow:4033150,deep:1790056,clarity:.5,reflectivity:.6,roughness:.12,waveScale:1.4,foam:14214882,foamAmount:.6,emission:0},pond:{shallow:5599308,deep:2112056,clarity:.45,reflectivity:.7,roughness:.03,waveScale:.8,foam:13621448,foamAmount:.3,emission:0},swamp:{shallow:6188086,deep:2896928,clarity:.15,reflectivity:.25,roughness:.08,waveScale:.7,foam:10133616,foamAmount:.4,emission:0},acid:{shallow:12120138,deep:5020188,clarity:.35,reflectivity:.35,roughness:.1,waveScale:.6,foam:15400880,foamAmount:1,emission:.45},lava:{shallow:16756794,deep:13121050,clarity:.05,reflectivity:.04,roughness:.3,waveScale:1.6,foam:3809304,foamAmount:.9,emission:1}},ud=e=>[e.shallow,e.deep,e.clarity,e.reflectivity,e.roughness,e.waveScale,e.foam,e.foamAmount,e.emission].join(`,`),dd=.95,fd=class{limits;parts=[];materials=[];keys=[];sources=[];constructor(e={}){this.limits=hd(e)}add(e,t,n,r=[0,0],i=2.4){let a=ud(n),o=this.keys.indexOf(a);if(o<0){if(this.materials.length>=this.limits.fluidMaterials)throw Error(`At most ${this.limits.fluidMaterials} different fluid materials per scene`);o=this.materials.length,this.materials.push(n),this.keys.push(a)}let s=e.index?e.toNonIndexed():e.clone();for(let e of Object.keys(s.attributes))e!==`position`&&s.deleteAttribute(e);t&&(s.applyMatrix4(t),t.determinant()<0&&sd(s)),s.computeVertexNormals();let c=s.attributes.position,l=c.count,u=new Float32Array(l*3),d=new Float32Array(l).fill(o),f=new V,p=new V,m=new V,h=new V,g=new V;for(let e=0;e+2<l;e+=3){f.fromBufferAttribute(c,e),p.fromBufferAttribute(c,e+1),m.fromBufferAttribute(c,e+2),h.subVectors(p,f).cross(m.sub(f)).normalize(),Math.abs(h.y)>=.95?g.set(r[0],0,r[1]):g.set(0,-1,0).addScaledVector(h,h.y).normalize().multiplyScalar(i);for(let t=e*3;t<(e+3)*3;t+=3)u[t]=g.x,u[t+1]=g.y,u[t+2]=g.z}s.setAttribute(`aFlow`,new wr(u,3)),s.setAttribute(`aFluid`,new wr(d,1)),this.parts.push(s)}source(e,t,{y:n,radius:r=.6,strength:i=1,rings:a=!0}={}){if(this.sources.length>=this.limits.fluidSources)throw Error(`At most ${this.limits.fluidSources} fluid sources per scene`);this.sources.push({x:e,z:t,y:n,radius:r,strength:i,rings:a})}build(){let e;if(this.parts.length)e=Yl(this.parts,!1);else{e=new Fr;for(let[t,n]of[[`position`,3],[`normal`,3],[`aFlow`,3],[`aFluid`,1]])e.setAttribute(t,new wr(new Float32Array,n))}return{geometry:e,materials:[...this.materials],sources:[...this.sources]}}};function pd(e){let t=/^water_([a-z]+)_/i.exec(e)?.[1].toLowerCase();return t&&Object.hasOwn(ld,t)?ld[t]:ld.water}var md=Object.freeze({lamps:64,grooves:8,fluidMaterials:8,fluidSources:8});function hd(e={}){let t={...md};for(let n of Object.keys(t)){let r=e[n]??t[n];if(!Number.isSafeInteger(r)||r<1||r>4096)throw RangeError(`limits.${n} must be a positive integer no greater than 4096`);t[n]=r}return Object.freeze(t)}function gd(e){return{...e,dynamicGeometry:e.dynamicGeometry??new cd(!0).build(),lamps:e.lamps??[],fluids:e.fluids??new fd().build(),grooves:e.grooves??null,stats:e.stats??{triangles:0,paletteColors:0}}}var _d=`
float bayer4(ivec2 p){
  const int M[16] = int[16](0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5);
  return (float(M[(p.x & 3) + (p.y & 3) * 4]) + 0.5) / 16.0;
}`,vd=`void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`,yd=`
in vec3 aColor; in float aFlag;
out vec3 vN; out vec3 vC; out float vF; out float vD; out float vA;
flat out float vObjectId;
void main(){
  vObjectId = 0.0;
  vN = normal; vC = aColor; vF = aFlag; vA = 1.0;
  vec4 vp = viewMatrix * vec4(position, 1.0);
  vD = -vp.z;
  gl_Position = projectionMatrix * vp;
}`,bd=`
uniform float uSeeThrough;
float instanceOpacity(){ return 1.0 - float(uint(instanceColor.b) & 255u) / 255.0; }
vec3 instanceTint(vec3 c){
  uint strength = uint(instanceColor.b) >> 8u;
  if (strength == 0u) return c;
  uint t = uint(instanceColor.g);
  vec3 s = vec3((uvec3(t) >> uvec3(16u, 8u, 0u)) & 255u) / 255.0;
  vec3 lin = mix(s / 12.92, pow((s + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), s));
  return mix(c, lin, float(strength) / 255.0);
}
// Moves the vertex out of the clip volume in the see-through pass, so the whole object is dropped.
void seeThrough(float opacity){ if (opacity < 1.0 && uSeeThrough > 0.5) gl_Position = vec4(0.0, 0.0, 2.0, 1.0); }`,xd=`
in vec3 aColor; in float aFlag;
out vec3 vN; out vec3 vC; out float vF; out float vD; out float vA;
flat out float vObjectId;
${bd}
void main(){
  vObjectId = instanceColor.r;
  mat4 model = modelMatrix * instanceMatrix;
  float opacity = instanceOpacity();
  vN = transpose(inverse(mat3(model))) * normal; vC = instanceTint(aColor); vF = aFlag; vA = opacity;
  vec4 vp = viewMatrix * model * vec4(position, 1.0);
  vD = -vp.z;
  gl_Position = projectionMatrix * vp;
  seeThrough(opacity);
}`,Sd=`
float wind(vec2 p, float t){ return sin(p.x*0.42 + p.y*0.27 + t*1.5)*0.6 + sin(p.x*0.91 - p.y*0.63 + t*2.6)*0.4; }
// Rotate v by angle a about the unit axis k (Rodrigues).
vec3 rotateAxis(vec3 v, vec3 k, float a){ float c = cos(a), s = sin(a); return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c); }
// Move a vertex (pos, nrm: its rest pose) by motion mode m at time uTime; alpha < 1 fades it out by dithering.
// The parameters shadow the attributes and the clock, so the mode code reads the same for every caller.
void poseAt(inout vec3 pos, inout vec3 nrm, out float alpha, float m, vec3 aAnchor, vec4 aAnim, float uTime){
  vec3 position = pos, normal = nrm;
  alpha = 1.0;
  int mode = int(m + 0.5);
  if (mode == 1) {                       // sway: tips lean with travelling gusts. anim = (weight, base x, base z)
    float w = aAnim.x, g = wind(aAnim.yz, uTime);
    pos.xz += vec2(1.0, 0.35) * g * 0.13 * w;
    pos.y -= abs(g) * 0.025 * w;
  } else if (mode == 2) {                // conveyor along +x: grows in, rides, shrinks away. anim = (start x, length, speed)
    float x0 = aAnchor.x, x1 = aAnim.x, L = aAnim.y;
    float nx = x1 + mod(x0 - x1 + uTime * aAnim.z, L);
    float sc = smoothstep(x1, x1 + 0.3, nx) * (1.0 - smoothstep(x1 + L - 0.3, x1 + L, nx));
    pos = aAnchor + (position - aAnchor) * sc;
    pos.x += nx - x0;
  } else if (mode == 3) {                // smoke puff: rises from the anchor, swells, dissolves. anim = (phase, seed)
    float u = fract(uTime * 0.09 + aAnim.x), sd = aAnim.y;
    float sc = mix(0.2, 0.8, smoothstep(0.0, 0.78, u)) * (0.85 + 0.3 * sd);
    vec3 c = aAnchor + vec3(0.28 * u + 0.55 * u * u + 0.2 * sin(u * 7.0 + sd * 20.0), u * 2.5, 0.1 * sin(u * 5.0 + sd * 11.0));
    pos = c + position * sc;
    alpha = (1.0 - smoothstep(0.45, 0.98, u)) * smoothstep(0.0, 0.07, u);
  } else if (mode == 4) {                // butterfly: wandering loop around the anchor, flapping wings. anim = (phase, seed)
    float k = fract(aAnim.y * 7.0), a = uTime * (0.32 + 0.2 * k) + aAnim.x * 6.2832;
    float R = 1.2 + 1.7 * fract(aAnim.y * 3.7);
    vec3 c = vec3(aAnchor.x + cos(a) * R, aAnchor.y + 0.55 + 0.25 * sin(a * 2.1 + aAnim.x * 9.0), aAnchor.z + sin(a * 1.37) * R * 0.8);
    float yaw = atan(-sin(a) * R, cos(a * 1.37) * 1.37 * R * 0.8);
    float flap = sin(uTime * 19.0 + aAnim.x * 30.0) * 0.85;
    vec3 l = position; float ax = abs(l.x);
    l.x = sign(l.x) * ax * cos(flap); l.y += ax * sin(flap);
    float cy = cos(yaw), sy = sin(yaw);
    pos = c + vec3(l.x * cy + l.z * sy, l.y, -l.x * sy + l.z * cy);
    nrm = vec3(0.0, 1.0, 0.0);
  } else if (mode == 5) {                // firefly: drifting around the anchor, blinking, night only. anim = (phase, seed)
    float a = uTime * (0.2 + 0.15 * fract(aAnim.y * 5.0)) + aAnim.x * 6.2832;
    vec3 c = vec3(aAnchor.x + sin(a * 1.1) * 2.2, aAnchor.y + 0.55 + 0.45 * sin(a * 1.7 + aAnim.x * 5.0), aAnchor.z + cos(a * 0.9) * 2.0);
    alpha = step(0.25, 0.5 + 0.5 * sin(uTime * 2.3 + aAnim.x * 40.0)) * step(0.3, uNight);
    pos = c + position;
  } else if (mode == 6 || mode == 7) {   // spin / swing about an axis through the anchor. anim = (axis xyz, speed or amplitude)
    float a = mode == 6 ? uTime * aAnim.w : aAnim.w * sin(uTime * 1.3 + dot(aAnchor, vec3(1.7, 0.3, 2.1)));
    pos = aAnchor + rotateAxis(position - aAnchor, aAnim.xyz, a);
    nrm = rotateAxis(normal, aAnim.xyz, a);
  }
}
// The baked dynamic mesh: world space, the scene clock.
void pose(inout vec3 pos, inout vec3 nrm, out float alpha){ poseAt(pos, nrm, alpha, aMode, aAnchor, aAnim, uTime); }`,Cd=`${Sd}
float instancePhase(float id){ return float((uint(id) * 2654435761u) >> 8u) / 16777216.0; }
void poseObject(mat4 model, float id, out vec3 wpos, out vec3 wnrm, out float alpha){
  float t = uTime + instancePhase(id) * 97.0;
  mat3 nm = transpose(inverse(mat3(model)));
  int mode = int(aMode + 0.5);
  if (mode >= 3 && mode <= 5) {
    // A mirrored instance is drawn with its front faces reversed (objects.ts); mirror the shape too, so it still faces out.
    vec3 mirror = vec3(determinant(mat3(model)) < 0.0 ? -1.0 : 1.0, 1.0, 1.0);
    wpos = position * mirror; wnrm = normal * mirror;
    poseAt(wpos, wnrm, alpha, aMode, (model * vec4(aAnchor, 1.0)).xyz, aAnim, t);
  } else if (mode == 1) {
    wpos = (model * vec4(position, 1.0)).xyz; wnrm = nm * normal;
    vec2 base = (model * vec4(aAnim.y, 0.0, aAnim.z, 1.0)).xz;
    poseAt(wpos, wnrm, alpha, aMode, aAnchor, vec4(aAnim.x, base, aAnim.w), t);
  } else {
    vec3 pos = position, nrm = normal;
    poseAt(pos, nrm, alpha, aMode, aAnchor, aAnim, t);
    wpos = (model * vec4(pos, 1.0)).xyz; wnrm = nm * nrm;
  }
}`,wd=`
uniform float uTime; uniform float uNight;
in vec3 aColor; in float aFlag; in float aMode; in vec3 aAnchor; in vec4 aAnim;
out vec3 vN; out vec3 vC; out float vF; out float vD; out float vA;
flat out float vObjectId;
${Cd}
${bd}
void main(){
  vObjectId = instanceColor.r;
  vec3 pos, nrm; float alpha;
  poseObject(modelMatrix * instanceMatrix, instanceColor.r, pos, nrm, alpha);
  float opacity = instanceOpacity();
  vN = nrm; vC = instanceTint(aColor); vF = aFlag; vA = alpha * opacity;
  vec4 vp = viewMatrix * vec4(pos, 1.0);
  vD = -vp.z;
  gl_Position = projectionMatrix * vp;
  seeThrough(opacity);
}`,Td=`
uniform float uTime; uniform float uNight;
in vec3 aColor; in float aFlag; in float aMode; in vec3 aAnchor; in vec4 aAnim;
out vec3 vN; out vec3 vC; out float vF; out float vD; out float vA;
flat out float vObjectId;
${Sd}
void main(){
  vObjectId = 0.0;
  vec3 pos = position; vec3 nrm = normal; float alpha;
  pose(pos, nrm, alpha);
  vN = nrm; vC = aColor; vF = aFlag; vA = alpha;
  vec4 vp = viewMatrix * vec4(pos, 1.0);
  vD = -vp.z;
  gl_Position = projectionMatrix * vp;
}`,Ed=`
precision highp float;
uniform int uSS;   // samples per art pixel along each axis: the dither threshold stays per art pixel
in vec3 vN; in vec3 vC; in float vF; in float vD; in float vA;
flat in float vObjectId;
layout(location = 0) out vec4 gAlbedo;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out float gObjectId;
${_d}
void main(){
  if (vA < 0.999 && vA < bayer4(ivec2(gl_FragCoord.xy) / uSS)) discard;
  float f = floor(vF + 0.5);
  gAlbedo = vec4(vC, 1.0 + f + (vF - f > 0.1 ? 0.25 : 0.0));   // + 0.25: thin mark (flags.ts)
  gNormal = vec4(normalize(vN), vD);
  gObjectId = vObjectId;
}`,Dd=`
in vec3 aFlow; in float aFluid;
out vec3 vN; flat out vec3 vFlow; flat out float vSlot; out float vD;   // flow and slot are per triangle
void main(){
  vN = normal; vFlow = aFlow; vSlot = aFluid;
  vec4 vp = viewMatrix * vec4(position, 1.0);
  vD = -vp.z;
  gl_Position = projectionMatrix * vp;
}`,Od=`
precision highp float;
uniform sampler2D tAlbedo; uniform sampler2D tNormal;   // the resolved opaque G-buffer
uniform vec3 uFwd;
in vec3 vN; flat in vec3 vFlow; flat in float vSlot; in float vD;
layout(location = 0) out vec4 fNormal;   // xyz: normal facing the camera, w: depth
layout(location = 1) out vec4 fFlow;     // xyz: velocity (m/s, world), w: 1 + material slot (0: no fluid)
void main(){
  ivec2 p = ivec2(gl_FragCoord.xy);
  if (texelFetch(tAlbedo, p, 0).a > 0.5 && vD > texelFetch(tNormal, p, 0).w - 0.002) discard;
  vec3 n = normalize(vN);
  if (dot(n, uFwd) > 0.0) n = -n;   // a falling sheet is seen from either side
  fNormal = vec4(n, vD);
  fFlow = vec4(vFlow, 1.0 + floor(vSlot + 0.5));
}`,kd=e=>`
#define MAX_FLUIDS ${e.fluidMaterials}
#define MAX_SOURCES ${e.fluidSources}
#define POOL_NORMAL_Y ${dd.toFixed(4)}
uniform int uPass;
uniform sampler2D tImage;                       // pass 0's output: linear, unclipped, alpha 1 where it takes the grade
uniform sampler2D tFluidN; uniform sampler2D tFluidF;   // the fluid G-buffer (see FLUID_FRAG)
uniform sampler2D tFluidMap; uniform sampler2D tFluidHeight; uniform vec4 uFluidBounds;   // fluidMap.ts
// Four vec4 per material, to keep the fragment uniform count low (colours linear RGB):
// (shallow, clarity), (deep, reflectivity), (foam, roughness), (wave scale, foam amount, emission, -).
uniform vec4 uFluidA[MAX_FLUIDS]; uniform vec4 uFluidB[MAX_FLUIDS]; uniform vec4 uFluidC[MAX_FLUIDS]; uniform vec4 uFluidD[MAX_FLUIDS];
uniform int uSourceCount; uniform vec4 uSources[MAX_SOURCES];   // x, z, radius (negative: no rings), strength
uniform float uSourceY[MAX_SOURCES];                            // the surface height each stirs (-1e4: any)

vec3 imageAt(ivec2 q){ return texelFetch(tImage, clampP(q), 0).rgb; }
bool fluidAt(ivec2 q){ return texelFetch(tFluidF, clampP(q), 0).a > 0.5; }
// A pass-0 pixel, finished as pass 0 would have done without a fluid pass (see emitColor): exactly the same output.
vec4 passThrough(ivec2 p){
  vec4 c = texelFetch(tImage, p, 0);
  return vec4(toSRGB(c.a > 0.75 ? finish(c.rgb, p) : c.rgb), 1.0);
}
float opaqueDepth(ivec2 q){ return A(q).a < 0.5 ? 1e4 : N(q).w; }

// Ripple height (0..1, mostly 0.3..0.7) at surface coordinates s, moving with the flow f (m/s) without stretching: two copies of
// the pattern, each dragged along the flow for one period and then reset, cross-faded so neither reset shows (Vlachos,
// "Water Flow in Portal 2", 2010). A slowly varying phase offset keeps the whole surface from pulsing in step, and a
// current stretches the pattern along itself into streaks.
float rippleField(vec2 s, vec2 f, float scale){
  const float PERIOD = 2.0;
  float t = uTime / PERIOD + 0.8 * vn(s / (scale * 4.0) + 17.0), h = 0.0, v = length(f);
  vec2 along = v > 0.08 ? f / v : vec2(1.0, 0.0), across = vec2(-along.y, along.x);
  float stretch = 1.0 + 1.4 * smoothstep(0.08, 1.2, v);
  for (int k = 0; k < 2; k++) {
    float ph = fract(t + 0.5 * float(k)), w = 1.0 - abs(2.0 * ph - 1.0);
    vec2 x = s - f * ph * PERIOD;
    vec2 q = vec2(dot(x, along) / stretch, dot(x, across)) / scale + float(k) * vec2(3.7, 1.3);
    h += w * (0.65 * vn(q) + 0.35 * vn(q * 2.3 + 5.1));
  }
  return h;
}

void water(ivec2 p){
  vec4 fn = texelFetch(tFluidN, p, 0), ff = texelFetch(tFluidF, p, 0);
  int slot = int(ff.a + 0.5) - 1;
  float d = fn.w, THR = max(0.10, uTexel * 3.0);
  // A solid standing in front of the surface keeps the ink the first pass drew on this pixel.
  if (uOutline == 1) {
    const ivec2 OFF[4] = ivec2[4](ivec2(1,0), ivec2(-1,0), ivec2(0,1), ivec2(0,-1));
    for (int i = 0; i < 4; i++) {
      ivec2 q = p + OFF[i];
      vec4 aq = A(q);
      if (aq.a > 0.5 && inkSource(flagOf(aq.a)) && N(q).w < d - THR && !fluidAt(q)) { outColor = passThrough(p); return; }
    }
  }
  vec4 opt = vec4(uFluidA[slot].w, uFluidB[slot].w, uFluidC[slot].w, uFluidD[slot].x);   // clarity, reflectivity, roughness, wave scale
  vec2 extra = uFluidD[slot].yz;                                                           // foam amount, emission
  vec3 wp = worldAt(vec2(p) + 0.5, d), n0 = fn.xyz, flow = ff.xyz;
  bool pool = abs(n0.y) >= POOL_NORMAL_Y;

  // Flow and turbulence: the top-down map knows the banks and obstacles; elsewhere the surface's own flow.
  float turb = 0.0, shore = 99.0;
  if (pool) {
    vec2 uv = (wp.xz - uFluidBounds.xy) / (uFluidBounds.zw - uFluidBounds.xy);
    if (all(greaterThanEqual(uv, vec2(0.0))) && all(lessThanEqual(uv, vec2(1.0))) && abs(textureLod(tFluidHeight, uv, 0.0).r - wp.y) < 0.05) {
      vec4 m = textureLod(tFluidMap, uv, 0.0);
      flow = vec3(m.r, 0.0, m.g); turb = m.b; shore = m.a;
    }
  }
  float ring = 0.0;
  for (int k = 0; k < MAX_SOURCES; k++) {
    if (k >= uSourceCount) break;
    if (!pool || (uSourceY[k] > -9e3 && abs(wp.y - uSourceY[k]) > 0.05)) continue;   // pools at its height only
    vec4 s = uSources[k];
    bool rings = s.z > 0.0;
    s.z = abs(s.z);
    float r = length(wp.xz - s.xy);
    turb = max(turb, s.w * (1.0 - smoothstep(0.0, s.z, r)));
    if (rings) {   // rings expanding from the source, evenly out of phase
      float ph = fract(uTime * 0.45 + float(k) * 0.37), R = s.z * 2.6 * ph;
      ring = max(ring, (1.0 - smoothstep(0.0, 0.07, abs(r - R))) * (1.0 - ph) * s.w);
    }
  }
  float speed = length(flow);
  float rough = clamp(opt.z + 0.22 * speed + 0.75 * turb + 0.5 * ring, 0.0, 1.0);

  // Surface frame: a pool uses world xz; a falling sheet uses (across, down its slope), and its flow runs down.
  vec3 T = vec3(1.0, 0.0, 0.0), B = vec3(0.0, 0.0, 1.0);
  vec2 s = wp.xz, f = flow.xz + (pool ? vec2(0.05, 0.03) : vec2(0.0));   // still water still drifts in the air
  if (!pool) {
    B = speed > 1e-3 ? flow / speed : vec3(0.0, -1.0, 0.0);
    T = normalize(cross(n0, B));
    s = vec2(dot(wp, T), dot(wp, B)); f = vec2(0.0, speed);
  }

  // Ripple normal from the height field's slope. Calm water barely tilts; rough water tilts a lot.
  float sc = opt.w * (pool ? 1.0 : 0.5), e = 0.12 * sc;
  float h = rippleField(s, f, sc);
  vec2 gr = vec2(rippleField(s + vec2(e, 0.0), f, sc) - h, rippleField(s + vec2(0.0, e), f, sc) - h) / e;
  float amp = 0.32 * rough * sc;   // zero roughness is a true mirror
  vec3 n = normalize(n0 - (T * gr.x + B * gr.y) * amp);
  int tone = h > 0.57 && h < 0.63 ? 3 : h < 0.4 ? 1 : 2;   // thin bright crest lines, darker troughs
  if (ring > 0.4) tone = 3;

  // What lies under the surface, bent by the ripples and fading with depth.
  vec3 dn = n - n0;
  float thick = opaqueDepth(p) - d;
  ivec2 rq = p + ivec2(round(vec2(dot(dn, uRight), dot(dn, uUp)) * 6.0 * min(thick, 1.0)));
  if (rq != p && (!fluidAt(rq) || opaqueDepth(rq) < texelFetch(tFluidN, clampP(rq), 0).w)) rq = p;   // stay on this fluid
  float thickR = max(opaqueDepth(rq) - d, 0.0);
  float trans = exp(-thickR / max(opt.x, 1e-3)) * (pool ? 1.0 : 0.4);   // a falling sheet is aerated, nearly opaque
  vec3 shallow = uFluidA[slot].rgb, deep = uFluidB[slot].rgb;

  // The body: the deep colour, lit by the sky and sun (shadowed where the bed is) and by lamps; a self-lit fluid glows.
  float shadow = texelFetch(tShadow, p, 0).a;
  int band = clamp(tone - (shadow > 0.5 && uSunI > 0.5 ? 1 : 0), 0, 3);
  vec3 body = ramp(deep, band, 0);
  if (uLampOn > 0.01 && extra.y < 0.5) {
    vec4 L = lampAt(wp, n0, uDither == 1 ? (bayer4(p) - 0.5) * 0.6 : 0.0);
    if (L.a > 0.18) body = mix(body, ramp(deep, min(band + 1, 3), 2, L.rgb), uLampOn * (L.a > 0.45 ? 0.7 : 0.4));
  }
  body = mix(body, ramp(mix(deep, shallow, 0.35 * float(tone - 1)), 3, 1), extra.y);
  vec3 bed = imageAt(rq) * mix(vec3(1.0), shallow / max(max(shallow.r, shallow.g), max(shallow.b, 1e-3)), 0.55);
  float tq = floor(trans * 4.0 + 0.5) / 4.0;   // four clean steps: a dither here reads as a screen door
  vec3 col = mix(body, bed, tq);

  // Reflection. In this orthographic view the mirrored ray climbs the screen in a straight line (straight up its column
  // when the surface is flat), so walk up that line a pixel at a time. A pixel is the hit when the ray crosses the plane
  // of the surface seen there inside that pixel's own footprint, so a calm mirror is exact to the pixel. Past 128 rows the
  // walk takes two-pixel steps, with a footprint to match.
  vec3 r = reflect(uFwd, n);
  float up = dot(r, uUp);
  // A miss mirrors the sky: nearer the horizon colour where a ripple tilts the ray down, the zenith where it tilts up,
  // in three clean steps, so ripples read as bands of sky and a calm surface as one even tone.
  float sk = clamp(floor(1.5 + (r.y - reflect(uFwd, n0).y) * 9.0), 0.0, 2.0);
  // From this high a view the water mirrors the upper sky more than the horizon, seen through the water's own tint.
  vec3 refl = mix(uSkyBot, uSkyTop, 0.95 - 0.2 * sk) * mix(vec3(1.0), deep / max(max(deep.r, deep.g), max(deep.b, 1e-3)), 0.3);
  float skyW = 0.45;   // the sky mirrors faintly: a bright day sky would wash the water out
  if (up > 0.02 && opt.y > 0.0) {
    // Rough water breaks the image into rows that shiver sideways (the long broken streaks under a lamp at night).
    float row = floor(float(p.y) * 0.5);
    float shiver = (h21(vec2(row, floor(uTime * 5.0) + float(slot))) - 0.5) * 9.0 * rough * rough;
    vec2 dir = vec2(dot(r, uRight) / up, 1.0);
    float rows = 0.0;
    for (int i = 0; i < 192; i++) {
      float stp = i < 128 ? 1.0 : 2.0;
      rows += stp;
      vec2 pc = vec2(p) + 0.5 + vec2(shiver, 0.0) + dir * rows;
      if (pc.y >= uRes.y || pc.x < 0.0 || pc.x >= uRes.x) break;
      ivec2 q = ivec2(pc);
      if (A(q).a < 0.5 || fluidAt(q)) continue;
      vec4 nq = N(q);
      float den = dot(r, nq.xyz);
      if (abs(den) < 1e-3) continue;
      vec3 Q = worldAt(vec2(q) + 0.5, nq.w);
      float t = dot(Q - wp, nq.xyz) / den;
      if (t <= 0.0) continue;
      vec3 X = wp + r * t - Q;
      vec2 o = vec2(dot(X, uRight), dot(X, uUp)) / uTexel;
      float foot = 0.5 * stp + 0.25;   // the pixel, a step's width, and the resolve's sub-pixel shift
      if (abs(o.x) <= foot && abs(o.y) <= foot) { refl = imageAt(q); skyW = 1.0; break; }
    }
  }
  float fres = pow(1.0 - clamp(dot(-uFwd, n), 0.0, 1.0), 5.0);
  float R = clamp(opt.y * skyW * (1.0 - 0.55 * rough) * (0.75 + 2.5 * fres), 0.0, 0.95);
  float Rq = floor(R * 3.0 + 0.5) / 3.0;   // three clean steps; ripples move the step edges
  col = mix(col, refl, Rq);
  // Ripple crests catch the light and troughs sink a little, so the pattern reads even when the mirror dominates.
  vec3 lab = toLab(col);
  lab.x *= tone == 3 ? 1.16 : tone == 1 ? 0.9 : 1.0;
  col = fromLab(lab);

  // Lamps on the water. Each lamp's mirror image (as far below the surface as the lamp is above it) is drawn where it
  // projects: a compact spot on calm water that ripples stretch into a broken column of dashes running towards the
  // viewer, shivering sideways. Only where the lamp really lights this point (its shadow map): a lamp behind a quay wall
  // shows none. Drawn even where the lantern itself is hidden from the mirror, since its glow lights the water.
  if (pool && uLampOn > 0.01 && opt.y > 0.0) {   // mirrored across a level surface: pools only
    float stretch = smoothstep(0.08, 0.6, rough);
    for (int i = 0; i < MAX_LAMPS; i++) {
      if (i >= uLampCount) break;
      vec3 lp = uLamp[i].xyz;
      float hgt = lp.y - wp.y;
      if (hgt <= 0.0) continue;
      vec3 dv = vec3(lp.x, wp.y - hgt, lp.z) - wp;
      float sx = dot(dv, uRight), sy = dot(dv, uUp), rows = floor(sy / uTexel * 0.5);
      float ry = max(mix(0.07, 0.3 + 0.25 * hgt, stretch), 2.0 * uTexel), taper = 1.0 - abs(sy) / ry;
      if (taper <= 0.0) continue;
      float shiver = (h21(vec2(rows, floor(uTime * 3.0) + float(i))) - 0.5) * 0.25 * stretch;
      float gap = h21(vec2(rows * 1.7 + float(i), floor(uTime * 2.0)));
      bool dash = stretch < 0.2 || mod(rows, 2.0) < 0.5 || gap > 0.75 * (1.0 - taper);
      if (!dash || abs(sx + shiver) > max(mix(0.06, 0.04 + 0.12 * taper * taper, stretch), 0.5 * uTexel)) continue;
      if (lampVisible(i, wp, vec3(0.0, 1.0, 0.0)) < 0.5) continue;
      vec3 c = uLampCol[i] / max(max(uLampCol[i].r, uLampCol[i].g), max(uLampCol[i].b, 1e-3));
      col = mix(col, ramp(c * 0.7, taper > 0.6 ? 3 : 2, 1), uLampOn * (taper > 0.3 ? 1.0 : 0.6) * clamp(opt.y * 2.0, 0.0, 1.0));
      break;
    }
  }

  // Sun and moon glints where a ripple faces the light just right.
  float g = dot(r, uSun);
  if (opt.y > 0.15 && uSunI > 0.2 && g > 0.995 - 0.02 * rough && h21(floor(wp.xz * 8.0) + floor(uTime * 3.0)) > 0.4) col = ramp(mix(uSkyBot, vec3(1.0), 0.6), 4, 1);

  // Foam where the fluid is stirred: at sources, obstacles and falls, along the banks only where the water moves,
  // and wherever it runs fast. A noise pattern travels with the flow and shows above a threshold.
  float bankFoam = (1.0 - smoothstep(0.03, 0.25, shore)) * clamp((speed - 0.7) * 1.2 + turb, 0.0, 1.0);
  float stir = clamp(turb + bankFoam + max(speed - 1.2, 0.0) * 0.35 + ring * 0.3 + (pool ? 0.0 : 0.6), 0.0, 1.0) * extra.x;   // falling water froths
  if (stir > 0.08) {   // faint turbulence only roughens the surface
    float fz = rippleField(s * 2.7 + 11.0, f * 2.7, sc);   // a finer copy of the ripples
    float cut = 0.76 - 0.46 * stir;
    if (fz > cut) {
      vec3 foam = uFluidC[slot].rgb;
      int fb = fz > cut + 0.06 ? 3 : 2;
      vec3 fc = ramp(foam, fb - (shadow > 0.5 && uSunI > 0.5 ? 1 : 0), 0);
      if (uLampOn > 0.01) {
        vec4 L = lampAt(wp, vec3(0.0, 1.0, 0.0), 0.0);
        if (L.a > 0.18) fc = ramp(foam, fb, 2, L.rgb);
      }
      col = fc;
    }
  }
  outColor = vec4(toSRGB(finish(col, p)), 1.0);
}`,Ad=e=>`
precision highp float; precision highp int;
#define MAX_LAMPS ${e.lamps}
#define MAX_GROOVES ${e.grooves}
uniform sampler2D tAlbedo; uniform sampler2D tNormal; uniform sampler2D tShadow;
uniform vec2 uRes; uniform float uTexel;
uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uFwd; uniform vec3 uCamPos;
uniform vec3 uSun; uniform float uTime;
uniform int uOutline; uniform int uDither; uniform int uClouds; uniform int uContact; uniform int uGlow; uniform int uVignette;
uniform int uDeferGrade;   // 1: a fluid pass follows: write unclipped linear colour, and let it grade (shaders/water.ts)
uniform float uSunI; uniform float uAmbient; uniform float uExpo; uniform float uChroma; uniform float uNight; uniform float uLampOn;
uniform vec2 uLitTint; uniform vec2 uShadeTint;
uniform vec3 uSkyTop; uniform vec3 uSkyBot;
uniform int uLampCount; uniform vec4 uLamp[MAX_LAMPS]; uniform vec3 uLampCol[MAX_LAMPS];   // uLamp: position, radius
uniform sampler2D tLampShadow; uniform vec3 uLampAtlas;   // atlas width, height, face tile size
uniform sampler2D tWindow; uniform vec4 uWindowBounds;   // window light map (windowLight.ts): rgb light, a source height; world xz bounds
uniform sampler2D tWindowSource;   // same grid: rg = weighted window xz minus the texel centre
uniform int uGrooveCount; uniform float uGrooves[MAX_GROOVES]; uniform vec3 uGrooveAxis; uniform vec2 uGrooveY;
out vec4 outColor;

// flags (alpha = 1 + flag), matching flags.ts
const int F_NORMAL = 0, F_EMISSIVE = 1, F_DECOR = 2, F_STEAM = 3, F_GLOW = 5, F_GROOVED = 6;   // 4 is unused (was water)
int flagOf(float a){ return int(floor(a + 0.5)) - 1; }
bool inkSource(int f){ return f == F_NORMAL || f == F_EMISSIVE || f == F_STEAM || f == F_GROOVED; }
bool solid(int f){ return f == F_NORMAL || f == F_EMISSIVE || f == F_GROOVED; }

// ---- colour science ----------------------------------------------------------------
vec3 toLab(vec3 c){
  float l = pow(max(0.4122214708*c.r + 0.5363325363*c.g + 0.0514459929*c.b, 0.0), 1.0/3.0);
  float m = pow(max(0.2119034982*c.r + 0.6806995451*c.g + 0.1073969566*c.b, 0.0), 1.0/3.0);
  float s = pow(max(0.0883024619*c.r + 0.2817188376*c.g + 0.6299787005*c.b, 0.0), 1.0/3.0);
  return vec3(0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
              1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
              0.0259040371*l + 0.7827717662*m - 0.8086757660*s);
}
vec3 fromLab(vec3 c){
  float l = c.x + 0.3963377774*c.y + 0.2158037573*c.z;
  float m = c.x - 0.1055613458*c.y - 0.0638541728*c.z;
  float s = c.x - 0.0894841775*c.y - 1.2914855480*c.z;
  l = l*l*l; m = m*m*m; s = s*s*s;
  return vec3( 4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
              -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
              -0.0041960863*l - 0.7034186147*m + 1.7076147010*s);
}
vec3 toSRGB(vec3 c){
  c = clamp(c, 0.0, 1.0);
  return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c));
}

// Hue-shifted ramp, band -1 (ink) .. 4 (glint). The time-of-day grade adds a warm
// tint to the lit bands and a cool one to the shadow bands; lamp light ignores both
// and takes the lamp's colour. "self" colours (windows, fireflies) ignore exposure.
vec3 ramp(vec3 lin, int band, int mode, vec3 lampTint){   // mode 0 normal, 1 self-lit, 2 lamp-lit, 3 steam
  int i = band + 1;
  if (mode == 2) lin *= lampTint * 1.7;               // lamp light multiplies the surface colour
  const float LM[6] = float[6](0.57, 0.72, 0.86, 1.00, 1.065, 1.12);
  const float CM[6] = float[6](0.72, 0.86, 0.96, 1.00, 0.92, 0.82);
  const vec2  TT[6] = vec2[6](vec2(0.012,-0.020), vec2(0.012,-0.018), vec2(0.006,-0.009), vec2(0.0), vec2(0.002, 0.012), vec2(0.003, 0.018));
  vec3 lab = toLab(lin);
  float expo = (mode == 0 || mode == 3) ? uExpo : 1.0;
  lab.x = min(lab.x * LM[i] * expo, 0.98);
  lab.yz = lab.yz * CM[i] * (mode == 0 ? uChroma : 1.0) + TT[i];
  if ((mode == 0 || mode == 2) && uNight > 0.0) {
    // Night vision: colour drains out under moonlight, greens most of all, so fields and foliage read as night, not dark
    // green. Lamp-lit greens keep more colour but lose enough that a warm pool on grass turns ochre rather than lime.
    float green = smoothstep(0.3, 0.85, dot(lab.yz / max(length(lab.yz), 1e-4), vec2(-0.74, 0.67)));
    lab.yz *= 1.0 - uNight * (mode == 0 ? 0.32 + 0.40 * green : 0.45 * green);
  }
  if (mode == 0) lab.yz += mix(uShadeTint, uLitTint, smoothstep(1.0, 3.0, float(band) + 1.0));
  if (mode == 2) { lab.yz *= 1.05; lab.yz += 0.017 * normalize(toLab(lampTint).yz + vec2(1e-4, 0.0)) * min(length(toLab(lampTint).yz) * 8.0, 1.0); }
  return fromLab(lab);
}
vec3 ramp(vec3 lin, int band, int mode){ return ramp(lin, band, mode, vec3(1.0)); }   // lamp tint unused outside mode 2
${_d}

ivec2 clampP(ivec2 q){ return clamp(q, ivec2(0), ivec2(uRes) - 1); }
vec4 A(ivec2 q){ return texelFetch(tAlbedo, clampP(q), 0); }
vec4 N(ivec2 q){ return texelFetch(tNormal, clampP(q), 0); }

#ifdef HIGHLIGHT
// Highlighted objects (PixelObject.highlight): their ids, 0 for an unused slot. The resolved G-buffer keeps each
// pixel's object id in tShadow.r (0: no object). Only this variant of the shader reads it.
uniform vec4 uHighlight;
float objectId(ivec2 q){ return texelFetch(tShadow, clampP(q), 0).r; }
bool highlit(ivec2 q){
  float id = objectId(q);
  return id > 0.5 && any(lessThan(abs(uHighlight - id), vec4(0.5)));
}
// The rim's ink: a pale, self-lit tint of the object's own colour, so it reads at night too and keeps the palette's hues.
vec3 highlightInk(vec3 albedo){
  vec3 lab = toLab(ramp(albedo, 4, 1));
  lab.x = max(lab.x, 0.90); lab.yz *= 0.6;
  return fromLab(lab);
}
#endif

// depth a neighbour at pixel offset o would have if it lay on the plane of (n, d)
float predictDepth(vec3 n, float d, vec2 o){
  float nf = dot(n, uFwd);
  nf = (nf < 0.0 ? -1.0 : 1.0) * max(abs(nf), 0.25);
  return d - (dot(n, uRight) * o.x + dot(n, uUp) * o.y) * uTexel / nf;
}
vec3 worldAt(vec2 pc, float d){
  return uCamPos + uRight * ((pc.x - 0.5 * uRes.x) * uTexel) + uUp * ((pc.y - 0.5 * uRes.y) * uTexel) + uFwd * d;
}

float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y);
}
float cloudField(vec2 p){ return 0.62*vn(p) + 0.38*vn(p*2.3+7.0); }

float sunlight(ivec2 p, vec3 n){
  // ShadowMaterial alpha is occlusion: 0 = exposed, 1 = shadowed.
  float visibility = 1.0 - texelFetch(tShadow, clampP(p), 0).a;
  return max(dot(n, uSun), 0.0) * visibility;
}

// scalar "how lit is this pixel" used for band selection
float shadeAt(ivec2 q){
  vec4 nq = N(q);
  vec3 nn = nq.xyz;
  float s = uAmbient + 0.14 * max(nn.y, 0.0) + 0.55 * uSunI * sunlight(clampP(q), nn);
  if (uClouds == 1 && nn.y > 0.95) {
    vec3 wp = worldAt(vec2(q) + 0.5, nq.w);
    float cl = smoothstep(0.60, 0.66, cloudField(wp.xz * 0.10 + vec2(uTime * 0.028, uTime * 0.011)));
    s -= 0.34 * cl * clamp(uSunI * 1.2, 0.0, 1.0);
  }
  return s;
}

// Is the segment lamp i -> wp blocked? The lamp's distance cube map (see lampShadows.ts) holds the
// nearest solid surface in each direction; 0 means nothing there. Face table matches FACES in lampShadows.ts.
float lampVisible(int i, vec3 wp, vec3 n){
  vec3 v = wp + n * 0.03 - uLamp[i].xyz;          // nudge off the surface against self-shadowing
  vec3 av = abs(v);
  int face; vec3 F, U;
  if (av.x >= av.y && av.x >= av.z) { face = v.x > 0.0 ? 0 : 1; F = vec3(sign(v.x), 0.0, 0.0); U = vec3(0, 1, 0); }
  else if (av.y >= av.z)            { face = v.y > 0.0 ? 2 : 3; F = vec3(0.0, sign(v.y), 0.0); U = vec3(0, 0, 1); }
  else                              { face = v.z > 0.0 ? 4 : 5; F = vec3(0.0, 0.0, sign(v.z)); U = vec3(0, 1, 0); }
  vec3 R = cross(F, U);
  float fw = dot(v, F);
  vec2 uv = clamp(vec2(dot(v, R), dot(v, U)) / fw * 0.5 + 0.5, 0.0, 0.9999);
  int t = i * 6 + face, cols = int(uLampAtlas.x / uLampAtlas.z);
  ivec2 px = ivec2(t % cols, t / cols) * int(uLampAtlas.z) + ivec2(uv * uLampAtlas.z);
  float stored = texelFetch(tLampShadow, px, 0).r;
  float dist = length(v);
  // Slope-scaled bias: a surface seen at a grazing angle spans a long depth range inside one cube texel.
  float cosA = max(dot(n, -v / max(dist, 1e-4)), 0.2);   // capped: at most 0.02 + 0.06 x distance
  float texel = 2.0 * dist / uLampAtlas.z;
  return (stored <= 0.0 || dist < stored + 0.02 + texel * 1.5 / cosA) ? 1.0 : 0.0;
}

// Light from the lit windows: a small pool on the ground, quay or wall below each one, read from the top-down window map.
// A wall reads the map 0.4 m out along its normal (the pools' offset from their pane, see windowLight.ts), on the line
// below its windows rather than at the pool's clipped back edge; a wall facing away from the pools reads nothing. Fades
// out above the window (no light on the roof or the floors above); on a wall the pool fades out within ~1.4 m below it.
vec4 windowAt(vec3 wp, vec3 n){
  vec2 at = wp.xz + n.xz * 0.4, uv = (at - uWindowBounds.xy) / (uWindowBounds.zw - uWindowBounds.xy);
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec4(0.0);
  vec4 w = textureLod(tWindow, uv, 0.0);   // explicit LOD: also called from non-uniform control flow
  float k = max(max(w.r, w.g), w.b);
  if (k < 0.01) return vec4(0.0);
  float below = w.a - wp.y, up = max(n.y, 0.0);   // how far below the (weighted) window height; 1 on the ground, 0 on a wall
  float reach = mix(1.0 - smoothstep(0.5, 1.4, below), 1.0 - smoothstep(2.2, 4.5, below), up);   // a wall pool stays compact
  k *= 0.4 * (1.0 - smoothstep(-0.6, 0.0, -below)) * reach * mix(0.7, 1.0, up) * smoothstep(-0.35, -0.05, n.y);   // no undersides
  // A wall lights only if the window is in front of it, so a wall standing in a pool lights on the side facing
  // the window, not the side facing away. The builder moves the source of a pane set in a facade just outside
  // that facade, so the wall under it passes. The interpolated offset plus the lookup position gives the
  // interpolated source exactly.
  // Only steep receivers are tested: gently sloped ground keeps its whole pool.
  float wall = 1.0 - smoothstep(0.35, 0.75, n.y), side = length(n.xz);
  if (wall > 0.0 && side > 0.01) {
    vec2 src = at + textureLod(tWindowSource, uv, 0.0).rg;
    k *= mix(1.0, smoothstep(0.0, 0.01, dot(src - wp.xz, n.xz / side)), wall);
  }
  return vec4(w.rgb / max(max(w.r, w.g), w.b), k);
}

// Light from the scene's lamps: a coloured falloff pool on walls and ground, blocked by solid geometry.
// Distance below the lamp counts half, so a lamp on a tall post still reaches the ground around it.
// Returns (colour of the strongest lamp, summed strength): one hue per pool keeps the palette small, and
// the ordered dither \`jit\` breaks the border where two pools meet into a pixel pattern.
vec4 lampAt(vec3 wp, vec3 n, float jit){
  vec4 L = vec4(vec3(1.0), 0.0);
  float best = 0.0;
  for (int i = 0; i < MAX_LAMPS; i++) {
    if (i >= uLampCount) break;
    vec3 dv = uLamp[i].xyz - wp; float dist = length(dv);
    float att = 1.0 - clamp(length(dv * vec3(1.0, dv.y > 0.0 ? 0.5 : 1.0, 1.0)) / uLamp[i].w, 0.0, 1.0);
    if (att <= 0.0) continue;
    float ndl = dot(n, dv / max(dist, 1e-3));         // surfaces facing away from the lamp get nothing
    float k = ndl > 0.0 ? att * att * (0.3 + 0.7 * ndl) : 0.0;
    if (k < 0.02) continue;
    k *= lampVisible(i, wp, n);
    vec3 c = uLampCol[i];
    float score = k * (1.0 + jit * (fract(float(i) * 0.618034) * 2.0 - 1.0));   // per-lamp phase so the winner varies
    if (score > best) { best = score; L.rgb = c / max(max(c.r, c.g), max(c.b, 1e-3)); }
    L.a += k;
  }
  vec4 W = windowAt(wp, n);
  if (W.a * (1.0 + jit * 0.3) > best) L.rgb = W.rgb;
  L.a += W.a;
  L.a *= uLampOn;
  return L;
}

// Sparse screen-space contact occlusion. Plane-relative depth rejects coplanar
// tiles; a world-distance bound keeps screen taps from shadowing unrelated surfaces
// far along the view ray (e.g. a parapet coping across a curved bridge deck).
float contactAt(ivec2 p, vec3 n, float d){
  if (uContact == 0) return 0.0;
  const vec2 taps[12] = vec2[12](
    vec2(1,0), vec2(-1,0), vec2(0,1), vec2(0,-1),
    vec2(0.707,0.707), vec2(-0.707,0.707), vec2(0.707,-0.707), vec2(-0.707,-0.707),
    vec2(0.924,0.383), vec2(-0.383,0.924), vec2(-0.924,-0.383), vec2(0.383,-0.924));
  float occ = 0.0;
  for (int i = 0; i < 12; i++) {
    float radius = i < 4 ? 0.10 : i < 8 ? 0.24 : 0.43;
    ivec2 offset = ivec2(round(taps[i] * max(radius / uTexel, 1.0)));
    ivec2 q = p + offset;
    if (any(lessThan(q, ivec2(0))) || any(greaterThanEqual(q, ivec2(uRes)))) continue;
    vec4 aq = A(q), nq = N(q);
    if (aq.a < 0.5 || !solid(flagOf(aq.a))) continue;
    vec3 separation = (uRight * float(offset.x) + uUp * float(offset.y)) * uTexel + uFwd * (nq.w - d);
    float rangeWeight = 1.0 - smoothstep(0.43, 0.55, length(separation));
    float delta = predictDepth(n, d, vec2(offset)) - nq.w;
    occ += rangeWeight * smoothstep(0.025, 0.09, delta) * (1.0 - smoothstep(0.5, 1.35, delta));
  }
  return occ / 12.0;
}

// Final per-pixel grade: only the very corners of the frame step down in brightness (two
// hard rings, with a one-pixel dither on their edges). There is deliberately no depth
// haze: a constant-depth step shows up as a seam across flat ground. Applied once, to the final image: when a fluid pass
// follows, pass 0 leaves it out and pass 1 applies it after compositing.
float vignetteRing(ivec2 p){
  vec2 q = (gl_FragCoord.xy / uRes - 0.5) * vec2(1.15, 1.0);
  float vg = length(q) * 1.35 + (bayer4(p) - 0.5) * 0.05;
  return vg > 0.98 ? 2.0 : vg > 0.80 ? 1.0 : 0.0;
}
vec3 finish(vec3 lin, ivec2 p){
  if (uVignette == 0) return lin;
  vec3 lab = toLab(lin);
  lab.x *= 1.0 - 0.055 * vignetteRing(p);
  return fromLab(lab);
}
// A finished pixel, graded unless it is sky or a spark. With a fluid pass to follow, it stays linear and unclipped, and
// alpha says whether pass 1 grades it (see passThrough), so the grade still sees the true colour.
vec4 emitColor(vec3 lin, ivec2 p, bool graded){
  if (uDeferGrade == 1) return vec4(lin, graded ? 1.0 : 0.5);
  return vec4(toSRGB(graded ? finish(lin, p) : lin), 1.0);
}

${kd(e)}

void main(){
  ivec2 p = ivec2(gl_FragCoord.xy);
  // Pass 1 draws the fluids over pass 0's image (shaders/water.ts); pass 0 draws everything else, and the bed under them.
  if (uPass == 1) {
    if (fluidAt(p)) water(p);
    else outColor = passThrough(p);
    return;
  }
  vec4 a = A(p);
  bool sky = a.a < 0.5;
  int fl = sky ? -1 : flagOf(a.a);
  vec4 nd = N(p);
  vec3 n = nd.xyz; float d = sky ? 1e4 : nd.w;
  const ivec2 OFF[4] = ivec2[4](ivec2(1,0), ivec2(-1,0), ivec2(0,1), ivec2(0,-1));
  float THR = max(0.10, uTexel * 3.0);

#ifdef HIGHLIGHT
  // ---- 0. highlight rim: one pixel all round the visible part of a highlighted object --------------------------
  // Outside it against sky, anything clearly behind it, and scenery level with it that runs on behind it (the ground at
  // its feet, so a seedling a pixel or two big still shows); inside it against anything clearly nearer, scenery level with
  // it that passes in front of it (a wall just ahead), and any other object level with it (a touching copy of itself). So
  // the rim never paints an occluder or another object. Scenery's side is told by extending its plane to the object's
  // pixel: the ground runs on behind an object standing on it. The two tests mirror each other, so a pair of pixels never
  // gets a rim on both sides.
  bool lifted = highlit(p);
  for (int i = 0; i < 4; i++) {
    ivec2 q = p + OFF[i];
    if (highlit(q) == lifted) continue;
    vec4 aq = A(q), nq = N(q);
    bool rim = lifted ? aq.a > 0.5 && (nq.w < d - THR || (nq.w <= d + THR &&                                  // inner
                          (objectId(q) > 0.5 || predictDepth(nq.xyz, nq.w, -vec2(OFF[i])) < d - 0.5 * uTexel)))
                      : sky || d > nq.w + THR || (d >= nq.w - THR &&                                          // outer
                          objectId(p) < 0.5 && predictDepth(n, d, vec2(OFF[i])) >= nq.w - 0.5 * uTexel);
    if (rim) { outColor = emitColor(highlightInk(lifted ? a.rgb : aq.rgb), p, true); return; }
  }
#endif

  // ---- 1. silhouette outline: drawn on the FAR pixel, inked from the near object ----
  float bestD = 1e9; ivec2 bestQ = p; bool sil = false;
  if (uOutline == 1) {
    for (int i = 0; i < 4; i++) {
      ivec2 q = p + OFF[i];
      vec4 aq = A(q);
      if (aq.a < 0.5 || !inkSource(flagOf(aq.a))) continue;     // sky, or decor that never casts ink
      float dn = N(q).w;
      float dp = sky ? 1e4 : predictDepth(n, d, vec2(OFF[i]));
      if (dn < dp - THR && dn < bestD) { bestD = dn; bestQ = q; sil = true; }
    }
  }
  if (sil) {
    vec4 nq = A(bestQ);
    vec3 nearColor = nq.rgb;
    int nf = flagOf(nq.a);
    // Softer botanical silhouettes; solid architecture keeps its crisp ink.
    bool foliage = nearColor.g > nearColor.r * 1.25 && nearColor.g > nearColor.b * 1.2;
    vec3 ink = ramp(nearColor, nf == F_STEAM ? 1 : foliage ? 0 : -1, nf == F_STEAM ? 3 : 0);
    outColor = emitColor(ink, p, true);
    return;
  }

  // ---- 2. sky: dithered banded gradient --------------------------------------------
  if (sky) {
    float t = 1.0 - gl_FragCoord.y / uRes.y;
    float v = t * 6.0 + (uDither == 1 ? (bayer4(p) - 0.5) * 0.55 : 0.0);
    float b = clamp(floor(v), 0.0, 5.0) / 5.0;
    outColor = emitColor(mix(uSkyTop, uSkyBot, b), p, false);
    return;
  }

  vec3 wp = worldAt(vec2(p) + 0.5, d);

  // ---- 3. fireflies: tiny self-lit sparks -------------------------------------------
  if (fl == F_GLOW) { outColor = emitColor(ramp(a.rgb, 4, 1), p, false); return; }

  // ---- 4. banded lighting with gradient-aware ordered dithering ---------------------
  float ndl = dot(n, uSun);
  float s = shadeAt(p);
  float contact = contactAt(p, n, d);

  // Dither only where the light really forms a smooth gradient (round shapes, bevels,
  // cloud edges). Flat surfaces and hard shadow edges stay clean, as an artist would.
  // Neighbours on the same plane with the same flag: only across these can a light gradient be smooth. The sun gradient
  // also asks for the same colour.
  bool plane[4];
  float g = 0.0;
  for (int i = 0; i < 4; i++) {
    ivec2 q = p + OFF[i];
    vec4 aq = A(q);
    plane[i] = flagOf(aq.a) == fl && dot(n, N(q).xyz) >= 0.94 && abs(N(q).w - predictDepth(n, d, vec2(OFF[i]))) <= THR;
    if (plane[i] && distance(aq.rgb, a.rgb) <= 0.01) g = max(g, abs(shadeAt(q) - s));
  }
  float dw = (uDither == 1 && fl != F_DECOR && fl != F_GROOVED && g > 0.003 && g < 0.075) ? 0.045 : 0.0;
  float sd = s + (bayer4(p) - 0.5) * dw;
  int band = sd < 0.32 ? 0 : sd < 0.52 ? 1 : sd < 0.82 ? 2 : 3;
  if (fl != F_GROOVED) {                   // a flat panel stays clean: no contact speckle
    if (contact > 0.13) band = max(0, band - 1);
    if (contact > 0.40) band = max(0, band - 1);
  }

  int mode = 0;
  if (fl == F_EMISSIVE) { band = 3; mode = 1; }
  if (fl == F_STEAM) { band = ndl < 0.2 ? 1 : ndl < 0.65 ? 2 : 3; mode = 3; }

  // ---- 5. creases: convex edges catch light, concave ones sink into shadow ---------
  if (uOutline == 1 && solid(fl)) {
    int hi = 0, lo = 0;
    for (int i = 0; i < 4; i++) {
      ivec2 q = p + OFF[i];
      vec4 aq = A(q);
      if (aq.a < 0.5 || !solid(flagOf(aq.a))) continue;
      vec4 nq = N(q);
      // Ignore bevel facets and foliage: outlining every little normal change
      // turns roof tiles and round leaves into disconnected confetti.
      if (dot(n, nq.xyz) > 0.55 || distance(a.rgb, aq.rgb) < 0.025) continue;
      float dp = predictDepth(n, d, vec2(OFF[i]));
      if (abs(nq.w - dp) > THR) continue;
      float dd = nq.w - dp;
      float ndlq = dot(nq.xyz, uSun);
      if (dd > 0.006 && ndl > ndlq) hi++;
      if (dd < -0.006 && ndl < ndlq) lo++;
    }
    if (lo > 0) band = max(band - 1, 0) - (band == 0 ? 1 : 0);
    else if (hi > 0) band = min(band + 1, 4);
  }

  // ---- 6. lamp pools: warm light that survives the cool night grade -----------------
  vec3 lampTint = vec3(1.0);
  if (uLampOn > 0.01 && fl != F_EMISSIVE) {
    vec4 L = lampAt(wp, n, uDither == 1 ? (bayer4(p) - 0.5) * 0.6 : 0.0);
    float raw = L.a, h = 0.0;
    if (uGlow == 1) {                       // halo around lit glass, in the glass colour
      float near = 0.0, spark = 0.0;
      vec3 glass = vec3(0.0);
      for (int i = 0; i < 8; i++) {
        float ang = float(i) * 0.785398;
        vec2 dir = vec2(cos(ang), sin(ang));
        vec4 aq = A(p + ivec2(round(dir * 3.0)));
        if (aq.a > 0.5 && flagOf(aq.a) == F_EMISSIVE) { near += 0.125; glass += aq.rgb; }
        vec4 ab = A(p + ivec2(round(dir * 2.0)));
        if (ab.a > 0.5 && flagOf(ab.a) == F_GLOW) { spark = 0.45; glass += ab.rgb * 4.0; }
      }
      h = 0.7 * near * uLampOn + spark;
      if (h > L.a) L.rgb = glass / max(max(glass.r, glass.g), max(glass.b, 1e-3));
      L.a += h;
    }
    // Dither the band borders only where the pool is a smooth gradient on one plane, as for sunlight: a hard lamp-shadow
    // or window-map edge stays crisp. The test costs four more lamp lookups, so only pixels near a band border pay for it.
    // The glass halo is a stylised screen-space glow and keeps its dithered rings. Unlike sunlight, flat DECOR ground (lawns,
    // fields) dithers too: its pools are as smooth as any, and the plane test keeps tufts and blades clean.
    bool dl = uDither == 1 && fl != F_GROOVED;
    if (dl && h <= 0.0) {
      float t = L.a, edge = min(min(abs(t - 0.12), abs(t - 0.30)), abs(t - 0.60)), gl = 0.0;
      dl = edge < 0.07;
      for (int i = 0; i < 4; i++) {
        if (!dl || !plane[i]) continue;
        ivec2 q = p + OFF[i];
        gl = max(gl, abs(lampAt(worldAt(vec2(q) + 0.5, N(q).w), n, 0.0).a - raw));
      }
      dl = dl && gl > 0.003 && gl < 0.14;
    }
    float lj = L.a + (dl ? (bayer4(p) - 0.5) * 0.14 : 0.0);
    int lb = lj > 0.60 ? 3 : lj > 0.30 ? 2 : lj > 0.12 ? 1 : 0;
    if (lb > 0 && fl != F_STEAM) {
      band = max(band, lb); mode = 2;
      lampTint = L.rgb;
    }
  }

  // Grooves (door planks): fixed world positions, but always exactly one screen pixel wide, so
  // they cannot pop in and out the way a sub-pixel-wide mesh does as the camera moves.
  if (fl == F_GROOVED && wp.y > uGrooveY.x && wp.y < uGrooveY.y) {
    float across = max(abs(dot(uRight, uGrooveAxis)), 0.35);   // groove axis -> screen x
    float along = dot(wp, uGrooveAxis), nearest = 9.0;
    for (int k = 0; k < MAX_GROOVES; k++) {
      if (k >= uGrooveCount) break;
      nearest = min(nearest, abs(along - uGrooves[k]));
    }
    if (nearest * across < 0.5 * uTexel) band = -1;
  }

#ifdef HIGHLIGHT
  if (lifted && band >= 0) band = min(band + 1, 4);   // and its surfaces one band brighter (ink lines stay ink)
#endif
  vec3 col = ramp(a.rgb, band, mode, lampTint);
  outColor = emitColor(col, p, true);
}`,jd=`
precision highp float;
uniform sampler2D tImage; uniform sampler2D tAlbedo; uniform sampler2D tNormal; uniform sampler2D tShadow; uniform sampler2D tFluid; uniform vec2 uRes; uniform int uOn;
out vec4 outColor;
vec3 F(ivec2 q){ return texelFetch(tImage, clamp(q, ivec2(0), ivec2(uRes) - 1), 0).rgb; }
bool same(vec3 a, vec3 b){ return all(lessThan(abs(a - b), vec3(0.002))); }
#ifdef HIGHLIGHT
// As in post.ts: the highlight rim is never "noise".
uniform vec4 uHighlight; uniform float uTexel; uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uFwd;
float objectId(ivec2 q){ return texelFetch(tShadow, q, 0).r; }
bool highlit(ivec2 q){
  float id = objectId(q);
  return id > 0.5 && any(lessThan(abs(uHighlight - id), vec4(0.5)));
}
float predictDepth(vec3 n, float d, vec2 o){   // as in post.ts
  float nf = dot(n, uFwd);
  nf = (nf < 0.0 ? -1.0 : 1.0) * max(abs(nf), 0.25);
  return d - (dot(n, uRight) * o.x + dot(n, uUp) * o.y) * uTexel / nf;
}
// Does post.ts step 0 draw the rim here, inside or outside the object? Mirrors that test (p is never sky: only
// interior pixels ask), so the rest of the object, lifted a band, and the pixels of other objects level with it are
// cleaned up as usual.
bool rimmed(ivec2 p, vec3 n, float d){
  bool lifted = highlit(p);
  float THR = max(0.10, uTexel * 3.0);
  const ivec2 offsets[4] = ivec2[4](ivec2(1,0), ivec2(-1,0), ivec2(0,1), ivec2(0,-1));
  for (int k = 0; k < 4; k++) {
    ivec2 q = clamp(p + offsets[k], ivec2(0), ivec2(uRes) - 1);
    if (highlit(q) == lifted) continue;
    vec4 nq = texelFetch(tNormal, q, 0);
    if (lifted ? texelFetch(tAlbedo, q, 0).a > 0.5 && (nq.w < d - THR || (nq.w <= d + THR &&
                   (objectId(q) > 0.5 || predictDepth(nq.xyz, nq.w, -vec2(offsets[k])) < d - 0.5 * uTexel)))
               : d > nq.w + THR || (d >= nq.w - THR &&
                   objectId(p) < 0.5 && predictDepth(n, d, vec2(offsets[k])) >= nq.w - 0.5 * uTexel)) return true;
  }
  return false;
}
#endif
void main(){
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec3 c = F(p);
  if (uOn == 1) {
    vec3 n[4] = vec3[4](F(p + ivec2(1,0)), F(p + ivec2(-1,0)), F(p + ivec2(0,1)), F(p + ivec2(0,-1)));
    vec4 a = texelFetch(tAlbedo, p, 0);
    vec4 nd = texelFetch(tNormal, p, 0);
    bool interior = a.a > 0.5 && a.a < 2.5 && texelFetch(tFluid, p, 0).a < 0.5;   // not under a fluid
    const ivec2 offsets[4] = ivec2[4](ivec2(1,0), ivec2(-1,0), ivec2(0,1), ivec2(0,-1));
    for (int k = 0; k < 4; k++) {
      ivec2 q = clamp(p + offsets[k], ivec2(0), ivec2(uRes) - 1);
      vec4 aq = texelFetch(tAlbedo, q, 0), nq = texelFetch(tNormal, q, 0);
      if (floor(a.a + 0.5) != floor(aq.a + 0.5) || distance(a.rgb, aq.rgb) > 0.01 || dot(nd.xyz, nq.xyz) < 0.97) interior = false;
    }
#ifdef HIGHLIGHT
    if (interior && rimmed(p, nd.xyz, nd.w)) interior = false;
#endif
    for (int i = 0; i < 4 && interior; i++) {
      int cnt = 0;
      for (int j = 0; j < 4; j++) if (same(n[i], n[j])) cnt++;
      if (cnt >= 3 && !same(n[i], c)) { c = n[i]; break; }
    }
  }
  outColor = vec4(c, 1.0);
}`,Md=`
precision highp float; precision highp int;
uniform sampler2D tAlbedo; uniform sampler2D tNormal; uniform sampler2D tShadow; uniform sampler2D tObjectId;
uniform int uS; uniform int uPolicy; uniform float uTexel;   // policy 0 majority, k >= 1 near-priority with k + 1 samples
uniform int uThinOnly;                                       // 1: near-priority only for thin-marked surfaces
uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uFwd;
layout(location = 0) out vec4 oAlbedo;
layout(location = 1) out vec4 oNormal;
layout(location = 2) out vec4 oShadow;

// 3 x 3 sub-samples, nearest the pixel centre first: centre, edges, corners.
const ivec2 ORD[9] = ivec2[9](ivec2(1,1), ivec2(0,1), ivec2(2,1), ivec2(1,0), ivec2(1,2), ivec2(0,0), ivec2(2,0), ivec2(0,2), ivec2(2,2));

// Depth the plane (n, d) has at an offset o, in art pixels. Unlike predictDepth in post.ts (a neighbourhood
// heuristic that clamps the slope), this keeps the true slope: grouping and the emitted depth must stay exact
// on surfaces seen at a grazing angle.
float planeDepth(vec3 n, float d, vec2 o){
  float nf = dot(n, uFwd);
  nf = (nf < 0.0 ? -1.0 : 1.0) * max(abs(nf), 1e-3);
  return d - (dot(n, uRight) * o.x + dot(n, uUp) * o.y) * uTexel / nf;
}
// Sub-sample position relative to the art-pixel centre, in art pixels.
vec2 offsetOf(int i){ return (vec2(ORD[i]) - 1.0) / 3.0; }

vec4 a[9]; vec4 nd[9];
float margin(){ return max(0.10, uTexel * 3.0); }
bool sameSurface(int i, int j){
  if (a[i].a < 0.5 || a[j].a < 0.5) return a[i].a < 0.5 && a[j].a < 0.5;   // sky matches only sky
  if (abs(a[i].a - a[j].a) > 0.5 || any(greaterThan(abs(a[i].rgb - a[j].rgb), vec3(1e-4)))) return false;
  // Same plane within prediction precision (sub-texel offsets, smooth normals), far tighter than the silhouette
  // margin: two same-colour slabs a centimetre apart are different surfaces.
  return abs(nd[j].w - planeDepth(nd[i].xyz, nd[i].w, offsetOf(j) - offsetOf(i))) < 0.004 + 0.1 * uTexel;
}

void emit(ivec2 q, int i){
  // A near edge-on plane would extrapolate far past where the surface ends: cap the move at two silhouette margins
  // (exact down to |n.fwd| ~ 0.1 for a corner sample at any zoom).
  float m = 2.0 * margin();
  float dc = clamp(planeDepth(nd[i].xyz, nd[i].w, -offsetOf(i)), nd[i].w - m, nd[i].w + m);
  oAlbedo = a[i];
  oNormal = vec4(nd[i].xyz, a[i].a < 0.5 ? nd[i].w : dc);
  // Carry the representative's id without changing surface grouping or the shadow alpha used by post/water.
  oShadow = vec4(texelFetch(tObjectId, q, 0).r, 0.0, 0.0, texelFetch(tShadow, q, 0).a);
}

void main(){
  ivec2 p = ivec2(gl_FragCoord.xy);
  if (uS == 1) {
    oAlbedo = texelFetch(tAlbedo, p, 0); oNormal = texelFetch(tNormal, p, 0);
    oShadow = vec4(texelFetch(tObjectId, p, 0).r, 0.0, 0.0, texelFetch(tShadow, p, 0).a);
    return;
  }
  ivec2 base = p * 3;
  float d[9];
  for (int i = 0; i < 9; i++) {
    a[i] = texelFetch(tAlbedo, base + ORD[i], 0);
    nd[i] = texelFetch(tNormal, base + ORD[i], 0);
    d[i] = a[i].a < 0.5 ? 1e9 : nd[i].w;
  }
  // Per key, its representative is the first sample in ORD order (nearest the centre).
  int cnt[9]; float near[9]; int rep[9];
  for (int i = 0; i < 9; i++) {
    rep[i] = i; cnt[i] = 0; near[i] = 1e9;
    for (int j = 0; j < 9; j++) if (sameSurface(i, j)) {
      cnt[i]++; near[i] = min(near[i], d[j]);
      if (j < rep[i]) rep[i] = j;
    }
  }
  // A: majority; ties go to the nearer surface, then to the one nearer the centre.
  int best = 0;
  for (int i = 1; i < 9; i++)
    if (cnt[i] > cnt[best] || (cnt[i] == cnt[best] && near[i] < near[best] - 1e-4)) best = i;
  // B: a surface clearly in front of the majority's plane wins with uPolicy + 1 samples, so thin things stay visible.
  if (uPolicy >= 1) {
    int m = rep[best], fg = best;
    for (int i = 0; i < 9; i++) {
      if (cnt[i] < uPolicy + 1 || i != rep[i]) continue;
      if (uThinOnly == 1 && fract(a[i].a) < 0.1) continue;
      float behind = a[m].a < 0.5 ? 1e9 : planeDepth(nd[m].xyz, nd[m].w, offsetOf(i) - offsetOf(m));
      if (d[i] < behind - margin() && d[i] < d[rep[fg]]) fg = i;
    }
    best = fg;
  }
  int w = rep[best];
  emit(base + ORD[w], w);
}`,Nd=12,Pd=32;function Fd(e,t){let n=Math.max(e,1)*6;for(let e=256;e>=Pd;e/=2){let r=Math.min(Nd,Math.floor(t/e),n),i=Math.ceil(n/r);if(r>=1&&i*e<=t)return{tile:e,cols:r,width:r*e,height:i*e}}throw Error(`lamp shadows: ${e} lamps do not fit a ${t}px texture even at ${Pd}px faces`)}var Id=[[[1,0,0],[0,1,0]],[[-1,0,0],[0,1,0]],[[0,1,0],[0,0,1]],[[0,-1,0],[0,0,1]],[[0,0,1],[0,1,0]],[[0,0,-1],[0,1,0]]],Ld=`
in float aFlag;
out vec3 vW; out float vF;
void main(){ vW = position; vF = aFlag; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`,Rd=`
precision highp float;
uniform vec3 uLamp; uniform float uClearance;
in vec3 vW; in float vF;
out vec4 outDist;
void main(){
  int f = int(floor(vF + 0.5));
  float d = distance(vW, uLamp);
  if ((f != 0 && f != 1 && f != 6) || d < uClearance) discard;
  outDist = vec4(d);
}`;function zd(e){let t=e.getAttribute(`position`),n=e.getAttribute(`aFlag`),r=e.index,i=[],a=r?.count??t.count,o=Math.max(0,e.drawRange.start),s=Math.min(a,e.drawRange.start+e.drawRange.count);for(let e=o;e+2<s;e+=3){let t=r?r.getX(e):e,a=r?r.getX(e+1):e+1,o=r?r.getX(e+2):e+2,s=n.getX(t),c=Math.floor(s+.5);(n.getX(a)!==s||n.getX(o)!==s||c===0||c===1||c===6)&&i.push(t,a,o)}let c=new Fr;return c.setAttribute(`position`,t),c.setAttribute(`aFlag`,n),c.setIndex(i),c}var Bd=class{lamps;occluderTriangles;occluders;target;size=new B;tile;cols;rendered=!1;constructor(e,t,n){this.lamps=e;let r=Fd(e.length,n);r.tile<256&&console.warn(`lamp shadows: ${e.length} lamps need ${r.tile}px faces to fit this device's ${n}px limit`),this.tile=r.tile,this.cols=r.cols,this.occluders=e.length?zd(t):new Fr().setIndex([]),this.occluderTriangles=this.occluders.index.count/3,this.size.set(r.width,r.height),this.target=new Wt(this.size.x,this.size.y,{type:g,format:ee,minFilter:i,magFilter:i,depthBuffer:!0,generateMipmaps:!1})}render(e){if(this.rendered)return;this.rendered=!0;let t=new ii({vertexShader:Ld,fragmentShader:Rd,glslVersion:He,side:2,uniforms:{uLamp:{value:new V},uClearance:{value:0}}}),n=new vi,r=new qr(this.occluders,t);r.frustumCulled=!1,n.add(r);let i=new li(90,1,.02,200),a=e.getClearColor(new U),o=e.getClearAlpha(),s=e.autoClear;e.setRenderTarget(this.target),e.setClearColor(0,0),e.clear(),e.autoClear=!1,this.lamps.forEach((r,a)=>{t.uniforms.uLamp.value.copy(r.position),t.uniforms.uClearance.value=r.clearance??.45,Id.forEach(([t,o],s)=>{let c=a*6+s,l=c%this.cols*this.tile,u=Math.floor(c/this.cols)*this.tile;i.position.copy(r.position),i.up.set(...o),i.lookAt(r.position.clone().add(new V(...t))),i.updateMatrixWorld(),this.target.viewport.set(l,u,this.tile,this.tile),e.setRenderTarget(this.target),e.render(n,i)})}),e.autoClear=s,this.target.viewport.set(0,0,this.size.x,this.size.y),e.setRenderTarget(null),e.setClearColor(a,o),t.dispose()}dispose(){this.target.dispose(),this.occluders.deleteAttribute(`position`),this.occluders.deleteAttribute(`aFlag`),this.occluders.dispose()}},Vd=.12,Hd=1024,Ud=.4,Wd=(e,t,n)=>{let r=gt.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Gd(e,t){let n=e.getAttribute(`position`),r=e.getAttribute(`normal`),i=e.getAttribute(`aFlag`),a=e.getAttribute(`aColor`),o=e.index,c=o?.count??n?.count??0,l=e=>o?o.getX(e):e,u=new V,d=new V,f=new V,p=new V,m=new V,h=new V,g=[],v=new Map,y=e=>{let t=e;for(;g[t].parent!==t;)t=g[t].parent;for(;g[e].parent!==e;){let n=g[e].parent;g[e].parent=t,e=n}return t};if(n&&r&&i&&a)for(let e=0;e+2<c;e+=3){let t=[l(e),l(e+1),l(e+2)];if(t.some(e=>Math.round(i.getX(e))!==Zu.EMISSIVE))continue;u.fromBufferAttribute(n,t[0]),d.fromBufferAttribute(n,t[1]),f.fromBufferAttribute(n,t[2]),h.copy(p.subVectors(d,u).cross(m.subVectors(f,u)));let r=h.length()*.5;if(r<1e-7||(h.normalize(),Math.abs(h.y)>.35))continue;let o=[a.getX(t[0]),a.getY(t[0]),a.getZ(t[0])];if(Math.max(...o)<.08)continue;let s=u.clone().add(d).add(f).multiplyScalar(1/3),c=g.length;g.push({vertices:t,center:s,normal:h.clone(),color:o,area:r,parent:c});let _=[h.x,h.y,h.z].map(e=>Math.round(e*100)).join(`,`)+`:`+o.map(e=>Math.round(e*1e3)).join(`,`);for(let e of[u,d,f]){let t=_+`:`+[e.x,e.y,e.z].map(e=>Math.round(e*1e3)).join(`,`),n=v.get(t);n===void 0?v.set(t,c):g[y(c)].parent=y(n)}}let b=new Map;for(let e=0;e<g.length;e++){let t=y(e),n=b.get(t);n?n.push(e):b.set(t,[e])}let x=[];for(let e of b.values()){let r=g[e[0]],i=new V,a=[0,0,0],o=0,s=1/0,c=-1/0,l=1/0,u=-1/0;for(let t of e){let e=g[t];o+=e.area,i.addScaledVector(e.center,e.area);for(let t=0;t<3;t++)a[t]+=e.color[t]*e.area;for(let t of e.vertices){let e=n.getY(t),i=n.getX(t)*r.normal.z-n.getZ(t)*r.normal.x;s=Math.min(s,e),c=Math.max(c,e),l=Math.min(l,i),u=Math.max(u,i)}}if(o<.07||c-s<.2||u-l<.18)continue;i.multiplyScalar(1/o);for(let e=0;e<3;e++)a[e]/=o;if(t.some(e=>i.distanceTo(e.position)<(e.clearance??.45)+.12))continue;let d=[g[e[0]].center,g[e[e.length-1]].center],f=new V(r.normal.z,0,-r.normal.x),p=f.length();f.normalize();let m=i.x*r.normal.z-i.z*r.normal.x,h=[.06,.2,.5,.9].flatMap(e=>[l-e,u+e].map(e=>i.clone().addScaledVector(f,(e-m)/p)));x.push({center:i,source:i.clone(),normal:r.normal,color:a,area:o,probes:d,facadeProbes:h})}let S=new Map,C=(e,t)=>`${Math.floor(e)},${Math.floor(t)}`;for(let e of x)for(let t of[...e.probes,...e.facadeProbes]){let n=t.clone().addScaledVector(e.normal,-.06),r=t.clone().addScaledVector(e.normal,.65);for(let e=Math.floor(Math.min(n.x,r.x));e<=Math.floor(Math.max(n.x,r.x));e++)for(let t=Math.floor(Math.min(n.z,r.z));t<=Math.floor(Math.max(n.z,r.z));t++)S.set(`${e},${t}`,[])}if(S.size)for(let e=0;e+2<c;e+=3){let t=l(e),r=l(e+1),a=l(e+2),o=Math.round(i.getX(t));if(o!==Zu.NORMAL&&o!==Zu.GROOVED)continue;let s=Math.floor(Math.min(n.getX(t),n.getX(r),n.getX(a))),c=Math.floor(Math.max(n.getX(t),n.getX(r),n.getX(a))),u=Math.floor(Math.min(n.getZ(t),n.getZ(r),n.getZ(a))),d=Math.floor(Math.max(n.getZ(t),n.getZ(r),n.getZ(a)));for(let t=s;t<=c;t++)for(let n=u;n<=d;n++)S.get(`${t},${n}`)?.push(e)}let w=new V,E=new bn,D=x.filter(e=>e.probes.some(t=>{E.set(t.clone().addScaledVector(e.normal,.015),e.normal);let r=t.clone().addScaledVector(e.normal,.65),i=new Set;for(let e=Math.floor(Math.min(t.x,r.x));e<=Math.floor(Math.max(t.x,r.x));e++)for(let n=Math.floor(Math.min(t.z,r.z));n<=Math.floor(Math.max(t.z,r.z));n++)for(let t of S.get(C(e,n))??[])i.add(t);for(let e of i)if(u.fromBufferAttribute(n,l(e)),d.fromBufferAttribute(n,l(e+1)),f.fromBufferAttribute(n,l(e+2)),E.intersectTriangle(u,d,f,!1,w)&&w.distanceTo(E.origin)<.635)return!1;return!0})).map(({center:e,source:t,normal:r,color:i,area:a,facadeProbes:o})=>{let s=o.map(e=>{E.set(e.clone().addScaledVector(r,-.06),r);let t=e.clone().addScaledVector(r,.35),i=new Set;for(let e=Math.floor(Math.min(E.origin.x,t.x));e<=Math.floor(Math.max(E.origin.x,t.x));e++)for(let n=Math.floor(Math.min(E.origin.z,t.z));n<=Math.floor(Math.max(E.origin.z,t.z));n++)for(let t of S.get(C(e,n))??[])i.add(t);let a=1/0;for(let t of i){if(u.fromBufferAttribute(n,l(t)),d.fromBufferAttribute(n,l(t+1)),f.fromBufferAttribute(n,l(t+2)),h.copy(p.subVectors(d,u).cross(m.subVectors(f,u))).normalize(),h.dot(r)<.94||!E.intersectTriangle(u,d,f,!1,w))continue;let i=w.clone().sub(e).dot(r);i>=-.05&&i<=.35&&(a=Math.min(a,i))}return a});for(let e=0;e<s.length;e+=2)if(Number.isFinite(s[e])&&Number.isFinite(s[e+1])&&Math.abs(s[e]-s[e+1])<.03){t.addScaledVector(r,Math.max(0,Math.max(s[e],s[e+1])+.02));break}return{center:e,source:t,normal:r,color:i,area:a}}),ee=e=>gt.clamp(1+Math.sqrt(e.area)*.6,1.2,2.1),O=1/0,A=1/0,te=-1/0,j=-1/0;for(let e of D){let t=ee(e),n=e.center.x+e.normal.x*Ud,r=e.center.z+e.normal.z*Ud;O=Math.min(O,n-t-Vd),A=Math.min(A,r-t-Vd),te=Math.max(te,n+t+Vd),j=Math.max(j,r+t+Vd)}D.length||(O=A=0,te=j=1);let M=D.length?Math.min(Hd,Math.ceil((te-O)/Vd)):1,N=D.length?Math.min(Hd,Math.ceil((j-A)/Vd)):1,P=(te-O)/M,ne=(j-A)/N,re=new Float32Array(M*N*4),ie=new Float32Array(M*N),ae=new Float32Array(M*N*2);for(let e of D){let t=ee(e),n=e.center.x+e.normal.x*Ud,r=e.center.z+e.normal.z*Ud,i=Math.max(...e.color),a=Math.min(.8,.35+.28*Math.sqrt(e.area));for(let o=Math.max(0,Math.floor((r-t-A)/ne));o<Math.min(N,Math.ceil((r+t-A)/ne));o++)for(let s=Math.max(0,Math.floor((n-t-O)/P));s<Math.min(M,Math.ceil((n+t-O)/P));s++){let c=O+(s+.5)*P,l=A+(o+.5)*ne,u=Math.hypot(c-n,l-r)/t;if(u>=1)continue;let d=(c-e.center.x)*e.normal.x+(l-e.center.z)*e.normal.z,f=a*(1-Wd(0,1,u))*Wd(-.08,.18,d),p=o*M+s,m=p*4;for(let t=0;t<3;t++)re[m+t]+=f*e.color[t]/i;re[m+3]+=f*e.center.y,ie[p]+=f,ae[p*2]+=f*(e.source.x-c),ae[p*2+1]+=f*(e.source.z-l)}}let oe=new Uint16Array(re.length),se=new Uint16Array(ae.length);for(let e=0;e<ie.length;e++){let t=e*4,n=Math.max(1,re[t],re[t+1],re[t+2]);for(let e=0;e<3;e++)oe[t+e]=br.toHalfFloat(re[t+e]/n);oe[t+3]=br.toHalfFloat(ie[e]>0?re[t+3]/ie[e]:0);for(let t=0;t<2;t++)se[e*2+t]=br.toHalfFloat(ie[e]>0?ae[e*2+t]/ie[e]:0)}for(let e=0;e<N;e++)for(let t=0;t<M;t++){let n=e*M+t;if(ie[n]>0)continue;let r=-1,i=1/0,a=0;for(let n=-1;n<=1;n++)for(let o=-1;o<=1;o++){let s=t+o,c=e+n;if(s<0||s>=M||c<0||c>=N)continue;let l=c*M+s,u=o*o+n*n;ie[l]>0&&(u<i||u===i&&ie[l]>a)&&(r=l,i=u,a=ie[l])}r>=0&&(oe[n*4+3]=oe[r*4+3],se[n*2]=br.toHalfFloat(ae[r*2]/ie[r]+(r%M-t)*P),se[n*2+1]=br.toHalfFloat(ae[r*2+1]/ie[r]+(Math.floor(r/M)-e)*ne))}let ce=new Ni(oe,M,N,T,_);ce.minFilter=ce.magFilter=s,ce.generateMipmaps=!1,ce.needsUpdate=!0;let F=new Ni(se,M,N,k,_);return F.minFilter=F.magFilter=s,F.generateMipmaps=!1,F.needsUpdate=!0,{texture:ce,source:F,bounds:[O,A,te,j],panes:D}}var Kd=.15,qd=1024,Jd=-1e4,Yd=4,Xd=gt.clamp,Zd=e=>{let t=Xd(e,0,1);return t*t*(3-2*t)};function Qd(e){let t=(e,t)=>`${Math.round(e*1e5)},${Math.round(t*1e5)}`,n=e.map(e=>t(e.x0,e.z0)),r=e.map(e=>t(e.x1,e.z1)),i=new Map;e.forEach((e,t)=>{let r=i.get(n[t]);r?r.push(t):i.set(n[t],[t])});let a=new Uint8Array(e.length),o=[];for(let t=0;t<e.length;t++){if(a[t])continue;let s=t,c=[],l=new Map;for(;s>=0&&!a[s];){let t=n[s];l.set(t,c.length),c.push(s),a[s]=1;let u=e[s],d=(i.get(r[s])??[]).filter(e=>!a[e]),f=t=>{let n=e[t],r=u.x1-u.x0,i=u.z1-u.z0,a=n.x1-n.x0,o=n.z1-n.z0;return Math.atan2(r*o-i*a,r*a+i*o)};d.sort((e,t)=>f(t)-f(e)||e-t),s=d[0]??-1;let p=l.get(r[c[c.length-1]]);if(p!==void 0){let t=c.splice(p),r=[1/0,1/0,-1/0,-1/0],i=0;for(let n of t){let t=e[n];i+=t.x0*t.z1-t.x1*t.z0,r[0]=Math.min(r[0],t.x0),r[1]=Math.min(r[1],t.z0),r[2]=Math.max(r[2],t.x0),r[3]=Math.max(r[3],t.z0)}Math.abs(i)>2e-8&&o.push({edges:t,area:i*.5,bounds:r,group:o.length}),l.clear(),c.forEach((e,t)=>l.set(n[e],t))}}}let s=o.filter(e=>e.area>0),c=(t,n,r)=>{let i=!1;for(let a of r){let r=e[a];r.z0>n!=r.z1>n&&t<r.x0+(n-r.z0)*(r.x1-r.x0)/(r.z1-r.z0)&&(i=!i)}return i},l=(e,t,n,r,i,a)=>(n-e)*(a-t)-(r-t)*(i-e),u=(e,t)=>Math.max(e.x0,e.x1)<Math.min(t.x0,t.x1)||Math.max(t.x0,t.x1)<Math.min(e.x0,e.x1)||Math.max(e.z0,e.z1)<Math.min(t.z0,t.z1)||Math.max(t.z0,t.z1)<Math.min(e.z0,e.z1)?!1:l(e.x0,e.z0,e.x1,e.z1,t.x0,t.z0)*l(e.x0,e.z0,e.x1,e.z1,t.x1,t.z1)<=0&&l(t.x0,t.z0,t.x1,t.z1,e.x0,e.z0)*l(t.x0,t.z0,t.x1,t.z1,e.x1,e.z1)<=0,d=[];for(let t of o){let n=t.group;if(t.area<0){let[r,i,a,o]=t.bounds,l=s.filter(e=>e.bounds[0]<r&&e.bounds[1]<i&&e.bounds[2]>a&&e.bounds[3]>o).sort((e,t)=>e.area-t.area).find(n=>t.edges.every(t=>c(e[t].x0,e[t].z0,n.edges))&&!t.edges.some(t=>n.edges.some(n=>u(e[t],e[n]))));if(!l)continue;n=l.group}for(let r of t.edges)e[r].group=n,d.push(e[r])}return d}function $d(e,t){let n=[],r=[],a=[],o=[],c=e.geometry.getAttribute(`position`),l=e.geometry.getAttribute(`aFlow`),u=e.geometry.index,d=u?.count??c?.count??0,f=e=>u?u.getX(e):e,p=1/0,m=1/0,h=-1/0,v=-1/0;for(let e=0;e+2<d;e+=3){let t=[f(e),f(e+1),f(e+2)],[i,s,u]=t.map(e=>new V().fromBufferAttribute(c,e)),d=s.clone().sub(i).cross(u.clone().sub(i)).normalize();if(Math.abs(d.y)<.95){o.push([i,s,u]);let e=Math.min(i.y,s.y,u.y);for(let t of[i,s,u])t.y<=e+.02&&r.push(t);continue}if(Math.max(i.y,s.y,u.y)-Math.min(i.y,s.y,u.y)>.05)continue;let g=(i.y+s.y+u.y)/3,_=a.findIndex(e=>Math.abs(e-g)<.025);_<0&&(_=a.length,a.push(g)),n.push({a:i,b:s,c:u,level:_,flow:[l?.getX(t[0])??0,l?.getZ(t[0])??0]});for(let e of[i,s,u])p=Math.min(p,e.x),m=Math.min(m,e.z),h=Math.max(h,e.x),v=Math.max(v,e.z)}for(let e of o)for(let t of a)for(let[n,i]of[[e[0],e[1]],[e[1],e[2]],[e[2],e[0]]])(n.y<=t&&i.y>t||i.y<=t&&n.y>t)&&r.push(n.clone().lerp(i,(t-n.y)/(i.y-n.y)));n.length?(p-=Kd,m-=Kd,h+=Kd,v+=Kd):(p=m=0,h=v=1);let y=n.length?Math.min(qd,Math.ceil((h-p)/Kd)):1,b=n.length?Math.min(qd,Math.ceil((v-m)/Kd)):1,x=(h-p)/y,S=(v-m)/b,C=y*b,w=new Float32Array(C).fill(Jd),E=new Int32Array(C).fill(-1),D=new Float32Array(C*2),O=new Float32Array(C*4),k=e=>p+(e+.5)*x,A=e=>m+(e+.5)*S,te=(e,t,n,r,i)=>[Math.max(0,Math.ceil((e-n)/r-.5)),Math.min(i-1,Math.floor((t-n)/r-.5))];for(let{a:e,b:t,c:r,level:i,flow:a}of n){let n=(t.z-r.z)*(e.x-r.x)+(r.x-t.x)*(e.z-r.z);if(Math.abs(n)<1e-10)continue;let[o,s]=te(Math.min(e.x,t.x,r.x),Math.max(e.x,t.x,r.x),p,x,y),[c,l]=te(Math.min(e.z,t.z,r.z),Math.max(e.z,t.z,r.z),m,S,b);for(let u=c;u<=l;u++)for(let c=o;c<=s;c++){let o=k(c),s=A(u),l=((t.z-r.z)*(o-r.x)+(r.x-t.x)*(s-r.z))/n,d=((r.z-e.z)*(o-r.x)+(e.x-r.x)*(s-r.z))/n;if(l<-1e-6||d<-1e-6||l+d>1+1e-6)continue;let f=u*y+c,p=l*e.y+d*t.y+(1-l-d)*r.y;p<=w[f]||(w[f]=p,E[f]=i,D[f*2]=a[0],D[f*2+1]=a[1])}}let j=t.getAttribute(`position`),M=t.index,N=M?.count??j?.count??0,P=e=>M?M.getX(e):e,ne=new Uint8Array(C),re=new V,ie=new V,ae=new V;for(let e=0;e<a.length;e++){let t=a[e],n=[],r=Array.from({length:b},()=>[]);for(let e=0;e+2<N;e+=3){if(re.fromBufferAttribute(j,P(e)),ie.fromBufferAttribute(j,P(e+1)),ae.fromBufferAttribute(j,P(e+2)),Math.min(re.y,ie.y,ae.y)>t||Math.max(re.y,ie.y,ae.y)<=t)continue;let r=[];for(let[e,n]of[[re,ie],[ie,ae],[ae,re]])(e.y<=t&&n.y>t||n.y<=t&&e.y>t)&&r.push(e.clone().lerp(n,(t-e.y)/(n.y-e.y)));if(r.length!==2)continue;let[i,a]=r,o=(ie.y-re.y)*(ae.z-re.z)-(ie.z-re.z)*(ae.y-re.y),s=(ie.x-re.x)*(ae.y-re.y)-(ie.y-re.y)*(ae.x-re.x);o*(a.z-i.z)-s*(a.x-i.x)<0&&([i,a]=[a,i]),n.push({x0:i.x,z0:i.z,x1:a.x,z1:a.z,sign:o<0?1:-1,group:-1})}for(let e of Qd(n)){if(Math.abs(e.z0-e.z1)<1e-9)continue;let[t,n]=te(Math.min(e.z0,e.z1),Math.max(e.z0,e.z1),m,S,b);for(let i=t;i<=n;i++)r[i].push(e)}for(let t=0;t<b;t++){let n=A(t),i=[];for(let e of r[t])n<Math.min(e.z0,e.z1)||n>=Math.max(e.z0,e.z1)||i.push({x:e.x0+(n-e.z0)/(e.z1-e.z0)*(e.x1-e.x0),sign:e.sign,group:e.group});i.sort((e,t)=>e.x-t.x);let a=new Map,o=0,s=0;for(let n=0;n<y;n++){for(;s<i.length&&i[s].x<=k(n);){let e=i[s].x;do{let e=i[s++],t=a.get(e.group)??0,n=t+e.sign;a.set(e.group,n),o+=Number(n>0)-Number(t>0)}while(s<i.length&&Math.abs(i[s].x-e)<1e-9)}let r=t*y+n;E[r]===e&&o>0&&(ne[r]=1)}}}let oe=new Int32Array(C).fill(-1);for(let e=0;e<C;e++)(E[e]<0||ne[e])&&(oe[e]=e);let se=(e,t)=>{if(t<0||t>=C)return;let n=oe[t];if(E[t]!==E[e]&&(n=t),n<0)return;let r=e%y,i=Math.floor(e/y),a=n%y,o=Math.floor(n/y),s=oe[e];((r-a)*x)**2+((i-o)*S)**2<(s<0?1/0:((r-s%y)*x)**2+((i-Math.floor(s/y))*S)**2)&&(oe[e]=n)};for(let e=0;e<b;e++)for(let t=0;t<y;t++){let n=e*y+t;E[n]<0||ne[n]||(t&&se(n,n-1),e&&(se(n,n-y),t&&se(n,n-y-1),t+1<y&&se(n,n-y+1)))}for(let e=b-1;e>=0;e--)for(let t=y-1;t>=0;t--){let n=e*y+t;E[n]<0||ne[n]||(t+1<y&&se(n,n+1),e+1<b&&(se(n,n+y),t&&se(n,n+y-1),t+1<y&&se(n,n+y+1)))}let ce=new Int32Array(C).fill(-1),F=new Int32Array(C),le=0;for(let e=0;e<C;e++){if(E[e]<0||ne[e]||ce[e]>=0)continue;let t=0,n=1;F[0]=e,ce[e]=le;let r=t=>{E[t]===E[e]&&!ne[t]&&ce[t]<0&&(ce[t]=le,F[n++]=t)};for(;t<n;){let e=F[t++],n=e%y;n&&r(e-1),n+1<y&&r(e+1),e>=y&&r(e-y),e+y<C&&r(e+y)}le++}let ue=[];for(let e=0;e<b;e++)for(let t=0;t<y;t++){let n=e*y+t;if(E[n]<0||ne[n])continue;let r=oe[n],i=r<0?0:(t-r%y)*x,a=r<0?0:(e-Math.floor(r/y))*S,o=Math.hypot(i,a),s=r<0?Yd:Math.max(0,o-Math.min(x,S)*.5),c=D[n*2],l=D[n*2+1],u=Math.hypot(c,l),d=o?(c*i+l*a)/o:0,f=Math.exp(-s/.65),p=.35+.65*Zd(s/.6);O[n*4]=(c-Math.min(0,d)*(o?i/o:0)*f)*p,O[n*4+1]=(l-Math.min(0,d)*(o?a/o:0)*f)*p,O[n*4+2]=Xd(u*.2*Math.exp(-s/.35)+Math.max(0,-d)*.65*f,0,1),O[n*4+3]=Math.min(Yd,s),r>=0&&ne[r]&&s<Math.max(x,S)&&d<-.25&&(t+e)%3==0&&ue.push({x:k(t),z:A(e),component:ce[n],vx:c/u,vz:l/u,strength:Math.min(.65,u*.45)})}let de=(e,t,n,r,i)=>{if(!(n>0)||!(r>0))return;let[a,o]=te(e-n,e+n,p,x,y),[s,c]=te(t-n,t+n,m,S,b);for(let l=s;l<=c;l++)for(let s=a;s<=o;s++){let a=l*y+s;if(E[a]<0||ne[a]||!i(a))continue;let o=Math.hypot(k(s)-e,A(l)-t)/n;o<1&&(O[a*4+2]=Math.max(O[a*4+2],Xd(r,0,1)*(1-Zd(o))))}};for(let e of ue)for(let t=.3;t<=3;t+=.3)de(e.x+e.vx*t,e.z+e.vz*t,.18+t*.22,e.strength*(1-t/3.3),t=>ce[t]===e.component);for(let e of r)de(e.x,e.z,.5,.9,t=>e.y-w[t]>=-.05&&e.y-w[t]<=.4);for(let t of e.sources)de(t.x,t.z,t.radius,t.strength,e=>t.y===void 0||Math.abs(w[e]-t.y)<.05);for(let e=0;e<b;e++)for(let t=0;t<y;t++){let n=e*y+t;if(E[n]>=0&&!ne[n])continue;let r=-1,i=1/0;for(let n=-1;n<=1;n++)for(let a=-1;a<=1;a++){let o=t+a,s=e+n;if(o<0||o>=y||s<0||s>=b)continue;let c=s*y+o,l=(a*x)**2+(n*S)**2;E[c]>=0&&!ne[c]&&l<i&&(r=c,i=l)}r>=0?(w[n]=w[r],O.set(O.subarray(r*4,r*4+4),n*4),O[n*4+3]=0):w[n]=Jd}let fe=new Ni(Uint16Array.from(O,br.toHalfFloat),y,b,T,_),pe=new Ni(w,y,b,ee,g);fe.minFilter=fe.magFilter=s,pe.minFilter=pe.magFilter=i;for(let e of[fe,pe])e.generateMipmaps=!1,e.needsUpdate=!0;return{texture:fe,height:pe,bounds:[p,m,h,v]}}var ef=class{batch;id;detach;onHighlight;position=new V;quaternion=new _t;scale=new V(1,1,1);visible=!0;snap=!0;castShadow=!0;tint=null;drawn=new H;drawnVisible=!1;drawnCasts=!1;highlighted=!1;strength=.5;alpha=1;constructor(e,t,n,r){this.batch=e,this.id=t,this.detach=n,this.onHighlight=r}get highlight(){return this.highlighted}set highlight(e){e!==this.highlighted&&this.onHighlight(this,e)&&(this.highlighted=e)}get tintStrength(){return this.strength}set tintStrength(e){this.strength=tf(`tintStrength`,e)}get opacity(){return this.alpha}set opacity(e){this.alpha=tf(`opacity`,e)}setTransform(e,t,n){return this.position.copy(e),t instanceof An?this.quaternion.setFromEuler(t):t&&this.quaternion.copy(t),typeof n==`number`?this.scale.setScalar(n):n&&this.scale.copy(n),this}remove(){this.highlight=!1,this.detach(this)}},tf=(e,t)=>{if(!(t>=0&&t<=1))throw RangeError(`PixelObject.${e} must be from 0 to 1, got ${t}`);return t},nf=e=>{let t=Math.min(Math.max(e,0),1);return Math.round(255*(t<=.0031308?t*12.92:1.055*t**(1/2.4)-.055))};function rf(e){let t=e.tint,n=t?Math.round(e.tintStrength*255):0,r=t&&n?nf(t.r)<<16|nf(t.g)<<8|nf(t.b):0,i=e.opacity<1?Math.max(1,Math.round((1-e.opacity)*255)):0;return[e.id,r,n*256+i]}var af=[`position`,`normal`,`aColor`,`aFlag`],of=[`aMode`,`aAnchor`,`aAnim`],sf=new H().makeScale(-1,1,1),cf=class{geometry;materials;objects=[];meshes;motion;rigid;constructor(e,t,n=16){this.geometry=e,this.materials=t;let r=e.getAttribute(`aMode`);this.motion=!!r,this.rigid=!!r&&Array.from(r.array).some(e=>e>5.5),this.meshes=this.makeMeshes(n)}static slot(e,t){return+!!e+(t?0:2)}get mesh(){return this.meshes[0]}get mirrored(){return this.meshes[1]}get casters(){return this.meshes.slice(0,2)}makeMeshes(e){return[0,1,2,3].map(t=>{let n=new Gi(this.geometry,this.materials.gbuffer,e);return this.materials.depth&&(n.customDepthMaterial=this.materials.depth),n.instanceMatrix.setUsage(Ve),n.instanceColor=new Li(new Float32Array(e*3),3).setUsage(Ve),n.castShadow=t<2,n.receiveShadow=!0,n.frustumCulled=!1,n.count=0,t%2&&(n.scale.x=-1),n})}grow(){if(this.objects.length<=this.mesh.instanceMatrix.count)return[];let e=this.meshes,t=this.mesh.instanceMatrix.count;for(;t<this.objects.length;)t*=2;return this.meshes=this.makeMeshes(t),e}},lf={outlines:!0,dither:!0,cleanup:!0,clouds:!0,contacts:!0,glow:!0,vignette:!0},uf=(e,t)=>{if(!Number.isSafeInteger(t)||t<1)throw RangeError(`${e} must be a positive integer`);return t},df=(e,t,n)=>{if(!e.includes(t))throw Error(`posed shadow: three's shader has no '${t}'`);return e.replace(t,n)},ff=(e,t,n)=>{if(e.length>t)throw Error(`At most ${t} entries are supported, got ${e.length}`);return[...e,...Array.from({length:t-e.length},n)]},pf=class{canvas;pixelScene;limits;shadowMapSize;objectShadowMapSize;renderer;camera=new xo(-1,1,1,-1,1,300);snapShift=new B;scene=new vi;light=new Co(16777215,1);gbufHi;shadowHi;gbuf;stylised;fluidBuf;withFluids;linearImage;noFluid=Object.assign(new Ni(new Float32Array(4),1,1,T,g),{needsUpdate:!0});fluidMesh;fluidMat;fluidScene=new vi;hasFluids;fluidMap;staticMesh;staticMat;resolveMat;dynMesh;dynMat;dynShadowMat;hasRigidParts;shadowMat;objectShadowMat;postMat;cleanMat;postHiMat;cleanHiMat;highlightWarmPending;warming=null;disposed=!1;quad;quadScene=new vi;quadCam=new xo(-1,1,1,-1,0,1);shadowDirty=!0;batches=new Map;objectsById=new Map;nextObjectId=1;highlighted=new Set;drawnCamera={position:new V,right:new V,up:new V,fwd:new V,texel:1};pickBuf=new Float32Array(4);seeThroughIds=new Set;pickCamera=new xo;drawnNight=0;pickTargets;retired=[];gbufDrawn=!1;objectMat;objectMotionMat;objectDepthMat;objectMaskMat;rigidObjectsShown=!1;objectShadowTime=NaN;objectLight;objectShadowDirty=!1;shadowCenter;lampShadows;windowLight;width=1;height=1;viewHeight=13;supersample=3;resolvePolicy=1;resolveThinOnly=!0;sun=new V(0,1,0);constructor(e,t,n={}){this.canvas=e;let r=this.pixelScene=gd(t);if(this.limits=hd(n.limits),this.shadowMapSize=uf(`shadowMapSize`,n.shadowMapSize??4096),this.objectShadowMapSize=uf(`objectShadowMapSize`,n.objectShadowMapSize??this.shadowMapSize),this.supersample=n.supersample??3,this.highlightWarmPending=n.warmHighlight??!1,this.supersample!==1&&this.supersample!==3)throw RangeError(`supersample must be 1 or 3`);if(this.resolvePolicy=n.resolvePolicy??1,!Number.isSafeInteger(this.resolvePolicy)||this.resolvePolicy<0||this.resolvePolicy>8)throw RangeError(`resolvePolicy must be an integer from 0 to 8`);this.resolveThinOnly=n.resolveThinOnly??!0;for(let[e,t]of[[`lamps`,r.lamps.length],[`grooves`,r.grooves?.positions.length??0],[`fluidMaterials`,r.fluids.materials.length],[`fluidSources`,r.fluids.sources.length]])if(t>this.limits[e])throw RangeError(`Scene ${e}: at most ${this.limits[e]} entries are supported, got ${t}`);this.renderer=new Jl({canvas:e,antialias:!1,alpha:!1,preserveDrawingBuffer:!0});let i=64+2*this.limits.lamps+this.limits.grooves+4*this.limits.fluidMaterials+2*this.limits.fluidSources,a=this.renderer.getContext(),o=a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS);if(i>o)throw this.renderer.forceContextLoss(),this.renderer.dispose(),RangeError(`Renderer limits need up to ${i} fragment uniform vectors, but this GPU supports ${o}; lower the limits`);this.renderer.setPixelRatio(1),this.renderer.outputColorSpace=Ie,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=1,this.renderer.shadowMap.autoUpdate=!1;let s=new ii({vertexShader:yd,fragmentShader:Ed,glslVersion:He,side:0,uniforms:{uSS:{value:1}}});s.shadowSide=2,this.staticMat=s,this.staticMesh=new qr(r.staticGeometry,s),this.staticMesh.castShadow=!0,this.staticMesh.receiveShadow=!0,this.staticMesh.frustumCulled=!1,this.objectMat=new ii({vertexShader:xd,fragmentShader:Ed,glslVersion:He,side:0,uniforms:{uSS:{value:1},uSeeThrough:{value:0}}}),this.objectMat.shadowSide=2,this.dynMat=new ii({vertexShader:Td,fragmentShader:Ed,glslVersion:He,side:2,uniforms:{uTime:{value:0},uNight:{value:0},uSS:{value:1}}}),this.dynMesh=new qr(r.dynamicGeometry,this.dynMat),this.dynMesh.frustumCulled=!1,this.dynMesh.castShadow=!1,this.dynMesh.receiveShadow=!0,this.scene.add(this.staticMesh,this.dynMesh);let{center:c,radius:l}=r.shadow;this.shadowCenter=c.clone(),this.setupSun(this.light,l,this.shadowMapSize),this.scene.add(this.light,this.light.target),this.shadowMat=new Oa({color:0,opacity:1}),this.shadowMat.transparent=!1,this.shadowMat.blending=0,this.shadowMat.shadowSide=2;let u=`flat varying float vOpacity;`,d=`vOpacity = 1.0 - float(uint(instanceColor.b) & 255u) / 255.0;`,f=`${u}\nuniform int uSS;\n${_d}\nvoid main() {\n  if (vOpacity < 0.999 && vOpacity < bayer4(ivec2(gl_FragCoord.xy) / uSS)) discard;`;this.objectShadowMat=new Oa({color:0,opacity:1}),this.objectShadowMat.transparent=!1,this.objectShadowMat.blending=0,this.objectShadowMat.shadowSide=2,this.objectShadowMat.onBeforeCompile=e=>{e.uniforms.uSS=this.objectMat.uniforms.uSS,e.vertexShader=df(df(e.vertexShader,`#include <common>`,`#include <common>\n${u}`),`#include <begin_vertex>`,`#include <begin_vertex>\n  ${d}`),e.fragmentShader=df(e.fragmentShader,`void main() {`,f)},this.objectShadowMat.customProgramCacheKey=()=>`pixel3d-object-shadow`,this.dynShadowMat=new Oa({color:0,opacity:1,side:2}),this.dynShadowMat.transparent=!1,this.dynShadowMat.blending=0,this.dynShadowMat.onBeforeCompile=e=>{e.uniforms.uTime=this.dynMat.uniforms.uTime,e.uniforms.uNight=this.dynMat.uniforms.uNight;let t=df(e.vertexShader,`#include <common>`,`#include <common>
uniform float uTime; uniform float uNight;
attribute float aMode; attribute vec3 aAnchor; attribute vec4 aAnim;
varying float vMode;   // only so the fragment stage can drop non-rigid modes
${Sd}`);t=df(t,`#include <beginnormal_vertex>`,`vec3 posed = position; vec3 objectNormal = normal; float posedAlpha;
  pose(posed, objectNormal, posedAlpha); vMode = aMode;`),e.vertexShader=df(t,`#include <begin_vertex>`,`vec3 transformed = posed;`),e.fragmentShader=df(e.fragmentShader,`void main() {`,`varying float vMode;
void main() {
  if (vMode < 5.5) discard;`)};let p={uTime:this.dynMat.uniforms.uTime,uNight:this.dynMat.uniforms.uNight};this.objectMotionMat=new ii({vertexShader:wd,fragmentShader:Ed,glslVersion:He,side:0,uniforms:{...p,uSS:{value:1},uSeeThrough:this.objectMat.uniforms.uSeeThrough}}),this.objectMotionMat.shadowSide=2;let m=`uniform float uTime; uniform float uNight;
attribute float aMode; attribute vec3 aAnchor; attribute vec4 aAnim;
varying float vMode;
${Cd}`,h=`vec3 posedW, posedN; float posedA;
  poseObject(modelMatrix * instanceMatrix, instanceColor.r, posedW, posedN, posedA); vMode = aMode;`,g=`vec4 mvPosition = viewMatrix * vec4(posedW, 1.0);
  gl_Position = projectionMatrix * mvPosition;`;this.objectDepthMat=new ja({depthPacking:Pe}),this.objectDepthMat.onBeforeCompile=e=>{Object.assign(e.uniforms,p);let t=df(e.vertexShader,`#include <common>`,`#include <common>\n${m}`);t=df(t,`#include <begin_vertex>`,`#include <begin_vertex>\n  ${h}\n  if (aMode < 5.5) posedW = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;`),e.vertexShader=df(t,`#include <project_vertex>`,g),e.fragmentShader=df(e.fragmentShader,`void main() {`,`varying float vMode;
void main() {
  if (vMode > 1.5 && vMode < 5.5) discard;`)},this.objectDepthMat.customProgramCacheKey=()=>`pixel3d-object-depth`,this.objectMaskMat=new Oa({color:0,opacity:1}),this.objectMaskMat.transparent=!1,this.objectMaskMat.blending=0,this.objectMaskMat.shadowSide=2,this.objectMaskMat.onBeforeCompile=e=>{Object.assign(e.uniforms,p,{uSS:this.objectMat.uniforms.uSS});let t=df(e.vertexShader,`#include <common>`,`#include <common>\n${m}\n${u}`);t=df(t,`#include <beginnormal_vertex>`,`${h}\n  ${d}\n  #include <beginnormal_vertex>`),t=df(t,`#include <defaultnormal_vertex>`,`vec3 transformedNormal = normalize(mat3(viewMatrix) * posedN);`),t=df(t,`#include <project_vertex>`,g),e.vertexShader=df(t,`#include <worldpos_vertex>`,`vec4 worldPosition = vec4(posedW, 1.0);`),e.fragmentShader=df(e.fragmentShader,`void main() {`,`varying float vMode;\n${f}\n  if (vMode > 2.5 && vMode < 5.5) discard;`)},this.objectMaskMat.customProgramCacheKey=()=>`pixel3d-object-mask`;let _=r.dynamicGeometry.getAttribute(`aMode`)?.array??[];this.hasRigidParts=Array.from(_).some(e=>e>5.5);let{lamps:v,grooves:y,fluids:b}=r;this.fluidMat=new ii({vertexShader:Dd,fragmentShader:Od,glslVersion:He,side:2,uniforms:{tAlbedo:{value:null},tNormal:{value:null},uFwd:{value:new V}}}),this.fluidMesh=new qr(b.geometry,this.fluidMat),this.fluidMesh.frustumCulled=!1,this.fluidScene.add(this.fluidMesh),this.hasFluids=b.geometry.attributes.position.count>0;let x=r.maps;this.fluidMap=x?{texture:x.fluids.texture.clone(),height:x.fluids.height.clone(),bounds:[...x.fluids.bounds]}:$d(b,r.staticGeometry);let S=b.materials,C=b.sources,w=e=>ff(S.map(t=>new Ht(...e(t))),this.limits.fluidMaterials,()=>new Ht),T=this.renderer.getContext();this.lampShadows=new Bd(v,r.staticGeometry,Math.min(this.renderer.capabilities.maxTextureSize,T.getParameter(T.MAX_RENDERBUFFER_SIZE))),this.windowLight=x?{texture:x.windows.texture.clone(),source:x.windows.source.clone(),bounds:[...x.windows.bounds],panes:x.windows.panes}:Gd(r.staticGeometry,v);let E={glslVersion:He,depthTest:!1,depthWrite:!1};this.postMat=new ii({...E,vertexShader:vd,fragmentShader:Ad(this.limits),uniforms:{tAlbedo:{value:null},tNormal:{value:null},tShadow:{value:null},uRes:{value:new B},uTexel:{value:.05},uRight:{value:new V},uUp:{value:new V},uFwd:{value:new V},uCamPos:{value:new V},uSun:{value:this.sun},uTime:{value:0},uOutline:{value:1},uDither:{value:1},uClouds:{value:1},uContact:{value:1},uGlow:{value:1},uVignette:{value:1},uSunI:{value:1},uAmbient:{value:.34},uExpo:{value:1},uChroma:{value:1},uNight:{value:0},uLampOn:{value:0},uLitTint:{value:new B},uShadeTint:{value:new B},uSkyTop:{value:new U(7976668)},uSkyBot:{value:new U(16180930)},uLampCount:{value:v.length},tLampShadow:{value:this.lampShadows.target.texture},uLampAtlas:{value:new V(this.lampShadows.size.x,this.lampShadows.size.y,this.lampShadows.tile)},uLamp:{value:ff(v.map(e=>new Ht(e.position.x,e.position.y,e.position.z,e.radius)),this.limits.lamps,()=>new Ht(0,0,0,1))},uLampCol:{value:ff(v.map(e=>new V(...e.color)),this.limits.lamps,()=>new V)},tWindow:{value:this.windowLight.texture},tWindowSource:{value:this.windowLight.source},uWindowBounds:{value:new Ht(...this.windowLight.bounds)},uPass:{value:0},uDeferGrade:{value:0},tImage:{value:null},tFluidN:{value:null},tFluidF:{value:null},tFluidMap:{value:this.fluidMap.texture},tFluidHeight:{value:this.fluidMap.height},uFluidBounds:{value:new Ht(...this.fluidMap.bounds)},uFluidA:{value:w(e=>[...ed(e.shallow),e.clarity])},uFluidB:{value:w(e=>[...ed(e.deep),e.reflectivity])},uFluidC:{value:w(e=>[...ed(e.foam),e.roughness])},uFluidD:{value:w(e=>[e.waveScale,e.foamAmount,e.emission,0])},uSourceCount:{value:C.length},uSources:{value:ff(C.map(e=>new Ht(e.x,e.z,e.rings?e.radius:-e.radius,e.strength)),this.limits.fluidSources,()=>new Ht)},uSourceY:{value:ff(C.map(e=>e.y??-1e4),this.limits.fluidSources,()=>-1e4)},uGrooveCount:{value:y?.positions.length??0},uGrooves:{value:ff(y?.positions??[],this.limits.grooves,()=>0)},uGrooveAxis:{value:new V(...y?.axis??[1,0,0])},uGrooveY:{value:new B(...y?.yRange??[0,0])},uHighlight:{value:new Ht}}}),this.cleanMat=new ii({...E,vertexShader:vd,fragmentShader:jd,uniforms:{tImage:{value:null},tAlbedo:{value:null},tNormal:{value:null},tShadow:{value:null},tFluid:{value:null},uRes:{value:new B},uOn:{value:1},...Object.fromEntries([`uHighlight`,`uTexel`,`uRight`,`uUp`,`uFwd`].map(e=>[e,this.postMat.uniforms[e]]))}}),this.resolveMat=new ii({...E,vertexShader:vd,fragmentShader:Md,uniforms:{tAlbedo:{value:null},tNormal:{value:null},tShadow:{value:null},tObjectId:{value:null},uS:{value:1},uPolicy:{value:0},uThinOnly:{value:0},uTexel:{value:.05},uRight:{value:new V},uUp:{value:new V},uFwd:{value:new V}}});let D=e=>new ii({...E,vertexShader:vd,fragmentShader:e.fragmentShader,uniforms:e.uniforms,defines:{HIGHLIGHT:``}});this.postHiMat=D(this.postMat),this.cleanHiMat=D(this.cleanMat),this.quad=new qr(new Da(2,2),this.postMat),this.quad.frustumCulled=!1,this.quadScene.add(this.quad)}setupSun(e,t,n){e.castShadow=!0,e.shadow.autoUpdate=!1,e.shadow.mapSize.set(n,n);let r=e.shadow.camera;r.left=-t,r.right=t,r.top=t,r.bottom=-t,r.near=1,r.far=140,e.shadow.bias=-4e-4,e.shadow.normalBias=.03}addObject(e){let t=af.filter(t=>!e.getAttribute(t));if(t.length)throw Error(`addObject: geometry has no ${t.join(`, `)} attribute`);let n=of.filter(t=>e.getAttribute(t));if(n.length&&n.length<of.length)throw Error(`addObject: geometry has ${n.join(`, `)} but not all of ${of.join(`, `)}`);if(n.length)for(let[t,n]of[[`aMode`,1],[`aAnchor`,3],[`aAnim`,4]]){let r=e.getAttribute(t).itemSize;if(r!==n)throw Error(`addObject: ${t} has ${r} components, not ${n}`)}if(this.nextObjectId>2**24)throw RangeError(`addObject: more than 2^24 objects added over this renderer's life`);if(!this.objectLight){let e=this.objectLight=new Co(16777215,1);this.setupSun(e,this.pixelScene.shadow.radius,this.objectShadowMapSize),e.position.copy(this.light.position),e.target.position.copy(this.light.target.position),e.target.updateMatrixWorld(),this.scene.add(e,e.target)}let r=this.batches.get(e);r||(r=new cf(e,n.length?{gbuffer:this.objectMotionMat,depth:this.objectDepthMat}:{gbuffer:this.objectMat}),this.batches.set(e,r),this.scene.add(...r.meshes));let i=new ef(r,this.nextObjectId++,e=>this.removeObject(e),(e,t)=>this.setHighlight(e,t));r.objects.push(i),this.objectsById.set(i.id,i);let a=r.grow();return a.length&&(this.retired.push(...a),this.scene.add(...r.meshes)),this.objectShadowDirty=!0,i}setHighlight(e,t){if(t&&this.objectsById.get(e.id)!==e)return!1;if(t&&this.highlighted.size>=4)throw RangeError(`PixelObject.highlight: at most 4 objects can be highlighted at once`);t?this.highlighted.add(e):this.highlighted.delete(e);let n=Array.from(this.highlighted,e=>e.id);return this.postMat.uniforms.uHighlight.value.set(n[0]??0,n[1]??0,n[2]??0,n[3]??0),!0}removeObject(e){let t=e.batch,n=t.objects.indexOf(e);n<0||(t.objects.splice(n,1),this.objectsById.delete(e.id),e.drawnCasts&&(this.objectShadowDirty=!0),t.objects.length||(this.retired.push(...t.meshes),this.batches.delete(t.geometry)))}poseObjects(){let e=this.viewHeight/this.height,t=this.camera.matrixWorld,n=new V().setFromMatrixColumn(t,0),r=new V().setFromMatrixColumn(t,1),i=new V().setFromMatrixColumn(t,2),a=new V,o=new H,s=new H;this.rigidObjectsShown=!1,this.seeThroughIds.clear();for(let t of this.batches.values()){let c=[0,0,0,0];for(let l of t.objects){let u=l.visible&&l.opacity>0&&l.scale.x!==0&&l.scale.y!==0&&l.scale.z!==0,d=u&&l.castShadow&&l.opacity>=1;if(u){if(a.copy(l.position),l.snap){let t=a.dot(n),o=a.dot(r);a.addScaledVector(n,Math.round(t/e)*e-t).addScaledVector(r,Math.round(o/e)*e-o),Math.abs(i.y)>.05&&a.addScaledVector(i,(l.position.y-a.y)/i.y)}o.compose(a,l.quaternion,l.scale);let u=o.determinant()<0,f=cf.slot(u,d),p=c[f]++,m=t.meshes[f],[h,g,_]=rf(l);m.instanceColor.setXYZ(p,h,g,_),m.setMatrixAt(p,u?s.multiplyMatrices(sf,o):o),l.opacity<1&&this.seeThroughIds.add(l.id)}(d!==l.drawnCasts||d&&!o.equals(l.drawn))&&(this.objectShadowDirty=!0),u&&l.drawn.copy(o),l.drawnVisible=u,l.drawnCasts=d}t.meshes.forEach((e,t)=>{if(e.count=c[t],c[t])for(let n of[e.instanceMatrix,e.instanceColor])n.clearUpdateRanges(),n.addUpdateRange(0,c[t]*n.itemSize),n.needsUpdate=!0}),t.rigid&&c[0]+c[1]>0&&(this.rigidObjectsShown=!0)}}setLook(e){let t=this.postMat.uniforms,n=gt.degToRad(e.sunAz),r=gt.degToRad(e.sunEl);this.sun.set(Math.sin(n)*Math.cos(r),Math.sin(r),Math.cos(n)*Math.cos(r)).normalize(),this.light.position.copy(this.sun).multiplyScalar(60).add(this.shadowCenter),this.light.target.position.copy(this.shadowCenter),this.light.target.updateMatrixWorld(),this.objectLight&&(this.objectLight.position.copy(this.light.position),this.objectLight.target.position.copy(this.light.target.position),this.objectLight.target.updateMatrixWorld(),this.objectShadowDirty=!0),this.shadowDirty=!0,t.uSunI.value=e.sunI,t.uAmbient.value=e.ambient,t.uExpo.value=e.expo,t.uChroma.value=e.chroma,t.uLitTint.value.set(...e.litTint),t.uShadeTint.value.set(...e.shadeTint),t.uLampOn.value=e.lampOn,t.uNight.value=e.night,t.uSkyTop.value.copy(e.skyTop),t.uSkyBot.value.copy(e.skyBot),this.dynMat.uniforms.uNight.value=e.night}resize(e,t){this.width=e,this.height=t,this.gbufDrawn=!1,this.renderer.setSize(e,t,!1);let n=this.supersample===3?3:1,r=(n,r=1,a=1)=>new Wt(e*a,t*a,{minFilter:i,magFilter:i,depthBuffer:!0,generateMipmaps:!1,count:r,...n});for(let e of[this.gbufHi,this.shadowHi,this.gbuf,this.stylised,this.fluidBuf,this.withFluids,this.linearImage])e?.dispose();this.gbufHi=r({type:g},3,n),this.gbufHi.textures[2].format=ee,this.shadowHi=r({type:u},1,n),this.gbuf=r({type:g,depthBuffer:!1},3),this.stylised=r({type:u,depthBuffer:!1}),this.hasFluids&&(this.fluidBuf=r({type:g},2),this.withFluids=r({type:u,depthBuffer:!1}),this.linearImage=r({type:g,depthBuffer:!1})),this.staticMat.uniforms.uSS.value=n,this.objectMat.uniforms.uSS.value=n,this.objectMotionMat.uniforms.uSS.value=n,this.dynMat.uniforms.uSS.value=n,this.resolveMat.uniforms.uS.value=n,this.postMat.uniforms.uRes.value.set(e,t),this.cleanMat.uniforms.uRes.value.set(e,t)}placeCamera(e,t,n,r){this.viewHeight=r;let i=this.camera,a=r/2,o=a*(this.width/this.height);i.left=-o,i.right=o,i.top=a,i.bottom=-a,i.updateProjectionMatrix();let s=new V(Math.sin(t)*Math.cos(n),Math.sin(n),Math.cos(t)*Math.cos(n));i.position.copy(e).addScaledVector(s,100),i.lookAt(e),i.updateMatrixWorld();let c=r/this.height,l=new V().setFromMatrixColumn(i.matrixWorld,0),u=new V().setFromMatrixColumn(i.matrixWorld,1),d=Math.round(i.position.dot(l)/c)*c-i.position.dot(l),f=Math.round(i.position.dot(u)/c)*c-i.position.dot(u);this.snapShift.set(d/c,-f/c),i.position.addScaledVector(l,d).addScaledVector(u,f),i.updateMatrixWorld()}renderGeometry(e){let t=this.renderer;for(let e of this.retired)this.scene.remove(e),e.dispose();this.retired=[],this.lampShadows.render(t),this.dynMat.uniforms.uTime.value=e,this.poseObjects(),this.rigidObjectsShown&&e!==this.objectShadowTime&&(this.objectShadowDirty=!0),this.objectShadowTime=e;let n=[...this.batches.values()],r=n.flatMap(e=>e.meshes),i=n.flatMap(e=>e.casters),a=(e,t)=>{this.staticMesh.castShadow=e;for(let e of i)e.castShadow=t};this.shadowDirty&&=(this.light.shadow.needsUpdate=!0,t.shadowMap.needsUpdate=!0,!1),t.setClearColor(0,0);try{a(!0,!1),t.setRenderTarget(this.gbufHi),t.clear(),t.render(this.scene,this.camera)}finally{t.shadowMap.needsUpdate=!1,this.light.shadow.needsUpdate=!1}this.objectLight&&this.objectShadowDirty&&(this.objectLight.shadow.needsUpdate=!0,t.shadowMap.needsUpdate=!0,this.objectShadowDirty=!1),t.setClearColor(16777215,1);let o=t.autoClear;try{a(!1,!0),this.dynMesh.visible=!1,this.staticMesh.material=this.shadowMat;for(let e of n)for(let t of e.meshes)t.material=e.motion?this.objectMaskMat:this.objectShadowMat;if(t.setRenderTarget(this.shadowHi),t.clear(),t.render(this.scene,this.camera),this.hasRigidParts){this.dynMesh.visible=!0,this.staticMesh.visible=!1,this.scene.overrideMaterial=this.dynShadowMat;for(let e of r)e.visible=!1;t.autoClear=!1,t.render(this.scene,this.camera)}}finally{t.autoClear=o,this.scene.overrideMaterial=null,this.staticMesh.material=this.staticMat;for(let e of n)for(let t of e.meshes)t.material=e.motion?this.objectMotionMat:this.objectMat;t.shadowMap.needsUpdate=!1,this.objectLight&&(this.objectLight.shadow.needsUpdate=!1),a(!0,!0),this.staticMesh.visible=!0,this.dynMesh.visible=!0;for(let e of r)e.visible=!0}let s=this.resolveMat.uniforms;s.tAlbedo.value=this.gbufHi.textures[0],s.tNormal.value=this.gbufHi.textures[1],s.tShadow.value=this.shadowHi.texture,s.tObjectId.value=this.gbufHi.textures[2],s.uPolicy.value=this.resolvePolicy,s.uThinOnly.value=+!!this.resolveThinOnly,s.uTexel.value=this.viewHeight/this.height,s.uRight.value.setFromMatrixColumn(this.camera.matrixWorld,0),s.uUp.value.setFromMatrixColumn(this.camera.matrixWorld,1),s.uFwd.value.setFromMatrixColumn(this.camera.matrixWorld,2).negate(),this.quad.material=this.resolveMat,t.setRenderTarget(this.gbuf),t.render(this.quadScene,this.quadCam);let c=this.drawnCamera;if(this.gbufDrawn=!0,c.position.copy(this.camera.position),c.right.copy(s.uRight.value),c.up.copy(s.uUp.value),c.fwd.copy(s.uFwd.value),c.texel=s.uTexel.value,this.seeThroughIds.size&&(this.pickCamera.copy(this.camera),this.drawnNight=this.dynMat.uniforms.uNight.value),this.fluidBuf){t.setClearColor(0,0),t.setRenderTarget(this.fluidBuf),t.clear();let e=this.fluidMat.uniforms;e.tAlbedo.value=this.gbuf.textures[0],e.tNormal.value=this.gbuf.textures[1],e.uFwd.value.copy(s.uFwd.value),t.render(this.fluidScene,this.camera)}}renderStyle(e=lf,t=0){let n=typeof e==`number`?lf:e,r=this.highlighted.size>0,i=r?this.postHiMat:this.postMat,a=r?this.cleanHiMat:this.cleanMat;typeof e==`number`&&(t=e);let o=this.renderer,s=this.camera,c=this.postMat.uniforms;c.tAlbedo.value=this.gbuf.textures[0],c.tNormal.value=this.gbuf.textures[1],c.tShadow.value=this.gbuf.textures[2],c.uTexel.value=this.viewHeight/this.height,c.uRight.value.setFromMatrixColumn(s.matrixWorld,0),c.uUp.value.setFromMatrixColumn(s.matrixWorld,1),c.uFwd.value.setFromMatrixColumn(s.matrixWorld,2).negate(),c.uCamPos.value.copy(s.position),c.uTime.value=t,c.uContact.value=+!!n.contacts,c.uGlow.value=+!!n.glow,c.uVignette.value=+!!n.vignette,c.uOutline.value=+!!n.outlines,c.uDither.value=+!!n.dither,c.uClouds.value=+!!n.clouds;let l=this.fluidBuf?.textures??[this.noFluid,this.noFluid];c.tFluidN.value=l[0],c.tFluidF.value=l[1],this.quad.material=i,c.uPass.value=0,c.tImage.value=null,c.uDeferGrade.value=+!!this.hasFluids,o.setRenderTarget(this.linearImage??this.stylised),o.render(this.quadScene,this.quadCam);let u=this.stylised;this.linearImage&&this.withFluids&&(c.uPass.value=1,c.uDeferGrade.value=0,c.tImage.value=this.linearImage.texture,o.setRenderTarget(this.withFluids),o.render(this.quadScene,this.quadCam),u=this.withFluids),this.cleanMat.uniforms.tImage.value=u.texture,this.cleanMat.uniforms.tFluid.value=l[1],this.cleanMat.uniforms.tAlbedo.value=this.gbuf.textures[0],this.cleanMat.uniforms.tNormal.value=this.gbuf.textures[1],this.cleanMat.uniforms.tShadow.value=this.gbuf.textures[2],this.cleanMat.uniforms.uOn.value=+!!n.cleanup,this.quad.material=a,o.setRenderTarget(null),o.render(this.quadScene,this.quadCam),this.highlightWarmPending&&this.batches.size&&this.warmHighlight()}warmHighlight(){this.highlightWarmPending=!1;let e=this.renderer,t=e.getRenderTarget(),n=[[this.postHiMat,this.linearImage??this.stylised],[this.cleanHiMat,null]].map(([t,n])=>{let r=new vi().add(new qr(this.quad.geometry,t));return e.setRenderTarget(n),e.compileAsync(r,this.quadCam).catch(()=>{})});e.setRenderTarget(t);let r=this.warming=Promise.all(n).finally(()=>{this.warming===r&&(this.warming=null)})}pick(e,t){let n=this.canvas.getBoundingClientRect();return this.pickPixel((e-n.left)/n.width*this.width,(t-n.top)/n.height*this.height)}pickPixel(e,t){let n=Math.floor(e),r=Math.floor(t);if(!this.gbufDrawn||!(n>=0&&r>=0&&n<this.width&&r<this.height))return null;let i=this.height-1-r,a=e=>(this.renderer.readRenderTargetPixels(this.gbuf,n,i,1,1,this.pickBuf,void 0,e),this.pickBuf),o={x:n,y:r,world:null,normal:null,object:null};if(a(0)[3]<.5)return o;let[s,c,l,u]=a(1),d=Math.round(a(2)[0]);if(this.seeThroughIds.has(d)){let e=this.pickBehind(n,i);if(e[0][3]<.5)return o;[s,c,l,u]=e[1],d=Math.round(e[2][0])}let f=this.drawnCamera;return o.normal=new V(s,c,l),o.world=f.position.clone().addScaledVector(f.right,(n+.5-.5*this.width)*f.texel).addScaledVector(f.up,(i+.5-.5*this.height)*f.texel).addScaledVector(f.fwd,u),o.object=this.objectsById.get(d)??null,o}pickBehind(e,t){let n=this.renderer,r=e-(e&3),a=t-(t&3),o=this.pickCamera,s=this.staticMat.uniforms.uSS.value,c=e=>new Wt(e,e,{count:3,type:g,minFilter:i,magFilter:i,depthBuffer:!0,generateMipmaps:!1});this.pickTargets?.hi.width!==4*s&&(this.pickTargets?.hi.dispose(),this.pickTargets?.resolved.dispose(),this.pickTargets={hi:c(4*s),resolved:c(4)});let{hi:l,resolved:u}=this.pickTargets;o.setViewOffset(this.width,this.height,r,this.height-a-4,4,4);let d=this.resolveMat.uniforms,f=[d.tAlbedo.value,d.tNormal.value,d.tShadow.value,d.tObjectId.value],p=n.getRenderTarget(),m=n.getClearColor(new U),h=n.getClearAlpha(),_=this.dynMat.uniforms.uNight,v=_.value;try{this.objectMat.uniforms.uSeeThrough.value=1,_.value=this.drawnNight,n.setClearColor(0,0),n.setRenderTarget(l),n.clear(),n.render(this.scene,o),d.tAlbedo.value=l.textures[0],d.tNormal.value=l.textures[1],d.tShadow.value=l.textures[0],d.tObjectId.value=l.textures[2],this.quad.material=this.resolveMat,n.setRenderTarget(u),n.render(this.quadScene,this.quadCam)}finally{this.objectMat.uniforms.uSeeThrough.value=0,_.value=v,[d.tAlbedo.value,d.tNormal.value,d.tShadow.value,d.tObjectId.value]=f,n.setRenderTarget(p),n.setClearColor(m,h)}return[0,1,2].map(i=>{let o=new Float32Array(4);return n.readRenderTargetPixels(u,e-r,t-a,1,1,o,void 0,i),o})}readAlbedo(){let e=new Float32Array(this.width*this.height*4);return this.renderer.readRenderTargetPixels(this.gbuf,0,0,this.width,this.height,e,void 0,0),e}dispose(){if(this.disposed)return;this.disposed=!0,this.gbufDrawn=!1,this.objectsById.clear(),this.highlightWarmPending=!1;for(let e of[this.gbufHi,this.shadowHi,this.gbuf,this.stylised,this.fluidBuf,this.withFluids,this.linearImage,this.pickTargets?.hi,this.pickTargets?.resolved])e?.dispose();this.light.shadow.map?.dispose(),this.objectLight?.shadow.map?.dispose(),this.lampShadows.dispose(),this.windowLight.texture.dispose(),this.windowLight.source.dispose(),this.fluidMap.texture.dispose(),this.fluidMap.height.dispose(),this.noFluid.dispose();for(let e of[this.staticMesh,this.dynMesh,this.fluidMesh,this.quad])e.geometry.dispose();for(let e of this.batches.values())for(let t of e.meshes)t.dispose();for(let e of this.retired)e.dispose();for(let e of[this.staticMat,this.objectMat,this.objectMotionMat,this.objectDepthMat,this.objectMaskMat,this.dynMat,this.dynShadowMat,this.shadowMat,this.objectShadowMat,this.postMat,this.cleanMat,this.resolveMat,this.fluidMat])e.dispose();let e=()=>{this.postHiMat.dispose(),this.cleanHiMat.dispose(),this.renderer.dispose()};this.warming?this.warming.then(e):e()}},mf={STATIC:0,SWAY:1,CONVEYOR:2,SMOKE:3,BUTTERFLY:4,FIREFLY:5,SPIN:6,SWING:7},hf={sway:(e,t,n,r=.5)=>({mode:mf.SWAY,anim:(i,a)=>[Math.min(Math.max((a-n)/r,0),1.6)**1.3,e,t,0]}),conveyor:(e,t,n,r)=>({mode:mf.CONVEYOR,anchor:e,anim:[t,n,r,0]}),smoke:(e,t,n)=>({mode:mf.SMOKE,anchor:e,anim:[t,n,0,0]}),butterfly:(e,t,n)=>({mode:mf.BUTTERFLY,anchor:e,anim:[t,n,0,0]}),firefly:(e,t,n)=>({mode:mf.FIREFLY,anchor:e,anim:[t,n,0,0]}),spin:(e,t,n)=>({mode:mf.SPIN,anchor:e,anim:[...t,n]}),swing:(e,t,n)=>({mode:mf.SWING,anchor:e,anim:[...t,n]})},gf=/^(decor|water|glass|thin|move|lamp)_/i,_f=e=>!gf.test(e.name)&&e.parent?.type===`Group`?e.parent.name:e.name;function vf(e){let t=_f(e).toLowerCase();if(t.startsWith(`glass_`))return{skip:!0};if(t.startsWith(`water_`))return{fluid:pd(t)};if(t.startsWith(`decor_`))return{flag:Zu.DECOR};if(t.startsWith(`thin_`))return{thin:!0}}function yf(e){for(let t=e;t;t=t.parent){let e=/^move_(spin|sway)_/i.exec(t.name);if(!e)continue;let n=t.getWorldPosition(new V).toArray(),r=new V().setFromMatrixColumn(t.matrixWorld,0).normalize().toArray(),{speed:i=.6,amplitude:a=.1}=t.userData;return e[1].toLowerCase()===`spin`?hf.spin(n,r,i):hf.swing(n,r,a)}}async function bf(e){let t=await new Ql().loadAsync(e);return t.scene.updateMatrixWorld(!0),t.scene}function xf(e,t,n,r=()=>{},i){e.traverse(e=>{let a=e;if(!a.isMesh)return;let o=a.material,s=r(a,o)??{};if(s.skip)return;if(s.fluid){if(!i)throw Error(`collectGltf: '${_f(a)}' is a fluid, but no fluid collector was given`);i.add(a.geometry,a.matrixWorld,s.fluid,s.flow);return}let c=o.emissive,l=s.flag??(c&&c.r+c.g+c.b>.05?Zu.EMISSIVE:Zu.NORMAL),u=s.thin?$u(l):l,d=s.color??[o.color.r,o.color.g,o.color.b];s.motion?n.add(a.geometry,a.matrixWorld,d,u,!1,s.motion):t.add(a.geometry,a.matrixWorld,d,u)})}var Sf=([e,t,n])=>{let r=Math.cbrt(.4122214708*e+.5363325363*t+.0514459929*n),i=Math.cbrt(.2119034982*e+.6806995451*t+.1073969566*n),a=Math.cbrt(.0883024619*e+.2817188376*t+.6299787005*n);return[.2104542553*r+.793617785*i-.0040720468*a,1.9779984951*r-2.428592205*i+.4505937099*a,.0259040371*r+.7827717662*i-.808675766*a]},Cf=([e,t,n])=>{let r=(e+.3963377774*t+.2158037573*n)**3,i=(e-.1055613458*t-.0638541728*n)**3,a=(e-.0894841775*t-1.291485548*n)**3;return[4.0767416621*r-3.3077115913*i+.2309699292*a,-1.2684380046*r+2.6097574011*i-.3413193965*a,-.0041960863*r-.7034186147*i+1.707614701*a]};function wf(e,t){if(!Number.isInteger(t)||t<1)throw RangeError(`palette size must be a whole number of at least 1, got ${t}`);let n=(e,t,n)=>{let r=e=>Math.round(e*1023);return r(e.getX(n))*1048576+r(e.getY(n))*1024+r(e.getZ(n))+Math.round(t.getX(n))*1e10},r=new Map,i=new V,a=new V,o=new V;for(let t of e){let e=t.attributes.aColor,s=t.attributes.aFlag,c=t.attributes.position;for(let t=0;t<e.count;t++){let l=n(e,s,t),u=r.get(l);u||r.set(l,u={lab:Sf([e.getX(t),e.getY(t),e.getZ(t)]),area:0,idx:0}),t%3==0&&(u.area+=.5*a.fromBufferAttribute(c,t+1).sub(i.fromBufferAttribute(c,t)).cross(o.fromBufferAttribute(c,t+2).sub(i)).length())}}let s=[...r.values()];if(s.length<=t)return s.length;let c=Ef(s,t).map(e=>Cf(e).map(e=>Math.min(1,Math.max(0,e))));for(let t of e){let e=t.attributes.aColor,i=t.attributes.aFlag;for(let t=0;t<e.count;t++){let a=c[r.get(n(e,i,t)).idx];e.setXYZ(t,a[0],a[1],a[2])}}return new Set(s.map(e=>e.idx)).size}var Tf=(e,t)=>(e[0]-t[0])**2+3.2*(e[1]-t[1])**2+3.2*(e[2]-t[2])**2;function Ef(e,t){let n=e=>{let t=0,n=[0,0,0];for(let r of e){let e=Math.sqrt(r.area)+1e-6;t+=e,n[0]+=r.lab[0]*e,n[1]+=r.lab[1]*e,n[2]+=r.lab[2]*e}return[n[0]/t,n[1]/t,n[2]/t]},r=(e,t)=>{let r=e.concat(t),i=n(r),a=0;for(let e of r)a=Math.max(a,Tf(e.lab,i));return a},i=e.map(e=>[e]),a=i.map((e,t)=>i.map((n,i)=>i>t?r(e,n):0));for(;i.length>t;){let e=0,t=1,n=1/0;for(let r=0;r<i.length;r++)for(let o=r+1;o<i.length;o++)a[r][o]<n&&(n=a[r][o],e=r,t=o);i[e]=i[e].concat(i[t]),i.splice(t,1),a.splice(t,1);for(let e of a)e.splice(t,1);for(let t=0;t<i.length;t++)if(t!==e){let n=r(i[e],i[t]);t>e?a[e][t]=n:a[t][e]=n}}return i.forEach((e,t)=>e.forEach(e=>e.idx=t)),i.map(n)}var Df=(e,t,n)=>e+(t-e)*n,Of=(e,t,n)=>new U(e).lerp(new U(t),n);function kf(e,t={}){if(e.length===0)throw Error(`A day cycle needs at least one key`);for(let[e,n]of Object.entries(t))if(!(n>=0&&n<=24))throw Error(`Day cycle preset "${e}" is at hour ${n}, outside 0-24`);e.forEach((t,n)=>{if(!(t.hour>=0&&t.hour<=24))throw Error(`Day cycle key ${n} is at hour ${t.hour}, outside 0-24`);if(n>0&&!(t.hour>e[n-1].hour))throw Error(`Day cycle key ${n} (hour ${t.hour}) is not after the one before it`)});let n=e=>typeof e==`object`&&e.isColor?new U().copy(e):e,r=Object.freeze(e.map(e=>Object.freeze({...e,litTint:Object.freeze([...e.litTint]),shadeTint:Object.freeze([...e.shadeTint]),skyTop:n(e.skyTop),skyBot:n(e.skyBot)}))),i=Object.freeze({...t}),a=e=>(e%24+24)%24,o=r[0],s=r[r.length-1],c=[...o.hour>0?[{...s,hour:s.hour-24}]:[],...r,...s.hour<24?[{...o,hour:o.hour+24}]:[]],l=e=>{let t=a(e),n=0;for(;n<c.length-2&&t>=c[n+1].hour;)n++;let r=c[n],i=c[n+1],o=i.hour>r.hour?(t-r.hour)/(i.hour-r.hour):0,s=o*o*(3-2*o),l=e=>Df(r[e],i[e],s);return{hour:t,sunAz:l(`sunAz`),sunEl:l(`sunEl`),sunI:l(`sunI`),ambient:l(`ambient`),expo:l(`expo`),chroma:l(`chroma`),litTint:[Df(r.litTint[0],i.litTint[0],s),Df(r.litTint[1],i.litTint[1],s)],shadeTint:[Df(r.shadeTint[0],i.shadeTint[0],s),Df(r.shadeTint[1],i.shadeTint[1],s)],lampOn:l(`lampOn`),night:l(`night`),skyTop:Of(r.skyTop,i.skyTop,s),skyBot:Of(r.skyBot,i.skyBot,s)}},u=(e,t)=>{let n=a(e-t);return Math.min(n,24-n)};return{keys:r,presets:i,lookAt:l,nearestPreset:e=>Object.entries(i).sort((t,n)=>u(t[1],e)-u(n[1],e))[0]?.[0]??``}}var Af=kf([[0,-50,38,.34,.3,.58,.95,-.006,-.044,.012,-.07,1,1,858168,2835058],[5.5,-50,38,.34,.3,.58,.95,-.006,-.044,.012,-.07,1,1,858168,2835058],[6.4,88,9,.78,.34,.88,1.04,.014,.03,.016,-.04,.7,.35,8228816,16763296],[8,66,26,1,.34,1,1.02,.006,.022,.01,-.03,0,0,8962280,16508616],[12,0,60,1,.34,1,1,0,.008,.006,-.026,0,0,7976668,16180930],[15.5,-38,38,1,.34,1,1.02,.004,.014,.01,-.032,0,0,7976668,16180930],[17.5,-60,24,1.05,.34,1.02,1.05,.012,.032,.02,-.054,.15,0,7316440,16762762],[18.8,-80,11,.95,.33,.93,1.06,.022,.042,.022,-.054,.6,.15,5926848,16752494],[19.8,-92,3,.4,.31,.74,1,-.004,-.02,.012,-.05,1,.65,2372986,9071272],[21,-50,38,.34,.3,.58,.95,-.006,-.044,.012,-.07,1,1,858168,2835058],[24,-50,38,.34,.3,.58,.95,-.006,-.044,.012,-.07,1,1,858168,2835058]].map(([e,t,n,r,i,a,o,s,c,l,u,d,f,p,m])=>({hour:e,sunAz:t,sunEl:n,sunI:r,ambient:i,expo:a,chroma:o,litTint:[s,c],shadeTint:[l,u],lampOn:d,night:f,skyTop:p,skyBot:m})),{Morning:8,Noon:12,"Golden hour":17.5,Dusk:19.5,Night:22});Af.presets;var jf=e=>Af.lookAt(e),Mf=[`wheat`,`beans`,`tomato`,`sunflower`,`flax`,`egg`,`manure`,`honey`,`flour`,`bran`,`oil`,`seedcake`,`compost`,`yarn`,`linen`,`bread`,`sauce`,`honeycake`],Nf={wheat:{name:`Wheat`,price:2,colour:14860890,hint:`Milled into flour.`},beans:{name:`Beans`,price:2,colour:6986298,hint:`Chicken feed. Bean fields restore the soil.`},tomato:{name:`Tomato`,many:`tomatoes`,price:3,colour:14700602,hint:`Cooked into sauce.`},sunflower:{name:`Sunflower`,many:`sunflowers`,price:3,colour:15910458,hint:`Pressed into oil.`},flax:{name:`Flax`,price:3,colour:9087192,hint:`Spun into yarn.`},egg:{name:`Egg`,many:`eggs`,price:6,colour:16183264,hint:`Baked into bread and cake.`},manure:{name:`Manure`,price:1,colour:6964270,hint:`Composted, or burnt in the digester.`},honey:{name:`Honey`,price:10,colour:15769632,hint:`Baked into honey cake.`},flour:{name:`Flour`,price:7,colour:16051416,hint:`Baked into bread and cake.`},bran:{name:`Bran`,price:1,colour:12094026,hint:`A milling byproduct: chicken feed, compost or fuel.`},oil:{name:`Oil`,price:12,colour:15253568,hint:`Cooked into sauce.`},seedcake:{name:`Seed cake`,price:2,colour:10123850,hint:`A pressing byproduct: chicken feed, compost or fuel.`},compost:{name:`Compost`,price:4,colour:4863526,hint:`Feeds the soil: fields take it when their soil drops.`},yarn:{name:`Yarn`,price:10,colour:14209256,hint:`Woven into linen.`},linen:{name:`Linen`,price:45,colour:15525072,hint:`A product. Deliver it.`},bread:{name:`Bread`,price:22,colour:13142602,hint:`A product. Deliver it.`},sauce:{name:`Tomato sauce`,price:40,colour:13119530,hint:`A product. Deliver it.`},honeycake:{name:`Honey cake`,price:60,colour:15249504,hint:`A product. Deliver it.`}},Pf={feed:[`beans`,`bran`,`seedcake`],organic:[`manure`,`bran`,`seedcake`]},Ff=e=>Nf[e].name.toLowerCase(),If=e=>{let t=Pf[e].map(Ff);return`${t.slice(0,-1).join(`, `)} or ${t[t.length-1]}`},Lf={feed:`feed`,organic:`organic matter`},Rf={feed:`${Lf.feed} (${If(`feed`)})`,organic:`${Lf.organic} (${If(`organic`)})`},zf=[`wheat`,`beans`,`tomato`,`sunflower`,`flax`],Bf={wheat:{name:`Wheat`,grow:40,yield:3,soil:-1,flowers:!1,stages:4},beans:{name:`Beans`,grow:50,yield:2,soil:2.5,flowers:!0,stages:4},tomato:{name:`Tomato`,grow:60,yield:4,soil:-1.5,flowers:!0,stages:4},sunflower:{name:`Sunflower`,grow:70,yield:3,soil:-2,flowers:!0,stages:4},flax:{name:`Flax`,grow:55,yield:3,soil:-1.5,flowers:!0,stages:4}},Vf={store:6,compostBelow:85,compostGain:12,dry:.4,poorSoil:.4,richSoil:1.4,rest:.1},Hf=[`silo`,`garage`,`field`,`sprinkler`,`coop`,`hive`,`composter`,`mill`,`press`,`spinner`,`loom`,`bakery`,`cannery`,`solar`,`turbine`,`battery`,`digester`,`pylon`,`sapling`,`depot`],Uf=[{id:`logistics`,name:`Logistics`},{id:`farming`,name:`Farming`},{id:`processing`,name:`Processing`},{id:`power`,name:`Power`},{id:`ecology`,name:`Ecology`}],G={silo:{name:`Silo`,size:2,cost:80,category:`logistics`,stores:!0,tall:!0,key:`L`,hint:`Stores goods: trucks drop them here and pick them up again.`},garage:{name:`Garage`,size:2,cost:100,category:`logistics`,power:20,key:`T`,get hint(){return`Home of up to ${q.perGarage} trucks: buy them here, give them routes. Charges them.`}},field:{name:`Field`,size:3,cost:30,category:`farming`,harvests:!0,key:`F`,hint:`Grows a crop on rich soil. Water it with sprinklers, or build it beside a river or pond; feed it compost.`},sprinkler:{name:`Sprinkler`,size:1,cost:25,category:`farming`,power:3,get hint(){return`Waters fields within ${K.sprinklerReach} tiles. Cheaper to run near water.`}},coop:{name:`Coop`,size:3,cost:150,category:`farming`,get hint(){return`Chickens: ${Xf(`eggs`)}.`}},hive:{name:`Beehive`,size:1,cost:60,category:`farming`,harvests:!0,hint:`Honey from flowering fields nearby; pollinates them for a bigger harvest.`},composter:{name:`Composter`,size:2,cost:60,category:`farming`,get hint(){return`Turns ${If(`organic`)} into compost.`}},mill:{name:`Mill`,size:2,cost:200,category:`processing`,power:12,tall:!0,get hint(){return`${Xf(`flour`)}.`}},press:{name:`Oil press`,size:2,cost:220,category:`processing`,power:15,get hint(){return`${Xf(`oil`)}.`}},spinner:{name:`Spinner`,size:2,cost:200,category:`processing`,power:10,get hint(){return`${Xf(`yarn`)}.`}},loom:{name:`Loom`,size:2,cost:300,category:`processing`,power:20,get hint(){return`${Xf(`linen`)}.`}},bakery:{name:`Bakery`,size:2,cost:350,category:`processing`,power:25,tall:!0,get hint(){return`${Zf(Xf(`bread`))}, or ${Xf(`honeycake`)}.`}},cannery:{name:`Cannery`,size:2,cost:300,category:`processing`,power:18,get hint(){return`${Zf(Xf(`sauce`))}.`}},solar:{name:`Solar panel`,size:2,cost:70,category:`power`,grid:`source`,key:`S`,get hint(){return`${K.solar} W at noon; nothing at night.`}},turbine:{name:`Wind turbine`,size:1,cost:120,category:`power`,grid:`source`,tall:!0,get hint(){return`${K.turbine} W in full wind. Trees and tall buildings close by shelter it.`}},battery:{name:`Battery`,size:2,cost:150,category:`power`,grid:`storage`,hint:`Stores power for the night.`},digester:{name:`Digester`,size:2,cost:180,category:`power`,grid:`source`,get hint(){return`Burns ${If(`organic`)} for a steady ${K.digester} W.`}},pylon:{name:`Pylon`,size:1,cost:10,category:`power`,inert:!0,grid:`link`,onWater:!0,key:`P`,get hint(){return`Powers buildings within ${K.pylon.reach} tiles; links to pylons within ${K.pylon.link}.`}},sapling:{name:`Sapling`,size:1,cost:5,category:`ecology`,inert:!0,hint:`Grows into a tree.`},depot:{name:`Freight depot`,size:3,cost:0,category:null,inert:!0,stores:!0,hint:`Deliver goods here.`}},Wf=[{id:`flour`,building:`mill`,inputs:[{item:`wheat`,n:2}],outputs:[{item:`flour`,n:1},{item:`bran`,n:1}],time:6},{id:`oil`,building:`press`,inputs:[{item:`sunflower`,n:2}],outputs:[{item:`oil`,n:1},{item:`seedcake`,n:1}],time:8},{id:`yarn`,building:`spinner`,inputs:[{item:`flax`,n:2}],outputs:[{item:`yarn`,n:1}],time:6},{id:`linen`,building:`loom`,inputs:[{item:`yarn`,n:3}],outputs:[{item:`linen`,n:1}],time:10},{id:`bread`,building:`bakery`,inputs:[{item:`flour`,n:1},{item:`egg`,n:1}],outputs:[{item:`bread`,n:1}],time:8},{id:`honeycake`,building:`bakery`,inputs:[{item:`flour`,n:1},{item:`egg`,n:1},{item:`honey`,n:1}],outputs:[{item:`honeycake`,n:1}],time:12},{id:`sauce`,building:`cannery`,inputs:[{item:`tomato`,n:3},{item:`oil`,n:1}],outputs:[{item:`sauce`,n:1}],time:10},{id:`compost`,building:`composter`,inputs:[{group:`organic`,n:2}],outputs:[{item:`compost`,n:1}],time:20},{id:`eggs`,building:`coop`,inputs:[{group:`feed`,n:2}],outputs:[{item:`egg`,n:2},{item:`manure`,n:1}],time:16},{id:`burn`,building:`digester`,inputs:[{group:`organic`,n:1}],outputs:[],time:10}],Gf=new Set(Wf.map(e=>e.building)),Kf=e=>Gf.has(e),qf=e=>Wf.filter(t=>t.building===e);function Jf(e){let t=Wf.find(t=>t.id===e);if(!t)throw Error(`No recipe with id ${e}`);return t}var Yf=e=>{let t=`item`in e?Ff(e.item):Lf[e.group],n=`item`in e?Nf[e.item].many??t:t;return e.n>1?`${e.n} ${n}`:t},Xf=e=>{let t=Jf(e);return`${t.inputs.map(Yf).join(` + `)} → ${t.outputs.map(Yf).join(` + `)}`},Zf=e=>e[0].toUpperCase()+e.slice(1),K={solar:30,turbine:40,shelter:.1,shelterFloor:.4,shelterReach:2,digester:30,battery:{capacity:2400,rate:40},pylon:{reach:3,link:8},sprinklerNearWater:3,sprinklerFar:8,waterNear:8,sprinklerReach:3},Qf={reach:4,maxFlowers:3,honeySeconds:45,store:6},$f={perGood:30},q={cost:60,perGarage:4,cargo:6,moveRate:4,speed:3,crawl:.5,battery:300,joulesPerTile:1,chargeRate:20,wait:5,maxWait:60,giveUp:5,maxStops:8},ep=e=>e===`depot`?2:1,tp={tree:5,rock:15},np={perTree:.25,cap:10},rp=.1;function ip(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function ap(e){if(/^\d+$/.test(e.trim()))return Number(e.trim())>>>0;let t=2166136261;for(let n of e)t^=n.charCodeAt(0),t=Math.imul(t,16777619);return t>>>0}function op(e,t,n){let r=Math.imul(e|0,374761393)+Math.imul(t|0,668265263)+Math.imul(n|0,2246822519);return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967296}var sp=e=>e*e*(3-2*e);function cp(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=sp(e-r),o=sp(t-i),s=op(r,i,n),c=op(r+1,i,n),l=op(r,i+1,n),u=op(r+1,i+1,n);return s+(c-s)*a+(l-s)*o+(s-c-l+u)*a*o}function lp(e,t,n,r=3){let i=0,a=1,o=0,s=1;for(let c=0;c<r;c++)i+=cp(e*s,t*s,n+c*101)*a,o+=a,a*=.5,s*=2;return i/o}function up(e,t){let n=Math.floor(e),r=sp(e-n),i=op(n,0,t);return i+(op(n+1,0,t)-i)*r}var dp={grass:0,water:1,rock:2,tree:3},fp=8;function pp(e){let{width:t,height:n,terrain:r,fertility:i,depot:a}=hp(e,0);return{width:t,height:n,terrain:r,fertility:i,depot:a}}var mp=.6;function hp(e,t){let{width:n,height:r,seed:i,terrain:a}=e,o=ip(i),s=t,c=n+2*s,l=r+2*s,u=Array(c*l).fill(dp.grass),d=Array(c*l).fill(0),f=new Float32Array(c*l*2),p=new Uint8Array(c*l),m=(e,t)=>(t+s)*c+e+s,h=(e,t)=>e>=-s&&t>=-s&&e<n+s&&t<r+s,g=(e,t)=>Math.max(0,-e,-t,e-n+1,t-r+1),_={x:Math.floor(n/2-1+(o()-.5)*n*.4),y:r-3-1},v=(e,t)=>Math.max(Math.abs(e-(_.x+1)),Math.abs(t-(_.y+1)))<=fp;if(a.water===`river`){let e=o()<.5,t=o()*6.28,a=5+o()*4,c=2+o()*3,l=e?r:n,d=op(i,1,77)<.5?1:-1,g=[Math.round(l*(.3+op(i,2,77)*.1)),Math.round(l*(.62+op(i,3,77)*.1))],v=e=>g.filter(t=>d>0?e>=t:e<t).length,y=e=>n=>e+Math.sin(n/a+t)*c+(cp(n/3,0,i+5)-.5)*2,b;b=y(e?_.x+1<n/2?n*(.62+o()*.2):n*(.18+o()*.2):r*(.22+o()*.25));for(let t=-s;t<l+s;t++){let n=b(t),r=1+cp(t/4,1,i+6)*.9,a=b(t+.5)-b(t-.5),o=Math.hypot(a,1),s=mp+.5000000000000001*Math.min(1,Math.max(0,(1.9-r)/.9)),c=d*s/o,l=d*s*a/o;for(let i=Math.floor(n-r);i<=Math.ceil(n+r);i++){let[a,o]=e?[i,t]:[t,i];if(!h(a,o)||Math.abs(i-n)>r)continue;let s=m(a,o);u[s]=dp.water,f[s*2]=e?l:c,f[s*2+1]=e?c:l,p[s]=v(t)}}}else if(a.water===`ponds`||a.water===`lake`){let e=a.water===`lake`?1:3+Math.floor(o()*3);for(let t=0;t<e;t++){let e=a.water===`lake`?5+o()*2:1.6+o()*1.8,s=0,c=0;for(let e=0;e<20&&(s=3+o()*(n-6),c=3+o()*(r*.7),v(Math.round(s),Math.round(c)));e++);for(let n=Math.floor(c-e-2);n<=c+e+2;n++)for(let r=Math.floor(s-e-2);r<=s+e+2;r++)h(r,n)&&Math.hypot(r+.5-s,(n+.5-c)*1.15)<e+(cp(r/2,n/2,i+9+t)-.5)*1.6&&(u[m(r,n)]=dp.water)}}let y=(e,t,i,a,o)=>{if(e<=0)return;let c=[],l=(e,n)=>lp(e/t,n/t,i,3)*.85+cp(e*1.7,n*1.7,i+3)*.15;for(let e=0;e<r;e++)for(let t=0;t<n;t++)u[m(t,e)]===dp.grass&&c.push(l(t,e));c.sort((e,t)=>t-e);let d=c[Math.min(c.length-1,Math.floor(c.length*e))];for(let e=-s;e<r+s;e++)for(let t=-s;t<n+s;t++)u[m(t,e)]!==dp.grass||v(t,e)||l(t,e)+o*g(t,e)>d&&(u[m(t,e)]=a)};y(a.forest,7,i+21,dp.tree,.012),y(a.rock,3.5,i+37,dp.rock,0);let b=(e,t)=>e>=0&&t>=0&&e<n&&t<r;for(let e=-s;e<r+s;e++)for(let t=-s;t<n+s;t++){let n=a.soil+a.soilSpread*(lp(t/9,e/9,i+51,3)*2-1)*1.6,r=b(t,e)?b:h,o=!1;for(let n=-2;n<=2&&!o;n++)for(let i=-2;i<=2;i++)if(r(t+i,e+n)&&u[m(t+i,e+n)]===dp.water){o=!0;break}o&&(n+=10),d[m(t,e)]=Math.round(Math.max(5,Math.min(95,n)))}for(let e=_.y;e<_.y+3;e++)for(let t=_.x;t<_.x+3;t++){let n=m(t,e);u[n]=dp.grass,f[n*2]=f[n*2+1]=0,p[n]=0}return{seed:i,margin:s,width:c,height:l,terrain:u,fertility:d,depot:_,flow:f,drop:p}}var gp=e=>({ok:!0,value:e}),_p=e=>({ok:!1,error:e});function vp(e){try{return gp(JSON.parse(e))}catch(e){return _p(e instanceof Error?e.message:String(e))}}function yp(e,t){if(e==null)throw Error(`Missing ${t}`);return e}var bp=new WeakMap;function xp(e){let t=bp.get(e);return t||bp.set(e,t={routesVersion:Cp()}),t}var Sp=1,Cp=()=>Sp++;function wp(e){xp(e).routesVersion=Cp()}var Tp=10,Ep=[`solar`,`wind`,`digester`,`given`,`taken`,`wanted`,`used`,`short`];function Dp(e){let t=xp(e),n=t.powerLog;return n||(t.powerLog=n={hours:[],nights:[]}),n}var Op=e=>Math.floor(e/Tp+1e-9)*Tp,kp=(e,t)=>{let n=7+e/240*24,r=n%24,i=1+Math.floor(n/24);return r>=t?i:i-1};function Ap(e,t,n,r){let i=Dp(e),a=e.time-r,o=Op(a),s=i.hours[i.hours.length-1];(!s||s.from<o-1e-6)&&(i.hours.push(s={from:o,seconds:0,night:t.night,use:{},solar:0,wind:0,digester:0,given:0,taken:0,wanted:0,used:0,short:0}),i.hours.length>26&&i.hours.splice(0,i.hours.length-26)),s.seconds+=r;for(let e of Ep)s[e]+=t[e]*r;for(let[e,t]of Object.entries(n))s.use[e]=(s.use[e]??0)+t*r;if(!t.night)return;let c=kp(e.time,e.scenario.weather.sunset),l=i.nights[i.nights.length-1];if((!l||l.day!==c)&&(i.nights.push(l={day:c,from:a,seconds:0,short:0,lowest:null,lowestAt:a,dryAt:null}),i.nights.length>4&&i.nights.splice(0,i.nights.length-4)),l.seconds+=r,t.short>1e-6&&(l.short+=r),t.capacity>0){let n=t.stored/t.capacity;(l.lowest===null||n<l.lowest-1e-9)&&(l.lowest=n,l.lowestAt=e.time),l.dryAt===null&&n<.01&&t.short>1e-6&&(l.dryAt=e.time)}}function jp(e){let t=Dp(e),n=Op(e.time-1e-6),r=new Map(t.hours.map(e=>[Math.round(e.from/Tp),e])),i=[],a={solar:0,wind:0,digester:0,given:0,taken:0,wanted:0,used:0,short:0},o={},s=0;for(let e=23;e>=0;e--){let t=r.get(Math.round(n/Tp)-e);if(!t||t.seconds<=0){i.push(null);continue}let c={from:t.from,night:t.night};for(let e of Ep)c[e]=t[e]/t.seconds,a[e]+=t[e];c.made=c.solar+c.wind+c.digester,i.push(c),s+=t.seconds;for(let[e,n]of Object.entries(t.use))o[e]=(o[e]??0)+n}let c={...a,made:0};if(s>0){for(let e of Ep)c[e]=a[e]/s;for(let e of Object.keys(o))o[e]=(o[e]??0)/s}return c.made=c.solar+c.wind+c.digester,{hours:i,seconds:s,avg:c,use:o}}var Mp=e=>Dp(e).nights,Np=()=>({marks:[],curveStep:10,curve:[0],time:{},problems:{},nights:[],trucks:{total:0,wait:0,at:{}}}),Pp=[`bran`,`seedcake`,`manure`],Fp=new Set([`coop`,`hive`,`composter`,`mill`,`press`,`spinner`,`loom`,`bakery`,`cannery`,`digester`,`garage`,`silo`,`battery`]),Ip=new Set([`ok`,`idle`]);function Lp(e){let t=e.goals.find(e=>e.kind===`deliver`)??e.goals.find(e=>e.kind===`rate`);return t&&`item`in t?t.item:null}var Rp=e=>!e.scenario.sandbox&&(e.completedAt===null||e.completedAt>=e.time-1e-9),zp=(e,t,n)=>e.marks.some(e=>e.kind===t&&n(e));function Bp(e,t){Rp(e)&&Pp.includes(t)&&!zp(e.run,`loop`,e=>e.item===t)&&e.run.marks.push({t:e.time,kind:`loop`,item:t})}function Vp(e,t,n,r,i){if(!Rp(e))return;let a=e.run,o=n?Hp(e):null;o&&r&&(o.short+=t);for(let n of e.buildings){if(G[n.type].inert||(a.time[n.type]=(a.time[n.type]??0)+t,Ip.has(n.status)))continue;let e=`${n.type}|${n.status}|${n.need??``}`;a.problems[e]=(a.problems[e]??0)+t,o&&r&&(n.status===`power`||n.status===`lowpower`)&&!o.types.includes(n.type)&&o.types.push(n.type)}for(let n of e.trucks){if(n.route===null||(a.trucks.total+=t,n.phase!==`queue`&&!(n.phase===`dock`&&n.idle>0)))continue;a.trucks.wait+=t;let r=n.target===null?null:e.buildings.find(e=>e.id===n.target);r&&(a.trucks.at[r.type]=(a.trucks.at[r.type]??0)+t)}let s=Lp(e.scenario);if(s&&(e.completedAt!==null||e.time>=a.curve.length*a.curveStep-1e-6)&&(a.curve.length>=2e3&&(a.curve=a.curve.filter((e,t)=>t%2==0),a.curveStep*=2),a.curve.push(e.delivered[s]??0)),Math.floor(e.time+1e-6)===Math.floor(e.time-t+1e-6)&&e.completedAt===null)return;for(let t of Object.keys(e.made))e.made[t]&&!zp(a,`first`,e=>e.item===t)&&a.marks.push({t:e.time,kind:`first`,item:t});for(let t=1;t<=Math.min(2,e.trucks.length);t++)zp(a,`truck`,e=>(e.n??1)>=t)||a.marks.push({t:e.time,kind:`truck`,n:t});let c=new Map;for(let t of e.buildings)Fp.has(t.type)&&c.set(t.type,(c.get(t.type)??0)+1);for(let[t,n]of c)n>=2&&!zp(a,`second`,e=>e.type===t)&&a.marks.push({t:e.time,kind:`second`,type:t});if(i().forEach((t,n)=>{t&&!zp(a,`goal`,e=>e.goal===n)&&a.marks.push({t:e.time,kind:`goal`,goal:n})}),a.nights.some(e=>e.short>0)&&!zp(a,`night`,()=>!0)){let t=yp(a.nights.find(e=>e.short>0),`short night`);a.marks.push({t:e.time,kind:`night`,n:t.day})}}function Hp(e){let t=kp(e.time,e.scenario.weather.sunset),n=e.run.nights[e.run.nights.length-1];if(!n||n.day!==t){if(e.run.nights.length>=500)return null;e.run.nights.push(n={day:t,short:0,types:[]})}return n}function Up(e){return Object.entries(e.problems).map(([t,n])=>{let[r,i,a]=t.split(`|`);return{type:r,status:i,need:a,seconds:n,share:n/Math.max(1e-9,e.time[r]??0)}}).sort((e,t)=>t.share-e.share||t.seconds-e.seconds)}var Wp=e=>Kf(e.type);function Gp(e){let t=pp(e),n={version:5,scenario:e,map:t,soilBase:[...t.fertility],initialTrees:t.terrain.filter(e=>e===dp.tree).length,buildings:[],routes:[],trucks:[],nextId:1,credits:e.credits,time:0,carry:0,delivered:{},earned:0,stats:{since:0,made:[{}],delivered:{}},reached:e.goals.map(()=>!1),completedAt:null,made:{},run:Np(),chosen:{crop:`wheat`,recipes:{}}};return n.buildings.push(Kp(n,`depot`,t.depot.x,t.depot.y,0)),n}var Kp=(e,t,n,r,i)=>qp(e.nextId++,t,n,r,i);function qp(e,t,n,r,i){let a={id:e,x:n,y:r,rot:i,status:`idle`};switch(t){case`field`:return{...a,type:t,crop:`wheat`,growth:0,stored:0};case`hive`:return{...a,type:t,growth:0,stored:0};case`battery`:return{...a,type:t,charge:0};case`silo`:return{...a,type:t,store:{}};case`sapling`:return{...a,type:t,age:0}}return Kf(t)?{...a,type:t,recipe:qf(t)[0].id,inputs:{},outputs:{},progress:null}:{...a,type:t}}function Jp(e,t){return e.type===`field`&&t.crop?e.crop=t.crop:Wp(e)&&t.recipe&&(e.recipe=t.recipe),e}var Yp=e=>G[e.type].size;function Xp(e){let t=xp(e),n=t.tiles;if(!n){n={grid:new Int32Array(e.map.width*e.map.height),byId:new Map,layout:Cp()};for(let t of e.buildings)Zp(e,n,t,t.id);t.tiles=n}return n}function Zp(e,t,n,r){let i=Yp(n);for(let a=n.y;a<n.y+i;a++)for(let o=n.x;o<n.x+i;o++)t.grid[a*e.map.width+o]=r;r?t.byId.set(n.id,n):t.byId.delete(n.id)}var Qp=e=>Xp(e).layout;function $p(e,t){let n=Xp(e);e.buildings.push(t),Zp(e,n,t,t.id),n.layout=Cp()}function em(e){Xp(e).layout=Cp()}function tm(e,t){let n=Xp(e),r=e.buildings.indexOf(t);r>=0&&e.buildings.splice(r,1),Zp(e,n,t,0),n.layout=Cp()}var nm=(e,t,n)=>t>=0&&n>=0&&t<e.map.width&&n<e.map.height,rm=(e,t,n)=>n*e.map.width+t;function im(e,t,n){if(!nm(e,t,n))return null;let r=Xp(e).grid[n*e.map.width+t];return r?Xp(e).byId.get(r)??null:null}var am=(e,t)=>Xp(e).byId.get(t)??null,om=(e,t)=>t===null?null:e.routes.find(e=>e.id===t)??null,sm=(e,t)=>t===null?null:e.trucks.find(e=>e.id===t)??null,cm=(e,t,n)=>e.map.terrain[n*e.map.width+t];function lm(e){let t=Yp(e);return{x:e.x+t/2,y:e.y+t/2}}function um(e,t,n){let r=Yp(e),i=t<e.x?e.x-t:t>=e.x+r?t-(e.x+r-1):0,a=n<e.y?e.y-n:n>=e.y+r?n-(e.y+r-1):0;return Math.max(i,a)}var dm=e=>{let t=0;for(let n of e.map.terrain)n===dp.tree&&t++;return t},fm=Math.SQRT2,pm=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,fm],[1,-1,fm],[-1,1,fm],[-1,-1,fm]];function mm(e){let t=Qp(e),n=xp(e),r=n.roads;if(r&&r.layout===t)return r;let{width:i,height:a}=e.map,o=new Uint8Array(i*a);for(let t=0;t<a;t++)for(let n=0;n<i;n++)o[t*i+n]=+(cm(e,n,t)===dp.grass&&!im(e,n,t));return r={layout:t,open:o,fields:new Map},n.roads=r,r}var hm=(e,t,n)=>nm(e,t,n)&&mm(e).open[n*e.map.width+t]===1;function gm(e,t){let n=Yp(t),r=e.map.width,i=[],a=(t,n)=>{hm(e,t,n)&&i.push(n*r+t)};for(let e=t.x;e<t.x+n;e++)a(e,t.y-1);for(let e=t.y;e<t.y+n;e++)a(t.x+n,e);for(let e=t.x;e<t.x+n;e++)a(e,t.y+n);for(let e=t.y;e<t.y+n;e++)a(t.x-1,e);return i}function*_m(e,t,n,r){let i=r%t,a=(r-i)/t;for(let[r,o,s]of pm){let c=i+r,l=a+o;c<0||l<0||c>=t||l>=n||!e[l*t+c]||(!r||!o||e[a*t+c]&&e[l*t+i])&&(yield[l*t+c,s])}}function vm(e,t){let n=mm(e),r=n.fields.get(t.id);if(r)return r;let{width:i,height:a}=e.map;r=new Float64Array(i*a).fill(1/0);let o=[],s=(e,t)=>{o.push([e,t]);for(let e=o.length-1;e>0;){let t=e-1>>1;if(o[t][0]<=o[e][0])break;[o[t],o[e]]=[o[e],o[t]],e=t}},c=()=>{let e=o[0],t=yp(o.pop(),`heap entry`);if(o.length){o[0]=t;for(let e=0;;){let t=2*e+1,n=t+1,r=e;if(t<o.length&&o[t][0]<o[r][0]&&(r=t),n<o.length&&o[n][0]<o[r][0]&&(r=n),r===e)break;[o[r],o[e]]=[o[e],o[r]],e=r}}return e};for(let n of gm(e,t))r[n]=0,s(0,n);for(;o.length;){let[e,t]=c();if(!(e>r[t]))for(let[o,c]of _m(n.open,i,a,t))e+c<r[o]&&(r[o]=e+c,s(e+c,o))}return n.fields.set(t.id,r),r}var ym=(e,t,n)=>vm(e,t)[n];function bm(e,t,n){let r=vm(e,t),i=mm(e),{width:a,height:o}=e.map;if(!(r[n]<1/0))return null;let s=[];for(let e=n;r[e]>0;){let t=-1,n=1/0;for(let[s,c]of _m(i.open,a,o,e))r[s]+c<n&&(n=r[s]+c,t=s);if(t<0||r[t]>=r[e])return null;s.push(t),e=t}return s}function xm(e,t,n){let r=vm(e,n),i=-1;for(let n of gm(e,t))(i<0||r[n]<r[i])&&(i=n);if(i<0)return null;let a=bm(e,n,i);return a?[i,...a]:null}function Sm(e,t,n){let r=vm(e,n),i=1/0;for(let n of gm(e,t))i=Math.min(i,r[n]);return i}function Cm(e,t,n){let{width:r,height:i}=e.map;for(let a=0;a<Math.max(r,i);a++){let i=null,o=1/0;for(let s=n-a;s<=n+a;s++)for(let c=t-a;c<=t+a;c++){if(Math.max(Math.abs(c-t),Math.abs(s-n))!==a||!hm(e,c,s))continue;let l=Math.hypot(c-t,s-n);l<o&&(o=l,i=s*r+c)}if(i!==null)return i}return null}function wm(e){let t=xp(e),n=t.flows;return n||(t.flows=n={since:e.time,buckets:[],soil:[]}),n}var Tm=e=>Math.floor(e/10+1e-9)*10;function Em(e,t,n,r=1){let i=wm(e),a=Tm(e.time-1e-6),o=i.buckets[i.buckets.length-1];(!o||o.from<a-1e-6)&&i.buckets.push(o={from:a,made:{},used:{},delivered:{}}),o[t][n]=(o[t][n]??0)+r}function Dm(e,t){let n=wm(e),r=n.soil[n.soil.length-1];if(!r||e.time-r.t>=9.999999){n.soil.push({t:e.time,v:t()});let r=e.time-600-10,i=0;for(;i<n.buckets.length&&n.buckets[i].from+10<=r;)i++;i&&n.buckets.splice(0,i);let a=0;for(;a<n.soil.length&&n.soil[a].t<r;)a++;a&&n.soil.splice(0,a)}}var Om=(e,t)=>Math.max(0,Math.min(t,e.time-wm(e).since));function km(e,t,n,r=300){let i=Om(e,r);if(i<=0)return 0;let a=0;for(let r of wm(e).buckets)r.from+10>e.time-i+1e-6&&(a+=r[t][n]??0);return a/i*60}function Am(e,t,n,r=600,i=10){let a=wm(e),o=r/i,s=e.time-r;return Array.from({length:i},(e,r)=>{let i=s+r*o,c=i+o;if(c<=a.since+1e-6)return null;let l=0;for(let e of a.buckets)e.from>=i-1e-6&&e.from<c-1e-6&&(l+=e[t][n]??0);return l/(c-Math.max(i,a.since))*60})}function jm(e,t=60){let n=wm(e).soil,r=n[n.length-1];if(!r)return null;let i=n.find(e=>e.t>=r.t-t-1e-6);return!i||r.t-i.t<t/2?null:(r.v-i.v)/(r.t-i.t)*60}function Mm(e){let t={},n=(e,n)=>{n>0&&(t[e]=(t[e]??0)+n)};for(let t of e.buildings){let e=Wp(t)?[t.inputs,t.outputs]:t.type===`silo`?[t.store]:[];for(let t of e)for(let[e,r]of Object.entries(t))n(e,r);t.type===`field`&&t.stored&&n(t.harvest??t.crop,t.stored),t.type===`hive`&&t.stored&&n(`honey`,t.stored)}for(let t of e.trucks)for(let e of t.cargo)n(e,1);return t}function Nm(e){let t=e.time-60,n=Math.min(e.time,60);if(n<=0)return 0;let r=0;for(let[n,i]of Object.entries(e.stats.delivered))for(let e of i)e>t&&(r+=Nf[n].price);return r/n*60}var Pm=(e,t)=>xp(e).histories?.get(t.id)??null,Fm=e=>!G[e.type].inert&&!G[e.type].stores,Im=e=>Math.floor(e/5+1e-9)*5;function Lm(e,t,n){let r=xp(e),i=r.histories;i||(r.histories=i=new Map);let a=i.get(t.id);return a||i.set(t.id,a={since:n,runs:[],buckets:[]}),a}function Rm(e,t){let n=Im(t),r=e.buckets[e.buckets.length-1];return(!r||r.from<n-1e-6)&&e.buckets.push(r={from:n,made:{},value:0,steps:0,lowSteps:0,lowShare:0}),r}function zm(e,t,n){if(!Fm(t))return;let r=Rm(Lm(e,t,e.time-1e-6),e.time-1e-6);(r.taken??={})[n]=(r.taken[n]??0)+1}function Bm(e,t,n,r,i){if(!Fm(t))return;let a=Rm(Lm(e,t,e.time-i),e.time-i);a.made[n]=(a.made[n]??0)+r}function Vm(e,t,n,r,i){if(!Fm(t))return;let a=e.time-n,o=Lm(e,t,a),s=o.runs[o.runs.length-1],c=s;(!s||s.status!==t.status||s.need!==t.need)&&o.runs.push(c={from:a,status:t.status,need:t.need});let l=Rm(o,a);t.status===`lowpower`&&(c.share=(c.share??0)+r,c.steps=(c.steps??0)+1,l.lowShare+=r,l.lowSteps++),i!==null&&(l.value+=i,l.steps++)}function Hm(e){let t=xp(e),n=t.histories;if(!n||e.time-(t.historyPruned??-1/0)<5)return;t.historyPruned=e.time;let r=e.time-600-5,i=new Set(e.buildings.map(e=>e.id));for(let[e,t]of n){if(!i.has(e)){n.delete(e);continue}let a=0;for(;a+1<t.runs.length&&t.runs[a+1].from<=r;)a++;a&&t.runs.splice(0,a);let o=0;for(;o<t.buckets.length&&t.buckets[o].from+5<=r;)o++;o&&t.buckets.splice(0,o)}}var Um=e=>e.steps&&e.share!==void 0?e.share/e.steps:void 0;function Wm(e,t,n,r=60){let i=t-n,a=Math.max(i,e.since),o=[];e.runs.forEach((n,r)=>{let i=Math.max(n.from,a),s=Math.min(r+1<e.runs.length?e.runs[r+1].from:t,t);s>i+1e-9&&o.push({from:i,to:s,began:n.from,status:n.status,need:n.need,share:Um(n)})});let s=new Map;for(let e of o){let t=`${e.status}|${e.need??``}`,n=s.get(t);n||s.set(t,n={status:e.status,need:e.need,seconds:0}),n.seconds+=e.to-e.from}let c=[...s.values()].sort((e,t)=>t.seconds-e.seconds),l=Math.max(1,Math.round(n/r/5))*5,u=Math.floor(i/l+1e-9)*l,d=[];for(let e=u;e<t-1e-9;e+=l)d.push({from:e,to:e+l,made:{},value:null});let f=d.map(()=>({value:0,steps:0})),p={},m={},h={},g=0,_=0,v=0,y=0;for(let t of e.buckets){let e=Math.floor((t.from-u)/l+1e-9);if(!(e<0||e>=d.length)){for(let[n,r]of Object.entries(t.made))d[e].made[n]=(d[e].made[n]??0)+r,p[n]=(p[n]??0)+r,m[n]=(m[n]??0)+r;for(let[e,n]of Object.entries(t.taken??{}))h[e]=(h[e]??0)+n;f[e].value+=t.value,f[e].steps+=t.steps,g+=t.value,_+=t.steps,v+=t.lowShare,y+=t.lowSteps}}let b=c.find(e=>e.status===`lowpower`);b&&y&&(b.share=v/y),d.forEach((e,t)=>{f[t].steps&&(e.value=f[t].value/f[t].steps)});let x=t-Math.max(u,e.since);for(let e of Object.keys(p))p[e]=x>0?(p[e]??0)/x*60:0;let S=d.flatMap(e=>e.value===null?[]:[e.value]),C=_?{avg:g/_,min:Math.min(...S),max:Math.max(...S)}:null;return{start:i,now:t,since:e.since,spans:o,shares:c,bars:d,step:l,perMin:p,made:m,taken:h,reading:C}}function Gm(e){let t=e.runs[e.runs.length-1];return t?{status:t.status,need:t.need,from:t.from}:null}var Km={input:`input`,power:`power`,lowpower:`power`,nolink:`power`,blocked:`output`,noroute:`output`,dry:`water`,flowers:`flowers`,noroad:`road`};function qm(e){let t=e.shares.reduce((e,t)=>e+t.seconds,0),n=new Map;for(let t of e.shares){let e=Km[t.status];if(!e)continue;let r=e===`input`||e===`output`?t.need:void 0,i=`${e}|${r??``}`,a=n.get(i);a||n.set(i,a={kind:e,need:r,seconds:0,share:0,statuses:[]}),a.seconds+=t.seconds,a.statuses.includes(t.status)||a.statuses.push(t.status)}for(let e of n.values())e.share=t>0?e.seconds/t:0;return[...n.values()].sort((e,t)=>t.seconds-e.seconds)}var Jm=(e,t,n)=>um(e,t,n)<=K.pylon.reach,Ym=(e,t,n,r)=>Math.hypot(e-n,t-r)<=K.pylon.link;function Xm(e,t,n){let r=lm(n);return Math.max(Math.abs(e+.5-r.x),Math.abs(t+.5-r.y))<=K.sprinklerReach+.5}function Zm(e,t,n){let r=(t,n)=>nm(e,t,n)&&cm(e,t,n)===dp.water;for(let e=0;e<3;e++)if(r(t+e,n-1)||r(t+e,n+3)||r(t-1,n+e)||r(t+3,n+e))return!0;return!1}function Qm(e,t,n){let r=K.waterNear;for(let i=n-r;i<=n+r;i++)for(let a=t-r;a<=t+r;a++)if(nm(e,a,i)&&Math.hypot(a-t,i-n)<=r&&cm(e,a,i)===dp.water)return!0;return!1}var $m=(e,t,n)=>um(e,t,n)<=Qf.reach;function eh(e,t,n){let r=K.shelterReach,i=new Set,a=0;for(let o=n-r;o<=n+r;o++)for(let s=t-r;s<=t+r;s++){if(s===t&&o===n||!nm(e,s,o))continue;let r=im(e,s,o);cm(e,s,o)===dp.tree?a++:r&&G[r.type].tall&&i.add(r)}return Math.max(K.shelterFloor,1-K.shelter*(a+i.size))}var th=e=>Vf.dry+(1-Vf.dry)*e;function nh(e,t){let n=th(e),r=Vf.poorSoil+(Vf.richSoil-Vf.poorSoil)*t/100;return{pace:n*r,byWater:n,bySoil:r}}function rh(e){let t=Qp(e),n=xp(e),r=n.derived;if(r&&r.layout===t)return r;r={layout:t,sprinklers:new Map,pollinated:new Set,flowers:new Map,exposure:new Map,nearWater:new Set,fielded:new Set,neighbours:new Map};let i=e.buildings.filter(e=>e.type===`field`),a=e.buildings.filter(e=>e.type===`hive`),o=e.buildings.filter(e=>e.type===`sprinkler`);for(let t of i){for(let n=t.y;n<t.y+3;n++)for(let i=t.x;i<t.x+3;i++)r.fielded.add(rm(e,i,n));r.sprinklers.set(t.id,o.filter(e=>Xm(e.x,e.y,t))),a.some(e=>$m(t,e.x,e.y))&&r.pollinated.add(t.id)}for(let e of a)r.flowers.set(e.id,i.filter(t=>$m(t,e.x,e.y)));for(let t of e.buildings)t.type===`turbine`&&r.exposure.set(t.id,eh(e,t.x,t.y));for(let t of o)Qm(e,t.x,t.y)&&r.nearWater.add(t.id);for(let t of e.buildings)r.neighbours.set(t.id,ih(e,t));return n.derived=r,r}function ih(e,t){let n=G[t.type].size,r=new Set;for(let i=0;i<n;i++)for(let[a,o]of[[t.x+i,t.y-1],[t.x+i,t.y+n],[t.x-1,t.y+i],[t.x+n,t.y+i]]){let t=im(e,a,o);t&&r.add(t)}return[...r]}var ah=e=>!!G[e.type].harvests||Wp(e),oh=(e,t)=>rh(e).sprinklers.get(t.id)??[],sh=(e,t)=>rh(e).pollinated.has(t.id),ch=(e,t)=>rh(e).exposure.get(t.id)??1,lh=(e,t)=>rh(e).nearWater.has(t.id);function uh(e,t){let n=0;for(let r=t.y;r<t.y+3;r++)for(let i=t.x;i<t.x+3;i++)n+=e.map.fertility[rm(e,i,r)];return n/9}function dh(e,t,n){for(let r=t.y;r<t.y+3;r++)for(let i=t.x;i<t.x+3;i++){let t=rm(e,i,r);e.map.fertility[t]=Math.max(0,Math.min(100,e.map.fertility[t]+n))}}function fh(e){let t=e.buildings.filter(e=>e.type===`field`),n=t.length?t.reduce((t,n)=>t+uh(e,n),0)/t.length:50,r=Math.max(-np.cap,Math.min(np.cap,(dm(e)-e.initialTrees)*np.perTree));return Math.max(0,Math.min(100,n+r))}var ph=e=>`item`in e?[e.item]:Pf[e.group],mh=(e,t)=>ph(t).reduce((t,n)=>t+(e.inputs[n]??0),0),hh=e=>`item`in e?Nf[e.item].name.toLowerCase():Rf[e.group];function gh(e){return Wp(e)?Jf(e.recipe):null}function _h(e,t){return t.inputs.find(t=>mh(e,t)<t.n)??null}function vh(e,t){return t.outputs.find(t=>(e.outputs[t.item]??0)+t.n>t.n*3)??null}function yh(e,t,n){for(let r of n.inputs){let n=r.n;for(;n>0;){let i=[...ph(r)].sort((e,n)=>(t.inputs[n]??0)-(t.inputs[e]??0))[0];t.inputs[i]=(t.inputs[i]??0)-1,t.inputs[i]||delete t.inputs[i],bh(e,i),n--}}}function bh(e,t){Em(e,`used`,t),Bp(e,t)}var xh=(e,t)=>uh(e,t)<Vf.compostBelow,Sh=(e,t)=>Math.max(0,Math.ceil((Vf.compostBelow-uh(e,t))/Vf.compostGain));function Ch(e,t,n){if(t.type===`depot`)return wh(e,n),!0;if(t.type===`silo`)return(t.store[n]??0)>=$f.perGood?!1:(t.store[n]=(t.store[n]??0)+1,!0);if(t.type===`field`)return n!==`compost`||!xh(e,t)?!1:(dh(e,t,Vf.compostGain),bh(e,`compost`),!0);if(!Wp(t))return!1;let r=gh(t).inputs.find(e=>ph(e).includes(n));return!r||mh(t,r)>=r.n*3?!1:(t.inputs[n]=(t.inputs[n]??0)+1,!0)}function wh(e,t){e.delivered[t]=(e.delivered[t]??0)+1,e.credits+=Nf[t].price,e.earned+=Nf[t].price,(e.stats.delivered[t]??=[]).push(e.time),Em(e,`delivered`,t)}function Th(e,t,n,r){e.made[n]=(e.made[n]??0)+r,Bm(e,t,n,r,rp),Em(e,`made`,n,r);let i=e.stats.made[0];i[n]=(i[n]??0)+r}function Eh(e,t){return e.type===`field`?(e.harvest??e.crop)===t?e.stored:0:e.type===`hive`?t===`honey`?e.stored:0:e.type===`silo`?e.store[t]??0:Wp(e)?e.outputs[t]??0:0}function Dh(e,t,n){if(zm(e,t,n),t.type===`field`){t.stored--,t.stored||(t.harvest=t.crop);return}if(t.type===`hive`){t.stored--;return}let r=t.type===`silo`?t.store:Wp(t)?t.outputs:null;if(!r)return;let i=yp(r[n],`stock`)-1;i?r[n]=i:delete r[n]}function Oh(e){return e.type===`field`?[`compost`]:Wp(e)?gh(e).inputs.flatMap(e=>[...ph(e)]):[]}var kh=ah,Ah=e=>e.type===`field`||Wp(e);function jh(e,t){if(e===t||!kh(e)||!Ah(t))return[];let n=Bh(t);return Vh(e).filter(e=>n.includes(e))}var Mh=(e,t)=>rh(e).neighbours.get(t.id)??ih(e,t);function Nh(e,t,n=Mh(e,t)){let r=[],i=[];for(let e of n){let n=jh(e,t),a=jh(t,e);n.length&&r.push({b:e,goods:n}),a.length&&i.push({b:e,goods:a})}return{from:r,to:i}}function Ph(e,t,n,r,i={}){let a=Jp(qp(0,t,n,r,0),i);return Nh(e,a,ih(e,a))}var Fh=(e,t)=>Mh(e,t).some(e=>jh(e,t).length>0||jh(t,e).length>0),Ih=.8,Lh=e=>xp(e).handoffs??[];function Rh(e){let t=xp(e),n=t.lastFed??=new Map,r=t.handoffs??=[],i=0;for(;i<r.length&&(r[i].time<e.time-.8||r[i].time>e.time);)i++;i&&r.splice(0,i);let a=e.buildings.filter(t=>Ah(t)&&Mh(e,t).length>0);a.sort((e,t)=>(n.get(e.id)??-1)-(n.get(t.id)??-1)||e.id-t.id);for(let t of a){let i=Mh(e,t).filter(kh);if(i.length)for(let a of Bh(t)){let o=null,s=0;for(let e of i){let t=Eh(e,a);t>s&&(s=t,o=e)}o&&Ch(e,t,a)&&(Dh(e,o,a),n.set(t.id,e.time),r.push({from:o.id,to:t.id,item:a,time:e.time}))}}}function zh(e){return G[e.type].stores?[...Mf]:e.type===`field`?[`compost`]:[...new Set(qf(e.type).flatMap(e=>e.inputs.flatMap(e=>[...ph(e)])))]}var Bh=e=>Wp(e)?Oh(e):zh(e),Vh=e=>Wp(e)?[...new Set([...gh(e).outputs.map(e=>e.item),...Object.keys(e.outputs)])]:Hh(e);function Hh(e){return e.type===`silo`?[...Mf]:e.type===`field`?[...new Set([e.crop,e.harvest??e.crop])]:e.type===`hive`?[`honey`]:[...new Set(qf(e.type).flatMap(e=>e.outputs.map(e=>e.item)))]}function Uh(e){let t=xp(e),n=t.fleet;return n||(t.fleet=n={since:e.time,arrivals:new Map,trucks:new Map,lastPrune:-1/0}),n}function Wh(e){switch(e.phase){case`drive`:return`drive`;case`dock`:return e.idle>0?`wait`:`work`;case`queue`:return`wait`;case`charge`:return`charge`;case`parked`:return e.route===null?`parked`:`charge`;case`stuck`:return`stuck`}}function Gh(e,t){if(t.route===null||t.target===null)return;let n=Uh(e),r=n.arrivals.get(t.route);r||n.arrivals.set(t.route,r=[]),r.push({truck:t.id,stop:t.stop,building:t.target,time:e.time})}function Kh(e,t){let n=Uh(e),r=e.time-t,i=Math.floor(r/5+1e-9)*5;for(let r of e.trucks){let e=n.trucks.get(r.id);e||n.trucks.set(r.id,e=[]);let a=e[e.length-1];(!a||a.from<i-1e-6||a.route!==r.route)&&e.push(a={from:i,route:r.route,seconds:{}});let o=Wh(r);a.seconds[o]=(a.seconds[o]??0)+t}if(e.time-n.lastPrune<5)return;n.lastPrune=e.time;let a=e.time-600-5,o=new Set(e.routes.map(e=>e.id)),s=new Set(e.trucks.map(e=>e.id));for(let[e,t]of n.arrivals){if(!o.has(e)){n.arrivals.delete(e);continue}let r=0;for(;r<t.length&&t[r].time<a;)r++;r&&t.splice(0,r)}for(let[e,t]of n.trucks){if(!s.has(e)){n.trucks.delete(e);continue}let r=0;for(;r<t.length&&t[r].from+5<=a;)r++;r&&t.splice(0,r)}}function qh(e,t){let n=Uh(e),r=Math.min(600,e.time-n.since),i=e.time-r,a=(n.arrivals.get(t.id)??[]).filter(e=>e.time>=i-1e-6),o=t.stops.map((e,t)=>{let n=a.filter(n=>n.stop===t&&n.building===e.building).map(e=>e.time);return{arrivals:n.length,gap:n.length>=2?(n[n.length-1]-n[0])/(n.length-1):null}}),s=[],c=new Map;for(let e of a){let t=`${e.truck}:${e.stop}:${e.building}`,n=c.get(t);n!==void 0&&s.push(e.time-n),c.set(t,e.time)}let l=s.length?s.reduce((e,t)=>e+t,0)/s.length:null,u=0,d=t.stops.map(t=>am(e,t.building));for(let t=0;t<d.length&&d.length>1;t++){let n=d[t],r=d[(t+1)%d.length];if(!n||!r){u=null;break}if(n===r)continue;let i=Sm(e,n,r);if(i===1/0){u=null;break}u+=i/q.speed}let f=e.trucks.some(e=>e.route===t.id),p=null;if(f){let e=e=>e.arrivals<2?(e.arrivals-2)*1e9:-yp(e.gap,`stop gap`);o.forEach((t,n)=>{(!p||e(t)<e(p.timing))&&(p={stop:n,timing:t})})}return{window:r,loop:l,driving:t.stops.length>1?u:null,stops:o,slowest:p}}function Jh(e,t,n){let r=Uh(e),i=e.time-600,a={},o=0;for(let e of r.trucks.get(t.id)??[])if(!(e.from+5<=i||e.route===null||n!==void 0&&e.route!==n))for(let[t,n]of Object.entries(e.seconds))a[t]=(a[t]??0)+n,t!==`parked`&&(o+=n);return{total:o,seconds:a,idle:o>0?(a.wait??0)/o:null}}var Yh=e=>e.wanted*e.share,Xh=e=>G[e.type].grid!==`link`&&(Zh(e)||Qh(e)||G[e.type].grid===`storage`),Zh=e=>G[e.type].grid===`source`,Qh=e=>!!G[e.type].power;function $h(e){let t=Qp(e),n=xp(e),r=n.networks;if(r&&r.layout===t)return r;let i=e.buildings.filter(e=>G[e.type].grid===`link`),a=i.map((e,t)=>t),o=e=>a[e]===e?e:a[e]=o(a[e]);for(let e=0;e<i.length;e++)for(let t=e+1;t<i.length;t++)Ym(i[e].x,i[e].y,i[t].x,i[t].y)&&(a[o(e)]=o(t));let s=new Map,c=[];i.forEach((e,t)=>{let n=o(t),r=s.get(n);r||(r={id:c.length+1,pylons:[],members:[],made:0,wanted:0,share:0,stored:0,capacity:0},s.set(n,r),c.push(r)),r.pylons.push(e)});let l=new Map;for(let e of i)l.set(e.id,yp(s.get(o(i.indexOf(e))),`network`));for(let t of e.buildings){if(!Xh(t))continue;let e=i.findIndex(e=>Jm(t,e.x,e.y));if(e<0)continue;let n=yp(s.get(o(e)),`network`);n.members.push(t),l.set(t.id,n)}if(r)for(let e of c){let t=r.list.find(t=>t.pylons.some(t=>e.pylons.includes(t)));t&&(e.made=t.made,e.wanted=t.wanted,e.share=t.share)}return r={layout:t,list:c,of:l},n.networks=r,r}var eg=(e,t)=>$h(e).of.get(t.id)??null,tg=(e,t)=>Math.hypot(e.x-t.x,e.y-t.y);function ng(e,t){let n=eg(e,t);if(!n)return null;let r=null,i=1/0;for(let e of n.pylons){if(!Jm(t,e.x,e.y))continue;let n=Math.hypot(e.x+.5-(t.x+Yp(t)/2),e.y+.5-(t.y+Yp(t)/2));n<i&&(i=n,r=e)}return r}function rg(e){let t=e.pylons,n=t.length;if(n<2)return[];let r=Array(n).fill(!1),i=Array(n).fill(1/0),a=Array(n).fill(-1),o=[];i[0]=0;for(let e=0;e<n;e++){let e=-1;for(let t=0;t<n;t++)!r[t]&&(e<0||i[t]<i[e])&&(e=t);r[e]=!0,a[e]>=0&&o.push([t[a[e]],t[e]]);for(let o=0;o<n;o++){let n=tg(t[e],t[o]);!r[o]&&Ym(t[e].x,t[e].y,t[o].x,t[o].y)&&n<i[o]&&(i[o]=n,a[o]=e)}}return o}var ig=(e,t,n)=>$h(e).list.flatMap(e=>e.pylons).filter(e=>(e.x!==t||e.y!==n)&&Ym(e.x,e.y,t,n));function ag(e,t){return G[t.type].power?xp(e).shares?.get(t.id)??0:1}function og(e,t){let n=G[t.type];if(!n.power)return 0;if(t.type===`sprinkler`)return lh(e,t)?K.sprinklerNearWater:K.sprinklerFar;if(t.type===`garage`)return xp(e).charging?.get(t.id)??0;if(!Wp(t))return 0;let r=gh(t);return t.progress===null?!_h(t,r)&&!vh(t,r)?n.power:0:n.power}function sg(e,t,n,r){switch(t.type){case`solar`:return K.solar*n;case`turbine`:return K.turbine*r*ch(e,t);case`digester`:return t.progress===null?0:K.digester;default:return 0}}function cg(e,t,n,r){let i=new Map,a={solar:0,wind:0,digester:0,given:0,taken:0,wanted:0,used:0,short:0,stored:0,capacity:0,night:t<=0},o={};for(let s of $h(e).list){let c=0,l=0,u=0,d=[],f=new Map;for(let r of s.members){let i=sg(e,r,t,n),o=og(e,r);c+=i,(r.type===`solar`||r.type===`turbine`||r.type===`digester`)&&(a[r.type===`turbine`?`wind`:r.type]+=i),l+=o,o>0&&f.set(r,o),r.type===`battery`&&(d.push(r),u+=K.battery.capacity)}let p=1;if(c>=l){let e=(c-l)*r;for(let t of d){let n=Math.min(e,K.battery.rate*r,K.battery.capacity-t.charge);t.charge+=n,e-=n,a.taken+=n/r}}else{let e=(l-c)*r,t=0;for(let n of d){let i=Math.min(e,K.battery.rate*r,n.charge);n.charge-=i,e-=i,t+=i}a.given+=t/r,p=l>0?Math.min(1,(c+t/r)/l):1,p>.999&&(p=1)}s.made=c,s.wanted=l,s.share=p,s.stored=d.reduce((e,t)=>e+t.charge,0),s.capacity=u,a.wanted+=l,a.used+=l*p,a.short+=l*(1-p),a.stored+=s.stored,a.capacity+=u;for(let e of s.members)i.set(e.id,p);for(let[e,t]of f)o[e.type]=(o[e.type]??0)+t*p}xp(e).shares=i,Ap(e,a,o,r)}function lg(e){let t=new Map;for(let n of e.trucks){if(n.phase!==`parked`&&n.phase!==`charge`)continue;let e=Math.min(q.chargeRate,Math.max(0,q.battery-n.energy)/rp);e>0&&t.set(n.garage,(t.get(n.garage)??0)+e)}xp(e).charging=t}function ug(e){let t=xp(e).charging;for(let n of e.buildings){if(n.type!==`garage`)continue;let r=t?.get(n.id)??0,i=ag(e,n);n.need=void 0,n.status=eg(e,n)?r>0&&i<=0?`power`:r>0&&i<1?`lowpower`:r>0?`ok`:`idle`:`power`}}var dg=e=>!!G[e.type].stores||ah(e),fg=(e,t)=>rm(e,Math.floor(t.x),Math.floor(t.y)),pg=(e,t)=>am(e,t.garage),mg=(e,t)=>om(e,t.route),hg=(e,t)=>e.routes.filter(e=>e.stops.some(e=>e.building===t.id)),gg=(e,t)=>e.trucks.filter(e=>e.route===t.id);function _g(e,t,n){let r=bm(e,n,fg(e,t));return r?(t.path=r,t.target=n.id,t.phase=`drive`,t.idle=0,!0):!1}function vg(e,t){let n=yp(pg(e,t),`garage`);if(t.path=[],ym(e,n,fg(e,t))===0){t.phase=mg(e,t)?.stops.length?`charge`:`parked`,t.target=n.id,t.idle=0;return}_g(e,t,n)||(t.phase=`stuck`,t.target=null)}function yg(e,t,n){let r=mg(e,t),i=yp(pg(e,t),`garage`);if(!r||!r.stops.length){vg(e,t);return}let a=fg(e,t),o=r.stops.length,s=-1;for(let t=0;t<o;t++){let i=am(e,r.stops[(n+t)%o].building);if(i&&ym(e,i,a)<1/0){s=(n+t)%o;break}}if(t.stop=(n%o+o)%o,s<0){t.phase=`stuck`,t.path=[],t.target=null;return}t.stop=s;let c=yp(am(e,r.stops[s].building),`stop building`),l=yp(bm(e,c,a),`path`),u=ym(e,c,a),d=ym(e,i,l.length?l[l.length-1]:a);if(!t.charged&&d<1/0&&ym(e,i,a)<1/0&&t.energy<(u+d)*q.joulesPerTile){vg(e,t);return}t.charged=!1,t.path=l,t.target=c.id,t.phase=`drive`,t.idle=0}function bg(e,t){let n=0,r=new Set;for(let i of t.stops){let t=am(e,i.building);if(t&&i.drop.includes(`compost`)){if(t.type!==`field`){if(zh(t).includes(`compost`))return 1/0;continue}r.has(t.id)||(n+=Sh(e,t)),r.add(t.id)}}if(!r.size)return 1/0;for(let r of gg(e,t))n-=r.cargo.filter(e=>e===`compost`).length;return n}var xg=(e,t,n)=>n!==`compost`||bg(e,t)>0,Sg=(e,t,n,r,i)=>!t.cargo.some(t=>n.drop.includes(t)&&!(r.type===`field`&&t===`compost`&&!xh(e,r)))&&(t.cargo.length>=q.cargo||!n.pick.some(t=>xg(e,i,t)));function Cg(e,t,n,r,i){for(let a=0;a<t.cargo.length;a++){let o=t.cargo[a];if(n.drop.includes(o)&&Ch(e,r,o))return t.cargo.splice(a,1),i.moved.push(e.time),!0}if(t.cargo.length>=q.cargo)return!1;let a=n.pick.length;for(let o=0;o<a;o++){let s=n.pick[(n.turn+o)%a];if(Eh(r,s)>0&&xg(e,i,s))return Dh(e,r,s),t.cargo.push(s),n.turn=(n.turn+o+1)%a,!0}return!1}function wg(e,t,n,r){let i=mg(e,t),a=i?.stops[t.stop],o=t.target===null?null:am(e,t.target);if(!i||!a||!o||a.building!==o.id){Eg(e,t);return}t.budget+=q.moveRate*n;let s=!1;for(;t.budget>=1;)if(Cg(e,t,a,o,i))--t.budget,t.idle=0;else{s=!0,t.budget=1;break}if(Sg(e,t,a,o,i)){yg(e,t,t.stop+1);return}s&&(t.idle+=n,(t.idle>=a.wait-1e-9||r)&&yg(e,t,t.stop+1))}function Tg(e,t,n){let r=e.map.width,i=(t.energy>0?q.speed:q.crawl)*n;for(;i>1e-9&&t.path.length;){let e=t.path[0],n=e%r+.5,a=Math.floor(e/r)+.5,o=n-t.x,s=a-t.y,c=Math.hypot(o,s);c>1e-6&&(t.heading=Math.atan2(o,s));let l=Math.min(c,i);c>1e-9&&(t.x+=o/c*l,t.y+=s/c*l),i-=l,t.energy=Math.max(0,t.energy-l*q.joulesPerTile),l>=c-1e-9&&(t.x=n,t.y=a,t.path.shift())}if(t.path.length)return;let a=t.target===null?null:am(e,t.target);if(!a){Eg(e,t);return}if(a.id===t.garage){t.phase=mg(e,t)?.stops.length?`charge`:`parked`,t.idle=0;return}t.phase=`queue`,t.arrived=e.time,t.idle=0,Gh(e,t)}function Eg(e,t){let n=mg(e,t);if(t.phase===`parked`||t.phase===`charge`){n?.stops.length||(t.phase=`parked`);return}if(!n?.stops.length){vg(e,t);return}yg(e,t,t.stop)}function Dg(e,t,n){let r=t.stops.length;for(let i of gg(e,t)){if(!r){i.stop=0,Eg(e,i);continue}let t=n[i.stop];if(t!=null){i.stop=t,i.phase===`stuck`&&Eg(e,i);continue}i.stop=n.slice(0,i.stop).filter(e=>e!==null).length%r,((i.phase===`drive`||i.phase===`queue`||i.phase===`dock`)&&i.target!==i.garage||i.phase===`stuck`)&&(i.phase!==`drive`&&(i.phase=`stuck`),yg(e,i,i.stop))}}function Og(e,t,n){let r=yp(pg(e,t),`garage`),i=Math.min(q.chargeRate*n,q.battery-t.energy)*(eg(e,r)?ag(e,r):0);return t.energy=Math.min(q.battery,t.energy+i),i>1e-9}function kg(e,t){let n=Qp(e);if(xp(e).truckLayout!==n){xp(e).truckLayout=n;for(let t of e.trucks){if(!hm(e,Math.floor(t.x),Math.floor(t.y))){let n=Cm(e,Math.floor(t.x),Math.floor(t.y));n!==null&&(t.x=n%e.map.width+.5,t.y=Math.floor(n/e.map.width)+.5)}let n=t.target===null?null:am(e,t.target),r=fg(e,t);if(t.phase===`queue`||t.phase===`dock`){(!n||ym(e,n,r)!==0)&&(t.phase=`stuck`,Eg(e,t));continue}if(t.phase===`parked`||t.phase===`charge`){ym(e,yp(pg(e,t),`garage`),r)!==0&&vg(e,t);continue}t.phase===`drive`&&(n&&_g(e,t,n)||(n?.id===t.garage?(t.phase=`stuck`,t.path=[],t.target=null):Eg(e,t)))}}let r=new Set;for(let t of e.trucks)t.phase===`queue`&&t.target!==null&&r.add(t.target);for(let n of e.trucks)switch(n.phase){case`parked`:Og(e,n,t),mg(e,n)?.stops.length&&(n.charged=!1,yg(e,n,n.stop));break;case`charge`:if(Og(e,n,t)?n.idle=0:n.idle+=t,!mg(e,n)?.stops.length){n.phase=`parked`;break}(n.energy>=q.battery-1e-6||n.idle>=q.giveUp)&&(n.charged=!0,yg(e,n,n.stop));break;case`drive`:Tg(e,n,t);break;case`dock`:wg(e,n,t,n.target!==null&&r.has(n.target));break;case`stuck`:Eg(e,n)}let i=new Map,a=new Map;for(let t of e.trucks)if(t.target!==null&&(t.phase===`dock`&&i.set(t.target,(i.get(t.target)??0)+1),t.phase===`queue`)){let e=a.get(t.target);e?e.push(t):a.set(t.target,[t])}for(let[t,n]of a){let r=am(e,t);if(!r){for(let t of n)Eg(e,t);continue}n.sort((e,t)=>e.arrived-t.arrived||e.id-t.id);for(let e=ep(r.type)-(i.get(t)??0),a=0;e>0&&a<n.length;e--,a++){let e=n[a];e.phase=`dock`,e.budget=0,e.idle=0}}}function Ag(e,t){return!dg(t)&&t.type!==`garage`?!1:gm(e,t).length?hg(e,t).some(n=>gg(e,n).some(n=>{let r=pg(e,n);return!!r&&Sm(e,r,t)===1/0})):t.type===`garage`||hg(e,t).length>0||!Fh(e,t)}var jg=e=>gp({message:e}),Mg=_p,Ng=e=>e.ok?e.value.message:e.error,Pg=(e,t)=>e.scenario.sandbox?0:G[t].cost,Fg=(e,t)=>e.scenario.sandbox?0:tp[t];function Ig(e,t,n,r){let i=G[t];if(!i.category)return Mg(`The ${i.name.toLowerCase()} can't be built.`);for(let t=r;t<r+i.size;t++)for(let r=n;r<n+i.size;r++){if(!nm(e,r,t))return Mg(`Off the edge of the map.`);let n=cm(e,r,t);if(n===dp.tree)return Mg(`A tree is in the way. Remove it first.`);if(n===dp.rock)return Mg(`Rock is in the way. Remove it first.`);if(n===dp.water&&!i.onWater)return Mg(`The ${i.name.toLowerCase()} can't stand on water.`);let a=im(e,r,t);if(a)return Mg(`The ${G[a.type].name.toLowerCase()} is in the way.`)}return e.credits<Pg(e,t)?Mg(`Not enough credits: the ${i.name.toLowerCase()} costs ${Pg(e,t)}.`):gp(null)}function Lg(e){if(e===`field`)return zf.map(e=>({crop:e}));let t=qf(e);return t.length>1?t.map(e=>({recipe:e.id})):[]}function Rg(e,t){let n=Lg(t);if(!n.length)return{};if(t===`field`)return{crop:e.chosen.crop};let r=e.chosen.recipes[t];return n.find(e=>e.recipe===r)??n[0]}function zg(e,t,n){t===`field`&&n.crop?e.chosen.crop=n.crop:n.recipe&&Lg(t).some(e=>e.recipe===n.recipe)&&(e.chosen.recipes[t]=n.recipe)}function Bg(e,t,n){let r=Lg(e);if(!r.length)return{};let i=r.findIndex(e=>e.crop===t.crop&&e.recipe===t.recipe);return r[(Math.max(i,0)+n+r.length)%r.length]}function Vg(e){return e.crop?Bf[e.crop].name.toLowerCase():e.recipe?Nf[Jf(e.recipe).outputs[0].item].name.toLowerCase():``}function Hg(e,t,n,r,i,a={}){let o=Ig(e,t,n,r);if(!o.ok)return o;let s=Lg(t);if((a.crop||a.recipe)&&!s.some(e=>e.crop===a.crop&&e.recipe===a.recipe))throw Error(`A ${t} can't be placed with ${JSON.stringify(a)}`);let c=Jp(Kp(e,t,n,r,i),a);e.credits-=Pg(e,t),$p(e,c);let l=Vg(a);return gp({message:`Built a ${G[t].name.toLowerCase()}${l?` (${l})`:``}.`,building:c})}function Ug(e,t){if(t.type===`depot`)return Mg(`The depot stays: it's where the commission is delivered.`);if(!e.buildings.includes(t))return Mg(``);let n=e.trucks.filter(e=>e.garage===t.id);for(let t of n)Xg(e,t);tm(e,t),e.credits+=Pg(e,t.type);for(let n of e.routes){if(!n.stops.some(e=>e.building===t.id))continue;let r=0,i=n.stops.map(e=>e.building===t.id?null:r++);n.stops=n.stops.filter(e=>e.building!==t.id),wp(e),Dg(e,n,i)}return jg(`Removed the ${G[t.type].name.toLowerCase()}${n.length?` and its ${n.length} truck${n.length>1?`s`:``}`:``} (refunded).`)}function Wg(e,t,n){if(!nm(e,t,n))return Mg(``);let r=im(e,t,n);if(r)return Ug(e,r);let i=cm(e,t,n);if(i!==dp.tree&&i!==dp.rock)return Mg(``);let a=i===dp.tree?`tree`:`rock`,o=Fg(e,a);return e.credits<o?Mg(`Clearing a ${a} costs ${o} credits.`):(e.credits-=o,e.map.terrain[rm(e,t,n)]=dp.grass,em(e),jg(a===`tree`?`Cleared a tree (${o} credits). Fewer trees: soil health falls a little.`:`Cleared rock (${o} credits).`))}function Gg(e,t,n){if(t.type!==`field`||t.crop===n)return Mg(``);for(let r of e.routes)for(let e of r.stops)e.building===t.id&&e.pick.includes(t.crop)&&!e.pick.includes(n)&&(e.pick.push(n),e.drop=e.drop.filter(e=>e!==n));return t.crop=n,t.growth=0,jg(`The field now grows ${Bf[n].name.toLowerCase()}${t.stored?` (once its ${Bf[t.harvest??n].name.toLowerCase()} harvest has gone)`:``}.`)}function Kg(e,t){if(e.recipe===t)return Mg(``);let n=qf(e.type).find(e=>e.id===t);return n?e.progress===null?(e.recipe=t,e.progress=null,jg(`Now making ${Nf[n.outputs[0].item].name.toLowerCase()}.`)):Mg(`Wait for the batch in progress to finish.`):Mg(``)}var qg=e=>e.scenario.sandbox?0:q.cost,Jg=e=>G[e.type].name.toLowerCase();function Yg(e,t){if(t.type!==`garage`||!e.buildings.includes(t))return Mg(``);if(e.trucks.filter(e=>e.garage===t.id).length>=q.perGarage)return Mg(`A garage holds ${q.perGarage} trucks. Build another garage for more.`);if(e.credits<qg(e))return Mg(`Not enough credits: a truck costs ${qg(e)}.`);let n=e.map.width,r=gm(e,t)[0]??Cm(e,t.x,t.y);if(r==null)return Mg(`There is no open ground for a truck.`);e.credits-=qg(e);let i={id:e.nextId++,garage:t.id,route:null,stop:0,phase:`parked`,x:r%n+.5,y:Math.floor(r/n)+.5,heading:0,path:[],target:t.id,energy:q.battery,cargo:[],idle:0,budget:0,arrived:0,charged:!1};return e.trucks.push(i),wp(e),gp({message:gm(e,t).length?`Bought a truck. Give it a route.`:`Bought a truck, but trucks can't reach the garage: leave an open tile beside it.`,truck:i})}function Xg(e,t){let n=e.trucks.indexOf(t);return n<0?Mg(``):(e.trucks.splice(n,1),wp(e),e.credits+=qg(e),jg(`Sold the truck (refunded)${t.cargo.length?`; its ${t.cargo.length} goods are lost`:``}.`))}function Zg(e,t,n){return(n?.id??null)===t.route?Mg(``):(t.route=n?.id??null,t.stop=0,wp(e),(t.phase===`queue`||t.phase===`dock`)&&(t.phase=`stuck`),t.phase===`charge`&&(t.phase=`parked`),Eg(e,t),jg(n?`The truck now runs ${n.name}.`:`The truck drives home and waits there.`))}function Qg(e){if(!e.cargo.length)return Mg(`The truck is empty.`);let t=e.cargo.length;return e.cargo=[],jg(`Dumped ${t} good${t>1?`s`:``}.`)}function $g(e,t,n){let r=n.replace(/\s+/g,` `).trim().slice(0,24);return r?r===t.name?Mg(``):(t.name=r,wp(e),jg(`Renamed the route to ${r}.`)):Mg(`A route needs a name.`)}function e_(e,t){let n=`${t.name.slice(0,17)} (copy)`;for(let r=2;e.routes.some(e=>e.name===n);r++)n=`${t.name.slice(0,15)} (copy ${r})`;let r={id:e.nextId++,name:n.slice(0,24),stops:t.stops.map(e=>({...e,drop:[...e.drop],pick:[...e.pick],turn:0})),moved:[]};return e.routes.push(r),wp(e),r}function t_(e){let t=1;for(;e.routes.some(e=>e.name===`Route ${t}`);)t++;let n={id:e.nextId++,name:`Route ${t}`,stops:[],moved:[]};return e.routes.push(n),wp(e),n}function n_(e,t){let n=e.routes.indexOf(t);if(n<0)return Mg(``);e.routes.splice(n,1),wp(e);for(let n of e.trucks)n.route===t.id&&(n.route=null,n.stop=0,(n.phase===`queue`||n.phase===`dock`)&&(n.phase=`stuck`),Eg(e,n));return jg(`Deleted ${t.name}.`)}function r_(e){if(G[e.type].stores)return{building:e.id,drop:[...Mf],pick:[],wait:q.wait,turn:0};let t=Hh(e);return{building:e.id,drop:zh(e).filter(e=>!t.includes(e)),pick:t,wait:q.wait,turn:0}}function i_(e,t,n){if(!dg(n))return Mg(`Trucks don't stop at the ${Jg(n)}: it has no goods.`);if(t.stops.length>=q.maxStops)return Mg(`A route has at most ${q.maxStops} stops.`);let r=t.stops.map((e,t)=>t);return t.stops.push(r_(n)),wp(e),Dg(e,t,r),jg(`Added the ${Jg(n)} as stop ${t.stops.length} of ${t.name}.${gm(e,n).length?``:` Trucks can't reach it yet: leave an open tile beside it.`}`)}function a_(e,t,n){if(!t.stops[n])return Mg(``);let r=t.stops.map((e,t)=>t===n?null:t<n?t:t-1);return t.stops.splice(n,1),wp(e),Dg(e,t,r),jg(`Took stop ${n+1} out of ${t.name}.`)}function o_(e,t,n,r){let i=n+r;return!t.stops[n]||!t.stops[i]?Mg(``):([t.stops[n],t.stops[i]]=[t.stops[i],t.stops[n]],wp(e),Dg(e,t,t.stops.map((e,t)=>t===n?i:t===i?n:t)),jg(``))}function s_(e,t,n,r,i){let a=t.stops[n];if(!a||(a.drop.includes(r)?`drop`:a.pick.includes(r)?`pick`:null)===i)return Mg(``);a.drop=a.drop.filter(e=>e!==r),a.pick=a.pick.filter(e=>e!==r),i&&a[i].push(r),wp(e);let o=Nf[r].name.toLowerCase();return jg(i===`drop`?`Drops ${o} there.`:i===`pick`?`Picks up ${o} there.`:`Leaves ${o} alone there.`)}function c_(e,t,n,r){let i=t.stops[n],a=Math.max(0,Math.min(q.maxWait,Math.round(r)));return!i||i.wait===a?Mg(``):(i.wait=a,wp(e),jg(``))}var l_=1.5,u_={sunrise:6,sunset:20,sun:1,wind:.5,gust:.35},d_={soil:60,soilSpread:25,water:`river`,forest:.12,rock:.04},f_=60,p_=[{id:`c1`,name:`First Light`,seed:1101,width:44,height:36,credits:1200,par:1200,blurb:`Brightwater needs grain and flour to get through the season. Lay your first fields, a powered mill, and trucks to carry it all.`,terrain:{...d_,forest:.08,rock:.02},weather:u_,tags:[`Gentle`],goals:[{kind:`deliver`,item:`wheat`,n:120},{kind:`deliver`,item:`flour`,n:80}],tips:[`Place a few fields (F) on rich soil (V shows it). Leave open ground between buildings: trucks drive on it.`,`Build a garage (T) and buy a truck. Give it a new route and click the fields, then the depot: it takes their wheat to the depot.`,`Build a mill right beside a couple of fields: it takes their wheat without a truck. A second route takes its flour and bran to the depot.`,`The mill and the garage (trucks charge there) need power: a solar panel (S) and a pylon (P) within ${K.pylon.reach} tiles of both. A battery keeps them going at night.`,`Sprinklers near the fields make them grow ${+(1/Vf.dry).toFixed(1)} times as fast. Watch the markers: yellow waits for input, red has no power.`]},{id:`c2`,name:`Morning Bread`,seed:2202,width:48,height:40,credits:1600,par:2100,blurb:`Fresh bread for the schoolhouse. Chickens need feed, the mill makes bran: close the loop, and keep the soil alive.`,terrain:d_,weather:u_,tags:[],goals:[{kind:`deliver`,item:`bread`,n:150},{kind:`soil`,min:40}],tips:[`Bread is flour and an egg. Chickens lay eggs from feed: beans, bran or seed cake, and leave manure.`,`A mill makes bran with every flour. A coop built beside the mill eats it as feed; a bakery beside both takes the flour and eggs.`,`Anything a building can't get rid of stops it: give spare bran and manure a composter or a digester, or drop it at the depot.`,`Wheat tires the soil; bean fields and compost bring it back.`]},{id:`c3`,name:`Windy Ridge`,seed:3303,width:48,height:40,credits:1100,par:2400,blurb:`The ridge co-op cooks with sunflower oil, but the sun is weak up here. The wind never stops, though.`,terrain:{...d_,water:`ponds`,rock:.12,forest:.06},weather:{...u_,sun:.6,wind:.75,gust:.25},tags:[`Weak sun`,`Strong wind`,`Rocky`],goals:[{kind:`deliver`,item:`oil`,n:90},{kind:`deliver`,item:`bread`,n:80}]},{id:`c4`,name:`Linen for the Looms`,seed:4404,width:50,height:40,credits:1300,par:3e3,blurb:`The weavers of Hollin want linen, and a steady supply of yarn for their own looms.`,terrain:d_,weather:u_,tags:[],goals:[{kind:`deliver`,item:`linen`,n:50},{kind:`rate`,item:`yarn`,perMin:5}]},{id:`c5`,name:`Long Nights`,seed:5505,width:48,height:40,credits:1400,par:2700,blurb:`Late autumn: short days and long nights. The midwinter fair wants honey cake.`,terrain:{...d_,water:`lake`},weather:{...u_,sunrise:8,sunset:17,wind:.45},tags:[`Short days`],goals:[{kind:`deliver`,item:`honeycake`,n:60}]},{id:`c6`,name:`Tired Soil`,seed:6606,width:48,height:40,credits:1400,par:2700,blurb:`Years of monoculture left this valley worn out. Make sauce for the cannery town, and leave the soil better than you found it.`,terrain:{...d_,soil:28,soilSpread:15,forest:.05},weather:u_,tags:[`Poor soil`],goals:[{kind:`deliver`,item:`sauce`,n:50},{kind:`soil`,min:55}]},{id:`c7`,name:`Riverlands`,seed:7707,width:52,height:42,credits:1600,par:3300,blurb:`Three villages along the river put in orders at once. Space is short between the water and the woods.`,terrain:{...d_,water:`river`,forest:.22,rock:.06},weather:u_,tags:[`Cramped`,`Wet`],goals:[{kind:`deliver`,item:`linen`,n:30},{kind:`deliver`,item:`sauce`,n:30},{kind:`deliver`,item:`bread`,n:80}]},{id:`c8`,name:`Harvest Festival`,seed:8808,width:56,height:44,credits:1800,par:3600,blurb:`The whole valley comes together for the festival. Everything, at once, on healthy soil.`,terrain:{...d_,soil:50,rock:.07,forest:.14},weather:{...u_,sunset:19,wind:.55},tags:[`Everything`],goals:[{kind:`deliver`,item:`honeycake`,n:40},{kind:`deliver`,item:`sauce`,n:30},{kind:`deliver`,item:`linen`,n:30},{kind:`soil`,min:60}]}],m_={id:`sandbox`,name:`Sandbox`,seed:4242,width:64,height:52,credits:1e6,par:0,sandbox:!0,blurb:`A big calm valley with unlimited credits and no goals, for trying things out.`,terrain:{...d_,forest:.08,rock:.03},weather:u_,tags:[`No goals`,`Unlimited credits`],goals:[]},h_=[{item:`flour`,n:60,level:1},{item:`oil`,n:40,level:1},{item:`yarn`,n:50,level:1},{item:`egg`,n:60,level:1},{item:`bread`,n:60,level:2},{item:`linen`,n:25,level:2},{item:`honey`,n:40,level:2},{item:`sauce`,n:25,level:3},{item:`honeycake`,n:25,level:3}],g_=[`Brook`,`Fern`,`Sun`,`Willow`,`Clover`,`Amber`,`Moss`,`Hazel`,`Reed`,`Linden`,`Bramble`,`Heather`],__=[`hollow`,`field`,`stead`,`mere`,`vale`,`ridge`,`ford`,`wick`,`down`,`combe`];function v_(e,t){let n=ip(e^t*2654435769),r=e=>e[Math.floor(n()*e.length)],i=`${r(g_)}${r(__)}`,a=[],o={...u_},s={...d_,water:r([`river`,`ponds`,`lake`,`river`])},c=[()=>{o.sun=.6,o.wind=.75,a.push(`Weak sun`,`Strong wind`)},()=>{o.sunrise=8,o.sunset=17,a.push(`Short days`)},()=>{s.soil=30,s.soilSpread=15,a.push(`Poor soil`)},()=>{s.rock=.12,a.push(`Rocky`)},()=>{s.forest=.24,a.push(`Wooded`)},()=>{o.wind=.25,o.gust=.2,a.push(`Still air`)}],l=Math.min(t,2)-+(n()<.4),u=new Set;for(;u.size<l;)u.add(Math.floor(n()*c.length));for(let e of u)c[e]();let d=h_.filter(e=>e.level<=t),f=Math.min(4,1+t+ +(n()<.5)),p=n()<.4+.2*t,m=f-+!!p,h=[],g=new Set;for(;h.length<m&&g.size<d.length;){let e=r(d);g.has(e.item)||(g.add(e.item),h.push({kind:`deliver`,item:e.item,n:Math.round(e.n*(.8+.2*t)/5)*5}))}p&&h.push({kind:`soil`,min:40+5*t});let _=(15+12*t+6*h.length)*f_;return{id:`r${e}-${t}`,name:i,seed:e,width:44+4*t,height:36+3*t,blurb:`A commission from ${i}: ${h.filter(e=>e.kind===`deliver`).map(e=>Nf[e.item].name.toLowerCase()).join(`, `)}.`,terrain:s,weather:o,credits:1e3+200*t,goals:h,par:_,tags:[`Difficulty ${t}`,...a]}}function y_(e){if(e===m_.id)return m_;let t=p_.find(t=>t.id===e);if(t)return t;let n=/^r(\d+)-([123])$/.exec(e);return n?v_(Number(n[1]),Number(n[2])):null}function b_(e,t,n,r){for(let i of e.buildings){if(!Fm(i))continue;let a=i.type===`solar`||i.type===`turbine`?eg(e,i)?sg(e,i,t,n):0:i.type===`battery`?i.charge:null;Vm(e,i,r,ag(e,i),a)}Hm(e)}function x_(e){let t=rh(e).fielded,n=e.map.fertility,r=e.soilBase;for(let e=0;e<n.length;e++)n[e]<r[e]&&!t.has(e)&&(n[e]=Math.min(r[e],n[e]+Vf.rest))}function S_(e){let t=e.stats;w_(e),e.time-t.since>=10&&(t.since+=10,t.made.unshift({}),t.made.length>7&&(t.made.length=7))}function C_(e,t,n){if(n===`delivered`){let n=e.stats.delivered[t]??[],r=e.time-60,i=0;for(let e of n)e>r&&i++;let a=Math.min(e.time,60);return a>0?i/a*60:0}let r=e.stats.made,i=e.time-e.stats.since,a=0;r.forEach((e,n)=>{let r=e[t]??0;a+=n===6?r*Math.max(0,1-i/10):r});let o=Math.min(e.time,60);return o>0?a/o*60:0}function w_(e){let t=e.time-60;for(let n of[...Object.values(e.stats.delivered),...e.routes.map(e=>e.moved)]){let e=0;for(;e<n.length&&n[e]<=t;)e++;e&&n.splice(0,e)}}function T_(e,t){let n=Math.min(e.time,60);return n>0?t.moved.filter(t=>t>e.time-n).length/n*60:0}function E_(e,t){let n=e.scenario.goals[t];return n.kind===`deliver`?(e.delivered[n.item]??0)>=n.n:n.kind===`rate`?e.reached[t]:fh(e)>=n.min}function D_(e){let t=e.scenario.goals;t.forEach((t,n)=>{t.kind===`rate`&&!e.reached[n]&&e.time>=60&&C_(e,t.item,`delivered`)>=t.perMin&&(e.reached[n]=!0)}),e.completedAt===null&&t.length&&t.every((t,n)=>E_(e,n))&&(e.completedAt=e.time)}function O_(e,t){return t<=e?`gold`:t<=e*1.5?`silver`:`bronze`}var k_=`soil-n-silo/v2`;function A_(e){let t=e.replace(/[^/]*$/,``);return t===`/`?k_:`${k_}@${t}`}var j_=e=>JSON.stringify(e);function M_(e){if(!e)return _p(`There is no saved game.`);let t=vp(e);if(!t.ok)return _p(`The save isn't JSON: ${t.error}`);let n=t.value;return n?.version===5?q_(n)?Z_(n.run,n.scenario.goals.length)?gp(n):_p(`The save is broken: its run log is incomplete or out of range.`):_p(`The save is broken: its state is incomplete or out of range.`):_p(`The save is from another version (this game reads version 5).`)}var N_=e=>typeof e==`number`&&Number.isFinite(e),P_=e=>!!e&&typeof e==`object`&&!Array.isArray(e)&&Object.values(e).every(N_),F_=Array.isArray,I_=(e,t)=>typeof t==`string`&&Object.hasOwn(e,t),L_=e=>I_(Nf,e),R_=e=>F_(e)&&e.every(L_),z_=e=>P_(e)&&Object.keys(e).every(L_),B_=e=>z_(e)&&Object.values(e).every(e=>Number.isInteger(e)&&e>=0),V_=e=>I_(Bf,e),H_=e=>I_(G,e),U_=e=>e===0||e===1||e===2||e===3,W_=e=>!!e&&(e.kind===`deliver`&&L_(e.item)&&N_(e.n)||e.kind===`rate`&&L_(e.item)&&N_(e.perMin)||e.kind===`soil`&&N_(e.min)),G_=e=>typeof e==`string`;function K_(e){let t=e?.weather,n=e?.terrain;return!!e&&G_(e.id)&&G_(e.name)&&G_(e.blurb)&&[e.seed,e.width,e.height,e.credits,e.par].every(N_)&&F_(e.tags)&&e.tags.every(G_)&&(e.tips===void 0||F_(e.tips)&&e.tips.every(G_))&&F_(e.goals)&&e.goals.every(W_)&&!!t&&[t.sunrise,t.sunset,t.sun,t.wind,t.gust].every(N_)&&!!n&&[n.soil,n.soilSpread,n.forest,n.rock].every(N_)&&[`river`,`ponds`,`lake`,`none`].includes(n.water)}function q_(e){let t=e.map,n=e.stats;return K_(e.scenario)&&!!t&&J_(t.width)&&J_(t.height)&&t.width>0&&t.height>0&&t.width===e.scenario.width&&t.height===e.scenario.height&&F_(t.terrain)&&t.terrain.length===t.width*t.height&&F_(t.fertility)&&t.fertility.length===t.width*t.height&&t.fertility.every(N_)&&F_(e.soilBase)&&e.soilBase.length===t.fertility.length&&e.soilBase.every(N_)&&!!t.depot&&N_(t.depot.x)&&N_(t.depot.y)&&[e.credits,e.time,e.carry,e.nextId,e.earned,e.initialTrees].every(N_)&&Math.abs(e.carry)<=.1&&(e.completedAt===null||N_(e.completedAt))&&B_(e.delivered)&&B_(e.made)&&F_(e.reached)&&e.reached.length===e.scenario.goals.length&&!!n&&N_(n.since)&&F_(n.made)&&n.made.length>0&&n.made.every(z_)&&!!n.delivered&&typeof n.delivered==`object`&&Object.entries(n.delivered).every(([e,t])=>L_(e)&&F_(t)&&t.every(N_))&&Y_(e.chosen)&&F_(e.buildings)&&e.buildings.every(e=>iv(e,t.width,t.height))&&F_(e.routes)&&e.routes.every(Q_)&&ev(e)&&F_(e.trucks)&&e.trucks.every(t=>nv(e,t))&&$_(e)&&rv(e)}var J_=e=>Number.isInteger(e);function Y_(e){return!!e&&V_(e.crop)&&!!e.recipes&&typeof e.recipes==`object`&&!F_(e.recipes)&&Object.entries(e.recipes).every(([e,t])=>H_(e)&&qf(e).some(e=>e.id===t))}var X_=[`first`,`night`,`truck`,`second`,`loop`,`goal`];function Z_(e,t){let n=e=>P_(e)&&Object.keys(e).every(e=>e in G),r=e=>e.kind===`first`||e.kind===`loop`?e.item!==void 0:e.kind===`second`?e.type!==void 0:e.kind!==`goal`||e.goal!==void 0&&e.goal>=0&&e.goal<t;return!!e&&F_(e.marks)&&e.marks.every(e=>!!e&&N_(e.t)&&X_.includes(e.kind)&&(e.item===void 0||L_(e.item))&&(e.type===void 0||H_(e.type))&&(e.goal===void 0||J_(e.goal))&&(e.n===void 0||N_(e.n))&&r(e))&&N_(e.curveStep)&&e.curveStep>0&&F_(e.curve)&&e.curve.every(N_)&&n(e.time)&&P_(e.problems)&&F_(e.nights)&&e.nights.every(e=>!!e&&N_(e.day)&&N_(e.short)&&F_(e.types)&&e.types.every(H_))&&!!e.trucks&&N_(e.trucks.total)&&N_(e.trucks.wait)&&n(e.trucks.at)}function Q_(e){return!!e&&N_(e.id)&&G_(e.name)&&F_(e.moved)&&e.moved.every(N_)&&F_(e.stops)&&e.stops.length<=q.maxStops&&e.stops.every(e=>!!e&&N_(e.building)&&R_(e.drop)&&R_(e.pick)&&!e.drop.some(t=>e.pick.includes(t))&&N_(e.wait)&&e.wait>=0&&e.wait<=q.maxWait&&J_(e.turn)&&e.turn>=0)}function $_(e){let t=new Map;for(let n of e.trucks)n.phase===`dock`&&n.target!==null&&t.set(n.target,(t.get(n.target)??0)+1);return[...t].every(([t,n])=>{let r=e.buildings.find(e=>e.id===t);return!!r&&n<=ep(r.type)})}function ev(e){let t=new Map(e.buildings.map(e=>[e.id,e]));return e.routes.every(e=>e.stops.every(e=>{let n=t.get(e.building);return!!n&&dg(n)}))}var tv=[`parked`,`charge`,`drive`,`queue`,`dock`,`stuck`];function nv(e,t){let{width:n,height:r}=e.map;return!!t&&N_(t.id)&&e.buildings.some(e=>e.id===t.garage&&e.type===`garage`)&&(t.route===null||e.routes.some(e=>e.id===t.route))&&J_(t.stop)&&t.stop>=0&&tv.includes(t.phase)&&[t.x,t.y,t.heading,t.energy,t.idle,t.budget,t.arrived].every(N_)&&t.x>=0&&t.y>=0&&t.x<=n&&t.y<=r&&t.energy>=0&&t.energy<=q.battery&&typeof t.charged==`boolean`&&t.idle>=0&&t.budget>=0&&t.budget<=2&&F_(t.path)&&t.path.every(e=>J_(e)&&e>=0&&e<n*r)&&(t.target===null||N_(t.target))&&(![`drive`,`queue`,`dock`].includes(t.phase)||t.target!==null)&&(![`queue`,`dock`].includes(t.phase)||t.route!==null)&&R_(t.cargo)&&t.cargo.length<=q.cargo}function rv(e){let t=[...e.buildings,...e.routes,...e.trucks].map(e=>e.id);return J_(e.nextId)&&new Set(t).size===t.length&&t.every(t=>J_(t)&&t>0&&t<e.nextId)}function iv(e,t,n){if(!e||!N_(e.id)||!N_(e.x)||!N_(e.y)||!H_(e.type)||!U_(e.rot))return!1;let r=G[e.type].size;if(e.x<0||e.y<0||e.x+r>t||e.y+r>n)return!1;switch(e.type){case`silo`:return B_(e.store);case`field`:return V_(e.crop)&&(e.harvest===void 0||V_(e.harvest))&&N_(e.growth)&&N_(e.stored);case`hive`:return N_(e.growth)&&N_(e.stored);case`battery`:return N_(e.charge);case`sapling`:return N_(e.age)}return!Wp(e)||qf(e.type).some(t=>t.id===e.recipe)&&B_(e.inputs)&&B_(e.outputs)&&(e.progress===null||N_(e.progress))}function av(e){let t=vp(e??`{}`);return t.ok&&t.value&&typeof t.value==`object`?t.value:{}}var ov={gold:3,silver:2,bronze:1};function sv(e,t,n,r){let i=e[t];return!i||ov[n]>ov[i.medal]||ov[n]===ov[i.medal]&&r<i.time?{...e,[t]:{medal:n,time:r}}:e}var cv=e=>(7+e/240*24)%24,lv=e=>1+Math.floor((e/240*24+7)/24);function uv(e,t){let n=cv(t),r=e.weather;return n<=r.sunrise||n>=r.sunset?0:r.sun*Math.sin(Math.PI*(n-r.sunrise)/(r.sunset-r.sunrise))}function dv(e,t){let n=e.weather,r=up(t/45,e.seed+77)*.7+up(t/11,e.seed+78)*.3;return Math.max(.05,Math.min(1,n.wind+(r-.5)*2*n.gust))}function fv(e){let t=(e,t,n)=>{let r=new Map;for(let t of e){let e=`${t.b.type} ${t.goods.join(`,`)}`,n=r.get(e);n?n.n++:r.set(e,{...t,n:1})}return[...r.values()].map(e=>{let r=G[e.b.type].name.toLowerCase(),i=e.n===1?`the ${r}`:`${e.n} ${r}${r.endsWith(`s`)?`es`:`s`}`;return`${t} ${e.goods.map(vv).join(`, `)} ${n} ${i}`})};return[...t(e.from,`Takes`,`from`),...t(e.to,`Gives`,`to`)]}function pv(e){return e.type===`field`?e.stored?e.harvest??e.crop:null:e.type===`hive`?`honey`:Wp(e)?vh(e,gh(e))?.item??null:null}function mv(e,t,n,r){return Mh(e,t).some(e=>(r===`pick`?jh(t,e):jh(e,t)).includes(n))?!0:e.routes.some(i=>i.stops.some(e=>e.building===t.id&&e[r].includes(n))&&e.trucks.some(e=>e.route===i.id))}function hv(e,t){return Mh(e,t).some(t=>t.type===`field`&&xh(e,t))?!0:e.routes.some(n=>n.stops.some(e=>e.building===t.id&&e.pick.includes(`compost`))&&n.stops.some(t=>{let n=am(e,t.building);return!!n&&t.drop.includes(`compost`)&&(n.type===`field`?xh(e,n):zh(n).includes(`compost`))}))}function gv(e,t){let n=[],r=mg(e,t),i=pg(e,t);t.phase===`stuck`?n.push(r?.stops.length?`It can reach none of its stops.`:`It can't reach its garage.`):i&&ym(e,i,fg(e,t))===1/0&&n.push(`It can't reach its garage to charge.`);let a=[...new Set(t.cargo)].filter(t=>!(r?.stops??[]).some(n=>{let r=am(e,n.building);return r&&n.drop.includes(t)&&Bh(r).includes(t)}));return a.length?n.push(`It carries ${a.map(e=>Nf[e].name.toLowerCase()).join(`, `)}, which none of its stops takes.`):r&&t.cargo.length>=q.cargo&&!t.cargo.some(t=>r.stops.some(n=>{let r=am(e,n.building);return r&&n.drop.includes(t)&&Bh(r).includes(t)&&!(r.type===`field`&&!xh(e,r))}))&&n.push(`It is full of compost none of its fields takes now (their soil is good), so it can pick nothing up.`),n}function _v(e,t){return t.stops.map((n,r)=>{let i=am(e,n.building);if(!i)return`Gone.`;if(!gm(e,i).length)return`No open tile beside it: trucks can't reach it.`;let a=am(e,t.stops[(r+t.stops.length-1)%t.stops.length].building);if(a&&a!==i&&Sm(e,a,i)===1/0)return`Trucks can't drive here from the stop before.`;if([...new Set(gg(e,t).map(t=>am(e,t.garage)))].some(t=>t&&Sm(e,t,i)===1/0))return`Trucks can't drive here from their garage.`;let o=Bh(i),s=Vh(i);return!n.drop.some(e=>o.includes(e))&&!n.pick.some(e=>s.includes(e))?`Nothing to do: it takes none of the goods dropped and gives none of those picked up.`:null})}var vv=e=>Nf[e].name.toLowerCase();function yv(e){let t=new Map;for(let n of e)t.set(n,(t.get(n)??0)+1);let n=[...t].map(([e,t])=>`${t} ${vv(e)}`);return n.length>1?`${n.slice(0,-1).join(`, `)} and ${n[n.length-1]}`:n[0]??`nothing`}function bv(e,t){let n=t.target===null?null:am(e,t.target),r=n?G[n.type].name.toLowerCase():``,i=Math.round(t.energy/q.battery*100);switch(t.phase){case`parked`:return t.energy<q.battery-1e-6?`Parked at its garage, charging (${i}%)`:`Parked at its garage`;case`charge`:return t.idle>.5?`At its garage, waiting for power to charge`:`Charging at its garage (${i}%)`;case`stuck`:return gv(e,t)[0]??`Waiting`;case`drive`:return n?.id===t.garage?mg(e,t)?.stops.length?`Driving home to charge`:`Driving home`:t.cargo.length?`Taking ${yv(t.cargo)} to the ${r}`:`Driving to the ${r}`;case`queue`:return`Waiting for its turn at the ${r} (${e.trucks.filter(e=>e!==t&&e.target===t.target&&(e.phase===`dock`||e.phase===`queue`&&(e.arrived<t.arrived||e.arrived===t.arrived&&e.id<t.id))).length} ahead)`;case`dock`:{let n=mg(e,t)?.stops[t.stop];if(t.idle>.2&&n){let e=t.cargo.filter(e=>n.drop.includes(e));return e.length?`Waiting at the ${r} for room for ${vv(e[0])}`:`Waiting at the ${r} for ${n.pick.map(vv).join(` or `)}`}return`Loading and unloading at the ${r}`}}}function xv(e,t){let n=G[t.type];switch(t.status){case`input`:{let n=Wp(t)?_h(t,gh(t)):null,r=!n||ph(n).some(n=>mv(e,t,n,`drop`));return`Waiting for ${t.need??`goods`}${r?``:`: no route or building next door brings it`}`}case`blocked`:return t.need===`compost`&&t.type===`composter`&&!hv(e,t)?`Full of compost: no field needs any. Sell it at the depot or let fields draw it down`:`Output blocked: nowhere for ${t.need??`its goods`} to go`;case`power`:return eg(e,t)?`No power: the network is out of power${t.type===`garage`?`, so its trucks can't charge`:``}`:`No power: not in reach of a pylon`;case`lowpower`:return`Low power: ${t.type===`garage`?`trucks charging`:`running`} at ${Math.round(ag(e,t)*100)}%`;case`nolink`:return`Not connected: no pylon in reach`;case`noroad`:return`No road: trucks can't reach it. Leave an open tile beside it, and a way there from the garage`;case`noroute`:return`Full of ${t.need}: no route with trucks or building next door takes it`;case`flowers`:return`No flowering fields within ${Qf.reach} tiles`;case`idle`:if(t.type===`solar`)return`Night: no sun`;if(t.type===`silo`){let e=Object.values(t.store).reduce((e,t)=>e+t,0);return e?`Holds ${e} goods`:`Empty`}if(t.type===`garage`){let n=e.trucks.filter(e=>e.garage===t.id).length;return n?`${n} truck${n>1?`s`:``}, none charging`:`No trucks yet: buy one`}return`Idle`;case`dry`:return t.type===`field`?`Growing ${Bf[t.crop].name.toLowerCase()} slowly: no water`:n.name;case`ok`:if(t.type===`field`)return`Growing ${Bf[t.crop].name.toLowerCase()}`;if(t.type===`garage`){let n=e.trucks.filter(e=>e.garage===t.id);return`Charging ${n.filter(e=>e.phase===`parked`||e.phase===`charge`).length} of ${n.length} truck${n.length>1?`s`:``}`}if(t.type===`pylon`){let n=yp($h(e).of.get(t.id),`network`),r=n.pylons.length-1,i=n.members.length;return`${r?`Linked to ${r} other pylon${r>1?`s`:``}`:`Linked to no other pylon`} · its network powers ${i} building${i===1?``:`s`}`}return Wp(t)?`Working`:n.name}}function Sv(e,t){let n=Zm(e,t.x,t.y)?1:oh(e,t).reduce((t,n)=>Math.max(t,ag(e,n)),0),r=nh(n,uh(e,t));return{pace:r.pace,water:n,soil:r.bySoil}}function Cv(e,t,n){let r=gh(t),i=G[t.type],a=ag(e,t);if(t.progress===null){let n=_h(t,r),o=vh(t,r);if(n){t.status=`input`,t.need=hh(n);return}if(o){t.status=`blocked`,t.need=Nf[o.item].name.toLowerCase();return}if(i.power&&a<=0){t.status=`power`,t.need=void 0;return}yh(e,t,r),t.progress=0}let o=i.power?a:1;if(t.progress+=n*o,t.status=o<=0?`power`:o<1?`lowpower`:`ok`,t.need=void 0,t.progress>=r.time){for(let n of r.outputs)t.outputs[n.item]=(t.outputs[n.item]??0)+n.n,Th(e,t,n.item,n.n);t.progress=null}}function wv(e,t,n){let r=Bf[t.crop],i=r.flowers&&sh(e,t)?1:0;if(t.stored>0&&(t.harvest??t.crop)!==t.crop||t.stored+r.yield+i>Vf.store){t.status=`blocked`,t.need=Bf[t.harvest??t.crop].name.toLowerCase();return}let a=Sv(e,t);t.growth+=n*a.pace/r.grow,t.status=a.water<1?`dry`:`ok`,t.need=void 0,t.growth>=1&&(t.growth=0,t.stored+=r.yield+i,t.harvest=t.crop,Th(e,t,t.crop,r.yield+i),dh(e,t,r.soil))}function Tv(e,t){return Math.min(Qf.maxFlowers,(rh(e).flowers.get(t.id)??[]).filter(e=>Bf[e.crop].flowers).length)}function Ev(e,t,n){let r=Tv(e,t);if(!r){t.status=`flowers`;return}if(t.stored>=Qf.store){t.status=`blocked`,t.need=`honey`;return}t.growth+=n*r/Qf.honeySeconds,t.status=`ok`,t.growth>=1&&(t.growth=0,t.stored++,Th(e,t,`honey`,1))}function Dv(e,t,n=1/0){e.carry+=t;let r=0;for(;e.carry>=.1-1e-9&&r<n;)Ov(e),e.carry-=rp,r++;r>=n&&(e.carry=0)}function Ov(e){let t=rp;e.time+=t;let n=uv(e.scenario,e.time),r=dv(e.scenario,e.time);lg(e),cg(e,n,r,t);let i=[];for(let r of e.buildings)switch(r.type){case`depot`:break;case`silo`:r.status=`idle`;break;case`field`:wv(e,r,t);break;case`hive`:Ev(e,r,t);break;case`sprinkler`:case`battery`:case`pylon`:case`solar`:case`turbine`:{let t=G[r.type].grid===`link`?null:eg(e,r);if(G[r.type].grid!==`link`&&!t){r.status=`nolink`;break}if(r.type===`sprinkler`){let t=ag(e,r);r.status=t<=0?`power`:t<1?`lowpower`:`ok`}else r.status=r.type===`solar`?n>0?`ok`:`idle`:`ok`;break}case`sapling`:r.age+=t,r.status=`ok`,r.age>=60&&i.push(r);break;default:Wp(r)&&(Cv(e,r,t),G[r.type].grid&&!eg(e,r)&&r.status===`ok`&&(r.status=`nolink`))}for(let t of i)tm(e,t),e.map.terrain[rm(e,t.x,t.y)]=dp.tree;i.length&&em(e),Rh(e),kg(e,t),ug(e);for(let t of e.buildings){if(![`input`,`blocked`,`ok`,`idle`].includes(t.status)||t.type===`depot`)continue;if(Ag(e,t)){t.status=`noroad`;continue}let n=t.status===`blocked`?pv(t):null;n&&!mv(e,t,n,`pick`)&&(t.status=`noroute`,t.need=Nf[n].name.toLowerCase())}b_(e,n,r,t),Math.floor(e.time+1e-6)!==Math.floor(e.time-t+1e-6)&&x_(e),S_(e),D_(e),Kh(e,t),Dm(e,()=>fh(e)),Vp(e,t,n<=0,$h(e).list.some(e=>e.share<1&&e.wanted>0),()=>e.scenario.goals.map((t,n)=>E_(e,n)))}var kv=[{id:`build`,name:`Build`,col:`var(--pine)`},{id:`view`,name:`View`,col:`var(--tide)`},{id:`time`,name:`Time`,col:`var(--ochre)`},{id:`panels`,name:`Panels`,col:`var(--plum)`}],Av=[...[`field`,`silo`,`garage`,`pylon`,`solar`].flatMap(e=>{let t=G[e];return t.key?[{id:`build:${e}`,label:t.name,group:`build`,keys:[`Key${t.key}`]}]:[]}),{id:`remove`,label:`Remove`,group:`build`,keys:[`KeyX`]},{id:`rotate`,label:`Turn the building`,group:`build`,keys:[`KeyR`],note:`With Shift it turns back.`},{id:`choice`,label:`Next crop or recipe`,group:`build`,keys:[`KeyC`],note:`For the field or bakery in hand. With Shift it goes back.`},{id:`turnLeft`,label:`Turn the view left`,group:`view`,keys:[`KeyQ`]},{id:`turnRight`,label:`Turn the view right`,group:`view`,keys:[`KeyE`]},{id:`zoomIn`,label:`Zoom in`,group:`view`,keys:[`KeyZ`,`Equal`],note:`With Shift, a letter key zooms out.`},{id:`zoomOut`,label:`Zoom out`,group:`view`,keys:[`Minus`]},{id:`overlay`,label:`Next overlay`,group:`view`,keys:[`KeyV`],note:`Soil, water, power, roads, bees.`},{id:`panLeft`,label:`Pan left`,group:`view`,keys:[`ArrowLeft`]},{id:`panRight`,label:`Pan right`,group:`view`,keys:[`ArrowRight`]},{id:`panUp`,label:`Pan up`,group:`view`,keys:[`ArrowUp`]},{id:`panDown`,label:`Pan down`,group:`view`,keys:[`ArrowDown`]},{id:`pause`,label:`Pause and play`,group:`time`,keys:[`Space`]},{id:`speed1`,label:`Normal speed, 1×`,group:`time`,keys:[`Digit1`]},{id:`speed2`,label:`Fast, 2×`,group:`time`,keys:[`Digit2`]},{id:`speed3`,label:`Fastest, 4×`,group:`time`,keys:[`Digit3`]},{id:`ledger`,label:`Ledger`,group:`panels`,keys:[`Tab`]},{id:`routes`,label:`Routes`,group:`panels`,keys:[`KeyO`]},{id:`power`,label:`Power`,group:`panels`,keys:[`KeyW`]},{id:`guide`,label:`Guide`,group:`panels`,keys:[`KeyG`]}],jv=new Map(Av.map(e=>[e.id,e])),Mv=e=>{let t=jv.get(e);if(!t)throw Error(`No action ${e}`);return t};function Nv(e){if(e===`NumpadAdd`)return`Equal`;if(e===`NumpadSubtract`)return`Minus`;let t=/^Numpad(\d)$/.exec(e);return t?`Digit${t[1]}`:e}function Pv(e){return e!==``&&!/^(Escape|Enter|NumpadEnter|CapsLock|ContextMenu|Unidentified|(Shift|Control|Alt|Meta|OS)(Left|Right)|F\d+)$/.test(e)}function Fv(){return Object.fromEntries(Av.map(e=>[e.id,[...e.keys]]))}function Iv(e){let t=Fv(),n=new Set;for(let r of Av){let i=e[r.id];if(i){t[r.id]=i.filter(e=>!n.has(e));for(let e of t[r.id])n.add(e)}}for(let r of Av)if(!e[r.id]){t[r.id]=t[r.id].filter(e=>!n.has(e));for(let e of t[r.id])n.add(e)}return t}function Lv(e){let t={};for(let n of Av)(e[n.id].length!==n.keys.length||e[n.id].some((e,t)=>e!==n.keys[t]))&&(t[n.id]=[...e[n.id]]);return t}function Rv(e){let t={};if(typeof e!=`object`||!e)return t;let n=e;for(let e of Av){let r=n[e.id];if(!Array.isArray(r))continue;let i=r.filter(e=>typeof e==`string`).map(Nv).filter(Pv);t[e.id]=i.filter((e,t)=>i.indexOf(e)===t).slice(0,2)}return t}function zv(e){let t=new Map;for(let n of Av)for(let r of e[n.id])t.set(r,n.id);return t}function Bv(e,t,n,r){let i=Object.fromEntries(Av.map(t=>[t.id,[...e[t.id]]])),a=[];for(let e of Av)e.id!==t&&i[e.id].includes(r)&&(i[e.id]=i[e.id].filter(e=>e!==r),a.push(e.id));let o=i[t];return o[Math.min(n,o.length)]=r,i[t]=o.filter((e,t)=>o.indexOf(e)===t),{bindings:i,took:a}}function Vv(e,t,n){return{...e,[t]:e[t].filter((e,t)=>t!==n)}}var Hv={Space:`Space`,Tab:`Tab`,Backspace:`Backspace`,Delete:`Del`,Insert:`Ins`,Home:`Home`,End:`End`,PageUp:`PgUp`,PageDown:`PgDn`,ArrowLeft:`←`,ArrowRight:`→`,ArrowUp:`↑`,ArrowDown:`↓`,Equal:`=`,Minus:`−`,Comma:`,`,Period:`.`,Slash:`/`,Semicolon:`;`,Quote:`'`,Backslash:`\\`,BracketLeft:`[`,BracketRight:`]`,Backquote:"`",IntlBackslash:`\\`};function Uv(e,t){if(e.startsWith(`Arrow`)||e===`Space`||e===`Tab`)return Hv[e]??e;let n=t?.get(e);if(n&&n.length===1)return n===`-`?`−`:n.toUpperCase();if(e in Hv)return Hv[e];let r=/^Key([A-Z])$/.exec(e)??/^Digit(\d)$/.exec(e);return r?r[1]:e.startsWith(`Numpad`)?`Num ${e.slice(6)}`:e}var Wv=4,Gv=100,Kv=4,qv=class{pointer=null;movedAt=0;press=null;keys=new Set;canvas;host;constructor(e,t){this.canvas=e,this.host=t,e.addEventListener(`pointerdown`,n=>{if(!n.isPrimary||this.press)return;this.pointer={x:n.clientX,y:n.clientY};let r=t.tileAt(n.clientX,n.clientY);this.press={id:n.pointerId,x:n.clientX,y:n.clientY,button:n.button,mode:`click`,from:r,to:r},e.setPointerCapture(n.pointerId),t.repick()}),e.addEventListener(`pointermove`,n=>{let r=this.press;if(r&&n.pointerId===r.id){let i=Math.hypot(n.clientX-r.x,n.clientY-r.y)>=Wv;r.mode===`click`&&i?(r.mode=r.button===0&&!n.shiftKey&&t.paints()&&r.from?`paint`:`pan`,r.mode===`pan`&&(e.style.cursor=`grabbing`,t.pan(n.clientX-r.x,n.clientY-r.y))):r.mode===`pan`&&this.pointer&&t.pan(n.clientX-this.pointer.x,n.clientY-this.pointer.y),r.mode===`paint`&&(r.to=t.tileAt(n.clientX,n.clientY)??r.to)}n.isPrimary&&(this.pointer={x:n.clientX,y:n.clientY},t.repick(),this.movedAt=performance.now())});let n=e=>this.release(e);e.addEventListener(`pointerup`,n),e.addEventListener(`pointercancel`,n),e.addEventListener(`pointerleave`,e=>{!this.press&&e.isPrimary&&(this.pointer=null,t.repick())}),e.addEventListener(`contextmenu`,e=>e.preventDefault()),e.addEventListener(`wheel`,e=>{if(e.preventDefault(),e.deltaY===0)return;let n=e.deltaMode===WheelEvent.DOM_DELTA_PIXEL?e.deltaY*(e.ctrlKey?Kv:1):Math.sign(e.deltaY)*Gv;t.zoom(-n/Gv,{x:e.clientX,y:e.clientY})},{passive:!1}),addEventListener(`keydown`,e=>{if(!(e.ctrlKey||e.metaKey||e.altKey)&&e.target?.tagName!==`INPUT`&&e.target?.tagName!==`SELECT`){if(this.keys.add(Nv(e.code)),e.code===`Escape`&&this.press?.mode===`paint`){this.press.mode=`void`;return}t.key(e)}}),addEventListener(`keyup`,e=>this.keys.delete(Nv(e.code))),addEventListener(`blur`,()=>this.keys.clear())}release(e){let t=this.press;t&&e.pointerId===t.id&&(this.press=null,this.canvas.style.cursor=``,e.type===`pointerup`&&(t.mode===`paint`?t.from&&t.to&&this.host.drag(t.from,t.to):t.mode===`click`&&(t.button===0?this.host.click(e.clientX,e.clientY):t.button===2&&this.host.secondary()),this.host.repick()))}},Jv=e=>typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?String(e):``;function J(e,t=null,...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t??{}))n!=null&&n!==!1&&(e.startsWith(`on`)?r.addEventListener(e.slice(2),n):e===`style`?r.setAttribute(`style`,Jv(n)):e===`class`?r.className=Jv(n):e in r?r[e]=n:r.setAttribute(e,Jv(n)));for(let e of n.flat())e!=null&&e!==!1&&r.append(e instanceof Node?e:String(e));return r}var Yv=`http://www.w3.org/2000/svg`;function Y(e,t=null,...n){let r=document.createElementNS(Yv,e);for(let[e,n]of Object.entries(t??{}))n!=null&&n!==!1&&(e.startsWith(`on`)?r.addEventListener(e.slice(2),n):r.setAttribute(e,Jv(n)));for(let e of n.flat())e!=null&&e!==!1&&r.append(e instanceof Node?e:String(e));return r}function Xv(e,...t){return e.replaceChildren(...t.flat().filter(e=>e!=null&&e!==!1).map(e=>e instanceof Node?e:String(e))),e}var X=(e,t,n=``)=>J(`span`,{class:`cd-i cd-i--${e}${n?` ${n}`:``}`,style:t?`--s: ${t}px`:void 0,"aria-hidden":`true`});function Z(e,t){e.textContent!==t&&(e.textContent=t)}function Zv(e,t,n){let r=String(n);e.style.getPropertyValue(t)!==r&&e.style.setProperty(t,r)}function Qv(e,t,n){return e.dataset.key!==t&&(e.dataset.key=t,Xv(e,...n()),!0)}function Q(e){let t=Math.max(0,Math.floor(e)),n=Math.floor(t/3600),r=Math.floor(t/60)%60,i=t%60;return n?`${n}:${String(r).padStart(2,`0`)}:${String(i).padStart(2,`0`)}`:`${Math.floor(t/60)}:${String(i).padStart(2,`0`)}`}function $v(e){let t=Math.floor((e%24+24)%24*6+1e-6)*10;return`${String(Math.floor(t/60)%24).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}var ey=e=>$v(cv(e)),ty=e=>Math.round(e).toLocaleString(`en-GB`),ny=e=>Math.abs(e)>=10?String(Math.round(e)):e.toFixed(1).replace(/\.0$/,``),ry=e=>`${ny(e)} W`,iy=e=>`${Math.round(e*100)}%`,ay=e=>Nf[e].name.toLowerCase(),oy=e=>G[e].name.toLowerCase(),sy=(e,t,n=`${t}s`)=>`${e} ${e===1?t:n}`,cy=e=>e?Object.keys(Nf).find(t=>Nf[t].name.toLowerCase()===e)??null:null,ly=e=>`#${e.toString(16).padStart(6,`0`)}`,uy={field:`grow`,hive:`gather`,mill:`mill`,press:`press`,spinner:`spin`,loom:`weave`,bakery:`bake`,cannery:`cook`,composter:`compost`,coop:`lay`,digester:`burn`};function dy(e){return Wf.find(t=>t.outputs[0]?.item===e)??Wf.find(t=>t.outputs.some(t=>t.item===e))??null}function fy(e){return{item:e,from:py(e,new Set)}}function py(e,t){if(zf.includes(e)){let t=Bf[e];return{building:`field`,time:t.grow,verb:`grow`,n:t.yield,recipe:null,inputs:[]}}if(e===`honey`)return{building:`hive`,time:Qf.honeySeconds,verb:`gather`,n:1,recipe:null,inputs:[]};let n=dy(e);if(!n||t.has(n.building))return null;let r=new Set(t).add(n.building);return{building:n.building,time:n.time,verb:uy[n.building]??`make`,n:yp(n.outputs.find(t=>t.item===e),`recipe output`).n,recipe:n,inputs:n.inputs.map(e=>`item`in e?{item:e.item,n:e.n,from:py(e.item,r)}:{group:e.group,n:e.n})}}var my=e=>Math.abs(e)>=10?String(Math.round(e)):e.toFixed(1).replace(/\.0$/,``),hy=e=>`${my(e)} W`;function gy(e,t,n,r){let i=0,a=0;for(let o=n;o<n+r;o++)for(let n=t;n<t+r;n++)nm(e,n,o)&&(i+=e.map.fertility[o*e.map.width+n],a++);return a?i/a:0}function _y(e,t,n){let r=e.buildings.filter(e=>e.type===`sprinkler`&&Xm(e.x,e.y,{type:`field`,x:t,y:n})),i=Zm(e,t,n);return{sprinklers:r.length,shore:i,water:i?1:r.reduce((t,n)=>Math.max(t,ag(e,n)),0)}}var vy=(e,t,n,r)=>e.buildings.some(e=>G[e.type].grid===`link`&&Jm({type:t,x:n,y:r},e.x,e.y));function yy(e,t,n,r,i={}){let a=G[t],o=[],s=()=>vy(e,t,n,r)?{label:`Power`,value:`in reach`,sub:`of a pylon`}:{label:`Power`,value:`none`,sub:`no pylon in reach`,tone:`bad`};switch(t){case`field`:{let t=Bf[i.crop??`wheat`],a=gy(e,n,r,3),{sprinklers:s,shore:c,water:l}=_y(e,n,r),u=t.flowers&&e.buildings.some(e=>e.type===`hive`&&$m({type:`field`,x:n,y:r},e.x,e.y)),d=(t.yield+ +!!u)*60*nh(l,a).pace/t.grow,f=0,p=a;for(;f+=t.grow/nh(l,p).pace,!(f>600);)p=Math.max(0,Math.min(100,p+t.soil));o.push({label:t.name,value:`+${my(d)}`,sub:`a minute`}),o.push({label:`Soil`,value:String(Math.round(a)),then:String(Math.round(p)),sub:`in 10 min if harvests are carried off`}),o.push(c?{label:`Water`,value:`beside water`,sub:`grows at 100%`}:s?{label:`Water`,value:`${s} sprinkler${s>1?`s`:``}`,sub:`grows at ${Math.round(th(l)*100)}%`}:{label:`Water`,value:`none`,sub:`grows at ${Math.round(th(0)*100)}%`,tone:`bad`});break}case`sprinkler`:{let t=e.buildings.filter(e=>e.type===`field`&&Xm(n,r,e)),i=Qm(e,n,r);o.push({label:`Waters`,value:`${t.length} field${t.length===1?``:`s`}`,sub:`centres within ${K.sprinklerReach} tiles`}),o.push({label:`Uses`,value:hy(i?K.sprinklerNearWater:K.sprinklerFar),sub:i?`near water`:`far from water`}),o.push(s());break}case`hive`:{let t=e.buildings.filter(e=>e.type===`field`&&$m(e,n,r)),i=Math.min(Qf.maxFlowers,t.filter(e=>Bf[e.crop].flowers).length);o.push({label:`Honey`,value:`+${my(i*60/Qf.honeySeconds)}`,sub:`a minute`,tone:i?void 0:`bad`}),o.push({label:`Flowers`,value:`${i} field${i===1?``:`s`}`,sub:`flowering within ${Qf.reach} tiles`}),o.push({label:`Pollinates`,value:`${t.filter(e=>Bf[e.crop].flowers).length}`,sub:`flowering fields`});break}case`solar`:{let t=e.scenario;o.push({label:`Now`,value:hy(K.solar*uv(t,e.time)),sub:`in this sun`}),o.push({label:`Midday`,value:hy(K.solar*t.weather.sun),sub:`sun ${String(t.weather.sunrise).padStart(2,`0`)}:00–${t.weather.sunset}:00`}),o.push(s());break}case`turbine`:{let t=eh(e,n,r);o.push({label:`Wind`,value:`${Math.round(t*100)}%`,sub:`reaches it here`,tone:t<1?`bad`:void 0}),o.push({label:`Now`,value:hy(K.turbine*dv(e.scenario,e.time)*t),sub:`in this wind`}),o.push(s());break}case`pylon`:{let t=ig(e,n,r).length,i=e.buildings.filter(e=>Xh(e)&&Jm(e,n,r)),a=i.filter(t=>!$h(e).of.get(t.id)).length;o.push({label:`Links`,value:`${t} pylon${t===1?``:`s`}`,sub:t?`within ${K.pylon.link} tiles`:`a new network`}),o.push({label:`Reaches`,value:`${i.length}`,sub:`building${i.length===1?``:`s`}${a?`, ${a} not yet powered`:``}`});break}case`sapling`:o.push({label:`Grows`,value:`60 s`,sub:`into a tree`}),o.push({label:`Soil health`,value:`+${np.perTree}`,sub:`a tree, up to ${np.cap} in all`});break;default:{let e=qf(t).find(e=>e.id===i.recipe)??qf(t)[0];e&&e.outputs.length&&o.push({label:`Full speed`,value:my(e.outputs[0].n*60/e.time),sub:`${Nf[e.outputs[0].item].name.toLowerCase()} a minute`}),t===`digester`&&o.push({label:`Makes`,value:hy(K.digester),sub:`while burning`}),t===`battery`&&o.push({label:`Stores`,value:`${K.battery.capacity} J`,sub:`${K.battery.rate} W in and out`}),(a.power||Xh({type:t}))&&o.push(s())}}return{facts:o,next:fv(Ph(e,t,n,r,i))}}function by(e,t){let n=((t-cv(e))%24+24)%24;return e+(n>1e-9?n:24)*Tp}function xy(e){let t=e.scenario,n=t.weather,r=e.time,i=cv(r),a=i<n.sunrise||i>=n.sunset?null:by(r,n.sunset),o=by(a??r,n.sunrise),s=o+Tp,c=$h(e).list.map(t=>({net:t,bats:t.members.filter(e=>e.type===`battery`).map(e=>e.charge),solar:t.members.filter(e=>e.type===`solar`).length,turbines:t.members.filter(e=>e.type===`turbine`),digesters:t.members.filter(e=>e.type===`digester`).reduce((t,n)=>t+sg(e,n,0,0),0)})),l=c.reduce((e,t)=>e+t.bats.length,0)*K.battery.capacity;if(!l)return null;let u=Tp/6,d=[],f=a??r,p=null,m=0,h=0,g=()=>c.reduce((e,t)=>e+t.bats.reduce((e,t)=>e+t,0),0),_={t:r,k:g()/l};d.push({t:r,k:_.k});for(let n=r,i;n<s-1e-6;n+=i){i=Math.min(u,s-n,...[f,o].filter(e=>e>n+1e-6).map(e=>e-n));let r=uv(t,n+i/2),v=dv(t,n+i/2),y=0;for(let t of c){let n=(K.solar*r*t.solar+t.turbines.reduce((t,n)=>t+sg(e,n,0,v),0)+t.digesters-t.net.wanted)*i;for(let e=0;e<t.bats.length;e++){let r=n>0?Math.min(n,K.battery.rate*i,K.battery.capacity-t.bats[e]):Math.max(n,-K.battery.rate*i,-t.bats[e]);t.bats[e]+=r,n-=r}n<-1e-6&&(y+=-n/i)}let b=g()/l,x=n>=f-1e-6&&n+i<=o+1e-6;x&&p===null&&b<1e-6&&y>1e-6&&(p=n+i),d.push({t:n+i,k:b}),(a===null||n+i<=a)&&b>_.k&&(_={t:n+i,k:b}),x&&p!==null&&y>1e-6&&(m+=y*i,h+=i)}return{points:d,sunset:a,sunrise:o,dryAt:p,shortAfter:h?m/h:0,shortFor:h,peak:_}}var Sy=e=>{let t=Math.round(e/240*24*60);return`${Math.floor(t/60)} h ${String(t%60).padStart(2,`0`)}`};function Cy(e){let t=J(`span`,{class:`cd-gauge${e.cls?` ${e.cls}`:``}`},...(e.ticks??[]).map(e=>J(`span`,{class:`cd-gauge__tick${e.silver?` is-silver`:``}`,style:`--at: ${Math.max(0,Math.min(1,e.at))}`})),J(`span`,{class:`cd-gauge__in`},...e.inner),e.foot===void 0?null:J(`span`,{class:`cd-gauge__foot`},e.foot));return t.style.setProperty(`--v`,String(Math.max(0,Math.min(1,e.v)))),e.d&&t.style.setProperty(`--d`,`${e.d}px`),e.w&&t.style.setProperty(`--w`,`${e.w}px`),e.col&&t.style.setProperty(`--col`,e.col),t}function wy(e,...t){let n=J(`span`,{class:`cd-ring`});return n.style.setProperty(`--v`,String(Math.max(0,Math.min(1,e.v)))),e.d&&n.style.setProperty(`--d`,`${e.d}px`),e.w&&n.style.setProperty(`--w`,`${e.w}px`),e.col&&n.style.setProperty(`--col`,e.col),J(`span`,{class:`cd-ringbox`},n,t.length?J(`span`,{class:`cd-ring__in`},...t):null)}function Ty(e){switch(e){case`ok`:return{cls:``};case`idle`:return{cls:``,col:`var(--ink-3)`};case`input`:case`flowers`:return{cls:`is-wait`};case`blocked`:return{cls:`is-blocked`};case`lowpower`:return{cls:`is-nopower`,col:`var(--status-blocked)`};case`power`:return{cls:`is-nopower`};case`nolink`:return{cls:`is-nopower`,outline:!0};case`noroute`:return{cls:`is-unreachable`};case`noroad`:return{cls:`is-unreachable`,outline:!0};case`dry`:return{cls:`is-dry`}}}var Ey=e=>e!==`ok`&&e!==`idle`;function Dy(e,t,n,r){switch(n=n?.split(` (`)[0],t){case`ok`:return e.type===`field`?`Growing`:e.type===`hive`?`Making honey`:e.type===`garage`?`Charging trucks`:e.type===`sprinkler`?`Watering`:e.type===`solar`||e.type===`turbine`?`Making power`:e.type===`battery`?`Connected`:e.type===`pylon`?`Linked`:`Working`;case`idle`:return e.type===`garage`?`No truck charging`:e.type===`solar`?`Night`:e.type===`silo`?`Storing`:`Idle`;case`input`:return`Waiting for ${n??`goods`}`;case`blocked`:return`Full of ${n??`goods`}`;case`noroute`:return`No route takes ${n??`its goods`}`;case`noroad`:return`No road`;case`power`:return`No power`;case`lowpower`:return`Low power${r===void 0?``:` · ${iy(r)}`}`;case`nolink`:return`Not connected`;case`flowers`:return`No flowers near`;case`dry`:return`Dry`}}function Oy(e,t,n=``){let r=Ty(e),i=J(`span`,{class:`cd-status ${r.cls}${r.outline?` is-outline`:``}${n?` ${n}`:``}`},t);return r.col&&i.style.setProperty(`--col`,r.col),i}var ky={gold:`Gold`,silver:`Silver`,bronze:`Bronze`},Ay=(e,t)=>J(`span`,{class:`cd-medal${e===`silver`?` is-silver`:e===`bronze`?` is-bronze`:e===null?` is-none`:``}`,style:t?`--d: ${t}px; font-size: ${Math.round(t*.36)}px`:void 0},e?e[0].toUpperCase():`–`),jy=e=>e.kind===`soil`?`soil`:e.item;function My(e,t){let n=e.scenario.goals[t],r=E_(e,t);if(n.kind===`deliver`){let t=Math.min(n.n,e.delivered[n.item]??0);return{v:t/n.n,figure:String(t),of:`of ${n.n}`,word:ay(n.item),done:r,short:`${t} / ${n.n} ${ay(n.item)}`}}if(n.kind===`rate`){let t=C_(e,n.item,`delivered`);return{v:r?1:t/n.perMin,figure:ny(t),of:`of ${n.perMin} a min`,word:`${ay(n.item)} / min`,done:r,short:`${ny(t)} / ${n.perMin} ${ay(n.item)} a min`}}let i=fh(e);return{v:Math.min(1,i/n.min),figure:String(Math.round(i)),of:`${n.min}+ at end`,word:`soil`,done:r,short:`soil ${Math.round(i)} / ${n.min}+`}}function Ny(e){return e.kind===`deliver`?`${e.n} ${ay(e.item)} to the depot`:e.kind===`rate`?`${e.perMin} ${ay(e.item)} a minute`:`soil ${e.min}+ at the end`}function Py(e){return e.kind===`deliver`?`Deliver ${e.n} ${ay(e.item)}`:e.kind===`rate`?`Deliver ${e.perMin} ${ay(e.item)} a minute`:`Keep the soil ${e.min}+`}var Fy=e=>[J(`span`,null,J(`i`,{class:`dot`,style:`background: var(--medal-gold)`}),`gold within ${Q(e)}`),J(`span`,null,J(`i`,{class:`dot`,style:`background: var(--medal-silver)`}),`silver ${Q(e*l_)}`)],Iy=[60,300,600],Ly={ok:`var(--pine)`,idle:`var(--chalk-3)`,input:`var(--status-wait)`,flowers:`var(--status-wait)`,blocked:`var(--status-blocked)`,lowpower:`var(--status-blocked)`,power:`var(--status-nopower)`,nolink:`var(--status-nopower)`,noroute:`var(--status-unreachable)`,noroad:`var(--status-unreachable)`,dry:`var(--status-dry)`},Ry={ok:`#2f6b55`,idle:`#d8d4c7`,input:`#b8961f`,flowers:`#b8961f`,blocked:`#c4702f`,lowpower:`#c4702f`,power:`#b4523a`,nolink:`#b4523a`,noroute:`#76608f`,noroad:`#76608f`,dry:`#3d7a91`};function zy(e){return e.type===`solar`?{max:K.solar,fmt:ry,what:`Power made`}:e.type===`turbine`?{max:K.turbine,fmt:ry,what:`Power made`}:e.type===`battery`?{max:K.battery.capacity,fmt:e=>iy(e/K.battery.capacity),what:`Charge`}:null}function By(e){let t=gh(e);return t?{items:t.outputs.map(e=>e.item),full:Object.fromEntries(t.outputs.map(e=>[e.item,e.n/t.time*60]))}:e.type===`field`?{items:[e.crop],full:null}:e.type===`hive`?{items:[`honey`],full:null}:{items:[],full:null}}function Vy(e,t){return e.type===`field`?(e.harvest??e.crop)===t?e.stored??0:0:e.type===`hive`?t===`honey`?e.stored??0:0:Wp(e)?e.outputs[t]??0:0}var Hy=e=>Object.keys(Rf).find(t=>Rf[t]===e)??null;function Uy(e,t,n){switch(n.kind){case`input`:{let r=cy(n.need),i=Hy(n.need),a=r?[r]:i?[...Pf[i]]:[];if(!a.length)return``;let o=a.reduce((t,n)=>t+km(e,`made`,n),0),s=gh(t),c=s?.inputs.find(e=>`item`in e?a.includes(e.item):e.group===i),l=s&&c?c.n*60/s.time:null,u=r?ay(r):(n.need??``).split(` (`)[0];return`The valley made ${ny(o)} ${u} a minute over the last 5 min${l?`; this ${oy(t.type)} uses up to ${ny(l)} at full speed`:``}.`}case`power`:{let n=eg(e,t);if(!n)return`No pylon reaches it.`;let r=xy(e);return`Its network: ${ry(n.made)} made, ${ry(Yh(n))} used now.${r?.dryAt?` Batteries run dry at ${ey(r.dryAt)} tonight.`:``}`}case`output`:{let r=cy(n.need),i=r?hg(e,t).filter(n=>n.stops.some(e=>e.building===t.id&&e.pick.includes(r))&&gg(e,n).length):[];return i.length?`${sy(i.length,`route`)} with trucks pick${i.length===1?`s`:``} up ${n.need} here.`:`No route with trucks picks up ${n.need??`its goods`} here.`}case`water`:{let n=oh(e,t).length;return n?`${sy(n,`sprinkler`)} reach${n===1?`es`:``} it, short of power.`:`No sprinkler reaches it.`}case`flowers`:return`No flowering field within reach.`;case`road`:return`Trucks can't reach it from their garage.`}}var Wy={input:`clock`,power:`bolt`,output:`truck`,water:`water`,flowers:`bee`,road:`road`};function Gy(e,t,n,r){let i=zy(t),a=Iy.map(e=>J(`button`,{title:`The last ${e/60} minute${e>60?`s`:``} of play`,onclick:()=>{r(e),v=``}},`${e/60} min`)),o=J(`div`,{class:i?`hist-bars`:`ribbon`}),s=J(`div`,{class:`hist-cursor`,hidden:!0}),c=null,l=J(`div`,{class:`hist-plot`,onmousemove:e=>{let t=l.getBoundingClientRect();c=Math.max(0,Math.min(1,(e.clientX-t.left)/t.width))},onmouseleave:()=>{c=null}},o,s),u=J(`span`,{class:`cd-small cd-faint`}),d=J(`div`,{class:`hist-axis`}),f=J(`div`,{class:`cd-small hist-readout`}),p=J(`div`,{class:`hist-shares`}),m=J(`div`),h=J(`div`),g=J(`div`,{class:`history`},J(`div`,{class:`cd-seg hist-windows`},...a),J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`}),u),l,d,f,p,m,h),_=yp(g.querySelector(`.row-head .cd-label`),`.cd-label`),v=``,y=()=>{let r=n(),l=Pm(e,t),g=`${r}|${Math.floor(e.time*2)}|${c===null?``:Math.round(c*200)}|${!!l}`;if(g===v)return;v=g,a.forEach((e,t)=>e.classList.toggle(`is-on`,Iy[t]===r)),Z(_,`The last ${r/60==1?`minute`:`${r/60} minutes`}`),Z(u,`of play, ${Q(Math.max(0,e.time-r))} → ${Q(e.time)}`);let y=r/60;if(Xv(d,J(`span`,null,`${y} min ago`),...Array.from({length:y-1},(e,t)=>y<=5?J(`span`,null,String(y-1-t)):(y-1-t)%2?null:J(`span`,null,String(y-1-t))),J(`span`,null,`now`)),!l){o.replaceChildren(),s.hidden=!0,Z(f,`Nothing recorded yet: let the game run.`),p.replaceChildren(),m.replaceChildren(),h.replaceChildren();return}let b=Wm(l,e.time,r);i?S(b,i):x(b),s.hidden=c===null,c!==null&&(s.style.left=`${c*100}%`),Z(f,c===null?`Point at the ribbon for what happened when.`:C(b,b.start+c*r))},b=(e,t)=>(t-e.start)/(e.now-e.start)*100;function x(r){o.replaceChildren(...r.spans.map(e=>{let t=J(`i`,{class:e.status===`ok`||e.status===`idle`?``:`is-problem`});return t.style.left=`${b(r,e.from)}%`,t.style.width=`${b(r,e.to)-b(r,e.from)}%`,t.style.setProperty(`--c`,Ly[e.status]),t}));let i=r.shares.reduce((e,t)=>e+t.seconds,0),a=2*Math.PI*48,s=0,c=r.shares.map(e=>{let t=i?e.seconds/i*a:0,n=Y(`circle`,{cx:56,cy:56,r:48,stroke:Ry[e.status],"stroke-dasharray":`${Math.max(0,t-3)} ${a}`,"stroke-dashoffset":-s});return s+=t,n}),l=r.shares.filter(e=>e.status===`ok`).reduce((e,t)=>e+t.seconds,0);Xv(p,Y(`svg`,{width:112,height:112,viewBox:`0 0 112 112`,"aria-label":`Share of time`},Y(`g`,{transform:`rotate(-90 56 56)`,fill:`none`,"stroke-width":12},Y(`circle`,{cx:56,cy:56,r:48,stroke:`#e7e4da`}),...c),Y(`text`,{x:56,y:58,"text-anchor":`middle`,class:`ring-figure`},i?iy(l/i):`–`),Y(`text`,{x:56,y:76,"text-anchor":`middle`,class:`ring-word`},Dy(t,`ok`).toLowerCase())),J(`div`,{class:`share-rows`},...r.shares.slice(0,5).map(e=>J(`div`,null,Oy(e.status,Dy(t,e.status,e.need,e.share)),J(`span`,{class:`fill`}),J(`b`,{class:`cd-num`},i?iy(e.seconds/i):`–`)))));let u=By(t),d=[...u.items,...Object.keys(r.perMin).filter(e=>!u.items.includes(e))];if(d.length){let e=d[0],n=r.perMin[e]??0,i=u.full?.[e],a=r.made[e]??0,o=r.taken[e]??0;Xv(m,J(`div`,{class:`cd-inset hist-output`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`},`Output`),J(`span`,null,J(`span`,{class:`big`},ny(n)),J(`span`,{class:`cd-small`},i?` of ${ny(i)} ${ay(e)} / min at full speed`:` ${ay(e)} / min`))),i?J(`div`,{class:`cd-bar`,style:`--v: ${Math.min(1,n/i)}; margin-top: 12px`},J(`i`)):null,J(`div`,{class:`cd-small`,style:`margin-top: 8px`},`${ty(a)} ${ay(e)} made · ${ty(o)} taken away · ${Vy(t,e)} in its store`),...d.slice(1).map(e=>J(`div`,{class:`cd-small`},`${Nf[e].name}: ${ny(r.perMin[e]??0)} / min · ${ty(r.made[e]??0)} made · ${ty(r.taken[e]??0)} taken away`))))}else m.replaceChildren();let f=qm(r).filter(e=>e.share>0);Xv(h,f.length?[J(`div`,{class:`row-head`,style:`margin-top: 22px`},J(`span`,{class:`cd-label`,style:`color: var(--ochre)`},`What it waits for`),J(`span`,{class:`cd-small cd-faint`},`share of the last ${n()/60} min`)),...f.slice(0,4).map((n,r)=>{let i=n.kind===`input`||n.kind===`output`?cy(n.need):null,a=Hy(n.need),o=n.kind===`input`?i?Nf[i].name:(n.need??`Goods`).split(` (`)[0].replace(/^./,e=>e.toUpperCase()):n.kind===`output`?`Room for ${n.need??`its goods`}`:n.kind===`power`?`Power`:n.kind===`water`?`Water`:n.kind===`flowers`?`Flowers`:`A road`;return J(`div`,{class:`wait`},J(`span`,{class:`rank`},String(r+1)),J(`div`,null,J(`b`,null,J(`span`,{class:`disc`},X(i??(n.kind===`input`&&a?Pf[a][0]:Wy[n.kind]),22)),o),J(`div`,{class:`cd-small`},Uy(e,t,n))),J(`span`,{class:`pc${r===0&&n.share>=.2?` cd-bad`:``}`},iy(n.share)))})]:[])}function S(e,t){let n=Math.max(t.max,e.reading?.max??0);o.replaceChildren(...e.bars.map(t=>{let r=J(`i`);return r.style.left=`${b(e,t.from)}%`,r.style.width=`${b(e,t.to)-b(e,t.from)}%`,r.style.height=t.value===null?`0`:`${Math.max(2,t.value/n*100)}%`,r})),p.replaceChildren(),h.replaceChildren();let r=e.reading;Xv(m,r?J(`div`,{class:`cd-inset hist-output`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`},t.what),J(`span`,null,J(`span`,{class:`big`},t.fmt(r.avg)),J(`span`,{class:`cd-small`},` on average`))),J(`div`,{class:`cd-small`,style:`margin-top: 8px`},`From ${t.fmt(r.min)} to ${t.fmt(r.max)} over the window.`)):null)}function C(e,n){let r=`${Q(Math.max(0,e.now-n))} ago`;if(n<e.since)return`${r}: not built yet (or before recording began)`;if(i){let t=e.bars.find(e=>n>=e.from&&n<e.to);return t?.value==null?`${r}: no reading`:`${r}: ${i.fmt(t.value)}`}let a=e.spans.find(e=>n>=e.from&&n<e.to)??e.spans[e.spans.length-1];return a?`${r}: ${Dy(t,a.status,a.need,a.share)}, for ${Q(a.to-a.began)}${a.to>=e.now-1e-6?` so far`:``}`:r}return{el:g,update:y}}var Ky=Fv(),qy=zv(Ky),Jy=null,Yy=0,Xy=[];function Zy(e){e.listen(e=>{Ky=Iv(e.keys),qy=zv(Ky),Yy++;for(let[e,t]of Xy)e.title=t()}),navigator.keyboard?.getLayoutMap?.().then(e=>{Jy=e,Yy++;for(let[e,t]of Xy)e.title=t()},()=>{})}var Qy=()=>Yy,$y=e=>qy.get(Nv(e)),eb=(e,t)=>Ky[e].some(e=>t.has(e)),tb=e=>(Ky[e]??[]).map(e=>Uv(e,Jy)),nb=e=>Uv(e,Jy),rb=e=>Mv(e).label;function ib(e,...t){return t.length?`${e} (${t.join(` or `)})`:e}function ab(e,t){return e.title=t(),Xy.push([e,t]),e}function ob(e){let t=e.scenario,n=p_.findIndex(e=>e.id===t.id);return t.sandbox?`Sandbox`:n>=0?`Commission ${n+1}`:`Random commission`}function sb(e,t){let n=O_(e,t);return[J(`i`,{class:`dot`,style:`background: var(--medal-${n})`}),n]}function cb(e){let t=e.scenario,n=e=>J(`b`,{class:`cd-num`},Q(e));if(t.sandbox)return[n(e.time),` played`];if(e.completedAt!==null)return[`done in `,n(e.completedAt),` · `,...sb(t.par,e.completedAt)];let r=O_(t.par,e.time);return[n(e.time),` · `,...sb(t.par,e.time),r===`gold`?` by ${Q(t.par)}`:r===`silver`?` by ${Q(t.par*l_)}`:``]}function lb(e){return e.kind===`deliver`?`/${e.n}`:e.kind===`rate`?`/${e.perMin} a min`:`/${e.min}+`}function ub(e){if(e.completedAt!==null)return e.completedAt;let t=e.time;for(let[n,r]of e.scenario.goals.entries()){if(My(e,n).done)continue;if(r.kind===`rate`||r.kind===`soil`)return null;let i=km(e,`delivered`,r.item,300);if(i<=0)return null;t=Math.max(t,e.time+(r.n-(e.delivered[r.item]??0))/i*60)}return t}var db=class{el=J(`div`,{class:`cd-card hud-commission`});pill=J(`div`,{class:`cd-pill hud-compact`,hidden:!0});key=``;parts=[];clock=J(`span`,{class:`clock`});pace=J(`span`,{class:`pace`});pillGauge=Cy({v:0,inner:[]});pillText=J(`small`);host;constructor(e){this.host=e,this.pill.append(this.pillGauge,J(`span`,{class:`name`}),this.pillText)}update(e){let t=this.host.state(),n=t.scenario,r=this.host.settings();this.el.hidden=e,this.pill.hidden=!e;let i=`${n.id} ${r.showPace}`;if(i!==this.key&&(this.key=i,this.parts=n.goals.map(e=>{let t=J(`b`,{class:`cd-num`}),n=J(`small`),r=J(`span`),i=Cy({v:0,col:e.kind===`soil`?`var(--tide)`:void 0,inner:[r]});return{el:J(`div`,{class:`goal`,title:Py(e)},i,J(`span`,{class:`fig`},t,n)),g:i,ic:r,fig:t,of:n}}),Xv(this.el,J(`div`,{class:`who`,title:ob(t)},J(`b`,{class:`name`},n.name),this.clock,r.showPace&&!n.sandbox?this.pace:null),J(`span`,{class:`sep`}),n.goals.length?J(`div`,{class:`goals`},...this.parts.map(e=>e.el)):J(`span`,{class:`cd-small`},`No goals: build whatever you like.`)),yp(this.pill.querySelector(`.name`),`.name`).textContent=n.name),this.clock.replaceChildren(...cb(t)),this.parts.forEach((e,i)=>{let a=My(t,i),o=n.goals[i];Zv(e.g,`--v`,Math.max(0,Math.min(1,a.v))),e.el.classList.toggle(`is-done`,a.done),e.g.classList.toggle(`is-done`,a.done);let s=a.done&&o.kind!==`soil`,c=s?`check`:jy(o);if(e.ic.dataset.icon!==c&&(e.ic.dataset.icon=c,e.ic.replaceChildren(X(c,20))),Z(e.fig,s&&o.kind===`rate`?`done`:a.figure),Z(e.of,s&&o.kind===`rate`?` · ${o.perMin} a min`:lb(o)),r.showPace&&o.kind===`deliver`&&!a.done&&t.completedAt===null){let r=e.g.querySelectorAll(`.cd-gauge__tick`);r.length||(e.g.prepend(J(`span`,{class:`cd-gauge__tick`}),J(`span`,{class:`cd-gauge__tick is-silver`})),r=e.g.querySelectorAll(`.cd-gauge__tick`)),Zv(r[0],`--at`,Math.min(1,t.time/n.par)),Zv(r[1],`--at`,Math.min(1,t.time/(n.par*l_)))}else e.g.querySelectorAll(`.cd-gauge__tick`).forEach(e=>e.remove())}),r.showPace&&!n.sandbox){let e=ub(t);this.pace.hidden=t.completedAt!==null,Z(this.pace,e===null?`not done at this pace yet`:`done by ${Q(e)} at this pace`),this.pace.title=`At the pace of the last 5 minutes`}let a=n.goals.length?My(t,0):null;Zv(this.pillGauge,`--v`,a?Math.min(1,a.v):0),Z(this.pillText,`${a?`${a.short} · `:``}${n.sandbox?`${Q(t.time)} played`:t.completedAt===null?`${Q(t.time)} of ${Q(n.par)}`:`done in ${Q(t.completedAt)}`}`)}};function fb(e,t){let n=e=>`${(e/24*100).toFixed(2)}%`;return`conic-gradient(from 180deg, #2e3d52 0 ${n(e-.5)}, #c4a36b ${n(e-.5)} ${n(e+.7)}, #eadfb8 ${n(e+2.4)} ${n(t-2.4)}, #c4a36b ${n(t-.7)} ${n(t+.5)}, #2e3d52 ${n(t+.5)})`}var pb=class{el=J(`div`,{class:`hud-top`});credits={el:J(`span`,{class:`cd-pill`,title:`Credits, and what deliveries earned over the last minute`}),v:J(`span`),sub:J(`small`)};power={el:J(`button`,{class:`cd-pill is-link`,title:`Power made now, and used (W)`}),v:J(`span`),sub:J(`small`)};stored={el:J(`button`,{class:`cd-pill is-link`,title:`Charge stored in every battery`}),v:J(`span`),sub:J(`small`)};sun=J(`span`);wind=J(`span`);next=J(`span`,{class:`cd-chip`,style:`padding-left: 12px`});speeds=[];dial=J(`div`,{class:`cd-dial`});time=J(`div`,{class:`cd-figure cd-num`});day=J(`div`,{class:`cd-label`});panels=new Map;host;constructor(e){this.host=e;let t=e.state().scenario.weather;this.credits.el.append(X(`coin`),this.credits.v,this.credits.sub),this.power.el.append(X(`bolt`),this.power.v,this.power.sub),this.stored.el.append(X(`battery`),this.stored.v,this.stored.sub),this.power.el.addEventListener(`click`,()=>e.togglePanel(`power`)),this.stored.el.addEventListener(`click`,()=>e.togglePanel(`power`));let n=J(`div`,{class:`cd-dial__sky`});n.style.background=fb(t.sunrise,t.sunset),this.dial.append(n,J(`div`,{class:`cd-dial__sun`}),J(`div`,{class:`cd-dial__face`},J(`div`,null,this.time,this.day)));let r=J(`div`,{class:`cd-seg`},...[[0,X(`pause`),`Pause`,`pause`],[1,`1×`,`Normal speed`,`speed1`],[2,`2×`,`Double speed`,`speed2`],[4,`4×`,`Fast`,`speed3`]].map(([t,n,r,i])=>{let a=ab(J(`button`,{"aria-label":r,onclick:()=>e.setSpeed(t)},n),()=>ib(r,...tb(i)));return this.speeds.push(a),a})),i=(t,n,r,i)=>{let a=ab(J(`button`,{class:`cd-panelbtn`,onclick:()=>e.togglePanel(t)},X(r),n),()=>ib(n,...tb(i)));return this.panels.set(t,a),a};this.el.append(J(`div`,{class:`row`},this.credits.el,this.power.el,this.stored.el),J(`div`,{class:`clock`},J(`div`,null,J(`div`,{class:`chips cd-small`},J(`span`,{class:`cd-chip`,title:`The sun's strength now`},X(`sun`),this.sun),J(`span`,{class:`cd-chip`,title:`The wind's strength now`},X(`wind`),this.wind),this.next),r),this.dial),J(`div`,{class:`panels`},i(`ledger`,`Ledger`,`chart`,`ledger`),i(`routes`,`Routes`,`route`,`routes`),i(`power`,`Power`,`bolt`,`power`),i(`guide`,`Guide`,`book`,`guide`)))}updateButtons(){let e=this.host.speed();this.speeds.forEach((t,n)=>t.classList.toggle(`is-on`,[0,1,2,4][n]===e));for(let[e,t]of this.panels)t.classList.toggle(`is-on`,this.host.panelOpen(e))}update(){let e=this.host.state(),t=e.scenario,n=t.weather;Z(this.credits.v,t.sandbox?`∞`:ty(Math.floor(e.credits)));let r=Nm(e);Z(this.credits.sub,t.sandbox?`credits`:r>0?`+${ty(r)} / min`:`credits`);let i=$h(e).list,a=i.reduce((e,t)=>e+t.made,0),o=i.reduce((e,t)=>e+Yh(t),0),s=i.reduce((e,t)=>e+t.stored,0),c=i.reduce((e,t)=>e+t.capacity,0),l=i.reduce((e,t)=>t.wanted>0?Math.min(e,t.share):e,1);Z(this.power.v,i.length?ry(a):`No pylons`),Z(this.power.sub,i.length?l<1?`short · ${iy(l)}`:`${ry(o).replace(` W`,``)} used`:``),this.power.sub.classList.toggle(`is-bad`,l<1),Z(this.stored.v,c?iy(s/c):`–`),Z(this.stored.sub,c?`stored`:`no batteries`),Z(this.sun,iy(uv(t,e.time))),Z(this.wind,iy(dv(t,e.time)));let u=cv(e.time),d=u>n.sunrise&&u<n.sunset;Z(this.next,d?`dusk ${$v(n.sunset)}`:`dawn ${$v(n.sunrise)}`),Zv(this.dial,`--t`,(u/24).toFixed(4)),Z(this.time,$v(u)),Z(this.day,`day ${lv(e.time)}`)}},mb=[[`none`,`Off`,null],[`fertility`,`Soil`,`soil`],[`water`,`Water`,`water`],[`power`,`Power`,`bolt`],[`roads`,`Roads`,`road`],[`bees`,`Bees`,`bee`]],hb=class{el=J(`div`,{class:`cd-viewbar hud-view`});buttons=new Map;host;constructor(e){this.host=e;for(let[t,n,r]of mb){let i=ab(J(`button`,{class:r?``:`is-off`,onclick:()=>e.setOverlay(t)},r?X(r):null,J(`span`,null,n)),()=>{let e=tb(`overlay`);return`${t===`none`?`No overlay`:`Show ${n.toLowerCase()}`}${e.length?` (${e.join(` or `)} cycles)`:``}`});this.buttons.set(t,i),this.el.append(i)}}update(){let e=this.host.overlay();for(let[t,n]of this.buttons)n.classList.toggle(`is-on`,t===e)}};function gb(e){return J(`div`,{class:`cd-viewbar hud-controls`},ab(J(`button`,{"aria-label":`Turn the view left`,onclick:()=>e.turn(-1)},X(`rotate`,void 0,`flip`)),()=>ib(`Turn the view`,...tb(`turnLeft`))),ab(J(`button`,{"aria-label":`Turn the view right`,onclick:()=>e.turn(1)},X(`rotate`)),()=>ib(`Turn the view`,...tb(`turnRight`))),ab(J(`button`,{"aria-label":`Zoom out`,onclick:()=>e.zoom(-1)},`−`),()=>ib(`Zoom out`,`wheel`,...tb(`zoomOut`))),ab(J(`button`,{"aria-label":`Zoom in`,onclick:()=>e.zoom(1)},`+`),()=>ib(`Zoom in`,`wheel`,...tb(`zoomIn`))),J(`button`,{title:`Menu (Esc)`,"aria-label":`Menu`,onclick:()=>e.openPause()},X(`menu`)))}var _b=[[`ok`,`Working`,`making goods`],[`idle`,`Idle`,`nothing to do`],[`input`,`Waiting for input`,`a good is short`],[`flowers`,`No flowers near`,`hive, no flowering field in reach`],[`blocked`,`Blocked`,`output store full`],[`lowpower`,`Low power`,`gets a share of what it needs`],[`power`,`No power`,`its network has none`],[`nolink`,`Not connected`,`no pylon reaches it`],[`noroute`,`No route takes its goods`,`full, and no truck picks it up`],[`noroad`,`No road`,`trucks can't reach it`],[`dry`,`Dry`,`a field no sprinkler waters`]];function vb(){return J(`div`,{class:`cd-card markers`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`},`What the markers mean`),J(`span`,{class:`cd-small`},`a shape and a word, never colour alone`)),J(`div`,{class:`list`},..._b.map(([e,t,n])=>J(`div`,null,Oy(e,t),J(`span`,{class:`cd-small`},n)))))}var yb=e=>J(`span`,{class:`cd-key`},e),bb={build:[[`Place · a row`,`Click`,`or`,`Drag`],[`Drop what is in hand`,`Right click`]],view:[[`Pan`,`Drag`]],time:[],panels:[[`Close a panel · pause`,`Esc`]]};function xb(){return J(`div`,{class:`cd-card keys`},J(`div`,{class:`cd-label`},`Keys`),J(`div`,{class:`cols`},...kv.map(e=>J(`div`,null,J(`div`,{class:`cd-label group`,style:`--col: ${e.col}`},J(`i`),e.name),J(`div`,{class:`cd-keyrows`},...Av.filter(t=>t.group===e.id).map(e=>{let t=tb(e.id);return J(`div`,{class:`cd-keyrow`,title:e.note},J(`span`,null,e.label),...t.length?t.map(yb):[J(`small`,null,`no key`)])}),...bb[e.id].map(([e,...t])=>J(`div`,{class:`cd-keyrow`},J(`span`,null,e),...t.map(e=>e===`or`?J(`small`,null,e):yb(e)))))))))}function Sb(e){let t=e.scenario,n=$h(e).list,r=n.reduce((e,t)=>e+t.made,0),i=n.reduce((e,t)=>e+Yh(t),0),a=e.buildings.filter(t=>t.type===`battery`&&$h(e).of.has(t.id)),o=a.reduce((e,t)=>e+t.charge,0),s=a.length*K.battery.capacity;return J(`div`,{class:`cd-card standing`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`},ob(e)),J(`span`,{class:`cd-small`},t.sandbox?`${Q(e.time)} played`:e.completedAt===null?[J(`b`,{class:`cd-num`},Q(e.time)),` of ${Q(t.par)}`]:`done in ${Q(e.completedAt)}`)),J(`div`,{class:`body`},...t.goals.map((n,r)=>{let i=My(e,r);return Cy({v:i.v,d:t.goals.length>2?84:108,col:n.kind===`soil`?`var(--tide)`:void 0,cls:i.done&&n.kind!==`soil`?`is-done`:``,inner:[J(`div`,{class:`cd-figure`},i.figure),J(`div`,{class:`cd-small`},i.done&&n.kind!==`soil`?`done`:i.of)],foot:``})}).map((n,r)=>(yp(n.querySelector(`.cd-gauge__foot`),`.cd-gauge__foot`).append(X(jy(t.goals[r]),14),` ${My(e,r).word}`),n)),J(`div`,{class:`facts`},J(`div`,null,J(`span`,null,`Credits`),J(`b`,{class:`cd-num`},t.sandbox?`∞`:ty(Math.floor(e.credits)))),J(`div`,null,J(`span`,null,`Power`),J(`b`,{class:`cd-num`},n.length?`${ry(r)} / ${ry(i)}`:`none`)),J(`div`,null,J(`span`,null,`Stored`),J(`b`,{class:`cd-num`},s?iy(o/s):`–`)))),t.sandbox?null:J(`div`,{class:`cd-small times`},...Fy(t.par)))}function Cb(e){let t=e.state(),n=t.scenario,r=n.goals.find(e=>e.kind===`deliver`),i=J(`div`,{class:`restart-note`,hidden:!0},`Restart loses ${Q(t.time)} of play${r&&r.kind===`deliver`&&t.delivered[r.item]?` and ${ty(t.delivered[r.item]??0)} ${ay(r.item)}`:``}. Press again to confirm.`),a=!1,o=J(`button`,{class:`cd-btn is-danger is-lg`,onclick:()=>{if(a){e.restart();return}a=!0,i.hidden=!1,yp(o.lastChild,`button label`).textContent=`Restart: sure?`}},X(`rotate`,18),`Restart`);return J(`div`,{class:`pause`},J(`div`,{class:`title`},J(`div`,{class:`big-title`},`Paused`),J(`div`,{class:`sub`},`${n.name} · day ${lv(t.time)}, ${$v(cv(t.time))}${n.sandbox?``:` · ${Q(t.time)} of ${Q(n.par)}`}`)),J(`div`,{class:`grid`},Sb(t),J(`div`,{class:`centre`},J(`button`,{class:`cd-btn is-primary is-lg resume`,onclick:()=>e.resume()},X(`play`,18,`inv`),`Resume`,J(`span`,{class:`keys`},J(`span`,{class:`cd-key`},`Esc`),...tb(`pause`).map(e=>J(`span`,{class:`cd-key`},e)))),J(`div`,{class:`two`},J(`button`,{class:`cd-btn is-lg`,onclick:()=>e.menu()},`Level select`),o),J(`button`,{class:`cd-btn is-lg settings-btn`,onclick:()=>e.openSettings()},X(`menu`,18),`Settings`),i),vb()))}var wb={silo:{what:`Stores goods. Trucks drop goods into it and pick them up again: a buffer between a chain's steps, or a place to gather many fields' harvest.`,how:[`Place it with an open tile beside it, so trucks can reach it.`,`Make it a stop on a route. A new silo stop drops every good; choose the goods trucks pick up there, and they are no longer dropped.`],tips:[`One route can bring goods in (a few fields, then the silo) and another take them out (the silo, then a mill): each runs at its own pace.`,`It loads ${sy(ep(`silo`),`truck`)} at a time. A queue of trucks beside it means it is busy: a second silo shares the work.`]},garage:{what:`Home of the trucks that carry every good. Buy trucks here and give each a route; they come back to charge.`,how:[`Place it with an open tile beside it, within a pylon's reach: trucks charge here from its network.`,`Select it and buy trucks (up to ${q.perGarage}). Give each a route: pick one, or make a new one and click the buildings it should stop at.`],tips:[`Put it near the routes its trucks drive: a truck low on charge drives home before it goes on.`,`A truck that gets no charge for a few seconds goes on anyway, and crawls once its battery is empty.`]},field:{what:`Grows the chosen crop on its ${G.field.size} × ${G.field.size} tiles. Crops are the start of every chain.`,how:[`Build it on good soil: its placement card shows the soil under it now and in 10 minutes, and the Soil overlay shows the whole map.`,`Select it and choose the crop. Wheat is the default.`,`Build it beside the machine that uses its crop (a mill for wheat), and the machine takes the harvest itself. Or make it a stop on a route: trucks pick up the harvest. A full field stops growing.`,`Put it beside water, or a sprinkler within ${K.sprinklerReach} tiles of its centre: dry fields grow at ×${Vf.dry} speed.`],tips:[`Every harvest wears the soil out, except beans, which restore it. Compost brings it back: a field stop drops compost by itself.`,`A beehive within ${Qf.reach} tiles adds 1 to every harvest of a flowering crop.`]},sprinkler:{what:`Waters every field whose centre is within reach. Watered fields grow at full speed.`,how:[`Place it next to or between fields. The Water overlay shows what it reaches.`,`Put it within a pylon's reach: it needs a little power all the time, less near water.`],tips:[`One sprinkler between four fields waters all of them.`]},coop:{what:`Four chickens turn feed (beans, bran or seed cake) into eggs, with manure on the side.`,how:[`Build it beside a mill (bran) or a bean field, and it takes its feed from them; or bring feed on a route.`,`A bakery or composter beside it takes its eggs or manure; trucks pick up the rest. Give the manure somewhere to go: a composter, a digester, or the depot.`],tips:[`Its manure must go somewhere. A coop whose manure piles up stops laying.`]},hive:{what:`Bees make honey from flowering fields nearby (anything but wheat), and pollinate them for a bigger harvest.`,how:[`Place it within ${Qf.reach} tiles of flowering fields: up to ${Qf.maxFlowers} of them count. The Bees overlay shows its range.`,`Build it beside a bakery making honey cake, or make it a stop on a route, so trucks pick up the honey.`]},composter:{what:`Turns waste (manure, bran, seed cake) into compost, which brings tired soil back.`,how:[`Build it beside a coop or mill, or bring it manure, bran or seed cake on a route.`,`A field beside it takes its compost when its soil is poor. Take the rest to fields on a route: each takes only what its soil needs, and the truck carries the rest on. End the route at the depot or a silo for compost no field needs.`]},mill:{what:`Grinds wheat into flour, with bran as a byproduct.`,how:[`Build it beside wheat fields and it takes their wheat; a bakery, coop or digester beside it takes its flour or bran. Or make it a stop on a route: trucks bring it wheat and take its flour and bran.`,`Give the bran somewhere to go (a coop, a composter, a digester, or the depot), or the mill stops.`,`Put it within a pylon's reach.`]},press:{what:`Presses sunflowers into oil, with seed cake as a byproduct.`,how:[`Make it a stop on a route: trucks bring it sunflowers and take its oil and seed cake.`,`Give the seed cake somewhere to go.`,`Put it within a pylon's reach.`]},spinner:{what:`Spins flax into yarn.`,how:[`Make it a stop on a route: trucks bring it flax and take its yarn.`,`Put it within a pylon's reach.`]},loom:{what:`Weaves yarn into linen, a valuable product.`,how:[`Make it a stop on a route: trucks bring it yarn and take its linen.`,`Put it within a pylon's reach.`]},bakery:{what:`Bakes flour and eggs into bread, or, with honey as well, into honey cake.`,how:[`Select it and choose bread or honey cake.`,`Make it a stop on a route: trucks bring it flour and eggs (and honey for cake) and take what it bakes.`,`Put it within a pylon's reach.`]},cannery:{what:`Cooks tomatoes and oil into tomato sauce, a valuable product.`,how:[`Make it a stop on a route: trucks bring it tomatoes and oil and take its sauce.`,`Put it within a pylon's reach.`]},solar:{what:`Makes power from the sun: most at midday, nothing at night. The sun chip beside the dial shows how strong the sun is now; on some commissions it is weak.`,how:[`Place it within a pylon's reach. Add batteries to keep machines running through the night.`]},turbine:{what:`Makes power from the wind, day and night. The wind comes and goes.`,how:[`Place it in the open, within a pylon's reach. Trees and tall buildings within ${K.shelterReach} tiles shelter it and cost power.`]},battery:{what:`Stores spare power and gives it back when the network falls short, such as at night. Its cells light up from the bottom as it fills: one ring a quarter.`,how:[`Place it within a pylon's reach. It charges whenever its network makes more than it uses.`]},digester:{what:`Burns waste (manure, bran or seed cake) for steady power, day and night.`,how:[`Build it beside a coop or a mill, or bring it manure, bran or seed cake on a route.`,`Place it within a pylon's reach.`],tips:[`A good home for byproducts you have no other use for.`]},pylon:{what:`Carries power. Every building that makes, stores or uses power must be in a pylon's reach.`,how:[`Place pylons so every powered building has a tile within reach. Placing one shows its reach (the square) and how far it links (the dashed circle), with the wires it would make.`,`Pylons close enough to each other link into one network, which shares all its power.`,`Drag to lay a line: pylons go down spaced so their reaches meet and each links to the next.`],tips:[`Two networks that don't link don't share power. Each network has its own colour on the Power overlay: its reach, the wires between its pylons and a line to every building it powers.`,`Select or point at a pylon, or select any powered building, to see its network.`]},sapling:{what:`Grows into a tree. Trees add to soil health; some commissions ask for it.`,how:[`Plant it on open grass.`],tips:[`Keep trees away from wind turbines: they shelter them.`]},depot:{what:`Where goods go to count. Every good delivered here counts towards the commission and pays its price.`,how:[`Make it the last stop of a route: trucks drop their goods here and the depot buys them all.`,`Choose what a route drops here: a route can drop only the product and keep the rest aboard for its other stops.`],tips:[`It loads ${sy(ep(`depot`),`truck`)} at a time.`]}},Tb=[{id:`start`,name:`First steps`,chip:`First steps`},{id:`trucks`,name:`Trucks and routes`,chip:`Routes`},{id:`power`,name:`Power`,chip:`Power`},{id:`soil`,name:`Soil and water`,chip:`Soil`},{id:`markers`,name:`Statuses and markers`,chip:`Statuses`},{id:`keys`,name:`Keys`,chip:`Keys`}],Eb=e=>Nf[e].name.toLowerCase(),Db=e=>Number.isInteger(e)?String(e):e.toFixed(1);function Ob(e){return e===`field`?`wheat`:e===`hive`?`honey`:qf(e)[0]?.outputs[0]?.item??null}function kb(e){let t=e.scenario,n=[`start`];return(t.goals.some(e=>e.kind===`soil`)||t.terrain.soil<50)&&n.push(`soil`),(t.weather.sun<1||t.weather.sunset-t.weather.sunrise<12||t.weather.wind<.4)&&n.push(`power`),t.goals.some(e=>e.kind!==`soil`&&fy(e.item).from?.inputs.length)&&n.push(`trucks`),n}var Ab={solar:`Solar`,turbine:`Turbine`,depot:`Depot`,hive:`Beehive`,press:`Oil press`};function jb(e,t,n){let r=t?.state()??null,i=J(`div`,{class:`guide-index`}),a=J(`div`,{class:`guide-page`}),o=e,s=``,c=e=>{o=e,s=``,d.value=``,h(),a.scrollTop=0},l=(e,t)=>J(`button`,{class:`link`,onclick:()=>c(t)},e),u=e=>l(G[e].name,{kind:`building`,id:e}),d=J(`input`,{class:`cd-input`,placeholder:`Search buildings, goods, keys…`,spellcheck:!1,"aria-label":`Search the guide`,oninput:()=>{s=d.value.trim().toLowerCase(),m()},onkeydown:e=>{e.key===`Escape`&&(e.stopPropagation(),n())}}),f=J(`div`,{class:`guide-results`}),p=new Set(r?r.buildings.map(e=>e.type):[]);function m(){let e=J(`div`,{class:`topics`},...Tb.map(e=>J(`button`,{class:`topic${o.kind===`topic`&&o.id===e.id?` is-on`:``}`,onclick:()=>c({kind:`topic`,id:e.id})},e.chip)),J(`button`,{class:`topic${o.kind===`goods`?` is-on`:``}`,onclick:()=>c({kind:`goods`})},`Goods`)),t=e=>J(`button`,{class:`gtile${o.kind===`building`&&o.id===e?` is-on`:``}${p.has(e)?` is-here`:``}`,onclick:()=>c({kind:`building`,id:e})},X(e,40),Ab[e]??G[e].name),n;if(s){let e=[];for(let t of Object.keys(G))`${G[t].name} ${wb[t].what}`.toLowerCase().includes(s)&&e.push(J(`button`,{class:`hit`,onclick:()=>c({kind:`building`,id:t})},X(t,28),J(`b`,null,G[t].name),J(`span`,{class:`cd-small`},G[t].hint)));for(let t of Mf)`${Nf[t].name} ${Nf[t].hint}`.toLowerCase().includes(s)&&e.push(J(`button`,{class:`hit`,onclick:()=>c({kind:`goods`})},X(t,28),J(`b`,null,Nf[t].name),J(`span`,{class:`cd-small`},Nf[t].hint)));for(let t of Tb)t.name.toLowerCase().includes(s)&&e.push(J(`button`,{class:`hit`,onclick:()=>c({kind:`topic`,id:t.id})},X(`book`,28),J(`b`,null,t.name),J(`span`,{class:`cd-small`},`Topic`)));for(let[t,n]of Mb())`${t} ${n}`.toLowerCase().includes(s)&&e.push(J(`button`,{class:`hit`,onclick:()=>c({kind:`topic`,id:`keys`})},J(`span`,{class:`cd-key`},n),J(`b`,null,t),J(`span`,{class:`cd-small`},`Key`)));n=[J(`div`,{class:`hits`},...e.length?e:[J(`p`,{class:`cd-small`},`Nothing matches.`)])]}else n=[...Uf.map(e=>J(`div`,{class:`cat`},J(`div`,{class:`cd-label`},e.name),J(`div`,{class:`gtiles`},...Object.keys(G).filter(t=>G[t].category===e.id||e.id===`logistics`&&t===`depot`).map(t)))),r?J(`div`,{class:`cd-small legend`},J(`i`),`Outlined: you have one in this valley`):null,r?J(`div`,{class:`cd-inset worth`},J(`div`,{class:`cd-label`},`Worth reading for ${r.scenario.name}`),J(`div`,{class:`chips`},...kb(r).map(e=>J(`button`,{class:`cd-chip`,onclick:()=>c({kind:`topic`,id:e})},yp(Tb.find(t=>t.id===e),`topic`).name)))):null];Xv(f,e,...n)}Xv(i,J(`div`,{class:`cd-label`},`The guide`),d,f);function h(){m(),Xv(a,J(`button`,{class:`cd-btn is-icon close`,title:ib(`Close`,...tb(`guide`),`Esc`),"aria-label":`Close`,onclick:n},X(`close`,16)),...o.kind===`building`?g(o.id):o.kind===`goods`?A():te(o.id))}function g(e){let i=G[e],a=wb[e],o=qf(e),s=Ob(e),c=Uf.find(e=>e.id===i.category)?.name??`The map`,l=E(e);return[J(`div`,{class:`cd-small cd-faint`},`Buildings · ${c}`),J(`div`,{class:`spread`},J(`div`,{class:`main`},J(`div`,{class:`title-row`},J(`span`,{class:`big-icon`},X(e,116)),J(`div`,null,J(`h1`,{class:`cd-display`},i.name),J(`p`,{class:`lead`},a.what),i.category&&t?J(`button`,{class:`cd-btn is-primary`,title:ib(`Build`,...tb(`build:${e}`)),onclick:()=>{t.build(e),n()}},`Build · ${i.cost} credits`):null)),o.length?J(`div`,{class:`cd-label sec`},o.length>1?`Recipes`:`Recipe`):null,o.length?J(`div`,{class:`recipes`},...o.map(y)):null,b(e),s?T(s):null,J(`div`,{class:`cd-label sec`},`How to use it`),J(`ol`,{class:`how`},...a.how.map(e=>J(`li`,null,e))),l.length?J(`div`,{class:`cd-label sec`},`Numbers`):null,l.length?J(`div`,{class:`num-rows`},...l):null,...D(e)),J(`div`,{class:`side`},r&&i.category?x(e,r):null,S(e),a.tips?J(`div`,null,J(`div`,{class:`cd-label`},`Good to know`),J(`div`,{class:`tips`},...a.tips.map(e=>J(`div`,{class:`tip`},X(`check`,20),J(`span`,null,e))))):null))]}let _=(e,t,n=!1)=>J(`button`,{class:`cd-chip${n?` is-ink`:``}`,onclick:()=>c({kind:`goods`})},X(e,30),`${t===void 0?``:`${t} `}${Eb(e)}`),v=e=>`item`in e?_(e.item,e.n):J(`span`,{class:`cd-chip`},X(Pf[e.group][0],30),`${e.n} ${Rf[e.group].split(` (`)[0]}`);function y(e){return J(`div`,{class:`rec`},...e.inputs.flatMap((e,t)=>[t?J(`span`,{class:`plus`},`+`):null,v(e)]),J(`span`,{class:`rec-time`},`${e.time} s`),...e.outputs.length?e.outputs.flatMap((e,t)=>[t?J(`span`,{class:`plus`},`+`):null,_(e.item,e.n,t===0)]):[J(`span`,{class:`cd-chip is-ink`},X(`bolt`,24),`${K.digester} W`)],J(`span`,{class:`cd-small`},e.outputs.length?`${Db(60/e.time*e.outputs[0].n)} a minute at most`:`burns ${Db(60/e.time)} a minute`))}function b(e){let t=G[e],n=qf(e)[0],r=(e,t,n)=>J(`div`,null,J(`div`,{class:`cd-label`},e),J(`div`,{class:`cd-figure`},t),J(`div`,{class:`cd-small`},n)),i=e===`sprinkler`?[`${K.sprinklerNearWater}–${K.sprinklerFar} W`,`near water to far`]:e===`garage`?[`${q.chargeRate} W`,`a truck charging`]:t.power?[`${t.power} W`,`while working`]:e===`solar`?[`${K.solar} W`,`at noon, full sun`]:e===`turbine`?[`${K.turbine} W`,`in full wind`]:e===`digester`?[`${K.digester} W`,`made while burning`]:e===`battery`?[`${K.battery.capacity} J`,`stored`]:[`—`,`none`];return J(`div`,{class:`nums`},r(`Cost`,t.category?String(t.cost):`—`,t.category?`credits · full refund`:`it is the map's`),r(`Power`,i[0],i[1]),r(`Size`,`${t.size} × ${t.size}`,`tiles${t.tall?` · tall`:``}`),n?r(`Holds`,`3`,`batches in, 3 out`):e===`silo`?r(`Holds`,String($f.perGood),`of each good`):e===`field`?r(`Holds`,String(Vf.store),`harvested goods`):r(`Holds`,`—`,`nothing`),n?r(`Feeds on`,String(n.inputs.reduce((e,t)=>e+t.n,0)),n.inputs.map(e=>`item`in e?Eb(e.item):e.group).join(` + `)):r(`Feeds on`,e===`field`?`1`:`—`,e===`field`?`compost, if given`:`nothing`))}function x(e,r){let i=r.buildings.filter(t=>t.type===e),a=i.map(t=>{if(t.type===`field`){let e=Bf[t.crop];return{item:t.crop,full:(e.yield+(e.flowers&&sh(r,t)?1:0))*nh(1,uh(r,t)).pace*60/e.grow}}let n=gh(t),i=n?.outputs[0];return n&&i?{item:i.item,full:i.n*60/n.time}:e===`hive`?{item:`honey`,full:0}:null}),o=i.map((e,t)=>{let n=Pm(r,e),i=a[t];return n&&i?Wm(n,r.time,300).perMin[i.item]??0:0}),s=a.some(e=>e),c=a.reduce((e,t)=>e+(t?.full??0),0),l=o.reduce((e,t)=>e+t,0),u=new Map;a.forEach((e,t)=>{e&&u.set(e.item,(u.get(e.item)??0)+o[t])});let d=[...u].map(([e,t])=>`${Db(Math.round(t*10)/10)} ${Eb(e)}`).join(`, `),f=t=>t===1?G[e].name.toLowerCase():`${G[e].name.toLowerCase()}${G[e].name.endsWith(`s`)?`es`:`s`}`;return J(`div`,{class:`cd-card is-ink valley-now`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`},`In your valley now`),J(`span`,{class:`cd-small`},`${ey(r.time)} · day ${lv(r.time)}`)),i.length?J(`div`,{class:`sum`},s?wy({v:c?l/c:0,d:96,w:8,col:`var(--ochre)`},J(`div`,null,J(`div`,{class:`big`},Db(Math.round(l*10)/10)),c?J(`div`,{class:`cd-small`},`of ${Db(c)}`):null)):null,J(`div`,null,J(`div`,{class:`what`},`${i.length} ${f(i.length)}${s?` · ${d} a minute together`:``}`),c?J(`div`,{class:`cd-small`},`at full speed they would make ${Db(c)}`):null)):J(`p`,{class:`cd-small`},`No ${f(2)} yet.`),...i.slice(0,6).map((r,i)=>J(`div`,{class:`vrow`},J(`div`,null,J(`div`,{class:`vname`},`${G[e].name} ${i+1}`),Oy(r.status,Dy(r,r.status,r.need))),a[i]?J(`span`,null,J(`span`,{class:`big`},Db(Math.round(o[i]*10)/10)),J(`span`,{class:`cd-small`},` / min`)):J(`span`),t?J(`button`,{class:`cd-btn is-sm`,onclick:()=>{t.focus(r.id),n()}},`Show ›`):null)),i.length>6?J(`div`,{class:`cd-small`},`and ${i.length-6} more`):null)}function S(e){let t=new Set(C(e)),n=new Set(w(e)),r=new Map,i=e=>{let t=r.get(e);return t||r.set(e,t=[]),t};for(let r of Wf)if(r.building!==e){for(let e of r.outputs)t.has(e.item)&&i(r.building).push(Eb(e.item));for(let e of r.inputs)for(let t of`item`in e?[e.item]:Pf[e.group])n.has(t)&&i(r.building).push(Eb(t))}for(let n of zf)t.has(n)&&e!==`field`&&i(`field`).push(Eb(n));return t.has(`honey`)&&e!==`hive`&&r.set(`hive`,[`honey`]),n.has(`compost`)&&i(`field`).push(`compost`),r.size?J(`div`,null,J(`div`,{class:`cd-label`},`Works with`),J(`div`,{class:`chips`},...[...r].map(([e,t])=>J(`button`,{class:`cd-chip`,onclick:()=>c({kind:`building`,id:e})},X(e,24),`${G[e].name} · ${[...new Set(t)].join(`, `)}`)))):null}let C=e=>e===`field`?[`compost`]:[...new Set(qf(e).flatMap(e=>e.inputs.flatMap(e=>`item`in e?[e.item]:[...Pf[e.group]])))],w=e=>e===`field`?[...zf]:e===`hive`?[`honey`]:[...new Set(qf(e).flatMap(e=>e.outputs.map(e=>e.item)))];function T(e){let t=fy(e),n=[],r=[],i=0,a=0;function o(e,t,s,c){let l={kind:`good`,label:Nf[e].name,icon:e,col:s,row:0,go:{kind:`goods`}};if(n.push(l),a=Math.max(a,s),!t)return l.row=i++,l;let u={kind:`building`,label:G[t.building].name,icon:t.building,col:s+1,row:0,key:c,go:{kind:`building`,id:t.building}};n.push(u),a=Math.max(a,s+1),r.push({a:u,b:l,kind:`inside`,time:`${t.time} s`,label:t.verb});let d=t.inputs.map(e=>{if(`item`in e)return o(e.item,e.from,s+2,!1);let t={kind:`group`,label:Rf[e.group].split(` (`)[0],icon:Pf[e.group][0],col:s+2,row:i++};return n.push(t),a=Math.max(a,s+2),t});for(let e of d)r.push({a:e,b:u,kind:`hop`});return u.row=d.length?(d[0].row+d[d.length-1].row)/2:i++,l.row=u.row,l}o(e,t.from,0,!0);let s=(a+1)*104,l=Math.max(1,i)*104,u=e=>(a-e.col)*104+52,d=e=>e.row*104+44,f=r.map(e=>Y(`path`,{d:`M ${u(e.a)+30} ${d(e.a)} C ${(u(e.a)+u(e.b))/2} ${d(e.a)}, ${(u(e.a)+u(e.b))/2} ${d(e.b)}, ${u(e.b)-30} ${d(e.b)}`,class:e.kind})),p=r.filter(e=>e.kind===`inside`).map(e=>J(`span`,{class:`link-label ${e.kind}`,style:`left: ${(u(e.a)+u(e.b))/2}px; top: ${(d(e.a)+d(e.b))/2-(e.kind===`inside`?40:30)}px`},e.time?J(`b`,null,e.time):null,e.label??``));return J(`div`,null,J(`div`,{class:`row-head sec`},J(`span`,{class:`cd-label`},`Where ${Eb(e)} comes from`),J(`span`,{class:`cd-small cd-faint`},`times in general, at full speed`)),J(`div`,{class:`chain-scroll`},J(`div`,{class:`chain`,style:`width: ${s}px; height: ${l+20}px`},Y(`svg`,{width:s,height:l+20,viewBox:`0 0 ${s} ${l+20}`},...f),...p,...n.map(e=>J(`button`,{class:`node is-${e.kind}${e.key?` is-key`:``}`,style:`left: ${u(e)}px; top: ${d(e)-26}px`,onclick:()=>e.go&&c(e.go)},J(`span`,{class:`disc`},X(e.icon,e.key?46:36)),e.label)))),J(`div`,{class:`cd-small chain-key`},J(`span`,null,J(`i`,{class:`solid`}),`inside a building`),J(`span`,null,J(`i`,{class:`dashed`}),`next door: straight across a shared edge · or by truck: depends on your routes`),J(`span`,null,`Then by truck to the depot.`)))}function E(e){let t=[];switch(e){case`silo`:t.push([`Holds`,`${$f.perGood} of each good`],[`Loads`,`${sy(ep(`silo`),`truck`)} at a time`]);break;case`garage`:t.push([`Holds`,`${q.perGarage} trucks`],[`A truck costs`,`${q.cost} credits`],[`A truck carries`,`${q.cargo} goods, of any mix`],[`Speed`,`${q.speed} tiles a second (${q.crawl} on an empty battery)`],[`Loading and unloading`,`${q.moveRate} goods a second`],[`Battery`,`${q.battery} J, ${q.joulesPerTile} J a tile driven`],[`Charging`,`${q.chargeRate} W a truck`]);break;case`field`:t.push([`Grow times are for`,`a watered field at soil 60`],[`Without water`,`×${Vf.dry} speed`],[`Soil 0 → 100`,`×${Vf.poorSoil} → ×${Vf.richSoil} speed`],[`Holds`,`${Vf.store} harvested goods`],[`Compost`,`taken only below soil ${Vf.compostBelow}: +${Vf.compostGain} on every tile at once`]);break;case`sprinkler`:t.push([`Reach`,`fields whose centre is within ${K.sprinklerReach} tiles`],[`Near water`,`within ${K.waterNear} tiles`]);break;case`hive`:t.push([`Reach`,`${Qf.reach} tiles`],[`Honey`,`one every ${Qf.honeySeconds} s with 1 flowering field, ${Qf.honeySeconds/Qf.maxFlowers} s with ${Qf.maxFlowers}`],[`Holds`,`${Qf.store} honey`],[`Pollinated fields`,`+1 good every harvest of a flowering crop`]);break;case`solar`:t.push([`At midday, full sun`,`${K.solar} W (times the sun's strength)`],[`At night`,`0 W`]);break;case`turbine`:t.push([`In full wind`,`${K.turbine} W`],[`Shelter`,`−${K.shelter*100}% for each tree or tall building within ${K.shelterReach} tiles, down to ${K.shelterFloor*100}%`]);break;case`battery`:t.push([`Stores`,`${K.battery.capacity} J (${Math.round(K.battery.capacity/60)} W for a minute)`],[`Charges and gives`,`up to ${K.battery.rate} W`]);break;case`pylon`:t.push([`Powers`,`buildings with a tile within ${K.pylon.reach} tiles`],[`Links to`,`pylons within ${K.pylon.link} tiles`]);break;case`sapling`:t.push([`Grows into a tree in`,`60 s`]);break;case`depot`:t.push([`Pays`,`each good's price (see Goods)`],[`Loads`,`${sy(ep(`depot`),`truck`)} at a time`])}return qf(e).length&&e!==`digester`&&t.push([`Buffers`,`3 batches of each input, 3 of each output`]),G[e].tall&&t.push([`Tall`,`shelters wind turbines within ${K.shelterReach} tiles`]),G[e].onWater&&t.push([`Water`,`can be built on water`]),t.map(([e,t])=>J(`div`,{class:`cd-row`},J(`span`,null,e),J(`i`),J(`b`,null,t)))}function D(e){return e===`field`?[J(`div`,{class:`cd-label sec`},`Crops`),J(`table`,{class:`gtable`},J(`tr`,null,J(`th`,null,`Crop`),J(`th`,null,`Grows in`),J(`th`,null,`Harvest`),J(`th`,null,`Soil a harvest`),J(`th`,null,`Flowers`)),...zf.map(e=>{let t=Bf[e];return J(`tr`,null,J(`td`,null,J(`span`,{class:`gname`},X(e,24),t.name)),J(`td`,null,`${t.grow} s`),J(`td`,null,String(t.yield)),J(`td`,null,`${t.soil>0?`+`:``}${t.soil}`),J(`td`,null,t.flowers?`yes`:`—`))}))]:[]}function ee(e){let t=new Set(Wf.filter(t=>t.outputs.some(t=>t.item===e)).map(e=>e.building));return zf.includes(e)&&t.add(`field`),e===`honey`&&t.add(`hive`),[...t]}function O(e){let t=t=>Pf[t].includes(e),n=new Set(Wf.filter(n=>n.inputs.some(n=>`item`in n?n.item===e:t(n.group))).map(e=>e.building));return e===`compost`&&n.add(`field`),[...n]}let k=e=>e.length?e.flatMap((e,t)=>[t?`, `:``,u(e)]):[`—`];function A(){return[J(`div`,{class:`cd-small cd-faint`},`Goods`),J(`h1`,{class:`cd-display`},`Goods`),J(`p`,{class:`lead`},`Every good trucks carry, where it comes from and where it goes. Any good delivered to the depot pays its price.`),J(`table`,{class:`gtable goods`},J(`tr`,null,J(`th`,null,`Good`),J(`th`,null,`Made by`),J(`th`,null,`Used by`),J(`th`,null,`Pays`)),...Mf.map(e=>J(`tr`,null,J(`td`,null,J(`span`,{class:`gname`},X(e,30),J(`span`,null,J(`b`,null,Nf[e].name),J(`div`,{class:`cd-small`},Nf[e].hint)))),J(`td`,null,...k(ee(e))),J(`td`,null,...k(O(e))),J(`td`,{class:`n`},String(Nf[e].price)))))]}function te(e){let t=(...e)=>J(`p`,null,...e),n=e=>J(`b`,null,e),i=(e,t)=>[J(`div`,{class:`cd-small cd-faint`},`Topics`),J(`h1`,{class:`cd-display`},e),J(`p`,{class:`lead`},...Array.isArray(t)?t:[t])];switch(e){case`start`:return[...i(`First steps`,`Each commission asks for goods. You build a farm that makes them by itself: fields grow crops, trucks carry them to machines on the routes you set, machines make products, and trucks take those to the depot.`),J(`ol`,{class:`how`},J(`li`,null,`Pick a building in the dock at the bottom. Point at its tile to see what it does; its page is here in the guide.`),J(`li`,null,n(`Click`),` to place it, or `,n(`drag`),` to place a row. The card over it says what it would do there, or why it doesn't fit.`),J(`li`,null,`Build a `,u(`garage`),`, buy a truck and give it a route through your buildings (see `,l(`Trucks and routes`,{kind:`topic`,id:`trucks`}),`). Power the garage and the machines with `,u(`solar`),` panels and `,u(`pylon`),`s.`),J(`li`,null,`Watch it run. A marker over a building means something is wrong: its shape and colour say what (see `,l(`Statuses and markers`,{kind:`topic`,id:`markers`}),`). Click the building for the details and its history.`),J(`li`,null,`The Ledger shows what is made, used and delivered a minute; the Power panel shows where the watts come from and go.`)),...r?.scenario.tips?.length?[J(`div`,{class:`cd-label sec`},`For ${r.scenario.name}`),J(`ol`,{class:`how`},...r.scenario.tips.map(e=>J(`li`,null,e)))]:[]];case`trucks`:return[...i(`Trucks and routes`,[`There are no belts and no roads to build: trucks carry every good, over the open ground between buildings, along the routes you give them. `,u(`silo`),`s store goods; trucks are bought at a `,u(`garage`),`.`]),J(`div`,{class:`cd-label sec`},`Routes`),t(`A route is a loop of up to ${q.maxStops} stops. At each stop its trucks `,n(`drop`),` some goods (only what the building takes) and `,n(`pick up`),` others; a good is dropped or picked up, never both. They drive stop 1, 2, … the last, then stop 1 again.`),J(`ul`,null,J(`li`,null,`Make one: open Routes, choose New route, then click buildings on the map, in order. Esc when done.`),J(`li`,null,`A new stop picks up everything the building makes and drops everything it takes: a field, then a mill, then the `,u(`depot`),` is a whole route. A silo stop drops everything; choose what to take from it.`),J(`li`,null,`At a stop a truck drops first, then picks up into the room left. It leaves when it has nothing more to do, or after waiting ${q.wait} s (you can change it) for room or goods.`),J(`li`,null,`More trucks make a route faster. Two routes picking up the same good share it by how often their trucks come.`),J(`li`,null,`The routes card shows each route's loop time and how often a truck reaches its slowest stop, measured from the last 10 minutes, and how much of the time each truck waited at stops.`),J(`li`,null,`A truck stuck with goods no stop takes can dump its cargo: the goods are lost.`)),J(`div`,{class:`cd-label sec`},`Next door`),t(`Buildings that share an edge trade without trucks: a machine takes what it uses from the buildings next door, a field takes compost. A `,u(`mill`),` between wheat fields grinds their wheat, a `,u(`coop`),` beside the mill eats its bran, a `,u(`bakery`),` beside both bakes their flour and eggs. Touching only at a corner doesn't count; `,u(`silo`),`s and the `,u(`depot`),` trade only with trucks.`),t(`A building takes from its neighbours before trucks load there, from whichever has the most. Selecting a building tints the neighbours it trades with, and placing one says who it would. Packed buildings leave trucks fewer open tiles, so keep a way in for the goods that still go by truck.`),J(`div`,{class:`cd-label sec`},`Roads and charging`),t(`Trucks drive on any open grass, the shortest way, and pass through each other. To load, a truck parks on an open tile next to the building: a building with none can't be reached. The Roads view shows the open ground. A building loads ${sy(ep(`silo`),`truck`)} at a time (the depot ${ep(`depot`)}); the others queue beside it.`),t(`A truck's battery holds ${q.battery} J, ${q.joulesPerTile} J a tile. When it would run short, it drives home to its garage and charges, from the garage's network. With no power there it goes on after ${q.giveUp} s, and crawls once empty.`),J(`div`,{class:`cd-label sec`},`Byproducts`),t(`A machine stops when an output has nowhere to go, so every byproduct needs a home: a `,u(`coop`),`, a `,u(`composter`),`, a `,u(`digester`),` or the depot. Trucks share their room, so a truck full of something no stop takes carries nothing else.`)];case`power`:return[...i(`Power`,`Machines, sprinklers and garages (to charge their trucks) need power. Power travels only through pylons.`),J(`ul`,null,J(`li`,null,`A building is powered when one of its tiles is within `,String(K.pylon.reach),` tiles of a `,u(`pylon`),`. Pylons within `,String(K.pylon.link),` tiles of each other link into one network.`),J(`li`,null,`Each network adds up what its generators make and what its machines want. Spare power charges its `,u(`battery`),` banks; a shortfall drains them.`),J(`li`,null,`If that isn't enough, every machine on the network slows to the share it gets.`),J(`li`,null,u(`solar`),` panels make nothing at night, and a `,u(`turbine`),` only makes power when there is wind. A `,u(`digester`),` is steady, but needs waste to burn.`)),t(`The readouts at the top show the power made and used across all networks, and the charge stored. The Power panel has the last day hour by hour, by source, each network, where the watts go, and how tonight's charge will go if use stays as it is. The Power view draws each network in its own colour.`)];case`soil`:return[...i(`Soil and water`,`Fields are where every chain starts, and how fast they grow depends on water and soil.`),J(`ul`,null,J(`li`,null,n(`Water:`),` a dry field grows at ×${Vf.dry} speed. A `,u(`sprinkler`),` waters fields whose centre is within `,String(K.sprinklerReach),` tiles.`),J(`li`,null,n(`Soil:`),` growth goes from ×${Vf.poorSoil} on soil 0 to ×${Vf.richSoil} on soil 100. The Soil view shows fertility everywhere.`),J(`li`,null,n(`Wearing out:`),` every harvest takes some soil (see the crops on the `,u(`field`),` page). Beans give some back.`),J(`li`,null,n(`Compost:`),` a field takes compost only while its soil is under ${Vf.compostBelow}, and spreads each one at once for +${Vf.compostGain} on every tile; above that, trucks carry it on to the next field. Make it in a `,u(`composter`),`.`),J(`li`,null,n(`Resting:`),` ground without a field slowly recovers (${Vf.rest*60} a minute), up to what it started at.`),J(`li`,null,n(`Soil health`),` is the fields' average fertility, nudged up or down (at most ${np.cap}) by trees planted or cleared. A soil goal checks it at the end.`),J(`li`,null,n(`Clearing:`),` a tree costs ${tp.tree} credits to remove and a rock ${tp.rock}. `,u(`sapling`),`s plant new trees.`))];case`markers`:return[...i(`Statuses and markers`,`A marker floats over any building that isn't working. Each has a shape as well as a colour; click the building for the details.`),vb(),t(`A building's inspector has its history: a ribbon of what it was doing over the last ${Iy.slice(0,-1).map(e=>e/60).join(`, `)} or ${Iy[Iy.length-1]/60} minutes, the share of time in each status, its output against full speed, and what it waited for most. Solar panels, turbines and batteries chart their power or charge instead.`)];case`keys`:return[...i(`Keys`,`Every key, and the mouse. Change the keys in Settings, on the level select and the pause screen.`),xb()]}}return h(),J(`div`,{class:`cd-card guide`},i,a)}var Mb=()=>[...Av.map(e=>[e.label,tb(e.id).join(` `)]).filter(([,e])=>e),[`Close a panel, pause`,`Esc`]];function Nb(e){let t=G[e];return e===`sprinkler`?`uses ${K.sprinklerNearWater} W near water, else ${K.sprinklerFar} W`:e===`garage`?`up to ${q.chargeRate} W for each truck charging`:t.power?`uses ${t.power} W while working`:e===`solar`?`makes up to ${K.solar} W in full sun`:e===`turbine`?`makes up to ${K.turbine} W`:e===`digester`?`makes ${K.digester} W while burning`:e===`battery`?`stores ${K.battery.capacity} J`:e===`pylon`?`carries it`:`none`}function Pb(e,t){let n=G[e],r=wb[e],i=qf(e),a=(e,t)=>J(`span`,{class:`cd-chip`},X(e,20),`${t} ${Eb(e)}`);return J(`div`,null,J(`div`,{class:`head`},X(e),J(`div`,null,J(`b`,{style:`font-size: 17px`},n.name),J(`div`,{class:`cd-small`},`${t?`${t} credits`:`free`} · ${n.size} × ${n.size} · power: ${Nb(e)}`))),J(`p`,null,r.what),...i.map(e=>J(`div`,{class:`recipe cd-small`},...e.inputs.flatMap((e,t)=>[t?`+`:``,`item`in e?a(e.item,e.n):J(`span`,{class:`cd-chip`},`${e.n} ${Rf[e.group].split(` (`)[0]}`)]),`→`,...e.outputs.length?e.outputs.flatMap((e,t)=>[t?`+`:``,a(e.item,e.n)]):[`${K.digester} W`],` ${e.time} s`)),J(`p`,{class:`cd-small`},r.how[0]))}function Fb(e,t){let n=G[t],r=Pg(e,t);return`${r?ty(r):`free`}${n.power?` · ${n.power} W`:``}`}var Ib=class{el=J(`div`,{class:`cd-card hud-dock`});category=Uf[0].id;key=``;tiles=new Map;host;constructor(e){this.host=e}synced=null;showCategoryOf(e){if(e===this.synced)return;this.synced=e;let t=e&&G[e].category;t&&t!==this.category&&(this.category=t,this.key=``)}update(){let e=this.host.state(),t=this.host.tool(),n=JSON.stringify([this.category,t.kind===`build`?[t.type,t.crop,t.recipe]:t.kind,Qy()]);if(n===this.key){for(let[t,n]of this.tiles)n.classList.toggle(`is-poor`,e.credits<Pg(e,t));return}this.key=n,this.tiles.clear(),this.host.tip(null);let r=J(`div`,{class:`cd-seg`},...Uf.map(e=>J(`button`,{class:e.id===this.category?`is-on`:``,onclick:()=>{this.category=e.id,this.key=``}},e.name))),i=Object.keys(G).filter(e=>G[e].category===this.category),a=null,o=i.map(n=>{let r=G[n],i=t.kind===`build`&&t.type===n,o=J(`button`,{class:`cd-tile${i?` is-on`:``}${e.credits<Pg(e,n)?` is-poor`:``}`,title:ib(r.name,...r.key?tb(`build:${n}`):[]),onclick:()=>{let e=this.host.tool();this.host.setTool(i?{kind:`select`}:{kind:`build`,type:n,rot:e.kind===`build`?e.rot:1})},onpointerenter:()=>this.host.tip(n),onpointerleave:()=>this.host.tip(null)},X(n),J(`span`,{class:`label`},r.name),J(`span`,{class:`cd-tile__cost`},Fb(e,n)));return this.tiles.set(n,o),i&&(a=o),o}),s=t.kind===`remove`,c=J(`button`,{class:`cd-tile is-remove${s?` is-on`:``}`,title:ib(`Remove: buildings refund in full; trees and rock cost to clear`,...tb(`remove`)),onclick:()=>this.host.setTool(s?{kind:`select`}:{kind:`remove`})},X(`trash`),J(`span`,{class:`label`},`Remove`),J(`span`,{class:`cd-tile__cost`},`full refund`));this.el.replaceChildren(J(`div`,{class:`tiles`},...o,J(`span`,{class:`sep`}),c),J(`div`,{class:`tabs`},r)),t.kind===`build`&&a&&this.strip(t,a)}strip(e,t){let n=Lg(e.type);if(!n.length)return;let r=tb(`choice`),i=n.map(t=>{let n=t.recipe?Jf(t.recipe):null,i=n?.outputs[0].item,a=t.crop?Bf[t.crop].name:i?ay(i).replace(/^./,e=>e.toUpperCase()):``,o=t.crop?e.crop===t.crop:e.recipe===t.recipe,s=t.crop?`${Bf[t.crop].grow} s · ${Bf[t.crop].yield} a harvest`:(n?.inputs??[]).map(e=>`item`in e?ay(e.item):``).join(` + `);return J(`button`,{class:o?`is-on`:``,title:ib(`${a}: ${s}`,...r.map(e=>`${e}, Shift+${e} to change`)),onclick:()=>this.host.choose(t)},X(t.crop??i??`check`,18),J(`span`,null,a))}),a=J(`i`,{class:`pointer`}),o=J(`div`,{class:`cd-card hud-strip`},J(`div`,{class:`cd-seg`},...i),a);this.el.append(o),o.style.top=`${t.offsetTop-o.offsetHeight-22}px`;let s=t.offsetLeft+t.offsetWidth/2,c=o.offsetWidth,l=Math.max(0,Math.min(s-c/2,this.el.offsetWidth-c));o.style.left=`${l}px`,a.style.left=`${s-l}px`}};function Lb(e,t){return J(`div`,{class:`cd-card hud-tip`},Pb(t,Pg(e,t)))}var Rb={c1:{from:`Tomas Reed`,role:`Miller, Brightwater`,place:`The mill house, Brightwater`,day:`Saturday`,greeting:`Dear friends at the co-op,`,body:[`The old mill wheel gave out in the spring floods, and Brightwater has been buying its flour from the coast ever since. It comes late, it comes dear, and it tastes of the cart.`,`We would like grain of our own again: a hundred and twenty measures of wheat, and eighty of flour, brought to the depot. That would see the village through to the next harvest.`,`I am told your valley has good dark soil by the river. I hope it treats you kindly.`],signoff:`With thanks, and every good wish,`,asks:`What he asks`},c2:{from:`Ada Thorne`,role:`Schoolmistress`,place:`The schoolhouse, Loam Valley`,day:`Monday`,greeting:`Dear friends at the co-op,`,body:[`The schoolhouse opens again next week, and a great many of my pupils arrive with nothing in their stomachs. I would like each of them to start the day with fresh bread. One hundred and fifty loaves, delivered to the depot, would see us through the term.`,`I am told the chickens will want feeding, and that the mill makes bran along with its flour. I leave the how of it to you.`,`One thing more. The children will farm this valley after us. Please leave the soil in good heart.`],signoff:`With thanks, and warm regards,`,asks:`What she asks`},c3:{from:`Marta Vell`,role:`Cook, the Ridge co-op`,place:`The long kitchen, Windy Ridge`,day:`Thursday`,greeting:`To whoever reads this at the co-op,`,body:[`Up here we cook everything in sunflower oil, and we have run out. Ninety flasks would fill the larder, and eighty loaves would fill the people who eat at my tables.`,`You will find the sun thin on the ridge, and the rock close under the grass. But the wind has not stopped blowing since my grandmother's day, and I do not expect it to start now.`],signoff:`Yours, with an empty pan,`,asks:`What she asks`},c4:{from:`Ines Hollin`,role:`Master weaver`,place:`The weaving hall, Hollin`,day:`Tuesday`,greeting:`Dear co-op,`,body:[`Hollin has woven linen for three hundred years, and our looms have never stood so quiet. We need fifty bolts of linen for the summer fair.`,`More than that, we need yarn that keeps coming: five skeins a minute, steady, so the young weavers can learn on it without waiting. A loom that waits forgets its rhythm.`],signoff:`In hope, and with the thanks of the hall,`,asks:`What she asks`},c5:{from:`Old Benna`,role:`Keeper of the midwinter fair`,place:`The green, Longnight`,day:`the first frost`,greeting:`Dear ones,`,body:[`The nights are drawing in. By the fair the sun will barely clear the hills, and folk need something sweet to see them through the dark.`,`Sixty honey cakes, if you please. The bees grow sleepy as the days shorten, and so do the panels on your roofs. Mind the lamps.`],signoff:`Warmly, from the fireside,`,asks:`What she asks`},c6:{from:`Jonah Fairweather`,role:`Cannery foreman`,place:`Stillwater cannery`,day:`Wednesday`,greeting:`To the co-op,`,body:[`This valley grew one crop for twenty years until it would grow nothing much at all. The families who farmed it moved to the cannery town, and the cannery needs sauce: fifty jars.`,`But they would like to go home one day. If you can leave the ground healthier than you found it, at fifty-five or better, I will make sure they hear it was you.`],signoff:`Respectfully,`,asks:`What he asks`},c7:{from:`The three reeves`,role:`Upriver, Midford and Rushmouth`,place:`Midford landing`,day:`market day`,greeting:`Friends,`,body:[`Three villages, one river, and for once we agree on something: we all want our orders filled, and soon. Upriver wants thirty bolts of linen, Midford thirty jars of sauce, Rushmouth eighty loaves.`,`The land is narrow between the water and the woods. We are sorry for that; it was narrow when we got here too.`],signoff:`Yours, in rare agreement,`,asks:`What they ask`},c8:{from:`Wren Ashdown`,role:`For the festival committee`,place:`The festival field`,day:`midsummer eve`,greeting:`Dear co-op,`,body:[`Every village in the valley is coming to the harvest festival, and every one of them is bringing an appetite. We need forty honey cakes, thirty jars of sauce and thirty bolts of linen for the prize tables.`,`And this year the committee has voted that the festival should stand on healthy ground. Soil at sixty or better when the lanterns go up.`,`Everything, at once. We know. We believe in you.`],signoff:`With love, and a great deal of bunting,`,asks:`What they ask`}};function zb(e){let t=Rb[e.id];if(t)return t;if(e.sandbox)return{from:`The valley`,role:``,place:`A big calm valley`,day:`any day`,greeting:`Welcome,`,body:[`No one is waiting on an order here. The credits do not run out and nothing is asked of you. Build what you like, and see how it runs.`],signoff:``,asks:`What it asks`};let n=e.goals.map(Ny),r=n.length>1?`${n.slice(0,-1).join(`, `)} and ${n[n.length-1]}`:n[0];return{from:`The people of ${e.name}`,role:``,place:e.name,day:`this week`,greeting:`Dear co-op,`,body:[`${e.name} has sent word: they would like ${r}.`,`They leave the how of it to you.`],signoff:`With thanks,`,asks:`What they ask`}}function Bb(e,t,n){let r=e.scenario,i=zb(r),a=p_.findIndex(e=>e.id===r.id);return J(`div`,{class:`cd-sheet briefing`},J(`div`,{class:`letter`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`},r.sandbox?`The sandbox`:a>=0?`Commission ${a+1} of ${p_.length} · a letter for the co-op`:`A random commission · a letter for the co-op`),J(`span`,{class:`cd-small cd-faint`},`${i.place} · ${i.day}`)),J(`h1`,{class:`cd-display`},r.name),r.tags.length?J(`div`,{class:`chips tags`},...r.tags.map(e=>J(`span`,{class:`tag cd-small`},e))):null,J(`div`,{class:`words`},J(`p`,null,i.greeting),...i.body.map(e=>J(`p`,null,e))),i.signoff?J(`div`,{class:`sign`},J(`div`,{class:`cd-small`},i.signoff),J(`div`,{class:`name`},i.from),i.role?J(`div`,{class:`cd-small`},i.role):null):null),J(`div`,{class:`terms`},J(`div`,{class:`cd-label`},r.goals.length?i.asks:`No goals`),r.goals.length?J(`div`,{class:`asks`},...r.goals.map(e=>J(`div`,null,Cy({v:0,d:r.goals.length>2?118:160,w:10,col:e.kind===`soil`?`var(--tide)`:void 0,inner:[X(jy(e),36),J(`div`,{class:`cd-figure`},e.kind===`deliver`?`0`:e.kind===`rate`?`${e.perMin}`:`${e.min}+`),J(`div`,{class:`cd-small`},e.kind===`deliver`?`of ${e.n}`:e.kind===`rate`?`a minute`:`at the end`)]}),J(`b`,null,Py(e))))):J(`p`,{class:`cd-small`},`Unlimited credits. Build whatever you like.`),r.sandbox?null:J(`div`,{class:`cd-label`,style:`margin-top: 36px`},`Medal times`),r.sandbox?null:J(`div`,null,J(`div`,{class:`mrow`},Ay(`gold`,34),J(`span`,null,`Gold`),J(`b`,null,`within ${Q(r.par)}`)),J(`div`,{class:`mrow`},Ay(`silver`,34),J(`span`,null,`Silver`),J(`b`,null,`within ${Q(r.par*l_)}`)),J(`div`,{class:`mrow`},Ay(`bronze`,34),J(`span`,null,`Bronze`),J(`b`,{class:`cd-soft`},`after`))),r.sandbox?null:J(`div`,{class:`cd-label`,style:`margin-top: 26px`},`To start`),r.sandbox?null:J(`div`,{class:`mrow`},X(`coin`,34),J(`span`,null,`Credits`),J(`b`,null,ty(r.credits))),J(`span`,{class:`fill`}),J(`div`,{class:`buttons`},J(`button`,{class:`cd-btn is-primary is-lg`,onclick:t},`Begin`),J(`button`,{class:`cd-btn is-ghost is-lg`,onclick:n},X(`book`,22),`Read the guide`))))}var Vb=new Xr(1,1,1),Hb=new Map,Ub=new Ea(1,1),Wb=new Map,Gb=(e,t,n,r,i,a,o,s,c=Zu.NORMAL)=>e.add(Vb,od(t,n+a/2,r,0,0,0,i,a,o),ed(s),c),Kb=(e,t)=>{let n=Math.sin(e*127.1+t*311.7)*43758.5453;return n-Math.floor(n)},qb=class{c;animated;constructor(e=!1){this.animated=e,this.c=new cd(e)}add(e,t,n,r,i,a=!0){this.c.add(e,t,ed(n),r,a,this.animated?i:void 0)}box(e,t,n,r,i,a,o,s={}){return this.add(Vb,od(e,t+i/2,n,s.rx??0,s.ry??0,s.rz??0,r,i,a),o,s.flag??Zu.NORMAL,s.mo,!1),this}boxAt(e,t,n,r,i,a,o,s={}){return this.add(Vb,od(e,t,n,s.rx??0,s.ry??0,s.rz??0,r,i,a),o,s.flag??Zu.NORMAL,s.mo,!1),this}cyl(e,t,n,r,i,a,o={}){let s=o.seg??8,c=s*1e3+Math.round((o.top??1)*100),l=Hb.get(c);l||(l=new Ca(o.top??1,1,1,s),Hb.set(c,l));let u=od(e,t+i/2,n,o.rx??0,0,o.rz??0,r,i,r);return(o.rx||o.rz)&&u.copy(od(e,t,n,o.rx??0,0,o.rz??0).multiply(od(0,i/2,0,0,0,0,r,i,r))),this.add(l,u,a,o.flag??Zu.NORMAL,o.mo),this}cone(e,t,n,r,i,a,o={}){let s=o.seg??8,c=Wb.get(s);return c||(c=new wa(1,1,s),Wb.set(s,c)),this.add(c,od(e,t+i/2,n,0,0,0,r,i,r),a,o.flag??Zu.NORMAL),this}ball(e,t,n,r,i,a={}){return this.add(Ub,od(e,t,n,0,0,0,r,r*(a.sy??1),r),i,a.flag??Zu.NORMAL,a.mo),this}smoke(e,t,n,r,i=4,a=15526128){if(!this.animated)return this;let o=new Ea(.16,1);for(let s=0;s<i;s++)this.c.add(o,null,ed(a),Zu.STEAM,!1,hf.smoke([e,t,n],s/i,r+s*.17));return this}build(){return this.c.build()}},$={timber:10517072,dark:6966324,plank:12096094,ceramic:15656662,cream:14734520,copper:13138506,brass:14198858,solar:2903168,solarLight:4879536,glass:10146008,moss:6986312,leaf:5212730,leafLight:8040528,terracotta:13135946,slate:4940912,stone:9079940,stoneLight:11578008,soil:6965808,glow:16766603,fire:16751673,red:13126202,white:16184042},Jb={y:.27,scale:.55,slots:[[-.1,-.08],[.1,-.08],[-.1,-.2],[.1,-.2],[-.1,-.32],[.1,-.32]]};function Yb(e,t,n,r,i,a){e.box(t,n,r,i,.08,a,$.dark).box(t,n+.08,r,i-.08,.08,a-.08,$.moss)}function Xb(e,t,n,r=0){e.box(t,r,n,.3,.18,.3,$.terracotta).ball(t,r+.28,n,.18,$.leafLight)}var Zb={field:e=>{for(let t of[-1,0,1])for(let n of[-1,0,1])e.box(t,-.05,n,.98,.08,.98,9071174).box(t,.03,n,.3,.12,.3,$.leafLight)},silo:e=>{e.box(0,0,0,1.9,.14,1.9,$.stoneLight).cyl(-.35,.14,-.35,.5,1.7,$.ceramic,{seg:12}).cyl(-.35,.6,-.35,.53,.08,$.copper,{seg:12}).cyl(-.35,1.25,-.35,.53,.08,$.copper,{seg:12}).cone(-.35,1.84,-.35,.58,.5,$.moss,{seg:12}).cyl(-.35,2.3,-.35,.05,.2,$.brass,{seg:6}).box(.15,.9,-.35,.3,.14,.14,$.copper).cyl(.45,.14,.45,.4,1,$.ceramic,{seg:10}).cyl(.45,.5,.45,.42,.06,$.copper,{seg:10}).cone(.45,1.14,.45,.45,.35,$.moss,{seg:10}),Xb(e,.62,-.75,.14)},garage:e=>{e.box(0,0,0,1.94,.08,1.94,$.stoneLight).box(0,.08,-.9,1.8,1.05,.12,$.plank);for(let t of[-.9,.9])e.box(t,.08,-.15,.1,1.05,1.4,$.timber);for(let t of[-.9,.9])e.box(t,.08,.82,.12,1.05,.12,$.timber);e.box(0,1.13,0,2,.08,1.98,$.dark).box(0,1.21,-.45,1.9,.08,1,$.moss).box(0,1.21,.48,1.8,.05,.86,$.solar).box(0,1.25,.48,.04,.02,.86,$.solarLight),e.box(.6,.08,-.6,.16,.6,.16,$.copper).box(.6,.5,-.51,.1,.08,.02,$.glow,{flag:Zu.EMISSIVE}).box(0,.08,-.2,.06,.01,1,$.cream),Xb(e,-.72,.75,.08)},sprinkler:e=>{e.box(0,0,0,.36,.08,.36,$.stone).cyl(0,.08,0,.05,.55,$.copper,{seg:6}).box(0,.63,0,.6,.05,.06,$.brass,{mo:hf.spin([0,.65,0],[0,1,0],3)}).cyl(0,.6,0,.08,.1,$.copper,{seg:6})},hive:e=>{for(let[t,n]of[[-.22,-.18],[.22,-.18],[-.22,.18],[.22,.18]])e.box(t,0,n,.06,.3,.06,$.dark);e.box(0,.3,0,.56,.2,.46,$.white).box(0,.5,0,.56,.2,.46,$.brass).box(0,.7,0,.6,.06,.5,$.terracotta).box(0,.33,.23,.18,.04,.02,$.dark);for(let[t,n,r]of[[.4,.35,15224954],[-.38,.38,15781968],[.38,-.38,10514656]])e.box(t,0,n,.08,.25,.08,$.leaf).ball(t,.3,n,.08,r)},composter:e=>{for(let t of[-.5,.5]){for(let n=0;n<4;n++)e.box(t,n*.2,-.65,.86,.14,.08,$.plank).box(t,n*.2,.65,.86,.14,.08,$.plank);e.box(t-.43,0,0,.08,.8,1.38,$.timber).box(t+.43,0,0,.08,.8,1.38,$.timber).box(t,0,0,.8,.62,1.2,$.soil)}e.ball(-.5,.62,0,.3,5913124,{sy:.5}).ball(.5,.62,.1,.25,$.leafLight,{sy:.5})},mill:e=>{e.box(0,0,0,1.7,.2,1.7,$.stoneLight).box(0,.2,0,1.3,1,1.3,$.ceramic).box(0,.2,.66,.4,.6,.02,$.dark),Yb(e,0,1.2,0,1.5,1.5),e.cone(.2,1.36,-.2,.42,.55,$.copper,{seg:8}).box(.2,1.9,-.2,.5,.12,.5,$.brass),e.cyl(-.7,.55,.2,.38,.1,$.timber,{seg:10,rz:Math.PI/2,mo:hf.spin([-.75,.55,.2],[1,0,0],2.4)}),e.box(.4,.6,.66,.3,.26,.04,$.glow,{flag:Zu.EMISSIVE}),Xb(e,.7,.75,.2)},press:e=>{e.box(0,0,0,1.7,.18,1.7,$.stoneLight).box(-.3,.18,0,.9,.7,1.1,$.timber).box(-.3,.88,0,1,.1,1.2,$.dark).cyl(-.3,.98,0,.08,.4,$.copper,{seg:6}).cyl(-.3,1.38,0,.42,.06,$.brass,{seg:8,mo:hf.spin([-.3,1.4,0],[0,1,0],1.5)}).cyl(.5,.18,.35,.22,.45,15253568,{seg:8}).cyl(.5,.63,.35,.12,.1,$.dark,{seg:6}).box(.5,.18,-.4,.4,.3,.4,$.plank),Xb(e,.65,-.05,.18)},spinner:e=>{e.box(0,0,0,1.7,.16,1.7,$.stoneLight).box(-.55,.16,0,.12,.9,.12,$.timber).box(.55,.16,0,.12,.9,.12,$.timber).box(0,.16,-.4,1.4,.12,.5,$.plank).cyl(0,.9,0,.5,.08,$.timber,{seg:12,rz:Math.PI/2,mo:hf.spin([0,.9,0],[1,0,0],3)}).box(0,.86,0,1.2,.08,.08,$.dark);for(let t of[-.4,-.15,.1,.35])e.cyl(t,.28,-.4,.07,.3,14209256,{seg:6});Xb(e,.6,.6,.16)},loom:e=>{e.box(0,0,0,1.7,.16,1.7,$.stoneLight);for(let t of[-.7,.7])e.box(t,.16,-.5,.1,1.3,.1,$.timber).box(t,.16,.5,.1,1.3,.1,$.timber).box(t,1.4,0,.1,.1,1.1,$.timber);e.box(0,1.4,-.5,1.5,.1,.1,$.dark).box(0,.6,0,1.3,.06,.9,15525072).box(0,.5,.5,1.4,.1,.12,$.dark).box(0,.9,0,1.3,.12,.08,$.copper,{mo:hf.swing([0,1.4,0],[1,0,0],.35)}),Xb(e,.65,.7,.16)},bakery:e=>{e.box(0,0,0,1.7,.18,1.7,$.stoneLight).box(0,.18,0,1.4,.9,1.3,$.terracotta).ball(0,1.08,0,.66,$.terracotta,{sy:.6}).box(0,.3,.62,.55,.45,.1,$.dark).box(0,.32,.66,.42,.32,.04,$.fire,{flag:Zu.EMISSIVE}).box(.45,1,-.35,.26,.9,.26,$.stone).box(.45,1.9,-.35,.32,.08,.32,$.dark),Yb(e,-.3,1.45,0,.6,.6),e.smoke(.45,2,-.35,.7)},cannery:e=>{e.box(0,0,0,1.7,.18,1.7,$.stoneLight).cyl(-.3,.18,-.15,.55,.75,$.copper,{seg:10}).ball(-.3,.93,-.15,.55,$.copper,{sy:.45}).cyl(-.3,1.1,-.15,.06,.4,$.brass,{seg:6}).box(.55,.18,.2,.5,.7,.9,$.timber);for(let t of[-.1,.15,.4])for(let n of[.3,.6])e.cyl(.55,n+.1,t,.08,.16,$.red,{seg:6});e.smoke(-.3,1.5,-.15,.4,3)},solar:e=>{e.box(0,0,0,1.9,.06,1.9,$.moss);for(let t of[-.8,.8])e.box(t,0,-.5,.1,.5,.1,$.timber).box(t,0,.5,.1,.9,.1,$.timber);e.boxAt(0,.75,0,1.86,.06,1.5,$.dark,{rx:-.42}).boxAt(0,.79,0,1.76,.04,1.4,$.solar,{rx:-.42}).boxAt(0,.81,0,.04,.02,1.4,$.solarLight,{rx:-.42}).boxAt(0,.81,0,1.76,.02,.04,$.solarLight,{rx:-.42})},turbine:e=>{e.box(0,0,0,.6,.12,.6,$.stone).cyl(0,.12,0,.12,3,$.white,{seg:8,top:.6}).box(0,3.05,-.05,.22,.22,.5,$.white).cone(0,3.05,.25,.09,.15,$.copper);let t=[0,3.16,.24];for(let n=0;n<3;n++){let r=n*Math.PI*2/3;e.boxAt(Math.sin(r)*.55,3.16+Math.cos(r)*.55,.24,.1,1.1,.03,$.white,{rz:-r,mo:hf.spin(t,[0,0,1],2.2)})}},battery:e=>{e.box(0,0,0,1.8,.12,1.8,$.stoneLight).box(0,.12,0,1.5,.9,1.1,$.ceramic).box(0,1.02,0,1.6,.1,1.2,$.copper).box(-.4,.3,.56,.4,.5,.02,$.glass,{flag:Zu.EMISSIVE}).box(.4,.3,.56,.4,.5,.02,$.glass,{flag:Zu.EMISSIVE});for(let t of[-.7,.7])e.box(t,.12,0,.06,.9,1.14,$.copper);Yb(e,0,1.12,0,1,.8)},digester:e=>{e.box(0,0,0,1.8,.14,1.8,$.stoneLight).cyl(0,.14,0,.78,.5,$.cream,{seg:12}).ball(0,.64,0,.78,$.moss,{sy:.7}).cyl(.6,.5,.55,.05,.9,$.copper,{seg:6}).cyl(.6,1.4,.55,.09,.08,$.brass,{seg:6}).box(-.4,.14,.72,.36,.36,.1,$.dark),e.smoke(.6,1.5,.55,.2,3,14212304)},pylon:e=>{e.box(0,0,0,.3,.1,.3,$.stone).cyl(0,.1,0,.07,1.9,$.timber,{seg:6}).box(0,1.75,0,.6,.06,.08,$.dark).cyl(-.26,1.81,0,.05,.1,$.copper,{seg:6}).cyl(.26,1.81,0,.05,.1,$.copper,{seg:6}).box(0,2,0,.18,.08,.18,$.solar).box(0,1.92,0,.1,.08,.1,$.glow,{flag:Zu.EMISSIVE})},sapling:e=>{e.box(0,0,0,.3,.04,.3,$.soil).cyl(0,0,0,.03,.55,$.dark,{seg:5}).ball(0,.6,0,.18,$.leafLight).ball(.08,.45,.05,.12,$.leaf)},depot:e=>{e.box(0,0,0,2.9,.3,2.9,$.stoneLight).box(0,.3,-.7,2.6,.9,1.2,$.timber).box(0,.3,-.7,2.4,.7,1.24,$.plank),Yb(e,0,1.2,-.7,2.8,1.5);for(let t of[-1.2,1.2])e.box(t,.3,.8,.12,1.8,.12,$.timber);e.box(0,2.1,.8,2.6,.12,.3,$.dark).box(0,2.22,.8,1.2,.24,.06,$.cream);for(let[t,n]of[[-.8,.4],[-.4,.5],[.7,.3]])e.box(t,.3,n,.36,.3,.36,$.plank);e.box(1,.3,.9,.3,.3,.3,$.plank).cyl(-.4,.6,.5,.12,.2,$.red,{seg:6}),e.box(.3,.42,-.08,.5,.36,.04,$.glow,{flag:Zu.EMISSIVE})}};function Qb(e){let t=Zb[e]??(e=>e.box(0,0,0,.8,.8,.8,$.red)),n=new qb(!1),r=new qb(!0);return t(n),t(r),{idle:n.build(),running:r.build()}}var $b={wheat:(e,t,n)=>{for(let r=0;r<5;r++){let i=-.3+r%3*.3,a=-.25+Math.floor(r/3)*.4,o=.15+.17*t;e.box(i,0,a,.06,o,.06,t===n-1?13148224:$.leafLight,{mo:hf.sway(i,a,0,.6)}),t>=2&&e.box(i,o,a,.1,.16,.1,t===n-1?14860890:12107872,{mo:hf.sway(i,a,0,.6)})}},beans:(e,t,n)=>{e.box(0,0,0,.05,.25+.2*t,.05,$.dark);for(let n=0;n<=t;n++)e.ball(.05*(n%2?1:-1),.15+.18*n,0,.14,$.leaf,{mo:hf.sway(0,0,0,.8)});if(t===n-1)for(let[t,n]of[[.12,.3],[-.1,.5],[.1,.6]])e.box(t,n,.08,.05,.16,.05,6986298)},tomato:(e,t,n)=>{if(e.ball(0,.12+.1*t,0,.18+.06*t,$.leaf,{sy:1.2,mo:hf.sway(0,0,0,.6)}),t>=2)for(let[r,i,a]of[[.15,.25,.12],[-.14,.32,.1],[.05,.4,-.15]])e.ball(r,i+.05*t,a,.07,t===n-1?14700602:10141776)},sunflower:(e,t,n)=>{let r=.25+.3*t;e.box(0,0,0,.06,r,.06,$.leaf,{mo:hf.sway(0,0,0,r)}).ball(.08,r*.5,0,.1,$.leafLight,{sy:.4}),t>=2&&e.boxAt(0,r+.05,.05,.36,.36,.06,t===n-1?15910458:11059280,{rx:.5,mo:hf.sway(0,0,0,r)}).boxAt(0,r+.05,.09,.16,.16,.04,6965802,{rx:.5,mo:hf.sway(0,0,0,r)})},flax:(e,t,n)=>{for(let r=0;r<6;r++){let i=-.3+r%3*.3,a=-.2+Math.floor(r/3)*.4,o=.12+.14*t;e.box(i,0,a,.04,o,.04,8036432,{mo:hf.sway(i,a,0,.5)}),t===n-1&&e.ball(i,o+.03,a,.06,9087208,{mo:hf.sway(i,a,0,.5)})}}};function ex(e,t,n){let r=new qb(!0);return $b[e](r,t,n),r.build()}function tx(e){let t=new qb(!1),n=Nf[e].colour;switch(e){case`egg`:t.ball(0,.1,0,.09,n,{sy:1.25});break;case`tomato`:case`honey`:t.ball(0,.1,0,.1,n);break;case`oil`:case`sauce`:t.cyl(0,0,0,.09,.2,n,{seg:6}).cyl(0,.2,0,.05,.05,$.dark,{seg:6});break;case`bread`:t.ball(0,.08,0,.14,n,{sy:.6});break;case`honeycake`:t.cyl(0,0,0,.13,.12,n,{seg:8}).cyl(0,.12,0,.13,.03,16312520,{seg:8});break;case`linen`:case`yarn`:t.cyl(0,0,0,.1,.16,n,{seg:8});break;case`wheat`:case`flax`:t.box(0,0,0,.12,.22,.12,n);break;case`manure`:case`compost`:t.ball(0,.06,0,.12,n,{sy:.5});break;default:t.box(0,0,0,.18,.16,.18,n)}return t.build()}function nx(e,t,n=.06){let r=new qb(!1),i=e/2-n/2;for(let[a,o,s,c]of[[0,-i,e,n],[0,i,e,n],[-i,0,n,e-2*n],[i,0,n,e-2*n]])r.box(a,0,o,s,.02,c,t,{flag:Zu.EMISSIVE});return r.build()}var rx=[15911244,6280168,15895224,11067491,11902197,16097626],ix=14221232,ax=[16769162,9099519,16754896,12120202,13676799,16758912];function ox(e){let t=new qb(!1);return t.boxAt(.5,0,0,1,1,1,e,{flag:Zu.EMISSIVE}),t.build()}function sx(e){let t=new qb(!1);return t.box(0,0,0,.84,.015,.84,e,{flag:Zu.DECOR}),t.build()}function cx(){let e=new qb(!1);for(let[t,n]of[[-.2,.22],[.2,.22],[-.2,-.24],[.2,-.24]])e.cyl(t,.09,n,.09,.07,$.dark,{seg:8,rz:Math.PI/2});e.box(0,.08,0,.42,.08,.86,$.slate).box(0,.16,.24,.42,.24,.32,$.ceramic).box(0,.4,.2,.38,.06,.26,$.solar).box(0,.25,.405,.32,.1,.02,$.glass,{flag:Zu.EMISSIVE}).box(0,.16,.41,.36,.05,.02,$.copper).box(-.14,.2,.415,.06,.04,.02,$.glow,{flag:Zu.EMISSIVE}).box(.14,.2,.415,.06,.04,.02,$.glow,{flag:Zu.EMISSIVE}).box(0,.16,-.2,.42,Jb.y-.16,.46,$.plank);for(let t of[-.2,.2])e.box(t,Jb.y,-.2,.03,.07,.46,$.timber);return e.box(0,Jb.y,-.415,.42,.07,.03,$.timber).box(0,Jb.y,.02,.42,.09,.03,$.timber),e.build()}function lx(e){let t=new qb(!1),n=[[[0,.18,0,.36],[.22,.1,.18,.2]],[[0,.22,.05,.42],[-.24,.12,-.2,.22],[.25,.08,-.15,.16]],[[.05,.14,0,.3],[-.2,.1,.2,.18]]][e%3];for(let[r,i,a,o]of n)t.ball(r,i,a,o,e%2?$.stone:$.stoneLight,{sy:.75});return t.ball(.15,.03,.3,.12,$.moss,{sy:.3}),t.build()}var ux=[12098154,10518616,9071174,7558712,6177836,4863010],dx=e=>Math.min(5,Math.floor(e/(100/6)));function fx(e){let t=new qb(!1);t.box(0,-.05,0,.98,.08,.98,ux[e]);for(let n of[-.3,0,.3])t.box(0,.03,n,.9,.015,.08,ux[Math.max(0,e-1)]);return t.build()}var px=.07,mx=.05,hx=.35,gx=.045,_x=.08,vx=.1,yx=.8,bx=.55,xx=rx.length,Sx=rx.map(e=>new U(e)),Cx=new U(14221232),wx=new V(1,0,0),Tx=new V,Ex=new _t,Dx=new V,Ox=(e,t)=>$h(e).list.indexOf(t)%rx.length,kx=e=>G[e.type].grid===`link`||Xh(e),Ax=class{objs=[];key=``;shownLabels=[];r;m;constructor(e,t){this.r=e,this.m=t}labels(){return this.shownLabels}sync(e,t){let n=t.focus===null?null:am(e,t.focus),r=n&&kx(n)?G[n.type].grid===`link`?$h(e).of.get(n.id)??null:eg(e,n):null,i=`${Qp(e)} ${t.all} ${t.tiles} ${n&&kx(n)?n.id:``} ${t.ghosts.map(e=>`${e.x},${e.y},${e.ok}`).join(`;`)}`;if(i===this.key)return;this.key=i;for(let e of this.objs)e.remove();this.objs=[],this.shownLabels=[];let a=$h(e).list,o=t.all?a:r?[r]:[];t.tiles&&this.reachTiles(e,t.ghosts);let s=this.m.buildings.pylon.height-vx;for(let t of o){let n=Ox(e,t);for(let[e,r]of rg(t))this.wire(n,e.x+.5,e.y+.5,r.x+.5,r.y+.5,s);for(let r of t.members){let t=ng(e,r);t&&this.feed(n,t.x+.5,t.y+.5,s,r)}let r=t.pylons.reduce((e,t)=>({x:e.x+t.x+.5,z:e.z+t.y+.5}),{x:0,z:0});this.shownLabels.push({x:r.x/t.pylons.length,y:s+.9,z:r.z/t.pylons.length,colour:rx[n],net:t})}n&&G[n.type].grid===`link`&&r&&this.ranges(Ox(e,r),n.x,n.y),this.ghostLinks(e,t.ghosts,s)}reachTiles(e,t){let{width:n,height:r}=e.map,i=K.pylon.reach,a=new Map,o=$h(e).of;for(let t of e.buildings){if(G[t.type].grid!==`link`)continue;let s=Sx[Ox(e,yp(o.get(t.id),`network`))];for(let e=t.y-i;e<=t.y+i;e++)for(let o=t.x-i;o<=t.x+i;o++)o>=0&&e>=0&&o<n&&e<r&&!a.has(e*n+o)&&a.set(e*n+o,s)}for(let e of t)if(e.ok)for(let t=e.y-i;t<=e.y+i;t++)for(let o=e.x-i;o<=e.x+i;o++)o>=0&&t>=0&&o<n&&t<r&&!a.has(t*n+o)&&a.set(t*n+o,Cx);for(let[e,t]of a){let r=this.r.addObject(this.m.fill);r.tint=t,r.tintStrength=yx,r.castShadow=!1,r.setTransform(new V(e%n+.5,.02,Math.floor(e/n)+.5)),this.objs.push(r)}}bar(e,t,n,r,i=r,a=1){let o=Tx.subVectors(n,t).length();if(o<1e-4)return;Ex.setFromUnitVectors(wx,Tx.divideScalar(o));let s=this.r.addObject(this.m.wires[e]);s.castShadow=!1,s.snap=!1,s.opacity=a,s.setTransform(t,Ex,Dx.set(o,i,r)),this.objs.push(s)}wire(e,t,n,r,i,a){let o=Math.min(hx,Math.hypot(r-t,i-n)*mx),s=e=>new V(t+(r-t)*e,a-o*4*e*(1-e),n+(i-n)*e);for(let t=0;t<4;t++)this.bar(e,s(t/4),s((t+1)/4),px)}feed(e,t,n,r,i){let a=Yp(i),o=Math.min(this.m.buildings[i.type].height*.7,1.4);this.bar(e,new V(t,r,n),new V(i.x+a/2,o,i.y+a/2),gx,gx,bx)}ranges(e,t,n){let r=K.pylon.reach,i=.05,a=[[t-r,n-r],[t+r+1,n-r],[t+r+1,n+r+1],[t-r,n+r+1]];for(let t=0;t<4;t++){let[n,r]=a[t],[o,s]=a[(t+1)%4];this.bar(e,new V(n,i,r),new V(o,i,s),_x,.02)}let o=t+.5,s=n+.5,c=K.pylon.link;for(let t=0;t<56;t+=2){let n=t/56*Math.PI*2,r=(t+1)/56*Math.PI*2;this.bar(e,new V(o+Math.cos(n)*c,i,s+Math.sin(n)*c),new V(o+Math.cos(r)*c,i,s+Math.sin(r)*c),_x,.02)}}ghostLinks(e,t,n){let r=t.filter(e=>e.ok),i=new Set;r.forEach((t,a)=>{for(let r of ig(e,t.x,t.y))this.wire(xx,t.x+.5,t.y+.5,r.x+.5,r.y+.5,n);let o=r[a-1];o&&Ym(o.x,o.y,t.x,t.y)&&this.wire(xx,o.x+.5,o.y+.5,t.x+.5,t.y+.5,n);for(let r of e.buildings)Xh(r)&&!i.has(r.id)&&!eg(e,r)&&Jm(r,t.x,t.y)&&(i.add(r.id),this.feed(xx,t.x+.5,t.y+.5,n,r))});let a=t[t.length-1];a&&this.ranges(xx,a.x,a.y)}},jx=.12,Mx=.05,Nx=.004,Px=new V(1,0,0),Fx=new V,Ix=new _t,Lx=new V,Rx=(e,t)=>Math.max(0,e.routes.indexOf(t))%ax.length,zx=class{objs=[];key=``;shownLabels=[];r;m;constructor(e,t){this.r=e,this.m=t}labels(){return this.shownLabels}sync(e,t,n){let r=`${Qp(e)} ${n} ${t.map(t=>`${t.id}:${Rx(e,t)}:${t.stops.map(e=>e.building).join(`,`)}`).join(`;`)}`;if(r===this.key)return;this.key=r;for(let e of this.objs)e.remove();this.objs=[],this.shownLabels=[];let i=e.map.width;for(let r of t){let t=Rx(e,r),a=Mx+t*Nx,o=r.stops.map(t=>am(e,t.building));for(let n=0;n<o.length&&o.length>1;n++){let r=o[n],s=o[(n+1)%o.length];if(!r||!s||r===s)continue;let c=xm(e,r,s);if(!c)continue;let l=e=>new V(c[e]%i+.5,a,Math.floor(c[e]/i)+.5),u=0;for(let e=1;e<c.length;e++)(e===c.length-1||c[e+1]-c[e]!==c[e]-c[e-1])&&(this.bar(t,l(u),l(e)),u=e)}if(!n)continue;let s=new Map;r.stops.forEach((e,t)=>{let n=s.get(e.building);n?n.push(t+1):s.set(e.building,[t+1])});for(let[n,r]of s){let i=am(e,n);if(!i)continue;let a=Yp(i),o=this.m.buildings[i.type].height;this.shownLabels.push({x:i.x+a/2,y:(i.type===`field`?.9:o)+.9,z:i.y+a/2,colour:ax[t],text:r.join(` · `)})}}}bar(e,t,n){let r=Fx.subVectors(n,t).length();if(r<1e-4)return;Ix.setFromUnitVectors(Px,Fx.divideScalar(r));let i=this.r.addObject(this.m.routes[e]);i.castShadow=!1,i.snap=!1,i.setTransform(t.clone().addScaledVector(Fx,-.12/2),Ix,Lx.set(r+jx,.02,jx)),this.objs.push(i)}},Bx=(e,t)=>ly(ax[Rx(e,t)]);function Vx(e,t){let n=[];for(let r of t.stops){let t=am(e,r.building),i=t?G[t.type].name:`?`,a=n[n.length-1];a?.name===i?a.n++:n.push({name:i,n:1})}return n.map(e=>e.n>1?`${e.name} ×${e.n}`:e.name).join(` → `)}function Hx(e,t){let n=new Set;for(let r of t.stops){let t=am(e,r.building);if(!t)continue;let i=t.type===`silo`?r.pick:Hh(t);for(let e of r.pick)i.includes(e)&&n.add(e)}return Mf.filter(e=>n.has(e))}function Ux(e,t){let n=e.trucks.filter(e=>e.garage===t.garage).indexOf(t)+1,r=e.buildings.filter(e=>e.type===`garage`),i=r.findIndex(e=>e.id===t.garage);return r.length>1?`Truck ${n} of garage ${i+1}`:`Truck ${n}`}function Wx(e,t){let n=_v(e,t).flatMap((e,t)=>e?[`Stop ${t+1}: ${e}`]:[]);for(let r of gg(e,t))for(let t of gv(e,r))n.push(`${Ux(e,r)}: ${t}`);return t.stops.length&&!gg(e,t).length&&n.push(`No trucks run it.`),n}function Gx(e,t){let n=new Map;for(let r of gg(e,t)){let e=r.phase===`drive`?r.target===r.garage?`going to charge`:`driving`:r.phase===`dock`?`at a stop`:r.phase===`queue`?`queuing`:r.phase===`stuck`?`stuck`:`charging`;n.set(e,(n.get(e)??0)+1)}return[...n].map(([e,t])=>`${t} ${e}`).join(` · `)}var Kx=e=>document.activeElement instanceof HTMLInputElement&&e.contains(document.activeElement);function qx(e){let t=G[e];return e===`sprinkler`?`${K.sprinklerNearWater}–${K.sprinklerFar} W`:e===`garage`?`${q.chargeRate} W a truck charging`:t.power?`${t.power} W while working`:e===`solar`?`up to ${K.solar} W`:e===`turbine`?`up to ${K.turbine} W`:e===`digester`?`${K.digester} W while burning`:e===`battery`?`holds ${K.battery.capacity} J`:``}var Jx=(e,t)=>J(`div`,{class:`cd-row`},J(`span`,null,e),J(`i`),typeof t==`string`?J(`b`,null,t):t),Yx=class{el=J(`div`,{class:`cd-card side-card`,hidden:!0});key=``;updater=null;tab=`workings`;historyWindow=300;host;constructor(e){this.host=e}get open(){return!this.el.hidden}refresh(){this.key=``}update(e=!0){let t=this.host.state(),n=e?this.host.selected():null,r=n===null?null:am(t,n),i=n===null?null:sm(t,n);if(!r&&!i){this.el.hidden||(this.el.hidden=!0,this.el.replaceChildren()),this.key=``,this.updater=null;return}let a=xp(t).routesVersion,o=r?.type===`field`?[r.crop,r.harvest??null]:r&&Wp(r)?r.recipe:null,s=JSON.stringify([Qy(),...i?[`truck`,i.id,i.route,a,this.tab]:[r?.id,r?.type,o,a,this.tab]]);if(s!==this.key){this.key=s,this.el.hidden=!1;let{el:e,update:n}=i?this.truckCard(t,i):this.buildingCard(t,yp(r,`building`));this.el.replaceChildren(...e),this.updater=n}this.updater?.()}close(){this.host.select(null),this.refresh()}header(e,t,n,r){return J(`div`,{class:`side-head`},J(`span`,{class:`disc`},X(e,48)),J(`div`,{class:`grow`},J(`h2`,{class:`cd-title`},t),J(`div`,{class:`cd-small`},n)),J(`button`,{class:`cd-btn is-icon is-sm`,title:ib(`Its page in the guide`,...tb(`guide`)),"aria-label":`Guide`,onclick:()=>this.host.openGuide(r)},X(`book`,18)),J(`button`,{class:`cd-btn is-icon is-sm`,title:`Close (Esc)`,"aria-label":`Close`,onclick:()=>this.close()},X(`close`,14)))}buildingCard(e,t){let n=G[t.type],r=[],i=Uf.find(e=>e.id===n.category)?.name??`The depot`,a=this.header(t.type,n.name,[i,`${n.size} × ${n.size}`,qx(t.type)].filter(Boolean).join(` · `),{kind:`building`,id:t.type}),o=J(`span`),s=J(`span`,{class:`cd-small`}),c=J(`span`,{class:`rate`});r.push(()=>{let n=Dy(t,t.status,t.need,ag(e,t));Qv(o,`${t.status}|${n}`,()=>[Oy(t.status,n)]);let r=Pm(e,t),i=r?Gm(r):null;Z(s,i&&i.from>(r?.since??0)+1e-6?`for ${Q(e.time-i.from)}`:``);let a=By(t).items[0];if(a&&r){let t=Wm(r,e.time,300);Qv(c,`${ny(t.perMin[a]??0)} ${a}`,()=>[J(`span`,{class:`big cd-num`},ny(t.perMin[a]??0)),J(`span`,{class:`cd-small`},` ${ay(a)} / min`)])}});let l=J(`div`,{class:`side-status`},o,s,J(`span`,{class:`fill`}),c),u=J(`p`,{class:`cd-small side-line`});r.push(()=>{let n=xv(e,t),r=n.toLowerCase()===Dy(t,t.status,t.need,ag(e,t)).toLowerCase();Z(u,r?``:n),u.hidden=r});let d=[[`workings`,`Workings`]];Fm(t)&&d.push([`history`,`History`]),dg(t)&&!G[t.type].stores&&d.push([`next`,`Next door`]),d.some(([e])=>e===this.tab)||(this.tab=`workings`);let f=d.length>1?J(`div`,{class:`cd-seg side-tabs`},...d.map(([e,t])=>J(`button`,{class:e===this.tab?`is-on`:``,onclick:()=>{this.tab=e,this.refresh()}},t))):null,p;if(this.tab===`history`){let n=Gy(e,t,()=>this.historyWindow,e=>{this.historyWindow=e});p=[n.el],r.push(n.update)}else p=this.tab===`next`?[this.nextDoor(e,t,r)]:this.workings(e,t,r);let m=t.type===`depot`?null:J(`div`,{class:`side-foot`},J(`button`,{class:`cd-btn is-danger is-sm`,onclick:()=>{this.host.did(Ug(e,t)),this.host.select(null)}},X(`trash`,16),`Remove${Pg(e,t.type)?` · refund ${ty(Pg(e,t.type))}`:``}`));return{el:[a,Qx(t,r),l,u,f,J(`div`,{class:`side-body`},...p),m].filter(e=>!!e),update:()=>{for(let e of r)e()}}}workings(e,t,n){let r=[J(`p`,{class:`cd-small`},G[t.type].hint)],i=(e,t)=>{let i=J(`b`);n.push(()=>Z(i,t())),r.push(Jx(e,i))},a=e=>{let t=J(`div`,{class:`cd-bar`},J(`i`));n.push(()=>Zv(t,`--v`,Math.max(0,Math.min(1,e())).toFixed(3))),r.push(t)};switch(t.type){case`field`:r.push(J(`div`,{class:`cd-seg wide`},...zf.map(n=>J(`button`,{class:t.crop===n?`is-on`:``,title:`${Bf[n].grow} s · ${Bf[n].yield} a harvest · soil ${Bf[n].soil>0?`+`:``}${Bf[n].soil}${Bf[n].flowers?` · flowers`:``}`,onclick:()=>this.host.did(Gg(e,t,n))},X(n,18),Bf[n].name)))),i(`Growth`,()=>iy(t.growth)),a(()=>t.growth),i(`Soil fertility`,()=>`${Math.round(uh(e,t))}`),i(`Growth pace`,()=>{let n=Sv(e,t);return`${iy(n.pace)} · water ${iy(n.water)}, soil ×${n.soil.toFixed(2)}`}),i(`Harvest`,()=>`${Bf[t.crop].yield}${Bf[t.crop].flowers&&sh(e,t)?` + 1 (bees)`:``} every ${Math.round(Bf[t.crop].grow/Math.max(.01,Sv(e,t).pace))} s`),i(`Waiting to go`,()=>`${t.stored} of ${Vf.store}`),i(`Compost`,()=>`${xh(e,t)?`takes it now`:`none needed`} · below soil ${Vf.compostBelow}`);break;case`hive`:i(`Flowering fields`,()=>`${Tv(e,t)} (up to ${Qf.maxFlowers})`),i(`Next honey`,()=>iy(t.growth)),a(()=>t.growth),i(`Honey waiting`,()=>`${t.stored} of ${Qf.store}`);break;case`silo`:{let e=J(`div`,{class:`chips`});n.push(()=>Qv(e,JSON.stringify(t.store),()=>{let e=Object.keys(t.store).filter(e=>t.store[e]);return e.length?e.map(e=>J(`span`,{class:`cd-chip`},X(e,20),`${t.store[e]} / ${$f.perGood} ${ay(e)}`)):[J(`span`,{class:`cd-small`},`Empty.`)]})),r.push(J(`div`,{class:`cd-label sub`},`Holds`),e);break}case`garage`:r.push(...this.garageTrucks(e,t,n));break;case`battery`:i(`Charge`,()=>`${iy(t.charge/K.battery.capacity)} · ${Math.round(t.charge)} of ${K.battery.capacity} J`),a(()=>t.charge/K.battery.capacity);break;case`solar`:case`turbine`:i(`Making`,()=>ry(eg(e,t)?sg(e,t,uv(e.scenario,e.time),dv(e.scenario,e.time)):0)),t.type===`turbine`&&i(`Shelter`,()=>`${iy(ch(e,t))} of the wind reaches it`);break;case`depot`:{let t=J(`div`,{class:`chips`});n.push(()=>Qv(t,JSON.stringify(e.delivered),()=>{let t=Object.keys(e.delivered).filter(t=>e.delivered[t]);return t.length?t.map(t=>J(`span`,{class:`cd-chip`},X(t,20),`${ty(e.delivered[t]??0)} ${ay(t)}`)):[J(`span`,{class:`cd-small`},`Nothing delivered yet. Trucks drop goods here on a route that stops here.`)]})),i(`Earned`,()=>`${ty(e.earned)} credits`),r.push(J(`div`,{class:`cd-label sub`},`Delivered`),t);break}}if(Wp(t)){let e=gh(t),n=qf(t.type);n.length>1&&r.push(J(`div`,{class:`cd-seg wide`},...n.map(e=>J(`button`,{class:t.recipe===e.id?`is-on`:``,onclick:()=>this.host.did(Kg(t,e.id))},X(e.outputs[0].item,18),Xx(e.outputs[0].item))))),r.push(Jx(`Recipe`,`${e.inputs.map(Zx).join(` + `)} → ${e.outputs.length?e.outputs.map(e=>`${e.n} ${ay(e.item)}`).join(` + `):`${K.digester} W`} · ${e.time} s`))}if(G[t.type].power&&i(`Power`,()=>{let n=eg(e,t),r=og(e,t);return n?r?`using ${ry(r)} · getting ${iy(ag(e,t))}`:`none right now`:`not connected`}),G[t.type].power||G[t.type].grid){let i=J(`i`,{class:`dot`}),a=J(`span`);n.push(()=>{let n=G[t.type].grid===`link`?$h(e).of.get(t.id)??null:eg(e,t);i.hidden=!n,n&&(i.style.background=ly(rx[Ox(e,n)])),Z(a,n?`${ry(n.made)} made · ${ry(Yh(n))} used · ${n.capacity?iy(n.stored/n.capacity):`no batteries`}`:`none: no pylon in reach`)}),r.push(Jx(`Network`,J(`b`,null,i,a)))}return dg(t)&&r.push(this.stopsHere(e,t)),r}nextDoor(e,t,n){let r=J(`div`);return n.push(()=>{let n=fv(Nh(e,t));Qv(r,n.join(`|`),()=>n.length?n.map(e=>J(`div`,{class:`cd-row`},J(`span`,null,e))):[J(`p`,{class:`cd-small`},`It trades with no building next door. Buildings sharing an edge trade goods without trucks: a field beside a mill gives it wheat, a mill beside a coop its bran.`)])}),r}stopsHere(e,t){let n=e=>e.map(ay).join(`, `),r=hg(e,t).map(r=>{let i=r.stops.filter(e=>e.building===t.id).map(e=>{let r=e.drop.filter(e=>zh(t).includes(e)),i=e.pick.filter(e=>Hh(t).includes(e));return[r.length>=Mf.length-i.length&&r.length>6?`drops everything else`:r.length?`drops ${n(r)}`:``,i.length?`picks up ${n(i)}`:``].filter(Boolean).join(` · `)||`nothing to do`});return J(`div`,{class:`cd-row`},J(`span`,{class:`route-name`},J(`i`,{class:`dot`,style:`background: ${Bx(e,r)}`}),J(`b`,null,r.name),` ${i.join(`; `)}`),J(`i`),J(`button`,{class:`cd-btn is-sm`,onclick:()=>this.host.editRoute(r)},`Edit`))}),i=J(`select`,{class:`cd-select`,onchange:()=>{let n=i.value===`new`?t_(e):om(e,Number(i.value));n&&(this.host.did(i_(e,n,t)),this.host.editRoute(n))}},J(`option`,{value:``},`Add to a route…`),...e.routes.map(e=>J(`option`,{value:String(e.id)},e.name)),J(`option`,{value:`new`},`+ New route`));return J(`div`,null,J(`div`,{class:`cd-label sub`},`Routes`),...r.length?r:[J(`p`,{class:`cd-small`},`No route stops here: trucks won't bring or take its goods.`)],J(`div`,{class:`side-add`},i))}routeSelect(e,t){let n=J(`select`,{class:`cd-select`,onchange:()=>{let r=n.value;if(r===`new`){let n=t_(e);this.host.did(Zg(e,t,n)),this.host.editRoute(n);return}this.host.did(Zg(e,t,r===``?null:om(e,Number(r))))}},J(`option`,{value:``},`No route (parked)`),...e.routes.map(e=>J(`option`,{value:String(e.id),selected:e.id===t.route},e.name)),J(`option`,{value:`new`},`+ New route…`));return n}garageTrucks(e,t,n){let r=e.trucks.filter(e=>e.garage===t.id),i=r.map((t,r)=>{let i=J(`div`,{class:`cd-small`});return n.push(()=>Z(i,bv(e,t))),J(`div`,{class:`side-truck`},J(`div`,{class:`line`},X(`truck`,26),J(`button`,{class:`link`,onclick:()=>{this.host.select(t.id),this.refresh()}},`Truck ${r+1}`),J(`span`,{class:`fill`}),this.routeSelect(e,t)),i)});return[J(`div`,{class:`cd-label sub`},`Trucks · ${r.length} of ${q.perGarage}`),...i.length?i:[J(`p`,{class:`cd-small`},`No trucks yet. Buy one, then give it a route: a loop of stops where it drops and picks up goods.`)],J(`div`,{class:`side-add`},J(`button`,{class:`cd-btn is-primary is-sm`,disabled:r.length>=q.perGarage,onclick:()=>this.host.did(Yg(e,t))},`Buy a truck · ${qg(e)||`free`}`))]}truckCard(e,t){let n=mg(e,t),r=am(e,t.garage),i=J(`p`,{class:`side-line`}),a=J(`div`),o=J(`div`,{class:`chips`}),s=J(`div`,{class:`cd-bar`},J(`i`)),c=J(`b`),l=J(`b`),u=J(`button`,{class:`cd-btn is-ghost is-sm`,title:`Throw its cargo away (the goods are lost), so it has room again`,onclick:()=>this.host.did(Qg(t))},`Dump cargo`);return{el:[this.header(`truck`,Ux(e,t),n?`on ${n.name}`:`no route`,{kind:`topic`,id:`trucks`}),i,a,J(`div`,{class:`side-body`},J(`p`,{class:`cd-small`},`Carries ${q.cargo} goods at ${q.speed} tiles a second. Charges at its garage.`),Jx(`Route`,this.routeSelect(e,t)),J(`div`,{class:`cd-label sub`},`Cargo`),o,Jx(`Battery`,c),s,Jx(`Last 10 min`,l)),J(`div`,{class:`side-foot`},r?J(`button`,{class:`cd-btn is-ghost is-sm`,onclick:()=>{this.host.select(r.id),this.refresh()}},X(`garage`,18),`Garage`):null,n?J(`button`,{class:`cd-btn is-primary is-sm`,onclick:()=>this.host.editRoute(n)},`Edit route`):null,u,J(`button`,{class:`cd-btn is-danger is-sm`,onclick:()=>{this.host.did(Xg(e,t)),this.host.select(r?.id??null)}},`Sell${qg(e)?` · +${qg(e)}`:``}`))],update:()=>{u.disabled=!t.cargo.length,Z(i,bv(e,t));let n=gv(e,t);Qv(a,n.join(`|`),()=>n.map(e=>J(`p`,{class:`cd-small cd-bad`},e))),Qv(o,t.cargo.join(`,`),()=>{if(!t.cargo.length)return[J(`span`,{class:`cd-small`},`Empty.`)];let e=new Map;for(let n of t.cargo)e.set(n,(e.get(n)??0)+1);return[...e].map(([e,t])=>J(`span`,{class:`cd-chip`},X(e,20),`${t} ${ay(e)}`))}),Zv(s,`--v`,(t.energy/q.battery).toFixed(3)),Z(c,`${iy(t.energy/q.battery)}${t.energy<=0?` · crawling`:``}`);let r=Jh(e,t);Z(l,r.idle===null?`–`:`${iy(r.idle)} waiting at stops`)}}}},Xx=e=>ay(e).replace(/^./,e=>e.toUpperCase()),Zx=e=>`item`in e?`${e.n} ${ay(e.item)}`:`${e.n} ${Rf[e.group].split(` (`)[0]}`;function Qx(e,t){if(!Wp(e))return null;let n=gh(e),r=(e,n,r,i,a,o)=>{let s=J(`span`,{class:`pips`},...Array.from({length:a},()=>J(`i`))),c=J(`span`,{class:`n`}),l=J(`div`,{class:`store`},J(`span`,{class:`store-disc`},X(e,36)),s,c);return t.push(()=>{let e=r();[...s.children].forEach((t,n)=>t.classList.toggle(`on`,e>=(n+1)*i)),Z(c,`${n} ${e}/${i*a}`),l.classList.toggle(`is-empty`,o&&e<i)}),l},i=t=>()=>`item`in t?e.inputs[t.item]??0:Pf[t.group].reduce((t,n)=>t+(e.inputs[n]??0),0),a=J(`span`,{class:`timer`}),o=J(`div`,{class:`big cd-num`}),s=J(`div`,{class:`cd-small`});a.append(wy({v:0,d:84,w:7,col:`var(--ochre)`},J(`div`,null,o,s))),t.push(()=>{let t=e.progress;Zv(a.querySelector(`.cd-ring`),`--v`,t===null?`0`:(t/n.time).toFixed(3)),Z(o,t===null?`–`:`${ny(Math.max(0,n.time-t))} s`),Z(s,t===null?`idle`:`left`)});let c=n.inputs.map(e=>r(`item`in e?e.item:Pf[e.group][0],`item`in e?ay(e.item):e.group,i(e),e.n,3,!0)),l=n.outputs.length?n.outputs.map(t=>r(t.item,ay(t.item),()=>e.outputs[t.item]??0,t.n,3,!1)):[J(`div`,{class:`store`},J(`span`,{class:`store-disc`},X(`bolt`,36)),J(`span`,{class:`n`},`${K.digester} W`))],u=e=>J(`span`,{class:`op`},e);return J(`div`,{class:`cd-inset recipe-line`},...c.flatMap((e,t)=>t?[u(`+`),e]:[e]),u(`→`),J(`div`,{class:`store`},a,J(`span`,{class:`n`},`${n.time} s a batch`)),u(`→`),...l.flatMap((e,t)=>t?[u(`+`),e]:[e]))}function $x(e,t){let n=e.map(e=>e??0),r=Math.max(1e-9,...n),i=e.map((t,n)=>t===null?null:`${n/(e.length-1)*110},${24-t/r*20}`).filter(Boolean).join(` `);return Y(`svg`,{class:`spark`,width:110,height:26,viewBox:`0 0 110 26`},i?Y(`polyline`,{points:i,class:t?`gold`:``}):null)}function eS(e){let t=e.buildings.filter(e=>e.type===`field`),n=fh(e),r=jm(e),i=t.length?t.reduce((t,n)=>t+uh(e,n),0)/t.length:50,a=dm(e),o=a-e.initialTrees,s=Math.max(-np.cap,Math.min(np.cap,o*np.perTree)),c=e.scenario.goals.find(e=>e.kind===`soil`),l=e.buildings.filter(e=>e.type===`sapling`).length,u=t.filter(e=>Bf[e.crop].flowers),d=u.filter(t=>sh(e,t)).length,f=e.buildings.filter(e=>e.type===`hive`).length,p=(e,t,n,r,i)=>J(`div`,{class:`vr`},e,J(`div`,{class:`vr-txt`},J(`div`,{class:`cd-label`},t),J(`div`,{class:`vr-big`},...n),J(`div`,{class:`cd-small`},...r),i));return J(`div`,{class:`health`},p(wy({v:n/100,d:132,w:10,col:`var(--tide)`},X(`soil`,48)),`Soil health`,[String(Math.round(n))],[t.length?`fields average ${Math.round(i)} over ${t.length*9} tiles`:`no fields: 50 until there are`,`, trees ${s>=0?`+`:``}${ny(s)}`,J(`br`),c&&c.kind===`soil`?J(`span`,null,`goal `,J(`b`,null,`${c.min}+`),` at the end`):`the soil goal checks this number`],r===null?J(`div`,{class:`cd-small trend`},`trend: a minute more to tell`):J(`div`,{class:`cd-small trend ${r<-.05?`cd-bad`:r>.05?`cd-good`:``}`},Math.abs(r)<=.05?`steady over the last minute`:`${r<0?`↓`:`↑`} ${ny(Math.abs(r))} a minute now`)),p(wy({v:e.initialTrees?Math.min(1,a/e.initialTrees):1,d:132,w:10,col:`var(--pine)`},X(`sapling`,48)),`Trees`,[ty(a)],[l?`${sy(l,`sapling`)} growing`:`no saplings growing`,J(`br`),`${ty(e.initialTrees)} when the commission began`],J(`div`,{class:`cd-small trend ${o>0?`cd-good`:o<0?`cd-bad`:``}`},o?`${o>0?`↑`:`↓`} ${Math.abs(o)} since the start`:`as many as at the start`)),p(wy({v:u.length?d/u.length:0,d:132,w:10,col:`var(--ochre)`},X(`bee`,48)),`Pollination`,[String(d),J(`small`,null,` of ${u.length}`)],[`flowering fields reached by ${sy(f,`hive`)}`,J(`br`),`flowering crops there give one more a harvest`],null))}function tS(e){let t=e.state(),n=J(`div`,{class:`cd-sheet__head`}),r=J(`div`,{class:`sheet-body`}),i=J(`div`,{class:`cd-sheet ledger`},n,r),a=-1/0,o=()=>{if(performance.now()-a<1e3)return;a=performance.now();let i=$h(t).list,o=i.reduce((e,t)=>e+t.made,0),s=i.reduce((e,t)=>e+Yh(t),0),c=i.reduce((e,t)=>e+t.capacity,0),l=i.reduce((e,t)=>e+t.stored,0);Xv(n,J(`div`,null,J(`div`,{class:`cd-label`},`${t.scenario.name} · day ${lv(t.time)}, ${$v(cv(t.time))}`),J(`h1`,{class:`cd-display`},`Ledger`)),J(`span`,{class:`fill`}),J(`button`,{class:`cd-btn power-link`,title:ib(`The Power panel`,...tb(`power`)),onclick:e.openPower},X(`bolt`,20),`Power`,J(`span`,{class:`cd-small`},i.length?`${ry(o)} made · ${ry(s)} used${c?` · ${iy(l/c)} stored`:``}`:`no network yet`),`›`),J(`button`,{class:`cd-btn is-icon`,title:ib(`Close`,...tb(`ledger`),`Esc`),"aria-label":`Close`,onclick:e.close},X(`close`,16)));let u=new Set(t.scenario.goals.flatMap(e=>e.kind===`soil`?[]:[e.item])),d=Mm(t),f=Mf.filter(e=>t.made[e]||t.delivered[e]||d[e]||u.has(e)),p=e=>e>.005?ny(e):`–`,m=t.scenario.credits+t.earned-t.credits;Xv(r,eS(t),J(`div`,{class:`row-head goods-head`},J(`span`,{class:`cd-label`},`Goods · made and delivered`),J(`span`,{class:`cd-small cd-faint`},`a minute: average of the last 5 minutes · lines: the last 10 minutes`)),f.length?J(`table`,{class:`gt`},J(`thead`,null,J(`tr`,null,J(`th`,null,`Good`),J(`th`,null,`Made`,J(`br`),`a minute`),J(`th`,{class:`l`}),J(`th`,null,`Used by your`,J(`br`),`buildings a minute`),J(`th`,null,`To the depot`,J(`br`),`a minute`),J(`th`,{class:`sepl`},`Made`,J(`br`),`in all`),J(`th`,null,`To the depot`,J(`br`),`in all`),J(`th`,null,`In stores`,J(`br`),`and trucks now`))),J(`tbody`,null,...f.map(e=>J(`tr`,{class:u.has(e)?`is-goal`:``},J(`td`,null,J(`span`,{class:`gname`},X(e,30),Nf[e].name,u.has(e)?J(`span`,{class:`cd-chip goal-tag`},`goal`):null)),J(`td`,{class:`n`},J(`b`,null,p(km(t,`made`,e)))),J(`td`,{class:`l`},$x(Am(t,`made`,e),u.has(e))),J(`td`,{class:`n`},p(km(t,`used`,e))),J(`td`,{class:`n`},p(km(t,`delivered`,e))),J(`td`,{class:`n sepl`},t.made[e]?ty(t.made[e]):`–`),J(`td`,{class:`n`},t.delivered[e]?ty(t.delivered[e]):`–`),J(`td`,{class:`n`},String(d[e]??0)))))):J(`p`,{class:`cd-small`},`Nothing made yet.`),J(`div`,{class:`money cd-small`},X(`depot`,26),J(`span`,null,`Earned at the depot `,J(`b`,null,ty(t.earned)),` credits`),J(`span`,{class:`fill`}),t.scenario.sandbox?null:J(`span`,null,`Spent on buildings and trucks `,J(`b`,null,ty(Math.max(0,m)))),J(`span`,null,`Credits now `,J(`b`,null,t.scenario.sandbox?`∞`:ty(Math.floor(t.credits))))))};return o(),{el:i,update:o}}var nS=[1,2,3,4],rS=[`off`,`minimal`,`full`],iS={min:.9,max:1.3,step:.05},aS={uiSize:1,pixelSize:2,reduceMotion:!1,showPace:!1,problemsStrip:!1,frameStats:`off`,keys:{}};function oS(e){let t=vp(e??`{}`),n=t.ok?t.value??{}:{};return{uiSize:typeof n.uiSize==`number`&&n.uiSize>=iS.min-1e-9&&n.uiSize<=iS.max+1e-9?n.uiSize:aS.uiSize,pixelSize:nS.includes(n.pixelSize)?n.pixelSize:aS.pixelSize,reduceMotion:typeof n.reduceMotion==`boolean`?n.reduceMotion:aS.reduceMotion,showPace:typeof n.showPace==`boolean`?n.showPace:aS.showPace,problemsStrip:typeof n.problemsStrip==`boolean`?n.problemsStrip:aS.problemsStrip,frameStats:rS.includes(n.frameStats)?n.frameStats:aS.frameStats,keys:Rv(n.keys)}}var sS=class{value;listeners=[];key;constructor(e){this.key=e,this.value=oS(localStorage.getItem(e))}get(){return this.value}set(e){this.value=oS(JSON.stringify({...this.value,...e})),localStorage.setItem(this.key,JSON.stringify(this.value));for(let e of this.listeners)e(this.value)}listen(e){this.listeners.push(e),e(this.value)}},cS=(e,t,n)=>Math.max(.8,Math.min(1.2,t/1920,n/1080))*e.uiSize;function lS(e,t,n){let r=J(`button`,{class:`switch${e?` is-on`:``}`,role:`switch`,"aria-checked":String(e),"aria-label":t});return r.addEventListener(`click`,()=>{let e=r.getAttribute(`aria-checked`)!==`true`;r.setAttribute(`aria-checked`,String(e)),r.classList.toggle(`is-on`,e),n(e)}),r}function uS(e){let t=e.get(),n=J(`b`,{class:`cd-num`},iy(t.uiSize)),r=J(`input`,{type:`range`,class:`cd-range`,min:iS.min,max:iS.max,step:iS.step,value:t.uiSize,"aria-label":`Interface size`,oninput:()=>{n.textContent=iy(Number(r.value))},onchange:()=>e.set({uiSize:Number(r.value)})}),i=J(`div`,{class:`cd-seg wide`},...nS.map(n=>{let r=J(`button`,{class:t.pixelSize===n?`is-on`:``,onclick:()=>{e.set({pixelSize:n});for(let e of i.children)e.classList.toggle(`is-on`,e===r)}},`${n} × ${n}`);return r})),a=J(`div`,{class:`cd-seg wide`},...rS.map(n=>{let r=J(`button`,{class:t.frameStats===n?`is-on`:``,onclick:()=>{e.set({frameStats:n});for(let e of a.children)e.classList.toggle(`is-on`,e===r)}},n[0].toUpperCase()+n.slice(1));return r})),o=(n,r,i)=>J(`div`,{class:`set`},J(`b`,null,r),lS(t[n],r,t=>e.set({[n]:t})),J(`span`,{class:`cd-small`},i));return[J(`div`,{class:`set is-slider`},J(`b`,null,`Interface size`),r,n),J(`div`,{class:`set is-seg`},J(`b`,null,`Pixel size`),i,J(`span`,{class:`cd-small`},`Screen pixels for each pixel of the art. Smaller pixels show finer detail and cost more to draw.`)),o(`reduceMotion`,`Reduce motion`,`Cards and gauges appear without springing.`),o(`showPace`,`Show pace`,`“Done by” on the commission card and gold and silver ticks on the goals. Off: you see only where you are.`),o(`problemsStrip`,`Problems strip`,`Experimental. A strip on the right edge listing problems. Off: find them on the map.`),J(`div`,{class:`set is-seg`},J(`b`,null,`Frame rate`),a,J(`span`,{class:`cd-small`},`Top left while you play. Minimal: the frame rate, once a second. Full: a frame time graph, the average and the 1% and 0.1% lows.`))]}var dS=(e,t)=>e.length===t.length&&e.every((e,n)=>e===t[n]);function fS(e){let t=()=>Iv(e.get().keys),n=J(`div`,{class:`cd-small kb-note`,role:`status`}),r=J(`div`,{class:`kb-list`}),i=J(`button`,{class:`cd-btn is-ghost is-sm`,onclick:()=>{a(),n.textContent=``,e.set({keys:{}}),u()}},X(`rotate`,14),`Reset all`),a=()=>{},o=(t,r)=>{e.set({keys:Lv(t)}),n.textContent=r,u()};function s(e,r,i){a();let s=i.textContent;i.textContent=`Press a key`,i.classList.add(`is-listening`),n.textContent=`Press the new key. Esc keeps the old one.`;let c=()=>{removeEventListener(`keydown`,l,!0),removeEventListener(`pointerdown`,d,!0),a=()=>{}},l=i=>{if(i.preventDefault(),i.stopPropagation(),i.repeat||/^(Shift|Control|Alt|Meta|OS)(Left|Right)$/.test(i.code))return;c();let a=e=>{e.code===i.code&&(e.preventDefault(),e.stopPropagation(),removeEventListener(`keyup`,a,!0))};if(addEventListener(`keyup`,a,!0),i.code===`Escape`){n.textContent=``,u();return}let s=Nv(i.code);if(!Pv(s)){n.textContent=`${nb(s)} can't be used for a key.`,u();return}let{bindings:l,took:d}=Bv(t(),e.id,r,s);o(l,d.length?`${nb(s)} moved here from ${d.map(rb).join(` and `)}, which now has no key${d.length>1?`s`:``}.`:``)},d=e=>{e.target!==i&&(c(),n.textContent=``,i.textContent=s,i.classList.remove(`is-listening`))};addEventListener(`keydown`,l,!0),addEventListener(`pointerdown`,d,!0),a=c}function c(e,n){let r=n[e.id],i=Array.from({length:2},(n,i)=>{let a=r[i],c=J(`button`,{class:`cd-key kb-key${a?``:` is-empty`}`,"aria-label":`${e.label}: ${a?nb(a):`no key`}${i===0||a?``:` (add another key)`}`,onclick:()=>s(e,i,c)},a?nb(a):`+`);return J(`span`,{class:`kb-slot`},c,a?J(`button`,{class:`kb-clear`,title:`Take this key off`,"aria-label":`Take ${nb(a)} off ${e.label}`,onclick:()=>o(Vv(t(),e.id,i),``)},`×`):null)}),a=!dS(r,e.keys);return J(`div`,{class:`kb-row`},J(`span`,{class:`kb-what`},e.label,e.note?J(`small`,null,e.note):null),...i,J(`button`,{class:`kb-reset${a?``:` is-hidden`}`,title:`Back to the default`,"aria-label":`Reset ${e.label}`,tabIndex:a?0:-1,onclick:()=>l(e)},X(`rotate`,14)))}function l(e){let n={...t(),[e.id]:[]},r=[];e.keys.forEach((t,i)=>{let a=Bv(n,e.id,i,t);n=a.bindings,r.push(...a.took)}),o(n,r.length?`${r.map(rb).join(` and `)} lost a key to ${e.label}.`:``)}function u(){let n=t();i.disabled=Object.keys(e.get().keys).length===0,Xv(r,...kv.map(e=>J(`div`,{class:`kb-group`},J(`div`,{class:`cd-label group`,style:`--col: ${e.col}`},J(`i`),e.name),...Av.filter(t=>t.group===e.id).map(e=>c(e,n)))))}return u(),[J(`div`,{class:`kb-bar`},J(`div`,{class:`cd-small`},`Click a key, then press the one you want. Each action can have two. Esc always closes and pauses.`),i),n,r]}function pS(e,t){let n=J(`div`,{class:`sp-body`}),r=J(`div`,{class:`cd-seg`}),i=t=>{Xv(r,...[[`game`,`Game`],[`keys`,`Keys`]].map(([e,n])=>J(`button`,{class:e===t?`is-on`:``,onclick:()=>{e!==t&&i(e)}},n))),Xv(n,...t===`game`?uS(e):fS(e)),n.scrollTop=0};return i(`game`),J(`div`,{class:`cd-card settings settings-panel`},J(`div`,{class:`sp-head`},J(`div`,{class:`cd-label`},`Settings`),r,J(`button`,{class:`cd-btn is-primary is-sm`,onclick:t},`Done`)),n)}var mS=[{key:`solar`,col:`#c08a2e`,name:`solar`},{key:`wind`,col:`#3d7a91`,name:`wind`},{key:`digester`,col:`#8a6a4a`,name:`digester`},{key:`given`,col:`#76608f`,name:`from batteries`},{key:`short`,col:`#b4523a`,name:`short`}];function hS(e,t,n,r,i,a){let o=(n,r)=>`${(e+n*Math.sin(r)).toFixed(1)},${(t-n*Math.cos(r)).toFixed(1)}`;return`M ${o(n,i)} L ${o(r,i)} A ${r} ${r} 0 0 1 ${o(r,a)} L ${o(n,a)} A ${n} ${n} 0 0 0 ${o(n,i)} Z`}function gS(e){let t=jp(e),n=Math.max(10,...t.hours.map(e=>e?Math.max(e.made+e.given+e.short,e.used):0)),r=e=>78+e/n*180,i=[],a=e=>e/24*Math.PI*2;t.hours.forEach((e,t)=>{if(!e)return;let n=Math.floor(cv(e.from)+1e-6),o=a(n)+.01,s=a(n+1)-.01;e.night&&i.push(Y(`path`,{d:hS(300,300,78,258,o-.01,s+.01),class:`night`}));let c=0;for(let n of mS){let a=e[n.key];a<=.01||(i.push(Y(`path`,{d:hS(300,300,r(c),r(c+a),o,s),fill:n.col,opacity:t===23?1:.92})),c+=a)}});let o=[];t.hours.forEach(e=>{if(!e)return;let t=Math.floor(cv(e.from)+1e-6);for(let n of[a(t),a(t+1)])o.push(`${(300+r(e.used)*Math.sin(n)).toFixed(1)},${(300-r(e.used)*Math.cos(n)).toFixed(1)}`)}),o.length&&i.push(Y(`polyline`,{points:o.join(` `),class:`used`}));for(let e of[.5,1])i.push(Y(`circle`,{cx:300,cy:300,r:r(n*e),class:`grid`}),Y(`text`,{x:305,y:300-r(n*e)+14,class:`halo`},ry(n*e)));for(let e=0;e<24;e+=3){let t=a(e);i.push(Y(`text`,{x:300+284*Math.sin(t),y:300-284*Math.cos(t)+4,"text-anchor":`middle`,class:e%6?``:`strong`},String(e).padStart(2,`0`)))}let s=a(cv(e.time));return i.push(Y(`line`,{x1:300+78*Math.sin(s),y1:300-78*Math.cos(s),x2:300+268*Math.sin(s),y2:300-268*Math.cos(s),class:`now`})),i.push(Y(`text`,{x:300,y:288,"text-anchor":`middle`,class:`centre`},t.seconds?`24 h`:`–`),Y(`text`,{x:300,y:314,"text-anchor":`middle`,class:`strong`},`${ry(t.avg.made)} made`),Y(`text`,{x:300,y:332,"text-anchor":`middle`},`${ry(t.avg.used)} used, on average`)),Y(`svg`,{class:`cd-chart radial`,viewBox:`0 0 600 600`,width:560,height:560,"aria-label":`Power by source, hour by hour, over the last 24 hours`},...i)}function _S(e){let t=xy(e);if(!t)return J(`div`,{class:`cd-inset tonight`},J(`div`,{class:`cd-label`,style:`color: var(--tide)`},`Tonight`),J(`p`,{class:`cd-small`},`No batteries: at night the networks have only what the wind and the digesters make.`));let n=t.points[0].t,r=t.points[t.points.length-1].t,i=e=>(e-n)/(r-n)*420,a=e=>120-e*120,o=t.sunset??n,s=[];for(let e=Math.ceil(cv(n)/3)*3;;e+=3){let t=n+(e-cv(n))*Tp;if(t>r)break;s.push(t)}let c=t.sunset!==null&&t.peak.t>n+1?`The charge tops out at ${iy(t.peak.k)} near ${ey(t.peak.t)}.`:``;return J(`div`,{class:`cd-inset tonight`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`,style:`color: var(--tide)`},`Tonight`),J(`span`,{class:`cd-small`},`charge, if use stays as it is now`)),J(`div`,{class:`fact3`},J(`div`,null,J(`b`,{class:t.dryAt?`cd-bad`:`cd-good`},t.dryAt?ey(t.dryAt):`held`),J(`small`,null,t.dryAt?`batteries run dry`:`they last the night`)),J(`div`,null,J(`b`,null,t.dryAt?ry(t.shortAfter):`${iy(Math.min(...t.points.filter(e=>e.t<=t.sunrise).map(e=>e.k)))}`),J(`small`,null,t.dryAt?`short after that, on average`:`lowest before sunrise`)),J(`div`,null,J(`b`,null,t.dryAt?Sy(t.shortFor):ey(t.sunrise)),J(`small`,null,t.dryAt?`short, until sunrise at ${ey(t.sunrise)}`:`sunrise`))),Y(`svg`,{class:`cd-chart`,viewBox:`-36 -8 468 154`,width:`100%`},Y(`rect`,{x:i(o),y:0,width:Math.max(0,i(t.sunrise)-i(o)),height:120,class:`night`}),...[0,.5,1].map(e=>Y(`line`,{x1:0,x2:420,y1:a(e),y2:a(e),class:`grid`})),...[[1,`100%`],[.5,`50`],[0,`0`]].map(([e,t])=>Y(`text`,{x:-8,y:a(e)+4,"text-anchor":`end`},String(t))),Y(`polyline`,{points:t.points.map(e=>`${i(e.t).toFixed(1)},${a(e.k).toFixed(1)}`).join(` `),class:`charge`}),Y(`circle`,{cx:0,cy:a(t.points[0].k),r:4,class:`dot`}),t.dryAt?Y(`circle`,{cx:i(t.dryAt),cy:a(0),r:5,class:`dry`}):null,...s.map(e=>Y(`text`,{x:i(e),y:142,"text-anchor":`middle`},ey(e)))),J(`div`,{class:`cd-small`},`${iy(t.points[0].k)} now. ${c}`))}function vS(e){let t=e.state(),n=J(`div`,{class:`cd-sheet power`}),r=-1/0,i=()=>{if(performance.now()-r<1e3)return;r=performance.now();let i=$h(t).list,a=i.reduce((e,t)=>e+t.made,0),o=i.reduce((e,t)=>e+Yh(t),0),s=t.buildings.filter(e=>e.type===`battery`&&$h(t).of.has(e.id)),c=s.length*K.battery.capacity,l=s.reduce((e,t)=>e+t.charge,0),u=jp(t),d=Mp(t),f=Object.keys(G).filter(e=>G[e].power&&t.buildings.some(t=>t.type===e)),p=e=>t.buildings.filter(n=>n.type===e&&$h(t).of.has(n.id)).reduce((e,n)=>e+og(t,n)*ag(t,n),0),m=Math.max(1e-9,...f.map(e=>u.use[e]??0)),h=e=>{let n=t.buildings.filter(t=>t.type===e);if(e===`garage`)return`${sy(t.trucks.length,`truck`)}, ${q.chargeRate} W a truck charging`;if(e===`sprinkler`){let e=n.filter(e=>!lh(t,e)).length;return e?`${e} far from water, ${K.sprinklerFar} W each`:`near water, ${K.sprinklerNearWater} W each`}return`${G[e].power} W while working`},g=d.length?d[d.length-1]:null,_=t.buildings.filter(e=>e.type===`solar`).length,v=t.buildings.filter(e=>e.type===`turbine`),y=t.buildings.filter(e=>e.type===`digester`),b=v.filter(e=>ch(t,e)<1).length,x=u.hours.reduce((e,t)=>t&&(!e||t.solar>e.v)?{v:t.solar,t:t.from}:e,null);Xv(n,J(`div`,{class:`cd-sheet__head`},X(`bolt`,48),J(`div`,null,J(`div`,{class:`cd-label`},`${t.scenario.name} · day ${lv(t.time)}, ${$v(cv(t.time))}`),J(`h1`,{class:`cd-display`},`Power`)),J(`span`,{class:`fill`}),J(`div`,{class:`pw-read`},J(`b`,null,ry(a)),J(`small`,null,`made now`)),J(`div`,{class:`pw-read`},J(`b`,null,ry(o)),J(`small`,null,`used now`)),J(`div`,{class:`pw-read`},J(`b`,null,c?iy(l/c):`–`),J(`small`,null,`stored · ${sy(s.length,`battery`,`batteries`)}`)),J(`button`,{class:`cd-btn is-icon`,title:ib(`Close`,...tb(`power`),`Esc`),"aria-label":`Close`,onclick:e.close},X(`close`,18))),J(`div`,{class:`sheet-body pw-body`},J(`div`,{class:`pw-col`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`,style:`color: var(--ochre)`},`Power by source · the last 24 hours`),J(`span`,{class:`cd-small`},`each hour a slice`)),J(`div`,{class:`pw-leg`},...mS.map(e=>J(`span`,null,J(`i`,{style:`background: ${e.col}`}),e.name)),J(`span`,null,J(`i`,{class:`line`}),`used`),J(`span`,null,J(`i`,{class:`nightkey`}),`night`)),gS(t),J(`div`,{class:`cd-small`},u.seconds<230?`Recorded over the last ${Sy(u.seconds)} of in-game time: the chart fills as the day goes on.`:g&&g.lowest!==null?`Last night the batteries ${g.dryAt?`ran dry at ${ey(g.dryAt)}`:`never ran dry`}, lowest ${iy(g.lowest)} at ${ey(g.lowestAt)}. ${u.hours.filter(e=>e&&e.short>.5).length?`${sy(u.hours.filter(e=>e&&e.short>.5).length,`hour`)} short in the last day.`:`No hour was short.`}`:`${u.hours.filter(e=>e&&e.short>.5).length} hours short in the last day.`)),J(`div`,{class:`pw-col spread`},J(`div`,null,J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`,style:`color: var(--ochre)`},`Networks`),J(`span`,{class:`cd-small`},`one row per network`)),J(`div`,{class:`net is-hd`},J(`span`,null,`Network`),J(`span`,null,`Made`),J(`span`,null,`Used`),J(`span`,null,`Stored`),J(`span`,null,`Short`)),...i.length?i.map((e,n)=>J(`div`,{class:`net is-row`},J(`div`,{class:`nm`},J(`i`,{class:`sw`,style:`background: ${ly(rx[Ox(t,e)])}`}),J(`div`,null,J(`b`,null,`Network ${n+1}`),J(`div`,{class:`cd-small`},`${sy(e.pylons.length,`pylon`)} · ${sy(e.members.filter(e=>G[e.type].power).length,`building`)} draw${e.members.filter(e=>G[e.type].power).length===1?`s`:``}`))),J(`span`,{class:`v`},ry(e.made)),J(`span`,{class:`v`},ry(Yh(e))),J(`span`,{class:`v`},e.capacity?iy(e.stored/e.capacity):`–`),J(`span`,{class:`v${e.share<1&&e.wanted>0?` cd-bad`:``}`},ry(e.wanted*(1-e.share))))):[J(`p`,{class:`cd-small`},`No pylons yet: a network is a set of linked pylons.`)],i.length===1?J(`div`,{class:`cd-small note`},`The only network: every powered building that reaches a pylon is on it.`):null),_S(t),J(`div`,null,J(`div`,{class:`cd-label`,style:`color: var(--ochre)`},`Sources · average over ${u.seconds>=230?`24 h`:Sy(u.seconds)}`),J(`div`,{class:`src`},J(`div`,null,X(`solar`,30),J(`b`,null,ry(u.avg.solar)),J(`small`,null,_?`${sy(_,`panel`)}${x&&x.v>.5?` · peak ${ry(x.v)} at ${ey(x.t)}`:``}`:`no panels`)),J(`div`,null,X(`turbine`,30),J(`b`,null,ry(u.avg.wind)),J(`small`,null,v.length?`${sy(v.length,`turbine`)}${b?`, ${b} sheltered`:``}`:`no turbines`)),J(`div`,null,X(`digester`,30),J(`b`,null,ry(u.avg.digester)),J(`small`,null,y.length?`${sy(y.length,`digester`)}${y.some(e=>e.progress!==null)?`, burning`:`, idle`}`:`no digester`)),J(`div`,null,X(`battery`,30),J(`b`,null,ry(u.avg.given)),J(`small`,null,`given · ${ry(u.avg.taken)} taken in`))))),J(`div`,{class:`pw-col spread`},J(`div`,null,J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`,style:`color: var(--ochre)`},`Where the watts go`),J(`span`,{class:`cd-small`},`average over the day · now`)),...f.length?f.sort((e,t)=>(u.use[t]??0)-(u.use[e]??0)).map(e=>{let n=t.buildings.filter(t=>t.type===e).length;return J(`div`,{class:`wg`},X(e,30),J(`span`,{class:`nm`},`${G[e].name}${n>1?` × ${n}`:``}`,J(`small`,null,h(e))),J(`span`,{class:`val`},ry(u.use[e]??0),J(`small`,null,`${ny(p(e))} now`)),J(`div`,{class:`cd-bar`,style:`--v: ${(u.use[e]??0)/m}; --col: var(--ink-2); height: 6px`},J(`i`)))}):[J(`p`,{class:`cd-small`},`Nothing draws power yet.`)],f.length?J(`div`,{class:`cd-small note`},`${ry(u.avg.used)} on average.`):null),J(`div`,null,J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`,style:`color: var(--ochre)`},`Battery health`),J(`span`,{class:`cd-small`},`each night, ${$v(t.scenario.weather.sunset)} to ${$v(t.scenario.weather.sunrise)}`)),...d.length&&c?d.map(e=>{let n=(24-t.scenario.weather.sunset+t.scenario.weather.sunrise)*Tp,r=e.dryAt===null?Math.min(1,e.seconds/n):(e.dryAt-e.from)/n,i=e.dryAt===null?0:Math.max(0,Math.min(1,e.seconds/n)-r);return J(`div`,{class:`bh`},J(`span`,{class:`nt`},e===d[d.length-1]&&uv(t.scenario,t.time)<=0?`Tonight`:`Day ${e.day}`),J(`span`,{class:`tr`},J(`i`,{style:`width: ${r*100}%`}),J(`u`,{style:`left: ${r*100}%; width: ${i*100}%`})),J(`span`,{class:`end${e.dryAt?` cd-bad`:` cd-good`}`},e.dryAt?`dry ${ey(e.dryAt)}`:e.lowest===null?`held`:`held · ${iy(e.lowest)} left`))}):[J(`p`,{class:`cd-small`},c?`No night recorded yet.`:`No batteries.`)],d.some(e=>e.dryAt)?J(`div`,{class:`cd-small note`},`Ran dry: ${d.flatMap(e=>e.dryAt?[ey(e.dryAt)]:[]).join(`, `)}.`):null))))};return i(),{el:n,update:i}}var yS=new Set([`depot`,`sapling`]),bS=9;function xS(e){return e.buildings.filter(e=>!yS.has(e.type)&&Ey(e.status)).map(t=>{let n=Pm(e,t),r=n?Gm(n):null;return{b:t,since:r&&r.status===t.status?r.from:e.time}}).sort((e,t)=>e.since-t.since||e.b.id-t.b.id)}var SS=class{el=J(`div`,{class:`cd-pstrip`,hidden:!0});pop=J(`div`,{class:`cd-pstrip__pop`,hidden:!0});key=``;hovered=null;focus;constructor(e){this.focus=e,this.el.addEventListener(`pointerleave`,()=>{this.hovered=null,this.pop.hidden=!0})}get popover(){return this.pop}update(e,t){if(this.el.hidden=!t,!t){this.pop.hidden=!0,this.key=``;return}let n=xS(e),r=n.slice(0,bS).map(e=>`${e.b.id}:${e.b.status}`).join(` `)+`|${n.length}`;if(r!==this.key&&(this.key=r,Xv(this.el,J(`span`,{class:`cd-pstrip__n`,title:`${n.length} building${n.length===1?``:`s`} with a problem`},String(n.length)),...n.slice(0,bS).map(t=>{let n=Ty(t.b.status),r=J(`button`,{class:`cd-pstrip__it ${n.cls}`,"aria-label":`${G[t.b.type].name}: ${Dy(t.b,t.b.status,t.b.need)}`,onpointerenter:()=>{this.hovered=t.b.id,this.showPop(e,r)},onclick:()=>this.focus(t.b.id)},J(`i`));return n.col&&r.style.setProperty(`--col`,n.col),r}),n.length>bS?J(`span`,{class:`cd-small more`},`+${n.length-bS}`):null)),this.hovered!==null&&!this.pop.hidden){let t=n.find(e=>e.b.id===this.hovered),r=this.pop.querySelector(`.since`);t&&r&&Z(r,Q(e.time-t.since))}}showPop(e,t){let n=xS(e).find(e=>e.b.id===this.hovered);n&&(this.pop.hidden=!1,this.pop.style.top=`${this.el.offsetTop+t.offsetTop-8}px`,Xv(this.pop,J(`div`,{class:`row`},Oy(n.b.status,Dy(n.b,n.b.status,n.b.need)),J(`b`,null,G[n.b.type].name),J(`span`,{class:`fill`}),J(`span`,{class:`cd-small`},`for `,J(`span`,{class:`since`},Q(e.time-n.since)))),J(`div`,{class:`cd-small`},xv(e,n.b)),J(`div`,{class:`cd-small cd-faint`},`Click to go there`)))}},CS=e=>e.replace(/^./,e=>e.toUpperCase());function wS(e){let t=new Set([e]),n=e=>{if(e)for(let r of e.inputs)`item`in r&&(t.add(r.item),n(r.from))};return n(fy(e).from),t}function TS(e,t){switch(t.kind){case`first`:{let e=yp(t.item,`mark item`);return{text:`First ${ay(e)}`,icon:e}}case`night`:return{text:`First night short`,icon:`moon`,bad:!0};case`truck`:return{text:t.n===2?`Second truck`:`First truck`,icon:`truck`};case`second`:{let e=yp(t.type,`mark building`);return{text:`Second ${oy(e)}`,icon:e}}case`loop`:{let e=yp(t.item,`mark item`);return{text:`${CS(ay(e))} loop closed`,icon:e}}case`goal`:{let n=e.scenario.goals[yp(t.goal,`mark goal`)];return n.kind===`deliver`?{text:`${n.n} ${ay(n.item)}`,icon:n.item,gold:!0}:n.kind===`rate`?{text:`${n.perMin} ${ay(n.item)} a minute`,icon:n.item,gold:!0}:{text:`Soil ${n.min}+`,icon:`soil`,gold:!0}}}}var ES=(e,t)=>((e-1)*24+t-7)*Tp;function DS(e,t){let n=e.run,r=Lp(e.scenario),i=e.scenario.goals.find(e=>e.kind===`deliver`),a=Math.max(1,i&&i.kind===`deliver`?i.n:0,...n.curve),o=Math.max(t,Math.min(e.scenario.par,t*1.15))*1.04,s=e=>50+e/o*1e3,c=e=>314-e/a*240,l=[],u=e.scenario.weather;for(let e=0;ES(e,u.sunset)<o;e++){let t=Math.max(0,ES(e,u.sunset)),n=Math.min(o,ES(e+1,u.sunrise));n>t&&l.push(Y(`rect`,{x:s(t),y:74,width:s(n)-s(t),height:240,class:`night`}))}for(let e of n.nights){if(e.short<=0)continue;let n=Math.max(0,ES(e.day,u.sunset)),r=Math.min(t,ES(e.day+1,u.sunrise));r>n&&l.push(Y(`rect`,{x:s(n),y:320,width:Math.max(4,s(r)-s(n)),height:6,rx:3,class:`short`}))}let d=n.curve.map((e,r)=>[s(Math.min(t,r*n.curveStep)),c(e)]);if(d.length){let e=d.map(([e,t])=>`${e.toFixed(1)},${t.toFixed(1)}`).join(` `);l.push(Y(`polygon`,{points:`${d[0][0]},314 ${e} ${d[d.length-1][0]},314`,class:`area`})),l.push(Y(`polyline`,{points:e,class:`curve`}))}for(let e of[.5,1])l.push(Y(`text`,{x:38,y:c(a*e)+4,"text-anchor":`end`},String(Math.round(a*e))));let f=o>3e3?1200:600;for(let e=0;e<=o;e+=f)l.push(Y(`text`,{x:s(e),y:348,"text-anchor":e?`middle`:`start`},Q(e)));!e.scenario.sandbox&&e.scenario.par<=o&&(l.push(Y(`line`,{x1:s(e.scenario.par),x2:s(e.scenario.par),y1:54,y2:314,class:`gold`})),l.push(Y(`text`,{x:s(e.scenario.par),y:48,"text-anchor":`middle`,class:`gold-t`},`gold ${Q(e.scenario.par)}`)));let p=r?wS(r):new Set,m=e=>({goal:0,night:1,loop:2,second:3,truck:4,first:5})[e.kind],h=[];for(let r of n.marks.filter(n=>n.t<=t+1&&(n.kind!==`first`||n.item!==void 0&&p.has(n.item))&&(n.kind!==`truck`||n.n===2)&&(n.kind!==`goal`||n.goal===void 0||e.scenario.goals[n.goal]?.kind!==`soil`)).sort((e,t)=>m(e)-m(t)||e.t-t.t))h.length<8&&h.every(e=>Math.abs(s(e.t)-s(r.t))>=70)&&h.push(r);let g=h.sort((e,t)=>e.t-t.t),_=e=>n.curve[Math.max(0,Math.min(n.curve.length-1,Math.round(e/n.curveStep)))]??0,v=g.map((t,n)=>{let r=TS(e,t),i=s(t.t),a=c(_(t.t)),o=n%2==0?-1:1,u=Math.max(14,Math.min(344,a+o*46));return l.push(Y(`line`,{x1:i,x2:i,y1:a,y2:u-o*4,class:`leader`})),l.push(Y(`text`,{x:i+8,y:u+(o<0?-2:12),class:`ms`},r.text,Y(`tspan`,{class:`t`,dx:6},t.kind===`night`?`day ${t.n} · ${Q(t.t)}`:Q(t.t)))),J(`span`,{class:`mi${r.bad?` is-bad`:``}${r.gold?` is-gold`:``}`,style:`left: ${i/1110*100}%; top: ${a/358*100}%`,title:r.text},X(r.icon,r.gold?30:24))});return J(`div`,{class:`run-chart`},Y(`svg`,{class:`cd-chart`,viewBox:`0 0 1110 358`,width:`100%`,"aria-label":`The goal good delivered over the run, with milestones`},...l),...v)}function OS(e,t){let n=e.run,r=[],i=Up(n).filter(e=>[`input`,`power`,`lowpower`,`blocked`,`noroute`].includes(e.status)&&e.share>=.05&&G[e.type].category===`processing`)[0]??Up(n).find(e=>[`input`,`power`,`lowpower`].includes(e.status)&&e.share>=.05)??null,a=``;if(i){let n=G[i.type].name,o=Object.keys(Nf).find(e=>Nf[e].name.toLowerCase()===i.need)??null,s=i.status===`input`?`${n} waiting on ${i.need.split(` (`)[0]}`:i.status===`blocked`||i.status===`noroute`?`${n} full of ${i.need}`:`${n} short of power`,c=o&&i.status===`input`?`The valley made ${ny((e.made[o]??0)/Math.max(1,t/60))} ${ay(o)} a minute over the run.`:i.status===`input`?`It waited most for this.`:i.status===`blocked`||i.status===`noroute`?`Nothing took its goods away fast enough.`:`Its network gave it less than it needed.`;r.push(J(`div`,{class:`fac`},J(`b`,null,X(o??(i.status===`input`?i.type:`bolt`),24),s),J(`span`,{class:`big cd-bad`},iy(i.share)),J(`div`,{class:`full`},J(`div`,{class:`cd-bar`,style:`--v: ${i.share}; --col: var(--rust)`},J(`i`)),J(`div`,{class:`cd-small`},c)))),a=i.status===`input`?`more ${i.need.split(` (`)[0]} reaching the ${oy(i.type)} would have shortened the run most.`:i.status===`blocked`||i.status===`noroute`?`taking ${i.need} away from the ${oy(i.type)} sooner would have kept it working.`:`more power for the ${oy(i.type)} would have kept it working.`}let o=n.nights.filter(n=>ES(n.day,e.scenario.weather.sunset)<t),s=o.filter(e=>e.short>0);if(o.length){let e=[...new Set(s.flatMap(e=>e.types))].map((e,t)=>t?oy(e):G[e].name);r.push(J(`div`,{class:`fac`},J(`b`,null,X(`moon`,24),`Nights short of power`),J(`span`,{class:`big`},String(s.length),J(`small`,null,` of ${o.length}`)),J(`div`,{class:`full`},J(`div`,{class:`nights`},...o.map(e=>J(`i`,{class:e.short>0?`is-short`:``}))),J(`div`,{class:`cd-small`},s.length?`${e.length?`${e.length>1?`${e.slice(0,-1).join(`, `)} and ${e[e.length-1]}`:e[0]} went short`:`Networks went short`} for ${Q(s.reduce((e,t)=>e+t.short,0))} of play in all, at night.`:`No night was short of power.`)))),!a&&s.length>o.length/2&&(a=`more power stored for the night would have kept the machines running.`)}if(n.trucks.total>0){let e=n.trucks.wait/n.trucks.total,t=Object.entries(n.trucks.at).sort((e,t)=>t[1]-e[1])[0];r.push(J(`div`,{class:`fac`},J(`b`,null,X(`truck`,24),`Trucks idle`),J(`span`,{class:`big`},iy(e)),J(`div`,{class:`full`},J(`div`,{class:`cd-bar`,style:`--v: ${e}; --col: var(--ink-3)`},J(`i`)),J(`div`,{class:`cd-small`},t?`Waiting at stops, most at the ${oy(t[0])}.`:`They rarely waited at a stop.`))))}return a&&r.push(J(`div`,{class:`cd-small next`},J(`b`,null,`Next time`),` · ${a}`)),r}function kS(e,t,n){let r=e.scenario,i=e.completedAt??e.time,a=r.par,o=p_.findIndex(e=>e.id===r.id),s=o>=0?p_[o+1]??null:null,c=t===`gold`?`${Q(a-i)} inside gold`:t===`silver`?`gold needs ${Q(a)}: ${Q(i-a)} faster`:`silver needs ${Q(a*l_)}: ${Q(i-a*l_)} faster`,l=Object.keys(e.delivered).filter(t=>e.delivered[t]).sort((t,n)=>(e.delivered[n]??0)*Nf[n].price-(e.delivered[t]??0)*Nf[t].price),u=Lp(r),d=r.goals.find(e=>e.kind===`deliver`),f=dm(e)-e.initialTrees,p=e.buildings.filter(e=>e.type===`sapling`).length,m=fh(e),h=r.goals.find(e=>e.kind===`soil`),g=e.map.fertility.reduce((t,n,r)=>t+n-e.soilBase[r],0)>=0,_=f>=0&&g&&(!h||h.kind!==`soil`||m>=h.min);return J(`div`,{class:`results`},J(`div`,{class:`glow`}),J(`div`,{class:`hero`},J(`span`,{class:`cd-medal big${t===`silver`?` is-silver`:t===`bronze`?` is-bronze`:``}`},X(`medal`,76,`white`)),J(`div`,{class:`cd-label`},`${ky[t]} · ${o>=0?`commission ${o+1}`:`commission`} complete`),J(`h1`,{class:`cd-display`},r.name),J(`div`,{class:`time`},J(`div`,{class:`num`},J(`div`,{class:`v`},Q(i)),J(`div`,{class:`sub`},c)),J(`div`,{class:`line`},J(`div`,{class:`cd-bar`,style:`--v: ${Math.min(1,i/(a*l_))}; --col: var(--medal-${t===`gold`?`gold`:t===`silver`?`silver`:`bronze`})`},J(`i`),J(`span`,{class:`cd-bar__mark`,style:`left: ${(100/l_).toFixed(2)}%`}),J(`span`,{class:`cd-bar__mark is-silver`,style:`left: calc(100% - 3px)`})),J(`div`,{class:`ticks`},J(`span`,null,`0:00`),J(`span`,{class:`gold`},`gold ${Q(a)}`),J(`span`,null,`silver ${Q(a*l_)}`))))),J(`div`,{class:`cd-receipt`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`},`Freight depot · receipt`),X(`depot`,30)),J(`div`,{class:`cd-small`},`${r.name} · 0:00 to ${Q(i)}`),J(`div`,{class:`rows`},...l.slice(0,8).map(t=>J(`div`,{class:`cd-receipt__row`},X(t),J(`span`,null,Nf[t].name),J(`span`,{class:`cd-small`},`${ty(e.delivered[t]??0)} × ${Nf[t].price}`),J(`b`,null,ty((e.delivered[t]??0)*Nf[t].price))))),l.length>8?J(`div`,{class:`cd-small`},`and ${l.length-8} more goods`):null,J(`div`,{class:`cd-receipt__total`},J(`span`,null,`Earned`),J(`span`,null,`${ty(e.earned)} credits`))),J(`div`,{class:`cd-card run`},J(`div`,null,J(`div`,{class:`row-head`},J(`div`,null,J(`div`,{class:`cd-label`,style:`color: var(--ochre)`},`The run`),J(`h2`,{class:`cd-title`,style:`margin-top: 8px`},u&&d&&d.kind===`deliver`?`${d.n} ${ay(u)} over ${Math.round(i/60)} minutes`:`${Math.round(i/60)} minutes`)),J(`span`,{class:`cd-small legend`},u?`${ay(u)} delivered · nights shaded`:`nights shaded`,J(`i`,{class:`short`}),`night short of power`)),u?DS(e,i):J(`p`,{class:`cd-small`},`No good to chart.`)),J(`div`,{class:`sep`}),J(`div`,{class:`diff`},J(`div`,{class:`cd-label`,style:`color: var(--ochre)`},`What made the difference`),...OS(e,i),J(`span`,{class:`fill`}),J(`div`,{class:`cd-inset valley`},Cy({v:m/100,d:64,w:6,col:`var(--tide)`,inner:[J(`b`,null,String(Math.round(m)))]}),J(`div`,{class:`fill`},J(`div`,{class:`cd-label`,style:`color: var(--pine)`},_?`The valley, left better`:`The valley, after the run`),J(`div`,{class:`what`},`Soil ${Math.round(m)} at the end · trees ${f>=0?`+`:``}${f}`),J(`div`,{class:`cd-small`},[h&&h.kind===`soil`?`Goal was ${h.min}+.`:``,p?`${p} sapling${p>1?`s`:``} still growing.`:``].filter(Boolean).join(` `))),X(`sapling`,40)))),J(`div`,{class:`buttons`},J(`button`,{class:`cd-btn is-lg`,onclick:n.keepPlaying},`Keep playing`),s?J(`button`,{class:`cd-btn is-primary is-lg`,onclick:()=>n.start(s.id)},`Next commission · ${s.name}`,X(`play`,14,`inv`)):null,J(`button`,{class:`cd-btn is-lg`,onclick:n.menu},`Level select`)))}var AS=3e4,jS=16384;function MS(e,t){let n=Math.max(1,Math.ceil(e.length*t)),r=0;for(let t=e.length-n;t<e.length;t++)r+=e[t];return 1e3/(r/n)}var NS=class{times=new Float64Array(jS);next=0;count=0;total=0;get length(){return this.count}at(e){return this.times[(this.next-this.count+e+jS)%jS]}add(e){for(this.count===jS?this.total-=this.times[this.next]:this.count++,this.times[this.next]=e,this.next=(this.next+1)%jS,this.total+=e;this.count>1&&this.total-this.at(0)>=3e4;)this.total-=this.at(0),this.count--}clear(){this.next=0,this.count=0,this.total=0}summary(){if(this.count===0)return null;let e=Float64Array.from({length:this.count},(e,t)=>this.at(t)).sort();return{frames:this.count,average:this.count/(this.total/1e3),low1:MS(e,.01),low01:MS(e,.001)}}},PS=240,FS=50,IS=[1e3/60,1e3/30],LS=e=>e>=100?String(Math.round(e)):e.toFixed(1),RS=class{el=J(`div`,{class:`hud-perf`,hidden:!0,"aria-hidden":`true`});mode=`off`;rate=J(`b`);frameMs=J(`span`);average=J(`b`);low1=J(`b`);low01=J(`b`);graph=J(`canvas`,{width:480,height:128});times=new NS;prev=null;counted=0;countFrom=0;colors={bar:``,over:``,guide:``};constructor(e){document.addEventListener(`visibilitychange`,()=>{this.prev=null,this.times.clear()}),e.listen(e=>{e.frameStats!==this.mode&&this.show(e.frameStats)})}show(e){this.mode=e,this.el.hidden=e===`off`,this.el.classList.toggle(`is-full`,e===`full`),this.times.clear(),this.prev=null,this.counted=0,Z(this.rate,`–`),Z(this.frameMs,``);for(let e of[this.average,this.low1,this.low01])Z(e,`–`);if(e===`full`){let e=getComputedStyle(document.documentElement),t=t=>e.getPropertyValue(t).trim();this.colors={bar:t(`--pine`),over:t(`--rust`),guide:t(`--chalk-3`)}}let t=J(`div`,{class:`rate`},this.rate,J(`small`,null,`FPS`),e===`full`?this.frameMs:null);if(e===`minimal`)Xv(this.el,J(`div`,{class:`cd-pill`},t));else if(e===`full`){let e=(e,t)=>J(`div`,{class:`row`},J(`span`,null,e),t);Xv(this.el,J(`div`,{class:`cd-card perf-card`},t,J(`div`,{class:`graph`},this.graph,J(`small`,{class:`cd-small`},`Frame time · lines at 60 and 30 FPS`)),J(`div`,{class:`stats`},e(`Average`,this.average),e(`1% low`,this.low1),e(`0.1% low`,this.low01)),J(`small`,{class:`cd-small`},`Over the last ${AS/1e3} s`)))}else Xv(this.el)}frame(e){if(this.mode===`off`)return;if(this.prev===null){this.prev=e,this.counted=0,this.countFrom=e;return}let t=e-this.prev;if(this.prev=e,this.counted++,this.mode===`full`&&(this.times.add(t),this.draw()),e-this.countFrom<1e3)return;let n=e-this.countFrom;if(Z(this.rate,LS(this.counted/(n/1e3))),Z(this.frameMs,`${(n/this.counted).toFixed(1)} ms`),this.counted=0,this.countFrom=e,this.mode!==`full`)return;let r=this.times.summary();r&&(Z(this.average,LS(r.average)),Z(this.low1,LS(r.low1)),Z(this.low01,LS(r.low01)))}draw(){let e=this.graph.getContext(`2d`);if(!e)return;let t=e=>128*(1-Math.min(e,FS)/FS);e.clearRect(0,0,480,128),e.fillStyle=this.colors.guide;for(let n of IS)e.fillRect(0,Math.round(t(n))-1,480,2);let n=Math.min(PS,this.times.length),r=this.times.length-n;for(let i=0;i<n;i++){let a=this.times.at(r+i),o=t(a),s=(PS-n+i)*2;e.fillStyle=a>FS?this.colors.over:this.colors.bar,e.fillRect(s,o,2,128-o)}}},zS=[0,5,10,30,60];function BS(e){return e.gap===null?e.arrivals===1?`one truck`:`no truck`:Q(e.gap)}var VS=class{el=J(`div`,{class:`cd-card side-card routes-card`,hidden:!0});list=J(`div`,{class:`side-body`});sub=J(`div`,{class:`cd-small`});warn=J(`p`,{class:`cd-small cd-bad`});filterEl=J(`input`,{class:`cd-input`,placeholder:`Find a route, stop or good…`,spellcheck:!1,oninput:()=>{this.filter=this.filterEl.value,this.key=``},onkeydown:e=>{e.key===`Escape`&&(this.filterEl.value=``,this.filter=``,this.key=``,this.filterEl.blur(),e.stopPropagation())}});foot=J(`div`,{class:`cd-small routes-foot`});filter=``;key=``;updater=null;allGoods=new Set;host;constructor(e){this.host=e,this.el.append(J(`div`,{class:`side-head`},X(`route`,40),J(`div`,{class:`grow`},J(`h2`,{class:`cd-title`},`Routes`),this.sub),J(`button`,{class:`cd-btn is-sm`,title:`Make a route, then click buildings on the map to add its stops`,onclick:()=>this.edit(t_(this.host.state()))},`+ New route`),ab(J(`button`,{class:`cd-btn is-icon is-sm`,"aria-label":`Guide`,onclick:()=>this.host.openGuide({kind:`topic`,id:`trucks`})},X(`book`,18)),()=>ib(`Trucks and routes in the guide`,...tb(`guide`))),ab(J(`button`,{class:`cd-btn is-icon is-sm`,"aria-label":`Close`,onclick:()=>this.host.close()},X(`close`,14)),()=>ib(`Close`,...tb(`routes`),`Esc`))),this.warn,this.filterEl,this.list,this.foot)}get open(){return!this.el.hidden}refresh(){this.key=``}edit(e){this.host.setTool({kind:`route`,route:e.id}),this.key=``}done(){this.host.setTool({kind:`select`}),this.key=``}update(e){if(this.el.hidden=!e,!e){this.key=``,this.updater=null;return}let t=this.host.state(),n=this.host.tool(),r=n.kind===`route`?n.route:null,i=JSON.stringify([xp(t).routesVersion,t.routes.map(e=>[e.id,Hx(t,e),_v(t,e),e.id===r?e.stops.map(e=>{let n=am(t,e.building);return n?.type===`silo`?Object.keys(n.store):n?.type===`field`?[n.crop,n.harvest]:null}):0]),t.trucks.filter(e=>e.route===null).length,t.buildings.filter(e=>e.type===`garage`).length,this.filter,r,[...this.allGoods]]);if(i!==this.key&&!Kx(this.el)){this.key=i,this.host.previewRoute(null);let e=[],n=this.filter.trim().toLowerCase(),a=t.routes.filter(e=>e.id===r||!n||[e.name,Vx(t,e),Hx(t,e).map(ay).join(` `)].some(e=>e.toLowerCase().includes(n)));this.filterEl.hidden=t.routes.length<=4&&!n;let o=t.trucks.filter(e=>e.route===null).length;Z(this.warn,o?`${sy(o,`truck`)} ${o>1?`have`:`has`} no route: + on a route puts ${o>1?`one`:`it`} to work.`:``),this.warn.hidden=!o,Xv(this.list,...a.length?a.map(n=>n.id===r?this.openRoute(t,n,e):this.closedRoute(t,n,e)):[J(`p`,{class:`cd-small`},t.routes.length?`No route matches.`:t.buildings.some(e=>e.type===`garage`)?`No routes yet. Make one, click the buildings it stops at, and give it trucks.`:`No routes yet. Build a garage (T) for trucks, then make a route. Buildings that share an edge trade goods without trucks.`)]),this.updater=()=>{for(let t of e)t()}}Z(this.sub,`${sy(t.routes.length,`route`)} · ${sy(t.trucks.length,`truck`)}`);let a=t.buildings.filter(e=>e.type===`garage`);Z(this.foot,a.length?`${sy(a.length,`garage`)} · ${t.trucks.length} of ${a.length*q.perGarage} bays · ${q.chargeRate} W a truck charging`:`No garage yet: trucks are bought at one.`),this.updater?.()}addTruck(e,t){let n=e.trucks.find(e=>e.route===null);if(n)return Zg(e,n,t);let r=e.buildings.filter(e=>e.type===`garage`);if(!r.length)return _p(`Build a garage (T) first: trucks are bought there.`);let i=r.find(t=>e.trucks.filter(e=>e.garage===t.id).length<q.perGarage);if(!i)return _p(`Every garage holds ${q.perGarage} trucks. Build another garage for more.`);let a=Yg(e,i);return a.ok?(Zg(e,a.value.truck,t),gp({message:`Bought a truck for ${t.name}.`})):a}headLine(e,t,n,r){let i=J(`b`,{class:`cd-num rate`}),a=J(`span`,{class:`cd-status is-blocked warn`,hidden:!0});return n.push(()=>{Qv(i,ny(T_(e,t)),()=>[ny(T_(e,t)),J(`span`,{class:`cd-faint`},` /min`)]);let n=Wx(e,t);a.hidden=!n.length,Z(a,String(n.length)),a.title=n.join(`
`)}),J(`div`,{class:`route-head`},J(`span`,{class:`swatch`,style:`background: ${Bx(e,t)}`}),r,J(`span`,{class:`cd-small`},`${sy(t.stops.length,`stop`)} · ${sy(gg(e,t).length,`truck`)}`),a,J(`span`,{class:`fill`}),i)}timing(e,t,n){let r=J(`div`),i=J(`div`),a=J(`div`,{class:`cd-small cd-faint`});return n.push(()=>{let n=qh(e,t),o=gg(e,t).length;Qv(r,`${n.loop??``} ${n.driving??``}`,()=>[J(`div`,{class:`cd-label`},`Loop time`),J(`div`,{class:`v`},n.loop===null?n.driving===null?[J(`span`,{class:`cd-small`},`–`)]:[J(`span`,{class:`big`},Q(n.driving)),J(`span`,{class:`cd-small`},` driving, not seen yet`)]:[J(`span`,{class:`big`},Q(n.loop)),J(`span`,{class:`cd-small`},` a round`)])]),Qv(i,`${o} ${n.slowest?.stop} ${n.slowest?.timing.gap} ${n.slowest?.timing.arrivals}`,()=>[J(`div`,{class:`cd-label`},`Between trucks`),J(`div`,{class:`v`},!o||!n.slowest?[J(`span`,{class:`cd-small`},`no trucks`)]:n.slowest.timing.gap===null?[J(`span`,{class:`big`},BS(n.slowest.timing)),J(`span`,{class:`cd-small`},` at stop ${n.slowest.stop+1} in ${Q(n.window)}`)]:[J(`span`,{class:`big`},Q(n.slowest.timing.gap)),J(`span`,{class:`cd-small`},` at stop ${n.slowest.stop+1}, the slowest`)])]),Z(a,`Measured over the last ${Q(n.window)} of play. Between trucks: the average gap between arrivals at the stop trucks reach least often.`)}),[J(`div`,{class:`route-timing`},r,i),a]}closedRoute(e,t,n){let r=Hx(e,t);return J(`div`,{class:`route-card`,title:`Click to open`,role:`button`,tabindex:0,"aria-label":`Open ${t.name}`,onpointerenter:()=>this.host.previewRoute(t.id),onpointerleave:()=>this.host.previewRoute(null),onclick:()=>this.edit(t),onkeydown:e=>{e.target!==e.currentTarget||e.key!==`Enter`&&e.key!==` `||(e.preventDefault(),e.stopPropagation(),this.edit(t))}},this.headLine(e,t,n,J(`b`,{class:`name`},t.name)),J(`div`,{class:`cd-small stops`},Vx(e,t)||`No stops yet`),r.length?J(`div`,{class:`chips`},...r.flatMap((e,t)=>[t?J(`span`,{class:`cd-faint`},`·`):null,J(`span`,{class:`cd-chip`},X(e,18),ay(e))])):null,...this.timing(e,t,n).slice(0,1))}openRoute(e,t,n){let r=gg(e,t),i=J(`input`,{class:`route-name-input`,value:t.name,maxLength:24,title:`Click to rename`,spellcheck:!1,"aria-label":`Route name`,onchange:()=>{let n=$g(e,t,i.value);n.ok||(i.value=t.name),this.host.did(n)},onkeydown:e=>{e.key===`Escape`&&(i.value=t.name,e.stopPropagation()),(e.key===`Enter`||e.key===`Escape`)&&i.blur()}}),a=_v(e,t),o=new Set;for(let n of t.stops){let t=am(e,n.building);if(t&&!G[t.type].stores){for(let e of n.pick)Hh(t).includes(e)&&o.add(e);for(let e of n.drop)zh(t).includes(e)&&o.add(e)}}let s=t.stops.map((n,r)=>{let i=am(e,n.building);if(!i)return null;let s=this.allGoods.has(`${t.id}:${r}`),c=!!G[i.type].stores,l=(e,t)=>c&&!s?Mf.filter(e=>o.has(e)||n.pick.includes(e)||i.type===`silo`&&i.store[e]):Mf.filter(r=>e.includes(r)||n[t].includes(r)),u=(i,a)=>J(`button`,{class:`cd-gtoggle is-sm`,"aria-pressed":String(n[a].includes(i)),"aria-label":`${a===`drop`?`Drop`:`Pick up`} ${ay(i)}`,title:`${Nf[i].name}: ${n[a].includes(i)?`click to stop`:`click to start`} ${a===`drop`?`dropping it`:`picking it up`} here`,onclick:()=>this.host.did(s_(e,t,r,i,n[a].includes(i)?null:a))},X(i,20)),d=(e,t,r)=>{let i=l(r,t),a=c&&!s?n[t].filter(e=>!i.includes(e)).length:0;return[J(`span`,{class:`cd-label`},e),...i.map(e=>u(e,t)),i.length?null:J(`span`,{class:`cd-small cd-faint`},`nothing`),a?J(`span`,{class:`cd-small`},`+ ${a} more`):null]},f=zS.includes(n.wait)?zS:[...zS,n.wait].sort((e,t)=>e-t);return J(`div`,{class:`stop`},J(`span`,{class:`num`,style:`background: ${Bx(e,t)}`},String(r+1)),J(`div`,{class:`top`},J(`b`,null,G[i.type].name),J(`span`,{class:`fill`}),J(`span`,{class:`tseg`,title:`How long a truck waits here for room or goods`},...f.map(i=>J(`button`,{class:i===n.wait?`is-on`:``,onclick:()=>this.host.did(c_(e,t,r,i))},i===n.wait?`${i} s`:String(i)))),J(`span`,{class:`moves`},J(`button`,{title:`Earlier`,"aria-label":`Move earlier`,disabled:r===0,onclick:()=>this.host.did(o_(e,t,r,-1))},`↑`),J(`button`,{title:`Later`,"aria-label":`Move later`,disabled:r===t.stops.length-1,onclick:()=>this.host.did(o_(e,t,r,1))},`↓`),J(`button`,{title:`Take this stop out`,"aria-label":`Remove stop`,onclick:()=>this.host.did(a_(e,t,r))},`×`))),a[r]?J(`div`,{class:`cd-small cd-bad problem`},a[r]):null,J(`div`,{class:`goods`},...d(`Drop`,`drop`,zh(i)),i.type===`depot`?null:J(`span`,{class:`sep`}),...i.type===`depot`?[]:d(`Pick up`,`pick`,Hh(i)),c?J(`button`,{class:`link more`,onclick:()=>{s?this.allGoods.delete(`${t.id}:${r}`):this.allGoods.add(`${t.id}:${r}`),this.key=``}},s?`fewer goods`:`every good`):null))}),c=r.map(r=>{let i=J(`div`,{class:`cd-bar`,style:`--col: var(--ink-3)`},J(`i`)),a=J(`span`,{class:`cd-small`}),o=J(`div`,{class:`cd-small`}),s=J(`div`),c=J(`button`,{class:`cd-btn is-ghost is-sm`,title:`Throw its cargo away (the goods are lost), so it has room again`,onclick:()=>this.host.did(Qg(r))},`Dump`);return n.push(()=>{let n=Jh(e,r,t.id);Zv(i,`--v`,(n.idle??0).toFixed(3)),Qv(a,String(n.idle===null?``:Math.round(n.idle*100)),()=>n.idle===null?[`–`]:[J(`b`,null,iy(n.idle)),` idle`]),Z(o,`${bv(e,r)}${r.cargo.length&&r.phase!==`drive`?` · carries ${yv(r.cargo)}`:``}`),c.disabled=!r.cargo.length;let l=gv(e,r);Qv(s,l.join(`|`),()=>l.map(e=>J(`div`,{class:`cd-small cd-bad`},e)))}),J(`div`,{class:`route-truck`},J(`div`,{class:`line`},X(`truck`,28),J(`button`,{class:`link`,onclick:()=>this.host.selectTruck(r.id)},Ux(e,r)),i,a,c),o,s)}),l=J(`div`,{class:`cd-small`});return n.push(()=>Z(l,Gx(e,t))),J(`div`,{class:`route-card is-open`,style:`--route: ${Bx(e,t)}`},this.headLine(e,t,n,i),J(`div`,{class:`stops-list`},...s.length?s:[J(`p`,{class:`cd-small`},`No stops yet.`)]),J(`div`,{class:`cd-small add-hint`},t.stops.length<q.maxStops?`+ Click a building on the map to add a stop · ${t.stops.length} of ${q.maxStops}`:`${q.maxStops} stops: the most a route can have`),...this.timing(e,t,n),J(`div`,{class:`route-trucks`},J(`div`,{class:`line`},J(`span`,{class:`cd-label`},`Trucks`),J(`span`,{class:`fill`}),J(`button`,{class:`cd-btn is-sm is-icon`,title:`Send a truck home`,"aria-label":`Send a truck home`,disabled:!r.length,onclick:()=>this.host.did(Zg(e,r[r.length-1],null))},`−`),J(`b`,{class:`cd-num`},String(r.length)),J(`button`,{class:`cd-btn is-sm is-icon`,title:`Add a truck: one with no route, else a new one`,"aria-label":`Add a truck`,onclick:()=>this.host.did(this.addTruck(e,t))},`+`)),l,...c),J(`div`,{class:`side-foot`},J(`button`,{class:`cd-btn is-danger is-sm`,onclick:()=>{this.host.did(n_(e,t)),this.done()}},X(`trash`,16),`Delete`),J(`button`,{class:`cd-btn is-ghost is-sm`,title:`A copy of this route, without its trucks`,onclick:()=>{let n=e_(e,t);this.host.toast(`Copied ${t.name} as ${n.name}. Give it trucks.`),this.edit(n)}},`Copy`),J(`button`,{class:`cd-btn is-primary is-sm`,onclick:()=>this.done()},`Done`)))}},HS=class{els=[];parent;make;constructor(e,t){this.parent=e,this.make=t}show(e,t,n,r){for(;this.els.length<e.length;){let e=this.make();this.els.push(e),this.parent.append(e)}this.els.forEach((i,a)=>{let o=e[a];if(i.hidden=!o,!o)return;let s=n(o);i.style.left=`${Math.round(s.sx/t)}px`,i.style.top=`${Math.round(s.sy/t)}px`,r(i,o)})}},US=class{el=J(`div`,{class:`ui-world`});z=1;markers=new HS(this.el,()=>J(`span`,{class:`mk`},J(`i`)));nets=new HS(this.el,()=>J(`span`,{class:`cd-callout net-tag`},J(`i`,{class:`sw`}),J(`b`),J(`small`)));stops=new HS(this.el,()=>J(`span`,{class:`stop-disc`}));trucks=new HS(this.el,()=>J(`span`,{class:`cd-callout is-ink truck-tag`},X(`truck`,26),J(`b`),J(`small`)));forecast=J(`div`,{class:`cd-card is-ink forecast`,hidden:!0});forecastKey=``;hover=J(`div`,{class:`cd-card hover`,hidden:!0});hoverKey=``;constructor(){this.el.append(this.forecast,this.hover)}setZoom(e){this.z=e}setMarkers(e){this.markers.show(e,this.z,e=>e,(e,t)=>{let n=Ty(t.status),r=`mk ${n.cls}${n.outline?` is-outline`:``}`;e.className!==r&&(e.className=r),n.col?e.style.setProperty(`--col`,n.col):e.style.removeProperty(`--col`)})}setNetLabels(e){this.nets.show(e,this.z,e=>e,(e,t)=>{let[n,r,i]=e.children,a=t.net,o=a.share<1&&a.wanted>0;n.style.background=ly(t.colour),Z(r,ry(a.made)),Z(i,`${ry(Yh(a))} used${a.capacity?` · ${iy(a.stored/a.capacity)} stored`:``}${o?` · short, ${iy(a.share)}`:``}`),e.classList.toggle(`is-short`,o)})}setStopLabels(e){this.stops.show(e,this.z,e=>e,(e,t)=>{e.style.background=ly(t.colour),Z(e,t.text)})}setTruckTags(e){this.trucks.show(e,this.z,e=>e,(e,t)=>{let[,n,r]=e.children;Z(n,t.name),Z(r,t.what)})}setPlacement(e,t){if(this.forecast.hidden=!t,!t){this.forecastKey=``;return}this.forecast.style.left=`${Math.round(t.sx/this.z)}px`,this.forecast.style.top=`${Math.round(t.sy/this.z)}px`;let n=`${t.type} ${t.x} ${t.y} ${t.count} ${t.crop} ${t.recipe} ${Math.floor(e.time*2)} ${e.credits>=Pg(e,t.type)}`;if(n===this.forecastKey)return;this.forecastKey=n;let r=G[t.type],i=Pg(e,t.type),a=Ig(e,t.type,t.x,t.y),o=a.ok?yy(e,t.type,t.x,t.y,t):null;Xv(this.forecast,J(`div`,{class:`head`},X(t.type),J(`b`,null,t.count>1?`${t.count} × ${r.name.toLowerCase()}`:`A${/^[aeiou]/i.test(r.name)?`n`:``} ${r.name.toLowerCase()} here`),J(`span`,{class:`cd-small`,style:`margin-left: auto`},i?`${ty(i*t.count)} credits`:`free`)),o&&o.facts.length?J(`div`,{class:`facts`},...o.facts.map(e=>J(`div`,null,J(`div`,{class:`cd-label`},e.label),J(`div`,{class:`v${e.tone===`bad`?` is-bad`:``}`},e.value,e.then===void 0?null:J(`small`,null,` → ${e.then}`)),J(`div`,{class:`cd-small`},e.sub)))):null,o&&o.next.length?J(`div`,{class:`next cd-small`},...o.next.map(e=>J(`div`,null,e))):null,a.ok?null:J(`div`,{class:`why cd-small`},a.error))}setHover(e,t){if(this.hover.hidden=!e||!t,!e||!t)return;let n=t.x/this.z;this.hover.style.left=`${Math.round(n)}px`,this.hover.style.top=`${Math.round(t.y/this.z)}px`,this.hover.classList.toggle(`is-left`,n+420>this.el.clientWidth);let r=JSON.stringify(e);r!==this.hoverKey&&(this.hoverKey=r,Xv(this.hover,J(`div`,{class:`head`},e.icon?X(e.icon):null,e.title),e.status?Oy(e.status.status,e.status.label):null,e.text?J(`p`,{class:`cd-small`},e.text):null))}},WS=class{host;ui=J(`div`,{class:`ui cd-root`});world=new US;hud=J(`div`,{class:`ui-hud`});commission;top;view;controls;dock;toasts=J(`div`,{class:`toasts`});tip=J(`div`);above=J(`div`,{class:`hud-above`},this.toasts,this.tip);tipFor=null;zoom=1;side;sheets=J(`div`,{class:`ui-sheets`});problems;perf;modals=[];routesOpen=!1;get routesShown(){return this.routesOpen||this.host.tool().kind===`route`}routes;lastSlow=0;constructor(e,t){this.host=t;let n={state:()=>t.state(),settings:()=>t.settings.get(),speed:()=>t.speed(),setSpeed:e=>t.setSpeed(e),overlay:()=>t.overlay(),setOverlay:e=>t.setOverlay(e),turn:e=>t.turn(e),zoom:e=>t.zoom(e),openPause:()=>this.openPause(),panelOpen:e=>this.panelOpen(e),togglePanel:e=>this.togglePanel(e)};this.commission=new db(n),this.top=new pb(n),this.view=new hb(n),this.controls=gb(n),this.side=new Yx({state:()=>t.state(),tool:()=>t.tool(),selected:()=>t.selected(),select:e=>{t.select(e),this.refresh()},did:e=>this.did(e),openGuide:e=>this.openGuide(e),editRoute:e=>this.edit(e)}),this.routes=new VS({state:()=>t.state(),tool:()=>t.tool(),setTool:e=>t.setTool(e),did:e=>this.did(e),toast:(e,t)=>this.toast(e,t),openGuide:e=>this.openGuide(e),previewRoute:e=>t.previewRoute(e),selectTruck:e=>{this.routesOpen=!1,t.tool().kind===`route`&&t.setTool({kind:`select`}),t.select(e),this.refresh()},close:()=>{this.routesOpen=!1,t.previewRoute(null),t.tool().kind===`route`&&t.setTool({kind:`select`})}}),this.problems=new SS(e=>t.focus(e)),this.dock=new Ib({state:()=>t.state(),tool:()=>t.tool(),setTool:e=>t.setTool(e),choose:e=>t.choose(e),tip:e=>this.showTip(e)}),this.perf=new RS(t.settings),this.hud.append(this.perf.el,this.commission.el,this.commission.pill,this.top.el,this.view.el,this.controls,this.dock.el,this.side.el,this.routes.el,this.problems.el,this.problems.popover,this.above),this.ui.append(this.world.el,this.hud,this.sheets),e.append(this.ui),t.settings.listen(e=>{this.ui.classList.toggle(`is-calm`,e.reduceMotion),this.fit(),this.lastSlow=0}),addEventListener(`resize`,()=>this.fit()),this.refresh()}get modal(){return this.modals.some(e=>e.blocking)}fit(){this.zoom=cS(this.host.settings.get(),innerWidth,innerHeight),this.ui.style.zoom=String(this.zoom),this.ui.style.width=`${innerWidth/this.zoom}px`,this.ui.style.height=`${innerHeight/this.zoom}px`,this.world.setZoom(this.zoom),this.view.el.classList.remove(`is-compact`),requestAnimationFrame(()=>{let e=this.view.el.getBoundingClientRect(),t=this.dock.el.getBoundingClientRect();this.view.el.classList.toggle(`is-compact`,e.right+12>t.left)})}update(){let e=performance.now();this.top.updateButtons(),this.view.update();let t=this.host.tool();this.dock.showCategoryOf(t.kind===`build`?t.type:null),this.dock.update(),this.above.classList.toggle(`has-strip`,t.kind===`build`&&Lg(t.type).length>0);let n=this.routesShown;this.routes.update(n),this.side.update(!n);let r=this.side.open||n;if(this.top.el.hidden=r,this.controls.hidden=r,this.problems.update(this.host.state(),this.host.settings.get().problemsStrip&&!r),!(e-this.lastSlow<150)){if(this.lastSlow=e,this.commission.update(r),!this.perf.el.hidden){let e=r?this.commission.pill:this.commission.el;Zv(this.perf.el,`--perf-top`,`${e.offsetTop+e.offsetHeight+12}px`)}this.top.update(),this.modals[this.modals.length-1]?.update?.()}}showTip(e){this.tipFor=e,this.tip.replaceChildren(...e?[Lb(this.host.state(),e)]:[])}toast(e,t=!0,n){if(!e)return;let r=J(`span`,{class:`cd-toast${t?``:` is-bad`}`},X(n||(t?`check`:`warn`)),e);for(this.toasts.append(r);this.toasts.children.length>4;)this.toasts.firstElementChild?.remove();setTimeout(()=>r.classList.add(`is-gone`),2200),setTimeout(()=>r.remove(),2800)}refresh(){this.lastSlow=0,this.side.refresh(),this.routes.refresh()}picked(e){e!==null&&this.routesOpen&&this.host.tool().kind!==`route`&&(this.routesOpen=!1,this.host.previewRoute(null)),this.refresh()}panelOpen(e){return e===`ledger`||e===`power`?this.modals.some(t=>t.name===e):e===`routes`?this.routesShown:e===`guide`&&this.modals.some(e=>e.name===`guide`)}togglePanel(e){e===`ledger`||e===`power`?this.toggleSheet(e):e===`routes`?this.toggleRoutes():e===`guide`&&this.openGuide()}did(e){let t=Ng(e);t&&this.toast(t,e.ok),this.refresh(),this.host.changed()}edit(e){this.host.setTool({kind:`route`,route:e.id}),this.refresh()}toggleSheet(e){if(this.modals.some(t=>t.name===e)){this.close(e);return}this.modals=this.modals.filter(e=>e.name!==`ledger`&&e.name!==`power`);let t=e===`ledger`?tS({state:()=>this.host.state(),openPower:()=>this.toggleSheet(`power`),close:()=>this.close(`ledger`)}):vS({state:()=>this.host.state(),close:()=>this.close(`power`)});this.openModal(e,t.el,!1,t.update)}toggleRoutes(){this.routesOpen=!this.routesShown,this.routesOpen||(this.host.previewRoute(null),this.host.tool().kind===`route`&&this.host.setTool({kind:`select`})),this.refresh()}openModal(e,t,n,r,i){this.modals=this.modals.filter(t=>t.name!==e),this.modals.push({name:e,el:t,blocking:n,update:r,onClose:i}),this.drawModals()}drawModals(){let e=this.modals[this.modals.length-1];this.sheets.classList.toggle(`is-open`,!!e),this.sheets.classList.toggle(`is-live`,!!e&&!e.blocking),this.sheets.replaceChildren(...e?[J(`div`,{class:`scrim`}),J(`div`,{class:`sheet-wrap`},e.el)]:[])}closeIf(e){return this.modals[this.modals.length-1]?.name===e&&(this.close(e),!0)}closeTop(){let e=this.modals.pop();return e?(e.onClose?.(),this.drawModals(),!0):this.routesShown?(this.toggleRoutes(),!0):!1}close(e){let t=this.modals.filter(t=>t.name===e);this.modals=this.modals.filter(t=>t.name!==e);for(let e of t)e.onClose?.();this.drawModals()}openGuide(e){if(!e&&this.modals.some(e=>e.name===`guide`)){this.close(`guide`);return}let t=this.host.tool(),n=this.host.selected(),r=n===null?null:am(this.host.state(),n),i=this.tipFor??(t.kind===`build`?t.type:r?.type??null),a=e??(i?{kind:`building`,id:i}:{kind:`topic`,id:`start`});this.showTip(null),this.openModal(`guide`,jb(a,{state:()=>this.host.state(),focus:e=>this.host.focus(e),build:e=>this.host.setTool({kind:`build`,type:e,rot:t.kind===`build`?t.rot:1})},()=>this.close(`guide`)),!0)}showIntro(){this.openModal(`intro`,Bb(this.host.state(),()=>this.close(`intro`),()=>{this.close(`intro`),this.openGuide({kind:`topic`,id:`start`})}),!0)}pauseEl(){return Cb({state:()=>this.host.state(),settings:this.host.settings,resume:()=>{this.close(`pause`),this.host.resume()},menu:()=>this.host.menu(),restart:()=>this.host.restart(),openSettings:()=>this.openSettings()})}openPause(){this.openModal(`pause`,this.pauseEl(),!0)}openSettings(){this.openModal(`settings`,pS(this.host.settings,()=>this.close(`settings`)),!0,void 0,()=>{let e=this.modals.find(e=>e.name===`pause`);e&&(e.el=this.pauseEl())})}showComplete(e){this.openModal(`done`,kS(this.host.state(),e,{keepPlaying:()=>this.close(`done`),menu:()=>this.host.menu(),start:e=>this.host.start(e)}),!0)}},GS=e=>e.scenario.goals.length?e.scenario.goals.reduce((t,n,r)=>t+Math.min(1,My(e,r).v),0)/e.scenario.goals.length:0,KS={daylight:14,wind:.5,soil:60};function qS(e){let t=e.weather,n=e.terrain,r=(t.sunset-t.sunrise)*t.sun,i=(e,t,n)=>e<.85?t:e>1.15?n:`Normal`,a=(e,t,n,r,i,a)=>J(`div`,{class:`cond`},X(e,26),J(`span`,{class:`cd-label`},t),J(`span`,{class:`bar`},J(`i`,{style:`width: ${Math.max(4,Math.min(100,n*50))}%; background: ${r}`}),J(`span`,{class:`norm`})),J(`span`,{class:`val`},i,J(`small`,null,a))),o={river:`A river crosses the valley.`,ponds:`Ponds dot the valley.`,lake:`A lake lies in the valley.`,none:`There is no water.`}[n.water],s=n.forest>=.2?`Woods cover about a quarter.`:n.forest>=.1?`Woods cover about an eighth.`:n.forest>0?`A few woods.`:``;return[a(`sun`,`Sun`,r/KS.daylight,`var(--ochre)`,t.sun<.9?`Weak`:i(r/KS.daylight,`Short days`,`Long days`),`${String(t.sunrise).padStart(2,`0`)}:00 to ${t.sunset}:00${t.sun===1?``:` · ${iy(t.sun)}`}`),a(`wind`,`Wind`,t.wind/KS.wind,`var(--tide)`,i(t.wind/KS.wind,`Still`,`Strong`),`gusts ${iy(t.gust)}`),a(`soil`,`Soil`,n.soil/KS.soil,`var(--pine)`,i(n.soil/KS.soil,`Poor`,`Rich`),`${n.soil} ± ${n.soilSpread}`),J(`div`,{class:`cd-small cd-faint about`},[o,s,n.rock>=.1?`Rocky.`:``].filter(Boolean).join(` `))]}var JS=new Map;function YS(e){let t=JS.get(e.id);if(t)return t;let n=pp(e);t=J(`canvas`,{class:`map-preview`,width:n.width*5,height:n.height*5,"aria-label":`A preview of the valley`});let r=t.getContext(`2d`);if(r){for(let e=0;e<n.terrain.length;e++){let t=n.terrain[e],i=n.fertility[e]/100;r.fillStyle=t===dp.water?`#7fa9b8`:t===dp.tree?`#4f7c5e`:t===dp.rock?`#a8a294`:`rgb(${Math.round(226-70*i)}, ${Math.round(214-24*i)}, ${Math.round(170-44*i)})`,r.fillRect(e%n.width*5,Math.floor(e/n.width)*5,5,5)}r.fillStyle=`#1c2520`,r.fillRect(n.depot.x*5,n.depot.y*5,15,15)}return JS.set(e.id,t),t}function XS(e){return e.goals.map(e=>J(`div`,{class:`goal`},J(`span`,{class:`goal-disc`},X(jy(e),58)),J(`div`,null,J(`div`,{class:`goal-num`},e.kind===`deliver`?String(e.n):e.kind===`rate`?String(e.perMin):[String(e.min),J(`small`,null,`+`)]),J(`div`,{class:`cd-small`},e.kind===`deliver`?`${ay(e.item)} to the depot`:e.kind===`rate`?`${ay(e.item)} a minute`:`soil at the end`))))}function ZS(e,t){let n=J(`div`,{class:`ui cd-root menu`}),r=()=>{let e=cS(t.settings.get(),innerWidth,innerHeight);n.style.zoom=String(e),n.style.width=`${innerWidth/e}px`,n.style.height=`${innerHeight/e}px`};t.settings.listen(e=>{n.classList.toggle(`is-calm`,e.reduceMotion),r()}),addEventListener(`resize`,r);let i=t.saved,a=(i&&p_.find(e=>e.id===i.scenario.id))??p_.find(e=>!t.progress[e.id])??p_[0],o=J(`div`,{class:`path`}),s=J(`div`,{class:`cd-card chosen`}),c=J(`div`,{class:`replace`}),l=J(`div`,{class:`ui-sheets`}),u=()=>{l.classList.remove(`is-open`),l.replaceChildren()};function d(){let e=p_.map((e,t)=>250+t*207),n=p_.map((e,t)=>t%2?70:40);Xv(o,Y(`svg`,{class:`trail`,viewBox:`0 0 1920 340`,width:1920,height:340,preserveAspectRatio:`none`},Y(`path`,{d:`M 150 ${n[0]+30} ${e.map((e,t)=>`L ${e} ${n[t]+40}`).join(` `)} L 1790 ${n[7]+20}`})),...p_.map((r,o)=>{let s=t.progress[r.id],c=i?.scenario.id===r.id,l=r.id===a.id,u=s?1:c?GS(i):0,d=s?`var(--medal-${s.medal})`:`var(--pine)`;return J(`button`,{class:`st${l?` is-on`:``}`,style:`left: ${(e[o]/1920*100).toFixed(2)}%; top: ${n[o]-(l?26:0)}px`,onclick:()=>{a=r,p()}},J(`span`,{class:`disc`},wy({v:u,d:l?128:76,w:l?8:6,col:d},J(`div`,null,J(`div`,{class:l?`n big`:`n`},String(o+1)),l&&c&&!s?J(`div`,{class:`cd-small`},iy(u)):null))),J(`span`,{class:`name`},r.name),J(`span`,{class:`sub`},s?`${s.medal} · ${Q(s.time)} of ${Q(r.par)}`:c?`in progress · ${Q(i.time)}`:`par ${Q(r.par)}`))}))}function f(){let e=a,n=p_.indexOf(e),r=i?.scenario.id===e.id,o=t.progress[e.id];Xv(s,J(`div`,{class:`col name-col`},J(`div`,{class:`cd-label`},`Commission ${n+1} · seed ${e.seed} · ${e.width} × ${e.height}`),J(`h1`,{class:`cd-display`},e.name),J(`p`,{class:`blurb`},e.blurb),J(`span`,{class:`fill`}),J(`div`,{class:`row`},J(`span`,{class:`mchip`},X(`coin`,28),J(`b`,null,ty(e.credits)),J(`small`,null,`credits to start`)),J(`span`,{class:`cd-small`},`Your best: `,J(`b`,null,o?`${ky[o.medal]}, ${Q(o.time)}`:`not finished yet`)))),J(`div`,{class:`vsep`}),J(`div`,{class:`col`},J(`div`,{class:`cd-label`},`What they ask`),J(`div`,{class:`goals`},...XS(e)),J(`span`,{class:`fill`}),J(`div`,{class:`cd-label`,style:`margin-bottom: 12px`},`Medal times`),J(`div`,{class:`row`},J(`span`,{class:`mchip`},Ay(`gold`,30),J(`b`,null,Q(e.par)),J(`small`,null,`gold`)),J(`span`,{class:`mchip`},Ay(`silver`,30),J(`b`,null,Q(e.par*l_)),J(`small`,null,`silver`)),J(`span`,{class:`mchip`},Ay(`bronze`,30),J(`small`,null,`after`)))),J(`div`,{class:`vsep`}),J(`div`,{class:`col`},J(`div`,{class:`row-head`},J(`span`,{class:`cd-label`},`Conditions`),J(`span`,{class:`cd-small cd-faint`},J(`i`,{class:`norm-key`}),`a normal valley`)),J(`div`,{class:`conds`},...qS(e))),J(`div`,{class:`col act`},YS(e),J(`span`,{class:`fill`}),r?J(`button`,{class:`cd-btn is-primary is-lg`,onclick:t.resume},X(`play`,16,`inv`),`Continue`):J(`button`,{class:`cd-btn is-primary is-lg`,onclick:()=>t.start(e.id)},X(`play`,16,`inv`),o?`Play again`:`Begin`),r?J(`button`,{class:`link small`,onclick:()=>t.start(e.id)},`or start over`):null));let l=i&&i.scenario.id!==e.id&&i.completedAt===null;Xv(c,l?[X(`warn`,18),`Starting any other commission replaces ${i.scenario.name} in progress (${Q(i.time)} played).`]:[])}function p(){d(),f()}let m=J(`input`,{class:`seed cd-num`,type:`text`,value:String(Math.floor(Math.random()*1e5)),size:8,"aria-label":`Seed`,spellcheck:!1}),h=2,g=J(`div`,{class:`cd-seg wide`}),_=J(`div`,{class:`preview`}),v=()=>v_(ap(m.value),h);function y(){Xv(g,...[[1,`Easy`],[2,`Medium`],[3,`Hard`]].map(([e,t])=>J(`button`,{class:e===h?`is-on`:``,onclick:()=>{h=e,y()}},t)));let e=v();Xv(_,J(`div`,{class:`head`},J(`span`,{class:`rname`},e.name),J(`span`,{class:`cd-small`},`${e.width} × ${e.height} · par ${Q(e.par)} · ${ty(e.credits)} credits`)),J(`div`,{class:`chips`},...e.goals.map(e=>J(`span`,{class:`cd-chip`},X(jy(e),22),e.kind===`deliver`?`${e.n} ${ay(e.item)}`:e.kind===`rate`?`${e.perMin} ${ay(e.item)} / min`:`soil ${e.min}+`))),J(`div`,{class:`chips tags`},...e.tags.map(e=>J(`span`,{class:`tag cd-small`},e)),J(`span`,{class:`tag cd-small`},{river:`River`,ponds:`Ponds`,lake:`Lake`,none:`Dry`}[e.terrain.water])))}m.addEventListener(`input`,y),y(),p(),n.append(J(`div`,{class:`menu-bg`}),J(`div`,{class:`menu-page`},J(`div`,{class:`brand`},J(`div`,{class:`cd-label`},`A farming co-op · the valley`),J(`div`,{class:`title`},`Soil n Silo`)),i?J(`div`,{class:`cd-card is-ink continue`},wy({v:i.completedAt===null?GS(i):1,d:56,w:5,col:`var(--ochre)`},X(i.scenario.goals[0]?jy(i.scenario.goals[0]):`sapling`,26)),J(`div`,{class:`fill`},J(`div`,{class:`cd-label`},`Continue`),J(`div`,{class:`cname`},i.scenario.name),J(`div`,{class:`cd-small`},i.completedAt===null?`${Q(i.time)} played${i.scenario.goals[0]?` · ${My(i,0).short}`:``}`:`complete · free play`)),J(`button`,{class:`cd-btn is-icon`,"aria-label":`Continue`,title:`Continue`,onclick:t.resume},X(`play`,18))):null,J(`div`,{class:`top-buttons`},J(`button`,{class:`cd-btn`,onclick:()=>{l.classList.add(`is-open`),Xv(l,J(`div`,{class:`scrim`,onclick:u}),J(`div`,{class:`sheet-wrap`},jb({kind:`topic`,id:`start`},null,u)))}},X(`book`,22),`Guide`),J(`button`,{class:`cd-btn`,onclick:()=>{l.classList.add(`is-open`),Xv(l,J(`div`,{class:`scrim`,onclick:u}),J(`div`,{class:`sheet-wrap`},pS(t.settings,u)))}},X(`menu`,20),`Settings`)),J(`div`,{class:`cd-label path-label`},`${p_.length} commissions · down the valley`),o,s,c,J(`div`,{class:`cd-card random`},J(`div`,null,J(`div`,{class:`cd-label`},`Random commission`),J(`div`,{class:`seedrow`},J(`label`,{class:`cd-inset seedbox`},J(`span`,{class:`cd-small cd-faint`},`Seed`),m),J(`button`,{class:`cd-btn is-icon`,title:`A new seed`,"aria-label":`A new seed`,onclick:()=>{m.value=String(Math.floor(Math.random()*1e5)),y()}},X(`rotate`,20))),g),_,J(`div`,{class:`act`},J(`button`,{class:`cd-btn is-ghost`,onclick:()=>t.start(v().id)},X(`play`,14),`Start`))),J(`div`,{class:`cd-card sandbox`},J(`div`,null,J(`div`,{class:`cd-label`},`Sandbox`),J(`div`,{class:`rname`},`A big calm valley`),J(`div`,{class:`cd-small`},`${m_.blurb.replace(/^A big calm valley with u/,`U`)} ${m_.width} × ${m_.height}, gentle weather.`),J(`div`,{class:`chips`},J(`span`,{class:`cd-chip`},X(`coin`,22),`∞ credits`),J(`span`,{class:`cd-chip`,style:`padding-left: 12px`},`No goals`))),J(`div`,{class:`act`},J(`button`,{class:`cd-btn is-ghost`,onclick:()=>t.start(m_.id)},`Open`)))),l),e.append(n),addEventListener(`keydown`,e=>{e.key===`Escape`&&u()})}var QS=[`.side-card .side-body`,`.ui-sheets .sheet-wrap`,`.cd-sheet .sheet-body`,`.pause`,`.settings-panel .sp-body`,`.briefing .letter`,`.briefing .terms`,`.menu .menu-page`,`.results`,`.guide-index`,`.guide-page`],$S=new Set([`.ui-sheets .sheet-wrap`,`.pause`,`.menu .menu-page`,`.results`]),eC=48,tC=QS.join(`,`),nC=2,rC=900,iC=1400,aC=1500,oC=`a[href],button,input,select,textarea,[tabindex]`,sC=new Map,cC=e=>QS.find(t=>e.matches(t))??``,lC=e=>`${cC(e)}|${e.parentElement?.className??``}`;function uC(e){let t=cC(e),n=lC(e),r=performance.now()-(sC.get(n)??-1/0)<aC,i=0,a=0,o=()=>{e.classList.toggle(`can-up`,e.scrollTop>nC),e.classList.toggle(`can-down`,e.scrollTop+e.clientHeight<e.scrollHeight-nC)},s=()=>{o(),e.classList.add(`scrolling`),clearTimeout(i),i=window.setTimeout(()=>e.classList.remove(`scrolling`),rC)};e.classList.add(`sc`);let c=$S.has(t),l=t=>e.classList.toggle(`near`,t.clientX>=e.getBoundingClientRect().right-eC),u=()=>e.classList.remove(`near`);c&&(e.classList.add(`sc-wide`),e.addEventListener(`pointermove`,l,{passive:!0}),e.addEventListener(`pointerleave`,u));let d=!e.querySelector(oC)&&!e.hasAttribute(`tabindex`);d&&(e.tabIndex=0);let f=!1,p=()=>{f=!0},m=()=>queueMicrotask(()=>{e.isConnected&&(f=!1)});e.addEventListener(`focus`,p),e.addEventListener(`blur`,m),e.addEventListener(`scroll`,s,{passive:!0});let h=()=>{e.scrollHeight<=e.clientHeight+nC||(e.classList.add(`flash`),clearTimeout(a),a=window.setTimeout(()=>e.classList.remove(`flash`),iC))},g=!1,_=!1,v=new ResizeObserver(()=>{o();let t=e.clientHeight>0;g&&t&&!_&&h(),_=t});v.observe(e);let y=new MutationObserver(o);y.observe(e,{childList:!0,subtree:!0,characterData:!0});let b=requestAnimationFrame(()=>{o(),g=!0,_=e.clientHeight>0,r||h()});return{panel:n,cleanup:()=>{sC.set(n,performance.now()),cancelAnimationFrame(b),clearTimeout(i),clearTimeout(a),e.removeEventListener(`scroll`,s),e.removeEventListener(`focus`,p),e.removeEventListener(`blur`,m),e.removeEventListener(`pointermove`,l),e.removeEventListener(`pointerleave`,u),v.disconnect(),y.disconnect(),e.classList.remove(`sc`,`sc-wide`,`near`,`can-up`,`can-down`,`scrolling`,`flash`),d&&e.removeAttribute(`tabindex`)},focused:()=>f}}function dC(e=document.body){let t=new Map,n=(e,n)=>{if(!(e instanceof HTMLElement))return;let r=e.matches(tC)?[e]:[];for(let i of[...r,...e.querySelectorAll(tC)]){if(t.has(i))continue;let e=uC(i);t.set(i,e),n.has(e.panel)&&i.focus({preventScroll:!0})}},r=()=>{let e=new Set;for(let[n,r]of t)n.isConnected||(r.focused()&&e.add(r.panel),r.cleanup(),t.delete(n));return e},i=new MutationObserver(e=>{let t=r();for(let r of e)r.addedNodes.forEach(e=>n(e,t))});return i.observe(e,{childList:!0,subtree:!0}),n(e,new Set),()=>{i.disconnect();for(let e of t.values())e.cleanup();t.clear()}}var fC={silo:`silo`,garage:`garage`,sprinkler:`sprinkler`,coop:`coop_solar`,hive:`beehive`,composter:`composter`,mill:`mill_electric`,press:`oil_press`,spinner:`spinner`,loom:`loom`,bakery:`bakery`,cannery:`cannery`,solar:`solar_panel`,turbine:`wind_turbine`,battery:`battery`,digester:`digester`,pylon:`pylon`,sapling:`sapling`,depot:`depot`},pC=e=>`./models/${e}.glb`;async function mC(e){try{return await bf(pC(e))}catch{return null}}function hC(e,t=()=>!0,n,r=!!n){let i=new cd(r);e.updateMatrixWorld(!0);let a=e.matrixWorld.clone().invert(),o=new hi;return e.traverse(n=>{let r=n;if(!r.isMesh||!gC(r,e,t))return;let i=new qr(r.geometry,r.material);i.name=r.name,i.userData={source:r},i.matrixAutoUpdate=!1,i.matrix.multiplyMatrices(a,r.matrixWorld),o.add(i)}),o.updateMatrixWorld(!0),xf(o,i,i,e=>{let t=vf(e.userData.source)??{},r=n?.(e.userData.source);return r?{...t,motion:r}:t}),i}function gC(e,t,n){for(let r=e;r&&r!==t;r=r.parent)if(!n(r))return!1;return!0}var _C=e=>t=>t.name.toLowerCase().startsWith(e),vC=e=>t=>!e(t);function yC(e,t,n){let r=t.getObjectByName(`smoke_emitter`);if(!r)return;t.updateMatrixWorld(!0);let i=r.getWorldPosition(new V).applyMatrix4(t.matrixWorld.clone().invert()),a=new Ea(.16,1);for(let t=0;t<4;t++)e.add(a,null,[.82,.8,.86],3,!1,hf.smoke(i.toArray(),t/4,n+t*.17))}function bC(e,t){let n=hC(e,vC(_C(`running_`))).build(),r=hC(e,vC(_C(`idle_`)),yf,!0);return yC(r,e,t),{idle:n,running:r.build()}}var xC=e=>(e.computeBoundingBox(),e.boundingBox?e.boundingBox.max.y:1);async function SC(){let e=new Set([`wheat`,`tomato`,`beans`,`sunflower`,`flax`,`rock`,`truck`,`tree_oak`,`tree_pine`,`bush`]);for(let t of Object.values(fC))e.add(t);let t=new Map(await Promise.all([...e].map(async e=>[e,await mC(e)]))),n=[...t].filter(([,e])=>!e).map(([e])=>e);n.length&&console.info(`models drawn from stand-ins: ${n.join(`, `)}`);let r={};Hf.forEach((e,n)=>{let i=fC[e],a=i?t.get(i)??null:null,o=a?bC(a,n*.13):Qb(e);r[e]={...o,height:xC(o.idle)}});let i=t.get(`wind_turbine`),a=[.45,1,1.7].map(e=>i?hC(i,()=>!0,t=>{let n=yf(t);return n&&n.anim?{...n,anim:[...n.anim.slice(0,3),e]}:n},!0).build():Qb(`turbine`).running),o=t.get(`battery`),s=[0,1,2,3,4].map(e=>o?hC(o,t=>{let n=/^charge_(\d+)/.exec(t.name);return!n||Number(n[1])<e}).build():r.battery.idle),c={};for(let e of zf){let n=Bf[e].stages,r=t.get(e),i=[];if(r)for(let e=0;;e++){let t=r.getObjectByName(`stage_${e}`);if(!t)break;i.push(t)}c[e]=Array.from({length:n},(t,r)=>{if(i.length<2)return ex(e,r,n);let a=i[Math.round(r*(i.length-1)/(n-1))],o=new qt().setFromObject(a).max.y;return hC(a,void 0,()=>hf.sway(0,0,0,Math.max(.3,o))).build()})}let l=t.get(`rock`),u=[0,1,2].map(e=>{let t=l?.getObjectByName(`variant_${e}`);return t?hC(t).build():lx(e)}),d=[`tree_oak`,`tree_pine`,`bush`].map(e=>{let n=t.get(e);return n?hC(n).build():Qb(`sapling`).idle}),f=t.get(`truck`),p={};for(let e of Mf)p[e]=tx(e);return{buildings:r,turbine:a,battery:s,crops:c,items:p,rocks:u,trees:d,wires:[...rx,ix].map(ox),routes:ax.map(ox),soil:Array.from({length:6},(e,t)=>fx(t)),truck:f?hC(f).build():cx(),frames:{ok:[1,2,3].map(e=>nx(e,14221232)),bad:[1,2,3].map(e=>nx(e,16732224))},fill:sx(16052448)}}function CC(e){return[...Object.values(e.buildings).flatMap(e=>[e.idle,e.running]),...e.turbine,...e.battery,...e.wires,...e.routes,...Object.values(e.crops).flat(),...Object.values(e.items),...e.soil,...e.trees,...e.rocks,e.truck,...e.frames.ok,...e.frames.bad,e.fill]}var wC=16,TC=96,EC=32,DC=1.25,OC=gt.degToRad(30),kC=gt.degToRad(45),AC=14,jC=.3,MC=class{target;view4=0;pixelSize;zoom=EC;zoomGoal=EC;zoomAnchor=null;yaw=kC;turnFrom=kC;turnAt=-1/0;time=0;forward=new V;right=new V;projected=new V;raycaster=new Vo;ndc=new B;ground=new Yi(new V(0,1,0),0);hit=new V;renderer;canvas;map;changed;constructor(e,t,n,r,i,a){this.renderer=e,this.canvas=t,this.map=r,this.changed=a,this.target=new V(i.x,0,i.z),this.pixelSize=n.get().pixelSize,n.listen(e=>{e.pixelSize!==this.pixelSize&&(this.pixelSize=e.pixelSize,this.fit())}),addEventListener(`resize`,()=>this.fit()),this.fit()}cameraAxes(){this.forward.set(-Math.sin(this.yaw),0,-Math.cos(this.yaw)),this.right.set(-this.forward.z,0,this.forward.x)}turn(e){this.view4+=e,this.turnFrom=this.yaw,this.turnAt=this.time,this.changed()}turning(){let e=Math.min(1,(this.time-this.turnAt)/jC),t=this.turnFrom+(kC+this.view4*Math.PI/2-this.turnFrom)*(1-(1-e)**3);t!==this.yaw&&this.changed(),this.yaw=t}pan(e,t){this.cameraAxes();let n=1/this.zoom,r=this.target.clone();this.target.addScaledVector(this.right,-e*n).addScaledVector(this.forward,t*n/Math.sin(OC)),this.clampTarget(),this.zoomAnchor&&this.zoomAnchor.ground.add(this.target.clone().sub(r)),this.changed()}clampTarget(){this.target.x=gt.clamp(this.target.x,0,this.map.width),this.target.z=gt.clamp(this.target.z,0,this.map.height)}lookAt(e,t,n){this.target.set(e,0,t),this.clampTarget(),n&&(this.setZoom(n),this.zoom=this.zoomGoal),this.changed()}zoomStep(e,t){this.setZoom(this.zoomGoal*DC**e,t)}setZoom(e,t){if(e=gt.clamp(e,wC,TC),e!==this.zoomGoal){if(this.zoomGoal=e,t){let e=t.x-innerWidth/2,n=t.y-innerHeight/2,r=1/this.zoom;this.cameraAxes();let i=this.target.clone().addScaledVector(this.right,e*r).addScaledVector(this.forward,-n*r/Math.sin(OC));this.zoomAnchor={ground:i,dx:e,dy:n}}else this.zoomAnchor=null}}zooming(e){if(this.zoom===this.zoomGoal)return;let t=1-Math.exp(-e*AC);if(this.zoom=Math.exp(Math.log(this.zoom)+Math.log(this.zoomGoal/this.zoom)*t),Math.abs(Math.log(this.zoomGoal/this.zoom))<.004&&(this.zoom=this.zoomGoal),this.zoomAnchor){this.cameraAxes();let e=1/this.zoom;this.target.copy(this.zoomAnchor.ground).addScaledVector(this.right,-this.zoomAnchor.dx*e).addScaledVector(this.forward,this.zoomAnchor.dy*e/Math.sin(OC)),this.clampTarget()}this.zoom===this.zoomGoal&&(this.zoomAnchor=null),this.changed()}fit(){let{renderer:e,canvas:t,pixelSize:n}=this,r=Math.max(1,Math.ceil(innerWidth/n)),i=Math.max(1,Math.ceil(innerHeight/n));(e.width!==r||e.height!==i)&&e.resize(r,i);let a=r*n,o=i*n;t.style.width=`${a}px`,t.style.height=`${o}px`,t.style.left=`${Math.floor((innerWidth-a)/2)}px`,t.style.top=`${Math.floor((innerHeight-o)/2)}px`,this.changed()}update(e,t){this.time=e,this.turning(),this.zooming(t),this.renderer.placeCamera(this.target,this.yaw,OC,this.renderer.height*this.pixelSize/this.zoom)}toScreen(e,t,n){let r=this.canvas.getBoundingClientRect();return this.projected.set(e,t,n).project(this.renderer.camera),{sx:r.left+(this.projected.x+1)/2*r.width,sy:r.top+(1-this.projected.y)/2*r.height}}groundAt(e,t){let n=this.canvas.getBoundingClientRect();return this.ndc.set((e-n.left)/n.width*2-1,-((t-n.top)/n.height)*2+1),this.renderer.camera.updateMatrixWorld(),this.raycaster.setFromCamera(this.ndc,this.renderer.camera),this.raycaster.ray.intersectPlane(this.ground,this.hit)?this.hit.clone():null}tileAt(e,t){let n=this.groundAt(e,t);if(!n)return null;let r={x:Math.floor(n.x),y:Math.floor(n.z)};return r.x>=0&&r.y>=0&&r.x<this.map.width&&r.y<this.map.height?r:null}},NC=[1,3,5].flatMap(e=>[1,3,5].map(t=>[t/6,e/6])),PC=3,FC=class{el=document.createElement(`canvas`);ctx;view;rgb;width;corner=new V;drawn=!1;constructor(e,t,n=.06){this.view=e,this.width=n,this.rgb=[t>>16&255,t>>8&255,t&255],this.el.className=`tile-cursor`,e.after(this.el),this.ctx=yp(this.el.getContext(`2d`),`2d canvas context`)}draw(e,t,n,r){let i=this.el,a=this.ctx;(i.width!==n||i.height!==r)&&(i.width=n,i.height=r,this.drawn=!1);for(let e of[`left`,`top`,`width`,`height`])i.style[e]=this.view.style[e];if(this.drawn&&=(a.clearRect(0,0,n,r),!1),!e)return;t.updateMatrixWorld();let o=(e,i)=>(this.corner.set(e,.03,i).project(t),{x:(this.corner.x+1)/2*n,y:(1-this.corner.y)/2*r}),s=o(e.x,e.y),c=o(e.x+1,e.y),l=o(e.x,e.y+1),u=c.x-s.x,d=c.y-s.y,f=l.x-s.x,p=l.y-s.y,m=u*p-d*f;if(Math.abs(m)<1e-9)return;let h=[s.x,c.x,l.x,c.x+f],g=[s.y,c.y,l.y,c.y+p],_=Math.max(0,Math.floor(Math.min(...h))),v=Math.min(n,Math.ceil(Math.max(...h))),y=Math.max(0,Math.floor(Math.min(...g))),b=Math.min(r,Math.ceil(Math.max(...g)));if(v<=_||b<=y)return;let x=a.createImageData(v-_,b-y),[S,C,w]=this.rgb,T=this.width,E=(e,t)=>{let n=e-s.x,r=t-s.y,i=(n*p-r*f)/m,a=(u*r-d*n)/m;return i>=0&&i<1&&a>=0&&a<1&&Math.min(i,1-i,a,1-a)<T};for(let e=y;e<b;e++)for(let t=_;t<v;t++){if(NC.filter(([n,r])=>E(t+n,e+r)).length<PC)continue;let n=((e-y)*(v-_)+t-_)*4;x.data[n]=S,x.data[n+1]=C,x.data[n+2]=w,x.data[n+3]=255}a.putImageData(x,_,y),this.drawn=!0}},IC=120,LC=4,RC=10,zC=12,BC=[[11053152,11578982],[9610326,10005082],[8166988,8561744],[7116870,7512138],[6197314,6592070]],VC=[4880952,5407292,5933632,4485172],HC=4876852,UC=[10783842,10126428],WC=9074258,GC=9075290,KC=6969918,qC=9077880,JC=9210496,YC=9069632,XC={...ld.water,clarity:.8,roughness:.3,waveScale:.7},ZC=-.12,QC=.15,$C=.3,ew=new Da(1,1),tw=new Ea(1,0),nw=new Xr(1,1,1),rw=[[1,0],[-1,0],[0,1],[0,-1]],iw=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)},aw=.84,ow=e=>new U(e).multiplyScalar(aw).getHex(),sw=e=>({...e,shallow:ow(e.shallow),deep:ow(e.deep),foam:ow(e.foam)}),cw={river:XC,still:ld.water,outsideRiver:sw(XC),outsideStill:sw(ld.water)},lw=(e,t)=>{let n=e.clone();n.applyMatrix4(t);let r=n.getAttribute(`aColor`);return n.setAttribute(`aColor`,new wr(r.array.map(e=>e*aw),3)),n};function uw(e,t){let n=new Fr;return n.setAttribute(`position`,new Dr(e,3)),n.computeVertexNormals(),n.setAttribute(`aColor`,new Dr(t,3)),n.setAttribute(`aFlag`,new Dr(new Float32Array(e.length/3).fill(Zu.NORMAL),1)),n}function dw(e,t,n){let r=new cd,i=new cd(!0),a=new fd,{width:o,height:s}=e,c=t.margin,l=t.seed,u=(e,t)=>e>=0&&t>=0&&e<o&&t<s,d=(e,t)=>e>=-c&&t>=-c&&e<o+c&&t<s+c,f=(e,n)=>(n+c)*t.width+e+c,p=(n,r)=>u(n,r)?e.terrain[r*o+n]:t.terrain[f(n,r)],m=(e,t)=>Math.min(e+c,t+c,o+c-e,s+c-t),h=(e,t)=>d(e,t)&&p(e,t)===dp.water&&m(e+.5,t+.5)>12,g=(e,t)=>Math.hypot(Math.max(0,-e,e-o),Math.max(0,-t,t-s)),_=Kb(l,3)<.5?-1:1,v=e=>t.depot.x+1+Math.round(_*5*iw(s+6,s+26,e)),y=(e,t)=>t>=s&&Math.abs(e-v(t))<=1,b=new Float32Array(t.width*t.height).fill(1e9);for(let e=-c;e<s+c;e++)for(let t=-c;t<o+c;t++)(h(t,e)||y(t,e))&&(b[f(t,e)]=0);let x=(e,t,n,r,i)=>{d(e+n,t+r)&&(b[f(e,t)]=Math.min(b[f(e,t)],b[f(e+n,t+r)]+i))};for(let e=-c;e<s+c;e++)for(let t=-c;t<o+c;t++)x(t,e,-1,0,1),x(t,e,0,-1,1),x(t,e,-1,-1,1.41),x(t,e,1,-1,1.41);for(let e=s+c-1;e>=-c;e--)for(let t=o+c-1;t>=-c;t--)x(t,e,1,0,1),x(t,e,0,1,1),x(t,e,1,1,1.41),x(t,e,-1,1,1.41);let S=(e,n)=>d(e,n)&&!u(e,n)&&t.terrain[f(e,n)]===dp.tree&&!y(e,n)&&g(e+.5,n+.5)>zC,C=(e,t)=>{let n=1e9;for(let[r,i]of[[0,0],[-1,0],[0,-1],[-1,-1]])d(e+r,t+i)&&(n=Math.min(n,b[f(e+r,t+i)]));let r=iw(4,24,g(e,t))*(1.5+6*lp(e/13,t/13,l+71,3))*iw(1.5,8,n);return r+(LC-r)*iw(RC,0,m(e,t))},w=t.width+1,T=new Float32Array(w*(t.height+1));for(let e=-c;e<=s+c;e++)for(let t=-c;t<=o+c;t++)T[(e+c)*w+t+c]=t>=0&&e>=0&&t<=o&&e<=s?0:C(t,e);let E=(e,t)=>T[(t+c)*w+e+c],D=(e,t)=>{let n=Math.min(Math.max(e,-c),o+c-1e-6),r=Math.min(Math.max(t,-c),s+c-1e-6),i=Math.floor(n),a=Math.floor(r),l=n-i,u=r-a,d=E(i,a),f=E(i+1,a+1);return l>u?d+l*(E(i+1,a)-d)+u*(f-E(i+1,a)):d+u*(E(i,a+1)-d)+l*(f-E(i,a+1))},ee=[],O=[],k=(e,t,n)=>{let r=ed(n),i=[e,E(e,t),t],a=[e+1,E(e+1,t),t],o=[e+1,E(e+1,t+1),t+1],s=[e,E(e,t+1),t+1];for(let e of[i,s,o,i,o,a])ee.push(...e),O.push(...r)},A=(e,t)=>!u(e,t)&&(p(e,t)===dp.water||y(e,t))&&m(e+.5,t+.5)<18;for(let i=-c;i<s+c;i++)for(let a=-c;a<o+c;a++){let s=a+.5,c=i+.5,l=Kb(a,i),d=p(a,i);if((S(a,i)||A(a,i))&&!(a&1)&&!(i&1)){let e=1.1+.4*l,t=Kb(a+3,i)-.5,n=Kb(a,i+3)-.5;r.add(tw,od(a+1+t,D(a+1+t,i+1+n)+.5+e*.6,i+1+n,0,l*6,0,e,e*.85,e),ed(ow(VC[Math.floor(Kb(i,a+1)*4)])),Zu.NORMAL,!0)}if(h(a,i)){re(a,i),y(a,i)&&Gb(r,s,-.02,c,1,.08,1.1,ow(YC));continue}if(u(a,i)){let t=e.fertility[i*o+a];Gb(r,s,-.5,c,1,.5,1,BC[Math.min(4,Math.floor(t/20))][l<.5?0:1]);continue}let m=g(s,c),_=Math.min(4,Math.floor(t.fertility[f(a,i)]/20));if(S(a,i)||A(a,i)){k(a,i,ow(HC));continue}if(y(a,i)){k(a,i,ow(a===v(i)?WC:UC[l<.5?0:1]));continue}k(a,i,ow(BC[_][l<.5?0:1])),!(m>zC)&&(d===dp.tree?r.pushPrepared(lw(n.trees[l<.55?0:l<.85?1:2],od(s,D(s,c)-.02,c,0,l*Math.PI*2,0,.62+.25*l))):d===dp.rock&&r.pushPrepared(lw(n.rocks[Math.floor(l*3)%3],od(s,D(s,c),c,0,l*Math.PI*2,0))))}r.pushPrepared(uw(ee,O));let te=(e,t)=>LC+(Kb(e*.37,t*.71)-.5)*1.6*iw(0,8,-m(e,t)),j=(e,t,n)=>[...new Set([...Array.from({length:Math.floor((t-e)/4)+1},(t,n)=>e+4*n),...n,t])].sort((e,t)=>e-t),M=j(-c-IC,o+c+IC,[-c,o+c]),N=j(-c-IC,s+c+IC,[-c,s+c]),P=[],ne=[];for(let e=0;e+1<N.length;e++)for(let t=0;t+1<M.length;t++){let n=M[t],r=N[e],i=M[t+1],a=N[e+1];if(n>=-c&&i<=o+c&&r>=-c&&a<=s+c)continue;let l=ed(ow(ow(VC[Math.floor(Kb(n,r)*4)]))),u=[n,te(n,r),r],d=[i,te(i,r),r],f=[i,te(i,a),a],p=[n,te(n,a),a];for(let e of[u,p,f,u,f,d])P.push(...e),ne.push(...l)}r.pushPrepared(uw(P,ne));function re(e,n){let i=e+.5,o=n+.5,s=f(e,n),c=t.drop[s],l=t.flow[s*2],d=t.flow[s*2+1],p=l!==0||d!==0,m=u(e,n),g=ZC-QC*c,_=g-$C,v=m?e=>e:ow,b=m?cw.river:cw.outsideRiver;Gb(r,i,_-.2,o,1,.2,1,v(GC));let x=!1;for(let[s,l]of rw){if(!h(e+s,n+l)){Gb(r,i+s*.5,_-.2,o+l*.5,l?1:.02,.2-_,s?1:.02,v(KC));continue}let u=t.drop[f(e+s,n+l)];if(u<=c)continue;x=!0;let d=ZC-QC*u,p=i+s*.5,m=o+l*.5;Gb(r,p-s*.07,d-$C-.2,m-l*.07,l?1:.14,g-.03-(d-$C-.2),s?1:.14,v(qC)),a.add(ew,od(p+s*.02,(g+d)/2,m+l*.02,0,Math.atan2(s,l),0,1,g-d,1),b)}if(a.add(ew,od(i,g,o,-Math.PI/2),p?b:m?cw.still:cw.outsideStill,[l,d]),p&&!x&&!y(e,n)&&Kb(e*1.3,n*2.1)<.07){let t=Kb(n,e),a=(t-.5)*.4,s=(Kb(e+9,n)-.5)*.4;r.add(tw,od(i+a,g-.04,o+s,t,t*5,0,.26,.17,.22),ed(v(JC)),Zu.NORMAL,!0)}}for(let e=0,t=0;e<160&&t<4e3;t++){let n=Math.floor(-10+Kb(t,7)*(o+20)),r=Math.floor(-10+Kb(t,9)*(s+20));if(u(n,r)||!d(n,r)||p(n,r)!==dp.grass||y(n,r))continue;let a=n+Kb(n,t),c=r+Kb(t,r),l=D(a,c);i.add(nw,od(a,l+.13,c,0,0,0,.04,.26,.04),ed(ow(4880938)),Zu.NORMAL,!1,hf.sway(a,c,0,.3)),i.add(nw,od(a,l+.29,c,0,0,0,.11,.08,.11),ed(ow([14703226,15781968,10514656,16184042][e%4])),Zu.NORMAL,!1,hf.sway(a,c,0,.3)),e++}let ie=r.build(),ae=i.build();return{scene:{staticGeometry:ie,dynamicGeometry:ae,fluids:a.build(),shadow:{center:new V(o/2,0,s/2),radius:Math.max(o,s)*.62+8}},geometries:[ie,ae]}}var fw={0:Math.PI,1:Math.PI/2,2:0,3:-Math.PI/2},pw=new V,mw=new An,hw=[11546656,13660192,14200864,10010672,5283888,2128432].map(e=>new U(e)),gw=new U(14209200),_w=new U(16732224),vw=new U(6334696),yw=new U(15765552),bw=new U(8314976),xw=.55,Sw=.8,Cw=class{targets=new Map;shown=new Map;parts=new Map;linksKey=``;linked=new Set;tinted=[];trucks=new Map;pools=new Map;terrain=[];terrainTiles=new Map;terrainKey=``;overlayObjs=[];overlayKey=``;r;m;constructor(e,t){this.r=e,this.m=t}buildingOf(e){return e?this.targets.get(e)??null:null}terrainOf(e){return e?this.terrainTiles.get(e)??null:null}objectsOf(e){let t=[],n=this.trucks.get(e),r=this.shown.get(e)??(n?{obj:n}:void 0);r&&t.push(r.obj);for(let n of this.parts.get(e)??[])t.push(n.obj);return t}add(e,t){let n=this.r.addObject(e);return t!==null&&this.targets.set(n,t),n}drop(e){this.targets.delete(e),e.remove()}show(e,t,n,r,i){if(e&&e.key===t)return e;e&&this.drop(e.obj);let a=this.add(n(),r);return i(a),{obj:a,key:t}}sync(e){this.syncTerrain(e);let t=new Set,n=dv(e.scenario,e.time);for(let r of e.buildings){t.add(r.id);let i=Yp(r),a=r.x+i/2,o=r.y+i/2;if(r.type===`field`){this.syncField(e,r);continue}let s=Tw(r),c=`${r.type} ${r.x} ${r.y} ${r.rot} ${s}`,l=()=>this.m.buildings[r.type][s?`running`:`idle`];if(r.type===`turbine`){let e=n<.35?0:n<.7?1:2;c+=` ${e}`,l=()=>this.m.turbine[e]}if(r.type===`battery`){let e=r.charge/K.battery.capacity,t=e<.02?0:Math.min(4,Math.ceil(e*4-.02));c+=` ${t}`,l=()=>this.m.battery[t]}this.shown.set(r.id,this.show(this.shown.get(r.id),c,l,r.id,e=>e.setTransform(pw.set(a,0,o),mw.set(0,fw[r.rot],0))))}for(let[e,n]of this.shown)t.has(e)||(this.drop(n.obj),this.shown.delete(e));for(let[e,n]of this.parts)if(!t.has(e)){for(let e of n)this.drop(e.obj);this.parts.delete(e)}this.syncTrucks(e)}syncField(e,t){let n=this.parts.get(t.id)??[],r=Bf[t.crop],i=t.stored>=r.yield?r.stages-1:Math.min(r.stages-1,Math.floor(t.growth*r.stages)),a=0;for(let r=t.y;r<t.y+3;r++)for(let o=t.x;o<t.x+3;o++){let s=dx(e.map.fertility[r*e.map.width+o]);n[a]=this.show(n[a],`soil ${o} ${r} ${s}`,()=>this.m.soil[s],t.id,e=>e.setTransform(pw.set(o+.5,0,r+.5))),a++;let c=Math.floor(Kb(o,r)*4)*Math.PI/2;n[a]=this.show(n[a],`crop ${o} ${r} ${t.crop} ${i}`,()=>this.m.crops[t.crop][i],t.id,e=>e.setTransform(pw.set(o+.5,.03,r+.5),mw.set(0,c,0))),a++}this.parts.set(t.id,n)}markerSpots(e){let t=[];for(let n of e.buildings){if(!Dw(n))continue;let e=Yp(n),r=this.m.buildings[n.type].height;t.push({id:n.id,status:n.status,x:n.x+e/2,y:(n.type===`field`?.9:r)+.35,z:n.y+e/2})}return t}syncTrucks(e){for(let e of this.pools.values())e.used=0;let t=new Map,n=new Map;for(let t of e.trucks)if(t.phase===`queue`&&t.target!==null){let e=n.get(t.target);e?e.push(t):n.set(t.target,[t])}for(let e of n.values())e.sort((e,t)=>e.arrived-t.arrived||e.id-t.id).forEach((e,n)=>t.set(e,n+1));let r=new Set;for(let n of e.trucks){r.add(n.id);let e=this.trucks.get(n.id);e||(e=this.add(this.m.truck,n.id),this.trucks.set(n.id,e));let i=(t.get(n)??0)*Sw,a=n.x-Math.sin(n.heading)*i,o=n.y-Math.cos(n.heading)*i;e.setTransform(pw.set(a,0,o),mw.set(0,n.heading,0)),n.cargo.forEach((e,t)=>{let[r,i]=Jb.slots[t%Jb.slots.length],s=Math.cos(n.heading),c=Math.sin(n.heading);this.putGood(e,a+r*s+i*c,Jb.y,o-r*c+i*s,n.heading,Jb.scale,n.id)})}for(let[e,t]of this.trucks)r.has(e)||(this.drop(t),this.trucks.delete(e));this.syncHandoffs(e);for(let e of this.pools.values())for(let t=e.used;t<e.objs.length;t++)e.objs[t].visible=!1}syncHandoffs(e){for(let t of Lh(e)){let n=am(e,t.from),r=am(e,t.to);if(!n||!r)continue;let i=Math.min(1,Math.max(0,(e.time-t.time)/Ih)),a=ww(n.x,Yp(n),r.x,Yp(r)),o=ww(n.y,Yp(n),r.y,Yp(r)),s=a.at+a.dir*(i-.5),c=o.at+o.dir*(i-.5);this.putGood(t.item,s,.35+Math.sin(Math.PI*i)*.5,c,0,.6,null)}}putGood(e,t,n,r,i,a,o){let s=this.pools.get(e);s||(s={objs:[],used:0},this.pools.set(e,s));let c=s.objs[s.used];c||(c=this.add(this.m.items[e],null),c.castShadow=!1,s.objs.push(c)),s.used++,o===null?this.targets.delete(c):this.targets.set(c,o),c.visible=!0,c.setTransform(pw.set(t,n,r),mw.set(0,i,0),a)}links(e){let t=e.join(` `);if(t!==this.linksKey){this.linksKey=t,this.linked.clear();for(let t of e)this.linked.add(t)}let n=[];for(let e of this.linked)n.push(...this.objectsOf(e));for(let e of this.tinted)n.includes(e)||(e.tint=null);for(let e of n)e.tint!==bw&&(e.tint=bw,e.tintStrength=xw);this.tinted=n}syncTerrain(e){let t=String(Qp(e));if(t===this.terrainKey)return;this.terrainKey=t;let{width:n}=e.map;e.map.terrain.forEach((e,t)=>{let r=t%n,i=Math.floor(t/n),a=Kb(r,i),o=e===dp.tree?`tree${Math.floor(a*3)}`:e===dp.rock?`rock${Math.floor(a*3)}`:null,s=this.terrain[t];if(s&&s.key===o||(s&&(this.terrainTiles.delete(s.obj),this.drop(s.obj),this.terrain[t]=null),!o))return;let c=e===dp.tree?this.m.trees[a<.55?0:a<.85?1:2]:this.m.rocks[Math.floor(a*3)%3],l=this.add(c,null);l.setTransform(pw.set(r+.5,0,i+.5),mw.set(0,a*Math.PI*2,0),e===dp.tree?.62+.25*a:1),this.terrainTiles.set(l,{x:r,y:i}),this.terrain[t]={obj:l,key:o}})}tile(e){let t=this.r.addObject(this.m.fill);return t.tint=e,t.tintStrength=1,t.castShadow=!1,t}overlay(e,t){t===`power`&&(t=`none`);let n=t===`none`?`none`:`${t} ${t===`fertility`?e.map.fertility.map(e=>Math.floor(e/17)).join(``):``} ${e.buildings.length} ${$h(e).layout} ${Qp(e)}${t===`roads`?` ${e.buildings.filter(t=>Ag(e,t)).map(e=>e.id).join(`,`)}`:``}`;if(n===this.overlayKey)return;this.overlayKey=n;for(let e of this.overlayObjs)e.remove();if(this.overlayObjs=[],t===`none`)return;let{width:r,height:i}=e.map,a=new Set,o=(e,t,n,o)=>{for(let s=t-o;s<t+n+o;s++)for(let t=e-o;t<e+n+o;t++)t>=0&&s>=0&&t<r&&s<i&&a.add(s*r+t)};if(t===`fertility`){for(let t=0;t<r*i;t++){if(e.map.terrain[t]!==dp.grass)continue;let n=this.tile(hw[Math.min(5,Math.floor(e.map.fertility[t]/17))]);n.setTransform(pw.set(t%r+.5,.02,Math.floor(t/r)+.5)),this.overlayObjs.push(n)}return}if(t===`roads`){for(let t=0;t<r*i;t++){let n=t%r,i=Math.floor(t/r);if(!hm(e,n,i))continue;let a=this.tile(gw);a.opacity=.4,a.setTransform(pw.set(n+.5,.02,i+.5)),this.overlayObjs.push(a)}for(let t of e.buildings)if(Ag(e,t))for(let e=t.y;e<t.y+Yp(t);e++)for(let n=t.x;n<t.x+Yp(t);n++){let t=this.tile(_w);t.setTransform(pw.set(n+.5,.05,e+.5)),this.overlayObjs.push(t)}return}for(let n of e.buildings)t===`water`&&n.type===`sprinkler`&&o(n.x-1,n.y-1,3,K.sprinklerReach-1),t===`bees`&&n.type===`hive`&&o(n.x,n.y,1,Qf.reach);let s=t===`water`?vw:yw;for(let e of a){let t=this.tile(s);t.setTransform(pw.set(e%r+.5,.02,Math.floor(e/r)+.5)),this.overlayObjs.push(t)}}};function ww(e,t,n,r){return e+t<=n?{at:n,dir:1}:n+r<=e?{at:e,dir:-1}:{at:(Math.max(e,n)+Math.min(e+t,n+r))/2,dir:0}}function Tw(e){return Wp(e)?e.progress!==null:e.status===`ok`}var Ew=new Set([`depot`,`sapling`]),Dw=e=>!Ew.has(e.type)&&e.status!==`ok`&&e.status!==`idle`,Ow=6,kw=30,Aw=80,jw=350,Mw=2*K.pylon.reach+1,Nw=e=>!!G[e].grid||!!G[e].power,Pw=yp(document.querySelector(`#view`),`#view canvas`),Fw=yp(document.querySelector(`#loading`),`#loading`),Iw=A_(location.pathname),Lw=`${Iw}:progress`,Rw=new sS(`${Iw}:settings`);Zy(Rw);var zw=M_(localStorage.getItem(Iw)),Bw=zw.ok?zw.value:null,Vw=new URLSearchParams(location.search),Hw=Vw.get(`play`),Uw=Hw?y_(Hw):null,Ww=!1;function Gw(e){let t=y_(e);t&&(Ww=!0,localStorage.setItem(Iw,j_(Gp(t))),location.href=location.pathname)}Hw&&Uw?Gw(Hw):!Bw||Vw.has(`menu`)?(Fw.remove(),ZS(document.body,{saved:Bw,settings:Rw,progress:av(localStorage.getItem(Lw)),resume:()=>{location.href=location.pathname},start:Gw})):await Kw(Bw),dC();async function Kw(e){let t=e,n=t.map,r=await SC(),i=dw(n,hp(t.scenario,56),r);wf([...i.geometries,...CC(r)],96);let a=new pf(Pw,i.scene,{shadowMapSize:2048,warmHighlight:!0}),o=new Cw(a,r),s=new Ax(a,r),c=new zx(a,r),l=new FC(Pw,16773312),u=null;Fw.remove();let d=2,f=new MC(a,Pw,Rw,n,{x:n.depot.x+1.5,z:n.depot.y-4},()=>{d=2}),p=1,m=!1,h=`none`,g={kind:`select`},_=null,v=null,y=()=>{Ww||localStorage.setItem(Iw,j_(t))};addEventListener(`pagehide`,y),document.addEventListener(`visibilitychange`,()=>{document.hidden&&y()});let b=new WS(document.body,{state:()=>t,tool:()=>g,setTool:e=>x(e),choose:e=>S(e),speed:()=>m?0:p,setSpeed:e=>{e===0?m=!m:(p=e,m=!1)},resume:()=>{m=!1},overlay:()=>h,setOverlay:e=>{h=h===e?`none`:e},selected:()=>_,select:e=>{_=e},changed:()=>{d=2},turn:e=>f.turn(e),zoom:e=>f.zoomStep(e),settings:Rw,menu:()=>{y(),location.href=`${location.pathname}?menu`},restart:()=>Gw(t.scenario.id),start:e=>{y(),Gw(e)},previewRoute:e=>{v=e},focus:e=>{let n=am(t,e);if(!n)return;g.kind!==`select`&&x({kind:`select`}),_=e;let r=Yp(n);f.lookAt(n.x+r/2,n.y+r/2),b.picked(e)}});t.time===0&&b.showIntro();function x(e){if(e.kind===`build`){let n=Rg(t,e.type);e={...e,crop:e.crop??n.crop,recipe:e.recipe??n.recipe}}g=e,(e.kind===`build`||e.kind===`remove`)&&(_=null),j(),d=2}function S(e){g.kind===`build`&&(zg(t,g.type,e),g={...g,...Rg(t,g.type)},d=2)}let C=null,w=null,T=[];function E(){if(!F.pointer){C=null,w=null;return}let e=a.pick(F.pointer.x,F.pointer.y);C=o.terrainOf(e?.object??null)??f.tileAt(F.pointer.x,F.pointer.y),w=o.buildingOf(e?.object??null),w===null&&C&&(w=im(t,C.x,C.y)?.id??null)}function D(e){let t=e.flatMap(e=>o.objectsOf(e)).slice(0,4);for(let e of T)t.includes(e)||(e.highlight=!1);for(let e of t)e.highlight=!0;T=t}let ee=new Map,O=new Map,k=new U(9502608),A=new U(16732224);function te(e,t,n,r,i,o=0,s){let c=ee.get(e)??[];ee.set(e,c);let l=O.get(e)??0;O.set(e,l+1);let u=c[l];u||(u=a.addObject(t),u.castShadow=!1,c.push(u)),u.visible=!0,s!==void 0&&(u.opacity=.6,u.tint=s?k:A,u.tintStrength=.45),u.setTransform(new V(n,r,i),new An(0,o,0))}function j(){for(let e of ee.values())for(let t of e)t.visible=!1;O=new Map,oe=[]}let M=[Math.PI,Math.PI/2,0,-Math.PI/2],N=(e,t)=>({x:e.x-Math.floor((t-1)/2),y:e.y-Math.floor((t-1)/2)});function P(e,t,n,r){let i=G[e].size,a=N(t,i),o=N(n,i),s=e===`pylon`?Mw:i,c=Math.abs(o.x-a.x)>=Math.abs(o.y-a.y),l=Math.floor(Math.abs(c?o.x-a.x:o.y-a.y)/s),u=c?Math.sign(o.x-a.x)*s:0,d=c?0:Math.sign(o.y-a.y)*s;return Array.from({length:l+1},(e,t)=>({x:a.x+u*t,y:a.y+d*t,rot:r}))}function ne(){if(j(),u=null,ae=[],C||F.press){if(g.kind===`build`){let e=g.type,n=G[e].size,i=F.press?.mode===`paint`&&F.press.from&&F.press.to?P(e,F.press.from,F.press.to,g.rot):C?[{...N(C,n),rot:g.rot}]:[],a=t.credits;if(i.length===1&&Ig(t,e,i[0].x,i[0].y).ok){let n=Ph(t,e,i[0].x,i[0].y,g);ae=[...new Set([...n.from,...n.to].map(e=>e.b.id))]}for(let o of i){let i=Ig(t,e,o.x,o.y).ok&&a>=Pg(t,e);i&&(a-=Pg(t,e)),e===`pylon`&&oe.push({x:o.x,y:o.y,ok:i});let s=o.x+n/2,c=o.y+n/2;if(te(`frame ${i} ${n}`,(i?r.frames.ok:r.frames.bad)[n-1],s,.03,c),te(`b ${e}`,r.buildings[e].idle,s,.04,c,M[o.rot],i),e===`field`&&g.crop){let e=r.crops[g.crop],t=e[Math.min(2,e.length-1)];for(let e=o.y;e<o.y+n;e++)for(let r=o.x;r<o.x+n;r++)te(`crop ${g.crop}`,t,r+.5,.06,e+.5,0,i)}}e===`silo`?ie(`roads`):e===`sprinkler`?ie(`water`):e===`hive`?ie(`bees`):Nw(e)&&ie(`power`)}else if(g.kind===`remove`&&F.press?.mode===`paint`&&F.press.from&&F.press.to){let e=Math.min(F.press.from.x,F.press.to.x),t=Math.max(F.press.from.x,F.press.to.x),n=Math.min(F.press.from.y,F.press.to.y),i=Math.max(F.press.from.y,F.press.to.y);for(let a=n;a<=i;a++)for(let n=e;n<=t;n++)te(`frame false 1`,r.frames.bad[0],n+.5,.03,a+.5)}else C&&(u=C)}}let re=`none`,ie=e=>{re=e},ae=[],oe=[];function se(e,n){F.pointer={x:e,y:n},E();let r=C;switch(g.kind){case`select`:_=w,b.picked(_);return;case`route`:{let e=om(t,g.route),n=w===null?null:am(t,w);if(!e){x({kind:`select`});return}if(!n)return;let r=i_(t,e,n),i=Ng(r);i&&b.toast(i,r.ok),b.refresh();return}case`build`:{if(!r)return;let e=G[g.type].size,n=N(r,e),i=Hg(t,g.type,n.x,n.y,g.rot,g),a=Ng(i);a&&b.toast(i.ok&&Pg(t,g.type)?`${a.replace(/\.$/,``)} · −${Pg(t,g.type)} credits`:a,i.ok,i.ok?g.type:void 0);return}case`remove`:{let e=w===null?null:am(t,w),n=e?Ug(t,e):r?Wg(t,r.x,r.y):null;if(!n)return;let i=Ng(n);i&&b.toast(i,n.ok),_!==null&&!am(t,_)&&!sm(t,_)&&(_=null);return}}}function ce(e,n){if(g.kind===`build`){let r=0,i=``;for(let a of P(g.type,e,n,g.rot)){let e=Hg(t,g.type,a.x,a.y,a.rot,g);e.ok?r++:e.error&&(i=e.error)}let a=Vg(g);r?b.toast(`Built ${r} × ${G[g.type].name.toLowerCase()}${a?` (${a})`:``}`,!0,g.type):i&&b.toast(i,!1)}else if(g.kind===`remove`){let r=Math.min(e.x,n.x),i=Math.max(e.x,n.x),a=Math.min(e.y,n.y),o=Math.max(e.y,n.y),s=0,c=new Set;for(let e=a;e<=o;e++)for(let n=r;n<=i;n++){let r=im(t,n,e);if(r){if(c.has(r.id)||r.type===`depot`)continue;c.add(r.id)}Wg(t,n,e).ok&&s++}s&&b.toast(`Removed ${s} thing${s>1?`s`:``}`,!0,`trash`),_!==null&&!am(t,_)&&!sm(t,_)&&(_=null)}}let F=new qv(Pw,{tileAt:(e,t)=>f.tileAt(e,t),paints:()=>g.kind===`build`||g.kind===`remove`,pan:(e,t)=>f.pan(e,t),zoom:(e,t)=>f.zoomStep(e,t),repick:()=>{d=2},click:se,secondary:()=>{g.kind===`select`?_=null:x({kind:`select`}),b.refresh()},drag:ce,key:le});function le(e){let{pointer:t}=F;if(e.code===`Escape`){if(b.closeIf(`pause`)){m=!1;return}if(b.closeTop())return;if(g.kind!==`select`){x({kind:`select`}),b.refresh();return}if(_!==null){_=null,b.refresh();return}b.openPause();return}if(e.repeat||e.code===`Space`&&e.target instanceof HTMLElement&&e.target!==document.body&&e.target.matches(`:focus-visible`))return;let n=$y(e.code);if(n===`pause`){e.preventDefault(),b.closeIf(`pause`)?m=!1:b.modal||(m=!m);return}if(n===`guide`&&b.closeIf(`guide`)){b.refresh();return}if(!b.modal){switch(n&&(e.code===`Tab`||e.code===`Space`)&&e.preventDefault(),n){case`speed1`:p=1,m=!1;break;case`speed2`:p=2,m=!1;break;case`speed3`:p=4,m=!1;break;case`turnLeft`:f.turn(-1);break;case`turnRight`:f.turn(1);break;case`zoomIn`:f.zoomStep(e.shiftKey&&e.code.startsWith(`Key`)?-1:1,t??void 0);break;case`zoomOut`:f.zoomStep(-1,t??void 0);break;case`ledger`:b.toggleSheet(`ledger`);break;case`power`:b.toggleSheet(`power`);break;case`routes`:b.toggleRoutes();break;case`guide`:b.openGuide(),b.refresh();return;case`overlay`:{let e=[`none`,`fertility`,`water`,`power`,`roads`,`bees`];h=e[(e.indexOf(h)+1)%e.length];break}case`choice`:g.kind===`build`&&S(Bg(g.type,g,e.shiftKey?-1:1));break;case`remove`:x(g.kind===`remove`?{kind:`select`}:{kind:`remove`});break;case`rotate`:g.kind===`build`&&(g={...g,rot:(g.rot+(e.shiftKey?3:1))%4},d=2);break;default:if(n?.startsWith(`build:`)){let e=n.slice(6);x(g.kind===`build`&&g.type===e?{kind:`select`}:{kind:`build`,type:e,rot:g.kind===`build`?g.rot:1})}}b.refresh()}}function ue(){let e=w===null?null:am(t,w),r=w===null?null:sm(t,w);if(g.kind===`build`)return null;if(r){let e=mg(t,r);return{title:e?`Truck on ${e.name}`:`Truck`,icon:`truck`,text:bv(t,r)}}if(g.kind===`route`){let n=om(t,g.route);return e&&n?{title:G[e.type].name,icon:e.type,text:dg(e)?`Click to add it as stop ${n.stops.length+1} of ${n.name}.`:`Trucks don't stop here.`}:n?{title:`Editing ${n.name}`,icon:`route`,text:`Click buildings to add stops. Esc when done.`}:null}if(e){let n=g.kind===`remove`,r=Dy(e,e.status,e.need),i=xv(t,e);return{title:G[e.type].name,icon:e.type,status:{status:e.status,label:r},text:n?e.type===`depot`?`The depot stays.`:`Click to remove it (refund ${Pg(t,e.type)}).`:[i===r?``:i,e.type===`field`?`soil ${Math.round(uh(t,e))}`:``].filter(Boolean).join(` · `)||void 0}}if(!C)return null;let i=cm(t,C.x,C.y),a=e=>`${Fg(t,e)} credits to clear${tb(`remove`).length?` (${tb(`remove`).join(` or `)})`:``}.`;return i===dp.water?{title:`Water`,icon:`water`,text:`Pylons can stand in it; trucks drive round it.`}:i===dp.tree?{title:`A tree`,icon:`sapling`,text:`Shelters wind turbines nearby; counts towards soil health. ${a(`tree`)}`}:i===dp.rock?{title:`Rock`,text:a(`rock`)}:g.kind===`remove`?null:{title:`Grass`,icon:`soil`,text:`Soil fertility ${t.map.fertility[C.y*n.width+C.x]}.`}}function de(e,n){let r=e=>({routes:e?[e]:[],numbers:!0}),i=om(t,v);if(i)return r(i);if(g.kind===`route`)return r(om(t,g.route));let a=e===null?null:sm(t,e),o=e===null?null:am(t,e);if(a)return r(mg(t,a));let s=[];return o?.type===`garage`?s=t.routes.filter(e=>t.trucks.some(t=>t.garage===o.id&&t.route===e.id)):o&&(s=hg(t,o)),n&&!s.length&&(s=t.routes),{routes:s,numbers:s.length===1}}function fe(e){if(g.kind===`build`)return ae;let n=e===null?null:sm(t,e),r=e===null?null:am(t,e);if(n)return[...new Set(mg(t,n)?.stops.map(e=>e.building)??[])];if(r?.type===`garage`)return t.trucks.filter(e=>e.garage===r.id).map(e=>e.id);if(r){let e=Nh(t,r);return[...new Set([...e.from,...e.to].map(e=>e.b.id))]}return[]}function pe(){if(g.kind!==`build`||!C||b.modal)return null;let e=g.type,t=G[e].size,n=N(C,t),i=F.press?.mode===`paint`&&F.press.from&&F.press.to?P(e,F.press.from,F.press.to,g.rot).length:1;return{type:e,x:n.x,y:n.y,count:i,crop:g.crop,recipe:g.recipe,...f.toScreen(n.x+t/2,r.buildings[e].height+.3,n.y+t/2)}}let me=performance.now(),I=0,he=0,ge=NaN,_e=0,L=t.completedAt!==null;function ve(e){b.perf.frame(e);let n=Math.min((e-me)/1e3,.1);if(me=e,I+=n,he++,!m&&!b.modal&&Dv(t,n*p,Aw),!L&&t.completedAt!==null){L=!0;let e=O_(t.scenario.par,t.completedAt);localStorage.setItem(Lw,JSON.stringify(sv(av(localStorage.getItem(Lw)),t.scenario.id,e,t.completedAt))),y(),b.showComplete(e)}_e+=n,_e>kw&&(_e=0,y()),b.modal&&F.keys.clear();let r=+!!eb(`panRight`,F.keys)-!!eb(`panLeft`,F.keys),i=+!!eb(`panDown`,F.keys)-!!eb(`panUp`,F.keys);(r||i)&&f.pan(-r*n*600,-i*n*600);let x=cv(t.time);Math.abs(x-ge)<=.02||(a.setLook(jf(x)),ge=x),o.sync(t),re=`none`,F.pointer&&he%Ow===0&&(d=Math.max(d,1)),d>0&&(d--,E()),ne(),re===`none`&&g.kind===`route`&&(re=`roads`);let S=h===`none`?re:h;o.overlay(t,S);let C=_??(g.kind===`select`?w:null),T=de(C,S===`roads`);o.links(fe(C)),c.sync(t,T.routes,T.numbers);let ee=T.numbers&&(g.kind===`route`||v!==null)?T.routes[0]:null;b.world.setTruckTags(ee?t.trucks.filter(e=>e.route===ee.id).map(e=>{let n=e.target===null?null:am(t,e.target),r=e.phase===`drive`&&n?`to the ${G[n.type].name.toLowerCase()}`:e.phase===`dock`||e.phase===`queue`?`at the ${n?G[n.type].name.toLowerCase():`stop`}`:e.phase===`charge`||e.phase===`parked`?`charging`:`stuck`;return{id:e.id,name:Ux(t,e),what:`${r}${e.cargo.length?` · ${yv(e.cargo)}`:``}`,...f.toScreen(e.x,.9,e.y)}}):[]),b.world.setStopLabels(c.labels().map(e=>({...e,...f.toScreen(e.x,e.y,e.z)})));let O=g.kind===`select`&&w!==null?am(t,w):null;s.sync(t,{all:S===`power`||g.kind===`build`&&Nw(g.type),tiles:S===`power`,focus:_??(O&&G[O.type].grid?O.id:null),ghosts:oe}),b.world.setNetLabels(s.labels().map(e=>({...e,...f.toScreen(e.x,e.y,e.z)}))),b.world.setMarkers(o.markerSpots(t).map(e=>({id:e.id,status:e.status,...f.toScreen(e.x,e.y,e.z)})));let k=[];_!==null&&k.push(_),w!==null&&w!==_&&(g.kind===`select`||g.kind===`remove`)&&k.push(w),D(k);let A=!!F.pointer&&!F.press&&(performance.now()-F.movedAt>jw||g.kind===`route`);b.world.setHover(A?ue():null,F.pointer),b.world.setPlacement(t,pe()),b.update(),f.update(I,n),a.renderGeometry(I),a.renderStyle(I),l.draw(u,a.camera,a.width,a.height),requestAnimationFrame(ve)}requestAnimationFrame(ve),Object.assign(window,{game:{get state(){return t},set state(e){t=e},renderer:a,view:o,hud:b,sizeOf:Yp,advance:e=>Dv(t,e),look:(e,t,n)=>f.lookAt(e,t,n)}})}